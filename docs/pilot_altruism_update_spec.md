# Pilot-Formel: altruism_update — Variableschema und Tests

Ziel: Präzises Eingabemodell und Tests für die Migration der Lernformel aus `agents.py:learn`.

Formel (aus Code extrahiert, in Pure-Form umbenannt):
- Gegeben:
  - `delta_trad = delta_u_sozial - delta_u_ego`
  - `s_env = (altruism_target_crisis - prev_altruism) * (1 - env_health / biome_capacity)`
  - `L_signal = delta_trad + crisis_weighting_beta * s_env`
  - `eta = max_learning_rate_eta_max / (1 + education_dampening_k * bildung)`
  - `new_altruism = clip(prev_altruism + eta * L_signal, 0.0, 1.0)`

## Inputs
- prev_altruism: float, Range [0,1], Default none, Clip output to [0,1]
- bildung: float, Range [0,1], Default none
- delta_u_ego: float, Range unbounded (empf. [-1e6, 1e6]), Default 0.0
- delta_u_sozial: float, Range unbounded (empf. [-1e6, 1e6]), Default 0.0
- env_health: float, Range [0, +inf), Default none
- biome_capacity: float, Range (0, +inf), Default none (muss >0 sein)
- Params (Learning):
  - altruism_target_crisis: float, Range [0,1], Default 0.7
  - crisis_weighting_beta: float, Range [0, +inf), Default 0.5
  - max_learning_rate_eta_max: float, Range [0, +inf), Default 0.2
  - education_dampening_k: float, Range [0, +inf), Default 1.0

## Clipping-Regeln
- Endwert wird hart auf [0.0, 1.0] geclippt: `Min(Max(value, 0.0), 1.0)`
- Division by zero vermeiden: `biome_capacity > 0`. Optional: Verhältnis `env_health/biome_capacity` auf [0, +inf) begrenzt; kein Clip innerhalb der Formel erforderlich.

## Whitelist-Funktionen
- +, -, *, /
- Min, Max (für Clip)

## Golden-Tests (Default-Params sofern nicht angegeben)
1) Baseline (nur Umweltterm positiv):
   - Inputs: prev=0.4, bildung=0.5, d_ego=0.0, d_sozial=0.0, env=50, cap=100
   - Params: eta_max=0.2, k=1.0, beta=0.5, target=0.7
   - Erwartet: new=0.41 (Toleranz 1e-9)
2) Negatives soziales Delta dominiert:
   - prev=0.4, b=0.5, d_ego=0.0, d_sozial=-0.2, env=50, cap=100 → new≈0.3833333333
3) Oberes Clipping:
   - prev=0.95, b=0.0, d_ego=0.1, d_sozial=0.3, env=0, cap=100, params: eta_max=0.5, k=0.0, beta=2.0, target=1.0 → new=1.0
4) Unteres Clipping:
   - prev=0.05, b=0.0, d_ego=1.0, d_sozial=0.0, any env/cap, params: eta_max=1.0, k=0.0, beta=0.0 → new=0.0
5) Null-Update bei Nullsignal (env_health=capacity und delta_u_ego=delta_u_sozial):
   - prev=0.3, b=0.7, d_ego=0.0, d_sozial=0.0, env=100, cap=100 → new=0.3
6) Bildungs-Dämpfung reduziert Anpassung (gleiche L_signal):
   - Case A: prev=0.4, b=0.0 → new=0.415; Case B: prev=0.4, b=1.0 → new=0.4075 (A > B)
   - Gemeinsame Inputs: d_ego=0.0, d_sozial=0.0, env=50, cap=100; params default
7) Negativer Umweltterm (env_health > capacity) senkt Altruismus:
   - prev=0.6, b=0.5, d_ego=0.0, d_sozial=0.0, env=120, cap=100, params default mit beta=1.0 → new≈0.5973333333
8) Positives soziales Delta ohne Umweltterm:
   - prev=0.2, b=0.0, d_ego=-0.05, d_sozial=0.1, env=100, cap=100, params default → new=0.23

## Property-Tests
- Output-Range: `new_altruism ∈ [0,1]` für alle gültigen Inputs
- Nullsignal: Wenn `delta_u_sozial == delta_u_ego` und `(altruism_target_crisis == prev_altruism oder env_health == biome_capacity)`, dann `new_altruism == prev_altruism`
- Monotonie (delta_u_ego): Für fixe andere Inputs ist `new_altruism` monoton fallend in `delta_u_ego`
- Monotonie (delta_u_sozial): Für fixe andere Inputs ist `new_altruism` monoton steigend in `delta_u_sozial`
- Bildungs-Dämpfung: Für fixes `L_signal` gilt `|new - prev|` monoton fallend in `bildung`

## Batch-Fähigkeit
- Die Formel ist elementweise definierbar und vektorisierbar.
- Alle Skalar-Inputs können durch NumPy-Arrays gleicher Länge ersetzt werden; Broadcasting nach NumPy-Regeln möglich.
- Lambdify mit `modules=['numpy']` erzeugt eine Vektorversion; Clipping via `numpy.minimum/maximum`.

