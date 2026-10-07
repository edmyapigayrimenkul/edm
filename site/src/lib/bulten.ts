/**
 * bulten.ts — EDM Bülten & Piyasa Analizleri Veri Katmanı
 * Sektörel haberleri, piyasa analizlerini ve hukuki yorumları
 * web formatında zengin makale olarak sunar.
 */

import type { SiteIcerikKaydi } from './icerik-yayini';

export interface BultenYazisi {
  slug: string;
  baslik: string;
  spot: string;
  kategori: string;
  tarih: string;
  tarihIso: string;
  okunmaSuresi: string;
  yazar: string;
  gorsel: string;
  yasalDayanak?: string;
  vurguKutusu?: {
    baslik: string;
    metin: string;
    tur: 'dikkat' | 'bilgi' | 'oneri';
  };
  paragraflar: string[];
  maddeler?: {
    baslik: string;
    aciklama: string;
  }[];
  etiketler: string[];
  kaynaklar: Array<{ ad: string; url: string }>;
  /** Metnin son güncelleme tarihi; tek başına hukukî doğrulama anlamına gelmez. */
  guncellemeTarihi: string;
  /** Somut dosyaya uygulanmaması gereken, okuyucuya açık kapsam sınırı. */
  kapsamNotu: string;
  /** postEDM'de yer alan özgün sosyal paylaşım bağlantıları. */
  sosyalBaglantilar?: Array<{ ad: string; url: string }>;
}

export const BILGI_MERKEZI_KAPSAM_NOTU =
  'Bu içerik genel bilgilendirme içindir; somut işlem, süre, oran ve idari uygulama taşınmazın niteliğine, tarihe ve dosyanın koşullarına göre değişebilir. EDM hukuk, vergi veya yatırım tavsiyesi vermez. İşlemden önce güncel birincil kaynağı ve yetkili uzmanı kontrol edin.';

