"""Render a short, silent property-viewing loop from the supplied stock video.

Usage: python scripts/render-property-viewing.py --source /path/to/AdobeStock_762119818.mp4
Optional: --ffmpeg /path/to/ffmpeg
The external original remains unchanged. The 6-14 second excerpt is joined with
a half-second circular dissolve, yielding a 7.5-second loop.
The complete frame is resized to 1280x676, with a 0.15% aspect correction and no crop.
"""

import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STOCK = ROOT / "assets" / "video" / "stock"
SOURCE_START = 6.0
SOURCE_END = 14.0
FADE = 0.5
DURATION = SOURCE_END - SOURCE_START - FADE
FPS = 24
NORMALIZE = (
    "setpts=PTS-STARTPTS,fps=24,settb=1/24,"
    "scale=1280:676:flags=lanczos:out_range=tv:out_color_matrix=bt709,"
    "setsar=1,format=yuv420p,"
    "setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709"
)
ENCODING = [
    "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-maxrate", "6M", "-bufsize", "12M",
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
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--ffmpeg")
    args = parser.parse_args()
    ffmpeg = load_helper("ffmpeg_locator", "render-videos.py").find_ffmpeg(args.ffmpeg)
    helper = load_helper("stock_helpers", "render-stock-videos.py")
    output = STOCK / "AdobeStock_762119818.mp4"
    poster = STOCK / "AdobeStock_762119818-poster.jpg"
    if args.source.resolve() in (output.resolve(), poster.resolve()):
        raise ValueError("The source must be the external original, not an output path")
    source_stat = args.source.stat()
    original = helper.inspect(ffmpeg, args.source)
    filters = [
        f"[0:v]trim=duration=8,{NORMALIZE}[v0]",
        f"[1:v]trim=duration=0.75,{NORMALIZE}[v1]",
        "[v0][v1]xfade=transition=fade:duration=0.5:offset=7.5,fps=24[mix]",
        "[mix]trim=start=0.5:duration=7.5,setpts=PTS-STARTPTS[out]",
    ]
    helper.run([
        ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-filter_complex_threads", "2",
        "-threads", "2", "-ss", str(SOURCE_START), "-i", str(args.source),
        "-threads", "2", "-ss", str(SOURCE_START), "-i", str(args.source),
        "-filter_complex", ";".join(filters), "-map", "[out]", *ENCODING,
        "-t", str(DURATION), str(output),
    ])
    helper.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(output), "-f", "null", "-"])
    metadata = helper.inspect(ffmpeg, output)
    if ("h264" not in metadata["video_stream"] or "1280x676" not in metadata["video_stream"]
            or "24 fps" not in metadata["video_stream"] or metadata["audio_tracks"]
            or abs(metadata["duration_seconds"] - DURATION) > 1 / FPS):
        raise RuntimeError(f"Unexpected output encoding: {metadata}")
    load_helper("mp4_validation", "import-latest-stock.py").verify_faststart(output)
    helper.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-ss", "3", "-i", str(output),
                "-frames:v", "1", "-q:v", "2", str(poster)])
    current_stat = args.source.stat()
    if (source_stat.st_size, source_stat.st_mtime_ns) != (current_stat.st_size, current_stat.st_mtime_ns):
        raise RuntimeError("The original changed during rendering")
    provenance = {
        "id": "762119818",
        "subject": "Three adults in a bright, mostly unfurnished apartment. A suited man holding papers gestures around the room to a casually dressed couple; the scene reads as a property viewing.",
        "source": {"filename": args.source.name, **original, "unchanged": True},
        "output": {"path": output.relative_to(ROOT).as_posix(), **metadata},
        "poster": {"path": poster.relative_to(ROOT).as_posix(), "seconds": 3, "sha256": helper.sha256(poster)},
        "edit": {
            "source_range_seconds": [SOURCE_START, SOURCE_END],
            "source_duration_seconds": SOURCE_END - SOURCE_START,
            "output_duration_seconds": DURATION,
            "crossfade_seconds": FADE,
            "output_dissolve_interval_seconds": [7, 7.5],
            "loop_method": "Repeat the first 0.75 seconds of the selected excerpt, dissolve back to it, then trim at matching source positions. Half-second overlap makes the 8-second source excerpt a 7.5-second loop.",
            "geometry": "Complete original 2048x1080 frame is scaled to 1280x676 without cropping. The even output dimensions introduce only a 0.15 percent vertical aspect correction relative to 1280x675, avoiding a native FFmpeg failure with the odd-height intermediate. All three people remain within the original framing.",
            "motion": "Actual footage at original playback speed. Frame rate converted from 60 to 24 fps; no synthetic motion, generated imagery or optical-flow interpolation.",
        },
        "encoding_options": ENCODING, "normalization_filter": NORMALIZE,
        "render_script": "scripts/render-property-viewing.py",
        "watermark_review": "No visible watermark across six representative original frames.",
        "location_note": "Illustrative stock property-viewing scene; no specific location, Dulcinea property or team identity is asserted.",
        "validation": "Complete output decoded successfully; verified 7.5 seconds, silent H.264 yuv420p, 1280x676 at 24 fps and moov before mdat for fast start.",
    }
    (STOCK / "property-viewing-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
