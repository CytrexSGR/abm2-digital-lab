# Digital Lab ABM - Complete Technical Documentation

## 1. System Architecture Overview

The Digital Lab ABM (Agent-Based Model) is a sophisticated socio-ecological simulation system implementing a refactored, modular architecture. The system models political opinion dynamics through adaptive agents interacting within ecological biomes, with real-time feedback loops between economic behavior and environmental conditions.

### Core Components:

- **PoliticalAgent**: Adaptive agents with political beliefs, economic resources, and learning capabilities (agents.py:10-148)
- **PoliticalModel**: Main orchestrator implementing 9-phase simulation cycle (model.py:43-237) 
- **Biomes**: Geographic regions with distinct economic and ecological properties (config/models.py:17-42)
- **Manager System**: Modular architecture for specialized concerns
- **SimulationCycle**: Dedicated class handling step-by-step execution (simulation_cycle.py:4-247)
- **AgentInitializer**: Complex 3-stage agent creation process (agent_initializer.py:12-123)
- **Configuration Architecture**: Externalized parameters via Pydantic models and YAML files

## 2. Complete Configuration Architecture

### Core Configuration Models (config/models.py)

#### BiomeConfig (lines 17-42)
```python
class BiomeConfig(BaseModel):
    name: str
    population_percentage: float = Field(..., ge=0, le=100)
    einkommen_verteilung: DistributionConfig
    vermoegen_verteilung: DistributionConfig 
    sozialleistungs_niveau: float
    hazard_probability: float = Field(..., ge=0, le=1)
    hazard_impact_factor: float
    capacity: float
    initial_quality: float
    regeneration_rate: float
    produktivitaets_faktor: float
    knappheits_schwelle: float
    risiko_vermoegen_schwelle: float
    environmental_sensitivity: float  # Agent-Environment feedback multiplier
```

#### SimulationParametersConfig (lines 56-95)
```python
class SimulationParametersConfig(BaseModel):
    environmental_capacity: float
    media_influence_factor: float
    resilience_bonus_factor: float  # Altruism -> regeneration multiplier
    altruism_target_crisis: float
    crisis_weighting_beta: float
    max_learning_rate_eta_max: float
    education_dampening_k: float
    base_consumption_rate: float
    zeitpraeferenz_sensitivity: float
    risikoaversion_sensitivity: float
    max_investment_rate: float
    investment_return_factor: float
    investment_success_probability: float
    wealth_threshold_cognitive_stress: float
    max_cognitive_penalty: float
    wealth_sensitivity_factor: float
    cognitive_moderator_education_weight: float
    cognitive_moderator_capacity_weight: float
    default_risk_aversion: float
    default_time_preference: float
    default_political_efficacy: float
    grid_size: float
    gini_threshold_change: float
    default_mean_altruism: float
```

#### DistributionConfig (lines 7-16)
Supports 6 distribution types: beta, uniform_int, normal, uniform_float, lognormal, pareto

### Configuration Files Managed by ConfigManager

- **config.yml**: Main simulation parameters and biomes (config/manager.py:12)
- **media_sources.yml**: Media landscape with ideological positions (config/manager.py:13)
- **initial_milieus.yml**: Agent initialization presets (config/manager.py:14)
- **milieus.yml**: Dynamic milieu classification centers (config/manager.py:15)
- **output_schablonen.yml**: Template classification boundaries (config/manager.py:16)

## 3. Complete Agent Data Structure

### AgentState (types.py:4-71)
```python
@dataclasses.dataclass(slots=True)
class AgentState:
    # Demographics
    alter: int                                # Age
    region: str                               # Assigned biome
    
    # Resources  
    bildung: float                           # Education level (0-1)
    einkommen: float                         # Current income
    vermoegen: float                         # Accumulated wealth
    sozialleistungen: float                  # Received social benefits
    
    # Cognition
    kognitive_kapazitaet_basis: float       # Static base capacity
    effektive_kognitive_kapazitaet: float   # Dynamic, stress-affected
    
    # Preferences/States
    freedom_preference: float                 # Freedom vs authority (0-1)
    altruism_factor: float                   # Altruism level (0-1)
    risikoaversion: float                    # Risk aversion (0-1)
    zeitpraeferenzrate: float                # Time preference (0-1)
    
    # Politics
    politische_wirksamkeit: float            # Political efficacy
    
    # Social
    sozialkapital: float                     # Social capital
    
    # Geographic
    position: Tuple[float, float]            # Geographic position (x, y)
    
    # Classifications
    initial_milieu: str = "Unknown"          # Origin milieu (tracking)
    milieu: str = "Unassigned"              # Dynamic best-fit classification
    schablone: str = "Unclassified"         # Political template classification
    
    # Consumption Tracking
    konsumquote: float = 0.0                # Current consumption rate
    ersparnis: float = 0.0                  # Last step's savings
```

