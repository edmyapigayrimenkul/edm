# -*- coding: utf-8 -*-
"""
data_mega_3.py — EDM Emlak Sözlüğü Kapsamlı Genişletme Paketi (Bölüm 3: Saha, Miras, Tesis, Hukuk)
"""

MEGA_TERIMLER_3 = [
    {
        "terim": "Asansör Yeşil Bilgi Etiketi",
        "slug": "asansor-yesil-bilgi-etiketi",
        "harf": "A",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Binalardaki asansörlerin yıllık periyodik muayenesinde can ve mal güvenliği açısından tam uygun olduğunu gösteren resmi denetim etiketidir.",
        "hukukiKarsilik": "Asansör İşletme ve Bakım Yönetmeliği ve Kat Mülkiyeti Kanunu.",
        "pratikteNeAnlamaGelir": "A tipi akredite muayene kuruluşu kabin içine yeşil etiket yapıştırır; bu etiket asansörün 1 yıl boyunca güvenle kullanılabileceğini belgeler.",
        "kritikUyari": "Kırmızı etiket alan asansörün 60 gün içinde tamir ettirilmemesi halinde belediye asansörü mühürler; yöneticinin cezai ve hukuki sorumluluğu doğar.",
        "ilgiliTerimler": ["Kat Malikleri Kurulu", "Ortak Alanlar", "Yönetim Planı"]
    },
    {
        "terim": "Paratoner ve Yıldırımdan Korunma Tesisatı",
        "slug": "paratoner-ve-yildirimin-korunma-tesisati",
        "harf": "P",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Yüksek binaları yıldırım düşmesine karşı korumak ve aşırı elektrik akımını toprağa iletmek amacıyla çatıya kurulan aktif yakalama ucu ve topraklama sistemidir.",
        "hukukiKarsilik": "Binaların Yangından Korunması Hakkında Yönetmelik md. 64.",
        "pratikteNeAnlamaGelir": "Yıldırım enerjisi binaya ve elektrik tesisatına zarar vermeden çatıdaki bakır iletkenlerle doğrudan topraklama levhalarına aktarılır.",
        "kritikUyari": "Paratoner topraklama direnci her yıl elektrik mühendisleri odasınca ölçülmelidir; 10 ohm üzerindeki dirençler yıldırım anında yangın çıkarır.",
        "ilgiliTerimler": ["Elektrik Tesisat Projesi", "Yapı Kullanma İzin Belgesi"]
    },
    {
        "terim": "Hidrofor ve Basınçlı Su Sistemi",
        "slug": "hidrofor-ve-basincli-su-sistemi",
        "harf": "H",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Şebeke su basıncının yetersiz kaldığı çok katlı binalarda su deposundaki suyu basınçlandırarak üst katlara ulaştıran otomatik pompalama sistemidir.",
        "hukukiKarsilik": "Planlı Alanlar İmar Yönetmeliği md. 52.",
        "pratikteNeAnlamaGelir": "Şebeke suları kesilse veya basıncı düşse bile binadaki su deposu ve hidrofor sayesinde dairelerin çeşmelerinden su kesintisiz akar.",
        "kritikUyari": "Hidroforun doğrudan ana şehir şebekesine bağlanması kanunen yasaktır; mutlaka önce bina su deposuna girmeli, oradan hidroforla basılmalıdır.",
        "ilgiliTerimler": ["Su Deposu ve Yangın Rezervi", "Emsal Harici Alanlar"]
    },
    {
        "terim": "Su Deposu ve Yangın Rezervi",
        "slug": "su-deposu-ve-yangin-rezervi",
        "harf": "S",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Binalarda su kesintilerinde kullanma suyu ihtiyacını karşılayan ve yangın söndürme sprinklerine daima hazır bekletilen zorunlu su depolama hacmidir.",
        "hukukiKarsilik": "Binaların Yangından Korunması Hakkında Yönetmelik md. 92.",
        "pratikteNeAnlamaGelir": "Bodrum katta paslanmaz çelik veya modüler prizmatik su deposu kurulur; yangın rezervi vanası hiçbir zaman kapatılamaz.",
        "kritikUyari": "İçme ve kullanma suyu depolarının yılda en az bir defa İl Sağlık Müdürlüğü standartlarında dezenfekte edilmesi salgın hastalıkları önlemek için zorunludur.",
        "ilgiliTerimler": ["Hidrofor Sistemi", "Yangın Sprinkler Sistemi"]
    },
    {
        "terim": "Sızdırmaz Foseptik Çukuru",
        "slug": "sizdirmaz-foseptik-cukuru",
        "harf": "S",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "Kanalizasyon şebekesi bulunmayan köy ve kırsal alanlardaki yapıların atık sularını toplamak üzere yer altına inşa edilen su geçirmez fosseptik tankıdır.",
        "hukukiKarsilik": "Lağım Mecrası İnşası Mümkün Olmayan Yerlerde Yapılacak Çukurlara Ait Yönetmelik.",
        "pratikteNeAnlamaGelir": "Bağ evinizin veya köy evinizin atık suları bu tankta toplanır ve belirli aralıklarla belediye vidanjörü çağrılarak boşalttırılır.",
        "kritikUyari": "Fosseptiğin tabanını açık bırakıp pis suyu yeraltı sularına sızdırmak Türk Ceza Kanunu kapsamında 'Çevrenin Kasten Kirletilmesi' suçudur.",
        "ilgiliTerimler": ["Plansız Alanlar İmar Yönetmeliği", "Bağ Evi İzni"]
    },
    {
        "terim": "Kanal Bağlantı Belgesi (İSKİ / Su İdaresi Onayı)",
        "slug": "kanal-baglanti-belgesi",
        "harf": "K",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "İnşaatın atık su ve yağmur suyu hatlarının ana şehir kanalizasyon şebekesine usulüne uygun bağlandığını gösteren resmi su idaresi izin belgesidir.",
        "hukukiKarsilik": "2560 Sayılı İSKİ Kanunu ve Kanalizasyona Deşarj Yönetmelikleri.",
        "pratikteNeAnlamaGelir": "Bu belge alınmadan belediyeler kesin iskan (yapı kullanma izin belgesi) vermez; inşaatın altyapı bitiş vizesidir.",
        "kritikUyari": "Yağmur suyunu atık su kanalizasyonuna bağlamak yasaktır; ayrık sistem kuralına uyulmazsa su idaresi ağır altyapı cezaları uygular.",
        "ilgiliTerimler": ["Yapı Kullanma İzin Belgesi", "Drenaj Hattı"]
    },
    {
        "terim": "Taşıyıcı Duvar (Yığma Yapı)",
        "slug": "tasiyici-duvar-yigma-yapi",
        "harf": "T",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Betonarme kolon ve kirişi bulunmayan yığma kargir binalarda, üst kat döşemelerinin ve çatının tüm ağırlığını doğrudan zemine aktaran tuğla veya taş duvardır.",
        "hukukiKarsilik": "TBDY 2018 Bölüm 11 (Yığma Bina Tasarım Kuralları).",
        "pratikteNeAnlamaGelir": "Eski taş ve tuğla apartmanlarda oda duvarları taşıyıcıdır; betonarme binalardaki gibi duvarı kırıp mutfağa katamazsınız.",
        "kritikUyari": "Yığma binada tek bir taşıyıcı duvara kapı açmak veya duvarı yıkmak tavanın doğrudan üzerinize çökmesine sebep olur.",
        "ilgiliTerimler": ["Karkas", "Hatıl Betonu", "Statik Performans Analizi"]
    },
    {
        "terim": "Hatıl Betonu",
        "slug": "hatil-betonu",
        "harf": "H",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Yığma tuğla veya taş duvarların üzerine yatay ve düşey olarak dökülen, duvarların birbirinden ayrılmasını engelleyen betonarme bağlama kuşağıdır.",
        "hukukiKarsilik": "TBDY 2018 ve TS 500.",
        "pratikteNeAnlamaGelir": "Duvarların üst sınırında kesintisiz uzanan hatıl, deprem sarsıntısında duvarların bir kutu gibi birlikte hareket etmesini sağlar.",
        "kritikUyari": "Hatılsız inşa edilen yığma yapılar ilk orta ölçekli depremde köşelerinden yarılarak dışa doğru yıkılır.",
        "ilgiliTerimler": ["Taşıyıcı Duvar", "Yığma Yapı"]
    },
    {
        "terim": "Kıdem Tazminatı Fonu (Apartman Görevlisi)",
        "slug": "kidem-tazminati-apartman-gorevlisi",
        "harf": "K",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Apartman ve sitelerde çalışan kapıcı veya güvenlik görevlilerinin ileride doğacak kıdem tazminatlarını karşılamak üzere kat maliklerinden toplanan vadeli fondur.",
        "hukukiKarsilik": "1475 Sayılı İş Kanunu md. 14 ve 634 Sayılı KMK md. 20.",
        "pratikteNeAnlamaGelir": "Daire satın aldığınızda kapıcının geçmiş 10 yıllık kıdem tazminatından yeni malik olarak arsa payınız oranında kanunen sorumlu olursunuz.",
        "kritikUyari": "Apartman yönetimi kıdem tazminatı fonu biriktirmemişse kapıcı emekli olduğunda yeni daire sahibine bir gecede on binlerce lira tazminat payı düşebilir.",
        "ilgiliTerimler": ["Kat Malikleri Kurulu", "Yönetim Planı", "Aidat Sorumluluğu"]
    },
    {
        "terim": "Terekenin Tespiti Davası",
        "slug": "terekenin-tespiti-davasi",
        "harf": "T",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Vefat eden kişinin geride bıraktığı tüm tapulu gayrimenkullerin, banka hesaplarının, hisse senetlerinin ve borçlarının mahkemece resmi olarak tespit edilmesidir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 589-594.",
        "pratikteNeAnlamaGelir": "Mirasbırakanın hangi şehirde ne kadar arsası, dairesi veya parası olduğunu bilmeyen mirasçılar sulh hukuk mahkemesinden tereke tespiti ister.",
        "kritikUyari": "Mahkeme TKGM, bankalar, SPK ve noterlere müzekkere yazarak vefat edenin tüm gizli malvarlığını çıkartır ve mirasçıların mal kaçırmasını önler.",
        "ilgiliTerimler": ["Veraset İlamı", "Miras İntikali", "Muris Muvazaası"]
    },
    {
        "terim": "Resmi Vasiyetname (Noter Vasiyetnamesi)",
        "slug": "resmi-vasiyetname-noter",
        "harf": "R",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Mirasbırakanın son arzularını noter huzurunda iki tanıkla birlikte resmi senet düzenleterek taşınmazlarını paylaştırdığı vasiyetname türüdür.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 532-537.",
        "pratikteNeAnlamaGelir": "En sağlam vasiyet türüdür; vefat durumunda noter vasiyetnameyi doğrudan sulh hukuk mahkemesine bildirir ve mahkemece mirasçılara okunur.",
        "kritikUyari": "Resmi vasiyetname yapılmış olsa dahi çocukların ve eşin 'saklı payı' ihlal edilemez; saklı payı çiğnenen mirasçılar tenkis davasıyla hakkını geri alır.",
        "ilgiliTerimler": ["Tenkis Davası", "Veraset İlamı"]
    },
    {
        "terim": "El Yazılı Vasiyetname Geçerlilik Şartları",
        "slug": "el-yazili-vasiyetname-gecerlilik",
        "harf": "E",
        "kategori": "Tapu & Mülkiyet",
        "kisaTanim": "Mirasbırakanın başından sonuna kadar kendi el yazısıyla yazdığı, gün-ay-yıl tarihini attığı ve bizzat imzaladığı vasiyetnamedir.",
        "hukukiKarsilik": "Türk Medeni Kanunu md. 538.",
        "pratikteNeAnlamaGelir": "Notere gitmeden evde kağıda yazılan vasiyetnamedir; geçerli olabilmesi için tek bir kelimesinin dahi bilgisayarla yazılmamış olması şarttır.",
        "kritikUyari": "Bilgisayarda yazılıp sadece altına imza atılan vasiyetnameler Yargıtay kararları uyarınca kesinlikle hükümsüzdür ve iptal edilir.",
        "ilgiliTerimler": ["Resmi Vasiyetname", "Tenkis Davası"]
    },
    {
        "terim": "Kadastro Sınır Düzeltmesi (41. Madde)",
        "slug": "kadastro-sinir-duzeltmesi-41-madde",
        "harf": "K",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "Kadastro sırasında harita, ölçü ve çizim hatalarından kaynaklanan sınır ve yüzölçümü yanlışlıklarının kadastro müdürlüğünce idari yoldan re'sen düzeltilmesidir.",
        "hukukiKarsilik": "3402 Sayılı Kadastro Kanunu md. 41.",
        "pratikteNeAnlamaGelir": "Tapuda 500 m² yazan arsanız kadastro aplikasyonunda çizim hatası yüzünden 450 m² çıkıyorsa mahkemesiz 41. madde ile harita kütüğü düzeltilir.",
        "kritikUyari": "Düzeltme kararı komşu parsel maliklerine tebliğ edilir; 30 gün içinde sulh hukuk mahkemesinde dava açılmazsa yeni sınırlar kesinleşir.",
        "ilgiliTerimler": ["Kadastro Paftası", "Aplikasyon Krokisi", "LİHKAB"]
    },
    {
        "terim": "Esaslı Tadilat Ruhsatı",
        "slug": "esasli-tadilat-ruhsati",
        "harf": "E",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "Bir yapının taşıyıcı elemanlarını (kolon, kiriş, perde), kat alanını veya dış cephesini değiştiren tadilatlar için belediyeden alınması zorunlu resmi ruhsattır.",
        "hukukiKarsilik": "3194 Sayılı İmar Kanunu md. 21 ve Planlı Alanlar İmar Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Dubleksin merdiven yerini değiştirmek, daireleri birleştirmek veya dükkan cephesini genişletmek için mimari proje çizdirilip ruhsat alınır.",
        "kritikUyari": "Ruhsatsız yapılan esaslı tadilatlar yapı tatil zaptı ile durdurulur ve İmar Kanunu md. 42 uyarınca ağır para cezası uygulanır.",
        "ilgiliTerimler": ["Basit Tadilat ve Tamirat İzni", "Yapı Ruhsatı", "Kaçak Yapı"]
    },
    {
        "terim": "Basit Tadilat ve Tamirat İzni",
        "slug": "basit-tadilat-ve-tamirat-izni",
        "harf": "B",
        "kategori": "İmar & Kadastro",
        "kisaTanim": "Binanın taşıyıcı sistemini, inşaat alanını ve cephe düzenini değiştirmeyen boya, badana, parke, seramik, mutfak dolabı ve tesisat yenileme işlemleridir.",
        "hukukiKarsilik": "Planlı Alanlar İmar Yönetmeliği md. 4/1-n ve md. 58.",
        "pratikteNeAnlamaGelir": "Daire içinde yapılacak parke, fayans, kapı ve banyo yenilemeleri için belediyeden mimari ruhsat almaya gerek yoktur.",
        "kritikUyari": "Basit tadilat adı altında iç bölme duvarlarını kırıp taşıyıcı kolonlara müdahale edenler hakkında derhal kaçak inşaat işlemi başlatılır.",
        "ilgiliTerimler": ["Esaslı Tadilat Ruhsatı", "Kolon", "Karkas"]
    }
]

print(f"data_mega_3.py hazır: {len(MEGA_TERIMLER_3)} terim.")
