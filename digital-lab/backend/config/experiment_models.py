"""
Experiment Runner Data Models for ABM² Digital Lab
Enables causal testing through controlled computational experiments
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class TreatmentConfig(BaseModel):
    """Configuration for a single experimental treatment"""
    name: str
    config_modifications: Dict[str, Any] = Field(
        ...,
        description="Parameter modifications, e.g., {'altruism_factor': 2.0}"
    )
    num_runs: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Number of replications for statistical robustness"
    )
    color: str = Field(
        default="#888888",
        description="Color for visualization in charts"
    )

class ExperimentRun(BaseModel):
    """Results from a single simulation run"""
    run_number: int
    simulation_steps: int
    final_metrics: Dict[str, float] = Field(
        ...,
        description="Final state metrics: {gini: 0.35, avg_wealth: 1000, ...}"
    )
    time_series: Dict[str, List[float]] = Field(
        ...,
        description="Time series data: {gini: [0.30, 0.32, 0.35, ...], ...}"
    )

class TreatmentResults(BaseModel):
    """Aggregated results for all runs of a treatment"""
    treatment_name: str
    runs: List[ExperimentRun]
    aggregated_metrics: Dict[str, Dict[str, float]] = Field(
        ...,
        description="Statistics per metric: {gini: {mean: 0.35, std: 0.02, min: 0.31, max: 0.39}}"
    )

class ExperimentDefinition(BaseModel):
    """Complete definition of an experiment"""
    id: str = Field(..., description="Unique experiment ID (UUID)")
    name: str
    description: str
    baseline_config: Dict[str, Any] = Field(
        ...,
        description="Complete simulation configuration (from /api/config)"
    )
    treatments: List[TreatmentConfig]
    target_steps: int = Field(
        default=100,
        ge=1,
        description="Number of simulation steps to run"
    )
    created_at: datetime
    status: str = Field(
        default="pending",
        description="Status: pending, running, completed, failed"
    )

class StatisticalTest(BaseModel):
    """Results of statistical comparison between treatments"""
    treatment_a: str
    treatment_b: str
    metric: str
    t_statistic: float
    p_value: float
    significant: bool
    mean_diff: float
    cohens_d: float = Field(..., description="Effect size")

class ExperimentResults(BaseModel):
    """Complete experiment results with statistical analysis"""
    experiment_id: str
    completed_at: datetime
    treatments: List[TreatmentResults]
    statistical_tests: List[StatisticalTest] = Field(
        default_factory=list,
        description="Pairwise comparisons between all treatments"
    )

class CreateExperimentRequest(BaseModel):
    """API request to create new experiment"""
    name: str
    description: str
    baseline_config: Dict[str, Any]
    treatments: List[TreatmentConfig]
    target_steps: int = 100
