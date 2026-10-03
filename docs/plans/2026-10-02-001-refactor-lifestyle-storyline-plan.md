---
title: "Refactor Dulcinea's website and presentation storyline"
type: refactor
status: complete
date: 2026-10-02
baseline: 5396738
depth: standard
---

# Dulcinea storyline implementation plan

Implemented and published on 2 October 2026. Release evidence, tested coverage and the source-hash qualification are recorded in `docs/validation-2026-10-02-storyline.md`.

## Purpose and boundaries

Make the experience of using these homes understandable before asking visitors to inspect property specifications and investment economics. Identify Dulcinea One as a fund from the opening, and keep investment information easy to reach throughout.

This plan implements the storyline proposed in the conversation on 2 October 2026. It covers the scrolling website, its presentation mode, bilingual navigation, property discovery and a bounded consistency pass on resource-page headers. It preserves existing menus, financial values, approved membership terms, property evidence and access controls.

This document is the planning deliverable. Application changes, builds, tests, commits and deployment are implementation work; none is claimed complete by this plan.

### References and precedence

- The user's latest storyline request and the preceding 18-slide recommendation govern this revision.
- [Radisson Resort Maldives](https://radissonresortmaldives.com/), reviewed on 2 October: establish the investment proposition early; build interest through destination and resort experience; show residences and plans; follow with operating economics, credentials and contact. Borrow the sequence, not its investment claims, ownership structure or amenities.
- `design/investor-site-reference-lock.md`: preserve Dulcinea's palette, notebook-first proportions, KOBU-inspired property imagery and factual drawing viewer. The Lola & Ber chapter retains its supplied brand direction.
- `design/homepage-story.md`: existing media placement and historical design decisions. Its older slide counts and earlier Lola & Ber imagery descriptions are superseded where they conflict with the latest user instructions and current assets.
- `content/investor-terms.json`, `docs/model-10-reconciliation.md`, `shared/investor-disclosures.mjs` and `shared/team.mjs`: existing terms, financial basis, disclosures and personnel remain authoritative for content.
- `assets/video/hospitality-provenance.json` and `design/lola-ber-broll-shortlist.md`: the approved embrace and handholding footage is already live. The male-running candidate remains deferred.
- Apply the installed KIT writing guidance to new copy. Full sentences with concrete benefits; no new slogans or invented claims. The user's requested property coverage and 18-slide sequence take precedence over a generic shorter-deck target.

## Requirements

| ID | Required outcome |
| --- | --- |
| R1 | Lead through lifestyle, El Oriente, Medellín, Lola & Ber and member benefits before detailed property and investment sections. |
| R2 | Keep 18 main presentation slides; booking rules are optional detail and never the normal last slide. |
| R3 | Provide one clear property browsing path, with both country homes first and all five homes individually presentable. |
| R4 | Preserve every approved value, qualification, booking clause, original photograph and available drawing. |
| R5 | Retain the existing visual identity while varying chapter compositions and removing redundant labels and repeated browsing. |
| R6 | Keep existing direct links meaningful, including old presentation numbers; preserve language and context when changing modes. |
| R7 | Keep all approved media represented in the correct context; do not add deferred footage or imply unverified amenities or locations. |
| R8 | Maintain notebook usability, phone/iPad presentation, accessible controls, motion preferences and current financial-resource protection. |

## Storyboard to implement

These chapter names describe content roles. Final headings follow KIT's short, objective style; they are not required marketing slogans.

| Main slide | Subject | Homepage treatment and purpose |
| --- | --- | --- |
| 1 | Dulcinea One | Existing countryside-led opening film; a direct sentence describing the fund and member-use proposition. Keep the compact subscription strip and navigation immediately available. |
| 2 | The lifestyle | A short editorial introduction showing how city and country stays differ. Use specific available imagery; avoid repeating the cover claim. |
| 3 | El Oriente | Reservoir/countryside film, then a quieter town/garden composition. Lead into the two country homes. Regional scenery is not a claim about a property's view. |
| 4 | Medellín | City life, El Poblado, dining and social experiences. Place the existing after-dark material here as supporting homepage media, so it no longer interrupts the transition from properties to investment. |
| 5 | Lola & Ber | Retain the current brand copy, robe photograph and two approved connection clips. Hospitality identifies the property division; no restaurant-brand association. |
| 6 | Member benefits | Owner use is the main benefit; collective brand equity and conditional future participation are supporting rows. Keep booking rules behind an explicit action. |
| 7 | Casa Monte Sereno | Individual property facts, film, original imagery and three supplied drawing choices. |
| 8 | Casa Montana | Individual property facts, film and original imagery. No invented floorplan action. |
| 9 | Fontanar 201 | Individual property facts, film, originals and two supplied plans. |
| 10 | San Lucas 101 | Individual property facts, film, originals and two supplied plans. |
| 11 | Aires de Campestre | Individual property facts, film, originals and two supplied plans. |
| 12 | Investment approach | Explain acquisition, renovation, rental operation and sale. Name the existing execution responsibilities and distinguish closed acquisitions from negotiations before introducing returns. |
| 13 | Projected returns | Public headline projections with their existing qualifications; direct links to protected pro forma statements. |
| 14 | The offer | Target raise, committed and available amounts, minimum subscription, capital timing and one primary contact action. |
| 15 | Core team | Dov, Ricardo and Adriana, with current portraits, roles and concise biographies. |
| 16 | Specialists | Preserve all five specialists, including Natalia Carvajal, and verified links. |
| 17 | Disclosures | Existing concise content, legible and visually subordinate; full disclosure resource remains available. |
| 18 | Contact | Medellín drone film, Talk to us, Dov's WhatsApp, website destinations and investor-resource links. |

Booking rules remain a collapsible website section at `#owner-use`. In presentation mode they open an optional appendix from Member benefits or the presentation menu. The appendix has a clear return action and is excluded from the 18-slide counter and ordinary Next/Previous/End sequence.

## Design decisions

| Decision | Basis | Implementation boundary |
| --- | --- | --- |
| Keep the fund visible early | Radisson's early investor context; user's emphasis on the offer and ask | Compact opening summary, not a financial slide before the destination story. |
| Use distinct section compositions | User's concern about repetitive AI-looking design; existing reference lock | Opening and Oriente remain immersive; city material uses shorter frames; benefits use an editorial layout; homes have factual detail panels; economics use aligned figures and restrained rules. |
| Preserve the supplied palette | Explicit user direction | Old-gold One, restrained brown and existing Dulcinea colors; no new font family or palette. L&B's serif/green/cream treatment stays confined to its brand chapter. |
| Make each film explain its chapter | User's media-context corrections | No new stock purchase or generation. Keep approved films, stills and original-photo actions. |
| Remove duplicated home browsing | Current selector plus second five-film grid duplicates the same collection | Five visible previews select one inline detail panel; all five individual presentation slides remain. |
| Keep source content shared | Current site/presentation architecture | Reuse authored DOM and property records instead of writing a second copy of the story for slides. |
| Standardize resource headers | Current visual audit: financials/criteria use different header scales and typography | Shared navigation, logo scale and heading roles only. Preserve specialized table, drawing and legal-content layouts. |

## Technical approach

The app is built from HTML, CSS and JavaScript by `scripts/build-investor.mjs`. It already produces portable and hosted English/Spanish pages, embeds scripts and uses a canonical media alias map. Preserve this architecture; no framework migration or new build dependency is needed.

Add a small `content/presentation-story.json` describing main slide order, optional appendix, bilingual labels, stable property keys and the old numeric-link mapping. The builder injects this configuration alongside the existing asset configuration. Presentation controls and menu labels read the same order. This is sequence metadata only; it must not duplicate financial terms or marketing paragraphs.

Use canonical subject links such as `#present-oriente`, `#present-monte-sereno` and `#present-owner-use`. Keep a fixed compatibility map for the 19 previously published numeric links. For example, `#present-7` still opens Lola & Ber, `#present-4` opens booking detail, and `#present-19` still opens Contact. Newly generated links use subjects, not the new displayed numbers. Preserve existing website anchors, including `#home`, `#homes`, `#fund`, `#owner-use` and `#after-dark`.

Preserve the still-older `#slide-N` migration in `src/investor/app.js`. The build verifier currently accepts fragment links only when they match a literal DOM ID; validate presentation fragments against the same route registry rather than exempting arbitrary hashes.

Country-first display order must not change a property's identity. Preserve existing record indexes where legacy code depends on them and resolve display order through stable keys. A tab position must never become the source of a film or floorplan association.

Give each property a durable website destination, such as `#property-monte-sereno`, backed by an explicit preview anchor and selection handler. Keep `#homes` as the collection entry. Direct loads, reloads, language switches and presentation exit preserve a property's key. A fresh collection entry defaults to the first country home; an existing selection remains when returning within the same page.

Move the current return projection block out of the offer's nested display dependency into a dedicated `#returns` section. Both website and presentation can then show returns before the ask without hiding or duplicating content. Keep `#fund` as the offer destination.

## Implementation units

### U1. Establish sequence and route compatibility

**Goal / requirements:** R2, R6. Make reordering safe for existing links and introduce optional booking detail.

**Dependencies:** None.

**Files:** `content/presentation-story.json` (new), `src/investor/presentation.js`, `scripts/build-investor.mjs`, `scripts/verify-investor-build.mjs`.

**Approach:** Separate main-slide order from optional appendix state. Resolve old numeric routes through the fixed compatibility map. Reuse existing presentation enter/exit, language, modal, keyboard and touch behavior. Record the originating subject before opening booking detail; direct appendix visits return to Member benefits. Do not fill browser history with one entry for every arrow-key advance.

Introduce compatibility/configuration support first, but activate the new main order only when U2 supplies every target, including `#returns`. Complete the 18-slide traversal acceptance after U1/U2 integration; never release a registry pointing at missing DOM sections.

**Verification scenarios:**

1. Every old numeric route 1–19 resolves to its previous subject in both languages; new canonical links remain correct regardless of display order.
2. A full normal traversal contains 18 slides and ends at Contact. End never opens the appendix.
3. Booking detail opens from Benefits, returns to the originating subject and preserves language, fullscreen state and intended focus. Direct loads have a deterministic return to Benefits.
4. Reload, browser Back/Forward and language switching do not produce hidden content or lose the current subject. Invalid subjects/numbers fall back safely to the cover.
5. Appendix Escape returns to the originating slide; subsequent Escape exits presentation normally. Open drawing dialogs retain their own keyboard priority.

Use the existing build verifier for generated-config/link coverage and browser verification for actual navigation and state. Avoid tests that merely repeat the array order without checking generated outputs.

### U2. Reshape the homepage narrative and copy

**Goal / requirements:** R1, R4, R5, R7. Build interest before property specifications and economics without thinning the homepage.

**Dependencies:** U1 for sequence metadata and stable targets.

**Files:** `src/investor/index.html`, `src/investor/style.css`, `src/investor/homepage-story.css`, `src/investor/presentation.css`, `src/investor/presentation-responsive.css`, `src/investor/app.js`, `scripts/verify-investor-build.mjs`.

**Approach:** Reorder actual document sections and the chapter index together. Move Member benefits after L&B. Move after-dark media into the Medellín chapter while retaining its anchor. Give owner use the primary benefits treatment; replace the forced equal-weight 365 / 3% / Priority arrangement with a clear main benefit and supporting rows. Extract public returns into `#returns` before `#fund`. Update current presentation selectors and CSS coupled to `#fund > details.model`. Keep all new copy authored in English and Colombian Spanish together.

Keep presentation targets as direct `#main` children, matching the existing hide/inert logic. The nested after-dark panel is homepage support and must be hidden while presenting the city slide. Preserve existing video nodes: the motion controller captures its video/dialog list at initialization, so late-created clones would require explicit registration. The new `#returns` section must satisfy the same visibility and details-state restoration behavior as the previous shared fund section.

**Verification scenarios:**

1. Generated EN/ES pages follow the new chapter order; the build verifier's old benefits-before-destinations assertion is replaced with the approved order.
2. The opening identifies the fund and provides immediate access to the offer, financials and criteria without requiring the full scroll.
3. All current benefit terms and qualifiers remain available; no part of the booking policy is deleted to meet a headline or slide-length target.
   Keep a nearby statement that fund membership does not convey title to an individual home and use remains subject to membership/booking terms. The early description must not imply unrestricted access.
4. Offer and return values exactly match the current approved content. Public projections remain visible without sign-in.
5. After-dark footage remains discoverable and geographically appropriate. Moving it does not create two simultaneously playing copies.

Copy and spacing changes need rendered review rather than unit tests that restate markup. Review the hero, destination transitions, L&B, benefits, approach, returns and ask at notebook size before expanding checks.

### U3. Consolidate property discovery

**Goal / requirements:** R3, R4, R6. Offer five visible previews and one detailed inspection path, country homes first.

**Dependencies:** U1; integrate into U2's reordered collection chapter.

**Files:** `src/investor/index.html`, `src/investor/app.js`, `src/investor/properties.css`, `src/investor/presentation.js`, `src/investor/presentation.css`, `src/investor/presentation-responsive.css`, `scripts/verify-investor-build.mjs`.

**Approach:** Retain five visible film previews but make them the primary selector for one adjacent/below inline detail panel. Remove the duplicate five-tab browsing surface or reduce it to necessary Previous/Next controls. Selection reveals the appropriate details, brings them into view below the header, writes the stable property destination and announces the selected property. Preserve useful dimensions and visible selected state. In the collection, only the selected detail film plays; inactive previews show posters and retain `preload="none"`. Update the current all-intersecting-video playback rule so it does not start five preview downloads simultaneously. Every film remains available by selecting its home. Presentation continues to use the same detail renderer, showing one property per slide.

**Verification scenarios:**

1. Preview, Previous/Next and presentation property navigation follow Monte Sereno, Montana, Fontanar, San Lucas, Aires without changing underlying associations.
2. Each home opens the correct original imagery and film. Fontanar retains plans 1/2, San Lucas 8/9, Aires 6/7, Monte Sereno 3/4/5, and Montana no drawing action.
3. Floorplan fit, zoom, pan, page selection, close/focus return and approved PDF download work from both modes.
4. A direct country-home link selects that home even when reached before the collection is visible. Presentation-to-website return preserves the selected home.
   Reload, opening the property link in another tab and changing language must preserve that selection too; missing/unknown property keys return safely to the collection.
5. Keyboard selection works; selection feedback is not color-only. On phone/tablet, a plan-pan or vertical scroll does not trigger slide navigation.

### U4. Fit and finish the shared presentation

**Goal / requirements:** R2, R5, R8. Make the revised story usable as a presentation on notebooks, phones and iPads.

**Dependencies:** U1–U3.

**Files:** `src/investor/presentation.js`, `src/investor/presentation.css`, `src/investor/presentation-responsive.css`, `src/investor/index.html`, `src/investor/app.js`, `scripts/verify-investor-build.mjs`.

**Approach:** Give each main slide one purpose and a deliberate composition. Reuse current 16:9 canvas on sufficient viewports and the existing responsive presentation layout on smaller screens. Keep the booking appendix independently scrollable where necessary. Update slide titles, counters, menu groups and website-return destinations from the same metadata. Keep Contact as the final main slide with working website and resource links.

**Verification scenarios:**

1. All 18 EN/ES slides render without cropped headings, toolbar overlap or unreachable actions at 1366×768 and 1280×720; check 1440×900 as a larger notebook view.
2. At 390×844, 768×1024 and 1024×768, controls, vertical overflow and swipes work without trapping content or interfering with pinch zoom.
3. Arrow keys, Space, Page Up/Down, Home/End, menus, fullscreen entry/exit and resource links preserve the expected slide and focus.
4. Only relevant visible films play. Films pause behind dialogs, in hidden tabs and under reduced-motion preferences; still posters remain usable.
5. A complete pass in each language includes every property, benefits, investment story, personnel and disclosure content.

### U5. Align supporting-page navigation

**Goal / requirements:** R5, R6, R8. Make financials, criteria, specialists and disclosures feel part of the same app.

**Dependencies:** U1 and U2 establish canonical return destinations.

**Files:** `shared/investor-navigation.mjs` (new, if a shared template is needed), `scripts/build-investor.mjs`, `src/financial-statements.html`, `src/investment-criteria.html`, `src/specialists.html`, `src/disclaimer.html`, `scripts/verify-investor-build.mjs`. Regression coverage: `server/worker.test.mjs`.

Use `scripts/verify-financials.mjs` for numerical regression verification. Preserve section and `data-id` row markers used by `scripts/refresh-financial-model.py`; do not refresh or rewrite the model as part of the header pass.

**Approach:** Reuse the compact homepage navigation, logo sizing and heading roles. Keep an explicit website return, access to relevant resources and the existing flag switch. Reduce the financial masthead so useful statement rows appear earlier on a notebook. Preserve financial tables, collapse behavior, blank zero cells and KPI percentages. Preserve authenticated Sign out where it belongs; do not move or change authentication as a design task.

Replace the builder's exact-string resource-header injection with an explicit navigation/language placeholder or the shared renderer. The current `</a></div><div class="hero">` match is brittle under header changes. Each generated resource page must have exactly one functioning flag switch.

**Verification scenarios:**

1. Resource links and language switches preserve the appropriate destination and fragment in both hosted and portable outputs.
2. Financial-table values and visibility behavior are unchanged. A before/after content comparison catches unintended edits.
3. Anonymous visitors can view the homepage, criteria, public returns and disclosures; formal statements still require login. Login returns to the requested statement and Sign out ends access.
4. Source Excel, PPTX, company and legal files remain excluded from all app/admin downloads. The existing floorplan PDF exception is preserved.
5. Acquisition criteria still fit above the fold at notebook size. Disclosure body text retains its current modest, legible scale; shared typography changes are limited to navigation and headings, not enlargement of legal paragraphs.

Full resource-page redesign and financial-content rewrites are outside this unit.

### U6. Verify and release the complete revision

**Goal / requirements:** R1–R8. Publish a coherent story only after the two modes and languages agree.

**Dependencies:** U1–U5.

**Files:** `scripts/verify-investor-build.mjs`, `server/worker.test.mjs`, `server/video-range.test.mjs`, `README.md`, `design/homepage-story.md`, `design/investor-site-reference-lock.md`, `CONTENT-SOURCES.md`. Generated site outputs and `server/video-sizes.mjs` remain build products.

**Approach:** Generate portable and hosted builds from source templates. Update active documentation to the 18-slide order and optional appendix; label older validation history clearly. Review an authenticated local preview as well as the public route before deployment. Commit and push the reviewed release, then publish through the existing Cloudflare configuration. No credential rotation or infrastructure change is needed.

**Release acceptance:**

1. Investor-build verification passes for EN/ES content, all five homes/nine drawings, links, scripts, media aliases and document exclusion.
   Update the verifier's old fixed property order `[0,1,2,3,4]` to assert country-first discovery without weakening checks for all five distinct records. Verify the new returns section is visible by default instead of retaining an obsolete nested-`details` markup assertion.
2. Existing worker and video-range tests pass; complete one actual login, protected-resource and logout journey.
3. Notebook screenshots show the opening, transitions, benefits, selected country/city homes, returns, offer and resource header. Presentation is reviewed end to end, including appendix return and mobile controls.
4. Compare the approved-media inventory against the built output. At baseline there are 13 distinct hosted MP4s; preserve source coverage and canonical references without treating duplicated formats as extra content. No new footage is required.
5. After deployment, verify the live canonical/legacy routes, one country and one city property, appendix return, both languages, protected statements and an actual new-story presentation traversal. A successful build or upload alone is insufficient.
6. Record the release commit, Cloudflare version and checked URLs. Keep the prior deployment available for rollback if navigation, access protection or media delivery regresses.

## Content safeguards

- Keep US$7M target, US$2.1M committed, US$4.9M available, US$100,000 minimum, 14.6% projected investor IRR, 1.40× multiple and four projected years on the existing Model 10 basis. Preserve tax/carry qualifications and Year 1 capital timing. This is a presentation update, not a new underwriting exercise.
- Up to 365 annual owner-use nights are shared when all five homes are operating; each active home contributes 73. Preserve pro-rata examples and all booking restrictions, including paying-guest priority. Do not imply all five homes are currently bookable.
- The 3% L&B stake is collective at full subscription, not per investor. Preserve its approved no-additional-capital and non-dilution qualifications. Keep the planned US$10M/US$15M future-round references and their conditions; do not invent a percentage or guaranteed launch. Owner-use costs are already reflected in the base case.
- Keep two homes closed and three in negotiation unless the user supplies an update. Show confirmed features against the correct property; no fabricated pool, resort service, waterfront location or travel time.
- Keep Dov leading the team, Ricardo's Planning and Corporate Development role, Adriana's biography and all five specialists. Do not guess unverified architect links.
- Keep the countryside woman in El Oriente and the walking/chef material in city context. The L&B film uses only the robe image, embrace and handholding footage. No male-running clip. Opening and closing exclude those women; the closing stays a Medellín drone.
- Preserve original-image and floorplan review, concise illustrative labels and existing disclosure text. No Ashoka content or private-source-document links.

## Sequence, review and deferred work

Implement U1 first. U2 and U3 can then be developed in parallel with clear file ownership; integrate them before U4. U5 can proceed against the established route contract. U6 verifies the assembled result. Review the actual rendered opening-to-benefits sequence and property interaction before spending time on fine motion polish.

No new business decisions block planning. Exact image crops, notebook line breaks, appendix focus restoration and browser-history behavior need runtime validation during implementation. They are verification tasks, not reasons to invent new benefits or remove content.

Deferred: new imagery or stock purchases, the male-running clip, new financial calculations, new company disclosures, a framework/CMS migration, a full resource-page redesign, analytics experiments, and a standalone PPTX/PDF export. Preserve all existing download and access boundaries.

Success is a complete story that visitors can follow or navigate directly: experience, homes, investment case, people and contact. Every chapter has a purpose, every property is inspectable, and the main presentation finishes at Contact.
