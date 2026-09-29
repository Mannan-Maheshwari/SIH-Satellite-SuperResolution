import numpy as np
import pytest

from src.degradation import (
    block_mean, degrade, degradation_consistency_error, hr_psf_sigma, sigma_from_mtf_nyquist,
)


def test_sigma_reproduces_mtf_at_nyquist():
    for m in (0.2, 0.27, 0.5):
        s = sigma_from_mtf_nyquist(m)
        assert np.exp(-2 * np.pi**2 * s**2 * 0.5**2) == pytest.approx(m, rel=1e-9)


def test_output_shape():
    hr = np.random.default_rng(0).random((4, 64, 64))
    assert degrade(hr, scale=4).shape == (4, 16, 16)


def test_constant_image_is_preserved():
    hr = np.full((4, 32, 32), 0.37)
    assert np.allclose(degrade(hr), 0.37)


def test_mean_reflectance_is_approximately_preserved():
    hr = np.random.default_rng(1).random((4, 128, 128))
    assert abs(degrade(hr).mean() - hr.mean()) < 0.01


def test_degradation_smooths_high_frequencies():
    rng = np.random.default_rng(2)
    hr = rng.random((4, 64, 64))
    lr_up = np.kron(degrade(hr), np.ones((1, 4, 4)))
    assert lr_up.std() < hr.std()


def test_noise_is_reproducible_with_seed():
    hr = np.random.default_rng(3).random((4, 32, 32))
    a = degrade(hr, noise_std=0.01, rng=np.random.default_rng(7))
    b = degrade(hr, noise_std=0.01, rng=np.random.default_rng(7))
    assert np.array_equal(a, b)


def test_bad_shapes_raise():
    with pytest.raises(ValueError):
        block_mean(np.zeros((1, 10, 10)), 4)
    with pytest.raises(ValueError):
        degrade(np.zeros((3, 16, 16)))  # needs explicit mtf for C != 4


def test_psf_sigma_nonnegative():
    assert hr_psf_sigma(0.99, 4) >= 0.0


def test_consistency_error_zero_for_perfect_sr():
    hr = np.random.default_rng(4).random((4, 32, 32))
    lr = degrade(hr)
    assert degradation_consistency_error(hr, lr) == pytest.approx(0.0, abs=1e-12)
