"""Blend night-road and Medellin neon stock into the retained nightlife clip.

Usage: python scripts/render-after-dark.py --ffmpeg /path/to/ffmpeg
Optional: --road, --neon, --nightlife, --output, --review-dir. No source is modified.
Road and neon are stock video; the existing nightlife segment animates stills.
"""

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import struct
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
FPS, WIDTH, HEIGHT = 24, 1280, 720
ROAD_SECONDS, NIGHTLIFE_SECONDS, FADE_SECONDS = 3.0, 13.0, 0.5
NEON_START, NEON_SECONDS = 4.0, 2.5
DURATION = ROAD_SECONDS + NEON_SECONDS + NIGHTLIFE_SECONDS - 2*FADE_SECONDS


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


def run(command):
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode:
        raise RuntimeError(completed.stderr)
    return completed.stdout


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def portable_path(path):
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.name


def stream_info(ffmpeg, path):
    info = subprocess.run([ffmpeg,"-hide_banner","-i",str(path)],capture_output=True,text=True).stderr
    match = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)",info)
    if not match:
        raise RuntimeError(f"Could not read duration: {path}")
    seconds = int(match[1])*3600+int(match[2])*60+float(match[3])
    return seconds, info


def is_fast_start(path):
    types=[]
    with path.open("rb") as handle:
        while True:
            head=handle.read(8)
            if len(head)<8:break
            size,kind=struct.unpack(">I4s",head); header_size=8
            if size==1:size=struct.unpack(">Q",handle.read(8))[0];header_size=16
            types.append(kind)
            if size==0:break
            if size<header_size:raise ValueError("Invalid MP4 box")
            handle.seek(size-header_size,1)
    return b"moov" in types and b"mdat" in types and types.index(b"moov")<types.index(b"mdat")


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg")
    parser.add_argument("--road",type=Path,default=ROOT/"assets/video/stock/AdobeStock_727024520.mp4")
    parser.add_argument("--neon",type=Path,default=ROOT/"assets/video/stock/AdobeStock_807462744.mp4")
    parser.add_argument("--nightlife",type=Path,default=ROOT/"assets/video/medellin-nightlife.mp4")
    parser.add_argument("--output",type=Path,default=ROOT/"assets/video/medellin-after-dark.mp4")
    parser.add_argument("--review-dir",type=Path,default=ROOT.parent/"after-dark-review")
    args=parser.parse_args();ffmpeg=find_ffmpeg(args.ffmpeg)
    if args.output.resolve() in (args.road.resolve(),args.neon.resolve(),args.nightlife.resolve()):
        raise SystemExit("Output cannot overwrite an input.")
    args.output.parent.mkdir(parents=True,exist_ok=True);args.review_dir.mkdir(parents=True,exist_ok=True)
    source_hashes=[sha256(args.road),sha256(args.neon),sha256(args.nightlife)]
    road_duration,_=stream_info(ffmpeg,args.road)
    neon_duration,_=stream_info(ffmpeg,args.neon)
    nightlife_duration,_=stream_info(ffmpeg,args.nightlife)
    if road_duration<ROAD_SECONDS or neon_duration<NEON_START+NEON_SECONDS or abs(nightlife_duration-NIGHTLIFE_SECONDS)>1/FPS:
        raise RuntimeError("Expected 3 seconds of road, neon through 6.5 seconds, and the existing 13-second nightlife clip.")
    normalize=(f"fps={FPS},scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=increase:flags=lanczos,"
               f"crop={WIDTH}:{HEIGHT},setsar=1,format=yuv420p,settb=1/{FPS},setpts=PTS-STARTPTS,fps={FPS}")
    filters=(f"[0:v]trim=start=0:duration={ROAD_SECONDS},{normalize}[road];"
             f"[1:v]trim=start={NEON_START}:duration={NEON_SECONDS},{normalize}[neon];"
             f"[2:v]trim=start=0:duration={NIGHTLIFE_SECONDS},{normalize}[night];"
             f"[road][neon]xfade=transition=fade:duration={FADE_SECONDS}:offset=2.5[city];"
             f"[city][night]xfade=transition=fade:duration={FADE_SECONDS}:offset=4.5,"
             f"tpad=stop_mode=clone:stop_duration={1/FPS},"
             "format=yuv420p,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709[out]")
    command=[ffmpeg,"-hide_banner","-loglevel","error","-y","-filter_complex_threads","2",
             "-i",str(args.road),"-i",str(args.neon),"-i",str(args.nightlife),"-filter_complex",filters,"-map","[out]","-an",
             "-frames:v",str(round(DURATION*FPS)),"-r",str(FPS),"-c:v","libx264","-preset","slow","-crf","23",
             "-maxrate","1200k","-bufsize","1800k","-profile:v","high","-level","3.1","-pix_fmt","yuv420p",
             "-color_range","tv","-colorspace","bt709","-color_primaries","bt709","-color_trc","bt709",
             "-g","48","-movflags","+faststart","-map_metadata","-1","-threads","2",str(args.output)]
    print(f"Rendering {DURATION}-second after-dark sequence",flush=True);run(command)
    decode_progress=run([ffmpeg,"-hide_banner","-v","error","-i",str(args.output),
                         "-progress","pipe:1","-f","null","-"])
    decoded_frames=int(re.findall(r"(?m)^frame=(\d+)$",decode_progress)[-1])
    if decoded_frames != round(DURATION*FPS):raise RuntimeError("Unexpected frame count")
    duration,info=stream_info(ffmpeg,args.output)
    if abs(duration-DURATION)>0.005 or not all(s in info for s in ("Video: h264","1280x720","24 fps")) or "Audio:" in info:
        raise RuntimeError(f"Unexpected final stream: {info}")
    if not is_fast_start(args.output):raise RuntimeError("MP4 is not fast-start")
    if source_hashes != [sha256(args.road),sha256(args.neon),sha256(args.nightlife)]:raise RuntimeError("Source content changed")
    # Actual output samples across the crossfade and at the tail.
    samples=[0,2.458333,2.75,3.041667,4.0,4.75,5.041667,10.0,17.458333]
    for index,seconds in enumerate(samples,1):
        run([ffmpeg,"-hide_banner","-loglevel","error","-y","-ss",str(seconds),"-i",str(args.output),
             "-frames:v","1",str(args.review_dir/f"after-dark-{index:02d}.png")])
        if not (args.review_dir/f"after-dark-{index:02d}.png").is_file():
            raise RuntimeError(f"Missing review frame at {seconds} seconds")
    metadata={
        "file":portable_path(args.output),"render_script":"scripts/render-after-dark.py",
        "method":"First 3 seconds of night-road stock, then the Medellin neon stock from 4.0 to 6.5 seconds, followed by the complete existing 13-second animated-photograph nightlife sequence. Two 0.5-second dissolves begin at output times 2.5 and 4.5 seconds.",
        "disclosure":"Road and neon segments are illustrative stock video. Nightlife uses existing camera moves across supplied photographs, not filmed human movement. No new interpolation or generated human movement.",
        "sources":[
            {"file":portable_path(args.road),"sha256":source_hashes[0],"source_seconds":road_duration,"used_seconds":3,"start_seconds":0},
            {"file":portable_path(args.neon),"sha256":source_hashes[1],"source_seconds":neon_duration,"used_seconds":NEON_SECONDS,"start_seconds":NEON_START},
            {"file":portable_path(args.nightlife),"sha256":source_hashes[2],"source_seconds":nightlife_duration,"used_seconds":13,"start_seconds":0}],
        "settings":{"duration_seconds":DURATION,"frames":round(DURATION*FPS),"width":WIDTH,"height":HEIGHT,"fps":FPS,
                    "codec":"H.264 High / yuv420p","audio_tracks":0,"fast_start":True,"preset":"slow","crf":23,
                    "maxrate":"1200k","bufsize":"1800k","crossfade_seconds":FADE_SECONDS,"crossfade_offsets_seconds":[2.5,4.5]},
        "bytes":args.output.stat().st_size,"sha256":sha256(args.output),
        "tool":subprocess.check_output([ffmpeg,"-version"],text=True).splitlines()[0],
        "validation":{"full_stream_decode":"pass","source_hashes_unchanged":True,"fast_start_box_order":"pass",
                      "actual_duration_seconds":duration,"decoded_frames":decoded_frames,"review_frame_times_seconds":samples,
                      "under_2_5_MB":args.output.stat().st_size<=2500000},
        "source_preservation":"Original nightlife and stock sources remain unchanged."
    }
    (args.output.parent/"after-dark-provenance.json").write_text(json.dumps(metadata,indent=2)+"\n",encoding="utf8")
    print(f"Ready: {duration:.2f} seconds; {args.output.stat().st_size:,} bytes; H.264 720p24 silent fast-start",flush=True)


if __name__=="__main__":main()
