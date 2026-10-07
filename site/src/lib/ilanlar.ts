/**
 * İlan veri katmanı.
 *
 * Kaynak: D1 veritabanı (zamanlanmış görev Emlakjet'ten doldurur).
 * Sunumla ilgili her dönüşüm burada; sayfalar ham satır görmez.
 *
 * Portföy aynı sayfa isteğinde bir kez okunur. İstekler arası hızlandırma
 * HTML önbelleğindedir; eski veri yeni HTML'in ömrünü uzatamaz.
 */

import { env } from 'cloudflare:workers';
import { istekVerisi, istekVerisiniTemizle } from './istek-onbellegi';
import { icerik } from './icerik';
import {
  aktifIlanSatirlari,
  sonSenkron,
  duzenlemeleriGetir,
  type SatirIlan,
  type DuzenlemeKaydi,
} from './senkron/depo';
import { koordinatHaritasi, konumAnahtari, type Koordinat } from './senkron/konum';
import { yuklenenFotograflar } from './senkron/foto-sema';
import { videoKayitlari, type IlanVideoKaydi } from './senkron/video-sema';
import { halkaAcikOzellikler, islemEtiketi } from './ilan-bilgileri';
import {
  gorunurIlanIdleri,
  iliskiliIlanIdleri,
  kaynakOzellikleriniUygula,
  kaynakSunumDuzeltmesi,
  mukerrerKanonikId,
} from './ilan-butunlugu';
import { arsaToplamAlani } from './portfoy-istatistikleri';
import { alanOzellikleriniBirlestir, ilanAlanlariniCoz, type IlanAlanlari } from './ilan-alanlari';
import { kamuKonumuSec, ozelKonumAlanlariniGizle } from './ilan-konum';
import { vitrinIlanlariniDengele } from './vitrin';
import { portalGorselleriniSec } from './portal-gorselleri';

export type Islem = 'satilik' | 'kiralik' | 'gunluk-kiralik' | 'sezonluk-kiralik' | 'devren-satilik' | 'devren-kiralik' | 'kat-karsiligi-satilik';
export type TipGrup = 'konut' | 'arsa' | 'isyeri' | 'bina' | 'turistik' | 'proje' | 'devre-mulk' | 'gunluk-konaklama' | 'diger';

export interface Ilan {
  id: string;
  kaynak: string;
  kaynakUrl: string;
  baslik: string;
  aciklama: string;
  fiyat: number | null;
  paraBirimi: string;
  islem: Islem;
  kategori: string;
  tip: string;
  tipGrup: TipGrup;
  oda: string | null;
  m2: number | null;
  il: string | null;
  ilce: string | null;
  mahalle: string | null;
  ozellikler: Record<string, string>;
  /** Onaylı özellikler: ankastre mutfak, çelik kapı, ebeveyn banyo… */
  donanim: string[];
  gorseller: string[];
  video: { url: string; poster: string; mime: string; sure: number; boyut: number } | null;
  danismanSlug: string | null;
  guncellenme: string | null;
  ilkGorulme: string;

  slug: string;
  yol: string;
  baslikTemiz: string;
  konum: string;
  konumKisa: string;
  fiyatMetin: string;
  alanlar: IlanAlanlari;
  birimFiyat: string | null;
  birimFiyatTemeli: string | null;
  ozetMetin: string;
  yeniMi: boolean;
  kapak: string | null;
  etiketler: string[];
  /** Halka açık yaklaşık merkez — kesin adres değildir. Bulunamadıysa null. */
  koordinat: Koordinat | null;
  /** Kamu haritasındaki yaklaşık alanın yarıçapı. */
  koordinatYaricapi: number;
  /** Arama için düzleştirilmiş metin: başlık, konum, özellikler, açıklama. */
  aramaMetni: string;
}

/* ---------------------------------------------------------------
   Yazım düzeltmeleri — Marka Kılavuzu 05
   Portföyde tespit edilen gerçek hatalar. Yalnızca tam kelime
   eşleşmesinde uygulanır; şüpheli hiçbir şeye dokunulmaz.
   --------------------------------------------------------------- */
const YAZIM_DUZELTME: Array<[RegExp, string]> = [
  [/\bKıralık\b/g, 'Kiralık'],
  [/\bKıralik\b/g, 'Kiralık'],
  [/\bMahlede\b/g, 'Mahalle’de'],
  [/\bMahlesi\b/g, 'Mahallesi'],
  [/\bHiseli\b/g, 'Hisseli'],
  [/\bAcill\b/g, 'Acil'],
  [/\bessiz\b/gi, 'eşsiz'],
  [/\bKlasiss\b/g, 'Klassis'],
  [/\bSilivride\b/g, 'Silivri’de'],
  [/\bSilivrid[ae]n\b/g, 'Silivri’den'],
  [/\bAnayola\b/g, 'Ana Yola'],
];

function olculeriDuzelt(metin: string): string {
  return metin
    .replace(/(\d[\d.\s]*?)\s*(?:m²|m2\b)/gi, (_, sayi: string) => {
      const n = parseInt(sayi.replace(/[^\d]/g, ''), 10);
      return Number.isFinite(n) ? `${n.toLocaleString('tr-TR')} m²` : `${sayi} m²`;
    })
    .replace(/(\d[\d.\s]*?)\s*Metrekare/gi, (_, sayi: string) => {
      const n = parseInt(sayi.replace(/[^\d]/g, ''), 10);
      return Number.isFinite(n) ? `${n.toLocaleString('tr-TR')} m²` : `${sayi} m²`;
    })
    .replace(/m²(?=\p{L})/giu, 'm² ');
}

