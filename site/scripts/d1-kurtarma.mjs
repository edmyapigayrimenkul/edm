#!/usr/bin/env node
/** D1 Time Travel ve SQL dışa aktarımını doğru ortama sabitler. */
import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unstable_readConfig } from 'wrangler';
import { ortam } from './lib/cf.mjs';
import { YEDEK_ORTAMLARI } from './lib/yedek-kurallari.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ayarYolu = resolve(KOK, 'wrangler.yedek.jsonc');
const [islem, hedef, deger, kimlikOnayi] = process.argv.slice(2);
if (!['info', 'export', 'restore'].includes(islem) || !['staging', 'production'].includes(hedef)) {
  throw new Error('Kullanım: node scripts/d1-kurtarma.mjs <info|export|restore> <staging|production> [dosya|yer-imi] [veritabanı-kimliği]');
}

const oku = (env) => unstable_readConfig(
  { config: ayarYolu, ...(env ? { env } : {}) },
  { hideWarnings: true }
);
const prod = oku();
const secilen = hedef === 'staging' ? oku('staging') : prod;
const veritabani = secilen.d1_databases?.find((kayit) => kayit.binding === 'VT');
const uretim = prod.d1_databases?.find((kayit) => kayit.binding === 'VT');
if (!veritabani || !uretim) throw new Error('VT bağlaması bulunamadı.');
if (veritabani.database_id !== YEDEK_ORTAMLARI[hedef].kimlik) throw new Error('D1 kimliği yedekleme ortamıyla eşleşmiyor.');
if (hedef === 'staging' && (
  veritabani.database_name !== 'edm-talepler-staging' ||
  veritabani.database_id === uretim.database_id ||
  secilen.vars?.STAGING_ORTAMI !== '1'
)) throw new Error('Staging D1 üretimden ayrı değil.');
if (hedef === 'production' && veritabani.database_name !== 'edm-talepler') {
  throw new Error('Üretim D1 adı değişmiş; işlemi durdurun.');
}

const argumanlar = ['wrangler', 'd1', '--config', ayarYolu];
if (islem === 'info') {
  argumanlar.push('time-travel', 'info', veritabani.database_name, '--json');
} else if (islem === 'export') {
  if (!deger || existsSync(resolve(deger))) throw new Error('Yeni, var olmayan bir SQL dosya yolu verin.');
  // SQL dışa aktarımı müşteri verisi içerebilir; yeni dosya yalnız sahibine okunur.
  process.umask(0o077);
  argumanlar.push('export', veritabani.database_name, '--remote', '--skip-confirmation', '--output', resolve(deger));
} else {
  if (!deger || !/^[0-9a-f-]{20,}$/i.test(deger)) throw new Error('Geçerli Time Travel yer imi gerekli.');
  if (kimlikOnayi !== veritabani.database_id) {
    throw new Error(`Geri yükleme hedefini doğrulamak için son argüman tam D1 kimliği olmalı: ${veritabani.database_id}`);
  }
  argumanlar.push('time-travel', 'restore', veritabani.database_name, '--bookmark', deger);
}
if (hedef === 'staging') argumanlar.push('--env', 'staging');

const { token, hesap } = ortam();
const alt = spawn('npx', argumanlar, {
  cwd: KOK,
  // Wrangler export çıktısı bir saatlik imzalı indirme URL'si yazabilir.
  // Bunu terminale veya otomasyon günlüğüne aktarmıyoruz.
  stdio: islem === 'export' ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  env: {
    ...process.env,
    CLOUDFLARE_API_TOKEN: token,
    CLOUDFLARE_ACCOUNT_ID: hesap,
    CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false',
  },
});
if (islem === 'export') {
  alt.stdout.resume();
  alt.stderr.resume();
}
alt.on('error', (hata) => { throw hata; });
alt.on('close', (kod) => {
  if (kod !== 0) {
    console.error('D1 işlemi başarısız oldu; imzalı URL içerebilen Wrangler çıktısı gizlendi.');
    process.exitCode = kod || 1;
    return;
  }
  if (islem === 'export') console.log(`SQL dışa aktarıldı: ${resolve(deger)} (${statSync(resolve(deger)).size} bayt)`);
});
