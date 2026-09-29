import numpy as np
import pytest

from src.conformal import (
    calibrate, conformal_quantile, coverage_by_group, empirical_coverage, predict_interval,
)


def test_quantile_index_logic():
    scores = np.arange(1, 11)  # n=10
    # alpha=0.2 -> k=ceil(11*0.8)=9 -> 9th smallest = 9
    assert conformal_quantile(scores, 0.2) == 9
    # too few points for alpha=0.05 -> k=ceil(11*0.95)=11>10
    assert conformal_quantile(scores, 0.05) == float("inf")


def test_invalid_alpha():
    with pytest.raises(ValueError):
        conformal_quantile(np.ones(5), 0.0)


@pytest.mark.parametrize("alpha", [0.05, 0.10, 0.20])
def test_coverage_close_to_target_on_exchangeable_data(alpha):
    rng = np.random.default_rng(0)
    n = 40_000
    sigma = rng.uniform(0.02, 0.1, n)
    mu = rng.random(n)
    y = mu + sigma * rng.standard_normal(n)  # noise proportional to sigma

    cal, test = slice(0, n // 2), slice(n // 2, n)
    q = calibrate(y[cal], mu[cal], sigma[cal], alpha=alpha)
    lo, hi = predict_interval(mu[test], sigma[test], q)
    cov = empirical_coverage(y[test], lo, hi)
    assert cov == pytest.approx(1 - alpha, abs=0.01)


def test_miscalibrated_sigma_is_corrected():
    """If the ensemble sigma is 3x too small, conformal q rescales the interval."""
    rng = np.random.default_rng(1)
    n = 40_000
    true_sd = 0.06
    mu = rng.random(n)
    y = mu + true_sd * rng.standard_normal(n)
    sigma_bad = np.full(n, true_sd / 3)

    q = calibrate(y[: n // 2], mu[: n // 2], sigma_bad[: n // 2], alpha=0.1)
    lo, hi = predict_interval(mu[n // 2:], sigma_bad[n // 2:], q)
    assert empirical_coverage(y[n // 2:], lo, hi) == pytest.approx(0.9, abs=0.01)
    assert q > 3  # naive +/-1.645 sigma would have undercovered badly


def test_subsample_option():
    rng = np.random.default_rng(2)
    y = rng.standard_normal(10_000); mu = np.zeros_like(y); s = np.ones_like(y)
    q = calibrate(y, mu, s, alpha=0.1, subsample=2_000)
    assert 1.4 < q < 1.9  # ~1.645


def test_coverage_by_group():
    y = np.array([0.0, 0.0, 5.0, 5.0]); lo = -np.ones(4); hi = np.ones(4)
    groups = np.array([0, 0, 1, 1])
    assert coverage_by_group(y, lo, hi, groups) == {0: 1.0, 1: 0.0}
