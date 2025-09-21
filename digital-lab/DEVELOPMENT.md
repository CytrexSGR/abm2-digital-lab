# ABM² Digital Lab - Frontend Development Guide

Umfassende Entwickler-Dokumentation für die React + TypeScript Frontend-Architektur des Political Agent-Based Model Systems.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](#)
[![Deck.GL](https://img.shields.io/badge/Deck.GL-9.1-green.svg)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Modular-purple.svg)](#)

## 📋 Inhaltsverzeichnis

- [Entwicklungsumgebung Setup](#entwicklungsumgebung-setup)
- [Frontend-Architektur](#frontend-architektur)
- [Komponenten-System](#komponenten-system)
- [State Management](#state-management)
- [Visualisierungs-Pipeline](#visualisierungs-pipeline)
- [API Integration](#api-integration)
- [Performance & Optimization](#performance--optimization)
- [Testing Strategien](#testing-strategien)
- [Build & Deployment](#build--deployment)
- [Debugging & Troubleshooting](#debugging--troubleshooting)
- [Best Practices](#best-practices)

## 🔧 Entwicklungsumgebung Setup

### Systemvoraussetzungen
```bash
Node.js: 18.0+ (empfohlen: 20.0+)
npm: 9.0+ (empfohlen: 10.0+)
RAM: 8GB+ (für große Simulationen)
GPU: WebGL 2.0 Support (für Deck.GL)
```

### Development Setup
```bash
# Repository Setup
cd digital-lab/frontend

# Dependencies installieren
npm install

# Development Server
npm start  # http://localhost:3000

# Netzwerk-Zugriff (optional)
HOST=0.0.0.0 npm start  # http://[ip]:3000
```

### IDE Konfiguration (VSCode)
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html"
  }
}

// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.sublime-babel-vscode"
  ]
}
```

## 🏗️ Frontend-Architektur

### System-Übersicht
```
┌─────────────────────────────────────────────────────────────────┐
│                    ABM² Frontend Architektur                   │
├─────────────────────────────────────────────────────────────────┤
│  Presentation Layer                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Dashboard     │  │  Configuration  │  │   Simulation    │ │
│  │   Components    │  │   Components    │  │   Components    │ │
│  │                 │  │                 │  │                 │ │
│  │ • MetricsDash   │  │ • BiomeEditor   │  │ • AgentMap      │ │
│  │ • LiveDash      │  │ • MilieuEditor  │  │ • Controls      │ │
│  │ • PopMonitor    │  │ • ConfigPanel   │  │ • Inspector     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  State Management Layer (Zustand)                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ ConnectionStore │  │ SimulationStore │  │ DashboardStore  │ │
│  │                 │  │                 │  │                 │ │
│  │ • WebSocket     │  │ • Data & State  │  │ • Layout        │ │
│  │ • Status        │  │ • Controls      │  │ • Widgets       │ │
│  │ • Messages      │  │ • History       │  │ • Preferences   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Visualization Layer (Deck.GL + D3)                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Agent Map Engine                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐│ │
│  │  │  Biome Layout   │  │ Agent Scatter   │  │ Interactive ││ │
│  │  │     Layer       │  │     Layer       │  │   Layer     ││ │
│  │  │                 │  │                 │  │             ││ │
│  │  │ • Geographic    │  │ • 1000+ Agents  │  │ • Click     ││ │
│  │  │ • Backgrounds   │  │ • Color Coding  │  │ • Hover     ││ │
│  │  │ • Labels        │  │ • Real-time     │  │ • Select    ││ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────┘│ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Communication Layer                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   HTTP Client   │  │   WebSocket     │  │  Data Pipeline  │ │
│  │    (Axios)      │  │   Real-time     │  │                 │ │
│  │                 │  │                 │  │ • Transform     │ │
│  │ • REST API      │  │ • Live Updates  │  │ • Validate      │ │
│  │ • Config        │  │ • Events        │  │ • Cache         │ │
│  │ • Error Handle  │  │ • Status        │  │ • Optimize      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
    HTTP REST API           WebSocket WS            Real-time Data
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                          │
└─────────────────────────────────────────────────────────────────┘
```

### Architektur-Prinzipien

#### 1. **Modulare Komponenten-Architektur**
```typescript
// Jeder Bereich hat klar definierte Verantwortlichkeiten
components/
├── config/     # Konfigurationsbezogene UI-Logik
├── dashboard/  # Monitoring & Analytics UI
├── simulation/ # Simulationskontrolle & Visualisierung
├── ui/         # Wiederverwendbare UI-Primitive
└── widgets/    # Dashboard Widget-Wrapper
```

#### 2. **Domain-Driven State Management**
```typescript
// Stores nach funktionalen Domänen getrennt
store/
├── useConnectionStore.ts  # WebSocket & Verbindungsstatus
├── useSimulationStore.ts  # Simulationsdaten & -kontrolle
├── useDashboardStore.ts   # Dashboard-Layout & Widgets
└── useAgentStore.ts       # Agent-spezifischer State
```

#### 3. **Performance-First Design**
- **Hardware-Beschleunigung**: Deck.GL für WebGL-Rendering
- **Selective Re-rendering**: React.memo + useMemo Optimierungen
- **Efficient Updates**: Nur veränderte Daten re-rendern
- **Bundle Splitting**: Code-Splitting für lazy loading

## 🧩 Komponenten-System

### Komponenten-Hierarchie
```
App
├── DashboardLayout
│   ├── DashboardControls
│   └── DashboardGrid
│       ├── AgentMapWidget
│       │   └── AgentMap (Deck.GL)
│       ├── GlobalMetricsWidget
│       ├── TemplateDistributionWidget
│       └── EventLogWidget
├── ConfigurationPanel
│   ├── BiomeEditor
│   ├── InitialPopulationEditor
│   │   └── MilieuCard[]
│   └── MediaEditor
└── SimulationControls
```

### Neue Hauptkomponenten (2024)

#### **BiomeEditor** - Geografische Konfiguration
```typescript
// components/config/BiomeEditor.tsx
interface BiomeEditorProps {
  biomes: BiomeConfig[];
  onBiomeChange: (index: number, updatedBiome: BiomeConfig) => void;
  onBiomesChange: (newBiomes: BiomeConfig[]) => void;
  isDisabled: boolean;
}

const BiomeEditor: React.FC<BiomeEditorProps> = ({
  biomes, onBiomeChange, onBiomesChange, isDisabled 
}) => {
  // 🆕 Population Percentage Validation
  const totalPercentage = biomes.reduce((sum, b) => sum + b.population_percentage, 0);
  const isValid = Math.abs(totalPercentage - 100) < 0.01;
  
  return (
    <Card title="Biome Configuration">
      {/* Population Distribution Warning */}
      <div style={{ 
        color: isValid ? '#4caf50' : '#f44336',
        fontWeight: 'bold' 
      }}>
        Total Population: {totalPercentage.toFixed(1)}%
        {!isValid && ' (Must equal 100%)'}
      </div>
      
      {/* Biome Cards */}
      {biomes.map((biome, index) => (
        <BiomeCard 
          key={index}
          biome={biome}
          onChange={(updated) => onBiomeChange(index, updated)}
          onRemove={() => handleRemoveBiome(index)}
        />
      ))}
      
      <ActionButton 
        variant="primary" 
        onClick={handleAddBiome}
        disabled={isDisabled}
      >
        Add Biome
      </ActionButton>
    </Card>
  );
};
```

#### **InitialPopulationEditor** - Milieu-System
```typescript
// components/config/InitialPopulationEditor.tsx
interface InitialPopulationEditorState {
  milieus: InitialMilieu[];
  loading: boolean;
  saving: boolean;
}

const InitialPopulationEditor: React.FC = () => {
  const { 
    milieus, setMilieus, addMilieu, removeMilieu, updateMilieu,
    normalizeProportions, validateProportions 
  } = useMilieuManagement([]);

  // 🆕 Auto-load 6 Political Archetypes
  const initializeWithPresets = async () => {
    const desiredPresets = [
      'linksradikal', 'links', 'mitte', 'liberal', 'rechts', 'rechtsextrem'
    ];

    const allMilieus: InitialMilieu[] = [];
    for (const presetName of desiredPresets) {
      try {
        const response = await apiClient.get(`/api/presets/milieus/${presetName}`);
        const loadedMilieus = response.data.map(convertMilieuConfigToInitialMilieu);
        allMilieus.push(...loadedMilieus);
      } catch (error) {
        console.error(`Failed to load preset ${presetName}:`, error);
      }
    }

    if (allMilieus.length > 0) {
      setMilieus(allMilieus);
    }
  };

  return (
    <Card title="Initial Population (6-Milieu System)">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span>Total Proportion: {getTotalProportion().toFixed(3)}</span>
        <ActionButton onClick={normalizeProportions}>
          Normalize to 1.0
        </ActionButton>
      </div>

      {/* Milieu Cards */}
      {milieus.map((milieu, index) => (
        <MilieuCard
          key={index}
          milieu={milieu}
          onUpdate={(updated) => updateMilieu(index, updated)}
          onRemove={() => removeMilieu(index)}
        />
      ))}
    </Card>
  );
};
```

#### **SimulationControls** - Erweiterte Steuerung
```typescript
// components/simulation/SimulationControls.tsx
const SimulationControls: React.FC = () => {
  const { 
    runSimulation, stopSimulation, resetSimulation, stepSimulation, isRunning 
  } = useSimulationStore();

  // 🆕 Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Ignore in inputs
      
      switch (e.key) {
        case ' ': // Space
          e.preventDefault();
          isRunning ? stopSimulation() : runSimulation();
          break;
        case '1':
          e.preventDefault();
          if (!isRunning) stepSimulation(1);
          break;
        case '0':
          e.preventDefault();
          if (!isRunning) stepSimulation(10);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          if (!isRunning) resetSimulation();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, runSimulation, stopSimulation, stepSimulation, resetSimulation]);

  return (
    <Card title="Simulation Controls">
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <ActionButton 
          variant={isRunning ? "secondary" : "primary"}
          onClick={isRunning ? stopSimulation : runSimulation}
        >
          {isRunning ? '⏸ Stop' : '▶ Start'}
        </ActionButton>
        
        <ActionButton 
          variant="secondary"
          onClick={() => stepSimulation(1)} 
          disabled={isRunning}
          title="Single step (Press 1)"
        >
          ⏭ 1 Step
        </ActionButton>
        
        <ActionButton 
          variant="secondary"
          onClick={() => stepSimulation(10)} 
          disabled={isRunning}
          title="Ten steps (Press 0)"
        >
          ⏭⏭ 10 Steps
        </ActionButton>
        
        <ActionButton 
          variant="danger"
          onClick={resetSimulation} 
          disabled={isRunning}
          title="Reset simulation (Press R)"
        >
          🔄 Reset
        </ActionButton>
      </div>
      
      <div style={{ fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
        Keyboard: Space (Start/Stop), 1 (Step), 0 (10 Steps), R (Reset)
      </div>
    </Card>
  );
};
```

### UI-Primitive Komponenten

#### **Card** - Container Base Component
```typescript
// components/ui/Card.tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title, subtitle, children, className = '', 
  collapsible = false, defaultCollapsed = false, actions
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`card ${className}`} style={cardStyles.container}>
      {title && (
        <div style={cardStyles.header}>
          <div style={cardStyles.titleSection}>
            {collapsible && (
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={cardStyles.collapseButton}
              >
                {isCollapsed ? '▶' : '▼'}
              </button>
            )}
            <h3 style={cardStyles.title}>{title}</h3>
            {subtitle && <span style={cardStyles.subtitle}>{subtitle}</span>}
          </div>
          {actions && <div style={cardStyles.actions}>{actions}</div>}
        </div>
      )}
      
      {(!collapsible || !isCollapsed) && (
        <div style={cardStyles.content}>
          {children}
        </div>
      )}
    </div>
  );
};

const cardStyles = {
  container: {
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    margin: '8px 0',
    overflow: 'hidden'
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'var(--text-color)'
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic'
  },
  collapseButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-color)',
    cursor: 'pointer',
    fontSize: '12px'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  content: {
    padding: '16px'
  }
};
```

#### **FormField** - Standardized Input Wrapper
```typescript
// components/ui/FormField.tsx
interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  layout?: 'vertical' | 'horizontal';
}

const FormField: React.FC<FormFieldProps> = ({
  label, description, error, required = false, children, layout = 'vertical'
}) => {
  return (
    <div style={{
      ...fieldStyles.container,
      flexDirection: layout === 'horizontal' ? 'row' : 'column'
    }}>
      <label style={{
        ...fieldStyles.label,
        marginBottom: layout === 'horizontal' ? 0 : '4px',
        marginRight: layout === 'horizontal' ? '12px' : 0,
        minWidth: layout === 'horizontal' ? '120px' : 'auto'
      }}>
        {label}
        {required && <span style={fieldStyles.required}>*</span>}
      </label>
      
      <div style={fieldStyles.inputSection}>
        {children}
        {description && (
          <div style={fieldStyles.description}>{description}</div>
        )}
        {error && (
          <div style={fieldStyles.error}>{error}</div>
        )}
      </div>
    </div>
  );
};
```

## 🏪 State Management

### Zustand Store Architecture

#### **Connection Store** - WebSocket Management
```typescript
// store/useConnectionStore.ts
interface ConnectionState {
  isConnected: boolean;
  ws: WebSocket | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  
  // Status
  getConnectionStatus: () => 'connected' | 'disconnected' | 'connecting' | 'error';
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  isConnected: false,
  ws: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,

  connect: () => {
    const { ws, reconnectAttempts, maxReconnectAttempts } = get();
    
    if (ws?.readyState === WebSocket.OPEN) return;
    
    try {
      const websocket = new WebSocket('ws://localhost:8000/ws');
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        set({ isConnected: true, ws: websocket, reconnectAttempts: 0 });
      };
      
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Route messages to appropriate stores
        if (data.type === 'simulation_update' && setSimulationData) {
          setSimulationData(data.payload);
        }
        
        if (data.type === 'system_message') {
          console.log('System message:', data.message);
        }
      };
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        set({ isConnected: false, ws: null });
        
        // Auto-reconnect logic
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            set(state => ({ reconnectAttempts: state.reconnectAttempts + 1 }));
            get().connect();
          }, 1000 * Math.pow(2, reconnectAttempts)); // Exponential backoff
        }
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      set({ ws: websocket });
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ isConnected: false, ws: null });
    }
  },

  sendMessage: (message: any) => {
    const { ws, isConnected } = get();
    if (ws && isConnected) {
      ws.send(JSON.stringify(message));
    }
  },

  getConnectionStatus: () => {
    const { isConnected, reconnectAttempts, maxReconnectAttempts } = get();
    if (isConnected) return 'connected';
    if (reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts) return 'connecting';
    if (reconnectAttempts >= maxReconnectAttempts) return 'error';
    return 'disconnected';
  }
}));

