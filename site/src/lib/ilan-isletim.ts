/**
 * İlanın kaynak verisinden bağımsız işletim katmanı.
 *
 * Portal aktifliği `ilanlar.durum` alanında kalır. Yönetici kararı mevcut
 * `ilan_duzenleme.gizli` alanıyla kaynağın üstüne bindirilir; böylece senkron
 * bir ilanı yeniden görse bile panelde verilen yayından alma kararı kaybolmaz.
 * Hatırlatma, bildirim ve sosyal yayın kayıtları ise kendi tablolarında tutulur.
 */

import { env } from 'cloudflare:workers';
import { r2FotografiSil } from './r2-gorseller';

export const ILAN_ISLETIM_SEMA = `
CREATE TABLE IF NOT EXISTS ilan_hatirlatma (
  ilan_id       TEXT PRIMARY KEY,
  planlanan     TEXT NOT NULL,
  notu          TEXT NOT NULL DEFAULT '',
  durum         TEXT NOT NULL DEFAULT 'bekliyor',
  olusturma     TEXT NOT NULL,
  guncelleme    TEXT NOT NULL,
  bildirim      TEXT
);
CREATE INDEX IF NOT EXISTS hatirlatma_durum_tarih ON ilan_hatirlatma (durum, planlanan);

CREATE TABLE IF NOT EXISTS ilan_bildirim (
  kimlik        TEXT PRIMARY KEY,
  ilan_id       TEXT NOT NULL,
  tur           TEXT NOT NULL,
  mesaj         TEXT NOT NULL,
  durum         TEXT NOT NULL DEFAULT 'bekliyor',
  deneme        INTEGER NOT NULL DEFAULT 0,
  olusturma     TEXT NOT NULL,
  gonderilme    TEXT,
  hata          TEXT
);
CREATE INDEX IF NOT EXISTS bildirim_durum ON ilan_bildirim (durum, olusturma);

CREATE TABLE IF NOT EXISTS sosyal_paylasim (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ilan_id       TEXT NOT NULL,
  platformlar   TEXT NOT NULL,
  durum         TEXT NOT NULL DEFAULT 'bekliyor',
  kaynak        TEXT NOT NULL,
  fiyat_anlik   INTEGER,
  kampanya      TEXT,
  deneme        INTEGER NOT NULL DEFAULT 0,
  olusturma     TEXT NOT NULL,
  guncelleme    TEXT NOT NULL,
  baslatma      TEXT,
  bitis         TEXT,
  sonuc         TEXT,
  hata          TEXT
);
CREATE INDEX IF NOT EXISTS sosyal_paylasim_durum ON sosyal_paylasim (durum, olusturma);
CREATE INDEX IF NOT EXISTS sosyal_paylasim_ilan ON sosyal_paylasim (ilan_id, olusturma DESC);
`;

const PLATFORM_LISTESI = ['ig', 'facebook', 'threads', 'reels', 'youtube', 'tiktok'] as const;
export type SosyalPlatform = (typeof PLATFORM_LISTESI)[number];

export interface HatirlatmaKaydi {
  ilan_id: string;
  planlanan: string;
  notu: string;
  durum: string;
  bildirim: string | null;
}

export interface PaylasimKaydi {
  id: number;
  ilan_id: string;
  platformlar: string;
  durum: string;
  kaynak: string;
  fiyat_anlik: number | null;
  kampanya: string | null;
  deneme: number;
  olusturma: string;
  guncelleme: string;
  baslatma: string | null;
  bitis: string | null;
  sonuc: string | null;
  hata: string | null;
}

interface WhatsAppOrtami {
  WHATSAPP_TELEFON_NO_KIMLIGI?: string;
  WHATSAPP_ERISIM_JETONU?: string;
  WHATSAPP_BILDIRIM_ALICI?: string;
  WHATSAPP_PASIF_SABLONU?: string;
}

const simdi = () => new Date().toISOString();

export async function ilanIsletimSemasiniKur(vt: D1Database): Promise<void> {
  const sql = ILAN_ISLETIM_SEMA
    .split('\n')
    .filter((satir) => !satir.trim().startsWith('--'))
    .join('\n');
  for (const ifade of sql.split(';')) {
    const temiz = ifade.trim();
    if (temiz) await vt.prepare(temiz).run();
  }
}

