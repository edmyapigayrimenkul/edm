# -*- coding: utf-8 -*-
"""
expand_datasets.py — Kapsamlı Sözlük Genişletici
Tüm kategoriler için yüzlerce yeni terimi data_* dosyalarına entegre eder.
"""

import sys
from pathlib import Path

# 3. YENİ VERGİ TERİMLERİ
EK_VERGI = [
    {
        "terim": "Bina Vergisi Oranları",
        "slug": "bina-vergisi-oranlari",
        "harf": "B",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Mesken ve işyerleri için belediyece belirlenen vergi değeri üzerinden büyükşehirlerde binde 2 ve binde 4, diğer illerde binde 1 ve binde 2 olarak uygulanan emlak vergisi oranıdır.",
        "hukukiKarsilik": "1319 Sayılı Emlak Vergisi Kanunu md. 8.",
        "pratikteNeAnlamaGelir": "Büyükşehir sınırları içindeki konutlar normal illere göre iki kat daha fazla emlak vergisi öder.",
        "kritikUyari": "Mesken olarak kullanılan ancak tapuda 'işyeri' veya 'ofis' görünen bağımsız bölümler daha yüksek orandan (binde 4) vergilendirilir.",
        "ilgiliTerimler": ["Emlak Vergisi", "Arsa Vergisi Oranları"]
    },
    {
        "terim": "Arsa Vergisi Oranları",
        "slug": "arsa-vergisi-oranlari",
        "harf": "A",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Belediye sınırları içindeki imarlı arsalar için büyükşehirlerde binde 6, normal illerde binde 3 oranında tahakkuk ettirilen yıllık servet vergisidir.",
        "hukukiKarsilik": "1319 Sayılı Emlak Vergisi Kanunu md. 18.",
        "pratikteNeAnlamaGelir": "Arsanızın belediye asgari beyan değeri 10 milyon TL ise büyükşehirde her yıl 60.000 TL arsa vergisi ödersiniz.",
        "kritikUyari": "Üzerinde bina inşaatına başlanıp temel ruhsatı alındığı andan itibaren arsa vergisi yerine geçici bina vergisi tarifesi uygulanır.",
        "ilgiliTerimler": ["Bina Vergisi Oranları", "Emlak Vergisi"]
    },
    {
        "terim": "Gerçek Satış Bedeli İlkesi",
        "slug": "gercek-satis-bedeli-ilkesi",
        "harf": "G",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Tapu harcının ve vergilerin belediye asgari rayiç bedeli üzerinden değil, alıcı ile satıcı arasında fiilen el değiştiren gerçek para tutarı üzerinden ödenmesi zorunluluğudur.",
        "hukukiKarsilik": "492 Sayılı Harçlar Kanunu md. 63.",
        "pratikteNeAnlamaGelir": "Banka havalesiyle satıcıya 8 milyon TL gönderip tapuda 2 milyon TL beyan ederseniz Maliye aradaki 6 milyon TL'nin harcını ve cezasını tahsil eder.",
        "kritikUyari": "Maliye gayrimenkul satışlarını banka transferleri, konut kredisi tutarları ve ekspertiz raporlarıyla çapraz denetleyerek 5 yıl geriye doğru tarar.",
        "ilgiliTerimler": ["Tapu Harcı", "Rayiç Bedel", "Pişmanlık Beyannamesi"]
    },
    {
        "terim": "İpotek Tesis Harcı",
        "slug": "ipotek-tesis-harci",
        "harf": "İ",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Taşınmaz üzerinde borç karşılığı ipotek kurulurken ipotek tutarı üzerinden binde 4.55 oranında tahsil edilen maktu ve nispi tapu harcıdır.",
        "hukukiKarsilik": "492 Sayılı Harçlar Kanunu (4 Sayılı Tarife).",
        "pratikteNeAnlamaGelir": "Bireysel tüketicilerin konut finansmanı (mortgage) amacıyla çektikleri konut kredisi ipotekleri kanunen bu harçtan tamamen muaftır.",
        "kritikUyari": "Ticari kredilerde veya şahıslar arası borçlanmalarda tesis edilen ipoteklerde binde 4.55 harç ve damga vergisi peşin tahsil edilir.",
        "ilgiliTerimler": ["İpotek", "İpotek Terkin Harcı"]
    },
    {
        "terim": "Damga Vergisi (Sözleşmelerde)",
        "slug": "damga-vergisi-tasinmaz",
        "harf": "D",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Taşınmaz satış vaadi, kat karşılığı inşaat ve kira sözleşmelerinde içerilen en yüksek parasal tutar üzerinden binde 9.48 oranında alınan kağıt vergisidir.",
        "hukukiKarsilik": "488 Sayılı Damga Vergisi Kanunu (1 Sayılı Tablo).",
        "pratikteNeAnlamaGelir": "Noterde yapılan kat karşılığı inşaat sözleşmelerinde kentsel dönüşüm kapsamında değilse yüksek damga vergisi tahakkuk eder.",
        "kritikUyari": "6306 sayılı Kentsel Dönüşüm Kanunu kapsamındaki sözleşmeler damga vergisinden tamamen istisnadır; noterlere bu muafiyet hatırlatılmalıdır.",
        "ilgiliTerimler": ["Kentsel Dönüşüm Harç Muafiyeti", "Noter Harçları"]
    },
    {
        "terim": "Emlak Vergisi Muafiyeti (Tek Mesken)",
        "slug": "emlak-vergisi-muafiyeti-tek-mesken",
        "harf": "E",
        "kategori": "Vergi & Harç",
        "kisaTanim": "Geliri sadece emekli maaşından ibaret olanlar, gaziler, engelliler, şehit dul ve yetimlerinin brüt 200 m²'yi geçmeyen tek meskenleri için sıfır oranlı emlak vergisi uygulanmasıdır.",
        "hukukiKarsilik": "1319 Sayılı Emlak Vergisi Kanunu md. 8.",
        "pratikteNeAnlamaGelir": "Emekli vatandaş belediyeye tek konut dilekçesi vererek her yıl ödediği emlak vergisinden tamamen muaf olur.",
        "kritikUyari": "Hakkı olduğu halde bilmeden vergi ödeyen emekliler geriye dönük son 5 yılın ödediği emlak vergilerini belediyeden nakden iade alabilir.",
        "ilgiliTerimler": ["Emlak Vergisi", "Bina Vergisi Oranları"]
    }
]

