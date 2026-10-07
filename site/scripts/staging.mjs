#!/usr/bin/env node
/** Üretimden ayrı Cloudflare staging ortamının güvenli dağıtım kapısı. */
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unstable_readConfig } from 'wrangler';
import { cf, ortam } from './lib/cf.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ISLEM = process.argv[2] ?? 'check';
const STAGING_ALANI = 'edm-yapi-gayrimenkul-staging.ezanplus.workers.dev';
const ADMINLER = ['edmyapigayrimenkul@gmail.com', 'ozdogandogukan@gmail.com'];

function dogrula(kosul, mesaj) {
  if (!kosul) throw new Error(`Staging güvenlik kapısı: ${mesaj}`);
}

function komut(argumanlar, ekOrtam = {}) {
  return new Promise((coz, red) => {
    const altOrtam = {
      ...process.env,
      CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false',
      ...ekOrtam,
    };
    // Derleyicinin API tokenına ihtiyacı yok; yalnız Wrangler alt sürecine ver.
    delete altOrtam.CLOUDFLARE_API_TOKEN;
    delete altOrtam.CLOUDFLARE_ACCOUNT_ID;
    if (argumanlar[0] === 'wrangler') {
      const { token, hesap } = ortam();
      altOrtam.CLOUDFLARE_API_TOKEN = token;
      altOrtam.CLOUDFLARE_ACCOUNT_ID = hesap;
    }
    const alt = spawn('npx', argumanlar, {
      cwd: KOK,
      stdio: 'inherit',
      env: altOrtam,
    });
    alt.on('error', red);
    alt.on('close', (kod) => kod === 0 ? coz() : red(new Error(`${argumanlar[0]} başarısız: ${kod}`)));
  });
}

if (!['check', 'migrate', 'deploy'].includes(ISLEM)) {
  throw new Error('Kullanım: node scripts/staging.mjs [check|migrate|deploy]');
}

const prod = unstable_readConfig({ config: resolve(KOK, 'wrangler.jsonc') }, { hideWarnings: true });
const stage = unstable_readConfig({ config: resolve(KOK, 'wrangler.jsonc'), env: 'staging' }, { hideWarnings: true });
const prodDb = prod.d1_databases?.find((bag) => bag.binding === 'VT');
const stageDb = stage.d1_databases?.find((bag) => bag.binding === 'VT');
const prodR2 = prod.r2_buckets?.find((bag) => bag.binding === 'GORSELLER');
const stageR2 = stage.r2_buckets?.find((bag) => bag.binding === 'GORSELLER');

dogrula(stage.name === 'edm-yapi-gayrimenkul-staging', 'Worker adı yanlış.');
dogrula(stage.workers_dev === true && !stage.route && !(stage.routes?.length), 'Yalnız workers.dev kullanılmalı.');
dogrula(stage.preview_urls === false, 'Sürüm önizleme adresleri kapalı olmalı.');
dogrula(stageDb?.database_name === 'edm-talepler-staging' && stageDb.database_id !== prodDb?.database_id, 'D1 üretimden ayrı değil.');
dogrula(stageR2?.bucket_name === 'edm-gorseller-staging' && stageR2.bucket_name !== prodR2?.bucket_name, 'R2 üretimden ayrı değil.');
dogrula(stage.triggers?.crons?.length === 0, 'Staging cron kapalı olmalı.');
dogrula(!stage.send_email?.length, 'Staging e-posta bindingi içermemeli.');
dogrula(stage.vars?.STAGING_ORTAMI === '1', 'Staging güvenlik bayrağı eksik.');
dogrula(stage.vars?.ACCESS_AUD && stage.vars.ACCESS_AUD !== prod.vars?.ACCESS_AUD, 'Access AUD üretimden ayrı değil.');
dogrula(!stage.vars?.POSTEDM_DEPO && !stage.vars?.BILDIRIM_ADRESI, 'Üretim bildirim değişkeni staging içinde.');
dogrula(stage.vars?.PANEL_ADMIN_EPOSTALARI === ADMINLER.join(','), 'Panel yönetici listesi beklenenden farklı.');

