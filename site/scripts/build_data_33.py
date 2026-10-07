#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_data_33.py — Ultra 33 paketini üretir.
Yeşil Binalar, Sürdürülebilirlik, nZEB ve Enerji Standartları (40 Terim)
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

TERIMLER_33 = [
    {
        "slug": "leed-sertifikasi",
        "terim": "LEED Sertifikası (Yeşil Bina)",
        "harf": "L",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Binaların enerji verimliliği, su tasarrufu, malzeme seçimi ve iç ortam kalitesini değerlendiren uluslararası yeşil bina derecelendirme sistemidir.",
        "hukukiKarsilik": "USGBC (U.S. Green Building Council) tarafından geliştirilen ve Türkiye'de Çevre, Şehircilik ve İklim Değişikliği Bakanlığı Yeşil Sertifika (YeS-TR) mevzuatına referans oluşturan uluslararası standarttır.",
        "pratikteNeAnlamaGelir": "Sertifikalı (Certified), Gümüş (Silver), Altın (Gold) ve Platin (Platinum) dereceleri bulunan, binaların işletme giderlerini %30-50 düşüren ve uluslararası kiralama değerini artıran tescildir.",
        "kritikUyari": "LEED sertifikası inşaat bittikten sonra değil, tasarım aşamasında başvurulup tüm inşaat süreci bağımsız denetçilerce kayıt altına alınarak kazanılabilir; sonradan alınamaz.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "USGBC LEED v4.1 bina tasarımı ve inşaatı (BD+C) standartları ve kuralları.",
        "kaynaklar": ["https://www.usgbc.org/leed"]
    },
    {
        "slug": "breeam-sertifikasi",
        "terim": "BREEAM Sertifikası",
        "harf": "B",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "İngiltere menşeili, binaların çevreye etkisini yaşam döngüsü boyunca ölçen dünyanın ilk ve en yaygın yeşil bina değerlendirme metodolojisidir.",
        "hukukiKarsilik": "BRE (Building Research Establishment) tarafından yürütülen; enerji, sağlık, inovasyon, arazi kullanımı ve kirlilik başlıklarında puanlama yapan denetim mekanizmasıdır.",
        "pratikteNeAnlamaGelir": "Özellikle Avrupa sermayeli kurumsal kiracıların ve fonların gayrimenkul kiralarken veya satın alırken aradığı en prestijli çevresel sürdürülebilirlik belgesidir.",
        "kritikUyari": "BREEAM puanlamasında bina lokasyonunun toplu taşımaya yakınlığı ve bisiklet yolları da puanlandığından, sadece bina kalitesi tek başına en üst düzeye ulaşmaya yetmez.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "BRE Global BREEAM International New Construction ve In-Use standartları.",
        "kaynaklar": ["https://bregroup.com/products/breeam/"]
    },
    {
        "slug": "neredeyse-sifir-enerjili-bina-nzeb",
        "terim": "Neredeyse Sıfır Enerjili Bina (nZEB)",
        "harf": "N",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Yüksek enerji performansına sahip olan ve tükettiği çok az miktardaki enerjinin en az yüzde onunu yenilenebilir enerji kaynaklarından karşılayan binadır.",
        "hukukiKarsilik": "Binalarda Enerji Performansı Yönetmeliği Madde 4 ve Geçici Madde 6 uyarınca toplam inşaat alanı 2.000 m² ve üzeri olan yeni binaların nZEB standartlarında yapılması zorunludur.",
        "pratikteNeAnlamaGelir": "Yeni yapılan sitelerde veya ticari binalarda Enerji Kimlik Belgesi sınıfının en az 'B' olması ve çatıda güneş paneli veya ısı pompası gibi yenilenebilir sistemlerin bulunması yasal mecburiyettir.",
        "kritikUyari": "nZEB şartlarını sağlamayan projelere belediyelerce yapı ruhsatı veya yapı kullanma izin belgesi (iskan) verilemez.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Binalarda Enerji Performansı Yönetmeliğinde Değişiklik Yapılmasına Dair Yönetmelik (Resmi Gazete No: 31755).",
        "kaynaklar": ["https://www.resmigazete.gov.tr/eskiler/2022/02/20220219-1.htm"]
    },
    {
        "slug": "sifir-enerjili-bina-zeb",
        "terim": "Sıfır Enerjili Bina (ZEB)",
        "harf": "S",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Yıllık bazda tükettiği toplam enerji miktarının tamamını kendi bünyesindeki yenilenebilir enerji sistemleriyle (güneş, rüzgar vb.) üreten yapıdır.",
        "hukukiKarsilik": "Avrupa Birliği Enerji Performansı Direktifi (EPBD) ve Türkiye Ulusal Enerji Verimliliği Eylem Planı hedefleri doğrultusunda net sıfır karbon vizyonunu temsil eden bina standardıdır.",
        "pratikteNeAnlamaGelir": "Şebekeden neredeyse hiç elektrik veya doğalgaz satın almayan, ürettiği fazla enerjiyi şebekeye satan ve enerji faturası sıfır olan geleceğin konut modelidir.",
        "kritikUyari": "ZEB standartlarına ulaşmak için sadece güneş paneli yetmez; cephe yalıtımının, pencere ısı geçirgenliğinin ve hava sızdırmazlığının kusursuz olması gerekir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Ulusal Enerji Verimliliği Eylem Planı ve EPBD 2030 bina direktifleri.",
        "kaynaklar": ["https://enerji.gov.tr"]
    },
    {
        "slug": "enerji-kimlik-belgesi-siniflari",
        "terim": "Enerji Kimlik Belgesi Sınıfları (EKB)",
        "harf": "E",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Binaların yıllık m² başına primer enerji tüketimi ve sera gazı salımını A'dan G'ye kadar harflerle derecelendiren 10 yıl geçerli resmi belgedir.",
        "hukukiKarsilik": "5627 sayılı Enerji Verimliliği Kanunu ve BEP Yönetmeliği uyarınca yeni binaların en az C sınıfı EKB alması şarttır; aksi takdirde iskan ruhsatı düzenlenemez.",
        "pratikteNeAnlamaGelir": "A sınıfı bina en verimli, G sınıfı ise enerjiyi en çok israf eden binayı temsil eder; tapuda alım-satım ve kiralama işlemlerinde EKB ibrazı zorunludur.",
        "kritikUyari": "Eski binalarda mevcut EKB olmadan tapuda devir yapılırken alıcıya belgenin olmadığı şerh düşülür ancak değerleme raporlarında düşük enerji sınıfı konut fiyatını olumsuz etkiler.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "5627 sayılı Kanun ve Binalarda Enerji Performansı Yönetmeliği Madde 25-27.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5627&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "gri-su-geri-kazanim-sistemi",
        "terim": "Gri Su Geri Kazanım Sistemi",
        "harf": "G",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Duş, banyo lavaboları ve çamaşır makinelerinden gelen az kirlenmiş atık suların arıtılarak tuvalet rezervuarlarında ve bahçe sulamasında yeniden kullanılmasıdır.",
        "hukukiKarsilik": "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı yeşil bina sertifikasyon yönetmeliği ve sürdürülebilir su yönetimi teşvikleri kapsamındaki arıtma standardıdır.",
        "pratikteNeAnlamaGelir": "Binaların şebeke su faturasını %40'a varan oranda azaltan, tuvalet sifonlarında temiz içme suyu yerine arıtılmış banyo suyunun kullanılmasını sağlayan tesisattır.",
        "kritikUyari": "Gri su hattı ile temiz içme suyu hattı kesinlikle birbirine karıştırılmamalı, borular çapraz bağlantı riskine karşı mor veya özel uyarı rengiyle etiketlenmelidir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Yeşil Bina Sertifikasyon Kriterleri Su Yönetimi Başlığı ve TS EN 16941-2 standardı.",
        "kaynaklar": ["https://csb.gov.tr"]
    },
    {
        "slug": "yagmur-suyu-hasadi-ve-sarnic",
        "terim": "Yağmur Suyu Hasadı ve Sarnıç Zorunluluğu",
        "harf": "Y",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Çatı yüzeyinden toplanan yağmur suyunun filtrelenerek yeraltı sarnıçlarında depolanması ve peyzaj sulaması ile bina temizliğinde kullanılması zorunluluğudur.",
        "hukukiKarsilik": "Planlı Alanlar İmar Yönetmeliği Madde 5/38 uyarınca 2.000 m²'den büyük parsellerde yapılacak tüm binalarda yağmur suyu toplama sarnıcı yapılması mecburidir.",
        "pratikteNeAnlamaGelir": "Yeni inşa edilecek site ve plazalarda çatı oluklarından inen suların kanalizasyona akıtılmayıp bodrumdaki sarnıçta toplanarak bahçe sulaması için depolanmasıdır.",
        "kritikUyari": "Sarnıç projesi mimari ve mekanik projede yer almayan yapılara belediyelerce inşaat ruhsatı düzenlenmez.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Planlı Alanlar İmar Yönetmeliği Madde 5 fıkra 38 yağmur suyu sarnıcı düzenlemesi.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=3194&MevzuatTur=7&MevzuatTertip=5"]
    },
    {
        "slug": "fotovoltaik-bina-entegre-bipv",
        "terim": "Bina Entegre Fotovoltaik Sistem (BIPV)",
        "harf": "B",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Güneş enerjisi panellerinin sadece çatıya monte edilmekle kalmayıp doğrudan dış cephe kaplaması, cam veya gölgelik olarak binanın yapı kabuğuna entegre edilmesidir.",
        "hukukiKarsilik": "Elektrik Piyasasında Lisanssız Elektrik Üretim Yönetmeliği kapsamında binaların kendi tükettikleri enerjiyi çatı ve cephelerinde üretme hakkı tanıyan mevzuattır.",
        "pratikteNeAnlamaGelir": "Binanın cam giydirme cephesinin aynı zamanda güneş pili vazifesi görerek binanın tüm ortak aydınlatma ve asansör elektriğini kendisinin üretmesidir.",
        "kritikUyari": "BIPV sistemlerinin rüzgar yükü ve yangın güvenliği onayları mimari ve statik projeyle entegre biçimde itfaiye ve yapı denetime onaylatılmalıdır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "EPDK Lisanssız Elektrik Üretim Yönetmeliği ve Binaların Yangından Korunması Hakkında Yönetmelik.",
        "kaynaklar": ["https://www.epdk.gov.tr"]
    },
    {
        "slug": "bina-karbon-ayak-izi",
        "terim": "Bina Karbon Ayak İzi (Kapsam 1-2-3)",
        "harf": "B",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Bir binanın inşaatından yıkımına kadar doğrudan fosil yakıt, satın alınan elektrik ve tedarik zincirinden kaynaklanan toplam sera gazı salımı miktarıdır.",
        "hukukiKarsilik": "Paris İklim Anlaşması, AB Yeşil Mutabakatı (Green Deal) ve Türkiye İklim Kanunu taslağı çerçevesinde binaların dekarbonizasyonunu hedefleyen raporlama standardıdır.",
        "pratikteNeAnlamaGelir": "Kapsam 1 doğalgaz kazanından çıkan emisyonu, Kapsam 2 tüketilen şebeke elektriğini, Kapsam 3 ise inşaatta kullanılan çimento, demir ve nakliye emisyonlarını ifade eder.",
        "kritikUyari": "Uluslararası gayrimenkul yatırım fonları yüksek karbon ayak izine sahip binaları portföylerine almamakta veya ciddi değer iskontosu uygulamaktadır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "ISO 14064 Sera Gazı Hesaplama ve Doğrulama Standartları.",
        "kaynaklar": ["https://www.iso.org"]
    },
    {
        "slug": "yasam-dongusu-degerlendirmesi-lca",
        "terim": "Yaşam Döngüsü Değerlendirmesi (LCA)",
        "harf": "Y",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Bir yapı malzemesinin hammaddeden başlayarak üretim, şantiye montajı, kullanım ömrü ve nihai yıkım/geri dönüşüm süreçlerinin çevresel etkilerini ölçen bilimsel analizdir.",
        "hukukiKarsilik": "ISO 14040 ve ISO 14044 standartlarına dayalı olarak yürütülen, yeşil bina sertifikalarında en yüksek puanı kazandıran teknik rapordur.",
        "pratikteNeAnlamaGelir": "Binanın sadece işletilirken değil, inşa edilirken ve 50 yıl sonra yıkılırken doğaya ne kadar zarar vereceğinin hesaplanmasıdır.",
        "kritikUyari": "LCA raporu olmadan bir yapının 'çevre dostu ve sürdürülebilir' olduğu yönündeki ticari reklamlar yeşil aklama (greenwashing) sayılarak Reklam Kurulu cezalarına maruz kalabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "ISO 14040/14044 Çevre Yönetimi - Yaşam Döngüsü Değerlendirmesi İlkeleri.",
        "kaynaklar": ["https://www.iso.org"]
    },
    {
        "slug": "cevresel-urun-beyani-epd",
        "terim": "Çevresel Ürün Beyanı (EPD)",
        "harf": "Ç",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "İnşaat malzemelerinin çevreye saldığı emisyonları, su tüketimini ve küresel ısınma potansiyelini bağımsız laboratuvarlarca tescilleyen Tip III çevre etiketidir.",
        "hukukiKarsilik": "ISO 14025 ve TS EN 15804 standartlarına göre hazırlanan ve uluslararası EPD tescil kuruluşlarınca yayımlanan resmi çevresel belgedir.",
        "pratikteNeAnlamaGelir": "Kullanılan seramiğin, çimentonun veya boyanın karbon nötr olup olmadığını ve imalatında ne kadar yeşil enerji kullanıldığını gösteren pasaporttur.",
        "kritikUyari": "Kamu ihalelerinde ve yeşil sertifikalı projelerde EPD belgeli malzeme kullanımı şart koşulmakta, belgesiz ürünler şantiye kabulünde reddedilmektedir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "TS EN 15804 Sürdürülebilirlik Kriterleri ve EPD Tip III Çevre Beyanları.",
        "kaynaklar": ["https://www.environdec.com"]
    },
    {
        "slug": "isi-pompasi-sistemleri",
        "terim": "Isı Pompası Sistemleri (Toprak/Hava/Su)",
        "harf": "I",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Doğada toprakta, havada veya yeraltı suyunda var olan düşük sıcaklıktaki ısıyı elektrik enerjisiyle yükselterek binaları kışın ısıtan, yazın soğutan cihazdır.",
        "hukukiKarsilik": "5627 sayılı Enerji Verimliliği Kanunu ve BEP Yönetmeliği kapsamında yüksek COP (performans katsayısı) değerine sahip yenilenebilir enerji kaynağı kabul edilir.",
        "pratikteNeAnlamaGelir": "Doğalgaz veya kömür yakmadan 1 birim elektrik tüketimi karşılığında 4-5 birim ısı enerjisi üreterek fosil yakıt bağımlılığını tamamen ortadan kaldıran sistemdir.",
        "kritikUyari": "Toprak kaynaklı ısı pompalarında sondaj derinliği ve kuyu sayısı jeolojik etütle doğru hesaplanmazsa sistem kış ortasında yetersiz kalabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "BEP Yönetmeliği ve Isı Pompası COP/EER Enerji Verimliliği Standartları.",
        "kaynaklar": ["https://enerji.gov.tr"]
    },
    {
        "slug": "isi-geri-kazanimli-havalandirma-hrv",
        "terim": "Isı Geri Kazanımlı Havalandırma (HRV / ERV)",
        "harf": "I",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Bina içinden dışarı atılan kirli havanın sıcaklığını, içeri alınan temiz taze havaya ısı transferi yoluyla aktaran yüksek verimli havalandırma ünitesidir.",
        "hukukiKarsilik": "Binalarda Enerji Performansı Yönetmeliği uyarınca mekanik havalandırma kullanılan binalarda ısı geri kazanım cihazı kullanımı zorunludur.",
        "pratikteNeAnlamaGelir": "Pencereleri açıp odayı soğutmadan, içerideki oksijeni sürekli yenilerken kışın evin sıcaklığını dışarı kaçırmayan konfor tesisatıdır.",
        "kritikUyari": "Filtrelerin (F7/F9 veya HEPA) periyodik bakımı ve değişimi yapılmazsa cihaz toz ve alerjen biriktirerek iç mekan hava kalitesini düşürebilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Binalarda Enerji Performansı Yönetmeliği Mekanik Tesisat Tasarım Esasları.",
        "kaynaklar": ["https://www.resmigazete.gov.tr/eskiler/2008/12/20081205-9.htm"]
    },
    {
        "slug": "yesil-cati-sistemleri",
        "terim": "Yeşil Çatı Sistemleri (Sedum/Ekstansif)",
        "harf": "Y",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Bina teras ve çatılarının su yalıtımı, kök tutucu membran ve özel bitki örtüsü tabakaları ile kaplanarak yaşayan bir eko-sistem haline getirilmesidir.",
        "hukukiKarsilik": "İmar mevzuatında kentsel ısı adasını azaltıcı ve yağmur suyunu geciktirici çevresel peyzaj çözümü olarak kabul edilen ve emsal teşvikleri alabilen sistemdir.",
        "pratikteNeAnlamaGelir": "Yazın çatının aşırı ısınmasını önleyerek en üst kat dairenin klima masrafını düşürür, kışın ise ilave ısı yalıtımı sağlayarak yakıt tasarrufu yaptırır.",
        "kritikUyari": "Kök tutucu membran ve drenaj katmanı doğru projelendirilmezse bitki kökleri betonarme döşemeyi delerek daire içine su sızıntılarına yol açar.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "FLL Yeşil Çatı Standartları ve TS EN 13948 Kök Direnci Tayini normları.",
        "kaynaklar": ["https://csb.gov.tr"]
    },
    {
        "slug": "biyofilik-mimari-ve-iaq",
        "terim": "Biyofilik Mimari ve İç Hava Kalitesi (IAQ)",
        "harf": "B",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "İç mekanlarda doğal ışık, doğal ahşap/taş malzemeler, canlı bitkiler ve temiz hava sirkülasyonu yoluyla insan sağlığını ve odaklanmasını artıran mimari yaklaşımdır.",
        "hukukiKarsilik": "WELL Bina Standardı ve İş Sağlığı ve Güvenliği mevzuatı kapsamında kapalı ortamlardaki CO2, VOC ve formaldehit sınır değerlerini denetleyen tasarım kriteridir.",
        "pratikteNeAnlamaGelir": "Ofis ve konutlarda 'hasta bina sendromunu' (baş ağrısı, yorgunluk, astım) engelleyen, ferah ve üretkenliği artıran yaşam alanları tasarlanmasıdır.",
        "kritikUyari": "Kapalı mekanlarda yetersiz havalandırma nedeniyle karbondioksit oranı 1000 ppm üzerine çıktığında zihinsel performans %50 oranında düşer.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "ASHRAE 62.1 Standartları ve Uluslararası WELL Bina Enstitüsü normları.",
        "kaynaklar": ["https://www.wellcertified.com"]
    },
    {
        "slug": "akilli-termostat-ve-enerji-yonetimi",
        "terim": "Akıllı Termostat ve Dinamik Enerji Yönetimi",
        "harf": "A",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Evin sıcaklığını sakinlerin günlük rutinine, hava durumu tahminlerine ve oda doluluğuna göre yapay zeka ile otomatik ayarlayan dijital kontrol cihazıdır.",
        "hukukiKarsilik": "5627 sayılı Kanun kapsamında binalarda otomatik kontrol ve otomasyon sistemleri ile enerji verimliliği sağlama tedbirlerindendir.",
        "pratikteNeAnlamaGelir": "Evden çıktığınızda ısıtmayı otomatik olarak ekonomik moda alıp eve dönmeden yarım saat önce evi ısıtarak yıllık faturayı %20-30 düşüren akıllı sistemdir.",
        "kritikUyari": "Modülasyonlu kombi veya ısı pompası ile uyumlu olmayan termostatlar cihazı sürekli aç-kapa yaptırarak yakıt tüketimini artırabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "5627 sayılı Enerji Verimliliği Kanunu ve Akıllı Ev Otomasyonu Standartları.",
        "kaynaklar": ["https://enerji.gov.tr"]
    },
    {
        "slug": "binalarda-akustik-yalitim-belgesi",
        "terim": "Binalarda Akustik Yalıtım Belgesi",
        "harf": "B",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Komşu daireler arasındaki ses geçişini, darbe sesini ve dış çevre gürültüsünü A'dan F'ye kadar sınıflarla belgeleyen resmi akustik performans raporudur.",
        "hukukiKarsilik": "Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik uyarınca yapı ruhsatı ve iskan aşamasında zorunlu olan akustik performans belgesidir.",
        "pratikteNeAnlamaGelir": "Üst kattan gelen ayak sesleri, yandaki komşunun televizyon sesi ve sokaktaki trafik gürültüsünün evin içine girmesini engelleyen yalıtımın resmi kalitesidir.",
        "kritikUyari": "Yönetmelik şartlarını sağlamayan binalara akustik onay verilmez; iskan ruhsatı alınamaz ve daireler değer kaybına uğrar.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik (Resmi Gazete No: 30082).",
        "kaynaklar": ["https://www.resmigazete.gov.tr/eskiler/2017/05/20170531-1.htm"]
    },
    {
        "slug": "dusuk-karbonlu-yesil-cimento",
        "terim": "Düşük Karbonlu Yeşil Çimento",
        "harf": "D",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Klinker oranı düşürülerek yerine uçucu kül, curuf veya kalsine kil kullanılan ve üretimindeki CO2 emisyonu %40-60 daha az olan ekolojik çimentodur.",
        "hukukiKarsilik": "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı Yeşil Çimento Tebliği uyarınca kamu projelerinde ve yeşil sertifikalı binalarda kullanımı teşvik edilen bağlayıcıdır.",
        "pratikteNeAnlamaGelir": "Geleneksel Portland çimentosuna kıyasla aynı mukavemeti sağlarken gezegeni çok daha az kirleten ve bina karbon ayak izini doğrudan düşüren yapı malzemesidir.",
        "kritikUyari": "Yeşil çimentolu betonların priz alma ve kalıp söküm süreleri standart çimentoya göre birkaç gün daha uzun olabileceğinden şantiye takvimi dikkatle planlanmalıdır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Binalarda Düşük Karbonlu Yeşil Çimento Kullanımına İlişkin Tebliğ.",
        "kaynaklar": ["https://csb.gov.tr"]
    },
    {
        "slug": "u-degeri-isil-gecirgenlik",
        "terim": "U-Değeri (Isıl Geçirgenlik Katsayısı)",
        "harf": "U",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Duvar, çatı veya pencerenin 1 m² yüzeyinden, iç ve dış sıcaklık farkı 1°C olduğunda kaç Watt ısı enerjisi kaçtığını gösteren yalıtım ölçü birimidir.",
        "hukukiKarsilik": "TS 825 Binalarda Isı Yalıtım Kuralları Standardı uyarınca her iklim bölgesi için azami U değerleri kanunla belirlenmiştir; sınırları aşan projeler onaylanmaz.",
        "pratikteNeAnlamaGelir": "U değeri ne kadar düşükse binanın yalıtımı o kadar mükemmeldir; U değeri 0.8 olan üç camlı pencere, U değeri 2.8 olan eski çift cama göre 3.5 kat daha az ısı kaçırır.",
        "kritikUyari": "Yalıtım malzemesi kalınlığından tasarruf etmek için yüksek U değerine razı olmak, 30 yıl boyunca 3-4 kat daha fazla yakıt faturası ödemek anlamına gelir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "TS 825 Binalarda Isı Yalıtım Kuralları ve BEP Yönetmeliği hesap metodolojisi.",
        "kaynaklar": ["https://www.tse.org.tr"]
    },
    {
        "slug": "blower-door-hava-sizdirmazlik-testi",
        "terim": "Blower Door (Hava Sızdırmazlık Testi)",
        "harf": "B",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Binanın dış kapısına yerleştirilen özel fan ve manometreler ile 50 Pascal basınç farkı yaratılarak bina kabuğundaki kontrolsüz hava kaçaklarının ölçülmesidir.",
        "hukukiKarsilik": "TS EN ISO 9972 standardına dayalı olarak yapılan ve Pasif Ev (Passivhaus) ile LEED/BREEAM sertifikalarında zorunlu tutulan hava sızdırmazlık testidir.",
        "pratikteNeAnlamaGelir": "Priz arkalarından, süpürgeliklerden ve pencere kenarlarından içeri soğuk havanın gizlice sızıp sızmadığını termal kamera ve dumanla tespit eden hassas testtir.",
        "kritikUyari": "Bir saatteki hava değişim katsayısı (n50) 0.6 h⁻¹ değerini aşan yapılar uluslararası Passivhaus sertifikası alamaz.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "TS EN ISO 9972 Binaların Isıl Performansı - Binaların Hava Geçirgenliğinin Belirlenmesi.",
        "kaynaklar": ["https://www.iso.org"]
    },
    {
        "slug": "termal-kopru-isikoprusu-kiricilar",
        "terim": "Termal Köprü (Isı Köprüsü) Kırıcılar",
        "harf": "T",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Balkon plağı, parapet ve kolon-kiriş birleşimlerinde iç ve dış betonarme kütle arasına yerleştirilen yalıtımlı donatı elemanlarıdır.",
        "hukukiKarsilik": "TS 825 ve BEP Yönetmeliği uyarınca binalarda ısı köprülerinin minimize edilmesi ve iç ortamda yoğuşma/küflenmenin önlenmesi şarttır.",
        "pratikteNeAnlamaGelir": "Balkon betonundan binanın içine giren soğuğu engelleyerek kışın duvar diplerinde siyah küf ve rutubet oluşmasını imkansız kılan mühendislik elemanıdır.",
        "kritikUyari": "Isı köprüsü kırıcı konulmayan binalarda dış cephe mantolansa dahi balkon birleşim noktalarından içeri soğuk köprüsü oluşur ve iç cephe boyası küflenir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "TS 825 Madde 4 ve TS EN ISO 10211 Isı Köprüleri Hesaplama Metotları.",
        "kaynaklar": ["https://www.tse.org.tr"]
    },
    {
        "slug": "pasif-ev-standartlari-passivhaus",
        "terim": "Pasif Ev Standartları (Passivhaus)",
        "harf": "P",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Geleneksel ısıtma veya klima sistemine ihtiyaç duymadan, yalnızca taze havanın ısıtılmasıyla konforlu iç ortam sıcaklığı sağlayan ultra verimli yapı standardıdır.",
        "hukukiKarsilik": "Almanya Passivhaus Enstitüsü (PHI) tarafından geliştirilen ve yıllık ısıtma talebi 15 kWh/m² değerini aşmayan binalara verilen küresel tescildir.",
        "pratikteNeAnlamaGelir": "Bir evin yıllık toplam ısıtma masrafının neredeyse bir saç kurutma makinesinin yaktığı elektrik kadar az olduğu, dünyanın en konforlu ve tasarruflu evidir.",
        "kritikUyari": "En ufak bir montaj veya yalıtım hatası hava sızdırmazlık testini bozacağından, Passivhaus şantiyelerinde sertifikalı işçilik ve özel gözetim şarttır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Passivhaus Enstitüsü (PHI) bina sertifikasyon yönergeleri ve kriterleri.",
        "kaynaklar": ["https://passivehouse.com"]
    },
    {
        "slug": "akilli-golgelendirme-ve-gunes-kirici",
        "terim": "Akıllı Gölgelendirme ve Güneş Kırıcılar",
        "harf": "A",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Güneşin açısına ve radyasyon şiddetine göre otomatik açılıp kapanarak binanın yazın aşırı ısınmasını, kışın ise pasif güneş ısısından faydalanmasını sağlayan cephe elemanıdır.",
        "hukukiKarsilik": "BEP Yönetmeliği ve yeşil bina sertifikalarında pasif soğutma ve aydınlatma enerjisi tasarrufu sağlayan mimari eleman olarak kabul edilir.",
        "pratikteNeAnlamaGelir": "Yazın güneş ışınlarını cama çarpmadan dışarıda bloke ederek klima kullanımını %40 azaltan, kışın ise içeri güneş girmesine izin vererek evi ısıtan motorlu panjurlardır.",
        "kritikUyari": "İç tarafa takılan perdeler ısıyı engellemez; ısı camdan geçtikten sonra odanın içine hapsolur, gölgelendirmenin mutlaka dış cephede olması gerekir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Binalarda Enerji Performansı Yönetmeliği ve DIN 4108-2 Yaz Dönemi Isıl Konfor Normları.",
        "kaynaklar": ["https://csb.gov.tr"]
    },
    {
        "slug": "dusuk-voc-ic-mekan-malzemeleri",
        "terim": "Düşük VOC (Uçucu Organik Bileşik) Standartları",
        "harf": "D",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Boya, vernik, yapıştırıcı ve zemin kaplamalarının havaya zehirli kimyasal gaz yayma oranının sıfıra yakın olduğunu belgeleyen sağlık standardıdır.",
        "hukukiKarsilik": "Çevre Etiketi Yönetmeliği ve TS EN 16516 standardı gereğince iç mekan yapı malzemelerindeki kanserojen gaz salımının yasal limitlerin altında tutulması şarttır.",
        "pratikteNeAnlamaGelir": "Yeni boyanan veya parkesi döşenen evdeki o keskin tiner ve kimyasal kokusunun olmaması; çocukların ve alerjik bireylerin güvenle nefes alabilmesidir.",
        "kritikUyari": "Düşük kaliteli solvent bazlı yapıştırıcı ve boyalar yıllarca havaya kanserojen benzen ve formaldehit gazı salmaya devam eder.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "TS EN 16516 Yapı Ürünleri - Tehlikeli Maddelerin Salımının Değerlendirilmesi.",
        "kaynaklar": ["https://www.tse.org.tr"]
    },
    {
        "slug": "su-tasarruflu-armatur-ve-debi-sinirlayici",
        "terim": "Su Tasarruflu Armatür ve Debi Sınırlayıcılar",
        "harf": "S",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Musluk ve duş başlıklarına hava karıştırarak suyun akış konforunu bozmadan debisini dakikada 12-15 litreden 4-6 litreye düşüren özel perlatörlerdir.",
        "hukukiKarsilik": "LEED ve BREEAM Su Verimliliği (WE) kredileri kapsamında binadaki toplam su tüketiminin en az %30-40 azaltılması için zorunlu kılınan donanımlardır.",
        "pratikteNeAnlamaGelir": "El yıkarken veya duş alırken aynı dolgunlukta su hissi yaşanırken ay sonunda gelen su faturasının yarı yarıya inmesidir.",
        "kritikUyari": "Debi sınırlayıcı takılmayan standart bataryalar günde yüzlerce litre arıtılmış içme suyunun israf edilmesine yol açar.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "TS EN 246 Sıhhi Tesisat Armatürleri Akış Düzenleyicileri ve Yeşil Bina Su Kredileri.",
        "kaynaklar": ["https://www.tse.org.tr"]
    },
    {
        "slug": "elektrikli-arac-sarj-istasyonu-zorunlulugu",
        "terim": "Elektrikli Araç Şarj İstasyonu Zorunluluğu",
        "harf": "E",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Yeni yapılan otoparklı binalarda belirli oranda elektrikli araç şarj ünitesi kurulması ve kablo altyapısının çekilmesini şart koşan yasal düzenlemedir.",
        "hukukiKarsilik": "Otopark Yönetmeliği Madde 6/f uyarınca zorunlu otopark adedi 20 ve üzeri olan yeni yapılarda en az bir elektrikli araç şarj ünitesi yapılması ve her 50 araç için bir şarj yeri ayrılması zorunludur.",
        "pratikteNeAnlamaGelir": "Yeni yapılan apartman ve sitelerin kapalı otoparkında elektrikli arabaların şarj edilebileceği trafo gücü, kablo tavası ve priz altyapısının müteahhitçe hazır teslim edilmesidir.",
        "kritikUyari": "Otoparkında elektrikli şarj altyapısı bulunmayan projeler belediyeden iskan ruhsatı alamaz.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Otopark Yönetmeliğinde Değişiklik Yapılmasına Dair Yönetmelik Madde 6 bent f.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=24328&MevzuatTur=7&MevzuatTertip=5"]
    },
    {
        "slug": "gece-serinletmesi-night-purge",
        "terim": "Gece Havalandırması (Night Purge)",
        "harf": "G",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Yaz aylarında gece serinleyen dış ortam havasının bina otomasyonu veya menfezler vasıtasıyla binaya çekilerek yapının termal kütlesinin soğutulması tekniğidir.",
        "hukukiKarsilik": "Binalarda Enerji Performansı ve yeşil mimari tasarım kılavuzlarında pasif soğutma yöntemi olarak önerilen enerji tasarrufu standardıdır.",
        "pratikteNeAnlamaGelir": "Gündüz duvarlara ve betonarme döşemelere hapsolan gündüz sıcağının gece serin hava akımıyla dışarı atılması, böylece ertesi gün klimanın çok daha az çalışmasıdır.",
        "kritikUyari": "Gece havalandırması yapılırken binanın hırsızlık ve yağmur güvenliğini sağlayacak motorlu kepenk ve menfez sensörleri devreye alınmalıdır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "CIBSE Binalarda Doğal Havalandırma ve Pasif Soğutma Tasarım Kılavuzları.",
        "kaynaklar": ["https://www.cibse.org"]
    },
    {
        "slug": "surdurulebilir-drenaj-sistemleri-suds",
        "terim": "Sürdürülebilir Drenaj Sistemleri (SuDS)",
        "harf": "S",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Şiddetli yağış anında sel ve su taşkınlarını önlemek amacıyla suyu kanalizasyona vermek yerine yağmur bahçeleri, göletler ve emici hendeklerle toprağa sızdıran sistemdir.",
        "hukukiKarsilik": "Kentsel Taşkın Yönetimi ve Su Tahsisi Mevzuatı kapsamında şehir altyapısına binen yükü azaltmak için teşvik edilen peyzaj mühendisliği çözümüdür.",
        "pratikteNeAnlamaGelir": "Site bahçelerinin tamamen betonla kaplanmayıp yağmur suyunu emen bitki hendekleri ve göletlerle donatılarak yeraltı su kaynaklarının beslenmesidir.",
        "kritikUyari": "Zeminin geçirgenlik katsayısı test edilmeden yapılan hendekler bina temelinin suya doymasına ve oturma yapmasına sebep olabilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Kentsel Drenaj ve Sürdürülebilir Su Yönetimi CIRIA Standartları.",
        "kaynaklar": ["https://csb.gov.tr"]
    },
    {
        "slug": "gecirimli-poroz-zemin-kaplamalari",
        "terim": "Geçirimli (Poroz) Zemin Kaplamaları",
        "harf": "G",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Açık otopark, yürüyüş yolları ve yangın yollarında kullanılan, suyu doğrudan altındaki çakıl tabakasına ve toprağa ileten gözenekli beton veya kilit taşıdır.",
        "hukukiKarsilik": "İmar mevzuatında tabii zemin ve açık alanların su geçirimsiz hale getirilmesini önlemek amacıyla çevre düzenleme projelerinde aranan kriterdir.",
        "pratikteNeAnlamaGelir": "Yağmur yağdığında otoparkta veya sitede su birikintisi ve çamur oluşmasını engelleyen, suyu anında sünger gibi emip toprağa aktaran kaplamadır.",
        "kritikUyari": "Gözeneklerin zamanla toprak ve tozla tıkanmaması için yılda bir kez basınçlı vakum süpürgeleri ile temizlenmesi gerekir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "TS 2824 EN 1338 Beton Parke Taşları ve Poroz Zemin Normları.",
        "kaynaklar": ["https://www.tse.org.tr"]
    },
    {
        "slug": "kentsel-isi-adasi-ve-albedo",
        "terim": "Kentsel Isı Adası Etkisi ve Albedo Değeri",
        "harf": "K",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Asfalt ve koyu renkli çatıların güneş ışığını emerek şehirlerin kırsal alanlara göre 3-8°C daha sıcak olmasına yol açan etki ve bunu önleyen açık renk yansıtıcılık (Albedo) ölçüsüdür.",
        "hukukiKarsilik": "Yeşil bina sertifikalarında (LEED/BREEAM) çatılarda ve sert zeminlerde SRI (Güneş Yansıtma İndeksi) yüksek açık renkli malzemelerin kullanılmasını zorunlu kılan kuraldır.",
        "pratikteNeAnlamaGelir": "Site otoparklarında ve çatılarda beyaz/açık renk malzeme kullanarak çevrenin fırın gibi ısınmasını engellemek ve klima sarfiyatını düşürmektir.",
        "kritikUyari": "Koyu siyah membranla kaplanan düz çatılarda yazın çatı yüzey sıcaklığı 70-80°C'ye ulaşarak altındaki daireyi cehenneme çevirir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "ASTM E1980 Güneş Yansıtma İndeksi (SRI) Hesaplama Standartları.",
        "kaynaklar": ["https://www.astm.org"]
    },
    {
        "slug": "gunisigi-faktoru-daylight-factor",
        "terim": "Günışığı Faktörü (Daylight Factor)",
        "harf": "G",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Kapalı bir odanın içindeki doğal aydınlık düzeyinin, aynı anda açık havadaki yatay günışığı düzeyine olan yüzde oranını gösteren mimari ışıma hesabıdır.",
        "hukukiKarsilik": "TS EN 17037 Binalarda Günışığı Standardı ve Planlı Alanlar İmar Yönetmeliği odaların doğrudan ışık alma zorunluluğudur.",
        "pratikteNeAnlamaGelir": "Gündüz saatlerinde evinizde veya ofisinizde yapay lamba yakmaya ihtiyaç duymadan rahatça kitap okuyabilme ve çalışabilme konforudur.",
        "kritikUyari": "Günışığı faktörü %2'nin altında kalan mekanlar basık, loş ve insan biyolojisi (sirkadiyen ritim) üzerinde depresif etkiye sahiptir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "TS EN 17037 Binalarda Günışığı Tasarım ve Değerlendirme Standartları.",
        "kaynaklar": ["https://www.tse.org.tr"]
    },
    {
        "slug": "well-bina-standardi",
        "terim": "WELL Bina Standardı",
        "harf": "W",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Binaların sadece enerji tasarrufuna değil, doğrudan içinde yaşayan insanların sağlığı, uykusu, beslenmesi ve psikolojik refahına odaklanan küresel sertifikadır.",
        "hukukiKarsilik": "International WELL Building Institute (IWBI) tarafından hava, su, beslenme, ışık, hareket, termal konfor, ses ve zihin kavramları üzerinden verilen bağımsız derecelendirmedir.",
        "pratikteNeAnlamaGelir": "Bir binada musluktan içilebilir arıtılmış su akması, çalışanların biyolojik saatine uyumlu sirkadiyen aydınlatma bulunması ve ergonomik çalışma ortamı sunulmasıdır.",
        "kritikUyari": "Uluslararası teknoloji ve finans devleri genel müdürlük binalarını kiralarken WELL sertifikalı binaları birinci öncelik olarak şart koşmaktadır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "International WELL Building Institute (IWBI) v2 Standartları.",
        "kaynaklar": ["https://www.wellcertified.com"]
    },
    {
        "slug": "edge-sertifikasi",
        "terim": "EDGE Sertifikası (IFC)",
        "harf": "E",
        "kategori": "Gayrimenkul Değerleme ve Finans",
        "kisaTanim": "Dünya Bankası Grubu üyesi IFC tarafından geliştirilen; enerji, su ve malzeme gömülü enerjisinde en az yüzde yirmi tasarruf sağlayan binalara verilen sertifikadır.",
        "hukukiKarsilik": "Uluslararası Finans Kurumu (IFC) yeşil bina finansmanı kriteri olup düşük karbonlu inşaat yatırımlarına uluslararası uygun faizli kredi kapısını açan tescildir.",
        "pratikteNeAnlamaGelir": "Müteahhitlerin ve yatırımcıların karmaşık süreçlere girmeden binalarını hızlı ve ekonomik şekilde yeşil sertifikalandırmasını sağlayan sistemdir.",
        "kritikUyari": "Uluslararası kalkınma bankalarından yeşil bina kredisi temin etmek için EDGE sertifikası ön koşul olarak aranmaktadır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "IFC EDGE (Excellence in Design for Greater Efficiencies) Standartları.",
        "kaynaklar": ["https://edgebuildings.com"]
    },
    {
        "slug": "yesil-kira-sozlesmesi-green-lease",
        "terim": "Yeşil Kira Sözleşmesi (Green Lease)",
        "harf": "Y",
        "kategori": "Kira ve Tahliye",
        "kisaTanim": "Mülk sahibi ile kiracının binanın enerji, su ve atık tüketimini azaltmak ve sürdürülebilirlik verilerini paylaşmak üzere karşılıklı yükümlülük üstlendiği özel kira sözleşmesidir.",
        "hukukiKarsilik": "Türk Borçlar Kanunu kira hükümleri çerçevesinde özel şartlarla düzenlenen ve tarafların çevresel performans hedeflerine uymasını bağlayıcı kılan akittir.",
        "pratikteNeAnlamaGelir": "Kiracının çöplerini ayrıştırmayı, enerji tasarruflu cihazlar kullanmayı kabul ettiği; mülk sahibinin ise binanın yeşil sertifikasını korumayı taahhüt ettiği modern kiralama modelidir.",
        "kritikUyari": "Yeşil kira hükümlerine uyulmaması halinde sözleşmede belirlenen cezai şartlar veya enerji verimsizliği tazminatları talep edilebilir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Türk Borçlar Kanunu Madde 299 vd. ve Kurumsal Gayrimenkul Yeşil Kira Kılavuzları.",
        "kaynaklar": ["https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1&MevzuatTertip=5"]
    },
    {
        "slug": "enerji-performans-sozlesmesi-esco",
        "terim": "Enerji Performans Sözleşmesi (EPS / ESCO)",
        "harf": "E",
        "kategori": "Gayrimenkul Değerleme ve Finans",
        "kisaTanim": "Bir enerji hizmet şirketinin (ESCO) binadaki yalıtım ve mekanik yenileme yatırımlarını finanse ettiği ve masrafını sağlanan fatura tasarrufundan tahsil ettiği sözleşmedir.",
        "hukukiKarsilik": "5627 sayılı Enerji Verimliliği Kanunu Madde 9 ve Kamu Binalarında Enerji Performans Sözleşmelerine İlişkin Usul ve Esaslar ile yasal altyapısı kurulan finansman modelidir.",
        "pratikteNeAnlamaGelir": "Site sakinlerinin veya bina sahibinin cebinden tek kuruş peşin para çıkmadan binanın mantolanması veya ısı pompasının kurulması; yatırımın faturadaki düşüşle 5-10 yılda kendini ödemesidir.",
        "kritikUyari": "Sözleşmede taahhüt edilen enerji tasarruf oranına ulaşılamazsa aradaki maddi farkı sözleşme gereği ESCO şirketi bina yönetimine ödemekle yükümlüdür.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "5627 sayılı Kanun Madde 9 ve Cumhurbaşkanlığı Kararı 2020/2929.",
        "kaynaklar": ["https://enerji.gov.tr"]
    },
    {
        "slug": "yesil-konut-kredisi-green-mortgage",
        "terim": "Yeşil Konut Kredisi (Green Mortgage)",
        "harf": "Y",
        "kategori": "Gayrimenkul Değerleme ve Finans",
        "kisaTanim": "Enerji Kimlik Belgesi A veya B sınıfı olan ya da yeşil bina sertifikasına sahip konutları satın alan tüketicilere bankalarca sağlanan indirimli faizli konut kredisidir.",
        "hukukiKarsilik": "Bankacılık Düzenleme ve Denetleme Kurumu (BDDK) Sürdürülebilir Bankacılık Stratejik Planı kapsamında yeşil varlıkların finansmanına yönelik teşvik mekanizmasıdır.",
        "pratikteNeAnlamaGelir": "Enerji tasarruflu bir ev aldığınızda standart konut kredisi faiz oranına göre daha düşük faiz, daha yüksek kredi tutarı (LTV) ve daha düşük dosya masrafı avantajı elde etmenizdir.",
        "kritikUyari": "Kredi başvurusu sırasında gayrimenkul değerleme uzmanının hazırladığı ekspertiz raporunda EKB sınıfının ve yeşil sertifikanın açıkça teyit edilmiş olması şarttır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "BDDK Sürdürülebilir Bankacılık İlkeleri ve Yeşil Finansman Kılavuzları.",
        "kaynaklar": ["https://www.bddk.org.tr"]
    },
    {
        "slug": "bina-sokum-plani-deconstruction",
        "terim": "Döngüsel Bina Söküm Planı (Deconstruction)",
        "harf": "D",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Bir yapının ömrü tükendiğinde kırılarak moloz haline getirilmesi yerine, çelik, ahşap, tuğla ve pencerelerinin sökülerek yeniden kullanılması için hazırlanan mühendislik planıdır.",
        "hukukiKarsilik": "Binaların Yıkılması Hakkında Yönetmelik ve Sıfır Atık Yönetmeliği uyarınca inşaat ve yıkıntı atıklarının kaynağında ayrıştırılması ve geri kazanımı esastır.",
        "pratikteNeAnlamaGelir": "Eski binayı patlatıp çevreye toz saçmak yerine adeta lego gibi parçalarına ayırarak yapı malzemelerinin %80'ini ikinci el piyasasına veya geri dönüşüme kazandırmaktır.",
        "kritikUyari": "Söküm öncesinde binada asbest ve tehlikeli atık envanteri raporu hazırlanması ve uzmanlarca temizlenmesi yasal bir zorunluluktur.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "Binaların Yıkılması Hakkında Yönetmelik ve Sıfır Atık Yönetmeliği hükümleri.",
        "kaynaklar": ["https://csb.gov.tr"]
    },
    {
        "slug": "karbon-notr-gayrimenkul",
        "terim": "Karbon Nötr Gayrimenkul",
        "harf": "K",
        "kategori": "Gayrimenkul Değerleme ve Finans",
        "kisaTanim": "Yapım ve işletme süreçlerindeki kaçınılmaz sera gazı salımlarının, yenilenebilir enerji üretimi ve sertifikalı karbon dengeleme (carbon offset) projeleriyle sıfırlandığı taşınmazdır.",
        "hukukiKarsilik": "Sera Gazı Emisyonlarının Takibi Hakkında Yönetmelik ve Küresel Sera Gazı Protokolü (GHG Protocol) standartlarına dayalı sıfır net emisyon tescilidir.",
        "pratikteNeAnlamaGelir": "Doğaya hiçbir ilave net karbon yükü getirmeyen, küresel ısınmaya etkisi sıfır olan ve gelecekteki karbon vergilerinden muaf tutulan en üst seviye gayrimenkuldür.",
        "kritikUyari": "Karbon nötrlük iddiasının Gold Standard veya Verra gibi uluslararası bağımsız akredite kurumlarca tescillenmiş olması gerekir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "GHG Protocol Kurumsal Muhasebe ve Raporlama Standardı.",
        "kaynaklar": ["https://ghgprotocol.org"]
    },
    {
        "slug": "gayrimenkulde-esg-kriterleri",
        "terim": "Gayrimenkulde ESG Kriterleri",
        "harf": "G",
        "kategori": "Gayrimenkul Değerleme ve Finans",
        "kisaTanim": "Taşınmaz yatırımlarının Çevresel (Environmental), Sosyal (Social) ve Kurumsal Yönetişim (Governance) boyutlarındaki performansını ölçen küresel yatırım filtresidir.",
        "hukukiKarsilik": "SPK Sürdürülebilirlik İlkeleri Uyum Çerçevesi ve GRESB (Global Real Estate Sustainability Benchmark) küresel gayrimenkul sürdürülebilirlik ölçütleridir.",
        "pratikteNeAnlamaGelir": "Yatırım yapılacak bir binanın sadece kira getirisine değil; çevreye saygısına, çalışan ve sakin haklarına, şeffaf ve denetlenebilir yönetim yapısına bakılmasıdır.",
        "kritikUyari": "ESG kriterlerine uymayan gayrimenkul şirketleri ve portföyler uluslararası kurumsal fonlardan ve bankalardan finansman bulmakta büyük güçlük çekmektedir.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "SPK Sürdürülebilirlik Raporlama İlkeleri ve GRESB Benchmark Kriterleri.",
        "kaynaklar": ["https://spk.gov.tr"]
    },
    {
        "slug": "bina-mikrosebekesi-microgrid",
        "terim": "Bina Akıllı Enerji Mikroşebekesi (Microgrid)",
        "harf": "B",
        "kategori": "İnşaat ve Mimarlık",
        "kisaTanim": "Güneş paneli, jeneratör ve bataryalı enerji depolama sistemlerini merkezi şebekeden bağımsız olarak yöneten akıllı yerel elektrik ağıdır.",
        "hukukiKarsilik": "EPDK Elektrik Piyasasında Depolama Faaliyetleri Yönetmeliği uyarınca binaların ürettikleri yenilenebilir enerjiyi depolamasına ve yönetmesine imkan veren mevzuattır.",
        "pratikteNeAnlamaGelir": "Şehir şebekesinde elektrik kesilse veya voltaj dalgalansa dahi sitenin kendi ürettiği ve bataryasında depoladığı enerjiyi kullanarak kesintisiz yaşam sunmasıdır.",
        "kritikUyari": "Lityum-iyon batarya depolama odalarında gaz algılama, aerosol yangın söndürme ve özel havalandırma standartları harfiyen uygulanmalıdır.",
        "guncellemeTarihi": "2026-03-01",
        "kapsamNotu": "EPDK Depolama Yönetmeliği ve Binaların Yangından Korunması Hakkında Yönetmelik.",
        "kaynaklar": ["https://www.epdk.gov.tr"]
    }
]

if __name__ == "__main__":
    write_package("data_ultra_33.py", "ULTRA_TERIMLER_33", TERIMLER_33, "Ultra 33", "Yeşil Binalar, Sürdürülebilirlik ve Enerji Standartları")