# 4. YENİ KENTSEL DÖNÜŞÜM TERİMLERİ
EK_KENTSEL = [
    {
        "terim": "Lisanslı Risk Tespiti Kuruluşu",
        "slug": "lisansli-risk-tespiti-kurulusu",
        "harf": "L",
        "kategori": "Kentsel Dönüşüm",
        "kisaTanim": "Binaların deprem risk analizini yapmak ve riskli yapı raporu düzenlemek üzere Çevre, Şehircilik ve İklim Değişikliği Bakanlığı'nca yetkilendirilen kurum ve şirketlerdir.",
        "hukukiKarsilik": "6306 Sayılı Kanun md. 3 ve Lisanslandırma Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Üniversiteler, inşaat mühendisleri odası veya bakanlıktan lisans belgesi almış özel mühendislik firmaları bu yetkiye sahiptir.",
        "kritikUyari": "Bakanlık lisansı olmayan firmaların hazırladığı deprem dayanıklılık raporları belediye ve tapu nezdinde hiçbir resmi geçerlilik taşımaz.",
        "ilgiliTerimler": ["Riskli Yapı Tespiti", "Karot Numunesi Alımı"]
    },
    {
        "terim": "Elektrik, Su ve Doğalgazın Kesilmesi",
        "slug": "elektrik-su-ve-dogalgazin-kesilmesi",
        "harf": "E",
        "kategori": "Kentsel Dönüşüm",
        "kisaTanim": "Yıkım tebligatına rağmen boşaltılmayan riskli yapılarda tahliyeyi zorlamak amacıyla mülki amirlik talimatıyla tüm altyapı hizmetlerinin durdurulmasıdır.",
        "hukukiKarsilik": "6306 Sayılı Kanun md. 5/3.",
        "pratikteNeAnlamaGelir": "İGDAŞ, İSKİ ve BEDAŞ gibi kurumlar kaymakamlık yazısıyla gelerek sayaçları söker ve mühürler; binada yaşam imkansız hale getirilir.",
        "kritikUyari": "Altyapının kesilmesi idari bir yaptırımdır; mahkemeden yürütmeyi durdurma kararı alınmadıkça kesinti işlemi engellenemez.",
        "ilgiliTerimler": ["Yıkım Tebligatı", "Resen Yıkım"]
    },
    {
        "terim": "Riskli Alan İlanı",
        "slug": "riskli-alan-ilani",
        "harf": "R",
        "kategori": "Kentsel Dönüşüm",
        "kisaTanim": "Zemin yapısı veya üzerindeki yapılaşma sebebiyle can ve mal kaybına yol açma riski taşıyan, Cumhurbaşkanlığı Kararı ile ilan edilen geniş bölgedir.",
        "hukukiKarsilik": "6306 Sayılı Kanun md. 2/ç.",
        "pratikteNeAnlamaGelir": "Tek bir bina değil, heyelan riski veya çürük yapı stoku olan bütün bir mahalle toptan riskli alan ilan edilerek ada bazında dönüştürülür.",
        "kritikUyari": "Riskli alandaki binalarda bireysel itiraz süreçleri işlemez; bölgenin tamamı için hazırlanan imar planı ve dönüşüm projesi esastır.",
        "ilgiliTerimler": ["Rezerv Yapı Alanı", "Acele Kamulaştırma"]
    },
    {
        "terim": "Acele Kamulaştırma Kararı",
        "slug": "acele-kamulastirma-karari",
        "harf": "A",
        "kategori": "Kentsel Dönüşüm",
        "kisaTanim": "Yurt savunması veya afet riskleri gibi ivedi durumlarda, normal kamulaştırma sürecini beklemeden mahkemece belirlenen bedel bankaya yatırılarak taşınmaza derhal el konulmasıdır.",
        "hukukiKarsilik": "2942 Sayılı Kamulaştırma Kanunu md. 27 ve 6306 SK md. 6.",
        "pratikteNeAnlamaGelir": "Dönüşüm projesini kilitleyen veya kamu güvenliğini tehdit eden parseller Cumhurbaşkanı Kararı ile 1 hafta içinde kamulaştırılarak tapusu Hazine'ye devredilir.",
        "kritikUyari": "Acele kamulaştırmada mülkiyet idareye derhal geçer; malik sadece belirlenen kamulaştırma bedelinin azlığına karşı sonradan bedel artırım davası açabilir.",
        "ilgiliTerimler": ["Kamulaştırma", "Riskli Alan İlanı"]
    },
    {
        "terim": "Statik Güçlendirme Projesi",
        "slug": "statik-guclendirme-projesi",
        "harf": "S",
        "kategori": "Kentsel Dönüşüm",
        "kisaTanim": "Yıkılmak istenmeyen riskli bir yapının kolon ve perdelerine betonarme veya karbon elyaf (FRP) mantolama yapılarak güncel deprem yönetmeliğine uygun hale getirilmesidir.",
        "hukukiKarsilik": "6306 Sayılı Kanun md. 5 ve TBDY 2018 Bölüm 15.",
        "pratikteNeAnlamaGelir": "Bina yıkılmadan temeller genişletilir, yeni beton perdeler eklenir ve bina depreme karşı tam güvenli hale getirilir.",
        "kritikUyari": "Güçlendirme kararı için kat maliklerinin 4/5 çoğunluğu şarttır ve güçlendirmenin 1 yıllık yasal tahliye süresi içinde ruhsata bağlanıp tamamlanması zorunludur.",
        "ilgiliTerimler": ["Perde Beton", "Riskli Yapı Tespiti"]
    }
]

