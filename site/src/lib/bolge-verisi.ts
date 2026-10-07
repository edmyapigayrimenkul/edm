import { tasinmazGrupAnahtari } from './ilan-butunlugu.ts';

export function bolgeKimligi(il: string | null, ilce: string | null): string {
  return JSON.stringify([il, ilce].map((deger) => (deger ?? '').trim().normalize('NFKC').toLocaleLowerCase('tr-TR')));
}

/** Merkez gibi ortak ilçe adları farklı illerin ilanlarını birleştirmesin. */
export function bolgeyeGoreGrupla<T extends { il: string | null; ilce: string | null }>(ilanlar: readonly T[]): T[][] {
  const gruplar = new Map<string, T[]>();
  for (const ilan of ilanlar) {
    if (!ilan.ilce?.trim()) continue;
    const kimlik = bolgeKimligi(ilan.il, ilan.ilce);
    const liste = gruplar.get(kimlik);
    if (liste) liste.push(ilan);
    else gruplar.set(kimlik, [ilan]);
  }
  return [...gruplar.values()];
}

interface ArsaOrnegi {
  id: string;
  islem: string;
  tipGrup: string;
  paraBirimi: string;
  fiyat: number | null;
  alanlar: { karsilastirmaM2: number | null };
}

/** Aynı taşınmazın alternatif ilanı örnek sayısını ve ortancayı büyütmesin. */
export function arsaBirimFiyatOzeti(ilanlar: readonly ArsaOrnegi[]): { adet: number; ortanca: number | null } {
  const birimler: number[] = [];
  const gorulen = new Set<string>();
  for (const ilan of ilanlar) {
    const alan = ilan.alanlar.karsilastirmaM2;
    if (ilan.islem !== 'satilik' || ilan.tipGrup !== 'arsa' || ilan.paraBirimi !== 'TRY') continue;
    if (ilan.fiyat === null || alan === null || !Number.isFinite(ilan.fiyat) || !Number.isFinite(alan) || ilan.fiyat <= 0 || alan <= 0) continue;
    const birim = ilan.fiyat / alan;
    if (!Number.isFinite(birim) || birim <= 0) continue;
    const kimlik = tasinmazGrupAnahtari(ilan.id);
    if (gorulen.has(kimlik)) continue;
    gorulen.add(kimlik);
    birimler.push(birim);
  }
  birimler.sort((a, b) => a - b);
  const orta = Math.floor(birimler.length / 2);
  return {
    adet: birimler.length,
    ortanca: birimler.length < 2 ? null : Math.round(birimler.length % 2 ? birimler[orta] : (birimler[orta - 1] + birimler[orta]) / 2),
  };
}
