# EDM Yapı & Gayrimenkul — Genel Proje Hafızası

Bu dosya projenin yaşayan hafızası ve ana iş listesidir. Yeni bir çalışma başlarken
önce bu dosya, ardından yapılacak işle ilgili kaynak dosyalar okunur. Tamamlanan her
iş aynı çalışma içinde burada güncellenir; yalnızca kodu değiştirmek yeterli sayılmaz.

Son güncelleme: 10 Eylül 2026

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
- D1, ilanları ve panel verilerini tutar; R2 panelden yüklenen görselleri tutar.
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

- [-] **EDM-001 — İletişim formunun başarı/hata akışını düzelt.**
  - `fetch` yanıtının `ok` durumu ve JSON gövdesi kontrol edilmeli.
  - Yalnızca D1 kaydı başarılıysa başarı ekranı açılmalı.
  - Hata halinde girilen bilgiler korunmalı, açık hata metni ve yeniden deneme olmalı.
  - WhatsApp yedeği hata halinde kullanılabilir kalmalı.
  - Kabul: başarısız API yanıtı başarı ekranı göstermez; başarılı kayıt bir kez yazılır.

- [ ] **EDM-002 — Değerleme formunun başarı/hata akışını düzelt.**
  - EDM-001 ile aynı güvenilirlik davranışı uygulanmalı.
  - Rapor gönderme vaadiyle girilen e-posta dahil form değerleri hata halinde korunmalı.
  - Kabul: ağ ve 4xx/5xx hataları başarı gibi görünmez; tekrar deneme veri kaybetmez.

- [ ] **EDM-003 — Talep API'sinin sunucu doğrulamasını güçlendir.**
  - Talep türüne göre zorunlu alanlar sunucuda da doğrulanmalı.
  - Telefon tek biçime normalize edilmeli; yinelenen talep denetimi bu değerle yapılmalı.
  - Uzunluk, e-posta biçimi, mülk tipi, ilçe ve sayısal alanlar izinli değerlere göre
    kontrol edilmeli.
  - Kabul: tarayıcı doğrulamasını atlayan bozuk istekler D1'e yazılmaz.

- [ ] **EDM-004 — Talep ucuna gerçek hız sınırı ve kötüye kullanım koruması ekle.**
  - Mevcut “aynı telefon / iki dakika” kontrolü korunabilir fakat tek başına yeterli değil.
  - IP ve zaman penceresi tabanlı sınır veya Cloudflare Rate Limiting değerlendirilmeli.
  - Bot tuzağı korunmalı; normal ziyaretçi gereksiz CAPTCHA ile karşılaştırılmamalı.
  - Kabul: farklı sahte telefonlarla yoğun istek kayıt ve e-posta seli oluşturamaz.

- [ ] **EDM-005 — Satılık/kiralık çelişkili Araptepe kayıtlarını düzelt.**
  - `19673570` satılık, `19797428` kiralık kayıtları kaynak portallarda ve işletme
    bilgisiyle karşılaştırılmalı.
  - Satılık ilanın “Kiralık” geçen başlığı ve açıklaması doğru bilgiyle düzeltilmeli.
  - İki kayıt aynı mülkün farklı işlemleri ise sayfalarda bu ilişki açıkça anlatılmalı.
  - Kabul: işlem rozeti, başlık, fiyat birimi ve açıklama birbirini doğrular.

- [ ] **EDM-006 — Aynı başlıklı/mükerrer olabilecek ilanları doğrula.**
  - Yıldırım Beyazıt 9.456 m² tarla kayıtları `19290394` ve `19303282` kontrol edilmeli.
  - Aynı mülkse mükerrerlik yönetilmeli; farklı mülkse ayırıcı başlık/konum yazılmalı.
  - İlanlar kullanıcı teyidi olmadan silinmemeli.
  - Kabul: ayrı URL'lerde açıklanamayan aynı başlık ve içerik kalmaz.

