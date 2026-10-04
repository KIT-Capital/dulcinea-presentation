"""Import the user-selected Guatapé couple clip without changing its original.

Usage: python -B scripts/import-guatape-couple.py --source /path/to/file.mov --ffmpeg /path/to/ffmpeg
One canonical silent MP4 is retained. Its whole panoramic frame and timing are preserved.
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
CLIP_ID = '1164208469'


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--ffmpeg', required=True)
    args = parser.parse_args()
    helper = load('driving_metadata', 'render-stock-videos.py')
    faststart = load('driving_faststart', 'import-latest-stock.py')
    original = helper.inspect(args.ffmpeg, args.source)
    output = ROOT / f'assets/video/stock/AdobeStock_{CLIP_ID}.mp4'
    if output.exists():
        raise RuntimeError('Canonical Guatapé MP4 already exists; inspect it before replacing it.')
    poster = output.with_name(output.stem + '-poster.jpg')
    helper.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(args.source),
                '-map', '0:v:0', '-vf', 'fps=24,setpts=PTS-STARTPTS,scale=1280:720:flags=lanczos,setsar=1,format=yuv420p',
                '-an', '-sn', '-dn', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
                '-maxrate', '2800k', '-bufsize', '5600k', '-profile:v', 'high', '-level', '4.0',
                '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709',
                '-color_primaries', 'bt709', '-color_trc', 'bt709', '-r', '24', '-g', '48',
                '-t', str(original['duration_seconds']), '-movflags', '+faststart', '-map_metadata', '-1', '-threads', '4', str(output)])
    metadata = helper.inspect(args.ffmpeg, output)
    assert metadata['bytes'] < 12_000_000, 'Unexpected web asset size'
    assert metadata['audio_tracks'] == 0 and '1280x720' in metadata['video_stream']
    assert 'h264' in metadata['video_stream'] and '24 fps' in metadata['video_stream']
    assert abs(metadata['duration_seconds'] - original['duration_seconds']) < .06
    decoded = subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-progress', 'pipe:1',
                              '-i', str(output), '-map', '0:v:0', '-f', 'null', '-'],
                             capture_output=True, text=True, check=True)
    frames = int(re.findall(r'^frame=(\d+)$', decoded.stdout, re.MULTILINE)[-1])
    assert abs(frames / 24 - original['duration_seconds']) < .06
    faststart.verify_faststart(output)
    helper.poster(args.ffmpeg, output, poster)
    assert helper.sha256(args.source) == original['sha256'], 'Original source changed'
    record = {
        'id': CLIP_ID, 'subject': 'A couple smiling and kissing by the Guatapé reservoir',
        'original_filename': args.source.name, 'original_metadata': original,
        'file': output.relative_to(ROOT).as_posix(), 'optimized_metadata': metadata,
        'poster': poster.relative_to(ROOT).as_posix(), 'poster_sha256': helper.sha256(poster),
        'source_url': 'https://stock.adobe.com/video/video-of-colombian-couple-in-love-in-guatape-dam-colombia-town-near-medellin-looking-at-camera-and-kissing/1164208469',
        'rights': 'Original Adobe Stock download supplied and selected by the user. No purchase made by the agent.',
        'location_note': 'Adobe identifies Guatapé and a Colombian couple. This is a regional outing, not a portfolio property or American expat testimonial.',
        'source_handling': 'The unchanged full-quality original remains in private Dropbox. Repeated uploads with the same source hash are one stock identity.',
        'render_script': 'scripts/import-guatape-couple.py',
        'validation': {'full_stream_decode': 'pass', 'decoded_frames': frames, 'fast_start': True,
                       'original_hash_unchanged': True, 'whole_frame_preserved': True, 'under_12_MB': True},
    }
    (ROOT / 'assets/video/stock/guatape-provenance.json').write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'file': record['file'], **metadata, 'decoded_frames': frames}))


if __name__ == '__main__':
    main()
