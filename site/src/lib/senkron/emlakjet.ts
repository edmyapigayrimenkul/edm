/**
 * Emlakjet kazıyıcısı — hem Node betiğinden hem Worker'ın zamanlanmış
 * görevinden çağrılır. Bu yüzden yalnızca her iki ortamda da bulunan
 * API'leri kullanır: fetch, RegExp, JSON. Dosya sistemi yok.
 */

export interface HamIlan {
  id: string;
  kaynak: string;
  kaynakUrl: string;
  baslik: string;
  aciklama: string;
  fiyat: number | null;
  paraBirimi: string;
  islem: 'satilik' | 'kiralik';
  kategori: string;
  tip: string;
  tipGrup: 'konut' | 'arsa' | 'isyeri' | 'diger';
  oda: string | null;
  m2: number | null;
  il: string | null;
  ilce: string | null;
  mahalle: string | null;
  ozellikler: Record<string, string>;
  gorseller: string[];
  danismanSlug: string | null;
  guncellenme: string | null;
  /** Sayfadaki onaylı özellik çipleri: ankastre mutfak, şömine, çelik kapı… */
  donanim: string[];
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const BASLIKLAR: Record<string, string> = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'tr-TR,tr;q=0.9',
};

export const OFIS_URL =
  'https://www.emlakjet.com/emlak-ofisleri/edm-yapi-gayrimenkul-1015383';

const bekle = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function htmlAl(url: string, deneme = 3): Promise<string | null> {
  for (let i = 1; i <= deneme; i++) {
    try {
      const yanit = await fetch(url, { headers: BASLIKLAR });
      if (yanit.status === 200) return await yanit.text();
      if (yanit.status === 404) return null;
      throw new Error(`HTTP ${yanit.status}`);
    } catch (hata) {
      if (i === deneme) throw new Error(`${url} alınamadı: ${(hata as Error).message}`);
      await bekle(1200 * i);
    }
  }
  return null;
}

/* --------------------------------------------------------------
   JSON-LD okuma
   -------------------------------------------------------------- */
function ldBloklari(html: string): unknown[] {
  const cikti: unknown[] = [];
  const desen =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let esleme: RegExpExecArray | null;
  while ((esleme = desen.exec(html))) {
    try {
      cikti.push(JSON.parse(esleme[1]));
    } catch {
      /* bozuk blok — atla */
    }
  }
  return cikti;
}

function turBul<T = Record<string, unknown>>(bloklar: unknown[], tur: string): T | null {
  const yigin = [...bloklar];
  const gorulen = new Set<unknown>();
  while (yigin.length) {
    const dugum = yigin.shift();
    if (!dugum || typeof dugum !== 'object' || gorulen.has(dugum)) continue;
    gorulen.add(dugum);
    if (Array.isArray(dugum)) {
      yigin.push(...dugum);
      continue;
    }
    const nesne = dugum as Record<string, unknown>;
    if (nesne['@type'] === tur) return nesne as T;
    if (Array.isArray(nesne['@graph'])) yigin.push(...(nesne['@graph'] as unknown[]));
    for (const deger of Object.values(nesne)) {
      if (deger && typeof deger === 'object') yigin.push(deger);
    }
  }
  return null;
}

function metaIcerik(html: string, ozellik: string): string | null {
  const desen = new RegExp(
    `<meta[^>]+property=["']${ozellik}["'][^>]+content=["']([^"']*)["']`,
    'i'
  );
  const esleme = html.match(desen);
  return esleme ? varlikCoz(esleme[1]) : null;
}

