/**
 * İlan veri katmanı.
 *
 * Kaynak: D1 veritabanı (zamanlanmış görev Emlakjet'ten doldurur).
 * Sunumla ilgili her dönüşüm burada; sayfalar ham satır görmez.
 *
 * Portföy 50 civarı kayıt olduğu için tamamını tek seferde okuyup kısa
 * ömürlü bir önbellekte tutuyoruz — her istekte D1'e gitmenin anlamı yok.
 */

import { env } from 'cloudflare:workers';
import { aktifIlanSatirlari, sonSenkron, type SatirIlan } from './senkron/depo';
import { koordinatHaritasi, konumAnahtari, type Koordinat } from './senkron/konum';
import { yuklenenFotograflar } from './senkron/foto-sema';

export type Islem = 'satilik' | 'kiralik';
export type TipGrup = 'konut' | 'arsa' | 'isyeri' | 'diger';

export interface Ilan {
  id: string;
  kaynak: string;
  kaynakUrl: string;
  baslik: string;
  aciklama: string;
  fiyat: number | null;
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
  danismanSlug: string | null;
  guncellenme: string | null;
  ilkGorulme: string;

  slug: string;
  yol: string;
  baslikTemiz: string;
  konum: string;
  konumKisa: string;
  fiyatMetin: string;
  m2Metin: string | null;
  birimFiyat: string | null;
  ozetMetin: string;
  yeniMi: boolean;
  kapak: string | null;
  etiketler: string[];
  /** Mahalle merkezi — kesin adres değil. Bulunamadıysa null. */
  koordinat: Koordinat | null;
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
    });
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

/** 7150000 -> "7.150.000 ₺" (Kılavuz 05: rakamdan sonra, boşlukla) */
export function fiyatYaz(fiyat: number | null, islem?: Islem): string {
  if (!fiyat) return 'Fiyat için arayınız';
  const s = `${fiyat.toLocaleString(TR)} ₺`;
  return islem === 'kiralik' ? `${s} / ay` : s;
}

/** Kart üstünde kısaltılmış fiyat: 7.150.000 -> "7,15 mn ₺" */
export function fiyatKisa(fiyat: number | null): string {
  if (!fiyat) return '—';
  if (fiyat >= 1_000_000) {
    const mn = fiyat / 1_000_000;
    const basamak = mn >= 100 ? 0 : mn >= 10 ? 1 : 2;
    return `${mn.toLocaleString(TR, { maximumFractionDigits: basamak })} mn ₺`;
  }
  if (fiyat >= 1_000) return `${(fiyat / 1_000).toLocaleString(TR)} bin ₺`;
  return `${fiyat.toLocaleString(TR)} ₺`;
}

export function m2Yaz(m2: number | null): string | null {
  return m2 ? `${m2.toLocaleString(TR)} m²` : null;
}

