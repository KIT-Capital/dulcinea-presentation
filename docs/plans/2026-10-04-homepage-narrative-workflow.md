# Homepage narrative workflow

Date: 4 October 2026. Status: reviewed implementation plan, not an applied website change.

This plan responds to the user's review of the independently deployed website: the storyline is difficult to follow, sections appear too close together, and numbers and words compete for attention. It supersedes the older homepage composition plans for the next design pass. Keep the existing implementation and approved content as the foundation.

## The story

Dulcinea One lets members invest in homes they can also use in Medellín and El Oriente. Show the life around those homes, explain membership and Lola & Ber, and introduce the actual properties. Then show how Dulcinea puts capital to work, who executes the plan, the projected economics and the subscription opportunity.

The opening must establish both investment and use. The experience comes first in the reading path, as Dov requested. Returns are projected; use is governed by membership and booking terms. Membership does not convey title to a particular home.

## What the review found

Evidence: live homepage DOM and visual review, `src/investor/index.html`, `content/presentation-story.json`, the Model 10 reconciliation, current media inventory and an independent narrative audit. The live desktop viewport was 1280 × 720.

- The cover offers several routes, followed by a nine-link section index and a subscription strip. The full raise figures arrive before the experience is explained.
- El Oriente, its garden and town scenes, Guatapé, Medellín, driving footage and nightlife read as successive restarts. Guatapé was added as a nineteenth main slide instead of remaining a supporting regional scene.
- The countryside sequence occupies roughly 2,773 vertical pixels including Guatapé at the reviewed viewport. Medellín occupies roughly 1,659. This is not a uniformly short-spacing problem; long media sequences and weak chapter boundaries coexist.
- The after-dark action jumps to the offer and bypasses the brand, benefits, properties and investment approach. Benefits lacks a clear ordinary continuation to the homes.
- Member benefits contains an annual pool, per-home allowance, two investment examples, a collective brand percentage and two future-fund amounts. Their different meanings do not receive sufficiently different visual roles.
- Returns gives the reader four document links and the offer action together. The offer repeats the available allocation in its figure group and following paragraph.
- Eyebrows repeat headings: Member benefits / Member benefits; The projections / Projected returns; The offer + the ask / The offer.
- The chapter index omits the operating approach and execution team. It is neither a concise story guide nor a complete directory.
- The recent type pass improved readability, but the colorful returns panels add another strong visual event without repairing the complete reading sequence.

## Seven chapters

These are navigation and editorial groups, not seven forced full-screen sections. Existing sections remain as scenes inside them. Labels below are working navigation labels; body copy must use full, concrete sentences.

| Chapter | Reader's question | What to show | Primary continuation |
| --- | --- | --- | --- |
| 1. Dulcinea One | What is this, and what do I get? | Fund identity; one sentence joining investment and member use; a short lifestyle introduction. Explain that Dulcinea handles acquisitions, works, rentals and sale. Retain a quiet partially subscribed status and a direct Offer shortcut, with the full subscription figures later. | Explore life here |
| 2. Life here | Why would I want time in this region? | El Oriente and El Retiro first: homes, green space, reservoir, town and Guatapé outing. Then modern Medellín and El Poblado: urban activity, driving, people and evening life. Country and city are two parts of the same proposition. | Meet Lola & Ber |
| 3. Membership | What does membership add? | Introduce Lola & Ber as the adult, sex-positive brand; Hospitality names the property division. Then home use, collective brand participation and conditional future economics. Keep consent, respect, privacy and all relevant conditions. | Explore the homes |
| 4. The homes | What is the actual portfolio? | Two country homes and three city homes. Preserve five visible previews, current status, original imagery, property films, galleries and supplied plans. Explain the region and property type beside each selected home. | How Dulcinea works |
| 5. Execution | How does this become an investment, and who does it? | One concise acquire/renovate/rent/sell explanation, supported by actual property material. Follow with the four core team members and local specialists. Establish accountability before asking the investor to assess projected returns. | Review the projections |
| 6. The investment | What are the projected economics and the terms? | First one aligned return group with its qualifiers. Then one subscription group with raise, committed, available and minimum, plus payment timing. Returns and the ask are consecutive parts of the same chapter. | Talk to us |
| 7. Next step | How do I investigate or discuss it? | A concise resource directory and Dov's contact under Talk to us. Retain financials, criteria and disclaimer links in navigation. Keep the homepage disclosure and the presentation's disclosure slide. | Talk to us / Review financials |

