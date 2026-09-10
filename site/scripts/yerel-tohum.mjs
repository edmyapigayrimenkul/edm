#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SEMA_SQL = `
CREATE TABLE IF NOT EXISTS ilanlar (
  id             TEXT PRIMARY KEY,
  kaynak         TEXT NOT NULL,
  kaynak_url     TEXT NOT NULL,
  baslik         TEXT NOT NULL,
  aciklama       TEXT NOT NULL DEFAULT '',
  fiyat          INTEGER,
  para_birimi    TEXT NOT NULL DEFAULT 'TRY',
  islem          TEXT NOT NULL,
  kategori       TEXT NOT NULL DEFAULT '',
  tip            TEXT NOT NULL DEFAULT '',
  tip_grup       TEXT NOT NULL DEFAULT 'diger',
  oda            TEXT,
  m2             INTEGER,
  il             TEXT,
  ilce           TEXT,
  mahalle        TEXT,
  ozellikler     TEXT NOT NULL DEFAULT '{}',
  donanim        TEXT NOT NULL DEFAULT '[]',
  gorseller      TEXT NOT NULL DEFAULT '[]',
  danisman_slug  TEXT,
  guncellenme    TEXT,
  ilk_gorulme    TEXT NOT NULL,
  son_gorulme    TEXT NOT NULL,
  durum          TEXT NOT NULL DEFAULT 'aktif',
  pasif_tarihi   TEXT
);
CREATE INDEX IF NOT EXISTS ilan_durum   ON ilanlar (durum);
CREATE INDEX IF NOT EXISTS ilan_islem   ON ilanlar (islem);
CREATE INDEX IF NOT EXISTS ilan_ilce    ON ilanlar (ilce);
CREATE INDEX IF NOT EXISTS ilan_tarih   ON ilanlar (guncellenme DESC);

CREATE TABLE IF NOT EXISTS senkron_gunlugu (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  baslangic   TEXT NOT NULL,
  bitis       TEXT,
  bulunan     INTEGER,
  eklenen     INTEGER,
  guncellenen INTEGER,
  pasiflenen  INTEGER,
  basarisiz   INTEGER,
  hata        TEXT
);

