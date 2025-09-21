Alerting & Dashboard – Formula Registry (PROD)

Metriken & Schwellwerte
- Performance Overhead
  - registry_eval_ms_total / baseline_ms > 0.10 (Warn), > 0.20 (Crit)
- Cache/Batch Wirksamkeit
  - cache_hit_ratio < 0.95 (Warn), < 0.90 (Crit)
  - batch_calls ≈ steps (Warn, wenn Abweichung > 5%)
  - batch_size_avg ≈ agent_count (Warn, wenn Abweichung > 5%)
- Fehlerraten
  - Rate der *_failed Audit-Events > 0.01/min (Warn), > 0.05/min (Crit)
- Validierung PROD
  - Pins validiert (GET /api/pins.validation_status.ok == true)
  - run_info.registry.enabled == true
  - Pins nicht leer (Warn, wenn leer)

Dashboard (Pane-Skizzen)
- Overhead-Trend (Linie): registry_eval_ms_total / baseline_ms über Zeit
- Cache-Hit (Linie/Single-Stat): cache_hit_ratio
- Batch-Health (Balken): batch_calls, batch_size_avg vs. erwartete Werte
- Fehlerrate (Linie): Anzahl *_failed pro Minute
- Timeline (Table): Release-/Pin-Events (Audit) mit User/ts/version

Alerting-Regeln
- Alert: Performance Overhead Crit → Incident an Betreiberteam
- Alert: Cache-Hit Crit → Investigate Registry/Batching
- Alert: Fehlerrate Crit → Freeze Release/Pinning; Root Cause Analysis
- Alert: Pins invalid (GET /api/pins) → Block PROD-Starts
