# ABM² Model Variablen und Formeln - Vollständige Dokumentation v4.0

**Aktualisiert**: 2025-08-23  
**Quelle**: Direkt aus dem verwendeten Code extrahiert  
**Status**: Single Source of Truth für weitere Entwicklungen

---

## 1. Agent-Zustandsvariablen (AgentState)

### 1.1 Demografische Eigenschaften
| Variable | Typ | Wertebereich | Initialisierung | Beschreibung |
|----------|-----|--------------|----------------|---------------|
| `alter` | `int` | 18-90 | Milieu-spezifisch | Alter des Agenten in Jahren |
| `region` | `str` | Biome-Name | Bei Initialisierung zugewiesen | Zugehörige Biome-Region |
| `position` | `Tuple[float, float]` | (0-100, 0-100) | Automatisch in Biome-Grenzen | Geografische Position im Simulationsraum |

### 1.2 Wirtschaftliche Ressourcen
| Variable | Typ | Wertebereich | Berechnung/Update | Beschreibung |
|----------|-----|--------------|-------------------|---------------|
| `einkommen` | `float` | ≥ 0 | Phase 2 (aus Biome-Verteilung) | Aktuelles Einkommen pro Schritt |
| `vermoegen` | `float` | ±∞ | Phase 2 + 4 (Ersparnisse + Investment) | Akkumuliertes Vermögen/Schulden |
| `sozialleistungen` | `float` | ≥ 0 | Phase 2 (Median × Niveau) | Erhaltene Sozialleistungen |
| `konsumquote` | `float` | 0.0-1.0 | Phase 2 (verhaltensbasiert) | Prozentanteil des konsumierten Einkommens |
| `ersparnis` | `float` | ±∞ | Phase 2 (Einkommen - Konsum) | Ersparnisse des aktuellen Schritts |

### 1.3 Kognitive Kapazitäten
| Variable | Typ | Wertebereich | Update-Mechanismus | Beschreibung |
|----------|-----|--------------|-------------------|---------------|
| `bildung` | `float` | 0.0-1.0 | Statisch (Milieu-Init) | Bildungsniveau |
| `kognitive_kapazitaet_basis` | `float` | 0.0-1.0 | Statisch (Milieu-Init) | Unveränderliche Basis-Kognition |
| `effektive_kognitive_kapazitaet` | `float` | 0.0-1.0 | Phase 7 (Armuts-Penalty) | Dynamische, stressreduzierte Kognition |

### 1.4 Präferenzen und Einstellungen
| Variable | Typ | Wertebereich | Update-Mechanismus | Beschreibung |
|----------|-----|--------------|-------------------|---------------|
| `freedom_preference` | `float` | 0.0-1.0 | Phase 5 (Medienlernen) | Freiheitspräferenz (0=autoritär, 1=libertär) |
| `altruism_factor` | `float` | 0.0-1.0 | Phase 6 (Sozio-ökolog. Lernen) | Altruismus-Faktor (0=egoistisch, 1=altruistisch) |
| `risikoaversion` | `float` | 0.0-1.0 | Phase 7 (vermögensabhängig) | Risikoaversion (dynamisch berechnet) |
| `zeitpraeferenzrate` | `float` | 0.0-1.0 | Statisch (Standard: 0.05) | Zeitpräferenz (0=langfristig, 1=kurzfristig) |

### 1.5 Politische und Soziale Eigenschaften
| Variable | Typ | Wertebereich | Update | Beschreibung |
|----------|-----|--------------|--------|---------------|
| `politische_wirksamkeit` | `float` | 0.0-1.0 | Statisch (0.5) | Gefühl der politischen Einflussnahme |
| `sozialkapital` | `float` | 0.0-1.0 | Statisch (aus Verträglichkeit) | Soziale Verbindungen und Netzwerke |

### 1.6 Klassifizierung und Tracking
| Variable | Typ | Wertebereich | Update | Beschreibung |
|----------|-----|--------------|--------|---------------|
| `initial_milieu` | `str` | Milieu-Name | Statisch | Ursprüngliches Milieu bei Initialisierung |
| `schablone` | `str` | Template-Name | Phase 8 (politische Position) | Aktuelle Template-Klassifizierung |