# 5. YENİ İNŞAAT TERİMLERİ
EK_INSAAT = [
    {
        "terim": "Tekil (Münferit) Temel",
        "slug": "tekil-munferit-temel",
        "harf": "T",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Her kolonun altına bağımsız olarak dökülen ve sadece o kolonun yükünü zemine aktaran ayrık pabuç temel sistemidir.",
        "hukukiKarsilik": "TS 500 ve TBDY 2018.",
        "pratikteNeAnlamaGelir": "Eski az katlı binalarda sıkça kullanılmıştır; günümüz deprem yönetmeliğinde çok katlı binalarda kullanımı yasaklanmıştır.",
        "kritikUyari": "Deprem anında kolonların farklı oranlarda oturmasına yol açtığı için yüksek risk taşır; modern projelerde daima radye temel tercih edilir.",
        "ilgiliTerimler": ["Radye Jeneral Temel", "Kolon"]
    },
    {
        "terim": "Taşıma Gücü Kaybı",
        "slug": "tasima-gucu-kaybi",
        "harf": "T",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Temel altındaki zemin tabakasının, üzerine gelen bina ağırlığını ve dinamik deprem yüklerini karşılayamayarak kayma ve kırılma yaşamasıdır.",
        "hukukiKarsilik": "TBDY 2018 Bölüm 16.",
        "pratikteNeAnlamaGelir": "Zemin binanın yükünü taşıyamaz ve temel zemine doğru batarak yapıda ölümcül oturma çatlaklarına sebep olur.",
        "kritikUyari": "Taşıma gücü düşük arazilerde zemin iyileştirmesi yapılmadan inşaat ruhsatı verilmesi imar cinayetidir.",
        "ilgiliTerimler": ["Zemin Etüt Raporu", "Fore Kazık Sistemi"]
    },
    {
        "terim": "Çelik Konstrüksiyon Yapı",
        "slug": "celik-konstruksiyon-yapi",
        "harf": "Ç",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Taşıyıcı kolon, kiriş ve makasların tamamen yüksek dayanımlı yapısal çelik profillerden cıvatalı veya kaynaklı birleşimlerle üretildiği hafif yapı sistemidir.",
        "hukukiKarsilik": "Çelik Yapıların Tasarım, Hesap ve Yapım Esasları Yönetmeliği.",
        "pratikteNeAnlamaGelir": "Fabrika, lojistik depo, sanayi tesisi ve depreme ultra dayanıklı modern villalarda yaygın olarak kullanılır.",
        "kritikUyari": "Çelik binalar depreme çok dayanıklıdır ancak yangına karşı beton kadar dirençli değildir; çelik elemanların yangın geciktirici boya veya kaplamayla korunması şarttır.",
        "ilgiliTerimler": ["Karkas", "Prefabrik Yapı Sistemi"]
    },
    {
        "terim": "Yangın Merdiveni ve Kaçış Holü",
        "slug": "yangin-merdiveni-ve-kacis-holu",
        "harf": "Y",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "Yangın anında duman ve alevden arındırılmış, yangına en az 120 dakika dayanıklı kapı ve duvarlarla çevrili acil tahliye merdivenidir.",
        "hukukiKarsilik": "Binaların Yangından Korunması Hakkında Yönetmelik.",
        "pratikteNeAnlamaGelir": "Belli bir yüksekliği aşan tüm binalarda bulunması zorunlu olan ve doğrudan bina dışına tahliye sağlayan kaçış yoludur.",
        "kritikUyari": "Yangın merdiveni kapılarının kilitlenmesi veya merdiven sahanlıklarının eşya deposu olarak kullanılması ağır cezai sorumluluk doğurur.",
        "ilgiliTerimler": ["Yapı Kullanma İzin Belgesi", "Mimari Uygulama Projesi"]
    },
    {
        "terim": "Şantiye Şefi Sorumluluğu",
        "slug": "santiye-sefi-sorumlulugu",
        "harf": "Ş",
        "kategori": "İnşaat & Mimarlık",
        "kisaTanim": "İnşaatın mimari, statik ve tesisat projelerine, iş sağlığı ve güvenliği kurallarına uygun olarak yürütülmesinden şantiyede bizzat sorumlu mimar veya mühendistir.",
        "hukukiKarsilik": "Şantiye Şefleri Hakkında Yönetmelik ve 3194 Sayılı Kanun.",
        "pratikteNeAnlamaGelir": "Ruhsata imza atan şantiye şefi inşaat sahasındaki her beton dökümünde ve demir bağlamasında bulunmak zorundadır.",
        "kritikUyari": "Şantiye şefliği diplomasını kiraya verip inşaata uğramayan mühendisler, olası bir çökme veya iş kazasında TCK kapsamında doğrudan hapis cezasıyla yargılanır.",
        "ilgiliTerimler": ["Yapı Denetim Kuruluşu", "Yapı Ruhsatı"]
    }
]

