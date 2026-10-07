-- İlan işletim katmanı: hatırlatma, pasif ilan bildirimi ve sosyal yayın kuyruğu.
-- Tekrar çalıştırılabilir; mevcut kayıtları değiştirmez.

CREATE TABLE IF NOT EXISTS ilan_hatirlatma (
  ilan_id       TEXT PRIMARY KEY,
  planlanan     TEXT NOT NULL,
  notu          TEXT NOT NULL DEFAULT '',
  durum         TEXT NOT NULL DEFAULT 'bekliyor',
  olusturma     TEXT NOT NULL,
  guncelleme    TEXT NOT NULL,
  bildirim      TEXT
);
CREATE INDEX IF NOT EXISTS hatirlatma_durum_tarih ON ilan_hatirlatma (durum, planlanan);

CREATE TABLE IF NOT EXISTS ilan_bildirim (
  kimlik        TEXT PRIMARY KEY,
  ilan_id       TEXT NOT NULL,
  tur           TEXT NOT NULL,
  mesaj         TEXT NOT NULL,
  durum         TEXT NOT NULL DEFAULT 'bekliyor',
  deneme        INTEGER NOT NULL DEFAULT 0,
  olusturma     TEXT NOT NULL,
  gonderilme    TEXT,
  hata          TEXT
);
CREATE INDEX IF NOT EXISTS bildirim_durum ON ilan_bildirim (durum, olusturma);

CREATE TABLE IF NOT EXISTS sosyal_paylasim (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ilan_id       TEXT NOT NULL,
  platformlar   TEXT NOT NULL,
  durum         TEXT NOT NULL DEFAULT 'bekliyor',
  kaynak        TEXT NOT NULL,
  fiyat_anlik   INTEGER,
  kampanya      TEXT,
  deneme        INTEGER NOT NULL DEFAULT 0,
  olusturma     TEXT NOT NULL,
  guncelleme    TEXT NOT NULL,
  baslatma      TEXT,
  bitis         TEXT,
  sonuc         TEXT,
  hata          TEXT
);
CREATE INDEX IF NOT EXISTS sosyal_paylasim_durum ON sosyal_paylasim (durum, olusturma);
CREATE INDEX IF NOT EXISTS sosyal_paylasim_ilan ON sosyal_paylasim (ilan_id, olusturma DESC);
