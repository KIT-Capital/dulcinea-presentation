import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import review from './review-worker.mjs';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const origin='https://review.example.test';
const request=(url='/',options={})=>new Request(origin+url,options);
function fixture(overrides={}){
  const reads=[];
  return {reads,env:{REVIEW_PASSWORD:'independent-review-password',INVESTOR_PASSWORD:'independent-financial-password',SESSION_SECRET:'independent-review-signing-secret-with-32-chars',PREVIEW_ONLY:'false',REVIEW_LIMITER:{limit:async()=>({success:true})},LOGIN_LIMITER:{limit:async()=>({success:true})},ASSETS:{fetch:async r=>{reads.push(r.url);return new Response('approved bytes',{headers:{'Content-Type':'text/html'}})}},...overrides}};
}
const login=(env,extra={})=>request('/preview-login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password:env.REVIEW_PASSWORD,next:'/',...extra})});
async function cookie(env){return (await review.fetch(login(env),env)).headers.get('set-cookie').split(';')[0];}
test('whole preview gates pages, direct media and downloads before reading assets',async()=>{
  const {env,reads}=fixture();
  for(const path of ['/','/es/','/investment-criteria','/financial-statements','/assets/video/stock/AdobeStock_693150796.mp4','/downloads/Dulcinea-Floorplans.pdf']){
    const r=await review.fetch(request(path),env);assert.equal(r.status,302);assert.ok(r.headers.get('location').startsWith('/preview-login?next='));assert.match(r.headers.get('x-robots-tag'),/noindex/);
  }assert.deepEqual(reads,[]);
});
test('only logo, robots and localized review login are available without review access',async()=>{
  const {env,reads}=fixture();
  assert.equal((await review.fetch(request('/gate-assets/logo.svg'),env)).status,200);
  assert.equal(reads.length,1);
  assert.match(await (await review.fetch(request('/robots.txt'),env)).text(),/Disallow: \//);
  const r=await review.fetch(request('/preview-login?lang=es'),env);assert.equal(r.status,200);assert.match(await r.text(),/🇨🇴 ES/);
  assert.equal(r.headers.get('referrer-policy'),'same-origin','Form navigation must retain the Origin for strict CSRF validation');
});
test('review sign-in issues a secure browser-session cookie and cannot redirect outside preview',async()=>{
  const {env}=fixture();
  const r=await review.fetch(login(env,{next:'https://invest.dulcineainvestments.org/'}),env);
  assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/');
  const header=r.headers.get('set-cookie');assert.match(header,/__Host-dulcinea_review=/);assert.match(header,/HttpOnly; Secure; SameSite=Strict/);assert.doesNotMatch(header,/Expires=|Max-Age=/);
});
test('valid review session serves the website but formal statements retain the inner gate',async()=>{
  const {env,reads}=fixture();const headers={Cookie:await cookie(env)};
  assert.equal((await review.fetch(request('/',{headers}),env)).status,200);
  const r=await review.fetch(request('/financial-statements',{headers}),env);assert.equal(r.status,302);assert.match(r.headers.get('location'),/^\/login/);
  assert.equal(reads.length,1);
});
test('inner login also keeps contact actions inert in the review',async()=>{
  const {env}=fixture();const headers={Cookie:await cookie(env)};
  const response=await review.fetch(request('/login',{headers}),env);
  const html=await response.text();
  assert.equal(response.status,200);assert.doesNotMatch(html,/href="(?:mailto:|tel:|https:\/\/wa\.me\/)/);
  assert.match(html,/<link rel="canonical" href="https:\/\/dulcinea-design-review\.norfolk-ai\.workers\.dev\/">/);
  assert.ok(html.includes('font-family:Manrope'));
  assert.equal(response.headers.get('referrer-policy'),'same-origin');
});
test('production-style, malformed and tampered cookies do not grant review access',async()=>{
  const {env}=fixture();const good=await cookie(env);
  for(const Cookie of ['__Host-dulcinea_session=production-token','__Host-dulcinea_review=invalid',good+'bad'])assert.equal((await review.fetch(request('/',{headers:{Cookie}}),env)).status,302);
  const changed={...env,SESSION_SECRET:'another-independent-signing-secret-at-least-32'};
  assert.equal((await review.fetch(request('/',{headers:{Cookie:good}}),changed)).status,302);
});
test('source company/legal and financial inputs are blocked even after review login',async()=>{
  const {env,reads}=fixture();const headers={Cookie:await cookie(env),'X-Role':'admin'};
  for(const path of ['/source-packages/Dulcinea.xlsx','/content/model-summary.json','/documents/operating-agreement.pdf'])assert.equal((await review.fetch(request(path,{headers}),env)).status,404);
  assert.deepEqual(reads,[]);
});
test('wrong password, cross-origin request, missing limiting and rate rejection fail closed',async()=>{
  const {env}=fixture();assert.equal((await review.fetch(login(env,{password:'wrong'}),env)).status,401);
  const hostile=request('/preview-login',{method:'POST',headers:{Origin:'https://evil.test'},body:'password=anything'});
  assert.equal((await review.fetch(hostile,env)).status,403);
  assert.equal((await review.fetch(login(env),{...env,REVIEW_LIMITER:undefined})).status,503);
  assert.equal((await review.fetch(login(env),{...env,REVIEW_LIMITER:{limit:async()=>({success:false})}})).status,429);
});
test('oversized and non-form review submissions are rejected',async()=>{
  const {env}=fixture();
  assert.equal((await review.fetch(request('/preview-login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:'x'.repeat(5000)}),env)).status,413);
  assert.equal((await review.fetch(request('/preview-login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'}),env)).status,400);
});
test('review logout requires same-origin POST and expires outer access',async()=>{
  const {env}=fixture();assert.equal((await review.fetch(request('/preview-logout'),env)).status,403);
  const r=await review.fetch(request('/preview-logout',{method:'POST',headers:{Origin:origin}}),env);assert.equal(r.status,303);assert.match(r.headers.get('set-cookie'),/Max-Age=0/);
});
test('missing independent secrets never fall back to production access',async()=>{
  for(const overrides of [{REVIEW_PASSWORD:''},{REVIEW_PASSWORD:'short'},{SESSION_SECRET:''}]){
    const {env,reads}=fixture(overrides);assert.equal((await review.fetch(request('/'),env)).status,503);assert.deepEqual(reads,[]);
  }
});

test('explicit public-review mode opens approved pages and media while formal statements stay gated',async()=>{
  const {env}=fixture({REVIEW_PUBLIC:'true',REVIEW_PASSWORD:undefined,REVIEW_LIMITER:undefined});
  for(const path of ['/','/es/','/investment-criteria','/assets/video/stock/AdobeStock_693150796.mp4','/downloads/Dulcinea-Floorplans.pdf']){
    const r=await review.fetch(request(path),env);assert.equal(r.status,200);assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.match(r.headers.get('cache-control'),/no-store/);assert.equal(r.headers.get('set-cookie'),null);
  }
  for(const path of ['/financial-statements','/es/financial-statements.html']){
    const r=await review.fetch(request(path),env);assert.equal(r.status,302);assert.match(r.headers.get('location'),/^\/login/);
  }
  assert.doesNotMatch(await (await review.fetch(request('/login'),env)).text(),/href="(?:mailto:|tel:|https:\/\/wa\.me\/)/);
});

test('public review never exposes source files or accepts a forged financial session',async()=>{
  const {env,reads}=fixture({REVIEW_PUBLIC:'true'});
  const headers={'X-Role':'admin',Cookie:'__Host-dulcinea_session=forged'};
  for(const path of ['/source-packages/Dulcinea.xlsx','/content/model-summary.json','/documents/operating-agreement.pdf'])assert.equal((await review.fetch(request(path,{headers}),env)).status,404);
  const r=await review.fetch(request('/financial-statements.html',{headers}),env);assert.equal(r.status,302);assert.match(r.headers.get('location'),/^\/login/);assert.deepEqual(reads,[]);
});

test('public review retires old entry URLs safely and keeps logout same-origin',async()=>{
  const {env}=fixture({REVIEW_PUBLIC:'true'});
  for(const next of ['https://elsewhere.test/','//elsewhere.test/','/preview-login'])assert.equal((await review.fetch(request('/preview-login?next='+encodeURIComponent(next)),env)).headers.get('location'),'/');
  const r=await review.fetch(request('/preview-login?next=%2Fes%2F'),env);assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/es/');assert.equal(r.headers.get('set-cookie'),null);
  assert.equal((await review.fetch(request('/preview-logout'),env)).status,403);
  const out=await review.fetch(request('/preview-logout',{method:'POST',headers:{Origin:origin}}),env);assert.equal(out.headers.get('location'),'/');assert.equal(out.headers.getSetCookie().length,2);
});
