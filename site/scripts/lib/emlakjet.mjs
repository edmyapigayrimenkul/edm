// Emlakjet ofis portföyünü çeken kazıyıcı.
// Ofis sayfası -> ilan URL listesi -> her ilanın JSON-LD'si -> normalize edilmiş kayıt.

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'tr-TR,tr;q=0.9',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getHtml(url, { retries = 3 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 200) return await res.text();
      if (res.status === 404) return null;
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (attempt === retries) throw new Error(`${url} alınamadı: ${err.message}`);
      await sleep(1500 * attempt);
    }
  }
}

function jsonLdBlocks(html) {
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1]));
    } catch {
      /* bozuk blok - atla */
    }
  }
  return out;
}

/** JSON-LD ağacını düzleştirip @type'a göre ilk eşleşeni döndürür. */
function findType(blocks, type) {
  const stack = [...blocks];
  while (stack.length) {
    const node = stack.shift();
    if (!node || typeof node !== 'object') continue;
    if (Array.isArray(node)) {
      stack.push(...node);
      continue;
    }
    if (node['@type'] === type) return node;
    if (node['@graph']) stack.push(...node['@graph']);
    for (const v of Object.values(node)) {
      if (v && typeof v === 'object') stack.push(v);
    }
  }
  return null;
}

function metaContent(html, property) {
  const re = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  return m ? decodeEntities(m[1]) : null;
}

function decodeEntities(s) {
  return String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/** "Satılık Villa" -> { islem: 'satilik', tip: 'villa' } */
function parseKategori(kategori = '') {
  const k = kategori.toLocaleLowerCase('tr');
  const islem = k.startsWith('kiralık') || k.startsWith('kiralik') ? 'kiralik' : 'satilik';
  const tip = k
    .replace(/^(satılık|satilik|kiralık|kiralik)\s*/, '')
    .trim()
    .toLocaleLowerCase('tr');
  return { islem, tip: tip || 'diger' };
}

const TIP_NORMAL = {
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
function alanCoz(metin) {
  if (!metin) return null;
  const re = /(\d[\d.\s]{0,12}?)\s*(?:m²|m2\b|metrekare)/gi;
  let m;
  while ((m = re.exec(metin))) {
    const n = parseInt(m[1].replace(/[^\d]/g, ''), 10);
    // Makul arsa/konut aralığı: 10 m² - 10.000.000 m²
    if (n >= 10 && n <= 10_000_000) return n;
  }
  return null;
}

function m2From(props, html, baslik, aciklama) {
  const keys = ['Brüt Metrekare', 'Net Metrekare', 'Metrekare', 'Alan', 'm² (Brüt)', 'm² (Net)'];
  for (const k of keys) {
    if (props[k]) {
      const n = parseInt(String(props[k]).replace(/[^\d]/g, ''), 10);
      if (n > 0) return n;
    }
  }
  // Konutlarda og:description'da "220 m²" olarak geçiyor.
  const ogAlan = alanCoz(metaContent(html, 'og:description'));
  if (ogAlan) return ogAlan;
  // Arsa/tarlada alan alanı boş bırakılıyor; başlıkta ve açıklamada yazıyor.
  return alanCoz(baslik) ?? alanCoz((aciklama || '').slice(0, 500));
}

function odaFrom(props, html) {
  if (props['Oda Sayısı']) return String(props['Oda Sayısı']).trim();
  const og = metaContent(html, 'og:description') || '';
  const m = og.match(/(\d+\s*\+\s*\d+|Stüdyo)\s*Oda/i);
  return m ? m[1].replace(/\s/g, '') : null;
}

export async function ofisIlanLinkleri(ofisUrl, { maxSayfa = 10 } = {}) {
  const gorulen = new Map();
  for (let sayfa = 1; sayfa <= maxSayfa; sayfa++) {
    const url = sayfa === 1 ? ofisUrl : `${ofisUrl}?sayfa=${sayfa}`;
    const html = await getHtml(url);
    if (!html) break;

    const linkler = [...html.matchAll(/href="(\/ilan\/[^"]+?-(\d+))"/g)].map((m) => ({
      url: `https://www.emlakjet.com${m[1]}`,
      id: m[2],
    }));

    const yeni = linkler.filter((l) => !gorulen.has(l.id));
    if (yeni.length === 0) break; // aynı sayfa tekrar geldi -> sayfalama bitti

    for (const l of yeni) gorulen.set(l.id, l.url);
    if (sayfa < maxSayfa) await sleep(800);
  }
  return [...gorulen].map(([id, url]) => ({ id, url }));
}

