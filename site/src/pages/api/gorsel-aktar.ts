/**
 * Hepsiemlak görsellerini portföye bağlar.
 *
 * Neden ayrı bir uç: Hepsiemlak sayfaları bot korumasının arkasında, sunucudan
 * çekilemiyor. Ama görselleri Emlakjet'inkilerden belirgin biçimde daha iyi —
 * yatay çekim, 1600 piksel, daha fazla kare ve üzerinde rakip portalın değil
 * ofisin kendi logosu var. Bu yüzden görselleri tarayıcı üzerinden bir kez
 * toplayıp buraya gönderiyoruz; metin ve özellikler Emlakjet'ten gelmeye
 * devam ediyor.
 *
 * Eşleştirme başlığa göre yapılıyor: iki portalda da ilan başlıkları aynı
 * (biri büyük harf yazılmış olsa da), sadeleştirince birebir tutuyorlar.
 */

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { onbellegiTemizle } from '../../lib/ilanlar';

interface GelenIlan {
  ref: string;
  baslik: string;
  gorseller: string[];
}

/**
 * Bu uç, aktarımı yapan tarayıcı sekmesi Hepsiemlak alan adındayken çağrılıyor;
 * o yüzden çapraz kaynak isteğe izin veriyoruz. Uç zaten gizli anahtarla
 * korunuyor, anahtarsız istek 401 dönüyor.
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Senkron-Anahtari',
  'Access-Control-Max-Age': '600',
};

const yanit = (govde: unknown, durum = 200) =>
  new Response(JSON.stringify(govde, null, 1), {
    status: durum,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });

export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: CORS });

const TR_HARF: Record<string, string> = {
  ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u',
  â: 'a', î: 'i', û: 'u',
};

/** Başlığı karşılaştırılabilir hale getirir: küçük harf, harf dışı her şey atılır. */
function sadelestir(metin: string): string {
  return metin
    .toLocaleLowerCase('tr')
    .split('')
    .map((h) => TR_HARF[h] ?? h)
    .join('')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

/** Ortak kelime oranı — birebir tutmayan başlıklar için yedek ölçü. */
function benzerlik(a: string, b: string): number {
  const kelime = (s: string) =>
    new Set(
      s
        .toLocaleLowerCase('tr')
        .split('')
        .map((h) => TR_HARF[h] ?? h)
        .join('')
        .split(/[^a-z0-9]+/)
        .filter((k) => k.length > 2)
    );
  const x = kelime(a);
  const y = kelime(b);
  if (!x.size || !y.size) return 0;
  let ortak = 0;
  for (const k of x) if (y.has(k)) ortak++;
  return ortak / Math.max(x.size, y.size);
}

export const POST: APIRoute = async ({ request }) => {
  const beklenen = (env as Record<string, unknown>).SENKRON_ANAHTARI as string | undefined;
  const gelen = request.headers.get('X-Senkron-Anahtari');
  if (!beklenen || gelen !== beklenen) return yanit({ hata: 'Yetkisiz.' }, 401);

  let govde: { ilanlar?: GelenIlan[] };
  try {
    govde = await request.json();
  } catch {
    return yanit({ hata: 'Geçersiz gövde.' }, 400);
  }

  const gelenler = (govde.ilanlar ?? []).filter((i) => i.ref && i.gorseller?.length);
  if (!gelenler.length) return yanit({ hata: 'Görselli ilan gelmedi.' }, 400);

  const vt = env.VT as D1Database;

  // Şema — ilk çalıştırmada sütunları ekle
  for (const sql of [
    `ALTER TABLE ilanlar ADD COLUMN hepsiemlak_ref TEXT`,
    `ALTER TABLE ilanlar ADD COLUMN hepsiemlak_gorseller TEXT`,
  ]) {
    await vt.prepare(sql).run().catch(() => {});
  }

  const mevcutlar = await vt
    .prepare(`SELECT id, baslik FROM ilanlar WHERE durum = 'aktif'`)
    .all<{ id: string; baslik: string }>();

  const sadeHarita = new Map<string, string>();
  for (const m of mevcutlar.results ?? []) sadeHarita.set(sadelestir(m.baslik), m.id);

  const yazmalar: D1PreparedStatement[] = [];
  const eslesen: string[] = [];
  const eslesmeyen: string[] = [];

  for (const g of gelenler) {
    let id = sadeHarita.get(sadelestir(g.baslik));

    // Birebir tutmadıysa en yakın başlığı ara; %70 altını kabul etmiyoruz.
    if (!id) {
      let enIyi = { id: '', puan: 0 };
      for (const m of mevcutlar.results ?? []) {
        const puan = benzerlik(g.baslik, m.baslik);
        if (puan > enIyi.puan) enIyi = { id: m.id, puan };
      }
      if (enIyi.puan >= 0.7) id = enIyi.id;
    }

    if (!id) {
      eslesmeyen.push(`${g.ref} — ${g.baslik.slice(0, 50)}`);
      continue;
    }

    // Yollar göreli geliyor; tam adrese burada çeviriyoruz.
    const tamAdresler = g.gorseller.map(
      (y) => `https://hecdn01.hemlak.com/mnresize/1280/960/${y}`
    );

    yazmalar.push(
      vt
        .prepare(`UPDATE ilanlar SET hepsiemlak_ref = ?, hepsiemlak_gorseller = ? WHERE id = ?`)
        .bind(g.ref, JSON.stringify(tamAdresler), id)
    );
    eslesen.push(`${id} ← ${g.ref}`);
  }

  if (yazmalar.length) await vt.batch(yazmalar);
  onbellegiTemizle();

  return yanit({
    tamam: true,
    gelen: gelenler.length,
    eslesen: eslesen.length,
    eslesmeyen,
  });
};
