import assert from 'node:assert/strict';
import test from 'node:test';
import { ilanSemasi, ilanSayfaYolu } from '../src/lib/ilan-semasi.ts';
import { ILAN_GRUPLARI, donanimGruplariSec, yeniIlanFormGruplari, yeniIlanProfiliniDestekleniyor, YENI_ILAN_GIZLI_PROFILLER } from '../src/lib/ilan-bilgileri.ts';
import { sahibindenDetayEslesmeDurumu, sahibindenDetayGruplari } from '../src/lib/sahibinden-detay.ts';
import { SAHIBINDEN_DETAY_KATEGORILERI } from '../src/lib/sahibinden-detay-verisi.ts';

const site = 'https://edmyapigayrimenkul.com';
const girdi = {
  baslikTemiz: 'Silivri satılık 2+1 daire', aciklama: 'Kaynak açıklaması', yol: '/ilan/ornek',
  gorseller: [], ilkGorulme: '2026-09-08T06:14:03.446Z', guncellenme: null,
  tipGrup: 'konut' as const, tip: 'daire', oda: '2+1',
  alanlar: { brutYapi: 100, netYapi: 85, arsa: null, toplamParsel: null, satilanHisse: null, beyanEdilen: null, karsilastirmaM2: 100, karsilastirmaEtiketi: null, karsilastirmaKisaEtiketi: null, birimFiyatTemeli: null },
  koordinat: { enlem: 41.07, boylam: 28.26 }, il: 'İstanbul', ilce: 'Silivri',
  fiyat: 4000000, paraBirimi: 'TRY', islem: 'satilik' as const,
};

test('oda, alan ve yaklaşık konum sayfaya değil taşınmaza aittir', () => {
  const sema = ilanSemasi(girdi, site);
  for (const ad of ['address', 'geo', 'floorSize', 'numberOfRooms']) assert.equal(Object.hasOwn(sema, ad), false);
  assert.equal(sema.about['@type'], 'Apartment');
  assert.equal(sema.about.floorSize?.value, 85);
  assert.equal(sema.about.floorSize?.name, 'Net yapı alanı');
  assert.equal(sema.about.geo?.name, 'Yaklaşık konum');
  assert.equal(sema.about.additionalProperty?.[0].value, '2+1');
  assert.equal(Object.hasOwn(sema.about, 'numberOfRooms'), false);
});

test('net alan yoksa brüt alan açık adıyla sunulur; villa House olur', () => {
  const sema = ilanSemasi({ ...girdi, tip: 'villa', alanlar: { ...girdi.alanlar, netYapi: null } }, site);
  assert.equal(sema.about['@type'], 'House');
  assert.equal(sema.about.floorSize?.value, 100);
  assert.equal(sema.about.floorSize?.name, 'Brüt yapı alanı');
});

test('arazi hisse alanı yapı alanına dönüşmez; sıfır bedel ve bozuk konum yazılmaz', () => {
  const sema = ilanSemasi({ ...girdi, tipGrup: 'arsa', tip: 'tarla', oda: null, fiyat: 0,
    koordinat: { enlem: 91, boylam: NaN },
    alanlar: { ...girdi.alanlar, brutYapi: null, netYapi: null, satilanHisse: 250, beyanEdilen: 900 } }, site);
  assert.equal(sema.about['@type'], 'Place');
  assert.equal(sema.about.floorSize, undefined);
  assert.equal(sema.about.geo, undefined);
  assert.equal(Object.hasOwn(sema.offers, 'price'), false);
  assert.deepEqual(sema.about.additionalProperty?.map((satir) => satir.name), ['Satılan hisse alanı', 'Kaynak alanı · kapsamı teyit edilecek']);
});

test('işyeri konut varsayılmaz; geçersiz alan ve tarih çıkarılır', () => {
  const sema = ilanSemasi({ ...girdi, tipGrup: 'isyeri', tip: 'ofis-buro', oda: null, ilkGorulme: 'belirsiz',
    alanlar: { ...girdi.alanlar, netYapi: -1, brutYapi: Infinity } }, site);
  assert.equal(sema.about['@type'], 'Place');
  assert.equal(sema.about.floorSize, undefined);
  assert.equal(sema.about.additionalProperty, undefined);
  assert.equal(sema.datePosted, undefined);
});

