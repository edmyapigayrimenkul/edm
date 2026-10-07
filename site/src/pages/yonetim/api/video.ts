/** Access korumalı tekil ilan videosu yükleme, değiştirme ve silme uç noktası. */
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { paneleGiris } from '../../../lib/panel/yetki';
import { onbellegiTemizle } from '../../../lib/ilanlar';
import {
  VIDEO_EN_BUYUK_BOYUT,
  VIDEO_EN_UZUN_SURE,
  VIDEO_KABUL_TURLERI,
  VIDEO_POSTER_EN_BUYUK_BOYUT,
  videoBoyutMetni,
  videoSureMetni,
} from '../../../lib/video-kurallari';

const VIDEO_TURLERI = new Set<string>(VIDEO_KABUL_TURLERI);
const POSTER_TURLERI = new Set(['image/webp', 'image/jpeg']);
const yanit = (govde: unknown, durum = 200) => new Response(JSON.stringify(govde), {
  status: durum,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});

function videoUzantisi(tur: string): string {
  if (tur === 'video/webm') return 'webm';
  if (tur === 'video/quicktime') return 'mov';
  return 'mp4';
}

export const POST: APIRoute = async ({ request }) => {
  const giris = await paneleGiris(request);
  if ('yanit' in giris) return yanit({ hata: 'Yetkisiz.' }, 403);
  const kova = (env as Record<string, unknown>).GORSELLER as R2Bucket | undefined;
  if (!kova) return yanit({ hata: 'Depolama yapılandırılmadı.' }, 503);

  const form = await request.formData();
  const ilanId = String(form.get('ilan') ?? '');
  const video = form.get('video');
  const poster = form.get('poster');
  const sure = Number(form.get('sure'));
  const genislik = Number(form.get('genislik')) || null;
  const yukseklik = Number(form.get('yukseklik')) || null;
  if (!/^[a-z0-9-]{4,40}$/i.test(ilanId)) return yanit({ hata: 'Geçersiz ilan.' }, 400);
  if (!(video instanceof File) || !(poster instanceof File)) return yanit({ hata: 'Video ve poster karesi gereklidir.' }, 400);
  if (!VIDEO_TURLERI.has(video.type)) return yanit({ hata: 'MP4, WebM veya MOV video yükleyin.' }, 400);
  if (!POSTER_TURLERI.has(poster.type)) return yanit({ hata: 'Poster karesi WebP veya JPEG olmalıdır.' }, 400);
  if (video.size <= 0 || video.size > VIDEO_EN_BUYUK_BOYUT) return yanit({ hata: `Video en fazla ${videoBoyutMetni()} olabilir.` }, 400);
  if (poster.size <= 0 || poster.size > VIDEO_POSTER_EN_BUYUK_BOYUT) return yanit({ hata: 'Poster karesi en fazla 2 MB olabilir.' }, 400);
  if (!Number.isFinite(sure) || sure <= 0 || sure > VIDEO_EN_UZUN_SURE) return yanit({ hata: `Video en fazla ${videoSureMetni()} olabilir.` }, 400);

  const vt = env.VT as D1Database;
  const eski = await vt.prepare(`SELECT video_anahtar, poster_anahtar FROM ilan_video WHERE ilan_id = ?`).bind(ilanId)
    .first<{ video_anahtar: string; poster_anahtar: string }>().catch(() => null);
  const kimlik = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
  const videoAnahtari = `video/${ilanId}/${kimlik}.${videoUzantisi(video.type)}`;
  const posterAnahtari = `video/${ilanId}/${kimlik}-poster.${poster.type === 'image/jpeg' ? 'jpg' : 'webp'}`;

  try {
    // Büyük videoyu ikinci kez belleğe kopyalamadan R2'ye akıt.
    await kova.put(videoAnahtari, video.stream(), {
      httpMetadata: { contentType: video.type, cacheControl: 'public, max-age=31536000, immutable' },
      customMetadata: { sure: String(sure), ilan: ilanId },
    });
    await kova.put(posterAnahtari, await poster.arrayBuffer(), {
      httpMetadata: { contentType: poster.type, cacheControl: 'public, max-age=31536000, immutable' },
    });
    await vt.prepare(
      `INSERT INTO ilan_video (ilan_id, video_anahtar, poster_anahtar, mime, sure_saniye, genislik, yukseklik, boyut, yukleyen, guncelleme)
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(ilan_id) DO UPDATE SET
         video_anahtar=excluded.video_anahtar, poster_anahtar=excluded.poster_anahtar,
         mime=excluded.mime, sure_saniye=excluded.sure_saniye, genislik=excluded.genislik,
         yukseklik=excluded.yukseklik, boyut=excluded.boyut, yukleyen=excluded.yukleyen,
         guncelleme=excluded.guncelleme`
    ).bind(ilanId, videoAnahtari, posterAnahtari, video.type, sure, genislik, yukseklik, video.size, giris.kimlik.eposta, new Date().toISOString()).run();
  } catch (hata) {
    await Promise.allSettled([kova.delete(videoAnahtari), kova.delete(posterAnahtari)]);
    return yanit({ hata: (hata as Error).message || 'Video kaydedilemedi.' }, 500);
  }

  if (eski) await Promise.allSettled([kova.delete(eski.video_anahtar), kova.delete(eski.poster_anahtar)]);
  onbellegiTemizle();
  return yanit({ tamam: true, video: `/g/${videoAnahtari}`, poster: `/g/${posterAnahtari}`, sure, boyut: video.size });
};

export const DELETE: APIRoute = async ({ request }) => {
  const giris = await paneleGiris(request);
  if ('yanit' in giris) return yanit({ hata: 'Yetkisiz.' }, 403);
  const { ilan } = await request.json() as { ilan?: string };
  if (!ilan || !/^[a-z0-9-]{4,40}$/i.test(ilan)) return yanit({ hata: 'Geçersiz ilan.' }, 400);
  const vt = env.VT as D1Database;
  const kayit = await vt.prepare(`SELECT video_anahtar, poster_anahtar FROM ilan_video WHERE ilan_id = ?`).bind(ilan)
    .first<{ video_anahtar: string; poster_anahtar: string }>();
  await vt.prepare(`DELETE FROM ilan_video WHERE ilan_id = ?`).bind(ilan).run();
  const kova = (env as Record<string, unknown>).GORSELLER as R2Bucket | undefined;
  if (kayit && kova) await Promise.allSettled([kova.delete(kayit.video_anahtar), kova.delete(kayit.poster_anahtar)]);
  onbellegiTemizle();
  return yanit({ tamam: true });
};
