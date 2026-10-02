# Dulcinea One

Dulcinea is a real estate investment firm focused on Medellín, Colombia. This investor website presents Dulcinea One, its first fund, with Lola & Ber as the co-brand. Lola & Ber Hospitality is the division for the properties. Dulcinea manages acquisition, renovation, operation and sale. Investors acquire fund membership units in a Delaware LLC.

The opening introduces countryside weekends in El Oriente, city experiences in Medellín and Lola & Ber hospitality. Early Member benefits explain the shared annual allowance of 365 nights once all five homes are in service. All five property films, the investment approach, offer and projected returns follow. Member benefits appear near the opening with approved booking rules. A visible subscription summary, chapter index and resource directory supplement the existing navigation. The offer shows a $7M raise, $2.1M committed and $4.9M open. Detailed projections and acquisition criteria remain separate resources. Figures and acquisition statuses reflect the supplied materials, not independently verified current subscriptions or completed closings.

English is the default; compact American and Colombian flag controls switch between English and Spanish. The header provides property and fund anchors, financials, criteria, and contact. Sign-out appears only in the password-protected financial statements. Old `#slide-N` links map to corresponding new sections.

## Present live

Choose **Present** in the navigation bar, or open `/#present-1`, for a 19-slide presentation of the same current content. Desktop slides use a 16:9 canvas. Phones and tablets adapt each slide to the screen with readable text, touch navigation and scrolling within longer slides. The sequence opens with lifestyle, Member benefits, Owner use, El Oriente, Medellín and the Lola & Ber brand, then includes one slide per property and separate slides for the approach, offer, returns, core team and local specialists. Core-team biographies appear with their portraits in both views. The specialists have their own slide, website section and linked resource page. Videos, original imagery and floorplans remain interactive. Presentation controls sit below the slide.

Use the arrow or Page Up/Down keys to move, Home/End to jump to the beginning/end, the slide counter to choose a slide, and F for full screen. Escape or **Back to website** returns to the scrolling page. **Explore website** opens links to the homepage, properties, fund, team, specialists and investor documents; these links are also on the closing slide. Section links leave slide mode and focus the corresponding website heading. The flag button changes language without losing the current slide. Full screen requires a supported browser; slide mode also works inside a normal browser window. Portrait and landscape work on phones and tablets; rotating keeps the current slide. Swipe horizontally or use the arrow buttons to change slides. Scroll vertically to read longer slides; Page Up/Down and Space scroll their content before advancing. Controls reserve their own space, including device safe areas. Native fullscreen appears only when supported; it is not required to present. The same source content feeds both views.

## Design and media

The visual direction follows the approved Aker and KOBU references recorded in `design/investor-site-reference-lock.md`, retaining the earlier Radisson lifestyle direction. The supplied palette leads: Blue Topaz, Plumeria, African Violet and Simply Green, with Coconut Shell used sparingly. Old Gold (`#CFB53B`) distinguishes “One”; Yellow Gold (`#D4AF37`) remains an interface accent. Dulcinea, KIT Capital and Lola & Ber appear together discreetly in the opening. Contact buttons say “Talk to us” / “Hable con nosotros,” with Dov retained as the named contact.

The notebook-first gallery contains all five selected homes, named selectors, original imagery, and five camera-move films made from AI lifestyle illustrations. Large property visuals sit alongside concise facts, area, acquisition status and drawing links. The same design and actions work in each property's individual presentation slide. The illustrations remain labeled. Nine plan-only drawings cover Fontanar, San Lucas, Aires and Monte Sereno; Casa Montana has no supplied plan. The original PDF is available from the viewer. The team uses the later, unchanged photographs supplied for Dov, Ricardo and Adriana.

All eleven distinct supplied stock videos and all five supplied stock photographs are used on screen, directly or within edited films:

| Placement | Supplied stock assets |
| --- | --- |
| Opening montage | Videos `695926335`, `693150796`, `1849343666`, `417029984` and `501694199`; city photo `891890158`; all five property films |
| Medellín lifestyle film | City aerial `693150796`, dining/kitchen `80490822` and city walking `787505338` |
| El Oriente chapter | Reservoir `501694199` and countryside woman `539938219` in the main film, on the website and presentation slide; original Monte Sereno garden photo and town aerial `1849343666` in a website-only supporting row |
| Lola & Ber film | Supplied social photograph `681077127`, a close embrace and kiss, and women holding hands; a 22-second silent edit with dissolves. Male running clip deferred. |
| Nightlife film | Videos `727024520` and `807462744`; photos `259715040`, `70649459` and `99551296` |
| Property viewing | Video `762119818` |
| Closing aerial | Video `693150796` |

