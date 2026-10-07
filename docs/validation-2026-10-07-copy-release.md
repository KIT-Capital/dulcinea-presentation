# Copy cleanup release

7 October 2026. The user approved applying the clarity review, committing,
pushing and publishing the complete pending copy cleanup. Prepared for release;
production verification will be recorded after deployment.

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
