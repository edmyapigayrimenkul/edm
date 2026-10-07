import { takipSayimlariniAl } from './talep-takip.ts';
import { epostaGonder } from './eposta.ts';
import type { TalepBildirimOrtami } from './talep-bildirim.ts';
import type { SenkronSonuc } from './senkron/depo.ts';

export type UyariAnahtari = 'senkron-hata' | 'senkron-dusus' | 'senkron-eksik' | 'talep-gecikti' | 'talep-bildirim';
type Gonderici = (ortam: TalepBildirimOrtami, konu: string, govde: string) => Promise<boolean>;
const gonderici: Gonderici = (ortam, konu, govde) => epostaGonder(ortam, konu, govde, true);
export const TALEP_GECIKME_SAATI = 24;
const AZAMI_DENEME = 5;
export const UYARI_BASLIKLARI: Record<UyariAnahtari, string> = {
  'senkron-hata': 'İlan senkronu tamamlanamadı',
  'senkron-dusus': 'Portal ilanlarında olağandışı düşüş',
  'senkron-eksik': 'Bazı ilan ayrıntıları okunamadı',
  'talep-gecikti': 'İlgilenilmeyi bekleyen talepler',
  'talep-bildirim': 'Talep e-postaları kontrol bekliyor',
};

/** Aynı sorun sürerken yalnız metni güncelle; düzeldikten sonra yeni olay aç.
 * Gözlem zamanı eski bir işin daha yeni sonucu geri çevirmesini engeller.
 * Müşteri bilgileri ve serbest sağlayıcı hata metinleri bu tabloya yazılmaz.
 */
export async function uyariDurumunuKaydet(
  vt: D1Database, anahtar: UyariAnahtari, aktif: boolean, metin: string,
  kontrol = new Date().toISOString()
): Promise<void> {
  await vt.prepare(`INSERT INTO isletim_uyari
    (anahtar,aktif,olay,metin,acilis,kapanis,son_kontrol)
    VALUES (?,?,?,?,CASE WHEN ?=1 THEN datetime('now') END,NULL,?)
    ON CONFLICT(anahtar) DO UPDATE SET
      olay = CASE WHEN isletim_uyari.aktif=0 AND excluded.aktif=1 THEN excluded.olay ELSE isletim_uyari.olay END,
      acilis = CASE WHEN isletim_uyari.aktif=0 AND excluded.aktif=1 THEN excluded.acilis ELSE isletim_uyari.acilis END,
      kapanis = CASE WHEN excluded.aktif=1 THEN NULL WHEN isletim_uyari.aktif=1 THEN datetime('now') ELSE isletim_uyari.kapanis END,
      durum = CASE WHEN isletim_uyari.aktif=0 AND excluded.aktif=1 THEN 'bekliyor' ELSE isletim_uyari.durum END,
      deneme = CASE WHEN isletim_uyari.aktif=0 AND excluded.aktif=1 THEN 0 ELSE isletim_uyari.deneme END,
      sonraki = CASE WHEN isletim_uyari.aktif=0 AND excluded.aktif=1 THEN datetime('now') ELSE isletim_uyari.sonraki END,
      kabul = CASE WHEN isletim_uyari.aktif=0 AND excluded.aktif=1 THEN NULL ELSE isletim_uyari.kabul END,
      hata = CASE WHEN isletim_uyari.aktif=0 AND excluded.aktif=1 THEN NULL ELSE isletim_uyari.hata END,
      kilit = CASE WHEN isletim_uyari.aktif=0 AND excluded.aktif=1 THEN NULL ELSE isletim_uyari.kilit END,
      kilit_bitis = CASE WHEN isletim_uyari.aktif=0 AND excluded.aktif=1 THEN NULL ELSE isletim_uyari.kilit_bitis END,
      aktif=excluded.aktif, metin=excluded.metin, son_kontrol=excluded.son_kontrol
    WHERE excluded.son_kontrol >= isletim_uyari.son_kontrol`)
    .bind(anahtar, aktif ? 1 : 0, crypto.randomUUID(), metin, aktif ? 1 : 0, kontrol).run();
}

export async function senkronUyarilariniKaydet(
  vt: D1Database, sonuc: SenkronSonuc | null, kontrol = new Date().toISOString()
): Promise<void> {
  await uyariDurumunuKaydet(vt, 'senkron-hata', !sonuc,
    sonuc ? 'Son ilan senkronu tamamlandı.' : 'Son ilan senkronu tamamlanamadı. Panelde senkron günlüğünü kontrol edin; boş portal yanıtı da hata sayılır.', kontrol);
  // Başarısız çekim önceki düşüşün veya eksik ayrıntının düzeldiğine kanıt değildir.
  if (!sonuc) return;
  await uyariDurumunuKaydet(vt, 'senkron-dusus', sonuc.supheliDusus,
    `Önceki aktif portal ilanı: ${sonuc.oncekiAktif}. Bu çekimde bulunan: ${sonuc.bulunan}. Eksik ilan: ${sonuc.eksikAdet}. ` +
    (sonuc.pasiflemeErtelendi ? 'Pasife alma ertelendi; portalı kontrol edin.' : 'Eksik ilanların pasiflik durumu panelden kontrol edilebilir.'), kontrol);
  await uyariDurumunuKaydet(vt, 'senkron-eksik', sonuc.basarisiz > 0,
    `${sonuc.basarisiz} ilan ayrıntısı okunamadı. Eksik veriye dayanarak ilanlar pasife alınmadı.`, kontrol);
}

