import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {talepIsSonucunuKaydet,isSonucuKaydiEtkin,isSonucuFormTarihi,isSonucuGostergeleriniAl} from '../src/lib/talep-is-sonucu.ts';
import {ISLEM_GECMISI_SEMA} from '../src/lib/panel/islem-gecmisi.ts';

test('iş sonucu kaydı varsayılan kapalı; yerel test uzaktan açılamaz',()=>{
  assert.equal(isSonucuKaydiEtkin({},'https://edmyapigayrimenkul.com'),false);
  assert.equal(isSonucuKaydiEtkin({PANEL_YEREL_TEST_KIMLIGI:'1'},'https://edmyapigayrimenkul.com'),false);
  assert.equal(isSonucuKaydiEtkin({PANEL_YEREL_TEST_KIMLIGI:'1'},'http://localhost:8897'),true);
  assert.equal(isSonucuKaydiEtkin({TALEP_IS_SONUCLARI_ETKIN:'0',PANEL_YEREL_TEST_KIMLIGI:'1'},'http://localhost:8897'),false);
  assert.equal(isSonucuKaydiEtkin({TALEP_IS_SONUCLARI_ETKIN:'true'},'http://localhost:8897'),false);
  assert.equal(isSonucuKaydiEtkin({TALEP_IS_SONUCLARI_ETKIN:'1'},'https://edmyapigayrimenkul.com'),true);
  assert.equal(isSonucuFormTarihi('2026-10-02T10:01:35.000Z'),'2026-10-02T13:01:35');
});