- [ ] **EDM-007 — Bölge rehberi fiyat istatistiklerini işlem türüne göre ayır.**
  - Aylık kiralar ile satış bedelleri aynı min–maks aralığına girmemeli.
  - Satılık konut, kiralık konut ve satılık arsa/tarla ayrı gösterilmeli.
  - Kiralık değerlerde `/ay`, satışlarda toplam bedel açıkça yazılmalı.
  - Kabul: Silivri sayfasında 20.000 ₺ kira ile 147.935.000 ₺ satış tek aralık değildir.

- [ ] **EDM-008 — Ana sayfadaki “dönüm arazi” hesabını düzelt.**
  - `toplamAlan` yalnızca arsa/tarla kayıtlarından hesaplanmalı veya adı toplam portföy
    alanı olarak değiştirilmelidir.
  - Aynı fiziksel mülkün satış/kiralama kayıtları iki kez sayılmamalı.
  - Başlangıç denetiminde arsa/tarla kayıtları toplamı 198.466 m² çıktı; canlı veriyle
    yeniden doğrulanmalı.
  - Kabul: gösterilen sayı ve etiket aynı veri kümesini anlatır.

- [ ] **EDM-009 — İlanların alan verisini açık biçimde ayır.**
  - Konutta net/brüt yapı alanı, villada arsa/yapı alanı, arazide toplam parsel/satılan
    hisse alanı ayrı alanlar olmalı.
  - Kart m² değeri ve birim fiyatın hangi alana dayandığı belli olmalı.
  - Kabul: tek bir belirsiz `m²` değeri farklı anlamlarda kullanılmaz.

- [ ] **EDM-010 — 46 aktif ilan için içerik kalite kontrolü yap.**
  - İşlem türü, fiyat, başlık, kategori, net/brüt/arsa alanı, danışman ve özellik
    çelişkileri taranmalı.
  - `19802542` kaydındaki “site içinde” / “Site İçerisinde: Hayır” çelişkisi çözülmeli.
  - Portalın yazım hataları gerektiğinde panel geçersiz kılmalarıyla düzeltilmeli.
  - Kabul: yayımdaki her ilanın temel alanları için kontrol kaydı oluşur.

### Faz 2 — Mobil kullanım ve iletişim akışını tamamla

- [ ] **EDM-011 — Mobil ilan galerisini düzelt.**
  - 390 px ekranda 2–5. fotoğraf düğmeleri yaklaşık 13 × 9,75 px'e sıkışıyor.
  - Mobilde bütün önizlemeler parmakla kaydırılan, yeterli boyutta kartlar olmalı.
  - Tam ekran galeri, sağ/sol ok, dokunma ve Escape davranışı korunmalı.
  - Kabul: 360, 390 ve 430 px genişlikte her önizleme görünür ve dokunulabilir.

- [ ] **EDM-012 — “Yerinde görmek istiyorum” akışına ilan bağlamı taşı.**
  - İlan kimliği, başlığı ve kaynak sayfa iletişim formuna gelmeli.
  - Form konusu otomatik seçilmeli ve talep kaydında ilan kimliği ayrı alan olmalı.
  - Kabul: panelde talebin hangi ilan için geldiği doğrudan görülür.

- [ ] **EDM-013 — Mobil filtre deneyimini yeniden düzenle.**
  - Yatay satırda görünmeyen filtreler için açılır filtre paneli değerlendirilmeli.
  - Seçili filtrelerin özeti ve kolay temizleme sunulmalı.
  - Kabul: tek elle tüm filtrelere ulaşılır; seçili durum açıkça görülür.

- [ ] **EDM-014 — Bütçe ve mahalle filtrelerini ekle.**
  - Satılık ve kiralık için anlamlı fiyat aralıkları ayrı ele alınmalı.
  - İlçeye göre mahalle seçenekleri daraltılmalı.
  - Kabul: URL paylaşılabilir; geri/ileri gezinmesinde filtre durumu korunur.

