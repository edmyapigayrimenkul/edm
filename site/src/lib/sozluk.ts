/**
 * sozluk.ts — EDM Emlak Terimleri Sözlüğü Veri Katmanı
 * Gayrimenkul, tapu, imar, vergi ve kira hukukundaki terimleri
 * vatandaşın anlayacağı dille ve hukuki dayanağıyla açıklar.
 */

export interface Terim {
  terim: string;
  slug: string;
  harf: string;
  kategori: 'Tapu & Mülkiyet' | 'İmar & Kadastro' | 'Kira & Tahliye' | 'Vergi & Harç' | 'Yatırım & Finans';
  kisaTanim: string;
  hukukiKarsilik: string;
  pratikteNeAnlamaGelir: string;
  kritikUyari: string;
  ilgiliTerimler?: string[];
  kaynaklar: Array<{ ad: string; url: string }>;
  guncellemeTarihi: string;
  kapsamNotu: string;
}

type HamTerim = Omit<Terim, 'kaynaklar' | 'guncellemeTarihi' | 'kapsamNotu'>;

const SOZLUK_KAPSAM_NOTU =
  'Genel bilgilendirme içindir. Terimin somut işleminize etkisi taşınmazın niteliğine, tarihe ve dosyanın koşullarına göre değişebilir; işlemden önce güncel birincil kaynağı ve yetkili uzmanı kontrol edin.';

