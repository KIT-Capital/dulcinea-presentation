"""Render a 12-second evening-photo camera loop for the Lola & Ber chapter.

Usage: python scripts/render-hospitality.py [--ffmpeg /path/to/ffmpeg]
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
SOURCE = ROOT / "assets/images/stock/AdobeStock_259715040.jpeg"
FPS, WIDTH, HEIGHT, DURATION = 24, 1280, 720, 12
FRAMES = FPS * DURATION
REVIEW_FRAMES = [0, FRAMES // 2, FRAMES - 1]


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


def camera_filter(endpoints=False):
    # Render at three times final resolution to reduce pixel-stepping. The cosine
    # round trip has zero velocity and the same framing at both loop endpoints.
    frame = f"on*{FRAMES - 1}" if endpoints else "on"
    phase = f"(0.5-0.5*cos(2*PI*({frame})/{FRAMES - 1}))"
    return (
        "scale=3840:2160:force_original_aspect_ratio=increase:flags=lanczos,"
        "crop=3840:2160:x='(iw-ow)*0.5':y='(ih-oh)*0.58',"
        f"zoompan=z='1.006+0.020*{phase}':"
        f"x='(iw-iw/zoom)*(0.47+0.04*{phase})':y='(ih-ih/zoom)*0.59':"
        f"d={2 if endpoints else FRAMES}:s={WIDTH}x{HEIGHT}:fps={FPS},"
        "scale=in_range=full:out_range=tv:out_color_matrix=bt709,setsar=1,format=yuv420p,"
        "setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709"
    )


def render_hospitality(ffmpeg, review_dir=None):
    helper = load_helper("stock_helpers", "render-stock-videos.py")
    original_hash = helper.sha256(SOURCE)
    output = VIDEO / "hospitality-people.mp4"
    poster = VIDEO / "hospitality-people-poster.jpg"
    encoding = helper.encoder()
    encoding[encoding.index("-crf") + 1] = "22"
    encoding[encoding.index("-maxrate") + 1] = "3M"
    encoding[encoding.index("-bufsize") + 1] = "6M"
    run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(SOURCE),
         "-vf", camera_filter(), "-frames:v", str(FRAMES), *encoding, str(output)])

    decoded = run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(output),
                   "-progress", "pipe:1", "-nostats", "-f", "null", "-"])
    decoded_frames = int(re.findall(r"frame=(\d+)", decoded)[-1])
    metadata = helper.inspect(ffmpeg, output)
    stream = metadata["video_stream"]
    if (decoded_frames != FRAMES or metadata["duration_seconds"] != DURATION
            or metadata["audio_tracks"] or not all(value in stream for value in ("h264", "1280x720", "24 fps"))):
        raise RuntimeError(f"Unexpected hospitality encoding: {metadata}; frames={decoded_frames}")
    load_helper("mp4_validation", "import-latest-stock.py").verify_faststart(output)
    if metadata["bytes"] >= 4_000_000:
        raise RuntimeError("Hospitality film exceeds the 4 MB target")

    endpoint_output = run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
                           "-vf", camera_filter(endpoints=True), "-frames:v", "2", "-f", "framemd5", "-"])
    endpoint_hashes = [line.rsplit(",", 1)[1].strip() for line in endpoint_output.splitlines()
                       if line and not line.startswith("#")]
    if len(endpoint_hashes) != 2 or endpoint_hashes[0] != endpoint_hashes[1]:
        raise RuntimeError("Hospitality camera loop endpoints differ")
    if helper.sha256(SOURCE) != original_hash:
        raise RuntimeError("Original evening photograph changed during rendering")
    helper.poster(ffmpeg, output, poster)

    if review_dir is not None:
        review_dir = Path(review_dir).resolve()
        if review_dir == ROOT or ROOT in review_dir.parents:
            raise ValueError("Review frames must remain outside the repository")
        review_dir.mkdir(parents=True, exist_ok=True)
        for frame in REVIEW_FRAMES:
            run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(output),
                 "-vf", f"select=eq(n\\,{frame})", "-frames:v", "1",
                 str(review_dir / f"hospitality-{frame:03}.png")])
        selected = "+".join(f"eq(n\\,{frame})" for frame in REVIEW_FRAMES)
        run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(output),
             "-vf", f"select='{selected}',scale=640:360:flags=lanczos,tile=3x1",
             "-frames:v", "1", "-q:v", "2", str(review_dir / "hospitality-contact-sheet.jpg")])

    provenance = {
        "file": output.name, **metadata,
        "poster": poster.relative_to(ROOT).as_posix(), "poster_sha256": helper.sha256(poster),
        "method": "Restrained Ken Burns camera motion across the supplied evening photograph. The people remain still; no generated imagery, synthetic human movement or optical-flow interpolation.",
        "sources": [{"id": "259715040", "subject": "Adult evening photograph with seated and standing figures, legs and shoes",
                     "path": SOURCE.relative_to(ROOT).as_posix(), "sha256": original_hash,
                     "source_unchanged": True}],
        "source_provenance": ["assets/video/latest-photos-provenance.json"],
        "timeline": [{"start_seconds": 0, "end_seconds": DURATION,
                      "content": "Evening photograph, with a slow camera push and pan returning to the opening framing"}],
        "camera_filter": camera_filter(),
        "camera": {"base_frame": [3840, 2160], "base_crop_fraction": [0.5, 0.58],
                   "zoom_min": 1.006, "zoom_max": 1.026,
                   "path": "Cosine round trip with matching camera endpoints and zero endpoint velocity."},
        "loop_method": "One cosine round trip over 288 frames; the uncompressed first and last camera frames have identical hashes.",
        "location_note": "Illustrative user-supplied evening photograph, not a verified Lola & Ber event, property or team photograph.",
        "render_script": "scripts/render-hospitality.py", "encoding_options": encoding,
        "validation": {"full_stream_decode": "pass", "decoded_frames": decoded_frames,
                       "duration_seconds": DURATION, "fast_start": True, "under_4_MB": True,
                       "source_hash_unchanged": True, "loop_endpoints_identical_before_encoding": True,
                       "endpoint_frame_md5": endpoint_hashes[0], "review_frame_indices": REVIEW_FRAMES},
    }
    (VIDEO / "hospitality-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    return provenance


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg")
    parser.add_argument("--review-dir", type=Path, default=ROOT.parent / "media-context-review")
    args = parser.parse_args()
    ffmpeg = load_helper("ffmpeg_locator", "render-videos.py").find_ffmpeg(args.ffmpeg)
    provenance = render_hospitality(ffmpeg, args.review_dir)
    print(json.dumps({key: provenance[key] for key in ("file", "bytes", "duration_seconds", "video_stream", "audio_tracks")}, indent=2))


if __name__ == "__main__":
    main()
