const ON_EK = '/foto/emlakjet/';
const AZAMI_BAYT = 3 * 1024 * 1024;

/** Kaynak sunucu sabittir; yalnız iki boyut ve ilan fotoğrafı kabul edilir. */
export function emlakjetGorselAdresi(istek: Request): string | null {
  const adres = new URL(istek.url);
  if (istek.method !== 'GET' || adres.search || !adres.pathname.startsWith(ON_EK)) return null;
  const yol = adres.pathname.slice(ON_EK.length);
  if (!/^(?:640|960)\/listing\/\d+\/[a-f\d]{32}\d+\.(?:jpg|jpeg|png|webp)$/i.test(yol)) return null;
  return `https://imaj.emlakjet.com/resize/${yol.replace('/listing/', '/0/listing/')}`;
}

/** CDN gövdesini kendi alan adından verir; dönüştürme veya R2 kopyası yoktur. */
export async function emlakjetGorselSun(
  istek: Request,
  onbellek: Pick<Cache, 'match' | 'put'>,
  beklet: (is: Promise<unknown>) => void,
  getir: typeof fetch = fetch,
): Promise<Response> {
  const kaynak = emlakjetGorselAdresi(istek);
  const hata = (durum: number) => new Response('Fotoğraf yüklenemedi', { status: durum, headers: { 'Cache-Control': 'no-store' } });
  if (!kaynak) return hata(404);
  const anahtar = new Request(istek.url, { method: 'GET' });
  const kayitli = await onbellek.match(anahtar);
  if (kayitli) {
    const yanit = new Response(kayitli.body, kayitli);
    yanit.headers.set('X-EDM-Foto', 'HIT');
    return yanit;
  }
  try {
    // Sabit biçim tercihi farklı tarayıcıların aynı cache anahtarında
    // birbirine uygun olmayan CDN varyantları paylaşmasını önler.
    const uzak = await getir(kaynak, {
      headers: { Accept: 'image/jpeg', 'User-Agent': 'Mozilla/5.0 EDM-Gorsel' },
      redirect: 'manual', signal: AbortSignal.timeout(8000),
    });
    const tur = uzak.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() ?? '';
    if (!uzak.ok || !/^image\/(?:jpeg|png|webp|avif)$/.test(tur)) {
      console.warn('Emlakjet fotoğraf yanıtı uygun değil:', uzak.status, tur);
      return hata(502);
    }
    if (Number(uzak.headers.get('Content-Length') ?? '0') > AZAMI_BAYT) {
      await uzak.body?.cancel();
      return hata(502);
    }
    // Başlık eksik veya yanlış olsa da büyük gövdeyi belleğe doldurmayız.
    if (!uzak.body) return hata(502);
    const okuyucu = uzak.body.getReader();
    const parcalar: Uint8Array[] = [];
    let boyut = 0;
    while (true) {
      const { done, value } = await okuyucu.read();
      if (done) break;
      boyut += value.byteLength;
      if (boyut > AZAMI_BAYT) {
        await okuyucu.cancel();
        return hata(502);
      }
      parcalar.push(value);
    }
    if (!boyut) return hata(502);
    const govde = new Uint8Array(boyut);
    let konum = 0;
    for (const parca of parcalar) {
      govde.set(parca, konum);
      konum += parca.byteLength;
    }
    const yanit = new Response(govde, { headers: {
      'Content-Type': tur, 'Content-Length': String(govde.byteLength),
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      'X-Content-Type-Options': 'nosniff', 'X-EDM-Foto': 'MISS',
    } });
    if (uzak.headers.get('ETag')) yanit.headers.set('ETag', uzak.headers.get('ETag')!);
    beklet(onbellek.put(anahtar, yanit.clone()).catch(() => {}));
    return yanit;
  } catch (sorun) {
    console.warn('Emlakjet fotoğrafı alınamadı:', sorun instanceof Error ? sorun.message : 'ağ hatası');
    return hata(502);
  }
}
