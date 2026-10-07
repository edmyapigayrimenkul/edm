# postedm → web sitesi içerik yayını

Tarih: 18 Eylül 2026

## Mevcut durum

`postedm` iki ayrı içerik türü taşıyor:

- portföy ilanları,
- haber/rehber/evergreen bilgi içerikleri.

İlan tarafı canlı site D1 kuyruğuna bağlanmış durumda. Panelde seçilen ilan,
yayından hemen önce siteden güncel fiyat, aktiflik ve görselle alınarak sosyal
hesaplara gönderiliyor. Bu bölümde eski JSON fiyatıyla paylaşım riski kapatılmış.

Haber tarafı `postedm/data/edm.db` içindeki `haberler` tablosunda tutuluyor. Kaynak
başlığı/URL'si, üretilen manşet, detay metni, Instagram/Threads metni, görseller,
yayın durumu ve platform kimlikleri mevcut. 18 Eylül'de 8 kayıt sosyal medyada
`yayinlandi` durumundaydı.

Site tarafında ise şimdiden üç içerik alanı hazır:

- `/bulten`: güncel piyasa ve düzenleme yazıları,
- `/sozluk`: kalıcı emlak terimleri,
- `/rehber/bilgi`: uzun ömürlü tapu, kira ve imar rehberleri.

Bu yeni yollar yerel derlemede çalışıyor fakat henüz canlıda değiller.

## Doğru bağlantı modeli

SQLite dosyasını web sitesine kopyalamak yerine onaylanan içeriği site API'sine
göndermek gerekir:

1. Telegram'da içerik onaylanır.
2. Sosyal platform yayınları tamamlanır.
3. `postedm`, aynı içerikten web için başlık, spot, gövde, kaynaklar, kategori,
   kapak ve yayın tarihini oluşturur.
4. Kısa ömürlü GitHub Actions OIDC kimliğiyle site API'sine gönderir.
5. Site D1 kaydı önce `taslak` olur; yönetim panelinden gözden geçirilip `yayinda`
   durumuna alınır.
6. Yalnız `yayinda` içerik bülten/rehber listesine ve site haritasına girer.

İlan kuyruğunda kullanılan OIDC doğrulaması bu akışta yeniden kullanılabilir;
yeni, uzun ömürlü ortak bir anahtar üretmek gerekmez.

## Yayın sözleşmesi

Web kaydı şu alanları taşımalıdır:

- `dis_kimlik`: `postedm:haber:<id>` biçiminde tekil kimlik,
- `tur`: `bulten`, `rehber` veya `sozluk`,
- `slug`, `baslik`, `spot`, `govde`, `kategori`,
- `kaynak_adlari` ve `kaynak_url_listesi`,
- `kapak_url`, `sosyal_url_listesi`,
- `orijinal_yayin`, `site_yayini`, `guncelleme`,
- `durum`: `taslak`, `yayinda`, `arsiv`,
- `hukuki_inceleme`: `gerekli`, `tamam`, `uygulanmaz`.

Hukuk, vergi, kredi ve imar içerikleri kaynak gösterilmeden veya “hukuki inceleme
tamam” işareti olmadan canlıya çıkmamalıdır. `postedm` içeriği sosyal medya için
etkili kısaltabilir; web sayfası kaynak, tarih, kapsam ve düzeltme notu taşımak
zorundadır.

## Uygulanan güvenli taslak katmanı

Siteye `0006-icerik-yayini.sql` D1 şeması ve `/api/postedm/icerik` alım ucu eklendi.
Bu uç mevcut GitHub Actions OIDC kimliğini kullanıyor ve dış sistemden gelen kaydı
her koşulda `taslak` olarak saklıyor. `postedm` doğrudan canlı içerik yayınlayamıyor.

Alım ucu şunları zorunlu tutuyor:

- `postedm:haber:<id>` biçiminde tekil dış kimlik,
- güvenli slug, yeterli başlık, spot ve web metni,
- en az bir doğrulanabilir HTTPS kaynak bağlantısı,
- dış ağ URL'leri ve geçerli tarih biçimi.

Hukuk, vergi, kredi, imar, tapu, kira, tahliye ve mevzuat konuları otomatik olarak
`hukuki_inceleme = gerekli` işareti alıyor. Aynı `dis_kimlik` tekrar gönderilirse
eski yayın durumunu korumak yerine yeniden taslağa çekiliyor; böylece değişen metin
editör görmeden canlı kalmıyor.

## Sonraki uygulama adımı

Mevcut sabit Bülten/Sözlük/Rehber verileri önce editoryal doğruluk taramasından
geçirilecek. Ardından yönetim taslak inceleme ekranı ve yalnız `yayinda` kayıtları
okuyan site veri katmanı eklenecek. Bu tamamlanana kadar yeni yerel içerik yolları
canlıya alınmamalıdır.
