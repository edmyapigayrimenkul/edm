/**
 * İlan doğruluk teyitleri.
 *
 * Otomatik kalite kuralları bir çelişkiyi gösterebilir ama tapu belgesini,
 * malik beyanını veya bağımsız bölüm kimliğini doğrulayamaz. Bu katman;
 * işletmeden beklenen soruyu, alınan yanıtı ve düzeltme izini saklar.
 */

export const ILAN_TEYIT_SEMA = `
CREATE TABLE IF NOT EXISTS ilan_teyit (
  ilan_id       TEXT NOT NULL,
  sorun_kodu    TEXT NOT NULL,
  durum         TEXT NOT NULL DEFAULT 'bekliyor'
                CHECK (durum IN ('bekliyor', 'yanitlandi', 'tamamlandi')),
  yanit         TEXT NOT NULL DEFAULT '',
  kaynak        TEXT NOT NULL DEFAULT '',
  notu          TEXT NOT NULL DEFAULT '',
  teyit_eden    TEXT NOT NULL DEFAULT '',
  olusturma     TEXT NOT NULL,
  guncelleme    TEXT NOT NULL,
  PRIMARY KEY (ilan_id, sorun_kodu)
);
CREATE INDEX IF NOT EXISTS ilan_teyit_durum ON ilan_teyit (durum, guncelleme DESC);
`;

export type TeyitDurumu = 'bekliyor' | 'yanitlandi' | 'tamamlandi';
export type TeyitKategorisi = 'Tapu ve alan' | 'Kadastro' | 'Fiyat kapsamı' | 'Kullanım ve plan' | 'Mükerrer' | 'Fotoğraf';

export interface TeyitMaddesi {
  ilanId: string;
  /** Bir teyit birden fazla ilanı etkileyebilir (mükerrer adayı gibi). */
  etkilenenIlanIdleri: string[];
  kod: string;
  kategori: TeyitKategorisi;
  baslik: string;
  soru: string;
  beklenen: string;
  duzenlemeBolumu?: string;
}

export interface TeyitKaydi {
  ilan_id: string;
  sorun_kodu: string;
  durum: TeyitDurumu;
  yanit: string;
  kaynak: string;
  notu: string;
  teyit_eden: string;
  olusturma: string;
  guncelleme: string;
}

export const TEYIT_DURUMLARI: Array<{ deger: TeyitDurumu; etiket: string; aciklama: string }> = [
  { deger: 'bekliyor', etiket: 'Teyit bekliyor', aciklama: 'Danışman veya belge yanıtı henüz alınmadı.' },
  { deger: 'yanitlandi', etiket: 'Bilgi alındı', aciklama: 'Yanıt kaydedildi; gerekiyorsa ilan panelinde düzeltme bekliyor.' },
  { deger: 'tamamlandi', etiket: 'Konu kapandı', aciklama: 'İlan düzeltildi veya soru kanıtla açıklığa kavuştu.' },
];

