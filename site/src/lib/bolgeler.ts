/**
 * Bölge rehberi.
 *
 * Sayısal her şey portföyden hesaplanır — elle yazılan tek şey, coğrafi
 * konumu anlatan kısa giriş metni. Portföy değiştikçe sayfalar kendiliğinden
 * güncellenir; hiçbir rakam kopyalanıp yapıştırılmaz.
 */

import { portfoy, slugla, type Ilan } from './ilanlar';
import { icerik, type BolgeMetni } from './icerik';

/**
 * Kod içindeki varsayılan tanıtımlar. Panelden düzenlenirse D1'deki metin
 * bunların yerine geçer; tablo boşsa buradakiler kullanılır.
 */
export const TANIMLAR: Record<string, { giris: string; notlar: string[] }> = {
  Silivri: {
    giris:
      'İstanbul’un batı ucunda, Marmara kıyısında bir ilçe. Şehir merkezine D-100 ve Kuzey Marmara Otoyolu ile bağlanıyor; bu ikisi bölgedeki arsa değerinin en belirleyici unsuru. Sahil bandı yazlık ve site yerleşimiyle dolu, kuzeye doğru çıkıldıkça tarım arazisi başlıyor.',
    notlar: [
      'Sahil bandı (Selimpaşa, Mimar Sinan, Klassis çevresi) daha çok villa ve site içi konut.',
      'Merkez mahalleler daire ağırlıklı; kapalı otopark ve asansör fiyatı belirgin şekilde ayırıyor.',
      'Kuzeydeki köyler (Seymen, Gazitepe, Balaban, Kavaklı, Ortaköy) arsa ve tarla bölgesi.',
    ],
  },
  Merkez: {
    giris:
      'Edirne il merkezi ve çevresi. Şehrin dışına doğru uzanan geniş tarım arazileri, hem çiftlik kurmak isteyenler hem de uzun vadeli arazi yatırımcısı için portföyümüzün önemli bir bölümünü oluşturuyor.',
    notlar: [
      'Yıldırım Beyazıt ve Hacı Saraf çevresinde büyük parselli tarlalar.',
      'Yeni İmaret tarafında çiftlik ölçeğinde araziler bulunuyor.',
    ],
  },
  Meriç: {
    giris:
      'Edirne’nin güneybatısında, adını aldığı Meriç Nehri boyunca uzanan tarım ilçesi. Nehir yakınlığı sulama imkânı demek; bu da tarla değerini doğrudan etkiliyor.',
    notlar: [
      'Nehre yakın parseller sulama avantajı taşıyor.',
      'Kara Yusuflu, Rahmanca ve Olacak çevresinde parsel bazlı tarla portföyümüz var.',
    ],
  },
  Lalapaşa: {
    giris:
      'Edirne’nin kuzeyinde, Bulgaristan sınırına yakın kırsal ilçe. Büyük parselli, çiftlik kurmaya elverişli araziler bakımından zengin.',
    notlar: ['Hacıdanişment çevresinde ova konumlu, ana asfalta cepheli araziler.'],
  },
  Enez: {
    giris:
      'Edirne’nin Ege ve Marmara arasındaki kıyı ilçesi, Meriç Nehri’nin denize döküldüğü noktada. Hem tarım hem de kıyı turizmi potansiyeli taşıyor.',
    notlar: ['Küçükevren ve çevresinde tarla portföyü.'],
  },
  Malkara: {
    giris:
      'Tekirdağ’ın iç kesiminde, Trakya’nın tarım merkezlerinden biri. Silivri ile Edirne arasındaki güzergâhta yer alıyor.',
    notlar: ['Köy içi ve köy yakını arsalar ağırlıkta.'],
  },
  Marmaraereğlisi: {
    giris:
      'Tekirdağ’ın Marmara kıyısındaki ilçesi. Silivri’ye komşu; yazlık ve villa yerleşimi bakımından benzer bir karakter taşıyor.',
    notlar: ['Sultanköy çevresinde villa portföyü.'],
  },
};

