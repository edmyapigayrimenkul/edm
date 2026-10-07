-- Eski taleplere iş olayı eklenmez. Kayıt yoksa sonuç bilinmiyordur.
CREATE TABLE talep_is_sonucu (
  talep_id INTEGER PRIMARY KEY REFERENCES talepler(id) ON DELETE CASCADE,
  yanit_durumu TEXT NOT NULL DEFAULT 'bilinmiyor' CHECK (yanit_durumu IN ('bilinmiyor','yanitlanmadi','yanitlandi')),
  ilk_yanit TEXT,
  nitelik TEXT NOT NULL DEFAULT 'bilinmiyor' CHECK (nitelik IN ('bilinmiyor','nitelikli','uygun_degil')),
  randevu_durumu TEXT NOT NULL DEFAULT 'bilinmiyor' CHECK (randevu_durumu IN ('bilinmiyor','yok','planlandi','gerceklesti','iptal')),
  randevu_tarihi TEXT,
  islem_turu TEXT NOT NULL DEFAULT 'bilinmiyor' CHECK (islem_turu IN ('bilinmiyor','yok','satis','kiralama')),
  islem_tarihi TEXT,
  guncelleme TEXT NOT NULL,
  CHECK ((yanit_durumu='yanitlandi' AND ilk_yanit IS NOT NULL) OR (yanit_durumu<>'yanitlandi' AND ilk_yanit IS NULL)),
  CHECK ((randevu_durumu IN ('planlandi','gerceklesti','iptal') AND randevu_tarihi IS NOT NULL) OR (randevu_durumu IN ('bilinmiyor','yok') AND randevu_tarihi IS NULL)),
  CHECK ((islem_turu IN ('satis','kiralama') AND islem_tarihi IS NOT NULL) OR (islem_turu IN ('bilinmiyor','yok') AND islem_tarihi IS NULL))
);
