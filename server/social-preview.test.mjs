import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';
import { assetPolicy, publicPagePaths } from './access-policy.mjs';
import { publicAssetPaths } from './public-asset-paths.mjs';
import { robotsText } from './robots.mjs';

test('preview robots advertise only public routes and preserve the default crawl block', () => {
  assert.ok(robotsText.startsWith('User-agent: *\nDisallow: /\n\n'));
  for (const agent of ['facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'WhatsApp', 'Slackbot-LinkExpanding']) {
    assert.ok(robotsText.includes(`User-agent: ${agent}\n`));
  }
  const allowed = [...robotsText.matchAll(/^Allow: (.+)\$$/gm)].map(match => match[1]);
  assert.deepEqual(allowed, [...new Set([...publicPagePaths, ...publicAssetPaths])].sort());
  for (const pathname of allowed) {
    assert.equal(assetPolicy(pathname).access, 'public');
    assert.ok(robotsText.includes(`Allow: ${pathname}?\n`), 'Shared links with query strings need previews too');
  }
  for (const pathname of ['/login', '/financial-statements.html', '/es/financial-statements.html', '/source-packages/model.xlsx']) {
    assert.ok(!allowed.includes(pathname));
    assert.ok(!robotsText.includes(`Allow: ${pathname}?\n`));
  }
});

test('claiming a social crawler never bypasses financial or source protection', async () => {
  const env = {
    INVESTOR_PASSWORD: 'synthetic-preview-test-password',
    SESSION_SECRET: 'synthetic-preview-test-secret-with-32-characters',
    ASSETS: { fetch() { throw Error('Private assets must not be requested'); } },
  };
  for (const userAgent of ['facebookexternalhit/1.1', 'Twitterbot/1.0', 'WhatsApp/2.0']) {
    for (const pathname of ['/financial-statements.html', '/es/financial-statements.html']) {
      const response = await worker.fetch(new Request(`https://invest.dulcineainvestments.org${pathname}`, { headers: { 'User-Agent': userAgent } }), env);
      assert.equal(response.status, 302);
      assert.match(response.headers.get('location'), /^\/login\?next=/);
    }
    const response = await worker.fetch(new Request('https://invest.dulcineainvestments.org/source-packages/model.xlsx', { headers: { 'User-Agent': userAgent } }), env);
    assert.equal(response.status, 404);
    assert.match(response.headers.get('X-Robots-Tag'), /noindex/);
  }
});
