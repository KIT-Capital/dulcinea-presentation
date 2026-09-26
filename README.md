# Dulcinea One

Dulcinea is a real estate investment firm with a unique platform focused on Medellín, Colombia. This flowing, 19-chapter presentation introduces Dulcinea One, its first fund, co-branded by Lola & Ber Hospitality. Dulcinea manages acquisition, renovation, operation and sale. It is based on the supplied **Dulcinea - Investor Presentation 027.pptx**. It brings lifestyle and investment together through the Medellín setting, nightlife, the Lola & Ber Hospitality co-brand, selected investment highlights, management, the offer and equity participation, and five property profiles. Numbers are kept light in the main story. Optional income-statement and balance-sheet menu links open a separate page using saved results from **Dulcinea Model 07.xlsx**.

The presentation uses the supplied Dulcinea branding and exact five-color Pantone palette, with lighter backgrounds and Coconut Shell reserved for accents. Wide property films alternate with split layouts to give the homes and people more space. Five user-requested AI lifestyle illustrations show fictional adults in settings based on the supplied property images. Each is labeled, and the original property imagery remains available in the viewer. PNG masters, optimized web images, and generation provenance are retained.

Silent videos use the user's supplied Adobe Stock footage: city and town aerials alternate with all five property films in the expanded opening, chefs preparing food bring the hospitality story to life, and the countryside portrait appears in the closing contact chapter. All eight distinct supplied stock clips are used. The Why Medellín chapter combines the city aerial with the later street-walking clip in a 12-second loop. The re-supplied green Medellín neon clip was verified as the same file already included in After dark. Five nine-second property loops animate the AI lifestyle stills with gentle camera motion; the people remain still. The 23-second after-dark sequence moves from night-road footage to the supplied Medellín neon animation, then into gentle camera moves across the evening and DJ/crowd photographs. The original 13-second photographic sequence is also retained. These photographic animations are not filmed human movement. The visual direction draws on [Radisson Resort Maldives](https://radissonresortmaldives.com/); no assets from that website are reused.

The opening also carries the supplied KIT Capital logo discreetly in its lower-right corner.

The current team portraits of Dov, Ricardo and Adriana use the later photographs supplied by the user, directly and unchanged. Earlier AI restoration candidates and the original deck portraits are retained as source material but are not used on screen. The local-specialists chapter uses a supplied Fontanar architectural plan.

## Open the presentation

The hosted deployment targets **https://invest.dulcineainvestments.org** on Cloudflare Workers. It uses a name/email form and shared password, matching the requested Tamarindo access pattern. This is a password gate, not OAuth. Every presentation page, financial statement, image, video and download passes through the Worker before the asset is served. The login logo and robots policy are the only public assets. Sessions expire after eight hours; names and emails are not retained or sent anywhere. Access requests go to **ricardo@kitcapital.com**.

The main offer states the $7M fund raise, $2.1M source-reported commitments and $4.9M remaining ask. Investors acquire fund membership units; detailed terms remain in the expandable offer section.

Download or clone the repository and open `index.html` in a modern browser. This single file embeds its styles, scripts, images, SVG branding, videos, and supplied floorplan PDF. It works offline without installation or a server. External source links and the email contact require their respective services.

Keep `financial-statements.html` alongside `index.html` for the optional financial menu links. This separate, self-contained page works offline and includes projected income and balance-sheet tables for the four model years, with USD units, period dates, source notes and mobile horizontal scrolling. It does not require opening or downloading the workbook.

Keep `investment-criteria.html` alongside these files for the Investment criteria link. It presents the ten acquisition tests from the supplied Buy Box, with targets distinguished from modeled results. The Explore menu groups criteria, income statement and balance sheet under Investor resources.

Scroll continuously through the story, or use the previous/next buttons, Left/Right keys, and Explore menu to jump between chapters. The home gallery supports touch, horizontal scrolling, and arrow buttons. Home/End jump to the beginning/end. Fullscreen is available where the browser permits it.

Property viewers open the lifestyle illustration, original imagery, and supplied plans with paging and zoom. Nine complete plan pages cover four homes, as confirmed by the user; source area labels are retained. Casa Montana has no supplied plan. The original PDF is available from the viewer.

Background videos are silent and play only on their active slide. The footer motion control pauses or resumes videos and photo effects together. Editorial and gallery photos have gentle camera drift, portraits have a staggered soft reveal, and plans stay still for inspection. Motion pauses while a dialog is open or the page is hidden, and only visible photos animate. Reduced-motion preferences start with a still image; motion can be enabled explicitly. Still images also remain available when video playback is unavailable.

## Edit and rebuild

Edit the templates, CSS, and JavaScript in `src/`, the media references in `assets/manifest.json`, and palette values in `design/palette.json`. Run either command from the repository root with **Node.js 18 or newer**:

```sh
npm run build
```

```sh
node scripts/build.mjs
```

The build uses only Node.js built-in modules. No package installation, Python, or FFmpeg is required to build the presentation. The builder writes `index.html`, embedding the original media and SVG bytes. Keep the generated file in version control so it can be opened directly.

The optional financial page is maintained in `src/financial-statements.html` and copied identically to the repository root by the build. Its numbers and exact source-cell references are retained in `content/financials.json`.

## Cloudflare deployment

The offline files above contain the presentation directly and do not have a password gate. Deploy only the hosted build through `wrangler.jsonc`, which requires `run_worker_first: true`. Do not deploy the repository root as a public static site.

```sh
npm run test
npm run build:site
wrangler deploy --config wrangler.jsonc --secrets-file /private/path/secrets.json --strict
```

The web build writes `dist/private-site/`: a small HTML entry point, the separate financial page, and only the assets actually referenced by the presentation. It excludes source spreadsheets, PowerPoint files, archives and internal provenance. Videos can stream separately. The supplied floorplan PDF remains a protected download.

