# El Oriente: countryside emphasis

## Build target

Extend the existing Dulcinea website and shared presentation, prioritizing notebook screens. The user wants substantially more countryside exposure near Medellín. The reservoir becomes a full-width landscape chapter with a short message and direct links to both El Retiro homes. This is an existing-design-system update, not a new visual direction.

## Reference lock

Primary: Aker, Refero style `40181a87-fa8d-4b88-b59c-0516a353036a`, read through Refero on 1 October 2026. Retain its cinematic full-bleed media, low-positioned large sans headline, sparse overlay content and clear transitions into lighter editorial sections, using Dulcinea's existing typography and color roles.

Secondary: BelArosa Chalet, Refero style `1396fd36-a1bc-4d2b-a59c-1111f17145dc`, read in the same research pass. Borrow only the nature-first imagery and sense of place. Do not import its typefaces, palette, pill buttons or additional styling.

No new fonts, colors, decorative shadows, generated imagery, cards or gradients used as decoration. The restrained dark film overlay serves text contrast. Existing gold remains hover feedback; white text sits over the reservoir, and the existing paper/ink surface holds supporting material.

## Decisions

- The reservoir fills the lead rather than competing with a small image grid. Its caption identifies regional landscape without naming the reservoir or implying that a selected home has that view.
- “Country homes. Close to Medellín.” introduces gardens, terraces and time outdoors, followed by separate Casa Monte Sereno and Casa Montana links. Spanish uses equivalent wording and the same hierarchy.
- The scrolling website follows the cinema with the original Monte Sereno garden photograph and the existing El Retiro town aerial. The supplied photograph is unchanged; CSS shows the lower garden panel of the original sheet.
- Presentation mode uses the cinema alone, filling its slide. Supporting media is hidden with `display:none`, so the town video does not play invisibly. Both named property links retain the existing presentation navigation behavior.
- The same reservoir element, aliases, visibility-driven playback and reduced-motion handling serve both modes. Mobile and tablet layouts retain readable copy and touch-sized links; presentation content reserves device safe areas.

## Validation — 1 October 2026

- Both build modes and the investor build verifier passed: ten EN/ES pages, 49 media aliases and 13 distinct MP4 files. The server suite passed all 33 tests before these presentation-only refinements.
- Browser review passed for the English and Spanish presentation at notebook size, plus the Spanish slide at 390×844 and 1024×768. Text and both property links fit above the presentation toolbar, with no horizontal overflow.
- Casa Monte Sereno opens presentation slide 9; Casa Montana opens slide 10. El Oriente is slide 3, before the city slide.
- The reservoir plays without media errors. The hidden supporting town video remains paused in presentation mode. Website review confirmed the original garden photograph crop, town footage, and separation from the fixed header.
- The opening film is 53.5 seconds and begins with the reservoir, Monte Sereno and Montana. The existing reduced-motion controls are retained.
- A separate code review found no blockers in bilingual content, ordering, responsive rules, property links or media wiring. Production deployment is recorded by Cloudflare, not certified by this local review.
