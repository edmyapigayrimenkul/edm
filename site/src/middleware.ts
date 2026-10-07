/**
 * İstek ara katmanı.
 *
 *  1. www adresini kök alan adına taşır (tek kanonik adres).
 *  2. Sayfa yanıtlarına kenar önbelleği başlıkları ekler — sayfalar istek
 *     anında üretiliyor ama içerik 6 saatte bir değiştiği için her ziyaretçi
 *     için yeniden üretmenin anlamı yok.
 */

import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { istekKapsaminda } from './lib/istek-onbellegi';
import { GENEL_HTML_KONTROLU, genelHtmlOnbellekAnahtari } from './lib/edge-cache';

const KOK_ALAN = 'edmyapigayrimenkul.com';

/** Önbelleklenmeyecek yollar: form uçları ve yönetim paneli. */
const ONBELLEKSIZ = [/^\/api\//, /^\/yonetim/];

export const onRequest = defineMiddleware((baglam, sonraki) => istekKapsaminda(async () => {
  const adres = baglam.url;
  const yerelAdres = ['localhost', '127.0.0.1', '[::1]'].includes(adres.hostname);

  if ((adres.protocol === 'http:' && !yerelAdres) || adres.hostname === `www.${KOK_ALAN}`) {
    adres.protocol = 'https:';
    adres.hostname = KOK_ALAN;
    return baglam.redirect(adres.toString(), 301);
  }

  const yanit = await sonraki();

  if ((env as Record<string, unknown>).STAGING_ORTAMI === '1') {
    yanit.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  if (ONBELLEKSIZ.some((d) => d.test(adres.pathname))) {
    yanit.headers.set('Cache-Control', 'no-store');
    return yanit;
  }

  // Yalnızca başarılı HTML yanıtları önbelleklenir.
  const tur = yanit.headers.get('Content-Type') ?? '';
  if (yanit.status === 200 && tur.includes('text/html')) {
    // İletişim ve portföy ayarları panelden değiştiğinde site en geç bir dakika
    // içinde aynı içeriği göstermeli. Sürümlü statik dosyalar public/_headers ile
    // uzun süre tutulurken HTML kısa süreli önbelleklenir.
    yanit.headers.set('Cache-Control', genelHtmlOnbellekAnahtari(baglam.request)
      ? GENEL_HTML_KONTROLU : 'private, no-store');
  }

  yanit.headers.set('X-Content-Type-Options', 'nosniff');
  yanit.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  yanit.headers.set('X-Frame-Options', 'SAMEORIGIN');
  yanit.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return yanit;
}));
