const ONBELLEKSIZ_YOLLAR = [/^\/api(?:\/|$)/, /^\/yonetim(?:\/|$)/];
export const GENEL_HTML_KONTROLU = 'public, max-age=0, must-revalidate, s-maxage=60';

/** Önbellek anahtarı kişisel bağlam veya yönetim/API verisi taşımaz. */
export function genelHtmlOnbellekAnahtari(istek: Request): Request | null {
  const url = new URL(istek.url);
  if (istek.method !== 'GET') return null;
  if (ONBELLEKSIZ_YOLLAR.some((yol) => yol.test(url.pathname))) return null;
  if (istek.headers.has('Authorization') || istek.headers.has('Cookie')) return null;
  if (/no-cache|no-store/i.test(istek.headers.get('Cache-Control') ?? '')) return null;
  // Eski dağıtımın farklı tazeleme kuralıyla sakladığı HTML'i kullanma.
  url.searchParams.set('__edm_html_onbellek', '2');
  return new Request(url.toString(), { method: 'GET' });
}

/** Yalnızca kısa süreli ve açıkça herkese açık HTML saklanabilir. */
export function genelHtmlSaklanabilir(yanit: Response): boolean {
  if (yanit.status !== 200) return false;
  if (!(yanit.headers.get('Content-Type') ?? '').toLowerCase().includes('text/html')) return false;
  if (yanit.headers.has('Set-Cookie')) return false;
  if (yanit.headers.get('Vary')?.trim() === '*') return false;

  const kontrol = yanit.headers.get('Cache-Control') ?? '';
  if (/(?:^|,)\s*(?:private|no-store|no-cache)\b/i.test(kontrol)) return false;
  return /(?:^|,)\s*public\b/i.test(kontrol) && /(?:^|,)\s*s-maxage=\d+/i.test(kontrol);
}

/** HIT süresi yeniden başlamaz; tarayıcı her gezinmede sunucuya danışır. */
export async function genelHtmlSun(
  istek: Request,
  onbellek: Pick<Cache, 'match' | 'put'>,
  uret: () => Promise<Response>,
  beklet: (is: Promise<unknown>) => void
): Promise<Response> {
  const anahtar = genelHtmlOnbellekAnahtari(istek);
  if (!anahtar) return uret();
  const kayitli = await onbellek.match(anahtar);
  if (kayitli) {
    const yanit = new Response(kayitli.body, kayitli);
    yanit.headers.set('Cache-Control', GENEL_HTML_KONTROLU);
    yanit.headers.set('X-EDM-Cache', 'HIT');
    return yanit;
  }
  const yanit = await uret();
  if (!genelHtmlSaklanabilir(yanit)) return yanit;
  const kacirma = new Response(yanit.body, yanit);
  kacirma.headers.set('Cache-Control', GENEL_HTML_KONTROLU);
  kacirma.headers.set('X-EDM-Cache', 'MISS');
  beklet(onbellek.put(anahtar, kacirma.clone()).catch((hata) => {
    console.warn('HTML önbelleğine yazılamadı:', hata instanceof Error ? hata.message : String(hata));
  }));
  return kacirma;
}
