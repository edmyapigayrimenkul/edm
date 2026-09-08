/**
 * Panelden yönetilen içerik: ekip, yorumlar, iletişim bilgileri.
 *
 * Koddaki değerler artık "varsayılan"; gerçek kaynak D1. Tablo boşsa ilk
 * okumada koddaki değerlerle tohumlanır, böylece panel açıldığında karşınıza
 * boş ekran değil mevcut içerik çıkar.
 */

import { env } from 'cloudflare:workers';
import {
  DANISMANLAR as VARSAYILAN_EKIP,
  ILETISIM as VARSAYILAN_ILETISIM,
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
}

export interface Iletisim {
  telefon: string;
  telefonHam: string;
  whatsapp: string;
  eposta: string;
  adresSatir1: string;
  adresSatir2: string;
  adresIlce: string;
  adresIl: string;
}

export interface Icerik {
  ekip: Danisman[];
  yorumlar: Yorum[];
  iletisim: Iletisim;
}

const AYAR_VARSAYILAN: Iletisim = {
  telefon: VARSAYILAN_ILETISIM.telefon,
  telefonHam: VARSAYILAN_ILETISIM.telefonHam,
  whatsapp: VARSAYILAN_ILETISIM.whatsapp,
  eposta: VARSAYILAN_ILETISIM.eposta,
  adresSatir1: VARSAYILAN_ILETISIM.adres.satir1,
  adresSatir2: VARSAYILAN_ILETISIM.adres.satir2,
  adresIlce: VARSAYILAN_ILETISIM.adres.ilce,
  adresIl: VARSAYILAN_ILETISIM.adres.il,
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
   Okuma — 60 saniyelik önbellekle
   --------------------------------------------------------------- */
let onbellek: { veri: Icerik; zaman: number } | null = null;
const ONBELLEK_MS = 60_000;

export async function icerik(): Promise<Icerik> {
  if (onbellek && Date.now() - onbellek.zaman < ONBELLEK_MS) return onbellek.veri;

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
  };

  onbellek = { veri, zaman: Date.now() };
  return veri;
}

export function icerikOnbellegiTemizle(): void {
  onbellek = null;
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