---

## 2. Biome-Konfiguration (BiomeConfig)

### 2.1 Aktuelle Biome-Parameter
| Biome | Population% | Kapazität | Initial-Qualität | Regeneration |
|-------|-------------|-----------|------------------|--------------|
| **Prosperous Metropolis** | 50.0% | 1500.0 | 1350.0 | 15.0 |
| **Industrial Zone** | 25.0% | 800.0 | 320.0 | 8.0 |
| **Fertile Farmland** | 12.5% | 1200.0 | 840.0 | 60.0 |
| **New Biome 4** | 12.5% | 900.0 | 450.0 | 20.0 |

### 2.2 Wirtschaftliche Verteilungen
| Biome | Einkommen (Lognormal) | Vermögen (Pareto) | Sozialleistungen |
|-------|----------------------|-------------------|------------------|
| **Prosperous Metropolis** | μ=10.5, σ=0.6 | α=1.5 | 15% |
| **Industrial Zone** | μ=10.0, σ=0.5 | α=2.0 | 25% |
| **Fertile Farmland** | μ=9.8, σ=0.4 | α=2.5 | 20% |
| **New Biome 4** | μ=10.0, σ=0.5 | α=2.0 | 20% |

### 2.3 Hazard- und Umweltparameter
| Biome | Hazard-Prob. | Impact-Factor | Env. Sensitivity | Produktivität |
|-------|--------------|---------------|------------------|---------------|
| **Prosperous Metropolis** | 0.01 | 0.2 | 1.0×10⁻⁶ | 1.2 |
| **Industrial Zone** | 0.05 | 0.4 | 5.0×10⁻⁶ | 1.0 |
| **Fertile Farmland** | 0.03 | 0.6 | 3.0×10⁻⁶ | 0.8 |
| **New Biome 4** | 0.02 | 0.3 | 2.0×10⁻⁶ | 0.9 |

### 2.4 Verhaltensökonomische Schwellen
| Biome | Knappheits-Schwelle | Risiko-Vermögen-Schwelle |
|-------|--------------------|-----------------------|
| **Prosperous Metropolis** | 10,000 | 7,500 |
| **Industrial Zone** | 7,500 | 5,000 |
| **Fertile Farmland** | 5,000 | 3,000 |
| **New Biome 4** | 6,000 | 4,000 |

---

## 3. Globale Simulationsparameter

### 3.1 Lern- und Anpassungsparameter
```yaml
altruism_target_crisis: 0.7           # Ziel-Altruismus bei Umweltkrisen
crisis_weighting_beta: 1.5            # Gewichtung Umwelt-Stress im Lernsignal
max_learning_rate_eta_max: 0.1        # Maximale Lernrate
education_dampening_k: 5.0            # Bildungsdämpfung der Lernrate
```

### 3.2 Verhaltensökonomische Parameter
```yaml
base_consumption_rate: 0.8            # Basis-Konsumquote (80%)
zeitpraeferenz_sensitivity: 0.3       # Einfluss Zeitpräferenz auf Konsum
risikoaversion_sensitivity: -0.1      # Einfluss Risikoaversion auf Konsum (negativ)
max_investment_rate: 0.5              # Max. 50% der Ersparnisse investierbar
investment_return_factor: 2.5         # 250% Gewinn bei erfolgreichem Investment
investment_success_probability: 0.5   # 50% Erfolgswahrscheinlichkeit
```

### 3.3 Psychologische Kopplung
```yaml
wealth_threshold_cognitive_stress: 5000.0   # Armutsschwelle für kognitive Beeinträchtigung
max_cognitive_penalty: 0.5                  # Max. 50% Kognitions-Reduktion
wealth_sensitivity_factor: 10000.0          # Vermögens-Sensitivitätsfaktor
```

### 3.4 Medieneinfluss
```yaml
media_influence_factor: 0.05                # Basis-Medieneinfluss (5%)
cognitive_moderator_education_weight: 0.5   # Bildungsgewichtung
cognitive_moderator_capacity_weight: 0.5    # Kognitionsgewichtung
```

