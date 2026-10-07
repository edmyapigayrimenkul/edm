# İlan kategori ve alan envanteri

Tarih: 18 Eylül 2026  
Son güncelleme: 5 Ekim 2026

## Mevcut kapsama

Form ve ilan detay sayfası aynı `ilan-bilgileri.ts` şemasını kullanıyor. Bu,
formda kaydedilen halka açık bir alanın detay sayfasında ayrı kod yazmadan doğru
başlık altında gösterilmesini sağlıyor.

| Grup | Alt tür | Teknik alan | Nitelik | İşlem türleri |
|---|---:|---:|---:|---|
| Konut | 12 | 41 | 149 | satılık, kiralık, günlük, sezonluk; daire/villa için devren satılık |
| Arsa ve arazi | 10 | 34 | 35 | satılık, kiralık, kat karşılığı satılık |
| İş yeri | 102 | 52 | 56 | satılık, kiralık, devren satılık/kiralık; alt türler işleme göre filtrelenir |
| Komple bina | 5 | 27 | 17 | satılık, kiralık |
| Turistik tesis | 7 | 33 | 53 | satılık, kiralık, günlük, sezonluk, devren |
| Proje | 4 | 28 | 22 | satılık |

Toplam 140 alt mülk türü, 215 kategoriye özel teknik alan ve 332 nitelik var. Bunlara ortak başlık, fiyat, para birimi, açıklama,
konum, danışman, yetki, kesin/özel konum, portal numaraları, video/sanal tur ve
50 fotoğraf akışı ayrıca ekleniyor.

## Doğrulanmış güçlü bölüm

Satılık villa, kullanıcının Sahibinden Ofisim ekran görüntüleriyle karşılaştırıldı.
Temel bilgiler, cephe, iç/dış özellikler, muhit, ulaşım, manzara, konut tipi,
engelli/yaşlı erişimi, fotoğraf, konum ve yönetim içi yetki alanları temsil ediliyor.

## 19 Eylül Sahibinden ekranlarıyla tamamlanan ikinci tur

- Satılık konut listesi Sahibinden sırasındaki daire, rezidans, müstakil ev, villa,
  çiftlik evi, köşk/konak, yalı, yalı dairesi, yazlık ve kooperatifi kapsıyor. Köy evi
  ve prefabrik ev mevcut kapsama olarak korunuyor.
- Devren satılık konutta yalnız daire ve villa gösteriliyor.
- İş yerinde fiziksel taşınmaz ile devren işletme ayrıldı. Paylaşılan A–Z ekranlardaki
  acenteden züccaciyeye 83 devren seçenek temsil ediliyor; satılık/kiralık fiziksel
  katalogla birlikte şemada 99 iş yeri alt türü bulunuyor.
- Devren restoran/lokanta şablonunda masa ve kişi kapasitesi; iş yerlerinde bölüm/oda,
  bina yaşı ve ısıtma zorunluluğu eklendi.
- Kat karşılığı arsa ayrı işlem türü oldu. Bu akışta fiyat ve para birimi istenmiyor;
  ilan kartı ve detayda bedel “Kat karşılığı” olarak gösteriliyor.
- Komple bina şablonunda bir kattaki daire sayısı, ısıtma, asansör, otopark ve bina yaşı;
  otelde açık alan, kat, bina yaşı, yıldız sınıfı, oda tipleri, yapı ve tapu durumu
  yapılandırılmış alanlara dönüştürüldü.
- Sahibinden'deki altyapı, konum, genel özellik, manzara ve benzeri açılır gruplar arsa,
  iş yeri, bina ve turistik tesis kataloglarına genişletildi.

Tarayıcı kabulü: kat karşılığı akışında fiyat alanı gizli, devre dışı ve zorunlu değil;
özet “Kat karşılığı”. Devren konutta seçenekler yalnız Daire/Villa. Devren iş yerinde
83 seçenek ve Eczane, Restoran & Lokanta, Züccaciye uç örnekleri mevcut. Restoran masa
ve kişi kapasitesi; otelde açık alan, kat, yaş, oda, yıldız, oda tipi, yapı ve tapu
alanları görünür. Tarayıcı konsolunda hata yok.

## 23 Eylül açık kaynakla tamamlanan üçüncü tur

Sahibinden Ofisim ekranı oturum gerektirse de, herkese açık kategori, ilan ve yardım
sayfaları alan ailelerini doğrulamak için yeterli referans veriyor. Bu turda yeni
ekran görüntüsü beklenmeden aşağıdaki şema genişletildi:

