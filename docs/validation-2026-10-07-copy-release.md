# Copy cleanup release

7 October 2026. The user approved applying the clarity review, committing,
pushing and publishing the complete pending copy cleanup. Application `de96e91`
is pushed to canonical `main` and published as Worker version
`90f8fbf9-506b-47e6-92ce-187df8c9fa88` at
https://invest.dulcineainvestments.org/.

## Scope

Includes the membership hierarchy, future-fund explanation, criteria and
redundant-label cleanup documented in `validation-2026-10-07-copy-cleanup.md`.
The final approved clarity pass applies eight exact replacements across six
areas: Spanish opening, three phased-opening descriptions, English contact
instructions, Spanish contact slide, Spanish visualization caption and Juan
Carlos's Spanish full biography. Together these passages lose 29 words.

Investor rights, allocation conditions, forecast qualifications, credentials,
financial data, media, contact destinations and access policy are preserved.
No new AI-detector score was run or claimed.

## Pre-release validation

- Portable and production web builds passed.
- Build verifier passed all ten EN/ES pages, 77 files, 59 media aliases,
  16 distinct MP4s and 28 parsed inline scripts.
- All 57 server tests passed; `git diff --check` passed.
- Independent source review confirmed all eight approved replacements are
  present, their old wording is absent, and the complete pending change retains
  the English/Spanish investor qualifications.
- Browser checks confirmed the Spanish membership slide fits at 1280 x 720
  (content bottom 563.3px, toolbar begins at 656px), the shortened Spanish
  contact slide, and the English website contact wording.
- Spanish opening and contact checked at 390 x 844 with no horizontal
  overflow. Responsive slides retain their existing vertical scrolling.
- Temporary viewport override restored.

Evidence is outside Git and the public build in the parent workspace:
`preservation/2026-10-07/clarity-review/` and
`preservation/2026-10-07/copy-release/`. Earlier full membership layout checks
remain in `preservation/2026-10-07/copy-cleanup/`.

## Live verification

- All eight public EN/ES pages return 200 and exactly match the production build
  bytes. These responses needed no Cloudflare beacon normalization.
- All 23 latest-copy, membership and active Dov-contact checks pass.
- All eight financial aliases redirect to login; six private/source probes
  return 404. Authenticated financial access was not retested in this release.
- Public floorplan PDF and SVG/ICO favicons return 200.
- The reservoir video returns HTTP 206 for bytes 0–1023 with exactly 1,024 bytes
  matching the local file and the correct complete-file size.
- Browser confirmed the new English membership slide, switching that subject to
  Spanish, and the shortened Spanish closing slide. Published membership
  screenshot: `preservation/2026-10-07/copy-release/published-membership.png`.
- HTTP evidence: `preservation/2026-10-07/copy-release/live-check-latest.json`.
  Third-party cached social previews were not retested.
