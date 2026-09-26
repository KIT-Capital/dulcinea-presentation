# Asset sources

## Supplied source materials

The user supplied the investor deck, financial model, branding package, saved Pantone palette pages, four Adobe Stock video files, and two Adobe Stock nightlife photographs. The original PowerPoint and workbook are retained at:

- `source-packages/Dulcinea - Investor Presentation 027.pptx`
- `source-packages/Dulcinea Model 07.xlsx`

Content coverage and the handling of financial source differences are documented in `CONTENT-SOURCES.md`. Asset ownership and usage rights remain with their respective owners; inclusion in this repository does not grant an additional license.

## Supplied Dulcinea branding

The original copper logo archive is preserved at `source-packages/Dulcinea_Logo_Package_Copper.zip`. Its complete extracted package remains unchanged under `brand/`.

The presentation uses these supplied monochrome SVG variants:

- `brand/dulcinea-one/svg/dulcinea-one-mono-white.svg`
- `brand/dulcinea-one/svg/dulcinea-one-mono-black.svg`
- `brand/shared-symbol/svg/dulcinea-symbol-mono-white.svg`
- `brand/shared-symbol/svg/dulcinea-symbol-mono-black.svg`

The black doorway symbol also supplies the browser favicon. The builder embeds the original SVG bytes as Base64 data URIs without redrawing, recoloring, or rewriting the artwork. The Lola & Ber graphic comes from the supplied PowerPoint.

## Active Pantone palette

Both user-supplied saved pages, `Pantone Connect.html` and `Pantone Connect 2.html`, contain the same selected palette. These are the exact displayed digital values:

| Color | Pantone reference | Hex | RGB |
| --- | --- | --- | --- |
| Blue Topaz | 14-4310 TCX | `#78BDD4` | 120, 189, 212 |
| Plumeria | 15-1822 TCX | `#FB90A2` | 251, 144, 162 |
| African Violet | 16-3520 TCX | `#B085B7` | 176, 133, 183 |
| Simply Green | 17-5936 TCX | `#009B74` | 0, 155, 116 |
| Coconut Shell | 18-1230 TCX | `#874E3C` | 135, 78, 60 |

Source hashes and extraction evidence are recorded in `design/palette.json`; roles are documented in `design/README.md`. The saved application pages remain outside the repository. White and graphite are functional neutrals outside the five selected colors. The original copper brand package remains intact.

## Images from the investor deck

Current still images are extracted from `Dulcinea - Investor Presentation 027.pptx` into `assets/images/investor-deck/`. The media manifest supplies the builder's exact file references.

| Source media file | Presentation use |
| --- | --- |
| `image1.png` | Architecture illustration |
| `image7.jpeg` | Medellín terrace/skyline |
| `image22.jpg` | Adults gathering in an evening setting |
| `image23.jpg` | Adults relaxing in a lounge |
| `image24.png` | Lola & Ber graphic |
| `image44.png` | San Lucas 101 property imagery |
| `image45.png` | Aires de Campestre property imagery |
| `image46.jpeg` | Fontanar 201 property imagery |
| `image47.png` | Casa Monte Sereno property imagery |
| `image48.png` | Casa Montana property imagery |
| `image49.png` | K. Dov Isaza Tuzman portrait |
| `image50.png` | Ricardo Cidale portrait |
| `image51.jpeg` | Adriana portrait |

Source lifestyle and architectural imagery is illustrative. Inclusion does not establish that a depicted person is an investor or guest, or that an illustrative setting is an acquired property. Property images and acquisition statuses retain the source qualifications shown in the presentation.

## Supplied Adobe Stock footage

The user supplied the four original MOV files from the Dulcinea stock-video folder. Those originals remain unchanged in their supplied location; the large MOV files are not copied into this repository. Optimized individual versions and posters are retained under `assets/video/stock/`.

