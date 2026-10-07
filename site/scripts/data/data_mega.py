# -*- coding: utf-8 -*-
"""
data_mega.py — EDM Emlak Sözlüğü Kapsamlı Genişletme Paketi (Bölüm 1: Tapu, İmar, Kira)
Mevzuat dayanaklı, saha gerçekli ve yatırımcı uyarılı terimler.
"""

MEGA_TERIMLER_1 = [
    {
        "terim": "İştirak Halinde Mülkiyetin Paylı Mülkiyete Çevrilmesi",
        "slug": "istirak-mulkiyetin-payli-mulkiyete-cevrilmesi",
        "harf": "İ",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Miras kalan gayrimenkulde tek bir mirasçının sulh hukuk mahkemesine veya tapu müdürlüğüne başvurarak tüm ortakların hisselerini bağımsız paylı mülkiyete dönüştürmesidir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 644 ve Tapu Kanunu.",
        "pratikteNeAnlamaGelir": "Mirasçılar arasında anlaşma olmasa bile tek bir mirasçı talep ederse tapu müdürlüğü diğer mirasçılara tebligat çıkarır; itiraz edilmezse mülkiyet paylı mülkiyete döner.",
        "kritikUyari": "Paylı mülkiyete geçildiği andan itibaren her hissedar kendi payını başkasına satabilir ve diğer hissedarlar için şufa (önalım) hakkı doğar.",
        "ilgiliTerimler": ["Elbirliği Mülkiyeti", "Paylı Mülkiyet", "Şufa (Önalım) Hakkı"]
    },
    {
        "terim": "Tapu Tahsis Belgesi",
        "slug": "tapu-tahsis-belgesi",
        "harf": "T",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Gecekondu Kanunu kapsamında kamu arazisi üzerine ev yapmış kişilere belediyece verilen, mülkiyet hakkı değil yalnızca şahsi hak sağlayan belgedir.",
        "hukukiKarsilik": "2981 Sayılı İmar ve Gecekondu Mevzuatına Aykırı Yapılara Uygulanacak Bazı İşlemler Hakkında Kanun md. 10.",
        "pratikteNeAnlamaGelir": "Halk arasında 'gecekondu tapusu' diye bilinir; tapu senedi değildir. Parselasyon yapıldığında gerçek tapuya dönüştürülme hakkı verir.",
        "kritikUyari": "Tapu tahsis belgesi doğrudan satılamaz ve ipotek edilemez; üzerinde hak iddia edebilmek için arsa bedelinin belediyeye ödenip müstakil tapuya bağlanması şarttır.",
        "ilgiliTerimler": ["Müstakil Tapu", "Zilyetlik", "İmar Barışı"]
    },
    {
        "terim": "Şartlı Bağış (Rücu Şartıyla Bağışlama)",
        "slug": "sartli-bagis-rucu-sartli-bagislama",
        "harf": "Ş",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bağışlayanın, bağışlanan kişinin kendisinden önce ölmesi veya belirli bir şartı yerine getirmemesi halinde taşınmazın kendisine geri dönmesini öngördüğü devirdir.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 292 ve Tapu Kanunu.",
        "pratikteNeAnlamaGelir": "Anne babanın evini çocuğuna bağışlarken 'benden önce vefat edersen ev bana geri dönsün' şerhini tapu kütüğüne işletmesidir.",
        "kritikUyari": "Rücu şartı tapu kütüğüne açıkça tescil edilmezse mülk çocuktan torunlara veya damada/geline miras kalabilir.",
        "ilgiliTerimler": ["Veraset ve İntikal Vergisi", "Tenkis Davası"]
    },
    {
        "terim": "Gaiplik Kararının Tapuya Etkisi",
        "slug": "gaiplik-kararinin-tapuya-etkisi",
        "harf": "G",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Ölüm tehlikesi içinde kaybolan veya kendisinden 5 yıl haber alınamayan bir malik hakkında mahkemece gaiplik kararı verilerek mülkünün mirasçılarına intikalidir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 32-35 ve 584-588.",
        "pratikteNeAnlamaGelir": "Yıllardır ulaşılamayan ve kayıp olan malikin arsası mahkeme kararıyla mirasçılarına geçer; mirasçılar teminat göstererek tapuyu devralır.",
        "kritikUyari": "Gaip kişi sonradan çıkıp gelirse tapusunu her zaman geri isteyebilir; mirasçılar iyiniyetle tükettikleri kısımlar hariç mülkü iade etmekle yükümlüdür.",
        "ilgiliTerimler": ["Miras İntikali", "Veraset İlamı"]
    },
    {
        "terim": "Tapu Kaydında Düzeltme (Tashih) Davası",
        "slug": "tapu-kaydinda-duzeltme-tashih-davasi",
        "harf": "T",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Tapu kütüğünde malikin adı, soyadı, baba adı veya doğum tarihinin nüfus kaydıyla uyuşmaması halinde sulh hukuk mahkemesinde açılan düzeltme davasıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 1027 ve Tapu Sicili Tüzüğü md. 75.",
        "pratikteNeAnlamaGelir": "Eski dededen kalan tapuda 'Mehmet oğlu Ali' yazıp kimlikte 'Ali Can' yazdığında tapu devri yapılamaz; bu dava ile kayıt nüfusla eşitlenir.",
        "kritikUyari": "Önce tapu müdürlüğüne idari yoldan düzeltme başvurusu yapılmalıdır; tapu reddederse mahkemede tashih davası açılır.",
        "ilgiliTerimler": ["Tapu Kütüğü", "Miras İntikali"]
    },
    {
        "terim": "Yapı Alacaklısı İpoteği (İnşaatçı İpoteği)",
        "slug": "yapi-alacaklisi-ipotegi",
        "harf": "Y",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir inşaatta çalışan müteahhit, mimar veya taşeronların, yapıya harcadıkları emek ve malzeme alacakları için taşınmaz üzerine mahkeme kararıyla koydurdukları kanuni ipotektir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 893-897.",
        "pratikteNeAnlamaGelir": "Müteahhit işi bitirip parasını arsa sahibinden alamadığında tapuya inşaatçı ipoteği tescil ettirerek arsayı icradan sattırabilir.",
        "kritikUyari": "İnşaatın tamamlanmasından itibaren en geç 3 ay içinde tapuya tescil edilmesi şarttır; 3 ay geçerse kanuni ipotek hakkı düşer.",
        "ilgiliTerimler": ["İpotek", "Arsa Payı Karşılığı İnşaat Sözleşmesi"]
    },
    {
        "terim": "Mülkiyetin Terki (Dereliction)",
        "slug": "mulkiyetin-terki-dereliction",
        "harf": "M",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Bir taşınmaz malikinin tapu müdürlüğüne başvurarak taşınmaz üzerindeki mülkiyet hakkından tek taraflı irade beyanıyla vazgeçmesi ve mülkün sahipsiz kalmasıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 717.",
        "pratikteNeAnlamaGelir": "Aşırı borçlu, heyelan sahasında veya vergi borcu mülk değerini aşmış yerlerde malik resmi senetle mülkiyeti terk eder.",
        "kritikUyari": "Terk edilen taşınmaz sahipsiz mal statüsüne geçer ve doğrudan Hazine'nin mülkiyetine dahil olur.",
        "ilgiliTerimler": ["Tapu Kütüğü", "Hazine Taşınmazı"]
    },
    {
        "terim": "Değer Artış Payı (İmar Planı Değişikliği Payı)",
        "slug": "deger-artis-payi-imar-degisikligi",
        "harf": "D",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "Taşınmaz malikinin talebi üzerine yapılan imar planı değişikliği sonucunda taşınmazda meydana gelen değer artışının kamuya ödenen kısmıdır.",
        "hukukiKarsilik": "3194 Sayılı İmar Kanunu Ek Madde 8.",
        "pratikteNeAnlamaGelir": "Arsanızın emsalini 1.00'den 2.00'ye yükselttirdiğinizde SPK lisanslı değerlemeyle belirlenen değer farkının tamamı veya büyük kısmı kamuya nakden ödenir.",
        "kritikUyari": "Değer artış payı ödenmeden yapı ruhsatı kesinlikle düzenlenemez ve tapu kütüğüne 'Değer Artış Payı Ödenmemiştir' şerhi işlenir.",
        "ilgiliTerimler": ["İmar Planı", "Emsal (KAKS)", "Yapı Ruhsatı"]
    },
    {
        "terim": "İmar Planına İtiraz Süresi (30 Gün)",
        "slug": "imar-planina-itiraz-suresi",
        "harf": "İ",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "Belediye meclisince onaylanan imar planlarının belediye ilan panosunda ve internet sitesinde askıya çıkarıldığı 30 günlük yasal itiraz süresidir.",
        "hukukiKarsilik": "3194 Sayılı İmar Kanunu md. 8/b.",
        "pratikteNeAnlamaGelir": "Arsanız park alanına alındıysa veya yola terk miktarı haksız artırıldıysa bu 30 gün içinde belediyeye resmi itiraz dilekçesi vermelisiniz.",
        "kritikUyari": "30 günlük askı süresinde itiraz edilmeyen planlara karşı sonradan idare mahkemesinde dava açma hakkı süre aşımı nedeniyle düşebilir.",
        "ilgiliTerimler": ["İmar Planı", "Uygulama İmar Planı"]
    },
    {
        "terim": "Müktesep Hak (İmar Hukukunda Kazanılmış Hak)",
        "slug": "muktesep-hak-imar-kazanilmis-hak",
        "harf": "M",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "Yürürlükteki imar planına ve mevzuata uygun olarak alınmış ruhsata dayanılarak inşasına başlanan yapının, sonradan imar planı değişse bile korunması ilkesidir.",
        "hukukiKarsilik": "Danıştay İdari Dava Daireleri Kurulu Yerleşik Kararları ve 3194 SK.",
        "pratikteNeAnlamaGelir": "Ruhsatınızı alıp temeli attıktan sonra belediye emsali düşürse dahi başladığınız inşaatı eski yüksek emsale göre bitirip iskan alabilirsiniz.",
        "kritikUyari": "Kazanılmış hakkın doğabilmesi için yapı ruhsatının yasal süresi (5 yıl) dolmadan inşaata fiilen başlanmış olması ve ruhsatın hukuka uygun alınmış olması şarttır.",
        "ilgiliTerimler": ["Yapı Ruhsatı", "Ruhsat Yenileme", "İmar Çapı"]
    },
    {
        "terim": "Ulusal Adres Veri Tabanı (UAVT Kodu)",
        "slug": "ulusal-adres-veri-tabani-uavt",
        "harf": "U",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "Türkiye genelindeki her bir konut ve işyerine verilen, belediye numarataj sistemine kayıtlı 10 haneli benzersiz resmi bina kimlik numarasıdır.",
        "hukukiKarsilik": "5490 Sayılı Nüfus Hizmetleri Kanunu ve Adres Kayıt Sistemi Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Elektrik, su, doğalgaz bağlatırken, DASK poliçesi kesilirken veya ikametgah kaydı yapılırken sokak adı yerine doğrudan UAVT kodu kullanılır.",
        "kritikUyari": "UAVT kodu bulunmayan kaçak veya ruhsatsız binalara yasal abonelik bağlanamaz ve DASK sigortası düzenlenemez.",
        "ilgiliTerimler": ["DASK Zorunlu Deprem Sigortası", "Yapı Kullanma İzin Belgesi"]
    },
    {
        "terim": "Şuyulu Arsa (Hisseli İmar Parseli)",
        "slug": "suyulu-arsa-hisseli-imar-parseli",
        "harf": "Ş",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "18. madde imar uygulaması sonucunda müstakil parsel büyüklüğünü tutturamayan birden fazla kadastro parselinin zorunlu olarak tek imar parselinde birleştirilmesidir.",
        "hukukiKarsilik": "3194 Sayılı İmar Kanunu md. 18.",
        "pratikteNeAnlamaGelir": "Tanımadığınız kişilerle aynı arsa üzerinde ortak olursunuz; inşaat yapmak için tüm hissedarların birlikte müteahhitle anlaşması gerekir.",
        "kritikUyari": "Hissedarlardan biri inşaata yanaşmazsa diğer ortaklar izale-i şüyu (ortaklığın giderilmesi) davası açarak arsayı icra kanalıyla sattırabilir.",
        "ilgiliTerimler": ["18. Madde Uygulaması", "İzale-i Şüyu", "Hisseli Tapu"]
    },
    {
        "terim": "Boğaziçi İmar Kanunu (2960 SK)",
        "slug": "bogazici-imar-kanunu-2960-sk",
        "harf": "B",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "İstanbul Boğaziçi alanının kültürel, tarihi ve doğal güzelliklerini korumak amacıyla sahil şeridi ve öngörünüm bölgesinde yeni inşaatı kesin olarak yasaklayan özel kanundur.",
        "hukukiKarsilik": "2960 Sayılı Boğaziçi Kanunu.",
        "pratikteNeAnlamaGelir": "Boğaz manzaralı parsellerde yeni villa veya bina yapılamaz; sadece mevcut tescilli eski eserlerin aslına uygun tadilatına ve güçlendirilmesine izin verilir.",
        "kritikUyari": "Boğaziçi öngörünüm bölgesinde yapılan kaçak yapılar için İmar Kanunu değil 2960 sayılı Kanun hükümleri uygulanır ve yapılar istisnasız derhal yıktırılır.",
        "ilgiliTerimler": ["Kıyı Kenar Çizgisi", "Doğal Sit Alanı", "Kaçak Yapı"]
    },
    {
        "terim": "Kiraya Verenin Hapis Hakkı",
        "slug": "kiraya-verenin-hapis-hakki",
        "harf": "K",
        "kategori": "Kira & Tahliye",
        "kisaTanim": "İşyeri kiralarında malikin, ödenmemiş geçmiş bir yıllık ve işlemekte olan altı aylık kira alacağını temin etmek için kiralanandaki menkul mallara el koyma yetkisidir.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 336-338 ve İcra İflas Kanunu md. 270.",
        "pratikteNeAnlamaGelir": "Kirasını ödemeyen dükkan veya fabrika kiracısının kaçmasını önlemek için icra müdürlüğü aracılığıyla dükkandaki mallara hapis hakkı şerhi konulur.",
        "kritikUyari": "Bu hak sadece çatılı işyeri kiralarında geçerlidir; konut kiralarında kiracının ev eşyaları üzerine hapis hakkı kullanılamaz.",
        "ilgiliTerimler": ["Kira İcra Takibi", "Temerrüt Nedeniyle Tahliye"]
    },
    {
        "terim": "Kaymakamlık Yoluyla Tahliye (3091 SK)",
        "slug": "kaymakamlik-yoluyla-tahliye-3091-sk",
        "harf": "K",
        "kategori": "Kira & Tahliye",
        "kisaTanim": "Taşınmazına haksız yere tecavüz veya müdahale edilen malikin mahkemeye gitmeden doğrudan kaymakamlığa başvurarak 15 gün içinde tecavüzü men ettirmesidir.",
        "hukukiKarsilik": "3091 Sayılı Taşınmaz Mal Zilyetliğine Yapılan Tecavüzlerin Önlenmesi Hakkında Kanun.",
        "pratikteNeAnlamaGelir": "Yazlığınıza veya boş dairenize kapıyı kırıp kaçak giren işgalcileri mahkeme süreci beklemeden polis eşliğinde kapı önüne koymanın en hızlı idari yoludur.",
        "kritikUyari": "Tecavüzün öğrenildiği tarihten itibaren 60 gün ve her halükarda tecavüzün gerçekleşmesinden itibaren 1 yıl içinde kaymakamlığa başvurulması şarttır.",
        "ilgiliTerimler": ["Müdahalenin Men'i Davası", "Zilyetlik", "Ecrimisil Davası"]
    },
    {
        "terim": "Kira Bedelinin Bankadan Yatırılma Zorunluluğu",
        "slug": "kira-bedelinin-bankadan-yatirilma-zorunlulugu",
        "harf": "K",
        "kategori": "Kira & Tahliye",
        "kisaTanim": "Konut ve işyeri kiralarında tutarı ne olursa olsun tüm kira ödemelerinin banka veya PTT kanalıyla belgelendirilerek yapılması zorunluluğudur.",
        "hukukiKarsilik": "Gelir Vergisi Genel Tebliği (Seri No: 328).",
        "pratikteNeAnlamaGelir": "Kiranın bir lirasının bile elden nakit ödenmesi yasaktır; elden ödeme yapıldığında hem kiracıya hem ev sahibine her işlem için ayrı ayrı ceza kesilir.",
        "kritikUyari": "Elden ödeme yapan taraflara kira tutarının %10'undan az olmamak üzere özel usulsüzlük cezası uygulanır. Dekontun açıklama kısmına 'kira' yazılması şarttır.",
        "ilgiliTerimler": ["Kira Gelir Vergisi (GMSİ)", "Kira Sözleşmesi"]
    },
    {
        "terim": "Muacceliyet Kaydı Yasağı (TBK 346)",
        "slug": "muacceliyet-kaydi-yasagi-tbk-346",
        "harf": "M",
        "kategori": "Kira & Tahliye",
        "kisaTanim": "Kira sözleşmesinde 'bir kira vadesinde ödenmezse sonraki tüm ayların kirası muaccel olur (peşin ödenir)' şartının kanunen kesin hükümsüz olmasıdır.",
        "hukukiKarsilik": "Türk Borçlar Kanunu md. 346.",
        "pratikteNeAnlamaGelir": "Ev sahibi kiracı bir ayı geciktirdi diye 'tüm yılın kirasını peşin ver' diyemez; sözleşmede böyle bir madde yazılı olsa bile mahkemece yok hükmünde sayılır.",
        "kritikUyari": "Bu yasak emredici hukuk kuralıdır; sadece çatılı konut kiralarında değil, tacir olmayan kiracılarda da kiracıyı korur.",
        "ilgiliTerimler": ["Kira Sözleşmesi", "Temerrüt Nedeniyle Tahliye"]
    }
]

print(f"data_mega.py Bölüm 1 hazır: {len(MEGA_TERIMLER_1)} terim.")
