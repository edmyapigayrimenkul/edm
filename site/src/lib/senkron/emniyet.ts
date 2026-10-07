/** Büyük ve ani portföy düşüşlerinde otomatik pasifleştirmeyi geciktirir. */
export const SENKRON_DUSUS_ORANI = 0.75;
export const SENKRON_MIN_AKTIF = 5;
export const SENKRON_MIN_EKSIK = 3;

export function aniDususeKarsiKontrol(oncekiAktif: number, bulunan: number, eksikIdler: string[]) {
  const oranAsildi = bulunan < oncekiAktif * SENKRON_DUSUS_ORANI;
  const topluEksik = eksikIdler.length >= SENKRON_MIN_EKSIK;
  const supheli =
    oncekiAktif >= SENKRON_MIN_AKTIF && oranAsildi && topluEksik;

  return {
    supheli,
    imza: supheli ? [...eksikIdler].sort().join(',') : null,
  };
}

export function dususTeyitKarari(
  imza: string | null,
  oncekiImza: string | null,
  oncekiTeyitSayisi: number,
  detayBasarisiz: boolean
): 'bekle' | 'pasiflestir' | 'normal' | 'eksik-veri' {
  if (detayBasarisiz) return 'eksik-veri';
  if (!imza) return 'normal';
  return imza === oncekiImza && oncekiTeyitSayisi >= 1 ? 'pasiflestir' : 'bekle';
}
