#!/usr/bin/env node
// Marka varlıklarını public/ altına üretir.
// Kaynak logolar 5000px CDR çıktısı; siteye uygun boyutlara indirip
// koyu zemin için siyah->kırık beyaz varyantını çıkarıyoruz.

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KAYNAK = resolve(KOK, '../yeni logo');
const HEDEF = resolve(KOK, 'public/marka');

const ACIK = { r: 0xf7, g: 0xf5, b: 0xf2 }; // koyu zeminde siyahın yerini alan kırık beyaz

/** Alfası olan koyu pikselleri açık tona çevirir; kırmızıya dokunmaz. */
async function koyuZeminVaryanti(girdi, cikti, genislik) {
  const img = sharp(girdi).resize({ width: genislik, withoutEnlargement: true });
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a === 0) continue;
    const enBuyuk = Math.max(r, g, b);
    const doygunluk = enBuyuk === 0 ? 0 : (enBuyuk - Math.min(r, g, b)) / enBuyuk;
    // Kırmızı = yüksek doygunluk -> korunur. Siyah/gri = düşük doygunluk -> aydınlatılır.
    if (doygunluk < 0.35 && enBuyuk < 140) {
      data[i] = ACIK.r;
      data[i + 1] = ACIK.g;
      data[i + 2] = ACIK.b;
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(cikti);
  return `${info.width}×${info.height}`;
}

async function olcekle(girdi, cikti, genislik) {
  const { width, height } = await sharp(girdi)
    .resize({ width: genislik, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(cikti);
  return `${width}×${height}`;
}

/** Amblemi kare tuvale ortalayıp favicon üretir. */
async function favicon(girdi, cikti, boyut, zemin) {
  const pay = Math.round(boyut * 0.14);
  const ic = await sharp(girdi)
    .resize({ width: boyut - pay * 2, height: boyut - pay * 2, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: { width: boyut, height: boyut, channels: 4, background: zemin },
  })
    .composite([{ input: ic, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(cikti);
}

async function main() {
  await mkdir(HEDEF, { recursive: true });

  const amblem = resolve(KAYNAK, 'edm amblem.png');
  const kilit = resolve(KAYNAK, 'EDM Yapı Gayrimenkul matbaa için 1 png.png');
  const kelime = resolve(KAYNAK, 'edm logo.png');
  const slogan = resolve(KAYNAK, 'edm slogan.png');

  const isler = [
    ['amblem.png', () => olcekle(amblem, resolve(HEDEF, 'amblem.png'), 512)],
    ['amblem-acik.png', () => koyuZeminVaryanti(amblem, resolve(HEDEF, 'amblem-acik.png'), 512)],
    ['logo-yatay.png', () => olcekle(kilit, resolve(HEDEF, 'logo-yatay.png'), 1000)],
    ['logo-yatay-acik.png', () => koyuZeminVaryanti(kilit, resolve(HEDEF, 'logo-yatay-acik.png'), 1000)],
    ['edm-kelime.png', () => olcekle(kelime, resolve(HEDEF, 'edm-kelime.png'), 600)],
    ['slogan.png', () => olcekle(slogan, resolve(HEDEF, 'slogan.png'), 500)],
  ];

  for (const [ad, is] of isler) {
    const boyut = await is();
    console.log(`  ✓ marka/${ad}  ${boyut}`);
  }

  await favicon(amblem, resolve(KOK, 'public/favicon-512.png'), 512, { r: 0, g: 0, b: 0, alpha: 0 });
  await favicon(amblem, resolve(KOK, 'public/apple-touch-icon.png'), 180, { r: 0x11, g: 0x11, b: 0x12, alpha: 1 });
  console.log('  ✓ favicon-512.png, apple-touch-icon.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
