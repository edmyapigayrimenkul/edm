/**
 * Panelin ikinci dalga tabloları.
 *
 * Ayrı dosya olmasının sebebi: bunlar senkronun ihtiyaç duymadığı, yalnızca
 * panelin kullandığı yapılar. Senkron tarafını sade tutuyoruz.
 */

export const PANEL_SEMA2 = `
-- Görsel düzeni: sıralama, kapak seçimi, gizlenenler.
-- Görsellerin kendisi ilanlar tablosunda; burada yalnızca hangi sırayla
-- gösterilecekleri ve hangilerinin saklanacağı tutuluyor.
CREATE TABLE IF NOT EXISTS ilan_gorsel_duzen (
  ilan_id     TEXT PRIMARY KEY,
  sira        TEXT NOT NULL DEFAULT '[]',
  gizli       TEXT NOT NULL DEFAULT '[]',
  guncelleme  TEXT NOT NULL
);

-- Sayfa görüntülenmeleri — günlük kırılımla, tek satırda toplamadan.
-- Böylece "son 7 gün" gibi sorular cevaplanabiliyor.
CREATE TABLE IF NOT EXISTS goruntulenme (
  ilan_id  TEXT NOT NULL,
  gun      TEXT NOT NULL,
  adet     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ilan_id, gun)
);
CREATE INDEX IF NOT EXISTS goruntulenme_gun ON goruntulenme (gun DESC);

-- Serbest metinler: hizmetler ve bölge tanıtımları.
-- 'tur' hangi listeye ait olduğunu söylüyor; 'anahtar' liste içindeki kimlik.
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
`;
