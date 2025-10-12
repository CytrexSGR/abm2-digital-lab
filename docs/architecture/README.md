# ABM² System Architecture v3.0

**Status:** Active
**Last Updated:** 2025-10-12
**Target Audience:** Developers, System Architects, Technical Leadership

---

## Executive Summary

ABM² (Agent-Based Modeling² Digital Lab) is a comprehensive political simulation platform featuring advanced Agent-Based Modeling with Formula Registry, real-time monitoring, and sophisticated visualization capabilities. The system implements a microservices-oriented architecture with clear separation between simulation core, configuration management, and presentation layers.

### Core Capabilities
- **Advanced ABM Simulation**: Mesa-based political agent modeling with 6-milieu system
- **Formula Registry**: Dynamic, versioned formula system with caching and audit trails  
- **Real-time Dashboard**: React 18.3 + Deck.GL visualization with live WebSocket updates
- **Authorization System**: Role-based access control with JWT authentication
- **Performance Monitoring**: Prometheus metrics with telemetry and profiling
- **Recording System**: Comprehensive data export with CSV generation
- **Multi-language Support**: German/English interface with i18n

## System Architecture Diagram v3.0

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                                 ABM² Digital Lab v3.0                               │
├────────────────────────────────────────────────────────────────────────────────────┤
│  🌐 Frontend Layer (React 18.3 + TypeScript)                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  🎯 Core Application                        📊 Visualization Engine           │  │
│  │  ├─ Dashboard Components                   ├─ Deck.GL WebGL Rendering         │  │
│  │  │  ├─ Control Panel (Multi-step)         │  ├─ Agent Scatterplot Layer       │  │
│  │  │  ├─ Live Metrics Dashboard              │  ├─ Biome Layout Visualization    │  │
│  │  │  ├─ Agent Inspector (Real-time)         │  ├─ Political Position Mapping    │  │
│  │  │  ├─ Event Log Viewer                    │  └─ Interactive Selection Tools   │  │
│  │  │  └─ Configuration Editors               │                                   │  │
│  │  │                                        📡 Communication Layer             │  │
│  │  ├─ State Management (Zustand)            ├─ WebSocket Client (Real-time)    │  │
│  │  │  ├─ Connection Store                   ├─ REST API Client (Axios)         │  │
│  │  │  ├─ Dashboard Store                    ├─ Auth Token Management           │  │
│  │  │  ├─ Agent Store                        └─ Error Handling & Retry Logic    │  │
│  │  │  └─ Simulation Store                                                       │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────────────────┤
│  🔗 API Gateway Layer (FastAPI + Middleware)                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  🛡️ Security Layer                         📈 Monitoring Layer                │  │
│  │  ├─ JWT Authentication                     ├─ Prometheus Metrics              │  │
│  │  ├─ RBAC Authorization                     ├─ Performance Telemetry           │  │
│  │  ├─ Rate Limiting                          ├─ Health Checks                   │  │
│  │  └─ CORS Configuration                     └─ System Profiling                │  │
│  │                                                                               │  │
│  │  🔌 Communication Protocols                🛠️ Middleware Stack                │  │
│  │  ├─ REST API (60+ endpoints)              ├─ Request Logging                 │  │
│  │  ├─ WebSocket (Real-time)                 ├─ Error Handler                   │  │
│  │  ├─ OpenAPI Documentation                 ├─ Pydantic Validation             │  │
│  │  └─ CSV Export Endpoints                  └─ Async Processing                │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────────────────┤
│  🧮 Formula Registry Layer (NEW v3.0)                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  📝 Formula Management                     🔄 Execution Engine                │  │
│  │  ├─ Version Control (Git-style)           ├─ SymPy Integration               │  │
│  │  ├─ Formula Validation (AST)              ├─ CloudPickle Serialization       │  │
│  │  ├─ Compilation Pipeline                  ├─ Safe Execution Environment      │  │
│  │  ├─ Rollback System                       └─ Performance Optimization        │  │
│  │  │                                                                           │  │
│  │  🗄️ Storage & Caching                     📊 Analytics & Telemetry         │  │
│  │  ├─ Redis Cache Layer                     ├─ Usage Metrics                  │  │
│  │  ├─ File System Storage                   ├─ Error Tracking                 │  │
│  │  ├─ Audit Trail (JSONL)                   ├─ Performance Profiling          │  │
│  │  └─ Backup & Recovery                     └─ Formula Analytics              │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────────────────┤
│  🎯 ABM Simulation Core (Mesa + Political Model)                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  🤖 Agent System                           🌍 Environment Management         │  │
│  │  ├─ PoliticalAgent (1000+ agents)         ├─ Multi-Biome Environment         │  │
│  │  ├─ 6-Milieu Classification               ├─ Resource Management             │  │
│  │  ├─ Social Network (NetworkX)             ├─ Hazard System                   │  │
│  │  ├─ Agent Initialization                  ├─ Seasonality Effects             │  │
│  │  │  ├─ Demographic Distribution           └─ Media Influence Network         │  │
│  │  │  ├─ Political Positioning                                                 │  │
│  │  │  ├─ Economic Attributes                🔄 Simulation Engine               │  │
│  │  │  └─ Social Characteristics             ├─ 9-Phase Simulation Cycle        │  │
│  │  │                                       ├─ Event-Driven Architecture       │  │
│  │  🏛️ Political Model v3.0                 ├─ Multi-Step Execution           │  │
│  │  ├─ Agent-Based Democracy                 ├─ Real-time Data Collection       │  │
│  │  ├─ Opinion Formation                     └─ State Persistence               │  │
│  │  ├─ Economic Interactions                                                    │  │
│  │  └─ Social Learning                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────────────────┤
│  ⚙️ Configuration & Data Management Layer                                           │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  📋 Configuration Management              🗃️ Data Storage & Export           │  │
│  │  ├─ YAML Configuration Files             ├─ Recording System                │  │
│  │  ├─ Pydantic Validation Models           ├─ CSV Data Export                 │  │
│  │  ├─ Preset System                        ├─ Simulation History              │  │
│  │  ├─ Multi-environment Support            ├─ Agent State Tracking            │  │
│  │  │  ├─ Biome Configurations              └─ Performance Metrics Storage     │  │
│  │  │  ├─ Milieu Definitions                                                   │  │
│  │  │  ├─ Media Source Setup                🔍 Audit & Monitoring              │  │
│  │  │  └─ Template Classifications          ├─ System Audit Logs              │  │
│  │  │                                       ├─ Formula Usage Analytics         │  │
│  │  🛠️ Management Tools                      ├─ Performance Telemetry          │  │
│  │  ├─ Config Validation                     └─ Security Event Tracking        │  │
│  │  ├─ Backup & Restore                                                        │  │
│  │  ├─ Environment Migration                                                   │  │
│  │  └─ System Health Monitoring                                                │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────┘
```

## Architecture Innovations v3.0

### 🧮 Formula Registry System (Revolutionary Feature)

The Formula Registry represents a paradigm shift in ABM configuration, allowing dynamic formula management without code deployment:

```python
# Formula Registry Architecture
class FormulaRegistry:
    """
    Git-like versioning system for mathematical formulas
    - Version control with rollback capabilities
    - Hot-swapping formulas during simulation
    - Formula validation with AST parsing
    - Performance caching with Redis
    - Audit trails for compliance
    """
    def __init__(self):
        self.cache = RedisCache()  # Formula compilation cache
        self.storage = FileSystemStorage()  # Version storage
        self.audit_logger = AuditLogger()  # JSONL audit trail
        self.telemetry = TelemetryCollector()  # Usage metrics

# Formula Definition Structure
{
    "formula_id": "wealth_calculation_v2",
    "version": "2.1.0",
    "category": "economic",
    "expression": "base_wealth * (1 + growth_rate) ** years",
    "parameters": ["base_wealth", "growth_rate", "years"],
    "metadata": {
        "author": "researcher@uni.edu",
        "description": "Compound wealth calculation with inflation",
        "created_at": "2024-12-07T10:30:00Z",
        "tags": ["economics", "wealth", "compound"]
    },
    "validation": {
        "test_cases": [
            {"input": {"base_wealth": 1000, "growth_rate": 0.05, "years": 10}, 
             "expected_output": 1628.89}
        ],
        "constraints": {
            "base_wealth": {"min": 0, "max": 1000000},
            "growth_rate": {"min": -0.5, "max": 0.5},
            "years": {"min": 0, "max": 100}
        }
    }
}
```

#### Formula Lifecycle Management
```
📝 Development → 🔍 Validation → 🧪 Testing → 🚀 Release → 📊 Monitoring
     ↓              ↓              ↓           ↓           ↓
  AST Parse     Test Cases     Sandbox      Production   Telemetry
  Syntax Check  Validation     Execution    Deployment   Analytics
  Parameter     Edge Cases     Performance  Rollback     Usage Stats
  Validation    Regression     Profiling    Management   Error Tracking
