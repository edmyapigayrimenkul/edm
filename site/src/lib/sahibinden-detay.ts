import { SAHIBINDEN_DETAY_KATEGORILERI, SAHIBINDEN_DETAY_PROFILLERI } from './sahibinden-detay-verisi.ts';
import type { DonanimGrubu } from './ilan-bilgileri.ts';

function slug(value: string): string {
  return value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// EDM'deki okunabilir alt tür adları ile kaynak portalın kategori adları farklı olabilir.
const TIP_ESLEMELERI: Record<string, string> = {
  'isyeri|restoran-kafe': 'restoran-lokanta',
  'isyeri|is-hani': 'is-hani-kati-ofisi',
  'isyeri|arac-galerisi-servis': 'arac-galerisi-servis',
  'isyeri|eczane': 'eczane',
  'isyeri|etkinlik-alani': 'etkinlik-alani',
  'isyeri|piknik-alani-kahvalti-bahcesi': 'piknik-alani-kahvalti-bahcesi',
  'isyeri|yurt': 'yurt',
  'turistik|kamp-alani': 'kamp-yeri-mocamp',
};

export type SahibindenDetayEslesmeDurumu = 'dogrudan' | 'diger-islem-tek-profil' | 'yakin-islem-profili' | 'yakin-alt-tur-profili' | 'edm-genel';

const YAKIN_ALT_TUR_ESLEMELERI: Record<string, string> = {
  'konut|koy-evi': 'mustakil-ev',
  'konut|prefabrik-ev': 'mustakil-ev',
  'isyeri|sinema-konferans-salonu': 'toplanti-etkinlik-salonu',
};

// Kaynakta alt tür mevcut, fakat EDM'deki bu işlem adı birebir yoksa aynı türün
// en yakın Sahibinden işlem profilini açık uyarıyla kullan.
const YAKIN_ISLEM_ESLEME: Record<string, string> = {
  'konut|gunluk-kiralik': 'kiralik',
  'konut|sezonluk-kiralik': 'kiralik',
  'isyeri|kiralik|maden-ocagi': 'satilik',
  'isyeri|devren-satilik': 'satilik',
  'isyeri|devren-kiralik': 'kiralik',
  'turistik|gunluk-kiralik': 'kiralik',
  'turistik|sezonluk-kiralik': 'kiralik',
  'turistik|devren-satilik': 'satilik',
  'turistik|devren-kiralik': 'kiralik',
};

function tipAnahtariBul(grup: string, tip: string, tipEtiketi: string): string {
  return TIP_ESLEMELERI[`${grup}|${tip}`] ?? slug(tipEtiketi);
}

function dogrudanProfilIdBul(grup: string, islem: string, tipAnahtari: string): number | undefined {
  const tamAnahtar = `${grup}|${islem}|${tipAnahtari}`;
  const genelAnahtar = `${grup}|${islem}|*`;
  return SAHIBINDEN_DETAY_KATEGORILERI[tamAnahtar] ?? SAHIBINDEN_DETAY_KATEGORILERI[genelAnahtar];
}

function digerIslemTekProfilBul(grup: string, tipAnahtari: string): number | undefined {
  const profiller = new Set(Object.entries(SAHIBINDEN_DETAY_KATEGORILERI)
    .filter(([anahtar]) => anahtar.startsWith(`${grup}|`) && anahtar.endsWith(`|${tipAnahtari}`))
    .map(([, profilId]) => profilId));
  return profiller.size === 1 ? [...profiller][0] : undefined;
}

function yakinIslemProfiliBul(grup: string, islem: string, tipAnahtari: string): number | undefined {
  const yakinIslem = YAKIN_ISLEM_ESLEME[`${grup}|${islem}|${tipAnahtari}`]
    ?? YAKIN_ISLEM_ESLEME[`${grup}|${islem}`];
  return yakinIslem ? SAHIBINDEN_DETAY_KATEGORILERI[`${grup}|${yakinIslem}|${tipAnahtari}`] : undefined;
}

function yakinAltTurProfiliBul(grup: string, islem: string, tip: string): number | undefined {
  const yakinTip = YAKIN_ALT_TUR_ESLEMELERI[`${grup}|${tip}`];
  if (!yakinTip) return undefined;
  return dogrudanProfilIdBul(grup, islem, yakinTip) ?? yakinIslemProfiliBul(grup, islem, yakinTip);
}

/** Kaynak eşleşmesinin mevcut işlem için doğrudan mı, yoksa diğer işlemlerde tekil mi olduğunu belirtir. */
export function sahibindenDetayEslesmeDurumu(grup: string, islem: string, tip: string, tipEtiketi: string): SahibindenDetayEslesmeDurumu {
  const tipAnahtari = tipAnahtariBul(grup, tip, tipEtiketi);
  if (dogrudanProfilIdBul(grup, islem, tipAnahtari) !== undefined) return 'dogrudan';
  if (digerIslemTekProfilBul(grup, tipAnahtari) !== undefined) return 'diger-islem-tek-profil';
  if (yakinIslemProfiliBul(grup, islem, tipAnahtari) !== undefined) return 'yakin-islem-profili';
  return yakinAltTurProfiliBul(grup, islem, tip) !== undefined ? 'yakin-alt-tur-profili' : 'edm-genel';
}

function profilIdBul(grup: string, islem: string, tip: string, tipEtiketi: string): number | undefined {
  const tipAnahtari = tipAnahtariBul(grup, tip, tipEtiketi);
  return dogrudanProfilIdBul(grup, islem, tipAnahtari)
    ?? digerIslemTekProfilBul(grup, tipAnahtari)
    ?? yakinIslemProfiliBul(grup, islem, tipAnahtari)
    ?? yakinAltTurProfiliBul(grup, islem, tip);
}

/** Kaynak portalda bulunan detay grupları. null: güvenli tekil eşleşme yok. */
export function sahibindenDetayGruplari(grup: string, islem: string, tip: string, tipEtiketi: string): DonanimGrubu[] | null {
  const profilId = profilIdBul(grup, islem, tip, tipEtiketi);
  if (profilId === undefined) return null;
  return SAHIBINDEN_DETAY_PROFILLERI[profilId].map(([baslik, ogeListesi], sira) => ({
    kimlik: `kaynak-${slug(baslik)}-${sira}`,
    baslik,
    aciklama: 'Bu grupta yalnızca doğrulayabildiğiniz özellikleri işaretleyin.',
    ogeListesi,
    gerekli: true,
  }));
}
