# Konfigurations-Handbuch

## Überblick

ABM² verwendet YAML-Konfigurationsdateien zur Definition von Simulationsparametern, Agenten-Eigenschaften und Umgebungsbedingungen. Dieses Handbuch erklärt alle verfügbaren Konfigurationsoptionen mit besonderem Fokus auf die neuen Biome-basierten und Milieu-Systeme.

## Konfigurationsdateien

### Dateien-Übersicht

```
digital-lab/backend/political_abm/
├── config.yml              # Hauptkonfiguration (Biomes, Agent Dynamics, Simulation Parameters)
├── media_sources.yml        # Medienquellen mit ideologischen Positionen
├── initial_milieus.yml      # 6 politische Archetypen für Agent-Initialisierung
├── templates.yml            # Template-Bereiche für politische Kategorisierung
├── output_schablonen.yml    # Output-Templates für Klassifizierung
└── presets/                 # Preset-Verzeichnis für verschiedene Konfigurationen
    ├── milieus/
    │   ├── linksradikal.yml
    │   ├── links.yml
    │   ├── mitte.yml
    │   ├── liberal.yml
    │   ├── rechts.yml
    │   └── rechtsextrem.yml
    └── biomes/
        ├── urban.yml
        ├── rural.yml
        └── industrial.yml
```

## Hauptkonfiguration (config.yml)

### Biomes-Konfiguration (NEU)

```yaml
biomes:
  - name: "Prosperous Metropolis"
    population_percentage: 50.0  # NEUES FELD: Prozentanteil der Gesamtbevölkerung
    
    # Wirtschaftsverteilungen
    einkommen_verteilung:
      type: "lognormal"
      mean: 10.5
      std_dev: 0.6
    
    vermoegen_verteilung:
      type: "pareto"
      alpha: 1.5
    
    # Soziale Parameter
    sozialleistungs_niveau: 0.15  # Anteil des Median-Einkommens
    
    # Gefahren
    hazard_probability: 0.01      # Wahrscheinlichkeit pro Schritt
    hazard_impact_factor: 0.2     # Schadensfaktor bei Ereignis
    
    # Ökologische Parameter (NEU)
    capacity: 1500.0              # Maximale Umweltkapazität
    initial_quality: 1350.0       # Anfängliche Umweltqualität
    regeneration_rate: 15.0       # Erholungsrate pro Schritt
    produktivitaets_faktor: 1.2   # Einkommensmultiplikator
    
    # Verhaltensschwellen (NEU)
    knappheits_schwelle: 10000.0      # Vermögensschwelle für Knappheitseffekte
    risiko_vermoegen_schwelle: 7500.0 # Schwelle für risikobezogenes Verhalten

  - name: "Industrial Zone"
    population_percentage: 25.0
    einkommen_verteilung:
      type: "lognormal"
      mean: 10.0
      std_dev: 0.5
    vermoegen_verteilung:
      type: "pareto"
      alpha: 2.0
    sozialleistungs_niveau: 0.25
    hazard_probability: 0.05
    hazard_impact_factor: 0.4
    capacity: 800.0
    initial_quality: 320.0
    regeneration_rate: 8.0
    produktivitaets_faktor: 1.0
    knappheits_schwelle: 7500.0
    risiko_vermoegen_schwelle: 5000.0

  - name: "Fertile Farmland"
    population_percentage: 12.5
    einkommen_verteilung:
      type: "lognormal"
      mean: 9.8
      std_dev: 0.4
    vermoegen_verteilung:
      type: "pareto"
      alpha: 2.5
    sozialleistungs_niveau: 0.2
    hazard_probability: 0.03
    hazard_impact_factor: 0.6
    capacity: 1200.0
    initial_quality: 840.0
    regeneration_rate: 60.0
    produktivitaets_faktor: 0.8
    knappheits_schwelle: 5000.0
    risiko_vermoegen_schwelle: 3000.0

  - name: "Remote Area"
    population_percentage: 12.5
    einkommen_verteilung:
      type: "lognormal"
      mean: 10.0
      std_dev: 0.5
    vermoegen_verteilung:
      type: "pareto"
      alpha: 2.0
    sozialleistungs_niveau: 0.2
    hazard_probability: 0.02
    hazard_impact_factor: 0.3
    capacity: 900.0
    initial_quality: 450.0
    regeneration_rate: 20.0
    produktivitaets_faktor: 0.9
    knappheits_schwelle: 6000.0
    risiko_vermoegen_schwelle: 4000.0

# WICHTIG: population_percentage muss sich zu 100.0 summieren!
```