const { hesap } = ortam();
const [uygulamalar, veritabanlari, kovalar, altAlan] = await Promise.all([
  cf(`/accounts/${hesap}/access/apps?per_page=100`),
  cf(`/accounts/${hesap}/d1/database?per_page=100`),
  cf(`/accounts/${hesap}/r2/buckets?per_page=100`),
  cf(`/accounts/${hesap}/workers/subdomain`),
]);
dogrula(uygulamalar.ok && veritabanlari.ok && kovalar.ok && altAlan.ok, 'Cloudflare kaynakları okunamadı.');
const uygulama = (uygulamalar.result ?? []).find((kayit) => kayit.name === 'EDM Staging');
dogrula(uygulama?.domain === STAGING_ALANI && uygulama.aud === stage.vars.ACCESS_AUD, 'Staging Access uygulaması eşleşmiyor.');
dogrula(altAlan.result?.subdomain === 'ezanplus', 'workers.dev alt alanı değişmiş.');
dogrula((veritabanlari.result ?? []).some((kayit) => kayit.name === stageDb.database_name && (kayit.uuid ?? kayit.id) === stageDb.database_id), 'Staging D1 bulunamadı.');
dogrula((kovalar.result?.buckets ?? []).some((kayit) => kayit.name === stageR2.bucket_name), 'Staging R2 bulunamadı.');

const kurallar = await cf(`/accounts/${hesap}/access/apps/${uygulama.id}/policies`);
dogrula(kurallar.ok, 'Access kuralları okunamadı.');
const izinler = (kurallar.result ?? []).filter((kayit) => kayit.decision === 'allow');
dogrula(izinler.length === 1, 'Yalnız bir allow kuralı olmalı.');
const epostalar = (izinler[0].include ?? []).map((kayit) => kayit.email?.email).sort();
dogrula(JSON.stringify(epostalar) === JSON.stringify([...ADMINLER].sort()), 'Access e-posta listesi beklenenden farklı.');
console.log('✓ Staging D1, R2, Access ve üretim izolasyonu doğrulandı.');

if (ISLEM === 'check') process.exit(0);

console.log('› Staging D1 migration uygulanıyor…');
await komut(['wrangler', 'd1', 'migrations', 'apply', stageDb.database_name, '--remote', '--env', 'staging'], { CI: '1' });
if (ISLEM === 'migrate') process.exit(0);

console.log('› Staging derlemesi yapılıyor…');
await komut(['astro', 'build'], { CLOUDFLARE_ENV: 'staging' });
console.log('› Staging Worker dağıtılıyor…');
await komut(['wrangler', 'deploy', '--env', 'staging']);
const workerYolu = `/accounts/${hesap}/workers/scripts/${stage.name}`;
const onizleme = await cf(`${workerYolu}/subdomain`, {
  method: 'POST',
  body: JSON.stringify({ enabled: true, previews_enabled: false }),
});
dogrula(onizleme.ok && onizleme.result?.previews_enabled === false, 'Sürüm önizleme URL\'leri kapatılamadı.');
const [takvim, baglamalar] = await Promise.all([
  cf(`${workerYolu}/schedules`),
  cf(`${workerYolu}/settings`),
]);
dogrula(takvim.ok && takvim.result?.schedules?.length === 0, 'Uzak staging Worker içinde cron bulunuyor.');
dogrula(baglamalar.ok, 'Uzak Worker bindingleri okunamadı.');
const baglar = baglamalar.result.bindings ?? [];
dogrula(baglar.some((bag) => bag.type === 'd1' && bag.id === stageDb.database_id), 'Uzak Worker yanlış D1 kullanıyor.');
dogrula(baglar.some((bag) => bag.type === 'r2_bucket' && bag.bucket_name === stageR2.bucket_name), 'Uzak Worker yanlış R2 kullanıyor.');
dogrula(!baglar.some((bag) => bag.type === 'secret_text' || bag.type === 'send_email'), 'Uzak Worker sır veya e-posta bindingi içeriyor.');
const giris = await fetch(`https://${STAGING_ALANI}/`, { redirect: 'manual' });
dogrula(giris.status === 302 && (giris.headers.get('location') ?? '').startsWith('https://ozbornstudio.cloudflareaccess.com/'), 'Access kapısı HTTP üzerinden doğrulanamadı.');
console.log(`✓ https://${STAGING_ALANI}`);
