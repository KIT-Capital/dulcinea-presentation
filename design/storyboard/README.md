# Dulcinea One storyboard

Created 4 October 2026 with the Figma plugin. This is an editable narrative and layout proposal, not a website release.

## Open the boards

- [Seven-chapter overview — start here](https://www.figma.com/design/TSa7o009bLZpjJI6d7GBym?node-id=4-27)
- [Homepage sequence and motion notes](https://www.figma.com/design/TSa7o009bLZpjJI6d7GBym?node-id=4-28)
- [18-slide presentation contact sheet](https://www.figma.com/design/TSa7o009bLZpjJI6d7GBym?node-id=4-29)

The file belongs to the Norfolk AI Team. Existing Figma account access applies; no public-sharing permissions were changed.

## Read the story

1. Dulcinea One: an investment in homes members can also use.
2. Life here: El Oriente / El Retiro, then modern Medellín / El Poblado.
3. Membership: Lola & Ber, shared home use and conditional participation.
4. The homes: both country houses and all three city properties.
5. Execution: acquisition, renovation, rentals and sale; core team and specialists.
6. The investment: projected returns first, then the subscription offer.
7. Next step: contact, protected financial statements, acquisition criteria and disclosures.

The overview’s continuation text links to the corresponding detailed Figma chapter. Read the homepage board vertically; direction notes sit to the right of each chapter. The presentation contact sheet reads left to right, row by row.

## What is specified

- Manrope typography, Dulcinea colors and Old Gold for One.
- Existing approved images and video poster frames, editable text and layout nodes, three local reusable components, color and spacing variables.
- Continuous video playback with restrained image parallax. Film frames in Figma are stills; the board does not implement live parallax or playback.
- Distinct chapter transitions, one main continuation per chapter, related figures grouped together.
- Five separate property slides. Booking detail and Guatapé remain optional exploration outside the proposed 18-slide counter.
- Shared 365-night pool, collective 3% brand stake, 14.6% / 1.40× / four-year projections, and $7M / $2.1M / $4.9M offer groups. Existing qualifiers remain beside the figures.

## Implementation boundaries

Both websites remain unchanged. Source revision: a443159; published review application revision: 0bb9f62. See [handoff](../../docs/HANDOFF.md) for separate production and review deployment identifiers.

The storyboard abbreviates biographies, booking details and disclosures to establish the reading sequence. Implementation must retain complete approved content, both languages, presentation routing, property galleries and supplied floorplans, financial access restrictions and the current legal disclosure. It must not publish private source documents or expose production services.

Use the [narrative workflow](../../docs/plans/2026-10-04-homepage-narrative-workflow.md) as the implementation checklist. This storyboard does not authorize deployment or adoption over the original site.

## Saved evidence and editing

- [Overview PNG](overview.png)
- [Homepage PNG](homepage.png)
- [Presentation PNG](presentation.png)
- `figma-ledger.json`: file, node identifiers, content, image hashes and structural validation.
- `figma-*.js`: construction and polish scripts for the Figma Plugin API, not browser or Node runtime code. IDs refer to this existing Figma file. Inspect its canvas before re-running any mutation; these scripts are not an idempotent rebuild command.

The final three story canvases contain 224 editable text nodes and 27 component instances, plus individual image fills. All text uses Manrope. No complete UI screenshot was used as the editable canvas. The temporary asset-capture output was removed after its discrete images were transferred.
