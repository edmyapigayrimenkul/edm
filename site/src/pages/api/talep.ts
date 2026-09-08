/**
 * Form taleplerini karşılayan uç nokta.
 *
 * Değerleme ve iletişim formları buraya POST eder. Talep D1'e yazılır ve
 * e-posta bağlaması tanımlıysa bildirim gönderilir. E-posta gönderilemese
 * bile talep kaydedilir — ikisi birbirine bağlı değil.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { epostaGonder } from '../../lib/eposta';

interface Talep {
  tur?: string;
  ad?: string;
  telefon?: string;
  eposta?: string;
  konu?: string;
  tip?: string;
  ilce?: string;
  mahalle?: string;
  m2?: string;
  not?: string;
  mesaj?: string;
  kaynak?: string;
  website?: string; // bot tuzağı
}

const JSON_BASLIK = { 'Content-Type': 'application/json; charset=utf-8' };
const yanit = (govde: unknown, durum = 200) =>
  new Response(JSON.stringify(govde), { status: durum, headers: JSON_BASLIK });

/** Girdiyi kırpar ve aşırı uzun değerleri keser. */
function temizle(deger: unknown, enFazla = 500): string | null {
  if (typeof deger !== 'string') return null;
  const kirpik = deger.trim();
  return kirpik ? kirpik.slice(0, enFazla) : null;
}

export const POST: APIRoute = async ({ request }) => {
  const vt = env.VT as D1Database;

  let veri: Talep;
  try {
    veri = await request.json();
  } catch {
    return yanit({ hata: 'Geçersiz istek gövdesi.' }, 400);
  }

  // Bot tuzağı doluysa sessizce başarı dön — bota ipucu vermiyoruz.
  if (veri.website) return yanit({ tamam: true });

  const ad = temizle(veri.ad, 120);
  const telefon = temizle(veri.telefon, 40);

  if (!ad || !telefon) return yanit({ hata: 'Ad ve telefon gerekli.' }, 400);
  if (telefon.replace(/\D/g, '').length < 10) {
    return yanit({ hata: 'Telefon numarası geçerli görünmüyor.' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const ulke = request.headers.get('CF-IPCountry');

  // Basit hız sınırı: aynı numaradan 2 dakika içinde ikinci talep alınmaz.
  try {
    const son = await vt
      .prepare(
        `SELECT COUNT(*) AS adet FROM talepler
         WHERE telefon = ? AND olusturma > datetime('now', '-2 minutes')`
      )
      .bind(telefon)
      .first<{ adet: number }>();
    if ((son?.adet ?? 0) > 0) return yanit({ tamam: true, not: 'zaten alındı' });
  } catch {
    // Sorgu başarısızsa talebi yine de kaydetmeyi deniyoruz.
  }

  const kayit = {
    tur: temizle(veri.tur, 30) ?? 'iletisim',
    ad,
    telefon,
    eposta: temizle(veri.eposta, 160),
    konu: temizle(veri.konu, 160),
    mulk_tipi: temizle(veri.tip, 80),
    ilce: temizle(veri.ilce, 80),
    mahalle: temizle(veri.mahalle, 120),
    m2: Number.parseInt(String(veri.m2 ?? ''), 10) || null,
    mesaj: temizle(veri.not ?? veri.mesaj, 4000),
    kaynak: temizle(veri.kaynak, 200),
    ip_ulke: ulke,
  };

  try {
    await vt
      .prepare(
        `INSERT INTO talepler
           (tur, ad, telefon, eposta, konu, mulk_tipi, ilce, mahalle, m2, mesaj, kaynak, ip_ulke)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
      )
      .bind(
        kayit.tur,
        kayit.ad,
        kayit.telefon,
        kayit.eposta,
        kayit.konu,
        kayit.mulk_tipi,
        kayit.ilce,
        kayit.mahalle,
        kayit.m2,
        kayit.mesaj,
        kayit.kaynak,
        kayit.ip_ulke
      )
      .run();
  } catch (hata) {
    console.error('Talep kaydedilemedi:', hata);
    return yanit({ hata: 'Talep kaydedilemedi.' }, 500);
  }

  await bildirimGonder(kayit, ip).catch((h) => console.error('Bildirim gönderilemedi:', h));

  return yanit({ tamam: true });
};

/** Talep bildirimi — ortak e-posta modülü üzerinden. */
async function bildirimGonder(kayit: Record<string, unknown>, ip: string): Promise<void> {
  const konu =
    kayit.tur === 'degerleme'
      ? `Değerleme talebi — ${kayit.ad}`
      : `İletişim formu — ${kayit.ad}`;

  const govde = [
    ['Ad Soyad', kayit.ad],
    ['Telefon', kayit.telefon],
    ['E-posta', kayit.eposta],
    ['Konu', kayit.konu],
    ['Mülk tipi', kayit.mulk_tipi],
    ['İlçe', kayit.ilce],
    ['Mahalle', kayit.mahalle],
    ['Büyüklük', kayit.m2 ? `${kayit.m2} m²` : null],
    ['Mesaj', kayit.mesaj],
    ['Geldiği sayfa', kayit.kaynak],
    ['IP', ip],
  ]
    .filter(([, deger]) => Boolean(deger))
    .map(([etiket, deger]) => `${etiket}: ${deger}`)
    .join('\n');

  await epostaGonder(env as never, konu, `${govde}\n\nPanel: https://edmyapigayrimenkul.com/yonetim/talepler`);
}
