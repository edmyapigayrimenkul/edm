/**
 * Panelden yüklenen fotoğraflar.
 *
 * Dosyaların kendisi R2'de, burada yalnızca hangi ilana ait oldukları ve
 * hangi sırayla gösterilecekleri duruyor.
 *
 * Kural: yüklenen fotoğraflar portaldan gelenlerin **önüne** geçer, onları
 * silmez. Böylece tek bir iyi kapak fotoğrafı yüklemek yeterli oluyor —
 * kalan kareler portaldan gelmeye devam ediyor. Yüklenen silinirse portal
 * fotoğrafları kendiliğinden öne çıkıyor.
 */

export const FOTO_SEMA = `
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
`;

/** Bir ilanın yüklenmiş fotoğraflarının genel adresleri. */
export async function yuklenenFotograflar(vt: D1Database): Promise<Map<string, string[]>> {
  try {
    const sonuc = await vt
      .prepare(`SELECT ilan_id, anahtar FROM ilan_foto ORDER BY ilan_id, sira ASC, anahtar ASC`)
      .all<{ ilan_id: string; anahtar: string }>();

    const harita = new Map<string, string[]>();
    for (const s of sonuc.results ?? []) {
      const liste = harita.get(s.ilan_id) ?? [];
      liste.push(`/g/${s.anahtar}`);
      harita.set(s.ilan_id, liste);
    }
    return harita;
  } catch {
    // Tablo henüz yoksa yüklenmiş fotoğraf da yoktur.
    return new Map();
  }
}
