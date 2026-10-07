import type { Ilan } from './ilanlar';

/** Yalnız editoryal içeriği hazırlanan aramalar kalıcı adres kazanır. */
export const ARAMA_SAYFALARI = [
  {
    slug: 'silivri-satilik-daire',
    baslik: 'Silivri satılık daire',
    kisaBaslik: 'Satılık daireler',
    aciklama: 'Silivri satılık daire ilanlarını mahalle, oda düzeni, net alan ve bina bilgileriyle karşılaştırın. EDM portföyündeki güncel ilanlar ve inceleme soruları.',
    giris: 'Daire ararken oda sayısının yanında günlük yaşam düzenini de düşünün. İşe gidiş rotası, binanın ortak alanları ve evin kullanılabilir alanı seçenekleri daraltmanıza yardımcı olur. Burada İstanbul Silivri’deki satılık daire portföyümüzü bir arada inceleyebilirsiniz.',
    grup: 'konut',
    olcutler: [
      { baslik: 'Yaşam alanı', metin: 'Net ve brüt metrekareyi ayrı okuyun. Oda yerleşimini, mutfak ve banyo düzenini fotoğraflarla birlikte değerlendirin; ihtiyaç duyduğunuz ölçüleri yerinde kontrol edin.' },
      { baslik: 'Bina ve ortak kullanım', metin: 'Bulunduğu kat, asansör, ısıtma, otopark ve aidat bilgisini birlikte karşılaştırın. İlanda belirtilmeyen bir özelliği var kabul etmeyin; danışmandan teyit isteyin.' },
      { baslik: 'Mahalle ve günlük rota', metin: 'Aynı oda sayısındaki iki daire farklı yaşam düzenleri sunabilir. İş, okul ve alışveriş güzergâhınızı belirleyip çevreyi günün kullanacağınız saatlerinde ziyaret edin.' },
    ],
    sorular: [
      { soru: 'Bu sayfada hangi ilanlar var?', yanit: 'İstanbul’un Silivri ilçesinde, konut kategorisindeki satılık daireler yer alır. Villa, kiralık ve devren satılık ilanlar bu listeye dahil değildir.' },
      { soru: 'Fiyat ve alan bilgisini nasıl karşılaştırabilirim?', yanit: 'Karttaki fiyatın para birimini, ilanın net ve brüt alanını detay sayfasından kontrol edin. Eksik bilgiyi danışmana sorun; ilan fiyatını gerçekleşmiş satış fiyatı olarak değerlendirmeyin.' },
      { soru: 'Aradığım daire şu anda listede yoksa?', yanit: 'İhtiyacınız olan mahalle, oda düzeni ve bütçeyi iletişim sayfasından iletebilirsiniz. Bu sayfa güncel portföyü gösterir; tüm Silivri ilanlarını kapsamaz.' },
    ],
  },
  {
    slug: 'silivri-satilik-arsa-tarla',
    baslik: 'Silivri satılık arsa ve tarla',
    kisaBaslik: 'Satılık arsa ve tarlalar',
    aciklama: 'Silivri satılık arsa ve tarla portföyünü konum, alan ve parsel bilgileriyle inceleyin. EDM ilanları, arazi karşılaştırma soruları ve Silivri bölge rehberi.',
    giris: 'Arazi seçiminde metrekare ve fiyat ilk adımdır. Kullanım amacınız, parselin konumu, ulaşım ve belgelerdeki bilgiler birlikte değerlendirilmelidir. Burada İstanbul Silivri’deki satılık arsa, tarla ve diğer arazi alt türlerini aynı portföy içinde bulabilirsiniz.',
    grup: 'arsa',
    olcutler: [
      { baslik: 'Parsel ve alan', metin: 'İl, ilçe, mahalle, ada ve parsel bilgilerinin aynı taşınmazı işaret ettiğini kontrol edin. Toplam parsel alanı ile satışa konu hisse alanını birbirinden ayırın; eksik bilgileri teyit edin.' },
      { baslik: 'Kullanım amacı', metin: 'İlandaki arazi alt türünü ve imar açıklamasını okuyun. Yapı, tarım veya başka bir kullanım planınız varsa güncel belge ve ilgili kurum teyidi isteyin; bir ilan etiketiyle karar vermeyin.' },
      { baslik: 'Yerinde inceleme', metin: 'Ulaşım, yol bağlantısı, sınırlar ve varsa su ya da elektrik imkânlarını yerinde inceleyin. İki arazinin birim fiyatı benzer olsa da bu koşullar farklı olabilir.' },
    ],
    sorular: [
      { soru: 'Yalnız tarla ilanlarını mı gösteriyorsunuz?', yanit: 'Bu sayfa Silivri’de satılık arsa ve tarla grubundaki tüm arazi alt türlerini gösterir. İmar ve kullanım bilgisi her ilanın detayında ayrı değerlendirilmelidir. Kiralık ve kat karşılığı ilanlar bu listede yer almaz.' },
      { soru: 'Metrekare fiyatı tek başına yeterli mi?', yanit: 'Alan, hisse durumu, kullanım koşulları, konum ve ulaşım aynı olmadığı için yalnız metrekare fiyatıyla karar vermeyin. Bölge rehberindeki ortanca da yalnız EDM portföyündeki geçerli örnekleri özetler.' },
      { soru: 'Konumu haritada görünce parseli doğrulamış olur muyum?', yanit: 'Sitedeki harita yaklaşık konumu gösterir. Kesin taşınmazı ada ve parsel bilgileriyle kontrol edin; yerinde sınır ve erişim incelemesini ayrıca yapın.' },
    ],
  },
] as const;

export type AramaSayfasi = (typeof ARAMA_SAYFALARI)[number];
export function aramaSayfasiBul(slug: string | undefined): AramaSayfasi | undefined {
  return ARAMA_SAYFALARI.find((sayfa) => sayfa.slug === slug);
}

const duzlestir = (deger: string | null) => (deger ?? '').trim().normalize('NFKC').toLocaleLowerCase('tr-TR');

/** Başlıktaki kelimeler sınıflandırma yerine kullanılmaz. */
export function aramaSayfasiIlanlari<T extends Pick<Ilan, 'il' | 'ilce' | 'islem' | 'tipGrup' | 'tip'>>(sayfa: AramaSayfasi, ilanlar: readonly T[]): T[] {
  return ilanlar.filter((ilan) => duzlestir(ilan.il) === 'istanbul'
    && duzlestir(ilan.ilce) === 'silivri'
    && ilan.islem === 'satilik'
    && ilan.tipGrup === sayfa.grup
    && (sayfa.grup === 'arsa' || duzlestir(ilan.tip) === 'daire'));
}
