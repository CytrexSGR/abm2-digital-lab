# ABM² Digital Lab - MCP Function Reference

**Version:** 1.1.0
**Datum:** 2025-10-11
**Zweck:** Umfassende Funktionsdokumentation für Model Context Protocol (MCP) Integration

## 🆕 NEU: Advanced Query Tools (v1.1.0)

### `abm2_query_agents` ✨
**Problem gelöst:** 100k+ Zeichen Agent-Daten Output
**Lösung:** Intelligente Filterung und Aggregation

**Beispiele:**
```
"Zeige mir nur Agents mit Vermögen > 50000"
"Wie viele Agents sind in Prosperous Metropolis?"
"Durchschnittseinkommen der Links-Liberal Agents"
"Verteilung nach Milieu"
```

**Features:**
- ✅ Range-Filter (`{"min": X, "max": Y}`)
- ✅ List-Filter (`["Option1", "Option2"]`)
- ✅ Exact-Match Filter
- ✅ 9 Aggregations-Typen (mean, sum, std, distribution, percentiles, etc.)
- ✅ Custom field selection
- ✅ Limit für große Datensätze

**Siehe:** [Agent Query API](#post-apiagentsquery) für Details

---

## Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [API Endpunkte](#api-endpunkte)
3. [Simulation Management](#simulation-management)
4. [Agenten-System](#agenten-system)
5. [Manager-Komponenten](#manager-komponenten)
6. [Konfigurations-Management](#konfigurations-management)
7. [Formula Registry](#formula-registry)
8. [Recording & Export](#recording--export)
9. [WebSocket Events](#websocket-events)
10. [Authentifizierung](#authentifizierung)
11. [⭐ Advanced Query Tools](#advanced-query-tools-neu)

---

## Übersicht

Das ABM² Digital Lab ist eine Agent-Based Modeling (ABM) Plattform für politische und sozio-ökologische Simulationen. Die Anwendung besteht aus:

- **Backend:** FastAPI (Python 3.8+) mit Mesa Framework
- **Frontend:** React 18.3 mit TypeScript
- **Architektur:** Mikroservice-orientiert mit WebSocket-Kommunikation
- **Datenmodell:** Pydantic-validierte Konfigurationen

---

## API Endpunkte

### Basis-URL
```
http://localhost:8000/api
```

### 1. System Health & Monitoring

#### GET `/api/health`
**Beschreibung:** Überprüft den Systemstatus
**Authentifizierung:** Keine
**Response:**
```json
{
  "status": "ok",
  "registry_enabled": true
}
```

#### GET `/metrics`
**Beschreibung:** Prometheus-kompatible Metriken
**Authentifizierung:** Keine
**Content-Type:** `text/plain; version=0.0.4`

---

### 2. Simulationssteuerung

#### POST `/api/simulation/reset`
**Beschreibung:** Setzt die Simulation zurück und erstellt ein neues Modell
**Authentifizierung:** Erforderlich (Basic Auth)
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
  "model_report": { ... },
  "agent_visuals": [ ... ]
}
```

**Verwendung:**
```python
import requests
from requests.auth import HTTPBasicAuth

response = requests.post(
    "http://localhost:8000/api/simulation/reset",
    json={"num_agents": 200, "network_connections": 8},
    auth=HTTPBasicAuth("username", "password")
)
```

#### POST `/api/simulation/step`
**Beschreibung:** Führt einen Simulationsschritt aus
**Authentifizierung:** Erforderlich
**Response:**
```json
{
  "message": "Simulation advanced to step 42."
}
```

#### GET `/api/simulation/data`
**Beschreibung:** Holt den aktuellen Simulationszustand ohne Fortschritt
**Authentifizierung:** Keine
**Response:** Vollständiger Model Report (siehe unten)

---

### 3. Konfigurationsverwaltung

#### GET `/api/config`
**Beschreibung:** Liest die vollständige Simulationskonfiguration
**Authentifizierung:** Keine
**Response:** FullConfig-Objekt mit allen Parametern

#### POST `/api/config`
**Beschreibung:** Speichert eine neue vollständige Konfiguration
**Authentifizierung:** Erforderlich
**Request Body:** FullConfig-Objekt (Pydantic-validiert)

#### PATCH `/api/config`
**Beschreibung:** Aktualisiert Teile der Konfiguration (Deep Merge)
**Authentifizierung:** Erforderlich
**Request Body:** Partielles Config-Objekt

**Beispiel:**
```json
{
  "agent_dynamics": {
    "learning_rate": 0.15
  }
}
```

---

### 4. Preset-Management

#### GET `/api/presets/{section_name}`
**Beschreibung:** Listet alle Presets für eine Sektion auf
**Parameter:**
- `section_name`: biomes, milieus, media_sources, etc.

**Response:**
```json
["default", "extreme_scenario", "baseline"]
```

#### GET `/api/presets/{section_name}/{preset_name}`
**Beschreibung:** Lädt eine spezifische Preset-Konfiguration
**Response:** JSON-Preset-Daten

#### POST `/api/presets/{section_name}/{preset_name}`
**Beschreibung:** Speichert oder überschreibt ein Preset
**Request Body:** Beliebige JSON-Daten

#### DELETE `/api/presets/{section_name}/{preset_name}`
**Beschreibung:** Löscht ein Preset
**Response:**
```json
{
  "message": "Preset 'extreme_scenario' for section 'biomes' deleted."
}
```

---

### 5. Medienquellen-Management

#### GET `/api/media_sources`
**Beschreibung:** Liest alle konfigurierten Medienquellen
**Response:** Array von MediaSourceConfig-Objekten

**Struktur:**
```json
[
  {
    "name": "Progressive Daily",
    "influence_factor": 0.8,
    "ideological_position": {
      "economic_axis": -0.6,
      "social_axis": 0.7
    }
  }
]
```

#### POST `/api/media_sources`
**Beschreibung:** Speichert neue Medienquellen-Konfiguration
**Request Body:** Array von MediaSourceConfig-Objekten

---

### 6. Milieus-Management

#### GET `/api/milieus`
**Beschreibung:** Liest die Milieu-Konfiguration
**Response:** Array von MilieuConfig-Objekten

#### POST `/api/milieus`
**Beschreibung:** Speichert Milieu-Konfiguration

#### GET `/api/initial_milieus`
**Beschreibung:** Liest initiale Milieu-Verteilung

#### POST `/api/initial_milieus`
**Beschreibung:** Speichert initiale Milieu-Verteilung

---

### 7. Output-Schablonen

#### GET `/api/output_schablonen`
**Beschreibung:** Liest Output-Klassifizierungs-Schablonen
**Response:** Array von OutputSchabloneConfig

**Beispiel:**
```json
[
  {
    "name": "Left-Wing",
    "color": "#ff6b6b",
    "x_min": -1.0,
    "x_max": -0.3,
    "y_min": -1.0,
    "y_max": 1.0
  }
]
```

#### POST `/api/output_schablonen`
**Beschreibung:** Speichert Output-Schablonen

---

### 8. Recording Management

#### POST `/api/recording/start`
**Beschreibung:** Startet CSV-Aufzeichnung der Simulation
**Request Body:**
```json
{
  "preset_name": "experiment_1"
}
```

#### POST `/api/recording/stop`
**Beschreibung:** Stoppt die laufende Aufzeichnung

#### GET `/api/recordings`
**Beschreibung:** Listet alle verfügbaren CSV-Aufzeichnungen
**Response:**
```json
[
  {
    "filename": "experiment_1_20251009_143052.csv",
    "size": 2048576,
    "modified": 1696864252.123
  }
]
```

#### GET `/api/recordings/{filename}`
**Beschreibung:** Download einer spezifischen CSV-Datei
**Response:** CSV-Datei (text/csv)

---

## Simulation Management

### SimulationManager (Singleton)

Die `SimulationManager`-Klasse verwaltet den Lebenszyklus des PoliticalModel.

#### Methoden:

**`reset_model(num_agents: int = 100, network_connections: int = 5)`**
- Erstellt eine neue Modell-Instanz
- Initialisiert Agenten mit konfigurierten Parametern
- Setzt den Simulationsschritt auf 0 zurück

**`step_model() -> Optional[Dict[str, Any]]`**
- Führt einen Simulationsschritt aus
- Ruft `model.step()` auf (delegiert zu SimulationCycle)
- Gibt aktualisierte Modelldaten zurück

**`get_model_data() -> Optional[Dict[str, Any]]`**
- Holt den vollständigen Model Report
- Enthält Agentendaten, Metriken, Umweltstatus

---

## Agenten-System

### PoliticalAgent

Jeder Agent besitzt einen `AgentState` mit folgenden Attributen:

#### Persönliche Eigenschaften:
- `alter` (int): Alter des Agenten
- `bildung` (float): Bildungslevel [0, 1]
- `kognitive_kapazitaet_basis` (float): Basiswert für kognitive Fähigkeiten
- `effektive_kognitive_kapazitaet` (float): Dynamisch, abhängig von Stress/Armut
- `vertraeglichkeit` (float): Persönlichkeitsmerkmal

#### Ökonomische Eigenschaften:
- `vermoegen` (float): Vermögen
- `einkommen` (float): Einkommen pro Schritt
- `sozialleistungen` (float): Erhaltene Sozialleistungen
- `konsumquote` (float): Anteil des Einkommens für Konsum
- `ersparnis` (float): Ersparnisse pro Schritt
- `risikoaversion` (float): Dynamisch, abhängig vom Vermögen

#### Politische Eigenschaften:
- `freedom_preference` (float): Präferenz für individuelle Freiheit [0, 1]
- `altruism_factor` (float): Altruismus/Gemeinwohlorientierung [0, 1]
- `politische_wirksamkeit` (float): Gefühl der politischen Selbstwirksamkeit
- `zeitpraeferenzrate` (float): Präferenz für Gegenwart vs. Zukunft

#### Soziale Eigenschaften:
- `sozialkapital` (float): Netzwerk und soziale Ressourcen
- `region` (str): Zugeordnetes Biom/Region
- `position` (Tuple[float, float]): 2D-Position auf Karte
- `milieu` (str): Dynamische Milieu-Zuordnung
- `initial_milieu` (str): Ursprüngliches Milieu
- `schablone` (str): Output-Klassifizierung (z.B. "Left-Wing")

### Agent-Methoden:

**`decide_and_act(ersparnis: float, params: dict) -> dict`**
- Trifft Investment-Entscheidung basierend auf Risikoaversion
- Berechnet Investment-Ergebnis (Erfolg/Misserfolg)
- Aktualisiert Vermögen direkt

**`learn(delta_u_ego: float, delta_u_sozial: float, env_health: float, biome_capacity: float, learning_params: dict)`**
- Aktualisiert Altruismus basierend auf:
  - Eigener Wohlstandsänderung (`delta_u_ego`)
  - Umweltqualitätsänderung (`delta_u_sozial`)
  - Umweltzustand (`env_health`, `biome_capacity`)
- Verwendet Formula Registry wenn aktiviert, sonst Fallback-Formel

**`learn_from_media(source: MediaSourceConfig, influence_factor: float, params: dict)`**
- Passt politische Präferenzen an Medienquelle an
- Beeinflusst `freedom_preference`
- Moderiert durch Bildung und kognitive Kapazität

**`update_psychological_states(params: dict)`**
- Aktualisiert `effektive_kognitive_kapazitaet` (Armutsstrafe)
- Aktualisiert `risikoaversion` basierend auf Vermögen
- Implementiert Verhaltensökonomie-Prinzipien

---

## Manager-Komponenten

### ResourceManager
**Verantwortlichkeit:** Verwaltet natürliche Ressourcen in Biomen

**Methoden:**
- `update_resources()`: Regeneriert Ressourcen basierend auf Biom-Parametern
- `consume_resources(biome: str, amount: float)`: Verbraucht Ressourcen
- `get_resource_level(biome: str) -> float`: Holt aktuellen Ressourcenlevel

### HazardManager
**Verantwortlichkeit:** Simuliert Naturkatastrophen

**Methoden:**
- `check_hazards()`: Überprüft probabilistische Hazards pro Biom
- `apply_hazard(biome: str, agents: List[Agent])`: Wendet Schaden auf Agenten an
- `get_hazard_probability(biome: str) -> float`: Effektive Hazard-Wahrscheinlichkeit

**Dynamik:**
- Hazard-Wahrscheinlichkeit sinkt bei hohem Altruismus/Investments
- Regenerationsrate steigt bei hoher Umweltinvestition

### MediaManager
**Verantwortlichkeit:** Verwaltet Medienkonsum

**Methoden:**
- `select_media_for_agent(agent: Agent) -> MediaSourceConfig`: Wählt Medienquelle basierend auf ideologischer Nähe
- `apply_media_influence(agent: Agent, source: MediaSourceConfig)`: Wendet Medieneinfluss an

### SeasonalityManager
**Verantwortlichkeit:** Simuliert saisonale Effekte (optional/experimentell)

**Methoden:**
- `get_seasonal_modifier(step: int, biome: str) -> float`: Berechnet saisonale Modifikatoren

---

## Konfigurations-Management

### ConfigManager

**Konfigurationsdateien:**
- `config.yml`: Hauptkonfiguration (FullConfig)
- `media_sources.yml`: Medienquellen
- `milieus.yml`: Milieu-Definitionen
- `initial_milieus.yml`: Initiale Verteilung
- `output_schablonen.yml`: Klassifizierungs-Schablonen

**Methoden:**
```python
get_config() -> FullConfig
save_config(config_data: FullConfig)
get_media_sources() -> List[MediaSourceConfig]
save_media_sources(sources_data: List[Dict])
get_milieus() -> List[MilieuConfig]
save_milieus(milieus_data: List[Dict])
get_initial_milieus() -> List[InitialMilieuConfig]
save_initial_milieus(milieus_data: List[Dict])
get_output_schablonen() -> List[OutputSchabloneConfig]
save_output_schablonen(schablonen_data: List[Dict])
```

### FullConfig-Struktur:
```yaml
biomes:
  - name: "Urban"
    capacity: 1000
    regeneration_rate: 0.05
    hazard_probability: 0.02
    initial_quality: 80

agent_initialization:
  initial_wealth_mean: 10000
  initial_wealth_std: 5000

agent_dynamics:
  learning_rate: 0.1
  max_investment_rate: 0.3
  investment_return_factor: 1.5

simulation_parameters:
  grid_size: 100
  environmental_capacity: 1000
```

---

## Formula Registry

Die Formula Registry ermöglicht dynamisches Management von Berechnungsformeln.

### Hauptfunktionen:

**1. Formula-Versioning:**
- Jede Formel hat Versionen (z.B. "1.0.0", "1.1.0")
- Status: "draft" oder "released"
- Metadaten: created_by, created_at, released_by

**2. Pin-System:**
```json
{
  "altruism_update": "1.0.0",
  "consumption_rate": "2.1.0",
  "investment_amount": "1.0.0"
}
```

**3. Validation & Compilation:**
- Validiert Sympy-Ausdrücke
- Kompiliert zu Numpy-optimierten Funktionen
- Cached für Performance

**4. Testing:**
- Golden Tests: Vordefinierte Input/Output-Paare
- Property Tests: Range, Monotonicity, Pairwise

### API-Endpunkte:

#### GET `/api/formulas`
Listet alle verfügbaren Formeln

#### GET `/api/formulas/{name}`
Holt Details zu einer Formel (alle Versionen, aktiv, draft)

#### PUT `/api/formulas/{name}`
Erstellt/Aktualisiert eine Formel
**Authentifizierung:** Editor-Rolle erforderlich

**Request Body:**
```json
{
  "version": "1.0.0",
  "expression": "prev_altruism + eta * (delta_u_sozial - delta_u_ego)",
  "inputs": [
    {"name": "prev_altruism", "type": "float"},
    {"name": "eta", "type": "float"},
    {"name": "delta_u_sozial", "type": "float"},
    {"name": "delta_u_ego", "type": "float"}
  ],
  "allowed_symbols": ["Min", "Max"],
  "tests": {
    "golden": [
      {
        "name": "baseline",
        "input": {"prev_altruism": 0.5, "eta": 0.1, "delta_u_sozial": 1.0, "delta_u_ego": 0.5},
        "expected": 0.55
      }
    ]
  }
}
```

#### POST `/api/validate`
Validiert eine Formel-Version

#### POST `/api/compile`
Kompiliert eine Formel zu ausführbarem Code

#### POST `/api/test`
Führt Tests für eine Formel aus

#### POST `/api/release`
Markiert eine Formel-Version als "released"
**Authentifizierung:** Approver-Rolle erforderlich

#### GET `/api/pins`
Holt aktuelle Pin-Konfiguration

#### PUT `/api/pins`
Setzt neue Pin-Konfiguration
**Authentifizierung:** Operator-Rolle erforderlich

#### GET `/api/versions/{name}`
Listet alle Versionen einer Formel

### Audit-System:

#### GET `/api/audit`
Holt Audit-Logs
**Query-Parameter:**
- `limit` (int): Maximale Anzahl Einträge
- `offset` (int): Start-Offset
- `action` (str): Filter nach Aktion
- `formula` (str): Filter nach Formel
- `version` (str): Filter nach Version
- `since` (ISO datetime): Filter nach Startzeit
- `until` (ISO datetime): Filter nach Endzeit

**Response:**
```json
{
  "items": [
    {
      "ts": "2025-10-09T14:32:15Z",
      "action": "compile",
      "formula": "altruism_update",
      "version": "1.0.0",
      "request_id": "uuid-...",
      "user_role": "editor"
    }
  ],
  "next_offset": 100,
  "total_estimate": 523
}
```

#### POST `/api/audit/mark`
Fügt benutzerdefinierten Audit-Eintrag hinzu
**Authentifizierung:** Operator/Approver-Rolle erforderlich

---

## Recording & Export

### CSV-Recording-System

**Features:**
- Kontinuierliche Aufzeichnung während Simulation
- Automatische Dateinamen mit Timestamp
- Flush nach jedem Schritt (Datenintegrität)

**CSV-Spalten:**
- `step`: Simulationsschritt
- `Mean_Freedom`: Durchschnittliche Freiheitspräferenz
- `Mean_Altruism`: Durchschnittlicher Altruismus
- `Polarization`: Polarisierungsmaß
- `Durchschnittsvermoegen`: Durchschnittliches Vermögen
- `Durchschnittseinkommen`: Durchschnittliches Einkommen
- `Durchschnittlicher_Konsum`: Durchschnittlicher Konsum
- `Gini_Vermoegen`: Gini-Koeffizient für Vermögen
- `Gini_Einkommen`: Gini-Koeffizient für Einkommen
- `Hazard_Events_Count`: Anzahl Naturkatastrophen
- `Population_{region}`: Bevölkerung pro Region
- `Investment_{biome}`: Investitionen pro Biom
- `Hazard_Prob_{biome}`: Hazard-Wahrscheinlichkeit pro Biom
- `Regen_Rate_{biome}`: Regenerationsrate pro Biom

**Verwendung:**
```python
# Start recording
requests.post("http://localhost:8000/api/recording/start",
              json={"preset_name": "my_experiment"})

# Run simulation
for i in range(100):
    requests.post("http://localhost:8000/api/simulation/step",
                  auth=HTTPBasicAuth("user", "pass"))

# Stop recording
requests.post("http://localhost:8000/api/recording/stop")

# Download
response = requests.get("http://localhost:8000/api/recordings/my_experiment_20251009_143052.csv")
```

---

## WebSocket Events

### Verbindung:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
```

### Event-Typen:

**1. Ping Event:**
```json
{
  "message": "ping"
}
```
Gesendet alle 5 Sekunden zur Verbindungsprüfung.

**2. Simulation Update:**
```json
{
  "step": 42,
  "model_report": {
    "Mean_Freedom": 0.542,
    "Mean_Altruism": 0.634,
    "Polarization": 0.234,
    "Durchschnittsvermoegen": 12543.23,
    "Gini_Vermoegen": 0.456,
    "Hazard_Events_Count": 2,
    "Regions": {
      "Urban": 45,
      "Rural": 35,
      "Industrial": 20
    },
    "layout": [
      {"name": "Urban", "x_min": 0, "x_max": 33.33},
      {"name": "Industrial", "x_min": 33.33, "x_max": 66.66},
      {"name": "Rural", "x_min": 66.66, "x_max": 100}
    ],
    "events": [
      {"type": "hazard", "biome": "Rural", "severity": 0.7}
    ],
    "biomes_dynamic_data": {
      "Urban": {
        "total_investment": 5432.1,
        "effective_hazard_probability": 0.015,
        "effective_regeneration_rate": 0.065
      }
    }
  },
  "agent_visuals": [
    {
      "id": 1,
      "position": [23.4, 56.7],
      "position_history": [[22.1, 55.3], [23.4, 56.7]],
      "political_position": {"a": -0.3, "b": 0.5},
      "region": "Urban",
      "schablone": "Left-Wing",
      "milieu": "Links-Liberal",
      "alter": 35,
      "vermoegen": 15000,
      "einkommen": 3500
    }
  ]
}
```

### Verbindungsmanagement:

**ConnectionManager:**
- Verwaltet alle aktiven WebSocket-Verbindungen
- `connect(websocket: WebSocket)`: Fügt neue Verbindung hinzu
- `disconnect(websocket: WebSocket)`: Entfernt Verbindung
- `broadcast(message: dict)`: Sendet an alle Clients

---

## Authentifizierung

### HTTP Basic Authentication

**Setup:**
```bash
# .env.production
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
```

**Geschützte Endpunkte:**
- POST `/api/simulation/reset`
- POST `/api/simulation/step`
- POST `/api/config`
- PATCH `/api/config`
- Alle Formula Registry Schreiboperationen

**Verwendung:**
```python
from requests.auth import HTTPBasicAuth

response = requests.post(
    "http://localhost:8000/api/simulation/reset",
    json={"num_agents": 100},
    auth=HTTPBasicAuth("admin", "password")
)
```

**Frontend:**
```typescript
// hooks/useAuth.ts
const login = async (username: string, password: string) => {
  const credentials = btoa(`${username}:${password}`);
  localStorage.setItem('authCredentials', credentials);
  setIsAuthenticated(true);
};

// Axios Interceptor
axios.interceptors.request.use(config => {
  const credentials = localStorage.getItem('authCredentials');
  if (credentials) {
    config.headers.Authorization = `Basic ${credentials}`;
  }
  return config;
});
```

### Rollen-basierte Autorisierung (Formula Registry):

**Rollen:**
- `editor`: Kann Formeln erstellen/bearbeiten
- `operator`: Kann Pins setzen und Custom Audits erstellen
- `approver`: Kann Formeln releasen
- `auditor`: Kann Audit-Logs einsehen

**Header:**
```
X-User-Role: editor
```

---

## Nutzungsbeispiele

### 1. Vollständiger Simulations-Workflow

```python
import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:8000"
AUTH = HTTPBasicAuth("admin", "password")

# 1. Reset simulation
reset_response = requests.post(
    f"{BASE_URL}/api/simulation/reset",
    json={"num_agents": 200, "network_connections": 10},
    auth=AUTH
)
print(f"Initial state: {reset_response.json()['step']}")

# 2. Start recording
requests.post(
    f"{BASE_URL}/api/recording/start",
    json={"preset_name": "experiment_baseline"}
)

# 3. Run simulation
for step in range(100):
    step_response = requests.post(
        f"{BASE_URL}/api/simulation/step",
        auth=AUTH
    )
    print(f"Step {step + 1} completed")

# 4. Stop recording
requests.post(f"{BASE_URL}/api/recording/stop")

# 5. Get final state
final_state = requests.get(f"{BASE_URL}/api/simulation/data")
print(f"Final metrics: {final_state.json()['model_report']}")

# 6. List recordings
recordings = requests.get(f"{BASE_URL}/api/recordings").json()
print(f"Available recordings: {[r['filename'] for r in recordings]}")
```

### 2. Konfiguration anpassen

```python
# Get current config
config = requests.get(f"{BASE_URL}/api/config").json()

# Modify learning parameters
config['agent_dynamics']['learning_rate'] = 0.15
config['agent_dynamics']['max_investment_rate'] = 0.4

# Save updated config
requests.post(
    f"{BASE_URL}/api/config",
    json=config,
    auth=AUTH
)

# Or use PATCH for partial update
requests.patch(
    f"{BASE_URL}/api/config",
    json={
        "agent_dynamics": {
            "learning_rate": 0.15
        }
    },
    auth=AUTH
)
```

### 3. WebSocket Integration

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('Connected to simulation');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.message === 'ping') {
    console.log('Keep-alive ping');
    return;
  }

  // Simulation update
  console.log(`Step ${data.step}`);
  console.log(`Mean Altruism: ${data.model_report.Mean_Altruism}`);
  console.log(`Agents: ${data.agent_visuals.length}`);

  // Update visualization
  updateAgentMap(data.agent_visuals);
  updateMetricsChart(data.model_report);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected');
  // Implement reconnection logic
};
```

### 4. Formula Registry Workflow

```python
# 1. Create new formula
formula = {
    "version": "1.0.0",
    "expression": "prev_altruism + learning_rate * (delta_social - delta_ego)",
    "inputs": [
        {"name": "prev_altruism", "type": "float"},
        {"name": "learning_rate", "type": "float"},
        {"name": "delta_social", "type": "float"},
        {"name": "delta_ego", "type": "float"}
    ],
    "tests": {
        "golden": [
            {
                "name": "baseline",
                "input": {
                    "prev_altruism": 0.5,
                    "learning_rate": 0.1,
                    "delta_social": 1.0,
                    "delta_ego": 0.5
                },
                "expected": 0.55
            }
        ]
    }
}

# Create formula
requests.put(
    f"{BASE_URL}/api/formulas/altruism_update",
    json=formula,
    headers={"X-User-Role": "editor"}
)

# 2. Validate
validate_result = requests.post(
    f"{BASE_URL}/api/validate",
    json={"name": "altruism_update", "version": "1.0.0"},
    headers={"X-User-Role": "editor"}
).json()
print(f"Validation: {validate_result['ok']}")

# 3. Compile
compile_result = requests.post(
    f"{BASE_URL}/api/compile",
    json={"name": "altruism_update", "version": "1.0.0"},
    headers={"X-User-Role": "editor"}
).json()
print(f"Compiled: {compile_result['artifact_hash']}")

# 4. Test
test_result = requests.post(
    f"{BASE_URL}/api/test",
    json={"name": "altruism_update", "version": "1.0.0"},
    headers={"X-User-Role": "editor"}
).json()
print(f"Tests passed: {test_result['golden']['passed']}")

# 5. Release
requests.post(
    f"{BASE_URL}/api/release",
    json={"name": "altruism_update", "version": "1.0.0", "released_by": "scientist_1"},
    headers={"X-User-Role": "approver"}
)

# 6. Pin version
requests.put(
    f"{BASE_URL}/api/pins",
    json={"pins": {"altruism_update": "1.0.0"}},
    headers={"X-User-Role": "operator"}
)
```

---

## Datenmodelle

### AgentState (Vollständig)
```python
@dataclass
class AgentState:
    # Personal
    alter: int
    bildung: float
    kognitive_kapazitaet_basis: float
    effektive_kognitive_kapazitaet: float
    vertraeglichkeit: float

    # Economic
    vermoegen: float
    einkommen: float
    sozialleistungen: float
    konsumquote: float
    ersparnis: float
    risikoaversion: float
    zeitpraeferenzrate: float

    # Political
    freedom_preference: float
    altruism_factor: float
    politische_wirksamkeit: float

    # Social
    sozialkapital: float
    region: str
    position: Tuple[float, float]
    position_history: List[Tuple[float, float]]
    milieu: str
    initial_milieu: str
    schablone: str

    def calculate_political_position(self) -> Tuple[float, float]:
        """Berechnet (economic_axis, social_axis) aus Präferenzen"""
        economic_axis = (1 - self.altruism_factor) * 2 - 1
        social_axis = self.freedom_preference * 2 - 1
        return (economic_axis, social_axis)
```

### MediaSourceConfig
```python
@dataclass
class MediaSourceConfig:
    name: str
    influence_factor: float  # [0, 1]
    ideological_position: IdeologicalPosition

@dataclass
class IdeologicalPosition:
    economic_axis: float  # [-1, 1]
    social_axis: float     # [-1, 1]
```

### BiomeConfig
```python
@dataclass
class BiomeConfig:
    name: str
    capacity: float
    regeneration_rate: float
    hazard_probability: float
    initial_quality: float
    income_mean: float
    income_std: float
    wealth_mean: float
    wealth_std: float
```

---

## Performance-Hinweise

1. **Batch-Operationen:** Verwenden Sie `evaluate_batch` für Formula Registry bei mehreren Agenten
2. **WebSocket vs. Polling:** WebSocket-Updates sind effizienter als wiederholte GET-Requests
3. **Recording:** CSV-Recording hat minimalen Performance-Impact (< 1% Overhead)
4. **Agent-Anzahl:** Optimal: 100-500 Agents, Maximum getestet: 2000 Agents
5. **Caching:** Formula Registry cached kompilierte Formeln persistent

---

## Fehlerbehandlung

### HTTP Status Codes:
- `200 OK`: Erfolgreiche Anfrage
- `400 Bad Request`: Ungültige Parameter
- `403 Forbidden`: Fehlende Authentifizierung/Autorisierung
- `404 Not Found`: Ressource nicht gefunden
- `422 Unprocessable Entity`: Validierungsfehler
- `500 Internal Server Error`: Serverfehler

### Typische Fehler:

**1. Simulation nicht verfügbar:**
```json
{
  "detail": "Simulation model not available."
}
```
**Lösung:** Simulation mit `/api/simulation/reset` initialisieren

**2. Authentifizierung fehlgeschlagen:**
```json
{
  "detail": "Invalid credentials"
}
```
**Lösung:** Korrekte Basic Auth Credentials verwenden

**3. Formula Registry Pin-Fehler:**
```json
{
  "request_id": "uuid-...",
  "error": "forbidden",
  "reason": {"missing_pins": ["altruism_update"]}
}
```
**Lösung:** Fehlende Formeln pinnen oder `FORMULA_REGISTRY_LEGACY_ALLOWED=true` setzen

---

## Versionierung & Kompatibilität

**API Version:** 1.0.0
**Python:** 3.8+
**Node.js:** 16.0+
**Mesa:** 2.1.5+
**FastAPI:** Latest
**React:** 18.3

**Breaking Changes:**
- Mesa 3.2.0+ verwendet `agent_set` statt `schedule`
- WebSocket-Format hat sich in v1.0 geändert (neue Felder: `layout`, `events`)

---

## Support & Kontakt

- **GitHub:** https://github.com/infinimind-creations/abm2-digital-lab
- **Issues:** https://github.com/infinimind-creations/abm2-digital-lab/issues
- **Email:** cytrex@infinimind.dev
- **Dokumentation:** `/docs` (lokal nach Installation)

---

**Letzte Aktualisierung:** 2025-10-09
**Autor:** Cytrex / Infinimind Creations
**Lizenz:** MIT

---

## ⭐ Advanced Query Tools (NEU)

### POST `/api/agents/query`
**Beschreibung:** Query und Filter Agents mit mächtigen Aggregationen
**Authentifizierung:** Keine
**NEU in Version:** 1.1.0

**Request Body:**
```json
{
  "filters": {
    "vermoegen": {"min": 50000, "max": 100000},
    "milieu": ["Links-Liberal", "Rechts-Konservativ"],
    "region": "Prosperous Metropolis"
  },
  "fields": ["id", "vermoegen", "einkommen", "region"],
  "limit": 50,
  "aggregations": [
    "count",
    "mean_vermoegen",
    "sum_einkommen",
    "std_vermoegen",
    "distribution_milieu",
    "percentile_90_vermoegen"
  ]
}
```

**Response:**
```json
{
  "count": 15,
  "returned": 15,
  "agents": [
    {
      "id": 42,
      "vermoegen": 75432.50,
      "einkommen": 42000.00,
      "region": "Prosperous Metropolis"
    }
  ],
  "aggregations": {
    "count": 15,
    "mean_vermoegen": 75432.50,
    "sum_einkommen": 630000.00,
    "std_vermoegen": 12543.21,
    "distribution_milieu": {
      "Links-Liberal": 8,
      "Rechts-Konservativ": 7
    },
    "percentile_90_vermoegen": 89543.21
  }
}
```

### Filter-Typen:

**1. Range Filter:**
```json
{
  "vermoegen": {"min": 50000, "max": 100000}
}
```

**2. List Filter (IN):**
```json
{
  "milieu": ["Links-Liberal", "Rechts-Konservativ"]
}
```

**3. Exact Match:**
```json
{
  "region": "Prosperous Metropolis"
}
```

### Aggregations-Typen:

| Aggregation | Beschreibung | Beispiel |
|-------------|--------------|----------|
| `count` | Anzahl gefilterte Agents | `"count"` |
| `mean_<field>` | Durchschnitt | `"mean_vermoegen"` |
| `sum_<field>` | Summe | `"sum_einkommen"` |
| `std_<field>` | Standardabweichung | `"std_vermoegen"` |
| `min_<field>` | Minimum | `"min_alter"` |
| `max_<field>` | Maximum | `"max_vermoegen"` |
| `distribution_<field>` | Verteilung | `"distribution_milieu"` |
| `percentile_<N>_<field>` | N-tes Perzentil | `"percentile_90_vermoegen"` |

### Verfügbare Felder:

**Standard-Felder (ohne `fields` Parameter):**
- `id`, `vermoegen`, `einkommen`, `region`, `milieu`, `political_position`

**Alle verfügbaren Felder:**
- `alter`, `bildung`, `kognitive_kapazitaet_basis`, `effektive_kognitive_kapazitaet`
- `vertraeglichkeit`, `vermoegen`, `einkommen`, `sozialleistungen`
- `konsumquote`, `ersparnis`, `risikoaversion`, `zeitpraeferenzrate`
- `freedom_preference`, `altruism_factor`, `politische_wirksamkeit`
- `sozialkapital`, `region`, `milieu`, `initial_milieu`, `schablone`

### Anwendungsbeispiele:

**1. Reiche Agents finden:**
```python
response = requests.post(
    f"{BASE_URL}/api/agents/query",
    json={
        "filters": {"vermoegen": {"min": 50000}},
        "aggregations": ["count", "mean_vermoegen"],
        "limit": 10
    }
)
```

**2. Regionale Verteilung:**
```python
response = requests.post(
    f"{BASE_URL}/api/agents/query",
    json={
        "filters": {"region": "Industrial Zone"},
        "aggregations": ["count", "distribution_milieu", "mean_einkommen"]
    }
)
```

**3. Perzentil-Analyse:**
```python
response = requests.post(
    f"{BASE_URL}/api/agents/query",
    json={
        "aggregations": [
            "percentile_10_vermoegen",
            "percentile_50_vermoegen",
            "percentile_90_vermoegen"
        ]
    }
)
```

**4. Custom Fields:**
```python
response = requests.post(
    f"{BASE_URL}/api/agents/query",
    json={
        "filters": {"altruism_factor": {"min": 0.7}},
        "fields": ["id", "altruism_factor", "freedom_preference", "political_position"],
        "limit": 20
    }
)
```

### MCP Tool: `abm2_query_agents`

Verfügbar via MCP Server auf Port 3002.

**Verwendung in Claude Desktop:**
```
"Zeige mir alle Agents mit Vermögen über 50.000"
"Wie ist die Verteilung der Agents nach Milieu in der Industrial Zone?"
"Was ist das durchschnittliche Einkommen der reichsten 10% der Agents?"
"Finde alle hochaltruistischen Agents (>0.7) und zeige ihre politische Position"
```

---

**Letzte Aktualisierung:** 2025-10-11
**Autor:** Cytrex / Infinimind Creations
**Lizenz:** MIT
