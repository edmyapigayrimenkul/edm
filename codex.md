# EDM Yapı & Gayrimenkul — Genel Proje Hafızası

Bu dosya projenin yaşayan hafızası ve ana iş listesidir. Yeni bir çalışma başlarken
önce bu dosya, ardından yapılacak işle ilgili kaynak dosyalar okunur. Tamamlanan her
iş aynı çalışma içinde burada güncellenir; yalnızca kodu değiştirmek yeterli sayılmaz.

Son güncelleme: 3 Ekim 2026

## Dosyayı kullanma ve güncelleme kuralı

- İşler aşağıdaki sıraya göre ele alınır. Bir iş engellenmedikçe sonraki faza geçilmez.
- Durumlar: `[ ]` bekliyor, `[-]` devam ediyor, `[x]` tamamlandı, `[!]` dış bilgi/karar
  bekliyor.
- Bir işe başlanınca kutusu `[-]` yapılır ve **Çalışma günlüğü** bölümüne tarih eklenir.
- Bir iş ancak kabul ölçütleri doğrulandıktan sonra `[x]` yapılır.
- Tamamlanan maddenin altına kısa biçimde `Tamamlandı: YYYY-AA-GG — ...` yazılır;
  ilgili commit varsa kimliği eklenir.
- Kullanıcıdan fotoğraf, hukuki metin, belge veya işletme kararı bekleyen işler `[!]`
  olarak işaretlenir. Beklenen şey açıkça yazılır.
- Yeni bulgu ilgili faza yeni ve benzersiz bir `EDM-###` kimliğiyle eklenir.
- Canlıya dağıtım ayrı bir adımdır. Kodun tamamlanması, canlıya çıktığı anlamına gelmez.
- Dağıtımdan sonra ilgili canlı sayfa, form veya API tekrar doğrulanır ve sonuç günlüğe
  eklenir.
- Bu dosya ayrıntılı incelemenin özeti ve uygulama kaydıdır. İlk denetim raporu:
  [WEB-SITESI-ANALIZI-2026-09-10.md](./WEB-SITESI-ANALIZI-2026-09-10.md)

## Projenin amacı

EDM Yapı & Gayrimenkul'ün Silivri ve Trakya odağındaki kurumsal web sitesi;
güncel portföyü doğru sunmalı, ziyaretçinin uygun ilanı kolayca bulmasını sağlamalı,
güven oluşturmalı ve telefon, WhatsApp, randevu veya değerleme talebine dönüşen
müşteri ilişkisini kayıpsız yönetmelidir.

Ana marka konumu: **“Silivri’de ev, Trakya’da toprak.”**

Canlı adres: <https://edmyapigayrimenkul.com>

## Teknik yapı ve değişmemesi gereken kararlar

- Ana site `site/` altında Astro 7 ve Cloudflare Worker ile sunucu tarafında üretilir.
- D1, ilanları ve panel verilerini tutar; R2 panelden yüklenen fotoğraf, video ve
  video posterlerini tutar.
- Aynı Worker hem web isteklerini hem günde dört kez Emlakjet senkronunu yürütür.
- Portalda kaybolan ilan silinmez, `pasif` yapılır. `kaynak='elle'` ilanlara senkron
  dokunmaz.
- Portal sıfır ilan döndürürse hiçbir ilan pasifleştirilmez. Bu emniyet freni korunur
  ve kısmi sonuçlara karşı güçlendirilir.
- Panel düzenlemeleri portal senkronunun üstündedir; insan kararı senkronla ezilmez.
- `/yonetim` Cloudflare Access arkasındadır. Panel API uçları bu yol altında kalır.
- `workers.dev` kapalıdır.
- ClientRouter kullanılan sayfalarda tarayıcı kurulumu `herSayfada()` üzerinden
  tekrarlanır; olay dinleyicileri sayfa geçişinde temizlenir.
- JavaScript çalışmazsa ana içerik görünür kalır. `prefers-reduced-motion` desteği ve
  animasyon güvenlik ağı korunur.
- Site kodu, arayüz metinleri, dosya/değişken adları ve commit mesajları Türkçedir.
- Tasarım sistemi: kırmızı `#F0000D`, derin kırmızı `#C4030F`, mürekkep `#121316`,
  kâğıt `#F4F4F3`, kireç `#E4E4E1`, kurşun `#8A8B8F`; Fraunces, IBM Plex Sans ve
  IBM Plex Mono kullanılır.
- Hepsiemlak doğrudan sunucudan kazınamaz; görsel aktarımı gerektiğinde yönetimdeki
  tarayıcı akışı kullanılır.
- Nominatim Worker ortamında güvenilir çalışmadığı için yeni konumlar yerel betikle
  çözülür.
- Google Places en fazla beş yorum döndürür; ad, avatar, kaynak bağlantısı ve gerekli
  atıflar korunur.
- `postedm/` ayrı Git deposudur. Sosyal medya tarafında değişiklik yaparken iki deponun
  durumunu ayrı kontrol et.

## 10 Eylül 2026 doğrulanmış başlangıç durumu

- 46 aktif ilan: 41 satılık, 5 kiralık.
- 23 konut ve 23 arsa/tarla kaydı.
- Alt türler: 16 satılık tarla, 10 satılık villa, 6 satılık daire, 5 villa imarlı
  arazi, 3 kiralık daire, 2 kiralık villa, 2 satılık müstakil ev ve 2 toplu konut
  için arazi.
- Bölge dağılımı: Silivri 35, Edirne Merkez 4, Meriç 3; Enez, Marmaraereğlisi,
  Lalapaşa ve Malkara birer ilan.
- Dört danışman profili var. Portal eşleşmeleri: Metin Özdoğan 31, Ercan
  Taşdemirler 13, Basri Çelik 2. Doğukan Özdoğan broker olarak bütün portföyü
  yönetiyor; portal eşleşmesi yok.
- Son beş otomatik senkron başarılı; başarısız okunan ilan ve hata yok.
- Site haritasında 64 URL var: 46 ilan, 7 bölge detayı, 4 danışman detayı ve 7 temel
  sayfa. Denetimde hepsi HTTP 200 döndü.
- Denetlenen 64 sayfanın her birinde tek H1, açıklama ve kendisiyle eşleşen kanonik
  adres vardı; JSON-LD blokları JSON olarak ayrıştırıldı.
- `www` adresi kök alana 301 ile gidiyor; `/404` gerçek 404 döndürüyor.
- Kimliksiz `/yonetim` isteği Cloudflare Access girişine yönleniyor.
- 390 × 844 mobil görünümde sayfa düzeyinde yatay taşma bulunmadı.
- `npm run build` tamamlandı. Wrangler'ın kullanıcı dizinindeki günlük dosyasına
  yazma izni uyarısı derlemeyi durdurmadı.
- Search Console, analitik hesapları, e-posta teslim kayıtları, Cloudflare yedekleme
  ayarları ve yönetim panelindeki üretim yazma işlemleri denetlenmedi.

## Tamamlanmış ana yetenekler

- [x] Kurumsal kimlik ve duyarlı kurumsal web sitesi.
- [x] D1 tabanlı canlı portföy ve Emlakjet'ten günde dört kez otomatik senkron.
- [x] Boş portal yanıtına karşı toplu pasifleştirme emniyet freni.
- [x] İlan arama, işlem/tür/ilçe filtreleri ve sıralama.
- [x] İlan detayında galeri, özellikler, yaklaşık konum, danışman ve benzer ilanlar.
- [x] Üyeliksiz, tarayıcıda saklanan favoriler.
- [x] Danışman listesi ve danışman detay sayfaları.
- [x] Portföyden türetilen bölge rehberi ve yedi bölge detay sayfası.
- [x] İletişim ve ücretsiz değerleme formları; D1 kayıt ve e-posta bildirim altyapısı.
- [x] Cloudflare Access korumalı yönetim paneli.
- [x] Panelde talepler, ilan düzeltmeleri, görsel sıra/kapak/gizleme/yükleme, ekip,
  yorum, metin, ayar ve paylaşım görseli yönetimi.
- [x] İlan görüntülenme sayacı ve günlük işletme özeti altyapısı.
- [x] Google yorumlarını alma ve panelden yönetme altyapısı.
- [x] Sosyal paylaşım düğmesi ve markalı paylaşım görseli üretimi.
- [x] Sitemap, robots, kanonik adres, Open Graph ve yapılandırılmış veri temeli.
- [x] Sayfa geçişleri, hareket katmanı ve azaltılmış hareket desteği.

## Sıralı yapılacaklar

### Faz 1 — Talep kaybını ve yanlış bilgiyi önle

- [x] **EDM-001 — İletişim formunun başarı/hata akışını düzelt.**
  - `fetch` yanıtının `ok` durumu ve JSON gövdesi kontrol edilmeli.
  - Yalnızca D1 kaydı başarılıysa başarı ekranı açılmalı.
  - Hata halinde girilen bilgiler korunmalı, açık hata metni ve yeniden deneme olmalı.
  - WhatsApp yedeği hata halinde kullanılabilir kalmalı.
  - Kabul: başarısız API yanıtı başarı ekranı göstermez; başarılı kayıt bir kez yazılır.
  - Tamamlandı: 2026-09-10 — API yanıtı doğrulandı; hata kutusu, veri koruma,
    yeniden deneme ve form verileriyle hazırlanan WhatsApp yedeği eklendi. Yerel Worker
    üzerinde başarı, bağlantı hatası ve hata sonrasında yeniden deneme senaryoları geçti.

- [x] **EDM-002 — Değerleme formunun başarı/hata akışını düzelt.**
  - EDM-001 ile aynı güvenilirlik davranışı uygulanmalı.
  - Rapor gönderme vaadiyle girilen e-posta dahil form değerleri hata halinde korunmalı.
  - Kabul: ağ ve 4xx/5xx hataları başarı gibi görünmez; tekrar deneme veri kaybetmez.
  - Tamamlandı: API durumu ve JSON sonucu doğrulanıyor; hata kutusu, yeniden deneme ve
    doldurulan alanlardan hazırlanan WhatsApp yedeği eklendi. Başarı yalnızca D1 kaydı
    onaylandıktan sonra gösteriliyor.

- [x] **EDM-003 — Talep API'sinin sunucu doğrulamasını güçlendir.**
  - Talep türüne göre zorunlu alanlar sunucuda da doğrulanmalı.
  - Telefon tek biçime normalize edilmeli; yinelenen talep denetimi bu değerle yapılmalı.
  - Uzunluk, e-posta biçimi, mülk tipi, ilçe ve sayısal alanlar izinli değerlere göre
    kontrol edilmeli.
  - Kabul: tarayıcı doğrulamasını atlayan bozuk istekler D1'e yazılmaz.
  - Tamamlandı: iletişim/değerleme alanları ayrı doğrulanıyor; telefon E.164 biçimine
    getiriliyor; e-posta, konu, mülk tipi, ilçe, m², metin sınırları ve değerleme onayı
    sunucuda denetleniyor. İlgisiz tür alanları kayda taşınmıyor.

- [x] **EDM-004 — Talep ucuna gerçek hız sınırı ve kötüye kullanım koruması ekle.**
  - Mevcut “aynı telefon / iki dakika” kontrolü korunabilir fakat tek başına yeterli değil.
  - IP ve zaman penceresi tabanlı sınır veya Cloudflare Rate Limiting değerlendirilmeli.
  - Bot tuzağı korunmalı; normal ziyaretçi gereksiz CAPTCHA ile karşılaştırılmamalı.
  - Kabul: farklı sahte telefonlarla yoğun istek kayıt ve e-posta seli oluşturamaz.
  - Tamamlandı: Cloudflare Rate Limiting API ile IP başına 6/dakika ve genel
    30/dakika sınırı eklendi. Bot tuzağı ile normalize telefonun iki dakikalık tekrar
    engeli korunuyor; aşım `429` ve `Retry-After: 60` döndürüyor.

- [x] **EDM-005 — Satılık/kiralık çelişkili Araptepe kayıtlarını düzelt.**
  - `19673570` satılık, `19797428` kiralık kayıtları kaynak portallarda ve işletme
    bilgisiyle karşılaştırılmalı.
  - Satılık ilanın “Kiralık” geçen başlığı ve açıklaması doğru bilgiyle düzeltilmeli.
  - İki kayıt aynı mülkün farklı işlemleri ise sayfalarda bu ilişki açıkça anlatılmalı.
  - Kabul: işlem rozeti, başlık, fiyat birimi ve açıklama birbirini doğrular.
  - Tamamlandı: Emlakjet'in “aynı taşınmaz” bağlantısıyla kayıt ilişkisi doğrulandı.
    Satılık ve kiralık seçeneklere işlemle uyumlu ayrı başlık/açıklama yazıldı; iki detay
    sayfasına birbirinin güncel işlem türü, fiyatı ve ilan numarasını gösteren kart eklendi.
    Düzeltmeler senkrondan sonra da uygulanır, panel geçersiz kılması bunların üstündedir.

- [x] **EDM-006 — Aynı başlıklı/mükerrer olabilecek ilanları doğrula.**
  - Yıldırım Beyazıt 9.456 m² tarla kayıtları `19290394` ve `19303282` kontrol edilmeli.
  - Aynı mülkse mükerrerlik yönetilmeli; farklı mülkse ayırıcı başlık/konum yazılmalı.
  - İlanlar kullanıcı teyidi olmadan silinmemeli.
  - Kabul: ayrı URL'lerde açıklanamayan aynı başlık ve içerik kalmaz.
  - Tamamlandı: iki kaydın fotoğrafları indirildi; `19303282` içindeki dört görselin
    `19290394` içindeki aynı parsel fotoğraflarının kırpılmış kopyaları olduğu, tapu
    ekranında da 1134 ada / 51 parsel / 9.456,55 m² bilgilerinin eşleştiği doğrulandı.
    Güncel ve düşük fiyatlı `19290394` ana kayıt seçildi. Eski kayıt silinmedi; kamu
    portföyünden tekilleştirildi, eski URL ana ilana 301 yönleniyor, panelde mükerrer
    rozeti var ve sosyal kuyruğa eklenmesi engellendi.

- [x] **EDM-007 — Bölge rehberi fiyat istatistiklerini işlem türüne göre ayır.**
  - Aylık kiralar ile satış bedelleri aynı min–maks aralığına girmemeli.
  - Satılık konut, kiralık konut ve satılık arsa/tarla ayrı gösterilmeli.
  - Kiralık değerlerde `/ay`, satışlarda toplam bedel açıkça yazılmalı.
  - Kabul: Silivri sayfasında 20.000 ₺ kira ile 147.935.000 ₺ satış tek aralık değildir.
  - Tamamlandı: fiyatlar işlem türü, mülk grubu ve para birimine göre ayrı aralıklara
    bölündü. Rehber kartı ile bölge detayında satılık konut, kiralık konut ve satılık
    arsa/tarla öncelikli gösteriliyor; aylık kira `/ay` ile, yabancı para ayrı satırda.

- [x] **EDM-008 — Ana sayfadaki “dönüm arazi” hesabını düzelt.**
  - `toplamAlan` yalnızca arsa/tarla kayıtlarından hesaplanmalı veya adı toplam portföy
    alanı olarak değiştirilmelidir.
  - Aynı fiziksel mülkün satış/kiralama kayıtları iki kez sayılmamalı.
  - Başlangıç denetiminde arsa/tarla kayıtları toplamı 198.466 m² çıktı; canlı veriyle
    yeniden doğrulanmalı.
  - Kabul: gösterilen sayı ve etiket aynı veri kümesini anlatır.
  - Tamamlandı: alan toplamı yalnız `arsa` grubundan hesaplanıyor; açıkça ilişkilendirilmiş
    aynı taşınmaz kayıtları ve mükerrer portal kayıtları bir kez sayılıyor. Canlı D1'de
    22 aktif arsa/tarla için 189.010 m² hesaplandı; arayüz bunu 189 dönüm gösteriyor.

- [x] **EDM-009 — İlanların alan verisini açık biçimde ayır.**
  - Konutta net/brüt yapı alanı, villada arsa/yapı alanı, arazide toplam parsel/satılan
    hisse alanı ayrı alanlar olmalı.
  - Kart m² değeri ve birim fiyatın hangi alana dayandığı belli olmalı.
  - Kabul: tek bir belirsiz `m²` değeri farklı anlamlarda kullanılmaz.
  - Tamamlandı: kategoriye göre brüt/net yapı, arsa, toplam parsel ve satılan hisse
    alanları ayrı anahtarlara taşındı. Kartlar alan türünü yazıyor; satış birim fiyatı
    hesaplandığı alanı hem detayda hem paylaşım verisinde belirtiyor. Netin brütten,
    hissenin toplam parselden büyük olması istemci ve sunucuda engelleniyor. Canlı veri
    kontrolünde portalın villa arsa ölçüsünü eski “Brüt Metrekare” alanına kopyaladığı
    görüldü; açık arsa ve net yapı verisi varken bu kopya yapı brütü sayılmıyor.

- [x] **EDM-010 — 46 aktif ilan için içerik kalite kontrolü yap.**
  - İşlem türü, fiyat, başlık, kategori, net/brüt/arsa alanı, danışman ve özellik
    çelişkileri taranmalı.
  - `19802542` kaydındaki “site içinde” / “Site İçerisinde: Hayır” çelişkisi çözülmeli.
  - Portalın yazım hataları gerektiğinde panel geçersiz kılmalarıyla düzeltilmeli.
  - Kabul: yayımdaki her ilanın temel alanları için kontrol kaydı oluşur.
  - Tamamlandı: 46 etkin kaynak kaydından doğrulanmış mükerrer ayıklandı; 45 yayımlanan
    ilanın her biri için `raporlar/2026-09-12-ilan-kalite.md` kontrol kaydı oluşturuldu.
    34 kayıtta tanımlı kurallar uyarı üretmedi; 7 kayıt teyit, 4 kayıt bilgi çelişkisi
    taşıyor. Bunlar kesin doğruluk onayı değildir; işletme teyitleri EDM-064'e ayrıldı.
    Panel İlanlar ekranı aynı kuralları güncel portföyde çalıştırıp Düzelt bağlantıları
    gösteriyor. `19802542` dahil açık site çelişkileri ve başlık yazımları düzeltildi.

### Faz 2 — Mobil kullanım ve iletişim akışını tamamla

- [x] **EDM-011 — Mobil ilan galerisini düzelt.**
  - 390 px ekranda 2–5. fotoğraf düğmeleri yaklaşık 13 × 9,75 px'e sıkışıyor.
  - Mobilde bütün önizlemeler parmakla kaydırılan, yeterli boyutta kartlar olmalı.
  - Tam ekran galeri, sağ/sol ok, dokunma ve Escape davranışı korunmalı.
  - Kabul: 360, 390 ve 430 px genişlikte her önizleme görünür ve dokunulabilir.
  - Tamamlandı: mobil flex kuralının yalnızca doğrudan çocuk olan kapak düğmesine
    uygulanması ve geçersiz kalan `display: contents` sırası düzeltildi. Beş önizlemenin
    her biri 360 px ekranda 302 × 227, 390 px ekranda 328 × 246, 430 px ekranda
    361 × 271 px ölçüldü. Şerit sayfada yatay taşma üretmiyor; kartlar başlangıca
    oturan zorunlu kaydırma noktalarına sahip. “Tüm fotoğraflar” düğmesi görselin
    üzerinden alınıp 44 px dokunma alanıyla alta taşındı. Tam ekran sayaç, ileri/geri,
    klavye oku ve Escape canlıda doğrulandı; dikey parmak hareketi artık yanlışlıkla
    fotoğraf değiştirmiyor. Masaüstü ana görsel ile dört önizlemenin alt hizası eşitlendi.

- [x] **EDM-065 — Ana sayfa ilan fiyatlarının görsel hiyerarşisini düzelt.**
  - Kart fiyatında teknik veri yazı tipi kullanılmamalı; fiyat ilk bakışta okunmalı.
  - Fiyat önceki sağ alt konumunu korurken oda/alan/nitelik etiketleriyle çakışmamalı.
  - Kısaltmalar ziyaretçinin çözmesini gerektirmemeli ve para birimi korunmalı.
  - Kabul: mobil ve masaüstü kartlarda fiyat taşmadan, gövde yazı ailesiyle ve
    önceki sağ alt konumunda görünür.
  - Tamamlandı: fiyat IBM Plex Mono'dan Plex Sans 650 ağırlığa alındı, responsive
    18–21 px aralığı ve sekmeli rakamlar korundu. Kullanıcı geri bildirimiyle fiyatın
    önceki sağ alt konumu korundu; özellikler solda kalıyor. `mn` kısaltması açık
    “milyon” sözcüğüne çevrildi. Kahraman altındaki fotoğraf şeridinin fiyatları da
    aynı tipografik sisteme bağlandı.

- [x] **EDM-012 — “Yerinde görmek istiyorum” akışına ilan bağlamı taşı.**
  - İlan kimliği, başlığı ve kaynak sayfa iletişim formuna gelmeli.
  - Form konusu otomatik seçilmeli ve talep kaydında ilan kimliği ayrı alan olmalı.
  - Kabul: panelde talebin hangi ilan için geldiği doğrudan görülür.
  - Tamamlandı: 13 Eylül 2026 — İlan kimliği, başlığı ve kaynak yolu doğrulanan form
    alanlarıyla talebe taşındı; panelde ilanı açma ve düzenleme bağlantıları eklendi.
    Canlı villa akışında URL, ön dolu mesaj ve ham HTML alanları doğrulandı.

- [x] **EDM-013 — Mobil filtre deneyimini yeniden düzenle.**
  - Yatay satırda görünmeyen filtreler için açılır filtre paneli değerlendirilmeli.
  - Seçili filtrelerin özeti ve kolay temizleme sunulmalı.
  - Kabul: tek elle tüm filtrelere ulaşılır; seçili durum açıkça görülür.
  - Tamamlandı: 13 Eylül 2026 — 44 px dokunma alanlı mobil filtre paneli, seçili
    rozetler, rozet bazlı kaldırma, tümünü temizleme ve sonuç sayılı kapatma eklendi.

- [x] **EDM-014 — Bütçe ve mahalle filtrelerini ekle.**
  - Satılık ve kiralık için anlamlı fiyat aralıkları ayrı ele alınmalı.
  - İlçeye göre mahalle seçenekleri daraltılmalı.
  - Kabul: URL paylaşılabilir; geri/ileri gezinmesinde filtre durumu korunur.
  - Tamamlandı: 13 Eylül 2026 — Satılık, aylık, günlük, sezonluk ve devren işlem
    türleri için ayrı TL bütçeleri; ilçeye bağımlı mahalle seçenekleri ve URL durumu eklendi.

- [x] **EDM-015 — Oda, alan ve arazi alt türü filtrelerini ekle.**
  - Konutta oda ile net/brüt alan; arazide tarla, villa imarlı ve toplu konut için
    seçenekleri desteklenmeli.
  - Kabul: filtreler veri tiplerine göre anlamlıdır; uygulanamaz seçenekler gösterilmez.
  - Tamamlandı: 13 Eylül 2026 — Mülk grubuna bağımlı alt tür ve alan aralıkları ile
    yalnızca konutta etkinleşen oda filtresi eklendi. Canlı 390 px testinde beş filtrenin
    birleşimi tek doğru villayı buldu; oda rozetini kaldırınca sonuç 1’den 6’ya çıktı.

- [x] **EDM-016 — Harita açıklamasını doğru hale getir.**
  - Daire gerçek idari sınır değilse “mahalle sınırı” denmemeli.
  - Önerilen ifade: “Harita mahallenin yaklaşık konumunu gösterir; mülkün kesin
    konumunu göstermez.”
  - Kabul: metin, çizilen şeklin ne olduğunu doğru açıklar.
  - Tamamlandı: 13 Eylül 2026 — Harita notu yaklaşık mahalle konumunu anlattığı açık
    ifadeyle değiştirildi; sınır gösterdiği yönündeki yanlış iddia kaldırıldı.

- [x] **EDM-017 — İletişim metinlerini profesyonelleştir.**
  - “Ofiste kimse varsa buradan da ulaşabilirsiniz” gibi ifadeler sadeleştirilmeli.
  - Telefon ve WhatsApp için gerçek ulaşılabilir saatler belirtilmeli.
  - Kabul: bütün iletişim sayfalarında saatler ve beklenti tutarlıdır.
  - Tamamlandı: 14 Eylül 2026 — İletişim, ana sayfa, değerleme ve alt bilgideki
    ulaşılabilirlik metinleri tek kaynağa bağlandı. Pazartesi–Cumartesi 09:00–19:00,
    pazar randevuyla ve “mesajlar çalışma saatleri içinde sırayla yanıtlanır” beklentisi
    tutarlı biçimde gösteriliyor; değerler artık yönetim panelindeki Ayarlar ekranından
    değiştirilebiliyor. Uzun e-posta adresinin mobil taşma riski de giderildi.

- [x] **EDM-018 — Favori listesini tek mesajla paylaşma özelliği ekle.**
  - Seçilen ilanlar başlık, fiyat ve bağlantılarıyla WhatsApp veya sistem paylaşımına
    aktarılmalı.
  - Kabul: kullanıcı favorilerini tek tek kopyalamadan ofise iletebilir.
  - Tamamlandı: 14 Eylül 2026 — Kaydettiklerim ekranına WhatsApp, cihaz paylaşımı/pano
    ve listeyi temizleme eylemleri eklendi. Mesaj her seçimin tam başlığını, biçimlenmiş
    fiyatını ve doğrudan ilan bağlantısını içeriyor; yayından kalkmış eski favoriler
    listeden güvenli biçimde ayıklanıyor. Mobilde eylemler tek sütunda tam genişlikte.

### Faz 3 — Gizlilik, güvenlik ve erişilebilirlik

- [-] **EDM-019 — Gerçek veri akışına uygun aydınlatma metni hazırla.**
  - Veri sorumlusu, işlenen veriler, amaç, hukuki sebep, aktarım, saklama yaklaşımı,
    başvuru kanalı ve ilgili kişi hakları açıklanmalı.
  - Cloudflare, e-posta hizmeti ve işletmedeki gerçek erişim/aktarım süreci hesaba katılmalı.
  - Form çevresinden ve alt bilgiden erişilebilir bağlantı verilmeli.
  - Beklenen: işletme bilgileri ve hukuk uzmanı tarafından gözden geçirilmiş metin.
  - İlerleme: 18 Eylül 2026 — İletişim/değerleme formları, D1, Cloudflare Email
    Service, WhatsApp yedeği, cihaz favorileri ve çerezsiz görüntülenme sayacının gerçek
    veri akışı çıkarıldı. Canlı metin için vergi levhasındaki tam veri sorumlusu unvanı,
    saklama süreleri ve erişen kişi listesi bekleniyor. Uygulama rehberi:
    [2026-09-18-kurulum-ve-guven-rehberi.md](./raporlar/2026-09-18-kurulum-ve-guven-rehberi.md)

- [-] **EDM-020 — Aydınlatma ve gerekiyorsa açık rıza akışını ayır.**
  - Tek genel “izin veriyorum” cümlesi yerine gerçek hukuki işleme şartına uygun akış
    belirlenmeli.
  - “Bilgiler üçüncü kişilerle paylaşılmaz” iddiası gerçek teknik akışla doğrulanmalı.
  - Beklenen: hukuk uzmanının hangi işlem için rıza gerektiğine dair kararı.
  - İlerleme: formdaki genel izin cümlesi ile “üçüncü kişilerle paylaşılmaz” iddiasının
    gerçek teknik akışla uyumlu olmadığı tespit edildi. Aydınlatma bağlantısı ile gerekli
    olabilecek rıza işlemi ayrı tasarlanacak; resmî unvan kesinleşmeden hukuki metin
    canlıya alınmayacak.

- [x] **EDM-021 — Form erişilebilirliğini tamamla.**
  - Hatalı alanlara `aria-invalid` eklenmeli ve hata metni `aria-describedby` ile bağlanmalı.
  - Onay kutusu hatası görünür ve ekran okuyucuyla anlaşılır olmalı.
  - Gönderim durumu ve hata mesajı canlı bölge üzerinden bildirilmelidir.
  - Kabul: yalnız klavye ve ekran okuyucu akışında hata alanı ve düzeltme yolu anlaşılır.
  - Tamamlandı: 14 Eylül 2026 — İletişim ve değerleme alanları kalıcı kimliklerle hata
    açıklamalarına bağlandı; geçersiz alanlara `aria-invalid` ekleniyor ve kullanıcı yazmaya
    başlayınca hata durumu temizleniyor. İlk geçersiz alana odak, onay kutusunun ayrı hata
    açıklaması, gönderiliyor/başarısız durumları için canlı bölge ve başarı kartına odak
    aktarımı eklendi. Boş form kabulünde erişilebilirlik ağacında bütün hata açıklamaları
    alan adlarıyla birlikte ve ilk alan odakta doğrulandı.