```

### 🔐 Advanced Authorization System

```python
# Role-Based Access Control (RBAC)
class AuthorizationSystem:
    ROLES = {
        "admin": {
            "permissions": ["*"],  # All operations
            "description": "System administrator"
        },
        "researcher": {
            "permissions": [
                "simulation:read", "simulation:step", "simulation:reset",
                "config:read", "formula:read", "formula:validate"
            ],
            "description": "Research scientist"
        },
        "student": {
            "permissions": ["simulation:read", "config:read"],
            "description": "Student access (read-only)"
        },
        "formula_developer": {
            "permissions": [
                "formula:*", "simulation:read", "config:read"
            ],
            "description": "Formula development specialist"
        }
    }

# JWT Token Structure
{
    "sub": "user123",
    "role": "researcher", 
    "permissions": ["simulation:read", "simulation:step"],
    "exp": 1704067200,
    "iat": 1704063600,
    "institution": "University of Research",
    "project_access": ["political_simulation_2024"]
}
```

### 📊 Performance Monitoring & Telemetry

```python
# Prometheus Metrics Integration
class MetricsCollector:
    def __init__(self):
        # Simulation Performance
        self.simulation_step_time = Histogram(
            'simulation_step_duration_seconds',
            'Time taken for simulation step execution'
        )
        
        # Formula Registry Metrics
        self.formula_compilation_time = Histogram(
            'formula_compilation_duration_seconds',
            'Time taken to compile formulas'
        )
        
        # API Performance
        self.api_request_duration = Histogram(
            'api_request_duration_seconds',
            'API request processing time',
            ['endpoint', 'method', 'status']
        )
        
        # System Health
        self.active_websocket_connections = Gauge(
            'websocket_connections_active',
            'Number of active WebSocket connections'
        )
        
        # Business Metrics
        self.agent_count = Gauge(
            'simulation_agents_total',
            'Total number of agents in simulation'
        )

# Telemetry Data Collection
{
    "timestamp": "2024-12-07T10:30:15.123Z",
    "event_type": "formula_execution",
    "formula_id": "political_influence_v1.2",
    "execution_time_ms": 45.2,
    "cache_hit": true,
    "agent_count": 1000,
    "parameters": {"media_influence": 0.3, "social_pressure": 0.7},
    "result_hash": "a1b2c3d4",
    "memory_usage_mb": 128.5,
    "cpu_usage_percent": 15.2
}
```

### 📊 Recording & Data Export System

```python
class RecordingSystem:
    """
    Comprehensive data capture and export system
    - Real-time data recording during simulation
    - CSV export with configurable formats
    - Multi-format support (CSV, JSON, Parquet)
    - Compression and chunking for large datasets
    """
    def __init__(self):
        self.active_recordings = {}
        self.export_formats = ['csv', 'json', 'parquet']
        self.compression = 'gzip'
        
    def start_recording(self, session_id: str, config: RecordingConfig):
        """Start recording simulation data"""
        
    def export_data(self, session_id: str, format: str) -> str:
        """Export recorded data in specified format"""

# Recording Configuration
{
    "recording_id": "political_sim_2024_001",
    "session_name": "Democracy Experiment Series A",
    "start_time": "2024-12-07T10:00:00Z",
    "data_fields": [
        "step", "agent_id", "political_position", "wealth", 
        "education", "milieu", "biome", "social_influence"
    ],
    "sampling_rate": "every_step",  # every_step, every_5_steps, etc.
    "export_format": "csv",
    "compression": true,
    "metadata": {
        "researcher": "Dr. Jane Smith",
        "institution": "Political Science Institute",
        "experiment_type": "polarization_study",
        "notes": "Testing media influence on political polarization"
    }
}
```

### 🌍 Enhanced Multi-Biome Environment

#### Sophisticated Geographic Distribution
```
🗺️ Advanced Biome Layout System (100x100 Grid)
┌─────────────────────────────────────────────────────────────────────┐
│ 🏙️ Urban Core (40%)      │ 🏭 Industrial (25%)   │ 🌲 Rural (35%)  │
│ High density             │ Manufacturing         │ Agricultural    │
│ [0,0-40,100]            │ [40,0-65,100]        │ [65,0-100,100]  │
│                         │                       │                 │
│ Demographics:           │ Demographics:         │ Demographics:   │
│ • High education        │ • Mixed education     │ • Traditional   │
│ • Service economy       │ • Blue collar         │ • Conservative  │
│ • Liberal tendency      │ • Union influence     │ • Rural values  │
│ • High media exposure   │ • Economic focus      │ • Low mobility  │
│                         │                       │                 │
│ Hazards: 🌪️ Low         │ Hazards: ⚠️ Medium    │ Hazards: 🌾 High│
│ Economic: 💰 High       │ Economic: 💵 Medium   │ Economic: 🏦 Low │
│ Social: 👥 Dense        │ Social: 🤝 Cohesive   │ Social: 👨‍👩‍👧‍👦 Family│
└─────────────────────────────────────────────────────────────────────┘

🎯 Agent Distribution Matrix (NEW v3.0)
┌──────────────┬─────────┬──────────────┬─────────┬─────────┐
│ Milieu       │ Urban   │ Industrial   │ Rural   │ Remote  │
├──────────────┼─────────┼──────────────┼─────────┼─────────┤
│ Linksradikal │ 25%     │ 20%          │ 10%     │ 5%      │
│ Links        │ 30%     │ 25%          │ 15%     │ 10%     │
│ Mitte        │ 20%     │ 25%          │ 25%     │ 20%     │
│ Liberal      │ 15%     │ 20%          │ 25%     │ 25%     │
│ Rechts       │ 8%      │ 8%           │ 20%     │ 25%     │
│ Rechtsextrem │ 2%      │ 2%           │ 5%      │ 15%     │
└──────────────┴─────────┴──────────────┴─────────┴─────────┘
```

#### Advanced Agent Distribution Algorithm

```python
class EnhancedAgentInitializer:
    """
    Sophisticated agent creation with realistic demographic modeling
    - Geographic clustering with social network effects
    - Socioeconomic stratification by biome
    - Cultural transmission patterns
    - Migration and mobility modeling
    """
    def __init__(self, model):
        self.model = model
        self.demographic_profiles = self._load_demographic_profiles()
        self.social_network_generator = SocialNetworkGenerator()
        
    def create_agent_population(self, total_agents: int) -> List[PoliticalAgent]:
        """
        Creates realistic agent population with:
        1. Geographic distribution based on biome characteristics
        2. Socioeconomic stratification within biomes
        3. Social network formation with homophily effects
        4. Cultural and political inheritance patterns
        """
        agents = []
        
        # Step 1: Calculate sophisticated distribution
        distribution = self._calculate_enhanced_distribution(total_agents)
        
        # Step 2: Create agents with biome-specific characteristics
        for biome_name, biome_agents in distribution.items():
            biome_config = self._get_biome_config(biome_name)
            
            for milieu_name, agent_count in biome_agents.items():
                milieu_config = self._get_milieu_config(milieu_name)
                
                # Create agents with context-aware initialization
                batch_agents = self._create_agent_batch(
                    count=agent_count,
                    biome=biome_config,
                    milieu=milieu_config
                )
                agents.extend(batch_agents)
        
        # Step 3: Build social networks with realistic topology
        self.social_network_generator.build_networks(agents)
        
        # Step 4: Apply cultural transmission and inheritance
        self._apply_cultural_inheritance(agents)
        
        return agents
    
    def _calculate_enhanced_distribution(self, total_agents: int) -> Dict[str, Dict[str, int]]:
        """
        Enhanced distribution calculation with:
        - Realistic demographic constraints
        - Economic clustering effects  
        - Cultural geographic patterns
        - Migration and mobility factors
        """
        distribution = {}
        
        # Base milieu proportions adjusted by biome preferences
        for biome in self.model.biomes:
            distribution[biome.name] = {}
            biome_population = int(total_agents * biome.population_percentage / 100.0)
            
            # Calculate milieu distribution within biome
            biome_milieu_weights = self._calculate_biome_milieu_affinity(biome)
            
            remaining_agents = biome_population
            for milieu in self.model.initial_milieus[:-1]:  # All except last
                base_proportion = milieu.proportion
                biome_adjusted_proportion = base_proportion * biome_milieu_weights[milieu.name]
                agents_for_milieu = int(biome_population * biome_adjusted_proportion)
                
                distribution[biome.name][milieu.name] = agents_for_milieu
                remaining_agents -= agents_for_milieu
            
            # Assign remaining agents to last milieu
            last_milieu = self.model.initial_milieus[-1]
            distribution[biome.name][last_milieu.name] = remaining_agents
            
        return distribution
    
    def _calculate_biome_milieu_affinity(self, biome: BiomeConfig) -> Dict[str, float]:
        """
        Calculate how different political milieus are attracted to specific biomes
        Based on:
        - Economic opportunities
        - Cultural values alignment
        - Educational infrastructure
        - Social services availability
        """
        affinities = {}
        
        # Urban biomes attract educated, liberal populations
        if biome.name.lower() in ['urban', 'metropolitan']:
            affinities = {
                'linksradikal': 1.5,  # High urban concentration
                'links': 1.3,
                'mitte': 1.0,
                'liberal': 1.2,
                'rechts': 0.7,        # Lower urban preference
                'rechtsextrem': 0.4   # Minimal urban presence
            }
        
        # Rural biomes attract traditional, conservative populations  
        elif biome.name.lower() in ['rural', 'agricultural']:
            affinities = {
                'linksradikal': 0.6,
                'links': 0.8,
                'mitte': 1.1,
                'liberal': 1.0,
                'rechts': 1.4,        # Strong rural preference
                'rechtsextrem': 1.6   # Higher rural concentration
            }
            
        # Industrial biomes attract working class
        elif biome.name.lower() in ['industrial', 'manufacturing']:
            affinities = {
                'linksradikal': 1.2,
                'links': 1.4,         # Strong working-class appeal
                'mitte': 1.0,
                'liberal': 0.9,
                'rechts': 0.8,
                'rechtsextrem': 0.7
            }
        
        else:
            # Default uniform distribution
            affinities = {milieu.name: 1.0 for milieu in self.model.initial_milieus}
        
        # Normalize to ensure proportions sum correctly
        total_weight = sum(affinities.values())
        return {k: v/total_weight for k, v in affinities.items()}
