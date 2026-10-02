# Model 10 and investor deck 032 reconciliation

Internal audit record, 2026-10-02. Not an investor page or downloadable asset.

## Sources and method

- Latest user-supplied workbook: `Dulcinea Model 10.xlsx`.
- SHA-256: `6943e850555794c314adc213e3e117bf237ebcbff8e6e09350cbb5a1edff1365`.
- Source modification: 2026-10-01 23:23:11 UTC (18:23:11 America/Chicago).
- Latest deck: `Dulcinea - Investor Presentation 032.pptx`. Its headline return matches the saved workbook; several typed financial and operating figures do not.
- Read-only openpyxl values/formulas plus ZIP XML cache inspection. No workbook edit, recalculation, source copy or external upload. The original source hash was unchanged after extraction and verification.
- `scripts/refresh-financial-model.py --source <private-workbook-path>` refreshes internal source records and English statement numeric cells. The normal site build produces Spanish financial pages from this same template.
- `content/model-summary.json` retains exact saved figures and source references. `content/financials.json` retains exact saved numeric XML, formulas, display sign conventions and derived totals. `content/properties.json` retains operating data and identifies the newer deck as the property-status source.

## Decisions confirmed directly by the user

- Use the Model 10 return and financing schedule: installments during Year 1, no calls after Year 1. Do not describe this as one upfront capital call.
- Use six months of works for Casa Montana, as in Model 10; the deck's nine months is superseded.
- Detailed booking rules are approved. The investor-facing cancellation term is 30 days from the deck; the unchanged workbook draft says 60 days. This is a terms difference, not an alteration to modeled cash flows.
- The existing instruction not to mention Ashoka or expose company/legal/financial source documents remains in force. Internal notes in the supplied deck do not override it.

## Headline changes from Model 09

| Measure | Model 09 | Model 10 | Saved Model 10 reference |
|---|---:|---:|---|
| Investor XIRR | 15.7224% | 14.6162% | Investor Return C22 |
| MOIC on called capital | 1.43553× | 1.40343× | Investor Return C21 |
| Capital called | $6,719,800.24 | $6,988,000.54 | Investor Return C16 |
| Undrawn commitment | $280,199.76 | $11,999.46 | Sources & Uses C23 |
| Distributions before carry | $10,378,143.19 | $10,511,962.60 | Investor Return C17 |
| Carry | $731,668.59 | $704,792.41 | Negative Investor Return C18 |
| Distributions after carry | $9,646,474.60 | $9,807,170.19 | Investor Return C19 |
| Investor profit after carry | $2,926,674.36 | $2,819,169.65 | Investor Return C20 |
| Net income before carry | $3,658,342.95 | $3,523,962.06 | Sum Income Statement C155:F155 |
| Fund-life reserve | $24,326.27 | $364,488.26 | Sources & Uses C14 |
| Total uses | $6,806,601.58 | $7,143,996.13 | Sources & Uses C16 |

Unchanged: $7M commitment, $2.1M committed, $4.9M remaining, $10,000 Units, $100,000 minimum, no modeled debt, $6,571,966.02 property all-in basis, $11,376,910.99 gross exits and Year 4 payback. Total uses include rental/retained proceeds and are not the amount called from investors.

Deal-return bridge: 22.6977% before tax, 20.1069% after gains tax, 18.3071% after overheads, 15.2836% intermediate after-carry deal flow, 14.6162% final fund investor XIRR. Do not substitute the intermediate result or annual IRR approximation of 14.7923% for the headline.

## Capital timing

Investor Return C7:F7 is $6,988,000.54 / $0 / $0 / $0. The monthly engine divides Year 1 capital among twelve acquisition/spend-weighted payments from October 2026 through September 2027. The independently calculated XIRR of those saved monthly flows is 14.6162181154%, within 0.000000001 of the saved 14.6162182093%.

For diagnosis only, holding the same saved distribution amounts and dates while moving all capital into one October 1 payment produces 12.4741%; an October 31 payment produces 12.8646%. These are not workbook outputs or adopted scenarios. They explain why the deck's one-upfront-call wording was not compatible with its 14.6% headline. The user selected the saved Model 10 installment timing.

No investor distributions occur before Year 3. After-carry distributions are $5,159,642.50 in Year 3 and $4,647,527.69 in Year 4.

## Owner-use effects

The full five-home annual pool is 365 nights, or 73 per home; it phases in with properties open for use and is shared pro rata to commitment. At full subscription, the modeled allocation is 5.2143 nights per $100,000 per year and 52.1429 nights per $1M. It is not 365 nights per Member.

Owner Benefits C43:C45 records $142,456.72 of rental revenue forgone and $10,428.57 of owner housekeeping, totaling $152,885.29 over the fund life. These effects are already included in the 14.6% / 1.40× base case. Brand equity and future-fund participation have no modeled value; saying all three benefits are absent from the base case would be inaccurate.

The workbook also assumes full use of owner nights, a 15% allowance for unrentable calendar gaps, ten maintenance nights per property, and a $111,667.71 reserve cushion for rental underperformance. Model 09-to-10 revenue change is not identical to the isolated owner-use revenue figure, because other calendar deductions also apply.

## Property operating values