### Political Position Calculation (types.py:53-71)
```python
def calculate_political_position(self) -> Tuple[float, float]:
    # Economic Axis: Pro-Redistribution (-1) to Pro-Market (1)
    norm_vermoegen = (self.vermoegen / (self.vermoegen + 10000)) * 2 - 1
    a_i = norm_vermoegen - (self.altruism_factor * 0.5)
    
    # Social Axis: Authoritarian (-1) to Libertarian (1) 
    b_i = (2.0 * self.freedom_preference) - 1.0
    
    return (max(-1.0, min(1.0, a_i)), max(-1.0, min(1.0, b_i)))
```

## 4. Complete Agent Behavior Formulas

### Investment Decision Logic (agents.py:22-58)
```python
def decide_and_act(self, ersparnis: float, params: dict) -> dict:
    # Investment calculation with risk and time preference modulation
    potential_investment_rate = params['max_investment_rate']
    potential_investment = ersparnis * potential_investment_rate
    
    # Risk aversion reduces investment willingness
    risk_adjusted_investment = potential_investment * (1 - self.state.risikoaversion)
    
    # Time preference reduces investment (immediate consumption preference)
    final_investment = risk_adjusted_investment * (1 - self.state.zeitpraeferenzrate)
    
    # Investment outcome (high-risk, high-return model)
    investment_return_factor = params['investment_return_factor'] 
    success_probability = params['investment_success_probability']
    
    if random.random() < success_probability:
        investment_gain = final_investment * investment_return_factor  # Success
    else:
        investment_gain = -final_investment  # Total loss
        
    self.state.vermoegen += investment_gain
    
    return {
        "investment_made": final_investment,
        "investment_gain": investment_gain
    }
```

### Integrated Socio-Ecological Learning (agents.py:60-85)
```python
def learn(self, delta_u_ego: float, delta_u_sozial: float, env_health: float, biome_capacity: float, learning_params: dict):
    # Traditional/Social signal (comparison with environment change)
    delta_trad = delta_u_sozial - delta_u_ego
    
    # Environmental stress signal
    s_env = (learning_params['altruism_target_crisis'] - self.state.altruism_factor) * (1 - env_health / biome_capacity)
    
    # Additive combination of signals
    L_signal = delta_trad + learning_params['crisis_weighting_beta'] * s_env
    
    # Learning rate calculation
    eta = learning_params['max_learning_rate_eta_max'] / (1.0 + learning_params['education_dampening_k'] * self.state.bildung)
    
    # Final altruism update
    adjustment = eta * L_signal
    self.state.altruism_factor = np.clip(self.state.altruism_factor + adjustment, 0.0, 1.0)
```

### Media Learning (agents.py:87-109)
```python
def learn_from_media(self, source: MediaSourceConfig, influence_factor: float, params: dict):
    # Cognitive moderation (higher cognition/education = less susceptible)
    education_weight = params['cognitive_moderator_education_weight']
    capacity_weight = params['cognitive_moderator_capacity_weight']
    cognitive_moderator = 1 - (self.state.bildung * education_weight + 
                              self.state.effektive_kognitive_kapazitaet * capacity_weight)
    base_learning_rate = influence_factor * cognitive_moderator
    
    # Calculate target preference from media source position
    target_freedom_preference = (source.ideological_position.social_axis + 1) / 2.0
    
    # Update freedom preference
    current_pref = self.state.freedom_preference
    adjustment = (target_freedom_preference - current_pref) * base_learning_rate
    self.state.freedom_preference = np.clip(current_pref + adjustment, 0.0, 1.0)
```

