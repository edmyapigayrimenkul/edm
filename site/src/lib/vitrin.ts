export interface VitrinKaydi {
  id: string;
  tip: string;
  kategori: string;
  tipGrup: string;
  fiyat: number | null;
}

type VitrinGrubu = 'daire' | 'villa' | 'arazi' | 'konut-diger' | 'diger';

function vitrinGrubu(ilan: VitrinKaydi): VitrinGrubu {
  const tip = `${ilan.tip} ${ilan.kategori}`.toLocaleLowerCase('tr-TR');
  if (ilan.tipGrup === 'arsa' || /arsa|tarla|bağ|bahçe|villa imarlı|imarli/.test(tip)) return 'arazi';
  if (ilan.tipGrup === 'devre-mulk' || ilan.tipGrup === 'gunluk-konaklama') return 'konut-diger';
  if (ilan.tipGrup === 'konut' || /daire|rezidans|apart/.test(tip)) {
    if (/daire|rezidans|apart/.test(tip)) return 'daire';
    if (/villa|müstakil|yazlık|yalı/.test(tip)) return 'villa';
    return 'konut-diger';
  }
  if (/villa|müstakil|yazlık|yalı/.test(tip)) return 'villa';
  return 'diger';
}

/** Seçkide mümkün olduğunda her ana portföy grubuna yer verir. */
export function vitrinIlanlariniDengele<T extends VitrinKaydi>(ilanlar: T[], adet: number): T[] {
  const gruplar: VitrinGrubu[] = ['daire', 'villa', 'arazi', 'konut-diger', 'diger'];
  const havuzlar = new Map(gruplar.map((grup) => [grup, ilanlar.filter((i) => vitrinGrubu(i) === grup)]));
  const siralama = (a: T, b: T) => (b.fiyat ?? 0) - (a.fiyat ?? 0);
  for (const havuz of havuzlar.values()) havuz.sort(siralama);

  const secili: T[] = [];
  // Önce her gruptan bir temsilci, sonra daire/villa/arazi dönüşümlü eklenir.
  for (const grup of gruplar) {
    if (secili.length >= adet) break;
    const ilan = havuzlar.get(grup)?.shift();
    if (ilan) secili.push(ilan);
  }
  const devamSirasi: VitrinGrubu[] = ['daire', 'villa', 'arazi', 'konut-diger', 'diger'];
  while (secili.length < adet) {
    let eklendi = false;
    for (const grup of devamSirasi) {
      const ilan = havuzlar.get(grup)?.shift();
      if (!ilan) continue;
      secili.push(ilan);
      eklendi = true;
      if (secili.length >= adet) break;
    }
    if (!eklendi) break;
  }
  return secili;
}
