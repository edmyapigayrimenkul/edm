**EDM Yapı & Gayrimenkul — Web sitesi durum analizi ve öneriler**

İnceleme: 10 Eylül 2026. Canlı adres: [edmyapigayrimenkul.com](https://edmyapigayrimenkul.com/). Kaynak kodu, Git geçmişi, canlı sayfalar, HTTP yanıtları ve masaüstü/mobil tarayıcı davranışları birlikte incelendi. Değerlendirmeler bu tarihteki durumu anlatır.

**Genel değerlendirme**

Sitenin güçlü tarafı belirgin bir marka diliyle işleyen bir portföy altyapısını birleştirmesi. Astro, Cloudflare Worker, D1 ve R2 üzerine; otomatik ilan aktarımı, danışmanlar, bölge rehberi, müşteri talebi toplama ve içerik yönetimi kurulmuş. Mevcut tasarım korunmaya değer. Bir sonraki yatırımın ağırlığı form güvenilirliği, ilan verisinin doğruluğu, gerçek güven kanıtları ve dönüşüm ölçümü olmalı.

Görsel kalite ile işletme açısından olgunluk aynı seviyede değil. Örneğin, formların hata halinde başarı göstermesi müşteri kaybına; farklı türde fiyat ve metrekarelerin bir arada sunulması yanlış anlaşılmaya yol açabilir. Bu bulgular yeni özelliklerden önce ele alınmalı.

**Doğrulanan mevcut durum**

| Kontrol | Sonuç |
|---|---|
| Aktif portföy | 46 ilan: 41 satılık, 5 kiralık |
| Mülk grupları | 23 konut, 23 arsa/tarla |
| Bölgesel dağılım | Silivri 35; Edirne Merkez 4; Meriç 3; Enez, Marmaraereğlisi, Lalapaşa ve Malkara birer ilan |
| Ekip | 4 profil; portaldaki ilan eşleşmeleri Metin Özdoğan 31, Ercan Taşdemirler 13, Basri Çelik 2 |
| Son senkron | 10 Eylül, Türkiye saatiyle 06:01'de tamamlandı. Son 5 kayıtta hata veya başarısız ilan yok |
| Site haritası | 64 URL: 46 ilan, 7 bölge detayı, 4 danışman detayı, 7 temel sayfa |
| Erişim | Site haritasındaki 64 URL'nin tamamı HTTP 200 döndü |
| Temel SEO | 64 sayfanın her birinde tek H1, açıklama ve kendi URL'siyle eşleşen kanonik adres var. JSON-LD blokları JSON olarak ayrıştırılabiliyor |
| Yönlendirme | www adresi kök alan adına 301; `/404` sayfası gerçek 404 dönüyor |
| Yönetim giriş kapısı | Kimliksiz `/yonetim` isteği Cloudflare Access girişine yönleniyor |
| Tarayıcı davranışları | Kiralık filtresi, fiyat sıralaması, metin araması, mobil menü, favori ekleme/çıkarma, tam ekran galeri, sağ ok ve Escape kontrol edildi |
| Mobil kontrol | 390 × 844 ekran boyutunda ana sayfa, ilan listesi ve değerleme sayfasında sayfa düzeyinde yatay taşma görülmedi; ilan galerisinde aşağıda açıklanan sorun bulundu |
| Derleme | `npm run build` tamamlandı, çıkış kodu 0. Wrangler'ın çalışma alanı dışındaki günlük dosyasına yazmasında yerel izin uyarısı oluştu; derlemeyi durdurmadı |

Senkron verisi [canlı durum ucundan](https://edmyapigayrimenkul.com/api/senkron), sayfa listesi [site haritasından](https://edmyapigayrimenkul.com/sitemap.xml) kontrol edildi. Bu sayılar ziyaretçi veya satış sayısı değildir.

**Bugüne kadar yapılanlar**

Git geçmişi ve kodda şu gelişim görülüyor: kurumsal kimlik ve ilk site; yönetim paneli ve düzenlenebilir içerikler; arama, harita ve mobil galeri; manuel fotoğraf yükleme; görsel sıralama ve kapak yönetimi; toplu ilan işlemleri; görüntülenme sayacı; favoriler; sosyal paylaşım görselleri; sayfa geçişleri ve hareketler; ilan detay düzenlemeleri; Google yorumlarını çekme altyapısı.

Kodda yapılmış olması bütün bu özelliklerin üretimde uçtan uca doğrulandığı anlamına gelmiyor. Özellikle yönetim panelindeki kayıt işlemleri, bildirim e-postaları, Google API yapılandırması ve sosyal medya yayınları bu incelemede işlem yapılarak denenmedi.

**Öncelikli bulgular**

| Öncelik | Bulgu ve etkisi | Önerilen sonuç |
|---|---|---|
| P1 — ilk düzeltme | İletişim ve değerleme formları `fetch` yanıtını kontrol etmeden başarı ekranını açıyor; ağ hatasında da aynı akış sürüyor. Kullanıcı kaydedilmemiş bir talebin ulaştığını düşünebilir | Yalnızca başarılı kayıt yanıtında başarı gösterilsin. Hata halinde girilen bilgiler korunsun, yeniden deneme ve açık bir WhatsApp alternatifi sunulsun |
| P1 | Satılık ilan 19673570'in başlığı “Araptepe Mevkii Kiralık Full Lebiderya Villa”. Ayrı kiralık kayıt 19797428 de aynı başlığı taşıyor | İşlem türü, başlık, açıklama ve fiyat birlikte editör kontrolünden geçsin; iki ayrı satış/kiralama teklifi varsa açıkça ayrı sunulsun |
| P1 | Silivri rehberinde 20.000 ₺ aylık kira ile 147.935.000 ₺ satış bedeli aynı fiyat aralığında | Kiralık konut, satılık konut ve arsa/tarla istatistikleri ayrıştırılsın; kira değerleri `/ay` birimiyle gösterilsin |
| P1 | Kişisel bilgi toplanıyor, ancak ziyaretçi sayfalarında kapsamlı aydınlatma/gizlilik metni bağlantısı bulunamadı. Değerlemede tek bir genel izin cümlesi var | Gerçek veri akışına uygun aydınlatma metni, saklama yaklaşımı ve başvuru kanalı hazırlansın; hukuki dayanak ve gerekiyorsa rıza akışı uzmanla netleştirilsin |
| P2 — yakın dönem | Mobil galeride 2–5. fotoğraf düğmeleri 390 px ekranda yaklaşık 13 × 9,75 px. Tam ekran galeri çalışıyor ama yatay şeritte küçük fotoğraflar kullanışsız | Galerinin mobil CSS kuralları düzeltilsin; küçük fotoğraflar da kaydırılan geniş kartlar haline gelsin |
| P2 | Ana sayfadaki 207 “dönüm arazi”, tüm ilanların m² alanlarından hesaplanıyor; konutlar da dahil | Arazi kategorisi ayrı hesaplansın. Mevcut arsa/tarla kayıtlarının m² toplamı 198.466; bu da benzersiz fiziksel parsel toplamı olarak ayrıca doğrulanmalı |
| P2 | “Yerinde görmek istiyorum” bağlantısı yalnızca `/iletisim` adresine gidiyor | İlan kimliği ve başlığı formda taşınsın, randevu talebi ilgili ilana bağlansın |
| P2 | Mobil filtreler tek yatay satırda; bütçe, m² aralığı, oda ve arsa/tarla alt türü için ayrı kontroller yok | Öncelikle fiyat aralığı ve mahalle; ardından oda, net/brüt alan ve arazi türü filtreleri eklensin |
| P2 | Görüntülenme sayılıyor; telefon, WhatsApp, form ve randevuya dönüşüm için bütünleşik ölçüm görünmüyor | İlan görüntüleme → iletişim tıklaması → kayıtlı talep → randevu → kapanış zinciri ölçülsün |

Form bulgusunun kaynakları: [iletişim akışı](/Users/macbook/Dogukan/edm/site/src/pages/iletisim.astro:399), [değerleme akışı](/Users/macbook/Dogukan/edm/site/src/pages/degerleme.astro:463). Canlıya sahte müşteri bilgisi veya test mesajı gönderilmedi; başarısız gönderim davranışı koddan doğrulandı. Boş değerleme formunda zorunlu alan kontrolü tarayıcıda denendi.

Galeri sorununun nedeni kaynak kodunda da görülüyor: mobil `.galeri-yan { display: contents; }` kuralını daha sonra gelen `.galeri-yan { display: grid; }` eziyor. Ayrıca genişlik kuralı yalnızca şeridin doğrudan çocuğu olan ilk düğmeye uygulanıyor. Kaynak: [Galeri.astro](/Users/macbook/Dogukan/edm/site/src/components/Galeri.astro:120).

Fiyat aralığı ve alan hesabı: [bolgeler.ts](/Users/macbook/Dogukan/edm/site/src/lib/bolgeler.ts:94), [ilanlar.ts](/Users/macbook/Dogukan/edm/site/src/lib/ilanlar.ts:464).

**Site bölümleri ve ticari kullanım**

| Kategori | Yapılanlar / güçlü taraf | Eksik veya geliştirme | Somut tavsiye |
|---|---|---|---|
| Marka ve tasarım | Kırmızı, koyu gri ve açık zemin tutarlı. Tipografi belirgin; “Silivri’de ev, Trakya’da toprak” konumlandırması portföyle uyumlu | Gerçek ofis ve çalışma fotoğrafları, kurumsal kimliği daha inandırıcı kılabilir. Küçük ve soluk etiketlerin okunurluğu ölçülmeli | Tasarımı koruyun; gerçek ofis/ekip görselleri, okunaklı ikincil metinler ve ilan fotoğraf standardı ekleyin |
| Ana sayfa | Canlı portföy sayıları, hızlı filtreler, seçili ilanlar, hizmetler, süreç, ekip ve değerleme çağrısı mevcut | Öne çıkanlarda pahalı villalar belirgin. Broker kartında “0 ilan” işletmedeki rolünü zayıf anlatıyor. “207 dönüm” hesabı sorunlu | Daire, villa ve araziyi dengeli seçin; broker kartında portföy yönetimi rolünü öne çıkarın; sayısal iddiaları veri tanımıyla uyumlu yapın |
| İlan listesi | İşlem/tür/ilçe filtreleri, arama, sıralama, favori ve boş sonuç ekranı çalışıyor | Bütçe ve temel mülk özellikleri için filtre eksik. Mobilde bazı filtreler ekranın sağına gizleniyor. Açıklamada “Fiyat, metrekare ... filtreleyin” denmesine rağmen bunlar yalnızca sıralanabiliyor | Sayı aralıkları ekleyin; mobilde filtre paneli ve seçili filtre özeti kullanın; “Merkez” etiketini “Edirne Merkez” yapın |
| İlan detayı | Fiyat üstte; galeri, açıklama, özellikler, benzer ilanlar, kaynak bağlantısı, danışman ve iletişim mevcut | Kaynak metindeki yazım hataları ve veri çelişkileri taşınıyor. 19802542'de açıklama site içinde derken özellik “Site İçerisinde: Hayır” diyor. Bazı villalarda arsa/brüt/net ayrımı belirsiz | Her ilan için kısa editör kontrolü; net alan, brüt alan ve arsa alanını farklı etiketlerle gösterin. Karttaki m² fiyatının hangi alana dayandığını belirtin |
| Görsel kalite | Çok fotoğraflı portföy; panelden kapak, sıra, gizleme ve yükleme altyapısı | Örnek canlı fotoğrafta Emlakjet filigranı görülüyor. Mobil küçük fotoğraflar bozuk; farklı oranlar bütünlüğü azaltıyor | Haklarına sahip olduğunuz orijinal fotoğrafları kullanın; benzer kadraj/kapak standardı belirleyin; filigranı silmek yerine özgün kaynak görselleri yükleyin |
| Harita | Yaklaşık bölge gösterimi ve haritada aç bağlantısı var; harita gerektiğinde yükleniyor | Gerçekte merkez etrafına daire çizildiği halde notta “mahalle sınırını gösterir” yazıyor | “Mahallenin yaklaşık konumunu gösterir” olarak netleştirin; sınır geometrisi olmayan bir daireyi idari sınır gibi sunmayın |
| Danışmanlar | Dört ayrı profil, uzmanlıklar ve kişiye bağlı ilanlar mevcut; broker profilinde rolü açıklanıyor | İki danışmanda portre yerine baş harfler var. Profil bağlantıları ortak telefon/WhatsApp'a gidiyor | Eksik portreleri tamamlayın; ortak hattın yönlendirme sürecini belirleyin veya gerçekten kullanılan kişisel iş hatlarını bağlayın; deneyim bilgilerini doğrulanabilir şekilde zenginleştirin |
| Hakkımızda ve hizmetler | Kuruluş, yaklaşım ve tapuya kadar çalışma süreci açık | Hizmetler çoğunlukla kısa tanıtım metni. Deneyimi gösteren özgün vaka, örnek çalışma ve yetki belgesi bilgisi görünür değil | Gerçek ofis fotoğrafları, yayımlanması uygun belge bilgileri ve izinli/anonim örnek vakalar ekleyin. Önce değerleme ve arazi danışmanlığı hizmetlerini derinleştirin |
| Bölge rehberi | Yedi bölge; portföyden hesaplanan sayılar ve istek fiyatı açıklaması var | Kısa metinler yerel uzmanlığı yeterince açmıyor; kira/satış karışıyor. Bazı bölgelerde yalnızca bir ilan var | İşlem ve mülk türünü ayırın, örnek sayısını yazın. “EDM portföyündeki ... ilan” çerçevesini koruyun; bölgenin piyasa ortalaması iddiasına dönüştürmeyin. Mahalle bazında özgün bilgi ekleyin |
| Değerleme | Düşük sürtünmeli talep formu, anlaşılır süreç ve aynı gün dönüş vaadi | Otomatik değerleme veya rapor üretimi kodda yok; form ekibe talep iletiyor. Sunucu tarafı kontrol yalnızca ad/telefon etrafında; form hataları yanlış başarıya dönüşüyor | Önce güvenilir kayıt, sonra standart tek sayfalık rapor ve teslim takibi. Aynı gün ve gerçekleşmiş satış verisi vaatleri işletmenin gerçek kapasitesiyle doğrulansın; hizmetin kapsamı açık yazılsın |
| İletişim ve randevu | Telefon, sabit hat, WhatsApp, e-posta, adres ve form mevcut | İlan bağlamı forma taşınmıyor. “Ofiste kimse varsa” gibi ifadeler profesyonel tonu zayıflatıyor | İlana bağlı randevu talebi, ulaşılabilir saatler ve nöbetçi sorumlu akışı kurun; metni sadeleştirin |
| Favoriler ve paylaşım | Üyeliksiz kaydetme ve kaldırma çalışıyor. Web paylaşımı ve yönetimde görsel üretimi var | Liste yalnızca tarayıcıda; tüm favorileri ofise tek adımda aktarma yok | Önce seçili ilanları tek mesajda paylaşma. Kullanıcı hesabı, ancak tekrar gelen ziyaretçi ihtiyacı verilerle görülürse düşünülsün |
| Google yorumları | Çekme, saklama ve gösterme altyapısı yazılmış | İncelenen canlı ana sayfada yorum bölümü görünmüyor. Üretimde Google anahtarının durumu doğrulanmadı | Mevcut gerçek yorumları doğru işletme eşleşmesi ve gerekli atıflarla etkinleştirin; sahte yorum üretmeyin. Varlığını API yapılandırmasından ve canlı içerikten birlikte doğrulayın |
| Yönetim ve müşteri takibi | İlanlar, görseller, ekip, yorumlar, metinler, ayarlar, talepler ve paylaşım ekranları kodda mevcut. Talepte durum/not/ilgilenen/kapanış tutuluyor | Panel kayıt akışları bu incelemede denenmedi. Danışman bazında yetki ayrımı ve kapsamlı işlem geçmişi görünmüyor | İş yüküne göre talep sorumlusu ve takip tarihi; sonraki aşamada rol bazlı izin, işlem geçmişi ve gerektiğinde geri alma |
| Sosyal medya bağlantısı | Ayrı `postedm` projesi ve site içinde paylaşım görseli aracı mevcut | Bot okuyucusu `site/data/listings.json` dosyasından besleniyor; canlı site D1 kullanıyor. Otomatik olarak aynı güncel veriye baktıkları doğrulanmadı | Yayın öncesi canlı ilan durumunu/fiyatını doğrulayan ortak veri kaynağı kurun; kampanya bağlantılarına kaynak parametreleri ekleyin. Botun yayın başarısı ayrıca denetlenmeli |

Sosyal medya veri kaynağı bulgusu [fetch_listings.py](/Users/macbook/Dogukan/edm/postedm/src/fetch_listings.py:18) ve [yapılandırmada](/Users/macbook/Dogukan/edm/postedm/config.yaml:78) görülüyor. `postedm` ayrı depodur; burada yalnızca siteyle veri bağlantısı incelendi.

**Portföy kategorilerine özel öneriler**

Sayılar sitedeki kayıt sayısıdır; benzersiz mülk sayısı olarak yorumlanmamalıdır.

| Portföy kategorisi | Mevcut sayı | Öncelikli içerik/işlev |
|---|---:|---|
| Satılık daire | 6 | Net/brüt alan, oda, kat, asansör, aidat, otopark ve kullanım durumunu standartlaştırın; bütçe ve oda filtresi sağlayın |
| Satılık villa | 10 | Arsa alanını kapalı alandan ayırın; kat planı, havuz/bahçe bilgisi ve özgün video ekleyin |
| Satılık müstakil ev | 2 | Yapı alanı, arsa alanı ve mevcut kullanım bilgisini açık ayırın; belirsiz tek “m²” sunumunu kaldırın |
| Kiralık daire | 3 | Aylık bedel, depozito, aidat, eşya ve müsaitlik tarihini birlikte gösterin |
| Kiralık villa | 2 | Süreli/yıllık kiralama koşullarını, aylık bedeli, depozitoyu ve müsaitlik durumunu belirtin |
| Satılık tarla | 16 | Toplam parsel ve satılan hisse alanı, tapu türü, erişim ve doğrulanmış nitelikleri ayrı alanlara dönüştürün; ilan metnindeki iddiaların kontrol tarihini tutun |
| Villa imarlı arazi | 5 | İmar bilgisi, dayanak belge ve güncelleme tarihini doğrulayarak sunun; tarla ile tek filtrede kalmasın |
| Toplu konut için arazi | 2 | Daha ayrıntılı, kontrollü erişilen sunum dosyası ve yatırımcı görüşme talebi hazırlayın; bilgileri belgeyle destekleyin |
| İş yeri/ticari mülk | 0 | Değerleme formunda destekleniyor, aktif portföyde yok. İçerik veya ilan olmadan boş kategori büyütmeyin |

Arazi, mevcut kayıtların yarısını oluşturuyor. İçerik ve arama geliştirmelerinde tapu türü, satılan hisse alanı ve arazi niteliğinin belirginleşmesi markanın “toprağı bilen ofis” vaadini somutlaştırır. Bunlar mülklerin hukuki niteliğine ilişkin bir tespit değil, doğrulanmış bilginin siteye nasıl aktarılacağına yönelik önerilerdir.

**SEO, performans ve teknik sürdürülebilirlik**

| Alan | Mevcut durum | Öneri |
|---|---|---|
| Teknik SEO | Sunucuda üretilen içerik, sitemap, robots, kanonik adres, sosyal paylaşım etiketleri ve şemalar mevcut | Search Console'da dizine giren sayfalar ve sorgular incelensin. Bu denetim Google sıralaması veya trafik başarısı ölçmedi |
| Yinelenen içerik | İki başlık çifti bulundu: Araptepe villa ve Yıldırım Beyazıt 9.456 m² tarla | Gerçekten ayrı teklifler mi, mükerrer kayıtlar mı doğrulayın; ayırıcı başlık ve açıklama kullanın. İnceleme olmadan ilan silmeyin |
| Yerel arama | Yedi rehber sayfası mevcut; ilan filtrelerinin kanonik adresi `/ilanlar` | Önce Silivri satılık daire ve Silivri arsa/tarla için özgün içerikli, kalıcı sayfalar değerlendirin. Her filtre kombinasyonu için ince içerikli sayfa üretmeyin |
| Yapılandırılmış veri | JSON sözdizimi kontrolleri geçti | Şema türleri/alanları ayrıca doğrulansın; JSON'un geçerli olması Google özelliklerine uygunluğu tek başına kanıtlamaz. Yorum eklemeyi arama sonuçlarında yıldız garantisi olarak görmeyin |
| Ölçülen yanıtlar | 64 URL HTTP 200. Tek taramada ilk bayt süreleri yaklaşık 0,05–0,57 sn; ilan listesi HTML yanıtı yaklaşık 255 KB | Bunlar tek ağdan sunucu yanıtı ölçümleri; mobil açılış veya Core Web Vitals sonucu değildir. Gerçek mobil LCP/INP/CLS verisi toplayın |
| İstemci yükü | Ortak hareket JavaScript dosyası derlemede yaklaşık 139 KB sıkıştırılmamış. Yerel fontlar, lazy loading ve haritanın gecikmeli yüklenmesi olumlu | Animasyon yükünü cihaz ölçümüyle değerlendirin; liste büyüdüğünde sayfalama ve sunucu filtreleme düşünün; resim boyutlarını ekrana uygun üretin |
| Önbellek | HTML'de `s-maxage=3600` başlığı var; kodda açık Cache API akışı görülmedi, alınan yanıtta cache hit kanıtı yok | “Bir saat Cloudflare önbelleği” varsayımı canlı cache ölçümüyle doğrulansın. Başlık tek başına Worker tarafından üretilen HTML'in kenarda saklandığını kanıtlamaz |
| Senkron güvenilirliği | Günde dört aktarım; boş cevap tüm ilanları kapatmıyor; detayda okunamayan kimlikler korunuyor; elle eklenen ilanlar ayrı tutuluyor | Kısmi ofis listesi gelirse toplu pasifleştirmeyi durduran eşik ve ikinci doğrulama ekleyin. Şu an sıfır kayıt koruması var; eksik fakat sıfır olmayan listenin aynı koruması yok |
| Şema yönetimi | Şema değişimleri senkron sırasında uygulanıyor; bazı hatalar sessizce yutuluyor | Sürümlü veritabanı geçişleri, dağıtım öncesi şema kontrolü ve ayrı test veritabanı oluşturun |
| Kalite güvencesi | Derleme çalışıyor; site paketinde test/lint komutu yok | Formun hata halinde başarı göstermemesi, kısmi senkron, satılık/kiralık ayrımı, mobil galeri ve sayfa geçişleri için az sayıda kritik test ekleyin |
| Yedekleme ve işletim | Worker gözlemlenebilirliği açık; senkron günlüğü ve e-posta özeti kodda var | D1 ve R2 geri yükleme prosedürünü belgeleyip test edin; Cloudflare hesabındaki mevcut yedekleme ayarları bu incelemede doğrulanmadı. Hata ve bekleyen talep uyarılarını ölçülebilir hale getirin |

Cloudflare önbellek değerlendirmesinin teknik dayanağı [Workers önbellek belgeleridir](https://developers.cloudflare.com/workers/reference/how-the-cache-works/). Google, yapılandırılmış verinin görünür arama özelliklerini garanti etmediğini ve işletmenin kendisi hakkındaki yorumlar için sınırlamalar bulunduğunu açıklar: [LocalBusiness belgeleri](https://developers.google.com/search/docs/appearance/structured-data/local-business).

**Güvenlik, gizlilik ve erişilebilirlik**

Cloudflare Access ve uygulamadaki imza doğrulaması iyi bir başlangıç. Yönetim sayfaları ortak giriş kontrolünü çağırıyor; fotoğraf yüklemelerinde tür/boyut sınırı, görsel aracısında izinli sunucu listesi ve sorgularda parametre bağlama var. Ana sayfada `nosniff`, çerçeveleme kısıtı ve referrer politikası görüldü. Bunlar tam bir sızma testi sonucu değildir.

Öncelikle talep uç noktasında telefon normalizasyonu, alanların sunucuda doğrulanması ve gerçek bir hız sınırı uygulanmalı. Mevcut önlem, aynı telefonun iki dakika içinde yeniden yazılmasını engelliyor; farklı telefonla gelen yoğun isteği sınırlandırmıyor. E-posta bildirim hatasının kullanıcı kaydını kaybettirmemesi doğru, ancak hata işletmeye görünür olmalı.

İkinci aşamada yönetim kimliği doğrulamasında beklenen audience eksikken erişimin kesin olarak kapanması ve issuer kontrolü; rol bazlı izinler; yazma işlemlerinin kaydı; senkron anahtarının URL parametresiyle taşınmasının kaldırılması önerilir. Mevcut üretim audience yapılandırması dosyada var; burada bildirilen nokta yanlış yapılandırmaya karşı dayanıklılıktır, doğrulanmış bir izinsiz erişim değildir.

Değerleme formundaki “Bilgiler üçüncü kişilerle paylaşılmaz” cümlesi, kullanılan Cloudflare/e-posta sağlayıcıları ve gerçek veri akışıyla birlikte ele alınmalı. Aydınlatmanın kapsamı, veri sorumlusu, amaç, hukuki sebep, aktarım ve haklar bakımından açıklanmalı. Aydınlatma ile gerekiyorsa açık rıza işlemleri birbirinden ayrılmalı. Bu konuda [KVKK'nın resmi açıklaması](https://www.kvkk.gov.tr/Icerik/6709/2019-206) esas alınarak hukuki inceleme yapılmalı; bu rapor hukuki uygunluk belgesi değildir. Takip teknolojileri envanteri çıkarılmadan otomatik olarak her ziyaretçiye çerez onayı eklemek bir çözüm sayılmamalı.

Erişilebilirlikte sayfa dili, içeriğe geç bağlantısı, etiketli form alanları, galeri için `dialog` kullanımı ve azaltılmış hareket desteği olumlu. Ancak boş form testinde dört alan hatalı işaretlenirken `aria-invalid` eklenmedi. Hata metniyle alan bağlantısı ve sonuç sayacı için erişilebilir bildirim eksik. Onay kutusunun hata görünümü de diğer alanlarla aynı yapıya bağlı değil. Mobil fotoğraf hedefleri büyütülmeli, klavye odağı ve düşük kontrastlı metinler ayrıca ölçülmeli. Bu inceleme tam WCAG uygunluk denetimi değildir.

**Önerilen uygulama sırası**

| Zaman / öncelik | İş paketi | Tamamlandığını nasıl anlayacağız? |
|---|---|---|
| İlk 1–3 iş günü | Form başarı/hata akışı, mobil galeri, kira/satış fiyat aralığı, arazi alanı hesabı | Başarısız kayıt başarı göstermiyor; mobil fotoğraflar kullanılabilir; farklı birimler aynı istatistiğe girmiyor |
| İlk hafta | 46 ilanın içerik kontrolü, aynı başlıklı kayıtların teyidi, aydınlatma metni çalışması, ilan bağlamının randevu formuna taşınması | Her ilanda işlem türü/alan/fiyat tutarlı; form hangi ilanla ilgili olduğunu biliyor; ziyaretçi veri kullanımını okuyabiliyor |
| İkinci hafta | Bütçe ve mahalle filtreleri, eksik ekip portreleri, gerçek ofis görselleri, gerçek yorumların etkinleştirilmesi, temel dönüşüm olayları | Arayan kişi uygun ilanı daha kolay buluyor; hangi sayfa ve kanalın talep ürettiği raporlanıyor |
| Üçüncü–dördüncü hafta | Özgün yerel içerik, örnek değerleme raporu, talep sorumlusu/takibi, kritik testler, şema ve geri yükleme süreci | İçerik düzenli güncelleniyor; talepler sahipsiz kalmıyor; sürüm öncesi kontroller ve geri dönüş adımları çalışıyor |
| Sonraki aşama | Sosyal botla ortak canlı veri, gelişmiş arazi filtreleri, seçili ilan listesini paylaşma | Yanlış/eski fiyatlı sosyal paylaşım önleniyor; kullanıcı ihtiyacına göre yeni özellikler ekleniyor |

Bunlar iş sırası önerileridir; teslim taahhüdü değildir. Hukuki metinler, gerçek fotoğraflar ve işletme verileri ilgili kişilerin katkısına bağlıdır.

**Takip edilecek işletme ölçüleri**

Haftalık olarak ilan bazında görüntüleme, telefon/WhatsApp tıklaması, başarılı form kaydı, nitelikli talep, randevu ve sonuçlanan işlem sayıları izlenmeli. Telefon veya WhatsApp tıklaması gerçekleşmiş görüşme olarak sayılmamalı. İlk yanıt süresi, yanıtsız talep sayısı, form hata oranı ve senkron başarısızlığı da aynı tabloda görülmeli. Başlangıç verisi oluşmadan dönüşüm veya trafik hedefi için rastgele yüzde koymak doğru olmaz.

**İncelemenin sınırları**

Kaynak kodu ve canlı durum birlikte incelendi; üretim kodu, veri tabanı ve yayımlanan içerikler değiştirilmedi. Favori testinde eklenen tek ilan geri çıkarıldı. Formlarda gerçek/test müşteri mesajı gönderilmedi, yönetim içindeki yazma işlemleri denenmedi. Search Console, reklam hesapları, gerçek kullanıcı performansı, analitik raporları, e-posta teslim kayıtları ve Cloudflare hesap ayarlarına girilmedi. Bu nedenle satış başarısı, arama sıralaması, tüm güvenlik kontrolleri, yedeklerin durumu ve bildirim teslimatı hakkında kesin sonuç çıkarılmadı.

Bu raporun önerdiği ana yatırım, mevcut tasarımın korunarak güvenilir müşteri talebi toplama ve doğru ilan sunumu etrafında geliştirilmesidir.