export async function ilanDetay({ id, url }) {
  const html = await getHtml(url);
  if (!html) return null;

  const blocks = jsonLdBlocks(html);
  const product = findType(blocks, 'Product');
  const listing = findType(blocks, 'RealEstateListing');
  const breadcrumb = findType(blocks, 'BreadcrumbList');
  if (!product) return null;

  const residence = listing?.itemOffered ?? {};
  const props = Object.fromEntries(
    (residence.additionalProperty ?? []).map((p) => [p.name, p.value])
  );

  const kategori = props['Kategori'] ?? '';
  const { islem, tip } = parseKategori(kategori);

  // Konum kırılımı breadcrumb'dan: ... > İstanbul Silivri Satılık Villa > Silivri Mimar Sinan Mahallesi ...
  const crumbs = (breadcrumb?.itemListElement ?? []).map((c) => c.name);
  const konum = konumCoz(crumbs, kategori);

  const fiyat = Number(product.offers?.price ?? 0) || null;
  // İlanı yükleyen danışmanın profil bağlantısı detay sayfasında geçiyor.
  const danismanEsleme = html.match(/href="\/danismanlar\/([a-z0-9-]+-(\d+))"/i);
  const baslik = decodeEntities(product.name ?? '').trim();
  const aciklama = decodeEntities(product.description ?? '').trim();

  return {
    id: String(id),
    kaynak: 'emlakjet',
    kaynakUrl: product.url ?? url,
    baslik,
    aciklama,
    fiyat,
    paraBirimi: product.offers?.priceCurrency ?? 'TRY',
    islem, // satilik | kiralik
    kategori, // "Satılık Villa"
    tip, // villa, daire, arsa...
    tipGrup: TIP_NORMAL[tip] ?? 'diger',
    oda: odaFrom(props, html),
    m2: m2From(props, html, baslik, aciklama),
    il: konum.il,
    ilce: konum.ilce,
    mahalle: konum.mahalle,
    ozellikler: props,
    gorseller: [...new Set(product.image ?? [])],
    danismanSlug: danismanEsleme?.[1] ?? null,
    guncellenme: listing?.dateModified ?? null,
    cekilme: new Date().toISOString(),
  };
}

function konumCoz(crumbs, kategori) {
  const sonuc = { il: null, ilce: null, mahalle: null };
  const kat = kategori.trim();
  for (const c of crumbs) {
    if (!c || !kat) continue;
    // "İstanbul Satılık Villa" -> il ; "İstanbul Silivri Satılık Villa" -> il + ilçe
    if (c.endsWith(kat)) {
      const yer = c.slice(0, -kat.length).trim();
      if (!yer) continue;
      const parcalar = yer.split(/\s+/);
      if (!sonuc.il) sonuc.il = parcalar[0];
      if (parcalar.length > 1 && !sonuc.ilce) sonuc.ilce = parcalar.slice(1).join(' ');
    }
    const mah = c.match(/^(.+?\s(?:Mahallesi|Mah\.?|Köyü|Beldesi))\s/);
    if (mah && !sonuc.mahalle) {
      // "Silivri Mimar Sinan Mahallesi" -> ilçe önekini at -> "Mimar Sinan Mahallesi"
      let m = mah[1];
      if (sonuc.ilce && m.startsWith(sonuc.ilce + ' ')) m = m.slice(sonuc.ilce.length + 1);
      sonuc.mahalle = m;
    }
  }
  return sonuc;
}