- [ ] **EDM-015 — Oda, alan ve arazi alt türü filtrelerini ekle.**
  - Konutta oda ile net/brüt alan; arazide tarla, villa imarlı ve toplu konut için
    seçenekleri desteklenmeli.
  - Kabul: filtreler veri tiplerine göre anlamlıdır; uygulanamaz seçenekler gösterilmez.

- [ ] **EDM-016 — Harita açıklamasını doğru hale getir.**
  - Daire gerçek idari sınır değilse “mahalle sınırı” denmemeli.
  - Önerilen ifade: “Harita mahallenin yaklaşık konumunu gösterir; mülkün kesin
    konumunu göstermez.”
  - Kabul: metin, çizilen şeklin ne olduğunu doğru açıklar.

- [ ] **EDM-017 — İletişim metinlerini profesyonelleştir.**
  - “Ofiste kimse varsa buradan da ulaşabilirsiniz” gibi ifadeler sadeleştirilmeli.
  - Telefon ve WhatsApp için gerçek ulaşılabilir saatler belirtilmeli.
  - Kabul: bütün iletişim sayfalarında saatler ve beklenti tutarlıdır.

- [ ] **EDM-018 — Favori listesini tek mesajla paylaşma özelliği ekle.**
  - Seçilen ilanlar başlık, fiyat ve bağlantılarıyla WhatsApp veya sistem paylaşımına
    aktarılmalı.
  - Kabul: kullanıcı favorilerini tek tek kopyalamadan ofise iletebilir.

### Faz 3 — Gizlilik, güvenlik ve erişilebilirlik

- [!] **EDM-019 — Gerçek veri akışına uygun aydınlatma metni hazırla.**
  - Veri sorumlusu, işlenen veriler, amaç, hukuki sebep, aktarım, saklama yaklaşımı,
    başvuru kanalı ve ilgili kişi hakları açıklanmalı.
  - Cloudflare, e-posta hizmeti ve işletmedeki gerçek erişim/aktarım süreci hesaba katılmalı.
  - Form çevresinden ve alt bilgiden erişilebilir bağlantı verilmeli.
  - Beklenen: işletme bilgileri ve hukuk uzmanı tarafından gözden geçirilmiş metin.

- [!] **EDM-020 — Aydınlatma ve gerekiyorsa açık rıza akışını ayır.**
  - Tek genel “izin veriyorum” cümlesi yerine gerçek hukuki işleme şartına uygun akış
    belirlenmeli.
  - “Bilgiler üçüncü kişilerle paylaşılmaz” iddiası gerçek teknik akışla doğrulanmalı.
  - Beklenen: hukuk uzmanının hangi işlem için rıza gerektiğine dair kararı.

- [ ] **EDM-021 — Form erişilebilirliğini tamamla.**
  - Hatalı alanlara `aria-invalid` eklenmeli ve hata metni `aria-describedby` ile bağlanmalı.
  - Onay kutusu hatası görünür ve ekran okuyucuyla anlaşılır olmalı.
  - Gönderim durumu ve hata mesajı canlı bölge üzerinden bildirilmelidir.
  - Kabul: yalnız klavye ve ekran okuyucu akışında hata alanı ve düzeltme yolu anlaşılır.

- [ ] **EDM-022 — Filtre ve sonuç erişilebilirliğini tamamla.**
  - Sonuç sayısı değişiklikleri erişilebilir canlı bölgede duyurulmalı.
  - Filtre düğmelerinin rolü ve basılı durumu tutarlı olmalı.
  - Kabul: klavyeyle filtreleme yapılır ve sonuç değişimi anlaşılır.

- [ ] **EDM-023 — Klavye odağı, kontrast ve dokunma hedeflerini denetle.**
  - Mobil galeri, menü, filtreler, sabit iletişim çubuğu ve form alanları dahil edilmeli.
  - Azaltılmış hareket ve JavaScript kapalı durum yeniden doğrulanmalı.
  - Kabul: kritik akışlarda görünür odak, okunabilir kontrast ve yeterli hedef boyutu vardır.

