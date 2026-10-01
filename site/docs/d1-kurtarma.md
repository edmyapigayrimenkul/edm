# D1 yedekleme ve geri yükleme

Komutları `site/` dizininden çalıştır. `scripts/d1-kurtarma.mjs`, Cloudflare
kimlik bilgilerini yerelde `.env`, CI'da süreç ortamından okur; tokenı komut satırına yazma.
`staging` yalnız `edm-talepler-staging` veritabanını, `production` yalnız
`edm-talepler` veritabanını hedefler. Geri yükleme için hedefin tam D1 kimliği
son argüman olarak zorunludur.

## Güvenli durum kaydı

Önce mevcut yer imini ve ayrıca bağımsız SQL dışa aktarımını al:

```bash
npm run db:info -- staging
node scripts/d1-kurtarma.mjs export staging /güvenli/dizin/edm-staging-YYYYAAgg.sql
```

Üretim için aynı komutlarda `staging` yerine `production` kullan. SQL dosyası
`0600` izinleriyle oluşur. Wrangler'ın bir saatlik imzalı indirme URL'si
yardımcının çıktısına aktarılmaz. Dosyayı ortak veya herkese açık dizine koyma.
Time Travel, [Cloudflare'ın belgelediği süre](https://developers.cloudflare.com/d1/reference/time-travel/)
boyunca kullanılabilir; SQL dışa aktarımı ayrıca güvenli ve ayrı bir saklama
hedefine taşınmadıkça uzun süreli yedek sayılmaz.

## Ayrı R2 kovasına tam arşiv

`edm-yedek` ve `edm-yedek-staging` özel kovalarına r2.dev veya özel alan adı
bağlı değildir. İkisinde de bütün nesneleri 90 gün silinmeye/üzerine yazılmaya
karşı koruyan kova kilidi vardır. Canlı `edm-gorseller` kovasında kilit yoktur;
ilan fotoğrafı değiştirme akışı çalışmaya devam eder.

```bash
npm run db:backup:staging
npm run db:backup:production
```

`scripts/yedekle.mjs` önce ortamın D1/R2 kimliğini, yedek kovasının özel
olduğunu ve 90 günlük kilidi doğrular. D1'de kayıtlı fotoğraf/video anahtarlarının
kaynak R2'de bulunduğunu da denetler; eksik dosya varsa arşivlemeye başlamaz.
Sonra D1'in tam SQL dışa aktarımını ve kaynak R2'deki tüm nesneleri ayrı tarihli
bir öneke kopyalar. Her nesneyi yeniden indirip boyut ve SHA-256 ile karşılaştırır.
Arşivleme sırasında D1 medya referansları değişirse manifest yazmaz.
`manifest.json` dosyası D1 adını,
kimliğini, SQL ve her R2 nesnesinin özgün/yedek anahtarını, boyutunu ve SHA-256
değerini içerir. Başarısız veya eksik koşu manifest üretmez; yalnız manifesti
oluşmuş koşular tam yedek kabul edilir. Geçici yerel kopyalar işlem sonunda silinir.
Bu komutlar yalnız elle çalıştırılır; **düzenli zamanlayıcı henüz kurulmadı.**

Arşivdeki SQL'i geri almak için `manifest.json` içindeki `yedekAnahtari`
değerini kullan:

```bash
npx wrangler r2 object get edm-yedek/production/YEDEK_ON_EKI/veritabani.sql \
  --file /güvenli/dizin/veritabani.sql --remote
```

Önce dosyanın SHA-256 değerini manifestle karşılaştır. SQL içe aktarmasını
**yeni ve boş bir D1 test veritabanında** dene; canlı D1'i doğrudan ezme.
Cloudflare'ın [D1 içe/dışa aktarma prosedürü](https://developers.cloudflare.com/d1/best-practices/import-export-data/)
`d1 execute --file` yolunu belgeliyor. Canlı geri yükleme kararı öncesinde o
andaki verinin ayrıca yeni bir arşivini al, tablo/ilan/talep sayılarını karşılaştır
ve kesinti planını belirle. R2 fotoğrafı için manifestteki özgün anahtara aynı
`r2 object get` → `r2 object put` akışını uygula; tüm kovayı körlemesine silme.

## Geri yükleme

Geri yükleme veritabanını **yerinde değiştirir** ve o sıradaki sorguları keser.
Önce mevcut yer imini ve SQL dışa aktarımını al, doğru veritabanı adını/kimliğini
`wrangler.yedek.jsonc` ile karşılaştır, sonra hedef yer imine dön. Örnek staging komutu:

```bash
node scripts/d1-kurtarma.mjs restore staging YER_IMI 17ca546e-1a76-46ab-9b73-95a944a97603
```

Üretimde son argüman `30d4df58-b49f-43c8-95c5-5a538ce44f68` olmalı.
Geri yüklemeden sonra `d1_migrations`, ilan ve talep sayılarını; ardından site
ve panel okuma akışını denetle. Gerekirse Wrangler'ın döndürdüğü önceki yer imi
ile işlemi geri al. D1 Time Travel, R2 fotoğraf kovasını geri yüklemez.

## Doğrulanmış staging tatbikatı

1 Ekim 2026'da staging D1'e yalnız sentetik bir ayar yazıldı, değeri değiştirildi,
ilk değerden sonra alınan yer imine gerçek uzak Time Travel geri yüklemesi
uygulandı ve ilk değerin geri geldiği görüldü. Sentetik kayıt temizlendi;
altı migration ile sıfır ilan korundu. SQL dışa aktarımı üretildi ve yerel
geçici dosya silindi. Üretim D1'e bu tatbikatta yazılmadı.

Aynı gün özel `edm-yedek-staging` kovasında D1 SQL arşivi geri okunup SHA-256
ile doğrulandı. Staging kaynak R2'ye sentetik metin nesnesi koyuldu; ikinci
arşiv koşusu bir R2 nesnesini de manifestledi. Kaynak nesne silinip kilitli
yedekten geri yüklendi, SHA-256 eşleşti ve kaynak sentetik nesne temizlendi.
Arşiv SQL'i ayrıca yeni ve boş bir geçici D1'e içe aktarıldı; 22 tablo okundu,
geçici D1 silindi. Kilit nedeniyle staging arşivindeki sentetik kopya 90 gün
saklanır.
Eksik R2 anahtarına işaret eden sentetik D1 fotoğraf kaydıyla olumsuz senaryo da
denendi: yedekleme başlamadan hata verdi, yeni arşiv nesnesi oluşmadı ve test
kaydı silindi. Temiz staging verisiyle sonraki koşu yeniden doğrulandı.
Üretim için `edm-yedek` özel kovası ve 90 gün kilit kuruldu; canlı D1'in ilk
arşivi 330.877 bayt SQL ve sıfır R2 nesnesiyle doğrulandı. Mevcut ilan
fotoğrafları dış kaynaklı olduğundan üretim R2 kovası bu tarihte boştu.

## Açık koruma işi

Günlük zamanlama ve başarısız yedek uyarısı henüz kurulmadı. 90 gün sonunda
otomatik silme kuralı da yok; saklama maliyeti ve geçmiş koşular düzenli izlenmeli.
R2 kilit kuralı yanlış silmeyi önler; aynı hesap yöneticisinin kuralı
kaldırmasına karşı bağımsız hesapta ikinci kopya sağlamaz.
