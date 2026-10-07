# EDM kurulum ve güven rehberi

Tarih: 18 Eylül 2026

Bu belge, hesap ekranlarında yapılacak işleri basit adımlara ayırır. Hukuki metin
taslağı işletmenin gerçek veri sorumlusu unvanı doğrulanmadan canlıya alınmamalıdır.

## 1. KVKK için ne yapacağız?

Sitede bugün iki müşteri veri akışı var:

1. İletişim formu: ad, telefon, konu, mesaj ve varsa ilgili ilan.
2. Değerleme formu: ad, telefon, isteğe bağlı e-posta, mülk tipi, ilçe, mahalle,
   yaklaşık alan ve serbest not.

Bu veriler Cloudflare Worker üzerinden D1 veritabanına kaydediliyor. Bildirim,
Cloudflare Email Service ile ofis adresine gidiyor. Kullanıcı WhatsApp yedeğini
seçerse bilgi WhatsApp'a kullanıcının kendi eylemiyle taşınıyor. Favoriler cihazın
yerel depolamasında tutuluyor; sunucuya otomatik gönderilmiyor. İlan görüntülenme
sayacı kişi takibi veya çerez kullanmıyor.

KVKK Kurumu aydınlatmada en az şu beş başlığın bulunmasını istiyor: veri
sorumlusunun kimliği, işleme amacı, aktarım/alıcı grupları, toplama yöntemi ve
hukuki sebep, ilgili kişinin hakları. Aydınlatma ile açık rıza gerekiyorsa bunlar
ayrı işlemler olmalı.

Canlı metni hazırlamak için işletmeden kalan bilgiler:

- Vergi levhasında yazan **tam mükellef/veri sorumlusu unvanı** ve tebligata uygun
  iletişim adresi.
- Talepler, e-posta, işlem geçmişi, sözleşmeler ve yedeklerin amaçlarına ve
  uygulanabilir mevzuata göre saklama/imha kararı. Önceki genel 12 ay önerisi
  3 Ekim incelemesinde kaldırıldı; doğrulanmış işletme politikası değildi.
- D1 ve e-posta kayıtlarına fiilen kimlerin eriştiğinin kesin listesi.

Yeni CRM alanları ve gerçek erişim/aktarım incelemesi:
[İş sonucu veri akışı](../site/docs/is-sonucu-veri-akisi.md).

Bu üç bilgi gelince yapılacak teknik değişiklikler:

- `/aydinlatma-metni` sayfası,
- iletişim ve değerleme formunun hemen altında görünür bağlantı,
- mevcut “Bilgiler üçüncü kişilerle paylaşılmaz” gibi teknik akışla tam uyuşmayan
  cümlenin kaldırılması,
- gerekiyorsa açık rıza kutusunun aydınlatma onayından ayrılması,
- başvuru kanalının alt bilgiye eklenmesi.

Resmî dayanaklar:

- https://www.kvkk.gov.tr/Icerik/4132/aydinlatma-yukumlulugunun-yerine-getirilmesinde-uyulacak-usul-ve-esaslar-hakkinda-teblig
- https://www.kvkk.gov.tr/Icerik/7353/Cerez-Uygulamalari-Hakkinda-Rehber

## 2. Google işletme ve yorumlar

Sitede tam Google Business Profile yönetim API'sine ihtiyaç yok. Web sitesinde
puan ve yorum göstermek için Places API (New) kullanılıyor. Google bu uçta en
fazla beş yorum döndürüyor; 12 yorumun tamamını bu API ile çekmek mümkün değil.

18 Eylül doğrulaması:

- Üretim Worker'ında `GOOGLE_ANAHTARI` tanımlı.
- Anahtar, izinli site referrer'ı ile API'den HTTP 200 aldı.
- İşletme “EDM Yapı ve Gayrimenkul” ve Silivri adresiyle bulundu.
- Canlı D1'de puan 4,7, toplam yorum sayısı 12 ve Google kaynaklı 5 yorum var.
- Yorumlar ana sayfada yazar, avatar ve Google bağlantısıyla görünür.

Google işletme profilinde yorum yanıtlama, fotoğraf veya gönderi yönetimini de
otomatikleştirmek istersek ayrı Business Profile API başvurusu ve OAuth gerekir;
Google bu erişimi proje bazında inceler. Mevcut site ihtiyacı için bu başvuru
zorunlu değildir.

Resmî kaynaklar:

- https://developers.google.com/maps/documentation/places/web-service/place-details
- https://developers.google.com/my-business/content/faq

## 3. Search Console kurulumu

Bu adımlar Google hesabında kullanıcı tarafından yapılır; DNS kaydını biz token
geldiğinde Cloudflare'a ekleyebiliriz.

1. https://search.google.com/search-console adresini aç.
2. Sol üstteki mülk seçicisinden **Mülk ekle** seç.
3. **Alan adı** seçeneğine yalnız `edmyapigayrimenkul.com` yaz. `https://` veya
   `www` ekleme.
