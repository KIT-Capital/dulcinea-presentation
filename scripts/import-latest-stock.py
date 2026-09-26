"""Import the newly supplied city-walk footage and verify the repeated neon clip.

Usage: python scripts/import-latest-stock.py --source-dir "/path/to/Stock Video"
Optional: --ffmpeg /path/to/ffmpeg
Original MOV files are read only. Only the new optimized MP4, poster and
latest-provenance.json are written; presentation placements remain unchanged.
"""

import argparse
import importlib.util
import json
from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[1]
STOCK = ROOT / "assets" / "video" / "stock"
NEW_ID = "787505338"
REPEATED_ID = "807462744"
VIDEO_FILTER = (
    "scale=1280:720:force_original_aspect_ratio=increase:flags=lanczos:out_range=tv:out_color_matrix=bt709,"
    "crop=1280:720,setsar=1,fps=24,"
    "setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709"
)
ENCODING = [
    "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-maxrate", "6M", "-bufsize", "12M",
    "-profile:v", "high", "-level", "3.1", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-r", "24", "-g", "48",
    "-movflags", "+faststart", "-threads", "4",
]


def load_helper(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def verify_faststart(path):
    atoms = []
    with path.open("rb") as source:
        while header := source.read(8):
            if len(header) != 8:
                raise RuntimeError("Truncated MP4 atom header")
            size, kind = struct.unpack(">I4s", header)
            atoms.append(kind.decode("ascii"))
            if size < 8:
                raise RuntimeError("Unexpected MP4 atom size")
            source.seek(size - 8, 1)
    if atoms.index("moov") > atoms.index("mdat"):
        raise RuntimeError("Output is not a fast-start MP4")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--ffmpeg")
    args = parser.parse_args()
    ffmpeg = load_helper("ffmpeg_locator", "render-videos.py").find_ffmpeg(args.ffmpeg)
    helper = load_helper("stock_helpers", "render-stock-videos.py")
    original = args.source_dir / f"AdobeStock_{NEW_ID}.mov"
    repeated = args.source_dir / f"AdobeStock_{REPEATED_ID}.mov"
    original_stat = original.stat()
    print("Inspecting and hashing both supplied originals", flush=True)
    original_metadata = helper.inspect(ffmpeg, original)
    repeated_metadata = helper.inspect(ffmpeg, repeated)
    previous = json.loads((STOCK / "additional-provenance.json").read_text(encoding="utf-8-sig"))
    prior_neon = next(clip for clip in previous["unique_clips"] if clip["id"] == REPEATED_ID)
    repeated_matches = repeated_metadata["sha256"] == prior_neon["original"]["sha256"]
    retained_matches = helper.sha256(ROOT / prior_neon["optimized_path"]) == prior_neon["optimized"]["sha256"]
    print(f"807 source matches prior import: {repeated_matches}; retained MP4 matches: {retained_matches}", flush=True)
    output = STOCK / f"AdobeStock_{NEW_ID}.mp4"
    poster = STOCK / f"AdobeStock_{NEW_ID}-poster.jpg"
    helper.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(original),
                "-vf", VIDEO_FILTER, *ENCODING, str(output)])
    output_metadata = helper.validate(ffmpeg, output)
    verify_faststart(output)
    if output.stat().st_size >= 25_000_000:
        raise RuntimeError("Output exceeds the 25 MB hosting limit")
    helper.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-ss", "3", "-i", str(output),
                "-frames:v", "1", "-q:v", "2", str(poster)])
    current_stat = original.stat()
    if (current_stat.st_size, current_stat.st_mtime_ns) != (original_stat.st_size, original_stat.st_mtime_ns):
        raise RuntimeError("Original file changed during import")
    provenance = {
        "source": "Two Adobe Stock MOV files supplied by the user; originals remain unchanged outside the repository.",
        "render_script": "scripts/import-latest-stock.py",
        "imported_clips": [{
            "id": NEW_ID,
            "subject": "Woman in sunglasses walking toward and past the camera on a tree-lined city sidewalk, with road traffic and an ENVIGADO bus behind her.",
            "people_present": True,
            "original_filename": original.name, "original": original_metadata,
            "optimized_path": output.relative_to(ROOT).as_posix(), "optimized": output_metadata,
            "poster_path": poster.relative_to(ROOT).as_posix(), "poster_seconds": 3,
            "poster_sha256": helper.sha256(poster),
            "encoding_options": ENCODING, "video_filter": VIDEO_FILTER,
            "edit_note": "Full supplied clip at original speed and aspect ratio; no content edits, synthetic imagery or exposure adjustment. Subject walks out of frame near the end.",
            "watermark_review": "No visible watermark in original representative frames at 10, 50 and 90 percent of duration.",
            "location_note": "ENVIGADO is visible on a bus; exact shooting location is not independently verified. Illustrative stock footage, not a Dulcinea property or team member.",
        }],
        "previously_imported": [{
            "id": REPEATED_ID, "subject": "Glowing green MEDELLIN neon word animation on black", "people_present": False,
            "original_filename": repeated.name, "original": repeated_metadata,
            "matches_previous_original_sha256": repeated_matches,
            "previous_original_sha256": prior_neon["original"]["sha256"],
            "existing_optimized_path": prior_neon["optimized_path"],
            "existing_optimized_hash_matches": retained_matches,
            "action": "Exact source duplicate; retained existing optimized file and poster without changes." if repeated_matches and retained_matches else "Existing files left unchanged; source or optimized hash difference requires review.",
            "prior_provenance": "assets/video/stock/additional-provenance.json",
            "watermark_review": "No visible watermark in original representative frames at 10, 50 and 90 percent of duration.",
        }],
        "validation": "New output completely decoded successfully and verified as silent H.264 1280x720 at 24 fps, with moov before mdat for fast start. Output below 25 MB.",
        "main_compositions": "Introduction, after-dark and other presentation compositions are not modified by this import.",
    }
    (STOCK / "latest-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"optimized": output_metadata, "repeated_original_matches": repeated_matches,
                      "retained_optimized_matches": retained_matches}, indent=2))


if __name__ == "__main__":
    main()
