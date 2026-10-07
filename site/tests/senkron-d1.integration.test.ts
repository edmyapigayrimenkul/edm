import assert from 'node:assert/strict';
import test from 'node:test';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';

import { portfoyuYaz } from '../src/lib/senkron/depo.ts';

test('gerçek yerel D1 senkronu elle girilen ilanları korur, eksik portal ilanlarını teyitle pasife alır', async () => {
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      compatibilityDate: '2026-09-01',
      d1Databases: ['VT'],
      modules: true,
      script: 'export default { fetch() { return new Response("ok"); } };',
    })
  );

  try {
    const db = await mf.getD1Database('VT');
    await db.prepare(`
      CREATE TABLE ilanlar (
        id TEXT PRIMARY KEY, kaynak TEXT NOT NULL, kaynak_url TEXT NOT NULL,
        baslik TEXT NOT NULL, aciklama TEXT NOT NULL DEFAULT '', fiyat INTEGER,
        para_birimi TEXT NOT NULL DEFAULT 'TRY', islem TEXT NOT NULL,
        kategori TEXT NOT NULL DEFAULT '', tip TEXT NOT NULL DEFAULT '',
        tip_grup TEXT NOT NULL DEFAULT 'diger', oda TEXT, m2 INTEGER,
        il TEXT, ilce TEXT, mahalle TEXT,
        ozellikler TEXT NOT NULL DEFAULT '{}', donanim TEXT NOT NULL DEFAULT '[]',
        gorseller TEXT NOT NULL DEFAULT '[]', danisman_slug TEXT, guncellenme TEXT,
        ilk_gorulme TEXT NOT NULL, son_gorulme TEXT NOT NULL,
        durum TEXT NOT NULL DEFAULT 'aktif', pasif_tarihi TEXT
      )
    `).run();
    await db.prepare(`
      CREATE TABLE senkron_pasifleme_teyidi (
        id INTEGER PRIMARY KEY CHECK (id = 1), eksik_imzasi TEXT NOT NULL,
        teyit_sayisi INTEGER NOT NULL, son_gorulme TEXT NOT NULL
      )
    `).run();

    const tohumlar = [
      ...Array.from({ length: 20 }, (_, index) => ({ id: String(index + 1), kaynak: 'emlakjet' })),
      ...Array.from({ length: 5 }, (_, index) => ({ id: `elle-${index + 1}`, kaynak: 'elle' })),
    ];
    await db.batch(
      tohumlar.map(({ id, kaynak }) =>
        db
          .prepare(`INSERT INTO ilanlar
            (id, kaynak, kaynak_url, baslik, aciklama, fiyat, para_birimi, islem,
             kategori, tip, tip_grup, ozellikler, donanim, gorseller,
             ilk_gorulme, son_gorulme, durum)
            VALUES (?, ?, ?, ?, '', ?, 'TRY', 'satilik', 'Konut', 'Daire', 'konut', '{}', '[]', '[]', '2026-09-01', '2026-09-01', 'aktif')`)
          .bind(id, kaynak, `https://example.com/${id}`, `Başlangıç ${id}`, 12_500_000)
      )
    );

    const gelenIlanlar = Array.from({ length: 14 }, (_, index) => ({
      id: String(index + 1),
      kaynak: 'emlakjet',
      kaynakUrl: `https://example.com/${index + 1}`,
      baslik: `Güncel ilan ${index + 1}`,
      aciklama: '',
      fiyat: 12_500_000,
      paraBirimi: 'TRY',
      islem: 'satilik' as const,
      kategori: 'Konut',
      tip: 'Daire',
      tipGrup: 'konut' as const,
      oda: '2+1',
      m2: 100,
      il: 'İstanbul',
      ilce: 'Silivri',
      mahalle: null,
      ozellikler: {},
      gorseller: [],
      danismanSlug: null,
      guncellenme: null,
      donanim: [],
    }));

    const ilkTur = await portfoyuYaz(db, gelenIlanlar, []);
    assert.equal(ilkTur.pasiflemeErtelendi, true);
    assert.equal(ilkTur.pasiflenen, 0);
    assert.equal(ilkTur.supheliDusus, true);
    assert.equal(ilkTur.oncekiAktif, 20);
    assert.equal(ilkTur.eksikAdet, 6);

    const ikinciTur = await portfoyuYaz(db, gelenIlanlar, []);
    assert.equal(ikinciTur.pasiflemeErtelendi, false);
    assert.equal(ikinciTur.pasiflenen, 6);
    assert.equal(ikinciTur.supheliDusus, true);

    const durumlar = await db
      .prepare('SELECT id, kaynak, durum, baslik, fiyat FROM ilanlar ORDER BY id')
      .all<{ id: string; kaynak: string; durum: string; baslik: string; fiyat: number }>();
    const satirlar = durumlar.results ?? [];
    const elleSatirlari = satirlar.filter((satir) => satir.kaynak === 'elle');
    assert.equal(elleSatirlari.length, 5);
    assert.ok(elleSatirlari.every((satir) => satir.durum === 'aktif'));
    assert.ok(elleSatirlari.every((satir) => satir.baslik.startsWith('Başlangıç elle-')));
    assert.ok(elleSatirlari.every((satir) => satir.fiyat === 12_500_000));

    const pasifPortalIdleri = satirlar
      .filter((satir) => satir.kaynak === 'emlakjet' && satir.durum === 'pasif')
      .map((satir) => satir.id)
      .sort();
    assert.deepEqual(pasifPortalIdleri, ['15', '16', '17', '18', '19', '20']);
    assert.ok(satirlar.filter((satir) => satir.kaynak === 'emlakjet' && satir.durum === 'aktif').length === 14);
  } finally {
    await mf.dispose();
  }
});
