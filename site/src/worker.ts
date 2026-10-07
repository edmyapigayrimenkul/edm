/**
 * Worker giriş noktası.
 *
 * İki iş yapar:
 *   fetch     → Astro'nun sunucu tarafı işleyicisi (sayfalar + API uçları)
 *   scheduled → 6 saatte bir Emlakjet portföyünü D1'e senkronlar
 *
 * Senkron ayrı bir Worker olabilirdi ama aynı yerde durması hem dağıtımı
 * tekleştiriyor hem de veri katmanının önbelleğini paylaşmasını sağlıyor.
 */

import { handle } from '@astrojs/cloudflare/handler';
import { portfoyuCek } from './lib/senkron/emlakjet';
import { semayiKur, portfoyuYaz, gunlugeYaz } from './lib/senkron/depo';
import { onbellegiTemizle } from './lib/ilanlar';
import { gunlukOzet } from './lib/eposta';
import { bekleyenTalepBildirimleriniGonder } from './lib/talep-bildirim';
import { senkronUyarilariniKaydet, talepUyarilariniKaydet, bekleyenUyarilariGonder } from './lib/isletim-uyari';
import { googleYorumlariniCek } from './lib/senkron/yorumlar';
import { bekleyenPasifBildirimleriniGonder, pasifBildirimleriniKaydet } from './lib/ilan-isletim';
import { genelHtmlSun } from './lib/edge-cache';
import { emlakjetGorselSun } from './lib/emlakjet-gorseli';
import { r2FotografiSil } from './lib/r2-gorseller';

export interface Env {
  VT: D1Database;
  ASSETS: Fetcher;
  STAGING_ORTAMI?: string;
  BILDIRIM_ADRESI?: string;
  /** Places API anahtarı; tanımlı değilse yorum çekme sessizce atlanır. */
  GOOGLE_ANAHTARI?: string;
  GOOGLE_ISLETME_ARAMASI?: string;
  EPOSTA?: { send: (mesaj: unknown) => Promise<void> };
  GORSELLER?: R2Bucket;
  WHATSAPP_TELEFON_NO_KIMLIGI?: string;
  WHATSAPP_ERISIM_JETONU?: string;
  WHATSAPP_BILDIRIM_ALICI?: string;
  WHATSAPP_PASIF_SABLONU?: string;
}

export default {
  async fetch(request: Request, env: Env, baglam: ExecutionContext) {
    if (new URL(request.url).pathname.startsWith('/foto/emlakjet/')) {
      return emlakjetGorselSun(request, caches.default, (is) => baglam.waitUntil(is));
    }
    return genelHtmlSun(request, caches.default,
      () => handle(request, env, baglam), (is) => baglam.waitUntil(is));
  },

  async scheduled(olay: ScheduledController, env: Env, baglam: ExecutionContext) {
    // Staging'e yanlışlıkla cron bağlansa bile gerçek portalı çekme.
    if (env.STAGING_ORTAMI === '1') return;
    baglam.waitUntil(
      (async () => {
        await semayiKur(env.VT);
        await bekleyenTalepBildirimleriniGonder(env.VT, env).catch(() =>
          console.error('Talep bildirim kuyruğu işlenemedi.')
        );
        await senkronla(env);
        // Günlük özet yalnızca sabah çalışmasında (03:00 UTC = 06:00 TR).
        // Diğer üç çalışmada sessizce sadece senkron yapılıyor.
        const saat = new Date(olay.scheduledTime).getUTCHours();
        if (saat === 3) {
          // Yorumlar yavaş değişiyor; günde bir çekmek hem yeterli hem de
          // Places API kotasının çok altında kalıyor (ayda ~30 çağrı).
          const yorum = await googleYorumlariniCek(
            env.VT,
            env as unknown as Record<string, unknown>
          );
          if (yorum.durum !== 'atlandi') console.log('Google yorumları:', JSON.stringify(yorum));

          await gunlukOzet(env.VT, env).catch((h) =>
            console.error('Günlük özet gönderilemedi:', h)
          );
        }
      })()
    );
  },
} satisfies ExportedHandler<Env>;

