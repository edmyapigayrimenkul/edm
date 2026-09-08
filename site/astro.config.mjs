// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://edmyapigayrimenkul.com',
  trailingSlash: 'never',

  // İlan verisi D1'de ve 6 saatte bir güncelleniyor; sayfalar istek anında
  // üretiliyor. Yeniden derleme diye bir adım kalmadı.
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),

  // Oturum kullanmıyoruz; adaptörün varsayılan KV bağlamasını istemiyoruz.
  session: false,

  // ClientRouter ön yüklemeyi kendiliğinden açıyor ve varsayılanı "hover":
  // bağlantının üzerinden geçmek bile bir istek doğuruyor. Sayfalar istek
  // anında üretildiği için her ön yükleme gerçek bir Worker çağrısı — 46
  // kartlı ilan sayfasında bu boşa giden onlarca istek demek. "tap"
  // basılma anında getiriyor: hızın neredeyse tamamı, israfın hiçbiri.
  prefetch: { prefetchAll: false, defaultStrategy: 'tap' },

  vite: { plugins: [tailwind()] },
  build: { inlineStylesheets: 'auto' },
});
