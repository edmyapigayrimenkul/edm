import { TalepTakipHatasi } from './talep-takip.ts';
import { islemKaydiKomutu } from './panel/islem-gecmisi.ts';

export const YANIT_DURUMLARI = {bilinmiyor:'Henüz teyit edilmedi',yanitlanmadi:'Henüz yanıt verilmedi',yanitlandi:'İlk yanıt verildi'};
export const NITELIK_DURUMLARI = {bilinmiyor:'Henüz değerlendirilmedi',nitelikli:'İhtiyaç ve hizmet uygunluğu doğrulandı',uygun_degil:'Hizmet kapsamına uygun değil'};
export const RANDEVU_DURUMLARI = {bilinmiyor:'Henüz teyit edilmedi',yok:'Randevu yok',planlandi:'Randevu planlandı',gerceklesti:'Randevu gerçekleşti',iptal:'Randevu iptal edildi'};
export const ISLEM_TURLERI = {bilinmiyor:'Henüz teyit edilmedi',yok:'Gerçekleşen işlem yok',satis:'Satış gerçekleşti',kiralama:'Kiralama gerçekleşti'};

/** Canlıda varsayılan kapalıdır. Yerel test yalnız loopback ve mevcut test kimliğiyle açılır. */
export function isSonucuKaydiEtkin(ortam: Record<string,unknown>, adres: string): boolean {
  if (ortam.TALEP_IS_SONUCLARI_ETKIN !== undefined) return ortam.TALEP_IS_SONUCLARI_ETKIN === '1';
  try {
    return ortam.PANEL_YEREL_TEST_KIMLIGI === '1' && ['localhost','127.0.0.1','[::1]'].includes(new URL(adres).hostname);
  } catch { return false; }
}

const durumSec = (form: FormData, alan: string, secenekler: Record<string,string>) => {
  const deger = String(form.get(alan) ?? '');
  if (!Object.hasOwn(secenekler,deger)) throw new TalepTakipHatasi('Yanıt, nitelik, randevu ve işlem durumlarını geçerli seçeneklerden seçin.');
  return deger;
};
const utcZamani = (tarih: string) => new Date(tarih.includes('T') ? tarih : tarih.replace(' ','T')+'Z').getTime();

export function isSonucuFormTarihi(tarih: unknown): string {
  if (!tarih) return '';
  const zaman=utcZamani(String(tarih));
  return Number.isFinite(zaman) ? new Date(zaman+3*3_600_000).toISOString().slice(0,19) : '';
}
function olayTarihiniCoz(ham:string):string|null {
  if (!ham) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(ham)) throw new TalepTakipHatasi('Olay tarihini geçerli bir gün ve saat olarak seçin.');
  const saniyeli=ham.length===16?ham+':00':ham;
  const zaman=Date.parse(saniyeli+'Z');
  if (!Number.isFinite(zaman)||new Date(zaman).toISOString().slice(0,19)!==saniyeli||Number(ham.slice(0,4))<2000||Number(ham.slice(0,4))>2100) {
    throw new TalepTakipHatasi('Olay tarihi geçerli değil.');
  }
  return new Date(zaman-3*3_600_000).toISOString();
}

type IsSonucu = {yanit_durumu:string;ilk_yanit:string|null;nitelik:string;randevu_durumu:string;randevu_tarihi:string|null;islem_turu:string;islem_tarihi:string|null};

