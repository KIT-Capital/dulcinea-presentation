"""Render five silent nine-second camera-motion loops from retained property PNGs.

Usage: python scripts/render-property-videos.py [--ffmpeg /path/to/ffmpeg]
FFmpeg can be on PATH or supplied by optional imageio-ffmpeg. Source PNGs are
unchanged. These animate AI-generated still illustrations, not filmed footage;
there is no synthesized human movement, interpolation or architectural change.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import shutil
import struct
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT, FPS, SECONDS = 1280, 720, 24, 9
FRAMES = FPS * SECONDS
SLUGS = ("san-lucas", "aires", "fontanar", "monte-sereno", "montana")
# Subject-safe framing: both 3:2 sources lose only ceiling/foreground on the
# initial 16:9 crop. All people remain inside the frame throughout the motion.
SPECS = {
    "san-lucas": {"crop_y": 0.44, "x": 0.42, "drift": 0.06, "y": 0.46},
    "aires": {"crop_y": 0.50, "x": 0.52, "drift": -0.05, "y": 0.49},
    "fontanar": {"crop_y": 0.46, "x": 0.50, "drift": 0.05, "y": 0.52},
    "monte-sereno": {"crop_y": 0.50, "x": 0.46, "drift": 0.05, "y": 0.54},
    "montana": {"crop_y": 0.50, "x": 0.56, "drift": -0.04, "y": 0.51},
}


def find_ffmpeg(override):
    if override:
        return override
    found = shutil.which("ffmpeg")
    if found:
        return found
    runtime = ROOT.parent / "runtime"
    if runtime.exists():
        sys.path.insert(0, str(runtime))
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as error:
        raise SystemExit("Supply --ffmpeg, put FFmpeg on PATH, or install imageio-ffmpeg.") from error


def run(command, binary=False):
    result = subprocess.run(command, capture_output=True, text=not binary)
    if result.returncode:
        detail = result.stderr.decode(errors="replace") if binary else result.stderr
        raise RuntimeError(detail)
    return result.stdout


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def png_dimensions(path):
    with path.open("rb") as handle:
        header = handle.read(24)
    if header[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Not a PNG: {path}")
    return struct.unpack(">II", header[16:24])


def camera_filter(spec, endpoints=False):
    # Endpoint mode evaluates frame positions 0 and 215 without rendering the
    # intervening frames, for an exact uncompressed framing/hash comparison.
    index = f"(on*{FRAMES - 1})" if endpoints else "on"
    phase = f"(0.5-0.5*cos(2*PI*{index}/{FRAMES - 1}))"
    zoom = f"1.008+0.027*{phase}"
    x = f"(iw-iw/zoom)*({spec['x']}+{spec['drift']}*{phase})"
    y = f"(ih-ih/zoom)*{spec['y']}"
    count = 2 if endpoints else FRAMES
    return (
        "scale=3840:2160:force_original_aspect_ratio=increase:flags=lanczos:"
        "out_range=tv:out_color_matrix=bt709,"
        f"crop=3840:2160:(iw-ow)/2:(ih-oh)*{spec['crop_y']},"
        "setsar=1,format=yuv420p,"
        f"zoompan=z='{zoom}':x='{x}':y='{y}':d={count}:s={WIDTH}x{HEIGHT}:fps={FPS},"
        "format=yuv420p,setparams=range=limited:color_primaries=bt709:"
        "color_trc=bt709:colorspace=bt709"
    )


def fast_start(path):
    boxes = []
    with path.open("rb") as handle:
        while True:
            header = handle.read(8)
            if len(header) < 8:
                break
            size, kind = struct.unpack(">I4s", header)
            header_size = 8
            if size == 1:
                size = struct.unpack(">Q", handle.read(8))[0]
                header_size = 16
            boxes.append(kind.decode("ascii", errors="replace"))
            if size == 0:
                break
            if size < header_size:
                raise ValueError("Invalid MP4 top-level box")
            handle.seek(size-header_size, 1)
    return "moov" in boxes and "mdat" in boxes and boxes.index("moov") < boxes.index("mdat")


def render(ffmpeg, source_dir, output_dir, review_dir, slug):
    source = source_dir / f"{slug}.png"
    output = output_dir / f"{slug}.mp4"
    spec = SPECS[slug]
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
               "-vf", camera_filter(spec), "-frames:v", str(FRAMES), "-an",
               "-c:v", "libx264", "-preset", "slow", "-crf", "22",
               "-maxrate", "1400k", "-bufsize", "2800k", "-profile:v", "high",
               "-level", "3.1", "-pix_fmt", "yuv420p", "-r", str(FPS),
               "-g", str(FPS * 2), "-keyint_min", str(FPS * 2), "-sc_threshold", "0",
               "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709",
               "-color_trc", "bt709", "-movflags", "+faststart", "-map_metadata", "-1",
               "-threads", "2", str(output)]
    print(f"Rendering {slug}", flush=True)
    run(command)
    if output.stat().st_size >= 2_000_000:
        raise RuntimeError(f"{slug} exceeds the 2 MB per-clip budget")
    # Decode every output frame and inspect the stream, rather than just its header.
    run([ffmpeg, "-hide_banner", "-v", "error", "-i", str(output), "-f", "null", "-"])
    info = subprocess.run([ffmpeg, "-hide_banner", "-i", str(output)], capture_output=True, text=True).stderr
    if not all(value in info for value in ("Video: h264", "1280x720", "24 fps", "00:00:09.00")) or "Audio:" in info:
        raise RuntimeError(f"Unexpected stream properties for {slug}: {info}")
    if not fast_start(output):
        raise RuntimeError(f"Missing fast-start box ordering for {slug}")

    hashes = run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(source),
                  "-vf", camera_filter(spec, endpoints=True), "-frames:v", "2",
                  "-an", "-f", "framemd5", "-"])
    endpoint_hashes = [line.split(",")[-1].strip() for line in hashes.splitlines() if line and not line.startswith("#")]
    if len(endpoint_hashes) != 2 or endpoint_hashes[0] != endpoint_hashes[1]:
        raise RuntimeError(f"Uncompressed loop endpoints do not match for {slug}")
    (review_dir / f"{slug}-endpoint-framemd5.txt").write_text(hashes, encoding="utf-8")
    # Review samples from the actual encoded stream: first, midpoint, last.
    selection = f"select='eq(n,0)+eq(n,{FRAMES//2})+eq(n,{FRAMES-1})'"
    run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(output),
         "-vf", selection, "-fps_mode", "vfr", "-frames:v", "3",
         str(review_dir / f"{slug}-%02d.png")])
    encoded_frames = run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(output),
                          "-vf", f"select='eq(n,0)+eq(n,{FRAMES-1})'", "-fps_mode", "vfr",
                          "-frames:v", "2", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], binary=True)
    frame_size = WIDTH * HEIGHT * 3
    if len(encoded_frames) != frame_size * 2:
        raise RuntimeError(f"Incorrect endpoint frame count for {slug}")
    first, last = encoded_frames[:frame_size], encoded_frames[frame_size:]
    seam_mae = sum(abs(a-b) for a,b in zip(first,last)) / frame_size
    print(f"Verified {slug}: {output.stat().st_size:,} bytes, seam MAE {seam_mae:.3f}/255", flush=True)
    return {
        "slug": slug, "file": f"assets/video/properties/{slug}.mp4",
        "source": f"assets/images/lifestyle/{slug}.png", "source_sha256": sha256(source),
        "source_dimensions": list(png_dimensions(source)), "sha256": sha256(output),
        "bytes": output.stat().st_size, "seconds": SECONDS, "frames": FRAMES, "fps": FPS,
        "dimensions": [WIDTH, HEIGHT], "codec": "H.264 High / yuv420p", "audio_tracks": 0,
        "fast_start": True, "encoding": {"preset": "slow", "crf": 22, "maxrate": "1400k", "bufsize": "2800k", "threads": 2},
        "camera": dict(spec, zoom_min=1.008, zoom_max=1.035,
                       easing="0.5 - 0.5*cos(2*pi*frame/215); same position and zero speed at both ends"),
        "verification": {"full_stream_decode": "pass", "uncompressed_endpoint_md5": endpoint_hashes,
                         "uncompressed_endpoints_identical": True,
                         "encoded_endpoint_sha256": [hashlib.sha256(first).hexdigest(), hashlib.sha256(last).hexdigest()],
                         "encoded_endpoint_mean_absolute_rgb_difference_0_to_255": seam_mae,
                         "note": "Lossy encoded endpoint hashes can differ although the pre-encode framing is exactly identical."},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg")
    parser.add_argument("--source-dir", type=Path, default=ROOT / "assets/images/lifestyle")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "assets/video/properties")
    parser.add_argument("--review-dir", type=Path, default=ROOT.parent / "property-video-review")
    parser.add_argument("--workers", type=int, default=2)
    args = parser.parse_args()
    ffmpeg = find_ffmpeg(args.ffmpeg)
    for folder in (args.output_dir, args.review_dir, args.output_dir / "metadata"):
        folder.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=max(1,args.workers)) as executor:
        videos = list(executor.map(lambda slug: render(ffmpeg,args.source_dir,args.output_dir,args.review_dir,slug),SLUGS))
    metadata = {
        "method": "Gentle looping camera motion applied to AI-generated still property illustrations. Animated stills, not filmed footage.",
        "people": "Adults are fictional and remain still. No fabricated human movement, frame interpolation or generative video.",
        "source_handling": "Retained PNGs unchanged; 16:9 crop, then 0.8-3.5 percent eased zoom with slight pan. Architecture and all depicted adults remain in frame.",
        "render_script": "scripts/render-property-videos.py",
        "tool": subprocess.check_output([ffmpeg,"-version"],text=True).splitlines()[0],
        "total_bytes": sum(v["bytes"] for v in videos), "videos": videos,
    }
    (args.output_dir / "metadata/provenance.json").write_text(json.dumps(metadata,indent=2)+"\n",encoding="utf-8")
    print(f"Ready: five clips, {metadata['total_bytes']:,} total bytes",flush=True)


if __name__ == "__main__":
    main()