### Agent Dynamics

```yaml
agent_dynamics:
  extraction:
    max_factor: 0.002           # Maximaler Extraktionsfaktor
    sustainable_factor: 0.001   # Nachhaltiger Extraktionsfaktor
  
  learning:
    altruism_target_in_crisis: 0.7    # Ziel-Altruismus während Krisen
    crisis_signal_weight: 0.5         # Gewichtung von Krisensignalen
    eta_max: 0.01                     # Maximale Lernrate
    k_bildung: 5                      # Bildungsparameter für Lernrate
```

### Simulation Parameters

```yaml
simulation_parameters:
  environmental_capacity: 1000.0     # Globale Umweltkapazität
  media_influence_factor: 0.05       # Medieneinfluss-Faktor
```

### Agent Initialization (Fallback-Parameter)

```yaml
agent_initialization:
  # Diese Parameter werden nur verwendet wenn kein Milieu-System aktiv ist
  bildung:
    type: "beta"
    alpha: 4.0
    beta: 2.0
  
  alter:
    type: "uniform_int"
    min: 18
    max: 80
  
  kognitive_kapazitaet:
    type: "normal"
    mean: 0.7
    std_dev: 0.15
  
  vertraeglichkeit:
    type: "beta"
    alpha: 3.5
    beta: 2.0
  
  freedom_preference:
    type: "normal"
    mean: 0.6
    std_dev: 0.2
  
  altruism_factor:
    type: "normal"
    mean: 0.55
    std_dev: 0.18
```

## Initial Milieus (initial_milieus.yml)

### 6 Politische Archetypen

