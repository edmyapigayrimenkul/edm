# Üretim şema uyumluluğu

3 Ekim 2026. Üretim dağıtımı `node scripts/dagit.mjs` ile yapılır. Salt
okunur kontrol: `node scripts/dagit.mjs --check`. Betik şema uygulamaz.

Kapı, yapılandırmadaki üretim Worker/D1 kimliğini, uzak `d1_migrations`
kayıtlarını, yerel geçiş dosyalarını ve uygulamanın `surum.ts` içindeki
gerekli sürümünü karşılaştırır. API veya sürüm kaynağı okunamıyorsa durur.
İngilizce CLI çıktısından bekleyen dosya adı tahmin edilmez.

## Kapalı CRM geçişi

`0011-talep-is-sonucu.sql`, henüz etkinleştirilmeyen yeni CRM sonucu
tablosudur. Kamu sayfalarının bu tabloya bağımlılığı yoktur. Yalnız bu
dosya bekliyorsa ve aşağıdaki koşullar birlikte sağlanıyorsa ertelenebilir:

- Uygulamanın gerekli sürümü dahil diğer bütün yerel geçişler uygulanmış.
- Dağıtılacak yapılandırmada `TALEP_IS_SONUCLARI_ETKIN` açıkça `0`.
- Uzak bayrak yok veya düz metin olarak tam `0`; gizli/kararsız değer reddedilir.
- Yerel test kimliği yapılandırmada ve uzak Worker'da bulunmuyor.

Eski eksik geçiş, bilinmeyen yeni geçiş veya açık CRM dağıtımı durdurur.
`0011` uygulamanın zorunlu sürümü yapılırsa bu istisna onu karşılamaz.
Kapı D1 dosyalarını gizlemez, sıradan çıkarmaz veya otomatik uygulamaz.
`npm run db:migrate` bütün bekleyen geçişleri uygular; CRM kararı beklerken
bu komut çalıştırılmamalıdır. Etkinleştirme koşulları `is-sonucu-veri-akisi.md` içinde.

## Doğrulama

Üç yeni kapı testi; eksik taban, bilinmeyen geçiş, belirsiz/açık bayrak ve
yerel test kimliği reddini sınar. Tam dizide 178 test başarılı. Uzak
salt okunur kapı geçtikten sonra özel üretim yedeği alındı:
`production/2026-10-03T00-44-35-655Z-4cb6cdd3/manifest.json`;
335.166 bayt D1, kaynak R2 sıfır nesne.

Üretim `cc8e9c5e-7834-4b7e-88c5-2dd7462b1634` sonrası uzak bayrak `0`,
yeni sonuç tablosu sayısı `0`, yerel test kimliği yok. Panel oturumsuz
istekte Access 302/no-store. Oturumlu uzak panel bu turda görülmedi.
Kapalı bayrakta tablo okunmaması ve yeni kayıt POST 403 davranışı daha
önce izole yerel HTTP ile doğrulandı (`talep-is-sonucu.md`).

Derleyiciye Cloudflare API kimliği verilmez ve Wrangler `.env` geliştirme
bağlamaları yüklemez. Kaynak ve derlenmiş çıktıda mevcut gerçek sır
değerleriyle eşleşme sıfır; bu turda hiçbir sır değiştirilmedi.
