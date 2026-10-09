# Member benefits and latest model — 9 October 2026

## Scope

The user supplied the latest Pro Forma workbook, requested a separate page detailing member benefits, and asked that site numbers be updated after a full review. The user subsequently selected Pacaso's cancellation approach. The existing commit, push and publication instructions apply to the canonical site. The original workbook is unchanged.

`member-benefits.html`, `/es/member-benefits.html` and `/fr/member-benefits.html` are public, noindex resources linked under Resources, outside the main presentation. The page includes a commitment/home-count calculator, full-subscription tier examples, phased availability, fund-paid housing/turnover, optional services at cost, 33% and 25% discounts, collective 3% brand equity, conditional collective 3% future carry and Dulcinea II priority rights. It states that membership documents govern rights and booking availability. The calculator does not claim current availability or guaranteed whole-night entitlements.

The website and presentation now show 14.3% investor IRR, 547.5 pooled annual nights, 109.5 per home and approximately 78 per $1M at full subscription and full operation. The 1.40× capital multiple and four-year projected term remain. All three financial statements and supporting source records were refreshed from saved workbook formulas and values. Formal statements remain password protected. No source workbook, internal audit or PowerPoint is added to the site's downloads.

## Source and decisions

- Latest saved workbook SHA-256: `11dc277993672a01993dcc8a3de324c51d37c958a46930f556ddc48288724868`, saved 2026-10-09 21:21:53.1111764 UTC.
- Initial audited save: `818a13b65414431519fdb8b1f149898c55963eb5ba62a267df48d149e77f9fb4`. A second source check caught a new save before publication. Every cell value, formula, cache, comment and number format across all 27 sheets was compared and found unchanged.
- [Pacaso scheduling](https://www.pacaso.com/scheduling) and [scheduling FAQ](https://www.pacaso.com/faq/scheduling), checked 9 October: cancellation as soon as possible; no fixed 30/60-day notice in the published guidance. The published no-show rule requires notice 48 hours before scheduled departure or cleaning fees are charged. Dulcinea's wording uses its manager, without asserting Pacaso app functionality.
- No Pacaso ownership percentages, stay quotas or guaranteed holidays are adopted. The incompatible exact peak cap in the workbook/prior deck is not presented as a settled entitlement; applicable membership rules govern. The speculative future-carry valuation with unconfirmed assumptions is omitted.
- Financial qualifications include the $30,870.77 reserve target shortfall, the 19.7907% deal return below its 20% screen, currency exposure and negative Monte Sereno operating NOI. See [full model reconciliation](model-latest-reconciliation.md).

## Verification

- 27-sheet review; 20,845 formula caches; 163 independent financial checks; 156 source-cell comparisons and 249 source metrics. No cached errors, broken references or external links.
- Portable and production builds pass. The release gate covers 18 localized HTML pages, 91 assets, 62 media aliases, 16 distinct videos and 51 inline scripts. Public source-file allowlists and financial access boundaries remain enforced.
- 62 server tests pass, including member resource aliases in every language, financial authentication boundaries and private-source denials.
- Member calculator checked in the browser for $1M/five homes =78.2, $250K/three homes =11.7 and $7M/one home =109.5; $105K and zero are rejected. French and Spanish display localized decimals. Mobile width390 has no document overflow; the resource row can scroll independently.
- All 63 online slide captures show loaded images and no text outside the 1440×810 canvas. Three PDFs have 21 pages, 21 bookmarks, the correct language, matching captured imagery and no localhost links. All pages rendered with Poppler and contact sheets were reviewed; changed financial/benefits/booking pages were inspected separately. Local PDF download bytes match the final files.
- Presentation PDF source fingerprint: `ca884a92de3f6e10b6e5a97f5ece7eb207e05d3a5c5e2c8a880c9bf50a1f5773` across 86 source files.
- Source records and this audit are not deployed public assets. Saved formula results were reviewed without recalculating or editing Excel.

## Published website and PDFs

Published application `b809bbe457c362570f6e360b4738c06bf0e0d68d`, Worker version `3440a3ab-83ad-43d5-acd0-5fed0464efce`, at `https://invest.dulcineainvestments.org/`. The initial member-page release was `016eabd`; the follow-up puts the reserve shortfall and distinct return-screening bases visibly beside the cash-flow statement in all three languages. The follow-up changes no presentation content or PDF fingerprint.

Live verification passes: all 15 public pages and three PDFs match the approved build; 12 financial aliases remain gated; all three login pages use the appropriate language; six private-source probes return 404; floorplan/favicon and video-range checks pass; four approved financial source hashes remain unchanged. The initial English member-route 404 cleared during normal propagation before the successful rerun. Positive financial sign-in was not repeated; the protected page content was checked locally and all three new assets were acknowledged by the deployment service.

The Resources link opens the new member page on production. Browser proof is saved privately in `preservation/2026-10-09/model-latest/published-member-benefits.png`; the financial-note layout was reviewed in French beside the cash-flow table. The original workbook was neither changed nor published by this work.

## Editable PowerPoint

`Dulcinea - Investor Presentation 037 - Latest Model Members.pptx` is saved in the parent workspace's `output/pptx-037-member-benefits/`. SHA-256: `19da4b8b4e97b84e5418ac86bd3dbd2baafeb3bdcdc42266ef5339890516b73e`; 18,226,557 bytes. Version 036 is unchanged.

Updated member benefits, pooled nights, cancellation, operating figures, P&L and current return projections. Removed stale sensitivity outputs, unsupported all-criteria-cleared claims and deal-by-deal carry wording. The two charts remain native and editable with current-data embedded workbooks. The illustration-only caption is preserved.

All 24 slides were rendered and visually reviewed in Microsoft PowerPoint. Verification passes for 101 text assertions, all 65 P&L cells and all 27 chart values. Package and layout checks have zero findings; a pre-existing slide-2 title-boundary warning remains, with the native render confirming the title is visible. Root review separately inspected the final member-benefits, deal-economics/chart and P&L renders. Evidence remains private under `preservation/2026-10-09/pptx-037-member-benefits/`.