```

### 🎮 Advanced Simulation Control System

The simulation control system provides precise execution management with multiple operation modes:

```python
class SimulationController:
    """
    Advanced simulation execution with:
    - Multi-step batch processing
    - Conditional execution (break on events)
    - Automated scenario running
    - Performance-optimized execution
    - Real-time monitoring and interruption
    """
    def __init__(self):
        self.execution_modes = {
            'single_step': self._execute_single_step,
            'multi_step': self._execute_multi_step,
            'continuous': self._execute_continuous,
            'scenario_batch': self._execute_scenario_batch,
            'conditional': self._execute_conditional
        }
        self.break_conditions = []
        self.performance_monitor = PerformanceMonitor()
        
    async def execute_simulation(self, mode: str, **kwargs):
        """Execute simulation with specified mode and parameters"""
        with self.performance_monitor.track_execution():
            return await self.execution_modes[mode](**kwargs)
    
    def _execute_conditional(self, max_steps: int, conditions: List[str]):
        """
        Execute simulation until conditions are met:
        - Gini coefficient threshold reached
        - Political polarization limit
        - Economic crisis event
        - Agent migration threshold
        """
        for step in range(max_steps):
            self.model.step()
            
            # Check break conditions
            if self._check_break_conditions(conditions):
                return {
                    'status': 'condition_met',
                    'final_step': step,
                    'condition_triggered': self._get_triggered_condition()
                }
        
        return {'status': 'max_steps_reached', 'final_step': max_steps}

# Break Condition Examples
BREAK_CONDITIONS = {
    'high_polarization': lambda model: model.get_polarization() > 0.8,
    'economic_crisis': lambda model: model.get_gini_coefficient() > 0.7,
    'mass_migration': lambda model: model.get_migration_rate() > 0.3,
    'political_consensus': lambda model: model.get_political_variance() < 0.1,
    'hazard_cascade': lambda model: len(model.active_hazards) > 3
}
```

#### Enhanced Execution Modes

```typescript
interface AdvancedSimulationControls {
  // Basic execution modes
  single_step: {
    steps: 1,
    hotkey: "1",
    description: "Execute one simulation step"
  },
  multi_step: {
    steps: 10,
    hotkey: "0", 
    description: "Execute 10 simulation steps",
    customizable: true  // User can set step count
  },
  continuous: {
    interval: 500,  // milliseconds
    hotkey: "Space",
    description: "Run simulation continuously",
    pausable: true,
    adjustable_speed: true
  },
  
  // Advanced execution modes
  batch_scenarios: {
    hotkey: "B",
    description: "Run multiple scenario configurations",
    parallel_execution: true,
    export_results: true
  },
  conditional_execution: {
    hotkey: "C", 
    description: "Run until specific conditions met",
    break_conditions: [
      "high_polarization", "economic_crisis", 
      "political_consensus", "hazard_cascade"
    ],
    max_steps: 1000
  },
  performance_test: {
    hotkey: "P",
    description: "Performance benchmarking mode",
    profiling_enabled: true,
    memory_tracking: true,
    execution_time_limit: "5 minutes"
  },
  
  // System controls
  reset: {
    hotkey: "R",
    description: "Reset simulation to initial state",
    preserve_config: true,
    clear_history: true
  },
  save_state: {
    hotkey: "S",
    description: "Save current simulation state",
    include_agent_states: true,
    compress: true
  },
  load_state: {
    hotkey: "L", 
    description: "Load previously saved state",
    validate_compatibility: true
  }
}

// Execution Status Interface
interface SimulationStatus {
  mode: keyof AdvancedSimulationControls,
  current_step: number,
  execution_time: number,
  performance_metrics: {
    steps_per_second: number,
    memory_usage_mb: number,
    cpu_usage_percent: number,
    agent_processing_time_ms: number
  },
  break_conditions: {
    active: string[],
    triggered?: string,
    threshold_values: Record<string, number>
  }
}
```

### 🎭 Sophisticated 6-Milieu Political System

The enhanced milieu system provides nuanced political modeling with realistic demographic distributions and behavioral patterns:

```python
class PoliticalMilieuSystem:
    """
    Advanced 6-milieu political classification system:
    - Realistic demographic modeling
    - Dynamic milieu transitions
    - Social influence networks
    - Cultural transmission patterns
    """
    
    MILIEUS = {
        "linksradikal": {
            "display_name": "Left Radical",
            "color": "#8B0000",  # Dark Red
            "base_proportion": 0.08,  # 8% of population
            "political_position": {"economic": -0.9, "social": -0.8},
            "demographic_profile": {
                "age_distribution": {"mean": 28, "std": 8},  # Younger demographic
                "education_distribution": {"mean": 0.75, "std": 0.15},  # Higher education
                "income_distribution": {"mean": 35000, "std": 15000},
                "urban_preference": 0.85  # Strong urban concentration
            },
            "behavioral_traits": {
                "political_engagement": 0.9,
                "media_skepticism": 0.8,
                "social_activism": 0.85,
                "change_openness": 0.9,
                "risk_tolerance": 0.7
            },
            "value_system": {
                "equality_importance": 0.95,
                "tradition_respect": 0.2,
                "authority_acceptance": 0.1,
                "individual_freedom": 0.8,
                "collective_solidarity": 0.95
            }
        },
        
        "links": {
            "display_name": "Left Progressive",
            "color": "#DC143C",  # Crimson
            "base_proportion": 0.18,  # 18% of population
            "political_position": {"economic": -0.6, "social": -0.5},
            "demographic_profile": {
                "age_distribution": {"mean": 35, "std": 12},
                "education_distribution": {"mean": 0.68, "std": 0.18},
                "income_distribution": {"mean": 45000, "std": 20000},
                "urban_preference": 0.68
            },
            "behavioral_traits": {
                "political_engagement": 0.75,
                "media_skepticism": 0.6,
                "social_activism": 0.65,
                "change_openness": 0.8,
                "risk_tolerance": 0.6
            },
            "value_system": {
                "equality_importance": 0.85,
                "tradition_respect": 0.4,
                "authority_acceptance": 0.3,
                "individual_freedom": 0.75,
                "collective_solidarity": 0.8
            }
        },
        
        "mitte": {
            "display_name": "Centrist Moderate",
            "color": "#000000",  # Black
            "base_proportion": 0.32,  # 32% of population (largest group)
            "political_position": {"economic": 0.0, "social": 0.0},
            "demographic_profile": {
                "age_distribution": {"mean": 45, "std": 15},
                "education_distribution": {"mean": 0.55, "std": 0.20},
                "income_distribution": {"mean": 52000, "std": 25000},
                "urban_preference": 0.55  # Mixed urban/rural
            },
            "behavioral_traits": {
                "political_engagement": 0.5,
                "media_skepticism": 0.45,
                "social_activism": 0.3,
                "change_openness": 0.5,
                "risk_tolerance": 0.4
            },
            "value_system": {
                "equality_importance": 0.6,
                "tradition_respect": 0.6,
                "authority_acceptance": 0.5,
                "individual_freedom": 0.6,
                "collective_solidarity": 0.5
            }
        },
        
        "liberal": {
            "display_name": "Liberal Market",
            "color": "#FFD700",  # Gold
            "base_proportion": 0.22,  # 22% of population
            "political_position": {"economic": 0.6, "social": -0.3},
            "demographic_profile": {
                "age_distribution": {"mean": 42, "std": 13},
                "education_distribution": {"mean": 0.72, "std": 0.16},
                "income_distribution": {"mean": 68000, "std": 35000},
                "urban_preference": 0.75  # Urban professional class
            },
            "behavioral_traits": {
                "political_engagement": 0.65,
                "media_skepticism": 0.5,
                "social_activism": 0.4,
                "change_openness": 0.7,
                "risk_tolerance": 0.8
            },
            "value_system": {
                "equality_importance": 0.5,
                "tradition_respect": 0.5,
                "authority_acceptance": 0.4,
                "individual_freedom": 0.9,
                "collective_solidarity": 0.4
            }
        },
        
        "rechts": {
            "display_name": "Conservative Right",
            "color": "#0000FF",  # Blue  
            "base_proportion": 0.16,  # 16% of population
            "political_position": {"economic": 0.4, "social": 0.7},
            "demographic_profile": {
                "age_distribution": {"mean": 52, "std": 16},
                "education_distribution": {"mean": 0.48, "std": 0.22},
                "income_distribution": {"mean": 48000, "std": 22000},
                "urban_preference": 0.35  # Rural preference
            },
            "behavioral_traits": {
                "political_engagement": 0.7,
                "media_skepticism": 0.65,
                "social_activism": 0.45,
                "change_openness": 0.3,
                "risk_tolerance": 0.35
            },
            "value_system": {
                "equality_importance": 0.4,
                "tradition_respect": 0.9,
                "authority_acceptance": 0.8,
                "individual_freedom": 0.6,
                "collective_solidarity": 0.6
            }
        },
        
        "rechtsextrem": {
            "display_name": "Right Extremist",
            "color": "#8B4513",  # Saddle Brown
            "base_proportion": 0.04,  # 4% of population
            "political_position": {"economic": 0.3, "social": 0.9},
            "demographic_profile": {
                "age_distribution": {"mean": 38, "std": 14},
                "education_distribution": {"mean": 0.35, "std": 0.20},
                "income_distribution": {"mean": 32000, "std": 18000},
                "urban_preference": 0.25  # Strong rural preference
            },
            "behavioral_traits": {
                "political_engagement": 0.8,
                "media_skepticism": 0.9,
                "social_activism": 0.7,
                "change_openness": 0.1,
                "risk_tolerance": 0.6
            },
            "value_system": {
                "equality_importance": 0.2,
                "tradition_respect": 0.95,
                "authority_acceptance": 0.9,
                "individual_freedom": 0.4,
                "collective_solidarity": 0.8  # In-group solidarity
            }
        }
    }
    
    def calculate_milieu_transitions(self, agent: PoliticalAgent, 
                                   social_influences: Dict, 
                                   media_exposure: Dict,
                                   economic_shocks: Dict) -> float:
        """
        Calculate probability of milieu transition based on:
        - Social network influence
        - Media consumption patterns 
        - Economic circumstances
        - Life events (age, education, income changes)
        """
        current_milieu = agent.milieu
        transition_probabilities = {}
        
        for target_milieu, config in self.MILIEUS.items():
            if target_milieu == current_milieu:
                continue
                
            # Base transition probability (very low)
            base_prob = 0.001  # 0.1% per step
            
            # Social influence factor
            social_factor = self._calculate_social_influence(agent, target_milieu)
            
            # Economic shock factor
            economic_factor = self._calculate_economic_influence(agent, target_milieu, economic_shocks)
            
            # Media influence factor  
            media_factor = self._calculate_media_influence(agent, target_milieu, media_exposure)
            
            # Life stage factor
            life_stage_factor = self._calculate_life_stage_influence(agent, target_milieu)
            
            # Combined probability
            combined_factor = social_factor * economic_factor * media_factor * life_stage_factor
            transition_prob = base_prob * combined_factor
            
            transition_probabilities[target_milieu] = min(transition_prob, 0.05)  # Cap at 5%
        
        return transition_probabilities