export function baslikTemizle(baslik: string): string {
  let s = baslik.trim();
  for (const [desen, yerine] of YAZIM_DUZELTME) s = s.replace(desen, yerine);
  return olculeriDuzelt(s).replace(/\s{2,}/g, ' ').trim();
}

/* ---------------------------------------------------------------
   Biçimlendiriciler
   --------------------------------------------------------------- */
const TR = 'tr-TR';

const PARA_SIMGE: Record<string, string> = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };
function paraSimgesi(paraBirimi: string): string { return PARA_SIMGE[paraBirimi] ?? paraBirimi }

/** 7150000 -> "7.150.000 ₺" (Kılavuz 05: rakamdan sonra, boşlukla) */
export function fiyatYaz(fiyat: number | null, islem?: Islem, paraBirimi = 'TRY'): string {
  if (islem === 'kat-karsiligi-satilik') return 'Kat karşılığı';
  if (!fiyat) return 'Fiyat için arayınız';
  const s = `${fiyat.toLocaleString(TR)} ${paraSimgesi(paraBirimi)}`;
  if (islem === 'kiralik') return `${s} / ay`;
  if (islem === 'gunluk-kiralik') return `${s} / gün`;
  if (islem === 'sezonluk-kiralik') return `${s} / sezon`;
  return s;
}

/** Kart üstünde okunaklı kısa fiyat: 7.150.000 -> "7,15 milyon ₺" */
export function fiyatKisa(fiyat: number | null, paraBirimi = 'TRY', islem?: Islem): string {
  if (islem === 'kat-karsiligi-satilik') return 'Kat karşılığı';
  if (!fiyat) return '—';
  const simge = paraSimgesi(paraBirimi);
  if (fiyat >= 1_000_000) {
    const mn = fiyat / 1_000_000;
    const basamak = mn >= 100 ? 0 : mn >= 10 ? 1 : 2;
    return `${mn.toLocaleString(TR, { maximumFractionDigits: basamak })} milyon ${simge}`;
  }
  if (fiyat >= 1_000) return `${(fiyat / 1_000).toLocaleString(TR)} bin ${simge}`;
  return `${fiyat.toLocaleString(TR)} ${simge}`;
}

export function m2Yaz(m2: number | null): string | null {
  return m2 ? `${m2.toLocaleString(TR)} m²` : null;
}

function birimFiyatYaz(fiyat: number | null, m2: number | null, islem: Islem, paraBirimi: string): string | null {
  if (!fiyat || !m2 || m2 < 1 || islem !== 'satilik') return null;
  const birim = fiyat / m2;
  return birim < 1 ? null : `${Math.round(birim).toLocaleString(TR)} ${paraSimgesi(paraBirimi)}/m²`;
}

/* ---------------------------------------------------------------
   Adres parçaları
   --------------------------------------------------------------- */
const TR_HARF: Record<string, string> = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o',
  ş: 's', Ş: 's', ü: 'u', Ü: 'u', â: 'a', î: 'i', û: 'u', '’': '', "'": '',
};

export function slugla(metin: string): string {
  return metin
    .split('')
    .map((h) => TR_HARF[h] ?? h)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '');
}

/* ---------------------------------------------------------------
   Satır -> İlan
   --------------------------------------------------------------- */
function guvenliJson<T>(metin: string | null | undefined, varsayilan: T): T {
  if (!metin) return varsayilan;
  try {
    return (JSON.parse(metin) as T | null) ?? varsayilan;
  } catch {
    return varsayilan;
  }
}

function etiketleriSec(oda: string | null, alanlar: IlanAlanlari, o: Record<string, string>): string[] {
  const cikti: string[] = [];
  if (oda) cikti.push(oda);
  const alanEkle = (etiket: string, m2: number | null) => {
    const alan = m2Yaz(m2);
    if (alan && cikti.length < 3) cikti.push(`${etiket} ${alan}`);
  };
  if (alanlar.beyanEdilen != null) cikti.push('Alan kapsamı teyit edilecek');
  if (alanlar.toplamParsel != null || alanlar.satilanHisse != null) {
    alanEkle('Hisse', alanlar.satilanHisse);
    alanEkle('Parsel', alanlar.toplamParsel);
  } else {
    alanEkle('Brüt', alanlar.brutYapi);
    if (alanlar.netYapi !== alanlar.brutYapi) alanEkle('Net', alanlar.netYapi);
    if (alanlar.arsa !== alanlar.brutYapi && alanlar.arsa !== alanlar.netYapi) alanEkle('Arsa', alanlar.arsa);
  }

  const oncelik: Array<[string, string, string]> = [
    ['Site İçerisinde', 'Evet', 'Site içi'],
    ['Krediye Uygunluk', 'Krediye Uygun', 'Krediye uygun'],
    ['Eşya Durumu', 'Eşyalı', 'Eşyalı'],
    ['Asansör', 'Var', 'Asansörlü'],
    ['Otopark', 'Var', 'Otoparklı'],
  ];
  for (const [anahtar, beklenen, etiket] of oncelik) {
    if (cikti.length >= 3) break;
    if (o[anahtar] === beklenen) cikti.push(etiket);
  }
  for (const anahtar of ['İmar Durumu', 'Tapu Durumu']) {
    if (cikti.length >= 3) break;
    if (o[anahtar] && o[anahtar] !== 'Belirtilmemiş') cikti.push(o[anahtar]);
  }
  return cikti.slice(0, 3);
}

