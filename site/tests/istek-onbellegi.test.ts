import assert from 'node:assert/strict';
import test from 'node:test';
import { istekKapsaminda, istekVerisi, istekVerisiniTemizle } from '../src/lib/istek-onbellegi.ts';

test('ortak okuma aynı istekte birleşir, sonraki istek güncel veriyi alır', async () => {
  let baslik = 'Eski ilan';
  let okumalar = 0;
  const oku = async () => { okumalar++; return baslik; };
  await istekKapsaminda(async () => {
    assert.deepEqual(await Promise.all([istekVerisi('portfoy', oku), istekVerisi('portfoy', oku)]), ['Eski ilan', 'Eski ilan']);
    assert.equal(okumalar, 1);
    baslik = 'Yeni ilan';
    istekVerisiniTemizle('portfoy');
    assert.equal(await istekVerisi('portfoy', oku), 'Yeni ilan');
  });
  baslik = 'Senkron sonrası ilan';
  assert.equal(await istekKapsaminda(() => istekVerisi('portfoy', oku)), baslik);
  assert.equal(okumalar, 3);
});

test('eşzamanlı ziyaretçiler ve istek dışı görevler veri paylaşmaz', async () => {
  const sonuclar = await Promise.all(['A', 'B'].map((ad) => istekKapsaminda(async () => {
    await Promise.resolve();
    return istekVerisi('icerik', async () => ad);
  })));
  assert.deepEqual(sonuclar, ['A', 'B']);
  assert.equal(await istekVerisi('icerik', async () => 'Cron 1'), 'Cron 1');
  assert.equal(await istekVerisi('icerik', async () => 'Cron 2'), 'Cron 2');
});

test('başarısız eski okuma yeni okuma sonucunu silemez', async () => {
  await istekKapsaminda(async () => {
    let reddet!: (hata: Error) => void;
    const eski = istekVerisi('portfoy', () => new Promise<string>((_, ret) => { reddet = ret; }));
    await Promise.resolve();
    istekVerisiniTemizle('portfoy');
    const yeni = istekVerisi('portfoy', async () => 'Yeni');
    reddet(new Error('D1 geçici hata'));
    await assert.rejects(eski);
    assert.equal(await yeni, 'Yeni');
    assert.equal(await istekVerisi('portfoy', async () => 'Yanlış tekrar'), 'Yeni');
  });
});
