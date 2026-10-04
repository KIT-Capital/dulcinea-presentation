"""Render the city and evening review films without modifying existing media.

Usage:
  python -B scripts/render-review-story.py --ffmpeg /path/to/ffmpeg

Only assets/video/review is written. Originals and existing films remain intact.
The rejected garden-reading and outdoor-gathering footage is not part of this edit.
"""

import argparse
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets/video/review"
FPS = 24
FADE = 0.5
LOOP_START = FADE + 3 / FPS
ENCODING = [
    "-an", "-sn", "-dn", "-c:v", "libx264", "-preset", "slow", "-crf", "22",
    "-maxrate", "2800k", "-bufsize", "5600k", "-profile:v", "high", "-level", "3.1",
    "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-r", str(FPS), "-g", "48",
    "-movflags", "+faststart", "-map_metadata", "-1", "-threads", "4",
]
NORMALIZE = (
    f"setpts=PTS-STARTPTS,fps={FPS},settb=1/{FPS},"
    "scale=1280:720:force_original_aspect_ratio=increase:flags=lanczos:"
    "out_range=tv:out_color_matrix=bt709,crop=1280:720,setsar=1,format=yuv420p,"
    "setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709"
)


def scene(asset_id, subject, path, start, duration, **extra):
    return {"id": asset_id, "subject": subject, "path": path,
            "source_start_seconds": start, "source_duration_seconds": duration, **extra}


RECIPES = {
    "city-life": [
        scene("city-photo-891890158", "Camera movement over a city valley photograph",
              "assets/video/stock-photo-city.mp4", 0, 5.5,
              source_kind="Animated photograph, not filmed aerial movement",
              source_provenance="assets/video/latest-photos-provenance.json"),
        scene("80490822", "Chefs preparing and plating food in a professional kitchen",
              "assets/video/stock/AdobeStock_80490822.mp4", 3, 9,
              source_provenance="assets/video/stock/provenance.json"),
        scene("787505338", "Woman walking along a tree-lined city sidewalk",
              "assets/video/stock/AdobeStock_787505338.mp4", 0.5, 8,
              source_provenance="assets/video/stock/latest-provenance.json"),
    ],
    "after-dark": [
        scene("417029984", "Sunset and moving clouds over a city valley",
              "assets/video/stock/AdobeStock_417029984.mp4", 0, 4.5,
              source_provenance="assets/video/stock/oriente-provenance.json"),
        scene("727024520", "Rotating overhead night view of an illuminated road and traffic",
              "assets/video/stock/AdobeStock_727024520.mp4", 3, 8,
              source_provenance="assets/video/stock/additional-provenance.json"),
        scene("807462744", "Glowing green MEDELLIN neon animation",
              "assets/video/stock/AdobeStock_807462744.mp4", 4, 3,
              source_provenance="assets/video/stock/additional-provenance.json"),
        scene("evening-photo-259715040", "Camera movement over evening gathering photograph",
              "assets/video/stock-photo-evening.mp4", 0, 6,
              source_kind="Animated photograph, not filmed human movement",
              source_provenance="assets/video/latest-photos-provenance.json"),
        scene("nightlife-photos", "Camera movement over two photographs of DJs and a crowd",
              "assets/video/medellin-nightlife.mp4", 0, 13,
              source_kind="Animated photographs, not filmed human movement",
              source_provenance="assets/video/medellin-nightlife-provenance.json"),
    ],
}


