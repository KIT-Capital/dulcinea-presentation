# Bilingual copy and membership hierarchy cleanup

7 October 2026. Implemented locally after the user approved the three audit recommendations. Not committed, pushed or published; production remains application `6c99ea9`, Worker `82ab3983-bdb6-4536-93bd-3a01b887a0f9` as previously verified.

## Changes

- The shared membership block now leads with “About 5 nights a year” and “Per $100,000 committed” (with Spanish equivalents). Its adjacent paragraph identifies the illustration, full subscription, all five operating homes, pro-rata allocation, booking availability and membership terms. The shared annual 365-night pool and 73 nights per active home remain below it.
- Website and presentation now use the same owner-use and future-fund content. Future participation directly identifies the general partner's performance profits (carried interest), pro-rata participation under membership terms, its addition to Dulcinea One returns, and no guaranteed future funds/distributions.
- Removed the generic modern-city opener, redundant “The idea”/“Investor information” labels and duplicated team-resource framing. Adjusted the simplified team-resource grid to retain its full-width heading and action.
- Criteria introduction now describes ten acquisition criteria. Due diligence reads “Technical, legal and title review” / “Revisión técnica, jurídica y de títulos.” All matching translation entries were aligned so earlier replacements cannot override the approved wording.
- Preserved the brand tagline, collective 3%, acquisition/financial data, media, biographies, contact destinations and access policy.

## Validation

- Portable and production-target web builds succeeded. Building a production-target artifact does not deploy it.
- `scripts/verify-investor-build.mjs` passed: 10 bilingual pages, 77 files, 59 media aliases, 16 distinct MP4 files, 28 parsed inline scripts and existing link/content/access assertions.
- `node --test server/*.test.mjs`: 57 passed, zero failures.
- Independent read-only source review found no changed investor rights or dropped conditions in English or Spanish.
- Browser membership slide checks at 1280 × 720: English content bottom 540.7px and Spanish 563.3px, both within the 656px slide area. No horizontal overflow.
- Website and responsive presentation checked at 390 × 844 in both languages. No horizontal overflow. After aligning the website section heading, allocation conditions ended at 542.7px (English) and 646.1px (Spanish), before the shared-pool block. On responsive slides they ended at 437.2px and 535.2px respectively.
- Criteria introduction verified in the page banner (outside `main`) and due-diligence sentence in `main`, both languages. Simplified team resource link inspected on desktop.
- Temporary viewport overrides restored. Local preview remains at `http://127.0.0.1:4173/`; it binds only to loopback via `createNodeServer`. No production secrets were loaded. The local preview process is unified exec session `26993` and can be stopped with Ctrl+C through that session.

## Evidence

Saved outside the published build in the parent workspace:
`preservation/2026-10-07/copy-cleanup/`.

Includes `layout-checks.json`, English/Spanish desktop membership slides, English/Spanish mobile website and presentation views, desktop membership and team-resource screenshots. Earlier audit and EQ-Bench measurements remain in sibling `ai-slop-review/`; no new score is claimed for this cleanup.
