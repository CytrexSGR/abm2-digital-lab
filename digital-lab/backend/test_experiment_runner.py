"""
Integration test for Experiment Runner
Tests the complete workflow: create -> run -> analyze
"""

from config.experiment_models import CreateExperimentRequest, TreatmentConfig
from experiment_service import experiment_service
import json

def test_experiment_runner():
    """Test complete experiment workflow"""

    print("=" * 60)
    print("EXPERIMENT RUNNER INTEGRATION TEST")
    print("=" * 60)

    # 1. Create experiment
    print("\n1. Creating experiment...")

    baseline_config = {
        "num_agents": 50,  # Small for fast testing
        "biomes": [],
        "simulation_parameters": {}
    }

    treatments = [
        TreatmentConfig(
            name="Baseline",
            config_modifications={},
            num_runs=2,  # Only 2 runs for quick test
            color="#3498db"
        ),
        TreatmentConfig(
            name="High Agents",
            config_modifications={"num_agents": 75},
            num_runs=2,
            color="#e74c3c"
        )
    ]

    request = CreateExperimentRequest(
        name="Test Experiment",
        description="Integration test for experiment runner",
        baseline_config=baseline_config,
        treatments=treatments,
        target_steps=10  # Only 10 steps for quick test
    )

    experiment = experiment_service.create_experiment(request)
    print(f"✓ Experiment created: {experiment.id}")
    print(f"  - Name: {experiment.name}")
    print(f"  - Treatments: {len(experiment.treatments)}")
    print(f"  - Status: {experiment.status}")

    # 2. Run experiment
    print(f"\n2. Running experiment (this may take ~30 seconds)...")

    results = experiment_service.run_experiment(experiment.id)

    print(f"✓ Experiment completed!")
    print(f"  - Treatments analyzed: {len(results.treatments)}")

    # 3. Analyze results
    print(f"\n3. Analyzing results...")

    for treatment_result in results.treatments:
        print(f"\n  Treatment: {treatment_result.treatment_name}")
        print(f"    Runs: {len(treatment_result.runs)}")

        if "gini" in treatment_result.aggregated_metrics:
            gini_stats = treatment_result.aggregated_metrics["gini"]
            print(f"    Gini: {gini_stats['mean']:.3f} ± {gini_stats['std']:.3f}")

    # 4. Statistical tests
    print(f"\n4. Statistical comparisons:")

    if results.statistical_tests:
        for test in results.statistical_tests:
            print(f"\n  {test.treatment_a} vs {test.treatment_b}")
            print(f"    Metric: {test.metric}")
            print(f"    Mean diff: {test.mean_diff:.4f}")
            print(f"    p-value: {test.p_value:.4f}")
            print(f"    Significant: {'Yes' if test.significant else 'No'}")
            print(f"    Effect size (Cohen's d): {test.cohens_d:.3f}")
    else:
        print("  No statistical tests performed")

    # 5. Verify persistence
    print(f"\n5. Verifying data persistence...")

    loaded_definition = experiment_service.get_experiment(experiment.id)
    loaded_results = experiment_service.get_results(experiment.id)

    assert loaded_definition is not None, "Failed to load experiment definition"
    assert loaded_results is not None, "Failed to load experiment results"

    print(f"✓ Experiment data persisted successfully")

    print("\n" + "=" * 60)
    print("TEST PASSED ✓")
    print("=" * 60)

    return experiment.id


if __name__ == "__main__":
    try:
        experiment_id = test_experiment_runner()
        print(f"\nExperiment ID: {experiment_id}")
        print(f"Check results at: backend/experiments/{experiment_id}/")
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
