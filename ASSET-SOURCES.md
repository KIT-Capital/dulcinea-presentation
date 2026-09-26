# Asset sources

## Supplied source materials

The user supplied the investor deck, financial model, branding package, palette references, floorplan PDF, Adobe Stock video files, two Adobe Stock nightlife photographs, and later higher-quality portraits of Dov, Ricardo and Adriana. Original document copies are retained at:

- `source-packages/Dulcinea - Investor Presentation 027.pptx`
- `source-packages/Dulcinea Model 07.xlsx`
- `source-packages/PLANOS PROPIEDADES DULCINEA.pdf`

Content coverage and the handling of financial source differences are documented in `CONTENT-SOURCES.md`. Asset ownership and usage rights remain with their respective owners; inclusion in this repository does not grant an additional license.

## Supplied Dulcinea branding

The original copper logo archive is preserved at `source-packages/Dulcinea_Logo_Package_Copper.zip`. Its complete extracted package remains unchanged under `brand/`.

The presentation uses two derived full wordmarks and the supplied monochrome symbols:

- `brand/dulcinea-one/svg/dulcinea-one-white-gold.svg`
- `brand/dulcinea-one/svg/dulcinea-one-black-gold.svg`
- `brand/shared-symbol/svg/dulcinea-symbol-mono-white.svg`
- `brand/shared-symbol/svg/dulcinea-symbol-mono-black.svg`

