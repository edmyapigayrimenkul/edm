# -*- coding: utf-8 -*-
"""
data_pratik.py — EDM Emlak Sözlüğü Pratik Saha & İnşaat & Hukuk Terimleri (60+ terim)
"""

PRATIK_TERIMLER = [
    {
        "terim": "Sismik İzolatör (Deprem Yalıtımı)",
        "slug": "sismik-izolator-deprem-yalitimi",
        "harf": "S",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Bina temeli ile üst yapı arasına yerleştirilen, deprem enerjisini emerek zemin sarsıntısının binaya geçmesini engelleyen kauçuk veya sürtünmeli yalıtım sistemidir.",
        "hukukiKarsilik": "Türkiye Bina Deprem Yönetmeliği (TBDY 2018) Bölüm 14.",
        "pratikteNeAnlamaGelir": "Şehir hastanelerinde ve lüks rezidanslarda kullanılır; şiddetli 7.5 depremde bile binadaki mobilyalar devrilmez ve bina hasarsız ayakta kalır.",
        "kritikUyari": "Sismik izolatörlü binaların çevresinde en az 50 cm sismik boşluk bırakılmalıdır; bu boşluğun toprak veya betonla dolması izolasyonu işlevsiz kılar.",
        "ilgiliTerimler": ["Radye Jeneral Temel", "Tünel Kalıp Sistemi", "Perde Beton"]
    },
    {
        "terim": "İstinat Duvarı (Dayanma Duvarı)",
        "slug": "istinat-duvari-dayanma-duvari",
        "harf": "İ",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Eğimli arazilerde veya kazı yapılan parsellerde yandaki toprağın kaymasını ve komşu binaların çökmesini önlemek için inşa edilen betonarme dayanma duvarıdır.",
        "hukukiKarsilik": "Planlı Alanlar İmar Yönetmeliği ve TBDY 2018.",
        "pratikteNeAnlamaGelir": "Kot farkı olan arsalarda arka veya yan komşunun arazisini tutmak için inşa edilir; arkasında drenaj delikleri (barbakan) bulunur.",
        "kritikUyari": "Drenajı yapılmayan istinat duvarlarının arkasında biriken yağmur suyu hidrostatik basınçla duvarı devirir ve can kaybına yol açar.",
        "ilgiliTerimler": ["Kot Kesit Belgesi", "Drenaj Hattı", "Zemin Etüt Raporu"]
    },
    {
        "terim": "Grobeton (Temel Altı Betonu)",
        "slug": "grobeton-temel-alti-betonu",
        "harf": "G",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Temel kazısı bittikten sonra zemin ile radye temel donatısının temasını kesmek ve düz bir çalışma zemini oluşturmak için dökülen demirsiz düşük dozlu betondur.",
        "hukukiKarsilik": "TS 500 ve Binalarda Su Yalıtımı Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Toprağın üzerine 10 cm kalınlığında serilir; üzerine su yalıtım membranları döşenir ve onun üzerine temel demirleri örülür.",
        "kritikUyari": "Grobeton dökülmeden doğrudan çamurlu toprağın üstüne temel demiri döşeyen müteahhitler demirin paslanmasına ve binanın çürümesine yol açar.",
        "ilgiliTerimler": ["Radye Jeneral Temel", "Bohçalama Su Yalıtımı", "Paspayı"]
    },
    {
        "terim": "Şap Betonu ve Tesviye Tabakası",
        "slug": "sap-betonu-ve-tesviye-tabakasi",
        "harf": "Ş",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Betonarme kat döşemesinin üzerine tesisat borularını gizlemek, ısı-ses yalıtımı sağlamak ve parke/seramik için düz zemin oluşturmak üzere dökülen harç tabakasıdır.",
        "hukukiKarsilik": "TS 13566 ve Planlı Alanlar İmar Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Daire içinde yerden ısıtma borularının üzerine helikopter perdahıyla dökülen teraziye alınmış düzgün zemin kaplamasıdır.",
        "kritikUyari": "Şapın gereğinden kalın dökülmesi (10-15 cm) binaya tonlarca ilave gereksiz ölü yük bindirir ve deprem güvenliğini olumsuz etkiler.",
        "ilgiliTerimler": ["Yerden Isıtma", "Kat Mülkiyeti"]
    },
    {
        "terim": "Gazbeton (Ytong)",
        "slug": "gazbeton-ytong",
        "harf": "G",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Kuvarsit, çimento, kireç ve suyun gözenekli yapıda fırınlanmasıyla üretilen, binaya hafiflik ve yüksek ısı yalıtımı sağlayan yapı duvar malzemesidir.",
        "hukukiKarsilik": "TS EN 771-4 ve Binalarda Isı Yalıtımı Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Binaların dış ve iç bölme duvarlarında kullanılır; hafif olduğu için depremde taşıyıcı sisteme binen duvar yükünü yarı yarıya azaltır.",
        "kritikUyari": "Gazbeton taşıyıcı değildir; üzerine kolon veya kiriş yükü bindirilemez. Su emme kapasitesi yüksek olduğundan dış cephede mutlaka su itici sıva ile kaplanmalıdır.",
        "ilgiliTerimler": ["Mantolama", "Karkas", "Bina Ağırlığı"]
    },
    {
        "terim": "Cam Balkon İmar Durumu ve Kat Malikleri Rızası",
        "slug": "cam-balkon-imar-durumu",
        "harf": "C",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "Daire balkonlarının katlanır veya sürme cam panellerle kapatılmasının mimari projeye uygunluğu ve kat mülkiyeti kanunundaki hukuki statüsüdür.",
        "hukukiKarsilik": "634 Sayılı KMK md. 19 ve Yargıtay 18. Hukuk Dairesi Kararları.",
        "pratikteNeAnlamaGelir": "Yargıtay yerleşik içtihatlarına göre dış cephede yapılan renkli veya sabit cam balkon uygulamaları için kat maliklerinin 4/5 yazılı onayı aranır.",
        "kritikUyari": "Kat maliklerinden biri dava açarsa mahkeme cam balkonun sökülmesine ve eski haline getirilmesine karar verebilir. Balkonu odaya katmak kaçak alan sayılır.",
        "ilgiliTerimler": ["Kat Malikleri Kurulu", "Ortak Alanlar", "Ruhsata Aykırı Yapı"]
    },
    {
        "terim": "Çatı Piyesi (Çatı Dubleksi)",
        "slug": "cati-piyesi-cati-dubleksi",
        "harf": "Ç",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "En üst kattaki bağımsız bölümün içinden merdivenle çıkılan, çatı eğimi içinde kalan ve tapuda o daireye bağlı olarak tescil edilen eklenti kullanım alanıdır.",
        "hukukiKarsilik": "Planlı Alanlar İmar Yönetmeliği md. 38.",
        "pratikteNeAnlamaGelir": "Üst kat dairenin tavanından çıkılan teraslı odalardır; bağımsız bir tapusu yoktur, altındaki dairenin ayrılmaz bir parçasıdır.",
        "kritikUyari": "Çatı piyesini alt daireden ayırıp dışarıdan kapı açarak bağımsız daire gibi başkasına kiraya vermek veya satmak kaçak yapılaşmadır ve mühürleme sebebidir.",
        "ilgiliTerimler": ["Bağımsız Bölüm", "Eklenti", "Kat Mülkiyeti"]
    },
    {
        "terim": "Ters Dubleks (Bahçe Katı Dubleksi)",
        "slug": "ters-dubleks-bahce-kati",
        "harf": "T",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Giriş kapısı zemin katta veya yüksek girişte olup, yatak odaları veya salonu merdivenle alt bodrum/bahçe katına inen iki katlı konut tipidir.",
        "hukukiKarsilik": "Planlı Alanlar İmar Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Bahçe kullanımı sağlayan geniş metrekareli dairelerdir; alt katın doğrudan bahçeye açılması müstakil ev konforu sunar.",
        "kritikUyari": "Alt katın iyi havalanması, gün ışığı alması ve temel su yalıtımının (bohçalama) kusursuz yapılmış olması şarttır; aksi halde rutubet problemi yaşanır.",
        "ilgiliTerimler": ["Bohçalama Su Yalıtımı", "Drenaj Hattı", "Kot Kesit Belgesi"]
    },
    {
        "terim": "Asma Kat (Galeri Katı)",
        "slug": "asma-kat-galeri-kati",
        "harf": "A",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "Zemin kat yüksekliği en az 5.50 metre olan dükkan ve mağazalarda, taban alanının en fazla %50'si kadar yapılabilen ve içten merdivenle çıkılan ara kattır.",
        "hukukiKarsilik": "Planlı Alanlar İmar Yönetmeliği md. 4 ve 19.",
        "pratikteNeAnlamaGelir": "Dükkanların ofis, muhasebe veya depo olarak kullandığı iç balkondur; sokaktan bağımsız girişi bulunamaz.",
        "kritikUyari": "Ruhsatsız olarak sonradan yapılan demir profilli asma katlar kaçak yapı sayılır; kolonlara kaynaklanan ağır asma katlar depremde binayı çökertir.",
        "ilgiliTerimler": ["Bağımsız Bölüm", "İmar Çapı", "Kaçak Yapı"]
    },
    {
        "terim": "Merkezi Isıtma Pay Ölçer (Kalorimetre)",
        "slug": "merkezi-isitma-pay-olcer-kalorimetre",
        "harf": "M",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Merkezi sistemle ısıtılan binalarda her bağımsız bölümün tükettiği gerçek ısı enerjisini ölçerek yakıt faturasının tüketime göre paylaştırılmasını sağlayan cihazdır.",
        "hukukiKarsilik": "5627 Sayılı Enerji Verimliliği Kanunu ve Binalarda Isı Dağıtımı Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Apartmanda yakıt faturasının %70'i tüketilen kalorimetre endeksine göre, %30'u ise ortak alan ısınması olarak arsa payı oranında paylaştırılır.",
        "kritikUyari": "Vanayı tamamen kapatmak kanunen yasaktır; ortam sıcaklığının asgari 15 derecenin altına düşürülmesi diğer komşuların ısısını çalmak sayılır ve ceza uygulanır.",
        "ilgiliTerimler": ["Kat Malikleri Kurulu", "Yönetim Planı", "Enerji Kimlik Belgesi"]
    },
    {
        "terim": "Yerden Isıtma Sistemi",
        "slug": "yerden-isitma-sistemi",
        "harf": "Y",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Kat şapı altına döşenen oksijen bariyerli PEX borular içinden düşük sıcaklıkta (35-45°C) su dolaştırılarak mekanın tabandan homojen ısıtılmasıdır.",
        "hukukiKarsilik": "TS EN 1264 ve Binalarda Enerji Performansı Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Radyatör petekleri ortadan kalktığı için duvarlar tamamen mobilyaya açılır; yoğuşmalı kombi veya ısı pompasıyla %20-%30 enerji tasarrufu sağlar.",
        "kritikUyari": "Şap dökülmeden önce borulara basınç testi yapılmalıdır; delik boru sonradan alt kata su sızdırır ve tamiri tüm parkelerin sökülmesini gerektirir.",
        "ilgiliTerimler": ["Şap Betonu", "Enerji Kimlik Belgesi (EKB)"]
    },
    {
        "terim": "Otopark Yönetmeliği (Daire Başına 1 Otopark)",
        "slug": "otopark-yonetmeligi",
        "harf": "O",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "Yeni inşa edilen binalarda her bir bağımsız konut birimi için parsel sınırları içinde en az 1 adet zorunlu otopark yeri ayrılmasını emreden mevzuattır.",
        "hukukiKarsilik": "Resmi Gazete: 22.02.2018 / 30340 Sayılı Otopark Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Bodrum katta kapalı otoparkı veya bahçesinde açık otoparkı olmayan projelere belediyeler inşaat ruhsatı ve iskan vermez.",
        "kritikUyari": "Parselinde otopark yapılması fiziken imkansızsa belediyenin otopark fonuna yüksek otopark harcı yatırılması zorunludur.",
        "ilgiliTerimler": ["Emsal Harici Alanlar", "Ortak Alanlar", "Yapı Ruhsatı"]
    },
    {
        "terim": "Mekanik Otopark (Araç Lift Sistemi)",
        "slug": "mekanik-otopark-arac-lift",
        "harf": "M",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Dar arsalarda otopark sayısını artırmak için hidrolik veya motorlu platformlarla araçların altlı üstlü park edilmesini sağlayan otomatik sistemdir.",
        "hukukiKarsilik": "Otopark Yönetmeliği md. 6.",
        "pratikteNeAnlamaGelir": "Tek bir araçlık yere iki araba sığdırılarak belediyenin otopark şartı karşılanır ve dairelerin satış değeri yükselir.",
        "kritikUyari": "Mekanik otoparkların periyodik bakımı düzenli yapılmazsa araç sıkışması ve arıza sebebiyle kat malikleri arasında ciddi ihtilaflar doğar.",
        "ilgiliTerimler": ["Otopark Yönetmeliği", "Emsal Harici Alanlar"]
    },
    {
        "terim": "Engelli Erişimi ve Rampa Standartları",
        "slug": "engelli-erisimi-ve-rampa-standartlari",
        "harf": "E",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Bina girişlerinde ve ortak alanlarda engellilerin tekerlekli sandalyeyle erişimini sağlamak üzere zorunlu tutulan azami %6-%8 eğimli rampa ve asansör kurallarıdır.",
        "hukukiKarsilik": "5378 Sayılı Engelliler Hakkında Kanun ve Planlı Alanlar İmar Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Yeni yapılan tüm apartmanlarda merdivenin yanında rampa veya engelli asansör platformu projelendirilmeden iskan alınamaz.",
        "kritikUyari": "Eğimi %8'den dik yapılan rampalar tekerlekli sandalye için devrilme tehlikesi yaratır ve belediye denetiminde reddedilir.",
        "ilgiliTerimler": ["Yapı Kullanma İzin Belgesi", "Ortak Alanlar"]
    },
    {
        "terim": "Schmidt Çekici (Yüzey Sertlik Testi)",
        "slug": "schmidt-cekici-yuzey-sertlik-testi",
        "harf": "S",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Betonarme kolon ve kirişlerin yüzeyine yaylı çekiç fırlatılarak geri sıçrama değerinden betonun yaklaşık basınç mukavemetini ölçen tahribatsız testtir.",
        "hukukiKarsilik": "TS EN 12504-2 ve Deprem Performans Analizi Esasları.",
        "pratikteNeAnlamaGelir": "Binaya delik açmadan veya zarar vermeden 5 dakikada betonun yaklaşık kalitesi ve sağlamlığı hakkında ön fikir verir.",
        "kritikUyari": "Schmidt çekici tek başına kesin sonuç vermez; karbonatlaşmış eski beton yüzeyinde yanıltıcı yüksek sonuçlar verebilir, mutlaka karot testiyle doğrulanmalıdır.",
        "ilgiliTerimler": ["Karot Numunesi Alımı", "Beton Sınıfı", "Statik Performans Analizi"]
    },
    {
        "terim": "Orta Hasarlı Bina Statüsü",
        "slug": "orta-hasarli-bina-statusu",
        "harf": "O",
        "kategori": "Kentsel Dönüşüm",
        "kisaTanim": "Deprem sonrasında taşıyıcı sisteminde onarılabilir ve güçlendirilebilir düzeyde hasar tespit edilen, güçlendirme yapılmadan oturulması yasaklanan yapıdır.",
        "hukukiKarsilik": "7269 Sayılı Umumi Hayata Müessir Afetler Kanunu.",
        "pratikteNeAnlamaGelir": "Orta hasarlı binalara 1 yıl içinde güçlendirme ruhsatı alınıp güçlendirme tamamlanmazsa bina ağır hasarlı sayılarak belediyece yıkılır.",
        "kritikUyari": "Orta hasarlı binayı güçlendirmeden içine kiracı sokmak veya oturmak hayati suçtur; valilik kararıyla binanın elektriği ve suyu kesilerek mühürlenir.",
        "ilgiliTerimler": ["Statik Güçlendirme Projesi", "Yıkım Kararı", "Afet Riski"]
    },
    {
        "terim": "DASK Azami Teminat Limiti",
        "slug": "dask-azami-teminat-limiti",
        "harf": "D",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Doğal Afet Sigortaları Kurumu'nun (DASK) depremde tamamen yıkılan bir konut için hak sahibine ödeyeceği yıllık resmi tavan tazminat tutarıdır.",
        "hukukiKarsilik": "6305 Sayılı Afet Sigortaları Kanunu ve DASK Tarife Tebliği.",
        "pratikteNeAnlamaGelir": "Zorunlu Deprem Sigortası piyasa değerini değil, sadece yeniden yapım maliyetini belirli bir limite kadar karşılar.",
        "kritikUyari": "Evinizin yeniden yapım maliyeti bu tavanı aşıyorsa aradaki fark için özel sigorta şirketlerinden ihtiyari konut deprem teminatı yaptırmalısınız.",
        "ilgiliTerimler": ["Emlak Vergisi", "Riskli Yapı Tespiti"]
    },
    {
        "terim": "Ecrimisil Davası (Haksız İşgal Tazminatı)",
        "slug": "ecrimisil-davasi-haksiz-isgal",
        "harf": "E",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir taşınmazı malikin rızası hilafına haksız yere kullanan veya işgal eden kişiden geriye dönük son 5 yıl için talep edilen kira benzeri tazminattır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 995 ve Yargıtay İçtihadı Birleştirme Kararları.",
        "pratikteNeAnlamaGelir": "Hisseli tarlayı tek başına ekip biçen veya miras kalan evi kardeşlerine para vermeden tek başına kullanan hissedara karşı ecrimisil davası açılır.",
        "kritikUyari": "Hissedarlar arasında ecrimisil istenebilmesi için önceden intifadan men koşulunun noter ihtarıyla gerçekleşmesi şarttır.",
        "ilgiliTerimler": ["Hisseli Tapu", "Müdahalenin Men'i Davası", "Ortaklığın Giderilmesi"]
    },
    {
        "terim": "Müdahalenin Men'i Davası (Elatmanın Önlenmesi)",
        "slug": "mudahalenin-meni-davasi",
        "harf": "M",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Malikin taşınmaz üzerindeki mülkiyet hakkını kullanmasını haksız yere engelleyen veya arsasını izinsiz işgal eden kişiye karşı açılan tahliye ve koruma davasıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 683.",
        "pratikteNeAnlamaGelir": "Arsanıza izinsiz çit çeken, hafriyat döken veya dükkanınızı sözleşmesiz işgal eden kişiyi mahkeme kararıyla zorla uzaklaştırırsınız.",
        "kritikUyari": "Müdahalenin men'i davası ayni hakka dayandığı için herhangi bir zamanaşımına tabi değildir; işgal sürdüğü müddetçe her zaman açılabilir.",
        "ilgiliTerimler": ["Ecrimisil Davası", "Kal Davası", "Tapu Kütüğü"]
    },
    {
        "terim": "Kal Davası (Haksız Yapının Yıktırılması)",
        "slug": "kal-davasi-haksiz-yapinin-yiktirilmasi",
        "harf": "K",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Başkasına ait bir arazi üzerine malikin izni olmaksızın inşa edilen bina, duvar veya tesislerin mahkeme kararıyla yıktırılıp arazinin eski haline getirilmesidir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 722.",
        "pratikteNeAnlamaGelir": "Komşu arsanıza izinsiz taşarak gecekondu veya bina yapan kişiye karşı açılır; masrafları işgalciye ait olmak üzere yapı yıktırılır.",
        "kritikUyari": "Yapının yıkılması aşırı bir zarara yol açacaksa ve işgalci iyi niyetliyse mahkeme uygun bir bedel karşılığında arsa payının işgalciye devrine karar verebilir.",
        "ilgiliTerimler": ["Müdahalenin Men'i Davası", "Taşkın Yapı"]
    },
    {
        "terim": "Taşkın Yapı",
        "slug": "taskin-yapi",
        "harf": "T",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir parsel üzerinde inşa edilen binanın bir kısmının sınırları aşarak bitişikteki komşu parselin arazisine taşması durumudur.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 725.",
        "pratikteNeAnlamaGelir": "Aplikasyon hatası sebebiyle komşunun arsasına 1 metre giren binalarda ortaya çıkan hukuki uyuşmazlıktır.",
        "kritikUyari": "Taşan kısım malik tarafından iyi niyetle yapılmışsa ve komşu zamanında itiraz etmemişse, mahkeme uygun bir tazminatla irtifak hakkı veya mülkiyet devri kararı verebilir.",
        "ilgiliTerimler": ["Aplikasyon Krokisi", "Kal Davası", "İrtifak Hakları Sütunu"]
    },
    {
        "terim": "Gayrimenkulde Hukuki Ayıp",
        "slug": "gayrimenkulde-hukuki-ayip",
        "harf": "G",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Taşınmazın değerini veya kullanım amacını kısıtlayan sit alanı kararı, kamulaştırma şerhi, imar kısıtlaması gibi kamu hukuku engelleridir.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 219 vd.",
        "pratikteNeAnlamaGelir": "Satıcının alıcıya 'imarlı arsa' diye sattığı yerin aslında arkeolojik sit alanı veya taşkın koruma sahası çıkması durumudur.",
        "kritikUyari": "Hukuki ayıp durumunda alıcı sözleşmeden dönerek parasını yasal faiziyle geri isteyebilir veya ayıp oranında satış bedelinden indirim talep edebilir.",
        "ilgiliTerimler": ["Maddi Ayıp", "Tapu İptal ve Tescil Davası"]
    },
    {
        "terim": "Gayrimenkulde Maddi Ayıp",
        "slug": "gayrimenkulde-maddi-ayip",
        "harf": "G",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Yapının fiziki niteliklerinde, işçiliğinde veya malzemesinde sözleşmeye ve fen kurallarına aykırı olan çatı akması, tesisat patlağı, duvar çatlağı gibi kusurlardır.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 219 ve 6502 Sayılı Kanun md. 8-12.",
        "pratikteNeAnlamaGelir": "Sıfır daire satın aldığınızda ilk kış yağmurunda tavanın akması veya bodrumdan su fışkırması maddi ayıptır.",
        "kritikUyari": "Açık ayıplar teslimden itibaren derhal (en geç 30 gün), gizli ayıplar ise ortaya çıkar çıkmaz müteahhide noterden yazılı olarak ihbar edilmelidir.",
        "ilgiliTerimler": ["Hukuki Ayıp", "Bina Tamamlama Sigortası"]
    },
    {
        "terim": "Tapuda Vekaletname ile Satış Şartları",
        "slug": "tapuda-vekaletname-ile-satis-sartlari",
        "harf": "T",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir taşınmazın maliki adına vekili tarafından satılabilmesi için noterde düzenlenen vekaletnamede 'taşınmaz satışı yapmaya' açık ve özel yetki verilmesi zorunluluğudur.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 504/3 ve Tapu Sicili Tüzüğü md. 18.",
        "pratikteNeAnlamaGelir": "Genel vekaletnamede gayrimenkul satış yetkisi açıkça yazmıyorsa tapu müdürlüğü devir işlemini kesinlikle yapmaz.",
        "kritikUyari": "Vekaletnamenin güncelliği tapu memurunca Noterler Birliği portalından anlık sorgulanır; azledilmiş (iptal edilmiş) vekaletle yapılan satışlar sahteciliktir ve iptal edilir.",
        "ilgiliTerimler": ["Tapu Kütüğü", "Yolsuz Tescil", "Web Tapu Sistemi"]
    },
    {
        "terim": "65 Yaş Üstü Tapu Sağlık Raporu",
        "slug": "65-yas-ustu-tapu-saglik-raporu",
        "harf": "6",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "İleri yaştaki vatandaşların irade ve temyiz kudretinin yerinde olduğunu belgelemek amacıyla devlet hastanelerinden alınan akli meleke raporudur.",
        "hukukiKarsilik": "Tapu Sicili Tüzüğü md. 19 ve TKGM Genelgeleri.",
        "pratikteNeAnlamaGelir": "Tapu memuru işlem sahibinin fiil ehliyetinden şüphe duyarsa veya tarafların talebi üzerine aynı gün tarihli heyet veya psikiyatri raporu ister.",
        "kritikUyari": "Raporun işlem günü sabahı alınması şarttır; dün alınmış rapor kabul edilmeyebilir. Bu rapor ileride mirasçıların 'akli dengesi yoktu' davası açmasını engeller.",
        "ilgiliTerimler": ["Tapu Kütüğü", "Muris Muvazaası", "Tapu İptal ve Tescil Davası"]
    },
    {
        "terim": "Arsa Payı Düzeltme Davası",
        "slug": "arsa-payi-duzeltme-davasi",
        "harf": "A",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Kat irtifakı veya mülkiyeti kurulurken bağımsız bölümlerin büyüklük ve konumlarına uygun tahsis edilmeyen hatalı arsa paylarının mahkemece düzeltilmesidir.",
        "hukukiKarsilik": "634 Sayılı Kat Mülkiyeti Kanunu md. 3/2.",
        "pratikteNeAnlamaGelir": "Binadaki 250 m² dubleks daire ile 50 m² giriş kat daireye aynı arsa payı verilmişse dönüşüm öncesi dava açılarak hakkaniyetli pay dağıtımı sağlanır.",
        "kritikUyari": "Kentsel dönüşümde hak kaybına uğramamak için bina yıkılmadan önce sulh hukuk mahkemesinde bu davanın açılması şarttır; yıkımdan sonra açılması güçleşir.",
        "ilgiliTerimler": ["Arsa Payı", "Kat Mülkiyeti", "Kentsel Dönüşüm"]
    },
    {
        "terim": "Yabancıya Gayrimenkul Satışı Kısıtlamaları",
        "slug": "yabanciya-gayrimenkul-satisi-kisitlamalari",
        "harf": "Y",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Yabancı uyruklu gerçek kişilerin Türkiye'de taşınmaz ediniminde uygulanan askeri yasak bölge, özel güvenlik bölgesi ve yüzölçümü sınırlamalarıdır.",
        "hukukiKarsilik": "2644 Sayılı Tapu Kanunu md. 35.",
        "pratikteNeAnlamaGelir": "Yabancı bir kişi ülke genelinde en fazla 30 hektar taşınmaz edinebilir ve bir ilçenin özel mülkiyete konu alanının %10'undan fazlasını satın alamaz.",
        "kritikUyari": "Yabancılara satılan tarım arazilerinde 2 yıl içinde tarım projesi geliştirilip bakanlığa sunulmazsa arazi Hazine tarafından bedeli karşılığı tasfiye edilir.",
        "ilgiliTerimler": ["Tapu Kütüğü", "Askeri Yasak Bölge Şerhi"]
    },
    {
        "terim": "Döviz Alım Belgesi (DAB)",
        "slug": "doviz-alim-belgesi-dab",
        "harf": "D",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Yabancıların Türkiye'de gayrimenkul alırken dövizlerini Merkez Bankası'na satmak üzere bir bankada Türk Lirası'na bozdurduklarını kanıtlayan resmi belgedir.",
        "hukukiKarsilik": "Türkiye Cumhuriyet Merkez Bankası Sermaye Hareketleri Genelgesi.",
        "pratikteNeAnlamaGelir": "Tapu müdürlüğünde yabancı adına satış işlemi yapılabilmesi için banka onaylı DAB belgesinin ibrazı yasal zorunluluktur.",
        "kritikUyari": "DAB belgesindeki tutar ile tapuda beyan edilen satış bedeli tam olarak birbirine eşit olmalıdır; aksi halde tapu işlemi yapılmaz.",
        "ilgiliTerimler": ["Tapu Harcı", "Yabancıya Gayrimenkul Satışı Kısıtlamaları"]
    }
]

print(f"data_pratik.py güncellendi: toplam {len(PRATIK_TERIMLER)} terim.")
