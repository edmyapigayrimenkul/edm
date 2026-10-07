#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_data_32.py — Ultra 32 paketini üretir.
Kat Mülkiyeti, Tesis Yönetimi, Apartman/Site Hukuku (40 Terim)
"""

from pathlib import Path
import json

DATA_DIR = Path(__file__).resolve().parent / "data"

def write_package(filename, var_name, terms, title, topics):
    out = [f'"""\nEDM Gayrimenkul Sozluk - {title} ({len(terms)} Terim)\nKonular: {topics}\n"""\n']
    out.append(f'{var_name} = [\n')
    for t in terms:
        out.append('    {\n')
        out.append(f'        "slug": {json.dumps(t["slug"], ensure_ascii=False)},\n')
        out.append(f'        "terim": {json.dumps(t["terim"], ensure_ascii=False)},\n')
        out.append(f'        "harf": {json.dumps(t["harf"], ensure_ascii=False)},\n')
        out.append(f'        "kategori": {json.dumps(t["kategori"], ensure_ascii=False)},\n')
        out.append(f'        "kisaTanim": {json.dumps(t["kisaTanim"], ensure_ascii=False)},\n')
        out.append(f'        "hukukiKarsilik": {json.dumps(t["hukukiKarsilik"], ensure_ascii=False)},\n')
        out.append(f'        "pratikteNeAnlamaGelir": {json.dumps(t["pratikteNeAnlamaGelir"], ensure_ascii=False)},\n')
        out.append(f'        "kritikUyari": {json.dumps(t["kritikUyari"], ensure_ascii=False)},\n')
        out.append(f'        "guncellemeTarihi": {json.dumps(t["guncellemeTarihi"], ensure_ascii=False)},\n')
        out.append(f'        "kapsamNotu": {json.dumps(t["kapsamNotu"], ensure_ascii=False)},\n')
        out.append(f'        "kaynaklar": {json.dumps(t["kaynaklar"], ensure_ascii=False)}\n')
        out.append('    },\n')
    out.append(']\n')
    (DATA_DIR / filename).write_text("".join(out), encoding="utf-8")
    print(f"Yazıldı: {filename} ({len(terms)} terim)")

TERIMLER_32 = [
    {
        "slug": "kat-malikleri-kurulu",
        "terim": "Kat Malikleri Kurulu",
        "harf": "K",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kat mülkiyetine tabi bir ana gayrimenkulün en üst karar ve yönetim organı olan tüm bağımsız bölüm maliklerinin oluşturduğu heyettir.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 27-33 hükümleri gereğince ana taşınmaz kat malikleri kurulu tarafından yönetilir ve yönetim tarzı kanunların emredici hükümleri saklı kalmak şartıyla bu kurul tarafından kararlaştırılır.",
        "pratikteNeAnlamaGelir": "Apartman ve sitelerde ortak alanların nasıl kullanılacağı, aidat tutarları, yöneticinin seçimi, bakım-onarım bütçeleri ve kurallar bu kurul toplantılarında oy çokluğu veya oy birliği ile karara bağlanır.",
        "kritikUyari": "Toplantıya katılmayıp alınan kararlara süresinde sulh hukuk mahkemesinde iptal davası açmayan malikler, aleyhlerine olsa dahi alınan tüm meşru kararlara ve mali yükümlülüklere uymak zorundadır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 27 ila 33 kapsamındaki toplantı, karar alma ve dava açma sürelerine ilişkin yasal çerçeve.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "toplanti-ve-karar-yetersayisi",
        "terim": "Toplantı ve Karar Yetersayısı",
        "harf": "T",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kat malikleri kurulunun geçerli bir toplantı yapabilmesi ve karar alabilmesi için gereken asgari kişi ve arsa payı çoğunluğudur.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 30 gereğince kurul, kat maliklerinin sayı ve arsa payı bakımından yarısından fazlasıyla toplanır ve oy çokluğuyla karar verir; ilk toplantıda yeter sayı sağlanamazsa ikinci toplantı en geç 15 gün içinde yapılır ve katılanların oy çokluğuyla karar verilir.",
        "pratikteNeAnlamaGelir": "100 dairelik bir sitede ilk toplantıda en az 51 malik ve arsa payı çoğunluğu aranırken, ikinci toplantıda sayı aranmaz ancak kanunun özel nisap aradığı (yönetici seçimi, imar değişikliği vb.) durumlar hariç katılanların salt çoğunluğu yeterlidir.",
        "kritikUyari": "İkinci toplantıda dahi yönetici seçimi için maliklerin hem sayı hem de arsa payı çoğunluğu (mutlak çoğunluk) şarttır; katılanların çoğunluğu ile yönetici seçilemez.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 30 ve 34 kapsamındaki toplantı ve karar nisapları hükümleri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "isletme-projesi",
        "terim": "İşletme Projesi",
        "harf": "İ",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Ana gayrimenkulün bir yıllık tahmini gelir ve giderlerini, her bağımsız bölüme düşecek aidat ve avans miktarını gösteren resmi bütçe planıdır.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 37 uyarınca yönetici tarafından hazırlanan ve kat maliklerine taahhütlü mektupla veya imza karşılığı tebliğ edilen tahmini bütçe belgesidir.",
        "pratikteNeAnlamaGelir": "Sitede kapıcı, güvenlik, peyzaj, temizlik, asansör bakımı, ortak elektrik gibi yıllık masrafların hesaplanıp daire başına düşen aylık aidat tutarının belirlendiği tablodur.",
        "kritikUyari": "İşletme projesi usulüne uygun tebliğ edilip 7 gün içinde itiraz edilmezse kesinleşir ve İcra ve İflas Kanunu Madde 68/1 anlamında borç ikrarını içeren kesin belge niteliği kazanır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 37 kapsamındaki işletme projesi tanzimi, tebliği ve kesinleşmesi usulleri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "isletme-projesine-itiraz",
        "terim": "İşletme Projesine İtiraz",
        "harf": "İ",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kat maliklerinin tebliğ edilen işletme projesindeki kalemlere veya aidat dağılım oranlarına karşı 7 gün içinde yaptıkları resmi itirazdır.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 37/3 uyarınca işletme projesine tebliğden başlayarak 7 gün içinde itiraz edilirse durum kat malikleri kurulunca incelenir ve proje hakkında kurulca karar verilir.",
        "pratikteNeAnlamaGelir": "Kendisine gereğinden fazla aidat payı çıkarıldığını veya bütçede fahiş harcama kalemleri olduğunu düşünen malikin yönetime yazılı başvurarak kararın kurula taşınmasını sağlama hakkıdır.",
        "kritikUyari": "7 günlük hak düşürücü süre geçtikten sonra yapılan itirazlar geçersizdir; proje kesinleştiğinden icra takibine karşı borca itiraz tazminata yol açabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 37 fıkra 3 ve İcra İflas Kanunu hükümleri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "aidat-avansi",
        "terim": "Aidat Avansı (Gider Avansı)",
        "harf": "A",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Ana gayrimenkulün cari giderleri ve beklenmeyen acil masrafları karşılamak üzere maliklerin her ay peşin olarak ödemekle yükümlü oldukları paydır.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 20 uyarınca kat maliklerinden her biri aralarında başka türlü anlaşma olmadıkça kapıcı, kaloriferci, bahçıvan ve bekçi giderlerine eşit; ana gayrimenkulün diğer ortak gider ve avanslarına arsa payı oranında katılmakla yükümlüdür.",
        "pratikteNeAnlamaGelir": "Apartmanda günlük rutin hizmetlerin aksamaması için toplanan aylık düzenli aidattır; bağımsız bölüm boş olsa dahi ödenmesi zorunludur.",
        "kritikUyari": "Boş daire malikinin 'ben evde oturmuyorum, asansörü ve ortak alanları kullanmıyorum' diyerek aidat ödemekten kaçınması kanunen kesinlikle mümkün değildir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 20 ortak giderlere katılma yükümlülüğü ve istisnaları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "aidat-gecikme-tazminati",
        "terim": "Aidat Gecikme Tazminatı (%5)",
        "harf": "A",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Ortak gider veya avans borcunu gününde ödemeyen malik ya da kiracı aleyhine aylık yüzde beş oranında uygulanan kanuni gecikme tazminatıdır.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 20/c uyarınca gider veya avans payını ödemeyen kat maliki, ödemede geciktiği günler için aylık yüzde beş hesabıyla gecikme tazminatı ödemekle yükümlüdür.",
        "pratikteNeAnlamaGelir": "Ödenmeyen 10.000 TL aidat borcu için aylık 500 TL gecikme tazminatı hesaplanır; bu oran yasal faizden çok daha yüksek bir yaptırım olup icra takibinde asıl alacağa eklenir.",
        "kritikUyari": "Gecikme tazminatı kanuni bir haktır; kat malikleri kurulunun karar almasına gerek olmaksızın temerrüt tarihinden itibaren doğrudan talep edilebilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 20 fıkra 2 gecikme tazminatı oranı ve uygulama esasları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "yonetim-plani",
        "terim": "Yönetim Planı",
        "harf": "Y",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Ana gayrimenkulün yönetim tarzını, kullanma maksat ve şeklini, yönetici ve denetçilerin ücretlerini düzenleyen ve tüm kat maliklerini bağlayan sözleşme hükmündeki belgedir.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 28 gereğince yönetim planı bütün kat maliklerini bağlayan bir sözleşme hükmündedir; tapu kütüğünün beyanlar hanesine tescil edilir ve tüm malikler ile külli/cüz'i haleflerini bağlar.",
        "pratikteNeAnlamaGelir": "Apartmanın adeta anayasasıdır; sitede kedi-köpek beslenip beslenemeyeceği, otopark dağılımı, dairelerin ofis olarak kullanılıp kullanılamayacağı yönetim planı maddelerine göre belirlenir.",
        "kritikUyari": "Bir daire satın alırken tapu dairesindeki resmi yönetim planı incelenmezse, sonradan yasaklanan evcil hayvan besleme veya ticari faaliyet nedeniyle tahliye davalarıyla karşılaşılabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 28 yönetim planının hukuki bağlayıcılığı ve tescil şartı.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "yonetim-plani-degisikligi",
        "terim": "Yönetim Planı Değişikliği (4/5 Çoğunluk)",
        "harf": "Y",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Mevcut yönetim planı maddelerinin değiştirilmesi için kanunun aradığı tüm kat maliklerinin beşte dörünün yazılı onayını içeren özel karar nisabıdır.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 28/3 uyarınca yönetim planının değiştirilmesi için bütün kat maliklerinin beşte dördünün oyu şarttır; maliklerin mahkemeye başvurma hakları saklıdır.",
        "pratikteNeAnlamaGelir": "50 dairelik bir binada yönetim planını değiştirmek için toplantıya katılanların değil, tapudaki tüm maliklerin en az 40'ının kabul oyu vermesi gerekir.",
        "kritikUyari": "4/5 çoğunluk sağlanmadan yapılan değişiklikler batıldır ve tapu müdürlüğünce tescil edilmez; salt çoğunlukla yönetim planı maddesi değiştirilemez.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 28 fıkra 3 nitelikli çoğunluk şartı.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "apartman-site-yoneticisi",
        "terim": "Apartman ve Site Yöneticisi",
        "harf": "A",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kat malikleri kurulunca seçilen, ana gayrimenkulün yönetimini, bakımını, aidat tahsilatını ve temsilini yürüten vekil sıfatındaki kişi veya kuruldur.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 34-40 hükümleri uyarınca ana gayrimenkulün sekiz veya daha fazla bağımsız bölümü varsa yönetici atanması mecburidir; yönetici kat maliklerine karşı aynen bir vekil gibi sorumludur.",
        "pratikteNeAnlamaGelir": "Sitenin günlük idaresinden, personelin takibinden, fatura ödemelerinden, aidat toplamaktan ve gerektiğinde borçlulara dava açmaktan sorumlu yürütme organıdır.",
        "kritikUyari": "Yönetici vekâlet görevini kötüye kullanır, belgesiz harcama yapar veya hesap vermekten kaçınırsa Türk Ceza Kanunu kapsamında 'güveni kötüye kullanma' suçundan yargılanabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 34-40 yöneticinin atanması, hakları ve hukuki sorumlulukları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "yonetici-secimi-ve-nisap",
        "terim": "Yönetici Seçimi ve Nisap",
        "harf": "Y",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Yöneticinin atanabilmesi için gereken hem kat maliklerinin sayıca yarıdan fazlasının hem de arsa payı çoğunluğunun sağlandığı çifte çoğunluk şartıdır.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 34/4 uyarınca yönetici, kat maliklerinin hem sayı hem arsa payı bakımından çoğunluğu tarafından seçilir; malikler anlaşamazsa sulh hukuk mahkemesince resen yönetici atanır.",
        "pratikteNeAnlamaGelir": "İlk ya da ikinci toplantı fark etmeksizin, binadaki tüm daire sahiplerinin ve tapu hisselerinin mutlak çoğunluğunun oyu olmadan yönetici yasal olarak seçilmiş sayılamaz.",
        "kritikUyari": "Toplantıya 10 kişi katılıp 6 kişinin oyuyla yönetici seçilirse, bu karar kanunun amir hükmüne aykırı olup sulh hukuk mahkemesince doğrudan iptal edilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 34 fıkra 4 yönetici seçiminde aranan çifte çoğunluk ilkesi.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "denetci-ve-denetim-kurulu",
        "terim": "Denetçi ve Denetim Kurulu",
        "harf": "D",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Yöneticinin hesaplarını, harcama belgelerini ve yönetim faaliyetlerini kat malikleri adına periyodik olarak inceleyen denetim organıdır.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 41 uyarınca kat malikleri kurulu yöneticinin görevindeki başarı durumunu denetler ve haklı bir sebep çıkarsa onu her zaman değiştirebilir; denetçi en az üç ayda bir hesapları inceler ve rapor hazırlar.",
        "pratikteNeAnlamaGelir": "Sitenin paralarının doğru yere harcanıp harcanmadığını, faturaların gerçekliğini ve banka hareketlerini kontrol edip genel kurula resmi denetim raporu sunan organdır.",
        "kritikUyari": "Denetim raporu hazırlanmadan ve genel kurula okunmadan yapılan yönetici ibra oylamaları usulsüzdür ve yargı kararıyla hükümsüz kılınabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 41 denetim kurulu oluşturulması ve raporlama zorunlulukları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "yonetici-ibrasi",
        "terim": "Yönetici İbrası",
        "harf": "Y",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kat malikleri kurulunun, yöneticinin geçmiş dönem hesaplarını ve faaliyetlerini onaylayarak mali ve hukuki sorumluluktan kurtarması işlemidir.",
        "hukukiKarsilik": "Türk Borçlar Kanunu ve 634 sayılı KMK hükümleri uyarınca ibra, yöneticinin hesap verme yükümlülüğünü yerine getirdiğinin ve hakkında tazminat davası açılmayacağının kurulca kabulüdür.",
        "pratikteNeAnlamaGelir": "Yıl sonunda gelir-gider tablosu incelenip genel kurulda 'yönetim aklanmıştır' şeklinde el kaldırılarak yöneticinin mali açıdan serbest bırakılmasıdır.",
        "kritikUyari": "İbra edilmeyen yönetici hakkında kat malikleri kurulu adına yeni seçilen yönetim tarafından derhal tazminat ve alacak davası açılması zorunludur.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu ve Türk Borçlar Kanunu vekâlet sözleşmesi ibra prensipleri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "ortak-gider-borcu-kmk-20",
        "terim": "Ortak Gider Borcu (KMK 20)",
        "harf": "O",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Bağımsız bölüm maliklerinin ana gayrimenkulün korunması, bakımı ve ortak tesislerin işletilmesi için kanunen ödemek zorunda oldukları mali paydır.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 20 uyarınca kat malikleri ortak yer veya tesisler üzerindeki kullanma hakkından vazgeçmek suretiyle gider ve avans payını ödemekten kaçınamaz.",
        "pratikteNeAnlamaGelir": "Giriş katta oturan malik 'ben asansöre binmiyorum', çocuğu olmayan 'ben çocuk parkını kullanmıyorum' diyerek o gider kaleminden payına düşeni ödemezlik yapamaz.",
        "kritikUyari": "Yönetim planında aksi belirtilmedikçe kapıcı-güvenlik ücretleri bağımsız bölüm sayısına eşit bölünürken, diğer masraflar arsa payı oranında paylaştırılır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 20 ortak giderlerin yasal dağılım anahtarları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "kiracinin-aidat-sorumlulugu",
        "terim": "Kiracının Aidat Sorumluluğu (KMK 22)",
        "harf": "K",
        "kategori": "Kira ve Tahliye",
        "kisaTanim": "Kiracının, oturduğu bağımsız bölümün ortak giderlerinden malikle birlikte müteselsilen sorumlu olduğu ancak bu sorumluluğun kira borcu miktarıyla sınırlı tutulduğu yasal kuraldır.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 22 gereğince kat malikinin gider borcundan o bağımsız bölümde kira akdine dayananlar da müştereken ve müteselsilen sorumludur; ancak kiracının sorumluluğu ödemekle yükümlü olduğu kira miktarı ile sınırlıdır.",
        "pratikteNeAnlamaGelir": "Kiracı aidatı ödemezse yönetim kiracıya doğrudan icra takibi yapabilir; kiracı aidatı ödediği tutarı ev sahibine ödeyeceği kiradan yasal olarak mahsup eder.",
        "kritikUyari": "Kiracı, kira bedelini aşan aidat borçlarından veya demirbaş (çatı onarımı, asansör yenileme vb.) masraflarından kesinlikle sorumlu tutulamaz; demirbaş borcu mülk sahibine aittir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 22 kiracının teselsül sorumluluğu ve tavan sınırı.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "kanuni-ipotek-hakki-kmk-22",
        "terim": "Kanuni İpotek Hakkı (KMK 22)",
        "harf": "K",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Ödenmeyen ortak gider ve aidat borçlarının teminatı olarak diğer kat maliklerinin borçlu malikin bağımsız bölümü üzerine tescil ettirebildikleri öncelikli kanuni teminattır.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 22/2 uyarınca gider borcunu ödemeyen malikin bağımsız bölümü üzerine, yöneticinin veya maliklerden birinin yazılı istemiyle tescil edilen kanuni ipotektir.",
        "pratikteNeAnlamaGelir": "Bir daire sahibi yıllarca aidat ödemeyip kaçarsa, site yönetimi mahkeme kararıyla o dairenin tapu kaydına doğrudan haciz ve ipotek koydurup daireyi icradan sattırabilir.",
        "kritikUyari": "Kanuni ipotek tescil edildiğinde satış parası dağıtılırken diğer alacaklılara göre rüçhanlı (öncelikli) sayılır, böylece site alacağı garanti altına alınır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 22 fıkra 2 kanuni ipotek hakkı ve tescili şartları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "bagimsiz-bolum-eklentisi",
        "terim": "Bağımsız Bölüm Eklentisi",
        "harf": "B",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Bir bağımsız bölümün dışında bulunan ve doğrudan doğruya o bölüme tahsis edilmiş olan kömürlük, su deposu, garaj veya depo gibi müstakil tapulanamayan yerlerdir.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 6 uyarınca bir bağımsız bölümün dışında olup doğrudan doğruya o bölüme tahsis edilmiş yerler eklenti sayılır ve bağımsız bölümün bütünleyici parçasıdır; tek başına devredilemez.",
        "pratikteNeAnlamaGelir": "Bodrumdaki 3 numaralı kömürlük veya otoparktaki 12 numaralı park yeri tapuda dairenizin eklentisi olarak kayıtlıysa, daire satıldığında eklenti de otomatik olarak yeni sahibe geçer.",
        "kritikUyari": "Eklentiler bağımsız bölümden ayrı olarak başkasına satılamaz, rehin edilemez veya kiralanamaz.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 6 eklenti tanımı ve mülkiyet hukuku bağı.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "ortak-yerlerin-tahsisi",
        "terim": "Ortak Yerlerin Tahsisi",
        "harf": "O",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Ana taşınmazın ortak alanlarından bir kısmının (bahçe, otopark, çatı) yönetim planı veya kurul kararıyla belirli dairelerin münhasır kullanımına bırakılmasıdır.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 4 ve Madde 16 hükümleri gereğince ortak yerler tüm maliklerin müşterek mülkiyetindedir; tahsis için yönetim planında açık hüküm veya tüm maliklerin oy birliği aranır.",
        "pratikteNeAnlamaGelir": "Zemin kat dairesine ön bahçenin münhasır kullanım hakkı verilmesi veya kapalı otoparktaki belirli alanların plaka numaralarına göre tahsis edilmesidir.",
        "kritikUyari": "Yönetim planında yazılı olmayan bir ortak alan, basit genel kurul kararıyla bir dairenin özel kullanımına verilemez; diğer malikler müdahalenin men'i davası açabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 4 ve 16 ortak yerler ve tahsis şartları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "meskenin-isyerine-donusmesi",
        "terim": "Meskenin İşyerine Dönüşmesi (KMK 24)",
        "harf": "M",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Tapu kütüğünde konut (mesken) olarak tescilli bağımsız bir bölümün ticarethane, klinik, büro veya dükkan olarak kullanılabilmesi için gereken izin prosedürüdür.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 24/2 uyarınca ana gayrimenkulün kütükte mesken olarak gösterilen bağımsız bir bölümünde sinema, tiyatro, kahvehane, gazino gibi eğlence yerleri ve dükkan açılması kat maliklerinin oy birliği ile verecekleri karara bağlıdır.",
        "pratikteNeAnlamaGelir": "Apartman dairesinde restoran, bar, kafe, diş kliniği veya güzellik merkezi açabilmek için binadaki tüm mülk sahiplerinin istisnasız tamamından noter onaylı muvafakatname alınması gerekir.",
        "kritikUyari": "Avukatlık büroları ve serbest muhasebeci mali müşavirlik ofisleri için özel kanunları gereği oy birliği şartı aranmazken, diğer ticari işletmeler tek bir malikin itirazıyla mühürlenip kapatılır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 24 yasak işler ve oy birliği şartı.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "turizm-amacli-kiralama-izin-sarti",
        "terim": "Turizm Amaçlı Kiralama İzin Şartı (7464 SK)",
        "harf": "T",
        "kategori": "Kira ve Tahliye",
        "kisaTanim": "Konutların 100 gün veya daha kısa süreyle (Airbnb vb.) kiralanabilmesi için binadaki tüm kat maliklerinin oy birliği ile izin vermesini zorunlu kılan yasal şarttır.",
        "hukukiKarsilik": "7464 sayılı Konutların Turizm Amaçlı Kiralanması ve Bazı Kanunlarda Değişiklik Yapılmasına Dair Kanun Madde 3 uyarınca turizm amaçlı kiralama izin belgesi alınabilmesi için binadaki tüm bağımsız bölüm maliklerinin oy birliği şarttır.",
        "pratikteNeAnlamaGelir": "Apartmandaki tek bir komşu dahi onay vermezse Kültür ve Turizm Bakanlığı'ndan izin belgesi alınamaz ve günlük/haftalık kiralama yapılamaz.",
        "kritikUyari": "İzinsiz günübirlik kiralama yapan mülk sahiplerine her bir kiralama için yüz binlerce liradan başlayıp bir milyon lirayı aşan fahiş idari para cezaları uygulanır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "7464 sayılı Kanun Madde 3 ve ilgili yönetmelik hükümleri.",
        "kaynaklar": ["https://www.resmigazete.gov.tr/eskiler/2023/11/20231102-1.htm"]
    },
    {
        "slug": "olaganustu-kat-malikleri-toplantisi",
        "terim": "Olağanüstü Kat Malikleri Toplantısı",
        "harf": "O",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Önemli bir sebebin çıkması halinde yönetici, denetçi veya maliklerin üçte birinin istemiyle her zaman yapılabilen acil genel kuruldur.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 29/2 uyarınca önemli bir sebebin çıkması halinde, yöneticinin veya denetçinin veya kat maliklerinden üçte birinin istemi üzerine ve toplantı için istenilen tarihten en az 15 gün önce çağrı yapılarak olağanüstü toplantı toplanabilir.",
        "pratikteNeAnlamaGelir": "Yöneticinin istifası, çatının çökmesi, acil güçlendirme kararı gibi yıllık toplantı beklenemeyecek kriz anlarında çağrılan toplantıdır.",
        "kritikUyari": "Toplantı çağrısının 15 gün önce taahhütlü mektupla veya imza karşılığı yapılmaması, alınan tüm kararların usulden iptal edilmesine yol açar.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 29 fıkra 2 olağanüstü toplantı prosedürleri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "karar-defteri-ve-noter-kapanis-tasdiki",
        "terim": "Karar Defteri ve Noter Kapanış Tasdiki",
        "harf": "K",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kat malikleri kurulunca alınan kararların yazıldığı noter tasdikli resmi defter ve bu defterin her takvim yılı sonunda notere kapattırılması işlemidir.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 32 ve Madde 36 uyarınca yönetici, kat malikleri kurulunun karar ve protokollerini deftere geçirmek ve her takvim yılının bitmesinden başlayarak bir ay içinde notere kapattırmakla yükümlüdür.",
        "pratikteNeAnlamaGelir": "Apartman kararlarının geçerliliği ve mahkemede kesin delil sayılabilmesi için bu deftere yazılıp imzalanması ve her ocak ayında notere onaylatılması zorunludur.",
        "kritikUyari": "Kapanış tasdiki yaptırmayan yöneticiye kanun gereği idari para cezası verilir ve defter mahkemelerde lehe delil olma niteliğini kaybeder.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 32 ve 36 defter tutma ve tasdik zorunlulukları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "isletme-defteri",
        "terim": "İşletme Defteri",
        "harf": "İ",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Yöneticinin apartman veya sitenin tüm gelir ve giderlerini, fatura ve makbuz kayıtlarını günü gününe işlediği resmi muhasebe defteridir.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 36 gereğince yönetici yapılan bütün masrafların belgelerini saklamaya ve gelir-giderleri işletme defterine sıra numarasıyla kaydetmeye mecburdur.",
        "pratikteNeAnlamaGelir": "Toplanan her bir kuruş aidatın ve harcanan her bir masrafın faturasıyla birlikte kayıt altında tutulduğu apartman muhasebesidir.",
        "kritikUyari": "Faturasız ve makbuzsuz harcama yapan yöneticiler, bu tutarları kendi ceplerinden site kasasına iade etmekle mükelleftir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 36 belgelerin saklanması ve defter kayıt usulü.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "konut-kapicisi-sozlesmesi",
        "terim": "Konut Kapıcısı Sözleşmesi",
        "harf": "K",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Ana gayrimenkulün ortak alanlarının temizliği, çöplerin toplanması, kaloriferin yakılması gibi işleri yürüten kapıcı ile yöneticinin akdettiği iş sözleşmesidir.",
        "hukukiKarsilik": "4857 sayılı İş Kanunu ve Konut Kapıcıları Yönetmeliği hükümleri uyarınca işveren vekili sıfatıyla yönetici tarafından yazılı olarak yapılan özel iş sözleşmesidir.",
        "pratikteNeAnlamaGelir": "Kapıcının çalışma saatleri, haftalık tatil günü, kapıcı dairesinin kullanım şartları ve maaşının belirlendiği resmi istihdam bağıdır.",
        "kritikUyari": "Kapıcıya tahsis edilen konuttan kira alınamaz; kapıcının haksız işten çıkarılması durumunda kıdem ve ihbar tazminatı arsa payı oranında tüm daire sahiplerinden tahsil edilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "4857 sayılı İş Kanunu ve Konut Kapıcıları Yönetmeliği hükümleri.",
        "kaynaklar": ["https://www.resmigazete.gov.tr/eskiler/2004/03/20040303.htm"]
    },
    {
        "slug": "kidem-tazminati-fonu-site-yonetimi",
        "terim": "Kıdem Tazminatı Fonu (Site Yönetimi)",
        "harf": "K",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Sitede çalışan personelin emeklilik veya iş akdinin feshi halinde ödenecek kıdem tazminatını karşılamak üzere her ay aidatlarla biriktirilen fon hesabıdır.",
        "hukukiKarsilik": "Kat malikleri kurulu kararıyla oluşturulan, vadeli banka hesabında bloke edilen ve sadece personel tazminatları için harcanabilen özel karşılık fonudur.",
        "pratikteNeAnlamaGelir": "15 yıldır çalışan kapıcı emekli olduğunda birdenbire ortaya çıkan yüz binlerce liralık toplu tazminat yükünün, o anki ev sahiplerine aniden fatura edilmesini önleyen ihtiyat parasıdır.",
        "kritikUyari": "Dairesini satan malik geriye dönük fona ödediği kıdem tazminatı paylarını siteden geri isteyemez; bu fon bağımsız bölümün mülkiyetine bağlı bir ortak fondur.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "4857 sayılı İş Kanunu ve Kat Mülkiyeti Kanunu genel bütçe fon oluşturma ilkeleri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "profesyonel-tesis-yonetimi-sirketi",
        "terim": "Profesyonel Tesis Yönetimi Şirketi",
        "harf": "P",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kat malikleri kurulu kararıyla sitenin idaresi, teknik bakımı, temizliği ve güvenliği hizmetlerini yürütmek üzere dışarıdan vekâletle atanan tüzel kişiliktir.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 34 uyarınca yönetici kat malikleri arasından olabileceği gibi dışarıdan bir gerçek veya tüzel kişi de seçilebilir.",
        "pratikteNeAnlamaGelir": "Büyük sitelerde komşuların birbiriyle aidat veya icra yüzünden tartışmaması ve uzman personelle yönetilmesi amacıyla kurumsal bir yönetim firmasıyla anlaşılmasıdır.",
        "kritikUyari": "Şirketle yapılan sözleşmede hizmet seviyesi (SLA), hesap verme periyodu ve maliklerin denetim yetkisi açıkça düzenlenmelidir; aksi halde denetimsiz bütçe harcamaları yaşanabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 34 tüzel kişi yöneticilik hükümleri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "isi-payolcer-fatura-paylasimi",
        "terim": "Isı Payölçer Fatura Paylaşımı",
        "harf": "I",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Merkezi ısıtma sistemli binalarda yakıt giderlerinin yüzde 30'unun ortak asgari ısı payı, yüzde 70'inin ise bağımsız bölümün ölçülen tüketimine göre paylaştırılmasıdır.",
        "hukukiKarsilik": "5627 sayılı Enerji Verimliliği Kanunu ve Merkezi Isıtma ve Sıhhi Sıcak Su Sistemlerinde Isınma ve Sıhhi Sıcak Su Giderlerinin Paylaştırılmasına İlişkin Yönetmelik hükümleridir.",
        "pratikteNeAnlamaGelir": "Merkezi sistemli bir evde petekleri tamamen kapatsanız dahi binanın dış cephe ve ortak kayıpları için faturanın asgari %30'luk kısmını arsa payınız oranında ödemek zorundasınız.",
        "kritikUyari": "Yönetmelik gereği oda sıcaklığının 15 derecenin altına düşürülmesi (vananın tamamen kapatılması) yasaktır; buna uymayan maliklere emsal ceza tahakkuk ettirilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "5627 sayılı Enerji Verimliliği Kanunu ve Isı Paylaşım Yönetmeliği Madde 5-8.",
        "kaynaklar": ["https://www.resmigazete.gov.tr/eskiler/2008/04/20080414-8.htm"]
    },
    {
        "slug": "asansor-yillik-periyodik-kontrolu",
        "terim": "Asansör Yıllık Periyodik Kontrolü (Yeşil/Kırmızı Etiket)",
        "harf": "A",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Binalardaki asansörlerin can ve mal güvenliği açısından akredite A tipi muayene kuruluşlarınca yılda en az bir kez denetlenerek etiketlenmesi işlemidir.",
        "hukukiKarsilik": "Sanayi ve Teknoloji Bakanlığı Asansör Periyodik Kontrol Yönetmeliği uyarınca bina yöneticisi asansörlerin yıllık kontrolünü yaptırmakla yasal olarak sorumludur.",
        "pratikteNeAnlamaGelir": "Yeşil etiket kusursuz, mavi hafif kusurlu, sarı kabul edilebilir, kırmızı etiket ise can güvenliği açısından tehlikeli ve 60 gün içinde kapatılması gereken asansörü ifade eder.",
        "kritikUyari": "Kırmızı etiketli asansörü kapatmayıp kullanıma açık tutan bina yöneticisi, olası bir asansör kazasında taksirle yaralama veya ölüme sebebiyet vermekten şahsen cezai sorumluluk taşır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Asansör Periyodik Kontrol Yönetmeliği ve 634 sayılı KMK yönetici sorumlulukları.",
        "kaynaklar": ["https://www.resmigazete.gov.tr/eskiler/2019/05/20190504-1.htm"]
    },
    {
        "slug": "cati-ve-teras-onarim-giderleri",
        "terim": "Çatı ve Teras Onarım Giderleri",
        "harf": "Ç",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Binanın en üstünü örten çatı ve teras alanlarının ortak yer sayılması sebebiyle, su yalıtımı ve tadilat masraflarının tüm maliklerce arsa payı oranında karşılanmasıdır.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 4 uyarınca çatılar, bacalar ve genel dam terasları ortak yerlerdendir; Madde 20 uyarınca tüm malikler bu yerlerin bakım ve onarımına arsa payı oranında katılmak zorundadır.",
        "pratikteNeAnlamaGelir": "En alt kattaki dükkan veya giriş kat maliki 'çatı benden çok uzakta, su benim evime akmıyor' diyerek çatı izolasyon ve kiremit onarım masrafını ödemekten kaçınamaz.",
        "kritikUyari": "Çatıdan akan suyun en üst kat dairesine verdiği maddi zararları, onarımı geciktiren veya reddeden tüm kat malikleri ortaklaşa tazmin etmekle yükümlüdür.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 4 ve 20 çatı ortak alanı ve gider paylaşımı.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "evcil-hayvan-besleme-yasagi",
        "terim": "Evcil Hayvan Besleme Yasağı (Yönetim Planı)",
        "harf": "E",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Yönetim planında bağımsız bölümlerde kedi, köpek gibi evcil hayvan beslenemeyeceğine dair açık hüküm bulunması halinde uygulanan bağlayıcı kısıtlamadır.",
        "hukukiKarsilik": "Yargıtay yerleşik içtihatlarına göre, 634 sayılı KMK Madde 28 uyarınca yönetim planında evcil hayvan beslenemeyeceğine dair açık yasak varsa, hayvan çevresine zarar vermese dahi tahliyesine karar verilir.",
        "pratikteNeAnlamaGelir": "Eğer binanın tapudaki yönetim planında 'köpek beslenemez' maddesi varsa, komşulardan tek bir kişi bile dava açsa mahkeme köpeğin siteden uzaklaştırılmasına hükmeder.",
        "kritikUyari": "Ev satın almadan veya kiralamadan önce tapudaki yönetim planında evcil hayvan maddesi mutlaka incelenmelidir; yönetim planında yasak yoksa sadece rahatsızlık veren hayvanlar dava konusu olabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Yargıtay 5. ve 20. Hukuk Dairesi kararları ve 634 sayılı Kanun Madde 28.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "guvenlik-kamerasi-kvkk-uyumu",
        "terim": "Güvenlik Kamerası KVKK Uyumu (Site Yönetimi)",
        "harf": "G",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Apartman ve sitelerdeki ortak alan güvenlik kameralarının komşuların özel hayatını ihlal etmeyecek şekilde yerleştirilmesi ve aydınlatma metniyle duyurulması zorunluluğudur.",
        "hukukiKarsilik": "6698 sayılı Kişisel Verilerin Korunması Kanunu ve Kişisel Verileri Koruma Kurulu ilke kararları gereğince görüntü kaydı veri işleme faaliyeti olup açık rıza veya meşru menfaat şartına tabidir.",
        "pratikteNeAnlamaGelir": "Kameranın sadece bina girişi ve otoparkı görmesi gerekir; bir komşunun evinin kapı içini, balkonunu veya bahçesini gözetleyen açıyla takılması suç teşkil eder.",
        "kritikUyari": "Bina girişlerine kamera uyarı levhası asmayan ve daire kapısını gözetleyen kamera takan yöneticilere veya maliklere KVKK idari para cezası ve hapis davası açılabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "6698 sayılı Kişisel Verilerin Korunması Kanunu ve KVKK Kurulu ilke kararları.",
        "kaynaklar": ["https://www.kvkk.gov.tr"]
    },
    {
        "slug": "hakimin-mudahalesi-kmk-33",
        "terim": "Hâkimin Müdahalesi (KMK 33)",
        "harf": "H",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kat maliklerinden birinin kanuna veya yönetim planına aykırı davranması halinde sulh hukuk mahkemesinden bu aykırılığın giderilmesini isteme davasıdır.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 33 uyarınca kat maliklerinden birinin borç veya yükümlerini yerine getirmemesi yüzünden zarar gören malik, sulh mahkemesine başvurarak hâkimin müdahalesini isteyebilir.",
        "pratikteNeAnlamaGelir": "Gürültü yapan, ortak alanı işgal eden, tadilat yapıp ana taşınmaza zarar veren veya aidat ödemeyen komşuya karşı mahkemenin resmi ihtarda bulunması ve ceza kesmesidir.",
        "kritikUyari": "Hâkimin verdiği karara süresi içinde uymayan kişi aleyhine mahkemece doğrudan adli idari para cezası hükmolunur ve icra marifetiyle işlem yapılır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 33 hâkimin müdahalesi ve yaptırımları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "kat-mulkiyetinde-ecrimisil",
        "terim": "Kat Mülkiyetinde Ecrimisil",
        "harf": "K",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Tüm kat maliklerine ait olan ortak sığınak, çatı, bahçe veya otopark alanını tek başına haksız olarak kullanan malikten talep edilen geriye dönük işgal tazminatıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu Madde 995 ve 634 sayılı Kanun hükümleri uyarınca ortak yerleri diğer paydaşların yararlanmasını engelleyecek şekilde kullanan malik ecrimisil ödemekle yükümlüdür.",
        "pratikteNeAnlamaGelir": "Zemin kat dairesinin ortak bahçeyi çitle çevirip kafe masası atması veya bir malikin ortak sığınağı kendi deposu yapması halinde site yönetiminin 5 yıllık geriye dönük kira bedeli istemesidir.",
        "kritikUyari": "Ortak alandaki haksız işgal için maliklerden biri dahi tek başına ecrimisil davası açabilir ve kendi arsa payına düşen tazminatı tahsil edebilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Türk Medeni Kanunu Madde 995 ve Yargıtay Hukuk Genel Kurulu ecrimisil içtihatları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4721&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "toplu-yapi-temsilciler-kurulu",
        "terim": "Toplu Yapı Temsilciler Kurulu",
        "harf": "T",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Birden çok blok veya parselden oluşan büyük sitelerde, her bloğun seçtiği yöneticilerin oluşturduğu en üst karar organıdır.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 69-74 hükümleri uyarınca toplu yapılarda yönetim, blok kat malikleri kurulları ve toplu yapı temsilciler kurulu aracılığıyla yürütülür.",
        "pratikteNeAnlamaGelir": "Binlerce konutluk uydu kentlerde tüm maliklerin tek salonda toplanması imkansız olduğundan, her blok bir temsilci seçer ve sitenin genel bütçesini bu temsilciler meclisi onaylar.",
        "kritikUyari": "Toplu yapıya geçiş için vaziyet planı ve yönetim planının tapuda tescilli olması şarttır; tescil yoksa toplu yapı yönetimi yok hükmündedir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 69-74 toplu yapı yönetimi ve temsilciler kurulu kuralları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "kat-mulkiyetinin-devri-mecburiyeti",
        "terim": "Kat Mülkiyetinin Devri Mecburiyeti (KMK 25)",
        "harf": "K",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kendi kusurlu davranışlarıyla apartman hayatını diğer komşular için çekilmez hale getiren malikin dairesinin diğer maliklerce zorla satın alınması davasıdır.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 25 uyarınca bir malik borç ve yükümlerini çiğnemek suretiyle diğerlerinin haklarını çekilmez derecede ihlal ederse, diğer malikler onun mülkiyet hakkının devrini dava edebilir.",
        "pratikteNeAnlamaGelir": "Sürekli aidat ödemeyip hakkında iki yıl içinde üç kez icra takibi yapılan veya komşularına fiziki saldırı/tehditte bulunan mülk sahibinin evinin elinden alınması sürecidir.",
        "kritikUyari": "Dava açma hakkı diğer kat maliklerinin sayı ve arsa payı çoğunluğuyla karar almasına bağlıdır ve öğrenmeden itibaren altı ay içinde kullanılmalıdır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 25 mülkiyetin zorunlu devri şartları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "bagimsiz-bolum-bolunmezligi",
        "terim": "Bağımsız Bölüm Bölünmezliği",
        "harf": "B",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kat mülkiyetine tabi bir konut veya işyerinin belediye ve tapu onayı olmadan alçıpan veya duvarla bölünerek birden çok bağımsız birim haline getirilemeyeceği ilkesidir.",
        "hukukiKarsilik": "3194 sayılı İmar Kanunu ve 634 sayılı KMK hükümleri uyarınca ana gayrimenkulün mimari projesine aykırı olarak bağımsız bölüm bölünemez veya birleştirilemez.",
        "pratikteNeAnlamaGelir": "Geniş bir 4+1 daireyi aradan duvar örüp iki ayrı 1+1 stüdyo daireye çevirerek iki farklı kiracıya kiralamak mimari projeye ve ruhsata aykırıdır.",
        "kritikUyari": "İzinsiz bölünen daireler belediyece kaçak yapı muamelesi görerek mühürlenir ve komşuların açacağı davayla eski haline getirilmesine karar verilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "3194 sayılı İmar Kanunu ve 634 sayılı Kat Mülkiyeti Kanunu mimari proje bütünlüğü.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=3194&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "ortak-alanda-tadilat-ve-insaat-yasagi",
        "terim": "Ortak Alanda Tadilat ve İnşaat Yasağı (KMK 19)",
        "harf": "O",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kat maliklerinin tüm maliklerin beşte dördünün yazılı rızası olmadan ortak yerlerde inşaat, onarım ve tesis yapmasını yasaklayan kanun hükmüdür.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 19/2 uyarınca kat maliklerinden biri bütün kat maliklerinin beşte dördünün yazılı rızası olmadıkça ana gayrimenkulün ortak yerlerinde onarım, tesis ve değişiklik yapamaz.",
        "pratikteNeAnlamaGelir": "Balkonu odaya katmak, dış cepheye klima motorunu kafasına göre asmak, sığınağa oda yapmak veya bahçeye kulübe dikmek diğer maliklerin beşte dördünün yazılı onayı olmadan yapılamaz.",
        "kritikUyari": "Rızasız yapılan her türlü değişiklik için herhangi bir malik dava açarak yapının yıktırılmasını ve masrafların haksız yapan malike yükletilmesini sağlayabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 19 fıkra 2 ortak yerlerde değişiklik sınırlamaları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "ana-tasinmazin-bakim-ve-onarim-borcu",
        "terim": "Ana Taşınmazın Bakım ve Onarım Borcu",
        "harf": "A",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Her kat malikinin ana gayrimenkulün mimari durumunu, taşıyıcı sistemini ve güzelliğini titizlikle korumakla yükümlü olduğu temel kanuni görevdir.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 19/1 gereğince kat malikleri ana gayrimenkulün bakımına ve mimari durumu ile güzelliğini ve sağlamlığını titizlikle korumaya mecburdurlar.",
        "pratikteNeAnlamaGelir": "Daire içinde tadilat yaparken kolon veya kiriş kesmek, taşıyıcı tuğla duvarı yıkmak veya binanın statik dengesini bozacak ağır yükler yüklemek kesinlikle yasaktır.",
        "kritikUyari": "Taşıyıcı sisteme zarar veren malik, binanın acilen tahliye edilmesine sebep olabileceği gibi Türk Ceza Kanunu Madde 170 kapsamında genel güvenliği kasten tehlikeye sokmaktan yargılanır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 19 fıkra 1 ve TCK Madde 170.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "bina-ortak-sigortasi",
        "terim": "Bina Ortak Sigortası",
        "harf": "B",
        "kategori": "Gayrimenkul Değerleme ve Finans",
        "kisaTanim": "Kat malikleri kurulunca kararlaştırılan, ana gayrimenkulü yangın, su basması, deprem ve sorumluluk risklerine karşı güvenceye alan ortak poliçedir.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 21 uyarınca ana gayrimenkulün sigorta ettirilmesi kat malikleri kurulunca kararlaştırılır; sigorta primleri arsa payı oranında ödenir.",
        "pratikteNeAnlamaGelir": "Kazan patlaması, çatı uçması, asansör halatı kopması veya üçüncü şahıslara verilecek zararlara karşı binanın ortak havuzdan sigortalanmasıdır.",
        "kritikUyari": "Ortak sigorta DASK yerine geçmez; bağımsız bölümlerin zorunlu deprem sigortasının maliklerce ferdi olarak yaptırılması yasal zorunluluktur.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 21 sigorta primlerinin paylaştırılması hükümleri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "ortak-kullanim-alanlarinda-engelli-erisimi",
        "terim": "Ortak Kullanım Alanlarında Engelli Erişimi (KMK 42)",
        "harf": "O",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Engelli malik veya sakinlerin binalara rahat erişimi için rampa, asansör veya engelli platformu yapılmasını kolaylaştıran özel kanuni düzenlemedir.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 42 uyarınca engellilerin yaşamı için zorunluluk göstermesi halinde malikin talebi üzerine kurul üç ay içinde toplanır; toplantı yapılmazsa engelli malik masrafını üstlenerek projeyi yaptırabilir.",
        "pratikteNeAnlamaGelir": "Apartman girişine tekerlekli sandalye rampası veya merdiven lifti yapılması talebi komşuların keyfi oylarıyla engellenemez.",
        "kritikUyari": "Kurul geçerli bir sebep olmaksızın engelli rampasını reddederse, engelli birey belediyeden ve mahkemeden izin alarak inşaatı yapma hakkına sahiptir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 42 fıkra 2 engellilere yönelik tadilat hakları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "merkezi-sicak-su-paylasimi",
        "terim": "Merkezi Sıcak Su Paylaşımı",
        "harf": "M",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Merkezi boyler ve ısı istasyonu sistemine sahip binalarda kullanılan kullanım sıcak suyunun sayaç endekslerine göre dairelere fatura edilmesidir.",
        "hukukiKarsilik": "Enerji Verimliliği Kanunu ve ilgili yönetmelik kapsamında merkezi sistemde üretilen sıcak suyun debimetre ve ısı sayaçları vasıtasıyla ölçülüp tüketime göre faturalandırılması zorunludur.",
        "pratikteNeAnlamaGelir": "Musluktan akan sıcak suyun kaç metreküp kullanıldığı sayaçla okunur ve yakıt bedelinin o kadarlık kısmı ilgili daireye yazılır.",
        "kritikUyari": "Sıcak su sayacı arızalı olan veya okuma yapılmasına izin vermeyen dairelere yönetmelik uyarınca binadaki en yüksek tüketim üzerinden fatura çıkarılır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "5627 sayılı Kanun ve Merkezi Sistem Sıhhi Sıcak Su Yönetmeliği ölçüm standartları.",
        "kaynaklar": ["https://www.resmigazete.gov.tr/eskiler/2008/04/20080414-8.htm"]
    },
    {
        "slug": "ortak-alan-isgal-davasi",
        "terim": "Ortak Alan İşgal Davası (Müdahalenin Men'i)",
        "harf": "O",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Ortak sığınak, yangın merdiveni, koridor veya bahçeyi şahsi kullanımı altına alan kişiye karşı açılan haksız müdahalenin sonlandırılması davasıdır.",
        "hukukiKarsilik": "Türk Medeni Kanunu Madde 683 ve 634 sayılı Kanun hükümleri uyarınca her kat maliki ortak alanlara yapılan haksız tecavüzün önlenmesini sulh hukuk mahkemesinden talep edebilir.",
        "pratikteNeAnlamaGelir": "Katta kendi kapısının önüne dolap yaptıran, yangın kaçış holünü kapatan veya ortak otoparka duba çakıp başka araç sokmayan komşuya karşı açılan davadır.",
        "kritikUyari": "Bu davayı açmak için yönetim kurulunun veya malikler kurulunun kararına gerek yoktur; tek bir bağımsız bölüm maliki tek başına bu davayı açabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu ve TMK Madde 683 müdahalenin men'i hükümleri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "apartman-vekaletname-siniri",
        "terim": "Apartman Vekaletname Sınırı (KMK 31)",
        "harf": "A",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Bir kişinin kat malikleri kurulu toplantısında vekâleten temsil edebileceği oy sayısına kanunla getirilen azami sınırlamadır.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 31/son uyarınca bir şahıs oy sayısının yüzde beşinden fazlasını kullanmak üzere vekil tayin edilemez; ancak kırk ve daha az sayıdaki taşınmazlarda bir kişi en fazla iki kişiye vekâlet edebilir.",
        "pratikteNeAnlamaGelir": "Bir yöneticinin veya emlakçının apartmandaki tüm komşulardan vekalet toplayıp tek başına genel kurula hakim olması ve istediği kararı geçirmesi kanunen engellenmiştir.",
        "kritikUyari": "Vekalet sınırını aşan oylarla alınan kararlar yok hükmündedir veya mahkemece usulden iptal edilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 31 oy kullanma ve vekalet sınırları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "bina-enerji-yoneticisi",
        "terim": "Bina Enerji Yöneticisi",
        "harf": "B",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Belli bir inşaat alanını aşan ticari veya konut binalarında enerji verimliliği önlemlerini planlamak ve denetlemek üzere görevlendirilen sertifikalı uzmandır.",
        "hukukiKarsilik": "5627 sayılı Enerji Verimliliği Kanunu uyarınca toplam inşaat alanı en az 20.000 metrekare olan ticari binalarda veya 500 TEP enerji tüketen tesislerde enerji yöneticisi görevlendirilmesi zorunludur.",
        "pratikteNeAnlamaGelir": "Büyük sitelerde ve plazalarda aydınlatma, ısıtma ve soğutma enerjisinin israfını önleyen, tasarruf projeleri üreten teknik sorumludur.",
        "kritikUyari": "Zorunlu olduğu halde enerji yöneticisi istihdam etmeyen veya hizmet almayan bina yönetimlerine Çevre ve İklim Değişikliği Bakanlığınca idari para cezası kesilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "5627 sayılı Enerji Verimliliği Kanunu Madde 7 ve ilgili yönetmelik hükümleri.",
        "kaynaklar": ["https://www.resmigazete.gov.tr/eskiler/2007/05/20070502-2.htm"]
    },
    {
        "slug": "bina-yangin-guvenlik-sorumlusu",
        "terim": "Bina Yangın Güvenlik Sorumlusu",
        "harf": "B",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Binaların Yangından Korunması Hakkında Yönetmelik gereğince yangın söndürme tüplerinin, yangın kapılarının ve algılama sistemlerinin hazır bulunmasından sorumlu kişidir.",
        "hukukiKarsilik": "Binaların Yangından Korunması Hakkında Yönetmelik Madde 124 uyarınca bina yöneticisi veya işletme amiri yangın güvenliği önlemlerinin eksiksiz yerine getirilmesinden birinci derecede sorumludur.",
        "pratikteNeAnlamaGelir": "Yangın merdivenlerinin kilitlenmemesi, yangın tüplerinin 6 ayda bir kontrol ettirilmesi ve tahliye tatbikatlarının yapılmasını denetleyen görevlidir.",
        "kritikUyari": "Yangın merdiveninin kilitli tutulması nedeniyle facia yaşanması halinde yönetici 'bilinçli taksir' veya 'olası kast' ile ölüme sebebiyet vermekten cezaevine girebilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Binaların Yangından Korunması Hakkında Yönetmelik Madde 124 ve 634 sayılı KMK.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=200712937&MevzuatTur=3&MevzuatTertip=5"]
    },
    {
        "slug": "apartman-banka-hesabi-zorunlulugu",
        "terim": "Apartman Banka Hesabı Zorunluluğu (KMK 35)",
        "harf": "A",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Yöneticinin toplanan tüm aidat ve avansları kendi şahsi hesabına değil, apartman adına açılan özel vadesiz banka hesabına yatırma zorunluluğudur.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 35/i uyarınca yönetici, kat malikleri kurulunun kararı olmadıkça toplanan paraları kendi adına değil, ana gayrimenkulün yöneticisi sıfatıyla bir bankada açtıracağı hesaba yatırmak zorundadır.",
        "pratikteNeAnlamaGelir": "Apartman aidatlarının yöneticinin şahsi IBAN numarasına gönderilmesi yasalara aykırıdır; vergi kimlik numarasıyla site adına hesap açılmalıdır.",
        "kritikUyari": "Site paralarını şahsi hesabında tutan veya şahsi harcamalarıyla karıştıran yöneticiler hakkında güveni kötüye kullanma suçundan savcılığa suç duyurusunda bulunulabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 35 fıkra 1 bent i amir hükmü.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "kat-maliki-tebligat-adresi-bildirimi",
        "terim": "Kat Maliki Tebligat Adresi Bildirimi",
        "harf": "K",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Ana gayrimenkulde oturmayan kat malikinin toplantı çağrıları ve işletme projesi tebligatları için yönetime geçerli bir Türkiye adresi bildirme yükümlülüğüdür.",
        "hukukiKarsilik": "7201 sayılı Tebligat Kanunu ve 634 sayılı KMK hükümleri uyarınca adres bildirmeyen malike yapılan tebligatlar bağımsız bölüme veya kapıya asılmakla tebliğ edilmiş sayılır.",
        "pratikteNeAnlamaGelir": "Evini kiraya verip başka şehirde oturan malik yeni adresini yöneticiye yazılı olarak bildirmezse, genel kurul çağrıları eski kiracısına veya kapıya bırakıldığında hukuken haberdar edilmiş sayılır.",
        "kritikUyari": "Adres bildirmeyen malik 'benim toplantıdan haberim yoktu, çağrı elime geçmedi' diyerek alınan aidat veya borç kararlarının iptalini isteyemez.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "7201 sayılı Tebligat Kanunu ve 634 sayılı KMK tebligat esasları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=7201&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "ortak-alan-siginak-tahsisi",
        "terim": "Ortak Alan Sığınak Tahsisi",
        "harf": "O",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Binalarda savaş, afet ve olağanüstü haller için ayrılan sığınak alanlarının başka hiçbir amaca tahsis edilemeyeceğini ve kiralanamayacağını belirten kuraldır.",
        "hukukiKarsilik": "3194 sayılı İmar Kanunu ve Sığınak Yönetmeliği Madde 13 uyarınca sığınaklar kat maliklerinin oy birliği olsa dahi mesken, işyeri, depo veya dükkan haline getirilemez, kiraya verilemez.",
        "pratikteNeAnlamaGelir": "Site yönetiminin fazladan gelir elde etmek amacıyla bodrumdaki ortak sığınağı bir esnafa veya komşuya depo olarak kiralaması yasal olarak mutlak butlanla batıldır.",
        "kritikUyari": "Sığınağın kiraya verildiğinin tespiti halinde mülki idare amirliğince tahliye edilir ve elde edilen haksız gelirler hazineye veya siteye iade ettirilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Sığınak Yönetmeliği Madde 13 ve 3194 sayılı İmar Kanunu hükümleri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=3194&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "bina-ortak-otopark-plaka-tanima",
        "terim": "Bina Ortak Otopark Plaka Tanıma Sistemi",
        "harf": "B",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Site açık veya kapalı otoparklarına sadece malik ve sakinlerin tescilli araçlarının girişini sağlayan ve yabancı araç işgalini önleyen elektronik kontrol sistemidir.",
        "hukukiKarsilik": "634 sayılı Kanun Madde 32 kapsamında kat malikleri kurulunca otopark düzeni ve güvenliğinin sağlanması amacıyla alınan idari kararla kurulan tesistir.",
        "pratikteNeAnlamaGelir": "Daire başına düşen tahsisli otopark sayısını aşan ikinci/üçüncü araçların veya misafirlerin site içine girişini engelleyerek otopark krizlerini çözen bariyer sistemidir.",
        "kritikUyari": "Plaka tanıma sistemi kurulurken KVKK kapsamında sakinlerden taahhütname alınmalı ve kamera kayıtlarının üçüncü kişilerle paylaşılmaması güvenceye alınmalıdır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu ve 6698 sayılı KVKK ilkeleri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "apartman-aidat-davasi-yetkili-mahkeme",
        "terim": "Apartman Aidat Davası Yetkili Mahkeme",
        "harf": "A",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Kat mülkiyetinden doğan aidat takipleri, itirazın iptali ve yönetim uyuşmazlıklarında görevli ve yetkili mahkemenin sulh hukuk mahkemesi olmasıdır.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Ek Madde 1 uyarınca bu Kanunun uygulanmasından doğacak her türlü anlaşmazlık ana gayrimenkulün bulunduğu yer sulh hukuk mahkemesinde çözümlenir.",
        "pratikteNeAnlamaGelir": "Ödenmeyen aidat için açılacak itirazın iptali davası veya yöneticiye açılacak hesap sorma davası taşınmazın bulunduğu yerdeki Sulh Hukuk Mahkemesi'ne açılmak zorundadır.",
        "kritikUyari": "Asliye Hukuk veya Tüketici Mahkemesi'ne açılan davalar görevsizlik nedeniyle reddedilir ve ciddi zaman ile yargılama gideri kaybına neden olur.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Ek Madde 1 kesin görev kuralı.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "blok-kat-malikleri-kurulu",
        "terim": "Blok Kat Malikleri Kurulu",
        "harf": "B",
        "kategori": "Tapu ve Mülkiyet",
        "kisaTanim": "Toplu yapılarda yalnızca belirli bir bloğu ilgilendiren ortak yer ve tesislerin yönetiminden sorumlu o bloktaki maliklerin oluşturduğu kuruldur.",
        "hukukiKarsilik": "634 sayılı Kat Mülkiyeti Kanunu Madde 69 gereğince toplu yapılarda blok kat malikleri kurulu kendi bloğuna ait münhasır ortak yerlerin yönetimi için toplanır ve karar alır.",
        "pratikteNeAnlamaGelir": "A Blok asansörünün tamiri veya A Blok merdivenlerinin boyanması için tüm site değil, yalnızca o bloktaki bağımsız bölüm sahipleri toplanıp karar alır ve masrafı paylaşır.",
        "kritikUyari": "Yalnızca bir bloğu ilgilendiren harcamalar için sitenin diğer bloklarındaki sakinlerden aidat veya avans talep edilemez.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "634 sayılı Kat Mülkiyeti Kanunu Madde 69 blok yönetimi yetkileri.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1&MevzuatTertip=5"]
    }
]

if __name__ == "__main__":
    write_package("data_ultra_32.py", "ULTRA_TERIMLER_32", TERIMLER_32, "Ultra 32", "Kat Mülkiyeti ve Tesis Yönetimi")
