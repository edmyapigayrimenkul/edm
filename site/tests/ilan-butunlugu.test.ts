import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  gorunurIlanIdleri,
  iliskiliIlanIdleri,
  kaynakOzellikleriniUygula,
  kaynakSunumDuzeltmesi,
  mukerrerKanonikId,
  tasinmazGrupAnahtari,
} from '../src/lib/ilan-butunlugu.ts';
import { arsaToplamAlani, fiyatGruplariHesapla } from '../src/lib/portfoy-istatistikleri.ts';
import { alanOzellikleriniNormallestir, ilanAlanlariniCoz, alanOzellikleriniBirlestir } from '../src/lib/ilan-alanlari.ts';
import { alanGerekliMi, donanimGrupla, donanimGruplariSec, formdanIlanVerisi, halkaAcikOzellikler, ILAN_GRUPLARI, ISLEM_TURLERI, IlanFormHatasi, kimdenAlaniniSec, KIMDEN_ALANI, ozellikleriFormDegerlerine, kunyeGrupla } from '../src/lib/ilan-bilgileri.ts';
import { sahibindenAlanKaynaktaZorunlu } from '../src/lib/sahibinden-zorunlu-alanlar.generated.ts';
import { ilanKalitesiniDenetle, kaliteOzeti } from '../src/lib/ilan-kalite.ts';
import { kesinKoordinatiOku, kamuKonumuSec, ozelKonumAlanlariniGizle } from '../src/lib/ilan-konum.ts';
import { portalAlanEslemeTablosu, portalAktariminiOnizle, ucPortalOnizlemesi } from '../src/lib/portal-aktarim.ts';
import type { Ilan } from '../src/lib/ilanlar.ts';

test('Araptepe satış ve kiralama ilanları çift yönlü ilişkilidir', () => {
  assert.deepEqual(iliskiliIlanIdleri('19673570'), ['19797428']);
  assert.deepEqual(iliskiliIlanIdleri('19797428'), ['19673570']);
});

test('Araptepe kaynak düzeltmeleri işlem türüyle tutarlıdır', () => {
  const satilik = kaynakSunumDuzeltmesi('19673570');
  const kiralik = kaynakSunumDuzeltmesi('19797428');

  assert.match(satilik?.baslik ?? '', /Satılık/);
  assert.doesNotMatch(satilik?.baslik ?? '', /Kiralık/);
  assert.match(satilik?.aciklama ?? '', /satılıktır/);
  assert.match(kiralik?.baslik ?? '', /Kiralık/);
  assert.match(kiralik?.aciklama ?? '', /aylık kiralıktır/);
});

test('mükerrer tarla ana kayıt varken gizlenir ve kayıt kaybolursa geri görünür', () => {
  assert.equal(mukerrerKanonikId('19303282'), '19290394');
  assert.deepEqual([...gorunurIlanIdleri(['19290394', '19303282'])], ['19290394']);
  assert.deepEqual([...gorunurIlanIdleri(['19303282'])], ['19303282']);
});

test('teyitsiz mükerrer adayı iki ilan da yayında kalır', () => {
  assert.equal(mukerrerKanonikId('18522916'), null);
  assert.deepEqual([...gorunurIlanIdleri(['18522916', '18746132'])], ['18522916', '18746132']);
  assert.deepEqual([...gorunurIlanIdleri(['18522916'])], ['18522916']);
});

test('satış, aylık kira ve mülk grupları ayrı fiyat aralıkları üretir', () => {
  const gruplar = fiyatGruplariHesapla([
    { id: '1', islem: 'satilik', tipGrup: 'konut', fiyat: 5_000_000, m2: 100, paraBirimi: 'TRY' },
    { id: '2', islem: 'satilik', tipGrup: 'konut', fiyat: 7_000_000, m2: 120, paraBirimi: 'TRY' },
    { id: '3', islem: 'kiralik', tipGrup: 'konut', fiyat: 20_000, m2: 90, paraBirimi: 'TRY' },
    { id: '4', islem: 'satilik', tipGrup: 'arsa', fiyat: 2_000_000, m2: 1000, paraBirimi: 'TRY' },
    { id: '5', islem: 'satilik', tipGrup: 'arsa', fiyat: 120_000, m2: 800, paraBirimi: 'EUR' },
  ]);

  assert.deepEqual(gruplar.map((g) => [g.etiket, g.enDusuk, g.enYuksek, g.donem]), [
    ['Satılık konut', 5_000_000, 7_000_000, ''],
    ['Kiralık konut', 20_000, 20_000, '/ay'],
    ['Satılık arsa & tarla', 2_000_000, 2_000_000, ''],
    ['Satılık arsa & tarla', 120_000, 120_000, ''],
  ]);
});

test('arsa alanı konutları dışarıda bırakır ve aynı parsel kaydını bir kez toplar', () => {
  assert.equal(tasinmazGrupAnahtari('19303282'), tasinmazGrupAnahtari('19290394'));
  assert.equal(arsaToplamAlani([
    { id: '19290394', islem: 'satilik', tipGrup: 'arsa', fiyat: 3_350_000, m2: 9456, paraBirimi: 'TRY' },
    { id: '19303282', islem: 'satilik', tipGrup: 'arsa', fiyat: 4_900_000, m2: 9456, paraBirimi: 'TRY' },
    { id: 'konut', islem: 'satilik', tipGrup: 'konut', fiyat: 5_000_000, m2: 220, paraBirimi: 'TRY' },
  ]), 9456);
});

test('eski konut alanları açık yapı alanlarına dönüştürülür', () => {
  const ozellikler = alanOzellikleriniNormallestir({
    tipGrup: 'konut',
    m2: 150,
    ozellikler: { 'Net Metrekare': '130 m²' },
  });
  const alanlar = ilanAlanlariniCoz({ tipGrup: 'konut', m2: 150, ozellikler });

  assert.equal(ozellikler['Brüt Yapı Alanı'], '150 m²');
  assert.equal(ozellikler['Net Yapı Alanı'], '130 m²');
  assert.equal(ozellikler['Net Metrekare'], undefined);
  assert.equal(alanlar.karsilastirmaM2, 150);
  assert.equal(alanlar.birimFiyatTemeli, 'brüt yapı alanına göre');
});

test('villa arsa ölçüsü yapı brüt alanı gibi gösterilmez', () => {
  const ozellikler = alanOzellikleriniNormallestir({
    tipGrup: 'konut',
    m2: 463,
    ozellikler: { 'Brüt Metrekare': '463 m²', 'Arsa Alanı': '463 m²', 'Net Yapı Alanı': '320 m²' },
  });
  const alanlar = ilanAlanlariniCoz({ tipGrup: 'konut', m2: 463, ozellikler });

  assert.equal(alanlar.brutYapi, null);
  assert.equal(alanlar.netYapi, 320);
  assert.equal(alanlar.arsa, 463);
  assert.equal(alanlar.karsilastirmaM2, 320);
  assert.equal(alanlar.birimFiyatTemeli, 'net yapı alanına göre');
});

test('hisseli arazide birim fiyat satılan hisse alanına dayanır', () => {
  const ozellikler = alanOzellikleriniNormallestir({
    tipGrup: 'arsa',
    m2: 1000,
    ozellikler: { 'Toplam Parsel Alanı': '1.000 m²', 'Satılan Hisse Alanı': '400 m²' },
  });
  const alanlar = ilanAlanlariniCoz({ tipGrup: 'arsa', m2: 1000, ozellikler });

  assert.equal(alanlar.toplamParsel, 1000);
  assert.equal(alanlar.satilanHisse, 400);
  assert.equal(alanlar.karsilastirmaM2, 400);
  assert.equal(alanlar.birimFiyatTemeli, 'satılan hisse alanına göre');
});

test('kaynak düzeltmesi hatalı genel alanı silip hisseyi açık alana taşır', () => {
  const duzeltme = kaynakSunumDuzeltmesi('19393771');
  const ozellikler = alanOzellikleriniNormallestir({
    tipGrup: 'arsa',
    m2: 231,
    ozellikler: kaynakOzellikleriniUygula({ Metrekare: '231 m²' }, duzeltme),
  });
  const alanlar = ilanAlanlariniCoz({ tipGrup: 'arsa', m2: 231, ozellikler });

  assert.equal(alanlar.satilanHisse, 231);
  assert.equal(alanlar.toplamParsel, null);
  assert.equal(alanlar.birimFiyatTemeli, 'satılan hisse alanına göre');
});

test('büyük villa arsa ve yapı alanları birbirine karışmaz', () => {
  const duzeltme = kaynakSunumDuzeltmesi('18870737');
  const ozellikler = alanOzellikleriniNormallestir({
    tipGrup: 'konut',
    m2: 1100,
    ozellikler: kaynakOzellikleriniUygula({ 'Brüt Metrekare': '1.100 m²', 'Net Metrekare': '220 m²' }, duzeltme),
  });
  const alanlar = ilanAlanlariniCoz({ tipGrup: 'konut', m2: 1100, ozellikler });

  assert.equal(alanlar.brutYapi, null);
  assert.equal(alanlar.netYapi, 220);
  assert.equal(alanlar.arsa, 1042);
});

function temelForm(tipGrup: 'konut' | 'arsa'): FormData {
  const form = new FormData();
  const degerler: Record<string, string> = {
    baslik: 'Alan doğrulaması için yeterince uzun ilan başlığı',
    aciklama: 'Bu açıklama, sunucu tarafındaki alan tutarlılığı doğrulamasını sınamak için gereken seksen karakterden daha uzundur.',
    fiyat: '1000000', para_birimi: 'TRY', tip_grup: tipGrup, islem: 'satilik',
    tip: tipGrup === 'arsa' ? 'tarla' : 'daire', il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez',
    m2_brut: '100', yetki_durumu: 'bekliyor', mulk_sahibi_statu: 'T.C. vatandaşı', tapu_durumu: 'Kat Mülkiyetli', takas: 'Yok', ...(tipGrup === 'arsa' ? { kredi_uygunluk: 'Bilinmiyor' } : {}),
    balkon: 'Yok', site_icerisinde: 'Hayır', ...(tipGrup === 'konut' ? { bulundugu_kat: '1' } : {}),
  };
  if (tipGrup === 'konut') Object.assign(degerler, {
    m2_net: '85', oda: '3+1', banyo_sayisi: '1', bina_yasi: '0', kat_sayisi: '2',
    isitma_tipi: 'Kombi (Doğalgaz)', kullanim_durumu: 'Boş', mutfak_tipi: 'Kapalı',
    site_icerisinde: 'Hayır', otopark: 'Yok',
  });
  else Object.assign(degerler, { imar_durumu: 'Tarla', imar_dogrulama: 'bilinmiyor' });
  for (const [anahtar, deger] of Object.entries(degerler)) form.set(anahtar, deger);
  for (const grup of donanimGruplariSec(tipGrup, 'satilik', String(form.get('tip'))).filter((grup) => grup.gerekli)) form.append('donanim_secim_yok', grup.kimlik);
  return kaynakZorunluAlanlariDoldur(form);
}