/** Eski statik metinler inceleme sırasında saklanır; doğrudan yayına çıkmaz. */
export const BULTEN_INCELEME_TASLAKLARI: BultenYazisi[] = [
  {
    slug: 'tapuda-satis-bedelini-dusuk-gostermenin-riskleri',
    baslik: 'Tapuda Satış Bedelini Düşük Göstermek: Harç ve Ceza Riski',
    spot: 'Tapu harcı hesabında gerçek devir bedeli esastır. Düşük beyan tespit edilirse eksik harç ve vergi ziyaı cezası gündeme gelebilir.',
    kategori: 'Tapu & Hukuk',
    tarih: '16 Eylül 2026',
    tarihIso: '2026-09-16',
    okunmaSuresi: '4 dk okuma',
    yazar: 'EDM Bilgi Merkezi',
    gorsel: '/marka/og-varsayilan.png',
    yasalDayanak: '492 Sayılı Harçlar Kanunu; VUK md. 371',
    vurguKutusu: {
      tur: 'dikkat',
      baslik: 'Gerçek Bedel Beyanı Esastır',
      metin: 'Gelir İdaresi, gerçek devir bedelinin veya emlak vergisi değerinin altında beyan tespit edilirse eksik harcın bir kat vergi ziyaı cezasıyla alıcı ve satıcıdan istenebileceğini belirtir. Somut hesap ve başvuru yolu için güncel idare açıklaması kontrol edilmelidir.',
    },
    paragraflar: [
      'Gayrimenkul alım satımında tapu harcı için gerçek devir bedeli beyan edilmelidir. Belediyenin belirlediği emlak vergisi değeri, gerçek satış bedelinin yerine geçmez.',
      'Gelir İdaresi, beyan edilen devir bedelinin gerçek durumu yansıtmadığının veya emlak vergisi değerinin altında kaldığının tespitinde eksik harcın bir kat vergi ziyaı cezasıyla alıcı ve satıcıdan alınacağını açıklar. Somut vergi hesabı ve süreler işlem tarihine göre değişebileceğinden güncel idare duyurusu kontrol edilmelidir.',
      'Gelir İdaresi açıklamasına göre tapu harcı, gerçek devir bedeli üzerinden alıcıdan ve satıcıdan ayrı ayrı binde 20 oranında alınır. Gerçek bedel emlak vergisi değerinin altındaysa harç hesabında emlak vergisi değeri kullanılır.',
      'Eksik beyanı kendiliğinden vergi dairesine bildirenler için, koşulları sağlanıyorsa Vergi Usul Kanunu 371 kapsamında pişmanlık hükümlerinden yararlanma imkânı bulunabilir. İşlem tarihindeki güncel kuralları vergi dairesiyle teyit edin.',
    ],
    maddeler: [
      {
        baslik: '1. Gerçek Bedeli Belgeleyin',
        aciklama: 'Tapu beyanı, ödeme belgeleri ve sözleşme arasındaki farkları işlem öncesinde mali müşaviriniz veya tapu işlem yetkilinizle değerlendirin.',
      },
      {
        baslik: '2. Pişmanlık Hükmünü Doğrulayın',
        aciklama: 'Gelir İdaresi, belirli koşullarda VUK 371 kapsamında pişmanlık hükümlerinden yararlanılabileceğini belirtir. Uygunluk ve sonuç için vergi dairesinden veya mali müşavirden teyit alın.',
      },
    ],
    etiketler: ['Tapu Harcı', 'Vergi Ziyaı', 'Gayrimenkul Hukuku', 'Silivri Emlak'],
    guncellemeTarihi: '2026-09-24',
    kapsamNotu: BILGI_MERKEZI_KAPSAM_NOTU,
    kaynaklar: [
      { ad: 'Gelir İdaresi Başkanlığı — Gayrimenkul Alım-Satımında Tapu Harcı', url: 'https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv/yardim-kaynaklar/infografikler/pdfs/tapuharci.pdf' },
    ],
  },
  {
    slug: 'kentsel-donusumde-uzlasmazsaniz-ne-olur-haklariniz-ve-surecler',
    baslik: 'Riskli Yapıda Çoğunluk Kararına Katılmayan Maliki Ne Bekler?',
    spot: '6306 sayılı Kanun, hisse oranına göre salt çoğunlukla alınan kararın nasıl bildirileceğini ve karara katılmayan malikin arsa payı için satış sürecini düzenler.',
    kategori: 'Kentsel Dönüşüm',
    tarih: '15 Eylül 2026',
    tarihIso: '2026-09-15',
    okunmaSuresi: '5 dk okuma',
    yazar: 'EDM Bilgi Merkezi',
    gorsel: '/marka/og-varsayilan.png',
    yasalDayanak: '6306 sayılı Kanun md. 6/1',
    vurguKutusu: {
      tur: 'oneri',
      baslik: 'Çoğunluk Hisse Oranıyla Hesaplanır',
      metin: 'Maliklerin sayısı değil, sahip oldukları hisseler esas alınır. Karara katılmayan malikin payının satışı için kararın ve teklifin bildirilmesi ile kanundaki süre ve satış adımlarının uygulanması gerekir.',
    },
    paragraflar: [
      '6306 sayılı Kanun kapsamındaki yeni uygulamada karar, maliklerin kişi sayısına göre değil hisseleri oranında paydaşların salt çoğunluğu ile alınır. Riskli yapının tespiti, yeni uygulama kararı ve arsa payı satışı birbirinden ayrı aşamalardır.',
      'Kanuna göre çoğunluk kararını ve anlaşma şartlarını içeren teklif veya teklifin incelenebileceği yer, karara katılmayan malike noter aracılığıyla ya da ilgili muhtarlıkta 15 gün ilan edilerek bildirilir. Muhtarlık ilanında son gün bildirim yapılmış sayılır. Bildirimden itibaren 15 gün içinde teklifin incelenmemesi veya kabul edilmemesi durumunda arsa payının satışa konu olabileceği de bildirilir. Bu süreyi riskli yapı tespitine itiraz süresiyle karıştırmayın.',
      'Koşullar gerçekleşirse arsa payı, Başkanlıkça tespit ettirilen rayiç değerden az olmamak üzere önce anlaşan diğer paydaşlara açık artırmayla sunulur. Riskli yapılarda paydaşlara satış gerçekleşmezse satış işlemi, kanundaki koşullarla üçüncü kişilere satış yapılıncaya kadar tekrarlanır; pay kendiliğinden Hazineye geçmez.',
      'Satış bedeli, taşınmazın üzerindeki ipotek ve benzeri haklar ile olası hukuki başvurular dosyaya göre ayrıca değerlendirilir. Değerleme ve bildirim belgelerini incelemeden hak veya süre konusunda kesin sonuca varmayın.',
    ],
    maddeler: [
      {
        baslik: '1. Kararın Kapsamını ve Hisse Oranlarını Kontrol Edin',
        aciklama: 'Riskli yapı kararı, yeni uygulama kararı ve pay satışı işlemlerini ayırın; çoğunluğun hangi hisselerle sağlandığını gösteren belgeleri isteyin.',
      },
      {
        baslik: '2. Teklifi ve Bildirim Tarihini Belgeleyin',
        aciklama: 'Karar, teklif ve noter bildirimi veya muhtarlık ilanını temin edin. Teklifi incelemek/kabul etmek için verilen 15 günü somut bildirim tarihine göre hesaplayın.',
      },
      {
        baslik: '3. Değerleme ve Satış Belgelerini İnceletin',
        aciklama: 'Rayiç değer tespiti ve satış duyurusunu ilgili idareden isteyin. Usul veya bedel konusunda uyuşmazlık varsa başvuru yolunu ve süresini somut işlem için bir hukuk uzmanıyla değerlendirin.',
      },
    ],
    etiketler: ['Kentsel Dönüşüm', '6306 Sayılı Kanun', 'Riskli Yapı', 'Açık Artırma', 'Arsa Payı Satışı'],
    guncellemeTarihi: '2026-09-24',
    kapsamNotu: BILGI_MERKEZI_KAPSAM_NOTU,
    kaynaklar: [{ ad: 'Kentsel Dönüşüm Başkanlığı — 6306 sayılı Kanun md. 6', url: 'https://kdb.gov.tr/files/mevzuatdosya/2025581301335809.pdf' }],
  },
  {
    slug: 'on-yilini-dolduran-kiraci-tahliye-rehberi-tbk-347',
    baslik: 'On Yıllık Uzama Süresi Dolan Kirada Bildirim Nasıl İşler?',
    spot: 'Türk Borçlar Kanunu 347. maddesi, konut ve çatılı işyeri kiralarında on yıllık uzama süresinden sonraki fesih bildirimini düzenler. Sözleşme türü, uzama yılları ve yazılı bildirim birlikte incelenmelidir.',
    kategori: 'Kira & Tahliye',
    tarih: '14 Eylül 2026',
    tarihIso: '2026-09-14',
    okunmaSuresi: '4 dk okuma',
    yazar: 'EDM Bilgi Merkezi',
    gorsel: '/marka/og-varsayilan.png',
    yasalDayanak: 'Türk Borçlar Kanunu md. 347–348',
    vurguKutusu: {
      tur: 'bilgi',
      baslik: 'Sözleşme ve Uzama Yıllarını Ayrı Sayın',
      metin: 'Belirli süreli sözleşmede ilk süre ile on yıllık uzama süresi ayrı değerlendirilir. Kanun, bu süreyi izleyen uzama yıllarının bitiminden en az üç ay önce bildirim koşulunu ve yazılı şekli düzenler.',
    },
    paragraflar: [
      'Konut ve çatılı işyeri kirasında sadece belirli sözleşme süresinin bitmesi, kiraya verene sözleşmeyi bitirme hakkı vermez. TBK 347, kiracı süresinde bildirim yapmadığında sözleşmenin aynı koşullarla birer yıl uzayacağını belirtir.',
      'Belirli süreli sözleşmede on yıllık uzama süresi tamamlandıktan sonra kiraya veren, bunu izleyen her uzama yılının bitiminden en az üç ay önce bildirimde bulunarak sebep göstermeden sözleşmeyi sona erdirebilir. Belirsiz süreli sözleşmeler için kanunda ayrıca bir kural vardır; her dosyada aynı takvim uygulanmaz.',
      'TBK 348, konut ve çatılı işyeri kirasında fesih bildiriminin yazılı olmasını şart koşar. Kanun metni yalnız noter yolunu zorunlu kılmaz. Bildirimin içeriği ve karşı tarafa ulaştığının ispatı uyuşmazlıkta önem taşır; somut takvimi uzmanla kontrol etmek gerekir.',
    ],
    maddeler: [
      {
        baslik: '1. Yazılı Bildirim ve İspat',
        aciklama: 'Kanundaki şekil şartı yazılı bildirimdir. İçerik, gönderim ve teslim tarihini belgeleyebileceğiniz yöntemi seçin.',
      },
      {
        baslik: '2. Takvimi Sözleşmeye Göre Hesaplayın',
        aciklama: 'İlk süre, uzama yılları ve bildirim tarihini sözleşme üzerinden tek tek hesaplayın; dava yolu ve usulü somut olayda ayrıca değerlendirin.',
      },
      {
        baslik: '3. Kanuni Koşulları Birlikte Okuyun',
        aciklama: 'TBK 347 kapsamında sebep gösterilmemesi mümkündür; ancak on yıllık uzama ve usulüne uygun bildirim koşulları birlikte sağlanmalıdır.',
      },
    ],
    etiketler: ['TBK 347', 'Kira Hukuku', 'Tahliye Davası', 'Ev Sahibi Kiracı', 'Noter İhtarnamesi'],
    guncellemeTarihi: '2026-09-24',
    kapsamNotu: BILGI_MERKEZI_KAPSAM_NOTU,
    kaynaklar: [{ ad: 'Adalet Bakanlığı — Türk Borçlar Kanunu md. 347–348', url: 'https://mgm.adalet.gov.tr/Resimler/SayfaDokuman/181020191500286098.pdf' }],
  },
  {
    slug: 'hisseli-tapuda-satis-ve-sufa-onalim-hakki-davasi',
    baslik: 'Hisseli Tapuda Satış ve Şufa (Önalım) Hakkı: Paranızı ve Mülkünüzü Kaybetmeyin',
    spot: 'Hisseli bir taşınmazda payınızı üçüncü bir kişiye satarken diğer paydaşlara noterden bildirimde bulunmazsanız, paydaşlar 2 yıl içinde dava açarak mülkü tapu bedeli üzerinden geri alabilir.',
    kategori: 'Tapu & Hukuk',
    tarih: '12 Eylül 2026',
    tarihIso: '2026-09-12',
    okunmaSuresi: '5 dk okuma',
    yazar: 'EDM Tapu Masası',
    gorsel: '/marka/og-varsayilan.png',
    yasalDayanak: 'Türk Medeni Kanunu (TMK) md. 732, 733, 734',
    vurguKutusu: {
      tur: 'dikkat',
      baslik: 'Fiili Taksim Varsa Şufa Hakkı Kullanılamaz',
      metin: 'Yargıtay içtihatlarına göre paydaşlar arsa veya tarlayı kendi aralarında fiilen bölüşmüş ve her biri kendi bölümünü çit/tel ile ayırarak kullanıyorsa, paydaşlardan birinin satışına karşı diğerleri şufa davası açamaz.',
    },
    paragraflar: [
      'Trakya bölgesinde arsa ve tarla yatırımı yapanların en sık karşılaştığı mülkiyet türü hisseli tapudur (müşterek mülkiyet). Hisseli bir gayrimenkulden pay satın almak cazip fırsatlar sunabilse de, Medeni Kanun’un tanıdığı Yasal Önalım (Şufa) Hakkı bilinmediğinde büyük bir felakete dönüşebilir.',
      'Şufa hakkı, bir paydaşın hissesini yabancı birine satması durumunda diğer paydaşlara aynı şartlarla o hisseyi öncelikle satın alma hakkı tanır. Satış gerçekleştikten sonra alıcı veya satıcı, diğer tüm paydaşlara noter kanalıyla satışı bildirmek zorundadır.',
      'Noter bildirimi yapılmışsa diğer hissedarların 3 ay, noter bildirimi yapılmamışsa her halükarda satış tarihinden itibaren 2 yıl içinde Asliye Hukuk Mahkemesi’nde şufa davası açma hakkı vardır. Mahkeme, tapuda yazılı satış bedeli ile tapu harcını alıcıya ödeterek mülkiyetin davacı hissedara geçmesine hükmeder.',
    ],
    maddeler: [
      {
        baslik: '1. Satış Öncesi Noter İhtarı veya Feragatname',
        aciklama: 'Satıştan önce diğer hissedarlardan noter onaylı "Önalım Hakkından Feragat Sözleşmesi" almak en güvenli yoldur.',
      },
      {
        baslik: '2. Akraba İçi Bağış ve Trampa İstisnası',
        aciklama: 'Hisseler arasında trampa (takas) yapıldığında veya doğrudan mirasçılara devredildiğinde şufa hakkı işlemez.',
      },
      {
        baslik: '3. Tapu Bedelini Tam Gösterme Zorunluluğu',
        aciklama: 'Eğer şufa davası açılırsa alıcıya ödenecek para tapudaki resmi bedeldir. Eksik gösterilen her kuruş davayı kazanan hissedarın kârı olur.',
      },
    ],
    etiketler: ['Hisseli Tapu', 'Şufa Davası', 'Önalım Hakkı', 'TMK 732', 'Silivri Arsa'],
    guncellemeTarihi: '2026-09-23',
    kapsamNotu: BILGI_MERKEZI_KAPSAM_NOTU,
    kaynaklar: [{ ad: 'Mevzuat Bilgi Sistemi — Türk Medeni Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.4721.pdf' }],
  },
  {
    slug: 'ifraz-ve-tevhid-nedir-arazide-deger-artiran-islemler',
    baslik: 'İfraz ve Tevhid Nedir? Arazide Değer Artıran İmar Operasyonları',
    spot: 'Tek bir büyük parseli bağımsız parçalara ayırmak (ifraz) veya komşu parselleri tek bir büyük inşaat alanında birleştirmek (tevhid), taşınmazın piyasa değerini ve imar kabiliyetini doğrudan katlar.',
    kategori: 'İmar & Arsa',
    tarih: '10 Eylül 2026',
    tarihIso: '2026-09-10',
    okunmaSuresi: '4 dk okuma',
    yazar: 'EDM İmar & Şehircilik Masası',
    gorsel: '/marka/og-varsayilan.png',
    yasalDayanak: '3194 Sayılı İmar Kanunu md. 15 ve 16',
    vurguKutusu: {
      tur: 'oneri',
      baslik: 'Yola Cephe ve Minimum Parsel Büyüklüğü',
      metin: 'İfraz işlemi yapılabilmesi için ayrılan her bir parselin mutlaka kadastral yola cephesinin bulunması ve belediye imar planındaki minimum parsel genişliği ile alan şartını sağlaması zorunludur.',
    },
    paragraflar: [
      'Yatırımcılar ve arsa sahipleri için bir parselin imar durumunu en verimli hale getirmenin iki temel mühendislik yolu ifraz ve tevhiddir.',
      'İfraz (ayırma), tapu kütüğünde tek parsel olarak kayıtlı bir taşınmazın harita mühendislerince hazırlanan teknik plan doğrultusunda birden fazla bağımsız parsele bölünmesidir. Özellikle müstakil villa arsaları veya sanayi parselleri oluştururken ifraz işlemi arsanın birim metrekare değerini ciddi oranda yükseltir.',
      'Tevhid (birleştirme) ise birbirine bitişik birden fazla parselin tek bir tapu altında toplanmasıdır. Bitişik parseller birleştiğinde taban oturum alanı (TAKS) ve toplam inşaat hakkı (KAKS) daha verimli kullanılarak daha büyük, otoparklı ve sosyal donatılı projeler üretilebilir.',
    ],
    maddeler: [
      {
        baslik: '1. Kadastro ve Belediye Encümen Onayı',
        aciklama: 'İfraz ve tevhid işlemleri lisanslı harita bürosu (LİHKAB) tarafından hazırlanır ve Belediye Encümeni onayıyla Tapu Müdürlüğü’nde tescil edilir.',
      },
      {
        baslik: '2. Tarım Arazilerinde Bölünme Kısıtları',
        aciklama: '5403 sayılı Toprak Koruma Kanunu uyarınca tarım arazileri belirlenen asgari büyüklüklerin altında ifraz edilemez (mutlak tarım arazilerinde 20 dönüm sınırı).',
      },
      {
        baslik: '3. Terk ve Kamuya Ayrılan Alanlar',
        aciklama: 'İfraz sırasında imar planına göre yola, yeşil alana veya parka isabet eden kısımlar kamuya bedelsiz terk edilir.',
      },
    ],
    etiketler: ['İfraz', 'Tevhid', 'İmar Kanunu', 'Parselasyon', 'Kadastro', 'Arsa Yatırımı'],
    guncellemeTarihi: '2026-09-23',
    kapsamNotu: BILGI_MERKEZI_KAPSAM_NOTU,
    kaynaklar: [
      { ad: 'Mevzuat Bilgi Sistemi — İmar Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.3194.pdf' },
      { ad: 'Mevzuat Bilgi Sistemi — Toprak Koruma ve Arazi Kullanımı Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.5403.pdf' },
    ],
  },
];