- [ ] **EDM-024 — Access jeton doğrulamasını sıkılaştır.**
  - Beklenen `audience` eksikse panel güvenli biçimde kapalı kalmalı.
  - `issuer` değeri beklenen takım alanıyla doğrulanmalı.
  - Anahtar getirme hataları gözlemlenebilir olmalı.
  - Kabul: yanlış uygulama, issuer veya eksik yapılandırmayla panel açılamaz.

- [ ] **EDM-025 — Senkron anahtarının URL parametresi desteğini kaldır.**
  - Anahtar yalnızca başlıkla kabul edilmeli; URL, günlük ve tarayıcı geçmişine girmemeli.
  - Hepsiemlak aktarım aracının çalışması korunmalı.
  - Kabul: `?anahtar=` ile kimlik doğrulama yapılamaz.

- [ ] **EDM-026 — Yönetim işlemlerine rol ve işlem geçmişi ekle.**
  - İlan silme, görünürlük, içerik, ekip ve ayar değişiklikleri kaydedilmeli.
  - İhtiyaca göre yönetici/editör rolleri tanımlanmalı.
  - Kabul: kim, neyi, ne zaman değiştirdi görülebilir; kritik işlemler yetkiye bağlıdır.

### Faz 4 — Güven kanıtları ve içerik kalitesi

- [!] **EDM-027 — Eksik danışman portrelerini tamamla.**
  - Ercan Taşdemirler ve Basri Çelik için marka standardına uygun fotoğraflar gerekli.
  - Beklenen: kullanım izni olan, yüksek çözünürlüklü portreler.

- [!] **EDM-028 — Gerçek ofis ve çalışma fotoğrafları ekle.**
  - Ana sayfa ve hakkımızda bölümünde yerel ofisi ve ekibi gösteren özgün görseller
    kullanılmalı.
  - Beklenen: kullanım izni olan seçilmiş fotoğraflar.

- [ ] **EDM-029 — İlan fotoğraf standardı oluştur ve uygula.**
  - Kapak oranı, yatay çekim, ışık, sıralama ve minimum çözünürlük kuralları yazılmalı.
  - Portal filigranlı görseller, kullanım hakkı olan özgün kaynaklarla değiştirilmeli;
    filigran silinmemeli.
  - Kabul: en önemli ilanlarda tutarlı, markaya ait ve mobil uyumlu kapaklar kullanılır.

- [!] **EDM-030 — Google yorumlarını canlıda etkinleştir ve doğrula.**
  - API anahtarı/işletme eşleşmesi, günlük güncelleme ve canlı görünürlük kontrol edilmeli.
  - Yazar adı, avatar, kaynak bağlantısı ve Google atıfları korunmalı.
  - Beklenen: doğru Google işletme kaydı ve üretim API yapılandırması.

- [!] **EDM-031 — Yetki belgesi ve doğrulanabilir işletme bilgilerini yayımla.**
  - Yayımlanması uygun belge numarası/bilgisi, kuruluş ve ofis bilgileri doğrulanmalı.
  - Beklenen: işletme tarafından sağlanan güncel belge ve yayımlama onayı.

- [!] **EDM-032 — Örnek değerleme raporu ve süreç standardı oluştur.**
  - Tek sayfalık örnek raporda değer aralığı, karşılaştırmalar, veri tarihi ve etkileyen
    unsurlar bulunmalı.
  - “Aynı gün” ve “gerçekleşmiş satışlara bakıyoruz” vaatleri gerçek iş süreciyle
    doğrulanmalı.
  - Beklenen: işletmenin gerçek rapor şablonu ve veri kaynakları.

- [!] **EDM-033 — İzinli, anonim başarı örnekleri ekle.**
  - Değerleme, arazi danışmanlığı ve satış sürecinden doğrulanabilir kısa vakalar seçilmeli.
  - Beklenen: anonimleştirilmiş bilgi ve gerekiyorsa müşteri izni.

