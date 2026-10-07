/**
 * Kaynak portaldaki doğrulanmış veri sorunları ve açık ilan ilişkileri.
 *
 * Bu kayıtlar D1 verisini değiştirmez. Portal her senkron olduğunda aynı hatalı
 * metnin geri gelmesini önler; panelden yapılan düzenlemeler yine daha üstündür.
 */

export interface KaynakSunumDuzeltmesi {
  baslik?: string;
  aciklama?: string;
  /** null, kaynak portalın hatalı alanını sunumdan tamamen çıkarır. */
  ozellikler?: Readonly<Record<string, string | null>>;
  gerekce: string;
}

const ARAPTEPE_SATILIK_ACIKLAMA = [
  'Selimpaşa Araptepe’de 463 m² arsa üzerinde bulunan, 320 m² net kullanım alanlı 7+2 ikiz villa satılıktır.',
  'Dört katlı villada iki salon, açık Amerikan mutfak ve dört banyo bulunur. Yeni yapı kombi doğalgazla ısınır; kat mülkiyetli, boş ve krediye uygundur.',
  'Geniş balkon ve terasları deniz ve doğa manzarasına açılır. Denize yaklaşık 200 metre, Silivri merkeze 7 km, TÜYAP’a 25 km ve İstanbul Havalimanı’na 40 km uzaklıktadır. Açık otopark alanı vardır.',
  'Aynı taşınmazın kiralama seçeneğini ilişkili ilan bölümünde inceleyebilirsiniz. Güncel fiyat ve müsaitlik için ilan numarasıyla teyit alın.',
].join('\n\n');

const ARAPTEPE_KIRALIK_ACIKLAMA = [
  'Selimpaşa Araptepe’de 463 m² arsa üzerinde bulunan, 320 m² net kullanım alanlı 7+2 ikiz villa aylık kiralıktır.',
  'Dört katlı villada iki salon, açık Amerikan mutfak ve dört banyo bulunur. Yeni yapı kombi doğalgazla ısınır; kat mülkiyetli ve boş durumdadır.',
  'Geniş balkon ve terasları deniz ve doğa manzarasına açılır. Denize yaklaşık 200 metre, Silivri merkeze 7 km, TÜYAP’a 25 km ve İstanbul Havalimanı’na 40 km uzaklıktadır. Açık otopark alanı vardır.',
  'Aynı taşınmazın satış seçeneğini ilişkili ilan bölümünde inceleyebilirsiniz. Güncel kira, depozito ve müsaitlik için ilan numarasıyla teyit alın.',
].join('\n\n');

const MIMAR_SINAN_KIRALIK_ACIKLAMA = [
  'Silivri Mimar Sinan Mahallesi’nde, iki bloklu site içerisinde bulunan deniz manzaralı 2+1 daire kiralıktır.',
  'Daire 110 m² brüt, 90 m² net kullanım alanına sahiptir. Beş katlı ve yaklaşık beş yaşındaki binanın üçüncü katındadır; yerden ısıtmalı, boş ve kapalı mutfaklıdır.',
  'İki balkondan biri geniş kullanımlıdır. Sitenin açık otoparkı ve kamelyaları bulunur. Silivri Devlet Hastanesi, alışveriş merkezi ve çarşıya araçla yaklaşık beş dakika mesafededir.',
  'Güncel kira, depozito ve müsaitlik için ilan numarasıyla teyit alın.',
].join('\n\n');

const MIMAR_SINAN_SATILIK_ACIKLAMA = [
  'Silivri Mimar Sinan Mahallesi’nde, iki bloklu site içerisinde bulunan 2+1 daire satılıktır.',
  'Daire 110 m² brüt, 90 m² net kullanım alanına sahiptir. Beş katlı ve yaklaşık üç yaşındaki binanın üçüncü katındadır; yerden ısıtmalı, kapalı mutfaklı ve iki balkonludur.',
  'Sitenin açık otoparkı ve kamelyaları bulunur. Kat mülkiyetli ve krediye uygun dairede kiracı oturmaktadır; teslim ve kira sözleşmesi seçenekleri teklif öncesinde teyit edilmelidir.',
  'Silivri Devlet Hastanesi, alışveriş merkezi ve çarşıya araçla yaklaşık beş dakika mesafededir. Güncel fiyat ve gösterim planı için ilan numarasıyla bilgi alın.',
].join('\n\n');