function ozetle(aciklama: string, uzunluk = 155): string {
  const duz = aciklama.replace(/\s+/g, ' ').trim();
  if (duz.length <= uzunluk) return duz;
  const kesit = duz.slice(0, uzunluk);
  const son = Math.max(kesit.lastIndexOf('. '), kesit.lastIndexOf(', '), kesit.lastIndexOf(' '));
  return `${kesit.slice(0, son > 60 ? son : uzunluk).trim()}…`;
}

const YENI_GUN = 21;

/**
 * Arama için düzleştirilmiş metin.
 *
 * Sadece başlığa bakmak yetmiyor: "deniz manzaralı", "krediye uygun",
 * "site içi", "Klassis" gibi ifadeler açıklamada ya da özellik listesinde
 * geçiyor. Hepsini tek bir metinde topluyoruz. Türkçe karakterlerin
 * hem kendisini hem sadeleştirilmiş halini yazıyoruz ki "sarıyer" arayan
 * "sariyer" yazdığında da bulsun.
 */
function aramaMetniKur(
  baslikTemiz: string,
  s: SatirIlan,
  ozellikler: Record<string, string>,
  islem: Islem,
  etiketler: string[]
): string {
  const fiyatKelimeleri: string[] = [];
  if (s.fiyat) {
    fiyatKelimeleri.push(String(s.fiyat));
    if (s.fiyat >= 1_000_000) fiyatKelimeleri.push(`${Math.round(s.fiyat / 1_000_000)} milyon`);
  }

  const parcalar = [
    baslikTemiz,
    s.kategori,
    s.tip,
    islemEtiketi(islem).toLocaleLowerCase('tr-TR'),
    s.oda ?? '',
    s.mahalle ?? '',
    s.ilce ?? '',
    s.il ?? '',
    s.m2 ? `${s.m2} m2 metrekare` : '',
    ...etiketler,
    ...guvenliJson<string[]>(s.donanim ?? '[]', []),
    ...Object.entries(ozellikler)
      .filter(([, v]) => v && v !== 'Belirtilmemiş' && v !== 'Yok')
      .flatMap(([k, v]) => [k, v]),
    ...fiyatKelimeleri,
    // Açıklamanın tamamı değil başı: "deniz manzaralı", "site içinde" gibi
    // ayırt edici ifadeler hemen hep ilk cümlelerde geçiyor.
    s.aciklama.slice(0, 600),
  ];

  const ham = parcalar.join(' ').toLocaleLowerCase('tr').replace(/\s+/g, ' ');
  const sade = ham
    .split('')
    .map((h) => TR_HARF[h] ?? h)
    .join('');

  return ham === sade ? ham : `${ham} ${sade}`;
}

export interface GorselDuzen {
  sira: string[];
  gizli: string[];
}

/** Panelden yapılan görsel sıralaması ve gizlemeleri. */
async function gorselDuzenleri(vt: D1Database): Promise<Map<string, GorselDuzen>> {
  try {
    const sonuc = await vt
      .prepare(`SELECT ilan_id, sira, gizli FROM ilan_gorsel_duzen`)
      .all<{ ilan_id: string; sira: string; gizli: string }>();
    return new Map(
      (sonuc.results ?? []).map((s) => [
        s.ilan_id,
        { sira: guvenliJson<string[]>(s.sira, []), gizli: guvenliJson<string[]>(s.gizli, []) },
      ])
    );
  } catch {
    return new Map();
  }
}

/**
 * Görselleri panel düzenine göre sıralar.
 * Sırada adı geçenler önce ve verilen sırayla, geri kalanlar arkasına;
 * gizlenenler hiç dönmüyor. Böylece yeni bir fotoğraf eklendiğinde
 * düzen bozulmadan listenin sonuna ekleniyor.
 */
function gorselleriDuzenle(gorseller: string[], duzen?: GorselDuzen): string[] {
  if (!duzen) return gorseller;
  const gizli = new Set(duzen.gizli);
  const gorunur = gorseller.filter((g) => !gizli.has(g));
  if (!duzen.sira.length) return gorunur;

  const siraNo = new Map(duzen.sira.map((g, i) => [g, i]));
  return [...gorunur].sort((a, b) => {
    const x = siraNo.get(a);
    const y = siraNo.get(b);
    if (x === undefined && y === undefined) return 0;
    if (x === undefined) return 1;
    if (y === undefined) return -1;
    return x - y;
  });
}