export async function senkronla(env: Env): Promise<Record<string, unknown>> {
  if (env.STAGING_ORTAMI === '1') return { tamam: false, sebep: 'staging-ortami' };
  const baslangic = new Date().toISOString();

  try {
    await semayiKur(env.VT);

    const { ilanlar, basarisiz } = await portfoyuCek();

    // Emniyet freni: portalın tamamen boş döndüğü bir an, tüm portföyü
    // pasife çekmemize sebep olmamalı. Böyle bir durumda hiçbir şey yazmıyoruz.
    if (ilanlar.length === 0) {
      await gunlugeYaz(env.VT, baslangic, null, 'Portaldan hiç ilan gelmedi — yazma atlandı.');
      await senkronUyarilariniKaydet(env.VT, null, baslangic).catch(() => console.error('Senkron uyarısı kaydedilemedi.'));
      return { tamam: false, sebep: 'bos-yanit' };
    }

    const sonuc = await portfoyuYaz(env.VT, ilanlar, basarisiz);
    await gunlugeYaz(env.VT, baslangic, sonuc);
    await senkronUyarilariniKaydet(env.VT, sonuc, baslangic).catch(() => console.error('Senkron uyarısı kaydedilemedi.'));
    if (sonuc.pasiflemeErtelendi) {
      console.warn(
        `Senkron: ${sonuc.eksikAdet} eksik ilan pasife alınmadı; portal sonucu eksik veya büyük düşüş ikinci tam çekimle doğrulanmalı.`
      );
    }
    await pasifBildirimleriniKaydet(env.VT, sonuc.pasifIdler);
    const whatsApp = await bekleyenPasifBildirimleriniGonder(env.VT, env);
    if (whatsApp.gonderilen || whatsApp.bekleyen) console.log('WhatsApp bildirimleri:', JSON.stringify(whatsApp));

    // Yeni ilan formunda yüklenip kaydı tamamlanmayan taslak fotoğraflar bir gün
    // sonra temizlenir. Form hatasında aynı taslağa dönmek için yeterli süre kalır.
    if (env.GORSELLER) {
      const sahipsizler = await env.VT
        .prepare(
          `SELECT f.anahtar FROM ilan_foto f LEFT JOIN ilanlar i ON i.id = f.ilan_id
           WHERE i.id IS NULL AND datetime(f.yuklenme) < datetime('now', '-1 day') LIMIT 100`
        )
        .all<{ anahtar: string }>()
        .catch(() => ({ results: [] as Array<{ anahtar: string }> }));
      for (const foto of sahipsizler.results ?? []) {
        await r2FotografiSil(env.GORSELLER, foto.anahtar).catch(() => {});
        await env.VT.prepare(`DELETE FROM ilan_foto WHERE anahtar = ?`).bind(foto.anahtar).run().catch(() => {});
      }
    }

    // Not: koordinat çözümü buradan yapılmıyor. Nominatim veri merkezi
    // IP'lerinden gelen istekleri boş yanıtla geçiştiriyor; Worker'dan
    // yapılan 12 sorgunun 12'si de boş döndü. Yeni bir mahalle eklendiğinde
    // `node scripts/koordinat-coz.mjs` çalıştırmak yeterli — ayda bir iki kez.

    onbellegiTemizle();

    console.log(
      `Senkron: ${sonuc.bulunan} bulundu, ${sonuc.eklenen} yeni, ` +
        `${sonuc.guncellenen} güncellendi, ${sonuc.pasiflenen} pasife düştü ` +
        `(${(sonuc.sureMs / 1000).toFixed(1)} sn)`
    );

    return { tamam: true, ...sonuc };
  } catch (hata) {
    const mesaj = hata instanceof Error ? hata.message : String(hata);
    console.error('Senkron başarısız:', mesaj);
    await gunlugeYaz(env.VT, baslangic, null, mesaj).catch(() => {});
    await senkronUyarilariniKaydet(env.VT, null, baslangic).catch(() => console.error('Senkron uyarısı kaydedilemedi.'));
    return { tamam: false, hata: mesaj };
  } finally {
    // Senkron başarısız olsa da talep eşiğini kontrol et. Bildirim hatası senkron sonucunu değiştirmez.
    await talepUyarilariniKaydet(env.VT).catch(() => console.error('Talep uyarıları kontrol edilemedi.'));
    await bekleyenUyarilariGonder(env.VT, env).catch(() => console.error('İşletim uyarıları gönderilemedi.'));
  }
}
