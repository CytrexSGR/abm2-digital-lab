import dataclasses
from typing import Tuple, List

@dataclasses.dataclass(slots=True)
class AgentState:
    """
    Represents the complete state of a single "Minimum Viable Agent".
    Based on the final master plan for Epic 5.
    """
    # Demographics
    alter: int
    region: str # This will now be called "biome" in the config

    # Resources
    bildung: float
    einkommen: float
    vermoegen: float
    sozialleistungen: float # Received benefits

    # Cognition
    kognitive_kapazitaet_basis: float # Static base capacity
    effektive_kognitive_kapazitaet: float # Dynamic, affected by stress

    # Preferences / States
    freedom_preference: float
    altruism_factor: float
    risikoaversion: float
    zeitpraeferenzrate: float

    # Politics
    # political_position is now a method
    politische_wirksamkeit: float

    # Social
    sozialkapital: float # Initialized social capital

    # Geographic Position
    position: Tuple[float, float]
    position_history: List[Tuple[float, float]] = dataclasses.field(default_factory=list)
    
    # Initial Milieu (for tracking origin)
    initial_milieu: str = "Unknown"  # Assigned at initialization
    
    # Dynamic Milieu Assignment (best fit classification)
    milieu: str = "Unassigned"  # Dynamic classification based on closest ideological center
    
    # Template Classification
    schablone: str = "Unclassified"  # Dynamic classification based on political position
    
    # Consumption Tracking (for reporting)
    konsumquote: float = 0.0  # Current consumption rate
    ersparnis: float = 0.0    # Last step's savings

    def calculate_political_position(self) -> Tuple[float, float]:
        """
        Calculates the agent's political position based on new economic attributes.
        This is a revised formula for Epic 5.
        """
        # Economic Axis (a_i): Pro-Redistribution (-1) to Pro-Market (1)
        # Simplified: low wealth -> pro-redistribution, high wealth -> pro-market
        # We normalize vermoegen to a [-1, 1] range approximately for this calculation
        norm_vermoegen = (self.vermoegen / (self.vermoegen + 10000)) * 2 - 1 # Simple normalization
        a_i = norm_vermoegen - (self.altruism_factor * 0.5)

        # Political Axis (b_i): Authoritarian (-1) to Libertarian (1)
        b_i = (2.0 * self.freedom_preference) - 1.0

        # Clip values
        a_i = max(-1.0, min(1.0, a_i))
        b_i = max(-1.0, min(1.0, b_i))

        return a_i, b_i