Supply `INVESTOR_PASSWORD` (at least 11 characters) and `SESSION_SECRET` (at least 32 characters) through Cloudflare secrets. The secret file must remain outside this repository. Changing either value invalidates existing sessions. Never commit credentials or put them in browser JavaScript. The Worker requires the `LOGIN_LIMITER` binding and rejects login when configuration is missing. A local `.dev.vars` file is ignored by Git; use `PREVIEW_ONLY=true` with `wrangler dev --local` for local testing.

The custom domain must be fully registered and its zone available in the configured Cloudflare account before deployment can attach it. Cloudflare manages the custom-domain DNS and certificate. After deploying, verify private direct URLs redirect to login, valid login grants access, wrong passwords fail, videos support playback, and logout clears the session.

## Optional video rendering

The optimized stock clips and edited loops are already included. To regenerate the introduction and hospitality loops from the retained optimized clips, use Python and FFmpeg:

```sh
python scripts/render-stock-videos.py
```

The introduction opens on the latest green city aerial and combines the retained city and town footage, all five animated property films, and the latest city panorama photograph, using half-second circular dissolves. Its dedicated renderer is `scripts/render-introduction.py`; the stock renderer calls it automatically.

To re-import the initial four original MOV files, add `--source-dir "/path/to/Stock Video"`. Originals remain untouched and are not copied into the repository. The two later stock clips are retained in optimized form with encoding options in `assets/video/stock/additional-provenance.json`. To rebuild the nightlife animation from its retained stock photographs, run:

```sh
python scripts/render-nightlife.py
```

To combine the night-road and Medellín neon clips with that retained photographic sequence, run:

```sh
python scripts/render-after-dark.py
```

The result is `assets/video/medellin-after-dark.mp4`; its sequence, source hashes and validation are in `assets/video/after-dark-provenance.json`.

To rebuild the five property loops from their retained AI illustration masters, run:

```sh
python scripts/render-property-videos.py
```

This renderer records camera transforms, encoding and source hashes in `assets/video/properties/metadata/provenance.json`.

FFmpeg can be on `PATH`, supplied with `--ffmpeg /path/to/ffmpeg`, or provided by the optional `imageio-ffmpeg` Python package. These are rendering tools, not dependencies of the HTML build. Run the Node.js build after rendering to embed the new videos.

`scripts/render-videos.py` preserves the earlier still-image animation workflow for reference. It is superseded by the stock-footage renderer and is not part of the current build.

## Files

- `index.html`: complete offline presentation, including inline videos.
- `financial-statements.html`: optional offline income statement and balance sheet, also retained in `src/`.
- `src/`: editable presentation template, CSS, navigation/media controls, and retained internal source material.
- `scripts/build.mjs`: dependency-free Node.js builder.
- `scripts/render-stock-videos.py`: optional optimizer and editor for the supplied stock footage.
- `scripts/render-introduction.py`: renderer for the city, property-film and photographic opening montage.
- `scripts/render-nightlife.py`: optional renderer for camera motion across the supplied nightlife photographs.
- `scripts/render-after-dark.py`: optional editor combining night-road footage, Medellín neon and the retained nightlife animation.
- `scripts/render-property-videos.py`: optional renderer for the five nine-second property camera loops.
- `scripts/render-videos.py`: superseded still-image renderer, retained for reference.
- `assets/manifest.json`: current image and video references used by the builder.
- `assets/images/investor-deck/`: images extracted from the supplied PowerPoint.
- `assets/images/lifestyle/`: five AI illustration masters, optimized web assets, and generation provenance.
- `assets/images/team/`: three unchanged supplied team photographs, provenance, and unused earlier restoration candidates.
- `assets/images/floorplans/`: nine complete, lossless web images rendered from the supplied PDF.
- `assets/images/stock/`: original supplied nightlife stock photographs, unchanged.
- `assets/video/`: edited stock loops, nightlife animation, optimized clips, posters, and source metadata.
- `assets/video/properties/`: five nine-second animations of AI property illustrations, with camera and encoding provenance.
- `brand/`: complete original supplied brand package, preserved without changes.
- `design/`: active Pantone palette, source evidence, and the unchanged `Dulcinea-Pantone-palette.png` and `Dulcinea-Pantone-swatch-values.png` references.
- `content/floorplans.json`: page mappings, exact source evidence, user confirmation, and area differences.
- `content/financials.json`: saved income-statement and balance-sheet values, source cells, derived totals and reconciliation notes.
- `source-packages/`: original supplied PowerPoint, financial workbook, copper logo ZIP, and `PLANOS PROPIEDADES DULCINEA.pdf`.
- `CONTENT-SOURCES.md`: content coverage, source references, and model notes.
- `ASSET-SOURCES.md`: imagery, video, palette, and branding provenance.

## Content status

Financial figures are source projections; acquisition statuses and other business claims reflect the supplied materials and documented user corrections. This repository does not independently verify those claims or guarantee returns. See `CONTENT-SOURCES.md` and the presentation's source notes for the treatment of differences between the deck and model. Membership documents govern the investment terms. Lifestyle and market imagery is illustrative unless identified as a source property image.

The later street-walking source can be imported with `python scripts/import-latest-stock.py --source-dir "/path/to/Stock Video"`. Build the city-and-street sequence with `python scripts/render-location.py`. The original MOV files stay outside the repository; optimized MP4s and source hashes are retained.

Import the later aerial with `python scripts/import-feature-stock.py "/path/to/Stock Video/AdobeStock_695926335.mov"`. `scripts/render-latest-photos.py` creates the two subtle photographic loops used by the opening and After dark sequences. Source files stay unchanged. See each script’s `--help` for source arguments.
