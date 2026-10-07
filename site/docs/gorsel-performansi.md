# Görsel yükü — 3 Ekim 2026

## Ölçüm ve sınırı

Ana sayfa, ilan listesi ve 18693270 numaralı dairenin herkese açık HTML'i
incelendi. Bu üç sayfadaki 33 benzersiz Hepsiemlak fotoğrafının iki sürümü
HTTP üzerinden indirildi; piksel ölçüleri Sharp ile doğrulandı:

| Boyut kutusu | Toplam gövde boyutu |
| --- | ---: |
| 1280 × 960 | 23.503.144 bayt |
| 640 × 480 | 6.785.054 bayt |

Küçük sürümler %71,1 daha hafif. Bu, bütün sayfanın indirdiği veri veya
LCP iyileşmesi değildir: lazy yükleme, tarayıcı önbelleği ve ekran yoğunluğu
hangi dosyaların indirileceğini değiştirir. Yüksek yoğunlukta özgün sürüm
seçilebilir. Daire kapak örneği 710.318 → 206.079 bayt.

Kanıt: `raporlar/performans-2026-10-03/gorsel-baslangic.json`.
Google PageSpeed API bu turda 429 günlük kota yanıtı verdi; hız puanı yok.
Gerçek kullanıcı LCP/INP/CLS başlangıcı ve dağılımı EDM-045 kapsamında açık.

## Uygulama

- İlan kartı, ana sayfa şeridi ve galeri küçük fotoğrafları 640 × 480
  kutusundaki sürümü; büyük masaüstü kapak 960 × 720 sürümünü sunar.
- `srcset` yoğunluk seçenekleriyle en fazla mevcut 1280 × 960 sürümüne çıkar.
  Mobil kapak `<picture>` üzerinden küçük sürümü seçer. Yeni ücretli görsel
  servisi veya dönüşüm bindingi açılmadı.
- Servis fotoğrafı kutuya sığdırır; dikey fotoğrafın gerçek genişliği kutunun
  genişliğinden küçüktür. Bu nedenle tahmini `w` tanımları ve onlara bağlı
  `sizes` yerine orantılı `x` tanımları kullanılır. Küçük kutuların 640 tabanı,
  9:16 fotoğrafların aşırı küçülmesini önler. Düzen alanı mevcut CSS
  `aspect-ratio` ve masaüstü galeri ızgarasıyla ayrılır; uydurma doğal ölçü yok.
- Yalnız doğrulanan HTTPS Hepsiemlak sunucusu ve yol biçimi dönüştürülür.
  Bu ilk aşamada R2, Emlakjet, imzalı ve bilinmeyen adresler özgün kaldı;
  Emlakjet için aşağıdaki ikinci aşama uygulandı.
- Kapalı tam ekran galeri `src` içermez. Kullanıcı açınca özgün fotoğraf
  ve bir sonraki fotoğraf yüklenir. Açılan fotoğraflar küçültülmez.
- Favorilerde gizli kartların `src` ve `srcset` adresleri bekletilir;
  yalnız kayıtlı kart açıldığında birlikte atanır.

