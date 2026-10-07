import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';
import { talepTakibiniKaydet, takipTarihiniCoz, takipFormTarihi, takipSayimlariniAl } from '../src/lib/talep-takip.ts';
import { ISLEM_GECMISI_SEMA } from '../src/lib/panel/islem-gecmisi.ts';

test('Türkiye saati UTC dönüşümü ve geçersiz takvim reddi', () => {
  assert.equal(takipTarihiniCoz('2028-02-29T01:30'), '2028-02-28T22:30:00.000Z');
  assert.equal(takipFormTarihi('2028-02-28T22:30:00.000Z'), '2028-02-29T01:30');
  for (const ham of ['2027-02-29T12:00','2028-13-01T10:00','2028-01-01T24:00','2028-01-01','garbage']) {
    assert.throws(() => takipTarihiniCoz(ham));
  }
});

test('gerçek D1: talep takip planı, sonuç ve atomik düzenleme', async (t) => {
  const mf = new Miniflare(convertV4MiniflareOptions({
    compatibilityDate:'2026-09-01',d1Databases:['VT'],modules:true,
    script:'export default { fetch() { return new Response("ok"); } };',
  }));
  try {
    const db = await mf.getD1Database('VT');
    const temel = await readFile(new URL('../migrations/0007-legacy-schema-baseline.sql',import.meta.url),'utf8');
    for (const tablo of ['ekip','talepler']) {
      await db.prepare(temel.match(new RegExp(`CREATE TABLE IF NOT EXISTS ${tablo} \\([\\s\\S]*?\\n\\);`))![0]).run();
    }
    const ddl = await readFile(new URL('../migrations/0010-talep-takip.sql',import.meta.url),'utf8');
    for (const sql of (ddl + ISLEM_GECMISI_SEMA).split(';').map(s=>s.trim()).filter(Boolean)) await db.prepare(sql).run();
    await db.prepare("INSERT INTO ekip (slug,ad,unvan,yayinda) VALUES ('danisman','Test Danışman','Danışman',0)").run();
    await db.prepare("INSERT INTO talepler (id,tur,ad,telefon,ic_not,ilgilenen) VALUES (1,'iletisim','Test','test-private-phone','korunan not','old-actor')").run();
    const simdi = new Date('2026-10-02T10:00:00Z');
    const form = (ek: Record<string,string>={}) => {
      const f=new FormData();
      for (const [k,v] of Object.entries({id:'1',eylem:'takip',takip_surumu:'0',durum:'islemde',sorumlu_slug:'danisman',takip_tarihi:'2026-10-03T15:00',sonuc:'',...ek})) f.set(k,v);
      return f;
    };
    const satir = () => db.prepare('SELECT * FROM talepler WHERE id=1').first<any>();
    const audit = () => db.prepare('SELECT * FROM panel_islem_gecmisi ORDER BY id').all();

    await t.test('eski not ve son düzenleyen otomatik sorumluya dönüşmez', async () => {
      const r=await satir(); assert.equal(r.sorumlu_slug,null);assert.equal(r.takip_tarihi,null);
      assert.equal(r.ic_not,'korunan not'); assert.equal(r.ilgilenen,'old-actor');
      assert.equal((await takipSayimlariniAl(db))!.sahipsiz,1);
    });
    await t.test('eksik sorumlu, takip, sonuç ve sahte durum hiçbir yazma yapmaz', async () => {
      for (const ek of [
        {sorumlu_slug:''},{sorumlu_slug:'bilinmeyen'}, {takip_tarihi:''},
        {takip_tarihi:'2026-10-01T10:00'}, {durum:'fake'}, {durum:'kapandi',sonuc:''},
        {durum:'kapandi',sonuc:'fake'},{takip_surumu:''},{id:'1.5'},
      ]) await assert.rejects(talepTakibiniKaydet(db,'ozdogandogukan@gmail.com',form(ek),simdi));
      assert.equal((await satir()).takip_surumu,0); assert.equal((await audit()).results.length,0);
    });
    await t.test('gizli ekip üyesi iç sorumlu olabilir; plan gerçek UTC saklanır', async () => {
      await talepTakibiniKaydet(db,'ozdogandogukan@gmail.com',form(),simdi);
      const r=await satir();assert.equal(r.durum,'islemde');assert.equal(r.sorumlu_slug,'danisman');
      assert.equal(r.takip_tarihi,'2026-10-03T12:00:00.000Z'); assert.equal(r.takip_surumu,1);
      const gecmis=await audit(); assert.equal(gecmis.results.length,1);
      assert.doesNotMatch(JSON.stringify(gecmis.results),/test-private-phone|korunan not/);
    });
    await t.test('eski sürüm yeni planı ve notu ezemez', async () => {
      await assert.rejects(talepTakibiniKaydet(db,'edmyapigayrimenkul@gmail.com',form(),simdi),/başka bir işlem/);
      await assert.rejects(talepTakibiniKaydet(db,'edmyapigayrimenkul@gmail.com',form({eylem:'not',ic_not:'eski değişiklik'}),simdi));
      assert.equal((await satir()).ic_not,'korunan not'); assert.equal((await audit()).results.length,1);
    });
    await t.test('eşzamanlı iki değişiklikten biri kazanır ve tek audit oluşur', async () => {
      const once=(await audit()).results.length;
      const sonuc=await Promise.allSettled([
        talepTakibiniKaydet(db,'ozdogandogukan@gmail.com',form({takip_surumu:'1',eylem:'not',ic_not:'Not A'}),simdi),
        talepTakibiniKaydet(db,'edmyapigayrimenkul@gmail.com',form({takip_surumu:'1',eylem:'not',ic_not:'Not B'}),simdi),
      ]);
      assert.equal(sonuc.filter(s=>s.status==='fulfilled').length,1);
      assert.equal((await satir()).takip_surumu,2); assert.equal((await audit()).results.length,once+1);
    });
    await t.test('audit hatası talep güncellemesini geri alır', async () => {
      await db.prepare('DROP TABLE panel_islem_gecmisi').run();
      await assert.rejects(talepTakibiniKaydet(db,'ozdogandogukan@gmail.com',form({takip_surumu:'2',durum:'kapandi',sonuc:'tamamlandi'}),simdi));
      assert.equal((await satir()).takip_surumu,2);assert.equal((await satir()).durum,'islemde');
      for (const sql of ISLEM_GECMISI_SEMA.split(';').map(s=>s.trim()).filter(Boolean)) await db.prepare(sql).run();
    });
    await t.test('kapanış planı kaldırır, yeniden açma sonucu ve kapanışı temizler',async()=>{
      await talepTakibiniKaydet(db,'ozdogandogukan@gmail.com',form({takip_surumu:'2',durum:'kapandi',sonuc:'tamamlandi'}),simdi);
      let r=await satir();assert.equal(r.sonuc,'tamamlandi');assert.equal(r.takip_tarihi,null);assert.ok(r.kapanma);
      assert.equal((await takipSayimlariniAl(db))!.acik,0);
      await talepTakibiniKaydet(db,'ozdogandogukan@gmail.com',form({takip_surumu:'3',durum:'islemde',sonuc:'tamamlandi'}),simdi);
      r=await satir();assert.equal(r.sonuc,null);assert.equal(r.kapanma,null);
    });
    await t.test('silinen danışman sahipsiz olur; geciken/kapalı talep sayımı doğru',async()=>{
      await db.prepare("UPDATE talepler SET takip_tarihi=datetime('now','-1 minute') WHERE id=1").run();
      await db.prepare("INSERT INTO talepler (tur,ad,telefon,durum,olusturma) VALUES ('iletisim','Test','test','kapandi',datetime('now','-2 days'))").run();
      await db.prepare("DELETE FROM ekip WHERE slug='danisman'").run();
      const r=await satir();assert.equal(r.sorumlu_slug,null);assert.ok(r.ic_not);
      const say=await takipSayimlariniAl(db);assert.equal(say!.acik,1);assert.equal(say!.geciken,1);
      assert.equal(say!.sahipsiz,1); assert.equal(say!.uyari,1);
    });
  } finally { await mf.dispose(); }
});
