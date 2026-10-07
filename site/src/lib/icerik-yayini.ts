/** postedm'den gelen web içeriğini güvenli bir site taslağına dönüştürür. */

export type SiteIcerikTuru = 'bulten' | 'rehber' | 'sozluk';
export type HukukiInceleme = 'gerekli' | 'tamam' | 'uygulanmaz';
export type SiteIcerikDurumu = 'taslak' | 'yayinda' | 'arsiv';

export interface SiteIcerikGirdisi {
  disKimlik?: unknown;
  tur?: unknown;
  slug?: unknown;
  baslik?: unknown;
  spot?: unknown;
  govde?: unknown;
  kategori?: unknown;
  kaynakAdlari?: unknown;
  kaynakUrlleri?: unknown;
  kapakUrl?: unknown;
  sosyalUrlleri?: unknown;
  orijinalYayin?: unknown;
}

export interface SiteIcerikTaslagi {
  disKimlik: string;
  tur: SiteIcerikTuru;
  slug: string;
  baslik: string;
  spot: string;
  govde: string;
  kategori: string;
  kaynakAdlari: string[];
  kaynakUrlleri: string[];
  kapakUrl: string;
  sosyalUrlleri: string[];
  orijinalYayin: string | null;
  guncelleme: string;
  durum: 'taslak';
  hukukiInceleme: Exclude<HukukiInceleme, 'tamam'>;
}

/** D1'den okunmuş içerik. Diziler, veritabanındaki JSON metninden burada çözülür. */
export interface SiteIcerikKaydi {
  id: number;
  disKimlik: string;
  tur: SiteIcerikTuru;
  slug: string;
  baslik: string;
  spot: string;
  govde: string;
  kategori: string;
  kaynakAdlari: string[];
  kaynakUrlleri: string[];
  kapakUrl: string;
  sosyalUrlleri: string[];
  orijinalYayin: string | null;
  siteYayini: string | null;
  guncelleme: string;
  durum: SiteIcerikDurumu;
  hukukiInceleme: HukukiInceleme;
}

export class SiteIcerikHatasi extends Error {
  alanlar: Array<{ alan: string; mesaj: string }>;

  constructor(alanlar: Array<{ alan: string; mesaj: string }>) {
    super('İçerik taslağı doğrulanamadı.');
    this.alanlar = alanlar;
  }
}

const RISKLI_KONULAR = /hukuk|vergi|kredi|imar|tapu|kira|tahliye|dönüşüm|mevzuat|yönetmelik|kanun/i;

function metin(deger: unknown, enFazla: number): string {
  return typeof deger === 'string' ? deger.replaceAll('\0', '').trim().slice(0, enFazla) : '';
}

function dizi(deger: unknown, enFazla: number, ogeUzunlugu: number): string[] {
  if (!Array.isArray(deger)) return [];
  return [...new Set(deger.map((oge) => metin(oge, ogeUzunlugu)).filter(Boolean))].slice(0, enFazla);
}

function jsonDizisi(deger: unknown): string[] {
  try {
    const sonuc = JSON.parse(String(deger ?? '[]'));
    return Array.isArray(sonuc) ? sonuc.filter((oge): oge is string => typeof oge === 'string') : [];
  } catch {
    return [];
  }
}

function kaydiDonustur(satir: Record<string, unknown>): SiteIcerikKaydi {
  return {
    id: Number(satir.id), disKimlik: String(satir.dis_kimlik),
    tur: String(satir.tur) as SiteIcerikTuru, slug: String(satir.slug),
    baslik: String(satir.baslik), spot: String(satir.spot ?? ''), govde: String(satir.govde),
    kategori: String(satir.kategori ?? ''), kaynakAdlari: jsonDizisi(satir.kaynak_adlari),
    kaynakUrlleri: jsonDizisi(satir.kaynak_url_listesi), kapakUrl: String(satir.kapak_url ?? ''),
    sosyalUrlleri: jsonDizisi(satir.sosyal_url_listesi),
    orijinalYayin: satir.orijinal_yayin ? String(satir.orijinal_yayin) : null,
    siteYayini: satir.site_yayini ? String(satir.site_yayini) : null,
    guncelleme: String(satir.guncelleme), durum: String(satir.durum) as SiteIcerikDurumu,
    hukukiInceleme: String(satir.hukuki_inceleme) as HukukiInceleme,
  };
}