- [x] **EDM-022 — Filtre ve sonuç erişilebilirliğini tamamla.**
  - Sonuç sayısı değişiklikleri erişilebilir canlı bölgede duyurulmalı.
  - Filtre düğmelerinin rolü ve basılı durumu tutarlı olmalı.
  - Kabul: klavyeyle filtreleme yapılır ve sonuç değişimi anlaşılır.
  - Tamamlandı: 15 Eylül 2026 — Görünür sonuç sayısı `status` canlı bölgesine
    dönüştürüldü ve sonuç ızgarası bu açıklamaya bağlandı. Tam/kısmi sonuçlar ekran
    okuyucuya doğal Türkçe cümleyle bildiriliyor. Yerel erişilebilirlik kabulünde Konut
    filtresi yalnız Space tuşuyla seçilip kaldırıldı; odak filtrede kaldı, `aria-pressed`
    durumları, URL ve 46 → 23 → 46 sonuç geçişleri birlikte doğrulandı.

- [x] **EDM-023 — Klavye odağı, kontrast ve dokunma hedeflerini denetle.**
  - Mobil galeri, menü, filtreler, sabit iletişim çubuğu ve form alanları dahil edilmeli.
  - Azaltılmış hareket ve JavaScript kapalı durum yeniden doğrulanmalı.
  - Kabul: kritik akışlarda görünür odak, okunabilir kontrast ve yeterli hedef boyutu vardır.
  - Tamamlandı: 15 Eylül 2026 — Genel odak göstergesi beyaz iç çizgi ve koyu kırmızı
    dış halkayla açık/koyu zeminde görünür hale getirildi; form alanlarının odağı ezen
    yerel kurallar kaldırıldı. Açık zemindeki küçük gri ve kırmızı metinler AA uyumlu
    tonlara taşındı. Mobil menü açılışta ilk bağlantıya odaklanıyor, Tab odağı menüde
    döndürüyor ve Escape odağı menü düğmesine geri veriyor; menü modal olarak
    tanımlandı ve JavaScript kapalıyken normal belge akışında kullanılabilen gezinme
    yedeği eklendi. Mobil menü, filtreler, seçili filtreler, galeri kontrolleri ve ilan
    iletişim çubuğu en az 44 piksel hedefe sahip. Tarayıcı kabulünde form odağı 47 piksel,
    galeri kontrolleri 44×44 piksel ölçüldü; galeri 1/10 → 2/10 → 1/10 ve Escape akışını
    geçti. Azaltılmış hareket yedeği, 43 test, üretim derlemesi ve `git diff --check`
    doğrulandı.

- [x] **EDM-024 — Access jeton doğrulamasını sıkılaştır.**
  - Beklenen `audience` eksikse panel güvenli biçimde kapalı kalmalı.
  - `issuer` değeri beklenen takım alanıyla doğrulanmalı.
  - Anahtar getirme hataları gözlemlenebilir olmalı.
  - Kabul: yanlış uygulama, issuer veya eksik yapılandırmayla panel açılamaz.
  - Tamamlandı: 15 Eylül 2026 — Access claim doğrulaması ayrı, saf bir güvenlik
    katmanına çıkarıldı. Ekip alanı güvenli biçimde normalleştiriliyor; issuer yalnızca
    bu alanın tam HTTPS adresiyle, audience yalnız yapılandırılmış uygulama etiketiyle
    ve süre `exp > şimdi` koşuluyla kabul ediliyor. Ekip alanı veya audience eksikse,
    farklı uygulama/issuer geldiyse panel kapalı kalıyor. JWKS eksik yapılandırma,
    HTTP, ağ/JSON ve geçerli anahtar yokluğu durumları kodlu `console.error` kayıtlarına
    dönüştürüldü; yalnız RSA/RS256 anahtarlar kullanılıyor ve bozuk imza anahtarı 500
    yerine güvenli ret üretiyor. Beş yeni güvenlik testiyle birlikte 48 testin tamamı,
    üretim derlemesi ve `git diff --check` geçti. Canlı ekip JWKS setindeki iki anahtarın
    da `RSA / RS256 / sig` olduğu doğrulandı.

- [x] **EDM-025 — Senkron anahtarının URL parametresi desteğini kaldır.**
  - Anahtar yalnızca başlıkla kabul edilmeli; URL, günlük ve tarayıcı geçmişine girmemeli.
  - Hepsiemlak aktarım aracının çalışması korunmalı.
  - Kabul: `?anahtar=` ile kimlik doğrulama yapılamaz.
  - Tamamlandı: 15 Eylül 2026 — Senkron yetkisi ayrı bir doğrulama işlevine alındı ve
    yalnız `X-Senkron-Anahtari` başlığındaki tam eşleşmeyi kabul ediyor. URL sorgu
    parametresi okuması kaldırıldı; doğru anahtar URL'de verilse bile reddedildiği,
    doğru başlıkla kabul edildiği ve eksik/yanlış yapılandırmanın kapalı kaldığı üç
    testle doğrulandı. Hepsiemlak görsel aktarım yer imi zaten aynı başlığı kullandığı
    için akış korunuyor; depo genelinde başka URL anahtarı kullanımı kalmadı. Toplam
    51 test, üretim derlemesi ve `git diff --check` geçti.

- [x] **EDM-026 — Yönetim işlemlerine rol ve işlem geçmişi ekle.**
  - İlan silme, görünürlük, içerik, ekip ve ayar değişiklikleri kaydedilmeli.
  - İhtiyaca göre yönetici/editör rolleri tanımlanmalı.
  - Kabul: kim, neyi, ne zaman değiştirdi görülebilir; kritik işlemler yetkiye bağlıdır.
  - Tamamlandı: 2026-09-15 — Doğukan ana admin, Metin admin olarak rol tabanlı izinlere
    bağlandı. İki rol ilan ve içerik işlerini yapabilir; kalıcı ilan/hizmet silme, ekip ve genel
    ayar değişiklikleri yalnız ana admine açıktır. İlan oluşturma/düzenleme, yayın durumu,
    öne çıkarma, toplu işlem, sosyal kuyruk, kalıcı silme, site metni, ekip ve ayar
    değişiklikleri yönetici, zaman, kayıt kimliği, özet ve önceki/sonraki değerlerle D1'e
    yazılır. Yeni İşlem geçmişi ekranı yönetici, kayıt türü ve metinle filtrelenebilir.

### Faz 4 — Güven kanıtları ve içerik kalitesi

- [!] **EDM-027 — Eksik danışman portrelerini tamamla.**
  - Ercan Taşdemirler ve Basri Çelik için marka standardına uygun fotoğraflar gerekli.
  - Beklenen: kullanım izni olan, yüksek çözünürlüklü portreler.

- [!] **EDM-028 — Gerçek ofis ve çalışma fotoğrafları ekle.**
  - Ana sayfa ve hakkımızda bölümünde yerel ofisi ve ekibi gösteren özgün görseller
    kullanılmalı.
  - Beklenen: kullanım izni olan seçilmiş fotoğraflar.

- [!] **EDM-029 — İlan fotoğraf standardı oluştur ve uygula.**
  - Kapak oranı, yatay çekim, ışık, sıralama ve minimum çözünürlük kuralları yazılmalı.
  - Portal filigranlı görseller, kullanım hakkı olan özgün kaynaklarla değiştirilmeli;
    filigran silinmemeli.
  - Kabul: en önemli ilanlarda tutarlı, markaya ait ve mobil uyumlu kapaklar kullanılır.
  - Yükleyici rehberi ve teknik kalite kontrolleri tamamlandı; gerçek kapak görsellerinin
    seçimi/değişimi şirketin kullanım hakkı olan fotoğraflar beklenirken açık.

- [x] **EDM-030 — Google yorumlarını canlıda etkinleştir ve doğrula.**
  - API anahtarı/işletme eşleşmesi, günlük güncelleme ve canlı görünürlük kontrol edilmeli.
  - Yazar adı, avatar, kaynak bağlantısı ve Google atıfları korunmalı.
  - Beklenen: doğru Google işletme kaydı ve üretim API yapılandırması.
  - Tamamlandı: 18 Eylül 2026 — Üretim Worker'ında `GOOGLE_ANAHTARI` tanımlı;
    Places API (New) izinli site referrer'ı ile HTTP 200 döndürdü ve doğru Silivri
    işletmesini buldu. Canlı D1'de 4,7 puan, 12 toplam yorum ve API sınırı olan 5 yorum
    kayıtlı. Yazar, avatar ve Google asıl bağlantıları canlı ana sayfada doğrulandı.

- [-] **EDM-031 — Yetki belgesi ve doğrulanabilir işletme bilgilerini yayımla.**
  - Yayımlanması uygun belge numarası/bilgisi, kuruluş ve ofis bilgileri doğrulanmalı.
  - Beklenen: işletme tarafından sağlanan güncel belge ve yayımlama onayı.
  - İlerleme: 18 Eylül 2026 — Esnaf Oda Sicil No 13578, Vergi No 5840041137,
    Taşınmaz Ticareti Yetki Belge No 3409203, Emlak Kursu Belge No
    16197220170048572965 ile Metin ve Doğukan Özdoğan'ın mesleki yeterlilik numaraları
    merkezi kurum verisine alındı. Hakkımızda sayfasında okunabilir liste ve
    `RealEstateAgent.identifier` yapılandırılmış verisi aynı kaynaktan üretiliyor; yerel
    tarayıcıda doğrulandı. Canlı dağıtım, aynı çalışma ağacındaki Bilgi Merkezi metinleri
    hukuki/editoryal kontrolden geçince yapılacak.

- [!] **EDM-032 — Örnek değerleme raporu ve süreç standardı oluştur.**
  - Tek sayfalık örnek raporda değer aralığı, karşılaştırmalar, veri tarihi ve etkileyen
    unsurlar bulunmalı.
  - “Aynı gün” ve “gerçekleşmiş satışlara bakıyoruz” vaatleri gerçek iş süreciyle
    doğrulanmalı.
  - Beklenen: işletmenin gerçek rapor şablonu ve veri kaynakları.
  - Geçici güvenli düzeltme: 14 Eylül 2026 — Gerçek süreç doğrulanana kadar sitedeki
    “aynı gün”, “son altı ayda gerçekleşen satışlar” ve “tek sayfalık rapor” vaatleri
    kaldırıldı. Sayfalar artık benzer ilanlar, taşınmaz özellikleri ve erişilebilen güncel
    piyasa verileri üzerinden ilk değerlendirme yapıldığını söylüyor.

- [!] **EDM-033 — İzinli, anonim başarı örnekleri ekle.**
  - Değerleme, arazi danışmanlığı ve satış sürecinden doğrulanabilir kısa vakalar seçilmeli.
  - Beklenen: anonimleştirilmiş bilgi ve gerekiyorsa müşteri izni.

- [x] **EDM-034 — Ana sayfadaki öne çıkan ilanları dengele.**
  - Daire, villa ve arazi dengesi sağlanmalı; yalnız yüksek fiyatlı villalara ağırlık
    verilmemeli.
  - Broker kartında “0 ilan” yerine bütün portföy yönetimi rolü gösterilmeli.
  - Kabul: ana sayfa portföy çeşitliliğini ve ekip rolünü doğru temsil eder.
  - Tamamlandı: 30 Eylül 2026 — Vitrin, mevcut kategori ve fotoğraf verisinden önce bir
    daire, villa ve arazi seçiyor; kalan kartları gruplar arasında sırayla tamamlıyor.
    Danışman kartında kişiye atanmış ilan yoksa artık `0 ilan` yerine `Ofis portföyü`
    yazıyor.

- [ ] **EDM-035 — Danışman profillerini zenginleştir.**
  - Doğrulanabilir deneyim, bölge, uzmanlık ve iletişim biçimi eklenmeli.
  - Ortak telefon kullanılıyorsa yönlendirme süreci açıklığa kavuşturulmalı.
  - Kabul: ziyaretçi kimin hangi konuda yardımcı olacağını anlayabilir.

- [x] **EDM-036 — Bölge rehberlerini özgün yerel bilgiyle derinleştir.**
  - Önce Silivri; sonra portföy büyüklüğüne göre Edirne Merkez ve Meriç.
  - Mahalle karakteri, ulaşım ve doğrulanabilir arazi/konut karar ölçütleri eklenmeli.
  - Örnek sayısı açık yazılmalı; EDM portföyü piyasanın tamamı gibi sunulmamalı.
  - Kabul: her rehber yalnızca sayı ve kısa tanıtımdan fazlasını sunar.
  - İlerleme: 3 Ekim — Silivri, Edirne Merkez ve Meriç için tarihli resmi
    kaynak kartları ve taşınmaza özel inceleme soruları hazırlandı. İl/ilçe
    eşleşmesi ayrıldı; aynı adlı Merkez ilçeleri karışmıyor. Arazi birim fiyatı
    yalnız geçerli TL satılık örneklerle, farklı taşınmaz sayısı ve en az iki
    örnek şartıyla gösteriliyor. Panel metni korunuyor, yeni kayıt il-ilçe
    slugıyla ayrılıyor ve aynı Worker önbelleği temizleniyor. Yerel HTTP,
    mobil/masaüstü ve sayfa geçişi doğrulandı. 3 Ekim üretim yayını yapıldı;
    üç rehber canlıda 200. Aynı gün Lalapaşa, Marmaraereğlisi, Malkara ve
    Enez tamamlandı: mevcut portföyün yedi rehberinin tümünde iki kaynaklı
    bilgi kartı, üç karşılaştırma başlığı ve parsel kontrol bağlantısı var.
    Kaynaksız çiftlik uygunluğu ve rota ifadeleri kaldırıldı. 178 test geçti;
    yedi canlı kanonik adres ve kaynak kartları, dört yeni rehberin mobil
    taşma kontrolü ve sayfa geçişi doğrulandı. Yeni CRM kapalı kaldı.
    Son üretim sürümü: `55d140df-d96e-4737-81f0-4f5b728e53b5`.
    Kanıt ve kaynaklar: `site/docs/bolge-rehberleri.md`.

### Faz 5 — Dönüşüm ölçümü ve müşteri yönetimi

- [x] **EDM-037 — Dönüşüm olay modelini kur.**
  - İlan görüntüleme, telefon tıklaması, WhatsApp tıklaması, başarılı form kaydı,
    randevu ve kapanan işlem ayrı olaylar olmalı.
  - Telefon/WhatsApp tıklaması gerçekleşmiş görüşme sayılmamalı.
  - Kabul: olay adları, alanları ve kişisel veri yaklaşımı belgelenir.
  - Tamamlandı: 2 Ekim 2026 — `site/docs/donusum-olay-modeli.md` olay/alan,
    tetikleyici, kaynak atfı, kişisel veri sınırı, idempotent başarılı kayıt,
    Türkiye haftası, kohort/payda ve veri-yok etiketlerini tanımlıyor. Telefon/
    WhatsApp tıklaması görüşme sayılmaz; talep kapanışı satış sayılmaz.
    Mevcut sayaçtaki UTC gün, 3 saniye sinyal ve formdaki honeypot/mükerrer
    başarı cevapları koddan doğrulandı. Mevcut kayıtların eksik ilk yanıt,
    randevu ve iş sonuçları varsayımla doldurulmayacak. Bu adım yalnız belge;
    yeni analitik ucu, ziyaretçi takibi veya hukuki metin yayını açılmadı.
    EDM-038 canlı uygulaması EDM-019/020'nin aydınlatma/işleme kararını bekliyor.

- [-] **EDM-038 — Gizlilik odaklı dönüşüm ölçümünü uygula.**
  - Gerekli olmayan kişi takibinden kaçınılmalı; ölçüm çözümü EDM-019/020 sonucuyla
    uyumlu olmalı.
  - Sosyal kampanya bağlantılarında kaynak bilgisi taşınmalı.
  - Kabul: hangi sayfa ve kanalın başarılı talep ürettiği raporlanabilir.
  - 3 Ekim: gerçek ilk yanıt, nitelik, planlı/gerçek randevu ve satış/kiralama
    teyidi akışı hazır. Aynı talep yeniden sayılmaz; düzeltme teyidi, eski/yeni
    işlem geçmişi ve sürüm koşulu tek transaction'dır. 11 yeni D1 testi dahil
    159 test geçti. Yeni olay ucu, kampanya atfı ve ziyaretçi takibi açılmadı.
    Staging 0011 migration uygulandı, kayıt tablosu boş ve bayrak kapalı;
    üretimde tablo/migration yok. EDM-019/020 kararı bekleniyor. Ayrıntı:
    site/docs/talep-is-sonucu.md ve site/docs/is-sonucu-veri-akisi.md.

- [x] **EDM-039 — Talep yönetimine sorumlu ve takip tarihi ekle.**
  - Her açık talebin sorumlusu, sonraki işlem tarihi ve sonucu görünmeli.
  - Sahipsiz veya geciken talepler panelde öne çıkmalı.
  - Kabul: yeni talep takip sahibi olmadan unutulmaz.
  - Tamamlandı: 2 Ekim 2026 — Ekipten sorumlu, Türkiye saatinde sonraki takip
    ve manuel kapanış sonucu eklendi. İşlemde sorumlu/tarih, kapanışta sorumlu/
    sonuç zorunlu; yeniden açma kapanış alanlarını temizler. Sahipsiz, geciken
    ve plansız açık talepler sayılır, filtrelenir, öncelik alır; liste sayfalıdır.
    Eski not/son düzenleyen korunur ve otomatik sorumluya dönüştürülmez.
    Sürüm koşulu ve audit tek D1 transaction; eşzamanlı/eski değişiklik reddedilir.
    Not/müşteri içeriği audit'e kopyalanmaz. İşlemdeki geciken ve 24 saatten eski
    sahipsiz/plansız talepler mevcut tekrarsız işletim uyarısına bağlandı.
  - 139 test, derleme ve diff kontrolü geçti. Gerçek D1 testleri yarış, audit
    hatasında rollback, takvim/saat dönüşümü, kapanış/yeniden açma ve ekip
    silinmesini doğruladı. Yerel HTTP formu atama/not/sonuç, eski sürüm reddi,
    Origin'siz POST 403 ve filtreleri geçti. Masaüstü panel görseli doğrulandı;
    test talebi/danışman/audit temizlendi, Worker ve test sekmesi kapatıldı.
  - Üretim yedeği 37022907697 başarılı (D1 332880 bayt, R2 0 nesne). Eklemeli
    0010 migration staging/üretim ve iki yerel test D1'e uygulandı. Staging
    a34d7255-44b7-46b0-afb5-7bec3a3f2b23; üretim
    9abe0497-fd07-48e9-90c4-f841be638bcf. Public yollar 200, talepler/uyarılar
    Access 302/no-store. Canlı 1 mevcut talep sorumlu/takip bekliyor;
    gerçek müşteri üzerinde test veya otomatik atama yapılmadı. Gerçek oturumlu
    canlı panel form testi yapılmadı. Son kaynak/derleme sır eşleşmesi 0;
    bu turda sır değişmedi. Ayrıntı: site/docs/talep-takip.md.

- [-] **EDM-040 — İşletme göstergeleri ekranını oluştur.**
  - Haftalık ilan görüntüleme, iletişim tıklaması, başarılı talep, nitelikli talep,
    randevu, kapanış, ilk yanıt süresi ve yanıtsız talep sayısı gösterilmeli.
  - Başlangıç verisi oluşmadan rastgele hedef yüzdeleri konmamalı.
  - Kabul: satış hunisi sayı ve oranları tanımlarıyla birlikte görülebilir.
  - 2 Ekim: mevcut kayıtları kullanan `/yonetim/gostergeler` canlıya alındı.
    Türkiye haftasında talep/durum/kaynak, ayrı UTC haftasında görüntülenme,
    tüm açık taleplerde sorumlu ve takip iş yükü gösteriliyor. Yeni ziyaretçi
    takibi açılmadı; kapanış satışa, yeni durum yanıtsız talebe çevrilmiyor.
    148 test, yerel masaüstü/mobil (390 px taşmasız) ve HTTP 200/400/405/503
    kontrolleri geçti. Staging ve üretimde Access yönlendirmesi doğrulandı;
    oturum açılmış canlı panel henüz ayrıca görülmedi. Gerçek iş sonucu ve
    iletişim olayları ölçülmediğinden huni kabulü açık kalıyor. Ayrıntı:
    site/docs/isletme-gostergeleri.md.
  - 3 Ekim: teyitli ilk yanıt, nitelik, planlı/gerçek randevu ve işlem raporu
    hazır; aynı haftada oluşan taleplerin ilgili alanı tam teyit edilmeden oran
    verilmez. Bilinen yanıtsızlar ve yanıtı bilinmeyen açık talepler ayrıdır.
    Yerel HTTP/masaüstü/mobil doğrulandı, test verileri temizlendi. Staging
    368a26f9-20f8-4ead-9a3a-7c059cd84237; yeni kayıt bayrağı kapalı. Oturumlu
    uzak form kontrolü yapılmadı. Üretim 77fc828b sürümünde kaldı; genel yollar
    200 ve yönetim Access 302. Huni kabulü ve canlı yeni veri kaydı hâlâ açık.

