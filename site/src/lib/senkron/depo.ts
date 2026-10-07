/**
 * İlan deposu — D1 okuma/yazma.
 *
 * Kazıyıcıdan gelen ham ilanları veritabanına yazar, portalda görünmeyenleri
 * pasife çeker (silmez). Sayfalar da okumayı buradan yapar.
 */

import type { HamIlan } from './emlakjet';
import type { AyrintiliIlanGirdisi } from '../ilan-bilgileri';
import { aniDususeKarsiKontrol, dususTeyitKarari } from './emniyet.ts';
import { gerekliD1Migrasyonu, d1SurumHatasi } from './surum.ts';

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
  pasiflemeErtelendi: boolean;
  oncekiAktif: number;
  eksikAdet: number;
  supheliDusus: boolean;
}

/** Uygulanmış D1 migration sürümünü doğrular; uygulama sırasında şema değiştirmez. */
const semaHazirligi = new WeakMap<object, Promise<void>>();

async function semayiGercektenDogrula(vt: D1Database): Promise<void> {
  try {
    const kayit = await vt
      .prepare('SELECT name FROM d1_migrations WHERE name = ? LIMIT 1')
      .bind(gerekliD1Migrasyonu)
      .first<{ name: string }>();
    if (!kayit) throw new Error(d1SurumHatasi(gerekliD1Migrasyonu));
  } catch (hata) {
    if (hata instanceof Error && hata.message.includes(gerekliD1Migrasyonu)) throw hata;
    throw new Error(
      `${d1SurumHatasi(gerekliD1Migrasyonu)} Ayrıntı: ${hata instanceof Error ? hata.message : String(hata)}`
    );
  }
}

