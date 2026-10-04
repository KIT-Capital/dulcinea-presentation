"""Import the supplied country and poolside clips into the independent review.

Usage: python -B scripts/render-review-destinations.py --source-dir "/path/to/Stock Video" --ffmpeg /path/to/ffmpeg
The original downloads remain outside Git and are SHA-256 checked after rendering.
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
SCRIPT = 'scripts/render-review-destinations.py'
SOURCES = [
    ('665115389', 'Aerial movement above green countryside and woodland'),
    ('514654455', 'Adult friends sharing drinks beside an outdoor pool'),
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', required=True, type=Path)
    parser.add_argument('--ffmpeg', required=True)
    args = parser.parse_args()
    spec = importlib.util.spec_from_file_location('destination_review_renderer', ROOT / 'scripts/render-review-story.py')
    review = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(review)
    helper = review.load_helper('destination_helpers', 'render-stock-videos.py')
    faststart = review.load_helper('destination_faststart', 'import-latest-stock.py')
    normalize = (
        'setpts=PTS-STARTPTS,fps=24,settb=1/24,'
        'scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos:'
        'out_range=tv:out_color_matrix=bt709,pad=1280:720:(ow-iw)/2:(oh-ih)/2,'
        'setsar=1,format=yuv420p,'
        'setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709'
    )
    records = []
    for clip_id, subject in SOURCES:
        source = args.source_dir / f'AdobeStock_{clip_id}.mp4'
        original = helper.inspect(args.ffmpeg, source)
        output = ROOT / f'assets/video/stock/{source.name}'
        poster = output.with_name(output.stem + '-poster.jpg')
        print(f'Optimizing {source.name}', flush=True)
        helper.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-threads', '2', '-filter_threads', '1',
                    '-i', str(source), '-vf', normalize, *review.ENCODING, str(output)])
        optimized = helper.validate(args.ffmpeg, output)
        faststart.verify_faststart(output)
        if optimized['bytes'] >= 12_000_000 or '24 fps' not in optimized['video_stream']:
            raise RuntimeError(f'Unexpected optimized clip: {optimized}')
        helper.poster(args.ffmpeg, output, poster)
        decoded = subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-progress', 'pipe:1',
                                  '-i', str(output), '-map', '0:v:0', '-f', 'null', '-'],
                                 capture_output=True, text=True, check=True)
        frames = int(re.findall(r'^frame=(\d+)$', decoded.stdout, re.MULTILINE)[-1])
        if abs(frames / 24 - original['duration_seconds']) > 0.08:
            raise RuntimeError(f'Unexpected duration change: {source.name}')
        if helper.sha256(source) != original['sha256']:
            raise RuntimeError(f'Original changed: {source.name}')
        records.append({
            'id': clip_id, 'subject': subject, 'original_filename': source.name,
            'original_metadata': original, 'file': output.relative_to(ROOT).as_posix(),
            'optimized_metadata': optimized, 'poster': poster.relative_to(ROOT).as_posix(),
            'poster_sha256': helper.sha256(poster),
            'source_url': f'https://stock.adobe.com/video/{clip_id}',
            'rights': 'User supplied the original Adobe Stock download and selected it for this section. No purchase made by the agent.',
            'validation': {'full_stream_decode': 'pass', 'decoded_frames': frames, 'fast_start': True,
                           'original_hash_unchanged': True, 'whole_frame_preserved': True, 'under_12_MB': True},
        })
        print(json.dumps({'file': records[-1]['file'], **optimized}), flush=True)
    country = records[0]
    scenes = [
        review.scene(country['id'], country['subject'], country['file'], 1, 12.5,
                     original_filename=country['original_filename'], original_metadata=country['original_metadata'],
                     source_url=country['source_url'], source_provenance='assets/video/stock/destinations-provenance.json'),
        review.scene('501694199', 'Reservoir aerial in El Oriente, identified by the user',
                     'assets/video/stock/AdobeStock_501694199.mp4', 5, 12.5,
                     source_provenance='assets/video/stock/oriente-provenance.json'),
    ]
    sources = {review.source_path(scene, ROOT) for scene in scenes}
    metadata = {str(path): helper.inspect(args.ffmpeg, path) for path in sources}
    result = review.render(args.ffmpeg, helper, faststart, 'oriente-landscape', scenes, ROOT, metadata)
    result['render_script'] = SCRIPT
    result['location_note'] = 'Countryside footage selected by the user for El Oriente. It illustrates the region, not ownership of the depicted land.'
    for path in sources:
        if helper.sha256(path) != metadata[str(path)]['sha256']:
            raise RuntimeError(f'Source changed: {path.name}')
    for item in records:
        if helper.sha256(args.source_dir / item['original_filename']) != item['original_metadata']['sha256']:
            raise RuntimeError(f'Original changed: {item["original_filename"]}')
    provenance_path = ROOT / 'assets/video/review/provenance.json'
    provenance = json.loads(provenance_path.read_text(encoding='utf-8'))
    provenance['videos'] = [item for item in provenance['videos'] if item['file'] != result['file']] + [result]
    provenance_path.write_text(json.dumps(provenance, indent=2) + '\n', encoding='utf-8')
    (ROOT / 'assets/video/stock/destinations-provenance.json').write_text(json.dumps({
        'render_script': SCRIPT, 'created_on': '2026-10-04', 'normalization_filter': normalize,
        'source_handling': 'Original downloads remain outside the repository, unchanged. Optimized files preserve original timing and framing.',
        'location_note': 'Poolside friends illustrate lifestyle and are not identified as Dulcinea guests or a portfolio property.',
        'sources': records,
    }, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
