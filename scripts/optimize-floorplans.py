"""Export faithful, native-resolution floor plans for the investor website.

Usage: python scripts/optimize-floorplans.py --source-dir PATH_TO_FLOORPLANS_PNG

Requires Pillow with WebP support and pypdf. The supplied PNGs and source PDF
are read-only inputs. No resizing, cropping, sharpening, or redrawing is used.
"""

import argparse
import hashlib
import io
import json
from pathlib import Path

from PIL import Image
from pypdf import PdfReader


SOURCES = {
    1: "Casa_Fontanar_Piso1.png",
    2: "Casa_Fontanar_Piso2.png",
    3: "Casa_MonteSereno_Ubicacion.png",
    4: "Casa_MonteSereno_Piso1.png",
    5: "Casa_MonteSereno_Planta_Cubierta.png",
    6: "Casa_Aires_del_Campestre_Piso1.png",
    7: "Casa_Aires_del_Campestre_Piso2.png",
    8: "Casa_San_Lucas_Piso1.png",
    9: "Casa_San_Lucas_Piso2.png",
}


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def encode_lossless(image):
    stream = io.BytesIO()
    image.save(stream, format="WEBP", lossless=True, method=6)
    encoded = stream.getvalue()
    with Image.open(io.BytesIO(encoded)) as decoded:
        if decoded.size != image.size or decoded.convert("RGB").tobytes() != image.tobytes():
            raise ValueError("Lossless WebP pixel verification failed")
    return encoded


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, required=True)
    args = parser.parse_args()
    source_dir = args.source_dir.resolve(strict=True)
    repo = Path(__file__).resolve().parents[1]
    catalog_path = repo / "content/floorplans.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    pdf_path = repo / catalog["source"]["path"]
    pdf_bytes = pdf_path.read_bytes()
    if sha256(pdf_bytes) != catalog["source"]["sha256"]:
        raise ValueError("Source PDF hash differs from the approved catalog")
    reader = PdfReader(io.BytesIO(pdf_bytes))
    if len(reader.pages) != len(SOURCES):
        raise ValueError("Source PDF must contain the nine approved plan pages")
    if {page["page"] for page in catalog["pages"]} != set(SOURCES):
        raise ValueError("Catalog page mapping differs from the nine approved plans")

    prepared = []
    summary = []
    source_total = 0
    previous_total = 0
    asset_root = (repo / "assets/images/floorplans").resolve()
    for page in catalog["pages"]:
        number = page["page"]
        source_path = source_dir / SOURCES[number]
        source_bytes = source_path.read_bytes()
        source_total += len(source_bytes)
        with Image.open(io.BytesIO(source_bytes)) as original:
            if original.format != "PNG" or original.mode != "RGB":
                raise ValueError(f"Expected supplied RGB PNG: {source_path.name}")
            image = original.copy()

        treatment = "Supplied PNG pixels preserved at native resolution."
        verification_source = "supplied_png"
        if number in (1, 2):
            embedded = reader.pages[number - 1].images[0].image
            if embedded.mode != "RGBA" or embedded.size != image.size:
                raise ValueError(f"Fontanar page {number} lacks the original PDF alpha mask")
            if embedded.convert("RGB").tobytes() != image.tobytes():
                raise ValueError(f"Fontanar page {number} no longer matches the supplied PNG")
            image = Image.new("RGB", embedded.size, "white")
            image.paste(embedded, (0, 0), embedded.getchannel("A"))
            treatment = (
                "Original PDF embedded image and its existing alpha mask flattened on white; "
                "the supplied PNG has identical RGB pixels but omits the alpha mask. "
                "Native dimensions and drawing geometry preserved."
            )
            verification_source = "original_pdf_rgba_flattened_on_white"

        encoded = encode_lossless(image)
        output_path = (repo / page["asset_path"]).resolve()
        if not output_path.is_relative_to(asset_root):
            raise ValueError("Output path is outside the floorplan asset directory")
        previous_total += output_path.stat().st_size if output_path.exists() else 0
        prepared.append((output_path, encoded))
        page.update({
            "width": image.width,
            "height": image.height,
            "bytes": len(encoded),
            "asset_sha256": sha256(encoded),
            "supplied_source": {
                "filename": source_path.name,
                "sha256": sha256(source_bytes),
                "bytes": len(source_bytes),
                "width": image.width,
                "height": image.height,
                "original_preserved": True,
            },
            "treatment": treatment,
            "pixel_validation": {
                "reference": verification_source,
                "decoded_rgb_pixels_identical": True,
            },
        })
        summary.append({
            "page": number,
            "source": source_path.name,
            "dimensions": [image.width, image.height],
            "source_bytes": len(source_bytes),
            "asset_bytes": len(encoded),
            "verified_lossless": True,
        })

    catalog["rendering"] = {
        "tool": "Pillow lossless WebP and pypdf embedded-image extraction",
        "command": "python scripts/optimize-floorplans.py --source-dir PATH_TO_FLOORPLANS_PNG",
        "format": "Lossless WebP of the supplied plan images at their native resolution",
        "dimensions": "Native source dimensions recorded for each page",
        "cropped": False,
        "resized": False,
        "drawing_geometry_modified": False,
        "fontanar_alpha": "Original PDF alpha mask restored and flattened on white; no generated pixels or redrawing.",
        "source_policy": "Seven supplied PNGs retained pixel-for-pixel. Two Fontanar images use the matching original PDF RGBA image to restore its existing transparency. The original PDF and supplied PNGs remain unchanged.",
        "validation": "Every WebP decoded and compared byte-for-byte in RGB against its reference image. All nine source and output hashes recorded. PDF hash verified against the existing approved catalog.",
    }
    # Validate all inputs and encoded outputs before replacing any website asset.
    for output_path, encoded in prepared:
        output_path.write_bytes(encoded)
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({
        "plans": summary,
        "source_png_bytes": source_total,
        "previous_asset_bytes": previous_total,
        "optimized_asset_bytes": sum(len(encoded) for _, encoded in prepared),
        "original_pdf_unchanged": sha256(pdf_path.read_bytes()) == catalog["source"]["sha256"],
    }, indent=2))


if __name__ == "__main__":
    main()