/** Testte olumlu kayıt örneklerini, kategoriye ait Sahibinden zorunlu alanlarıyla tamamlar. */
function kaynakZorunluAlanlariDoldur(form: FormData, atlananAlanlar: string[] = []): FormData {
  const grup = String(form.get('tip_grup') ?? '');
  const islem = String(form.get('islem') ?? '');
  const tip = String(form.get('tip') ?? '');
  const sema = ILAN_GRUPLARI.find((aday) => aday.kimlik === grup);
  const degerler = Object.fromEntries([...form.entries()].map(([anahtar, deger]) => [anahtar, String(deger)]));

  for (const alan of sema?.bolumler.flatMap((bolum) => bolum.alanlar) ?? []) {
    if (atlananAlanlar.includes(alan.ad) || !sahibindenAlanKaynaktaZorunlu(alan.ad, grup, islem, tip, degerler)) continue;
    if (form.getAll(alan.ad).some((deger) => String(deger).trim())) continue;

    if (alan.tur === 'coklu') {
      const secenek = alan.secenekler?.[0]?.deger;
      if (secenek) form.append(alan.ad, secenek);
    } else if (alan.secenekler?.length) {
      form.set(alan.ad, alan.secenekler[0].deger);
    } else if (alan.tur === 'sayi' || alan.tur === 'ondalik') {
      form.set(alan.ad, String(Math.max(1, alan.enAz ?? 1)));
    } else if (alan.tur === 'tarih') {
      form.set(alan.ad, '2027-01-01');
    } else {
      form.set(alan.ad, 'Kaynak denetimi');
    }
  }
  return form;
}

/** Portalın zorunlu gizli durumunu ve boş detay gruplarına verilen açık yanıtı temsil eder. */
function portalVarsayilanlariniEkle(form: FormData): FormData {
  if (!form.has('mulk_sahibi_statu')) form.set('mulk_sahibi_statu', 'T.C. vatandaşı');
  const gruplar = donanimGruplariSec(String(form.get('tip_grup')), String(form.get('islem')), String(form.get('tip')));
  for (const grup of gruplar.filter((aday) => aday.gerekli)) {
    const donanimSecilmis = grup.ogeListesi.some((oge) => form.getAll('donanim').includes(oge));
    if (!donanimSecilmis && !form.getAll('donanim_secim_yok').includes(grup.kimlik)) {
      form.append('donanim_secim_yok', grup.kimlik);
    }
  }
  return form;
}

test('ortak Kimden alanı zorunlu seçenekleri doğrular ve ilan künyesinde görünür', () => {
  const eskiTaslak = formdanIlanVerisi(portalVarsayilanlariniEkle(temelForm('konut')));
  assert.equal(eskiTaslak.ozellikler[KIMDEN_ALANI.anahtar], 'Emlak Ofisinden');
  assert.equal(halkaAcikOzellikler(eskiTaslak.ozellikler)[KIMDEN_ALANI.anahtar], 'Emlak Ofisinden');

  const yeniForm = portalVarsayilanlariniEkle(temelForm('arsa'));
  yeniForm.set(KIMDEN_ALANI.ad, 'Emlak Ofisinden');
  const yeniIlan = formdanIlanVerisi(yeniForm);
  const fiyatKosullari = kunyeGrupla('arsa', yeniIlan.ozellikler, '1.000.000 ₺', null, null, yeniIlan.tip, yeniIlan.islem)
    .find((grup) => grup.kimlik === 'finans');
  assert.equal(fiyatKosullari?.satirlar.find((satir) => satir.etiket === KIMDEN_ALANI.etiket)?.deger, 'Emlak Ofisinden');

  assert.deepEqual(kimdenAlaniniSec('gunluk-konaklama', 'gunluk-kiralik', 'villa').secenekler?.map((x) => x.deger), ['Turizm İşletmesinden']);
  assert.deepEqual(kimdenAlaniniSec('isyeri', 'devren-satilik', 'enerji-santrali').secenekler?.map((x) => x.deger), ['Mağazadan']);
  assert.deepEqual(kimdenAlaniniSec('isyeri', 'devren-kiralik', 'oto-servis-bakim').secenekler?.map((x) => x.deger), ['Emlak Ofisinden', 'İnşaat Firmasından']);
  assert.deepEqual(kimdenAlaniniSec('isyeri', 'satilik', 'depo-antrepo').secenekler?.map((x) => x.deger), ['Emlak Ofisi']);

  yeniForm.set(KIMDEN_ALANI.ad, 'Bankadan');
  assert.throws(() => formdanIlanVerisi(yeniForm), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === KIMDEN_ALANI.ad)
  );

  yeniForm.set(KIMDEN_ALANI.ad, '');
  assert.throws(() => formdanIlanVerisi(yeniForm), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === KIMDEN_ALANI.ad)
  );
});

test('Kimden seçenekleri 336 Sahibinden tam formuna kategori bazında uyar', () => {
  const kaynak = JSON.parse(readFileSync(new URL('../../raporlar/sahibinden-sablonlari/tam-form-sablonlari.json', import.meta.url), 'utf8')) as {
    templates: Array<{ categoryId: string; path: string[]; sections: Array<{ elements: Array<{ canonicalName?: string; required?: boolean; enumValues?: Array<{ label: string }> }> }> }>;
  };
  const islemEslemesi: Record<string, string> = {
    'Satılık': 'satilik', 'Kiralık': 'kiralik', 'Devren Satılık': 'devren-satilik',
    'Devren Satılık Konut': 'devren-satilik', 'Devren Kiralık': 'devren-kiralik',
    'Kat Karşılığı Satılık': 'kat-karsiligi-satilik', 'Turistik Günlük Kiralık': 'gunluk-kiralik',
  };
  const tipEslemesi: Record<string, string> = {
    'Fabrika & Üretim Tesisi': 'fabrika', 'Plaza Katı & Ofisi': 'plaza-kati',
  };
  const slug = (metin: string) => metin.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD')
    .replace(/\p{Diacritic}/gu, '').replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  assert.equal(kaynak.templates.length, 336);
  for (const form of kaynak.templates) {
    const alanlar = form.sections.flatMap((bolum) => bolum.elements).filter((alan) => alan.canonicalName === 'kimden');
    assert.equal(alanlar.length, 1, `${form.categoryId} ${form.path.join(' > ')} Kimden alanı tek olmalı`);
    assert.equal(alanlar[0].required, true, `${form.categoryId} ${form.path.join(' > ')} Kimden zorunlu olmalı`);
    const kaynakSecenekleri = [...new Set((alanlar[0].enumValues ?? []).map((secenek) => secenek.label))].sort();
    const [kok, grup, kaynakIslem, kaynakTip] = form.path;
    const islem = islemEslemesi[kaynakIslem] ?? 'satilik';
    const tip = kaynakTip ? tipEslemesi[kaynakTip] ?? slug(kaynakTip) : grup === 'Arsa' ? slug(kaynakIslem) : 'daire';
    const edmGrup = grup === 'İş Yeri' ? 'isyeri'
      : grup === 'Konut' && kaynakIslem === 'Turistik Günlük Kiralık' ? 'gunluk-konaklama'
        : 'konut';
    const beklenen = kimdenAlaniniSec(edmGrup, islem, tip).secenekler?.map((secenek) => secenek.deger).sort();
    assert.deepEqual(beklenen, kaynakSecenekleri, `${form.categoryId} ${form.path.join(' > ')} Kimden seçenekleri`);
  }
});

test('villa şablonunun Sahibinden zorunlu teknik alanları sunucuda doğrulanır', () => {
  const form = temelForm('konut');
  form.set('tip', 'villa');
  form.delete('m2_net');
  form.delete('takas');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'm2_net') && hata.alanlar.some((x) => x.alan === 'takas')
  );
});

test('devre mülk alanları kayıttan ilan künyesine eksiksiz taşınır', () => {
  const form = new FormData();
  const degerler: Record<string, string> = {
    baslik: 'Silivri bölgesinde satılık devre mülk hakkı',
    aciklama: 'Devre mülk kullanım dönemi, tesis adı ve alan bilgileri satış ilanında açıkça belirtilmiştir. Daha fazla bilgi için ofisimizle iletişime geçebilirsiniz.',
    fiyat: '1000000', para_birimi: 'TRY', tip_grup: 'devre-mulk', tip: 'devre-mulk', islem: 'satilik',
    il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez', yetki_durumu: 'bekliyor',
    devre_mulk_tesisi: 'Aforia Thermal Residence', m2_brut: '90', m2_net: '75',
    devre_mulk_donem: '26. hafta', oda: '2', tapu_durumu: 'Devre Mülk Tapulu',
  };
  for (const [anahtar, deger] of Object.entries(degerler)) form.set(anahtar, deger);
  kaynakZorunluAlanlariDoldur(form);

  const veri = formdanIlanVerisi(portalVarsayilanlariniEkle(form));
  const ozellikler = alanOzellikleriniNormallestir({ tipGrup: veri.tipGrup, m2: veri.m2, ozellikler: veri.ozellikler });
  const alanlar = ilanAlanlariniCoz({ tipGrup: veri.tipGrup, m2: veri.m2, ozellikler });
  const kunye = kunyeGrupla(veri.tipGrup, ozellikler, '1.000.000 ₺', null, null, veri.tip, veri.islem);
  const satirlar = kunye.flatMap((bolum) => bolum.satirlar);

  assert.equal(alanlar.brutYapi, 90);
  assert.equal(alanlar.netYapi, 75);
  assert.equal(satirlar.find((satir) => satir.etiket === 'Devre mülk tesisi')?.deger, 'Aforia Thermal Residence');
  assert.equal(satirlar.find((satir) => satir.etiket === 'Kullanım dönemi')?.deger, '26. hafta');
  assert.equal(satirlar.find((satir) => satir.etiket === 'Tapu durumu')?.deger, 'Devre Mülk Tapulu');

  form.set('devre_mulk_donem', '53. hafta');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === 'devre_mulk_donem')
  );
});

