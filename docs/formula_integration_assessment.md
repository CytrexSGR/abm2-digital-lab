# Bewertung: Formel-Editierung im Browser (math.js → SymPy → lambdify)

Stand: aktuelles Repo unter `PROJECT_ROOT=/home/cytrex/abm2`

## Eignungsscore (0–5)
- Sicherheit: 5 — Backend ohne `eval/exec`; Whitelist-Validierung gut machbar
- Trennschärfe: 4 — Formeln weitgehend entkoppelbar (Pure Functions möglich)
- Performance: 4 — Hotspots identifiziert; Caching/Vectorization möglich
- SymPy-Kompatibilität: 5 — SymPy 1.12 vorhanden; genutzte Ops abbildbar
- Frontend-Einbindung: 4 — CRA/React vorhanden; math.js/CodeMirror integrierbar
- Governance: 3 — Benötigt neue Registry + Versionierung + Audit

## Inventarisierung
- Backend (FastAPI): `digital-lab/backend/main.py` (Entrypoint), `simulation_manager.py`
- Mesa-Modell: `digital-lab/backend/political_abm/` (Model, Agents, Managers)
- Config/ENV: `digital-lab/backend/config/*`, `.env`
- Frontend (CRA/React): `digital-lab/frontend` (build vorhanden)

## Zentrale Berechnungen (Hotspots)
- `political_abm/agents.py`
  - `decide_and_act(ersparnis, params)` (L:22): Investitionsentscheidung, RNG in Erfolg; Seiteneffekte: Vermögen
  - `learn(delta_u_ego, delta_u_sozial, env_health, biome_capacity, learning_params)` (L:60): Altruismus-Update; deterministisch; clip
  - `learn_from_media(source, influence_factor, params)` (L:87): Präferenz-Update; deterministisch; clip
  - `update_psychological_states(params)` (L:111): kognitive Kapazität, Risikoaversion; deterministisch; min/max
- `political_abm/simulation_cycle.py`
  - `_update_environment_parameters()` (L:135): Hazard(t+1) = base + investment*sens; Regen = base*(1 + (mean_altruism-0.5)*factor)
  - `_classify_agents_into_milieus()` (L:224): Distanz-basiert (np.linalg.norm)
  - `_generate_gini_events()` + `_calculate_gini()` (L:193,214)
- `political_abm/model.py`
  - `gini(x)` (L:25): Paarweise Differenzen, O(n^2)
  - `get_model_report()` (L:236): Aggregationen/np.mean
- `political_abm/types.py`
  - `calculate_political_position()` (L:54): lineare/clip-Transformation
- `political_abm/managers/resource_manager.py`
  - `_handle_consumption_saving()` (L:12): Konsumquote = base + f(Zeitpräferenz, Risiko) → clip
- `political_abm/managers/media_manager.py`
  - `select_source_for_agent()` (L:20): Distanz/Norm, inverse Gewichtung, RNG Auswahl
- `political_abm/managers/hazard_manager.py`
  - `trigger_events()` (L:12): RNG-Entscheid pro Agent; state updates
- `political_abm/utils.py`
  - `generate_attribute_value()` (L:5): Verteilungen (np.random.*)

## RNG-Nutzung
- `random.random()` in `decide_and_act()` und `hazard_manager.trigger_events()`
- `np.random.*` in `utils.generate_attribute_value()` und Frontdoor-Verteilungen

## Sicherheit
- Keine `eval/exec/ast.parse/numexpr.evaluate` im Backend gefunden
- Frontend `node_modules` enthalten `eval` (irrelevant für Backend-Ausführung)
- Whitelist-Ansatz: nur arithmetische Operatoren, Funktions-Whitelist, keine Attribute/Calls

## Performance (cProfile, 150 Agents, 50 Steps)
- Profil: `profiling.txt` erzeugt
- Top-Stellen (tottime):
  - `numpy.linalg.norm` (45k calls): 0.095s — Medienquellen-Selektion
  - `get_model_report` (50 calls): 0.085s — Aggregationen/Serialisierung
  - `select_source_for_agent` (7.5k calls): 0.062s — Distanz/Weights
  - `calculate_political_position` (45k calls): 0.049s — einfache Formeln
  - `gini` (100 calls): 0.045s — O(n^2), pot. Bottleneck bei großen n
  - `run_step` cumtime ~0.66s/50 steps (gesamt 0.919s)
