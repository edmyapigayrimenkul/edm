# EDM dönüşüm olay modeli — EDM-037

2 Ekim 2026. Bu belge uygulama sözleşmesidir. Yeni ölçüm ucu veya ziyaretçi
izleme kodu bu adımda devreye alınmadı. Uygulama EDM-038, rapor ekranı EDM-040.

## Olayların anlamı

| Olay | Geçerli tetikleyici | Kaynak | İfade etmediği şey |
| --- | --- | --- | --- |
| `ilan_goruntulendi` | İlan ayrıntısı açıkken 3 saniye sonra gelen ve sunucunun kabul ettiği sinyal | Tarayıcı → doğrulanmış ilan sayacı | Tekil kişi, okuma, satın alma niyeti |
| `telefon_tiklandi` | EDM telefon bağlantısının gerçek kullanıcı eylemi | Tarayıcı | Başlamış/tamamlanmış telefon görüşmesi |
| `whatsapp_tiklandi` | EDM WhatsApp bağlantısının gerçek kullanıcı eylemi | Tarayıcı | Gönderilmiş mesaj veya yanıtlanmış görüşme |
| `talep_kaydedildi` | Sunucuda yeni talep ve bildirim kuyruğunun atomik D1 kaydı başarılı | Sunucu | HTTP 200, e-posta kabulü veya gelen kutusuna teslim |
| `talep_nitelikli` | Yetkili danışman gerçek görüşmeden sonra ihtiyacın ve hizmet uygunluğunun doğrulandığını kaydeder | Yetkili CRM işlemi | Form doldurmuş olmak veya işlemde statüsü |
| `ilk_yanit_kaydedildi` | Danışman müşteriye yaptığı ilk gerçek yanıtın zamanını kaydeder | Yetkili CRM işlemi | E-postanın otomatik gitmesi, atama veya not kaydı |
| `randevu_planlandi` | Tarihi/sorumlusu bulunan gerçek randevu CRM'de kaydedilir | Yetkili CRM işlemi | Randevu gerçekleşti veya müşteri geldi |
| `randevu_gerceklesti` | Danışman gerçekleşen randevuyu teyit eder | Yetkili CRM işlemi | Planlanmış randevu veya ilan formu |
| `islem_kapandi` | Gerçek satış/kiralama işlemi, işlem türü ve tarihiyle yetkili kişi tarafından teyit edilir | Yetkili CRM işlemi | Talebi kapatmak veya “Talep karşılandı” sonucu |

Nitelikli talep için kriter: müşteri ihtiyacı görüşmede doğrulandı, EDM'nin
hizmet kapsamına uygun ve somut sonraki adım belirlendi. Bu otomatik puanlama,
kredi/konut uygunluğu kararı veya hassas kişisel veri sınıflandırması değildir.
Kriter karşılanmadıysa nitelikli sayılmaz; görüşme yoksa bilinmiyor olarak kalır.

İş sonucu iptali/düzeltmesi yeni bir doğrulanmış düzeltme işlemiyle yapılmalıdır.
Eski olayı yeniden göndermek ikinci işlem/randevu üretmemelidir. EDM-039'un
`kapandi` talep statüsü ve beş kapanış sonucu bu olayların yerine kullanılamaz.

## Alanlar ve veri sınırı