test('günlük kiralık devre mülk ile apart pansiyon kendi zorunlu alanlarını kullanır', () => {
  const form = new FormData();
  const degerler: Record<string, string> = {
    baslik: 'Silivri bölgesinde günlük turistik konaklama',
    aciklama: 'Günlük konaklama için alan, kapasite ve oda bilgilerinin doğrulandığı ilan. Kullanım dönemini öğrenmek için ofisimizden bilgi alabilirsiniz.',
    fiyat: '6000', para_birimi: 'TRY', tip_grup: 'gunluk-konaklama', tip: 'devre-mulk', islem: 'gunluk-kiralik',
    il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez', yetki_durumu: 'bekliyor',
    gunluk_devre_mulk_tesisi: 'Afrodit Termal Apart', gunluk_devre_mulk_donem: '26. hafta', gunluk_devre_mulk_sure: '7 Gün',
    gunluk_izin_belge_no: '34-1234',
    m2_brut: '85', m2_net: '70', oda: '5', kisi_kapasitesi: '10', yatak_sayisi: '8', banyo_sayisi: '2',
  };
  for (const [anahtar, deger] of Object.entries(degerler)) form.set(anahtar, deger);
  portalVarsayilanlariniEkle(form);

  const devre = formdanIlanVerisi(form);
  assert.equal(devre.ozellikler['Kimden'], 'Turizm İşletmesinden');
  assert.equal(devre.oda, '5');
  assert.equal(devre.ozellikler['Devre Mülk Süresi'], '7 Gün');
  assert.equal(devre.ozellikler['Kişi Kapasitesi'], '10');
  assert.equal(devre.ozellikler['Turistik Kiralama İzin Belge No'], '34-1234');

  form.set('oda', '6');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === 'oda')
  );

  form.set('tip', 'apart-pansiyon');
  form.delete('oda');
  form.set('apart_oda', '6');
  form.set('bulundugu_kat', 'Villa Tipi');
  form.set('isitma_tipi', 'VRV');
  const apart = formdanIlanVerisi(form);
  assert.equal(apart.oda, '6');
  assert.equal(apart.ozellikler['Devre Mülk Süresi'], undefined);
  assert.equal(apart.ozellikler['Bulunduğu Kat'], 'Villa Tipi');
  assert.equal(apart.ozellikler['Isıtma Tipi'], 'VRV');
});

test('zorunlu nitelik grubu seçimi açıkça atlanmadıkça ilan kaydedilmez', () => {
  const form = temelForm('konut');
  form.delete('donanim_secim_yok');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'donanim-kaynak-cephe-0')
  );
});

test('kategoriye özgü kaynak detayları form ve ilan sayfasında aynı grupta kalır', () => {
  const daire = donanimGruplariSec('konut', 'satilik', 'daire');
  assert.deepEqual(daire.map((grup) => grup.baslik), [
    'Cephe', 'İç Özellikler', 'Dış Özellikler', 'Muhit', 'Ulaşım', 'Manzara', 'Konut Tipi', 'Engelliye ve Yaşlıya Uygun',
  ]);
  assert.ok(daire.find((grup) => grup.baslik === 'İç Özellikler')?.ogeListesi.includes('Ankastre Fırın'));
  assert.ok(donanimGruplariSec('arsa', 'satilik', 'tarla').some((grup) => grup.baslik === 'Altyapı'));
  assert.ok(donanimGruplariSec('turistik', 'satilik', 'otel').some((grup) => grup.baslik === 'Oda Tipleri'));
  assert.deepEqual(donanimGruplariSec('isyeri', 'devren-kiralik', 'kafe').map((grup) => grup.baslik), ['Detay Bilgisi']);
  assert.deepEqual(donanimGruplariSec('isyeri', 'satilik', 'atolye'), []);
  assert.deepEqual(donanimGrupla(['Ankastre Fırın', 'Deniz'], 'konut', 'satilik', 'daire').map((grup) => [grup.baslik, grup.ogeler]), [
    ['İç Özellikler', ['Ankastre Fırın']], ['Manzara', ['Deniz']],
  ]);
});

test('kaynak açılır seçenekleri konut, bina, turistik ve iş yeri şemalarında kabul edilir', () => {
  const alan = (grup: string, ad: string) => ILAN_GRUPLARI.find((x) => x.kimlik === grup)?.bolumler.flatMap((x) => x.alanlar).find((x) => x.ad === ad);
  const secenekler = (grup: string, ad: string) => alan(grup, ad)?.secenekler?.map((x) => x.deger) ?? [];
  assert.ok(secenekler('konut', 'balkon').includes('Var'));
  assert.ok(secenekler('konut', 'esya_durumu').includes('Evet'));
  assert.ok(secenekler('konut', 'yapi_tipi').includes('Yarı Kagir'));
  assert.ok(secenekler('bina', 'otopark').includes('Açık & Kapalı Otopark'));
  assert.ok(secenekler('turistik', 'yildiz_sinifi').includes('7'));
  assert.ok(secenekler('isyeri', 'isitma_tipi').includes('Fuel Oil / Kömür'));
  assert.ok(secenekler('isyeri', 'takas').includes('Evet'));
  assert.ok(alan('konut', 'takas')?.gerekli);
  assert.equal(alan('isyeri', 'takas')?.gerekli, undefined);
});

test('günlük kiralık konutta kişi ve yatak kapasitesi kaynak seçenekleriyle sunulur', () => {
  const konut = ILAN_GRUPLARI.find((grup) => grup.kimlik === 'konut')!;
  const alanlar = konut.bolumler.flatMap((bolum) => bolum.alanlar);
  const kisi = alanlar.find((alan) => alan.ad === 'misafir_kapasitesi')!;
  const yatak = alanlar.find((alan) => alan.ad === 'yatak_sayisi_gunluk')!;
  const oda = alanlar.find((alan) => alan.ad === 'oda')!;

  assert.equal(kisi.anahtar, 'Kişi Kapasitesi');
  assert.equal(kisi.tur, 'secim');
  assert.deepEqual(kisi.secenekler?.map((secenek) => secenek.deger), Array.from({ length: 12 }, (_, i) => String(i + 1)));
  assert.equal(kisi.gerekli, true);
  assert.deepEqual(yatak.secenekler?.map((secenek) => secenek.deger), Array.from({ length: 12 }, (_, i) => String(i + 1)));
  assert.equal(yatak.gerekli, true);
  assert.ok(!oda.secenekler?.some((secenek) => /^\d$/.test(secenek.deger)));
});

test('kaynakta kategoriye özgü zorunlu arazi ve iş yeri yükseklik alanları EDM’de doğru kapsamda', () => {
  const alan = (grup: string, ad: string) => ILAN_GRUPLARI.find((x) => x.kimlik === grup)?.bolumler.flatMap((x) => x.alanlar).find((x) => x.ad === ad);
  const arazi = alan('konut', 'arazi_m2');
  const turistikAcik = alan('turistik', 'm2_acik');
  const turistikKapali = alan('turistik', 'm2_brut');
  const atolyeGirisi = alan('isyeri', 'atolye_giris_yuksekligi');
  const etkinlikTavani = alan('isyeri', 'etkinlik_tavan_yuksekligi');

  assert.equal(arazi?.anahtar, 'Arazi m²');
  assert.equal(arazi?.gerekli, true);
  assert.deepEqual(arazi?.tipler, ['ciftlik-evi', 'kosk-konak', 'yali']);
  assert.equal(turistikAcik?.gerekli, true);
  assert.equal(turistikKapali?.gerekli, true);
  assert.ok(turistikKapali?.tipler?.includes('otel'));
  assert.deepEqual(atolyeGirisi?.tipler, ['atolye']);
  assert.equal(atolyeGirisi?.gerekli, true);
  assert.deepEqual(etkinlikTavani?.islemler, ['satilik', 'devren-satilik', 'devren-kiralik']);
  assert.equal(etkinlikTavani?.gerekli, true);
});

test('kategori şemasındaki işlem koşulları arayüz ve sunucu için aynı zorunluluğu üretir', () => {
  const alan = (grup: string, ad: string) => ILAN_GRUPLARI.find((x) => x.kimlik === grup)?.bolumler.flatMap((x) => x.alanlar).find((x) => x.ad === ad)!;
  assert.equal(alanGerekliMi(alan('konut', 'arazi_m2'), 'satilik', 'yali'), true);
  assert.equal(alanGerekliMi(alan('konut', 'arazi_m2'), 'gunluk-kiralik', 'yali'), false);
  assert.equal(alanGerekliMi(alan('konut', 'arazi_m2'), 'satilik', 'daire'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'kapali_alan'), 'devren-kiralik', 'akaryakit-istasyonu'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'kapali_alan'), 'devren-satilik', 'fabrika'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'ticari_bolum'), 'kiralik', 'dukkan-magaza'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'ticari_bolum'), 'devren-kiralik', 'dukkan-magaza'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'ticari_bolum'), 'devren-kiralik', 'fabrika'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'ticari_bolum_araligi'), 'devren-kiralik', 'atolye'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'ticari_bolum_araligi'), 'devren-kiralik', 'imalathane'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'binadaki_kat_sayisi'), 'kiralik', 'is-hani-kati-ofisi'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'binadaki_kat_sayisi'), 'satilik', 'is-hani-kati-ofisi'), false);
  assert.equal(alanGerekliMi(alan('konut', 'bina_yasi'), 'satilik', 'villa'), true);
  assert.equal(alanGerekliMi(alan('konut', 'bina_yasi'), 'gunluk-kiralik', 'villa'), false);
  assert.equal(alanGerekliMi(alan('konut', 'tapu_durumu'), 'kiralik', 'daire'), true);
  assert.equal(alanGerekliMi(alan('konut', 'tapu_durumu'), 'gunluk-kiralik', 'daire'), false);
  assert.equal(alanGerekliMi(alan('konut', 'bulundugu_kat'), 'satilik', 'daire'), true);
  assert.equal(alanGerekliMi(alan('konut', 'bulundugu_kat'), 'satilik', 'villa'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'tapu_durumu'), 'satilik', 'dukkan-magaza'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'tapu_durumu'), 'kiralik', 'ofis-buro'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'tapu_durumu'), 'devren-satilik', 'restoran-kafe'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'tapu_durumu'), 'devren-kiralik', 'restoran-kafe'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'bulundugu_kat'), 'satilik', 'ofis-buro'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'bulundugu_kat'), 'kiralik', 'ofis-buro'), true);
  assert.equal(alanGerekliMi(alan('bina', 'tapu_durumu'), 'satilik', 'plaza'), true);
  assert.equal(alanGerekliMi(alan('turistik', 'tapu_durumu'), 'satilik', 'otel'), true);
  assert.equal(alanGerekliMi(alan('turistik', 'tapu_durumu'), 'kiralik', 'plaj'), true);
  assert.equal(alanGerekliMi(alan('turistik', 'tapu_durumu'), 'satilik', 'plaj'), false);
  assert.equal(alanGerekliMi(alan('arsa', 'kredi_uygunluk'), 'satilik', 'tarla', 'arsa'), true);
  assert.equal(alanGerekliMi(alan('konut', 'kredi_uygunluk'), 'satilik', 'yali', 'konut'), true);
  assert.equal(alanGerekliMi(alan('konut', 'kredi_uygunluk'), 'satilik', 'villa', 'konut'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'kredi_uygunluk'), 'satilik', 'dukkan-magaza', 'isyeri'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'kredi_uygunluk'), 'satilik', 'ofis-buro', 'isyeri'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'kredi_uygunluk'), 'devren-satilik', 'hamam-sauna-spa', 'isyeri'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'kredi_uygunluk'), 'devren-kiralik', 'dukkan-magaza', 'isyeri'), false);
  assert.equal(alanGerekliMi(alan('turistik', 'kredi_uygunluk'), 'satilik', 'motel', 'turistik'), true);
  assert.equal(alanGerekliMi(alan('turistik', 'kredi_uygunluk'), 'kiralik', 'otel', 'turistik'), false);
  assert.equal(alanGerekliMi(alan('konut', 'mutfak_tipi'), 'devren-satilik', 'villa'), true);
  assert.equal(alanGerekliMi(alan('konut', 'otopark'), 'gunluk-kiralik', 'villa'), false);
  assert.equal(alanGerekliMi(alan('konut', 'balkon'), 'satilik', 'daire'), true);
  assert.equal(alanGerekliMi(alan('konut', 'balkon'), 'satilik', 'villa'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'gunluk_satis_litre'), 'kiralik', 'akaryakit-istasyonu'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'gunluk_satis_litre'), 'devren-kiralik', 'akaryakit-istasyonu'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'bina_yasi'), 'satilik', 'fabrika'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'bina_yasi'), 'devren-kiralik', 'ofis-buro'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'isitma_tipi'), 'devren-satilik', 'dukkan-magaza'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'isitma_tipi'), 'kiralik', 'ofis-buro'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'ticari_bolum_araligi'), 'satilik', 'imalathane'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'ticari_bolum_araligi'), 'kiralik', 'imalathane'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'ticari_bolum_araligi'), 'devren-kiralik', 'imalathane'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'ticari_bolum'), 'devren-satilik', 'fabrika'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'ticari_bolum'), 'devren-kiralik', 'fabrika'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'spor_tesisi_turu'), 'kiralik', 'spor-tesisi'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'spor_tesisi_turu'), 'satilik', 'spor-tesisi'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'spor_tesisi_turu'), 'devren-satilik', 'spor-tesisi'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'spor_tesisi_turu'), 'devren-kiralik', 'spor-tesisi'), false);
  assert.equal(alanGerekliMi(alan('isyeri', 'enerji_santrali_turu'), 'devren-satilik', 'enerji-santrali'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'spa_hizmet_cinsiyeti'), 'devren-satilik', 'hamam-sauna-spa'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'spa_hizmet_cinsiyeti'), 'kiralik', 'hamam-sauna-spa'), false);
});

