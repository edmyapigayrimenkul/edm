/** Günlük UTC sayaçlarından Türkiye saatine göre dönüşüm oranı üretilemez. */
const GUN = 86_400_000;
const TR_FARKI = 3 * 3_600_000;
const gunYaz = (tarih: number) => new Date(tarih).toISOString().slice(0, 10);

export function gostergeDonemi(ham: string | null, simdi = new Date()) {
  const bugunTR = gunYaz(simdi.getTime() + TR_FARKI);
  const secilen = ham || bugunTR;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(secilen)) throw new Error('Geçerli bir tarih seçin.');
  const zaman = Date.parse(`${secilen}T00:00:00Z`);
  if (!Number.isFinite(zaman) || gunYaz(zaman) !== secilen || secilen < '2000-01-01' || secilen > bugunTR) {
    throw new Error('Geçmişten veya bugünden geçerli bir tarih seçin.');
  }
  const pazartesi = zaman - ((new Date(zaman).getUTCDay() + 6) % 7) * GUN;
  const bitis = pazartesi + 7 * GUN;
  const mevcutPazartesi = Date.parse(`${bugunTR}T00:00:00Z`) - ((new Date(`${bugunTR}T00:00:00Z`).getUTCDay() + 6) % 7) * GUN;
  return {
    hafta: gunYaz(pazartesi), secilen, sonGun: gunYaz(bitis - GUN), bugunTR,
    bugunUTC: gunYaz(simdi.getTime()), simdiUTC: simdi.toISOString(),
    baslangicUTC: new Date(pazartesi - TR_FARKI).toISOString(),
    bitisUTC: new Date(Math.min(bitis - TR_FARKI, simdi.getTime())).toISOString(),
    utcBitisGun: gunYaz(bitis),
    onceki: gunYaz(pazartesi - 7 * GUN) >= '2000-01-01' ? gunYaz(pazartesi - 7 * GUN) : null,
    sonraki: pazartesi < mevcutPazartesi ? gunYaz(bitis) : null,
    devamEdiyor: pazartesi === mevcutPazartesi,
    gunler: Array.from({ length: 7 }, (_, i) => gunYaz(pazartesi + i * GUN)),
  };
}
export type GostergeDonemi = ReturnType<typeof gostergeDonemi>;
type Gunluk = { gun: string; adet: number };
type Durum = { durum: string; adet: number };
type Kaynak = { kaynak: string; adet: number };
type Sorumlu = { slug: string | null; ad: string | null; adet: number; geciken: number };
type Takip = { acik: number; sahipsiz: number; plansiz: number; geciken: number; eski_yeni: number };

export async function isletmeGostergeleriniAl(vt: D1Database, donem: GostergeDonemi) {
  // Tek batch içindeki okumalar aynı veritabanı anını kullanır. İsim/telefon,
  // mesaj, IP ve serbest kaynak adresi bu rapora taşınmaz.
  const aralik = 'julianday(olusturma)>=julianday(?) AND julianday(olusturma)<julianday(?)';
  const sonuc = await vt.batch([
    vt.prepare(`SELECT durum,COUNT(*) AS adet FROM talepler WHERE ${aralik} GROUP BY durum`)
      .bind(donem.baslangicUTC, donem.bitisUTC),
    vt.prepare(`SELECT date(olusturma,'+3 hours') AS gun,COUNT(*) AS adet FROM talepler WHERE ${aralik} GROUP BY gun`)
      .bind(donem.baslangicUTC, donem.bitisUTC),
    vt.prepare(`SELECT CASE WHEN kaynak='/iletisim' THEN 'İletişim' WHEN kaynak='/degerleme' THEN 'Değerleme'
      WHEN kaynak GLOB '/ilan/*' THEN 'İlan sayfası' ELSE 'Diğer / bilinmiyor' END AS kaynak,
      COUNT(*) AS adet FROM talepler WHERE ${aralik} GROUP BY 1 ORDER BY adet DESC,kaynak`)
      .bind(donem.baslangicUTC, donem.bitisUTC),
    vt.prepare(`SELECT gun,SUM(adet) AS adet FROM goruntulenme WHERE gun>=? AND gun<? AND gun<=? GROUP BY gun ORDER BY gun`)
      .bind(donem.hafta, donem.utcBitisGun, donem.bugunUTC),
    vt.prepare(`SELECT e.slug,e.ad,COUNT(*) AS adet,
      SUM(CASE WHEN julianday(t.takip_tarihi)<=julianday(?) THEN 1 ELSE 0 END) AS geciken
      FROM talepler t LEFT JOIN ekip e ON e.slug=t.sorumlu_slug WHERE t.durum<>'kapandi'
      GROUP BY e.slug,e.ad ORDER BY adet DESC,e.ad`).bind(donem.simdiUTC),
    vt.prepare(`SELECT COUNT(*) AS acik,
      COALESCE(SUM(CASE WHEN e.slug IS NULL THEN 1 ELSE 0 END),0) AS sahipsiz,
      COALESCE(SUM(CASE WHEN t.takip_tarihi IS NULL THEN 1 ELSE 0 END),0) AS plansiz,
      COALESCE(SUM(CASE WHEN julianday(t.takip_tarihi)<=julianday(?) THEN 1 ELSE 0 END),0) AS geciken,
      COALESCE(SUM(CASE WHEN t.durum='yeni' AND julianday(t.olusturma)<=julianday(?)-1 THEN 1 ELSE 0 END),0) AS eski_yeni
      FROM talepler t LEFT JOIN ekip e ON e.slug=t.sorumlu_slug WHERE t.durum<>'kapandi'`)
      .bind(donem.simdiUTC, donem.simdiUTC),
  ]);
  if (sonuc.some(s => !s.success)) throw new Error('Göstergeler okunamadı.');
  const durumlar = sonuc[0].results as unknown as Durum[];
  const talepler = sonuc[1].results as unknown as Gunluk[];
  const goruntulenmeler = sonuc[3].results as unknown as Gunluk[];
  const gunSay = (satirlar: Gunluk[], gun: string, bugun: string) => gun > bugun ? null : (satirlar.find(s => s.gun === gun)?.adet ?? 0);
  return {
    toplamTalep: durumlar.reduce((toplam, s) => toplam + s.adet, 0),
    durumlar,
    kaynaklar: sonuc[2].results as unknown as Kaynak[],
    goruntulenme: goruntulenmeler.reduce((toplam, s) => toplam + s.adet, 0),
    gunler: donem.gunler.map(gun => ({ gun, talep: gunSay(talepler, gun, donem.bugunTR), goruntulenme: gunSay(goruntulenmeler, gun, donem.bugunUTC) })),
    sorumlular: sonuc[4].results as unknown as Sorumlu[],
    takip: sonuc[5].results[0] as unknown as Takip,
  };
}