function satirdanIlan(
  s: SatirIlan,
  koordinatlar: Map<string, Koordinat>,
  duzen?: GorselDuzen,
  yuklenen?: string[],
  duzenleme?: DuzenlemeKaydi,
  videoKaydi?: IlanVideoKaydi
): Ilan {
  const temel = guvenliJson<Partial<SatirIlan>>(duzenleme?.temel, {});
  const kaynakDuzeltme = kaynakSunumDuzeltmesi(s.id);
  // Kimlik ve kaynak senkron kaydına aittir; yalnızca sunum alanları geçersiz
  // kılınabilir. Böylece paneldeki fiyat/kategori kararı sonraki senkronda kaybolmaz.
  const etkin: SatirIlan = {
    ...s,
    baslik: duzenleme?.baslik ?? temel.baslik ?? kaynakDuzeltme?.baslik ?? s.baslik,
    aciklama: duzenleme?.aciklama ?? temel.aciklama ?? kaynakDuzeltme?.aciklama ?? s.aciklama,
    fiyat: temel.fiyat ?? s.fiyat,
    para_birimi: temel.para_birimi ?? s.para_birimi,
    islem: temel.islem ?? s.islem,
    kategori: temel.kategori ?? s.kategori,
    tip: temel.tip ?? s.tip,
    tip_grup: temel.tip_grup ?? s.tip_grup,
    oda: temel.oda ?? s.oda,
    m2: temel.m2 !== undefined ? temel.m2 : s.m2,
    il: temel.il ?? s.il,
    ilce: temel.ilce ?? s.ilce,
    mahalle: temel.mahalle ?? s.mahalle,
    gorseller: temel.gorseller ?? s.gorseller,
    danisman_slug: temel.danisman_slug !== undefined ? temel.danisman_slug : s.danisman_slug,
    id: s.id,
    kaynak: s.kaynak,
    kaynak_url: s.kaynak_url,
  };
  const baslikTemiz = baslikTemizle(etkin.baslik);
  const slug = `${slugla(baslikTemiz)}-${etkin.id}`;
  const izinliIslemler: Islem[] = ['satilik', 'kiralik', 'gunluk-kiralik', 'sezonluk-kiralik', 'devren-satilik', 'devren-kiralik', 'kat-karsiligi-satilik'];
  const islem = izinliIslemler.includes(etkin.islem as Islem) ? etkin.islem as Islem : 'satilik';
  const hamOzellikler = guvenliJson<Record<string, string>>(etkin.ozellikler, {});
  const duzOzellikler = duzenleme?.ozellikler ? guvenliJson<Record<string, string>>(duzenleme.ozellikler, {}) : {};
  const ozellikler = alanOzellikleriniBirlestir({
    tipGrup: etkin.tip_grup,
    m2: etkin.m2,
    ozellikler: temel.ozellikler != null
      ? guvenliJson<Record<string, string>>(temel.ozellikler, {})
      : kaynakOzellikleriniUygula(hamOzellikler, kaynakDuzeltme),
  }, duzOzellikler, Boolean(duzenleme?.temel && duzenleme?.ozellikler));
  const alanlar = ilanAlanlariniCoz({ tipGrup: etkin.tip_grup, m2: etkin.m2, ozellikler });

  // En dolu portal setini göster. Hepsiemlak fotoğrafı sayısı eşitse daha
  // yüksek çözünürlük ve marka görünümü nedeniyle Hepsiemlak seçilir.
  const emlakjetGorselleri = guvenliJson<string[]>(etkin.gorseller, []);
  const hepsiemlakGorselleri = etkin.hepsiemlak_gorseller
    ? guvenliJson<string[]>(etkin.hepsiemlak_gorseller, [])
    : [];
  // Panelden yüklenenler en önde: tek bir iyi kapak yüklemek yeterli olsun,
  // kalan kareler portaldan gelmeye devam etsin.
  const portalGorselleri = portalGorselleriniSec(emlakjetGorselleri, hepsiemlakGorselleri);
  const hamGorseller = [...(yuklenen ?? []), ...portalGorselleri];
  const gorseller = gorselleriDuzenle(hamGorseller, duzen);
  const zaman = Date.parse(etkin.guncellenme ?? etkin.ilk_gorulme);
  const etiketler = etiketleriSec(etkin.oda, alanlar, ozellikler);
  const hamDonanim = guvenliJson<string[]>(etkin.donanim ?? '[]', []);
  const duzDonanim = duzenleme?.donanim != null ? guvenliJson<string[]>(duzenleme.donanim, []) : null;
  const donanim = duzDonanim ?? hamDonanim;
  const mahalleKoordinati = koordinatlar.get(konumAnahtari(etkin.mahalle, etkin.ilce, etkin.il)) ?? null;
  const kamuKonumu = kamuKonumuSec(etkin.id, ozellikler, mahalleKoordinati);

  return {
    id: etkin.id,
    kaynak: etkin.kaynak,
    kaynakUrl: etkin.kaynak_url,
    baslik: etkin.baslik,
    aciklama: etkin.aciklama,
    fiyat: etkin.fiyat,
    paraBirimi: etkin.para_birimi || 'TRY',
    islem,
    kategori: etkin.kategori,
    tip: etkin.tip,
    tipGrup: (etkin.tip_grup as TipGrup) ?? 'diger',
    oda: etkin.oda,
    m2: etkin.m2,
    il: etkin.il,
    ilce: etkin.ilce,
    mahalle: etkin.mahalle,
    ozellikler: ozelKonumAlanlariniGizle(ozellikler),
    donanim,
    gorseller,
    video: videoKaydi ? {
      url: `/g/${videoKaydi.video_anahtar}`,
      poster: `/g/${videoKaydi.poster_anahtar}`,
      mime: videoKaydi.mime,
      sure: videoKaydi.sure_saniye,
      boyut: videoKaydi.boyut,
    } : null,
    danismanSlug: etkin.danisman_slug,
    guncellenme: etkin.guncellenme,
    ilkGorulme: etkin.ilk_gorulme,

    slug,
    yol: `/ilan/${slug}`,
    baslikTemiz,
    konum: [etkin.mahalle, etkin.ilce, etkin.il].filter(Boolean).join(' · ') || 'Türkiye',
    konumKisa: [etkin.ilce, etkin.il].filter(Boolean).join(' / ') || 'Türkiye',
    fiyatMetin: fiyatYaz(etkin.fiyat, islem, etkin.para_birimi || 'TRY'),
    alanlar,
    birimFiyat: birimFiyatYaz(etkin.fiyat, alanlar.karsilastirmaM2, islem, etkin.para_birimi || 'TRY'),
    birimFiyatTemeli: islem === 'satilik' ? alanlar.birimFiyatTemeli : null,
    ozetMetin: ozetle(etkin.aciklama),
    yeniMi: Number.isFinite(zaman) && Date.now() - zaman < YENI_GUN * 86_400_000,
    kapak: gorseller[0] ?? null,
    etiketler,
    koordinat: kamuKonumu.koordinat,
    koordinatYaricapi: kamuKonumu.yaricap,
    aramaMetni: aramaMetniKur(baslikTemiz, etkin, halkaAcikOzellikler(ozellikler), islem, etiketler),
  };
}

