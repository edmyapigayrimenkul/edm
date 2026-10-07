export const VIDEO_SEMA = `
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
`;

export interface IlanVideoKaydi {
  ilan_id: string;
  video_anahtar: string;
  poster_anahtar: string;
  mime: string;
  sure_saniye: number;
  genislik: number | null;
  yukseklik: number | null;
  boyut: number;
  yukleyen: string | null;
  guncelleme: string;
}

export async function videoKayitlari(vt: D1Database): Promise<Map<string, IlanVideoKaydi>> {
  try {
    const sonuc = await vt.prepare(`SELECT * FROM ilan_video`).all<IlanVideoKaydi>();
    return new Map((sonuc.results ?? []).map((kayit) => [kayit.ilan_id, kayit]));
  } catch {
    return new Map();
  }
}
