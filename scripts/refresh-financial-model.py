"""Refresh internal financial records and statement cells from saved Model 10 caches.

Reads a private workbook without recalculating, editing or copying it. The source
path is supplied at runtime and is never embedded in the hosted investor pages.
Usage: python scripts/refresh-financial-model.py --source /private/Model10.xlsx
The Model 09 -> 10 Input-row migration is explicit; other layouts fail validation.
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
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
digest = hashlib.sha256(args.source.read_bytes()).hexdigest()
book = openpyxl.load_workbook(args.source, data_only=True, read_only=True)
formula_book = openpyxl.load_workbook(args.source, data_only=False, read_only=True)
values = {s.title: {c.coordinate: c.value for row in s for c in row if c.value is not None} for s in book}
formulas = {s.title: {c.coordinate: getattr(c.value, 'text', c.value) for row in s for c in row if c.data_type == 'f'} for s in formula_book}
assert values['Input']['B40'].startswith('Fund-life reserve funded from the raise'), 'Expected Model 10 input layout'
assert values['Input']['B43'].startswith('Capital committed to date'), 'Unexpected commitment cell'
assert values['Input']['B47'].startswith('Carry to Managing Partner'), 'Unexpected carry cell'
assert values['Input']['B176'].startswith('Owner nights per property'), 'Missing owner-use inputs'
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
old_source = summary['provenance']['source']
assert old_source in ('Dulcinea Model 09.xlsx', 'Dulcinea Model 10.xlsx'), 'Review migration from this source before refresh'
prior_digest = summary['provenance']['sha256'] if digest != summary['provenance']['sha256'] else summary['provenance'].get('previousSourceSha256')
modified = datetime.fromtimestamp(args.source.stat().st_mtime, timezone.utc).isoformat()
summary['provenance'].update(source=args.source.name, sha256=digest, modifiedUtc=modified,
                            workbookModifiedMetadata=book.properties.modified.isoformat() + 'Z', previousSourceSha256=prior_digest)
financials['source'].update(file=args.source.name, sha256=digest, modifiedUtc=modified, previousSourceSha256=prior_digest)
financials['source']['priorDeck'] = {'file': 'Dulcinea - Investor Presentation 032.pptx', 'slides': {'profitAndLoss': 21},
                                   'note': 'PPTX P&L values are stale; workbook saved values govern the statements.'}

def refresh_summary(node):
    if isinstance(node, list):
        for item in node:
            refresh_summary(item)
    elif isinstance(node, dict):
        if 'value' in node and 'ref' in node:
            if old_source == 'Dulcinea Model 09.xlsx':
                node['ref'] = re.sub(r"('Input'![A-Z]+)(\d+)", lambda m: m[1] + str(int(m[2]) + (int(m[2]) >= 40)), node['ref'])
                node['ref'] = re.sub(r"('Dashboard'![A-Z]+)(76|78)$", lambda m: m[1] + str(int(m[2])+1), node['ref'])
            node['value'] = actual(node['ref'])
        for child in node.values():
            refresh_summary(child)
refresh_summary(summary)
summary['activeScenario']['description'] = 'Five selected properties; USD 7M commitment; 30% entry discount; 60% booked occupancy after owner-use and maintenance deductions; flat COP/USD 3090; six-month works for all five; 8.5% El Poblado and 7.15% El Retiro annual appreciation. Capital paid in installments during Year 1, including a fund-life reserve; no later calls.'
summary['activeScenario']['capitalTiming'] = 'Monthly acquisition/spend-weighted payments during Year 1, as saved in the monthly XIRR engine. User confirmed this timing on 2026-10-02; not one upfront capital call.'
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
bridge = summary['returnBridge']
bridge['taxDragPercentagePoints'] = (bridge['dealPreTaxXirr']['value']-bridge['afterGainsTaxXirr']['value'])*100
bridge['feesCarryAndFundCashFlowTimingDragPercentagePoints'] = (bridge['afterGainsTaxXirr']['value']-bridge['fundInvestorXirr']['value'])*100
bridge['note'] = 'Saved monthly investor flows give 14.6162%, rounded to 14.6%. Capital is contributed through Year 1, including the reserve. Condensed deal bridge: 22.7% before tax, 20.1% after gains tax, 14.6% to investors.'
summary['entryDiscountSensitivity']['presentationChoice'] = 'Only the live 30% base case is current. The pasted 25% and 35% sensitivity columns predate owner use and the fund-life reserve; omit their returns from investor pages until refreshed.'
for scenario in summary['entryDiscountSensitivity']['scenarios']:
    scenario['currentForInvestorPresentation'] = scenario['discount']['value'] == .3
summary['kickers']['note'] = 'Up to 3% brand equity at full subscription; current $2.1M commitments imply 0.9%. Brand and future-fund participation carry no modeled value. Owner-use revenue and housekeeping costs are included in base-case financial returns.'
summary['sourcesAndUses']['caution'] = 'C7 is rental income and retained sale proceeds, not called capital. C23 is undrawn commitment. The $364,488.26 reserve is included in Year 1 called capital; no later capital contributions are modeled.'
summary['ownerBenefits'] = {}
for name, sheet, cell in [('annualNightsFullPortfolio','Owner Benefits','C6'),('annualNightsPerHome','Owner Benefits','C13'),
                         ('annualNightsPerUnit','Owner Benefits','C17'),('annualNightsPer100k','Owner Benefits','C18'),
                         ('rentRevenueForgoneUsd','Owner Benefits','C43'),('housekeepingCostUsd','Owner Benefits','C44'),
                         ('totalOwnerUseCostUsd','Owner Benefits','C45'),('ownerNightUtilization','Input','C182'),
                         ('calendarGapFraction','Input','C183'),('maintenanceNightsPerHome','Input','C185'),
                         ('reserveRentalStress','Input','C189'),('reserveRentalCushionUsd','Input','C191')]:
    ref = f"'{sheet}'!{cell}"
    summary['ownerBenefits'][name] = {'value': actual(ref), 'ref': ref}
summary['ownerBenefits']['note'] = 'Night pool phases in with homes open for rental and is shared pro rata; 365 is the full five-home annual pool, not an entitlement per Member. Booking terms are separate from financial assumptions; user-approved website cancellation is 30 days, while the unchanged model proposal says 60 days.'
summary['reconciliation'] = [
    {'topic': 'Return and capital timing', 'decision': 'User confirmed Model 10 monthly Year 1 payment schedule and 14.6% IRR on 2026-10-02. Replace PPTX one-capital-call wording; no calls after Year 1.', 'refs': ["'Investor Return'!C7:F7", "'_IRR Engine'!E6:G17", "'Investor Return'!C22"]},
    {'topic': 'Statement refresh', 'decision': 'Saved Model 10 income, balance sheet and cash-flow figures replace stale typed PPTX P&L. Income is $3,523,962.06 before carry and $2,819,169.65 after carry.', 'refs': ["'Income Statement'!C155:F155", "'Investor Return'!C20"]},
    {'topic': 'Owner benefits', 'decision': 'Owner use is already in base-case returns; only brand/future-fund participation is unvalued. Rent forgone $142,456.72 plus owner housekeeping $10,428.57. Detailed booking rules approved by user separately; cancellation 30 days differs from 60-day model draft.', 'refs': ["'Owner Benefits'!C43:C45", "'Owner Benefits'!C81"]},
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
    noi_text = f'${noi/1000:.1f}K' if abs(noi) < 10000 else f'${noi/1000:.0f}K'
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
print(f'Refreshed Model 10 saved values; {formula_count} formula caches checked; XIRR {independent:.10%}; source unchanged.')