Purchase prices, all-in costs, works budgets, areas, exit values and exit dates are unchanged. All five retain six modeled works months. Rental-month count excludes the sale month; the deck's approximate counts include one extra month.

| Property | Rental months | New stabilized annual NOI | Old NOI | Status for investors |
|---|---:|---:|---:|---|
| San Lucas 101 | 19 | $13,635.26 | $24,391.15 | Negotiated; compraventa drafted |
| Aires de Campestre | 22 | $7,367.85 | $18,984.21 | Closed 3Q26, latest deck |
| Fontanar 201 | 24 | $5,341.28 | $16,957.64 | Closed 3Q26, latest deck |
| Casa Monte Sereno | 26 | $1,236.56 | $12,799.63 | Negotiated; finalizing modifications |
| Casa Montana | 29 | $10,276.10 | $24,486.82 | Negotiated; works being budgeted |

The workbook still labels Aires and Fontanar signed with September 2026 closing; the later deck states closed September 2026. `model-summary.json` preserves saved workbook status labels; investor property content uses the newer deck's closed status, expressed as 3Q26.

## Pro forma statements

Deck slide 21 remains a stale typed P&L. The app statements use Model 10 values below, without exposing extraction details to investors.

| Measure | Year 1 | Year 2 | Year 3 | Year 4 | Total |
|---|---:|---:|---:|---:|---:|
| Rental income | $64,302 | $232,342 | $158,725 | $30,541 | $485,910 |
| Total revenue | $64,302 | $232,342 | $5,705,234 | $5,860,942 | $11,862,821 |
| Contribution margin | $49,160 | $177,842 | $2,250,437 | $2,267,408 | $4,744,848 |
| Contribution margin % | 76.5% | 76.5% | 39.4% | 38.7% | 40.0% |
| EBITDA | ($143,240) | ($62,862) | $2,073,993 | $2,224,680 | $4,092,571 |
| EBITDA margin | (222.8%) | (27.1%) | 36.4% | 38.0% | 34.5% |
| Net income before carry | ($143,240) | ($62,862) | $1,793,285 | $1,936,780 | $3,523,962 |
| Net income margin | (222.8%) | (27.1%) | 31.4% | 33.0% | 29.7% |
| Result after carry | ($143,240) | ($62,862) | $1,793,285 | $1,231,987 | $2,819,170 |
| Result after carry margin | (222.8%) | (27.1%) | 31.4% | 21.0% | 23.8% |
| Ending cash | $364,488 | $209,932 | $50,573 | $0 | $0 |

Carry remains an equity allocation and financing distribution, not an operating expense. The collapsible after-carry line, percentages beneath key profit measures and blank displayed zeros are retained. Income statement, balance sheet and statement of cash flows all remain in the app; removing a balance-sheet slide from the source deck is not an instruction to remove the app statement.

## Other numerical conflicts

- The workbook acquisition hurdle remains 20% deal-level IRR after gains tax; the latest deck's approved 12% investor-level target is a separate measure. Both need explicit return bases.
- The Portfolio Analysis 25% and 35% entry-discount columns are pasted from September 25 and unchanged since Model 09. They predate owner use and the reserve. Only the 30% base column is current. Do not publish those pasted scenario returns as a current sensitivity.
- The three city homes retain 8.5% annual appreciation and the country homes 7.15%; the portfolio's 7.8088% basis-weighted blend does not contradict the property rates.
- The $300–$1,000 nightly acquisition target differs from modeled ADRs of $250–$340; keep a target separate from actual underwriting inputs.

## Verification

`scripts/verify-model-source.py --source <private-workbook-path>` passed: 156 financial source cells/formulas and 242 model metrics match the saved source. Inspection found 20,797 formula cells, no Excel errors, no missing numeric formula caches and no external workbook links. The 320 empty string formula results are intentional blanks.

P&L subtotal arithmetic, margin denominators, carry bridge, operating/investing/financing subtotals, opening-to-closing cash, cross-year cash continuity and balance-sheet balances reconcile within $0.00000001. Final balance-sheet floating-point residual is approximately negative $0.00000000186, retained in source data and displayed blank. Statement cash equals balance-sheet cash in every period. Lifetime income less carry equals investor profit; distributions and capital totals equal Investor Return.

Source/template comparison also passed: all 165 displayed numeric cells match the stored financial records, all three tables remain, zeros are visually blank, the after-carry disclosure remains collapsible, and no workbook filename or cell reference appears in the investor-facing template. The normal bilingual build verification remains part of final app QA. No build or deployment is implied by source extraction alone.

## Integrated release verification

The portable and hosted English/Spanish builds passed on 2026-10-02. Financial source verification passed 156 saved cells/formulas and 242 metrics; all statement displays, margins, blank zeros, carry and cash/BS ties passed. The investor build verified ten pages, 64 files, 49 media aliases and thirteen distinct MP4s. All 33 server tests passed, including the financial-only password gate and denial of source documents.

Browser inspection covered notebook benefits, owner use, offer, returns, acquisition criteria and the financial carry disclosure; phone and tablet booking layouts retain their own scroll area above the controls. Brand equity is qualified as 3% collectively at full subscription. Public wording uses Acquisition criteria / Criterios de adquisición; original workbook sheet names remain internal.
