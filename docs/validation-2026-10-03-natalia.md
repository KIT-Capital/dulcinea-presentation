# Natalia Carvajal joins the core team

Natalia follows Dov, Ricardo and Adriana in the shared website/presentation section. Her existing Lola & Ber brand-implementation role is retained in English and Spanish, without adding unsupported biographical claims. She is removed from the shared specialist directory, including its resource pages.

The supplied low-resolution screenshot was restored with the built-in image editor as a neutral black-and-white portrait. The source was preserved. The retained 1254 × 1254 PNG and edit prompt are documented in `design/natalia-portrait.md`; only the portrait asset is deployed.

Validation:

- Portable and hosted EN/ES builds and investor-build verification passed. The verifier checks exact four-person membership/order, presentation reuse, portrait mapping, localized role and absence from specialists.
- All 33 Worker and video-range tests passed; the generated public-media allowlist includes only the new portrait in addition to existing approved assets.
- Browser checks passed for the core-team website and presentation in both languages at 1280 × 720, 768 × 1024 and 390 × 844. No horizontal overflow or clipped canvas profiles. All four portraits load with the same grayscale treatment.
- Notebook slides use two rows of portrait/text pairs, retaining the 24px canvas biographies. The website uses four desktop columns, two tablet columns and a single mobile column. Responsive presentations use two tablet columns or one phone column with natural scrolling.
- Visually checked the English/Spanish notebook slides, desktop website portraits and Spanish tablet layout. Checked the specialists slide after removal.

Screenshots and raw layout results are retained in the sibling private `storyline-review` folder.

Published from application commit `191a388` on `codex/lifestyle-oriente` as Cloudflare version `2fef4bb6-25d4-4ba7-a2e4-b31341b8831a`. Live checks confirmed all four core profiles and the new portrait on the team slide, the localized Natalia role on the Spanish slide, and her absence from the Spanish specialists page. The published English slide was captured as `natalia-core-team-published.png`. Temporary viewport overrides were reset.
