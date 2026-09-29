"""Sensor-informed degradation: 2.5 m high-resolution -> 10 m low-resolution.

This is the "physics-grounded" core of TerraPixel. It is used to
  1. build synthetic LR inputs from HR targets (training pairs), and
  2. re-degrade a super-resolved output back to 10 m to check that it is
     consistent with the observed Sentinel-2 input (degradation consistency).

Model (deliberately simple, documented approximations):
  * The sensor's system MTF is approximated as Gaussian.
  * The Gaussian sigma is derived from the MTF value at the Nyquist frequency
    of the *low-resolution* grid.
  * Detector integration is modelled as a scale x scale block mean. To avoid
    double counting it, the box-filter variance is subtracted from the total
    variance before building the Gaussian PSF.
  * Optional additive Gaussian noise.

The MTF@Nyquist values below are approximate placeholders for B2/B3/B4/B8.
Verify them against the ESA Sentinel-2 MSI data quality report before
reporting any results.
"""
from __future__ import annotations

import numpy as np
from scipy.ndimage import gaussian_filter

# Approximate MTF at Nyquist per band (B2, B3, B4, B8). VERIFY against ESA docs.
S2_MTF_NYQUIST = {"B2": 0.27, "B3": 0.27, "B4": 0.27, "B8": 0.26}
BAND_ORDER = ("B2", "B3", "B4", "B8")


def sigma_from_mtf_nyquist(mtf_nyquist: float) -> float:
    """Gaussian sigma (in LR pixels) whose MTF equals ``mtf_nyquist`` at 0.5 cycles/LR-pixel.

    Gaussian MTF: M(f) = exp(-2 * pi^2 * sigma^2 * f^2). At f = 0.5:
        M = exp(-pi^2 * sigma^2 / 2)  ->  sigma = sqrt(-2 ln M) / pi
    """
    if not 0.0 < mtf_nyquist < 1.0:
        raise ValueError("mtf_nyquist must be in (0, 1)")
    return float(np.sqrt(-2.0 * np.log(mtf_nyquist)) / np.pi)


def hr_psf_sigma(mtf_nyquist: float, scale: int) -> float:
    """PSF sigma in HR pixels after removing the block-mean (detector) variance."""
    sigma_total_hr = sigma_from_mtf_nyquist(mtf_nyquist) * scale
    var_box = (scale**2 - 1) / 12.0  # variance of a discrete box of width `scale`
    var_psf = max(sigma_total_hr**2 - var_box, 0.0)
    return float(np.sqrt(var_psf))


def block_mean(img: np.ndarray, scale: int) -> np.ndarray:
    """Average non-overlapping scale x scale blocks of a (C, H, W) array."""
    c, h, w = img.shape
    if h % scale or w % scale:
        raise ValueError(f"H and W must be divisible by scale={scale}, got {(h, w)}")
    return img.reshape(c, h // scale, scale, w // scale, scale).mean(axis=(2, 4))


def degrade(
    hr: np.ndarray,
    scale: int = 4,
    mtf_nyquist: float | list | None = None,
    noise_std: float = 0.0,
    rng: np.random.Generator | None = None,
) -> np.ndarray:
    """Degrade an HR image (C, H, W) to LR (C, H/scale, W/scale).

    Args:
        hr: float array, reflectance-like values, shape (C, H, W).
        scale: downsampling factor (4 for 2.5 m -> 10 m).
        mtf_nyquist: one float for all bands, a per-band sequence of length C,
            or None to use the Sentinel-2 defaults for (B2, B3, B4, B8).
        noise_std: std of additive Gaussian noise in the same units as ``hr``.
        rng: numpy Generator for reproducible noise.
    """
    hr = np.asarray(hr, dtype=np.float64)
    if hr.ndim != 3:
        raise ValueError("hr must have shape (C, H, W)")
    c = hr.shape[0]

    if mtf_nyquist is None:
        if c != len(BAND_ORDER):
            raise ValueError("pass mtf_nyquist explicitly when C != 4")
        mtfs = [S2_MTF_NYQUIST[b] for b in BAND_ORDER]
    elif np.isscalar(mtf_nyquist):
        mtfs = [float(mtf_nyquist)] * c
    else:
        mtfs = [float(m) for m in mtf_nyquist]
        if len(mtfs) != c:
            raise ValueError("per-band mtf_nyquist must have length C")

    blurred = np.empty_like(hr)
    for i, m in enumerate(mtfs):
        blurred[i] = gaussian_filter(hr[i], sigma=hr_psf_sigma(m, scale), mode="reflect")

    lr = block_mean(blurred, scale)
    if noise_std > 0:
        rng = rng or np.random.default_rng()
        lr = lr + rng.normal(0.0, noise_std, size=lr.shape)
    return lr


def degradation_consistency_error(sr: np.ndarray, lr: np.ndarray, scale: int = 4, **kw) -> float:
    """Mean absolute error between degrade(SR) and the observed LR input.

    Low values mean the SR output can be explained by the 10 m observation.
    """
    return float(np.mean(np.abs(degrade(sr, scale=scale, **kw) - np.asarray(lr, dtype=np.float64))))
