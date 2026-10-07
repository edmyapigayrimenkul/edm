import type { Ilan } from './ilanlar';

type SemaIlan = Pick<Ilan, 'baslikTemiz' | 'aciklama' | 'yol' | 'gorseller' | 'ilkGorulme' | 'guncellenme' | 'tipGrup' | 'tip' | 'oda' | 'alanlar' | 'koordinat' | 'il' | 'ilce' | 'fiyat' | 'paraBirimi' | 'islem'>;

const pozitifSayi = (deger: number | null): deger is number => deger !== null && Number.isFinite(deger) && deger > 0;
const tarih = (deger: string | null) => deger && Number.isFinite(Date.parse(deger)) ? deger : undefined;

/** İlan bir sayfadır; alan ve konum o sayfanın konusu olan taşınmaza aittir. */
export function ilanSemasi(ilan: SemaIlan, site: string | URL) {
  const url = new URL(ilan.yol, site).href;
  const konut = ilan.tipGrup === 'konut' || ilan.tipGrup === 'devre-mulk' || ilan.tipGrup === 'gunluk-konaklama';
  const tip = !konut ? 'Place' : ['daire', 'rezidans', 'yali-dairesi'].includes(ilan.tip)
    ? 'Apartment' : ['villa', 'mustakil-ev', 'ciftlik-evi', 'kosk-konak', 'yali', 'yazlik'].includes(ilan.tip)
      ? 'House' : 'Accommodation';
  const net = pozitifSayi(ilan.alanlar.netYapi) ? ilan.alanlar.netYapi : null;
  const brut = pozitifSayi(ilan.alanlar.brutYapi) ? ilan.alanlar.brutYapi : null;
  const alan = net ?? brut;
  const koordinat = ilan.koordinat;
  const konumGecerli = koordinat && Number.isFinite(koordinat.enlem) && Math.abs(koordinat.enlem) <= 90
    && Number.isFinite(koordinat.boylam) && Math.abs(koordinat.boylam) <= 180;
  // 2+1 düzenini sayısal oda adedi gibi göstermeyiz; salon kapsamı kaynakta ayrı değildir.
  const ekBilgiler = [
    ...(ilan.oda ? [{ '@type': 'PropertyValue', name: 'Oda düzeni', value: ilan.oda }] : []),
    ...(!konut && brut !== null ? [{ '@type': 'PropertyValue', name: 'Brüt kullanım alanı', value: brut, unitCode: 'MTK' }] : []),
    ...(!konut && net !== null ? [{ '@type': 'PropertyValue', name: 'Net kullanım alanı', value: net, unitCode: 'MTK' }] : []),
    ...(pozitifSayi(ilan.alanlar.toplamParsel) ? [{ '@type': 'PropertyValue', name: 'Toplam parsel alanı', value: ilan.alanlar.toplamParsel, unitCode: 'MTK' }] : []),
    ...(pozitifSayi(ilan.alanlar.satilanHisse) ? [{ '@type': 'PropertyValue', name: 'Satılan hisse alanı', value: ilan.alanlar.satilanHisse, unitCode: 'MTK' }] : []),
    ...(pozitifSayi(ilan.alanlar.beyanEdilen) ? [{ '@type': 'PropertyValue', name: 'Kaynak alanı · kapsamı teyit edilecek', value: ilan.alanlar.beyanEdilen, unitCode: 'MTK' }] : []),
  ];
  const fiyatGecerli = ilan.islem !== 'kat-karsiligi-satilik' && pozitifSayi(ilan.fiyat);
  return {
    '@context': 'https://schema.org', '@type': 'RealEstateListing',
    name: ilan.baslikTemiz, description: ilan.aciklama.slice(0, 400), url,
    image: ilan.gorseller.slice(0, 8), datePosted: tarih(ilan.ilkGorulme), dateModified: tarih(ilan.guncellenme),
    about: {
      '@type': tip, '@id': `${url}#tasinmaz`, name: ilan.baslikTemiz,
      ...(ilan.ilce ? { address: { '@type': 'PostalAddress', addressLocality: ilan.ilce, addressRegion: ilan.il ?? undefined, addressCountry: 'TR' } } : {}),
      ...(konumGecerli ? { geo: { '@type': 'GeoCoordinates', name: 'Yaklaşık konum', latitude: koordinat.enlem, longitude: koordinat.boylam } } : {}),
      ...(konut && alan !== null ? { floorSize: { '@type': 'QuantitativeValue', name: net !== null ? 'Net yapı alanı' : 'Brüt yapı alanı', value: alan, unitCode: 'MTK' } } : {}),
      ...(ekBilgiler.length ? { additionalProperty: ekBilgiler } : {}),
    },
    offers: {
      '@type': 'Offer', ...(fiyatGecerli ? { price: ilan.fiyat, priceCurrency: ilan.paraBirimi } : {}),
      availability: 'https://schema.org/InStock',
      businessFunction: ilan.islem.endsWith('satilik') ? 'http://purl.org/goodrelations/v1#Sell' : 'http://purl.org/goodrelations/v1#LeaseOut',
      seller: { '@id': new URL('/#kurum', site).href },
    },
  };
}

export function ilanSayfaYolu(ilan: Pick<Ilan, 'il' | 'ilce' | 'baslikTemiz' | 'yol'>, site: string | URL) {
  const sorgu = new URLSearchParams();
  if (ilan.il) sorgu.set('il', ilan.il);
  if (ilan.ilce) sorgu.set('ilce', ilan.ilce);
  return [
    { name: 'Ana Sayfa', item: new URL('/', site).href },
    { name: 'İlanlar', item: new URL('/ilanlar', site).href },
    ...(ilan.ilce ? [{ name: ilan.ilce, item: new URL(`/ilanlar?${sorgu}`, site).href }] : []),
    { name: ilan.baslikTemiz, item: new URL(ilan.yol, site).href },
  ];
}
