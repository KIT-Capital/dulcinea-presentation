# Dulcinea review handoff

Updated: 4 October 2026. Start here before changing the review website.

## Immediate task

The user says the homepage has lost its storyline: sections seem too close, and numbers and words compete without a clear sequence. The review produced a narrative workflow, followed by an editable Figma storyboard with seven chapter boards, detailed homepage compositions and an 18-slide presentation contact sheet. The latest storyboard revision applies Dov's direction to lead with what membership provides for the investor's life and family, before projected investment returns. **The narrative plan and storyboard revision have not been implemented or deployed on either website.**

Start with the [visual storyboard in Figma](https://www.figma.com/design/TSa7o009bLZpjJI6d7GBym?node-id=4-27), then read the [storyboard guide and saved previews](../design/storyboard/README.md). It uses current approved site content and assets; no company documents, source workbooks or private investor files were uploaded. The Figma draft has not been made public through new sharing permissions.

Follow [Homepage narrative workflow](plans/2026-10-04-homepage-narrative-workflow.md). The next pass must address the entire story before refining individual blocks. Do not call the storyline fixed because typography or one financial section looks better.

Proposed chapter order: Dulcinea One → Life here (El Oriente, regional outings, modern Medellín) → Membership (Lola & Ber and benefits) → The homes → Execution and team → The investment (projections, then offer) → Next step.

The opening now introduces all three benefits: stays with family and friends as homes open for use; collective Lola & Ber equity with no additional capital contribution; and conditional pro-rata economic participation in the carry of future Dulcinea funds. Chapter 3 explains all three visibly, with their conditions. Do not hide the future-carry benefit in an accordion or reduce it to a right to invest. Slide 2 gives the three-benefit overview; slide 6 explains membership terms. Keep all five property slides and introduce homes and the execution team before projected returns.

Use short factual headings and complete sentences. Remove slogan fragments, choppy verb lists and generic promises. Family and friend stays belong to the home-use story; Lola & Ber's adult brand has a distinct scene and must not be presented as family programming.

The latest published typography pass remains the runtime baseline. Retain its useful reading improvements; review its colorful metric panels as part of the overall chapter hierarchy.

## Working and deployment boundaries

| Item | Current reference |
| --- | --- |
| Review website | https://dulcinea-design-review.norfolk-ai.workers.dev/ |
| Review Worker | `dulcinea-design-review` |
| Review branch | `codex/radisson-independent` |
| Review worktree | `C:/Users/ricar/OneDrive/Documents/ChatGPT/Dulcinea Presentation/worktrees/radisson-independent` |
| Repository | https://github.com/KIT-Capital/dulcinea-presentation.git |
| Source before this storyboard revision | `fc02f8c` |
| Published application revision | `0bb9f62` |
| Published review Worker version | `26bdced0-c12c-464b-83b3-81261a93eced` |
| Published review deployment | `5c063f5b-3405-46bb-841b-cb1d9d7af444` |
| Production website | https://invest.dulcineainvestments.org/ |
| Production Worker | `dulcinea-investor-presentation` |
| Preserved production code | `bc2c0d52bdf68801d27ccb130f36f0973019485d` |
| Preserved production Worker version | `2761df60-ce13-42ea-9cef-048ef22c3a1c` |
| Preserved production deployment | `da9ba466-98b1-4140-98c3-b592c283e22c` |

The deployment identifiers above come from the completed typography release record. That release verified production deployment/settings and homepage content unchanged. This storyboard and documentation revision made no application, deployment or service changes; both websites remain unchanged by this work. Re-read live provider state before any later deployment; do not treat historical identifiers as a fresh verification.

Keep both sites available. No production merge, deployment, DNS, build-rule or shared-service change without explicit user approval. Both worktree Wrangler configurations target the review Worker; `scripts/deploy-review.mjs` enforces branch/config/name/no-routes/no-shared-bindings checks. Keep credentials outside Git. Replit packaging remains stopped.

## Evidence and recovery

The workspace `preservation` folder is outside the published build. It contains full baseline history/assets/private inputs and tested restore material; it is not just screenshots or branches. Start with `preservation/2026-10-03/comparison/restore.md` relative to the parent Dulcinea Presentation workspace.

The latest release record is `preservation/2026-10-04/typography-returns/release.json`. Its folder also contains the pre-release provider state, source snapshot, hashes, implementation patch and published screenshot. The record identifies the application revision and visual checks. Do not publish preservation folders, models, source decks or company/legal documents. The approved floorplan PDF is the sole permitted source-document download.

## Current runtime inventory

- The current main presentation has **19** entries, including a separate Guatapé slide, plus booking detail. The proposed next sequence has 18 ordinary slides; it is not current runtime behavior.
- The current web build has **17 distinct active MP4s**, 61 media aliases and 10 English/Spanish pages. The preserved video library has 33 unique canonical MP4s, with inactive clips retained for future use.
- English is default. Flag controls switch to Colombian Spanish and must preserve the current subject/property.
- The homepage and ordinary review assets are public by the user's later direction. Formal financial statements retain a separate, isolated password gate. Noindex is supplementary and does not replace that gate.
- Preview email, phone, WhatsApp and access-request actions are inert. No production lead, mail, CMS, analytics or database service is connected.
- Website and presentation share the five homes, galleries, original photos, property films and supplied plans. Montana has no supplied plan; do not invent one.
- All four core team members remain together: Dov, Ricardo, Adriana and Natalia. Dov is first. Preserve approved titles and biographies; Natalia is not a specialist. Maintain consistent portrait treatment and text padding.

## Content and motion decisions to preserve

- Model 10: 14.6% projected investor IRR; 1.40× capital multiple; four-year projected term; after-tax/after-carry and called-capital context. Capital installments occur during Year 1; do not revert to one upfront call. Montana's modeled works period is six months.
- Offer currently displays $7M total, $2.1M committed, $4.9M available and $100,000 minimum. These are supplied/approved content, not a new verification of subscriptions or closings.
- Benefits: member use phases in as each home opens, with a shared pool reaching 365 nights when all five operate, pro-rata allocation and approved booking terms. The 3% Lola & Ber stake is collective at full subscription, with no additional capital contribution, subject to membership terms. Future-fund carry participation is conditional and pro rata; do not invent a participation percentage or imply that future funds are guaranteed. Never turn pooled/collective rights into per-investor entitlements.
- Model 10 already includes owner-use costs in the projected base case. Lola & Ber equity and future-fund participation have no modeled value. Do not describe all three benefits as excluded from the base case or imply that home use starts immediately for every property.
- Lola & Ber is an adult, sex-positive brand. Hospitality is the property division name. Follow its supplied brand material; no chef/restaurant positioning.
- Retain El Oriente prominence and modern Medellín/El Poblado. Guatapé is a regional outing, not a property location/view claim. Keep faces inside the frame, continuous approved video playback and restrained spatial motion.
- No repeated canonical media files. Keep unused videos in the preserved library. The male-running clip, rejected garden-reading and outdoor-gathering clips remain excluded from active presentation. Nomad Capitalist/club-DJ editing remains pending clean source/rights and exact source identification.
- Do not mention Ashoka or expose legal/company/financial source documents. Keep financial zero cells blank, key margins visible, after-carry detail collapsible, and cash-flow statements available.
- “Talk to us” is the action label. Dov remains the contact. Keep home/website-return links, language controls and formal-financial sign-out behavior.

## Authority and source map

1. Current user decisions and the independent-version boundary.
2. Current approved source data and source content in the review worktree.
3. Dov/KIT writing guidance and the new narrative workflow.
4. Radisson as the primary experience reference; authenticated Refero research for BelArosa composition/motion, Resident property presentation and Atelier editorial rhythm. Borrow methods; retain Dulcinea identity.

Use `src/investor/index.html` for current authored copy; `content/presentation-story.json` for current subject order; `content/properties.json`, `content/model-summary.json` and `content/financials.json` for data; `docs/model-10-reconciliation.md` for resolved model/deck differences; `content/video-library.json` and `docs/video-library.md` for media; `src/investor/redesign.css` and `shared/investor-typography.mjs` for the latest design pass.

`design/homepage-story.md` and the 2 October plan contain historical orders, counts, titles and motion decisions. The 2 October plan's Natalia-as-specialist and older Ricardo title are superseded. Do not reapply them. Follow the new plan where it explicitly proposes a change; otherwise preserve current approved runtime content.

## Validation for the next implementation

Build: `node scripts/build.mjs --web`. Verify: `node scripts/verify-investor-build.mjs`. Run relevant server checks if routing, access, presentation behavior or shared rendering changes. Revalidate the video library if media assignments/files change.

Review the complete page and slide sequence at notebook, tablet and phone sizes in both languages. Check every chapter continuation, stable and legacy deep link, property selection, plan dialog and financial gate. Capture matched before/after views. Deploy only through the review guard after preserving source and provider state; record the new Worker version and prove production unchanged.
