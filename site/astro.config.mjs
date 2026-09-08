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

  vite: { plugins: [tailwind()] },
  build: { inlineStylesheets: 'auto' },
});
