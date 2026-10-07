import { yerelSayiOku } from './ilan-alanlari.ts';
import type { Koordinat } from './senkron/konum.ts';

export const KESIN_ENLEM_ANAHTARI = 'Kesin Enlem';
export const KESIN_BOYLAM_ANAHTARI = 'Kesin Boylam';
export const KONUM_DOGRULUK_ANAHTARI = 'Konum Doğruluk Kaynağı';
export const KAMU_KONUM_DUZEYI_ANAHTARI = 'Kamu Konum Düzeyi';
export const PORTAL_KESIN_KONUM_IZNI_ANAHTARI = 'Portal Kesin Konum Aktarımı';

const OZEL_KONUM_ANAHTARLARI = new Set([
  KESIN_ENLEM_ANAHTARI,
  KESIN_BOYLAM_ANAHTARI,
  KONUM_DOGRULUK_ANAHTARI,
  KAMU_KONUM_DUZEYI_ANAHTARI,
  PORTAL_KESIN_KONUM_IZNI_ANAHTARI,
]);

export interface KamuKonumu {
  koordinat: Koordinat | null;
  yaricap: number;
  kaynak: 'mahalle' | 'yaklasik-pin' | 'yok';
}

export function kesinKoordinatiOku(ozellikler: Record<string, string>): Koordinat | null {
  const enlem = yerelSayiOku(ozellikler[KESIN_ENLEM_ANAHTARI] ?? '');
  const boylam = yerelSayiOku(ozellikler[KESIN_BOYLAM_ANAHTARI] ?? '');
  if (enlem == null || boylam == null) return null;
  if (enlem < 35.5 || enlem > 42.5 || boylam < 25.5 || boylam > 45) return null;
  return { enlem, boylam };
}

function kimlikTohumu(kimlik: string): number {
  let sonuc = 2166136261;
  for (const karakter of kimlik) {
    sonuc ^= karakter.charCodeAt(0);
    sonuc = Math.imul(sonuc, 16777619);
  }
  return sonuc >>> 0;
}

/**
 * Kesin pini kamuya vermeden 360-520 metre uzağında kararlı bir merkez üretir.
 * Yarıçap gerçek noktayı kapsar; aynı ilan her istekte farklı yerde sıçramaz.
 */
export function yaklasikKoordinat(kimlik: string, kesin: Koordinat): Koordinat {
  const tohum = kimlikTohumu(kimlik);
  const uzaklik = 360 + (tohum % 161);
  const aci = ((tohum >>> 8) % 360) * Math.PI / 180;
  const enlemFarki = (uzaklik * Math.cos(aci)) / 111_320;
  const boylamFarki = (uzaklik * Math.sin(aci)) / (111_320 * Math.cos(kesin.enlem * Math.PI / 180));
  return {
    enlem: Number((kesin.enlem + enlemFarki).toFixed(6)),
    boylam: Number((kesin.boylam + boylamFarki).toFixed(6)),
  };
}

export function kamuKonumuSec(
  kimlik: string,
  ozellikler: Record<string, string>,
  mahalleKoordinati: Koordinat | null
): KamuKonumu {
  const kesin = kesinKoordinatiOku(ozellikler);
  if (ozellikler[KAMU_KONUM_DUZEYI_ANAHTARI] === 'yaklasik' && kesin) {
    return { koordinat: yaklasikKoordinat(kimlik, kesin), yaricap: 700, kaynak: 'yaklasik-pin' };
  }
  if (mahalleKoordinati) return { koordinat: mahalleKoordinati, yaricap: 700, kaynak: 'mahalle' };
  return { koordinat: null, yaricap: 700, kaynak: 'yok' };
}

export function ozelKonumAlanlariniGizle(ozellikler: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(ozellikler).filter(([anahtar]) => !OZEL_KONUM_ANAHTARLARI.has(anahtar)));
}