/* ---------------------------------------------------------------
   Portföy — kısa ömürlü önbellekli tek okuma
   --------------------------------------------------------------- */
export interface FiltreSecenek {
  deger: string;
  etiket: string;
  adet: number;
}

export interface Portfoy {
  ilanlar: Ilan[];
  filtreler: {
    islem: FiltreSecenek[];
    tipGrup: FiltreSecenek[];
    tip: FiltreSecenek[];
    ilce: FiltreSecenek[];
    mahalle: FiltreSecenek[];
    oda: FiltreSecenek[];
    il: FiltreSecenek[];
  };
  sayimlar: {
    toplam: number;
    satilik: number;
    kiralik: number;
    konut: number;
    arsa: number;
    ilce: number;
    gorsel: number;
    arsaToplamAlan: number;
  };
  sonGuncelleme: string;
}

function say(degerler: Array<{ deger: string | null; etiket: string }>): FiltreSecenek[] {
  const harita = new Map<string, { etiket: string; adet: number }>();
  for (const { deger, etiket } of degerler) {
    if (!deger) continue;
    const mevcut = harita.get(deger);
    if (mevcut) mevcut.adet += 1;
    else harita.set(deger, { etiket, adet: 1 });
  }
  return [...harita]
    .map(([deger, { etiket, adet }]) => ({ deger, etiket, adet }))
    .sort((a, b) => b.adet - a.adet);
}

const TIP_ETIKET: Record<string, string> = {
  konut: 'Konut',
  arsa: 'Arsa & Tarla',
  isyeri: 'İş Yeri',
  bina: 'Komple Bina',
  turistik: 'Turistik Tesis',
  proje: 'Konut Projesi',
  diger: 'Diğer',
};

export async function portfoy(): Promise<Portfoy> {
  return istekVerisi('portfoy', portfoyuOku);
}

async function portfoyuOku(): Promise<Portfoy> {
  const vt = env.VT as D1Database;
  const [satirlar, koordinatlar, duzenler, yuklenenler, duzenlemeler, videolar] = await Promise.all([
    aktifIlanSatirlari(vt),
    koordinatHaritasi(vt),
    gorselDuzenleri(vt),
    yuklenenFotograflar(vt),
    duzenlemeleriGetir(vt),
    videoKayitlari(vt),
  ]);
  const tumIlanlar = satirlar.map((satir) =>
    satirdanIlan(
      satir,
      koordinatlar,
      duzenler.get(satir.id),
      yuklenenler.get(satir.id),
      duzenlemeler.get(satir.id),
      videolar.get(satir.id)
    )
  );
  // Yeniden açılmış aynı taşınmaz kayıtlarını silmeden kamu portföyünde tekilleştir.
  // Ana kayıt kaynakta yoksa eski kayıt görünür kalır.
  const gorunurIdler = gorunurIlanIdleri(tumIlanlar.map((ilan) => ilan.id));
  const ilanlar = tumIlanlar.filter((ilan) => gorunurIdler.has(ilan.id));
  const senkron = await sonSenkron(vt).catch(() => null);

  const veri: Portfoy = {
    ilanlar,
    filtreler: {
      islem: say(
        ilanlar.map((i) => ({
          deger: i.islem,
          etiket: islemEtiketi(i.islem),
        }))
      ),
      tipGrup: say(
        ilanlar.map((i) => ({ deger: i.tipGrup, etiket: TIP_ETIKET[i.tipGrup] ?? i.tipGrup }))
      ),
      tip: say(
        ilanlar.map((i) => ({
          deger: i.tip,
          etiket: i.tip.charAt(0).toLocaleUpperCase('tr') + i.tip.slice(1),
        }))
      ),
      ilce: say(
        ilanlar.map((i) => ({
          deger: i.ilce,
          etiket: i.il && i.ilce !== i.il ? `${i.ilce} / ${i.il}` : (i.ilce ?? ''),
        }))
      ),
      mahalle: say(
        ilanlar.map((i) => ({
          deger: i.mahalle,
          etiket: i.ilce ? `${i.mahalle ?? ''} / ${i.ilce}` : (i.mahalle ?? ''),
        }))
      ),
      oda: say(ilanlar.map((i) => ({ deger: i.oda, etiket: i.oda ?? '' }))),
      il: say(ilanlar.map((i) => ({ deger: i.il, etiket: i.il ?? '' }))),
    },
    sayimlar: {
      toplam: ilanlar.length,
      satilik: ilanlar.filter((i) => i.islem === 'satilik').length,
      kiralik: ilanlar.filter((i) => i.islem === 'kiralik').length,
      konut: ilanlar.filter((i) => i.tipGrup === 'konut').length,
      arsa: ilanlar.filter((i) => i.tipGrup === 'arsa').length,
      ilce: new Set(ilanlar.map((i) => i.ilce).filter(Boolean)).size,
      gorsel: ilanlar.reduce((t, i) => t + i.gorseller.length, 0),
      arsaToplamAlan: arsaToplamAlani(ilanlar),
    },
    sonGuncelleme: senkron?.bitis ?? new Date().toISOString(),
  };

  return veri;
}

