Go‑Live Checklist – Formula Registry

Technische Voraussetzungen
- [ ] SymPy installiert und in `requirements.txt` gepinnt
- [ ] Registry‑Endpoints aktiv (GET /api/registry/health == ok, enabled==true)
- [ ] Pins‑Datei konfiguriert (`FORMULA_REGISTRY_PINS_FILE`) und validiert (GET /api/pins.validation_status.ok)

Pilot & Tests
- [ ] Pilotformel `altruism_update` released (Version 1.0.0)
- [ ] Pins gesetzt: { "altruism_update": "1.0.0" }
- [ ] Regression DEV: Δ Mean_Altruism ≤ 1e‑9
- [ ] Regression STAGE: Δ Mean_Altruism ≤ 1e‑9
- [ ] Chaos‑Toggle getestet (ON/OFF mit Reset, saubere Reports)
- [ ] Rollback getestet (Pin zurück; Audit geprüft)

Governance & Audit
- [ ] Rollen benannt: Editor, Reviewer, Approver, Operator, Auditor
- [ ] Review/Release‑Prozess bestätigt (Draft → Validate → Compile → Test → Review → Release)
- [ ] Audit‑Logs vollständig, append‑only, ISO‑Zeitstempel
- [ ] `*_failed`‑Events mit `request_id` werden geschrieben
- [ ] Pin‑Validierung aktiv; `pin_update_rejected` bei ungültigen Pins

Performance & Telemetrie
- [ ] Overhead Registry vs. Baseline ≤ 10% (Wall‑Clock)
- [ ] `registry_eval_ms_total / baseline_ms` ≤ 0.10
- [ ] `batch_calls` ≈ #Steps; `batch_size_avg` ≈ #Agents
- [ ] `cache_hit_ratio` ≥ 0.95 (oder äquivalente Batch‑Wirksamkeit)

Betrieb & Monitoring
- [ ] Runbook veröffentlicht (Start/Stop/Reset, Pins, Rollback, Chaos‑Toggle, Troubleshooting)
- [ ] Alerting/Dashboard veröffentlicht (Overhead, Cache‑Hit, Batch‑Health, *_failed‑Rate)
- [ ] Health‑Check integriert (GET /api/registry/health)
- [ ] Backups/Retention für Audit/Artefakte definiert

Stakeholder & Dokumentation
- [ ] Stakeholder‑Summary verteilt (Nutzen, Roadmap, Risiken, Governance)
- [ ] API‑Contracts & Specs (Schema/Tests) versioniert und zugänglich
- [ ] Verantwortliche und Eskalationswege dokumentiert

Final Sign‑off
- Tech Lead: ____________________   Datum: __________   Unterschrift: __________
- Ops/Operator: _________________   Datum: __________   Unterschrift: __________
- Reviewer/Approver: ____________   Datum: __________   Unterschrift: __________
- Management: ___________________   Datum: __________   Unterschrift: __________
