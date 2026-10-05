# Dulcinea canonical website

Updated 5 October 2026. The user approved canonical publication and GitHub synchronization, then requested a larger fund title and explanation, removal of the lake outing, a more prominent nightlife section and matching Lola & Ber typography. The future-fund benefit must use plain language. Only formal financial statements require a password.

## Canonical release

- Canonical website: https://invest.dulcineainvestments.org/
- Production Worker: `dulcinea-investor-presentation`.
- Canonical repository: https://github.com/KIT-Capital/dulcinea-presentation.git, branch `main`. The user explicitly authorized committing and pushing the canonical source after publication.
- Current working checkout: `worktrees/radisson-independent` under the Dulcinea Presentation workspace; this checkout now uses `main`.
- Published and verified: application `187b32e`; Worker version `052f51e9-6395-4de3-9ff0-89c0d630ef54`. See `docs/validation-2026-10-05-impeccable.md`. Earlier releases are recorded in `docs/validation-2026-10-05-reservoir.md`, `docs/validation-2026-10-05-gp-participation.md`, `docs/validation-2026-10-05-opening.md` and `docs/validation-2026-10-04-canonical.md`.
- Historical independent review: https://dulcinea-design-review.norfolk-ai.workers.dev/ remains available separately.

Astra reviewed the canonical seven-chapter homepage and 18-slide presentation. The 5 October refinement leads with a large Dulcinea One title and explains the fund before the three member benefits. The lake outing is removed, nightlife uses a full-width film, and Lola & Ber uses the shared Manrope typography. The final user clarification is explicit: members participate economically on the general partner's side of future Dulcinea funds, sharing in the manager's performance profits alongside their own investment returns. The visible heading is “Participate alongside the fund manager.” See `docs/validation-2026-10-05-gp-participation.md` for the latest wording and checks. Homes, operating approach and all four core team members precede returns and the offer.

## Build and publish

The latest canonical update incorporates the approved Impeccable presentation refinements: shorter first slides, friends/spa sequencing on slide 2, concise specialist biographies and the confirmed Juan Carlos Pérez Sarmiento identity, gold One lettering, and dollar notation with a shared US-dollar note. Five property illustrations and their motion loops now use distinct fictional male guests, including blond guests in three homes. The closing groups Dov's portrait and role with one explicit WhatsApp button and a labeled email link; further-reading links are separate. Both contact destinations are active. The user explicitly requested commit/push and canonical publication; the comparison-only phase is historical.

The opening eligibility note now says only "Accredited investors only." Its two jump links were replaced with a non-interactive "Scroll down slowly to explore the full story" cue, with equivalent Spanish copy. The full payment schedule remains in the offer; deliberate header/chapter navigation and presentation controls remain available.

The hero again shows the Dulcinea, KIT Capital and Lola & Ber brand signatures on the website and opening slide. The row has a transparent background; monochrome CSS filtering and screen blending remove the pale raster backgrounds visually while preserving the original brand files. The logos remain in normal flow on mobile and are anchored within the desktop slide canvas.

The latest refinement uses the full 47-second green-water reservoir aerial in El Oriente, replacing the pine-first composite. Both the original pine footage and composite remain archived. The city hero remains. English and Spanish identify Dulcinea One as a closed-end real estate fund and explain the plan to buy, renovate, rent and sell homes for a profit. The execution section preserves the projected four-year term. Astra reviewed the final wording and regional label. Live media and financial-only access checks passed.

Production is the default: `npm run build:site`, `npm run verify`, `npm test`, then `npm run deploy:production` with `WRANGLER_CLI` pointing to the installed official CLI. The deployment guard validates the exact existing Worker, custom domain, access middleware, asset directory and production rate limiter. Existing remote password and session secrets are retained; never upload `.dev.vars`.

Review remains explicit: `npm run build:review`, `npm run verify:review`, `npm run deploy:review`. Review contacts stay inert and metadata uses the review origin. A private build marker outside published assets prevents mixing production and review artifacts. Rebuild production before its deployment after any review build.