/** İddiaları birincil kaynakla karşılaştırılmış statik yazılar. */
const ONAYLI_STATIK_BULTEN_SLUGLARI = new Set([
  'tapuda-satis-bedelini-dusuk-gostermenin-riskleri',
  'kentsel-donusumde-uzlasmazsaniz-ne-olur-haklariniz-ve-surecler',
  'on-yilini-dolduran-kiraci-tahliye-rehberi-tbk-347',
]);

export const BULTEN_YAZILARI = BULTEN_INCELEME_TASLAKLARI.filter((yazi) =>
  ONAYLI_STATIK_BULTEN_SLUGLARI.has(yazi.slug)
);

export function bultenGetir(slug: string): BultenYazisi | undefined {
  return BULTEN_YAZILARI.find((y) => y.slug === slug);
}

export function kategoriBultenleri(kategori?: string): BultenYazisi[] {
  if (!kategori || kategori === 'Tümü') return BULTEN_YAZILARI;
  return BULTEN_YAZILARI.filter((y) => y.kategori === kategori);
}

export function bultenAra(sorgu: string): BultenYazisi[] {
  const temiz = sorgu.trim().toLowerCase();
  if (!temiz) return BULTEN_YAZILARI;
  return BULTEN_YAZILARI.filter(
    (y) =>
      y.baslik.toLowerCase().includes(temiz) ||
      y.spot.toLowerCase().includes(temiz) ||
      y.etiketler.some((e) => e.toLowerCase().includes(temiz))
  );
}

