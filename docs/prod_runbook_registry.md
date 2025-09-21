# PROD Runbook – Formula Registry

## Start/Stop/Reset
- Flags (ENV):
  - `FORMULA_REGISTRY_ENABLED=true|false` (toggle registry on/off)
  - `FORMULA_REGISTRY_PINS_FILE=/path/to/pins.json` (pins file path)
- Health:
  - `GET /api/registry/health` → `{status:ok, enabled:true}`
- Reset model:
  - `POST /api/simulation/reset` (optional payload: `{num_agents, network_connections}`)

## Pins ändern (PR-Workflow)
1) Bearbeite `pins.json` in Git (PR) – Beispiel:
   ```json
   {"altruism_update": "1.0.0"}
   ```
2) Nach Merge: deployen und via API kontrollieren:
   - `GET /api/pins` → enthält `validation_status.ok=true`
   - `PUT /api/pins` mit Payload (falls nicht dateibasiert):
     ```json
     {"pins": {"altruism_update": "1.0.0"}, "reason": "prod switch"}
     ```
   - Erwartet: 200 OK, Audit `pin_update`
3) Ungültige Pins werden abgewiesen (400) und Audit `pin_update_rejected` geschrieben.

## Rollback
1) Setze Pins auf vorherige freigegebene Version
2) `GET /api/pins` prüfen (`validation_status.ok=true`)
3) Neustart/Reset der Simulation (falls laufend)
4) `GET /api/audit` prüfen: neue `pin_update` eingetragen

## Chaos-Toggle (Registry on/off)
- Toggle `FORMULA_REGISTRY_ENABLED` und starte neuen Run (Reset)
- Erwartung:
  - OFF: Fallback-Pfade aktiv, gleiche Baseline-Metriken
  - ON: Registry-Pfade aktiv, Pins im Run-Report (`run_info.registry`)

## Troubleshooting
- 400 Invalid Pins: Korrekte released Versionen pinnen; `GET /api/versions/{name}` prüfen
- 422 Compile/Test Errors: `POST /api/validate`/`/compile`/`/test` Logs einsehen; Audit `*_failed` mit `request_id`
- 409 Conflicts: Version bereits released – neue Draft-Version anlegen
- 500 Internal: Server-Logs/Audit prüfen; ggf. Registry deaktivieren und fallback nutzen

## SLOs (Targets)
- Overhead Registry vs. Baseline ≤ 10% (Wall-Clock)
- Cache-Hit (effektiv über batch) ≥ 0.95
- Endpoint p95 Latency < 150 ms für `/validate`, `/compile`, `/test`, `/release`, `/pins`

