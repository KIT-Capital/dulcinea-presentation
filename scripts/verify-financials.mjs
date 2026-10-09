import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(await readFile(path.join(root,'content/financials.json'),'utf8'));
const lookup=rows=>Object.fromEntries(rows.filter(r=>r.id).map(r=>[r.id,r]));
const income=lookup(data.profitAndLoss.rows),cash=lookup(data.cashFlows.rows),carry=lookup(data.afterCarry.rows),balance=lookup(data.balanceSheet.rows);
const close=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(let i=0;i<4;i++){
 close(income.rentalIncome.values[i]+income.propertySales.values[i],income.totalRevenue.values[i]);
 close(income.totalRevenue.values[i]+income.variableCosts.values[i],income.contributionMargin.values[i]);
 close(income.contributionMargin.values[i]+income.fixedPropertyCosts.values[i]+income.fundFixedCosts.values[i],income.ebitda.values[i]);
 close(income.ebitda.values[i]+income.taxes.values[i],income.netIncome.values[i]);
 close(carry.netIncome.values[i]+carry.carry.values[i],carry.resultAfterCarry.values[i]);
 close(cash.netIncome.values[i]+cash.basisAddback.values[i],cash.operatingCash.values[i]);
 close(cash.acquisitions.values[i]+cash.works.values[i],cash.investingCash.values[i]);
 close(cash.capitalCalled.values[i]+cash.distributions.values[i]+cash.carryDistributions.values[i],cash.financingCash.values[i]);
 close(cash.operatingCash.values[i]+cash.investingCash.values[i]+cash.financingCash.values[i],cash.netChange.values[i]);
 close(cash.openingCash.values[i]+cash.netChange.values[i],cash.closingCash.values[i]);
 close(cash.closingCash.values[i],balance.cash.values[i]);
 close(balance.totalAssets.values[i]-balance.debt.values[i],balance.equity.values[i]);
}
close(cash.openingCash.values[4],cash.openingCash.values[0]);close(cash.closingCash.values[4],cash.closingCash.values[3]);
close(carry.resultAfterCarry.values[4],-cash.distributions.values[4]-cash.capitalCalled.values[4]);
for(let i=0;i<5;i++){
 close(income.ebitdaMargin.values[i],income.ebitda.values[i]/income.totalRevenue.values[i]);
 close(income.netIncomeMargin.values[i],income.netIncome.values[i]/income.totalRevenue.values[i]);
 close(carry.resultAfterCarryMargin.values[i],carry.resultAfterCarry.values[i]/income.totalRevenue.values[i]);
}
for(const section of [data.profitAndLoss,data.afterCarry,data.cashFlows,data.balanceSheet])for(const row of section.rows.filter(r=>r.id)){
 for(let i=0;i<row.values.length;i++){const roundedZero=Math.round(Math.abs(row.values[i])*(row.unit==='percent'?1000:1))===0;assert.equal(row.displayValues[i]==='',roundedZero,`${row.id}[${i}] zero display`);}
}
const sourceArgument=process.argv.indexOf('--source');
assert(sourceArgument!==-1&&process.argv[sourceArgument+1],'Pass --source with the private authoritative workbook path');
const snapshot=await readFile(path.resolve(process.argv[sourceArgument+1]));
assert.equal(createHash('sha256').update(snapshot).digest('hex'),data.source.sha256);
const summary=JSON.parse(await readFile(path.join(root,'content/model-summary.json'),'utf8'));
const terms=JSON.parse(await readFile(path.join(root,'content/investor-terms.json'),'utf8'));
assert.equal(summary.provenance.sha256,data.source.sha256,'All financial source records must use the same workbook');
close(summary.headline.capitalCalledUsd.value,cash.capitalCalled.values[4]);
close(summary.headline.netDistributionsUsd.value,-cash.distributions.values[4]);
close(summary.sourcesAndUses.yearOneEndingCashUsd.value,cash.closingCash.values[0]);
close(summary.sourcesAndUses.reserveTargetUsd.value-cash.closingCash.values[0],summary.sourcesAndUses.reserveShortfallUsd.value);
close(summary.headline.capitalCalledUsd.value,summary.activeScenario.fullCommitmentUsd.value);
assert(summary.sourcesAndUses.reserveShortfallUsd.value>0,'Revise the shortfall disclosure if the reserve reaches its target');
assert(summary.returnBridge.afterGainsTaxXirr.value<summary.criteria.minimumDealIrr.value,'Revise the below-screen disclosure if the deal return reaches its target');
const expected=[...data.profitAndLoss.rows,carry.resultAfterCarry,carry.resultAfterCarryMargin,carry.carry,...data.cashFlows.rows,...data.balanceSheet.rows].filter(r=>r.id).flatMap(r=>r.displayValues);
function verifyStatement(html,label,locale='en'){
 const cells=[...html.matchAll(/<td\b[^>]*>(.*?)<\/td>/gs)].map(m=>m[1]);
 assert.deepEqual(cells,expected,`${label} HTML numeric cells`);
 assert.equal((html.match(/<table>/g)||[]).length,3);
 assert(!/Dulcinea Model|\.xlsx|data-source=|Source and calculation|class="source"|class="notes"/.test(html),'Investor page contains internal source details');
 assert(!cells.some(v=>/^\(?[\s$]*0(?:\.0+)?%?\)?$/.test(v)),'Visible zero');
 for(const [id,margin] of [['ebitda','ebitdaMargin'],['netIncome','netIncomeMargin'],['resultAfterCarry','resultAfterCarryMargin']]){
   const rows=[...html.matchAll(/<tr[^>]*data-id="([^"]+)"[^>]*>/g)].map(m=>m[1]);
   const index=rows.indexOf(id);assert.equal(rows[index+1],margin,`${id} margin placement`);
 }
 const visibleNote=id=>{
  const match=html.match(new RegExp(`<p\\b[^>]*id="${id}"[^>]*>([^<]*)<\\/p>`));
  assert(match,`${label}: missing visible ${id}`);
  return match[1].replace(/&nbsp;|&#160;|\s/g,'');
 };
 const reserve=visibleNote('operating-reserve-note');
 const numberLocale={en:'en-US',es:'es-CO',fr:'fr-FR'}[locale];
 const whole=value=>new Intl.NumberFormat(numberLocale,{maximumFractionDigits:0}).format(value).replace(/\s/g,'');
 for(const value of [summary.sourcesAndUses.yearOneEndingCashUsd.value,summary.sourcesAndUses.reserveTargetUsd.value,summary.sourcesAndUses.reserveShortfallUsd.value]){
  assert(reserve.includes(whole(value)),`${label}: reserve disclosure differs from source`);
 }
 assert(reserve.includes({en:'shortfall',es:'faltante',fr:'insuffisance'}[locale]),`${label}: reserve shortfall must be explicit`);
 const returnBasis=visibleNote('return-basis-note');
 const percent=(value,digits=0)=>(value*100).toFixed(digits).replace('.',locale==='en'?'.':',')+'%';
 for(const expectedReturn of [percent(summary.returnBridge.afterGainsTaxXirr.value,1),percent(summary.criteria.minimumDealIrr.value),percent(terms.criteria.minimumInvestorIrr)]){
  assert(returnBasis.includes(expectedReturn),`${label}: return-basis disclosure differs from source`);
 }
 assert(returnBasis.includes({en:'below',es:'inferior',fr:'inférieur'}[locale]),`${label}: deal screening shortfall must be explicit`);
}
verifyStatement(await readFile(path.join(root,'src/financial-statements.html'),'utf8'),'source template');
const sourceOnly=process.argv.includes('--source-only');
for(const locale of sourceOnly?[]:['','es/','fr/']){
 const html=await readFile(path.join(root,`dist/private-site/${locale}financial-statements.html`),'utf8');
 verifyStatement(html,locale||'en',locale?locale.slice(0,-1):'en');
 const home=await readFile(path.join(root,`dist/private-site/${locale}index.html`),'utf8');
 const localeNumber=(value,digits)=>value.toFixed(digits).replace('.',locale==='fr/'?',':'.');
 const irr=localeNumber(summary.headline.monthlyXirr.value*100,1)+'%';
 const multiple=localeNumber(summary.headline.moicOnCalledCapital.value,2)+'×';
 const strongText=[...home.matchAll(/<strong\b[^>]*>([^<]*)<\/strong>/g)].map(match=>match[1].replace(/&nbsp;|&#160;|\s/g,''));
 assert(strongText.includes(irr),'Homepage/presentation investor IRR differs from model');
 assert(strongText.includes(multiple),'Homepage/presentation multiple differs from model');
 const criteria=await readFile(path.join(root,`dist/private-site/${locale}investment-criteria.html`),'utf8');
 const hurdle=(terms.criteria.minimumInvestorIrr*100).toFixed(0);
 const criterion=locale==='fr/'?`TRI investisseur de ${hurdle} %`:locale==='es/'?`TIR del ${hurdle}% para el inversionista`:`${hurdle}% investor IRR`;
 assert(criteria.includes(criterion),'Criteria differs from the approved investor hurdle');
 assert(!criteria.includes('15% investor IRR')&&!criteria.includes('TIR del 15% para el inversionista'),'Stale investor-level screening hurdle');
 assert(!criteria.includes('data-source='),'Criteria page exposes internal source references');
}
console.log(`Verified source hash, statement arithmetic, margins, carry bridge, cash/BS and reserve reconciliation, blank zeros and ${sourceOnly?'source template':'EN/ES/FR investor-facing content'}.`);
