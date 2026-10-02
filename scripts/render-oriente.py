"""Render El Oriente's reservoir / countryside loop from supplied footage.

Usage: python scripts/render-oriente.py [--ffmpeg /path/to/ffmpeg]
The countryside woman appears only in this chapter, framed by landscape footage.
"""

import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "assets" / "video"
FPS, FADE, DURATION = 24, 0.75, 24.0
LOOP_START = FADE + 3 / FPS
SCENES = [
    {"id": "501694199", "subject": "El Oriente reservoir aerial", "path": "assets/video/stock/AdobeStock_501694199.mp4", "source_start_seconds": 0, "source_duration_seconds": 8.75},
    {"id": "539938219", "subject": "Adult woman outdoors in a green pasture", "path": "assets/video/stock/AdobeStock_539938219.mp4", "source_start_seconds": 0, "source_duration_seconds": 5.5},
    {"id": "501694199", "subject": "Reservoir and green countryside", "path": "assets/video/stock/AdobeStock_501694199.mp4", "source_start_seconds": 12, "source_duration_seconds": 12},
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
    hashes = [helper.sha256(ROOT / scene["path"]) for scene in SCENES]
    inputs = SCENES + [{**SCENES[0], "source_duration_seconds": 1.5}]
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-filter_complex_threads", "2"]
    filters = []
    for index, scene in enumerate(inputs):
        command += ["-ss", str(scene["source_start_seconds"]), "-i", str(ROOT / scene["path"])]
        filters.append(
            f"[{index}:v]trim=duration={scene['source_duration_seconds']},setpts=PTS-STARTPTS,"
            f"fps={FPS},settb=1/{FPS},setsar=1,format=yuv420p,"
            f"setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709[v{index}]"
        )
    previous = "v0"
    for index, offset in enumerate([8, 12.75, 24], start=1):
        label = f"mix{index}"
        filters.append(f"[{previous}][v{index}]xfade=transition=fade:duration={FADE}:offset={offset},fps={FPS}[{label}]")
        previous = label
    filters.append(f"[{previous}]trim=start={LOOP_START}:duration={DURATION},setpts=PTS-STARTPTS[out]")
    output = VIDEO / "oriente-country.mp4"
    poster = VIDEO / "oriente-country-poster.jpg"
    helper.run([*command, "-filter_complex", ";".join(filters), "-map", "[out]", *helper.encoder(), "-t", str(DURATION), str(output)])
    metadata = helper.validate(ffmpeg, output)
    load_helper("mp4_validation", "import-latest-stock.py").verify_faststart(output)
    if abs(metadata["duration_seconds"] - DURATION) > 1 / FPS or metadata["bytes"] >= 15_000_000:
        raise RuntimeError("Unexpected El Oriente film duration or size")
    if hashes != [helper.sha256(ROOT / scene["path"]) for scene in SCENES]:
        raise RuntimeError("A source file changed")
    helper.poster(ffmpeg, output, poster)
    provenance = {
        "file": output.name, **metadata,
        "poster": poster.relative_to(ROOT).as_posix(), "poster_sha256": helper.sha256(poster),
        "method": "Supplied reservoir and countryside footage at original speed and framing with 0.75-second dissolves. Landscape footage separates the countryside woman from the city-walking footage in the following chapter. No generated imagery or synthetic human movement.",
        "sources": [{**scene, "sha256": digest} for scene, digest in zip(SCENES, hashes)],
        "timeline": [
            {"start_seconds": 0, "end_seconds": 7.125, "content": "El Oriente reservoir aerial"},
            {"start_seconds": 7.125, "end_seconds": 7.875, "content": "Reservoir-to-pasture dissolve"},
            {"start_seconds": 7.875, "end_seconds": 11.875, "content": "Woman outdoors in a pasture"},
            {"start_seconds": 11.875, "end_seconds": 12.625, "content": "Pasture-to-reservoir dissolve"},
            {"start_seconds": 12.625, "end_seconds": 23.125, "content": "Reservoir and green countryside"},
            {"start_seconds": 23.125, "end_seconds": 23.875, "content": "Dissolve back to opening aerial position"},
            {"start_seconds": 23.875, "end_seconds": 24, "content": "Opening aerial with dissolve fully complete"},
        ],
        "crossfade_seconds": FADE,
        "loop_method": "Repeat the opening source after the last dissolve, trimming both endpoints at matching camera positions.",
        "location_note": "The user identifies the reservoir footage as El Oriente. The pasture clip's filming location is unverified. These scenes do not depict or establish views from the portfolio homes.",
        "render_script": "scripts/render-oriente.py", "encoding_options": helper.encoder(),
        "validation": "Full stream decoded; silent H.264 1280x720 at 24 fps, 24 seconds, faststart, original source hashes unchanged.",
    }
    (VIDEO / "oriente-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: provenance[key] for key in ("file", "bytes", "duration_seconds", "audio_tracks")}, indent=2))


if __name__ == "__main__":
    main()
