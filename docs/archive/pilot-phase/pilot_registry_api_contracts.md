# API-Contracts: Formula Registry (FastAPI)

Ziel: Exakte REST-Schnittstellen für die Formula Registry zur Verwendung mit dem bestehenden Backend (FastAPI). Basierend auf den bisherigen Artefakten (Spec, Pins, Governance).

Grundsätze
- Draft → Validate → Compile → Test → Review → Release → Pin
- Formeln bestehen aus: `name`, `version`, `inputs` (Schema), `expression` (math.js AST), `allowed_symbols`, `metadata`
- Registry ist optional per Feature-Flag (`FORMULA_REGISTRY_ENABLED`); mit Version-Pinning pro Run.

Namenskonventionen
- `version`: Semver-String, z. B. `"1.0.0"`
- `status`: `draft | released | deprecated`
- `artifact_hash`: Hash des kompilierten Artefakts (lambdify/signatur)

## 1) GET /registry/health
- Zweck: Lebenszeichen und Feature-Status
- Output (200):
```
{
  "status": "ok",
  "enabled": true,
  "whitelist": ["+","-","*","/","Min","Max","exp","log"],
  "schema_version": "v1"
}
```
- Fehler: 500 bei internen Fehlern

## 2) GET /formulas/{name}
- Zweck: Details zu einer Formel; optional gefiltert per `version`
- Query: `version` (optional; wenn leer → neueste released + Draft-Metadaten)
- Output (200):
```
{
  "name": "altruism_update",
  "versions": [
    {"version": "1.0.0", "status": "released", "created_at": "2025-08-27T12:00:00Z", "created_by": "userA"},
    {"version": "1.1.0", "status": "draft", "created_at": "2025-08-28T10:00:00Z", "created_by": "userB"}
  ],
  "active": {"version": "1.0.0", "status": "released"},
  "draft": {
    "version": "1.1.0",
    "inputs": [
      {"name": "prev_altruism", "type": "number", "min": 0.0, "max": 1.0},
      {"name": "bildung", "type": "number", "min": 0.0, "max": 1.0}
    ],
    "expression": {"type": "OperatorNode", "op": "+", "args": [/* math.js AST */]},
    "allowed_symbols": ["+","-","*","/","Min","Max"],
    "metadata": {"description": "...", "tags": ["pilot"], "notes": "..."}
  }
}
```
- Fehler: 404 wenn Formel unbekannt

## 3) PUT /formulas/{name}
- Zweck: Legt Draft-Version an oder ersetzt deren Inhalt (idempotent auf `version`)
- Input (JSON):
```
{
  "version": "1.1.0",                 // optional; wird sonst automatisch vergeben
  "inputs": [                          // siehe docs/pilot_altruism_update.schema.json
    {"name": "prev_altruism", "type": "number", "min": 0.0, "max": 1.0},
    {"name": "bildung", "type": "number", "min": 0.0, "max": 1.0}
  ],
  "expression": { /* math.js AST JSON */ },
  "allowed_symbols": ["+","-","*","/","Min","Max"],
  "tests": {                           // optional: Golden-/Property-Tests
    "golden": [ {"input": {"prev_altruism": 0.4, ...}, "expected": 0.41, "tolerance": 1e-9} ],
    "properties": [ {"name": "range", "min": 0.0, "max": 1.0} ]
  },
  "metadata": {"description": "...", "created_by": "userA"}
}
```
- Output (200/201):
```
{"name": "altruism_update", "version": "1.1.0", "status": "draft"}
```
- Fehler: 400 (ungültige Version), 422 (Schema/Validation), 409 (Version existiert released), 500 (intern)
- Audit: `create_draft` oder `update_draft`

## 4) POST /validate
- Zweck: Whitelist- und Schema-Validierung (trocken)
- Input:
```
{"name": "altruism_update", "version": "1.1.0"}
```
- Output (200):
```
{
  "ok": true,
  "symbols_used": ["+","-","*","/","Min","Max"],
  "blocked_symbols": [],
  "messages": []
}
```
- Fehler: 404 (Draft nicht gefunden), 422 (AST/Symbole invalid), 500
- Audit: `validate`

## 5) POST /compile
- Zweck: Compile Draft zu Artefakt (SymPy → lambdify), ohne Release
- Input:
```
{"name": "altruism_update", "version": "1.1.0", "modules": {"exp": "math.exp", "log": "math.log"}}
```
- Output (200):
```
{"ok": true, "artifact_hash": "sha256:...", "warnings": []}
```
- Fehler: 404 (Draft fehlt), 422 (Compile-Fehler), 500
- Audit: `compile`