4. Google'ın verdiği `google-site-verification=...` TXT değerini kopyala.
5. Bu değeri bize gönder; Cloudflare DNS'e `TXT`, ad `@`, TTL `Auto` olarak ekleyelim.
6. Search Console'a dönüp **Doğrula** seç.
7. Sol menüden **Site Haritaları** aç ve `sitemap.xml` gönder.
8. İlk veri birkaç gün içinde oluşur. Sonra dizine giren URL, sorgu, tıklama,
   gösterim ve sayfa sorunları için başlangıç raporu çıkarılabilir.

Site haritası hâlihazırda `https://edmyapigayrimenkul.com/sitemap.xml` adresinde
üretiliyor.

Resmî kaynaklar:

- https://support.google.com/webmasters/answer/34592
- https://support.google.com/webmasters/answer/7451001

## 4. Cloudflare yedekleme ve geri dönüş

Canlı D1 veritabanı 18 Eylül'de salt okunur denetlendi:

- ad: `edm-talepler`
- bölge: `EEUR`
- boyut: 524 kB
- tablo sayısı: 19
- Time Travel çalışıyor ve güncel geri dönüş yer imi üretildi.

Cloudflare D1 Time Travel otomatik çalışır; ayrıca açılması gerekmez. Free planda
7 gün, Workers Paid planda 30 gün geriye dönüş vardır. Geri yükleme mevcut
veritabanını yerinde değiştirdiği için önce test ortamında denenmelidir. Üretimde
geri yükleme komutu açık kullanıcı onayı olmadan çalıştırılmayacaktır.

R2, görselleri yüksek dayanıklılıkla saklar fakat yanlışlıkla silmeye karşı tek
başına sürüm geçmişi değildir. Bu nedenle sonraki teknik iş; D1'i periyodik olarak
R2'ye dışa aktaran uzun süreli arşiv ve `edm-gorseller` için silme yetkisi daraltılmış
ayrı API anahtarı/bucket lock değerlendirmesidir.

Resmî kaynaklar:

- https://developers.cloudflare.com/d1/reference/time-travel/
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/r2/reference/durability/

## 5. “Gerçek değerleme raporu” ne demek?

Buradaki amaç, müşteriye yalnız telefonda bir rakam söylemek yerine tekrar
üretilebilir bir **piyasa değerlendirmesi** sunmaktır. Bir sayfalık örnek şu
başlıkları taşır:

- taşınmazın kısa özeti ve değerlendirme tarihi,
- kullanılan bilgiler ve doğrulanmayan varsayımlar,
- seçilen 3–5 karşılaştırılabilir ilan,
- konum, alan, imar/tapu ve fiziksel durum düzeltmeleri,
- tek rakam yerine gerekçeli tahmini pazarlama aralığı,
- önerilen ilan fiyatı ve pazarlama planı,
- “resmî/SPK lisanslı değerleme raporu değildir” kapsam notu.

Şirket banka, mahkeme, vatandaşlık veya teminat işlemlerinde kullanılacak lisanslı
rapor üretmiyorsa sayfada buna “ekspertiz raporu” dememeliyiz. EDM için güvenli
isim “Ön Piyasa Değerlendirmesi”dir.

## 6. “İzinli başarı örneği” ne demek?

Uydurma referans veya genel övgü yerine gerçek bir işin anonim vaka anlatımıdır:

- bölge ve taşınmaz türü,
- müşterinin başlangıç sorunu,
- EDM'nin yaptığı kontroller ve pazarlama adımları,
- süre ve doğrulanabilir sonuç,
- müşterinin yayın izni ve gizlenen kişisel bilgiler.

Örnek yapı: “Silivri'de uzun süredir bekleyen 3+1 konut / fiyat ve sunum yeniden
konumlandı / doğrulanmış süre içinde işlem tamamlandı.” Gerçek süre ve sonuç sizden
gelmeden sayı yazılmayacak.

## 7. “10 ilan / 15 işletme teyidi” ne demek?

Bu bir kota değildir. On farklı ilan hakkında toplam 15 cevap bekleyen doğruluk
sorusudur. Gruplar:

- 2 tapu/kadastro türü çelişkisi,
- 7 alan, hisse veya fiyat kapsamı sorusu,
- 3 oda/kullanım/teslim bilgisi sorusu,
- 1 olası mükerrer bağımsız bölüm sorusu,
- 2 eksik fotoğraf seti.

Yönetim panelindeki `/yonetim/teyitler` ekranı bu cevapları “bilgi alındı” ve
“konu kapandı” durumlarıyla, kaynak ve tarihle saklar. Belge içeriğini panele
yazmak gerekmiyor; “tapu belgesi kontrol edildi · 18.09.2026” gibi kaynak kaydı
yeterlidir.
