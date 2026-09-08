#!/usr/bin/env node
/**
 * Mahalle koordinatlarını çözer ve D1'e yazar.
 *
 * Neden Worker'dan değil buradan: Nominatim, veri merkezi IP'lerinden gelen
 * istekleri kabul etmiyor — Worker'dan yapılan sorgular boş dönüyor. Çözülecek
 * konum sayısı 27 ve yeni mahalle ayda bir iki tane ekleniyor, o yüzden bunu
 * elle çalıştırılan bir betiğe almak hem çalışıyor hem yeterli.
 *
 * Kullanım:  node scripts/koordinat-coz.mjs
 */

import { cf, ortam } from './lib/cf.mjs';

const VT_ID = '30d4df58-b49f-43c8-95c5-5a538ce44f68';
const AJAN = 'EDM Yapi Gayrimenkul site (edmyapigayrimenkul.com)';
const { hesap } = ortam();

async function sorgu(sql, params = []) {
  const r = await cf(`/accounts/${hesap}/d1/database/${VT_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({ sql, params }),
  });
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.result?.[0];
}

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

async function coz(mahalle, ilce, il) {
  const adres = [mahalle, ilce, il, 'Türkiye'].filter(Boolean).join(', ');
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', adres);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'tr');

  const yanit = await fetch(url, {
    headers: { 'User-Agent': AJAN, 'Accept-Language': 'tr' },
  });
  if (!yanit.ok) return null;

  const sonuc = await yanit.json();
  if (!sonuc.length) return null;

  const enlem = Number.parseFloat(sonuc[0].lat);
  const boylam = Number.parseFloat(sonuc[0].lon);
  // Türkiye dışına düşen sonuç yanlış eşleşmedir.
  if (enlem < 35.5 || enlem > 42.5 || boylam < 25.5 || boylam > 45) return null;
  return { enlem, boylam };
}

await sorgu(`CREATE TABLE IF NOT EXISTS konum_koordinat (
  anahtar TEXT PRIMARY KEY, mahalle TEXT, ilce TEXT, il TEXT,
  enlem REAL, boylam REAL, bulundu INTEGER NOT NULL DEFAULT 0, sorgulama TEXT NOT NULL)`);

const eksikler = await sorgu(
  `SELECT DISTINCT i.mahalle, i.ilce, i.il
   FROM ilanlar i
   LEFT JOIN konum_koordinat k
     ON k.anahtar = LOWER(TRIM(COALESCE(i.mahalle,'') || '|' || COALESCE(i.ilce,'') || '|' || COALESCE(i.il,'')))
   WHERE i.durum = 'aktif' AND i.ilce IS NOT NULL AND (k.anahtar IS NULL OR k.bulundu = 0)`
);

const liste = eksikler.results ?? [];
console.log(`› ${liste.length} konum çözülecek\n`);

let bulunan = 0;
const suAn = new Date().toISOString();

for (const [i, yer] of liste.entries()) {
  const ad = [yer.mahalle, yer.ilce].filter(Boolean).join(', ');
  process.stdout.write(`  [${i + 1}/${liste.length}] ${ad.padEnd(42)} `);

  let koordinat = await coz(yer.mahalle, yer.ilce, yer.il);
  await bekle(1100);

  // Mahalle bulunamazsa ilçe merkezine düş — harita yine anlamlı kalır.
  if (!koordinat && yer.mahalle) {
    koordinat = await coz(null, yer.ilce, yer.il);
    await bekle(1100);
  }

  const anahtar = [yer.mahalle, yer.ilce, yer.il]
    .filter(Boolean)
    .join('|')
    .toLocaleLowerCase('tr');

  await sorgu(
    `INSERT OR REPLACE INTO konum_koordinat
       (anahtar, mahalle, ilce, il, enlem, boylam, bulundu, sorgulama)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      anahtar,
      yer.mahalle,
      yer.ilce,
      yer.il,
      koordinat?.enlem ?? null,
      koordinat?.boylam ?? null,
      koordinat ? 1 : 0,
      suAn,
    ]
  );

  if (koordinat) {
    bulunan++;
    console.log(`✓ ${koordinat.enlem.toFixed(4)}, ${koordinat.boylam.toFixed(4)}`);
  } else {
    console.log('✗ bulunamadı');
  }
}

const ozet = await sorgu(`SELECT COUNT(*) AS n, SUM(bulundu) AS b FROM konum_koordinat`);
const s = ozet.results?.[0];
console.log(`\n✓ ${bulunan} yeni konum çözüldü. Toplam: ${s.b}/${s.n}`);