The walking woman and countryside woman remain in separate films and sections, outside the opening and closing. Repeated uploads and MOV/MP4 versions count as the same source asset. The website uses optimized MP4s and reuses canonical files rather than copying the same video under multiple names. Montages are distinct edits. Internal provenance and hashes remain in `assets/video/` and are excluded from the hosted build.

Videos are silent and play while visible. Motion pauses when the page is hidden or a dialog is open. Reduced-motion preferences are respected; the icon control can pause animation. Camera movement over photographs does not simulate human movement. Floorplans remain still for inspection.

All thirteen distinct hosted films are discoverable by scrolling the homepage. Property-film links select the corresponding home in the detailed viewer, including its status, original imagery and available plans. Hospitality and nightlife loop in separate chapters. The nineteen presentation steps follow the lifestyle-first opening and retain all five homes. The new city-sunset and reservoir clips appear in the opening montage; the reservoir also appears in the El Oriente chapter and its presentation slide. The user identifies the reservoir as El Oriente, without naming it. The opening starts with the reservoir, Monte Sereno and Montana before moving to city scenes. El Oriente is now the first destination chapter and slide 5, with direct links to both country homes. The original Monte Sereno photograph appears below the landscape film and remains in the property viewer.

Both newly supplied originals remain unchanged outside the repository. Canonical, silent, full-duration 720p24 MP4s and posters are retained under `assets/video/stock/`; private import evidence is recorded in `assets/video/stock/oriente-provenance.json`. Only the reservoir needs an additional standalone media alias: the city-sunset footage is served within the opening edit. The homepage reference decisions are recorded in `design/homepage-story.md`. The separate Adobe recommendations in `design/el-oriente-footage.md` remain unacquired and are not included in the app.

The property floorplan viewer prioritizes notebook screens, with direct sheet selection, fit-to-window and zoom controls. Nine plan-only drawings cover Fontanar, San Lucas, Aires and Monte Sereno, including Monte Sereno's site and roof plans. The original PDF remains available for download; no plan is assigned to Casa Montana. The supplied PNGs are encoded losslessly at their original resolution. Fontanar uses the original PDF image's transparency mask on white to correct the PNG export's black borders. Room geometry, labels and dimensions are preserved; no generative reconstruction or invented detail is used. Asset hashes and the earlier source discrepancies remain in `content/floorplans.json`.

## Source and builds

The active website source is:

- `src/investor/index.html`: structure and concise English/Spanish copy.
- `src/investor/style.css`: responsive visual design.
- `src/investor/homepage-story.css`: homepage chapters, film previews and resource directory.
- `src/investor/properties.css`: notebook-first collection and individual property slides.
- `src/investor/floorplans.css`: notebook-first drawing viewer, with touch support.
- `src/investor/app.js`: language, gallery, motion, dialogs and legacy anchors.
- `src/investor/presentation.css` and `presentation.js`: fitted slideshow layouts and navigation.
- `src/investor/media.json`: canonical media aliases.
- `src/financial-statements.html`, `src/investment-criteria.html`, `src/specialists.html` and `src/disclaimer.html`: investor resources.
- `shared/team.mjs`: the specialists directory shared by the website, presentation and resource page.
- `scripts/build-investor.mjs`: active builder, called by `scripts/build.mjs`.

The former slide presentation remains in `src/presentation.*` and related files. `scripts/build-legacy.mjs` is retained for reference, not used by the standard production build. `assets/manifest.json` still supplies floorplan mappings.

Run from the repository root with Node.js 18 or newer:

```sh
npm run build
```

This writes portable English pages at the repository root and Spanish pages under `es/`. Styles and JavaScript are inline; media and branding remain separate files. Open `index.html` from a complete clone, keeping `assets/`, `brand/`, `source-packages/` and generated resource pages in place. The portable build has no password gate and is not a self-contained HTML file. External contact services require a connection. Do not publish the repository root as a static site.

```sh
npm run build:site
```

The hosted build writes `dist/private-site/`: ten English/Spanish pages and selected media, branding and the floorplan download. It excludes Excel and PowerPoint sources, archives, internal notes and provenance. Canonical media paths allow videos to stream separately. Neither build requires Python or FFmpeg.

## Financial statements

The financial resource contains the projected income statement, statement of cash flows and balance sheet. Key profit amounts have percentage margins immediately underneath. Net income after carry is expandable: the result and margin remain visible, while deduction detail opens on request. Numeric zero entries display as blank cells; missing values are not silently converted to zero.

Investor pages stay concise, without Excel filenames, cells or calculation explanations. Exact values and reconciliation evidence remain internally in `content/financials.json`, `CONTENT-SOURCES.md` and `design/financial-reporting-rules.md`. Membership documents govern; projected returns are not guaranteed.

