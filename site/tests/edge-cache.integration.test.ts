import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';

test('gerçek Workers Cache ve D1: düzenleme bypass ile hemen, anonim HTML süre sonunda yenilenir', { timeout: 90_000 }, async () => {
  const derleme = await build({
    stdin: {
      resolveDir: process.cwd(), loader: 'ts', contents: `
        import { genelHtmlSun, GENEL_HTML_KONTROLU } from './src/lib/edge-cache.ts';
        import { istekKapsaminda, istekVerisi, istekVerisiniTemizle } from './src/lib/istek-onbellegi.ts';
        export default { async fetch(istek, env, baglam) {
          return genelHtmlSun(istek, caches.default, () => istekKapsaminda(async () => {
            const oku = () => istekVerisi('ilan', () => env.VT.prepare('SELECT baslik FROM ilan WHERE id = 1').first('baslik'));
            if (istek.method === 'POST') {
              await oku();
              await env.VT.prepare('UPDATE ilan SET baslik = ? WHERE id = 1').bind(await istek.text()).run();
              istekVerisiniTemizle('ilan');
            }
            return new Response('<h1>' + await oku() + '</h1>', {
              headers: {'Content-Type': 'text/html', 'Cache-Control': GENEL_HTML_KONTROLU}
            });
          }), (is) => baglam.waitUntil(is));
        }};`,
    },
    bundle: true, write: false, format: 'esm', external: ['node:*'],
  });
  const mf = new Miniflare(convertV4MiniflareOptions({
    compatibilityDate: '2026-09-01', compatibilityFlags: ['nodejs_compat'],
    d1Databases: ['VT'], modules: true, script: derleme.outputFiles[0].text,
  }));
  try {
    const vt = await mf.getD1Database('VT');
    await vt.prepare('CREATE TABLE ilan (id INTEGER PRIMARY KEY, baslik TEXT)').run();
    await vt.prepare("INSERT INTO ilan VALUES (1, 'Eski ilan')").run();
    const adres = 'https://edmyapigayrimenkul.com/ilan';
    const ilk = await mf.dispatchFetch(adres);
    assert.equal(ilk.headers.get('X-EDM-Cache'), 'MISS');
    assert.match(ilk.headers.get('Cache-Control')!, /max-age=0/);
    assert.equal(await ilk.text(), '<h1>Eski ilan</h1>');
    const hit = await mf.dispatchFetch(adres);
    assert.equal(hit.headers.get('X-EDM-Cache'), 'HIT');
    assert.equal(await hit.text(), '<h1>Eski ilan</h1>');
    const baslangic = Date.now();
    const panel = await mf.dispatchFetch(`${adres}/yonetim`, { method: 'POST', body: 'Panelde güncel ilan' });
    assert.equal(panel.headers.get('X-EDM-Cache'), null);
    assert.equal(await panel.text(), '<h1>Panelde güncel ilan</h1>');
    for (const headers of [{ 'Cache-Control': 'no-cache' }, { Cookie: 'oturum=1' }, { Authorization: 'Bearer test' }]) {
      const anlik = await mf.dispatchFetch(adres, { headers });
      assert.equal(anlik.headers.get('X-EDM-Cache'), null);
      assert.equal(await anlik.text(), '<h1>Panelde güncel ilan</h1>');
    }
    const eskiHit = await mf.dispatchFetch(adres);
    assert.equal(eskiHit.headers.get('X-EDM-Cache'), 'HIT');
    assert.equal(await eskiHit.text(), '<h1>Eski ilan</h1>');
    // Cache süresinin dolması gerçek Worker saatiyle sınanır; HIT süreyi uzatamaz.
    await new Promise((tamam) => setTimeout(tamam, 61_000));
    const yenilenen = await mf.dispatchFetch(adres);
    assert.equal(yenilenen.headers.get('X-EDM-Cache'), 'MISS');
    assert.equal(await yenilenen.text(), '<h1>Panelde güncel ilan</h1>');
    console.log(JSON.stringify({ duzenlemeSonrasiSaniye: (Date.now() - baslangic) / 1000, sonuc: 'guncel' }));
    // Cron'un başka bağlamda yazdığı veri de yeni anahtarda eski bellekten gelmez.
    await vt.prepare("UPDATE ilan SET baslik = 'Senkron güncel ilan' WHERE id = 1").run();
    const senkron = await mf.dispatchFetch(`${adres}?tip=arsa`);
    assert.equal(await senkron.text(), '<h1>Senkron güncel ilan</h1>');
  } finally { await mf.dispose(); }
});