The derived wordmarks change only the `fund-one` path fill in the supplied monochrome SVGs to Yellow Gold (#D4AF37), following the user's request to distinguish “One.” The original masters remain unchanged. The black doorway symbol also supplies the browser favicon. The builder embeds these assets as Base64 data URIs in the offline presentation and copies them unchanged for web hosting. The Lola & Ber graphic comes from the supplied PowerPoint. Dulcinea is a real estate investment firm with a unique platform focused on Medellín, Colombia, managing acquisition through sale. Dulcinea One is its first fund, co-branded by Lola & Ber Hospitality.

## Active brand palette

Both user-supplied saved pages, `Pantone Connect.html` and `Pantone Connect 2.html`, contain the same selected palette. These are the exact displayed digital values:

| Color | Pantone reference | Hex | RGB |
| --- | --- | --- | --- |
| Blue Topaz | 14-4310 TCX | `#78BDD4` | 120, 189, 212 |
| Plumeria | 15-1822 TCX | `#FB90A2` | 251, 144, 162 |
| African Violet | 16-3520 TCX | `#B085B7` | 176, 133, 183 |
| Simply Green | 17-5936 TCX | `#009B74` | 0, 155, 116 |
| Coconut Shell | 18-1230 TCX | `#874E3C` | 135, 78, 60 |

Yellow Gold (#D4AF37; RGB 212, 175, 55) was added later at the user's request as a custom digital accent. It does not come from the Pantone screenshots, and no Pantone equivalence is assigned.

Source hashes and extraction evidence are recorded in `design/palette.json`; roles are documented in `design/README.md`. The later references, `design/Dulcinea-Pantone-palette.png` and `design/Dulcinea-Pantone-swatch-values.png`, are retained unchanged and match all five RGB/HEX values. The saved application pages remain outside the repository. White, graphite and near-black are functional neutrals outside the five selected colors. Lighter fields and the blue, pink, violet and green tones carry the current layout; Coconut Shell is an accent rather than the dominant background. The original copper brand package remains intact.

## Images from the investor deck

Source still images are extracted from `Dulcinea - Investor Presentation 027.pptx` into `assets/images/investor-deck/`. The original property images remain available through each home's viewer alongside the clearly labeled AI lifestyle illustration. The media manifest supplies the builder's exact file references.

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
| `image49.png` | Original K. Dov Isaza Tuzman portrait, retained; superseded on screen by the later supplied photograph |
| `image50.png` | Original Ricardo Cidale portrait, retained; superseded on screen by the later supplied photograph |
| `image51.jpeg` | Original Adriana Suárez portrait, retained; superseded on screen by the later supplied photograph |

Source lifestyle and architectural imagery is illustrative. Inclusion does not establish that a depicted person is an investor or guest, or that an illustrative setting is an acquired property. Property images and acquisition statuses retain the source qualifications shown in the presentation.

## Team portraits

All three current team portraits use the later photographs supplied by the user directly, with their original file bytes unchanged. The website frames these photographs with CSS; it does not apply AI restoration to the selected images.

| Person | Current asset | Treatment and provenance |
| --- | --- | --- |
| K. Dov Isaza Tuzman | `assets/images/team/dov-supplied.png` | Later photograph supplied by the user, copied unchanged and used directly; no AI rendering |
| Adriana Suárez | `assets/images/team/adriana-supplied.jpeg` | Later photograph supplied by the user, copied unchanged and used directly; no AI rendering |
| Ricardo Cidale | `assets/images/team/ricardo-supplied.jpg` | Later high-quality photograph supplied by the user, copied unchanged and used directly; no AI rendering |

Provenance records are in `assets/images/team/`. Original portraits extracted from the PowerPoint remain unchanged. Earlier AI restoration candidates and their exact prompts, source hashes and review notes are retained for provenance but are not used by the presentation. Generated reconstruction in those candidates is not documentary recovery.

## User-requested AI lifestyle illustrations

Five illustrations were generated with the built-in image generation tool from the supplied property images. They show fictional adults using the homes, with illustrative furnishing arrangements. They are labeled AI lifestyle visualizations and do not document completed conditions, actual residents, or measured architecture.

All files below are under `assets/images/lifestyle/`:

| Property | Source image | PNG master | Web asset |
| --- | --- | --- | --- |
| San Lucas 101 | `image44.png` | `san-lucas.png` | `san-lucas.webp` |
| Aires de Campestre | `image45.png` | `aires.png` | `aires.jpg` |
| Fontanar 201 | `image46.jpeg` | `fontanar.png` | `fontanar.jpg` |
| Casa Monte Sereno | `image47.png` | `monte-sereno.png` | `monte-sereno.webp` |
| Casa Montana | `image48.png` | `montana.png` | `montana.webp` |

`assets/images/lifestyle/provenance.json` records source references and hashes, prompts, generation details, disclosure, and review notes. Source property images remain unchanged under `assets/images/investor-deck/`.

## Supplied floorplans

The nine-page `PLANOS PROPIEDADES DULCINEA.pdf` is preserved unchanged in `source-packages/`. Complete pages were rendered with bundled Poppler and encoded as lossless WebP at 2000 × 1125 under `assets/images/floorplans/`. No page content was cropped or rewritten; the web images match the rendered PNG pixels.

| Property | Source pages | Drawings |
| --- | --- | --- |
| San Lucas 101 | 8–9 | Floors 1 and 2 |
| Aires de Campestre | 6–7 | Floors 1 and 2, labeled Aires del Campestre |
| Fontanar 201 | 1–2 | Floors 1 and 2 |
| Casa Monte Sereno | 3–5 | Site, floor 1, and roof |
| Casa Montana | None | No plan supplied |

The user confirmed use of these four plan groups after the unit-label and area differences were identified. Source areas remain visible as supplied: Fontanar 358.41 m², San Lucas 422.46 m², and Aires printed total 315.87 m². Aires' two printed floor areas sum to 403.48 m². These differ from the presentation's property sizes and do not replace them. Unit numbers 101 and 201 are not printed in the PDF.

`content/floorplans.json` records exact page evidence, source and image hashes, the user confirmation, and retained discrepancies. The viewer provides all nine page images and the original PDF. A supplied Fontanar plan also appears in the local-specialists chapter, replacing the former illustrative chef photograph there.

## Supplied Adobe Stock footage

The user initially supplied four MOV files from the Dulcinea stock-video folder. Those originals remain unchanged in their supplied location; the large MOV files are not copied into this repository. Optimized individual versions and posters are retained under `assets/video/stock/`.

| Original filename | Original duration | Original resolution | Observed subject |
| --- | --- | --- | --- |
| `AdobeStock_80490822.mov` | 25.39 seconds | 1920 × 1080 | Chefs preparing and plating food in a professional kitchen |
| `AdobeStock_539938219.mov` | 5.76 seconds | 4096 × 2160 | Woman smiling and waving in a pasture with cattle |
| `AdobeStock_693150796.mov` | 20.75 seconds | 4096 × 2160 | Aerial movement past modern city towers and green streets |
| `AdobeStock_1849343666.mov` | 14.00 seconds | 3840 × 2160 | Aerial movement over a colonial town square and church with pedestrians |

Representative frames at 10%, 50%, and 90% of each original were visually inspected; no visible watermarks appeared in those samples. Geographic locations and licensing terms were not independently verified. Footage illustrates setting and hospitality and does not establish portfolio ownership or that depicted people work for Dulcinea. The pasture portrait appears in the closing contact chapter; it is excluded from the opening film.

Each optimized video keeps the original filename stem with an `.mp4` extension; a corresponding `-poster.jpg` is also included. Scaling preserves aspect ratio and uses a centered 16:9 crop when necessary. These initially imported clips are silent H.264 at 1280 × 720 and 24 fps, with Rec.709 color, limited range, and fast-start metadata.

The user later supplied three more MOV files. Two are unique; the third is an exact duplicate of an earlier source:

| Original filename | Original duration | Observed subject or relationship |
| --- | --- | --- |
| `AdobeStock_727024520.mov` | 32.46 seconds | Rotating overhead night aerial of an illuminated winding road and traffic |
| `AdobeStock_807462744.mov` | 10.00 seconds | Glowing green MEDELLIN neon word animation on black |
| `AdobeStock_539938219 (1).mov` | 5.76 seconds | SHA-256-identical to the earlier pasture portrait clip; its existing optimized asset is reused |

The two unique files have optimized MP4 versions and posters in the same stock folder; both appear in the after-dark sequence. Together with the city, town, pasture and chef clips, these six supplied stock videos are used. The two subsequent unique imports are documented below. The two later unique clips contain no close-up people. Road location is not inferred from the imagery. Source hashes, duplicate evidence, output metadata, and exact encoding options are recorded in `assets/video/stock/additional-provenance.json`.

## Edited stock background loops

The introduction combines footage from the supplied Adobe Stock clips with the five animated AI property illustrations. The hospitality loop uses the supplied chef footage. They replace the earlier introduction and hospitality animations made from deck still images. The after-dark sequence combines filmed stock footage with the nightlife photographic animation. Property animations and the photographic part of the nightlife sequence remain camera motion across still images.

| File | Duration | Sequence |
| --- | --- | --- |
| `assets/video/dulcinea-introduction.mp4` | 41 seconds | New aerial, retained city, Fontanar, San Lucas, city panorama, town, Aires, Monte Sereno, Montana |
| `assets/video/hospitality-people.mp4` | 14 seconds | Chefs preparing food |

The introduction uses half-second circular dissolves; the hospitality loop uses a one-second circular dissolve. Both preserve their source playback speeds, including the gentle camera movement in the property films. Matching `-poster.jpg` files provide still fallbacks. Individual optimized city and town clips are also available for location sections. MP4 files referenced by the presentation are embedded directly into `index.html` for offline playback.

`scripts/render-stock-videos.py` reproduces the optimization and edits using FFmpeg; it calls `scripts/render-introduction.py` for the expanded introduction. `assets/video/stock/provenance.json` records original and optimized file hashes and metadata; `assets/video/provenance.json` records the edited loops, their sources, encoding, and validation. Rendering tools are optional and are not required to run the Node.js HTML builder. The older `scripts/render-videos.py` remains as a superseded workflow for still-image animation.

## Property illustration camera loops

Five silent nine-second loops are rendered from the retained AI lifestyle illustration PNGs. Gentle pan and eased zoom animate the camera framing; the fictional adults remain still. These are animated still images, not filmed property footage or generated human movement.

| Property | Loop |
| --- | --- |
| San Lucas 101 | `assets/video/properties/san-lucas.mp4` |
| Aires de Campestre | `assets/video/properties/aires.mp4` |
| Fontanar 201 | `assets/video/properties/fontanar.mp4` |
| Casa Monte Sereno | `assets/video/properties/monte-sereno.mp4` |
| Casa Montana | `assets/video/properties/montana.mp4` |

Each loop is H.264, 1280 × 720 at 24 fps, with no audio and fast-start metadata. The source PNGs remain unchanged. The 16:9 framing and gentle motion were reviewed to keep the depicted adults and recognizable architectural views visible. Property chapters alternate wide film compositions and split layouts; original imagery and supplied plans remain accessible from the viewer.

Rebuild with `python scripts/render-property-videos.py`. Exact source/output hashes, camera parameters, encoding and validation are recorded in `assets/video/properties/metadata/provenance.json`.

## Nightlife photography and animation

Two additional user-supplied photographs are preserved without modification under `assets/images/stock/`:

- `AdobeStock_70649459.jpeg`: DJ and concert crowd under red and white stage lighting. Visible RECORD Dance Radio artwork remains in the image and rendered composition.
- `AdobeStock_99551296.jpeg`: a DJ mixing, with people dancing in the background.

`assets/video/medellin-nightlife.mp4` is a 13-second silent loop rendered from these still photographs. It uses deliberate crops, gentle pan/zoom, and one-second dissolves. It is not filmed nightlife footage and does not synthesize human movement. The location and venues are illustrative and have not been independently verified as Medellín. Original photographs and visible artwork are preserved.

The video is H.264, 1280 × 720, 24 fps, Rec.709 limited range, with fast-start metadata. `assets/video/medellin-nightlife-poster.jpg` provides the still fallback. `assets/video/medellin-nightlife-provenance.json` records source and output hashes, framing, encoding, and validation. Rebuild it with `python scripts/render-nightlife.py` using the retained originals; optional `--source-dir` imports them from the supplied photo folder without changing those originals.

The current after-dark chapter uses `assets/video/medellin-after-dark.mp4`, a 23-second edit. It uses the first three seconds of the supplied `AdobeStock_727024520` night-road footage, the 4.0–6.5-second excerpt of `AdobeStock_807462744` Medellín neon animation, the six-second evening-photo camera move, then the full retained 13-second photographic nightlife animation. Half-second dissolves begin at output times 2.5, 4.5 and 10 seconds. No new human motion is synthesized. It is silent H.264 at 1280 × 720 and 24 fps, with fast-start metadata. `scripts/render-after-dark.py` reproduces the edit; `assets/video/after-dark-provenance.json` records source hashes, timing, encoding and validation. The original footage and photographic animation remain unchanged.

## Visual inspiration

[Radisson Resort Maldives](https://radissonresortmaldives.com/) supplied visual direction for immersive hospitality imagery, restrained controls, and background motion. Its photographs, videos, logos, and trademarks are not reused.

## Retained assets from the earlier version

`assets/images/hospitality-concept.png` and `assets/images/medellin.jpg` remain in the repository from the earlier presentation. They are absent from the current media manifest and are not used by the current presentation.

The former is an illustrative image created with the built-in image generation tool. The latter is Gustavo Sánchez's [Medellín city and mountain photograph on Unsplash](https://unsplash.com/photos/a-view-of-a-city-with-mountains-in-the-background-uz6ElCAmQtw). Neither is evidence of an acquired Dulcinea property.

## KIT Capital cover signature

`brand/kit-capital/kit-capital.png` is the unchanged KIT Capital Partners artwork supplied in the company folder as `KIT Capital.png`. It appears only on the opening page, in the lower-right corner. It does not change Dulcinea’s stated role as the real estate investment firm and operating company.

## Photo effects

CSS adds slow, reversible camera drift to editorial and gallery photos, a soft staggered portrait reveal, and opacity-only entry for plans. The original image files remain unchanged. The shared motion control pauses photos and videos; off-screen, hidden-page and dialog states suspend animation. Reduced-motion settings keep photo effects still. Visible stock-footage captions were removed at the user’s request; original media provenance remains in this document and the video metadata.

## Re-supplied city videos

The user re-supplied `AdobeStock_787505338.mov` and `AdobeStock_807462744.mov`. The latter is the green Medellín neon animation already included in the hosted After dark sequence; the live sequence was verified against its local SHA-256. The newly imported 787505338 clip shows an adult woman walking along a tree-lined city sidewalk, with cars and a bus behind her. No exact filming location is inferred.

`assets/video/medellin-location.mp4` combines the existing city aerial with the new walking clip for Why Medellín. The walking clip is not part of the opening sequence. The original MOV files remain untouched outside the repository. The import and rendered-sequence source hashes, encoding and decode checks are recorded in `assets/video/stock/latest-provenance.json` and `assets/video/location-provenance.json`.

## Latest aerial and photographs

`AdobeStock_695926335.mov` shows a daytime aerial of a green high-rise city district and mountains. Its optimized full-bleed MP4 opens the presentation; the original is preserved outside the repository. Import details and validation are in `assets/video/stock/feature-provenance.json`.

`AdobeStock_891890158.jpeg` is the wide green city panorama used as a moving photograph within the opening sequence. `AdobeStock_259715040.jpeg` is the evening photograph used between the neon sign and the DJ/crowd scenes in After dark. Both original JPEG files are copied unchanged into `assets/images/stock/`. The six-second loops use restrained cyclic camera motion; no person or object movement is synthesized. Import hashes, crops, encoding and decode checks are in `assets/video/latest-photos-provenance.json`.

The later re-supplied `AdobeStock_727024520.mov` was also checked against the existing original SHA-256 and is an exact match. Its existing night-road segment remains in After dark; no duplicate import was needed.

## Apartment-viewing footage

The later supplied `AdobeStock_762119818.mp4` shows an agent with papers walking an adult couple through a bright apartment. The original is 27.55 seconds at 2048 × 1080 and 60 fps, with no audio. It is distinct from the eight earlier supplied stock clips; no duplicate source is copied into the repository.

A short, silent H.264 loop and matching poster appear in Buying well, beside the acquisition criteria. The full width of the scene is retained to keep all three adults visible. This illustrative viewing replaces the bathroom still in that chapter; it does not depict a verified Dulcinea property or team member. The original 174 MB source stays unchanged in the supplied stock-video folder.

`scripts/render-property-viewing.py` reproduces the web edit. Source/output hashes, exact timing, encoding and validation are recorded in `assets/video/stock/property-viewing-provenance.json`. This brings the presentation to nine unique supplied stock clips, all served as MP4.
