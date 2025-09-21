# ABM² Digital Lab - API Dokumentation

## Übersicht

Das ABM² Backend bietet eine hochperformante RESTful API basierend auf FastAPI sowie WebSocket-Verbindungen für Echtzeit-Updates. Vollständig refaktoriert 2024/25 für maximale Skalierbarkeit und erweiterte Features.

[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](#)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-blue.svg)](#)
[![Pydantic](https://img.shields.io/badge/Pydantic-Validation-orange.svg)](#)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-purple.svg)](#)

**Base URL**: `http://localhost:8000`

### 🆕 Neue Features (2024/25)
- **🧮 Formula Registry API** - Dynamische Formelkonfiguration mit Versionierung, Validation und Caching
- **📊 Performance Monitoring** - Echtzeit-Metriken und Profiling-Endpoints mit Prometheus-Integration
- **🔐 Enhanced Authorization** - Rollenbasierte Zugriffskontrolle für kritische Operationen
- **📝 Audit Logging** - Vollständige API-Audit-Trails mit Request-Tracking
- **⚙️ Advanced Configuration** - Feature-Flag System und erweiterte Pydantic-Validierung
- **🎬 Recording System** - CSV-Export von Simulationsdaten für wissenschaftliche Analyse
- **📈 Metrics API** - Prometheus-Format Metriken für Monitoring und Alerting

## Authentifizierung

Die API verwendet rollenbasierte Authentifizierung über HTTP-Header für kritische Operationen:

```http
X-User-Role: editor
```

**Verfügbare Rollen:**
- `viewer`: Lesezugriff auf alle Daten
- `editor`: Vollzugriff auf Formulas, Konfiguration und Simulation
- `admin`: Systemadministration und Audit-Funktionen

**CORS-Konfiguration**: `localhost:3000` und `192.168.178.55:3000`

## API Endpoints

### Health Check

#### GET /api/health
Überprüft den Status des Servers.

**Response:**
```json
{
  "status": "ok"
}
```

### Simulation Management

#### POST /api/simulation/reset
Setzt die Simulation zurück und erstellt ein neues Modell mit konfigurierten Milieus und Biome-Verteilung.

**Request Body:**
```json
{
  "num_agents": 100,
  "network_connections": 5
}
```

**Response:**
```json
{
  "step": 0,
  "model_report": {
    "Mean_Freedom": 0.6,
    "Mean_Altruism": 0.55,
    "Polarization": 0.0,
    "Gini_Resources": 0.0,
    "Durchschnittsvermoegen": 8500.2,
    "Durchschnittseinkommen": 0.0,
    "Gini_Vermoegen": 0.34,
    "Gini_Einkommen": 0.0,
    "Hazard_Events_Count": 0,
    "Regions": {
      "Prosperous Metropolis": 50,
      "Industrial Zone": 25,
      "Fertile Farmland": 12,
      "New Biome 4": 13
    },
    "layout": [
      {"name": "Prosperous Metropolis", "x_min": 0, "x_max": 25},
      {"name": "Industrial Zone", "x_min": 25, "x_max": 50},
      {"name": "Fertile Farmland", "x_min": 50, "x_max": 75},
      {"name": "New Biome 4", "x_min": 75, "x_max": 100}
    ],
    "events": [],
    "population_report": {
      "milieu_distribution": {},
      "schablonen_verteilung": {
        "Left-Wing": 25,
        "Right-Wing": 30,
        "Centrist": 25,
        "Libertarian": 20
      },
      "key_averages": {
        "mean_wealth": 8500.2,
        "mean_income": 0.0,
        "mean_altruism": 0.55,
        "mean_effective_cognition": 0.7,
        "mean_risk_aversion": 0.5
      }
    },
    "environment": {}
  },
  "agent_visuals": [
    {
      "id": 0,
      "position": [12.5, 45.2],
      "political_position": {"a": 0.2, "b": -0.1},
      "region": "Prosperous Metropolis",
      "schablone": "Left-Wing",
      "initial_milieu": "Progressive Youth",
      "alter": 28,
      "einkommen": 0.0,
      "vermoegen": 12500.0,
      "sozialleistungen": 0.0,
      "risikoaversion": 0.45,
      "effektive_kognitive_kapazitaet": 0.72,
      "kognitive_kapazitaet_basis": 0.72,
      "politische_wirksamkeit": 0.5,
      "sozialkapital": 0.65
    }
  ]
}
```

#### POST /api/simulation/step
Führt einen Simulationsschritt aus und sendet die neuen Daten per WebSocket.

**Response:**
```json
{
  "message": "Simulation advanced to step 1."
}
```

#### GET /api/simulation/data
Ruft den aktuellen Zustand der Simulation ab, ohne sie voranzutreiben.

**Response:** Gleiche Struktur wie bei `/api/simulation/reset`

### Konfiguration

#### GET /api/config
Ruft die aktuelle Simulationskonfiguration ab (Biomes, Agent Dynamics, Simulation Parameters).

**Response:**
```json
{
  "biomes": [
    {
      "name": "Prosperous Metropolis",
      "population_percentage": 50.0,
      "einkommen_verteilung": {
        "type": "lognormal",
        "mean": 10.5,
        "std_dev": 0.6
      },
      "vermoegen_verteilung": {
        "type": "pareto",
        "alpha": 1.5
      },
      "sozialleistungs_niveau": 0.15,
      "hazard_probability": 0.01,
      "hazard_impact_factor": 0.2,
      "capacity": 1500.0,
      "initial_quality": 1350.0,
      "regeneration_rate": 15.0,
      "produktivitaets_faktor": 1.2,
      "knappheits_schwelle": 10000.0,
      "risiko_vermoegen_schwelle": 7500.0
    }
  ],
  "agent_dynamics": {
    "extraction": {
      "max_factor": 0.002,
      "sustainable_factor": 0.001
    },
    "learning": {
      "altruism_target_in_crisis": 0.7,
      "crisis_signal_weight": 0.5,
      "eta_max": 0.01,
      "k_bildung": 5
    }
  },
  "simulation_parameters": {
    "environmental_capacity": 1000.0,
    "media_influence_factor": 0.05
  },
  "agent_initialization": {
    "bildung": {"type": "beta", "alpha": 4.0, "beta": 2.0},
    "alter": {"type": "uniform_int", "min": 18, "max": 80},
    "kognitive_kapazitaet": {"type": "normal", "mean": 0.7, "std_dev": 0.15},
    "vertraeglichkeit": {"type": "beta", "alpha": 3.5, "beta": 2.0},
    "freedom_preference": {"type": "normal", "mean": 0.6, "std_dev": 0.2},
    "altruism_factor": {"type": "normal", "mean": 0.55, "std_dev": 0.18}
  }
}
```

#### POST /api/config
Speichert eine neue Simulationskonfiguration.

**Request Body:** Vollständige Konfiguration (gleiche Struktur wie GET Response)

#### PATCH /api/config
Aktualisiert Teile der Konfiguration.

**Request Body:** Partielle Konfiguration

### Media Sources

#### GET /api/media_sources
Ruft die Medienquellen-Konfiguration ab.

**Response:**
```json
[
  {
    "name": "Liberal Media",
    "ideological_position": {
      "economic_axis": -0.3,
      "social_axis": 0.5
    }
  },
  {
    "name": "Conservative Media",
    "ideological_position": {
      "economic_axis": 0.4,
      "social_axis": -0.2
    }
  }
]
```

#### POST /api/media_sources
Speichert die Medienquellen-Konfiguration.

**Request Body:** Array von Media Source Objekten (gleiche Struktur wie GET Response)

### Templates

#### GET /api/templates
Ruft die Templates-Konfiguration ab.

**Response:**
```json
[
  {
    "name": "Left-Wing",
    "x_min": -1.0,
    "x_max": -0.3,
    "y_min": -1.0,
    "y_max": 1.0,
    "color": "#ff6b6b"
  },
  {
    "name": "Right-Wing",
    "x_min": 0.3,
    "x_max": 1.0,
    "y_min": -1.0,
    "y_max": 1.0,
    "color": "#4dabf7"
  }
]
```

#### POST /api/templates
Speichert die Templates-Konfiguration.

**Request Body:** Array von Template Objekten

### Initial Milieus

#### GET /api/initial_milieus
Ruft die Anfangsmilieus-Konfiguration ab.

**Response:**
```json
[
  {
    "name": "Linksradikal",
    "proportion": 0.1667,
    "color": "#8B0000",
    "attribute_distributions": {
      "bildung": {"type": "beta", "alpha": 4.0, "beta": 2.0},
      "alter": {"type": "uniform_int", "min": 18, "max": 35},
      "kognitive_kapazitaet": {"type": "beta", "alpha": 4.0, "beta": 2.5},
      "vertraeglichkeit": {"type": "beta", "alpha": 4.5, "beta": 2.0},
      "freedom_preference": {"type": "beta", "alpha": 5.0, "beta": 1.5},
      "altruism_factor": {"type": "beta", "alpha": 5.0, "beta": 1.5}
    }
  },
  {
    "name": "Links",
    "proportion": 0.1667,
    "color": "#DC143C",
    "attribute_distributions": {
      "bildung": {"type": "beta", "alpha": 3.5, "beta": 2.5},
      "alter": {"type": "uniform_int", "min": 25, "max": 55},
      "kognitive_kapazitaet": {"type": "beta", "alpha": 3.5, "beta": 2.5},
      "vertraeglichkeit": {"type": "beta", "alpha": 4.0, "beta": 2.5},
      "freedom_preference": {"type": "beta", "alpha": 4.0, "beta": 2.0},
      "altruism_factor": {"type": "beta", "alpha": 4.0, "beta": 2.0}
    }
  }
]
```

#### POST /api/initial_milieus
Speichert die Anfangsmilieus-Konfiguration.

**Request Body:** Array von Initial Milieu Objekten

## 🧮 Formula Registry

Das Formula Registry System ermöglicht die dynamische Konfiguration und Versionierung aller Agent-Berechnungsformeln.

### GET /api/registry/health

Überprüft den Status des Formula Registry Systems.

**Response:**
```json
{
  "status": "ok",
  "enabled": true,
  "schema_version": "v1",
  "whitelist": ["+", "-", "*", "/", "Min", "Max"],
  "pins_valid": true
}
```

### GET /api/formulas

Listet alle verfügbaren Formeln auf.

**Response:**
```json
{
  "formulas": [
    {
      "name": "investment_decision",
      "display_name": "Investment Decision"
    },
    {
      "name": "learning_rate",
      "display_name": "Learning Rate"
    },
    {
      "name": "media_influence",
      "display_name": "Media Influence"
    }
  ]
}
```

### GET /api/formulas/{name}

Ruft Details einer spezifischen Formel ab.

**Parameter:**
- `name`: Name der Formel (z.B. "investment_decision")

**Response:**
```json
{
  "name": "investment_decision",
  "versions": {
    "v1.0": {
      "expression": "ersparnis * max_rate * (1 - risikoaversion)",
      "variables": ["ersparnis", "max_rate", "risikoaversion"],
      "created_at": "2025-01-09T10:00:00Z",
      "status": "active",
      "description": "Basic investment decision formula"
    },
    "v1.1": {
      "expression": "ersparnis * max_rate * (1 - risikoaversion) * cognitive_factor",
      "variables": ["ersparnis", "max_rate", "risikoaversion", "cognitive_factor"],
      "created_at": "2025-01-09T11:00:00Z",
      "status": "draft",
      "description": "Enhanced with cognitive factors"
    }
  }
}
```

### PUT /api/formulas/{name}

Erstellt oder aktualisiert eine Formel. **Erfordert Editor-Rolle.**

**Headers:**
```http
X-User-Role: editor
Content-Type: application/json
```

**Request Body:**
```json
{
  "expression": "ersparnis * max_rate * (1 - risikoaversion) * Min(cognitive_factor, 1.0)",
  "variables": ["ersparnis", "max_rate", "risikoaversion", "cognitive_factor"],
  "description": "Investment decision with cognitive bounds"
}
```

**Response:**
```json
{
  "status": "success",
  "version": "v1.2",
  "formula": "investment_decision",
  "request_id": "uuid-v4"
}
```

### POST /api/validate

Validiert eine Formel ohne sie zu speichern.

**Request Body:**
```json
{
  "name": "test_formula",
  "expression": "a + b * Min(c, 1.0)",
  "variables": ["a", "b", "c"]
}
```

**Response:**
```json
{
  "valid": true,
  "variables_detected": ["a", "b", "c"],
  "functions_used": ["Min"],
  "warnings": [],
  "errors": []
}
```

### POST /api/compile

Kompiliert eine Formel für optimierte Ausführung.

**Request Body:**
```json
{
  "name": "investment_decision",
  "version": "v1.1"
}
```

**Response:**
```json
{
  "status": "compiled",
  "compile_time_ms": 12.5,
  "cache_key": "abc123def456",
  "request_id": "uuid-v4"
}
```

### POST /api/test

Testet eine Formel mit Testdaten.

**Request Body:**
```json
{
  "name": "investment_decision",
  "version": "v1.1",
  "test_data": {
    "ersparnis": 1000.0,
    "max_rate": 0.1,
    "risikoaversion": 0.3,
    "cognitive_factor": 0.8
  }
}
```

**Response:**
```json
{
  "result": 56.0,
  "execution_time_ms": 0.15,
  "formula_used": "ersparnis * max_rate * (1 - risikoaversion) * cognitive_factor",
  "variables_bound": {
    "ersparnis": 1000.0,
    "max_rate": 0.1,
    "risikoaversion": 0.3,
    "cognitive_factor": 0.8
  }
}
```

### POST /api/release

Setzt eine Formel-Version als aktiv. **Erfordert Editor-Rolle.**

**Headers:**
```http
X-User-Role: editor
```

**Request Body:**
```json
{
  "name": "investment_decision",
  "version": "v1.1"
}
```

### GET /api/versions/{name}

Listet alle Versionen einer Formel auf.

**Response:**
```json
{
  "name": "investment_decision",
  "versions": [
    {
      "version": "v1.0",
      "status": "deprecated",
      "created_at": "2025-01-09T10:00:00Z"
    },
    {
      "version": "v1.1",
      "status": "active",
      "created_at": "2025-01-09T11:00:00Z"
    }
  ]
}
```

### GET /api/pins

Zeigt die aktuell verwendeten ("gepinnten") Formel-Versionen.

**Response:**
```json
{
  "investment_decision": "v1.1",
  "learning_rate": "v2.0",
  "media_influence": "v1.3"
}
```

### PUT /api/pins

Aktualisiert die gepinnten Formel-Versionen. **Erfordert Editor-Rolle.**

**Headers:**
```http
X-User-Role: editor
```

**Request Body:**
```json
{
  "investment_decision": "v1.2",
  "learning_rate": "v2.1"
}
```

## 📊 Performance Monitoring

### GET /metrics

Prometheus-Format Metriken für Monitoring.

**Response:** (text/plain)
```
# HELP abm_simulation_step_duration_seconds Time spent in simulation steps
# TYPE abm_simulation_step_duration_seconds histogram
abm_simulation_step_duration_seconds_bucket{le="0.1"} 45
abm_simulation_step_duration_seconds_bucket{le="0.25"} 67
abm_simulation_step_duration_seconds_bucket{le="0.5"} 89
abm_simulation_step_duration_seconds_bucket{le="1.0"} 92
abm_simulation_step_duration_seconds_bucket{le="+Inf"} 95
abm_simulation_step_duration_seconds_sum 23.456
abm_simulation_step_duration_seconds_count 95

# HELP abm_formula_registry_cache_hits_total Formula registry cache hits
# TYPE abm_formula_registry_cache_hits_total counter
abm_formula_registry_cache_hits_total 1247

# HELP abm_formula_registry_cache_misses_total Formula registry cache misses
# TYPE abm_formula_registry_cache_misses_total counter
abm_formula_registry_cache_misses_total 23
```

## 📝 Audit System

### GET /api/audit

Ruft Audit-Log-Einträge ab.

**Query-Parameter:**
- `limit` (optional): Anzahl der Einträge (default: 100)
- `offset` (optional): Offset für Paginierung
- `event_type` (optional): Filterung nach Event-Typ

**Response:**
```json
{
  "events": [
    {
      "timestamp": "2025-01-09T10:30:15Z",
      "event_type": "formula_created",
      "user_role": "editor",
      "request_id": "123e4567-e89b-12d3-a456-426614174000",
      "details": {
        "formula_name": "investment_decision",
        "version": "v1.2",
        "expression": "ersparnis * max_rate * (1 - risikoaversion)"
      }
    },
    {
      "timestamp": "2025-01-09T10:25:00Z",
      "event_type": "simulation_reset",
      "user_role": "viewer",
      "request_id": "987fcdeb-51a2-43d1-9f12-123456789abc",
      "details": {
        "num_agents": 100,
        "network_connections": 5
      }
    }
  ],
  "total_count": 1247,
  "has_more": true
}
```

### POST /api/audit/mark

Markiert Audit-Events als bearbeitet. **Erfordert Admin-Rolle.**

**Headers:**
```http
X-User-Role: admin
```

**Request Body:**
```json
{
  "action": "reviewed",
  "event_ids": [
    "123e4567-e89b-12d3-a456-426614174000",
    "987fcdeb-51a2-43d1-9f12-123456789abc"
  ]
}
```

## 🎬 Recording System

### POST /api/recording/start

Startet die Aufzeichnung von Simulationsdaten.

**Response:**
```json
{
  "status": "recording_started",
  "filename": "simulation_2025-01-09_10-30-00.csv",
  "start_time": "2025-01-09T10:30:00Z"
}
```

### POST /api/recording/stop

Stoppt die aktuelle Aufzeichnung.

**Response:**
```json
{
  "status": "recording_stopped",
  "filename": "simulation_2025-01-09_10-30-00.csv",
  "duration_seconds": 125,
  "records_written": 250,
  "file_size_bytes": 2457600
}
```

### GET /api/recordings

Listet alle verfügbaren Aufzeichnungen auf.

**Response:**
```json
[
  {
    "filename": "simulation_2025-01-09_10-30-00.csv",
    "size": 2457600,
    "modified": 1736421000,
    "records_count": 250
  },
  {
    "filename": "simulation_2025-01-09_09-15-30.csv",
    "size": 1893400,
    "modified": 1736417300,
    "records_count": 180
  }
]
```

### GET /api/recordings/{filename}

Lädt eine spezifische Aufzeichnungsdatei herunter.

**Response:** CSV-Datei mit allen Agent-Daten über die Zeit

**CSV-Format:**
```csv
step,agent_id,position_x,position_y,vermoegen,einkommen,milieu,schablone,region
0,1,12.5,34.2,15420.0,0.0,Liberal,Centrist,Prosperous Metropolis
0,2,45.8,67.1,8930.0,0.0,Links,Left-Wing,Industrial Zone
1,1,12.6,34.3,15650.0,230.0,Liberal,Centrist,Prosperous Metropolis
```

### Output Schablonen

#### GET /api/output_schablonen
Ruft die Output-Templates ab.

**Response:**
```json
[
  {
    "name": "Left-Wing",
    "color": "#ff6b6b",
    "x_min": -1.0,
    "x_max": -0.3,
    "y_min": -1.0,
    "y_max": 1.0
  },
  {
    "name": "Centrist",
    "color": "#a29bfe",
    "x_min": -0.3,
    "x_max": 0.3,
    "y_min": -0.3,
    "y_max": 0.3
  }
]
```

#### POST /api/output_schablonen
Speichert die Output-Templates.

**Request Body:** Array von Output Schablone Objekten

### Presets Management

#### GET /api/presets/{section}
Listet alle verfügbaren Presets für einen Bereich auf.

**Parameter:**
- `section`: Bereich (z.B. "biomes", "agentinit", "environment", "milieus")

**Response:**
```json
["linksradikal", "links", "mitte", "liberal", "rechts", "rechtsextrem"]
```

#### GET /api/presets/{section}/{name}
Lädt ein spezifisches Preset.

**Beispiel:** `/api/presets/milieus/linksradikal`

**Response:**
```json
[
  {
    "name": "Linksradikal",
    "proportion": 0.15,
    "color": "#8B0000",
    "initial_values": {
      "bildung": {"type": "beta", "alpha": 4.0, "beta": 2.0},
      "alter": {"type": "uniform_int", "min": 18, "max": 35},
      "kognitive_kapazitaet": {"type": "beta", "alpha": 4.0, "beta": 2.5},
      "vertraeglichkeit": {"type": "beta", "alpha": 4.5, "beta": 2.0},
      "freedom_preference": {"type": "beta", "alpha": 5.0, "beta": 1.5},
      "altruism_factor": {"type": "beta", "alpha": 5.0, "beta": 1.5}
    }
  }
]
```

#### POST /api/presets/{section}/{name}
Speichert ein neues Preset.

#### DELETE /api/presets/{section}/{name}
Löscht ein Preset.

## WebSocket

### /ws
WebSocket-Verbindung für Echtzeit-Updates der Simulationsdaten.

**Nachrichten:**
- Ping-Nachrichten alle 5 Sekunden
- Simulationsdaten nach jedem Schritt
- Konfigurationsänderungen

**Beispiel-Nachricht (Simulationsdaten):**
```json
{
  "step": 5,
  "model_report": {
    "Mean_Freedom": 0.61,
    "Mean_Altruism": 0.54,
    "Polarization": 0.12,
    "Gini_Resources": 0.0,
    "Durchschnittsvermoegen": 8756.3,
    "Durchschnittseinkommen": 245.8,
    "Gini_Vermoegen": 0.36,
    "Gini_Einkommen": 0.28,
    "Hazard_Events_Count": 2,
    "Regions": {
      "Prosperous Metropolis": 50,
      "Industrial Zone": 25,
      "Fertile Farmland": 12,
      "New Biome 4": 13
    },
    "layout": [
      {"name": "Prosperous Metropolis", "x_min": 0, "x_max": 25},
      {"name": "Industrial Zone", "x_min": 25, "x_max": 50},
      {"name": "Fertile Farmland", "x_min": 50, "x_max": 75},
      {"name": "New Biome 4", "x_min": 75, "x_max": 100}
    ],
    "events": [
      "HAZARD_EVENT|Industrial Zone: Environmental degradation affects 5 agents",
      "GINI_WEALTH_THRESHOLD_CROSSED|INCREASE|0.364"
    ],
    "population_report": {
      "milieu_distribution": {},
      "schablonen_verteilung": {
        "Left-Wing": 23,
        "Right-Wing": 32,
        "Centrist": 24,
        "Libertarian": 21
      },
      "key_averages": {
        "mean_wealth": 8756.3,
        "mean_income": 245.8,
        "mean_altruism": 0.54,
        "mean_effective_cognition": 0.69,
        "mean_risk_aversion": 0.52
      }
    },
    "environment": {}
  },
  "agent_visuals": [...]
}
```

## Datenmodelle

### Agent Visual
```json
{
  "id": 1,
  "position": [12.5, 45.2],
  "political_position": {"a": 0.2, "b": -0.1},
  "region": "Prosperous Metropolis",
  "schablone": "Left-Wing",
  "initial_milieu": "Progressive Youth",
  "alter": 28,
  "einkommen": 245.8,
  "vermoegen": 12756.3,
  "sozialleistungen": 45.2,
  "risikoaversion": 0.45,
  "effektive_kognitive_kapazitaet": 0.72,
  "kognitive_kapazitaet_basis": 0.72,
  "politische_wirksamkeit": 0.5,
  "sozialkapital": 0.65
}
```

### Biome Layout
```json
{
  "name": "Prosperous Metropolis",
  "x_min": 0.0,
  "x_max": 25.0
}
```

### Distribution Config
```json
{
  "type": "beta|uniform_int|normal|uniform_float|lognormal|pareto",
  "alpha": 2.0,     // für beta, pareto
  "beta": 3.0,      // für beta
  "min": 18,        // für uniform_int, uniform_float
  "max": 65,        // für uniform_int, uniform_float
  "mean": 0.6,      // für normal, lognormal
  "std_dev": 0.2    // für normal, lognormal
}
```

### Model Report
```json
{
  "Mean_Freedom": 0.6,
  "Mean_Altruism": 0.55,
  "Polarization": 0.12,
  "Gini_Resources": 0.0,
  "Durchschnittsvermoegen": 8500.2,
  "Durchschnittseinkommen": 245.8,
  "Gini_Vermoegen": 0.34,
  "Gini_Einkommen": 0.28,
  "Hazard_Events_Count": 2,
  "Regions": {
    "Region Name": 25
  },
  "layout": [...],
  "events": [...],
  "population_report": {...},
  "environment": {}
}
```

## Neue Features

### Biome-basierte Agent-Verteilung

Agenten werden jetzt basierend auf `population_percentage` der Biomes verteilt:
- Jedes Biome hat einen konfigurierbaren Bevölkerungsanteil
- Agenten werden nach **Milieu-Proportion × Biome-Prozentsatz** verteilt
- Geografische Verteilung auf 4 Biome-Flächen statt politischem Raum

### Erweiterte Simulation Controls

Das Frontend bietet neue schrittweise Ausführung:
- **Start**: Kontinuierliche Simulation (alle 500ms)
- **1 Step**: Führt genau einen Simulationsschritt aus
- **10 Steps**: Führt 10 Simulationsschritte hintereinander aus
- **Stop**: Stoppt kontinuierliche Simulation
- **Reset**: Setzt Simulation zurück

### Initial Milieus System

6 vordefinierte politische Archetypen:
- **Linksradikal** (#8B0000 - Dunkelrot)
- **Links** (#DC143C - Rot)
- **Mitte** (#000000 - Schwarz)
- **Liberal** (#FFD700 - Gelb)
- **Rechts** (#0000FF - Blau)
- **Rechtsextrem** (#8B4513 - Braun)

Jedes Milieu hat individuelle Attributverteilungen für Bildung, Alter, kognitive Kapazität, Verträglichkeit, Freiheitspräferenz und Altruismus.

## Fehlerbehandlung

Die API verwendet Standard HTTP-Status-Codes:

- `200`: Erfolg
- `400`: Ungültige Anfrage
- `404`: Ressource nicht gefunden
- `422`: Validierungsfehler (Pydantic)
- `500`: Serverfehler

**Fehler-Response:**
```json
{
  "detail": "Error message"
}
```

## Rate Limiting

### Standard Limits
- **Standard Requests**: 100 requests/minute pro Client-IP
- **Formula Operations**: 20 requests/minute (PUT, POST auf /api/formulas/*)
- **WebSocket Connections**: 5 concurrent connections pro Client
- **Recording Downloads**: 10 downloads/hour

### Rate Limit Headers
Die API sendet Rate-Limit-Informationen in Response-Headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1736421600
X-RateLimit-Window: 60
```

### Rate Limit Exceeded (429)
```json
{
  "error": "rate_limit_exceeded",
  "detail": "Too many requests",
  "retry_after": 45
}
```

## Beispiele

### Simulation starten
```bash
curl -X POST http://localhost:8000/api/simulation/reset \
  -H "Content-Type: application/json" \
  -d '{"num_agents": 50, "network_connections": 3}'
```

### Einen Schritt ausführen
```bash
curl -X POST http://localhost:8000/api/simulation/step
```

### Aktuelle Daten abrufen
```bash
curl http://localhost:8000/api/simulation/data
```

### Biome-Konfiguration aktualisieren
```bash
curl -X POST http://localhost:8000/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "biomes": [
      {
        "name": "Urban",
        "population_percentage": 60.0,
        "einkommen_verteilung": {"type": "lognormal", "mean": 10.5, "std_dev": 0.6},
        "vermoegen_verteilung": {"type": "pareto", "alpha": 1.5},
        "sozialleistungs_niveau": 0.15,
        "hazard_probability": 0.01,
        "hazard_impact_factor": 0.2,
        "capacity": 1500.0,
        "initial_quality": 1350.0,
        "regeneration_rate": 15.0,
        "produktivitaets_faktor": 1.2,
        "knappheits_schwelle": 10000.0,
        "risiko_vermoegen_schwelle": 7500.0
      }
    ]
  }'
```

### Initial Milieus laden
```bash
curl http://localhost:8000/api/initial_milieus
```

### Formula Registry Workflow
```bash
# Registry Health prüfen
curl http://localhost:8000/api/registry/health

# Neue Formel erstellen
curl -X PUT http://localhost:8000/api/formulas/my_formula \
  -H "Content-Type: application/json" \
  -H "X-User-Role: editor" \
  -d '{
    "expression": "a * b + Min(c, 1.0)",
    "variables": ["a", "b", "c"],
    "description": "Test formula with Min function"
  }'

# Formel testen
curl -X POST http://localhost:8000/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my_formula",
    "version": "v1.0",
    "test_data": {"a": 2.0, "b": 3.0, "c": 1.5}
  }'

# Formel aktivieren
curl -X POST http://localhost:8000/api/release \
  -H "Content-Type: application/json" \
  -H "X-User-Role: editor" \
  -d '{"name": "my_formula", "version": "v1.0"}'
```

### Recording Workflow
```bash
# Aufzeichnung starten
curl -X POST http://localhost:8000/api/recording/start

# Simulation laufen lassen
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/simulation/step
  sleep 0.5
done

# Aufzeichnung stoppen
curl -X POST http://localhost:8000/api/recording/stop

# Aufzeichnungen auflisten
curl http://localhost:8000/api/recordings

# Datei herunterladen
curl -o simulation_data.csv \
  http://localhost:8000/api/recordings/simulation_2025-01-09_10-30-00.csv
```

### Monitoring Setup
```bash
# Prometheus Metriken abrufen
curl http://localhost:8000/metrics

# Audit Log überwachen
curl "http://localhost:8000/api/audit?limit=10&event_type=formula_created"

# System Health Dashboard
curl http://localhost:8000/api/health
curl http://localhost:8000/api/registry/health
```