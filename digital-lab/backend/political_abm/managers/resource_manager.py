import numpy as np
from ..utils import generate_attribute_value

class ResourceManager:
    """
    Manages the economic resources of agents, including income, wealth, and social benefits.
    """
    def __init__(self, model):
        self.model = model
        print("ResourceManager initialized.")
    
    def _handle_consumption_saving(self):
        """Calculates consumption/saving for each agent and updates wealth."""
        params = self.model.simulation_parameters
        savings_this_step = {}

        # Batch via registry if enabled and handle present
        use_batch = bool(getattr(self.model, 'formula_registry_enabled', False)) and bool(getattr(self.model, 'registry_handles', {}).get('consumption_rate'))
        if use_batch:
            try:
                from formula_registry import registry as formula_registry  # type: ignore
                handle = self.model.registry_handles.get('consumption_rate')
                # Build arrays
                zpref = np.array([a.state.zeitpraeferenzrate for a in self.model.agent_set], dtype=float)
                risk = np.array([a.state.risikoaversion for a in self.model.agent_set], dtype=float)
                incomes = np.array([a.state.einkommen for a in self.model.agent_set], dtype=float)
                inputs = {
                    'zeitpraeferenzrate': zpref,
                    'risikoaversion': risk,
                    'base_consumption_rate': float(params['base_consumption_rate']),
                    'zeitpraeferenz_sensitivity': float(params['zeitpraeferenz_sensitivity']),
                    'risikoaversion_sensitivity': float(params['risikoaversion_sensitivity']),
                }
                konsumquote_arr = formula_registry.evaluate_batch_handle(handle, inputs)
                konsumierter = incomes * konsumquote_arr
                ersparnis_arr = incomes - konsumierter
                # assign back
                for i, agent in enumerate(self.model.agent_set):
                    agent.state.vermoegen += float(ersparnis_arr[i])
                    agent.state.konsumquote = float(konsumquote_arr[i])
                    agent.state.ersparnis = float(ersparnis_arr[i])
                    savings_this_step[agent.unique_id] = float(ersparnis_arr[i])
                return savings_this_step
            except Exception:
                use_batch = False

        for agent in self.model.agent_set:
            quote = (params['base_consumption_rate'] +
                     (agent.state.zeitpraeferenzrate - 0.5) * params['zeitpraeferenz_sensitivity'] +
                     (agent.state.risikoaversion - 0.5) * params['risikoaversion_sensitivity'])
            konsumquote = np.clip(quote, 0.0, 1.0)
            konsumierter_betrag = agent.state.einkommen * konsumquote
            ersparnis = agent.state.einkommen - konsumierter_betrag
            agent.state.vermoegen += ersparnis
            agent.state.konsumquote = konsumquote
            agent.state.ersparnis = ersparnis
            savings_this_step[agent.unique_id] = ersparnis
        
        return savings_this_step

    def update_agent_resources(self):
        """Calculates and assigns income, updates wealth for all agents."""
        # --- Income Generation ---
        incomes = []
        for agent in self.model.agent_set:
            biome = next(b for b in self.model.biomes if b.name == agent.state.region)
            income = generate_attribute_value(biome.einkommen_verteilung)
            agent.state.einkommen = income
            incomes.append(income)
        
        # --- Social Benefits ---
        if not incomes: return {} # Guard clause - return empty savings
        
        median_income = np.median(incomes)
        for agent in self.model.agent_set:
            biome = next(b for b in self.model.biomes if b.name == agent.state.region)
            benefit = median_income * biome.sozialleistungs_niveau
            agent.state.sozialleistungen = benefit
            # Add benefit to income for this step
            agent.state.einkommen += benefit

        # NEU: Rufe die Konsum-Logik auf und gib die Ersparnisse zurück
        return self._handle_consumption_saving()