// Callback registration for inter-store communication
let setSimulationData: ((data: SimulationUpdatePayload) => void) | null = null;

export const registerSimulationCallbacks = (
  setSimulationDataCallback: (data: SimulationUpdatePayload) => void
) => {
  setSimulationData = setSimulationDataCallback;
};
```

#### **Simulation Store** - Enhanced Control Logic
```typescript
// store/useSimulationStore.ts
interface SimulationState {
  isRunning: boolean;
  simulationData: SimulationUpdatePayload | null;
  history: SimulationUpdatePayload[];
  
  // Enhanced actions
  runSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: (steps?: number) => void; // 🆕 Multi-step support
  
  // Data management
  setSimulationData: (data: SimulationUpdatePayload) => void;
  addToHistory: (data: SimulationUpdatePayload) => void;
  clearHistory: () => void;
  
  // Analysis helpers
  getLatestMetrics: () => ModelReport | null;
  getHistoricalData: (steps: number) => SimulationUpdatePayload[];
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isRunning: false,
  simulationData: null,
  history: [],

  stepSimulation: async (steps: number = 1) => {
    if (get().isRunning) {
      console.warn('Cannot step while simulation is running');
      return;
    }

    try {
      for (let i = 0; i < steps; i++) {
        await apiClient.post('/api/simulation/step');
        // Each step will trigger a WebSocket update
        // Small delay to prevent overwhelming the server
        if (i < steps - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    } catch (error) {
      console.error(`Failed to execute ${steps} simulation steps:`, error);
    }
  },

  setSimulationData: (data: SimulationUpdatePayload) => {
    set(state => ({
      simulationData: data,
      history: [...state.history.slice(-MAX_HISTORY_LENGTH + 1), data]
    }));
  },

  getLatestMetrics: () => {
    const { simulationData } = get();
    return simulationData?.model_report || null;
  },

  getHistoricalData: (steps: number) => {
    const { history } = get();
    return history.slice(-steps);
  }
}));

