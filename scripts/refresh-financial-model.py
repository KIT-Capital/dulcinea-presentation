"""Refresh internal financial records from the reviewed Pro Forma workbook layout.

Reads a private workbook without recalculating, editing or copying it. The source
path is supplied at runtime and is never embedded in the hosted investor pages.
Usage: python scripts/refresh-financial-model.py --source /private/model.xlsx
The Model 10 -> Pro Forma Dashboard migration is explicit; other layouts fail validation.
"""
import argparse
from datetime import date, datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
import hashlib
import json
import math
from pathlib import Path
import re
import warnings
import xml.etree.ElementTree as ET
import zipfile

import openpyxl

warnings.filterwarnings('ignore', message='Conditional Formatting extension is not supported and will be removed')
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--source-metadata', type=Path, help='Optional read-only snapshot manifest with sha256 and original sourceModifiedUtc/modifiedUtc')
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
digest = hashlib.sha256(args.source.read_bytes()).hexdigest()
book = openpyxl.load_workbook(args.source, data_only=True, read_only=True)
formula_book = openpyxl.load_workbook(args.source, data_only=False, read_only=True)
values = {s.title: {c.coordinate: c.value for row in s for c in row if c.value is not None} for s in book}
formulas = {s.title: {c.coordinate: getattr(c.value, 'text', c.value) for row in s for c in row if c.data_type == 'f'} for s in formula_book}
assert values['Input']['B40'].startswith('Fund-life reserve funded from the raise'), 'Unexpected reserve input layout'
assert values['Input']['B43'].startswith('Capital committed to date'), 'Unexpected commitment cell'
assert values['Input']['B47'].startswith('Carry to Managing Partner'), 'Unexpected carry cell'
assert values['Input']['B176'].startswith('Owner nights per property'), 'Missing owner-use inputs'
assert values['Input']['B194'] == "Owner-use share of each property's year", 'Expected reviewed Pro Forma owner-use layout'
assert values['Dashboard']['B16'].startswith('All-in investment'), 'Unexpected Dashboard all-in row'
assert values['Dashboard']['B17'].startswith('Projected gross exit'), 'Unexpected Dashboard exit row'
assert values['Dashboard']['B79'] == 'Scenario' and values['Dashboard']['B81'] == 'Equity Investor IRR', 'Unexpected Dashboard sensitivity rows'
assert values['Input']['C58'] == 4, 'Statement layout requires four model years'
ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
raw_values = {}
formula_count = empty_strings = 0
with zipfile.ZipFile(args.source) as archive:
    assert not any(n.startswith('xl/externalLinks/') for n in archive.namelist()), 'External links require review'
    workbook_xml = ET.fromstring(archive.read('xl/workbook.xml'))
    rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))}
    for sheet in workbook_xml.findall('m:sheets/m:sheet', ns):
        target = rels[sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')]
        part = target.lstrip('/') if target.startswith('/') else 'xl/' + target
        cells = {}
        for cell in ET.fromstring(archive.read(part)).findall('.//m:sheetData/m:row/m:c', ns):
            assert cell.get('t') != 'e', f'Cached formula error {sheet.get("name")}!{cell.get("r")}'
            value = cell.find('m:v', ns)
            text = None if value is None else value.text
            cells[cell.get('r')] = text
            if cell.find('m:f', ns) is not None:
                formula_count += 1
                if text is None:
                    assert cell.get('t') == 'str', f'Missing numeric cache {part}:{cell.get("r")}'
                    empty_strings += 1
        raw_values[sheet.get('name')] = cells
    calc = workbook_xml.find('m:calcPr', ns)
    calc_properties = {} if calc is None else calc.attrib

def actual(ref):
    single = re.fullmatch(r"(-?)'([^']+)'!([A-Z]+[0-9]+)", ref)
    total = re.fullmatch(r"SUM\('([^']+)'!([A-Z]+)([0-9]+):([A-Z]+)([0-9]+)\)", ref)
    if single:
        result = values[single[2]].get(single[3])
        assert result is not None, ref
        if isinstance(result, (datetime, date)):
            result = result.isoformat()
        return -result if single[1] else result
    assert total, f'Unsupported source reference: {ref}'
    return sum(values[total[1]][f'{openpyxl.utils.get_column_letter(c)}{r}']
               for r in range(int(total[3]), int(total[5]) + 1)
               for c in range(openpyxl.utils.column_index_from_string(total[2]), openpyxl.utils.column_index_from_string(total[4]) + 1))

def sourced(sheet, cell):
    value = values[sheet].get(cell)
    assert isinstance(value, (int, float)) and math.isfinite(value), f'Missing financial value {sheet}!{cell}'
    return {'cell': f"'{sheet}'!{cell}", 'cachedValue': value,
            'cachedValueText': raw_values[sheet].get(cell), 'formula': formulas[sheet].get(cell)}

def formatted(value, unit):
    normalized = Decimal(format(abs(value), '.15g'))
    rounded = (normalized * (100 if unit == 'percent' else 1)).quantize(Decimal('.1') if unit == 'percent' else Decimal('1'), rounding=ROUND_HALF_UP)
    if rounded == 0:
        return ''
    text = f'{rounded:,.1f}%' if unit == 'percent' else f'{rounded:,.0f}'
    return f'({text})' if value < 0 else text

def close(a, b):
    assert abs(a-b) < 1e-8, f'Reconciliation failed: {a} != {b}'

def xirr(flows):
    first = min(t for t, amount in flows)
    lower, upper = 0, 1
    for _ in range(100):
        middle = (lower + upper) / 2
        npv = sum(amount / (1 + middle) ** ((t-first).days/365) for t, amount in flows)
        if npv > 0:
            lower = middle
        else:
            upper = middle
    return (lower + upper)/2

financials = json.loads((root/'content/financials.json').read_text(encoding='utf8'))
summary = json.loads((root/'content/model-summary.json').read_text(encoding='utf8'))
terms = json.loads((root/'content/investor-terms.json').read_text(encoding='utf8'))
old_source = summary['provenance']['source']
assert old_source in ('Dulcinea Model 09.xlsx', 'Dulcinea Model 10.xlsx', 'Dulcinea Pro Forma Model.xlsx'), 'Review migration from this source before refresh'
prior_digest = summary['provenance']['sha256'] if digest != summary['provenance']['sha256'] else summary['provenance'].get('previousSourceSha256')
snapshot_modified = datetime.fromtimestamp(args.source.stat().st_mtime, timezone.utc).isoformat()
modified = snapshot_modified
modification_basis = 'Read file modification time; may be a snapshot rather than original source'
if args.source_metadata:
    metadata = json.loads(args.source_metadata.read_text(encoding='utf8'))
    assert metadata['sha256'].lower() == digest, 'Snapshot metadata hash differs from workbook'
    modified = metadata.get('sourceModifiedUtc', metadata.get('modifiedUtc'))
    assert isinstance(modified, str), 'Snapshot metadata is missing original source modification time'
    datetime.fromisoformat(modified.replace('Z', '+00:00'))
    modification_basis = 'Original source modification time from hash-matched snapshot manifest'
elif digest == summary['provenance']['sha256'] and summary['provenance'].get('modificationTimeBasis') == 'Original source modification time from hash-matched snapshot manifest':
    modified = summary['provenance']['modifiedUtc']
    modification_basis = summary['provenance']['modificationTimeBasis']
summary['provenance'].update(source=args.source.name, sha256=digest, modifiedUtc=modified,
                            workbookModifiedMetadata=book.properties.modified.isoformat() + 'Z', previousSourceSha256=prior_digest,
                            snapshotModifiedUtc=snapshot_modified, modificationTimeBasis=modification_basis)
financials['source'].update(file=args.source.name, sha256=digest, modifiedUtc=modified, previousSourceSha256=prior_digest,
                           snapshotModifiedUtc=snapshot_modified, modificationTimeBasis=modification_basis)
financials['source']['priorDeck']['note'] = 'Historical comparison only; the current workbook saved values govern the statements.'

def refresh_summary(node):
    if isinstance(node, list):
        for item in node:
            refresh_summary(item)
    elif isinstance(node, dict):
        if 'value' in node and 'ref' in node:
            if old_source == 'Dulcinea Model 09.xlsx':
                node['ref'] = re.sub(r"('Input'![A-Z]+)(\d+)", lambda m: m[1] + str(int(m[2]) + (int(m[2]) >= 40)), node['ref'])
                node['ref'] = re.sub(r"('Dashboard'![A-Z]+)(76|78)$", lambda m: m[1] + str(int(m[2])+1), node['ref'])
            if old_source in ('Dulcinea Model 09.xlsx', 'Dulcinea Model 10.xlsx'):
                node['ref'] = re.sub(r"('Dashboard'![A-Z]+)(14|15|77|79)$", lambda m: m[1] + str(int(m[2])+2), node['ref'])
            refreshed = actual(node['ref'])
            if isinstance(node['value'], (int, float)):
                assert isinstance(refreshed, (int, float)) and math.isfinite(refreshed), f"Numeric source layout changed: {node['ref']}"
            node['value'] = refreshed
        for child in node.values():
            refresh_summary(child)
refresh_summary(summary)
summary['activeScenario']['description'] = 'Five selected properties; USD 7M commitment; 30% entry discount; 60% booked occupancy after owner-use and maintenance deductions; flat COP/USD 3090; six-month works for all five; 8.5% El Poblado and 7.15% El Retiro annual appreciation. The full commitment is paid in installments during Year 1; no later calls. Owner use is 30% of each home’s year. The Year 1 cash reserve is below its target; see sourcesAndUses.'
summary['activeScenario']['capitalTiming'] = 'Monthly acquisition/spend-weighted payments during Year 1, as saved in the monthly XIRR engine. Retains the user-confirmed installment convention; no calls after Year 1.'
summary['activeScenario']['fundLifeReserveEnabled'] = {'value': actual("'Input'!C40"), 'ref': "'Input'!C40"}
summary['activeScenario']['ownerUseEnabled'] = {'value': actual("'Input'!C177"), 'ref': "'Input'!C177"}
summary['monthlyInvestorCashFlows'] = []
flows = []
for row in range(6,126):
    amount = values['_IRR Engine'][f'G{row}']
    if not amount:
        continue
    dt = values['_IRR Engine'][f'B{row}']
    flows.append((dt, amount))
    summary['monthlyInvestorCashFlows'].append({'month': values['_IRR Engine'][f'A{row}'], 'date': dt.isoformat(),
        'calledUsd': -values['_IRR Engine'][f'E{row}'], 'distributedUsd': values['_IRR Engine'][f'F{row}'], 'netUsd': amount,
        'ref': f"'_IRR Engine'!B{row}:G{row}"})
for prop in summary['properties']:
    if old_source == 'Dulcinea Model 09.xlsx':
        prop['assumptionRow'] = re.sub(r"(\d+)$", lambda m: str(int(m[1])+1), prop['assumptionRow'])
    row = int(re.search(r'(\d+)$', prop['sourceRow'])[1])
    all_in = values['Properties'][f'P{row}']
    comp = all_in / (1-prop['entryDiscount']['value'])
    prop['entryValueBridge'].update(allInUsd=all_in, improvedComparableValueUsd=comp,
        boughtBelowCompsUsd=comp-all_in, appreciationUsd=values['Properties'][f'W{row}']-comp)
    start = values['Input']['C7']
    for key, col in [('purchaseCalendarMonth', 'Q'), ('saleCalendarMonth', 'U')]:
        month_index = start.year*12+start.month-1+values['Properties'][f'{col}{row}']-1
        prop[key] = f'{month_index//12:04d}-{month_index%12+1:02d}'
bridge = summary['returnBridge']
bridge['taxDragPercentagePoints'] = (bridge['dealPreTaxXirr']['value']-bridge['afterGainsTaxXirr']['value'])*100
bridge['feesCarryAndFundCashFlowTimingDragPercentagePoints'] = (bridge['afterGainsTaxXirr']['value']-bridge['fundInvestorXirr']['value'])*100
bridge['note'] = (f"Saved monthly investor flows give {bridge['fundInvestorXirr']['value']:.4%}, rounded to {bridge['fundInvestorXirr']['value']:.1%}. "
    f"Condensed deal bridge: {bridge['dealPreTaxXirr']['value']:.1%} before tax, {bridge['afterGainsTaxXirr']['value']:.1%} after gains tax, "
    f"{bridge['fundInvestorXirr']['value']:.1%} to investors. Capital is contributed through Year 1.")
summary['entryDiscountSensitivity']['presentationChoice'] = 'Only the live 30% base case is current. The pasted 25% and 35% sensitivity columns predate owner use and the fund-life reserve; omit their returns from investor pages until refreshed.'
for scenario in summary['entryDiscountSensitivity']['scenarios']:
    scenario['currentForInvestorPresentation'] = scenario['discount']['value'] == .3
summary['kickers']['note'] = 'Brand equity and future-fund carry are separate collective interests allocated pro rata. Neither enters base-case investor returns. The workbook separately illustrates future carry using unconfirmed assumptions; that valuation is excluded from investor content. Owner-use revenue and housekeeping costs are included in base-case financial returns.'
for key, sheet, cell in [('yearOneEndingCashUsd', 'Statement of Cash Flows', 'C54'), ('reserveShortfallUsd', 'Sources & Uses', 'C24')]:
    ref = f"'{sheet}'!{cell}"
    summary['sourcesAndUses'][key] = {'value': actual(ref), 'ref': ref}
summary['sourcesAndUses']['caution'] = ('C7 is a presentation residual assigned to rental income and retained proceeds, not called capital or a financing commitment. '
    f"The full ${summary['headline']['capitalCalledUsd']['value']:,.2f} commitment is called in Year 1. "
    f"Year 1 ending cash of ${summary['sourcesAndUses']['yearOneEndingCashUsd']['value']:,.2f} is "
    f"${summary['sourcesAndUses']['reserveShortfallUsd']['value']:,.2f} below the ${summary['sourcesAndUses']['reserveTargetUsd']['value']:,.2f} reserve target. "
    'No later contributions are modeled. Do not describe the target as fully funded or imply undrawn headroom.')
summary['ownerBenefits'] = {}
for name, sheet, cell in [('annualNightsFullPortfolio','Owner Benefits','C6'),('annualNightsPerHome','Owner Benefits','C13'),
                         ('annualNightsPerUnit','Owner Benefits','C17'),('annualNightsPer100k','Owner Benefits','C18'),
                         ('rentRevenueForgoneUsd','Owner Benefits','C43'),('housekeepingCostUsd','Owner Benefits','C44'),
                         ('totalOwnerUseCostUsd','Owner Benefits','C45'),('ownerNightUtilization','Input','C182'),
                         ('calendarGapFraction','Input','C183'),('maintenanceNightsPerHome','Input','C185'),
                         ('reserveRentalStress','Input','C189'),('reserveRentalCushionUsd','Input','C191')]:
    ref = f"'{sheet}'!{cell}"
    summary['ownerBenefits'][name] = {'value': actual(ref), 'ref': ref}
for name, cell in [('ownerUseShare', 'C194'), ('fundLuxuryCostPerOwnerNightUsd', 'C195'), ('memberDiscountOtherProperties', 'C196'), ('friendsAndFamilyDiscount', 'C197')]:
    ref = f"'Input'!{cell}"
    summary['ownerBenefits'][name] = {'value': actual(ref), 'ref': ref}
summary['kickers']['futureFundCarryShare'] = {'value': actual("'Input'!C200"), 'ref': "'Input'!C200"}
summary['ownerBenefits']['note'] = ('The full-portfolio pool phases in with homes open for rental and is shared pro rata, not an entitlement per Member. '
    'The workbook’s current-portfolio count means selected homes, not homes already in service. Booking terms are separate from financial assumptions. '
    + terms['ownerUse']['bookingRulesApproval'])
summary['reconciliation'] = [
    {'topic': 'Return and capital timing', 'decision': 'Latest Pro Forma saved values supersede Model 10 returns. Preserve the monthly Year 1 contribution timing; no calls after Year 1.', 'refs': ["'Investor Return'!C7:F7", "'_IRR Engine'!E6:G17", "'Investor Return'!C22"]},
    {'topic': 'Statement refresh', 'decision': 'Saved Pro Forma income, balance sheet and cash flows replace earlier figures. Carry remains an investor allocation and financing cash outflow, not an operating expense.', 'refs': ["'Income Statement'!C155:F155", "'Investor Return'!C20"]},
    {'topic': 'Owner benefits', 'decision': 'The owner pool increases with the 30% owner-use assumption. Foregone rent and housekeeping already reduce base-case returns. Luxury services are billed separately to members; no fund cost is modeled. Booking policy follows the explicit user-approved investor-terms record, which supersedes workbook draft prose.', 'refs': ["'Owner Benefits'!C43:C45", "'Input'!C194:C197", "'Owner Benefits'!C81"]},
    {'topic': 'Reserve funding', 'decision': 'The full capital commitment is called. Year 1 ending cash is below the reserve target; retain both figures and the shortfall rather than claim a fully funded target.', 'refs': ["'Statement of Cash Flows'!C54:C56", "'Sources & Uses'!C23:C24"]},
    {'topic': 'Montana renovation', 'decision': 'User confirmed six-month Model 10 works on 2026-10-02, replacing the deck nine-month statement.', 'refs': ["'Properties'!R9"]},
    {'topic': 'Acquisition status', 'decision': 'Model still labels Aires and Fontanar signed; latest user-supplied deck states closed Sep 2026. Preserve model values in this source record; investor-facing status comes from the newer deck.'},
    {'topic': 'Minimum return', 'decision': 'Workbook retains a 20% deal-level after-tax criterion; deck states 12% net investor criterion. These are different return bases and must remain distinct.', 'refs': ["'The Buy Box'!C37", "'The Buy Box'!C28"]},
    {'topic': 'Sensitivity', 'decision': 'Omit stale pasted 25%/35% return scenarios until their full-fund sweep is refreshed. Only the 30% column is live.', 'refs': ["'Portfolio Analysis'!I7:K12"]}
]
independent = xirr(flows)
close(independent, summary['headline']['monthlyXirr']['value'])
summary['quality'] = {'cachedExcelErrors': [], 'formulaCellCount': formula_count,
    'emptyFormulaCachesByXmlType': {'str': empty_strings}, 'openpyxlNoneFormulaResults': empty_strings,
    'calcProperties': calc_properties, 'externalLinkParts': 0, 'hiddenSheets': [s.title for s in book if s.sheet_state != 'visible'],
    'recalculated': False, 'independentXirrFromCachedMonthlyFlows': independent,
    'headlineXirrDifference': independent-summary['headline']['monthlyXirr']['value'],
    'notes': ['Saved caches are a snapshot, not a new workbook recalculation.',
              'No cached Excel errors, missing numeric formula caches or external workbook links.',
              'Blank string formula caches are not missing numeric results.',
              'Internal checks reconcile annual statements, carry and monthly investor flows; transaction outcomes remain forecasts.']}

income_lookup = {}
for section in ('profitAndLoss','afterCarry','cashFlows','balanceSheet'):
    rows = financials[section]['rows']
    for row in rows:
        if 'id' not in row or row['sourceRange'].startswith('Derived:'):
            continue
        for cell in row['sourceCells']:
            match = re.fullmatch(r"'([^']+)'!([A-Z]+[0-9]+)", cell['cell'])
            cell.update(sourced(match[1],match[2]))
        annual = [c['cachedValue'] * row.get('sourceSignMultiplier',1) for c in row['sourceCells']]
        method = row['totalMethod']
        row['values'] = annual if method == 'none' else annual + [annual[0] if method == 'opening' else annual[-1] if method == 'closing' else sum(annual)]
        if row['unit'] == 'percent':
            numerator = {'contributionMarginPercent':'contributionMargin','ebitdaMargin':'ebitda','netIncomeMargin':'netIncome'}[row['id']]
            row['values'][-1] = income_lookup[numerator]['values'][-1] / income_lookup['totalRevenue']['values'][-1]
        if section == 'profitAndLoss':
            income_lookup[row['id']] = row
    if section == 'profitAndLoss':
        financials[section]['periodDates'] = [values['Investor Return'][f'{c}5'] for c in 'CDEF']
carry_lookup = {r['id']:r for r in financials['afterCarry']['rows']}
result = carry_lookup['resultAfterCarry']
result['values'] = [income_lookup['netIncome']['values'][i] + carry_lookup['carry']['values'][i] for i in range(5)]
result['sourceCells'] = income_lookup['netIncome']['sourceCells'] + carry_lookup['carry']['sourceCells']
margin = carry_lookup['resultAfterCarryMargin']
margin['values'] = [result['values'][i]/income_lookup['totalRevenue']['values'][i] for i in range(5)]
margin['sourceCells'] = result['sourceCells'] + income_lookup['totalRevenue']['sourceCells']
for section in ('profitAndLoss','afterCarry','cashFlows','balanceSheet'):
    for row in financials[section]['rows']:
        if 'id' in row:
            row['displayValues'] = [formatted(v,row['unit']) for v in row['values']]
cash = {r['id']:r['values'] for r in financials['cashFlows']['rows'] if 'id' in r}
balance = {r['id']:r['values'] for r in financials['balanceSheet']['rows']}
for i in range(4):
    inc = {key:record['values'][i] for key,record in income_lookup.items()}
    close(inc['rentalIncome']+inc['propertySales'],inc['totalRevenue'])
    close(inc['totalRevenue']+inc['variableCosts'],inc['contributionMargin'])
    close(inc['contributionMargin']+inc['fixedPropertyCosts']+inc['fundFixedCosts'],inc['ebitda'])
    close(inc['ebitda']+inc['taxes'],inc['netIncome'])
    close(cash['netIncome'][i]+cash['basisAddback'][i],cash['operatingCash'][i])
    close(cash['acquisitions'][i]+cash['works'][i],cash['investingCash'][i])
    close(cash['capitalCalled'][i]+cash['distributions'][i]+cash['carryDistributions'][i],cash['financingCash'][i])
    close(cash['operatingCash'][i]+cash['investingCash'][i]+cash['financingCash'][i],cash['netChange'][i])
    close(cash['openingCash'][i]+cash['netChange'][i],cash['closingCash'][i])
    close(cash['closingCash'][i],balance['cash'][i])
    close(balance['totalAssets'][i]-balance['debt'][i],balance['equity'][i])
    if i:
        close(cash['openingCash'][i],cash['closingCash'][i-1])
for i in range(5):
    for numerator,margin_id in [('ebitda','ebitdaMargin'),('netIncome','netIncomeMargin'),('contributionMargin','contributionMarginPercent')]:
        close(income_lookup[margin_id]['values'][i],income_lookup[numerator]['values'][i]/income_lookup['totalRevenue']['values'][i])
    close(margin['values'][i],result['values'][i]/income_lookup['totalRevenue']['values'][i])
close(cash['openingCash'][-1],cash['openingCash'][0])
close(cash['closingCash'][-1],cash['closingCash'][3])
close(result['values'][-1],summary['headline']['investorProfitUsd']['value'])
close(-cash['distributions'][-1],summary['headline']['netDistributionsUsd']['value'])
close(cash['capitalCalled'][-1],summary['headline']['capitalCalledUsd']['value'])
financials['reconciliation'].update(profitAfterCarryUsd=result['values'][-1],investorDistributionsAfterCarryUsd=summary['headline']['netDistributionsUsd']['value'])

properties = json.loads((root/'content/properties.json').read_text(encoding='utf8'))
property_rows = {'SAN_LUCAS':8, 'AIRES':6, 'FONTANAR':7, 'MONTE_SERENO':10, 'MONTANA':9}
deck_slides = {'SAN_LUCAS':14, 'AIRES':15, 'FONTANAR':16, 'MONTE_SERENO':17, 'MONTANA':18}
def money(value):
    return '$' + (f'{value/1e6:.2f}M' if value >= 1e6 else f'{value/1e3:.0f}K')
for property in properties:
    row = property_rows[property['token']]
    numeric = next(p for p in summary['properties'] if p['sourceRow'] == f"'Properties'!{row}")
    rental_months = values['Properties'][f'U{row}'] - values['Properties'][f'T{row}']
    noi = values['Properties'][f'X{row}']
    noi_amount = f'${abs(noi):,.0f}' if abs(noi) < 1000 else f'${abs(noi)/1000:.1f}K' if abs(noi) < 10000 else f'${abs(noi)/1000:.0f}K'
    noi_text = f'({noi_amount})' if noi < 0 else noi_amount
    works_months = values['Properties'][f'R{row}']
    assert works_months == 6, 'Works duration changed; review the approved six-month scenario'
    property.update(purchase=money(values['Properties'][f'M{row}']), allin=money(values['Properties'][f'P{row}']),
                    works=f'Six months; {money(values["Properties"][f"N{row}"])} budget',
                    rent=f'{rental_months} modeled rental months; approximately {noi_text} stabilized annual property NOI',
                    value=money(values['Properties'][f'W{row}']),
                    uplift=f'{values["Properties"][f"W{row}"]/values["Properties"][f"P{row}"]:.2f}×',
                    rentalMonths=rental_months,
                    stabilizedAnnualNoiUsd=noi,
                    stabilizedAnnualRentalRevenueUsd=values['Properties'][f'Y{row}'])
    size = values['Properties'][f'I{row}']
    property['m2'] = [f'{x/size:,.0f}' for x in (values['Properties'][f'M{row}'], values['Properties'][f'P{row}'], numeric['entryValueBridge']['improvedComparableValueUsd'])]
    property['source'].update(model=args.source.name, sha256=digest, deck='Dulcinea - Investor Presentation 032.pptx',
                              slide=deck_slides[property['token']], status='Latest investor-deck status; model labels retained separately in model-summary.json',
                              operatingCells=f'Properties!T{row}:Y{row}')
    if property['token'] in ('AIRES','FONTANAR'):
        property['status'] = 'Closed 3Q26'
    if property['token'] == 'MONTANA':
        property['sourceNote'] = 'User confirmed six-month Model 10 works on 2026-10-02; supersedes the deck nine-month statement.'

html_path = root/'src/financial-statements.html'
html = html_path.read_text(encoding='utf8')
for section_id, section_names in [('income-statement',('profitAndLoss','afterCarry')),('cash-flow-statement',('cashFlows',)),('balance-sheet',('balanceSheet',))]:
    records = {r['id']:r for name in section_names for r in financials[name]['rows'] if 'id' in r}
    pattern = rf'(<section id="{section_id}".*?</section>)'
    def replace_section(match):
        def replace_row(row_match):
            record = records[row_match[2]]
            cells = ''.join(f'<td data-value="{value}"' + (' aria-label="Zero"' if text == '' else '') + f'>{text}</td>' for value,text in zip(record['values'],record['displayValues']))
            return row_match[1] + row_match[3] + cells + '</tr>'
        return re.sub(r'(<tr\b[^>]*data-id="([^"]+)"[^>]*>)(<th\b.*?</th>)(?:<td\b.*?</td>)+</tr>',replace_row,match[1],flags=re.S)
    html, count = re.subn(pattern,replace_section,html,flags=re.S)
    assert count == 1, f'Missing financial section {section_id}'
book.close()
formula_book.close()
assert hashlib.sha256(args.source.read_bytes()).hexdigest() == digest, 'Workbook changed during refresh'
for relative,data in [('content/financials.json',financials),('content/model-summary.json',summary),('content/properties.json',properties)]:
    (root/relative).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
html_path.write_text(html,encoding='utf8')
print(f'Refreshed reviewed Pro Forma saved values; {formula_count} formula caches checked; XIRR {independent:.10%}; source unchanged.')
