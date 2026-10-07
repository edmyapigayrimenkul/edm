# Kalıcı arama sayfaları — EDM-043

3 Ekim 2026. İki editoryal arama sayfası hazır:

- `/ilanlar/silivri-satilik-daire`
- `/ilanlar/silivri-satilik-arsa-tarla`

Diğer filtre birleşimleri için otomatik sayfa oluşturulmaz. Tanımsız slug
404 döner. Liste, `portfoy()` tarafından görünür kabul edilen ilanlardan
sunucuda süzülür; başlıktaki sözcükler kategori yerine kullanılmaz.
Her iki sayfa İstanbul / Silivri / satılık şartını birlikte ister.
Daire sayfası konut grubunun daire alt türünü; arazi sayfası arsa grubunun
tarla ve imarlı arazi dahil tüm alt türlerini kapsar.

Her sayfanın kendine özgü giriş, üç karşılaştırma kartı ve üç kısa yanıtı
vardır. İlan yokken içerik ve danışman bağlantısı korunur; sahte ilan veya
fiyat gösterilmez. Liste bütün Silivri piyasası olarak sunulmaz.

Kanonik adres sorgusuz kalıcı sayfa yoludur. CollectionPage içindeki
ItemList sırası ve adedi görünür ilan kartlarıyla aynıdır. BreadcrumbList
görünür sayfa yolu ile eşleşir. Site haritasına yalnız iki sabit adres
eklenmiştir. Tüm ilanlar, Silivri rehberi ve iki sayfa arasında iç bağlantılar
vardır. Ayrıntılı filtre bağlantısı aynı kapsamı listede yeniden uygular.

## Kontroller ve yayın sınırı

- Dört davranış testi dahil 169 test başarılı; Astro derlemesi geçti.
- Yerel HTTP iki sayfa 200, izinsiz slug 404; JSON-LD ve kart adetleri eşit.
- Yerel test portföyünde 6 daire / 13 arazi; bunlar canlı sayı iddiası değildir.
- ClientRouter ile daire sayfasından ayrıntılı aramaya geçişte 6 satılık
  daire kaldı; villa/kira/devir listeye girmedi.
- 390 × 844 mobil ve 1280 × 800 masaüstü taşma kontrolü; kısa yanıt açma
  etkileşimi doğrulandı. Boş portföyde 0 ItemList ve danışman bağlantısı.
- Geçici portföy yalnız yerel test D1'ine eklendi ve temizlendi.

Korumalı staging dağıtımı yapıldı; uzakta Access'e 302 gözlemek içerik
görüntüsünü doğrulamak anlamına gelmez. 3 Ekim üretim yayını ve canlı kontrol tamamlandı.
JSON-LD sözdizimi/liste uyumu Google zengin sonuç uygunluğunu kanıtlamaz;
Google araçlarıyla doğrulama ayrı EDM-044 adımıdır.

Şema değişikliğiyle staging sürümü: `455b07dd-a032-44c2-ad65-9821f8e9b028`.
Access 302 koruması salt okunur doğrulandı; yeni CRM bayrağı kapalıdır.


## Canlı doğrulama — 3 Ekim 2026

Üretim `cc8e9c5e-7834-4b7e-88c5-2dd7462b1634`. İki adres 200;
5 daire / 12 arazi ile kart ve ItemList adetleri eşit. ClientRouter ile
ayrıntılı aramaya geçildiğinde aynı 5/12 görünür kart ve doğru il, ilçe,
işlem, kategori filtreleri kaldı. Sayı değişimi yerel örneklerle farklı
olan canlı portföyden kaynaklanır; sabit sayılar kodlanmaz.
390×844 mobil ve 1280×800 kontrollerinde yatay taşma yok.
178 test ve üretim derlemesi başarılı. Google/Schema.org sonuçları
`yapilandirilmis-veri.md` içinde; CRM bayrağı 0 ve 0011 uygulanmadı.
