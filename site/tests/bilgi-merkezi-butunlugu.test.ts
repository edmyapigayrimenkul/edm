import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BULTEN_INCELEME_TASLAKLARI, BULTEN_YAZILARI, bultenGetir, bultenAra, bultenleriBirlestir, kategoriBultenleri } from '../src/lib/bulten.ts';
import { SOZLUK_TERIMLERI, terimGetir, terimAra, harfeGoreTerimler } from '../src/lib/sozluk.ts';
import { BILMENIZ_GEREKENLER, REHBER_INCELEME_TASLAKLARI, rehberGetir, sutunaGoreRehberler } from '../src/lib/bilmeniz-gerekenler.ts';

test('Yalnız onaylı bülten yazıları yayımlanmalı ve taslaklar korunmalı', () => {
  assert.ok(BULTEN_INCELEME_TASLAKLARI.length >= 5, 'İnceleme taslakları korunmalı');
  assert.ok(BULTEN_YAZILARI.length >= 3, 'Doğrulanmış bülten yazıları bulunmalı');
  assert.equal(bultenGetir('ifraz-ve-tevhid-nedir-arazide-deger-artiran-islemler'), undefined, 'İnceleme bekleyen yazı URL ile açılamamalı');
  assert.ok(!bultenleriBirlestir([]).some((yazi) => yazi.slug === 'ifraz-ve-tevhid-nedir-arazide-deger-artiran-islemler'), 'İnceleme bekleyen yazı sayfa listesine karışmamalı');
  assert.equal(bultenGetir('kentsel-donusumde-uzlasmazsaniz-ne-olur-haklariniz-ve-surecler')?.kaynaklar[0]?.url, 'https://kdb.gov.tr/files/mevzuatdosya/2025581301335809.pdf', 'Kentsel dönüşüm yazısı güncel resmi kanun metnine dayanmalı');
  
  for (const yazi of BULTEN_YAZILARI) {
    assert.ok(yazi.slug && yazi.slug.length > 3, 'Geçersiz slug: ' + yazi.slug);
    assert.ok(yazi.baslik && yazi.baslik.length > 10, 'Geçersiz başlık: ' + yazi.baslik);
    assert.ok(yazi.spot && yazi.spot.length > 20, 'Yetersiz spot: ' + yazi.spot);
    assert.ok(yazi.paragraflar && yazi.paragraflar.length >= 3, 'Yetersiz paragraf sayısı: ' + yazi.slug);
    assert.ok(yazi.etiketler && yazi.etiketler.length > 0, 'Etiket eksik: ' + yazi.slug);
    assert.ok(yazi.yasalDayanak, 'Yasal dayanak eksik: ' + yazi.slug);
    assert.match(yazi.guncellemeTarihi, /^\d{4}-\d{2}-\d{2}$/, 'Güncelleme tarihi eksik: ' + yazi.slug);
    assert.ok(yazi.kapsamNotu.length > 80, 'Kapsam notu eksik: ' + yazi.slug);
    assert.ok(yazi.kaynaklar.length > 0, 'Birincil kaynak eksik: ' + yazi.slug);
    for (const kaynak of yazi.kaynaklar) assert.match(kaynak.url, /^https:\/\//, 'Kaynak HTTPS olmalı: ' + yazi.slug);
    
    const getirilen = bultenGetir(yazi.slug);
    assert.deepEqual(getirilen?.slug, yazi.slug);
  }

  const aramaSonucu = bultenAra('tapu harcı');
  assert.ok(aramaSonucu.length > 0, 'Tapu harcı araması doğrulanmış yazıyı döndürmeli');
  assert.equal(bultenAra('ifraz').length, 0, 'İnceleme taslağı aramada görünmemeli');

  const tapuYazilari = kategoriBultenleri('Tapu & Hukuk');
  assert.ok(tapuYazilari.length > 0, 'Tapu & Mülkiyet kategorisinde yazı olmalı');
});

test('Yalnız onaylı sözlük terimleri yayımlanmalı', () => {
  assert.ok(SOZLUK_TERIMLERI.length >= 3, 'En az üç doğrulanmış terim bulunmalı');
  assert.equal(terimGetir('kira-carpani-amortisman'), undefined, 'Doğrulanmamış terim yayımlanmamalı');
  assert.equal(terimGetir('tahliye-taahhutnamesi')?.slug, 'tahliye-taahhutnamesi', 'TBK 352 ile doğrulanan terim görünmeli');

  for (const t of SOZLUK_TERIMLERI) {
    assert.ok(t.slug, 'Slug eksik');
    assert.ok(t.terim, 'Terim adı eksik');
    assert.ok(t.harf && t.harf.length === 1, 'Geçersiz harf: ' + t.harf);
    assert.ok(t.kisaTanim && t.kisaTanim.length > 20, 'Yetersiz kısa tanım: ' + t.terim);
    assert.ok(t.hukukiKarsilik, 'Hukuki karşılık eksik: ' + t.terim);
    assert.ok(t.pratikteNeAnlamaGelir, 'Pratikte ne anlama gelir eksik: ' + t.terim);
    assert.ok(t.kritikUyari, 'Kritik uyarı kutusu eksik: ' + t.terim);
    assert.match(t.guncellemeTarihi, /^\d{4}-\d{2}-\d{2}$/, 'Güncelleme tarihi eksik: ' + t.terim);
    assert.ok(t.kapsamNotu.length > 80, 'Kapsam notu eksik: ' + t.terim);
    assert.ok(t.kaynaklar.length > 0, 'Birincil kaynak eksik: ' + t.terim);
    for (const kaynak of t.kaynaklar) assert.match(kaynak.url, /^https:\/\//, 'Kaynak HTTPS olmalı: ' + t.terim);

    const getirilen = terimGetir(t.slug);
    assert.equal(getirilen?.slug, t.slug);
  }

  const kHarfiTerimleri = harfeGoreTerimler('K');
  assert.ok(kHarfiTerimleri.length >= 2, 'K harfinde doğrulanmış iki terim bulunmalı');

  const bulunanlar = terimAra('kat mülkiyeti');
  assert.ok(bulunanlar.some((b) => b.slug === 'kat-mulkiyeti'));
});

test('Yalnız onaylı rehberler yayımlanmalı ve taslaklar korunmalı', () => {
  assert.ok(REHBER_INCELEME_TASLAKLARI.length >= 4, 'İnceleme taslakları korunmalı');
  assert.ok(BILMENIZ_GEREKENLER.length >= 2, 'Doğrulanmış rehber konuları bulunmalı');
  assert.equal(rehberGetir('tarla-ile-arsa-arasindaki-7-kritik-fark'), undefined, 'İnceleme bekleyen rehber URL ile açılamamalı');
  assert.equal(rehberGetir('kentsel-donusumde-uzlasma-ve-arsa-payi-satisi')?.kaynaklar[0]?.url, 'https://kdb.gov.tr/files/mevzuatdosya/2025581301335809.pdf', 'Kentsel dönüşüm rehberi güncel resmi kanun metnine dayanmalı');

  for (const r of BILMENIZ_GEREKENLER) {
    assert.ok(r.slug, 'Slug eksik');
    assert.ok(r.kod, 'Kod eksik');
    assert.ok(['S1', 'S2', 'S3', 'S4'].includes(r.sutun), 'Geçersiz sütun: ' + r.sutun);
    assert.ok(r.kritikKurallar && r.kritikKurallar.length >= 2, 'En az 2 kritik kural olmalı: ' + r.slug);
    assert.ok(r.cozumAdimlari && r.cozumAdimlari.length >= 2, 'En az 2 çözüm adımı olmalı: ' + r.slug);
    assert.ok(r.uzmanTavsiyesi, 'Uzman tavsiyesi eksik: ' + r.slug);
    assert.match(r.guncellemeTarihi, /^\d{4}-\d{2}-\d{2}$/, 'Güncelleme tarihi eksik: ' + r.slug);
    assert.ok(r.kapsamNotu.length > 80, 'Kapsam notu eksik: ' + r.slug);
    assert.ok(r.kaynaklar.length > 0, 'Birincil kaynak eksik: ' + r.slug);
    for (const kaynak of r.kaynaklar) assert.match(kaynak.url, /^https:\/\//, 'Kaynak HTTPS olmalı: ' + r.slug);

    const getirilen = rehberGetir(r.slug);
    assert.equal(getirilen?.slug, r.slug);
  }

  const s2Konulari = sutunaGoreRehberler('S2');
  assert.ok(s2Konulari.length > 0, 'S2 sütununda doğrulanmış bir rehber olmalı');
  assert.ok(sutunaGoreRehberler('S3').some((rehber) => rehber.slug === 'kentsel-donusumde-uzlasma-ve-arsa-payi-satisi'), 'Doğrulanmış dönüşüm rehberi doğru sütunda görünmeli');
});
