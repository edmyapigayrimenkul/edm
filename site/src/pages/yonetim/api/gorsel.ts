/**
 * Panel için görsel aracısı.
 *
 * Paylaşım görselini tarayıcıda canvas ile çiziyoruz. Fotoğraf portalın
 * alan adından geldiğinde canvas "kirleniyor" ve toBlob() çalışmıyor —
 * tarayıcı başka alan adından gelen pikselleri okumaya izin vermiyor.
 * Bu uç fotoğrafı kendi alan adımızdan geçiriyor, sorun ortadan kalkıyor.
 *
 * Açık bir aracı değil: Access'in arkasında ve yalnızca bilinen portal
 * sunucularından çekiyor.
 */

import type { APIRoute } from 'astro';
import { paneleGiris } from '../../../lib/panel/yetki';

/** Yalnızca bu sunuculardan görsel alınır. */
const IZINLI = [
  'hecdn01.hemlak.com',
  'hecdn02.hemlak.com',
  'hecdn03.hemlak.com',
  'i.emlakjet.com',
  'imaj.emlakjet.com',
  'cdn.emlakjet.com',
];

export const GET: APIRoute = async ({ request, url }) => {
  const giris = await paneleGiris(request);
  if ('yanit' in giris) return giris.yanit;

  const kaynak = url.searchParams.get('u');
  if (!kaynak) return new Response('Adres gerekli.', { status: 400 });

  let hedef: URL;
  try {
    hedef = new URL(kaynak);
  } catch {
    return new Response('Geçersiz adres.', { status: 400 });
  }

  // Kendi görsellerimiz zaten aynı alan adında; onlar buraya uğramasın.
  if (hedef.protocol !== 'https:' || !IZINLI.includes(hedef.hostname)) {
    return new Response('Bu sunucuya izin yok.', { status: 403 });
  }

  const yanit = await fetch(hedef.href, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EDMPanel/1.0)' },
  });
  if (!yanit.ok) return new Response('Görsel alınamadı.', { status: 502 });

  const tur = yanit.headers.get('content-type') ?? 'image/jpeg';
  if (!tur.startsWith('image/')) return new Response('Görsel değil.', { status: 415 });

  return new Response(yanit.body, {
    headers: {
      'Content-Type': tur,
      'Cache-Control': 'private, max-age=3600',
    },
  });
};