### 3.5 Umwelt-Feedback
```yaml
environmental_capacity: 1000.0              # Globale Umweltkapazität
resilience_bonus_factor: 0.5               # Altruismus → Regeneration Multiplikator
```

---

## 4. Mathematische Formeln

### 4.1 Konsum- und Sparverhalten
```python
# Individuelle Konsumquote-Berechnung
konsumquote = np.clip(
    base_consumption_rate + 
    (zeitpraeferenzrate - 0.5) * zeitpraeferenz_sensitivity + 
    (risikoaversion - 0.5) * risikoaversion_sensitivity,
    0.0, 1.0
)

# Finanzielle Transaktionen
konsumierter_betrag = einkommen * konsumquote
ersparnis = einkommen - konsumierter_betrag
vermoegen_neu = vermoegen_alt + ersparnis
```

### 4.2 Investment-Entscheidung
```python
# Investment basiert auf Ersparnissen
potential_investment = ersparnis * max_investment_rate
risk_adjusted_investment = potential_investment * (1 - risikoaversion)
final_investment = risk_adjusted_investment * (1 - zeitpraeferenzrate)

# Investment-Outcome
if random.random() < investment_success_probability:
    investment_gain = final_investment * investment_return_factor
else:
    investment_gain = -final_investment  # Totalverlust

vermoegen += investment_gain
```

### 4.3 Politische Position
```python
# Economic Axis: Pro-Redistribution (-1) bis Pro-Market (1)
norm_vermoegen = (vermoegen / (vermoegen + 10000)) * 2 - 1
a_i = np.clip(norm_vermoegen - (altruism_factor * 0.5), -1.0, 1.0)

# Social Axis: Authoritarian (-1) bis Libertarian (1)
b_i = np.clip((2.0 * freedom_preference) - 1.0, -1.0, 1.0)

political_position = (a_i, b_i)
```

### 4.4 Psychologische Zustandsupdate
```python
# Effektive Kognitive Kapazität (Armuts-Penalty)
if vermoegen < wealth_threshold_cognitive_stress:
    penalty_factor = (wealth_threshold_cognitive_stress - vermoegen) / wealth_threshold_cognitive_stress
    penalty = max_cognitive_penalty * penalty_factor
    effektive_kognitive_kapazitaet = kognitive_kapazitaet_basis * (1 - penalty)
else:
    effektive_kognitive_kapazitaet = kognitive_kapazitaet_basis

effektive_kognitive_kapazitaet = np.clip(effektive_kognitive_kapazitaet, 0.0, 1.0)

# Dynamische Risikoaversion (Vermögensabhängig)
risikoaversion = np.clip(1 / (1 + (vermoegen / wealth_sensitivity_factor)), 0.0, 1.0)
```

### 4.5 Medienlernen
```python
# Kognitive Moderation der Lernrate
cognitive_moderator = 1 - (bildung * cognitive_moderator_education_weight + 
                          effektive_kognitive_kapazitaet * cognitive_moderator_capacity_weight)
base_learning_rate = media_influence_factor * cognitive_moderator

# Medienquelle-Auswahl nach ideologischer Nähe
agent_pos = calculate_political_position()
for source in media_sources:
    source_pos = (source.economic_axis, source.social_axis)
    distance = np.linalg.norm(np.array(agent_pos) - np.array(source_pos))
    
weights = [1 / (distance + 0.1) for distance in distances]
probabilities = [w / sum(weights) for w in weights]
selected_source = random.choices(media_sources, weights=probabilities)[0]

# Freedom Preference Update
target_freedom_preference = (selected_source.social_axis + 1) / 2.0
adjustment = (target_freedom_preference - freedom_preference) * base_learning_rate
freedom_preference = np.clip(freedom_preference + adjustment, 0.0, 1.0)
```

