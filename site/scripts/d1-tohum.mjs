#!/usr/bin/env node
// data/listings.json içeriğini D1'e aktarır ve şemayı kurar.
// Worker'ın zamanlanmış görevi devraldıktan sonra bir daha gerekmez;
// ilk doldurma ve olası kurtarma için duruyor.

import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cf, ortam } from './lib/cf.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VT_ID = '30d4df58-b49f-43c8-95c5-5a538ce44f68';
const { hesap } = ortam();

async function sorgu(sql, params = []) {
  const r = await cf(`/accounts/${hesap}/d1/database/${VT_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({ sql, params }),
  });
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.result?.[0];
}

const SEMA = [
  `CREATE TABLE IF NOT EXISTS ilanlar (
     id TEXT PRIMARY KEY, kaynak TEXT NOT NULL, kaynak_url TEXT NOT NULL,
     baslik TEXT NOT NULL, aciklama TEXT NOT NULL DEFAULT '',
     fiyat INTEGER, para_birimi TEXT NOT NULL DEFAULT 'TRY',
     islem TEXT NOT NULL, kategori TEXT NOT NULL DEFAULT '',
     tip TEXT NOT NULL DEFAULT '', tip_grup TEXT NOT NULL DEFAULT 'diger',
     oda TEXT, m2 INTEGER, il TEXT, ilce TEXT, mahalle TEXT,
     ozellikler TEXT NOT NULL DEFAULT '{}', gorseller TEXT NOT NULL DEFAULT '[]',
     danisman_slug TEXT, guncellenme TEXT,
     ilk_gorulme TEXT NOT NULL, son_gorulme TEXT NOT NULL,
     durum TEXT NOT NULL DEFAULT 'aktif', pasif_tarihi TEXT
   )`,
  `CREATE INDEX IF NOT EXISTS ilan_durum ON ilanlar (durum)`,
  `CREATE INDEX IF NOT EXISTS ilan_islem ON ilanlar (islem)`,
  `CREATE INDEX IF NOT EXISTS ilan_ilce ON ilanlar (ilce)`,
  `CREATE INDEX IF NOT EXISTS ilan_tarih ON ilanlar (guncellenme DESC)`,
  `CREATE TABLE IF NOT EXISTS senkron_gunlugu (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     baslangic TEXT NOT NULL, bitis TEXT,
     bulunan INTEGER, eklenen INTEGER, guncellenen INTEGER,
     pasiflenen INTEGER, basarisiz INTEGER, hata TEXT
   )`,
];

console.log('› Şema kuruluyor…');
for (const ifade of SEMA) await sorgu(ifade);
console.log('  ✓ tablolar hazır');

const veri = JSON.parse(await readFile(resolve(KOK, 'data/listings.json'), 'utf8'));
const ilanlar = veri.ilanlar.filter((i) => i.durum === 'aktif');
console.log(`› ${ilanlar.length} ilan aktarılıyor…`);

const ALANLAR = [
  'id', 'kaynak', 'kaynak_url', 'baslik', 'aciklama', 'fiyat', 'para_birimi',
  'islem', 'kategori', 'tip', 'tip_grup', 'oda', 'm2', 'il', 'ilce', 'mahalle',
  'ozellikler', 'gorseller', 'danisman_slug', 'guncellenme', 'ilk_gorulme',
  'son_gorulme', 'durum', 'pasif_tarihi',
];

const suAn = new Date().toISOString();
const satir = (i) => [
  i.id, i.kaynak, i.kaynakUrl, i.baslik, i.aciklama, i.fiyat, i.paraBirimi,
  i.islem, i.kategori, i.tip, i.tipGrup, i.oda, i.m2, i.il, i.ilce, i.mahalle,
  JSON.stringify(i.ozellikler ?? {}), JSON.stringify(i.gorseller ?? []),
  i.danismanSlug ?? null, i.guncellenme, i.ilkGorulme ?? suAn, suAn, 'aktif', null,
];

// D1 HTTP API'sinde tek sorguda bağlanabilecek değişken sayısı sınırlı;
// 4'erli gruplar hem güvenli hem yeterince hızlı.
const GRUP = 4;
let yazilan = 0;

for (let i = 0; i < ilanlar.length; i += GRUP) {
  const grup = ilanlar.slice(i, i + GRUP);
  const yerTutucu = grup.map(() => `(${ALANLAR.map(() => '?').join(',')})`).join(',');
  const sql =
    `INSERT INTO ilanlar (${ALANLAR.join(',')}) VALUES ${yerTutucu}` +
    ` ON CONFLICT(id) DO UPDATE SET
        baslik=excluded.baslik, aciklama=excluded.aciklama, fiyat=excluded.fiyat,
        gorseller=excluded.gorseller, ozellikler=excluded.ozellikler,
        guncellenme=excluded.guncellenme, son_gorulme=excluded.son_gorulme,
        durum='aktif', pasif_tarihi=NULL`;

  await sorgu(sql, grup.flatMap(satir));
  yazilan += grup.length;
  process.stdout.write(`\r  ${yazilan}/${ilanlar.length}`);
}

console.log('\n› Doğrulanıyor…');
const sayim = await sorgu(
  `SELECT durum, COUNT(*) AS adet FROM ilanlar GROUP BY durum`
);
for (const s of sayim.results ?? []) console.log(`  ${s.durum}: ${s.adet}`);

await sorgu(
  `INSERT INTO senkron_gunlugu (baslangic, bitis, bulunan, eklenen, guncellenen, pasiflenen, basarisiz)
   VALUES (?,?,?,?,0,0,0)`,
  [suAn, new Date().toISOString(), ilanlar.length, ilanlar.length]
);
console.log('✓ Tohumlama tamam.');
