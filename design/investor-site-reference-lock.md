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

Run the financial and investor-build verification scripts after building. Review desktop and mobile layouts, header clearance, property selection, four plan groups, language switching, resource links, stock-media sequences and reduced-motion behavior. Verify protected login/logout and deployed routes separately. Source promotion, a screenshot or a successful build is not proof that production has been updated.
