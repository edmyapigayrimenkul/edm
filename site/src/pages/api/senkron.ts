/**
 * Portföy senkronunu elle tetikler.
 *
 * Zamanlanmış görev zaten 6 saatte bir çalışıyor; bu uç, yeni bir ilan
 * yayınlandığında beklemeden güncellemek için. Gizli anahtarla korunuyor.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { senkronla } from '../../worker';
import { googleYorumlariniCek } from '../../lib/senkron/yorumlar';
import { senkronIstegiYetkili } from '../../lib/senkron/yetki';
import { onbellegiTemizle } from '../../lib/ilanlar';

const yanit = (govde: unknown, durum = 200) =>
  new Response(JSON.stringify(govde, null, 1), {
    status: durum,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

export const POST: APIRoute = async ({ request }) => {
  if ((env as Record<string, unknown>).STAGING_ORTAMI === '1') {
    return yanit({ hata: 'Staging ortamında portal senkronu kapalı.' }, 503);
  }
  const beklenen = (env as Record<string, unknown>).SENKRON_ANAHTARI as string | undefined;

  if (!beklenen) return yanit({ hata: 'Senkron anahtarı tanımlı değil.' }, 503);

  if (!senkronIstegiYetkili(request, beklenen)) return yanit({ hata: 'Yetkisiz.' }, 401);

  const sonuc = await senkronla(env as never);

  // Panelden elle tetiklenince yorumlar da tazelensin — anahtar
  // tanımlanır tanımlanmaz beklemeden görülebilsin diye.
  const yorumlar = await googleYorumlariniCek(
    env.VT as D1Database,
    env as unknown as Record<string, unknown>
  );
  if (yorumlar.durum === 'tamam' && yorumlar.yazilan) onbellegiTemizle();

  return yanit({ ...sonuc, yorumlar }, sonuc.tamam ? 200 : 500);
};

/** Son senkronun ne zaman ve nasıl geçtiğini gösterir — açık uç, gizli veri yok. */
export const GET: APIRoute = async () => {
  const vt = env.VT as D1Database;
  const son = await vt
    .prepare(
      `SELECT baslangic, bitis, bulunan, eklenen, guncellenen, pasiflenen, basarisiz, hata
       FROM senkron_gunlugu ORDER BY id DESC LIMIT 5`
    )
    .all();
  const sayim = await vt
    .prepare(`SELECT durum, COUNT(*) AS adet FROM ilanlar GROUP BY durum`)
    .all();

  return yanit({ ilanlar: sayim.results, sonCalismalar: son.results });
};