The canonical website uses working Dov email/WhatsApp links and canonical production share URLs. Public content, media, plans, presentation, criteria, specialist directory and disclosures are public. Formal EN/ES financial statements and their aliases remain gated. The allowlist continues to reject source models, company/legal files, private inputs and unknown files even after sign-in. No lead storage, mail service, database, CMS or analytics integration is added.

## Content to preserve

- English default with Colombian Spanish; language changes preserve current subject/property.
- Seven chapters: opening, life here, membership, homes, execution, investment and next step.
- 18 main slides, including all five properties and both team slides. Booking remains the optional appendix. The Guatapé lake outing was removed at the user's request; its original media stays in the source library. Legacy numeric links retain their established subjects.
- Five homes with original imagery, existing films, galleries and nine supplied floorplan sheets. Montana has no supplied plan. AI property visualizations retain their disclosure.
- Dov, Ricardo, Adriana and Natalia stay together in that order, with approved roles and biographies. Natalia is a core team member.
- Model 10: 14.6% projected investor IRR, 1.40× projected capital multiple, four-year projected term; after tax/carry and on called capital. Capital paid in Year 1 installments. Montana modeled works period is six months.
- Supplied offer: US$7M target, US$2.1M committed, US$4.9M available, US$100,000 minimum. Status/figures are supplied approved content, not newly verified subscriptions or closings.
- Owner use phases in as each home opens: 73 nights per home, up to 365 pooled nights annually with all five operating, allocated pro rata and subject to booking terms. Never describe this as each member's allowance.
- Collective 3% Lola & Ber equity at full subscription, no additional capital contribution/call or dilution, subject to membership terms. Not 3% per member.
- Conditional pro-rata economic participation on the general partner's side of future Dulcinea funds, through the Managing Partner structure. Explain carry as the manager's performance profits, alongside returns on the member's own investment. Do not reduce the benefit to generic investor profit sharing or imply GP equity, governance or management-fee rights. No invented percentage or allocation denominator; future funds and distributions are not guaranteed. Planned US$10M/US$15M rounds remain secondary detail.
- Owner-use costs are included in modeled returns. Brand equity and future-fund participation have no modeled value.
- Lola & Ber is an adult, sex-positive brand; Hospitality is its property division. Keep it distinct from family home-use scenes.
- El Oriente and modern Medellín/El Poblado retain distinct scenes. Guatapé is a regional outing, not a portfolio location/view claim.
- 16 active MP4s, 33 unique preserved canonical videos, 59 media aliases. Keep unused films and approved continuous playback. No duplicate media, male-running, rejected garden-reading or outdoor-gathering films.
- Nomad Capitalist / club-DJ excerpts remain pending clean source/rights and source identification. No new footage was produced in this release.
- Financial zero cells remain blank, margins visible, after-carry detail collapsible and cash-flow statements available. Do not expose legal/company/financial source files.

The currently available Model 10 workbook has a different package hash from the approved extraction. A fresh read-only comparison on 5 October found all 27 sheets' saved values and formula views equivalent, including all current app references. The approved financial data and source template are byte-identical to the previous canonical release. The hash-gated source verifiers were not relaxed; see the current validation record for the explicit limitation and semantic evidence.

## Evidence and recovery

Final review evidence, screenshots, edited-copy record, provider snapshots and previous deployed Worker export are in the parent workspace's `preservation/2026-10-04/canonical-release/`, outside Git and the published build. The current production baseline before this promotion was Worker version `2761df60-ce13-42ea-9cef-048ef22c3a1c`. Earlier complete tested restoration material remains under `preservation/2026-10-03/`.

Source maps: `src/investor/index.html`, `content/presentation-story.json`, `content/properties.json`, `content/model-summary.json`, `content/financials.json`, `docs/model-10-reconciliation.md`, and `content/video-library.json`. The editable Figma storyboard and saved guide remain in `design/storyboard/`. Historical plans/release records describe previous states; do not reinstate earlier review restrictions, old slide order or superseded roles.