### 4.6 Sozio-Ökologisches Lernen
```python
# Lernsignal-Berechnung
delta_trad = delta_u_sozial - delta_u_ego  # Soziales vs. persönliches Signal
s_env = (altruism_target_crisis - altruism_factor) * (1 - env_health / biome_capacity)
L_signal = delta_trad + crisis_weighting_beta * s_env

# Bildungsabhängige Lernrate
eta = max_learning_rate_eta_max / (1.0 + education_dampening_k * bildung)

# Altruismus-Update
adjustment = eta * L_signal
altruism_factor = np.clip(altruism_factor + adjustment, 0.0, 1.0)
```

### 4.7 Umwelt-Feedback-System
```python
# Direkte Auswirkung: Investment → Hazard-Risiko
for biome in biomes:
    total_investment = sum(investments_in_biome)
    new_hazard_prob = (base_hazard_probability + 
                      total_investment * environmental_sensitivity)
    effective_hazard_probabilities[biome] = np.clip(new_hazard_prob, 0, 1)

# Indirekte Auswirkung: Altruismus → Regeneration
    mean_altruism = np.mean(altruism_values_in_biome)
    resilience_mod = (mean_altruism - 0.5) * resilience_bonus_factor
    new_regen_rate = base_regeneration_rate * (1 + resilience_mod)
    effective_regeneration_rates[biome] = max(0, new_regen_rate)
```

### 4.8 Hazard-Event-Mechanik
```python
for agent in agents:
    hazard_prob = effective_hazard_probabilities[agent.region]
    if random.random() < hazard_prob:
        impact_factor = biome.hazard_impact_factor
        wealth_loss = agent.vermoegen * impact_factor
        income_loss = agent.einkommen * impact_factor
        
        agent.vermoegen = max(0.0, agent.vermoegen - wealth_loss)
        agent.einkommen = max(0.0, agent.einkommen - income_loss)
```

### 4.9 Gini-Koeffizient
```python
def gini(x):
    x = np.array(x)
    x = x[x >= 0]  # Entferne negative Werte
    if len(x) == 0 or np.sum(x) == 0:
        return 0
    x = np.sort(x)
    
    total = 0
    for i, xi in enumerate(x[:-1], 1):
        total += np.sum(np.abs(xi - x[i:]))
    return total / (len(x)**2 * np.mean(x))
```

---

## 5. Verteilungskonfigurationen

### 5.1 Statistische Verteilungen
```python
def generate_attribute_value(config):
    if config.type == 'beta':
        return np.random.beta(config.alpha, config.beta)
    elif config.type == 'uniform_int':
        return random.randint(int(config.min), int(config.max))
    elif config.type == 'uniform_float':
        return np.random.uniform(config.min, config.max)
    elif config.type == 'normal':
        return np.clip(np.random.normal(config.mean, config.std_dev), 
                      config.min, config.max)
    elif config.type == 'lognormal':
        return np.random.lognormal(config.mean, config.std_dev)
    elif config.type == 'pareto':
        return (np.random.pareto(config.alpha) + 1) * 10000
```

### 5.2 Initial-Milieus (6 Milieus, je 16.67%)

#### Linksradikal (Farbe: #8B0000)
- **Alter**: 18-35 (uniform_int)
- **Altruismus**: Beta(8.0, 2.0) - Hoch altruistisch
- **Bildung**: Beta(4.0, 5.0) - Mäßig gebildet
- **Freiheitspräferenz**: Beta(2.0, 8.0) - Niedrig (autoritär)
- **Kognitive Kapazität**: Normal(0.6, 0.15)
- **Risikoaversion**: 0.1-0.4 (uniform_float) - Risikofreudig
- **Zeitpräferenz**: 0.6-0.9 (uniform_float) - Kurzfristig orientiert

#### Links (Farbe: #DC143C)
- **Alter**: 25-50 (uniform_int)
- **Altruismus**: Beta(7.0, 3.0) - Altruistisch
- **Bildung**: Beta(7.0, 3.0) - Gut gebildet
- **Freiheitspräferenz**: Beta(7.0, 3.0) - Hoch (libertär)
- **Kognitive Kapazität**: Normal(0.7, 0.15)
- **Risikoaversion**: 0.3-0.6 (uniform_float) - Mäßig risikoavers
- **Zeitpräferenz**: 0.4-0.7 (uniform_float) - Ausgewogen

