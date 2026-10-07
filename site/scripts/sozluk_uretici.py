# sozluk_uretici.py — EDM Emlak Sözlüğü Kapsamlı Veri Üreticisi
# 300+ resmi kanun dayanaklı, saha gerçekli ve kritik uyarılı emlak terimi üretir.

import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SOZLUK_DIR = BASE_DIR / "src" / "lib" / "sozluk"
SOZLUK_DIR.mkdir(parents=True, exist_ok=True)

# 1. TAPU & MÜLKİYET VERİSİ
TAPU_TERIMLERI = [
    {
        "terim": "Şufa (Önalım) Hakkı",
        "slug": "sufa-onalim-hakki",
        "harf": "Ş",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Hisseli bir taşınmazda bir paydaşın hissesini yabancıya satması halinde diğer paydaşlara tanınan öncelikli satın alma hakkıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu (TMK) md. 732-734.",
        "pratikteNeAnlamaGelir": "Hisseli tapudan bir pay satın aldığınızda diğer hissedarlar noter bildiriminden itibaren 3 ay içinde dava açıp resmi satış bedelini ödeyerek yeri elinizden alabilir.",
        "kritikUyari": "Tapuda harç az çıksın diye satış bedelini düşük gösterirseniz, hissedar o düşük resmi bedeli mahkeme veznesine depo ederek yerinizi elinizden alır.",
        "ilgiliTerimler": ["Hisseli Tapu", "İzale-i Şüyu", "Rayiç Bedel", "Rıza-i Taksim"]
    },
    {
        "terim": "İntifa Hakkı",
        "slug": "intifa-hakki",
        "harf": "İ",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir taşınmazın kuru mülkiyeti başkasına aitken, o taşınmazdan ömür boyu veya belirli bir süre tam olarak yararlanma ve gelirlerini toplama hakkı veren irtifak türüdür.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 794-822.",
        "pratikteNeAnlamaGelir": "Anne veya baba evin çıplak mülkiyetini çocuğuna devrederken intifa hakkını kendi üzerinde tutarsa, ömrünün sonuna kadar o evde bizzat oturabilir veya kiraya verip kira gelirini kendisi alabilir.",
        "kritikUyari": "Üzerinde intifa hakkı olan bir gayrimenkulü satın alırsanız, intifa hakkı sahibi vefat etmedikçe veya hakkından resmen feragat etmedikçe evin içine oturamaz ve kira geliri talep edemezsiniz.",
        "ilgiliTerimler": ["Kuru Mülkiyet", "Sükna Hakkı", "Şerh"]
    },
    {
        "terim": "Kat İrtifakı",
        "slug": "kat-irtifaki",
        "harf": "K",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Yapılacak veya yapılmakta olan bir yapının bağımsız bölümleri için arsa payına bağlı olarak kurulan mülkiyet irtifakıdır.",
        "hukukiKarsilik": "634 Sayılı Kat Mülkiyeti Kanunu ve TKGM 2021/4 Sayılı Genelgesi.",
        "pratikteNeAnlamaGelir": "Tapuda kat irtifakı bulunması, projedeki kat, daire numarası ve arsa payının tapu siciline işlendiğini gösterir; ancak inşaatın bittiğini değil sürdüğünü ifade eder.",
        "kritikUyari": "Kat irtifakı tek başına binanın tamamlandığını veya iskân aldığını kanıtlamaz. İskânsız binalarda elektrik ve su şantiye tarifesinden gelebilir.",
        "ilgiliTerimler": ["Kat Mülkiyeti", "İskân", "Arsa Payı"]
    },
    {
        "terim": "Kat Mülkiyeti",
        "slug": "kat-mulkiyeti",
        "harf": "K",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Tamamlanmış ve iskânı alınmış bir yapının ayrı ayrı kullanılmaya elverişli bağımsız bölümleri üzerinde kurulan tam mülkiyet hakkıdır.",
        "hukukiKarsilik": "634 Sayılı Kat Mülkiyeti Kanunu ve TKGM 2021/4 Sayılı Genelgesi.",
        "pratikteNeAnlamaGelir": "Binanın belediyeden iskân belgesi aldığını, projesine tam uygun bittiğini ve her dairenin bağımsız tapusunun kusursuz bir hukuki statüye kavuştuğunu gösterir.",
        "kritikUyari": "Kat mülkiyetli tapu gayrimenkulde en sorunsuz tapu türüdür; konut kredisine %100 uygundur ve aboneliklerde hiçbir bürokratik engelle karşılaşılmaz.",
        "ilgiliTerimler": ["Kat İrtifakı", "İskân", "Cins Tashihi"]
    },
    {
        "terim": "Hisseli Tapu",
        "slug": "hisseli-tapu",
        "harf": "H",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir taşınmazın birden fazla kişiye ait olduğunu gösteren, ancak kimin gayrimenkulün neresini kullanacağının tapu kütüğünde sınırla ayrılmadığı paylı mülkiyettir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 688 (Paylı Mülkiyet).",
        "pratikteNeAnlamaGelir": "10 dönümlük bir tarlanın 1/5 hissesine sahipseniz tarlanın her metrekaresinde %20 hakkınız vardır; resmiyette belirli bir köşe size tahsis edilmiş değildir.",
        "kritikUyari": "Hisseli arazilerde diğer hissedarların şufa (önalım) davası açma riski ve anlaşmazlık halinde izale-i şüyu davasıyla mülkü mahkemeden sattırma riski bulunur.",
        "ilgiliTerimler": ["Şufa (Önalım) Hakkı", "İzale-i Şüyu", "Müstakil Tapu", "Rıza-i Taksim"]
    },
    {
        "terim": "Aile Konutu Şerhi",
        "slug": "aile-konutu-serhi",
        "harf": "A",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Eşlerin bütün yaşam faaliyetlerini gerçekleştirdikleri ve acı tatlı günleri paylaştıkları konutun diğer eşin rızası olmadan satılmasını veya ipotek edilmesini engelleyen haktır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 194.",
        "pratikteNeAnlamaGelir": "Ev tapuda sadece kocanın veya karının üzerine kayıtlı olsa bile diğer eş muhtarlıktan ve nüfus müdürlüğünden alacağı belgelerle tapuya gidip tek kuruş ödemeden bu şerhi koydurabilir.",
        "kritikUyari": "Aile konutu şerhi konulduktan sonra tapu maliki olan eş diğer eşin açık yazılı muvafakati olmadan evi satamaz, bağışlayamaz veya banka kredisine ipotek veremez.",
        "ilgiliTerimler": ["Tapu Şerhi", "Hisseli Tapu", "İpotek"]
    },
    {
        "terim": "İzale-i Şüyu (Ortaklığın Giderilmesi)",
        "slug: 'izale-i-suyu-ortakligin-giderilmesi": "izale-i-suyu-ortakligin-giderilmesi",
        "slug": "izale-i-suyu-ortakligin-giderilmesi",
        "harf": "İ",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Paylı veya elbirliği mülkiyetine tabi bir taşınmazda paydaşların anlaşamaması halinde ortaklığın mahkeme kanalıyla satış veya aynen taksim suretiyle sonlandırılması davasıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 698 ve 699.",
        "pratikteNeAnlamaGelir": "Miras kalan bir arsa veya dairede mirasçılardan biri bile hissesini nakde çevirmek isterse diğerleri razı olmasa dahi bu davayı açarak mülkü icra yoluyla açık artırmada sattırabilir.",
        "kritikUyari": "İzale-i şüyu satışları açık artırma yoluyla yapıldığından mülk çoğu zaman gerçek piyasa değerinin altında satılır; aile mülklerinin zayi olmaması için dava öncesi uzlaşma aranmalıdır.",
        "ilgiliTerimler": ["Hisseli Tapu", "Şufa (Önalım) Hakkı", "Rıza-i Taksim"]
    },
    {
        "terim": "Müstakil Tapu",
        "slug": "mustakil-tapu",
        "harf": "M",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir taşınmazın sınırları belirli tek bir parselinin mülkiyetinin tek bir gerçek veya tüzel kişiye ait olduğunu gösteren bağımsız tapu belgesidir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 683 vd. (Tek Kişi Mülkiyeti).",
        "pratikteNeAnlamaGelir": "Taşınmazın üzerinde hiçbir ortak veya hissedar yoktur; malik taşınmazı dilediği gibi satabilir, ipotek verebilir veya belediyeden inşaat ruhsatı alabilir.",
        "kritikUyari": "Müstakil tapulu gayrimenkullerde dahi imar kısıtlamaları, koruma havzaları veya SİT alanı kararları bulunabilir; tapunun tek kişiye ait olması sınırsız yapılaşma izni anlamına gelmez.",
        "ilgiliTerimler": ["Hisseli Tapu", "İfraz", "Kat Mülkiyeti"]
    },
    {
        "terim": "Rıza-i Taksim (Fiili Paylaşım)",
        "slug": "rizai-taksim-fiili-paylasim",
        "harf": "R",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Hisseli veya miras kalan bir taşınmazda tüm paydaşların yazılı bir sözleşmeyle taşınmazın hangi bölümünü kimin kullanacağı konusunda anlaşmasıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 699 ve Yargıtay İçtihatları.",
        "pratikteNeAnlamaGelir": "Hissedarlar arsayı krokisi üzerinde bölüşüp tel örgüyle ayırır ve herkes kendi yerine ev veya bahçe yapar.",
        "kritikUyari": "Tüm hissedarların ıslak imzasıyla yapılmayan rıza-i taksim geçersizdir. Rıza-i taksim yapılmış ve fiilen kullanılıyorsa hissedarlar artık birbirine karşı şufa davası açamaz.",
        "ilgiliTerimler": ["Hisseli Tapu", "Şufa (Önalım) Hakkı", "İzale-i Şüyu"]
    },
    {
        "terim": "Zilliyetlik",
        "slug": "zilliyetlik",
        "harf": "Z",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir gayrimenkul üzerinde fiili hakimiyet kurma durumudur; mülkiyet hakkından farklı olarak mülkü bizzat kullanma, işleme ve elinde bulundurma olgusudur.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 973-996.",
        "pratikteNeAnlamaGelir": "Tapusuz veya kadastrosu geçmemiş köy arazilerinde kullanıcılar yerlerini zilliyetlik senedi veya muhtar tasdikli köy senetleriyle tasarruf eder.",
        "kritikUyari": "Zilliyetlik kesin tapu mülkiyeti demek değildir; kadastro geçtiğinde veya Hazine aleyhine açılacak tescil davalarında zilliyetlik koşulları ispatlanamazsa yer devlete kalır.",
        "ilgiliTerimler": ["2B Arazisi", "Hisseli Tapu", "Müstakil Tapu"]
    },
    {
        "terim": "İpotek",
        "slug": "ipotek",
        "harf": "İ",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Doğmuş veya doğması muhtemel bir alacağın güvence altına alınması amacıyla taşınmazın tapu kütüğüne rehin tescil edilmesidir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 850-891.",
        "pratikteNeAnlamaGelir": "Banka konut kredisi verirken borç bitene kadar tapu kaydına birinci derece ipotek koyar. Borç tamamen ödenip fek yazısı alınmadan ipotek kalkmaz.",
        "kritikUyari": "Üzerinde ipotek olan bir evi satın alırsanız, borç eski malik tarafından ödenmediğinde banka evi doğrudan icradan sattırabilir; tapu devrinden önce fek (kaldırma) yazısı alınmalıdır.",
        "ilgiliTerimler": ["Haciz Şerhi", "Şerh", "Rehin Açığı Belgesi"]
    },
    {
        "terim": "Geçit Hakkı",
        "slug": "gecit-hakki",
        "harf": "G",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Genel yola doğrudan çıkışı bulunmayan veya çıkışı yetersiz olan parsel malikine tam bir bedel karşılığında komşu parselden yol hakkı tanıyan zorunlu irtifaktır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 747 (Zorunlu Geçit Hakkı).",
        "pratikteNeAnlamaGelir": "Yolu olmayan tarlanın sahibi komşu tarlanın kenarından yol açmak için bedeli mukabilinde geçit hakkı talep eder; komşu rıza göstermezse mahkeme kararıyla tapuya tescil edilir.",
        "kritikUyari": "Geçit hakkı komşunun arazisinin mülkiyetini size kazandırmaz; yalnızca yoldan geçiş yetkisi verir ve mahkemece belirlenen tazminat bedeli peşin ödenmedikçe geçit açılamaz.",
        "ilgiliTerimler": ["İrtifak Hakkı", "Kadastral Yol", "Aplikasyon Krokisi"]
    },
    {
        "terim": "Sükna (Oturma) Hakkı",
        "slug": "sukna-oturma-hakki",
        "harf": "S",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir binanın tamamında veya bir bölümünde bizzat oturma yetkisi veren, başkasına devredilemeyen kişiye sıkı sıkıya bağlı irtifak hakkıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 823-825.",
        "pratikteNeAnlamaGelir": "İntifa hakkından farklı olarak evi üçüncü bir kişiye kiraya verip kira geliri alamazsınız; sadece kendiniz veya ailenizle birlikte bizzat ikamet edebilirsiniz.",
        "kritikUyari": "Sükna hakkı mirasçılara geçmez, hak sahibi vefat ettiğinde kendiliğinden hükümsüz kalır. Üzerinde sükna hakkı şerhi bulunan bir evin piyasa alım satım değeri ciddi oranda düşer.",
        "ilgiliTerimler": ["İntifa Hakkı", "Kuru Mülkiyet", "Aile Konutu Şerhi"]
    },
    {
        "terim": "Üst (İnşaat) Hakkı",
        "slug": "ust-insaat-hakki",
        "harf": "Ü",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Başkasına ait bir arazinin altında veya üstünde yapı inşa etmek veya mevcut yapıyı muhafaza etmek yetkisi veren ayni irtifak hakkıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 826-836.",
        "pratikteNeAnlamaGelir": "Hazine veya vakıf arazisi üzerine 49 veya 99 yıllığına üst hakkı tesis edilerek otel, AVM veya hastane inşa edilir; süre boyunca tesis işletilir.",
        "kritikUyari": "Süre sona erdiğinde üzerindeki yapılar aksine sözleşme yoksa zemin malikine kalır; üst hakkı bağımsız ve sürekli nitelikte tescil edilirse ayrı bir tapu kütüğü sayfası açılabilir.",
        "ilgiliTerimler": ["İrtifak Hakkı", "İntifa Hakkı", "Kat İrtifakı"]
    },
    {
        "terim": "Haciz Şerhi",
        "slug": "haciz-serhi",
        "harf": "H",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Borçlunun taşınmazı üzerindeki tasarruf yetkisini kısıtlayarak icra dairesi veya kamu idaresi lehine tapu kütüğüne işlenen resmi cebri icra kaydıdır.",
        "hukukiKarsilik": "İcra ve İflas Kanunu md. 78-105 ve 6183 Sayılı Kanun.",
        "pratikteNeAnlamaGelir": "Mülk sahibinin borçları nedeniyle alacaklı avukatı tapu kütüğüne haciz koydurur. Hacizli yer satılabilir ancak yeni alıcı mevcut haciz yükünü bilerek devralır.",
        "kritikUyari": "Tapu devir günü sistemden güncel takdiyat belgesi çıkarılmadan imza atılmamalıdır; tapu devrinden dakikalar önce bile yeni bir haciz işlenebilir.",
        "ilgiliTerimler": ["İpotek", "İhtiyati Tedbir Şerhi", "Tapu Şerhi"]
    },
    {
        "terim": "İhtiyati Tedbir Şerhi",
        "slug": "ihtiyati-tedbir-serhi",
        "harf": "İ",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Dava konusu taşınmazın yargılama süresince üçüncü kişilere devredilmesini veya üzerinde tasarruf edilmesini önlemek amacıyla mahkemece konulan geçici hukuki korumadır.",
        "hukukiKarsilik": "Hukuk Muhakemeleri Kanunu (HMK) md. 389-399.",
        "pratikteNeAnlamaGelir": "Boşanma, tapu iptali veya miras davasında hak kaybını önlemek için mahkeme tapuya tedbir koyar; tapu müdürlüğü tedbir kaldırılmadan devir işlemi yapamaz.",
        "kritikUyari": "Tapusunda üçüncü kişilere devrin önlenmesine dair tedbir bulunan mülkün satışı noter veya tapuda kesinlikle yapılamaz; dava bitmeden taşınmaz el değiştiremez.",
        "ilgiliTerimler": ["Tapu Şerhi", "Tapu İptal ve Tescil Davası", "Haciz Şerhi"]
    },
    {
        "terim": "Muris Muvazaası (Miras Kaçırma)",
        "slug": "muris-muvazaasi-miras-kacirma",
        "harf": "M",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Mirasbırakanın diğer mirasçılarını miras payından mahrum etmek amacıyla aslında bağışladığı taşınmazı tapuda satış veya ölünceye kadar bakma gibi göstermesidir.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 19 ve 01.04.1974 tarihli Yargıtay İçtihadı Birleştirme Kararı.",
        "pratikteNeAnlamaGelir": "Babanın bir çocuğuna evini bedelsiz devretmek isteyip tapuda satış işlemi yapması durumudur; vefatın ardından diğer kardeşler tapu iptal ve tescil davası açabilir.",
        "kritikUyari": "Muris muvazaası davasında zamanaşımı veya hak düşürücü süre yoktur; mirasbırakanın vefatından yıllar sonra bile tapu iptali istenip tescil bozulabilir.",
        "ilgiliTerimler": ["Veraset İlamı", "Tapu İptal ve Tescil Davası", "Miras İntikali"]
    },
    {
        "terim": "Veraset İlamı (Mirasçılık Belgesi)",
        "slug": "veraset-ilami-mirascilik-belgesi",
        "harf": "V",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Vefat eden kişinin yasal mirasçılarının kimler olduğunu ve tereke üzerindeki miras pay oranlarını resmi olarak tevsik eden mahkeme veya noter belgesidir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 598.",
        "pratikteNeAnlamaGelir": "Noterden veya Sulh Hukuk Mahkemesinden birkaç dakika içinde alınır; tapuda miras intikali ve gayrimenkul satışı yapabilmek için ibrazı zorunludur.",
        "kritikUyari": "Mirasçılık belgesi tek başına tapu mülkiyetini mirasçılara geçirmez; tapu müdürlüğüne başvurulup intikal işlemi yapılmadıkça mülk resmiyette vefat eden kişi üzerinde kalır.",
        "ilgiliTerimler": ["Miras İntikali", "Hisseli Tapu", "Veraset ve İntikal Vergisi"]
    },
    {
        "terim": "Miras İntikali",
        "slug": "miras-intikali",
        "harf": "M",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Vefat eden kişinin tapuda adına kayıtlı taşınmazlarının mirasçılık belgesine dayanılarak tüm mirasçılar adına tapu kütüğüne tescil edilmesi işlemidir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 599 ve Tapu Sicili Tüzüğü.",
        "pratikteNeAnlamaGelir": "Dededen veya babadan kalan gayrimenkullerin tapu dairesine başvurularak çocukların ve sağ kalan eşin adına elbirliği veya paylı mülkiyet olarak geçirilmesidir.",
        "kritikUyari": "İntikal yapılmadan gayrimenkul satılamaz veya ipotek verilemez; veraset ve intikal vergisi ilişiği kesilmeden veya teminat gösterilmeden tapu devri tamamlanmaz.",
        "ilgiliTerimler": ["Veraset İlamı", "Hisseli Tapu", "Elbirliği Mülkiyeti"]
    },
    {
        "terim": "Elbirliği (İştirak) Mülkiyeti",
        "slug": "elbirligi-istirak-mulkiyeti",
        "harf": "E",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Aralarında kanun veya sözleşme gereği ortaklık bağı bulunan kişilerin, taşınmazın tamamına payları ayrılmaksızın birlikte sahip oldukları mülkiyet türüdür.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 701-703.",
        "pratikteNeAnlamaGelir": "Miras yoluyla intikal eden mülklerde tapuda hisse oranı yazmaz; tüm mirasçılar mülkün tamamına ortak görünür.",
        "kritikUyari": "Elbirliği mülkiyetinde tek bir mirasçı dahi imza vermezse mülk satılamaz, kiraya verilemez veya inşaat yapılamaz; işlem için oybirliği veya paylı mülkiyete çevrilmesi şarttır.",
        "ilgiliTerimler": ["Hisseli Tapu", "Miras İntikali", "İzale-i Şüyu"]
    },
    {
        "terim": "Arsa Payı",
        "slug": "arsa-payi",
        "harf": "A",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Kat mülkiyeti veya kat irtifakı kurulu binalarda her bir bağımsız bölüme, konum, alan ve değerine oranla tahsis edilen ortak arsa payıdır.",
        "hukukiKarsilik": "634 Sayılı Kat Mülkiyeti Kanunu md. 2 ve 3.",
        "pratikteNeAnlamaGelir": "Kentsel dönüşümde veya bina yıkıldığında hak sahipliği dairenin metrekare büyüklüğüne göre değil tapusundaki arsa payı oranına göre belirlenir.",
        "kritikUyari": "Zemin kat ile çatı dubleksinin arsa payları eşit yazılmışsa dönüşümde hak kaybı doğar; hatalı tahsis edilmiş arsa payları için Arsa Payı Düzeltme Davası açılmalıdır.",
        "ilgiliTerimler": ["Kat Mülkiyeti", "Kat İrtifakı", "Kentsel Dönüşüm"]
    },
    {
        "terim": "Yönetim Planı",
        "slug": "yonetim-plani",
        "harf": "Y",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Kat mülkiyetine tabi ana gayrimenkulün yönetim tarzını, ortak yerlerin kullanımını ve kat maliklerinin hak ve borçlarını düzenleyen bağlayıcı sözleşmedir.",
        "hukukiKarsilik": "634 Sayılı Kat Mülkiyeti Kanunu md. 28.",
        "pratikteNeAnlamaGelir": "Sitede evcil hayvan beslenip beslenemeyeceği, otopark paylaşımı veya aidat kuralları tapu müdürlüğünde saklanan yönetim planıyla belirlenir.",
        "kritikUyari": "Evi satın alan yeni malik yönetim planını peşinen kabul etmiş sayılır; yönetim planını değiştirmek için kat maliklerinin beşte dördünün (4/5) oyu şarttır.",
        "ilgiliTerimler": ["Kat Mülkiyeti", "Ortak Alanlar", "Aidat"]
    },
    {
        "terim": "Ortak Alanlar (Ortak Yerler)",
        "slug": "ortak-alanlar-ortak-yerler",
        "harf": "O",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Ana gayrimenkulün bağımsız bölümleri dışında kalan, korunma ve ortak kullanıma tahsis edilmiş tüm temel, çatı, merdiven, asansör ve bahçe alanlarıdır.",
        "hukukiKarsilik": "634 Sayılı Kat Mülkiyeti Kanunu md. 4.",
        "pratikteNeAnlamaGelir": "Apartman çatısı, sığınak, yangın merdiveni ve bahçe hiçbir bağımsız bölüm malikinin tek başına kapatıp şahsi deposu veya dükkanı yapamayacağı alanlardır.",
        "kritikUyari": "Bahçe katı sahibinin bahçeyi çitle çevirip tek başına kullanması yönetim planında özel tahsis yoksa hukuka aykırıdır; diğer malikler müdahalenin men'i davası açabilir.",
        "ilgiliTerimler": ["Kat Mülkiyeti", "Yönetim Planı", "Arsa Payı"]
    },
    {
        "terim": "Tapu Şerhi",
        "slug": "tapu-serhi",
        "harf": "T",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir taşınmaz üzerindeki kişisel hakları, tasarruf kısıtlamalarını veya geçici tescilleri üçüncü kişilere karşı ileri sürülebilir kılmak için tapuya düşülen kayıttır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 1009, 1010 ve 1011.",
        "pratikteNeAnlamaGelir": "Kira sözleşmesi, satış vaadi veya aile konutu hakkı tapuya şerh edilirse mülk el değiştirse dahi yeni malik bu haklara uymak zorunda kalır.",
        "kritikUyari": "Şerh edilmemiş haklar sadece eski maliki bağlar; örneğin tapuya şerh edilmemiş 10 yıllık kira sözleşmesi yeni maliki TBK 351 uyarınca tahliye hakkından alıkoyamaz.",
        "ilgiliTerimler": ["Aile Konutu Şerhi", "Satış Vaadi Şerhi", "Haciz Şerhi"]
    },
    {
        "terim": "Satış Vaadi Şerhi",
        "slug": "satis-vaadi-serhi",
        "harf": "S",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Noterde düzenlenen gayrimenkul satış vaadi sözleşmesinin tapu kütüğünün şerhler hanesine tescil edilerek ayni etki kazandırılmasıdır.",
        "hukukiKarsilik": "Tapu Kanunu md. 26 ve TMK md. 1009.",
        "pratikteNeAnlamaGelir": "Müteahhitten inşaat halindeyken ev aldığınızda satış vaadini tapuya şerh ettirirseniz, müteahhit o daireyi gidip ikinci bir şahsa tapuda devredemez.",
        "kritikUyari": "Satış vaadi şerhi tapuya işlendiği tarihten itibaren 5 yıl geçerlidir; 5 yıl içinde kesin satış yapılmaz veya dava açılmazsa şerh kendiliğinden hükümsüz kalır.",
        "ilgiliTerimler": ["Tapu Şerhi", "Arsa Payı Karşılığı İnşaat", "Tapu İptal ve Tescil Davası"]
    },
    {
        "terim": "Tapu İptal ve Tescil Davası",
        "slug": "tapu-iptal-ve-tescil-davasi",
        "harf": "T",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Hukuka aykırı, sahte, yolsuz veya hileli olarak başkası adına tescil edilmiş tapu kaydının iptal edilerek gerçek hak sahibi adına tescili için açılan ayni davadır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 1025.",
        "pratikteNeAnlamaGelir": "Vekalet görevinin kötüye kullanılması, sahte kimlikle satış veya muris muvazaası durumlarında mülkü geri almak için Asliye Hukuk Mahkemesinde açılır.",
        "kritikUyari": "Dava açılır açılmaz tapu kütüğüne ihtiyati tedbir şerhi konulmalıdır; aksi takdirde kötü niyetli kişi mülkü iyiniyetli üçüncü bir şahsa satarsa taşınmazı geri almak imkansızlaşabilir.",
        "ilgiliTerimler": ["İhtiyati Tedbir Şerhi", "Yolsuz Tescil", "Muris Muvazaası"]
    },
    {
        "terim": "Yolsuz Tescil",
        "slug": "yolsuz-tescil",
        "harf": "Y",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bağlayıcı olmayan bir hukuki işleme dayanan veya hukuki sebepten tamamen yoksun olarak tapu kütüğüne yapılmış geçersiz tescil işlemidir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 1024 ve 1025.",
        "pratikteNeAnlamaGelir": "Sahte vekaletname ile yapılan satış veya ehliyetsiz kişinin imzaladığı devir tapuda tescil edilmiş olsa bile hukuken yolsuz tescildir ve mülkiyet kazandırmaz.",
        "kritikUyari": "Yolsuz tescil nedeniyle hak sahibi mülkünü geri isteyebilir; ancak taşınmaz tapu kütüğüne güvenerek iyi niyetle satın alan 3. kişiye geçmişse mülkiyet korunabilir (TMK 1023).",
        "ilgiliTerimler": ["Tapu İptal ve Tescil Davası", "Tapu Sicili"]
    },
    {
        "terim": "Arsa Payı Karşılığı İnşaat Sözleşmesi",
        "slug": "arsa-payi-karsiligi-insaat-sozlesmesi",
        "harf": "A",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Arsa sahibinin arsasının belirli paylarını müteahhide devretmeyi, müteahhidin de bu arsa üzerinde bağımsız bölümler inşa edip teslim etmeyi taahhüt ettiği karma sözleşmedir.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 470 vd. ve Noterlik Kanunu md. 60.",
        "pratikteNeAnlamaGelir": "Halk arasında kat karşılığı sözleşme denir; arsa sahibi para vermez, arsasını verir ve karşılığında anahtar teslim daireler alır.",
        "kritikUyari": "Bu sözleşme noterde resmi şekilde düzenlenmezse kesin hükümsüzdür; adi yazılı veya emlakçı protokolüyle yapılan kat karşılığı anlaşmalar hukuken bağlayıcı değildir.",
        "ilgiliTerimler": ["Kat İrtifakı", "Satış Vaadi Şerhi", "İskân"]
    },
    {
        "terim": "Yetkilendirme Sözleşmesi",
        "slug": "yetkilendirme-sozlesmesi",
        "harf": "Y",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Taşınmaz sahibinin gayrimenkulünün satışı veya kiralanması konusunda yetkili bir emlak işletmesine yazılı olarak temsil ve aracılık yetkisi verdiği resmi sözleşmedir.",
        "hukukiKarsilik": "Taşınmaz Ticareti Hakkında Yönetmelik md. 15.",
        "pratikteNeAnlamaGelir": "Emlak işletmesinin portallara ilan girebilmesi ve aracılık yapabilmesi için malikle imzalaması zorunlu olan, hizmet bedelini ve yetki süresini belirleyen sözleşmedir.",
        "kritikUyari": "Yetkilendirme sözleşmesi olmaksızın gayrimenkul ilanı vermek ve pazarlama yapmak kanunen yasaktır; yetki belgesiz aracılara karşı Bakanlık idari para cezası uygular.",
        "ilgiliTerimler": ["Müstakil Tapu", "Hisseli Tapu"]
    },
    {
        "terim": "Cayma Akçesi (Pey Akçesi)",
        "slug": "cayma-akcesi-pey-akcesi",
        "harf": "C",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Sözleşme yapılırken taraflardan birinin sözleşmeden serbestçe dönebilmesini sağlamak amacıyla diğer tarafa peşinen verdiği bedeldir.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 177 ve 178.",
        "pratikteNeAnlamaGelir": "Alıcı gayrimenkulü almaktan vazgeçerse verdiği cayma akçesini geri alamaz; satıcı vazgeçerse aldığı bedelin iki katını iade etmekle yükümlüdür.",
        "kritikUyari": "Sözleşmede verilen paranın bağlanma parası mı cayma akçesi mi olduğu açıkça yazılmalıdır; aksi takdirde kanunen bağlanma parası sayılır ve cayma hakkı vermez.",
        "ilgiliTerimler": ["Satış Vaadi Şerhi", "Tapu Harcı"]
    },
    {
        "terim": "Alım (İştira) Hakkı",
        "slug": "alim-istira-hakki",
        "harf": "A",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Hak sahibine tek taraflı irade beyanıyla belirli bir taşınmazı sözleşmede kararlaştırılan koşullarla satın alma yetkisi veren haktır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 736 ve TBK md. 238.",
        "pratikteNeAnlamaGelir": "Arsa veya daire üzerinde tapuya iştira hakkı şerh ettiren kişi, malik satmak istemese bile belirlenen fiyattan tek taraflı bildirimle satın alabilir.",
        "kritikUyari": "İştira hakkı tapuya şerh verildiği tarihten itibaren en fazla 10 yıl süreyle geçerlidir; 10 yılı aşan süreler tapuda kendiliğinden hükümsüz kalır.",
        "ilgiliTerimler": ["Vefa (Geri Alım) Hakkı", "Şufa (Önalım) Hakkı", "Tapu Şerhi"]
    },
    {
        "terim": "Vefa (Geri Alım) Hakkı",
        "slug": "vefa-geri-alim-hakki",
        "harf": "V",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Taşınmazını satan kişinin, sözleşmede belirlenen süre ve bedel karşılığında sattığı taşınmazı tek taraflı iradeyle geri alma hakkıdır.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 237-238 ve TMK md. 736.",
        "pratikteNeAnlamaGelir": "Maddi sıkışıklık nedeniyle mülkünü satan kişi, vefa hakkı sözleşmesi yaparak örneğin 3 yıl içinde parasını denkleştirip evini aynı şartlarla geri satın alabilir.",
        "kritikUyari": "Vefa hakkı süresi kanunen en fazla 10 yıl olabilir ve tapuya şerh verilmezse mülkü devralan iyi niyetli 3. kişilere karşı ileri sürülemez.",
        "ilgiliTerimler": ["Alım (İştira) Hakkı", "Şufa (Önalım) Hakkı", "Tapu Şerhi"]
    },
    {
        "terim": "Tenkis Davası",
        "slug": "tenkis-davasi",
        "harf": "T",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Mirasbırakanın saklı paylı mirasçılarının yasal paylarını zedeleyen tasarruflarının ve bağışlarının yasal sınıra indirilmesi için açılan davadır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 560-571.",
        "pratikteNeAnlamaGelir": "Anne veya baba sağlığında tüm gayrimenkullerini bir vakfa veya üçüncü bir şahsa bağışlarsa, çocukları ve eşi saklı payları oranında tenkis davası açarak paylarını talep eder.",
        "kritikUyari": "Mirasçıların saklı paylarının zedelendiğini öğrendikleri tarihten itibaren 1 yıl ve her halde mirasın açılmasından itibaren 10 yıl içinde dava açması şarttır.",
        "ilgiliTerimler": ["Muris Muvazaası", "Veraset İlamı", "Miras İntikali"]
    },
    {
        "terim": "Mecra Hakkı",
        "slug": "mecra-hakki",
        "harf": "M",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Su, gaz, elektrik ve kanalizasyon gibi kamu veya özel tesisat hatlarının başkasına ait arazinin altından veya üstünden geçirilmesi yetkisi veren irtifak hakkıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 744.",
        "pratikteNeAnlamaGelir": "Tarlanıza su veya elektrik getirmek için komşunun arazisinden hat geçirmek zorunda kaldığınızda tapuya mecra hakkı tescil edilir.",
        "kritikUyari": "Arazisinden hat geçen malik arazisinin zarar görmemesi ve hattın en az külfet getirecek güzergahtan geçirilmesini talep etme hakkına sahiptir.",
        "ilgiliTerimler": ["Geçit Hakkı", "İrtifak Hakkı", "Kadastral Yol"]
    },
    {
        "terim": "Rehin Açığı Belgesi",
        "slug": "rehin-acigi-belgesi",
        "harf": "R",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "İpotekli taşınmazın icra yoluyla satılması sonucunda elde edilen satış bedelinin alacaklının borcunu tamamen karşılamaması halinde kalan kısım için verilen resmi belgedir.",
        "hukukiKarsilik": "İcra ve İflas Kanunu md. 152.",
        "pratikteNeAnlamaGelir": "Banka borcunuz 5 milyon TL iken eviniz icrada 3 milyon TL'ye satılırsa, banka kalan 2 milyon TL için rehin açığı belgesi alıp maaşınıza veya diğer mallarınıza haciz koyar.",
        "kritikUyari": "Rehin açığı belgesi alan alacaklı 1 yıl içinde borçlunun diğer malvarlıklarına haciz koyabilir ve bu takip için borçluya yeni bir ödeme emri gönderilmesi gerekmez.",
        "ilgiliTerimler": ["İpotek", "Haciz Şerhi", "Cebri Satış"]
    },
    {
        "terim": "Muhdesat (Yapı ve Ağaç Şerhi)",
        "slug": "muhdesat-yapi-ve-agac-serhi",
        "harf": "M",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir arazinin üzerinde bulunan bina, tesis veya ağaçların arazinin malikinden farklı bir kişiye ait olduğunu gösteren tapu kütüğü beyan kaydıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 722, 724 ve 729.",
        "pratikteNeAnlamaGelir": "Hisseli bir tarlada arsa herkesin ortak malı iken üzerindeki 2 katlı betonarme evin sadece Ahmet'e ait olduğu tapunun beyanlar hanesine tescil edilebilir.",
        "kritikUyari": "Taşınmaz satıldığında üzerindeki muhdesat da arsa ile birlikte el değiştirir; muhdesat sahibinin hakkı tescil edilmemişse arsa satışında bina bedelini talep etmek çok zorlaşır.",
        "ilgiliTerimler": ["Beyanlar Hanesi", "Hisseli Tapu", "İzale-i Şüyu"]
    },
    {
        "terim": "Beyanlar Hanesi",
        "slug": "beyanlar-hanesi",
        "harf": "B",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Tapu kütüğü sayfasında taşınmazın fiili, hukuki veya eklenti durumlarına dair resmi açıklamaların yazıldığı özel sicil sütunudur.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 1012 ve Tapu Sicili Tüzüğü.",
        "pratikteNeAnlamaGelir": "Otopark eklentisi, kömürlük, kentsel dönüşüm riskli yapı şerhi, 2B kullanım kadastrosu kullanıcı ismi veya sit alanı kayıtları beyanlar hanesine yazılır.",
        "kritikUyari": "Beyanlar hanesi taşınmaz üzerinde doğrudan ayni hak doğurmaz ancak taşınmazın hukuki durumunu ilan eder; alıcı 'ben bilmiyordum' diyemez.",
        "ilgiliTerimler": ["Tapu Şerhi", "Muhdesat", "Takyidat"]
    },
    {
        "terim": "Feragat (Miras Feragati)",
        "slug": "feragat-miras-feragati",
        "harf": "F",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Mirasçının mirasbırakan hayattayken onunla noterde resmi şekilde düzenleme şeklinde sözleşme yaparak ileride doğacak miras hakkından vazgeçmesidir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 528-530.",
        "pratikteNeAnlamaGelir": "Babadan sağlığında belirli bir bedel veya dükkan alan çocuk, diğer kardeşleriyle ileride miras kavgası çıkmasın diye resmi miras feragat sözleşmesi imzalayabilir.",
        "kritikUyari": "Miras feragat sözleşmesi noterde resmi vasiyetname şeklinde yapılmazsa geçersizdir; ivazlı (bedelli) feragatte feragat edenin altsoyu da mirastan pay alamaz.",
        "ilgiliTerimler": ["Veraset İlamı", "Tenkis Davası", "Muris Muvazaası"]
    },
    {
        "terim": "Reddi Miras (Mirasın Reddi)",
        "slug": "reddi-miras-mirasin-reddi",
        "harf": "R",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Yasal veya atanmış mirasçıların, mirasbırakanın vefatı üzerine terekenin borca batık olması veya şahsi sebeplerle mirası kabul etmediklerini Sulh Hukuk Mahkemesine bildirmesidir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 605-618.",
        "pratikteNeAnlamaGelir": "Vefat eden kişinin geride bıraktığı gayrimenkullerin değeri borçlarını karşılamıyorsa mirasçılar 3 ay içinde mahkemeye başvurarak borçlardan kurtulur.",
        "kritikUyari": "Ret süresi ölümün öğrenildiği tarihten itibaren 3 aydır; mirasçılar tereke mallarını kullanır veya satarsa mirası zımnen kabul etmiş sayılır ve ret hakkını kaybeder.",
        "ilgiliTerimler": ["Veraset İlamı", "Miras İntikali", "Haciz Şerhi"]
    },
    {
        "terim": "Cebri Satış (İcra İhalesi)",
        "slug": "cebri-satis-icra-ihalesi",
        "harf": "C",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Borcunu ödeyemeyen mülk sahibinin taşınmazının icra dairesi veya sulh hukuk mahkemesi marifetiyle açık artırma usulüyle zorla satılması işlemidir.",
        "hukukiKarsilik": "İcra ve İflas Kanunu md. 112-137.",
        "pratikteNeAnlamaGelir": "UYAP e-Satış portalı üzerinden tüm vatandaşların teklif verebildiği, rayiç bedelin %50'sinden başlayan açık artırma satışıdır.",
        "kritikUyari": "İhaleden yer alırken tahliye zorluğu, birikmiş bina aidatı ve KDV oranı mutlaka hesaba katılmalıdır; ihalenin feshi davası açılırsa tapu tescili 1-2 yıl gecikebilir.",
        "ilgiliTerimler": ["İpotek", "Haciz Şerhi", "İzale-i Şüyu"]
    },
    {
        "terim": "İhdas (Yoldan İhdas)",
        "slug": "ihdas-yoldan-ihdas",
        "harf": "İ",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "İmar planı değişikliği sonucunda kapanan veya fonksiyonunu yitiren eski yolların belediye adına parsel olarak tapuya tescil edilip komşu parsele satılmasıdır.",
        "hukukiKarsilik": "3194 Sayılı İmar Kanunu md. 11 ve Tapu Kanunu md. 21.",
        "pratikteNeAnlamaGelir": "Arsanızın önündeki yol güzergahı kaydırıldığında arada kalan kör toprak parçası belediye tarafından ihdas edilir ve parselinizi büyütmeniz için size satılır.",
        "kritikUyari": "İhdas edilen parça müstakil inşaata elverişli değilse belediyece kanunen doğrudan bitişik parsel malikine teklif edilir; satın alınmazsa parselinizin yola cephesi kapanabilir.",
        "ilgiliTerimler": ["Yola Terk", "Tevhid", "İmar Çapı"]
    },
    {
        "terim": "Trampa (Mülk Takası)",
        "slug": "trampa-mulk-takasi",
        "harf": "T",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir taşınmazın mülkiyetinin para karşılığı olmaksızın başka bir taşınmaz veya hak ile karşılıklı olarak değiştirilmesi sözleşmesidir.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 282-284 ve Tapu Kanunu.",
        "pratikteNeAnlamaGelir": "Silivri'deki arsanızı Kadıköy'deki bir daire ile tapuda kafa kafaya veya üzerine bir miktar para ekleyerek resmi olarak takas etmeniz işlemidir.",
        "kritikUyari": "Trampa işleminde tapu harcı her iki gayrimenkulün değerinin toplamı üzerinden değil, değeri yüksek olan taşınmazın emlak beyan değeri üzerinden binde 20 oranında alınır.",
        "ilgiliTerimler": ["Tapu Harcı", "Rayiç Bedel", "Değer Artış Kazancı Vergisi"]
    },
    {
        "terim": "Takyidat (Tapu Kayıt Örneği)",
        "slug": "takyidat-tapu-kayit-ornegi",
        "harf": "T",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir taşınmazın mülkiyet durumunu, üzerinde bulunan tüm ipotek, haciz, intifa, tedbir, şerh ve beyanları ayrıntılı gösteren resmi sicil belgesidir.",
        "hukukiKarsilik": "Tapu Sicili Tüzüğü md. 13 ve TMK md. 1020.",
        "pratikteNeAnlamaGelir": "Gayrimenkul alırken sadece eldeki tapu senedine güvenilmez; Web Tapu üzerinden güncel takyidat belgesi indirilerek mülkün üzerinde gizli bir borç olup olmadığı denetlenir.",
        "kritikUyari": "Eldeki basılı tapu senedi mülkün 5 yıl önceki halini gösterebilir; oysa kütüğe dün işlenmiş bir icra haczi ancak güncel takyidat belgesinde görünür.",
        "ilgiliTerimler": ["Haciz Şerhi", "İpotek", "Tapu Şerhi", "Web Tapu Sistemi"]
    },
    {
        "terim": "Web Tapu Sistemi",
        "slug": "web-tapu-sistemi",
        "harf": "W",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Vatandaşların ve şirketlerin tapu müdürlüğüne gitmeden internet üzerinden tapu kayıtlarını inceleyebildiği, başvuru yapabildiği ve yetki verebildiği e-devlet portalıdır.",
        "hukukiKarsilik": "Tapu ve Kadastro Genel Müdürlüğü 2017/3 Sayılı Genelgesi.",
        "pratikteNeAnlamaGelir": "E-devlet şifrenizle giriş yaparak üzerinize kayıtlı tüm ev ve arsaları görür, emlakçıya takyidat görme yetkisi tanımlar veya satış randevusu alırsınız.",
        "kritikUyari": "Web tapu üzerinden 'işlem yapılamaz beyanı' koyarak kimlik hırsızlığı veya sahte vekaletle yapılacak yetkisiz tapu devirlerine karşı gayrimenkulünüzü kilitleyebilirsiniz.",
        "ilgiliTerimler": ["Takyidat", "Tapu Harcı", "Döner Sermaye Bedeli"]
    }
]

print(f"Tapu terimleri hazır: {len(TAPU_TERIMLERI)} adet")
