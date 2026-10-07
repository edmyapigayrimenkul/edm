import assert from 'node:assert/strict';
import test from 'node:test';

import { SiteIcerikHatasi, siteIcerikTaslaginiHazirla, siteIcerikYayinKontrolu } from '../src/lib/icerik-yayini.ts';
import { bultenSitemapKayitlari, yayinlanmisIcerigiBulteneDonustur } from '../src/lib/bulten.ts';

const gecerli = () => ({
  disKimlik: 'postedm:haber:42',
  tur: 'bulten',
  slug: 'silivride-konut-piyasasi',
  baslik: 'Silivri konut piyasasında haftanın görünümü',
  spot: 'Bölgedeki ilan hareketlerini ve alıcıların en çok sorduğu konuları özetledik.',
  govde: 'Silivri konut piyasasında bu hafta görülen hareketleri, ilan sürelerini ve alıcı taleplerini kaynaklarıyla birlikte ele alıyoruz. Bu metin yatırım tavsiyesi değil, yerel piyasa gözlemidir.',
  kategori: 'Piyasa',
  kaynakAdlari: ['TÜİK'],
  kaynakUrlleri: ['https://data.tuik.gov.tr/'],
  sosyalUrlleri: ['https://www.instagram.com/p/ornek/'],
  orijinalYayin: '2026-09-18T09:00:00+03:00',
});

test('postedm içeriği her koşulda taslak oluşturur ve kaynakları korur', () => {
  const taslak = siteIcerikTaslaginiHazirla(gecerli(), new Date('2026-09-18T12:00:00Z'));
  assert.equal(taslak.durum, 'taslak');
  assert.equal(taslak.hukukiInceleme, 'uygulanmaz');
  assert.deepEqual(taslak.kaynakUrlleri, ['https://data.tuik.gov.tr/']);
  assert.equal(taslak.guncelleme, '2026-09-18T12:00:00.000Z');
});

test('hukuk, vergi, kredi, imar ve tapu içerikleri inceleme bekler', () => {
  const taslak = siteIcerikTaslaginiHazirla({ ...gecerli(), kategori: 'Tapu & Hukuk' });
  assert.equal(taslak.hukukiInceleme, 'gerekli');
  assert.equal(taslak.durum, 'taslak');
});

test('riskli ifade yalnız gövdede geçse bile inceleme bekler', () => {
  const taslak = siteIcerikTaslaginiHazirla({
    ...gecerli(),
    baslik: 'Silivri konut piyasası haftalık değerlendirmesi',
    spot: 'Yerel piyasa hareketlerini kaynaklarıyla birlikte değerlendiren bilgilendirme notu.',
    govde: 'Bu metin, alıcıların karar sürecini desteklemek için hazırlanmıştır. Tapu devri ve masrafları her işlemde yetkili uzmanlarla doğrulanmalıdır. Piyasa verileri dönemsel değişebileceği için kaynak tarihleri ayrıca kontrol edilmelidir.',
  });
  assert.equal(taslak.hukukiInceleme, 'gerekli');
});

test('kaynaksız veya iç ağ adresli içerik reddedilir', () => {
  assert.throws(
    () => siteIcerikTaslaginiHazirla({ ...gecerli(), kaynakUrlleri: [] }),
    (hata) => hata instanceof SiteIcerikHatasi && hata.alanlar.some((alan) => alan.alan === 'kaynakUrlleri')
  );
  assert.throws(
    () => siteIcerikTaslaginiHazirla({ ...gecerli(), kaynakUrlleri: ['http://127.0.0.1/gizli'] }),
    SiteIcerikHatasi
  );
});

test('dış kimlik ve slug sözleşmesi bozuksa kayıt hazırlanmaz', () => {
  assert.throws(
    () => siteIcerikTaslaginiHazirla({ ...gecerli(), disKimlik: 'haber-42', slug: '../yonetim' }),
    (hata) => hata instanceof SiteIcerikHatasi
      && hata.alanlar.some((alan) => alan.alan === 'disKimlik')
      && hata.alanlar.some((alan) => alan.alan === 'slug')
  );
});

test('inceleme bekleyen içerik açık insan onayı olmadan yayınlanamaz', () => {
  const taslak = siteIcerikTaslaginiHazirla({ ...gecerli(), kategori: 'Tapu & Hukuk' });
  assert.throws(() => siteIcerikYayinKontrolu(taslak), /inceleme bekliyor/);
  assert.doesNotThrow(() => siteIcerikYayinKontrolu(taslak, true));
});

test('yayınlanan postedm taslağı bültende kaynak atfıyla görünür', () => {
  const taslak = siteIcerikTaslaginiHazirla(gecerli(), new Date('2026-09-18T12:00:00Z'));
  const yazi = yayinlanmisIcerigiBulteneDonustur({
    ...taslak,
    id: 42,
    siteYayini: '2026-09-19T10:00:00.000Z',
    durum: 'yayinda',
  });
  assert.equal(yazi.slug, 'silivride-konut-piyasasi');
  assert.equal(yazi.kaynaklar?.[0]?.url, 'https://data.tuik.gov.tr/');
  assert.equal(yazi.sosyalBaglantilar?.[0]?.url, 'https://www.instagram.com/p/ornek/');
  assert.ok(yazi.okunmaSuresi.endsWith('dk okuma'));
  assert.ok(bultenSitemapKayitlari([{
    ...taslak,
    id: 42,
    siteYayini: '2026-09-19T10:00:00.000Z',
    durum: 'yayinda',
  }]).some((kayit) => kayit.yol === '/bulten/silivride-konut-piyasasi' && kayit.tarih === '2026-09-19'));
});
