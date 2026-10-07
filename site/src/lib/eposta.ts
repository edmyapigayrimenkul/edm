/**
 * Cloudflare Email Service üzerinden bildirim gönderimi.
 *
 * Doğrulanmış hedef adrese gönderim ücretsiz ve kotaya sayılmıyor; bu yüzden
 * bildirimler için ayrı bir servise (Resend vb.) ihtiyaç yok.
 * Bağlama tanımlı değilse sessizce atlanır — e-posta gönderilemedi diye
 * form kaydı ya da senkron başarısız sayılmaz.
 */

interface EpostaOrtam {
  EPOSTA?: { send: (mesaj: unknown) => Promise<void> };
  BILDIRIM_ADRESI?: string;
}

const GONDEREN = 'bildirim@edmyapigayrimenkul.com';

/** UTF-8 başlığı e-postanın kabul ettiği biçime çevirir. */
function basligiKodla(metin: string): string {
  const bayt = new TextEncoder().encode(metin);
  let ikili = '';
  for (const b of bayt) ikili += String.fromCharCode(b);
  return `=?UTF-8?B?${btoa(ikili)}?=`;
}

function govdeyiKodla(metin: string): string {
  const bayt = new TextEncoder().encode(metin);
  let ikili = '';
  for (const b of bayt) ikili += String.fromCharCode(b);
  return btoa(ikili);
}

export async function epostaGonder(
  ortam: EpostaOrtam,
  konu: string,
  govde: string,
  hatayiYukselt = false
): Promise<boolean> {
  const gonderici = ortam.EPOSTA;
  if (!gonderici) return false;

  const alici = ortam.BILDIRIM_ADRESI ?? 'info@edmyapigayrimenkul.com';

  try {
    const { EmailMessage } = await import('cloudflare:email');
    const ham = [
      `From: EDM Sitesi <${GONDEREN}>`,
      `To: <${alici}>`,
      `Subject: ${basligiKodla(konu)}`,
      `Message-ID: <${crypto.randomUUID()}@edmyapigayrimenkul.com>`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      govdeyiKodla(`${govde}\n`),
    ].join('\r\n');

    await gonderici.send(new EmailMessage(GONDEREN, alici, ham));
    return true;
  } catch (hata) {
    console.error('E-posta gönderilemedi.');
    if (hatayiYukselt) throw hata;
    return false;
  }
}

/**
 * Günlük özet: dün ne oldu.
 * Sabah tek bir e-posta — her talep için ayrı bildirim zaten gidiyor,
 * bu onun yerine geçmiyor, günü toparlıyor.
 */
export async function gunlukOzet(vt: D1Database, ortam: EpostaOrtam): Promise<boolean> {
  const [talepler, bakislar, ilanlar, hatirlatmalar] = await Promise.all([
    vt
      .prepare(
        `SELECT tur, ad, telefon, ilce, mulk_tipi FROM talepler
         WHERE olusturma >= datetime('now', '-1 day') ORDER BY id DESC`
      )
      .all<Record<string, string>>()
      .catch(() => ({ results: [] })),
    vt
      .prepare(
        `SELECT SUM(adet) AS toplam FROM goruntulenme WHERE gun = date('now', '-1 day')`
      )
      .first<{ toplam: number | null }>()
      .catch(() => ({ toplam: 0 })),
    vt
      .prepare(
        `SELECT
           SUM(CASE WHEN i.durum = 'aktif' AND COALESCE(d.gizli, 0) = 0 THEN 1 ELSE 0 END) AS aktif,
           SUM(CASE WHEN i.pasif_tarihi >= datetime('now','-1 day') THEN 1 ELSE 0 END) AS yeniPasif,
           SUM(CASE WHEN i.ilk_gorulme >= datetime('now','-1 day') THEN 1 ELSE 0 END) AS yeniIlan
         FROM ilanlar i
         LEFT JOIN ilan_duzenleme d ON d.ilan_id = i.id`
      )
      .first<{ aktif: number; yeniPasif: number; yeniIlan: number }>()
      .catch(() => null),
    vt
      .prepare(
        `SELECT h.ilan_id, h.planlanan, h.notu, i.baslik
         FROM ilan_hatirlatma h JOIN ilanlar i ON i.id = h.ilan_id
         WHERE h.durum = 'bekliyor' AND date(h.planlanan) <= date('now', '+3 hours')
         ORDER BY h.planlanan LIMIT 30`
      )
      .all<{ ilan_id: string; planlanan: string; notu: string; baslik: string }>()
      .catch(() => ({ results: [] })),
  ]);

  const yeniTalepler = talepler.results ?? [];

  // Kayda değer bir şey yoksa e-posta göndermiyoruz — her sabah boş bir
  // "hiçbir şey olmadı" maili en hızlı görmezden gelinen şeydir.
  const gelenHatirlatmalar = hatirlatmalar.results ?? [];
  // Kalıcı bekleyen talep/senkron sorunları işletim uyarısında bir kez bildirilir.
  if (yeniTalepler.length === 0 && gelenHatirlatmalar.length === 0) return false;

  const satirlar: string[] = ['EDM — günlük özet', ''];

  if (yeniTalepler.length) {
    satirlar.push(`Dün gelen talepler (${yeniTalepler.length}):`);
    for (const t of yeniTalepler) {
      const detay = [t.mulk_tipi, t.ilce].filter(Boolean).join(', ');
      satirlar.push(
        `  • ${t.ad} — ${t.telefon}` +
          `  [${t.tur === 'degerleme' ? 'değerleme' : 'iletişim'}${detay ? ' · ' + detay : ''}]`
      );
    }
    satirlar.push('');
  } else {
    satirlar.push('Dün yeni talep gelmedi.', '');
  }

  satirlar.push(
    `İlan durumu: ${ilanlar?.aktif ?? 0} aktif` +
      (ilanlar?.yeniIlan ? `, ${ilanlar.yeniIlan} yeni` : '') +
      (ilanlar?.yeniPasif ? `, ${ilanlar.yeniPasif} yayından kalktı` : '')
  );
  satirlar.push(`Dün toplam ${bakislar?.toplam ?? 0} ilan görüntülenmesi.`);

  if (gelenHatirlatmalar.length) {
    satirlar.push('', `Bugün kontrol edilecek ilanlar (${gelenHatirlatmalar.length}):`);
    for (const h of gelenHatirlatmalar) {
      satirlar.push(`  • ${h.baslik} (No: ${h.ilan_id})${h.notu ? ` — ${h.notu}` : ''}`);
    }
  }

  satirlar.push('', 'Panel: https://edmyapigayrimenkul.com/yonetim/talepler');

  const gonderildi = await epostaGonder(ortam, 'EDM — günlük özet', satirlar.join('\n'));
  if (gonderildi && gelenHatirlatmalar.length) {
    const zaman = new Date().toISOString();
    await vt.batch(gelenHatirlatmalar.map((h) => vt
      .prepare(`UPDATE ilan_hatirlatma SET durum = 'bildirildi', bildirim = ?, guncelleme = ? WHERE ilan_id = ? AND durum = 'bekliyor'`)
      .bind(zaman, zaman, h.ilan_id)));
  }
  return gonderildi;
}