export interface Bolge {
  ad: string;
  slug: string;
  il: string;
  yol: string;
  giris: string | null;
  notlar: string[];
  ilanlar: Ilan[];
  adet: number;
  satilik: number;
  kiralik: number;
  konut: number;
  arsa: number;
  mahalleler: string[];
  enDusuk: number | null;
  enYuksek: number | null;
  /** Arsa/tarlada m² başına ortanca fiyat — bölgeler arası tek anlamlı kıyas. */
  ortancaBirimFiyat: number | null;
  toplamAlan: number;
}

function ortanca(sayilar: number[]): number | null {
  if (sayilar.length === 0) return null;
  const s = [...sayilar].sort((a, b) => a - b);
  const orta = Math.floor(s.length / 2);
  return s.length % 2 ? s[orta] : Math.round((s[orta - 1] + s[orta]) / 2);
}

function bolgeKur(ad: string, ilanlar: Ilan[], panelMetni?: BolgeMetni): Bolge {
  const fiyatlar = ilanlar.map((i) => i.fiyat).filter((f): f is number => Boolean(f));
  const birimler = ilanlar
    .filter((i) => i.islem === 'satilik' && i.tipGrup === 'arsa' && i.fiyat && i.m2)
    .map((i) => i.fiyat! / i.m2!);

  const il = ilanlar[0]?.il ?? '';
  // "Merkez" tek başına anlamsız; il adıyla birlikte anılıyor.
  const gorunenAd = ad === 'Merkez' ? `${il} Merkez` : ad;
  // Panelden yazılmış metin varsa o kazanır; yoksa koddaki varsayılan.
  const tanim = panelMetni?.giris
    ? { giris: panelMetni.giris, notlar: panelMetni.notlar }
    : TANIMLAR[ad];

  return {
    ad: gorunenAd,
    slug: slugla(`${il}-${ad}`),
    il,
    yol: `/rehber/${slugla(`${il}-${ad}`)}`,
    giris: tanim?.giris ?? null,
    notlar: tanim?.notlar ?? [],
    ilanlar,
    adet: ilanlar.length,
    satilik: ilanlar.filter((i) => i.islem === 'satilik').length,
    kiralik: ilanlar.filter((i) => i.islem === 'kiralik').length,
    konut: ilanlar.filter((i) => i.tipGrup === 'konut').length,
    arsa: ilanlar.filter((i) => i.tipGrup === 'arsa').length,
    mahalleler: [...new Set(ilanlar.map((i) => i.mahalle).filter(Boolean))] as string[],
    enDusuk: fiyatlar.length ? Math.min(...fiyatlar) : null,
    enYuksek: fiyatlar.length ? Math.max(...fiyatlar) : null,
    ortancaBirimFiyat: birimler.length >= 2 ? ortanca(birimler.map(Math.round)) : null,
    toplamAlan: ilanlar.reduce((t, i) => t + (i.m2 ?? 0), 0),
  };
}

let onbellek: { veri: Bolge[]; zaman: number } | null = null;
const ONBELLEK_MS = 60_000;

export async function bolgeler(): Promise<Bolge[]> {
  if (onbellek && Date.now() - onbellek.zaman < ONBELLEK_MS) return onbellek.veri;

  const [{ ilanlar }, { bolgeMetinleri }] = await Promise.all([portfoy(), icerik()]);
  const gruplu = new Map<string, Ilan[]>();
  for (const ilan of ilanlar) {
    if (!ilan.ilce) continue;
    const mevcut = gruplu.get(ilan.ilce);
    if (mevcut) mevcut.push(ilan);
    else gruplu.set(ilan.ilce, [ilan]);
  }

  const veri = [...gruplu]
    .map(([ad, liste]) => bolgeKur(ad, liste, bolgeMetinleri.get(ad)))
    .sort((a, b) => b.adet - a.adet);

  onbellek = { veri, zaman: Date.now() };
  return veri;
}

export async function bolgeBul(slug: string): Promise<Bolge | undefined> {
  return (await bolgeler()).find((b) => b.slug === slug);
}
