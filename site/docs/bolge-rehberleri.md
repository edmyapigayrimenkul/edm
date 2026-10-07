# Bölge rehberleri — EDM-036

Kontrol tarihi: 3 Ekim 2026. Mevcut portföyün yedi rehberi üretimde
yayımlandı; kanonik adreslerinden HTTP 200 doğrulandı. EDM-036 tamamlandı.
Yeni bir il/ilçe portföye katılırsa kaynaklı yerel içerik ayrıca hazırlanır.

Silivri, Edirne Merkez, Meriç, Lalapaşa, Marmaraereğlisi, Malkara ve Enez
rehberlerinin her birinde iki resmi kaynak kartı,
üç karşılaştırma başlığı ve taşınmaz inceleme soruları bulunur. Resmi
olguların altında doğrudan bağlantı vardır; EDM soruları ayrı sunulur.
2024 sulama duyurusu tarihsel örnektir, 2026 talimatı gibi gösterilmez.

## Kaynaklar

- [Silivri Kaymakamlığı: coğrafi konum](https://www.silivri.gov.tr/cografi-konum)
- [Edirne Valiliği: Meriç](https://www.edirne.gov.tr/meric)
- [Kültür ve Turizm Bakanlığı: Sultan Mecid Köprüsü](https://www.kulturportali.gov.tr/turkiye/edirne/kulturenvanteri/sultan-mecid-koprusu)
- [Edirne Valiliği: 19 Ağustos 2024 sulama duyurusu](https://www.edirne.gov.tr/meric-nehri-uzerindeki-sulamanin-duzenlenmesine-iliskin-duyuru)
- [TKGM: Parsel Sorgulama](https://www.tkgm.gov.tr/e-hizmetler/sik-kullanilanlar/parsel-sorgulama)
- [Lalapaşa Kaymakamlığı: coğrafi yapı](https://www.lalapasa.gov.tr/cografi-yapi)
- [Kültür ve Turizm Bakanlığı: Lalapaşa Dolmenleri](https://kulturportali.gov.tr/turkiye/edirne/gezilecekyer/lalapasa-dolmenleri)
- [Marmaraereğlisi Kaymakamlığı: coğrafi yapı](https://www.marmaraereglisi.gov.tr/cografi-yapisi)
- [Malkara Kaymakamlığı: coğrafi yapı](https://www.malkara.gov.tr/cografi-yapisi)
- [Enez Kaymakamlığı: Enez hakkında](https://www.enez.gov.tr/enez-hakkinda)
- [Tarım ve Orman Bakanlığı: Gala Gölü Milli Parkı](https://bolge1.tarimorman.gov.tr/Menu/44/Milli-Parklar)

Dört yeni rehberde yol, kıyı, arazi şekli, sulama altyapısı ve kültürel/doğal
çevre bilgisi taşınmazın uygunluğundan ayrı tutulur. İlan başlığı veya bölge
tanıtımı üzerinden yapılaşma, sulama bağlantısı veya koruma sınırı sonucu
çıkarılmaz. Kaynaklardaki tartışmalı koordinatlar, eski deprem bölgesi
sınıfları, güncel olmayan nüfus ve sulanabilir alan sayıları aktarılmadı.
Önceki kaynaksız çiftlik uygunluğu ve Malkara güzergâhı ifadeleri kaldırıldı.

## Veri ve panel

Gruplama il + ilçe kimliğiyle yapılır. Farklı illerin Merkez ilçeleri ayrı
rehber oluşturur. Kaynak içerik de aynı kesin kimlikle eşleşir.

Panel yeni metni `istanbul-silivri` gibi sayfa slugıyla kaydeder. Eski
`Silivri` anahtarı yalnız ilçe tek ilde bulunduğunda okunur; belirsiz
`Merkez` anahtarı farklı illere dağıtılmaz. Eski kayıtlar silinmez.
Kaydetme aynı Worker'ın içerik ve bölge önbelleğini temizler; diğer Worker
örnekleri/kenar önbelleğinde mevcut 60 saniye süresi devam edebilir.

Fiyatlar EDM portföyünün istek fiyatlarıdır. Arazi ortancası TL satılık,
pozitif ve sonlu fiyat/alan örneklerinden hesaplanır; aynı fiziksel taşınmaz
bir kez sayılır. En az iki geçerli örnek olmadan ortanca gösterilmez.
Kira, devir, döviz ve konut örnekleri bu hesaplamaya katılmaz.

## Doğrulama

Altı bölge davranış testi; şema ve dağıtım kapısı dahil tam test dizisi
178 başarılı. D1 entegrasyon testleri yerel sunucu izniyle çalıştırıldı.
Yerel dört bölge 200, tanımsız bölge 404; doğru kanonik adresler.
İlçe/il çakışması için geçici Kırklareli Merkez örneği, panel eski/yeni
metin kaydı ve aynı Worker'da hemen yansıma doğrulandı. Örnek temizlendi.
Edirne filtresine ClientRouter geçişinde yalnız üç Edirne Merkez ilanı kaldı.
390 × 844 ve 1280 × 800 kontrollerinde yatay taşma görülmedi.

Staging Access altında dağıtılır; dışarıdan 302 yalnız erişim korumasını
doğrular, giriş yapılmış uzaktaki sayfa görüntüsü doğrulaması değildir.
Üretim 0011 migration ve CRM etkinleştirmesi bu çalışma kapsamında yapılmadı.

Şema değişikliğiyle staging sürümü: `455b07dd-a032-44c2-ad65-9821f8e9b028`.
Access 302 koruması salt okunur doğrulandı; yeni CRM bayrağı kapalıdır.

İlk üç rehberin üretim sürümü: `cc8e9c5e-7834-4b7e-88c5-2dd7462b1634`.
Dört ek rehberin staging sürümü: `abdc3e49-3a8c-49d0-a300-1fd21fe9be22`.
Son üretim sürümü: `55d140df-d96e-4737-81f0-4f5b728e53b5`.
Yedi rehberin kanonik adresi, ikişer kaynak ve üçer kontrol kartı doğru.
Dört yeni rehber 390 × 844 mobil görünümde yatay taşma olmadan açıldı;
Lalapaşa → Enez ClientRouter geçişinde doğru içerik ve tek örnek için
ortanca göstermeme davranışı görüldü. Masaüstü kartlar da kontrol edildi.
Kanıt: `raporlar/sema-2026-10-03/canli-rehber-kontrolu.json`.
Yeni CRM bayrağı 0; sonuç tablosu yok, 0011 üretimde uygulanmadı.