## 6) POST /test
- Zweck: Tests gegen Draft/Version ausführen
- Input:
```
{"name": "altruism_update", "version": "1.1.0"}
```
- Output (200):
```
{
  "ok": true,
  "golden": {"passed": 8, "failed": 0, "details": []},
  "properties": {"passed": 4, "failed": 0, "details": []}
}
```
- Fehler: 404 (Draft/Tests fehlen), 422 (Testfehler mit Details), 500
- Audit: `test`

## 7) POST /release
- Zweck: Markiert Draft als released (unveränderlich)
- Input:
```
{"name": "altruism_update", "version": "1.1.0", "notes": "QA passed"}
```
- Output (200):
```
{"name": "altruism_update", "version": "1.1.0", "status": "released", "released_at": "2025-08-28T10:30:00Z", "released_by": "approver1"}
```
- Fehler: 404 (Draft fehlt), 409 (bereits released), 403 (fehlende Rolle), 500
- Audit: `release`

## 8) GET /versions/{name}
- Zweck: Versionen und Status auflisten
- Output (200):
```
{
  "name": "altruism_update",
  "versions": [
    {"version": "1.0.0", "status": "released"},
    {"version": "1.1.0", "status": "draft"}
  ]
}
```
- Fehler: 404, 500

## 9) GET /pins
- Zweck: Aktuelle Pins (Version-Locks) anzeigen
- Output (200):
```
{"pins": {"altruism_update": "1.0.0", "consumption_rate": "2.1.3"}, "source": "file", "path": ".../pins.json"}
```
- Fehler: 500 (Datei/Config nicht lesbar)

## 10) PUT /pins
- Zweck: Pins ändern (Governance: nur Operator/Approver)
- Input:
```
{"pins": {"altruism_update": "1.0.0", "consumption_rate": "2.1.3"}, "reason": "rollback regression"}
```
- Output (200):
```
{"ok": true, "artifact_hash": "sha256:...", "applied": {"altruism_update": "1.0.0"}}
```
- Fehler: 400 (ungültige Versionen/Unreleased), 403 (Rolle), 409 (konflikt mit Lauf), 500
- Audit: `pin_update` (mit `from_version`/`to_version` je Eintrag)

## 11) GET /audit
- Zweck: Audit-Events filtern
- Query: `formula?`, `version?`, `action?`, `from_ts?`, `to_ts?`, `user?`, Pagination
- Output (200):
```
{"items": [
  {"ts": "...", "user": "editor1", "action": "create_draft", "formula": "altruism_update", "version": "1.1.0", "request_id": "..."}
], "next": null}
```
- Fehler: 500

## 12) Optional: WS /ws/registry
- Zweck: Push-Events (Draft created, Released, Pin updated)
- Event-Beispiele:
```
{"type": "draft_created", "formula": "altruism_update", "version": "1.1.0", "by": "editor1"}
{"type": "released", "formula": "altruism_update", "version": "1.1.0", "by": "approver1"}
{"type": "pins_updated", "pins": {"altruism_update": "1.0.0"}, "by": "operator1"}
```

## Fehler- und Governance-Aspekte
- 400: Ungültiges Format (z. B. fehlerhafte Semver / AST-Schema)
- 401/403: fehlende AuthN/AuthZ für Release/Pin
- 404: Formel/Version nicht gefunden
- 409: Konflikte (Release doppelt, Version bereits released, Pin gegen unreleased Version)
- 422: Validierungs-/Compile-/Testfehler mit `details`
- 500: interne Fehler

## Audit-Trigger (implizit)
- Jeder erfolgreiche oder fehlgeschlagene mutierende Endpoint erzeugt Audit-Events:
  - `create_draft`, `update_draft`, `validate`, `compile`, `test`, `review_approved/rejected` (optional separater Endpoint/Flag), `release`, `pin_update`, `rollback`
- Felder (siehe Governance-Dokument): `ts`, `user`, `action`, `formula`, `version`, `from_version`, `to_version`, `artifact_hash`, `tests_summary`, `validator_summary`, `reason`, `request_id`

## Hinweise zur Integration
- Pins werden beim Modell-Reset eingelesen und im `run_info.registry` festgehalten.
- Registry ist „No-op“, wenn `FORMULA_REGISTRY_ENABLED=false`.
- Vektor-Auswertung: Registry kann Funktionen für skalare/array Inputs bereitstellen; Telemetrie messen.

