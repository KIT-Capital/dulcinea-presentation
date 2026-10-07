# Lifestyle-led opening

7 October 2026. Application `d71a50d`, Worker version
`99cdfb10-ae23-4c23-83c3-acd3a62cdd18`, published at
https://invest.dulcineainvestments.org/.

The user requested a warmer opening that conveys member use and lifestyle,
calling Dulcinea One a real estate program. Both the website and presentation
cover now lead with time with family and friends in Medellín and El Oriente.
The next sentence connects investment in five homes with member stays. Adjacent
copy preserves phased opening, allocation, availability and membership terms.

English and Spanish share the same markup and hierarchy. Homepage document,
Open Graph and Twitter descriptions and client-side language-switch descriptions
use the updated program wording. The investment structure, future-fund rights,
forecasts and disclosures remain in their existing sections.

## Validation

- Portable and production web builds and the build verifier passed: ten EN/ES
  pages, 77 files, 59 media aliases, 16 distinct MP4s and 28 parsed scripts.
- All 57 server tests and `git diff --check` passed.
- Independent bilingual copy review found no changed rights or new promises.
- Both covers fit at 1280 x 720: copy ends at 414.3px English / 438.1px Spanish,
  above logos at 581.5px and the toolbar at 656px.
- Both website heroes and presentation covers checked at 390 x 844, without
  horizontal overflow or text/logo overlap. Temporary viewport override reset.
- Browser confirmed the published English cover and its new copy.
- Live HTTP verification passed: all eight public EN/ES pages match the build
  bytes directly; all 34 hero, prior-copy, metadata and contact checks pass.
  Eight financial aliases redirect to login and six private/source probes
  return 404. Floorplans and favicons return 200; reservoir bytes 0–1023 return
  HTTP 206 and exactly match the local 1,024 bytes and total file size.
- Authenticated financial access and third-party social caches were not retested.
  Full HTTP results are in `live-check-latest.json` in the evidence folder.

Evidence: `preservation/2026-10-07/warm-hero/` in the parent workspace, outside
Git and the published assets. Includes local layout measurements, screenshots
and `published-cover-en.png`.
