from typing import Optional, Dict, Any, List
from political_abm.model import PoliticalModel
import numpy as np
from collections import Counter

class SimulationManager:
    """
    A singleton class to manage the lifecycle of the PoliticalModel instance,
    acting as the primary interface for the API.
    """
    def __init__(self):
        print("Initializing SimulationManager...")
        self.model: Optional[PoliticalModel] = None
        self.history: List[Dict[str, Any]] = []  # Time series history
        self.max_history: int = 1000  # Maximum snapshots to keep
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

            # Clear history and store initial state
            self.history = []
            initial_data = self.get_model_data()
            if initial_data:
                self.history.append(initial_data)

        except Exception as e:
            print(f"Error creating PoliticalModel instance: {e}")
            self.model = None

    def step_model(self) -> Optional[Dict[str, Any]]:
        """Advances the model by one step and returns the latest data."""
        if self.model:
            self.model.step()
            data = self.get_model_data()

            # Store in history
            if data:
                self.history.append(data)
                # Limit history size
                if len(self.history) > self.max_history:
                    self.history.pop(0)

            return data
        print("Cannot step model: instance is not available.")
        return None

    def get_model_data(self) -> Optional[Dict[str, Any]]:
        """Retrieves the full data report from the current model state."""
        if self.model:
            return self.model.get_model_report()
        print("Cannot get model data: instance is not available.")
        return None

    def query_agents(self, filters: Optional[Dict] = None, fields: Optional[List[str]] = None,
                    limit: int = 100, aggregations: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
        """Query agents with filtering and aggregation.

        Args:
            filters: Dictionary of filter conditions. Examples:
                - Range: {"vermoegen": {"min": 50000, "max": 100000}}
                - List: {"milieu": ["Links-Liberal", "Rechts-Konservativ"]}
                - Exact: {"region": "Prosperous Metropolis"}
            fields: List of agent attributes to return (None = default fields)
            limit: Maximum number of agents to return
            aggregations: List of aggregations to compute. Examples:
                - "count"
                - "mean_vermoegen"
                - "distribution_milieu"

        Returns:
            Dictionary with 'count', 'agents', and 'aggregations' keys
        """
        if not self.model:
            print("Cannot query agents: model instance is not available.")
            return None

        # Get all agents
        agents = list(self.model.agent_set)

        # Apply filters
        if filters:
            agents = self._apply_filters(agents, filters)

        # Store total count before limiting
        total_count = len(agents)

        # Limit results
        agents = agents[:limit]

        # Extract fields
        results = []
        for agent in agents:
            if fields:
                agent_data = {}
                for field in fields:
                    # Handle nested attributes
                    if hasattr(agent.state, field):
                        value = getattr(agent.state, field)
                        # Convert numpy types to Python types for JSON serialization
                        if isinstance(value, (np.integer, np.floating)):
                            value = value.item()
                        agent_data[field] = value
                    else:
                        agent_data[field] = None
            else:
                # Default fields
                political_pos = agent.state.calculate_political_position()
                agent_data = {
                    'id': agent.unique_id,
                    'vermoegen': float(agent.state.vermoegen),
                    'einkommen': float(agent.state.einkommen),
                    'region': agent.state.region,
                    'milieu': agent.state.milieu,
                    'political_position': [float(political_pos[0]), float(political_pos[1])]
                }
            results.append(agent_data)

        # Calculate aggregations
        agg_results = {}
        if aggregations:
            # Use full filtered set for aggregations (before limit)
            all_filtered = list(self.model.agent_set)
            if filters:
                all_filtered = self._apply_filters(all_filtered, filters)
            agg_results = self._calculate_aggregations(all_filtered, aggregations)

        return {
            'count': total_count,
            'returned': len(results),
            'agents': results,
            'aggregations': agg_results
        }

    def _apply_filters(self, agents: List, filters: Dict) -> List:
        """Apply filters to agent list."""
        filtered = agents

        for field, condition in filters.items():
            if isinstance(condition, dict):
                # Range filter: {"min": 50000, "max": 100000}
                if 'min' in condition:
                    filtered = [a for a in filtered
                              if self._get_agent_value(a, field) >= condition['min']]
                if 'max' in condition:
                    filtered = [a for a in filtered
                              if self._get_agent_value(a, field) <= condition['max']]
            elif isinstance(condition, list):
                # In-list filter: ["Rechts-Konservativ", "Links-Liberal"]
                filtered = [a for a in filtered
                          if self._get_agent_value(a, field) in condition]
            else:
                # Exact match
                filtered = [a for a in filtered
                          if self._get_agent_value(a, field) == condition]

        return filtered

    def _get_agent_value(self, agent, field: str):
        """Get value from agent, handling nested attributes."""
        if hasattr(agent.state, field):
            value = getattr(agent.state, field)
            # Convert numpy types
            if isinstance(value, (np.integer, np.floating)):
                return value.item()
            return value
        return None

    def _calculate_aggregations(self, agents: List, aggregations: List[str]) -> Dict:
        """Calculate aggregations over filtered agents."""
        results = {}

        for agg in aggregations:
            if agg == 'count':
                results['count'] = len(agents)
            elif agg.startswith('mean_'):
                field = agg[5:]  # Remove 'mean_' prefix
                values = [self._get_agent_value(a, field) for a in agents]
                # Filter out None values
                values = [v for v in values if v is not None]
                results[agg] = float(np.mean(values)) if values else 0.0
            elif agg.startswith('sum_'):
                field = agg[4:]  # Remove 'sum_' prefix
                values = [self._get_agent_value(a, field) for a in agents]
                values = [v for v in values if v is not None]
                results[agg] = float(np.sum(values)) if values else 0.0
            elif agg.startswith('std_'):
                field = agg[4:]  # Remove 'std_' prefix
                values = [self._get_agent_value(a, field) for a in agents]
                values = [v for v in values if v is not None]
                results[agg] = float(np.std(values)) if values else 0.0
            elif agg.startswith('min_'):
                field = agg[4:]  # Remove 'min_' prefix
                values = [self._get_agent_value(a, field) for a in agents]
                values = [v for v in values if v is not None]
                results[agg] = float(np.min(values)) if values else 0.0
            elif agg.startswith('max_'):
                field = agg[4:]  # Remove 'max_' prefix
                values = [self._get_agent_value(a, field) for a in agents]
                values = [v for v in values if v is not None]
                results[agg] = float(np.max(values)) if values else 0.0
            elif agg.startswith('distribution_'):
                field = agg[13:]  # Remove 'distribution_' prefix
                values = [self._get_agent_value(a, field) for a in agents]
                values = [v for v in values if v is not None]
                distribution = dict(Counter(values))
                # Convert keys to strings for JSON serialization
                results[agg] = {str(k): v for k, v in distribution.items()}
            elif agg.startswith('percentile_'):
                # Format: percentile_50_vermoegen -> 50th percentile of vermoegen
                parts = agg.split('_')
                if len(parts) >= 3:
                    percentile = int(parts[1])
                    field = '_'.join(parts[2:])
                    values = [self._get_agent_value(a, field) for a in agents]
                    values = [v for v in values if v is not None]
                    results[agg] = float(np.percentile(values, percentile)) if values else 0.0

        return results

    def get_time_series(self, metrics: List[str], start_step: int = 0,
                       end_step: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Extract time series for specific metrics from history.

        Args:
            metrics: List of metric paths using dot notation (e.g., "model_report.Gini_Vermoegen")
            start_step: Starting step (default: 0)
            end_step: Ending step (None = current step)

        Returns:
            Dictionary with 'step' array and arrays for each metric
        """
        if not self.history:
            print("No history available for time series")
            return None

        # Determine range
        end_step = end_step if end_step is not None else len(self.history)
        end_step = min(end_step, len(self.history))

        if start_step >= end_step:
            return {"error": "Invalid step range"}

        # Initialize result structure
        result = {
            'step': [],
            'metrics': {metric: [] for metric in metrics}
        }

        # Extract data for each snapshot in range
        for i in range(start_step, end_step):
            snapshot = self.history[i]
            result['step'].append(snapshot.get('step', i))

            for metric in metrics:
                value = self._extract_metric(snapshot, metric)
                result['metrics'][metric].append(value)

        # Add metadata
        result['metadata'] = {
            'start_step': start_step,
            'end_step': end_step,
            'total_steps': end_step - start_step,
            'metrics_requested': metrics
        }

        return result

    def _extract_metric(self, snapshot: Dict, metric_path: str) -> Any:
        """Extract value from nested dict using dot notation.

        Examples:
            "step" -> snapshot['step']
            "model_report.Gini_Vermoegen" -> snapshot['model_report']['Gini_Vermoegen']
            "model_report.Regions.Urban" -> snapshot['model_report']['Regions']['Urban']
        """
        keys = metric_path.split('.')
        value = snapshot

        try:
            for key in keys:
                if isinstance(value, dict):
                    value = value.get(key)
                else:
                    return None

            # Convert numpy types for JSON serialization
            if isinstance(value, (np.integer, np.floating)):
                return float(value)
            elif isinstance(value, (list, tuple)) and len(value) > 0:
                if isinstance(value[0], (np.integer, np.floating)):
                    return [float(v) for v in value]

            return value

        except (KeyError, TypeError, AttributeError):
            return None

# Create a single, globally accessible instance of the manager.
manager = SimulationManager()