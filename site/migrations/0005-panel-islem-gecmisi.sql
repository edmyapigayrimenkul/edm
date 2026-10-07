-- Yönetim paneli değişiklik geçmişi. Parola, jeton ve gizli anahtar saklanmaz.
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
