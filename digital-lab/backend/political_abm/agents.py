import mesa
import random
import numpy as np
from .types import AgentState
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from backend.config.models import MediaSourceConfig

class PoliticalAgent(mesa.Agent):
    """
    An agent with political beliefs, economic status, and learning capabilities.
    Implementation is based on MODEL_SPECIFICATION.md v3.0.0.
    """
    def __init__(self, unique_id, model, **kwargs):
        # Mesa 3.2.0+ - manual initialization without super() to avoid conflicts
        self.unique_id = unique_id
        self.model = model
        # The agent's entire state is encapsulated in the AgentState dataclass
        self.state = AgentState(**kwargs)

    def decide_and_act(self, ersparnis: float, params: dict) -> dict:
        """
        Agent makes a socio-economic decision: how much savings to invest.
        This decision is influenced by risk aversion and time preference.
        Returns a dictionary with the investment amount and its outcome.
        """
        # --- Investment Decision ---
        # Schritt C: Passe die Investment-Logik an
        potential_investment_rate = params['max_investment_rate']
        potential_investment = ersparnis * potential_investment_rate
        
        # Risk aversion directly reduces the willingness to invest
        risk_adjusted_investment = potential_investment * (1 - self.state.risikoaversion)
        
        # Time preference also reduces investment (preference for immediate consumption)
        final_investment = risk_adjusted_investment * (1 - self.state.zeitpraeferenzrate)
        
        # --- Investment Outcome ---
        # Simple high-risk, high-return model
        investment_return_factor = params['investment_return_factor']
        success_probability = params['investment_success_probability']
        
        investment_gain = 0
        if random.random() < success_probability:
            # Successful investment
            investment_gain = final_investment * investment_return_factor
        else:
            # Failed investment - total loss
            investment_gain = -final_investment
            
        # Update agent's wealth directly based on the outcome
        self.state.vermoegen += investment_gain
        
        return {
            "investment_made": final_investment,
            "investment_gain": investment_gain
        }

    def learn(self, delta_u_ego: float, delta_u_sozial: float, env_health: float, biome_capacity: float, learning_params: dict):
        """
        Updates agent's altruism based on an integrated socio-ecological signal.
        This is the final, specification-compliant implementation.
        """
        # --- Schritt A: Inputs ---
        # delta_u_ego: Agent's own wealth change
        # delta_u_sozial: Agent's biome's environmental quality change
        
        # Pilot-Integration: Formel über Registry, falls aktiviert und gepinnt, sonst Fallback
        use_registry = bool(getattr(self.model, 'formula_registry_enabled', False))
        pinned = getattr(self.model, 'formula_pins', {}) if hasattr(self.model, 'formula_pins') else {}

        if use_registry and pinned.get('altruism_update'):
            # Prepare inputs for registry evaluation
            try:
                from formula_registry import registry as formula_registry  # sys.path adjusted in callers
            except Exception:
                formula_registry = None
                use_registry = False

        if use_registry and pinned.get('altruism_update') and formula_registry:
            inputs = {
                'prev_altruism': float(self.state.altruism_factor),
                'bildung': float(self.state.bildung),
                'delta_u_ego': float(delta_u_ego),
                'delta_u_sozial': float(delta_u_sozial),
                'env_health': float(env_health),
                'biome_capacity': float(biome_capacity),
                # Learning params (flattened)
                'altruism_target_crisis': float(learning_params.get('altruism_target_crisis', 0.7)),
                'crisis_weighting_beta': float(learning_params.get('crisis_weighting_beta', 0.5)),
                'max_learning_rate_eta_max': float(learning_params.get('max_learning_rate_eta_max', 0.2)),
                'education_dampening_k': float(learning_params.get('education_dampening_k', 1.0)),
            }
            try:
                new_val = float(formula_registry.evaluate('altruism_update', inputs))
                self.state.altruism_factor = float(np.clip(new_val, 0.0, 1.0))
                return
            except Exception:
                # Fallback to built-in if registry evaluation fails
                pass

        # --- Fallback: lokale Formel ---
        delta_trad = delta_u_sozial - delta_u_ego
        s_env = (learning_params['altruism_target_crisis'] - self.state.altruism_factor) * (1 - env_health / biome_capacity)
        L_signal = delta_trad + learning_params['crisis_weighting_beta'] * s_env
        eta = learning_params['max_learning_rate_eta_max'] / (1.0 + learning_params['education_dampening_k'] * self.state.bildung)
        adjustment = eta * L_signal
        self.state.altruism_factor = np.clip(self.state.altruism_factor + adjustment, 0.0, 1.0)

    def learn_from_media(self, source: MediaSourceConfig, influence_factor: float, params: dict):
        """
        Adjusts agent's preferences towards the ideological position of the consumed media source.
        """
        # --- Calculate Learning Rate ---
        # Moderated by education and effective cognitive capacity
        # Higher cognition/education -> less susceptible to influence
        education_weight = params['cognitive_moderator_education_weight']
        capacity_weight = params['cognitive_moderator_capacity_weight']
        cognitive_moderator = 1 - (self.state.bildung * education_weight + self.state.effektive_kognitive_kapazitaet * capacity_weight)
        base_learning_rate = influence_factor * cognitive_moderator
        
        # --- Calculate ideological targets from source ---
        # We need to reverse-engineer the preferences from the source's position
        target_freedom_preference = (source.ideological_position.social_axis + 1) / 2.0 

        # --- Update freedom_preference ---
        current_pref = self.state.freedom_preference
        adjustment = (target_freedom_preference - current_pref) * base_learning_rate
        self.state.freedom_preference = np.clip(current_pref + adjustment, 0.0, 1.0)

        # --- Altruism learning removed ---
        # Altruism learning is now exclusively handled by the integrated socio-ecological learning model

    def update_psychological_states(self, params: dict):
        """
        Updates dynamic psychological states based on the agent's current resources.
        This implements the core resource-behavior coupling.
        """
        # --- 1. Update effektive_kognitive_kapazitaet based on wealth ---
        # "Poverty penalty": Below a certain wealth threshold, cognitive capacity decreases.
        # We define a simple linear penalty.
        wealth_threshold = params['wealth_threshold_cognitive_stress']
        max_penalty = params['max_cognitive_penalty']
        
        if self.state.vermoegen < wealth_threshold:
            penalty_factor = (wealth_threshold - self.state.vermoegen) / wealth_threshold
            penalty = max_penalty * penalty_factor
            self.state.effektive_kognitive_kapazitaet = self.state.kognitive_kapazitaet_basis * (1 - penalty)
        else:
            self.state.effektive_kognitive_kapazitaet = self.state.kognitive_kapazitaet_basis
        
        # Ensure it's clipped between 0 and 1
        self.state.effektive_kognitive_kapazitaet = max(0.0, min(1.0, self.state.effektive_kognitive_kapazitaet))

        # --- 2. Update risikoaversion based on wealth ---
        # Lower wealth leads to higher risk aversion (prospect theory simplification).
        # We use an inverse relationship.
        wealth_sensitivity_factor = params['wealth_sensitivity_factor']
        
        # Inverse relationship: as vermoegen -> 0, aversion -> 1. as vermoegen -> inf, aversion -> 0
        self.state.risikoaversion = 1 / (1 + (self.state.vermoegen / wealth_sensitivity_factor))
        
        # Ensure it's clipped between 0 and 1
        self.state.risikoaversion = max(0.0, min(1.0, self.state.risikoaversion))

    def step(self):
        """
        The step method is intentionally left empty.
        The model's 7-phase step() orchestrates calls to decide_and_act(), learn(), and update_psychological_states() directly.
        """
        pass
