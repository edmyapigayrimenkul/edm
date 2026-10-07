import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';
import {
  talebiKaydet, talepBildiriminiGonder, bekleyenTalepBildirimleriniGonder,
  belirsizBildirimleriAyir, talepBildirimMetni,
  talepBildiriminiYenidenDene,
} from '../src/lib/talep-bildirim.ts';

const kayit = {
  tur: 'iletisim' as const, ad: 'Test Kişisi', telefon: '+905550000000',
  eposta: null, konu: 'Diğer', mulk_tipi: null, ilce: null, mahalle: null,
  m2: null, mesaj: 'Test mesajı', kaynak: '/iletisim', ilan_id: null, ilan_baslik: null,
};
const ortam = { EPOSTA: { send: async () => {} } };

test('gerçek D1: talep kuyruğu, atomik kayıt, tekrar deneme ve eşzamanlı gönderim', async (t) => {
  const mf = new Miniflare(convertV4MiniflareOptions({
    compatibilityDate: '2026-09-01', d1Databases: ['VT'], modules: true,
    script: 'export default { fetch() { return new Response("ok"); } };',
  }));
  try {
    const db = await mf.getD1Database('VT');
    const temel = await readFile(new URL('../migrations/0007-legacy-schema-baseline.sql', import.meta.url), 'utf8');
    const talepDDL = temel.match(/CREATE TABLE IF NOT EXISTS talepler \([\s\S]*?\n\);/)![0];
    await db.prepare(talepDDL).run();
    const migration = await readFile(new URL('../migrations/0008-talep-bildirim.sql', import.meta.url), 'utf8');
    for (const sql of migration.split(';').map((s) => s.trim()).filter(Boolean)) await db.prepare(sql).run();

    await t.test('eski talepler gönderilmez; kabul gelen kutusu teslimi sayılmaz', async () => {
      await db.prepare("INSERT INTO talepler (tur,ad,telefon) VALUES ('iletisim','Eski','123')").run();
      let adet = 0;
      await bekleyenTalepBildirimleriniGonder(db, ortam, async () => { adet++; return true; });
      assert.equal(adet, 0);
      assert.match(talepBildirimMetni(null, null), /bilinmiyor/);
      assert.match(talepBildirimMetni('gonderildi', 1), /kabul/);
    });
    await t.test('kuyruk hatası talep kaydını da geri alır', async () => {
      const once = await db.prepare('SELECT COUNT(*) AS adet FROM talepler').first<{adet:number}>();
      await db.prepare("CREATE TRIGGER kuyruk_engeli BEFORE INSERT ON talep_bildirim BEGIN SELECT RAISE(ABORT,'test'); END").run();
      await assert.rejects(talebiKaydet(db, kayit, 'TR'));
      await db.prepare('DROP TRIGGER kuyruk_engeli').run();
      assert.deepEqual(await db.prepare('SELECT COUNT(*) AS adet FROM talepler').first(), once);
    });
    await t.test('birbirinden bağımsız talepler doğru kuyruk satırına bağlanır', async () => {
      const ids = await Promise.all(Array.from({length:4}, () => talebiKaydet(db, kayit, 'TR')));
      assert.equal(new Set(ids).size, 4);
      for (const id of ids) assert.ok(await db.prepare('SELECT talep_id FROM talep_bildirim WHERE talep_id=?').bind(id).first());
      // Bu testte eklenenleri sonraki kuyruk taramasından ayır.
      await db.prepare("UPDATE talep_bildirim SET durum='gonderildi'").run();
    });
    await t.test('hata talebi korur ve zamanından önce tekrar gönderilmez', async () => {
      const id = await talebiKaydet(db, kayit, 'TR');
      assert.equal(await talepBildiriminiGonder(db, ortam, id, async () => false), 'basarisiz');
      assert.ok(await db.prepare('SELECT id FROM talepler WHERE id=?').bind(id).first());
      let adet = 0;
      await bekleyenTalepBildirimleriniGonder(db, ortam, async () => { adet++; return true; });
      assert.equal(adet, 0);
      await db.prepare("UPDATE talep_bildirim SET sonraki=datetime('now','-1 minute') WHERE talep_id=?").bind(id).run();
      await bekleyenTalepBildirimleriniGonder(db, ortam, async (_env, konu, govde) => {
        adet++; assert.match(konu, /İletişim/); assert.match(govde, new RegExp(`Talep No: ${id}`)); return true;
      });
      assert.equal(adet, 1);
      assert.deepEqual(await db.prepare('SELECT durum,deneme,hata FROM talep_bildirim WHERE talep_id=?').bind(id).first(),
        {durum:'gonderildi',deneme:2,hata:null});
    });
    await t.test('eşzamanlı iki iş yalnız bir e-posta gönderir, kabul edilen tekrar gönderilmez', async () => {
      const id = await talebiKaydet(db, kayit, 'TR');
      let adet = 0;
      const gonder = async () => { adet++; return true; };
      const sonuclar = await Promise.all([
        talepBildiriminiGonder(db, ortam, id, gonder), talepBildiriminiGonder(db, ortam, id, gonder),
      ]);
      assert.equal(adet, 1);
      assert.deepEqual(sonuclar.sort(), ['atlanmis','gonderildi']);
      assert.equal(await talepBildiriminiGonder(db, ortam, id, gonder), 'atlanmis');
      assert.equal(adet, 1);
    });
    await t.test('beş kesin hata sonrası otomatik gönderim durur', async () => {
      const id = await talebiKaydet(db, kayit, null);
      let adet = 0;
      for (let i=0; i<6; i++) {
        await db.prepare("UPDATE talep_bildirim SET sonraki=datetime('now','-1 minute') WHERE talep_id=?").bind(id).run();
        await talepBildiriminiGonder(db, ortam, id, async () => { adet++; return false; });
      }
      assert.equal(adet, 5);
      const b = await db.prepare('SELECT deneme,hata FROM talep_bildirim WHERE talep_id=?').bind(id).first<{deneme:number;hata:string}>();
      assert.deepEqual(b, {deneme:5,hata:'GONDERIM_HATASI'});
      assert.match(talepBildirimMetni('basarisiz',5), /bitti/);
    });
    await t.test('sağlayıcı isteği hata ile kesilirse belirsiz sonuç otomatik tekrarlanmaz', async () => {
      const id = await talebiKaydet(db, kayit, null);
      assert.equal(await talepBildiriminiGonder(db, ortam, id, async () => { throw new Error('kişisel veri secret'); }), 'belirsiz');
      assert.deepEqual(await db.prepare('SELECT durum,hata FROM talep_bildirim WHERE talep_id=?').bind(id).first(),
        {durum:'belirsiz',hata:'SONUC_BELIRSIZ'});
      assert.equal(await talepBildiriminiGonder(db, ortam, id, async () => true), 'atlanmis');
    });
    await t.test('yarıda kalan gönderim otomatik yeniden gönderilmez', async () => {
      const id = await talebiKaydet(db, kayit, null);
      await db.prepare("UPDATE talep_bildirim SET durum='gonderiliyor', kilit='test', kilit_bitis=datetime('now','-1 minute') WHERE talep_id=?").bind(id).run();
      await belirsizBildirimleriAyir(db);
      assert.equal(await talepBildiriminiGonder(db, ortam, id, async () => { throw new Error('çağrılmamalı'); }), 'atlanmis');
      assert.deepEqual(await db.prepare('SELECT durum,hata FROM talep_bildirim WHERE talep_id=?').bind(id).first(),
        {durum:'belirsiz',hata:'SONUC_BELIRSIZ'});
    });
    await t.test('yönetici başarısız kaydı tekrar deneyebilir; kabul edilmiş kaydı tekrar gönderemez', async () => {
      const id = await talebiKaydet(db, kayit, null);
      await db.prepare("UPDATE talep_bildirim SET durum='basarisiz',deneme=5 WHERE talep_id=?").bind(id).run();
      let adet = 0;
      const gonder = async () => { adet++; return true; };
      assert.equal(await talepBildiriminiYenidenDene(db, ortam, id, gonder), 'gonderildi');
      assert.equal(await talepBildiriminiYenidenDene(db, ortam, id, gonder), 'atlanmis');
      assert.equal(adet, 1);
      assert.equal(await talepBildiriminiYenidenDene(db, ortam, 999999, gonder), 'atlanmis');
    });
  } finally { await mf.dispose(); }
});