### Psychological States Update (agents.py:111-141)
```python
def update_psychological_states(self, params: dict):
    # 1. Update effective cognitive capacity based on wealth ("poverty penalty")
    wealth_threshold = params['wealth_threshold_cognitive_stress']
    max_penalty = params['max_cognitive_penalty']
    
    if self.state.vermoegen < wealth_threshold:
        penalty_factor = (wealth_threshold - self.state.vermoegen) / wealth_threshold
        penalty = max_penalty * penalty_factor
        self.state.effektive_kognitive_kapazitaet = self.state.kognitive_kapazitaet_basis * (1 - penalty)
    else:
        self.state.effektive_kognitive_kapazitaet = self.state.kognitive_kapazitaet_basis
        
    # Clip between 0 and 1
    self.state.effektive_kognitive_kapazitaet = max(0.0, min(1.0, self.state.effektive_kognitive_kapazitaet))
    
    # 2. Update risk aversion based on wealth (prospect theory simplification)
    wealth_sensitivity_factor = params['wealth_sensitivity_factor']
    self.state.risikoaversion = 1 / (1 + (self.state.vermoegen / wealth_sensitivity_factor))
    self.state.risikoaversion = max(0.0, min(1.0, self.state.risikoaversion))
```

## 5. Manager System Details

### ResourceManager (political_abm/managers/resource_manager.py:4-62)

**Responsibilities:**
- Income generation based on biome-specific distributions
- Social benefits calculation as median-income multiplier
- Consumption/saving decisions with behavioral formulas
- Wealth updates after consumption/saving transactions

**Consumption Formula (lines 18-23):**
```python
konsumquote = (params['base_consumption_rate'] +
               (agent.state.zeitpraeferenzrate - 0.5) * params['zeitpraeferenz_sensitivity'] +
               (agent.state.risikoaversion - 0.5) * params['risikoaversion_sensitivity'])
konsumquote = np.clip(konsumquote, 0.0, 1.0)
```

**Transaction Logic (lines 25-36):**
```python
konsumierter_betrag = agent.state.einkommen * konsumquote
ersparnis = agent.state.einkommen - konsumierter_betrag
agent.state.vermoegen += ersparnis
agent.state.konsumquote = konsumquote  # Store for reporting
agent.state.ersparnis = ersparnis      # Store for investment phase
```

### HazardManager (political_abm/managers/hazard_manager.py:3-49)

**Responsibilities:**
- Probabilistic triggering of shock events using effective biome parameters
- Direct application of economic losses (wealth and income)
- Event logging for reporting and visualization
- Uses dynamic hazard probabilities from environment feedback

**Event Triggering Logic (lines 18-46):**
```python
hazard_prob = self.model.effective_hazard_probabilities[agent.state.region]
if random.random() < hazard_prob:
    impact_factor = biome.hazard_impact_factor
    wealth_loss = agent.state.vermoegen * impact_factor
    income_loss = agent.state.einkommen * impact_factor
    
    agent.state.vermoegen = max(0.0, agent.state.vermoegen - wealth_loss)
    agent.state.einkommen = max(0.0, agent.state.einkommen - income_loss)
```

### MediaManager (political_abm/managers/media_manager.py:10-51)

**Responsibilities:**
- Selective media choice based on ideological proximity
- Distance-based probability weighting in 2D space
- Support for arbitrary number of media sources

**Source Selection Algorithm (lines 20-50):**
```python
def select_source_for_agent(self, agent_state: AgentState) -> MediaSourceConfig:
    agent_pos = agent_state.calculate_political_position()
    
    distances = []
    for source in self.media_sources:
        source_pos = (source.ideological_position.economic_axis,
                     source.ideological_position.social_axis)
        dist = np.linalg.norm(np.array(agent_pos) - np.array(source_pos))
        distances.append(dist)
    
    # Inverse weighting: closer distance = higher probability
    weights = [1 / (d + 0.1) for d in distances]
    total_weight = sum(weights)
    probabilities = [w / total_weight for w in weights]
    
    return random.choices(self.media_sources, weights=probabilities, k=1)[0]
```

