#!/usr/bin/env python3
"""Génère des variantes WebP et compresse les JPEG/PNG du dossier assets/."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

WEBP_QUALITY = 82
JPEG_QUALITY = 85
PNG_OPTIMIZE = True
MIN_WEBP_BYTES = 1024
SKIP_DIRS = {"archive"}

Image.MAX_IMAGE_PIXELS = 40_000_000


def should_process(path: Path) -> bool:
    if path.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
        return False
    if any(part in SKIP_DIRS for part in path.parts):
        return False
    if path.name.startswith("favicon"):
        return False
    return True


def save_webp(source: Path, image: Image.Image) -> int:
    webp_path = source.with_suffix(".webp")
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    image.save(webp_path, "WEBP", quality=WEBP_QUALITY, method=6)
    return webp_path.stat().st_size


def optimize_source(path: Path, image: Image.Image) -> int:
    suffix = path.suffix.lower()
    if suffix in {".jpg", ".jpeg"}:
        if image.mode != "RGB":
            image = image.convert("RGB")
        image.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    elif suffix == ".png":
        image.save(path, "PNG", optimize=PNG_OPTIMIZE)
    return path.stat().st_size


def main() -> int:
    created = 0
    skipped = 0
    saved_bytes = 0

    for path in sorted(ASSETS.rglob("*")):
        if not path.is_file() or not should_process(path):
            continue

        before = path.stat().st_size
        with Image.open(path) as image:
            image.load()
            optimize_source(path, image.copy())
            webp_size = save_webp(path, image)

        after = path.stat().st_size
        saved_bytes += max(0, before - min(after, webp_size))
        if webp_size >= MIN_WEBP_BYTES:
            created += 1
            print(f"  {path.relative_to(ROOT)} → .webp ({webp_size // 1024} Ko)")
        else:
            skipped += 1

    print("")
    print(f"WebP créés : {created}")
    print(f"Ignorés : {skipped}")
    print(f"Économie estimée (vs originaux) : {saved_bytes // 1024} Ko")
    return 0


if __name__ == "__main__":
    sys.exit(main())