function tarihGoster(ham: string | null): { iso: string; metin: string } {
  const tarih = ham ? new Date(ham) : new Date();
  const gecerli = Number.isFinite(tarih.getTime()) ? tarih : new Date();
  return {
    iso: gecerli.toISOString().slice(0, 10),
    metin: gecerli.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

/** D1'de panelden onaylanmış postedm taslağını bülten görünümüne çevirir. */
export function yayinlanmisIcerigiBulteneDonustur(kayit: SiteIcerikKaydi): BultenYazisi {
  const tarih = tarihGoster(kayit.siteYayini ?? kayit.orijinalYayin ?? kayit.guncelleme);
  const paragraflar = kayit.govde.split(/\n\s*\n|\r?\n/).map((p) => p.trim()).filter(Boolean);
  const dakika = Math.max(1, Math.ceil(kayit.govde.split(/\s+/).filter(Boolean).length / 210));
  return {
    slug: kayit.slug,
    baslik: kayit.baslik,
    spot: kayit.spot,
    kategori: kayit.kategori || 'Gayrimenkul',
    tarih: tarih.metin,
    tarihIso: tarih.iso,
    okunmaSuresi: `${dakika} dk okuma`,
    yazar: 'EDM Bilgi Merkezi',
    gorsel: kayit.kapakUrl || '/marka/og-varsayilan.png',
    paragraflar: paragraflar.length ? paragraflar : [kayit.govde],
    etiketler: [kayit.kategori || 'Gayrimenkul', 'EDM Bülten'],
    guncellemeTarihi: tarih.iso,
    kapsamNotu: BILGI_MERKEZI_KAPSAM_NOTU,
    kaynaklar: kayit.kaynakUrlleri.map((url, sira) => ({
      ad: kayit.kaynakAdlari[sira] || `Kaynak ${sira + 1}`,
      url,
    })),
    sosyalBaglantilar: kayit.sosyalUrlleri.map((url) => ({ ad: 'Sosyal medya paylaşımı', url })),
  };
}

/** Aynı slug varsa panelden yayınlanan güncel metin, koddaki örneğin önüne geçer. */
export function bultenleriBirlestir(yayinlanan: SiteIcerikKaydi[]): BultenYazisi[] {
  const dinamik = yayinlanan.map(yayinlanmisIcerigiBulteneDonustur);
  const dinamikSluglar = new Set(dinamik.map((yazi) => yazi.slug));
  return [...dinamik, ...BULTEN_YAZILARI.filter((yazi) => !dinamikSluglar.has(yazi.slug))]
    .sort((a, b) => b.tarihIso.localeCompare(a.tarihIso));
}

/** Yayındaki statik ve postEDM yazıları için sitemap kayıtları üretir. */
export function bultenSitemapKayitlari(yayinlanan: SiteIcerikKaydi[]): Array<{ yol: string; tarih: string }> {
  return bultenleriBirlestir(yayinlanan).map((yazi) => ({
    yol: `/bulten/${yazi.slug}`,
    tarih: yazi.guncellemeTarihi,
  }));
}
