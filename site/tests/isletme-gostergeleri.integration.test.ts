import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';
import { gostergeDonemi, isletmeGostergeleriniAl } from '../src/lib/isletme-gostergeleri.ts';

test('Türkiye pazartesi sınırı, yıl geçişi ve UTC haftası ayrı kalır', () => {
  const d = gostergeDonemi(null, new Date('2026-10-04T21:30:00Z'));
  assert.equal(d.hafta, '2026-10-05');
  assert.equal(d.baslangicUTC, '2026-10-04T21:00:00.000Z');
  assert.equal(d.bugunUTC, '2026-10-04');
  assert.equal(d.bitisUTC, '2026-10-04T21:30:00.000Z');
  assert.equal(d.sonraki, null);
  const once = gostergeDonemi('2026-10-04', new Date('2026-10-04T21:30:00Z'));
  assert.equal(once.bitisUTC, '2026-10-04T21:00:00.000Z');
  assert.equal(once.sonraki, '2026-10-05');
  assert.equal(once.utcBitisGun, '2026-10-05');
  assert.equal(gostergeDonemi('2026-01-01', new Date('2026-10-02T12:00:00Z')).hafta, '2025-12-29');
});

test('geçersiz takvim ve gelecek tarih reddedilir, artık gün kabul edilir', () => {
  const simdi = new Date('2028-03-01T10:00:00Z');
  for (const ham of ['2027-02-29','2028-02-30','2028-13-01','2028-03-02','abc','2028-1-01','1999-12-31']) {
    assert.throws(() => gostergeDonemi(ham, simdi));
  }
  assert.equal(gostergeDonemi('2028-02-29', simdi).hafta, '2028-02-28');
});

