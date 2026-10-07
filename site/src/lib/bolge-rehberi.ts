import { bolgeKimligi } from './bolge-verisi.ts';

interface RehberKaynak {
  ad: string;
  url: string;
}

export interface YerelBolgeRehberi {
  giris: string;
  kontrolTarihi: string;
  bilgiler: { baslik: string; metin: string; kaynak: RehberKaynak }[];
  kontroller: { baslik: string; sorular: string[] }[];
}

const SILIVRI_KONUM = { ad: 'Silivri Kaymakamlığı · Coğrafi Konum', url: 'https://www.silivri.gov.tr/cografi-konum' };
const EDIRNE_KOPRU = { ad: 'Kültür ve Turizm Bakanlığı · Sultan Mecid Köprüsü', url: 'https://www.kulturportali.gov.tr/turkiye/edirne/kulturenvanteri/sultan-mecid-koprusu' };
const MERIC_KONUM = { ad: 'Edirne Valiliği · Meriç', url: 'https://www.edirne.gov.tr/meric' };
const SULAMA_2024 = { ad: 'Edirne Valiliği · 19 Ağustos 2024 sulama duyurusu', url: 'https://www.edirne.gov.tr/meric-nehri-uzerindeki-sulamanin-duzenlenmesine-iliskin-duyuru' };
const LALAPASA_KONUM = { ad: 'Lalapaşa Kaymakamlığı · Coğrafi Yapı', url: 'https://www.lalapasa.gov.tr/cografi-yapi' };
const LALAPASA_DOLMEN = { ad: 'Kültür ve Turizm Bakanlığı · Lalapaşa Dolmenleri', url: 'https://kulturportali.gov.tr/turkiye/edirne/gezilecekyer/lalapasa-dolmenleri' };
const MARMARAEREGLISI_KONUM = { ad: 'Marmaraereğlisi Kaymakamlığı · Coğrafi Yapısı', url: 'https://www.marmaraereglisi.gov.tr/cografi-yapisi' };
const MALKARA_KONUM = { ad: 'Malkara Kaymakamlığı · Coğrafi Yapısı', url: 'https://www.malkara.gov.tr/cografi-yapisi' };
const ENEZ_KONUM = { ad: 'Enez Kaymakamlığı · Enez Hakkında', url: 'https://www.enez.gov.tr/enez-hakkinda' };
const GALA_GOLU = { ad: 'Tarım ve Orman Bakanlığı · Gala Gölü Milli Parkı', url: 'https://bolge1.tarimorman.gov.tr/Menu/44/Milli-Parklar' };

