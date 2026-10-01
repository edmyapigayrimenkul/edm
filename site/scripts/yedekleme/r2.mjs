import { createReadStream, createWriteStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

const KOVALAR = new Set(['edm-yedek', 'edm-yedek-staging']);
export function yedekS3HedefiniDogrula(kova, anahtar) {
  const onEk = kova === 'edm-yedek' ? 'production/' : 'staging/';
  if (!KOVALAR.has(kova) || typeof anahtar !== 'string' || !anahtar.startsWith(onEk)) throw new Error('S3 yedek hedefi geçersiz.');
}

/** S3 anahtarı yalnız iki yedek kovasını görür; kaynak kovaya yazma yetkisi verilmez. */
export async function yedekS3Baglantisi(hesap, degiskenler = process.env) {
  const accessKeyId = degiskenler.R2_YEDEK_ERISIM_KIMLIGI;
  const secretAccessKey = degiskenler.R2_YEDEK_GIZLI_ANAHTARI;
  if (!accessKeyId && !secretAccessKey && degiskenler.GITHUB_ACTIONS !== 'true') return null;
  if (!accessKeyId || !secretAccessKey) throw new Error('Yedek kovalarının S3 kimliği eksik.');
  if (!/^[a-f0-9]{32}$/i.test(hesap)) throw new Error('Cloudflare hesap kimliği geçersiz.');
  const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } = await import('@aws-sdk/client-s3');
  const istemci = new S3Client({
    region: 'auto', endpoint: `https://${hesap}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey, ...(degiskenler.R2_YEDEK_OTURUM_ANAHTARI ? { sessionToken: degiskenler.R2_YEDEK_OTURUM_ANAHTARI } : {}) }, maxAttempts: 3,
    requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED',
  });
  return {
    async kontrol(kova) {
      yedekS3HedefiniDogrula(kova, kova === 'edm-yedek' ? 'production/' : 'staging/');
      try { await istemci.send(new ListObjectsV2Command({ Bucket: kova, MaxKeys: 1 })); }
      catch { throw new Error('Yedek kovası S3 erişimi doğrulanamadı; servis çıktısı gizlendi.'); }
    },
    async yaz(kova, anahtar, dosya, tur) {
      yedekS3HedefiniDogrula(kova, anahtar);
      const akis = createReadStream(dosya);
      try {
        await istemci.send(new PutObjectCommand({
          Bucket: kova, Key: anahtar, Body: akis,
          ContentLength: (await stat(dosya)).size, ContentType: tur,
        }));
      } catch { throw new Error('S3 yedek yazımı başarısız; hassas servis çıktısı gizlendi.'); }
      finally { akis.destroy(); }
    },
    async oku(kova, anahtar, dosya) {
      yedekS3HedefiniDogrula(kova, anahtar);
      try {
        const sonuc = await istemci.send(new GetObjectCommand({ Bucket: kova, Key: anahtar }));
        if (!sonuc.Body) throw new Error('S3 geri okuma gövdesi boş.');
        await pipeline(sonuc.Body, createWriteStream(dosya, { mode: 0o600 }));
      } catch { throw new Error('S3 yedek geri okuması başarısız; hassas servis çıktısı gizlendi.'); }
    },
    kapat() { istemci.destroy(); },
  };
}
