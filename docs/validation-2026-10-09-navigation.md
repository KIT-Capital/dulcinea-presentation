# Unified website navigation

The user identified the top header and the separate chapter bar below the hero as confusing. The website now has one header with five section links: Life here, Membership, The homes, Team and Investment. The logo returns to the opening and the contact action leads to the closing. The second chapter bar and redundant chapter label below the logo are removed.

Resources groups the current-language PDF, financial statements, acquisition criteria, specialist directory and disclaimer. Present, the three language flags and contact remain visible on desktop. At compact widths the same controls appear in one Menu disclosure. The native Resources disclosure also works without JavaScript.

The current section is highlighted in the header. Section navigation first closes the compact menu, then measures the destination below the collapsed header and focuses its heading. Resources closes on Escape, outside click and focus departure. Desktop download/new-tab actions restore focus to the Resources control; the compact menu restores its toggle. Modified clicks retain native browser behavior.

## Validation

- Checked English, Spanish and French at desktop widths, including the longer French labels at 1280 pixels, and the French compact menu at 390 pixels.
- Confirmed one chapter navigation, hidden links in closed Resources, nested Escape behavior, outside-click dismissal, localized document routes and matching PDF destinations.
- A browser download of the French PDF completed. The desktop Resources control regained focus. Mobile Team navigation closed the menu, focused the heading and placed the section approximately 102 pixels from the viewport top, below the 78-pixel header.
- Presentation launch and exit retained their controls and current-language PDF. No browser errors were reported during these checks.
- An independent focused source review found no remaining serious navigation regressions.
- Portable and production web builds passed. All 62 server tests and the full build/PDF freshness gate passed.
- All 63 presentation slide captures had loaded images and no detected text overflow. Three 21-page PDFs were refreshed to the new source fingerprint; all pages rendered and the embedded images matched the captures. The local PDF endpoints returned identical bytes.

## Publication

Application `5e8502c80d65a4ce7c18db60fe9bbc6a1c84215d` was pushed to `main` and published at https://invest.dulcineainvestments.org/ as Worker version `ad76c587-1ac5-4322-91f2-66272666407a` on 9 October 2026.

- All 12 public pages matched the production build, and all three PDF downloads returned HTTP 200 with the expected MIME type and SHA-256.
- All 12 financial aliases redirected to login with their destinations preserved; three localized login pages passed. Six private/source probes returned HTTP 404.
- Public floorplans and both favicon formats returned HTTP 200. The reservoir video returned HTTP 206 with the exact requested 1,024-byte range.
- The live browser showed the single header and localized resource destinations. Resources opened and closed with Escape, restoring focus; no browser errors were reported.
- All four financial-source hashes matched the recorded baseline. Positive financial sign-in was not retested.

This changes navigation, not the investment content, financial model, slides or PowerPoint. Private browser and export evidence is under the parent workspace's `preservation/2026-10-09/navigation/`, including `live-verification.json` and `published-navigation.png`. The preceding production version was `5a7dcef1-9891-4e80-aea9-818bc6f00b31`.