#### Mitte (Farbe: #000000)
- **Alter**: 30-60 (uniform_int)
- **Altruismus**: Normal(0.5, 0.1) - Neutral
- **Bildung**: Normal(0.5, 0.15) - Durchschnittlich
- **Freiheitspräferenz**: Normal(0.5, 0.1) - Neutral
- **Kognitive Kapazität**: Normal(0.5, 0.15)
- **Risikoaversion**: 0.4-0.8 (uniform_float) - Risikoavers
- **Zeitpräferenz**: 0.2-0.5 (uniform_float) - Langfristig orientiert

#### Liberal (Farbe: #FFD700)
- **Alter**: 35-65 (uniform_int)
- **Altruismus**: Beta(3.0, 7.0) - Niedrig altruistisch
- **Bildung**: Beta(8.0, 2.0) - Sehr gut gebildet
- **Freiheitspräferenz**: Beta(8.0, 2.0) - Sehr hoch (libertär)
- **Kognitive Kapazität**: Normal(0.75, 0.15)
- **Risikoaversion**: 0.1-0.5 (uniform_float) - Risikofreudig
- **Zeitpräferenz**: 0.1-0.4 (uniform_float) - Langfristig orientiert

#### Rechts (Farbe: #0000FF)
- **Alter**: 40-70 (uniform_int)
- **Altruismus**: Beta(4.0, 6.0) - Niedrig altruistisch
- **Bildung**: Beta(3.0, 4.0) - Mäßig gebildet
- **Freiheitspräferenz**: Beta(3.0, 7.0) - Niedrig (autoritär)
- **Kognitive Kapazität**: Normal(0.45, 0.15)
- **Risikoaversion**: 0.6-0.9 (uniform_float) - Sehr risikoavers
- **Zeitpräferenz**: 0.2-0.5 (uniform_float) - Langfristig orientiert

#### Rechtsextrem (Farbe: #8B4513)
- **Alter**: 30-60 (uniform_int)
- **Altruismus**: Beta(2.0, 8.0) - Sehr niedrig altruistisch
- **Bildung**: Beta(2.0, 6.0) - Schlecht gebildet
- **Freiheitspräferenz**: Beta(2.0, 8.0) - Sehr niedrig (autoritär)
- **Kognitive Kapazität**: Normal(0.4, 0.15)
- **Risikoaversion**: 0.7-1.0 (uniform_float) - Extrem risikoavers
- **Zeitpräferenz**: 0.3-0.6 (uniform_float) - Kurzfristig orientiert

### 5.3 Medienquellen
| Quelle | Economic Axis | Social Axis | Ideologie |
|--------|---------------|-------------|-----------|
| **Progressive Outlet** | -0.7 | 0.8 | Links-Libertär |
| **Conservative Broadcast** | 0.6 | -0.4 | Rechts-Autoritär |
| **Centrist Newspaper** | 0.1 | 0.1 | Zentrist |

### 5.4 Output-Schablonen (Template-Klassifizierung)
| Schablone | Farbe | X-Min | X-Max | Y-Min | Y-Max | Beschreibung |
|-----------|--------|--------|--------|--------|--------|---------------|
| **Linksradikal** | #FF0000 | -1.0 | -0.6 | -0.4 | 1.0 | Extreme Linke |
| **Links** | #DC143C | -0.6 | -0.2 | -0.4 | 1.0 | Moderate Linke |
| **Mitte** | #000000 | -0.2 | 0.2 | -0.4 | 1.0 | Zentrum |
| **Liberal** | #FFD700 | 0.2 | 0.6 | -0.4 | 1.0 | Liberale |
| **Rechts** | #0000FF | 0.6 | 1.0 | -0.4 | 1.0 | Moderate Rechte |
| **Rechtsextrem** | #8B4513 | 0.8 | 1.0 | -1.0 | 0.0 | Extreme Rechte (autoritär) |

---

## 6. Simulationszyklus (9 Phasen)