// Register callbacks on store creation
registerSimulationCallbacks(
  useSimulationStore.getState().setSimulationData
);
```

### Custom Hooks

#### **useMilieuManagement** - Milieu State Logic
```typescript
// hooks/useMilieuManagement.ts
interface MilieuManagementState {
  milieus: InitialMilieu[];
  setMilieus: (milieus: InitialMilieu[]) => void;
  addMilieu: (milieu: InitialMilieu) => void;
  removeMilieu: (index: number) => void;
  updateMilieu: (index: number, updates: Partial<InitialMilieu>) => void;
  updateDistribution: (index: number, attribute: string, distribution: any) => void;
  normalizeProportions: () => void;
  validateProportions: () => { isValid: boolean; total: number };
}

export const useMilieuManagement = (
  initialMilieus: InitialMilieu[]
): MilieuManagementState => {
  const [milieus, setMilieus] = useState<InitialMilieu[]>(initialMilieus);

  const addMilieu = useCallback((newMilieu: InitialMilieu) => {
    setMilieus(prev => [...prev, newMilieu]);
  }, []);

  const removeMilieu = useCallback((index: number) => {
    setMilieus(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateMilieu = useCallback((index: number, updates: Partial<InitialMilieu>) => {
    setMilieus(prev => prev.map((milieu, i) => 
      i === index ? { ...milieu, ...updates } : milieu
    ));
  }, []);

  const updateDistribution = useCallback((
    index: number, 
    attribute: string, 
    distribution: any
  ) => {
    updateMilieu(index, {
      attribute_distributions: {
        ...milieus[index].attribute_distributions,
        [attribute]: distribution
      }
    });
  }, [milieus, updateMilieu]);

  const normalizeProportions = useCallback(() => {
    const total = milieus.reduce((sum, m) => sum + m.proportion, 0);
    if (total === 0) return;

    setMilieus(prev => prev.map(milieu => ({
      ...milieu,
      proportion: milieu.proportion / total
    })));
  }, [milieus]);

  const validateProportions = useCallback(() => {
    const total = milieus.reduce((sum, m) => sum + m.proportion, 0);
    return {
      isValid: Math.abs(total - 1.0) < 0.001,
      total
    };
  }, [milieus]);

  return {
    milieus,
    setMilieus,
    addMilieu,
    removeMilieu,
    updateMilieu,
    updateDistribution,
    normalizeProportions,
    validateProportions
  };
};
```

## 🗺️ Visualisierungs-Pipeline

### Deck.GL Integration

#### **AgentMap** - Main Visualization Component
```typescript
// components/simulation/AgentMap.tsx
interface AgentMapProps {
  agents: AgentVisual[];
  layout: BiomeLayout[];
  colorAttribute: AgentColorAttribute;
  onAgentClick?: (agent: AgentVisual) => void;
  className?: string;
}

const AgentMap: React.FC<AgentMapProps> = ({ 
  agents, layout, colorAttribute, onAgentClick, className 
}) => {
  const [viewState, setViewState] = useState<ViewStateProps>({
    longitude: 0,
    latitude: 0,
    zoom: 6,
    pitch: 0,
    bearing: 0
  });

  // 🆕 Memoized layer creation for performance
  const layers = useMemo(() => [
    // Biome Background Layer
    new SolidPolygonLayer({
      id: 'biome-layout-layer',
      data: layout,
      getPolygon: d => [
        [d.x_min, 0],
        [d.x_max, 0], 
        [d.x_max, 100],
        [d.x_min, 100]
      ],
      getFillColor: d => getBiomeBackgroundColor(d.name),
      getLineColor: [100, 100, 100, 100],
      getLineWidth: 2,
      stroked: true,
      filled: true,
      opacity: 0.1
    }),

    // Agent Scatterplot Layer
    new ScatterplotLayer<AgentVisual>({
      id: 'agent-scatterplot',
      data: agents,
      getPosition: d => [d.position[0], d.position[1], 0],
      getRadius: 0.8,
      getFillColor: d => getAgentColor(d, colorAttribute),
      getLineColor: [255, 255, 255, 100],
      getLineWidth: 1,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 3,
      radiusMaxPixels: 8,
      pickable: true,
      onHover: (info) => {
        // Show tooltip on hover
        if (info.object) {
          // Update hover state
        }
      },
      onClick: (info) => {
        if (info.object && onAgentClick) {
          onAgentClick(info.object);
        }
      }
    }),

    // Biome Label Layer
    new TextLayer({
      id: 'biome-labels',
      data: layout,
      getPosition: d => [(d.x_min + d.x_max) / 2, 95, 1],
      getText: d => d.name,
      getSize: 12,
      getColor: [255, 255, 255, 200],
      getAngle: 0,
      textAnchor: 'middle',
      alignmentBaseline: 'center',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold'
    })
  ], [agents, layout, colorAttribute, onAgentClick]);

  return (
    <div className={`agent-map ${className || ''}`} style={mapStyles.container}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: newViewState }) => setViewState(newViewState)}
        controller={true}
        layers={layers}
        width={600}
        height={400}
      >
        {/* Optional: Add base map */}
      </DeckGL>
      
      {/* Legend */}
      <div style={mapStyles.legend}>
        <ColorLegend 
          colorAttribute={colorAttribute}
          agents={agents}
        />
      </div>
    </div>
  );
};