Yaklaşım kaynağı: [web.dev — Responsive images](https://web.dev/learn/design/responsive-images).

## Doğrulama

181 test geçti; son çözünürlük ayarından sonra ilgili 7 test yeniden geçti.
Derleme başarılı. Yerel eski portföy kopyasında yalnız bir test kaydına güncel
herkese açık görseller bağlanarak galeri kontrol edildi; canlı veri değiştirilmedi.
Mobil 390 × 844 ve masaüstü 1280 × 800 düzeninde yatay taşma yok. Galeri açma,
ileri/geri ve Escape çalıştı. Favorilerde bir açık kartın `srcset` yüklemesi
ve diğer kapalı kartların adres içermemesi doğrulandı; deneme favorisi kaldırıldı.

Fiziksel düşük güçlü cihaz ölçümü, R2 için boyutlandırma, yeni
formatlar ve büyük portföy için sunucu filtreleme/sayfalama henüz tamamlanmadı.
EDM-046 bu nedenle kısmi durumda kalır.

## Canlı sonuç

Son staging sürümü `9a5b21a9-ead7-4ae2-97a8-fd5ad8f802f3`; Access kapısı
doğrulandı. Üretim sürümü `32f939a0-b23b-4e07-864e-47bc8b2a9018`.
Dağıtım kapısı 0011'i uygulamadı ve yeni CRM sonucu kaydı kapalı kaldı.
Kaynak ve derlemede gerçek sır eşleşmesi sıfır.

Yedi canlı HTTP kontrolü: beş herkese açık sayfa 200; senkron durumu 200/no-store;
panel Access 302/private-no-store. Listede 48 kartın 29'u doğrulanan portal
boyut servisini kullanıyor; diğer kaynaklara müdahale edilmedi. Favorilerde
29 `data-srcset`, sıfır etkin `srcset`; kapalı galeri başlangıçta kaynak içermiyor.

Canlı tarayıcıda mobil kapak 640×480, masaüstü kapak 960×720 kutusundaki
dosyayı seçti. Masaüstü küçük fotoğraflar 640×480 sürümünde yüklendi.
Mobilde henüz görünmeyen şerit fotoğrafları lazy durumda kaldı. Tam ekran
15 fotoğraflı galeri açıldı, sonraki fotoğraf sayacı 2/15 oldu; özgün
1280×960 adresi kullanıldı. İki boyutta yatay taşma ve kaydedilen konsol
hatası yok. Normal HTTP isteklerinde MISS → HIT → HIT ve her yanıtta yeni
görsel sunumu doğrulandı.

Kanıtlar aynı rapor klasöründeki `canli-http.json`, `canli-tarayici.json`,
`canli-onbellek.json` ve iki ekran görüntüsü. Geçici yerel görsel değişikliği
geri alındı; deneme favorisi ve tarayıcı sekmeleri temizlendi.

## Emlakjet — aynı gün ikinci iyileştirme

Emlakjet'in [EDM ofis sayfasında](https://www.emlakjet.com/emlak-ofisleri/edm-yapi-gayrimenkul-1015383)
kullandığı `/resize/640/0/listing/...` adresi doğrulandı. Canlı listede
Hepsiemlak dışında kalan 19 kapak için özgün, 640, 960 ve 1280 genişlik
istekleri indirildi; 76 yanıtın tamamı 200 ve çözümlenebilir görseldi.
Piksel ölçüleri Sharp ile okundu; fotoğraflar düzenlenmedi.

| Sürüm | 19 fotoğraf toplamı | Özgüne göre azalma |
| --- | ---: | ---: |
| Özgün | 4.322.452 bayt | — |
| 640 genişlik isteği | 1.646.705 bayt | %61,9 |
| 960 genişlik isteği | 2.829.834 bayt | %34,5 |

Bu sayı toplam sayfa yükü veya LCP sonucu değildir. CDN `Accept` başlığına
göre farklı biçimler sunabilir; uzantıya bakarak WebP/AVIF garantisi verilmez.
Özgün genişlikler 800–1600 arasındaydı; 960 isteği bazı fotoğraflarda 800
piksel döndü. Bu nedenle Emlakjet için gerçekte var olmayan `960w` veya
kesin `2x` dosya ölçüsü yazılmadı. `picture` ekran yoğunluğu sorgusu kullanır:

- Kart, şerit ve mobil galeri 640; en az 1,5 dppx ekranlarda 960 isteği.
- Masaüstü ana galeri 960; en az 1,5 dppx ekranlarda özgün fotoğraf.
- Tam ekran galeri her zaman özgün fotoğrafı açar.
- Emlakjet HTTPS sunucusu ve ilan dosya biçimi dışında dönüşüm yok;
  imzalı, kullanıcı bilgisi içeren, farklı portlu veya bilinmeyen yollar korunur.
- Gizli favorilerde hem `img` hem `source` adresleri bekletilir.

Yerel in-app tarayıcıda küçük Emlakjet fotoğrafı doğrudan bir sekmede açıldı,
ancak sayfaya gömülü yüklemede `naturalWidth=0` görüldü. Ayrı yerel A/B
sayfasında yalnız `img`, `img+srcset`, `picture` ve Referer göndermeyen
`img` de aynı sonucu verdi. `picture` tek başına neden olarak gösterilemez;
tarayıcı ağ yanıtı yakalanmadığından kök neden doğrulanmış değildir.

Küçük sürüm yüklenemezse `source` seçimleri ve `img.srcset` kaldırılarak
özgün fotoğraf bir kez denenir. Özgün de başarısız olursa döngü oluşmaz.
Bu dönüş yerel villa galerisinde 1600 piksel fotoğrafın açılmasıyla doğrulandı.
Mobil 390×844 ve masaüstü 1280×800 taşma kontrolü geçti. Yerel favorilerde
yalnız deneme kartı açıldı, diğer gizli kartlarda etkin kaynak sayısı sıfırdı;
deneme favorisi kaldırıldı. Fiziksel yüksek yoğunluklu cihaz testi yapılmadı.

190 testin tamamı geçti; son derleme başarılı. Kaynak ve derlemede gerçek
sır eşleşmesi sıfır. Ölçüm: `raporlar/performans-2026-10-03/emlakjet-boyutlar.json`.

Son staging `5d8db762-cd1d-4a8f-892a-ffe28e3df6c2` (Access 302), üretim
`758b217e-84f7-4b58-8861-80368537c7fa`. Ana sayfa, liste, favoriler ve villa
200; senkron 200/no-store; panel 302/private-no-store. 48 kartın tamamında
doğrulanan portal boyut sunumu var (29 Hepsiemlak, 19 Emlakjet). Favorilerde
19 Emlakjet adresi `data-src/data-srcset` içinde, etkin kaynak sayısı sıfır.
Kapalı tam ekran galeri kaynak içermiyor. HTTP kanıtı:
`raporlar/performans-2026-10-03/emlakjet-canli-http.json`.

Canlı mobil kart ve galeri de Emlakjet'in küçük sürümünden özgün 1600
piksel fotoğrafa döndü. Dolayısıyla bu tarayıcıda %61,9 gerçek indirme
kazancı doğrulanmadı; başarısız küçük isteğin ek yükü de olabilir. Galeri
açma, sonraki fotoğraf sayacı 2/10 ve kapatma çalıştı; mobil/masaüstü
yatay taşma ve kaydedilen konsol hatası yok. Deneme favorisi kaldırıldı,
gizli kartların etkin kaynak sayısı sıfır olarak kaldı. Emlakjet gömülü
fotoğraf yükleme sorununun gerçek ağ yanıtıyla tanısı açık bir sonraki
adımdı; aşağıdaki üçüncü aşamada aynı tarayıcıdaki yükleme düzeltildi.

## Emlakjet — sitenin kendi adresinden sunum

Doğrudan CDN gömülmesi bu tarayıcıda başarısız olduğu için küçük dosyalar
`/foto/emlakjet/640/listing/...` ve `/foto/emlakjet/960/listing/...` üzerinden
sunuluyor. Worker sabit Emlakjet sunucusundan dosyayı alır; dönüştürme yapmaz.
Yalnız doğrulanan ilan dosyası yolu ve iki boyut kabul edilir. Başka URL,
boyut, sorgu parametresi ve yönlendirme izlenmez. Kullanıcı Cookie ve
Authorization başlıkları yukarı taşınmaz; CDN çerezi aşağı verilmez.
Yanıt türü denetlenir; 8 saniye ve akış sırasında 3 MB sınırı vardır.
Başarısız fotoğraf saklanmaz; tek denemelik özgün kaynak dönüşü korunur.

Cloudflare'ın desteklemediği `redirect: error` yerel gerçek Worker kontrolünde
yakalandı ve `manual` olarak düzeltildi. 3xx yanıtı başarısız sayılır; başka
sunucuya otomatik gidilmez. Fotoğraflar tarayıcıda bir gün, Cache API'de
yedi gün saklanır. Staging'deki yeni yol da Access tarafından korunur.

193 test geçti. Son akış boyut sınırı ve yönlendirme kontrolünden sonra
ilgili 15 test yeniden geçti; son derleme başarılı. Üretim dağıtımı öncesi
ve sonrası kaynak/derleme gerçek sır eşleşmesi sıfır. 0011 CRM geçişi
ertelenmeye devam etti; veritabanı şeması değiştirilmedi.

Son staging `143e27a5-55cf-4a9d-b7ac-1eb7d37731ad`, üretim
`099708ec-bcb3-4350-a9da-65c0fac30cfb`. Canlı 19 kapağın iki boyutunda
38/38 yanıt 200 ve çözümlenebilir görsel: toplam 640 baytı 1.646.705,
960 baytı 2.829.834. Önceki dosya ölçümüyle aynı sonuç. Aynı MXP ağ
noktasında beş fotoğraf yanıtı HIT; gövde 70.041 bayt ve Age 95–96 saniye.
HTML MISS → HIT → HIT yeni adresleri korudu. Geçersiz boyut ve sorgu
404/no-store; yönetim Access 302; senkron durumu 200/no-store.

Canlı in-app tarayıcıda mobil kapak artık özgüne dönmeden 640×480,
masaüstü kapak 960×720 olarak açıldı. Küçük fotoğraflar 640 genişlikte;
tam ekran galeri özgün 1600 piksel fotoğrafı açtı ve sayaç 2/10'a ilerledi.
Mobil 390×844 ve masaüstü 1280×800 yatay taşma yok. Favoride seçili kart
640 fotoğrafını yükledi, 47 gizli kartta etkin img/source kaynağı sıfırdı.
Deneme kaldırılıp sayfa yenilenince 48 kartın tümü gizli ve etkin kaynak
sıfırdı. Kaydedilen konsol hatası yok; tarayıcı denemesi temizlendi.

Kanıtlar: `emlakjet-proxy-canli.json`, `emlakjet-proxy-http.json`,
`emlakjet-proxy-onbellek.json`, `emlakjet-proxy-html-onbellek.json` ve
`emlakjet-proxy-tarayici.json` aynı rapor klasöründe. İlk gömülü CDN
hatasının tarayıcı ağ kök nedeni kesinleşmedi; mevcut sunumda sorun
tekrarlanmadı. Dosyaların %61,9 azalması toplam sayfa/LCP kazanımı değildir.
R2 boyutlandırma, fiziksel cihaz ve gerçek kullanıcı ölçümleri ile
büyük portföyde sunucu filtreleme/sayfalama açık olduğundan EDM-046 kısmi.

## R2 yüklemeleri — 3 Ekim 2026

Yönetim paneline yeni yüklenen fotoğraflar tarayıcıda özgün WebP'ye (en fazla
1800 px) ve 640/1280 px WebP türevlerine hazırlanıyor. Paketler beş fotoğrafla
sınırlı; 50 fotoğrafın tümü tek istekte belleğe alınmıyor. R2'de özgün anahtar
ve iki boyut tutuluyor. İlan kartları cihaz yoğunluğuna uygun 640/1280 kaynağını
seçiyor; eski kayıtlarda türev yoksa `/g/` özgün dosyayı sunuyor. Silme ve
sahipsiz taslak temizliği üç anahtarı da kaldırıyor. D1 şeması değişmedi.

