-- Eski talep ve notlar korunur. son işlem yapan kişi sorumlu sayılmaz.
ALTER TABLE talepler ADD COLUMN sorumlu_slug TEXT REFERENCES ekip(slug) ON DELETE SET NULL;
ALTER TABLE talepler ADD COLUMN takip_tarihi TEXT;
ALTER TABLE talepler ADD COLUMN sonuc TEXT CHECK (sonuc IS NULL OR sonuc IN ('tamamlandi','uygun_degil','ulasilamadi','vazgecti','mukerrer'));
ALTER TABLE talepler ADD COLUMN takip_surumu INTEGER NOT NULL DEFAULT 0;
CREATE INDEX talep_sorumlu ON talepler (sorumlu_slug, durum);
CREATE INDEX talep_takip ON talepler (durum, takip_tarihi);
