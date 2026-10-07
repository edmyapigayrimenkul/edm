/** Yönetim ekranlarında ortak kullanılan tarayıcı tarafı fotoğraf hazırlayıcı. */

import {
  EN_COK_ILAN_FOTOGRAFI,
  ILAN_FOTOGRAFI_EN_UZUN_KENAR,
  fotografSiniriMesaji,
  fotografTekrarSecimDosyalari,
  fotografYuklemesiTamamlandi,
} from '../lib/fotograf-kurallari';

async function fotografiKucult(dosya: File): Promise<{
  blob: Blob;
  genislik: number;
  yukseklik: number;
  kucuk: Blob | null;
  orta: Blob | null;
} | null> {
  try {
    const kaynak = await createImageBitmap(dosya, { imageOrientation: 'from-image' });
    const oran = Math.min(1, ILAN_FOTOGRAFI_EN_UZUN_KENAR / Math.max(kaynak.width, kaynak.height));
    const genislik = Math.round(kaynak.width * oran);
    const yukseklik = Math.round(kaynak.height * oran);
    const tuval = document.createElement('canvas');
    const baglam = tuval.getContext('2d');
    if (!baglam) { kaynak.close(); return null; }
    baglam.imageSmoothingQuality = 'high';
    const cevir = async (uzunKenar: number): Promise<Blob | null> => {
      const kucultme = Math.min(1, uzunKenar / Math.max(kaynak.width, kaynak.height));
      tuval.width = Math.round(kaynak.width * kucultme);
      tuval.height = Math.round(kaynak.height * kucultme);
      baglam.drawImage(kaynak, 0, 0, tuval.width, tuval.height);
      return await new Promise<Blob | null>((coz) => tuval.toBlob(coz, 'image/webp', 0.82));
    };
    const blob = await cevir(ILAN_FOTOGRAFI_EN_UZUN_KENAR);
    const orta = genislik > 1280 || yukseklik > 1280 ? await cevir(1280) : null;
    const kucuk = genislik > 640 || yukseklik > 640 ? await cevir(640) : null;
    kaynak.close();
    return blob ? { blob, genislik, yukseklik, orta, kucuk } : null;
  } catch {
    return null;
  }
}

export interface FotografYuklemeSonucu {
  tamam: boolean;
  eklenen: number;
  atlanan: string[];
  /** Yalnızca sunucunun kesin olarak atladığı özgün dosyalar. */
  tekrarSecimDosyalari: File[];
  /** Tekrar seçimin hangi dosyalar olacağının kesin olarak bilindiği durum. */
  tekrarSecimGuvenli: boolean;
  /** İstek yanıtı alınamadığında sunucuda kısmi kayıt olup olmadığı belirsizdir. */
  sonucBelirsizMi: boolean;
  hata?: string;
}

interface FotografApiYaniti {
  eklenen?: number;
  atlanan?: string[];
  /** İndeksler, aynı yanıttaki multipart dosya sırasına göredir. */
  atlananIndeksler?: unknown[];
  hata?: string;
}

