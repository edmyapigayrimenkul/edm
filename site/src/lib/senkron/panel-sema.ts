/**
 * Yönetim panelinin kullandığı tablolar.
 *
 * Tasarım kuralı: senkron ile panel birbirine karışmaz.
 * Emlakjet'ten gelen veri `ilanlar` tablosuna yazılır ve her senkronda üzerine
 * yazılır. Panelden yapılan müdahaleler ayrı bir `ilan_duzenleme` tablosunda
 * durur, okuma anında üstüne bindirilir. Böylece bir başlığı elle düzeltmek
 * senkronu bozmaz, senkron da düzeltmeyi silmez.
 */

export const PANEL_SEMA = `
-- Portaldan gelen ilana yapılan elle müdahaleler
CREATE TABLE IF NOT EXISTS ilan_duzenleme (
  ilan_id     TEXT PRIMARY KEY,
  baslik      TEXT,
  aciklama    TEXT,
  one_cikan   INTEGER NOT NULL DEFAULT 0,
  gizli       INTEGER NOT NULL DEFAULT 0,
  guncelleme  TEXT NOT NULL
);

-- Müşteri yorumları — elle girilenler veya Google Places API'den gelenler
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

-- Form talepleri (iletişim ve değerleme)
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

-- Ekip — koddan taşındı, panelden yönetiliyor
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

-- Site metinleri ve iletişim bilgileri
CREATE TABLE IF NOT EXISTS ayarlar (
  anahtar     TEXT PRIMARY KEY,
  deger       TEXT NOT NULL,
  guncelleme  TEXT
);

CREATE INDEX IF NOT EXISTS yorum_yayin ON yorumlar (yayinda, sira);
CREATE UNIQUE INDEX IF NOT EXISTS yorum_dis_kimlik ON yorumlar (dis_kimlik);
CREATE INDEX IF NOT EXISTS talep_tarih ON talepler (olusturma DESC);
CREATE INDEX IF NOT EXISTS talep_durum ON talepler (durum);
CREATE INDEX IF NOT EXISTS ekip_sira   ON ekip (yayinda, sira);
`;

/** Taleplere iç not ve ilgilenen kişi alanları — var olan tabloya ekleniyor. */
export const TALEP_EKLERI = [
  `ALTER TABLE talepler ADD COLUMN ic_not TEXT`,
  `ALTER TABLE talepler ADD COLUMN ilgilenen TEXT`,
  `ALTER TABLE talepler ADD COLUMN kapanma TEXT`,
];

/** Elle eklenen ilanların senkronda pasife düşmemesi için işaret. */
export const ELLE_KAYNAK = 'elle';
