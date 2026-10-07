#!/usr/bin/env node
/**
 * Site Worker ile postedm GitHub Actions arasındaki üretim gizlilerini kurar.
 *
 * Değerler yalnızca git dışındaki site/.env ve postedm/.env dosyalarından
 * okunur; komut satırı argümanına veya çıktıya yazılmaz.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const POSTEDM = resolve(SITE, '../postedm');

function envOku(yol) {
  const sonuc = {};
  for (const satir of readFileSync(yol, 'utf8').split(/\r?\n/)) {
    const temiz = satir.trim();
    if (!temiz || temiz.startsWith('#')) continue;
    const esit = temiz.indexOf('=');
    if (esit < 1) continue;
    sonuc[temiz.slice(0, esit).trim()] = temiz
      .slice(esit + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return sonuc;
}

function calistir(komut, argumanlar, { cwd, env, girdi }) {
  const sonuc = spawnSync(komut, argumanlar, {
    cwd,
    env,
    input: girdi,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (sonuc.status !== 0) {
    const ayrinti = [sonuc.stdout, sonuc.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`${komut} ${argumanlar.slice(0, 4).join(' ')} başarısız${ayrinti ? `:\n${ayrinti}` : '.'}`);
  }
}

function zorunlu(ayarlar, anahtar, dosya) {
  const deger = ayarlar[anahtar]?.trim();
  if (!deger) throw new Error(`${dosya} içinde ${anahtar} tanımlı değil.`);
  return deger;
}

const site = envOku(resolve(SITE, '.env'));
const postedm = envOku(resolve(POSTEDM, '.env'));
const ortakAnahtar = zorunlu(site, 'POSTEDM_API_ANAHTARI', 'site/.env');
if (ortakAnahtar !== zorunlu(postedm, 'EDM_SITE_API_ANAHTARI', 'postedm/.env')) {
  throw new Error('Site ve postedm ortak API anahtarları eşleşmiyor.');
}

const githubJetonu = zorunlu(postedm, 'GITHUB_TOKEN', 'postedm/.env');
const depo = postedm.GITHUB_REPOSITORY?.trim() || 'edmyapigayrimenkul/postedm';
const cloudflareEnv = {
  ...process.env,
  CLOUDFLARE_API_TOKEN: zorunlu(site, 'CLOUDFLARE_API_TOKEN', 'site/.env'),
  CLOUDFLARE_ACCOUNT_ID: zorunlu(site, 'CLOUDFLARE_ACCOUNT_ID', 'site/.env'),
};

for (const [ad, deger] of [
  ['POSTEDM_API_ANAHTARI', ortakAnahtar],
  ['POSTEDM_GITHUB_JETONU', githubJetonu],
]) {
  calistir('npx', ['wrangler', 'secret', 'put', ad, '--config', 'wrangler.jsonc'], {
    cwd: SITE,
    env: cloudflareEnv,
    girdi: `${deger}\n`,
  });
  console.log(`✓ Worker secret: ${ad}`);
}

// Site API erişimi GitHub Actions'ın kısa ömürlü OIDC kimliğiyle yapılır.
// Aşağıdakiler yalnızca gerçek sosyal yayın için platformların kendi anahtarlarıdır.
const githubSecretlari = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'INSTAGRAM_ACCESS_TOKEN',
  'INSTAGRAM_ACCOUNT_ID',
  'FACEBOOK_PAGE_ID',
  'FACEBOOK_ACCESS_TOKEN',
  'THREADS_ACCESS_TOKEN',
  'THREADS_USER_ID',
  'YOUTUBE_CLIENT_ID',
  'YOUTUBE_CLIENT_SECRET',
  'YOUTUBE_REFRESH_TOKEN',
  'TIKTOK_CLIENT_KEY',
  'TIKTOK_CLIENT_SECRET',
  'TIKTOK_ACCESS_TOKEN',
  'TIKTOK_REFRESH_TOKEN',
  'IMGBB_API_KEY',
];

const eksikler = [];
for (const ad of githubSecretlari) {
  const deger = postedm[ad]?.trim();
  if (!deger) {
    eksikler.push(ad);
    continue;
  }
  calistir('gh', ['secret', 'set', ad, '--repo', depo], {
    cwd: POSTEDM,
    env: { ...process.env, GH_TOKEN: githubJetonu },
    girdi: deger,
  });
  console.log(`✓ GitHub secret: ${ad}`);
}

if (eksikler.length) console.log(`· Atlandı (yerelde eksik): ${eksikler.join(', ')}`);
console.log(`✓ Otomasyon gizlileri kuruldu: ${depo}`);
