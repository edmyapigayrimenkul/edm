# İşletme göstergeleri — EDM-040

`/yonetim/gostergeler` mevcut D1 kayıtlarının salt okunur raporudur. Cloudflare
Access ve panelin yönetici kontrolü korunur. Bu ekran yeni çerez, ziyaretçi
kimliği veya müşteri profili oluşturmaz. Mevcut veri raporu migration gerektirmez;
ayrı gerçek CRM sonucu akışı 0011 migration ve etkinleştirme kararı gerektirir.

## Sayıların tanımı

- **Haftalık talep:** pazartesi 00.00 Türkiye saati dahil, sonraki pazartesi hariç
  oluşturulmuş `talepler` kayıtları. Devam eden haftanın sonu rapor anında kesilir.
  Başarılı HTTP yanıtı veya e-posta kabulü talep değildir; mükerrer ve honeypot
  yanıtlar ek kayıt oluşturmadığından sayılmaz.
- **Yeni / işlemde / kapandı:** aynı haftada oluşan taleplerin rapor anındaki
  durumları. Geçmiş hafta durumu sonradan değişebilir. Kapanış satış değildir;
  `tamamlandi` sonucu da doğrulanmış emlak işlemi olarak yorumlanmaz.
- **Kaynak sayfa:** yalnız iletişim, değerleme, ilan ve diğer/bilinmiyor grupları.
  Serbest kaynak adresleri ve sorgu parametreleri rapora alınmaz. UTM, sosyal
  medya, organik arama ve reklam atfı henüz yoktur.
- **Görüntülenme:** mevcut `goruntulenme` tablosunun UTC takvim haftası. UTC günü
  Türkiye'de 03.00'te başlar. Tekil ziyaretçi değildir; yenileme veya otomatik
  istek içerir. Tarih bazlı sayaçtan Türkiye saatine dönüştürme yapılamaz.
  Talep sayısıyla dönüşüm yüzdesi hesaplanmaz.
- **Şu an ilgilenilecek işler:** seçili haftadan bağımsız, tüm açık taleplerin
  mevcut sorumlu, takip tarihi ve 24 saat yaş durumları. Uyarılar çakışabilir.
  Gizli ekip üyesi iç sorumlu olabilir. Atanmamış kişi otomatik atanmaz.

Gelecek gün `—`, başlamış günün boş kaydı `0` gösterilir. Veri kaynağı hata
verirse ekran 503 döner ve sayılar sıfırmış gibi sunulmaz. Kayıtlı sayaçların
olmadığı geçmişte sıfır, hiç ziyaretçi olmadığına kanıt değildir. Silinen talep
kayıtları raporu da değiştirir. Rapor kişisel müşteri alanlarını okumaz.

## Açık kalan kapsam

EDM-040 kısmen tamamlanmıştır. Telefon/WhatsApp tıklaması için veri kaynağı yoktur.
3 Ekim'de nitelik, randevu, ilk yanıt ve işlem teyidi kaynağı yerelde hazırlandı;
canlıda varsayılan kapalıdır. Kapalıyken ekranda ölçülmediği belirtilir. “Yeni” durumundan yanıtsız
talep, takip tarihinden gerçek randevu veya kapanan talepten satış türetilmez.
Huninin sayı/oran kabulü bu olaylar oluşmadan tamamlandı sayılmaz.

EDM-037 olay sözleşmesi bu alanların tanımlarını içerir. Yeni ölçümün EDM-038
uygulaması EDM-019/020'nin gerçek veri akışı, aydınlatma ve işleme kararlarıyla
birlikte ele alınır. Önce gerçek CRM sonuçlarının kayıt akışı netleştirilmeli;
geçmişe tahmini olay eklenmemelidir.

Yeni alanların teyit kapsamı, oran paydası, aynı talebin tekrar sayılmaması,
kapalı bayrak ve 159 test/yerel HTTP kanıtı:
[Gerçek talep sonuçları](./talep-is-sonucu.md).

## Doğrulama

`npm run test:gostergeler`: Miniflare D1 üzerinde Türkiye/UTC hafta sınırları,
ISO ve SQLite tarihleri, kaynak mahremiyeti, güncel açık iş yükü, boş/gelecek
günler ve veritabanı hata davranışı. Gerçek müşteri kaydı test amacıyla
değiştirilmez. Yerel HTTP ve arayüz, staging dağıtımı ve üretim erişim sınırı
ayrıca doğrulanır; oturum açılmış canlı panel kontrolü ayrı bir kanıttır.

2 Ekim 2026 doğrulaması: toplam 148 test geçti (9 yeni rapor testi dahil).
Yerel gerçek HTTP'de 200, tarih reddinde 400, doğru Origin ile POST'ta 405,
veri kaynağı kesintisinde 503 görüldü. Originsiz POST Astro korumasında 403
döndü. Masaüstü 1280×800 ve mobil 390×844 kontrol edildi; mobilde yatay taşma
yoktu. Test kayıtları temizlendi, geçici sayaç tablo adı geri alındı.

Staging sürümü `8c375d6d-499b-4aec-be0b-e440eb91c346`; üretim sürümü
`77fc828b-0c0b-47de-9d95-50808e5752b2`. Her iki ortamda rapor oturumsuz
istekte Access'e 302 yönlendi. Üretim ana sayfa, ilan listesi ve sitemap 200
döndü; yönetim yanıtları no-store. Üretimde müşteri alanı okumayan sayımda
1 açık / sorumlu atanmamış talep vardı; bu kayıt değiştirilmedi. Canlı panelin
oturum içindeki rapor içeriği bu dağıtımda ayrıca görüntülenmedi. Kaynak ve
derleme içinde gerçek yerel sır değerleriyle eşleşme bulunmadı; sır değişmedi.

3 Ekim: kapalı gerçek CRM sonucu akışı ayrı staging sürümü
`368a26f9-20f8-4ead-9a3a-7c059cd84237` içinde hazırlandı. Üretim bu belgedeki
77fc sürümünde kaldı. Güncel doğrulama: [Gerçek talep sonuçları](./talep-is-sonucu.md).