test('gerçek D1: dönem, kaynak mahremiyeti ve güncel iş yükü', async (t) => {
  const mf = new Miniflare(convertV4MiniflareOptions({
    compatibilityDate:'2026-09-01',d1Databases:['VT'],modules:true,
    script:'export default { fetch() { return new Response("ok"); } };',
  }));
  try {
    const db = await mf.getD1Database('VT');
    const temel = await readFile(new URL('../migrations/0007-legacy-schema-baseline.sql',import.meta.url),'utf8');
    for (const tablo of ['ekip','talepler','goruntulenme']) {
      await db.prepare(temel.match(new RegExp(`CREATE TABLE IF NOT EXISTS ${tablo} \\([\\s\\S]*?\\n\\);`))![0]).run();
    }
    const ddl = await readFile(new URL('../migrations/0010-talep-takip.sql',import.meta.url),'utf8');
    for (const sql of ddl.split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(sql).run();
    const simdi = new Date('2026-10-02T12:00:00Z');
    const donem = gostergeDonemi(null,simdi);
    await t.test('boş veritabanı gerçek sıfır verir; gelecek günler sıfır sayılmaz',async()=>{
      const r = await isletmeGostergeleriniAl(db,donem);
      assert.equal(r.toplamTalep,0);assert.equal(r.takip.acik,0);
      assert.equal(r.gunler[4].talep,0);assert.equal(r.gunler[5].talep,null);
      assert.equal(r.gunler[5].goruntulenme,null);
    });
    await db.prepare("INSERT INTO ekip (slug,ad,unvan,yayinda) VALUES ('gizli','Test Danışman','Danışman',0)").run();
    const kayit = async (id:number,zaman:string,durum:string,kaynak:string,sorumlu:string|null=null,takip:string|null=null,sonuc:string|null=null) => {
      await db.prepare(`INSERT INTO talepler (id,tur,ad,telefon,eposta,mesaj,olusturma,durum,kaynak,sorumlu_slug,takip_tarihi,sonuc)
        VALUES (?,'iletisim','private-person','private-phone','private-email','private-message',?,?,?,?,?,?)`)
        .bind(id,zaman,durum,kaynak,sorumlu,takip,sonuc).run();
    };
    await kayit(1,'2026-09-27 20:59:59','yeni','/iletisim');
    await kayit(2,'2026-09-27T21:00:00Z','yeni','/iletisim');
    await kayit(3,'2026-09-28 12:00:00','islemde','/ilan/test?eposta=private-email','gizli','2026-10-02T11:00:00Z');
    await kayit(4,'2026-09-29 12:00:00','kapandi','/degerleme','gizli',null,'tamamlandi');
    await kayit(5,'2026-10-02T11:00:00Z','islemde','/custom?eposta=private-email','gizli','2026-10-03T11:00:00Z');
    await kayit(6,'2026-10-04T21:00:00Z','kapandi','/iletisim','gizli',null,'uygun_degil');
    await db.prepare("INSERT INTO goruntulenme (ilan_id,gun,adet) VALUES ('test','2026-09-27',10),('test','2026-09-28',4),('test','2026-10-02',6),('test','2026-10-04',9)").run();

    await t.test('TR haftası yarı açık sınırları ve SQL/ISO tarihleri eşit işler',async()=>{
      const r = await isletmeGostergeleriniAl(db,donem);
      assert.equal(r.toplamTalep,4);
      assert.deepEqual(r.gunler.map(g=>g.talep),[2,1,0,0,1,null,null]);
      const tamam = await isletmeGostergeleriniAl(db,gostergeDonemi('2026-09-28',new Date('2026-10-05T12:00:00Z')));
      assert.equal(tamam.toplamTalep,4); // Bir sonraki TR pazartesi kaydı dahil değil.
      assert.equal(tamam.goruntulenme,19); // Pazar UTC sayacı bu ayrı haftaya dahil.
    });
    await t.test('kaynaklar gruplanır, müşteri bilgileri ve kapanıştan satış üretilmez',async()=>{
      const r = await isletmeGostergeleriniAl(db,donem);
      assert.equal(r.durumlar.find(s=>s.durum==='kapandi')?.adet,1);
      assert.equal(r.kaynaklar.find(s=>s.kaynak==='İlan sayfası')?.adet,1);
      assert.equal(r.kaynaklar.find(s=>s.kaynak==='Diğer / bilinmiyor')?.adet,1);
      assert.doesNotMatch(JSON.stringify(r),/private-|tamamlandi|uygun_degil|\/custom|eposta=/);
      assert.equal(r.goruntulenme,10);assert.equal(r.gunler[0].goruntulenme,4);
    });
    await t.test('eski açık talep dahil, kapalı hariç; gizli danışman ve çakışan uyarılar korunur',async()=>{
      const r=await isletmeGostergeleriniAl(db,donem);
      assert.deepEqual(r.takip,{acik:4,sahipsiz:2,plansiz:2,geciken:1,eski_yeni:2});
      assert.equal(r.sorumlular.find(s=>s.slug==='gizli')?.adet,2);
      assert.equal(r.sorumlular.find(s=>s.slug===null)?.adet,2);
      assert.equal(r.sorumlular.find(s=>s.slug==='gizli')?.geciken,1);
      const eski=await isletmeGostergeleriniAl(db,gostergeDonemi('2026-09-21',simdi));
      assert.deepEqual(eski.takip,r.takip); // İş yükü seçili haftanın filtresi değildir.
    });
    await t.test('Türkiye günü başlamışken UTC gününün başlamadığı saatlerde sayaç boş kalır',async()=>{
      const r=await isletmeGostergeleriniAl(db,gostergeDonemi(null,new Date('2026-10-04T21:30:00Z')));
      assert.equal(r.gunler[0].talep,1);assert.equal(r.gunler[0].goruntulenme,null);
    });
    await t.test('veri kaynağı hatası sahte sıfırlara çevrilmez',async()=>{
      await db.prepare('DROP TABLE goruntulenme').run();
      await assert.rejects(isletmeGostergeleriniAl(db,donem));
    });
  } finally { await mf.dispose(); }
});
