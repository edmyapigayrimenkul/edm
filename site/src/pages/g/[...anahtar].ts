/**
 * Yüklenen fotoğrafların sunumu.
 *
 * R2'yi doğrudan internete açmak yerine Worker üzerinden veriyoruz:
 * önbellek başlıklarını biz belirliyoruz ve dosya adresleri sitenin
 * kendi alan adında kalıyor.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { r2FotografVaryantAnahtari } from '../../lib/r2-gorseller';

export const GET: APIRoute = async ({ params, request, locals }) => {
  const ctx = (locals as { ctx?: ExecutionContext }).ctx;
  const anahtar = String(params.anahtar ?? '');
  if (!anahtar || anahtar.includes('..')) return new Response('Bulunamadı', { status: 404 });
  const url = new URL(request.url);
  const varyantParametreleri = url.searchParams.getAll('width');
  if (url.searchParams.size && (url.searchParams.size !== 1 || varyantParametreleri.length !== 1 || !['640', '1280'].includes(varyantParametreleri[0]))) {
    return new Response('Bulunamadı', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  const kova = (env as Record<string, unknown>).GORSELLER as R2Bucket | undefined;
  if (!kova) return new Response('Depolama yok', { status: 503 });

  const videoMu = anahtar.startsWith('video/');
  const aralikBasligi = request.headers.get('Range');

  // Kenar önbelleği: aynı fotoğraf her istekte R2'den okunmasın.
  // Video ve byte-range yanıtları büyük/parçalı olduğu için Cache API'ye yazılmaz.
  // Adresler değişmez olduğu için önbellek süresiz tutulabiliyor.
  const onbellek = (caches as unknown as { default: Cache }).default;
  if (!videoMu && !aralikBasligi) {
    const onbelleklenmis = await onbellek.match(request);
    if (onbelleklenmis) return onbelleklenmis;
  }

  // Tarayıcıda kopyası varsa yeniden indirmesin.
  const etiket = request.headers.get('If-None-Match');
  let aralik: { offset: number; length: number; toplam: number } | null = null;
  if (aralikBasligi) {
    const bas = await kova.head(anahtar);
    if (!bas) return new Response('Bulunamadı', { status: 404 });
    const esleme = aralikBasligi.match(/^bytes=(\d*)-(\d*)$/);
    if (!esleme) return new Response('Geçersiz aralık', { status: 416, headers: { 'Content-Range': `bytes */${bas.size}` } });
    const ilk = esleme[1] ? Number(esleme[1]) : null;
    const son = esleme[2] ? Number(esleme[2]) : null;
    const offset = ilk ?? Math.max(0, bas.size - (son ?? 0));
    const bitis = ilk == null ? bas.size - 1 : Math.min(son ?? bas.size - 1, bas.size - 1);
    if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(bitis) || offset < 0 || offset > bitis || offset >= bas.size) {
      return new Response('Geçersiz aralık', { status: 416, headers: { 'Content-Range': `bytes */${bas.size}` } });
    }
    aralik = { offset, length: bitis - offset + 1, toplam: bas.size };
  }
  const varyant = !videoMu && !aralik && varyantParametreleri.length ? Number(varyantParametreleri[0]) as 640 | 1280 : null;
  const varyantAnahtari = varyant ? r2FotografVaryantAnahtari(anahtar, varyant) : null;
  const nesne = (varyantAnahtari ? await kova.get(varyantAnahtari) : null) ?? await kova.get(anahtar, aralik
    ? { range: { offset: aralik.offset, length: aralik.length } }
    : { onlyIf: etiket ? { etagDoesNotMatch: etiket } : undefined });

  if (!nesne) return new Response('Bulunamadı', { status: 404 });
  if (!('body' in nesne) || !nesne.body) {
    return new Response(null, { status: 304, headers: { ETag: etiket ?? '' } });
  }

  const basliklar: Record<string, string> = {
      'Content-Type': nesne.httpMetadata?.contentType ?? 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: nesne.httpEtag,
      'Content-Length': String(nesne.size),
      ...(varyantAnahtari && nesne.key === varyantAnahtari ? { 'X-EDM-Foto-Surumu': String(varyant) } : { 'X-EDM-Foto-Surumu': 'ozgun' }),
  };
  if (videoMu) basliklar['Accept-Ranges'] = 'bytes';
  if (aralik) {
    basliklar['Content-Range'] = `bytes ${aralik.offset}-${aralik.offset + aralik.length - 1}/${aralik.toplam}`;
    basliklar['Content-Length'] = String(aralik.length);
  }
  const yanit = new Response(nesne.body, { status: aralik ? 206 : 200, headers: basliklar });

  if (!videoMu && !aralik) ctx?.waitUntil(onbellek.put(request, yanit.clone()));
  return yanit;
};
