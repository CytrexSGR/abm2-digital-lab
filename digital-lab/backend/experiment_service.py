"""
Experiment Service for ABM² Digital Lab
Enables controlled computational experiments for causal inference
"""

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import copy

from config.experiment_models import (
    ExperimentDefinition,
    TreatmentConfig,
    ExperimentRun,
    TreatmentResults,
    ExperimentResults,
    StatisticalTest,
    CreateExperimentRequest
)
from utils.statistics import (
    t_test_independent,
    cohens_d,
    descriptive_stats,
    aggregate_time_series
)
from simulation_manager import SimulationManager
from political_abm.model import PoliticalModel


class ExperimentService:
    """
    Manages computational experiments:
    - Creates and stores experiment definitions
    - Runs multiple simulations per treatment
    - Aggregates results
    - Performs statistical comparisons
    """

    def __init__(self, experiments_dir: Path):
        self.experiments_dir = experiments_dir
        self.experiments_dir.mkdir(exist_ok=True)

    def create_experiment(self, request: CreateExperimentRequest) -> ExperimentDefinition:
        """
        Create a new experiment definition

        Args:
            request: Experiment configuration

        Returns:
            ExperimentDefinition with generated ID
        """
        experiment_id = str(uuid.uuid4())

        definition = ExperimentDefinition(
            id=experiment_id,
            name=request.name,
            description=request.description,
            baseline_config=request.baseline_config,
            treatments=request.treatments,
            target_steps=request.target_steps,
            created_at=datetime.now(),
            status="pending"
        )

        # Create experiment directory
        exp_dir = self.experiments_dir / experiment_id
        exp_dir.mkdir(exist_ok=True)

        # Save definition
        self._save_definition(definition)

        return definition

    def run_experiment(self, experiment_id: str) -> ExperimentResults:
        """
        Execute all treatments of an experiment

        Args:
            experiment_id: UUID of experiment

        Returns:
            ExperimentResults with all runs and statistical tests
        """
        definition = self.get_experiment(experiment_id)
        if not definition:
            raise ValueError(f"Experiment {experiment_id} not found")

        # Update status
        definition.status = "running"
        self._save_definition(definition)

        treatment_results = []

        # Run each treatment
        for treatment in definition.treatments:
            print(f"Running treatment: {treatment.name} ({treatment.num_runs} runs)")

            runs = []
            for run_num in range(treatment.num_runs):
                print(f"  Run {run_num + 1}/{treatment.num_runs}")

                run_data = self._run_single_simulation(
                    baseline_config=definition.baseline_config,
                    modifications=treatment.config_modifications,
                    target_steps=definition.target_steps,
                    run_number=run_num
                )

                runs.append(run_data)

                # Save individual run
                self._save_run(experiment_id, treatment.name, run_num, run_data)

            # Aggregate results for this treatment
            aggregated = self._aggregate_runs(runs)

            treatment_results.append(TreatmentResults(
                treatment_name=treatment.name,
                runs=runs,
                aggregated_metrics=aggregated
            ))

        # Perform statistical tests between all treatment pairs
        statistical_tests = self._compare_treatments(treatment_results)

        # Create final results
        results = ExperimentResults(
            experiment_id=experiment_id,
            completed_at=datetime.now(),
            treatments=treatment_results,
            statistical_tests=statistical_tests
        )

        # Save results
        self._save_results(experiment_id, results)

        # Update definition status
        definition.status = "completed"
        self._save_definition(definition)

        return results

    def _run_single_simulation(
        self,
        baseline_config: Dict[str, Any],
        modifications: Dict[str, Any],
        target_steps: int,
        run_number: int
    ) -> ExperimentRun:
        """
        Run a single simulation with modified config

        Args:
            baseline_config: Base configuration
            modifications: Parameter changes for this treatment
            target_steps: Number of steps to simulate
            run_number: Run index

        Returns:
            ExperimentRun with metrics and time series
        """
        # Merge modifications into baseline
        config = self._merge_config(baseline_config, modifications)

        # Create isolated simulation (not using global manager to avoid conflicts)
        # Extract parameters from config
        num_agents = config.get('num_agents', 100)

        model = PoliticalModel(
            num_agents=num_agents,
            network_connections=5  # TODO: Make configurable
        )

        # Run simulation
        time_series = {
            "gini": [],
            "avg_wealth": [],
            "avg_income": [],
            "mean_altruism": []
        }

        for step in range(target_steps):
            model.step()

            # Collect metrics
            report = model.get_model_report()

            if report and 'model_report' in report:
                mr = report['model_report']
                time_series["gini"].append(mr.get('Gini_Vermoegen', 0))
                time_series["avg_wealth"].append(mr.get('Mean_Vermoegen', 0))
                time_series["avg_income"].append(mr.get('Mean_Einkommen', 0))
                time_series["mean_altruism"].append(mr.get('Mean_Altruism', 0))

        # Get final metrics
        final_report = model.get_model_report()
        final_metrics = {}

        if final_report and 'model_report' in final_report:
            mr = final_report['model_report']
            final_metrics = {
                "gini": mr.get('Gini_Vermoegen', 0),
                "avg_wealth": mr.get('Mean_Vermoegen', 0),
                "avg_income": mr.get('Mean_Einkommen', 0),
                "mean_altruism": mr.get('Mean_Altruism', 0),
                "top10_share": mr.get('Top10Share_Vermoegen', 0)
            }

        return ExperimentRun(
            run_number=run_number,
            simulation_steps=target_steps,
            final_metrics=final_metrics,
            time_series=time_series
        )

    def _merge_config(
        self,
        baseline: Dict[str, Any],
        modifications: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Deep merge modifications into baseline config

        Args:
            baseline: Base configuration
            modifications: Changes to apply

        Returns:
            Merged configuration
        """
        result = copy.deepcopy(baseline)

        def deep_merge(base_dict: Dict, update_dict: Dict):
            for key, value in update_dict.items():
                if key in base_dict and isinstance(base_dict[key], dict) and isinstance(value, dict):
                    deep_merge(base_dict[key], value)
                else:
                    base_dict[key] = value

        deep_merge(result, modifications)
        return result

    def _aggregate_runs(self, runs: List[ExperimentRun]) -> Dict[str, Dict[str, float]]:
        """
        Aggregate metrics across multiple runs

        Args:
            runs: List of experiment runs

        Returns:
            {metric_name: {mean: X, std: Y, ...}}
        """
        aggregated = {}

        # Get all metric names from first run
        if not runs:
            return aggregated

        metric_names = runs[0].final_metrics.keys()

        for metric in metric_names:
            values = [run.final_metrics[metric] for run in runs]
            stats = descriptive_stats(values)
            aggregated[metric] = stats

        return aggregated

    def _compare_treatments(
        self,
        treatment_results: List[TreatmentResults]
    ) -> List[StatisticalTest]:
        """
        Perform pairwise statistical comparisons between treatments

        Args:
            treatment_results: Results from all treatments

        Returns:
            List of statistical test results
        """
        tests = []

        # Compare all pairs
        for i in range(len(treatment_results)):
            for j in range(i + 1, len(treatment_results)):
                treatment_a = treatment_results[i]
                treatment_b = treatment_results[j]

                # Compare gini coefficient as primary metric
                metric = "gini"

                values_a = [run.final_metrics[metric] for run in treatment_a.runs]
                values_b = [run.final_metrics[metric] for run in treatment_b.runs]

                t_result = t_test_independent(values_a, values_b)
                effect_size = cohens_d(values_a, values_b)

                test = StatisticalTest(
                    treatment_a=treatment_a.treatment_name,
                    treatment_b=treatment_b.treatment_name,
                    metric=metric,
                    t_statistic=t_result["t_statistic"],
                    p_value=t_result["p_value"],
                    significant=t_result["significant"],
                    mean_diff=t_result["mean_diff"],
                    cohens_d=effect_size
                )

                tests.append(test)

        return tests

    def get_experiment(self, experiment_id: str) -> Optional[ExperimentDefinition]:
        """Load experiment definition"""
        def_path = self.experiments_dir / experiment_id / "definition.json"

        if not def_path.exists():
            return None

        with open(def_path, 'r') as f:
            data = json.load(f)
            return ExperimentDefinition(**data)

    def get_results(self, experiment_id: str) -> Optional[ExperimentResults]:
        """Load experiment results"""
        results_path = self.experiments_dir / experiment_id / "results.json"

        if not results_path.exists():
            return None

        with open(results_path, 'r') as f:
            data = json.load(f)
            return ExperimentResults(**data)

    def list_experiments(self) -> List[ExperimentDefinition]:
        """List all experiments"""
        experiments = []

        for exp_dir in self.experiments_dir.iterdir():
            if exp_dir.is_dir():
                experiment = self.get_experiment(exp_dir.name)
                if experiment:
                    experiments.append(experiment)

        # Sort by creation date (newest first)
        experiments.sort(key=lambda x: x.created_at, reverse=True)

        return experiments

    def _save_definition(self, definition: ExperimentDefinition):
        """Save experiment definition to disk"""
        exp_dir = self.experiments_dir / definition.id
        exp_dir.mkdir(exist_ok=True)

        def_path = exp_dir / "definition.json"

        with open(def_path, 'w') as f:
            json.dump(definition.model_dump(), f, indent=2, default=str)

    def _save_results(self, experiment_id: str, results: ExperimentResults):
        """Save experiment results to disk"""
        results_path = self.experiments_dir / experiment_id / "results.json"

        with open(results_path, 'w') as f:
            json.dump(results.model_dump(), f, indent=2, default=str)

    def _save_run(
        self,
        experiment_id: str,
        treatment_name: str,
        run_number: int,
        run_data: ExperimentRun
    ):
        """Save individual run data"""
        runs_dir = self.experiments_dir / experiment_id / "runs" / treatment_name
        runs_dir.mkdir(parents=True, exist_ok=True)

        run_path = runs_dir / f"run_{run_number}.json"

        with open(run_path, 'w') as f:
            json.dump(run_data.model_dump(), f, indent=2, default=str)


# Global instance
experiment_service = ExperimentService(
    experiments_dir=Path(__file__).parent / "experiments"
)
