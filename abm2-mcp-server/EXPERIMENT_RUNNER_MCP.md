# Experiment Runner - MCP Tools

**6 neue MCP Tools** für Claude Desktop verfügbar!

## Tools

### 1. `abm2_create_experiment`
Erstellt ein neues Experiment mit Treatments

**Parameter:**
```json
{
  "name": "Altruism Impact Study",
  "description": "Does altruism reduce inequality?",
  "baseline_config": {
    "num_agents": 100,
    "biomes": [],
    "simulation_parameters": {}
  },
  "treatments": [
    {
      "name": "Baseline",
      "config_modifications": {},
      "num_runs": 10,
      "color": "#3498db"
    },
    {
      "name": "High Altruism",
      "config_modifications": {
        "simulation_parameters": {
          "default_mean_altruism": 2.0
        }
      },
      "num_runs": 10,
      "color": "#e74c3c"
    }
  ],
  "target_steps": 100
}
```

**Returns:** Experiment definition mit UUID

---

### 2. `abm2_list_experiments`
Listet alle Experimente auf (sortiert nach Datum)

**Parameter:** Keine

**Returns:**
```json
[
  {
    "id": "uuid",
    "name": "Altruism Impact Study",
    "description": "...",
    "status": "completed",
    "created_at": "2025-10-12T07:12:00",
    "treatments": [...]
  }
]
```

---

### 3. `abm2_get_experiment`
Lädt Experiment Definition

**Parameter:**
```json
{
  "experiment_id": "uuid"
}
```

**Returns:** Vollständige Experiment Definition

---

### 4. `abm2_run_experiment`
Führt Experiment aus (kann mehrere Minuten dauern!)

**Parameter:**
```json
{
  "experiment_id": "uuid"
}
```

**Returns:** Vollständige Ergebnisse mit statistischen Tests

---

### 5. `abm2_get_experiment_results`
Lädt Ergebnisse eines abgeschlossenen Experiments

**Parameter:**
```json
{
  "experiment_id": "uuid"
}
```

**Returns:**
```json
{
  "experiment_id": "uuid",
  "completed_at": "2025-10-12T07:12:45",
  "treatments": [
    {
      "treatment_name": "Baseline",
      "runs": [...],
      "aggregated_metrics": {
        "gini": {
          "mean": 0.315,
          "std": 0.065,
          "min": 0.269,
          "max": 0.361
        }
      }
    }
  ],
  "statistical_tests": [
    {
      "treatment_a": "Baseline",
      "treatment_b": "High Altruism",
      "metric": "gini",
      "t_statistic": 3.45,
      "p_value": 0.001,
      "significant": true,
      "mean_diff": 0.12,
      "cohens_d": 0.8
    }
  ]
}
```

---

### 6. `abm2_compare_treatments`
Statistische Vergleiche für spezifische Metrik

**Parameter:**
```json
{
  "experiment_id": "uuid",
  "metric": "gini"  // oder: avg_wealth, avg_income, mean_altruism, top10_share
}
```

**Returns:** Gefilterte statistische Tests nur für diese Metrik

---

## Beispiel-Workflow in Claude Desktop

```
You: Erstelle ein Experiment, das testet, ob höherer Altruismus die Ungleichheit reduziert.

Claude: [nutzt abm2_create_experiment]
       Experiment erstellt mit ID: abc-123

You: Führe das Experiment jetzt aus.

Claude: [nutzt abm2_run_experiment]
       Experiment läuft... (dies dauert ~2 Minuten)

       Ergebnisse:
       - Baseline Gini: 0.35 ± 0.02
       - High Altruism Gini: 0.28 ± 0.01
       - Statistisch signifikant (p < 0.001)
       - Großer Effekt (Cohen's d = 0.8)

       Fazit: Ja, höherer Altruismus reduziert Ungleichheit kausal!

You: Zeige mir die Zeit-Verläufe.

Claude: [nutzt abm2_get_experiment_results und analysiert time_series]
       [Erstellt ASCII-Plot oder beschreibt Verlauf]
```

---

## Installation / Neustart

Falls die Tools noch nicht sichtbar sind:

1. **Claude Desktop neu starten**
2. **MCP Server Status prüfen:**
   ```
   Settings → Developer → MCP Servers → abm2-digital-lab
   ```

Die Tools sollten automatisch erscheinen, da die MCP Bridge schon läuft.

---

## Verfügbare Metriken

- **gini** - Gini-Koeffizient (Ungleichheit)
- **avg_wealth** - Durchschnittliches Vermögen
- **avg_income** - Durchschnittliches Einkommen
- **mean_altruism** - Durchschnittlicher Altruismus
- **top10_share** - Anteil Top 10% am Gesamtvermögen

---

## Tipps

1. **Kleine Tests zuerst**: Starte mit wenigen Runs (2-3) und wenigen Steps (10-20)
2. **Experiment IDs speichern**: UUIDs sind lang, aber eindeutig
3. **Status prüfen**: Mit `abm2_list_experiments` vor `run_experiment`
4. **Geduld**: Große Experimente (10 runs × 100 steps) dauern ~5 Minuten

---

## Limitations

- Experimente laufen synchron (kein async/parallel bisher)
- Kein Progress-Tracking während Experiment läuft
- Keine Abbruch-Funktion (einmal gestartet, läuft bis Ende)

Diese könnten in Phase 2/3 verbessert werden!
