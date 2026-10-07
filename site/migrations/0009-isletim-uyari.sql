CREATE TABLE isletim_uyari (
  anahtar TEXT PRIMARY KEY CHECK (anahtar IN ('senkron-hata','senkron-dusus','senkron-eksik','talep-gecikti','talep-bildirim')),
  aktif INTEGER NOT NULL CHECK (aktif IN (0,1)),
  olay TEXT NOT NULL,
  metin TEXT NOT NULL,
  acilis TEXT,
  kapanis TEXT,
  son_kontrol TEXT NOT NULL,
  durum TEXT NOT NULL DEFAULT 'bekliyor' CHECK (durum IN ('bekliyor','gonderiliyor','gonderildi','basarisiz','belirsiz')),
  deneme INTEGER NOT NULL DEFAULT 0,
  sonraki TEXT NOT NULL DEFAULT (datetime('now')),
  kabul TEXT,
  hata TEXT,
  kilit TEXT,
  kilit_bitis TEXT
);
CREATE INDEX isletim_uyari_sira ON isletim_uyari (aktif, durum, sonraki);
