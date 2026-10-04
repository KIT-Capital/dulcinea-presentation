"""Add the user-supplied Adobe 160473464 clip to the approved Lola & Ber edit.

Usage: python -B scripts/render-review-brand.py --source /path/to/AdobeStock_160473464.mov --ffmpeg /path/to/ffmpeg
The original MOV and existing brand film remain unchanged. Only the review edit is produced.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--ffmpeg', required=True)
    args = parser.parse_args()
    source = args.source.resolve()
    if source.name != 'AdobeStock_160473464.mov' or not source.is_file():
        raise ValueError('Provide the supplied AdobeStock_160473464.mov')
    spec = importlib.util.spec_from_file_location('review_renderer', ROOT / 'scripts/render-review-story.py')
    review = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(review)
    # Preserve the whole people shot, including its slightly wider cinema ratio.
    review.NORMALIZE = (
        'setpts=PTS-STARTPTS,fps=24,settb=1/24,'
        'scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos:'
        'out_range=tv:out_color_matrix=bt709,pad=1280:720:(ow-iw)/2:(oh-ih)/2,'
        'setsar=1,format=yuv420p,'
        'setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709'
    )
    helper = review.load_helper('review_helpers', 'render-stock-videos.py')
    faststart = review.load_helper('review_faststart', 'import-latest-stock.py')
    original = helper.inspect(args.ffmpeg, source)
    canonical = ROOT / 'assets/video/stock/AdobeStock_160473464.mp4'
    # Decode the large MJPEG original once with bounded threads before compositing.
    helper.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-threads', '2', '-filter_threads', '1',
                '-i', str(source), '-vf', review.NORMALIZE,
                *review.ENCODING, str(canonical)])
    helper.validate(args.ffmpeg, canonical)
    scenes = [
        review.scene('160473464', 'Adult couple relaxing together at an outdoor pool', canonical.relative_to(ROOT).as_posix(), 0, 7.5,
                     original_filename=source.name, original_metadata=original,
                     source_url='https://stock.adobe.com/video/160473464',
                     rights='User supplied the original Adobe Stock clip and selected it for Lola & Ber. No stock purchase made by the agent.'),
        review.scene('approved-lola-ber', 'Approved robe photograph, embrace and kiss, and women holding hands',
                     'assets/video/hospitality-people.mp4', 0, 22,
                     source_provenance='assets/video/hospitality-provenance.json'),
    ]
    sources = {review.source_path(scene, source.parent) for scene in scenes}
    metadata = {str(path): helper.inspect(args.ffmpeg, path) for path in sources}
    result = review.render(args.ffmpeg, helper, faststart, 'lola-ber', scenes, source.parent, metadata)
    for path in sources:
        if helper.sha256(path) != metadata[str(path)]['sha256']:
            raise RuntimeError(f'Source changed: {path.name}')
    if helper.sha256(source) != original['sha256']:
        raise RuntimeError('Original Adobe MOV changed')
    result['render_script'] = 'scripts/render-review-brand.py'
    result['normalization_filter'] = review.NORMALIZE
    result['location_note'] = 'Illustrative stock people, not actual Lola & Ber guests, personnel or endorsers. The pool is not represented as a Dulcinea property.'
    result['retained_edit'] = json.loads((ROOT / 'assets/video/hospitality-provenance.json').read_text(encoding='utf-8'))
    provenance_path = ROOT / 'assets/video/review/provenance.json'
    provenance = json.loads(provenance_path.read_text(encoding='utf-8'))
    provenance['videos'] = [item for item in provenance['videos'] if item['file'] != result['file']] + [result]
    provenance_path.write_text(json.dumps(provenance, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({key: result[key] for key in ('file', 'bytes', 'duration_seconds', 'sha256')}, indent=2))


if __name__ == '__main__':
    main()