- [x] **EDM-041 — Bildirim teslimatını gözlemlenebilir yap.**
  - E-posta gönderimi başarısızsa talep kaydı korunmalı ve panelde uyarı oluşmalı.
  - Tekrar deneme veya alternatif bildirim akışı belirlenmeli.
  - Kabul: kaydedilmiş fakat bildirimi gitmemiş talep görünürdür.
  - 2 Ekim: 0008 migration ile talep/bildirim kaydı atomik D1 batch'e bağlandı.
    Panelde gönderime kabul, bekleyen, başarısız, işleniyor, belirsiz ve eski
    bilinmeyen durumlar ayrıldı; hata sayacı, uyarı filtresi ve aynı Origin ile
    yönetici tekrar denemesi eklendi. Kesin başarısızlıklar en fazla beş kez,
    mevcut 6 saatlik cron'da en fazla 10 kayıtla işlenir; sağlayıcı exception'ı
    veya süresi dolan kilit belirsiz sayılır ve otomatik tekrar edilmez.
    Sağlayıcı kabulü Gmail teslimi olarak gösterilmez. Eski talepler topluca
    gönderilmez; kuyrukta müşteri metni/IP veya serbest hata ayrıntısı tutulmaz.
    118 test geçti (10 yeni D1 kuyruk testi dahil), üretim derlemesi ve diff
    kontrolü temiz. Yerel form/panel 200, uyarı filtresi, yönetici yeniden deneme
    ve Origin'siz POST 403 doğrulandı; yerel sentetik talep/kuyruk sayısı sıfır.
    Staging `144df5e0-57b7-4034-86d6-eab944134ddf` sürümünde e-posta/cron yok,
    Access kontrolü geçti. Üretim geçişinden önce yeni doğrulanmış yedek
    [37015782585](https://github.com/edmyapigayrimenkul/edm/actions/runs/37015782585)
    alındı. Üretim 0008 uygulandı, Worker
    `57001851-5a22-496e-b5df-3d8fc7fd2960` sürümüne dağıtıldı. Canlı sentetik
    form 200; kuyruk ilk denemede `gonderildi`, hata yok, sağlayıcı kabulü
    2 Ekim 16:57 Türkiye saatinde kaydedildi. Aynı form tekrarında yeni kayıt
    açılmadı. Sentetik canlı talep temizlendi; Gmail gelen kutusu teslimi bu
    test için ayrıca teyit edilmedi. Kaynak/derleme gizli değer eşleşmesi sıfır.
    Canlı ana sayfa, ilanlar ve sitemap 200; talep paneli Access'e 302/no-store
    yönlendiriyor. Sentetik kuyruk satırının da silindiği ayrıca doğrulandı.
    İşletim ayrıntıları: `site/docs/talep-bildirim.md`.

### Faz 6 — SEO ve performans

- [!] **EDM-042 — Search Console başlangıç raporunu çıkar.**
  - Dizine giren URL'ler, sorgular, gösterim, tıklama, sayfa deneyimi ve yapılandırılmış
    veri sorunları incelenmeli.
  - Beklenen: Search Console hesabına salt okunur erişim veya dışa aktarılmış rapor.

- [x] **EDM-043 — Kalıcı arama açılış sayfalarını tasarla.**
  - İlk adaylar: Silivri satılık daire ve Silivri arsa/tarla.
  - Her filtre kombinasyonu için ince, yinelenen sayfa üretilmemeli.
  - Kabul: sayfalar özgün içerik, doğru ilan listesi, kanonik adres ve iç bağlantı taşır.
  - İlerleme: 3 Ekim — `/ilanlar/silivri-satilik-daire` ve
    `/ilanlar/silivri-satilik-arsa-tarla` sabit izin listesiyle hazır. Özgün
    karşılaştırma soruları, sunucuda il/ilçe/işlem/kategori süzme, kalıcı
    kanonik adres, listeyle aynı JSON-LD, breadcrumb, site haritası ve iç
    bağlantılar eklendi. Daire listesinden villa/kira/devir dışlanıyor; arazi
    grubunda imarlı alt türler korunuyor. 169 test ve derleme geçti; yerel
    6 daire/13 arazi, 404, boş liste ve ClientRouter filtresi doğrulandı.
    Tamamlandı: 2026-10-03 — Üretim `cc8e9c5e-7834-4b7e-88c5-2dd7462b1634`.
    Canlı iki sayfa 200; 5 daire / 12 arazi, kart/JSON-LD eşleşmesi ve
    ClientRouter filtreleri doğrulandı. Mobil/masaüstü yatay taşma yok.
    Güncel 178 test geçti; Google breadcrumb ve Schema.org kontrolleri EDM-044
    kapsamında tamamlandı. İlan adetleri kontrol anına aittir.
    Kanıt: `site/docs/kalici-arama-sayfalari.md`.

- [x] **EDM-044 — Yapılandırılmış veriyi Google araçlarıyla doğrula.**
  - LocalBusiness/RealEstateAgent, ilan ve breadcrumb şemaları kontrol edilmeli.
  - JSON sözdiziminin geçerli olması uygunluk için tek başına yeterli sayılmamalı.
  - İşletmenin kendisi hakkındaki yorumlar yıldız garantisi olarak görülmemeli.
  - Kabul: hata/uyarılar kayda alınır ve uygulanabilir olanlar çözülür.
  - Tamamlandı: 2026-10-03 — Google ana sayfada iki, güncel ilanda üç geçerli
    öğe buldu: işletme/kuruluş ve ilan breadcrumb. Schema.org ilan denetiminde
    dört yanlış alan yerleşimi uyarısı tespit edildi; taşınmaz `about` altına
    ayrılınca daire ve arazi örnekleri 0 hata / 0 uyarı oldu. 2+1 sayısal oda
    adedi gibi yazılmıyor; net/brüt kapsamı ve yaklaşık konum korunuyor.
    48 aktif ilanın tamamı HTTP 200 ve şema yerleşimi kontrolünden geçti.
    Google'ın isteğe bağlı priceRange/postalCode uyarıları doğrulanmış işletme
    verisi olmadığı için uydurma değerle kapatılmadı. Yıldız, indeks veya sıra
    garantisi yok; Search Console hesabı raporu bu kontrollerden ayrıdır.
    Kanıt: `site/docs/yapilandirilmis-veri.md`, `raporlar/sema-2026-10-03/`.

- 3 Ekim — EDM-036 tamamlandı: Lalapaşa, Marmaraereğlisi, Malkara ve Enez
  rehberleri kaymakamlık, Kültür Portalı ve Tarım ve Orman Bakanlığı
  kaynaklarıyla genişletildi. Mevcut yedi bölgenin tümü canlıda 200;
  kaynak kartları, üçer kontrol başlığı ve kanonik adresler doğrulandı.
  Kaynaksız çiftlik uygunluğu ve yanlış/genellenmiş rota tanıtımları
  kaldırıldı. Dört yeni rehber 390 × 844 mobilde taşmadı; Lalapaşa
  1280 × 800 masaüstünde de kontrol edildi. 178 test başarılı. Staging
  `abdc3e49-3a8c-49d0-a300-1fd21fe9be22`; son üretim
  `55d140df-d96e-4737-81f0-4f5b728e53b5`. Üretim CRM bayrağı 0,
  sonuç tablosu ve 0011 kaydı yok; yerel test kimliği bağlaması yok.
  Kanıt: `site/docs/bolge-rehberleri.md` ve
  `raporlar/sema-2026-10-03/canli-rehber-kontrolu.json`.
  Sırada EDM-046 görsel/istemci yükünün ölçülmesi; ikinci gerçek günlük
  yedek koşusu 4 Ekim hedef saatinden sonra doğrulanabilir.

- [ ] **EDM-045 — Gerçek kullanıcı performans ölçümünü kur.**
  - Mobil LCP, INP ve CLS gerçek kullanıcı verisiyle izlenmeli.
  - Kritik sayfalar: ana sayfa, ilan listesi, ilan detayı ve değerleme.
  - Kabul: optimizasyon öncesi başlangıç değeri ve sayfa bazlı dağılım vardır.

- [-] **EDM-046 — Görsel ve istemci yükünü optimize et.**
  - Ekrana uygun `srcset/sizes`, görsel ölçüleri ve formatlar uygulanmalı.
  - Ortak hareket JavaScript'i düşük cihazlarda ölçülmeli; gereksiz iş azaltılmalı.
  - Liste büyüdüğünde sayfalama veya sunucu filtreleme değerlendirilmelidir.
  - Kabul: ölçülen performans iyileşir; tasarım ve azaltılmış hareket desteği korunur.
  - İlerleme: 30 Eylül 2026 — Ana sayfa ve ilan listesi kartları lazy loading'e alındı;
    ortak Lenis kaydırma kitaplığı dokunmatik olmayan cihazlarda dinamik yükleniyor. Ana
    istemci betiği 51.278 bayt gzip'ten 47.053 bayta indi, Lenis ayrı 5.403 bayt gzip
    parçasına ayrıldı.
  - 3 Ekim 2026: Hepsiemlak görsellerinde yoğunluğa göre `srcset` ve mobil
    galeri kapağında `<picture>` uygulandı. 33 benzersiz fotoğrafın 640×480
    sürümleri 23.503.144 → 6.785.054 bayt (%71,1 daha küçük); bu sayfa yükü
    veya LCP sonucu değildir. Kapalı galeri özgün dosyayı açılınca yükler;
    favorilerde gizli kartlar `srcset` yüklemez. 181 test ve derleme başarılı.
    `site/docs/gorsel-performansi.md` ölçüm sınırlarını kaydeder. R2/Emlakjet
    boyutlandırma, formatlar, gerçek cihaz/alan ölçümü ve sayfalama hâlâ açık.
  - Canlı sürüm `32f939a0-b23b-4e07-864e-47bc8b2a9018`: mobil/masaüstü
    galeri ve özgün tam ekran fotoğraf kontrolü geçti; normal HTML MISS → HIT
    yeni görsel seçeneklerini koruyor. `raporlar/performans-2026-10-03/` kanıtları.
    EDM-047 tazeleme ölçümü 3 Ekim'de tamamlandı; kalan görsel/istemci yükü açık.
  - Aynı gün Emlakjet boyut servisi de doğrulandı: kalan 19 kapakta özgün
    4.322.452 bayt → 640 isteğinde 1.646.705 bayt (%61,9 daha küçük).
    Bu dosya ölçümüdür; gerçek sayfa/LCP kazanımı değildir. Yoğun ekranda
    960 veya özgün kaynak seçilir, tam ekran fotoğraf özgün kalır. Boyut
    servisi yüklenemezse tek denemelik özgün kaynak dönüşü vardır; in-app
    tarayıcıda hem yerel hem canlı bu dönüş gerçekleşti. Kök ağ nedeni ve
    fiziksel cihaz kazanımı açık. Gizli favorilerin picture kaynakları
    bekletiliyor; 190 test ve derleme geçti. Staging
    `5d8db762-cd1d-4a8f-892a-ffe28e3df6c2`, üretim
    `758b217e-84f7-4b58-8861-80368537c7fa`. Ayrıntı ve kanıtlar aynı görsel
    performans belgesinde; R2, gerçek cihaz/alan ölçümü ve sayfalama açık.
  - Aynı gün Emlakjet küçük dosyaları sabit kaynak ve boyut denetimli
    `/foto/emlakjet/...` Worker sunumuna alındı. Canlı 38/38 dosya açıldı;
    mobil kapak artık özgüne dönmeden 640×480, masaüstü 960×720 yükleniyor.
    Tam ekran özgün 1600 piksel kalıyor. Fotoğraf HIT ve HTML MISS → HIT → HIT
    kanıtlandı; gizli favoriler etkin img/source yüklemiyor. 193 test,
    son sınır değişikliğinden sonra ilgili 15 test ve derleme geçti.
    Staging `143e27a5-55cf-4a9d-b7ac-1eb7d37731ad`, üretim
    `099708ec-bcb3-4350-a9da-65c0fac30cfb`; kaynak/derleme sır eşleşmesi sıfır.
    İlk CDN gömme hatasının ağ kök nedeni ve fiziksel cihaz kazanımı
    kesinleşmedi. R2, gerçek kullanıcı performans ölçümü ve sayfalama sırada.
  - 3 Ekim 2026 devamı: R2 panel yüklemesi artık özgün WebP'ye ek olarak 640 ve
    1280 piksel türevleri üretip saklıyor; fotoğraf kartları ekran yoğunluğuna göre
    türev seçiyor. Eski R2 kayıtları özgün fotoğrafa geri düşüyor; silme ve taslak
    temizliği türevleri de kapsıyor. 50 fotoğrafın hazırlanıp yüklenmesi beşli
    paketlerle sınırlandı. Staging `ef209714-022d-4b64-a42f-f439e3d02adc`, üretim
    `5b8258d0-0410-491a-9226-9d5f45f69c07`; dağıtım kapısı 0011 CRM geçişini
    erteledi ve şemanın uyumlu olduğunu bildirdi. Staging ana sayfa ve görsel yolu
    Access'e 302/no-store verdi; canlı ana sayfa ve ilanlar 200, yönetim 302/no-store,
    geçersiz görsel boyutu 404/no-store döndü. Canlı D1'de fotoğraf kaydı sayısı sıfır
    olduğundan dosya boyutu kazanımı henüz raporlanmadı; ilk gerçek
    yükleme, fiziksel cihaz ve gerçek kullanıcı performans ölçümü açık. Ayrıntılar
    `site/docs/gorsel-performansi.md` içinde.

- [x] **EDM-047 — Cloudflare HTML önbelleğini canlıda doğrula.**
  - `s-maxage` başlığına dayanarak önbelleğin çalıştığı varsayılmamalı.
  - Cache kuralı veya Cache API yaklaşımı, hit/miss ve bayat içerik davranışı ölçülmeli.
  - Senkron veya panel düzenlemesinden sonra tazeleme davranışı tanımlanmalı.
  - Kabul: tekrar isteklerde hit kanıtı ve güncelleme sonrası doğru içerik görülür.
  - İlerleme: 30 Eylül 2026 — Worker Cache API yalnız anonim genel HTML GET isteklerine
    uygulanıyor; panel, API, cookie/Authorization ve no-cache istekleri bypass ediliyor.
    Hedef 60 saniyelik tazeleme idi. Canlı MISS→HIT ve yönetim bypass doğrulandı;
    gerçek içerik değişikliği ve katmanların üst üste binmesi henüz sınanmamıştı.
  - 3 Ekim 2026 tamamlandı: ilan, içerik ve bölge verisinin istekler arası 60 saniyelik
    belleği kaldırıldı; aynı SSR isteğindeki okumalar tek Promise ile paylaşılır. HTML
    yalnız kenarda 60 saniye tutulur; tarayıcı `max-age=0, must-revalidate` ile yeniden
    danışır. Sitemap'in eski bir saatlik süresi kaldırıldı. Cookie/Authorization/no-cache
    HTML `private, no-store`; yeni cache anahtarı eski kurallı HTML'i kullanmaz.
  - Gerçek geçici yerel D1 kopyasında panel formuyla fiyat 20.000 → 21.234 güncellendi;
    güncel okuma hemen doğru fiyatı gösterdi. Gerçek pasife alma POST'u sonrası bypass
    404, sitemap ilansız; 61,35 saniyede anonim eski detaylar 404 ve eski liste ilansız.
    Son derlemede yeniden yayına alma POST'u Silivri bölge sayfasına hemen yansıdı.
    Üretim ilan verisi değiştirilmedi; geçici D1 kopyası ve iki test sunucusu temizlendi.
  - 185 test, derleme ve diff kontrolü geçti. Staging
    `3d509815-c394-43a7-ae0f-cbf24a6e4c14`, üretim
    `efc93bf7-f9f7-4ef6-8e86-3f1a31a3c491`. Canlı anonim listede aynı HTTP/2
    bağlantısı ve MXP merkezinde MISS → HIT → yaklaşık 63 saniyede MISS → HIT;
    HIT içerik özetleri eşleşti. Panel/API bypass ve genel sayfalar doğrulandı.
    `site/docs/html-onbellegi.md`, `raporlar/onbellek-2026-10-03/` kanıtları ve
    aynı anda başlayan üretim/açık sekme/çok merkezli cache sınırlarını kaydeder.

### Faz 7 — Senkron, veri tabanı ve işletim dayanıklılığı

- [x] **EDM-048 — Kısmi portal sonucuna karşı senkron emniyet freni ekle.**
  - Sıfır olmayan fakat olağandışı eksik liste, çok sayıda ilanı tek seferde
    pasifleştirmemeli.
  - Önceki aktif sayıya göre eşik ve ikinci başarılı doğrulama değerlendirilmeli.
  - Kabul: örneğin portal yalnızca ilk sayfayı döndürürse kalan portföy kapanmaz.
  - Tamamlandı: sayfa isteği başarısızsa, ilk sayfa tekrarlanırsa veya sayfa sınırına
    ulaşılıp devam ihtimali varsa senkron yazımı duruyor. Aktif portföyün %75'inden azı
    bulunur ve en az 3 ilan eksik görünürse aynı eksik ilan listesi iki ardışık tam çekimde
    görülmeden toplu pasifleştirme yapılmıyor. Detay çekiminde hata varsa o tur hiçbir ilan
    pasife alınmıyor. Portalın mevcut 51 ilanlık gerçek sayfalaması salt okunur kontrolle
    doğrulandı; son sayfadan sonra ilk sayfa dönmesi doğal son sayfa olarak tanınıyor.

- [x] **EDM-049 — Sürümlü D1 geçiş sistemi kur.**
  - Şema değişiklikleri senkron sırasında sessizce denenmek yerine sürümlü ve kayıtlı
    uygulanmalı.
  - Dağıtım öncesi şema uyumluluk kontrolü eklenmeli.
  - Kabul: hangi geçişin nerede uygulandığı bilinir ve hata görünürdür.
  - Tamamlandı: `wrangler.jsonc` migration dizini ve kayıt tablosunu açıkça tanımlıyor;
    eski canlı şema idempotent `0007` taban çizgisiyle sürümlendi. Uygulama isteği sırasında
    DDL çalıştırma kaldırıldı; sürüm yoksa açık hata veriliyor. Dağıtım öncesi bekleyen
    migration kapısı ve resmi Wrangler ile uzaktan uygulama komutu eklendi. Canlıda 0005,
    0006 ve 0007 kayda geçirildi; şema uyuşmazlığı sorgusu boş döndü. Test, üretim derlemesi
    ve migration kapısı geçti; Worker `cd0a7c38-7218-4140-a04b-d56b9c4fc8d6` dağıtıldı.

- [ ] **EDM-050 — Ayrı test ortamı ve test veritabanı oluştur.**
  - Form, senkron, panel yazma işlemleri ve şema geçişleri üretim verisi olmadan
    denenebilmelidir.
  - Kabul: kritik akışlar canlı müşteriye veya portföye dokunmadan uçtan uca test edilir.
  - İlerleme: 30 Eylül 2026 — Yerel D1 ve üretim D1 dışında izole bir Cloudflare test
    veritabanı henüz tanımlı değil. Test kaynağı oluşturmadan önce staging Worker'ın
    kimlik doğrulama/route sınırları ve ayrı D1 migration akışı netleştirilecek.
  - Güncelleme: Yerel Worker için `.wrangler/test-state` altında kalıcı, Git dışı D1
    durumu kuruldu. `npm run db:test:migrate` yalnız `--local` ile şema kuruyor;
    `npm run dev:test` yalnız yerel Worker başlatıyor ve `.env` içindeki API sırlarını
    yüklemiyor. 0002–0007 migration'ları uygulandı. Ana sayfa, ilan listesi ve sitemap
    HTTP 200 verdi. Sentetik iletişim POST'u 200 döndü, aynı talebin tekrarı engellendi;
    D1'de bir satır ve yerel e-posta simülasyonu doğrulandı. Sentetik satır silindi ve
    sayımın sıfır olduğu teyit edildi. Yerel D1'de sentetik ilan ekleme, fiyat/durum
    güncelleme ve transaction rollback denendi; kayıt rollback sonrası kalmadı. Yerel
    Worker ana sayfa ve ilan listesini 200 verdi; yönetim ekleme yolu kimlik olmadan 403
    verdi. Tarayıcı aracı localhost'u engellediği için panelin gerçek form POST'u henüz
    denenmedi. Portal senkronu için ayrıca izole senaryo ve Cloudflare remote staging
    Worker/D1 oluşturulmadı.
  - 1 Ekim güncellemesi: `PANEL_YEREL_TEST_KIMLIGI=1` yalnız `dev:test` komutuna veriliyor;
    kimlik yardımcısı bununla birlikte `localhost`, `127.0.0.1` veya `[::1]` istemiyor.
    Uzak host, eksik/kapalı bayrak ve bozuk URL testleri eklendi. Yerel form POST'unda
    eksik Origin ilk denemede 403 aldı (CSRF koruması); doğru yerel Origin/Referer ile
    pasif villa ilanı oluşturuldu ve düzenlendi. D1'de ilan ve iki audit satırı
    doğrulandı; ardından ilan, audit ve ilişkili kayıtlar temizlendi. Test Worker kapatıldı.
    Yerel panel yazma akışı böylece doğrulandı; senkron senaryosu ve ayrı Cloudflare
    staging ortamı hâlâ açık.
  - 1 Ekim devamı: Miniflare üzerinde üretimden tamamen ayrı, geçici Cloudflare D1
    entegrasyon testi kuruldu. Yirmi portal ilanı ve beş elle girilmiş ilanla yapılan
    senaryoda ilk eksik portföy turu pasifleştirmeyi erteledi; ikinci tam doğrulama yalnızca
    eksik altı portal ilanını pasife aldı. Elle girilen beş kayıt aktif kaldı ve başlık/fiyat
    alanları değişmedi. Canlı D1'e veya gerçek Emlakjet uçlarına istek atılmadı.
  - 1 Ekim uzak staging: `edm-yapi-gayrimenkul-staging.ezanplus.workers.dev` Worker'ı,
    ayrı `edm-talepler-staging` D1 ve `edm-gorseller-staging` R2 oluşturuldu.
    Staging hostu Cloudflare Access ile yalnız Metin ve Doğukan yönetici e-postalarına
    açıldı; anonim kök ve `/yonetim` istekleri Access girişine 302 döndü. Sürüm
    önizleme URL'leri kapatıldı. Altı D1 migration uygulandı; staging ilan ve talep
    tabloları sıfır satırla başladı. Son doğrulanan dağıtım
    `407d4b17-6163-4b0f-9ce6-3dca71d3bbf0`.
    Uzak binding denetiminde yalnız staging D1/R2, ayrı hız sınırları ve Access
    değişkenleri görüldü; cron, e-posta ve sır bindingi yok. Üretim ana sayfa 200 ve
    üretim cron'u değişmeden kaldı. Tekrarlanabilir `npm run deploy:staging` güvenlik
    kapısı eklendi; `STAGING_ORTAMI=1` yanlışlıkla tetiklenen senkronu da durduruyor.
    Tam test kapanışı için gerçek Access oturumuyla staging panel formu ve fotoğraf
    akışının uçtan uca denenmesi kaldı; uzak staging üzerinde henüz müşteri verisi yok.
  - 2 Ekim yerel medya doğrulaması: izole `dev:test` Worker'ında yeni ilan taslağına
    geçici PNG yüklendi, D1 fotoğraf kaydı ve R2'den okunan dosyanın SHA-256 eşliği
    doğrulandı. Silme API'siyle kaldırıldı; D1 sayımı sıfır, `/g/` yanıtı 404 oldu.
    Kayıtlı fotoğraf olmayan `video/...` anahtarının silinmesi 404 reddedildi.
    Gerçek staging Access oturumuyla uçtan uca panel doğrulaması hâlâ açık.

- [ ] **EDM-051 — Kritik otomatik testleri ekle.**
  - Form hata/başarı akışı, kısmi senkron, satılık/kiralık istatistikleri, mobil galeri
    ve ClientRouter sonrası kurulum kapsanmalı.
  - Uygulamayı tekrar eden yüzeysel testler yazılmamalı.
  - Kabul: bu beş yüksek riskli bozulma dağıtımdan önce yakalanır.
  - İlerleme: 30 Eylül 2026 — Kısmi Emlakjet senkronu için yedi emniyet testi; satılık/
    kiralık fiyat istatistikleri için mevcut ayrım testleri; form doğrulama testleri mevcut.
    ClientRouter `astro:page-load` kurulum döngüsü için test, mobil galerinin dairesel
    ileri/geri ve yatay kaydırma yönü/eşik kararı için dört saf test eklendi. Galeri
    klavye/dokunma kodu bu testli yardımcıları kullanıyor. Tam otomatik test paketi,
    üretim derlemesi ve `git diff --check` geçti. Yerel Worker ana sayfa ve ilan listesi
    200, yetkisiz yönetim ekleme yolu 403 döndürdü; yerel D1 ilan insert/update/rollback
    smoke testi temiz kaldı. 1 Ekim'de loopback ve açık test bayrağına bağlı yerel test
    kimliği eklendi; uzaktaki hostta reddedildiği test edildi. Gerçek panel ekleme ve
    düzenleme POST'ları yerel D1'de başarılı oldu; CSRF'nin Origin kontrolü de ilk isteği
    reddederek doğrulandı. İlan ile iki audit satırı temizlendi. Tam otomatik test paketi,
    üretim derlemesi ve `git diff --check` geçti. CUA aracı localhost'u engellediğinden
    galeri için görsel tarayıcı testi ve senkron uçtan uca testi hâlâ açık. Migration kapısı
    dağıtım öncesi temiz geçti; Worker `d22585aa-a043-4d0d-b932-cef54a8b563b` sürümüne
    güncellendi. Canlı ana sayfa, ilan listesi, gerçek bir ilan detayı ve sitemap HTTP
    200; yönetim ilan ekleme Access giriş yönlendirmesi HTTP 302/no-store verdi. Gerçek
    ilanın galeri HTML'inde fotoğraf sırası, sayısı ve erişilebilir adlar doğrulandı.
  - 1 Ekim devamı: Senkron emniyet regresyonuna beş elle girilmiş ilan içeren senaryo
    eklendi. Aynı eksik portföy iki tam turda doğrulanınca yalnız altı eksik portal ilanı
    pasife alınıyor; elle girilen kimlikler karşılaştırma ve pasifleştirme sorgularının
    dışında kalıyor. Senkron emniyet testleri (8), tüm test paketi ve üretim derlemesi
    geçti; derleme Wrangler'ın kullanıcı tercihleri altındaki log dosyasına yazma izni
    uyarısı verdi ama build tamamlandı. Bu turda canlıya yeni sürüm dağıtılmadı; değişiklik
    test kapsamı ve yerel test kimliğiyle sınırlı. Gerçek Worker/D1 ile izole tam senkron
    senaryosu ve Cloudflare staging ortamı hâlâ açık.
  - 1 Ekim ek doğrulama: Miniflare sürümündeki geçici D1'e bağlanan entegrasyon testi
    `test:senkron-d1` olarak pakete eklendi ve tam test komutuna bağlandı. Test, gerçek
    D1 SQL/upsert ve pasife alma davranışını çalıştırıyor; Emlakjet ağına çıkmıyor. Tam
    test paketi ve üretim build'i tekrar geçti; build sırasında Wrangler günlük dosyası
    yazma izni uyarısı yine görüldü ancak çıkış kodu başarılıydı. Yeni canlı dağıtım yok.

- [x] **EDM-052 — D1 ve R2 yedekleme/geri yükleme prosedürünü doğrula.**
  - Mevcut Cloudflare yedekleme özellikleri ve saklama süreleri hesapta kontrol edilmeli.
  - Geri yükleme adımları belgelenip test ortamında denenmeli.
  - Beklenen: Cloudflare hesap ayarlarına erişim ve kabul edilen saklama hedefi.
  - İlerleme: 18 Eylül 2026 — Canlı `edm-talepler` veritabanı salt okunur kontrol edildi;
    EEUR bölgesinde, 19 tablo ve 524 kB. Time Travel bu veritabanında çalışıyor ve güncel
    yer imi üretti. Cloudflare'ın Free planda 7, Paid planda 30 günlük otomatik geri
    dönüşü belgelendi. Eksik kalan kısım uzun süreli D1→R2 dışa aktarımı, R2 yanlışlıkla
    silme koruması ve test ortamında gerçek geri yükleme tatbikatı.
  - 1 Ekim staging tatbikatı: boş `edm-talepler-staging` içinde sentetik ayar önce
    `once`, sonra `sonra` yapıldı. İlk değerden sonra alınan Time Travel yer imine
    `wrangler d1 time-travel restore ... --env staging --bookmark ...` ile gerçek uzak
    geri yükleme yapıldı. `once` değeri döndü; sentetik kayıt silindi, altı migration
    ve sıfır ilan korundu. Uzak D1 SQL export'u 9.285 bayt/20 tablo olarak üretildi,
    sentetik kayıt içermediği görüldü ve geçici dosya silindi. Üretim D1'e yazılmadı.
    Uzun süreli arşivleme ve R2 fotoğraflarının yanlış silinmesine karşı ayrı politika
    hâlâ açık; canlı fotoğraf kovasına genel kilit koymak olağan fotoğraf silmelerini
    bozacağından ayrı yedek kova/retention tasarımı gerekir. Canlı ve staging R2
    kovalarının ikisinde de kilit kuralı bulunmadığı API ile doğrulandı.
    `site/scripts/d1-kurtarma.mjs` hedef D1 kimliğini kontrol eden yer imi,
    özel izinli SQL export ve geri yükleme yardımcısı olarak eklendi; staging'de
    bilgi/export komutları doğrulandı. Prosedür `site/docs/d1-kurtarma.md` içinde.
  - 1 Ekim devamı: Ayrı, halka kapalı `edm-yedek-staging` ve `edm-yedek` R2
    kovaları açıldı. İkisinde de tüm nesneleri 90 gün silmeye ve üzerine yazmaya
    karşı koruyan kilit doğrulandı. `site/scripts/yedekle.mjs` her koşuda D1 SQL
    ve kaynak R2 nesnelerini benzersiz önekle kopyalıyor; her dosyayı R2'den geri
    okuyup SHA-256 ile karşılaştırıyor ve tam koşu için manifest yazıyor. Staging
    SQL arşivi geri okundu; kaynak R2'ye sentetik nesne yüklenip arşivlendi,
    yedekten geri alındı ve hash eşleşti. Sentetik kaynak temizlendi. Arşiv SQL'i
    yeni boş bir geçici D1'e içe aktarıldı; 22 tablo okundu ve geçici D1 silindi.
    Üretim D1'in ilk özel arşivi 330.877 bayt SQL ve sıfır R2 nesnesiyle geri
    okuma doğrulamasından geçti; üretim D1/R2 verisi değiştirilmedi. Canlı
    fotoğraf kovasına kilit konmadı. Düzenli zamanlayıcı ve başarısız koşu
    uyarısı EDM-078'e ayrıldı.
  - 1 Ekim ek kontrol: D1'de olup kaynak R2'de bulunmayan sentetik fotoğraf
    referansı staging'de denendi. Yedekleme başlamadan reddetti, kilitli kovada
    yeni nesne oluşmadı, sentetik kayıt temizlendi. Temiz staging arşivi
    güncel kodla yeniden doğrulandı. Dosya hash kontrolü akışlı okumaya çevrildi;
    büyük fotoğraf/video dosyalarını belleğe tümüyle alma ihtiyacı kaldırıldı.

- [-] **EDM-078 — Doğrulanmış yedekleri düzenli çalıştır ve izle.**
  - EDM-052'deki özel, 90 gün kilitli R2 kovalarına üretim D1/R2 arşivini
    güvenilir bir zamanlayıcıyla düzenli yaz; başarısız koşuda Doğukan'a uyarı ver.
  - Son başarılı manifestin yaşı, D1 SQL boyutu ve R2 nesne sayısı izlenmeli;
    eksik/yarım koşu başarı sayılmamalı. Saklama süresi ve maliyet izlenmeli.
  - Kabul: en az iki ardışık gerçek otomatik koşu ve başarısızlık uyarısı testi.
  - Durum: 1 Ekim 2026 — elle üretim/staging yedekleri ve geri alma tatbikatı
    tamam; zamanlayıcı henüz kurulmadı.
  - 2 Ekim kontrolü: İlk yenilenen GitHub CLI oturumu yanlış hesap olan
    `ozdogangringo-sketch` içindi. Doğru depo sahibi `edmyapigayrimenkul`
    hesabıyla ayrıca giriş yapıldı; bu hesap etkin ve `edmyapigayrimenkul/edm`
    deposunda yönetici yetkisi doğrulandı. Eski hesap pasif bırakıldı. Yerel
    `origin` zaten doğru depoyu gösterdiğinden değiştirilmedi; hiçbir kod,
    secret veya iş akışı depoya gönderilmedi. Depoda henüz Actions iş akışı
    veya sırrı yok; `site/scripts/yedekle.mjs` de GitHub'a aktarılmamış. Yerel
    `npm run db:backup:production` çalışıyor, fakat otomatik günlük yedekleme
    yerine geçmiyor. Dar kapsamlı Cloudflare yedek tokenı, kodun güvenli biçimde
    depoya aktarımı, zamanlayıcı ve başarısızlık uyarısı hâlâ kurulmalı. Bu
    çalışma ağacında 110 değiştirilmiş/yeni kayıt var; yedek betiği ve bağımlı
    dosyaları henüz depoda yok. CI kurulmadan önce bu değişiklikler gözden
    geçirilip güvenli biçimde aktarılmalı ve yalnız `.env` okuyan Cloudflare
    kimlik yardımcısı CI sırlarını okuyacak şekilde uyarlanmalı; ardından iki
    gerçek koşuyla doğrulanmalı.
  - 2 Ekim ilerleme: Yalnız yedekleme dosyaları temiz çalışma ağacında ayrıldı;
    [PR #1](https://github.com/edmyapigayrimenkul/edm/pull/1) gerçek GitHub CI'da
    16 test geçtikten sonra ana dala alındı (merge `79a0a83`). Standart checkout'u
    bozan, `.gitmodules` tanımı bulunmayan eski `postedm` Git kaydı kaldırıldı;
    ana çalışma klasöründeki ayrı postedm deposu ve dosyaları korundu. Birikmiş
    site değişikliklerinin tamamı bu PR'a dahil edilmedi.
  - GitHub iş akışı `372610863`: Türkiye hedef saatleri 02:17 günlük arşiv,
    15:47 bağımsız kontrol; 36 saatten eski/geçersiz manifest hata sayılır.
    GitHub zamanlaması gecikebilir. İlk kurulumda `YEDEK_ZAMANLAYICI_HAZIR=0`
    ile günlük çalışmalar kapalı tutuldu; 2 Ekim teslim teyidinden sonra `1`
    olarak açıldı. GitHub'ın workflow için `active` demesi bu kapıyı açmaz.
  - CI `.env` okumaz; boş secret yerel geniş anahtara düşmez. REST tokenı kaynak
    R2'de Read, D1'de export için Edit yetkilidir; D1 izni salt okunur değildir.
    İş akışı D1'e yalnız sorgu/export uygular. Arşiv yalnız iki yedek kovasına erişen S3
    kimliğiyle çalışır. Bildirim ayrı Email Sending tokenıyla sabit Doğukan
    adresine gider. SQL/medya GitHub artifact olarak yüklenmez. Yerel 16 test,
    actionlint ve kaynakta mevcut gizli değer taraması geçti.
  - Gerçek staging S3 arşivi 15 dakikalık, yalnız staging yedek kovasına izinli
    geçici kimlikle doğrulandı: manifest
    `staging/2026-10-01T22-10-37-983Z-980cb8d5/manifest.json`, SQL 9.285 bayt,
    sıfır medya nesnesi. Geri okuma/hash ve ayrı güncellik betiği başarılı.
  - Kullanıcı adımı: `site/docs/yedek-otomasyonu.md` içindeki üç sınırlı
    Cloudflare kimliği oluşturulup git dışındaki `site/.env.yedek` dosyasına
    girilmeli. Dosya izinleri 0600. Okuma anahtarı gizli giriş scriptiyle
    kaydedildi; üretim/staging D1 SELECT ve kaynak R2 listeleme ile iki yedek
    kovasının gizlilik/kilit bilgilerine erişim HTTP 200 ile doğrulandı.
    R2 S3 kimliği kaydedildi; `edm-yedek` ve `edm-yedek-staging` listeleme
    erişimi doğrulandı. Bildirim anahtarı da kaydedildi. Dört GitHub secret'ı
    doğru depoya stdin ile kuruldu; günlük çalışma kapısı hâlâ `0`.
    Mevcut yerel API tokenı yeni token oluşturma uçlarına 403 döndürüyor ve
    GitHub'a kopyalanmadı. `scripts/yedek-kimlik-kur.mjs` doğru GitHub hesabını,
    D1 okumayı ve iki yedek kovası S3 erişimini doğrulayıp sırları stdin ile kurar.
  - Kalan kabul: ilk gerçek zamanlanmış arşiv ve güncellik kontrolü koşuları.
    Kontrollü hata e-postasının gelişi ve günlük kapının açılması 2 Ekim'de
    doğrulandı. EDM-078 zamanlanmış koşular görülmeden bitmiş sayılmaz.
  - Anahtar girişini kolaylaştırmak için `site/scripts/yedek-kimlik-gir.py`
    eklendi: `okuma`, `r2`, `bildirim` seçimleriyle terminalde iki kez gizli giriş;
    yalnız git dışındaki `.env.yedek` atomik ve 0600 izinleriyle güncellenir.
    Anahtarlar komut argümanına veya çıktıya girmez; GitHub kurulumu ayrı adımdır.
    R2 alan adlarındaki `2` rakamı nedeniyle örnek satırların yanına gerçek
    değer eklenmesi hatası düzeltildi; yerel yinelenen R2 satırları gerçek
    değerler korunarak temizlendi. Rakamlı alan/yinelenme/izin ve geçersiz giriş
    regresyon testleri geçti. Kalıcı okuma anahtarıyla staging SQL export
    HTTP 401 / kod 10000 döndü; export yetkisi çözülmeden otomasyon açılmayacak.
  - 2 Ekim gerçek Actions bildirim testi
    [36938852543](https://github.com/edmyapigayrimenkul/edm/actions/runs/36938852543):
    16 güvenlik testi geçti; arşiv işi planlandığı gibi kontrollü hata verdi.
    Ayrı bildirim işi de başarısız oldu. Yerel sınırlı tanı isteği HTTP 403 /
    kod 10203 döndürdü: Cloudflare hesabı veya alan adında Email Sending kapalı.
    E-posta gönderildi/teslim edildi sayılmadı. Bildirim betiğine bilinen hata
    kodları için sabit açıklamalar eklendi; sunucunun serbest hata metni gizli
    kalır. Yeni regresyonla Node test sayısı 17; aşağıdaki PR ile GitHub'a aktarıldı.
  - Kullanıcı mevcut `EDM yedek okuma` tokenında yalnız D1 `Read → Edit`
    değişikliğini uyguladı. Gerçek staging GitHub koşusu
    [36939362503](https://github.com/edmyapigayrimenkul/edm/actions/runs/36939362503)
    başarılı: export, S3 yazım/geri okuma/hash ve güncellik kontrolü geçti.
    SQL 9.285 bayt, R2 sıfır nesne. D1 izni yalnız export ile sınırlı değildir;
    seçili hesabın D1 veritabanlarına yazma yetkisi de verir. R2 Read ve yalnız
    EDM hesabı kapsamı korunmalı. Secret adı uyumluluk için değişmedi.
    Üretim koşuları `36939477730` ve `36939660729` ardışık başarılı; her birinde
    SQL 331.108 bayt, kaynak R2 sıfır nesne. Manifestler
    `production/2026-10-01T23-12-29-159Z-8ec30911/manifest.json` ve
    `production/2026-10-01T23-14-29-107Z-feb2c731/manifest.json`; export ve geri
    okuma/hash kontrolleri geçti. Ayrı `production / kontrol` koşusu
    [36941266355](https://github.com/edmyapigayrimenkul/edm/actions/runs/36941266355)
    başarılı. Bunlar elle tetiklenen gerçek CI koşularıdır; schedule çalışması
    sayılmaz. Bildirim teslimi olmadan günlük kapı `0` olarak kalır.
    Salt okunur üretim sayımında 59 ilan, ana portal görsel sütununda 510
    bağlantı, `ilan_foto` tablosunda sıfır yüklenmiş fotoğraf bulundu. SQL bu
    bağlantıları korur; portal/CDN fotoğraf dosyaları R2 yedeğinde bulunmaz.
    Dış fotoğrafların kalıcı kopyası ayrıca ele alınmalı.
    Email Service → Email Sending
    üzerinden `edmyapigayrimenkul.com` gönderim ayarı incelenmeli. Doğrulanmış
    Doğukan alıcısına ücretsiz gönderim yolu korunmalı; ücretli yükseltme yapılmadı.
  - [PR #2](https://github.com/edmyapigayrimenkul/edm/pull/2) dar kapsamlı altı
    dosyayla ana dala alındı (`d366db0`). Gizli anahtar giriş betiği, rakamlı R2
    alanları için yinelenme düzeltmesi, bilinen bildirim hata kodları ve gerçek
    yetki/arşiv kapsamını açıklayan kurulum belgesi artık depoda. Gerçek CI
    [36941364002](https://github.com/edmyapigayrimenkul/edm/actions/runs/36941364002)
    17 Node ve 2 Python testini geçti; PR işleri Cloudflare sırlarına erişmedi.
    Aktarılan kaynakta gerçek yedek anahtar eşleşmesi yok. Ana çalışma ağacındaki
    birikmiş site değişiklikleri bu PR'a dahil edilmedi; Worker dağıtımı yapılmadı.
    Günlük çalışma kapısı son kontrolünde `0`; bildirim teslimi ve ilk gerçek
    schedule koşusu bekleniyor. Mevcut bildirim tokenıyla sending limits GET
    HTTP 200, eski yerel tokenıyla routing/sending alan ayarı GET HTTP 403;
    Doğukan alıcısının doğrulanmış durumu bu çağrılarla teyit edilemedi.
  - 2 Ekim kullanıcı panelinde `edmyapigayrimenkul.com` Email Sending
    `Enabled`, DNS `Configured` göründü. Ana daldaki yeni kontrollü test
    [36996483293](https://github.com/edmyapigayrimenkul/edm/actions/runs/36996483293)
    güvenlik testlerini ve ayrı bildirim işini geçti. Arşiv işinin kasıtlı
    başarısızlığı nedeniyle genel koşu kırmızı; bu testte veri işlemi yapılmadı.
    Cloudflare 10:38 UTC'de `kuyrukta` sonucu verdi; önceki 10203 engeli bu
    gönderimde görülmedi. Kuyruğa kabul, gelen kutusuna teslim kanıtı değildir.
    Kullanıcı sabit Doğukan adresinde test e-postasının geldiğini teyit etti.
    2 Ekim 13:42 Türkiye saati itibarıyla GitHub depo değişkeni
    `YEDEK_ZAMANLAYICI_HAZIR=1` ayarlandı ve geri okunarak doğrulandı.
    Günlük program: Türkiye saati 02:17 üretim arşivi, 15:47 bağımsız
    güncellik kontrolü. Beklenen ilk etkin zamanlanmış kontrol 2 Ekim 15:47,
    ilk arşiv 3 Ekim 02:17; bunlar henüz gerçekleşmiş sayılmaz.
    Açılış sonrası elle tetiklenen üretim güncellik kontrolü
    [36996966334](https://github.com/edmyapigayrimenkul/edm/actions/runs/36996966334)
    başarılı; güvenlik ve arşiv kontrolü geçti, hata bildirimi beklenen şekilde
    atlandı. Bu doğrulama ilk zamanlanmış koşunun yerine sayılmadı.
    İlk etkin gerçek `schedule` koşusu
    [37010132506](https://github.com/edmyapigayrimenkul/edm/actions/runs/37010132506)
    2 Ekim 16:00 Türkiye saatinde başladı ve başarılı tamamlandı. Bu, hedef
    15:47 bağımsız güncellik kontrolünün gecikmeli gerçek çalışmasıdır;
    güvenlik ve arşiv/güncellik işi geçti, bildirim atlandı. İlk zamanlanmış
    arşiv hâlâ 3 Ekim 02:17 hedefiyle bekleniyor; görev henüz tamamlanmadı.

- [x] **EDM-053 — Senkron ve talep uyarılarını güçlendir.**
  - Senkron hatası, olağandışı ilan düşüşü, bildirim hatası ve bekleyen talep eşiği için
    anlamlı uyarılar oluşturulmalı.
  - Değişiklik yokken gereksiz bildirim gönderilmemeli.
  - Kabul: eylem gerektiren durum işletmeye zamanında ulaşır.
  - 2 Ekim kod incelemesi: `epostaGonder` gönderim başarısızlığında `false`
    döndürüyor; `api/talep.ts` bu sonucu kaydetmeden formu başarılı tamamlıyor.
    Talep kaydı korunuyor, ancak bildirimin gitmediği panelde görünmüyor ve
    talep bildirimi için kalıcı tekrar deneme kaydı bulunmadı. Sonraki uygulama
    EDM-041 ile birlikte talep bildirim durumunu ve yeniden denemeyi ele almalı.
    Bu bulgu mevcut koddan çıkarıldı; canlı form teslim testi yapılmadı.
  - Talep bildirim kaydı, uyarı filtresi ve tekrar deneme kısmı EDM-041 ile
    2 Ekim'de canlıya alındı. Kalan: senkron hatası/olağandışı ilan düşüşü ve
    uzun süredir bekleyen talepler için olay değişmedikçe tekrarlanmayan uyarılar.
  - 2 Ekim 17:27 Türkiye saati — Uygulama ve dağıtım tamamlandı:
    `0009-isletim-uyari.sql` eklemeli tablosu; senkron hatası/boş yanıt, mevcut
    emniyet eşiğine bağlı ani düşüş, eksik ilan ayrıntıları, 24 saat bekleyen
    yeni talepler ve başarısız/belirsiz talep e-postaları kalıcı olarak izleniyor.
    Aynı sorun sürerken metin/sayı güncellenir, kabul edilmiş uyarı yeniden
    gönderilmez; düzelip tekrar oluşunca yeni olay açılır. Gönderimler atomik
    sahiplenilir, kesin hatada 6 saat arayla en fazla 5 deneme, belirsiz sonuçta
    otomatik durma uygulanır. Eski/geç sonuç yeni olayı değiştiremez.
    Access korumalı `/yonetim/uyarilar` ekranı, menü rozeti ve manuel tekrar
    eklendi. Günlük özet kalıcı eski sorunları tekrar göndermiyor.
  - 128 test, üretim derlemesi ve diff kontrolü geçti. Gerçek yerel D1 testleri
    eşzamanlı tek gönderim, eski gözlem/olay, düzelme/yeniden açılma, 24 saat
    eşiği, hata/deneme sınırı ve belirsizliği doğruladı. Yerel Worker paneli
    200; Origin olmayan/yanlış istek 403, geçersiz uyarı 400. Yerel e-posta
    emülatörü yeniden gönderimi kabul etti; ikinci gönderim atlandı. Sentetik
    uyarı silindi, yerel sayım 0; geçici Worker ve tarayıcı sekmeleri kapatıldı.
  - Dağıtım öncesi üretim yedeği
    [37018713358](https://github.com/edmyapigayrimenkul/edm/actions/runs/37018713358)
    başarılı. Staging `01e6a7b5-afdd-4810-a47e-6597403efab7`; canlı son sürüm
    `b4e4374d-fb97-4ccd-b4d1-bb4eb020ad5b`. Canlı migration geri okunarak
    doğrulandı; `/`, `/ilanlar`, `/sitemap.xml` 200, uyarı ekranı Access'e
    302/no-store. Gerçek gizli değerlerin kaynak/çıktıda eşleşmesi 0.
    Mevcut `dev:test` şeması da 0009'a geçirildi.
  - Canlı salt okunur sayım: 24 saati aşan 1 yeni talep, 0 sorunlu talep
    bildirimi. Uyarı tablosu henüz 0 satır; yeni kodla gerçek senkron çalışmadı.
    Manuel senkron anahtarı yerel dosyalarda yok, canlı panel oturumu Access
    girişini gerektiriyor. İlk gerçek otomatik kontrol 2 Ekim 18:00 Türkiye
    programını bekliyor; bu nedenle kabulün canlı cron bölümü henüz doğrulanmadı
    ve görev `[-]` kaldı. İşletim ayrıntıları: `site/docs/isletim-uyarilari.md`.

  - Tamamlandı: 2 Ekim 18:06 Türkiye saati — İlk gerçek yeni-kod cron'u
    18:00:36–18:01:23 aralığında tamamlandı, 48 ilan bulundu ve ayrıntı hatası
    0. Senkron uyarıları kapalı, bekleyen talep uyarısı aktif; 18:01:30'da
    birinci denemede e-posta gönderimine kabul edildi. Bu kayıt sağlayıcı
    kabulünü kanıtlar; bu gerçek uyarının gelen kutusuna teslimi ayrıca teyit
    edilmedi. Önceki test e-postasının gelişi kullanıcı tarafından doğrulanmıştı.

### Faz 8 — Sosyal medya ve ileri özellikler

- [x] **EDM-054 — `postedm` ile canlı portföyü aynı veri kaynağına bağla.**
  - Bot bugün `site/data/listings.json` okuyor; canlı site D1 kullanıyor.
  - Sosyal paylaşım öncesi ilan aktifliği ve güncel fiyat canlı kaynaktan doğrulanmalı.
  - Kabul: pasif veya eski fiyatlı ilan otomatik paylaşılmaz.
  - Tamamlandı: site D1 kuyruğu ilanın aktiflik, fiyat, fotoğraf ve halka açık alanlarını
    iş tesliminde yeniden üretiyor; `postedm` donuk JSON yerine bu anlık kaydı kullanıyor.
    Worker ortak API secret'ı ve GitHub Actions OIDC zinciri canlıda doğrulandı; pasif veya
    eski fiyatlı ilan paylaşım öncesi yeniden denetleniyor.

- [-] **EDM-055 — Sosyal yayın başarısını ve kaynak dönüşümünü ölç.**
  - Instagram, Threads, YouTube Shorts ve TikTok yayın sonucu kaydedilmeli.
  - Site bağlantıları platform/kampanya kaynağını taşımalı.
  - Kabul: hangi paylaşımın site ziyareti ve talep ürettiği görülebilir.

- [ ] **EDM-056 — Gelişmiş arazi bilgi ve filtre modelini kur.**
  - Tarla, villa imarlı ve toplu konut için arazi ayrılmalı.
  - Tapu türü, hisse alanı, erişim ve yalnız doğrulanmış imar bilgileri alanlaştırılmalı.
  - Belge tarihi ve kaynağı tutulmalı; site hukuki tespit yapıyormuş gibi yazmamalı.
  - Kabul: “toprağı bilen ofis” vaadi doğrulanmış ve anlaşılır verilerle desteklenir.

- [ ] **EDM-057 — Yüksek değerli arazi için kontrollü sunum akışı oluştur.**
  - Ayrıntılı sunum dosyası ve yatırımcı görüşme talebi hazırlanmalı.
  - Paylaşılacak bilgilerin gizlilik ve yetki sınırı belirlenmeli.
  - Kabul: toplu konut/büyük parsel ilgilisi genel iletişim formundan daha uygun bir
    akışa girer.

- [ ] **EDM-058 — Kullanıcı hesabı ihtiyacını veriye göre değerlendir.**
  - Favorileri cihazlar arasında taşıma veya kayıtlı arama ihtiyacı gerçek kullanım
    verileriyle kanıtlanmadan hesap sistemi kurulmaz.
  - Kabul: karar dönüşüm verisine, tekrar ziyaret oranına ve destek ihtiyacına dayanır.

- [x] **EDM-059 — İlan ekleme, düzenleme ve görüntüleme mimarisini yeniden kur.**
  - Önceki uygulama 2026-09-10 tarihinde yeniden açıldı: alan sayısı yüksek olsa da kategori
    modeli, form akışı, görsel hiyerarşi, doğrulama ve bakım mimarisi kabul edilebilir değildi.
  - Kategori ağacı; işlem türü → ana mülk grubu → alt tür sırasıyla kurulmalı. Geçersiz
    birleşimler seçilememeli ve kategori değişince ilgisiz alanlar kaydedilmemeli.
  - Tek bir şema; form alanlarını, zorunlulukları, seçenekleri, yardım metinlerini, ilan
    detayındaki grupları ve portal karşılıklarını üretmeli.
  - İlan ekleme ve düzenleme aynı form bileşenini kullanmalı; kopyalanmış sayfa, betik ve
    stiller kaldırılmalı.
  - Form; anlaşılır adımlara, bölüm ilerlemesine, alan bazlı doğrulamaya, hata özetine,
    taslak korumasına, doluluk kontrolüne ve yayın öncesi özete sahip olmalı.
  - Konut, arsa/tarla, iş yeri, bina, turistik tesis ve proje için ayrı ve anlamlı alan
    şablonları bulunmalı. Donanımlar kısa, aranabilir ve kendi kategorisine ait gruplarda
    gösterilmeli; aynı bilgi hem teknik alan hem donanım olarak tekrar etmemeli.
  - Ada/parsel, imar ve yetki gibi iddialar için doğrulama durumu, kaynak ve belge tarihi
    tutulmalı; doğrulanmamış bilgi ziyaretçiye doğrulanmış gibi sunulmamalı.
  - Medya akışı kapak, sıra, fotoğraf niteliği, video ve sanal turu açıklamalı; var olan
    `/yonetim/gorsel/[id]` aracıyla kopuksuz çalışmalı.
  - İlan detayı mobil ve masaüstünde fiyat, temel karar bilgileri, galeri, açıklama, teknik
    özellikler, konum, danışman ve iletişim eylemlerini doğru öncelik sırasıyla sunmalı.
  - Emlakjet senkronu ile panel geçersiz kılma üstünlüğü korunmalı; elle eklenen ilanlar
    senkron tarafından pasiflenmemeli.
  - Kabul: kategori başına örnek ilanla ekleme → düzenleme → görüntüleme zinciri; geçersiz
    veri, kategori değişimi, taslak geri yükleme, mobil görünüm ve klavye kullanımı
    doğrulanır. `npm run build` ve ilgili regresyon kontrolleri geçer.
  - Tamamlandı: 11 Eylül 2026. Ortak şema ve form, altı kategori, altı işlem türü,
    senkron güvenli panel geçersiz kılmaları, ayrıntılı ilan sunumu ve yayın kontrolleri
    birlikte devreye alındı. D1 şema geçişi ilan panelinin ilk isteğinde ve her
    senkron öncesinde tekrar çalışabilir biçimde uygulanır.

- [x] **EDM-060 — İlan işletim ve yayın yaşam döngüsünü tamamla.**
  - Portal ilanı kaynaktan kaybolunca silinmeden pasif kalmalı; geri gelince yeniden aktif
    olmalı. Panelde verilen “yayından al” kararı senkron sonrasında da korunmalı.
  - Elle girilen ilanlar otomatik senkrondan bağımsız aktif/pasif yapılabilmeli ve yalnızca
    açık, onaylı işlemle kalıcı silinebilmeli.
  - İlan bazlı takip tarihi/notu, zamanı gelen hatırlatmalar ve pasife düşen portal ilanları
    için tekil, tekrar göndermeyen bildirim kaydı bulunmalı.
  - WhatsApp Cloud API yapılandırılmışsa pasifleşme bildirimi onaylı şablonla otomatik
    gönderilmeli; yapılandırma yoksa kayıt beklemede kalıp panelde görünmelidir.
  - Kabul: elle/portal durum matrisi, senkron üstünlüğü, hatırlatma ve bildirim tekrar
    engeli yerel D1 üzerinde doğrulanır.
  - Tamamlandı: kaynak aktifliği ile yönetici yayın kararı ayrıldı; elle ilan silme
    ilişkili kayıt ve R2 temizliğiyle sınırlandı. Hatırlatma günlük özete, portal pasifi
    tekil WhatsApp kuyruğuna bağlandı. Canlı WhatsApp secret'ları henüz tanımlı değildir.

- [x] **EDM-061 — İlan fiyatı, sezonluk kiralama ve görsel girişini tamamla.**
  - “Sezonluk kiralık” işlem türü konut ve turistik tesislerde seçilebilmeli; sezon
    başlangıç/bitiş ve minimum süre alanları yalnızca bu işlemde görünmelidir.
  - Fiyat yazılırken binlik ayraçlar otomatik konmalı ve tutarın Türkçe okunuşu para
    birimine göre hemen altında silik italik metinle gösterilmelidir.
  - Yeni ilan ekranında fotoğraf seçme, önizleme, tarayıcıda küçültme ve yükleme aynı
    akışta yapılmalı; ham URL girişi ikincil gelişmiş seçenek olarak kalmalıdır.
  - Kabul: sezonluk kayıt, biçimlenmiş fiyatın sunucuda doğru sayıya dönüşmesi ve çoklu
    görsel yükleme masaüstü/mobilde uçtan uca doğrulanır.
  - Tamamlandı: 2026-09-14 — Sezon tarih/süre tutarlılığı, fiyat biçimi ve Türkçe
    okunuş, WebP küçültme, önizleme, 50 fotoğraf sınırı ve R2 yükleme kuruldu.
    2400×1600 JPEG’in tarayıcıda 1800×1200 WebP’ye dönüşüp D1/R2’den geri okunması;
    49 kayıt üzerine iki dosya gönderildiğinde 50’ncinin kabul, 51’incinin reddi
    doğrulandı. Geçici kayıt ve nesneler test sonunda temizlendi.

- [x] **EDM-062 — Yönetim panelini `postedm` sosyal yayın kuyruğuna bağla.**
  - Yeni ilan kaydının son adımında ve ilan listesi/düzenleme ekranında platform seçerek
    paylaşım kuyruğuna ekleme bulunmalıdır.
  - `postedm`, donuk JSON yerine site API'sinden kuyruğu almalı; yayından hemen önce ilanın
    etkin durumunu, güncel fiyatını ve görsellerini yeniden doğrulamalıdır.
  - Yayın sonucu, platform yanıtları ve hata D1'e geri yazılmalı; aynı ilan için yinelenen
    bekleyen iş üretilmemelidir.
  - Kabul: pasif ilan reddedilir, aktif ilan güvenle sahiplenilir, sonuç geri bildirilir ve
    dış platformlara gerçek gönderim yapmadan kuru çalıştırma ile zincir doğrulanır.
  - Tamamlandı: oluşturma/düzenleme/liste eylemleri, D1 kuyruğu, makine API'si, GitHub
    Actions işi, platform bazlı sonuç kaydı ve yinelenen iş koruması kuruldu. GitHub secret
    yönetim yetkisi gerektirmeyen kısa ömürlü Actions OIDC kimliği; değişmez depo/sahip
    kimliği, ana dal, workflow, event, hedef kitle ve RS256 imzasıyla doğrulanıyor. Kuru mod
    işi sahiplenip güncel ilanı API'den yeniden okuyor ve hiçbir dış platformu çağırmadan
    `kuru` terminal sonucunu D1'e yazıyor.
  - Canlı kabul: postedm `9472a6a`, Worker `8a232481-309d-4b95-aa11-1b57f3592077` ve
    Actions koşusu `34860612239` ile zincir tamamlandı. Aktif `19673570` ilanının
    19.900.000 TL fiyatı ve 15 fotoğrafı yeniden okundu; `disPlatformCagrisi:false`, tek
    deneme ve hatasız sonuç görüldü. Özel `kuru` hedefi gerçek hesaplarla eşleşmedi. Geçici
    D1 işi silindi ve kuyruk yeniden sıfırlandı. Site 39/39; güncel temiz postedm tabanı
    41/41, mevcut geliştirme ağacı 49/49 testten geçti. Gerçek sosyal gönderim yapılmadı.

- [x] **EDM-063 — Yönetim paneline ikinci admin ekle ve telefonla giriş seçeneğini değerlendir.**
  - Mevcut Cloudflare Access e-posta girişi ve Worker tarafındaki JWT doğrulaması korunmalı;
    panelin tamamını herkese açık `Bypass` kuralına almak çözüm olarak kullanılmamalıdır.
  - Yeni admin, Access politikasına tam e-posta adresiyle eklenebilmeli; yalnızca “geçerli
    e-postası olan herkes” veya yalnızca giriş yöntemi ölçütüyle genel yetki verilmemelidir.
  - Uygulama tarafında `PANEL_ADMIN_EPOSTALARI` ikinci izin katmanı olmalı; kurulum betiği
    aynı tam adres listesini Access politikasına ve Worker değişkenine birlikte yazmalıdır.
  - Telefon numarasıyla doğrudan giriş isteniyorsa telefon kimliğini doğrulayan OIDC/SAML
    sağlayıcısı Access'e ikinci kimlik sağlayıcı olarak bağlanmalı; rol ve oturum yine Access
    jetonundan doğrulanmalıdır. WhatsApp ilan bildirim anahtarı admin oturumu üretmek için
    yeniden kullanılmamalıdır.
  - Gerekli işletme girdisi: eklenecek adminin e-posta adresi, adı/rolü ve telefonla girişte
    kullanılacak kimlik sağlayıcısı ile telefon numarası.
  - Kabul: iki admin ayrı kimlikle giriş yapar, yetkisiz kimlik reddedilir, çıkış her iki
    yöntemde oturumu kapatır ve panel/API uçları aynı yetki kapısından geçer.
  - Uygulama hazırlığı tamamlandı: tam e-posta listesi Access ve Worker'da birlikte
    uygulanıyor. Doğukan Özdoğan ana admin, Metin Özdoğan ikinci admin olarak tanımlandı;
    iki hesap da tam e-posta kimliğiyle sınırlandı. Telefon numaraları alındı ve depoya
    yazılmadı. E-posta erişimi canlıya alındı. SMS OTP'nin kullanım başına ücretli olması
    nedeniyle işletme kararıyla telefon IdP kurulmayacak.

- [!] **EDM-064 — İçerik taramasında kalan işletme teyitlerini tamamla.**
  - `19538691`: özelliklerde hisseli tapu, açıklamada kat irtifakı yazıyor. Tapu türü ve
    138 m² ölçünün kapsamı belgeyle teyit edilmeli; tahminle tapu türü değiştirilmedi.
  - `19647778`: açıklama 83 ada/157 parsel diyor, özellikte parsel 3 var. Güncel kadastro
    ve toplam parsel teyidi gerekli. Açıklamada açıkça belirtilen 173 m² satılan hissedir.
  - `19294003` ve `19672030`: kullanım durumu dolu, açıklama boş/hemen teslim diyor.
    İlki için 4+2 başlık/katlardaki beş oda; ikincisi için net/brüt yapı ölçüsü de teyit edilmeli.
  - `19572827`, `19647602`, `19751424`: fiyatın tek parsel, tek hisse veya bütün taşınmaz
    karşılığı olduğu ve satılan alan netleştirilmeli. Belirsiz kayıtta m² fiyatı hesaplanmıyor.
  - `19393771`: 231 m² hisse biliniyor; toplam parsel eksik.
  - `18522916` ve `18746132`: aynı daire olma ihtimali var; bağımsız bölüm teyidi olmadan
    birleştirilmedi. Benzer fotoğraf/metin tek başına kesin mükerrer kanıtı sayılmadı.
  - `18350489` ve `19751424`: sitede görünür fotoğraf sayısı üç. `19751424` kaynak
    Emlakjet sayfasında da üç gerçek ilan fotoğrafı bulundu ve hepsi yüklendi; drone
    görünümü harita döşemesi. Bu kayıt için senkron kaybı yok, daha fazla fotoğraf
    isteniyorsa önce kaynak portalda eklenmeli. `18350489` için de kaynak galeri
    kapak + iki ilan fotoğrafı + ayrı drone görünümü içeriyor; üç gerçek fotoğraf
    sitedeki kayıtla eşleşiyor.
  - Kabul: danışman teyidiyle panel düzeltmeleri yapılır, sabit teyit notları gözden geçirilir
    ve kalite raporu yeniden üretilir. Kontrol listesi için yukarıdaki rapor esas alınır.
  - Teyit iş akışı canlıya hazırlandı: `/yonetim/teyitler` ekranında 10 ilan için 15 ayrı
    soru; bekliyor, bilgi alındı ve konu kapandı durumları; doğrulanan yanıt, belge/teyit
    kaynağı, iç not, kaydeden admin ve zaman izi tutuluyor. Yanıtsız kayıt ilerletilemiyor;
    konu kapatılırken kaynak zorunlu. Teyit kaydı otomatik kalite uyarısını tek başına
    gizlemiyor; ilan alanı ayrıca düzeltilmeli.
  - Satılık kayıtların fiyatının taşınmazın tamamı, belirtilen hisse, tek/çoklu parsel veya
    bağımsız bölüm paketinden hangisini kapsadığı ilan formuna yapılandırılmış `Fiyat
    Kapsamı` alanı olarak eklendi. `19572827`, `19647602` ve `19751424` uyarıları bu alan
    ve gerekli hisse/tapu bilgisi işlenmeden kapanmıyor.
  - Canlı D1'e `0004-ilan-teyit.sql` uygulandı; başlangıçta sahte teyit oluşturulmadı ve
    kayıt sayısı sıfır bırakıldı. Güncel kontrol:
    [2026-09-14-ilan-kalite.md](./raporlar/2026-09-14-ilan-kalite.md). İşletmeden gerçek
    yanıtlar geldikçe panel düzeltmeleri yapılıp bu madde tamamlanacak.

- [x] **EDM-066 — Satılık villa formunu Sahibinden alanlarıyla karşılaştır ve eksikleri kapat.**
  - Sahibinden Ofisim'de satılık villa için görülen temel bilgiler, cephe, iç/dış
    özellikler, muhit, ulaşım, manzara, konut tipi ve erişilebilirlik alanları karşılaştırılmalı.
  - Birbirini dışlayan mutfak ve konut planı değerleri bağımsız onay kutuları olmamalı.
  - Fotoğraf sınırı portal akışıyla uyumlu olmalı; sunucu mevcut fotoğraf sayısını da
    hesaba katmalıdır.
  - Kabul: paylaşılan ekranlardaki seçenekler şemada temsil edilir, eski mutfak verisi
    kaybolmadan taşınır ve villa formu tarayıcıda doğru alanları üretir.
  - Tamamlandı: 13 Eylül 2026 — 40 kategori alanı; yetki ve medyayla birlikte 50
    yapılandırılmış alan, 6 grupta 149 nitelik, tek seçimli mutfak ve kat/plan tipi ile
    50 fotoğraf sınırı kuruldu. Enerji kimlik belgesi ve yönetim içi mülk sahibi statüsü
    eklendi; eski mutfak kutuları düzenleme formunda yeni alana taşınıyor. Karşılaştırma raporu:
    [2026-09-13-sahibinden-satilik-villa-alan-karsilastirmasi.md](./raporlar/2026-09-13-sahibinden-satilik-villa-alan-karsilastirmasi.md)

- [x] **EDM-067 — İlana özel konum, video ve portal dışa aktarım sözleşmesini tamamla.**
  - İlana koordinat pini, doğruluk seviyesi ve yalnızca yönetimde görülen kesin konum
    ile halka açık yaklaşık konum ayrımı eklenmeli.
  - URL alanına ek olarak kontrollü video dosyası yükleme, poster kare, süre/boyut sınırı
    ve depolama politikası kurulmalı.
  - EDM alanları Sahibinden, Emlakjet ve Hepsiemlak alanlarına açık bir dönüşüm tablosuyla
    eşlenmeli; desteklenmeyen veya eksik alanlar ilan bazında raporlanmalı.
  - Portal izin veriyorsa ilan bazlı danışman/telefon gösterim tercihi aktarılmalı.
  - Kabul: aynı örnek villa üç portal için dışa aktarım önizlemesinde veri kaybetmez;
    yaklaşık kamu haritası kesin koordinatı açığa çıkarmaz; video akışı sınırları uygular.
  - Tamamlandı: 14 Eylül 2026 — Yönetimde kesin pin, doğruluk kaynağı ve portal konum
    izni; sitede deterministik olarak 360–520 metre uzaklaştırılan yaklaşık alan kuruldu.
    Sahibinden, Emlakjet ve Hepsiemlak için 41 kategori alanını, nitelikleri, medyayı ve
    iletişim tercihini kapsayan önizleme/JSON sözleşmesi eklendi. Doğrudan MP4, WebM ve
    MOV yükleme; tarayıcıda poster üretme; 3 dakika/75 MB sınırı; D1/R2 kaydı, değiştirme,
    silme ve byte-range oynatma tamamlandı. Video gövdesi, 75 MB dosyalarda ikinci bir
    bellek kopyası oluşturmadan doğrudan R2'ye akıtılıyor.

- [-] **EDM-068 — Bütün alt mülk türlerini villa düzeyinde eksiksizleştir.**
  - Güncel 137 alt türün her biri için işlem türüne ve alt türe özel alan/nitelik şablonu olmalı.
  - Aynı grup içindeki restoran–fabrika veya otel–kamp alanı gibi farklı türler gereksiz
    alanları birlikte göstermemeli.
  - Form, sunucu doğrulaması, ilan detayı ve portal önizlemesi aynı koşullu şemayı kullanmalı.
  - 18 Eylül başlangıç kapsamı 45 alt tür, 176 teknik alan ve toplam 225 nitelik olarak
    sayısallaştırıldı. `tipler` koşulu form, sunucu kaydı ve ilan detayındaki ortak şemaya
    eklendi. Kamp alanı; otel odası/yıldız alanları yerine zorunlu kamp ünitesi ile çadır
    ve karavan kapasitelerini gösteriyor. İlgisiz gönderilen alanın kayda alınmadığı birim
    testi ve iki yönlü tarayıcı testi geçti. Kalan 44 alt türün kesin alan/önem dereceleri
    portal referanslarıyla doldurulacak. En yüksek farkı olan yedi Sahibinden şablonu için
    ekran görüntüsü sırası çıkarıldı:
    [2026-09-18-ilan-kategori-envanteri.md](./raporlar/2026-09-18-ilan-kategori-envanteri.md)
  - 19 Eylül ilerlemesi: paylaşılan 22 Sahibinden ekranı işlendi. Konut kataloğu 12,
    arsa 10, iş yeri 99, komple bina 5, turistik tesis 7 ve proje 4 olmak üzere toplam
    137 alt türe çıktı. İşlem türüne göre alt tür filtreleme kuruldu: devren konutta
    yalnız daire/villa; iş yerinde 83 devren işletme türü; arsada fiyat gerektirmeyen
    `Kat Karşılığı Satılık` akışı bulunuyor. Restoran masa/kişi kapasitesi, bina zorunlu
    yapı alanları ve otelin açık alan, kat, yaş, yıldız, oda tipi, yapı/tapu alanları
    eklendi. Arsa, iş yeri, bina ve turistik nitelikleri 161 seçeneklik kapsama genişledi.
    Form, sunucu, detay fiyat etiketi, kalite denetimi ve portföy istatistiği aynı işlem
    kimliğini kullanıyor. Yerel tarayıcıda kat karşılığı fiyat gizleme, devren konutun iki
    alt türü, 83 seçenekli devren iş yeri kataloğu, restoran ve otel koşullu alanları
    hatasız doğrulandı. Güncel kapsam ve açık kaynak referansları aynı envanter raporunda.
  - 23 Eylül ilerlemesi: açık Sahibinden kategori/ilan ve yardım sayfaları referans
    alınarak ekran görüntüsüne bağımlılık azaltıldı. Konut projesine blok sayısı,
    konut–ticari ünite dağılımı, satış/teslim durumu, teslim tarihi, satılık planlar
    ve satış ofisi; iş yerlerine alt türe bağlı vitrin, baca/ruhsat, lojistik/üretim
    yüksekliği, elektrik ve yükleme alanları eklendi. Proje sayısal tutarlılıkları
    (satıştaki ünite, alt toplamlar, tarihli teslim) sunucuda doğrulanıyor.
  - 29 Eylül ilerlemesi: iş yeri mülk ve devren kataloglarında ortak bulunan Çiftlik,
    Hamam/Sauna/Spa, Maden Ocağı, Okul, Pazar Yeri, Spor Tesisi ve Toplantı/Etkinlik
    Salonu tekilleştirilirken devren işlem izinleri kayboluyordu. Tekilleştirme artık
    işlem izinlerini birleştiriyor; yedi türün satılık, kiralık, devren satılık ve
    devren kiralık seçenekleri ile iki devren sunucu kaydı regresyon testine alındı.
    Komple binada "bir kattaki daire sayısı" yalnız Apartman için zorunlu hale geldi;
    sıfır değeri reddediliyor, Plaza bu ilgisiz alan olmadan kaydedilebiliyor.
    Açık Sahibinden iş yeri kategori listesiyle çapraz kontrolde Fatura Merkezi,
    İş Hanı ve Sinema/Konferans Salonu eksikleri eklendi; Araç Showroom, Eczane &
    Medikal, Etkinlik & Performans, Kır & Kahvaltı Bahçesi ve Öğrenci Yurdu etiketleri
    kaynak adlarıyla eşlendi. Var olan kategori anahtarları korundu, toplam 140 türe
    çıktı. Kaynak liste ilan verme formundaki zorunlu alanları göstermediği için alan
    şeması için tek başına kanıt sayılmıyor. Aynı açık ilan filtresinde görünen Kat
    Kaloriferi ve Merkezi ısıtma seçenekleri ortak ısıtma kataloğuna eklendi; kombi
    ve Fan Coil için eski kayıt değerleri korunurken görünen etiketler kaynak adıyla
    eşleştirildi.
    Şema sayımında 102 iş yeri alt türünün 65'inde tipe özel teknik alan bulunmadığı
    görüldü (ortak iş yeri alanları var). Konutun 12, arsanın 10 ve projenin 4 alt
    türü de tamamen grup ortak alanlarını kullanıyor. Bu tek başına alan eksikliği
    kanıtı değil; sonraki kabul turunda her alt tür için gerekli/ilgili ortak alanlar
    ve nitelikler ayrı ayrı denetlenecek. Özellikle 102 iş yeri türünün aynı donanım
    gruplarını göstermesi uygunluk açısından kontrol edilmeli. Sahibinden'in açık
    akaryakıt istasyonu filtrelerinde Pompa Sayısı için “Yok” ve Günlük Satış (L)
    alanları bulunduğu doğrulandı. Pompa sayısı artık zorunlu değil (0 veya boş kabul
    edilir); günlük litre satışı yalnız akaryakıt istasyonunda, isteğe bağlı önerilen
    alan olarak forma eklendi. Bu listeleme filtresi ilan verme ekranındaki zorunluluğu
    kanıtlamaz; alanlar tahmin edilmeye zorlanmıyor. Restoran filtrelerinde Masa Sayısı,
    Kişi Kapasitesi, Isıtma ve Tapu Durumu teyit edildi; masa/kapasite şeması zaten var,
    ortak ısıtma ve tapu alanlarıyla eşleşiyor. Spor tesisi filtresindeki salon, saha,
    komple tesis ve yarış pisti seçenekleri yalnız spor tesisinde görünen seçenekli alan
    olarak eklendi. İnternet/oyun kafe filtresindeki kapasite ise kaynakta birim
    belirtilmediği için yalnız bu türde birimsiz ve isteğe bağlı sayısal alan oldu.
    Teknik alan kataloğu 202'ye çıktı.
    Yeni kaynak karşılaştırmasında öğrenci yurdu için oda/yatak sayısı, depo için
    tavan yüksekliğinden ayrı giriş yüksekliği eklendi; düğün salonu masa sayısı
    ilgili türe açıldı. Her iş yeri türünde zorunlu tutulan genel “Bölüm / Oda Sayısı”
    kaynağa göre fazla geneldi; zorunluluğu kaldırılıp önerilen alan oldu. Kaynaklarda
    arama filtresi görünmesi ilan girişinde zorunlu olduğu anlamına gelmediğinden bu
    yeni alanlar isteğe bağlı kaldı. Teknik alan kataloğu 205'e çıktı.
    Eczane/medikal örneklemesinde bina yaşı, ısıtma, kredi ve tapu filtrelerinin
    ortak alanlarla karşılandığı görüldü. Otopark filtresindeki Araç Kapasitesi
    eksikti; otopark ve garaj türlerine isteğe bağlı eklendi. İş yeri alan kataloğu
    43'e, toplam teknik alan sayısı 206'ya çıktı. Kategori ve alan çapraz sayımında
    tipe özel alanı olmayan iş yeri alt türü 65/102 olarak güncellendi.
    30 Eylül: Anaokulu & Kreş, Ofis & Büro ve Kuaför & Güzellik Merkezi açık arama
    filtrelerinde görünen oda düzeni seçenekleri dört iç alt türe (Anaokulu & Kreş,
    Ofis & Büro, Güzellik Merkezi, Kuaför & Berber) isteğe bağlı alan olarak eklendi.
    Açık arama filtreleri bina yaşı/ısıtma seçeneklerini gösterse de ilan girişinde zorunlu
    olduklarını kanıtlamadığından bu iki ortak iş yeri alanı zorunlu olmaktan
    çıkarıldı. Katalog 44 iş yeri alanı / 207 toplam teknik alana çıktı; türe özel
    alanı olmayan iş yeri türü 61/102. Kaynak ve ayrıntı:
    [2026-09-18-ilan-kategori-envanteri.md](./raporlar/2026-09-18-ilan-kategori-envanteri.md).
    Bu turda test paketi çalıştırılmadı; üretim derlemesi ve `git diff --check` geçti.
    Önceki alan/işlem düzeltmelerinde `npm test` geçmişti. Değişiklikler canlıya dağıtılmadı.
    30 Eylül devam turu: Sahibinden’in okul/kurs, fabrika, muayenehane, sinema/konferans,
    SPA, gece kulübü, maden ocağı ve enerji santrali filtreleri incelendi. Okul ve Kurs &
    Eğitim Merkezi için Derslik Sayısı; Fabrika için Bina Adedi ve Giriş Yüksekliği;
    Muayenehane için oda düzeni; sinema ve konferans salonu için kişi kapasitesi ve tavan
    yüksekliği; SPA için hizmet verilen cinsiyet ve kapasite; gece kulübü için kapasite;
    maden ocağı için ayrı maden işletme ruhsatı; enerji santrali için altı üretim türü
    isteğe bağlı alanlara bağlandı. Huzurevi, oto servis, sağlık merkezi, fatura merkezi,
    market, nakliyat, araç showroom, pazar yeri, hal ve pet shop örneklerinde yeni teknik
    alan doğrulanmadı. Taksi durağında arama filtreleri ortak taşınmaz bilgileriyle
    sınırlı; sonuç ilanlarında görülen hisse, ticari plaka ve araçla devir örnekleri için
    portal alanı olduğu iddia edilmeden isteğe bağlı devir kapsamı ve hisse payı alanları
    eklendi. Kırtasiye ve marketteki m²/tapu/ısıtma bilgileri ortak alanlarla karşılanıyor.
    Güncel toplam 215 teknik alan, 52 iş yeri alanı; geçerli tip kimlikleriyle yapılan
    sayımda 102 iş yeri türünün 52'sinde türe özel alan yok, 50'sinde var. Öğrenci yurdu
    oda/yatak alanı düzeltmesinden sonra sayaç yenilendi. Ayrıntılı kaynaklar:
    [2026-09-18-ilan-kategori-envanteri.md](./raporlar/2026-09-18-ilan-kategori-envanteri.md).
    Test paketi çalıştırılmadı; `npm run build` ve `git diff --check` geçti.
    Değişiklikler canlıya dağıtılmadı.
    Ek çapraz kontrol: akaryakıt istasyonu filtresindeki Pompa Sayısı ve Günlük Satış (L)
    mevcut türe özel alanlarla eşleşiyor. Butik otel ve pansiyon filtrelerinde görülen
    oda/yatak/kat/bina yaşı/açık-kapalı alan bilgileri turistik tesis şemasında karşılanıyor;
    düğün salonu ve restoran filtresindeki ısıtma/masa/kişi kapasitesi alanları da karşılandı.
    Eczane-medikal örneğinde m² dışında yeni filtre doğrulanmadı. Bu örneklerde yeni alan
    eklenmedi; rapor kaynaklarla güncellendi.
    Şema bütünlüğü kontrolü, öğrenci yurdu oda/yatak alanlarının yanlış `ogrenci-yurdu`
    tip kimliğine bağlı olduğunu ve forma girmediğini buldu; gerçek katalog kimliği `yurt`
    ile eşleştirildi. Diğer kategori scope kimlikleri ve alan anahtarları da statik
    denetimde doğrulandı. Kuaför/güzellik oda düzeni mevcut alanla; veteriner ve pet shop
    örnek filtreleri ortak m²/ısıtma bilgileriyle karşılanıyor.
    5 Ekim: İlan detayındaki künye finans alanlarını işlem türünden bağımsız gösteriyordu;
    eski kayıtta kalan depozito veya sezon bilgisi satılık ilanda da görünebilirdi. Künye
    artık ilan işlem türünü alıyor, işlemle uyumsuz bilinen alanları hem kendi bölümünden
    hem “Diğer bilgiler” yedeğinden çıkarıyor. Teknik alanlarda işlem koşulları da aynı
    biçimde uygulanıyor; bilinmeyen portal notları korunuyor. Satılık/kiralık karşıt
    kayıt testi eklendi. `npm run test:veri` (41 test), `npm run test:sema` (6 test),
    `npm run build` ve `git diff --check` geçti. Canlıya dağıtılmadı.
    EDM-068 açık; sonraki adım alt tür başına alan envanterindeki kaynak boşluklarını
    tamamlayıp portal önizleme sözleşmesini aynı işlem–alt tür matrisiyle doğrulamak.
  - Kabul: her alt türde yalnız ilgili alanlar görünür; gerekli alanlar sunucuda zorunlu;
    kaydedilen halka açık bilgiler ilan detayında doğru başlık altında eksiksiz görünür.

- [-] **EDM-069 — İlan detay sayfasını ikinci tasarım turunda geliştir.**
  - Bilgi hiyerarşisi, yapışkan iletişim, galeri, künye ve nitelik bölümleri daha rafine
    bir görsel sistem ve ölçülü hareketle yenilenmeli.
  - Hareket içeriği geciktirmemeli; azaltılmış hareket ve JavaScript kapalı yedekleri korunmalı.
  - EDM-068 alan şeması tamamlandıktan sonra başlanmalı; böylece tasarım eksik veri
    modelini gizlemez.
  - 23 Eylül ilerlemesi: uzun ilan detaylarında karar bilgisinin kaybolmaması için dinamik
    bölüm dizini eklendi. Açıklama, video/sanal tur, arsa imar bilgisi, teknik künye,
    olanaklar ve konum yalnız ilgili ilanda doğrudan açılıyor; mobilde yatay kaydırılabilen
    bu dizin, masaüstünde aynı hiyerarşiyle görünür. `npm run test:veri` 38 test, üretim
    derlemesi ve `git diff --check` geçti. Canlıya dağıtım yapılmadı.

- [x] **EDM-070 — `postedm` haber ve bilgi içeriklerini site yayın akışına bağla.**
  - Sosyal medyada onaylanmış haber/rehber içeriği siteye kaynak, tarih ve düzeltme iziyle
    taslak olarak gönderilmeli; panel onayı olmadan yayınlanmamalı.
  - İlan kuyruğundaki GitHub Actions OIDC kimliği yeniden kullanılmalı; yeni kalıcı API
    anahtarı üretilmemeli.
  - İlerleme: `postedm` SQLite `haberler` şeması ve yayın durumları incelendi; 8 yayımlanmış
    kayıt var. Site tarafında `/bulten`, `/sozluk` ve `/rehber/bilgi` alanları yerelde hazır,
    canlıda henüz yok. D1 `site_icerik` taslak şeması ve mevcut GitHub Actions OIDC kimliğiyle
    çalışan `/api/postedm/icerik` alım ucu eklendi. Dış sistem yalnız taslak oluşturabiliyor;
    doğrulanabilir HTTPS kaynak zorunlu, hassas konular otomatik hukuki incelemeye düşüyor.
    Dört sözleşme testi geçti.
  - 23 Eylül ilerlemesi: yönetim paneline **İçerikler** ekranı eklendi. Taslak metin,
    kaynak bağlantıları ve güncelleme zamanı panelden görülebiliyor; yayın alma ve taslağa
    geri çekme işlemleri işlem geçmişine yazılıyor. Kaynaksız kayıt hiç yayınlanamıyor;
    hukuk/tapu/kredi/imar/kira gibi hassas içerikte açık inceleme onayı zorunlu. Onaylanan
    bülten D1'den herkese açık `/bulten` listesine ve detay sayfasına düşüyor; kaynaklar
    yazı altında atıf olarak görünür.
  - Tamamlandı: postEDM'in başarılı haber sosyal paylaşımı, GitHub Actions OIDC kimliğiyle
    siteye otomatik olarak yalnız taslak bırakıyor. Yeni kalıcı API anahtarı yok; `yayinla.yml`
    işine `id-token: write` verildi ve sitenin doğrulayıcısı yalnız ana daldaki kuyruk veya
    yayın işini kabul ediyor. İlanlar ve reels bu akışa giremez.
  - Doğrulama: site paketinde 75 test, üretim derlemesi ve `git diff --check`; postEDM'de
    Python derleme ile taslak sözleşmesi ve yayın kuyruğu için 13 hedefli test geçti. Canlıya
    dağıtım veya gerçek sosyal/site gönderimi yapılmadı:
    [2026-09-18-postedm-site-yayin-mimarisi.md](./raporlar/2026-09-18-postedm-site-yayin-mimarisi.md)
  - Kabul: onaylanan içerik tek işlemle sosyal platformlar ve site taslağına gider; hukuk,
    vergi, kredi ve imar içeriği kaynak/onay olmadan canlıya çıkmaz.

- [-] **EDM-072 — Bilgi Merkezi içeriklerini editoryal ve hukuki doğruluk taramasından geçir.**
  - Yereldeki Bülten, Sözlük ve Bilmeniz Gerekenler metinlerinde kesin hukuk dili,
    güncellik, kaynak tarihi ve EDM'nin hukuk bürosu gibi algılanması riski denetlenmeli.
  - 23 Eylül ilerlemesi: tüm statik bülten ve "Mutlaka Bilmeniz Gerekenler" kayıtlarına
    HTTPS birincil kaynak, `guncellemeTarihi` ve okuyucuya gösterilen kapsam notu eklendi;
    bütünlük testi bu üç alan olmadan geçmiyor. **Düzeltme:** kaynak bağlantısı ve tarih
    bulunması iddiaların tek tek doğrulandığı anlamına gelmiyor; önceki "19 kaynaklı terim
    yayımlanıyor" ifadesi editoryal onay olarak okunmamalı. Tapu harcı metnindeki güncel olmayan
    `%25–%100` ceza ifadesi kaldırıldı; Gelir İdaresi'nin gerçek bedel, eksik harç ve bir
    kat vergi ziyaı cezası açıklamasına göre daraltıldı. O aşamada sözlükte kira çarpanı
    dışında 19 terim görünüyordu. 75 site testi, üretim derlemesi ve `git diff --check` geçti.
  - 24 Eylül ilerlemesi: statik içerikte **varsayılan yayın kapalı** kuralı getirildi.
    Gelir İdaresi tapu harcı açıklaması ve Adalet Bakanlığı TBK 347–348 metniyle
    karşılaştırılan 2 bülten; TBK ile karşılaştırılan 1 rehber; TKGM kat irtifakı/kat
    mülkiyeti genelgesi ve TBK 352 ile karşılaştırılan 3 sözlük terimi açık. Diğer 3 bülten,
    3 rehber ve 17 sözlük terimi kaynak bulunmasıyla yetinilmeyip iddiaları satır
    satır doğrulanana kadar yayın listesinden çıkarıldı. Bu içerikler aramada, detay
    rotasında ve statik bülten site haritasında görünmüyor; taslak veri korunuyor.
    On yıllık kira uzaması metnindeki "noter zorunlu" ve otomatik tahliye izlenimi
    düzeltilip yazılı bildirim, süre hesabı ve ispat ayrıldı. Kat mülkiyetinin bütün
    imar/yapı kusurlarını giderdiği ve bankanın otomatik avantaj sağladığı iddiaları
    kaldırıldı; tahliye taahhüdünün de otomatik tahliye sağlamadığı ve bir aylık başvuru
    süresi belirtildi. `guncellemeTarihi` arayüzde yalnız "Son güncelleme" olarak gösteriliyor;
    bu alan tek başına hukukî doğrulama iddiası taşımıyor. Kentsel dönüşüm, imar ve
    kalan sözlük metinlerinin iddia bazlı incelemesi sürüyor. Tam site paketi 75 testten
    geçti; son sözlük ekinden sonra hedefli Bilgi Merkezi testi ve üretim derlemesi tekrar
    geçti, `git diff --check` temiz. Yerel geliştirme sunucusu hazır olamadan kapandığı
    için HTTP/tarayıcı kabulü bu aşamada ölçülemedi; canlıya dağıtım yapılmadı.
  - 24 Eylül devamı: Kentsel Dönüşüm Başkanlığının 6306 sayılı Kanun md. 6/1 metniyle
    riskli yapıdaki çoğunluk kararı ve arsa payı satışını anlatan bülten ile rehber
    karşılaştırıldı. Çoğunluğun malik sayısı yerine hisse oranıyla hesaplanması, teklif
    için bildirimden sonraki 15 günün genel bir itiraz süresi olmaması, riskli yapıda
    ilk satış gerçekleşmeyince payın otomatik olarak Hazineye geçmemesi ve ipotek gibi
    hakların satış bedeli üzerinde sürebilmesi açıkça işlendi. Yalnız kanunla doğrulanan
    anlatımda yönetmelik 15/A dayanak gösterimi çıkarıldı. Bu iki içerik yerel yayın
    listesine alındı: şimdi 3 statik bülten, 2 rehber ve 3 sözlük terimi açık;
    2 bülten, 2 rehber ve 17 terim iddia bazlı inceleme bekliyor.
    Rehber girişindeki eski "12 konu" vaadi de gerçek yayın kapsamına uyarlandı.
    Tam site test paketi, üretim derlemesi ve `git diff --check` geçti; canlıya dağıtım
    yapılmadı. Yerel Astro sunucusu yine "Dev server process exited before becoming ready"
    hatasıyla açılmadı; HTTP/tarayıcı kabulü bekliyor.
    [Kentsel dönüşüm kaynak karşılaştırması](./raporlar/2026-09-24-kentsel-donusum-icerik-denetimi.md).
  - Kabul: her maddede birincil kaynak, güncelleme tarihi ve uygun kapsam notu bulunur;
    doğrulanmayan içerik yayına alınmaz.

- [!] **EDM-071 — Search Console alan adı mülkünü doğrula ve başlangıç raporunu al.**
  - Kullanıcı Search Console'da `edmyapigayrimenkul.com` alan adı mülkünü oluşturup verilen
    TXT doğrulama değerini paylaşmalı; DNS kaydı Cloudflare'a eklenecek.
  - Doğrulama sonrası mevcut `/sitemap.xml` gönderilecek ve ilk veri oluşunca EDM-042
    raporu çıkarılacak.

- [x] **EDM-073 — `postedm` görsellerinde taşma, örtülme ve bozuk karakteri kökten önle.**
  - #243 sözlük kartında tanımın son satırları alttaki kutunun arkasında kalmıştı.
  - Kabul: hiçbir biçimde metin taşmaz, örtülmez, kırpılmaz; fontta olmayan karakter basılmaz.
  - Tamamlandı: 2026-09-25 — `scripts/gorsel_denetim.py` CI adımı (164 vaka: taşma, çakışma,
    örtülme, kırpılma, fontta olmayan glif, yüzen işaret). Sığmayan metin kırpılmaz, üretim
    `TasmaHatasi` ile durur; gövde fontu IBM Plex Sans; çizim girişleri emoji/görünmez
    karakterden süzülmüş kopyayla çalışır; kanca cümle kesmez; konuya uygun kapak fotoğrafı.
    Commit'ler `6243ae6` `fc6217f` `0a8d51e` `8346378`. Ayrıntı: `postedm/MEMORY.md` §9.1.

- [x] **EDM-074 — Sosyal videolara ElevenLabs seslendirmesi ekle (isteğe bağlı).**
  - Kullanıcı üç versiyonu dinleyip "yalnız kapak" seçti; sesi (Sıla Özalp) ve hızlı-enerjik
    ayarı örneklerden seçti; kapanış çağrısı "…istemiyorsanız takipte kalın".
  - Kabul: düz "✅ Yayınla" eskisi gibi seslendirmesiz; "🎙️ Sesli Yayınla" → fon müzikli /
    müziksiz; başlıklar okunmaz; sayı/kısaltma okunuşu doğru.
  - Tamamlandı: 2026-09-26 — `src/ses.py`, `src/okunus.py` (Türkçe okunuş: "Hz." Hazreti,
    "1/5000" beş binde bir; kısaltmalar ölçümle olduğu gibi bırakıldı), `config.yaml ›
    seslendirme`. Seslendirilmiş video yüklemede yeniden karıştırılmaz. GitHub secret
    `ELEVENLABS_API_KEY` kullanıcı tarafından eklendi. Aynı özellik Instabot'a taşındı
    (`haber-bot` `d40da76`). Commit'ler `51071a4` `74e1b84` `7bcda6c`. Ayrıntı: §9.3.

- [x] **EDM-075 — Haber önerisini Instabot'un öneri taslağına çevir.**
  - Kabul: günde iki tur, tek mesajda numaralı başlıklar, çoklu seçim, inceleme, tarih.
  - Tamamlandı: 2026-09-26 — `haber-oneri.yml` 09:17 ve 18:17 TR; en fazla beş haber;
    seçim Worker'da, "▶️ Hazırla (n)" seçilenleri sırayla içeriğe çevirir; 🔍 / `/incele_ID`
    ham haberde haber ayrıntısını getirir. Commit `74e1b84`. Ayrıntı: §9.4.

- [x] **EDM-076 — "30 dk / 1–4 saat sonra yayınla" düğmelerini gerçekten planlı yap.**
  - Gecikme GitHub'a hiç iletilmiyordu: mesaj "planlandı" deyip içeriği hemen yayınlıyordu.
  - Tamamlandı: 2026-09-26 — Worker planı Cloudflare KV'ye (`EDM_PLANLAR`) yazar; 10
    dakikalık cron vakti geleni yayınlar; "⏹ Planı iptal et"; 3 saatten geç plan yapılmaz.
    `haberler.planlanan_yayin` ile hatırlatıcı plan bekleyen içeriği atlar. Worker sürümü
    `a21121a4`; commit `75427e4`. Ayrıntı: §9.5.

- [x] **EDM-077 — Fon müziğinin kaynağını ve lisansını belgele.**
  - `postedm/assets/audio/1_emlak_haber_fonu.mp3` Instabot'un `haber_fon.mp3`'üyle aynı dosya;
    16 Eylül'de "telifsiz" notuyla eklenmiş ama kaynak/lisans hiçbir yerde kayıtlı değil.
  - Tamamlandı (karar): 2026-09-26 — kullanıcı müziğin KALMASINA karar verdi; kaynak
    bilinmiyor, Meta/YouTube telif riski anlatıldı ve kabul edildi. Değiştirilmeyecek.

## Ürün ve içerik kararları için kısa rehber

- En yüksek öncelik, ziyaretçiden gelen talebin kaybolmaması ve yanlış başarı
  gösterilmemesidir.
- İkinci öncelik, işlem türü, fiyat, alan ve mülk niteliğinin doğru sunulmasıdır.
- Arazi, portföyün yarısını oluşturduğu için arsa/tarla bilgi modeli ve yerel rehberler
  markanın ana büyüme alanıdır.
- “Görüntülendi”, “tıklandı”, “talep geldi”, “randevu oldu” ve “işlem kapandı” aynı
  şey değildir; raporlarda ayrı tutulur.
- Portföy rakamları piyasanın tamamı veya gerçekleşmiş satış verisi gibi sunulmaz.
- Kullanım hakkı olmayan görseller kopyalanmaz ve filigranları kaldırılmaz.
- Doğrulanmayan imar, tapu, satış veya yatırım getirisi iddiası yayımlanmaz.
- Yeni özellikten önce mevcut akışın güvenilirliği, erişilebilirliği ve ölçülebilirliği
  tamamlanır.

## Her işte asgari doğrulama

1. İlgili kod ve komşu akışlar gözden geçirilir.
2. `site/` içinde `npm run build` çalıştırılır.
3. Değişikliğe göre masaüstü ve 390 px mobil görünüm kontrol edilir.
4. Form/API değişikliği varsa başarı, doğrulama hatası ve sunucu/ağ hatası ayrı denenir.
5. ClientRouter ile başka sayfadan gelindiğinde özellik yeniden çalışıyor mu kontrol edilir.
6. Dağıtım yapıldıysa canlı URL ve HTTP durumu yeniden doğrulanır.
7. Bu dosyadaki görev durumu ve çalışma günlüğü güncellenir.

## İşletmeden beklenebilecek girdiler

- Danışman portreleri ve gerçek ofis/çalışma fotoğrafları.
- Yayımlanması uygun yetki belgesi ve doğrulanabilir şirket bilgileri.
- KVKK aydınlatma metni için veri sorumlusu ve gerçek veri işleme/aktarım bilgileri.
- Örnek değerleme raporu, kullanılan veri kaynakları ve gerçek teslim süresi.
- İzinli/anonim müşteri başarı örnekleri.
- Çelişkili veya mükerrer görünen ilanlar için işletme teyidi.
- Search Console, Google Places ve Cloudflare ayarlarının gerektiğinde salt okunur
  doğrulanması.

## Bilinen inceleme sınırları

- İlk denetimde canlıya test müşteri formu gönderilmedi.
- Yönetim panelinde veri değiştiren işlemler denenmedi.
- Search Console, reklam, analitik ve gerçek kullanıcı performans verileri görülmedi.
- E-posta teslim kayıtları görülmedi; Google yorumlarının üretim anahtarı ve canlı sunumu
  doğrulandı.
- Cloudflare D1 Time Travel doğrulandı; uzun süreli R2 arşivi, R2 silme koruması ve HTML
  cache kuralları henüz doğrulanmadı.
- Güvenlik bölümü tam sızma testi, gizlilik bölümü hukuki uygunluk görüşü değildir.

## Çalışma günlüğü

### 18 Eylül 2026

- İşletme tarafından verilen altı kayıt/mesleki yeterlilik numarası merkezi kurumsal
  veriye alındı; Hakkımızda görünümü ve yapılandırılmış veri tek kaynağa bağlandı.
- Google Places üretim anahtarı, doğru işletme eşleşmesi, D1 puan/yorum kayıtları ve
  canlı ana sayfa gösterimi doğrulandı; EDM-030 tamamlandı.
- KVKK için gerçek veri akışı çıkarıldı. Canlı aydınlatma metni için tam veri sorumlusu
  unvanı, saklama kararı ve erişim listesi kaldı; aydınlatma ve olası açık rıza ayrı
  uygulanacak.
- Cloudflare D1 Time Travel'ın canlı veritabanında çalıştığı salt okunur yer imi sorgusuyla
  doğrulandı. Uzun süreli arşiv ve test ortamı geri yükleme tatbikatı açık bırakıldı.
- İlan sistemi 6 grup, 45 alt tür, grup başına 21–41 teknik alan ve toplam 225 nitelik
  olarak sayısallaştırıldı. Alt tür koşullu şema form, sunucu ve ilan detayına bağlandı;
  kamp alanı ile otel alanları ayrıştırılıp tarayıcıda doğrulandı. Kalan şablonlar için
  portal ekran görüntüsü öncelikleri belirlendi.
- `postedm` haber veritabanı ve yayın zinciri incelendi. Sitedeki yerel Bülten/Sözlük/Rehber
  alanları için OIDC tabanlı D1 taslak yayın mimarisi yazıldı ve taslak alım API'si kodlandı.
  Kaynaksız içerik reddediliyor, hassas içerik otomatik incelemeye düşüyor ve `postedm`
  canlı yayın yetkisi alamıyor. Mevcut hukuki içerikler doğruluk taraması bitmeden canlıya
  alınmayacak. Tam test paketi 65 testle geçti; üretim derlemesi tamamlandı.

### 19 Eylül 2026

- Paylaşılan 22 Sahibinden ekranı EDM-068 kapsamında işlendi. İşlem–mülk türü ilişkisi
  alt tür seviyesine indirildi; kat karşılığı arsa, devren daire/villa ve 83 türden oluşan
  devren iş yeri kataloğu form ile sunucu doğrulamasında aynı kuralları kullanıyor.
- Restoran/lokanta kapasitesi, komple bina zorunlu yapı alanları ve otel yapı/yıldız/oda
  alanları eklendi. Arsa, iş yeri, bina ve turistik tesis nitelik katalogları ekranlardaki
  gruplarla genişletildi. Toplam kapsam 137 alt tür, 189 teknik alan ve 320 niteliğe çıktı.
- Yerel tarayıcı kabulünde kat karşılığı fiyat davranışı, devren konut ve iş yeri
  seçenekleri, restoran, otel, arsa ve bina koşullu alanları doğrulandı; konsol hatası
  görülmedi. O tarihte toplam 69 test, üretim derlemesi ve `git diff --check` geçti.
  Değişiklikler canlıya dağıtılmadı; EDM-068, diğer alt türlerin portal ekranları
  henüz karşılaştırılmadığı için açık bırakıldı.

### 23 Eylül 2026

- Açık Sahibinden sayfalarıyla yapılan kaynak taraması EDM-068 için yeni referans
  notuna işlendi. Proje, ticari ve bina alanları artık hesap erişimi olmayan bir
  araştırmayla da ilerletilebilir; ekran görüntüsü yalnız portalın gizli/zorunlu
  alanlarını son kez karşılaştırmak için isteğe bağlı bir kontrol aracıdır.
- Konut projesi şeması blok, konut/ticari ünite, satış durumu, teslim durumu/tarihi,
  plan seçimi ve satış ofisine genişletildi. İş yerinde dükkan, yiyecek–içecek,
  lojistik/üretim gibi farklı aileler gereksiz teknik alanları birbirinden ayırıyor.
  Akaryakıt istasyonu pompa sayısı ile apart otel apart adedi de tür bazında
  zorunlu hale getirildi. Kapsam 137 alt tür, 199 teknik alan ve 332 nitelik oldu.
  Yeni proje ve tesis doğrulama testleri dahil toplam 68 test ile üretim derlemesi
  geçti. Canlıya dağıtım yapılmadı.
- Portal önizleme sözlüğü de alt türle daraltıldı: ilgili olmayan teknik alanlar
  artık aktarım ekranında gösterilmiyor. Otel/kamp alanı karşıt örneğiyle birim test
  eklendi; böylece form, kayıt, detay ve portal önizlemesi aynı alt tür kuralını izliyor.
- EDM-069 için ilan detayının karar özeti güçlendirildi. İlk görünür bilgi şeridi artık
  alan ve oda düzenine ek olarak uygun olduğunda kredi, ısıtma, tapu, proje satış/teslim,
  apart, pompa ve kamp kapasitesi bilgisini gösteriyor. 393 × 852 mobil kabulünde galeri,
  sabit ara/WhatsApp çubuğu ve özet şeridi; masaüstünde başlık, fiyat ve galeri hiyerarşisi
  kontrol edildi. Başlık, fiyat ve galeri için yalnız hareket azaltma tercihi kapalıyken
  çalışan kısa giriş hareketi eklendi. `npm run test:veri` (37 test), `npm run build` ve
  `git diff --check` geçti; canlıya dağıtım yapılmadı.
- EDM-068 ayrıntı kabulü de otomatikleştirildi: 137 alt türün her biri için halka açık
  teknik alanların detay künyesinde göründüğünü tarayan sözleşme testi eklendi. Böylece
  şemaya yeni bir alan eklenip ilan görüntüleme sayfasından düşmesi önleniyor. `npm run
  test:veri` 38 testle geçti.
- EDM-070'nin panel ve okuma katmanı tamamlandı. postEDM'in OIDC/anahtarlı taslak ucu,
  D1 taslak tablosu ve yeni yönetim ekranı birlikte çalışıyor; yayın kararı yalnız
  panelde verilebiliyor. Onaylı bültenler kaynak atfıyla `/bulten` ve `/bulten/[slug]`
  üzerinde dinamik gösteriliyor. `npm run test` 74 testle, `npm run build` ve
  `git diff --check` geçti. Wrangler günlük dosyası sandbox dışında olduğu için EPERM
  uyarısı verdi, fakat üretim derlemesi başarıyla tamamlandı. Canlıya dağıtım yapılmadı.
- EDM-070'nin gönderim katmanı da tamamlandı. postEDM'in `yayinla.yml` işi başarılı haber
  sosyal paylaşımından sonra OIDC ile siteye yalnız taslak bırakıyor; panel onayı olmadan
  içerik görünmüyor. Reels ve ilanlar bilinçli olarak bu akış dışında. Riskli kelime yalnız
  metin gövdesinde bulunsa dahi hukuki/ticari inceleme gerekiyor. Site test paketi 75 teste
  çıktı; postEDM tarafında derleme ve 13 hedefli test geçti. Canlı dağıtım ve dış platform
  çağrısı yapılmadı.

### 25–26 Eylül 2026 (Claude — `postedm` ve Instabot)

- Tasarım denetimi (EDM-073): sözlük #243 taşması kökten çözüldü; `gorsel_denetim.py`
  164 vakada 0 hata. Denetime fontta olmayan glif ve yüzen işaret kontrolleri eklendi;
  ilk çalıştırmada 267 bulgu vardı.
- CI'daki "Testler data/edm.db'yi değiştirmedi" adımı üç commit kırmızıydı: dört test dosyası
  ve `metin_butcesi.py` test modunu açmadan gerçek DB'ye yazıyordu (yayınlanmış bir
  onay kaydını "silindi" yapıyordu). `tests/test_test_izolasyonu.py` artık bunu zorlar.
- Seslendirme (EDM-074): Sıla Özalp, yalnız kapak, isteğe bağlı "🎙️ Sesli Yayınla".
  Canlı "seslendir → yazıya dök" ölçümleri okunuş kurallarını belirledi.
- Haber önerisi Instabot biçimine geçti (EDM-075); planlı yayın gerçekten planlanıyor
  (EDM-076). Cloudflare Worker `a21121a4` dağıtıldı; `*/10` cron doğrulandı.
- Instabot'a aynı seslendirme taşındı (`haber-bot` `d40da76`, Worker `6a9b5d67`).
- Kullanıcı kararları (26 Eyl, sonra): fon müziği kalıyor (EDM-077); Instabot'ta 10'lu
  gündem turu otomatik tetiklenmiyor (30 Ağustos'tan beri), elle tetiklenen turda yalnızca
  başlıklar okunuyor; "A Milli Takım"daki aceleci "A" ve "F-16" tırnaklı harfle düzeldi
  (ölçüldü; `<break>` etiketi ses uydurma kelime eklediği için yasak).

### 10 Eylül 2026

- Canlı site, kaynak kodu, Git geçmişi, HTTP yanıtları ve 390 × 844 mobil görünüm
  incelendi.
- Site haritasındaki 64 URL salt okunur olarak kontrol edildi; tamamı HTTP 200 döndü.
- Ana iş listesi EDM-001–EDM-058 olarak oluşturuldu.
- EDM-001 tamamlandı. `npm run build` ve `git diff --check` geçti; yerel Worker üzerinde
  başarılı kayıt, bağlantı kesintisinde veri koruma ve yeniden denemenin başarıya dönmesi
  tarayıcıyla doğrulandı. Değişiklik henüz canlıya yayımlanmadı.
- EDM-059 yeniden açıldı. Önceki “tamamlandı” kaydı geri çekildi; mevcut üç ekranın
  bilgi mimarisi, kategori mantığı, doğrulaması, tasarımı ve kod tekrarları kapsamlı
  yeniden yapım için yetersiz bulundu. Yeni kabul ölçütleri görevin altına yazıldı.

### 11 Eylül 2026

- EDM-059 tamamlandı. İlan ekleme ve düzenleme ekranları tek şema ve tek form bileşeninde
  birleştirildi. Konut, arsa, iş yeri, komple bina, turistik tesis ve proje için ayrı
  alt türler, teknik alanlar, donanım grupları ve geçerli işlem birleşimleri kuruldu.
- Form; yedi bölümlü akış, yayın hazırlığı ve doluluk göstergesi, kategoriye göre fiyat
  etiketi, alan ve hata özeti, cihaz taslağı, yayın kontrol listesi, medya/portal alanları,
  EİDS-yetki dosyası ve imar kaynağı/tarihi doğrulamasına kavuştu. Kategori dışı alanlar
  hem tarayıcıda devre dışı bırakılıyor hem sunucuda yok sayılıyor.
- İlan detay sayfası fiyat ve karar bilgileri, galeri, doğrulanmış arsa bilgileri,
  gruplu teknik künye, nitelikler, yaklaşık konum, kaynak şeffaflığı, danışman, iletişim
  ve benzer ilanlar sırasıyla yeniden tasarlandı. Para birimi ve altı işlem türü kart,
  detay, panel listesi ve paylaşım akışında ortaklaştırıldı.
- Portal ilanlarının kaynak satırı temiz tutuluyor; panel başlık, açıklama, fiyat, kategori,
  konum, özellik ve donanım kararları ayrı `temel` geçersiz kılmasında saklanıyor ve
  senkron sonrasında korunuyor. “Portal verisine dön” içerik geçersiz kılmalarını kaldırıp
  öne çıkarma/gizleme kararlarını koruyor. Elle eklenen ilanlar senkron pasifleştirmesinden
  muaf kalıyor. Eski portal m², oda, alt tür ve teknik seçenekleri yeni forma uyarlanıyor.
- Altı kategori için ekleme (302) → düzenleme (200) → herkese açık detay (200) zinciri;
  altı olumlu ve beş olumsuz sunucu doğrulama senaryosu; kategori geçişi, taslak geri
  yükleme, istemci hata özeti, portal geçersiz kılma/kaynağa dönüş ve ham kaynak verisinin
  değişmemesi yerel ortamda doğrulandı. Test kayıtları temizlendi.
- Masaüstünde 1280 px ve mobilde tam 390 × 844 ölçüm yapıldı; yatay taşma ve yinelenen
  HTML kimliği kalmadı. `git diff --check` ve `npm run build` geçti. Wrangler yalnızca
  sandbox dışındaki günlük dosyasına yazamadığı için EPERM uyarısı verdi; derleme 0 koduyla
  tamamlandı. Canlıya dağıtım yapılmadı. Sonraki geliştirmede D1 şema geçişi panelin
  ilk isteğine de bağlandı; ayrıca elle SQL çalıştırma zorunluluğu kaldırıldı.
- Yerel tarayıcıda ek kullanıcı kabul testi yapıldı: boş form yedi alan hatasını gösterip
  ilk alana odaklandı; kategori ve işlem geçişleri, gizli alanların devre dışı kalması ve
  taslak geri yükleme geçti. Devren kiralık iş yeri oluşturuldu, EUR fiyatla düzenlendi ve
  herkese açık detayda doğru işlem, fiyat, 185 m², beş fotoğraf ve JSON-LD ile görüntülendi.
  Mevcut portal ilanının eski m²/tür/seçenek uyarlamaları doğrulandı. Geçici kayıt ve taslak
  temizlendi; yerel D1 sorgusunda kalan kayıt sayısı `0` oldu.
- EDM-060 tamamlandı. Portalın aktif/pasif kaydı, yöneticinin kalıcı yayın kararı ve elle
  girilen ilanın durumu birbirinden ayrıldı. İlan takip tarihi/notu günlük özet e-postasına;
  senkronda pasife düşen portal ilanı tekil, tekrar göndermeyen WhatsApp kuyruğuna bağlandı.
  Panel otomasyon ayarlarının hazır/eksik durumunu ve bekleyen bildirim sayısını gösteriyor.
- EDM-061 uygulandı. Konut ve turistik tesise sezonluk kiralama, başlangıç/bitiş, minimum
  hafta ve dahil giderler eklendi; tarih ve süre çelişkileri istemci ile sunucuda engellendi.
  Fiyat alanı yazarken binlik nokta ekliyor ve tutarı para birimiyle Türkçe okuyor. Görsel
  alanı çoklu seçim, önizleme, tarayıcıda WebP küçültme, 50 fotoğraf sınırı ve R2 yükleme
  akışına dönüştürüldü; ham URL alanı gelişmiş seçeneğe taşındı. 14 Eylül’de gerçek
  tarayıcı yüklemesinde 2400×1600 JPEG, 1800×1200 ve 4.426 bayt WebP olarak R2/D1’e
  kaydedilip geri okundu. 49+2 sınır testinde 50’nci kabul edildi, 51’inci doğru mesajla
  atlandı; fotoğraf kuralları istemci ve API için tek ortak sabite bağlandı.
- EDM-054 ve EDM-062 tamamlandı. Yönetim formu ve ilan listesi sosyal platform seçimini D1
  kuyruğuna yazıyor; panel son 20 işin durum/hata ayrıntısını gösteriyor. Anahtarlı site API'si
  işi atomik alıyor, ilanı yayından önce tekrar denetliyor ve yönetim iç alanlarını dışarı
  çıkarmıyor. `postedm` güncel kaydı SQLite'a geçirip kartları yeniden çiziyor; her platformu
  bağımsız ele alıp sonucu siteye geri yazıyor. Yerel ortak API anahtarı oluşturuldu; üretim
  Worker/GitHub secret'ları ve WhatsApp/Facebook erişim anahtarları henüz kurulmadı.
- Site derlemesi tamamlandı; Wrangler'ın sandbox dışındaki günlük dosyasına yazamama uyarısı
  sonucu etkilemedi. Beş D1 şema grubu, görünürlük, bildirim tekilleştirme ve atomik kuyruk
  SQLite üzerinde geçti. `postedm` için 36 ağsız test, Python derleme, GitHub Actions YAML
  ayrıştırması ve iki depoda `git diff --check` geçti. Gerçek sosyal yayın ve WhatsApp mesajı
  gönderilmedi. Yeni panel değişikliklerinin tarayıcı kabul testi otomatik kullanım limiti
  tarafından reddedildi; kod/SQL testleriyle devam edildi.
- EDM-063 eklendi. İkinci admin tam e-posta kimliğiyle Cloudflare Access politikasına
  eklenebilir. Telefonla doğrudan giriş için paneli Access dışına çıkarmak yerine telefon
  doğrulayan OIDC/SAML sağlayıcısının ikinci kimlik sağlayıcı olması kararlaştırıldı; admin
  kimlik bilgileri ve sağlayıcı seçimi bekleniyor. `PANEL_ADMIN_EPOSTALARI` ile aynı tam
  adres listesi Access politikasında ve Worker'ın ek izin kontrolünde kullanılacak biçimde
  kurulum betiğine bağlandı.
- Doğukan Özdoğan ana admin, Metin Özdoğan ikinci admin olarak e-posta izin listesine
  işlendi. Verilen cep telefonları kaynak koduna veya izlenen yapılandırmaya yazılmadı;
  yalnızca ileride bağlanacak telefon doğrulama sağlayıcısında kullanılacak.
- İki adminin tam e-posta Access politikası ve Worker izin listesi canlıya dağıtıldı
  (`90659051-d3e2-4661-b6d2-461ae1d057c2`). Panelde Doğukan “Ana admin”, Metin “Admin”
  olarak gösteriliyor. Girişsiz `/yonetim` isteğinin Access giriş
  sayfasına HTTP 302 ile yönlendiği doğrulandı. Gerçek hesaplarla OTP oturumu açılmadı.
- Ana admin rolü kullanıcı düzeltmesiyle Doğukan Özdoğan'a geçirildi. Talep ve sistem
  bildirimlerinin alıcısı değiştirilmedi; `ozdogandogukan@gmail.com` olarak kaldı.
- EDM-002 ve EDM-003 tamamlandı. Değerleme formu başarısız API yanıtında veriyi koruyup
  yeniden deneme ve WhatsApp yedeği gösteriyor. Ortak sunucu doğrulaması telefonları E.164
  biçimine getiriyor ve talep türüne ait zorunlu/izinli alanları denetliyor. Yedi birim testi;
  yerel Worker'da iki `400`, başarılı `200`, normalize telefonla tekrar engeli ve D1 alanları
  doğrulandı; geçici kayıt silindi.
- EDM-004 tamamlandı. Cloudflare Rate Limiting bağlamalarıyla IP başına 6/dakika, genel
  30/dakika sınırı eklendi. Yerel testte 7–9. istekler `429` ve `Retry-After: 60` aldı.
- Sosyal otomasyon için Worker'a `POSTEDM_API_ANAHTARI` ve `POSTEDM_GITHUB_JETONU`
  secret'ları kuruldu. `migrations/0002-ilan-isletim.sql` canlı D1'e uygulandı ve sosyal
  kuyruk boş doğrulandı; hiçbir iş sahiplenilmedi veya paylaşım yapılmadı. GitHub Actions
  secret yazımı mevcut PAT yetkisiz olduğu için `403` aldı; resmi GitHub cihaz girişi geniş
  kapsam nedeniyle otomatik onay denetimince durduruldu.
- Telefonla SMS OTP girişi, mesaj başına ücret ve ek gönderici maliyeti nedeniyle kullanıcı
  kararıyla kapsamdan çıkarıldı. İki admin Cloudflare Access e-posta koduyla giriş yapacak.
- Rol düzeltmesi canlı Worker sürümü `5fd0ecb1-be71-40b1-a818-1c96002dea72` ile dağıtıldı.

### 12 Eylül 2026

- EDM-005 tamamlandı. `19673570` ve `19797428` Emlakjet'te aynı taşınmazın satılık ve
  kiralık seçenekleri olarak doğrulandı. Kaynaktaki “kiralık” yazan satılık ilan ile iki
  kayıtta biriken çelişkili üretilmiş metin, doğrulanmış özelliklerden kurulan kısa ve
  işlemle tutarlı başlık/açıklamalarla düzeltildi. Detay sayfası iki seçeneği birbirine
  bağlayıp ayrı fiyat ve ilan numarasını açıkça gösteriyor.
- EDM-006 tamamlandı. `19290394` ile `19303282` fotoğraflarına piksel ve algısal benzerlik
  karşılaştırması yapıldı; ikinci kaydın dört fotoğrafı aynı 1134 ada / 51 parselin ana
  kayıttaki fotoğraflarıyla eşleşti. Hiçbir veri silinmeden `19290394` ana kayıt yapıldı;
  mükerrer kayıt kamu listesinden çıkarılıp eski bağlantısı 301'e bağlandı. Ana kayıt
  kaybolursa portföyün kaybolmaması için eski kayıt otomatik görünür kalır.
- Veri bütünlüğü kurallarına üç regresyon testi eklendi. Toplam 10 birim testi,
  `git diff --check` ve Astro üretim derlemesi geçti; Wrangler'ın sandbox dışı günlük
  uyarısı derleme sonucunu etkilemedi.
- EDM-005/006 düzeltmeleri canlı Worker sürümü
  `161919f4-a467-4fc9-9063-d74379f45e70` ile dağıtıldı. Canlıda iki Araptepe sayfası
  HTTP 200, eski `19303282` adresi ana `19290394` kaydına HTTP 301 döndü. Kamu ilan
  listesinde ana kayıt bulunuyor ve mükerrer numara görünmüyor.
- EDM-007 ve EDM-008 tamamlandı. Bölge fiyat özetleri işlem türü, mülk grubu ve para
  birimine ayrıldı. Silivri'de satılık konut 2.175.000–35.000.000 ₺, kiralık konut
  20.000–165.000 ₺/ay ve satılık arsa/tarla 580.000–147.935.000 ₺ olarak ayrı satırlarda
  doğrulandı; 2.750.000 € olan arsa ilanı da TL aralığına karıştırılmıyor. Canlı D1
  salt okunur sorgusunda 22 arsa/tarla ve 189.010 m² doğrulandı; ana sayfa 189 dönüm yazıyor.
- Veri bütünlüğü paketi beş teste çıktı; toplam 12 test, `git diff --check`, üretim
  derlemesi ve yerel Worker üzerinden `/`, `/rehber`, `/rehber/istanbul-silivri` HTTP 200
  kontrolleri geçti.
- EDM-007/008 canlı Worker sürümü `ee3741b1-e525-4774-b7c2-4e0f62b64e49` ile dağıtıldı.
  Canlı Silivri fiyat grupları ve 189 dönümlük ana sayfa sayacı HTTP çıktısında doğrulandı.
- EDM-009 tamamlandı. İlan alanları kategoriye göre açık biçimde ayrıldı; kart, detay,
  bölge birim fiyatı, düzenleme formu ve sosyal paylaşım aynı karşılaştırma alanını
  kullanıyor. Konutta net > brüt ve arazide satılan hisse > toplam parsel çelişkileri
  istemciyle sunucuda reddediliyor. Veri paketi 10 teste, toplam test sayısı 17'ye çıktı;
  üretim derlemesi ve `git diff --check` geçti.
- Canlı kontrolde Araptepe villasının kaynakta 463 m² arsa ölçüsünü eski “Brüt
  Metrekare” alanına da kopyaladığı yakalanıp regresyon testiyle düzeltildi. Son Worker
  sürümü `b6d86534-970b-44d8-a664-47a3a834c422` dağıtıldı. Canlı villa sayfasında
  320 m² net yapı ve 463 m² arsa ayrı, birim fiyat “net yapı alanına göre”; tarla
  sayfasında 9.456 m² toplam parsel ve “toplam parsel alanına göre” olarak doğrulandı.

### 13 Eylül 2026

- EDM-010'un içerik taraması tamamlandı. 46 etkin kaynak/45 yayımlanan ilan için kalıcı
  rapor ve yönetim panelinde otomatik kontrol listesi hazırlandı. Güncel D1 sorgusu salt
  okunur yapıldı; fotoğraf sayısı Hepsiemlak, yüklenen ve gizlenen fotoğrafları hesaba katıyor.
  34 uyarısız, 7 teyit bekleyen, 4 çelişkili kayıt var. İşletme doğrulaması EDM-064'te açık.
- Alan ayrımındaki hatalar giderildi: hisseli tapudaki genel m² artık otomatik olarak
  satılan hisse sayılmıyor; belirsiz satış kapsamı için birim fiyat üretilmiyor. Portalın
  eski hesaplanmış m² fiyatı çıkarılıyor. Belirsiz alan toplam istatistiğine geri sızmıyor;
  güncel kapsamı belirli arsa toplamı 185.943 m² (ana sayfada 186 dönüm).
- 1.042 ve 9.456,55 gibi ölçüler formda sırasıyla 1042 ve 9456.55 oluyor; ondalıklar
  kaydetme ve detay sunumunda korunuyor. Bilinen net alan veya hisse varken bilinmeyen
  brüt/toplam parsel zorla istenmiyor. Tam panel kaydından çıkarılan kaynak alanı yeniden
  gelmiyor; eski panel alan adları da kaynak düzeltmelerinden öncelikli.
- Danışman eşleşmesi yerel ve portal kimliklerini birlikte kabul ediyor; düzenleme
  formunda danışman seçimi kaybolmuyor. Yapı alanı bilinmeyen arsa içindeki evin JSON-LD
  verisine arsa ölçüsü floorSize olarak yazılmıyor. Bölge TL birim fiyatına döviz karışmıyor.
- 29 birim testi ve üretim derlemesi geçti. Geliştirme sunucusunda ilan listesi, yeni ilan
  ve düzenleme sayfası HTTP 200; örnek villa formunda net 220, arsa 1042, brüt boş ve
  danışman Metin seçimi HTML'de doğrulandı. Üretim derlemesi yetkisiz panel isteğini 403
  ile reddediyor. Bu turda tarayıcıyla görsel veya dokunma kabul testi yapılmadı.
- Son düzeltmeler canlı Worker sürümü `9534b3ab-f34c-484e-af0e-c017fbbfe5e0` ile
  dağıtıldı. Canlı HTTP kontrollerinde 1.042 m² arsa/220 m² net yapı ayrımı, yapı alanı
  bilinmeyen evde floorSize üretilmemesi, belirsiz hissede birim fiyatın kaldırılması,
  2.119 m² hisse/6.357 m² parsel ayrımı ve `19802542` site bilgisinin Evet olması geçti.
  `18522916` kendi sayfasında kaldı; doğrulanmış eski tarla kaydı `19290394` sayfasına
  yönleniyor. Ana sayfa HTTP 200, girişsiz panel Access'e HTTP 302 veriyor.
- EDM-011 ve EDM-065 tamamlandı. Ana sayfa kart fiyatları teknik mono görünümden çıkarıldı;
  `35 mn ₺` biçimi `35 milyon ₺` olarak açıklaştırıldı. Kullanıcı geri bildirimiyle
  fiyatın önceki sağ alt konumu ve özelliklerin sol konumu korundu. 390 px canlı görünümde
  Plex Sans 18 px/650 ağırlık, kart gövdesinde yatay taşma olmadan doğrulandı.
- Mobil galeri canlıda 360, 390 ve 430 px genişliklerde ölçüldü; beş önizlemenin tamamı
  sırasıyla 302,4; 327,6 ve 361,2 px genişlikte. İkinci görsel 2/15 sayacıyla açıldı,
  ileri düğmesi 3/15'e, sol ok 2/15'e geçti ve Escape katmanı kapattı. Masaüstünde ana
  görsel ve yan ızgara 1.280 px görünümde 576 px yüksekliğe ve aynı alt hizaya geldi.
  29 birim testi, `npm run build` ve `git diff --check` geçti. Wrangler'ın sandbox dışı
  günlük dosyası uyarısı derleme sonucunu etkilemedi. Değişiklikler canlı Worker sürümü
  `83f4f8b9-8ec1-4c1b-a5d8-4277af090294` ile dağıtıldı.
- EDM-012 tamamlandı. İlan detayındaki yerinde görme eylemi ilan kimliğini iletişim
  formuna taşıyor; form başlık, kaynak ve konuyu koruyor. Talep kaydı ve panel satırı
  ilana bağlandı, doğrudan ilanı açma/düzenleme bağlantıları eklendi. Canlı
  `19736595` akışında bağlantı, ön dolu mesaj ve ham HTML'deki üç ilan alanı doğrulandı.
- EDM-013, EDM-014 ve EDM-015 tamamlandı. Mobil filtre paneli, seçili filtre rozetleri,
  tek tek/tümü temizleme; işlem türüne göre bütçe, ilçeye göre mahalle, mülk grubuna
  göre alt tür/alan ve konuta özgü oda filtresi kuruldu. Filtreler URL'de korunuyor.
  Canlı 390 px testinde sayfa taşmadı; Satılık + Konut + Villa + 4+1 + 10–20 milyon ₺
  birleşimi 45 ilan içinden doğru tek kaydı buldu, oda kaldırılınca altı sonuç gösterdi.
- Kullanıcının paylaştığı Sahibinden satılık villa ekranları EDM-066 kapsamında tek tek
  karşılaştırıldı. Uzun ekran büyütülerek ikinci kez tarandı; enerji kimlik belgesi,
  yönetim içi mülk sahibi statüsü ve ilk görünümde okunmayan 20 iç özellik de eklendi.
  Mutfak ve konut kat/plan tipi tek seçimli alanlara çevrildi; İç, Dış, Muhit, Ulaşım,
  Manzara ve Engelli/yaşlı erişimi grupları 149 niteliğe genişletildi. Fotoğraf sınırı
  arayüz ve API'de 50 oldu. Yerel tarayıcıda villa seçimi, `13.500.000`
  biçimi, “on üç milyon beş yüz bin Türk lirası” okunuşu ve altı grubun seçenek sayıları
  doğrulandı. Karşılaştırma ve kalan açıklar `raporlar/2026-09-13-sahibinden-satilik-villa-alan-karsilastirmasi.md`
  dosyasına yazıldı.
- 34 birim testi, üretim derlemesi ve `git diff --check` geçti. İlan bağlamı, mobil
  filtreler, satılık villa alanları ve doğru yaklaşık konum açıklaması canlı Worker
  sürümü `f913f67c-b003-42e6-84b5-d41837fb9d37` ile dağıtıldı. Canlı ilan sayfasında
  harita notu, randevu bağlantısı ve 390 px taşmasız görünüm yeniden doğrulandı;
  dağıtılan ortak fotoğraf paketinde 50 sınırı ve doğru kullanıcı mesajı okundu.
- Açık kalan ana iş: EDM-064 işletme teyitleri.

### 14 Eylül 2026

- EDM-067 tamamlandı. Yeni ilan formunda haritaya tıklama kesin enlem/boylamı ve doğruluk
  kaynağını dolduruyor; kesin pin yalnızca yönetimde ve açık izin verilen portal
  sözleşmesinde kullanılıyor. Halka açık harita, ilan kimliğine göre kararlı biçimde
  360–520 metre uzaklaştırılan 700 metre yarıçaplı yaklaşık alanı gösteriyor. Konumun
  yalnızca tek koordinatı girilirse veya pin olmadan yaklaşık mod seçilirse kayıt reddediliyor.
  Portal kesin konum izin bayrağı da halka açık ilan nesnesinden çıkarılıyor.
- Portal önizlemesi aynı etkin ilanı Sahibinden, Emlakjet ve Hepsiemlak için ayrı alan
  adlarıyla hazırlıyor. Eksik alanlar, açıklama ekine taşınan özel veriler, fotoğraf/video,
  iletişim tercihi ve kesin konum izni ilan bazında görülüyor. `19673570` villasının üç
  portal önizlemesi 27 dolu alan, 10 fotoğraf, 41 satırlık alan sözlüğü, sıfır veri kaybı
  ve “Aktarıma hazır” sonucu ile tarayıcıda doğrulandı.
- Doğrudan video yükleme WebM kabul testiyle uçtan uca çalıştırıldı. Tarayıcı 640×360,
  2,019 saniyelik videoyu okudu, 6.188 bayt WebP poster üretti ve 33.924 bayt videoyu
  yükledi. Tam istek `200`; `bytes=0-99` isteği 100 bayt ve `206 Partial Content` döndürdü.
  181 saniyelik süre `400` ile reddedildi. MediaRecorder WebM dosyalarında ilk metadata
  okumasının `Infinity` verebilmesi yakalanıp güvenli süre çözümü eklendi. Geçici D1 ve
  R2 test kayıtları silinip D1 sayısı sıfır ve nesne yanıtı `404` olarak doğrulandı.
- Canlı D1'e `0003-ilan-video.sql` uygulandı. Toplam 37 test, üretim derlemesi ve
  `git diff --check` geçti. Wrangler'ın kullanıcı günlüğüne ilişkin sandbox uyarısı
  derleme sonucunu etkilemedi.
- EDM-061 ve EDM-067 değişiklikleri canlı Worker sürümü
  `18f53f0b-42c3-4024-9b9c-7b1e68fe5504` ile dağıtıldı. Canlı `/ilanlar` HTTP 200;
  panel HTTP 302 ile Cloudflare Access'e yönleniyor. Dağıtılmış istemci paketinde 50
  fotoğraf sınırı, WebM süre düzeltmesi ve yaklaşık konum metni; canlı D1'de
  `ilan_video` tablosunun on sütunu doğrulandı.
- EDM-062 canlı uçtan uca kuru kabulden geçti. GitHub repository secret yetkisinin `403`
  engeli, sabit sır yerine kısa ömürlü Actions OIDC kimliğiyle kaldırıldı. Worker; GitHub'ın
  RS256 imzasına ek olarak `edmyapigayrimenkul/postedm` değişmez depo/sahip kimliklerini,
  `main` dalını, kuyruk workflow'unu, event'i ve `edm-postedm-site` hedef kitlesini denetliyor.
  postedm `9472a6a` commit'i ana dala gönderildi; Worker
  `8a232481-309d-4b95-aa11-1b57f3592077` sürümüne dağıtıldı. Actions koşusu
  `34860612239` başarıyla bitti; canlı villa 19.900.000 TL ve 15 fotoğrafla yeniden okundu,
  D1'e `kuru` ve `disPlatformCagrisi:false` yazıldı. Geçici iş temizlendi; canlı kuyruk sıfır,
  `/ilanlar` HTTP 200 ve kimliksiz postedm API isteği HTTP 401 olarak doğrulandı.
- EDM-064 için Teyit Merkezi kuruldu. On ilan üzerindeki tapu, alan, kadastro, fiyat kapsamı,
  kullanım/oda planı, mükerrerlik ve fotoğraf konuları 15 ayrı takip kaydına ayrıldı. Durum,
  yanıt, dayanak, iç not, admin ve tarih D1'de denetlenebilir biçimde saklanıyor; boş yanıtla
  ilerleme ve kaynak göstermeden kapatma reddediliyor. Satılık ilan formuna fiyat kapsamı
  alanı eklendi ve kalite kuralları ilgili gerçek alanlar düzeltilmeden uyarıyı koruyor.
- `0004-ilan-teyit.sql` canlı D1'e uygulandı ve sıfır başlangıç kaydı doğrulandı. Teyit
  durumlarını da içeren `raporlar/2026-09-14-ilan-kalite.md` canlı veriden üretildi: 45
  yayımlanan ilanda 34 uyarısız, 7 teyit gerekli, 4 bilgi çelişkili; 15 işletme teyidinin
  tamamı gerçek yanıt bekliyor. Toplam 43 test, üretim derlemesi ve `git diff --check`
  geçti. Son rozet hizalamasıyla Worker `912b3dab-c7c0-4285-b3b3-3d3020d3a0b6`
  sürümüne dağıtıldı; canlı
  `/ilanlar` 200 ve Access korumalı `/yonetim/teyitler` 302 verdi.
- EDM-017 tamamlandı. İletişim sayfasının başlığı ve kanal açıklamaları profesyonelleştirildi;
  telefon/WhatsApp erişim saatleri, pazar randevu durumu ve mesaj yanıt beklentisi tek veri
  kaynağında toplandı ve yönetim panelindeki Ayarlar ekranına taşındı. Aynı beklenti ana
  sayfa, değerleme, iletişim, alt bilgi ve arama motoru çalışma saati verisine uygulandı.
  EDM-032 için kanıt bekleyen “aynı gün”, “gerçekleşmiş satış” ve sabit rapor kapsamı
  vaatleri yayından kaldırıldı. Yerel 500 px mobil ve 1.280 px masaüstü görünümleri taşma
  olmadan doğrulandı; 43 test, üretim derlemesi ve `git diff --check` geçti. Worker
  `73548879-aa12-42d1-9eed-de05a45d8c1f` sürümüne dağıtıldı; canlı iletişim ve değerleme
  sayfaları HTTP 200, Access korumalı Ayarlar ekranı HTTP 302 verdi.
- EDM-018 tamamlandı. Kaydedilen ilanlar tek WhatsApp metninde veya cihazın paylaşım
  penceresinde başlık, tam fiyat ve bağlantılarıyla iletilebiliyor; paylaşım API'si olmayan
  masaüstünde aynı metin panoya kopyalanıyor. İki gerçek villa seçilerek üretilen WhatsApp
  bağlantısında iki başlık, `7.150.000 ₺` ve `35.000.000 ₺` fiyatları ile iki doğrudan URL
  doğrulandı. Dar görünümde eylemler tam genişlikte, kartlardan önce ve taşmasız. Canlı
  doğrulamada eski HTML'in kenarda bir saate kadar kalabildiği görüldü; paneldeki “en geç
  bir dakika” beklentisiyle uyum için HTML kenar önbelleği 60 saniyeye indirildi ve bayat
  içerik sunumu kaldırıldı. Sürümlü statik dosyaların uzun önbelleği korunuyor. Worker
  `a5ffbc80-3543-4c2b-a893-e93c34e8dab5` sürümüne dağıtıldı; sorgusuz canlı Favoriler
  sayfasında yeni veri alanları ve `Cache-Control: public, max-age=60, s-maxage=60`,
  İlanlar ve İletişim sayfalarında HTTP 200 doğrulandı.
- EDM-021 tamamlandı. İletişim ve değerleme formlarında alan ile hata metni ilişkileri,
  `aria-invalid`, canlı gönderim durumu, ilk hataya odak ve başarı kartına odak aktarımı
  eklendi. Yerel tarayıcıda iki form boş gönderildi: iletişimde ad, telefon ve mesaj;
  değerlemede ad, telefon, mülk tipi, ilçe ve onay hataları erişilebilirlik ağacında ilgili
  kontrollerin açıklamasına eklendi, iki akışta da odak ilk hatalı ad alanına taşındı.
  Tam paket çalışmasında ortaya çıkan kararsız OIDC testi de düzeltildi: imzanın son
  Base64URL karakterini değiştiren ve bazı değerlerde aynı baytlara çözülebilen yöntem
  yerine ilk karakteri kesin değiştiren bozuk imza kullanılıyor. OIDC testi beş ardışık
  çalışmada, ardından 43 testin tamamı ve üretim derlemesi geçti. Worker
  `7f94d635-d960-4980-8443-65eabc3bef10` sürümüne dağıtıldı; canlı iletişim ve değerleme
  sayfalarında ilgili `aria-describedby`, canlı durum bölgesi, HTTP 200 ve 60 saniyelik
  HTML önbelleği doğrulandı.
- EDM-022 tamamlandı. İlan sonuç sayısı görünür ve atomik `status` canlı bölgesine
  çevrildi; sonuç ızgarası sayım açıklamasına bağlandı. Erişilebilirlik ağacında toggle
  düğmelerinin seçili/seçili değil durumu tutarlı. Konut filtresi yalnız Space ile
  seçilip kaldırıldı; odak korunurken URL ve sonuçlar 46 → 23 → 46 olarak güncellendi.
  Toplam 43 test, üretim derlemesi ve `git diff --check` geçti. Worker
  `af3e5a5c-0700-416f-b05b-67f2bbcb3f37` sürümüne dağıtıldı. Canlı sayfada 45 ilanın
  23 konut sonucu yalnız Space ile seçildi; odak filtrede kalırken seçili durum, URL ve
  “Toplam 45 ilandan 23 ilan gösteriliyor” canlı açıklaması birlikte doğrulandı.
- EDM-023 tamamlandı. İletişim/değerleme form kontrolleri, ilan filtreleri, mobil menü,
  mobil galeri ve sabit Ara/WhatsApp çubuğu birlikte denetlendi. Odak göstergesi açık ve
  koyu zeminde iki katmanlı hale getirildi; küçük yardımcı metinlerde kullanılan gri
  4,70–5,17:1, koyu kırmızı 5,67–6,24:1 kontrast sağlıyor. Mobil menü gerçek bir modal
  gezinme akışına dönüştürüldü: ilk bağlantıya odak, Tab döngüsü, Escape ile kapatma ve
  tetikleyiciye odak dönüşü var; JavaScript kapalıyken hamburger gizlenip bağlantılar
  normal akışta gösteriliyor. Mobil hedeflerin tamamı en az 44 piksel. Yerel tarayıcıda
  iletişim alanı 47 piksel ve görünür odak halkasıyla; galeri kontrolleri 44×44 piksel,
  ok tuşları ve Escape ile doğrulandı. Toplam 43 test, üretim derlemesi ve kaynak sözleşme
  denetimi geçti. Worker `b63af678-9c51-41e9-9c02-1b6b62c53506` sürümüne dağıtıldı.
  Canlı iletişim alanı da 47 piksel ve iki katmanlı odak halkasıyla doğrulandı; canlı
  15 fotoğraflı galeride 1/15 → 2/15, Escape ile kapanma ve odağın “15 fotoğrafın
  tümünü aç” düğmesine dönüşü birlikte geçti. İlanlar, iletişim ve ilan detayı HTTP 200;
  HTML önbelleği 60 saniye.
- EDM-024 tamamlandı. Cloudflare Access doğrulaması resmi issuer ve audience kurallarıyla
  aynı hale getirildi. Eksik audience artık doğrulamayı gevşetmiyor; eksik yapılandırma,
  farklı uygulama, farklı ekip issuer'ı, süresi dolan jeton ve geçersiz ekip alanı
  ayrı testlerle reddedildi. JWKS HTTP, ağ/JSON, boş/geçersiz anahtar ve imza işleme
  hataları Workers günlüklerinde kodlu biçimde görülebiliyor. Canlı ekip alanından alınan
  iki imza anahtarının da beklenen `RSA / RS256 / sig` biçiminde olduğu doğrulandı.
  Beş yeni Access testiyle toplam 48 test, üretim derlemesi ve `git diff --check` geçti.
  Worker `cdb40409-2185-4736-b7d5-8c50b8bb67ee` sürümüne dağıtıldı; canlı genel site
  HTTP 200, yönetim paneli Cloudflare Access girişine HTTP 302 ve `no-store` ile yönlendi.
- EDM-025 tamamlandı. `/api/senkron` gizli anahtarı artık yalnız
  `X-Senkron-Anahtari` başlığından okuyor; `?anahtar=` desteği ve kaynak kodda bu
  kullanımın tümü kaldırıldı. Doğru başlık kabulü, aynı doğru anahtarın URL'de reddi,
  eksik ve yanlış başlık/yapılandırma üç yeni testle doğrulandı. Hepsiemlak görsel aktarım
  yer imi başlık tabanlı çalıştığı için değişmeden korundu. Toplam 51 test, üretim
  derlemesi ve `git diff --check` geçti. Worker
  `1005e5e7-6871-472e-93c1-ab2bb2c8ae5f` sürümüne dağıtıldı. Canlı JSON POST isteğinde
  URL anahtarı HTTP 401 döndü; açık senkron durum ucu HTTP 200. Hepsiemlak aktarımının
  CORS ön kontrolü HTTP 204 ve `Content-Type, X-Senkron-Anahtari` başlık izni verdi.

### 15 Eylül 2026

- EDM-026 tamamlandı. Yönetim rolleri kod düzeyinde yetkilere ayrıldı: Doğukan Özdoğan
  ana admin olarak bütün işlemleri yapabiliyor; Metin Özdoğan admin olarak ilan, içerik
  ve işlem geçmişi işlerini yürütüyor. Kalıcı ilan/hizmet silme ile ekip ve genel ayar
  değişiklikleri sunucuda ana admin kontrolü olmadan çalışmıyor; ilgili arayüz eylemleri
  de admin rolünde kapalıdır.
- `panel_islem_gecmisi` tablosu, zaman ve varlık indeksleriyle canlı D1'e
  `0005-panel-islem-gecmisi.sql` üzerinden uygulandı. İlan ekleme/düzenleme, görünürlük,
  öne çıkarma, toplu işlem, sosyal paylaşım kuyruğu, kalıcı silme, hizmet/bölge metinleri,
  ekip ve iletişim ayarları kimlikli değişiklik kaydı oluşturuyor. Geçmiş ekranında son
  300 kayıt yönetici, kayıt türü ve arama metniyle filtreleniyor; önceki ve sonraki
  değerler gerektiğinde açılıyor.
- Yerel tarayıcı kabulünde ayar kaydı Doğukan Özdoğan / Ana admin kimliğiyle geçmişe
  düştü ve ayrıntı ekranında görüldü. Beş yeni rol testiyle toplam 56 test, üretim
  derlemesi ve `git diff --check` geçti. Worker
  `e7d9bf82-0109-4449-939a-376f12393b60` sürümüne dağıtıldı; canlı ana sayfa HTTP 200,
  Access korumalı işlem geçmişi HTTP 302 verdi.

### 30 Eylül 2026

- EDM-029 başlatıldı. Mevcut yükleyicinin EXIF yönünü düzelttiği, WebP'ye sıkıştırdığı,
  50 fotoğraf sınırını koruduğu ve kapak/sıra/gizleme kontrolleri sunduğu görüldü.
  Görüntü kalitesi için editoryal standart ve dosya seçimi sırasında nazik kalite
  uyarıları eksik; portal filigranlarını kaldırmadan özgün/kullanım izinli fotoğraf
  tercihine dair rehber eklenecek.
- Birikmiş EDM çalışma ağacı kullanıcı isteğiyle üretime alındı. Dağıtımdan önce
  `npm test` paketinin tamamı ve üretim derlemesi geçti. Uzak D1'de `0006-icerik-yayini.sql`
  migrasyonu uygulandı; `site_icerik` ve indeksleri oluşturuldu, mevcut içerik/ilan
  kayıtları değiştirilmedi. Yeni içerik kayıtları taslak başlar; insan onayı olmadan
  yayımlanmaz.
- İlk Worker sürümü `5723cf60-2288-48bf-8e3d-8c6c1ede30a5` dağıtıldı. Canlı smoke
  testinde `/sitemap.xml` HTTP 500 verdi: sitemap, bültenin kullanıcıya gösterilen
  Türkçe `tarih` metnini ISO tarih gibi `toISOString()` ile işliyordu. `lastmod` artık
  `guncellemeTarihi` ISO alanını kullanıyor. Düzeltme sonrası bütün testler ve üretim
  derlemesi geçti; Worker `27d9121f-3cbf-4b9f-a3b8-5d2474f7b2dd` sürümüne yeniden
  dağıtıldı. Canlı sitemap HTTP 200, 74 URL ve 55 geçerli ISO `lastmod` içeriyor; üç
  örnek ilan detayı HTTP 200. `/`, `/ilanlar`, `/bulten`, `/sozluk` ve `/rehber/bilgi`
  HTTP 200; `/yonetim` Cloudflare Access girişine HTTP 302 verdi. Uzaktaki D1'de
  `site_icerik` salt okunur sorguyla doğrulandı. Canlı formlar veya yazan API uçları
  gönderilmedi. Çalışma ağacı geniş kapsamlı ve henüz commit edilmemiş durumda; dağıtım
  mevcut birikmiş değişiklikleri içerir.
- EDM-029'un uygulama tarafı tamamlandı: ilan formuna kapak seçimi, sıralama, yatay çekim,
  1200×800 önerisi, mahremiyet ve kullanım hakkı rehberi eklendi. Fotoğraf önizlemesinde
  düşük çözünürlük ve sıra dışı en-boy oranı nazikçe bildirilir; dikey fotoğraflar
  engellenmez. Yönetim fotoğraf ekranında da aynı standart görünür. Yükleme API'si D1
  fotoğraf sayısını okuyamazsa yüklemeyi güvenli biçimde durdurur, kalan 50'lik kotayı
  sunucuda uygular, boş dosyayı reddeder ve D1 yazımı başarısız olursa yeni R2 nesnesini
  temizler. Yedi yeni test dahil `npm test`, üretim derlemesi ve `git diff --check` geçti.
  Worker `fcb40bfb-d25b-4b51-a73e-9f81db3bb976` sürümüne dağıtıldı. Canlı `/`, `/ilanlar`
  ve `/sitemap.xml` HTTP 200 verdi; sitemap 76 URL ve 57 geçerli ISO `lastmod` içeriyor.
  EDM-029'un gerçek ilan kapaklarını kullanım hakkı olan görsellerle değiştirme kabul
  ölçütü, ekip/ofis görselleri gibi, kullanıcıdan gelecek fotoğraf havuzunu bekliyor.
- EDM-034 tamamlandı. Saf vitrin seçicisi eklendi; daire, villa ve arazi için temsilci
  kartları önceleniyor. Satılık villa imarlı ilanlar arazi grubunda sayılıyor; bir grupta
  kayıt kalmadığında mevcut ilan sayısı korunuyor. Danışman kartı, kişiye bağlanmamış ilan
  sayısını yanıltıcı `0 ilan` diye göstermiyor ve `Ofis portföyü` rolünü yazıyor. Üç yeni
  seçki testi dahil tüm test paketi, üretim derlemesi ve `git diff --check` geçti. Worker
  `7bd4673d-1da2-4bb1-be7f-f1da0fb3592f` sürümüne dağıtıldı. Canlı ana sayfa HTTP 200;
  ilk yedi kartın tipi sırasıyla daire, villa, tarla, daire, villa, tarla, daire ve boş
  danışman kartı etiketi `Ofis portföyü` olarak doğrulandı.
- EDM-047 ilerlemesi: `s-maxage` başlıklarının Worker HTML'ini tek başına cache etmediği
  tekrar isteklerde görüldü. Resmî Cloudflare Workers Cache API ile güvenli anonim HTML
  caching eklendi. İlk canlı kontrolde HIT başlığının `max-age` değerini 4 saate çıkardığı
  fark edildi; HIT cevabı 60 saniyeyle sınırlandırıldı. İki yeni güvenlik testi ve tüm
  test paketi, üretim derlemesi, `git diff --check` geçti. Worker
  `fbe708b5-189f-401e-ab3f-755ffc60dbad` sürümüne dağıtıldı. Canlı ana sayfa ve ilan
  listesinde üç istekte `MISS → HIT → HIT`, her yanıtta `max-age=60, s-maxage=60`; panel
  HTTP 302 ve `no-store` ile bypass doğrulandı. Veri değişikliğini panelde yapıp hemen
  ardından tazelenmeyi yazan canlı işlemle doğrulama henüz yapılmadı; bilinen içerik
  tazelik üst sınırı 60 saniyedir.
- EDM-046 ilerlemesi: ana sayfa ve ilan listesi artık aşağıda kalan ilan kartı fotoğraflarını
  erkenden indirmiyor; ilan detayındaki kapak fotoğrafının `fetchpriority=high` davranışı
  korundu. Tüm test paketi, üretim derlemesi ve `git diff --check` geçti. Worker
  `6165713a-003b-4a6d-93b6-5287848a94c0` sürümüne dağıtıldı; canlı ana sayfa 200 ve ilk yedi
  kart `loading=lazy` olarak doğrulandı. Görsel boyutlandırma varyantı/CDN `srcset` ve ortak
  JS bundle optimizasyonu henüz uygulanmadı; gerçek kullanıcı performans verisi de yok.
- EDM-046 ilerlemesi: ortak hareket betiğinden Lenis ana paketten ayrıldı ve yalnız
  dokunmatik olmayan cihazlarda dinamik yükleniyor; ana istemci paketi 51.278 bayt gzip'ten
  47.053 bayta indi. EDM-048 tamamlandı: Emlakjet listesinin sayfa sonu ve tekrar davranışı
  canlıdan salt okunur kontrol edildi; eksik liste yazımı durduruluyor, detay hatasında
  toplu pasifleştirme yapılmıyor ve ani düşüşte aynı eksik ID listesi iki ardışık tam turda
  doğrulanıyor. Yeni 7 test dahil tam `npm test`, `npm run build` ve `git diff --check`
  geçti. Worker `e218d03e-ae1f-4e1f-b783-7c4bfa960ccf` sürümüne dağıtıldı. Canlı ana sayfa
  `MISS → HIT`, ilan listesi ve sitemap HTTP 200; Access korumalı yönetim yolu HTTP 302 ve
  `no-store` verdi. Gerçek senkron yazma işlemi tetiklenmedi.
- EDM-049 tamamlandı: Wrangler D1 migration tablosu ve dizini açıkça tanımlandı; canlıdaki
  eski şema idempotent `0007` taban çizgisiyle kayıt altına alındı. Dağıtım bekleyen
  migration varsa duruyor, Worker DDL çalıştırmıyor ve eksik sürümde anlaşılır hata
  veriyor. `npm test`, `npm run build`, `git diff --check`, yerel SQLite'da 0002–0007
  geçişlerinin iki kez uygulanması ve uzaktaki migration listesi doğrulandı. Canlı D1'e
  0005–0007 başarıyla uygulandı; dağıtım öncesi kapı temiz geçti ve Worker
  `cd0a7c38-7218-4140-a04b-d56b9c4fc8d6` sürümüne dağıtıldı. Sonrasında ana sayfa ve ilan
  listesi 200, sitemap 200, yönetim yolu Access 302/no-store verdi; migration kayıtları
  ve gerekli şema sütunları salt okunur sorguyla doğrulandı.
- EDM-050 ilerlemesi: yerel test D1, `.wrangler/test-state` kalıcılık dizini ve iki güvenli
  komut eklendi (`db:test:migrate` ve `dev:test`); yerel Worker `.env` sırlarını yüklemeden
  ayağa kalkıyor. 0002–0007 migration'ları, `/`, `/ilanlar`, `/sitemap.xml` 200 yanıtları,
  iletişim POST'u, aynı talebin tekrar engeli ve yerel e-posta simülatörü doğrulandı.
  Yapay test talebi silindi ve yerel sayım sıfırlandı. Canlı sistemde istek gönderilmedi;
  panel ve senkron akışları henüz yalıtılmış ortamda denenmedi.
- EDM-051 ilerlemesi: `herSayfada` yardımcısının ilk yüklemede ve sonraki iki Astro
  ClientRouter geçişinde kurulum yaptığını doğrulayan `sayfa-yasam-dongusu.test.ts` eklendi.
  Test tüm otomatik test zincirine bağlandı. Galeri ileri/geri indeks sarımı ve mobil
  yatay dokunma eşiği `galeri-etkilesimi.ts` içine ayrıldı; dört yeni testle doğrulandı
  ve Galeri bileşenine bağlandı. Tam `npm test`, `npm run build` ve `git diff --check`
  geçti. Yerel Worker public sayfaları 200, yetkisiz ilan ekleme yolu 403 verdi; yerel
  D1 ekle/güncelle/rollback smoke testi sonunda sentetik satır bırakmadı. Tarayıcı aracı
  localhost'u engellediği için gerçek galeri görsel testi ve Access kimlikli panel form
  POST'u hâlâ açık. Migration kapısı temiz; Worker `d22585aa-a043-4d0d-b932-cef54a8b563b`
  sürümüne dağıtıldı. Canlı ana sayfa, ilanlar, gerçek ilan detayı ve sitemap 200; yönetim
  ilan ekleme yolu Access'e 302/no-store yönlendiriyor. Canlı detayda fotoğraf sayacı ve
  erişilebilir etiketler HTML üzerinden kontrol edildi.
- 1 Ekim — Yerel panel test kimliği eklendi: yalnız `dev:test` komutunun geçirdiği bayrak
  ve loopback host ikilisiyle etkin. Üç güvenlik testi eklendi; tam `npm test`, üretim
  derlemesi ve `git diff --check` geçti. İzole Worker'da ilan ekleme POST'u 302 ile listeye
  döndü; pasif villa D1'e kaydedildi ve audit oluştu. Düzenleme POST'u 200 döndü; başlık,
  fiyat ve ikinci audit kaydı doğrulandı. CSRF koruması Origin'siz POST'u 403 reddetti.
  Sentetik ilan, ilişkili tablolar ve audit temizlendi; yerel Worker durduruldu. Yerel
  test kimliği değişikliği production vars içine eklenmedi; canlı davranışı değiştiren
  işlev olmadığı için yeni Worker dağıtımı yapılmadı.
- 1 Ekim — EDM-052 tamamlandı: üretim ve staging için ayrı özel R2 yedek kovaları
  açıldı, 90 gün kilit ve halka kapalı alanlar doğrulandı. `site/scripts/yedekle.mjs`
  tam D1 SQL ve R2 nesnelerini kopyalayıp her dosyayı geri okuyarak SHA-256 ile
  doğruluyor. Staging'de sentetik R2 nesnesi yedekten geri alındı; SQL arşivi yeni
  geçici D1'e açılıp 22 tablo doğrulandı ve geçici kaynaklar temizlendi. Canlı D1
  arşivi 330.877 bayt SQL olarak `edm-yedek` içinde doğrulandı; kaynak canlı D1/R2
  değişmedi. Canlı ana sayfa 200, staging Access kapısı 302. Otomatik düzenli
  yedekleme ve başarısızlık uyarısı EDM-078'e ayrıldı; bu turda Worker dağıtımı yok.
- 1 Ekim — Yedekleme eksik medya koruması staging'de olumsuz senaryoyla
  doğrulandı; temiz veride son staging arşivi yeniden üretildi. Hash denetimi
  büyük dosyalar için akışlı hale getirildi. EDM-078 zamanlayıcısı hâlâ açık.
- 2 Ekim — Fotoğraf silme API'si yalnız D1'de kayıtlı ve ilan anahtarıyla
  eşleşen dosyaları siliyor; R2 hatası artık gizlenmiyor, yönetim ekranı hata
  alınca silme düğmesini yeniden açıp açıklamayı gösteriyor. Yerel Worker'da
  yükleme, geri okuma, SHA-256 eşliği, silme ve 404 sonucu doğrulandı. Tam test
  paketi izinli yerel ortamda geçti; staging Worker
  `dd0f7b35-bd9f-4809-a1cf-91d0cf61f81b` ve üretim Worker
  `ab48d5cf-97ef-4cb8-af1c-6cb092416f52` olarak dağıtıldı. Canlı `/`,
  `/ilanlar`, gerçek ilan detayı ve sitemap 200; yönetim ve staging Access
  girişleri anonim isteğe 302 döndü. Gerçek oturumlu staging panel testi açık.

- 2 Ekim — EDM-053 işletim uyarıları canlıya alındı. Senkron ve talep sorunları
  kalıcı olay kaydıyla tekrarsız bildirilir; Access korumalı Uyarılar ekranı
  gönderim sonucunu ve yeniden denemeyi gösterir. 128 test ve derleme geçti.
  Üretim yedeği 37018713358 başarılı, eklemeli 0009 migration doğrulandı.
  Son Worker b4e4374d-fb97-4ccd-b4d1-bb4eb020ad5b. Canlı public sayfalar 200,
  uyarı ekranı Access 302/no-store. Yerel sentetik kayıt temizlendi. İlk gerçek
  cron kontrolü 18:00 programını bekliyor; EDM-053 bu kanıt gelene kadar açık.
  Sonraki geliştirme EDM-039: taleplere sorumlu kişi ve takip tarihi.

- 2 Ekim — EDM-039 başladı: danışman sorumluluğu, Türkiye saatinde takip
  tarihi, kapanış sonucu ve eşzamanlı düzenleme koruması ekleniyor. Mevcut
  müşterilere otomatik sorumlu veya gerçekleşmemiş görüşme atanmayacak.

- 2 Ekim — EDM-039 tamamlandı; takip yönetimi ve güvenli düzenleme canlı.
  139 test geçti; üretim yedeği/migration ve erişim kapıları doğrulandı. EDM-053
  ilk gerçek cron ve tek-deneme uyarı kabulü kanıtıyla kapatıldı. EDM-037 başladı:
  ölçümde tıklama, başarılı kayıt ve gerçek iş sonucu ayrı tanımlanıyor; yeni
  ziyaretçi takibi veya hukuki metin yayını bu dokümantasyon adımında yapılmıyor.

- 2 Ekim — EDM-037 olay sözleşmesi tamamlandı. Ölçülen olay ile gerçek iş sonucu,
  uygulama sayaçları ile kişisel CRM verisi ayrıldı. Sonraki adım EDM-038/040:
  gizlilik/aydınlatma kararıyla uyumlu ölçüm ve gerçek verili işletme göstergeleri.

- 2 Ekim — EDM-040 başladı: salt okunur göstergeler ekranı mevcut talep,
  takip ve UTC görüntülenme kayıtlarına bağlanıyor. Yeni analitik veya kişisel
  takip açılmıyor; ölçülmeyen iş sonuçları açıkça işaretlenecek.

- 2 Ekim — EDM-040 mevcut veri ekranı staging ve üretime dağıtıldı. Staging
  `8c375d6d-499b-4aec-be0b-e440eb91c346`, üretim
  `77fc828b-0c0b-47de-9d95-50808e5752b2`. 148 test geçti; kaynak/derleme sır
  eşleşmesi sıfır. Yerel 503 denemesinde sahte sıfır kartı gösterilmedi,
  geçici tablo adı geri alındı ve test kayıtları temizlendi; Worker ve test
  sekmesi kapatıldı. Canlı ana sayfa/ilanlar/sitemap 200; göstergeler/talepler
  Access'e 302 ve no-store. Gerçek tek açık talep değiştirilmeden sayıldı.
  EDM-040 kısmi: yeni ölçüm ve gerçek ilk yanıt/randevu/işlem sonucu akışı
  henüz kurulmadı; EDM-038 ile EDM-019/020 bağlantısı korunuyor.

- 2 Ekim — EDM-038/040 iş sonucu akışı başladı: ilk yanıt, nitelik, gerçek
  randevu ve işlem teyidi yerelde hazırlanıyor. Yeni canlı kayıt varsayılan
  kapalı; aydınlatma ve saklama kararı netleşmeden etkinleştirilmeyecek.

- 3 Ekim — EDM-038/040 yerel uygulaması doğrulandı: 159 test, gerçek HTTP,
  masaüstü ve mobil form/rapor; tekrar kaydetme iki kez sayılmadı. Kapalı
  bayrakta mevcut ekranlar 200/no-store, yeni POST 403/no-store. Test kayıtları
  temizlendi. Staging öncesi doğrulanmış yedek 11.109 bayt D1 / 0 R2 nesne;
  staging 0011 ve 368a26f9 sürümü hazır, yeni kayıt kapalı ve tablo boş.
  Üretim migration/tablo/sürüm değişmedi, public 200 ve panel Access 302.
  Yeni kişisel veri akışı ve işletmeden kalan kimlik/erişim/saklama kararları
  belgelendi; önceki genel 12 ay önerisi kaldırıldı. Sır değişmedi.
  EDM-078 kontrolünde son doğrulanmış üretim arşivi 2 Ekim 17:52 Türkiye saati;
  3 Ekim 02:17 ilk zamanlanmış arşiv saati henüz gelmediğinden kabul açık.

- 3 Ekim — EDM-036 ve EDM-043: resmi kaynaklı üç bölge rehberi, il/ilçe
  ayrımı ve örnek sayılı arazi ortancası; iki kalıcı Silivri arama sayfası
  hazırlandı. 169 test ve derleme geçti; yerel sayfa/filtre geçişleri ve
  mobil/masaüstü kontrol edildi. Kaynak ve kabul kayıtları iki belgede.
  Üretim 0011 ve yeni kişisel CRM kayıtları kapalı tutuluyor.

- 3 Ekim — EDM-078 ilk gerçek zamanlanmış arşiv doğrulandı: schedule koşusu
  `37077494935`, başlangıç 02:25 Türkiye; işlem `yedekle`. Manifest
  `production/2026-10-02T23-25-53-443Z-ebcb99e0/manifest.json`; D1 335.166
  bayt, R2 0 nesne. Bu manuel veya yalnız güncellik kontrolü değildir.
  İki ardışık günlük arşiv kabulünün ilki geçti; ikinci koşu açık.

- 3 Ekim — Bölge rehberleri ve kalıcı arama sayfaları staging sürümü
  `31afd84b-b24d-4605-bf73-99ffe522d3f1` ile dağıtıldı. Access 302 doğrulandı;
  uzaktaki giriş yapılmış ekran ayrıca görülmedi. Üretimde iş sonucu
  tablosu yok; staging yeni CRM bayrağı kapalı. Geçici yerel ilanlar ve
  EDM036 deneme işlem izleri temizlendi. Üretim yayını ve EDM-044 sırada.


- 3 Ekim — EDM-044 tamamlandı ve EDM-043 üretime çıktı. Google canlı ilan
  sonucu `tGmIZpA_hO_8swqKA5W8uA` (03:48 Türkiye): üç geçerli öğe, kritik
  hata yok. Schema.org'da daire ve arazi 0 hata/0 uyarı; 48 ilan HTTP 200.
  178 test ve derleme başarılı. Staging `455b07dd-a032-44c2-ad65-9821f8e9b028`;
  üretim `cc8e9c5e-7834-4b7e-88c5-2dd7462b1634`. Yayın öncesi özel yedek
  `production/2026-10-03T00-44-35-655Z-4cb6cdd3/manifest.json` doğrulandı.
  Yeni CRM bayrağı açıkça 0, üretim sonuç tablosu yok; 0011 uygulanmadı.
  Dağıtım kapısı yalnız bu kapalı özelliği erteleyebilir; eksik taban veya
  başka bekleyen geçişler durdurur. Kaynak/derlemede gerçek sır eşleşmesi 0.
  Oturumlu uzak panel bu turda görülmedi; Access 302/no-store doğrulandı.
  Sırada kalan dört bölge rehberinin yerel kaynakları; EDM-078 ikinci gerçek
  günlük arşivi 4 Ekim hedef saatinde bekliyor. Search Console raporu ve
  kişisel CRM kararları kullanıcı bilgisine bağlı olarak açık kalıyor.

- 3 Ekim — Mobil görsel yükü için Hepsiemlak kart/şerit/galeri kapağında
  yüksek yoğunluklu dar ekran kaynağı 1280'den 960×720'ye sınırlandı; masaüstü
  kaynağı korundu, galeri küçük görselleri 640 kaldı. Staging
  `7b85d774-81a3-4826-8748-259c6d8b7dde`, üretim
  `18359eaf-ee95-49d4-b5c0-179063add22d`; 0011 CRM geçişi uygulanmadı.
  PageSpeed mobil (16:25) 96 puan, LCP 2,6 sn, CLS 0, görsel tasarrufu
  tahmini 1.024 KiB; başlangıç tahmini 1.782 KiB idi. Ara taramada belirgin
  dalgalanma görüldü, saha verisi yok. Üretim public 200, yönetim
  302/no-store; staging Access 302/no-store. Derleme ve diff-check geçti;
  test çalıştırılmadı. Kalan performans fırsatları: 630 ms oluşturma engeli,
  gerçek telefon/CrUX ölçümü ve gizlilik kararı.

- 3 Ekim — PSI'de 44 KiB açık logo 204×56 alanda kullanılıyordu. Üst çubuk,
  alt bilgi ve panel ortak responsive WebP bileşenine geçti; 500 WebP 17 KiB
  (%61 daha küçük), PNG fallback duruyor. Staging
  `b5899759-bdf4-4174-a4af-736423ef9ae5`, üretim
  `339d4b32-4224-4115-951d-e75f17ce02c2`; asset HTTP 200, panel Access
  302/no-store. PageSpeed 16:36: 95 puan/LCP 2,6 sn, görsel fırsatı 434 KiB
  (önceki 1.024 KiB'den %58 düşük); saha verisi yok. Derleme/diff-check
  geçti, test yok. Sırada kalan CSS bloklamasını ölçmek var.

- 3 Ekim — Canlı görsel taraması listede 48/48 kartı, Hepsiemlak galerisinde
  15/15 fotoğrafı yükledi. Emlakjet ilanının tam ekran galerisinde 9/10 fotoğraf
  doğrudan CDN adresine gittiği için açılmıyordu. Galeri kaynağı aynı güvenli
  Worker proxy'sine yönlendirildi; üretim `5cc9acf8-4b36-4ffa-b653-53fd45cebf09`
  sürümünde Emlakjet 10/10, Hepsiemlak 15/15 ve kartlar 48/48 doğrulandı.
  Sonraki adım CSS bloklamasını, dört canlı stil dosyası ve başlangıç görünümü
  üzerinden değerlendirmek.

- 3 Ekim — Üretimde tüm CSS'i tek `<style>` öğesine alma denemesi yapıldı.
  PageSpeed mobil 95 puan/LCP 2,6 sn/TBT 20 ms ölçtü; önceki dış CSS ölçümü
  96/LCP 2,4 sn/TBT 0 ms idi. Geri dönüşten sonraki yeni ölçüm yine 95/LCP
  2,6 sn, TBT 0 ms; CSS oluşturma engeli 640 ms verdi. Ölçümler değişkenlik
  gösteriyor; inline sürüm kazanç getirmediği için Astro `inlineStylesheets`
  `auto` değerine alındı ve
  `95fc64da-d3ae-49a9-a65c-9d82f5725290` sürümüne yeniden dağıtıldı. Canlıda
  dört CSS isteği geri geldi. Ardından ilan kartı stilleri ortak CSS'e taşındı:
  canlı harici CSS istekleri 4'ten 3'e indi ve toplam gzip CSS yaklaşık 624
  bayt azaldı; `1fe86214-1b99-4407-9b94-7ac79bab54b2`.

- 3 Ekim — Kullanıcının bildirdiği eksik ilan fotoğrafları canlıda yeniden
  incelendi. Yüksek DPR'da Emlakjet fotoğrafları bazı kartlarda başarısız olan
  proxy boyutuna takılabiliyor; hata halinde diğer proxy boyutu deneniyor,
  son yedek özgün kaynak olarak kalıyor. Galeri kapaklarında yoğun ekran kaynağı
  doğrudan CDN'e çıkmak yerine kendi Worker proxy'sini kullanıyor. Canlı ana
  sayfada sorunlu kartın 960 px fotoğrafı yüklendi; ilan 19877910 galerisinde
  10/10 fotoğraf tek tek açıldı. İlgili testler 16/16, Astro derlemesi geçti.
  Tam ekran büyütücü de aynı geri dönüş zincirini kullanıyor. Üretim
  `1824e93f-1837-44fc-abc0-ea3a68a29757`; 0011 CRM geçişi ertelendi.

- 3 Ekim — Son canlı taramada 49 ilan kartının 49'u yüklendi; kaynaklar 20
  Emlakjet proxy ve 29 Hepsiemlak CDN fotoğrafı. Örnek tam ekran galerilerde
  Emlakjet 10/10, Hepsiemlak 7/7 fotoğraf açıldı. Bu turda üretim kodu değişmedi.
  CSS'i tümden inline alma önceki ölçümde kazanç vermedi; sıradaki performans
  işi ilk ekran dışı kuralları ayıran küçük, kıyaslanabilir bir CSS denemesi.

- 3 Ekim — Kullanıcının bildirdiği düşük fotoğraf sayısı için Emlakjet ilanı
  19751424 kaynakta kontrol edildi: ana fotoğraf ve iki ek fotoğrafın tamamı
  Emlakjet'te de var ve yükleniyor; drone kartı harita görüntüsü. Bu kayıt için
  aktarım kaybı yok. Güncel ilan kalite raporu salt okunur D1 sorgusuyla 49
  yayındaki ilanı taradı: 34 kural uyarısız, 12 teyit gerekli, 3 alan çelişkili;
  işletme teyit kuyruğunda 15 konu hâlâ bekliyor. Fotoğraf uyuşmazlığı dışındaki
  tapu, alan ve kullanım bilgileri kaynakla karşılaştırılmalı, belge/işletme
  yanıtı olmadan otomatik değiştirilmemeli. Astro derlemesi geçti; yalnız
  Wrangler'ın sandbox dışındaki varsayılan log dosyasına yazma uyarısı vardı.

- 3 Ekim — Kaynak portalı kalite çelişkilerinde de kontrol edildi. Emlakjet
  19538691 sayfası özellikte “Hisseli Tapu”, açıklamada “kat irtifak tapulu”
  diyor; 19647778 sayfası açıklamada 83 ada/157 parsel derken özellikte Parsel 3
  gösteriyor. İki ilandaki tapu/kadastro değeri belge olmadan değiştirilmedi.
  19889243 ise “Mülk Sahibi Oturuyor” derken tanıtımda “hemen taşınmaya hazır”
  ifadesini kullanıyor; bunlar zorunlu olarak çelişmeyebilir, fakat teslim zamanı
  teyit kuyruğuna alındı.
- 4 Ekim — Canlı `/ilanlar` listesindeki 49 kapak yeniden denetlendi. İlk görünümdeki aşağıda kalan kart fotoğrafları henüz indirilmemişti (`loading="lazy"`); liste sonuna kaydırınca 49/49 kapak yüklendi. 19751424 numaralı az fotoğraflı Emlakjet ilanında kapak ve iki ek kare hem kaynakta hem sitede mevcut; tam ekran galeri 3/3 kareyi 960 px proxy üzerinden açtı. Ana sayfaya özel CSS taramasındaki eşleşmeyen seçiciler hover/gezinti/durum kurallarıydı; ortak CSS budanmadı. PageSpeed isteği HTTP 429 döndü, bu turda CSS değişikliği yapılmadı.
- 4 Ekim — Galeri/sunum testleri 16/16, fotoğraf kuralları testleri 7/7 geçti; Astro derlemesi tamamlandı. Wrangler tanılama günlüğünü korumalı kullanıcı klasörüne yazamadı (sandbox EPERM), ancak derleme çıktısı başarıyla üretildi.
- 4 Ekim — Kaynak Emlakjet ilanı 19889243 portalda 31 fotoğraf bildirirken canlı EDM galerisi 10 gösteriyor. Senkron `Product.image` alanıyla sınırlıydı; HTML içindeki ek ilan görsellerini alan ayrıştırıcı ve 31 fotoğraf/tekilleştirme testleri eklendi. Kod incelemesi, ilk sürümün `/resize/960` adreslerini görsel sunum sözleşmesiyle uyumsuz kaydettiğini gösterdi; henüz cron çalışmadığı için bu biçim D1'e yazılmadı. Ayrıştırıcı şimdi kanonik `/listing/` URL'si kaydediyor. Emlakjet fotoğrafı EDM proxy'sinden canlıda 640×360 olarak doğrulandı. Düzeltme `a0a04b42-6b92-4fe6-b23e-87c1663111be` sürümüyle üretime alındı; yeni senkron sonrası 31 kare aktarımı ve sayfa galerisi kontrol edilecek. Son D1 senkronu 3 Ekim 21:00 UTC, deployment öncesi. 19538691 ile 19647778 kaynak alan çelişkileri belge bekliyor; 19889243 teslim zamanı için ofis teyidi kuyruğa alındı.

- Güncel doğrulama (4 Ekim): sonraki 03:01 ve 09:01 UTC senkronları 49 ilan ve sıfır hatayla tamamlandı; 19889243 D1 kaydı 31 fotoğrafa çıktı. Canlı detay galerisi 1/31–31/31 gezildi ve son kare yüklendi. Önceki ‘senkron bekleniyor’ bilgisi artık güncel değil. Ayrıştırıcı testi 2/2, galeri/sunum 16/16, fotoğraf kuralı 7/7 geçti.

- 5 Ekim — İlan şablonlarına toplu alt tür denetimi: konut arsa alanı sekiz müstakil
  konut alt türüne sınırlandı; daireden gönderilen gizli arsa alanı hem kayıttan çıkarılıyor
  hem de yapı alanı zorunluluğunu geçemiyor. Proje konut/ticari ünite adetleri proje türüne
  göre ayrıldı; gizli alanlar sunucu tarafında da yok sayılıyor. İlan bütünlüğü 43/43,
  şema 6/6 test geçti; Astro üretim derlemesi tamamlandı. Sahibinden Kurumsal tarayıcı
  sekmesi giriş sayfasında olduğundan yeni özel alanlar canlı oturumdan alınamadı;
  paylaşılan Ofisim ekran görüntüleri ve kategori envanteri kullanıldı. Ayrıntı:
  `raporlar/2026-09-18-ilan-kategori-envanteri.md`.

- 5 Ekim ek kontrol — Kullanıcı Sahibinden'de oturum açtı. Anasayfadaki “Ücretsiz İlan
  Ver” bağlantısı Ofisim `/ilan-ver/adim-1/?state=new` sayfasını açıyor; form içeriği
  yüklenmeyip boş kırmızı ekranda kalıyor ve yenilemeyle düzelmiyor. Oturum içi şablon
  zorunlulukları bu nedenle okunamadı; kullanıcı ekran görüntüleri ve mevcut envanter
  üzerinden iş sürüyor. Güncel doğrulama: ilan verisi 43/43, ilan şeması 6/6.

- 6 Ekim — Sahibinden tam form dışa aktarımı yerel kaynakla toplu karşılaştırıldı:
  `raporlar/sahibinden-sablonlari/tam-form-sablonlari.json` içinde 336 form, 4.468
  alan kullanımı ve 13.385 seçenek etiketi var. Hepsi EDM şemasına eşleşiyor; 0
  bilinmeyen tür, alan veya seçenek farkı. 331 formda alt tür kesin, 5 arsa/bina
  formu üst kategori işlemi olarak tanımlı. 3.729 kaynak zorunlu alan kullanımı,
  263 kategori/işlem/tür kuralı olarak üretildi; kaynakta zorunlu olan devre mülk
  durumu 36 tesiste koşullu zorunlu. Sunucu kaydı ile tarayıcı formu aynı üretilmiş
  kuralları kullanıyor. Denetim `site/scripts/sahibinden-form-kapsami.mjs`, çıktı
  `site/src/lib/sahibinden-zorunlu-alanlar.generated.ts`; komutlar kök README'ye
  eklendi. İlan bütünlüğü 58/58, ilan şeması 7/7 geçti, üretim derlemesi tamamlandı.
  Tüm testlerde 168/175 geçti; kalan 7 gerçek D1/Workers entegrasyon testi sandbox'ın
  `127.0.0.1` portu açma izni vermemesi nedeniyle `EPERM` ile durdu. Dağıtım yapılmadı.
  EDM-068'in kaynak alan/veri eşlemesi tamam; sıradaki kabul adımı yönetim formunda
  oluşturma, düzenleme, taslak ve koşullu zorunluluk akışlarını tarayıcıda doğrulamak.
