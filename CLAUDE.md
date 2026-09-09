# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

EDM Yapı & Gayrimenkul'ün (Silivri merkezli emlak ofisi) kurumsal sitesi ve marka kimliği.
Canlı adres: https://edmyapigayrimenkul.com

---

## Dil kuralı

**Bu depodaki her şey Türkçe yazılır.** Değişken, fonksiyon, tip, dosya ve klasör
adları; yorumlar; commit mesajları; kullanıcıya görünen tüm metinler. İngilizce
yalnızca üçüncü parti API alanlarında geçer (`textQuery`, `authorAttribution`,
`scrollTrigger`…). Yeni kod yazarken çevredeki adlandırmayı taklit et:

```ts
export async function benzerIlanlar(ilan: Ilan, adet = 3): Promise<Ilan[]>
function portfoyuYaz(vt: D1Database, ilanlar: HamIlan[])
const { ekip, yorumlar, iletisim } = await icerik();
```

Yorumlar *ne* yapıldığını değil **neden** yapıldığını anlatır. Kodda bunun çok
örneği var; aynı tonu sürdür.

---

## Komutlar

Tümü `site/` içinden çalışır.

```bash
npm install
npm run dev                 # yerel geliştirme (astro dev)
npm run build               # derleme
npm run preview             # derlenmiş çıktıyı önizle
npm run scrape              # Emlakjet'ten portföyü çekip data/listings.json'a yazar

node scripts/dagit.mjs      # DAĞITIM: derle + wrangler deploy (kullanılan tek yol)
node scripts/og-kart.mjs    # paylaşım kartını yeniden üretir (metin/logo değişince)
node scripts/koordinat-coz.mjs   # yeni mahallelerin koordinatlarını çözer
```

**Test ve linter yok.** Doğrulama canlı üzerinden yapılır: dağıt, sonra `curl` ile
durum kodlarına ve HTML'e bak; tarayıcı gerekiyorsa sayfayı aç ve DOM'u ölç.
`npx astro check` çalışır ama yavaştır ve geçmişte asılı kalmıştır — derleme
şablon hatalarını zaten yakalar.

Elle senkron (yeni ilan yayınlandığında beklemeden):

```bash
curl -X POST https://edmyapigayrimenkul.com/api/senkron \
  -H "Content-Type: application/json" -H "X-Senkron-Anahtari: <anahtar>"
```

Senkron durumu herkese açık (gizli veri yok): `GET /api/senkron`

`site/.env` (depoya girmez): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
Betikler bunu `scripts/lib/cf.mjs` ile okur — kabuktan `set -a; . ./.env`
denemesi bu depoda çalışmadı, Node tarafında ayrıştırılıyor.

---

## Mimari

**Tek bir Cloudflare Worker iki iş yapar** (`site/src/worker.ts`):

- `fetch` → Astro SSR işleyicisi. Sayfalar istek anında üretilir (`output: 'server'`),
  ilan verisi D1'den okunur. Yeniden derleme diye bir adım yok.
- `scheduled` → günde 4 kez (`0 3,9,15,21 * * *` UTC) Emlakjet portföyünü tarar.
  03:00 çalışmasında ayrıca günlük özet e-postası ve Google yorumları çekilir.

```
Emlakjet  ──scheduled──▶  D1 (ilanlar)  ──▶  lib/ilanlar.ts  ──▶  sayfalar
                              ▲                  (sunum katmanı,
Panel (/yonetim) ─────────────┘                   60 sn bellek önbelleği)
```

### Veri akışının kritik kuralı

Portalda görünmeyen ilan **silinmez, `pasif` olur**: listeden ve site haritasından
düşer, detay adresi 404 döner. `kaynak='elle'` olan ilanlar pasifleştirmeden muaf.

**Emniyet freni:** Emlakjet bir çalıştırmada hiç ilan döndürmezse hiçbir şey
yazılmaz. Tek bir hatalı yanıt portföyün tamamını kapatmasın diye. Bu davranış
uçtan uca test edildi (sahte ilan eklenip senkronla düşürüldü) — bozma.

