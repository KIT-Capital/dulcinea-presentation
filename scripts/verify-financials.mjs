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
const snapshot=await readFile(path.join(root,'source-packages/Dulcinea Model 07 - Financial statements 2026-09-27.xlsx'));
assert.equal(createHash('sha256').update(snapshot).digest('hex'),data.source.sha256);
for(const locale of ['','es/']){
 const html=await readFile(path.join(root,`dist/private-site/${locale}financial-statements.html`),'utf8');
 const cells=[...html.matchAll(/<td\b[^>]*>(.*?)<\/td>/gs)].map(m=>m[1]);
 const expected=[...data.profitAndLoss.rows,carry.resultAfterCarry,carry.resultAfterCarryMargin,carry.carry,...data.cashFlows.rows,...data.balanceSheet.rows].filter(r=>r.id).flatMap(r=>r.displayValues);
 assert.deepEqual(cells,expected,`${locale} HTML numeric cells`);
 assert.equal((html.match(/<table>/g)||[]).length,3);
 assert(!/Dulcinea Model|\.xlsx|data-source=|Source and calculation|class="source"|class="notes"/.test(html),'Investor page contains internal source details');
 assert(!cells.some(v=>/^\(?[\s$]*0(?:\.0+)?%?\)?$/.test(v)),'Visible zero');
 for(const [id,margin] of [['ebitda','ebitdaMargin'],['netIncome','netIncomeMargin'],['resultAfterCarry','resultAfterCarryMargin']]){
   const rows=[...html.matchAll(/<tr[^>]*data-id="([^"]+)"[^>]*>/g)].map(m=>m[1]);
   const index=rows.indexOf(id);assert.equal(rows[index+1],margin,`${id} margin placement`);
 }
}
console.log('Verified source hash, statement arithmetic, margins, carry bridge, cash/BS reconciliation, EN/ES values, blank zeros and investor-facing content.');
