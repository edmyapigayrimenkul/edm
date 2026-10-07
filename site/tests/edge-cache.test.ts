import test from 'node:test';
import assert from 'node:assert/strict';
import { genelHtmlOnbellekAnahtari, genelHtmlSaklanabilir } from '../src/lib/edge-cache.ts';

const url = 'https://edmyapigayrimenkul.com';

test('yalnız anonim genel GET HTML yolları cache anahtarı alır', () => {
  assert.equal(genelHtmlOnbellekAnahtari(new Request(`${url}/ilanlar`))?.url, `${url}/ilanlar?__edm_html_onbellek=2`);
  assert.equal(genelHtmlOnbellekAnahtari(new Request(`${url}/ilanlar?tip=arsa`))?.url, `${url}/ilanlar?tip=arsa&__edm_html_onbellek=2`);
  assert.equal(genelHtmlOnbellekAnahtari(new Request(`${url}/api/talep`, { method: 'POST' })), null);
  assert.equal(genelHtmlOnbellekAnahtari(new Request(`${url}/yonetim/ilanlar`)), null);
  assert.equal(genelHtmlOnbellekAnahtari(new Request(`${url}/ilanlar`, { headers: { Cookie: 'oturum=1' } })), null);
  assert.equal(genelHtmlOnbellekAnahtari(new Request(`${url}/ilanlar`, { headers: { Authorization: 'Bearer x' } })), null);
  assert.equal(genelHtmlOnbellekAnahtari(new Request(`${url}/ilanlar`, { headers: { 'Cache-Control': 'no-store' } })), null);
});

test('yalnız 200, herkese açık, kısa süreli HTML cevabı saklanır', () => {
  const gecerli = new Response('<html></html>', {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60, s-maxage=60' },
  });
  assert.equal(genelHtmlSaklanabilir(gecerli), true);
  assert.equal(genelHtmlSaklanabilir(new Response('private', { headers: { 'Content-Type': 'text/html', 'Cache-Control': 'private, s-maxage=60' } })), false);
  assert.equal(genelHtmlSaklanabilir(new Response('<html/>', { status: 404, headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, s-maxage=60' } })), false);
  assert.equal(genelHtmlSaklanabilir(new Response('<html/>', { headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, s-maxage=60', 'Set-Cookie': 'oturum=1' } })), false);
  assert.equal(genelHtmlSaklanabilir(new Response('{}', { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=60' } })), false);
});
