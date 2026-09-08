#!/usr/bin/env node
// Marka paftasını derler.
// govde.html içindeki {{VARLIK:dosya}} yer tutucularını gömülü data URI'ye çevirir ve
// iki çıktı üretir: tarayıcıda açılabilen tek dosya + Artifact olarak yayımlanacak gövde.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = dirname(fileURLToPath(import.meta.url));
const VARLIKLAR = resolve(KOK, 'varliklar');

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

async function varlikHaritasi() {
  const harita = new Map();
  for (const ad of await readdir(VARLIKLAR)) {
    const tur = MIME[extname(ad).toLowerCase()];
    if (!tur) continue;
    const veri = await readFile(resolve(VARLIKLAR, ad));
    harita.set(ad, `data:${tur};base64,${veri.toString('base64')}`);
  }
  return harita;
}

const govde = await readFile(resolve(KOK, 'govde.html'), 'utf8');
const harita = await varlikHaritasi();

const eksik = [];
const gomulu = govde.replace(/\{\{VARLIK:([^}]+)\}\}/g, (_, ad) => {
  const uri = harita.get(ad.trim());
  if (!uri) {
    eksik.push(ad.trim());
    return '';
  }
  return uri;
});

if (eksik.length) {
  console.error('Eksik varlık:', [...new Set(eksik)].join(', '));
  process.exit(1);
}

// 1) Artifact gövdesi — sarmalayıcı etiketler olmadan
await writeFile(resolve(KOK, 'kurumsal-kimlik.artifact.html'), gomulu, 'utf8');

// 2) Tek başına açılabilen dosya — <title>/<link>/<style> head'e, içerik body'ye
const ayrac = gomulu.indexOf('<main');
const bas = gomulu.slice(0, ayrac);
const icerik = gomulu.slice(ayrac);

const tekDosya = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; }
  img { max-width: 100%; }
</style>
${bas}</head>
<body>
${icerik}
</body>
</html>`;
await writeFile(resolve(KOK, 'kurumsal-kimlik.html'), tekDosya, 'utf8');

const kb = (s) => (Buffer.byteLength(s, 'utf8') / 1024).toFixed(0) + ' KB';
console.log(`✓ kurumsal-kimlik.html            ${kb(tekDosya)}`);
console.log(`✓ kurumsal-kimlik.artifact.html   ${kb(gomulu)}`);
console.log(`  gömülen varlık: ${harita.size}`);