/** Kaynaklı coğrafya ile EDM'nin karşılaştırma soruları ayrı sunulur. */
const REHBERLER = new Map<string, YerelBolgeRehberi>([
  [bolgeKimligi('İstanbul', 'Silivri'), {
    giris: 'İstanbul’un batı sınırında, Marmara Denizi kıyısındaki Silivri. Sahile, ilçe merkezine ve iç kesimlere erişimi taşınmazın kendi konumundan değerlendirmek gerekir.',
    kontrolTarihi: '2026-10-03',
    bilgiler: [
      { baslik: 'Kıyıdan iç kesimlere', metin: 'Silivri’nin güneyinde Marmara Denizi, kuzeyinde Çatalca bulunur. Kaymakamlık, kıyıdan kuzeye doğru yükselen, hafif dalgalı bir arazi yapısı tarif eder.', kaynak: SILIVRI_KONUM },
      { baslik: 'D-100 bağlantısı', metin: 'İlçe D-100 güzergâhındadır. Bu bilgi, her mahallenin ana yola aynı uzaklıkta olduğu veya İstanbul’a yolculuğun sabit süreceği anlamına gelmez.', kaynak: SILIVRI_KONUM },
    ],
    kontroller: [
      { baslik: 'Sahil ve merkezde konut', sorular: ['Sahile ve günlük ihtiyaçlara gerçek yürüme güzergâhı nasıl? Haritadaki kuş uçuşu mesafeyi yerinde kontrol edin.', 'Site aidatı, yıl boyunca kullanım, otopark ve ortak alanların bakımını benzer konutlarla birlikte karşılaştırın.'] },
      { baslik: 'İç kesimlerde arsa ve tarla', sorular: ['İlanda söylenen mahalle, ada ve parsel aynı taşınmazı mı tarif ediyor?', 'Fiilî yol bağlantısı, elektrik ve su bağlantıları mevcut mu? Planlanan bağlantıyla mevcut bağlantıyı ayırın.', 'Düşündüğünüz kullanım için güncel imar durumunu ve plan notlarını yetkili idareden parsel özelinde teyit edin.'] },
      { baslik: 'Günlük ulaşım', sorular: ['İşe, okula ve ilçe merkezine kendi kullanacağınız saatlerde rota deneyin.', 'Toplu taşıma kullanacaksanız en yakın durağı, aktarmayı ve güncel sefer saatini kontrol edin.'] },
    ],
  }],
  [bolgeKimligi('Edirne', 'Merkez'), {
    giris: 'Edirne Merkez’de kent içindeki konut ile çevredeki araziyi ayrı değerlendirin. Karaağaç yönünde nehir ve köprü geçişleri, seçilecek taşınmazın ulaşımını anlamak için somut bir başlangıç noktasıdır.',
    kontrolTarihi: '2026-10-03',
    bilgiler: [
      { baslik: 'Karaağaç yönündeki bağlantı', metin: 'Sultan Mecid, diğer adıyla Meriç Köprüsü, Edirne–Karaağaç yolu üzerinde Meriç Nehri’ni geçer; Tunca Köprüsü’nün devamında yer alır. Bu tarihî bağlantı, mahalleler arasında rota karşılaştırırken dikkate alınabilir.', kaynak: EDIRNE_KOPRU },
      { baslik: 'Arazi kullanımında su', metin: 'Valiliğin 19 Ağustos 2024 duyurusu, su yetersizliği nedeniyle Edirne Merkez’in de yer aldığı havzada sulama düzenlemesini anlatır. Bu geçmiş duyuru, bugünkü sulama takvimi veya belirli bir parselin su hakkı değildir.', kaynak: SULAMA_2024 },
    ],
    kontroller: [
      { baslik: 'Kent içi konut', sorular: ['İş, okul ve günlük hizmetlere erişimi seçtiğiniz mahallede yerinde deneyin.', 'Bina yaşıyla birlikte yapı belgeleri, bakım geçmişi, ısıtma gideri ve aidatı inceleyin.'] },
      { baslik: 'Karaağaç ve nehir çevresi', sorular: ['Taşınmaza hangi köprü ve bağlantı yoluyla ulaşılacağını, güncel trafik düzenini kontrol edin.', 'Nehre mesafe üzerinden karar vermeden önce parselin kotunu ve ilgili idarelerin güncel taşkın bilgilerini sorun.'] },
      { baslik: 'Merkez ilçedeki tarla', sorular: ['İlçe adı “Merkez” olsa da parselin kent merkezine uzaklığını ve fiilî yolunu ayrı ölçün.', 'Mevcut ürün, sulama bağlantısı, işletme gideri ve varsa kira ilişkisini belgeleriyle değerlendirin.', 'Tapu niteliği ve güncel imar bilgisiyle düşündüğünüz kullanımın uyumunu yetkili idareden teyit edin.'] },
    ],
  }],
  [bolgeKimligi('Edirne', 'Meriç'), {
    giris: 'Edirne’nin güneyinde, Meriç Nehri’nin Türkiye–Yunanistan sınırını oluşturduğu ilçe. Nehir çevresi ile iç kesimlerdeki parsellerin yolunu, su bağlantısını ve kullanım koşullarını ayrı inceleyin.',
    kontrolTarihi: '2026-10-03',
    bilgiler: [
      { baslik: 'Nehir ve iç kesimler', metin: 'Valilik, ilçenin batı sınırını Meriç Nehri olarak tanımlar. İlçede tepeler, düzlükler ve dere ovaları bulunur; güneydoğuda Ergene Irmağı akar. Tek bir “nehir kenarı” tanımı bütün parselleri anlatmaz.', kaynak: MERIC_KONUM },
      { baslik: 'Sulama, bağlantı ve takvim', metin: '19 Ağustos 2024 tarihli resmî duyuruda Meriç ilçesini de kapsayan su yetersizliği ve kademeli sulama uygulaması yer alır. Bu geçmiş örnek, nehre yakınlığın tek başına sürekli sulama garantisi olmadığını gösterir; güncel koşullar ayrıca sorulmalıdır.', kaynak: SULAMA_2024 },
    ],
    kontroller: [
      { baslik: 'Tarımsal kullanım', sorular: ['Sulama hangi kaynaktan ve bağlantıdan sağlanıyor? Güncel kullanım koşullarını ilgili birlik, kooperatif veya idareden öğrenin.', 'Toprak, ürün geçmişi, drenaj ve üretim giderlerini parselin yerinde incelemesiyle karşılaştırın.'] },
      { baslik: 'Yol ve saha erişimi', sorular: ['Ana yoldan parsele kadar fiilî güzergâhı görün; yağışlı dönemde ve tarım araçlarıyla erişimi sorun.', 'Haritada görünen yol ile sahada kullanılan yolun aynı olup olmadığını belge ve yerinde incelemeyle kontrol edin.'] },
      { baslik: 'Parsel ve kullanım koşulları', sorular: ['Ada/parsel, yüzölçümü ve tapu niteliği ilanla örtüşüyor mu? Hisseli ise satılan payı ve kullanım düzenini ayrıca sorun.', 'Nehir çevresindeki parsellerde kot, drenaj ve güncel taşkın bilgilerini ilgili idareden öğrenin.', 'Konut veya tesis düşünüyorsanız, ilan başlığı üzerinden yapılaşma sonucu çıkarmadan güncel imar bilgisini teyit edin.'] },
    ],
  }],
  [bolgeKimligi('Edirne', 'Lalapaşa'), {
    giris: 'Edirne’nin kuzeyinde, Bulgaristan sınırındaki Lalapaşa. İlçe merkezi, köyler ve sınır yönündeki arazileri; günlük erişim, arazinin eğimi ve mevcut kullanım bakımından ayrı karşılaştırın.',
    kontrolTarihi: '2026-10-03',
    bilgiler: [
      { baslik: 'Sınır yolu ve arazi yapısı', metin: 'Kaymakamlık, Edirne–Lalapaşa–Hamzabeyli devlet yolunun ilçeden geçtiğini belirtir. Genel olarak düz tarif edilen arazide sınır kesimleri engebelidir. Ana yol bağlantısı, her parselin yola cepheli veya kolay erişilebilir olduğunu göstermez.', kaynak: LALAPASA_KONUM },
      { baslik: 'Kırsalda kültürel miras', metin: 'Kültür Portalı, Lalapaşa ilçe merkezi yakınında ve köy yolları çevresinde tarih öncesi dolmen yapılarını tanıtır. Bu yerel miras bilgisi, bir ilandaki parselin koruma durumunu belirlemez; taşınmazın kendi kayıtları ayrıca incelenmelidir.', kaynak: LALAPASA_DOLMEN },
    ],
    kontroller: [
      { baslik: 'Edirne ve köylere erişim', sorular: ['İlçe merkezi üzerinden verilen mesafe yerine, parselden Edirne’ye ve ihtiyaç duyduğunuz hizmetlere gerçek rotayı ölçün.', 'Hamzabeyli yönündeki ulaşımı kendi kullanım saatlerinizde deneyin; ana yola çıkan son bağlantının yüzeyini ve bakımını görün.'] },
      { baslik: 'Tarla ve çiftlik düşüncesi', sorular: ['Fiilî eğim, su kaynağı, elektrik bağlantısı ve tarım araçlarının erişimi kullanımınıza uygun mu?', 'Çiftlik veya yapı düşünüyorsanız tapu niteliği, güncel planlar ve gerekli izinleri parsel bilgileriyle yetkili idareden öğrenin.', 'Hisseli taşınmazda satılan payı, kullanım düzenini ve mevcut kira ilişkisini belgeleriyle inceleyin.'] },
      { baslik: 'Parselin çevresi', sorular: ['Ada ve parsel konumunu arazideki sınırlarla karşılaştırın; yol olarak kullanılan bölümün kayıt durumunu sorun.', 'Kültürel miras veya sınır çevresindeki bir taşınmazda ilgili kurumların güncel kısıt ve izin bilgilerini parsel özelinde isteyin.'] },
    ],
  }],
  [bolgeKimligi('Tekirdağ', 'Marmaraereğlisi'), {
    giris: 'Tekirdağ’ın Marmara Denizi kıyısında, Silivri’ye komşu Marmaraereğlisi. Sultanköy, kıyı yerleşimleri ve iç kesimlerdeki seçenekleri; yıl boyunca kullanım ve günlük ulaşım ihtiyacınıza göre değerlendirin.',
    kontrolTarihi: '2026-10-03',
    bilgiler: [
      { baslik: 'Silivri ile Tekirdağ arasında', metin: 'İlçe İstanbul–Tekirdağ E-84 karayolu güzergâhındadır; doğusunda Silivri, güneyinde Marmara Denizi bulunur. Bu konum, belirli bir konutun İstanbul’a ulaşım süresini veya toplu taşıma sıklığını tek başına açıklamaz.', kaynak: MARMARAEREGLISI_KONUM },
      { baslik: 'Kıyı ve iç kesimler', metin: 'Kaymakamlık kıyıda hem kumsal bölümler hem sahil yükseltileri tarif eder. İç kesimlerdeki Türkmenli Göleti’nin sulama amacıyla yapıldığı belirtilir. Kıyıya veya gölete yakınlık, taşınmazın denize erişimini ya da sulama bağlantısını doğrulamaz.', kaynak: MARMARAEREGLISI_KONUM },
    ],
    kontroller: [
      { baslik: 'Yıl boyunca konut kullanımı', sorular: ['Market, sağlık hizmeti ve ulaşım seçeneklerini yaz sezonu dışında da yerinde kontrol edin.', 'Site aidatı, ortak alanların kış bakımı, su ve ısıtma giderleri nasıl? Son dönem kayıtlarını benzer konutlarla karşılaştırın.', 'Denize ulaşan gerçek yürüme yolunu ve konutun giriş kotunu sahada görün.'] },
      { baslik: 'İşe ve merkeze ulaşım', sorular: ['E-84 bağlantısını iş veya okul saatlerinde deneyin; kuş uçuşu uzaklığa göre süre hesabı yapmayın.', 'Toplu taşıma kullanacaksanız güncel durak, sefer ve aktarma seçeneklerini ilgili işletmeden teyit edin.'] },
      { baslik: 'İç kesimlerde arazi', sorular: ['Gölete yakın bir arazide mevcut su bağlantısı, sulama koşulları ve fiilî yol ayrı ayrı doğrulanıyor mu?', 'İmar bilgisi, yapı belgeleri ve düşündüğünüz kullanımın uyumunu taşınmazın ada/parsel bilgisiyle kontrol edin.', 'Kıyı veya dere çevresinde kot, drenaj ve ilgili idarelerin güncel plan bilgilerini sorun.'] },
    ],
  }],
  [bolgeKimligi('Tekirdağ', 'Malkara'), {
    giris: 'Tekirdağ’ın batısındaki Malkara’da ilçe merkezindeki konut ile mahallelerdeki tarla ve arsayı ayrı değerlendirin. Arazi eğimi, fiilî yol ve sulama bağlantısı aynı ilçe içindeki seçenekleri farklılaştırabilir.',
    kontrolTarihi: '2026-10-03',
    bilgiler: [
      { baslik: 'Tepeler ve düzlükler', metin: 'Kaymakamlık, Malkara’nın arazisini tepeler ve düzlüklerden oluşan plato görünümüyle anlatır. Evrenbey, Sağlamtaş ve Karacahalil çevresindeki ovalar da bu tarifte yer alır. İlçe geneli bilgi, seçilen parselin düz veya tarıma uygun olduğunun ölçümü değildir.', kaynak: MALKARA_KONUM },
      { baslik: 'Baraj ve gölet çevresi', metin: 'İlçede Karaiğdemir ve Kadıköy barajları ile sulama amacıyla yapılmış göletler bulunur. Kaymakamlığın bu genel altyapı bilgisi, her tarlaya su ulaştığını veya güncel sulama takvimini göstermez.', kaynak: MALKARA_KONUM },
    ],
    kontroller: [
      { baslik: 'Tarımsal işletme', sorular: ['Sulama bağlantısı gerçekten var mı? İlgili birlik veya kooperatiften güncel kullanım koşullarını ve giderleri öğrenin.', 'Arazi eğimi, drenaj, toprak ve ürün geçmişini yerinde inceleyin; komşu parselin koşullarını aynen varsaymayın.', 'Mevcut kira, ürün veya kullanım ilişkilerini tapudaki pay bilgileriyle birlikte değerlendirin.'] },
      { baslik: 'Mahalle ve saha yolu', sorular: ['İlçe merkezinden parsele kadar rotayı görün; son bağlantının yağışlı dönemde tarım araçlarıyla kullanılabilirliğini sorun.', 'İlanın mahalle, ada ve parsel bilgisini resmî konumla karşılaştırın; fiilî kullanılan yolun kayıt durumunu öğrenin.'] },
      { baslik: 'Konut veya yapı düşüncesi', sorular: ['Günlük hizmetlere erişimi seçtiğiniz mahallede deneyin; merkez ilçedeki hizmetin parsele uzaklığını ayrı hesaplayın.', 'Mevcut yapının belgelerini veya yeni yapı için güncel plan ve izin koşullarını yetkili idareden parsel özelinde isteyin.'] },
    ],
  }],
  [bolgeKimligi('Edirne', 'Enez'), {
    giris: 'Edirne’nin güneybatısında, Ege kıyısı ve Meriç Nehri’nin denize ulaştığı çevredeki Enez. Kıyıda konut, iç kesimlerde arazi ve sulak alan çevresindeki seçeneklerin kullanım koşullarını ayrı inceleyin.',
    kontrolTarihi: '2026-10-03',
    bilgiler: [
      { baslik: 'Kıyı, ova ve iç kesimler', metin: 'Kaymakamlığın coğrafya anlatımında Enez’in Ege kıyısı, Meriç Nehri, Enez–Yenice Ovası ve Pelin Yaylası yer alır. Aynı ilçe adını taşıyan kıyı konutu ile iç kesimdeki tarlanın günlük erişim ve arazi koşulları aynı olmayabilir.', kaynak: ENEZ_KONUM },
      { baslik: 'Gala Gölü ve Meriç Deltası', metin: 'Tarım ve Orman Bakanlığı, Enez ve İpsala sınırları içindeki Gala Gölü Milli Parkı’nı Meriç Deltası’nın parçası olarak tanımlar. Bu bilgi, belirli bir ilanın milli park içinde veya dışında olduğunu söylemez; güncel sınır ve kullanım durumu parsel üzerinden öğrenilmelidir.', kaynak: GALA_GOLU },
    ],
    kontroller: [
      { baslik: 'Kıyıda konut', sorular: ['Denize gerçek erişim yolu, giriş kotu, bakım giderleri ve kışın kullanım koşulları nasıl?', 'Site yönetiminden sezon dışı hizmetleri ve ortak alan giderlerini öğrenin; günlük ihtiyaçlara rotayı yerinde deneyin.'] },
      { baslik: 'Sulak alan çevresi', sorular: ['Ada/parselin güncel korunan alan sınırları ve planlarla ilişkisini ilgili idarelerden teyit edin; yakınlık üzerinden kullanım izni sonucu çıkarmayın.', 'Kot, drenaj ve güncel taşkın bilgilerini sorun; kuru dönemdeki tek bir ziyaretle karar vermeyin.'] },
      { baslik: 'Tarla ve köy çevresi', sorular: ['Köyden parsele fiilî yol, su kaynağı ve elektrik bağlantısını ayrı ayrı yerinde doğrulayın.', 'Tapu niteliği, satılan pay, varsa kira ilişkisi ve düşünülen kullanım için güncel izin koşullarını belgeleriyle karşılaştırın.', 'İlçe merkezine ve hizmetlere uzaklığı parselin kendi konumundan ölçün.'] },
    ],
  }],
]);

export function bolgeRehberiBul(il: string | null, ilce: string | null): YerelBolgeRehberi | null {
  return REHBERLER.get(bolgeKimligi(il, ilce)) ?? null;
}

export const PARSEL_KAYNAGI: RehberKaynak = {
  ad: 'TKGM · Parsel Sorgulama',
  url: 'https://www.tkgm.gov.tr/e-hizmetler/sik-kullanilanlar/parsel-sorgulama',
};