def load_helper(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def source_path(item, external_dir):
    return (external_dir if item.get("external") else ROOT) / item["path"]


def motion_checks(ffmpeg, slug, frame_count):
    output = OUTPUT / f"{slug}.mp4"
    select = f"select=eq(n\\,0)+eq(n\\,1)+eq(n\\,{frame_count-2})+eq(n\\,{frame_count-1}),scale=320:180,format=gray"
    raw = subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(output),
                          "-vf", select, "-fps_mode", "passthrough", "-f", "rawvideo", "pipe:1"],
                         capture_output=True, check=True).stdout
    size = 320 * 180
    if len(raw) != 4 * size:
        raise RuntimeError(f"Loop frame extraction failed: {slug}")
    frames = [raw[i * size:(i + 1) * size] for i in range(4)]
    def difference(a, b):
        return sum(abs(x - y) for x, y in zip(a, b)) / size
    seam = difference(frames[-1], frames[0])
    first_step, last_step = difference(frames[0], frames[1]), difference(frames[2], frames[3])
    if seam > max(6, 8 * max(first_step, last_step)):
        raise RuntimeError(f"Large loop discontinuity: {slug}")
    def freeze_events(path):
        result = subprocess.run([ffmpeg, "-hide_banner", "-i", str(path),
                                 "-vf", "freezedetect=n=-60dB:d=0.25", "-an", "-f", "null", "-"],
                                capture_output=True, text=True, check=True)
        return [{"event": name, "seconds": float(value)} for name, value in
                re.findall(r"lavfi\.freezedetect\.(freeze_\w+): ([0-9.]+)", result.stderr)]
    result = {"loop_seam_mean_pixel_difference": round(seam, 6),
              "first_adjacent_frame_difference": round(first_step, 6),
              "last_adjacent_frame_difference": round(last_step, 6),
              "loop_discontinuity_check": "pass", "freeze_detector_threshold": "-60 dB for 0.25 seconds",
              "near_static_events": freeze_events(output),
              "no_inserted_holds": "The edit contains no frame padding, freeze-frame filters, speed changes or motion interpolation."}
    if slug == "after-dark":
        result["evening_photo_source_near_static_events"] = freeze_events(ROOT / "assets/video/stock-photo-evening.mp4")
        result["near_static_note"] = "The 0.333-second near-static interval at output 16.25-16.583 seconds matches source evening photograph 2.875-3.208 seconds plus its 13.375-second timeline offset. It is the retained camera move easing through its midpoint, not an inserted hold."
    return result