/** Senkron sonrası önbelleği düşürür. */
export function onbellegiTemizle(): void {
  istekVerisiniTemizle('portfoy');
  istekVerisiniTemizle('bolgeler');
}

/* ---------------------------------------------------------------
   Sorgular
   --------------------------------------------------------------- */
export async function ilanBul(slug: string): Promise<Ilan | undefined> {
  const { ilanlar } = await portfoy();
  const bulunan = ilanlar.find((i) => i.slug === slug);
  if (bulunan) return bulunan;

  // Başlık değişip slug kaydığında ilan numarasından yakala (en az 6 haneli rakam)
  const idEsleme = slug.match(/(\d{6,})$/);
  if (idEsleme) {
    const istenenId = idEsleme[1];
    const kanonikId = mukerrerKanonikId(istenenId) ?? istenenId;
    const idIle = ilanlar.find((i) => i.id === kanonikId) ?? ilanlar.find((i) => i.id === istenenId);
    if (idIle) return idIle;
  }

  const elleIle = ilanlar.find((i) => i.id.startsWith('elle-') && slug.endsWith(`-${i.id}`));
  if (elleIle) return elleIle;

  // elle- veya serbest id eşleşmesi (slug sonundaki id parçası)
  const sonTire = slug.lastIndexOf('-');
  if (sonTire > -1) {
    const adayId = slug.slice(sonTire + 1);
    const adayIle = ilanlar.find((i) => i.id === adayId || i.id === `elle-${adayId}`);
    if (adayIle) return adayIle;
  }

  return ilanlar.find((i) => i.id === slug);
}

export async function danismaninIlanlari(slug: string): Promise<Ilan[]> {
  const [{ ilanlar }, { ekip }] = await Promise.all([portfoy(), icerik()]);
  const danisman = ekip.find((d) => d.slug === slug || d.emlakjetSlug === slug);
  const anahtarlar = new Set([slug, danisman?.slug, danisman?.emlakjetSlug].filter(Boolean));
  return ilanlar.filter((i) => i.danismanSlug && anahtarlar.has(i.danismanSlug));
}

/* ---------------------------------------------------------------
   Açıklama metnini okunur hâle getirme

   Portaldan gelen açıklamalarda satır sonu yok — 46 ilanın 46'sında.
   Sayfa paragraflara bölmeye çalışıyordu ama bölecek bir şey bulamıyor,
   metin tek blok hâlinde akıyordu (ortalama 1.636 karakter).

   İçeride portalın izleri de var: madde işareti olarak kullanılmış ✅ ve
   yıldızlar, "DaireDAİRE" gibi yapışmış kelimeler, arada tamamı büyük
   harfle yazılmış ilanlar.

   Burada metnin kendisine dokunmuyoruz — yalnızca nerede durduğunu ve
   nasıl yazıldığını düzeltiyoruz.
   --------------------------------------------------------------- */

/** Portalın madde işareti olarak kullandığı simgeler. */
const MADDE_SIMGESI = /[\u2705\u2714\u2611\u2713\u2022\u25AA\u25CF\u25C6\u25BA\u27A4\u2605\u2606\u00BB]/gu;

/** Büyük harf çözülürken olduğu gibi kalması gerekenler. */
const KISALTMA: Record<string, string> = {
  edm: 'EDM', tl: 'TL', kdv: 'KDV', kaks: 'KAKS', taks: 'TAKS',
  toki: 'TOKİ', sgk: 'SGK', tapu: 'tapu',
};

/**
 * Bu ilanda özel ad sayılacak kelimeler.
 *
 * Başlık zaten düzgün yazılmış olduğu için oradaki büyük harfle başlayan
 * kelimeler güvenilir bir sözlük veriyor: site adı, mahalle, mevki.
 * Böylece "BASINKENT" büyük harften çözülürken "basınkent" olmuyor.
 */
/**
 * Başlıklarda büyük harfle geçen ama özel ad olmayan kelimeler.
 *
 * Sözlüğü ilan başlıklarından da besliyoruz — site ve mevki adları oradan
 * geliyor. Ama başlıkta "Müstakil", "Satılık", "Köyünde" gibi cins isimler
 * de büyük harfle duruyor; bunlar sözlüğe girerse cümle ortasında yersiz
 * büyük harf çıkıyor.
 */
const TUR_KELIMESI = new Set([
  'satılık', 'kiralık', 'daire', 'villa', 'arsa', 'tarla', 'dükkan', 'ofis',
  'müstakil', 'köyünde', 'köyü', 'mahallesi', 'mahallesinde', 'mahalle',
  'mevkii', 'mevki', 'sitesi', 'sitesinde', 'içerisinde', 'üzerinde', 'yanı',
  'acil', 'lüks', 'kupon', 'yatırımlık', 'hisse', 'imarlı', 'manzaralı',
  'eşyalı', 'sıfır', 'modern', 'özel', 'havuzlu', 'otoparklı', 'ısıtmalı',
  'yerden', 'kapalı', 'merkezde', 'merkez', 'dönüm', 'deniz', 'geniş',
  'yaşında', 'kredi', 'uygun', 'nehri', 'yeni', 'full', 'triplex', 'tripleks',
]);