export async function talepIsSonucunuKaydet(vt:D1Database, eposta:string, form:FormData, simdi=new Date()) {
  const id=Number(form.get('id'));
  const surumHam=String(form.get('takip_surumu') ?? '');
  const surum=Number(surumHam);
  if (!Number.isSafeInteger(id)||id<=0||!/^\d+$/.test(surumHam)||!Number.isSafeInteger(surum)) {
    throw new TalepTakipHatasi('Talep ve düzenleme bilgileri geçerli değil. Sayfayı yenileyin.');
  }
  const talep=await vt.prepare('SELECT olusturma,sorumlu_slug,takip_surumu FROM talepler WHERE id=?')
    .bind(id).first<{olusturma:string;sorumlu_slug:string|null;takip_surumu:number}>();
  if (!talep) throw new TalepTakipHatasi('Talep bulunamadı.');
  if (talep.takip_surumu!==surum) throw new TalepTakipHatasi('Bu talep başka bir işlemle değişti. Sayfayı yenileyin.');
  if (!talep.sorumlu_slug || !await vt.prepare('SELECT slug FROM ekip WHERE slug=?').bind(talep.sorumlu_slug).first()) {
    throw new TalepTakipHatasi('İş sonucunu kaydetmeden önce takip planında sorumlu danışman seçin.');
  }
  const olusma=utcZamani(talep.olusturma);
  if (!Number.isFinite(olusma)) throw new TalepTakipHatasi('Talebin oluşturma tarihi doğrulanamadı.');
  const yanit=durumSec(form,'yanit_durumu',YANIT_DURUMLARI);
  const nitelik=durumSec(form,'nitelik',NITELIK_DURUMLARI);
  const randevu=durumSec(form,'randevu_durumu',RANDEVU_DURUMLARI);
  const islem=durumSec(form,'islem_turu',ISLEM_TURLERI);
  const tarihiAl=(alan:string,gerekli:boolean,gelecek:boolean) => {
    const ham=String(form.get(alan) ?? '');
    if (!gerekli) {
      if (ham) throw new TalepTakipHatasi('Seçili duruma ait olmayan tarihleri temizleyin.');
      return null;
    }
    const tarih=olayTarihiniCoz(ham);
    if (!tarih||utcZamani(tarih)<olusma||(!gelecek&&utcZamani(tarih)>simdi.getTime())) {
      throw new TalepTakipHatasi('Olay tarihi talep oluşturulmadan önce olamaz; gerçekleşen olay ileri tarihte olamaz.');
    }
    return tarih;
  };
  const ilkYanit=tarihiAl('ilk_yanit',yanit==='yanitlandi',false);
  const randevuTarihi=tarihiAl('randevu_tarihi',['planlandi','gerceklesti','iptal'].includes(randevu),randevu!=='gerceklesti');
  const islemTarihi=tarihiAl('islem_tarihi',['satis','kiralama'].includes(islem),false);
  if (nitelik!=='bilinmiyor'&&yanit!=='yanitlandi') throw new TalepTakipHatasi('Nitelik değerlendirmesi için önce gerçek ilk yanıtı kaydedin.');
  if ((randevuTarihi||islemTarihi)&&(!ilkYanit||[randevuTarihi,islemTarihi].some(t=>t&&utcZamani(t)<utcZamani(ilkYanit)))) {
    throw new TalepTakipHatasi('Randevu ve işlem ilk yanıttan önce olamaz. Gerçek ilk yanıtı kaydedin.');
  }
  if (form.get('gercek_kayit_teyidi')!=='1') throw new TalepTakipHatasi('Yalnız gerçekleşen veya gerçekten planlanan bilgileri teyit ederek kaydedin.');
  const onceki=await vt.prepare('SELECT yanit_durumu,ilk_yanit,nitelik,randevu_durumu,randevu_tarihi,islem_turu,islem_tarihi FROM talep_is_sonucu WHERE talep_id=?').bind(id).first<IsSonucu>();
  const sonraki:IsSonucu={yanit_durumu:yanit,ilk_yanit:ilkYanit,nitelik,randevu_durumu:randevu,randevu_tarihi:randevuTarihi,islem_turu:islem,islem_tarihi:islemTarihi};
  const degisti=Object.entries(sonraki).some(([k,v])=>v !== onceki?.[k as keyof IsSonucu]);
  if (!degisti) return; // Yeniden kaydetmek yeni iş olayı veya ikinci satış üretmez.
  if (onceki && form.get('duzeltme_teyidi')!=='1') throw new TalepTakipHatasi('Mevcut iş sonucunu değiştirdiğinizi teyit edin; önceki değer işlem geçmişinde korunur.');
  // Asıl talebin sürümü tüm formları birbirine bağlar. Başarılı INSERT/UPDATE
  // audit ile aynı batch içindedir; sürüm kaybeden hiçbir yan etki üretmez.
  const [degisiklik]=await vt.batch([
    vt.prepare(`UPDATE talepler SET takip_surumu=takip_surumu+1,ilgilenen=? WHERE id=? AND takip_surumu=?
      AND sorumlu_slug=? AND EXISTS(SELECT 1 FROM ekip WHERE slug=?)`)
      .bind(eposta,id,surum,talep.sorumlu_slug,talep.sorumlu_slug),
    islemKaydiKomutu(vt,{eposta},{eylem:'talep-is-sonucu',varlikTuru:'talep',varlikId:String(id),
      ozet:onceki?'Talep iş sonucu teyitli olarak düzeltildi.':'Talep iş sonucu teyitli olarak kaydedildi.',onceki,sonraki},true),
    vt.prepare(`INSERT INTO talep_is_sonucu (talep_id,yanit_durumu,ilk_yanit,nitelik,randevu_durumu,randevu_tarihi,islem_turu,islem_tarihi,guncelleme)
      SELECT ?,?,?,?,?,?,?,?,? WHERE changes()=1
      ON CONFLICT(talep_id) DO UPDATE SET yanit_durumu=excluded.yanit_durumu,ilk_yanit=excluded.ilk_yanit,nitelik=excluded.nitelik,
      randevu_durumu=excluded.randevu_durumu,randevu_tarihi=excluded.randevu_tarihi,islem_turu=excluded.islem_turu,
      islem_tarihi=excluded.islem_tarihi,guncelleme=excluded.guncelleme`)
      .bind(id,yanit,ilkYanit,nitelik,randevu,randevuTarihi,islem,islemTarihi,simdi.toISOString()),
  ]);
  if (degisiklik.meta.changes!==1) throw new TalepTakipHatasi('Talep veya ekip bilgisi değişti. Sayfayı yenileyip tekrar kaydedin.');
}

