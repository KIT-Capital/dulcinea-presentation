# Localized presentation PDF provenance

The three approved exports are `downloads/Dulcinea-Presentation-{EN,ES,FR}.pdf`. Each contains the 20 main online slides followed by the owner-use appendix: 21 pages, in the same order as `content/presentation-story.json`. Regenerate all three when presentation sources change.

Capture the online 1440 × 810 canvas at a 1440 × 874 viewport, with animation paused, through the supported browser tooling. Save one capture for each story ID, in each locale. Include the language, story ID, capture file, visible links with browser rectangles, image-load checks and overflow checks in `capture-results.json`. Package reviewed captures using `python scripts/assemble-presentation-pdfs.py capture-results.json output-directory`. This preserves the rendered slide appearance and adds chapter bookmarks and clickable links; body text remains part of the slide image. Keep capture evidence outside the public repository. Render the resulting PDFs and visually inspect them before accepting them.

After capturing the final slides and producing the PDFs, call:

```js
import { presentationPdfSources } from './scripts/presentation-pdf-sources.mjs';
const { algorithm, sourceSha256, files } = await presentationPdfSources(repositoryRoot);
```

Write `content/presentation-pdfs.json` with this shape. Checksums for the PDFs are SHA-256 of the raw PDF bytes. Record the actual page counts and ISO export time; do not update the source fingerprint to bless old exports.

```json
{
  "version": 1,
  "sourceAlgorithm": "sha256-path-content-v1",
  "sourceSha256": "<sourceSha256 returned above>",
  "exportedAt": "<ISO timestamp>",
  "slideCount": 21,
  "sourceFiles": [{"path": "<relative source path>", "bytes": 123, "sha256": "<canonical source checksum>"}],
  "locales": {
    "en": {"path": "downloads/Dulcinea-Presentation-EN.pdf", "sha256": "<raw PDF checksum>", "pageCount": 21},
    "es": {"path": "downloads/Dulcinea-Presentation-ES.pdf", "sha256": "<raw PDF checksum>", "pageCount": 21},
    "fr": {"path": "downloads/Dulcinea-Presentation-FR.pdf", "sha256": "<raw PDF checksum>", "pageCount": 21}
  }
}
```

`sourceFiles` is optional. When included, use the complete `files` array returned by the function without modification. It makes changed dependencies identifiable without storing private source content.

Run `node scripts/verify-presentation-pdfs.mjs` after export. Run `node scripts/verify-presentation-pdfs.mjs --built` after the web build to verify that published copies have the same bytes. The module also exports `verifyPresentationPdfs(repositoryRoot, {builtDirectory})` for the release gate. Verification checks freshness, exact approved filenames, raw PDF checksums, 21 actual page objects, consistent page-tree counts and the 25 MiB deployment limit. The current ReportLab exporter uses ordinary PDF objects; a future exporter with compressed object streams requires a proper page-tree parser before this gate can accept it.

## Fingerprint contract: `sha256-path-content-v1`

The dependency set is:

- Every regular file recursively under `src/investor/` and `content/locales/`.
- `content/presentation-story.json`.
- `shared/investor-disclosures.mjs`, `shared/investor-typography.mjs`, `shared/locales.mjs` and `shared/team.mjs`.
- Every canonical media path in `src/investor/media.json`, including images, SVG logos, videos, fonts and the approved source floorplan PDF.
- The nine floorplan images selected by `{{PLAN_PAGE_1}}` through `{{PLAN_PAGE_9}}` in `assets/manifest.json`. Their marker-to-path mapping is included in the hash; unrelated asset-manifest entries are excluded.

Duplicate paths are included once. Repository-relative paths use `/` and are sorted using JavaScript's default string ordering. Symlinks, parent traversal and paths outside the repository are rejected.

For `.css`, `.html`, `.js`, `.json`, `.mjs` and `.svg` sources, decode as UTF-8 and normalize CRLF or CR line endings to LF, then re-encode as UTF-8. All other files use raw bytes. Each inventory entry records the canonical byte length and its SHA-256. This makes the source fingerprint stable across Windows and Linux Git line-ending conventions; it does not ignore other whitespace changes.

The final source SHA-256 is calculated over UTF-8 bytes of `JSON.stringify({algorithm, files, floorplanAliases}) + '\n'`, with keys in that order. Here `files` contains sorted `[path, canonicalByteLength, canonicalSha256]` tuples, and `floorplanAliases` contains the nine `[marker, path]` tuples in numeric page order.

Generated PDF exports, `content/presentation-pdfs.json`, build scripts, generated public-asset allowlists, deployment inventories, Excel workbooks and unrelated private documents are excluded. Changes to rendering logic outside the dependency set require a deliberate PDF regeneration and visual review. The fingerprint proves source freshness, not the visual quality of a capture.
