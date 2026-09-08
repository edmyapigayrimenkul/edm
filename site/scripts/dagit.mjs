#!/usr/bin/env node
// Siteyi derleyip Cloudflare Pages'e yükler.
// Kimlik bilgileri .env'den okunur ve yalnızca alt sürece aktarılır.

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ortam } from './lib/cf.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function calistir(komut, argumanlar, ekOrtam = {}) {
  return new Promise((coz, red) => {
    const surec = spawn(komut, argumanlar, {
      cwd: KOK,
      stdio: 'inherit',
      env: { ...process.env, ...ekOrtam },
    });
    surec.on('close', (kod) =>
      kod === 0 ? coz() : red(new Error(`${komut} ${kod} koduyla çıktı`))
    );
  });
}

const { token, hesap } = ortam();
console.log('› Site derleniyor…');
await calistir('npx', ['astro', 'build']);

console.log('\n› Cloudflare Worker olarak yükleniyor…');
await calistir('npx', ['wrangler', 'deploy'], {
  CLOUDFLARE_API_TOKEN: token,
  CLOUDFLARE_ACCOUNT_ID: hesap,
});
