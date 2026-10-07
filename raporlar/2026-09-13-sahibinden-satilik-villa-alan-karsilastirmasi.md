# Sahibinden satılık villa alan karşılaştırması

Tarih: 13 Eylül 2026  
Kapsam: Kullanıcının paylaştığı Sahibinden Ofisim satılık villa ilan giriş ekranları ile EDM yönetim panelinin karşılaştırılması.

## Sonuç

EDM formu, bir emlak ofisinin kendi portföyünü doğru yönetmesi için gereken temel villa alanlarını kapsıyor. Bu çalışma ile Sahibinden ekranında görülen ayrıntı grupları da veri modeline eklendi. Konut formunda 40 kategori alanı; yetki ve medya alanlarıyla birlikte 50 yapılandırılmış alan ve 6 grupta 149 seçilebilir nitelik bulunuyor.

Sahibinden’daki “seçim yapmak istemiyorum” seçenekleri ayrıca veri olarak saklanmadı. EDM’de boş bırakmak “bilgi doğrulanmadı veya girilmedi” anlamına geliyor; böylece seçilmeyen bir özellik yanlışlıkla taşınmaz niteliği gibi yayımlanmıyor.

## Alan karşılaştırması

| Sahibinden alanı | EDM karşılığı | Durum / karar |
|---|---|---|
| İlan başlığı, açıklama | Başlık, açıklama | Var; uzunluk ve zorunluluk sunucuda doğrulanıyor. |
| Fiyat | Fiyat, para birimi | Var; yazarken binlik ayraç ve altında yazıyla okunuş gösteriliyor. |
| Brüt, net, açık alan | Brüt yapı, net kullanım, özel bahçe/teras | Var; villa arsa alanı ayrıca tutuluyor. Net alanın brütten büyük olması reddediliyor. |
| Oda, salon, banyo, WC | Yapılandırılmış sayısal/seçimli alanlar | Var. |
| Bina yaşı, bulunduğu kat, kat sayısı | Bina ve kullanım bölümü | Var. |
| Isıtma | Isıtma tipi | Var. |
| Enerji Kimlik Belgesi | Enerji kimlik belgesi | Bu çalışmada A+–G, muaf ve bilinmiyor seçenekleriyle eklendi. |
| Mutfak | Mutfak tipi | Bu çalışmada tek seçimli alan yapıldı: açık, kapalı, yarı açık, ada, yok. Çelişkili iki mutfak seçimi engellendi. |
| Balkon, eşya, kullanım durumu | Bina ve kullanım bölümü | Var. |
| Site, site adı, aidat | Site ve koşullar | Var. |
| Kredi, tapu, takas, pazarlık | Finans ve hukuki alanlar | Var. |
| Gayrimenkul sahibi | Mülk sahibinin hukuki statüsü | Bu çalışmada yönetim içi alan olarak eklendi; halka açık özelliklere sızmıyor. |
| Adres ve harita | İl, ilçe, mahalle ve bölge konumu | Temel adres var. İlana özel harita pini ve kesin/gerçeğe yakın konum gizliliği açık geliştirme. |
| Cephe | Çoklu cephe alanı | Var. |
| İç özellikler | İç özellikler grubu | Paylaşılan uzun ekrandaki Alüminyum Doğrama, Amerikan Kapı, Hilton Banyo, Mutfak Doğalgazı, Termosifon ve biyometrik giriş dahil 56 seçenekle var. |
| Dış özellikler | Dış özellikler grubu | Paylaşılan ekrandaki tüm seçenekler var; mevcut EDM terimleri de geriye uyumluluk için korundu. |
| Muhit | Muhit grubu | Paylaşılan ekrandaki 24 seçenek var. |
| Ulaşım | Ulaşım grubu | Paylaşılan ekrandaki 18 seçenek var. |
| Manzara | Manzara grubu | Paylaşılan ekrandaki 8 seçenek var. EDM etiketleri “Deniz Manzarası” gibi anlamı açık biçimde saklıyor. |
| Konut tipi | Konut kat / plan tipi | Bu çalışmada tek seçimli alan yapıldı; ara kat, dubleks türleri, forleks, tripleks ve müstakil kapsanıyor. |
| Engelliye ve yaşlıya uygunluk | Engelli ve yaşlı erişimi grubu | Paylaşılan ekrandaki 13 seçenek var; “Merdiven” gibi belirsiz etiketler “Erişilebilir Merdiven” olarak netleştirildi. |
| Fotoğraf | Bilgisayar/telefon yükleme, sıralama ve kapak yönetimi | Sınır 50 fotoğrafa çıkarıldı. JPG, PNG, WebP ve HEIC kabul ediliyor; tarayıcıda küçültülüp R2’ye yükleniyor. |
| Video | Tanıtım videosu URL’si | Bağlantı ile var. Doğrudan video dosyası yükleme ve barındırma açık geliştirme. |
| Sanal tur | Sanal tur URL’si | Var. |
| Kimden / iletişim | Ofis ve atanmış danışman | “Kimden” sabit olarak emlak ofisi; danışman kaydı ve merkezi iletişim bilgileri kullanılıyor. Portal özelinde farklı iletişim tercihi eşlemesi açık geliştirme. |
| Sahibinden ilan no | Sahibinden ilan no | Yönetim içi alan olarak var ve halka açık teknik özelliklere sızmıyor. |

## Eklenen villa ayrıntıları

- `Mutfak Tipi` ile açık ve kapalı mutfak gibi birbirini dışlayan değerler tek seçimli hale getirildi. Eski “Açık Mutfak / Kapalı Mutfak / Amerikan Mutfak” kayıtları düzenleme formunda yeni alana taşınıyor.
- `Konut Kat Tipi` ile Sahibinden ekranındaki dokuz kat/plan seçeneği ve villa için `Müstakil` seçeneği eklendi.
- Konut nitelikleri; İç özellikler, Dış özellikler, Muhit, Ulaşım, Manzara ve Engelli ve yaşlı erişimi olarak ayrıldı. Uzun ekran büyütülerek incelendi; ilk görünümde okunmayan 20 iç özellik de kataloğa eklendi.
- Enerji kimlik belgesi yapı bilgisi; mülk sahibinin hukuki statüsü yalnızca yönetimde görülen yetki bilgisi olarak eklendi.
- Fotoğraf üst sınırı arayüzde ve yükleme API’sinde 35’e çıkarıldı. Mevcut fotoğraflar hesaba katılıyor; sınırı aşan dosyalar açık hata mesajıyla atlanıyor.

## Açık kalan işler

1. İlana özel harita pini: koordinat, konum doğruluğu ve halka açık yaklaşık/özel kesin konum ayrımı veri modeline eklenmeli.
2. Video dosyası: URL dışında doğrudan video yükleme, boyut/süre sınırı, poster kare ve depolama politikası kurulmalı.
3. Portal aktarım sözleşmesi: EDM alanlarının Sahibinden, Emlakjet ve Hepsiemlak alanlarına bire bir dönüşüm tablosu ile desteklenmeyen alan raporu oluşturulmalı.
4. Portal iletişim tercihleri: portal izin veriyorsa ilan bazında gösterilecek danışman/telefon tercihi aktarım eşlemesine eklenmeli.

Bu açıklar ilanı EDM’de eksiksiz kaydetmeyi engellemiyor. Portal otomasyonu devreye alınırken veri kaybını önlemek için dışa aktarım sözleşmesinin ayrıca tamamlanması gerekiyor.