Staging `ef209714-022d-4b64-a42f-f439e3d02adc`, üretim
`5b8258d0-0410-491a-9226-9d5f45f69c07` sürümüne dağıtıldı. Üretim geçiş kapısı
0011 CRM geçişini erteledi; şema uyumlu olarak raporlandı. Üretim D1'de
`ilan_foto` sayısı salt okunur sorguda sıfır çıktı. Staging ana sayfa ve görsel
yolunun ikisi de Access'e `302/no-store` döndü. Canlı ana sayfa ve ilanlar
`200`; panel `302/no-store`; geçersiz boyut isteği `404/no-store` döndü.
R2 ilan fotoğrafı olmadığından türevlerin canlı bayt farkı henüz ölçülmedi; ilk
gerçek fotoğraf yüklemesinden sonra özgün/640/1280 dosyaları ayrı ölçülmeli.
Fiziksel cihazda sayfa/LCP ölçümü ve gerçek kullanıcı LCP/INP/CLS başlangıcı da
açık; dosya boyutu kazanımı bunların yerine geçmez.

## Mobil Core Web Vitals — 3 Ekim 2026

PageSpeed Insights mobil laboratuvarında üretim ana sayfası ilk taramada 95
puan, FCP 1,8 sn, LCP 2,6 sn, TBT 0 ms, CLS 0 ve Speed Index 3,0 sn verdi.
CrUX gerçek kullanıcı verisi yoktu. Görsel yayınlama denetimi Hepsiemlak
fotoğrafları için 1.782 KiB olası tasarruf gösterdi; bu gerçek indirilen veri
değil, Lighthouse tahminidir.

