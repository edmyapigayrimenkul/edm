/**
 * Paylaşım görselinin çizimi.
 *
 * Panelde de, yerel görsel denemesinde de aynı kod çalışsın diye ayrı
 * modül: kompozisyonu iki yerde tutmak, birinde düzeltip diğerinde
 * unutmak demekti.
 *
 * Tamamen tarayıcıda çalışıyor — sunucuda görüntü işleme yok. Fotoğrafı
 * çağıran taraf yüklüyor; panelde portal görseli kendi alan adımızdan
 * geçiyor ki canvas kirlenip toBlob() kırılmasın.
 */

export type Bicim = 'hikaye' | 'gonderi' | 'kare';

/** Instagram ve WhatsApp'ın beklediği ölçüler. */
export const OLCU: Record<Bicim, [number, number]> = {
  hikaye: [1080, 1920],
  gonderi: [1080, 1350],
  kare: [1080, 1080],
};

export interface PaylasimIlan {
  id: string;
  baslik: string;
  islem: string;
  kategori: string;
  konum: string;
  mahalle: string;
  ilce: string;
  il: string;
  fiyat: string;
  birim: string;
  oda: string;
  m2: string;
  yol: string;
  kapak: string;
  gorseller: string[];
}

export interface PaylasimAyar {
  site: string;
  telefon: string;
  sabit: string;
}

const KIRMIZI = '#f0000d';
const MUREKKEP = '#121316';
const KAGIT = '#f4f4f3';

/** Metni satırlara böler; sığmayanı üç noktayla keser. */
function satirla(
  ctx: CanvasRenderingContext2D,
  metin: string,
  enFazla: number,
  satirSayisi: number
): string[] {
  const kelimeler = String(metin).split(/\s+/).filter(Boolean);
  const satirlar: string[] = [];
  let su = '';

  for (const kelime of kelimeler) {
    const deneme = su ? `${su} ${kelime}` : kelime;
    if (!su || ctx.measureText(deneme).width <= enFazla) {
      su = deneme;
    } else {
      satirlar.push(su);
      su = kelime;
      if (satirlar.length === satirSayisi) break;
    }
  }
  if (satirlar.length < satirSayisi && su) satirlar.push(su);

  if (satirlar.join(' ').length < kelimeler.join(' ').length) {
    let son = satirlar[satirlar.length - 1];
    while (ctx.measureText(`${son}…`).width > enFazla && son.length > 4) son = son.slice(0, -1);
    satirlar[satirlar.length - 1] = `${son.trim()}…`;
  }
  return satirlar;
}

function yuvarlakKutu(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  g: number,
  b: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + g, y, x + g, y + b, r);
  ctx.arcTo(x + g, y + b, x, y + b, r);
  ctx.arcTo(x, y + b, x, y, r);
  ctx.arcTo(x, y, x + g, y, r);
  ctx.closePath();
}

export interface CizimSecenek {
  /** Kullanılacak fotoğrafın adresi; boşsa ilanın kapağı. */
  fotoAdresi?: string;
  /** Adresi HTMLImageElement'e çeviren yükleyici. */
  gorselYukle: (adres: string) => Promise<HTMLImageElement>;
  /** Açık logonun adresi. */
  logoAdresi?: string;
}

