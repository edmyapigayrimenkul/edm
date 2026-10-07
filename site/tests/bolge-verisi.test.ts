import test from 'node:test';
import assert from 'node:assert/strict';
import { arsaBirimFiyatOzeti, bolgeyeGoreGrupla } from '../src/lib/bolge-verisi.ts';
import { bolgeRehberiBul } from '../src/lib/bolge-rehberi.ts';

const arsa = (id: string, fiyat: number | null, alan: number | null, ek = {}) => ({ id, fiyat, alanlar: { karsilastirmaM2: alan }, islem: 'satilik', tipGrup: 'arsa', paraBirimi: 'TRY', ...ek });

test('Merkez ilçeleri il bilgisiyle ayrılır; boş ilçe rehbere girmez', () => {
  const sonuc = bolgeyeGoreGrupla([
    { il: 'Edirne', ilce: 'Merkez', id: 'e1' },
    { il: 'Kırklareli', ilce: 'Merkez', id: 'k1' },
    { il: ' EDİRNE ', ilce: ' merkez ', id: 'e2' },
    { il: 'Edirne', ilce: ' ', id: 'yok' },
  ]);
  assert.deepEqual(sonuc.map((liste) => liste.map((ilan) => ilan.id)), [['e1', 'e2'], ['k1']]);
});

test('yerel içerik farklı ilin aynı adlı ilçesine taşınmaz', () => {
  assert.ok(bolgeRehberiBul(' EDİRNE ', 'merkez'));
  assert.equal(bolgeRehberiBul('Kırklareli', 'Merkez'), null);
  assert.equal(bolgeRehberiBul(null, 'Silivri'), null);
});

test('kira, devir, döviz ve konut arazi birim fiyatına katılmaz', () => {
  const sonuc = arsaBirimFiyatOzeti([
    arsa('a', 1000, 10), arsa('b', 3000, 10),
    arsa('kira', 9000, 1, { islem: 'kiralik' }),
    arsa('devir', 9000, 1, { islem: 'devren-satilik' }),
    arsa('doviz', 9000, 1, { paraBirimi: 'EUR' }),
    arsa('konut', 9000, 1, { tipGrup: 'konut' }),
  ]);
  assert.deepEqual(sonuc, { adet: 2, ortanca: 200 });
});

test('eksik, sıfır, negatif ve sonlu olmayan veriler örnek sayısına girmez', () => {
  const sonuc = arsaBirimFiyatOzeti([
    arsa('a', 1000, 10), arsa('eksik', null, 1), arsa('alan-yok', 10, null),
    arsa('sifir', 0, 1), arsa('eksi', -1, 1), arsa('eksi-alan', 1, -1),
    arsa('sonsuz', Infinity, 1), arsa('sonsuz-alan', 1, Infinity),
    arsa('nan', NaN, 1), arsa('tasma', Number.MAX_VALUE, Number.MIN_VALUE),
  ]);
  assert.deepEqual(sonuc, { adet: 1, ortanca: null });
  assert.deepEqual(arsaBirimFiyatOzeti([]), { adet: 0, ortanca: null });
});

test('aynı fiziksel taşınmazın alternatif ilanları yalnız bir örnektir', () => {
  const sonuc = arsaBirimFiyatOzeti([
    arsa('19303282', 1000, 10), arsa('19290394', 1000, 10),
    arsa('b', 3000, 10),
  ]);
  assert.deepEqual(sonuc, { adet: 2, ortanca: 200 });
});

test('ortanca sıralanmış gerçek birimlerden hesaplanır, yalnız sonuç yuvarlanır', () => {
  assert.deepEqual(arsaBirimFiyatOzeti([arsa('a', 301, 100), arsa('b', 202, 100), arsa('c', 100, 100)]), { adet: 3, ortanca: 2 });
  assert.deepEqual(arsaBirimFiyatOzeti([arsa('a', 251, 100), arsa('b', 249, 100)]), { adet: 2, ortanca: 3 });
});
