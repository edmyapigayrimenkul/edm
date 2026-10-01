export const YEDEK_ORTAMLARI = {
  production: { kova: 'edm-yedek', kaynakKova: 'edm-gorseller', ad: 'edm-talepler', kimlik: '30d4df58-b49f-43c8-95c5-5a538ce44f68' },
  staging: { kova: 'edm-yedek-staging', kaynakKova: 'edm-gorseller-staging', ad: 'edm-talepler-staging', kimlik: '17ca546e-1a76-46ab-9b73-95a944a97603' },
};

export function yedekManifestiniDogrula(manifest, hedef, anahtar, simdi = Date.now()) {
  const ayar = YEDEK_ORTAMLARI[hedef];
  const kok = anahtar.replace(/\/manifest\.json$/, '');
  const tarih = Date.parse(manifest?.olusturma);
  const ozetGecerli = (kayit, enAz) => Number.isSafeInteger(kayit?.bayt) && kayit.bayt >= enAz && /^[a-f0-9]{64}$/.test(kayit.sha256 ?? '');
  const dosyalar = manifest?.gorseller?.dosyalar;
  if (!ayar || !anahtar.startsWith(`${hedef}/`) || !anahtar.endsWith('/manifest.json') ||
      manifest?.surum !== 1 || manifest.ortam !== hedef || !Number.isFinite(tarih) || tarih > simdi + 300000 ||
      manifest.veritabani?.ad !== ayar.ad || manifest.veritabani?.kimlik !== ayar.kimlik ||
      manifest.veritabani?.yedekAnahtari !== `${kok}/veritabani.sql` || !ozetGecerli(manifest.veritabani, 1) ||
      manifest.gorseller?.kaynakKova !== ayar.kaynakKova || !Array.isArray(dosyalar) || manifest.gorseller.adet !== dosyalar.length ||
      dosyalar.some((dosya) => !dosya.kaynakAnahtar || dosya.yedekAnahtari !== `${kok}/gorseller/${dosya.kaynakAnahtar}` || !ozetGecerli(dosya, 0)) ||
      new Set(dosyalar.map((dosya) => dosya.kaynakAnahtar)).size !== dosyalar.length) {
    throw new Error('Yedek manifesti ortam veya bütünlük denetimini geçmedi.');
  }
  const yasSaat = (simdi - tarih) / 3600000;
  if (yasSaat > 36) throw new Error('Son doğrulanmış yedek 36 saatten eski.');
  return { yasSaat, sqlBayt: manifest.veritabani.bayt, nesneAdedi: dosyalar.length, r2Bayt: dosyalar.reduce((toplam, dosya) => toplam + dosya.bayt, 0) };
}