```

#### Dynamic Milieu Interaction Networks

```python
class MilieuInteractionNetwork:
    """
    Models complex interactions between different political milieus:
    - Alliance and opposition dynamics
    - Issue-based coalitions
    - Media influence patterns
    - Social network clustering
    """
    
    INTERACTION_MATRIX = {
        # Affinity scores (-1.0 = strong opposition, +1.0 = strong alliance)
        "linksradikal": {
            "links": 0.7,          # Strong alliance
            "mitte": -0.3,         # Mild opposition
            "liberal": -0.6,       # Strong disagreement on economics
            "rechts": -0.9,        # Strong opposition
            "rechtsextrem": -1.0   # Complete opposition
        },
        "links": {
            "linksradikal": 0.7,
            "mitte": 0.2,          # Potential cooperation
            "liberal": -0.2,       # Disagreement on economics
            "rechts": -0.7,
            "rechtsextrem": -0.9
        },
        "mitte": {
            "linksradikal": -0.3,
            "links": 0.2,
            "liberal": 0.3,        # Moderate cooperation
            "rechts": 0.1,         # Cautious cooperation
            "rechtsextrem": -0.6   # Clear opposition
        },
        "liberal": {
            "linksradikal": -0.6,
            "links": -0.2,
            "mitte": 0.3,
            "rechts": 0.1,         # Economic common ground
            "rechtsextrem": -0.7
        },
        "rechts": {
            "linksradikal": -0.9,
            "links": -0.7,
            "mitte": 0.1,
            "liberal": 0.1,
            "rechtsextrem": -0.3    # Uncomfortable alliance
        },
        "rechtsextrem": {
            "linksradikal": -1.0,
            "links": -0.9,
            "mitte": -0.6,
            "liberal": -0.7,
            "rechts": -0.3
        }
    }
    
    ISSUE_COALITIONS = {
        "climate_policy": {
            "strong_support": ["linksradikal", "links"],
            "moderate_support": ["mitte", "liberal"],
            "opposition": ["rechts", "rechtsextrem"]
        },
        "immigration_policy": {
            "liberal_approach": ["linksradikal", "links", "liberal"],
            "moderate_approach": ["mitte"],
            "restrictive_approach": ["rechts", "rechtsextrem"]
        },
        "economic_regulation": {
            "high_regulation": ["linksradikal", "links"],
            "moderate_regulation": ["mitte"],
            "low_regulation": ["liberal", "rechts"],
            "minimal_regulation": ["rechtsextrem"]
        },
        "social_policy": {
            "progressive": ["linksradikal", "links", "liberal"],
            "moderate": ["mitte"],
            "conservative": ["rechts", "rechtsextrem"]
        }
    }
    
    def calculate_coalition_strength(self, issue: str, participating_milieus: List[str]) -> float:
        """
        Calculate the strength of a coalition on a specific issue
        """
        if issue not in self.ISSUE_COALITIONS:
            return 0.0
            
        issue_positions = self.ISSUE_COALITIONS[issue]
        coalition_strength = 0.0
        
        for position, aligned_milieus in issue_positions.items():
            aligned_in_coalition = [m for m in participating_milieus if m in aligned_milieus]
            if aligned_in_coalition:
                position_weight = self._get_position_weight(position)
                milieu_proportion = sum(self.MILIEUS[m]["base_proportion"] 
                                      for m in aligned_in_coalition)
                coalition_strength += position_weight * milieu_proportion
        
        return coalition_strength
```

## 🏗️ System Components Deep Dive

### 🌐 Frontend Architecture v3.0 (React 18.3 + TypeScript)

The frontend employs a sophisticated component architecture with advanced state management and real-time visualization capabilities:

#### Core Technology Stack
- **Framework**: React 18.3.1 with TypeScript 4.9+ 
- **Build System**: Create React App with Webpack 5
- **State Management**: Zustand v4.4+ (modular stores)
- **Visualization**: Deck.GL 8.9+ for hardware-accelerated rendering
- **UI Components**: Custom component library with CSS-in-JS
- **HTTP Client**: Axios with interceptors and retry logic
- **WebSocket**: Native WebSocket with reconnection handling
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier + Husky pre-commit hooks

#### Advanced Component Architecture

```typescript
// Component Organization Strategy
src/
├── components/                     # Organized by domain
│   ├── config/                    # Configuration editors
│   │   ├── BiomeEditor.tsx        # Multi-biome configuration
│   │   ├── MilieuEditor.tsx       # 6-milieu system editor
│   │   ├── FormulaEditor.tsx      # Formula Registry integration
│   │   └── MediaEditor.tsx        # Media source configuration
│   ├── dashboard/                 # Real-time dashboard
│   │   ├── ControlPanel.tsx       # Simulation controls
│   │   ├── MetricsDashboard.tsx   # Live metrics display
│   │   ├── AgentInspector.tsx     # Individual agent details
│   │   └── EventLog.tsx           # System event timeline
│   ├── simulation/                # Simulation-specific UI
│   │   ├── AgentMap.tsx           # Deck.GL visualization
│   │   ├── BiomeLayout.tsx        # Geographic biome display
│   │   └── PoliticalChart.tsx     # Political position visualization
│   ├── ui/                        # Reusable UI components
│   │   ├── Button.tsx             # Standardized button component
│   │   ├── Modal.tsx              # Modal dialog system
│   │   ├── DataTable.tsx          # Sortable data tables
│   │   └── LoadingSpinner.tsx     # Loading states
│   └── widgets/                   # Dashboard widget containers
│       ├── WidgetContainer.tsx    # Collapsible widget wrapper
│       ├── ChartWidget.tsx        # Chart display widget
│       └── MetricsWidget.tsx      # Metrics display widget
├── store/                         # Modular state management
│   ├── useConnectionStore.ts      # WebSocket connection state
│   ├── useDashboardStore.ts       # Dashboard layout & widgets
│   ├── useAgentStore.ts           # Agent selection & filtering
│   ├── useSimulationStore.ts      # Simulation data & controls
│   ├── useConfigStore.ts          # Configuration management
│   └── useAuthStore.ts            # Authentication & authorization
├── hooks/                         # Custom React hooks
│   ├── useWebSocket.ts            # WebSocket connection hook
│   ├── useSimulationData.ts       # Simulation data fetching
│   ├── usePerformanceMonitor.ts   # Performance tracking
│   └── useLocalStorage.ts         # Persistent local storage
├── services/                      # API integration layer
│   ├── apiClient.ts               # Axios configuration & interceptors
│   ├── simulationAPI.ts           # Simulation endpoints
│   ├── configAPI.ts               # Configuration endpoints
│   ├── formulaAPI.ts              # Formula Registry endpoints
│   └── authAPI.ts                 # Authentication endpoints
├── types/                         # TypeScript definitions
│   ├── simulation.ts              # Simulation data types
│   ├── configuration.ts           # Configuration interfaces
│   ├── api.ts                     # API request/response types
│   └── components.ts              # Component prop interfaces
├── utils/                         # Utility functions
│   ├── formatters.ts              # Data formatting utilities
│   ├── validators.ts              # Input validation functions
│   ├── colors.ts                  # Color scheme management
│   └── performance.ts             # Performance optimization utils
└── styles/                        # Global styling
    ├── variables.css              # CSS custom properties
    ├── themes.css                 # Dark/light theme definitions
    ├── components.css             # Component-specific styles
    └── animations.css             # Animation definitions