The current financial source is **Dulcinea Model 10.xlsx**, reconciled on 2026-10-02. `content/model-summary.json`, `content/financials.json` and property records use the same source hash. The workbook remains outside the app. The read-only source check requires Python with openpyxl; it reads saved values and expanded formulas without modifying or recalculating the workbook. The reconciliation is recorded in `docs/model-10-reconciliation.md`.

## Public website and private financial statements

The configured Cloudflare Worker targets `https://invest.dulcineainvestments.org`. The homepage, presentation, investment criteria, property imagery and films, specialists, disclaimer and headline return/IRR figures are public in both languages. The approved floorplan PDF remains available from the public property viewer.

Formal financial statements require the existing name/email form and shared password. Clean URLs, `.html` URLs, English/Spanish paths, direct links and HEAD requests use the same server-side access check. `/login` defaults to the statements and includes a public website link. Sign-out appears only on the statements and returns to the public website. Names and emails are not retained or sent anywhere. This is a password gate, not OAuth.

`server/access-policy.mjs` resolves approved page aliases and the exact public media list generated as `server/public-asset-paths.mjs`. Unknown assets are denied even after sign-in. `/downloads/` (except the approved floorplan PDF) and `/private-documents/` are reserved for future private investor downloads; no new documents are enabled yet. Adding an investor download requires an explicit build allowlist and private route entry. Corporate/legal source files and source workbooks remain excluded from the build and unavailable to all visitors, including signed-in users and claimed administrators.

Sessions use an HttpOnly browser-session cookie with an eight-hour server-side maximum and no persistent remembered sign-in. Browser session restoration can restore cookies according to the visitor's browser settings. Sign-out submits a same-origin CORS POST so the browser supplies the required Origin even under the site's no-referrer policy. The session-policy version rejects cookies issued under the former persistent policy.

The branded English/Spanish 1200 × 630 JPEG cards remain the primary share images, with optional aerial-video metadata. Public home URLs now serve the complete website and their localized metadata. All responses retain `noindex, nofollow` and `Cache-Control: private, no-store`. `run_worker_first: true` and `html_handling: none` must remain enabled: the Worker resolves page aliases and authorizes every asset before the asset binding reads it. Approved public MP4s support single byte ranges for playback and seeking. Public content continues to work if private sign-in configuration is unavailable; private content fails closed.

Access requests and contact email use `kit@kitcapital.com`. Dov’s WhatsApp link is `https://wa.me/19174284062`.

### Local Worker preview

Use an ignored `.dev.vars` file for local credentials. Keep credentials out of tracked files and browser JavaScript.

```sh
npm run build:site
wrangler dev --config wrangler.jsonc --local --ip 127.0.0.1 --port 8782 --local-upstream 127.0.0.1:8782 --upstream-protocol http --var PREVIEW_ONLY:true
```

The explicit upstream host and protocol keep local requests on loopback HTTP, which the Worker permits for preview. Production remains HTTPS-only.

### Validate and deploy an update

```sh
npm test
npm run build:site
python scripts/verify-model-source.py --source "/private/path/Dulcinea Model 09.xlsx"
node scripts/verify-financials.mjs --source "/private/path/Dulcinea Model 09.xlsx"
node scripts/verify-investor-build.mjs
wrangler deploy --config wrangler.jsonc
```

Ordinary deployment preserves existing remote secrets. Do not add `--secrets-file` or reset credentials for a design update. Initial setup requires `INVESTOR_PASSWORD` of at least 11 characters, `SESSION_SECRET` of at least 32 characters, and the configured `LOGIN_LIMITER`. Changing either secret invalidates existing sessions.

The build gate checks packaged assets, language routes, navigation, inline script syntax, public share assets, team and plan coverage, and duplicate MP4s. Financial checks reconcile source values, margins, carry and cash balances. After deployment, separately verify login, wrong-password rejection, anonymous public pages and media, protected financial direct links, English/Spanish resources, video playback/range requests and logout. A successful local build does not establish a verified production release.

## Optional media rendering

Optimized files are included. Python and FFmpeg are needed only to regenerate media; original user files remain unchanged. Dedicated renderers include:

- `scripts/render-introduction.py`: city/town, city sunset, El Oriente reservoir, city photograph and property montage.
- `scripts/render-location.py`, `scripts/render-oriente.py` and `scripts/render-hospitality.py`: separate city dining/walking, countryside and Lola & Ber social films.
- `scripts/render-nightlife.py`, `scripts/render-latest-photos.py` and `scripts/render-after-dark.py`: photographic camera moves and the combined nightlife film.
- `scripts/render-property-videos.py` and `scripts/render-property-viewing.py`: property illustration loops and the apartment-viewing excerpt.

Consult each script’s help and matching provenance before rerendering, then rebuild the website. `scripts/render-videos.py` is a superseded workflow retained for reference. Source documents and evidence remain under `source-packages/`, `CONTENT-SOURCES.md` and `ASSET-SOURCES.md`; none are public report copy.
