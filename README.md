# Dulcinea One

The website uses one header for Life here, Membership, The homes, Team and Investment. **Resources** groups PDF downloads and investor documents; Present, language flags and contact sit alongside it. Compact screens use one Menu. The former chapter bar below the hero has been removed. See [navigation validation](docs/validation-2026-10-09-navigation.md).

> **Published revision (9 October 2026):** The website contains 20 main slides with
> the new regional map, four opening benefits, brand evidence and planned-services
> explanation. The minimum and projected term are removed from the cover; the
> current-model usage example is shown per $1M. Financial sources are unchanged
> while Excel is being edited. French and language-matched PDF downloads are live. Each PDF
> mirrors the 20 online slides plus the booking appendix. The map now labels seven
> key locations and distinguishes the city and country home areas. See [map validation](docs/validation-2026-10-09-map-labels.md), [PDF validation](docs/validation-2026-10-09-localized-pdfs.md) and [revision validation](docs/validation-2026-10-09-slide-revisions.md).

> **Canonical release (9 October 2026):** Application `3c09891` was published at [invest.dulcineainvestments.org](https://invest.dulcineainvestments.org/) as Worker version `4a600dea-44ae-41a8-af83-d1247abfbd26`. Online slide 7 and the website services section say "Imagery is for illustration only." with matching Spanish and French captions. PowerPoint 036 carries the same note. All 12 public pages and three presentation PDFs match the verified build. Dov's email and WhatsApp links are active. Only formal financial statements require a password on the hosted website. See the [current handoff](docs/HANDOFF.md) and [caption release validation](docs/validation-2026-10-09-illustration-caption.md). Production is the default build; explicit review builds remain separate.

Dulcinea is a real estate investment firm focused on Medellín, Colombia. This investor website presents Dulcinea One, its first fund, with Lola & Ber as the co-brand. Lola & Ber Hospitality is the division for the properties. Dulcinea manages acquisition, renovation, operation and sale. Investors acquire fund membership units in a Delaware LLC.

The current website has seven chapters: opening, life here, membership, homes, execution, investment and next step. Its opening leads with time with family and friends in Medellín and El Oriente, describing a real estate program combining investment in five homes with member stays. Allocation, availability and membership conditions remain adjacent. Eligibility, destination links and the slow-scroll cue introduce the story; the minimum commitment and projected term appear in the offer; the offer shortcut follows. The five homes, operating approach, core team and specialists precede projected returns and the offer.

Owner use is the main benefit. The illustrative allocation of approximately 52 nights per $1 million assumes full subscription and all five homes operating; nights are allocated pro rata and remain subject to booking terms and availability. The shared annual pool phases in at 73 nights per operating home, up to 365 nights across all members. Members collectively receive 3% of Lola & Ber at full subscription, without an additional capital call or dilution, subject to membership terms. Conditional future-fund participation is on the general partner's side through the Managing Partner structure, sharing in the manager's performance profits; it does not promise future funds, distributions, GP ownership or governance rights. Owner-use costs are included in modeled returns; brand equity and future-fund participation have no modeled value.

Public projected returns appear at `#returns` before the offer at `#fund`: 14.6% projected investor IRR, 1.40× projected capital multiple and a four-year projected term, on called capital after tax and carry. Returns are not guaranteed. The offer shows a US$7M raise, US$2.1M committed, US$4.9M open and a US$100,000 minimum, with capital paid in Year 1 installments. Figures and acquisition statuses reflect the supplied approved materials, not independently verified current subscriptions or completed closings. Historical plans and release records remain in `docs/`; the current handoff and source supersede earlier hero copy, slide order and review-only restrictions.

English is the default. US, Colombian and French flag controls select English, Latin American Spanish and French. The PDF download follows the selected language, including in presentation mode; each export has 20 main slides and the booking appendix. The header provides property and program anchors, financials, criteria, and contact. The header separates section links from the Resources menu; legal and investment descriptions retain precise fund terminology. Sign-out appears only in the password-protected financial statements. Old `#slide-N` links map to corresponding sections.

## Present live

Choose **Present** in the navigation bar, or open `/#present-cover`, for the 20 main slides. The order is cover, member benefits/lifestyle, regional map, El Oriente, Medellín, Lola & Ber, planned stay services, membership terms, Monte Sereno, Montana, Fontanar, San Lucas, Aires, investment approach, core team, specialists, projected returns, offer, disclosures and Contact. Approved owner-use and booking rules are an optional appendix, opened from the membership terms slide or slide menu, outside the main slide count and ordinary Next/Previous/End sequence. Its return action and Escape return to the originating slide; a direct appendix visit returns to membership terms. Contact is the final main slide.

`content/presentation-story.json` supplies the shared sequence and titles. Canonical subject links such as `/#present-oriente` and `/#present-monte-sereno` do not depend on displayed slide numbers. Previously published `#present-1` through `#present-19` retain their old subject meanings: for example, `#present-4` opens booking detail, `#present-7` opens Lola & Ber and `#present-19` opens Contact. Older `#slide-N` migrations also remain supported.

Desktop slides use a 16:9 canvas. Phones and tablets adapt each slide to the screen with readable text, touch navigation and scrolling within longer slides. Core-team biographies appear with their portraits in both views. The specialists have their own slide, website section and linked resource page. Videos, original imagery and floorplans remain interactive. Presentation controls sit below the slide. On compact screens, Menu, slide navigation and pause/resume share one row; website exit, language and supported fullscreen actions move into Menu. Longer slides show “More on this slide” / “Más en esta diapositiva” in reserved space, followed by an end-of-slide message when readers reach the bottom.

Use the arrow or Page Up/Down keys to move, Home/End to jump to the beginning/end, the slide counter to choose a slide, and F for full screen. Escape or **Back to website** returns to the scrolling page. **Explore website** on desktop, or **Menu** on compact screens, exposes website navigation and investor resources. The closing slide has direct links to financial statements, the homes and the homepage. Section links leave slide mode and focus the corresponding website heading. The language action preserves the current slide. Full screen requires a supported browser; slide mode also works inside a normal browser window. Portrait and landscape work on phones and tablets; rotating keeps the current slide. Swipe horizontally or use the arrow buttons to change slides. Scroll vertically to read longer slides; Page Up/Down and Space scroll their content before advancing. Controls reserve their own space, including device safe areas. Native fullscreen appears only when supported; it is not required to present. The same source content feeds both views.

## Design and media

The visual direction follows the approved Aker and KOBU references recorded in `design/investor-site-reference-lock.md`, retaining the earlier Radisson lifestyle direction. The supplied palette leads: Blue Topaz, Plumeria, African Violet and Simply Green, with Coconut Shell used sparingly. Old Gold (`#CFB53B`) distinguishes “One”; Yellow Gold (`#D4AF37`) remains an interface accent. Dulcinea, KIT Capital and Lola & Ber appear together discreetly in the opening. Contact buttons say “Talk to us” / “Hable con nosotros,” with Dov retained as the named contact.

The notebook-first collection has five visible previews and one detail panel, in the order Monte Sereno, Montana, Fontanar, San Lucas and Aires. Previews select the home; only the selected detail film plays in this collection. Stable links such as `#property-monte-sereno` preserve the selected property on reload, language change and return from presentation. The original data-record order remains unchanged. Large property visuals sit alongside concise facts, area, acquisition status and drawing links. The same design and actions work in each property's individual presentation slide. The five camera-move films remain labeled as illustrations, with original imagery available. Nine plan-only drawings cover Fontanar, San Lucas, Aires and Monte Sereno; Casa Montana has no supplied plan. The original PDF is available from the viewer. The core team is Dov, Ricardo, Adriana and Natalia Carvajal. Their portraits share a neutral black-and-white treatment. Natalia's user-supplied screenshot was restored with the built-in image editing tool; edit provenance is in `design/natalia-portrait.md`. Four columns on desktop and two rows of paired profiles in presentation mode keep each person visible. Natalia is a core team member, not a specialist. Marcela Vélez and María Antonia Uribe / MAAR have separate attributed biographies and portfolio links in the specialist directory, with concise slide versions.

The current build serves 16 distinct MP4s through the website and presentation. The source library preserves 33 unique canonical videos, including unused earlier edits; the built media map contains 62 aliases, including images and floorplans. Active placements are:

| Placement | Active media |
| --- | --- |
| Website hero and presentation cover | Medellín city aerial `693150796`, served as `medellin.mp4` |
| Member lifestyle | Friends film `514654455`; slide 2 alternates it with the existing Lola & Ber pool/spa/robes film, while the website keeps its friends loop |
| El Oriente chapter and slide 4 | Complete 47.083-second green-water reservoir aerial `501694199`, served as `reservoir.mp4` |
| El Oriente supporting website scenes | Countryside woman `539938219`, El Retiro town aerial `1849343666` and original Monte Sereno garden photograph |
| Medellín chapter | `city-life.mp4`: city photograph `891890158`, dining/kitchen `80490822` and city walking `787505338`; separate website driving film `2118104932` and skyline photograph |
| Lola & Ber | `lola-ber.mp4`: adult pool footage `160473464`, the approved robe photograph, embrace and kiss, and women holding hands |
| Nightlife | `after-dark.mp4`: sunset `417029984`, videos `727024520` and `807462744`, and photos `259715040`, `70649459` and `99551296` |
| Five homes | Five nine-second camera-motion loops from the approved property illustrations, with distinct fictional guests and original property imagery available separately |
| Property viewing | Video `762119818` |
| Closing aerial | Video `695926335`, served as `closing.mp4` |

The walking woman and countryside woman remain in separate films and sections, outside the opening and closing. Repeated uploads and MOV/MP4 versions count as the same source asset. The website uses optimized MP4s and reuses canonical files rather than copying the same video under multiple names. Provenance and hashes remain in `assets/video/` and are excluded from the hosted build. Lola & Ber is an adult, sex-positive brand; its Hospitality property division remains distinct from family home-use scenes.

Videos are silent and play while visible. Motion pauses when the page is hidden or a dialog is open. Reduced-motion preferences are respected; the icon control can pause animation. Camera movement over photographs does not simulate human movement. Floorplans remain still for inspection.

Inactive property previews retain posters with `preload="none"`; selecting a home plays its detailed film and exposes its status, original imagery and plans. Nightlife is a full-width supporting film within the Medellín website chapter and is hidden while presenting the city slide. The hero uses the city aerial, and El Oriente uses the full reservoir clip rather than the earlier pine/reservoir composite. The user identifies the reservoir as El Oriente without naming it; regional footage does not imply a property's view. The original Monte Sereno photograph appears below the landscape film and remains in the property viewer.

Original raw footage remains in the controlled source library outside the repository; canonical silent MP4s and posters are retained under `assets/video/stock/`. The former introduction montage, pine footage, pine/reservoir composite and removed Guatapé outing remain preserved outside the active story. The male-running, rejected garden-reading and outdoor-gathering films are not active. Nomad Capitalist / club-DJ excerpts remain pending clean source/rights and source identification. Earlier media import evidence is recorded in `assets/video/stock/oriente-provenance.json`; homepage reference decisions are in `design/homepage-story.md`. Separate Adobe recommendations in `design/el-oriente-footage.md` remain unacquired and are not included in the app.

The property floorplan viewer prioritizes notebook screens, with direct sheet selection, fit-to-window and zoom controls. Nine plan-only drawings cover Fontanar, San Lucas, Aires and Monte Sereno, including Monte Sereno's site and roof plans. The original PDF remains available for download; no plan is assigned to Casa Montana. The supplied PNGs are encoded losslessly at their original resolution. Fontanar uses the original PDF image's transparency mask on white to correct the PNG export's black borders. Room geometry, labels and dimensions are preserved; no generative reconstruction or invented detail is used. Asset hashes and the earlier source discrepancies remain in `content/floorplans.json`.

## Source and builds

For the Replit continuation workspace, use the included Run configuration and
read [Replit handoff](docs/replit-handoff.md). It rebuilds and serves this same
source with the existing access policy. No production secrets are transferred.

The canonical repository is `KIT-Capital/dulcinea-presentation`, branch `main`.
Codex maintains the source of truth; Replit is an editable downstream copy whose
changes return to Codex for review and integration. The repository is public.
The website password gate and hosted-build exclusions do not protect files or
history committed to GitHub, including financial source records and portable
outputs already tracked. Do not commit new confidential artifacts, workbooks,
credentials or private evidence without reviewing repository access and the
material's publication scope.

The active website source is:

- `src/investor/index.html`: structure and concise English/Spanish copy; `content/locales/` supplies French.
- `src/investor/style.css`: responsive visual design.
- `src/investor/homepage-story.css`: homepage chapters, film previews and resource directory.
- `src/investor/properties.css`: notebook-first collection and individual property slides.
- `src/investor/floorplans.css`: notebook-first drawing viewer, with touch support.
- `src/investor/app.js`: language, gallery, motion, dialogs and legacy anchors.
- `src/investor/presentation.css`, `presentation-responsive.css` and `presentation.js`: desktop and responsive slideshow layouts and navigation.
- `src/investor/media.json`: canonical media aliases.
- `content/presentation-story.json`: main sequence, optional appendix, source labels and fixed legacy-number mapping.
- `src/financial-statements.html`, `src/investment-criteria.html`, `src/specialists.html` and `src/disclaimer.html`: investor resources.
- `shared/investor-navigation.mjs`: compact resource navigation, contextual presentation links and one flag selector per page, rendered from an explicit template marker.
- `shared/team.mjs`: the specialists directory shared by the website, presentation and resource page.
- `scripts/build-investor.mjs`: active builder, called by `scripts/build.mjs`.

The former slide presentation remains in `src/presentation.*` and related files. `scripts/build-legacy.mjs` is retained for reference, not used by the standard production build. `assets/manifest.json` still supplies floorplan mappings.

Run from the repository root with Node.js 22 or newer:

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

Investor pages stay concise, without Excel filenames, cells or calculation explanations. Exact values and reconciliation evidence are documented in `content/financials.json`, `CONTENT-SOURCES.md` and `design/financial-reporting-rules.md`. These tracked source records share the repository's public visibility. Membership documents govern; projected returns are not guaranteed.

The current financial source is **Dulcinea Model 10.xlsx**, reconciled on 2026-10-02. `content/model-summary.json`, `content/financials.json` and property records use the same source hash. The workbook remains outside the app. The read-only source check requires Python with openpyxl; it reads saved values and expanded formulas without modifying or recalculating the workbook. The reconciliation is recorded in `docs/model-10-reconciliation.md`.

The available Model 10 package has a different hash from the approved extraction.
The 5 October read-only comparison found equivalent saved values and formula
views across all 27 sheets, including current app references. Strict hash-gated
source verifiers still reject that package; their gates and approved source hash
have not been changed. Preserve this limitation when reporting financial source
verification; see [the recorded comparison](docs/validation-2026-10-05-impeccable.md).

## Public website and private financial statements

The configured Cloudflare Worker targets `https://invest.dulcineainvestments.org`. The homepage, presentation, investment criteria, property imagery and films, specialists, disclaimer and headline return/IRR figures are public in both languages. The approved floorplan PDF remains available from the public property viewer.

Formal financial statements require the existing name/email form and shared password. Clean URLs, `.html` URLs, English/Spanish paths, direct links and HEAD requests use the same server-side access check. `/login` defaults to the statements and includes a public website link. Sign-out appears only on the statements and returns to the public website. Names and emails are not retained or sent anywhere. This is a password gate, not OAuth.

`server/access-policy.mjs` resolves approved page aliases and the exact public media list generated as `server/public-asset-paths.mjs`. Unknown assets are denied even after sign-in. `/downloads/` (except the approved floorplan PDF) and `/private-documents/` are reserved for future private investor downloads; no new documents are enabled yet. Adding an investor download requires an explicit build allowlist and private route entry. Corporate/legal source files and source workbooks remain excluded from the hosted build and unavailable through website routes, including to signed-in users and claimed administrators. This website policy does not restrict access to any material committed to the public repository.

Sessions use an HttpOnly browser-session cookie with an eight-hour server-side maximum and no persistent remembered sign-in. Browser session restoration can restore cookies according to the visitor's browser settings. Sign-out submits a same-origin CORS POST so the browser supplies the required Origin even under the site's no-referrer policy. The session-policy version rejects cookies issued under the former persistent policy.

The branded English/Spanish 1200 × 630 JPEG cards remain the primary share images, with optional aerial-video metadata on the homepage. Every built page has localized Open Graph/Twitter metadata and its own canonical URL. Supporting pages use page-specific titles and descriptions. Shared SVG, ICO, PNG and Apple touch icons are served at conventional root paths, including on the financial login. All responses retain `noindex, nofollow` and `Cache-Control: private, no-store`. General crawling remains disallowed; named social-preview crawlers may fetch only already-public page aliases and approved assets, including shared URLs with query strings. This never bypasses access checks. `run_worker_first: true` and `html_handling: none` must remain enabled: the Worker resolves page aliases and authorizes every asset before the asset binding reads it. Approved public MP4s support single byte ranges for playback and seeking. Public content continues to work if private sign-in configuration is unavailable; private content fails closed.

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
npm run build
npm run build:site
npm run verify
npm test
npm run verify:videos
git diff --check
npm run deploy:production
```

Set `WRANGLER_CLI` to the installed official Wrangler JavaScript entrypoint before
running the production deployment command. The guard validates the existing
Worker, custom domain, access middleware, asset directory, rate limiter, allowed
branch and production build marker, then runs the build verifier. Ordinary
deployment preserves existing remote secrets. Never upload `.dev.vars`, add
`--secrets-file` or reset credentials for a design update. Initial setup requires
`INVESTOR_PASSWORD` of at least 11 characters, `SESSION_SECRET` of at least 32
characters, and the configured `LOGIN_LIMITER`. Changing either secret invalidates
existing sessions.

For financial source work, also run the read-only reconciliation commands with
the approved workbook; the package-hash limitation above must be resolved or
reported explicitly, not bypassed:

```sh
python scripts/verify-model-source.py --source "/private/path/Dulcinea Model 10.xlsx"
node scripts/verify-financials.mjs --source "/private/path/Dulcinea Model 10.xlsx"
```

Independent review publication uses `npm run build:review`,
`npm run verify:review` and `npm run deploy:review`. Review contacts are inert and
metadata uses the review origin. A private build marker outside the published
assets separates review from production. Rebuild production before any subsequent
production deployment.

The build gate checks packaged assets, language routes, navigation, inline script syntax, public share assets, team and plan coverage, and duplicate MP4s. Financial checks reconcile source values, margins, carry and cash balances. After deployment, separately verify login, wrong-password rejection, anonymous public pages and media, protected financial direct links, English/Spanish resources, video playback/range requests and logout. A successful local build does not establish a verified production release.

## Optional media rendering

Optimized files are included. Python and FFmpeg are needed only to regenerate media; original user files remain unchanged. Existing scripts include active and historical workflows; check the current media map and provenance before choosing a renderer:

- `scripts/render-review-story.py`: city-life and earlier story composites; consult each output's later provenance before rerendering.
- `scripts/render-review-brand.py` and `scripts/render-review-destinations.py`: later Lola & Ber and destination edits; the El Oriente composite is preserved, while the active scene uses the standalone reservoir clip.
- `scripts/render-introduction.py`: retained city/town, sunset, reservoir, city photograph and property montage; this is not the current hero film.
- `scripts/render-location.py`, `scripts/render-oriente.py` and `scripts/render-hospitality.py`: earlier city, countryside and Lola & Ber edits retained in the source library.
- `scripts/render-nightlife.py`, `scripts/render-latest-photos.py` and `scripts/render-after-dark.py`: photographic camera moves and nightlife source/edit workflows.
- `scripts/render-property-videos.py` and `scripts/render-property-viewing.py`: property illustration loops and the apartment-viewing excerpt.

Consult each script’s help and matching provenance before rerendering, then rebuild the website. `scripts/render-videos.py` is a superseded workflow retained for reference. Historical source packages and source maps remain under `source-packages/`, `CONTENT-SOURCES.md` and `ASSET-SOURCES.md`; apart from the approved floorplan PDF, these are excluded from the hosted build but retain the public repository's visibility. The current Model 10 workbook, latest supplied PPTX 032, some raw stock originals and local preservation evidence remain outside Git. Older models and decks in `source-packages/` are historical references, not current financial authority.
