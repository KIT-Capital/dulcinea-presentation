# Homepage story expansion

## Active revision — 2 October 2026 approved storyline

The user approved implementation of `docs/plans/2026-10-02-001-refactor-lifestyle-storyline-plan.md`. This sequence supersedes the older slide counts, chapter orders and duplicated property browsing described below. It retains Dulcinea's approved palette, notebook-first proportions, current Lola & Ber brand treatment and existing media. Local build, browser and regression checks passed; the current results are in `docs/validation-2026-10-02-storyline.md`. Publication and live-release verification remain pending. Historical verification entries below describe earlier revisions only.

The website opens with the fund identity and an immediately available subscription strip, menu and resource links. The reading path then covers lifestyle, El Oriente, Medellín, Lola & Ber, Member benefits, five homes, investment approach, projected returns, offer, resources, core team, specialists, Contact and disclosures. After-dark footage sits within the Medellín chapter as supporting website content. Public `#returns` is a direct top-level section before `#fund` and does not depend on opening nested offer details.

The presentation has 18 main slides:

| Slide | Subject |
| --- | --- |
| 1 | Dulcinea One |
| 2 | The lifestyle |
| 3 | El Oriente |
| 4 | Medellín |
| 5 | Lola & Ber |
| 6 | Member benefits |
| 7 | Casa Monte Sereno |
| 8 | Casa Montana |
| 9 | Fontanar 201 |
| 10 | San Lucas 101 |
| 11 | Aires de Campestre |
| 12 | Investment approach |
| 13 | Projected returns |
| 14 | The offer |
| 15 | Core team |
| 16 | Specialists |
| 17 | Disclosures |
| 18 | Contact |

Approved booking rules are optional appendix detail opened from Benefits or the presentation menu. They do not increment the main counter or appear after Contact in ordinary traversal. A return action or Escape restores the originating slide; a direct appendix link returns to Benefits. `content/presentation-story.json` supplies sequence metadata and bilingual menu titles without duplicating financial or marketing copy.

Canonical links use stable subjects, such as `#present-oriente`, `#present-monte-sereno` and `#present-owner-use`. Legacy `#present-1` through `#present-19` remain mapped to their original subjects, not the new displayed positions. Older `#slide-N` migration remains intact. This compatibility is part of the release checks, alongside reload, language changes, browser history and presentation exit.

Property discovery uses five visible previews and one detail panel. The order is Monte Sereno, Montana, Fontanar, San Lucas and Aires; source-record indexes and floorplan associations remain unchanged. Each preview has a durable `#property-…` link. A fresh collection visit selects Monte Sereno; an existing selection survives a return within the page. Only the selected detail film plays within the collection; inactive previews use posters and `preload="none"`. All five films remain available when their property is selected, including the individual presentation slides. Original imagery and nine supplied drawings remain inspectable; no floorplan is invented for Montana.

Composition varies with content: the opening and El Oriente retain immersive films; Medellín uses shorter city and after-dark frames; Member benefits prioritize owner use with brand equity and conditional future participation as supporting rows; properties use factual detail; economics use aligned figures. Financials, criteria, specialists and disclosures use one compact resource-navigation renderer, consistent logo/heading roles and an explicit template marker. Financial rows, legal body scale and the financial-only sign-out control are preserved.

The current media inventory remains 13 distinct hosted MP4s. The opening leads with the reservoir and both country homes. El Oriente pairs reservoir and countryside footage with original garden imagery and the El Retiro town film; regional scenery does not imply a home's view. The walking and chef clips stay in Medellín. Lola & Ber uses the supplied robe photograph with the approved embrace/kiss and women-holding-hands clips in a 22-second silent edit. The male-running candidate remains deferred. Contact retains the Medellín drone flight. No new media purchase or generation is part of this revision.

## Historical — 2 October 2026 media correction

This earlier correction preceded the approved storyline and the later Lola & Ber two-clip film. Its 19-slide target and evening-photo brand treatment are superseded by the active revision above.

Build target: retain the approved website and 19-slide presentation, including their typography, layout and motion controls. This is a media-context correction requested by the user, not a new visual direction.