const KAYNAK_SUNUM_DUZELTMELERI: Readonly<Record<string, KaynakSunumDuzeltmesi>> = {
  '19673570': {
    baslik: 'Selimpaşa Araptepe’de Satılık Deniz Manzaralı 7+2 Villa',
    aciklama: ARAPTEPE_SATILIK_ACIKLAMA,
    ozellikler: { 'Arsa Alanı': '463 m²', 'Net Yapı Alanı': '320 m²' },
    gerekce: 'Kaynak kategori ve fiyatı satılık olduğu halde başlık ve açıklama kiralık yazılmış.',
  },
  '19797428': {
    baslik: 'Selimpaşa Araptepe’de Kiralık Deniz Manzaralı 7+2 Villa',
    aciklama: ARAPTEPE_KIRALIK_ACIKLAMA,
    ozellikler: { 'Arsa Alanı': '463 m²', 'Net Yapı Alanı': '320 m²' },
    gerekce: 'Satılık eş kayıtla aynı kaynak başlığını taşıyan kiralık seçenek ayrıştırıldı.',
  },
  '19802542': {
    baslik: 'Silivri Mimar Sinan’da Kiralık Deniz Manzaralı 2+1 Daire',
    aciklama: MIMAR_SINAN_KIRALIK_ACIKLAMA,
    ozellikler: { 'Site İçerisinde': 'Evet' },
    gerekce: 'Açıklama iki bloklu siteyi ve ortak alanları tarif ederken kaynak özelliği “Hayır” yazılmış.',
  },
  '18522916': {
    ozellikler: { 'Site İçerisinde': 'Evet' },
    gerekce: 'Kaynak açıklaması iki bloklu siteyi ve ortak alanları açıkça tarif ediyor.',
  },
  '18746132': {
    baslik: 'Silivri Mimar Sinan’da Satılık Yerden Isıtmalı 2+1 Daire',
    aciklama: MIMAR_SINAN_SATILIK_ACIKLAMA,
    ozellikler: { 'Site İçerisinde': 'Evet' },
    gerekce: 'Açıklama siteyi ve ortak alanları tarif ederken kaynak özelliği “Hayır” yazılmış; kaynak metni bitişik tekrarlar içeriyor.',
  },
  '18786051': {
    ozellikler: { 'Site İçerisinde': 'Evet' },
    gerekce: 'Başlık ve açıklama Basınkent 1 Sitesi’ni açıkça belirtirken kaynak özelliği “Hayır” yazılmış.',
  },
  '19736595': {
    ozellikler: { 'Site İçerisinde': 'Evet' },
    gerekce: 'Başlık, açıklama, aidat ve ortak havuz bilgileri siteyi doğrularken kaynak özelliği “Hayır” yazılmış.',
  },
  '18863103': {
    baslik: 'Edirne Meriç Olacak’ta Satılık Araç Takasına Uygun Tarla',
    gerekce: 'Kaynak başlığında kayıtlı satılık işlem türü yazmıyor.',
  },
  '18870737': {
    baslik: 'Selimpaşa’da Satılık Tam Müstakil 7+2 Havuzlu Tripleks Villa',
    ozellikler: { 'Brüt Metrekare': null, 'Arsa Alanı': '1.042 m²', 'Net Yapı Alanı': '220 m²' },
    gerekce: 'Kaynak açıklamasındaki 1.042 m² arsa ile 220 m² bina kullanım alanı ayrıştırıldı; başlığa işlem türü eklendi.',
  },
  '19294003': {
    baslik: 'Silivri Basınkent 2 Sitesi’nde Satılık Masrafsız 4+2 Tripleks Villa',
    gerekce: 'Kaynak başlığında kayıtlı satılık işlem türü yazmıyor.',
  },
  '18350489': {
    ozellikler: { 'Arsa Alanı': '280 m²' },
    gerekce: 'Kaynak açıklaması yapıyı 280 m² arsa üzerinde, yapı alanlarını ise ayrı ölçülerle tanımlıyor.',
  },
  '18754571': {
    ozellikler: { 'Arsa Alanı': '645 m²' },
    gerekce: 'Kaynak açıklaması villanın 645 m² arsa üzerinde olduğunu açıkça belirtiyor.',
  },
  '19393771': {
    baslik: 'Silivri Seymen’de Prefabrik Evli Tarladan Satılık 231 m² Hisse',
    ozellikler: { 'Metrekare': null, 'Satılan Hisse Alanı': '231 m²' },
    gerekce: 'Başlık ve açıklama 231 m² ölçünün toplam parsel değil satılan hisse olduğunu belirtiyor.',
  },
  '19447916': {
    baslik: 'Silivri Ortaköy’de 1.925 m² Arsa İçinde Satılık Lüks Villa',
    ozellikler: { 'Arsa Alanı': '1.925 m²' },
    gerekce: 'Kaynak açıklamasındaki arsa ölçüsü yapı alanından ayrıştırıldı; açık yazım hataları düzeltildi.',
  },
  '19538691': {
    baslik: 'Tekirdağ Marmaraereğlisi Sultanköy’de Satılık Villa Arsası',
    gerekce: 'Kaynak başlığındaki il adı düzeltildi. Çelişkili tapu türü işletme teyidi bekliyor.',
  },
  '19542358': {
    baslik: 'Silivri Merkez’de Kiralık 3+1 Daire',
    gerekce: 'Kaynak başlığı mülk türünü belirtmiyordu.',
  },
  '19594624': {
    baslik: 'Silivri Gümüşyaka’da Satılık İmara Bitişik Tarla',
    gerekce: 'Mahalle adı ve ekin yazımı düzeltildi.',
  },
  '19626868': {
    baslik: 'Silivri Gazitepe’de Satılık Konut İmarlı Arsa',
    gerekce: 'Mahalle adına gelen ekin yazımı düzeltildi.',
  },
  '19628182': {
    baslik: 'Silivri Merkez’de 185 m² Arsa İçinde Satılık Müstakil Ev',
    ozellikler: { 'Arsa Alanı': '185 m²' },
    gerekce: 'Kaynak açıklamasındaki arsa ölçüsü ayrıştırıldı; başlık ölçü türünü açıkça belirtiyor.',
  },
  '19647478': {
    baslik: 'Silivri Sancaktepe’de Satılık 2.119 m² Tarla Hissesi',
    ozellikler: { 'Metrekare': null, 'Toplam Parsel Alanı': '6.357 m²', 'Satılan Hisse Alanı': '2.119 m²' },
    gerekce: 'Kaynak açıklaması toplam araziyi 6.357 m², satılan hisseyi 2.119 m² olarak ayrı ayrı belirtiyor.',
  },
  '19672030': {
    baslik: 'Silivri Akören’de 1.924 m² İmarlı Arsa İçinde Satılık Müstakil Ev',
    ozellikler: { 'Brüt Metrekare': null, 'Net Metrekare': null, 'Arsa Alanı': '1.924 m²' },
    gerekce: 'Kaynak başlığı ve açıklamasında 1.924 m² arsa ölçüsüdür; yapı alanı için doğrulanmış sayı yoktur.',
  },
  '19745298': {
    baslik: 'Silivri Parkköy’de Satılık Panoramik Deniz Manzaralı Villa',
    gerekce: 'Kaynak başlığındaki yazım ve tekrarlar sadeleştirildi.',
  },
  '19764800': {
    baslik: 'Edirne Lalapaşa’da Satılık 15.741 m² Çiftlik Arazisi',
    gerekce: 'Yer adı, ölçü biçimi ve mülk tanımı açık biçimde yazıldı.',
  },
  '18863144': {
    baslik: 'Silivri Ortaköy’de Satılık Villa İmarlı Arsa',
    gerekce: 'Kaynak başlığındaki mahalle adı ve ekin yazımı düzeltildi.',
  },
  '19235531': {
    baslik: 'Silivri Merkez’de Satılık Masrafsız 2+1 Daire',
    gerekce: 'Konum ekinin yazımı ve başlık sırası düzenlendi.',
  },
  '19359208': {
    baslik: 'Silivri Merkez’de Satılık Kapalı Otoparklı 3+1 Daire',
    gerekce: 'Konum ekinin yazımı ve başlık sırası düzenlendi.',
  },
  '19414340': {
    baslik: 'Edirne Meriç Rahmanca’da Satılık Tarla',
    gerekce: 'Yer adına gelen ek düzeltildi; öznel “kupon” ifadesi kaldırıldı.',
  },
  '19418351': {
    baslik: 'Silivri Kavaklı’da Satılık Arsa',
    gerekce: 'Yer adına gelen ek düzeltildi; öznel “kupon” ifadesi kaldırıldı.',
  },
  '19594478': {
    baslik: 'Silivri Yeni Mahallesi’nde Acil Satılık Yatırımlık Tarla',
    gerekce: 'Mahalle adı ve ekin yazımı düzeltildi.',
  },
  '19594575': {
    baslik: 'Silivri Alipaşa’da Kuzey Marmara Otoyolu Üzerinde Satılık Tarla',
    gerekce: 'Konum ve yol adı açık biçimde yazıldı.',
  },
  '19627384': {
    baslik: 'Silivri Merkez’de Kiralık Kapalı Otoparklı Asansörlü 3+1 Daire',
    gerekce: 'Konum ekinin yazımı ve başlık sırası düzenlendi.',
  },
  '19751424': {
    baslik: 'Silivri Seymen’de Ana Yola Cepheli 1/2 Hisseli Satılık Tarla',
    ozellikler: { 'Toplam Parsel Alanı': '2.250 m²' },
    gerekce: 'Yer adı ve yazım düzeltildi; tamamı veya yarısı teklif edilen 2.250 m² parselin hisse alanı seçime bağlı bırakıldı.',
  },
  '19647778': {
    baslik: 'Silivri Yeni Mahalle’de Satılık 173 m² Arsa Hissesi',
    ozellikler: { 'Metrekare': null, 'Satılan Hisse Alanı': '173 m²' },
    gerekce: 'Kaynak açıklaması 316 m² eski hissenin imar sonrası kalan 173 m² olduğunu belirtiyor; toplam parsel bilinmiyor.',
  },
  '19647602': {
    ozellikler: { 'Toplam Parsel Alanı': '367 m²' },
    gerekce: 'Kaynak açıklaması 367 m² değerini toplam arsa alanı olarak veriyor; üç hisseli satışın tek hisse alanı belirtilmiyor.',
  },
};

