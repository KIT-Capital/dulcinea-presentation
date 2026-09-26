# Dulcinea One

A flowing, 19-chapter HTML investor presentation based on the supplied **Dulcinea - Investor Presentation 027.pptx**. It brings lifestyle and investment together through the Medellín setting, nightlife, Lola & Ber hospitality, selected investment highlights, management, the offer and equity participation, and five property profiles. Numbers are kept light; **Dulcinea Model 07.xlsx** is retained for internal checks, not displayed as spreadsheet or financial-statement sections.

The presentation uses the supplied Dulcinea branding, the exact five-color Pantone palette, and portraits, lifestyle imagery, and property images from the source deck. Silent videos use the user's supplied Adobe Stock footage: city and town aerials establish the setting, while chefs preparing food bring the hospitality story to life. A separate nightlife animation uses slow camera moves and dissolves across the supplied DJ and crowd photographs; it does not synthesize human movement. The visual direction draws on [Radisson Resort Maldives](https://radissonresortmaldives.com/); no assets from that website are reused.

## Open the presentation

Download or clone the repository and open `index.html` in a modern browser. This single file embeds its styles, scripts, images, SVG branding, and the MP4 videos used by the presentation. It works offline without installation or a server. External source links and the email contact require their respective services.

Scroll continuously through the story, or use the previous/next buttons, Left/Right keys, and Explore menu to jump between chapters. The home gallery supports touch, horizontal scrolling, and arrow buttons. Home/End jump to the beginning/end. Fullscreen is available where the browser permits it.

Background videos are silent and play only on their active slide. The motion control pauses or resumes playback. Reduced-motion preferences start with a still image; motion can be enabled explicitly. Still images also remain available when video playback is unavailable.

## Edit and rebuild

Edit the templates, CSS, and JavaScript in `src/`, the media references in `assets/manifest.json`, and palette values in `design/palette.json`. Run either command from the repository root with **Node.js 18 or newer**:

```sh
npm run build
```

```sh
node scripts/build.mjs
```

The build uses only Node.js built-in modules. No package installation, Python, or FFmpeg is required to build the presentation. The builder writes `index.html`, embedding the original media and SVG bytes. Keep the generated file in version control so it can be opened directly.

## Optional video rendering

The optimized stock clips and edited loops are already included. To regenerate the introduction and hospitality loops from the retained optimized clips, use Python and FFmpeg:

```sh
python scripts/render-stock-videos.py
```

To re-import the four original MOV files, add `--source-dir "/path/to/Stock Video"`. Originals remain untouched and are not copied into the repository. To rebuild the nightlife animation from its retained stock photographs, run:

```sh
python scripts/render-nightlife.py
```

FFmpeg can be on `PATH`, supplied with `--ffmpeg /path/to/ffmpeg`, or provided by the optional `imageio-ffmpeg` Python package. These are rendering tools, not dependencies of the HTML build. Run the Node.js build after rendering to embed the new videos.

`scripts/render-videos.py` preserves the earlier still-image animation workflow for reference. It is superseded by the stock-footage renderer and is not part of the current build.

## Files

- `index.html`: complete offline presentation, including inline videos.
- `src/`: editable presentation template, CSS, navigation/media controls, and retained internal source material.
- `scripts/build.mjs`: dependency-free Node.js builder.
- `scripts/render-stock-videos.py`: optional optimizer and editor for the supplied stock footage.
- `scripts/render-nightlife.py`: optional renderer for camera motion across the supplied nightlife photographs.
- `scripts/render-videos.py`: superseded still-image renderer, retained for reference.
- `assets/manifest.json`: current image and video references used by the builder.
- `assets/images/investor-deck/`: images extracted from the supplied PowerPoint.
- `assets/images/stock/`: original supplied nightlife stock photographs, unchanged.
- `assets/video/`: edited loops, optimized individual stock clips, posters, and source metadata.
- `brand/`: complete original supplied brand package, preserved without changes.
- `design/`: active Pantone palette, digital values, roles, and evidence.
- `source-packages/`: original supplied PowerPoint, financial workbook, and copper logo ZIP.
- `CONTENT-SOURCES.md`: content coverage, source references, and model notes.
- `ASSET-SOURCES.md`: imagery, video, palette, and branding provenance.

## Content status

Financial figures are source projections; acquisition statuses and other business claims reflect the supplied materials and documented user corrections. This repository does not independently verify those claims or guarantee returns. See `CONTENT-SOURCES.md` and the presentation's source notes for the treatment of differences between the deck and model. Membership documents govern the investment terms. Lifestyle and market imagery is illustrative unless identified as a source property image.
