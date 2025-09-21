import numpy as np
import random
from ..types import AgentState
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
from backend.config.models import MediaSourceConfig


class MediaManager:
    """
    Manages media sources and agent exposure to media.
    """
    
    def __init__(self, model, media_sources: list[MediaSourceConfig]):
        self.model = model
        self.media_sources = media_sources
        print(f"MediaManager initialized with {len(media_sources)} sources.")
    
    def select_source_for_agent(self, agent_state: AgentState) -> MediaSourceConfig:
        """
        Selects a media source for an agent based on ideological proximity.
        Agents are more likely to choose sources closer to their own views.
        """
        if not self.media_sources:
            raise ValueError("No media sources configured.")

        agent_pos = agent_state.calculate_political_position()
        
        distances = []
        for source in self.media_sources:
            source_pos = (
                source.ideological_position.economic_axis,
                source.ideological_position.social_axis
            )
            # Calculate Euclidean distance in the 2D political space
            dist = np.linalg.norm(np.array(agent_pos) - np.array(source_pos))
            distances.append(dist)
        
        # Convert distances to probabilities (closer distance = higher probability)
        # We use an inverse weighting scheme. Adding a small epsilon to avoid division by zero.
        weights = [1 / (d + 0.1) for d in distances]
        
        # Normalize weights to sum to 1
        total_weight = sum(weights)
        probabilities = [w / total_weight for w in weights]
        
        # Select one source based on the calculated probabilities
        selected_source = random.choices(self.media_sources, weights=probabilities, k=1)[0]
        
        return selected_source