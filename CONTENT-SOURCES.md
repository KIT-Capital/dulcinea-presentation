# Content sources

The user’s explicit clarification governs company roles: **Dulcinea is the operating company; Dulcinea One is the investment vehicle.** It overrides source descriptions that use ServCo or could imply KIT Capital is the operator. KIT Capital remains in source-supported biographies, the named Buy Box filter and the supplied contact email, not as the operating company.

`Dulcinea Model 07.xlsx` is the financial source of truth for this presentation. Its active numeric assumptions and saved formula results take precedence over older figures or conflicting prose in `Dulcinea - Investor Presentation 027.pptx`. The PowerPoint supplies the investment narrative, biographies, property imagery, source-reported transaction statuses and qualitative offer terms. Membership documents govern investment rights.

The original files remain in the user's supplied document locations. No personal absolute paths, raw application/session data or individual payroll records are included here. `content/model-summary.json` records unrounded model figures, assumptions and exact worksheet/cell references. `content/properties.json` records the displayed property information.

| Source | SHA-256 |
| --- | --- |
| Dulcinea Model 07.xlsx | `0b83807af2fdbb2268eb78c22e2bb5b93d9a733891e1b0e821078c34d6517d8c` |
| Dulcinea - Investor Presentation 027.pptx | `dadd5d70d4aa4de42ec527f508760d61c711488be9157aca2e5123e7d3f9ab70` |

## Internal financial checks

Per the user’s direction, the website is light on numbers. Financial statements, sensitivities, return bridges and worksheet references are not rendered. The following records document internal checks against the model; they are not the site’s narrative.

## Applied financial distinctions

- **Commitment and called capital:** the $7M program commitment produces $6,719,800.24 of modeled calls and $280,199.76 undrawn. Investor distributions after carry are $9,646,474.60, yielding 1.435529964× on called capital and 15.722407699% monthly dated XIRR (`Investor Return!C16:C23`; `Sources & Uses!C23`). The PowerPoint's rounded $9.65M / 1.44× / 15.7% headline is reconciled. Gross property exits of $11,376,910.99 are a different measure (`Dashboard!C15`).
- **Acquisition hurdle:** the model specifies 20% deal-level IRR after gains tax (`The Buy Box!C18:D18`, `C37`), replacing the deck's 15% investor-level hurdle. Modeled portfolio deal XIRR after gains tax is 20.8103%; final investor XIRR after fund costs, carry and cash-flow timing is 15.7224% (`Portfolio Analysis!E14:E17`).
- **Entry sensitivity:** 25% / 30% / 35% discount yields 13.2497% / 15.7224% / 18.4947% investor XIRR and 1.361695× / 1.435530× / 1.520724× MOIC (`Portfolio Analysis!I7:K11`). H12 identifies the side cases as pasted manual full-fund sweeps dated 2026-09-25; only the base column is live. These values are retained for internal checks; sensitivities are not rendered on the site.
- **Tax and net income:** model ordinary rental-income tax is zero in each year under its cumulative-loss formula (`Income Statement!C150:F150`). This replaces the deck's $689 Year 2 tax. Lifetime fund net income before carry is $3,658,342.95 (`C154:F154`); gains tax is $568,608.75 (`C151:F151`). The 15% rates, 3.35% tax-basis indexation and municipal assumptions are model inputs, not an independent statement of applicable tax law (`Input!C25:C28`; El Retiro placeholder notes `T83:T84`).
- **Works and rental timing:** all five active properties have six-month works assumptions (`Properties!R6:R10`; `Input!M80:M84`). This supersedes the deck's nine months for Casa Montana. Rental months are `Properties!U−T`, excluding the sale month: San Lucas 19, Aires 22, Fontanar 24, Monte Sereno 26 and Montana 29. The original deck's approximate durations are one month longer. Purchase/hold/exit quarter descriptions remain consistent.
- **Rental economics:** the internal property records use stabilized annual property NOI (`Properties!X6:X10`), before fund overhead. Lifetime property rental NOI is approximately +$160,288, but after fund overhead the rental result is approximately −$145,671 (`Income Statement!C112:F112`, `C139:F145`). The internal records do not equate annual NOI with distributions or imply that rents fail to cover property-level operating costs.
- **Brand kicker:** up to 3% applies at full subscription; the model calculates 0.9% at the reported $2.1M commitments (`Input!C48:D51`). Brand carrying value is zero (`C52`), and kicker value is excluded from base returns. The presentation does not create per-investor brand-allocation terms. Future-round participation and Managing Partner priority remain subject to Membership documents.

## Source differences retained explicitly

- **Property status:** the property pages and model identify Aires and Fontanar as signed for September 2026 closing; the other three are negotiated (`Properties!C6:C10`, `H6:H10`; deck slides 14–18). Earlier deck summaries conflict. Displayed statuses follow the property records and are not independently refreshed. Forward model acquisition months are not evidence of completed closings.
- **Targets versus active underwriting:** the Buy Box keeps a $300–$1,000 nightly target, but active ADRs are $250–$340 (`The Buy Box!D15`; `Input!J80:J84`). The model uses a 28-night minimum and $9,500 cap for the first minimum stay (`Input!C170:C172`). San Lucas's $747,370.55 all-in cost is below the $750K target (`Properties!P8`). The model's “Yes” checks test only location, discount, hold and positive cost (`The Buy Box!J22:J26`), not every criterion or completed diligence.
- **Entry-discount basis:** the 30% modeled discount compares all-in basis with improved comparable value; it is not a 30% discount on the purchase-price column. The deck's rounded price-per-m² table was checked internally and is consistent with that basis; it is not rendered on the site (`Properties!M6:P10`, `W6:W10`; `Input!I80:I84`; deck slide 7).
- **Workbook prose:** stale statements about $7M “invested,” 70% occupancy, 24-month exits and quarter-based timing do not override active numeric cells. `Sources & Uses!C7` is a presentation residual, while its “cap binding” label conflicts with undrawn commitment in C23. That residual is not presented as called capital. The source notes the $7M authorization amendment as pending signature (`Input!D43`); the financial scenario does not establish completed legal authorization.

## Validation and imagery

The workbook was inspected read-only without recalculation or external upload; its source hash remained unchanged. No cached Excel error cells or empty numeric formula caches were found. The 320 empty formula caches were typed strings. Calls, distributions, MOIC and property-exit totals reconcile; an independent XIRR calculation from cached monthly flows agrees with the saved result. These checks validate the extracted snapshot, not the timing of the last complete recalculation or the forecast's real-world outcome.

The PowerPoint supplies illustrative lifestyle/market images, property imagery and team portraits. Background videos combine user-supplied stock footage and a nightlife sequence animated from supplied photographs. They are illustrative, not footage of an operating Dulcinea property. See ASSET-SOURCES.md for provenance. Radisson Resort Maldives is a visual design reference only; its imagery, claims and trademarks are not incorporated. Logo and palette provenance is documented separately in `ASSET-SOURCES.md` and `design/README.md`.