// Advanced State Management Example
interface SimulationStore {
  // Core simulation state
  data: SimulationUpdatePayload | null
  isRunning: boolean
  currentStep: number
  executionMode: 'single' | 'multi' | 'continuous' | 'conditional'
  
  // Performance monitoring
  performance: {
    stepsPerSecond: number
    memoryUsage: number
    renderTime: number
    lastUpdateTime: number
  }
  
  // Advanced controls
  breakConditions: {
    active: string[]
    thresholds: Record<string, number>
    triggered?: string
  }
  
  // Recording system
  recording: {
    isActive: boolean
    sessionId?: string
    dataFields: string[]
    exportFormat: 'csv' | 'json' | 'parquet'
  }
  
  // Actions with error handling
  actions: {
    startSimulation: () => Promise<void>
    stopSimulation: () => Promise<void>
    stepSimulation: (steps?: number) => Promise<void>
    resetSimulation: (config?: Partial<SimulationConfig>) => Promise<void>
    setBreakConditions: (conditions: string[]) => void
    startRecording: (config: RecordingConfig) => Promise<void>
    exportData: (format: string) => Promise<string>
  }
}

// Performance-Optimized Component Example
const AgentMap = memo(({ agents, layout, milieus }: AgentMapProps) => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
  const selectedAgentId = useAgentStore(state => state.selectedAgentId)
  const colorScheme = useDashboardStore(state => state.colorScheme)
  
  // Memoized layer creation for performance
  const agentLayer = useMemo(() => new ScatterplotLayer({
    id: 'agents',
    data: agents,
    getPosition: d => d.position,
    getRadius: 8,
    getFillColor: d => getMilieuColor(d.initial_milieu, colorScheme),
    pickable: true,
    onHover: handleAgentHover,
    onClick: handleAgentClick,
    updateTriggers: {
      getFillColor: [colorScheme, milieus]
    }
  }), [agents, colorScheme, milieus])
  
  const biomeLayer = useMemo(() => new GeoJsonLayer({
    id: 'biomes',
    data: layout,
    filled: true,
    getFillColor: d => getBiomeColor(d.properties.name),
    getLineColor: [255, 255, 255, 100],
    lineWidthMinPixels: 2
  }), [layout])
  
  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({viewState}) => setViewState(viewState)}
      controller={true}
      layers={[biomeLayer, agentLayer]}
      getTooltip={getAgentTooltip}
    >
      <StaticMap
        mapStyle="mapbox://styles/mapbox/dark-v10"
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
      />
    </DeckGL>
  )
})
```

#### Advanced Component Interfaces

```typescript
// Enhanced BiomeEditor with validation and presets
interface BiomeEditorProps {
  biomes: BiomeConfig[]
  onBiomeChange: (index: number, biome: BiomeConfig) => void
  onValidationError: (errors: ValidationError[]) => void
  isDisabled: boolean
  presets: BiomePreset[]
  validationRules: BiomeValidationRules
  enableAdvancedMode: boolean
}

// Sophisticated MilieuEditor with demographic modeling
interface MilieuEditorProps {
  milieus: InitialMilieu[]
  onMilieuChange: (milieus: InitialMilieu[]) => void
  demographicProfiles: DemographicProfile[]
  presets: MilieuPreset[]
  onPresetLoad: (preset: MilieuPreset) => void
  enableCustomDistributions: boolean
  validationMode: 'strict' | 'relaxed'
}

// High-Performance AgentMap with advanced visualization
interface AgentMapProps {
  agents: AgentVisual[]
  layout: BiomeLayout[]
  milieus: InitialMilieu[]
  colorScheme: 'milieu' | 'wealth' | 'education' | 'political_position'
  selectedAgentId?: number
  onAgentSelect: (agentId: number | null) => void
  onAgentHover: (agent: AgentVisual | null) => void
  showBiomeBoundaries: boolean
  showSocialNetworks: boolean
  animationEnabled: boolean
  renderOptimization: {
    enableClustering: boolean
    clusterRadius: number
    maxAgentsPerCluster: number
  }
}

// Formula Registry Editor Integration
interface FormulaEditorProps {
  formulaId?: string
  onSave: (formula: FormulaDefinition) => Promise<void>
  onValidate: (expression: string) => Promise<ValidationResult>
  onTest: (formula: FormulaDefinition, testData: any) => Promise<TestResult>
  availableVariables: FormulaVariable[]
  syntaxHighlighting: boolean
  autoCompletion: boolean
  realTimeValidation: boolean
}

// Advanced MetricsDashboard with custom widgets
interface MetricsDashboardProps {
  metrics: SimulationMetrics
  widgets: DashboardWidget[]
  onWidgetAdd: (widget: DashboardWidget) => void
  onWidgetRemove: (widgetId: string) => void
  onWidgetReorder: (widgets: DashboardWidget[]) => void
  customizations: {
    theme: 'light' | 'dark'
    updateInterval: number
    showTooltips: boolean
    enableInteractions: boolean
  }
  exportOptions: {
    formats: ('png' | 'svg' | 'pdf')[]
    onExport: (format: string) => Promise<void>
  }
}

// Real-time EventLog with filtering and search
interface EventLogProps {
  events: SimulationEvent[]
  filters: {
    eventTypes: string[]
    timeRange: [Date, Date]
    severity: ('info' | 'warning' | 'error')[]
    searchTerm: string
  }
  onFilterChange: (filters: EventLogFilters) => void
  onEventSelect: (event: SimulationEvent) => void
  maxEvents: number
  autoScroll: boolean
  enableSearch: boolean
  exportEnabled: boolean
}

// Authorization-aware ControlPanel
interface ControlPanelProps {
  permissions: UserPermissions
  simulationState: SimulationState
  onAction: (action: SimulationAction) => Promise<void>
  advancedMode: boolean
  shortcuts: KeyboardShortcut[]
  confirmationRequired: boolean
  customActions: CustomAction[]
}
```

#### Erweiterte State Management
```typescript
interface SimulationStore {
  // Simulation State
  simulationData: SimulationUpdatePayload | null
  isRunning: boolean
  isConnected: boolean
  selectedAgentId: number | null
  history: SimulationUpdatePayload[]
  
  // Actions (Erweitert)
  runSimulation: () => void
  stopSimulation: () => void
  resetSimulation: () => void
  stepSimulation: (steps?: number) => void  // NEU
  selectAgent: (agentId: number | null) => void
  
