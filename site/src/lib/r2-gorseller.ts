/** R2'deki özgün ilan görseline bağlı, yeniden üretilebilir boyut anahtarı. */
export function r2FotografVaryantAnahtari(anahtar: string, boyut: 640 | 1280): string {
  return `${anahtar}.${boyut}.webp`;
}

/** Yeni yüklemelerin boyut türevlerini özgün fotoğrafla birlikte kaldırır. */
export async function r2FotografiSil(kova: R2Bucket, anahtar: string): Promise<void> {
  await Promise.all([
    kova.delete(anahtar),
    kova.delete(r2FotografVaryantAnahtari(anahtar, 640)),
    kova.delete(r2FotografVaryantAnahtari(anahtar, 1280)),
  ]);
}
