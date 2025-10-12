# RNG-Zentralisierungsplan — Deterministische Formeln, zentrale RNG

Ziel: Zufall strikt vom Formelraum trennen. Ein zentraler RNG speist deterministische Formeln über explizite Eingaben. Ereignis-/Auswahl-Logik bleibt RNG, jedoch zentralisiert und auditierbar.

## 1) Zentraler RNG
- Typ: `numpy.random.Generator` mit `PCG64`
- Anlage: bei `SimulationManager.reset_model(seed: Optional[int])`
  - `seed`: optionaler Parameter des Reset-API-Payloads; falls `None`, generiert (`np.random.SeedSequence().entropy`)
  - Speicherung: `model.run_seed: int`, `model.rng: np.random.Generator`
  - Optional: auch `python random` spiegeln (`random.seed(run_seed)`) bis alle Stellen auf `rng` umgestellt sind

Injection-Stellen im Lauf:
- `PoliticalModel` erhält `rng` im Konstruktor und reicht ihn weiter an:
  - `AgentInitializer`, `ResourceManager`, `MediaManager`, `HazardManager`
  - Utility: `generate_attribute_value(config, rng)`

## 2) Konkrete Umstellungen je Fundstelle

Formel-nahe (RNG → Input der Formel):
- `agents.decide_and_act(ersparnis, params)`
  - Neu: `decide_and_act(ersparnis, params, investment_success_u: float)`
  - Quelle: `investment_success_u = model.rng.random()` (in `SimulationCycle` Phase 4)
  - Alternative: `investment_success: bool = (rng.random() < p_success)` und Formel nur deterministisch anwenden

Ereignis-/Auswahl-RNG (bleibt RNG, aber zentralisiert):
- `hazard_manager.trigger_events`
  - Ersetzen: `random.random()` → `model.rng.random()`
  - Optional: Für Tests deterministisch einspeisbar via vorbereiteter Bernoulli-Liste
- `media_manager.select_source_for_agent`
  - Ersetzen: `random.choices(population, weights)` → `model.rng.choice(population, p=normalized_weights)`
- `agent_initializer.create_agents`
  - `random.choices`/`random.choice`/`random.uniform`/`random.randint` → `rng.choice`/`rng.uniform`/`rng.integers`
- `utils.generate_attribute_value`
  - Signatur: `generate_attribute_value(config, rng)`
  - `np.random.*` → `rng.beta|uniform|normal|lognormal|pareto|random` (für `uniform_int` → `rng.integers`)
- `resource_manager.update_agent_resources`
  - Aufruf von `generate_attribute_value` mit `rng`

## 3) Benennung & Typ der neuen Formel-Inputs
- `investment_success_u: float ∈ [0,1]` (oder `investment_success: bool`)
- Platzhalter für künftige Formeln mit Noise:
  - `gaussian_noise: float ~ N(0,1)`
  - `logit_noise: float ~ Logistic(0, s)`
  - `hazard_noise: float` (nur falls man Hazard in Formel statt Ereignis führen will — aktuell nicht geplant)

## 4) Reproduzierbarkeit
- Seed-Handling pro Run
  - `POST /api/simulation/reset` akzeptiert optional `seed: int`
  - Bei Reset generiert oder übernimmt Seed, initialisiert `model.rng`
  - Speichere im Run-Report (Teil von `get_model_report()`):
    - `run_info`: `{ seed, bit_generator: 'PCG64', created_at }`
- Auditierbarkeit
  - Logge `seed` und ggf. `SeedSequence.spawn_key` in `backend/backend.log` oder vergleichbarer Audit-Struktur
  - Optionale Endpoint-Erweiterung: `GET /api/simulation/run_info`

## 5) Migrationsschritte (inkrementell)
1. Core-Infrastruktur
   - `SimulationManager.reset_model(seed?)-> PoliticalModel(rng)`
   - `model.run_seed`, `model.rng` setzen; python `random.seed(run_seed)`
2. Services/Utils auf `rng` umstellen
   - `HazardManager`, `MediaManager`, `AgentInitializer`, `generate_attribute_value`, `ResourceManager`
3. Formel-API anpassen
   - `PoliticalAgent.decide_and_act(..., investment_success_u)`
   - `SimulationCycle` erzeugt pro Agent den Draw und übergibt ihn
4. Tests & Repro
   - Golden-Run mit festem Seed; identische Metriken (±Tol); Profiling unverändert (±10%)
5. Aufräumen
   - Entferne verbleibende `random.*`/`np.random.*`-Direktaufrufe in Backend-Code

## 6) Was bleibt bewusst RNG (nicht in Formeln)
- Medienquellen-Auswahl (Stichprobe), Hazard-Trigger (Ereignis), Initialisierungs-Sampling (Attribute, Position, Milieu, Biome)
- Begründung: Es sind Auswahl-/Ereignismechaniken, keine deterministischen Berechnungsformeln

## 7) Akzeptanzkriterien (für diesen Plan)
- Alle RNG-Stellen tabellarisch erfasst (siehe Audit)
- Für jede formelnahe RNG-Stelle existiert ein klarer Input-Vorschlag (oben)
- Seed-Strategie pro Run beschrieben und in API/Report verankert

