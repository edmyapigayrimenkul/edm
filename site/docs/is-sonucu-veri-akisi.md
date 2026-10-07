# CRM veri akışı ve işletmeden kalan bilgiler

3 Ekim 2026 — teknik inceleme belgesi. Canlı aydınlatma metni veya hukuki
uygunluk kararı değildir. Yeni CRM sonucu kaydı henüz üretimde açılmadı.

## Hazırlanan akış

| Kayıt | İçerik | Amaç / erişim |
| --- | --- | --- |
| Mevcut talep | Formdaki ad, iletişim ve ihtiyaç; sorumlu, takip, iç not | Mevcut D1 talep yönetimi; Access ve izinli panel yöneticileri |
| Yeni iş sonucu | Talep kimliği, yanıt/nitelik/randevu/işlem durumu ve zamanları | Danışmanın gerçek durumu teyidi; D1 `talep_is_sonucu` |
| İşlem geçmişi | Düzenleyen yönetici, zaman, talep kimliği, eski/yeni sonuç alanları | Düzeltme takibi; D1 `panel_islem_gecmisi` |
| Göstergeler | Haftalık toplamlar, teyit kapsamı, yanıt süresi, uygun payda oranı | Access altında işletme raporu; yeni müşteri metni kopyalanmaz |
| Mevcut yedek | D1 SQL dışa aktarımı | Üretimde açılırsa sonuç ve geçmiş de mevcut özel R2 arşivine girer |

Yeni tablo ve geçmiş, ad/telefon/mesajı tekrar kopyalamaz. Ancak talep kimliğiyle
müşteriye bağlı oldukları için kişisel veriden bağımsız kabul edilmezler.
Sonuç kaydı yeni e-posta, dış analitik aktarımı, ziyaretçi çerezi veya profil
oluşturmaz. Mevcut form e-postası, Gmail alıcısı, Cloudflare ve varsa WhatsApp
akışı ayrıca aydınlatma kapsamına alınmalıdır; “hiç paylaşılmaz” denemez.

Talep silinince sonuç satırı FK ile silinir. İşlem geçmişi ve daha önce alınmış
yedeklerin silinmesi otomatik değildir. Mevcut yedek kovalarında 90 gün kilit
bulunur; bu teknik kilit bütün müşteri verisi için hukuki saklama süresi
belirlemez. İmha, yedek geri yüklemede silinen verinin tekrar oluşmasının
önlenmesi ve geçmiş kayıtları için ayrıca uygulama gerekir.

## İşletmenin tamamlayacağı bilgiler

1. Vergi levhasındaki tam veri sorumlusu/mükellef unvanı, tebligat adresi ve
   başvuru kanalı. Marka adı veya yetki belgesi numarası unvan yerine geçmez.
2. Panel, Cloudflare D1/R2 ve e-posta kutusuna fiilen erişen kişilerin listesi.
   Kodun izin verdiği liste, herkesin gerçek erişiminin envanteri değildir.
3. Sonuçlanmayan talep, görüşme/işlem kanıtı, işlem geçmişi, e-posta, sözleşme
   ve yedek için amaç/gerekçe, saklama süresi ve imha sorumlusu. Tek genel
   “12 ay” varsayımı uygulanmayacak.
4. Gerçek amaç ve alıcı gruplarına göre işleme şartı, gereken rıza ayrımı ve
   olası yurt dışı aktarım koşullarının hukuk incelemesi. Teknik konum/sağlayıcı
   adı tek başına uygunluk kanıtı değildir.

Bu bilgilerle somut metin ve form bağlantıları hazırlanır; kararlar netleşince
üretim yedeği alınır, 0011 migration uygulanır, kontrollü etkinleştirme ve
oturumlu panel kontrolü yapılır. Kimlik bilgisinin gelmesi diğer kararları
kendiliğinden tamamlamaz. Bu sırada deneme ortamı kapalı bayrakla hazırlanabilir.

## Resmî kaynaklar

Aydınlatmada kimlik, amaç, alıcılar, toplama yöntemi/hukuki sebep ve haklar
açıklanır. Açık rıza işleme şartı kullanılıyorsa aydınlatma ve rıza işlemleri
ayrıdır. [KVKK Aydınlatma Tebliği, madde 4–5](https://www.kvkk.gov.tr/Icerik/4132/aydinlatma-yukumlulugunun-yerine-getirilmesinde-uyulacak-usul-ve-esaslar-hakkinda-teblig).

Saklama, ilgili mevzuat ve işleme amacına göre değerlendirilir; her CRM talebi
için aynı süre varsayılmaz. [KVKK Kişisel Verilerin Korunması Kanununa İlişkin
Uygulama Rehberi, basılı sayfa 69–70](https://kvkk.gov.tr/SharedFolderServer/CMSFiles/0517c528-a43d-49f5-b1eb-33dc666cb938.pdf).
Kaynaklar 3 Ekim 2026'da kontrol edildi; bu atıflar işletmenin özel durumuna
ilişkin tamamlanmış hukuki değerlendirme değildir.
