"""Render the separate 12-second kitchen / countryside hospitality loop.

Usage: python scripts/render-hospitality.py [--ffmpeg /path/to/ffmpeg]
Uses retained optimized stock clips. The city walker stays in chapter two;
the countryside woman appears here in chapter four, after the nightlife chapter.
"""

import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "assets" / "video"
FPS = 24
FADE = 0.75
LOOP_START = 0.875
DURATION = 12.0
SCENES = [
    {"id": "80490822", "subject": "Chefs preparing and plating food in a professional kitchen", "path": "assets/video/stock/AdobeStock_80490822.mp4", "source_start_seconds": 2.0, "source_duration_seconds": 8.0},
    {"id": "539938219", "subject": "Woman smiling and waving in a pasture with cattle", "path": "assets/video/stock/AdobeStock_539938219.mp4", "source_start_seconds": 0.0, "source_duration_seconds": 5.5},
]


def load_helper(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def render_hospitality(ffmpeg):
    helper = load_helper("stock_helpers", "render-stock-videos.py")
    inputs = SCENES + [{**SCENES[0], "source_duration_seconds": 1.5}]
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-filter_complex_threads", "2"]
    filters = []
    for index, scene in enumerate(inputs):
        command += ["-ss", str(scene["source_start_seconds"]), "-i", str(ROOT / scene["path"])]
        filters.append(
            f"[{index}:v]trim=duration={scene['source_duration_seconds']},setpts=PTS-STARTPTS,"
            f"fps={FPS},settb=1/{FPS},format=yuv420p,"
            f"setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709[v{index}]"
        )
    previous = "v0"
    for index, offset in enumerate([7.25, 12.0], start=1):
        label = f"mix{index}"
        filters.append(f"[{previous}][v{index}]xfade=transition=fade:duration={FADE}:offset={offset},fps={FPS}[{label}]")
        previous = label
    filters.append(f"[{previous}]trim=start={LOOP_START}:duration={DURATION},setpts=PTS-STARTPTS[out]")
    output = VIDEO / "hospitality-people.mp4"
    poster = VIDEO / "hospitality-people-poster.jpg"
    helper.run([*command, "-filter_complex", ";".join(filters), "-map", "[out]", *helper.encoder(), "-t", str(DURATION), str(output)])
    metadata = helper.validate(ffmpeg, output)
    load_helper("mp4_validation", "import-latest-stock.py").verify_faststart(output)
    if metadata["bytes"] >= 10_000_000:
        raise RuntimeError("Hospitality film exceeds the 10 MB target")
    helper.poster(ffmpeg, output, poster)
    provenance = {
        "file": output.name, **metadata,
        "poster": poster.relative_to(ROOT).as_posix(), "poster_sha256": helper.sha256(poster),
        "method": "Supplied kitchen and countryside footage at original speed, framing and color, joined with 0.75-second dissolves. The city walker is used only in the earlier city-location chapter. No generated imagery or synthetic human movement.",
        "sources": [{**scene, "sha256": helper.sha256(ROOT / scene["path"])} for scene in SCENES],
        "source_provenance": ["assets/video/stock/provenance.json"],
        "timeline": [
            {"start_seconds": 0, "end_seconds": 6.375, "content": "Chefs preparing food"},
            {"start_seconds": 6.375, "end_seconds": 7.125, "content": "Kitchen-to-countryside dissolve"},
            {"start_seconds": 7.125, "end_seconds": 11.125, "content": "Woman in a pasture"},
            {"start_seconds": 11.125, "end_seconds": 11.875, "content": "Countryside-to-kitchen dissolve"},
            {"start_seconds": 11.875, "end_seconds": 12, "content": "Kitchen, returning to opening camera position"},
        ],
        "crossfade_seconds": FADE,
        "loop_method": "Repeat the opening kitchen source after the last dissolve and trim both endpoints at matching camera positions.",
        "location_note": "The scenes are illustrative hospitality and countryside footage; precise shooting locations are unverified. Stock people are not Dulcinea team members.",
        "render_script": "scripts/render-hospitality.py",
        "encoding_options": helper.encoder(),
        "validation": "Complete output decoded successfully; silent H.264 1280x720 at 24 fps, 12 seconds, faststart and below 10 MB.",
    }
    (VIDEO / "hospitality-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    return provenance


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg")
    args = parser.parse_args()
    ffmpeg = load_helper("ffmpeg_locator", "render-videos.py").find_ffmpeg(args.ffmpeg)
    provenance = render_hospitality(ffmpeg)
    master_path = VIDEO / "provenance.json"
    master = json.loads(master_path.read_text(encoding="utf-8"))
    master["videos"] = [provenance if video["file"] == "hospitality-people.mp4" else video for video in master["videos"]]
    master["render_scripts"]["hospitality"] = "scripts/render-hospitality.py"
    master_path.write_text(json.dumps(master, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: provenance[key] for key in ("file", "bytes", "duration_seconds", "video_stream", "audio_tracks")}, indent=2))


if __name__ == "__main__":
    main()
