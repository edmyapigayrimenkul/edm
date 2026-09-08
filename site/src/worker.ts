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
import { googleYorumlariniCek } from './lib/senkron/yorumlar';

export interface Env {
  VT: D1Database;
  ASSETS: Fetcher;
  BILDIRIM_ADRESI?: string;
  /** Places API anahtarı; tanımlı değilse yorum çekme sessizce atlanır. */
  GOOGLE_ANAHTARI?: string;
  GOOGLE_ISLETME_ARAMASI?: string;
  EPOSTA?: { send: (mesaj: unknown) => Promise<void> };
}

export default {
  fetch: handle,

  async scheduled(olay: ScheduledController, env: Env, baglam: ExecutionContext) {
    baglam.waitUntil(
      (async () => {
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
  const baslangic = new Date().toISOString();

  try {
    await semayiKur(env.VT);

    const { ilanlar, basarisiz } = await portfoyuCek();

    // Emniyet freni: portalın tamamen boş döndüğü bir an, tüm portföyü
    // pasife çekmemize sebep olmamalı. Böyle bir durumda hiçbir şey yazmıyoruz.
    if (ilanlar.length === 0) {
      await gunlugeYaz(env.VT, baslangic, null, 'Portaldan hiç ilan gelmedi — yazma atlandı.');
      return { tamam: false, sebep: 'bos-yanit' };
    }

    const sonuc = await portfoyuYaz(env.VT, ilanlar, basarisiz);
    await gunlugeYaz(env.VT, baslangic, sonuc);

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
    return { tamam: false, hata: mesaj };
  }
}
