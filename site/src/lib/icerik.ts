/**
 * Panelden yönetilen içerik: ekip, yorumlar, iletişim bilgileri.
 *
 * Koddaki değerler artık "varsayılan"; gerçek kaynak D1. Tablo boşsa ilk
 * okumada koddaki değerlerle tohumlanır, böylece panel açıldığında karşınıza
 * boş ekran değil mevcut içerik çıkar.
 */

import { env } from 'cloudflare:workers';
import { istekVerisi, istekVerisiniTemizle } from './istek-onbellegi';
import {
  DANISMANLAR as VARSAYILAN_EKIP,
  ILETISIM as VARSAYILAN_ILETISIM,
  HIZMETLER as VARSAYILAN_HIZMETLER,
  type Danisman,
} from './site';

export interface Yorum {
  id: number;
  ad: string;
  metin: string;
  kaynak: string;
  tarih: string | null;
  puan: number | null;
  konu: string | null;
  yayinda: number;
  sira: number;
  /* Google'dan gelen yorumlarda atıf alanları — politikaları yazanın
     adını, avatarını ve yorumun aslına bağlantıyı zorunlu kılıyor. */
  dis_kimlik?: string | null;
  foto?: string | null;
  profil_url?: string | null;
  google_url?: string | null;
}

export interface Iletisim {
  /* Google'dan senkronla gelen genel değerlendirme — ayarlar tablosunda. */
  google_puan?: string;
  google_yorum_sayisi?: string;
  google_harita_url?: string;

  telefon: string;
  telefonHam: string;
  /** Ofisin sabit hattı — Google kaydındaki numara. */
  sabit: string;
  sabitHam: string;
  whatsapp: string;
  eposta: string;
  adresSatir1: string;
  adresSatir2: string;
  adresIlce: string;
  adresIl: string;
  haftaCalismaGunleri: string;
  haftaCalismaSaatleri: string;
  pazarCalismaSaatleri: string;
  yanitBeklentisi: string;
}

export interface Hizmet {
  anahtar: string;
  baslik: string;
  ozet: string;
}

/** Bölge rehberindeki elle yazılan tanıtım metni. */
export interface BolgeMetni {
  anahtar: string;
  giris: string;
  notlar: string[];
}

export interface Icerik {
  ekip: Danisman[];
  yorumlar: Yorum[];
  iletisim: Iletisim;
  hizmetler: Hizmet[];
  bolgeMetinleri: Map<string, BolgeMetni>;
}

const AYAR_VARSAYILAN: Iletisim = {
  telefon: VARSAYILAN_ILETISIM.telefon,
  telefonHam: VARSAYILAN_ILETISIM.telefonHam,
  sabit: VARSAYILAN_ILETISIM.sabit,
  sabitHam: VARSAYILAN_ILETISIM.sabitHam,
  whatsapp: VARSAYILAN_ILETISIM.whatsapp,
  eposta: VARSAYILAN_ILETISIM.eposta,
  adresSatir1: VARSAYILAN_ILETISIM.adres.satir1,
  adresSatir2: VARSAYILAN_ILETISIM.adres.satir2,
  adresIlce: VARSAYILAN_ILETISIM.adres.ilce,
  adresIl: VARSAYILAN_ILETISIM.adres.il,
  haftaCalismaGunleri: VARSAYILAN_ILETISIM.haftaCalismaGunleri,
  haftaCalismaSaatleri: VARSAYILAN_ILETISIM.haftaCalismaSaatleri,
  pazarCalismaSaatleri: VARSAYILAN_ILETISIM.pazarCalismaSaatleri,
  yanitBeklentisi: VARSAYILAN_ILETISIM.yanitBeklentisi,
};

function vt(): D1Database {
  return env.VT as D1Database;
}

/* ---------------------------------------------------------------
   Tohumlama — tablo boşsa koddaki değerleri yaz
   --------------------------------------------------------------- */
async function ekibiTohumla(): Promise<void> {
  const yazmalar = VARSAYILAN_EKIP.map((d, i) =>
    vt()
      .prepare(
        `INSERT OR IGNORE INTO ekip
           (slug, emlakjet_slug, ad, unvan, telefon, eposta, foto, uzmanlik, hakkinda, sira, yayinda)
         VALUES (?,?,?,?,?,?,?,?,?,?,1)`
      )
      .bind(
        d.slug,
        d.emlakjetSlug || null,
        d.ad,
        d.unvan,
        d.telefon ?? null,
        d.eposta ?? null,
        d.foto ?? null,
        JSON.stringify(d.uzmanlik),
        d.hakkinda,
        i
      )
  );
  if (yazmalar.length) await vt().batch(yazmalar);
}

async function hizmetleriTohumla(): Promise<void> {
  const suAn = new Date().toISOString();
  const yazmalar = VARSAYILAN_HIZMETLER.map((h, i) =>
    vt()
      .prepare(
        `INSERT OR IGNORE INTO metinler (tur, anahtar, baslik, govde, sira, yayinda, guncelleme)
         VALUES ('hizmet',?,?,?,?,1,?)`
      )
      .bind(String(i), h.baslik, h.ozet, i, suAn)
  );
  if (yazmalar.length) await vt().batch(yazmalar);
}