test('kiralık teklif LeaseOut olur; kat karşılığında hayali fiyat yazılmaz', () => {
  assert.match(ilanSemasi({ ...girdi, islem: 'kiralik' }, site).offers.businessFunction, /LeaseOut$/);
  const sema = ilanSemasi({ ...girdi, islem: 'kat-karsiligi-satilik' }, site);
  assert.equal(Object.hasOwn(sema.offers, 'price'), false);
  assert.equal(Object.hasOwn(sema.offers, 'priceCurrency'), false);
});

test('görünen sayfa yolu ile şema aynı il-ilçe bağlantısını kullanır', () => {
  const yol = ilanSayfaYolu({ ...girdi, il: 'Edirne', ilce: 'Merkez' }, site);
  assert.equal(yol.length, 4);
  const url = new URL(yol[2].item);
  assert.equal(url.searchParams.get('il'), 'Edirne');
  assert.equal(url.searchParams.get('ilce'), 'Merkez');
  assert.equal(yol[3].item, site + girdi.yol);
  assert.equal(ilanSayfaYolu({ ...girdi, ilce: null }, site).length, 3);
});

test('386 EDM tür/işlem birleşiminin doğrudan, alternatif işlem ve fallback kapsamı saydamdır', () => {
  const toplamlar = new Map<string, number>();
  let toplam = 0;
  let dogrudanEslesen = 0;
  let kaynaktaDetaySecenegiOlmayan = 0;
  let digerIslemTekProfil = 0;
  let yakinIslemProfili = 0;
  let yakinAltTurProfili = 0;
  let genelFallback = 0;
  let beklenmedikTekProfilliGenelFallback = 0;
  let digerIslemdeBirdenCokProfil = 0;
  let kaynakAltTurAnahtariYok = 0;
  const slug = (value: string) => value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const tipEslemeleri: Record<string, string> = {
    'isyeri|restoran-kafe': 'restoran-lokanta',
    'isyeri|is-hani': 'is-hani-kati-ofisi',
    'isyeri|arac-galerisi-servis': 'arac-galerisi-servis',
    'isyeri|eczane': 'eczane',
    'isyeri|etkinlik-alani': 'etkinlik-alani',
    'isyeri|piknik-alani-kahvalti-bahcesi': 'piknik-alani-kahvalti-bahcesi',
    'isyeri|yurt': 'yurt',
    'turistik|kamp-alani': 'kamp-yeri-mocamp',
  };

  for (const grup of ILAN_GRUPLARI) {
    for (const islem of grup.islemler) {
      for (const tip of grup.altTipler.filter((aday) => !aday.islemler || aday.islemler.includes(islem))) {
        toplam += 1;
        const kaynakGruplari = sahibindenDetayGruplari(grup.kimlik, islem, tip.deger, tip.etiket);
        const durum = sahibindenDetayEslesmeDurumu(grup.kimlik, islem, tip.deger, tip.etiket);
        if (durum === 'dogrudan') {
          dogrudanEslesen += 1;
          assert.notEqual(kaynakGruplari, null, `${grup.kimlik}/${islem}/${tip.deger} doğrudan profili olmalı`);
          if (kaynakGruplari.length === 0) kaynaktaDetaySecenegiOlmayan += 1;
        } else if (durum === 'diger-islem-tek-profil') {
          digerIslemTekProfil += 1;
          assert.notEqual(kaynakGruplari, null, `${grup.kimlik}/${islem}/${tip.deger} tekil alternatif profili kullanmalı`);
          assert.ok(kaynakGruplari.length >= 0);
        } else if (durum === 'yakin-islem-profili') {
          yakinIslemProfili += 1;
          assert.notEqual(kaynakGruplari, null, `${grup.kimlik}/${islem}/${tip.deger} en yakın işlem profilini kullanmalı`);
          assert.ok(kaynakGruplari.length >= 0);
        } else if (durum === 'yakin-alt-tur-profili') {
          yakinAltTurProfili += 1;
          assert.notEqual(kaynakGruplari, null, `${grup.kimlik}/${islem}/${tip.deger} en yakın alt tür profilini kullanmalı`);
          assert.ok(kaynakGruplari.length >= 0);
        } else {
          assert.equal(kaynakGruplari, null, `${grup.kimlik}/${islem}/${tip.deger} belirsiz eşleşmeyi kaynak gibi göstermemeli`);
          genelFallback += 1;
          toplamlar.set(grup.kimlik, (toplamlar.get(grup.kimlik) ?? 0) + 1);
          const tipAnahtari = tipEslemeleri[`${grup.kimlik}|${tip.deger}`] ?? slug(tip.etiket);
          const alternatifProfiller = new Set(Object.entries(SAHIBINDEN_DETAY_KATEGORILERI)
            .filter(([anahtar]) => anahtar.startsWith(`${grup.kimlik}|`) && anahtar.endsWith(`|${tipAnahtari}`))
            .map(([, profil]) => profil));
          if (alternatifProfiller.size === 0) kaynakAltTurAnahtariYok += 1;
          else if (alternatifProfiller.size === 1) beklenmedikTekProfilliGenelFallback += 1;
          else digerIslemdeBirdenCokProfil += 1;
          assert.ok(donanimGruplariSec(grup.kimlik, islem, tip.deger).length > 0,
            `${grup.kimlik}/${islem}/${tip.deger} genel fallback nitelikleri sunmalı`);
        }
      }
    }
  }

  assert.equal(toplam, 386);
  assert.equal(dogrudanEslesen, 298);
  assert.equal(kaynaktaDetaySecenegiOlmayan, 112);
  assert.equal(digerIslemTekProfil, 27);
  assert.equal(yakinIslemProfili, 39);
  assert.equal(yakinAltTurProfili, 10);
  assert.equal(genelFallback, 12);
  assert.equal(beklenmedikTekProfilliGenelFallback, 0);
  assert.equal(digerIslemdeBirdenCokProfil, 0);
  assert.equal(kaynakAltTurAnahtariYok, 12);
  assert.deepEqual(Object.fromEntries([...toplamlar].sort()), {
    isyeri: 2, proje: 4, turistik: 6,
  });
  for (const islem of ['devren-satilik', 'devren-kiralik']) {
    assert.equal(sahibindenDetayEslesmeDurumu('isyeri', islem, 'is-hani', 'İş Hanı'), 'diger-islem-tek-profil');
    assert.ok(sahibindenDetayGruplari('isyeri', islem, 'is-hani', 'İş Hanı')?.length);
  }
});

