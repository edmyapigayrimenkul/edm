import {
  ILAN_GRUPLARI,
  KONUM_YONETIM_ALANLARI,
  MEDYA_PORTAL_ALANLARI,
  YETKI_ALANLARI,
  islemEtiketi,
  tipEtiketi,
} from './ilan-bilgileri.ts';
import { kesinKoordinatiOku, PORTAL_KESIN_KONUM_IZNI_ANAHTARI } from './ilan-konum.ts';

export type PortalKimligi = 'sahibinden' | 'emlakjet' | 'hepsiemlak';

export interface PortalIlanGirdisi {
  id: string;
  baslik: string;
  aciklama: string;
  fiyat: number | null;
  paraBirimi: string;
  islem: string;
  tipGrup: string;
  tip: string;
  oda: string | null;
  m2: number | null;
  il: string | null;
  ilce: string | null;
  mahalle: string | null;
  ozellikler: Record<string, string>;
  donanim: string[];
  gorseller: string[];
  video?: { url: string; poster: string; mime: string; sure: number; boyut: number } | null;
  danisman?: { ad: string; telefon: string } | null;
  ofisTelefonu: string;
}

export interface PortalAlanSatiri {
  edm: string;
  portal: string;
  deger: string;
  durum: 'dogrudan' | 'donusturuldu' | 'aciklamaya-eklendi';
}

export interface PortalAktarimOnizlemesi {
  portal: PortalKimligi;
  portalAdi: string;
  kategoriYolu: string;
  alanlar: PortalAlanSatiri[];
  gorseller: string[];
  donanim: string[];
  medya: { video: string | null; poster: string | null; sanalTur: string | null };
  iletisim: { tercih: string; danisman: string | null; ofis: string | null };
  kesinKonum: { enlem: number; boylam: number } | null;
  eksikler: string[];
  uyarilar: string[];
  aciklamaEkleri: Array<{ alan: string; deger: string }>;
  veriKaybi: string[];
}

export const PORTAL_ADLARI: Record<PortalKimligi, string> = {
  sahibinden: 'Sahibinden',
  emlakjet: 'Emlakjet',
  hepsiemlak: 'Hepsiemlak',
};

type PortalEtiketleri = Record<PortalKimligi, string>;
const ayni = (etiket: string): PortalEtiketleri => ({ sahibinden: etiket, emlakjet: etiket, hepsiemlak: etiket });

/** Portal panellerindeki farklı adları tek EDM alanına bağlayan açık sözlük. */
export const PORTAL_ALAN_ADLARI: Record<string, PortalEtiketleri> = {
  'Brüt Yapı Alanı': { sahibinden: 'Brüt m²', emlakjet: 'Brüt m²', hepsiemlak: 'Brüt m²' },
  'Net Yapı Alanı': { sahibinden: 'Net m²', emlakjet: 'Net m²', hepsiemlak: 'Net m²' },
  'Arsa Alanı': { sahibinden: 'Arsa m²', emlakjet: 'Arsa Alanı', hepsiemlak: 'Arsa Alanı' },
  'Oda Sayısı': ayni('Oda Sayısı'),
  'Bina Yaşı': ayni('Bina Yaşı'),
  'Bulunduğu Kat': ayni('Bulunduğu Kat'),
  'Kat Sayısı': { sahibinden: 'Kat Sayısı', emlakjet: 'Binadaki Kat Sayısı', hepsiemlak: 'Bina Kat Sayısı' },
  'Isıtma Tipi': { sahibinden: 'Isıtma', emlakjet: 'Isıtma Tipi', hepsiemlak: 'Isıtma Tipi' },
  'Banyo Sayısı': ayni('Banyo Sayısı'),
  'Mutfak Tipi': { sahibinden: 'Mutfak', emlakjet: 'Mutfak Tipi', hepsiemlak: 'Mutfak Tipi' },
  'Konut Kat Tipi': { sahibinden: 'Konut Tipi', emlakjet: 'Konut Tipi', hepsiemlak: 'Konut Tipi' },
  'Site İçerisinde': ayni('Site İçerisinde'),
  'Site Adı': ayni('Site Adı'),
  'Aidat': { sahibinden: 'Aidat (TL)', emlakjet: 'Aidat', hepsiemlak: 'Aidat' },
  'Krediye Uygunluk': { sahibinden: 'Krediye Uygun', emlakjet: 'Krediye Uygunluk', hepsiemlak: 'Krediye Uygunluk' },
  'Tapu Durumu': ayni('Tapu Durumu'),
  'Takas': { sahibinden: 'Takaslı', emlakjet: 'Takas', hepsiemlak: 'Takas' },
  'Enerji Kimlik Belgesi': ayni('Enerji Kimlik Belgesi'),
  'Mülk Sahibi Statüsü': { sahibinden: 'Mülk Sahibi', emlakjet: 'Mülk Sahibi Türü', hepsiemlak: 'Mülk Sahibi Türü' },
  'Ada': ayni('Ada'),
  'Parsel': ayni('Parsel'),
  'Pafta': ayni('Pafta'),
};