test('Sahibinden kaynak zorunlulukları tüm formlarda uygulanır ve devre mülk durumu tesis seçimine bağlıdır', () => {
  const alan = (grup: string, ad: string) => ILAN_GRUPLARI.find((x) => x.kimlik === grup)?.bolumler.flatMap((x) => x.alanlar).find((x) => x.ad === ad)!;
  assert.equal(alanGerekliMi(alan('isyeri', 'isyeri_durumu'), 'satilik', 'atolye', 'isyeri'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'prova_oda_sayisi'), 'devren-kiralik', 'prova-kayit-studyosu', 'isyeri'), true);
  assert.equal(alanGerekliMi(alan('isyeri', 'etkinlik_tavan_yuksekligi'), 'devren-kiralik', 'toplanti-etkinlik-salonu', 'isyeri'), true);
  assert.equal(alanGerekliMi(alan('devre-mulk', 'devre_mulk_durumu'), 'satilik', 'devre-mulk', 'devre-mulk', { devre_mulk_tesisi: 'Aforia Thermal Residence' }), true);
  assert.equal(alanGerekliMi(alan('devre-mulk', 'devre_mulk_durumu'), 'satilik', 'devre-mulk', 'devre-mulk', { devre_mulk_tesisi: 'Afyon Korel Thermal' }), false);
});

test('günlük konaklamada banyo seçeneği kaynak şablonundaki 6 üzeri değerini içerir', () => {
  const banyo = ILAN_GRUPLARI.find((grup) => grup.kimlik === 'gunluk-konaklama')?.bolumler
    .flatMap((bolum) => bolum.alanlar).find((alan) => alan.ad === 'banyo_sayisi');
  assert.ok(banyo?.secenekler?.some((secenek) => secenek.deger === '6 Üzeri'));
});

test('net alanın brüt alandan büyük olması sunucuda reddedilir', () => {
  const form = temelForm('konut');
  form.set('m2_net', '120');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'm2_net')
  );
});

test('satılan hisse toplam parselden büyük olamaz', () => {
  const form = temelForm('arsa');
  form.set('hisse_m2', '120');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'hisse_m2')
  );
});

test('villa portal ayrıntıları kategori şemasında korunur ve eski mutfak kutusu taşınır', () => {
  const form = temelForm('konut');
  form.set('tip', 'villa');
  form.set('mutfak_tipi', 'Açık (Amerikan)');
  form.set('konut_kat_tipi', 'Tripleks');
  form.set('enerji_kimlik_belgesi', 'D');
  form.set('mulk_sahibi_statu', 'T.C. vatandaşı');
  form.append('donanim', 'Mutfak Doğalgazı');
  form.append('donanim', 'Yüz Tanıma / Parmak İzi');
  form.append('donanim', 'Araç Şarj İstasyonu');
  form.append('donanim', 'Denize Sıfır');
  form.append('donanim', 'Otobüs Durağı');
  form.append('donanim', 'Deniz Manzarası');
  form.append('donanim', 'Giriş / Rampa');

  const veri = formdanIlanVerisi(portalVarsayilanlariniEkle(form));
  assert.equal(veri.ozellikler['Mutfak Tipi'], 'Açık (Amerikan)');
  assert.equal(veri.ozellikler['Konut Kat Tipi'], 'Tripleks');
  assert.equal(veri.ozellikler['Enerji Kimlik Belgesi'], 'D');
  assert.equal(veri.ozellikler['Mülk Sahibi Statüsü'], 'T.C. vatandaşı');
  assert.equal(halkaAcikOzellikler(veri.ozellikler)['Mülk Sahibi Statüsü'], undefined);
  assert.deepEqual(veri.donanim, [
    'Mutfak Doğalgazı', 'Yüz Tanıma / Parmak İzi', 'Araç Şarj İstasyonu', 'Denize Sıfır',
    'Otobüs Durağı', 'Deniz Manzarası', 'Giriş / Rampa',
  ]);

  const eski = ozellikleriFormDegerlerine({}, ['Açık Mutfak', 'Özel Havuz'], 'konut');
  assert.equal(eski.mutfak_tipi, 'Açık (Amerikan)');
  assert.deepEqual(eski.donanim, ['Özel Havuz']);
});

test('biçimlenmiş fiyat ve sezonluk yazlık bilgileri sunucuda doğru kaydedilir', () => {
  const form = temelForm('konut');
  form.set('islem', 'sezonluk-kiralik');
  form.set('tip', 'yazlik');
  form.set('fiyat', '13.500.000');
  form.set('sezon_baslangic', '2027-06-01');
  form.set('sezon_bitis', '2027-09-30');
  form.set('minimum_sezon_suresi', '2');
  form.append('sezon_giderleri', 'Su');
  form.append('sezon_giderleri', 'Havuz / bahçe bakımı');

  const veri = formdanIlanVerisi(portalVarsayilanlariniEkle(form));
  assert.equal(veri.fiyat, 13_500_000);
  assert.equal(veri.islem, 'sezonluk-kiralik');
  assert.equal(veri.tip, 'yazlik');
  assert.equal(veri.kategori, 'Sezonluk Kiralık Yazlık');
  assert.equal(veri.ozellikler['Sezon Başlangıcı'], '2027-06-01');
  assert.equal(veri.ozellikler['Sezon Bitişi'], '2027-09-30');
  assert.equal(veri.ozellikler['Minimum Sezonluk Kiralama'], '2 hafta');
  assert.equal(veri.ozellikler['Sezon Bedeline Dahil'], 'Su, Havuz / bahçe bakımı');
});

test('ters sezon tarihleri ve aralıktan uzun minimum kiralama reddedilir', () => {
  const tersTarih = temelForm('konut');
  tersTarih.set('islem', 'sezonluk-kiralik');
  tersTarih.set('tip', 'yazlik');
  tersTarih.set('sezon_baslangic', '2027-09-30');
  tersTarih.set('sezon_bitis', '2027-06-01');
  assert.throws(() => formdanIlanVerisi(tersTarih), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'sezon_bitis')
  );

  const uzunSure = temelForm('konut');
  uzunSure.set('islem', 'sezonluk-kiralik');
  uzunSure.set('tip', 'yazlik');
  uzunSure.set('sezon_baslangic', '2027-07-01');
  uzunSure.set('sezon_bitis', '2027-07-14');
  uzunSure.set('minimum_sezon_suresi', '3');
  assert.throws(() => formdanIlanVerisi(uzunSure), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'minimum_sezon_suresi')
  );
});

test('alt mülk türü koşulu kamp alanında otel alanlarını istemez ve ilgisiz veriyi yok sayar', () => {
  const form = new FormData();
  const degerler: Record<string, string> = {
    baslik: 'Silivri çevresinde faal ve ruhsatlı kamp alanı',
    aciklama: 'Çadır ve karavan konaklamasına uygun, ortak kullanım alanları bulunan tesis için ayrıntılı bilgi ofisimizden alınabilir.',
    fiyat: '12500000', para_birimi: 'TRY', tip_grup: 'turistik', islem: 'satilik',
    tip: 'kamp-alani', il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez',
    m2_brut: '240', toplam_arazi_donum: '5', kamp_unite_adedi: '18', oda_adedi: '99', tapu_durumu: 'Kat Mülkiyetli', yetki_durumu: 'bekliyor',
  };
  for (const [anahtar, deger] of Object.entries(degerler)) form.set(anahtar, deger);

  const veri = formdanIlanVerisi(portalVarsayilanlariniEkle(form));
  assert.equal(veri.ozellikler['Kamp Ünitesi'], '18');
  assert.equal(veri.ozellikler['Toplam Arazi Alanı'], '5 dönüm');
  assert.equal(veri.ozellikler['Toplam Kapalı Alan'], undefined);
  assert.equal(veri.ozellikler['Oda Adedi'], undefined);
  assert.equal(veri.tip, 'kamp-alani');
});