```yaml
# Linksradikale
- name: "Linksradikal"
  proportion: 0.1667  # 16.67% der Bevölkerung
  color: "#8B0000"    # Dunkelrot
  attribute_distributions:
    bildung:
      type: "beta"
      alpha: 4.0
      beta: 2.0
    alter:
      type: "uniform_int"
      min: 18
      max: 35
    kognitive_kapazitaet:
      type: "beta"
      alpha: 4.0
      beta: 2.5
    vertraeglichkeit:
      type: "beta"
      alpha: 4.5
      beta: 2.0
    freedom_preference:
      type: "beta"
      alpha: 5.0
      beta: 1.5
    altruism_factor:
      type: "beta"
      alpha: 5.0
      beta: 1.5

# Linke
- name: "Links"
  proportion: 0.1667
  color: "#DC143C"    # Rot
  attribute_distributions:
    bildung:
      type: "beta"
      alpha: 3.5
      beta: 2.5
    alter:
      type: "uniform_int"
      min: 25
      max: 55
    kognitive_kapazitaet:
      type: "beta"
      alpha: 3.5
      beta: 2.5
    vertraeglichkeit:
      type: "beta"
      alpha: 4.0
      beta: 2.5
    freedom_preference:
      type: "beta"
      alpha: 4.0
      beta: 2.0
    altruism_factor:
      type: "beta"
      alpha: 4.0
      beta: 2.0

# Mitte
- name: "Mitte"
  proportion: 0.1667
  color: "#000000"    # Schwarz
  attribute_distributions:
    bildung:
      type: "beta"
      alpha: 3.0
      beta: 3.0
    alter:
      type: "uniform_int"
      min: 30
      max: 60
    kognitive_kapazitaet:
      type: "beta"
      alpha: 3.0
      beta: 3.0
    vertraeglichkeit:
      type: "beta"
      alpha: 3.5
      beta: 3.0
    freedom_preference:
      type: "beta"
      alpha: 3.0
      beta: 3.0
    altruism_factor:
      type: "beta"
      alpha: 3.0
      beta: 3.0

# Liberale
- name: "Liberal"
  proportion: 0.1667
  color: "#FFD700"    # Gelb
  attribute_distributions:
    bildung:
      type: "beta"
      alpha: 4.0
      beta: 2.5
    alter:
      type: "uniform_int"
      min: 25
      max: 50
    kognitive_kapazitaet:
      type: "beta"
      alpha: 4.0
      beta: 2.0
    vertraeglichkeit:
      type: "beta"
      alpha: 3.0
      beta: 3.5
    freedom_preference:
      type: "beta"
      alpha: 5.0
      beta: 1.5
    altruism_factor:
      type: "beta"
      alpha: 2.5
      beta: 3.5

# Rechte
- name: "Rechts"
  proportion: 0.1667
  color: "#0000FF"    # Blau
  attribute_distributions:
    bildung:
      type: "beta"
      alpha: 2.5
      beta: 3.5
    alter:
      type: "uniform_int"
      min: 35
      max: 70
    kognitive_kapazitaet:
      type: "beta"
      alpha: 3.0
      beta: 3.5
    vertraeglichkeit:
      type: "beta"
      alpha: 3.5
      beta: 3.5
    freedom_preference:
      type: "beta"
      alpha: 2.0
      beta: 4.0
    altruism_factor:
      type: "beta"
      alpha: 2.0
      beta: 4.0

# Rechtsextreme
- name: "Rechtsextrem"
  proportion: 0.1667
  color: "#8B4513"    # Braun
  attribute_distributions:
    bildung:
      type: "beta"
      alpha: 2.0
      beta: 4.0
    alter:
      type: "uniform_int"
      min: 25
      max: 65
    kognitive_kapazitaet:
      type: "beta"
      alpha: 2.5
      beta: 4.0
    vertraeglichkeit:
      type: "beta"
      alpha: 2.0
      beta: 5.0
    freedom_preference:
      type: "beta"
      alpha: 1.5
      beta: 5.0
    altruism_factor:
      type: "beta"
      alpha: 1.5
      beta: 5.0

# WICHTIG: Proportionen müssen sich zu 1.0 summieren!
```

## Medienquellen (media_sources.yml)

### Ideologische Positionierung

```yaml
# Liberal orientierte Medien
- name: "Progressive Media"
  ideological_position:
    economic_axis: -0.4    # Links (-1.0 bis 1.0)
    social_axis: 0.6       # Liberal (-1.0 bis 1.0)

# Mainstream Medien
- name: "Mainstream News"
  ideological_position:
    economic_axis: 0.1     # Leicht rechts
    social_axis: 0.2       # Leicht liberal

# Konservative Medien
- name: "Conservative Media"
  ideological_position:
    economic_axis: 0.5     # Rechts
    social_axis: -0.3      # Konservativ

# Alternative Medien
- name: "Alternative Sources"
  ideological_position:
    economic_axis: -0.6    # Links
    social_axis: 0.8       # Sehr liberal

# Populistische Medien
- name: "Populist Outlets"
  ideological_position:
    economic_axis: 0.2     # Variabel
    social_axis: -0.7      # Autoritär
```

## Templates (templates.yml)

### Politische Kategorisierung

```yaml
# Template-Bereiche für politische Klassifizierung
- name: "Left-Wing"
  x_min: -1.0      # Economic Axis Minimum
  x_max: -0.3      # Economic Axis Maximum
  y_min: -1.0      # Social Axis Minimum
  y_max: 1.0       # Social Axis Maximum
  color: "#ff6b6b" # Rot

- name: "Right-Wing"
  x_min: 0.3
  x_max: 1.0
  y_min: -1.0
  y_max: 1.0
  color: "#4dabf7"  # Blau

- name: "Libertarian"
  x_min: -1.0
  x_max: 1.0
  y_min: 0.3
  y_max: 1.0
  color: "#51cf66"  # Grün

- name: "Authoritarian"
  x_min: -1.0
  x_max: 1.0
  y_min: -1.0
  y_max: -0.3
  color: "#ffa502"  # Orange
```