test('kaynak formu bulunmayan 12 nadir profil yalnız yeni ilan formundan çıkarılır', () => {
  const yeniGruplar = yeniIlanFormGruplari();
  const yeniProfiller = yeniGruplar.flatMap((grup) => grup.islemler.flatMap((islem) =>
    grup.altTipler.filter((tip) => !tip.islemler?.length || tip.islemler.includes(islem)).map((tip) => ({
      grup: grup.kimlik, islem, tip: tip.deger,
    }))));
  assert.equal(YENI_ILAN_GIZLI_PROFILLER.length, 12);
  assert.equal(yeniProfiller.some((profil) => !yeniIlanProfiliniDestekleniyor(profil.grup, profil.islem, profil.tip)), false);
  assert.equal(yeniProfiller.some((profil) => {
    const etiket = ILAN_GRUPLARI.find((grup) => grup.kimlik === profil.grup)?.altTipler.find((tip) => tip.deger === profil.tip)?.etiket ?? profil.tip;
    return sahibindenDetayEslesmeDurumu(profil.grup, profil.islem, profil.tip, etiket) === 'edm-genel';
  }), false, 'Yeni ilan formunda tam veya açıkça uyarlanmış kaynak profili olmalı');
  assert.equal(yeniGruplar.some((grup) => grup.kimlik === 'proje'), false);
  assert.equal(ILAN_GRUPLARI.find((grup) => grup.kimlik === 'proje')?.altTipler.length, 4,
    'Eski ilanları düzenleme ve görüntüleme için asıl şema korunmalı');
  assert.equal(yeniIlanProfiliniDestekleniyor('isyeri', 'satilik', 'fatura-merkezi'), true,
    'Kapatılan kapsam yalnız kaynak formu bulunmayan işlem türü olmalı');
  assert.equal(yeniIlanProfiliniDestekleniyor('isyeri', 'devren-satilik', 'fatura-merkezi'), false);
});
