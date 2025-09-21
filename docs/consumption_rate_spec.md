Formel: consumption_rate — Variableschema und Tests

Formel (deterministisch, geclippt auf [0,1]):

consumption_rate = Min(Max(
  base_consumption_rate
  + (zeitpraeferenzrate - 0.5) * zeitpraeferenz_sensitivity
  + (risikoaversion - 0.5) * risikoaversion_sensitivity,
  0.0), 1.0)

Inputs
- zeitpraeferenzrate: float in [0,1]
- risikoaversion: float in [0,1]
- base_consumption_rate: float in [0,1]
- zeitpraeferenz_sensitivity: float (>=0)
- risikoaversion_sensitivity: float (>=0)

Whitelist-Funktionen: +, -, *, Min, Max

Tests (Golden + Properties)
- Golden: Baseline mit prefs=risks=0.5 → Ergebnis = base_consumption_rate
- Golden: Clip oben/unten
- Property: Range [0,1]; Monoton steigend in zeitpraeferenzrate und risikoaversion