Yüksek yoğunluklu dar ekranlarda kart, şerit ve galeri kapağının 1280×960
seçeneğini indirmesini sınırlamak için Hepsiemlak görsellerine 960×720 mobil
kaynağı eklendi; galeri küçük resimleri 640×480'de kaldı, masaüstü 1280
seçenekleri korunuyor. Canlı PageSpeed denetimi ilk kart görselinin gerçekten
`/mnresize/960/720/` kaynağından geldiğini ve dosyanın 377 KiB olduğunu
gösterdi. Emlakjet ve R2 kaynak kuralları değişmedi.

Üretim Worker `18359eaf-ee95-49d4-b5c0-179063add22d` sürümüne dağıtıldı;
staging `7b85d774-81a3-4826-8748-259c6d8b7dde`. Son PageSpeed taraması
(16:25 Türkiye saati) 96 puan, FCP 1,8 sn, LCP 2,6 sn, TBT 0 ms, CLS 0,
Speed Index 2,8 sn ve görseller için 1.024 KiB olası tasarruf verdi. İlk
değere göre Lighthouse görsel tasarruf tahmini yaklaşık %43 azaldı; LCP
aynı kaldı. Aradaki 16:21 taraması 84 puan/LCP 4,1 sn verdi; hemen sonraki
ölçüm başlangıç seviyesine döndüğü için PageSpeed saha sonucu gibi
yorumlanmamalı. Ölçüm başına değişkenlik yüksek. Render-blocking CSS için
630 ms fırsat ve 38 KiB önbellek fırsatı sürüyor.

