# Migrationssequenz für weitere Formeln (nach Pilot: altruism_update)

Ziel: Nach dem Pilot „altruism_update“ (learn) weitere Formeln strukturiert in die Registry überführen. Bewertet nach Eignung, Aufwand und Risiken; inkl. Testempfehlungen.

## Hotspots-Tabelle (Bewertung)

Legende: Determ.=deterministisch, RNG=Zufallsnähe, SE=Seiteneffekte, Eignung=[sofort | mit RNG-Abtrennung | belassen], Aufwand=[S/M/L]

| Name | Datei:Zeile | Signatur (Inputs) | Determ. | RNG | SE | Eignung | Aufwand | Hinweise/Abhängigkeiten | Test-Skizze |
|---|---|---|---:|---:|---:|---|---|---|---|
| altruism_update (Pilot) | political_abm/agents.py:60 | prev_altruism, bildung, delta_u_ego, delta_u_sozial, env_health, biome_capacity, params | Ja | Nein | Ja (altruism) | sofort | S | Spec/Schema/Tests vorhanden | Golden + Range, Nullsignal, Monotonie (±delta), Dämpfung |
| consumption_rate | managers/resource_manager.py:12 | base_rate, zeitpräferenz, risikoaversion, params | Ja | Nein | Ja (wealth, tracking) | sofort | S | Clip [0,1]; rein lokal | Golden + Range [0,1], Monotonie in Zeitpräferenz/Risiko |
| risk_aversion | political_abm/agent_initializer.py:calc + agents.py:111 | vermoegen, wealth_sensitivity | Ja | Nein | Ja (risikoaversion) | sofort | S | Formeln konsistent halten (Init + Update) | Monoton fallend in Vermögen; Range [0,1] |
| cognitive_capacity_penalty | agents.py:111 | vermoegen, wealth_threshold, max_penalty, base_capacity | Ja | Nein | Ja (effektive Kapazität) | sofort | S | Min/Max Clamp [0,1] | Range [0,1], Monotonie (Penalty ↑ bei weniger Vermögen) |
| investment_amount | agents.py:22 | ersparnis, risikoaversion, zeitpräferenz, params | Ja | Grenzfall | Nein | mit RNG-Abtrennung | M | Trenne Erfolg (Bernoulli) vom Betrag; Betrag als Formel | Monotonie in ersparnis (↑), Risiko/TimePref (↓); Range ≥0 |
| investment_outcome | agents.py:22 | investment_amount, investment_return_factor, success (bool) | Ja | RNG‑nah (Input) | Ja (wealth) | mit RNG-Abtrennung | S | Erfolg als Input (`success`/`u∈[0,1]`) | Zwei Pfade (success/fail), Idempotenz |
| media_influence_update | agents.py:87 | freedom_pref, source_axis, bildung, eff_kogn_kap, params | Ja | Nein | Ja (freedom_pref) | sofort | S | Clip [0,1], lineare Mischung | Range [0,1], Monotonie Richtung Ziel |
| political_position | political_abm/types.py:54 | vermoegen, altruism, freedom_pref | Ja | Nein | Nein | sofort | S | Normierungsformel + Clip | Range [-1,1] je Achse, Monotonie in Inputs |
| hazard_prob_next | simulation_cycle.py:135 | base_hazard, total_investment, sensitivity | Ja | Nein | Ja (model.effective_) | sofort | S | Clip [0,1] | Range [0,1], Monotonie in Investment/sensitivity |
| regen_rate_next | simulation_cycle.py:135 | base_regen, mean_altruism, resilience_factor | Ja | Nein | Ja (model.effective_) | sofort | S | Non‑negativ | ≥0, Monotonie in mean_altruism |
| media_source_weight | managers/media_manager.py:20 | agent_pos, source_pos | Ja | RNG‑nah (Auswahl folgt) | Nein | belassen | — | Kern ist Auswahl‑Logik (RNG); Formel optional als Hilfsfunktion | — |
| hazard_trigger | managers/hazard_manager.py:25 | hazard_prob, u∈[0,1] | Ja | RNG | Ja (wealth/income) | belassen | — | Ereignis, nicht Formel | — |
| gini | political_abm/model.py:25 | x: List[float] | Ja | Nein | Nein | belassen | M | O(n^2), ggf. Optimierung separat | Golden + Vergleichsvektoren, Props: 0≤gini≤1 |
| income_sampling | utils.generate_attribute_value | dist-config | Nein | RNG | Ja (state init/update) | belassen | — | Sampling, nicht Formel | — |

