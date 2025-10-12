# Pilot-Integrationsplan: altruism_update live schalten

Ziel: Schritt-für-Schritt-Plan, um die Lernformel „altruism_update“ aus dem Code (agents.py:learn) in die Formula Registry zu überführen, zu testen und produktiv zu setzen – mit klaren Abnahmekriterien.

## Voraussetzungen
- Spezifikation vorhanden: `docs/pilot_altruism_update_spec.md`, `docs/pilot_altruism_update.schema.json`, `docs/pilot_altruism_update.tests.json`.
- API-Contracts: `docs/pilot_registry_api_contracts.md`.
- Feature-Flag/Pinning-Design: `docs/pilot_feature_flag_pinning.md`.
- RNG: Für diese Formel nicht erforderlich (deterministisch). RNG-Zentralisierung unabhängig fortführen.

## Integration (Registry-Eintrag → Release → Pinning)
1) Draft anlegen (PUT /formulas/{name})
   - name: `altruism_update`
   - payload: Inputs/Schema aus `pilot_altruism_update.schema.json`, Expression als math.js AST (Formel aus Spec), `allowed_symbols` ["+","-","*","/","Min","Max"].
   - Tests (optional schon hier): Golden/Property aus `pilot_altruism_update.tests.json`.
2) Validate (POST /validate)
   - Erwartung: ok=true; keine blocked_symbols; messages leer.
3) Compile (POST /compile)
   - Erwartung: ok=true; `artifact_hash` notiert (für Audit/Telemetry).
4) Test (POST /test)
   - Erwartung: Golden/Property alle passed; Details speichern.
5) Review
   - Reviewer prüft Diff (AST/Schema/Tests) und Testergebnisse; Audit-Eintrag `review_approved`.
6) Release (POST /release)
   - Erwartung: Status=released; `released_at`/`released_by` gesetzt.
7) Pinning (PUT /pins)
   - `pins.json`: `{"altruism_update": "<released-version>"}`.
   - ENV/Config: `FORMULA_REGISTRY_ENABLED=true`, `FORMULA_REGISTRY_PINS_FILE=.../pins.json`.

## Wiring im Code (Feature-Flag)
- Guard: Wenn `FORMULA_REGISTRY_ENABLED` und Pin für `altruism_update` vorhanden → Registry-Aufruf; sonst Fallback auf eingebauten Code.
- Aufrufstelle: `PoliticalAgent.learn(...)` wird intern aufgerufen durch `SimulationCycle`. Extrahiere Pure Function-Signatur und ersetze Berechnung:
  - Inputs: prev_altruism, bildung, delta_u_ego, delta_u_sozial, env_health, biome_capacity, params.
  - Registry-Auswertung liefert `new_altruism`; State-Update bleibt lokal (`state.altruism_factor = clip(...)`).
- `run_info.registry` im `get_model_report()` ergänzen (Pins/Hash/Telemetry), siehe Pinning-Design.

## Testablauf
1) Unit-/API-Tests (Registry)
   - POST /validate, /compile, /test für altruism_update; alle grün.
2) Regressionstests (Vergleich Alt vs. Registry)
   - Szenario A (small): 100 Agents, 200 Steps, fester Seed; Metriken: Mean_Altruism, Polarization (falls relevant), Verteilungen.
   - Szenario B (medium): 1.000 Agents, 200 Steps, fester Seed.
   - Vergleich: Zeitreihe der Kennzahlen; Akzeptanz, wenn Abweichungen innerhalb Toleranzen (z. B. |Δ mean_altruism| ≤ 1e-9 pro Step durch Identität der Formel).
3) Property-/Golden-Tests im Laufzeitkontext
   - Stichproben von Agents/Steps; direkte Auswertung der Formel mit Registry vs. lokaler Berechnung pro Agent; 1:1 Gleichheit (±1e-12) erwartet.
4) Performance-Checks
   - cProfile/Telemetry: `registry_call_count` entspricht Agentenaufrufen pro Step; `registry_eval_ms_total` Overhead ≤ 10% gegenüber eingebauter Berechnung.

## Rollout-Plan
- DEV
  - Flags an: `FORMULA_REGISTRY_ENABLED=true`, Pins gesetzt.
  - Live-Checks: Audit-Events sichtbar; Telemetrie plausibel (Calls, 0 Compile im Run, hohe Cache-Hits).
- STAGE
  - Repräsentative Seeds und Agentenzahlen; Regressionen erneut prüfen; Monitoring-Alerts konfigurieren (Eval-Overhead, Cache-Miss-Quote).
  - Chaos-Test: Registry deaktivieren (Flag off) → Fallback funktioniert; wieder aktivieren.
- PROD
  - Pins committed (PR/Review), Flags aktiv; Deploy mit Runbook.
  - Erste Runs eng überwachen: `registry_eval_ms_total`, `cache_hit_ratio`, Modellkennzahlen.
  - Fallback: Rollback via Pins auf Vorversion oder Flag off (No-Op, eingebauter Code). Audit dokumentiert.

## Akzeptanzkriterien (Go-Live)
- Draft→Validate→Compile→Test→Review→Release abgeschlossen; Audit-Einträge vollständig.
- Pins gesetzt; `run_info.registry.pins.altruism_update == <released-version>`; `artifact_hash` dokumentiert.
- Regressionen DEV/STAGE: Metriken deckungsgleich (±1e-9) gegen eingebauten Pfad.
- Telemetrie in PROD aktiv: `registry_call_count` plausibel; `cache_hit_ratio` ≥ 0.95; `registry_eval_ms_total` Overhead ≤ 10%.
- Fallback getestet: Flag off oder Pin-Rollback stellt Baseline-Verhalten her.
- Dokumentation aktualisiert (Spec/Schema/Tests/Runbook).

## Hinweise
- Nach erfolgreichem Pilot kann der eingebettete Codepfad später abgeschaltet werden (Hard-Pin), aber zunächst als Fallback belassen.
- Bei künftigen Formeländerungen greift ausschließlich der Registry-Workflow (Draft→Release→Pin).

