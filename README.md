# EDM Yapı & Gayrimenkul

[edmyapigayrimenkul.com](https://edmyapigayrimenkul.com) — Silivri merkezli emlak ofisinin
kurumsal sitesi ve marka kimliği.

Projenin yaşayan hafızası, sıralı iş listesi ve çalışma günlüğü:
[`codex.md`](./codex.md). Yeni bir geliştirmeye başlamadan önce bu dosya okunur ve
iş tamamlandığında görev durumu aynı dosyada güncellenir.

## Klasörler

| Klasör | İçerik |
|---|---|
| `site/` | Web sitesi — Astro + Cloudflare Worker |
| `kurumsal-kimlik/` | Marka kılavuzu (logo, renk, tipografi, yazım dili) |
| `yeni logo/` | Logo kaynak dosyaları (CDR, TIF, PNG) |

## Site nasıl çalışıyor

Tek bir Cloudflare Worker iki iş yapıyor:

- **`fetch`** — sayfaları istek anında üretir, ilan verisini D1 veritabanından okur
- **`scheduled`** — günde 4 kez (03:00, 09:00, 15:00, 21:00 UTC) Emlakjet portföyünü tarar

Portalda görünmeyen ilan silinmez, `pasif` olur: listeden ve site haritasından düşer,
detay adresi 404 döner. Emlakjet bir çalıştırmada hiç ilan döndürmezse hiçbir şey yazılmaz —
tek bir hatalı yanıt yüzünden portföyün tamamı kapanmasın diye.

## Komutlar

```bash
cd site
npm install

npm run dev        # yerel geliştirme
node scripts/dagit.mjs   # derle + Cloudflare'e yükle
```

Elle senkron (yeni ilan yayınlandığında beklemeden güncellemek için):

```bash
curl -X POST https://edmyapigayrimenkul.com/api/senkron \
  -H "Content-Type: application/json" \
  -H "X-Senkron-Anahtari: <anahtar>"
```

Senkron durumu herkese açık: `https://edmyapigayrimenkul.com/api/senkron`

## Gerekli ortam değişkenleri

`site/.env` (depoya girmez, örneği `site/.env.example`):

```
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
```

Worker gizli değişkenleri `wrangler secret put` ile ayarlanır: `SENKRON_ANAHTARI`.