## Output Schablonen (output_schablonen.yml)

### Klassifizierungs-Templates

```yaml
# Erweiterte Output-Kategorisierung
- name: "Left-Wing"
  color: "#ff6b6b"
  x_min: -1.0
  x_max: -0.3
  y_min: -1.0
  y_max: 1.0

- name: "Right-Wing"
  color: "#4dabf7"
  x_min: 0.3
  x_max: 1.0
  y_min: -1.0
  y_max: 1.0

- name: "Libertarian"
  color: "#51cf66"
  x_min: -1.0
  x_max: 1.0
  y_min: 0.3
  y_max: 1.0

- name: "Authoritarian"
  color: "#ffa502"
  x_min: -1.0
  x_max: 1.0
  y_min: -1.0
  y_max: -0.3

- name: "Centrist"
  color: "#a29bfe"
  x_min: -0.3
  x_max: 0.3
  y_min: -0.3
  y_max: 0.3
```

## Verteilungs-Konfigurationen

### Verfügbare Verteilungstypen

```yaml
# Beta-Verteilung (0-1 Bereich)
distribution_example_beta:
  type: "beta"
  alpha: 2.0      # Form-Parameter α
  beta: 3.0       # Form-Parameter β

# Normale Verteilung
distribution_example_normal:
  type: "normal"
  mean: 0.6       # Mittelwert
  std_dev: 0.2    # Standardabweichung

# Log-normale Verteilung
distribution_example_lognormal:
  type: "lognormal"
  mean: 10.0      # Mittelwert des Logarithmus
  std_dev: 0.5    # Standardabweichung des Logarithmus

# Pareto-Verteilung
distribution_example_pareto:
  type: "pareto"
  alpha: 1.5      # Form-Parameter (Tail-Index)

# Uniform Integer (Ganzzahlen)
distribution_example_uniform_int:
  type: "uniform_int"
  min: 18         # Minimum (inklusive)
  max: 65         # Maximum (inklusive)

# Uniform Float (Gleitkomma)
distribution_example_uniform_float:
  type: "uniform_float"
  min: 0.0        # Minimum
  max: 1.0        # Maximum
```

## Neue Features-Konfiguration

### Biome-basierte Agent-Verteilung

```yaml
# Implementierungs-Logik für Agent-Verteilung
agent_distribution_logic:
  method: "milieu_biome_matrix"  # Verteilungsmethode
  
  # Berechnung: Agenten = Milieu-Proportion × Biome-Percentage × Total-Agents
  calculation:
    - step: "load_milieus"
      description: "Lade Initial-Milieus mit Proportionen"
    - step: "load_biomes"  
      description: "Lade Biomes mit population_percentage"
    - step: "calculate_matrix"
      description: "Berechne Agenten pro Milieu-Biome-Kombination"
    - step: "handle_rounding"
      description: "Behandle Integer-Rundungsfehler"
    - step: "distribute_agents"
      description: "Erstelle Agenten in berechneten Mengen"

  # Validierung
  validation:
    biome_percentages_sum: 100.0    # Muss exakt 100% ergeben
    milieu_proportions_sum: 1.0     # Muss exakt 1.0 ergeben
    total_agents_match: true        # Gesamtzahl muss stimmen
```

### Erweiterte Simulation Controls

```yaml
# Neue Schrittweise-Ausführung
simulation_controls:
  modes:
    continuous:
      description: "Kontinuierliche Ausführung"
      interval_ms: 500
      hotkey: "Space"
    
    single_step:
      description: "Einzelschritt-Ausführung"
      steps: 1
      hotkey: "1"
    
    multi_step:
      description: "10-Schritte-Ausführung"
      steps: 10
      hotkey: "0"
    
    reset:
      description: "Simulation zurücksetzen"
      hotkey: "R"

  # Sicherheitseinstellungen
  safety:
    disable_steps_during_continuous: true  # Schritte während kontinuierlicher Simulation deaktivieren
    confirm_reset: false                   # Reset-Bestätigung
    max_concurrent_steps: 1                # Maximal gleichzeitige Schritte
```

