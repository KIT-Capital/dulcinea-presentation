# Lifestyle storyline release validation — 2 October 2026

Status: implemented, committed, pushed, published and verified live.

## Scope

- The website introduces member use, El Oriente, Medellín and Lola & Ber before the five homes and investment case. The investment identity remains explicit at the opening.
- The presentation has 18 main slides and a separate owner-booking appendix. Canonical subject links coexist with the fixed 19-slide legacy mapping.
- Property discovery is country-first, with five linked previews and one detail panel. All five records, original photos and nine supplied drawings remain available.
- Financials, criteria, specialists and disclosures share a compact navigation renderer. Financial calculations and access policy were not changed.

## Automated verification

- Portable and hosted builds passed. The investor-build verifier checked 10 EN/ES pages, 64 files, 49 media aliases, 13 distinct MP4s and 16 inline scripts, including links, financial-only sign-out, floorplans and source-document exclusion.
- All 33 worker and video-range tests passed.
- JavaScript syntax and `git diff --check` passed.

## Model 10 reconciliation

The reattached workbook's binary SHA-256 differs from the approved provenance hash. The ordinary source-hash assertion therefore does **not** pass. A read-only comparison against the approved private snapshot found identical saved cell values and formulas across all 27 sheets, including 384 application references (356 unique cells) and 156 stored formulas. The projected IRR remains 14.6162%, displayed as 14.6%.

A separate, clearly identified validation run retained the remaining financial checks and passed statement arithmetic, margins, carry, cash flow, balance sheet, EN/ES numeric cells, blank zero entries, headline figures and source-file exclusion. No workbook, application figures or approved provenance hash was rewritten. The binary difference has not been attributed to a particular metadata, formatting or ZIP change.

## Browser verification

- All 38 EN/ES legacy links resolved to their intended subject. Traversal followed the 18-slide sequence and ended at Contact, with the appendix excluded from ordinary Next/Previous navigation.
- All 36 EN/ES slide checks at 1366×768 passed without heading/action clipping or horizontal overflow.
- Ninety Spanish slide/layout checks covered 1280×720, 1440×900, 390×844, 768×1024 and 1024×768. Two initial closing-slide clipping findings were corrected; the final four EN/ES closing-slide checks at both notebook sizes passed.
- Visually reviewed the property collection, benefits, city, investment approach, returns, closing slide, phone property layout, floorplan dialog and compact resource headers. Spanish criteria and the disclosure remained above the fold at 1280×720.
- Verified appendix return from Benefits and El Oriente, locale changes, browser Back/Forward, Escape, selected-property exit and reload, plan-sheet selection, menus, arrow keys, Space, Page Up/Down, Home/End and fullscreen entry/exit.
- Verified only the selected property film plays after navigation settles; preview films remain paused. Reduced-motion mode paused all videos. Touch layouts were checked in responsive emulation; this is not a physical iPhone/iPad certification.
- Completed an actual local Worker login → protected balance sheet → Spanish switch → sign-out → protected-route rejection journey. The local runtime used compatibility date 2026-09-18 because that is the installed runtime's supported date; production configuration remains unchanged at 2026-09-26.

Private raw QA output is retained outside the repository and deployed assets. It includes route, viewport, closing-slide and financial-reconciliation reports.

## Release

- Application commit: `4268927`, pushed to `KIT-Capital/dulcinea-presentation`, branch `codex/lifestyle-oriente`.
- Cloudflare version: `0a83835a-b6e4-487b-9910-a163cbd25687` on `invest.dulcineainvestments.org`.
- Previous version retained for rollback: `163aff25-f5ed-401f-bad4-5c7af644ad8d`.
- Traversed the entire live 18-slide sequence from `/#present-cover` to Contact; the final Next button was disabled. Confirmed legacy `/#present-8` still opens Fontanar, now slide 9.
- Confirmed live Benefits → booking appendix → Spanish → return preserves `/es/#present-benefits`, and `/es/#property-monte-sereno` opens the correct country home.
- The live `/financial-statements#balance-sheet` route redirected an anonymous visitor to login with the intended statement fragment preserved. Public `/es/investment-criteria` remained accessible, with one language control and the shared resource navigation.
- Visually reviewed and saved the live `/#homes` collection at notebook size. The proof image and live traversal report are stored in the private sibling `storyline-review` folder, outside deployed assets. Temporary viewport overrides were reset.
