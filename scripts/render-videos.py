"""Render silent, seamlessly looping presentation videos from the supplied deck stills.

Usage: python scripts/render-videos.py --source-dir /path/to/extracted/ppt/media
Requires FFmpeg (on PATH, --ffmpeg, or the optional imageio-ffmpeg package).
The source images remain unchanged. These are animated stills, not filmed footage.
"""

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
FPS = 24
WIDTH, HEIGHT = 1280, 720
FADE = 1.0


def find_ffmpeg(override):
    if override:
        return override
    executable = shutil.which("ffmpeg")
    if executable:
        return executable
    local_runtime = ROOT.parent / "runtime"
    if local_runtime.exists():
        sys.path.insert(0, str(local_runtime))
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as error:
        raise SystemExit("Supply --ffmpeg or install imageio-ffmpeg in your local environment.") from error


def run(command):
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode:
        raise RuntimeError(completed.stderr)
    return completed.stderr


def source_filter(index, seconds, motion):
    # Three-times output resolution keeps the subpixel camera movement smooth.
    frames = round(seconds * FPS)
    full_frames = motion["full_frames"]
    phase = f"(0.5-0.5*cos(PI*on/{full_frames - 1}))"
    zoom = f"{motion['zoom_start']}+({motion['zoom_end']}-{motion['zoom_start']})*{phase}"
    x = f"(iw-iw/zoom)*({motion['x_start']}+({motion['x_end']}-{motion['x_start']})*{phase})"
    y = f"(ih-ih/zoom)*{motion['y']}"
    return (
        f"[{index}:v]scale=3840:2160:force_original_aspect_ratio=increase:flags=lanczos:out_range=tv:out_color_matrix=bt709,"
        f"crop=3840:2160,format=yuv420p,setsar=1,"
        f"zoompan=z='{zoom}':x='{x}':y='{y}':d={frames}:s={WIDTH}x{HEIGHT}:fps={FPS},"
        f"format=yuv420p,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709,"
        f"settb=1/{FPS},setpts=PTS-STARTPTS,fps={FPS}[v{index}]"
    )