| Decision | Source | Role |
| --- | --- | --- |
| Place the pasture woman in El Oriente | User: country and green-home context | Main countryside film in both website and presentation; reservoir aerials frame the scene. The pasture shooting location is unverified. |
| Keep chef footage in the Medellín chapter | User: use all stock; no restaurant association for Lola & Ber | City dining context only, with city aerials and the separate walking clip. |
| Use supplied evening photography for Lola & Ber | User: sex-positive adult brand | Slow camera movement over the supplied adult evening image. No kitchen, pasture or city-walking footage in this film. |
| Separate the two women | Earlier user sequencing request | Separate films, with reservoir and city aerial footage before and after their appearances. Neither appears in the opening or closing. |

Both languages use the same revised films. Stock originals remain unchanged; edited films and internal provenance replace the prior compositions. No additional media licenses, external services or invented brand benefits are introduced.

## Historical — 1 October 2026 revision, lifestyle and El Oriente first

This revision supersedes the sixteen-slide order described below. The existing Dulcinea design and the Radisson destination/hospitality sequence remain the reference lock. No new visual system is introduced.

The scrolling story now runs: opening and subscription strip; lifestyle benefits; El Oriente; Medellín; Lola & Ber; the five homes; nightlife; investment approach; offer, kickers and returns; resources; team and specialists; contact and disclosures. The section index adds El Oriente, and lifestyle links lead to the expanded benefits section.

The presentation has eighteen slides: cover; lifestyle; El Oriente; Medellín; Lola & Ber; five individual properties; investment approach; offer; kickers; returns; team; specialists; disclosures; contact. Shared sections keep wording consistent across the website and presentation. English and Colombian Spanish are authored together. Financial values and membership conditions are unchanged.

El Oriente uses newly supplied reservoir footage `501694199` as a full-width cinematic chapter and slide 3, before the city. Direct links lead to both country homes. The existing El Retiro town aerial and original Monte Sereno garden photograph form a supporting website-only row. The user identifies the reservoir as El Oriente in the Medellín region; no reservoir name is established. The main visual is regional context, not a claim about the homes' views or location beside the water. The original Monte Sereno garden photograph remains available through the property viewer.

The opening montage leads with the reservoir and both country homes. It also adds newly supplied city-sunset footage `417029984` and retains every previous source scene. Both originals remain unchanged; canonical full-duration, silent 720p24 MP4s and posters are retained, with private evidence in `assets/video/stock/oriente-provenance.json`. The reservoir is the only new standalone video alias. The current media selection comprises thirteen distinct hosted MP4s using eleven supplied stock IDs, including excerpts within edited films. The Adobe countryside recommendations and geographic evidence in [el-oriente-footage.md](el-oriente-footage.md) remain separate; those recommended clips have not been acquired or installed.

Prior validation, before these two clips were added: English/Spanish build verification and all 33 server tests passed; notebook, phone and tablet layouts and country-property links were checked. That earlier build had twelve distinct hosted films. Those results do not establish validation of the new media update. Recheck the opening and El Oriente visuals in both languages and presentation modes, viewport and reduced-motion playback, asset routing and duplicate-file checks before release.

## Historical — previous homepage expansion

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

## Historical validation — previous homepage expansion

Checked in the local Cloudflare Worker at 1366 × 768 and 390 × 844. English and Spanish homepage chapters render without horizontal overflow. All eleven distinct films appear in the scrolling page. Visible films play; offscreen films and all films behind an open floorplan dialog pause. Property-film links select the corresponding detailed home, including Casa Montana's intentionally absent floorplan action. Spanish resource links resolve to Spanish pages.

The sixteen-step presentation remains separate: the new chapters and film grid are hidden. Verified the Aires property slide, its supplied plans, the Spanish hospitality slide and the projected-returns slide. Removed the obsolete hospitality crossfade opacity rule so its film is visible in both modes. Adjusted the hospitality headline to fit the desktop canvas. Build validation checks every film, the five preview links, independent hospitality/nightlife loops, visible projections and offer placement. The 29 server tests and authenticated local release checks pass.