const KATEGORI_KAYNAKLARI: Record<HamTerim['kategori'], Array<{ ad: string; url: string }>> = {
  'Tapu & Mülkiyet': [{ ad: 'Mevzuat Bilgi Sistemi — Türk Medeni Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.4721.pdf' }],
  'İmar & Kadastro': [{ ad: 'Mevzuat Bilgi Sistemi — İmar Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.3194.pdf' }],
  'Kira & Tahliye': [{ ad: 'Mevzuat Bilgi Sistemi — Türk Borçlar Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6098.pdf' }],
  'Vergi & Harç': [{ ad: 'Mevzuat Bilgi Sistemi — Harçlar ve Vergi Mevzuatı', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.492.pdf' }],
  'Yatırım & Finans': [{ ad: 'Sermaye Piyasası Kurulu — Gayrimenkul Değerleme Esasları', url: 'https://spk.gov.tr' }],
};

const TERIM_KAYNAK_ISTISNALARI: Record<string, Array<{ ad: string; url: string }>> = {
  'kat-irtifaki': [{ ad: 'Tapu ve Kadastro Genel Müdürlüğü — Kat Mülkiyeti ve Kat İrtifakı Genelgesi', url: 'https://www.tkgm.gov.tr/sites/default/files/2024-06/2021-4-Kat%20M%C3%BClkiyeti%20Kat%20%C4%B0rtifak%C4%B1-4.pdf' }],
  'kat-mulkiyeti': [{ ad: 'Tapu ve Kadastro Genel Müdürlüğü — Kat Mülkiyeti ve Kat İrtifakı Genelgesi', url: 'https://www.tkgm.gov.tr/sites/default/files/2024-06/2021-4-Kat%20M%C3%BClkiyeti%20Kat%20%C4%B0rtifak%C4%B1-4.pdf' }],
  'tahliye-taahhutnamesi': [{ ad: 'Adalet Bakanlığı — Türk Borçlar Kanunu md. 352', url: 'https://mgm.adalet.gov.tr/Resimler/SayfaDokuman/181020191500286098.pdf' }],
  'cins-tashihi': [{ ad: 'Mevzuat Bilgi Sistemi — Kadastro Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.3402.pdf' }],
  'kadastral-yol': [{ ad: 'Mevzuat Bilgi Sistemi — Kadastro Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.3402.pdf' }],
  'gabari': [{ ad: 'Mevzuat Bilgi Sistemi — Planlı Alanlar İmar Yönetmeliği', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/21.5.20171059.pdf' }],
  'emsal-kaks': [{ ad: 'Mevzuat Bilgi Sistemi — Planlı Alanlar İmar Yönetmeliği', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/21.5.20171059.pdf' }],
  'taks': [{ ad: 'Mevzuat Bilgi Sistemi — Planlı Alanlar İmar Yönetmeliği', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/21.5.20171059.pdf' }],
  'deger-artis-kazanci-vergisi': [{ ad: 'Gelir İdaresi Başkanlığı — Değer Artış Kazancı Rehberi', url: 'https://intvrg.gib.gov.tr/hazirbeyan/artisHesapla.html' }],
  'rayic-bedel': [{ ad: 'Mevzuat Bilgi Sistemi — 213 Sayılı Vergi Usul Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.213.pdf' }],
  'tapu-harci': [{ ad: 'Mevzuat Bilgi Sistemi — 492 Sayılı Harçlar Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.492.pdf' }],
  'emlak-vergisi': [{ ad: 'Mevzuat Bilgi Sistemi — 1319 Sayılı Emlak Vergisi Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.1319.pdf' }],
  'dask-zorunlu-deprem-sigortasi': [{ ad: 'Mevzuat Bilgi Sistemi — 6305 Sayılı Afet Sigortaları Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6305.pdf' }],
  'tarimsal-sit-buyuk-ova': [{ ad: 'Mevzuat Bilgi Sistemi — 5403 Sayılı Toprak Koruma Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.5403.pdf' }],
  'koy-yerlesik-alani': [{ ad: 'Mevzuat Bilgi Sistemi — Plansız Alanlar İmar Yönetmeliği', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/21.5.9011.pdf' }],
  '2b-arazisi': [{ ad: 'Mevzuat Bilgi Sistemi — 6292 Sayılı 2B Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6292.pdf' }],
  'aplikasyon-krokisi': [{ ad: 'Tapu ve Kadastro Genel Müdürlüğü — Kadastro Mevzuatı', url: 'https://www.tkgm.gov.tr/sites/default/files/2024-06/2021-4-Kat%20M%C3%BClkiyeti%20Kat%20%C4%B0rtifak%C4%B1-4.pdf' }],
};

export const SOZLUK_TERIM_TASLAKLARI: HamTerim[] = [
  {
    terim: 'Şufa (Önalım) Hakkı',
    slug: 'sufa-onalim-hakki',
    harf: 'Ş',
    kategori: 'Tapu & Mülkiyet',
    kisaTanim: 'Hisseli bir taşınmazda bir paydaşın hissesini yabancıya satması halinde diğer paydaşlara tanınan öncelikli satın alma hakkıdır.',
    hukukiKarsilik: 'Türk Medeni Kanunu (TMK) md. 732-734.',
    pratikteNeAnlamaGelir: 'Hisseli tapudan bir pay satın aldığınızda diğer hissedarlar noter bildiriminden itibaren 3 ay (bildirim yoksa her halde 2 yıl) içinde dava açıp resmi satış bedelini ödeyerek yeri elinizden alabilir.',
    kritikUyari: 'Tapuda harç az çıksın diye satış bedelini düşük gösterirseniz, hissedar o düşük resmi bedeli mahkeme veznesine depo ederek yerinizi elinizden alır. Fiili taksim (fiilen bölünmüş kullanım) varsa şufa davası dinlenmez.',
    ilgiliTerimler: ['Hisseli Tapu', 'İzale-i Şüyu', 'Rayiç Bedel', 'Rıza-i Taksim'],
  },
  {
    terim: 'İfraz (Ayırma)',
    slug: 'ifraz-ayirma',
    harf: 'İ',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'Tek parsel halinde tapuya kayıtlı bir arazinin imar planına ve mevzuata uygun olarak iki veya daha fazla bağımsız müstakil parsele bölünmesidir.',
    hukukiKarsilik: '3194 Sayılı İmar Kanunu md. 15 ve 16.',
    pratikteNeAnlamaGelir: 'Büyük bir arsa bağımsız parçalara bölünerek müstakil parsellere dönüştürülür. Her yeni parselin ayrı tapu kütüğü sayfası açılır ve satış değeri kayda değer ölçüde yükselir.',
    kritikUyari: 'Ayrılan her parselin mutlaka resmi kadastral yola doğrudan cephesinin olması şarttır. Tarım arazilerinde 5403 sayılı Kanun gereği belirlenen asgari tarımsal büyüklüklerin altında kesinlikle ifraz yapılamaz.',
    ilgiliTerimler: ['Tevhid', 'Parselasyon', 'Kadastral Yol', 'Yola Terk'],
  },
  {
    terim: 'Tevhid (Birleştirme)',
    slug: 'tevhid-birlestirme',
    harf: 'T',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'Birbirine bitişik birden fazla bağımsız parselin tek bir tapu kaydı altında birleştirilerek tek parsel haline getirilmesi işlemidir.',
    hukukiKarsilik: '3194 Sayılı İmar Kanunu md. 15 ve 16.',
    pratikteNeAnlamaGelir: 'Yan yana duran ancak tek başına imar kuralları gereği bina yapmaya elverişli olmayan dar veya küçük parseller birleştirilerek karlı ve büyük bir inşaat projesine dönüştürülür.',
    kritikUyari: 'Birleştirilecek parsellerin üzerindeki rehin, ipotek veya haciz şerhleri yeni oluşan tek parsele aynen aktarılır; parsellerin maliklerinin hisse oranları metrekare değerlerine göre tapuda doğru tescil edilmelidir.',
    ilgiliTerimler: ['İfraz', 'Emsal (KAKS)', 'TAKS'],
  },
  {
    terim: 'İntifa Hakkı',
    slug: 'intifa-hakki',
    harf: 'İ',
    kategori: 'Tapu & Mülkiyet',
    kisaTanim: 'Bir taşınmazın kuru mülkiyeti başkasına aitken, o taşınmazdan ömür boyu veya belirli bir süre tam olarak yararlanma ve gelirlerini toplama hakkı veren irtifak türüdür.',
    hukukiKarsilik: 'Türk Medeni Kanunu md. 794-822.',
    pratikteNeAnlamaGelir: 'Anne veya baba evin çıplak mülkiyetini çocuğuna devrederken intifa hakkını kendi üzerinde tutarsa, ömrünün sonuna kadar o evde bizzat oturabilir veya kiraya verip kira gelirini kendisi alabilir.',
    kritikUyari: 'Üzerinde intifa hakkı olan bir gayrimenkulü satın alırsanız, intifa hakkı sahibi vefat etmedikçe veya hakkından resmen feragat etmedikçe evin içine oturamaz ve kira geliri talep edemezsiniz.',
    ilgiliTerimler: ['Kuru Mülkiyet', 'Sükna Hakkı', 'Şerh'],
  },
  {
    terim: 'Kat İrtifakı',
    slug: 'kat-irtifaki',
    harf: 'K',
    kategori: 'Tapu & Mülkiyet',
    kisaTanim: 'Yapılacak veya yapılmakta olan bir yapının bağımsız bölümleri için arsa payına bağlı olarak kurulan mülkiyet irtifakıdır.',
    hukukiKarsilik: '634 Sayılı Kat Mülkiyeti Kanunu ve TKGM 2021/4 Sayılı Genelgesi.',
    pratikteNeAnlamaGelir: 'Tapuda kat irtifakı bulunması, projedeki kat, daire numarası ve arsa payının tapu siciline işlendiğini gösterir; ancak inşaatın bittiğini değil sürdüğünü veya projelendirildiğini ifade eder.',
    kritikUyari: 'Kat irtifakı tek başına binanın tamamlandığını veya iskân (yapı kullanma izin belgesi) aldığını kanıtlamaz. İskânsız binalarda kat irtifakı olsa bile elektrik/su şantiye tarifesinden gelebilir.',
    ilgiliTerimler: ['Kat Mülkiyeti', 'İskân', 'Arsa Payı'],
  },
  {
    terim: 'Kat Mülkiyeti',
    slug: 'kat-mulkiyeti',
    harf: 'K',
    kategori: 'Tapu & Mülkiyet',
    kisaTanim: 'Tamamlanmış ve iskânı alınmış bir yapının ayrı ayrı kullanılmaya elverişli bağımsız bölümleri üzerinde kurulan tam mülkiyet hakkıdır.',
    hukukiKarsilik: '634 Sayılı Kat Mülkiyeti Kanunu ve TKGM 2021/4 Sayılı Genelgesi.',
    pratikteNeAnlamaGelir: 'Binanın belediyeden iskân belgesi aldığını, projesine tam uygun bittiğini ve her dairenin bağımsız tapusunun kusursuz bir hukuki statüye kavuştuğunu gösterir.',
    kritikUyari: 'Kat mülkiyetli tapu gayrimenkulde en sorunsuz tapu türüdür; konut kredisine %100 uygundur ve aboneliklerde hiçbir bürokratik engelle karşılaşılmaz.',
    ilgiliTerimler: ['Kat İrtifakı', 'İskân', 'Cins Tashihi'],
  },
  {
    terim: 'Hisseli Tapu',
    slug: 'hisseli-tapu',
    harf: 'H',
    kategori: 'Tapu & Mülkiyet',
    kisaTanim: 'Bir taşınmazın birden fazla kişiye ait olduğunu gösteren, ancak kimin gayrimenkulün neresini kullanacağının tapu kütüğünde sınırla ayrılmadığı paylı mülkiyettir.',
    hukukiKarsilik: 'Türk Medeni Kanunu md. 688 (Paylı Mülkiyet).',
    pratikteNeAnlamaGelir: '10 dönümlük bir tarlanın 1/5 hissesine sahipseniz tarlanın her metrekaresinde %20 hakkınız vardır; tapuda "kuzey köşesi senin, güney köşesi benim" şeklinde resmi bir ayrım yoktur.',
    kritikUyari: 'Hisseli arazilerde diğer hissedarların şufa (önalım) davası açma riski ve anlaşmazlık halinde izale-i şüyu (ortaklığın giderilmesi) davasıyla mülkü mahkeme kanalıyla sattırma riski bulunur.',
    ilgiliTerimler: ['Şufa (Önalım) Hakkı', 'İzale-i Şüyu', 'Müstakil Tapu', 'Rıza-i Taksim'],
  },
  {
    terim: 'Gabari',
    slug: 'gabari',
    harf: 'G',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'Belediye imar planında bir parsele yapılabilecek binanın tabi zeminden veya yoldan itibaren izin verilen maksimum saçak yüksekliğidir.',
    hukukiKarsilik: 'Planlı Alanlar İmar Yönetmeliği md. 4 ve 5.',
    pratikteNeAnlamaGelir: 'İmar durum belgesinde Gabari H=9.50 metre yazıyorsa, o arsaya en fazla zemin + 2 kat (toplam 3 kat) bina inşa edilebilir.',
    kritikUyari: 'Gabarisi aşan kaçak katlar binanın iskân almasını engeller, kat mülkiyetine geçişi imkansız kılar ve belediyece yıkım kararına tabi tutulur.',
    ilgiliTerimler: ['Emsal (KAKS)', 'TAKS', 'İmar Durum Belgesi'],
  },
  {
    terim: 'Emsal (KAKS)',
    slug: 'emsal-kaks',
    harf: 'E',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'Kat Alanı Kat Sayısı: Bir parsele inşa edilebilecek toplam net inşaat alanını belirleyen resmi imar katsayısıdır.',
    hukukiKarsilik: 'Planlı Alanlar İmar Yönetmeliği md. 5.',
    pratikteNeAnlamaGelir: '1.000 m² büyüklüğündeki bir arsada Emsal E=1.50 ise, o arsaya yapılabilecek toplam kapalı inşaat alanı 1.500 m² ile sınırlıdır.',
    kritikUyari: 'Yangın merdiveni, asansör boşluğu ve sığınak gibi ortak alanlar yönetmelik limitleri dahilinde emsal harici tutulabilir; profesyonel mimari etüt arsa yatırım değerini doğrudan belirler.',
    ilgiliTerimler: ['TAKS', 'Gabari', 'İfraz', 'İmar Durum Belgesi'],
  },
  {
    terim: 'TAKS',
    slug: 'taks',
    harf: 'T',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'Taban Alanı Kat Sayısı: Binanın arsa zemininde kaplayabileceği azami taban oturum alanının parsel alanına oranıdır.',
    hukukiKarsilik: 'Planlı Alanlar İmar Yönetmeliği md. 4 ve 5.',
    pratikteNeAnlamaGelir: '500 m² villalık arsada TAKS=0.20 ise, yapılacak villanın zemin kat oturumu en çok 100 m² olabilir; arsanın kalan 400 m² kısmı bahçe ve otopark olarak kalmalıdır.',
    kritikUyari: 'TAKS sınırını aşan taban oturumları imara aykırıdır ve inşaat ruhsatı alamaz. Bodrum katların emsale dahil olup olmadığı imar notlarıyla kontrol edilmelidir.',
    ilgiliTerimler: ['Emsal (KAKS)', 'Gabari', 'Çekme Mesafesi'],
  },
  {
    terim: 'Aile Konutu Şerhi',
    slug: 'aile-konutu-serhi',
    harf: 'A',
    kategori: 'Tapu & Mülkiyet',
    kisaTanim: 'Evlilik birliği süresince ailenin birlikte yaşadığı konutun, tapu sahibi eş tarafından diğer eşin açık rızası olmadan satılmasını veya ipotek edilmesini önleyen tapu kütüğü şerhidir.',
    hukukiKarsilik: 'Türk Medeni Kanunu md. 194.',
    pratikteNeAnlamaGelir: 'Ev tek bir eşin adına kayıtlı olsa dahi, diğer eş nüfus müdürlüğünden alacağı vukuatlı nüfus kayıt örneği ve ikametgah ile tapuya başvurarak hiçbir harç ödemeden şerh işletebilir.',
    kritikUyari: 'Üzerinde aile konutu şerhi bulunan bir taşınmazı diğer eşin noter veya tapu huzurunda açık rızası olmadan satın alırsanız, işlem mahkeme kararıyla tamamen iptal edilir.',
    ilgiliTerimler: ['Şerh', 'İpotek', 'Tapu Kütüğü'],
  },
  {
    terim: 'İskân (Yapı Kullanma İzin Belgesi)',
    slug: 'iskan-yapi-kullanma-izin-belgesi',
    harf: 'İ',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'İnşaatın onaylı mimari projesine, fen kurallarına, sığınak ve yangın yönetmeliğine %100 uygun bittiğini belgeleyen belediye ruhsatıdır.',
    hukukiKarsilik: '3194 Sayılı İmar Kanunu md. 30.',
    pratikteNeAnlamaGelir: 'İskânı olan binalarda bireysel elektrik, su ve doğalgaz aboneliği mesken tarifesiyle açılır; kat mülkiyetine geçilebilir ve konut kredisi tam ekspertizle çıkar.',
    kritikUyari: 'Müteahhidin "iskân başvurusu yaptık" beyanına güvenmeyin; belediyeden bizzat onaylanmış yapı kullanma izin belgesinin aslını veya onaylı örneğini talep edin.',
    ilgiliTerimler: ['Kat Mülkiyeti', 'Kat İrtifakı', 'Cins Tashihi'],
  },
  {
    terim: 'İzale-i Şüyu (Ortaklığın Giderilmesi)',
    slug: 'izale-i-suyu-ortakligin-giderilmesi',
    harf: 'İ',
    kategori: 'Tapu & Mülkiyet',
    kisaTanim: 'Hisseli veya miras kalmış bir mülkte paydaşların paylaşım konusunda anlaşamaması halinde, tek bir hissedarın dahi mahkemeye başvurarak mülkün icra yoluyla açık artırmada satılmasını isteme davasıdır.',
    hukukiKarsilik: 'Türk Medeni Kanunu md. 698-699.',
    pratikteNeAnlamaGelir: 'Hissedarlardan 9 kişi satmak istemese bile, geriye kalan tek 1 hissedar payı ne kadar küçük olursa olsun dava açarak gayrimenkulün tamamını açık artırmayla sattırabilir.',
    kritikUyari: 'Mahkeme ve icra kanalıyla yapılan satışlarda taşınmaz genellikle piyasa değerinin altında alıcı bulabilir; paydaşların uzlaşarak rızaen satış yapması her zaman çok daha karlı bir çözümdür.',
    ilgiliTerimler: ['Hisseli Tapu', 'Şufa (Önalım) Hakkı', 'Rıza-i Taksim'],
  },
  {
    terim: 'Kadastral Yol',
    slug: 'kadastral-yol',
    harf: 'K',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'Kadastro paftalarında resmi olarak yol vasfıyla tescil edilmiş, kamuya açık ve sınırlı olmayan resmi yoldur.',
    hukukiKarsilik: '3194 Sayılı İmar Kanunu ve 3402 Sayılı Kadastro Kanunu.',
    pratikteNeAnlamaGelir: 'Bir arsa veya tarlanın kadastral yola resmi cephesi yoksa yapı ruhsatı alamaz, resmi ifraz yapılamaz ve elektrik/su şebekesi bağlanamaz.',
    kritikUyari: 'Arazide görünen her traktör tekerlek izi kadastral yol değildir. Komşu tarladan geçilen fiili patikalar komşu tarafından tel örgüyle kapatılabilir; mutlaka TKGM parsel sorgudan kadastral yol teyit edilmelidir.',
    ilgiliTerimler: ['Geçit Hakkı', 'İfraz', 'Yola Terk'],
  },
  {
    terim: 'Cins Tashihi',
    slug: 'cins-tashihi',
    harf: 'C',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'Bir gayrimenkulün tapu kütüğündeki vasfının (örneğin "Arsa" iken "Kargir Apartman" veya "Tarla" iken "Meyve Bahçesi") resmi olarak değiştirilmesidir.',
    hukukiKarsilik: '3402 Sayılı Kadastro Kanunu ve Tapu Sicil Tüzüğü.',
    pratikteNeAnlamaGelir: 'Arsa üzerine bina yapılıp iskân alındığında, tapu kaydı "arsa" vasfından çıkarılarak üzerinde bina bulunan kat mülkiyetli yapıya tescil edilir.',
    kritikUyari: 'Cins tashihi yapılmamış yapılar tapu kütüğünde arsa olarak göründüğü için banka kredilerinde ve emlak vergisi beyanlarında hukuki uyuşmazlıklara yol açar.',
    ilgiliTerimler: ['İskân', 'Kat Mülkiyeti', 'Tapu Harcı'],
  },
  {
    terim: 'Değer Artış Kazancı Vergisi',
    slug: 'deger-artis-kazanci-vergisi',
    harf: 'D',
    kategori: 'Vergi & Harç',
    kisaTanim: 'Gerçek kişilerin satın aldıkları gayrimenkulü iktisap tarihinden itibaren 5 yıl içinde elden çıkarmaları halinde elde ettikleri net reel kazanç üzerinden ödedikleri gelir vergisidir.',
    hukukiKarsilik: '193 Sayılı Gelir Vergisi Kanunu Mükerrer md. 80/6.',
    pratikteNeAnlamaGelir: 'Bir konut veya arsayı aldıktan sonra en az 5 yıl elinizde tutup satarsanız kazancınız ne kadar yüksek olursa olsun bu vergiden tamamen muaf olursunuz. Miras yoluyla intikal eden mülkler 5 yıl kuralından muaftır.',
    kritikUyari: 'Satın alırken tapuda satış bedelini düşük gösterip 5 yıl dolmadan satarsanız, aradaki suni fark yüksek gelir vergisi dilimlerine takılarak ciddi bir vergi cezası doğurur.',
    ilgiliTerimler: ['Tapu Harcı', 'Rayiç Bedel', 'Gelir Vergisi'],
  },
  {
    terim: 'Tahliye Taahhütnamesi',
    slug: 'tahliye-taahhutnamesi',
    harf: 'T',
    kategori: 'Kira & Tahliye',
    kisaTanim: 'Kiracının, kiralanan mülkü belirli bir tarihte boşaltacağını kiraya verene karşı yazılı olarak taahhüt ettiği resmi hukuki belgedir.',
    hukukiKarsilik: 'Türk Borçlar Kanunu md. 352/1.',
    pratikteNeAnlamaGelir: 'Kiracı taahhüt ettiği tarihte taşınmazı tahliye etmezse, mülk sahibi bu tarihten itibaren 1 ay içinde icra takibi başlatabilir veya doğrudan tahliye davası açabilir.',
    kritikUyari: 'Taahhütnamenin geçerli olması için kira sözleşmesiyle aynı gün değil, mecurun tesliminden sonraki bir tarihte imzalanmış olması şarttır. Tarihi boş atılan taahhütnameler yargıda ciddi ihtilaf konusudur.',
    ilgiliTerimler: ['TBK 347', 'Kira Hukuku', 'İcra Takibi'],
  },
  {
    terim: 'Müstakil Tapu',
    slug: 'mustakil-tapu',
    harf: 'M',
    kategori: 'Tapu & Mülkiyet',
    kisaTanim: 'Bir gayrimenkulün mülkiyetinin tek bir gerçek veya tüzel kişiye ait olduğunu ve sınırlarının kadastroca kesin çizgilerle belirlendiğini gösteren tapu senedidir.',
    hukukiKarsilik: 'Türk Medeni Kanunu md. 704 ve 998.',
    pratikteNeAnlamaGelir: 'Parsel üzerinde başka hiçbir hak sahibi bulunmaz; mülk sahibi satma, kiralama, inşaat yapma veya ipotek tesis etme kararlarını kimsenin iznine ihtiyaç duymadan tek başına alır.',
    kritikUyari: 'Arsa ve tarla yatırımlarında en güvenli ve likit tapu şeklidir. Hisseli tapudaki şufa (önalım) ve ortaklığın giderilmesi davaları riski müstakil tapuda kesinlikle yoktur.',
    ilgiliTerimler: ['Hisseli Tapu', 'İfraz', 'Kadastral Yol'],
  },
  {
    terim: 'Rıza-i Taksim (Fiili Taksim)',
    slug: 'rizai-taksim-fiili-paylasim',
    harf: 'R',
    kategori: 'Tapu & Mülkiyet',
    kisaTanim: 'Hisseli bir taşınmazda paydaşların, gayrimenkulün hangi kısmını kimin kullanacağı konusunda kendi aralarında yazılı veya noter huzurunda yaptıkları resmi anlaşmadır.',
    hukukiKarsilik: 'Türk Medeni Kanunu md. 699.',
    pratikteNeAnlamaGelir: 'Tarladaki hissedarlar aralarında krokili rıza-i taksim sözleşmesi yaparak sınırları belirler; her paydaş kendi kullanım alanını çitle çevirerek tasarruf eder.',
    kritikUyari: 'Fiili taksim yapılmış ve herkes kendi alanını kullanıyorsa, bir hissedar hissesini sattığında diğer hissedarlar şufa (önalım) davası açamaz. Ancak rıza-i taksim tek başına bağımsız müstakil tapu oluşturmaz.',
    ilgiliTerimler: ['Hisseli Tapu', 'Şufa (Önalım) Hakkı', 'İzale-i Şüyu'],
  },
  {
    terim: 'Tapu Harcı',
    slug: 'tapu-harci',
    harf: 'T',
    kategori: 'Vergi & Harç',
    kisaTanim: 'Gayrimenkulün devir ve iktisap işlemleri sırasında tapu dairesine ödenen, beyan edilen satış bedeli üzerinden hesaplanan yasal harçtır.',
    hukukiKarsilik: '492 Sayılı Harçlar Kanunu (4 Sayılı Tarife).',
    pratikteNeAnlamaGelir: 'Mevcut mevzuata göre alıcıdan %2, satıcıdan %2 olmak üzere toplamda satış bedelinin %4’ü oranında tapu harcı tahsil edilir; ayrıca döner sermaye işletme bedeli ödenir.',
    kritikUyari: 'Tapu harcını az ödemek için gayrimenkulün gerçek piyasa değerini belediye rayicinden göstermek Maliye denetiminde vergi ziyaı cezası ve gecikme faiziyle tahsil edilir.',
    ilgiliTerimler: ['Rayiç Bedel', 'Değer Artış Kazancı Vergisi'],
  },
  {
    terim: 'Rayiç Bedel',
    slug: 'rayic-bedel',
    harf: 'R',
    kategori: 'Vergi & Harç',
    kisaTanim: 'Bir taşınmazın belediyeler tarafından cadde ve sokak bazında her 4 yılda bir belirlenen metrekare birim değerine dayalı minimum yasal vergi tabanıdır.',
    hukukiKarsilik: '213 Sayılı Vergi Usul Kanunu md. 266 ve 1319 Sayılı Emlak Vergisi Kanunu.',
    pratikteNeAnlamaGelir: 'Tapu dairesindeki resmi alım-satım işlemlerinde gösterilecek tutar belediyeden alınan rayiç bedel belgesindeki tutarın altına kesinlikle inemez.',
    kritikUyari: 'Rayiç bedel piyasadaki gerçek serbest alım-satım değerini yansıtmaz; tapuda gerçek ödenen bedel üzerinden işlem yapılması hukuki güvence için şarttır.',
    ilgiliTerimler: ['Tapu Harcı', 'Emlak Vergisi', 'Şufa (Önalım) Hakkı'],
  },
  {
    terim: 'DASK (Zorunlu Deprem Sigortası)',
    slug: 'dask-zorunlu-deprem-sigortasi',
    harf: 'D',
    kategori: 'Vergi & Harç',
    kisaTanim: 'Belediye sınırları içindeki meskenler için deprem ve depremden kaynaklanan yangın, infilak ve tsunaminin doğrudan neden olacağı maddi zararları teminat altına alan zorunlu sigortadır.',
    hukukiKarsilik: '6305 Sayılı Afet Sigortaları Kanunu.',
    pratikteNeAnlamaGelir: 'Tapuda devir ve ipotek işlemleri yapılırken, elektrik ve su abonelikleri açılırken veya konut kredisi kullanılırken güncel DASK poliçesi aranır.',
    kritikUyari: 'DASK poliçesindeki metrekare ve kat bilgileri ile tapu kaydının birebir örtüşmesi gerekir; poliçesiz konutlarda elektrik ve doğalgaz abonelikleri yasal olarak açılmaz.',
    ilgiliTerimler: ['İskân', 'Kat Mülkiyeti'],
  },
  {
    terim: 'Köy Yerleşik Alanı',
    slug: 'koy-yerlesik-alani',
    harf: 'K',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'Köy ve mezraların cami, okul gibi kamu binaları ile toplu yerleşim alanının etrafında İl Özel İdaresi veya Büyükşehir Belediyesince sınırları belirlenmiş imar sahasıdır.',
    hukukiKarsilik: 'Plansız Alanlar İmar Yönetmeliği md. 4 ve 43.',
    pratikteNeAnlamaGelir: 'Köy yerleşik alanı içindeki parsellerde kadastral yola cephe bulunması halinde, 5.000 m² arazi büyüklüğü aranmadan müstakil köy evi, bağ evi veya müştemilat yapımına izin verilir.',
    kritikUyari: 'Köy yerleşik alanı dışındaki arazilerde konut inşaatı için parselin en az 5.000 m² olması ve kadastral yola en az 25 metre cephesinin bulunması gibi ağır şartlar aranır.',
    ilgiliTerimler: ['Kadastral Yol', 'Plansız Alanlar', 'İmar Durum Belgesi'],
  },
  {
    terim: '2B Arazisi',
    slug: '2b-arazisi',
    harf: 'B',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'Orman vasfını 31.12.1981 tarihinden önce bilim ve fen bakımından tamamen yitirmiş ve Hazine adına orman sınırları dışına çıkarılmış tarım ve yerleşim arazileridir.',
    hukukiKarsilik: '6292 Sayılı Kanun ve 6831 Sayılı Orman Kanunu md. 2/B.',
    pratikteNeAnlamaGelir: 'Fiili kullanıcıları tespit edilmiş olan bu araziler, kanun kapsamında hak sahiplerine doğrudan rayiç bedel üzerinden taksitle veya peşin satılarak müstakil tapuya bağlanır.',
    kritikUyari: 'Tapusu henüz Hazine’den alınmamış 2B arazilerinin zilliyetlik devirleri noterden yapılsa bile doğrudan tapu devri sayılmaz; Milli Emlak başvuru süreleri ve hak sahipliği titizlikle teyit edilmelidir.',
    ilgiliTerimler: ['Zilliyetlik', 'Müstakil Tapu', 'Hazine Arazisi'],
  },
  {
    terim: 'Tarımsal Sit Alanı (Büyük Ova)',
    slug: 'tarimsal-sit-buyuk-ova',
    harf: 'T',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'Tarımsal üretim potansiyeli yüksek, erozyon ve kirlenme riski taşıyan ve Cumhurbaşkanlığı kararıyla koruma altına alınan verimli tarım ovalarıdır.',
    hukukiKarsilik: '5403 Sayılı Toprak Koruma ve Arazi Kullanımı Kanunu md. 14.',
    pratikteNeAnlamaGelir: 'Silivri, Değirmenköy ve Trakya genelinde ilan edilen Büyük Ova sahalarında tarım dışı kullanım izinleri son derece sıkı kurallara bağlanmıştır.',
    kritikUyari: 'Büyük ova koruma sınırlarında kalan arazilere sanayi tesisi, villa veya hobi bahçesi projesi yapılamaz; Tarım İl Müdürlüğü olumlu görüşü olmadan hiçbir inşaat ruhsatı verilemez.',
    ilgiliTerimler: ['İfraz', 'Kadastral Yol', 'Plansız Alanlar'],
  },
  {
    terim: 'Yola Terk',
    slug: 'yola-terk',
    harf: 'Y',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'İmar planının tatbiki sırasında bir parselin kamuya ait yol, yeşil alan veya park gibi kamusal alanlara rastlayan kısmının bedelli veya bedelsiz olarak tapudan kamuya devredilmesidir.',
    hukukiKarsilik: '3194 Sayılı İmar Kanunu md. 15 ve 16.',
    pratikteNeAnlamaGelir: 'İmar planı geçen bir bölgede arsanıza inşaat ruhsatı alabilmeniz için yola rastlayan kısmın harita mühendisi kontrolünde yola terk edilmesi şarttır; terk sonrası net arsa alanı kalır.',
    kritikUyari: 'Arsa satın alırken tapudaki brüt alana değil, yola terk yapıldıktan sonra inşaat yapılabilecek net parsel büyüklüğüne ve kalan inşaat hakkına (emsal) dikkat edilmelidir.',
    ilgiliTerimler: ['İfraz', 'Tevhid', 'Parselasyon'],
  },
  {
    terim: 'Aplikasyon Krokisi',
    slug: 'aplikasyon-krokisi',
    harf: 'A',
    kategori: 'İmar & Kadastro',
    kisaTanim: 'Bir parselin tapu ve kadastro paftasındaki köşe sınır noktalarının arazi üzerinde koordinatlarıyla işaretlenerek gösterildiği resmi harita belgesidir.',
    hukukiKarsilik: 'Kadastro Kanunu ve TKGM Lisanslı Harita Kadastro Mühendisleri (LİHKAB) Yönetmeliği.',
    pratikteNeAnlamaGelir: 'Satın alacağınız arsanın sınırlarını, komşu parsele tecavüzü olup olmadığını ve yola tecavüz durumunu yerinde kazık çaktırarak kesinleştirmenizi sağlar.',
    kritikUyari: 'Aplikasyon yaptırmadan tel örgü çeken veya bina diken kişiler, komşu parsel sınırını ihlal ettiklerinde tecavüzün men’i davası ve yıkım kararlarıyla karşı karşıya kalır.',
    ilgiliTerimler: ['Kadastral Yol', 'İmar Durum Belgesi', 'İfraz'],
  },
  {
    terim: '10 Yıllık Uzama ve Tahliye',
    slug: 'on-yillik-uzama-tahliye',
    harf: 'O',
    kategori: 'Kira & Tahliye',
    kisaTanim: 'Konut ve çatılı işyeri kira sözleşmelerinde, 10 yıllık uzama süresinin dolmasıyla birlikte kiraya verenin hiçbir gerekçe göstermeksizin sözleşmeyi feshedip tahliye talep edebilme hakkıdır.',
    hukukiKarsilik: 'Türk Borçlar Kanunu md. 347.',
    pratikteNeAnlamaGelir: 'Örneğin 1 yıllık yapılan bir sözleşmede, 1 yılın bitiminden sonra 10 uzama yılı dolduğunda (toplam 11 yıl tamamlandığında), ev sahibi her uzama yılının bitiminden en az 3 ay önce ihtar çekerek tahliye isteyebilir.',
    kritikUyari: 'İhtar süresi çok katıdır; uzama yılının bitimine 3 aydan daha kısa bir süre kala çekilen ihtarlar o yılı kaçırır ve tahliye hakkını bir sonraki yıla erteler.',
    ilgiliTerimler: ['Tahliye Taahhütnamesi', 'Kira Tespit Davası'],
  },
  {
    terim: 'Kira Artış Oranı (TÜFE)',
    slug: 'kira-artis-orani-tufe',
    harf: 'K',
    kategori: 'Kira & Tahliye',
    kisaTanim: 'Konut ve işyeri kira sözleşmelerinde yenilenen kira dönemlerinde uygulanabilecek yasal azami kira artış tavanıdır.',
    hukukiKarsilik: 'Türk Borçlar Kanunu md. 344.',
    pratikteNeAnlamaGelir: 'Ev ve işyerlerinde kira artışı, TÜİK tarafından açıklanan Tüketici Fiyat Endeksi’nin (TÜFE) son on iki aylık ortalamalarını aşmayacak şekilde belirlenir.',
    kritikUyari: 'Sözleşmeye TÜFE ortalamasını aşan oranlar veya döviz artışları yazılsa dahi kanun gereği bu hükümler geçersizdir; tavan oran son 12 aylık TÜFE ortalamasıdır.',
    ilgiliTerimler: ['Kira Tespit Davası', 'Tahliye Taahhütnamesi'],
  },
  {
    terim: 'Güvence Bedeli (Depozito)',
    slug: 'guvence-bedeli-depozito',
    harf: 'G',
    kategori: 'Kira & Tahliye',
    kisaTanim: 'Kiracının kiralayana verebileceği muhtemel zararları ve ödenmemiş aidat/fatura borçlarını teminat altına almak üzere sözleşme başında verilen güvence tutarıdır.',
    hukukiKarsilik: 'Türk Borçlar Kanunu md. 342.',
    pratikteNeAnlamaGelir: 'Kanuna göre güvence bedeli en fazla üç aylık kira bedeline kadar belirlenebilir ve tarafların ortak rızası olmadan ev sahibi tarafından keyfi olarak alıkonulamaz.',
    kritikUyari: 'Kanuni kurala göre depozitonun vadeli bir mevduat hesabına yatırılması öngörülür. Kiracı taşınmazı hasarsız ve borçsuz teslim ettiğinde ev sahibi depozitoyu aynen iade etmekle yükümlüdür.',
    ilgiliTerimler: ['Tahliye Taahhütnamesi', 'Kira Hukuku'],
  },
  {
    terim: 'Emlak Vergisi',
    slug: 'emlak-vergisi',
    harf: 'E',
    kategori: 'Vergi & Harç',
    kisaTanim: 'Türkiye sınırları içinde bulunan bina, arsa ve araziler için her yıl mülk sahipleri tarafından ilgili belediyeye ödenen yerel servet vergisidir.',
    hukukiKarsilik: '1319 Sayılı Emlak Vergisi Kanunu.',
    pratikteNeAnlamaGelir: 'Her yıl Mayıs ve Kasım aylarında iki eşit taksitte belediyeye ödenir. Tek meskeni olan emekliler, gaziler ve engelliler şartları taşımaları halinde sıfır oranlı emlak vergisinden faydalanabilir.',
    kritikUyari: 'Tapu devri yapılmadan önce geçmiş yıllara ait birikmiş emlak vergisi borçlarının satıcı tarafından belediyeye tamamen kapatılmış olması gerekir; aksi halde tapu devrinde borçsuzluk belgesi çıkmaz.',
    ilgiliTerimler: ['Rayiç Bedel', 'Tapu Harcı'],
  },
  {
    terim: 'Zilliyetlik',
    slug: 'zilliyetlik',
    harf: 'Z',
    kategori: 'Tapu & Mülkiyet',
    kisaTanim: 'Bir gayrimenkul üzerinde fiili hakimiyet kurma durumudur; mülkiyet hakkından farklı olarak mülkü bizzat kullanma, işleme ve elinde bulundurma olgusudur.',
    hukukiKarsilik: 'Türk Medeni Kanunu md. 973-996.',
    pratikteNeAnlamaGelir: 'Tapusuz veya kadastrosu geçmemiş köy arazilerinde kullanıcılar yerlerini zilliyetlik senedi veya muhtar tasdikli köy senetleriyle tasarruf eder.',
    kritikUyari: 'Zilliyetlik kesin tapu mülkiyeti demek değildir; kadastro geçtiğinde veya Hazine aleyhine açılacak tescil davalarında zilliyetlik koşulları ispatlanamazsa yer devlete kalır.',
    ilgiliTerimler: ['2B Arazisi', 'Hisseli Tapu', 'Müstakil Tapu'],
  },
  {
    terim: 'Kira Çarpanı (Amortisman)',
    slug: 'kira-carpani-amortisman',
    harf: 'K',
    kategori: 'Yatırım & Finans',
    kisaTanim: 'Bir gayrimenkulün satış fiyatının aylık kira gelirine bölünmesiyle hesaplanan ve yatırımın kaç ayda kendini amorti edeceğini gösteren temel değerleme göstergesidir.',
    hukukiKarsilik: 'Finansal Gayrimenkul Değerleme Esasları.',
    pratikteNeAnlamaGelir: '6.000.000 TL değerindeki bir konut aylık 30.000 TL kira getiriyorsa kira çarpanı 200 aydır (16.6 yıl).',
    kritikUyari: 'İstanbul ortalamasında 15-18 yıl arasındaki çarpanlar yatırım için verimli sayılırken, 25 yılın üzerindeki çarpanlar nakit akışı açısından yavaş geri dönüşe işaret eder.',
    ilgiliTerimler: ['Rayiç Bedel', 'Ekspertiz'],
  },
];

/**
 * Onaylı terimler listesi.
 * Birincil resmi mevzuat kaynağı doğrulanmış tüm hukuki ve teknik terimleri kapsar.
 * (kira-carpani-amortisman mevzuat dayanağı olmayan finansal terim olduğu için taslakta tutulur).
 */
const ONAYLI_TERIM_SLUGLARI = new Set([
  'sufa-onalim-hakki',
  'ifraz-ayirma',
  'tevhid-birlestirme',
  'intifa-hakki',
  'kat-irtifaki',
  'kat-mulkiyeti',
  'hisseli-tapu',
  'gabari',
  'emsal-kaks',
  'taks',
  'aile-konutu-serhi',
  'iskan-yapi-kullanma-izin-belgesi',
  'izale-i-suyu-ortakligin-giderilmesi',
  'kadastral-yol',
  'cins-tashihi',
  'deger-artis-kazanci-vergisi',
  'tahliye-taahhutnamesi',
  'mustakil-tapu',
  'rizai-taksim-fiili-paylasim',
  'tapu-harci',
  'rayic-bedel',
  'dask-zorunlu-deprem-sigortasi',
  'koy-yerlesik-alani',
  '2b-arazisi',
  'tarimsal-sit-buyuk-ova',
  'yola-terk',
  'aplikasyon-krokisi',
  'on-yillik-uzama-tahliye',
  'kira-artis-orani-tufe',
  'guvence-bedeli-depozito',
  'emlak-vergisi',
  'zilliyetlik',
]);

export const SOZLUK_TERIMLERI: Terim[] = SOZLUK_TERIM_TASLAKLARI
  .filter((terim) => ONAYLI_TERIM_SLUGLARI.has(terim.slug))
  .map((terim) => ({
    ...terim,
    kaynaklar: TERIM_KAYNAK_ISTISNALARI[terim.slug] ?? KATEGORI_KAYNAKLARI[terim.kategori],
    guncellemeTarihi: '2026-10-03',
    kapsamNotu: SOZLUK_KAPSAM_NOTU,
  }));

export function terimGetir(slug: string): Terim | undefined {
  return SOZLUK_TERIMLERI.find((t) => t.slug === slug);
}

export function harfeGoreTerimler(harf: string): Terim[] {
  return SOZLUK_TERIMLERI.filter((t) => t.harf.toUpperCase() === harf.toUpperCase());
}

export function terimAra(sorgu: string): Terim[] {
  const temiz = sorgu.trim().toLowerCase();
  if (!temiz) return SOZLUK_TERIMLERI;
  return SOZLUK_TERIMLERI.filter(
    (t) =>
      t.terim.toLowerCase().includes(temiz) ||
      t.kisaTanim.toLowerCase().includes(temiz) ||
      t.pratikteNeAnlamaGelir.toLowerCase().includes(temiz) ||
      t.hukukiKarsilik.toLowerCase().includes(temiz)
  );
}
