import { islemKaydiKomutu } from './panel/islem-gecmisi.ts';

export const TALEP_SONUCLARI = {
  tamamlandi: 'Talep karşılandı',
  uygun_degil: 'Uygun bulunmadı',
  ulasilamadi: 'Ulaşılamadı',
  vazgecti: 'Müşteri vazgeçti',
  mukerrer: 'Mükerrer kayıt',
} as const;

export class TalepTakipHatasi extends Error {}

/** Form Türkiye saatindedir. Takvim taşmalarını ve serbest tarih metnini reddet. */
export function takipTarihiniCoz(yerel: string): string | null {
  if (!yerel) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(yerel)) {
    throw new TalepTakipHatasi('Takip tarihini geçerli bir gün ve saat olarak seçin.');
  }
  const d = new Date(`${yerel}:00.000Z`);
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 16) !== yerel ||
      Number(yerel.slice(0, 4)) < 2000 || Number(yerel.slice(0, 4)) > 2100) {
    throw new TalepTakipHatasi('Takip tarihi geçerli değil.');
  }
  return new Date(d.getTime() - 3 * 60 * 60 * 1000).toISOString();
}

export function takipFormTarihi(utc: unknown): string {
  if (!utc) return '';
  const d = new Date(String(utc));
  return Number.isFinite(d.getTime())
    ? new Date(d.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16) : '';
}

// Aynı ifadeler panel filtresinde, sayımda ve cron'da kullanılır; kapalı talepler dışlanır.
export const TAKIP_KOSULLARI = {
  sahipsiz: "t.durum <> 'kapandi' AND e.slug IS NULL",
  geciken: "t.durum <> 'kapandi' AND datetime(t.takip_tarihi) <= datetime('now')",
  plansiz: "t.durum <> 'kapandi' AND t.takip_tarihi IS NULL",
};

export async function takipSayimlariniAl(vt: D1Database) {
  return vt.prepare(`SELECT
    COUNT(*) AS acik,
    COALESCE(SUM(e.slug IS NULL),0) AS sahipsiz,
    COALESCE(SUM(t.takip_tarihi IS NULL),0) AS plansiz,
    COALESCE(SUM(datetime(t.takip_tarihi) <= datetime('now')),0) AS geciken,
    COALESCE(SUM(t.durum='yeni' AND datetime(t.olusturma) <= datetime('now','-24 hours')),0) AS eski_yeni,
    COALESCE(SUM(datetime(t.takip_tarihi) <= datetime('now') OR
      (datetime(t.olusturma) <= datetime('now','-24 hours') AND
       (t.durum='yeni' OR e.slug IS NULL OR t.takip_tarihi IS NULL))),0) AS uyari
    FROM talepler t LEFT JOIN ekip e ON e.slug=t.sorumlu_slug
    WHERE t.durum <> 'kapandi'`).first<{
      acik: number; sahipsiz: number; plansiz: number; geciken: number; eski_yeni: number; uyari: number;
    }>();
}

type TalepKaydi = {
  id: number; durum: string; sorumlu_slug: string | null; takip_tarihi: string | null;
  sonuc: string | null; takip_surumu: number;
};

