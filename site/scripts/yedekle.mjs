#!/usr/bin/env node
/** D1 ve site R2 nesnelerini ayrı, özel R2 kovasına doğrulayarak arşivler. */
import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unstable_readConfig } from 'wrangler';
import { cf, ortam } from './lib/cf.mjs';
import { yedekS3Baglantisi } from './yedekleme/r2.mjs';
import { YEDEK_ORTAMLARI, yedekManifestiniDogrula } from './lib/yedek-kurallari.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hedef = process.argv[2];
if (!['staging', 'production'].includes(hedef)) {
  throw new Error('Kullanım: node scripts/yedekle.mjs <staging|production>');
}

const ayar = unstable_readConfig(
  { config: resolve(KOK, 'wrangler.yedek.jsonc'), ...(hedef === 'staging' ? { env: 'staging' } : {}) },
  { hideWarnings: true }
);
const veritabani = ayar.d1_databases?.find((bag) => bag.binding === 'VT');
const kaynakKova = ayar.r2_buckets?.find((bag) => bag.binding === 'GORSELLER')?.bucket_name;
const yedekKova = hedef === 'staging' ? 'edm-yedek-staging' : 'edm-yedek';
if (!veritabani || !kaynakKova || veritabani.database_id !== YEDEK_ORTAMLARI[hedef].kimlik || (
  hedef === 'staging'
    ? veritabani.database_name !== 'edm-talepler-staging' || kaynakKova !== 'edm-gorseller-staging' || ayar.vars?.STAGING_ORTAMI !== '1'
    : veritabani.database_name !== 'edm-talepler' || kaynakKova !== 'edm-gorseller'
)) throw new Error('D1/R2 ortam eşleşmesi doğrulanamadı.');

const { hesap, token } = ortam();
const s3 = await yedekS3Baglantisi(hesap);
const kimlik = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomUUID().slice(0, 8);
const kokAnahtar = `${hedef}/${kimlik}`;
async function dosyaOzeti(yol) {
  const hash = createHash('sha256');
  for await (const parca of createReadStream(yol)) hash.update(parca);
  return { bayt: (await stat(yol)).size, sha256: hash.digest('hex') };
}
const ortamDegiskenleri = {
  ...process.env,
  CLOUDFLARE_API_TOKEN: token,
  CLOUDFLARE_ACCOUNT_ID: hesap,
  CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false',
};

function komut(program, argumanlar) {
  return new Promise((coz, red) => {
    // Wrangler D1 export stdout'u kısa ömürlü imzalı URL taşıyabilir.
    const alt = spawn(program, argumanlar, { cwd: KOK, env: ortamDegiskenleri, stdio: ['ignore', 'pipe', 'pipe'] });
    alt.stdout.resume();
    alt.stderr.resume();
    alt.on('error', red);
    alt.on('close', (kod) => kod === 0 ? coz() : red(new Error(`${program} işlemi başarısız (${kod}); hassas çıktı gizlendi.`)));
  });
}

async function r2KopyasiDogrula(kaynakDosya, anahtar, geciciDizin, tur) {
  const hedefYol = `${yedekKova}/${anahtar}`;
  if (s3) await s3.yaz(yedekKova, anahtar, kaynakDosya, tur);
  else await komut('npx', ['wrangler', 'r2', 'object', 'put', hedefYol, '--file', kaynakDosya, '--remote', '--force', '--content-type', tur]);
  const geriOkuma = join(geciciDizin, 'geri-okuma');
  await rm(geriOkuma, { force: true });
  if (s3) await s3.oku(yedekKova, anahtar, geriOkuma);
  else await komut('npx', ['wrangler', 'r2', 'object', 'get', hedefYol, '--file', geriOkuma, '--remote']);
  const [ilk, ikinci] = await Promise.all([dosyaOzeti(kaynakDosya), dosyaOzeti(geriOkuma)]);
  if (ilk.bayt !== ikinci.bayt || ilk.sha256 !== ikinci.sha256) {
    throw new Error(`R2 yedeği geri okuma doğrulamasını geçmedi: ${anahtar}`);
  }
  return ilk;
}

async function kaynakNesneleri() {
  const nesneler = [];
  const imlecler = new Set();
  let imlec;
  do {
    const sorgu = new URLSearchParams({ per_page: '1000' });
    if (imlec) sorgu.set('cursor', imlec);
    const yanit = await cf(`/accounts/${hesap}/r2/buckets/${kaynakKova}/objects?${sorgu}`);
    if (!yanit.ok || !Array.isArray(yanit.result)) throw new Error('Kaynak R2 nesneleri listelenemedi.');
    nesneler.push(...yanit.result);
    if (yanit.result_info?.is_truncated && !yanit.result_info.cursor) throw new Error('R2 sayfalama imleci eksik.');
    imlec = yanit.result_info?.is_truncated ? yanit.result_info.cursor : undefined;
    if (imlec && imlecler.has(imlec)) throw new Error('R2 sayfalama imleci tekrarlandı.');
    if (imlec) imlecler.add(imlec);
  } while (imlec);
  return nesneler;
}