/** Görseli çizer; dönen uyarı varsa arayüzde gösterilecek. */
export async function paylasimCiz(
  tuval: HTMLCanvasElement,
  ilan: PaylasimIlan,
  ayar: PaylasimAyar,
  bicim: Bicim,
  secenek: CizimSecenek
): Promise<{ en: number; boy: number; uyari?: string }> {
  const [en, boy] = OLCU[bicim];
  tuval.width = en;
  tuval.height = boy;
  const ctx = tuval.getContext('2d');
  if (!ctx) return { en, boy, uyari: 'Canvas açılamadı.' };

  let uyari: string | undefined;

  ctx.fillStyle = MUREKKEP;
  ctx.fillRect(0, 0, en, boy);

  // Fotoğraf — kırpmadan kaplayacak şekilde
  const adres = secenek.fotoAdresi || ilan.kapak;
  if (adres) {
    try {
      const g = await secenek.gorselYukle(adres);
      const oran = Math.max(en / g.width, boy / g.height);
      const gg = g.width * oran;
      const bb = g.height * oran;
      ctx.drawImage(g, (en - gg) / 2, (boy - bb) / 2, gg, bb);
    } catch {
      uyari = 'Fotoğraf yüklenemedi — yazı yine de basıldı.';
    }
  }

  // Üstte hafif, altta güçlü perde: yazı her fotoğrafta okunsun
  const ust = ctx.createLinearGradient(0, 0, 0, boy * 0.22);
  ust.addColorStop(0, 'rgba(18,19,22,0.55)');
  ust.addColorStop(1, 'rgba(18,19,22,0)');
  ctx.fillStyle = ust;
  ctx.fillRect(0, 0, en, boy * 0.22);

  const alt = ctx.createLinearGradient(0, boy * 0.34, 0, boy);
  alt.addColorStop(0, 'rgba(18,19,22,0)');
  alt.addColorStop(0.5, 'rgba(18,19,22,0.74)');
  alt.addColorStop(1, 'rgba(18,19,22,0.97)');
  ctx.fillStyle = alt;
  ctx.fillRect(0, boy * 0.34, en, boy * 0.66);

  const pay = Math.round(en * 0.067);
  const genis = en - pay * 2;

  try {
    const logo = await secenek.gorselYukle(secenek.logoAdresi ?? '/marka/logo-yatay-acik.png');
    const lg = en * 0.31;
    ctx.drawImage(logo, pay, Math.round(pay * 1.05), lg, (logo.height / logo.width) * lg);
  } catch {
    // Logo yoksa yazı yine basılır.
  }

  // --- Alttan yukarı doğru diziliyor ---
  let y = boy - pay;

  ctx.textAlign = 'left';
  ctx.font = `500 ${Math.round(en * 0.0285)}px 'Plex Sans', sans-serif`;
  ctx.fillStyle = 'rgba(244,244,243,0.82)';
  ctx.fillText(ayar.telefon, pay, y);
  ctx.textAlign = 'right';
  ctx.fillText('edmyapigayrimenkul.com', en - pay, y);
  ctx.textAlign = 'left';
  y -= Math.round(en * 0.038);

  ctx.fillStyle = 'rgba(244,244,243,0.2)';
  ctx.fillRect(pay, y, genis, 1);
  y -= Math.round(en * 0.045);

  // Alttan yukarı dizerken her adım, ÜSTTE gelecek satırın punto boyuna
  // göre hesaplanıyor. Sabit küçük adımlarda büyük fiyat yazısı bir
  // üstteki satıra giriyordu.
  const fiyatBoyu = Math.round(en * 0.076);
  const konumBoyu = Math.round(en * 0.032);
  const kunyeBoyu = Math.round(en * 0.029);
  const baslikBoyu = Math.round(en * 0.06);

  const kunye = [ilan.oda, ilan.m2, ilan.birim].filter(Boolean).join('   ·   ');
  if (kunye) {
    ctx.font = `400 ${kunyeBoyu}px 'Plex Mono', monospace`;
    ctx.fillStyle = 'rgba(244,244,243,0.74)';
    ctx.fillText(kunye, pay, y);
  }
  y -= Math.round(fiyatBoyu + en * 0.022);

  ctx.font = `500 ${fiyatBoyu}px 'Plex Mono', monospace`;
  ctx.fillStyle = KAGIT;
  ctx.fillText(ilan.fiyat, pay, y);
  // Fiyat büyük punto: konumun taban çizgisi, fiyatın tepesinin üstünde
  // kalsın diye adım fiyatın kendi boyuna göre.
  y -= Math.round(fiyatBoyu * 0.95 + en * 0.016);

  ctx.font = `400 ${konumBoyu}px 'Plex Sans', sans-serif`;
  ctx.fillStyle = 'rgba(244,244,243,0.72)';
  ctx.fillText(ilan.konum, pay, y);
  y -= Math.round(baslikBoyu + en * 0.032);

  ctx.font = `700 ${baslikBoyu}px 'Fraunces', Georgia, serif`;
  ctx.fillStyle = KAGIT;
  const satirlar = satirla(ctx, ilan.baslik, genis, bicim === 'kare' ? 2 : 3).reverse();
  for (const satir of satirlar) {
    ctx.fillText(satir, pay, y);
    y -= Math.round(baslikBoyu * 1.16);
  }
  y -= Math.round(en * 0.03);

  ctx.font = `600 ${Math.round(en * 0.026)}px 'Plex Sans', sans-serif`;
  // "SATILIK · SATILIK DAİRE" gibi tekrar olmasın: kategori zaten işlemi
  // içeriyorsa tek başına yeter.
  const kategoriBuyuk = ilan.kategori.toLocaleUpperCase('tr');
  const rozet = kategoriBuyuk.startsWith(ilan.islem) ? kategoriBuyuk : `${ilan.islem} · ${kategoriBuyuk}`;
  const rg = ctx.measureText(rozet).width + en * 0.045;
  const rb = Math.round(en * 0.055);
  ctx.fillStyle = KIRMIZI;
  yuvarlakKutu(ctx, pay, y - rb + Math.round(en * 0.012), rg, rb, rb / 2);
  ctx.fill();
  ctx.fillStyle = KAGIT;
  ctx.fillText(rozet, pay + en * 0.0225, y - Math.round(en * 0.008));

  return { en, boy, uyari };
}

/** Kopyalanmaya hazır paylaşım metni. */
export function paylasimMetni(ilan: PaylasimIlan, ayar: PaylasimAyar): string {
  const yer = [ilan.mahalle, ilan.ilce].filter(Boolean).join(', ');
  const kunye = [ilan.oda, ilan.m2, ilan.birim].filter(Boolean).join(' · ');
  const sadeles = (m: string) => m.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]/gu, '');

  const islemEtiketi = `#${sadeles(ilan.islem)}`;
  const etiketler = [
    '#silivri',
    `#${sadeles(ilan.ilce || 'silivri')}`,
    islemEtiketi,
    `#${sadeles(ilan.kategori)}`,
    '#emlak',
    '#gayrimenkul',
    '#trakya',
    '#edmyapigayrimenkul',
  ];

  const satirlar = [ilan.baslik, ''];
  if (yer) satirlar.push(`📍 ${yer}`);
  if (kunye) satirlar.push(kunye);
  satirlar.push(`💰 ${ilan.fiyat}`, '');
  satirlar.push('Detaylar ve tüm fotoğraflar:', `${ayar.site}${ilan.yol}`, '');
  satirlar.push(`☎️ ${ayar.telefon}${ayar.sabit ? ` · ${ayar.sabit}` : ''}`, '');
  satirlar.push(etiketler.join(' '));

  return satirlar.join('\n');
}