test('gerçek D1: iş sonucu teyidi, mükerrerlik, düzeltme ve kohort raporu',async t=>{
  const mf=new Miniflare(convertV4MiniflareOptions({compatibilityDate:'2026-09-01',d1Databases:['VT'],modules:true,script:'export default {fetch(){return new Response("ok")}}'}));
  try{
    const db=await mf.getD1Database('VT');
    const temel=await readFile(new URL('../migrations/0007-legacy-schema-baseline.sql',import.meta.url),'utf8');
    for(const tablo of ['talepler','ekip'])await db.prepare(temel.match(new RegExp(`CREATE TABLE IF NOT EXISTS ${tablo} \\([\\s\\S]*?\\n\\);`))![0]).run();
    for(const dosya of ['0010-talep-takip.sql','0011-talep-is-sonucu.sql']){
      const ddl=await readFile(new URL('../migrations/'+dosya,import.meta.url),'utf8');
      for(const sql of ddl.split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(sql).run();
    }
    for(const sql of ISLEM_GECMISI_SEMA.split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(sql).run();
    await db.prepare("INSERT INTO ekip (slug,ad,unvan,yayinda) VALUES ('test','Test Danışman','Danışman',0)").run();
    await db.prepare(`INSERT INTO talepler (id,tur,ad,telefon,ic_not,olusturma,durum,sorumlu_slug,takip_tarihi) VALUES
      (1,'iletisim','private-name','private-phone','private-note','2026-10-02 10:00:30','islemde','test','2026-10-03T10:00:00Z'),
      (2,'iletisim','private-name','private-phone','private-note','2026-10-02 10:00:30','yeni',NULL,NULL),
      (3,'iletisim','private-name','private-phone','private-note','2026-09-01 10:00:30','kapandi','test',NULL)`).run();
    const simdi=new Date('2026-10-02T12:00:00Z');
    const form=(ek:Record<string,string>={})=>{
      const f=new FormData();for(const[k,v]of Object.entries({id:'1',takip_surumu:'0',yanit_durumu:'yanitlandi',ilk_yanit:'2026-10-02T13:00:35',nitelik:'nitelikli',randevu_durumu:'planlandi',randevu_tarihi:'2026-10-03T14:00:00',islem_turu:'yok',islem_tarihi:'',gercek_kayit_teyidi:'1',...ek}))f.set(k,v);return f;
    };
    const kaydet=(f:FormData)=>talepIsSonucunuKaydet(db,'ozdogandogukan@gmail.com',f,simdi);
    const satir=()=>db.prepare('SELECT * FROM talep_is_sonucu WHERE talep_id=1').first<any>();
    const talep=()=>db.prepare('SELECT * FROM talepler WHERE id=1').first<any>();
    const audit=()=>db.prepare('SELECT * FROM panel_islem_gecmisi').all();
    const rapor=()=>isSonucuGostergeleriniAl(db,'2026-09-27T21:00:00Z','2026-10-02T12:00:00Z');
    await t.test('migration geçmiş olay üretmez; bilinmeyen yanıtsız sayılmaz',async()=>{
      assert.equal(await satir(),null);const r=await rapor();
      assert.equal(r.kayitli,0);assert.equal(r.yanitsiz,0);assert.equal(r.yaniti_bilinmeyen,2);
      assert.equal(r.nitelik_orani,null);assert.equal(r.ortalama_yanit_dakika,null);
    });
    await t.test('sorumlu, teyit, tarih sırası ve kapalı seçenekler yazmadan doğrulanır',async()=>{
      for(const ek of [
        {id:'2'},{id:'1.5'},{takip_surumu:''},{takip_surumu:'99'},
        {gercek_kayit_teyidi:''},{yanit_durumu:'fake'},
        {ilk_yanit:'2026-10-02T13:00:29'},{ilk_yanit:'2026-10-02T15:01:00'},
        {ilk_yanit:'2026-02-30T13:00:00'},{ilk_yanit:'2026-10-02T13:60'},
        {yanit_durumu:'yanitlanmadi'},{nitelik:'fake'},
        {randevu_durumu:'gerceklesti'},
        {randevu_tarihi:'2026-10-02T13:00:31'},
        {islem_turu:'satis',islem_tarihi:'2026-10-03T12:00:00'},
        {islem_turu:'fake'},{islem_tarihi:'2026-10-02T14:00:00'},
      ])await assert.rejects(kaydet(form(ek)));
      assert.equal(await satir(),null);assert.equal((await talep()).takip_surumu,0);assert.equal((await audit()).results.length,0);
    });
    await t.test('saniyeli ilk yanıt, planlı randevu ve bağımsız takip kaydı',async()=>{
      await kaydet(form());const s=await satir(),r=await talep();
      assert.equal(s.ilk_yanit,'2026-10-02T10:00:35.000Z');assert.equal(r.takip_surumu,1);
      assert.equal(r.durum,'islemde');assert.equal(r.takip_tarihi,'2026-10-03T10:00:00Z');assert.equal(r.ic_not,'private-note');
      assert.equal((await audit()).results.length,1);assert.doesNotMatch(JSON.stringify((await audit()).results),/private-/);
      const p=await rapor();assert.equal(p.planlanan,1);assert.equal(p.randevulu,0);assert.equal(p.satis,0);
      assert.ok(Math.abs(p.ortalama_yanit_dakika-5/60)<0.0001);assert.equal(p.nitelik_orani,null);
    });
    await t.test('aynı kayıt ve eski form yeni iş olayı üretmez',async()=>{
      await kaydet(form({takip_surumu:'1'}));assert.equal((await talep()).takip_surumu,1);
      assert.equal((await audit()).results.length,1);
      await assert.rejects(kaydet(form()),/başka bir işlem/);
    });
    await t.test('ilk yanıt ve iş sonucu değişiklikleri açık düzeltme teyidi gerektirir',async()=>{
      await assert.rejects(kaydet(form({takip_surumu:'1',ilk_yanit:'2026-10-02T13:01:00'})),/değiştirdiğinizi/);
      assert.equal((await satir()).ilk_yanit,'2026-10-02T10:00:35.000Z');
      await kaydet(form({takip_surumu:'1',duzeltme_teyidi:'1',randevu_tarihi:'2026-10-02T14:00:00',randevu_durumu:'gerceklesti',islem_turu:'satis',islem_tarihi:'2026-10-02T14:30:00'}));
      assert.equal((await talep()).durum,'islemde');
      const p=await rapor();assert.equal(p.randevulu,1);assert.equal(p.satis,1);assert.equal(p.islem_orani,null);
    });
    await t.test('eşzamanlı iki düzeltmeden biri kazanır',async()=>{
      const surum=(await talep()).takip_surumu;
      const iki=await Promise.allSettled([
        kaydet(form({takip_surumu:String(surum),duzeltme_teyidi:'1',nitelik:'uygun_degil',randevu_durumu:'yok',randevu_tarihi:'',islem_turu:'yok'})),
        kaydet(form({takip_surumu:String(surum),duzeltme_teyidi:'1',nitelik:'bilinmiyor',randevu_durumu:'yok',randevu_tarihi:'',islem_turu:'yok'})),
      ]);
      assert.equal(iki.filter(s=>s.status==='fulfilled').length,1);assert.equal((await talep()).takip_surumu,surum+1);
    });
    await t.test('audit hatası ve sonuç yazma hatası talep sürümünü geri alır',async()=>{
      const surum=(await talep()).takip_surumu;
      await db.prepare("CREATE TRIGGER test_sonuc_hatasi BEFORE UPDATE ON talep_is_sonucu BEGIN SELECT RAISE(ABORT,'test'); END").run();
      await assert.rejects(kaydet(form({takip_surumu:String(surum),duzeltme_teyidi:'1'})));
      assert.equal((await talep()).takip_surumu,surum);await db.prepare('DROP TRIGGER test_sonuc_hatasi').run();
      await db.prepare('DROP TABLE panel_islem_gecmisi').run();
      await assert.rejects(kaydet(form({takip_surumu:String(surum),duzeltme_teyidi:'1'})));
      assert.equal((await talep()).takip_surumu,surum);
      for(const sql of ISLEM_GECMISI_SEMA.split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(sql).run();
    });
    await t.test('eksik teyit oran vermez; tamamlanan aynı kohort oranı ve yanıt kapsamı doğru',async()=>{
      await db.prepare("UPDATE talepler SET sorumlu_slug='test' WHERE id=2").run();
      await kaydet(form({id:'2',yanit_durumu:'yanitlanmadi',ilk_yanit:'',nitelik:'bilinmiyor',randevu_durumu:'yok',randevu_tarihi:''}));
      let p=await rapor();assert.equal(p.yanitsiz,1);assert.equal(p.yaniti_bilinmeyen,0);assert.equal(p.nitelik_orani,null);
      await kaydet(form({id:'2',takip_surumu:'1',duzeltme_teyidi:'1',nitelik:'uygun_degil',randevu_durumu:'yok',randevu_tarihi:''}));
      const surum=(await talep()).takip_surumu;
      await kaydet(form({takip_surumu:String(surum),duzeltme_teyidi:'1',randevu_durumu:'gerceklesti',randevu_tarihi:'2026-10-02T14:00:00',islem_turu:'satis',islem_tarihi:'2026-10-02T14:30:00'}));
      p=await rapor();assert.equal(p.toplam,2);assert.equal(p.nitelik_orani,50);assert.equal(p.randevu_orani,50);assert.equal(p.islem_orani,50);
      await kaydet(form({id:'3',randevu_durumu:'yok',randevu_tarihi:'',islem_turu:'satis',islem_tarihi:'2026-10-02T14:30:00'}));
      assert.equal((await rapor()).satis,1); // Geçen ayın talebinin bu haftaki satışı bu kohortta değil.
    });
    await t.test('talep silinirse bağlı sonuç silinir; müşteri metni iş sonucunda tutulmaz',async()=>{
      assert.doesNotMatch(JSON.stringify(await satir()),/private-/);
      await db.prepare('DELETE FROM talepler WHERE id=1').run();assert.equal(await satir(),null);
    });
  }finally{await mf.dispose();}
});
