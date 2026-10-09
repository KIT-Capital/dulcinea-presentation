# Presentation, language and regional map release

Published and verified on 9 October 2026 after the user's explicit instruction to publish. Application commit `b237c4eb7125e8ff75faef0b51f6bc056b4d3d2d` is deployed at https://invest.dulcineainvestments.org/ as Cloudflare Worker version `5a7dcef1-9891-4e80-aea9-818bc6f00b31`.

This release publishes the previously reviewed slide revisions, seven-place regional map with city/country home areas, English/Latin American Spanish/French support and the three language-matched presentation PDFs. The PDFs mirror the 20 main online slides and the booking appendix. The local PowerPoint counterpart is version 035; this release publishes the website and PDF downloads.

## Verification

- Production web build and full release gate passed: 15 EN/ES/FR pages, 88 files, 62 media aliases, 16 active videos and 42 parsed inline scripts. PDF source fingerprints and output checksums passed.
- All 62 server tests passed. Video inventory contains 33 distinct repository videos, 16 active videos and no duplicate files.
- All 12 public page responses matched the production build exactly. No Cloudflare beacon normalization was needed.
- All three anonymous presentation PDF downloads returned HTTP 200 and PDF MIME types. Their SHA-256 values matched `content/presentation-pdfs.json`.
- All 12 financial statement aliases redirected to the financial login with the requested destination preserved. English, Spanish and French login pages returned the expected language and password field.
- Six private/source probes returned HTTP 404. Public floorplans and SVG/ICO favicons returned HTTP 200. The reservoir video returned HTTP 206 with the exact requested first 1,024 bytes and correct complete-file size.
- In the live browser, language controls changed English to Spanish to French and back to English, preserving the regional slide and changing the PDF destination accordingly. The corrected map and localized property key were visually checked. No browser errors were reported during this check.
- All four recorded financial-source hashes matched the baseline. Excel and model inputs were unchanged; the separate owner-use model revision remains pending. Production secrets were retained by the existing deployment workflow. Positive authenticated financial sign-in was not retested.

Private evidence is in the parent workspace at `preservation/2026-10-09/publication/`, including `live-verification.json` and published map screenshots. Earlier design and export checks remain in `validation-2026-10-09-slide-revisions.md`, `validation-2026-10-09-localized-pdfs.md` and `validation-2026-10-09-map-labels.md`.

The previous production release was application `32b1729`, Worker version `ea9f124d-06be-4f14-93a2-1bcef82fe3e3`. The independent design-review deployment was not updated.