async function ozelAdlar(ilan: Ilan): Promise<Set<string>> {
  const kume = new Set(['trakya', 'marmara', 'saros']);
  const ekle = (metin: string | null | undefined) => {
    if (!metin) return;
    for (const kelime of metin.split(/[^\p{L}\p{N}]+/u)) {
      if (kelime.length > 2 && kelime[0] === kelime[0].toLocaleUpperCase('tr')) {
        const kucuk = kelime.toLocaleLowerCase('tr');
        if (!TUR_KELIMESI.has(kucuk)) kume.add(kucuk);
      }
    }
  };

  // Portföyün kendi yer adları: mahalle, ilçe, il. Yeni bir mahalleye
  // ilan girildiğinde sözlük kendiliğinden büyüyor.
  const { ilanlar } = await portfoy();
  for (const o of ilanlar) {
    ekle(o.mahalle);
    ekle(o.ilce);
    ekle(o.il);
  }
  ekle(ilan.baslikTemiz);
  return kume;
}

/** Bir kelimenin tamamı büyük harf mi. */
function tumuBuyukMu(kelime: string): boolean {
  const harfler = kelime.match(/\p{L}/gu);
  if (!harfler || harfler.length < 2) return false;
  return harfler.every((h) => h === h.toLocaleUpperCase('tr'));
}

/** Küçültülmüş bir kelimeyi kısaltma ve özel ad sözlüğüne göre düzeltir. */
function kelimeyiDuzelt(parca: string, adlar: Set<string>): string {
  return parca.replace(/\p{L}[\p{L}\u2019']*/gu, (kelime) => {
    const kisa = KISALTMA[kelime];
    if (kisa) return kisa;
    const bas = (k: string) => k.charAt(0).toLocaleUpperCase('tr') + k.slice(1);
    if (adlar.has(kelime)) return bas(kelime);
    // Türkçede ek kelimeye yapışıyor: "selimpaşanın" da özel ad sayılmalı.
    for (const ad of adlar) {
      if (ad.length >= 5 && kelime.startsWith(ad)) return bas(kelime);
    }
    return kelime;
  });
}

/**
 * Büyük harfle bağıran bölümleri normal yazıma döndürür.
 *
 * Ölçüyü paragrafın tamamında almak işe yaramıyor: portalda karışık
 * metinler var — büyük harfli bir giriş, ardından düzgün yazılmış tanıtım.
 * Böyle bir paragrafta büyük harf oranı %75'te kalıyor ve hiçbir şey
 * düzelmiyor. Onun yerine ardışık büyük harfli kelime dizilerini arıyoruz;
 * altı kelime üst üste bağırıyorsa orası bir blok sayılıyor. Normal
 * metinde arada geçen özel adlar bu eşiği aşmıyor.
 */
function buyukHarfCoz(metin: string, adlar: Set<string>): string {
  const parcalar = metin.split(/(\s+)/);
  const kelimeYerleri = parcalar
    .map((p, i) => ({ p, i }))
    .filter((x) => x.p.trim() !== '')
    .map((x) => x.i);

  // "&", ":" gibi harfsiz parçalar diziyi bölmesin — "ŞOKK EDM YAPI &
  // GAYRİMENKULDEN ..." tek bir bağırma bloğu, ortasındaki & yüzünden
  // üçe düşüp eşiğin altında kalmamalı.
  const harfsiz = (k: string) => !/\p{L}/u.test(k);
  const durum = kelimeYerleri.map((yer) =>
    harfsiz(parcalar[yer]) ? 'notr' : tumuBuyukMu(parcalar[yer]) ? 'buyuk' : 'kucuk'
  );

  const donusecek = new Set<number>();
  let i = 0;
  while (i < kelimeYerleri.length) {
    if (durum[i] !== 'buyuk') {
      i++;
      continue;
    }
    let j = i;
    let sayi = 0;
    let sonBuyuk = i;
    while (j < kelimeYerleri.length && durum[j] !== 'kucuk') {
      if (durum[j] === 'buyuk') {
        sayi++;
        sonBuyuk = j;
      }
      j++;
    }
    if (sayi >= 6) for (let k = i; k <= sonBuyuk; k++) donusecek.add(kelimeYerleri[k]);
    i = j;
  }
  if (!donusecek.size) return metin;

  const cikti = parcalar
    .map((parca, yer) =>
      donusecek.has(yer) ? kelimeyiDuzelt(parca.toLocaleLowerCase('tr'), adlar) : parca
    )
    .join('');

  return cikti
    .replace(/(^|[.!?:]\s+)(\p{Ll})/gu, (_, once, harf) => once + harf.toLocaleUpperCase('tr'))
    // "yapı" ve "gayrimenkul" tek başlarına cins isim; marka olarak
    // yalnızca bu kalıpta geçtiğinde büyük harfe dönüyor.
    .replace(/EDM\s+yapı(\s*&\s*|\s+ve\s+)gayrimenkul/giu, 'EDM Yapı & Gayrimenkul');
}