def render(ffmpeg, source_dir, output_dir, spec):
    scenes = spec["scenes"]
    scene_seconds = spec["scene_seconds"]
    # Repeat the opening scene beyond the final dissolve, then cut the loop
    # where both ends show the same camera position with no residual blend.
    # A three-frame guard accommodates FFmpeg's frame rounding at EOF.
    loop_start = FADE + 3 / FPS
    inputs = scenes + [scenes[0]]
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-filter_complex_threads", "2"]
    filters = []
    for index, scene in enumerate(inputs):
        command += ["-i", str(source_dir / scene["image"])]
        motion = dict(scene["motion"], full_frames=round(scene_seconds * FPS))
        filters.append(source_filter(index, FADE + 0.5 if index == len(scenes) else scene_seconds, motion))
    previous = "v0"
    for index in range(1, len(inputs)):
        offset = index * (scene_seconds - FADE)
        filters.append(f"[{previous}][v{index}]xfade=transition=fade:duration={FADE}:offset={offset},fps={FPS}[mix{index}]")
        previous = f"mix{index}"
    duration = len(scenes) * (scene_seconds - FADE)
    filters.append(f"[{previous}]trim=start={loop_start}:duration={duration},setpts=PTS-STARTPTS[out]")
    output = output_dir / spec["filename"]
    command += [
        "-filter_complex", ";".join(filters), "-map", "[out]", "-an",
        "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-profile:v", "high",
        "-level", "3.1", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-r", str(FPS), "-g", str(2 * FPS),
        "-movflags", "+faststart", "-threads", "4", "-t", str(duration), str(output),
    ]
    print(f"Rendering {output.name} ({duration:.0f} seconds)", flush=True)
    run(command)
    # Decode every frame to verify the final stream, including its end and seam.
    run([ffmpeg, "-hide_banner", "-v", "error", "-i", str(output), "-f", "null", "-"])
    info = subprocess.run([ffmpeg, "-hide_banner", "-i", str(output)], capture_output=True, text=True).stderr
    duration_match = re.search(r"Duration: ([0-9:.]+)", info)
    if "Video: h264" not in info or "Audio:" in info or "1280x720" not in info:
        raise RuntimeError(f"Unexpected encoded stream: {info}")
    actual_duration = duration_match.group(1) if duration_match else "unknown"
    print(f"Verified {output.name}: {actual_duration}, {output.stat().st_size:,} bytes", flush=True)
    return {
        "file": spec["filename"], "bytes": output.stat().st_size,
        "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
        "duration_seconds": duration, "verified_duration": actual_duration,
        "width": WIDTH, "height": HEIGHT, "fps": FPS,
        "video_codec": "H.264 / AVC High profile", "pixel_format": "yuv420p",
        "color_space": "Rec.709", "color_range": "limited",
        "audio_tracks": 0, "fast_start": True, "crf": 23,
        "scene_seconds_before_overlap": scene_seconds,
        "crossfade_seconds": FADE, "loop": "Circular dissolve with matching opening camera position",
        "scenes": scenes,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, default=ROOT.parent / "source-deck" / "ppt" / "media")
    parser.add_argument("--ffmpeg")
    args = parser.parse_args()
    output_dir = ROOT / "assets" / "video"
    output_dir.mkdir(parents=True, exist_ok=True)
    ffmpeg = find_ffmpeg(args.ffmpeg)
    motion_in = {"zoom_start": 1.018, "zoom_end": 1.066, "x_start": 0.42, "x_end": 0.57, "y": 0.45}
    motion_out = {"zoom_start": 1.055, "zoom_end": 1.012, "x_start": 0.57, "x_end": 0.45, "y": 0.42}
    motion_people = {"zoom_start": 1.015, "zoom_end": 1.047, "x_start": 0.48, "x_end": 0.52, "y": 0.40}
    specs = [
        {"filename": "dulcinea-introduction.mp4", "scene_seconds": 7.0, "scenes": [
            {"image": "image1.png", "description": "Architecture exterior", "motion": motion_in},
            {"image": "image23.jpg", "description": "Adults relaxing together in a lounge", "motion": motion_people},
            {"image": "image7.jpeg", "description": "Medellin terrace and skyline", "motion": motion_out},
        ]},
        {"filename": "hospitality-people.mp4", "scene_seconds": 8.0, "scenes": [
            {"image": "image23.jpg", "description": "Adults relaxing together in a lounge", "motion": motion_people},
            {"image": "image22.jpg", "description": "Adults enjoying an evening gathering", "motion": motion_out},
        ]},
    ]
    source_names = sorted({scene["image"] for spec in specs for scene in spec["scenes"]})
    source_metadata = [{
        "package_path": "ppt/media/" + name,
        "sha256": hashlib.sha256((args.source_dir / name).read_bytes()).hexdigest(),
        "bytes": (args.source_dir / name).stat().st_size,
    } for name in source_names]
    videos = [render(ffmpeg, args.source_dir, output_dir, spec) for spec in specs]
    metadata = {
        "source": "Dulcinea - Investor Presentation 027.pptx (user supplied)",
        "method": "Rendered motion from still images using slow pan/zoom and smooth crossfades; not live filmed footage.",
        "rights": "Source imagery inherited from the user-supplied deck; no new third-party assets downloaded.",
        "image_handling": "Aspect ratio preserved. Center-crop to 16:9, gentle motion up to 6.6 percent zoom. Source files unchanged.",
        "encoding_tool": subprocess.check_output([ffmpeg, "-version"], text=True).splitlines()[0],
        "render_script": "scripts/render-videos.py", "sources": source_metadata, "videos": videos,
        "validation": "Both complete video streams decoded successfully; H.264, 1280x720, and no audio verified.",
    }
    (output_dir / "provenance.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