def render(ffmpeg, helper, faststart, slug, scenes, external_dir, source_metadata):
    duration = sum(item["source_duration_seconds"] - FADE for item in scenes)
    inputs = scenes + [{**scenes[0], "source_duration_seconds": 1.5}]
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-filter_complex_threads", "2"]
    filters = []
    for index, item in enumerate(inputs):
        command += ["-ss", str(item["source_start_seconds"]), "-i", str(source_path(item, external_dir))]
        filters.append(f"[{index}:v]trim=duration={item['source_duration_seconds']},{NORMALIZE}[v{index}]")
    elapsed, previous, offsets = 0, "v0", []
    for index, item in enumerate(scenes, start=1):
        elapsed += item["source_duration_seconds"] - FADE
        offsets.append(elapsed)
        label = f"mix{index}"
        filters.append(f"[{previous}][v{index}]xfade=transition=fade:duration={FADE}:offset={elapsed},fps={FPS}[{label}]")
        previous = label
    filters.append(f"[{previous}]trim=start={LOOP_START}:duration={duration},setpts=PTS-STARTPTS[out]")
    output = OUTPUT / f"{slug}.mp4"
    poster = OUTPUT / f"{slug}-poster.jpg"
    print(f"Rendering {slug}: {duration:g}s", flush=True)
    helper.run([*command, "-filter_complex", ";".join(filters), "-map", "[out]",
                *ENCODING, "-t", str(duration), str(output)])
    metadata = helper.validate(ffmpeg, output)
    faststart.verify_faststart(output)
    if metadata["duration_seconds"] != duration or "24 fps" not in metadata["video_stream"]:
        raise RuntimeError(f"Unexpected timing for {slug}: {metadata}")
    if metadata["bytes"] >= 12_000_000:
        raise RuntimeError(f"{slug} exceeds the 12 MB limit")
    decoded = subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-progress", "pipe:1",
                              "-i", str(output), "-map", "0:v:0", "-f", "null", "-"],
                             capture_output=True, text=True, check=True)
    frame_count = int(re.findall(r"^frame=(\d+)$", decoded.stdout, re.MULTILINE)[-1])
    if frame_count != round(duration * FPS):
        raise RuntimeError(f"Unexpected decoded frame count for {slug}: {frame_count}")
    helper.poster(ffmpeg, output, poster)
    contact = OUTPUT / f"{slug}-contact.jpg"
    helper.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(output),
                "-vf", f"fps=6/{duration},scale=384:216,tile=3x2", "-frames:v", "1", str(contact)])
    sources = []
    for item in scenes:
        record = {**item, "source_sha256": source_metadata[str(source_path(item, external_dir))]["sha256"],
                  "source_metadata": source_metadata[str(source_path(item, external_dir))],
                  "source_unchanged": True}
        if item.get("external"):
            record["path"] = "external-source-dir/" + item["path"]
            record["distribution"] = "Original retained outside the repository; only the edited film is packaged."
        sources.append(record)
    result = {
        "file": output.relative_to(ROOT).as_posix(), **metadata,
        "poster": poster.relative_to(ROOT).as_posix(), "poster_sha256": helper.sha256(poster),
        "review_contact_sheet": contact.relative_to(ROOT).as_posix(),
        "sources": sources, "crossfade_seconds": FADE,
        "untrimmed_crossfade_offsets_seconds": offsets,
        "output_dissolve_intervals_seconds": [[v - LOOP_START, v + FADE - LOOP_START] for v in offsets],
        "loop_trim_start_seconds": LOOP_START, "loop_guard_frames": 3,
        "loop_method": "Append the opening source, dissolve back to it, and trim both ends to consecutive camera positions at original speed. A three-frame guard puts the loop seam after the last dissolve.",
        "validation": {"full_stream_decode": "pass", "decoded_frames": frame_count,
                       "source_hashes_unchanged": True, "fast_start": True, "under_12_MB": True,
                       "motion": motion_checks(ffmpeg, slug, frame_count)},
    }
    print(json.dumps({"file": result["file"], "duration_seconds": duration,
                      "bytes": metadata["bytes"], "frames": frame_count}), flush=True)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg")
    args = parser.parse_args()
    ffmpeg = load_helper("review_locator", "render-videos.py").find_ffmpeg(args.ffmpeg)
    helper = load_helper("review_helpers", "render-stock-videos.py")
    faststart = load_helper("review_faststart", "import-latest-stock.py")
    external_dir = ROOT
    sources = {source_path(item, external_dir) for scenes in RECIPES.values() for item in scenes}
    source_metadata = {str(path): helper.inspect(ffmpeg, path) for path in sorted(sources)}
    for scenes in RECIPES.values():
        for item in scenes:
            metadata = source_metadata[str(source_path(item, external_dir))]
            if item["source_start_seconds"] + item["source_duration_seconds"] > metadata["duration_seconds"] + 0.01:
                raise RuntimeError(f"Excerpt exceeds source duration: {item['path']}")
    # Every pre-existing film, including films not used in the new edits, is protected.
    protected = {path: helper.sha256(path) for path in (ROOT / "assets/video").rglob("*.mp4")
                 if OUTPUT not in path.parents}
    OUTPUT.mkdir(parents=True, exist_ok=True)
    videos = [render(ffmpeg, helper, faststart, slug, scenes, external_dir, source_metadata)
              for slug, scenes in RECIPES.items()]
    # Other approved review edits have their own renderer and must retain provenance.
    previous_path = OUTPUT / "provenance.json"
    if previous_path.is_file():
        current_files = {video["file"] for video in videos}
        videos += [video for video in json.loads(previous_path.read_text(encoding="utf-8"))["videos"]
                   if video["file"] not in current_files and video.get("render_script") in {
                       "scripts/render-review-brand.py", "scripts/render-review-destinations.py"}]
    for source, metadata in source_metadata.items():
        if helper.sha256(Path(source)) != metadata["sha256"]:
            raise RuntimeError(f"Source changed during rendering: {Path(source).name}")
    for path, digest in protected.items():
        if helper.sha256(path) != digest:
            raise RuntimeError(f"Existing film changed during rendering: {path.name}")
    provenance = {
        "render_script": "scripts/render-review-story.py",
        "rebuild": "python -B scripts/render-review-story.py --ffmpeg /path/to/ffmpeg",
        "created_on": "2026-10-04", "method": "Existing filmed footage and retained photographic camera moves joined at original speed using half-second circular dissolves. No freezes, slow motion, motion reversal, generated imagery or optical-flow interpolation.",
        "location_note": "Dining footage illustrates city experiences and does not imply a property dining service or endorsement by the depicted people.",
        "source_handling": "Existing composites and every source are unchanged and SHA-256 verified before and after rendering.",
        "encoding_options": ENCODING, "normalization_filter": NORMALIZE,
        "videos": videos,
        "validation": {"all_sources_hash_unchanged": True, "existing_films_hash_unchanged": True,
                       "existing_films_checked": len(protected)},
    }
    (OUTPUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
