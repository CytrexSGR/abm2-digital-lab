# Governance-Flow für die Formula Registry (Release → Rollback)

Ziel: Rollen, Freigabeprozess, Audit und Rollback transparent und nachvollziehbar definieren.

## Rollenmodell
- Editor: erstellt/ändert Formeln (AST/Expression), schreibt Golden-/Property-Tests.
- Reviewer: prüft Validierung, Tests, Domain-Logik; gibt Review frei.
- Approver: finalisiert Release in die Registry (setzt Status „released“), darf Rollbacks veranlassen.
- Operator: betreibt Runs, setzt Pins (gemäß Freigaben) und startet/stoppt Simulationen.
- Auditor (optional): liest Audit-Logs, keine Schreibrechte.

Prinzipien:
- Trennung von Rechten (Editor ≠ Approver ≠ Operator).
- Append-only Audit-Log; Releases und Rollbacks sind eigenständige, unveränderliche Events.

## Release-Prozess (Happy Path)
1) Draft: Editor legt neue Version an (`PUT /formulas/{name}` mit AST/Meta).
2) Validate: `POST /validate` (Whitelist, Typ-/Range-Checks) → Ergebnis protokollieren.
3) Compile: `POST /compile` (SymPy → lambdify) → Artefakt-Hash berechnen.
4) Test: `POST /test` (Golden/Property) → Ergebnisse anhängen.
5) Review: Reviewer bestätigt (UI/Sign-off) → Audit-Eintrag „review_approved“.
6) Release: Approver `POST /release` mit Versions-ID → Status „released“.
7) Pinning: Operator aktualisiert Pins (PR gegen `pins.json`) → neuer Run mit fixierten Versionen.

## Rollback-Prozess
- Auslöser: Regressionen, SLA-Verstöße, Telemetrie-Alarm.
- Schritte:
  1) Approver entscheidet Rollback-Zielversion (vorherige „released“ Version) und dokumentiert Grund.
  2) Operator setzt Pins zurück (PR auf `pins.json`) und startet neuen Run.
  3) Auditor verifiziert Audit-Log und Run-Report (`run_info.registry.pins`).

## Audit-Log (Felder)
- `ts`: ISO-8601 Zeitstempel
- `user`: Benutzer-ID/Service-Account
- `action`: one of ["create_draft", "validate", "compile", "test", "review_approved", "review_rejected", "release", "rollback", "pin_update"]
- `formula`: Name
- `version`: Version (z. B. "1.0.0")
- `from_version`/`to_version`: bei Rollback/Pin-Update
- `artifact_hash`: Hash des kompilierten Artefakts (lambdify-code/signatur)
- `tests_summary`: { passed, failed, coverage? }
- `validator_summary`: { symbols_allowed, blocked_symbols }
- `reason`: Freitext (für Rollback/Reject)
- `request_id`: Tracing/Correlation-ID

Ablage:
- Append-only Logdatei (z. B. `digital-lab/backend/backend.log`) und/oder DB-Tabelle `formula_audit_log`.
- Optional: Event-Stream (Kafka) für SIEM/Monitoring.

## Policies
- Drafts sind unveröffentlicht; nur „released“ Versionen dürfen gepinnt werden.
- Pins in Produktion nur via PR/Change-Request; mindestens 1 Reviewer.
- Retention: Audit-Logs 12–36 Monate; Artefakte/Versionen mindestens 6 Monate.
- Notfall: "Break-glass"-Accounts protokolliert, 2FA erforderlich.

## Telemetrie-Verknüpfung
- Jede Registry-Evaluation protokolliert Metriken; Aggregation im Report unter `run_info.telemetry`.
- Abweichungen (Cache-Miss-Quote, eval_ms_total) triggern Alerts.

## Akzeptanzkriterien (Governance)
- Ein Run fixiert die verwendeten Formelversionen per Pins und dokumentiert sie im Report.
- Rollback ist als klarer, rollenbasierter Prozess beschrieben.
- Audit-Felder decken Verantwortlichkeit, Nachvollziehbarkeit und Reproduzierbarkeit ab.