/** Uzun kalan bir bloğu cümlelerden bölerek paragraf boyuna indirir. */
function cumleyeBol(metin: string): string[] {
  const cumleler = metin.split(/(?<=[.!?])\s+(?=\p{Lu})/gu);
  const gruplar: string[] = [];
  let birikim = '';
  for (const cumle of cumleler) {
    birikim = birikim ? `${birikim} ${cumle}` : cumle;
    if (birikim.length >= 220) {
      gruplar.push(birikim);
      birikim = '';
    }
  }
  if (birikim) gruplar.push(birikim);
  return gruplar;
}

/** Açıklamayı okunabilir paragraflara böler. */
export async function aciklamaParcala(ilan: Ilan): Promise<string[]> {
  const adlar = await ozelAdlar(ilan);

  const duzeltilmis = (ilan.aciklama ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(MADDE_SIMGESI, '\n')
    .replace(/\*+/g, '\n')
    // "DaireDAİRE ÖZELLİKLERİ" gibi yapışmış kelimeleri ayır
    .replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')
    .replace(/[ \t]+/g, ' ');

  return duzeltilmis
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => (p.length <= 320 ? [p] : cumleyeBol(p)))
    .map((p) => buyukHarfCoz(p, adlar))
    // Kaynak metin küçük harfle başlıyor olabiliyor.
    .map((p) => p.charAt(0).toLocaleUpperCase('tr') + p.slice(1))
    .filter((p) => p.length > 1);
}

/** Aynı ilçede, aynı işlemde, fiyatça en yakın ilanlar. */
export async function benzerIlanlar(ilan: Ilan, adet = 3): Promise<Ilan[]> {
  const { ilanlar } = await portfoy();
  const ayniTasinmaz = new Set(iliskiliIlanIdleri(ilan.id));
  const puan = (o: Ilan) => {
    let p = 0;
    if (o.ilce === ilan.ilce) p += 3;
    if (o.il === ilan.il) p += 1;
    if (o.tipGrup === ilan.tipGrup) p += 2;
    if (o.islem === ilan.islem) p += 2;
    if (ilan.fiyat && o.fiyat) {
      p += (Math.min(ilan.fiyat, o.fiyat) / Math.max(ilan.fiyat, o.fiyat)) * 2;
    }
    return p;
  };
  return ilanlar
    .filter((o) => o.id !== ilan.id && !ayniTasinmaz.has(o.id))
    .sort((a, b) => puan(b) - puan(a))
    .slice(0, adet);
}

/** Aynı taşınmazın satış/kiralama gibi diğer aktif işlem seçenekleri. */
export async function baglantiliIlanlar(ilan: Ilan): Promise<Ilan[]> {
  const idler = new Set(iliskiliIlanIdleri(ilan.id));
  if (!idler.size) return [];
  const { ilanlar } = await portfoy();
  return ilanlar.filter((kayit) => idler.has(kayit.id));
}

/**
 * Ana sayfa seçkisi: fiyatı yüksek ve yeterince görselli ilanlar önce gelir,
 * ancak daire, villa ve arazi mümkün olduğunda aynı vitrinde dengelenir.
 */
export async function oneCikanlar(adet = 6): Promise<Ilan[]> {
  const { ilanlar } = await portfoy();
  const gorselZengin = (i: Ilan) => i.gorseller.length >= 5;
  const fiyataGore = (a: Ilan, b: Ilan) => (b.fiyat ?? 0) - (a.fiyat ?? 0);
  const uygun = ilanlar.filter(gorselZengin).sort(fiyataGore);
  const temel = vitrinIlanlariniDengele(uygun, adet);
  if (temel.length >= adet) return temel;
  const seciliIdler = new Set(temel.map((i) => i.id));
  const yedek = vitrinIlanlariniDengele(
    [...ilanlar].filter((i) => !seciliIdler.has(i.id)).sort(fiyataGore),
    adet - temel.length
  );
  return [...temel, ...yedek].slice(0, adet);
}

/**
 * Ana sayfa kahramanının altındaki fotoğraf şeridi.
 *
 * Amaç ilan pazarlamak değil, ilk ekranda "burada gerçek mülkler var"
 * hissini vermek. Bu yüzden en pahalıları değil, fotoğrafı en iyi olanları
 * seçiyoruz: temiz kaynaktan gelenler (yatay çekim, filigransız) önce.
 */
export async function seritIcin(adet = 10): Promise<Ilan[]> {
  const { ilanlar } = await portfoy();

  const puan = (i: Ilan) => {
    let p = 0;
    // Temiz kaynaktan gelen görsel her zaman önde
    if (i.gorseller[0]?.includes('hemlak.com')) p += 10;
    if (i.gorseller.length >= 8) p += 3;
    else if (i.gorseller.length >= 4) p += 1;
    // Konut fotoğrafı arsa uydu görüntüsünden iyi durur
    if (i.tipGrup === 'konut') p += 4;
    return p;
  };

  const secili: Ilan[] = [];
  const kullanilanIlce = new Map<string, number>();

  // Aynı mahalleden üst üste iki kare koymayalım; şerit çeşitli görünsün.
  for (const ilan of [...ilanlar].sort((a, b) => puan(b) - puan(a))) {
    if (!ilan.kapak) continue;
    const anahtar = ilan.ilce ?? '—';
    const sayi = kullanilanIlce.get(anahtar) ?? 0;
    if (sayi >= 3) continue;
    secili.push(ilan);
    kullanilanIlce.set(anahtar, sayi + 1);
    if (secili.length === adet) break;
  }

  return secili;
}
