# Reservoir aerial and fund description — 5 October 2026

The user requested the green-water reservoir aerial, choosing it over the pine-tree opening if necessary, and asked the opening to explain the closed-end fund and its plan to sell the homes for a profit.

## Final changes

- El Oriente now uses the complete 47.083-second `AdobeStock_501694199.mp4` and its matching poster. The city opening remains unchanged. The former pine/reservoir composite, pine source and removed lake-outing source remain archived, outside the active story.
- English and Spanish introduce the closed-end fund before the lifestyle story. The opening describes buying, renovating, renting and selling for a profit as the plan. Member stays remain in the introduction.
- Execution explains the projected four-year term and return model: rental income and projected profits on sale. The Sell step explains distribution of proceeds, including any profit, under the fund terms.
- Browser and social descriptions use the same revised explanation. The reservoir's regional label is Oriente Antioqueño; El Retiro remains in the specific home descriptions.
- Astra reviewed the copy, asset selection and geographic label. Approved investment figures, GP-side participation, property details, typography, nightlife layout and access policy remain unchanged.

## Verification

The production build and verifier passed: 10 EN/ES pages, 73 files, 59 media aliases, 16 active MP4s and 26 parsed inline scripts. The video-library check verified hashes and sizes of all 33 distinct retained videos, with no duplicates. All 47 existing server tests passed.

Eight EN/ES viewport checks passed at 1366×768, 1440×900, 820×1180 and 390×844. All 38 numeric legacy links resolved to their established subjects. After final copy edits, four additional desktop/phone checks confirmed the visible closed-end/resale explanation, matching reservoir poster, 1280×720 source dimensions and continuous playback of the complete 47.083-second clip. No JavaScript errors or horizontal overflow appeared. All 72 final presentation bounds checks passed. Final opening and reservoir captures were visually inspected.

Evidence and rollback material are outside Git and published assets in the parent workspace's `preservation/2026-10-05/reservoir-and-fund/` folder. Previous Worker version: `09731d0f-0c43-413e-a86a-c21a1d5de3fb`.

## Publication

- Application commit: `980889080a7f926edb00ea3a85da6ab2b75157ac`.
- Worker version: `d64514fe-9ab2-4b0d-a9cc-8fa4e86dc76a`.
- Canonical URL: https://invest.dulcineainvestments.org/.
- All eight public EN/ES page hashes match the build after propagation. The first immediate homepage check returned the preceding release; the subsequent verification confirmed the new version without redeployment.
- Financial statements and their aliases require login. An incorrect password was rejected; the existing password opened both languages; sign-out expired the session cookie.
- The reservoir video returned the requested 1024-byte range with HTTP 206. Public floorplans returned 200. Source and private paths returned 404.
- Runtime service/secret bindings and the independent review deployment remain unchanged.
