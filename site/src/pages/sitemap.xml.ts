/**
 * Site haritası — sayfalar artık istek anında üretildiği için
 * @astrojs/sitemap kullanılamıyor; listeyi D1'den kendimiz çıkarıyoruz.
 */

import type { APIRoute } from 'astro';
import { portfoy } from '../lib/ilanlar';
import { bolgeler } from '../lib/bolgeler';
import { KURUM } from '../lib/site';
import { icerik } from '../lib/icerik';

interface Giris {
  yol: string;
  oncelik: string;
  siklik: string;
  tarih?: string;
}

export const GET: APIRoute = async () => {
  const { ilanlar, sonGuncelleme } = await portfoy();
  const bolgeListesi = await bolgeler();
  const { ekip } = await icerik();

  const girisler: Giris[] = [
    { yol: '/', oncelik: '1.0', siklik: 'daily', tarih: sonGuncelleme },
    { yol: '/ilanlar', oncelik: '0.9', siklik: 'daily', tarih: sonGuncelleme },
    { yol: '/danismanlar', oncelik: '0.7', siklik: 'monthly' },
    { yol: '/rehber', oncelik: '0.7', siklik: 'weekly' },
    { yol: '/hakkimizda', oncelik: '0.6', siklik: 'monthly' },
    { yol: '/degerleme', oncelik: '0.8', siklik: 'monthly' },
    { yol: '/iletisim', oncelik: '0.6', siklik: 'monthly' },
    ...ilanlar.map((i) => ({
      yol: i.yol,
      oncelik: '0.8',
      siklik: 'weekly',
      tarih: i.guncellenme ?? undefined,
    })),
    ...bolgeListesi.map((b) => ({ yol: b.yol, oncelik: '0.7', siklik: 'weekly' })),
    ...ekip.map((d) => ({
      yol: `/danismanlar/${d.slug}`,
      oncelik: '0.6',
      siklik: 'monthly',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${girisler
  .map(
    (g) => `  <url>
    <loc>${KURUM.site}${g.yol}</loc>${
      g.tarih ? `\n    <lastmod>${new Date(g.tarih).toISOString().slice(0, 10)}</lastmod>` : ''
    }
    <changefreq>${g.siklik}</changefreq>
    <priority>${g.oncelik}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