  // WebSocket Management
  connect: () => void
  disconnect: () => void
}
```

#### Component Hierarchy (Aktualisiert)
```
App
├── StatusBar
├── ControlPanel (Erweitert)
│   ├── SimulationControls
│   │   ├── StartButton
│   │   ├── StepButton (1 Step) ⏭ NEW
│   │   ├── MultiStepButton (10 Steps) ⏭⏭ NEW
│   │   ├── StopButton
│   │   └── ResetButton
│   ├── ParameterInputs
│   └── PresetManager
├── LiveDashboard
│   ├── AgentMap (Deck.gl) 🗺️ UPDATED
│   │   ├── BiomeLayoutLayer NEW
│   │   ├── AgentScatterplotLayer
│   │   ├── MilieuColorMapping NEW
│   │   └── BiomeLabelLayer NEW
│   ├── MetricsDashboard (Recharts)
│   │   ├── PopulationDistribution NEW
│   │   ├── EconomicMetrics NEW
│   │   ├── EventTimeline NEW
│   │   └── TemplateDistribution NEW
│   ├── AgentInspector NEW
│   │   ├── AgentDetails
│   │   ├── MilieuInfo NEW
│   │   ├── EconomicData NEW
│   │   └── PoliticalPosition NEW
│   └── EventLog
└── Configuration (Erweitert)
    ├── BiomeEditor NEW
    │   ├── PopulationPercentage NEW
    │   ├── EconomicDistributions
    │   ├── EcologicalParameters NEW
    │   └── BehavioralThresholds NEW
    ├── InitialPopulationEditor NEW
    │   ├── MilieuManagement NEW
    │   ├── PresetLoading NEW
    │   ├── AttributeDistributions NEW
    │   └── ProportionValidation NEW
    ├── MediaEditor
    │   ├── IdeologicalPositioning NEW
    │   └── InfluenceModels
    ├── TemplateEditor
    │   └── PoliticalCategorization NEW
    └── OutputClassificationEditor NEW
        └── SchablonManagement NEW
```

### ⚙️ Backend Architecture v3.0 (FastAPI + Mesa)

The backend implements a sophisticated microservices-oriented architecture with advanced features:

#### FastAPI Application Architecture

```python
# Advanced Application Structure
from fastapi import FastAPI, Depends, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

# Application Lifespan Management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown handling"""
    # Startup
    logger.info("Initializing ABM² Digital Lab Backend v3.0")
    await initialize_formula_registry()
    await setup_metrics_collection()
    await validate_system_configuration()
    
    yield  # Application runs here
    
    # Shutdown
    logger.info("Shutting down gracefully...")
    await cleanup_resources()
    await flush_audit_logs()

# Application Instance with Advanced Configuration
app = FastAPI(
    title="ABM² Digital Lab API",
    version="3.0.0",
    description="Advanced Agent-Based Modeling Platform with Formula Registry",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Comprehensive Middleware Stack
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "http://192.168.178.55:3000",  # Local network
        "https://abm.research-institute.edu"  # Production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"]
)

# Custom Middleware for Advanced Features
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

