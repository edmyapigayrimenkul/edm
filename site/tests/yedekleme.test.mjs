import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ortam } from '../scripts/lib/cf.mjs';
import { yedekManifestiniDogrula, YEDEK_ORTAMLARI } from '../scripts/lib/yedek-kurallari.mjs';
import { yedekS3Baglantisi, yedekS3HedefiniDogrula } from '../scripts/yedekleme/r2.mjs';
import { yedekHatasiniBildir } from '../scripts/yedek-bildir.mjs';

test('CI eksik sırla yerel geniş yetkili .env anahtarına geri dönmez', async () => {
  const dizin = await mkdtemp(join(tmpdir(), 'edm-kimlik-test-'));
  try {
    const envYolu = join(dizin, '.env');
    await writeFile(envYolu, 'CLOUDFLARE_API_TOKEN=yerel-genis\nCLOUDFLARE_ACCOUNT_ID=yerel-hesap\n');
    assert.throws(() => ortam({ envYolu, degiskenler: { GITHUB_ACTIONS: 'true' } }), /API_TOKEN/);
    assert.throws(() => ortam({ envYolu, degiskenler: { CLOUDFLARE_API_TOKEN: '' } }), /API_TOKEN/);
    assert.deepEqual(ortam({ envYolu, degiskenler: { GITHUB_ACTIONS: 'true', CLOUDFLARE_API_TOKEN: 'okuma', CLOUDFLARE_ACCOUNT_ID: 'ci-hesap' } }), { token: 'okuma', hesap: 'ci-hesap', panelAdminEpostalari: '' });
    assert.equal(ortam({ envYolu, degiskenler: {} }).token, 'yerel-genis');
  } finally { await rm(dizin, { recursive: true, force: true }); }
});

test('S3 kimliği eksik CI koşusu REST yazımına dönmez', async () => {
  await assert.rejects(yedekS3Baglantisi('a'.repeat(32), { GITHUB_ACTIONS: 'true' }), /S3 kimliği eksik/);
  await assert.rejects(yedekS3Baglantisi('a'.repeat(32), { R2_YEDEK_ERISIM_KIMLIGI: 'kimlik' }), /S3 kimliği eksik/);
  assert.equal(await yedekS3Baglantisi('a'.repeat(32), {}), null);
});

test('S3 hedefi kaynak görsellere ve ortamlar arası yazıma izin vermez', () => {
  assert.throws(() => yedekS3HedefiniDogrula('edm-gorseller', 'production/a'), /geçersiz/);
  assert.throws(() => yedekS3HedefiniDogrula('edm-yedek', 'staging/a'), /geçersiz/);
  assert.throws(() => yedekS3HedefiniDogrula('edm-yedek-staging', 'production/a'), /geçersiz/);
  assert.doesNotThrow(() => yedekS3HedefiniDogrula('edm-yedek', 'production/a'));
});

const simdi = Date.parse('2026-10-02T10:00:00Z');
const kok = 'production/2026-10-02T08-00-00-000Z-abcd1234';
const anahtar = `${kok}/manifest.json`;
const manifestUret = () => ({
  surum: 1, ortam: 'production', olusturma: '2026-10-02T08:00:00Z',
  veritabani: { ad: YEDEK_ORTAMLARI.production.ad, kimlik: YEDEK_ORTAMLARI.production.kimlik, yedekAnahtari: `${kok}/veritabani.sql`, bayt: 330000, sha256: 'a'.repeat(64) },
  gorseller: { kaynakKova: 'edm-gorseller', adet: 1, dosyalar: [{ kaynakAnahtar: 'ilan/a.jpg', yedekAnahtari: `${kok}/gorseller/ilan/a.jpg`, bayt: 512, sha256: 'b'.repeat(64) }] },
});

test('yeni ve tutarlı manifest D1/R2 sağlık değerlerini döndürür', () => {
  assert.deepEqual(yedekManifestiniDogrula(manifestUret(), 'production', anahtar, simdi), { yasSaat: 2, sqlBayt: 330000, nesneAdedi: 1, r2Bayt: 512 });
  const bos = manifestUret(); bos.gorseller.adet = 0; bos.gorseller.dosyalar = [];
  assert.equal(yedekManifestiniDogrula(bos, 'production', anahtar, simdi).nesneAdedi, 0);
});

