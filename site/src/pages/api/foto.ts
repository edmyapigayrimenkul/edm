/**
 * Panelden fotoğraf yükleme ve silme.
 *
 * Dosyalar R2'de, kayıtları D1'de. Boyutlandırma ve WebP'ye çevirme
 * tarayıcıda yapılıyor — sunucuda görüntü işleme kütüphanesi çalıştırmaya
 * gerek kalmıyor ve 5 MB'lık telefon fotoğrafı ağdan hiç geçmiyor.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { paneleGiris } from '../../lib/panel/yetki';
import { onbellegiTemizle } from '../../lib/ilanlar';

const EN_BUYUK = 3 * 1024 * 1024; // tarayıcı zaten küçültüyor; bu bir emniyet freni
const KABUL = new Set(['image/webp', 'image/jpeg', 'image/png']);

const yanit = (govde: unknown, durum = 200) =>
  new Response(JSON.stringify(govde), {
    status: durum,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

function uzanti(tur: string): string {
  return tur === 'image/webp' ? 'webp' : tur === 'image/png' ? 'png' : 'jpg';
}

export const POST: APIRoute = async ({ request }) => {
  const giris = await paneleGiris(request);
  if ('yanit' in giris) return yanit({ hata: 'Yetkisiz.' }, 403);

  const kova = (env as Record<string, unknown>).GORSELLER as R2Bucket | undefined;
  if (!kova) return yanit({ hata: 'Depolama yapılandırılmadı (R2 bağlaması yok).' }, 503);

  const form = await request.formData();
  const ilanId = String(form.get('ilan') ?? '');
  const dosyalar = form.getAll('dosya').filter((d): d is File => d instanceof File);

  if (!/^[a-z0-9-]{4,40}$/i.test(ilanId)) return yanit({ hata: 'Geçersiz ilan.' }, 400);
  if (!dosyalar.length) return yanit({ hata: 'Dosya gelmedi.' }, 400);

  const vt = env.VT as D1Database;
  const suAn = new Date().toISOString();

  // Sıra numarası mevcut fotoğrafların ardından devam etsin.
  const sonSira = await vt
    .prepare(`SELECT COALESCE(MAX(sira), -1) AS son FROM ilan_foto WHERE ilan_id = ?`)
    .bind(ilanId)
    .first<{ son: number }>()
    .catch(() => ({ son: -1 }));

  let sira = (sonSira?.son ?? -1) + 1;
  const eklenen: string[] = [];
  const atlanan: string[] = [];

  for (const dosya of dosyalar) {
    if (!KABUL.has(dosya.type)) {
      atlanan.push(`${dosya.name}: desteklenmeyen tür`);
      continue;
    }
    if (dosya.size > EN_BUYUK) {
      atlanan.push(`${dosya.name}: çok büyük`);
      continue;
    }

    const anahtar = `${ilanId}/${Date.now().toString(36)}-${crypto
      .randomUUID()
      .slice(0, 8)}.${uzanti(dosya.type)}`;

    try {
      await kova.put(anahtar, await dosya.arrayBuffer(), {
        httpMetadata: {
          contentType: dosya.type,
          cacheControl: 'public, max-age=31536000, immutable',
        },
      });
      await vt
        .prepare(
          `INSERT INTO ilan_foto (anahtar, ilan_id, sira, genislik, yukseklik, boyut, yukleyen, yuklenme)
           VALUES (?,?,?,?,?,?,?,?)`
        )
        .bind(
          anahtar,
          ilanId,
          sira++,
          Number(form.get(`genislik-${dosya.name}`)) || null,
          Number(form.get(`yukseklik-${dosya.name}`)) || null,
          dosya.size,
          giris.kimlik.eposta,
          suAn
        )
        .run();
      eklenen.push(anahtar);
    } catch (hata) {
      atlanan.push(`${dosya.name}: ${(hata as Error).message}`);
    }
  }

  onbellegiTemizle();
  return yanit({ tamam: true, eklenen: eklenen.length, atlanan });
};

export const DELETE: APIRoute = async ({ request }) => {
  const giris = await paneleGiris(request);
  if ('yanit' in giris) return yanit({ hata: 'Yetkisiz.' }, 403);

  const kova = (env as Record<string, unknown>).GORSELLER as R2Bucket | undefined;
  const { anahtar } = (await request.json()) as { anahtar?: string };
  if (!anahtar) return yanit({ hata: 'Anahtar gerekli.' }, 400);

  await kova?.delete(anahtar).catch(() => {});
  await (env.VT as D1Database)
    .prepare(`DELETE FROM ilan_foto WHERE anahtar = ?`)
    .bind(anahtar)
    .run();

  onbellegiTemizle();
  return yanit({ tamam: true });
};