Üretim ana sayfa ve `/ilanlar` 200; yönetim ilan ekleme yolu 302/no-store.
Staging Access kapısı 302/private-no-store. Derleme ve `git diff --check`
geçti; test paketi bu adımda çalıştırılmadı. Gerçek kullanıcı LCP/INP/CLS
verisi hâlâ yok; kişisel ziyaretçi ölçümü eklemeden önce gizlilik/aydınlatma
kararı gerekli. Fiziksel telefonda ölçüm de yapılmadı.

### Logo WebP devamı — 3 Ekim 2026

PageSpeed ayrıca 1000×274 açık logo PNG'sinin 44 KiB olduğunu ve 204×56
alanda gösterildiğini belirtti. Üst çubuk, alt bilgi ve yönetim paneli için
ortak responsive WebP bileşeni eklendi; 500/1000 px şeffaf varyantlar
oluşturuldu, PNG geriye uyumluluk için tutuldu. 500 WebP 17 KiB; PNG'ye göre
yaklaşık %61 daha küçük.

Staging `b5899759-bdf4-4174-a4af-736423ef9ae5`, üretim
`339d4b32-4224-4115-951d-e75f17ce02c2`. Üretim HTTP kontrolünde ana sayfa ve
iki WebP dosyası 200, yönetim ilan ekleme yolu Access'e 302/no-store döndü;
ana sayfa HTML'i responsive WebP `srcset` içeriyor. Son PageSpeed mobil raporu
(16:36) 95 puan, LCP 2,6 sn, CLS 0; seçilen logo dosyası 17 KiB. Görsel
tasarruf tahmini 1.024 KiB'den 434 KiB'ye indi (yaklaşık %58); bu toplam
indirme veya LCP kazanımı değildir. CrUX saha verisi hâlâ yoktur.

Staging/üretim derlemeleri ve diff-check başarılı; bu adımda test paketi
çalıştırılmadı. Sonraki performans fırsatı PageSpeed'de kalan 640 ms oluşturma
engeli ve 35 KiB önbellek denetimidir.