## Konfiguration zur Laufzeit

### Environment Variables

```bash
# Backend-Konfiguration
export ALLOWED_ORIGINS="http://localhost:3000,http://192.168.178.55:3000"
export LOG_LEVEL="INFO"
export MAX_AGENTS=1000
export DEFAULT_STEP_INTERVAL=500

# Neue Biome-spezifische Einstellungen
export BIOME_VALIDATION_STRICT=true
export MILIEU_AUTO_NORMALIZE=true
export AGENT_DISTRIBUTION_METHOD="calculated"

# Performance-Einstellungen
export ENABLE_STEP_CONTROLS=true
export WEBSOCKET_PING_INTERVAL=5000
export MODEL_REPORT_CACHE_SIZE=100
```

### API-basierte Konfiguration

```python
# Programmatische Konfiguration über API
import requests

# Biome-Konfiguration aktualisieren
biome_config = {
    "biomes": [
        {
            "name": "Urban Center",
            "population_percentage": 60.0,
            "einkommen_verteilung": {"type": "lognormal", "mean": 10.5, "std_dev": 0.6},
            # ... weitere Parameter
        }
    ]
}

response = requests.post('http://localhost:8000/api/config', json=biome_config)

# Milieus aktualisieren
milieu_config = [
    {
        "name": "Tech Workers",
        "proportion": 0.3,
        "color": "#00FF00",
        "attribute_distributions": {
            # ... Attributverteilungen
        }
    }
]

response = requests.post('http://localhost:8000/api/initial_milieus', json=milieu_config)
```

## Validierung

### Schema-Validierung (Pydantic)

```python
# Pydantic Models für Validierung
from pydantic import BaseModel, Field, validator
from typing import List

class BiomeConfig(BaseModel):
    name: str
    population_percentage: float = Field(..., ge=0, le=100)
    einkommen_verteilung: DistributionConfig
    # ... weitere Felder
    
    @validator('population_percentage')
    def validate_percentage(cls, v):
        if v < 0 or v > 100:
            raise ValueError('population_percentage must be between 0 and 100')
        return v

class InitialMilieuConfig(BaseModel):
    name: str
    proportion: float = Field(..., gt=0, le=1)
    color: str = Field(..., regex=r'^#[0-9A-Fa-f]{6}$')  # Hex-Color validation
    attribute_distributions: Dict[str, DistributionConfig]
```

### Konsistenz-Prüfungen

```python
# Validierungsfunktionen
def validate_biome_population_percentages(biomes: List[BiomeConfig]) -> None:
    """Prüft ob Biome-Prozentsätze sich zu 100% summieren"""
    total = sum(biome.population_percentage for biome in biomes)
    if abs(total - 100.0) > 0.1:
        raise ValueError(f"Biome population percentages sum to {total}%, expected 100%")

def validate_milieu_proportions(milieus: List[InitialMilieuConfig]) -> None:
    """Prüft ob Milieu-Proportionen sich zu 1.0 summieren"""
    total = sum(milieu.proportion for milieu in milieus)
    if abs(total - 1.0) > 0.01:
        raise ValueError(f"Milieu proportions sum to {total}, expected 1.0")

def validate_agent_distribution_feasibility(
    milieus: List[InitialMilieuConfig], 
    biomes: List[BiomeConfig], 
    total_agents: int
) -> None:
    """Prüft ob Agent-Verteilung durchführbar ist"""
    for milieu in milieus:
        milieu_agents = int(total_agents * milieu.proportion)
        for biome in biomes:
            biome_share = biome.population_percentage / 100.0
            agents_for_combo = int(milieu_agents * biome_share)
            # Warnung bei sehr kleinen Zahlen
            if agents_for_combo == 0 and milieu_agents > 0:
                print(f"Warning: {milieu.name} in {biome.name} results in 0 agents")
```

