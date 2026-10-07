import test from 'node:test';
import assert from 'node:assert/strict';
import { vitrinIlanlariniDengele, type VitrinKaydi } from '../src/lib/vitrin.ts';

function ilan(id: string, tip: string, tipGrup = 'konut', fiyat = 1): VitrinKaydi {
  return { id, tip, tipGrup, kategori: tip, fiyat };
}

test('ana sayfa seçkisi daire, villa ve araziyi önce temsil eder', () => {
  const kaynak = [
    ilan('v3', 'villa', 'konut', 900),
    ilan('d2', 'daire', 'konut', 800),
    ilan('a2', 'tarla', 'arsa', 700),
    ilan('v1', 'villa', 'konut', 600),
    ilan('d1', 'daire', 'konut', 500),
    ilan('a1', 'arsa', 'arsa', 400),
  ];

  const sonuc = vitrinIlanlariniDengele(kaynak, 6);

  assert.deepEqual(sonuc.slice(0, 3).map((x) => x.id), ['d2', 'v3', 'a2']);
  assert.equal(new Set(sonuc.map((x) => x.id)).size, 6);
});

test('grupta ilan kalmadığında diğer gruplarla istenen sayıyı doldurur', () => {
  const sonuc = vitrinIlanlariniDengele([
    ilan('d1', 'daire'),
    ilan('v1', 'villa'),
    ilan('a1', 'tarla', 'arsa'),
  ], 5);

  assert.equal(sonuc.length, 3);
  assert.deepEqual(sonuc.map((x) => x.id), ['d1', 'v1', 'a1']);
});

test('satılık villa imarlı arazi grubunda sayılır', () => {
  const sonuc = vitrinIlanlariniDengele([
    ilan('imarlı', 'villa imarlı', 'arsa'),
    ilan('villa', 'villa'),
    ilan('daire', 'daire'),
  ], 3);

  assert.deepEqual(sonuc.map((x) => x.id), ['daire', 'villa', 'imarlı']);
});
