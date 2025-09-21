from typing import Optional, Dict, Any
from political_abm.model import PoliticalModel

class SimulationManager:
    """
    A singleton class to manage the lifecycle of the PoliticalModel instance,
    acting as the primary interface for the API.
    """
    def __init__(self):
        print("Initializing SimulationManager...")
        self.model: Optional[PoliticalModel] = None
        self.reset_model() # Create an initial model on startup

    def reset_model(self, num_agents: int = 100, network_connections: int = 5):
        """Creates a new instance of the simulation model."""
        print(f"Resetting model with {num_agents} agents...")
        try:
            self.model = PoliticalModel(
                num_agents=num_agents, 
                network_connections=network_connections
            )
            print("New PoliticalModel instance created successfully.")
        except Exception as e:
            print(f"Error creating PoliticalModel instance: {e}")
            self.model = None

    def step_model(self) -> Optional[Dict[str, Any]]:
        """Advances the model by one step and returns the latest data."""
        if self.model:
            self.model.step()
            return self.get_model_data()
        print("Cannot step model: instance is not available.")
        return None

    def get_model_data(self) -> Optional[Dict[str, Any]]:
        """Retrieves the full data report from the current model state."""
        if self.model:
            return self.model.get_model_report()
        print("Cannot get model data: instance is not available.")
        return None

# Create a single, globally accessible instance of the manager.
manager = SimulationManager()