## Best Practices

### Konfiguration organisieren

1. **Biome-Balance**: Stellen Sie sicher, dass population_percentage genau 100% ergibt
2. **Milieu-Balance**: Milieu-Proportionen müssen sich zu 1.0 summieren
3. **Realistische Verteilungen**: Verwenden Sie realistische Parameter für Verteilungen
4. **Farbkonsistenz**: Verwenden Sie einheitliche Hex-Farben für Milieus
5. **Validierung**: Testen Sie Konfigurationen mit kleinen Agent-Zahlen

### Performance-Optimierung

```yaml
# Performance-optimierte Einstellungen
performance_config:
  # Große Simulationen (1000+ Agenten)
  large_scale:
    biome_calculation_batch_size: 100
    agent_creation_parallel: true
    websocket_update_throttle: 100ms
    
  # Echtzeit-Simulation (< 200 Agenten)
  real_time:
    immediate_websocket_updates: true
    detailed_agent_tracking: true
    high_precision_calculations: true
```

### Debugging-Konfiguration

```yaml
# Debug-Einstellungen für Entwicklung
debug:
  # Agent-Verteilungsdebugging
  log_agent_distribution: true
  save_distribution_matrix: true
  validate_every_step: false
  
  # Biome-spezifisches Debugging
  track_biome_populations: true
  log_biome_layout_calculations: true
  
  # Milieu-Debugging
  trace_milieu_assignments: true
  log_attribute_generation: true
  validate_color_assignments: true
```

## Troubleshooting

### Häufige Konfigurationsfehler

1. **Population Percentage ≠ 100%**
   ```yaml
   # Falsch:
   biomes:
     - name: "Urban"
       population_percentage: 60.0
     - name: "Rural"
       population_percentage: 30.0
   # Summe: 90% ≠ 100%
   
   # Richtig:
   biomes:
     - name: "Urban"
       population_percentage: 70.0
     - name: "Rural" 
       population_percentage: 30.0
   # Summe: 100% ✓
   ```

2. **Milieu-Proportionen ≠ 1.0**
   ```yaml
   # Falsch:
   milieus:
     - name: "A"
       proportion: 0.4
     - name: "B"
       proportion: 0.4
   # Summe: 0.8 ≠ 1.0
   
   # Richtig:
   milieus:
     - name: "A"
       proportion: 0.5
     - name: "B"
       proportion: 0.5
   # Summe: 1.0 ✓
   ```

3. **Ungültige Verteilungsparameter**
   ```yaml
   # Falsch:
   distribution:
     type: "beta"
     alpha: -1.0  # Muss positiv sein
   
   # Richtig:
   distribution:
     type: "beta"
     alpha: 2.0
     beta: 3.0
   ```

### Validierungs-Tools

```bash
# YAML-Syntax prüfen
python -c "import yaml; yaml.safe_load(open('config.yml'))"

# Biome-Konfiguration validieren
curl http://localhost:8000/api/config | python -m json.tool

# Milieu-Konfiguration testen
curl http://localhost:8000/api/initial_milieus | python -m json.tool

# Gesamte Konfiguration validieren
python -m political_abm.validate_config
```

### Monitoring und Logging

```python
# Beispiel für Konfiguration-Monitoring
import logging

# Konfiguration-spezifisches Logging
config_logger = logging.getLogger('abm.config')
config_logger.setLevel(logging.INFO)

# Log wichtige Konfigurationsänderungen
config_logger.info(f"Biome configuration loaded: {len(biomes)} biomes")
config_logger.info(f"Population distribution: {[b.population_percentage for b in biomes]}")
config_logger.info(f"Milieu configuration loaded: {len(milieus)} milieus")
config_logger.info(f"Milieu proportions: {[m.proportion for m in milieus]}")
```

Diese erweiterte Konfiguration ermöglicht es, ABM² für komplexe politische Simulationen mit realistischen demografischen und geografischen Verteilungen zu konfigurieren.