### SeasonalityManager (political_abm/managers/seasonality_manager.py:1-13)
Minimal implementation - placeholder for future seasonal effects.

## 6. Agent Initialization System

### AgentInitializer (agent_initializer.py:12-123)

Implements sophisticated 3-stage causal logic:

**Stage 1: Ideology & Social Attributes from Milieu (lines 39-48):**
```python
assigned_milieu = random.choices(
    self.model.milieus, 
    weights=[m.proportion for m in self.model.milieus], 
    k=1
)[0]
agent_state_args['initial_milieu'] = assigned_milieu.name

for attr, dist in assigned_milieu.attribute_distributions.__dict__.items():
    agent_state_args[attr] = generate_attribute_value(dist)
```

**Stage 2: Economy & Base Cognition from Biome (lines 50-63):**
```python
assigned_biome = random.choice(self.model.biomes)
agent_state_args['region'] = assigned_biome.name

agent_state_args['einkommen'] = generate_attribute_value(assigned_biome.einkommen_verteilung)
agent_state_args['vermoegen'] = generate_attribute_value(assigned_biome.vermoegen_verteilung)
agent_state_args['kognitive_kapazitaet_basis'] = generate_attribute_value(
    DistributionConfig(type='normal', mean=0.5, std_dev=0.15)
)
```

**Stage 3: Derived Psychological Attributes (lines 98-123):**
```python
def _calculate_derived_attributes(self, agent_state_args: dict, params: dict) -> dict:
    # Risk aversion = f(wealth)
    vermoegen = agent_state_args['vermoegen']
    wealth_sensitivity = params['wealth_sensitivity_factor']
    agent_state_args['risikoaversion'] = 1 / (1 + (vermoegen / wealth_sensitivity))
    
    # Time preference = f(cognitive_capacity) - inverse relationship
    kogn_kap_basis = agent_state_args['kognitive_kapazitaet_basis']
    agent_state_args['zeitpraeferenzrate'] = np.clip(1 - kogn_kap_basis, 0.1, 0.9)
    
    # Political efficacy = f(education, income)
    bildung = agent_state_args['bildung']
    einkommen = agent_state_args['einkommen']
    income_norm = einkommen / (einkommen + 50000)
    agent_state_args['politische_wirksamkeit'] = np.clip(
        bildung * 0.6 + income_norm * 0.4, 0.1, 0.9
    )
    
    # Effective cognitive capacity initially equals basis
    agent_state_args['effektive_kognitive_kapazitaet'] = kogn_kap_basis
    
    return agent_state_args
```

## 7. Complete Simulation Cycle

### SimulationCycle (simulation_cycle.py:4-247)

The 9-phase simulation cycle implementation:

**Phase 1: Seasonal Effects (line 30)**
```python
self.model.seasonality_manager.apply_seasonal_effects()
```

**Phase 2: Resource Update (line 33)**
```python
savings_this_step = self.model.resource_manager.update_agent_resources()
```

**Phase 3: Hazard Events (line 36)**
```python
hazard_events = self.model.hazard_manager.trigger_events()
```

**Phase 4: Agent Decisions (lines 52-62)**
```python
for agent in self.model.agent_set:
    ersparnis = savings_this_step.get(agent.unique_id, 0.0)
    decision_outcome = agent.decide_and_act(ersparnis, self.model.simulation_parameters)
    self.model.investment_decisions_this_step.append({
        "agent_id": agent.unique_id,
        **decision_outcome
    })
```

**Phase 5: Media Consumption (lines 65-76)**
```python
for agent in self.model.agent_set:
    chosen_source = self.model.media_manager.select_source_for_agent(agent.state)
    agent.learn_from_media(chosen_source, influence, self.model.simulation_parameters)
```

**Phase 6: Learning & Evaluation (lines 79-98)**
```python
for agent in self.model.agent_set:
    delta_u_ego = agent.state.vermoegen - wealth_before[agent.unique_id]
    delta_u_sozial = (self.model.environment[agent.state.region]['quality'] - 
                     environment_before[agent.state.region])
    
    agent.learn(delta_u_ego=delta_u_ego, delta_u_sozial=delta_u_sozial,
               env_health=env_health, biome_capacity=biome_capacity,
               learning_params=self.model.simulation_parameters)
```

