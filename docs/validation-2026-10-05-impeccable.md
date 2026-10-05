# Interface clarity review — 5 October 2026

Implemented the five priorities from the Impeccable critique in the active `src/investor` source. The root portable HTML was an older generated artifact; it was not used as the editing baseline.

## Changes

- The website opening now gives the minimum commitment, projected term, eligibility and Year 1 installment basis beside direct investment and property links. Repeated benefit explanations remain in their dedicated section; the established presentation cover and lifestyle content remain available in presentation mode.
- The 365-night figure is labeled as the total annual member pool. An illustrative allocation uses the already approved approximately five nights per US$100,000, with full-subscription/all-homes conditions and booking qualifications. The booking link expands the existing rules.
- Compact navigation exposes Contact and Menu, with the existing navigation, presentation and language controls inside a nonmodal panel. Links remain available without JavaScript; Escape restores focus. All tested menu controls measure at least 44px tall.
- Property selectors show their approved acquisition status. The AI visualization badge is more prominent, and the original property photo action is easier to find.
- The contact section explains eligibility discussion, financial-access requests and definitive-document review. The action names investor information and identifies WhatsApp as its destination.
- Narrow-phone overflow in existing film captions, city copy and financial figures was corrected.

## Validation

- `node --test server/*.test.mjs`: 47 passed.
- `node scripts/build.mjs --web --review` and `node scripts/verify-investor-build.mjs --review`: passed. Ten EN/ES pages, 73 files, 59 media aliases, 16 distinct MP4s and 28 inline scripts; links, floorplan coverage, team, offer and share assets verified.
- Browser checks covered 1366px desktop, 820px tablet, 390px phone and 320px narrow phone. Both languages fit the 320px viewport exactly (305px content width including scrollbar reservation, 305px scroll width).
- Compact header measured 78px versus approximately 165px before this change. Both main actions appeared in the 390×844 opening in EN/ES.
- Menu opening, language switching, Escape/focus return, original imagery, floorplan opening/dismissal, booking-rule expansion and property status translations worked.
- Desktop presentation cover and Spanish benefits/contact slides were visually checked. The 18-slide sequence remains unchanged.
- No browser console errors were observed. A separate content review found no factual or translation regressions against approved source terms.
- Impeccable's detector remains unavailable because its engine is not installed. No numeric full-page contrast audit, real-device testing or complete screen-reader session was performed.

## Preview and release state

The review build is available locally at `http://127.0.0.1:4173/`. Review contact actions are intentionally inert. Its local adapter reuses the production asset policy, binds only to loopback and has no financial login secrets. It does not expose protected statements.

The adapter is saved outside the repository in `preservation/2026-10-05/impeccable-interface/preview.mjs` in the parent workspace; stop its Node process to close the preview. Source changes are uncommitted. No production deployment was performed. Rebuild and verify the production variant before any approved publication.

## Presentation refinement follow-up

- Shortened the cover to a single investment proposition with the projected term, minimum commitment, currency and eligibility. Further shortened slides 1 and 2 following the user's feedback: slide 2 now has three brief benefits and a short qualification; substantive economic terms remain on slide 6.
- Strengthened the cover and closing film overlays for consistent text legibility. The gold `One` accent is retained.
- Added the approved approximately five nights per $100,000 example to slide 6 with full-subscription, all-five-homes, allocation and availability conditions. Adjusted the Spanish canvas layout so its model-value footnote and booking link remain visible.
- Restored the existing buy, renovate, rent and sell sequence to slide 12.
- Slide 14 uses concise bilingual specialist biographies and a full-profile link. Original full biographies remain on the website and dedicated specialist pages. Build verification now compares the full versions exactly while validating concise variants separately.
- Reduced the closing navigation to three links; the complete website directory remains in the toolbar. Translated the English San Lucas purchase-agreement status and refreshed the slide live announcement when switching languages.

### Follow-up checks

