"""Import the supplied AdobeStock_695926335 clip for the private web presentation.

Usage: python scripts/import-feature-stock.py --source-dir /path/to/stock-video
       --ffmpeg /path/to/ffmpeg [--fit contain|cover]
Alternatively supply the single MOV path as a positional argument.
The original remains outside the repository and is never modified.
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
WIDTH, HEIGHT, FPS = 1280, 720, 24
MAX_BYTES = 20_000_000


def find_ffmpeg(override):
    if override:
        return override
    found = shutil.which('ffmpeg')
    if found:
        return found
    runtime = ROOT.parent / 'runtime'
    if runtime.exists():
        sys.path.insert(0, str(runtime))
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as error:
        raise SystemExit('Supply --ffmpeg, put FFmpeg on PATH, or install imageio-ffmpeg.') from error


def run(command):
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(2 * 1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def stream_info(ffmpeg, path):
    text = subprocess.run([ffmpeg, '-hide_banner', '-i', str(path)], capture_output=True, text=True).stderr
    duration = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', text)
    video = next((line.strip() for line in text.splitlines() if 'Video:' in line), '')
    dimensions = re.search(r'\b(\d{2,5})x(\d{2,5})\b', video)
    fps = re.search(r'\b([\d.]+) fps\b', video)
    if not duration or not dimensions or not fps:
        raise RuntimeError('Could not inspect video stream')
    return {
        'duration_seconds': int(duration[1]) * 3600 + int(duration[2]) * 60 + float(duration[3]),
        'width': int(dimensions[1]), 'height': int(dimensions[2]), 'fps': float(fps[1]),
        'audio_tracks': text.count('Audio:'), 'video_description': video.split('Video:', 1)[-1].strip(),
    }


def fast_start(path):
    kinds = []
    with path.open('rb') as handle:
        while True:
            head = handle.read(8)
            if len(head) < 8:
                break
            size, kind = struct.unpack('>I4s', head)
            header_size = 8
            if size == 1:
                size = struct.unpack('>Q', handle.read(8))[0]
                header_size = 16
            kinds.append(kind)
            if size == 0:
                break
            if size < header_size:
                raise RuntimeError('Invalid MP4 box')
            handle.seek(size - header_size, 1)
    return b'moov' in kinds and b'mdat' in kinds and kinds.index(b'moov') < kinds.index(b'mdat')


def relative(path):
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.name


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, nargs='?')
    parser.add_argument('--source-dir', type=Path)
    parser.add_argument('--ffmpeg')
    parser.add_argument('--fit', choices=['contain', 'cover'], default='cover')
    parser.add_argument('--poster-time', type=float, default=1.0)
    args = parser.parse_args()
    if args.source and args.source_dir:
        parser.error('Use either a single MOV path or --source-dir, not both')
    if args.source_dir:
        args.source = args.source_dir / 'AdobeStock_695926335.mov'
    if not args.source:
        parser.error('Supply the MOV path or --source-dir')
    ffmpeg = find_ffmpeg(args.ffmpeg)
    destination = ROOT / 'assets/video/stock'
    destination.mkdir(parents=True, exist_ok=True)
    output = destination / 'AdobeStock_695926335.mp4'
    poster = destination / 'AdobeStock_695926335-poster.jpg'
    if args.source.resolve() in (output.resolve(), poster.resolve()):
        raise SystemExit('Source cannot be an output file')
    source_hash = sha256(args.source)
    source_info = stream_info(ffmpeg, args.source)
    if source_info['duration_seconds'] <= 0:
        raise RuntimeError('Source has no duration')
    if args.poster_time < 0 or args.poster_time >= source_info['duration_seconds']:
        raise SystemExit('Poster time must fall inside the clip')
    if args.fit == 'contain':
        framing = f'scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos,pad={WIDTH}:{HEIGHT}:(ow-iw)/2:(oh-ih)/2:black'
    else:
        framing = f'scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=increase:flags=lanczos,crop={WIDTH}:{HEIGHT}'
    filters = f'fps={FPS},{framing},setsar=1,format=yuv420p,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709'
    # Leave container overhead headroom below the twenty-megabyte hosting budget.
    maxrate = min(4500, int(MAX_BYTES * 8 * .88 / source_info['duration_seconds'] / 1000))
    if maxrate < 600:
        raise RuntimeError('Source is too long for this high-quality 720p import budget')
    command = [ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(args.source),
               '-map', '0:v:0', '-an', '-sn', '-dn', '-vf', filters, '-c:v', 'libx264',
               '-preset', 'slow', '-crf', '21', '-maxrate', f'{maxrate}k', '-bufsize', f'{2 * maxrate}k',
               '-profile:v', 'high', '-level', '3.1', '-pix_fmt', 'yuv420p',
               '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
               '-r', str(FPS), '-g', '48', '-movflags', '+faststart', '-map_metadata', '-1',
               '-threads', '2', str(output)]
    print('Encoding full supplied clip to 720p24', flush=True)
    run(command)
    progress = run([ffmpeg, '-hide_banner', '-v', 'error', '-i', str(output), '-progress', 'pipe:1', '-f', 'null', '-'])
    frames = int(re.findall(r'(?m)^frame=(\d+)$', progress)[-1])
    output_info = stream_info(ffmpeg, output)
    if (output_info['width'], output_info['height'], output_info['fps'], output_info['audio_tracks']) != (WIDTH, HEIGHT, FPS, 0):
        raise RuntimeError('Unexpected output video format')
    if not output_info['video_description'].startswith('h264') or not fast_start(output):
        raise RuntimeError('Expected H.264 fast-start MP4')
    if abs(output_info['duration_seconds'] - source_info['duration_seconds']) > 1 / FPS + .02:
        raise RuntimeError('Unexpected output duration')
    if output.stat().st_size > MAX_BYTES:
        raise RuntimeError('Encoded file exceeds twenty megabytes')
    run([ffmpeg, '-hide_banner', '-v', 'error', '-y', '-ss', str(args.poster_time), '-i', str(output),
         '-frames:v', '1', '-q:v', '2', '-update', '1', str(poster)])
    if sha256(args.source) != source_hash:
        raise RuntimeError('Original source content changed')
    metadata = {
        'asset_id': 'AdobeStock_695926335',
        'source': {'file': args.source.name, 'sha256': source_hash, 'bytes': args.source.stat().st_size, **source_info},
        'subject': 'Daylight aerial camera movement across a green high-rise city district and mountain slopes.',
        'disclosure': 'User-supplied illustrative stock footage. Geographic identity is not independently established by the import process.',
        'render_script': 'scripts/import-feature-stock.py',
        'settings': {'width': WIDTH, 'height': HEIGHT, 'fps': FPS, 'fit': args.fit,
                     'preset': 'slow', 'crf': 21, 'maxrate_kbps': maxrate, 'bufsize_kbps': 2 * maxrate,
                     'codec': 'H.264 High / yuv420p', 'silent': True, 'fast_start': True,
                     'full_source_duration': True, 'poster_time_seconds': args.poster_time},
        'outputs': [
            {'file': relative(output), 'bytes': output.stat().st_size, 'sha256': sha256(output), **output_info},
            {'file': relative(poster), 'bytes': poster.stat().st_size, 'sha256': sha256(poster)},
        ],
        'validation': {'full_stream_decode': 'pass', 'decoded_frames': frames, 'source_hash_unchanged': True,
                       'under_20_MB': True, 'fast_start_box_order': 'pass'},
        'tool': subprocess.check_output([ffmpeg, '-version'], text=True).splitlines()[0],
        'source_handling': 'Original MOV retained outside the repository, unchanged. No credentials or personal absolute source paths recorded.',
    }
    (destination / 'feature-provenance.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf8')
    print(f"Ready: {output_info['duration_seconds']:.2f}s / {frames} frames / {output.stat().st_size:,} bytes", flush=True)


if __name__ == '__main__':
    main()