test('plaj ve motel ilanları kaynakta tanımlı farklı alanları doğrular', () => {
  const form = new FormData();
  const degerler: Record<string, string> = {
    baslik: 'Silivri kıyısında kiralık plaj işletmesi',
    aciklama: 'Kiralık plaj işletmesinin açık alanı ve kişi kapasitesi ayrı alanlarda doğrulanmıştır. İşletme koşulları için ofisimizden ayrıntılı bilgi alınabilir.',
    fiyat: '350000', para_birimi: 'TRY', tip_grup: 'turistik', tip: 'plaj', islem: 'kiralik', kredi_uygunluk: 'Uygun',
    il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez', plaj_m2: '850', plaj_kapasite: '250', tapu_durumu: 'Kat Mülkiyetli', yetki_durumu: 'bekliyor',
  };
  for (const [anahtar, deger] of Object.entries(degerler)) form.set(anahtar, deger);
  kaynakZorunluAlanlariDoldur(form);
  portalVarsayilanlariniEkle(form);
  const plaj = formdanIlanVerisi(form);
  assert.equal(plaj.ozellikler['Plaj Alanı'], '850 m²');
  assert.equal(plaj.ozellikler['Plaj Kapasitesi'], '250');
  assert.equal(plaj.ozellikler['Toplam Kapalı Alan'], undefined);

  form.set('plaj_m2', '99');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === 'plaj_m2')
  );
  form.set('plaj_m2', '850');
  form.set('islem', 'satilik');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === 'tip')
  );

  form.set('tip', 'motel');
  form.set('m2_brut', '1200');
  form.set('m2_acik', '450');
  form.set('kat_sayisi', '3');
  form.set('bina_yasi', '5');
  form.set('oda_adedi', '24');
  form.set('yapi_durumu', 'İkinci El');
  kaynakZorunluAlanlariDoldur(form);
  portalVarsayilanlariniEkle(form);
  const motel = formdanIlanVerisi(form);
  assert.equal(motel.ozellikler['Oda Adedi'], '24');
  assert.equal(motel.ozellikler['Plaj Alanı'], undefined);
});

test('alt tür koşulları katalogdaki tanımlı türleri kullanır', () => {
  const tumAltTurler = new Set(ILAN_GRUPLARI.flatMap((grup) => grup.altTipler.map((tip) => tip.deger)));
  for (const grup of ILAN_GRUPLARI) {
    for (const alan of grup.bolumler.flatMap((bolum) => bolum.alanlar)) {
      for (const tip of alan.tipler ?? []) {
        assert.ok(tumAltTurler.has(tip), `${grup.kimlik}.${alan.ad} bilinmeyen alt tür kullanıyor: ${tip}`);
      }
    }
  }
});

test('konut arsa alanı yalnız müstakil yaşam türlerinde görünür ve daire kaydına sızmaz', () => {
  const konut = ILAN_GRUPLARI.find((grup) => grup.kimlik === 'konut')!;
  const arsaAlani = konut.bolumler.flatMap((bolum) => bolum.alanlar).find((alan) => alan.ad === 'arsa_m2')!;
  assert.deepEqual(arsaAlani.tipler, ['villa', 'mustakil-ev', 'yazlik', 'koy-evi', 'prefabrik-ev']);

  const daire = temelForm('konut');
  daire.set('arsa_m2', '900');
  assert.equal(formdanIlanVerisi(daire).ozellikler['Arsa Alanı'], undefined);

  const sadeceDaireArsaAlani = temelForm('konut');
  sadeceDaireArsaAlani.delete('m2_brut');
  sadeceDaireArsaAlani.set('arsa_m2', '900');
  assert.throws(() => formdanIlanVerisi(sadeceDaireArsaAlani), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'm2_brut')
  );

  const villa = temelForm('konut');
  villa.set('tip', 'villa');
  villa.set('arsa_m2', '900');
  assert.equal(formdanIlanVerisi(villa).ozellikler['Arsa Alanı'], '900 m²');
});

test('proje konut ve ticari ünite alanları proje türüne göre ayrılır', () => {
  const proje = ILAN_GRUPLARI.find((grup) => grup.kimlik === 'proje')!;
  const alanlar = proje.bolumler.flatMap((bolum) => bolum.alanlar);
  assert.deepEqual(alanlar.find((alan) => alan.ad === 'konut_adedi')?.tipler, ['konut-projesi', 'villa-projesi', 'karma-proje']);
  assert.deepEqual(alanlar.find((alan) => alan.ad === 'ticari_adet')?.tipler, ['ticari-proje', 'karma-proje']);

  const form = new FormData();
  for (const [alan, deger] of Object.entries({
    baslik: 'Silivri ticari proje üniteleri ve satış bilgileri',
    aciklama: 'Bu ticari proje için alan, teslim ve satış bilgileri kaynak belgelerle doğrulanarak yönetim ekibi tarafından sunulacaktır.',
    fiyat: '1000000', para_birimi: 'TRY', tip_grup: 'proje', islem: 'satilik', tip: 'ticari-proje',
    il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez', m2_brut: '100', yetki_durumu: 'bekliyor',
    proje_asamasi: 'Planlama', satis_durumu: 'Satışta', teslim_durumu: 'Planlanıyor',
    toplam_unite: '10', satilik_unite: '8', konut_adedi: '99', ticari_adet: '10',
  })) form.set(alan, deger);
  const veri = formdanIlanVerisi(portalVarsayilanlariniEkle(form));
  assert.equal(veri.ozellikler['Konut Adedi'], undefined);
  assert.equal(veri.ozellikler['Ticari Ünite Adedi'], '10');
});

test('her alt türün halka açık teknik alanı ilan detay künyesinde görünür', () => {
  for (const grup of ILAN_GRUPLARI) {
    const tumAlanlar = grup.bolumler.flatMap((bolum) => bolum.alanlar).filter((alan) => alan.halkaAcik !== false);
    for (const tip of grup.altTipler) {
      const gecerliAlanlar = tumAlanlar.filter((alan) => !alan.tipler || alan.tipler.includes(tip.deger));
      const ozellikler = Object.fromEntries(gecerliAlanlar.map((alan) => [alan.anahtar, alan.tur === 'sayi' || alan.tur === 'ondalik' ? '1' : 'Örnek değer']));
      const detayEtiketleri = new Set(
        kunyeGrupla(grup.kimlik, ozellikler, '1.000.000 ₺', null, null, tip.deger)
          .flatMap((kunyeGrubu) => kunyeGrubu.satirlar)
          .map((satir) => satir.etiket)
      );
      for (const alan of gecerliAlanlar) {
        assert.ok(
          detayEtiketleri.has(alan.etiket),
          `${grup.kimlik}.${tip.deger} için ${alan.anahtar} ilan detayında görünmüyor.`
        );
      }
    }
  }
});

test('ilan detayı fiyat koşullarını işlem türüne göre süzer ve uyumsuz alanları sızdırmaz', () => {
  const eskiKayit = {
    Depozito: '20.000 ₺',
    'Aylık Kira Getirisi': '45.000 ₺',
    'Sezon Başlangıcı': '2027-06-01',
    'Net Yapı Alanı': '85 m²',
    'Eski Portal Notu': 'Kaynak notu',
  };

  const satilik = kunyeGrupla('konut', eskiKayit, '4.500.000 ₺', null, null, 'daire', 'satilik');
  const satilikMetni = satilik.flatMap((grup) => grup.satirlar).map((satir) => `${satir.etiket}: ${satir.deger}`);
  assert.ok(satilikMetni.includes('Aylık kira getirisi: 45.000 ₺'));
  assert.ok(satilikMetni.includes('Net kullanım alanı: 85 m²'));
  assert.ok(satilikMetni.includes('Eski Portal Notu: Kaynak notu'));
  assert.ok(!satilikMetni.some((satir) => /Depozito|Sezon başlangıcı/.test(satir)));

  const kiralik = kunyeGrupla('konut', eskiKayit, '20.000 ₺ / ay', null, null, 'daire', 'kiralik');
  const kiralikMetni = kiralik.flatMap((grup) => grup.satirlar).map((satir) => `${satir.etiket}: ${satir.deger}`);
  assert.ok(kiralikMetni.includes('Depozito: 20.000 ₺'));
  assert.ok(!kiralikMetni.some((satir) => /Aylık kira getirisi|Sezon başlangıcı/.test(satir)));
});

test('kat karşılığı arsa fiyat olmadan kaydedilir ve ayrı işlem etiketi taşır', () => {
  const form = temelForm('arsa');
  form.set('islem', 'kat-karsiligi-satilik');
  form.delete('fiyat');

  const veri = formdanIlanVerisi(form);
  assert.equal(veri.fiyat, null);
  assert.equal(veri.islem, 'kat-karsiligi-satilik');
  assert.equal(veri.kategori, 'Kat Karşılığı Satılık Tarla');
});

test('konutta devren satılık yalnız daire ve villa alt türlerinde kabul edilir', () => {
  assert.ok(ISLEM_TURLERI.find((islem) => islem.deger === 'devren-satilik')?.gruplar.includes('konut'));
  const villa = temelForm('konut');
  villa.set('islem', 'devren-satilik');
  villa.set('tip', 'villa');
  villa.set('kalan_odeme_tutari', '250000');
  villa.set('kalan_taksit', '12');
  portalVarsayilanlariniEkle(villa);
  const sonuc = formdanIlanVerisi(villa);
  assert.equal(sonuc.kategori, 'Devren Satılık Villa');
  assert.equal(sonuc.ozellikler['Kalan Ödeme Tutarı'], '250.000 ₺');
  assert.equal(sonuc.ozellikler['Kalan Taksit'], '12');

  const yazlik = temelForm('konut');
  yazlik.set('islem', 'devren-satilik');
  yazlik.set('tip', 'yazlik');
  assert.throws(() => formdanIlanVerisi(yazlik), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'tip')
  );
});

test('iş yeri devren işletme kataloğu ve restoran kapasitesi kayıtta korunur', () => {
  const isyeri = ILAN_GRUPLARI.find((grup) => grup.kimlik === 'isyeri')!;
  assert.ok(isyeri.altTipler.length >= 80);
  for (const tip of ['restoran-kafe', 'eczane', 'oto-servis-bakim', 'zuccaciye']) {
    assert.ok(isyeri.altTipler.some((secenek) => secenek.deger === tip), `${tip} iş yeri kataloğunda yok`);
  }

  const form = new FormData();
  const degerler: Record<string, string> = {
    baslik: 'Silivri merkezde devren satılık restoran ve lokanta',
    aciklama: 'Cadde üzerinde, mutfağı ve servis alanı hazır, masa düzeni kurulmuş faal işletmenin ayrıntıları ofisten alınabilir.',
    fiyat: '2500000', para_birimi: 'TRY', tip_grup: 'isyeri', islem: 'devren-satilik',
    tip: 'restoran-kafe', il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez', m2_brut: '240',
    ticari_bolum: '4', bina_yasi: '5-10', isitma_tipi: 'Klima', tapu_durumu: 'Kat Mülkiyetli', masa_sayisi: '28',
    kisi_kapasitesi: '96', yetki_durumu: 'bekliyor',
  };
  for (const [anahtar, deger] of Object.entries(degerler)) form.set(anahtar, deger);
  form.append('donanim', 'İçki Ruhsatı');
  form.append('donanim', 'Wireless');

  kaynakZorunluAlanlariDoldur(form);
  const veri = formdanIlanVerisi(portalVarsayilanlariniEkle(form));
  assert.equal(veri.ozellikler['Masa Sayısı'], '28');
  assert.equal(veri.ozellikler['Kişi Kapasitesi'], '96 kişi');
  assert.deepEqual(veri.donanim, ['İçki Ruhsatı', 'Wireless']);
});