/** Sürüm koşulu ve audit tek transaction'dır. Yalnız kazanan güncelleme geçmişe girer. */
export async function talepTakibiniKaydet(
  vt: D1Database, eposta: string, form: FormData, simdi = new Date()
): Promise<void> {
  const id = Number(form.get('id'));
  const surumHam = String(form.get('takip_surumu') ?? '');
  const surum = Number(surumHam);
  const eylem = String(form.get('eylem') ?? '');
  if (!Number.isSafeInteger(id) || id <= 0 || !/^\d+$/.test(surumHam) ||
      !Number.isSafeInteger(surum) || !['takip', 'not'].includes(eylem)) {
    throw new TalepTakipHatasi('Talep ve düzenleme bilgileri geçerli değil. Sayfayı yenileyin.');
  }
  const onceki = await vt.prepare(`SELECT id,durum,sorumlu_slug,takip_tarihi,sonuc,takip_surumu
    FROM talepler WHERE id=?`).bind(id).first<TalepKaydi>();
  if (!onceki) throw new TalepTakipHatasi('Talep bulunamadı.');
  if (onceki.takip_surumu !== surum) {
    throw new TalepTakipHatasi('Bu talep başka bir işlemle değişti. Güncel bilgileri kontrol edip tekrar kaydedin.');
  }

  let komut: D1PreparedStatement;
  let sonraki: unknown;
  if (eylem === 'not') {
    const not = String(form.get('ic_not') ?? '').trim();
    if (not.length > 2000) throw new TalepTakipHatasi('İç not en fazla 2000 karakter olabilir.');
    komut = vt.prepare(`UPDATE talepler SET ic_not=?,ilgilenen=?,takip_surumu=takip_surumu+1
      WHERE id=? AND takip_surumu=?`).bind(not || null, eposta, id, surum);
    // Müşteri metni/not içeriği audit tablosuna kopyalanmaz.
    sonraki = { notGuncellendi: true, takip_surumu: surum + 1 };
  } else {
    const durum = String(form.get('durum') ?? '');
    const sorumlu = String(form.get('sorumlu_slug') ?? '').trim() || null;
    const sonuc = String(form.get('sonuc') ?? '') || null;
    if (!['yeni', 'islemde', 'kapandi'].includes(durum)) {
      throw new TalepTakipHatasi('Geçerli bir talep durumu seçin.');
    }
    if (sorumlu && !await vt.prepare('SELECT slug FROM ekip WHERE slug=?').bind(sorumlu).first()) {
      throw new TalepTakipHatasi('Sorumlu kişiyi mevcut ekipten seçin.');
    }
    if ((durum === 'islemde' || durum === 'kapandi') && !sorumlu) {
      throw new TalepTakipHatasi('İşleme almak veya kapatmak için sorumlu seçin.');
    }
    if (durum === 'kapandi' && (!sonuc || !Object.hasOwn(TALEP_SONUCLARI, sonuc))) {
      throw new TalepTakipHatasi('Kapatırken gerçekleşen sonucu seçin.');
    }
    const takip = durum === 'kapandi' ? null : takipTarihiniCoz(String(form.get('takip_tarihi') ?? ''));
    if ((durum === 'islemde' || sorumlu) && durum !== 'kapandi' && !takip) {
      throw new TalepTakipHatasi('Sorumlusu olan açık talebe takip tarihi ekleyin.');
    }
    if (takip && new Date(takip).getTime() <= simdi.getTime()) {
      throw new TalepTakipHatasi('Bir sonraki takip için ilerideki bir tarih ve saat seçin.');
    }
    const kapanisSonucu = durum === 'kapandi' ? sonuc : null;
    komut = vt.prepare(`UPDATE talepler SET durum=?,sorumlu_slug=?,takip_tarihi=?,sonuc=?,
      ilgilenen=?,takip_surumu=takip_surumu+1,
      kapanma=CASE WHEN ?='kapandi' THEN COALESCE(kapanma,?) ELSE NULL END
      WHERE id=? AND takip_surumu=?
        AND (sorumlu_slug IS ?) AND (? IS NULL OR EXISTS(SELECT 1 FROM ekip WHERE slug=?))`)
      .bind(durum, sorumlu, takip, kapanisSonucu, eposta, durum, simdi.toISOString(),
        id, surum, onceki.sorumlu_slug, sorumlu, sorumlu);
    sonraki = { durum, sorumlu_slug: sorumlu, takip_tarihi: takip, sonuc: kapanisSonucu, takip_surumu: surum + 1 };
  }
  const [degisiklik] = await vt.batch([komut, islemKaydiKomutu(vt, { eposta }, {
    eylem: eylem === 'not' ? 'talep-not' : 'talep-takip', varlikTuru: 'talep', varlikId: String(id),
    ozet: eylem === 'not' ? 'Talep iç notu güncellendi.' : 'Talep sorumlusu, takip planı veya sonucu güncellendi.',
    onceki: eylem === 'not' ? { takip_surumu: surum } : onceki, sonraki,
  }, true)]);
  if (degisiklik.meta.changes !== 1) {
    throw new TalepTakipHatasi('Talep veya ekip bilgisi değişti. Güncel bilgileri kontrol edip tekrar kaydedin.');
  }
}