| Original filename | Original duration | Original resolution | Observed subject |
| --- | --- | --- | --- |
| `AdobeStock_80490822.mov` | 25.39 seconds | 1920 × 1080 | Chefs preparing and plating food in a professional kitchen |
| `AdobeStock_539938219.mov` | 5.76 seconds | 4096 × 2160 | Woman smiling and waving in a pasture with cattle |
| `AdobeStock_693150796.mov` | 20.75 seconds | 4096 × 2160 | Aerial movement past modern city towers and green streets |
| `AdobeStock_1849343666.mov` | 14.00 seconds | 3840 × 2160 | Aerial movement over a colonial town square and church with pedestrians |

Representative frames at 10%, 50%, and 90% of each original were visually inspected; no visible watermarks appeared in those samples. Geographic locations and licensing terms were not independently verified. Footage illustrates setting and hospitality and does not establish portfolio ownership or that depicted people work for Dulcinea. The pasture portrait is retained as an optimized source option and is not used in the main presentation.

Each optimized video keeps the original filename stem with an `.mp4` extension; a corresponding `-poster.jpg` is also included. Scaling preserves aspect ratio and uses a centered 16:9 crop when necessary. Optimized clips are silent H.264 at 1280 × 720 and 24 fps, with Rec.709 color, limited range, and fast-start metadata.

## Edited background loops

The current loops use actual footage from the supplied Adobe Stock clips. They replace the earlier motion rendered from deck still images.

| File | Duration | Sequence |
| --- | --- | --- |
| `assets/video/dulcinea-introduction.mp4` | 18 seconds | Modern city aerial followed by colonial town aerial |
| `assets/video/hospitality-people.mp4` | 14 seconds | Chefs preparing food |

The loops use one-second dissolves and preserve the source playback speed. Matching `-poster.jpg` files provide still fallbacks. Individual optimized city and town clips are also available for location sections. MP4 files referenced by the presentation are embedded directly into `index.html` for offline playback.

`scripts/render-stock-videos.py` reproduces the optimization and edits using FFmpeg. `assets/video/stock/provenance.json` records original and optimized file hashes and metadata; `assets/video/provenance.json` records the edited loops, their sources, encoding, and validation. Rendering tools are optional and are not required to run the Node.js HTML builder. The older `scripts/render-videos.py` remains as a superseded workflow for still-image animation.

## Nightlife photography and animation

Two additional user-supplied photographs are preserved without modification under `assets/images/stock/`:

- `AdobeStock_70649459.jpeg`: DJ and concert crowd under red and white stage lighting. Visible RECORD Dance Radio artwork remains in the image and rendered composition.
- `AdobeStock_99551296.jpeg`: a DJ mixing, with people dancing in the background.

`assets/video/medellin-nightlife.mp4` is a 13-second silent loop rendered from these still photographs. It uses deliberate crops, gentle pan/zoom, and one-second dissolves. It is not filmed nightlife footage and does not synthesize human movement. The location and venues are illustrative and have not been independently verified as Medellín. Original photographs and visible artwork are preserved.

The video is H.264, 1280 × 720, 24 fps, Rec.709 limited range, with fast-start metadata. `assets/video/medellin-nightlife-poster.jpg` provides the still fallback. `assets/video/medellin-nightlife-provenance.json` records source and output hashes, framing, encoding, and validation. Rebuild it with `python scripts/render-nightlife.py` using the retained originals; optional `--source-dir` imports them from the supplied photo folder without changing those originals.

## Visual inspiration

[Radisson Resort Maldives](https://radissonresortmaldives.com/) supplied visual direction for immersive hospitality imagery, restrained controls, and background motion. Its photographs, videos, logos, and trademarks are not reused.

## Retained assets from the earlier version

`assets/images/hospitality-concept.png` and `assets/images/medellin.jpg` remain in the repository from the earlier presentation. They are absent from the current media manifest and are not used by the current presentation.

The former is an illustrative image created with the built-in image generation tool. The latter is Gustavo Sánchez's [Medellín city and mountain photograph on Unsplash](https://unsplash.com/photos/a-view-of-a-city-with-mountains-in-the-background-uz6ElCAmQtw). Neither is evidence of an acquired Dulcinea property.
