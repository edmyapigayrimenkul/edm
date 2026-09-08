/**
 * Müşteri yorumları.
 *
 * BURASI BİLEREK BOŞ. Yorum uydurulmaz — sitede görünen her yorumun gerçek bir
 * müşteriye ait olması gerekir. Google İşletme Profili'ndeki yorumları buraya
 * aktarın; dizi doldukça ana sayfadaki bölüm kendiliğinden görünür hale gelir.
 *
 * Örnek kayıt:
 *   {
 *     ad: 'Ad Soyad',
 *     metin: 'Yorumun kendi cümleleriyle metni.',
 *     kaynak: 'Google',
 *     tarih: '2026-04-18',
 *     puan: 5,
 *     konu: 'Silivri’de arsa alımı',
 *   }
 */

export interface Yorum {
  ad: string;
  metin: string;
  kaynak: 'Google' | 'Sahibinden' | 'Doğrudan';
  tarih: string;
  puan?: 1 | 2 | 3 | 4 | 5;
  konu?: string;
}

export const YORUMLAR: Yorum[] = [];