- Review build and investor-build verifier passed: 10 EN/ES pages, 73 files, 59 media aliases, 16 MP4s and 28 inline scripts. `git diff --check` passed.
- Measured all 18 desktop slides at 1440 x 900 in both languages. The initial Spanish benefits overflow was corrected and confirmed clear in the rebuilt page. Other measured slide text remained inside the canvas.
- Inspected changed desktop compositions and sampled phone/tablet screenshots. Checked slides 1, 2, 6, 12, 14 and 18 at 390 x 844 and 1024 x 768 in both languages: no horizontal overflow; responsive slide content remains vertically scrollable.
- Confirmed the language switch updates the slide announcement while preserving the route. Confirmed the booking appendix, three closing links, full toolbar directory, and full website biographies remain available. Presentation-only copy is hidden on the website.
- Preview refreshed. Changes remain local and uncommitted; no publication performed. The detector, real-device and full screen-reader limitations above still apply.

### Slide 2 film sequence

At the user's request, slide 2 now plays the existing friends film followed by the existing Lola & Ber spa/robes film, then repeats. It reuses the same video element and shared motion controller. The website retains its original friends loop.

Syntax, review build, build verifier and diff checks passed. Browser observation confirmed both natural clip transitions, English/Spanish switching, paused playback on slide 2, stopping playback on leaving the slide, and restoration of the website loop. The local preview was refreshed; no publication performed.

### Distinct fictional guests and property playback

- Used built-in image editing once per property to replace the repeated male faces across all five AI lifestyle illustrations. Monte Sereno, Montana and Fontanar include distinct blond men; Aires and San Lucas use different appearances. Existing women, adult counts, poses and recognizable property features were retained on visual review.
- Preserved the prior PNGs, web derivatives and videos under the parent workspace's `preservation/2026-10-05/diverse-guests/before`. Exact edit prompts and source/output paths are in `assets/images/lifestyle/edits/2026-10-05-*.json`. Original generation history remains in the master provenance; all 30 referenced before/current image hashes were verified.
- Rebuilt five nine-second, 1280 x 720 H.264 camera-motion loops from the updated masters. All passed full-stream decode, metadata, size, fast-start and identical uncompressed loop-endpoint checks. Total video size is 7,421,966 bytes. These remain animated illustrations with still fictional adults.
- Added the current property poster as a persistent background and isolated the presentation video layer with `translateZ(0)` and backface visibility. The prior slide 7 blank panel was not reproduced after this change during playback across multiple loops. This is a rendering mitigation; the underlying browser compositing cause has not been conclusively established.
- Review build and verifier passed. Browser screenshots confirmed the new guests on slides 7 through 11; the shared media continued playing when switching to Spanish. No publication performed.

### Closing layout and canonical publication authorization

The user requested clearer formatting on the closing slide, then explicitly instructed publication as the canonical version with active Dov email and WhatsApp links. This supersedes the review-only release state described above.

- Replaced the oversized two-line closing heading with a concise invitation. Dov's identity is a non-interactive portrait/name/role block, followed by one explicit WhatsApp action and a separately labeled email link.
- The contact and further-reading groups use an in-flow desktop grid and a stacked phone/tablet layout. The financial-access note is adjacent to its link. The website uses the same contact controls.
- Desktop and 390px phone screenshots were reviewed in English and Spanish. Phone content fits within its scroll container, the WhatsApp action is 60px tall, and the email target is 44px tall. Focus order follows the displayed groups.
- The production build and verifier pass. Both languages use `https://wa.me/19174284062` and `mailto:kit@kitcapital.com` with no review contact marker. All 47 server tests pass. The updated video catalog verifies 33 distinct retained videos, 16 active videos and no duplicate files.
- Canonical target remains the existing `dulcinea-investor-presentation` Worker at `https://invest.dulcineainvestments.org/`. The production deployment guard and financial-only access policy are unchanged.