const mapStyles = {
  container: {
    position: 'relative' as const,
    width: '100%',
    height: '400px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  legend: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '8px',
    borderRadius: '4px',
    minWidth: '120px'
  }
};
```

#### **Color System** - Dynamic Agent Coloring
```typescript
// utils/colorUtils.ts
export type AgentColorAttribute = 
  | 'political' 
  | 'milieu' 
  | 'vermoegen' 
  | 'einkommen' 
  | 'risikoaversion' 
  | 'alter' 
  | 'bildung';

export const getAgentColor = (
  agent: AgentVisual, 
  attribute: AgentColorAttribute,
  milieuConfig?: InitialMilieu[]
): [number, number, number, number] => {
  switch (attribute) {
    case 'political':
      return getPoliticalColor(agent.political_position);
      
    case 'milieu':
      return getMilieuColor(agent.initial_milieu, milieuConfig);
      
    case 'vermoegen':
      return getWealthColor(agent.vermoegen || 0);
      
    case 'einkommen':
      return getIncomeColor(agent.einkommen || 0);
      
    case 'risikoaversion':
      return getRiskAversionColor(agent.risikoaversion || 0);
      
    case 'alter':
      return getAgeColor(agent.alter || 0);
      
    case 'bildung':
      return getEducationColor(agent.bildung || 0);
      
    default:
      return [136, 136, 136, 255]; // Default gray
  }
};