/** Tarih dönemindeki aynı talep kümesi; eksik teyit varsa yüzde verilmez. */
export async function isSonucuGostergeleriniAl(vt:D1Database, baslangic:string, bitis:string) {
  const sayim=await vt.prepare(`SELECT COUNT(*) AS toplam,
    COALESCE(SUM(s.talep_id IS NOT NULL),0) AS kayitli,
    COALESCE(SUM(s.yanit_durumu='yanitlandi'),0) AS yanitli,
    AVG(CASE WHEN s.yanit_durumu='yanitlandi' AND julianday(s.ilk_yanit)>=julianday(t.olusturma)
      THEN (julianday(s.ilk_yanit)-julianday(t.olusturma))*1440 END) AS ortalama_yanit_dakika,
    COALESCE(SUM(s.nitelik='nitelikli'),0) AS nitelikli,
    COALESCE(SUM(s.nitelik<>'bilinmiyor'),0) AS niteligi_bilinen,
    COALESCE(SUM(s.randevu_durumu='planlandi'),0) AS planlanan,
    COALESCE(SUM(s.randevu_durumu='gerceklesti'),0) AS randevulu,
    COALESCE(SUM(s.randevu_durumu<>'bilinmiyor'),0) AS randevusu_bilinen,
    COALESCE(SUM(s.islem_turu='satis'),0) AS satis,
    COALESCE(SUM(s.islem_turu='kiralama'),0) AS kiralama,
    COALESCE(SUM(s.islem_turu<>'bilinmiyor'),0) AS islemi_bilinen
    FROM talepler t LEFT JOIN talep_is_sonucu s ON s.talep_id=t.id
    WHERE julianday(t.olusturma)>=julianday(?) AND julianday(t.olusturma)<julianday(?)`)
    .bind(baslangic,bitis).first<{
      toplam:number;kayitli:number;yanitli:number;ortalama_yanit_dakika:number|null;
      nitelikli:number;niteligi_bilinen:number;planlanan:number;randevulu:number;randevusu_bilinen:number;
      satis:number;kiralama:number;islemi_bilinen:number;
    }>();
  const acik=await vt.prepare(`SELECT
    COALESCE(SUM(s.yanit_durumu='yanitlanmadi'),0) AS yanitsiz,
    COALESCE(SUM(s.talep_id IS NULL OR s.yanit_durumu='bilinmiyor'),0) AS yaniti_bilinmeyen
    FROM talepler t LEFT JOIN talep_is_sonucu s ON s.talep_id=t.id WHERE t.durum<>'kapandi'`).first<{yanitsiz:number;yaniti_bilinmeyen:number}>();
  if (!sayim||!acik) throw new Error('İş sonucu raporu okunamadı.');
  const oran=(adet:number,bilinen:number)=>sayim.toplam>0&&bilinen===sayim.toplam?adet/sayim.toplam*100:null;
  return {...sayim,...acik,nitelik_orani:oran(sayim.nitelikli,sayim.niteligi_bilinen),
    randevu_orani:oran(sayim.randevulu,sayim.randevusu_bilinen),islem_orani:oran(sayim.satis+sayim.kiralama,sayim.islemi_bilinen)};
}
