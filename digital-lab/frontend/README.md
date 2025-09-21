# ABM² Digital Lab - Frontend

React-basiertes Frontend für die Political Agent-Based Model Simulation mit modernster Visualisierung und interaktiver Benutzeroberfläche. Vollständig refaktoriert 2024/25 für maximale Modularität und Performance.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](#)
[![Deck.GL](https://img.shields.io/badge/Deck.GL-9.1-green.svg)](#)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-orange.svg)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Refactored-purple.svg)](#)

## 🚀 Quick Start

```bash
cd digital-lab/frontend
npm install
npm start
```

Die Anwendung läuft auf **http://localhost:3000**

## 📋 Inhaltsverzeichnis

- [Hauptfunktionen](#hauptfunktionen)
- [Architektur-Überblick](#architektur-überblick)
- [Komponenten-Struktur](#komponenten-struktur)
- [State Management](#state-management)
- [Visualisierung](#visualisierung)
- [Verfügbare Scripts](#verfügbare-scripts)
- [Development](#development)
- [Performance](#performance)
- [Neue Features](#neue-features)

## ⭐ Hauptfunktionen

### 🗺️ **Agent Map Visualisierung**
- **2D Biome-Layout**: Geografische Verteilung von Agenten auf 4 konfigurierbaren Biomes
- **Hardware-Beschleunigung**: Deck.GL WebGL-Rendering für 1000+ Agenten
- **Dynamische Farbkodierung**: Politik, Milieu, Vermögen, Einkommen, Risikoaversion
- **Interaktive Inspektion**: Klick auf Agenten für Detailansicht
- **Live-Updates**: Echtzeit-Aktualisierung während Simulation

### 📊 **Dashboard-System**
- **Modulares Widget-System**: Drag-and-drop Layout mit React-Mosaic
- **Live-Metriken**: Gini-Koeffizient, Durchschnittswerte, Ereignis-Tracking
- **Sparklines**: Mini-Charts für Trend-Visualisierung
- **Population Monitor**: Milieu- und Template-Verteilungen
- **Event Log**: Chronologische Aufzeichnung aller Simulationsereignisse

### ⚙️ **Erweiterte Konfiguration**
- **BiomeEditor**: Geografische Bevölkerungsverteilung mit `population_percentage`
- **InitialPopulationEditor**: 6-Milieu-System mit politischen Archetypen
- **Preset-Management**: Laden und Speichern von Konfigurationsvorlagen
- **Live-Validierung**: Automatische Überprüfung von Parametern

### 🎛️ **Simulation Controls**
- **Start/Stop**: Kontinuierliche Simulation (500ms Intervall)
- **1 Step**: Einzelschritt für präzise Analyse
- **10 Steps**: Schnelle Progression durch mehrere Schritte
- **Reset**: Neue Simulation mit aktueller Konfiguration
- **Hotkeys**: Tastaturkürzel für alle Controls

## 🏗️ Architektur-Überblick

### Frontend-Stack
```
React 18.3 + TypeScript 4.9
├── State Management: Zustand 5.0
├── Visualisierung: Deck.GL 9.1
├── Charts: Recharts 3.1
├── Layout: React-Mosaic
├── HTTP Client: Axios 1.11
├── Icons: React-Icons 5.5
└── Build: Create React App 5.0
```

### Datenfluss-Architektur
```
┌─────────────────┐    WebSocket     ┌─────────────────┐
│   Backend       │◄───────────────►│   Frontend      │
│   FastAPI       │    HTTP/REST     │   React + TS    │
└─────────────────┘                  └─────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│ Agent-Based     │                  │ State Stores    │
│ Model (Mesa)    │                  │ (Zustand)       │
│ ├─ Biomes       │                  │ ├─ Connection   │
│ ├─ Milieus      │                  │ ├─ Simulation   │
│ └─ Agents       │                  │ ├─ Dashboard    │
└─────────────────┘                  │ └─ Agents       │
                                     └─────────────────┘
```

## 📁 Komponenten-Struktur

```
src/
├── 📱 components/                    # React Komponenten (modular organisiert)
│   ├── config/                     # Konfigurationsbezogene UI
│   │   ├── BiomeEditor.tsx         # 🌍 Biome-Konfiguration mit population_percentage
│   │   ├── InitialPopulationEditor.tsx # 🎨 6-Milieu-System Management
│   │   ├── MilieuCard.tsx          # Einzelne Milieu-Karte
│   │   ├── MediaEditor.tsx         # Medienquellen-Konfiguration
│   │   └── ConfigurationPanel.tsx  # Hauptkonfigurationsbereich
│   ├── dashboard/                  # Dashboard & Monitoring
│   │   ├── LiveDashboard.tsx       # Haupt-Dashboard Layout
│   │   ├── MetricsDashboard.tsx    # Metriken-Übersicht
│   │   ├── PopulationMonitor.tsx   # Population-Analyse
│   │   └── BiomeMonitor.tsx        # Biome-spezifische Metriken
│   ├── simulation/                 # Simulationsspezifische Komponenten
│   │   ├── AgentMap.tsx           # 🗺️ 2D Agent-Visualisierung (Deck.GL)
│   │   ├── AgentInspector.tsx     # 🔍 Detailansicht für Agenten
│   │   ├── SimulationControls.tsx # ⏯️ Start/Stop/Step Controls
│   │   └── EventLog.tsx           # Ereignis-Protokoll
│   ├── explorers/                 # Datenexplorer-Views
│   │   ├── EconomicExplorerView.tsx # Wirtschaftsdaten-Analyse
│   │   └── PoliticalExplorerView.tsx # Politische Daten-Analyse
│   ├── ui/                        # Wiederverwendbare UI-Komponenten
│   │   ├── Card.tsx              # Container-Komponente
│   │   ├── FormField.tsx         # Standardisierte Eingaben
│   │   ├── ActionButton.tsx      # Einheitliche Buttons
│   │   ├── DistributionEditor.tsx # Verteilungs-Editor
│   │   └── PresetManager.tsx     # Preset-Verwaltung
│   ├── widgets/                   # Dashboard Widget-Wrapper
│   │   ├── Widget.tsx            # Widget Base-Komponente
│   │   ├── AgentMapWidget.tsx    # Agent Map als Widget
│   │   ├── GlobalMetricsWidget.tsx # Globale Metriken
│   │   ├── TemplateDistributionWidget.tsx # Template-Verteilung
│   │   └── EventLogWidget.tsx    # Event Log als Widget
│   ├── DashboardGrid.tsx         # Grid-Layout Manager
│   └── DashboardLayout.tsx       # Haupt-Layout Komponente
├── 🏪 store/                      # Zustand State Management (modular)
│   ├── useConnectionStore.ts      # WebSocket-Verbindung & Status
│   ├── useDashboardStore.ts       # Layout & Widget-Management
│   ├── useAgentStore.ts          # Agent-Auswahl & Visualisierung
│   └── useSimulationStore.ts     # Simulationsdaten & -kontrolle
├── 🔧 hooks/                      # Custom React Hooks
│   └── useMilieuManagement.ts    # Hook für Milieu-Verwaltung
├── 🎨 styles/                     # Globale Styling-Konfiguration
│   ├── theme.ts                  # Design System & Farben
│   └── components.ts             # Styled Components
├── 🌐 api/                        # HTTP Client Konfiguration
│   └── axiosConfig.ts            # Axios Setup & Interceptors
└── 📄 types.ts                    # TypeScript Typdefinitionen
```

## 🏪 State Management

Das Frontend verwendet **spezialisierte Zustand-Stores** nach Domänen:

### Connection Store
```typescript
interface ConnectionState {
  isConnected: boolean;
  ws: WebSocket | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
}
```

### Simulation Store
```typescript
interface SimulationState {
  isRunning: boolean;
  simulationData: SimulationUpdatePayload | null;
  history: SimulationUpdatePayload[];
  
  // Actions
  runSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: (steps?: number) => void; // 🆕 Multi-Step Support
}
```

### Dashboard Store
```typescript
interface DashboardState {
  activeWidgets: string[];
  collapsedWidgets: string[];
  
  // Widget Management
  addWidget: (widgetId: string) => void;
  removeWidget: (widgetId: string) => void;
  toggleWidget: (widgetId: string) => void;
}
```

### Agent Store
```typescript
interface AgentState {
  selectedAgentId: string | null;
  agentColorAttribute: AgentColorAttribute;
  
  // Agent Selection
  selectAgent: (id: string | null) => void;
  setColorAttribute: (attr: AgentColorAttribute) => void;
}
```

## 🗺️ Visualisierung

### Agent Map (Deck.GL)
Hauptvisualisierung mit Hardware-beschleunigtem WebGL-Rendering:

```typescript
// Biome Layout Layer - Geografische Hintergründe
new SolidPolygonLayer({
  id: 'biome-layout-layer',
  data: biomeLayouts,
  getPolygon: d => getBiomePolygon(d),
  getFillColor: d => getBiomeColor(d)
});

// Agent Scatterplot Layer - Agent-Positionen
new ScatterplotLayer<AgentVisual>({
  id: 'agent-scatterplot',
  data: agents,
  getPosition: d => d.position,
  getRadius: 0.8,
  getFillColor: d => getAgentColor(d, colorAttribute),
  pickable: true,
  onClick: (info) => selectAgent(info.object?.id)
});
```

### Farbkodierung-System
Dynamische Agent-Färbung nach Attributen:

```typescript
type AgentColorAttribute = 
  | 'political'     // Politische Position (-1 bis 1)
  | 'milieu'        // Milieu-Zugehörigkeit (6 Archetypen)
  | 'vermoegen'     // Vermögen (Viridis-Farbskala)
  | 'einkommen'     // Einkommen (Plasma-Farbskala)
  | 'risikoaversion' // Risikoaversion (RdYlBu-Skala)
  | 'alter'         // Altersgruppen
  | 'bildung';      // Bildungsniveau
```

### Performance-Optimierungen
- **WebGL Hardware-Beschleunigung** für 1000+ Agenten
- **ViewState-Memoization** zur Vermeidung unnötiger Re-Renders
- **Layer-Caching** für statische Biome-Layouts
- **Selective Updates** nur für veränderte Agent-Daten

## 📋 Verfügbare Scripts

### `npm start`
Startet den Development Server mit Hot Reload auf Port 3000.
- **Features**: Live-Reload, TypeScript-Compilation, ESLint
- **Netzwerk**: HOST=0.0.0.0 für LAN-Zugriff

### `npm test`
Startet Jest Test Runner im Watch Mode.
- **Framework**: React Testing Library + Jest
- **Coverage**: `npm test -- --coverage`

### `npm run build`
Erstellt optimierte Production-Build im `build/` Verzeichnis.
- **Optimierungen**: Code-Splitting, Minification, Tree-Shaking
- **Bundle-Analyse**: `npx webpack-bundle-analyzer build/static/js/*.js`

### `npm run lint` (falls konfiguriert)
ESLint Code-Qualitätsprüfung für TypeScript/React.

## 🔧 Development

### Empfohlene VSCode Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss", 
    "esbenp.prettier-vscode",
    "ms-vscode.sublime-babel-vscode",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Code-Konventionen
- **Komponenten**: PascalCase (`BiomeEditor.tsx`)
- **Hooks**: camelCase mit "use" Prefix (`useMilieuManagement.ts`)
- **Stores**: camelCase mit "use" Prefix (`useSimulationStore.ts`)
- **Types**: PascalCase (`AgentVisual`, `BiomeConfig`)
- **Constants**: SCREAMING_SNAKE_CASE

### Import-Organisation
```typescript
// 1. Node Modules
import React from 'react';
import { create } from 'zustand';

// 2. Relative Imports (Komponenten)
import BiomeEditor from './BiomeEditor';
import Card from '../ui/Card';

// 3. Absolute Imports (Store/Types/API)
import { useSimulationStore } from '../../store/useSimulationStore';
import { BiomeConfig } from '../../types';
import { apiClient } from '../../api/axiosConfig';
```

### Theme System
Zentrales Design System mit CSS Custom Properties:

```typescript
export const theme = {
  colors: {
    background: '#1a1d23',    // Haupthintergrund
    surface: '#2a2d34',       // Karten/Panels
    primary: '#007acc',       // Primärfarbe
    secondary: '#4a9eff',     // Sekundärfarbe
    text: '#e0e0e0',         // Haupttext
    textSecondary: '#a0a0a0', // Sekundärtext
    border: '#3a3d44',       // Rahmen
    success: '#4caf50',      // Erfolgsmeldungen
    warning: '#ff9800',      // Warnungen
    error: '#f44336'         // Fehlermeldungen
  },
  spacing: {
    xs: '4px', sm: '8px', md: '16px', 
    lg: '24px', xl: '32px', xxl: '48px'
  },
  breakpoints: {
    sm: '640px', md: '768px', lg: '1024px', xl: '1280px'
  }
};
```

## ⚡ Performance

### Optimization Strategies
- **React.memo**: Für reine Komponenten ohne häufige Props-Änderungen
- **useMemo/useCallback**: Für teure Berechnungen und Event-Handler
- **Lazy Loading**: Code-Splitting für große Komponenten
- **Virtual Scrolling**: Für lange Listen (wenn implementiert)

### Bundle-Größen-Richtlinien
| Kategorie | Limit | Aktuell |
|-----------|-------|---------|
| Main Bundle | < 500KB | ~420KB |
| Chunk Files | < 200KB | ~180KB |
| Total (gzip) | < 800KB | ~650KB |

### Memory Management
```typescript
// WebSocket Cleanup
useEffect(() => {
  return () => {
    if (ws) {
      ws.close();
    }
  };
}, []);

// Interval Cleanup
useEffect(() => {
  return () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
    }
  };
}, []);
```

## 🆕 Neue Features

### 1. **BiomeEditor mit Population Distribution**
- **Geographic Layout**: 4 Biomes mit konfigurierbaren `population_percentage`
- **Validation**: Automatische Überprüfung dass Summe = 100%
- **Visual Feedback**: Grün bei korrekter Verteilung, Rot bei Fehlern
- **Add/Remove**: Dynamisches Hinzufügen/Entfernen von Biomes

### 2. **Initial Population Editor (6-Milieu-System)**
- **Political Archetypes**: 6 vordefinierte Milieus
  - Linksradikal (#8B0000), Links (#DC143C), Mitte (#000000)
  - Liberal (#FFD700), Rechts (#0000FF), Rechtsextrem (#8B4513)
- **Preset Integration**: Automatisches Laden aller 6 Archetypen
- **Attribute Distributions**: Individuelle Konfiguration pro Milieu
- **Proportion Management**: Normalisierung und Validierung

### 3. **Erweiterte Simulation Controls**
- **Multi-Step Support**: `stepSimulation(1)` und `stepSimulation(10)`
- **Safety Features**: Step-Buttons deaktiviert während kontinuierlicher Simulation
- **Visual Feedback**: Klare Unterscheidung zwischen aktiven/inaktiven States
- **Keyboard Shortcuts**: Space, 1, 0, R für schnelle Bedienung

### 4. **Enhanced Agent Inspector**
- **Complete Agent Data**: Alle 25+ Eigenschaften einsehbar
- **Milieu Integration**: Anzeige der Initial-Milieu-Zugehörigkeit
- **Template Classification**: Aktuelle politische Kategorisierung
- **Economic Data**: Einkommen, Vermögen, Sozialleistungen
- **Behavioral Indicators**: Risikoaversion, politische Wirksamkeit

### 5. **Advanced Dashboard Widgets**
- **Template Distribution**: Live-Tracking politischer Kategorien
- **Event Log Integration**: Hazard Events, Gini-Threshold Crossings
- **Sparklines**: Mini-Charts für Trends
- **Population Reports**: Schlüsselmetriken-Übersicht

## 🔗 API Integration

### HTTP Client (Axios)
```typescript
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Verwendung
const response = await apiClient.post('/simulation/step');
const config = await apiClient.get('/config');
```

### WebSocket Integration
```typescript
// Real-time Updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'simulation_update') {
    setSimulationData(data.payload);
  }
};
```

## 🧪 Testing

### Unit Tests
```bash
npm test                    # Watch Mode
npm test -- --coverage     # Coverage Report
npm test -- --updateSnapshot # Update Snapshots
```

### Testing-Beispiele
```typescript
// Komponenten-Test
test('SimulationControls renders all buttons', () => {
  render(<SimulationControls />);
  
  expect(screen.getByText('▶ Start')).toBeInTheDocument();
  expect(screen.getByText('⏭ 1 Step')).toBeInTheDocument();
  expect(screen.getByText('⏭⏭ 10 Steps')).toBeInTheDocument();
});

// Store-Test
test('stepSimulation calls API correct number of times', async () => {
  const { result } = renderHook(() => useSimulationStore());
  
  await act(() => result.current.stepSimulation(5));
  
  expect(mockApiCall).toHaveBeenCalledTimes(5);
});
```

## 📚 Weitere Dokumentation

- **[Installation & Setup](../../docs/guides/installation.md)** - Detaillierte Setup-Anweisungen
- **[User Guide](../../docs/guides/user-guide.md)** - Bedienung der Anwendung
- **[API Dokumentation](../../docs/api/README.md)** - Backend API Referenz
- **[Architektur](../../docs/architecture/README.md)** - Systemdesign Details

## 🐛 Troubleshooting

### Häufige Probleme
```bash
# WebSocket Verbindungsfehler
# Lösung: Backend Status prüfen
curl http://localhost:8000/api/health

# TypeScript Fehler
# Lösung: Type Checking
npx tsc --noEmit

# Bundle-Size Probleme  
# Lösung: Bundle Analyse
npx webpack-bundle-analyzer build/static/js/*.js
```

### Performance Issues
```bash
# React DevTools Profiler verwenden
# Chrome DevTools Performance Tab
# Bundle-Size mit webpack-bundle-analyzer überprüfen
```

---

**Frontend entwickelt für moderne politische Simulationen**

*React 18 • TypeScript • Deck.GL • Zustand • Modern Web Technologies*

Basiert auf Create React App mit umfangreichen Anpassungen für ABM-Simulationen.