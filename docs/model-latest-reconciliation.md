# Pro Forma workbook reconciliation — 9 October 2026

Internal source and validation record. The workbook and this audit are not website downloads. This record supersedes current numerical conclusions in `model-10-reconciliation.md`; that earlier document remains historical evidence.

## Source and scope

- User-supplied `Dulcinea Pro Forma Model.xlsx`, latest original modification time `2026-10-09T21:21:53.1111764Z`. Snapshot file modification time is recorded separately; the original time comes from the hash-matched snapshot manifest.
- Latest SHA-256 `11dc277993672a01993dcc8a3de324c51d37c958a46930f556ddc48288724868`.
- A second save was detected before publication. Whole-workbook structured comparison against the initial 21:12:40 snapshot (`818a13b65414431519fdb8b1f149898c55963eb5ba62a267df48d149e77f9fb4`) found **zero changed cells** across all 27 sheets: literal/formula content, cached values, number formats and comments match exactly. Sheet order, visibility, dimensions and merged ranges also match. The numerical conclusions and presentation captures remain valid; source provenance was updated to the latest save.
- Read-only snapshot confirmed against two matching reads of the source. No workbook edits or recalculation. Saved formulas and cached results were extracted from all 27 sheets, including the hidden personnel sheet and working/archive sheets.
- Financial dependencies reviewed across Input, Dashboard, Properties, Property Detail, Portfolio Analysis, Income Statement, Statement of Cash Flows, Balance Sheet, Investor Return, Sources & Uses, ServCo and personnel, Owner Benefits, the monthly/IRR/seasonality engines, acquisition criteria and accompanying narrative/notes.
- Current workbook cash-flow assumptions govern numerical projections. Earlier direct user decisions still govern matters the workbook does not resolve, including approved acquisition status and cancellation terms.

## Principal changes

| Measure | Previous Model 10 | Latest Pro Forma | Latest reference |
|---|---:|---:|---|
| Investor monthly XIRR | 14.6162% | 14.3491% | Investor Return C22 |
| MOIC on called capital | 1.40343× | 1.39574× | Investor Return C21 |
| Capital called | $6,988,000.54 | $7,000,000.00 | Investor Return C16 |
| Undrawn commitment | $11,999.46 | $0.00 | Sources & Uses C23 |
| Gross distributions before carry | $10,511,962.60 | $10,462,695.13 | Investor Return C17 |
| Carry | $704,792.41 | $692,539.03 | Negative Investor Return C18 |
| Net distributions | $9,807,170.19 | $9,770,156.10 | Investor Return C19 |
| Investor profit after carry | $2,819,169.65 | $2,770,156.10 | Investor Return C20 |
| Net income before carry | $3,523,962.06 | $3,462,695.13 | Sum Income Statement C155:F155 |
| Fund-life rental revenue | $485,910.17 | $414,681.81 | Sum Income Statement C7:F7 |
| Annual owner-use pool, all five homes | 365 nights | 547.5 nights | Owner Benefits C6 |
| Annual owner nights per $100,000 | 5.2143 | 7.8214 | Owner Benefits C18 |
| Owner-use revenue forgone and housekeeping | $152,885.29 | $229,327.93 | Owner Benefits C45 |

Investor-facing precision is 14.3% and 1.40×. Do not use the annual approximation of 14.5154% or the intermediate after-carry deal return of 15.0144% as the investor headline. The deal bridge is 22.3834% before tax, 19.7907% after gains tax, 17.9964% after fund overheads, and 14.3491% for final investor flows.

The $7M raise, $2.1M committed, $4.9M remaining, $10,000 unit price, five selected properties, six-month works, $6,571,966.02 property basis, $11,376,910.99 gross exits, no modeled debt and Year 4 payback remain unchanged. There are twelve modeled capital payments in Year 1, from October 2026 through September 2027. No later capital calls are modeled. Investor distributions start in Year 3: $5,111,519.49 in Year 3 and $4,658,636.61 in Year 4. The final monthly exit is April 2030, within the October 2029–September 2030 final statement year.

