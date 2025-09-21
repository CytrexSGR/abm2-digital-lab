import random
import numpy as np
import networkx as nx
from .agents import PoliticalAgent
from .utils import generate_attribute_value
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from backend.config.models import DistributionConfig


class AgentInitializer:
    """
    Handles the complex three-stage agent initialization process:
    1. Ideology & Social Attributes from Milieu
    2. Economy & Base Cognition from Biome  
    3. Derived Psychological Attributes calculation
    """
    
    def __init__(self, model):
        self.model = model

    def create_agents(self):
        """
        Creates and returns a list of fully initialized PoliticalAgent instances.
        Implements the 3-step causal logic from the original PoliticalModel.
        """
        agents = []
        
        # Create social network
        # Ensure m < n for barabasi_albert_graph
        network_connections = min(5, max(1, self.model.num_agents - 1))
        self.model.G = nx.barabasi_albert_graph(self.model.num_agents, network_connections)
        
        # --- Agent Creation Loop (3-Step Causal Logic) ---
        for i in range(self.model.num_agents):
            agent_state_args = {}

            # --- Step 1: Ideology & Social Attributes from Milieu ---
            assigned_milieu = random.choices(
                self.model.milieus, 
                weights=[m.proportion for m in self.model.milieus], 
                k=1
            )[0]
            agent_state_args['initial_milieu'] = assigned_milieu.name
            
            for attr, dist in assigned_milieu.attribute_distributions.__dict__.items():
                agent_state_args[attr] = generate_attribute_value(dist)

            # --- Step 2: Economy & Base Cognition from Biome ---
            assigned_biome = random.choice(self.model.biomes)
            agent_state_args['region'] = assigned_biome.name
            
            agent_state_args['einkommen'] = generate_attribute_value(
                assigned_biome.einkommen_verteilung
            )
            agent_state_args['vermoegen'] = generate_attribute_value(
                assigned_biome.vermoegen_verteilung
            )
            # Base cognitive capacity influenced by biome
            agent_state_args['kognitive_kapazitaet_basis'] = generate_attribute_value(
                DistributionConfig(type='normal', mean=0.5, std_dev=0.15)
            )

            # --- Step 3: Calculate Derived Psychological Attributes ---
            agent_state_args = self._calculate_derived_attributes(
                agent_state_args, 
                self.model.global_model_parameters
            )

            # --- Final Assembly ---
            # Position assignment within the biome
            biome_layout = next(
                l for l in self.model.layout 
                if l['name'] == assigned_biome.name
            )
            pos_x = random.uniform(biome_layout['x_min'], biome_layout['x_max'])
            pos_y = random.uniform(0, 100)
            agent_state_args['position'] = (pos_x, pos_y)
            
            # Initialize additional state variables
            agent_state_args['sozialleistungen'] = 0.0
            agent_state_args['konsumquote'] = 0.0
            agent_state_args['ersparnis'] = 0.0
            agent_state_args['schablone'] = 'Unclassified'
            agent_state_args['milieu'] = 'Unassigned'  # Set by dynamic classification
            
            # Add age attribute if missing
            if 'alter' not in agent_state_args:
                agent_state_args['alter'] = random.randint(18, 65)
            
            # Create agent with the final state
            agent = PoliticalAgent(i, self.model, **agent_state_args)
            agents.append(agent)

        return agents

    def _calculate_derived_attributes(self, agent_state_args: dict, params: dict) -> dict:
        """
        Calculates derived attributes based on already generated base attributes.
        This implements the economic-psychological coupling logic.
        """
        # Risikoaversion = f(vermoegen)
        vermoegen = agent_state_args['vermoegen']
        wealth_sensitivity = params['wealth_sensitivity_factor']
        agent_state_args['risikoaversion'] = 1 / (1 + (vermoegen / wealth_sensitivity))
        
        # Zeitpraeferenzrate = f(kognitive_kapazitaet) - inverse relationship
        kogn_kap_basis = agent_state_args['kognitive_kapazitaet_basis']
        agent_state_args['zeitpraeferenzrate'] = np.clip(1 - kogn_kap_basis, 0.1, 0.9)

        # Politische Wirksamkeit = f(bildung, einkommen)
        bildung = agent_state_args['bildung']
        einkommen = agent_state_args['einkommen']
        income_norm = einkommen / (einkommen + 50000)  # Simple normalization
        agent_state_args['politische_wirksamkeit'] = np.clip(
            bildung * 0.6 + income_norm * 0.4, 0.1, 0.9
        )
        
        # Effektive kognitive Kapazität initially equals basis
        agent_state_args['effektive_kognitive_kapazitaet'] = kogn_kap_basis
        
        return agent_state_args