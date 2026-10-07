#!/usr/bin/env node
/** Yedek kimlikleri yalnız git dışındaki dosyadan okunup GitHub'a stdin ile yazılır. */
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { YEDEK_ORTAMLARI } from './lib/yedek-kurallari.mjs';
import { yedekS3Baglantisi } from './yedekleme/r2.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEPO = 'edmyapigayrimenkul/edm';
const ayarlar = parseEnv(readFileSync(resolve(KOK, '.env.yedek'), 'utf8'));
for (const ad of ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN', 'R2_YEDEK_ERISIM_KIMLIGI', 'R2_YEDEK_GIZLI_ANAHTARI', 'CLOUDFLARE_BILDIRIM_API_TOKEN']) {
  if (!ayarlar[ad]?.trim() || ayarlar[ad].startsWith('buraya')) throw new Error(`${ad} henüz girilmedi.`);
}
if (!/^[a-f0-9]{32}$/i.test(ayarlar.CLOUDFLARE_ACCOUNT_ID)) throw new Error('Hesap kimliği geçersiz.');

function gh(argumanlar, girdi) {
  // Kabuk, anahtar argümanı ve hata çıktısı yok; anahtarlık yalnız doğru hesap için kullanılır.
  const env = { ...process.env }; delete env.GH_TOKEN; delete env.GITHUB_TOKEN;
  const r = spawnSync('gh', argumanlar, { env, input: girdi, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  if (r.status !== 0) throw new Error('GitHub işlemi tamamlanamadı; hassas çıktı gizlendi.');
  return r.stdout.trim();
}
if (gh(['api', 'user', '--jq', '.login']) !== 'edmyapigayrimenkul') throw new Error('GitHub etkin hesabı edmyapigayrimenkul olmalı.');
if (gh(['api', `repos/${DEPO}`, '--jq', '.permissions.admin']) !== 'true') throw new Error('EDM deposunda yönetici yetkisi gerekli.');

for (const hedef of Object.values(YEDEK_ORTAMLARI)) {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ayarlar.CLOUDFLARE_ACCOUNT_ID}/d1/database/${hedef.kimlik}/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${ayarlar.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql: 'SELECT 1 AS yedek_kimlik_kontrolu' }), signal: AbortSignal.timeout(30000),
  });
  const govde = await r.json().catch(() => ({}));
  if (!r.ok || govde.success !== true) throw new Error(`${hedef.ad} okuma erişimi doğrulanamadı (${r.status}).`);
}
const s3 = await yedekS3Baglantisi(ayarlar.CLOUDFLARE_ACCOUNT_ID, ayarlar);
try {
  await s3.kontrol('edm-yedek');
  await s3.kontrol('edm-yedek-staging');
} finally { s3.kapat(); }

gh(['variable', 'set', 'YEDEK_ZAMANLAYICI_HAZIR', '--repo', DEPO, '--body', '0']);
gh(['variable', 'set', 'CLOUDFLARE_ACCOUNT_ID', '--repo', DEPO, '--body', ayarlar.CLOUDFLARE_ACCOUNT_ID]);
for (const [ad, deger] of [
  ['CLOUDFLARE_YEDEK_OKUMA_TOKEN', ayarlar.CLOUDFLARE_API_TOKEN],
  ['R2_YEDEK_ERISIM_KIMLIGI', ayarlar.R2_YEDEK_ERISIM_KIMLIGI],
  ['R2_YEDEK_GIZLI_ANAHTARI', ayarlar.R2_YEDEK_GIZLI_ANAHTARI],
  ['CLOUDFLARE_YEDEK_BILDIRIM_TOKEN', ayarlar.CLOUDFLARE_BILDIRIM_API_TOKEN],
]) {
  gh(['secret', 'set', ad, '--repo', DEPO], deger);
  console.log(`✓ GitHub secret kuruldu: ${ad}`);
}
console.log('✓ Kimlikler kuruldu; zamanlayıcı iki gerçek yedek ve bildirim testi doğrulanana kadar kapalı.');