for (const [ad, boz] of [
  ['yanlış veritabanı', (m) => { m.veritabani.kimlik = YEDEK_ORTAMLARI.staging.kimlik; }],
  ['yanlış kaynak kova', (m) => { m.gorseller.kaynakKova = 'ezanplus'; }],
  ['sıfır bayt SQL', (m) => { m.veritabani.bayt = 0; }],
  ['eksik hash', (m) => { m.veritabani.sha256 = 'a'; }],
  ['başka arşivdeki dosya', (m) => { m.gorseller.dosyalar[0].yedekAnahtari = 'başka/a.jpg'; }],
  ['eksik nesne', (m) => { m.gorseller.adet = 2; }],
  ['yinelenen nesne', (m) => { m.gorseller.dosyalar.push({ ...m.gorseller.dosyalar[0] }); m.gorseller.adet = 2; }],
  ['gelecekteki tarih', (m) => { m.olusturma = '2026-10-02T10:10:00Z'; }],
]) test(`manifest ${ad} durumunu reddeder`, () => {
  const m = manifestUret(); boz(m);
  assert.throws(() => yedekManifestiniDogrula(m, 'production', anahtar, simdi), /bütünlük/);
});

test('gecikmiş yedek ve başka ortama ait manifest başarı sayılmaz', () => {
  const m = manifestUret(); m.olusturma = '2026-09-30T21:00:00Z';
  assert.throws(() => yedekManifestiniDogrula(m, 'production', anahtar, simdi), /36 saat/);
  assert.throws(() => yedekManifestiniDogrula(manifestUret(), 'staging', anahtar, simdi), /bütünlük/);
});

const bildirimOrtami = { CLOUDFLARE_BILDIRIM_API_TOKEN: 'test-gizli', CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), GITHUB_RUN_ID: '12345', GITHUB_REPOSITORY: 'edmyapigayrimenkul/edm' };
test('hata bildirimi sabit Doğukan adresine gider, anahtar metne girmez', async () => {
  const sonuc = await yedekHatasiniBildir({ ...bildirimOrtami, YEDEK_BILDIRIM_TESTI: '1' }, async (url, ayar) => {
    assert.ok(url.endsWith('/email/sending/send'));
    const m = JSON.parse(ayar.body);
    assert.equal(m.to, 'ozdogandogukan@gmail.com');
    assert.ok(m.subject.startsWith('[TEST]'));
    assert.ok(m.text.includes('/edmyapigayrimenkul/edm/actions/runs/12345'));
    assert.ok(!ayar.body.includes('test-gizli'));
    return Response.json({ success: true, result: { delivered: [m.to], queued: [], permanent_bounces: [] } });
  });
  assert.equal(sonuc, 'teslim-edildi');
});

test('API 200 dönse bile alıcı reddedilmişse bildirim başarılı sayılmaz', async () => {
  for (const result of [{}, { delivered: [], queued: [], permanent_bounces: ['ozdogandogukan@gmail.com'] }]) {
    await assert.rejects(yedekHatasiniBildir(bildirimOrtami, async () => Response.json({ success: true, result })), /kabul edilmedi/);
  }
});

test('kapalı Email Sending teşhis edilir; API hata metni günlüğe sızmaz', async () => {
  await assert.rejects(yedekHatasiniBildir(bildirimOrtami, async () => Response.json({
    success: false, errors: [{ code: 10203, message: 'test-gizli signed_url=https://ornek.invalid/secret' }],
  }, { status: 403 })), (hata) => {
    assert.match(hata.message, /HTTP 403.*Kod 10203.*Email Sending kapalı/);
    assert.ok(!hata.message.includes('test-gizli'));
    assert.ok(!hata.message.includes('signed_url'));
    return true;
  });
});

test('başka depo veya sahte koşu adresi ağ isteği göndermeden reddedilir', async () => {
  let istek = false;
  const getir = async () => { istek = true; };
  await assert.rejects(yedekHatasiniBildir({ ...bildirimOrtami, GITHUB_REPOSITORY: 'baska/depo' }, getir), /eşleşmesi/);
  await assert.rejects(yedekHatasiniBildir({ ...bildirimOrtami, GITHUB_RUN_ID: 'https://baska' }, getir), /eşleşmesi/);
  assert.equal(istek, false);
});