const IC_ALANLAR = new Set([
  ...YETKI_ALANLARI.map((alan) => alan.anahtar),
  ...KONUM_YONETIM_ALANLARI.map((alan) => alan.anahtar),
  ...MEDYA_PORTAL_ALANLARI.map((alan) => alan.anahtar),
]);
IC_ALANLAR.delete('Mülk Sahibi Statüsü');

const BILINEN_ALANLAR = new Set([
  ...ILAN_GRUPLARI.flatMap((grup) => grup.bolumler.flatMap((bolum) => bolum.alanlar.map((alan) => alan.anahtar))),
  'Mülk Sahibi Statüsü',
]);

/**
 * Portal sözlüğü, istenirse seçili alt türün gerçekten kullanabildiği alanlarla
 * daraltılır. Böylece örneğin otel önizlemesinde kamp alanı alanı yer almaz.
 */
export function portalAlanEslemeTablosu(tipGrup: string, tip?: string): Array<{ edm: string } & PortalEtiketleri> {
  const grup = ILAN_GRUPLARI.find((aday) => aday.kimlik === tipGrup);
  const alanlar = new Set([
    ...(grup?.bolumler.flatMap((bolum) => bolum.alanlar
      .filter((alan) => !tip || !alan.tipler?.length || alan.tipler.includes(tip))
      .map((alan) => alan.anahtar)) ?? []),
    'Mülk Sahibi Statüsü',
  ]);
  return [...alanlar].map((edm) => ({ edm, ...(PORTAL_ALAN_ADLARI[edm] ?? ayni(edm)) }));
}

function kategoriYolu(girdi: PortalIlanGirdisi): string {
  return ['Emlak', islemEtiketi(girdi.islem), tipEtiketi(girdi.tipGrup, girdi.tip)].join(' > ');
}

function temelAlanlar(girdi: PortalIlanGirdisi): Array<[string, string]> {
  return [
    ['İlan No', girdi.id],
    ['İlan Başlığı', girdi.baslik],
    ['Açıklama', girdi.aciklama],
    ['Fiyat', girdi.fiyat == null ? '' : String(girdi.fiyat)],
    ['Para Birimi', girdi.paraBirimi],
    ['İşlem', islemEtiketi(girdi.islem)],
    ['Mülk Türü', tipEtiketi(girdi.tipGrup, girdi.tip)],
    ['İl', girdi.il ?? ''],
    ['İlçe', girdi.ilce ?? ''],
    ['Mahalle', girdi.mahalle ?? ''],
    ['Oda Sayısı', girdi.oda ?? ''],
    ['Alan', girdi.m2 == null ? '' : String(girdi.m2)],
  ].filter(([, deger]) => Boolean(deger));
}

function alanAltTurleUyumlu(girdi: PortalIlanGirdisi, anahtar: string): boolean {
  const grup = ILAN_GRUPLARI.find((aday) => aday.kimlik === girdi.tipGrup);
  const alan = grup?.bolumler.flatMap((bolum) => bolum.alanlar).find((aday) => aday.anahtar === anahtar);
  return !alan?.tipler?.length || alan.tipler.includes(girdi.tip);
}

function iletisimSec(girdi: PortalIlanGirdisi) {
  const tercih = girdi.ozellikler['Portal İletişim Tercihi'] || 'danisman';
  return {
    tercih,
    danisman: ['danisman', 'ikisi'].includes(tercih) && girdi.danisman
      ? `${girdi.danisman.ad} · ${girdi.danisman.telefon}` : null,
    ofis: ['ofis', 'ikisi'].includes(tercih) ? girdi.ofisTelefonu : null,
  };
}

