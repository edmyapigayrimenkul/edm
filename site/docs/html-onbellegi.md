# HTML ve veri tazeleme — 3 Ekim 2026

## Kural

- Anonim genel HTML GET: Cloudflare Cache API en fazla 60 saniye. Başlık:
  `public, max-age=0, must-revalidate, s-maxage=60`.
- Portföy, ekip/iletişim ve bölge hesabı yalnız aynı SSR isteğinde paylaşılır.
  Eşzamanlı ortak okumalar tek Promise kullanır; sonraki ziyaretçi D1'i yeniden okur.
- HIT kaydı yeniden yazmaz, süresini başlatmaz. Tarayıcı gezinmede sunucuya danışır;
  tarayıcıda ek bir 60 saniyelik bayatlık katmanı yoktur.
- POST, panel, API, cookie, Authorization ve `Cache-Control: no-cache/no-store`
  önbelleği atlar. Kişisel bağlamdaki HTML ayrıca `private, no-store` döner.
- Sitemap her istekte güncel veriden üretilir; eski bir saatlik tarayıcı süresi kaldırıldı.
- Önbellek anahtarının sürümü 2; önceki dağıtımın farklı kuralla sakladığı HTML okunmaz.
  Arama/filtre parametreleri anahtarda korunur.

## Düzeltilen sorun

Önceden üç veri katmanı (ilan, içerik, bölge) istekler arasında 60 saniye,
HTML de ayrıca 60 saniye tutuluyordu. Süresi dolmaya yakın eski veriden yeni
HTML üretilebildiği için “en geç bir dakika” ifadesi doğru bir garanti değildi.
Panelde bellek temizlemek de başka Worker örneklerini veya Cache API kayıtlarını
temizlemiyordu. Yeni akışta istekler arası tek süreli katman HTML'dir.

## Kanıt

- 185 test geçti; Astro derlemesi başarılı.
- `tests/edge-cache.integration.test.ts`: gerçek yerel Workers Cache ve D1'de
  MISS → HIT; gerçek SQL yazması sonrası bypass güncel başlığı hemen gösterdi;
  61,2 saniyedeki normal GET MISS ile güncel içeriği gösterdi. Başka bağlamdaki
  senkron yazmasının sonucu yeni sayfa üretiminde güncel okundu.
- Gerçek Astro ilan formu, üretimden ayrı geçici yerel D1 kopyasında sınandı:
  fiyat 20.000 → 21.234; POST kaydı başarılı, bypass ve yeni anonim MISS güncel
  fiyatı gösterdi. Ardından gerçek panel POST'u ilanı pasife aldı. Bypass 404,
  sitemap ilansız, eski HTML HIT idi. 61,35 saniyedeki iki detay URL'si 404 döndü,
  eski liste MISS ile yenilendi ve ilanın bağlantısını kaldırdı.
  Kanıt: `raporlar/onbellek-2026-10-03/yerel.json`.
- Son derlemede gerçek panel yayına alma POST'u sonrası Silivri bölge sayfası,
  önceden bulunmayan ilanı aynı anda güncel okumayla gösterdi.
  `raporlar/onbellek-2026-10-03/bolge.json`.
- Test verisi geçici yerel kopyadaydı; üretim ilan fiyatı/yayın durumu değiştirilmedi.

## Canlı dağıtım

Staging: `3d509815-c394-43a7-ae0f-cbf24a6e4c14`.
Üretim: `efc93bf7-f9f7-4ef6-8e86-3f1a31a3c491`.
Üretim kapısı 0011 CRM migration'ını kapalı bayrakla ertelenmiş doğruladı;
üretime migration uygulanmadı. Kaynak/son derlemede gerçek gizli değer eşleşmesi yok.

Canlı ana sayfa, ilan listesi/detayı, favoriler ve Silivri rehberi 200.
Anonim listede MISS → HIT aynı HTML özetiyle doğrulandı. Cookie/Authorization/
no-cache isteklerinde HIT başlığı yok ve HTML `private, no-store`. Yetkisiz panel
302 ve `private, no-store`; senkron durumu 200 ve `no-store`. Sitemap 200,
`max-age=0, must-revalidate`. Kanıt: `raporlar/onbellek-2026-10-03/canli.json`.
Bu ilk ölçümde süre sonunda Cloudflare merkezi MXP → IST değiştiği için o MISS,
süre dolumu kanıtı sayılmaz; ayrıca tek HTTP/2 bağlantısıyla sınanır.

İkinci ölçüm tek HTTP/2 bağlantısında MXP merkezinde kaldı: MISS → HIT,
yaklaşık 63 saniye sonra MISS → HIT; HIT yanıtlarının HTML özetleri ilgili MISS
ile eşleşti. `raporlar/onbellek-2026-10-03/canli-sure.json` gerçek süre dolumu
kanıtıdır. Canlı D1'e deneme yazması yapılmadı; mutasyon kanıtı gerçek yerel form
ve gerçek yerel D1 üzerinden, canlı kanıtı ise cache davranışı üzerinden alınmıştır.
Geçici yerel veritabanı kopyası ve 8897/8898 test sunucuları kaldırıldı.

## Sınırlar

60 saniye Cache API kaydının ömrüdür; bir mutasyonla aynı anda çalışmaya başlamış
eski bir üretimin tamamlanma süresi ayrıca etkileyebilir. Önbellek her Cloudflare
merkezinde ayrıdır; HIT/MISS farklı merkezlerde farklı olabilir. Dünya çapında
anlık silme uygulanmaz. Açık sekme ve geri/ileri geçmişi otomatik canlı güncelleme
değildir; tazelik yeni sunucu isteğinde sınanır. Staging Access altında olduğundan
orada anonim Cache API HIT kanıtı beklenmez.

Kaynak: [Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/),
[AsyncLocalStorage desteği](https://developers.cloudflare.com/workers/runtime-apis/nodejs/asynclocalstorage/).
