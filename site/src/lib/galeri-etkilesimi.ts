/** Fotoğraf galerisi için tarayıcıdan bağımsız gezinme kuralları. */

/** Sırayı dairesel tutar; boş galeride geçerli fotoğraf yoktur. */
export function galeriIndeksi(yeniSira: number, fotografSayisi: number): number | null {
  if (!Number.isInteger(fotografSayisi) || fotografSayisi <= 0) return null;
  return ((yeniSira % fotografSayisi) + fotografSayisi) % fotografSayisi;
}

/** Yatay kaydırmayı yön olarak verir; dikey hareketi galeri gezintisine çevirmemelidir. */
export function kaydirmaYonunuBul(
  farkX: number,
  farkY: number,
  esik = 55
): -1 | 1 | null {
  if (Math.abs(farkX) <= esik || Math.abs(farkX) <= Math.abs(farkY)) return null;
  return farkX > 0 ? -1 : 1;
}