/** Takip zamanı gelenler ve 24 saatten eski sahipsiz/plansız/yeni talepler. */
export async function talepUyarilariniKaydet(vt: D1Database): Promise<void> {
  const kontrol = new Date().toISOString();
  const [geciken, bildirim] = await Promise.all([
    takipSayimlariniAl(vt),
    vt.prepare(`SELECT COUNT(*) AS adet FROM talep_bildirim WHERE durum IN ('basarisiz','belirsiz')`)
      .first<{ adet: number }>(),
  ]);
  await uyariDurumunuKaydet(vt, 'talep-gecikti', Number(geciken?.uyari) > 0,
    `${Number(geciken?.uyari) || 0} açık talep takip kontrolü bekliyor. ${Number(geciken?.eski_yeni) || 0} yeni talep ${TALEP_GECIKME_SAATI} saati aştı; ${Number(geciken?.geciken) || 0} talebin takip tarihi geçti. Talepler ekranında sorumlu ve planı kontrol edin.`, kontrol);
  await uyariDurumunuKaydet(vt, 'talep-bildirim', Number(bildirim?.adet) > 0,
    `${Number(bildirim?.adet) || 0} talebin e-posta bildirimi başarısız veya belirsiz. Bildirim uyarıları filtresini kontrol edin.`, kontrol);
}

export async function belirsizUyarilariAyir(vt: D1Database): Promise<void> {
  await vt.prepare(`UPDATE isletim_uyari SET durum='belirsiz',hata='SONUC_BELIRSIZ',kilit=NULL,kilit_bitis=NULL
    WHERE durum='gonderiliyor' AND kilit_bitis <= datetime('now')`).run();
}

export async function uyariyiGonder(
  vt: D1Database, ortam: TalepBildirimOrtami, anahtar: UyariAnahtari,
  olay: string, gonder: Gonderici = gonderici
): Promise<string> {
  const kilit = crypto.randomUUID();
  const kayit = await vt.prepare(`UPDATE isletim_uyari SET durum='gonderiliyor',deneme=deneme+1,
    kilit=?,kilit_bitis=datetime('now','+10 minutes') WHERE anahtar=? AND olay=? AND aktif=1
    AND durum IN ('bekliyor','basarisiz') AND deneme < ? AND sonraki <= datetime('now')
    RETURNING metin,deneme,acilis`).bind(kilit, anahtar, olay, AZAMI_DENEME)
    .first<{ metin: string; deneme: number; acilis: string }>();
  if (!kayit) return 'atlanmis';
  let tamam = false;
  let belirsiz = false;
  try {
    tamam = await gonder(ortam, `EDM — ${UYARI_BASLIKLARI[anahtar]}`,
      `${kayit.metin}\n\nBu sorun sürdüğü sürece uyarı tekrarlanmaz. Güncel durum ve gönderim sonucu:\nhttps://edmyapigayrimenkul.com/yonetim/uyarilar`);
  } catch {
    // Sağlayıcı kabul etmiş olabilir: otomatik tekrar mükerrer e-posta yaratır.
    belirsiz = true;
  }
  const durum = tamam ? 'gonderildi' : belirsiz ? 'belirsiz' : 'basarisiz';
  await vt.prepare(`UPDATE isletim_uyari SET durum=?,hata=?,kabul=CASE WHEN ?=1 THEN datetime('now') END,
    sonraki=datetime('now','+6 hours'),kilit=NULL,kilit_bitis=NULL
    WHERE anahtar=? AND olay=? AND kilit=? AND durum='gonderiliyor'`)
    .bind(durum, tamam ? null : belirsiz ? 'SONUC_BELIRSIZ' : ortam.EPOSTA ? 'GONDERIM_HATASI' : 'BAGLAMA_EKSIK',
      tamam ? 1 : 0, anahtar, olay, kilit).run();
  return durum;
}

export async function bekleyenUyarilariGonder(
  vt: D1Database, ortam: TalepBildirimOrtami, gonder: Gonderici = gonderici
): Promise<void> {
  await belirsizUyarilariAyir(vt);
  const siradaki = await vt.prepare(`SELECT anahtar,olay FROM isletim_uyari WHERE aktif=1
    AND durum IN ('bekliyor','basarisiz') AND deneme < ? AND sonraki <= datetime('now')
    ORDER BY acilis LIMIT 5`).bind(AZAMI_DENEME).all<{anahtar: UyariAnahtari; olay: string}>();
  for (const u of siradaki.results ?? []) await uyariyiGonder(vt, ortam, u.anahtar, u.olay, gonder);
}

export async function uyariyiYenidenDene(
  vt: D1Database, ortam: TalepBildirimOrtami, anahtar: UyariAnahtari, olay: string,
  gonder: Gonderici = gonderici
): Promise<string> {
  await belirsizUyarilariAyir(vt);
  const kayit = await vt.prepare(`UPDATE isletim_uyari SET durum='bekliyor',deneme=0,
    sonraki=datetime('now'),hata=NULL WHERE anahtar=? AND olay=? AND aktif=1
    AND durum IN ('basarisiz','belirsiz') RETURNING olay`).bind(anahtar, olay).first();
  return kayit ? uyariyiGonder(vt, ortam, anahtar, olay, gonder) : 'atlanmis';
}
