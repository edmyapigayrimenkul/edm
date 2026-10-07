/**
 * Bölge rehberi.
 *
 * Sayısal her şey portföyden hesaplanır — elle yazılan tek şey, coğrafi
 * konumu anlatan kısa giriş metni. Portföy değiştikçe sayfalar kendiliğinden
 * güncellenir; hiçbir rakam kopyalanıp yapıştırılmaz.
 */

import { portfoy, slugla, type Ilan } from './ilanlar';
import { icerik, type BolgeMetni } from './icerik';
import { bolgeyeGoreGrupla, arsaBirimFiyatOzeti } from './bolge-verisi.ts';
import { bolgeRehberiBul } from './bolge-rehberi.ts';
import { arsaToplamAlani, fiyatGruplariHesapla, type FiyatGrubu } from './portfoy-istatistikleri';
import { istekVerisi, istekVerisiniTemizle } from './istek-onbellegi';

/**
 * Kod içindeki varsayılan tanıtımlar. Panelden düzenlenirse D1'deki metin
 * bunların yerine geçer; tablo boşsa buradakiler kullanılır.
 */
export const TANIMLAR: Record<string, { giris: string; notlar: string[] }> = {
  Silivri: {
    giris: bolgeRehberiBul('İstanbul', 'Silivri')!.giris,
    notlar: [],
  },
  Merkez: {
    giris: bolgeRehberiBul('Edirne', 'Merkez')!.giris,
    notlar: [],
  },
  Meriç: {
    giris: bolgeRehberiBul('Edirne', 'Meriç')!.giris,
    notlar: [],
  },
  Lalapaşa: {
    giris: bolgeRehberiBul('Edirne', 'Lalapaşa')!.giris,
    notlar: [],
  },
  Enez: {
    giris: bolgeRehberiBul('Edirne', 'Enez')!.giris,
    notlar: [],
  },
  Malkara: {
    giris: bolgeRehberiBul('Tekirdağ', 'Malkara')!.giris,
    notlar: [],
  },
  Marmaraereğlisi: {
    giris: bolgeRehberiBul('Tekirdağ', 'Marmaraereğlisi')!.giris,
    notlar: [],
  },
};

export interface Bolge {
  ad: string;
  slug: string;
  il: string;
  ilce: string;
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
  fiyatGruplari: FiyatGrubu[];
  /** Geçerli fiyat/alan taşıyan TL satılık arazi örnekleri; genel piyasa değildir. */
  birimFiyatOrnekSayisi: number;
  ortancaBirimFiyat: number | null;
  arsaToplamAlan: number;
}

function bolgeKur(ad: string, ilanlar: Ilan[], panelMetni?: BolgeMetni): Bolge {
  const birimFiyat = arsaBirimFiyatOzeti(ilanlar);

  const il = ilanlar[0]?.il ?? '';
  // "Merkez" tek başına anlamsız; il adıyla birlikte anılıyor.
  const gorunenAd = ad === 'Merkez' ? `${il} Merkez` : ad;
  // Panelden yazılmış metin varsa o kazanır; yoksa koddaki varsayılan.
  const rehber = bolgeRehberiBul(il, ad);
  const tanim = panelMetni?.giris
    ? { giris: panelMetni.giris, notlar: panelMetni.notlar }
    : rehber ? { giris: rehber.giris, notlar: [] } : undefined;

  return {
    ad: gorunenAd,
    slug: slugla(`${il}-${ad}`),
    il,
    ilce: ad,
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
    fiyatGruplari: fiyatGruplariHesapla(ilanlar),
    birimFiyatOrnekSayisi: birimFiyat.adet,
    ortancaBirimFiyat: birimFiyat.ortanca,
    arsaToplamAlan: arsaToplamAlani(ilanlar),
  };
}

export function bolgeOnbellegiTemizle(): void {
  istekVerisiniTemizle('bolgeler');
}

export async function bolgeler(): Promise<Bolge[]> {
  return istekVerisi('bolgeler', bolgeleriOku);
}

async function bolgeleriOku(): Promise<Bolge[]> {
  const [{ ilanlar }, { bolgeMetinleri }] = await Promise.all([portfoy(), icerik()]);
  const gruplu = bolgeyeGoreGrupla(ilanlar);
  const ilceSayilari = new Map<string, number>();
  for (const liste of gruplu) {
    const ad = liste[0].ilce!;
    ilceSayilari.set(ad, (ilceSayilari.get(ad) ?? 0) + 1);
  }

  const veri = gruplu
    .map((liste) => {
      const { il, ilce } = liste[0];
      // Eski panel metni yalnız ilçe adı tek bir ile aitse geri uyum sağlar.
      const metin = bolgeMetinleri.get(slugla(`${il ?? ''}-${ilce}`))
        ?? (ilceSayilari.get(ilce!) === 1 ? bolgeMetinleri.get(ilce!) : undefined);
      return bolgeKur(ilce!, liste, metin);
    })
    .sort((a, b) => b.adet - a.adet);

  return veri;
}

export async function bolgeBul(slug: string): Promise<Bolge | undefined> {
  return (await bolgeler()).find((b) => b.slug === slug);
}
