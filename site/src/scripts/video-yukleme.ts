import {
  VIDEO_EN_BUYUK_BOYUT,
  VIDEO_EN_UZUN_SURE,
  VIDEO_KABUL_TURLERI,
  VIDEO_POSTER_EN_UZUN_KENAR,
  videoBoyutMetni,
  videoSureMetni,
} from '../lib/video-kurallari';

export interface VideoBilgisi {
  sure: number;
  genislik: number;
  yukseklik: number;
  poster: Blob;
}

export interface VideoYuklemeSonucu {
  tamam: boolean;
  video?: string;
  poster?: string;
  sure?: number;
  boyut?: number;
  hata?: string;
}

const olayBekle = (hedef: EventTarget, ad: string) => new Promise<void>((coz, red) => {
  let zamanlayici = 0;
  const temizle = () => {
    window.clearTimeout(zamanlayici);
    hedef.removeEventListener(ad, tamam);
    hedef.removeEventListener('error', hatali);
  };
  const tamam = () => { temizle(); coz(); };
  const hatali = () => { temizle(); red(new Error('Video tarayıcıda okunamadı.')); };
  zamanlayici = window.setTimeout(() => {
    temizle();
    red(new Error('Video okunurken zaman aşımı oluştu.'));
  }, 20_000);
  hedef.addEventListener(ad, tamam, { once: true });
  hedef.addEventListener('error', hatali, { once: true });
});

async function videoSuresiniOku(video: HTMLVideoElement): Promise<number> {
  let sure = video.duration;
  if (!Number.isFinite(sure)) {
    // MediaRecorder ile üretilen bazı WebM dosyaları süreyi ilk metadata
    // okumasında Infinity verir. Sona arama, Chromium'un gerçek süreyi
    // hesaplayıp timeupdate ile bildirmesini sağlar.
    const sureHazir = olayBekle(video, 'timeupdate');
    video.currentTime = 1e101;
    await sureHazir;
    sure = video.duration;
  }
  if (!Number.isFinite(sure) || sure <= 0) throw new Error('Video süresi okunamadı.');
  return sure;
}

export async function videoBilgisiniOku(dosya: File): Promise<VideoBilgisi> {
  if (!(VIDEO_KABUL_TURLERI as readonly string[]).includes(dosya.type)) throw new Error('MP4, WebM veya MOV video seçin.');
  if (dosya.size <= 0 || dosya.size > VIDEO_EN_BUYUK_BOYUT) throw new Error(`Video en fazla ${videoBoyutMetni()} olabilir.`);
  const adres = URL.createObjectURL(dosya);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;
  video.src = adres;
  try {
    await olayBekle(video, 'loadedmetadata');
    const sure = await videoSuresiniOku(video);
    if (sure > VIDEO_EN_UZUN_SURE) throw new Error(`Video en fazla ${videoSureMetni()} olabilir.`);
    const oran = Math.min(1, VIDEO_POSTER_EN_UZUN_KENAR / Math.max(video.videoWidth, video.videoHeight));
    const genislik = Math.max(1, Math.round(video.videoWidth * oran));
    const yukseklik = Math.max(1, Math.round(video.videoHeight * oran));
    const kareHazir = olayBekle(video, 'seeked');
    video.currentTime = Math.min(1, Math.max(0, sure / 2));
    await kareHazir;
    const tuval = document.createElement('canvas');
    tuval.width = genislik;
    tuval.height = yukseklik;
    const baglam = tuval.getContext('2d');
    if (!baglam) throw new Error('Poster karesi hazırlanamadı.');
    baglam.drawImage(video, 0, 0, genislik, yukseklik);
    const poster = await new Promise<Blob | null>((coz) => tuval.toBlob(coz, 'image/webp', 0.82));
    if (!poster) throw new Error('Poster karesi hazırlanamadı.');
    return { sure, genislik: video.videoWidth, yukseklik: video.videoHeight, poster };
  } finally {
    URL.revokeObjectURL(adres);
    video.removeAttribute('src');
    video.load();
  }
}

export async function videoYukle(
  ilanId: string,
  dosya: File,
  ilerleme?: (metin: string) => void
): Promise<VideoYuklemeSonucu> {
  try {
    ilerleme?.('Video denetleniyor ve poster karesi hazırlanıyor…');
    const bilgi = await videoBilgisiniOku(dosya);
    const form = new FormData();
    form.append('ilan', ilanId);
    form.append('video', dosya);
    form.append('poster', new File([bilgi.poster], 'poster.webp', { type: 'image/webp' }));
    form.append('sure', String(bilgi.sure));
    form.append('genislik', String(bilgi.genislik));
    form.append('yukseklik', String(bilgi.yukseklik));
    ilerleme?.(`Video yükleniyor · ${(dosya.size / 1024 / 1024).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} MB`);
    const cevap = await fetch('/yonetim/api/video', { method: 'POST', body: form });
    const sonuc = await cevap.json().catch(() => ({ tamam: false, hata: 'Sunucu yanıtı okunamadı.' })) as VideoYuklemeSonucu;
    if (!cevap.ok) return { tamam: false, hata: sonuc.hata || 'Video yüklenemedi.' };
    return sonuc;
  } catch (hata) {
    return { tamam: false, hata: (hata as Error).message };
  }
}
