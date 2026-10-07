import { tasinmazGrupAnahtari } from './ilan-butunlugu.ts';

interface IstatistikIlani {
  id: string;
  islem: string;
  tipGrup: string;
  fiyat: number | null;
  m2: number | null;
  paraBirimi: string;
  alanlar?: { karsilastirmaM2: number | null };
}

export interface FiyatGrubu {
  kimlik: string;
  etiket: string;
  islem: string;
  tipGrup: string;
  paraBirimi: string;
  donem: string;
  adet: number;
  enDusuk: number;
  enYuksek: number;
}

const ISLEM_ETIKETI: Record<string, string> = {
  satilik: 'Satılık',
  kiralik: 'Kiralık',
  'gunluk-kiralik': 'Günlük kiralık',
  'sezonluk-kiralik': 'Sezonluk kiralık',
  'devren-satilik': 'Devren satılık',
  'devren-kiralik': 'Devren kiralık',
  'kat-karsiligi-satilik': 'Kat karşılığı satılık',
};

const TIP_ETIKETI: Record<string, string> = {
  konut: 'konut',
  arsa: 'arsa & tarla',
  isyeri: 'iş yeri',
  bina: 'komple bina',
  turistik: 'turistik tesis',
  proje: 'konut projesi',
  diger: 'diğer gayrimenkul',
};

const ISLEM_SIRASI = ['satilik', 'kiralik', 'gunluk-kiralik', 'sezonluk-kiralik', 'devren-satilik', 'devren-kiralik', 'kat-karsiligi-satilik'];
const TIP_SIRASI = ['konut', 'arsa', 'isyeri', 'bina', 'turistik', 'proje', 'diger'];
const PARA_SIRASI = ['TRY', 'EUR', 'USD', 'GBP'];
const TEMEL_GRUP_SIRASI: Record<string, number> = {
  'satilik:konut': 0,
  'kiralik:konut': 1,
  'satilik:arsa': 2,
};
const DONEM: Record<string, string> = {
  kiralik: '/ay',
  'gunluk-kiralik': '/gün',
  'sezonluk-kiralik': '/sezon',
};

/** Satış toplamı ile kira bedelini veya farklı para birimlerini aynı aralığa sokmaz. */
export function fiyatGruplariHesapla(ilanlar: readonly IstatistikIlani[]): FiyatGrubu[] {
  const gruplar = new Map<string, FiyatGrubu>();

  for (const ilan of ilanlar) {
    if (!ilan.fiyat || ilan.fiyat <= 0) continue;
    const paraBirimi = ilan.paraBirimi || 'TRY';
    const kimlik = `${ilan.islem}:${ilan.tipGrup}:${paraBirimi}`;
    const mevcut = gruplar.get(kimlik);
    if (mevcut) {
      mevcut.adet += 1;
      mevcut.enDusuk = Math.min(mevcut.enDusuk, ilan.fiyat);
      mevcut.enYuksek = Math.max(mevcut.enYuksek, ilan.fiyat);
      continue;
    }

    gruplar.set(kimlik, {
      kimlik,
      etiket: `${ISLEM_ETIKETI[ilan.islem] ?? ilan.islem} ${TIP_ETIKETI[ilan.tipGrup] ?? ilan.tipGrup}`,
      islem: ilan.islem,
      tipGrup: ilan.tipGrup,
      paraBirimi,
      donem: DONEM[ilan.islem] ?? '',
      adet: 1,
      enDusuk: ilan.fiyat,
      enYuksek: ilan.fiyat,
    });
  }

  return [...gruplar.values()].sort((a, b) => {
    const aTemel = TEMEL_GRUP_SIRASI[`${a.islem}:${a.tipGrup}`];
    const bTemel = TEMEL_GRUP_SIRASI[`${b.islem}:${b.tipGrup}`];
    if (aTemel !== undefined || bTemel !== undefined) {
      if (aTemel === undefined) return 1;
      if (bTemel === undefined) return -1;
      if (aTemel !== bTemel) return aTemel - bTemel;
    }
    if (a.islem === b.islem && a.tipGrup === b.tipGrup) {
      const aPara = PARA_SIRASI.indexOf(a.paraBirimi);
      const bPara = PARA_SIRASI.indexOf(b.paraBirimi);
      if (aPara !== bPara) return (aPara < 0 ? PARA_SIRASI.length : aPara) - (bPara < 0 ? PARA_SIRASI.length : bPara);
    }
    const islem = ISLEM_SIRASI.indexOf(a.islem) - ISLEM_SIRASI.indexOf(b.islem);
    if (islem !== 0) return islem;
    const tip = TIP_SIRASI.indexOf(a.tipGrup) - TIP_SIRASI.indexOf(b.tipGrup);
    if (tip !== 0) return tip;
    return a.paraBirimi.localeCompare(b.paraBirimi);
  });
}

/** Yalnızca arsa/arazi alanını ve her fiziksel taşınmazı bir kez toplar. */
export function arsaToplamAlani(ilanlar: readonly IstatistikIlani[]): number {
  const gorulen = new Set<string>();
  let toplam = 0;

  for (const ilan of ilanlar) {
    const sunulanAlan = ilan.alanlar ? ilan.alanlar.karsilastirmaM2 : ilan.m2;
    if (ilan.tipGrup !== 'arsa' || !sunulanAlan || sunulanAlan <= 0) continue;
    const anahtar = tasinmazGrupAnahtari(ilan.id);
    if (gorulen.has(anahtar)) continue;
    gorulen.add(anahtar);
    toplam += sunulanAlan;
  }

  return toplam;
}