export const ILAN_TEYIT_LISTESI: TeyitMaddesi[] = [
  {
    ilanId: '19538691', etkilenenIlanIdleri: ['19538691'], kod: 'tapu-turu', kategori: 'Tapu ve alan',
    baslik: 'Tapu türü çelişkisi',
    soru: 'Geçerli tapu türü “Hisseli Tapu” mu, “Kat İrtifakı” mı, başka bir tür mü?',
    beklenen: 'Tapu belgesindeki tür ve belgenin kontrol tarihi.', duzenlemeBolumu: 'teknik',
  },
  {
    ilanId: '19538691', etkilenenIlanIdleri: ['19538691'], kod: 'alan-kapsami-138', kategori: 'Tapu ve alan',
    baslik: '138 m² ölçünün kapsamı',
    soru: '138 m²; satılan hisse, toplam parsel, brüt yapı, net yapı veya başka hangi alanı ifade ediyor?',
    beklenen: 'Alan türü, doğrulanmış ölçü ve dayanak belge/beyan.', duzenlemeBolumu: 'teknik',
  },
  {
    ilanId: '19647778', etkilenenIlanIdleri: ['19647778'], kod: 'ada-parsel', kategori: 'Kadastro',
    baslik: 'Ada ve parsel çelişkisi',
    soru: 'Güncel resmi kayıt 83 ada 157 parsel mi, özelliklerdeki parsel 3 mü, yoksa farklı mı?',
    beklenen: 'Güncel ada ve parsel numarası ile kontrol edilen resmi kaynak.', duzenlemeBolumu: 'teknik',
  },
  {
    ilanId: '19647778', etkilenenIlanIdleri: ['19647778'], kod: 'toplam-parsel', kategori: 'Tapu ve alan',
    baslik: 'Toplam parsel alanı',
    soru: '173 m² satılan hisse ise taşınmazın toplam parsel alanı kaç m²?',
    beklenen: 'Toplam parsel alanı ve tapu/kadastro dayanağı.', duzenlemeBolumu: 'teknik',
  },
  {
    ilanId: '19294003', etkilenenIlanIdleri: ['19294003'], kod: 'oda-dagilimi', kategori: 'Kullanım ve plan',
    baslik: 'Oda dağılımı',
    soru: 'Konutun doğru oda düzeni nedir; başlıktaki 4+2 mi, açıklamadaki kat dağılımı mı?',
    beklenen: 'Toplam oda + salon sayısı ve katlara göre dağılım.', duzenlemeBolumu: 'teknik',
  },
  {
    ilanId: '19294003', etkilenenIlanIdleri: ['19294003'], kod: 'kullanim-durumu', kategori: 'Kullanım ve plan',
    baslik: 'Kullanım ve teslim durumu',
    soru: 'Taşınmaz şu anda boş mu, malik kullanımında mı, kiracılı mı; teslim koşulu nedir?',
    beklenen: 'Güncel kullanım durumu ve mümkün olan teslim zamanı.', duzenlemeBolumu: 'teknik',
  },
  {
    ilanId: '19672030', etkilenenIlanIdleri: ['19672030'], kod: 'kullanim-durumu', kategori: 'Kullanım ve plan',
    baslik: 'Kullanım ve teslim durumu',
    soru: 'Taşınmaz şu anda boş mu, malik kullanımında mı, kiracılı mı; “hemen teslim” doğru mu?',
    beklenen: 'Güncel kullanım durumu ve mümkün olan teslim zamanı.', duzenlemeBolumu: 'teknik',
  },
  {
    ilanId: '19889243', etkilenenIlanIdleri: ['19889243'], kod: 'kullanim-teslim', kategori: 'Kullanım ve plan',
    baslik: 'Kullanım ve teslim zamanı',
    soru: 'Kaynak ilanda “Mülk Sahibi Oturuyor” yazıyor; satışta taşınmaz ne zaman teslim edilebilir?',
    beklenen: 'Güncel kullanım durumu ve danışmanın doğruladığı teslim zamanı.', duzenlemeBolumu: 'teknik',
  },
  {
    ilanId: '19672030', etkilenenIlanIdleri: ['19672030'], kod: 'yapi-alanlari', kategori: 'Tapu ve alan',
    baslik: 'Net ve brüt yapı alanı',
    soru: 'Yapının doğrulanmış net ve brüt kullanım alanları kaç m²?',
    beklenen: 'Net ve brüt ölçüler; mümkünse proje, ekspertiz veya tapu eki dayanağı.', duzenlemeBolumu: 'teknik',
  },
  {
    ilanId: '19572827', etkilenenIlanIdleri: ['19572827'], kod: 'fiyat-kapsami', kategori: 'Fiyat kapsamı',
    baslik: 'Sekiz parselin fiyat kapsamı',
    soru: 'İlan fiyatı tek 312 m² parsel için mi, sekiz parselin tamamı için mi, başka bir pay için mi?',
    beklenen: 'Fiyatın kapsadığı parsel adedi, satılan alan ve tapu/hisse durumu.', duzenlemeBolumu: 'temel',
  },
  {
    ilanId: '19647602', etkilenenIlanIdleri: ['19647602'], kod: 'fiyat-kapsami', kategori: 'Fiyat kapsamı',
    baslik: 'Üç hissenin fiyat kapsamı',
    soru: 'İlan fiyatı tek hisse, üç hissenin tamamı veya taşınmazın bütünü için mi?',
    beklenen: 'Fiyatın kapsadığı hisse sayısı/oranı ve satılan toplam alan.', duzenlemeBolumu: 'temel',
  },
  {
    ilanId: '19751424', etkilenenIlanIdleri: ['19751424'], kod: 'fiyat-kapsami', kategori: 'Fiyat kapsamı',
    baslik: 'Tamamı veya yarısı ifadesi',
    soru: 'Kayıtlı fiyat 2.250 m² taşınmazın tamamına mı, yarısına mı, başka bir paya mı ait?',
    beklenen: 'Fiyatın kapsadığı pay ve satılan net alan.', duzenlemeBolumu: 'temel',
  },
  {
    ilanId: '19393771', etkilenenIlanIdleri: ['19393771'], kod: 'toplam-parsel', kategori: 'Tapu ve alan',
    baslik: 'Toplam parsel alanı',
    soru: '231 m² satılan hissenin bulunduğu taşınmazın toplam parsel alanı kaç m²?',
    beklenen: 'Toplam parsel alanı ve resmi kayıt dayanağı.', duzenlemeBolumu: 'teknik',
  },
  {
    ilanId: '18522916', etkilenenIlanIdleri: ['18522916', '18746132'], kod: 'bagimsiz-bolum', kategori: 'Mükerrer',
    baslik: 'İki ilan aynı daire mi?',
    soru: '18522916 ve 18746132 farklı bağımsız bölümler mi, aynı taşınmazın iki ilanı mı?',
    beklenen: 'Bağımsız bölüm/kapı bilgisi; aynıysa korunacak ana ilan kimliği.', duzenlemeBolumu: 'temel',
  },
  {
    ilanId: '18350489', etkilenenIlanIdleri: ['18350489'], kod: 'fotograf-seti', kategori: 'Fotoğraf',
    baslik: 'Fotoğraf seti eksik',
    soru: 'İç, dış, cephe ve temel mekânları gösteren güncel fotoğraf seti hazır mı?',
    beklenen: 'En az dört görünür fotoğraf; tercih edilen kapsamlı set panelden yüklenmeli.', duzenlemeBolumu: 'medya',
  },
  {
    ilanId: '19751424', etkilenenIlanIdleri: ['19751424'], kod: 'fotograf-seti', kategori: 'Fotoğraf',
    baslik: 'Fotoğraf seti eksik',
    soru: 'Parseli ve çevresini yeterli açılardan gösteren güncel fotoğraf seti hazır mı?',
    beklenen: 'En az dört görünür fotoğraf; tercih edilen kapsamlı set panelden yüklenmeli.', duzenlemeBolumu: 'medya',
  },
];

