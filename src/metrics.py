"""Image-quality and spectral-fidelity metrics for (C, H, W) arrays.

Band order everywhere: index 0=B2 (blue), 1=B3 (green), 2=B4 (red), 3=B8 (NIR).
"""
from __future__ import annotations

import numpy as np
from skimage.metrics import structural_similarity

EPS = 1e-8
BLUE, GREEN, RED, NIR = 0, 1, 2, 3


def psnr(pred: np.ndarray, ref: np.ndarray, data_range: float = 1.0) -> float:
    mse = np.mean((np.asarray(pred, np.float64) - np.asarray(ref, np.float64)) ** 2)
    if mse == 0:
        return float("inf")
    return float(10.0 * np.log10(data_range**2 / mse))


def ssim(pred: np.ndarray, ref: np.ndarray, data_range: float = 1.0) -> float:
    """Mean SSIM across bands. Inputs are (C, H, W)."""
    return float(
        structural_similarity(
            np.asarray(ref, np.float64),
            np.asarray(pred, np.float64),
            data_range=data_range,
            channel_axis=0,
        )
    )


def sam(pred: np.ndarray, ref: np.ndarray) -> float:
    """Mean Spectral Angle Mapper in radians, computed per pixel over the band axis.

    Uses the numerically stable form angle = 2 * atan2(|p^ - r^|, |p^ + r^|) on unit
    vectors, because arccos of a cosine near 1 loses precision (~1e-4 rad).
    """
    p = np.asarray(pred, np.float64)
    r = np.asarray(ref, np.float64)
    p = p / (np.linalg.norm(p, axis=0, keepdims=True) + EPS)
    r = r / (np.linalg.norm(r, axis=0, keepdims=True) + EPS)
    ang = 2.0 * np.arctan2(np.linalg.norm(p - r, axis=0), np.linalg.norm(p + r, axis=0))
    return float(np.mean(ang))


def ndvi(img: np.ndarray) -> np.ndarray:
    nir, red = img[NIR].astype(np.float64), img[RED].astype(np.float64)
    return (nir - red) / (nir + red + EPS)


def ndwi(img: np.ndarray) -> np.ndarray:
    """McFeeters NDWI = (Green - NIR) / (Green + NIR)."""
    g, nir = img[GREEN].astype(np.float64), img[NIR].astype(np.float64)
    return (g - nir) / (g + nir + EPS)


def ndvi_mae(pred: np.ndarray, ref: np.ndarray) -> float:
    return float(np.mean(np.abs(ndvi(pred) - ndvi(ref))))


def ndwi_mae(pred: np.ndarray, ref: np.ndarray) -> float:
    return float(np.mean(np.abs(ndwi(pred) - ndwi(ref))))


def evaluate(pred: np.ndarray, ref: np.ndarray, data_range: float = 1.0) -> dict:
    """All headline metrics in one dict."""
    if pred.shape != ref.shape:
        raise ValueError(f"shape mismatch: {pred.shape} vs {ref.shape}")
    return {
        "psnr_db": psnr(pred, ref, data_range),
        "ssim": ssim(pred, ref, data_range),
        "sam_rad": sam(pred, ref),
        "ndvi_mae": ndvi_mae(pred, ref),
        "ndwi_mae": ndwi_mae(pred, ref),
    }