const getPoliticalColor = (position?: { a: number; b: number }): [number, number, number, number] => {
  if (!position) return [136, 136, 136, 255];
  
  const { a: economic, b: social } = position;
  
  // Map economic axis (-1 to 1) to red-blue spectrum
  // Map social axis (-1 to 1) to brightness
  const red = Math.max(0, Math.min(255, 128 + economic * 127));
  const blue = Math.max(0, Math.min(255, 128 - economic * 127));
  const brightness = Math.max(0.3, Math.min(1.0, 0.65 + social * 0.35));
  
  return [
    Math.floor(red * brightness),
    64, // Minimal green for better contrast
    Math.floor(blue * brightness),
    255
  ];
};

const getMilieuColor = (
  milieu?: string, 
  milieuConfig?: InitialMilieu[]
): [number, number, number, number] => {
  if (!milieu || !milieuConfig) return [136, 136, 136, 255];
  
  const config = milieuConfig.find(m => m.name === milieu);
  if (!config?.color) return [136, 136, 136, 255];
  
  return hexToRgba(config.color);
};

const getWealthColor = (wealth: number): [number, number, number, number] => {
  // Use Viridis color scale for wealth (0 to max)
  const normalized = Math.max(0, Math.min(1, wealth / 50000)); // Assume max 50k
  const color = interpolateViridis(normalized);
  return hexToRgba(color);
};