## İlan galerisi kaynak düzeltmesi — 3 Ekim 2026

Canlı portföyde 48/48 kart görseli bu tarayıcı oturumunda yüklendi. Ancak bir
Emlakjet ilanının 10 fotoğraflı tam ekran galerisinde ilk kare dışındakiler
doğrudan `imaj.emlakjet.com` adresinden isteniyor ve yüklenmiyordu. Hepsiemlak
kaynaklı 15 karelik örnek galeride sorun görülmedi. Galeri şimdi Emlakjet
adreslerini kartlarda kullanılan aynı doğrulanmış `/foto/emlakjet/960/` Worker
proxy'sine çeviriyor; Hepsiemlak yüksek çözünürlüklü adresleri korunuyor.

Üretim Worker `5cc9acf8-4b36-4ffa-b653-53fd45cebf09` sürümüne dağıtıldı.
Canlı doğrulamada Emlakjet galerisi 10/10, Hepsiemlak galerisi 15/15 kareyi
yükledi; ilan listesinde 48/48 kart görseli de yüklendi. Bir sonraki görsel
performansı adımı CSS oluşturma engelini incelemek: ana sayfa dört dış CSS
dosyası yüklüyor; Tailwind/global CSS 53.024 bayt (gzip 10.023), ana sayfa
CSS'i 8.575 bayt (gzip 1.985), temel yerleşim 5.332 bayt (gzip 1.394), ilan
kartları 4.653 bayt (gzip 1.321). Ölçümde link etiketleri `media` koşulu
olmaksızın stil sayfası olarak bağlı. Bunları asenkronlaştırmadan önce ilk
görünüm için gerçekten gerekli stilleri ve güncel Lighthouse etkisini ayrıca
karşılaştırmak gerekir.

CSS paketleme denemesi aynı gün üretimde ölçüldü. `inlineStylesheets: 'always'`
ile dört stil sayfası kaldırılıp 71.584 karakter CSS tek inline `<style>`
öğesine alındı. Yeni mobil PageSpeed ölçümü 95 puan, FCP 1,8 sn, LCP 2,6 sn,
TBT 20 ms ve Speed Index 3,2 sn verdi. Ayar geri alındıktan sonraki yeni ölçüm
95 puan, FCP 1,8 sn, LCP 2,6 sn, TBT 0 ms ve Speed Index 3,1 sn verdi;
render-blocking fırsatı 640 ms olarak kaldı. Laboratuvar ölçümleri değişkenlik
gösteriyor; inline deneme ölçülebilir bir kazanım sağlamadı ve HTML'i büyüttü,
bu nedenle ayar `auto` değerinde tutularak üretim
`95fc64da-d3ae-49a9-a65c-9d82f5725290` sürümüne tekrar dağıtıldı. Canlı ana
sayfada dört önceden ölçülen CSS dosyasının yeniden yüklendiği doğrulandı.
Sonraki adım bu CSS'lerden ilk görünümde gerekmeyen kuralları sayfa kapsamına
göre ayırıp küçük, ayrı bir deneme yapmaktır.

### Emlakjet fotoğraf geri dönüşü — 3 Ekim 2026

Yüksek piksel yoğunluklu ekranlarda ve geçici CDN/proxy yanıt hatalarında
fotoğrafın özgün URL'ye doğrudan düşmesi kırık kart oluşturabiliyordu. Yüksek
DPR seçimleri artık Emlakjet Worker proxy'sinde kalıyor. Görsel hata verirse
`<picture>` seçimleri temizlenerek diğer proxy boyutu, ardından özgün kaynak
bir kez deneniyor. Kart, detay kapağı, küçük galeri kareleri, tam ekran
büyütücü ve fotoğraf şeridi aynı geri dönüş dizisini kullanıyor.