| Alan | Kullanım | Kural |
| --- | --- | --- |
| `olay` | Sabit olay adı | Yalnız yukarıdaki kapalı liste |
| `surum` | Sözleşme sürümü | Başlangıç 1; anlam değişikliği yeni sürüm |
| `zaman` | İş/olay zamanı | UTC ISO, sunucu zamanı; manuel iş zamanı ayrıca doğrulanır |
| `gun` | Günlük rapor boyutu | Türkiye takvim günü; eski UTC sayacıyla sessiz birleştirilmez |
| `ilan_id` | İlgili portföy | İsteğe bağlı; mevcut ve halka açık ilan sunucuda doğrulanır |
| `sayfa_turu` | Kaynak sayfa grubu | `ilan`, `iletisim`, `degerleme`, `danisman`, `diger`; serbest URL değildir |
| `kanal` | Kampanya/kaynak grubu | Onaylı sabit kaynak listesi; eksik/uygunsuz değer `bilinmiyor` |
| `kampanya_kodu` | EDM kampanyası | Yalnız işletmenin önceden tanımladığı kod; serbest UTM metni saklanmaz |
| `adet` | Günlük toplu ölçüm | Başarılı olay için 1 artış; benzersiz ziyaretçi iddiası yok |
| `talep_id` | İç CRM ilişkilendirmesi | Yalnız sunucu/Access korumalı CRM; halka açık sayaç isteği kabul etmez |
| `islem_kimligi` | İç CRM mükerrerlik koruması | Tek iş işlemi için sabit kimlik; ziyaretçi/cihaz kimliği değildir |

Ölçüm tablosuna isim, telefon, e-posta, müşteri mesajı/notu, IP, kullanıcı aracısı,
kesin adres, serbest referer/URL sorgusu, konum veya cihaz kimliği kopyalanmaz.
Ölçüm amacıyla çerez, localStorage ziyaretçi kimliği, IP özeti/parmak izi veya
siteler arası eşleştirme oluşturulmaz. Mevcut cihaz favorileri ayrı işlevdir.

Kanal atfı yalnız ziyaretçinin mevcut sayfadaki onaylı kampanya koduna dayanır.
Sayfalar arasında kalıcı kullanıcı takibi veya görünmeyen ilk/son temas profili
kurulmaz. Bilinmeyen kaynak “organik” veya “doğrudan” diye tahmin edilmez.
Dış referer'ın tamamı ve `gclid`, `fbclid` gibi reklam kimlikleri tutulmaz.

Tarayıcı olayları yalnız sabit boyutlarla günlük toplamı günceller. Talep/iş
olaylarının mükerrerlik anahtarı sunucuda CRM işlemiyle bağlıdır; tarayıcıdan
“satış gerçekleşti”, talep kimliği veya ilk yanıt zamanı alınmaz. Müşteri
verisi içeren CRM zaten kişisel veri işlemidir; ondan ayrılmış toplu ölçüm
“sistemde hiç kişisel veri işlenmiyor” iddiasına dönüştürülemez. Cloudflare
istek/log akışı ve yedekler ayrıca değerlendirilmelidir.

Saklama süreleri, erişim ve olası aktarım koşulları EDM-019/020'deki gerçek işletme
ve hukuk incelemesiyle netleşmeden yeni ölçüm/veri aktarımı açılmaz. Bu belge
hukuki işleme şartı belirlemez ve canlı aydınlatma metninin yerine geçmez.

## Sayım doğruluğu ve idempotent kayıt

- İlan görüntüleme/tıklama bir **olay** sayısıdır. Geri gelme, yenileme ve başka
  cihazlar tekrar sayılabilir; çerezsiz toplam “tekil ziyaretçi” diye sunulamaz.
  Bot ve otomasyon davranışı ölçümü etkileyebilir; yanıltıcı kesinlik verilmez.
- Formun honeypot cevabı, iki dakika içindeki mükerrer talep için başarılı cevap,
  doğrulama reddi, hız sınırı veya D1 hatası yeni talep sayılmaz. Yalnız yeni
  D1 talep kaydı ölçülür. E-posta hatası başarılı talep sayısını azaltmaz.
- Talep olayı/rapor işareti asıl kayda transaction içinde bağlanır ya da asıl
  kayıttan deterministik üretilir. Ölçüm sağlayıcısının başarısızlığı müşteri
  kaydını veya form başarı sonucunu bozmaz; tekrar işlemi ikinci talep saymaz.
- İç CRM sonuçları sabit işlem kimliğiyle bir kez sayılır. Tekrar kaydetme,
  not güncelleme, kapanıp yeniden açılma satış/randevu üretmez. Düzeltmeler
  işlem geçmişinde izlenir ve güncel sayımı tutarlı biçimde değiştirir.
