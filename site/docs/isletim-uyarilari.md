# İşletim uyarıları

İlan senkronunun sonunda `/yonetim/uyarilar` kaydı güncellenir ve yeni uyarılar
sabit işletme bildirim adresine gönderilir. Panel Cloudflare Access ile korunur;
menüde açık uyarı sayısı görünür. Normal program Türkiye saati 00:00, 06:00,
12:00 ve 18:00; yetkili manuel senkron aynı kontrolleri çalıştırır.

- Senkron başarısızlığı veya sıfır ilan yanıtı uyarı açar. Sonraki tamamlanan
  senkron kapatır. Boş yanıt mevcut ilanları pasife almaz.
- Ani düşüş mevcut emniyet eşiğini kullanır: en az 5 aktif portal ilanı,
  öncekinin %75'inden az bulunan ilan ve en az 3 eksik ilan. İlk tam çekimde
  pasife alma ertelenir; ikinci aynı tam çekimde teyit edilir. Uyarı teyit
  turunda da açık kalır. Sonraki normal çekim kapatır. Elle girilen ilanlar
  portal taban sayısına eklenmez.
- Okunamayan ilan ayrıntıları ayrı uyarıdır. Eksik ayrıntılı turda pasife alma
  yapılmaz. Tam ayrıntılı tur uyarıyı kapatır. Başarısız çekim önceki düşüş veya
  eksik ayrıntı uyarısını kapatmaz.
- Takip tarihi gelen açık talepler, 24 saati aşan yeni talepler ve 24 saatten
  eski sahipsiz/plansız açık talepler uyarı açar. Kapalı talepler sayılmaz.
  Koşullar aynı talepte birleşirse talep yalnız bir kez sayılır. Kontrol
  6 saatte bir yapılır; panel kaydı özeti hemen günceller ama e-posta göndermez.
  Plan yenilenince veya talep kapatılınca ilgili koşul kalkar.
- Başarısız/belirsiz talep e-postaları ayrı uyarıdır. Talep kuyruğu çalıştıktan
  sonra kontrol edilir; ilgili ekran bildirim uyarıları filtresini açar.

Aynı türün sorunu sürerken sayılar/metin güncellenir, kabul edilmiş e-posta
tekrarlanmaz. Aynı türde yeni geciken talepler eklenmesi ayrı e-posta açmaz.
Sorun düzelip tekrar oluşunca yeni olay kimliği, yeni deneme hakkı oluşur.
Düzelme e-postası gönderilmez. Tablo her türün son olayını tutar; geçmiş olayların
ayrı arşivi değildir. Henüz sorun yaşanmamış sağlıklı türler panelde listelenmez.

Gönderim koşullu D1 `UPDATE ... RETURNING` ve olay kimliğiyle sahiplenilir;
eşzamanlı cron/panel yalnız bir sağlayıcı çağrısı yapar. Sonuç kesin başarısızsa
6 saat sonra en fazla 5 otomatik deneme yapılır. Bağlama yokluğu kesin
başarısızdır. Sağlayıcı çağrısı hata ile kesilirse veya gönderim kilidi 10 dakika
sonunda süresi dolmuşsa sonuç **belirsiz** olur; otomatik tekrar yapılmaz.
Yönetici gelen kutusunu kontrol ettikten sonra panelde yeniden deneyebilir.
Kabul edilmiş ve düzelmiş olaylar yeniden gönderilemez. Eski olayın geç biten
isteği yeni olayın durumunu değiştiremez. E-posta kabulü gelen kutusuna teslim
kanıtı değildir.

Bildirim hatası senkron sonucunu değiştirmez. Günlük özet sadece son 24 saatteki
yeni talepler ve kontrol zamanı gelen ilan hatırlatmaları için gönderilir;
kalıcı senkron/bekleyen talep hatalarını her sabah yeniden göndermez.

`0009-isletim-uyari.sql` eklemeli migration. İşletim kaydına müşteri adı,
telefonu, mesajı veya sağlayıcının serbest hata metni kopyalanmaz. Anlık gözlem
zamanı, daha eski senkron sonucunun daha yeni uyarı durumunu geri çevirmesini
engeller. Veritabanı erişimi veya Worker cron'u tamamen kesilirse bu Worker
uyarı gönderemez; bağımsız GitHub yedekleme/güncellik kontrolü ayrı korumadır.

Doğrulama: `npm run test:isletim-uyari` gerçek Miniflare D1 üzerinde tekrar,
düzelme/yeniden açılma, eşzamanlılık, eski gözlem/olay, 24 saat eşiği, bildirim
başarısızlığı ve belirsiz sonucu sınar. `test:senkron-d1` mevcut pasife alma
korumasının gerçek D1 karşılığını sınar.
