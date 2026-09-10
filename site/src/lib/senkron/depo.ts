/**
 * İlan deposu — D1 okuma/yazma.
 *
 * Kazıyıcıdan gelen ham ilanları veritabanına yazar, portalda görünmeyenleri
 * pasife çeker (silmez). Sayfalar da okumayı buradan yapar.
 */

import type { HamIlan } from './emlakjet';

export const SEMA = `
CREATE TABLE IF NOT EXISTS ilanlar (
  id             TEXT PRIMARY KEY,
  kaynak         TEXT NOT NULL,
  kaynak_url     TEXT NOT NULL,
  baslik         TEXT NOT NULL,
  aciklama       TEXT NOT NULL DEFAULT '',
  fiyat          INTEGER,
  para_birimi    TEXT NOT NULL DEFAULT 'TRY',
  islem          TEXT NOT NULL,
  kategori       TEXT NOT NULL DEFAULT '',
  tip            TEXT NOT NULL DEFAULT '',
  tip_grup       TEXT NOT NULL DEFAULT 'diger',
  oda            TEXT,
  m2             INTEGER,
  il             TEXT,
  ilce           TEXT,
  mahalle        TEXT,
  ozellikler     TEXT NOT NULL DEFAULT '{}',
  donanim        TEXT NOT NULL DEFAULT '[]',
  gorseller      TEXT NOT NULL DEFAULT '[]',
  danisman_slug  TEXT,
  guncellenme    TEXT,
  ilk_gorulme    TEXT NOT NULL,
  son_gorulme    TEXT NOT NULL,
  durum          TEXT NOT NULL DEFAULT 'aktif',
  pasif_tarihi   TEXT
);
CREATE INDEX IF NOT EXISTS ilan_durum   ON ilanlar (durum);
CREATE INDEX IF NOT EXISTS ilan_islem   ON ilanlar (islem);
CREATE INDEX IF NOT EXISTS ilan_ilce    ON ilanlar (ilce);
CREATE INDEX IF NOT EXISTS ilan_tarih   ON ilanlar (guncellenme DESC);

CREATE TABLE IF NOT EXISTS senkron_gunlugu (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  baslangic   TEXT NOT NULL,
  bitis       TEXT,
  bulunan     INTEGER,
  eklenen     INTEGER,
  guncellenen INTEGER,
  pasiflenen  INTEGER,
  basarisiz   INTEGER,
  hata        TEXT
);
`;

export interface SatirIlan {
  id: string;
  kaynak: string;
  kaynak_url: string;
  baslik: string;
  aciklama: string;
  fiyat: number | null;
  para_birimi: string;
  islem: string;
  kategori: string;
  tip: string;
  tip_grup: string;
  oda: string | null;
  m2: number | null;
  il: string | null;
  ilce: string | null;
  mahalle: string | null;
  ozellikler: string;
  gorseller: string;
  danisman_slug: string | null;
  guncellenme: string | null;
  ilk_gorulme: string;
  son_gorulme: string;
  durum: string;
  pasif_tarihi: string | null;
  /** ilan_duzenleme tablosundan bindirilir; ham tabloda yok. */
  one_cikan?: number;
  /** Hepsiemlak'tan alınan görseller — varsa bunlar tercih edilir. */
  hepsiemlak_gorseller?: string | null;
  hepsiemlak_ref?: string | null;
  /** Sayfa gövdesinden çıkarılan özellik çipleri (JSON dizi). */
  donanim?: string | null;
}

export interface SenkronSonuc {
  bulunan: number;
  eklenen: number;
  guncellenen: number;
  pasiflenen: number;
  yenidenAktif: number;
  basarisiz: number;
  pasifIdler: string[];
  yeniIdler: string[];
  sureMs: number;
}

/**
 * Şemayı kurar — her senkron öncesi güvenle çağrılabilir.
 *
 * İfadeleri ';' ile ayırmadan önce açıklama satırlarını siliyoruz: bir
 * açıklamanın içinde geçen noktalı virgül aksi halde ifadeyi ikiye bölüp
 * D1'e anlamsız bir parça gönderiyor.
 */