- Schluss: Mathe-Formeln sind nicht die Hauptbremse; Distanzberechnung und Gini dominieren. Registry-Einführung darf nicht signifikant overheaden → Cache/Lambdify nötig.

## SymPy → lambdify Kompatibilität
- SymPy 1.12 vorhanden (Import Probe OK)
- Benötigte Funktionen: +, -, *, /, **, min/max/clip, mean (Aggregation außerhalb Formel), evtl. exp/log für künftige Sigmoid/Softplus
- Mapping: `Min/Max` in SymPy; `clip(x,a,b)` → `Min(Max(x,a), b)`
- Custom-Mappings: falls Sigmoid/Softplus später: `sigmoid(x)=1/(1+exp(-x))`, `softplus(x)=log(1+exp(x))`
- Gap: `sympy` fehlt in `backend/requirements.txt` → aufnehmen

## Trennschärfe (Pure Functions Machbarkeit)
- Gut: Formeln sind deterministisch und nutzen Agent-State als Input; IO/DB/Logger nicht direkt in Formeln
- Kandidaten für Auslagerung in Registry:
  - `consumption_rate(state, params) -> q` (aus `_handle_consumption_saving`)
  - `investment_decision(ersparnis, risk, time_pref, params) -> amount, p_success`
  - `altruism_update(delta_ego, delta_social, env_health, capacity, params, prev_altruism) -> new_altruism`
  - `media_influence_update(pref, source_axis, education, capacity, params) -> new_pref`
  - `risk_aversion(vermoegen, factor) -> risk`
  - `regen_rate(base_rate, mean_altruism, factor) -> new_rate`
  - `hazard_prob(base, total_investment, sensitivity) -> new_prob`
  - `political_position(vermoegen, altruism, freedom_pref) -> (a,b)`

## Registry-Design (Vorschlag)
- Schema (JSON/YAML/DB):
  - `name`: string
  - `inputs`: [{name, type, range?}]
  - `expression`: math.js AST (JSON) und/oder infix string
  - `allowed_symbols`: ["+, -, *, /, **, min, max, exp, log"]
  - `tests`: list of {inputs, expected, tol}
  - `version`: semver/string; `created_by`, `released_at`
  - `compiled`: backend-artifact hash (sympy dump + code hash)
- Engine: `math.js AST → whitelist validate → SymPy expr → lambdify(modules={'numpy':np, ...})`
- Cache: LRU by (name, version); compiled function handle
- Vectorization: prefer lambdify with `modules=['numpy']` for array inputs
- Audit/Rollback: append-only versions; tag `released_at`; keep previous deployed

## API-Bedarf (FastAPI)
- `GET /formulas/{name}`: aktuelle + Versionen
- `PUT /formulas/{name}`: neue Draft-Version (AST + meta)
- `POST /validate`: AST-Whitelist + Typ/Range-Prüfung (trockene Auswertung)
- `POST /compile`: SymPy-Compile, Rückgabe handle_id/version/hash
- `POST /test`: Tests ausführen (Golden Cases/Property)
- `POST /release`: Version als aktiv markieren (mit Audit-Log)
- `GET /versions/{name}`: Versionsliste + Metadaten
- AuthZ: Rollen Editor/Reviewer/Approver; Audit-Log (user, ts, action)

## Frontend-Eignung
- CRA/React; Integration von `mathjs`, `codemirror` oder `monaco` unkompliziert
- UI: Live-Checks (lint/validate), Testfälle im UI (Inputs/Outputs), Diff/Version-Ansicht

## Migrationssequenz (minimal-invasiv)
1) Extrahiere 1 repräsentative Formel als Pure Function (z. B. `altruism_update`) und hinterlege identische Unit-Tests (Golden Cases)
   - Akzeptanz: Tests grün; Model-Output unverändert (±Tol) über 100 Steps
