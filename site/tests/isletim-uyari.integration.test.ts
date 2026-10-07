import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';
import {
  uyariDurumunuKaydet, senkronUyarilariniKaydet, talepUyarilariniKaydet,
  bekleyenUyarilariGonder, uyariyiGonder, uyariyiYenidenDene, belirsizUyarilariAyir,
} from '../src/lib/isletim-uyari.ts';

const ortam = { EPOSTA: { send: async () => {} } };
const saglikli = {
  bulunan:20,eklenen:0,guncellenen:0,pasiflenen:0,yenidenAktif:0,basarisiz:0,
  pasifIdler:[],yeniIdler:[],sureMs:1,pasiflemeErtelendi:false,oncekiAktif:20,eksikAdet:0,supheliDusus:false,
};
test('gerçek D1: işletim uyarısı yaşam döngüsü ve mükerrer gönderim koruması', async (t) => {
  const mf = new Miniflare(convertV4MiniflareOptions({
    compatibilityDate:'2026-09-01',d1Databases:['VT'],modules:true,
    script:'export default { fetch() { return new Response("ok"); } };',
  }));
  try {
    const db = await mf.getD1Database('VT');
    const temel = await readFile(new URL('../migrations/0007-legacy-schema-baseline.sql',import.meta.url),'utf8');
    await db.prepare(temel.match(/CREATE TABLE IF NOT EXISTS talepler \([\s\S]*?\n\);/)![0]).run();
    await db.prepare(temel.match(/CREATE TABLE IF NOT EXISTS ekip \([\s\S]*?\n\);/)![0]).run();
    await db.prepare("INSERT INTO ekip (slug,ad,unvan) VALUES ('test','Test Danışman','Test')").run();
    for (const file of ['0008-talep-bildirim.sql','0009-isletim-uyari.sql','0010-talep-takip.sql']) {
      const ddl = await readFile(new URL(`../migrations/${file}`,import.meta.url),'utf8');
      for (const sql of ddl.split(';').map(s=>s.trim()).filter(Boolean)) await db.prepare(sql).run();
    }
    const satir = () => db.prepare("SELECT * FROM isletim_uyari WHERE anahtar='senkron-hata'").first<any>();
    await t.test('değişmeyen hata yalnız bir kez gönderilir; düzelip yeniden oluşunca tekrar bildirilir', async () => {
      let adet=0;
      const gonder=async()=>{adet++;return true;};
      await senkronUyarilariniKaydet(db,null);
      await bekleyenUyarilariGonder(db,ortam,gonder);
      const olay=(await satir())!.olay;
      await senkronUyarilariniKaydet(db,null);
      await bekleyenUyarilariGonder(db,ortam,gonder);
      assert.equal(adet,1); assert.equal((await satir())!.olay,olay);
      await senkronUyarilariniKaydet(db,saglikli);
      await bekleyenUyarilariGonder(db,ortam,gonder);
      assert.equal(adet,1);assert.equal((await satir())!.aktif,0);
      await senkronUyarilariniKaydet(db,null);
      assert.notEqual((await satir())!.olay,olay);
      await bekleyenUyarilariGonder(db,ortam,gonder);
      assert.equal(adet,2);
    });
    await t.test('eşzamanlı iki gönderim tek sağlayıcı çağrısı yapar',async()=>{
      await db.prepare('DELETE FROM isletim_uyari').run();
      await senkronUyarilariniKaydet(db,null);
      const olay=(await satir())!.olay;
      let adet=0;const gonder=async()=>{adet++;return true;};
      assert.deepEqual((await Promise.all([
        uyariyiGonder(db,ortam,'senkron-hata',olay,gonder),uyariyiGonder(db,ortam,'senkron-hata',olay,gonder),
      ])).sort(),['atlanmis','gonderildi']);assert.equal(adet,1);
    });
    await t.test('daha eski gözlem güncel sağlıklı sonucu geri çeviremez',async()=>{
      await db.prepare('DELETE FROM isletim_uyari').run();
      await senkronUyarilariniKaydet(db,null,'2026-01-01T01:00:00.000Z');
      await senkronUyarilariniKaydet(db,saglikli,'2026-01-01T03:00:00.000Z');
      await senkronUyarilariniKaydet(db,null,'2026-01-01T02:00:00.000Z');
      assert.equal((await satir())!.aktif,0);
    });
    await t.test('ani düşüş ve eksik ayrıntı ayrı izlenir; başarısız çekim bunları kapatmaz',async()=>{
      await db.prepare('DELETE FROM isletim_uyari').run();
      await senkronUyarilariniKaydet(db,{...saglikli,bulunan:10,eksikAdet:10,supheliDusus:true,pasiflemeErtelendi:true,basarisiz:2});
      await senkronUyarilariniKaydet(db,null);
      const aktif=await db.prepare('SELECT anahtar FROM isletim_uyari WHERE aktif=1 ORDER BY anahtar').all();
      assert.deepEqual(aktif.results.map((r)=>r.anahtar),['senkron-dusus','senkron-eksik','senkron-hata']);
      await senkronUyarilariniKaydet(db,saglikli);
      assert.equal((await db.prepare('SELECT COUNT(*) AS adet FROM isletim_uyari WHERE aktif=1').first<any>())!.adet,0);
    });
    await t.test('talep eşiği 24 saat; planlı işlemdekiler ve yeni gelenler sayılmaz, kişisel veri kaydedilmez',async()=>{
      await db.prepare('DELETE FROM isletim_uyari').run();
      await db.prepare(`INSERT INTO talepler (tur,ad,telefon,olusturma,durum) VALUES
        ('iletisim','Kişisel Test','secret-phone',datetime('now','-25 hours'),'yeni'),
        ('iletisim','Kişisel Test','secret-phone',datetime('now','-23 hours'),'yeni'),
        ('iletisim','Kişisel Test','secret-phone',datetime('now','-48 hours'),'islemde')`).run();
      await db.prepare("UPDATE talepler SET sorumlu_slug='test',takip_tarihi=datetime('now','+1 day') WHERE durum='islemde'").run();
      await talepUyarilariniKaydet(db);
      const u=await db.prepare("SELECT aktif,metin,olay FROM isletim_uyari WHERE anahtar='talep-gecikti'").first<any>();
      assert.equal(u.aktif,1);assert.match(u.metin,/1 yeni talep/);assert.doesNotMatch(u.metin,/Kişisel|secret/);
      await db.prepare("UPDATE talepler SET durum='islemde',sorumlu_slug='test',takip_tarihi=datetime('now','+1 day')").run();
      await talepUyarilariniKaydet(db);
      assert.equal((await db.prepare("SELECT aktif FROM isletim_uyari WHERE anahtar='talep-gecikti'").first<any>())!.aktif,0);
      await db.prepare("INSERT INTO talep_bildirim (talep_id,durum) SELECT id,'basarisiz' FROM talepler LIMIT 1").run();
      await talepUyarilariniKaydet(db);
      assert.equal((await db.prepare("SELECT aktif FROM isletim_uyari WHERE anahtar='talep-bildirim'").first<any>())!.aktif,1);
      await db.prepare("UPDATE talep_bildirim SET durum='gonderildi'").run();
      await talepUyarilariniKaydet(db);
      assert.equal((await db.prepare("SELECT aktif FROM isletim_uyari WHERE anahtar='talep-bildirim'").first<any>())!.aktif,0);
    });
    await t.test('işlemdeki geciken veya eski plansız talep uyarı verir; yeni plansız talep 24 saati bekler',async()=>{
      await db.prepare('DELETE FROM isletim_uyari').run();
      await db.prepare("UPDATE talepler SET durum='kapandi'").run();
      await db.prepare(`INSERT INTO talepler (tur,ad,telefon,durum,olusturma,sorumlu_slug,takip_tarihi) VALUES
        ('iletisim','Özel Test','gizli','islemde',datetime('now'),'test',datetime('now','-1 minute')),
        ('iletisim','Özel Test','gizli','islemde',datetime('now','-25 hours'),NULL,NULL),
        ('iletisim','Özel Test','gizli','yeni',datetime('now'),NULL,NULL)`).run();
      await talepUyarilariniKaydet(db);
      const u=await db.prepare("SELECT aktif,metin,olay FROM isletim_uyari WHERE anahtar='talep-gecikti'").first<any>();
      assert.equal(u.aktif,1);assert.match(u.metin,/2 açık talep/);assert.match(u.metin,/1 talebin takip tarihi geçti/);
      assert.doesNotMatch(u.metin,/Özel|gizli/);
      await db.prepare("UPDATE talepler SET sorumlu_slug='test',takip_tarihi=datetime('now','+1 day'),durum='islemde' WHERE durum<>'kapandi'").run();
      await talepUyarilariniKaydet(db);
      assert.equal((await db.prepare("SELECT aktif FROM isletim_uyari WHERE anahtar='talep-gecikti'").first<any>())!.aktif,0);
    });
    await t.test('kesin gönderim hatası gecikmeli ve en fazla beş kez denenir',async()=>{
      await db.prepare('DELETE FROM isletim_uyari').run();await senkronUyarilariniKaydet(db,null);
      let adet=0;const gonder=async()=>{adet++;return false;};
      await bekleyenUyarilariGonder(db,ortam,gonder);
      await bekleyenUyarilariGonder(db,ortam,gonder);assert.equal(adet,1);
      for(let i=0;i<6;i++) {
        await db.prepare("UPDATE isletim_uyari SET sonraki=datetime('now','-1 minute')").run();
        await bekleyenUyarilariGonder(db,ortam,gonder);
      }
      assert.equal(adet,5);assert.equal((await satir())!.durum,'basarisiz');
      assert.equal(await uyariyiYenidenDene(db,ortam,'senkron-hata',(await satir())!.olay,async()=>true),'gonderildi');
      assert.equal(await uyariyiYenidenDene(db,ortam,'senkron-hata',(await satir())!.olay,async()=>true),'atlanmis');
    });
    await t.test('belirsiz sonuç otomatik tekrarlanmaz; hata ayrıntıları kaydedilmez',async()=>{
      await db.prepare('DELETE FROM isletim_uyari').run();await senkronUyarilariniKaydet(db,null);
      let adet=0;
      await bekleyenUyarilariGonder(db,ortam,async()=>{adet++;throw new Error('secret person');});
      await bekleyenUyarilariGonder(db,ortam,async()=>{adet++;return true;});
      assert.equal(adet,1);assert.equal((await satir())!.hata,'SONUC_BELIRSIZ');
      await db.prepare("UPDATE isletim_uyari SET durum='gonderiliyor',kilit='test',kilit_bitis=datetime('now','-1 minute')").run();
      await belirsizUyarilariAyir(db);assert.equal((await satir())!.durum,'belirsiz');
    });
    await t.test('düzelmiş veya eski olay kimliğiyle uyarı gönderilemez',async()=>{
      await db.prepare('DELETE FROM isletim_uyari').run();await senkronUyarilariniKaydet(db,null);
      const eski=(await satir())!.olay;
      await senkronUyarilariniKaydet(db,saglikli);
      assert.equal(await uyariyiGonder(db,ortam,'senkron-hata',eski,async()=>{throw new Error('çağrılmamalı');}),'atlanmis');
      await senkronUyarilariniKaydet(db,null);
      assert.equal(await uyariyiGonder(db,ortam,'senkron-hata',eski,async()=>{throw new Error('çağrılmamalı');}),'atlanmis');
      assert.equal((await satir())!.deneme,0);
    });
    await t.test('eski gönderimin geç bitmesi yeni olayı kabul edilmiş göstermez',async()=>{
      await db.prepare('DELETE FROM isletim_uyari').run();await senkronUyarilariniKaydet(db,null);
      const eski=(await satir())!.olay;
      await uyariyiGonder(db,ortam,'senkron-hata',eski,async()=>{
        await senkronUyarilariniKaydet(db,saglikli);
        await senkronUyarilariniKaydet(db,null);
        return true;
      });
      const yeni=await satir();assert.notEqual(yeni.olay,eski);assert.equal(yeni.durum,'bekliyor');assert.equal(yeni.kabul,null);
    });
  } finally { await mf.dispose(); }
});
