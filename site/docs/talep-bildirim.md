# Talep e-posta bildirimleri

Yeni form talebi ve `talep_bildirim` kaydı aynı D1 batch işlemiyle yazılır.
Kuyruk kaydı başarısızsa talep de geri alınır; form başarı yanıtı vermez.
[D1 batch transaction davranışı](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch).

İlk gönderim form kaydından sonra denenir. Bağlama eksikliği veya kesin
başarısızlık kalıcı kuyrukta kalır. Mevcut 6 saatlik Worker cron'u, portal
senkronundan önce en fazla 10 uygun bildirimi işler. Denemeler arasında en az
5 dakika, 30 dakika, 2 saat ve 6 saat beklenir; cron takvimi nedeniyle gerçek
deneme daha geç olabilir. Beş denemeden sonra otomatik gönderim durur.

Her gönderim atomik durum koşulu ve rastgele sahiplik kimliğiyle kilitlenir.
Form, cron ve panel aynı talebi eşzamanlı işlerken yalnız bir gönderim başlar.
Gönderim esnasında sağlayıcı çağrısı exception döndürürse, ya da Worker
kesilip 10 dakikalık kilit süresi dolarsa sonuç `belirsiz` olur. Otomatik
tekrar yapılmaz: mesaj kabul edilmiş olabilir. Yönetici Gmail'i kontrol edip
panelden tekrar göndermeyi seçebilir; bu karar ikinci mesaj oluşturabilir.
Sağlayıcıda idempotency veya gelen kutusu teslim garantisi yoktur.

Panelde gönderime kabul, bekleyen, başarısız, işleniyor ve belirsiz durumlar
ayrıdır. Kabul, Gmail'e teslim edildiği anlamına gelmez. Başarısız/belirsiz
bildirimler toplam uyarı ve ayrı filtreyle görünür. Yönetici tekrar denemesi
Access kimliği ve aynı Origin ile yapılır; kabul edilmiş bildirim yeniden
gönderilemez. Eski talepler geri doldurulmaz, önceki gönderim durumu bilinmiyor
olarak gösterilir; toplu eski e-posta gönderimi yoktur.

Kuyruk yalnız talep kimliği ve işlem durumunu tutar; mesaj, telefon, IP veya
sağlayıcının serbest hata metni kopyalanmaz. E-posta gövdesi talep tablosundan
üretilir. Silinen talep FK cascade ile kuyruktan da kaldırılır.

Dağıtım sırası: 0008 migration, Worker dağıtımı. Şema kapısı 0008'i zorunlu
tutar. Eski Worker'a geri dönülebilir; ek kuyruk tablosu eski şemayı bozmaz.
Staging'de gerçek e-posta bindingi ve cron kapalıdır.
