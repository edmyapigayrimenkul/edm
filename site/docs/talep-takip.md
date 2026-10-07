# Talep sorumluluğu ve takip

`/yonetim/talepler` Cloudflare Access ile korunur. Sorumlu seçiminde ekip tablosu
kullanılır; bu atama kimseye panel giriş yetkisi vermez. Yayında olmayan danışman
bir iç talebin sorumlusu olabilir. Ekipten silinirse talepleri sahipsiz olur.

- Yeni kayıt otomatik atanmaz. Eski notlar, talep durumu ve son düzenleyen korunur;
  son düzenleyen kişi sorumlu gibi yorumlanmaz.
- Sorumlusu olan açık talep ve `islemde` talep ilerideki takip tarihini gerektirir.
- Kapanış sorumlu ve sonuç gerektirir; sonraki takip kaldırılır. Yeniden açmada
  kapanış tarihi ve sonucu temizlenir. Eski kapanmış kayıtlarda eksik sonuç açıkça
  belirtilir; yalnız iç not düzenlemek gerçekleşmemiş sonuç gerektirmez.
- “Talep karşılandı” talebin manuel sonucudur; satış, görüşme, randevu veya
  ilk yanıt zamanı olarak ölçülmez. İletişim düğmesine tıklamak görüşme sayılmaz.
- Form Türkiye saatinde gösterilir; takvim doğrulanır, UTC ISO saklanır.
- Geciken, sahipsiz ve plansız açık talepler öncelik alır. Sayaçlar tüm kayıtları
  kapsar; filtreler kesişebilir. Her sayfada 200 kayıt, önceki/sonraki bağlantıları
  vardır. Kapalı talepler takip uyarılarına katılmaz.

İç not ve plan değişikliği aynı `takip_surumu` koşuluyla güncellenir. Eski sayfa
veya eşzamanlı düzenleme yeni veriyi ezemez. Güncelleme ve işlem geçmişi tek D1
transaction'dır; yalnız başarılı değişiklik geçmişe girer. Not/müşteri içeriği
geçmiş tablosuna tekrar kopyalanmaz. Notlar en fazla 2000 karakterdir.

`0010-talep-takip.sql` eklemeli migration'dır. Takip tarihi gelen veya 24 saatten
eski sahipsiz/plansız/yeni talepler mevcut işletim uyarısına katılır; aynı talep
bir kez sayılır. Panel kaydı uyarı özetini günceller; mevcut 6 saatlik cron yeni
olayı gönderir. Aynı sorun sürerken e-posta tekrar edilmez. Ayrıntı:
[İşletim uyarıları](./isletim-uyarilari.md).

`npm run test:talep-takip` gerçek D1 üzerinde doğrulama, Türkiye saati,
eşzamanlılık, audit hatasında rollback, eski kayıt korunması, kapanış/yeniden açma
ve danışman silinmesini sınar. Yerel HTTP form testi ayrıca Origin korumasını
ve panel/uyarı bağlantısını doğrular. Canlı müşteriler test verisi olarak değiştirilmez.

3 Ekim: gerçek ilk yanıt, randevu ve satış/kiralama için ayrı, varsayılan kapalı
kayıt akışı hazırlandı. Takip kapanışı yerine geçmez. Yeni tablo, açılma sınırı
ve test kanıtı: [Gerçek talep sonuçları](./talep-is-sonucu.md).
