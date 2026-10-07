# Impeccable design fixes — 7 October 2026

The user approved all four findings from the independent Impeccable review.
Application commit `32b1729` is pushed to canonical `main` and published at
https://invest.dulcineainvestments.org/ through Worker version
`ea9f124d-06be-4f14-93a2-1bcef82fe3e3`.

## Changes

- Preserve 18 main slides and the booking appendix. On compact screens, keep
  Menu, slide navigation and pause/resume in a single row; move website exit,
  language and fullscreen into the existing dialog with localized labels.
- Long responsive slides show “More on this slide” / “Más en esta diapositiva,”
  then an end-of-slide message. The cue has reserved space and covers no content.
  The toolbar is 64px on short slides and 88px including the cue on long slides,
  before safe-area padding, compared with the previous 108px phone toolbar.
- Website footer uses 14px text and a 44px Back to top target. Header language
  controls use 14px text and 44px targets. Acquisition-note contrast increases
  from 4.278:1 to 12.556:1. Remove the redundant floorplan eyebrow.
- Two marketing navigation labels now read “The program” / “El programa.”
- “3% collectively” / “3% en conjunto” is grouped visibly; the phone figure no
  longer floats beside a compressed heading. All full-subscription and
  membership conditions remain. No legal, financial or benefit claim changed.

## Verification

- Portable and production web builds pass. Build verification covers 10 EN/ES
  pages, 77 files, 59 media aliases, 16 active MP4s and 28 parsed inline scripts.
- All 57 server tests pass. Video-library verification passes with zero duplicate
  repository media. Source diff whitespace checks pass.
- Batched browser checks cover 320x740 and 390x844 phones, 844x390 landscape,
  1280x720 desktop, both languages, short and long slides, footer and floorplans.
  Checked cue transitions, menu keyboard dismissal/focus, language and subject
  preservation, pause state across slides, appendix return, desktop control
  restoration after resize and return to the matching website section.
- Sampled compact controls are at least 44px high; no horizontal overflow found.
  The live English membership slide was checked after publication.
- All 8 public EN/ES pages match build bytes; 62 content/UI-delivery assertions,
  8 financial gates, 6 private/source denials and 4 public asset/range checks pass.
  The 107 paragraph/list/definition blocks match prerelease source exactly.
- Impeccable engine 0.1.5 findings decrease from 30 to 26: low-contrast 1 to 0,
  undersized-ui-text 3 to 0. Remaining counts are unchanged and retain the prior
  false-positive/editorial classification; this is not a zero-findings claim.
- Closed the exact Impeccable critique snapshot processed by this pass.

Evidence lives outside Git under
`preservation/2026-10-07/impeccable-fixes/` in the parent workspace, including
`browser-checks.json`, `published-phone-benefits.png`, `live-check-latest.json`,
`legal-copy-preflight.json`, test logs and detector results.

Browser checks used emulated viewports, not physical phones. Authenticated
financial access, third-party social caches and a full assistive-technology
audit were not retested in this UI refinement.