**Phase 7: Psychological States Update (lines 101-102)**
```python
for agent in self.model.agent_set:
    agent.update_psychological_states(self.model.simulation_parameters)
```

**Phase 8: Template Classification (line 105)**
```python
self._classify_agents_into_templates()
```

**Phase 9: Environment Feedback & Milieu Classification (lines 108-114)**
```python
self._update_environment_parameters()  # 9a
self._generate_gini_events()          # 9b  
self._classify_agents_into_milieus()  # 9c
```

### Environment Feedback Loop (lines 135-191)
```python
def _update_environment_parameters(self):
    # Aggregate investments and altruism per biome
    investments_per_biome = {b.name: 0.0 for b in self.model.biomes}
    altruism_per_biome = {b.name: [] for b in self.model.biomes}
    
    # Direct Impact: Economy -> Risk
    new_hazard_prob = (base_params.hazard_probability + 
                      (total_investment * base_params.environmental_sensitivity))
    self.model.effective_hazard_probabilities[biome.name] = np.clip(new_hazard_prob, 0, 1)
    
    # Indirect Impact: Altruism -> Resilience  
    resilience_mod = ((mean_altruism - 0.5) * 
                     self.model.simulation_parameters['resilience_bonus_factor'])
    new_regen_rate = base_params.regeneration_rate * (1 + resilience_mod)
    self.model.effective_regeneration_rates[biome.name] = max(0, new_regen_rate)
```

## 8. Utility Functions

### Distribution Generator (utils.py:5-29)
```python
def generate_attribute_value(config: DistributionConfig) -> float:
    if config.type == 'beta':
        return np.random.beta(config.alpha or 2.0, config.beta or 2.0)
    elif config.type == 'uniform_int':
        return random.randint(int(min_val), int(max_val))
    elif config.type == 'uniform_float':
        return np.random.uniform(min_val, max_val)
    elif config.type == 'normal':
        mean = config.mean if config.mean is not None else 0.5
        std_dev = config.std_dev if config.std_dev is not None else 0.15
        return np.clip(np.random.normal(mean, std_dev), min_val, max_val)
    elif config.type == 'lognormal':
        mean = config.mean if config.mean is not None else 10.0
        std_dev = config.std_dev if config.std_dev is not None else 0.5
        return np.random.lognormal(mean, std_dev)
    elif config.type == 'pareto':
        alpha = config.alpha if config.alpha is not None else 2.0
        return (np.random.pareto(alpha) + 1) * 10000  # Scaling for plausible values
```

### Gini Coefficient Calculation (model.py:22-38)
```python
def gini(x):
    if len(x) == 0:
        return 0
    x = np.array(x)
    x = x[x >= 0]  # Remove negative values
    if len(x) == 0 or np.sum(x) == 0:
        return 0
    x = np.sort(x)
    total = 0
    for i, xi in enumerate(x[:-1], 1):
        total += np.sum(np.abs(xi - x[i:]))
    return total / (len(x)**2 * np.mean(x))
```

## 9. Complete API Documentation

### FastAPI Server (main.py)

#### Simulation Management Endpoints

**GET /api/health** (line 58)
- Returns: `{"status": "ok"}`
- Purpose: System health check

**POST /api/simulation/reset** (lines 66-79)
- Request: `ResetPayload{num_agents: int, network_connections: int}`
- Returns: Initial simulation state
- Purpose: Reset simulation with configurable parameters
- Broadcasts initial state via WebSocket

**POST /api/simulation/step** (lines 81-88)
- Returns: `{"message": "Simulation advanced to step {step}."}`  
- Purpose: Advance simulation one step, broadcast new state
- Side effect: Executes complete 9-phase cycle

**GET /api/simulation/data** (lines 90-96)
- Returns: Current simulation state without advancing
- Purpose: Retrieve current state for dashboard updates

#### Configuration Management Endpoints

**GET /api/config** (lines 100-106)
- Returns: `FullConfig` object
- Purpose: Retrieve complete simulation configuration

