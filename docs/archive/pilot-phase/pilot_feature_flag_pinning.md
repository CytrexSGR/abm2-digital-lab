# Feature-Flag und Version-Pinning für die Formula Registry (Design)

Ziel: Die Registry kontrolliert aktivieren/deaktivieren und sicherstellen, dass jede Simulation mit fixierten Formelversionen läuft (Reproduzierbarkeit, Rollback-fähig).

## Übersicht
- Feature-Flag schaltet Registry global an/aus.
- Version-Pinning fixiert je Formel die verwendete Version pro Run.
- Pins werden im Run-Report protokolliert und für Rollback/Forensik auditiert.

## Konfigurationsentwurf

Quellen (Empfehlung, absteigende Priorität):
1. CLI-Argumente (z. B. `--registry-enabled`, `--registry-pins path/to/pins.json`)
2. Umgebungsvariablen (`.env` via `python-dotenv`)
3. App-Config (JSON/YAML via Config-Manager)

Flags (Environment-Variablen):
- `FORMULA_REGISTRY_ENABLED` (bool; "true"/"false"; Default: false)
- `FORMULA_REGISTRY_VERSION_LOCK` (string; Default: "")
  - Syntax (einfach): `altruism_update@1.0.0,consumption_rate@2.1.3`
  - Alternative (empfohlen für Governance): Pfad auf ein Pins-File via `FORMULA_REGISTRY_PINS_FILE` (siehe unten)
- `FORMULA_REGISTRY_PINS_FILE` (string; Pfad auf JSON/YAML mit Mapping name→version)

Pins-Datei (Beispiel `digital-lab/backend/formulas/pins.json`):
```
{
  "altruism_update": "1.0.0",
  "consumption_rate": "2.1.3"
}
```

Lade-Reihenfolge der Pins:
1) Wenn `FORMULA_REGISTRY_PINS_FILE` gesetzt: Datei laden
2) Sonst: `FORMULA_REGISTRY_VERSION_LOCK` parsen
3) Sonst: leer (Registry darf kompilieren, aber nichts ist gepinnt) — für Produktionsläufe NICHT empfohlen

## Version-Pinning zur Laufzeit
- Beim `SimulationManager.reset_model(...)` wird ein unveränderlicher Snapshot der Pins im Modell abgelegt:
  - `model.formula_pins: Dict[str, str]`
  - `model.formula_registry_enabled: bool`
- Der Registry-Resolver liefert nur die gepinnte Version; fehlt ein Pin, wird:
  - in PROD: Fehler (Run bricht ab),
  - in DEV: Warnung + Fallback auf neueste "released" Version (konfigurierbar via `FORMULA_REGISTRY_DEV_FALLBACK=true`).

## Run-Report (Dokumentation der aktiven Versionen)
Erweiterung von `get_model_report()` um Abschnitt `run_info`:
```
run_info: {
  seed: <int>,
  bit_generator: "PCG64",
  created_at: "<ISO8601>",
  registry: {
    enabled: <bool>,
    schema: "v1",
    pins: { name: version, ... },
    artifact_hash: "<hash-of-pins-file-or-map>",
    commit: "<optional-registry-repo-commit>"
  },
  telemetry: {
    registry_call_count: <int>,
    registry_eval_ms_total: <float>,
    cache_hit: <int>,
    cache_miss: <int>,
    compile_ms_total: <float>
  }
}
```
- `pins` bildet die exakten Formelversionen des Runs ab.
- `artifact_hash` ist ein Hash über die Pins (und optional der kompilierten Artefakte), um die Reproduzierbarkeit kryptografisch zu belegen.

## Rollback-Verfahren
- Ziel: Ohne Codeänderung auf eine ältere, bereits freigegebene Version zurückschalten.
- Optionen:
  1) Pins-Datei anpassen (z. B. `altruism_update` von `1.1.0` auf `1.0.0`) und den Run neu starten.
  2) Temporär per ENV: `FORMULA_REGISTRY_VERSION_LOCK="altruism_update@1.0.0"` (nur wenn ENV > Datei in Priorität)
- Governance: Nur Rolle „Approver/Operator“ darf Pins in Produktion ändern; alle Änderungen auditpflichtig (siehe Governance-Dokument).

Prozedur (empfohlen):
1) Stoppe oder rotiere den aktuellen Run.
2) Setze Pins auf gewünschte Versionen (via Pull-Request auf `pins.json`).
3) Lasse Reviewer gegen Golden/Property-Tests prüfen (CI).
4) Starte neuen Run; prüfe `run_info.registry.pins` und Telemetrie.

## Telemetrie (Overhead-Messung)
Zu erfassen:
- `registry_call_count`: Anzahl Registry-Evaluierungen (Funktionsaufrufe)
- `registry_eval_ms_total`: Summierte Zeit für Evaluierungen (ms)
- `cache_hit` / `cache_miss`: Cache-Wirksamkeit für kompilierte Formeln
- `compile_ms_total`: Zeitaufwand fürs Kompilieren (ms)
- Optional pro Formel: `per_formula: { name: { calls, eval_ms_total, cache_hits, cache_misses } }`

Einbettung:
- Im `run_info.telemetry` jeder `get_model_report()` Antwort (für UI/Export)
- Zusätzlich optionales Export-Interface (Prometheus/StatsD) für Langzeit-Monitoring

## Verhalten bei deaktivierter Registry
- `FORMULA_REGISTRY_ENABLED=false`: System nutzt die eingebauten, fest verdrahteten Python-Implementierungen (Baseline-Verhalten). Alle Registry-Aufrufe sind No-ops.

## Akzeptanzkriterien (für dieses Design)
- Ein Run dokumentiert exakt die verwendeten Formelversionen (Pins im Report)
- Klare Rollback-Prozedur über Pins mit Rollenbeschränkung
- Telemetrie-Metriken definiert und eingebettet in `run_info`

