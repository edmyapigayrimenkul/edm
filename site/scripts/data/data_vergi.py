# -*- coding: utf-8 -*-
"""Vergi & Harç kategorisi terimleri (45+ terim)"""

VERGI_TERIMLERI = [
    {
        "terim": "Tapu Harcı",
        "slug": "tapu-harci",
        "harf": "T",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Gayrimenkul alım satımında devir eden ve devralan tarafından beyan edilen gerçek satış bedeli üzerinden ayrı ayrı binde 20 (toplam %4) oranında ödenen resmi harçtır.",
        "hukukiKarsilik": "492 Sayılı Harçlar Kanunu (4 Sayılı Tarife).",
        "pratikteNeAnlamaGelir": "5.000.000 TL değerinde bir konut satın aldığınızda alıcı 100.000 TL, satıcı 100.000 TL olmak üzere toplam 200.000 TL tapu harcı öder.",
        "kritikUyari": "Harçtan kaçmak için tapuda belediye rayiç bedelini gösterip parayı elden veya bankadan fazladan gönderirseniz Maliye geriye dönük faiz ve %25 vergi ziyaı cezası keser.",
        "ilgiliTerimler": ["Rayiç Bedel", "Pişmanlık Beyannamesi", "Tapu Döner Sermaye Bedeli"]
    },
    {
        "terim": "Tapu Döner Sermaye Bedeli",
        "slug": "tapu-doner-sermaye-bedeli",
        "harf": "T",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Tapu müdürlüklerinde yapılan tescil, devir, ipotek ve benzeri her işlem başına Tapu ve Kadastro Genel Müdürlüğü döner sermayesine ödenen maktu işlem ücretidir.",
        "hukukiKarsilik": "6083 Sayılı Tapu ve Kadastro Genel Müdürlüğü Teşkilat Kanunu md. 8.",
        "pratikteNeAnlamaGelir": "Tapu harcına ek olarak her tapu devrinde yöresel il katsayısına göre belirlenen döner sermaye ücreti genellikle alıcı tarafından ödenir.",
        "kritikUyari": "Büyükşehirlerdeki katsayı normal illere göre 2-3 kat daha yüksektir. İşlem günü tapu SMS'i geldiğinde harçla birlikte ödenmelidir.",
        "ilgiliTerimler": ["Tapu Harcı", "Web Tapu Sistemi"]
    },
    {
        "terim": "Emlak Vergisi (1319 SK)",
        "slug": "emlak-vergisi",
        "harf": "E",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Türkiye sınırları içinde bulunan bina, arsa ve araziler için malikleri tarafından her yıl ilgili belediyeye iki eşit taksitte ödenen servet vergisidir.",
        "hukukiKarsilik": "1319 Sayılı Emlak Vergisi Kanunu.",
        "pratikteNeAnlamaGelir": "Mülkünüzün bulunduğu belediyeye her yıl Mayıs ve Kasım aylarında taksitler halinde ödenir; satarken belediyeden 'borcu yoktur' yazısı alınması şarttır.",
        "kritikUyari": "Tapuyu satın aldığınız yılın sonuna kadar ilgili belediyeye Emlak Vergisi Bildirimi vermezseniz usulsüzlük cezası uygulanır.",
        "ilgiliTerimler": ["Rayiç Bedel", "Bina Vergisi", "Arsa Vergisi"]
    },
    {
        "terim": "Değer Artış Kazancı Vergisi",
        "slug": "deger-artis-kazanci-vergisi",
        "harf": "D",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Bir gayrimenkulün iktisap (satın alma) tarihinden itibaren 5 yıl içinde elden çıkarılmasından doğan reel net kazanç üzerinden ödenen gelir vergisidir.",
        "hukukiKarsilik": "193 Sayılı Gelir Vergisi Kanunu Mükerrer md. 80/6.",
        "pratikteNeAnlamaGelir": "Evi 2 milyon TL'ye alıp 3 yıl sonra 5 milyon TL'ye satarsanız aradaki kazanç (enflasyon endekslemesi ve istisna düşüldükten sonra) vergilendirilir.",
        "kritikUyari": "Alış tarihinden itibaren 5 tam yıl (60 ay) geçtikten sonra yapılan satışlar Gelir Vergisi'nden %100 muaftır; tek kuruş vergi ödenmez.",
        "ilgiliTerimler": ["5 Yıllık Elde Tutma İstisnası", "Endeksleme", "Rayiç Bedel"]
    },
    {
        "terim": "5 Yıllık Elde Tutma İstisnası",
        "slug": "5-yillik-elde-tutma-istisnasi",
        "harf": "5",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Gerçek kişilerin edindikleri gayrimenkulleri iktisap tarihinden itibaren en az 5 tam yıl ellerinde tuttuktan sonra satmaları halinde kazancın vergiden muaf olmasıdır.",
        "hukukiKarsilik": "193 Sayılı Gelir Vergisi Kanunu Mükerrer md. 80.",
        "pratikteNeAnlamaGelir": "Mülkünüzü 5 yıl bekletip satarsanız elde ettiğiniz kar 50 milyon TL dahi olsa tek kuruş Değer Artış Kazancı Vergisi ödemezsiniz.",
        "kritikUyari": "Miras yoluyla (veraseten) intikal eden gayrimenkullerin satışında 5 yıl kuralı aranmaz; miras kalan mülk ne zaman satılırsa satılsın bu vergiden muaftır.",
        "ilgiliTerimler": ["Değer Artış Kazancı Vergisi", "Miras İntikali"]
    },
    {
        "terim": "Endeksleme (Yİ-ÜFE Artış Oranı)",
        "slug": "endeksleme-yi-ufe",
        "harf": "E",
        "kategori": "Vergi & Harç",
        "kisaTanim": "5 yıl içinde satılan taşınmazın alış maliyetinin, satışın yapıldığı aya kadar olan Yurt İçi Üretici Fiyat Endeksi (Yİ-ÜFE) artış oranıyla güncellenmesidir.",
        "hukukiKarsilik": "193 Sayılı Gelir Vergisi Kanunu Mükerrer md. 81.",
        "pratikteNeAnlamaGelir": "Enflasyon yüzünden kağıt üzerinde yüksek görünen kar vergilendirilmez; gayrimenkulün maliyeti enflasyon oranında yükseltilerek gerçek reel kazanç bulunur.",
        "kritikUyari": "Endeksleme yapılabilmesi için alış ve satış arasındaki Yİ-ÜFE endeks artışının kanunen en az %10 olması zorunludur.",
        "ilgiliTerimler": ["Değer Artış Kazancı Vergisi", "5 Yıllık Elde Tutma İstisnası"]
    },
    {
        "terim": "Kira Gelir Vergisi (GMSİ)",
        "slug": "kira-gelir-vergisi-gmsi",
        "harf": "K",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Konut ve işyeri kira gelirlerinin Gayrimenkul Sermaye İradı (GMSİ) olarak her yıl Mart ayında Gelir İdaresi Başkanlığı'na beyan edilerek ödenen vergisidir.",
        "hukukiKarsilik": "193 Sayılı Gelir Vergisi Kanunu md. 70 vd.",
        "pratikteNeAnlamaGelir": "Kiraya verdiğiniz dairelerden elde ettiğiniz yıllık toplam kira tutarı istisna haddini aşıyorsa e-devlet Hazır Beyan Sistemi üzerinden beyan edilir.",
        "kritikUyari": "Kira bedelinin elden nakit alınması veya banka açıklamasına 'kira' yazılmaması cezayı önlemez; banka ve tapu çapraz denetimiyle geriye dönük cezalı tahsil edilir.",
        "ilgiliTerimler": ["Mesken İstisnası", "Kira Stopajı", "Götürü Gider Yöntemi"]
    },
    {
        "terim": "Kira Stopajı",
        "slug": "kira-stopaji",
        "harf": "K",
        "kategori": "Vergi & Harç",
        "kisaTanim": "İşyeri olarak kiralanan taşınmazlarda brüt kira bedeli üzerinden kiracı (şirket veya esnaf) tarafından vergi dairesine muhtasar beyanname ile ödenen %20 oranındaki tevkifattır.",
        "hukukiKarsilik": "193 Sayılı Gelir Vergisi Kanunu md. 94.",
        "pratikteNeAnlamaGelir": "Mülkünüzü bir şirkete net 20.000 TL'ye kiraya verdiğinizde brütü 25.000 TL olur; kiracı şirket 5.000 TL'yi devlete stopaj vergisi olarak sizin adınıza yatırır.",
        "kritikUyari": "Mülk sahibi yıl sonunda gelir vergisi beyannamesi verirken kiracının vergi dairesine yatırdığı bu stopaj tutarlarını kendi vergisinden kuruşu kuruşuna mahsup eder.",
        "ilgiliTerimler": ["Kira Gelir Vergisi (GMSİ)", "Kira Sözleşmesi"]
    },
    {
        "terim": "Mesken İstisnası",
        "slug": "mesken-istisnasi",
        "harf": "M",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Bireysel konut kira gelirlerinin her yıl Hazine ve Maliye Bakanlığı'nca belirlenen maktu tutarının gelir vergisinden tamamen istisna tutulmasıdır.",
        "hukukiKarsilik": "193 Sayılı Gelir Vergisi Kanunu md. 21.",
        "pratikteNeAnlamaGelir": "Yıllık konut kira geliriniz yasal istisna tutarının (örneğin 33.000 TL) altındaysa beyanname vermez ve hiç vergi ödemezsiniz.",
        "kritikUyari": "Kira gelirini süresinde beyan etmeyen veya eksik beyan edenler mesken istisnasından faydalanma hakkını tamamen kaybeder.",
        "ilgiliTerimler": ["Kira Gelir Vergisi (GMSİ)", "Götürü Gider Yöntemi"]
    },
    {
        "terim": "Götürü Gider Yöntemi (%15)",
        "slug": "goturu-gider-yontemi",
        "harf": "G",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Konut kira geliri beyan eden mükelleflerin hiçbir fatura veya belge göstermeksizin kira hasılatından doğrudan %15 oranında indirim yapabilmesidir.",
        "hukukiKarsilik": "193 Sayılı Gelir Vergisi Kanunu md. 74.",
        "pratikteNeAnlamaGelir": "Kira gelirinizden istisna düşüldükten sonra kalan tutarın %15'i otomatik masraf kabul edilir ve kalan %85 üzerinden vergi hesaplanır.",
        "kritikUyari": "Götürü gider usulünü seçen mükellefler 2 yıl geçmedikçe gerçek gider yöntemine geri dönemez.",
        "ilgiliTerimler": ["Gerçek Gider Yöntemi", "Kira Gelir Vergisi (GMSİ)"]
    },
    {
        "terim": "Gerçek Gider Yöntemi",
        "slug": "gercek-gider-yontemi",
        "harf": "G",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Kiraya verilen taşınmaz için yapılan aydınlatma, ısıtma, onarım, sigorta (DASK), kredi faizleri ve amortisman masraflarının belgelenerek vergiden düşülmesidir.",
        "hukukiKarsilik": "193 Sayılı Gelir Vergisi Kanunu md. 74.",
        "pratikteNeAnlamaGelir": "Yeni aldığınız konut için bankaya ödediğiniz konut kredisi faizleri veya yaptığınız tadilat harcamaları kira gelirinizden düşülür; çoğu zaman vergi sıfıra iner.",
        "kritikUyari": "Yapılan tüm harcamaların faturaları ve belgeleri 5 yıl boyunca saklanmak zorundadır; denetimde fatura ibraz edilemezse vergi cezalı istenir.",
        "ilgiliTerimler": ["Götürü Gider Yöntemi", "Kira Gelir Vergisi (GMSİ)"]
    },
    {
        "terim": "Değerli Konut Vergisi",
        "slug": "degerli-konut-vergisi",
        "harf": "D",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Türkiye sınırları içinde bulunan ve bina vergi değeri kanuni eşik tutarını (örneğin 12,8 milyon TL) aşan lüks konutlar için yıllık ödenen servet vergisidir.",
        "hukukiKarsilik": "1319 Sayılı Emlak Vergisi Kanunu md. 42-49.",
        "pratikteNeAnlamaGelir": "Değerli villası veya rezidansı olan mülk sahipleri her yıl Şubat ve Ağustos aylarında iki taksit halinde bu vergiyi öder.",
        "kritikUyari": "Türkiye sınırları içinde tek bir meskeni olan kimseler (değeri ne kadar yüksek olursa olsun) değerli konut vergisinden tamamen muaftır.",
        "ilgiliTerimler": ["Emlak Vergisi", "Rayiç Bedel"]
    },
    {
        "terim": "Çevre Temizlik Vergisi (CTV)",
        "slug": "cevre-temizlik-vergisi-ctv",
        "harf": "Ç",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Belediyelerin katı atık ve temizlik hizmetleri karşılığında konut ve işyerlerinden tahsil ettiği yerel harç niteliğindeki vergidir.",
        "hukukiKarsilik": "2464 Sayılı Belediye Gelirleri Kanunu Mükerrer md. 44.",
        "pratikteNeAnlamaGelir": "Konutlarda su faturasına otomatik olarak yansıtılır ve su tüketim miktarına göre tahsil edilir; işyerlerinde ise belediyece yıllık tarh edilir.",
        "kritikUyari": "Kiralanan taşınmazlarda Çevre Temizlik Vergisi'nin mükellefi malik değil, binayı fiilen kullanan KİRACIDIR.",
        "ilgiliTerimler": ["Emlak Vergisi", "Kira Sözleşmesi"]
    },
    {
        "terim": "Veraset ve İntikal Vergisi",
        "slug": "veraset-ve-intikal-vergisi",
        "harf": "V",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Miras yoluyla veya karşılıksız (bağış, hibe vb.) olarak bir kişiden diğerine intikal eden gayrimenkul ve mallar üzerinden kademeli oranlarla alınan vergidir.",
        "hukukiKarsilik": "7338 Sayılı Veraset ve İntikal Vergisi Kanunu.",
        "pratikteNeAnlamaGelir": "Vefat eden babanızdan kalan evleri tapuda üzerinize alabilmek için vergi dairesine beyanname verip ilişiği kesmeniz şarttır.",
        "kritikUyari": "Veraset yoluyla intikallerde beyanname verme süresi vefat Türkiye'de gerçekleşmişse 4 aydır. Süre kaçırılırsa usulsüzlük cezası kesilir.",
        "ilgiliTerimler": ["Veraset İlamı", "Miras İntikali", "Bağış Taşınmaz"]
    },
    {
        "terim": "Rayiç Bedel (Belediye Asgari Beyan Değeri)",
        "slug": "rayic-bedel",
        "harf": "R",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Belediye takdir komisyonlarınca cadde ve sokak bazında her 4 yılda bir belirlenen, emlak vergisi ve asgari tapu harcına esas metrekare birim değeridir.",
        "hukukiKarsilik": "213 Sayılı Vergi Usul Kanunu md. 72 ve 1319 Sayılı Kanun.",
        "pratikteNeAnlamaGelir": "Tapuda satış yaparken beyan edeceğiniz satış bedeli belediyenin belirlediği bu rayiç bedelin altında kesinlikle olamaz.",
        "kritikUyari": "Rayiç bedel piyasa satış değeri demek değildir. Tapuda piyasa değeri 10 milyon olan evi rayiç bedeli 2 milyon diye gösterip satmak vergi kaçırma suçudur.",
        "ilgiliTerimler": ["Tapu Harcı", "Pişmanlık Beyannamesi", "Emlak Vergisi"]
    },
    {
        "terim": "Pişmanlık Beyannamesi (VUK 371)",
        "slug": "pismanlik-beyannamesi-tapu-harci-duzeltme",
        "harf": "P",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Tapuda satış bedelini düşük gösteren mükelleflerin, Maliye herhangi bir inceleme başlatmadan önce durumu kendiliğinden bildirip harç farkını cezasız ödemesidir.",
        "hukukiKarsilik": "213 Sayılı Vergi Usul Kanunu md. 371.",
        "pratikteNeAnlamaGelir": "5 milyonluk evi tapuda 1 milyon gösterdiyseniz, pişmanlık dilekçesi vererek aradaki 4 milyonun harcını gecikme faiziyle öder ve %25 vergi ziyaı cezasından kurtulursunuz.",
        "kritikUyari": "Maliye size tebligat gönderdikten veya banka hesap incelemesi başlattıktan sonra pişmanlık hükümlerinden yararlanılamaz.",
        "ilgiliTerimler": ["Tapu Harcı", "Rayiç Bedel", "Vergi Ziyaı Cezası"]
    },
    {
        "terim": "Vergi Ziyaı Cezası",
        "slug": "vergi-ziyai-cezasi",
        "harf": "V",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Mükellefin vergilendirme ile ilgili ödevlerini zamanında yerine getirmemesi veya eksik beyanda bulunması yüzünden verginin zamanında tahakkuk ettirilememesi halinde kesilen cezadır.",
        "hukukiKarsilik": "213 Sayılı Vergi Usul Kanunu md. 341-344.",
        "pratikteNeAnlamaGelir": "Tapu harcını veya kira gelirini eksik beyan edenlere eksik kalan vergi tutarının 1 katı (kasıtlı kaçakçılıkta 3 katı) ceza kesilir.",
        "kritikUyari": "Vergi dairesi uzlaşma komisyonuna başvurarak veya süresinde dava açarak vergi ziyaı cezasında indirim talep edilebilir.",
        "ilgiliTerimler": ["Pişmanlık Beyannamesi", "Gecikme Faizi", "Tapu Harcı"]
    },
    {
        "terim": "Konut Tesliminde KDV Oranları",
        "slug": "konut-tesliminde-kdv-oranlari",
        "harf": "K",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Müteahhitten veya şirketten sıfır konut satın alırken net alanına ve ruhsat tarihine göre fatura üzerinde uygulanan %1, %10 veya %20 oranındaki Katma Değer Vergisidir.",
        "hukukiKarsilik": "3065 Sayılı Katma Değer Vergisi Kanunu ve Cumhurbaşkanı Kararları.",
        "pratikteNeAnlamaGelir": "Net alanı 150 m²'ye kadar olan konutlarda genellikle %10, 150 m²'yi aşan kısımlarda ise %20 KDV hesaplanır. Bireysel 2. el satışlarda KDV sıfırdır.",
        "kritikUyari": "Kentsel dönüşüm (6306 SK) kapsamında inşa edilen konutlarda 150 m²'ye kadar olan teslimlerde KDV oranı indirimli olarak %1 uygulanır.",
        "ilgiliTerimler": ["Kentsel Dönüşüm Harç Muafiyeti", "Net Alan 150 m² Kriteri"]
    },
    {
        "terim": "Yılda 3 Satış Kuralı (Ticari Kazanç Kriteri)",
        "slug": "yilda-3-satis-kurali",
        "harf": "Y",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Bir takvim yılında aynı kişinin 3'ten fazla veya ardışık yıllarda birden fazla gayrimenkul satması halinde faaliyetin ticari kazanç sayılarak mükellefiyet açılması durumudur.",
        "hukukiKarsilik": "193 Sayılı Gelir Vergisi Kanunu md. 37 ve Danıştay Kararları.",
        "pratikteNeAnlamaGelir": "Bireysel yatırımcı aynı yıl içinde 4 daire satarsa Maliye 'sen emlak ticareti yapıyorsun' diyerek geriye dönük KDV ve gelir vergisi mükellefiyeti tesis eder.",
        "kritikUyari": "Ticari kazanç kapsamına sokulursanız 5 yıllık istisna geçerliliğini yitirir ve tüm kazanç üzerinden %15-%40 arası gelir vergisi ile %20 KDV istenir.",
        "ilgiliTerimler": ["Değer Artış Kazancı Vergisi", "5 Yıllık Elde Tutma İstisnası"]
    },
    {
        "terim": "Kentsel Dönüşüm Harç Muafiyeti (6306 SK)",
        "slug": "kentsel-donusum-harc-muafiyeti",
        "harf": "K",
        "kategori": "Vergi & Harç",
        "kisaTanim": "6306 sayılı Afet Riski Altındaki Alanların Dönüştürülmesi Hakkındaki Kanun kapsamında riskli yapı ilan edilen binaların yıkılıp yeniden yapımında sağlanan vergi ve harç muafiyetidir.",
        "hukukiKarsilik": "6306 Sayılı Kanun md. 7/9.",
        "pratikteNeAnlamaGelir": "Tapu harcı, noter harcı, belediye ruhsat ve otopark harçları, damga vergisi ve veraset intikal harçlarından tamamen muaf olunur.",
        "kritikUyari": "Belediyeler veya noterler bu muafiyeti uygulamaktan kaçınamaz. Haksız yere tahsil edilen harçlar idare mahkemesinde dava açılarak yasal faiziyle geri alınır.",
        "ilgiliTerimler": ["Tapu Harcı", "Riskli Yapı Tespiti", "6306 Sayılı Kanun"]
    },
    {
        "terim": 'Bina Vergisi Oranları',
        "slug": 'bina-vergisi-oranlari',
        "harf": 'B',
        "kategori": 'Vergi & Harç',
        "kisaTanim": 'Mesken ve işyerleri için belediyece belirlenen vergi değeri üzerinden büyükşehirlerde binde 2 ve binde 4, diğer illerde binde 1 ve binde 2 olarak uygulanan emlak vergisi oranıdır.',
        "hukukiKarsilik": '1319 Sayılı Emlak Vergisi Kanunu md. 8.',
        "pratikteNeAnlamaGelir": 'Büyükşehir sınırları içindeki konutlar normal illere göre iki kat daha fazla emlak vergisi öder.',
        "kritikUyari": "Mesken olarak kullanılan ancak tapuda 'işyeri' veya 'ofis' görünen bağımsız bölümler daha yüksek orandan (binde 4) vergilendirilir.",
        "ilgiliTerimler": ['Emlak Vergisi', 'Arsa Vergisi Oranları']
    },
    {
        "terim": 'Arsa Vergisi Oranları',
        "slug": 'arsa-vergisi-oranlari',
        "harf": 'A',
        "kategori": 'Vergi & Harç',
        "kisaTanim": 'Belediye sınırları içindeki imarlı arsalar için büyükşehirlerde binde 6, normal illerde binde 3 oranında tahakkuk ettirilen yıllık servet vergisidir.',
        "hukukiKarsilik": '1319 Sayılı Emlak Vergisi Kanunu md. 18.',
        "pratikteNeAnlamaGelir": 'Arsanızın belediye asgari beyan değeri 10 milyon TL ise büyükşehirde her yıl 60.000 TL arsa vergisi ödersiniz.',
        "kritikUyari": 'Üzerinde bina inşaatına başlanıp temel ruhsatı alındığı andan itibaren arsa vergisi yerine geçici bina vergisi tarifesi uygulanır.',
        "ilgiliTerimler": ['Bina Vergisi Oranları', 'Emlak Vergisi']
    },
    {
        "terim": 'Gerçek Satış Bedeli İlkesi',
        "slug": 'gercek-satis-bedeli-ilkesi',
        "harf": 'G',
        "kategori": 'Vergi & Harç',
        "kisaTanim": 'Tapu harcının ve vergilerin belediye asgari rayiç bedeli üzerinden değil, alıcı ile satıcı arasında fiilen el değiştiren gerçek para tutarı üzerinden ödenmesi zorunluluğudur.',
        "hukukiKarsilik": '492 Sayılı Harçlar Kanunu md. 63.',
        "pratikteNeAnlamaGelir": "Banka havalesiyle satıcıya 8 milyon TL gönderip tapuda 2 milyon TL beyan ederseniz Maliye aradaki 6 milyon TL'nin harcını ve cezasını tahsil eder.",
        "kritikUyari": 'Maliye gayrimenkul satışlarını banka transferleri, konut kredisi tutarları ve ekspertiz raporlarıyla çapraz denetleyerek 5 yıl geriye doğru tarar.',
        "ilgiliTerimler": ['Tapu Harcı', 'Rayiç Bedel', 'Pişmanlık Beyannamesi']
    },
    {
        "terim": 'İpotek Tesis Harcı',
        "slug": 'ipotek-tesis-harci',
        "harf": 'İ',
        "kategori": 'Vergi & Harç',
        "kisaTanim": 'Taşınmaz üzerinde borç karşılığı ipotek kurulurken ipotek tutarı üzerinden binde 4.55 oranında tahsil edilen maktu ve nispi tapu harcıdır.',
        "hukukiKarsilik": '492 Sayılı Harçlar Kanunu (4 Sayılı Tarife).',
        "pratikteNeAnlamaGelir": 'Bireysel tüketicilerin konut finansmanı (mortgage) amacıyla çektikleri konut kredisi ipotekleri kanunen bu harçtan tamamen muaftır.',
        "kritikUyari": 'Ticari kredilerde veya şahıslar arası borçlanmalarda tesis edilen ipoteklerde binde 4.55 harç ve damga vergisi peşin tahsil edilir.',
        "ilgiliTerimler": ['İpotek', 'İpotek Terkin Harcı']
    },
    {
        "terim": 'Damga Vergisi (Sözleşmelerde)',
        "slug": 'damga-vergisi-tasinmaz',
        "harf": 'D',
        "kategori": 'Vergi & Harç',
        "kisaTanim": 'Taşınmaz satış vaadi, kat karşılığı inşaat ve kira sözleşmelerinde içerilen en yüksek parasal tutar üzerinden binde 9.48 oranında alınan kağıt vergisidir.',
        "hukukiKarsilik": '488 Sayılı Damga Vergisi Kanunu (1 Sayılı Tablo).',
        "pratikteNeAnlamaGelir": 'Noterde yapılan kat karşılığı inşaat sözleşmelerinde kentsel dönüşüm kapsamında değilse yüksek damga vergisi tahakkuk eder.',
        "kritikUyari": '6306 sayılı Kentsel Dönüşüm Kanunu kapsamındaki sözleşmeler damga vergisinden tamamen istisnadır; noterlere bu muafiyet hatırlatılmalıdır.',
        "ilgiliTerimler": ['Kentsel Dönüşüm Harç Muafiyeti', 'Noter Harçları']
    },
    {
        "terim": 'Emlak Vergisi Muafiyeti (Tek Mesken)',
        "slug": 'emlak-vergisi-muafiyeti-tek-mesken',
        "harf": 'E',
        "kategori": 'Vergi & Harç',
        "kisaTanim": "Geliri sadece emekli maaşından ibaret olanlar, gaziler, engelliler, şehit dul ve yetimlerinin brüt 200 m²'yi geçmeyen tek meskenleri için sıfır oranlı emlak vergisi uygulanmasıdır.",
        "hukukiKarsilik": '1319 Sayılı Emlak Vergisi Kanunu md. 8.',
        "pratikteNeAnlamaGelir": 'Emekli vatandaş belediyeye tek konut dilekçesi vererek her yıl ödediği emlak vergisinden tamamen muaf olur.',
        "kritikUyari": 'Hakkı olduğu halde bilmeden vergi ödeyen emekliler geriye dönük son 5 yılın ödediği emlak vergilerini belediyeden nakden iade alabilir.',
        "ilgiliTerimler": ['Emlak Vergisi', 'Bina Vergisi Oranları']
    },
    {
        "terim": 'Bina Vergisi Oranları',
        "slug": 'bina-vergisi-oranlari',
        "harf": 'B',
        "kategori": 'Vergi & Harç',
        "kisaTanim": 'Mesken ve işyerleri için belediyece belirlenen vergi değeri üzerinden büyükşehirlerde binde 2 ve binde 4, diğer illerde binde 1 ve binde 2 olarak uygulanan emlak vergisi oranıdır.',
        "hukukiKarsilik": '1319 Sayılı Emlak Vergisi Kanunu md. 8.',
        "pratikteNeAnlamaGelir": 'Büyükşehir sınırları içindeki konutlar normal illere göre iki kat daha fazla emlak vergisi öder.',
        "kritikUyari": "Mesken olarak kullanılan ancak tapuda 'işyeri' veya 'ofis' görünen bağımsız bölümler daha yüksek orandan (binde 4) vergilendirilir.",
        "ilgiliTerimler": ['Emlak Vergisi', 'Arsa Vergisi Oranları']
    },
    {
        "terim": 'Arsa Vergisi Oranları',
        "slug": 'arsa-vergisi-oranlari',
        "harf": 'A',
        "kategori": 'Vergi & Harç',
        "kisaTanim": 'Belediye sınırları içindeki imarlı arsalar için büyükşehirlerde binde 6, normal illerde binde 3 oranında tahakkuk ettirilen yıllık servet vergisidir.',
        "hukukiKarsilik": '1319 Sayılı Emlak Vergisi Kanunu md. 18.',
        "pratikteNeAnlamaGelir": 'Arsanızın belediye asgari beyan değeri 10 milyon TL ise büyükşehirde her yıl 60.000 TL arsa vergisi ödersiniz.',
        "kritikUyari": 'Üzerinde bina inşaatına başlanıp temel ruhsatı alındığı andan itibaren arsa vergisi yerine geçici bina vergisi tarifesi uygulanır.',
        "ilgiliTerimler": ['Bina Vergisi Oranları', 'Emlak Vergisi']
    },
    {
        "terim": 'Gerçek Satış Bedeli İlkesi',
        "slug": 'gercek-satis-bedeli-ilkesi',
        "harf": 'G',
        "kategori": 'Vergi & Harç',
        "kisaTanim": 'Tapu harcının ve vergilerin belediye asgari rayiç bedeli üzerinden değil, alıcı ile satıcı arasında fiilen el değiştiren gerçek para tutarı üzerinden ödenmesi zorunluluğudur.',
        "hukukiKarsilik": '492 Sayılı Harçlar Kanunu md. 63.',
        "pratikteNeAnlamaGelir": "Banka havalesiyle satıcıya 8 milyon TL gönderip tapuda 2 milyon TL beyan ederseniz Maliye aradaki 6 milyon TL'nin harcını ve cezasını tahsil eder.",
        "kritikUyari": 'Maliye gayrimenkul satışlarını banka transferleri, konut kredisi tutarları ve ekspertiz raporlarıyla çapraz denetleyerek 5 yıl geriye doğru tarar.',
        "ilgiliTerimler": ['Tapu Harcı', 'Rayiç Bedel', 'Pişmanlık Beyannamesi']
    },
    {
        "terim": 'İpotek Tesis Harcı',
        "slug": 'ipotek-tesis-harci',
        "harf": 'İ',
        "kategori": 'Vergi & Harç',
        "kisaTanim": 'Taşınmaz üzerinde borç karşılığı ipotek kurulurken ipotek tutarı üzerinden binde 4.55 oranında tahsil edilen maktu ve nispi tapu harcıdır.',
        "hukukiKarsilik": '492 Sayılı Harçlar Kanunu (4 Sayılı Tarife).',
        "pratikteNeAnlamaGelir": 'Bireysel tüketicilerin konut finansmanı (mortgage) amacıyla çektikleri konut kredisi ipotekleri kanunen bu harçtan tamamen muaftır.',
        "kritikUyari": 'Ticari kredilerde veya şahıslar arası borçlanmalarda tesis edilen ipoteklerde binde 4.55 harç ve damga vergisi peşin tahsil edilir.',
        "ilgiliTerimler": ['İpotek', 'İpotek Terkin Harcı']
    },
    {
        "terim": 'Damga Vergisi (Sözleşmelerde)',
        "slug": 'damga-vergisi-tasinmaz',
        "harf": 'D',
        "kategori": 'Vergi & Harç',
        "kisaTanim": 'Taşınmaz satış vaadi, kat karşılığı inşaat ve kira sözleşmelerinde içerilen en yüksek parasal tutar üzerinden binde 9.48 oranında alınan kağıt vergisidir.',
        "hukukiKarsilik": '488 Sayılı Damga Vergisi Kanunu (1 Sayılı Tablo).',
        "pratikteNeAnlamaGelir": 'Noterde yapılan kat karşılığı inşaat sözleşmelerinde kentsel dönüşüm kapsamında değilse yüksek damga vergisi tahakkuk eder.',
        "kritikUyari": '6306 sayılı Kentsel Dönüşüm Kanunu kapsamındaki sözleşmeler damga vergisinden tamamen istisnadır; noterlere bu muafiyet hatırlatılmalıdır.',
        "ilgiliTerimler": ['Kentsel Dönüşüm Harç Muafiyeti', 'Noter Harçları']
    },
    {
        "terim": 'Emlak Vergisi Muafiyeti (Tek Mesken)',
        "slug": 'emlak-vergisi-muafiyeti-tek-mesken',
        "harf": 'E',
        "kategori": 'Vergi & Harç',
        "kisaTanim": "Geliri sadece emekli maaşından ibaret olanlar, gaziler, engelliler, şehit dul ve yetimlerinin brüt 200 m²'yi geçmeyen tek meskenleri için sıfır oranlı emlak vergisi uygulanmasıdır.",
        "hukukiKarsilik": '1319 Sayılı Emlak Vergisi Kanunu md. 8.',
        "pratikteNeAnlamaGelir": 'Emekli vatandaş belediyeye tek konut dilekçesi vererek her yıl ödediği emlak vergisinden tamamen muaf olur.',
        "kritikUyari": 'Hakkı olduğu halde bilmeden vergi ödeyen emekliler geriye dönük son 5 yılın ödediği emlak vergilerini belediyeden nakden iade alabilir.',
        "ilgiliTerimler": ['Emlak Vergisi', 'Bina Vergisi Oranları']
    }
]

print(f"data_vergi.py hazır: {len(VERGI_TERIMLERI)} terim.")
