/**
 * Form taleplerini karşılayan uç nokta.
 *
 * Değerleme ve iletişim formları buraya POST eder. Talep D1'e yazılır ve
 * e-posta bağlaması tanımlıysa bildirim gönderilir. E-posta gönderilemese
 * bile talep kaydedilir — ikisi birbirine bağlı değil.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { talebiKaydet, talepBildiriminiGonder } from '../../lib/talep-bildirim';
import { talebiDogrula } from '../../lib/talep-dogrulama';
import { semayiKur } from '../../lib/senkron/depo';

const JSON_BASLIK = { 'Content-Type': 'application/json; charset=utf-8' };
const yanit = (govde: unknown, durum = 200, ekBasliklar: Record<string, string> = {}) =>
  new Response(JSON.stringify(govde), { status: durum, headers: { ...JSON_BASLIK, ...ekBasliklar } });

interface HizSiniri {
  limit(ayar: { key: string }): Promise<{ success: boolean }>;
}

async function hizSiniriAsildiMi(request: Request): Promise<boolean> {
  const ortam = env as unknown as Record<string, unknown>;
  const genel = ortam.TALEP_GENEL_SINIR as HizSiniri | undefined;
  const ipSiniri = ortam.TALEP_IP_SINIRI as HizSiniri | undefined;
  const ip = request.headers.get('CF-Connecting-IP')?.trim();
  const kontroller = [
    genel?.limit({ key: 'talep-formlari' }),
    ip && ipSiniri ? ipSiniri.limit({ key: `ip:${ip}` }) : null,
  ].filter((islem): islem is Promise<{ success: boolean }> => Boolean(islem));
  if (!kontroller.length) return false;
  const sonuclar = await Promise.all(kontroller);
  return sonuclar.some((sonuc) => !sonuc.success);
}

export const POST: APIRoute = async ({ request }) => {
  const vt = env.VT as D1Database;
  await semayiKur(vt);

  let veri: Record<string, unknown>;
  try {
    veri = await request.json();
  } catch {
    return yanit({ hata: 'Geçersiz istek gövdesi.' }, 400);
  }

  // Bot tuzağı doluysa sessizce başarı dön — bota ipucu vermiyoruz.
  if (veri.website) return yanit({ tamam: true });

  if (await hizSiniriAsildiMi(request)) {
    return yanit(
      { hata: 'Çok kısa sürede fazla istek gönderildi. Bir dakika sonra yeniden deneyin.' },
      429,
      { 'Retry-After': '60' }
    );
  }

  const dogrulama = talebiDogrula(veri);
  if (!dogrulama.tamam) return yanit({ hata: dogrulama.hata, alan: dogrulama.alan }, 400);
  const kayit = dogrulama.talep;

  const ulke = request.headers.get('CF-IPCountry');

  // Basit hız sınırı: aynı numaradan 2 dakika içinde ikinci talep alınmaz.
  try {
    const son = await vt
      .prepare(
        `SELECT COUNT(*) AS adet FROM talepler
         WHERE telefon = ? AND COALESCE(ilan_id, '') = COALESCE(?, '')
           AND olusturma > datetime('now', '-2 minutes')`
      )
      .bind(kayit.telefon, kayit.ilan_id)
      .first<{ adet: number }>();
    if ((son?.adet ?? 0) > 0) return yanit({ tamam: true, not: 'zaten alındı' });
  } catch {
    // Sorgu başarısızsa talebi yine de kaydetmeyi deniyoruz.
  }

  let id: number;
  try {
    id = await talebiKaydet(vt, kayit, ulke);
  } catch {
    console.error('Talep ve bildirim kuyruğu kaydedilemedi.');
    return yanit({ hata: 'Talep kaydedilemedi.' }, 500);
  }

  await talepBildiriminiGonder(vt, env, id).catch(() =>
    console.error('Talep bildirimi tamamlanamadı; kalıcı kuyruk kaydı korunuyor.')
  );

  return yanit({ tamam: true });
};
