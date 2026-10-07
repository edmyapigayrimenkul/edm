import assert from 'node:assert/strict';
import test from 'node:test';
import { gorselSunumu, GORSEL_YEDEK_BETIGI } from '../src/lib/gorsel-sunum.ts';
import { emlakjetGorselAdresi, emlakjetGorselSun } from '../src/lib/emlakjet-gorseli.ts';

const adres = 'https://hecdn01.hemlak.com/mnresize/1280/960/ds01/0/3/7/2/1/8/5/4/64606ec9-72d2-41e6-a0fe-b85b8e8c2cf4.jpg';

test('kart ve şerit orantılı yoğunluk seçenekleriyle aynı fotoğrafı kullanır', () => {
  const kart = gorselSunumu(adres, 'kart');
  assert.equal(kart.kaynak, adres.replace('/1280/960/', '/640/480/'));
  assert.equal(kart.secenekler, `${kart.kaynak} 1x, ${adres} 2x`);
  const serit = gorselSunumu(adres, 'serit');
  assert.equal(serit.kaynak, kart.kaynak);
  assert.equal(serit.secenekler?.split(', ').length, 2);
  assert.ok(serit.secenekler?.endsWith(`${adres} 2x`));
});

test('geniş kapak özgün çözünürlüğe ulaşır, özgün adres değiştirilmez', () => {
  const kapak = gorselSunumu(adres, 'kapak');
  assert.equal(kapak.kaynak, adres.replace('/1280/960/', '/960/720/'));
  assert.ok(kapak.secenekler?.includes(`${adres} ${1280 / 960}x`));
  assert.equal(gorselSunumu(adres, 'kucuk').kaynak, gorselSunumu(adres, 'serit').kaynak);
});

const emlakjet = 'https://imaj.emlakjet.com/listing/19797428/9511BAE0897B5DB439864F39BB07A31919797428.jpg';

test('Emlakjet küçük kutularında genişliği sınırlı sürüm ve yoğun ekran kaynağı sunulur', () => {
  for (const kullanim of ['kart', 'serit', 'kucuk'] as const) {
    const sunum = gorselSunumu(emlakjet, kullanim);
    assert.equal(sunum.kaynak, `/foto/emlakjet/640${new URL(emlakjet).pathname}`);
    assert.equal(sunum.secenekler, sunum.kaynak);
    assert.equal(sunum.yogunKaynak, `/foto/emlakjet/960${new URL(emlakjet).pathname}`);
  }
});

test('Emlakjet geniş kapakta yoğun ekrana proxy görseli ve hata yedeği sunulur', () => {
  const sunum = gorselSunumu(emlakjet, 'kapak');
  assert.equal(sunum.kaynak, `/foto/emlakjet/960${new URL(emlakjet).pathname}`);
  assert.equal(sunum.yogunKaynak, sunum.kaynak);
  assert.equal(sunum.alternatifKaynak, `/foto/emlakjet/640${new URL(emlakjet).pathname}`);
  assert.equal(sunum.secenekler, sunum.kaynak);
});

test('Emlakjet imzalı, tanınmayan ve başka sunucu adresleri dönüştürülmez', () => {
  for (const kaynak of [emlakjet.replace('https:', 'http:'), `${emlakjet}?imza=abc`, `${emlakjet}#parca`,
    emlakjet.replace('https://', 'https://kullanici:sifre@'), emlakjet.replace('emlakjet.com', 'emlakjet.com.ornek.com'),
    emlakjet.replace('.com/', '.com:8443/'), emlakjet.replace('/listing/', '/resize/640/0/listing/'),
    emlakjet.replace('/listing/', '/logo/'), emlakjet.replace('9511BAE0', 'ZZZZBAE0')]) {
    assert.deepEqual(gorselSunumu(kaynak, 'kart'), { kaynak, secenekler: undefined });
  }
});

test('boyut sürümü yüklenemezse picture seçimi kaldırılır ve özgün fotoğraf yalnız bir kez denenir', () => {
  const kaldirilanlar: string[] = [];
  let deneme = 0;
  const gorsel = {
    dataset: { gorselYedek: emlakjet } as Record<string, string>,
    closest: () => ({ querySelectorAll: () => [
      { removeAttribute: (ad: string) => kaldirilanlar.push(`source:${ad}`) },
      { removeAttribute: (ad: string) => kaldirilanlar.push(`source:${ad}`) },
    ] }),
    removeAttribute: (ad: string) => kaldirilanlar.push(`img:${ad}`),
    set src(deger: string) { assert.equal(deger, emlakjet); deneme++; },
  };
  const hatada = new Function(GORSEL_YEDEK_BETIGI);
  hatada.call(gorsel);
  hatada.call(gorsel);
  assert.equal(deneme, 1);
  assert.deepEqual(kaldirilanlar, ['source:srcset', 'source:srcset', 'img:srcset']);
  assert.equal(gorsel.dataset.gorselYedek, undefined);
});

test('proxy boyutu hata verirse önce alternatif proxy, sonra özgün adres denenir', () => {
  const gorsel = {
    dataset: { gorselAlternatif: `${fotoYolu.replace('/640/', '/960/')}`, gorselYedek: emlakjet } as Record<string, string>,
    temizleme: 0,
    closest: () => ({ querySelectorAll: () => [{ removeAttribute: () => {} }] }),
    removeAttribute: () => {},
    siradaki: '',
    set src(deger: string) { this.siradaki = deger; },
  };
  const hata = new Function(GORSEL_YEDEK_BETIGI);
  hata.call(gorsel);
  assert.equal(gorsel.siradaki, fotoYolu.replace('/640/', '/960/'));
  hata.call(gorsel);
  assert.equal(gorsel.siradaki, emlakjet);
  hata.call(gorsel);
  assert.equal(gorsel.siradaki, emlakjet);
});