test('iş yeri kaynak alanları işlem ve alt türe göre kaydedilip ilan künyesinde görünür', () => {
  const form = new FormData();
  const degerler: Record<string, string> = {
    baslik: 'Silivri merkezde satılık iş yeri apartman dairesi',
    aciklama: 'İş yeri kullanımı için uygun apartman dairesinin oda, banyo ve kiracı bilgileri teyit edilerek ilan detayına işlenmiştir.',
    fiyat: '2500000', para_birimi: 'TRY', tip_grup: 'isyeri', islem: 'satilik', tip: 'apartman-dairesi',
    il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez', m2_brut: '120', ticari_bolum: '4', bulundugu_kat: '1', tapu_durumu: 'Kat Mülkiyetli', yetki_durumu: 'bekliyor',
    kiracili: 'Evet', isyeri_banyo_sayisi: '2', isyeri_yapi_durumu: 'İkinci El', bina_yasi: '0', isitma_tipi: 'Yok', kredi_uygunluk: 'Uygun',
    bufe_yapi_tipi: 'Kütük',
  };
  for (const [anahtar, deger] of Object.entries(degerler)) form.set(anahtar, deger);
  kaynakZorunluAlanlariDoldur(form);
  const ilan = formdanIlanVerisi(portalVarsayilanlariniEkle(form));
  const kunye = kunyeGrupla(ilan.tipGrup, ilan.ozellikler, '2.500.000 ₺', null, null, ilan.tip, ilan.islem);
  const satirlar = kunye.flatMap((bolum) => bolum.satirlar);
  assert.equal(satirlar.find((satir) => satir.etiket === 'Kiracılı mı?')?.deger, 'Evet');
  assert.equal(satirlar.find((satir) => satir.etiket === 'Banyo sayısı')?.deger, '2');
  assert.equal(satirlar.find((satir) => satir.etiket === 'Yapının durumu')?.deger, 'İkinci El');
  assert.equal(ilan.ozellikler['Yapı Tipi'], undefined);

  form.set('isyeri_banyo_sayisi', '10');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === 'isyeri_banyo_sayisi')
  );
  form.set('isyeri_banyo_sayisi', '2');
  form.set('kiracili', 'Bilinmiyor');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === 'kiracili')
  );
});

test('iş yeri mülk ve devren kataloglarında ortak alt türler dört işlemde de seçilir ve kaydedilir', () => {
  const isyeri = ILAN_GRUPLARI.find((grup) => grup.kimlik === 'isyeri')!;
  const ortakTipler = [
    'ciftlik', 'hamam-sauna-spa', 'maden-ocagi', 'okul', 'pazar-yeri',
    'spor-tesisi', 'toplanti-etkinlik-salonu',
  ];
  const islemler = ['satilik', 'kiralik', 'devren-satilik', 'devren-kiralik'];
  for (const tip of ortakTipler) {
    const secenek = isyeri.altTipler.find((aday) => aday.deger === tip);
    assert.ok(secenek, `${tip} katalogda yok`);
    assert.deepEqual(secenek.islemler, islemler, `${tip} işlem seçenekleri eksik`);
  }

  for (const [tip, islem] of [['ciftlik', 'devren-satilik'], ['spor-tesisi', 'devren-kiralik']]) {
    const form = new FormData();
    const degerler: Record<string, string> = {
      baslik: 'Silivri merkezde devren işletme ve ticari mülk',
      aciklama: 'Konumu ve kullanım imkânlarıyla öne çıkan bu faal ticari mülkün ayrıntılı bilgileri ve yerinde inceleme için ofisimizle görüşebilirsiniz.',
      fiyat: '2500000', para_birimi: 'TRY', tip_grup: 'isyeri', islem, tip,
      il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez', m2_brut: '240', tapu_durumu: 'Kat Mülkiyetli',
      ...(tip === 'ciftlik' ? { kapali_alan: '180', m2_acik: '2500' } : {}),
      ticari_bolum: '4', bina_yasi: '5-10', isitma_tipi: 'Klima', yetki_durumu: 'bekliyor',
    };
    for (const [anahtar, deger] of Object.entries(degerler)) form.set(anahtar, deger);
    kaynakZorunluAlanlariDoldur(form);
    const veri = formdanIlanVerisi(portalVarsayilanlariniEkle(form));
    assert.equal(veri.tip, tip);
    assert.equal(veri.islem, islem);
  }
});

test('plaza için daire sayısı istenmez, apartmanda zorunlu kalır', () => {
  const form = new FormData();
  const degerler: Record<string, string> = {
    baslik: 'Silivri merkezde komple satılık ticari plaza',
    aciklama: 'Çok katlı ticari yapı, ofis ve ortak kullanım alanlarıyla birlikte satılıktır; bağımsız bölümler ve teknik ayrıntılar için ofisimizden bilgi alınabilir.',
    fiyat: '45000000', para_birimi: 'TRY', tip_grup: 'bina', islem: 'satilik',
    tip: 'plaza', il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez',
    m2_brut: '2000', kat_sayisi: '8', bina_yasi: '5-10', tapu_durumu: 'Kat Mülkiyetli',
    isitma_tipi: 'Merkezi (Doğalgaz)', asansor: 'Var', otopark: 'Kapalı',
    yetki_durumu: 'bekliyor',
  };
  for (const [anahtar, deger] of Object.entries(degerler)) form.set(anahtar, deger);
  kaynakZorunluAlanlariDoldur(form);
  portalVarsayilanlariniEkle(form);
  assert.equal(formdanIlanVerisi(form).tip, 'plaza');

  form.set('tip', 'apartman');
  form.delete('bir_kattaki_daire');
  kaynakZorunluAlanlariDoldur(form, ['bir_kattaki_daire']);
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === 'bir_kattaki_daire')
  );
  form.set('bir_kattaki_daire', '0');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === 'bir_kattaki_daire')
  );
  form.set('bir_kattaki_daire', '3');
  assert.equal(formdanIlanVerisi(form).tip, 'apartman');
});

test('otel şablonu yapı, yıldız ve çoklu oda tiplerini birlikte kaydeder', () => {
  const form = new FormData();
  const degerler: Record<string, string> = {
    baslik: 'Silivri sahilinde satılık dört yıldızlı faal otel',
    aciklama: 'Denize yakın konumu, farklı oda tipleri ve ortak kullanım alanları bulunan faal tesis için ayrıntılı dosya sunulabilir.',
    fiyat: '95000000', para_birimi: 'TRY', tip_grup: 'turistik', islem: 'satilik',
    tip: 'otel', il: 'İstanbul', ilce: 'Silivri', mahalle: 'Selimpaşa', m2_brut: '1800',
    m2_acik: '600', kat_sayisi: '4', bina_yasi: '5-10', oda_adedi: '42', yatak_kapasitesi: '96',
    yildiz_sinifi: '4 Yıldız', yapi_durumu: 'İkinci El', tapu_durumu: 'Kat Mülkiyetli', kredi_uygunluk: 'Uygun', yetki_durumu: 'bekliyor',
  };
  for (const [anahtar, deger] of Object.entries(degerler)) form.set(anahtar, deger);
  form.append('oda_tipleri', 'Standart');
  form.append('oda_tipleri', 'Suit');

  kaynakZorunluAlanlariDoldur(form);
  const veri = formdanIlanVerisi(portalVarsayilanlariniEkle(form));
  assert.equal(veri.ozellikler['Toplam Açık Alan'], '600 m²');
  assert.equal(veri.ozellikler['Yıldız Sayısı'], '4 Yıldız');
  assert.equal(veri.ozellikler['Oda Tipleri'], 'Standart, Suit');
  assert.equal(veri.ozellikler['Yapının Durumu'], 'İkinci El');
});

test('konut projesi blok, ünite, plan ve teslim verisini birlikte doğrular', () => {
  const form = new FormData();
  const degerler: Record<string, string> = {
    baslik: 'Silivri merkezde teslimi planlanan yeni yaşam projesi',
    aciklama: 'İki bloktan oluşan, sosyal alanları bulunan ve farklı daire planlarıyla satışta olan proje için ayrıntılı sunum ofisimizden paylaşılabilir.',
    fiyat: '4750000', para_birimi: 'TRY', tip_grup: 'proje', islem: 'satilik', tip: 'konut-projesi',
    il: 'İstanbul', ilce: 'Silivri', mahalle: 'Yeni', m2_brut: '85', arsa_m2: '6400',
    proje_asamasi: 'İnce İşler', satis_durumu: 'Satışta', teslim_durumu: 'Belirli tarihte teslim', teslim_tarihi: '2027-06-30',
    blok_sayisi: '2', toplam_unite: '46', konut_adedi: '42', ticari_adet: '4', satilik_unite: '19',
    yuklenici: 'Örnek Yapı A.Ş.', yetki_durumu: 'bekliyor',
  };
  for (const [anahtar, deger] of Object.entries(degerler)) form.set(anahtar, deger);
  form.append('daire_planlari', '2+1');
  form.append('daire_planlari', '3+1');
  form.append('daire_planlari', 'Dükkan');

  const veri = formdanIlanVerisi(portalVarsayilanlariniEkle(form));
  assert.equal(veri.ozellikler['Blok Sayısı'], '2');
  assert.equal(veri.ozellikler['Konut Adedi'], '42');
  assert.equal(veri.ozellikler['Daire Planları'], '2+1, 3+1, Dükkan');
  assert.equal(veri.ozellikler['Teslim Tarihi'], '2027-06-30');
  const detaySatirlari = kunyeGrupla('proje', veri.ozellikler, '4.750.000 ₺', null, null, 'konut-projesi')
    .flatMap((grup) => grup.satirlar);
  assert.ok(detaySatirlari.some((satir) => satir.etiket === 'Blok sayısı' && satir.deger === '2'));
  assert.ok(detaySatirlari.some((satir) => satir.etiket === 'Satıştaki daire / bağımsız bölüm planları' && satir.deger === '2+1, 3+1, Dükkan'));

  form.set('satilik_unite', '47');
  assert.throws(() => formdanIlanVerisi(form), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'satilik_unite')
  );
});

