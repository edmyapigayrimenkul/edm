/** İletişim ve değerleme taleplerinin ortak, tarayıcıdan bağımsız doğrulaması. */

export type TalepTuru = 'iletisim' | 'degerleme';

export interface DogrulanmisTalep {
  tur: TalepTuru;
  ad: string;
  telefon: string;
  eposta: string | null;
  konu: string | null;
  mulk_tipi: string | null;
  ilce: string | null;
  mahalle: string | null;
  m2: number | null;
  mesaj: string | null;
  kaynak: string | null;
  ilan_id: string | null;
  ilan_baslik: string | null;
}

export type TalepDogrulamaSonucu =
  | { tamam: true; talep: DogrulanmisTalep }
  | { tamam: false; hata: string; alan: string };

export const DEGERLEME_TIPLERI = [
  'Daire',
  'Villa / Müstakil ev',
  'Arsa',
  'Tarla',
  'İş yeri / Dükkan',
  'Diğer',
] as const;

export const ILETISIM_KONULARI = [
  'Bir ilan hakkında',
  'Mülkümü satmak / kiraya vermek istiyorum',
  'Arsa – tarla yatırımı',
  'Değerleme',
  'Diğer',
] as const;

function hamMetin(deger: unknown): string | null {
  if (typeof deger !== 'string') return null;
  const temiz = deger.trim();
  return temiz || null;
}

function metin(
  deger: unknown,
  alan: string,
  etiket: string,
  { gerekli = false, enAz = 1, enFazla }: { gerekli?: boolean; enAz?: number; enFazla: number }
): { deger: string | null } | { hata: string; alan: string } {
  const temiz = hamMetin(deger);
  if (!temiz) {
    return gerekli ? { hata: `${etiket} gerekli.`, alan } : { deger: null };
  }
  if (temiz.length < enAz) return { hata: `${etiket} çok kısa.`, alan };
  if (temiz.length > enFazla) return { hata: `${etiket} en fazla ${enFazla} karakter olabilir.`, alan };
  if (temiz.includes('\0')) return { hata: `${etiket} geçersiz karakter içeriyor.`, alan };
  return { deger: temiz };
}

/** Yerel Türk biçimlerini E.164'e çevirir; açık + ülke kodlu yabancı numaraları da kabul eder. */
export function telefonuNormalizeEt(deger: unknown): string | null {
  const ham = hamMetin(deger);
  if (!ham || !/^[+\d\s().-]+$/.test(ham)) return null;
  const artiIle = ham.startsWith('+');
  const ciftSifir = ham.startsWith('00');
  let rakamlar = ham.replace(/\D/g, '');

  if (ciftSifir) rakamlar = rakamlar.slice(2);
  if (artiIle || ciftSifir) {
    return rakamlar.length >= 8 && rakamlar.length <= 15 ? `+${rakamlar}` : null;
  }
  if (rakamlar.length === 10) return `+90${rakamlar}`;
  if (rakamlar.length === 11 && rakamlar.startsWith('0')) return `+90${rakamlar.slice(1)}`;
  if (rakamlar.length === 12 && rakamlar.startsWith('90')) return `+${rakamlar}`;
  return null;
}

function hataMi<T extends { deger: string | null } | { hata: string; alan: string }>(
  sonuc: T
): sonuc is T & { hata: string; alan: string } {
  return 'hata' in sonuc;
}

