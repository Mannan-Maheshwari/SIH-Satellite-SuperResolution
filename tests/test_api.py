import io

import numpy as np
import pytest

pytest.importorskip("httpx")
rasterio = pytest.importorskip("rasterio")

from fastapi.testclient import TestClient
from rasterio.io import MemoryFile
from rasterio.transform import from_origin

from app.main import app

client = TestClient(app)


def _tif(bands=4, res=10.0, crs="EPSG:32644"):
    data = np.random.default_rng(0).random((bands, 16, 16)).astype("float32")
    with MemoryFile() as mem:
        with mem.open(driver="GTiff", height=16, width=16, count=bands, dtype="float32",
                      crs=crs, transform=from_origin(500000, 3000000, res, res)) as dst:
            dst.write(data)
        return mem.read()


def test_health():
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"


def test_inspect_valid_input():
    r = client.post("/inspect", files={"file": ("a.tif", io.BytesIO(_tif()), "image/tiff")})
    assert r.status_code == 200
    body = r.json()
    assert body["valid_input"] and body["bands"] == 4


def test_inspect_flags_wrong_bands():
    r = client.post("/inspect", files={"file": ("a.tif", io.BytesIO(_tif(bands=3)), "image/tiff")})
    assert not r.json()["valid_input"]


def test_inspect_rejects_garbage():
    r = client.post("/inspect", files={"file": ("a.tif", io.BytesIO(b"nope"), "image/tiff")})
    assert r.status_code == 400


def test_super_resolve_is_a_stub():
    r = client.post("/super-resolve", files={"file": ("a.tif", io.BytesIO(_tif()), "image/tiff")})
    assert r.status_code == 501