### Canonical release and live verification

- Application commit: `68b14eeb9a67cb96ccc28b5e649e1841c3372b73`; property-media commit: `b5f9350`. Both are pushed to canonical GitHub `main` and `codex/presentation-refinements`.
- Published Worker version: `aaa481aa-7003-4563-b43b-5d19a17c3a19`, replacing `d64514fe-9ab2-4b0d-a9cc-8fa4e86dc76a`. The guarded production deploy passed and retained existing remote secrets and bindings.
- All eight public EN/ES pages match the local production build by SHA-256. Both homepages contain active Dov WhatsApp/email destinations, the new contact layout, and no comparison contact markers.
- All five updated live MP4 hashes match the rendered files. Each returns an exact 1,024-byte HTTP 206 range with the current total length. The public floorplan PDF returns 200; sampled source/provenance paths return 404.
- Anonymous financial statements, clean aliases and `.html` aliases in both languages redirect to login. Live browser inspection confirms the closing slide and active link destinations, with no JavaScript errors. No contact message was sent.
- A deliberately wrong password returns 401 without a cookie. The existing local development password also returns 401, so positive authenticated EN/ES access and logout were not reverified with the current production credential. No further attempts, secret retrieval or credential changes were made. Safe status-only evidence is retained; no credentials or cookies are recorded.
- Source-workbook limitation: the available Model 10 package hashes to `2b96677ec51b872e06635fc28c59075f8677e1ae0d946bfd7dc0c1be39a33dde`, while the approved extraction records `6943e850555794c314adc213e3e117bf237ebcbff8e6e09350cbb5a1edff1365`. The strict hash-gated source commands therefore do not pass; no verifier or approved hash was changed. A fresh read-only semantic check against the approved extraction passed all 27 sheets, 24,126 saved-value cells and 24,446 formula-view cells (20,798 formulas), with zero mismatches. All current app financial/model references also match. Financial numeric records, model summary and the financial template are byte-identical to pre-release `ab048af`; the only property-data change is an English status translation.
- Exact local edit records, the prior public homepage, safe HTTP evidence, and the reproducible model comparison are preserved outside Git and the published build under `preservation/2026-10-05/impeccable-release/` and `preservation/2026-10-05/diverse-guests/` in the parent workspace.

### Opening reading-flow follow-up

The user requested the standalone "Accredited investors only" note and a slower reading path. The website's opening links to returns and homes are now a non-interactive downward cue: "Scroll down slowly to explore the full story." Spanish uses "Solo inversionistas acreditados" and "Desplácese despacio para conocer toda la propuesta." The payment schedule remains in the offer, with header/chapter shortcuts and presentation controls preserved.

Production build and verifier passed. Desktop and 390px phone views were inspected; Spanish had matching 375px client/scroll widths and no opening jump anchors. Both published homepages return 200 and match the build by SHA-256. Application commit `4620b43` is pushed to `main`; Worker version `9bf1da86-0852-4749-9af6-37e48b076198` is live, replacing `aaa481aa-7003-4563-b43b-5d19a17c3a19`.

## Hero brand restoration — 5 October 2026

User reported missing hero logos and requested transparent backgrounds. Removed the website and presentation hide rules; restored the Dulcinea, KIT Capital and Lola & Ber row above the hero overlay. Removed the opaque panel and used monochrome filtering with screen blending for the existing raster marks. Original brand assets were not altered.

- Application commit: `187b32e`, pushed to canonical `main`.
- Production Worker version: `052f51e9-6395-4de3-9ff0-89c0d630ef54`.
- Production build/verifier passed; all 47 server tests passed; diff whitespace check passed.
- Browser: desktop website and canvas opening slide, 390x844 mobile website and Spanish responsive opening slide inspected. Three brand images loaded, row background computed transparent, mobile had no horizontal overflow, logos fit within the slide.
- Live EN and ES homepages returned 200 and matched local build SHA-256 exactly after publication.
- Financial content, contact destinations, original media and access configuration unchanged.