### Katmanlar

| Dosya | Sorumluluk |
|---|---|
| `src/worker.ts` | Giriş noktası; `fetch` + `scheduled`; `senkronla()` |
| `src/lib/senkron/emlakjet.ts` | Kazıyıcı. Hem Node betiğinden hem Worker'dan çalışır |
| `src/lib/senkron/depo.ts` | D1 okuma/yazma, pasifleştirme, `semayiKur()` |
| `src/lib/ilanlar.ts` | Sunum katmanı: `Ilan` tipi, slug, fiyat/m² biçimleme, arama metni, benzer ilanlar, açıklama ayrıştırma |
| `src/lib/icerik.ts` | Panelden yönetilen içerik: ekip, yorumlar, iletişim, hizmetler |
| `src/lib/site.ts` | `KURUM`, `ILETISIM`, `MENU`, `SUREC` sabitleri — tek doğruluk kaynağı |
| `src/lib/bolgeler.ts` | Bölge rehberi; sayısal her şey portföyden hesaplanır |
| `src/middleware.ts` | www → kök alan adı (tek kanonik adres) |
| `src/lib/panel/yetki.ts` | Access JWT doğrulaması (JWKS + `crypto.subtle`) |
| `src/scripts/hareket.ts` | Site geneli hareket katmanı (GSAP + Lenis + ScrollTrigger) |
| `src/scripts/sayfa.ts` | `herSayfada()` — görünüm geçişlerinde kurulum tekrarı |
| `src/scripts/paylasim-gorsel.ts` | Sosyal medya görselinin canvas ile çizimi |

### D1 tabloları (`edm-talepler`)

`ilanlar`, `talepler`, `ekip`, `yorumlar`, `ayarlar`, `metinler`,
`senkron_gunlugu`, `goruntulenme`, `ilan_duzenleme`, `ilan_gorsel_duzen`,
`ilan_foto`, `konum_koordinat`

`metinler` iki tür taşır: `tur='hizmet'` (ana sayfadaki hizmet kutuları) ve
`tur='bolge'` (bölge rehberi tanıtımları). Ayrı hizmet tablosu **yok**.
`ayarlar` anahtar/değer: iletişim bilgileri ve Google'dan gelen genel puan.
Anahtar adları `Iletisim` arayüzündeki alan adlarıyla birebir eşleşir — yeni
bir iletişim alanı eklerken hem tipe, hem `AYAR_VARSAYILAN`'a, hem panelin
`ALANLAR` listesine eklenmeli.

İçerik tabloları boşsa `icerik.ts` koddaki varsayılanları tohumlar — bu yüzden
boş bir veritabanında da site eksiksiz açılır.

**Şema kurulumu `semayiKur()` içinde ve yalnızca senkron sırasında çalışır.**
Yeni tablo/sütun eklerken bu tuzağa dikkat: kod dağıtılır ama tablo yoktur ve
sorgular sessizce boş döner. Bu proje boyunca dört kez yaşandı. Yeni tabloyu
D1 HTTP API'siyle elle oluştur, sonra şemaya da ekle.

`semayiKur()` SQL'i `;` ile bölüyor — yorum satırında `;` geçerse bölme bozulur.
`--` yorumları önce ayıklanıyor, o mantığı koru.

### Bağlamalar ve gizli değerler

```
VT        D1        edm-talepler
ASSETS    Assets    dist/client
GORSELLER R2        edm-gorseller (panelden yüklenen fotoğraflar)
EPOSTA    send_email (Cloudflare Email Service)

vars:     ACCESS_EKIP_ALANI, ACCESS_AUD, BILDIRIM_ADRESI, GOOGLE_ISLETME_ARAMASI
secrets:  SENKRON_ANAHTARI, GOOGLE_ANAHTARI (Places API — henüz tanımlı değil)
```

