/**
 * Kurum bilgileri ve site geneli sabitler.
 * Tek doğruluk kaynağı: bir telefon numarası değişecekse yalnızca burası değişir.
 */

export const KURUM = {
  ad: 'EDM Yapı & Gayrimenkul',
  kisaAd: 'EDM',
  slogan: 'Yatırım Ortağınız',
  // Kılavuz 01 — konumlandırma
  tanim:
    'Trakya’da toprağı bilen, tapuya kadar yanınızda duran yerel emlak ofisi. Silivri merkezli; konut, arsa ve tarla portföyüyle İstanbul, Edirne ve Tekirdağ’da hizmet veriyoruz.',
  kurulus: 2019,
  alanAdi: 'edmyapigayrimenkul.com',
  site: 'https://edmyapigayrimenkul.com',
} as const;

export const ILETISIM = {
  telefon: '0536 343 41 97',
  telefonHam: '+905363434197',
  whatsapp: '905363434197',
  eposta: 'info@edmyapigayrimenkul.com',
  adres: {
    satir1: 'Alibey Mah. Albay Yunus Dirik Cad.',
    satir2: 'Kılıç Apt. No: 58/A',
    ilce: 'Silivri',
    il: 'İstanbul',
    tam: 'Alibey Mah. Albay Yunus Dirik Cad. Kılıç Apt. No: 58/A, Silivri / İstanbul',
  },
  // Ofis koordinatı henüz doğrulanmadı; harita adres aramasıyla açılıyor.
  haritaArama:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('EDM Yapı Gayrimenkul Alibey Mah. Albay Yunus Dirik Cad. Silivri İstanbul'),
  calismaSaatleri: [
    { gun: 'Pazartesi — Cumartesi', saat: '09:00 — 19:00' },
    { gun: 'Pazar', saat: 'Randevuyla' },
  ],
} as const;

/** WhatsApp bağlantısı üretir; metin ilan başlığıyla doldurulabilir. */
export function whatsappBaglanti(mesaj?: string): string {
  const temel = `https://wa.me/${ILETISIM.whatsapp}`;
  return mesaj ? `${temel}?text=${encodeURIComponent(mesaj)}` : temel;
}

export const SOSYAL = [
  { ad: 'Instagram', url: 'https://www.instagram.com/edmyapigayrimenkul/' },
  { ad: 'Facebook', url: 'https://www.facebook.com/edmyapigayrimenkul/' },
  { ad: 'LinkedIn', url: 'https://tr.linkedin.com/company/edm-yapi-gayrimenkul' },
] as const;

/** İlanların yayımlandığı portallar — ilan kartlarından çapraz bağlantı için. */
export const PORTALLAR = {
  emlakjet: {
    ad: 'Emlakjet',
    ofis: 'https://www.emlakjet.com/emlak-ofisleri/edm-yapi-gayrimenkul-1015383',
  },
  hepsiemlak: {
    ad: 'Hepsiemlak',
    ofis: 'https://www.hepsiemlak.com/emlak-ofisi/edm-yapi-gayrimenkul-122060',
  },
  sahibinden: {
    ad: 'Sahibinden',
    ofis: 'https://edmyapigayrimenkul.sahibinden.com/',
  },
} as const;

export interface Danisman {
  slug: string; // site içi adres
  emlakjetSlug: string; // ilanları eşleştirmek için
  ad: string;
  unvan: string;
  telefon?: string;
  eposta?: string;
  foto?: string; // public/ altındaki yol — henüz portre gelmedi
  uzmanlik: string[];
  hakkinda: string;
}

