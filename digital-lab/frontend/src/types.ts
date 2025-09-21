// This file will hold all shared data structure types for the frontend.
export interface AgentVisual {
  id: number;
  position: [number, number]; // [x, y]
  position_history?: [number, number][]; // Historical positions for trajectory visualization
  political_position: { a: number; b: number }; // [a_i, b_i]
  region: string;
  initial_milieu?: string; // Initial milieu assignment
  milieu?: string; // Dynamic milieu assignment based on best fit
  schablone?: string; // Template assignment
  // Extended agent data for inspector
  alter?: number;
  einkommen?: number;
  vermoegen?: number;
  sozialleistungen?: number;
  risikoaversion?: number;
  effektive_kognitive_kapazitaet?: number;
  kognitive_kapazitaet_basis?: number;
  politische_wirksamkeit?: number;
  sozialkapital?: number;
  // Consumption data
  konsumquote?: number;
  ersparnis?: number;
}

export interface RegionEnvironment {
  quality: number;
  capacity: number;
}

export interface BiomeLayout {
  name: string;
  x_min: number;
  x_max: number;
}

export interface PopulationReport {
  milieu_distribution: Record<string, number>;
  schablonen_verteilung?: Record<string, number>; // NEW: Template distribution
  key_averages: {
    mean_wealth: number;
    mean_income: number;
    mean_altruism: number;
    mean_effective_cognition: number;
    mean_risk_aversion: number;
  };
}

export interface BiomeDynamicData {
  total_investment: number;
  effective_hazard_probability: number;
  effective_regeneration_rate: number;
}

export interface ModelReport {
  Mean_Freedom: number;
  Mean_Altruism: number;
  Polarization: number;
  Gini_Resources: number;
  Regions: Record<string, number>;
  environment: Record<string, RegionEnvironment>;
  layout?: BiomeLayout[];
  events?: string[];
  population_report?: PopulationReport;
  // NEW: Add the extended economic metrics from backend
  Durchschnittsvermoegen?: number;
  Durchschnittseinkommen?: number;
  Durchschnittlicher_Konsum?: number;
  Gini_Vermoegen?: number;
  Gini_Einkommen?: number;
  Hazard_Events_Count?: number;
  // NEW: Dynamic biome data for feedback visualization
  biomes_dynamic_data?: Record<string, BiomeDynamicData>;
  // NEW: Milieu configuration for visualization
  milieus_config?: MilieuConfig[];
}

export interface SimulationUpdatePayload {
  step: number;
  model_report: ModelReport;
  agent_visuals: AgentVisual[];
}

export interface DistributionConfig {
  type: 'beta' | 'uniform_int' | 'normal' | 'uniform_float' | 'lognormal' | 'pareto';
  alpha?: number;
  beta?: number;
  min?: number;
  max?: number;
  mean?: number;
  std_dev?: number;
}

export interface AgentInitializationConfig {
  [key: string]: DistributionConfig;
}


export interface BiomeConfig {
    name: string;
    population_percentage: number; // NEW: Percentage of total agents in this biome
    einkommen_verteilung: DistributionConfig;
    vermoegen_verteilung: DistributionConfig;
    sozialleistungs_niveau: number;
    hazard_probability: number;
    hazard_impact_factor: number;
    // NEUE FELDER
    // Ecological Parameters
    capacity: number;
    initial_quality: number;
    regeneration_rate: number;
    produktivitaets_faktor: number;
    // Behavioral Thresholds
    knappheits_schwelle: number;
    risiko_vermoegen_schwelle: number;
    // Agent-Environment Feedback
    environmental_sensitivity: number;
}

export interface LearningConfig {
    altruism_target_crisis: number;
    crisis_weighting_beta: number;
    max_learning_rate_eta_max: number;
    education_dampening_k: number;
}

export interface ExtractionConfig {
    max_factor: number;
    sustainable_factor: number;
}

export interface AgentDynamicsConfig {
    extraction: ExtractionConfig;
}

export interface GlobalModelParameters {
    // Investment parameters
    max_investment_rate: number;
    investment_return_factor: number;
    investment_success_probability: number;
    // Psychological Thresholds
    wealth_threshold_cognitive_stress: number;
    max_cognitive_penalty: number;
    wealth_sensitivity_factor: number;
    // Media Moderation
    cognitive_moderator_education_weight: number;
    cognitive_moderator_capacity_weight: number;
    // Agent Defaults
    default_risk_aversion: number;
    default_time_preference: number;
    default_political_efficacy: number;
    // Misc
    grid_size: number;
    gini_threshold_change: number;
    default_mean_altruism: number;
}

export interface FullConfig {
    biomes: BiomeConfig[];
    agent_dynamics: AgentDynamicsConfig;
    simulation_parameters: {
        environmental_capacity: number;
        media_influence_factor: number;
        resilience_bonus_factor: number;
        altruism_target_crisis: number;
        crisis_weighting_beta: number;
        max_learning_rate_eta_max: number;
        education_dampening_k: number;
        // Consumption parameters
        base_consumption_rate: number;
        zeitpraeferenz_sensitivity: number;
        risikoaversion_sensitivity: number;
        // Global model parameters (all 14 new parameters)
        max_investment_rate: number;
        investment_return_factor: number;
        investment_success_probability: number;
        wealth_threshold_cognitive_stress: number;
        max_cognitive_penalty: number;
        wealth_sensitivity_factor: number;
        cognitive_moderator_education_weight: number;
        cognitive_moderator_capacity_weight: number;
        default_risk_aversion: number;
        default_time_preference: number;
        default_political_efficacy: number;
        grid_size: number;
        gini_threshold_change: number;
        default_mean_altruism: number;
    };
}

export interface IdeologicalPosition {
    economic_axis: number; // -1 to 1
    social_axis: number;   // -1 to 1
}

export interface MediaSource {
    name: string;
    ideological_position: IdeologicalPosition;
}


// --- New Streamlined Milieu Configuration ---
export interface IdeologicalCenter {
    economic_axis: number;
    social_axis: number;
}

export interface MilieuAttributeDistributions {
    bildung: DistributionConfig;
    freedom_preference: DistributionConfig;
    altruism_factor: DistributionConfig;
    sozialkapital: DistributionConfig;
}

export interface MilieuConfig {
    name: string;
    proportion: number;
    color: string;
    ideological_center: IdeologicalCenter;
    attribute_distributions: MilieuAttributeDistributions;
}

// --- Initial Milieus Configuration (Legacy) ---
export interface InitialMilieu {
    name: string;
    proportion: number;
    color: string;
    attribute_distributions: Record<string, DistributionConfig>;
}

