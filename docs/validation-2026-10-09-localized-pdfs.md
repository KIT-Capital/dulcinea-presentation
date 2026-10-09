# Three-language presentation and PDF downloads

Implemented in source and local builds on 9 October 2026, then published following the user's explicit approval. See [publication validation](validation-2026-10-09-publication.md) for the deployed version and live checks. The checks below describe the original implementation pass.

- English uses the US flag, Latin American Spanish the Colombian flag, and French the French flag. French is available at `/fr/`, including presentation mode, supporting pages and financial login.
- The PDF action follows the current language in the website header/menu, presentation toolbar/compact menu and resource navigation. Property selection, slide, optional appendix and return destination survive language changes.
- The three approved public exports are `downloads/Dulcinea-Presentation-EN.pdf`, `downloads/Dulcinea-Presentation-ES.pdf` and `downloads/Dulcinea-Presentation-FR.pdf`. Each has the 20 main online slides followed by the booking appendix, in 16:9 format. They use captures of the rendered online canvas, with still images for videos, chapter bookmarks and live links. Text is part of the slide image; the PDF is not a separately editable or reflowable deck.
- Financial input JSON, investor terms, reconciliation and Excel were unchanged. Existing current-model 365/73/~52-night economics and return qualifications remain. The revised owner-use economics are still pending the separate Excel work.

## Validation

- 62 server tests passed, including French route/login/logout behavior, download allowlisting and continued financial access protection.
- The release gate passed for 15 EN/ES/FR pages, 88 files, 62 media aliases, 16 videos and 42 parsed inline scripts. All links, locale metadata and built-asset checks passed.
- All 63 PDF pages were rendered with Poppler. Slide captures were visually reviewed, including the longer French biographies and the booking appendix. Image fidelity and PDF page dimensions were checked. Each PDF contains 21 pages and 21 bookmarks.
- All three local download endpoints returned `200 application/pdf` with bytes identical to their source PDFs. A browser download through the French mobile menu also matched exactly.
- Browser checks confirmed language changes preserve a selected property, active presentation slide and optional appendix. The 390px menu showed the three correct flags and the French download action. No browser errors were observed during locale-navigation checks.
- `content/presentation-pdfs.json` records exact output checksums and the source fingerprint. The release gate rejects stale exports after copy, layout, translations or media change. See `scripts/presentation-pdfs.README.md` for regeneration and verification.

The PDFs are approximately 2.8 MiB (English), 3.0 MiB (Spanish) and 3.1 MiB (French). Only these exact presentation filenames and the previously approved floorplan PDF are public document downloads. Other source documents remain excluded or denied; financial statements retain their password gate.

No production deployment was attempted during the original implementation pass. The later approved publication is recorded separately above.