test('yedek adresi olmayan görselde hata işleyicisi yeniden yükleme başlatmaz', () => {
  const gorsel = { dataset: {}, set src(_: string) { assert.fail('Görsel yeniden yüklenmemeli'); } };
  new Function(GORSEL_YEDEK_BETIGI).call(gorsel);
});

const fotoYolu = `/foto/emlakjet/640${new URL(emlakjet).pathname}`;

test('fotoğraf uç noktası başka sunucu, boyut, yol ve sorgu kabul etmez', async () => {
  assert.equal(emlakjetGorselAdresi(new Request(`https://edm.test${fotoYolu}`)), emlakjet.replace('/listing/', '/resize/640/0/listing/'));
  const gecersiz = [fotoYolu.replace('/640/', '/1280/'), `${fotoYolu}?url=https://ornek.test/`,
    '/foto/emlakjet/640/https://ornek.test/foto.jpg', fotoYolu.replace('/listing/', '/logo/'),
    fotoYolu.replace('/listing/', '/%2flisting/'), fotoYolu.replace('9511BAE0', 'ZZZZBAE0')];
  for (const yol of gecersiz) {
    const istek = new Request(`https://edm.test${yol}`);
    assert.equal(emlakjetGorselAdresi(istek), null);
    const yanit = await emlakjetGorselSun(istek, { match: async () => { assert.fail('Cache okunmamalı'); }, put: async () => {} }, () => {});
    assert.equal(yanit.status, 404);
  }
  assert.equal(emlakjetGorselAdresi(new Request(`https://edm.test${fotoYolu}`, { method: 'POST' })), null);
});

test('fotoğraf MISS ardından HIT olur; kullanıcı başlıkları ve CDN çerezi taşınmaz', async () => {
  let kayit: Response | undefined;
  let cekim = 0;
  const isler: Promise<unknown>[] = [];
  const onbellek = {
    match: async () => kayit?.clone(),
    put: async (anahtar: RequestInfo | URL, yanit: Response) => {
      assert.equal((anahtar as Request).headers.has('Cookie'), false);
      kayit = yanit.clone();
    },
  };
  const getir = (async (url: RequestInfo | URL, secenek: RequestInit) => {
    cekim++;
    assert.equal(url, emlakjet.replace('/listing/', '/resize/640/0/listing/'));
    assert.equal(new Headers(secenek.headers).has('Cookie'), false);
    assert.equal(new Headers(secenek.headers).get('Accept'), 'image/jpeg');
    assert.equal(secenek.redirect, 'manual');
    return new Response(new Uint8Array([255, 216, 255]), { headers: { 'Content-Type': 'image/jpeg', 'Set-Cookie': 'portal=ornek', ETag: '"foto"' } });
  }) as typeof fetch;
  const istek = new Request(`https://edm.test${fotoYolu}`, { headers: { Cookie: 'ornek=1', Authorization: 'ornek' } });
  const ilk = await emlakjetGorselSun(istek, onbellek, (is) => isler.push(is), getir);
  await Promise.all(isler);
  assert.equal(ilk.headers.get('X-EDM-Foto'), 'MISS');
  assert.equal(ilk.headers.has('Set-Cookie'), false);
  assert.equal(ilk.headers.get('Content-Length'), '3');
  const ikinci = await emlakjetGorselSun(istek, onbellek, (is) => isler.push(is), getir);
  assert.equal(ikinci.headers.get('X-EDM-Foto'), 'HIT');
  assert.equal(cekim, 1);
  assert.deepEqual(await ikinci.arrayBuffer(), await ilk.arrayBuffer());
});

test('hatalı, HTML veya fazla büyük CDN yanıtı saklanmaz ve yedek dönüşü için 502 verir', async () => {
  const yanitlar = [new Response('hata', { status: 403 }),
    new Response(null, { status: 302, headers: { Location: 'https://baska.test/foto.jpg' } }),
    new Response('<html>hata</html>', { headers: { 'Content-Type': 'text/html' } }),
    new Response('x', { headers: { 'Content-Type': 'image/jpeg', 'Content-Length': String(4 * 1024 * 1024) } }),
    new Response(new Uint8Array(3 * 1024 * 1024 + 1), { headers: { 'Content-Type': 'image/jpeg' } })];
  for (const yanit of yanitlar) {
    const sonuc = await emlakjetGorselSun(new Request(`https://edm.test${fotoYolu}`),
      { match: async () => undefined, put: async () => { assert.fail('Hatalı yanıt saklanmamalı'); } }, () => {},
      (async () => yanit) as typeof fetch);
    assert.equal(sonuc.status, 502);
    assert.equal(sonuc.headers.get('Cache-Control'), 'no-store');
  }
});

test('R2 fotoğrafı boyutlandırılır; tanınmayan portallar ve boyutlar korunur', () => {
  const r2 = gorselSunumu('/g/ilan/foto.webp', 'kart');
  assert.equal(r2.kaynak, '/g/ilan/foto.webp?width=640');
  assert.equal(r2.alternatifKaynak, undefined);
  for (const kaynak of ['https://imaj.emlakjet.com/listing/1/foto.jpg',
    adres.replace('/1280/960/', '/800/600/'), 'geçersiz adres', '',
    adres.replace('hecdn01.hemlak.com', 'hecdn01.hemlak.com.ornek.com'),
    adres.replace('https:', 'http:'), `${adres}?imza=abc`, `${adres}#parca`,
    adres.replace('https://', 'https://kullanici:sifre@')]) {
    assert.deepEqual(gorselSunumu(kaynak, 'kart'), { kaynak, secenekler: undefined });
  }
});
