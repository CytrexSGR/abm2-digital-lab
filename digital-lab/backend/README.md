# ABM² Digital Lab Backend

Hochperformanter Backend-Service für die Political Agent-Based Model Simulation mit FastAPI, Mesa und WebSocket-Unterstützung. Vollständig refaktoriert 2024/25 für maximale Modularität und Skalierbarkeit.

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](#)
[![Mesa](https://img.shields.io/badge/Mesa-2.1.5-orange.svg)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Refactored-purple.svg)](#)

## 🚀 Quick Start

```bash
pip install -r requirements.txt
python main.py
```

Das Backend läuft auf http://localhost:8000

## 📁 Projekt-Struktur

```
backend/
├── main.py                    # FastAPI Server & WebSocket Handler
├── simulation_manager.py      # Simulation Lifecycle Management  
├── connection_manager.py      # WebSocket Connection Management
├── formula_registry.py        # 🆕 Dynamische Formel-Engine
├── metrics.py                 # 🆕 Performance & Analytics
├── authz.py                   # 🆕 Authorization & Security
├── config/                    # 🔄 Konfigurationsmanagement (modular)
│   ├── models.py             # Pydantic Datenmodelle (148 Zeilen)
│   ├── manager.py            # ConfigManager Klasse (184 Zeilen)
│   ├── validation.py         # Validierungslogik (erweiterbar)
│   └── pins.json            # 🆕 Feature-Flag Konfiguration
├── political_abm/            # 🔄 Agent-Based Model Core (refaktoriert)
│   ├── model.py             # Hauptmodell (~200 Zeilen, -60%)
│   ├── agents.py            # Agent-Definitionen & Verhalten
│   ├── agent_initializer.py # 🆕 Agent-Erstellung & Netzwerk-Setup
│   ├── simulation_cycle.py  # 🆕 9-Phasen Simulationszyklus
│   ├── managers/            # 🔄 Spezialisierte Manager
│   │   ├── hazard_manager.py    # Naturkatastrophen
│   │   ├── media_manager.py     # Medienlandschaft
│   │   ├── resource_manager.py  # Ressourcenverwaltung
│   │   └── seasonality_manager.py # Saisonale Effekte
│   └── *.yml                # Konfigurationsdateien
├── data/                     # 🆕 Daten & Cache Management
│   ├── cache/               # Formula Registry Cache
│   ├── formulas/           # Formel-Definitionen (JSON)
│   └── audit.jsonl         # System-Audit-Log
└── presets/                  # Erweiterte vordefinierte Konfigurationen
    ├── milieus/             # 6 politische Archetypen
    ├── biomes/             # Multi-Biom Konfigurationen
    └── templates/          # Output-Templates
```

## 🎯 Hauptfunktionen

### REST API Endpoints
- `GET /api/simulation/data` - Aktuelle Simulationsdaten
- `POST /api/simulation/step` - Einzelschritt ausführen
- `POST /api/simulation/reset` - Simulation zurücksetzen
- `GET /api/config` - Konfiguration abrufen
- `POST /api/config` - Konfiguration aktualisieren

### WebSocket Events  
- `simulation_update` - Neue Simulationsdaten
- `connection_established` - Verbindung aufgebaut

### Agent-Based Model Features
- **🤖 Agent Simulation**: 1000+ Agenten mit individuellen politischen, ökonomischen und sozialen Eigenschaften
- **🌍 Multi-Biom Environment**: Urban, Rural, Coastal und weitere Lebensräume mit spezifischen Parametern
- **📺 Media Influence**: Dynamische Medienlandschaft mit konfigurierbaren Bias-Modellen
- **⚡ Hazard Events**: Naturkatastrophen und deren komplexe sozio-ökonomische Auswirkungen
- **🔄 Adaptive Learning**: Agenten mit adaptiven politischen Meinungsbildung und Konsumverhalten
- **🧮 Formula Registry**: 🆕 Dynamische Formelkonfiguration für alle Agent-Berechnungen
- **📊 Performance Monitoring**: 🆕 Echtzeit-Metriken und Profiling-Capabilities
- **🔐 Authorization System**: 🆕 Rollenbasierte Zugriffskontrolle für kritische Operationen

## 🏗️ Architektur

### Agent-Based Modeling (Mesa)
```python
class PoliticalAgent(Agent):
    def __init__(self, unique_id, model):
        self.political_position = {"a": economic_axis, "b": social_axis}  
        self.wealth = initial_wealth
        self.education = education_level
        # ... weitere Eigenschaften
        
    def step(self):
        # 9-phasiger Agenten-Schritt
        self.consume_resources()
        self.make_investments()  
        self.update_political_views()
        # ... weitere Aktionen
```

### Modular Manager System
```python
class PoliticalModel(Model):
    def __init__(self):
        self.resource_manager = ResourceManager(self)
        self.hazard_manager = HazardManager(self) 
        self.media_manager = MediaManager(self)
        self.seasonality_manager = SeasonalityManager(self)
        
    def step(self):
        # Delegierte an SimulationCycle
        self.simulation_cycle.execute_step()
```

### Configuration Management
```python
# config/models.py - Pydantic Models
class BiomeConfig(BaseModel):
    name: str
    population_percentage: float
    hazard_probability: float
    # ... weitere Parameter

# config/manager.py - Configuration Logic  
class ConfigManager:
    def get_config(self) -> FullConfig:
        # YAML laden und validieren
    def save_config(self, config: FullConfig):
        # Validieren und speichern
```

## 🔧 Development

### Virtual Environment Setup
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Development Mode
```bash
# Mit Auto-Reload
python main.py

# Mit Debug-Logging
DEBUG=1 python main.py

# Spezifischer Port
PORT=8080 python main.py
```

### API Documentation
Nach dem Start verfügbar unter:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

```bash
# Unit Tests (falls implementiert)
python -m pytest

# API Tests
python -m pytest tests/test_api.py

# Simulation Tests  
python -m pytest tests/test_model.py
```

## ⚙️ Konfiguration

### Umgebungsvariablen
```bash
# .env Datei
DEBUG=false
CORS_ORIGINS=http://localhost:3000,http://192.168.178.55:3000
MAX_AGENTS=1000
SIMULATION_SPEED=500  # milliseconds
```

### YAML Konfiguration
```yaml
# political_abm/config.yml
biomes:
  - name: "Urban"
    population_percentage: 60.0
    hazard_probability: 0.1
    # ... weitere Parameter

simulation_parameters:
  environmental_capacity: 1000.0
  media_influence_factor: 0.3
  # ... weitere Parameter
```

## 🔌 WebSocket Integration

### Connection Management
```python
# connection_manager.py
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)
```

### Real-time Updates
```python
# main.py
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    
    # Simulation Updates senden
    await connection_manager.broadcast({
        "type": "simulation_update",
        "data": simulation_data
    })
```

## 📊 Performance

### Simulation Optimization
- **Batch Operations**: Gruppierte Agent-Updates
- **Selective Updates**: Nur veränderte Daten senden
- **Memory Management**: Effiziente Datenstrukturen
- **Async Processing**: Non-blocking WebSocket Communication

### Monitoring
```python
import time
import logging

@measure_execution_time
def simulation_step():
    start = time.time()
    # ... simulation logic
    logging.info(f"Step took {time.time() - start:.3f}s")
```

## 🔍 Debugging

### Logging Setup
```python
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Common Issues
```bash
# Config-Pfad Probleme nach Refactoring
FileNotFoundError: config.yml not found
# Lösung: CONFIG_PATH in config/manager.py prüfen

# NetworkX Graph Fehler  
ValueError: Barabási–Albert network must have m >= 1 and m < n
# Lösung: Bereits behoben in agent_initializer.py
```

## 🚀 Deployment

### Production Setup
```bash
# Gunicorn für Production
pip install gunicorn
gunicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Mit SSL
gunicorn main:app --certfile cert.pem --keyfile key.pem
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📚 Dependencies

### Core Dependencies
```
fastapi>=0.104.0          # Web Framework
uvicorn>=0.24.0           # ASGI Server  
websockets>=12.0          # WebSocket Support
pydantic>=2.4.0           # Data Validation
mesa>=2.1.5               # Agent-Based Modeling
pyyaml>=6.0.1             # Configuration Files
numpy>=1.24.0             # Numerical Computing
networkx>=3.2             # Graph/Network Analysis
```

### Development Dependencies
```
pytest>=7.4.0             # Testing Framework
black>=23.0.0             # Code Formatting
pylint>=3.0.0             # Code Linting  
mypy>=1.7.0               # Type Checking
```

## 🤝 Contributing

1. Neue Features in separaten Branches entwickeln
2. Code-Style mit `black` und `pylint` einhalten
3. Tests für neue Funktionalität hinzufügen
4. Dokumentation aktualisieren

## 📄 API Reference

Vollständige API-Dokumentation nach Server-Start verfügbar unter `/docs`.

---

*Mesa-basierte ABM-Simulation für politische Forschung*