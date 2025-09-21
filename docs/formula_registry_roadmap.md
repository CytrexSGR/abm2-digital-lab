# Roadmap: Einführung der Formula Registry

Ziel: Konsolidierte Roadmap für Pilot, Migration weiterer Formeln, Governance‑Finalisierung und Optimierungen. Bezieht sich auf: Assessment, RNG‑Plan, Spec/Tests, API‑Contracts, Frontend‑Spec, Governance, Risiko‑Plan und Integrationsplan.

## Phasenübersicht
- Phase 0 – Grundlagen: RNG‑Zentralisierung, API‑Skeleton, Telemetrie‑Plumbing, Spec/Test‑Vorlagen
- Phase 1 – Pilot: altruism_update in Registry, End‑to‑End DEV → STAGE → PROD
- Phase 2 – Breiten‑Rollout: deterministische Formeln (Top‑5) migrieren
- Phase 3 – RNG‑nahe Formeln: Investitionslogik (Erfolgs‑RNG als Input), restliche deterministische Umweltformeln
- Phase 4 – Governance/Compliance: RBAC, Audit‑Middleware, Pins‑Prozess, Retention, Runbook & Schulung
- Phase 5 – Optimierungen: Performance (Batch/Vectorize/Cache), Beobachtbarkeit, DX (Frontend‑Editor, Snippets)

## Zeitleiste (realistisch, bei 1–2 Devs, parallel wo sinnvoll)

| Phase | Dauer | Zeitfenster | Deliverables | Abhängigkeiten | Risiken (Top) | Puffer/Mitigation |
|---|---|---|---|---|---|---|
| 0: Grundlagen | 1–2 Wochen | Woche 1–2 | Zentraler RNG (Generator/Seed im Run‑Report), Basistelemetrie (`registry_*`), JSON Spec/Test‑Vorlagen, Minimal‑Registry‑Stub + Flags | keine | Scope‑Creep | WIP‑Limit, klarer Scope, 20% Puffer |
| 1: Pilot | 2 Wochen | Woche 3–4 | `altruism_update` Draft→Release→Pin; Code‑Guard; DEV/STAGE Regression; PROD Rollout | Phase 0 | Performance‑Overhead | Cache/Vectorize; Overhead ≤10% als Kriterium |
| 2: Top‑5 Formeln | 2–3 Wochen | Woche 5–7 | `consumption_rate`, `risk_aversion`, `cognitive_capacity_penalty`, `media_influence_update`, `hazard_prob_next` | Phase 1 | Numerik‑Abweichungen | Golden/Property‑Tests; Toleranzen definieren |
| 3: RNG‑nahe | 1–2 Wochen | Woche 8–9 | `investment_amount` + `investment_outcome` (success als Input), `regen_rate_next`, `political_position` | Phase 2, RNG | RNG‑Kopplung | RNG‑Inputs, Seed‑Repro; zusätzliche Tests |
| 4: Governance | 2 Wochen | Woche 10–11 | RBAC, Audit‑Endpoints/View, Pins‑Admin, Retention‑Policy, Runbook, Schulung | Phasen 1–3 | Audit‑Lücken | Audit‑Middleware, CI‑Gates, Reviews |
| 5: Optimierungen & Editor | 1–2 Wochen | Woche 12–13 | Batch‑Eval, persistenter Compile‑Cache, Editor‑MVP (CodeMirror+math.js), Telemetrie‑Dashboards | vorh. Backend | Performance/UX | Messbar: `cache_hit_ratio ≥ 0.95` |

Gesamt: 8–13 Wochen inkl. 15–20% Risikopuffer.

## Meilensteine
- M1: Grundlagen abgeschlossen (RNG zentral, Telemetrie sichtbar)
- M2: Pilot produktiv (altruism_update via Registry, Pins aktiv)
- M3: Top‑5 Formeln migriert und freigegeben
- M4: RNG‑nahe Formeln migriert (Investitionspfad entkoppelt)
- M5: Governance‑Prozess auditiert (RBAC + Audit + Pins‑Workflow live)
- M6: Optimierungen (Cache/Vectorize) wirksam; Frontend‑Editor MVP nutzbar

## Abhängigkeiten (kritisch)
- RNG‑Zentralisierung (für Investitionspfad und reproduzierbare Läufe)
- Spec/Test‑Vorlagen (Schema/Golden/Property) – wiederverwendbar pro Formel
- Registry‑API (Validate/Compile/Test/Release/Pins) – minimaler Funktionsumfang
- Telemetrie (run_info.registry + Metriken) – für Performance‑Gates
- Frontend‑Editor – optional für Pilot, nötig ab Phase 5

## Risikopuffer und Sicherungen
- Zeitpuffer: 15–20% auf Phasen 1–3 (Pilot + Migration)
- Gates/Kriterien (Go/No‑Go):
  - Overhead ≤ 10% (Profil + `registry_eval_ms_total`)
  - `cache_hit_ratio ≥ 0.95` nach Warmup
  - Regressionen innerhalb Toleranz (Golden/Property grün)
  - Vollständige Audit‑Trails bei Release/Pin
- Fallback: Feature‑Flag OFF oder Pin‑Rollback; dokumentierter Runbook‑Pfad

## Maßnahmenempfehlungen (kurz)
- Pilot priorisieren, danach klein geschnittene, deterministische Formeln migrieren
- Vor jeder Migration: Spec + Tests erstellen; nach jeder Migration: Regression + Telemetrie prüfen
- Governance parallel aufsetzen (RBAC, Audit, Pins‑PR‑Workflow)
- Frühzeitig Editor‑MVP integrieren, aber Backend als „Source of Truth“

