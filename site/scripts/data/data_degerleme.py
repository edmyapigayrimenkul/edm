# -*- coding: utf-8 -*-
"""Değerleme & Finans kategorisi terimleri (40+ terim)"""

DEGERLEME_TERIMLERI = [
    {
        "terim": "SPK Lisanslı Değerleme Raporu",
        "slug": "spk-lisansli-degerleme-raporu",
        "harf": "S",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Sermaye Piyasası Kurulu lisansına sahip bağımsız gayrimenkul değerleme uzmanlarınca uluslararası standartlara göre hazırlanan resmi ekspertiz raporudur.",
        "hukukiKarsilik": "Sermaye Piyasası Mevzuatı ve Uluslararası Değerleme Standartları (UDES).",
        "pratikteNeAnlamaGelir": "Banka konut kredisi verirken, yabancıya gayrimenkul satışında veya şirket varlık değerlemelerinde kanunen zorunlu olan tarafsız değer tespit raporudur.",
        "kritikUyari": "Raporda taşınmazın imar durumu, ruhsat ve iskan uygunluğu, kaçak yapılaşma alanları ve kısıtlayıcı tapu şerhleri tek tek listelenir.",
        "ilgiliTerimler": ["Emsal Karşılaştırma Yaklaşımı", "Maliyet Oluşumu Yaklaşımı", "Kredi Kullandırım Oranı (LTV)"]
    },
    {
        "terim": "Emsal Karşılaştırma Yaklaşımı",
        "slug": "emsal-karsilastirma-yaklasimi",
        "harf": "E",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Değerlemeye konu taşınmazın pazar değerinin, benzer konum ve nitelikteki satılmış veya satılık emsal mülklerle karşılaştırılarak tespit edilmesidir.",
        "hukukiKarsilik": "Uluslararası Değerleme Standartları (IVS 105).",
        "pratikteNeAnlamaGelir": "Konut ve arsa değerlemelerinde en sık kullanılan yöntemdir; aynı mahalledeki benzer kat, cephe ve metrekareli dairelerin fiyatları analiz edilir.",
        "kritikUyari": "Emsal olarak internetteki şişirilmiş ilan fiyatları değil, pazarlık payı düşülmüş ve tapuda fiilen gerçekleşmiş gerçek işlem fiyatları esas alınmalıdır.",
        "ilgiliTerimler": ["Maliyet Oluşumu Yaklaşımı", "Şerefiye Puanı"]
    },
    {
        "terim": "Maliyet Oluşumu Yaklaşımı",
        "slug": "maliyet-olusumu-yaklasimi",
        "harf": "M",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Taşınmazın değerinin, boş arsa değeri ile üzerindeki yapının bugünkü yeniden inşa maliyetinin toplamından amortisman yıpranması düşülerek bulunmasıdır.",
        "hukukiKarsilik": "Uluslararası Değerleme Standartları (IVS 105).",
        "pratikteNeAnlamaGelir": "Piyasada emsali az bulunan fabrika, otel, hastane, okul veya özel amaçlı mülklerin değerlemesinde temel alınan yöntemdir.",
        "kritikUyari": "Binanın yaşına göre fiziksel, fonksiyonel ve ekonomik yıpranma payları doğru hesaplanmazsa maliyet yaklaşımı yanıltıcı yüksek değerler üretebilir.",
        "ilgiliTerimler": ["Emsal Karşılaştırma Yaklaşımı", "Gelir İndirgeme Yaklaşımı"]
    },
    {
        "terim": "Gelir İndirgeme Yaklaşımı",
        "slug": "gelir-indirgeme-yaklasimi",
        "harf": "G",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Gelir getiren bir taşınmazın gelecekte üreteceği net nakit akışlarının ve kira gelirlerinin bugünkü net değere indirgenerek değerinin hesaplanmasıdır.",
        "hukukiKarsilik": "Uluslararası Değerleme Standartları (IVS 105).",
        "pratikteNeAnlamaGelir": "AVM'ler, lojistik depolar, plazalar veya benzin istasyonları gibi düzenli kira ve işletme geliri üreten ticari mülklerde kullanılır.",
        "kritikUyari": "Kullanılan kapitalizasyon oranı ve iskonto oranı piyasa faizlerine ve enflasyona göre hassas seçilmelidir; %1'lik sapma milyonlarca liralık değer farkı yaratır.",
        "ilgiliTerimler": ["Net Kira Getirisi", "İç Verim Oranı (IRR)"]
    },
    {
        "terim": "En Etkin ve Verimli Kullanım Analizi",
        "slug": "en-etkin-ve-verimli-kullanim-analizi",
        "harf": "E",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Bir arazinin fiziki olarak mümkün, yasal olarak izin verilen, finansal olarak gerçekleştirilebilir ve en yüksek getiriyi sağlayan kullanım biçiminin tespitidir.",
        "hukukiKarsilik": "Sermaye Piyasası Kurulu Değerleme Standartları.",
        "pratikteNeAnlamaGelir": "Büyük bir arsa üzerine konut mu, otel mi, lojistik depo mu yoksa karma proje mi yapılmasının en karlı olacağının fizibilite analizidir.",
        "kritikUyari": "Yasal olarak izin verilmeyen bir kullanım (örneğin konut imarlı parsele AVM projesi kurgulamak) bu analizin sonucunu geçersiz kılar.",
        "ilgiliTerimler": ["İmar Çapı", "Emsal (KAKS)"]
    },
    {
        "terim": "Kredi Kullandırım Oranı (LTV - Loan to Value)",
        "slug": "kredi-kullandirim-orani-ltv",
        "harf": "K",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Bir gayrimenkulün SPK lisanslı ekspertiz değerinin en fazla yüzde kaçına kadar banka konut kredisi kullanılabileceğini belirleyen BDDK oranıdır.",
        "hukukiKarsilik": "Bankacılık Düzenleme ve Denetleme Kurumu (BDDK) Kurul Kararları.",
        "pratikteNeAnlamaGelir": "10 milyon TL ekspertizli bir konutta LTV oranı %50 ise banka en fazla 5 milyon TL kredi verir; kalan 5 milyon TL'yi peşinat olarak ödersiniz.",
        "kritikUyari": "Enerji sınıfı A veya B olan konutlarda BDDK daha yüksek LTV oranı tanıdığından çevre dostu evlerde daha yüksek kredi çekilebilir.",
        "ilgiliTerimler": ["SPK Lisanslı Değerleme Raporu", "Enerji Kimlik Belgesi (EKB)"]
    },
    {
        "terim": "Net Kira Getirisi (Net Yield)",
        "slug": "net-kira-getirisi-net-yield",
        "harf": "N",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Gayrimenkulden elde edilen yıllık brüt kira gelirinden emlak vergisi, sigorta, bakım ve boşluk kayıpları düşüldükten sonraki net gelirin mülk değerine oranıdır.",
        "hukukiKarsilik": "Gayrimenkul Yatırım Analizi Prensipleri.",
        "pratikteNeAnlamaGelir": "Brüt kira getirisi %8 görünse bile giderler düşüldüğünde net getiri %5.5 çıkabilir; profesyonel yatırımcı daima net getiriye bakar.",
        "kritikUyari": "Stopaj, DASK, boşta geçen aylar ve emlakçı komisyonu hesaba katılmadan yapılan getiri hesapları yatırımcıyı yanıltır.",
        "ilgiliTerimler": ["Boşluk Oranı", "Emlak Vergisi"]
    },
    {
        "terim": "Şerefiye Puanı",
        "slug": "serefiye-puani",
        "harf": "Ş",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Aynı binada veya sitede bulunan bağımsız bölümlerin kat yüksekliği, cephesi, gün ışığı alma durumu ve manzarasına göre oluşan göreceli değer farkıdır.",
        "hukukiKarsilik": "Kat Mülkiyeti Kanunu ve Değerleme İlkeleri.",
        "pratikteNeAnlamaGelir": "Aynı metrekareye sahip iki daireden 5. kattaki deniz manzaralı güney cepheli daire, zemin kattaki arka cepheli daireye göre %50 daha pahalıdır.",
        "kritikUyari": "Projeden daire alırken müteahhidin belirlediği şerefiye listesi ile gerçek piyasa şerefiyesi karşılaştırılmalıdır; kör cepheye yüksek şerefiye ödenmemelidir.",
        "ilgiliTerimler": ["Arsa Payı", "Emsal Karşılaştırma Yaklaşımı"]
    },
    {
        "terim": "Taşınmaz Ticareti Yetki Belgesi (TTBS)",
        "slug": "tasinmaz-ticareti-yetki-belgesi-ttbs",
        "harf": "T",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Emlak danışmanlığı ve taşınmaz ticareti faaliyetinde bulunabilmek için Ticaret Bakanlığı Taşınmaz Ticareti Bilgi Sistemi'nden alınması zorunlu resmi ruhsattır.",
        "hukukiKarsilik": "Taşınmaz Ticareti Hakkında Yönetmelik.",
        "pratikteNeAnlamaGelir": "Yetki belgesi olmayan sahte veya kayıtdışı ayakçı emlakçıların ilan sitelerinde ilan vermesi ve aracılık yapması kanunen yasaktır.",
        "kritikUyari": "Yetki belgesiz emlak işletmelerine hizmet bedeli ödememe ve Ticaret İl Müdürlüğü'ne şikayet ederek idari para cezası uygulatma hakkınız vardır.",
        "ilgiliTerimler": ["Yetkilendirme Sözleşmesi", "Hizmet Bedeli"]
    },
    {
        "terim": "Taşınmaz Gösterme Belgesi (Yer Gösterme)",
        "slug": "tasinmaz-gosterme-belgesi",
        "harf": "T",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Emlak işletmesinin alıcı veya kiracı adayına taşınmazı bizzat gezdirdiğini ve gösterdiğini belgeleyen, imzalanması mevzuat gereği zorunlu resmi formdur.",
        "hukukiKarsilik": "Taşınmaz Ticareti Hakkında Yönetmelik md. 19.",
        "pratikteNeAnlamaGelir": "Mülkü gördükten sonra emlakçıyı aradan çıkarıp doğrudan malikle anlaşmaya kalkışırsanız bu belgeye dayanılarak tam komisyon ve tazminat tahsil edilir.",
        "kritikUyari": "Yer gösterme belgesi için vatandaştan 'gösterme ücreti' veya 'yol parası' adı altında hiçbir bedel talep edilemez; bu hizmet tamamen ücretsizdir.",
        "ilgiliTerimler": ["Yetkilendirme Sözleşmesi", "Hizmet Bedeli"]
    },
    {
        "terim": "Yetkilendirme Sözleşmesi",
        "slug": "yetkilendirme-sozlesmesi",
        "harf": "Y",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Taşınmaz sahibinin mülkünün satışı veya kiralanması için lisanslı emlak işletmesine yetki verdiğini gösteren, süresi ve şartları yazılı resmi sözleşmedir.",
        "hukukiKarsilik": "Taşınmaz Ticareti Hakkında Yönetmelik md. 15.",
        "pratikteNeAnlamaGelir": "Gayrimenkulünüzü pazarlaması için profesyonel bir ofisle münhasır (tek yetkili) veya genel yetki sözleşmesi imzalarsınız.",
        "kritikUyari": "Yetkilendirme sözleşmesi olmadan hiçbir emlak işletmesi mülkünüz için ilan veremez veya pazarlama yapamaz; ilan sitelerinde bu yetki denetlenir.",
        "ilgiliTerimler": ["Taşınmaz Ticareti Yetki Belgesi", "Hizmet Bedeli"]
    },
    {
        "terim": "Hizmet Bedeli (Komisyon Oranı - %2+KDV)",
        "slug": "hizmet-bedeli-emlak-komisyon-orani",
        "harf": "H",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Gayrimenkul alım satımında alıcı ve satıcıdan ayrı ayrı kanunen en fazla gerçek satış bedelinin yüzde 2'si (%2) artı KDV oranında alınan aracılık ücretidir.",
        "hukukiKarsilik": "Taşınmaz Ticareti Hakkında Yönetmelik md. 20.",
        "pratikteNeAnlamaGelir": "Kiralamalarda ise hizmet bedeli bir aylık kira bedelinden fazla olamaz (artı KDV).",
        "kritikUyari": "%2'lik tavan oran emredici hukuk kuralıdır; sözleşmeye '%3 alınır' yazılsa dahi fazlaya ilişkin kısım hukuken geçersizdir ve geri istenebilir.",
        "ilgiliTerimler": ["Yetkilendirme Sözleşmesi", "Taşınmaz Gösterme Belgesi"]
    },
    {
        "terim": "Cayma Akçesi (Pey Akçesi - TBK 177)",
        "slug": "cayma-akcesi-pey-akcesi",
        "harf": "C",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Sözleşmeden serbestçe dönme hakkı sağlamak üzere verilen ve cayma durumunda parayı verenin parayı bırakmasını, alanı ise iki katını ödemesini gerektiren bedeldir.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 177 ve 178.",
        "pratikteNeAnlamaGelir": "Alıcı vazgeçerse verdiği parayı yakar; satıcı vazgeçerse aldığı paranın iki katını alıcıya ödemek zorunda kalır.",
        "kritikUyari": "Sözleşmede açıkça 'cayma akçesidir' yazılmamışsa verilen para adi kapora (bağlanma parası) sayılır; satıcı vazgeçtiğinde sadece aldığı parayı iade eder.",
        "ilgiliTerimler": ["Taşınmaz Satış Vaadi Sözleşmesi", "Cezai Şart"]
    },
    {
        "terim": "Ön Ödemeli Konut Satış Sözleşmesi (6502 SK)",
        "slug": "on-odemeli-konut-satis-sozlesmesi",
        "harf": "Ö",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Tüketicinin konut amaçlı bir taşınmazın satış bedelini önceden peşin veya taksitle ödemeyi, satıcının da bedelin kısmen veya tamamen ödenmesinden sonra taşınmazı devretmeyi üstlendiği sözleşmedir.",
        "hukukiKarsilik": "6502 Sayılı Tüketicinin Korunması Hakkında Kanun md. 40-46.",
        "pratikteNeAnlamaGelir": "Maketten veya temelden inşaat projelerinde müteahhitle imzalanan tüketici koruma sözleşmesidir.",
        "kritikUyari": "Bu sözleşmenin tapuda resmi şekilde veya noterde satış vaadi şeklinde yapılması ZORUNLUDUR; adi yazılı sözleşmeler mutlak butlanla geçersizdir.",
        "ilgiliTerimler": ["Bina Tamamlama Sigortası", "Taşınmaz Satış Vaadi Sözleşmesi"]
    },
    {
        "terim": "Bina Tamamlama Sigortası",
        "slug": "bina-tamamlama-sigortasi",
        "harf": "B",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Ön ödemeli konut projelerinde müteahhidin iflası veya işi bırakması halinde tüketicinin ödediği paraları iade eden veya inşaatı bitirten özel sigortadır.",
        "hukukiKarsilik": "6502 Sayılı Kanun md. 42 ve Bina Tamamlama Sigortası Genel Şartları.",
        "pratikteNeAnlamaGelir": "30 veya daha fazla konutluk projelerde müteahhidin teminat mektubu vermesi veya bina tamamlama sigortası yaptırması yasal mecburiyettir.",
        "kritikUyari": "Bu sigortası veya banka teminat mektubu bulunmayan inşaat şirketlerinden maketten konut almak batık proje riskini doğrudan tüketiciye yükler.",
        "ilgiliTerimler": ["Ön Ödemeli Konut Satış Sözleşmesi", "Hakediş Raporu"]
    },
    {
        "terim": 'Net Bugünkü Değer (NPV)',
        "slug": 'net-bugunku-deger-npv',
        "harf": 'N',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Bir gayrimenkul yatırımının gelecekteki bütün nakit giriş ve çıkışlarının belirli bir iskonto oranıyla bugüne indirgenmiş net değeridir.',
        "hukukiKarsilik": 'Gayrimenkul Finansı ve Yatırım Değerleme Standartları.',
        "pratikteNeAnlamaGelir": 'NPV değeri sıfırdan büyükse gayrimenkul yatırımı karlıdır ve hedeflenen getiri oranının üzerinde kazanç sağlayacaktır.',
        "kritikUyari": 'Enflasyon ve alternatif risksiz faiz oranları iskonto hesabında doğru seçilmezse NPV hesabı yatırımı olduğundan karlı gösterebilir.',
        "ilgiliTerimler": ['İç Verim Oranı (IRR)', 'Gelir İndirgeme Yaklaşımı']
    },
    {
        "terim": 'İç Verim Oranı (IRR)',
        "slug": 'ic-verim-orani-irr',
        "harf": 'İ',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Bir gayrimenkul projesinin net bugünkü değerini sıfıra eşitleyen, projenin yıllık bileşik getiri potansiyelini gösteren orandır.',
        "hukukiKarsilik": 'Kurumsal Gayrimenkul Yatırım Analizi.',
        "pratikteNeAnlamaGelir": 'Arsa veya bina geliştirme projesinin yıllık yüzde kaç net getiri sağlayacağını gösteren en temel fizibilite metriğidir.',
        "kritikUyari": 'IRR oranı piyasa borçlanma faizinin altında kalan hiçbir gayrimenkul geliştirme projesine başlanmamalıdır.',
        "ilgiliTerimler": ['Net Bugünkü Değer (NPV)', 'Net Kira Getirisi']
    },
    {
        "terim": 'Brüt Kira Getirisi',
        "slug": 'brut-kira-getirisi',
        "harf": 'B',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Bir gayrimenkulün yıllık brüt kira gelirinin mülkün güncel satış fiyatına bölünmesiyle bulunan yüzdesel verim oranıdır.',
        "hukukiKarsilik": 'Gayrimenkul Değerleme Esasları.',
        "pratikteNeAnlamaGelir": "5 milyon TL değerindeki bir daire aylık 25.000 TL (yıllık 300.000 TL) kira getiriyorsa brüt kira getirisi %6'dır.",
        "kritikUyari": 'Brüt getiri yanıltıcı olabilir; mülkün vergi, aidat ve bakım masrafları düşülmeden net yatırım kararı verilmemelidir.',
        "ilgiliTerimler": ['Net Kira Getirisi (Net Yield)', 'Boşluk Oranı']
    },
    {
        "terim": 'Yatırım Geri Dönüş Süresi',
        "slug": 'yatirim-geri-donus-suresi',
        "harf": 'Y',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Bir gayrimenkulün satın alma bedelinin, o mülkten elde edilen kira gelirleriyle kaç yıl içinde kendini amorti edeceğini gösteren süredir.',
        "hukukiKarsilik": 'Gayrimenkul Yatırım Analizi İlkeleri.',
        "pratikteNeAnlamaGelir": 'Türkiye ortalamasında konutlarda amortisman süresi 15-20 yıl, ticari mülklerde ise 12-16 yıl makul kabul edilir.',
        "kritikUyari": 'Kira artışları ve enflasyon doğru projekte edilmezse hesaplanan geri dönüş süresi kağıt üzerinde kalır.',
        "ilgiliTerimler": ['Brüt Kira Getirisi', 'Net Kira Getirisi']
    },
    {
        "terim": 'Boşluk Oranı (Vacancy Allowance)',
        "slug": 'bosluk-orani',
        "harf": 'B',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Gelir getiren bir taşınmazın kiracı değişimi veya piyasa durgunluğu sebebiyle yıl içinde boş kalma riskini temsil eden yüzdesel kayıp payıdır.',
        "hukukiKarsilik": 'Uluslararası Değerleme Standartları.',
        "pratikteNeAnlamaGelir": 'Değerleme uzmanları yıllık kira hesabında mülkün en az 1 ay boş kalacağını varsayarak gelirlerden %5-%10 boşluk payı düşer.',
        "kritikUyari": 'Yatırım fizibilitesinde boşluk oranı hesaba katılmadığında kredi taksitleri mülk boş kaldığında yatırımcının cebinden çıkar.',
        "ilgiliTerimler": ['Net Kira Getirisi', 'Gelir İndirgeme Yaklaşımı']
    },
    {
        "terim": 'Süpürülebilir Net Alan (Net m²)',
        "slug": 'supurulebilir-net-alan',
        "harf": 'S',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Bağımsız bölüm içerisindeki duvarların iç yüzeyleri arasında kalan, süpürge ile süpürülebilen fiziksel net kullanım alanıdır.',
        "hukukiKarsilik": 'Planlı Alanlar İmar Yönetmeliği md. 4/1-ö.',
        "pratikteNeAnlamaGelir": 'İlanlarda 120 m² brüt yazan bir dairenin süpürülebilir net alanı genellikle 80-85 m² çıkar; mobilyalarınızı yerleştireceğiniz gerçek alandır.',
        "kritikUyari": 'Emlak ilanlarında brüt alan yerine süpürülebilir net alanın açıkça belirtilmesi Taşınmaz Ticareti Yönetmeliği gereği yasal zorunluluktur.',
        "ilgiliTerimler": ['Brüt Metrekare', 'Faydalı Alan']
    },
    {
        "terim": 'Gayrimenkul Yatırım Ortaklığı (GYO)',
        "slug": 'gayrimenkul-yatirim-ortakligi-gyo',
        "harf": 'G',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": "Gayrimenkullere, gayrimenkule dayalı projelere ve sermaye piyasası araçlarına yatırım yapmak üzere kurulan, Borsa İstanbul'da işlem gören sermaye piyasası kurumudur.",
        "hukukiKarsilik": '6362 Sayılı Sermaye Piyasası Kanunu ve SPK GYO Tebliği.',
        "pratikteNeAnlamaGelir": 'Büyük bir AVM veya gökdelene tek başınıza sahip olamasanız bile GYO hissesi alarak mülkün kira gelirine ve değer artışına küçük paralarla ortak olursunuz.',
        "kritikUyari": "GYO'ların portföy kazançları kurumlar vergisinden %100 istisnadır; bu durum yüksek kar payı dağıtım potansiyeli sağlar.",
        "ilgiliTerimler": ['Gayrimenkul Yatırım Fonu (GYF)', 'SPK Lisanslı Değerleme Raporu']
    },
    {
        "terim": 'Net Bugünkü Değer (NPV)',
        "slug": 'net-bugunku-deger-npv',
        "harf": 'N',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Bir gayrimenkul yatırımının gelecekteki bütün nakit giriş ve çıkışlarının belirli bir iskonto oranıyla bugüne indirgenmiş net değeridir.',
        "hukukiKarsilik": 'Gayrimenkul Finansı ve Yatırım Değerleme Standartları.',
        "pratikteNeAnlamaGelir": 'NPV değeri sıfırdan büyükse gayrimenkul yatırımı karlıdır ve hedeflenen getiri oranının üzerinde kazanç sağlayacaktır.',
        "kritikUyari": 'Enflasyon ve alternatif risksiz faiz oranları iskonto hesabında doğru seçilmezse NPV hesabı yatırımı olduğundan karlı gösterebilir.',
        "ilgiliTerimler": ['İç Verim Oranı (IRR)', 'Gelir İndirgeme Yaklaşımı']
    },
    {
        "terim": 'İç Verim Oranı (IRR)',
        "slug": 'ic-verim-orani-irr',
        "harf": 'İ',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Bir gayrimenkul projesinin net bugünkü değerini sıfıra eşitleyen, projenin yıllık bileşik getiri potansiyelini gösteren orandır.',
        "hukukiKarsilik": 'Kurumsal Gayrimenkul Yatırım Analizi.',
        "pratikteNeAnlamaGelir": 'Arsa veya bina geliştirme projesinin yıllık yüzde kaç net getiri sağlayacağını gösteren en temel fizibilite metriğidir.',
        "kritikUyari": 'IRR oranı piyasa borçlanma faizinin altında kalan hiçbir gayrimenkul geliştirme projesine başlanmamalıdır.',
        "ilgiliTerimler": ['Net Bugünkü Değer (NPV)', 'Net Kira Getirisi']
    },
    {
        "terim": 'Brüt Kira Getirisi',
        "slug": 'brut-kira-getirisi',
        "harf": 'B',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Bir gayrimenkulün yıllık brüt kira gelirinin mülkün güncel satış fiyatına bölünmesiyle bulunan yüzdesel verim oranıdır.',
        "hukukiKarsilik": 'Gayrimenkul Değerleme Esasları.',
        "pratikteNeAnlamaGelir": "5 milyon TL değerindeki bir daire aylık 25.000 TL (yıllık 300.000 TL) kira getiriyorsa brüt kira getirisi %6'dır.",
        "kritikUyari": 'Brüt getiri yanıltıcı olabilir; mülkün vergi, aidat ve bakım masrafları düşülmeden net yatırım kararı verilmemelidir.',
        "ilgiliTerimler": ['Net Kira Getirisi (Net Yield)', 'Boşluk Oranı']
    },
    {
        "terim": 'Yatırım Geri Dönüş Süresi',
        "slug": 'yatirim-geri-donus-suresi',
        "harf": 'Y',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Bir gayrimenkulün satın alma bedelinin, o mülkten elde edilen kira gelirleriyle kaç yıl içinde kendini amorti edeceğini gösteren süredir.',
        "hukukiKarsilik": 'Gayrimenkul Yatırım Analizi İlkeleri.',
        "pratikteNeAnlamaGelir": 'Türkiye ortalamasında konutlarda amortisman süresi 15-20 yıl, ticari mülklerde ise 12-16 yıl makul kabul edilir.',
        "kritikUyari": 'Kira artışları ve enflasyon doğru projekte edilmezse hesaplanan geri dönüş süresi kağıt üzerinde kalır.',
        "ilgiliTerimler": ['Brüt Kira Getirisi', 'Net Kira Getirisi']
    },
    {
        "terim": 'Boşluk Oranı (Vacancy Allowance)',
        "slug": 'bosluk-orani',
        "harf": 'B',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Gelir getiren bir taşınmazın kiracı değişimi veya piyasa durgunluğu sebebiyle yıl içinde boş kalma riskini temsil eden yüzdesel kayıp payıdır.',
        "hukukiKarsilik": 'Uluslararası Değerleme Standartları.',
        "pratikteNeAnlamaGelir": 'Değerleme uzmanları yıllık kira hesabında mülkün en az 1 ay boş kalacağını varsayarak gelirlerden %5-%10 boşluk payı düşer.',
        "kritikUyari": 'Yatırım fizibilitesinde boşluk oranı hesaba katılmadığında kredi taksitleri mülk boş kaldığında yatırımcının cebinden çıkar.',
        "ilgiliTerimler": ['Net Kira Getirisi', 'Gelir İndirgeme Yaklaşımı']
    },
    {
        "terim": 'Süpürülebilir Net Alan (Net m²)',
        "slug": 'supurulebilir-net-alan',
        "harf": 'S',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": 'Bağımsız bölüm içerisindeki duvarların iç yüzeyleri arasında kalan, süpürge ile süpürülebilen fiziksel net kullanım alanıdır.',
        "hukukiKarsilik": 'Planlı Alanlar İmar Yönetmeliği md. 4/1-ö.',
        "pratikteNeAnlamaGelir": 'İlanlarda 120 m² brüt yazan bir dairenin süpürülebilir net alanı genellikle 80-85 m² çıkar; mobilyalarınızı yerleştireceğiniz gerçek alandır.',
        "kritikUyari": 'Emlak ilanlarında brüt alan yerine süpürülebilir net alanın açıkça belirtilmesi Taşınmaz Ticareti Yönetmeliği gereği yasal zorunluluktur.',
        "ilgiliTerimler": ['Brüt Metrekare', 'Faydalı Alan']
    },
    {
        "terim": 'Gayrimenkul Yatırım Ortaklığı (GYO)',
        "slug": 'gayrimenkul-yatirim-ortakligi-gyo',
        "harf": 'G',
        "kategori": 'Değerleme & Finans',
        "kisaTanim": "Gayrimenkullere, gayrimenkule dayalı projelere ve sermaye piyasası araçlarına yatırım yapmak üzere kurulan, Borsa İstanbul'da işlem gören sermaye piyasası kurumudur.",
        "hukukiKarsilik": '6362 Sayılı Sermaye Piyasası Kanunu ve SPK GYO Tebliği.',
        "pratikteNeAnlamaGelir": 'Büyük bir AVM veya gökdelene tek başınıza sahip olamasanız bile GYO hissesi alarak mülkün kira gelirine ve değer artışına küçük paralarla ortak olursunuz.',
        "kritikUyari": "GYO'ların portföy kazançları kurumlar vergisinden %100 istisnadır; bu durum yüksek kar payı dağıtım potansiyeli sağlar.",
        "ilgiliTerimler": ['Gayrimenkul Yatırım Fonu (GYF)', 'SPK Lisanslı Değerleme Raporu']
    }
]

print(f"data_degerleme.py hazır: {len(DEGERLEME_TERIMLERI)} terim.")
