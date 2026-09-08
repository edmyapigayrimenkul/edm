/**
 * Cloudflare API'sine küçük bir sarmalayıcı.
 * Kimlik bilgileri .env'den okunur, hiçbir yere yazdırılmaz.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function ortam() {
  let ham = '';
  try {
    ham = readFileSync(resolve(KOK, '.env'), 'utf8');
  } catch {
    throw new Error('.env bulunamadı. CLOUDFLARE_API_TOKEN ve CLOUDFLARE_ACCOUNT_ID gerekli.');
  }

  const deger = {};
  for (const satir of ham.split(/\r?\n/)) {
    const kirpik = satir.trim();
    if (!kirpik || kirpik.startsWith('#')) continue;
    const esit = kirpik.indexOf('=');
    if (esit < 1) continue;
    deger[kirpik.slice(0, esit).trim()] = kirpik
      .slice(esit + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }

  const token = deger.CLOUDFLARE_API_TOKEN;
  const hesap = deger.CLOUDFLARE_ACCOUNT_ID;
  if (!token || token.startsWith('buraya')) throw new Error('CLOUDFLARE_API_TOKEN dolu değil.');
  if (!hesap || hesap.startsWith('buraya')) throw new Error('CLOUDFLARE_ACCOUNT_ID dolu değil.');

  return { token, hesap };
}

export async function cf(yol, secenek = {}) {
  const { token } = ortam();
  const yanit = await fetch(`https://api.cloudflare.com/client/v4${yol}`, {
    ...secenek,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(secenek.headers ?? {}),
    },
  });

  const govde = await yanit.json().catch(() => ({}));
  return { ok: yanit.ok && govde.success !== false, durum: yanit.status, ...govde };
}