function varlikCoz(metin: string): string {
  return String(metin)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/* --------------------------------------------------------------
   Alan çözümleyiciler
   -------------------------------------------------------------- */
function kategoriCoz(kategori = ''): { islem: 'satilik' | 'kiralik'; tip: string } {
  const k = kategori.toLocaleLowerCase('tr');
  const islem = k.startsWith('kiralık') || k.startsWith('kiralik') ? 'kiralik' : 'satilik';
  const tip = k.replace(/^(satılık|satilik|kiralık|kiralik)\s*/, '').trim();
  return { islem, tip: tip || 'diger' };
}

const TIP_GRUP: Record<string, HamIlan['tipGrup']> = {
  daire: 'konut',
  villa: 'konut',
  'müstakil ev': 'konut',
  residence: 'konut',
  yazlık: 'konut',
  arsa: 'arsa',
  tarla: 'arsa',
  bağ: 'arsa',
  bahçe: 'arsa',
  'villa imarlı': 'arsa',
  'konut imarlı': 'arsa',
  'ticari imarlı': 'arsa',
  'toplu konut için': 'arsa',
  'sanayi imarlı': 'arsa',
  zeytinlik: 'arsa',
  dükkan: 'isyeri',
  'dükkân': 'isyeri',
  ofis: 'isyeri',
  depo: 'isyeri',
  fabrika: 'isyeri',
  'iş yeri': 'isyeri',
};

/** "15 741m²", "1.924 Metrekare", "9456m²" -> 15741 / 1924 / 9456 */
function alanCoz(metin: string | null | undefined): number | null {
  if (!metin) return null;
  const desen = /(\d[\d.\s]{0,12}?)\s*(?:m²|m2\b|metrekare)/gi;
  let esleme: RegExpExecArray | null;
  while ((esleme = desen.exec(metin))) {
    const sayi = parseInt(esleme[1].replace(/[^\d]/g, ''), 10);
    if (sayi >= 10 && sayi <= 10_000_000) return sayi;
  }
  return null;
}

function m2Coz(
  ozellikler: Record<string, string>,
  html: string,
  baslik: string,
  aciklama: string
): number | null {
  for (const anahtar of ['Brüt Metrekare', 'Net Metrekare', 'Metrekare', 'Alan']) {
    const deger = ozellikler[anahtar];
    if (deger) {
      const sayi = parseInt(String(deger).replace(/[^\d]/g, ''), 10);
      if (sayi > 0) return sayi;
    }
  }
  // Konutlarda og:description'da geçiyor; arsada alan boş bırakılıp
  // ölçü başlığa ve açıklamaya yazılıyor.
  return (
    alanCoz(metaIcerik(html, 'og:description')) ??
    alanCoz(baslik) ??
    alanCoz(aciklama.slice(0, 500))
  );
}

function odaCoz(ozellikler: Record<string, string>, html: string): string | null {
  if (ozellikler['Oda Sayısı']) return String(ozellikler['Oda Sayısı']).trim();
  const og = metaIcerik(html, 'og:description') ?? '';
  const esleme = og.match(/(\d+\s*\+\s*\d+|Stüdyo)\s*Oda/i);
  return esleme ? esleme[1].replace(/\s/g, '') : null;
}

function konumCoz(
  kirintilar: string[],
  kategori: string
): { il: string | null; ilce: string | null; mahalle: string | null } {
  const sonuc = { il: null as string | null, ilce: null as string | null, mahalle: null as string | null };
  const kat = kategori.trim();

  for (const kirinti of kirintilar) {
    if (!kirinti || !kat) continue;
    if (kirinti.endsWith(kat)) {
      const yer = kirinti.slice(0, -kat.length).trim();
      if (!yer) continue;
      const parcalar = yer.split(/\s+/);
      if (!sonuc.il) sonuc.il = parcalar[0];
      if (parcalar.length > 1 && !sonuc.ilce) sonuc.ilce = parcalar.slice(1).join(' ');
    }
    const mah = kirinti.match(/^(.+?\s(?:Mahallesi|Mah\.?|Köyü|Beldesi))\s/);
    if (mah && !sonuc.mahalle) {
      let ad = mah[1];
      if (sonuc.ilce && ad.startsWith(`${sonuc.ilce} `)) ad = ad.slice(sonuc.ilce.length + 1);
      sonuc.mahalle = ad;
    }
  }
  return sonuc;
}

/* --------------------------------------------------------------
   Sayfa gövdesinden zengin veri
   --------------------------------------------------------------
   JSON-LD yalnızca birkaç alan veriyor; asıl zengin bilgi sayfanın
   kendisinde: onaylı özellik çipleri ve değer/etiket çiftleri.
   -------------------------------------------------------------- */

/** Onay simgesiyle işaretlenmiş özellikleri toplar. */
function donanimCoz(html: string): string[] {
  const bulunan = [...html.matchAll(/ee-icon-check[\s\S]{0,140}?<\/span>([^<>]{2,45})<\/span>/g)]
    .map((m) => varlikCoz(m[1]).trim())
    .filter((d) => d && !/^\s*$/.test(d));
  return [...new Set(bulunan)];
}

/**
 * Emlakjet'in Product JSON-LD'si bazı ilanlarda galerinin ilk 10 karesiyle
 * sınırlı. Aynı sayfaya gömülü küçük/responsive CDN adreslerinden kalan
 * fotoğrafları da toplar ve hepsini EDM'in görsel sunum katmanının tanıdığı
 * kanonik listing adresine çevirir. Yalnızca bu ilanın listing yolu kabul edilir.
 */
export function emlakjetGorselleriniCoz(html: string, ilanId: string, jsonLd: unknown): string[] {
  const degerler = typeof jsonLd === 'string'
    ? [jsonLd]
    : Array.isArray(jsonLd)
      ? jsonLd.filter((deger): deger is string => typeof deger === 'string')
      : [];
  // Emlakjet sayfa verisi JSON içinde eğik çizgileri ters eğik çizgiyle
  // kaçırabiliyor; HTML öznitelikleri de &amp; olarak yazılabiliyor.
  const kaynak = [...degerler, varlikCoz(html)]
    .join('\n')
    .replace(/\\u002f/gi, '/')
    .replace(/\\\//g, '/');
  const desen = /(?:https?:)?\/\/imaj\.emlakjet\.com\/(?:resize\/(?:\d+\/)*)?listing\/(\d+)\/([a-f\d]{32}\d+\.(?:jpg|jpeg|png|webp))/gi;
  const bulunan = new Set<string>();
  const sonuc: string[] = [];
  let eslesme: RegExpExecArray | null;
  while ((eslesme = desen.exec(kaynak))) {
    if (eslesme[1] !== ilanId) continue;
    const anahtar = eslesme[2].toLowerCase();
    if (bulunan.has(anahtar)) continue;
    bulunan.add(anahtar);
    sonuc.push(`https://imaj.emlakjet.com/listing/${ilanId}/${eslesme[2]}`);
  }
  return sonuc;
}

function urunGorselleriCoz(urunImage: unknown, html: string, ilanId: string): string[] {
  const jsonLd = typeof urunImage === 'string'
    ? [urunImage]
    : Array.isArray(urunImage)
      ? urunImage.filter((deger): deger is string => typeof deger === 'string')
      : [];
  return emlakjetGorselleriniCoz(html, ilanId, jsonLd);
}

/**
 * "220 m²" değeri ile "Brüt" etiketinin ayrı etiketlerde durduğu ikilileri
 * okur: Oda Sayısı, Banyo Sayısı, Kat Sayısı, Brüt, Net, Bina Yaşı.
 */
function olcuCiftleri(html: string): Record<string, string> {
  const cikti: Record<string, string> = {};
  const desen =
    /<p class="[^"]*font-semibold[^"]*">([^<]{1,40})<\/p><p class="text-xs[^"]*">([^<]{2,30})<\/p>/g;
  let m: RegExpExecArray | null;
  while ((m = desen.exec(html))) {
    const etiket = varlikCoz(m[2]).trim();
    const deger = varlikCoz(m[1]).trim();
    if (etiket && deger) cikti[etiket] = deger;
  }
  return cikti;
}

/* --------------------------------------------------------------
   Dışa açılan iki işlev
   -------------------------------------------------------------- */
export async function ofisIlanLinkleri(
  ofisUrl = OFIS_URL,
  enFazlaSayfa = 10
): Promise<{ linkler: Array<{ id: string; url: string }>; tamam: boolean; sebep: string | null }> {
  const gorulen = new Map<string, string>();
  let ilkSayfaIdleri: string[] = [];
  let tamam = false;
  let sebep: string | null = null;

  for (let sayfa = 1; sayfa <= enFazlaSayfa; sayfa++) {
    const url = sayfa === 1 ? ofisUrl : `${ofisUrl}?sayfa=${sayfa}`;
    let html: string | null;
    try {
      html = await htmlAl(url);
    } catch (hata) {
      if (sayfa === 1) throw hata;
      sebep = `Sayfa ${sayfa} alınamadı; liste eksik olabilir.`;
      break;
    }
    if (!html) {
      if (sayfa > 1) tamam = true;
      else sebep = 'Ofis ilan listesi alınamadı.';
      break;
    }

    const linkler = [...html.matchAll(/href="(\/ilan\/[^"]+?-(\d+))"/g)].map((m) => ({
      url: `https://www.emlakjet.com${m[1]}`,
      id: m[2],
    }));

    if (linkler.length === 0) {
      tamam = true;
      break;
    }

    if (sayfa === 1) ilkSayfaIdleri = [...new Set(linkler.map((l) => l.id))];

    const yeni = linkler.filter((l) => !gorulen.has(l.id));
    if (yeni.length === 0) {
      // Emlakjet, mevcut son sayfadan sonra ?sayfa=N için ilk sayfayı
      // döndürüyor. Bu ancak en az bir farklı ara sayfa başarıyla okunduysa
      // doğal son kabul edilir; sayfa 2'nin tekrarı eksik liste sayılır.
      const yinelenenIdler = [...new Set(linkler.map((l) => l.id))];
      const ilkSayfayaDondu =
        yinelenenIdler.length === ilkSayfaIdleri.length &&
        yinelenenIdler.every((id) => ilkSayfaIdleri.includes(id));
      if (sayfa > 2 && ilkSayfayaDondu && gorulen.size > ilkSayfaIdleri.length) tamam = true;
      else sebep = `Sayfa ${sayfa} önceki sayfayla aynı ilanları döndürdü.`;
      break;
    }

    for (const l of yeni) gorulen.set(l.id, l.url);
    if (sayfa < enFazlaSayfa) await bekle(600);
    else sebep = `Sayfa sınırına (${enFazlaSayfa}) ulaşıldı; listenin devamı olabilir.`;
  }

  return { linkler: [...gorulen].map(([id, url]) => ({ id, url })), tamam, sebep };
}

