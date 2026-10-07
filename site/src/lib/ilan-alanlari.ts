export interface IlanAlanGirdisi {
  tipGrup: string;
  m2: number | null;
  ozellikler: Record<string, string>;
}

export interface IlanAlanlari {
  brutYapi: number | null;
  netYapi: number | null;
  arsa: number | null;
  toplamParsel: number | null;
  satilanHisse: number | null;
  beyanEdilen: number | null;
  karsilastirmaM2: number | null;
  karsilastirmaEtiketi: string | null;
  karsilastirmaKisaEtiketi: string | null;
  birimFiyatTemeli: string | null;
}

export function yerelSayiOku(ham: string | null | undefined): number | null {
  if (!ham) return null;
  let sayi = ham.replace(/[^\d.,-]/g, '');
  if (!sayi) return null;
  if (sayi.includes(',') && sayi.includes('.')) sayi = sayi.replace(/\./g, '').replace(',', '.');
  else if (sayi.includes(',')) sayi = sayi.replace(',', '.');
  else if (/\.\d{3}(?:\D|$)/.test(sayi)) sayi = sayi.replace(/\./g, '');
  const sonuc = Number(sayi);
  return Number.isFinite(sonuc) ? sonuc : null;
}

function metrekareOku(ham: string | null | undefined): number | null {
  const n = yerelSayiOku(ham);
  return n != null && n > 0 ? n : null;
}

function ayniAlan(a: number | null, b: number | null): boolean {
  return a != null && b != null && Math.abs(a - b) < 0.01;
}

const alanYaz = (m2: number) => `${m2.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} m²`;

/**
 * Portalın eski genel anahtarlarını kategoriye göre açık alan adlarına taşır.
 * Ham `m2`, yalnızca kaynakta daha açıklayıcı bir alan yoksa kategori bağlamında kullanılır.
 */
export function alanOzellikleriniNormallestir(girdi: IlanAlanGirdisi): Record<string, string> {
  const sonuc = { ...girdi.ozellikler };
  // Birim fiyatı güncel fiyat ve açık alan temeliyle yeniden hesaplıyoruz.
  delete sonuc['Metrekare Birim Fiyatı'];
  const tasi = (hedef: string, kaynaklar: string[]) => {
    if (!sonuc[hedef]) {
      const kaynak = kaynaklar.find((anahtar) => Boolean(sonuc[anahtar]));
      if (kaynak) sonuc[hedef] = sonuc[kaynak];
    }
    for (const kaynak of kaynaklar) if (kaynak !== hedef) delete sonuc[kaynak];
  };

  if (girdi.tipGrup === 'arsa') {
    const genelAlanAnahtarlari = ['Brüt Metrekare', 'Metrekare', 'Alan'];
    const hisseli = /hisseli|kooperatif/i.test(sonuc['Tapu Durumu'] ?? '');
    if (!sonuc['Toplam Parsel Alanı'] && !sonuc['Satılan Hisse Alanı'] && !sonuc['Beyan Edilen Alan']) {
      const genelAnahtar = genelAlanAnahtarlari.find((anahtar) => Boolean(sonuc[anahtar]));
      if (genelAnahtar) sonuc[hisseli ? 'Beyan Edilen Alan' : 'Toplam Parsel Alanı'] = sonuc[genelAnahtar];
    }
    for (const anahtar of genelAlanAnahtarlari) delete sonuc[anahtar];
    if (!sonuc['Toplam Parsel Alanı'] && !sonuc['Satılan Hisse Alanı'] && !sonuc['Beyan Edilen Alan'] && girdi.m2) {
      sonuc[hisseli ? 'Beyan Edilen Alan' : 'Toplam Parsel Alanı'] = alanYaz(girdi.m2);
    }
    return sonuc;
  }

  if (girdi.tipGrup === 'konut' || girdi.tipGrup === 'devre-mulk' || girdi.tipGrup === 'gunluk-konaklama') {
    const acikBrutYapiVardi = Boolean(sonuc['Brüt Yapı Alanı']);
    tasi('Brüt Yapı Alanı', ['Brüt Metrekare']);
    tasi('Net Yapı Alanı', ['Net Metrekare']);
    tasi('Arsa Alanı', ['Arsa Metrekare']);
    tasi('Açık Kullanım Alanı', ['Açık Alan / Bahçe']);
    const arsa = metrekareOku(sonuc['Arsa Alanı']);
    const brut = metrekareOku(sonuc['Brüt Yapı Alanı']);
    // Villa kaynaklarında arsa ölçüsü eski genel "Brüt Metrekare" alanına da
    // kopyalanabiliyor. Açık bir yapı brütü değilse aynı değeri iki anlamda sunma.
    if (!acikBrutYapiVardi && ayniAlan(brut, arsa)) delete sonuc['Brüt Yapı Alanı'];
    if (!sonuc['Brüt Yapı Alanı'] && girdi.m2 && !arsa) {
      sonuc['Brüt Yapı Alanı'] = alanYaz(girdi.m2);
    }
    return sonuc;
  }

  const brutAnahtari = girdi.tipGrup === 'isyeri'
    ? 'Brüt Kullanım Alanı'
    : girdi.tipGrup === 'proje'
      ? 'Başlangıç Brüt Yapı Alanı'
      : 'Toplam Kapalı Alan';
  tasi(brutAnahtari, ['Brüt Metrekare']);
  tasi('Net Kullanım Alanı', ['Net Metrekare']);
  tasi(girdi.tipGrup === 'proje' ? 'Toplam Arsa Alanı' : 'Arsa Alanı', ['Arsa Metrekare']);
  tasi('Açık Kullanım Alanı', ['Açık Alan / Bahçe']);
  if (!sonuc[brutAnahtari] && girdi.m2) sonuc[brutAnahtari] = alanYaz(girdi.m2);
  return sonuc;
}

