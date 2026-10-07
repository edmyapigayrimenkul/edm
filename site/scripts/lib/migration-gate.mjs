/** Wrangler bunu yalnız hiçbir yerel geçiş beklemiyorsa bildirir. */
export function d1MigrasyonlariTam(cikti) {
  return /No migrations to apply/i.test(String(cikti));
}

/** Yalnız kapalı CRM özelliğinin geçişi ertelenebilir; bilinmeyen geçişler kapıyı açmaz. */
export function d1DagitimUyumlulugu({ yerel, uygulanmis, gerekli, degiskenler, uzakBaglamalar }) {
  if (![yerel, uygulanmis, uzakBaglamalar].every(Array.isArray)
    || !yerel.length || !yerel.every((ad) => typeof ad === 'string' && /^\d{4}-.+\.sql$/.test(ad))
    || !uygulanmis.every((ad) => typeof ad === 'string') || !gerekli
    || !yerel.includes(gerekli) || !uygulanmis.includes(gerekli)) {
    throw new Error('D1 geçiş kaydı veya uygulamanın gerekli şema sürümü doğrulanamadı.');
  }
  const bekleyen = yerel.filter((ad) => !uygulanmis.includes(ad));
  if (!bekleyen.length) return { ertelenen: [] };
  const uzakBayraklar = uzakBaglamalar.filter((bag) => bag.name === 'TALEP_IS_SONUCLARI_ETKIN');
  const uzakKapali = uzakBayraklar.length === 0 || (uzakBayraklar.length === 1
    && uzakBayraklar[0].type === 'plain_text' && uzakBayraklar[0].text === '0');
  if (bekleyen.length !== 1 || bekleyen[0] !== '0011-talep-is-sonucu.sql'
    || degiskenler?.TALEP_IS_SONUCLARI_ETKIN !== '0' || !uzakKapali
    || Object.hasOwn(degiskenler, 'PANEL_YEREL_TEST_KIMLIGI')
    || uzakBaglamalar.some((bag) => bag.name === 'PANEL_YEREL_TEST_KIMLIGI')) {
    throw new Error(`D1 dağıtım uyumsuzluğu: ${bekleyen.join(', ')}. Gerekli geçişler uygulanmalı; CRM kapalı tutulmalı.`);
  }
  return { ertelenen: bekleyen };
}