export async function ilanDetay(link: { id: string; url: string }): Promise<HamIlan | null> {
  const html = await htmlAl(link.url);
  if (!html) return null;

  const bloklar = ldBloklari(html);
  const urun = turBul<Record<string, any>>(bloklar, 'Product');
  const kayit = turBul<Record<string, any>>(bloklar, 'RealEstateListing');
  const kirinti = turBul<Record<string, any>>(bloklar, 'BreadcrumbList');
  if (!urun) return null;

  const konut = (kayit?.itemOffered ?? {}) as Record<string, any>;
  const ozellikler = Object.fromEntries(
    ((konut.additionalProperty ?? []) as Array<{ name: string; value: string }>).map((p) => [
      p.name,
      p.value,
    ])
  );

  // Sayfa gövdesindeki ölçüleri künyeye ekliyoruz; JSON-LD'de yoklar.
  for (const [etiket, deger] of Object.entries(olcuCiftleri(html))) {
    const ad =
      etiket === 'Brüt' ? 'Brüt Metrekare' : etiket === 'Net' ? 'Net Metrekare' : etiket;
    if (!ozellikler[ad]) ozellikler[ad] = deger;
  }

  const kategori = ozellikler['Kategori'] ?? '';
  const { islem, tip } = kategoriCoz(kategori);
  const kirintilar = ((kirinti?.itemListElement ?? []) as Array<{ name: string }>).map(
    (c) => c.name
  );
  const konum = konumCoz(kirintilar, kategori);

  const baslik = varlikCoz(urun.name ?? '').trim();
  const aciklama = varlikCoz(urun.description ?? '').trim();
  const danisman = html.match(/href="\/danismanlar\/([a-z0-9-]+-\d+)"/i);

  return {
    id: String(link.id),
    kaynak: 'emlakjet',
    kaynakUrl: urun.url ?? link.url,
    baslik,
    aciklama,
    fiyat: Number(urun.offers?.price ?? 0) || null,
    paraBirimi: urun.offers?.priceCurrency ?? 'TRY',
    islem,
    kategori,
    tip,
    tipGrup: TIP_GRUP[tip] ?? 'diger',
    oda: odaCoz(ozellikler, html),
    m2: m2Coz(ozellikler, html, baslik, aciklama),
    il: konum.il,
    ilce: konum.ilce,
    mahalle: konum.mahalle,
    ozellikler,
    gorseller: urunGorselleriCoz(urun.image, html, String(link.id)),
    danismanSlug: danisman?.[1] ?? null,
    guncellenme: kayit?.dateModified ?? null,
    donanim: donanimCoz(html),
  };
}

/** Tüm portföyü çeker. `ilerleme` her ilandan sonra çağrılır. */
export async function portfoyuCek(
  ilerleme?: (sira: number, toplam: number, ilan: HamIlan | null) => void
): Promise<{ ilanlar: HamIlan[]; basarisiz: string[] }> {
  const liste = await ofisIlanLinkleri();
  if (!liste.tamam) {
    throw new Error(`Portal ilan listesi doğrulanamadı: ${liste.sebep ?? 'eksik sonuç'}`);
  }
  const linkler = liste.linkler;
  const ilanlar: HamIlan[] = [];
  const basarisiz: string[] = [];

  for (const [sira, link] of linkler.entries()) {
    try {
      const detay = await ilanDetay(link);
      if (detay) ilanlar.push(detay);
      else basarisiz.push(link.id);
      ilerleme?.(sira + 1, linkler.length, detay);
    } catch {
      basarisiz.push(link.id);
      ilerleme?.(sira + 1, linkler.length, null);
    }
    await bekle(450);
  }

  return { ilanlar, basarisiz };
}