/** Kaynak ve yönetici kararını birlikte uygular. */
export async function ilanYayinDurumuDegistir(
  vt: D1Database,
  ilanId: string,
  yayinlansin: boolean
): Promise<void> {
  const ilan = await vt
    .prepare(`SELECT id, kaynak, durum FROM ilanlar WHERE id = ?`)
    .bind(ilanId)
    .first<{ id: string; kaynak: string; durum: string }>();
  if (!ilan) throw new Error('İlan bulunamadı.');

  const zaman = simdi();
  if (ilan.kaynak === 'elle') {
    await vt
      .prepare(`UPDATE ilanlar SET durum = ?, pasif_tarihi = ?, guncellenme = ? WHERE id = ?`)
      .bind(yayinlansin ? 'aktif' : 'pasif', yayinlansin ? null : zaman, zaman, ilanId)
      .run();
    // Eski bir görünürlük kararı elle girilen ilanı yeniden açarken engel olmasın.
    if (yayinlansin) {
      await vt.prepare(`UPDATE ilan_duzenleme SET gizli = 0, guncelleme = ? WHERE ilan_id = ?`).bind(zaman, ilanId).run();
    }
    return;
  }

  if (yayinlansin && ilan.durum !== 'aktif') {
    throw new Error('Portal bu ilanı artık aktif göstermiyor. Kaynağa dönmeden yayına alınamaz.');
  }
  await vt
    .prepare(
      `INSERT INTO ilan_duzenleme (ilan_id, gizli, guncelleme) VALUES (?,?,?)
       ON CONFLICT(ilan_id) DO UPDATE SET gizli = excluded.gizli, guncelleme = excluded.guncelleme`
    )
    .bind(ilanId, yayinlansin ? 0 : 1, zaman)
    .run();
}

export async function hatirlatmaKaydet(
  vt: D1Database,
  ilanId: string,
  planlanan: string,
  notu: string
): Promise<void> {
  if (!planlanan) {
    await vt.prepare(`DELETE FROM ilan_hatirlatma WHERE ilan_id = ?`).bind(ilanId).run();
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(planlanan)) throw new Error('Hatırlatma tarihi geçersiz.');
  const zaman = simdi();
  await vt
    .prepare(
      `INSERT INTO ilan_hatirlatma (ilan_id, planlanan, notu, durum, olusturma, guncelleme, bildirim)
       VALUES (?,?,?,'bekliyor',?,?,NULL)
       ON CONFLICT(ilan_id) DO UPDATE SET
         planlanan = excluded.planlanan, notu = excluded.notu, durum = 'bekliyor',
         guncelleme = excluded.guncelleme, bildirim = NULL`
    )
    .bind(ilanId, planlanan, notu.trim().slice(0, 500), zaman, zaman)
    .run();
}

export async function hatirlatmalariGetir(vt: D1Database): Promise<Map<string, HatirlatmaKaydi>> {
  const sonuc = await vt.prepare(`SELECT ilan_id, planlanan, notu, durum, bildirim FROM ilan_hatirlatma`).all<HatirlatmaKaydi>();
  return new Map((sonuc.results ?? []).map((kayit) => [kayit.ilan_id, kayit]));
}

export async function pasifBildirimleriniKaydet(vt: D1Database, ilanIdleri: string[]): Promise<number> {
  if (!ilanIdleri.length) return 0;
  const zaman = simdi();
  const satirlar = await vt
    .prepare(`SELECT id, baslik, pasif_tarihi FROM ilanlar WHERE id IN (${ilanIdleri.map(() => '?').join(',')})`)
    .bind(...ilanIdleri)
    .all<{ id: string; baslik: string; pasif_tarihi: string | null }>();
  const komutlar = (satirlar.results ?? []).map((ilan) => {
    const olay = ilan.pasif_tarihi ?? zaman;
    const kimlik = `portal-pasif:${ilan.id}:${olay}`;
    const mesaj = `Portal ilanı pasife düştü: ${ilan.baslik} (No: ${ilan.id}). Panelden kontrol edin: https://edmyapigayrimenkul.com/yonetim/ilan-duzenle/${ilan.id}`;
    return vt
      .prepare(
        `INSERT OR IGNORE INTO ilan_bildirim
           (kimlik, ilan_id, tur, mesaj, durum, deneme, olusturma)
         VALUES (?,?,'portal-pasif',?,'bekliyor',0,?)`
      )
      .bind(kimlik, ilan.id, mesaj, zaman);
  });
  if (komutlar.length) await vt.batch(komutlar);
  return komutlar.length;
}

/**
 * Onaylı `WHATSAPP_PASIF_SABLONU` şablonunun gövdesinde tek değişken (`{{1}}`)
 * beklenir. Ayarlar yoksa kayıtlar kaybolmaz; panelde bekliyor olarak kalır.
 */