**POST /api/config** (lines 108-115)  
- Request: `FullConfig` object
- Returns: `{"message": "Configuration saved successfully."}`
- Purpose: Save complete configuration with validation

**PATCH /api/config** (lines 117-137)
- Request: Partial configuration dict
- Returns: `{"message": "Configuration patched successfully."}`
- Purpose: Deep merge partial updates into existing configuration

#### Specialized Configuration Endpoints

**Media Sources** (lines 139-155):
- GET/POST /api/media_sources
- Manages ideological media landscape

**Initial Milieus** (lines 158-174):
- GET/POST /api/initial_milieus  
- Manages agent initialization presets

**Milieus** (lines 176-192):
- GET/POST /api/milieus
- Manages dynamic milieu classification centers

**Output Schablonen** (lines 194-210):
- GET/POST /api/output_schablonen
- Manages political template boundaries

#### Preset Management (lines 213-262)

**GET /api/presets/{section_name}** (lines 214-220)
- Returns: List of available preset names
- Purpose: List presets for configuration section

**GET /api/presets/{section_name}/{preset_name}** (lines 222-229)
- Returns: Preset configuration data
- Purpose: Load specific preset

**POST /api/presets/{section_name}/{preset_name}** (lines 231-245)
- Request: Any configuration data
- Returns: `{"message": "Preset saved."}`
- Purpose: Save/overwrite preset with validation

**DELETE /api/presets/{section_name}/{preset_name}** (lines 247-262)
- Returns: `{"message": "Preset deleted."}`
- Purpose: Delete specific preset file

#### WebSocket Real-time Communication (lines 265-273)

**WebSocket /ws**
- Bidirectional real-time communication
- Automatic ping every 5 seconds (lines 43-46)
- Broadcasts simulation state updates after each step
- Connection management via ConnectionManager

## 10. Frontend Integration

### WebSocket Protocol (connection_manager.py:4-19)
```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)
```

### Simulation Management (simulation_manager.py:4-43)
```python
class SimulationManager:
    def __init__(self):
        self.model: Optional[PoliticalModel] = None
        self.reset_model()  # Create initial model on startup
    
    def reset_model(self, num_agents: int = 100, network_connections: int = 5):
        self.model = PoliticalModel(num_agents=num_agents, 
                                   network_connections=network_connections)
    
    def step_model(self) -> Optional[Dict[str, Any]]:
        if self.model:
            self.model.step()
            return self.get_model_data()
        return None
    
    def get_model_data(self) -> Optional[Dict[str, Any]]:
        if self.model:
            return self.model.get_model_report()
        return None
```

### Data Output Structure (model.py:125-237)

The `get_model_report()` method returns comprehensive data including:

**Agent Reports**: Individual agent states with political positions, resources, psychological states
**Model Metrics**: Population averages, Gini coefficients, economic indicators  
**Biome Data**: Dynamic hazard probabilities, regeneration rates, investment totals
**Event Logs**: Hazard events, Gini threshold crossings, system events
**Spatial Data**: Agent positions, biome layouts, regional distributions
**Classifications**: Template distributions, milieu assignments, dynamic classifications

## 11. System Startup and Lifecycle

### Initialization Sequence (main.py:48-54)
```python
@app.on_event("startup")
async def startup_event():
    if simulation_manager and simulation_manager.model:
        print("SimulationManager is available to the application.")
    else:
        print("CRITICAL: SimulationManager failed to initialize.")
    asyncio.create_task(ping_clients())  # Start WebSocket ping task
```

### CORS Configuration (main.py:24-36)
```python
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
origins = [origin.strip() for origin in allowed_origins_str.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 12. Error Handling and Validation

All configuration endpoints use Pydantic model validation with comprehensive error handling:

```python
try:
    config_manager.save_config(config_data)
    return {"message": "Configuration saved successfully."}
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Error saving config: {e}")
```

The system provides:
- **Automatic Validation**: Pydantic models ensure type safety and constraints
- **Graceful Degradation**: Default configurations when files are missing
- **Comprehensive Error Messages**: Detailed error responses for debugging
- **State Consistency**: Atomic operations prevent partial state corruption

This documentation represents the complete, current implementation of the Digital Lab ABM system as of the latest refactor, extracted directly from the source code.