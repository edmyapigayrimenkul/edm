#!/usr/bin/env node
/**
 * Yönetim paneli için Cloudflare Access kapısını kurar.
 *
 * Yaptıkları:
 *   1. /yonetim yolunu koruyan bir Access uygulaması oluşturur (varsa günceller)
 *   2. Yalnızca izin verilen e-postaları kabul eden kuralı ekler
 *   3. Worker'a ekip alan adını ve uygulama kimliğini (aud) tanımlar
 *
 * Token'da "Access: Apps and Policies → Edit" yetkisi gerekir.
 */

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cf, ortam } from './lib/cf.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EKIP_ALANI = 'ozbornstudio.cloudflareaccess.com';
const ALAN = 'edmyapigayrimenkul.com/yonetim';
const UYGULAMA_ADI = 'EDM Yönetim Paneli';

/** Panele girebilecek e-postalar. Yeni kişi eklemek için buraya yaz. */
const IZINLI_EPOSTALAR = ['ozdogandogukan@gmail.com'];

const { hesap } = ortam();
const yaz = (i, m) => console.log(`${i} ${m}`);

function wrangler(argumanlar) {
  return new Promise((coz, red) => {
    const { token, hesap: h } = ortam();
    const s = spawn('npx', ['wrangler', ...argumanlar], {
      cwd: KOK,
      stdio: 'inherit',
      env: { ...process.env, CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: h },
    });
    s.on('close', (k) => (k === 0 ? coz() : red(new Error(`wrangler ${k}`))));
  });
}

// 1) Uygulama — aynı adda varsa yenisini açma
const mevcutlar = await cf(`/accounts/${hesap}/access/apps`);
if (!mevcutlar.ok) {
  console.error('✗ Access okunamadı:', JSON.stringify(mevcutlar.errors));
  process.exit(1);
}

let uygulama = (mevcutlar.result ?? []).find((u) => u.name === UYGULAMA_ADI);

if (uygulama) {
  yaz('·', `Uygulama zaten var: ${UYGULAMA_ADI}`);
} else {
  const y = await cf(`/accounts/${hesap}/access/apps`, {
    method: 'POST',
    body: JSON.stringify({
      name: UYGULAMA_ADI,
      type: 'self_hosted',
      domain: ALAN,
      session_duration: '24h',
      app_launcher_visible: true,
      auto_redirect_to_identity: false,
    }),
  });
  if (!y.ok) {
    const mesaj = JSON.stringify(y.errors);
    console.error('✗ Uygulama oluşturulamadı:', mesaj);
    if (mesaj.includes('forbidden')) {
      console.error('\n  Token\'da "Access: Apps and Policies → Edit" yetkisi eksik.');
      console.error('  https://dash.cloudflare.com/profile/api-tokens adresinden ekleyin.');
    }
    process.exit(1);
  }
  uygulama = y.result;
  yaz('✓', `Uygulama oluşturuldu: ${UYGULAMA_ADI}`);
}

yaz(' ', `aud: ${uygulama.aud}`);

// 2) Erişim kuralı
const kurallar = await cf(`/accounts/${hesap}/access/apps/${uygulama.id}/policies`);
const varOlan = (kurallar.result ?? []).find((k) => k.name === 'Ofis ekibi');

const kuralGovdesi = JSON.stringify({
  name: 'Ofis ekibi',
  decision: 'allow',
  precedence: 1,
  include: IZINLI_EPOSTALAR.map((e) => ({ email: { email: e } })),
});

const kr = varOlan
  ? await cf(`/accounts/${hesap}/access/apps/${uygulama.id}/policies/${varOlan.id}`, {
      method: 'PUT',
      body: kuralGovdesi,
    })
  : await cf(`/accounts/${hesap}/access/apps/${uygulama.id}/policies`, {
      method: 'POST',
      body: kuralGovdesi,
    });

yaz(kr.ok ? '✓' : '✗', kr.ok ? `Erişim kuralı: ${IZINLI_EPOSTALAR.join(', ')}` : JSON.stringify(kr.errors));

// 3) Worker değişkenleri — wrangler.jsonc'ye yazıp yeniden dağıtıyoruz
const { readFile, writeFile } = await import('node:fs/promises');
const yapilandirmaYolu = resolve(KOK, 'wrangler.jsonc');
let yapilandirma = await readFile(yapilandirmaYolu, 'utf8');

if (!yapilandirma.includes('ACCESS_EKIP_ALANI')) {
  yapilandirma = yapilandirma.replace(
    '"BILDIRIM_ADRESI"',
    `"ACCESS_EKIP_ALANI": "${EKIP_ALANI}",\n    "ACCESS_AUD": "${uygulama.aud}",\n    "BILDIRIM_ADRESI"`
  );
} else {
  yapilandirma = yapilandirma
    .replace(/"ACCESS_EKIP_ALANI":\s*"[^"]*"/, `"ACCESS_EKIP_ALANI": "${EKIP_ALANI}"`)
    .replace(/"ACCESS_AUD":\s*"[^"]*"/, `"ACCESS_AUD": "${uygulama.aud}"`);
}

await writeFile(yapilandirmaYolu, yapilandirma, 'utf8');
yaz('✓', 'Worker değişkenleri yazıldı');

console.log('\n› Yeniden dağıtılıyor…');
await wrangler(['deploy']);

console.log(`\n✓ Panel hazır: https://edmyapigayrimenkul.com/yonetim`);
console.log(`  Giriş: ${IZINLI_EPOSTALAR.join(', ')}`);