async function ayarlariTohumla(): Promise<void> {
  const suAn = new Date().toISOString();
  const yazmalar = Object.entries(AYAR_VARSAYILAN).map(([anahtar, deger]) =>
    vt()
      .prepare(`INSERT OR IGNORE INTO ayarlar (anahtar, deger, guncelleme) VALUES (?,?,?)`)
      .bind(anahtar, String(deger), suAn)
  );
  if (yazmalar.length) await vt().batch(yazmalar);
}

/* ---------------------------------------------------------------
   Okuma — yalnız aynı istek içinde paylaşılır
   --------------------------------------------------------------- */
export async function icerik(): Promise<Icerik> {
  return istekVerisi('icerik', icerigiOku);
}

async function icerigiOku(): Promise<Icerik> {
  let ekipSatirlari = await vt()
    .prepare(`SELECT * FROM ekip WHERE yayinda = 1 ORDER BY sira ASC, ad ASC`)
    .all<Record<string, unknown>>();

  if ((ekipSatirlari.results ?? []).length === 0) {
    await ekibiTohumla();
    ekipSatirlari = await vt()
      .prepare(`SELECT * FROM ekip WHERE yayinda = 1 ORDER BY sira ASC, ad ASC`)
      .all<Record<string, unknown>>();
  }

  let ayarSatirlari = await vt()
    .prepare(`SELECT anahtar, deger FROM ayarlar`)
    .all<{ anahtar: string; deger: string }>();

  if ((ayarSatirlari.results ?? []).length === 0) {
    await ayarlariTohumla();
    ayarSatirlari = await vt()
      .prepare(`SELECT anahtar, deger FROM ayarlar`)
      .all<{ anahtar: string; deger: string }>();
  }

  const yorumSatirlari = await vt()
    .prepare(`SELECT * FROM yorumlar WHERE yayinda = 1 ORDER BY sira ASC, id DESC`)
    .all<Yorum>();

  let hizmetSatirlari = await vt()
    .prepare(
      `SELECT anahtar, baslik, govde FROM metinler
       WHERE tur = 'hizmet' AND yayinda = 1 ORDER BY sira ASC`
    )
    .all<{ anahtar: string; baslik: string; govde: string }>()
    .catch(() => ({ results: [] as Array<{ anahtar: string; baslik: string; govde: string }> }));

  if ((hizmetSatirlari.results ?? []).length === 0) {
    await hizmetleriTohumla().catch(() => {});
    hizmetSatirlari = await vt()
      .prepare(
        `SELECT anahtar, baslik, govde FROM metinler
         WHERE tur = 'hizmet' AND yayinda = 1 ORDER BY sira ASC`
      )
      .all<{ anahtar: string; baslik: string; govde: string }>()
      .catch(() => ({ results: [] }));
  }

  const bolgeSatirlari = await vt()
    .prepare(
      `SELECT anahtar, govde, ek FROM metinler WHERE tur = 'bolge' AND yayinda = 1`
    )
    .all<{ anahtar: string; govde: string; ek: string | null }>()
    .catch(() => ({ results: [] as Array<{ anahtar: string; govde: string; ek: string | null }> }));

  const ayarHarita = Object.fromEntries(
    (ayarSatirlari.results ?? []).map((a) => [a.anahtar, a.deger])
  );

  const veri: Icerik = {
    ekip: (ekipSatirlari.results ?? []).map((s) => ({
      slug: String(s.slug),
      emlakjetSlug: (s.emlakjet_slug as string) ?? '',
      ad: String(s.ad),
      unvan: String(s.unvan),
      telefon: (s.telefon as string) ?? undefined,
      eposta: (s.eposta as string) ?? undefined,
      foto: (s.foto as string) ?? undefined,
      uzmanlik: guvenliJson<string[]>(String(s.uzmanlik ?? '[]'), []),
      hakkinda: String(s.hakkinda ?? ''),
    })),
    yorumlar: yorumSatirlari.results ?? [],
    iletisim: { ...AYAR_VARSAYILAN, ...(ayarHarita as Partial<Iletisim>) },
    hizmetler: (hizmetSatirlari.results ?? []).map((h) => ({
      anahtar: h.anahtar,
      baslik: h.baslik,
      ozet: h.govde,
    })),
    bolgeMetinleri: new Map(
      (bolgeSatirlari.results ?? []).map((b) => [
        b.anahtar,
        {
          anahtar: b.anahtar,
          giris: b.govde ?? '',
          notlar: guvenliJson<string[]>(b.ek ?? '[]', []),
        },
      ])
    ),
  };

  return veri;
}

export function icerikOnbellegiTemizle(): void {
  istekVerisiniTemizle('icerik');
  istekVerisiniTemizle('bolgeler');
}

function guvenliJson<T>(metin: string, varsayilan: T): T {
  try {
    return JSON.parse(metin) as T;
  } catch {
    return varsayilan;
  }
}

/** WhatsApp bağlantısı — numara artık ayarlardan geliyor. */
export function whatsappBaglanti(numara: string, mesaj?: string): string {
  const temel = `https://wa.me/${numara}`;
  return mesaj ? `${temel}?text=${encodeURIComponent(mesaj)}` : temel;
}

/** Google Haritalar arama bağlantısı — adres ayarlardan kuruluyor. */
export function haritaBaglanti(i: Iletisim): string {
  const adres = `EDM Yapı Gayrimenkul ${i.adresSatir1} ${i.adresIlce} ${i.adresIl}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adres)}`;
}