CREATE TABLE IF NOT EXISTS ilan_duzenleme (
  ilan_id     TEXT PRIMARY KEY,
  baslik      TEXT,
  aciklama    TEXT,
  ozellikler  TEXT,
  donanim     TEXT,
  one_cikan   INTEGER NOT NULL DEFAULT 0,
  gizli       INTEGER NOT NULL DEFAULT 0,
  guncelleme  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS yorumlar (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  dis_kimlik TEXT,
  ad         TEXT NOT NULL,
  metin      TEXT NOT NULL,
  kaynak     TEXT NOT NULL DEFAULT 'Google',
  tarih      TEXT,
  puan       INTEGER,
  foto       TEXT,
  profil_url TEXT,
  google_url TEXT,
  konu       TEXT,
  yayinda    INTEGER NOT NULL DEFAULT 1,
  sira       INTEGER NOT NULL DEFAULT 0,
  olusturma  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS talepler (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tur         TEXT NOT NULL,
  ad          TEXT NOT NULL,
  telefon     TEXT NOT NULL,
  eposta      TEXT,
  konu        TEXT,
  mulk_tipi   TEXT,
  ilce        TEXT,
  mahalle     TEXT,
  m2          INTEGER,
  mesaj       TEXT,
  kaynak      TEXT,
  ip_ulke     TEXT,
  olusturma   TEXT NOT NULL DEFAULT (datetime('now')),
  durum       TEXT NOT NULL DEFAULT 'yeni',
  ic_not      TEXT,
  ilgilenen   TEXT,
  kapanma     TEXT
);

CREATE TABLE IF NOT EXISTS ekip (
  slug           TEXT PRIMARY KEY,
  emlakjet_slug  TEXT,
  ad             TEXT NOT NULL,
  unvan          TEXT NOT NULL,
  telefon        TEXT,
  eposta         TEXT,
  foto           TEXT,
  uzmanlik       TEXT NOT NULL DEFAULT '[]',
  hakkinda       TEXT NOT NULL DEFAULT '',
  sira           INTEGER NOT NULL DEFAULT 0,
  yayinda        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ayarlar (
  anahtar     TEXT PRIMARY KEY,
  deger       TEXT NOT NULL,
  guncelleme  TEXT
);

CREATE TABLE IF NOT EXISTS ilan_gorsel_duzen (
  ilan_id     TEXT PRIMARY KEY,
  sira        TEXT NOT NULL DEFAULT '[]',
  gizli       TEXT NOT NULL DEFAULT '[]',
  guncelleme  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS goruntulenme (
  ilan_id  TEXT NOT NULL,
  gun      TEXT NOT NULL,
  adet     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ilan_id, gun)
);

CREATE TABLE IF NOT EXISTS metinler (
  tur         TEXT NOT NULL,
  anahtar     TEXT NOT NULL,
  baslik      TEXT,
  govde       TEXT,
  ek          TEXT,
  sira        INTEGER NOT NULL DEFAULT 0,
  yayinda     INTEGER NOT NULL DEFAULT 1,
  guncelleme  TEXT,
  PRIMARY KEY (tur, anahtar)
);

CREATE TABLE IF NOT EXISTS ilan_foto (
  anahtar    TEXT PRIMARY KEY,
  ilan_id    TEXT NOT NULL,
  sira       INTEGER NOT NULL DEFAULT 0,
  genislik   INTEGER,
  yukseklik  INTEGER,
  boyut      INTEGER,
  yukleyen   TEXT,
  yuklenme   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS konum_koordinat (
  anahtar   TEXT PRIMARY KEY,
  enlem     REAL NOT NULL,
  boylam    REAL NOT NULL
);
`;

async function main() {
  const listingsPath = resolve(KOK, 'data/listings.json');
  const listingsRaw = await readFile(listingsPath, 'utf8');
  const { ilanlar } = JSON.parse(listingsRaw);

  const suAn = new Date().toISOString();
  const insertStatements = [];

  for (const i of ilanlar) {
    const esc = (s) => (s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
    const num = (n) => (n == null || isNaN(n) ? 'NULL' : Number(n));

    const sql = `INSERT OR REPLACE INTO ilanlar (
      id, kaynak, kaynak_url, baslik, aciklama, fiyat, para_birimi,
      islem, kategori, tip, tip_grup, oda, m2, il, ilce, mahalle,
      ozellikler, donanim, gorseller, danisman_slug, guncellenme,
      ilk_gorulme, son_gorulme, durum, pasif_tarihi
    ) VALUES (
      ${esc(i.id)}, ${esc(i.kaynak || 'emlakjet')}, ${esc(i.kaynakUrl || '')},
      ${esc(i.baslik)}, ${esc(i.aciklama || '')}, ${num(i.fiyat)}, ${esc(i.paraBirimi || 'TRY')},
      ${esc(i.islem)}, ${esc(i.kategori || '')}, ${esc(i.tip || '')}, ${esc(i.tipGrup || 'diger')},
      ${esc(i.oda)}, ${num(i.m2)}, ${esc(i.il)}, ${esc(i.ilce)}, ${esc(i.mahalle)},
      ${esc(JSON.stringify(i.ozellikler || {}))}, ${esc(JSON.stringify(i.donanim || []))},
      ${esc(JSON.stringify(i.gorseller || []))}, ${esc(i.danismanSlug)}, ${esc(i.guncellenme || suAn)},
      ${esc(i.ilkGorulme || suAn)}, ${esc(suAn)}, ${esc(i.durum || 'aktif')}, ${esc(i.pasifTarihi)}
    );`;
    insertStatements.push(sql);
  }

  const fullSql = `${SEMA_SQL}\n${insertStatements.join('\n')}`;
  const sqlFile = resolve(KOK, '.wrangler/yerel-tohum.sql');
  await writeFile(sqlFile, fullSql, 'utf8');

  console.log(`› Yerel D1 için SQL dosyası hazırlandı: ${sqlFile}`);
  console.log(`› ${ilanlar.length} adet ilan aktarılıyor…`);

  const surec = spawn('npx', ['wrangler', 'd1', 'execute', 'edm-talepler', '--local', `--file=${sqlFile}`], {
    cwd: KOK,
    stdio: 'inherit',
    env: process.env,
  });

  surec.on('close', (kod) => {
    if (kod === 0) {
      console.log('✓ Yerel veritabanı başarıyla tohumlandı!');
    } else {
      console.error(`✗ Hata kodu: ${kod}`);
    }
  });
}

main().catch(console.error);