/** Aynı fiziksel taşınmazın farklı işlem seçenekleri. İlişki çift yönlüdür. */
const ILISKILI_ILANLAR: Readonly<Record<string, readonly string[]>> = {
  '19673570': ['19797428'],
  '19797428': ['19673570'],
};

/**
 * Aynı taşınmaz için yeniden açılmış eski portal kaydı -> gösterilecek ana kayıt.
 * Eski kayıt D1'den silinmez; geçmiş bağlantılar ana ilana yönlendirilir.
 */
const MUKERRER_KANONIK: Readonly<Record<string, string>> = {
  '19303282': '19290394',
};

export function kaynakSunumDuzeltmesi(id: string): KaynakSunumDuzeltmesi | undefined {
  return KAYNAK_SUNUM_DUZELTMELERI[id];
}

/** Kaynak alan düzeltmesini, null işaretli hatalı alanları silerek uygular. */
export function kaynakOzellikleriniUygula(
  ozellikler: Record<string, string>,
  duzeltme?: KaynakSunumDuzeltmesi
): Record<string, string> {
  const sonuc = { ...ozellikler };
  for (const [anahtar, deger] of Object.entries(duzeltme?.ozellikler ?? {})) {
    if (deger == null) delete sonuc[anahtar];
    else sonuc[anahtar] = deger;
  }
  return sonuc;
}

export function iliskiliIlanIdleri(id: string): readonly string[] {
  return ILISKILI_ILANLAR[id] ?? [];
}

export function mukerrerKanonikId(id: string): string | null {
  return MUKERRER_KANONIK[id] ?? null;
}

/** Aynı fiziksel taşınmazın fiyat/alan istatistiklerinde kullanacağı tek anahtar. */
export function tasinmazGrupAnahtari(id: string): string {
  const kanonik = mukerrerKanonikId(id) ?? id;
  const iliskililer = iliskiliIlanIdleri(kanonik);
  return [kanonik, ...iliskililer].sort()[0];
}

/** Ana kayıt kaynakta yoksa eski kaydı görünür bırakır; portföy tümden kaybolmaz. */
export function gorunurIlanIdleri(ids: Iterable<string>): Set<string> {
  const mevcut = new Set(ids);
  return new Set(
    [...mevcut].filter((id) => {
      const kanonik = mukerrerKanonikId(id);
      return !kanonik || !mevcut.has(kanonik);
    })
  );
}