export function teyitAnahtari(ilanId: string, sorunKodu: string): string {
  return `${ilanId}:${sorunKodu}`;
}

export function teyitMaddesiniBul(ilanId: string, sorunKodu: string): TeyitMaddesi | undefined {
  return ILAN_TEYIT_LISTESI.find((madde) => madde.ilanId === ilanId && madde.kod === sorunKodu);
}

export function teyitGirdisiniDogrula(girdi: {
  ilanId: string;
  sorunKodu: string;
  durum: string;
  yanit: string;
  kaynak: string;
  notu: string;
}): { madde: TeyitMaddesi; durum: TeyitDurumu; yanit: string; kaynak: string; notu: string } {
  const madde = teyitMaddesiniBul(girdi.ilanId.trim(), girdi.sorunKodu.trim());
  if (!madde) throw new Error('Teyit maddesi tanınmıyor.');
  if (!['bekliyor', 'yanitlandi', 'tamamlandi'].includes(girdi.durum)) throw new Error('Teyit durumu geçersiz.');

  const durum = girdi.durum as TeyitDurumu;
  const yanit = girdi.yanit.trim().slice(0, 2_000);
  const kaynak = girdi.kaynak.trim().slice(0, 500);
  const notu = girdi.notu.trim().slice(0, 2_000);
  if (durum !== 'bekliyor' && !yanit) throw new Error('Bilgi alındığında doğrulanan yanıt yazılmalıdır.');
  if (durum === 'tamamlandi' && !kaynak) throw new Error('Konuyu kapatmak için belge veya teyit kaynağı yazılmalıdır.');
  return { madde, durum, yanit, kaynak, notu };
}

export async function teyitKayitlariniGetir(vt: D1Database): Promise<Map<string, TeyitKaydi>> {
  const sonuc = await vt.prepare(`SELECT * FROM ilan_teyit ORDER BY guncelleme DESC`).all<TeyitKaydi>();
  return new Map((sonuc.results ?? []).map((kayit) => [teyitAnahtari(kayit.ilan_id, kayit.sorun_kodu), kayit]));
}

export async function teyitKaydet(
  vt: D1Database,
  girdi: Parameters<typeof teyitGirdisiniDogrula>[0],
  teyitEden: string
): Promise<void> {
  const temiz = teyitGirdisiniDogrula(girdi);
  const zaman = new Date().toISOString();
  await vt.prepare(
    `INSERT INTO ilan_teyit
       (ilan_id, sorun_kodu, durum, yanit, kaynak, notu, teyit_eden, olusturma, guncelleme)
     VALUES (?,?,?,?,?,?,?,?,?)
     ON CONFLICT(ilan_id, sorun_kodu) DO UPDATE SET
       durum = excluded.durum, yanit = excluded.yanit, kaynak = excluded.kaynak,
       notu = excluded.notu, teyit_eden = excluded.teyit_eden, guncelleme = excluded.guncelleme`
  ).bind(
    temiz.madde.ilanId,
    temiz.madde.kod,
    temiz.durum,
    temiz.yanit,
    temiz.kaynak,
    temiz.notu,
    teyitEden.trim().toLowerCase().slice(0, 200),
    zaman,
    zaman
  ).run();
}

export function teyitOzeti(kayitlar: ReadonlyMap<string, TeyitKaydi>) {
  const durum = (madde: TeyitMaddesi) => kayitlar.get(teyitAnahtari(madde.ilanId, madde.kod))?.durum ?? 'bekliyor';
  return {
    toplam: ILAN_TEYIT_LISTESI.length,
    bekliyor: ILAN_TEYIT_LISTESI.filter((madde) => durum(madde) === 'bekliyor').length,
    yanitlandi: ILAN_TEYIT_LISTESI.filter((madde) => durum(madde) === 'yanitlandi').length,
    tamamlandi: ILAN_TEYIT_LISTESI.filter((madde) => durum(madde) === 'tamamlandi').length,
  };
}
