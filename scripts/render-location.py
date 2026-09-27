"""Render the 12-second city / sidewalk loop for chapter two.

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
DURATION = 12.0
SCENES = [
    {"id": "693150796", "subject": "Aerial movement past city towers and green streets", "path": "assets/video/stock/AdobeStock_693150796.mp4", "source_start_seconds": 0, "source_duration_seconds": 4.5},
    {"id": "787505338", "subject": "Woman walking on a tree-lined city sidewalk beside traffic", "path": "assets/video/stock/AdobeStock_787505338.mp4", "source_start_seconds": 0, "source_duration_seconds": 4.5},
    {"id": "693150796", "subject": "Aerial movement past city towers and green streets", "path": "assets/video/stock/AdobeStock_693150796.mp4", "source_start_seconds": 5, "source_duration_seconds": 4.5},
]
ENCODING = [
    "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-maxrate", "7M", "-bufsize", "14M",
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
    # End on the opening aerial so the final dissolve makes the 12-second loop seamless.
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
    offsets = [4.0, 8.0, 12.0]
    previous = "v0"
    for index, offset in enumerate(offsets, start=1):
        label = f"mix{index}"
        filters.append(f"[{previous}][v{index}]xfade=transition=fade:duration={FADE}:offset={offset},fps=24[{label}]")
        previous = label
    filters.append(f"[{previous}]trim=start=0.5:duration={DURATION},setpts=PTS-STARTPTS[out]")
    output = VIDEO / "medellin-location.mp4"
    poster = VIDEO / "medellin-location-poster.jpg"
    helper.run([*command, "-filter_complex", ";".join(filters), "-map", "[out]", *ENCODING, "-t", str(DURATION), str(output)])
    output_metadata = helper.validate(ffmpeg, output)
    load_helper("latest_import", "import-latest-stock.py").verify_faststart(output)
    if output_metadata["bytes"] >= 10_000_000:
        raise RuntimeError("Location film exceeds the 10 MB target")
    helper.poster(ffmpeg, output, poster)
    provenance = {
        "file": output.relative_to(ROOT).as_posix(), **output_metadata,
        "poster": poster.relative_to(ROOT).as_posix(), "poster_sha256": helper.sha256(poster),
        "method": "City aerial and city sidewalk footage at their original speed, framing and color, joined with restrained dissolves. The countryside scene is used separately in the Lola & Ber hospitality chapter. No generated imagery or synthetic human movement.",
        "sources": [{**scene, "sha256": helper.sha256(ROOT / scene["path"])} for scene in SCENES],
        "source_provenance": ["assets/video/stock/provenance.json", "assets/video/stock/latest-provenance.json"],
        "timeline": [
            {"start_seconds": 0, "end_seconds": 3.5, "content": "City aerial"},
            {"start_seconds": 3.5, "end_seconds": 4, "content": "City-to-sidewalk dissolve"},
            {"start_seconds": 4, "end_seconds": 7.5, "content": "City sidewalk lifestyle"},
            {"start_seconds": 7.5, "end_seconds": 8, "content": "Sidewalk-to-city dissolve"},
            {"start_seconds": 8, "end_seconds": 11.5, "content": "Medellín city aerial"},
            {"start_seconds": 11.5, "end_seconds": 12, "content": "Aerial dissolve, returning to the opening camera position"},
        ],
        "crossfade_seconds": FADE,
        "location_note": "ENVIGADO is visible on a bus in the sidewalk source; exact shooting locations are not independently verified. Stock people are illustrative, not Dulcinea team members.",
        "render_script": "scripts/render-location.py", "encoding_options": ENCODING,
        "validation": "Complete output decoded successfully; verified silent H.264 1280x720 at 24 fps, 12 seconds, faststart and below 10 MB.",
    }
    (VIDEO / "location-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output_metadata, indent=2))


if __name__ == "__main__":
    main()