- [ ] **EDM-034 — Ana sayfadaki öne çıkan ilanları dengele.**
  - Daire, villa ve arazi dengesi sağlanmalı; yalnız yüksek fiyatlı villalara ağırlık
    verilmemeli.
  - Broker kartında “0 ilan” yerine bütün portföy yönetimi rolü gösterilmeli.
  - Kabul: ana sayfa portföy çeşitliliğini ve ekip rolünü doğru temsil eder.

- [ ] **EDM-035 — Danışman profillerini zenginleştir.**
  - Doğrulanabilir deneyim, bölge, uzmanlık ve iletişim biçimi eklenmeli.
  - Ortak telefon kullanılıyorsa yönlendirme süreci açıklığa kavuşturulmalı.
  - Kabul: ziyaretçi kimin hangi konuda yardımcı olacağını anlayabilir.

- [ ] **EDM-036 — Bölge rehberlerini özgün yerel bilgiyle derinleştir.**
  - Önce Silivri; sonra portföy büyüklüğüne göre Edirne Merkez ve Meriç.
  - Mahalle karakteri, ulaşım ve doğrulanabilir arazi/konut karar ölçütleri eklenmeli.
  - Örnek sayısı açık yazılmalı; EDM portföyü piyasanın tamamı gibi sunulmamalı.
  - Kabul: her rehber yalnızca sayı ve kısa tanıtımdan fazlasını sunar.

### Faz 5 — Dönüşüm ölçümü ve müşteri yönetimi

- [ ] **EDM-037 — Dönüşüm olay modelini kur.**
  - İlan görüntüleme, telefon tıklaması, WhatsApp tıklaması, başarılı form kaydı,
    randevu ve kapanan işlem ayrı olaylar olmalı.
  - Telefon/WhatsApp tıklaması gerçekleşmiş görüşme sayılmamalı.
  - Kabul: olay adları, alanları ve kişisel veri yaklaşımı belgelenir.

- [ ] **EDM-038 — Gizlilik odaklı dönüşüm ölçümünü uygula.**
  - Gerekli olmayan kişi takibinden kaçınılmalı; ölçüm çözümü EDM-019/020 sonucuyla
    uyumlu olmalı.
  - Sosyal kampanya bağlantılarında kaynak bilgisi taşınmalı.
  - Kabul: hangi sayfa ve kanalın başarılı talep ürettiği raporlanabilir.

- [ ] **EDM-039 — Talep yönetimine sorumlu ve takip tarihi ekle.**
  - Her açık talebin sorumlusu, sonraki işlem tarihi ve sonucu görünmeli.
  - Sahipsiz veya geciken talepler panelde öne çıkmalı.
  - Kabul: yeni talep takip sahibi olmadan unutulmaz.

- [ ] **EDM-040 — İşletme göstergeleri ekranını oluştur.**
  - Haftalık ilan görüntüleme, iletişim tıklaması, başarılı talep, nitelikli talep,
    randevu, kapanış, ilk yanıt süresi ve yanıtsız talep sayısı gösterilmeli.
  - Başlangıç verisi oluşmadan rastgele hedef yüzdeleri konmamalı.
  - Kabul: satış hunisi sayı ve oranları tanımlarıyla birlikte görülebilir.

- [ ] **EDM-041 — Bildirim teslimatını gözlemlenebilir yap.**
  - E-posta gönderimi başarısızsa talep kaydı korunmalı ve panelde uyarı oluşmalı.
  - Tekrar deneme veya alternatif bildirim akışı belirlenmeli.
  - Kabul: kaydedilmiş fakat bildirimi gitmemiş talep görünürdür.

### Faz 6 — SEO ve performans

- [!] **EDM-042 — Search Console başlangıç raporunu çıkar.**
  - Dizine giren URL'ler, sorgular, gösterim, tıklama, sayfa deneyimi ve yapılandırılmış
    veri sorunları incelenmeli.
  - Beklenen: Search Console hesabına salt okunur erişim veya dışa aktarılmış rapor.