2) Implementiere minimalen Registry-Kern (In-Memory + JSON-Persistenz) inkl. Whitelist-Validator und SymPy-Compiler
   - Akzeptanz: `PUT/validate/compile/test/release` Endpoints funktionieren; Audit protokolliert
3) Hänge Model an Registry-Hook: rufe kompilierte Funktion per Handle auf (Version fest verdrahtet im Run)
   - Akzeptanz: Simulation läuft; Performance neutral (±10% tottime)
4) Schrittweise Migration weiterer Hotspots (Consumption, Risk, Media-Update, Regen/Hazard)
   - Akzeptanz: Regressionstests auf Kennzahlen (Mittelwerte, Gini) stabil
5) Caching/Vectorization: bündle agentweise Inputs und evaluiere batchweise
   - Akzeptanz: Profiling zeigt <10% Mehrkosten ggü. vorher
6) Governance-Härtung: Persistenz (DB), Rollenmodell, Version-Pinning und Rollback
   - Akzeptanz: Release/rollback ohne Neustart möglich; Audit vollständig

## Risiken & Abmilderung
- Performance-Overhead durch Registry: Mit LRU-Cache + numpy-lambdify + Batch-Evals minimieren
- Komplexitätszuwachs: Zunächst 1–2 Formeln, klare Tests/Golden Cases
- Validierungs-Lücken: Strikte AST-Whitelist, keine Attribute/Method-Calls, feste Symboltabelle
- Reproduzierbarkeit: Version-Pinning im Run, Artefakt-Hash, Requirements lock (sympy-Pin)

## Offene Fragen
- Welche Formeln sollen Editor-seitig gepflegt werden (Scope)?
- Persistenzpräferenz: JSON/YAML im Repo vs. DB (SQLite/Postgres)?
- Anforderungen an AuthZ/Audit-Tiefe (Wer genehmigt Releases)?
- Toleranzen für statistische Gleichheit (Akzeptanzkriterien)?

## Fundstellen-Tabelle (Auszug)
- agents.py:22 `decide_and_act` — Inputs: ersparnis, params; RNG: ja; Calls/Step: ~N; Seiteneffekte: Vermögen; Vektorisierbar: teilweise
- agents.py:60 `learn` — Inputs: delta_ego, delta_sozial, env_health, capacity, params; RNG: nein; Vektor: ja
- agents.py:87 `learn_from_media` — Inputs: source, influence, params; RNG: nein; Vektor: ja
- agents.py:111 `update_psychological_states` — Inputs: params; RNG: nein; Vektor: ja
- types.py:54 `calculate_political_position` — Inputs: state; RNG: nein; Vektor: ja
- managers/resource_manager.py:12 `_handle_consumption_saving` — Inputs: state, params; RNG: nein; Vektor: ja
- managers/hazard_manager.py:12 `trigger_events` — Inputs: hazard_prob; RNG: ja; Vektor: n/a (ereignisbasiert)
- managers/media_manager.py:20 `select_source_for_agent` — Distanz/Norm, RNG Auswahl
- simulation_cycle.py:135 `_update_environment_parameters` — Invest→Hazard; Altruismus→Regen
- model.py:25 `gini` — O(n^2), Achtung bei größeren n

## Gaps (konkret + Aufwand)
- sympy in `backend/requirements.txt` ergänzen (S)
- Minimal-Registry (Model, Storage, Compile, Cache) (M)
- AST-Whitelist-Validator (M)
- FastAPI-Endpoints + AuthZ/Logs (M–L je Governance-Tiefe)
- Frontend-Editor (math.js + CodeMirror/Monaco) (M)
- Tests: Golden Cases + Property-Tests (S–M)

## Befehle (ausgeführt)
- Inventar: rg-Suchen (Klassen/step/schedule)
- Mathe/RNG: rg nach numpy/math/exp/log/min/max, random/np.random
- Sicherheit: rg nach eval/exec/ast.parse/numexpr.evaluate
- Profiling: cProfile über 50 Steps → `profiling.txt`
- SymPy-Probe: lambdify/exp/log Probe OK

