/**
 * Panelden fotoğraf yükleme ve silme.
 *
 * Yolu neden /yonetim altında: Cloudflare Access uygulaması
 * `edmyapigayrimenkul.com/yonetim` yolunu kapsıyor. Bu yolun dışındaki bir
 * istek Access'ten geçmediği için kimlik jetonunu hiç almıyor ve uç nokta
 * herkesi yetkisiz sayıyor. Burada durunca hem kenar sunucu hem de
 * aşağıdaki jeton doğrulaması koruyor.
 *
 * Dosyalar R2'de, kayıtları D1'de. Boyutlandırma ve WebP'ye çevirme
 * tarayıcıda yapılıyor — sunucuda görüntü işleme kütüphanesi çalıştırmaya
 * gerek kalmıyor ve 5 MB'lık telefon fotoğrafı ağdan hiç geçmiyor.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { adminProfiliniBul, paneleGiris } from '../../../lib/panel/yetki';
import { rolYetkisiVar } from '../../../lib/panel/roller';
import { onbellegiTemizle } from '../../../lib/ilanlar';
import { r2FotografiSil, r2FotografVaryantAnahtari } from '../../../lib/r2-gorseller';
import {
  ILAN_FOTOGRAFI_EN_BUYUK_DOSYA,
  fotografYuklemePlani,
  fotografSiniriMesaji,
} from '../../../lib/fotograf-kurallari';

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
  if (!rolYetkisiVar(adminProfiliniBul(giris.kimlik.eposta)?.rol ?? null, 'ilan-yonet')) {
    return yanit({ hata: 'İlan yönetimi yetkisi gerekli.' }, 403);
  }

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
  let fotoOzeti: { son: number; adet: number } | null;
  try {
    fotoOzeti = await vt
      .prepare(`SELECT COALESCE(MAX(sira), -1) AS son, COUNT(*) AS adet FROM ilan_foto WHERE ilan_id = ?`)
      .bind(ilanId)
      .first<{ son: number; adet: number }>();
  } catch {
    return yanit({ hata: 'Mevcut fotoğraf sayısı doğrulanamadı. Biraz sonra yeniden deneyin.' }, 503);
  }
  if (!fotoOzeti) return yanit({ hata: 'Mevcut fotoğraf sayısı doğrulanamadı. Biraz sonra yeniden deneyin.' }, 503);

  const plan = fotografYuklemePlani(fotoOzeti.adet, dosyalar.length);
  if (!plan) return yanit({ hata: 'Fotoğraf sayısı doğrulanamadı. Biraz sonra yeniden deneyin.' }, 503);
  if (!plan.kalan) return yanit({ hata: fotografSiniriMesaji() }, 400);

  let sira = (fotoOzeti?.son ?? -1) + 1;
  const eklenen: string[] = [];
  const atlananIndeksler: number[] = dosyalar
    .slice(plan.yuklenecek)
    .map((_, indeks) => plan.yuklenecek + indeks);
  const atlanan: string[] = dosyalar
    .slice(plan.yuklenecek)
    .map((dosya) => `${dosya.name}: ${fotografSiniriMesaji()}`);

  for (const [indeks, dosya] of dosyalar.slice(0, plan.yuklenecek).entries()) {
    if (!KABUL.has(dosya.type)) {
      atlananIndeksler.push(indeks);
      atlanan.push(`${dosya.name}: desteklenmeyen tür`);
      continue;
    }
    if (dosya.size > ILAN_FOTOGRAFI_EN_BUYUK_DOSYA) {
      atlananIndeksler.push(indeks);
      atlanan.push(`${dosya.name}: çok büyük`);
      continue;
    }
    if (dosya.size === 0) {
      atlananIndeksler.push(indeks);
      atlanan.push(`${dosya.name}: dosya boş`);
      continue;
    }

    const anahtar = `${ilanId}/${Date.now().toString(36)}-${crypto
      .randomUUID()
      .slice(0, 8)}.${uzanti(dosya.type)}`;
    const varyantlar = [640, 1280].flatMap((boyut) => {
      const varyant = form.get(`varyant-${boyut}-${indeks}`);
      if (!(varyant instanceof File)) return [];
      if (varyant.type !== 'image/webp' || varyant.size === 0 || varyant.size > ILAN_FOTOGRAFI_EN_BUYUK_DOSYA) {
        return [{ boyut, dosya: null }];
      }
      return [{ boyut, dosya: varyant }];
    });
    if (varyantlar.some((v) => !v.dosya)) {
      atlananIndeksler.push(indeks);
      atlanan.push(`${dosya.name}: boyutlandırılmış fotoğraf geçersiz`);
      continue;
    }
    const yuklenenAnahtarlar = [anahtar];

    try {
      await kova.put(anahtar, await dosya.arrayBuffer(), {
        httpMetadata: {
          contentType: dosya.type,
          cacheControl: 'public, max-age=31536000, immutable',
        },
      });
      for (const varyant of varyantlar) {
        if (!varyant.dosya) continue;
        const varyantAnahtari = r2FotografVaryantAnahtari(anahtar, varyant.boyut);
        await kova.put(varyantAnahtari, await varyant.dosya.arrayBuffer(), {
          httpMetadata: { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' },
        });
        yuklenenAnahtarlar.push(varyantAnahtari);
      }
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
      await Promise.allSettled(yuklenenAnahtarlar.map((yol) => kova.delete(yol)));
      atlananIndeksler.push(indeks);
      atlanan.push(`${dosya.name}: ${(hata as Error).message}`);
    }
  }

  onbellegiTemizle();
  return yanit(
    {
      tamam: eklenen.length > 0,
      eklenen: eklenen.length,
      atlanan,
      atlananIndeksler: [...new Set(atlananIndeksler)].sort((a, b) => a - b),
      ...(eklenen.length ? {} : { hata: 'Hiçbir fotoğraf yüklenemedi.' }),
    },
    eklenen.length ? 200 : 400
  );
};

export const DELETE: APIRoute = async ({ request }) => {
  const giris = await paneleGiris(request);
  if ('yanit' in giris) return yanit({ hata: 'Yetkisiz.' }, 403);
  if (!rolYetkisiVar(adminProfiliniBul(giris.kimlik.eposta)?.rol ?? null, 'ilan-yonet')) {
    return yanit({ hata: 'İlan yönetimi yetkisi gerekli.' }, 403);
  }

  const kova = (env as Record<string, unknown>).GORSELLER as R2Bucket | undefined;
  if (!kova) return yanit({ hata: 'Depolama yapılandırılmadı (R2 bağlaması yok).' }, 503);
  const govde = await request.json().catch(() => null) as { anahtar?: unknown } | null;
  const anahtar = typeof govde?.anahtar === 'string' ? govde.anahtar : '';
  if (!anahtar || anahtar.length > 300) return yanit({ hata: 'Geçerli fotoğraf anahtarı gerekli.' }, 400);

  const vt = env.VT as D1Database;
  let kayit: { ilan_id: string } | null;
  try {
    kayit = await vt.prepare(`SELECT ilan_id FROM ilan_foto WHERE anahtar = ?`)
      .bind(anahtar).first<{ ilan_id: string }>();
  } catch {
    return yanit({ hata: 'Fotoğraf kaydı doğrulanamadı. Yeniden deneyin.' }, 503);
  }
  if (!kayit) return yanit({ hata: 'Fotoğraf kaydı bulunamadı.' }, 404);
  if (!anahtar.startsWith(`${kayit.ilan_id}/`)) {
    return yanit({ hata: 'Fotoğraf anahtarı ilanla eşleşmiyor.' }, 409);
  }

  try {
    await r2FotografiSil(kova, anahtar);
  } catch {
    return yanit({ hata: 'Fotoğraf dosyası silinemedi; kayıt korundu. Yeniden deneyin.' }, 503);
  }
  try {
    await vt.prepare(`DELETE FROM ilan_foto WHERE anahtar = ?`).bind(anahtar).run();
  } catch {
    return yanit({ hata: 'Fotoğraf dosyası silindi ancak kayıt temizlenemedi. Yönetici kontrolü gerekli.' }, 500);
  }

  onbellegiTemizle();
  return yanit({ tamam: true });
};
