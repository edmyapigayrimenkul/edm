/**
 * Panel yetkilendirmesi — Cloudflare Access.
 *
 * Access, /yonetim altındaki istekleri kenar sunucuda karşılar ve giriş
 * yapmamış kimseyi Worker'a bile ulaştırmaz. Yine de burada jetonu ayrıca
 * doğruluyoruz: Access yapılandırması bir gün yanlış kurulursa ya da istek
 * başka bir yoldan gelirse panel açıkta kalmasın.
 *
 * Şifre yok, oturum yok — kimlik doğrulamayı tamamen Cloudflare yapıyor,
 * bize yalnızca imzalı bir jeton ulaşıyor.
 */

import { env } from 'cloudflare:workers';

interface Jwk {
  kid: string;
  kty: string;
  alg: string;
  use?: string;
  n: string;
  e: string;
}

interface AccessKimlik {
  eposta: string;
  kimlik: string;
}

const JETON_BASLIGI = 'Cf-Access-Jwt-Assertion';

/** Anahtar seti nadiren değişir; isolate ömrü boyunca saklıyoruz. */
let anahtarOnbellegi: { anahtarlar: Jwk[]; zaman: number } | null = null;
const ANAHTAR_OMRU_MS = 60 * 60 * 1000;

function ekipAlanAdi(): string | null {
  return ((env as Record<string, unknown>).ACCESS_EKIP_ALANI as string) ?? null;
}

function beklenenKitle(): string | null {
  return ((env as Record<string, unknown>).ACCESS_AUD as string) ?? null;
}

async function anahtarlariAl(): Promise<Jwk[]> {
  if (anahtarOnbellegi && Date.now() - anahtarOnbellegi.zaman < ANAHTAR_OMRU_MS) {
    return anahtarOnbellegi.anahtarlar;
  }
  const alan = ekipAlanAdi();
  if (!alan) return [];

  const yanit = await fetch(`https://${alan}/cdn-cgi/access/certs`);
  if (!yanit.ok) return [];

  const govde = (await yanit.json()) as { keys?: Jwk[] };
  const anahtarlar = govde.keys ?? [];
  anahtarOnbellegi = { anahtarlar, zaman: Date.now() };
  return anahtarlar;
}

function base64UrlCoz(metin: string): Uint8Array {
  const dolgulu = metin.replace(/-/g, '+').replace(/_/g, '/');
  const ham = atob(dolgulu.padEnd(dolgulu.length + ((4 - (dolgulu.length % 4)) % 4), '='));
  return Uint8Array.from(ham, (c) => c.charCodeAt(0));
}

function base64UrlMetin(metin: string): string {
  return new TextDecoder().decode(base64UrlCoz(metin));
}

/**
 * Jetonu doğrular. Geçerliyse kullanıcının e-postasını döndürür.
 * Access yapılandırılmamışsa null döner — o durumda panel kapalı sayılır.
 */
export async function accessKimligi(istek: Request): Promise<AccessKimlik | null> {
  const jeton = istek.headers.get(JETON_BASLIGI);
  if (!jeton) return null;

  const parcalar = jeton.split('.');
  if (parcalar.length !== 3) return null;

  const [basB64, govdeB64, imzaB64] = parcalar;

  let bas: { kid?: string; alg?: string };
  let govde: { aud?: string | string[]; exp?: number; iss?: string; email?: string; sub?: string };
  try {
    bas = JSON.parse(base64UrlMetin(basB64));
    govde = JSON.parse(base64UrlMetin(govdeB64));
  } catch {
    return null;
  }

  if (bas.alg !== 'RS256' || !bas.kid) return null;

  // Süre
  if (!govde.exp || govde.exp * 1000 < Date.now()) return null;

  // Kitle (Access uygulamasının kimliği) — yanlış uygulamanın jetonu geçmesin
  const kitle = beklenenKitle();
  if (kitle) {
    const gelen = Array.isArray(govde.aud) ? govde.aud : [govde.aud];
    if (!gelen.includes(kitle)) return null;
  }

  // İmza
  const anahtar = (await anahtarlariAl()).find((a) => a.kid === bas.kid);
  if (!anahtar) return null;

  const kriptoAnahtar = await crypto.subtle.importKey(
    'jwk',
    { kty: anahtar.kty, n: anahtar.n, e: anahtar.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const gecerli = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    kriptoAnahtar,
    base64UrlCoz(imzaB64),
    new TextEncoder().encode(`${basB64}.${govdeB64}`)
  );
  if (!gecerli) return null;

  return { eposta: govde.email ?? '', kimlik: govde.sub ?? '' };
}

/** Panel sayfalarında kullanılan kapı. Yetkisizse yanıt döndürür. */
export async function paneleGiris(
  istek: Request
): Promise<{ kimlik: AccessKimlik } | { yanit: Response }> {
  const kimlik = await accessKimligi(istek);

  if (!kimlik) {
    const alan = ekipAlanAdi();
    return {
      yanit: new Response(
        alan
          ? 'Bu sayfaya erişmek için giriş yapmanız gerekiyor.'
          : 'Yönetim paneli henüz yapılandırılmadı (Cloudflare Access kurulmamış).',
        { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      ),
    };
  }

  return { kimlik };
}
