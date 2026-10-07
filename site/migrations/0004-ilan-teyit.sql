-- İşletme teyitleri: danışman/belge yanıtı ve panel düzeltme izi.
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
