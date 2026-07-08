#!/usr/bin/env python3
"""Generate js/photos-data.js from assets/photos/."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHOTOS_ROOT = ROOT / "assets" / "photos"
OUTPUT = ROOT / "js" / "photos-data.js"

GITE_NAMES = {
    "calin": "Gîte Calin",
    "chal-heureux": "Gîte Chal'heureux",
    "cocon-confort": "Gîte Cocon Confort",
    "coup-de-coeur": "Gîte Coup de Cœur",
    "valeur-sure": "Gîte Valeur Sûre",
}

ALT_OVERRIDES = {
    "gites-helene-gaillards-facade-balcons": "Façade des Gîtes Hélène aux Gaillards avec balcons fleuris",
    "lac-serre-poncon-panorama-embrun": "Panorama du lac de Serre-Ponçon près d'Embrun",
    "randonnee-embrun-hautes-alpes": "Randonnée à Embrun dans les Hautes-Alpes",
    "randonnee-hautes-alpes-gaillards": "Randonnée aux Gaillards dans les Hautes-Alpes",
    "ski-rando-station-les-orres-hautes-alpes": "Ski de randonnée à la station des Orres",
    "canoe-plan-eau-embrun-hautes-alpes": "Canoë sur le plan d'eau d'Embrun",
    "location-gite-vue-lac-serre-poncon-gaillards": "Vue sur le lac de Serre-Ponçon depuis les Gaillards",
    "vue-lac-serre-poncon-terrasse-balcon-gites-helene": "Vue panoramique sur le lac de Serre-Ponçon depuis la terrasse",
    "vue-hiver-lac-serre-poncon-montagnes-gaillards": "Vue hivernale enneigée sur le lac de Serre-Ponçon",
    "coucher-soleil-lac-serre-poncon-hautes-alpes": "Coucher de soleil sur le lac de Serre-Ponçon",
    "randonnee-serre-eyglier-hautes-alpes-collage": "Randonnée à Serre l'Eyglier dans les Hautes-Alpes",
    "terrasse-petit-dejeuner-vue-lac-gites-helene": "Petit-déjeuner sur la terrasse avec vue sur le lac",
    "vignoble-hautes-alpes-activite": "Balade dans les vignes des Hautes-Alpes",
    "vue-hiver-village-lac-serre-poncon-gaillards": "Village enneigé et lac de Serre-Ponçon en hiver",
    "vue-printemps-village-lac-serre-poncon-gaillards": "Vue printanière sur le village et le lac de Serre-Ponçon",
    "jardin-fleuri-vue-lac-serre-poncon-gites-helene": "Jardin fleuri avec vue sur le lac de Serre-Ponçon",
    "entree-gites-helene-les-risquetout-gaillards": "Entrée des Gîtes Hélène et Les Risquetout aux Gaillards",
    "terrasse-bancs-vue-lac-serre-poncon-gites-helene": "Terrasse avec bancs et vue sur le lac de Serre-Ponçon",
    "gites-helene-panneau-entree-route-gaillards": "Panneau Gîtes Hélène à l'entrée de la propriété aux Gaillards",
    "gites-helene-facade-balcons-coeurs-gaillards": "Façade des Gîtes Hélène avec balcons fleuris et décorations",
}

# Photos affichées en tête de la galerie (ordre fixe)
GALLERY_FIRST = [
    "terrasse-bancs-vue-lac-serre-poncon-gites-helene.jpg",
    "gites-helene-panneau-entree-route-gaillards.jpg",
    "gites-helene-facade-balcons-coeurs-gaillards.jpg",
]

FOLDER_ORDER = {
    "gallery": 0,
    "editorial": 1,
    "hero": 2,
}

# La page galerie n'inclut pas les carrousels des fiches gîtes (intérieurs)
# ni les vignettes de liste (souvent des doublons).
GALLERY_EXCLUDED_FOLDERS = {"gites", "cards"}

GALLERY_EXCLUDED_FILES = {
    "editorial/gites-helene-gaillards-facade-balcons.jpg",
    "editorial/lac-serre-poncon-panorama-embrun.jpg",
}


def alt_from_path(relative: Path) -> str:
    stem = relative.stem
    if stem in ALT_OVERRIDES:
        return ALT_OVERRIDES[stem]

    parts = relative.parts
    if "gites" in parts:
        slug = parts[parts.index("gites") + 1]
        gite = GITE_NAMES.get(slug, slug.replace("-", " ").title())
        match = re.search(r"-(\d{2})$", stem)
        number = match.group(1) if match else None
        if number:
            return f"{gite} — photo {int(number)} — location vacances Hautes-Alpes"
        return f"{gite} — location vacances aux Gaillards"

    if "cards" in parts:
        for slug, name in GITE_NAMES.items():
            if slug in stem:
                return f"{name} — aperçu location aux Gaillards"
        return stem.replace("-", " ").capitalize()

    return stem.replace("-", " ").capitalize() + " — Gîtes Hélène"


def sort_key(path_str: str) -> tuple:
    parts = Path(path_str).parts
    if len(parts) >= 3 and parts[0] == "assets" and parts[1] == "photos":
        folder = parts[2]
        if folder == "gallery":
            filename = Path(path_str).name
            if filename in GALLERY_FIRST:
                return (FOLDER_ORDER.get("gallery", 0), GALLERY_FIRST.index(filename), path_str)
            return (FOLDER_ORDER.get("gallery", 0), len(GALLERY_FIRST), path_str)
        if folder == "gites" and len(parts) >= 4:
            slug = parts[3]
            slug_order = list(GITE_NAMES).index(slug) if slug in GITE_NAMES else 99
            return (FOLDER_ORDER.get("gites", 4), slug_order, path_str)
        return (FOLDER_ORDER.get(folder, 99), path_str)
    return (99, path_str)


def file_hash(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def is_gallery_photo(relative: Path) -> bool:
    parts = relative.parts
    if not parts:
        return False
    if relative.as_posix() in GALLERY_EXCLUDED_FILES:
        return False
    return parts[0] not in GALLERY_EXCLUDED_FOLDERS


def collect_photos() -> list[dict[str, str]]:
    candidates: list[dict[str, str]] = []
    for path in sorted(PHOTOS_ROOT.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        relative_to_photos = path.relative_to(PHOTOS_ROOT)
        if not is_gallery_photo(relative_to_photos):
            continue
        relative = path.relative_to(ROOT).as_posix()
        candidates.append({"src": relative, "alt": alt_from_path(relative_to_photos)})

    candidates.sort(key=lambda item: sort_key(item["src"]))

    photos: list[dict[str, str]] = []
    seen_hashes: set[str] = set()
    for photo in candidates:
        digest = file_hash(ROOT / photo["src"])
        if digest in seen_hashes:
            continue
        seen_hashes.add(digest)
        photos.append(photo)

    return photos


def main() -> None:
    photos = collect_photos()
    payload = json.dumps(photos, ensure_ascii=False, indent=2)
    OUTPUT.write_text(
        "window.GITES_PHOTOS = " + payload + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(photos)} photos to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
