import assert from 'node:assert/strict';
import test from 'node:test';

import { aniDususeKarsiKontrol, dususTeyitKarari } from '../src/lib/senkron/emniyet.ts';
import { ofisIlanLinkleri } from '../src/lib/senkron/emlakjet.ts';
import { portfoyuYaz } from '../src/lib/senkron/depo.ts';

test('olağandışı portföy düşüşünü aynı eksik ilan imzasıyla teyit için işaretler', () => {
  const kontrol = aniDususeKarsiKontrol(20, 14, ['18', '2', '7', '9', '11', '14']);
  assert.equal(kontrol.supheli, true);
  assert.equal(kontrol.imza, '11,14,18,2,7,9');
});

test('normal portföy değişimi ve düşük hacimli portföyler için fren açılmaz', () => {
  assert.equal(aniDususeKarsiKontrol(20, 16, ['1', '2', '3', '4']).supheli, false);
  assert.equal(aniDususeKarsiKontrol(4, 1, ['1', '2', '3']).supheli, false);
  assert.equal(aniDususeKarsiKontrol(20, 10, ['1', '2']).supheli, false);
});

test('ani düşüş ilk tam çekimde bekler, aynı eksik ilanlar ikinci tam çekimde onaylanır', () => {
  assert.equal(dususTeyitKarari('2,4,6', null, 0, false), 'bekle');
  assert.equal(dususTeyitKarari('2,4,6', '2,4,6', 1, false), 'pasiflestir');
  assert.equal(dususTeyitKarari('2,4,7', '2,4,6', 1, false), 'bekle');
  assert.equal(dususTeyitKarari('2,4,6', '2,4,6', 1, true), 'eksik-veri');
  assert.equal(dususTeyitKarari(null, '2,4,6', 1, false), 'normal');
});

test('ilan listelemesi sayfa sınırına gelirse eksik sonuç sayılır', async () => {
  const oncekiFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response('<a href="/ilan/satilik-daire-123456">İlan</a>', { status: 200 })) as typeof fetch;
  try {
    const liste = await ofisIlanLinkleri('https://example.com/ofis', 1);
    assert.equal(liste.linkler.length, 1);
    assert.equal(liste.tamam, false);
    assert.match(liste.sebep ?? '', /sınırına/);
  } finally {
    globalThis.fetch = oncekiFetch;
  }
});

test('ilan listelemesi sayfada aynı ilanları döndürürse eksik sonuç sayılır', async () => {
  const oncekiFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response('<a href="/ilan/satilik-daire-123456">İlan</a>', { status: 200 })) as typeof fetch;
  try {
    const liste = await ofisIlanLinkleri('https://example.com/ofis', 3);
    assert.equal(liste.linkler.length, 1);
    assert.equal(liste.tamam, false);
    assert.match(liste.sebep ?? '', /aynı ilanları/);
  } finally {
    globalThis.fetch = oncekiFetch;
  }
});

test('iki farklı sayfadan sonra Emlakjet ilk sayfayı döndürürse liste sonu kabul edilir', async () => {
  const oncekiFetch = globalThis.fetch;
  globalThis.fetch = (async (girdi) => {
    const sayfa = new URL(String(girdi)).searchParams.get('sayfa');
    const id = sayfa === '2' ? '222222' : '111111';
    return new Response(`<a href="/ilan/satilik-daire-${id}">İlan</a>`, { status: 200 });
  }) as typeof fetch;
  try {
    const liste = await ofisIlanLinkleri('https://example.com/ofis', 4);
    assert.equal(liste.linkler.length, 2);
    assert.equal(liste.tamam, true);
    assert.equal(liste.sebep, null);
  } finally {
    globalThis.fetch = oncekiFetch;
  }
});