- [ ] **EDM-043 — Kalıcı arama açılış sayfalarını tasarla.**
  - İlk adaylar: Silivri satılık daire ve Silivri arsa/tarla.
  - Her filtre kombinasyonu için ince, yinelenen sayfa üretilmemeli.
  - Kabul: sayfalar özgün içerik, doğru ilan listesi, kanonik adres ve iç bağlantı taşır.

- [ ] **EDM-044 — Yapılandırılmış veriyi Google araçlarıyla doğrula.**
  - LocalBusiness/RealEstateAgent, ilan ve breadcrumb şemaları kontrol edilmeli.
  - JSON sözdiziminin geçerli olması uygunluk için tek başına yeterli sayılmamalı.
  - İşletmenin kendisi hakkındaki yorumlar yıldız garantisi olarak görülmemeli.
  - Kabul: hata/uyarılar kayda alınır ve uygulanabilir olanlar çözülür.

- [ ] **EDM-045 — Gerçek kullanıcı performans ölçümünü kur.**
  - Mobil LCP, INP ve CLS gerçek kullanıcı verisiyle izlenmeli.
  - Kritik sayfalar: ana sayfa, ilan listesi, ilan detayı ve değerleme.
  - Kabul: optimizasyon öncesi başlangıç değeri ve sayfa bazlı dağılım vardır.

- [ ] **EDM-046 — Görsel ve istemci yükünü optimize et.**
  - Ekrana uygun `srcset/sizes`, görsel ölçüleri ve formatlar uygulanmalı.
  - Ortak hareket JavaScript'i düşük cihazlarda ölçülmeli; gereksiz iş azaltılmalı.
  - Liste büyüdüğünde sayfalama veya sunucu filtreleme değerlendirilmelidir.
  - Kabul: ölçülen performans iyileşir; tasarım ve azaltılmış hareket desteği korunur.

- [ ] **EDM-047 — Cloudflare HTML önbelleğini canlıda doğrula.**
  - `s-maxage` başlığına dayanarak önbelleğin çalıştığı varsayılmamalı.
  - Cache kuralı veya Cache API yaklaşımı, hit/miss ve bayat içerik davranışı ölçülmeli.
  - Senkron veya panel düzenlemesinden sonra tazeleme davranışı tanımlanmalı.
  - Kabul: tekrar isteklerde hit kanıtı ve güncelleme sonrası doğru içerik görülür.

### Faz 7 — Senkron, veri tabanı ve işletim dayanıklılığı

- [ ] **EDM-048 — Kısmi portal sonucuna karşı senkron emniyet freni ekle.**
  - Sıfır olmayan fakat olağandışı eksik liste, çok sayıda ilanı tek seferde
    pasifleştirmemeli.
  - Önceki aktif sayıya göre eşik ve ikinci başarılı doğrulama değerlendirilmeli.
  - Kabul: örneğin portal yalnızca ilk sayfayı döndürürse kalan portföy kapanmaz.

- [ ] **EDM-049 — Sürümlü D1 geçiş sistemi kur.**
  - Şema değişiklikleri senkron sırasında sessizce denenmek yerine sürümlü ve kayıtlı
    uygulanmalı.
  - Dağıtım öncesi şema uyumluluk kontrolü eklenmeli.
  - Kabul: hangi geçişin nerede uygulandığı bilinir ve hata görünürdür.

- [ ] **EDM-050 — Ayrı test ortamı ve test veritabanı oluştur.**
  - Form, senkron, panel yazma işlemleri ve şema geçişleri üretim verisi olmadan
    denenebilmelidir.
  - Kabul: kritik akışlar canlı müşteriye veya portföye dokunmadan uçtan uca test edilir.

- [ ] **EDM-051 — Kritik otomatik testleri ekle.**
  - Form hata/başarı akışı, kısmi senkron, satılık/kiralık istatistikleri, mobil galeri
    ve ClientRouter sonrası kurulum kapsanmalı.
  - Uygulamayı tekrar eden yüzeysel testler yazılmamalı.
  - Kabul: bu beş yüksek riskli bozulma dağıtımdan önce yakalanır.