- Konut projesi: satış ve teslim durumu, tarihli teslim kuralı, blok sayısı, toplam
  ünite, konut/ticari dağılımı, satıştaki ünite, planlar ve satış ofisi eklendi.
  Satıştaki ünite toplamı ile konut/ticari toplamları sunucuda kontrol edilir.
- İş yeri: depo, fabrika, imalathane ve benzerlerinde tavan yüksekliği, trifaze/
  elektrik gücü, yükleme rampası ve yük asansörü; mağaza ailelerinde vitrin genişliği;
  yiyecek–içecek işletmelerinde ruhsat/baca ve masa/kişi kapasitesi yalnız ilgili
  türlerde görünür ve kayda alınır.
- Proje olanakları ile ulaşım nitelikleri, proje kartlarında doğru kalemler halinde
  gösterilmek üzere genişletildi.
- Açık akaryakıt istasyonu listelerindeki pompa sayısı, `akaryakit-istasyonu`
  türünde zorunlu; apart otel listelerindeki apart sayısı ise `apart-otel` türünde
  zorunlu alan haline getirildi.
- Portal önizleme sözlüğü, seçili alt türün kullanmadığı alanları da filtreliyor.
  Bu nedenle otel aktarımında kamp ünitesi; kamp alanı aktarımında oda/yıldız gibi
  ilgisiz alanlar görünmez.

Açık kaynak notları ve bağlantılar:
[2026-09-23-acik-kaynak-ilan-alani-notlari.md](./2026-09-23-acik-kaynak-ilan-alani-notlari.md)

## Alt tür mimarisi

Şema artık mülk grubunun yanında alt türe göre de alan açıp kapatabiliyor. Form,
sunucu doğrulaması ve ilan detayındaki künye aynı `tipler` koşulunu kullanıyor;
gizlenen alanlar kayda alınmıyor. İlk somut ayrım turistik tesiste yapıldı: kamp
alanı için toplam kamp ünitesi, çadır ve karavan kapasitesi gösterilirken otel oda
sayısı ve yıldız sınıfı gösterilmiyor. Otelde bu davranış tersine dönüyor.

## Kalan doğrulama

Alt tür ailesi, form, sunucu kaydı, detay künyesi ve portal önizlemesi artık aynı
koşullu şemayı kullanıyor. Açık kaynaklar çalışma için yeterlidir; kullanıcıdan ekran
görüntüsü istenmesi gerekmiyor. İleride Ofisim hesabındaki güncel zorunluluk veya
portalın özel alan adı değiştirilirse, yalnız ilgili bölümün kişisel veri içermeyen
görüntüsü son kontrol için kullanılabilir.

## 29 Eylül taksonomi çapraz kontrolü

Herkese açık Sahibinden devren iş yeri kategori sayfasında Fatura Merkezi, İş Hanı,
Sinema & Konferans Salonu ve Kır & Kahvaltı Bahçesi gibi türler; Araç Showroom & Servis,
Eczane & Medikal, Etkinlik & Performans Salonu ve Öğrenci Yurdu etiketleri görülüyor.
Katalog bu adlarla güncellendi; daha önce kaydedilmiş değerleri bozmamak için var olan
slug anahtarları korundu. Fatura Merkezi, İş Hanı ve Sinema & Konferans Salonu yeni
devren türler olarak eklendi. Kaynak sayfa yaklaşık 10 ay önce taranmış ve herkese açık
ilan filtrelerini gösteriyor; formun oturum arkasındaki zorunlu alanlarını kanıtlamıyor.
İlan filtresinde görülen Kat Kaloriferi ve Merkezi ısıtma seçenekleri de ortak ısıtma
kataloğuna eklendi. Eski kombi ve Fan Coil kayıt değerleri korunurken görünen etiketler
Sahibinden adlarıyla eşleşti.

### Açık ilan filtreleriyle alan çapraz kontrolü

- Akaryakıt istasyonu ilanlarında Açık Alan m², Kapalı Alan m², Pompa Sayısı,
  Günlük Satış (L) ve Tapu Durumu filtreleri görülebiliyor. Bizde açık/kapalı alan
  ve tapu alanları vardı; Pompa Sayısı zorunluydu ve en az 1 istiyordu. Sahibinden
  filtresinde “Yok” seçeneği de bulunduğundan bu kural mantıksızdı. Pompa sayısı
  0 veya boş kabul edilecek şekilde düzeltildi; günlük satış alanı `L/gün` birimiyle
  yalnız akaryakıt istasyonuna eklendi. İki alan da isteğe bağlı; doğrulanmayan ticari
  performans verisi uydurmaya zorlanmıyor.