export function portalAktariminiOnizle(girdi: PortalIlanGirdisi, portal: PortalKimligi): PortalAktarimOnizlemesi {
  const alanlar: PortalAlanSatiri[] = temelAlanlar(girdi).map(([edm, deger]) => ({ edm, portal: edm, deger, durum: 'dogrudan' }));
  const aciklamaEkleri: Array<{ alan: string; deger: string }> = [];
  const veriKaybi: string[] = [];
  const altTurleUyumsuzAlanlar: string[] = [];

  for (const [edm, deger] of Object.entries(girdi.ozellikler)) {
    if (!deger || IC_ALANLAR.has(edm)) continue;
    if (!alanAltTurleUyumlu(girdi, edm)) {
      altTurleUyumsuzAlanlar.push(edm);
      continue;
    }
    const portalEtiketi = PORTAL_ALAN_ADLARI[edm]?.[portal] ?? edm;
    if (BILINEN_ALANLAR.has(edm)) {
      alanlar.push({ edm, portal: portalEtiketi, deger, durum: portalEtiketi === edm ? 'dogrudan' : 'donusturuldu' });
    } else {
      aciklamaEkleri.push({ alan: edm, deger });
      alanlar.push({ edm, portal: 'Açıklama eki', deger: `${edm}: ${deger}`, durum: 'aciklamaya-eklendi' });
    }
  }

  const eksikler: string[] = [];
  if (girdi.baslik.trim().length < 20) eksikler.push('En az 20 karakterlik ilan başlığı');
  if (girdi.aciklama.trim().length < 80) eksikler.push('En az 80 karakterlik açıklama');
  if (!girdi.fiyat || girdi.fiyat <= 0) eksikler.push('Geçerli fiyat');
  if (!girdi.il || !girdi.ilce || !girdi.mahalle) eksikler.push('İl, ilçe ve mahalle');
  if (girdi.gorseller.length < 5) eksikler.push('En az 5 fotoğraf');

  const kesinKonum = girdi.ozellikler[PORTAL_KESIN_KONUM_IZNI_ANAHTARI] === 'izinli'
    ? kesinKoordinatiOku(girdi.ozellikler)
    : null;
  const uyarilar: string[] = [];
  if (altTurleUyumsuzAlanlar.length) uyarilar.push(`${altTurleUyumsuzAlanlar.length} eski alan seçili alt türle uyumsuz olduğu için aktarılmayacak.`);
  if (aciklamaEkleri.length) uyarilar.push(`${aciklamaEkleri.length} özel alan portalın açıklama ekine taşınacak.`);
  if (girdi.ozellikler[PORTAL_KESIN_KONUM_IZNI_ANAHTARI] === 'izinli' && !kesinKonum) uyarilar.push('Kesin konum aktarımı açık ancak geçerli koordinat yok.');
  if (girdi.ozellikler[PORTAL_KESIN_KONUM_IZNI_ANAHTARI] !== 'izinli') uyarilar.push('Kesin koordinat bu portala gönderilmeyecek.');
  if (portal === 'sahibinden' && girdi.baslik.length > 70) uyarilar.push('Başlık portal sınırına göre kısaltma isteyebilir; önizlemede veri korunur.');

  return {
    portal,
    portalAdi: PORTAL_ADLARI[portal],
    kategoriYolu: kategoriYolu(girdi),
    alanlar,
    gorseller: [...girdi.gorseller],
    donanim: [...girdi.donanim],
    medya: {
      video: girdi.video?.url ?? girdi.ozellikler['Video URL'] ?? null,
      poster: girdi.video?.poster ?? null,
      sanalTur: girdi.ozellikler['Sanal Tur URL'] ?? null,
    },
    iletisim: iletisimSec(girdi),
    kesinKonum,
    eksikler,
    uyarilar,
    aciklamaEkleri,
    veriKaybi,
  };
}

export function ucPortalOnizlemesi(girdi: PortalIlanGirdisi): PortalAktarimOnizlemesi[] {
  return (Object.keys(PORTAL_ADLARI) as PortalKimligi[]).map((portal) => portalAktariminiOnizle(girdi, portal));
}
