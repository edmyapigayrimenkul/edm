-- postedm ve yönetim paneli için site içerik taslakları.
-- Dış sistem yalnız taslak oluşturur; yayına alma panel yetkisi gerektirir.

CREATE TABLE IF NOT EXISTS site_icerik (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  dis_kimlik            TEXT NOT NULL UNIQUE,
  tur                   TEXT NOT NULL CHECK (tur IN ('bulten', 'rehber', 'sozluk')),
  slug                  TEXT NOT NULL,
  baslik                TEXT NOT NULL,
  spot                  TEXT NOT NULL DEFAULT '',
  govde                 TEXT NOT NULL,
  kategori              TEXT NOT NULL DEFAULT '',
  kaynak_adlari         TEXT NOT NULL DEFAULT '[]',
  kaynak_url_listesi    TEXT NOT NULL DEFAULT '[]',
  kapak_url             TEXT NOT NULL DEFAULT '',
  sosyal_url_listesi    TEXT NOT NULL DEFAULT '[]',
  orijinal_yayin        TEXT,
  site_yayini           TEXT,
  guncelleme            TEXT NOT NULL,
  durum                 TEXT NOT NULL DEFAULT 'taslak' CHECK (durum IN ('taslak', 'yayinda', 'arsiv')),
  hukuki_inceleme       TEXT NOT NULL DEFAULT 'uygulanmaz' CHECK (hukuki_inceleme IN ('gerekli', 'tamam', 'uygulanmaz')),
  kaynak_sistem         TEXT NOT NULL DEFAULT 'postedm'
);

CREATE UNIQUE INDEX IF NOT EXISTS site_icerik_tur_slug ON site_icerik (tur, slug);
CREATE INDEX IF NOT EXISTS site_icerik_durum_tarih ON site_icerik (durum, site_yayini DESC, guncelleme DESC);