@app.middleware("http")
async def add_performance_monitoring(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Record metrics
    metrics_collector.record_request(
        endpoint=request.url.path,
        method=request.method,
        status_code=response.status_code,
        duration=process_time
    )
    
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Comprehensive Route Structure (60+ endpoints)
RESTAPI_ENDPOINTS = {
    # System Health & Monitoring
    "/api/health": "System health check with detailed diagnostics",
    "/api/metrics": "Prometheus metrics endpoint",
    "/api/system/info": "System information and version details",
    "/api/system/performance": "Performance metrics and profiling data",
    
    # Core Simulation Management
    "/api/simulation/data": "Current simulation state and agent data",
    "/api/simulation/step": "Execute simulation steps (1-1000)",
    "/api/simulation/reset": "Reset simulation with new parameters",
    "/api/simulation/start": "Start continuous simulation",
    "/api/simulation/stop": "Stop continuous simulation",
    "/api/simulation/status": "Detailed simulation status and statistics",
    
    # Advanced Simulation Features
    "/api/simulation/scenarios": "Batch scenario execution",
    "/api/simulation/conditions": "Conditional execution management",
    "/api/simulation/export": "Export simulation results",
    "/api/simulation/import": "Import simulation state",
    
    # Configuration Management
    "/api/config": "Complete system configuration",
    "/api/config/biomes": "Biome configuration management",
    "/api/config/milieus": "Political milieu definitions",
    "/api/config/media": "Media source configuration",
    "/api/config/templates": "Political template definitions",
    "/api/config/validate": "Configuration validation endpoint",
    
    # Formula Registry (Revolutionary Feature)
    "/api/formulas": "List all available formulas",
    "/api/formulas/{formula_id}": "Get specific formula definition",
    "/api/formulas/{formula_id}/versions": "Formula version history",
    "/api/formulas/{formula_id}/validate": "Validate formula syntax",
    "/api/formulas/{formula_id}/compile": "Compile formula for execution",
    "/api/formulas/{formula_id}/test": "Test formula with sample data",
    "/api/formulas/{formula_id}/release": "Release formula to production",
    "/api/formulas/{formula_id}/rollback": "Rollback to previous version",
    "/api/formulas/categories": "List formula categories",
    "/api/formulas/search": "Search formulas by criteria",
    
    # Authorization & User Management
    "/api/auth/login": "User authentication endpoint",
    "/api/auth/logout": "User logout and token invalidation",
    "/api/auth/refresh": "JWT token refresh",
    "/api/auth/permissions": "User permission checking",
    "/api/users/profile": "User profile management",
    "/api/users/preferences": "User interface preferences",
    
    # Recording & Data Export
    "/api/recording/start": "Start data recording session",
    "/api/recording/stop": "Stop active recording session",
    "/api/recording/status": "Recording session status",
    "/api/recording/export": "Export recorded data",
    "/api/recording/sessions": "List all recording sessions",
    "/api/recording/cleanup": "Clean up old recordings",
    
    # Performance & Monitoring
    "/api/performance/metrics": "Detailed performance metrics",
    "/api/performance/profiling": "System profiling data",
    "/api/audit/logs": "System audit log access",
    "/api/audit/events": "Security and system events",
    
    # Preset & Template Management
    "/api/presets/biomes": "Biome configuration presets",
    "/api/presets/milieus": "Milieu configuration presets",
    "/api/presets/complete": "Complete system presets",
    "/api/templates/political": "Political classification templates",
    "/api/templates/economic": "Economic classification templates",
    
    # Advanced Analytics
    "/api/analytics/trends": "Simulation trend analysis",
    "/api/analytics/correlations": "Variable correlation analysis",
    "/api/analytics/predictions": "Predictive modeling endpoints",
    "/api/analytics/export": "Analytics data export",
    
    # WebSocket Endpoints
    "/ws": "Main WebSocket connection for real-time updates",
    "/ws/monitoring": "Performance monitoring WebSocket",
    "/ws/recording": "Data recording status WebSocket"
}

# Example Advanced Endpoint Implementation
@app.post("/api/simulation/scenarios")
async def execute_batch_scenarios(
    scenarios: List[ScenarioConfig],
    execution_mode: Literal["sequential", "parallel"] = "sequential",
    max_concurrent: int = 4,
    current_user: User = Depends(get_current_user)
):
    """Execute multiple simulation scenarios with advanced options"""
    
    # Authorization check
    if not has_permission(current_user, "simulation:batch"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Validate scenarios
    validation_results = await validate_scenarios(scenarios)
    if any(not r.is_valid for r in validation_results):
        raise HTTPException(status_code=400, detail="Invalid scenario configuration")
    
    # Execute scenarios
    if execution_mode == "parallel":
        results = await execute_scenarios_parallel(scenarios, max_concurrent)
    else:
        results = await execute_scenarios_sequential(scenarios)
    
    # Record execution metrics
    await metrics_collector.record_batch_execution(scenarios, results)
    
    return {
        "execution_id": str(uuid4()),
        "scenarios_executed": len(scenarios),
        "execution_time": sum(r.duration for r in results),
        "results": results,
        "summary_statistics": calculate_batch_statistics(results)
    }
```

#### Advanced Manager Architecture

```python
class EnhancedConfigManager:
    """
    Sophisticated configuration management with:
    - Multi-environment support (dev/staging/prod)
    - Version control for configurations
    - Hot-reloading capabilities
    - Validation with detailed error reporting
    - Backup and restore functionality
    """
    
    def __init__(self):
        self.environments = {"dev", "staging", "production"}
        self.current_env = os.getenv("ENVIRONMENT", "dev")
        self.config_cache = TTLCache(maxsize=100, ttl=300)  # 5-minute cache
        self.validators = self._initialize_validators()
        self.change_listeners = []
        
    async def get_config(self, section: Optional[str] = None) -> Union[FullConfig, Dict]:
        """Get configuration with caching and validation"""
        cache_key = f"{self.current_env}:{section or 'full'}"
        
        if cache_key in self.config_cache:
            return self.config_cache[cache_key]
            
        config = await self._load_config_from_source(section)
        await self._validate_config(config, section)
        
        self.config_cache[cache_key] = config
        return config
    
    async def update_config(self, updates: Dict, user: User) -> ConfigUpdateResult:
        """Update configuration with audit trail"""
        # Authorization check
        if not has_permission(user, "config:write"):
            raise PermissionError("Insufficient permissions for config updates")
        
        # Validate updates
        validation_result = await self._validate_config_updates(updates)
        if not validation_result.is_valid:
            return ConfigUpdateResult(
                success=False,
                errors=validation_result.errors
            )
        
        # Create backup
        backup_id = await self._create_config_backup()
        
        try:
            # Apply updates
            await self._apply_config_updates(updates)
            
            # Notify listeners
            await self._notify_config_changed(updates, user)
            
            # Clear cache
            self.config_cache.clear()
            
            # Log audit event
            await audit_logger.log_config_change(user, updates, backup_id)
            
            return ConfigUpdateResult(
                success=True,
                backup_id=backup_id,
                applied_changes=updates
            )
            
        except Exception as e:
            # Rollback on failure
            await self._restore_config_backup(backup_id)
            raise ConfigUpdateError(f"Failed to update config: {e}")
    
    def validate_biome_distribution(self, biomes: List[BiomeConfig]) -> ValidationResult:
        """Comprehensive biome validation"""
        errors = []
        warnings = []
        
        # Check percentage sum
        total_percentage = sum(b.population_percentage for b in biomes)
        if abs(total_percentage - 100.0) > 0.001:
            errors.append(f"Biome percentages sum to {total_percentage}%, must equal 100%")
        
        # Check individual biome constraints
        for biome in biomes:
            if biome.population_percentage < 0:
                errors.append(f"Biome {biome.name} has negative percentage")
            elif biome.population_percentage > 80:
                warnings.append(f"Biome {biome.name} has very high percentage (>{biome.population_percentage}%)")
            
            # Validate economic distributions
            if biome.einkommen_verteilung.mean < 0:
                errors.append(f"Biome {biome.name} has negative income mean")
            
            # Validate hazard parameters
            if not 0 <= biome.hazard_probability <= 1:
                errors.append(f"Biome {biome.name} hazard probability out of range [0,1]")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )

class AdvancedSimulationManager:
    """
    Sophisticated simulation management with:
    - Concurrent execution support
    - State persistence and recovery
    - Performance optimization
    - Real-time monitoring
    - Automated scenario testing
    """
    
    def __init__(self):
        self.model = None
        self.execution_history = []
        self.performance_monitor = PerformanceMonitor()
        self.state_persistence = StatePersistenceManager()
        self.scenario_executor = ScenarioExecutor()
        
    async def execute_simulation_steps(
        self,
        steps: int = 1,
        mode: Literal["normal", "fast", "detailed"] = "normal",
        break_conditions: Optional[List[str]] = None
    ) -> SimulationResult:
        """
        Execute simulation with advanced options:
        - Normal: Full simulation with all features
        - Fast: Optimized execution with minimal logging
        - Detailed: Enhanced logging and analytics
        """
        
        if not self.model:
            raise SimulationError("No active simulation model")
        
        start_time = time.time()
        results = []
        
        with self.performance_monitor.track_simulation(mode):
            for step_num in range(steps):
                # Check break conditions
                if break_conditions and self._check_break_conditions(break_conditions):
                    break
                
                # Execute single step
                if mode == "fast":
                    step_result = await self._execute_fast_step()
                elif mode == "detailed":
                    step_result = await self._execute_detailed_step()
                else:
                    step_result = await self._execute_normal_step()
                
                results.append(step_result)
                
                # Real-time progress updates
                if step_num % 10 == 0:  # Every 10 steps
                    await self._broadcast_progress_update(step_num, steps)
        
        execution_time = time.time() - start_time
        
        # Store execution history
        self.execution_history.append({
            "timestamp": datetime.now(),
            "steps_executed": len(results),
            "execution_time": execution_time,
            "mode": mode,
            "break_conditions": break_conditions
        })
        
        return SimulationResult(
            steps_executed=len(results),
            execution_time=execution_time,
            final_state=self.model.get_state_snapshot(),
            performance_metrics=self.performance_monitor.get_metrics(),
            step_results=results
        )
    
    async def reset_simulation_with_config(
        self,
        config: Optional[SimulationConfig] = None,
        preserve_agents: bool = False,
        seed: Optional[int] = None
    ) -> ResetResult:
        """Advanced simulation reset with options"""
        
        # Create state backup if requested
        backup_id = None
        if preserve_agents and self.model:
            backup_id = await self.state_persistence.create_backup(self.model)
        
        # Clear current model
        if self.model:
            await self._cleanup_model_resources()
            del self.model
            
        # Load configuration
        if config is None:
            config = await config_manager.get_config()
            
        # Set random seed for reproducibility
        if seed is not None:
            random.seed(seed)
            np.random.seed(seed)
            
        # Initialize new model
        try:
            self.model = PoliticalModel(
                num_agents=config.simulation_parameters.num_agents,
                network_connections=config.simulation_parameters.network_connections,
                seed=seed
            )
            
            # Restore agents if requested
            if preserve_agents and backup_id:
                await self.state_persistence.restore_agents(self.model, backup_id)
                
            # Initialize model state
            await self.model.initialize()
            
            return ResetResult(
                success=True,
                model_id=self.model.unique_id,
                agent_count=len(self.model.schedule.agents),
                backup_id=backup_id,
                seed=seed
            )
            
        except Exception as e:
            logger.error(f"Failed to reset simulation: {e}")
            return ResetResult(
                success=False,
                error=str(e),
                backup_id=backup_id
            )
    
    async def get_enhanced_model_data(self) -> EnhancedModelData:
        """Get comprehensive model data with analytics"""
        if not self.model:
            raise SimulationError("No active simulation model")
            
        base_data = self.model.get_model_data()
        
        # Add performance metrics
        performance_data = self.performance_monitor.get_current_metrics()
        
        # Add trend analysis
        trend_analysis = await self._calculate_trends()
        
        # Add agent analytics
        agent_analytics = await self._calculate_agent_analytics()
        
        # Add network analysis
        network_analysis = await self._calculate_network_metrics()
        
        return EnhancedModelData(
            **base_data,
            performance=performance_data,
            trends=trend_analysis,
            agent_analytics=agent_analytics,
            network_metrics=network_analysis,
            timestamp=datetime.now(),
            execution_history=self.execution_history[-10:]  # Last 10 executions
        )
```

### ABM Core Engine (v3.0)

#### Enhanced Model Architecture
```python
class PoliticalModel:
    """Enhanced ABM Model with Biome-based Distribution"""
    def __init__(self, num_agents=100, network_connections=5):
        # Enhanced Agent Management
        self.agent_set = []  # Mesa 3.2.0+ Agent list
        self.step_count = 0
        self.events = []  # NEW: Event log
        
        # Configuration Loading
        self.biomes = config_manager.get_config().biomes
        self.initial_milieus = config_manager.get_initial_milieus()  # NEW
        self.media_sources = config_manager.get_media_sources()
        self.output_schablonen = config_manager.get_output_schablonen()  # NEW
        
        # NEW: Biome Layout Calculation
        self.layout = self._calculate_biome_layouts()
        
        # Enhanced Agent Creation with Calculated Distribution
        agent_distribution = self._calculate_agent_distribution()  # NEW
        self._create_agents_from_distribution(agent_distribution)  # NEW
        
        # Managers (Enhanced)
        self.resource_manager = ResourceManager(self)
        self.hazard_manager = HazardManager(self)
        self.seasonality_manager = SeasonalityManager(self)
        self.media_manager = MediaManager(self, self.media_sources)  # Enhanced
        
    def step(self):
        """Enhanced 8-phase simulation cycle"""
        self.events = []  # Clear previous events
        
        # Phase 1: Seasonal Effects
        self.seasonality_manager.apply_seasonal_effects()
        
        # Phase 2: Resource Update
        self.resource_manager.update_agent_resources()
        
        # Phase 3: Hazard Events
        hazard_events = self.hazard_manager.trigger_events()
        self.events.extend(hazard_events)  # NEW
        
        # Phase 4: Agent Decision
        for agent in self.agent_set:
            agent.decide_and_act()
        
        # Phase 5: Media Consumption & Learning
        for agent in self.agent_set:
            chosen_source = self.media_manager.select_source_for_agent(agent.state)
            agent.learn_from_media(chosen_source, media_influence_factor)
        
        # Phase 6: Learning & Evaluation
        for agent in self.agent_set:
            pass  # Future implementation
        
        # Phase 7: Update Psychological States
        for agent in self.agent_set:
            agent.update_psychological_states()
        
        # Phase 8: Template Classification (NEW)
        self._classify_agents_into_templates()  # NEW
        
        # Event Generation (NEW)
        self._generate_gini_events()  # NEW
        
        self.step_count += 1

    def _calculate_agent_distribution(self) -> Dict[str, Dict[str, int]]:
        """NEW: Calculate agent distribution matrix"""
        # Implementation in model.py:712

    def _classify_agents_into_templates(self) -> None:
        """NEW: Classify agents into political templates"""
        # Implementation in model.py:225
```

#### Enhanced Agent System
```python
class PoliticalAgent(Agent):
    """Enhanced political agent with extended state"""
    def __init__(self, unique_id, model, **agent_state_args):
        super().__init__(unique_id, model)
        
        # NEW: Enhanced State Management
        self.state = AgentState(
            # Demografische Daten
            alter=agent_state_args['alter'],
            bildung=agent_state_args['bildung'],
            
            # Kognitive Eigenschaften
            kognitive_kapazitaet_basis=agent_state_args['kognitive_kapazitaet_basis'],
            effektive_kognitive_kapazitaet=agent_state_args['effektive_kognitive_kapazitaet'],
            
            # Wirtschaftliche Daten
            einkommen=agent_state_args['einkommen'],
            vermoegen=agent_state_args['vermoegen'],
            sozialleistungen=agent_state_args['sozialleistungen'],
            
            # Politische Eigenschaften
            freedom_preference=agent_state_args['freedom_preference'],
            altruism_factor=agent_state_args['altruism_factor'],
            politische_wirksamkeit=agent_state_args['politische_wirksamkeit'],
            
            # Soziale Eigenschaften
            sozialkapital=agent_state_args['sozialkapital'],
            risikoaversion=agent_state_args['risikoaversion'],
            
            # Räumliche und Gruppenzugehörigkeit
            position=agent_state_args['position'],  # NEW: Biome-based position
            region=agent_state_args['region'],
            initial_milieu=agent_state_args['initial_milieu'],  # NEW
            schablone=None  # NEW: Will be set by classification
        )
    
    def decide_and_act(self) -> Dict:
        """Enhanced decision making with biome awareness"""
        # Implementation includes biome-specific factors
        
    def learn_from_media(self, source: MediaSourceConfig, influence: float) -> None:
        """NEW: Learn from ideologically positioned media"""
        # Implementation uses ideological_position
        
    def update_psychological_states(self) -> None:
        """NEW: Update psychological coupling effects"""
        # Implementation of psychological state updates
```

## Neue Datenmodelle

### Enhanced Simulation Data Model
```typescript
interface SimulationUpdatePayload {
  step: number
  model_report: ModelReport  // Enhanced
  agent_visuals: AgentVisual[]  // Enhanced
}

interface ModelReport {
  // Politische Metriken
  Mean_Freedom: number
  Mean_Altruism: number
  Polarization: number
  
  // Wirtschaftsmetriken (NEW)
  Durchschnittsvermoegen: number
  Durchschnittseinkommen: number
  Gini_Vermoegen: number
  Gini_Einkommen: number
  Hazard_Events_Count: number
  
  // Geografische Verteilung
  Regions: Record<string, number>
  layout: BiomeLayout[]  // NEW
  
  // Event-System (NEW)
  events: string[]
  
  // Population Analysis (NEW)
  population_report: {
    milieu_distribution: Record<string, number>
    schablonen_verteilung: Record<string, number>  // NEW
    key_averages: {
      mean_wealth: number
      mean_income: number
      mean_altruism: number
      mean_effective_cognition: number
      mean_risk_aversion: number
    }
  }
}

interface AgentVisual {
  id: number
  position: [number, number]  // NEW: Biome-based coordinates
  political_position: { a: number; b: number }
  region: string
  schablone?: string  // NEW: Template classification
  initial_milieu?: string  // NEW: Milieu assignment
  
  // Extended Agent Data (NEW)
  alter?: number
  einkommen?: number
  vermoegen?: number
  sozialleistungen?: number
  risikoaversion?: number
  effektive_kognitive_kapazitaet?: number
  kognitive_kapazitaet_basis?: number
  politische_wirksamkeit?: number
  sozialkapital?: number
}
```

### Enhanced Configuration Model
```typescript
// Biome Configuration (NEW)
interface BiomeConfig {
  name: string
  population_percentage: number  // NEW: Must sum to 100%
  
  // Economic Distributions
  einkommen_verteilung: DistributionConfig
  vermoegen_verteilung: DistributionConfig
  sozialleistungs_niveau: number
  
  // Hazard Parameters
  hazard_probability: number
  hazard_impact_factor: number
  
  // Ecological Parameters (NEW)
  capacity: number
  initial_quality: number
  regeneration_rate: number
  produktivitaets_faktor: number
  
  // Behavioral Thresholds (NEW)
  knappheits_schwelle: number
  risiko_vermoegen_schwelle: number
}

// Initial Milieu Configuration (NEW)
interface InitialMilieu {
  name: string
  proportion: number  // Must sum to 1.0
  color: string  // Hex color for visualization
  attribute_distributions: Record<string, DistributionConfig>
}

// Media Source Configuration (Enhanced)
interface MediaSource {
  name: string
  ideological_position: {
    economic_axis: number  // -1.0 to 1.0
    social_axis: number    // -1.0 to 1.0
  }
}
```

## Enhanced Communication

### REST API (Erweitert)
- **Enhanced Endpoints** für neue Konfigurationssysteme
- **Multi-Step Support** für `/api/simulation/step`
- **Validation** mit Pydantic für alle Eingaben
- **Error Handling** für Konfigurationsfehler

### WebSocket Communication (Enhanced)
```javascript
// Enhanced WebSocket Messages
interface WebSocketMessage {
  type: 'simulation_data' | 'event' | 'error' | 'ping'
  
  // Simulation Data
  step?: number
  model_report?: ModelReport
  agent_visuals?: AgentVisual[]
  
  // Event Data (NEW)
  events?: string[]
  
  // System Messages
  message?: string
  timestamp?: string
}
```

### Event System (NEW)
```python
# Event Types
HAZARD_EVENT = "HAZARD_EVENT|{biome}: {description}"
GINI_THRESHOLD_EVENT = "GINI_WEALTH_THRESHOLD_CROSSED|{direction}|{value}"
AGENT_MIGRATION_EVENT = "AGENT_MIGRATION|{from_biome}|{to_biome}|{count}"
MEDIA_INFLUENCE_EVENT = "MEDIA_INFLUENCE|{source}|{agents_reached}"
```

## Performance & Skalierbarkeit (Enhanced)

### Frontend Performance
- **Deck.gl Rendering** für 1000+ Agenten
- **Virtual Scrolling** für große Konfigurationslisten
- **Debounced Validation** für BiomeEditor
- **Memoized Components** für AgentInspector

### Backend Performance
- **Calculated Distribution** statt Random Assignment
- **Batch Agent Creation** für große Simulationen
- **Event Caching** für WebSocket Broadcasting
- **Pydantic Validation Caching**

### Memory Management
```python
# Enhanced Resource Management
class SimulationManager:
    def reset_model(self, **params):
        # Cleanup previous model
        if self.model:
            del self.model.agent_set
            del self.model
        
        # Create new model with calculated distribution
        self.model = PoliticalModel(**params)
        
        # Garbage collection
        import gc
        gc.collect()
```

## Deployment & Monitoring (Enhanced)

### Development Environment
```
Frontend (React + Deck.gl) ← → Backend (FastAPI + Pydantic)
    ↓                              ↓
Browser (localhost:3000)      Python Process (localhost:8000)
                                   ↓
                            Configuration Files (YAML)
                            ├── config.yml
                            ├── initial_milieus.yml
                            ├── media_sources.yml
                            └── output_schablonen.yml
```

### Enhanced Monitoring
```python
# Performance Metrics
metrics = {
    "agent_distribution_time": calculation_time,
    "biome_validation_result": validation_success,
    "milieu_loading_time": loading_time,
    "websocket_connections": active_connections,
    "memory_usage_mb": memory_usage,
    "simulation_step_time": step_duration
}
```

## Neue Testing-Strategien

### Unit Tests (Enhanced)
```python
# Test Agent Distribution Calculation
def test_agent_distribution():
    milieus = [InitialMilieu(proportion=0.5), InitialMilieu(proportion=0.5)]
    biomes = [BiomeConfig(population_percentage=60), BiomeConfig(population_percentage=40)]
    
    distribution = calculate_agent_distribution(milieus, biomes, 100)
    
    assert sum(sum(d.values()) for d in distribution.values()) == 100
    assert distribution["Milieu1"]["Biome1"] == 30  # 50% * 60% * 100

# Test Biome Validation
def test_biome_percentage_validation():
    biomes = [BiomeConfig(population_percentage=60), BiomeConfig(population_percentage=30)]
    
    with pytest.raises(ValueError, match="must sum to 100%"):
        validate_biome_percentages(biomes)
```

### Integration Tests (NEW)
```typescript
// Test Step Control Integration
describe('SimulationControls', () => {
  test('single step execution', async () => {
    const { result } = renderHook(() => useSimulationStore())
    
    await act(() => result.current.stepSimulation(1))
    
    expect(mockApiCall).toHaveBeenCalledWith('/api/simulation/step')
    expect(result.current.isRunning).toBe(false)
  })
  
  test('multi step execution', async () => {
    const { result } = renderHook(() => useSimulationStore())
    
    await act(() => result.current.stepSimulation(10))
    
    expect(mockApiCall).toHaveBeenCalledTimes(10)
  })
})
```

Diese erweiterte Architektur v2.0 ermöglicht eine präzise Kontrolle über politische Simulationen mit realistischen demografischen Verteilungen und geografischer Visualisierung.