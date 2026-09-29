"""TerraPixel API.

STATUS: early scaffold.
  * /health           working
  * /inspect          working: validates an uploaded GeoTIFF (bands, resolution, CRS)
  * /super-resolve    STUB: returns 501 until the trained model is integrated

Run:  uvicorn app.main:app --reload
"""
from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile

app = FastAPI(title="TerraPixel API", version="0.1.0")

EXPECTED_BANDS = 4          # B2, B3, B4, B8
EXPECTED_RES_M = 10.0
RES_TOLERANCE_M = 0.5


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "version": app.version}


@app.post("/inspect")
async def inspect(file: UploadFile = File(...)) -> dict:
    """Read a GeoTIFF and report whether it matches the expected model input."""
    import rasterio
    from rasterio.io import MemoryFile

    data = await file.read()
    try:
        with MemoryFile(data) as mem, mem.open() as src:
            res_x, res_y = src.res
            info = {
                "width": src.width,
                "height": src.height,
                "bands": src.count,
                "dtype": src.dtypes[0],
                "crs": src.crs.to_string() if src.crs else None,
                "resolution_m": [res_x, res_y],
            }
    except rasterio.errors.RasterioIOError as exc:
        raise HTTPException(status_code=400, detail=f"not a readable raster: {exc}") from exc

    problems = []
    if info["bands"] != EXPECTED_BANDS:
        problems.append(f"expected {EXPECTED_BANDS} bands (B2,B3,B4,B8), got {info['bands']}")
    if info["crs"] is None:
        problems.append("missing CRS")
    elif abs(res_x - EXPECTED_RES_M) > RES_TOLERANCE_M or abs(res_y - EXPECTED_RES_M) > RES_TOLERANCE_M:
        problems.append(f"expected ~{EXPECTED_RES_M} m pixels, got {res_x} x {res_y} (units of the CRS)")
    return {**info, "valid_input": not problems, "problems": problems}


@app.post("/super-resolve")
async def super_resolve(file: UploadFile = File(...)) -> None:
    """STUB. The trained 4x model is not integrated yet."""
    raise HTTPException(status_code=501, detail="Model not integrated yet (stub endpoint).")
