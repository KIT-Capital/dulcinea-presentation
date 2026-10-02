"""Render a 22-second social-connection loop for the Lola & Ber chapter.

Usage: python scripts/render-hospitality.py [--stock-dir /private/source/folder]
Only this film, its poster and dedicated provenance are replaced. Review frames
are written outside the repository. The supplied still and other films stay intact.
"""

import argparse
import importlib.util
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "assets" / "video"
SOURCE = ROOT / "assets/images/stock/AdobeStock_681077127.jpeg"
FPS, WIDTH, HEIGHT = 24, 1280, 720
FADE = 0.5
STOCK_DIR = ROOT.parent / "lola-brand-review" / "coverr-selected"
CLIPS = [
    {"key": "embrace", "filename": "couple-kissing-and-hugging.mp4", "duration": 7,
     "id": "sksvkteedr", "subject": "Adult couple embracing and kissing indoors",
     "url": "https://coverr.co/videos/couple-kissing-and-hugging-sksvkteedr",
     "download_url": "https://cdn.coverr.co/videos/coverr-couple-kissing-and-hugging-3505/720p.mp4"},
    {"key": "hands", "filename": "women-holding-hands.mp4", "duration": 5,
     "id": "tr7kbqumzc", "subject": "Women holding hands in a close detail shot",
     "url": "https://coverr.co/videos/women-holding-hands-tr7kbqumzc",
     "download_url": "https://cdn.coverr.co/videos/coverr-women-holding-hands-7282/720p.mp4"},
]


