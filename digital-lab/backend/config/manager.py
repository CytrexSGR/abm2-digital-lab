from typing import List, Dict, Any
import yaml
from pathlib import Path

# Import models from the models module
from .models import (
    FullConfig, MediaSourceConfig, InitialMilieuConfig, 
    OutputSchabloneConfig, MilieuConfig, IdeologicalCenter,
    MilieuAttributeDistributions, DistributionConfig
)

CONFIG_PATH = Path(__file__).parent.parent / "political_abm" / "config.yml"
MEDIA_SOURCES_PATH = Path(__file__).parent.parent / "political_abm" / "media_sources.yml"
INITIAL_MILIEUS_PATH = Path(__file__).parent.parent / "political_abm" / "initial_milieus.yml"
MILIEUS_PATH = Path(__file__).parent.parent / "political_abm" / "milieus.yml"
OUTPUT_SCHABLONEN_PATH = Path(__file__).parent.parent / "political_abm" / "output_schablonen.yml"

# --- ConfigManager Class ---

class ConfigManager:
    def __init__(self, path: Path = CONFIG_PATH):
        self.path = path

    def get_config(self) -> FullConfig:
        """Reads, validates, and returns the current config."""
        with open(self.path, 'r') as f:
            raw_config = yaml.safe_load(f)
        return FullConfig(**raw_config)

    def save_config(self, config_data: FullConfig):
        """Validates and saves the config data to the YAML file."""
        with open(self.path, 'w') as f:
            # Pydantic's model_dump is preferred for serialization
            yaml.dump(config_data.model_dump(), f, indent=2)

    def get_media_sources(self) -> List[MediaSourceConfig]:
        """Reads, validates, and returns the current media sources config."""
        with open(MEDIA_SOURCES_PATH, 'r') as f:
            raw_sources = yaml.safe_load(f)
        return [MediaSourceConfig(**s) for s in raw_sources]

    def save_media_sources(self, sources_data: List[Dict[str, Any]]):
        """Validates and saves the media sources data to the YAML file."""
        validated_sources = [MediaSourceConfig(**s).model_dump() for s in sources_data]
        with open(MEDIA_SOURCES_PATH, 'w') as f:
            yaml.dump(validated_sources, f, indent=2)



    def get_initial_milieus(self) -> List[InitialMilieuConfig]:
        """Reads, validates, and returns the current initial milieus config."""
        try:
            with open(INITIAL_MILIEUS_PATH, 'r') as f:
                raw_milieus = yaml.safe_load(f)
            if raw_milieus is None:
                return []
            return [InitialMilieuConfig(**m) for m in raw_milieus]
        except FileNotFoundError:
            # Return default initial milieus if file doesn't exist
            return [
                InitialMilieuConfig(
                    name="Urban Professionals",
                    proportion=0.3,
                    attribute_distributions={
                        "bildung": {"type": "beta", "alpha": 3.0, "beta": 2.0},
                        "alter": {"type": "uniform_int", "min": 25, "max": 45},
                        "kognitive_kapazitaet": {"type": "beta", "alpha": 4.0, "beta": 3.0},
                        "vertraeglichkeit": {"type": "beta", "alpha": 3.0, "beta": 3.0},
                        "freedom_preference": {"type": "beta", "alpha": 4.0, "beta": 2.0},
                        "altruism_factor": {"type": "beta", "alpha": 3.0, "beta": 3.0}
                    }
                ),
                InitialMilieuConfig(
                    name="Conservative Traditionalists",
                    proportion=0.4,
                    attribute_distributions={
                        "bildung": {"type": "beta", "alpha": 2.0, "beta": 3.0},
                        "alter": {"type": "uniform_int", "min": 35, "max": 65},
                        "kognitive_kapazitaet": {"type": "beta", "alpha": 3.0, "beta": 3.0},
                        "vertraeglichkeit": {"type": "beta", "alpha": 4.0, "beta": 2.0},
                        "freedom_preference": {"type": "beta", "alpha": 2.0, "beta": 4.0},
                        "altruism_factor": {"type": "beta", "alpha": 2.0, "beta": 3.0}
                    }
                ),
                InitialMilieuConfig(
                    name="Progressive Youth",
                    proportion=0.3,
                    attribute_distributions={
                        "bildung": {"type": "beta", "alpha": 3.0, "beta": 2.5},
                        "alter": {"type": "uniform_int", "min": 18, "max": 35},
                        "kognitive_kapazitaet": {"type": "beta", "alpha": 3.5, "beta": 2.0},
                        "vertraeglichkeit": {"type": "beta", "alpha": 3.5, "beta": 2.5},
                        "freedom_preference": {"type": "beta", "alpha": 4.5, "beta": 1.5},
                        "altruism_factor": {"type": "beta", "alpha": 4.0, "beta": 2.0}
                    }
                )
            ]

    def save_initial_milieus(self, milieus_data: List[Dict[str, Any]]):
        """Validates and saves the initial milieus data to the YAML file."""
        validated_milieus = [InitialMilieuConfig(**m).model_dump() for m in milieus_data]
        with open(INITIAL_MILIEUS_PATH, 'w') as f:
            yaml.dump(validated_milieus, f, indent=2)

    def get_output_schablonen(self) -> List[OutputSchabloneConfig]:
        """Reads, validates, and returns the current output schablonen config."""
        try:
            with open(OUTPUT_SCHABLONEN_PATH, 'r') as f:
                raw_schablonen = yaml.safe_load(f)
            if raw_schablonen is None:
                return []
            return [OutputSchabloneConfig(**s) for s in raw_schablonen]
        except FileNotFoundError:
            # Return default output schablonen if file doesn't exist
            return [
                OutputSchabloneConfig(name="Left-Wing", color="#ff6b6b", x_min=-1.0, x_max=-0.3, y_min=-1.0, y_max=1.0),
                OutputSchabloneConfig(name="Right-Wing", color="#4dabf7", x_min=0.3, x_max=1.0, y_min=-1.0, y_max=1.0),
                OutputSchabloneConfig(name="Libertarian", color="#51cf66", x_min=-1.0, x_max=1.0, y_min=0.3, y_max=1.0),
                OutputSchabloneConfig(name="Authoritarian", color="#ffa502", x_min=-1.0, x_max=1.0, y_min=-1.0, y_max=-0.3),
                OutputSchabloneConfig(name="Centrist", color="#a29bfe", x_min=-0.3, x_max=0.3, y_min=-0.3, y_max=0.3),
            ]

    def save_output_schablonen(self, schablonen_data: List[Dict[str, Any]]):
        """Validates and saves the output schablonen data to the YAML file."""
        validated_schablonen = [OutputSchabloneConfig(**s).model_dump() for s in schablonen_data]
        with open(OUTPUT_SCHABLONEN_PATH, 'w') as f:
            yaml.dump(validated_schablonen, f, indent=2)

    def get_milieus(self) -> List[MilieuConfig]:
        """Reads, validates, and returns the current milieus config."""
        try:
            with open(MILIEUS_PATH, 'r') as f:
                raw_milieus = yaml.safe_load(f)
            if raw_milieus is None:
                return []
            return [MilieuConfig(**m) for m in raw_milieus]
        except FileNotFoundError:
            # Return default milieus if file doesn't exist
            return [
                MilieuConfig(
                    name="Links-Liberal",
                    proportion=0.3,
                    color="#3498db",
                    ideological_center=IdeologicalCenter(economic_axis=-0.6, social_axis=0.6),
                    attribute_distributions=MilieuAttributeDistributions(
                        bildung=DistributionConfig(type='beta', alpha=7, beta=3),
                        freedom_preference=DistributionConfig(type='beta', alpha=7, beta=3),
                        altruism_factor=DistributionConfig(type='beta', alpha=7, beta=3),
                        sozialkapital=DistributionConfig(type='normal', mean=0.7, std_dev=0.1)
                    )
                ),
                MilieuConfig(
                    name="Rechts-Konservativ",
                    proportion=0.4,
                    color="#e74c3c",
                    ideological_center=IdeologicalCenter(economic_axis=0.6, social_axis=-0.6),
                    attribute_distributions=MilieuAttributeDistributions(
                        bildung=DistributionConfig(type='beta', alpha=3, beta=7),
                        freedom_preference=DistributionConfig(type='beta', alpha=3, beta=7),
                        altruism_factor=DistributionConfig(type='beta', alpha=3, beta=7),
                        sozialkapital=DistributionConfig(type='normal', mean=0.5, std_dev=0.1)
                    )
                ),
                MilieuConfig(
                    name="Zentrist",
                    proportion=0.3,
                    color="#95a5a6",
                    ideological_center=IdeologicalCenter(economic_axis=0.0, social_axis=0.0),
                    attribute_distributions=MilieuAttributeDistributions(
                        bildung=DistributionConfig(type='beta', alpha=5, beta=5),
                        freedom_preference=DistributionConfig(type='beta', alpha=5, beta=5),
                        altruism_factor=DistributionConfig(type='beta', alpha=5, beta=5),
                        sozialkapital=DistributionConfig(type='normal', mean=0.6, std_dev=0.1)
                    )
                )
            ]

    def save_milieus(self, milieus_data: List[Dict[str, Any]]):
        """Validates and saves the milieus data to the YAML file."""
        validated_milieus = [MilieuConfig(**m).model_dump() for m in milieus_data]
        with open(MILIEUS_PATH, 'w') as f:
            yaml.dump(validated_milieus, f, indent=2)


manager = ConfigManager()