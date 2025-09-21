Formel: investment_outcome — Variableschema und Tests

Formel (deterministisch, Erfolg per Indikator):

gain = investment_amount * ( success_indicator * (investment_return_factor + 1) - 1 )

Inputs
- investment_amount: float ≥ 0
- investment_return_factor: float ≥ 0
- success_indicator: number ∈ {0,1}

Whitelist-Funktionen: +, -, *

Tests
- Golden: amount=10, factor=0.2, success=1 → gain=2
- Golden: amount=10, factor=0.2, success=0 → gain=-10