export async function fotograflariYukle(
  ilanId: string,
  dosyalar: File[],
  ilerleme?: (metin: string) => void
): Promise<FotografYuklemeSonucu> {
  const tumGorseller = dosyalar.filter((dosya) => dosya.type.startsWith('image/'));
  const gorseller = tumGorseller.slice(0, EN_COK_ILAN_FOTOGRAFI);
  if (!gorseller.length) {
    return { tamam: true, eklenen: 0, atlanan: [], tekrarSecimDosyalari: [], tekrarSecimGuvenli: true, sonucBelirsizMi: false };
  }

  const atlanan: string[] = tumGorseller
    .slice(EN_COK_ILAN_FOTOGRAFI)
    .map((dosya) => `${dosya.name}: ${fotografSiniriMesaji()}`);
  const tekrarSecimDosyalari: File[] = [];
  let tekrarSecimGuvenli = tumGorseller.length <= EN_COK_ILAN_FOTOGRAFI;
  let sonucBelirsizMi = false;
  let eklenen = 0;
  let hataMesaji: string | undefined;
  // En fazla beş özgün dosya ve türevlerini bir istekte gönder; 50 fotoğraflı
  // yüklemede büyük bir multipart isteği ve sınırsız canvas birikmesini önler.
  for (let baslangic = 0; baslangic < gorseller.length; baslangic += 5) {
    const form = new FormData();
    form.append('ilan', ilanId);
    const hazirlananDosyalar: File[] = [];
    let hazirlanan = 0;
    for (const dosya of gorseller.slice(baslangic, baslangic + 5)) {
      ilerleme?.(`${baslangic + hazirlanan + 1}/${gorseller.length} fotoğraf hazırlanıyor…`);
      const hazir = await fotografiKucult(dosya);
      if (!hazir) {
        atlanan.push(`${dosya.name}: okunamadı`);
        tekrarSecimDosyalari.push(dosya);
        continue;
      }
      const temelAd = dosya.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9çğıöşü_-]+/gi, '-').slice(0, 80) || 'fotograf';
      const ad = `${temelAd}.webp`;
      form.append('dosya', new File([hazir.blob], ad, { type: 'image/webp' }));
      if (hazir.kucuk) form.append(`varyant-640-${hazirlanan}`, new File([hazir.kucuk], `${temelAd}-640.webp`, { type: 'image/webp' }));
      if (hazir.orta) form.append(`varyant-1280-${hazirlanan}`, new File([hazir.orta], `${temelAd}-1280.webp`, { type: 'image/webp' }));
      form.append(`genislik-${ad}`, String(hazir.genislik));
      form.append(`yukseklik-${ad}`, String(hazir.yukseklik));
      hazirlananDosyalar.push(dosya);
      hazirlanan++;
    }
    if (!hazirlanan) continue;
    ilerleme?.(`${Math.min(baslangic + 5, gorseller.length)} / ${gorseller.length} fotoğraf yükleniyor…`);
    try {
      const cevap = await fetch('/yonetim/api/foto', { method: 'POST', body: form });
      let sonuc: FotografApiYaniti;
      try {
        sonuc = await cevap.json() as FotografApiYaniti;
      } catch {
        sonucBelirsizMi = true;
        tekrarSecimGuvenli = false;
        hataMesaji = 'Sunucudan yanıt alınamadı. Sayfayı yenileyip fotoğrafları kontrol edin.';
        const bekleyenler = [...hazirlananDosyalar, ...gorseller.slice(baslangic + 5)];
        atlanan.push(...bekleyenler.map((dosya) => `${dosya.name}: yükleme sonucu doğrulanamadı`));
        break;
      }
      eklenen += sonuc.eklenen ?? 0;
      const sunucuAtlanan = sonuc.atlanan ?? [];
      atlanan.push(...sunucuAtlanan);
      if (sunucuAtlanan.length) {
        const basarisizDosyalar = Array.isArray(sonuc.atlananIndeksler)
          ? fotografTekrarSecimDosyalari(hazirlananDosyalar, sonuc.atlananIndeksler)
          : null;
        if (!basarisizDosyalar || basarisizDosyalar.length !== sunucuAtlanan.length) {
          tekrarSecimGuvenli = false;
        } else {
          tekrarSecimDosyalari.push(...basarisizDosyalar);
        }
      } else if (Array.isArray(sonuc.atlananIndeksler) && sonuc.atlananIndeksler.length) {
        tekrarSecimGuvenli = false;
      }
      if (!cevap.ok) {
        hataMesaji = sonuc.hata;
        tekrarSecimGuvenli = false;
        if (cevap.status >= 500) sonucBelirsizMi = true;
        const bekleyenler = [...hazirlananDosyalar, ...gorseller.slice(baslangic + 5)];
        atlanan.push(...bekleyenler.map((dosya) => `${dosya.name}: ${hataMesaji || 'yükleme başarısız'}`));
        break;
      }
    } catch (hata) {
      hataMesaji = (hata as Error).message;
      sonucBelirsizMi = true;
      tekrarSecimGuvenli = false;
      const bekleyenler = [...hazirlananDosyalar, ...gorseller.slice(baslangic + 5)];
      atlanan.push(...bekleyenler.map((dosya) => `${dosya.name}: ${hataMesaji || 'yükleme başarısız'}`));
      break;
    }
  }
  return {
    tamam: fotografYuklemesiTamamlandi(eklenen, atlanan),
    eklenen,
    atlanan,
    tekrarSecimDosyalari,
    tekrarSecimGuvenli,
    sonucBelirsizMi,
    ...(hataMesaji || !eklenen ? { hata: hataMesaji ?? 'Seçilen fotoğraflar yüklenemedi.' } : {}),
  };
}