export async function semayiKur(vt: D1Database): Promise<void> {
  const { PANEL_SEMA } = await import('./panel-sema');
  const { PANEL_SEMA2 } = await import('./panel-sema2');
  const { FOTO_SEMA } = await import('./foto-sema');

  const tumu = `${SEMA}\n${PANEL_SEMA}\n${PANEL_SEMA2}\n${FOTO_SEMA}`
    .split('\n')
    .filter((satir) => !satir.trim().startsWith('--'))
    .join('\n');

  for (const ifade of tumu.split(';')) {
    const kirpik = ifade.trim();
    if (kirpik) await vt.prepare(kirpik).run();
  }

  // Var olan tablolara sonradan eklenen sütunlar ve indeksler (zaten varsa SQLite hata verir, yutuyoruz)
  const ekSorgular = [
    `ALTER TABLE yorumlar ADD COLUMN dis_kimlik TEXT`,
    `ALTER TABLE yorumlar ADD COLUMN foto TEXT`,
    `ALTER TABLE yorumlar ADD COLUMN profil_url TEXT`,
    `ALTER TABLE yorumlar ADD COLUMN google_url TEXT`,
    `ALTER TABLE talepler ADD COLUMN ic_not TEXT`,
    `ALTER TABLE talepler ADD COLUMN ilgilenen TEXT`,
    `ALTER TABLE talepler ADD COLUMN kapanma TEXT`,
    `CREATE UNIQUE INDEX IF NOT EXISTS yorum_dis_kimlik ON yorumlar (dis_kimlik)`,
  ];
  for (const sql of ekSorgular) {
    await vt.prepare(sql).run().catch(() => {});
  }
}

/**
 * Çekilen portföyü veritabanına yazar.
 *
 * Kural: portalda görünmeyen ilan silinmez, `durum = 'pasif'` olur. Böylece
 * eski adresler 410 yerine anlamlı bir sayfa verebilir ve geçmiş kaybolmaz.
 * Yeniden yayına alınan bir ilan otomatik olarak tekrar aktifleşir.
 */
export async function portfoyuYaz(
  vt: D1Database,
  ilanlar: HamIlan[],
  basarisizIdler: string[]
): Promise<SenkronSonuc> {
  const baslangic = Date.now();
  const suAn = new Date().toISOString();

  // Elle eklenen ilanlar portalda görünmez; senkronun onlara dokunmaması için
  // karşılaştırmaya hiç alınmıyorlar.
  const oncekiSatirlar = await vt
    .prepare(`SELECT id, durum, fiyat, guncellenme FROM ilanlar WHERE kaynak <> 'elle'`)
    .all<{ id: string; durum: string; fiyat: number | null; guncellenme: string | null }>();
  const onceki = new Map((oncekiSatirlar.results ?? []).map((s) => [s.id, s]));

  let eklenen = 0;
  let guncellenen = 0;
  let yenidenAktif = 0;
  const yeniIdler: string[] = [];

  const yazmalar: D1PreparedStatement[] = [];

  for (const ilan of ilanlar) {
    const eski = onceki.get(ilan.id);
    if (!eski) {
      eklenen++;
      yeniIdler.push(ilan.id);
    } else {
      if (eski.durum === 'pasif') yenidenAktif++;
      if (eski.fiyat !== ilan.fiyat || eski.guncellenme !== ilan.guncellenme) guncellenen++;
    }

    yazmalar.push(
      vt
        .prepare(
          `INSERT INTO ilanlar (
             id, kaynak, kaynak_url, baslik, aciklama, fiyat, para_birimi, islem,
             kategori, tip, tip_grup, oda, m2, il, ilce, mahalle, ozellikler,
             donanim, gorseller, danisman_slug, guncellenme, ilk_gorulme, son_gorulme,
             durum, pasif_tarihi
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'aktif', NULL)
           ON CONFLICT(id) DO UPDATE SET
             kaynak_url    = excluded.kaynak_url,
             baslik        = excluded.baslik,
             aciklama      = excluded.aciklama,
             fiyat         = excluded.fiyat,
             para_birimi   = excluded.para_birimi,
             islem         = excluded.islem,
             kategori      = excluded.kategori,
             tip           = excluded.tip,
             tip_grup      = excluded.tip_grup,
             oda           = excluded.oda,
             m2            = excluded.m2,
             il            = excluded.il,
             ilce          = excluded.ilce,
             mahalle       = excluded.mahalle,
             ozellikler    = excluded.ozellikler,
             donanim       = excluded.donanim,
             gorseller     = excluded.gorseller,
             danisman_slug = excluded.danisman_slug,
             guncellenme   = excluded.guncellenme,
             son_gorulme   = excluded.son_gorulme,
             durum         = 'aktif',
             pasif_tarihi  = NULL`
        )
        .bind(
          ilan.id,
          ilan.kaynak,
          ilan.kaynakUrl,
          ilan.baslik,
          ilan.aciklama,
          ilan.fiyat,
          ilan.paraBirimi,
          ilan.islem,
          ilan.kategori,
          ilan.tip,
          ilan.tipGrup,
          ilan.oda,
          ilan.m2,
          ilan.il,
          ilan.ilce,
          ilan.mahalle,
          JSON.stringify(ilan.ozellikler),
          JSON.stringify(ilan.donanim ?? []),
          JSON.stringify(ilan.gorseller),
          ilan.danismanSlug,
          ilan.guncellenme,
          suAn,
          suAn
        )
    );
  }

  if (yazmalar.length) await vt.batch(yazmalar);

  // Bu turda görülmeyen ve okunamamış olmayanlar pasife düşer.
  const gorulen = new Set(ilanlar.map((i) => i.id));
  const dokunulmaz = new Set(basarisizIdler);
  const pasifIdler = [...onceki.keys()].filter(
    (id) => !gorulen.has(id) && !dokunulmaz.has(id) && onceki.get(id)!.durum === 'aktif'
  );

  if (pasifIdler.length) {
    const yerTutucu = pasifIdler.map(() => '?').join(',');
    await vt
      .prepare(
        `UPDATE ilanlar SET durum = 'pasif', pasif_tarihi = ?
         WHERE id IN (${yerTutucu})`
      )
      .bind(suAn, ...pasifIdler)
      .run();
  }

  return {
    bulunan: ilanlar.length,
    eklenen,
    guncellenen,
    pasiflenen: pasifIdler.length,
    yenidenAktif,
    basarisiz: basarisizIdler.length,
    pasifIdler,
    yeniIdler,
    sureMs: Date.now() - baslangic,
  };
}

