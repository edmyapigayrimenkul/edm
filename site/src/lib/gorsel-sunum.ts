interface GorselSunumu {
  kaynak: string;
  secenekler: string | undefined;
  yogunKaynak?: string;
  /** İlk proxy boyutu hata verirse denenecek diğer optimize edilmiş sürüm. */
  alternatifKaynak?: string;
  /** Yalnız küçük ekranda, yüksek yoğunluklu kart için boyutu sınırlı kaynak. */
  mobilYogunKaynak?: string;
}

// Portalın boyut sürümü yüklenemezse özgün fotoğrafa bir
// kez dönülür. Picture kaynakları da kaldırılır; aksi halde tarayıcı hata
// veren küçük sürümü yeniden seçer. Gizli kartlarda adres atanmadan çalışmaz.
export const GORSEL_YEDEK_BETIGI = "const alternatif=this.dataset.gorselAlternatif;const kaynak=this.dataset.gorselYedek;if(alternatif||kaynak){this.closest('picture')?.querySelectorAll('source').forEach(s=>s.removeAttribute('srcset'));this.removeAttribute('srcset');if(alternatif){delete this.dataset.gorselAlternatif;this.src=alternatif;}else{delete this.dataset.gorselYedek;this.src=kaynak;}}";

/** Portalların doğrulanan boyut servisleri; bilinmeyen kaynaklar aynen korunur. */
export function gorselSunumu(adres: string, kullanim: 'kart' | 'serit' | 'kapak' | 'kucuk'): GorselSunumu {
  const bos = { kaynak: adres, secenekler: undefined as string | undefined };
  const r2Anahtari = adres.startsWith('/g/') ? adres.slice(3) : '';
  if (r2Anahtari && !r2Anahtari.startsWith('video/') &&
      /^[a-z0-9_-]+\/[a-z0-9_-]+\.(?:webp|jpe?g|png)$/i.test(r2Anahtari)) {
    const kaynak = (genislik: 640 | 1280) => `/g/${r2Anahtari}?width=${genislik}`;
    return {
      kaynak: kaynak(640),
      secenekler: `${kaynak(640)} 1x, ${kaynak(1280)} 2x`,
      yogunKaynak: kaynak(1280),
    };
  }
  let adresNesnesi: URL;
  try { adresNesnesi = new URL(adres); } catch { return bos; }
  if (adresNesnesi.protocol !== 'https:' ||
      adresNesnesi.port || adresNesnesi.username || adresNesnesi.password || adresNesnesi.search || adresNesnesi.hash) return bos;

  if (adresNesnesi.hostname === 'imaj.emlakjet.com' &&
      /^\/listing\/\d+\/[a-f\d]{32}\d+\.(?:jpg|jpeg|png|webp)$/i.test(adresNesnesi.pathname)) {
    const kaynak = (genislik: number) => `/foto/emlakjet/${genislik}${adresNesnesi.pathname}`;
    const temel = kullanim === 'kapak' ? 960 : 640;
    // Emlakjet özgünden büyük fotoğraf üretmez: 960 isteği 800 piksel
    // dönebilir. Bu yüzden sahte w/x ölçüsü vermeden picture'ın ekran
    // yoğunluğu sorgusuyla daha ayrıntılı sürümü seçiyoruz.
    return {
      kaynak: kaynak(temel),
      secenekler: kaynak(temel),
      // Yüksek DPR'da da aynı alan adındaki doğrulanmış proxy kullanılır.
      yogunKaynak: kaynak(960),
      alternatifKaynak: kaynak(temel === 960 ? 640 : 960),
    };
  }

  if (adresNesnesi.hostname !== 'hecdn01.hemlak.com' ||
      !/^\/mnresize\/1280\/960\/ds01\/[a-z\d/-]+\.(?:jpg|jpeg|png|webp)$/i.test(adresNesnesi.pathname)) return bos;

  // mnresize görseli kutuya sığdırır: dikey fotoğrafta gerçek genişlik daha
  // küçüktür. Bu yüzden tahmini w değerleri yerine orantılı x kullanıyoruz.
  // Küçük kutularda da 640 tabanı, 9:16 fotoğrafın kırpılan bölümünde
  // yeterli ayrıntı bırakır; 320 kutusu dikey fotoğrafı 135 piksele düşürür.
  const temel = kullanim === 'kapak' ? 960 : 640;
  const genislikler = temel === 640 ? [640, 1280] : [960, 1280];
  const kaynak = (genislik: number) => adres.replace('/mnresize/1280/960/', `/mnresize/${genislik}/${genislik * 3 / 4}/`);
  return {
    kaynak: kaynak(temel),
    secenekler: genislikler.map((genislik) => `${kaynak(genislik)} ${genislik / temel}x`).join(', '),
    // Dar ekranda 2x seçeneği 1280'i indiriyordu. 960, kartta yeterli
    // ayrıntıyı korurken yüksek yoğunlukta gereksiz indirmeyi azaltır.
    mobilYogunKaynak: kaynak(kullanim === 'kucuk' ? 640 : 960),
  };
}