The early status is orientation, not a second full offer. A reader may jump directly to the offer or financials from navigation; the main chapter continuation follows the story.

## Give every number one job

| Location | Dominant information | Supporting information and conditions |
| --- | --- | --- |
| Opening | Investment plus member use | A quiet partially subscribed reminder; the complete raise figures belong to the offer. |
| Membership | Up to 365 shared nights annually when all five homes operate | State that this is the collective pool, not an individual entitlement. Keep 73 nights per active home and approximate pro-rata examples in booking detail. |
| Membership, secondary row | 3% collective Lola & Ber stake at full subscription | Preserve no additional capital call or dilution and the membership conditions. It is not 3% for each member. |
| Membership, secondary row | Conditional participation in future economics | Keep planned $10M and $15M future rounds and conditions in expandable detail; do not present them as committed raises or guaranteed benefits. |
| Projections | 14.6% projected investor IRR | 1.40× capital multiple and four-year projected term on the same baseline. Keep called-capital, after-tax/after-carry and no-guarantee qualifications adjacent. No animated counters or decorative chart implying a cash-flow path. |
| Offer | $7M total / $2.1M committed / $4.9M open | Use one aligned group or a clearly labeled subscription bar; do not restate all three in the following paragraph. Minimum $100,000 (10 units at $10,000), accredited investors and installments in Year 1 remain visible. |
| Individual home | That property's area, status and operating facts | No fund-wide return figures repeated on each home. Retain existing source records and dates/status distinctions. |

Preserve these approved figures exactly. This review did not recalculate Model 10 or independently verify subscriptions or closings. Use `docs/model-10-reconciliation.md` and existing data records when implementing. Any factual conflict is an open content issue, never a reason to improvise a number.

## Page composition and transitions

1. Give each chapter a clear opening: one short label, one lead sentence, one dominant visual or information group. Remove labels that simply repeat the heading.
2. Design the space between chapters separately from the space inside a chapter. At notebook size, start with 112–144px total separation from the prior chapter's final content to the next chapter opening; use roughly 32–48px between related scenes. At mobile size use 64–80px and 24–32px respectively. Validate these relationships visually; do not append that much padding to both adjacent sections.
3. A chapter opening should have its heading and the start of its visual or lead copy in the same viewport. Avoid a lone heading at the bottom of the screen, then a new media block after scrolling.
4. Use one shared text alignment and consistent reading widths. Keep lead copy around 28–36 characters per line, ordinary explanatory copy around 45–65 where the grid permits. Keep the readable Manrope scale from the current review; do not enlarge every text role again.
5. Associate color with chapters. Keep Dulcinea's palette and gold treatment. The three financial figures should look like one argument, with IRR dominant and the other two supporting it. Reassess the current three equally vivid panels in the context of the investment chapter.
6. Use a chapter guide with the seven group labels and a visible active label. Preserve the compact global menu and direct property/financial/criteria/disclaimer access. Avoid adding a second permanently fixed bar that reduces the notebook content area; use a compact chapter picker on narrow screens.
7. End each chapter with one primary continuation. Secondary property, booking and resource links remain discoverable but visually subordinate. Replace the nightlife-to-offer jump in the main path with the brand/membership continuation. Add the missing benefits-to-homes continuation.
8. Keep natural scrolling. BelArosa-style depth belongs to media within chapters; it must not pin body copy, freeze films or obscure section boundaries. Reduced-motion treatment removes spatial movement while preserving the established continuous-video policy.
9. Use full-screen films only when the image earns that scale. Alternate destination imagery, a short explanation and property evidence. Do not turn every block into a 100vh panel.
10. Do not remove information to achieve a short page. Keep the main story concise and allow booking rules, extra scene viewing, individual home detail and formal statements to open on demand. Maintain the user's ability to see most approved films from the homepage.

## Film roles