## Reserve and cash

The full commitment is now called. Year 1 ending cash is **$368,604.01**, against a **$399,474.79** reserve target. The **$30,870.77 shortfall** is explicitly saved in Sources & Uses C24. The target comprises $281,888.51 future shortfalls, $24,310.55 operating buffer and $93,275.72 rental-underperformance cushion (Statement of Cash Flows C72:C74).

Do not describe the reserve target as fully funded or claim remaining undrawn headroom. The Sources & Uses C7 amount of $177,787.28 is a presentation residual assigned to rental income and retained proceeds, not a new capital commitment or outside financing. Total displayed uses are $7,177,787.28. Annual cash remains positive through Year 3 and ends at zero; this is an annual reconciliation, not a separate validation of monthly liquidity under every stress case.

## Statements and property operations

| USD, rounded | Year 1 | Year 2 | Year 3 | Year 4 | Total |
|---|---:|---:|---:|---:|---:|
| Rental revenue | 55,223 | 198,079 | 135,332 | 26,047 | 414,682 |
| Total revenue | 55,223 | 198,079 | 5,681,841 | 5,856,449 | 11,791,593 |
| EBITDA | (151,124) | (92,389) | 2,053,933 | 2,220,884 | 4,031,304 |
| Net income before carry | (151,124) | (92,389) | 1,773,225 | 1,932,983 | 3,462,695 |
| Result after carry | (151,124) | (92,389) | 1,773,225 | 1,240,444 | 2,770,156 |
| Ending cash | 368,604 | 184,521 | 53,225 | 0 | 0 |

The website retains all three statements, blank numeric zero cells, parenthesized negatives and margin rows directly below key income measures. Total margins use aggregate income divided by aggregate revenue, not an average of annual margins. Carry remains a separate investor allocation/financing outflow, not an operating expense. Whole-dollar totals may differ from the sum of displayed rounded figures.

| Property | Stabilized annual NOI | Stabilized annual rental revenue | Rental months |
|---|---:|---:|---:|
| Aires de Campestre | $2,128.78 | $38,215.51 | 22 |
| Fontanar 201 | $102.20 | $38,215.51 | 24 |
| San Lucas 101 | $8,784.27 | $35,384.73 | 19 |
| Casa Montana | $3,867.74 | $46,708.25 | 29 |
| Casa Monte Sereno | ($3,991.22) | $38,636.51 | 26 |

References: Properties X6:Y10, and rental months U minus T. In particular, Monte Sereno has negative stabilized annual NOI. Do not retain prior positive-NOI copy or replace this result with the different trailing-year-at-exit metric.

## Member benefits and unresolved terms

