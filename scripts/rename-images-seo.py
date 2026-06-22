#!/usr/bin/env python3
"""Renomme les images assets en noms SEO et met à jour les références HTML/MD."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

STATIC_RENAMES: dict[str, str] = {
    "photos/hero/hero-vue-lac-serre-poncon.png": "photos/hero/location-gite-vue-lac-serre-poncon-gaillards.png",
    "photos/editorial/P1130388.JPG": "photos/editorial/randonnee-hautes-alpes-gaillards.jpg",
    "photos/editorial/gite-lac-serre-poncon.jpg": "photos/editorial/lac-serre-poncon-panorama-embrun.jpg",
    "photos/editorial/randonnee-embrun.jpg": "photos/editorial/randonnee-embrun-hautes-alpes.jpg",
    "photos/editorial/canoe-embrun.jpg": "photos/editorial/canoe-plan-eau-embrun-hautes-alpes.jpg",
    "photos/editorial/ski-rando-les-orres.jpg": "photos/editorial/ski-rando-station-les-orres-hautes-alpes.jpg",
    "photos/cards/gite-valeur-sure.jpg": "photos/cards/location-gite-valeur-sure-gaillards-st-sauveur.jpg",
    "photos/cards/gite-coup-de-coeur.jpg": "photos/cards/location-gite-coup-de-coeur-gaillards-st-sauveur.jpg",
    "photos/cards/gite-cocon-confort.jpg": "photos/cards/location-gite-cocon-confort-gaillards-st-sauveur.jpg",
    "photos/cards/gite-calin.jpg": "photos/cards/location-gite-calin-gaillards-st-sauveur.jpg",
    "photos/cards/gite-chal-heureux.jpg": "photos/cards/location-gite-chal-heureux-gaillards-st-sauveur.jpg",
    "brand/archive/logo-gite-helene.png": "brand/archive/logo-gites-helene-ancien.png",
}


def slug_from_gite_html(path: Path) -> str | None:
    name = path.name
    if not name.startswith("gite-") or not name.endswith(".html"):
        return None
    return name[len("gite-") : -len(".html")]


def collect_gite_carousel_renames() -> dict[str, str]:
    renames: dict[str, str] = {}
    pattern = re.compile(r'src="(assets/photos/gites/[^"]+)"')

    for html_path in sorted(ROOT.glob("gite-*.html")):
        slug = slug_from_gite_html(html_path)
        if not slug:
            continue
        content = html_path.read_text(encoding="utf-8")
        paths = pattern.findall(content)
        seen: set[str] = set()
        index = 1
        for rel in paths:
            if rel in seen:
                continue
            seen.add(rel)
            old_key = rel.removeprefix("assets/")
            filename = Path(rel).name
            new_name = f"location-gite-{slug}-hautes-alpes-{index:02d}.jpg"
            new_key = f"photos/gites/{slug}/{new_name}"
            renames[old_key] = new_key
            index += 1

    return renames


def apply_renames(mapping: dict[str, str]) -> None:
    # Renommer du plus profond chemin d'abord pour éviter les collisions.
    for old_rel, new_rel in sorted(mapping.items(), key=lambda item: item[0], reverse=True):
        old_path = ASSETS / old_rel
        new_path = ASSETS / new_rel
        if not old_path.exists():
            print(f"SKIP missing: {old_rel}", file=sys.stderr)
            continue
        new_path.parent.mkdir(parents=True, exist_ok=True)
        if new_path.exists() and old_path.resolve() != new_path.resolve():
            print(f"ERROR target exists: {new_rel}", file=sys.stderr)
            sys.exit(1)
        old_path.rename(new_path)
        print(f"RENAMED {old_rel} -> {new_rel}")


def update_references(mapping: dict[str, str]) -> None:
    extensions = {".html", ".md", ".css", ".js", ".mjs"}
    files = [p for p in ROOT.rglob("*") if p.suffix in extensions and "node_modules" not in p.parts]

    for file_path in files:
        text = file_path.read_text(encoding="utf-8")
        original = text
        for old_rel, new_rel in sorted(mapping.items(), key=lambda item: len(item[0]), reverse=True):
            old_url = f"assets/{old_rel}"
            new_url = f"assets/{new_rel}"
            text = text.replace(old_url, new_url)
        if text != original:
            file_path.write_text(text, encoding="utf-8")
            print(f"UPDATED {file_path.relative_to(ROOT)}")


def main() -> None:
    mapping = dict(STATIC_RENAMES)
    mapping.update(collect_gite_carousel_renames())

    apply_renames(mapping)
    update_references(mapping)
    print(f"\nDone — {len(mapping)} fichiers renommés.")


if __name__ == "__main__":
    main()
