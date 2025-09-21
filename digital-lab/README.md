# Digital Lab - Political Agent-Based Model Simulation

Ein interaktives Dashboard zur Visualisierung und Steuerung einer politischen Agentenbasierten Modellsimulation (ABM). Diese Anwendung ermöglicht die Echtzeitüberwachung von Agenten, Umweltfaktoren und politischen Dynamiken in einer sozio-ökologischen Simulation.

## 🏗️ Architektur

### Frontend (React + TypeScript)
- **Framework**: React 18 mit TypeScript
- **State Management**: Zustand (modular aufgeteilt)
- **UI Library**: Deck.GL für 2D-Visualisierungen
- **Build Tool**: Create React App
- **Styling**: CSS-in-JS mit CSS Custom Properties

### Backend (Python + FastAPI)
- **Framework**: FastAPI für REST API und WebSockets
- **Simulation**: Mesa Framework für Agent-Based Modeling
- **Konfiguration**: Pydantic + YAML
- **Real-time**: WebSocket-Verbindung für Live-Updates

## 📁 Projektstruktur

```
digital-lab/
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── components/           # React Komponenten (modular organisiert)
│   │   │   ├── config/          # Konfigurationsbezogene Komponenten
│   │   │   ├── dashboard/       # Dashboard und Monitoring
│   │   │   ├── simulation/      # Simulationsspezifische Komponenten
│   │   │   ├── ui/             # Wiederverwendbare UI-Komponenten
│   │   │   └── widgets/        # Dashboard Widget-Wrapper
│   │   ├── store/              # Zustand State Management (modular)
│   │   │   ├── useConnectionStore.ts    # WebSocket-Verbindung
│   │   │   ├── useDashboardStore.ts     # Layout & Widgets
│   │   │   ├── useAgentStore.ts         # Agent-spezifischer State
│   │   │   └── useSimulationStore.ts    # Simulationsdaten
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── styles/             # Globale Styling-Konfiguration
│   │   └── types.ts            # TypeScript Typdefinitionen
│   └── package.json
├── backend/                      # Python Backend
│   ├── config/                  # Konfigurationsmanagement (modular)
│   │   ├── models.py           # Pydantic Datenmodelle
│   │   ├── manager.py          # ConfigManager Klasse
│   │   └── validation.py       # Validierungslogik (erweiterbar)
│   ├── political_abm/          # ABM Simulation Core
│   │   ├── agents.py           # Agent-Definitionen
│   │   ├── model.py            # Hauptmodell (refaktoriert)
│   │   ├── agent_initializer.py # Agent-Erstellung (extrahiert)
│   │   ├── simulation_cycle.py  # Simulationszyklen (extrahiert)
│   │   ├── managers/           # Spezialisierte Manager
│   │   │   ├── hazard_manager.py
│   │   │   ├── media_manager.py
│   │   │   ├── resource_manager.py
│   │   │   └── seasonality_manager.py
│   │   └── *.yml               # Konfigurationsdateien
│   ├── main.py                 # FastAPI Server
│   └── requirements.txt
└── README.md                   # Diese Dokumentation
```

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 18+ und npm
- Python 3.9+ und pip
- Git

### Installation & Start

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd digital-lab
   ```

2. **Backend starten**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
   → Backend läuft auf http://localhost:8000

3. **Frontend starten** (neues Terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```
   → Frontend läuft auf http://localhost:3000

4. **Anwendung öffnen**
   → http://localhost:3000

## 🎛️ Funktionen

### Dashboard Features
- **🗺️ Agent Map**: 2D-Visualisierung aller Agenten mit verschiedenen Farbkodierungen (Politik, Milieu, Vermögen, etc.)
- **📊 Metrics Dashboard**: Echtzeitmetriken zu Gini-Koeffizient, Durchschnittswerten und Umweltqualität
- **🔍 Agent Inspector**: Detailansicht für individuelle Agenten mit allen Eigenschaften
- **📝 Event Log**: Chronolog aller Simulationsereignisse (Hazards, Schwellenwerte, etc.)

### Simulation Controls
- **▶️ Start/Stop**: Kontinuierliche Simulation mit konfigurierbarer Geschwindigkeit
- **⏭️ Step**: Einzelschritt oder Multi-Step Ausführung
- **⟳ Reset**: Simulation zurücksetzen mit neuen Parametern