export async function bekleyenPasifBildirimleriniGonder(
  vt: D1Database,
  ortam: WhatsAppOrtami
): Promise<{ gonderilen: number; bekleyen: number; yapilandirildi: boolean }> {
  const ayarli = Boolean(
    ortam.WHATSAPP_TELEFON_NO_KIMLIGI &&
    ortam.WHATSAPP_ERISIM_JETONU &&
    ortam.WHATSAPP_BILDIRIM_ALICI &&
    ortam.WHATSAPP_PASIF_SABLONU
  );
  const satirlar = await vt
    .prepare(`SELECT kimlik, mesaj, deneme FROM ilan_bildirim WHERE durum = 'bekliyor' AND deneme < 5 ORDER BY olusturma LIMIT 10`)
    .all<{ kimlik: string; mesaj: string; deneme: number }>();
  const bekleyen = satirlar.results ?? [];
  if (!ayarli || !bekleyen.length) return { gonderilen: 0, bekleyen: bekleyen.length, yapilandirildi: ayarli };

  let gonderilen = 0;
  for (const kayit of bekleyen) {
    try {
      const cevap = await fetch(
        `https://graph.facebook.com/v23.0/${ortam.WHATSAPP_TELEFON_NO_KIMLIGI}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ortam.WHATSAPP_ERISIM_JETONU}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: ortam.WHATSAPP_BILDIRIM_ALICI,
            type: 'template',
            template: {
              name: ortam.WHATSAPP_PASIF_SABLONU,
              language: { code: 'tr' },
              components: [{ type: 'body', parameters: [{ type: 'text', text: kayit.mesaj.slice(0, 900) }] }],
            },
          }),
        }
      );
      if (!cevap.ok) throw new Error(`WhatsApp ${cevap.status}: ${(await cevap.text()).slice(0, 240)}`);
      await vt
        .prepare(`UPDATE ilan_bildirim SET durum = 'gonderildi', deneme = deneme + 1, gonderilme = ?, hata = NULL WHERE kimlik = ?`)
        .bind(simdi(), kayit.kimlik)
        .run();
      gonderilen++;
    } catch (hata) {
      const sonDeneme = kayit.deneme + 1;
      await vt
        .prepare(`UPDATE ilan_bildirim SET durum = ?, deneme = ?, hata = ? WHERE kimlik = ?`)
        .bind(sonDeneme >= 5 ? 'hata' : 'bekliyor', sonDeneme, String((hata as Error).message).slice(0, 500), kayit.kimlik)
        .run();
    }
  }
  return { gonderilen, bekleyen: Math.max(0, bekleyen.length - gonderilen), yapilandirildi: true };
}

export function platformlariOku(degerler: FormDataEntryValue[]): SosyalPlatform[] {
  const izinli = new Set<string>(PLATFORM_LISTESI);
  return [...new Set(degerler.map(String).filter((deger): deger is SosyalPlatform => izinli.has(deger)))];
}

export async function paylasimKuyrugunaEkle(
  vt: D1Database,
  ilanId: string,
  platformlar: SosyalPlatform[],
  kaynak: string
): Promise<{ id: number; yeni: boolean }> {
  if (!platformlar.length) throw new Error('En az bir sosyal medya hesabı seçin.');
  const ilan = await vt
    .prepare(
      `SELECT
         CASE WHEN json_valid(d.temel) THEN COALESCE(CAST(json_extract(d.temel, '$.fiyat') AS INTEGER), i.fiyat) ELSE i.fiyat END AS fiyat,
         i.durum, COALESCE(d.gizli, 0) AS gizli
       FROM ilanlar i LEFT JOIN ilan_duzenleme d ON d.ilan_id = i.id WHERE i.id = ?`
    )
    .bind(ilanId)
    .first<{ fiyat: number | null; durum: string; gizli: number }>();
  if (!ilan) throw new Error('Paylaşılacak ilan bulunamadı.');
  if (ilan.durum !== 'aktif' || ilan.gizli === 1) throw new Error('Pasif veya yayından alınmış ilan sosyal medyada paylaşılamaz.');

  const mevcut = await vt
    .prepare(`SELECT id, platformlar, durum FROM sosyal_paylasim WHERE ilan_id = ? AND durum IN ('bekliyor','isleniyor') ORDER BY id DESC LIMIT 1`)
    .bind(ilanId)
    .first<{ id: number; platformlar: string; durum: string }>();
  if (mevcut) {
    if (mevcut.durum === 'isleniyor') {
      throw new Error('Bu ilanın sosyal yayını şu anda sürüyor. Tamamlandıktan sonra yeni bir paylaşım ekleyin.');
    }
    let eskiler: SosyalPlatform[] = [];
    try { eskiler = JSON.parse(mevcut.platformlar) as SosyalPlatform[]; } catch { /* bozuk liste yenisiyle onarılır */ }
    const birlesik = [...new Set([...eskiler, ...platformlar])];
    await vt.prepare(`UPDATE sosyal_paylasim SET platformlar = ?, guncelleme = ? WHERE id = ?`).bind(JSON.stringify(birlesik), simdi(), mevcut.id).run();
    // Bu yol da tetikliyor: iş zaten bekliyordu ama önceki tetikleme
    // düşmüş olabilir; ikinci şans maliyetsiz.
    await postedmiUyandir();
    return { id: mevcut.id, yeni: false };
  }

  const zaman = simdi();
  const sonuc = await vt
    .prepare(
      `INSERT INTO sosyal_paylasim
         (ilan_id, platformlar, durum, kaynak, fiyat_anlik, deneme, olusturma, guncelleme)
       VALUES (?,?,'bekliyor',?,?,0,?,?) RETURNING id`
    )
    .bind(ilanId, JSON.stringify(platformlar), kaynak.slice(0, 40), ilan.fiyat, zaman, zaman)
    .first<{ id: number }>();
  if (!sonuc?.id) throw new Error('Sosyal paylaşım kuyruğu oluşturulamadı.');
  const kampanya = `ilan-${ilanId}-${sonuc.id}`.slice(0, 120);
  await vt.prepare(`UPDATE sosyal_paylasim SET kampanya = ? WHERE id = ?`).bind(kampanya, sonuc.id).run();
  await postedmiUyandir();
  return { id: sonuc.id, yeni: true };
}

/**
 * postedm'e "kuyrukta iş var" haberi verir.
 *
 * NEDEN OLAY, NEDEN YOKLAMA DEĞİL: postedm kuyruğu önce 10 dakikada bir
 * yokluyordu. Depo private olduğu için Actions kotası 2000 dk/ay ve hesap
 * tutmuyordu — ayda 4320 koşu, koşu başına yalnızca checkout + pip install
 * 40-60 saniye, toplam 3000-4300 dk. Kotanın 1,5-2 katı.
 *
 * Artık iş kuyruğa girdiği anda tetikleniyor; postedm tarafındaki saatlik
 * cron yalnızca güvenlik ağı.
 *
 * BEST-EFFORT: tetikleme başarısız olursa kuyruk yazma işlemi BOZULMAZ.
 * İş kuyrukta durur ve en geç bir saat içinde cron tarafından alınır.
 * Paneldeki kullanıcıyı GitHub'ın erişilebilirliğine bağlamıyoruz.
 */
async function postedmiUyandir(): Promise<void> {
  const jeton = (env as Record<string, unknown>).POSTEDM_GITHUB_JETONU as string | undefined;
  const depo = ((env as Record<string, unknown>).POSTEDM_DEPO as string | undefined)
    ?? 'edmyapigayrimenkul/postedm';
  if (!jeton) return;   // tanımlı değilse sessizce geç; cron yine de yakalar

  try {
    await fetch(`https://api.github.com/repos/${depo}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jeton}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'edm-site',
      },
      body: JSON.stringify({ event_type: 'site_ilan_kuyrugu' }),
      // Panel yanıtı GitHub'ın hızına bağlanmasın. Zaman aşımında iş
      // kuyrukta kalır ve saatlik cron alır; kullanıcı beklemez.
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Yutuluyor: saatlik cron güvenlik ağı devrede.
  }
}

export async function paylasimlariGetir(vt: D1Database, sinir = 80): Promise<PaylasimKaydi[]> {
  const sonuc = await vt
    .prepare(`SELECT * FROM sosyal_paylasim ORDER BY id DESC LIMIT ?`)
    .bind(Math.max(1, Math.min(200, sinir)))
    .all<PaylasimKaydi>();
  return sonuc.results ?? [];
}

/** Kuyruğu tek atomik sorguyla sahiplenir; paralel iş aynı kaydı alamaz. */
export async function siradakiPaylasimiAl(vt: D1Database): Promise<PaylasimKaydi | null> {
  const zaman = simdi();
  await vt
    .prepare(
      `UPDATE sosyal_paylasim SET durum = 'hata', bitis = ?, guncelleme = ?, hata = 'Üç denemede sonuç alınamadı.'
       WHERE durum = 'isleniyor' AND deneme >= 3 AND datetime(baslatma) < datetime('now', '-1 hour')`
    )
    .bind(zaman, zaman)
    .run();
  await vt
    .prepare(
      `UPDATE sosyal_paylasim SET durum = 'bekliyor', baslatma = NULL, guncelleme = ?
       WHERE durum = 'isleniyor' AND deneme < 3 AND datetime(baslatma) < datetime('now', '-1 hour')`
    )
    .bind(zaman)
    .run();
  return await vt
    .prepare(
      `UPDATE sosyal_paylasim
       SET durum = 'isleniyor', deneme = deneme + 1, baslatma = ?, guncelleme = ?, hata = NULL
       WHERE id = (SELECT id FROM sosyal_paylasim WHERE durum = 'bekliyor' AND deneme < 3 ORDER BY id LIMIT 1)
         AND durum = 'bekliyor'
       RETURNING *`
    )
    .bind(zaman, zaman)
    .first<PaylasimKaydi>();
}

export async function paylasimSonucunuYaz(
  vt: D1Database,
  id: number,
  durum: 'yayinlandi' | 'hata' | 'iptal' | 'kuru',
  sonuc = '',
  hata = ''
): Promise<boolean> {
  const yazma = await vt
    .prepare(
      `UPDATE sosyal_paylasim SET durum = ?, sonuc = ?, hata = ?, bitis = ?, guncelleme = ?
       WHERE id = ? AND durum = 'isleniyor'`
    )
    .bind(durum, sonuc.slice(0, 4000) || null, hata.slice(0, 1000) || null, simdi(), simdi(), id)
    .run();
  return (yazma.meta?.changes ?? 0) > 0;
}

/** Yalnızca elle girilmiş ve paylaşımda olmayan ilanı ilişkileriyle kaldırır. */
export async function elleIlaniKaliciSil(vt: D1Database, kova: R2Bucket | undefined, ilanId: string): Promise<void> {
  const ilan = await vt.prepare(`SELECT kaynak FROM ilanlar WHERE id = ?`).bind(ilanId).first<{ kaynak: string }>();
  if (!ilan || ilan.kaynak !== 'elle') throw new Error('Yalnızca elle girilen ilan kalıcı olarak silinebilir.');
  const isleniyor = await vt
    .prepare(`SELECT COUNT(*) AS adet FROM sosyal_paylasim WHERE ilan_id = ? AND durum = 'isleniyor'`)
    .bind(ilanId)
    .first<{ adet: number }>();
  if ((isleniyor?.adet ?? 0) > 0) throw new Error('İlanın sosyal medya yayını sürüyor; işlem tamamlanmadan silinemez.');
  const fotograflar = await vt.prepare(`SELECT anahtar FROM ilan_foto WHERE ilan_id = ?`).bind(ilanId).all<{ anahtar: string }>();
  const video = await vt.prepare(`SELECT video_anahtar, poster_anahtar FROM ilan_video WHERE ilan_id = ?`).bind(ilanId)
    .first<{ video_anahtar: string; poster_anahtar: string }>().catch(() => null);
  await vt.batch([
    vt.prepare(`DELETE FROM ilan_foto WHERE ilan_id = ?`).bind(ilanId),
    vt.prepare(`DELETE FROM ilan_video WHERE ilan_id = ?`).bind(ilanId),
    vt.prepare(`DELETE FROM ilan_gorsel_duzen WHERE ilan_id = ?`).bind(ilanId),
    vt.prepare(`DELETE FROM ilan_hatirlatma WHERE ilan_id = ?`).bind(ilanId),
    vt.prepare(`DELETE FROM ilan_bildirim WHERE ilan_id = ?`).bind(ilanId),
    vt.prepare(`DELETE FROM sosyal_paylasim WHERE ilan_id = ?`).bind(ilanId),
    vt.prepare(`DELETE FROM goruntulenme WHERE ilan_id = ?`).bind(ilanId),
    vt.prepare(`DELETE FROM ilan_duzenleme WHERE ilan_id = ?`).bind(ilanId),
    vt.prepare(`DELETE FROM ilanlar WHERE id = ? AND kaynak = 'elle'`).bind(ilanId),
  ]);
  for (const foto of fotograflar.results ?? []) await (kova ? r2FotografiSil(kova, foto.anahtar) : Promise.resolve()).catch(() => {});
  if (video) await Promise.allSettled([kova?.delete(video.video_anahtar), kova?.delete(video.poster_anahtar)]);
}
