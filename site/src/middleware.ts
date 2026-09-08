/**
 * İstek ara katmanı.
 *
 *  1. www adresini kök alan adına taşır (tek kanonik adres).
 *  2. Sayfa yanıtlarına kenar önbelleği başlıkları ekler — sayfalar istek
 *     anında üretiliyor ama içerik 6 saatte bir değiştiği için her ziyaretçi
 *     için yeniden üretmenin anlamı yok.
 */

import { defineMiddleware } from 'astro:middleware';

const KOK_ALAN = 'edmyapigayrimenkul.com';

/** Önbelleklenmeyecek yollar: form uçları ve yönetim paneli. */
const ONBELLEKSIZ = [/^\/api\//, /^\/yonetim/];

export const onRequest = defineMiddleware(async (baglam, sonraki) => {
  const adres = baglam.url;

  if (adres.hostname === `www.${KOK_ALAN}`) {
    adres.hostname = KOK_ALAN;
    return baglam.redirect(adres.toString(), 301);
  }

  const yanit = await sonraki();

  if (ONBELLEKSIZ.some((d) => d.test(adres.pathname))) {
    yanit.headers.set('Cache-Control', 'no-store');
    return yanit;
  }

  // Yalnızca başarılı HTML yanıtları önbelleklenir.
  const tur = yanit.headers.get('Content-Type') ?? '';
  if (yanit.status === 200 && tur.includes('text/html')) {
    // Tarayıcı kısa süre, Cloudflare kenarı 1 saat tutar; kenar önbelleği
    // bayatlarsa arka planda tazelenirken eski sürüm sunulur.
    yanit.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400'
    );
  }

  yanit.headers.set('X-Content-Type-Options', 'nosniff');
  yanit.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  yanit.headers.set('X-Frame-Options', 'SAMEORIGIN');
  yanit.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return yanit;
});