### Phase 1: Seasonal Effects
- **Manager**: `SeasonalityManager.apply_seasonal_effects()`
- **Aktuell**: Minimal (Pass-through)
- **Zweck**: Saisonale/zyklische Umwelteffekte

### Phase 2: Resource Update & Consumption
- **Manager**: `ResourceManager.update_agent_resources()`
- **Berechnungen**:
  1. Einkommen aus Biome-Lognormal-Verteilungen
  2. Sozialleistungen = Median-Einkommen × Sozialleistungsniveau
  3. Konsumquote (verhaltensbasiert)
  4. Ersparnis = Einkommen - Konsum
  5. Vermögen += Ersparnis

### Phase 3: Hazard Events
- **Manager**: `HazardManager.trigger_events()`
- **Mechanik**: Zufällige Umweltereignisse basierend auf effektiven Hazard-Wahrscheinlichkeiten
- **Auswirkung**: Vermögens- und Einkommensverluste

### Phase 4: Agent Decision (Investment)
- **Method**: `PoliticalAgent.decide_and_act(ersparnis)`
- **Input**: Ersparnisse aus Phase 2
- **Output**: Investment-Betrag und -Ergebnis
- **Risiko**: 50% Chance auf 250% Gewinn, 50% Totalverlust

### Phase 5: Media Consumption & Learning
- **Manager**: `MediaManager.select_source_for_agent()`
- **Method**: `PoliticalAgent.learn_from_media()`
- **Mechanik**: Ideologische Nähe bestimmt Quellenauswahl
- **Update**: `freedom_preference` wird angepasst

### Phase 6: Learning & Evaluation (Sozio-Ökologisch)
- **Method**: `PoliticalAgent.learn()`
- **Input**: Delta eigener/sozialer Nutzen, Umweltgesundheit
- **Update**: `altruism_factor` basierend auf integriertem Lernsignal

### Phase 7: Psychological State Update
- **Method**: `PoliticalAgent.update_psychological_states()`
- **Updates**:
  - `effektive_kognitive_kapazitaet` (Armuts-Penalty)
  - `risikoaversion` (vermögensabhängig)

### Phase 8: Template Classification
- **Method**: `PoliticalModel._classify_agents_into_templates()`
- **Mechanik**: Politische Position → Output-Schablone-Zuordnung
- **Update**: `schablone`

### Phase 9: Environment Feedback
- **Method**: `PoliticalModel._update_environment_parameters()`
- **Berechnungen**:
  - Hazard-Wahrscheinlichkeiten += Investment × Environmental-Sensitivity
  - Regenerationsraten *= (1 + (Mean-Altruism - 0.5) × Resilience-Bonus)

---

## 7. Invarianten und Constraints

### 7.1 Mathematische Invarianten
- **Alle Präferenz-Variablen**: `[0.0, 1.0]`
- **Politische Position**: `[-1.0, 1.0]` für beide Achsen
- **Konsumquote**: `[0.0, 1.0]`
- **Wahrscheinlichkeiten**: `[0.0, 1.0]`

### 7.2 System-Constraints
- **Biome Population-Summe**: Genau 100%
- **Milieu-Proportionen-Summe**: Genau 1.0 (Auto-Normalisierung)
- **Agent-Anzahl**: Rundungsfehler werden automatisch korrigiert
- **Vermögen**: Kann negativ werden (Schulden-System)

### 7.3 Performance-Indikatoren
- **Gini-Koeffizient**: Ungleichheitsmessung für Vermögen/Einkommen
- **Template-Verteilung**: Politische Polarisation
- **Umwelt-Metriken**: Effektive Hazard-/Regenerationsraten
- **Wirtschafts-KPIs**: Durchschnittsvermoegen, -einkommen, -konsum

---

**Ende der Dokumentation v4.0**

*Dieses Dokument ist die definitive, aus dem Code extrahierte Single Source of Truth für alle Modellvariablen, Formeln und Parameter des ABM²-Systems. Alle Werte wurden direkt aus den aktuellen Konfigurationsdateien und dem Implementierungscode entnommen.*