### Konfiguration
- **🌍 Biome Editor**: Konfiguration der verschiedenen Lebensräume
- **👥 Milieu Editor**: Definition von sozialen Milieus und deren Eigenschaften
- **📺 Media Editor**: Konfiguration der Medienlandschaft
- **⚙️ Parameter Tuning**: Globale Simulations- und Lernparameter

## 🏛️ Architektur-Details

### Frontend State Management
Das Frontend verwendet eine **modulare Zustand-Architektur** mit spezialisierten Stores:

- **`useConnectionStore`**: WebSocket-Verbindung und Callback-Management
- **`useDashboardStore`**: Widget-Layout, Kollaps-Status und Dashboard-Konfiguration  
- **`useAgentStore`**: Agenten-Auswahl und Visualisierungsoptionen
- **`useSimulationStore`**: Simulationsdaten, -kontrolle und History

### Backend Architecture
Das Backend folgt dem **Single Responsibility Principle** mit klarer Aufgabentrennung:

- **`PoliticalModel`**: Hauptorchestrierung (stark vereinfacht)
- **`AgentInitializer`**: Agenten-Erstellung und Netzwerk-Setup
- **`SimulationCycle`**: 9-phasiger Simulationszyklus
- **`ConfigManager`**: Konfigurationsverwaltung mit Pydantic-Validierung
- **Specialized Managers**: Hazard, Media, Resource, Seasonality

### Real-time Communication
- **WebSocket-Verbindung**: Bidirektionale Kommunikation zwischen Frontend und Backend
- **Event-driven Updates**: Simulation sendet Updates bei jedem Schritt
- **Callback Registration**: Lose Kopplung zwischen Stores über Callback-Pattern

## 🔧 Entwicklung

### Code-Qualität
- **ESLint + TypeScript**: Statische Code-Analyse im Frontend
- **Pydantic**: Typsichere Konfigurationsverwaltung im Backend
- **Modular Organization**: Klare Trennung von Verantwortlichkeiten

### Testing
```bash
# Frontend Tests
cd frontend && npm test

# Backend Tests (falls vorhanden)
cd backend && python -m pytest
```

### Build für Produktion
```bash
# Frontend Build
cd frontend && npm run build

# Backend Requirements
cd backend && pip freeze > requirements.txt
```

## 🎨 UI/UX Features

### Responsive Design
- **Grid Layout**: react-grid-layout für drag-and-drop Widget-Anordnung
- **Collapsible Widgets**: Platz sparen durch einklappbare Komponenten
- **Dark Theme**: Augenschonende dunkle Benutzeroberfläche

### Visualisierungen
- **Deck.GL Integration**: Hardware-beschleunigte 2D-Rendering
- **Dynamic Coloring**: Mehrere Farbkodierungen für Agenten
- **Interactive Maps**: Klickbare Agenten mit Echtzeit-Details

## 🔄 Refactoring History

Diese Anwendung wurde umfassend refaktoriert für bessere Wartbarkeit:

### Frontend Refactoring
1. **Component Organization**: Flache Struktur → modulare Unterverzeichnisse
2. **State Management**: Monolithischer Store → spezialisierte Stores
3. **UI Harmonization**: Inline-Styles → CSS Variables + Theme System
4. **Dead Code Removal**: 4 ungenutzte Dateien entfernt

### Backend Refactoring  
1. **Model Decomposition**: Monolithisches Model → spezialisierte Klassen
2. **Config Modularization**: Einzelne Datei → config/ Package mit models/manager
3. **Single Responsibility**: Jede Klasse hat eine klar definierte Aufgabe
4. **NetworkX Bug Fix**: Barabási-Albert Graph Validierung

## 📖 API-Dokumentation

### REST Endpoints
- `GET /api/simulation/data` - Aktuelle Simulationsdaten
- `POST /api/simulation/step` - Einzelschritt ausführen  
- `POST /api/simulation/reset` - Simulation zurücksetzen
- `GET /api/config` - Aktuelle Konfiguration abrufen
- `POST /api/config` - Konfiguration aktualisieren

### WebSocket Events
- `simulation_update` - Neue Simulationsdaten verfügbar
- `connection_established` - Verbindung erfolgreich aufgebaut

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add some AmazingFeature'`)  
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt steht unter der [MIT Lizenz](LICENSE).

## 🆘 Support

Bei Fragen oder Problemen öffne bitte ein [Issue](../../issues) auf GitHub.

---

**Entwickelt mit ❤️ für die politische Simulationsforschung**