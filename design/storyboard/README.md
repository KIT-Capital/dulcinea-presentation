# Dulcinea One storyboard

Created and revised 4 October 2026 with the Figma plugin. This is an editable narrative and layout proposal, not a website release.

## Open the boards

- [Seven-chapter overview — start here](https://www.figma.com/design/TSa7o009bLZpjJI6d7GBym?node-id=4-27)
- [Homepage sequence and motion notes](https://www.figma.com/design/TSa7o009bLZpjJI6d7GBym?node-id=4-28)
- [18-slide presentation contact sheet](https://www.figma.com/design/TSa7o009bLZpjJI6d7GBym?node-id=4-29)

The file belongs to the Norfolk AI Team. Existing Figma account access applies; no public-sharing permissions were changed.

## Read the story

1. Dulcinea One: life with family and friends, with home use, collective Lola & Ber equity at no additional capital contribution, and conditional pro-rata participation in future-fund carry introduced at the opening.
2. Life here: stays in El Oriente / El Retiro, then modern Medellín / El Poblado.
3. Membership: explain all three benefits visibly, with booking and participation terms available as detail.
4. The homes: both country houses and all three city properties.
5. Execution: acquisition, renovation, rentals and sale; core team and specialists.
6. The investment: projected returns first, then the subscription offer.
7. Next step: contact, protected financial statements, acquisition criteria and disclosures.

The overview’s continuation text links to the corresponding detailed Figma chapter. Read the homepage board vertically; direction notes sit to the right of each chapter. The presentation contact sheet reads left to right, row by row.

The opening follows Dov’s latest direction: members can use the homes during ownership, as each property opens, instead of waiting for an investment exit. It does not claim that every property is available today. Slide 2 introduces all three benefits; slide 6 explains their conditions. The destinations, five homes and team precede projected returns.

## What is specified

- Manrope typography, Dulcinea colors and Old Gold for One.
- Existing approved images and video poster frames, editable text and layout nodes, three local reusable components, color and spacing variables.
- Continuous video playback with restrained image parallax. Film frames in Figma are stills; the board does not implement live parallax or playback.
- Distinct chapter transitions, one main continuation per chapter, related figures grouped together.
- Five separate property slides. Booking detail and Guatapé remain optional exploration outside the proposed 18-slide counter.
- Shared 365-night pool with all five homes operating, collective 3% brand stake at full subscription, 14.6% / 1.40× / four-year projections, and US$7M / US$2.1M / US$4.9M offer groups. Existing qualifiers remain beside the figures.
- Home-use allocation follows commitment and booking availability. The brand stake has no additional capital call or dilution, subject to terms. Future-fund carry participation is conditional; no participation percentage has been invented.
- Owner-use costs are included in the modeled return. Lola & Ber equity and future-fund participation have no modeled value. These benefits are not added to the projected IRR or capital multiple.
- Family experiences belong to home use and destination scenes. Lola & Ber has its own adult brand scene.

## Implementation boundaries

Both websites remain unchanged. Initial storyboard source revision: a443159; pre-benefit-revision baseline: fc02f8c; published review application revision: 0bb9f62. See [handoff](../../docs/HANDOFF.md) for separate production and review deployment identifiers.

The storyboard abbreviates biographies, booking details and disclosures to establish the reading sequence. Implementation must retain complete approved content, both languages, presentation routing, property galleries and supplied floorplans, financial access restrictions and the current legal disclosure. It must not publish private source documents or expose production services.

Use the [narrative workflow](../../docs/plans/2026-10-04-homepage-narrative-workflow.md) as the implementation checklist. This storyboard does not authorize deployment or adoption over the original site.

## Saved evidence and editing

- [Overview PNG](overview.png)
- [Homepage PNG](homepage.png)
- [Presentation PNG](presentation.png)
- [Opening and three benefits](opening.png)
- [Detailed membership chapter](membership.png)
- [Membership terms slide](membership-slide.png)
- `figma-ledger.json`: file, node identifiers, content, image hashes and structural validation.
- `figma-benefits-revision.json`: latest user direction, exact qualifiers, changed nodes and validation. Detailed membership slide is now node `20:116`; its prior instance `7:92` was replaced with an editable frame to fit the terms without cropping people.
- `figma-*.js`: construction and polish scripts for the Figma Plugin API, not browser or Node runtime code. IDs refer to this existing Figma file. Inspect its canvas before re-running any mutation; these scripts are not an idempotent rebuild command.

The final three story canvases contain 232 editable text nodes and 26 component instances, plus individual image fills. All text uses Manrope. The revised frames and text fit their layout bounds. No complete UI screenshot was used as the editable canvas. The temporary asset-capture output was removed after its discrete images were transferred.
