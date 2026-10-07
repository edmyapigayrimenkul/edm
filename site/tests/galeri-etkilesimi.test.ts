import assert from 'node:assert/strict';
import test from 'node:test';
import { galeriIndeksi, kaydirmaYonunuBul } from '../src/lib/galeri-etkilesimi.ts';

test('galeri indeksi iki yönde de dairesel ilerler', () => {
  assert.equal(galeriIndeksi(0, 4), 0);
  assert.equal(galeriIndeksi(4, 4), 0);
  assert.equal(galeriIndeksi(-1, 4), 3);
  assert.equal(galeriIndeksi(-5, 4), 3);
});

test('boş veya geçersiz fotoğraf sayısında indeks üretmez', () => {
  assert.equal(galeriIndeksi(0, 0), null);
  assert.equal(galeriIndeksi(0, -1), null);
  assert.equal(galeriIndeksi(0, 1.5), null);
});

test('yatay dokunma sağa önceki, sola sonraki fotoğrafı seçer', () => {
  assert.equal(kaydirmaYonunuBul(80, 10), -1);
  assert.equal(kaydirmaYonunuBul(-80, 10), 1);
});

test('küçük veya ağırlıklı dikey dokunma galeriyi değiştirmez', () => {
  assert.equal(kaydirmaYonunuBul(55, 0), null);
  assert.equal(kaydirmaYonunuBul(80, 80), null);
  assert.equal(kaydirmaYonunuBul(30, 100), null);
});