`import { env } from 'cloudflare:workers'` kullanılır. `@astrojs/cloudflare` v14'te
`Astro.locals.runtime.env` kaldırıldı.

---

## Yönetim paneli (`/yonetim`)

Cloudflare Access ile korunur — şifre yok, kimlik doğrulamayı tamamen Cloudflare
yapar. `paneleGiris()` jetonu ayrıca doğrular (alg/exp/aud/imza) ve Access
yapılandırılmamışsa 403 döner (güvenli varsayılan).

**Access uygulaması yalnızca `edmyapigayrimenkul.com/yonetim` yolunu kapsıyor.**
Bu yüzden panelin API uçları da `/yonetim/api/...` altında olmak zorunda —
kapsam dışındaki bir uca `Cf-Access-Jwt-Assertion` başlığı hiç ulaşmaz ve uç
herkesi yetkisiz sayar. (`/api/foto` bu yüzden `/yonetim/api/foto`'ya taşındı.)

Sayfalar: `index` (özet + senkron düğmesi), `talepler`, `ilanlar` (geçersiz
kılmalar, toplu işlem, görüntülenme), `gorsel/[id]` (sıra/kapak/gizleme/yükleme),
`paylasim` (sosyal medya görseli), `yorumlar`, `metinler`, `ekip`, `ayarlar`.

**Panel düzenlemeleri senkronu aşar:** `ilan_duzenleme` tablosundaki başlık ve
açıklama, `ilan_gorsel_duzen`'deki görsel sırası, gizleme kararları senkron
tarafından ezilmez. Bu tasarımın merkezinde: portal veriyi tazeler, insan kararı
üstte kalır.

---

## Tasarım sistemi

Kaynak: `kurumsal-kimlik/kurumsal-kimlik.html` (`govde.html` + `node derle.mjs`).
Site tarafındaki karşılığı `site/src/styles/global.css` içindeki `@theme` bloğu.

```
Kırmızı       #F0000D      Derin Kırmızı #C4030F
Mürekkep      #121316      Kağıt         #F4F4F3
Kireç         #E4E4E1      Kurşun        #8A8B8F

oran: %70 nötr / %25 mürekkep / %5 kırmızı
```

- **Sıcak krem tonlar bu kırmızıyla çakışır, kullanılmaz.**
- Kırmızı açık zeminde küçük metin olarak kullanılmaz (kontrast 4,4:1 — yalnızca
  18px+ veya buton dolgusu).
- Tipografi: **Fraunces** (başlık) · **IBM Plex Sans** (gövde) · **IBM Plex Mono**
  (m², fiyat, pafta/parsel — tüm rakamlar). Hepsi kendi sunucumuzda, latin +
  latin-ext (Türkçe ğ ş ı İ).
- Konumlandırma: "Trakya'da toprağı bilen, tapuya kadar yanınızda duran yerel
  emlak ofisi." Portföyün yarısı arsa/tarla olduğu için kimlik konut değil
  **toprak** üzerine kurulu.

### Hareket katmanı

`src/scripts/hareket.ts` — GSAP + ScrollTrigger + Lenis. Kurallar:

- JavaScript çalışmazsa sayfa **eksiksiz** görünür. Gizleme yalnızca
  `<html class="js-var">` geldiğinde devreye girer, o sınıfı da bu kod koyar.
- `prefers-reduced-motion` varsa hiçbir animasyon kurulmaz.
- **Güvenlik ağı zorunlu:** `gizliKalaniAc()` + ilk ekrandakileri beklemeden açma
  + `visibilitychange` + kaydırma durunca kontrol. Bu ağ olmadan "içerik görünmez
  kalıyor" hatası geri gelir; bu hata bu projede birden fazla kez yaşandı.
- Kaydırmaya bağlı hareketler: kahramanın çözülmesi, fotoğraf şeridinin hıza
  tepki vermesi, süreç adımlarının okuma çizgisine göre canlanması.

### Görünüm geçişleri (ClientRouter)

Açık. Bu yüzden **modül betikleri gezinince yeniden çalışmaz** ve kurulumların
`herSayfada()` ile tekrarlanması gerekir (`src/scripts/sayfa.ts`). Yeni bir
`<script>` bloğu yazarken bunu atlarsan harita açılmaz, galeri tıklanmaz,
filtreler ölür ve belirme animasyonu kurulmadığı için içerik görünmez kalır.

Pencereye/belgeye bağlanan dinleyiciler `AbortController` ile toplanır; sayfa
değişince `hareketiDurdur()` hepsini bırakır, ScrollTrigger'ları öldürür,
Lenis'i ve gsap ticker işini söker.

Kart fotoğrafının ilan sayfasına büyümesi: geçiş adı (`ilan-foto`) her karta
baştan yazılmaz, **tıklanan karta** yakalama evresinde verilir — sayfada aynı ad
tek öğede bulunabilir.

Ön yükleme bilerek `tap` (astro.config.mjs). ClientRouter varsayılanı `hover`;
sayfalar istek anında üretildiği için üzerinden geçilen her bağlantı gerçek bir
Worker çağrısı olurdu.

---

## Kapanmış konular — yeniden araştırma

Bunlar denendi ve sonuçlandı. Tekrar denemek zaman kaybı:

- **Hepsiemlak sunucudan kazınamaz.** Düz `fetch` 403, tam tarayıcı başlıklarıyla
  403, Cloudflare Browser Rendering ile de 403 ("Just a moment…"). Fotoğraflar
  bir kereliğine tarayıcı oturumuyla aktarıldı; otomatik yol yok.
- **Sahibinden API'si kapalı.** EIDS entegrasyonlu lisanslı ilan portalı olmayı
  ve imzalı sözleşmeyi gerektiriyor.
- **Nominatim Worker'dan çalışmaz** — veri merkezi IP'lerine boş yanıt döner
  (12 sorgunun 12'si). Koordinatlar yerelde `scripts/koordinat-coz.mjs` ile
  çözülüp D1'e yazılır; yeni mahalle eklenince ayda bir iki kez çalıştırılır.
- **Google Places API en fazla 5 yorum döndürür.** Kota değil, API'nin sabit
  sınırı. Yorumları göstermek atıf gerektirir: yazarın adı ve avatarı, Google'daki
  aslına bağlantı, "yorumlar Google tarafından doğrulanmaz" uyarısı.
- **Portal açıklamalarında satır sonu yok** (46 ilanın 46'sında). Paragraf bölme
  `aciklamaParcala()` içinde madde işaretleri, yıldızlar ve cümle sınırlarından
  yapılır. Kaynak metnin kendi yazım hataları düzeltilemez — panelde ilan bazında
  açıklama geçersiz kılma var.

## Tekrarlayan tuzaklar

- **Astro CSRF:** `checkOrigin` açık. Panel formlarından `fetch` ile POST ederken
  `Content-Type: application/json` gönder, yoksa "Cross-site POST form
  submissions are forbidden" alırsın.
- **`build.format: 'file'`** — olmadan her iç bağlantı 308 yönlendirmesi yapıyordu.
- **Canvas + portal fotoğrafı:** başka alan adından gelen görsel canvas'ı kirletir
  ve `toBlob()` kırılır. `/yonetim/api/gorsel` bu yüzden var.
- **Vite "504 Outdated Optimize Dep":** `node_modules/.vite` ve `.astro` sil.
- **`_redirects` konağa göre yönlendirme yapamaz** — www→apex Astro ara katmanında.

---

## Dağıtım

`node scripts/dagit.mjs` — `astro build` + `wrangler deploy`. Kimlik bilgileri
`.env`'den okunur. `workers_dev: false`; panel yalnızca Access'in koruduğu
alan adı üzerinden açılabilir.

Depo: `github.com/edmyapigayrimenkul/edm` (private).
