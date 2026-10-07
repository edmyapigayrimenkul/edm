import { epostaGonder } from './eposta.ts';
import type { DogrulanmisTalep } from './talep-dogrulama.ts';

export interface TalepBildirimOrtami {
  EPOSTA?: { send: (mesaj: unknown) => Promise<void> };
  BILDIRIM_ADRESI?: string;
}
type Gonderici = (ortam: TalepBildirimOrtami, konu: string, govde: string) => Promise<boolean>;
const kuyrukGondericisi: Gonderici = (ortam, konu, govde) => epostaGonder(ortam, konu, govde, true);
const AZAMI_DENEME = 5;
const BEKLEME_DAKIKA = [5, 30, 120, 360, 360];

/** Talep ve kuyruk tek transaction: kuyruk kaydı başarısızsa ikisi de geri alınır. */
export async function talebiKaydet(vt: D1Database, kayit: DogrulanmisTalep, ulke: string | null): Promise<number> {
  const sonuclar = await vt.batch([
    vt.prepare(`INSERT INTO talepler
      (tur, ad, telefon, eposta, konu, mulk_tipi, ilce, mahalle, m2, mesaj, kaynak, ilan_id, ilan_baslik, ip_ulke)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`)
      .bind(kayit.tur, kayit.ad, kayit.telefon, kayit.eposta, kayit.konu,
        kayit.mulk_tipi, kayit.ilce, kayit.mahalle, kayit.m2, kayit.mesaj,
        kayit.kaynak, kayit.ilan_id, kayit.ilan_baslik, ulke),
    vt.prepare(`INSERT INTO talep_bildirim (talep_id) VALUES (last_insert_rowid())`),
  ]);
  const id = Number((sonuclar[0].results?.[0] as { id?: number })?.id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Talep kayıt kimliği alınamadı.');
  return id;
}

/** Süresi dolan gönderimin sonucunu bilmiyoruz; otomatik tekrar çift e-posta üretebilir. */
export async function belirsizBildirimleriAyir(vt: D1Database): Promise<void> {
  await vt.prepare(`UPDATE talep_bildirim SET durum = 'belirsiz', hata = 'SONUC_BELIRSIZ',
    kilit = NULL, kilit_bitis = NULL
    WHERE durum = 'gonderiliyor' AND kilit_bitis <= datetime('now')`).run();
}

export async function talepBildiriminiGonder(
  vt: D1Database, ortam: TalepBildirimOrtami, id: number, gonder: Gonderici = kuyrukGondericisi
): Promise<string> {
  const kilit = crypto.randomUUID();
  // RETURNING + durum koşulu eşzamanlı form/cron/panel isteklerinden yalnız birini seçer.
  const is = await vt.prepare(`UPDATE talep_bildirim SET durum = 'gonderiliyor',
    deneme = deneme + 1, son_deneme = datetime('now'), kilit = ?,
    kilit_bitis = datetime('now', '+10 minutes')
    WHERE talep_id = ? AND durum IN ('bekliyor', 'basarisiz')
      AND deneme < ? AND sonraki <= datetime('now') RETURNING deneme`)
    .bind(kilit, id, AZAMI_DENEME).first<{ deneme: number }>();
  if (!is) return 'atlanmis';

  let tamam = false;
  let gonderimBasladi = false;
  let belirsiz = false;
  let hata = ortam.EPOSTA ? 'GONDERIM_HATASI' : 'BAGLAMA_EKSIK';
  try {
    const t = await vt.prepare('SELECT * FROM talepler WHERE id = ?').bind(id).first<Record<string, unknown>>();
    if (!t) throw new Error('Talep bulunamadı.');
    const konu = t.tur === 'degerleme' ? `Değerleme talebi — ${t.ad}`
      : t.ilan_id ? `İlan talebi ${t.ilan_id} — ${t.ad}` : `İletişim formu — ${t.ad}`;
    const alanlar = [
      ['Ad Soyad', t.ad], ['Telefon', t.telefon], ['E-posta', t.eposta], ['Konu', t.konu],
      ['Mülk tipi', t.mulk_tipi], ['İlçe', t.ilce], ['Mahalle', t.mahalle],
      ['Büyüklük', t.m2 ? `${t.m2} m²` : null], ['Mesaj', t.mesaj],
      ['İlan no', t.ilan_id], ['İlan', t.ilan_baslik], ['Geldiği sayfa', t.kaynak],
    ];
    const govde = alanlar.filter(([, deger]) => Boolean(deger))
      .map(([etiket, deger]) => `${etiket}: ${deger}`).join('\n');
    gonderimBasladi = true;
    tamam = await gonder(ortam, konu,
      `${govde}\n\nTalep No: ${id}\nPanel: https://edmyapigayrimenkul.com/yonetim/talepler#t${id}`);
  } catch {
    // Serbest hata metni kişisel bilgi veya sağlayıcı ayrıntısı içerebilir; kaydetme.
    belirsiz = gonderimBasladi;
    hata = belirsiz ? 'SONUC_BELIRSIZ' : 'GONDERIM_HATASI';
  }

  // Gönderimden sonra bu yazım düşerse kilit süresi sonunda "belirsiz" olur.
  // Sağlayıcının kabulü gelen kutusuna teslim edildiği anlamına gelmez.
  await vt.prepare(`UPDATE talep_bildirim SET durum = ?, hata = ?,
    kabul = CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END,
    sonraki = datetime('now', ?), kilit = NULL, kilit_bitis = NULL
    WHERE talep_id = ? AND kilit = ? AND durum = 'gonderiliyor'`)
    .bind(tamam ? 'gonderildi' : belirsiz ? 'belirsiz' : 'basarisiz', tamam ? null : hata, tamam ? 1 : 0,
      `+${BEKLEME_DAKIKA[Math.min(is.deneme - 1, 4)]} minutes`, id, kilit).run();
  return tamam ? 'gonderildi' : belirsiz ? 'belirsiz' : 'basarisiz';
}

/** Yönetici kararı: belirsiz sonuçta tekrar gönderimin mükerrer olabileceği panelde açıklanır. */
export async function talepBildiriminiYenidenDene(
  vt: D1Database, ortam: TalepBildirimOrtami, id: number, gonder: Gonderici = kuyrukGondericisi
): Promise<string> {
  await belirsizBildirimleriAyir(vt);
  const sonuc = await vt.prepare(`UPDATE talep_bildirim SET durum = 'bekliyor', deneme = 0,
    sonraki = datetime('now'), hata = NULL
    WHERE talep_id = ? AND durum IN ('bekliyor', 'basarisiz', 'belirsiz') RETURNING talep_id`)
    .bind(id).first();
  if (!sonuc) return 'atlanmis';
  return talepBildiriminiGonder(vt, ortam, id, gonder);
}

export async function bekleyenTalepBildirimleriniGonder(
  vt: D1Database, ortam: TalepBildirimOrtami, gonder: Gonderici = kuyrukGondericisi
): Promise<void> {
  await belirsizBildirimleriAyir(vt);
  const siradakiler = await vt.prepare(`SELECT talep_id FROM talep_bildirim
    WHERE durum IN ('bekliyor', 'basarisiz') AND deneme < ? AND sonraki <= datetime('now')
    ORDER BY sonraki, talep_id LIMIT 10`).bind(AZAMI_DENEME).all<{ talep_id: number }>();
  for (const t of siradakiler.results ?? []) await talepBildiriminiGonder(vt, ortam, t.talep_id, gonder);
}

export function talepBildirimMetni(durum: unknown, deneme: unknown): string {
  if (durum === 'gonderildi') return 'E-posta gönderimine kabul edildi';
  if (durum === 'gonderiliyor') return 'E-posta gönderiliyor';
  if (durum === 'belirsiz') return 'Gönderim sonucu belirsiz — kontrol gerekli';
  if (durum === 'basarisiz') return Number(deneme) >= AZAMI_DENEME
    ? 'E-posta gönderilemedi — otomatik denemeler bitti' : 'E-posta gönderilemedi — tekrar denenecek';
  if (durum === 'bekliyor') return 'E-posta gönderimi bekliyor';
  return 'Önceki e-posta gönderiminin durumu bilinmiyor';
}
