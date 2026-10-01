"""Build a silent city-and-property montage from retained presentation films.

Usage: python scripts/render-introduction.py [--ffmpeg /path/to/ffmpeg] [--keep-poster]
Reuses the retained optimized MP4s; original source materials remain untouched.
Property films animate AI lifestyle illustrations, not filmed human movement.
The stock city-photo film adds camera motion to a supplied photograph.
Only replaces the introduction, its poster and its provenance entry.
"""

import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "assets" / "video"
FPS = 24
FADE = 12 / FPS  # Restrained, frame-aligned half-second dissolves.
SCENES = [
    {"id": "695926335", "subject": "Green high-rise city district and mountain slopes", "source_path": "assets/video/stock/AdobeStock_695926335.mp4", "source_kind": "Actual supplied stock footage", "start_seconds": 2, "duration_seconds": 6.5},
    {"id": "693150796", "subject": "City towers and green streets", "source_path": "assets/video/stock/AdobeStock_693150796.mp4", "source_kind": "Actual supplied stock footage", "start_seconds": 0, "duration_seconds": 5.5},
    {"id": "fontanar", "subject": "Fontanar kitchen lifestyle scene", "source_path": "assets/video/properties/fontanar.mp4", "source_kind": "Camera movement over an AI lifestyle illustration; fictional adults are not filmed movement", "start_seconds": 1, "duration_seconds": 4.5},
    {"id": "san-lucas", "subject": "San Lucas living room lifestyle scene", "source_path": "assets/video/properties/san-lucas.mp4", "source_kind": "Camera movement over an AI lifestyle illustration; fictional adults are not filmed movement", "start_seconds": 1, "duration_seconds": 4.5},
    {"id": "city-photo-891890158", "subject": "Green city valley and mountain panorama", "source_path": "assets/video/stock-photo-city.mp4", "source_kind": "Camera movement over the supplied AdobeStock_891890158 photograph; not filmed aerial motion", "start_seconds": 0, "duration_seconds": 5.5},
    {"id": "1849343666", "subject": "Colonial town square with pedestrians", "source_path": "assets/video/stock/AdobeStock_1849343666.mp4", "source_kind": "Actual supplied stock footage", "start_seconds": 2, "duration_seconds": 4.5},
    {"id": "501694199", "subject": "Reservoir shoreline in El Oriente, location confirmed by user", "source_path": "assets/video/stock/AdobeStock_501694199.mp4", "source_kind": "Actual supplied stock footage", "start_seconds": 5, "duration_seconds": 5.5},
    {"id": "aires", "subject": "Aires de Campestre living room lifestyle scene", "source_path": "assets/video/properties/aires.mp4", "source_kind": "Camera movement over an AI lifestyle illustration; fictional adults are not filmed movement", "start_seconds": 1, "duration_seconds": 4.5},
    {"id": "monte-sereno", "subject": "Monte Sereno garden lifestyle scene", "source_path": "assets/video/properties/monte-sereno.mp4", "source_kind": "Camera movement over an AI lifestyle illustration; fictional adults are not filmed movement", "start_seconds": 1, "duration_seconds": 4.5},
    {"id": "417029984", "subject": "Sunset over a city valley and mountain slopes", "source_path": "assets/video/stock/AdobeStock_417029984.mp4", "source_kind": "Actual supplied stock footage", "start_seconds": 0, "duration_seconds": 5},
    {"id": "montana", "subject": "Casa Montana evening terrace lifestyle scene", "source_path": "assets/video/properties/montana.mp4", "source_kind": "Camera movement over an AI lifestyle illustration; fictional adults are not filmed movement", "start_seconds": 2, "duration_seconds": 5.5},
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
        source = ROOT / scene["source_path"]
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
    # Keep the growing opening sequence comfortably inside the asset size limit.
    maxrate = min(7000, int(20_000_000 * 8 * .88 / duration / 1000))
    encoding = [
        "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-maxrate", f"{maxrate}k", "-bufsize", f"{2 * maxrate}k",
        "-profile:v", "high", "-level", "3.1", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-r", str(FPS), "-g", str(FPS * 2),
        "-movflags", "+faststart", "-threads", "4",
    ]
    helper.run([*command, "-filter_complex", ";".join(filters), "-map", "[out]", *encoding, "-t", str(duration), str(output)])
    metadata = helper.validate(ffmpeg, output)
    if metadata["bytes"] >= 20_000_000:
        raise RuntimeError("Opening film exceeds the 20 MB target")
    if update_poster:
        helper.poster(ffmpeg, output, VIDEO / "dulcinea-introduction-poster.jpg")
    timeline = []
    cursor = 0
    for scene in SCENES:
        end = cursor + scene["duration_seconds"] - FADE
        timeline.append({"id": scene["id"], "section_start_seconds": cursor, "section_end_seconds": end,
                         "outgoing_dissolve_start_seconds": end - FADE, "outgoing_dissolve_end_seconds": end})
        cursor = end
    sources = [{**scene, "source_sha256": helper.sha256(ROOT / scene["source_path"])} for scene in SCENES]
    return {
        "file": output.name, **metadata, "scenes": sources,
        "crossfade_seconds": FADE,
        "method": "An eleven-scene montage of five actual city/town, sunset and reservoir clips, a camera-move film made from a supplied city photograph, and existing camera-move films made from all five AI property lifestyle illustrations. All source films retain their original speed, framing and color; short circular dissolves connect them. No new image generation or simulated human movement.",
        "source_provenance": ["assets/video/stock/provenance.json", "assets/video/stock/feature-provenance.json", "assets/video/stock/oriente-provenance.json", "assets/video/latest-photos-provenance.json", "assets/video/properties/metadata/provenance.json", "assets/images/lifestyle/provenance.json"],
        "timeline": timeline,
        "timeline_note": "Each section includes its outgoing half-second dissolve; the last dissolve returns to the opening city shot. Incoming clips begin during the preceding section's outgoing dissolve.",
        "excluded_from_opening": ["AdobeStock_539938219 countryside woman footage", "AdobeStock_787505338 city walking footage"],
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
    path.write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