const hexToRgba = (hex: string): [number, number, number, number] => {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
    255
  ] : [136, 136, 136, 255];
};
```

### Performance Optimizations

#### **Selective Re-rendering**
```typescript
// Prevent unnecessary re-renders
const MemoizedAgentMap = React.memo(AgentMap, (prevProps, nextProps) => {
  // Only re-render if agents, layout, or color attribute changed
  return (
    prevProps.agents === nextProps.agents &&
    prevProps.layout === nextProps.layout &&
    prevProps.colorAttribute === nextProps.colorAttribute
  );
});

// Memoize expensive calculations
const ColorLegend: React.FC<ColorLegendProps> = ({ colorAttribute, agents }) => {
  const legendData = useMemo(() => {
    return calculateLegendData(colorAttribute, agents);
  }, [colorAttribute, agents]);
  
  return <div>{/* Legend content */}</div>;
};
```

## 📡 API Integration

### HTTP Client Configuration
```typescript
// api/axiosConfig.ts
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 422) {
      console.error('Validation error:', error.response.data.detail);
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data.detail);
    }
    return Promise.reject(error);
  }
);
```

### API Service Layer
```typescript
// api/simulationApi.ts
export class SimulationAPI {
  static async resetSimulation(params: { num_agents: number; network_connections: number }) {
    const response = await apiClient.post('/simulation/reset', params);
    return response.data;
  }

  static async stepSimulation(): Promise<{ message: string }> {
    const response = await apiClient.post('/simulation/step');
    return response.data;
  }

  static async getSimulationData(): Promise<SimulationUpdatePayload> {
    const response = await apiClient.get('/simulation/data');
    return response.data;
  }

  static async getConfig(): Promise<FullConfig> {
    const response = await apiClient.get('/config');
    return response.data;
  }

  static async saveConfig(config: FullConfig): Promise<void> {
    await apiClient.post('/config', config);
  }

  // 🆕 Milieu API methods
  static async getInitialMilieus(): Promise<InitialMilieu[]> {
    const response = await apiClient.get('/initial_milieus');
    return response.data;
  }

  static async saveInitialMilieus(milieus: InitialMilieu[]): Promise<void> {
    await apiClient.post('/initial_milieus', milieus);
  }

  // 🆕 Preset API methods
  static async getPresets(section: string): Promise<string[]> {
    const response = await apiClient.get(`/presets/${section}`);
    return response.data;
  }

  static async loadPreset(section: string, name: string): Promise<any> {
    const response = await apiClient.get(`/presets/${section}/${name}`);
    return response.data;
  }

  static async savePreset(section: string, name: string, data: any): Promise<void> {
    await apiClient.post(`/presets/${section}/${name}`, data);
  }

  static async deletePreset(section: string, name: string): Promise<void> {
    await apiClient.delete(`/presets/${section}/${name}`);
  }
}
```

## ⚡ Performance & Optimization

### React Performance Patterns
```typescript
// 1. Memoization for expensive calculations
const ExpensiveComponent: React.FC<Props> = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveCalculation(item));
  }, [data]);
  
  return <div>{/* Render processedData */}</div>;
};

// 2. Callback memoization
const ParentComponent: React.FC = () => {
  const handleClick = useCallback((id: string) => {
    // Handle click logic
  }, []);
  
  return (
    <>
      {items.map(item => (
        <ChildComponent 
          key={item.id} 
          item={item} 
          onClick={handleClick} 
        />
      ))}
    </>
  );
};

// 3. Component memoization
const ChildComponent = React.memo<ChildProps>(({ item, onClick }) => {
  return (
    <div onClick={() => onClick(item.id)}>
      {item.name}
    </div>
  );
});
```

### Bundle Optimization
```json
// package.json scripts for optimization
{
  "scripts": {
    "analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js",
    "build:production": "GENERATE_SOURCEMAP=false npm run build"
  }
}
```

### Memory Management
```typescript
// Cleanup patterns
useEffect(() => {
  const interval = setInterval(() => {
    // Periodic task
  }, 1000);
  
  const subscription = eventEmitter.subscribe('event', handler);
  
  // Cleanup function
  return () => {
    clearInterval(interval);
    subscription.unsubscribe();
  };
}, []);

// Proper WebSocket cleanup
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8000/ws');
  
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}, []);
```

## 🧪 Testing Strategien

### Unit Testing Setup
```typescript
// setupTests.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-testid' });

// Mock WebSocket
global.WebSocket = jest.fn();

// Mock Deck.GL
jest.mock('deck.gl', () => ({
  DeckGL: ({ children }: any) => <div data-testid="deck-gl">{children}</div>,
  ScatterplotLayer: jest.fn(),
  SolidPolygonLayer: jest.fn(),
  TextLayer: jest.fn()
}));
```

### Component Testing
```typescript
// __tests__/SimulationControls.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useSimulationStore } from '../store/useSimulationStore';
import SimulationControls from '../components/simulation/SimulationControls';

// Mock the store
jest.mock('../store/useSimulationStore');
const mockUseSimulationStore = useSimulationStore as jest.MockedFunction<typeof useSimulationStore>;