# 6. YENİ DEĞERLEME TERİMLERİ
EK_DEGERLEME = [
    {
        "terim": "Net Bugünkü Değer (NPV)",
        "slug": "net-bugunku-deger-npv",
        "harf": "N",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Bir gayrimenkul yatırımının gelecekteki bütün nakit giriş ve çıkışlarının belirli bir iskonto oranıyla bugüne indirgenmiş net değeridir.",
        "hukukiKarsilik": "Gayrimenkul Finansı ve Yatırım Değerleme Standartları.",
        "pratikteNeAnlamaGelir": "NPV değeri sıfırdan büyükse gayrimenkul yatırımı karlıdır ve hedeflenen getiri oranının üzerinde kazanç sağlayacaktır.",
        "kritikUyari": "Enflasyon ve alternatif risksiz faiz oranları iskonto hesabında doğru seçilmezse NPV hesabı yatırımı olduğundan karlı gösterebilir.",
        "ilgiliTerimler": ["İç Verim Oranı (IRR)", "Gelir İndirgeme Yaklaşımı"]
    },
    {
        "terim": "İç Verim Oranı (IRR)",
        "slug": "ic-verim-orani-irr",
        "harf": "İ",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Bir gayrimenkul projesinin net bugünkü değerini sıfıra eşitleyen, projenin yıllık bileşik getiri potansiyelini gösteren orandır.",
        "hukukiKarsilik": "Kurumsal Gayrimenkul Yatırım Analizi.",
        "pratikteNeAnlamaGelir": "Arsa veya bina geliştirme projesinin yıllık yüzde kaç net getiri sağlayacağını gösteren en temel fizibilite metriğidir.",
        "kritikUyari": "IRR oranı piyasa borçlanma faizinin altında kalan hiçbir gayrimenkul geliştirme projesine başlanmamalıdır.",
        "ilgiliTerimler": ["Net Bugünkü Değer (NPV)", "Net Kira Getirisi"]
    },
    {
        "terim": "Brüt Kira Getirisi",
        "slug": "brut-kira-getirisi",
        "harf": "B",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Bir gayrimenkulün yıllık brüt kira gelirinin mülkün güncel satış fiyatına bölünmesiyle bulunan yüzdesel verim oranıdır.",
        "hukukiKarsilik": "Gayrimenkul Değerleme Esasları.",
        "pratikteNeAnlamaGelir": "5 milyon TL değerindeki bir daire aylık 25.000 TL (yıllık 300.000 TL) kira getiriyorsa brüt kira getirisi %6'dır.",
        "kritikUyari": "Brüt getiri yanıltıcı olabilir; mülkün vergi, aidat ve bakım masrafları düşülmeden net yatırım kararı verilmemelidir.",
        "ilgiliTerimler": ["Net Kira Getirisi (Net Yield)", "Boşluk Oranı"]
    },
    {
        "terim": "Yatırım Geri Dönüş Süresi",
        "slug": "yatirim-geri-donus-suresi",
        "harf": "Y",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Bir gayrimenkulün satın alma bedelinin, o mülkten elde edilen kira gelirleriyle kaç yıl içinde kendini amorti edeceğini gösteren süredir.",
        "hukukiKarsilik": "Gayrimenkul Yatırım Analizi İlkeleri.",
        "pratikteNeAnlamaGelir": "Türkiye ortalamasında konutlarda amortisman süresi 15-20 yıl, ticari mülklerde ise 12-16 yıl makul kabul edilir.",
        "kritikUyari": "Kira artışları ve enflasyon doğru projekte edilmezse hesaplanan geri dönüş süresi kağıt üzerinde kalır.",
        "ilgiliTerimler": ["Brüt Kira Getirisi", "Net Kira Getirisi"]
    },
    {
        "terim": "Boşluk Oranı (Vacancy Allowance)",
        "slug": "bosluk-orani",
        "harf": "B",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Gelir getiren bir taşınmazın kiracı değişimi veya piyasa durgunluğu sebebiyle yıl içinde boş kalma riskini temsil eden yüzdesel kayıp payıdır.",
        "hukukiKarsilik": "Uluslararası Değerleme Standartları.",
        "pratikteNeAnlamaGelir": "Değerleme uzmanları yıllık kira hesabında mülkün en az 1 ay boş kalacağını varsayarak gelirlerden %5-%10 boşluk payı düşer.",
        "kritikUyari": "Yatırım fizibilitesinde boşluk oranı hesaba katılmadığında kredi taksitleri mülk boş kaldığında yatırımcının cebinden çıkar.",
        "ilgiliTerimler": ["Net Kira Getirisi", "Gelir İndirgeme Yaklaşımı"]
    },
    {
        "terim": "Süpürülebilir Net Alan (Net m²)",
        "slug": "supurulebilir-net-alan",
        "harf": "S",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Bağımsız bölüm içerisindeki duvarların iç yüzeyleri arasında kalan, süpürge ile süpürülebilen fiziksel net kullanım alanıdır.",
        "hukukiKarsilik": "Planlı Alanlar İmar Yönetmeliği md. 4/1-ö.",
        "pratikteNeAnlamaGelir": "İlanlarda 120 m² brüt yazan bir dairenin süpürülebilir net alanı genellikle 80-85 m² çıkar; mobilyalarınızı yerleştireceğiniz gerçek alandır.",
        "kritikUyari": "Emlak ilanlarında brüt alan yerine süpürülebilir net alanın açıkça belirtilmesi Taşınmaz Ticareti Yönetmeliği gereği yasal zorunluluktur.",
        "ilgiliTerimler": ["Brüt Metrekare", "Faydalı Alan"]
    },
    {
        "terim": "Gayrimenkul Yatırım Ortaklığı (GYO)",
        "slug": "gayrimenkul-yatirim-ortakligi-gyo",
        "harf": "G",
        "kategori": "Değerleme & Finans",
        "kisaTanim": "Gayrimenkullere, gayrimenkule dayalı projelere ve sermaye piyasası araçlarına yatırım yapmak üzere kurulan, Borsa İstanbul'da işlem gören sermaye piyasası kurumudur.",
        "hukukiKarsilik": "6362 Sayılı Sermaye Piyasası Kanunu ve SPK GYO Tebliği.",
        "pratikteNeAnlamaGelir": "Büyük bir AVM veya gökdelene tek başınıza sahip olamasanız bile GYO hissesi alarak mülkün kira gelirine ve değer artışına küçük paralarla ortak olursunuz.",
        "kritikUyari": "GYO'ların portföy kazançları kurumlar vergisinden %100 istisnadır; bu durum yüksek kar payı dağıtım potansiyeli sağlar.",
        "ilgiliTerimler": ["Gayrimenkul Yatırım Fonu (GYF)", "SPK Lisanslı Değerleme Raporu"]
    }
]

def append_to_file(filepath, var_name, items):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Create Python representations
    formatted_items = []
    for item in items:
        entry = "    {\n"
        for k, v in item.items():
            if isinstance(v, list):
                val_str = str(v)
            else:
                val_str = repr(v)
            entry += f"        \"{k}\": {val_str},\n"
        entry = entry.rstrip(",\n") + "\n    }"
        formatted_items.append(entry)

    items_block = ",\n".join(formatted_items)

    # find list declaration
    idx = content.rfind("]")
    if idx != -1:
        new_content = content[:idx].rstrip() + ",\n" + items_block + "\n" + content[idx:]
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Başarıyla güncellendi: {filepath.name}, +{len(items)} terim eklendi.")

data_dir = Path("site/scripts/data")
append_to_file(data_dir / "data_vergi.py", "VERGI_TERIMLERI", EK_VERGI)
append_to_file(data_dir / "data_kentsel.py", "KENTSEL_TERIMLERI", EK_KENTSEL)
append_to_file(data_dir / "data_insaat.py", "INSAAT_TERIMLERI", EK_INSAAT)
append_to_file(data_dir / "data_degerleme.py", "DEGERLEME_TERIMLERI", EK_DEGERLEME)
