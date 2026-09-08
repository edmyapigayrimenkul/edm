/**
 * Yüklenen fotoğrafların sunumu.
 *
 * R2'yi doğrudan internete açmak yerine Worker üzerinden veriyoruz:
 * önbellek başlıklarını biz belirliyoruz ve dosya adresleri sitenin
 * kendi alan adında kalıyor.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async ({ params, request, locals }) => {
  const ctx = (locals as { ctx?: ExecutionContext }).ctx;
  const anahtar = String(params.anahtar ?? '');
  if (!anahtar || anahtar.includes('..')) return new Response('Bulunamadı', { status: 404 });

  const kova = (env as Record<string, unknown>).GORSELLER as R2Bucket | undefined;
  if (!kova) return new Response('Depolama yok', { status: 503 });

  // Kenar önbelleği: aynı dosya her istekte R2'den okunmasın.
  // Adresler değişmez olduğu için önbellek süresiz tutulabiliyor.
  const onbellek = (caches as unknown as { default: Cache }).default;
  const onbelleklenmis = await onbellek.match(request);
  if (onbelleklenmis) return onbelleklenmis;

  // Tarayıcıda kopyası varsa yeniden indirmesin.
  const etiket = request.headers.get('If-None-Match');
  const nesne = await kova.get(anahtar, {
    onlyIf: etiket ? { etagDoesNotMatch: etiket } : undefined,
  });

  if (!nesne) return new Response('Bulunamadı', { status: 404 });
  if (!('body' in nesne) || !nesne.body) {
    return new Response(null, { status: 304, headers: { ETag: etiket ?? '' } });
  }

  const yanit = new Response(nesne.body, {
    headers: {
      'Content-Type': nesne.httpMetadata?.contentType ?? 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: nesne.httpEtag,
    },
  });

  ctx?.waitUntil(onbellek.put(request, yanit.clone()));
  return yanit;
};
