# Günlük yedekleme kurulumu

İş akışı: `.github/workflows/gunluk-yedek.yml`. Türkiye saatiyle günlük arşiv
02:17, bağımsız güncellik kontrolü 15:47. GitHub zamanlayıcısı yoğunlukta
gecikebilir; bunlar hedef saatlerdir. 36 saatten eski yedek hata sayılır.
[GitHub zamanlama belgesi](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

`YEDEK_ZAMANLAYICI_HAZIR=1` değişkeni kurulmadan otomatik koşular kapalıdır.
Manuel `workflow_dispatch` doğrulama için kullanılabilir. Pull request testleri
Cloudflare sırlarına erişmez. Arşiv veya manifest GitHub artifact olarak yüklenmez.

## Cloudflare kimlikleri

Mevcut `site/.env` anahtarını GitHub'a kopyalama. Aşağıdaki üç ayrı kimliği
oluştur; oluşturma ekranında gerçek hesabı seç. Tokenları sohbetten gönderme.

1. [Profil → API Tokens → Create Custom Token](https://dash.cloudflare.com/profile/api-tokens):
   ad `EDM yedek okuma`. İzinler `Account / D1 / Read` ve
   `Account / Workers R2 Storage / Read`; hesap kaynakları yalnız EDM hesabı.
   Bu REST izinleri seçili hesaptaki D1/R2 verilerini okuyabilir, R2 yazımı veya
   Worker/DNS/Access değişikliği yapamaz. Token → `CLOUDFLARE_API_TOKEN`.
2. Cloudflare → R2 Object Storage → Manage API Tokens → Create API Token:
   ad `EDM yedek kovaları`. `Object Read & Write`; **Specific buckets**
   yalnız `edm-yedek` ve `edm-yedek-staging`. Kaynak `edm-gorseller` ve
   `edm-gorseller-staging` kovalarını seçme. Access Key ID →
   `R2_YEDEK_ERISIM_KIMLIGI`, Secret Access Key → `R2_YEDEK_GIZLI_ANAHTARI`.
   [R2 kimlik ve kova kapsamı belgesi](https://developers.cloudflare.com/r2/api/tokens/).
3. Profil → API Tokens → Create Custom Token: ad `EDM yedek bildirimi`;
   `Account / Email Sending / Edit`; hesap kaynakları yalnız EDM hesabı.
   Token → `CLOUDFLARE_BILDIRIM_API_TOKEN`. Bildirim kimliği yedek kimliğinden
   ayrıdır; yedek kimliğinin iptali hata bildirimini susturmamalı.
   Sabit gönderici `bildirim@edmyapigayrimenkul.com`, alıcı
   `ozdogandogukan@gmail.com`. Gerçek gönderim testi alan adı/hesap yetkisini
   de doğrular. [Email Sending REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/).

Kimlikleri git dışında `site/.env.yedek` dosyasına yaz:

```dotenv
CLOUDFLARE_ACCOUNT_ID=EDM_HESAP_KIMLIGI
CLOUDFLARE_API_TOKEN=buraya_okuma_tokeni
R2_YEDEK_ERISIM_KIMLIGI=buraya_access_key_id
R2_YEDEK_GIZLI_ANAHTARI=buraya_secret_access_key
CLOUDFLARE_BILDIRIM_API_TOKEN=buraya_bildirim_tokeni
```

Bu dosya `0600` izinleriyle saklanır ve `.gitignore` içindedir. Dosyayı
doldurduktan sonra `site/` içinde:

```bash
npm ci --prefix scripts/yedekleme --ignore-scripts
node scripts/yedek-kimlik-kur.mjs
```

Kurulum betiği etkin GitHub hesabını ve depo yönetici yetkisini, iki D1'in
salt okunur erişimini ve iki yedek kovasının S3 erişimini kontrol eder.
Anahtarları komut argümanına veya çıktıya koymadan GitHub repository secrets'a
stdin ile aktarır. Yeni kurulum zamanlayıcıyı önce kapatır. Bildirim secret'ı
yalnız bildirim işine, S3 sırları yalnız yedek işine verilir.

## Devreye alma kabulü

1. GitHub Actions'ta **Günlük doğrulanmış yedek** → Run workflow:
   `staging / yedekle`; SQL ve geri okunan dosyaların hash'leri eşleşmeli.
2. İki ardışık `production / yedekle` koşusu: farklı arşiv önekleri, tam
   manifest ve başarılı güncellik kontrolü görülmeli.
3. `staging / hata-bildirimi-testi`: arşive dokunmadan kontrollü hata üretir;
   yedek işi bilinçli olarak kırmızı, ayrı bildirim işi yeşil olmalı. Doğukan
   gerçek test e-postasının geldiğini doğrulamalı. API'deki `queued` sonucu
   yalnız kabulü gösterir; gelen kutusu teslimi sayılmaz.
4. `production / kontrol` başarılı olmalı. Sonra
   `YEDEK_ZAMANLAYICI_HAZIR=1` olarak ayarlanır.
5. İlk gerçek `schedule` koşusunu ve bağımsız kontrolü ayrıca kaydet. Manuel
   tetikleme, zamanlayıcının gerçekten çalıştığını tek başına kanıtlamaz.

GitHub bildirimleri hesap tercihlerine ve cron'u son değiştiren kişiye bağlı
olduğu için Doğukan'a gönderilen sabit e-posta yerine kabul edilmez.
[GitHub bildirim davranışı](https://docs.github.com/en/actions/concepts/workflows-and-actions/notifications-for-workflow-runs).

## Saklama ve hata davranışı

Yedek kovalarının halka kapalı olması ve tüm nesneleri en az 90 gün koruyan
kilit her arşiv öncesi kontrol edilir. Kısmi arşivde manifest yazılmaz. Kaynak
R2 dosyası eksikse veya medya referansları koşu sırasında değişirse işlem durur.
90 günlük kilit bir silme takvimi değildir; otomatik saklama temizliği bu
iş akışında yoktur. Güncellik çıktısı SQL boyutu, R2 adet ve bayt toplamını verir.
Geri yükleme için [D1 kurtarma prosedürü](./d1-kurtarma.md) izlenir.
