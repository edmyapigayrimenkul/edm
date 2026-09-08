/**
 * Mahalle koordinatları.
 *
 * İlanlarda koordinat yok, sadece "Mimar Sinan Mahallesi · Silivri · İstanbul"
 * gibi bir adres var. Haritayı gösterebilmek için bunu bir kez koordinata
 * çeviriyoruz ve saklıyoruz.
 *
 * Bilinçli bir tercih: kesin adres göstermiyoruz. Mülkün tam yeri ilanda
 * yazmıyor ve yazmamalı — haritada mahallenin merkezini, geniş bir daireyle
 * gösteriyoruz. Ziyaretçi bölgeyi görüyor, kapı numarasını değil.
 *
 * Nominatim (OpenStreetMap) ücretsiz ama nazik kullanım istiyor: saniyede bir
 * istek ve tanımlayıcı bir User-Agent. Mahalle başına bir kez sorup
 * veritabanında tuttuğumuz için pratikte birkaç haftada bir tek istek oluyor.
 */

export const KONUM_SEMA = `
CREATE TABLE IF NOT EXISTS konum_koordinat (
  anahtar    TEXT PRIMARY KEY,
  mahalle    TEXT,
  ilce       TEXT,
  il         TEXT,
  enlem      REAL,
  boylam     REAL,
  bulundu    INTEGER NOT NULL DEFAULT 0,
  sorgulama  TEXT NOT NULL
);
`;

export interface Koordinat {
  enlem: number;
  boylam: number;
}

const AJAN = 'EDM Yapi Gayrimenkul site (edmyapigayrimenkul.com)';

export function konumAnahtari(
  mahalle: string | null,
  ilce: string | null,
  il: string | null
): string {
  return [mahalle, ilce, il].filter(Boolean).join('|').toLocaleLowerCase('tr');
}

/** Nominatim'den tek bir adres sorar. Bulamazsa null döner. */
async function coz(
  mahalle: string | null,
  ilce: string | null,
  il: string | null
): Promise<Koordinat | null> {
  const parcalar = [mahalle, ilce, il, 'Türkiye'].filter(Boolean).join(', ');
  const adres = new URL('https://nominatim.openstreetmap.org/search');
  adres.searchParams.set('q', parcalar);
  adres.searchParams.set('format', 'json');
  adres.searchParams.set('limit', '1');
  adres.searchParams.set('countrycodes', 'tr');

  try {
    const yanit = await fetch(adres, {
      headers: { 'User-Agent': AJAN, 'Accept-Language': 'tr' },
    });
    if (!yanit.ok) return null;

    const sonuc = (await yanit.json()) as Array<{ lat: string; lon: string }>;
    if (!sonuc.length) return null;

    const enlem = Number.parseFloat(sonuc[0].lat);
    const boylam = Number.parseFloat(sonuc[0].lon);
    if (!Number.isFinite(enlem) || !Number.isFinite(boylam)) return null;

    // Türkiye sınırları dışına düşen bir sonuç yanlış eşleşmedir.
    if (enlem < 35.5 || enlem > 42.5 || boylam < 25.5 || boylam > 45) return null;

    return { enlem, boylam };
  } catch {
    return null;
  }
}

/**
 * Portföydeki adreslerden koordinatı olmayanları çözer.
 * Her çalıştırmada en fazla `sinir` kadar yeni sorgu yapar; acelesi yok,
 * kalanlar bir sonraki senkronda tamamlanır.
 */
export async function koordinatlariTamamla(
  vt: D1Database,
  sinir = 12
): Promise<{ sorulan: number; bulunan: number }> {
  await vt.prepare(KONUM_SEMA.trim()).run();

  const eksikler = await vt
    .prepare(
      `SELECT DISTINCT i.mahalle, i.ilce, i.il
       FROM ilanlar i
       LEFT JOIN konum_koordinat k
         ON k.anahtar = LOWER(
              TRIM(COALESCE(i.mahalle,'') || '|' || COALESCE(i.ilce,'') || '|' || COALESCE(i.il,''))
            )
       WHERE i.durum = 'aktif' AND i.ilce IS NOT NULL AND k.anahtar IS NULL
       LIMIT ?`
    )
    .bind(sinir)
    .all<{ mahalle: string | null; ilce: string | null; il: string | null }>();

  let bulunan = 0;
  const suAn = new Date().toISOString();

  for (const yer of eksikler.results ?? []) {
    const koordinat = await coz(yer.mahalle, yer.ilce, yer.il);
    // Mahalle bulunamazsa ilçe merkezine düş — harita yine anlamlı kalır.
    const yedek = koordinat ?? (yer.mahalle ? await coz(null, yer.ilce, yer.il) : null);

    await vt
      .prepare(
        `INSERT OR REPLACE INTO konum_koordinat
           (anahtar, mahalle, ilce, il, enlem, boylam, bulundu, sorgulama)
         VALUES (?,?,?,?,?,?,?,?)`
      )
      .bind(
        konumAnahtari(yer.mahalle, yer.ilce, yer.il),
        yer.mahalle,
        yer.ilce,
        yer.il,
        yedek?.enlem ?? null,
        yedek?.boylam ?? null,
        yedek ? 1 : 0,
        suAn
      )
      .run();

    if (yedek) bulunan++;
    // Nominatim'e saniyede birden fazla istek atmıyoruz.
    await new Promise((r) => setTimeout(r, 1100));
  }

  return { sorulan: (eksikler.results ?? []).length, bulunan };
}

/** Tüm bilinen koordinatları anahtar -> koordinat haritası olarak döndürür. */
export async function koordinatHaritasi(vt: D1Database): Promise<Map<string, Koordinat>> {
  try {
    const sonuc = await vt
      .prepare(`SELECT anahtar, enlem, boylam FROM konum_koordinat WHERE bulundu = 1`)
      .all<{ anahtar: string; enlem: number; boylam: number }>();
    return new Map(
      (sonuc.results ?? []).map((s) => [s.anahtar, { enlem: s.enlem, boylam: s.boylam }])
    );
  } catch {
    // Tablo henüz yoksa harita boş kalır, sayfalar haritasız çalışır.
    return new Map();
  }
}
