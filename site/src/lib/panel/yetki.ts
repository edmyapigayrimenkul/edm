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
import {
  accessClaimleriGecerli,
  ekipAlaniniNormallestir,
  type AccessClaimleri,
} from './access-claimleri';
import { yerelTestPanelKimligi } from './yerel-test-kimligi';

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

export { adminProfiliniBul, type AdminProfili } from './admin-profilleri';
import { adminProfiliniBul } from './admin-profilleri';

const JETON_BASLIGI = 'Cf-Access-Jwt-Assertion';

/** Anahtar seti nadiren değişir; isolate ömrü boyunca saklıyoruz. */
let anahtarOnbellegi: { anahtarlar: Jwk[]; zaman: number } | null = null;
const ANAHTAR_OMRU_MS = 60 * 60 * 1000;

function ekipAlanAdi(): string | null {
  const ham = (env as Record<string, unknown>).ACCESS_EKIP_ALANI;
  return ekipAlaniniNormallestir(typeof ham === 'string' ? ham : null);
}

function beklenenKitle(): string | null {
  const ham = (env as Record<string, unknown>).ACCESS_AUD;
  return typeof ham === 'string' && ham.trim() ? ham.trim() : null;
}

/**
 * Access politikası ilk kapıdır. Bu liste ikinci bir uygulama katmanı oluşturur:
 * Access tarafında yanlışlıkla geniş bir allow kuralı açılsa bile yalnızca burada
 * açıkça yazılı yöneticiler panele girebilir.
 */
function izinliAdminEpostalari(): Set<string> {
  const ham = ((env as Record<string, unknown>).PANEL_ADMIN_EPOSTALARI as string) ?? '';
  return new Set(
    ham
      .split(',')
      .map((eposta) => eposta.trim().toLowerCase())
      .filter(Boolean)
  );
}

async function anahtarlariAl(): Promise<Jwk[]> {
  if (anahtarOnbellegi && Date.now() - anahtarOnbellegi.zaman < ANAHTAR_OMRU_MS) {
    return anahtarOnbellegi.anahtarlar;
  }
  const alan = ekipAlanAdi();
  if (!alan) {
    console.error('[panel-access] JWKS alınamadı.', { kod: 'EKIP_ALANI_EKSIK' });
    return [];
  }

  try {
    const yanit = await fetch(`https://${alan}/cdn-cgi/access/certs`, {
      headers: { Accept: 'application/json' },
    });
    if (!yanit.ok) {
      console.error('[panel-access] JWKS alınamadı.', {
        kod: 'HTTP_HATASI',
        durum: yanit.status,
      });
      return [];
    }

    const govde = (await yanit.json()) as { keys?: Jwk[] };
    const anahtarlar = Array.isArray(govde.keys)
      ? govde.keys.filter((anahtar) => anahtar.kty === 'RSA' && anahtar.alg === 'RS256')
      : [];
    if (!anahtarlar.length) {
      console.error('[panel-access] JWKS alınamadı.', { kod: 'GECERLI_ANAHTAR_YOK' });
      return [];
    }

    anahtarOnbellegi = { anahtarlar, zaman: Date.now() };
    return anahtarlar;
  } catch (hata) {
    console.error('[panel-access] JWKS alınamadı.', {
      kod: 'AG_VEYA_JSON_HATASI',
      hata: hata instanceof Error ? hata.message : 'Bilinmeyen hata',
    });
    return [];
  }
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
  let govde: AccessClaimleri;
  try {
    bas = JSON.parse(base64UrlMetin(basB64));
    govde = JSON.parse(base64UrlMetin(govdeB64));
  } catch {
    return null;
  }

  if (bas.alg !== 'RS256' || !bas.kid) return null;

  // Eksik yapılandırma, yanlış Access uygulaması veya farklı ekip alanı güvenli
  // biçimde reddedilir; imza tek başına panel kimliği için yeterli değildir.
  if (
    !accessClaimleriGecerli(govde, {
      ekipAlanAdi: ekipAlanAdi(),
      audience: beklenenKitle(),
    })
  ) {
    return null;
  }

  // İmza
  const anahtar = (await anahtarlariAl()).find((a) => a.kid === bas.kid);
  if (!anahtar) return null;

  try {
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
  } catch (hata) {
    console.error('[panel-access] JWT imza doğrulaması tamamlanamadı.', {
      kod: 'IMZA_DOGRULAMA_HATASI',
      hata: hata instanceof Error ? hata.message : 'Bilinmeyen hata',
    });
    return null;
  }

  return { eposta: govde.email ?? '', kimlik: govde.sub ?? '' };
}

/** Panel sayfalarında kullanılan kapı. Yetkisizse yanıt döndürür. */
export async function paneleGiris(
  istek: Request
): Promise<{ kimlik: AccessKimlik } | { yanit: Response }> {
  const adres = new URL(istek.url);
  // İstemci geliştirme sunucusunda ve Worker testinde kimlik yalnızca loopback'te
  // kullanılabilir. Test Worker'ı üretim derlemesini çalıştırdığı için ayrıca
  // açık bir --var verilmeden bu yol etkinleşmez.
  if (import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(adres.hostname)) {
    return { kimlik: { eposta: 'ozdogandogukan@gmail.com', kimlik: 'yerel-gelistirici' } };
  }

  const yerelTestKimligi = yerelTestPanelKimligi(
    istek.url,
    (env as Record<string, unknown>).PANEL_YEREL_TEST_KIMLIGI as string | undefined
  );
  if (yerelTestKimligi) return { kimlik: yerelTestKimligi };

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

  const izinliEpostalar = izinliAdminEpostalari();
  const eposta = kimlik.eposta.trim().toLowerCase();
  if (!eposta || !izinliEpostalar.has(eposta)) {
    return {
      yanit: new Response('Bu kimliğin yönetim paneli yetkisi bulunmuyor.', {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }),
    };
  }

  return { kimlik: { ...kimlik, eposta } };
}
