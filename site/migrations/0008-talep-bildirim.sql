-- Eski talepler geri doldurulmaz: önceki gönderim sonucu bilinmiyor.
CREATE TABLE talep_bildirim (
  talep_id INTEGER PRIMARY KEY REFERENCES talepler(id) ON DELETE CASCADE,
  durum TEXT NOT NULL DEFAULT 'bekliyor'
    CHECK (durum IN ('bekliyor', 'gonderiliyor', 'gonderildi', 'basarisiz', 'belirsiz')),
  deneme INTEGER NOT NULL DEFAULT 0,
  sonraki TEXT NOT NULL DEFAULT (datetime('now')),
  son_deneme TEXT,
  kabul TEXT,
  hata TEXT,
  kilit TEXT,
  kilit_bitis TEXT
);
CREATE INDEX talep_bildirim_sira ON talep_bildirim(durum, sonraki);