- Cover: metropolitan Medellín and the existing destination choices. No pasture woman, walking woman or unrelated nightlife takeover of the fund identity.
- El Oriente: approved green countryside, reservoir, El Retiro town and country-home imagery. Guatapé belongs here as a regional outing. Do not imply that a property overlooks the reservoir or is in Guatapé.
- Medellín: approved driving footage, skyline, El Poblado and urban life. Nightlife is a supporting city scene. Do not identify stock people as American, expatriate or actual members without evidence.
- Lola & Ber: approved brand film, embrace/kiss, women holding hands and supplied brand photography. No chef/restaurant imagery; no male-running clip; no rejected garden-reading or outdoor-gathering clips.
- Properties: retain every property film and original image with truthful illustration labels, correct plans and maps. Technical drawings remain unaltered in geometry and dimensions.
- Closing: Medellín drone flight.
- Retain originals and canonical optimized files without duplicates. An unused film remains in the preserved media library; it is not deleted to simplify the story. Nomad Capitalist and the unidentified club/DJ source remain pending source/rights identification; this plan does not authorize obtaining or editing them.

## Presentation follows the same argument

Target 18 ordinary slides, preserving five individual property slides:

1. Dulcinea One
2. Lifestyle and member use
3. El Oriente, with Guatapé as supporting exploration
4. Medellín and El Poblado
5. Lola & Ber
6. Member benefits
7. Casa Monte Sereno
8. Casa Montana
9. Fontanar 201
10. San Lucas 101
11. Aires de Campestre
12. Investment approach
13. Core team
14. Local specialists
15. Projected returns
16. The offer
17. Disclosures
18. Talk to us

Keep booking detail optional. Preserve `#present-guatape` as an optional slide showing the actual Guatapé film and its established content, with an explicit return to El Oriente or the originating slide. It stays outside the 18-slide main counter and ordinary Next/Previous traversal. Do not redirect it to generic El Oriente content or leave a broken link. Keep all existing stable property and subject links and legacy numeric mappings. A displayed slide number may change; its old numeric deep link must retain its established subject. Contact remains the final ordinary slide under the user's existing direction.

The presentation shares authored content, terms and media with the website, but uses deliberate slide compositions. Do not shrink a long web chapter onto a canvas. Desktop keeps a 16:9 canvas; phone and tablet slides remain readable, touch-navigable and scrollable where necessary.

## Implementation workflow

1. **Freeze the content inventory.** Record the deployed review revision, all section and deep-link destinations, approved figures, biographies, property status and media roles. Distinguish the current review from the untouched production baseline.
2. **Lay out the complete storyboard.** Create a continuous notebook-width storyboard covering all seven chapters before coding a single isolated section. Annotate the main sentence, visual, figure group and continuation for each. Include the 18-slide contact sheet. This is an internal design check, not another approval gate for already authorized routine work.
3. **Fix the narrative structure.** Group existing sections, resolve the competing CTAs, combine regional outings under the destination chapter, and put execution before projections. Reuse components and data; preserve every required page and property function.
4. **Apply the composition system.** Set chapter/scene spacing, shared alignment, color roles and figure hierarchy across the entire flow. Inspect ordinary notebook scrolling, not just individual screenshots. Keep the current readable font foundation where it works.
5. **Carry it through English, Spanish and presentation.** Update the shared story manifest and both language labels together. Preserve subject links, return-to-website routes, property selection, booking detail and financial gating.
6. **Verify the argument and runtime.** At 1366 × 768 and 1440 × 900, read the homepage start to finish and record each chapter handoff. Then check 820 × 1180 and 390 × 844, Spanish expansion, keyboard/touch navigation, media playback and frame crops. Verify exact figures, gates and private-file exclusions.
7. **Publish the review and compare.** Build and verify using the existing scripts, deploy only through the review guard, compare before/after at matched viewports, and confirm production deployment, settings and homepage content did not change. Record revision and Worker version; commit and push only the review branch.

## Acceptance criteria

- Within the opening, a first-time reader can say what Dulcinea One is, that members invest and can use the homes, and that they are in Medellín/El Oriente.
- The reader can identify the current chapter without using the browser address bar.
- El Oriente and modern Medellín receive distinct, balanced treatment; supporting footage does not create accidental chapters.
- Every chapter has one obvious next step and no competing headline metric groups.
- Owner-use pool, individual allocation, collective brand ownership and projected returns cannot be mistaken for one another.
- Projections, subscription terms, minimum and relevant qualifications are readable together in their proper groups.
- All five homes, plans, galleries, team biographies, specialists, approved benefits and required disclosures remain available.
- Full-page review shows deliberate transitions, no orphan headings, no large accidental gaps, no overlapping navigation, and no horizontal text overflow.
- The 18-slide main presentation tells the same argument and keeps stable deep links and optional detail working.
- Production remains untouched; the review keeps inert contact actions, isolated financial access, noindex and private-source exclusions.
