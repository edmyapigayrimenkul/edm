# Yapılandırılmış veri doğrulaması — EDM-044

3 Ekim 2026, canlı URL testleri. Google ile Schema.org denetimleri farklı
kapsamları sınar. Google'ın geçerli öğe sayısı bütün Schema.org alanlarının
doğru olduğunu veya sitenin dizine girdiğini kanıtlamaz.

## Google Zengin Sonuçlar Testi

- [Ana sayfa sonucu](https://search.google.com/test/rich-results/result?id=jRdUaUySDNK-91qMIL54-A):
  03:30:26 Türkiye saati; iki geçerli öğe — yerel işletme ve kuruluş.
  Kritik hata yok. İsteğe bağlı `priceRange` ve `address.postalCode` eksik.
- [Canlı ilan sonucu](https://search.google.com/test/rich-results/result?id=tGmIZpA_hO_8swqKA5W8uA):
  03:48:19 Türkiye saati; üç geçerli öğe — breadcrumb, yerel işletme,
  kuruluş. Breadcrumb geçerli; işletme/kuruluşta kritik olmayan sorunlar.

İşletmenin hizmet fiyat aralığı ilan fiyatlarından türetilmedi. Posta kodu
doğrulanmış işletme adres verisi olmadan tahmin edilmedi. Bu isteğe bağlı
alanlar bilindiğinde eklenebilir. İşletmenin kendi yorumları için
`aggregateRating` eklenmedi; yıldız sonucu vaat edilmiyor.
Google sonuç bağlantıları geçici olabilir; aşağıdaki kaynak kayıtları saklandı.

## Schema.org — gerçek düzeltme

[Daire testi](https://validator.schema.org/#url=https%3A%2F%2Fedmyapigayrimenkul.com%2Filan%2Fsilivri-cumhuriyet-mah-satilik-2-1-deniz-manzarali-daire-18693270)
yayın öncesi 0 hata / 4 uyarı verdi. `numberOfRooms`, `floorSize`, `geo`,
`address`, `RealEstateListing` sayfa türünde tanınmıyordu.

`ilan-semasi.ts` taşınmazı `about` altında ayırır: daire `Apartment`, bilinen
ev türleri `House`, diğer konutlar `Accommodation`, konut dışı `Place`.
Konum ve adres bu varlığa aittir. Konut alanı net varsa net, yoksa açık
brüt adıyla `floorSize` olur; arazi/hisse alanı yapı alanına dönüştürülmez.
2+1, salon kapsamı belirsiz sayısal oda adedine çevrilmeden `Oda düzeni`
özelliğiyle korunur. Bozuk alan, koordinat, tarih ve hayali fiyat yazılmaz.
Kat karşılığında sayısal fiyat üretilmez. Yaklaşık konum etiketi korunur.

Görünen sayfa yolu ve `BreadcrumbList` aynı adı/adresi kullanır. İlçe
aramasında il de gönderildiği için başka ilin Merkez ilçesi karışmaz.
Kurum görseli ilan fotoğrafına dönüşmez. JSON-LD'deki `<` kaçırılır;
kaynak metin script etiketini kapatamaz.

Yayın sonrası aynı daire **0 hata / 0 uyarı**, iki öğe verdi.
[Arazi örneği](https://validator.schema.org/#url=https%3A%2F%2Fedmyapigayrimenkul.com%2Filan%2Fsilivri-balabanda-satilik-villa-imarli-arsalar-19572827)
de **0 hata / 0 uyarı**, iki öğe verdi. Google RRT'nin üç geçerli öğesine
RealEstateListing dahil değildir; ilan türü ayrıca Schema.org'da sınandı.

## Yayın ve doğrulama kapsamı

Üretim `cc8e9c5e-7834-4b7e-88c5-2dd7462b1634`; 178 test ve derleme başarılı.
Sitemap'teki 48 ilanın tamamı HTTP 200. Otomatik yerleşim kontrolünde 15
House, 25 Place, 3 Accommodation, 5 Apartment; yanlış üst seviye alan veya
arazide `floorSize` bulunmadı. Bu tarama 48 ayrı Google araç testi değildir.

İlan detayı 390×844 ve 1280×800 boyutlarında taşmadı. İki arama sayfasında
5 daire / 12 arazi ile kart/JSON-LD adetleri eşit. ClientRouter ile ayrıntılı
filtrelere geçiş aynı kapsamı korudu; tarayıcı hata kaydı bulunmadı.
Üç kaynaklı rehber canlıda 200. CRM yeni kayıt bayrağı 0; 0011 uygulanmadı.

Kaynak JSON-LD önce/sonra ve 48 ilan kontrolü:
`../../raporlar/sema-2026-10-03/`. Portföy değiştikçe sayılar değişebilir.
Search Console hesap raporu, indeksleme, sıralama ve gerçek kullanıcı
performansı bu testlerle tamamlanmış sayılmadı.

## Birincil belgeler

- [Google: yapılandırılmış veri ve test araçları](https://developers.google.com/search/docs/appearance/structured-data)
- [Google: breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Google: işletmenin kendi yorumlarının yıldız sınırı](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful)
- [Schema.org: RealEstateListing](https://schema.org/RealEstateListing)
- [Schema.org: floorSize](https://schema.org/floorSize)
- [Schema.org: numberOfRooms](https://schema.org/numberOfRooms)
- [Schema.org: additionalProperty](https://schema.org/additionalProperty)
