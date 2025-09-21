import random

class HazardManager:
    """
    Manages the occurrence of random hazard events that can impact agents.
    """
    def __init__(self, model):
        self.model = model
        self.events_this_step = [] # Optional: for logging/reporting
        print("HazardManager initialized.")

    def trigger_events(self):
        """
        Iterates through all agents and applies hazard shocks based on biome probabilities.
        """
        self.events_this_step.clear()

        for agent in self.model.agent_set:
            biome = next(b for b in self.model.biomes if b.name == agent.state.region)
            
            # VERWENDE DEN EFFEKTIVEN WERT
            hazard_prob = self.model.effective_hazard_probabilities[agent.state.region]
            
            # Check if a hazard event occurs for this agent
            if random.random() < hazard_prob:
                
                # Apply the economic shock
                impact_factor = biome.hazard_impact_factor
                
                wealth_loss = agent.state.vermoegen * impact_factor
                income_loss = agent.state.einkommen * impact_factor # Assuming shock affects current income too
                
                agent.state.vermoegen -= wealth_loss
                agent.state.einkommen -= income_loss
                
                # Ensure wealth doesn't go negative
                agent.state.vermoegen = max(0.0, agent.state.vermoegen)
                agent.state.einkommen = max(0.0, agent.state.einkommen)
                
                # Log the event for reporting
                self.events_this_step.append({
                    "agent_id": agent.unique_id,
                    "biome": biome.name,
                    "wealth_loss": wealth_loss,
                    "income_loss": income_loss
                })

                # Optional: Print to console for real-time debugging
                # print(f"Hazard Event triggered for Agent {agent.unique_id} in {biome.name}! Wealth loss: {wealth_loss:.2f}")