async function dbMedyaAnahtarlari() {
  const yanit = await cf(`/accounts/${hesap}/d1/database/${veritabani.database_id}/query`, {
    method: 'POST',
    body: JSON.stringify({
      sql: `SELECT anahtar FROM ilan_foto
            UNION SELECT video_anahtar AS anahtar FROM ilan_video
            UNION SELECT poster_anahtar AS anahtar FROM ilan_video`,
    }),
  });
  const satirlar = yanit.result?.[0]?.results;
  if (!yanit.ok || !Array.isArray(satirlar)) throw new Error('D1 medya referansları doğrulanamadı.');
  return satirlar.map((satir) => satir.anahtar).filter(Boolean).sort();
}

async function onKontrol() {
  const [kovalar, yonetilenAlan, ozelAlanlar, kilit] = await Promise.all([
    cf(`/accounts/${hesap}/r2/buckets?per_page=100`),
    cf(`/accounts/${hesap}/r2/buckets/${yedekKova}/domains/managed`),
    cf(`/accounts/${hesap}/r2/buckets/${yedekKova}/domains/custom`),
    cf(`/accounts/${hesap}/r2/buckets/${yedekKova}/lock`),
  ]);
  if (!kovalar.ok || !(kovalar.result?.buckets ?? []).some((kova) => kova.name === yedekKova)) throw new Error(`Ayrı R2 yedek kovası bulunamadı: ${yedekKova}`);
  if (!yonetilenAlan.ok || yonetilenAlan.result?.enabled !== false || !ozelAlanlar.ok || ozelAlanlar.result?.domains?.length !== 0) {
    throw new Error('Yedek kovası özel değil; işlem durduruldu.');
  }
  const kurallar = kilit.result?.rules ?? [];
  if (!kilit.ok || !kurallar.some((kural) => kural.enabled && !kural.prefix && kural.condition?.type === 'Age' && kural.condition.maxAgeSeconds >= 90 * 86400)) {
    throw new Error('Yedek kovasında tüm nesneleri en az 90 gün koruyan kilit kuralı yok.');
  }
}

let geciciDizin;
try {
  await onKontrol();
  const oncekiMedya = await dbMedyaAnahtarlari();
  const kaynaklar = await kaynakNesneleri();
  const kaynakAnahtarlar = new Set(kaynaklar.map((nesne) => nesne.key));
  if (kaynakAnahtarlar.size !== kaynaklar.length) throw new Error('Kaynak R2 listesinde yinelenen nesne var.');
  if (oncekiMedya.some((anahtar) => !kaynakAnahtarlar.has(anahtar))) {
    throw new Error('D1 kaydının işaret ettiği medya R2 kaynağında yok; yedekleme başlamadı.');
  }
  geciciDizin = await mkdtemp(join(tmpdir(), 'edm-yedek-'));
  const sqlDosyasi = join(geciciDizin, 'veritabani.sql');
  process.umask(0o077);
  await komut(process.execPath, ['scripts/d1-kurtarma.mjs', 'export', hedef, sqlDosyasi]);
  const sqlAnahtari = `${kokAnahtar}/veritabani.sql`;
  const sql = await r2KopyasiDogrula(sqlDosyasi, sqlAnahtari, geciciDizin, 'application/sql');

  const dosyalar = [];
  for (const [sira, nesne] of kaynaklar.entries()) {
    if (typeof nesne.key !== 'string' || !nesne.key) throw new Error('R2 nesne anahtarı eksik.');
    const kaynakDosya = join(geciciDizin, `r2-${sira}`);
    await komut('npx', ['wrangler', 'r2', 'object', 'get', `${kaynakKova}/${nesne.key}`, '--file', kaynakDosya, '--remote']);
    const yedekAnahtari = `${kokAnahtar}/gorseller/${nesne.key}`;
    const sonuc = await r2KopyasiDogrula(kaynakDosya, yedekAnahtari, geciciDizin, nesne.http_metadata?.contentType ?? 'application/octet-stream');
    dosyalar.push({ kaynakAnahtar: nesne.key, yedekAnahtari, ...sonuc });
    await rm(kaynakDosya, { force: true });
  }

  const sonrakiMedya = await dbMedyaAnahtarlari();
  const kopyalananlar = new Set(dosyalar.map((dosya) => dosya.kaynakAnahtar));
  if (JSON.stringify(oncekiMedya) !== JSON.stringify(sonrakiMedya) ||
      sonrakiMedya.some((anahtar) => !kopyalananlar.has(anahtar))) {
    throw new Error('Yedekleme sırasında D1 medya referansları değişti veya R2 nesnesi eksik; manifest yazılmadı.');
  }

  const manifest = {
    surum: 1, ortam: hedef, olusturma: new Date().toISOString(),
    veritabani: { ad: veritabani.database_name, kimlik: veritabani.database_id, yedekAnahtari: sqlAnahtari, ...sql },
    gorseller: { kaynakKova, adet: dosyalar.length, dosyalar },
  };
  const manifestDosyasi = join(geciciDizin, 'manifest.json');
  yedekManifestiniDogrula(manifest, hedef, `${kokAnahtar}/manifest.json`);
  await writeFile(manifestDosyasi, JSON.stringify(manifest, null, 2) + '\n', { mode: 0o600 });
  await r2KopyasiDogrula(manifestDosyasi, `${kokAnahtar}/manifest.json`, geciciDizin, 'application/json');
  console.log(`✓ ${hedef} yedeği doğrulandı: ${yedekKova}/${kokAnahtar}/manifest.json`);
  console.log(`  D1: ${sql.bayt} bayt · R2: ${dosyalar.length} nesne`);
} finally {
  if (geciciDizin) await rm(geciciDizin, { recursive: true, force: true });
  s3?.kapat();
}
