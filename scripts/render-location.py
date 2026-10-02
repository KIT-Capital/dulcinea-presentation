"""Render the 18-second city, dining and sidewalk loop.

Usage: python scripts/render-location.py [--ffmpeg /path/to/ffmpeg]
Uses retained optimized footage. Source files and the opening film are unchanged.
"""

import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "assets" / "video"
FPS = 24
FADE = 0.5
DURATION = 18.0
LOOP_START = FADE + 3 / FPS
SCENES = [
    {"id": "693150796", "subject": "Aerial movement past city towers and green streets", "path": "assets/video/stock/AdobeStock_693150796.mp4", "source_start_seconds": 0, "source_duration_seconds": 4.5},
    {"id": "80490822", "subject": "Chefs preparing and plating food in a professional kitchen", "path": "assets/video/stock/AdobeStock_80490822.mp4", "source_start_seconds": 2, "source_duration_seconds": 6.5},
    {"id": "787505338", "subject": "Woman walking on a tree-lined city sidewalk beside traffic", "path": "assets/video/stock/AdobeStock_787505338.mp4", "source_start_seconds": 0, "source_duration_seconds": 4.5},
    {"id": "693150796", "subject": "Aerial movement past city towers and green streets", "path": "assets/video/stock/AdobeStock_693150796.mp4", "source_start_seconds": 5, "source_duration_seconds": 4.5},
]
ENCODING = [
    "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-maxrate", "4M", "-bufsize", "8M",
    "-profile:v", "high", "-level", "3.1", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-r", str(FPS), "-g", "48",
    "-movflags", "+faststart", "-threads", "4",
]


def load_helper(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg")
    args = parser.parse_args()
    ffmpeg = load_helper("ffmpeg_locator", "render-videos.py").find_ffmpeg(args.ffmpeg)
    helper = load_helper("stock_helpers", "render-stock-videos.py")
    source_hashes = {scene["path"]: helper.sha256(ROOT / scene["path"]) for scene in SCENES}
    # Four half-second overlaps yield 18 seconds. The repeated opening aerial
    # extends beyond the last overlap. A three-frame guard after the fade
    # accommodates frame rounding and removes residual blend at the seam.
    # Both ends return to the same camera position at the original speed.
    inputs = SCENES + [{**SCENES[0], "source_duration_seconds": 2.0}]
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-filter_complex_threads", "2"]
    filters = []
    for index, scene in enumerate(inputs):
        command += ["-ss", str(scene["source_start_seconds"]), "-i", str(ROOT / scene["path"])]
        filters.append(
            f"[{index}:v]trim=duration={scene['source_duration_seconds']},setpts=PTS-STARTPTS,"
            f"fps={FPS},settb=1/{FPS},format=yuv420p,"
            f"setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709[v{index}]"
        )
    offsets = []
    elapsed = 0
    for scene in SCENES:
        elapsed += scene["source_duration_seconds"] - FADE
        offsets.append(elapsed)
    assert offsets == [4.0, 10.0, 14.0, 18.0]
    assert elapsed == DURATION
    previous = "v0"
    for index, offset in enumerate(offsets, start=1):
        label = f"mix{index}"
        filters.append(f"[{previous}][v{index}]xfade=transition=fade:duration={FADE}:offset={offset},fps=24[{label}]")
        previous = label
    filters.append(f"[{previous}]trim=start={LOOP_START}:duration={DURATION},setpts=PTS-STARTPTS[out]")
    output = VIDEO / "medellin-location.mp4"
    poster = VIDEO / "medellin-location-poster.jpg"
    helper.run([*command, "-filter_complex", ";".join(filters), "-map", "[out]", *ENCODING, "-t", str(DURATION), str(output)])
    output_metadata = helper.validate(ffmpeg, output)
    load_helper("latest_import", "import-latest-stock.py").verify_faststart(output)
    if output_metadata["duration_seconds"] != DURATION or "24 fps" not in output_metadata["video_stream"]:
        raise RuntimeError(f"Unexpected location film timing: {output_metadata}")
    if output_metadata["bytes"] >= 10_000_000:
        raise RuntimeError("Location film exceeds the 10 MB target")
    helper.poster(ffmpeg, output, poster)
    for source, original_hash in source_hashes.items():
        if helper.sha256(ROOT / source) != original_hash:
            raise RuntimeError(f"Source footage changed during rendering: {source}")
    provenance = {
        "file": output.relative_to(ROOT).as_posix(), **output_metadata,
        "poster": poster.relative_to(ROOT).as_posix(), "poster_sha256": helper.sha256(poster),
        "method": "City aerial, dining preparation and city sidewalk footage at their original speed, framing and color, joined with restrained dissolves. This film contains no countryside footage. No generated imagery or synthetic human movement. The dining footage illustrates city experiences and does not identify a restaurant, shooting location or Lola & Ber service.",
        "sources": [{**scene, "sha256": source_hashes[scene["path"]]} for scene in SCENES],
        "source_provenance": ["assets/video/stock/provenance.json", "assets/video/stock/latest-provenance.json"],
        "timeline": [
            {"start_seconds": 0, "end_seconds": 4 - LOOP_START, "content": "City aerial"},
            {"start_seconds": 4 - LOOP_START, "end_seconds": 4.5 - LOOP_START, "content": "City-to-dining dissolve"},
            {"start_seconds": 4.5 - LOOP_START, "end_seconds": 10 - LOOP_START, "content": "Chefs preparing and plating food"},
            {"start_seconds": 10 - LOOP_START, "end_seconds": 10.5 - LOOP_START, "content": "Dining-to-sidewalk dissolve"},
            {"start_seconds": 10.5 - LOOP_START, "end_seconds": 14 - LOOP_START, "content": "City sidewalk lifestyle"},
            {"start_seconds": 14 - LOOP_START, "end_seconds": 14.5 - LOOP_START, "content": "Sidewalk-to-city dissolve"},
            {"start_seconds": 14.5 - LOOP_START, "end_seconds": 18 - LOOP_START, "content": "City aerial"},
            {"start_seconds": 18 - LOOP_START, "end_seconds": 18.5 - LOOP_START, "content": "Aerial dissolve, returning to the opening camera position"},
            {"start_seconds": 18.5 - LOOP_START, "end_seconds": DURATION, "content": "Opening city aerial, completing the seamless loop"},
        ],
        "crossfade_seconds": FADE,
        "untrimmed_crossfade_offsets_seconds": offsets,
        "loop_trim_start_seconds": LOOP_START,
        "loop_guard_frames": 3,
        "location_note": "ENVIGADO is visible on a bus in the sidewalk source; exact shooting locations are not independently verified. Stock people are illustrative, not Dulcinea team members or identified Lola & Ber personnel. No property dining-service claim is implied.",
        "render_script": "scripts/render-location.py", "encoding_options": ENCODING,
        "validation": "Complete output decoded successfully; verified silent H.264 1280x720 at 24 fps, 18 seconds, faststart and below 10 MB. All source SHA-256 hashes match their pre-render values.",
    }
    (VIDEO / "location-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output_metadata, indent=2))


if __name__ == "__main__":
    main()