- Input C194 raises the owner-use share from 20% to 30%: 109.5 annual nights per home, 547.5 across all five. At full subscription and all homes in service, each $100,000 receives 7.8214 modeled annual nights; each $1M receives 78.2143. The pool scales with homes in service and is shared pro rata. The workbook's selected-property count does not mean those homes are already open.
- The fund bears $213,685.07 rent forgone plus $15,642.86 owner housekeeping over its life. These costs already reduce base-case returns. Luxury/chef/concierge services are billed separately at cost, with no fund-paid luxury amount modeled (Input C195).
- New member terms recorded in Input are 33% off other Lola & Ber properties (C196), 25% off member-booked paid friends/family stays (C197), and a collective 3% share of future-fund carry (C200), allocated pro rata. They are separate from collective brand equity. No friends/family booking volume enters the rental forecast.
- The future-fund illustration uses an unraised $100M fund, 15% gross IRR, five-year hold, seven-year wait to close and 15% discount rate. The hold and discount inputs are explicitly unconfirmed. Its $86,687.76 future amount / $16,202.56 present value per $1M are arithmetically reproducible but are **excluded from investor content**. No future fund or carry is guaranteed or included in the base-case XIRR.
- The user selected Pacaso's cancellation policy on 9 October, superseding the previous 30-day approval and workbook's 60-day draft: cancel as soon as plans change, with no fixed notice deadline. For an uncancelled no-show, management must receive notice at least 48 hours before scheduled departure or cleaning fees apply. The referenced [scheduling policy](https://www.pacaso.com/scheduling) and [FAQ](https://www.pacaso.com/faq/scheduling) were checked on 9 October. Only cancellation and no-show policy were adopted, not Pacaso's ownership shares, app functionality or other stay quotas.
- The precise peak-use cap remains unresolved: the workbook describes a collective 25% share of annual owner nights, while prior presentation wording described a quarter of each home's peak nights per member. Public copy states that peak-season allocation rules apply and leaves the exact cap to membership terms. The 25% financial-model seasonality assumption remains unchanged.

## Workbook inconsistencies excluded from publication

1. The Buy Box D28 now says **Below minimum**: 19.7907% after-tax deal XIRR is below the workbook's 20% deal-level screen. The approved website threshold of 12% is a different, net-investor measure; the current 14.3491% projection remains above it. Do not say every criterion passes or conflate the return bases.
2. Portfolio Analysis I8:I11 and K8:K11 are pasted sensitivity outputs from September 25. Only the 30% base column is current. The Dashboard's non-base investor values are scaled approximations, not independent full-fund sweeps; keep them off investor pages.
3. Business Description C23/C65 claims no FX exposure. COP purchases, works and operating inputs are converted at a fixed 3,090 COP/USD, and zero depreciation is an assumption. Dollar presentation does not establish absence of currency risk.
4. Sources & Uses B23 still says the cap is not binding, despite zero undrawn capital. Dashboard/Business Description prose also uses “once” or says the reserve covers every expense. The dated payment schedule and actual reserve shortfall govern.
5. Properties H6/H7 retains signed/September-closing language for Aires and Fontanar. The current investor status remains the separately approved Closed 3Q26; do not regress it from stale workbook prose.
6. Owner Benefits B107 still mentions a 365-night pool. Its cost-per-night shortcut in C46 divides by the full portfolio times four years, ignoring phased operation and exits. Neither text is used as an investor entitlement or actual cost metric.
7. Some working-sheet labels retain obsolete property counts, 24-month-for-every-property descriptions, per-m² rent units or old references. Model property holds are 25–35 months; current rent inputs are nightly prices. The numeric live references take precedence over these labels.

No legal/tax conclusion was independently re-underwritten. The model's Colombian tax treatment and US personal-use discussion remain assumptions/qualifications for counsel, not promises on the member page.

## Verification and implementation

- 20,845 formula caches inspected across 27 sheets; no cached Excel errors, missing numeric caches, formula `#REF!` tokens or external workbook links. The 320 empty string formula results are intentional.
- 163 independent checks passed across statement subtotals, annual cash continuity, cash/BS ties, carry, owner-use arithmetic, reserve composition and return calculations. Independent monthly investor XIRR is 14.3491139155%, within 0.000000004 of the saved fraction. The final BS residual of approximately negative $0.00000000186 is preserved and displays blank.
- `refresh-financial-model.py` validates the reviewed layout and explicitly migrates Dashboard references from C14/C15 to C16/C17 and sensitivity rows 77/79 to 79/81. It refreshes source data and statement numeric cells without modifying the workbook. Optional `--source-metadata` reads a hash-matched snapshot manifest to distinguish original and snapshot modification times; subsequent refreshes of the same hash preserve that original-source provenance. Booking provenance comes from the current approved investor terms. A repeated run produces byte-identical generated records/template.
- `verify-model-source.py` passes 156 financial source cell/formula comparisons and 249 model metrics, plus monthly flow totals, property operating values, reserve shortfall and approved closed-status preservation.
- `verify-financials.mjs --source <snapshot> --source-only` passes source-hash, arithmetic, margins, blank-zero and source-template checks. Full verification also covers built English, Spanish and French pages; run it after the combined site build.
- No publication or deployment is implied by these source checks.