export async function semayiKur(vt: D1Database): Promise<void> {
  const anahtar = vt as unknown as object;
  const suren = semaHazirligi.get(anahtar);
  if (suren) return await suren;
  const kontrol = semayiGercektenDogrula(vt);
  semaHazirligi.set(anahtar, kontrol);
  try {
    await kontrol;
  } catch (hata) {
    semaHazirligi.delete(anahtar);
    throw hata;
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
  const oncekiAktif = [...onceki.values()].filter((s) => s.durum === 'aktif').length;

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
  const eksikIdler = [...onceki.keys()].filter(
    (id) => !gorulen.has(id) && !dokunulmaz.has(id) && onceki.get(id)!.durum === 'aktif'
  );

  const dusus = aniDususeKarsiKontrol(oncekiAktif, ilanlar.length, eksikIdler);
  let pasiflemeErtelendi = false;
  let oncekiTeyit: { eksik_imzasi: string; teyit_sayisi: number } | null = null;
  if (dusus.supheli && !basarisizIdler.length) {
    oncekiTeyit = await vt
      .prepare('SELECT eksik_imzasi, teyit_sayisi FROM senkron_pasifleme_teyidi WHERE id = 1')
      .first<{ eksik_imzasi: string; teyit_sayisi: number }>();
  }
  const teyitKarari = dususTeyitKarari(
    dusus.imza,
    oncekiTeyit?.eksik_imzasi ?? null,
    oncekiTeyit?.teyit_sayisi ?? 0,
    basarisizIdler.length > 0
  );
  if (teyitKarari === 'eksik-veri') {
    // Detay sayfaları okunamayan bir turda eksikliği portala bağlayamayız.
    await vt.prepare('DELETE FROM senkron_pasifleme_teyidi WHERE id = 1').run();
    pasiflemeErtelendi = true;
  } else if (teyitKarari === 'pasiflestir') {
    // İkinci ardışık tam çekimde aynı ilanların eksik olduğu doğrulandı.
    await vt.prepare('DELETE FROM senkron_pasifleme_teyidi WHERE id = 1').run();
  } else if (teyitKarari === 'bekle' && dusus.imza) {
    await vt
      .prepare(
        `INSERT INTO senkron_pasifleme_teyidi (id, eksik_imzasi, teyit_sayisi, son_gorulme)
         VALUES (1, ?, 1, ?)
         ON CONFLICT(id) DO UPDATE SET
           eksik_imzasi = excluded.eksik_imzasi,
           teyit_sayisi = 1,
           son_gorulme = excluded.son_gorulme`
      )
      .bind(dusus.imza, suAn)
      .run();
    pasiflemeErtelendi = true;
  } else {
    await vt.prepare('DELETE FROM senkron_pasifleme_teyidi WHERE id = 1').run();
  }

  const pasifIdler = pasiflemeErtelendi ? [] : eksikIdler;

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
    pasiflemeErtelendi,
    oncekiAktif,
    eksikAdet: eksikIdler.length,
    supheliDusus: dusus.supheli,
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
         CASE WHEN d.baslik IS NOT NULL OR d.aciklama IS NOT NULL OR d.temel IS NOT NULL THEN 1 ELSE 0 END AS duzenlendi
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

export interface DuzenlemeKaydi {
  ilan_id: string;
  baslik?: string | null;
  aciklama?: string | null;
  temel?: string | null;
  ozellikler?: string | null;
  donanim?: string | null;
}

export async function duzenlemeleriGetir(
  vt: D1Database
): Promise<Map<string, DuzenlemeKaydi>> {
  try {
    const sonuc = await vt
      .prepare(`SELECT ilan_id, baslik, aciklama, temel, ozellikler, donanim FROM ilan_duzenleme`)
      .all<DuzenlemeKaydi>();
    return new Map((sonuc.results ?? []).map((r) => [r.ilan_id, r]));
  } catch {
    try {
      const fallback = await vt
        .prepare(`SELECT ilan_id, baslik, aciklama FROM ilan_duzenleme`)
        .all<DuzenlemeKaydi>();
      return new Map((fallback.results ?? []).map((r) => [r.ilan_id, r]));
    } catch {
      return new Map();
    }
  }
}

/**
 * İlan ekleme veya güncelleme.
 *
 * Elle eklenen ilanlar doğrudan ilanlar tablosuna yazılır;
 * Portaldan gelen ilanlarda kaynak satır değiştirilmez; panel kararı
 * ilan_duzenleme'de tutulur ve okuma sırasında kaynağın üstüne bindirilir.
 */
export async function ilanKaydetVeyaGuncelle(
  vt: D1Database,
  veri: AyrintiliIlanGirdisi,
  id?: string,
  yeniIdAdayi?: string
): Promise<string> {
  const suAn = new Date().toISOString();
  const ozelliklerJson = JSON.stringify(veri.ozellikler);
  const donanimJson = JSON.stringify(veri.donanim ?? []);
  const gorsellerJson = JSON.stringify(veri.gorseller ?? []);
  const temelJson = JSON.stringify({
    baslik: veri.baslik,
    aciklama: veri.aciklama,
    fiyat: veri.fiyat,
    para_birimi: veri.paraBirimi,
    islem: veri.islem,
    kategori: veri.kategori,
    tip: veri.tip,
    tip_grup: veri.tipGrup,
    oda: veri.oda,
    m2: veri.m2,
    il: veri.il,
    ilce: veri.ilce,
    mahalle: veri.mahalle,
    gorseller: gorsellerJson,
    danisman_slug: veri.danismanSlug,
  });

  if (id) {
    const mevcut = await vt
      .prepare('SELECT id, kaynak FROM ilanlar WHERE id = ?')
      .bind(id)
      .first<{ id: string; kaynak: string }>();

    if (!mevcut) throw new Error(`İlan bulunamadı: ${id}`);

    if (mevcut.kaynak === 'elle') {
      await vt
        .prepare(
          `UPDATE ilanlar SET
             baslik = ?, aciklama = ?, fiyat = ?, para_birimi = ?, islem = ?,
             kategori = ?, tip = ?, tip_grup = ?, oda = ?, m2 = ?, il = ?,
             ilce = ?, mahalle = ?, ozellikler = ?, donanim = ?, gorseller = ?,
             danisman_slug = ?, guncellenme = ?
           WHERE id = ?`
        )
        .bind(
          veri.baslik,
          veri.aciklama,
          veri.fiyat,
          veri.paraBirimi,
          veri.islem,
          veri.kategori,
          veri.tip,
          veri.tipGrup,
          veri.oda,
          veri.m2,
          veri.il,
          veri.ilce,
          veri.mahalle,
          ozelliklerJson,
          donanimJson,
          gorsellerJson,
          veri.danismanSlug,
          suAn,
          id
        )
        .run();

      // Eski hızlı düzenleyiciden kalmış içerik geçersiz kılmaları,
      // ayrıntılı formda kaydedilen temel satırın önüne geçmesin.
      // Görünürlük ve öne çıkarma tercihleri aynı satırda korunur.
      await vt
        .prepare(
          `UPDATE ilan_duzenleme SET
             baslik = NULL, aciklama = NULL, temel = NULL,
             ozellikler = NULL, donanim = NULL, guncelleme = ?
           WHERE ilan_id = ?`
        )
        .bind(suAn, id)
        .run();
    } else {
      await vt
        .prepare(
          `INSERT INTO ilan_duzenleme (ilan_id, baslik, aciklama, temel, ozellikler, donanim, guncelleme)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(ilan_id) DO UPDATE SET
             baslik = excluded.baslik,
             aciklama = excluded.aciklama,
             temel = excluded.temel,
             ozellikler = excluded.ozellikler,
             donanim = excluded.donanim,
             guncelleme = excluded.guncelleme`
        )
        .bind(id, veri.baslik, veri.aciklama, temelJson, ozelliklerJson, donanimJson, suAn)
        .run();
    }

    return id;
  }

  const yeniId = yeniIdAdayi && /^elle-[a-z0-9-]{6,34}$/i.test(yeniIdAdayi)
    ? yeniIdAdayi
    : `elle-${Date.now().toString(36)}`;
  await vt
    .prepare(
      `INSERT INTO ilanlar (
         id, kaynak, kaynak_url, baslik, aciklama, fiyat, para_birimi, islem,
         kategori, tip, tip_grup, oda, m2, il, ilce, mahalle, ozellikler,
         donanim, gorseller, danisman_slug, guncellenme, ilk_gorulme, son_gorulme,
         durum, pasif_tarihi
       ) VALUES (?, 'elle', '', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', NULL)`
    )
    .bind(
      yeniId,
      veri.baslik,
      veri.aciklama,
      veri.fiyat,
      veri.paraBirimi,
      veri.islem,
      veri.kategori,
      veri.tip,
      veri.tipGrup,
      veri.oda,
      veri.m2,
      veri.il,
      veri.ilce,
      veri.mahalle,
      ozelliklerJson,
      donanimJson,
      gorsellerJson,
      veri.danismanSlug,
      suAn,
      suAn,
      suAn
    )
    .run();

  return yeniId;
}
