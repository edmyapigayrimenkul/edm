/**
 * En dolu portal fotoğraf setini seçer.
 * Setler eşitse Hepsiemlak sırası ve çözünürlüğü tercih edilir.
 */
export function portalGorselleriniSec(
  emlakjet: string[],
  hepsiemlak: string[]
): string[] {
  return emlakjet.length > hepsiemlak.length ? emlakjet : hepsiemlak;
}
