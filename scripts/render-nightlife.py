"""Create a silent nightlife loop from the two user-supplied Adobe Stock stills.

python scripts/render-nightlife.py
Optional initial import: --source-dir "/path/to/Stock Photos"
Uses FFmpeg, supplied through PATH, --ffmpeg, or imageio-ffmpeg.
Motion is a photographic pan/zoom; no human or event motion is synthesized.
"""

import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "assets" / "images" / "stock"
VIDEO = ROOT / "assets" / "video"
FPS = 24
SCENE_SECONDS = 7.5
SOURCES = [
    {"file": "AdobeStock_70649459.jpeg", "description": "DJ, stage lights and a concert crowd; RECORD Dance Radio artwork remains visible",
     "crop_y": "ih-oh", "zoom_start": 1.012, "zoom_end": 1.063, "x_start": 0.45, "x_end": 0.55, "y": 0.78},
    {"file": "AdobeStock_99551296.jpeg", "description": "DJ mixing with people dancing in the background",
     "crop_y": "0", "zoom_start": 1.058, "zoom_end": 1.012, "x_start": 0.56, "x_end": 0.43, "y": 0.28},
]


def load_module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path)
    parser.add_argument("--ffmpeg")
    args = parser.parse_args()
    still = load_module("still_renderer", "render-videos.py")
    stock = load_module("stock_renderer", "render-stock-videos.py")
    ffmpeg = still.find_ffmpeg(args.ffmpeg)
    IMAGES.mkdir(parents=True, exist_ok=True)
    VIDEO.mkdir(parents=True, exist_ok=True)
    if args.source_dir:
        for source in SOURCES:
            original = args.source_dir / source["file"]
            target = IMAGES / source["file"]
            if original.resolve() != target.resolve():
                shutil.copy2(original, target)
    filters = []
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-filter_complex_threads", "2"]
    for i, source in enumerate(SOURCES + [SOURCES[0]]):
        command += ["-i", str(IMAGES / source["file"])]
        frames = round((1.5 if i == 2 else SCENE_SECONDS) * FPS)
        phase = f"(0.5-0.5*cos(PI*on/{round(SCENE_SECONDS * FPS) - 1}))"
        zoom = f"{source['zoom_start']}+({source['zoom_end']}-{source['zoom_start']})*{phase}"
        x = f"(iw-iw/zoom)*({source['x_start']}+({source['x_end']}-{source['x_start']})*{phase})"
        y = f"(ih-ih/zoom)*{source['y']}"
        filters.append(
            f"[{i}:v]scale=3840:2160:force_original_aspect_ratio=increase:flags=lanczos:out_range=tv:out_color_matrix=bt709,"
            f"crop=3840:2160:(iw-ow)/2:{source['crop_y']},format=yuv420p,setsar=1,"
            f"zoompan=z='{zoom}':x='{x}':y='{y}':d={frames}:s=1280x720:fps={FPS},"
            f"setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709,"
            f"settb=1/{FPS},setpts=PTS-STARTPTS,fps={FPS}[v{i}]"
        )
    filters += [
        "[v0][v1]xfade=transition=fade:duration=1:offset=6.5,fps=24[mix1]",
        "[mix1][v2]xfade=transition=fade:duration=1:offset=13,fps=24[mix2]",
        "[mix2]trim=start=1.125:duration=13,setpts=PTS-STARTPTS[out]",
    ]
    output = VIDEO / "medellin-nightlife.mp4"
    print("Rendering 13-second nightlife loop", flush=True)
    stock.run([*command, "-filter_complex", ";".join(filters), "-map", "[out]", *stock.encoder(), "-t", "13", str(output)])
    metadata = stock.validate(ffmpeg, output)
    stock.poster(ffmpeg, output, VIDEO / "medellin-nightlife-poster.jpg")
    sources = [{**source, "path": (IMAGES / source["file"]).relative_to(ROOT).as_posix(),
                "bytes": (IMAGES / source["file"]).stat().st_size,
                "sha256": hashlib.sha256((IMAGES / source["file"]).read_bytes()).hexdigest()} for source in SOURCES]
    provenance = {
        "source": "Two Adobe Stock JPEG images supplied by the user; original images copied without modification.",
        "method": "Photographic pan/zoom with two one-second circular dissolves; rendered from still images, not filmed nightlife footage. No human motion synthesized.",
        "artwork": "Visible RECORD Dance Radio artwork in AdobeStock_70649459.jpeg is retained, not removed or obscured.",
        "location_note": "Nightlife imagery is illustrative; the location and venue are not independently verified as Medellin.",
        "rights": "Images supplied by the user; no independent license verification or additional stock purchase performed.",
        "sources": sources, "video": {"file": output.name, **metadata},
        "encoding": {"width": 1280, "height": 720, "fps": FPS, "codec": "H.264 High", "color_space": "Rec.709", "color_range": "limited", "audio_tracks": 0, "fast_start": True},
        "render_script": "scripts/render-nightlife.py",
        "validation": "Complete output decoded successfully; silent H.264, 1280x720 and exact duration verified.",
    }
    (VIDEO / "medellin-nightlife-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print(f"Verified {output.name}: {metadata['duration_seconds']} seconds, {metadata['bytes']:,} bytes", flush=True)


if __name__ == "__main__":
    main()
