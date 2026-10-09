# Slide revisions — 9 October 2026

Implemented in source and portable/web builds, then published following the user's
explicit approval on 9 October. See [publication validation](validation-2026-10-09-publication.md)
for the deployed version and live checks. The checks below describe the original implementation pass.

## Content

- Remove minimum investment and projected term from the cover only. Preserve
  definitive offer terms and the model's projected holding period elsewhere.
- Explain four benefits early: managed homes and stays, real estate returns,
  collective brand equity, and conditional future-fund performance profits.
- Add geographic orientation for Medellín/El Poblado and El Oriente, with a
  credited OpenStreetMap map and a dated official tourism statistic.
- Explain Lola & Ber's retreat/community origin and the distinction between the
  adult community brand and the By Lola & Ber property collection.
- Use supplied retreat imagery as community evidence, without claiming an
  operating hotel portfolio. Planned services are qualified; availability and
  pricing are not final and additional charges may apply.
- Present the existing owner-use example per $1M: 365 × ($1M / $7M) ≈ 52 nights,
  at full subscription with all five homes operating, subject to membership
  terms and availability. This does not adopt a new owner-use allocation.
- Use Juan Carlos Pérez consistently in the presentation and specialist directory.

The English/Spanish website and presentation share source. There are now 20 main
slides, including the five property slides, plus the existing booking appendix.
Existing numeric presentation links retain their original subjects.

## Sources and image provenance

- Regional geography: https://www.antioquia.gov.co/oriente
- Airport location: https://www.aeropuertorionegro.co/
- Tourism: https://www.medellin.gov.co/es/?p=540157 (19 June 2026), reporting
  310,517 U.S. visitors for 2025 and the U.S. as the leading source market.
  These are tourism figures, not evidence of permanent migration.
- Map: OpenStreetMap embedded map, captured 9 October 2026, bounding box
  -75.69889068603517,6.0296035927710205,-75.34526824951173,6.25660205479493.
  © OpenStreetMap contributors; https://www.openstreetmap.org/copyright.
- Community and terrace photographs: supplied Lola & Ber Brand Guideline 01,
  slide 21's existing retreat image library, image31.jpeg and image32.png.
  The complete private brand document is not added to the repository.

## Financial boundary

The user is editing Excel separately. No workbook was edited. The bytes of
`content/model-summary.json`, `content/financials.json`,
`content/investor-terms.json` and `docs/model-10-reconciliation.md` are unchanged.
The proposed owner-use increase, recalculated returns and a monetary future-carry
illustration await the revised model and actual participation terms. No new
reciprocal discount or transferability entitlement is asserted. John Mario's
biography awaits an approved source.

## Validation

- Production web build and portable build completed.
- Build verifier: 10 EN/ES pages, 80 files, 62 media aliases, 16 active MP4s.
- 57 server tests passed; 33 distinct preserved videos, no duplicates.
- All 20 main slides navigated in both languages at desktop and phone sizes:
  80 states, one active slide each, no horizontal overflow.
- Changed slides visually inspected; shared website brand imagery inspected.
- Existing financial source hashes verified unchanged.
- Deployment has not occurred. Private review evidence remains outside Git.