test('portföydeki ani düşüş ilk turda ilanları korur, ikinci tam turda pasife alır', async () => {
  const ilanlar = Array.from({ length: 14 }, (_, index) => ({
    id: String(index + 1),
    kaynak: 'emlakjet',
    kaynakUrl: `https://example.com/${index + 1}`,
    baslik: `İlan ${index + 1}`,
    aciklama: '',
    fiyat: 1_000_000,
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
  const satirlar = Array.from({ length: 20 }, (_, index) => ({
    id: String(index + 1),
    durum: 'aktif',
    fiyat: 1_000_000,
    guncellenme: null,
  }));
  let teyit: { eksik_imzasi: string; teyit_sayisi: number } | null = null;
  let pasifGuncellemesi = 0;
  const vt = {
    prepare(sql: string) {
      let values: unknown[] = [];
      return {
        bind(...args: unknown[]) {
          values = args;
          return this;
        },
        async all() {
          return { results: sql.includes('SELECT id, durum, fiyat') ? satirlar : [] };
        },
        async first() {
          return sql.includes('senkron_pasifleme_teyidi') ? teyit : null;
        },
        async run() {
          if (sql.startsWith('INSERT INTO senkron_pasifleme_teyidi')) {
            teyit = { eksik_imzasi: String(values[0]), teyit_sayisi: 1 };
          } else if (sql.startsWith('DELETE FROM senkron_pasifleme_teyidi')) {
            teyit = null;
          } else if (sql.startsWith('UPDATE ilanlar SET durum')) {
            pasifGuncellemesi = values.length - 1;
          }
          return { success: true };
        },
      };
    },
    async batch() {
      return [];
    },
  };

  const ilkTur = await portfoyuYaz(vt as never, ilanlar, []);
  assert.equal(ilkTur.pasiflemeErtelendi, true);
  assert.equal(ilkTur.pasiflenen, 0);
  assert.ok(teyit);

  const ikinciTur = await portfoyuYaz(vt as never, ilanlar, []);
  assert.equal(ikinciTur.pasiflemeErtelendi, false);
  assert.equal(ikinciTur.pasiflenen, 6);
  assert.equal(pasifGuncellemesi, 6);
  assert.equal(teyit, null);
});

test('portal senkronu elle girilen ilanları karşılaştırmaya ve pasifleştirmeye katmaz', async () => {
  const ilanlar = Array.from({ length: 14 }, (_, index) => ({
    id: String(index + 1),
    kaynak: 'emlakjet',
    kaynakUrl: `https://example.com/${index + 1}`,
    baslik: `İlan ${index + 1}`,
    aciklama: '',
    fiyat: 1_000_000,
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
  const portaldakiSatirlar = Array.from({ length: 20 }, (_, index) => ({
    id: String(index + 1),
    kaynak: 'emlakjet',
    durum: 'aktif',
    fiyat: 1_000_000,
    guncellenme: null,
  }));
  const elleGirilenSatirlar = Array.from({ length: 5 }, (_, index) => ({
    id: `elle-${index + 1}`,
    kaynak: 'elle',
    durum: 'aktif',
    fiyat: 12_500_000,
    guncellenme: null,
  }));
  const pasiflenenIdler: string[] = [];
  let teyit: { eksik_imzasi: string; teyit_sayisi: number } | null = null;

  const vt = {
    prepare(sql: string) {
      let values: unknown[] = [];
      return {
        bind(...args: unknown[]) {
          values = args;
          return this;
        },
        async all() {
          assert.match(sql, /WHERE kaynak <> 'elle'/);
          const tumSatirlar = [...portaldakiSatirlar, ...elleGirilenSatirlar];
          return { results: tumSatirlar.filter((satir) => satir.kaynak !== 'elle') };
        },
        async first() {
          return sql.includes('senkron_pasifleme_teyidi') ? teyit : null;
        },
        async run() {
          if (sql.startsWith('INSERT INTO senkron_pasifleme_teyidi')) {
            teyit = { eksik_imzasi: String(values[0]), teyit_sayisi: 1 };
          } else if (sql.startsWith('DELETE FROM senkron_pasifleme_teyidi')) {
            teyit = null;
          } else if (sql.startsWith('UPDATE ilanlar SET durum')) {
            pasiflenenIdler.push(...values.slice(1).map(String));
          }
          return { success: true };
        },
      };
    },
    async batch() {
      return [];
    },
  };

  // Elle girilen ilanlar D1'de duruyor olsa bile portal karşılaştırma sorgusuna girmez.
  const ilkTur = await portfoyuYaz(vt as never, ilanlar, []);
  assert.equal(ilkTur.pasiflemeErtelendi, true);
  assert.equal(ilkTur.pasiflenen, 0);

  const ikinciTur = await portfoyuYaz(vt as never, ilanlar, []);
  assert.equal(ikinciTur.pasiflenen, 6);
  assert.deepEqual(pasiflenenIdler.sort(), ['15', '16', '17', '18', '19', '20']);
  assert.equal(pasiflenenIdler.some((id) => elleGirilenSatirlar.some((satir) => satir.id === id)), false);
});