describe('SimulationControls', () => {
  const mockRunSimulation = jest.fn();
  const mockStepSimulation = jest.fn();
  const mockResetSimulation = jest.fn();

  beforeEach(() => {
    mockUseSimulationStore.mockReturnValue({
      runSimulation: mockRunSimulation,
      stepSimulation: mockStepSimulation,
      resetSimulation: mockResetSimulation,
      isRunning: false,
      // ... other store properties
    });
  });

  it('renders all control buttons', () => {
    render(<SimulationControls />);
    
    expect(screen.getByText('▶ Start')).toBeInTheDocument();
    expect(screen.getByText('⏭ 1 Step')).toBeInTheDocument();
    expect(screen.getByText('⏭⏭ 10 Steps')).toBeInTheDocument();
    expect(screen.getByText('🔄 Reset')).toBeInTheDocument();
  });

  it('calls stepSimulation with correct parameters', () => {
    render(<SimulationControls />);
    
    fireEvent.click(screen.getByText('⏭ 1 Step'));
    expect(mockStepSimulation).toHaveBeenCalledWith(1);
    
    fireEvent.click(screen.getByText('⏭⏭ 10 Steps'));
    expect(mockStepSimulation).toHaveBeenCalledWith(10);
  });

  it('disables step buttons when simulation is running', () => {
    mockUseSimulationStore.mockReturnValue({
      ...mockUseSimulationStore(),
      isRunning: true,
    });
    
    render(<SimulationControls />);
    
    expect(screen.getByText('⏭ 1 Step')).toBeDisabled();
    expect(screen.getByText('⏭⏭ 10 Steps')).toBeDisabled();
  });

  it('handles keyboard shortcuts', () => {
    render(<SimulationControls />);
    
    // Simulate space key press
    fireEvent.keyDown(window, { key: ' ' });
    expect(mockRunSimulation).toHaveBeenCalled();
    
    // Simulate '1' key press
    fireEvent.keyDown(window, { key: '1' });
    expect(mockStepSimulation).toHaveBeenCalledWith(1);
  });
});
```

### Store Testing
```typescript
// __tests__/useSimulationStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSimulationStore } from '../store/useSimulationStore';
import { apiClient } from '../api/axiosConfig';

jest.mock('../api/axiosConfig');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useSimulationStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle simulation stepping', async () => {
    mockApiClient.post.mockResolvedValue({ data: { message: 'Step completed' } });
    
    const { result } = renderHook(() => useSimulationStore());
    
    await act(async () => {
      await result.current.stepSimulation(3);
    });
    
    expect(mockApiClient.post).toHaveBeenCalledTimes(3);
    expect(mockApiClient.post).toHaveBeenCalledWith('/simulation/step');
  });

  it('should manage simulation data history', () => {
    const { result } = renderHook(() => useSimulationStore());
    
    const mockData = {
      step: 1,
      model_report: { Mean_Freedom: 0.5 },
      agent_visuals: []
    };
    
    act(() => {
      result.current.setSimulationData(mockData);
    });
    
    expect(result.current.simulationData).toEqual(mockData);
    expect(result.current.history).toContain(mockData);
  });
});
```

### Integration Testing
```typescript
// __tests__/integration/BiomeEditor.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BiomeEditor from '../components/config/BiomeEditor';
import { apiClient } from '../api/axiosConfig';

jest.mock('../api/axiosConfig');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('BiomeEditor Integration', () => {
  const mockBiomes: BiomeConfig[] = [
    {
      name: 'Urban',
      population_percentage: 60,
      // ... other properties
    },
    {
      name: 'Rural',
      population_percentage: 40,
      // ... other properties
    }
  ];

  it('validates population percentage totals', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <BiomeEditor 
        biomes={mockBiomes}
        onBiomeChange={mockOnChange}
        onBiomesChange={jest.fn()}
        isDisabled={false}
      />
    );
    
    // Should show valid state (100%)
    expect(screen.getByText(/Total Population: 100.0%/)).toHaveStyle({ color: '#4caf50' });
    
    // Change percentage to make invalid
    const percentageInput = screen.getByDisplayValue('60');
    await userEvent.clear(percentageInput);
    await userEvent.type(percentageInput, '70');
    
    fireEvent.blur(percentageInput);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(0, expect.objectContaining({
        population_percentage: 70
      }));
    });
  });

  it('handles adding and removing biomes', async () => {
    const mockOnBiomesChange = jest.fn();
    
    render(
      <BiomeEditor 
        biomes={mockBiomes}
        onBiomeChange={jest.fn()}
        onBiomesChange={mockOnBiomesChange}
        isDisabled={false}
      />
    );
    
    // Add biome
    const addButton = screen.getByText('Add Biome');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockOnBiomesChange).toHaveBeenCalledWith([
        ...mockBiomes,
        expect.objectContaining({
          name: 'New Biome 3',
          population_percentage: 25.0
        })
      ]);
    });
  });
});
```

## 🚀 Build & Deployment

### Development Build
```bash
# Hot reload development
npm start

# Network-accessible development
HOST=0.0.0.0 npm start

