# Typography revision — 3 October 2026

The revision increases reading sizes and subtitle weight across the website, presentation, resource pages and login. Lifestyle rows now place explanations below their headings. Three columns on the main benefits slide preserve its conditions at larger sizes. Financial figures, business copy, legal text, media and authentication behavior are unchanged.

Local verification:

- Portable and hosted EN/ES builds and investor-build verification passed.
- All 33 Worker and video-range tests passed after the login CSS update.
- All 72 EN/ES main-slide checks at 1280×720 and 1366×768 passed without cropped headings, paragraphs, facts or actions after the benefits layout adjustment.
- All 36 Spanish responsive-slide checks at 390×844 and 768×1024 passed without horizontal overflow. Five Spanish website/resource pages also passed narrow-width overflow checks.
- Visually inspected lifestyle, benefits, property slides, property collection, financial tables, criteria and login. All ten Spanish criteria and their disclosure fit above the fold at 1280×720.
- All five property slides retained positive spacing between facts and actions. Mobile navigation links remained inside the viewport, and measured header height matched anchor clearance.
- Resource and login changes were checked for identical markup/logic outside CSS. Source workbooks and legal documents remain outside the site.

Release: application commit `3336137`, pushed to `codex/lifestyle-oriente` and published as Cloudflare version `afb9c672-3134-4ea3-bd54-24d525af0716`. Live verification confirmed 20px website lifestyle body, 30px semibold subtitles at the notebook viewport, 24px slide body and 29px semibold slide subtitles, plus 17px login fields. The live lifestyle slide was visually checked and captured. Temporary viewport overrides were reset. Private raw viewport reports and screenshots are kept outside deployed assets in the sibling `storyline-review` folder.