test('akaryakıt istasyonu pompa sayısını ve apart otel apart adedini türüne göre korur', () => {
  const istasyon = new FormData();
  const istasyonDegerleri: Record<string, string> = {
    baslik: 'Ana yol üzerinde faal satılık akaryakıt istasyonu',
    aciklama: 'Açık ve kapalı kullanım alanları bulunan, faal bayilik yapısına sahip istasyon için ayrıntılı bilgi ofisimizden alınabilir.',
    fiyat: '95000000', para_birimi: 'TRY', tip_grup: 'isyeri', islem: 'satilik', tip: 'akaryakit-istasyonu',
    il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez', m2_brut: '550', kapali_alan: '380', m2_acik: '1700', ticari_bolum: '3', bina_yasi: '5-10', tapu_durumu: 'Kat Mülkiyetli', kredi_uygunluk: 'Uygun',
    isitma_tipi: 'Klima', pompa_sayisi: '6', bayilik_durumu: 'Markalı faal bayi', gunluk_satis_litre: '2400', yetki_durumu: 'bekliyor',
  };
  for (const [anahtar, deger] of Object.entries(istasyonDegerleri)) istasyon.set(anahtar, deger);
  kaynakZorunluAlanlariDoldur(istasyon);
  const istasyonVerisi = formdanIlanVerisi(portalVarsayilanlariniEkle(istasyon));
  assert.equal(istasyonVerisi.ozellikler['Pompa Sayısı'], '6');
  assert.equal(istasyonVerisi.ozellikler['Bayilik Durumu'], 'Markalı faal bayi');
  istasyon.delete('gunluk_satis_litre');
  assert.throws(() => formdanIlanVerisi(istasyon), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === 'gunluk_satis_litre')
  );

  const apart = new FormData();
  const apartDegerleri: Record<string, string> = {
    baslik: 'Sahile yakın satılık faal apart otel tesisi',
    aciklama: 'Farklı apart planları ve misafir kapasitesi bulunan, sezon boyunca faal çalışabilecek turistik tesis için dosya paylaşılabilir.',
    fiyat: '72000000', para_birimi: 'TRY', tip_grup: 'turistik', islem: 'satilik', tip: 'apart-otel',
    il: 'İstanbul', ilce: 'Silivri', mahalle: 'Sahil', m2_brut: '900', m2_acik: '340', kat_sayisi: '3', bina_yasi: '5-10',
    oda_adedi: '18', yatak_kapasitesi: '44', apart_sayisi: '9', yildiz_sinifi: 'Özel Belgeli', tapu_durumu: 'Kat Mülkiyetli', kredi_uygunluk: 'Uygun',
    yapi_durumu: 'İkinci El', yetki_durumu: 'bekliyor',
  };
  for (const [anahtar, deger] of Object.entries(apartDegerleri)) apart.set(anahtar, deger);
  kaynakZorunluAlanlariDoldur(apart);
  const apartVerisi = formdanIlanVerisi(portalVarsayilanlariniEkle(apart));
  assert.equal(apartVerisi.ozellikler['Apart Sayısı'], '9');

  apart.delete('apart_sayisi');
  assert.throws(() => formdanIlanVerisi(apart), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'apart_sayisi')
  );
});

test('kesin ilan pini yönetimde korunur ve kamuya uzaklaştırılmış yaklaşık alan çıkar', () => {
  const form = temelForm('konut');
  form.set('kesin_enlem', '41.0734');
  form.set('kesin_boylam', '28.2464');
  form.set('konum_dogruluk', 'harita');
  form.set('kamu_konum_duzeyi', 'yaklasik');
  form.set('portal_konum_aktarimi', 'izinli');
  const veri = formdanIlanVerisi(form);
  const kesin = kesinKoordinatiOku(veri.ozellikler);
  assert.deepEqual(kesin, { enlem: 41.0734, boylam: 28.2464 });

  const kamu = kamuKonumuSec('elle-konum-testi', veri.ozellikler, { enlem: 41.08, boylam: 28.25 });
  assert.equal(kamu.kaynak, 'yaklasik-pin');
  assert.notDeepEqual(kamu.koordinat, kesin);
  const kuzeyGuney = ((kamu.koordinat!.enlem - kesin!.enlem) * 111_320) ** 2;
  const doguBati = ((kamu.koordinat!.boylam - kesin!.boylam) * 111_320 * Math.cos(kesin!.enlem * Math.PI / 180)) ** 2;
  const uzaklik = Math.sqrt(kuzeyGuney + doguBati);
  assert.ok(uzaklik >= 350 && uzaklik <= 530);
  assert.equal(halkaAcikOzellikler(veri.ozellikler)['Kesin Enlem'], undefined);
  assert.equal(ozelKonumAlanlariniGizle(veri.ozellikler)['Kesin Boylam'], undefined);
  assert.equal(ozelKonumAlanlariniGizle(veri.ozellikler)['Portal Kesin Konum Aktarımı'], undefined);
});

test('eksik koordinat çifti ve pinsiz yaklaşık gösterim reddedilir', () => {
  const eksik = temelForm('konut');
  eksik.set('kesin_enlem', '41.0734');
  assert.throws(() => formdanIlanVerisi(eksik), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'kesin_boylam')
  );

  const pinsiz = temelForm('konut');
  pinsiz.set('kamu_konum_duzeyi', 'yaklasik');
  assert.throws(() => formdanIlanVerisi(pinsiz), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((x) => x.alan === 'kamu_konum_duzeyi')
  );
});

test('aynı villa üç portal önizlemesinde alan, medya ve iletişim verisini kaybetmez', () => {
  const form = temelForm('konut');
  form.set('tip', 'villa');
  form.set('mutfak_tipi', 'Açık (Amerikan)');
  form.set('konut_kat_tipi', 'Tripleks');
  form.set('mulk_sahibi_statu', 'T.C. vatandaşı');
  form.set('kesin_enlem', '41.0734');
  form.set('kesin_boylam', '28.2464');
  form.set('konum_dogruluk', 'harita');
  form.set('portal_konum_aktarimi', 'izinli');
  form.set('portal_iletisim_tercihi', 'ikisi');
  form.set('gorseller', [1, 2, 3, 4, 5].map((sira) => `https://example.com/${sira}.webp`).join('\n'));
  form.append('donanim', 'Özel Havuz');
  form.append('donanim', 'Deniz Manzarası');
  const veri = formdanIlanVerisi(form);
  veri.ozellikler['Özel Sunum Notu'] = 'Gün batımı cephesi';

  const onizlemeler = ucPortalOnizlemesi({
    id: 'villa-ornek', ...veri,
    video: { url: '/g/video/villa-ornek/tanitim.mp4', poster: '/g/video/villa-ornek/poster.webp', mime: 'video/mp4', sure: 42, boyut: 5_000_000 },
    danisman: { ad: 'Doğukan Özdoğan', telefon: '0530 392 10 04' },
    ofisTelefonu: '0536 343 41 97',
  });
  assert.deepEqual(onizlemeler.map((x) => x.portal), ['sahibinden', 'emlakjet', 'hepsiemlak']);
  for (const onizleme of onizlemeler) {
    assert.deepEqual(onizleme.eksikler, []);
    assert.deepEqual(onizleme.veriKaybi, []);
    assert.equal(onizleme.gorseller.length, 5);
    assert.equal(onizleme.medya.video, '/g/video/villa-ornek/tanitim.mp4');
    assert.deepEqual(onizleme.donanim, ['Özel Havuz', 'Deniz Manzarası']);
    assert.deepEqual(onizleme.kesinKonum, { enlem: 41.0734, boylam: 28.2464 });
    assert.match(onizleme.iletisim.danisman ?? '', /Doğukan Özdoğan/);
    assert.equal(onizleme.iletisim.ofis, '0536 343 41 97');
    assert.ok(onizleme.alanlar.some((alan) => alan.edm === 'Mutfak Tipi' && alan.deger === 'Açık (Amerikan)'));
    assert.ok(onizleme.alanlar.some((alan) => alan.edm === 'Konut Kat Tipi' && alan.deger === 'Tripleks'));
    assert.ok(onizleme.aciklamaEkleri.some((alan) => alan.alan === 'Özel Sunum Notu'));
  }
  const esleme = portalAlanEslemeTablosu('konut');
  assert.ok(esleme.length >= 35);
  assert.deepEqual(esleme.find((alan) => alan.edm === 'Brüt Yapı Alanı'), {
    edm: 'Brüt Yapı Alanı', sahibinden: 'Brüt m²', emlakjet: 'Brüt m²', hepsiemlak: 'Brüt m²',
  });

  const otelEsleme = portalAlanEslemeTablosu('turistik', 'otel');
  const kampEsleme = portalAlanEslemeTablosu('turistik', 'kamp-alani');
  assert.ok(otelEsleme.some((alan) => alan.edm === 'Oda Adedi'));
  assert.ok(!otelEsleme.some((alan) => alan.edm === 'Kamp Ünitesi'));
  assert.ok(kampEsleme.some((alan) => alan.edm === 'Kamp Ünitesi'));
  assert.ok(!kampEsleme.some((alan) => alan.edm === 'Oda Adedi'));

  const eskiKamp = portalAktariminiOnizle({
    id: 'kamp-eski', baslik: 'Silivri çevresinde satılık kamp alanı tesisi',
    aciklama: 'Çadır ve karavan alanları bulunan tesisin eski kaydında yanlışlıkla otel odası bilgisi kalmış olabilir.',
    fiyat: 8_000_000, paraBirimi: 'TRY', islem: 'satilik', tipGrup: 'turistik', tip: 'kamp-alani', oda: null, m2: 600,
    il: 'İstanbul', ilce: 'Silivri', mahalle: 'Merkez', ozellikler: { 'Kamp Ünitesi': '12', 'Oda Adedi': '8' },
    donanim: [], gorseller: Array.from({ length: 5 }, (_, sira) => `https://example.com/${sira}.webp`), ofisTelefonu: '0536 343 41 97',
  }, 'sahibinden');
  assert.ok(eskiKamp.alanlar.some((alan) => alan.edm === 'Kamp Ünitesi'));
  assert.ok(!eskiKamp.alanlar.some((alan) => alan.edm === 'Oda Adedi'));
  assert.ok(eskiKamp.uyarilar.some((uyari) => /uyumsuz/.test(uyari)));
});

