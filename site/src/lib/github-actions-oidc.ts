/** GitHub Actions OIDC jetonunu sabit bir secret olmadan doğrular. */

const OIDC_VEREN = 'https://token.actions.githubusercontent.com';
const OIDC_JWKS = `${OIDC_VEREN}/.well-known/jwks`;
export const POSTEDM_OIDC_HEDEF_KITLE = 'edm-postedm-site';

// Adlar değişse bile aynı GitHub kaynağını tanımak için değişmez kimlikler de zorunlu.
const POSTEDM_DEPO = 'edmyapigayrimenkul/postedm';
const POSTEDM_DEPO_KIMLIGI = '1361125362';
const POSTEDM_SAHIP_KIMLIGI = '326407964';
const POSTEDM_IS_AKISLARI = new Set([
  `${POSTEDM_DEPO}/.github/workflows/site-kuyrugu.yml@refs/heads/main`,
  `${POSTEDM_DEPO}/.github/workflows/yayinla.yml@refs/heads/main`,
]);
const IZINLI_OLAYLAR = new Set(['repository_dispatch', 'schedule', 'workflow_dispatch']);

interface JwtBasligi {
  alg?: string;
  kid?: string;
  typ?: string;
}

export interface GithubActionsClaimleri {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  nbf?: number;
  repository?: string;
  repository_id?: string;
  repository_owner_id?: string;
  repository_visibility?: string;
  ref?: string;
  workflow_ref?: string;
  event_name?: string;
  runner_environment?: string;
}

interface JwksYaniti { keys?: Array<JsonWebKey & { kid?: string }> }

let jwksOnbellegi: { bitis: number; anahtarlar: JwksYaniti['keys'] } | null = null;

function base64UrlBaytlari(ham: string): Uint8Array {
  const taban64 = ham.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(ham.length / 4) * 4, '=');
  const ikili = atob(taban64);
  return Uint8Array.from(ikili, (karakter) => karakter.charCodeAt(0));
}

function jwtParcasiniOku<T>(ham: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlBaytlari(ham))) as T;
}

export function githubActionsClaimleriGecerli(claimler: GithubActionsClaimleri, simdi = Math.floor(Date.now() / 1000)): boolean {
  const hedefKitle = Array.isArray(claimler.aud) ? claimler.aud : [claimler.aud];
  const exp = Number(claimler.exp);
  const iat = Number(claimler.iat);
  const nbf = claimler.nbf == null ? iat : Number(claimler.nbf);
  return claimler.iss === OIDC_VEREN
    && hedefKitle.includes(POSTEDM_OIDC_HEDEF_KITLE)
    && Number.isFinite(exp) && Number.isFinite(iat) && Number.isFinite(nbf)
    && exp > simdi - 30 && nbf <= simdi + 30 && iat <= simdi + 30
    && exp - iat > 0 && exp - iat <= 600
    && claimler.repository === POSTEDM_DEPO
    && String(claimler.repository_id) === POSTEDM_DEPO_KIMLIGI
    && String(claimler.repository_owner_id) === POSTEDM_SAHIP_KIMLIGI
    && claimler.repository_visibility === 'private'
    && claimler.ref === 'refs/heads/main'
    && POSTEDM_IS_AKISLARI.has(claimler.workflow_ref ?? '')
    && IZINLI_OLAYLAR.has(claimler.event_name ?? '')
    && claimler.runner_environment === 'github-hosted';
}

async function githubAnahtarlariniGetir(yenile = false): Promise<NonNullable<JwksYaniti['keys']>> {
  if (!yenile && jwksOnbellegi && jwksOnbellegi.bitis > Date.now()) return jwksOnbellegi.anahtarlar ?? [];
  const cevap = await fetch(OIDC_JWKS, { headers: { Accept: 'application/json' } });
  if (!cevap.ok) throw new Error(`GitHub OIDC anahtarları alınamadı: ${cevap.status}`);
  const govde = await cevap.json() as JwksYaniti;
  if (!Array.isArray(govde.keys) || !govde.keys.length) throw new Error('GitHub OIDC anahtar listesi boş.');
  jwksOnbellegi = { bitis: Date.now() + 6 * 60 * 60 * 1000, anahtarlar: govde.keys };
  return govde.keys;
}

async function dogrulamaAnahtari(kid: string): Promise<CryptoKey | null> {
  let jwk = (await githubAnahtarlariniGetir()).find((aday) => aday.kid === kid);
  if (!jwk) jwk = (await githubAnahtarlariniGetir(true)).find((aday) => aday.kid === kid);
  if (!jwk) return null;
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

export async function githubActionsOidcDogrula(yetkilendirme: string | null): Promise<boolean> {
  try {
    if (!yetkilendirme?.startsWith('Bearer ')) return false;
    const jeton = yetkilendirme.slice(7).trim();
    const parcalar = jeton.split('.');
    if (parcalar.length !== 3) return false;
    const baslik = jwtParcasiniOku<JwtBasligi>(parcalar[0]);
    const claimler = jwtParcasiniOku<GithubActionsClaimleri>(parcalar[1]);
    if (baslik.alg !== 'RS256' || baslik.typ !== 'JWT' || !baslik.kid || !githubActionsClaimleriGecerli(claimler)) return false;
    const anahtar = await dogrulamaAnahtari(baslik.kid);
    if (!anahtar) return false;
    return crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      anahtar,
      base64UrlBaytlari(parcalar[2]),
      new TextEncoder().encode(`${parcalar[0]}.${parcalar[1]}`)
    );
  } catch {
    return false;
  }
}
