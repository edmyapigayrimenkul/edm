# -*- coding: utf-8 -*-
"""
data_mega_2.py — EDM Emlak Sözlüğü Kapsamlı Genişletme Paketi (Bölüm 2: Vergi, Kentsel, İnşaat, Finans)
"""

MEGA_TERIMLER_2 = [
    {
        "terim": "Yeni Konutlarda 5 Yıllık Emlak Vergisi İndirimi",
        "slug": "yeni-konutlarda-5-yillik-emlak-vergisi-indirimi",
        "harf": "Y",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Yeni inşa edilen mesken binalarının inşasının bittiği yılı takip eden yıldan itibaren 5 yıl süreyle bina vergisinin 1/4'ünün (%25) vergiden muaf tutulmasıdır.",
        "hukukiKarsilik": "1319 Sayılı Emlak Vergisi Kanunu md. 5.",
        "pratikteNeAnlamaGelir": "Sıfır daire satın aldığınızda belediyeye başvurarak ilk 5 yıl boyunca emlak vergisini %25 indirimli ödersiniz.",
        "kritikUyari": "Belediyeler bu indirimi genellikle kendiliğinden uygulamaz; tapu sahibi dilekçe vererek kanuni indirimden yararlanmak istediğini belirtmelidir.",
        "ilgiliTerimler": ["Emlak Vergisi", "Bina Vergisi Oranları"]
    },
    {
        "terim": "Şirket Aktifindeki Taşınmazın Satışında KDV İstisnası",
        "slug": "sirket-aktifindeki-tasinmazin-satisi-kdv-istisnasi",
        "harf": "Ş",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Kurumların aktifinde en az iki tam yıl (730 gün) süreyle kayıtlı bulunan taşınmazların satışından doğan teslimlerin KDV'den istisna tutulmasıdır.",
        "hukukiKarsilik": "3065 Sayılı KDV Kanunu md. 17/4-r.",
        "pratikteNeAnlamaGelir": "Fabrika veya ofisini 2 yıl tuttuktan sonra satan bir şirket faturasında %20 KDV hesaplamaz; alıcı için büyük finansman avantajı doğar.",
        "kritikUyari": "Taşınmaz ticareti ve kiralamasıyla uğraşan inşaat ve emlak şirketleri bu istisnadan yararlanamaz; istisna yalnızca üretim ve hizmet şirketleri için geçerlidir.",
        "ilgiliTerimler": ["Değer Artış Kazancı Vergisi", "Ticari Kazanç Kriteri"]
    },
    {
        "terim": "Yabancıya Satışta KDV İstisnası (3065 SK md. 13/i)",
        "slug": "yabanciya-satista-kdv-istisnasi",
        "harf": "Y",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Türkiye'de yerleşik olmayan yabancı gerçek ve tüzel kişilere yapılan ilk el konut ve işyeri satışlarında uygulanan tam KDV muafiyetidir.",
        "hukukiKarsilik": "3065 Sayılı Katma Değer Vergisi Kanunu md. 13/i.",
        "pratikteNeAnlamaGelir": "Yabancı alıcı satış bedelini yurt dışından döviz olarak getirip bozdurduğunu belgelendirirse sıfır daire alırken KDV ödemez.",
        "kritikUyari": "KDV muafiyetiyle alınan taşınmazın en az 3 yıl süreyle satılmaması şarttır; 3 yıl dolmadan satılırsa ödenmeyen KDV tecil faiziyle birlikte tahsil edilir.",
        "ilgiliTerimler": ["Döviz Alım Belgesi (DAB)", "Yabancıya Gayrimenkul Satışı Kısıtlamaları"]
    },
    {
        "terim": "Kentsel Dönüşümde Müteahhit Teminat Mektubu",
        "slug": "kentsel-donusumde-muteahhit-teminat-mektubu",
        "harf": "K",
        "kategori": "Kentsel Dönüşüm",
        "kisaTanim": "Riskli yapıların dönüşümünü üstlenen inşaat firmasının, toplam inşaat maliyet bedelinin %10'u oranında belediyeye veya bakanlığa sunduğu kesin banka teminatıdır.",
        "hukukiKarsilik": "6306 Sayılı Kanun Uygulama Yönetmeliği md. 13/9.",
        "pratikteNeAnlamaGelir": "Müteahhit inşaatı yarıda bırakıp kaçarsa idare teminat mektubunu nakde çevirerek binanın tamamlanmasında veya hak sahiplerinin zararının karşılanmasında kullanır.",
        "kritikUyari": "Teminat mektubu sunmayan hiçbir müteahhide belediyeler kentsel dönüşüm yapı ruhsatı veremez.",
        "ilgiliTerimler": ["6306 Sayılı Kentsel Dönüşüm Kanunu", "Yapı Ruhsatı"]
    },
    {
        "terim": "Asbest Envanter Raporu ve Söküm Uzmanı Onayı",
        "slug": "asbest-envanter-raporu",
        "harf": "A",
        "kategori": "Kentsel Dönüşüm",
        "kisaTanim": "Eski binaların yıkım ruhsatı alınabilmesi için bina içinde kanserojen asbestli malzeme olup olmadığını tespit eden zorunlu teknik çevre sağlığı raporudur.",
        "hukukiKarsilik": "Asbestle Çalışmalarda Sağlık ve Güvenlik Önlemleri Hakkında Yönetmelik ve Binaların Yıkılması Hakkında Yönetmelik.",
        "pratikteNeAnlamaGelir": "Eski marley zeminler, kazan dairesi boru izolasyonları ve eternit çatılardan numune alınır; asbest varsa özel kıyafetli ekiplerce toplanıp imha edilir.",
        "kritikUyari": "Asbest temizliği yapılmadan binayı yıkan müteahhit ve maliklere çevre mevzuatı uyarınca milyonlarca liralık ağır idari para cezası kesilir.",
        "ilgiliTerimler": ["Yıkım Tebligatı", "Yapı Ruhsatı"]
    },
    {
        "terim": "Epoksi Ankraj (Kimyasal Dübel ile Donatı Ekimi)",
        "slug": "epoksi-ankraj-donati-ekimi",
        "harf": "E",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Eski betonarme elemana açılan deliğe yüksek mukavemetli kimyasal reçine (epoksi) enjekte edilerek yeni inşaat demirinin çelikten daha sağlam şekilde sabitlenmesidir.",
        "hukukiKarsilik": "TBDY 2018 ve TS EN 1504.",
        "pratikteNeAnlamaGelir": "Bina güçlendirmesinde eski kolonun yanına yeni perde beton eklerken iki betonun tek bir monolitik blok gibi birlikte çalışmasını sağlar.",
        "kritikUyari": "Delik içi tozdan tamamen temizlenmezse epoksi betona yapışmaz; deprem sarsıntısında yeni eklenen perde beton eski binadan ayrılarak çöker.",
        "ilgiliTerimler": ["Perde Beton", "Statik Güçlendirme Projesi"]
    },
    {
        "terim": "Karbon Fiber (CFRP) ile Kolon Güçlendirme",
        "slug": "karbon-fiber-cfrp-guclendirme",
        "harf": "K",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Çelikten kat kat daha yüksek çekme dayanımına sahip karbon elyaf kumaşların özel epoksi harçla kolonlara sarılarak kolonun kesme ve patlama direncini artırmasıdır.",
        "hukukiKarsilik": "Türkiye Bina Deprem Yönetmeliği 2018 Bölüm 15.8.",
        "pratikteNeAnlamaGelir": "Evi yıkmadan ve kolonları kalınlaştırmadan yapılan hızlı güçlendirme yöntemidir; dairede alan kaybı yaratmaz ve 2-3 günde uygulanır.",
        "kritikUyari": "Karbon fiber kolona ilave düşey taşıma kapasitesi kazandırmaz; sadece depremdeki yatay kesme kuvvetlerinde betonun dağılmasını önler. Çok hasarlı kolonlara tek başına yetmez.",
        "ilgiliTerimler": ["Kolon", "Etriye Sıklaştırma Bölgesi", "Statik Güçlendirme Projesi"]
    },
    {
        "terim": "Yumuşak Kat Düzensizliği",
        "slug": "yumusak-kat-duzensizligi",
        "harf": "Y",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Bir binanın zemin katının dükkan veya galeri olarak kullanılması sebebiyle üst katlara kıyasla rijitliğinin (duvar yoğunluğunun) belirgin şekilde az olması durumudur.",
        "hukukiKarsilik": "TBDY 2018 Tablo 3.6 (B2 Düzensizliği).",
        "pratikteNeAnlamaGelir": "Depremlerde binaların zemin katının toptan çöküp üst katların yere oturmasının ana sebebi yumuşak kat düzensizliğidir.",
        "kritikUyari": "Zemin katı dükkan olan binalarda zemin kata ilave betonarme perdeler eklenerek rijitlik dengesi sağlanmamışsa bina yüksek göçme riski taşır.",
        "ilgiliTerimler": ["Perde Beton", "Karkas", "Kısa Kolon Etkisi"]
    },
    {
        "terim": "Kısa Kolon Etkisi",
        "slug": "kisa-kolon-etkisi",
        "harf": "K",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Kolonların arasına yarım duvar veya bant pencere örülmesi sebebiyle kolonun serbest boyunun kısalması ve depremde devasa kesme kuvvetine maruz kalarak kırılmasıdır.",
        "hukukiKarsilik": "TBDY 2018 Bölüm 7.3.8.",
        "pratikteNeAnlamaGelir": "Bodrum kat pencerelerinde veya okul koridorlarında görülen yarım pencereler kolonun esnemesini engeller ve kolonu makas gibi keser.",
        "kritikUyari": "Kısa kolon oluşan yerlerde kolon ile yarım duvar arasına derz boşluğu bırakılmalı veya etriye aralığı kolonun tamamında 5 cm'ye düşürülmelidir.",
        "ilgiliTerimler": ["Kolon", "Etriye Demiri", "Yumuşak Kat Düzensizliği"]
    },
    {
        "terim": "Beton Vibrasyonu ve Segregasyon",
        "slug": "beton-vibrasyonu-ve-segregasyon",
        "harf": "B",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Taze beton dökülürken daldırma vibratör kullanılarak havanın dışarı atılması ve çakıl ile çimento harcının birbirinden ayrışmasının (segregasyonun) önlenmesidir.",
        "hukukiKarsilik": "TS 500 ve Türkiye Hazır Beton Birliği Kuralları.",
        "pratikteNeAnlamaGelir": "Vibratör vurulmayan beton kalıp söküldüğünde bal peteği gibi boşluklu çıkar; demirler havada kalır ve taşıma kapasitesi %50 düşer.",
        "kritikUyari": "Aşırı vibratör uygulamak da zararlıdır; ağır çakıllar dibe çöker, üste sadece şerbet kalır. İdeal uygulama her noktada 10-15 saniyedir.",
        "ilgiliTerimler": ["Beton Sınıfı", "Paspayı"]
    },
    {
        "terim": "Gayrimenkul Yatırım Fonu (GYF)",
        "slug": "gayrimenkul-yatirim-fonu-gyf",
        "harf": "G",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Nitelikli yatırımcılardan toplanan paralarla gayrimenkul ve gayrimenkul projelerine yatırım yapan, SPK denetimindeki tüzel kişiliği olmayan mal varlığıdır.",
        "hukukiKarsilik": "Sermaye Piyasası Kurulu Gayrimenkul Yatırım Fonlarına İlişkin Esaslar Tebliği (III-52.3).",
        "pratikteNeAnlamaGelir": "Büyük otel, fabrika veya lojistik depo portföylerine katılma payı satın alarak ortak olursunuz; profesyonel portföy yöneticileri fonu yönetir.",
        "kritikUyari": "GYF katılma paylarından elde edilen kar payları ve değer artış kazançları bireysel yatırımcılarda %0 stopaja tabidir ve gelir vergisi beyannamesi verilmez.",
        "ilgiliTerimler": ["Gayrimenkul Yatırım Ortaklığı (GYO)", "SPK Lisanslı Değerleme Raporu"]
    },
    {
        "terim": "İpotek Teminatlı Menkul Kıymet (İTMK)",
        "slug": "ipotek-teminatli-menkul-kiymet-itmk",
        "harf": "İ",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Bankaların konut kredisi alacaklarını teminat havuzuna koyarak bu havuz karşılığında uluslararası piyasalarda ihraç ettiği yüksek güvenlikli tahvillerdir.",
        "hukukiKarsilik": "6362 Sayılı Sermaye Piyasası Kanunu md. 59.",
        "pratikteNeAnlamaGelir": "Bankalar verdikleri konut kredilerini menkulleştirip satarak taze nakit kaynağı yaratır ve piyasaya daha uygun faizli yeni konut kredileri sunar.",
        "kritikUyari": "İTMK havuzundaki ipotekler banka iflas etse dahi ayrı bir malvarlığı sayılır ve sadece İTMK yatırımcılarının alacaklarına tahsis edilir.",
        "ilgiliTerimler": ["Konut Finansmanı Kredisi (Mortgage)", "İpotek"]
    },
    {
        "terim": "Refinansman (Konut Kredisi Yapılandırma)",
        "slug": "refinansman-konut-kredisi-yapilandirma",
        "harf": "R",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Mevcut konut kredisinin, piyasa faiz oranlarının düşmesi üzerine başka bir bankadan daha düşük faizle yeni kredi çekilerek tamamen kapatılması ve transfer edilmesidir.",
        "hukukiKarsilik": "6502 Sayılı Tüketicinin Korunması Hakkında Kanun md. 37.",
        "pratikteNeAnlamaGelir": "Aylık taksit tutarınızı düşürmek veya kredi vadenizi kısaltmak için eski kredinizi yeni uygun faizli krediyle takas edersiniz.",
        "kritikUyari": "Erken kapama sırasında eski bankaya yasal olarak azami %1-%2 erken ödeme tazminatı ve yeni bankaya ekspertiz/tahsis masrafları ödenir; kar/zarar hesabı iyi yapılmalıdır.",
        "ilgiliTerimler": ["Konut Finansmanı Kredisi (Mortgage)", "Erken Kapama Tazminatı"]
    }
]

print(f"data_mega_2.py hazır: {len(MEGA_TERIMLER_2)} terim.")