function birimFiyatYaz(fiyat: number | null, m2: number | null, islem: Islem): string | null {
  if (!fiyat || !m2 || m2 < 1 || islem !== 'satilik') return null;
  const birim = fiyat / m2;
  return birim < 1 ? null : `${Math.round(birim).toLocaleString(TR)} ₺/m²`;
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
function guvenliJson<T>(metin: string, varsayilan: T): T {
  try {
    return JSON.parse(metin) as T;
  } catch {
    return varsayilan;
  }
}

function etiketleriSec(oda: string | null, m2: number | null, o: Record<string, string>): string[] {
  const cikti: string[] = [];
  if (oda) cikti.push(oda);
  const alan = m2Yaz(m2);
  if (alan) cikti.push(alan);

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
    islem === 'satilik' ? 'satılık' : 'kiralık',
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
  yuklenen?: string[]
): Ilan {
  const baslikTemiz = baslikTemizle(s.baslik);
  const slug = `${slugla(baslikTemiz)}-${s.id}`;
  const islem = (s.islem === 'kiralik' ? 'kiralik' : 'satilik') as Islem;
  const ozellikler = guvenliJson<Record<string, string>>(s.ozellikler, {});
  // Hepsiemlak görselleri varsa onları kullan: yatay çekim, daha yüksek
  // çözünürlük ve üzerinde rakip portalın değil ofisin kendi logosu var.
  const emlakjetGorselleri = guvenliJson<string[]>(s.gorseller, []);
  const hepsiemlakGorselleri = s.hepsiemlak_gorseller
    ? guvenliJson<string[]>(s.hepsiemlak_gorseller, [])
    : [];
  // Panelden yüklenenler en önde: tek bir iyi kapak yüklemek yeterli olsun,
  // kalan kareler portaldan gelmeye devam etsin.
  const portalGorselleri = hepsiemlakGorselleri.length
    ? hepsiemlakGorselleri
    : emlakjetGorselleri;
  const hamGorseller = [...(yuklenen ?? []), ...portalGorselleri];
  const gorseller = gorselleriDuzenle(hamGorseller, duzen);
  const zaman = Date.parse(s.guncellenme ?? s.ilk_gorulme);
  const etiketler = etiketleriSec(s.oda, s.m2, ozellikler);
  const donanim = guvenliJson<string[]>(s.donanim ?? '[]', []);

  return {
    id: s.id,
    kaynak: s.kaynak,
    kaynakUrl: s.kaynak_url,
    baslik: s.baslik,
    aciklama: s.aciklama,
    fiyat: s.fiyat,
    islem,
    kategori: s.kategori,
    tip: s.tip,
    tipGrup: (s.tip_grup as TipGrup) ?? 'diger',
    oda: s.oda,
    m2: s.m2,
    il: s.il,
    ilce: s.ilce,
    mahalle: s.mahalle,
    ozellikler,
    donanim,
    gorseller,
    danismanSlug: s.danisman_slug,
    guncellenme: s.guncellenme,
    ilkGorulme: s.ilk_gorulme,

    slug,
    yol: `/ilan/${slug}`,
    baslikTemiz,
    konum: [s.mahalle, s.ilce, s.il].filter(Boolean).join(' · ') || 'Türkiye',
    konumKisa: [s.ilce, s.il].filter(Boolean).join(' / ') || 'Türkiye',
    fiyatMetin: fiyatYaz(s.fiyat, islem),
    m2Metin: m2Yaz(s.m2),
    birimFiyat: birimFiyatYaz(s.fiyat, s.m2, islem),
    ozetMetin: ozetle(s.aciklama),
    yeniMi: Number.isFinite(zaman) && Date.now() - zaman < YENI_GUN * 86_400_000,
    kapak: gorseller[0] ?? null,
    etiketler,
    koordinat: koordinatlar.get(konumAnahtari(s.mahalle, s.ilce, s.il)) ?? null,
    aramaMetni: aramaMetniKur(baslikTemiz, s, ozellikler, islem, etiketler),
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
    toplamAlan: number;
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
  diger: 'Diğer',
};

let onbellek: { veri: Portfoy; zaman: number } | null = null;
const ONBELLEK_MS = 60_000;

export async function portfoy(): Promise<Portfoy> {
  if (onbellek && Date.now() - onbellek.zaman < ONBELLEK_MS) return onbellek.veri;

  const vt = env.VT as D1Database;
  const [satirlar, koordinatlar, duzenler, yuklenenler] = await Promise.all([
    aktifIlanSatirlari(vt),
    koordinatHaritasi(vt),
    gorselDuzenleri(vt),
    yuklenenFotograflar(vt),
  ]);
  const ilanlar = satirlar.map((satir) =>
    satirdanIlan(satir, koordinatlar, duzenler.get(satir.id), yuklenenler.get(satir.id))
  );
  const senkron = await sonSenkron(vt).catch(() => null);

  const veri: Portfoy = {
    ilanlar,
    filtreler: {
      islem: say(
        ilanlar.map((i) => ({
          deger: i.islem,
          etiket: i.islem === 'satilik' ? 'Satılık' : 'Kiralık',
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
      toplamAlan: ilanlar.reduce((t, i) => t + (i.m2 ?? 0), 0),
    },
    sonGuncelleme: senkron?.bitis ?? new Date().toISOString(),
  };

  onbellek = { veri, zaman: Date.now() };
  return veri;
}

/** Senkron sonrası önbelleği düşürür. */
export function onbellegiTemizle(): void {
  onbellek = null;
}

/* ---------------------------------------------------------------
   Sorgular
   --------------------------------------------------------------- */
export async function ilanBul(slug: string): Promise<Ilan | undefined> {
  const { ilanlar } = await portfoy();
  const bulunan = ilanlar.find((i) => i.slug === slug);
  if (bulunan) return bulunan;
  // Başlık değişip slug kaydığında ilan numarasından yakala
  const idEsleme = slug.match(/(\d{6,})$/);
  return idEsleme ? ilanlar.find((i) => i.id === idEsleme[1]) : undefined;
}

export async function danismaninIlanlari(emlakjetSlug: string): Promise<Ilan[]> {
  const { ilanlar } = await portfoy();
  return ilanlar.filter((i) => i.danismanSlug === emlakjetSlug);
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
    .filter((o) => o.id !== ilan.id)
    .sort((a, b) => puan(b) - puan(a))
    .slice(0, adet);
}

/**
 * Ana sayfa seçkisi.
 *
 * Sadece fiyata göre sıralamak işe yaramıyor: en pahalı ilanlar büyük tarlalar
 * ve onların görselleri uydu ekran görüntüsü. Vitrin kartı gerçek fotoğrafı olan
 * bir konut olmalı; arsa tarafı da temsil edilsin diye ikisini dönüşümlü diziyoruz.
 */
export async function oneCikanlar(adet = 6): Promise<Ilan[]> {
  const { ilanlar } = await portfoy();
  const gorselZengin = (i: Ilan) => i.gorseller.length >= 5;
  const fiyataGore = (a: Ilan, b: Ilan) => (b.fiyat ?? 0) - (a.fiyat ?? 0);

  const konutlar = ilanlar.filter((i) => i.tipGrup === 'konut' && gorselZengin(i)).sort(fiyataGore);
  const araziler = ilanlar.filter((i) => i.tipGrup === 'arsa' && gorselZengin(i)).sort(fiyataGore);

  const secili: Ilan[] = [];
  const ekle = (ilan: Ilan | undefined) => {
    if (ilan && !secili.includes(ilan)) secili.push(ilan);
  };

  ekle(konutlar[0]);

  let k = 1;
  let a = 0;
  while (secili.length < adet && (k < konutlar.length || a < araziler.length)) {
    if (secili.length % 3 === 0 && a < araziler.length) ekle(araziler[a++]);
    else if (k < konutlar.length) ekle(konutlar[k++]);
    else if (a < araziler.length) ekle(araziler[a++]);
    else break;
  }

  for (const ilan of [...ilanlar].sort(fiyataGore)) {
    if (secili.length >= adet) break;
    ekle(ilan);
  }

  return secili.slice(0, adet);
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
