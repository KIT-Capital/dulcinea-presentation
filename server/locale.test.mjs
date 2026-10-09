import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';
import review from './review-worker.mjs';
import {renderInvestorNavigation} from '../shared/investor-navigation.mjs';

const origin = 'https://investor.example.test';
function fixture() {
  const reads = [];
  const env = {
    INVESTOR_PASSWORD:'test-only-shared-password',
    SESSION_SECRET:'test-only-signing-secret-at-least-32-characters',
    LOGIN_LIMITER:{limit:async () => ({success:true})},
    ASSETS:{fetch:async request => {
      reads.push(new URL(request.url).pathname);
      return new Response(request.method === 'HEAD' ? null : 'approved asset', {headers:{'Content-Type':request.url.endsWith('.pdf') ? 'application/pdf' : 'text/html'}});
    }},
  };
  const request = (path,options = {}) => worker.fetch(new Request(new URL(path,origin),options),env);
  const login = (lang,next,password = env.INVESTOR_PASSWORD) => request(`/login?lang=${lang}`,{
    method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({name:'Test Investor',email:'investor@example.test',password,lang,next}),
  });
  return {env,reads,request,login};
}
const attribute = (html,name) => html.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1].replaceAll('&amp;','&');

test('French public page aliases and the three exact PDF paths work without authentication',async () => {
  const {env,reads} = fixture();
  delete env.INVESTOR_PASSWORD;
  delete env.SESSION_SECRET;
  const paths = [
    ['/fr','/fr/index.html'],['/fr/','/fr/index.html'],['/fr/index.html','/fr/index.html'],
    ['/fr/investment-criteria','/fr/investment-criteria.html'],['/fr/specialists/','/fr/specialists.html'],
    ['/fr/disclaimer/index.html','/fr/disclaimer.html'],
    ...['EN','ES','FR'].map(locale => [`/downloads/Dulcinea-Presentation-${locale}.pdf`,`/downloads/Dulcinea-Presentation-${locale}.pdf`]),
  ];
  for (const [path,asset] of paths) {
    for (const method of ['GET','HEAD']) {
      const response = await worker.fetch(new Request(origin+path,{method}),env);
      assert.equal(response.status,200,`${method} ${path}`);
      assert.equal(reads.at(-1),asset);
      assert.equal(await response.text(),method === 'HEAD' ? '' : 'approved asset');
    }
  }
});

test('French financial routes stay gated and nearby PDF filenames never expose source files',async () => {
  const {reads,request,login} = fixture();
  const financials = ['/fr/financial-statements','/fr/financial-statements.html','/fr/financial-statements/','/fr/financial-statements/index.html'];
  const unknownDownloads = ['/downloads/Dulcinea-Presentation-FR.xlsx','/downloads/Dulcinea-Presentation-FR.pdf/private.html','/downloads/Dulcinea-Presentation-DE.pdf','/downloads/dulcinea-presentation-fr.pdf','/downloads/Dulcinea-Presentation-FR.pdf%3Fsource=1'];
  for (const path of [...financials,...unknownDownloads]) {
    assert.notEqual((await request(path)).status,200,path);
  }
  assert.deepEqual(reads,[]);
  const response = await login('fr','/fr/financial-statements.html');
  const cookie = response.headers.get('Set-Cookie').split(';')[0];
  for (const path of financials) {
    assert.equal((await request(path,{headers:{Cookie:cookie}})).status,200,path);
    assert.equal(reads.at(-1),'/fr/financial-statements.html');
  }
  for (const path of unknownDownloads) assert.equal((await request(path,{headers:{Cookie:cookie}})).status,404,path);
});

test('French login language switches and errors preserve the requested statement section',async () => {
  const {request,login} = fixture();
  const next = '/fr/financial-statements.html?view=full#balance-sheet';
  const page = await request(`/login?next=${encodeURIComponent(next)}`);
  const html = await page.text();
  assert.match(html,/<html lang="fr">/);
  assert.match(html,/États financiers privés/);
  assert.match(html,/<meta name="description" content="Dulcinea Investments, LLC est une société d’investissement immobilier/);
  assert.match(html,/href="\/fr\/#home"/);
  for (const locale of ['en','es','fr']) {
    const tag = html.match(/<a\b[^>]*>/g).find(tag => tag.includes(`lang="${locale}"`));
    const target = new URL(attribute(tag,'href'),origin);
    const expected = `${locale === 'en' ? '' : '/'+locale}/financial-statements.html?view=full#balance-sheet`;
    assert.equal(target.searchParams.get('lang'),locale);
    assert.equal(target.searchParams.get('next'),expected);
  }
  const rejected = await login('fr',next,'incorrect');
  assert.equal(rejected.status,401);
  const error = await rejected.text();
  assert.match(error,/<html lang="fr">/);
  assert.match(error,/mot de passe/i);
  assert.equal(rejected.headers.get('Set-Cookie'),null);
  const accepted = await login('fr','/es/financial-statements.html?view=full#balance-sheet');
  assert.equal(accepted.status,303);
  assert.equal(accepted.headers.get('Location'),next);
  const signout = await request('/logout?lang=fr',{method:'POST',headers:{Origin:origin,Accept:'application/json'}});
  assert.deepEqual(await signout.json(),{next:'/fr/'});
});

test('the outer French review gate preserves locale through errors and successful authentication',async () => {
  const {env,reads} = fixture();
  env.REVIEW_PASSWORD = 'test-only-review-password';
  env.REVIEW_LIMITER = {limit:async () => ({success:true})};
  const next = '/fr/investment-criteria.html';
  const page = await review.fetch(new Request(`${origin}/preview-login?next=${encodeURIComponent(next)}`),env);
  assert.match(await page.text(),/<html lang="fr">/);
  const submit = password => review.fetch(new Request(`${origin}/preview-login`,{
    method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({password,lang:'fr',next:'/es/investment-criteria.html'}),
  }),env);
  const rejected = await submit('incorrect');
  assert.equal(rejected.status,401);
  assert.match(await rejected.text(),/Mot de passe incorrect/);
  assert.equal(rejected.headers.get('Set-Cookie'),null);
  const accepted = await submit(env.REVIEW_PASSWORD);
  assert.equal(accepted.status,303);
  assert.equal(accepted.headers.get('Location'),next);
  assert.match(accepted.headers.get('Set-Cookie'),/^__Host-dulcinea_review=/);
  assert.deepEqual(reads,[]);
});

test('resource navigation keeps the current locale for its PDF and links across sibling portable folders',() => {
  for (const locale of ['en','es','fr']) {
    const html = renderInvestorNavigation({name:'disclaimer',locale,web:false,logo:'logo.svg'});
    const root = locale === 'en' ? '' : '../';
    assert.ok(html.includes(`href="${root}downloads/Dulcinea-Presentation-${locale.toUpperCase()}.pdf"`));
    for (const destination of ['en','es','fr']) {
      const path = `${root}${destination === 'en' ? '' : destination+'/'}disclaimer.html`;
      assert.ok(html.includes(`href="${path}" lang="${destination}"`),`${locale} -> ${destination}`);
    }
    assert.match(html,/<span>FR<\/span>/);
  }
});
