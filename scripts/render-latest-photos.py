"""Render two six-second camera loops from the latest supplied stock photographs.

Usage: python scripts/render-latest-photos.py --ffmpeg /path/to/ffmpeg
Requires Pillow and FFmpeg. Optional --source-dir imports originals unchanged.
No AI, interpolation, face manipulation or synthesized human movement is used.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import shutil
import struct
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
FPS, WIDTH, HEIGHT, SECONDS = 24, 1280, 720, 6
FRAMES = FPS * SECONDS
SPECS = {
    "evening": {
        "filename": "AdobeStock_259715040.jpeg",
        "crop_x": .5,
        "crop_y": .58,
        "pan_x": .47,
        "drift_x": .04,
        "pan_y": .59,
        "description": "Supplied evening photograph of legs and shoes; the lower framing preserves the visible shoes and seated/standing arrangement.",
    },
    "city": {
        "filename": "AdobeStock_891890158.jpeg",
        "crop_x": .5,
        "crop_y": .5,
        "pan_x": .48,
        "drift_x": .06,
        "pan_y": .48,
        "description": "Supplied wide city photograph; centered framing preserves the valley, mountains and main towers.",
    },
}


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def relative(path):
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.name


def run(command, binary=False):
    result = subprocess.run(command, capture_output=True, text=not binary)
    if result.returncode:
        error = result.stderr.decode(errors="replace") if binary else result.stderr
        raise RuntimeError(error)
    return result.stdout


def find_ffmpeg(override):
    if override:
        return str(Path(override).resolve())
    found = shutil.which("ffmpeg")
    if found:
        return found
    sys.path.insert(0, str(ROOT.parent / "runtime"))
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as error:
        raise SystemExit("Supply --ffmpeg or put FFmpeg on PATH.") from error


def camera_filter(spec, endpoints=False):
    frame = f"on*{FRAMES-1}" if endpoints else "on"
    phase = f"(0.5-0.5*cos(2*PI*({frame})/{FRAMES-1}))"
    zoom = f"1.006+0.020*{phase}"
    return (
        "scale=3840:2160:force_original_aspect_ratio=increase:flags=lanczos,"
        f"crop=3840:2160:x='(iw-ow)*{spec['crop_x']}':y='(ih-oh)*{spec['crop_y']}',"
        f"zoompan=z='{zoom}':x='(iw-iw/zoom)*({spec['pan_x']}+{spec['drift_x']}*{phase})':"
        f"y='(ih-ih/zoom)*{spec['pan_y']}':d={2 if endpoints else FRAMES}:s={WIDTH}x{HEIGHT}:fps={FPS},"
        "scale=in_range=full:out_range=tv:out_color_matrix=bt709,setsar=1,format=yuv420p"
    )


def fast_start(path):
    atoms = []
    with path.open("rb") as handle:
        while True:
            head = handle.read(8)
            if len(head) != 8:
                break
            length, kind = struct.unpack(">I4s", head)
            if length < 8:
                break
            atoms.append(kind.decode("ascii", errors="replace"))
            handle.seek(length - 8, 1)
    return "moov" in atoms and "mdat" in atoms and atoms.index("moov") < atoms.index("mdat")


def render(slug, spec, ffmpeg, source_dir, review_dir):
    originals = ROOT / "assets/images/stock"
    originals.mkdir(parents=True, exist_ok=True)
    source = originals / spec["filename"]
    imported_hash = None
    if source_dir:
        supplied = source_dir / spec["filename"]
        imported_hash = sha256(supplied)
        if source.exists() and sha256(source) != imported_hash:
            raise RuntimeError(f"Existing original differs: {source.name}")
        if not source.exists():
            shutil.copy2(supplied, source)
    before_hash = sha256(source)
    web = originals / f"{source.stem}-web.jpg"
    with Image.open(source) as opened:
        dimensions = list(opened.size)
        orientation = opened.getexif().get(274, 1)
        image = ImageOps.exif_transpose(opened).convert("RGB")
        image.thumbnail((2000, 20000), Image.Resampling.LANCZOS)
        save_options = {"quality": 90, "subsampling": 0, "optimize": True, "progressive": True}
        if opened.info.get("icc_profile"):
            save_options["icc_profile"] = opened.info["icc_profile"]
        image.save(web, **save_options)
        web_dimensions = list(image.size)
    video_dir = ROOT / "assets/video"
    video_dir.mkdir(parents=True, exist_ok=True)
    output = video_dir / f"stock-photo-{slug}.mp4"
    poster = video_dir / f"stock-photo-{slug}-poster.jpg"
    filters = camera_filter(spec)
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
               "-vf", filters, "-frames:v", str(FRAMES), "-an", "-c:v", "libx264",
               "-preset", "slow", "-crf", "22", "-maxrate", "3M", "-bufsize", "6M",
               "-profile:v", "high", "-level", "3.1", "-pix_fmt", "yuv420p",
               "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709",
               "-color_trc", "bt709", "-r", str(FPS), "-g", "48", "-movflags", "+faststart",
               "-threads", "3", str(output)]
    run(command)
    decoded = run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(output),
                   "-progress", "pipe:1", "-nostats", "-f", "null", "-"])
    decoded_frames = int(re.findall(r"frame=(\d+)", decoded)[-1])
    info = subprocess.run([ffmpeg, "-hide_banner", "-i", str(output)], capture_output=True, text=True).stderr
    duration_text = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", info)
    duration = int(duration_text[1])*3600 + int(duration_text[2])*60 + float(duration_text[3])
    if decoded_frames != FRAMES or duration != SECONDS or "Audio:" in info:
        raise RuntimeError(f"Unexpected stream duration/frame count/audio: {slug}")
    if output.stat().st_size >= 4_000_000 or not fast_start(output):
        raise RuntimeError(f"File-size/fast-start validation failed: {slug}")
    endpoints = run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(source),
                     "-vf", camera_filter(spec, endpoints=True), "-frames:v", "2", "-f", "framemd5", "-"], binary=False)
    hashes = [line.rsplit(",", 1)[1].strip() for line in endpoints.splitlines() if line and not line.startswith("#")]
    if len(hashes) != 2 or hashes[0] != hashes[1]:
        raise RuntimeError(f"Camera loop endpoints differ: {slug}")
    review_frames = []
    for frame in [0, 72, FRAMES-1]:
        target = review_dir / f"{slug}-{frame:03}.png"
        run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(output),
             "-vf", f"select=eq(n\\,{frame})", "-frames:v", "1", str(target)])
        review_frames.append(target)
    with Image.open(review_frames[0]) as image:
        image.convert("RGB").save(poster, quality=91, optimize=True)
    after_hash = sha256(source)
    if after_hash != before_hash or (imported_hash and imported_hash != before_hash):
        raise RuntimeError(f"Source changed: {source.name}")
    result = {
        "slug": slug, "source": relative(source), "source_sha256": before_hash,
        "source_bytes": source.stat().st_size, "source_dimensions": dimensions,
        "source_exif_orientation": orientation, "source_unchanged": True,
        "copy_matches_supplied_original": imported_hash == before_hash if imported_hash else None,
        "web_image": relative(web), "web_sha256": sha256(web), "web_bytes": web.stat().st_size,
        "web_dimensions": web_dimensions, "web_treatment": "Aspect-preserving resize only; JPEG quality 90, no cropping or retouching.",
        "video": relative(output), "video_sha256": sha256(output), "video_bytes": output.stat().st_size,
        "poster": relative(poster), "poster_sha256": sha256(poster),
        "framing": spec["description"], "camera_filter": filters,
        "camera": {"base_frame": [3840, 2160], "base_crop_fraction": [spec["crop_x"], spec["crop_y"]],
                   "zoom_min": 1.006, "zoom_max": 1.026, "path": "Cosine round trip; identical uncompressed first and last camera frames."},
        "encoding": {"codec": "H.264 High / yuv420p", "dimensions": [WIDTH, HEIGHT], "fps": FPS,
                     "duration_seconds": duration, "frames": FRAMES, "audio_tracks": 0, "crf": 22,
                     "maxrate": "3M", "bufsize": "6M", "color": "Rec.709 limited range", "fast_start": True},
        "validation": {"full_stream_decode": "pass", "decoded_frames": decoded_frames,
                       "duration_seconds": duration, "under_4_MB": True, "loop_endpoints_identical_before_encoding": True,
                       "endpoint_frame_md5": hashes[0], "source_hash_unchanged": True,
                       "review_frame_indices": [0, 72, FRAMES-1]},
    }
    print(f"READY {slug}: {relative(output)}; {duration:.1f}s; {output.stat().st_size:,} bytes", flush=True)
    return result, review_frames


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg")
    parser.add_argument("--source-dir", type=Path)
    parser.add_argument("--review-dir", type=Path, default=ROOT.parent / "latest-photos-review")
    args = parser.parse_args()
    ffmpeg = find_ffmpeg(args.ffmpeg)
    args.review_dir.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(render, slug, spec, ffmpeg, args.source_dir, args.review_dir) for slug, spec in SPECS.items()]
        rendered = [future.result() for future in futures]
    sheet = Image.new("RGB", (1200, 518), "#FFFFFF")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=15)
    for row, (result, frames) in enumerate(rendered):
        for col, (frame, index) in enumerate(zip(frames, [0, 72, FRAMES-1])):
            with Image.open(frame) as image:
                image = image.resize((400, 225), Image.Resampling.LANCZOS)
                sheet.paste(image, (col*400, row*259+28))
            draw.text((col*400+10, row*259+7), f"{result['slug'].title()} / {index/FPS:.2f} s", fill="#273238", font=font)
    contact = args.review_dir / "contact-sheet.jpg"
    sheet.save(contact, quality=92, optimize=True)
    metadata = {
        "render_script": "scripts/render-latest-photos.py",
        "method": "Camera-only motion rendered locally from two user-supplied stock photographs. Original JPEGs are copied unchanged; web JPEGs preserve the complete composition.",
        "disclosure": "Animated photographs, not filmed scenes. People, buildings and clouds remain still; no AI rendering, optical-flow interpolation or object synthesis.",
        "rights": "Photographs supplied by the user; original ownership and licensing remain with their respective owners.",
        "videos": [result for result, _ in rendered],
        "contact_sheet": relative(contact),
        "ffmpeg": run([ffmpeg, "-version"]).splitlines()[0],
    }
    provenance = ROOT / "assets/video/latest-photos-provenance.json"
    provenance.write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(f"Provenance: {relative(provenance)}; contact sheet: {contact}", flush=True)


if __name__ == "__main__":
    main()