export function talebiDogrula(girdi: unknown): TalepDogrulamaSonucu {
  if (!girdi || typeof girdi !== 'object' || Array.isArray(girdi)) {
    return { tamam: false, hata: 'Geçersiz istek gövdesi.', alan: 'form' };
  }
  const veri = girdi as Record<string, unknown>;
  const turHam = hamMetin(veri.tur) ?? 'iletisim';
  if (!['iletisim', 'degerleme'].includes(turHam)) {
    return { tamam: false, hata: 'Geçersiz talep türü.', alan: 'tur' };
  }
  const tur = turHam as TalepTuru;

  const ad = metin(veri.ad, 'ad', 'Ad soyad', { gerekli: true, enAz: 2, enFazla: 120 });
  if (hataMi(ad)) return { tamam: false, ...ad };
  const telefon = telefonuNormalizeEt(veri.telefon);
  if (!telefon) return { tamam: false, hata: 'Telefon numarası geçerli görünmüyor.', alan: 'telefon' };

  const eposta = metin(veri.eposta, 'eposta', 'E-posta', { enFazla: 160 });
  if (hataMi(eposta)) return { tamam: false, ...eposta };
  if (eposta.deger && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta.deger)) {
    return { tamam: false, hata: 'E-posta adresi geçerli görünmüyor.', alan: 'eposta' };
  }

  const kaynak = metin(veri.kaynak, 'kaynak', 'Kaynak', { enFazla: 200 });
  if (hataMi(kaynak)) return { tamam: false, ...kaynak };
  if (kaynak.deger && (!kaynak.deger.startsWith('/') || kaynak.deger.startsWith('//'))) {
    return { tamam: false, hata: 'Geçersiz kaynak sayfa.', alan: 'kaynak' };
  }

  const mahalle = metin(veri.mahalle, 'mahalle', 'Mahalle', { enFazla: 120 });
  if (hataMi(mahalle)) return { tamam: false, ...mahalle };

  if (tur === 'iletisim') {
    const konu = metin(veri.konu, 'konu', 'Konu', { enFazla: 160 });
    if (hataMi(konu)) return { tamam: false, ...konu };
    if (konu.deger && !(ILETISIM_KONULARI as readonly string[]).includes(konu.deger)) {
      return { tamam: false, hata: 'Geçersiz iletişim konusu.', alan: 'konu' };
    }
    const mesaj = metin(veri.mesaj, 'mesaj', 'Mesaj', { gerekli: true, enAz: 3, enFazla: 4000 });
    if (hataMi(mesaj)) return { tamam: false, ...mesaj };
    const ilanId = metin(veri.ilan_id, 'ilan_id', 'İlan numarası', { enFazla: 80 });
    if (hataMi(ilanId)) return { tamam: false, ...ilanId };
    const ilanBaslik = metin(veri.ilan_baslik, 'ilan_baslik', 'İlan başlığı', { enFazla: 240 });
    if (hataMi(ilanBaslik)) return { tamam: false, ...ilanBaslik };
    if (ilanId.deger && !/^[\p{L}\p{N}._-]+$/u.test(ilanId.deger)) {
      return { tamam: false, hata: 'Geçersiz ilan numarası.', alan: 'ilan_id' };
    }
    if (Boolean(ilanId.deger) !== Boolean(ilanBaslik.deger)) {
      return { tamam: false, hata: 'İlan bilgisi eksik.', alan: ilanId.deger ? 'ilan_baslik' : 'ilan_id' };
    }
    if (ilanId.deger && konu.deger !== 'Bir ilan hakkında') {
      return { tamam: false, hata: 'İlan talebinin konusu geçersiz.', alan: 'konu' };
    }
    return {
      tamam: true,
      talep: {
        tur,
        ad: ad.deger!,
        telefon,
        eposta: eposta.deger,
        konu: konu.deger,
        mulk_tipi: null,
        ilce: null,
        mahalle: null,
        m2: null,
        mesaj: mesaj.deger,
        kaynak: kaynak.deger,
        ilan_id: ilanId.deger,
        ilan_baslik: ilanBaslik.deger,
      },
    };
  }

  if (!['on', 'true', '1'].includes(String(veri.onay ?? '').toLowerCase())) {
    return { tamam: false, hata: 'Değerleme talebi için kullanım onayı gerekli.', alan: 'onay' };
  }
  const tip = metin(veri.tip, 'tip', 'Mülk tipi', { gerekli: true, enFazla: 80 });
  if (hataMi(tip)) return { tamam: false, ...tip };
  if (!(DEGERLEME_TIPLERI as readonly string[]).includes(tip.deger!)) {
    return { tamam: false, hata: 'Geçersiz mülk tipi.', alan: 'tip' };
  }
  const ilce = metin(veri.ilce, 'ilce', 'İlçe', { gerekli: true, enAz: 2, enFazla: 80 });
  if (hataMi(ilce)) return { tamam: false, ...ilce };
  if (!/^[\p{L}\p{M}\s.'-]+$/u.test(ilce.deger!)) {
    return { tamam: false, hata: 'İlçe adı geçerli görünmüyor.', alan: 'ilce' };
  }

  let m2: number | null = null;
  const m2Ham = hamMetin(veri.m2);
  if (m2Ham) {
    m2 = Number(m2Ham);
    if (!Number.isInteger(m2) || m2 < 1 || m2 > 100_000_000) {
      return { tamam: false, hata: 'Büyüklük geçerli bir tam sayı olmalı.', alan: 'm2' };
    }
  }
  const not = metin(veri.not, 'not', 'Ek bilgi', { enFazla: 4000 });
  if (hataMi(not)) return { tamam: false, ...not };

  return {
    tamam: true,
    talep: {
      tur,
      ad: ad.deger!,
      telefon,
      eposta: eposta.deger,
      konu: null,
      mulk_tipi: tip.deger,
      ilce: ilce.deger,
      mahalle: mahalle.deger,
      m2,
      mesaj: not.deger,
      kaynak: kaynak.deger,
      ilan_id: null,
      ilan_baslik: null,
    },
  };
}
