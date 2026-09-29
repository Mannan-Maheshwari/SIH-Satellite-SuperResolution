"""Split-conformal calibration for per-pixel uncertainty.

Given an ensemble that yields a per-pixel mean ``mu`` and spread ``sigma``:

  1. On a held-out *calibration* set compute scores s = |y - mu| / (sigma + eps).
  2. q = the ceil((n + 1)(1 - alpha)) / n empirical quantile of the scores.
  3. Prediction interval: mu +/- q * sigma.

Guarantee (and its limits):
  * Marginal coverage >= 1 - alpha in finite samples, IF calibration and test
    points are exchangeable.
  * NOT a guarantee for out-of-distribution inputs.
  * Pixels within a scene are spatially correlated: calibrate on scenes that
    are separate from training and test scenes, and consider subsampling
    pixels (``subsample``) so the effective sample is not dominated by one scene.
  * Coverage is with respect to whatever reference ``y`` was used (here a proxy).
"""
from __future__ import annotations

import math

import numpy as np

EPS = 1e-8


def conformal_quantile(scores: np.ndarray, alpha: float) -> float:
    """Finite-sample conformal quantile: the ceil((n+1)(1-alpha))-th smallest score."""
    if not 0.0 < alpha < 1.0:
        raise ValueError("alpha must be in (0, 1)")
    s = np.sort(np.asarray(scores, dtype=np.float64).ravel())
    n = s.size
    if n == 0:
        raise ValueError("no calibration scores")
    k = math.ceil((n + 1) * (1.0 - alpha))
    if k > n:  # too few calibration points for this alpha
        return float("inf")
    return float(s[k - 1])


def calibrate(
    y: np.ndarray,
    mu: np.ndarray,
    sigma: np.ndarray,
    alpha: float = 0.10,
    subsample: int | None = None,
    seed: int = 0,
) -> float:
    """Return the scaling factor q from calibration data."""
    scores = (np.abs(y - mu) / (sigma + EPS)).ravel()
    if subsample is not None and subsample < scores.size:
        scores = np.random.default_rng(seed).choice(scores, size=subsample, replace=False)
    return conformal_quantile(scores, alpha)


def predict_interval(mu: np.ndarray, sigma: np.ndarray, q: float) -> tuple[np.ndarray, np.ndarray]:
    half = q * sigma
    return mu - half, mu + half


def empirical_coverage(y: np.ndarray, lo: np.ndarray, hi: np.ndarray) -> float:
    return float(np.mean((y >= lo) & (y <= hi)))


def coverage_by_group(y: np.ndarray, lo: np.ndarray, hi: np.ndarray, groups: np.ndarray) -> dict:
    """Coverage per group label (e.g. land-cover class). ``groups`` has the shape of ``y``."""
    inside = (y >= lo) & (y <= hi)
    return {int(g): float(np.mean(inside[groups == g])) for g in np.unique(groups)}