- İletişim tıklamaları, form talepleri ve iç CRM sonuçları farklı kanıt
  seviyeleridir; tıklayanların kaçının müşteri olduğu takip olmadan bilinmez.

## Raporlama sözleşmesi

Hafta Türkiye saati pazartesi 00:00'dan sonraki pazartesi 00:00'a kadar, son sınır
hariçtir. Zamanlar UTC saklanır; rapor için iki sınır da UTC'ye çevrilir.

Görüntülenme, telefon/WhatsApp tıklaması ve yeni talep adetleri ayrı gösterilir.
Nitelikli talep/randevu/işlem için yalnız teyitli iç kayıtlar sayılır. Ölçülmeyen
alan **“Henüz ölçülmüyor”**, yeterli dönem bulunmayan alan **“Veri oluşuyor”**;
kanıt olmaması sıfır gösterilmez. Geçmiş kayıtlar varsayımla doldurulmaz.

İlk yanıt süresi, talep oluşturma ile doğrulanmış ilk yanıt arasındadır. Negatif
süre reddedilir, aynı talebin sonraki yanıtları süreyi değiştirmez. Yanıtsız talep,
ilk yanıt kaydı olmayan açık taleptir; yalnız `yeni` statüsü değildir. Yanıt
verildiği bilinmeyen eski kayıtlar ayrıca belirtilir. EDM-039 bu kayıtları
üretmedi. 3 Ekim'de ayrı CRM akışı yerelde hazırlandı; yeni canlı kayıt kapalıdır.
Yeni uygulamada yanıtsız sayı yalnız `yanitlanmadi` teyitli açık taleplerdir;
kayıtsız/bilinmeyen talep ayrı gösterilir. [Kayıt kuralları](./talep-is-sonucu.md).

Aynı haftada açılan taleplerin kohortu üzerinden nitelikli/randevulu/işlemi
kapanan talep oranları tanımlanır; pay ve payda aynı talep kümesidir. Bu hafta
kapanan geçen ayki işlem bu haftanın yeni talep oranına eklenmez. Geçiş oranı
sadece gerçek ilişki kurulduğunda gösterilir. Görüntülenme → talep toplam oranı
tekil müşteri dönüşüm oranı değildir. Payda 0 ise oran **“Hesaplanamaz”** olur.
Rastgele hedef/yüzde, ilk yanıt süresi veya otomatik “başarı” üretilmez.

## Mevcut koddan doğrulanan başlangıç

- `src/pages/ilan/[slug].astro`: mevcut sinyal 3 saniyelik `sendBeacon`.
- `src/pages/api/goruntulenme.ts`: mevcut D1 `goruntulenme` tablosunda ilan/gün/
  adet; gün **UTC**, tekil kişi veya bot ayıklama kanıtı yok.
- `src/pages/api/talep.ts`: gerçek kayıt, honeypot ve mükerrer cevap ayrılabilir.
- `src/lib/talep-bildirim.ts`: talep/bildirim transaction'ı, sağlayıcı kabulü ayrı.
- İletişim/değerleme formu kaynak olarak mevcut `location.pathname` gönderiyor;
  onaylı UTM/kanal atfı ve iletişim tıklaması ölçümü henüz uygulanmadı.
- `src/lib/talep-takip.ts`: sorumlu/tarih/manuel talep kapanışı; gerçek satış,
  randevu ve ilk yanıt teyidi değildir.

EDM-038'de önce yukarıdaki sınırlar ve gerçek aydınlatma/işleme kararı tamamlanır.
Sonrasında sayaç için Origin, sabit olay/boyut, gerçek aktif ilan, hız sınırı ve
mükerrer iş kaydı koruması uygulanır. Eski UTC sayaç verisi farklı rapor dönemiyle
etiketlenir; Türkiye günlerine sessizce dönüştürülmez. EDM-040 bu tanımları ekran
etiketlerinde açıkça kullanır.
