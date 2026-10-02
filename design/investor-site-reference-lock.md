# Dulcinea investor website — approved design direction

Purpose: guide the production-source design promoted from the approved local simulation. The active implementation is `src/investor/`, built by `scripts/build-investor.mjs` through the standard build entry point. This document records design decisions; it does not certify a live deployment.

## References

Primary: [Aker](https://www.akercompanies.com/), Refero style `40181a87-fa8d-4b88-b59c-0516a353036a`. Preserve the cinematic full-bleed opening, large low-positioned sans wordmark, compact navigation and shifts between dark film and open editorial sections.

Secondary: [KOBU](https://kobu.co/), Refero style `2b86e8de-b21d-40d0-894a-f9d3a177a193`. Borrow the architectural gallery, restrained captions and generous photography. Pacaso informs the short offer explanation only; Dulcinea One remains a fund investment, not fractional title to one home.

The earlier [Radisson Resort Maldives](https://radissonresortmaldives.com/) reference informs the combination of lifestyle and investment. Reference websites provide visual direction, not media assets or text to copy.

## Decision ledger

| Decision | Implementation intent |
| --- | --- |
| Flowing website replaces the slide shell | Opening, approach, five-home collection, Lola & Ber lifestyle, team, fund and contact. Preserve old slide links through anchor mapping. |
| Business roles remain explicit | Dulcinea is the investment firm and operator; Dulcinea One is its first fund; Lola & Ber Hospitality is the co-brand. |
| Investment stays concise | $7M raise, $2.1M committed, $4.9M open and $10,000 units. Keep partial subscription, the ask and three equity kickers visible. Supporting projections open on request. |
| Brand palette leads | Blue Topaz, Plumeria, African Violet and Simply Green; little Coconut Shell. Yellow Gold distinguishes “One.” KIT Capital and Lola & Ber sit discreetly together in the opening. |
| Media has a clear purpose | City/property opening; city lifestyle and property viewing in the approach; hospitality/nightlife for Lola & Ber; drone closing. Walking and countryside women are separated, outside the opening and closing. |
| All supplied stock is represented | Nine unique videos and four photographs appear directly or in montages. Repeated uploads and formats are not extra assets. Reuse canonical MP4 paths. The README records the placement map. |
| Homes remain reviewable | Manual gallery, original imagery and nine plan pages for four confirmed homes. No invented Casa Montana plan. AI lifestyle illustrations retain concise labels. |
| Team photography stays authentic | Use the later supplied Dov, Ricardo and Adriana portraits. Specialist information belongs with the team, not with dining imagery. |
| Navigation occupies layout space | Sticky responsive header with section links, financials, criteria, compact EN/ES flags, contact and sign-out. Anchor offsets account for the header. |
| Financial detail is optional | Separate income statement, cash flows and balance sheet. KPI margins below amounts; expandable after-carry detail; blank zero cells. No Excel references or explanatory essays in public copy. |
| Motion supports reading | Silent video on visibility, restrained transitions and photographic camera movement. Pause while dialogs are open or the page is hidden; respect reduced motion. Plans remain still. |
| Existing access model remains | Cloudflare password gate, public social-preview assets, private investor resources and POST logout. A design deployment preserves remote secrets. |

## Visual rules

Use full-size imagery, large system-sans headlines, restrained monospace labels, thin caption rules and a small number of section colors. Avoid decorative shadows, dashboard styling, repeated generic cards and large empty menu areas. Keep investor copy direct and short. English and Colombian Spanish receive equivalent hierarchy, imagery, links and disclosures.

## Release review

### Property collection and drawing viewer — notebook-first update

Build target: the existing Dulcinea website and its 16:9 presentation, preserving the approved palette, typography, concise facts, bilingual content and five individual property slides. Desktop/notebook viewers are the priority.

Reference research through Refero: KOBU (`2b86e8de-b21d-40d0-894a-f9d3a177a193`) remains the primary property-gallery reference. Samara (`b7b0af34-1d65-4fc3-bb92-bc9ce9b0fb09`, https://samara.com) contributes only the clear separation of aspirational imagery and objective specifications. Scape's plan modal (`a9e7469d-a0bb-4bb0-b15f-5f87de5b1d8e`) supports keeping technical drawings isolated on a quiet, readable surface.

| Decision | Source and role | Implementation |
| --- | --- | --- |
| Photography leads | KOBU's architectural gallery | Large rectangular films near their native 16:9 ratio; no decorative cards or shadows. |
| Named property selectors | User's five-home portfolio and navigation task | Names accompany sequence numbers. A compact collection heading reserves notebook height for imagery. |
| Facts read at a glance | Samara's objective specification hierarchy | Location/type, property name, one sentence, prominent area, neutral acquisition status, then plans and original imagery. No invented features or claims. |
| Preserve the brand | Existing approved Dulcinea design | Paper/ink surfaces, existing sans and monospace roles, gold for restrained selection feedback. No imported reference palette or new font dependency. |
| Website and presentation stay equivalent | User's explicit requirement | One source of facts, films and dialogs; one slide per property. All drawing and original-image actions work in both views. |
| Drawings stay factual | Supplied PNGs and original PDF | Native-resolution lossless compression; recover Fontanar's original alpha mask on white. No redraw or generative enhancement. |
| Inspection has room | Scape plan-modal pattern adapted to notebooks | Near-window-size canvas, labeled floor/roof/site choices, zoom, fit, pan, and original PDF download. |

Reject: anonymous number-only navigation, oversized repeated collection headlines on slides, cropped original collages, approval-style status stamps, extra pan effects layered over the existing camera-move films, and fabricated property details.

Run the financial and investor-build verification scripts after building. Review desktop and mobile layouts, header clearance, property selection, four plan groups, language switching, resource links, stock-media sequences and reduced-motion behavior. Verify protected login/logout and deployed routes separately. Source promotion, a screenshot or a successful build is not proof that production has been updated.


## Lola & Ber chapter update — 2 October 2026

The user-supplied Lola & Ber Brand Guideline 01 is the reference for the brand chapter in both the website and presentation. Use its spaced Georgia/serif wordmark treatment, Warm Cream and Rich Green, the exact English tagline, and concise bilingual copy about sex-positive adults, consent, respect, privacy and optional connection. Hospitality names the division, not the brand category. The selected social photograph is AdobeStock_681077127, with a subtle looping Ken Burns move, intercut with the user-approved close embrace/kiss and women-holding-hands footage. Preserve the same green/cream text treatment and section layout. Preserve the broader Dulcinea visual system and the existing navigation.
