# Gerçek talep sonuçları — EDM-038/040

3 Ekim 2026: uygulama yerelde doğrulandı; canlıda yeni kayıt varsayılan kapalı.
Bu belge aydınlatma metni değildir. EDM-019/020 tamamlanmadan yeni canlı veri
işleme açılmaz. [Veri akışı ve kalan kararlar](./is-sonucu-veri-akisi.md).

## Kayıt kuralları

`/yonetim/talepler` içinde ilk gerçek yanıt, ihtiyaç/hizmet uygunluğu, randevu
durumu ve gerçek satış/kiralama ayrı kaydedilir. Sorumlu danışman bulunmalıdır.
Gizli danışman iç sorumlu olabilir; atama panel giriş yetkisi vermez.

Her talep `0011-talep-is-sonucu.sql` ile kurulan tabloda tek güncel kayıt taşır.
Migration geçmiş taleplere varsayılan olay eklemez. Kayıt olmaması bilinmeyen
durumdur; yanıtsız veya başarısız işlem değildir. Kapanış ve takip planı ayrı
kalır. Otomatik bildirim, telefon tıklaması ve not ilk yanıt sayılmaz.

- Saatler Türkiye saatinde saniye hassasiyetinde girilir, UTC ISO saklanır.
  Geçersiz takvim, talep öncesi olay ve gelecekte gerçekleşmiş olay reddedilir.
  Gerçek planlı/iptal randevunun tarihi ileride olabilir; iptal tarihi alanı
  randevunun zamanını gösterir, iptal eyleminin zamanını değil.
- Nitelik değerlendirmesi gerçek ilk yanıt gerektirir. Tarihli randevu ve işlem
  ilk yanıttan önce olamaz. Bu bir otomatik kişi/konut uygunluk puanı değildir.
- Her kayıtta gerçek bilgi teyidi gerekir. Önceki kaydı değiştirmek ayrıca
  düzeltme teyidi gerektirir; eski değer işlem geçmişinde korunur.
- Aynı değerleri tekrar göndermek olay, audit veya sürüm artışı üretmez.
  Eşzamanlı/eski düzenleme sürüm koşuluyla reddedilir. Talep sürümü, geçmiş ve
  sonuç tek D1 transaction'dır; hata halinde tamamı geri alınır.
- Model tek talebin güncel randevusunu ve işlem türünü gösterir. Bir müşterinin
  tüm randevularının/çoklu sözleşmelerinin toplamı veya sözleşme arşivi değildir.

Rapor aynı Türkiye haftasında oluşturulmuş talepleri kullanır. İlgili alan
bu kümenin tamamında teyit edilmediyse oran gösterilmez. İlk yanıt ortalaması
yalnız teyitli yanıt zamanlarından çıkar. Eski ayın bu hafta gerçekleşen satışı
bu haftanın yeni talep oranına katılmaz. Düzeltme geçmiş raporu değiştirebilir.
Tüm açık taleplerde teyitli yanıtsızlar ve durumu bilinmeyenler ayrı gösterilir.

## Açılma ve kapanma

`TALEP_IS_SONUCLARI_ETKIN` yalnız tam `1` değerinde açılır; yok, `0` veya başka
değerler uzak ortamda kapalıdır. Bayrak kapalıysa yeni tablo sorgulanmaz ve
`is-sonucu` POST 403 döner. Eski rapor/takip çalışmaya devam eder. Access,
yönetici doğrulaması ve aynı Origin kontrolü her durumda zorunludur.

Yerelde bayrak yokken mevcut `PANEL_YEREL_TEST_KIMLIGI=1` yalnız loopback URL'de
test akışını açar. Açık `0` yerelde de kapatır. URL/form parametresi bayrak
yerine geçmez. Bayrağı kapatmak kayıtları silmez; saklama/imha ayrı karardır.

## Kanıt

159 test geçti; 11 yeni Miniflare D1 testi durum/tarih, eşzamanlılık, tekrar,
düzeltme, audit/yazma hatasında transaction geri alma ve eksik kohort oranlarını
sınadı. Yerel gerçek HTTP'de kayıt, tekrar, eski sürüm ve düzeltme teyidi
doğrulandı. İki başarılı değişiklik iki audit üretti; talep işlemde kaldı.
Kapalı bayrakta ekranlar 200/no-store, yeni POST 403/no-store. Masaüstü
1280×800 ve mobil 390×844 form/raporda yatay taşma yok; zorunlu teyit tarayıcıda
da denetlendi. Gerçek müşteri kayıtları test için kullanılmadı.

Staging dağıtımı: `368a26f9-20f8-4ead-9a3a-7c059cd84237`. Ayrı staging D1'de
0011 uygulanmış ve sonuç tablosu boş; uzak kayıt bayrağı yok, dolayısıyla kapalı.
Talepler ve göstergeler oturumsuz istekte Access'e 302 yönleniyor. Oturumlu
uzak form bu turda ayrıca görülmedi; form kanıtı yerel test ortamına aittir.
Dağıtım öncesi staging yedeği doğrulandı: özel arşivde
`staging/2026-10-02T22-46-50-092Z-a0d20c7d/manifest.json`, D1 11.109 bayt,
R2 sıfır nesne. Yerel test talebi, danışman, sonuç ve audit kayıtları temizlendi.

Üretim `77fc828b-0c0b-47de-9d95-50808e5752b2` sürümünde kaldı. Üretimde 0011
migration ve yeni tablo yok; yeni kayıt açılmadı. Ana sayfa, ilan listesi ve
sitemap HTTP 200; yönetim göstergeleri Access 302. Kaynak ve derlemede yerel
gerçek sır değerleriyle eşleşme bulunmadı; bu turda sır değiştirilmedi.


## 3 Ekim sonraki kamu sayfası yayını

Üretim artık `cc8e9c5e-7834-4b7e-88c5-2dd7462b1634`; bu sürüm değişikliği
CRM'i açmadı. Uzak `TALEP_IS_SONUCLARI_ETKIN=0`, `talep_is_sonucu` tablosu
sayısı 0 ve yerel test kimliği yok. Access yönlendirmeleri 302/no-store.
0011 geçişi veri akışı kararı için bekliyor. Kamu sayfaları için
`dagitim-uyumlulugu.md` içindeki dar ve testli uyumluluk kapısı kullanıldı.
