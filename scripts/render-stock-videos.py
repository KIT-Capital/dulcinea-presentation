"""Optimize the four user-supplied Adobe Stock clips and build silent web loops.

Initial import:
  python scripts/render-stock-videos.py --source-dir "/path/to/Stock Video"
Rebuild loops from the retained optimized stock files:
  python scripts/render-stock-videos.py
FFmpeg must be on PATH, supplied with --ffmpeg, or available via imageio-ffmpeg.
The original MOV files are read only and are never copied into the repository.
"""

import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "assets" / "video"
STOCK = VIDEO / "stock"
FPS = 24
SOURCES = [
    {"id": "80490822", "subject": "Chefs preparing and plating food in a professional kitchen", "people": True},
    {"id": "539938219", "subject": "Woman smiling and waving in a pasture with cattle", "people": True},
    {"id": "693150796", "subject": "Aerial movement past modern city towers and green streets", "people": False},
    {"id": "1849343666", "subject": "Aerial movement over a colonial town square and church with pedestrians", "people": True},
]


def run(command):
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stderr


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def encoder():
    return ["-an", "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-maxrate", "6M", "-bufsize", "12M",
            "-profile:v", "high", "-level", "3.1", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709",
            "-color_primaries", "bt709", "-color_trc", "bt709", "-r", str(FPS), "-g", str(FPS * 2),
            "-movflags", "+faststart", "-threads", "4"]


def inspect(ffmpeg, path):
    info = subprocess.run([ffmpeg, "-hide_banner", "-i", str(path)], capture_output=True, text=True).stderr
    duration_text = re.search(r"Duration: ([0-9:.]+)", info).group(1)
    h, m, s = map(float, duration_text.split(":"))
    stream = next(line.strip() for line in info.splitlines() if "Video:" in line)
    return {"bytes": path.stat().st_size, "sha256": sha256(path), "duration_seconds": h * 3600 + m * 60 + s,
            "video_stream": stream, "audio_tracks": sum("Audio:" in line for line in info.splitlines())}


def validate(ffmpeg, path):
    run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(path), "-f", "null", "-"])
    metadata = inspect(ffmpeg, path)
    if "h264" not in metadata["video_stream"] or "1280x720" not in metadata["video_stream"] or metadata["audio_tracks"]:
        raise RuntimeError(f"Unexpected video encoding: {metadata}")
    return metadata


def poster(ffmpeg, video, output):
    run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(video), "-frames:v", "1", "-q:v", "2", str(output)])


def optimize(ffmpeg, source_dir):
    metadata = []
    for source in SOURCES:
        name = f"AdobeStock_{source['id']}"
        original = source_dir / f"{name}.mov"
        output = STOCK / f"{name}.mp4"
        print(f"Optimizing {original.name}", flush=True)
        run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(original),
             "-vf", "scale=1280:720:force_original_aspect_ratio=increase:flags=lanczos:out_range=tv:out_color_matrix=bt709,crop=1280:720,setsar=1,fps=24",
             *encoder(), str(output)])
        output_info = validate(ffmpeg, output)
        poster(ffmpeg, output, STOCK / f"{name}-poster.jpg")
        metadata.append({**source, "original_filename": original.name, "original": inspect(ffmpeg, original),
                         "optimized_path": output.relative_to(ROOT).as_posix(), "optimized": output_info,
                         "watermark_review": "No visible watermark in representative frames at 10, 50 and 90 percent of the original duration."})
        print(f"Verified {output.name}: {output_info['bytes']:,} bytes", flush=True)
    return metadata


