-- EDM base şeması. Idempotent olması, var olan veritabanına güvenle uygulanmasını sağlar.
CREATE TABLE IF NOT EXISTS ilanlar (
  id TEXT PRIMARY KEY, kaynak TEXT NOT NULL, kaynak_url TEXT NOT NULL,
  baslik TEXT NOT NULL, aciklama TEXT NOT NULL DEFAULT '', fiyat INTEGER,
  para_birimi TEXT NOT NULL DEFAULT 'TRY', islem TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT '', tip TEXT NOT NULL DEFAULT '',
  tip_grup TEXT NOT NULL DEFAULT 'diger', oda TEXT, m2 INTEGER,
  il TEXT, ilce TEXT, mahalle TEXT,
  ozellikler TEXT NOT NULL DEFAULT '{}', donanim TEXT NOT NULL DEFAULT '[]',
  gorseller TEXT NOT NULL DEFAULT '[]', hepsiemlak_ref TEXT,
  hepsiemlak_gorseller TEXT, danisman_slug TEXT, guncellenme TEXT,
  ilk_gorulme TEXT NOT NULL, son_gorulme TEXT NOT NULL,
  durum TEXT NOT NULL DEFAULT 'aktif', pasif_tarihi TEXT
);
CREATE INDEX IF NOT EXISTS ilan_durum ON ilanlar (durum);
CREATE INDEX IF NOT EXISTS ilan_islem ON ilanlar (islem);
CREATE INDEX IF NOT EXISTS ilan_ilce ON ilanlar (ilce);
CREATE INDEX IF NOT EXISTS ilan_tarih ON ilanlar (guncellenme DESC);
CREATE TABLE IF NOT EXISTS senkron_gunlugu (
  id INTEGER PRIMARY KEY AUTOINCREMENT, baslangic TEXT NOT NULL, bitis TEXT,
  bulunan INTEGER, eklenen INTEGER, guncellenen INTEGER, pasiflenen INTEGER,
  basarisiz INTEGER, hata TEXT
);
CREATE TABLE IF NOT EXISTS senkron_pasifleme_teyidi (
  id INTEGER PRIMARY KEY CHECK (id = 1), eksik_imzasi TEXT NOT NULL,
  teyit_sayisi INTEGER NOT NULL, son_gorulme TEXT NOT NULL
);

-- Schema copied from src/lib/senkron/panel-sema.ts

CREATE TABLE IF NOT EXISTS ilan_duzenleme (
  ilan_id     TEXT PRIMARY KEY,
  baslik      TEXT,
  aciklama    TEXT,
  temel       TEXT,
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
  ilan_id     TEXT,
  ilan_baslik TEXT,
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

CREATE INDEX IF NOT EXISTS yorum_yayin ON yorumlar (yayinda, sira);
CREATE UNIQUE INDEX IF NOT EXISTS yorum_dis_kimlik ON yorumlar (dis_kimlik);
CREATE INDEX IF NOT EXISTS talep_tarih ON talepler (olusturma DESC);
CREATE INDEX IF NOT EXISTS talep_durum ON talepler (durum);
CREATE INDEX IF NOT EXISTS ekip_sira   ON ekip (yayinda, sira);

-- Schema copied from src/lib/senkron/panel-sema2.ts

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
CREATE INDEX IF NOT EXISTS goruntulenme_gun ON goruntulenme (gun DESC);

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

-- Schema copied from src/lib/senkron/foto-sema.ts

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
CREATE INDEX IF NOT EXISTS foto_ilan ON ilan_foto (ilan_id, sira);

-- Schema copied from src/lib/senkron/video-sema.ts

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

-- Schema copied from src/lib/ilan-isletim.ts

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

-- Schema copied from src/lib/ilan-teyit.ts

CREATE TABLE IF NOT EXISTS ilan_teyit (
  ilan_id       TEXT NOT NULL,
  sorun_kodu    TEXT NOT NULL,
  durum         TEXT NOT NULL DEFAULT 'bekliyor'
                CHECK (durum IN ('bekliyor', 'yanitlandi', 'tamamlandi')),
  yanit         TEXT NOT NULL DEFAULT '',
  kaynak        TEXT NOT NULL DEFAULT '',
  notu          TEXT NOT NULL DEFAULT '',
  teyit_eden    TEXT NOT NULL DEFAULT '',
  olusturma     TEXT NOT NULL,
  guncelleme    TEXT NOT NULL,
  PRIMARY KEY (ilan_id, sorun_kodu)
);
CREATE INDEX IF NOT EXISTS ilan_teyit_durum ON ilan_teyit (durum, guncelleme DESC);

-- Schema copied from src/lib/panel/islem-gecmisi.ts

CREATE TABLE IF NOT EXISTS panel_islem_gecmisi (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  zaman        TEXT NOT NULL,
  eposta       TEXT NOT NULL,
  ad           TEXT NOT NULL DEFAULT '',
  rol          TEXT NOT NULL,
  eylem        TEXT NOT NULL,
  varlik_turu  TEXT NOT NULL,
  varlik_id    TEXT NOT NULL DEFAULT '',
  ozet         TEXT NOT NULL DEFAULT '',
  onceki       TEXT,
  sonraki      TEXT
);
CREATE INDEX IF NOT EXISTS panel_islem_zaman ON panel_islem_gecmisi (zaman DESC);
CREATE INDEX IF NOT EXISTS panel_islem_varlik ON panel_islem_gecmisi (varlik_turu, varlik_id, zaman DESC);
