#!/usr/bin/env node
// Siteyi derleyip Cloudflare Worker'a yükler.
// Kimlik bilgileri .env'den okunur ve yalnızca alt sürece aktarılır.

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';
import { unstable_readConfig } from 'wrangler';
import { cf, ortam } from './lib/cf.mjs';
import { d1DagitimUyumlulugu } from './lib/migration-gate.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function calistir(komut, argumanlar, ekOrtam = {}, ciktiAl = false) {
  return new Promise((coz, red) => {
    const surec = spawn(komut, argumanlar, {
      cwd: KOK,
      stdio: ciktiAl ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      env: { ...process.env, CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false', ...ekOrtam },
    });
    let cikti = '';
    if (ciktiAl) {
      surec.stdout.setEncoding('utf8').on('data', (parca) => (cikti += parca));
      surec.stderr.setEncoding('utf8').on('data', (parca) => (cikti += parca));
    }
    surec.on('error', red);
    surec.on('close', (kod) => {
      if (!ciktiAl) return kod === 0 ? coz() : red(new Error(`${komut} ${kod} koduyla çıktı`));
      console.log(cikti.trim());
      kod === 0 ? coz(cikti) : red(new Error(`${komut} ${kod} koduyla çıktı`));
    });
  });
}

const { token, hesap } = ortam();
const cloudflareOrtam = {
  CLOUDFLARE_API_TOKEN: token,
  CLOUDFLARE_ACCOUNT_ID: hesap,
};
console.log('› D1 migration uyumluluğu denetleniyor…');
const config = unstable_readConfig({ config: resolve(KOK, 'wrangler.jsonc') }, { hideWarnings: true });
const vt = config.d1_databases?.find((bag) => bag.binding === 'VT');
if (config.name !== 'edm-yapi-gayrimenkul' || vt?.database_name !== 'edm-talepler' || !vt.database_id) {
  throw new Error('Üretim Worker/D1 kimliği doğrulanamadı.');
}
const [kayitlar, ayarlar] = await Promise.all([
  cf(`/accounts/${hesap}/d1/database/${vt.database_id}/query`, {
    method: 'POST', body: JSON.stringify({ sql: 'SELECT name FROM d1_migrations ORDER BY id' }),
  }),
  cf(`/accounts/${hesap}/workers/scripts/${config.name}/settings`),
]);
if (!kayitlar.ok || kayitlar.result?.[0]?.success !== true || !ayarlar.ok) throw new Error('Uzak D1/Worker okunamadı; dağıtım durduruldu.');
// Kaynak biçimi değişirse sessizce eski sürüme düşmek yerine dağıtım durur.
const gerekli = readFileSync(resolve(KOK, 'src/lib/senkron/surum.ts'), 'utf8')
  .match(/export const gerekliD1Migrasyonu = '([^']+)'/u)?.[1];
const uyum = d1DagitimUyumlulugu({
  yerel: readdirSync(resolve(KOK, vt.migrations_dir ?? 'migrations')).filter((ad) => ad.endsWith('.sql')).sort(),
  uygulanmis: kayitlar.result[0].results.map((satir) => satir.name), gerekli,
  degiskenler: config.vars, uzakBaglamalar: ayarlar.result?.bindings,
});
console.log(uyum.ertelenen.length
  ? '✓ Şema uyumlu; yalnız 0011 CRM geçişi ertelendi, yeni sonuç kaydı açıkça kapalı.'
  : '✓ Tüm gerekli D1 geçişleri uygulanmış.');
if (process.argv[2] === '--check') process.exit(0);
if (process.argv[2]) throw new Error('Kullanım: node scripts/dagit.mjs [--check]');

console.log('› Site derleniyor…');
await calistir('npx', ['astro', 'build'], { CLOUDFLARE_API_TOKEN: '', CLOUDFLARE_ACCOUNT_ID: '' });

console.log('\n› Cloudflare Worker olarak yükleniyor…');
await calistir('npx', ['wrangler', 'deploy'], {
  ...cloudflareOrtam,
});
