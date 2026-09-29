"""Bicubic 4x upsampling baseline.

Every learned model must beat this on PSNR/SSIM/SAM/NDVI-MAE, otherwise the
model is not adding value.

Usage:
    python -m src.baseline_bicubic --demo
    python -m src.baseline_bicubic --hr path/to/hr_2p5m_4band.tif
where the HR GeoTIFF has 4 bands in the order B2, B3, B4, B8, with reflectance
scaled to [0, 1] (or pass --scale-factor 10000 for raw L2A integers).
"""
from __future__ import annotations

import argparse
import json

import numpy as np
from scipy.ndimage import zoom

from .degradation import degrade
from .metrics import evaluate


def bicubic_upsample(lr: np.ndarray, scale: int = 4) -> np.ndarray:
    """Bicubic upsample (C, h, w) -> (C, h*scale, w*scale), pixel-centre aligned."""
    out = np.stack(
        [zoom(band, scale, order=3, mode="nearest", grid_mode=True) for band in lr]
    )
    return np.clip(out, 0.0, 1.0)


def evaluate_bicubic(hr: np.ndarray, scale: int = 4, noise_std: float = 0.0, seed: int = 0) -> dict:
    """Degrade HR -> LR, bicubic-upsample, and score against HR."""
    h, w = hr.shape[1:]
    hr = hr[:, : h - h % scale, : w - w % scale]
    lr = degrade(hr, scale=scale, noise_std=noise_std, rng=np.random.default_rng(seed))
    sr = bicubic_upsample(lr, scale)
    return evaluate(sr, hr)


def _demo_scene(size: int = 256, seed: int = 0) -> np.ndarray:
    """Synthetic 4-band scene with edges and vegetation/water-like contrast (smoke tests only)."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:size, 0:size] / size
    base = 0.3 + 0.2 * np.sin(8 * np.pi * xx) * np.cos(6 * np.pi * yy)
    road = (np.abs(yy - 0.5 - 0.2 * xx) < 0.01).astype(float)
    bands = [
        base * g + 0.15 * road + 0.02 * rng.standard_normal((size, size))
        for g in (0.8, 0.9, 1.0, 1.3)
    ]
    return np.clip(np.stack(bands), 0.0, 1.0)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--hr", help="HR GeoTIFF (4 bands, B2 B3 B4 B8)")
    ap.add_argument("--demo", action="store_true", help="run on a synthetic scene (smoke test, not a result)")
    ap.add_argument("--scale-factor", type=float, default=1.0, help="divide raster values by this (e.g. 10000)")
    ap.add_argument("--noise-std", type=float, default=0.0)
    args = ap.parse_args()

    if args.demo:
        hr = _demo_scene()
        print("NOTE: synthetic demo scene, numbers below are NOT project results.")
    elif args.hr:
        import rasterio

        with rasterio.open(args.hr) as src:
            hr = np.clip(src.read().astype(np.float64) / args.scale_factor, 0.0, 1.0)
        if hr.shape[0] != 4:
            raise SystemExit(f"expected 4 bands, got {hr.shape[0]}")
    else:
        ap.error("provide --hr PATH or --demo")

    print(json.dumps(evaluate_bicubic(hr, noise_std=args.noise_std), indent=2))


if __name__ == "__main__":
    main()
