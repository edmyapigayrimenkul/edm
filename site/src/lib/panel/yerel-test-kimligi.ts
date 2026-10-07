/** Loopback üzerindeki açık yerel test Worker'ına sınırlı panel kimliği. */
export interface YerelTestKimligi {
  eposta: string;
  kimlik: string;
}

const YEREL_ADRESLER = new Set(['localhost', '127.0.0.1', '[::1]']);

export function yerelTestPanelKimligi(
  istekAdresi: string,
  etkinlestirme: string | undefined
): YerelTestKimligi | null {
  if (etkinlestirme !== '1') return null;

  try {
    const adres = new URL(istekAdresi);
    if (!YEREL_ADRESLER.has(adres.hostname)) return null;
    return { eposta: 'ozdogandogukan@gmail.com', kimlik: 'yerel-test-worker' };
  } catch {
    return null;
  }
}