## Lower hero layout — 5 October 2026

At the user's request, moved the transparent logos to the lower-right and the non-interactive scroll prompt farther down to the hero's lower-left. On phones, the cue stacks above the right-aligned logos. The opening slide retains lower-right logos and hides the website-only scrolling cue.

- Application `2ca4b7b`; production Worker `9ed56a8c-ad1b-45f8-8a00-dde160a36891`.
- Production build/verifier and diff whitespace check passed. Server behavior unchanged from the preceding 47-test pass.
- Browser verified desktop website and opening canvas slide, plus EN/ES 390x844 mobile websites. Mobile content width matched the viewport; logos stayed 40px above the hero bottom. No overlaps with eligibility or the reading cue.
- Live EN/ES homepage status 200; SHA-256 matched the built files exactly.

## Website and slides: second full pass — 5 October 2026

Performed a further Impeccable refinement pass against the active source and local browser. The existing website identity, 18-slide order, approved facts and financial data were preserved.

### Fixes

- Added a persistent presentation toolbar pause/resume control. It uses the existing playback preference, localizes its label, and stays synchronized with the hero control and reduced-motion preference. Dialog pauses remain temporary. The toolbar retains 44px controls at narrow portrait and landscape sizes.
- Corrected presentation sizing for the nested El Oriente video. Added existing poster imagery beneath the cover and El Oriente films and isolated their video layers, extending the existing property-video rendering mitigation. Both scenes had appeared blank despite active playback during inspection; both displayed imagery after the fix. This is a rendering mitigation, not a conclusive diagnosis of the browser compositor.
- Corrected the shared closing footer to “Accredited investors only” and “Solo inversionistas acreditados.”
- Renamed the specialist link to “View specialist directory” / “Ver directorio de especialistas,” matching its actual contents. No unsupported biographies were added.
- Used ink focus indicators on the supporting specialist/disclaimer pages and on light website story panels; white remains on dark website panels.
- Standardized acquisition-criteria dollar notation and added one bilingual US-dollar note. Values were not changed.
- Corrected slide-overview left/right keyboard instructions. Resolved the responsive appendix return and website buttons occupying the same grid cell.

### Verification

- Inspected all 18 English desktop slide compositions at 1440 × 900. All 18 Spanish desktop slides passed text-boundary measurements with no clipped text detected.
- Checked all 18 slides in each language at 390 × 844: no horizontal overflow in the document or active slide. Long responsive slides retain vertical scrolling.
- Checked the new toolbar at 320 × 740 and 380 × 260; visible controls fit the viewport and measured at least 44 × 44px. Checked the booking appendix at 820 × 1180 and 320 × 740, including its return control.
- Verified pause on slide 2, language switching while paused, remaining paused on slide 3, and resuming there. Checked overview navigation and the optional booking appendix.
- Inspected the main website sections on desktop and Spanish phone layouts, along with Spanish specialist, acquisition-criteria and disclaimer pages. Exercised the compact menu and floorplan opening, zoom, sheet selection and dismissal.
- Review build/verifier passed, followed by production build/verifier. The final local build is production, with active Dov contact URLs verified by the existing build gate. No contact message was sent.
- `node --test server/*.test.mjs`: 47 passed. `git diff --check`: passed. No warnings or errors were present in the final inspected browser log.

The Impeccable engine remains unavailable; its written playbooks and the incumbent source served as context. No real-device or full screen-reader session was performed. Protected financial-page authentication was not rechecked in the browser. The architecture and works-oversight entries still have names/roles only; additional biographies require confirmed source material.

Changes remain uncommitted and unpublished. Local preview: `http://127.0.0.1:4173/#present-oriente`. Final screenshot: parent workspace `preservation/2026-10-05/website-slides-second-pass/oriente-slide.jpg`.