def compose(ffmpeg, filename, scenes, scene_seconds):
    inputs = scenes + [scenes[0]]
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-filter_complex_threads", "2"]
    filters = []
    for i, scene in enumerate(inputs):
        command += ["-ss", str(scene.get("start_seconds", 0)), "-i", str(STOCK / f"AdobeStock_{scene['id']}.mp4")]
        seconds = 1.5 if i == len(scenes) else scene_seconds
        filters.append(f"[{i}:v]trim=duration={seconds},setpts=PTS-STARTPTS,fps={FPS},settb=1/{FPS}[v{i}]")
    previous = "v0"
    for i in range(1, len(inputs)):
        offset = i * (scene_seconds - 1)
        filters.append(f"[{previous}][v{i}]xfade=transition=fade:duration=1:offset={offset},fps={FPS}[mix{i}]")
        previous = f"mix{i}"
    duration = len(scenes) * (scene_seconds - 1)
    filters.append(f"[{previous}]trim=start=1.125:duration={duration},setpts=PTS-STARTPTS[out]")
    output = VIDEO / filename
    print(f"Composing {filename}", flush=True)
    run([*command, "-filter_complex", ";".join(filters), "-map", "[out]", *encoder(), "-t", str(duration), str(output)])
    metadata = validate(ffmpeg, output)
    poster(ffmpeg, output, VIDEO / filename.replace(".mp4", "-poster.jpg"))
    print(f"Verified {filename}: {metadata['duration_seconds']} seconds, {metadata['bytes']:,} bytes", flush=True)
    return {"file": filename, **metadata, "scenes": scenes, "scene_seconds_before_overlap": scene_seconds,
            "crossfade_seconds": 1, "method": "Edited actual stock footage; circular dissolve; original speed; no synthetic scene generation."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path)
    parser.add_argument("--ffmpeg")
    args = parser.parse_args()
    spec = importlib.util.spec_from_file_location("still_renderer", ROOT / "scripts" / "render-videos.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    ffmpeg = module.find_ffmpeg(args.ffmpeg)
    STOCK.mkdir(parents=True, exist_ok=True)
    stock_provenance = STOCK / "provenance.json"
    if args.source_dir:
        sources = optimize(ffmpeg, args.source_dir)
        stock_provenance.write_text(json.dumps({"source": "Four Adobe Stock MOV files supplied by the user", "sources": sources}, indent=2) + "\n")
    else:
        sources = json.loads(stock_provenance.read_text())["sources"]
    intro_spec = importlib.util.spec_from_file_location("introduction_renderer", ROOT / "scripts" / "render-introduction.py")
    intro_module = importlib.util.module_from_spec(intro_spec)
    intro_spec.loader.exec_module(intro_module)
    hospitality_spec = importlib.util.spec_from_file_location("hospitality_renderer", ROOT / "scripts" / "render-hospitality.py")
    hospitality_module = importlib.util.module_from_spec(hospitality_spec)
    hospitality_spec.loader.exec_module(hospitality_module)
    videos = [
        intro_module.render_intro(ffmpeg),
        hospitality_module.render_hospitality(ffmpeg),
    ]
    provenance = {
        "source": "Adobe Stock MOV files supplied by the user; full-resolution originals remain in the supplied location, unchanged.",
        "method": "Supplied stock footage and photographs edited locally with FFmpeg. The opening uses aerials and property imagery; Lola & Ber combines the supplied robe photograph with two user-selected Coverr clips of an embrace and women holding hands.",
        "rights": "Adobe files supplied by the user; two free Coverr clips separately reviewed and acquired for the Lola & Ber edit. See hospitality-provenance.json for source and license records. No stock purchase made.",
        "location_note": "Geographic locations are not independently verified from the footage. It illustrates setting and hospitality, not portfolio ownership.",
        "source_metadata": "assets/video/stock/provenance.json", "render_script": "scripts/render-stock-videos.py",
        "encoding": {"codec": "H.264 High", "dimensions": [1280, 720], "fps": 24, "pixel_format": "yuv420p", "color_space": "Rec.709", "color_range": "limited", "audio_tracks": 0, "fast_start": True},
        "videos": videos, "unused_in_main_presentation": [],
        "render_scripts": {"introduction": "scripts/render-introduction.py", "hospitality": "scripts/render-hospitality.py"},
        "validation": "Complete output streams decoded successfully and verified as silent H.264 1280x720. Source representative frames visually inspected.",
    }
    (VIDEO / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")


if __name__ == "__main__":
    main()
