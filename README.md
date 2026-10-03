# Dulcinea One

Dulcinea is a real estate investment firm focused on Medellín, Colombia. This investor website presents Dulcinea One, its first fund, with Lola & Ber as the co-brand. Lola & Ber Hospitality is the division for the properties. Dulcinea manages acquisition, renovation, operation and sale. Investors acquire fund membership units in a Delaware LLC.

The approved 2 October 2026 storyline leads from lifestyle to El Oriente, Medellín, Lola & Ber and Member benefits before the five homes and investment case. The opening identifies the fund and retains a visible subscription summary, chapter index and direct resource links. Owner use is the main benefit; collective brand participation and conditional future-fund participation follow. The shared annual allowance reaches 365 nights once all five homes are in service, subject to the approved booking policy. Public projected returns appear at `#returns` before the offer at `#fund`. The offer shows a $7M raise, $2.1M committed and $4.9M open. Figures and acquisition statuses reflect the supplied materials, not independently verified current subscriptions or completed closings.

Implementation status: the revised source follows `docs/plans/2026-10-02-001-refactor-lifestyle-storyline-plan.md`. Local build, browser and regression checks passed; results are recorded in `docs/validation-2026-10-02-storyline.md`. Published and verified live as Cloudflare version 0a83835a-b6e4-487b-9910-a163cbd25687 (application commit 4268927).

English is the default; compact American and Colombian flag controls switch between English and Spanish. The header provides property and fund anchors, financials, criteria, and contact. Sign-out appears only in the password-protected financial statements. Old `#slide-N` links map to corresponding new sections.

## Present live

Choose **Present** in the navigation bar, or open `/#present-cover`, for the 18 main slides. The order is cover, lifestyle, El Oriente, Medellín, Lola & Ber, Member benefits, Monte Sereno, Montana, Fontanar, San Lucas, Aires, investment approach, projected returns, offer, core team, specialists, disclosures and Contact. Approved owner-use and booking rules are an optional appendix, opened from Benefits or the slide menu, outside the main slide count and ordinary Next/Previous/End sequence. Its return action and Escape return to the originating slide; a direct appendix visit returns to Benefits. Contact is the final main slide.

`content/presentation-story.json` supplies the shared sequence and titles. Canonical subject links such as `/#present-oriente` and `/#present-monte-sereno` do not depend on displayed slide numbers. Previously published `#present-1` through `#present-19` retain their old subject meanings: for example, `#present-4` opens booking detail, `#present-7` opens Lola & Ber and `#present-19` opens Contact. Older `#slide-N` migrations also remain supported.

Desktop slides use a 16:9 canvas. Phones and tablets adapt each slide to the screen with readable text, touch navigation and scrolling within longer slides. Core-team biographies appear with their portraits in both views. The specialists have their own slide, website section and linked resource page. Videos, original imagery and floorplans remain interactive. Presentation controls sit below the slide.

Use the arrow or Page Up/Down keys to move, Home/End to jump to the beginning/end, the slide counter to choose a slide, and F for full screen. Escape or **Back to website** returns to the scrolling page. **Explore website** opens links to the homepage, properties, fund, team, specialists and investor documents; these links are also on the closing slide. Section links leave slide mode and focus the corresponding website heading. The flag button changes language without losing the current slide. Full screen requires a supported browser; slide mode also works inside a normal browser window. Portrait and landscape work on phones and tablets; rotating keeps the current slide. Swipe horizontally or use the arrow buttons to change slides. Scroll vertically to read longer slides; Page Up/Down and Space scroll their content before advancing. Controls reserve their own space, including device safe areas. Native fullscreen appears only when supported; it is not required to present. The same source content feeds both views.

## Design and media

The visual direction follows the approved Aker and KOBU references recorded in `design/investor-site-reference-lock.md`, retaining the earlier Radisson lifestyle direction. The supplied palette leads: Blue Topaz, Plumeria, African Violet and Simply Green, with Coconut Shell used sparingly. Old Gold (`#CFB53B`) distinguishes “One”; Yellow Gold (`#D4AF37`) remains an interface accent. Dulcinea, KIT Capital and Lola & Ber appear together discreetly in the opening. Contact buttons say “Talk to us” / “Hable con nosotros,” with Dov retained as the named contact.

The notebook-first collection has five visible previews and one detail panel, in the order Monte Sereno, Montana, Fontanar, San Lucas and Aires. Previews select the home; only the selected detail film plays in this collection. Stable links such as `#property-monte-sereno` preserve the selected property on reload, language change and return from presentation. The original data-record order remains unchanged. Large property visuals sit alongside concise facts, area, acquisition status and drawing links. The same design and actions work in each property's individual presentation slide. The five camera-move films remain labeled as illustrations, with original imagery available. Nine plan-only drawings cover Fontanar, San Lucas, Aires and Monte Sereno; Casa Montana has no supplied plan. The original PDF is available from the viewer. The core team is Dov, Ricardo, Adriana and Natalia Carvajal. Their portraits share a neutral black-and-white treatment. Natalia's user-supplied screenshot was restored with the built-in image editing tool; private edit provenance is in `design/natalia-portrait.md`. Four columns on desktop and two rows of paired profiles in presentation mode keep each person visible. Natalia no longer appears in the specialists directory.

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

All thirteen distinct hosted films remain available on the homepage through chapter playback or property selection. Inactive property previews retain posters with `preload="none"`; selecting a home plays its detailed film and exposes its status, original imagery and plans. Nightlife is supporting content within the Medellín website chapter and is hidden while presenting the city slide. The city-sunset and reservoir clips remain in the opening montage; the reservoir also appears in the El Oriente chapter and presentation slide 3. The user identifies the reservoir as El Oriente, without naming it. Regional footage does not imply a property's view. The opening starts with the reservoir, Monte Sereno and Montana before moving to city scenes. The original Monte Sereno photograph appears below the landscape film and remains in the property viewer.

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
- `content/presentation-story.json`: main sequence, optional appendix, bilingual labels and fixed legacy-number mapping.
- `src/financial-statements.html`, `src/investment-criteria.html`, `src/specialists.html` and `src/disclaimer.html`: investor resources.
- `shared/investor-navigation.mjs`: compact resource navigation, contextual presentation links and one flag selector per page, rendered from an explicit template marker.
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

Financials, criteria, specialists and disclosures share compact navigation and logo scale. Financials use a smaller masthead; acquisition criteria retain their notebook overview; legal body text retains its modest scale. The flag links preserve the current fragment across English and Spanish. Sign-out remains in the financial-statement navigation only. These header changes do not alter financial row markers, statement content or access policy.

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
python scripts/verify-model-source.py --source "/private/path/Dulcinea Model 10.xlsx"
node scripts/verify-financials.mjs --source "/private/path/Dulcinea Model 10.xlsx"
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
