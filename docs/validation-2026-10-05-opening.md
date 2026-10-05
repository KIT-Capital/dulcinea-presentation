# Opening and story refinement — 5 October 2026

The user requested a larger Dulcinea One title, an explanation of the fund before the story, removal of the lake outing, more prominence for Medellín nightlife and typography consistent with the website for Lola & Ber. A follow-up requested consumer language for the future-fund benefit.

## Changes

- The large fund name leads the website and presentation. The introduction identifies the first Dulcinea real estate fund, five homes, locations, renovation and management, and member stays as homes open.
- The Guatapé lake section and appendix are removed. Its clip remains archived in the source video library, with its active aliases and public asset entries removed. The 18 main slides and all numeric legacy subjects remain intact.
- Nightlife now has a dark heading area and a full-width 16:9 film with its complete frame visible. At 1366px wide, the film is 768px tall, compared with 360px previously.
- Lola & Ber's heading and tagline use Manrope; the heading keeps normal case and matching letter spacing in website and presentation views.
- “Profit share from future funds” replaces the consumer-facing carry labels. Copy explains participation in Dulcinea's portion of future fund profits, subject to membership terms. Detailed benefit copy retains pro-rata participation through the Managing Partner without specifying a new percentage or allocation denominator.

## Verification

- Production build and verifier passed: 10 EN/ES pages, 73 files, 59 media aliases, 16 distinct active MP4s and 26 parsed inline scripts.
- All 47 existing server checks passed, including financial-only access, sign-in/out, private-source exclusion and video byte ranges.
- Eight EN/ES viewport checks at 1366×768, 1440×900, 820×1180 and 390×844 passed with no JavaScript errors or horizontal page overflow. Computed font checks confirm Manrope for both Lola & Ber heading and tagline.
- All 72 desktop slide/language/viewport checks passed after shortening the Spanish benefit explanation to prevent clipping. All 38 EN/ES legacy numeric routes resolved to their established subjects.
- Source video verification passed: 33 retained originals, 16 active films and no duplicate files.
- KIT voice checks on the revised opening and benefit explanation passed with zero failures or warnings. A separate agent reviewed narrative dependencies, wording precision and the final diff.
- Screenshots and provider/source backups are private in the parent workspace's `preservation/2026-10-05/opening-refinement/` folder. Previous production Worker: `9b23653c-9127-4c2a-a220-7eff23efb6d0`.

## Published release

- Application commit: `f77c5e0b92ae0cefa511273c93899faa398837a4`.
- Worker version: `53f7a6ea-2777-49ad-8353-8625671c9cf6`.
- Canonical URL: https://invest.dulcineainvestments.org/.
- Eight public EN/ES pages matched the built files exactly. Public floorplans returned 200; the nightlife film returned a correct 1024-byte range with status 206.
- Financial routes and aliases still redirect unauthenticated visitors to login. An incorrect password was rejected; the existing password opened both languages; sign-out expired the session cookie. No secrets changed.
- Source/private paths returned 404. Provider binding names/types and the independent review deployment remained unchanged.
