/** İlan fotoğrafı girişinin istemci ve sunucuda ortak kabul sınırları. */
export const EN_COK_ILAN_FOTOGRAFI = 50;
export const ILAN_FOTOGRAFI_EN_UZUN_KENAR = 1800;
export const ILAN_FOTOGRAFI_EN_BUYUK_DOSYA = 3 * 1024 * 1024;
export const ILAN_FOTOGRAFI_MIN_UZUN_KENAR = 1200;
export const ILAN_FOTOGRAFI_MIN_KISA_KENAR = 800;

export function fotografYuklemePlani(mevcutAdet: number, secilenAdet: number) {
  if (
    !Number.isSafeInteger(mevcutAdet) || !Number.isSafeInteger(secilenAdet) ||
    mevcutAdet < 0 || secilenAdet < 0
  ) return null;
  const kalan = Math.max(0, EN_COK_ILAN_FOTOGRAFI - mevcutAdet);
  const yuklenecek = Math.min(kalan, secilenAdet);
  return { kalan, yuklenecek, atlanacak: secilenAdet - yuklenecek };
}

export function fotografYuklemesiTamamlandi(eklenen: number, atlanan: readonly string[]): boolean {
  return Number.isSafeInteger(eklenen) && eklenen > 0 && atlanan.length === 0;
}

/** Sunucunun kesin olarak atladığı dosyaları doğrular ve özgün seçimden eşler. */
export function fotografTekrarSecimDosyalari<T>(dosyalar: readonly T[], indeksler: readonly unknown[]): T[] | null {
  const gorulen = new Set<number>();
  for (const indeks of indeksler) {
    if (!Number.isSafeInteger(indeks) || typeof indeks !== 'number' || indeks < 0 || indeks >= dosyalar.length || gorulen.has(indeks)) {
      return null;
    }
    gorulen.add(indeks);
  }
  return [...gorulen].sort((a, b) => a - b).map((indeks) => dosyalar[indeks]);
}

/** Kalite önerileri engelleyici değildir; portre ve detay fotoğrafları da kullanılabilir. */
export function fotografKaliteUyarilari(genislik: number, yukseklik: number): string[] {
  if (!Number.isFinite(genislik) || !Number.isFinite(yukseklik) || genislik <= 0 || yukseklik <= 0) {
    return ['Fotoğraf boyutları okunamadı; yüklemeden önce dosyayı açabildiğinizi kontrol edin.'];
  }

  const uzunKenar = Math.max(genislik, yukseklik);
  const kisaKenar = Math.min(genislik, yukseklik);
  const oran = genislik / yukseklik;
  const uyarilar: string[] = [];

  if (uzunKenar < ILAN_FOTOGRAFI_MIN_UZUN_KENAR || kisaKenar < ILAN_FOTOGRAFI_MIN_KISA_KENAR) {
    uyarilar.push('Çözünürlük düşük; mümkünse en az 1200 × 800 px özgün fotoğraf seçin.');
  }
  if (oran < 1.3 || oran > 1.7) {
    uyarilar.push('Dikey, kare veya çok geniş kadraj; kapak için yatay 4:3 ya da 3:2 fotoğrafı tercih edin.');
  }

  return uyarilar;
}

export const fotografSiniriMesaji = () =>
  `Bir ilanda en fazla ${EN_COK_ILAN_FOTOGRAFI} fotoğraf olabilir.`;
