import numpy as np
import random
from backend.config.models import DistributionConfig

def generate_attribute_value(config: DistributionConfig) -> float:
    """Generates a single attribute value based on the distribution config."""
    min_val = config.min if config.min is not None else 0.0
    max_val = config.max if config.max is not None else 1.0
    
    if config.type == 'beta':
        return np.random.beta(config.alpha or 2.0, config.beta or 2.0)
    elif config.type == 'uniform_int':
        return random.randint(int(min_val), int(max_val))
    elif config.type == 'uniform_float':
        return np.random.uniform(min_val, max_val)
    elif config.type == 'normal':
        mean = config.mean if config.mean is not None else 0.5
        std_dev = config.std_dev if config.std_dev is not None else 0.15
        return np.clip(np.random.normal(mean, std_dev), min_val, max_val)
    # NEUE VERTEILUNGEN
    elif config.type == 'lognormal':
        mean = config.mean if config.mean is not None else 10.0
        std_dev = config.std_dev if config.std_dev is not None else 0.5
        return np.random.lognormal(mean, std_dev)
    elif config.type == 'pareto':
        alpha = config.alpha if config.alpha is not None else 2.0
        return (np.random.pareto(alpha) + 1) * 10000 # Skalierung für plausiblen Startwert
    
    return np.random.random()