export async function gunlugeYaz(
  vt: D1Database,
  baslangic: string,
  sonuc: SenkronSonuc | null,
  hata?: string
): Promise<void> {
  await vt
    .prepare(
      `INSERT INTO senkron_gunlugu
         (baslangic, bitis, bulunan, eklenen, guncellenen, pasiflenen, basarisiz, hata)
       VALUES (?,?,?,?,?,?,?,?)`
    )
    .bind(
      baslangic,
      new Date().toISOString(),
      sonuc?.bulunan ?? null,
      sonuc?.eklenen ?? null,
      sonuc?.guncellenen ?? null,
      sonuc?.pasiflenen ?? null,
      sonuc?.basarisiz ?? null,
      hata ?? null
    )
    .run();
}

/**
 * Aktif ilanlar — panelden yapılan düzeltmeler bindirilmiş halde.
 * `gizli` işaretli ilanlar hiç dönmez; öne çıkanlar başa alınır.
 */
export async function aktifIlanSatirlari(vt: D1Database): Promise<SatirIlan[]> {
  const sonuc = await vt
    .prepare(
      `SELECT
         i.*,
         COALESCE(d.baslik,   i.baslik)   AS baslik,
         COALESCE(d.aciklama, i.aciklama) AS aciklama,
         COALESCE(d.one_cikan, 0)         AS one_cikan
       FROM ilanlar i
       LEFT JOIN ilan_duzenleme d ON d.ilan_id = i.id
       WHERE i.durum = 'aktif' AND COALESCE(d.gizli, 0) = 0
       ORDER BY COALESCE(d.one_cikan, 0) DESC,
                COALESCE(i.guncellenme, i.ilk_gorulme) DESC`
    )
    .all<SatirIlan>();
  return sonuc.results ?? [];
}

/** Panel için: gizliler ve pasifler dahil her şey. */
export async function tumIlanSatirlari(vt: D1Database): Promise<
  Array<SatirIlan & { one_cikan: number; gizli: number; duzenlendi: number }>
> {
  const sonuc = await vt
    .prepare(
      `SELECT
         i.*,
         COALESCE(d.one_cikan, 0) AS one_cikan,
         COALESCE(d.gizli, 0)     AS gizli,
         CASE WHEN d.baslik IS NOT NULL OR d.aciklama IS NOT NULL THEN 1 ELSE 0 END AS duzenlendi
       FROM ilanlar i
       LEFT JOIN ilan_duzenleme d ON d.ilan_id = i.id
       ORDER BY i.durum ASC, COALESCE(i.guncellenme, i.ilk_gorulme) DESC`
    )
    .all<SatirIlan & { one_cikan: number; gizli: number; duzenlendi: number }>();
  return sonuc.results ?? [];
}

export async function ilanSatiri(vt: D1Database, id: string): Promise<SatirIlan | null> {
  return await vt.prepare('SELECT * FROM ilanlar WHERE id = ?').bind(id).first<SatirIlan>();
}

export async function sonSenkron(
  vt: D1Database
): Promise<{ bitis: string | null; bulunan: number | null } | null> {
  return await vt
    .prepare('SELECT bitis, bulunan FROM senkron_gunlugu WHERE hata IS NULL ORDER BY id DESC LIMIT 1')
    .first<{ bitis: string | null; bulunan: number | null }>();
}
