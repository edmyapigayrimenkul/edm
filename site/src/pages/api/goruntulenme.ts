/**
 * İlan görüntülenme sayacı.
 *
 * Sayfalar kenarda önbelleklendiği için her ziyaret sunucuya ulaşmıyor;
 * bu yüzden sayımı tarayıcıdan gelen küçük bir sinyalle yapıyoruz.
 * Kişi takibi yok, çerez yok — yalnızca "şu ilan bugün kaç kez açıldı".
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request }) => {
  let id = '';
  try {
    ({ id } = (await request.json()) as { id: string });
  } catch {
    return new Response(null, { status: 204 });
  }

  // Yalnızca makul biçimli kimlikler; uydurma kayıt açılmasın.
  if (!/^[a-z0-9-]{4,40}$/i.test(id)) return new Response(null, { status: 204 });

  const gun = new Date().toISOString().slice(0, 10);
  try {
    const vt = env.VT as D1Database;
    // İlan gerçekten var mı? Yoksa satır açmıyoruz.
    const varMi = await vt.prepare(`SELECT 1 FROM ilanlar WHERE id = ?`).bind(id).first();
    if (varMi) {
      await vt
        .prepare(
          `INSERT INTO goruntulenme (ilan_id, gun, adet) VALUES (?,?,1)
           ON CONFLICT(ilan_id, gun) DO UPDATE SET adet = adet + 1`
        )
        .bind(id, gun)
        .run();
    }
  } catch {
    // Sayaç tutulamazsa ziyaretçiyi ilgilendirmez.
  }

  return new Response(null, { status: 204 });
};
