CREATE TABLE IF NOT EXISTS ilan_video (
  ilan_id        TEXT PRIMARY KEY,
  video_anahtar  TEXT NOT NULL,
  poster_anahtar TEXT NOT NULL,
  mime           TEXT NOT NULL,
  sure_saniye    REAL NOT NULL,
  genislik       INTEGER,
  yukseklik      INTEGER,
  boyut          INTEGER NOT NULL,
  yukleyen       TEXT,
  guncelleme     TEXT NOT NULL
);