/** Alanların karar ve birim fiyat hesabında kullanılacak anlamlı özetini üretir. */
export function ilanAlanlariniCoz(girdi: IlanAlanGirdisi): IlanAlanlari {
  const oz = alanOzellikleriniNormallestir(girdi);
  const netYapi = metrekareOku(oz['Net Yapı Alanı'] ?? oz['Net Kullanım Alanı']);
  const arsa = metrekareOku(oz['Arsa Alanı'] ?? oz['Toplam Arsa Alanı']);
  const toplamParsel = metrekareOku(oz['Toplam Parsel Alanı']);
  const satilanHisse = metrekareOku(oz['Satılan Hisse Alanı']);
  const brutYapi = metrekareOku(
    oz['Brüt Yapı Alanı'] ?? oz['Brüt Kullanım Alanı'] ?? oz['Toplam Kapalı Alan'] ?? oz['Başlangıç Brüt Yapı Alanı']
  );

  if (girdi.tipGrup === 'arsa') {
    const hisseli = /hisseli|kooperatif/i.test(oz['Tapu Durumu'] ?? '');
    // Toplam parsel, satılan payın büyüklüğünü veya fiyat kapsamını kanıtlamaz.
    const karsilastirmaM2 = satilanHisse ?? (hisseli ? null : toplamParsel);
    const hisseMi = satilanHisse != null;
    return {
      brutYapi: null,
      netYapi: null,
      arsa: null,
      toplamParsel,
      satilanHisse,
      beyanEdilen: metrekareOku(oz['Beyan Edilen Alan']),
      karsilastirmaM2,
      karsilastirmaEtiketi: hisseMi ? 'Satılan hisse alanı' : karsilastirmaM2 ? 'Toplam parsel alanı' : null,
      karsilastirmaKisaEtiketi: hisseMi ? 'Hisse' : karsilastirmaM2 ? 'Parsel' : null,
      birimFiyatTemeli: hisseMi ? 'satılan hisse alanına göre' : karsilastirmaM2 ? 'toplam parsel alanına göre' : null,
    };
  }

  const karsilastirmaM2 = brutYapi ?? netYapi ?? arsa;
  const brutMu = brutYapi != null;
  const netMi = !brutMu && netYapi != null;
  return {
    brutYapi,
    netYapi,
    arsa,
    toplamParsel: null,
    satilanHisse: null,
    beyanEdilen: null,
    karsilastirmaM2,
    karsilastirmaEtiketi: brutMu ? 'Brüt yapı alanı' : netMi ? 'Net yapı alanı' : arsa ? 'Arsa alanı' : null,
    karsilastirmaKisaEtiketi: brutMu ? 'Brüt' : netMi ? 'Net' : arsa ? 'Arsa' : null,
    birimFiyatTemeli: brutMu ? 'brüt yapı alanına göre' : netMi ? 'net yapı alanına göre' : arsa ? 'arsa alanına göre' : null,
  };
}

/** Eski panel alan adları da yeni kaynak alanlarından daha yüksek önceliklidir. */
export function alanOzellikleriniBirlestir(
  kaynak: IlanAlanGirdisi,
  panel: Record<string, string>,
  tamPanelKaydi = false
): Record<string, string> {
  if (tamPanelKaydi) return alanOzellikleriniNormallestir({ ...kaynak, ozellikler: panel });
  const normalKaynak = alanOzellikleriniNormallestir(kaynak);
  const normalPanel = alanOzellikleriniNormallestir({
    tipGrup: kaynak.tipGrup,
    m2: null,
    ozellikler: { 'Tapu Durumu': normalKaynak['Tapu Durumu'] ?? '', ...panel },
  });
  if (!Object.hasOwn(panel, 'Tapu Durumu')) delete normalPanel['Tapu Durumu'];
  // Panelde daha açık alan bilgisi girilmişse eski belirsiz beyanı taşıma.
  if (normalPanel['Toplam Parsel Alanı'] || normalPanel['Satılan Hisse Alanı']) delete normalKaynak['Beyan Edilen Alan'];
  return { ...normalKaynak, ...normalPanel };
}
