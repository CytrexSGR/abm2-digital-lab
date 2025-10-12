"""
Statistical Tools for Experiment Analysis
Enables causal inference through rigorous statistical testing
"""

from typing import List, Dict, Tuple
import numpy as np
from scipy import stats

def t_test_independent(group1: List[float], group2: List[float]) -> Dict:
    """
    Performs independent samples t-test

    Args:
        group1: Values from first treatment
        group2: Values from second treatment

    Returns:
        {
            "t_statistic": float,
            "p_value": float,
            "significant": bool (p < 0.05),
            "mean_diff": float,
            "mean_group1": float,
            "mean_group2": float
        }
    """
    arr1 = np.array(group1)
    arr2 = np.array(group2)

    t_stat, p_val = stats.ttest_ind(arr1, arr2)

    mean1 = np.mean(arr1)
    mean2 = np.mean(arr2)

    return {
        "t_statistic": float(t_stat),
        "p_value": float(p_val),
        "significant": p_val < 0.05,
        "mean_diff": float(mean1 - mean2),
        "mean_group1": float(mean1),
        "mean_group2": float(mean2)
    }

def cohens_d(group1: List[float], group2: List[float]) -> float:
    """
    Calculates Cohen's d effect size

    Interpretation:
    - 0.2: small effect
    - 0.5: medium effect
    - 0.8: large effect

    Returns:
        Effect size (Cohen's d)
    """
    arr1 = np.array(group1)
    arr2 = np.array(group2)

    n1, n2 = len(arr1), len(arr2)
    var1, var2 = np.var(arr1, ddof=1), np.var(arr2, ddof=1)

    # Pooled standard deviation
    pooled_std = np.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))

    return float((np.mean(arr1) - np.mean(arr2)) / pooled_std)

def anova_multiple_groups(groups: Dict[str, List[float]]) -> Dict:
    """
    Performs one-way ANOVA for multiple groups

    Args:
        groups: {"treatment_name": [values...], ...}

    Returns:
        {
            "f_statistic": float,
            "p_value": float,
            "significant": bool,
            "num_groups": int
        }
    """
    group_arrays = [np.array(vals) for vals in groups.values()]

    f_stat, p_val = stats.f_oneway(*group_arrays)

    return {
        "f_statistic": float(f_stat),
        "p_value": float(p_val),
        "significant": p_val < 0.05,
        "num_groups": len(groups)
    }

def descriptive_stats(values: List[float]) -> Dict[str, float]:
    """
    Calculate descriptive statistics for a dataset

    Returns:
        {
            "mean": float,
            "std": float,
            "min": float,
            "max": float,
            "median": float,
            "q25": float (25th percentile),
            "q75": float (75th percentile),
            "n": int (sample size)
        }
    """
    arr = np.array(values)

    return {
        "mean": float(np.mean(arr)),
        "std": float(np.std(arr, ddof=1)),
        "min": float(np.min(arr)),
        "max": float(np.max(arr)),
        "median": float(np.median(arr)),
        "q25": float(np.percentile(arr, 25)),
        "q75": float(np.percentile(arr, 75)),
        "n": len(arr)
    }

def confidence_interval(values: List[float], confidence: float = 0.95) -> Tuple[float, float]:
    """
    Calculate confidence interval for the mean

    Args:
        values: Sample data
        confidence: Confidence level (default 0.95 for 95% CI)

    Returns:
        (lower_bound, upper_bound)
    """
    arr = np.array(values)
    mean = np.mean(arr)
    se = stats.sem(arr)  # Standard error
    margin = se * stats.t.ppf((1 + confidence) / 2, len(arr) - 1)

    return float(mean - margin), float(mean + margin)

def aggregate_time_series(
    runs: List[Dict[str, List[float]]],
    metric: str
) -> Dict[str, List[float]]:
    """
    Aggregate multiple time series runs

    Args:
        runs: List of time series dicts from multiple runs
        metric: Metric to aggregate (e.g., "gini")

    Returns:
        {
            "mean": [step0_mean, step1_mean, ...],
            "std": [step0_std, step1_std, ...],
            "min": [step0_min, ...],
            "max": [step0_max, ...]
        }
    """
    # Extract metric from all runs
    all_series = [run[metric] for run in runs if metric in run]

    if not all_series:
        return {"mean": [], "std": [], "min": [], "max": []}

    # Convert to numpy array (runs x steps)
    arr = np.array(all_series)

    return {
        "mean": arr.mean(axis=0).tolist(),
        "std": arr.std(axis=0, ddof=1).tolist(),
        "min": arr.min(axis=0).tolist(),
        "max": arr.max(axis=0).tolist()
    }