# Development with specific port
PORT=3001 npm start
```

### Production Build
```bash
# Standard production build
npm run build

# Production build without source maps (smaller)
GENERATE_SOURCEMAP=false npm run build

# Production build with bundle analysis
npm run build && npx webpack-bundle-analyzer build/static/js/*.js
```

### Docker Deployment
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html index.htm;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /ws {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔍 Debugging & Troubleshooting

### Development Debugging
```typescript
// Debug utilities
const Debug = {
  store: {
    simulation: () => console.log(useSimulationStore.getState()),
    connection: () => console.log(useConnectionStore.getState()),
    dashboard: () => console.log(useDashboardStore.getState()),
  },
  
  performance: {
    measureRender: (componentName: string) => {
      return (WrappedComponent: React.ComponentType<any>) => {
        return (props: any) => {
          const startTime = performance.now();
          
          useEffect(() => {
            const endTime = performance.now();
            console.log(`${componentName} render took ${endTime - startTime}ms`);
          });
          
          return <WrappedComponent {...props} />;
        };
      };
    }
  }
};

// Usage
const DebuggableComponent = Debug.performance.measureRender('MyComponent')(MyComponent);
```

### Common Issues

#### **WebSocket Connection Problems**
```typescript
// Debugging WebSocket issues
const diagnoseWebSocket = () => {
  const ws = new WebSocket('ws://localhost:8000/ws');
  
  ws.onopen = () => console.log('✅ WebSocket connected');
  ws.onclose = (event) => console.log('❌ WebSocket closed:', event.code, event.reason);
  ws.onerror = (error) => console.log('🚨 WebSocket error:', error);
  
  // Test backend connectivity
  fetch('http://localhost:8000/api/health')
    .then(response => console.log('✅ Backend reachable:', response.status))
    .catch(error => console.log('❌ Backend unreachable:', error));
};
```

#### **Performance Issues**
```typescript
// Deck.GL performance debugging
const debugDeckGLPerformance = (layers: any[]) => {
  console.log('Deck.GL Layers:', layers.length);
  
  layers.forEach((layer, index) => {
    console.log(`Layer ${index}:`, {
      id: layer.id,
      dataLength: layer.props.data?.length || 0,
      pickable: layer.props.pickable
    });
  });
};

// React re-render debugging
const useWhyDidYouUpdate = (name: string, props: Record<string, any>) => {
  const previous = useRef<Record<string, any>>();
  
  useEffect(() => {
    if (previous.current) {
      const allKeys = Object.keys({ ...previous.current, ...props });
      const changedProps: Record<string, any> = {};
      
      allKeys.forEach(key => {
        if (previous.current![key] !== props[key]) {
          changedProps[key] = {
            from: previous.current![key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previous.current = props;
  });
};
```

#### **State Management Issues**
```typescript
// Store debugging middleware
const storeLogger = (config: any) => (set: any, get: any, api: any) =>
  config(
    (...args: any[]) => {
      console.log('Store update:', args);
      set(...args);
    },
    get,
    api
  );

// Usage
const useSimulationStore = create(
  storeLogger((set, get) => ({
    // Store definition
  }))
);
```

## 🏆 Best Practices

### Code Organization
```typescript
// 1. Barrel exports for clean imports
// components/index.ts
export { default as AgentMap } from './simulation/AgentMap';
export { default as BiomeEditor } from './config/BiomeEditor';
export { default as SimulationControls } from './simulation/SimulationControls';

// Usage
import { AgentMap, BiomeEditor, SimulationControls } from '../components';
```

### Error Handling
```typescript
// Error boundary for React
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('React Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Performance Guidelines
```typescript
// 1. Avoid creating objects in render
❌ const style = { color: 'red' };
✅ const style = useMemo(() => ({ color: 'red' }), []);

// 2. Use proper dependency arrays
❌ useEffect(() => {}, []); // Missing dependencies
✅ useEffect(() => {}, [dep1, dep2]); // Proper dependencies

// 3. Optimize expensive calculations
❌ const result = expensiveCalculation(data);
✅ const result = useMemo(() => expensiveCalculation(data), [data]);

// 4. Avoid inline functions
❌ <button onClick={() => handleClick(id)}>
✅ <button onClick={useCallback(() => handleClick(id), [id])}>
```

### TypeScript Best Practices
```typescript
// 1. Use discriminated unions for state
type LoadingState = 
  | { status: 'loading' }
  | { status: 'success'; data: any }
  | { status: 'error'; error: string };

// 2. Use branded types for IDs
type AgentId = string & { __brand: 'AgentId' };
type BiomeId = string & { __brand: 'BiomeId' };

// 3. Use const assertions for better inference
const AGENT_COLORS = {
  political: 'red',
  milieu: 'blue',
  wealth: 'green'
} as const;

type ColorType = keyof typeof AGENT_COLORS;
```

---

**Frontend Development Guide erstellt für ABM² Digital Lab**

*React 18 • TypeScript • Deck.GL • Modern Development Practices*

Für Fragen oder Verbesserungsvorschläge bitte GitHub Issues verwenden.