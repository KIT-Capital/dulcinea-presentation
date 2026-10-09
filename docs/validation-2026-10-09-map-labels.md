# Regional map labels — 9 October 2026

The regional slide now marks Medellín, El Poblado, El Retiro, Rionegro, Llanogrande, La Ceja and José María Córdova airport (MDE). These prominent labels replace the single airport overlay. El Oriente is labeled as the wider region.

Blue identifies the three city homes in El Poblado; green identifies the two country homes around El Retiro. The website and online presentation include a matching property key and a note that markers indicate neighborhoods and towns, not exact property addresses. The labels use the existing OpenStreetMap base image and retain attribution. They are area markers, with no new property coordinates or travel-time claims.

The shared SVG is `src/investor/regional-map-markers.svg`. English, Latin American Spanish and French use the same location markers, with localized home descriptions, property key and area note. Both web and portable builds include it.

The EN/ES/FR PDF exports were regenerated from all 63 rendered slides at 1440 × 810, including the booking appendix. Every capture had loaded images and no text outside the canvas. The source fingerprint was checked before and after capture, and the PDF freshness manifest was updated. Each PDF has 21 pages and 21 bookmarks. Final map pages were rendered and visually checked.

The full build gate passed for 15 pages, 88 files, 62 media aliases and 42 inline scripts, including the refreshed PDF hashes. All 63 PDF pages rendered successfully, their embedded images matched the source captures, and all three local download endpoints returned identical PDF bytes. The Spanish map and home key were also visually checked at a 390-pixel phone viewport.

The local PowerPoint deliverable is version 035, `Dulcinea - Investor Presentation 035 - Regional Map.pptx`, under the workspace `output/pptx-035-map/`. Slide 5 uses the same English labeled map and removes the former airport-only overlay. All 24 slides were rendered; the other 23 were pixel-identical to version 034, and all 210 unrelated package parts were byte-identical. Two pre-existing chart-series findings remain unchanged. Financial charts, embedded workbooks and model inputs were not edited.

Source synchronization does not publish the website. Production publication remains pending the explicit approval requested for the earlier slide and language revisions.
