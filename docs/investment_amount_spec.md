Formel: investment_amount — Variableschema und Tests

Formel (deterministisch, nichtnegativ):

final_investment = Max( ersparnis * max_investment_rate * (1 - risikoaversion) * (1 - zeitpraeferenzrate), 0.0 )

Inputs
- ersparnis: float ≥ 0
- risikoaversion: float in [0,1]
- zeitpraeferenzrate: float in [0,1]
- max_investment_rate: float in [0,1]

Whitelist-Funktionen: +, -, *, Max

Tests
- Golden: ersparnis=100, max_rate=0.5, risiko=0.2, zeit=0.3 → 100*0.5*0.8*0.7 = 28.0
- Property: Monoton fallend in risiko/zeit; steigend in ersparnis/max_rate

