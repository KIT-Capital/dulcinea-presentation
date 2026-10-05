# Canonical release — 4 October 2026

User authorization: approve the liked local preview after an Astra review, make it canonical and publish, with password protection for financial statements only.

## Final review

Astra reviewed the current authored content and notebook/phone captures. Fourteen bilingual wording changes clarify member benefits, acquisition status, fund subscription mechanics and financial labels. The KIT voice linter passed the revised English copy with zero failures or warnings. Complete approved biographies, booking rules, figures and disclosures are retained.

Visual corrections restore the membership film's landscape ratio, place the phone pause button clear of text, remove a duplicated returns eyebrow, use the measured header offset for anchors and correct accented menu titles. The accepted full-bleed opening and seven-chapter sequence remain. The 18-slide presentation retains all five homes, both team slides and two optional appendices.

## Publication setup

The default build targets the existing production Worker and custom domain, with active Dov contact links and canonical production metadata. An explicit review build retains inert contacts and review metadata. Separate guarded commands validate the target, build mode and exact allowed bindings. The existing financial-only access policy and remote secrets are preserved.

## Validation and release

- Production and review build verification passed: 10 EN/ES pages, 75 files, 61 aliases, 17 MP4s, 26 inline scripts.
- All 47 server tests passed. Wrong-target deployment guards were exercised and rejected before calling Wrangler.
- Both languages were checked at 1366×768, 1440×900, 820×1180 and 390×844 with no page errors or horizontal chapter/page overflow.
- All 72 desktop slide/language/viewport combinations passed text bounds checks. The final pass corrected the cover's inherited split grid and widened the Spanish membership slide's copy column. Astra signed off on both revised covers and the reviewed notebook/phone views.
- Existing 38 legacy-link checks and bilingual plan/appendix checks passed. Video-library verification confirmed 33 canonical videos preserved, 17 active and no duplicate files.
- Revised English copy passed the KIT voice linter with zero failures or warnings. Names, approved figures and terms were preserved.
- Published application: `10e04c29390813da9c159cbced6340b87bd282b6`.
- Live Worker version: `9b23653c-9127-4c2a-a220-7eff23efb6d0` at https://invest.dulcineainvestments.org/.
- Eight public EN/ES pages matched local build hashes exactly. Initial immediate post-deploy fetch still returned the preceding release; fresh checks after propagation matched the new build.
- Unauthenticated financial routes/aliases redirect to login. An incorrect password was rejected; the existing production password opened both languages; sign-out expired the session cookie. No credentials or cookies are retained in release evidence.
- Direct private/source paths returned 404. Public floorplans returned 200 and video byte ranges returned 206. Runtime binding names/types were unchanged and no secrets were updated.
- Live browser checks: no JavaScript errors, 18 slides, active Dov contact links, no phone horizontal overflow and financial-page navigation reached the password gate. Desktop, presentation and Spanish phone screenshots were saved.
- The independent review Worker deployment/settings were unchanged. The canonical production branch is `main`. After automatic approval review initially rejected the GitHub push, the user explicitly authorized committing and pushing the canonical source. Private raw evidence is in the parent workspace's `preservation/2026-10-04/canonical-release/`. Provider state, old homepage and deployed Worker were captured before changes. The previous production version is `2761df60-ce13-42ea-9cef-048ef22c3a1c`.