def load_helper(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run(command):
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout


def camera_filter(seconds=8, returning=False, endpoint=False):
    # Oversampling reduces pixel-stepping. Complementary cosine paths return
    # the closing still to the opening framing, with zero endpoint velocity.
    frames = int(seconds * FPS)
    frame = str(frames - 1 if returning else 0) if endpoint else "on"
    phase = f"(0.5-0.5*cos(PI*({frame})/{frames - 1}))"
    if returning:
        phase = f"(1-{phase})"
    return (
        "scale=3840:2160:force_original_aspect_ratio=increase:flags=lanczos,"
        "crop=3840:2160:x='(iw-ow)*0.5':y='(ih-oh)*0.05',"
        f"zoompan=z='1.006+0.020*{phase}':"
        f"x='(iw-iw/zoom)*(0.47+0.04*{phase})':y='(ih-ih/zoom)*0.02':"
        f"d={1 if endpoint else frames}:s={WIDTH}x{HEIGHT}:fps={FPS},"
        "scale=in_range=full:out_range=tv:out_color_matrix=bt709,setsar=1,format=yuv420p,"
        "setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709"
    )


def render_hospitality(ffmpeg, review_dir=None, stock_dir=STOCK_DIR, clip_files=None, clip_starts=None):
    helper = load_helper("stock_helpers", "render-stock-videos.py")
    original_hash = helper.sha256(SOURCE)
    stock_dir = Path(stock_dir).resolve()
    if stock_dir == ROOT or ROOT in stock_dir.parents:
        raise ValueError("Downloaded original clips must remain outside the repository")
    clip_files = clip_files or {}
    clip_starts = clip_starts or {}
    clips = []
    closing_seconds = 3.5
    scene_durations = [8, *[clip["duration"] for clip in CLIPS], closing_seconds]
    duration = sum(scene_durations) - FADE * (len(scene_durations) - 1)
    frames = int(duration * FPS)
    review_frames = [0, 6 * FPS, 10 * FPS, 16 * FPS, 20 * FPS, frames - 1]
    for clip in CLIPS:
        source = (stock_dir / clip_files.get(clip["key"], clip["filename"])).resolve()
        if source == ROOT or ROOT in source.parents:
            raise ValueError("Downloaded original clips must remain outside the repository")
        if not source.is_file():
            raise FileNotFoundError(f"Selected source clip is not available: {source}")
        metadata = helper.inspect(ffmpeg, source)
        start = float(clip_starts.get(clip["key"], 0))
        if start < 0 or metadata["duration_seconds"] < start + clip["duration"]:
            raise ValueError(f"Source is too short for the selected interval: {source}")
        clips.append({**clip, "source": source, "start": start, "metadata": metadata})
    output = VIDEO / "hospitality-people.mp4"
    poster = VIDEO / "hospitality-people-poster.jpg"
    encoding = helper.encoder()
    encoding[encoding.index("-crf") + 1] = "22"
    encoding[encoding.index("-maxrate") + 1] = "3M"
    encoding[encoding.index("-bufsize") + 1] = "6M"
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-filter_complex_threads", "2",
               "-i", str(SOURCE)]
    for clip in clips:
        command += ["-ss", str(clip["start"]), "-i", str(clip["source"])]
    command += ["-i", str(SOURCE)]
    filters = [f"[0:v]{camera_filter()},setpts=PTS-STARTPTS,fps={FPS},settb=1/{FPS}[v0]"]
    for index, clip in enumerate(clips, start=1):
        filters.append(
            f"[{index}:v]trim=duration={clip['duration']},setpts=PTS-STARTPTS,fps={FPS},"
            f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=decrease:flags=lanczos,"
            f"pad={WIDTH}:{HEIGHT}:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p,settb=1/{FPS},"
            "setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709"
            f"[v{index}]"
        )
    closing_index = len(clips) + 1
    # A three-frame terminal hold covers xfade/fps EOF rounding. The output is
    # still trimmed to the exact target duration, ending on the opening frame.
    filters.append(f"[{closing_index}:v]{camera_filter(closing_seconds, returning=True)},setpts=PTS-STARTPTS,fps={FPS},settb=1/{FPS},tpad=stop_mode=clone:stop_duration=0.125[v{closing_index}]")
    previous = "v0"
    offsets = []
    elapsed = 0
    for seconds in scene_durations[:-1]:
        elapsed += seconds - FADE
        offsets.append(elapsed)
    for index, offset in enumerate(offsets, start=1):
        filters.append(f"[{previous}][v{index}]xfade=transition=fade:duration={FADE}:offset={offset},fps={FPS}[mix{index}]")
        previous = f"mix{index}"
    filters.append(f"[{previous}]trim=duration={duration},setpts=PTS-STARTPTS[out]")
    run([*command, "-filter_complex", ";".join(filters), "-map", "[out]",
         "-frames:v", str(frames), *encoding, str(output)])

    decoded = run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(output),
                   "-progress", "pipe:1", "-nostats", "-f", "null", "-"])
    decoded_frames = int(re.findall(r"frame=(\d+)", decoded)[-1])
    metadata = helper.inspect(ffmpeg, output)
    stream = metadata["video_stream"]
    if (decoded_frames != frames or metadata["duration_seconds"] != duration
            or metadata["audio_tracks"] or not all(value in stream for value in ("h264", "1280x720", "24 fps"))):
        raise RuntimeError(f"Unexpected hospitality encoding: {metadata}; frames={decoded_frames}")
    load_helper("mp4_validation", "import-latest-stock.py").verify_faststart(output)
    if metadata["bytes"] >= 12_000_000:
        raise RuntimeError("Hospitality film exceeds the 12 MB target")

    endpoint_filters = ";".join(filters) + f";[out]select=eq(n\\,0)+eq(n\\,{frames - 1})[endpoints]"
    endpoint_output = run([*command, "-filter_complex", endpoint_filters,
                           "-map", "[endpoints]", "-fps_mode", "passthrough", "-f", "framemd5", "-"])
    endpoint_hashes = [line.rsplit(",", 1)[1].strip() for line in endpoint_output.splitlines()
                       if line and not line.startswith("#")]
    if len(endpoint_hashes) != 2 or endpoint_hashes[0] != endpoint_hashes[1]:
        raise RuntimeError("Hospitality camera loop endpoints differ")
    if helper.sha256(SOURCE) != original_hash:
        raise RuntimeError("Original social-wellness photograph changed during rendering")
    for clip in clips:
        if helper.sha256(clip["source"]) != clip["metadata"]["sha256"]:
            raise RuntimeError(f"Selected source clip changed during rendering: {clip['source']}")
    helper.poster(ffmpeg, output, poster)

    if review_dir is not None:
        review_dir = Path(review_dir).resolve()
        if review_dir == ROOT or ROOT in review_dir.parents:
            raise ValueError("Review frames must remain outside the repository")
        review_dir.mkdir(parents=True, exist_ok=True)
        for frame in review_frames:
            run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(output),
                 "-vf", f"select=eq(n\\,{frame})", "-frames:v", "1",
                 str(review_dir / f"hospitality-{frame:03}.png")])
        selected = "+".join(f"eq(n\\,{frame})" for frame in review_frames)
        run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(output),
             "-vf", f"select='{selected}',scale=640:360:flags=lanczos,tile=3x2",
             "-frames:v", "1", "-q:v", "2", str(review_dir / "hospitality-contact-sheet.jpg")])

    timeline = [{"start_seconds": 0, "end_seconds": 7.5, "content": "Robe photograph, gentle camera push"}]
    for index, clip in enumerate(clips):
        start = offsets[index]
        timeline += [
            {"start_seconds": start, "end_seconds": start + FADE, "content": f"Dissolve into {clip['subject'].lower()}"},
            {"start_seconds": start + FADE, "end_seconds": offsets[index + 1], "content": clip["subject"]},
        ]
    timeline += [
        {"start_seconds": offsets[-1], "end_seconds": offsets[-1] + FADE, "content": "Dissolve back to the robe photograph"},
        {"start_seconds": offsets[-1] + FADE, "end_seconds": duration, "content": "Robe photograph, easing back to the opening framing"},
    ]
    provenance = {
        "file": output.name, **metadata,
        "poster": poster.relative_to(ROOT).as_posix(), "poster_sha256": helper.sha256(poster),
        "method": "The supplied photograph of adults socializing in robes opens and closes a montage of selected adult connection footage. Half-second dissolves join original filmed motion; cosine camera moves animate only the photograph. No generated imagery, synthetic human movement, motion reversal or optical-flow interpolation.",
        "sources": [{"id": "681077127", "subject": "Adults smiling and socializing indoors in white robes",
                     "path": SOURCE.relative_to(ROOT).as_posix(), "sha256": original_hash,
                     "original_filename": "AdobeStock_681077127.jpeg",
                     "source_bytes": SOURCE.stat().st_size,
                     "source_dimensions": [5495, 3663],
                     "source_unchanged": True,
                     "canonical_copy": "Byte-for-byte copy of the user-supplied original; SHA-256 verified on import."}] + [
            {"id": clip["id"], "subject": clip["subject"], "source_url": clip["url"],
             "download_url": clip.get("download_url"),
             "external_source_path": (clip["source"].relative_to(ROOT.parent).as_posix()
                                      if clip["source"].is_relative_to(ROOT.parent) else str(clip["source"])),
             "original_filename": clip["source"].name, **clip["metadata"],
             "source_start_seconds": clip["start"], "source_duration_seconds": clip["duration"],
             "source_unchanged": True,
             "distribution": "Downloaded original retained outside the repository and deployment; only the edited end product is packaged.",
             "license": {"name": "Coverr License", "url": "https://coverr.co/license", "terms_url": "https://coverr.co/terms",
                         "reviewed_on": "2026-10-02", "commercial_use": True, "attribution_required": False,
                         "limits": "No resale or stock redistribution of original footage; no implication of model endorsement or actual brand guests. Third-party rights remain subject to the published license."}}
            for clip in clips
        ],
        "source_provenance": ["assets/images/stock/AdobeStock_681077127.jpeg", "https://coverr.co/license", "https://coverr.co/terms"],
        "timeline": timeline,
        "crossfade_seconds": FADE,
        "crossfade_offsets_seconds": offsets,
        "camera_filter": {"opening": camera_filter(), "closing": camera_filter(closing_seconds, returning=True)},
        "camera": {"base_frame": [3840, 2160], "base_crop_fraction": [0.5, 0.05],
                   "zoom_vertical_crop_fraction": 0.02,
                   "zoom_min": 1.006, "zoom_max": 1.026,
                   "path": "Cosine round trip with matching camera endpoints and zero endpoint velocity."},
        "loop_method": "The complete edit's first and last uncompressed frames are identical. Complementary cosine photo moves have zero endpoint velocity.",
        "location_note": "Illustrative stock people, not actual Lola & Ber guests, personnel or endorsers. Scenes do not identify Medellin, El Oriente or a fund property.",
        "render_script": "scripts/render-hospitality.py", "encoding_options": encoding,
        "validation": {"full_stream_decode": "pass", "decoded_frames": decoded_frames,
                       "duration_seconds": duration, "fast_start": True, "under_12_MB": True,
                       "source_hash_unchanged": True, "loop_endpoints_identical_before_encoding": True,
                       "endpoint_frame_md5": endpoint_hashes[0], "review_frame_indices": review_frames},
    }
    (VIDEO / "hospitality-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    return provenance


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg")
    parser.add_argument("--stock-dir", type=Path, default=STOCK_DIR)
    for clip in CLIPS:
        parser.add_argument(f"--{clip['key']}-file", default=clip["filename"])
        parser.add_argument(f"--{clip['key']}-start", type=float, default=0)
    parser.add_argument("--review-dir", type=Path, default=ROOT.parent / "lola-brand-review")
    args = parser.parse_args()
    ffmpeg = load_helper("ffmpeg_locator", "render-videos.py").find_ffmpeg(args.ffmpeg)
    provenance = render_hospitality(ffmpeg, args.review_dir, args.stock_dir,
                                   {clip["key"]: getattr(args, f"{clip['key']}_file") for clip in CLIPS},
                                   {clip["key"]: getattr(args, f"{clip['key']}_start") for clip in CLIPS})
    print(json.dumps({key: provenance[key] for key in ("file", "bytes", "duration_seconds", "video_stream", "audio_tracks")}, indent=2))


if __name__ == "__main__":
    main()
