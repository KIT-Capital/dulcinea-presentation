# Homepage story expansion

## 1 October 2026 revision — lifestyle and El Oriente first

This revision supersedes the sixteen-slide order described below. The existing Dulcinea design and the Radisson destination/hospitality sequence remain the reference lock. No new visual system is introduced.

The scrolling story now runs: opening and subscription strip; lifestyle benefits; Medellín; El Oriente; Lola & Ber; the five homes; nightlife; investment approach; offer, kickers and returns; resources; team and specialists; contact and disclosures. The section index adds El Oriente, and lifestyle links lead to the expanded benefits section.

The presentation has eighteen slides: cover; lifestyle; Medellín; El Oriente; Lola & Ber; five individual properties; investment approach; offer; kickers; returns; team; specialists; disclosures; contact. Shared sections keep wording consistent across the website and presentation. English and Colombian Spanish are authored together. Financial values and membership conditions are unchanged.

El Oriente uses the original Monte Sereno garden photograph and the existing El Retiro town aerial. The rural landscape and the town are captioned separately. New Adobe Stock countryside candidates and geographic evidence are recorded in [el-oriente-footage.md](el-oriente-footage.md); they have not been licensed or installed.

Quality checks: English/Spanish production build verification and all 33 server tests pass. New slides checked at notebook size, plus responsive phone and tablet layouts; country-property links select Monte Sereno in both site and presentation mode. Motion observes the existing pause/reduced-motion behavior. There are twelve distinct film aliases in the homepage build, with no duplicate file copy for the new El Retiro alias.

## Previous homepage expansion

Build target: the existing Dulcinea design, navigation and sixteen-slide presentation. Direct implementation of the user's request to restore substance and make more films visible on the scrolling homepage.

Reference lock: existing Dulcinea typography, teal/Blue Topaz/old-gold roles, sharp media edges and concise language. Retain notebook-first proportions, no navigation/content overlap and the separate English/Spanish versions.

Research: Radisson Resort Maldives (https://radissonresortmaldives.com/) separates the destination, investor proposition, residences and hospitality into visible chapters. Borrow that sequence, not its claims. Refero's BelArosa Chalet style (1396fd36-a1bc-4d2b-a59c-1111f17145dc) provides alternating immersive media and lighter explanatory sections. Kobu (2b86e8de-b21d-40d0-894a-f9d3a177a193) contributes large architectural images with short captions and explicit property names. The current Dulcinea system remains the visual authority; no new fonts or reference-brand colors.

| Decision | Source | Purpose |
| --- | --- | --- |
| Short section index below the opening | User: things hard to find | Direct route to strategy, destination, homes, lifestyle and offer |
| Early commitment/offer strip | User: fuller idea from homepage | Establish fund and remaining allocation before exploring |
| Four short buy/improve/host/sell steps | Established Dulcinea source story | Explain how the investment is intended to work |
| Five visible property film previews | User: see most videos from homepage; Kobu media scale | No manual carousel needed to discover the collection |
| Dedicated hospitality and nightlife films | User media sequencing; Radisson chapter rhythm | No waiting for the second film in a crossfade |
| Fund before team, projections open by default | User: information hard to find | Surface the ask, kickers and results in the main reading path |
| Native scrolling and viewport-controlled playback | Existing app motion | Avoid simultaneous offscreen video downloads/playback; preserve reduced motion |

Use existing optimized films and original posters. No new generated imagery, financial projections, booking rights or title-to-a-home promises. Lifestyle benefits remain subject to membership terms. New overview chapters are homepage-only; property details and all original presentation slides remain available.

## Validation

Checked in the local Cloudflare Worker at 1366 × 768 and 390 × 844. English and Spanish homepage chapters render without horizontal overflow. All eleven distinct films appear in the scrolling page. Visible films play; offscreen films and all films behind an open floorplan dialog pause. Property-film links select the corresponding detailed home, including Casa Montana's intentionally absent floorplan action. Spanish resource links resolve to Spanish pages.

The sixteen-step presentation remains separate: the new chapters and film grid are hidden. Verified the Aires property slide, its supplied plans, the Spanish hospitality slide and the projected-returns slide. Removed the obsolete hospitality crossfade opacity rule so its film is visible in both modes. Adjusted the hospitality headline to fit the desktop canvas. Build validation checks every film, the five preview links, independent hospitality/nightlife loops, visible projections and offer placement. The 29 server tests and authenticated local release checks pass.