function ornekIlan(degisiklik: Partial<Ilan> = {}): Ilan {
  const ozellikler = { 'Brüt Yapı Alanı': '110 m²', 'Net Yapı Alanı': '90 m²', 'Site İçerisinde': 'Evet' };
  return {
    id: 'ornek', kaynak: 'elle', kaynakUrl: '', baslik: 'Silivri’de Kiralık 2+1 Daire',
    baslikTemiz: 'Silivri’de Kiralık 2+1 Daire',
    aciklama: 'Silivri merkezde, ulaşım olanaklarına yakın, bakımlı ve aydınlık daire kiralıktır. Güncel müsaitlik için bilgi alın.',
    fiyat: 20_000, paraBirimi: 'TRY', islem: 'kiralik', kategori: 'Kiralık Daire', tip: 'daire', tipGrup: 'konut',
    oda: '2+1', m2: 110, il: 'İstanbul', ilce: 'Silivri', mahalle: 'Mimar Sinan Mahallesi', ozellikler,
    donanim: [], gorseller: ['1', '2', '3', '4'], video: null, danismanSlug: 'danisman', guncellenme: null,
    ilkGorulme: '2026-09-01T00:00:00Z', slug: 'ornek', yol: '/ilan/ornek', konum: 'Silivri · İstanbul',
    konumKisa: 'Silivri / İstanbul', fiyatMetin: '20.000 ₺ / ay',
    alanlar: ilanAlanlariniCoz({ tipGrup: 'konut', m2: 110, ozellikler }), birimFiyat: null,
    birimFiyatTemeli: null, ozetMetin: 'Özet', yeniMi: false, kapak: '1', etiketler: ['2+1', 'Brüt 110 m²'],
    koordinat: null, koordinatYaricapi: 700, aramaMetni: '', ...degisiklik,
  };
}

test('kalite kaydı site çelişkisini bulur ve düzeltilmiş kaydı geçirir', () => {
  const celiskili = ornekIlan({
    aciklama: 'İki bloklu site içinde yer alan dairenin açık otoparkı ve ortak kullanım alanları vardır. Ayrıntılı bilgi için iletişime geçin.',
    ozellikler: { 'Brüt Yapı Alanı': '110 m²', 'Net Yapı Alanı': '90 m²', 'Site İçerisinde': 'Hayır' },
  });
  const sorunlu = ilanKalitesiniDenetle(celiskili, new Set(['danisman']));
  const duzeltilmis = ilanKalitesiniDenetle(ornekIlan(), new Set(['danisman']));

  assert.equal(sorunlu.durum, 'kritik');
  assert.ok(sorunlu.sorunlar.some((sorun) => sorun.kod === 'site-celiski'));
  assert.equal(duzeltilmis.durum, 'uygun');
  assert.deepEqual(kaliteOzeti([sorunlu, duzeltilmis]), { toplam: 2, uygun: 1, incele: 0, kritik: 1 });
});

test('kalite kaydı işlem, oda, alan ve danışman çelişkilerini birlikte raporlar', () => {
  const alanlar = { ...ornekIlan().alanlar, brutYapi: 90, netYapi: 110, karsilastirmaM2: 90 };
  const kayit = ilanKalitesiniDenetle(ornekIlan({
    baslikTemiz: 'Silivri’de Satılık 3+1 Daire',
    alanlar,
    danismanSlug: 'bilinmeyen',
  }), new Set(['danisman']));
  const kodlar = new Set(kayit.sorunlar.map((sorun) => sorun.kod));

  assert.ok(kodlar.has('islem-baslik-celiski'));
  assert.ok(kodlar.has('oda-celiski'));
  assert.ok(kodlar.has('net-brut-celiski'));
  assert.ok(kodlar.has('danisman-bilinmiyor'));
});

test('Türkçe metrekare değerleri form ve detay arasında ondalıklarını korur', () => {
  const ozellikler = { 'Toplam Parsel Alanı': '9.456,55 m²', 'Satılan Hisse Alanı': '1.042 m²' };
  const degerler = ozellikleriFormDegerlerine(ozellikler, [], 'arsa');
  assert.equal(degerler.m2_brut, '9456.55');
  assert.equal(degerler.hisse_m2, '1042');
  const form = temelForm('arsa');
  form.set('m2_brut', String(degerler.m2_brut));
  form.set('hisse_m2', String(degerler.hisse_m2));
  const veri = formdanIlanVerisi(form);
  assert.equal(veri.m2, 9456.55);
  assert.equal(veri.ozellikler['Toplam Parsel Alanı'], '9.456,55 m²');
  const satirlar = kunyeGrupla('arsa', veri.ozellikler, '1.000.000 ₺', null).flatMap((g) => g.satirlar);
  assert.equal(satirlar.find((s) => s.etiket === 'Toplam parsel alanı')?.deger, '9.456,55 m²');
});

test('konut ve arsa toplam alanı kaynakta zorunludur, hisse alanı bunu ikame etmez', () => {
  const konut = temelForm('konut');
  konut.delete('m2_brut');
  konut.set('m2_net', '90.25');
  assert.throws(() => formdanIlanVerisi(konut), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === 'm2_brut')
  );
  const hisse = temelForm('arsa');
  hisse.delete('m2_brut');
  hisse.set('hisse_m2', '231');
  assert.throws(() => formdanIlanVerisi(hisse), (hata) =>
    hata instanceof IlanFormHatasi && hata.alanlar.some((alan) => alan.alan === 'm2_brut')
  );
  hisse.set('m2_brut', '500');
  assert.equal(formdanIlanVerisi(hisse).ozellikler['Satılan Hisse Alanı'], '231 m²');
  hisse.delete('hisse_m2');
  assert.equal(formdanIlanVerisi(hisse).ozellikler['Satılan Hisse Alanı'], undefined);
});

test('hisseli tapu genel alanın satılan pay olduğunu kanıtlamaz', () => {
  const girdi = { tipGrup: 'arsa', m2: 312, ozellikler: { Metrekare: '312 m²', 'Tapu Durumu': 'Hisseli Tapu', 'Metrekare Birim Fiyatı': '1859 TL/m²' } };
  const oz = alanOzellikleriniNormallestir(girdi);
  const alanlar = ilanAlanlariniCoz({ ...girdi, ozellikler: oz });
  assert.equal(alanlar.satilanHisse, null);
  assert.equal(alanlar.toplamParsel, null);
  assert.equal(alanlar.beyanEdilen, 312);
  assert.equal(alanlar.karsilastirmaM2, null);
  assert.equal(alanlar.birimFiyatTemeli, null);
  assert.equal(oz['Metrekare Birim Fiyatı'], undefined);
  assert.deepEqual(alanOzellikleriniNormallestir({ ...girdi, ozellikler: oz }), oz);
  const toplam = ilanAlanlariniCoz({ ...girdi, ozellikler: { 'Toplam Parsel Alanı': '312 m²', 'Tapu Durumu': 'Hisseli Tapu' } });
  assert.equal(toplam.toplamParsel, 312);
  assert.equal(toplam.karsilastirmaM2, null);
});

test('eski panel anahtarı kaynak düzeltmesinden önceliklidir', () => {
  const ozellikler = alanOzellikleriniBirlestir({
    tipGrup: 'konut', m2: 463, ozellikler: { 'Net Yapı Alanı': '320 m²', 'Arsa Alanı': '463 m²' },
  }, { 'Net Metrekare': '300 m²' });
  assert.equal(ozellikler['Net Yapı Alanı'], '300 m²');
  assert.equal(ozellikler['Net Metrekare'], undefined);
});

test('tam panel kaydından silinen kaynak alanı geri gelmez', () => {
  const ozellikler = alanOzellikleriniBirlestir({
    tipGrup: 'konut', m2: null, ozellikler: { 'Brüt Yapı Alanı': '463 m²', 'Net Yapı Alanı': '320 m²', 'Arsa Alanı': '463 m²' },
  }, { 'Net Yapı Alanı': '300 m²' }, true);
  const alanlar = ilanAlanlariniCoz({ tipGrup: 'konut', m2: null, ozellikler });
  assert.equal(alanlar.brutYapi, null);
  assert.equal(alanlar.netYapi, 300);
  assert.equal(alanlar.arsa, null);
});

test('belirsiz alan istatistikte ham m2 ile geri doldurulmaz', () => {
  assert.equal(arsaToplamAlani([{ id: 'belirsiz', islem: 'satilik', tipGrup: 'arsa', fiyat: 1000000, m2: 312, paraBirimi: 'TRY', alanlar: { karsilastirmaM2: null } }]), 0);
});

test('tapu ve kadastro çelişkileri otomatik düzeltmeyle gizlenmez', () => {
  const ozellikler = kaynakOzellikleriniUygula({ 'Tapu Durumu': 'Hisseli Tapu', Parsel: '3' }, kaynakSunumDuzeltmesi('19538691'));
  assert.equal(ozellikler['Tapu Durumu'], 'Hisseli Tapu');
  const kalite = ilanKalitesiniDenetle(ornekIlan({ ozellikler, aciklama: 'Arsamız 83 ada 157 parselde yer alır. Kat irtifakı tapulu olduğu belirtilmiş olup ayrıntılar için ofisimizden bilgi alabilirsiniz.' }));
  assert.ok(kalite.sorunlar.some((s) => s.kod === 'tapu-celiski'));
  assert.ok(kalite.sorunlar.some((s) => s.kod === 'kadastro-celiski'));
});

test('fiyat kapsamı teyidi, ilgili alan ve hisse ölçüsü işlenmeden kapanmaz', () => {
  const eksik = ilanKalitesiniDenetle(ornekIlan({ id: '19751424' }));
  assert.ok(eksik.sorunlar.some((s) => s.kod === 'fiyat-kapsami-teyit'));

  const tamamiOzellikleri = { ...ornekIlan().ozellikler, 'Fiyat Kapsamı': 'Taşınmazın tamamı' };
  const tamami = ilanKalitesiniDenetle(ornekIlan({ id: '19751424', ozellikler: tamamiOzellikleri }));
  assert.ok(!tamami.sorunlar.some((s) => s.kod === 'fiyat-kapsami-teyit'));

  const yariOzellikleri = { ...ornekIlan().ozellikler, 'Fiyat Kapsamı': 'Belirtilen hisse' };
  const yariEksik = ilanKalitesiniDenetle(ornekIlan({ id: '19751424', ozellikler: yariOzellikleri }));
  assert.ok(yariEksik.sorunlar.some((s) => s.kod === 'fiyat-kapsami-teyit'));
  const yariAlanlar = { ...ornekIlan().alanlar, satilanHisse: 1_125, toplamParsel: 2_250 };
  const yariTam = ilanKalitesiniDenetle(ornekIlan({ id: '19751424', ozellikler: yariOzellikleri, alanlar: yariAlanlar }));
  assert.ok(!yariTam.sorunlar.some((s) => s.kod === 'fiyat-kapsami-teyit'));
});
