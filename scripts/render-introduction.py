"""Build the silent city and town introduction from supplied stock.

Usage: python scripts/render-introduction.py [--ffmpeg /path/to/ffmpeg] [--keep-poster]
Reuses the retained optimized MP4s; original MOV files remain untouched.
Only replaces the introduction, its poster and its provenance entry.
"""

import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "assets" / "video"
FPS = 24
FADE = 15 / FPS  # Frame-aligned, approximately 0.6 seconds.
SCENES = [
    {"id": "693150796", "subject": "City towers and green streets", "start_seconds": 0, "duration_seconds": 6.625},
    {"id": "1849343666", "subject": "Colonial town square with pedestrians", "start_seconds": 0, "duration_seconds": 6.625},
]


def load_helper(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def render_intro(ffmpeg, *, update_poster=True):
    helper = load_helper("stock_renderer", "render-stock-videos.py")
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-filter_complex_threads", "2"]
    inputs = SCENES + [{**SCENES[0], "duration_seconds": FADE + 0.25}]
    filters = []
    for index, scene in enumerate(inputs):
        source = VIDEO / "stock" / f"AdobeStock_{scene['id']}.mp4"
        command += ["-ss", str(scene["start_seconds"]), "-i", str(source)]
        filters.append(
            f"[{index}:v]trim=duration={scene['duration_seconds']},setpts=PTS-STARTPTS,"
            f"fps={FPS},settb=1/{FPS},format=yuv420p,"
            f"setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709[v{index}]"
        )
    offset = 0
    previous = "v0"
    for index in range(1, len(inputs)):
        offset += inputs[index - 1]["duration_seconds"] - FADE
        filters.append(f"[{previous}][v{index}]xfade=transition=fade:duration={FADE}:offset={offset},fps={FPS}[mix{index}]")
        previous = f"mix{index}"
    duration = sum(scene["duration_seconds"] - FADE for scene in SCENES)
    filters.append(f"[{previous}]trim=start={FADE}:duration={duration},setpts=PTS-STARTPTS[out]")
    output = VIDEO / "dulcinea-introduction.mp4"
    encoding = [
        "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-maxrate", "6M", "-bufsize", "12M",
        "-profile:v", "high", "-level", "3.1", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-r", str(FPS), "-g", str(FPS * 2),
        "-movflags", "+faststart", "-threads", "4",
    ]
    helper.run([*command, "-filter_complex", ";".join(filters), "-map", "[out]", *encoding, "-t", str(duration), str(output)])
    metadata = helper.validate(ffmpeg, output)
    if update_poster:
        helper.poster(ffmpeg, output, VIDEO / "dulcinea-introduction-poster.jpg")
    return {
        "file": output.name, **metadata, "scenes": SCENES,
        "crossfade_seconds": FADE,
        "method": "Actual supplied city and town footage at original speed; circular dissolves; no synthetic scene generation.",
        "loop_method": "Repeat the first city segment after the final dissolve, then trim at matching city camera positions.",
        "render_script": "scripts/render-introduction.py",
        "encoding_options": encoding,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg")
    parser.add_argument("--keep-poster", action="store_true", help="Preserve the existing city poster.")
    args = parser.parse_args()
    ffmpeg = load_helper("ffmpeg_locator", "render-videos.py").find_ffmpeg(args.ffmpeg)
    metadata = render_intro(ffmpeg, update_poster=not args.keep_poster)
    path = VIDEO / "provenance.json"
    provenance = json.loads(path.read_text(encoding="utf-8-sig"))
    provenance["videos"] = [metadata if video["file"] == metadata["file"] else video for video in provenance["videos"]]
    provenance["unused_in_main_presentation"] = []
    provenance["render_scripts"] = {"introduction": "scripts/render-introduction.py", "hospitality": "scripts/render-stock-videos.py"}
    path.write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