Canlı ana sayfada daha önce kırık görünen 19877910 numaralı kart 960 px
proxy'den yüklendi. İlan detayındaki 10 fotoğrafın tamamı büyük galeride tek
tek açıldı ve 960 px olarak yüklendi. İlgili galeri/görsel testleri 16/16 geçti,
Astro derlemesi başarılı. Canlı büyütücüde proxy fotoğrafı 960 px ile açıldı;
640 px alternatif ve özgün kaynak yedek olarak bağlandı. Üretim Worker sürümü
`1824e93f-1837-44fc-abc0-ea3a68a29757`. İlk geçici hatanın CDN tarafındaki
kesin nedeni bilinmiyor; yeni yedek sırası bu hatanın kullanıcıya kırık görsel
olarak yansımasını önlüyor.

### Kart stillerinin ortak pakete alınması — 3 Ekim 2026

`IlanKart.astro` bileşenindeki kart stilleri `.ilan-kart` seçicileriyle ortak
global CSS'e taşındı. Kartlara ait ayrı CSS isteği kalktı: canlıda harici stil
isteği 4'ten 3'e indi ve toplam gzip CSS yaklaşık 624 bayt küçüldü. Üretim
sürümü `1fe86214-1b99-4407-9b94-7ac79bab54b2`; son fotoğraf yaması bu sürümün
üzerine dağıtıldı. Dosya boyutu kazanımı tek başına Lighthouse/LCP iyileşmesi
iddiası değildir.

### Canlı portföy yeniden taraması — 3 Ekim 2026

Önceki dağıtımdan sonra canlı `/ilanlar` sayfasındaki 49 kart tarayıcıda
gerçekten yüklendi: 49/49 başarılı, sıfır kırık görsel. Kaynak dağılımı 20
Emlakjet Worker proxy'si ve 29 Hepsiemlak CDN fotoğrafı. Farklı kaynaklardan
iki detay galerisi de incelendi: Emlakjet ilanı 16592732'de 10/10, Hepsiemlak
ilanı 19572827'de 7/7 kare tam ekran galeride yüklendi. Hepsiemlak karelerinin
bir kısmı görünür küçük resim olmadıkları için ilk sayfa yüklemesinde henüz
istenmiyordu; tam ekran galeride açıldıklarında yüklendiler. Bu taramada canlı
site değişmedi. CSS tarafında tüm stilleri tek inline dosyaya alma önceki
denemede kazanç sağlamamıştı; yeni bir değişiklik yapmadan önce sayfa kapsamlı
küçük bir paketleme denemesinin ölçülmesi gerekiyor.

Üç fotoğraf görünen 19751424 numaralı Emlakjet ilanı da kaynak sayfada açıldı.
Kaynakta iki ilan fotoğrafına ek olarak ana fotoğraf bulunuyor; üçü de CDN'den
başarıyla yüklendi. Drone görünümü ayrı bir harita kartı, ilan fotoğrafı değil.
Dolayısıyla bu kayıt için fotoğraf sayısı aktarım sırasında eksilmemiş; daha
fazla fotoğraf bekleniyorsa Emlakjet kaynak ilanında da bulunmuyor.

Derleme çıktısı kontrolünde canlı ana sayfanın ürettiği ortak Tailwind/marka
CSS'i 55.139 bayt (gzip 10.663), temel yerleşim 5.332 bayt (gzip 1.367), ana
sayfa bileşen CSS'i 8.575 bayt (gzip 1.945) olarak ölçüldü. Astro derlemesi
başarılı; Wrangler yalnızca sandbox dışındaki varsayılan log dosyasına
yazamama uyarısı verdi. Bu turda kaynak CSS değiştirilmedi ve canlı PageSpeed
deneyi yapılmadı.

18350489 ilanı için de Emlakjet'in canlı sayfası kontrol edildi: portalın
`1 / 4` galerisi kapak fotoğrafı, iki ek ilan fotoğrafı ve ayrı drone harita
görünümünü içeriyor. Taşınmazın üç gerçek fotoğrafı sitedeki üç fotoğrafla
eşleşiyor; bu kayıtta da aktarım kaybı görülmedi.

## Canlı ilan kartlarının yeniden yükleme kontrolü — 4 Ekim 2026

