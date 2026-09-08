/**
 * Varsayılan paylaşım görselini (Open Graph) üretir.
 *
 * İlan sayfaları paylaşılınca ilanın kendi fotoğrafı çıkıyor; bu kart
 * geri kalan her sayfa için — ana sayfa, iletişim, rehber yazıları.
 * Bir kez üretilip public/marka/ altına konuyor, çalışma anında iş yok.
 *
 * Çalıştırmak için: node scripts/og-kart.mjs
 * Metin ya da logo değişirse tekrar çalıştırılır.
 */

import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CIKTI = resolve(KOK, 'public/marka/og-varsayilan.png');
const KROM = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Facebook ve WhatsApp'ın beklediği ölçü. */
const EN = 1200;
const BOY = 630;

const uri = (yol, tur) =>
  `data:${tur};base64,${readFileSync(resolve(KOK, yol)).toString('base64')}`;

/** Fontsource'un alt küme aralıkları — Türkçe harfler latin-ext tarafında. */
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,' +
  'U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,' +
  'U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

const yuz = (ad, dosya, aralik) =>
  `@font-face{font-family:${ad};font-weight:100 900;font-display:block;` +
  `src:url(${uri(`public/fonts/${dosya}`, 'font/woff2')}) format('woff2');unicode-range:${aralik}}`;

const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
${yuz('Fraunces', 'fraunces-latin-ext-wght-normal.woff2', LATIN_EXT)}
${yuz('Fraunces', 'fraunces-latin-wght-normal.woff2', LATIN)}
${yuz('Plex', 'ibm-plex-sans-latin-ext-wght-normal.woff2', LATIN_EXT)}
${yuz('Plex', 'ibm-plex-sans-latin-wght-normal.woff2', LATIN)}
*{margin:0;padding:0;box-sizing:border-box}
body{width:${EN}px;height:${BOY}px;background:#121316;color:#f4f4f3;
  display:flex;flex-direction:column;justify-content:space-between;padding:64px 72px;
  font-family:Plex,system-ui,sans-serif;overflow:hidden}
.ust img{height:66px;width:auto;display:block}
h1{font-family:Fraunces,Georgia,serif;font-weight:800;font-size:62px;line-height:1.1;
  letter-spacing:-.015em;max-width:19ch;text-wrap:balance}
/* Kılavuzdaki %5 kırmızı: kartta tek bir ifadede */
h1 em{font-style:normal;color:#f0000d}
.alt{display:flex;align-items:baseline;justify-content:space-between;gap:32px;
  border-top:1px solid #2a2b2f;padding-top:26px}
.yerler{font-size:21px;color:#8a8b8f}
.alan{font-size:21px;font-weight:600}
</style></head><body>
<div class="ust"><img src="${uri('public/marka/logo-yatay-acik.png', 'image/png')}" alt=""></div>
<h1>Trakya&rsquo;da toprağı bilen, <em>tapuya kadar</em> yanınızda duran emlak ofisi.</h1>
<div class="alt">
  <span class="yerler">Silivri &middot; İstanbul &middot; Edirne &middot; Tekirdağ</span>
  <span class="alan">edmyapigayrimenkul.com</span>
</div>
</body></html>`;

const gecici = mkdtempSync(resolve(tmpdir(), 'edm-og-'));
const sayfa = resolve(gecici, 'kart.html');
writeFileSync(sayfa, html);

execFileSync(KROM, [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  `--window-size=${EN},${BOY}`,
  '--virtual-time-budget=6000',
  `--screenshot=${CIKTI}`,
  `file://${sayfa}`,
], { stdio: ['ignore', 'ignore', 'ignore'] });

const boyut = readFileSync(CIKTI).length;
console.log(`og-varsayilan.png yazıldı — ${EN}×${BOY}, ${(boyut / 1024).toFixed(0)} KB`);
