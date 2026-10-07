import assert from 'node:assert/strict';
import test from 'node:test';
import { emlakjetGorselleriniCoz } from '../src/lib/senkron/emlakjet.ts';

const foto = (sira: number) => `${sira.toString(16).padStart(32, '0')}1.jpg`;

test('Emlakjet galerisi JSON-LD sınırının ötesindeki sayfa fotoğraflarını ekler', () => {
  const ilanId = '19889243';
  const jsonLd = Array.from({ length: 10 }, (_, i) =>
    `https://imaj.emlakjet.com/resize/0/460/260/listing/${ilanId}/${foto(i + 1)}`
  );
  const sayfaGalerisi = Array.from({ length: 31 }, (_, i) =>
    `<img src="https:\\/\\/imaj.emlakjet.com\\/resize\\/0\\/640\\/listing\\/${ilanId}\\/${foto(i + 1)}">`
  ).join('\n');

  const sonuc = emlakjetGorselleriniCoz(sayfaGalerisi, ilanId, jsonLd);

  assert.equal(sonuc.length, 31);
  assert.equal(sonuc[0], `https://imaj.emlakjet.com/listing/${ilanId}/${foto(1)}`);
  assert.equal(sonuc[30], `https://imaj.emlakjet.com/listing/${ilanId}/${foto(31)}`);
});

test('başka ilanların görsellerini ve aynı fotoğrafın boyut tekrarlarını almaz', () => {
  const ilanId = '19889243';
  const sayfa = [
    `https://imaj.emlakjet.com/resize/0/200/150/listing/${ilanId}/${foto(1)}`,
    `https://imaj.emlakjet.com/resize/0/640/listing/${ilanId}/${foto(1)}`,
    `https://imaj.emlakjet.com/listing/${ilanId}/${foto(1)}`,
    `https://imaj.emlakjet.com/resize/0/640/listing/19889244/${foto(2)}`,
  ].join(' ');

  assert.deepEqual(emlakjetGorselleriniCoz(sayfa, ilanId, []), [
    `https://imaj.emlakjet.com/listing/${ilanId}/${foto(1)}`,
  ]);
});