Canlı `/ilanlar` sayfası ilk açıldığında ekranın altındaki 20 kart görseli henüz
istenmemişti; bu, `loading="lazy"` davranışıdır ve kırık görsel kanıtı sayılmaz.
Liste sonuna kadar kaydırıp tüm kartlar görünür olduktan sonra 49/49 kapak
fotoğrafının yüklendiği doğrulandı. Bu oturumda kalıcı olarak başarısız kart
görseli yok. Bu kontrol yalnız kapakları kapsar; kullanıcı belirli bir ilanda
galeri içi fotoğraf eksikliği görürse ilan numarasıyla o galerideki her kare
ayrıca açılıp kaynağıyla karşılaştırılmalı.

Ana sayfanın CSS kural taramasında sayfaya özel 11 kural, temel yerleşimde 15
kural ilk görünümün DOM'unda eşleşmedi; bunların çoğu hover, gezinme ve durum
seçicileriydi. Ortak Tailwind kuralları diğer sayfalarda da kullanıldığından
ana sayfa taramasına bakarak temizlenmedi. 4 Ekim PageSpeed API isteği HTTP
429 ile sınırlandığı için yeni laboratuvar ölçümü alınamadı; CSS değişikliği
yapılmadı.

Fotoğraf sayısı düşük olan 19751424 numaralı Emlakjet ilanının canlı detay
galerisi ve tam ekran büyütücüsü de açıldı: üç küçük görselin tümü yüklendi,
galeri 1/3'ten 3/3'e ilerledi ve her tam ekran kare 960 px proxy'den başarıyla
açıldı. Kaynak portalda da kapak ve iki ek ilan fotoğrafı bulunuyor; eksik kare
görülmedi. Tam ekran görüntüleyici kapalıyken boş kaynaklı bir resim öğesi
bulunduruyor; bu, açılınca kaynak atanması nedeniyle görsel hatası sayılmıyor.

Fotoğraf ve galeri testleri bu turda yeniden çalıştırıldı: 16/16 galeri/sunum
testi ve 7/7 fotoğraf kuralı testi geçti. Astro/Cloudflare derlemesi tamamlandı;
Wrangler yalnızca sandbox nedeniyle kullanıcı klasöründeki kendi tanılama
dosyasına yazamadı ve derleme çıktılarını yine başarıyla üretti.

## Emlakjet ilan 19889243 fotoğraf sayısı — 4 Ekim 2026

Emlakjet kaynağı 19889243 için 31 fotoğraf bildiriyor; canlı EDM galerisi 10
fotoğraf sunuyor. Senkron yalnızca ürün JSON-LD'sini kullandığından, sayfa
HTML'ine gömülü ek ilan görsellerini de toplayan düzeltme eklendi. Yeni test,
JSON-LD'deki 10 kareye sayfadaki 31 kareyi ekliyor, farklı boyutlardaki tekrarları
tekilleştiriyor ve başka ilan görsellerini dışarıda bırakıyor. Ayrıştırıcı,
portal boyutlu URL'lerini EDM sunum katmanının tanıdığı kanonik `/listing/`
adresine çeviriyor; bu katman kendi alan adımızdaki 640/960 px fotoğraf aracısını
kullanıyor. İşletme teyit listesine mevcut kullanım ve teslim zamanını
doğrulayan bir madde eklendi.

Yeni fotoğraf URL düzeltmesi `a0a04b42-6b92-4fe6-b23e-87c1663111be`
sürümüyle 4 Ekim'de üretime dağıtıldı. Canlı Emlakjet galerisi 31 fotoğrafı
doğruluyor. 4 Ekim 03:01 UTC senkronunda 49 ilan bulundu, sıfır hata kaydedildi;
19889243 ilanının D1 fotoğraf sayısı 31'e çıktı. 09:01 UTC senkronu da 49 ilan
ve sıfır hatayla tamamlandı, 31 fotoğraf kaydı korundu. Canlı ilan detayında
galeri 1/31'den 31/31'e ilerledi ve son kare de görsel olarak yüklendi. Fotoğraf
aktarımı ve sayfa gösterimi artık doğrulandı. Ayrıştırıcı testi 2/2, galeri ve
görsel sunum testleri 16/16, fotoğraf kural testleri 7/7 geçti. Üretimde başka
bir fotoğraf yüklenmeme bildirimi gelirse ilan numarasıyla aynı kontrol uygulanmalı.
