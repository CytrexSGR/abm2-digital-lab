from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

# --- Pydantic Models for Validation ---

# --- Neue Pydantic Modelle ---
class DistributionConfig(BaseModel):
    type: Literal['beta', 'uniform_int', 'normal', 'uniform_float', 'lognormal', 'pareto']
    # Parameters for all distribution types are optional
    alpha: Optional[float] = None
    beta: Optional[float] = None
    min: Optional[float] = None # Can be float or int, Pydantic handles this
    max: Optional[float] = None
    mean: Optional[float] = None
    std_dev: Optional[float] = None

class BiomeConfig(BaseModel):
    name: str
    # Population Distribution
    population_percentage: float = Field(..., ge=0, le=100)  # Percentage of total agents
    # Economy
    einkommen_verteilung: DistributionConfig
    vermoegen_verteilung: DistributionConfig
    sozialleistungs_niveau: float
    # Hazards
    hazard_probability: float = Field(..., ge=0, le=1)
    hazard_impact_factor: float
    
    # NEUE FELDER
    # Ecological Parameters
    capacity: float
    initial_quality: float
    regeneration_rate: float
    produktivitaets_faktor: float # e.g., multiplier for income generation
    
    # Behavioral Thresholds
    knappheits_schwelle: float # e.g., wealth level that triggers scarcity effects
    risiko_vermoegen_schwelle: float # Corresponds to wealth_threshold in agent logic
    
    # NEW FIELD - Agent-Environment Feedback
    environmental_sensitivity: float # Multiplier for investment -> hazard link

class ExtractionConfig(BaseModel):
    max_factor: float
    sustainable_factor: float

class LearningConfig(BaseModel):
    altruism_target_crisis: float
    crisis_weighting_beta: float
    max_learning_rate_eta_max: float
    education_dampening_k: int

class AgentDynamicsConfig(BaseModel):
    extraction: ExtractionConfig

class SimulationParametersConfig(BaseModel):
    environmental_capacity: float
    media_influence_factor: float
    # NEW FIELD - Agent-Environment Feedback
    resilience_bonus_factor: float # Multiplier for altruism -> regeneration link
    # Learning parameters for integrated socio-ecological learning
    altruism_target_crisis: float
    crisis_weighting_beta: float
    max_learning_rate_eta_max: float
    education_dampening_k: float
    
    # NEUE FELDER - Consumption Parameters
    base_consumption_rate: float
    zeitpraeferenz_sensitivity: float
    risikoaversion_sensitivity: float
    
    # NEUE PARAMETER - Investment
    max_investment_rate: float
    investment_return_factor: float
    investment_success_probability: float
    
    # Psychological Thresholds
    wealth_threshold_cognitive_stress: float
    max_cognitive_penalty: float
    wealth_sensitivity_factor: float
    
    # Media Moderation
    cognitive_moderator_education_weight: float
    cognitive_moderator_capacity_weight: float
    
    # Agent Defaults
    default_risk_aversion: float
    default_time_preference: float
    default_political_efficacy: float
    
    # Misc
    grid_size: float
    gini_threshold_change: float
    default_mean_altruism: float

class AgentInitializationConfig(BaseModel):
    bildung: DistributionConfig
    alter: DistributionConfig
    kognitive_kapazitaet: DistributionConfig
    vertraeglichkeit: DistributionConfig
    freedom_preference: DistributionConfig
    altruism_factor: DistributionConfig

class IdeologicalPosition(BaseModel):
    economic_axis: float = Field(..., ge=-1, le=1)
    social_axis: float = Field(..., ge=-1, le=1)

class IdeologicalCenter(BaseModel):
    economic_axis: float = Field(..., ge=-1, le=1)
    social_axis: float = Field(..., ge=-1, le=1)

class MilieuAttributeDistributions(BaseModel):
    bildung: DistributionConfig
    freedom_preference: DistributionConfig
    altruism_factor: DistributionConfig
    sozialkapital: DistributionConfig

class MilieuConfig(BaseModel):
    name: str
    proportion: float = Field(..., gt=0, le=1)
    color: str
    ideological_center: IdeologicalCenter
    attribute_distributions: MilieuAttributeDistributions

class MediaSourceConfig(BaseModel):
    name: str
    ideological_position: IdeologicalPosition

# --- Initial Milieus Configuration ---
class InitialMilieuConfig(BaseModel):
    name: str
    proportion: float = Field(..., gt=0, le=1)  # Proportion of population (0-1)
    color: str = "#888"  # Color for visualization
    attribute_distributions: Dict[str, DistributionConfig]  # All agent attributes with their distributions

# --- Output Schablonen Configuration ---  
class OutputSchabloneConfig(BaseModel):
    name: str
    color: str = "#888"  # Color for visualization
    x_min: float = Field(..., ge=-1, le=1)  # Economic axis minimum
    x_max: float = Field(..., ge=-1, le=1)  # Economic axis maximum
    y_min: float = Field(..., ge=-1, le=1)  # Social axis minimum
    y_max: float = Field(..., ge=-1, le=1)  # Social axis maximum

class FullConfig(BaseModel):
    biomes: List[BiomeConfig]
    agent_dynamics: AgentDynamicsConfig
    simulation_parameters: SimulationParametersConfig
    agent_initialization: AgentInitializationConfig