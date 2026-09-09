/**
 * Google yorumlarını çekme.
 *
 * Kaynak: Places API (New) — Place Details. Google en fazla **5 yorum**
 * döndürüyor, hangileri olduğuna kendisi karar veriyor. Bu bir sınır,
 * aşılamıyor; işletmenin 40 yorumu da olsa API 5 tanesini veriyor.
 *
 * Yer kimliğini elle girmeye gerek yok: ilk çalışmada işletme adıyla
 * aranıp bulunuyor ve ayarlara yazılıyor. Google'ın koşulları yer
 * kimliğinin süresiz saklanmasına izin veriyor, geri kalan içerik ise
 * her gün tazeleniyor.
 *
 * Gösterim koşulları (Places API politikaları):
 *  - Yorumu yazanın adı ve avatarı görünmek zorunda
 *  - Yorumun Google'daki aslına bağlantı verilmek zorunda
 *  - "Yorumlar Google tarafından doğrulanmaz" uyarısı öneriliyor
 * Bunların karşılığı ana sayfadaki yorum kartında duruyor.
 */

const ARAMA_UCU = 'https://places.googleapis.com/v1/places:searchText';
const DETAY_UCU = 'https://places.googleapis.com/v1/places/';

export const YORUM_SEMA = `
ALTER TABLE yorumlar ADD COLUMN dis_kimlik TEXT;
ALTER TABLE yorumlar ADD COLUMN foto TEXT;
ALTER TABLE yorumlar ADD COLUMN profil_url TEXT;
ALTER TABLE yorumlar ADD COLUMN google_url TEXT;
`;

interface GoogleYorum {
  name?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  googleMapsUri?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
}

interface Sonuc {
  durum: 'tamam' | 'atlandi' | 'hata';
  not?: string;
  yerKimligi?: string;
  puan?: number;
  toplamYorum?: number;
  alinan?: number;
  yazilan?: number;
}

/** Ayar tablosundan tek bir değer okur. */
async function ayarOku(vt: D1Database, anahtar: string): Promise<string | null> {
  const satir = await vt
    .prepare(`SELECT deger FROM ayarlar WHERE anahtar = ?`)
    .bind(anahtar)
    .first<{ deger: string }>()
    .catch(() => null);
  return satir?.deger ?? null;
}

async function ayarYaz(vt: D1Database, anahtar: string, deger: string): Promise<void> {
  await vt
    .prepare(
      `INSERT INTO ayarlar (anahtar, deger) VALUES (?, ?)
       ON CONFLICT(anahtar) DO UPDATE SET deger = excluded.deger`
    )
    .bind(anahtar, deger)
    .run();
}

/** İşletmeyi adıyla arayıp yer kimliğini bulur. */
async function yeriBul(anahtar: string, sorgu: string): Promise<string | null> {
  const yanit = await fetch(ARAMA_UCU, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': anahtar,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
      Referer: 'https://edmyapigayrimenkul.com/',
    },
    body: JSON.stringify({ textQuery: sorgu, languageCode: 'tr', maxResultCount: 1 }),
  });
  if (!yanit.ok) return null;
  const govde = (await yanit.json()) as { places?: Array<{ id?: string }> };
  return govde.places?.[0]?.id ?? null;
}

/**
 * Yorumları çeker ve veritabanına yazar.
 *
 * Elle girilmiş yorumlara dokunmuyor — yalnızca kaynağı Google olanları
 * tazeliyor. Panelden gizlenen bir yorum tekrar açılmıyor: gizleme
 * kararı senkronu aşıyor.
 */
export async function googleYorumlariniCek(
  vt: D1Database,
  env: Record<string, unknown>
): Promise<Sonuc> {
  const anahtar = env.GOOGLE_ANAHTARI as string | undefined;
  if (!anahtar) return { durum: 'atlandi', not: 'GOOGLE_ANAHTARI tanımlı değil' };

  const sorgu =
    (env.GOOGLE_ISLETME_ARAMASI as string | undefined) ??
    'EDM Yapı ve Gayrimenkul Silivri İstanbul';

  try {
    // Yer kimliği bir kez bulunur, sonra saklanır.
    let yerKimligi = await ayarOku(vt, 'google_yer_kimligi');
    if (!yerKimligi) {
      yerKimligi = await yeriBul(anahtar, sorgu);
      if (!yerKimligi) return { durum: 'hata', not: `İşletme bulunamadı: ${sorgu}` };
      await ayarYaz(vt, 'google_yer_kimligi', yerKimligi);
    }

    const yanit = await fetch(`${DETAY_UCU}${yerKimligi}`, {
      headers: {
        'X-Goog-Api-Key': anahtar,
        'X-Goog-FieldMask':
          'id,displayName,rating,userRatingCount,googleMapsUri,reviews',
        'Accept-Language': 'tr',
        Referer: 'https://edmyapigayrimenkul.com/',
      },
    });

    if (!yanit.ok) {
      const govde = await yanit.text();
      return { durum: 'hata', not: `Places API ${yanit.status}: ${govde.slice(0, 160)}` };
    }

    const veri = (await yanit.json()) as {
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
      reviews?: GoogleYorum[];
    };

    const yorumlar = veri.reviews ?? [];
    if (!yorumlar.length) {
      return {
        durum: 'tamam',
        yerKimligi,
        puan: veri.rating,
        toplamYorum: veri.userRatingCount,
        alinan: 0,
        yazilan: 0,
      };
    }

    // İşletmenin genel puanı sitede de gösterilebilsin.
    if (veri.rating) await ayarYaz(vt, 'google_puan', String(veri.rating));
    if (veri.userRatingCount) await ayarYaz(vt, 'google_yorum_sayisi', String(veri.userRatingCount));
    if (veri.googleMapsUri) await ayarYaz(vt, 'google_harita_url', veri.googleMapsUri);

    let yazilan = 0;
    for (const [sira, y] of yorumlar.entries()) {
      const metin = (y.originalText?.text ?? y.text?.text ?? '').trim();
      const ad = y.authorAttribution?.displayName?.trim();
      if (!metin || !ad || !y.name) continue;

      await vt
        .prepare(
          `INSERT INTO yorumlar
             (dis_kimlik, ad, metin, kaynak, tarih, puan, foto, profil_url, google_url, sira)
           VALUES (?,?,?,'Google',?,?,?,?,?,?)
           ON CONFLICT(dis_kimlik) DO UPDATE SET
             ad = excluded.ad,
             metin = excluded.metin,
             tarih = excluded.tarih,
             puan = excluded.puan,
             foto = excluded.foto,
             profil_url = excluded.profil_url,
             google_url = excluded.google_url,
             sira = excluded.sira`
        )
        .bind(
          y.name,
          ad,
          metin,
          y.relativePublishTimeDescription ?? y.publishTime ?? null,
          y.rating ?? null,
          y.authorAttribution?.photoUri ?? null,
          y.authorAttribution?.uri ?? null,
          y.googleMapsUri ?? null,
          sira
        )
        .run();
      yazilan++;
    }

    return {
      durum: 'tamam',
      yerKimligi,
      puan: veri.rating,
      toplamYorum: veri.userRatingCount,
      alinan: yorumlar.length,
      yazilan,
    };
  } catch (hata) {
    return { durum: 'hata', not: (hata as Error).message };
  }
}