- [!] **EDM-052 — D1 ve R2 yedekleme/geri yükleme prosedürünü doğrula.**
  - Mevcut Cloudflare yedekleme özellikleri ve saklama süreleri hesapta kontrol edilmeli.
  - Geri yükleme adımları belgelenip test ortamında denenmeli.
  - Beklenen: Cloudflare hesap ayarlarına erişim ve kabul edilen saklama hedefi.

- [ ] **EDM-053 — Senkron ve talep uyarılarını güçlendir.**
  - Senkron hatası, olağandışı ilan düşüşü, bildirim hatası ve bekleyen talep eşiği için
    anlamlı uyarılar oluşturulmalı.
  - Değişiklik yokken gereksiz bildirim gönderilmemeli.
  - Kabul: eylem gerektiren durum işletmeye zamanında ulaşır.

### Faz 8 — Sosyal medya ve ileri özellikler

- [ ] **EDM-054 — `postedm` ile canlı portföyü aynı veri kaynağına bağla.**
  - Bot bugün `site/data/listings.json` okuyor; canlı site D1 kullanıyor.
  - Sosyal paylaşım öncesi ilan aktifliği ve güncel fiyat canlı kaynaktan doğrulanmalı.
  - Kabul: pasif veya eski fiyatlı ilan otomatik paylaşılmaz.

- [ ] **EDM-055 — Sosyal yayın başarısını ve kaynak dönüşümünü ölç.**
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

- [x] **EDM-059 — 3 Büyük portal uyumlu detaylı ilan bilgisi ekleme, düzenleme ve görüntüleme mimarisi.**
  - Sahibinden, Hepsiemlak ve Emlakjet standartlarında tüm gayrimenkul türlerine (Konut, Arsa/Tarla, İş Yeri vb.) özel detaylı künye, imar/kadastro ve 100+ donanım alanı geliştirildi.
  - `/yonetim/ilan-ekle`, `/yonetim/ilan-duzenle/[id]` ve `/ilan/[slug]` sayfaları entegre edildi.
  - D1 SQLite şeması `ozellikler TEXT` ve `donanim TEXT` sütunları ile genişletildi; geriye dönük tam uyumluluk ve sıfır kesinti sağlandı.
  - Tamamlandı: 2026-09-10 — Mimari `site/src/lib/ilan-bilgileri.ts` ile modülerleştirildi, Astro SSR build başarıyla doğrulandı.

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
- E-posta teslimi ve Google yorumlarının üretim anahtarı doğrulanmadı.
- Cloudflare hesabındaki D1/R2 yedekleme ve HTML cache kuralları görülmedi.
- Güvenlik bölümü tam sızma testi, gizlilik bölümü hukuki uygunluk görüşü değildir.

## Çalışma günlüğü

### 10 Eylül 2026

- Canlı site, kaynak kodu, Git geçmişi, HTTP yanıtları ve 390 × 844 mobil görünüm
  incelendi.
- Site haritasındaki 64 URL salt okunur olarak kontrol edildi; tamamı HTTP 200 döndü.
- Ana iş listesi EDM-001–EDM-058 olarak oluşturuldu.
- EDM-001 iletişim formu başarı/hata akışı üzerinde çalışılmaya başlandı.
- EDM-059 kapsamında 3 büyük emlak portalındaki (Sahibinden, Hepsiemlak, Emlakjet) tüm ilan özellikleri, imar/kadastro verileri, donanım kataloğu (100+ onay kutusu) ve portal referansları modellendi. `site/src/lib/ilan-bilgileri.ts` kütüphanesi, `/yonetim/ilan-ekle`, `/yonetim/ilan-duzenle/[id]` ve `/ilan/[slug]` arayüzleri tamamlandı, D1 şeması sıfır kesintiyle genişletildi ve derleme doğrulandı.