## Migrationsreihenfolge (empfohlen)
1) Konsum/Konto: `consumption_rate` (S)
   - Geringes Risiko, rein deterministisch, häufig aufgerufen; unmittelbarer Nutzen für Registry‑Pfad.
2) Risiko/Capacity: `risk_aversion` + `cognitive_capacity_penalty` (S)
   - Saubere Entkopplung von State‑Ableitungen; Tests einfach.
3) Medienlernen: `media_influence_update` (S)
   - Deterministisch, Clip; UI‑relevante Parameter.
4) Investitionslogik (deterministischer Teil): `investment_amount` + `investment_outcome` (mit RNG‑Abtrennung) (M)
   - Voraussetzung: RNG‑Zentralisierung aktiv; Erfolg als Input.
5) Umweltfeedback: `hazard_prob_next` + `regen_rate_next` (S)
   - Deterministisch; sorgt für Transparenz in Systemkopplungen.
6) Position: `political_position` (S)
   - Geringes Risiko; erleichtert Vergleichbarkeit/Viz‑Stabilität.

Nicht migrieren (vorerst belassen):
- `media_source_weight` (als Teil der Auswahl; optional als Helper, kein Registry‑Zwang)
- `hazard_trigger`, `income_sampling` (Ereignis/Sampling), `gini` (Aggregator; ggf. Performance‑Optimierung separat)

## Test‑Spezifikationen je Formeltyp
- Bounded/Clip‑Formeln (altruism_update, consumption_rate, media_influence_update, hazard_prob_next):
  - Golden: repräsentative Inputs, exakte Erwartungswerte
  - Properties: Output in [Range], Monotonien, Nullsignal‑Fälle, Parameter‑Sensitivitäten
- Monoton‑Dämpfer (risk_aversion, cognitive_capacity_penalty):
  - Golden: 2–3 Wertepaare (niedrig/hoch)
  - Properties: monotone Abhängigkeit, Range [0,1]
- Investitionslogik (investment_amount/outcome):
  - Golden: deterministische Pfade (success/fail) über `success` Input
  - Properties: Betrag monoton in `ersparnis`, Outcome piecewise korrekt; kein negativer Betrag; Clip falls spezifiziert
- Umweltfeedback (regen/hazard):
  - Golden: Basiswerte + Kantenfälle (0,1)
  - Properties: Monotonien, Clip/Nichtnegativität, Sensitivitätsskalen
- Position (political_position):
  - Golden: definierte States, erwartete Achsen
  - Properties: Range [-1,1], Monotonie: Achsenverhalten bei Einzelinput‑Variation

## Risiken & Abhängigkeiten
- RNG‑Abhängigkeit: `investment_*` erfordert RNG‑Zentralisierung und neuen Input (success/Uniform u).
- Seiteneffekte: State‑Updates bleiben außerhalb der Registry; Registry‑Formeln liefern reine Outputs.
- Performance: Viele Agentenaufrufe → Registry muss gecacht und (wo möglich) vektorisiert sein; evaluieren mit Telemetrie.
- Konsistenz: `risk_aversion` in Initializer und Update sollten konsistent sein (eine Formelquelle).
- Governance: Jede neue Formel benötigt Spec (Schema/Tests), Review/Release und Pinning, bevor sie produktiv geschaltet wird.

## Aufwandsschätzung (aggregiert)
- Schritt 1–3: klein (S je Formel), ca. 1–2 PT gesamt inkl. Tests/Docs
- Schritt 4: mittel (M), ca. 1–2 PT (RNG‑Input + Tests + Wiring)
- Schritt 5–6: klein (S), ca. 1 PT gesamt

## Akzeptanzkriterien (für diesen Plan)
- Alle relevanten Hotspots aufgeführt und bewertet
- Migrationsreihenfolge mit Begründung
- Testarten pro Formeltyp skizziert
- Risiken/Abhängigkeiten transparent