function disUrl(adres: string): boolean {
  try {
    const url = new URL(adres);
    return url.protocol === 'https:' && !['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

function tarih(deger: unknown): string | null {
  const ham = metin(deger, 40);
  if (!ham) return null;
  const zaman = Date.parse(ham);
  return Number.isFinite(zaman) ? new Date(zaman).toISOString() : null;
}

export function siteIcerikTaslaginiHazirla(girdi: SiteIcerikGirdisi, simdi = new Date()): SiteIcerikTaslagi {
  const hatalar: Array<{ alan: string; mesaj: string }> = [];
  const disKimlik = metin(girdi.disKimlik, 120);
  const tur = metin(girdi.tur, 20) as SiteIcerikTuru;
  const slug = metin(girdi.slug, 140).toLocaleLowerCase('tr-TR');
  const baslik = metin(girdi.baslik, 180);
  const spot = metin(girdi.spot, 500);
  const govde = metin(girdi.govde, 50_000);
  const kategori = metin(girdi.kategori, 100);
  const kaynakAdlari = dizi(girdi.kaynakAdlari, 12, 160);
  const kaynakUrlleri = dizi(girdi.kaynakUrlleri, 12, 2_000);
  const kapakUrl = metin(girdi.kapakUrl, 2_000);
  const sosyalUrlleri = dizi(girdi.sosyalUrlleri, 12, 2_000);
  const orijinalYayin = tarih(girdi.orijinalYayin);

  if (!/^postedm:haber:[1-9]\d*$/.test(disKimlik)) hatalar.push({ alan: 'disKimlik', mesaj: 'postedm:haber:<id> biçiminde olmalı.' });
  if (!['bulten', 'rehber', 'sozluk'].includes(tur)) hatalar.push({ alan: 'tur', mesaj: 'Geçerli içerik türü gerekli.' });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) hatalar.push({ alan: 'slug', mesaj: 'Slug küçük harf, rakam ve tirelerden oluşmalı.' });
  if (baslik.length < 12) hatalar.push({ alan: 'baslik', mesaj: 'Başlık en az 12 karakter olmalı.' });
  if (spot.length < 30) hatalar.push({ alan: 'spot', mesaj: 'Spot en az 30 karakter olmalı.' });
  if (govde.length < 160) hatalar.push({ alan: 'govde', mesaj: 'Web metni en az 160 karakter olmalı.' });
  if (!kaynakUrlleri.length) hatalar.push({ alan: 'kaynakUrlleri', mesaj: 'En az bir doğrulanabilir kaynak bağlantısı gerekli.' });
  if (kaynakUrlleri.some((url) => !disUrl(url))) hatalar.push({ alan: 'kaynakUrlleri', mesaj: 'Kaynak bağlantıları geçerli HTTPS adresleri olmalı.' });
  if (kapakUrl && !disUrl(kapakUrl)) hatalar.push({ alan: 'kapakUrl', mesaj: 'Kapak bağlantısı geçerli bir HTTPS adresi olmalı.' });
  if (sosyalUrlleri.some((url) => !disUrl(url))) hatalar.push({ alan: 'sosyalUrlleri', mesaj: 'Sosyal bağlantılar geçerli HTTPS adresleri olmalı.' });
  if (girdi.orijinalYayin && !orijinalYayin) hatalar.push({ alan: 'orijinalYayin', mesaj: 'Geçerli tarih gerekli.' });
  if (hatalar.length) throw new SiteIcerikHatasi(hatalar);

  return {
    disKimlik, tur, slug, baslik, spot, govde, kategori,
    kaynakAdlari, kaynakUrlleri, kapakUrl, sosyalUrlleri, orijinalYayin,
    guncelleme: simdi.toISOString(), durum: 'taslak',
    hukukiInceleme: RISKLI_KONULAR.test(`${kategori} ${baslik} ${spot} ${govde}`) ? 'gerekli' : 'uygulanmaz',
  };
}

export async function siteIcerikSemasiniKur(vt: D1Database): Promise<void> {
  await vt.prepare(`CREATE TABLE IF NOT EXISTS site_icerik (
    id INTEGER PRIMARY KEY AUTOINCREMENT, dis_kimlik TEXT NOT NULL UNIQUE,
    tur TEXT NOT NULL, slug TEXT NOT NULL, baslik TEXT NOT NULL, spot TEXT NOT NULL DEFAULT '',
    govde TEXT NOT NULL, kategori TEXT NOT NULL DEFAULT '', kaynak_adlari TEXT NOT NULL DEFAULT '[]',
    kaynak_url_listesi TEXT NOT NULL DEFAULT '[]', kapak_url TEXT NOT NULL DEFAULT '',
    sosyal_url_listesi TEXT NOT NULL DEFAULT '[]', orijinal_yayin TEXT, site_yayini TEXT,
    guncelleme TEXT NOT NULL, durum TEXT NOT NULL DEFAULT 'taslak',
    hukuki_inceleme TEXT NOT NULL DEFAULT 'uygulanmaz', kaynak_sistem TEXT NOT NULL DEFAULT 'postedm'
  )`).run();
  await vt.prepare('CREATE UNIQUE INDEX IF NOT EXISTS site_icerik_tur_slug ON site_icerik (tur, slug)').run();
  await vt.prepare('CREATE INDEX IF NOT EXISTS site_icerik_durum_tarih ON site_icerik (durum, site_yayini DESC, guncelleme DESC)').run();
}

export async function siteIcerikTaslaginiKaydet(vt: D1Database, taslak: SiteIcerikTaslagi): Promise<number> {
  await siteIcerikSemasiniKur(vt);
  await vt.prepare(`INSERT INTO site_icerik (
      dis_kimlik, tur, slug, baslik, spot, govde, kategori, kaynak_adlari,
      kaynak_url_listesi, kapak_url, sosyal_url_listesi, orijinal_yayin,
      guncelleme, durum, hukuki_inceleme, kaynak_sistem
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'taslak', ?, 'postedm')
    ON CONFLICT(dis_kimlik) DO UPDATE SET
      tur = excluded.tur, slug = excluded.slug, baslik = excluded.baslik,
      spot = excluded.spot, govde = excluded.govde, kategori = excluded.kategori,
      kaynak_adlari = excluded.kaynak_adlari,
      kaynak_url_listesi = excluded.kaynak_url_listesi,
      kapak_url = excluded.kapak_url, sosyal_url_listesi = excluded.sosyal_url_listesi,
      orijinal_yayin = excluded.orijinal_yayin, guncelleme = excluded.guncelleme,
      durum = 'taslak', hukuki_inceleme = excluded.hukuki_inceleme,
      site_yayini = NULL, kaynak_sistem = 'postedm'`)
    .bind(
      taslak.disKimlik, taslak.tur, taslak.slug, taslak.baslik, taslak.spot,
      taslak.govde, taslak.kategori, JSON.stringify(taslak.kaynakAdlari),
      JSON.stringify(taslak.kaynakUrlleri), taslak.kapakUrl,
      JSON.stringify(taslak.sosyalUrlleri), taslak.orijinalYayin,
      taslak.guncelleme, taslak.hukukiInceleme
    ).run();
  const kayit = await vt.prepare('SELECT id FROM site_icerik WHERE dis_kimlik = ?').bind(taslak.disKimlik).first<{ id: number }>();
  if (!kayit) throw new Error('İçerik taslağı kaydedilemedi.');
  return kayit.id;
}

export async function siteIcerikleriniGetir(
  vt: D1Database,
  secenekler: { tur?: SiteIcerikTuru; durum?: SiteIcerikDurumu; limit?: number } = {}
): Promise<SiteIcerikKaydi[]> {
  await siteIcerikSemasiniKur(vt);
  const kosullar: string[] = [];
  const degerler: unknown[] = [];
  if (secenekler.tur) {
    kosullar.push('tur = ?');
    degerler.push(secenekler.tur);
  }
  if (secenekler.durum) {
    kosullar.push('durum = ?');
    degerler.push(secenekler.durum);
  }
  const limit = Math.max(1, Math.min(Number(secenekler.limit) || 100, 250));
  const satirlar = await vt.prepare(
    `SELECT * FROM site_icerik${kosullar.length ? ` WHERE ${kosullar.join(' AND ')}` : ''}
     ORDER BY COALESCE(site_yayini, guncelleme) DESC, id DESC LIMIT ?`
  ).bind(...degerler, limit).all<Record<string, unknown>>();
  return (satirlar.results ?? []).map(kaydiDonustur);
}

export async function siteIcerigiGetir(vt: D1Database, id: number): Promise<SiteIcerikKaydi | null> {
  await siteIcerikSemasiniKur(vt);
  const satir = await vt.prepare('SELECT * FROM site_icerik WHERE id = ?').bind(id).first<Record<string, unknown>>();
  return satir ? kaydiDonustur(satir) : null;
}

/** Veritabanından bağımsız yayın kapısı; testlerde de aynı kural kullanılır. */
export function siteIcerikYayinKontrolu(kayit: Pick<SiteIcerikKaydi, 'kaynakUrlleri' | 'hukukiInceleme'>, hukukiIncelemeOnayi = false): void {
  if (!kayit.kaynakUrlleri.length) throw new Error('Kaynak bağlantısı olmayan içerik yayınlanamaz.');
  if (kayit.hukukiInceleme === 'gerekli' && !hukukiIncelemeOnayi) {
    throw new Error('Bu içerik hukuki/ticari inceleme bekliyor; inceleme onayı olmadan yayınlanamaz.');
  }
}

/**
 * İçerik yalnız paneldeki açık yayın kararıyla görünür olur. Hukuk, kredi,
 * tapu vb. konular için ikinci bir insan onayı özellikle zorunludur.
 */
export async function siteIcerigiYayinaAl(
  vt: D1Database,
  id: number,
  hukukiIncelemeOnayi = false,
  simdi = new Date()
): Promise<SiteIcerikKaydi> {
  const kayit = await siteIcerigiGetir(vt, id);
  if (!kayit) throw new Error('İçerik kaydı bulunamadı.');
  siteIcerikYayinKontrolu(kayit, hukukiIncelemeOnayi);
  const hukukiInceleme: HukukiInceleme = kayit.hukukiInceleme === 'gerekli' ? 'tamam' : kayit.hukukiInceleme;
  const siteYayini = simdi.toISOString();
  await vt.prepare(
    `UPDATE site_icerik SET durum = 'yayinda', hukuki_inceleme = ?, site_yayini = ? WHERE id = ?`
  ).bind(hukukiInceleme, siteYayini, id).run();
  return { ...kayit, durum: 'yayinda', hukukiInceleme, siteYayini };
}

export async function siteIcerigiTaslakYap(vt: D1Database, id: number): Promise<SiteIcerikKaydi> {
  const kayit = await siteIcerigiGetir(vt, id);
  if (!kayit) throw new Error('İçerik kaydı bulunamadı.');
  await vt.prepare(`UPDATE site_icerik SET durum = 'taslak', site_yayini = NULL WHERE id = ?`).bind(id).run();
  return { ...kayit, durum: 'taslak', siteYayini: null };
}
