# Açık kaynak ilan alanı referans notları

Tarih: 23 Eylül 2026  
Amaç: Sahibinden Ofisim hesabına erişmeden, açık kategori ve ilan sayfalarının
gösterdiği alan ailelerini EDM ilan şemasına güvenli biçimde aktarmak.

## Konut projeleri

- [Sahibinden konut projeleri](https://www.sahibinden.com/konut-projeleri-daire)
  liste filtresinde proje durumu, fiyat, brüt metrekare, oda sayısı, ısıtma, site,
  kredi, otopark ve tapu bilgilerini gösterir.
- Açık proje detayları proje kartında teslim tarihi, blok, konut/ticari ünite sayısı,
  satılık planlar ile brüt/net metrekareyi yayınlar. Bu nedenle `blok_sayisi`,
  `konut_adedi`, `ticari_adet`, `daire_planlari`, satış ve teslim alanları ayrı
  yapılandırılmış veri olarak tutulur.

## İş yeri ve komple bina

- [Devren restoran ilanları](https://www.sahibinden.com/devren-restoran-lokanta)
  masa sayısı, kişi kapasitesi ve tapu filtrelerini gösterir. Bunlar restoran ailesi
  için koşullu alanlardır.
- Açık komple bina ve ofis sonuçları kat sayısı, bir kattaki daire, ısıtma,
  bina yaşı, oda/bölüm ve bulunduğu kat gibi yapısal bilgileri kullanır. Bunlar bina
  ve ofis şablonlarının çekirdek alanlarıdır.
- [Satılık akaryakıt istasyonu ilanları](https://www.sahibinden.com/satilik-is-yeri-akaryakit-istasyonu/emlak-ofisinden)
  açık alan, kapalı alan ve pompa sayısını ilan sütunlarında gösterir. `Pompa Sayısı`
  bu yüzden istasyon türünde zorunlu yapılandırılmış alandır.

## Turistik tesis

- [Satılık otel ilanları](https://www.sahibinden.com/satilik-otel) yıldız ve oda
  sayısını; [butik otel ilanları](https://www.sahibinden.com/satilik-butik-otel)
  oda ve yatak sayısını listeler.
- [Satılık apart otel ilanları](https://www.sahibinden.com/satilik-apart-otel/emlak-ofisinden)
  apart sayısını ayrıca gösterir. Bu değer yalnız `apart-otel` türünde zorunludur.

## Uygulama sınırı

Açık sayfalar alan ailelerini ve kullanıcıya görünen filtreleri doğrular. Ofisim'de
oturum arkasında kalan zorunluluk, sıra ve platforma özel teknik kural değişirse,
ekran görüntüsü son karşılaştırma için kullanılacaktır. Kullanıcı veya müşteri verisi
içeren görüntü paylaşılmamalıdır.

## İlgili resmî kurallar

- [Sahibinden ilan verme yardımı](https://yardim.sahibinden.com/hc/tr/articles/360020078439-Nas%C4%B1l-%C4%B0lan-Verebilirim)
  başlık, fiyat, ürün ayrıntısı, fotoğraf ve video akışını açıklar.
- [EİDS duyurusu](https://yardim.sahibinden.com/hc/tr/articles/37623146149521-Elektronik-%C4%B0lan-Do%C4%9Frulama-Sistemi-E%C4%B0DS-Nedir-Nas%C4%B1l-Kullan%C4%B1l%C4%B1r)
  ilan yetkisi ve e-Devlet sürecinin izlenmesini gerektirir.