- Restoran/lokanta ilan filtresinde Masa Sayısı, Kişi Kapasitesi, Isıtma ve Tapu
  Durumu görünüyor. Masa ve kapasite alanları mevcut. Isıtma ve tapu, iş yeri ortak
  alanlarında zaten mevcut. Bu kaynak yalnız ilan arama filtrelerini gösterdiğinden,
  bunların Ofisim ilan verme ekranında zorunlu olduğunu varsaymadık.
- Spor tesisi filtrelerinde Spor Salonu, Halı & Çim Saha, Komple Tesis ve Yarış Pisti
  seçenekleri var. Daha önce bu ayrım yapılandırılmış değildi; spor tesisi türü alanı
  yalnız bu alt tür için eklendi.
- İnternet & Oyun Kafe filtresinde ayrı bir Kapasite aralığı var. Türe özel sayı alanı
  eklendi; kaynak birimi açıklamadığı için alan isteğe bağlı ve birimsiz. Kullanıcıyı
  “kişi” veya “bilgisayar” gibi desteklenmeyen bir birime yönlendirmiyor.
- Öğrenci yurdu filtrelerinde Oda Sayısı ve Yatak Sayısı ayrı ayrı var. Yatak sayısı
  daha önce yoktu; iki alan yalnız öğrenci yurdu türüne eklendi. Genel iş yeri
  “Bölüm / Oda Sayısı” alanını bütün ticari türlerde zorunlu istemek de aşırı geneldi;
  artık önerilen/isteğe bağlı.
- Depo & Antrepo filtresindeki Giriş Yüksekliği (m), tavan yüksekliğinden farklıdır.
  Depo türüne ayrı ve isteğe bağlı alan eklendi. Depo için önceden bulunan Tavan
  Yüksekliği alanı korunuyor.
- Otopark/Garaj filtrelerinde Araç Kapasitesi var ve şemada eksikti. Otopark ile Garaj
  & Park Yeri türlerinde isteğe bağlı araç kapasitesi alanı eklendi; mevcut Kat Sayısı
  alanı da ilan filtresindeki kat sayısını karşılıyor.
- Eczane & Medikal açık filtrelerinde bina yaşı, ısıtma, krediye uygunluk ve tapu durumu
  görünüyor. Bunlar iş yeri ortak alanlarında zaten yer aldığından eczaneye özel teknik
  alan eklemedik.
- Düğün salonu filtresinde Masa Sayısı ve Kişi Kapasitesi bulunuyor; kişi kapasitesi
  vardı, masa sayısı tür eşleşmesine eklendi.
- Sahibinden'in açık liste sayfaları kategori adlarını ve arama filtrelerini kanıtlar;
  oturum arkasındaki ilan giriş alanlarını/zorunluluklarını kanıtlamaz. Dolayısıyla
  yeni alanlar isteğe bağlı ve teyitli veri girişini destekleyen alanlar olarak eklendi.

Kaynaklar:

- [Devren satılık akaryakıt istasyonu filtreleri](https://www.sahibinden.com/devren-satilik-is-yeri-akaryakit-istasyonu)
- [Devren restoran/lokanta filtreleri](https://www.sahibinden.com/devren-satilik-is-yeri-restoran-lokanta)
- [Devren spor tesisi filtreleri](https://www.sahibinden.com/devren-satilik-is-yeri-spor-tesisi/istanbul-avcilar-avcilar-cihangir-mah.)
- [Devren internet/oyun kafe kapasite filtresi](https://www.sahibinden.com/devren-satilik-is-yeri-internet-oyun-kafe/bursa-mustafakemalpasa-mustafakemalpasa)
- [Devren öğrenci yurdu oda/yatak filtreleri](https://www.sahibinden.com/devren-satilik-is-yeri-ogrenci-yurdu/istanbul-atasehir-yeni-sahra)
- [Depo & Antrepo giriş yüksekliği filtresi](https://www.sahibinden.com/satilik-is-yeri-depo-antrepo/kiel)
- [Düğün salonu masa/kişi kapasitesi filtreleri](https://www.sahibinden.com/devren-satilik-is-yeri-dugun-salonu/aydin-didim)
- [Otopark araç kapasitesi filtresi](https://www.sahibinden.com/devren-satilik-is-yeri-otopark-garaj/istanbul-kadikoy-moda)
- [Eczane/medikal ortak filtreleri](https://www.sahibinden.com/devren-satilik-is-yeri-eczane-medikal/istanbul-beykoz-beykoz-merkez-mah.)

- [Devren Pet Shop ilan ve kategori listesi](https://www.sahibinden.com/devren-satilik-is-yeri-pet-shop/ankara-kecioren-etlik-incirli-asagi-eglence-mh.)
- [Devren Muayenehane ilan ve kategori listesi](https://www.sahibinden.com/devren-satilik-is-yeri-muayenehane/van-ipekyolu-merkez-esenler-mah.)

## 30 Eylül 2026 — Oda düzeni ve ortak alan zorunluluğu

- [Anaokulu & Kreş](https://www.sahibinden.com/devren-satilik-is-yeri-anaokulu-kres/aksaray-merkez),
  [Ofis & Büro](https://www.sahibinden.com/devren-satilik-is-yeri-buro-ofis/istanbul)
  ve [Kuaför & Güzellik Merkezi](https://www.sahibinden.com/devren-satilik-is-yeri-kuafor-guzellik-merkezi/sahibinden)
  açık filtrelerinde `Oda Sayısı` 1+… planları gösteriyor. Bu üç portal grubu bizim
  şemadaki Anaokulu & Kreş, Ofis & Büro, Güzellik Merkezi ve Kuaför & Berber olmak
  üzere dört alt türe eşlendi; isteğe bağlı oda düzeni seçimi eklendi. Bu, iş yeri
  genelindeki sayısal bölüm sayısından farklıdır. Seçim listesi kaynaklardaki
  seçeneklerin birleşimidir.
- Aynı sayfalarda bina yaşı ve ısıtma filtreleri görünse de, arama filtresi ilan
  girişinde zorunluluk kanıtı değildir. Bu iki alan tüm iş yeri türlerinde zorunlu
  olmaktan çıkarılıp önerilen/isteğe bağlı yapıldı; ısıtma için `Yok` seçeneği var.
- İş yeri alan kataloğu 44'e, tüm kategorilerin teknik alan sayısı 207'ye yükseldi.
  Tipe özel alanı olmayan iş yeri türü 61/102 olarak hesaplandı; bu yalnızca tür
  kapsamlı alanları sayar, ortak alanların ilgisiz olduğunu göstermez.

Bu örneklem, tüm alt türlerin alan incelemesini tamamlamıyor; EDM-068 kapsamında farklı
işletme türlerinin açık filtreleriyle taramaya devam edilecek. Portal entegrasyonu ayrı
bir doğrulama gerektirir: her portalın resmî aktarım API sözleşmesi ve hesap yetkisi
olduğunda aynı sözlükteki alanların gerçekten gönderildiği uçtan uca doğrulanacaktır.

## 30 Eylül 2026 — Eğitim, sağlık ve tesis türleri

- [Okul ve kurs ilanları](https://www.sahibinden.com/devren-satilik-is-yeri-okul-kurs)
  filtresinde Derslik Sayısı bulunuyor. İsteğe bağlı `Derslik Sayısı` alanı Okul ve
  Kurs & Eğitim Merkezi alt türlerine eklendi.
- [Fabrika / üretim tesisi ilanları](https://www.sahibinden.com/satilik-is-yeri-fabrika-uretim-tesisi?address_region=1)
  Bina Adedi ve Giriş Yüksekliği filtrelerini gösteriyor. Fabrika için isteğe bağlı
  `Bina Adedi` ve `Giriş Yüksekliği` alanları tanımlandı; mevcut Tavan Yüksekliği alanı
  endüstriyel giriş açıklığıyla aynı kavram olmadığından ayrı tutuldu.
- [Muayenehane ilanlarında](https://www.sahibinden.com/devren-satilik-is-yeri-muayenehane/istanbul-gungoren)
  Oda Sayısı planları 1+1, 2+1, 2+2, 3+1, 3+2, 4+1, 4+2 ve 5+ olarak listeleniyor.
  Bu seçenekler Muayenehane için isteğe bağlı `Oda Sayısı` alanına eklendi.
- [Sinema ve konferans salonu ilanlarında](https://www.sahibinden.com/devren-satilik-is-yeri-sinema-konferans-salonu/istanbul)
  Kapasite ve Tavan Yüksekliği filtreleri görülüyor. Şemadaki kişi kapasitesi ve tavan
  yüksekliği alanlarının kapsamı bu alt türe genişletildi.
- [Huzurevi ilanı](https://www.sahibinden.com/devren-satilik-is-yeri-huzur-evi/istanbul)
  örneklemesindeki m², bina yaşı, ısıtma, kredi ve tapu bilgileri ortak alanlarla zaten
  karşılanıyor. Kaynakta ayrı doğrulanabilir bir yatak/kişi kapasitesi filtresi
  görülmediğinden bu turda kapasite alanı tahmin edilerek eklenmedi.
- Ek kontrol: [Oto Servis & Bakım](https://www.sahibinden.com/devren-satilik-is-yeri-oto-servis-bakim/istanbul-sancaktepe-samandira-eyup-sultan-mh.),
  [Sağlık Merkezi](https://www.sahibinden.com/devren-satilik-is-yeri-saglik-merkezi/sakarya),
  [Fatura Merkezi](https://www.sahibinden.com/devren-kiralik-is-yeri-fatura-merkezi/antalya-manavgat),
  [Market](https://www.sahibinden.com/devren-satilik-is-yeri-market) ve
  [Nakliyat & Kargo](https://www.sahibinden.com/devren-satilik-is-yeri-nakliyat-kargo/istanbul-basaksehir)
  filtrelerinde bu örneklemde yeni türe özel nitelik doğrulanmadı; gösterilen m², ısıtma,
  kredi/tapu ve kullanım bilgileri ortak alanlarla karşılanıyor. [Öğrenci Yurdu](https://www.sahibinden.com/devren-satilik-is-yeri-ogrenci-yurdu/istanbul-atasehir-yeni-sahra)
  filtresindeki Oda Sayısı ve Yatak Sayısı önceki turda eklenen kategori alanlarıyla
  eşleşiyor.
- [SPA, Hamam & Sauna](https://www.sahibinden.com/devren-satilik-is-yeri-spa-hamam-sauna/batman)
  filtresi Cinsiyet (Kadın, Erkek, Üniseks) ve Kişi Kapasitesi gösteriyor. İsteğe bağlı
  hizmet verilen cinsiyet alanı eklendi; mevcut kişi kapasitesi alanı bu türe açıldı.
  Araç Showroom & Servis filtresinde m² ve tapu gibi ortak alanlar dışında ayrı bir ilan
  niteliği doğrulanmadı; “Vitrin” ifadesi kategori vitrin listesini anlattığı için Vitrin
  Genişliği alanına kanıt sayılmadı.
- [Gece Kulübü & Disko](https://www.sahibinden.com/devren-kiralik-is-yeri-gece-kulubu-disko/gumushane)
  için Kişi Kapasitesi filtresi mevcut kapasite alanıyla eşleştirildi ve kapsamı bu türe
  açıldı. [Maden Ocağı](https://www.sahibinden.com/satilik-is-yeri-maden-ocagi/sakarya-kaynarca)
  filtresinde Ruhsat Durumu (Var/Yok) var; bu, yapı ruhsatı ya da gıda işletme ruhsatından
  farklı olduğundan isteğe bağlı Maden İşletme Ruhsatı alanı tanımlandı.
- [Pet Shop](https://www.sahibinden.com/devren-satilik-is-yeri-pet-shop/istanbul-umraniye-merkez-yamanevler-mh.),
  [Çiftlik](https://www.sahibinden.com/devren-satilik-is-yeri-ciftlik/cankiri) ve
  [Kuyumcu](https://www.sahibinden.com/devren-satilik-is-yeri-kuyumcu/balikesir-bandirma)
  örneklerinde m²/açık-kapalı alan ve ısıtma/tapu ortak şemayla karşılanıyor; çiftlik
  kapasitesi bir filtre alanı yerine ilan açıklama başlığında geçtiğinden ayrı kapasite
  alanı eklenmedi. [Halı Yıkama](https://www.sahibinden.com/devren-satilik-is-yeri-hali-yikama/afyonkarahisar)
  örneklerinde de kategori filtresi ekipman/makine sayısı göstermiyor; ilan başlıkları
  tek başına alan eklemek için yeterli kanıt sayılmadı.
- [Enerji Santrali](https://www.sahibinden.com/satilik-is-yeri-enerji-santrali/afyonkarahisar)
  filtrelerinde biyokütle/biyogaz, güneş, hidroelektrik, jeotermal, rüzgâr ve termik
  santral türleri listeleniyor. Bu seçenekler yalnız Enerji Santrali alt türünde isteğe
  bağlı `Santral Türü` alanına eklendi. Elektrik gücü alanı mevcut; ilan filtresi kW
  cinsinden kurulu güç göstermediği için ayrıca güç alanı veya zorunluluk eklenmedi.
- [Pazar Yeri](https://www.sahibinden.com/satilik-is-yeri-pazar-yeri/ankara),
  [Sebze & Meyve Hali](https://www.sahibinden.com/devren-satilik-is-yeri-sebze-meyve-hali/istanbul-kadikoy)
  ve [Pet Shop](https://www.sahibinden.com/devren-satilik-is-yeri-pet-shop/istanbul-fatih-akdeniz-iskenderpasa-mh.)
  örneklerinde kategoriye özel arama filtresi m² ile sınırlı; yeni alan gerekmedi.
  Pazar yeri başlıklarında geçen “tahta/tezgâh” sayısı filtre alanı olarak sunulmadığından
  ayrı zorunlu alan eklenmedi.
- [Taksi Durağı](https://www.sahibinden.com/devren-satilik-is-yeri-taksi-duragi/tokat-merkez-merkez)
  açık filtreleri m², ısıtma, kredi uygunluğu ve tapu gibi ortak taşınmaz alanlarıyla
  sınırlı. Ancak kategori sonuç başlıklarında durak hissesi, ticari plaka ve araçla devir
  örnekleri görülüyor. Bunlar portal filtresi değil, devir kapsamı bilgisidir; bu nedenle
  uygulamaya isteğe bağlı `Devredilen Hak ve Varlıklar` çoklu seçimi ve `Durak Hisse Payı`
  alanı eklendi. Yalnız sözleşmede teyit edilen kalemleri yazmaya yönlendiren yardım metni
  var; bu alanlar Sahibinden alanı ya da zorunluluğu olarak sunulmuyor.
- [Kırtasiye](https://www.sahibinden.com/devren-satilik-is-yeri-kirtasiye/istanbul-fatih-sehremini)
  filtresindeki m² ve tapu durumu ortak şemada mevcut. [Market](https://www.sahibinden.com/devren-satilik-is-yeri-market)
  filtresindeki m², ısıtma ve tapu durumu da ortak alanlarla karşılanıyor; bu türlere
  özel stok/raf veya ekipman sayısı alanı kaynak filtresinde görülmedi.
- Ek çapraz kontrol: [Akaryakıt İstasyonu](https://www.sahibinden.com/devren-satilik-is-yeri-akaryakit-istasyonu)
  filtresi açık ve kapalı alanın yanında Pompa Sayısı ile Günlük Satış (L) gösteriyor;
  şemadaki aynı adlı isteğe bağlı alanlar bunları karşılıyor. Günlük satış alanı L/gün
  birimiyle tutuluyor. [Butik Otel](https://www.sahibinden.com/satilik-butik-otel/istanbul-kadikoy-moda)
  ve [Pansiyon](https://www.sahibinden.com/satilik-pansiyon/aydin-kusadasi-kusadasi/sahibinden)
  örneklerinde Oda Sayısı, Yatak Sayısı, Kat Sayısı, Bina Yaşı, Açık Alan ve Kapalı Alan
  filtreleri görüldü; konaklama alt türü şemasındaki oda/yatak/kat/yaş ve açık/kapalı alan
  alanları bu bilgileri karşılıyor. Bu örneklerde ayrıca kategoriye özel yeni alan
  eklenmedi.
- [Düğün Salonu](https://www.sahibinden.com/devren-satilik-is-yeri-dugun-salonu/istanbul-bakirkoy)
  ve [Restoran & Lokanta](https://www.sahibinden.com/devren-satilik-is-yeri-restoran-lokanta)
  filtrelerinde Isıtma, Masa Sayısı ve Kişi Kapasitesi bulunuyor. Isıtma seçenekleri ortak
  iş yeri alanında; masa ve kişi sayısı alanları ilgili işletme türlerine bağlı. [Eczane &
  Medikal](https://www.sahibinden.com/devren-satilik-is-yeri-eczane-medikal/ankara-cankaya-merkez)
  örneklerinde m² dışında yeni bir kategori filtresi doğrulanmadı.
- Şema bütünlüğü kontrolü, öğrenci yurdu oda ve yatak sayısı alanlarının yanlış alt tür
  kimliğine (`ogrenci-yurdu`) bağlı olduğunu saptadı. Katalogdaki gerçek kimlik `yurt`
  olarak düzeltildi; böylece alanlar yalnız Öğrenci Yurdu formunda görünür. Geçerli tip
  kimlikleriyle yeniden sayımda tür-özel alanı olmayan tür sayısı 53'ten 52'ye indi.
- Ek örneklemde [Kuaför & Güzellik Merkezi](https://www.sahibinden.com/devren-satilik-is-yeri-kuafor-guzellik-merkezi/istanbul)
  m², oda sayısı, bina yaşı ve ısıtma filtreleri gösteriyor. Oda düzeni mevcut ilgili
  kuaför/güzellik alt türü alanıyla, m²/yaş/ısıtma ortak alanlarla karşılanıyor.
  [Veteriner](https://www.sahibinden.com/devren-satilik-is-yeri-veteriner/denizli)
  sayfasında m² ve ısıtma; [Pet Shop](https://www.sahibinden.com/devren-satilik-is-yeri-pet-shop/istanbul-fatih-akdeniz-iskenderpasa-mh.)
  örneğinde m² filtresi dışında yeni ve doğrulanabilir alan görülmedi.
- Bu turda eklenen yeni sayısal/seçim alanları isteğe bağlı ve önerilen durumda;
  açık arama filtresi ilan girişinde zorunluluk kanıtı sayılmadı. İş yeri alan kataloğu
  52'ye, tüm grupların teknik alan toplamı 215'e çıktı. Geçerli tip kimlikleriyle yapılan
  sayımda 102 türün 52'sinde tür-özel alan yok; 50 türde var.

Bu kategori örneklemi EDM-068'in tamamlandığı anlamına gelmez. Kalan alt türlerin portal
giriş alanları, alanların zorunluluk seviyesi ve gerçek portal aktarımı ayrıca
doğrulanmalıdır.

## 5 Ekim toplu şablon denetimi

- 12 konut alt türünde arsa alanı yalnız villa, müstakil ev, çiftlik evi, köşk/konak,
  yalı, yazlık, köy evi ve prefabrik ev şablonlarında açılır. Daireye gönderilen bu
  gizli alan sunucuda yok sayılır; ilan için yapı alanı zorunluluğunu aşamaz.
- Proje şablonunda konut adedi konut/villa/karma projelerde, ticari ünite adedi
  ticari/karma projelerde gösterilir ve sunucuda kabul edilir. Eski taslak veya elle
  gönderilen ilgisiz alanlar proje kaydına sızmaz.
- Kategori şemasındaki tür kısıtları, form gösterimi ve sunucu kaydıyla birlikte
  sınanıyor. Böylece yazım/slug hatası yüzünden tür-özel alanın sessizce hiç
  görünmemesi veya başka kategoriye sızması yakalanır.
- 5 Ekim'de kullanıcı oturumu üzerinden Ofisim'de yeni satılık villa formu açıldı ve
  ilan ayrıntıları ekranı doğrudan incelendi. Yeni bir taslak kategori adımında açıldı;
  ilana bilgi girilmedi ve ilan yayımlanmadı.

## 5 Ekim Sahibinden canlı villa formu doğrulaması

Adres alanı tüm ilanlarda aynı temel bilgiyi taşıyor. EDM'de il/ilçe/mahalle ve
kesin konum pini, kategori şablonundan bağımsız ortak `AdresAlanlari` bileşenine
alındı; yeni mülk şablonu bu parçayı tekrar yazmadan kullanıyor. İlan verme yetkisi
aynı ana bölümde görünse de adresin parçası olmadığı için ayrı tutuldu.

Satılık villa formunda başlık, açıklama, fiyat, brüt/net m², oda sayısı, bina yaşı,
kat sayısı, ısıtma, banyo, mutfak, otopark, kullanım durumu ve site bilgisi zorunlu
alan olarak göründü. Adres bölümünde il, ilçe ve mahalle zorunlu; ayrıca site içinde
olma bilgisi konut alanlarında yer alıyor. Yetki bölümünde gayrimenkul sahibinin
hukuki statüsü ve tapu durumu da zorunlu; Takaslı seçimi satılık konut şablonunda
zorunlu gösterildi.

Detay grupları: cephe, iç özellikler, dış özellikler, muhit, ulaşım, manzara, konut
tipi ve engelli/yaşlı erişimi. Her grup için en az bir nitelik seçilebiliyor veya
“seçim yapmak istemiyorum” seçeneği açıkça işaretlenebiliyor. EDM formu aynı iki
yanıt biçimini sunuyor ve sunucu kaydı da seçim yapılmadan ilerlemeyi engelliyor.

Fotoğraf bölümünde Sahibinden üst sınırı 35 olarak göründü; EDM hedefi 50 fotoğraf
olarak korunuyor. Bu nedenle fotoğraf adedi portal eşitliği değil, EDM'nin ürün
tercihidir. Video ve sanal tur seçenekleri de EDM şemasında mevcut. Bu canlı tur
yalnız satılık villa şablonunu doğrular; diğer mülk ailelerinin tüm zorunlu alanları
henüz portalda tek tek karşılaştırılmadı.

### 5 Ekim satılık villa açılır listelerinin canlı envanteri

Seçimler değiştirilmeden, yeni ve boş satılık villa taslağındaki açılır listeler
Ofisim oturumunda açılarak okundu. Şu an görülen seçenekler:

- Fiyat para birimi: yalnız `TL`.
- Oda düzeni: `Stüdyo (1+0)`, `1+1`, `1.5+1`, `2+0`, `2+1`, `2.5+1`, `2+2`,
  `3+0`, `3+1`, `3.5+1`, `3+2`, `3+3`, `4+0`, `4+1`, `4.5+1`, `4.5+2`, `4+2`,
  `4+3`, `4+4`, `5+1`, `5.5+1`, `5+2`, `5+3`, `5+4`, `6+1`, `6+2`, `6.5+1`,
  `6+3`, `6+4`, `7+1`, `7+2`, `7+3`, `8+1`, `8+2`, `8+3`, `8+4`, `9+1`, `9+2`,
  `9+3`, `9+4`, `9+5`, `9+6`, `10+1`, `10+2`, `10 Üzeri`.
- Bina yaşı: `0 (Oturuma Hazır)`, `0 (Yapım Aşamasında)`, `1`, `2`, `3`, `4`, `5`,
  `6-10 arası`, `11-15 arası`, `16-20 arası`, `21-25 arası`, `26-30 arası`,
  `31 ve üzeri`.
- Kat sayısı: `1`, `2`, `3`, `4`.
- Isıtma: `Yok`, `Soba`, `Doğalgaz Sobası`, `Kat Kaloriferi`, `Merkezi`,
  `Merkezi (Pay Ölçer)`, `Kombi (Doğalgaz)`, `Kombi (Elektrik)`, `Yerden Isıtma`,
  `Klima`, `Fancoil Ünitesi`, `Güneş Enerjisi`, `Elektrikli Radyatör`, `Jeotermal`,
  `Şömine`, `VRV`, `Isı Pompası`.
- Banyo sayısı: `Yok`, `1`, `2`, `3`, `4`, `5`, `6`, `6 Üzeri`.
- Mutfak: `Açık (Amerikan)`, `Kapalı`.
- Otopark: `Açık Otopark`, `Kapalı Otopark`, `Açık & Kapalı Otopark`, `Yok`.
- Kullanım durumu: `Boş`, `Kiracılı`, `Mülk Sahibi`.
- Enerji kimlik sınıfı: `A`, `B`, `C`, `D`, `E`, `F`, `G`.
- Gayrimenkul sahibi statüsü: `T.C. vatandaşı`, `T.C. vatandaşı değil`,
  `Banka / Vakıf / Dernek / Sendika`, `Kamu Kurumu`.
- Tapu durumu: `Kat Mülkiyetli`, `Kat İrtifaklı`, `Hisseli Tapu`, `Müstakil Tapulu`,
  `Arsa Tapulu`, `Kooperatif Hisseli Tapu`, `İntifa Hakkı Tesisli`, `Yurt Dışı Tapulu`,
  `Tapu Kaydı Yok`.
- Takaslı ve site içerisinde: her biri `Evet`, `Hayır`.
- Adres: 81 il listeleniyor; İstanbul seçiliyken 39 ilçe, Silivri seçiliyken mahalleler
  yerleşim grupları altında geliyor. Bu seçicilerin tam seçenek kümesi seçilen üst
  konuma bağlı; mahalle kataloğu tek sabit liste olarak kopyalanmamalı.

İlk şema karşılaştırmasında somut farklar bulundu: EDM'nin oda listesi portalın
`1.5+1`, `2+0`, `3+0`, `3+3`, `4+0`, `4+3`, `4+4`, `4.5+2`, `5.5+1`, `5+3`,
`5+4`, `6.5+1`, `6+3`, `6+4`, `7+3`, `8+1..8+4`, `9+1..9+6`, `10+1` ve `10+2`
değerlerinin çoğunu içermiyor. Bina yaşı etiketleri ve sıfır yaşın iki ayrı durumu
EDM'de farklı modellenmiş; kat sayısı EDM'de geniş sayısal alan; banyo adedi sayısal
alan; kullanım durumu ve tapu etiketleri portal ile bire bir değil. Isıtma listesinde
portalda olup EDM'de olmayan seçenekler var. Enerji sınıfında portal A-G sunarken EDM
ayrıca Muaf/Bilinmiyor değerleri içeriyor; mutfak portalda iki seçenekli, EDM'de daha
geniş. Bunlar canlı form karşılaştırmasının bulguları; mevcut kayıtları bozmadan
sonraki şema düzeltmesinde ele alınmalı.

Bu doğrulama yalnız villa türünü kapsar. Kategori değiştirilip her alt tür için aynı
alan ve liste incelemesi yapılmadan bütün Sahibinden şablonlarının tamamlandığı
iddia edilmeyecek. Taslakta değer seçilmedi ve ilan gönderilmedi.
