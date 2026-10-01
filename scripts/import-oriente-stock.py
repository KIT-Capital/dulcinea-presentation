"""Optimize the supplied sunset and El Oriente reservoir clips without changing originals.

Usage: python scripts/import-oriente-stock.py --source-dir /path/to/stock-video
Creates one silent fast-start MP4 per stock ID and records private provenance.
"""
import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    {"id": "417029984", "filename": "AdobeStock_417029984 (1).mp4", "poster_time": 1,
     "subject": "Sunset and moving clouds over a city valley and green mountain slopes.",
     "location_evidence": "City setting visible in supplied footage; exact location not independently established."},
    {"id": "501694199", "filename": "AdobeStock_501694199.mp4", "poster_time": 5,
     "subject": "Overhead drone flight across a reservoir with green peninsulas and shoreline.",
     "location_evidence": "User confirmed on 2026-10-01: El Oriente in the Medellin region. No specific reservoir name or connection to a fund property is asserted."},
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', required=True, type=Path)
    parser.add_argument('--ffmpeg')
    args = parser.parse_args()
    spec = importlib.util.spec_from_file_location('stock_import', ROOT / 'scripts/import-feature-stock.py')
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    ffmpeg = helper.find_ffmpeg(args.ffmpeg)
    output_dir = ROOT / 'assets/video/stock'
    records = []
    for item in SOURCES:
        source = args.source_dir / item['filename']
        output = output_dir / f"AdobeStock_{item['id']}.mp4"
        poster = output.with_name(output.stem + '-poster.jpg')
        if source.resolve() == output.resolve():
            raise ValueError('Source must be outside the output location')
        source_hash = helper.sha256(source)
        source_info = helper.stream_info(ffmpeg, source)
        maxrate = min(4500, int(20_000_000 * 8 * .88 / source_info['duration_seconds'] / 1000))
        filters = 'fps=24,scale=1280:720:flags=lanczos:out_range=tv:out_color_matrix=bt709,setsar=1,format=yuv420p'
        encoding = ['-an', '-sn', '-dn', '-vf', filters, '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
                    '-maxrate', f'{maxrate}k', '-bufsize', f'{2 * maxrate}k', '-profile:v', 'high', '-level', '3.1',
                    '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709',
                    '-color_trc', 'bt709', '-g', '48', '-movflags', '+faststart', '-map_metadata', '-1', '-threads', '4']
        print(f"Optimizing {item['id']} ({source_info['duration_seconds']:.2f}s)", flush=True)
        helper.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source), '-map', '0:v:0', *encoding, str(output)])
        helper.run([ffmpeg, '-hide_banner', '-v', 'error', '-i', str(output), '-f', 'null', '-'])
        info = helper.stream_info(ffmpeg, output)
        assert (info['width'], info['height'], info['fps'], info['audio_tracks']) == (1280, 720, 24, 0)
        assert info['video_description'].startswith('h264') and helper.fast_start(output)
        assert abs(info['duration_seconds'] - source_info['duration_seconds']) < .07
        assert output.stat().st_size < 20_000_000
        helper.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(item['poster_time']), '-i', str(output),
                    '-frames:v', '1', '-q:v', '2', '-update', '1', str(poster)])
        assert helper.sha256(source) == source_hash
        records.append({
            'asset_id': item['id'], 'subject': item['subject'], 'location_evidence': item['location_evidence'],
            'source': {'file': source.name, 'bytes': source.stat().st_size, 'sha256': source_hash, **source_info},
            'output': {'file': output.relative_to(ROOT).as_posix(), 'bytes': output.stat().st_size, 'sha256': helper.sha256(output), **info},
            'poster': {'file': poster.relative_to(ROOT).as_posix(), 'sha256': helper.sha256(poster), 'time_seconds': item['poster_time']},
            'encoding': encoding, 'full_duration': True, 'full_stream_decode': 'pass', 'fast_start': True, 'source_unchanged': True,
        })
        print(f"Validated {item['id']}: {output.stat().st_size:,} bytes", flush=True)
    (output_dir / 'oriente-provenance.json').write_text(json.dumps({'render_script': 'scripts/import-oriente-stock.py', 'assets': records}, indent=2) + '\n', encoding='utf8')


if __name__ == '__main__':
    main()
