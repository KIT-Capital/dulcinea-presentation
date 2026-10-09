# Illustration-only services imagery

The user requested the exact caption "Imagery is for illustration only." on online slide 7 and the matching website section. The shared `#stay-services` caption now uses that wording in English, "Imágenes únicamente con fines ilustrativos." in Latin American Spanish and "Images présentées à titre d’illustration uniquement." in French. The earlier retreat attribution is removed from this caption. The body still describes planned services and qualifies availability, pricing and additional charges.

## Validation

- The source diff changes only the services caption and its French translation. Both portable and production builds passed, followed by the full 15-page build and PDF freshness gate.
- The shared section was checked in website and presentation mode. All three translated slide captures had loaded images, the expected caption, and no text outside the slide canvas.
- Each refreshed PDF contains 21 pages and 21 bookmarks. The three services-page captures were replaced; the other 60 captures were retained from the verified navigation export after checking the exact source diff. Image comparison against the preceding PDFs confirms that only page 7 changes in each language.
- All 63 PDF pages rendered successfully. The three revised page renders were inspected, and the local downloads matched the output PDF bytes.
- The local PowerPoint counterpart is version 036. Its services caption is on slide 4; only that caption changed. All 24 slides rendered in PowerPoint, the revised slide was visually inspected, and the other 23 renders are pixel-identical to version 035. The remaining 212 package parts are byte-identical, preserving editable content and financial charts.

Private capture, PDF and verification evidence is in the parent workspace at `preservation/2026-10-09/retreat-caption/`.
