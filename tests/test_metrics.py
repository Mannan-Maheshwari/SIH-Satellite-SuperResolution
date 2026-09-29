import numpy as np
import pytest

from src.baseline_bicubic import bicubic_upsample, evaluate_bicubic, _demo_scene
from src.metrics import evaluate, ndvi, psnr, sam, ssim


def _img(seed=0):
    return np.random.default_rng(seed).random((4, 32, 32))


def test_identical_images_are_perfect():
    x = _img()
    m = evaluate(x, x)
    assert m["psnr_db"] == float("inf")
    assert m["ssim"] == pytest.approx(1.0)
    assert m["sam_rad"] == pytest.approx(0.0, abs=1e-6)
    assert m["ndvi_mae"] == pytest.approx(0.0)


def test_psnr_known_value():
    ref = np.zeros((4, 8, 8)); pred = ref + 0.1
    assert psnr(pred, ref) == pytest.approx(20.0)


def test_sam_scale_invariant_and_orthogonal():
    x = _img() + 0.1
    assert sam(2.0 * x, x) == pytest.approx(0.0, abs=1e-6)
    a = np.zeros((4, 1, 1)); a[0] = 1
    b = np.zeros((4, 1, 1)); b[1] = 1
    assert sam(a, b) == pytest.approx(np.pi / 2)


def test_ndvi_value():
    img = np.zeros((4, 1, 1)); img[3] = 0.6; img[2] = 0.2
    assert ndvi(img)[0, 0] == pytest.approx(0.5)


def test_ssim_drops_with_noise():
    x = _img()
    noisy = np.clip(x + np.random.default_rng(9).normal(0, 0.2, x.shape), 0, 1)
    assert ssim(noisy, x) < 0.9


def test_shape_mismatch_raises():
    with pytest.raises(ValueError):
        evaluate(np.zeros((4, 8, 8)), np.zeros((4, 9, 9)))


def test_bicubic_shape_and_range():
    up = bicubic_upsample(_img()[:, :8, :8], 4)
    assert up.shape == (4, 32, 32) and up.min() >= 0 and up.max() <= 1


def test_bicubic_baseline_runs_on_demo_scene():
    m = evaluate_bicubic(_demo_scene(128))
    assert m["psnr_db"] > 15 and 0 < m["ssim"] < 1