export const DANISMANLAR: Danisman[] = [
  {
    slug: 'dogukan-ozdogan',
    // Emlakjet ofis sayfasında listelenmiyor; ilanlar Metin Özdoğan üzerinden geçiyor.
    emlakjetSlug: '',
    ad: 'Doğukan Özdoğan',
    unvan: 'Broker',
    telefon: ILETISIM.telefon,
    foto: '/ekip/dogukan-ozdogan.webp',
    uzmanlik: ['Yatırım danışmanlığı', 'Portföy yönetimi', 'Kat karşılığı'],
    hakkinda:
      'Ofisin brokerı. Portföy stratejisini kuruyor, kat karşılığı ve büyük parsel görüşmelerini yürütüyor.',
  },
  {
    slug: 'metin-ozdogan',
    emlakjetSlug: 'metin-ozdogan-1025129',
    ad: 'Metin Özdoğan',
    unvan: 'Kurucu · Gayrimenkul Danışmanı',
    telefon: ILETISIM.telefon,
    foto: '/ekip/metin-ozdogan.webp',
    uzmanlik: ['Arsa ve tarla', 'Yatırım danışmanlığı', 'Silivri konut'],
    hakkinda:
      'Ofisin kurucusu. Silivri ve Trakya genelinde arsa, tarla ve konut portföyünü yönetiyor; imar durumu ve tapu süreçlerinde yol gösteriyor.',
  },
  {
    slug: 'ercan-tasdemirler',
    emlakjetSlug: 'ercant-2040746',
    ad: 'Ercan Taşdemirler',
    unvan: 'Gayrimenkul Danışmanı',
    uzmanlik: ['Konut', 'Kiralama', 'Site içi projeler'],
    hakkinda:
      'Silivri merkez ve sahil bandındaki konut portföyünden sorumlu. Kiralama süreçlerini baştan sona yürütüyor.',
  },
  {
    slug: 'basri-celik',
    emlakjetSlug: 'basri-celik-1979967',
    ad: 'Basri Çelik',
    unvan: 'Gayrimenkul Danışmanı',
    uzmanlik: ['Tarla', 'Edirne bölgesi'],
    hakkinda: 'Edirne ve çevresindeki tarım arazileri portföyüyle ilgileniyor.',
  },
];

/**
 * Bir işin baştan sona nasıl ilerlediği.
 *
 * HIZMETLER "ne yapıyoruz"u anlatıyor; bu ise "nasıl gidiyor"u — zaman
 * sırasına dizili. Marka konumlandırmasındaki "tapuya kadar yanınızda"
 * cümlesinin sitedeki karşılığı burası.
 */
export const SUREC = [
  {
    baslik: 'Yerinde görüyoruz',
    ozet:
      'Mülkü geziyor, çevreyi ve son satışları konuşuyoruz. Arsa ya da tarlaysa imar durumunu, kadastral yolu ve tapu kaydını çıkarıyoruz.',
  },
  {
    baslik: 'Fiyatı birlikte koyuyoruz',
    ozet:
      'Bölgede gerçekleşmiş satışlara bakıp bir aralık çıkarıyoruz. Değerleme ücretsiz — sonunda satmak zorunda değilsiniz.',
  },
  {
    baslik: 'Alıcıyı biz buluyoruz',
    ozet:
      'İlan portalları, ofis vitrini ve kendi alıcı listemiz. Gezdirmeyi biz yapıyoruz; her randevuda evde olmak zorunda kalmıyorsunuz.',
  },
  {
    baslik: 'Tapuya kadar yanınızdayız',
    ozet:
      'Pazarlık, sözleşme, harç hesabı ve tapu randevusu. Başladığınız kişiyle bitiriyorsunuz; dosyanız elden ele geçmiyor.',
  },
] as const;

export const HIZMETLER = [
  {
    baslik: 'Alım — Satım',
    ozet:
      'Konut, arsa ve tarlada alıcıyla satıcıyı buluşturuyoruz. Pazarlıktan tapu devrine kadar süreci biz yürütüyoruz.',
  },
  {
    baslik: 'Kiralama',
    ozet:
      'Kiracı bulma, sözleşme hazırlama ve teslim tutanağı. Mülk sahibi adına yıllık takip.',
  },
  {
    baslik: 'Değerleme',
    ozet:
      'Bölgedeki gerçekleşmiş satışlara bakarak mülkünüzün güncel piyasa değerini ücretsiz çıkarıyoruz.',
  },
  {
    baslik: 'Yatırım Danışmanlığı',
    ozet:
      'İmar durumu, kadastral yol, gabari ve KAKS okuması. Hangi parselin ne zaman ne getireceğine birlikte bakıyoruz.',
  },
  {
    baslik: 'Tapu ve İskân',
    ozet:
      'Tapu randevusu, harç hesabı, kat irtifakı ve iskân işlemlerinde yanınızdayız.',
  },
  {
    baslik: 'Kat Karşılığı',
    ozet:
      'Arsa sahibi ile müteahhit arasında kat karşılığı görüşmelerini kuruyor, sözleşme şartlarını denetliyoruz.',
  },
] as const;

export const MENU = [
  { ad: 'İlanlar', yol: '/ilanlar' },
  { ad: 'Danışmanlar', yol: '/danismanlar' },
  { ad: 'Bölge Rehberi', yol: '/rehber' },
  { ad: 'Hakkımızda', yol: '/hakkimizda' },
  { ad: 'İletişim', yol: '/iletisim' },
] as const;
