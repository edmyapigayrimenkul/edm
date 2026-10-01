/**
 * Cloudflare API'sine küçük bir sarmalayıcı.
 * Yerelde .env, CI'da yalnız süreç ortamı okunur; kimlik bilgileri yazdırılmaz.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function ortam({ degiskenler = process.env, envYolu = resolve(KOK, '.env') } = {}) {
  let ham = '';
  try {
    if (degiskenler.GITHUB_ACTIONS !== 'true') ham = readFileSync(envYolu, 'utf8');
  } catch (hata) {
    if (hata.code !== 'ENOENT') throw new Error('.env okunamadı.');
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

  // Boş bir CI secret'ı da yereldeki geniş yetkili anahtara geri düşmemeli.
  const oku = (ad) => Object.hasOwn(degiskenler, ad) ? degiskenler[ad] : deger[ad];
  const token = oku('CLOUDFLARE_API_TOKEN');
  const hesap = oku('CLOUDFLARE_ACCOUNT_ID');
  if (!token || token.startsWith('buraya')) throw new Error('CLOUDFLARE_API_TOKEN dolu değil.');
  if (!hesap || hesap.startsWith('buraya')) throw new Error('CLOUDFLARE_ACCOUNT_ID dolu değil.');

  return {
    token,
    hesap,
    panelAdminEpostalari: oku('PANEL_ADMIN_EPOSTALARI') ?? '',
  };
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
