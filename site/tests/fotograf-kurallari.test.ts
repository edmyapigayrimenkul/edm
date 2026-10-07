import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fotografKaliteUyarilari,
  fotografYuklemesiTamamlandi,
  fotografYuklemePlani,
  fotografTekrarSecimDosyalari,
  ILAN_FOTOGRAFI_EN_UZUN_KENAR,
  EN_COK_ILAN_FOTOGRAFI,
} from '../src/lib/fotograf-kurallari.ts';

test('yatay 4:3 ilan fotoğrafı önerilen çözünürlükte uyarı üretmez', () => {
  assert.deepEqual(fotografKaliteUyarilari(1600, 1200), []);
  assert.equal(ILAN_FOTOGRAFI_EN_UZUN_KENAR, 1800);
  assert.equal(EN_COK_ILAN_FOTOGRAFI, 50);
});

test('düşük çözünürlük ve portre kapak önerisi ayrı uyarılır', () => {
  assert.deepEqual(fotografKaliteUyarilari(700, 1200), [
    'Çözünürlük düşük; mümkünse en az 1200 × 800 px özgün fotoğraf seçin.',
    'Dikey, kare veya çok geniş kadraj; kapak için yatay 4:3 ya da 3:2 fotoğrafı tercih edin.',
  ]);
});

test('yüksek çözünürlüklü portre ek fotoğraf olarak kalabilir', () => {
  assert.deepEqual(fotografKaliteUyarilari(1200, 1800), [
    'Dikey, kare veya çok geniş kadraj; kapak için yatay 4:3 ya da 3:2 fotoğrafı tercih edin.',
  ]);
});

test('çok geniş panorama kapak için önerilmez', () => {
  assert.deepEqual(fotografKaliteUyarilari(2400, 1000), [
    'Dikey, kare veya çok geniş kadraj; kapak için yatay 4:3 ya da 3:2 fotoğrafı tercih edin.',
  ]);
});

test('geçersiz boyutlar anlaşılır bir uyarı döndürür', () => {
  assert.equal(fotografKaliteUyarilari(0, 0).length, 1);
  assert.equal(fotografKaliteUyarilari(Number.NaN, 800).length, 1);
});

test('yükleme planı mevcut fotoğraflarla 50 sınırını aşmaz', () => {
  assert.deepEqual(fotografYuklemePlani(45, 10), { kalan: 5, yuklenecek: 5, atlanacak: 5 });
  assert.deepEqual(fotografYuklemePlani(50, 1), { kalan: 0, yuklenecek: 0, atlanacak: 1 });
  assert.deepEqual(fotografYuklemePlani(12, 3), { kalan: 38, yuklenecek: 3, atlanacak: 0 });
});

test('belirsiz sayım sonucu geçerli yükleme planına çevrilmez', () => {
  assert.equal(fotografYuklemePlani(Number.NaN, 1), null);
  assert.equal(fotografYuklemePlani(1, -1), null);
});

test('kısmi fotoğraf yüklemesi ilan kaydını tamamlanmış saymaz', () => {
  assert.equal(fotografYuklemesiTamamlandi(5, []), true);
  assert.equal(fotografYuklemesiTamamlandi(4, ['salon.jpg: ağ hatası']), false);
  assert.equal(fotografYuklemesiTamamlandi(0, []), false);
});

test('güvenli tekrar seçimi yalnızca benzersiz ve aralık içindeki başarısız dosya indekslerini döndürür', () => {
  const secilen = ['dis-cephe.jpg', 'salon.jpg', 'mutfak.jpg', 'manzara.jpg'];
  assert.deepEqual(fotografTekrarSecimDosyalari(secilen, [3, 1]), ['salon.jpg', 'manzara.jpg']);
  assert.deepEqual(fotografTekrarSecimDosyalari(secilen, []), []);
  assert.equal(fotografTekrarSecimDosyalari(secilen, [1, 1]), null);
  assert.equal(fotografTekrarSecimDosyalari(secilen, [4]), null);
  assert.equal(fotografTekrarSecimDosyalari(secilen, ['1']), null);
});
