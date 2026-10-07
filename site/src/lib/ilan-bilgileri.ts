import { yerelSayiOku } from './ilan-alanlari.ts';
import { DEVRE_MULK_TESISLERI } from './devre-mulk-tesisleri.ts';
import { DEVRE_MULK_GUNLUK_TESISLERI } from './devre-mulk-gunluk-tesisleri.ts';
import { sahibindenDetayGruplari } from './sahibinden-detay.ts';
import { sahibindenAlanKaynaktaZorunlu } from './sahibinden-zorunlu-alanlar.generated.ts';

/**
 * İlan bilgi mimarisinin tek doğruluk kaynağı.
 *
 * Yönetim formu, sunucu doğrulaması ve ilan detayındaki teknik gruplar aynı
 * şemayı kullanır. Bir kategoriye ait olmayan alanlar sunucuda da yok sayılır.
 */

export interface MulkSecenek { deger: string; etiket: string; islemler?: IslemKimligi[] }
export type IlanGrupKimligi = 'konut' | 'arsa' | 'isyeri' | 'bina' | 'turistik' | 'proje' | 'devre-mulk' | 'gunluk-konaklama';
export type IslemKimligi = 'satilik' | 'kiralik' | 'gunluk-kiralik' | 'sezonluk-kiralik' | 'devren-satilik' | 'devren-kiralik' | 'kat-karsiligi-satilik';
export type AlanTuru = 'metin' | 'sayi' | 'ondalik' | 'secim' | 'tarih' | 'coklu' | 'uzun-metin';

export interface AlanTanimi {
  ad: string;
  anahtar: string;
  etiket: string;
  tur: AlanTuru;
  secenekler?: MulkSecenek[];
  birim?: string;
  yerTutucu?: string;
  yardim?: string;
  gerekli?: boolean;
  /** Alanı yalnızca eşleşen işlem/tür birleşimlerinde zorunlu yapar. */
  zorunluKosullar?: Array<{ gruplar?: IlanGrupKimligi[]; islemler?: IslemKimligi[]; tipler?: string[] }>;
  onerilen?: boolean;
  tamGenislik?: boolean;
  enAz?: number;
  enFazla?: number;
  adim?: string;
  halkaAcik?: boolean;
  islemler?: IslemKimligi[];
  /** Alan yalnızca bu alt mülk türlerinde gösterilir ve kabul edilir. */
  tipler?: string[];
  portal?: string[];
}

export interface AlanBolumu { kimlik: string; baslik: string; aciklama: string; alanlar: AlanTanimi[] }
export interface DonanimGrubu { kimlik: string; baslik: string; aciklama: string; ogeListesi: string[]; gerekli?: boolean }
export interface IlanGrupSemasi {
  kimlik: IlanGrupKimligi;
  etiket: string;
  kisaEtiket: string;
  aciklama: string;
  altTipler: MulkSecenek[];
  islemler: IslemKimligi[];
  bolumler: AlanBolumu[];
  donanimGruplari: DonanimGrubu[];
}

export function alanGerekliMi(alan: AlanTanimi, islem: string, tip: string, grup?: string, degerler: Record<string, unknown> = {}): boolean {
  if (alan.islemler && !alan.islemler.includes(islem as IslemKimligi)) return false;
  if (alan.tipler && !alan.tipler.includes(tip)) return false;
  return Boolean(alan.gerekli || alan.zorunluKosullar?.some((kosul) =>
    (!kosul.gruplar || kosul.gruplar.includes(grup as IlanGrupKimligi))
    && (!kosul.islemler || kosul.islemler.includes(islem as IslemKimligi))
    && (!kosul.tipler || kosul.tipler.includes(tip))
  ) || sahibindenAlanKaynaktaZorunlu(alan.ad, grup ?? '', islem, tip, degerler));
}

const s = (deger: string, etiket = deger): MulkSecenek => ({ deger, etiket });
const a = (tanim: AlanTanimi): AlanTanimi => tanim;
const d = (kimlik: string, baslik: string, aciklama: string, ogeListesi: string[]): DonanimGrubu => ({ kimlik, baslik, aciklama, ogeListesi, gerekli: true });

function slugla(metin: string): string {
  return metin.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const ISLEM_TURLERI: Array<MulkSecenek & { gruplar: IlanGrupKimligi[] }> = [
  { deger: 'satilik', etiket: 'Satılık', gruplar: ['konut', 'arsa', 'isyeri', 'bina', 'turistik', 'proje', 'devre-mulk'] },
  { deger: 'kiralik', etiket: 'Kiralık', gruplar: ['konut', 'arsa', 'isyeri', 'bina', 'turistik'] },
  { deger: 'gunluk-kiralik', etiket: 'Günlük Kiralık', gruplar: ['konut', 'turistik', 'gunluk-konaklama'] },
  { deger: 'sezonluk-kiralik', etiket: 'Sezonluk Kiralık', gruplar: ['konut', 'turistik'] },
  { deger: 'devren-satilik', etiket: 'Devren Satılık', gruplar: ['konut', 'isyeri', 'turistik'] },
  { deger: 'devren-kiralik', etiket: 'Devren Kiralık', gruplar: ['isyeri', 'turistik'] },
  { deger: 'kat-karsiligi-satilik', etiket: 'Kat Karşılığı Satılık', gruplar: ['arsa'] },
];

export const PARA_BIRIMLERI = [s('TRY', '₺ Türk Lirası'), s('USD', '$ Amerikan Doları'), s('EUR', '€ Euro'), s('GBP', '£ İngiliz Sterlini')];
/** Sahibinden tam ilan formunda tüm emlak kategorileri için ortak kaynak alanı. */
export const KIMDEN_ALANI: AlanTanimi = a({
  ad: 'kimden', anahtar: 'Kimden', etiket: 'Kimden', tur: 'secim', gerekli: true, halkaAcik: true,
  secenekler: ['Emlak Ofisinden', 'Turizm İşletmesinden', 'Emlak Ofisi', 'Mağazadan', 'İnşaat Firmasından'].map((x) => s(x)),
  yardim: 'Seçenekler Sahibinden tam formunda kategori ve işlem türüne göre belirlenir.',
});
/** Tam form meta verisindeki kategori/işlem seçeneklerini döndürür; filtre API'si daha geniş seçenekler taşıyabilir. */
export function kimdenAlaniniSec(tipGrup: string, islem: string, tip: string): AlanTanimi {
  let secenekler = ['Emlak Ofisinden'];
  if (tipGrup === 'gunluk-konaklama') secenekler = ['Turizm İşletmesinden'];
  else if (tipGrup === 'isyeri' && islem === 'devren-satilik' && tip === 'enerji-santrali') secenekler = ['Mağazadan'];
  else if (tipGrup === 'isyeri' && (
    (islem === 'satilik' && ['ciftlik', 'depo-antrepo', 'fabrika', 'imalathane', 'plaza-kati', 'rezidans-kati-ofisi'].includes(tip))
    || (['devren-satilik', 'devren-kiralik'].includes(islem) && tip === 'kuyumcu')
  )) secenekler = ['Emlak Ofisi'];
  else if (tipGrup === 'isyeri' && (
    (tip === 'oto-servis-bakim' && ['devren-satilik', 'devren-kiralik'].includes(islem))
    || (tip === 'oto-yedek-parcaci' && islem === 'devren-satilik')
    || (tip === 'etkinlik-alani' && islem === 'devren-kiralik')
  )) {
    secenekler = ['Emlak Ofisinden', 'İnşaat Firmasından'];
  }
  return { ...KIMDEN_ALANI, secenekler: secenekler.map((x) => s(x)) };
}
const EVET_HAYIR = [s('Evet'), s('Hayır')];
const VAR_YOK = [s('Var'), s('Yok')];
const KISI_KAPASITESI = Array.from({ length: 12 }, (_, i) => s(String(i + 1)));
const BILGI_DURUMU = [s('dogrulandi', 'Resmi kaynaktan doğrulandı'), s('beyan', 'Yetkili beyanı'), s('arastiriliyor', 'Araştırılıyor'), s('bilinmiyor', 'Bilinmiyor')];
const TAPU = [
  'Kat Mülkiyeti', 'Kat İrtifakı', 'Müstakil Tapu', 'Hisseli Tapu', 'Kooperatif Hissesi', 'Tahsis Belgesi', 'Zilliyet', 'Tapu Yok',
  'Kat Mülkiyetli', 'Kat İrtifaklı', 'Müstakil Tapulu', 'Arsa Tapulu', 'Kooperatif Hisseli Tapu',
  'İntifa Hakkı Tesisli', 'Yurt Dışı Tapulu', 'Tapu Kaydı Yok', 'Tahsis Tapu', 'Zilliyet Tapu',
  'Müstakil Parsel', 'Tahsis', 'Hisseli', 'Devre Mülk Tapulu',
].map((x) => s(x));
const KREDI = ['Uygun', 'Kısmen Uygun', 'Uygun Değil', 'Bilinmiyor', 'Evet', 'Hayır'].map((x) => s(x));
const ODA = [
  s('1+0', 'Stüdyo (1+0)'), s('1+1'), s('1.5+1'), s('2+0'), s('2+1'), s('2.5+1'), s('2+2'),
  s('3+0'), s('3+1'), s('3.5+1'), s('3+2'), s('3+3'), s('4+0'), s('4+1'), s('4.5+1'),
  s('4.5+2'), s('4+2'), s('4+3'), s('4+4'), s('5+1'), s('5.5+1'), s('5+2'), s('5+3'),
  s('5+4'), s('6+1'), s('6+2'), s('6.5+1'), s('6+3'), s('6+4'), s('7+1'), s('7+2'), s('7+3'),
  s('8+1'), s('8+2'), s('8+3'), s('8+4'), s('9+1'), s('9+2'), s('9+3'), s('9+4'), s('9+5'),
  s('9+6'), s('10+1'), s('10+2'), s('10 Üzeri'),
];
const YAS = [
  s('0', '0 (Oturuma Hazır)'), s('0-yapim-asamasinda', '0 (Yapım Aşamasında)'), s('1'), s('2'), s('3'), s('4'), s('5'),
  s('5-10', '6-10 arası'), s('11-15', '11-15 arası'), s('16-20', '16-20 arası'), s('21-25', '21-25 arası'),
  s('26-30', '26-30 arası'), s('31+', '31 ve üzeri'), s('5-10 arası'), s('5 -10 arası'), s('30 üzeri'),
];
const KAT = [
  'Bodrum', 'Kot 3', 'Kot 2', 'Kot 1', 'Zemin', 'Giriş', 'Bahçe Katı', 'Yüksek Giriş',
  'Giriş Altı Kot', 'Bodrum Kat', 'Bodrum Katı', 'Zemin Kat', 'Giriş Katı', 'Çatı Katı', 'Villa Tipi',
  ...Array.from({ length: 29 }, (_, i) => String(i + 1)), '30 ve üzeri',
  ...Array.from({ length: 10 }, (_, i) => `${i + 1}. Kat`),
  '11-20. Kat', '21 ve üzeri', 'Teras Katı', 'Müstakil', 'Komple Bina',
].map((x) => s(x));
const TICARI_KAT = [
  ...KAT,
  ...Array.from({ length: 20 }, (_, i) => s(String(i + 30))),
  ...['50 ve Üzeri', '10 ve üzeri', '20 ve Üzeri', '30 ve Üzeri', 'Alışveriş Merkezinde'].map((x) => s(x)),
];
const ISITMA = [
  s('Kombi (Doğalgaz)', 'Doğalgaz (Kombi)'), s('Merkezi'), s('Merkezi (Doğalgaz)'),
  s('Merkezi (Pay Ölçer)'), s('Kat Kaloriferi'), s('Yerden Isıtma'), s('Klima'),
  s('Isı Pompası'), s('Soba'), s('Güneş Enerjisi'), s('VRV / VRF'), s('Fan Coil', 'Fancoil Ünitesi'),
  s('Jeotermal'), s('Yok'), s('Doğalgaz Sobası'), s('Kombi (Elektrik)'), s('Elektrikli Radyatör'), s('Şömine'), s('VRV'),
  ...['Kombi', 'Merkezi Sistem', 'Isıtma Sistemi Yok', 'Fan Coil Ünitesi', 'Fuel Oil / Kömür', 'Doğalgaz (merkezi)', 'Fan Coil Sistem', 'VAV', 'Jeotermal Isıtma', 'Kalorifer'].map((x) => s(x)),
];
const ENERJI_KIMLIK = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Muaf', 'Bilinmiyor'].map((x) => s(x));
const IMAR = [
  'Konut İmarlı', 'Villa İmarlı', 'Ticari İmarlı', 'Sanayi İmarlı', 'Turizm İmarlı', 'Depolama / Lojistik', 'Küçük Sanayi', 'Tarla', 'Bağ / Bahçe', 'Zeytinlik', 'Sit Alanı', 'İmar Planı Aşamasında', 'İmarsız', 'Bilinmiyor',
  'Ada', 'A-Lejantlı', 'Arazi', 'Bağ & Bahçe', 'Depo & Antrepo', 'Eğitim', 'Enerji Depolama', 'Konut', 'Kültürel Tesis',
  'Muhtelif', 'Özel Kullanım', 'Sağlık', 'Sanayi', 'Sera', 'Spor Alanı', 'Tarla + Bağ', 'Ticari', 'Ticari + Konut',
  'Toplu Konut', 'Turizm', 'Turizm + Konut', 'Turizm + Ticari', 'Villa',
].map((x) => s(x));
const CEPHE = ['Kuzey', 'Güney', 'Doğu', 'Batı', 'Kuzeydoğu', 'Kuzeybatı', 'Güneydoğu', 'Güneybatı'].map((x) => s(x));
const MUTFAK_TIPI = ['Açık (Amerikan)', 'Kapalı', 'Yarı Açık', 'Ada Mutfak', 'Mutfak Yok'].map((x) => s(x));
const KONUT_KAT_TIPI = ['Ara Kat', 'Ara Kat Dubleks', 'Dubleks', 'En Üst Kat', 'Bahçe Dubleksi', 'Çatı Dubleksi', 'Forleks', 'Ters Dubleks', 'Tripleks', 'Müstakil'].map((x) => s(x));
const KONUT_ARSA_ALANI_TIPLERI = ['villa', 'mustakil-ev', 'yazlik', 'koy-evi', 'prefabrik-ev'];
const KONUT_ARAZI_ALANI_TIPLERI = ['ciftlik-evi', 'kosk-konak', 'yali'];
const KONUT_GUNLUK_TIPLERI = ['daire', 'rezidans', 'mustakil-ev', 'villa'];
const KONUT_BINA_YASI_TIPLERI = ['daire', 'rezidans', 'mustakil-ev', 'villa', 'ciftlik-evi', 'kosk-konak', 'yali', 'yali-dairesi', 'yazlik', 'kooperatif'];
const KONUT_KAT_SAYISI_TIPLERI = ['daire', 'rezidans', 'villa', 'ciftlik-evi', 'kosk-konak', 'yali', 'yali-dairesi', 'yazlik', 'kooperatif'];
const KONUT_TAKAS_TIPLERI = ['daire', 'villa', 'rezidans', 'mustakil-ev', 'ciftlik-evi', 'kosk-konak', 'yali', 'yali-dairesi', 'yazlik', 'kooperatif', 'koy-evi', 'prefabrik-ev'];
const TAKAS_ALANI = a({ ad: 'takas', anahtar: 'Takas', etiket: 'Takaslı', tur: 'secim', secenekler: ['Evet', 'Hayır', 'Yok', 'Gayrimenkul', 'Araç', 'Araç veya Gayrimenkul', 'Görüşülür'].map((x) => s(x)), islemler: ['satilik', 'devren-satilik'] });

const FINANS: AlanTanimi[] = [
  a({ ad: 'fiyat_kapsami', anahtar: 'Fiyat Kapsamı', etiket: 'Fiyatın kapsadığı taşınmaz', tur: 'secim', secenekler: [
    s('Taşınmazın tamamı'), s('Belirtilen hisse'), s('Tek parsel'), s('Birden fazla parsel / paket'),
    s('Tek bağımsız bölüm'), s('Birden fazla bağımsız bölüm / paket'),
  ], onerilen: true, islemler: ['satilik', 'devren-satilik'] }),
  a({ ad: 'pazarlik', anahtar: 'Pazarlık', etiket: 'Pazarlık durumu', tur: 'secim', secenekler: ['Var', 'Yok', 'Görüşülür'].map((x) => s(x)), onerilen: true }),
  a({ ad: 'kredi_uygunluk', anahtar: 'Krediye Uygunluk', etiket: 'Krediye uygunluk', tur: 'secim', secenekler: KREDI, onerilen: true, zorunluKosullar: [
    { gruplar: ['arsa'], islemler: ['satilik'] },
    { gruplar: ['konut'], islemler: ['satilik'], tipler: ['kosk-konak', 'yali', 'yali-dairesi'] },
    { gruplar: ['isyeri'], islemler: ['satilik'], tipler: ['akaryakit-istasyonu', 'apartman-dairesi', 'ciftlik', 'depo-antrepo', 'dukkan-magaza', 'fabrika', 'hamam-sauna-spa', 'is-hani-kati-ofisi', 'komple-bina', 'otopark', 'plaza-kati', 'rezidans-kati-ofisi', 'spor-tesisi', 'toplanti-etkinlik-salonu', 'villa'] },
    { gruplar: ['isyeri'], islemler: ['devren-satilik'], tipler: ['dukkan-magaza', 'hamam-sauna-spa'] },
    { gruplar: ['turistik'], islemler: ['satilik'], tipler: ['otel', 'apart-otel', 'butik-otel', 'motel', 'pansiyon', 'tatil-koyu'] },
  ] }),
  TAKAS_ALANI,
  a({ ad: 'aidat', anahtar: 'Aidat', etiket: 'Aylık aidat', tur: 'sayi', birim: '₺', enAz: 0, islemler: ['satilik', 'kiralik', 'devren-satilik', 'devren-kiralik'] }),
  a({ ad: 'depozito', anahtar: 'Depozito', etiket: 'Depozito', tur: 'sayi', birim: '₺', enAz: 0, islemler: ['kiralik', 'gunluk-kiralik', 'sezonluk-kiralik', 'devren-kiralik'] }),
  a({ ad: 'aylik_kira', anahtar: 'Aylık Kira', etiket: 'İş yerinin aylık kirası', tur: 'sayi', birim: '₺', enAz: 0, onerilen: true, islemler: ['devren-satilik', 'devren-kiralik'] }),
  a({ ad: 'minimum_konaklama', anahtar: 'Minimum Konaklama', etiket: 'Minimum konaklama', tur: 'sayi', birim: 'gece', enAz: 1, onerilen: true, islemler: ['gunluk-kiralik'] }),
  a({ ad: 'misafir_kapasitesi', anahtar: 'Kişi Kapasitesi', etiket: 'Kişi kapasitesi', tur: 'secim', secenekler: KISI_KAPASITESI, gerekli: true, islemler: ['gunluk-kiralik'], tipler: KONUT_GUNLUK_TIPLERI }),
  a({ ad: 'sezon_baslangic', anahtar: 'Sezon Başlangıcı', etiket: 'Sezon başlangıcı', tur: 'tarih', gerekli: true, islemler: ['sezonluk-kiralik'] }),
  a({ ad: 'sezon_bitis', anahtar: 'Sezon Bitişi', etiket: 'Sezon bitişi', tur: 'tarih', gerekli: true, islemler: ['sezonluk-kiralik'] }),
  a({ ad: 'minimum_sezon_suresi', anahtar: 'Minimum Sezonluk Kiralama', etiket: 'Minimum kiralama süresi', tur: 'sayi', birim: 'hafta', enAz: 1, onerilen: true, islemler: ['sezonluk-kiralik'] }),
  a({ ad: 'sezon_giderleri', anahtar: 'Sezon Bedeline Dahil', etiket: 'Sezon bedeline dahil giderler', tur: 'coklu', secenekler: ['Elektrik', 'Su', 'İnternet', 'Havuz / bahçe bakımı', 'Dönem sonu temizlik'].map((x) => s(x)), tamGenislik: true, islemler: ['sezonluk-kiralik'] }),
  a({ ad: 'kira_getirisi', anahtar: 'Aylık Kira Getirisi', etiket: 'Aylık kira getirisi', tur: 'sayi', birim: '₺', enAz: 0, islemler: ['satilik'] }),
];

const GUNLUK_IZIN_BELGE_ALANI = a({
  ad: 'gunluk_izin_belge_no', anahtar: 'Turistik Kiralama İzin Belge No', etiket: 'İzin belge no',
  tur: 'metin', gerekli: true, islemler: ['gunluk-kiralik'],
  yardim: 'Turistik kiralama izin belgesindeki numarayı aynen yazın.',
});

export const YETKI_ALANLARI: AlanTanimi[] = [
  a({ ad: 'yetki_durumu', anahtar: 'Yetki Doğrulama Durumu', etiket: 'İlan verme yetkisi', tur: 'secim', secenekler: [s('eids', 'EİDS üzerinden doğrulandı'), s('sozlesme', 'Yetkilendirme sözleşmesi var'), s('mulk_sahibi', 'Ofis / mülk sahibi portföyü'), s('bekliyor', 'Doğrulama bekliyor')], gerekli: true, halkaAcik: false }),
  a({ ad: 'mulk_sahibi_statu', anahtar: 'Mülk Sahibi Statüsü', etiket: 'Gayrimenkul sahibinin hukuki statüsü', tur: 'secim', secenekler: ['T.C. vatandaşı', 'T.C. vatandaşı değil', 'Banka / Vakıf / Dernek / Sendika', 'Kamu Kurumu', 'Yabancı gerçek kişi', 'Tüzel kişi', 'Kamu kurumu / diğer', 'Bilinmiyor'].map((x) => s(x)), gerekli: true, halkaAcik: false }),
  a({ ad: 'tasinmaz_no', anahtar: 'Taşınmaz Numarası', etiket: 'Taşınmaz numarası (GKN)', tur: 'metin', yerTutucu: 'Yalnızca yönetim ekibi görür', halkaAcik: false }),
  a({ ad: 'yetki_bitis', anahtar: 'Yetki Bitiş Tarihi', etiket: 'Yetki bitiş tarihi', tur: 'tarih', halkaAcik: false }),
  a({ ad: 'yetki_notu', anahtar: 'Yetki İç Notu', etiket: 'Yetki / dosya iç notu', tur: 'uzun-metin', tamGenislik: true, halkaAcik: false }),
];

export const KONUM_YONETIM_ALANLARI: AlanTanimi[] = [
  a({ ad: 'kesin_enlem', anahtar: 'Kesin Enlem', etiket: 'Kesin enlem', tur: 'ondalik', adim: '0.000001', enAz: 35.5, enFazla: 42.5, halkaAcik: false, yardim: 'Yalnızca yönetim ve izin verilen portal aktarımı kullanır.' }),
  a({ ad: 'kesin_boylam', anahtar: 'Kesin Boylam', etiket: 'Kesin boylam', tur: 'ondalik', adim: '0.000001', enAz: 25.5, enFazla: 45, halkaAcik: false, yardim: 'Yalnızca yönetim ve izin verilen portal aktarımı kullanır.' }),
  a({ ad: 'konum_dogruluk', anahtar: 'Konum Doğruluk Kaynağı', etiket: 'Koordinat doğruluğu', tur: 'secim', secenekler: [s('gps', 'Sahada GPS ile alındı'), s('harita', 'Haritada işaretlendi'), s('adres', 'Adres üzerinden yaklaşık işlendi')], halkaAcik: false }),
  a({ ad: 'kamu_konum_duzeyi', anahtar: 'Kamu Konum Düzeyi', etiket: 'Sitede konum gösterimi', tur: 'secim', secenekler: [s('mahalle', 'Mahalle merkezi (mevcut davranış)'), s('yaklasik', 'Kesin pinden uzaklaştırılmış yaklaşık alan')], halkaAcik: false }),
  a({ ad: 'portal_konum_aktarimi', anahtar: 'Portal Kesin Konum Aktarımı', etiket: 'Portallara kesin konum', tur: 'secim', secenekler: [s('kapali', 'Aktarma'), s('izinli', 'Destekleyen portala aktar')], halkaAcik: false }),
];

export const MEDYA_PORTAL_ALANLARI: AlanTanimi[] = [
  a({ ad: 'sahibinden_no', anahtar: 'Sahibinden No', etiket: 'Sahibinden ilan no', tur: 'metin', halkaAcik: false }),
  a({ ad: 'hepsiemlak_no', anahtar: 'Hepsiemlak No', etiket: 'Hepsiemlak ilan no', tur: 'metin', halkaAcik: false }),
  a({ ad: 'emlakjet_no', anahtar: 'Emlakjet No', etiket: 'Emlakjet ilan no', tur: 'metin', halkaAcik: false }),
  a({ ad: 'video_url', anahtar: 'Video URL', etiket: 'Tanıtım videosu', tur: 'metin', yerTutucu: 'https://youtube.com/watch?v=…', halkaAcik: false }),
  a({ ad: 'sanal_tur_url', anahtar: 'Sanal Tur URL', etiket: 'Sanal tur bağlantısı', tur: 'metin', yerTutucu: 'https://…', halkaAcik: false }),
  a({ ad: 'portal_iletisim_tercihi', anahtar: 'Portal İletişim Tercihi', etiket: 'Portal iletişim gösterimi', tur: 'secim', secenekler: [s('danisman', 'İlana atanmış danışman'), s('ofis', 'Yalnızca ofis'), s('ikisi', 'Danışman ve ofis'), s('portal', 'Portal varsayılanı')], halkaAcik: false }),
];

const KONUT: AlanBolumu[] = [
  { kimlik: 'alan-plan', baslik: 'Alan ve plan', aciklama: 'Karşılaştırmada kullanılan temel ölçüler.', alanlar: [
    a({ ad: 'm2_brut', anahtar: 'Brüt Yapı Alanı', etiket: 'Brüt yapı alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', gerekli: true, onerilen: true, yardim: 'Brüt bilinmiyorsa yalnızca doğruladığınız net veya arsa alanını girin.', enAz: 1 }),
    a({ ad: 'm2_net', anahtar: 'Net Yapı Alanı', etiket: 'Net kullanım alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', gerekli: true, onerilen: true, enAz: 1 }),
    a({ ad: 'arsa_m2', anahtar: 'Arsa Alanı', etiket: 'Arsa / müstakil bahçe alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', enAz: 1, tipler: KONUT_ARSA_ALANI_TIPLERI, yardim: 'Villa, müstakil ev ve benzeri taşınmazlarda yapının bulunduğu toplam arsa.' }),
    a({ ad: 'arazi_m2', anahtar: 'Arazi m²', etiket: 'Arazi alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', enAz: 0, gerekli: true, islemler: ['satilik', 'kiralik'], tipler: KONUT_ARAZI_ALANI_TIPLERI, yardim: 'Çiftlik evi, köşk/konak ve yalı ilanlarında kaynak portalın istediği arazi ölçüsü.' }),
    a({ ad: 'm2_acik', anahtar: 'Açık Kullanım Alanı', etiket: 'Özel kullanımlı bahçe / teras', tur: 'ondalik', birim: 'm²', adim: '0.01', enAz: 0 }),
    a({ ad: 'oda', anahtar: 'Oda Sayısı', etiket: 'Oda düzeni', tur: 'secim', secenekler: ODA, gerekli: true }),
    a({ ad: 'salon_sayisi', anahtar: 'Salon Sayısı', etiket: 'Salon sayısı', tur: 'sayi', enAz: 0, enFazla: 10 }),
    a({ ad: 'banyo_sayisi', anahtar: 'Banyo Sayısı', etiket: 'Banyo sayısı', tur: 'sayi', enAz: 0, enFazla: 20, onerilen: true, zorunluKosullar: [
      { islemler: ['satilik'], tipler: ['daire', 'rezidans', 'mustakil-ev', 'villa', 'ciftlik-evi', 'kosk-konak', 'yali', 'yali-dairesi', 'yazlik', 'kooperatif'] },
      { islemler: ['kiralik'], tipler: ['daire', 'rezidans', 'mustakil-ev', 'villa', 'ciftlik-evi', 'kosk-konak', 'yali', 'yali-dairesi'] },
      { islemler: ['devren-satilik'], tipler: ['daire', 'villa'] },
      { islemler: ['gunluk-kiralik'], tipler: ['daire', 'rezidans', 'mustakil-ev', 'villa', 'devre-mulk', 'apart-pansiyon'] },
    ] }),
    a({ ad: 'tuvalet_sayisi', anahtar: 'Tuvalet Sayısı', etiket: 'WC sayısı', tur: 'sayi', enAz: 0, enFazla: 20 }),
    a({ ad: 'mutfak_tipi', anahtar: 'Mutfak Tipi', etiket: 'Mutfak tipi', tur: 'secim', secenekler: MUTFAK_TIPI, onerilen: true, zorunluKosullar: [
      { islemler: ['satilik'], tipler: ['daire', 'rezidans', 'mustakil-ev', 'villa', 'yazlik', 'kooperatif'] },
      { islemler: ['kiralik'], tipler: ['daire', 'rezidans', 'mustakil-ev', 'villa'] },
      { islemler: ['devren-satilik'], tipler: ['daire', 'villa'] },
      { islemler: ['gunluk-kiralik'], tipler: ['daire', 'rezidans', 'mustakil-ev', 'villa'] },
    ] }),
  ] },
  { kimlik: 'yapi-kullanim', baslik: 'Bina ve kullanım', aciklama: 'Yapı, kat, ısınma ve kullanım durumu.', alanlar: [
    a({ ad: 'bina_yasi', anahtar: 'Bina Yaşı', etiket: 'Bina yaşı', tur: 'secim', secenekler: YAS, onerilen: true, zorunluKosullar: [
      { islemler: ['satilik', 'kiralik'], tipler: KONUT_BINA_YASI_TIPLERI },
      { islemler: ['devren-satilik'], tipler: ['daire', 'villa'] },
    ] }),
    a({ ad: 'bulundugu_kat', anahtar: 'Bulunduğu Kat', etiket: 'Bulunduğu kat', tur: 'secim', secenekler: KAT, onerilen: true, zorunluKosullar: [
      { islemler: ['satilik'], tipler: ['daire', 'rezidans', 'yali-dairesi', 'yazlik', 'kooperatif'] },
      { islemler: ['kiralik'], tipler: ['daire', 'rezidans', 'yali-dairesi'] },
      { islemler: ['gunluk-kiralik'], tipler: ['daire', 'rezidans'] },
      { islemler: ['devren-satilik'], tipler: ['daire'] },
    ] }),
    a({ ad: 'ara_kat', anahtar: 'Ara Kat', etiket: 'Ara kat', tur: 'secim', secenekler: EVET_HAYIR, tipler: ['daire', 'rezidans', 'yali-dairesi', 'yazlik', 'kooperatif'] }),
    a({ ad: 'kat_sayisi', anahtar: 'Kat Sayısı', etiket: 'Toplam kat', tur: 'sayi', enAz: 1, enFazla: 100, zorunluKosullar: [
      { islemler: ['satilik'], tipler: KONUT_KAT_SAYISI_TIPLERI },
      { islemler: ['kiralik'], tipler: ['daire', 'rezidans', 'villa', 'ciftlik-evi', 'kosk-konak', 'yali', 'yali-dairesi'] },
      { islemler: ['devren-satilik'], tipler: ['daire'] },
      { islemler: ['gunluk-kiralik'], tipler: ['daire', 'rezidans'] },
    ] }),
    a({ ad: 'konut_kat_tipi', anahtar: 'Konut Kat Tipi', etiket: 'Konut kat / plan tipi', tur: 'secim', secenekler: KONUT_KAT_TIPI, onerilen: true }),
    a({ ad: 'isitma_tipi', anahtar: 'Isıtma Tipi', etiket: 'Isıtma', tur: 'secim', secenekler: ISITMA, gerekli: true, onerilen: true }),
    a({ ad: 'enerji_kimlik_belgesi', anahtar: 'Enerji Kimlik Belgesi', etiket: 'Enerji kimlik belgesi', tur: 'secim', secenekler: ENERJI_KIMLIK }),
    a({ ad: 'kullanim_durumu', anahtar: 'Kullanım Durumu', etiket: 'Kullanım durumu', tur: 'secim', secenekler: ['Boş', 'Mülk Sahibi Oturuyor', 'Mülk Sahibi', 'Kiracılı', 'Yapım Aşamasında'].map((x) => s(x)), onerilen: true, zorunluKosullar: [
      { islemler: ['satilik', 'kiralik'], tipler: ['daire', 'rezidans', 'mustakil-ev', 'villa', 'kosk-konak', 'yali', 'yali-dairesi', 'yazlik', 'kooperatif'] },
    ] }),
    a({ ad: 'esya_durumu', anahtar: 'Eşyalı', etiket: 'Eşyalı mı?', tur: 'secim', secenekler: ['Evet', 'Hayır', 'Boş / Eşyasız', 'Eşyalı', 'Kısmen Eşyalı'].map((x) => s(x)) }),
    a({ ad: 'yapi_tipi', anahtar: 'Yapı Tipi', etiket: 'Yapı tipi', tur: 'secim', secenekler: ['Betonarme', 'Çelik', 'Ahşap', 'Prefabrik', 'Taş', 'Yığma', 'Kütük', 'Yarı Kagir', 'Tam Kagir', 'Tam Kâgir (Taş Ev)', 'Çelik Konstrüksiyon', 'Taş Ev', 'Diğer'].map((x) => s(x)) }),
    a({ ad: 'yapi_durumu', anahtar: 'Yapı Durumu', etiket: 'Yapı durumu', tur: 'secim', secenekler: ['Sıfır', 'İkinci El', 'Yapım Aşamasında', 'Tarihi Eser'].map((x) => s(x)) }),
    a({ ad: 'zemin_etudu', anahtar: 'Zemin Etüdü', etiket: 'Zemin etüdü', tur: 'secim', secenekler: VAR_YOK, tipler: ['ciftlik-evi', 'kosk-konak', 'yali', 'yali-dairesi'] }),
    a({ ad: 'iskan', anahtar: 'İskan Durumu', etiket: 'İskan', tur: 'secim', secenekler: ['Var', 'Yok', 'Başvuru Aşamasında', 'Bilinmiyor'].map((x) => s(x)) }),
    a({ ad: 'tapu_durumu', anahtar: 'Tapu Durumu', etiket: 'Tapu durumu', tur: 'secim', secenekler: TAPU, onerilen: true, zorunluKosullar: [
      { islemler: ['satilik', 'kiralik'] }, { islemler: ['devren-satilik'], tipler: ['daire', 'villa'] },
    ] }),
    a({ ad: 'cephe', anahtar: 'Cephe', etiket: 'Cepheler', tur: 'coklu', secenekler: CEPHE, tamGenislik: true }),
  ] },
  { kimlik: 'site-finans', baslik: 'Site ve koşullar', aciklama: 'Ortak kullanım, gider ve ticari koşullar.', alanlar: [
    a({ ad: 'site_icerisinde', anahtar: 'Site İçerisinde', etiket: 'Site içerisinde', tur: 'secim', secenekler: EVET_HAYIR, zorunluKosullar: [
      { islemler: ['satilik'], tipler: ['daire', 'rezidans', 'mustakil-ev', 'villa', 'yazlik', 'kooperatif'] },
      { islemler: ['kiralik'], tipler: ['daire', 'rezidans', 'mustakil-ev', 'villa'] },
      { islemler: ['gunluk-kiralik'], tipler: ['daire', 'rezidans', 'villa'] },
    ] }),
    a({ ad: 'site_adi', anahtar: 'Site / Proje Adı', etiket: 'Site / proje adı', tur: 'metin' }),
    a({ ad: 'asansor', anahtar: 'Asansör', etiket: 'Asansör', tur: 'secim', secenekler: VAR_YOK }),
    a({ ad: 'otopark', anahtar: 'Otopark', etiket: 'Otopark', tur: 'secim', secenekler: ['Açık ve Kapalı', 'Kapalı', 'Açık', 'Özel Garaj', 'Yok', 'Açık Otopark', 'Kapalı Otopark', 'Açık & Kapalı Otopark'].map((x) => s(x)), zorunluKosullar: [
      { islemler: ['satilik'], tipler: ['daire', 'rezidans', 'villa', 'yali-dairesi', 'kooperatif'] },
      { islemler: ['kiralik'], tipler: ['daire', 'rezidans', 'villa'] },
      { islemler: ['devren-satilik'], tipler: ['daire', 'villa'] },
      { islemler: ['gunluk-kiralik'], tipler: ['daire', 'rezidans'] },
    ] }),
    a({ ad: 'balkon', anahtar: 'Balkon', etiket: 'Balkon', tur: 'secim', secenekler: ['Var', 'Yok', 'Açık Balkon', 'Cam Balkon', 'Birden Fazla Balkon', 'Teras', 'Fransız Balkon'].map((x) => s(x)), zorunluKosullar: [
      { islemler: ['satilik'], tipler: ['daire', 'rezidans', 'mustakil-ev', 'ciftlik-evi', 'kosk-konak', 'yali', 'yali-dairesi', 'yazlik', 'kooperatif'] },
      { islemler: ['kiralik'], tipler: ['daire', 'rezidans', 'mustakil-ev', 'ciftlik-evi', 'kosk-konak', 'yali', 'yali-dairesi'] },
      { islemler: ['gunluk-kiralik'], tipler: ['daire', 'rezidans', 'mustakil-ev'] },
    ] }),
    GUNLUK_IZIN_BELGE_ALANI,
    a({ ad: 'yatak_sayisi_gunluk', anahtar: 'Yatak Sayısı', etiket: 'Yatak sayısı', tur: 'secim', secenekler: KISI_KAPASITESI, gerekli: true, islemler: ['gunluk-kiralik'], tipler: KONUT_GUNLUK_TIPLERI }),
    a({ ad: 'kalan_odeme_tutari', anahtar: 'Kalan Ödeme Tutarı', etiket: 'Kalan ödeme tutarı', tur: 'sayi', birim: '₺', enAz: 0, gerekli: true, islemler: ['devren-satilik'], tipler: ['daire', 'villa'] }),
    a({ ad: 'kalan_taksit', anahtar: 'Kalan Taksit', etiket: 'Kalan taksit sayısı', tur: 'sayi', enAz: 1, gerekli: true, islemler: ['devren-satilik'], tipler: ['daire', 'villa'] }),
    ...FINANS.filter((alan) => alan.ad !== 'takas'),
    { ...TAKAS_ALANI, gerekli: true, islemler: ['satilik'], tipler: KONUT_TAKAS_TIPLERI },
  ] },
];

const ARSA: AlanBolumu[] = [
  { kimlik: 'tapu-kadastro', baslik: 'Tapu ve kadastro', aciklama: 'Parseli tanımlayan resmi kayıt bilgileri.', alanlar: [
    a({ ad: 'm2_brut', anahtar: 'Toplam Parsel Alanı', etiket: 'Toplam parsel alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', onerilen: true, yardim: 'Hisse satılıyorsa aşağıdaki satılan hisse alanını ayrıca girin. Bilinmeyen ölçüyü tahmin etmeyin.', enAz: 1 }),
    a({ ad: 'hisse_m2', anahtar: 'Satılan Hisse Alanı', etiket: 'Satılan hisse alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', enAz: 1 }),
    a({ ad: 'ada', anahtar: 'Ada', etiket: 'Ada no', tur: 'metin', onerilen: true }),
    a({ ad: 'parsel', anahtar: 'Parsel', etiket: 'Parsel no', tur: 'metin', onerilen: true }),
    a({ ad: 'pafta', anahtar: 'Pafta', etiket: 'Pafta no', tur: 'metin' }),
    a({ ad: 'tapu_durumu', anahtar: 'Tapu Durumu', etiket: 'Tapu durumu', tur: 'secim', secenekler: TAPU, gerekli: true }),
    a({ ad: 'hisse_orani', anahtar: 'Hisse Oranı', etiket: 'Hisse oranı', tur: 'metin', yerTutucu: 'Örn. 1/2 veya tam' }),
    a({ ad: 'parsel_sekli', anahtar: 'Parsel Şekli', etiket: 'Parsel şekli', tur: 'secim', secenekler: ['Dikdörtgen', 'Kare', 'Üçgen', 'Düzensiz'].map((x) => s(x)) }),
  ] },
  { kimlik: 'imar-yapilasma', baslik: 'İmar ve yapılaşma', aciklama: 'Kaynağı ve tarihiyle birlikte plan bilgileri.', alanlar: [
    a({ ad: 'imar_durumu', anahtar: 'İmar Durumu', etiket: 'İmar durumu', tur: 'secim', secenekler: IMAR, gerekli: true }),
    a({ ad: 'kaks', anahtar: 'KAKS (Emsal)', etiket: 'KAKS / emsal', tur: 'ondalik', adim: '0.01', enAz: 0 }),
    a({ ad: 'taks', anahtar: 'TAKS', etiket: 'TAKS', tur: 'ondalik', adim: '0.01', enAz: 0 }),
    a({ ad: 'gabari', anahtar: 'Gabari', etiket: 'Gabari / yükseklik', tur: 'metin', yerTutucu: 'Örn. 6,50 m / 2 kat' }),
    a({ ad: 'kat_izni', anahtar: 'Kat İzni', etiket: 'Kat izni', tur: 'sayi', birim: 'kat', enAz: 0 }),
    a({ ad: 'imar_dogrulama', anahtar: 'İmar Bilgisi Durumu', etiket: 'Doğrulama durumu', tur: 'secim', secenekler: BILGI_DURUMU, gerekli: true }),
    a({ ad: 'imar_kaynagi', anahtar: 'İmar Bilgisi Kaynağı', etiket: 'Kaynak / belge adı', tur: 'metin', yerTutucu: 'Belediye imar durumu, plan notu…', tamGenislik: true }),
    a({ ad: 'imar_belge_tarihi', anahtar: 'İmar Belge Tarihi', etiket: 'Belge / kontrol tarihi', tur: 'tarih' }),
  ] },
  { kimlik: 'arsa-erisim', baslik: 'Fiziksel durum ve erişim', aciklama: 'Yol, cephe, eğim, altyapı ve kullanım.', alanlar: [
    a({ ad: 'yol_durumu', anahtar: 'Yol Durumu', etiket: 'Yol durumu', tur: 'secim', secenekler: ['Resmi kadastral yol', 'Asfalt / ana yol', 'Stabilize yol', 'Toprak yol', 'Açılmamış kadastral yol', 'Geçit hakkı', 'Yol yok'].map((x) => s(x)), onerilen: true }),
    a({ ad: 'yola_cephe', anahtar: 'Yola Cephe', etiket: 'Yola cephe', tur: 'ondalik', birim: 'm', enAz: 0 }),
    a({ ad: 'kose_parsel', anahtar: 'Köşe Parsel', etiket: 'Köşe parsel', tur: 'secim', secenekler: EVET_HAYIR }),
    a({ ad: 'zemin_yapisi', anahtar: 'Zemin Yapısı', etiket: 'Arazi eğimi', tur: 'secim', secenekler: ['Düz', 'Az Eğimli', 'Eğimli', 'Teraslanmış', 'Taşlık / Kayalık'].map((x) => s(x)) }),
    a({ ad: 'arazi_kullanim', anahtar: 'Mevcut Arazi Kullanımı', etiket: 'Mevcut kullanım', tur: 'metin', yerTutucu: 'Boş, ekili, bağ, meyvelik…' }),
    a({ ad: 'sulama', anahtar: 'Sulama Durumu', etiket: 'Sulama', tur: 'secim', secenekler: ['Şebeke', 'Kuyu', 'Kanal', 'Yağmur suyu', 'Yok', 'Bilinmiyor'].map((x) => s(x)) }), ...FINANS.filter((x) => x.ad !== 'aidat'),
  ] },
];

const ISYERI_TUM_ISLEMLER: IslemKimligi[] = ['satilik', 'kiralik', 'devren-satilik', 'devren-kiralik'];

const ISYERI: AlanBolumu[] = [
  { kimlik: 'ticari-alan', baslik: 'Alan ve fiziksel yapı', aciklama: 'Ticari kullanımı belirleyen ölçüler.', alanlar: [
    a({ ad: 'm2_brut', anahtar: 'Brüt Kullanım Alanı', etiket: 'Brüt kullanım alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', gerekli: true, enAz: 1 }),
    a({ ad: 'm2_net', anahtar: 'Net Kullanım Alanı', etiket: 'Net kullanım alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', onerilen: true, enAz: 1 }),
    a({ ad: 'kapali_alan', anahtar: 'Kapalı Alan', etiket: 'Kapalı alan', tur: 'ondalik', birim: 'm²', adim: '0.01', enAz: 0, zorunluKosullar: [
      { islemler: ['satilik', 'kiralik', 'devren-satilik', 'devren-kiralik'], tipler: ['akaryakit-istasyonu', 'ciftlik'] },
      { islemler: ['satilik', 'kiralik'], tipler: ['fabrika'] },
    ] }),
    a({ ad: 'm2_acik', anahtar: 'Açık Kullanım Alanı', etiket: 'Açık kullanım alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', enAz: 0, zorunluKosullar: [
      { islemler: ['satilik', 'kiralik', 'devren-satilik', 'devren-kiralik'], tipler: ['akaryakit-istasyonu', 'ciftlik'] },
      { islemler: ['satilik', 'kiralik'], tipler: ['fabrika'] },
    ] }),
    a({ ad: 'ticari_bolum', anahtar: 'Bölüm & Oda Sayısı', etiket: 'Bölüm ve oda sayısı', tur: 'sayi', enAz: 0, onerilen: true, tipler: ['apartman-dairesi', 'dukkan-magaza', 'fabrika', 'hamam-sauna-spa', 'is-hani-kati-ofisi', 'plaza-kati', 'rezidans-kati-ofisi', 'toplanti-etkinlik-salonu'], zorunluKosullar: [
      { islemler: ['satilik'], tipler: ['apartman-dairesi', 'dukkan-magaza', 'fabrika', 'hamam-sauna-spa', 'is-hani-kati-ofisi', 'plaza-kati', 'rezidans-kati-ofisi', 'toplanti-etkinlik-salonu'] },
      { islemler: ['kiralik'], tipler: ['apartman-dairesi', 'dukkan-magaza', 'fabrika', 'hamam-sauna-spa', 'is-hani-kati-ofisi', 'rezidans-kati-ofisi'] },
      { islemler: ['devren-satilik', 'devren-kiralik'], tipler: ['dukkan-magaza', 'hamam-sauna-spa', 'toplanti-etkinlik-salonu', 'fabrika'] },
    ] }),
    a({ ad: 'ticari_bolum_araligi', anahtar: 'Bölüm & Oda Sayısı', etiket: 'Bölüm ve oda sayısı', tur: 'secim', secenekler: ['1', '2', '3', '4', '5 ve üzeri'].map((x) => s(x)), tipler: ['atolye', 'imalathane'], zorunluKosullar: [
      { tipler: ['atolye'], islemler: ISYERI_TUM_ISLEMLER },
      { tipler: ['imalathane'], islemler: ['kiralik', 'devren-satilik', 'devren-kiralik'] },
    ] }),
    a({ ad: 'isyeri_banyo_sayisi', anahtar: 'Banyo Sayısı', etiket: 'Banyo sayısı', tur: 'sayi', enAz: 0, enFazla: 9, islemler: ['satilik', 'kiralik'], tipler: ['apartman-dairesi'], onerilen: true }),
    a({ ad: 'isyeri_durumu', anahtar: 'Durumu', etiket: 'İş yeri durumu', tur: 'secim', secenekler: ['Sıfır', 'İkinci El'].map((x) => s(x)), tipler: ['atolye', 'dukkan-magaza', 'garaj-park-yeri', 'imalathane', 'ofis-buro', 'okul', 'plaza', 'rezidans-kati-ofisi', 'villa'] }),
    a({ ad: 'bina_yasi', anahtar: 'Bina Yaşı', etiket: 'Bina yaşı', tur: 'secim', secenekler: YAS, gerekli: true, onerilen: true }),
    a({ ad: 'bulundugu_kat', anahtar: 'Bulunduğu Kat', etiket: 'Bulunduğu kat', tur: 'secim', secenekler: TICARI_KAT, onerilen: true, zorunluKosullar: [
      { islemler: ['satilik'], tipler: ['apartman-dairesi', 'is-hani-kati-ofisi', 'plaza-kati', 'rezidans-kati-ofisi', 'toplanti-etkinlik-salonu'] },
      { islemler: ['kiralik'], tipler: ['apartman-dairesi', 'is-hani-kati-ofisi', 'ofis-buro', 'plaza-kati', 'rezidans-kati-ofisi'] },
      { islemler: ['devren-satilik', 'devren-kiralik'], tipler: ['kuafor-berber', 'muayenehane', 'toplanti-etkinlik-salonu'] },
    ] }),
    a({ ad: 'kat_sayisi', anahtar: 'Kat Sayısı', etiket: 'Toplam kat', tur: 'sayi', enAz: 1 }),
    a({ ad: 'binadaki_kat_sayisi', anahtar: 'Binadaki Kat Sayısı', etiket: 'Binadaki kat sayısı', tur: 'sayi', enAz: 1, tipler: ['apartman-dairesi', 'is-hani-kati-ofisi'], zorunluKosullar: [{ islemler: ['kiralik'], tipler: ['apartman-dairesi', 'is-hani-kati-ofisi'] }] }),
    a({ ad: 'tavan_yuksekligi', anahtar: 'Tavan Yüksekliği', etiket: 'Tavan yüksekliği', tur: 'ondalik', birim: 'm', adim: '0.01', enAz: 0, tipler: ['depo-antrepo', 'fabrika', 'imalathane', 'atolye', 'soguk-hava-deposu', 'nakliyat-kargo', 'sebze-meyve-hali'] }),
    a({ ad: 'etkinlik_tavan_yuksekligi', anahtar: 'Tavan Yüksekliği (m)', etiket: 'Tavan yüksekliği', tur: 'ondalik', birim: 'm', adim: '0.01', enAz: 0, gerekli: true, islemler: ['satilik', 'devren-satilik', 'devren-kiralik'], tipler: ['toplanti-etkinlik-salonu'] }),
    a({ ad: 'giris_yuksekligi', anahtar: 'Giriş Yüksekliği', etiket: 'Giriş yüksekliği', tur: 'ondalik', birim: 'm', adim: '0.01', enAz: 0, onerilen: true, tipler: ['depo-antrepo', 'fabrika', 'soguk-hava-deposu'] }),
    a({ ad: 'atolye_giris_yuksekligi', anahtar: 'Giriş Yüksekliği (m)', etiket: 'Giriş yüksekliği', tur: 'ondalik', birim: 'm', adim: '0.01', enAz: 0, gerekli: true, tipler: ['atolye'] }),
    a({ ad: 'vitrin_genisligi', anahtar: 'Vitrin Genişliği', etiket: 'Vitrin genişliği', tur: 'ondalik', birim: 'm', adim: '0.01', enAz: 0, tipler: ['dukkan-magaza', 'avm-standi', 'eczane', 'elektronik-magazasi', 'giyim-magazasi', 'market', 'medikal-market', 'saat-magazasi', 'zuccaciye'] }),
    a({ ad: 'fabrika_bina_adedi', anahtar: 'Bina Adedi', etiket: 'Bina adedi', tur: 'sayi', enAz: 1, onerilen: true, tipler: ['fabrika'] }),
    a({ ad: 'ticari_bina_tipi', anahtar: 'Ticari Bina Tipi', etiket: 'Bina tipi', tur: 'secim', secenekler: ['Apartman', 'İş Hanı', 'Müstakil', 'Plaza', 'Villa'].map((x) => s(x)), tipler: ['komple-bina'] }),
  ] },
  { kimlik: 'ticari-teknik', baslik: 'Teknik altyapı ve kullanım', aciklama: 'Faaliyet uygunluğu, ruhsat ve işletme durumu.', alanlar: [
    a({ ad: 'elektrik_gucu', anahtar: 'Elektrik Gücü', etiket: 'Elektrik gücü', tur: 'ondalik', birim: 'kW', enAz: 0, tipler: ['depo-antrepo', 'fabrika', 'imalathane', 'atolye', 'akaryakit-istasyonu', 'enerji-santrali', 'matbaa', 'soguk-hava-deposu'] }),
    a({ ad: 'elektrik_faz', anahtar: 'Elektrik Fazı', etiket: 'Elektrik fazı', tur: 'secim', secenekler: ['Monofaze', 'Trifaze', 'Bilinmiyor'].map((x) => s(x)), tipler: ['depo-antrepo', 'fabrika', 'imalathane', 'atolye', 'akaryakit-istasyonu', 'enerji-santrali', 'matbaa', 'soguk-hava-deposu'] }),
    a({ ad: 'enerji_santrali_turu', anahtar: 'Santral Türü', etiket: 'Santral türü', tur: 'secim', secenekler: ['Biyokütle & Biyogaz', 'Güneş Enerjisi', 'Hidroelektrik', 'Jeotermal', 'Rüzgâr Enerjisi', 'Termik', 'Biyokütle & Biyogaz Enerji Santrali', 'Güneş Enerjisi Santrali', 'Hidroelektrik Santrali', 'Jeotermal Santral', 'Rüzgar Enerjisi Santrali', 'Termik Santral'].map((x) => s(x)), onerilen: true, tipler: ['enerji-santrali'], zorunluKosullar: [{ islemler: ['devren-satilik'], tipler: ['enerji-santrali'] }] }),
    a({ ad: 'isitma_tipi', anahtar: 'Isıtma Tipi', etiket: 'Isıtma', tur: 'secim', secenekler: ISITMA, gerekli: true, onerilen: true }),
    a({ ad: 'kiracili', anahtar: 'Kiracılı', etiket: 'Kiracılı mı?', tur: 'secim', secenekler: EVET_HAYIR, islemler: ['satilik'], tipler: ['akaryakit-istasyonu', 'apartman-dairesi', 'atolye', 'ciftlik', 'depo-antrepo', 'fabrika', 'hamam-sauna-spa', 'imalathane', 'is-hani-kati-ofisi', 'komple-bina', 'ofis-buro', 'otopark', 'plaza', 'plaza-kati', 'rezidans-kati-ofisi', 'spor-tesisi', 'villa'], onerilen: true }),
    a({ ad: 'isyeri_yapi_durumu', anahtar: 'Yapının Durumu', etiket: 'Yapının durumu', tur: 'secim', secenekler: ['Sıfır', 'İkinci El', 'İnşa Halinde', 'Yapım Aşamasında', 'Diğer'].map((x) => s(x)), islemler: ['satilik', 'kiralik'], tipler: ['apartman-dairesi', 'depo-antrepo', 'dukkan-magaza', 'fabrika', 'hamam-sauna-spa', 'is-hani-kati-ofisi', 'komple-bina', 'plaza-kati', 'spor-tesisi', 'toplanti-etkinlik-salonu', 'villa'], onerilen: true }),
    a({ ad: 'isyeri_asansor', anahtar: 'Asansör', etiket: 'Asansör', tur: 'secim', secenekler: VAR_YOK, islemler: ['kiralik'], tipler: ['komple-bina'] }),
    a({ ad: 'bufe_yapi_tipi', anahtar: 'Yapı Tipi', etiket: 'Yapı tipi', tur: 'secim', secenekler: ['Ahşap', 'Betonarme', 'Çelik', 'Kütük', 'Prefabrik'].map((x) => s(x)), islemler: ['devren-satilik', 'devren-kiralik'], tipler: ['bufe'] }),
    a({ ad: 'ruhsat_baca', anahtar: 'Ruhsat & Baca', etiket: 'Ruhsat / baca', tur: 'secim', secenekler: ['Ruhsatlı ve Bacalı', 'Ruhsatlı', 'Bacalı', 'Yok', 'Bilinmiyor'].map((x) => s(x)), tipler: ['restoran-kafe', 'bar', 'borekci', 'bufe', 'cay-ocagi', 'cig-kofteci', 'kafe', 'kantin', 'kasap', 'market', 'pastane-firin-tatlici', 'piknik-alani-kahvalti-bahcesi'] }),
    a({ ad: 'yukleme_alani', anahtar: 'Yükleme Alanı', etiket: 'Yükleme alanı / rampa', tur: 'secim', secenekler: VAR_YOK, tipler: ['depo-antrepo', 'fabrika', 'imalathane', 'atolye', 'soguk-hava-deposu', 'nakliyat-kargo', 'sebze-meyve-hali'] }),
    a({ ad: 'yuk_asansoru', anahtar: 'Yük Asansörü', etiket: 'Yük asansörü', tur: 'secim', secenekler: VAR_YOK, tipler: ['depo-antrepo', 'fabrika', 'imalathane', 'atolye', 'soguk-hava-deposu'] }),
    a({ ad: 'kullanim_durumu', anahtar: 'Kullanım Durumu', etiket: 'Kullanım durumu', tur: 'secim', secenekler: ['Boş', 'Mülk Sahibi Kullanıyor', 'Mülk Sahibi Oturuyor', 'Kiracı Oturuyor', 'Kiracılı', 'Faaliyette'].map((x) => s(x)) }),
    a({ ad: 'zemin_etudu', anahtar: 'Zemin Etüdü', etiket: 'Zemin etüdü', tur: 'secim', secenekler: VAR_YOK, tipler: ['apartman-dairesi', 'depo-antrepo', 'fabrika', 'is-hani-kati-ofisi', 'komple-bina', 'plaza-kati', 'prova-kayit-studyosu', 'villa'] }),
    a({ ad: 'hazir_ofis_kiralama_suresi', anahtar: 'Kiralama Süresi', etiket: 'Kiralama süresi', tur: 'secim', secenekler: ['Saatlik', 'Günlük', 'Haftalık', 'Aylık', 'Yıllık'].map((x) => s(x)), tipler: ['hazir-sanal-ofis'], islemler: ['kiralik'] }),
    a({ ad: 'hazir_ofis_sekreter', anahtar: 'Sekreter', etiket: 'Sekreter hizmeti', tur: 'secim', secenekler: VAR_YOK, tipler: ['hazir-sanal-ofis'], islemler: ['kiralik'] }),
    a({ ad: 'otopark_tipi', anahtar: 'Otopark Tipi', etiket: 'Otopark tipi', tur: 'secim', secenekler: ['Açık', 'Kapalı', 'Açık & Kapalı', 'Hepsi'].map((x) => s(x)), tipler: ['otopark'] }),
    a({ ad: 'pompa_sayisi', anahtar: 'Pompa Sayısı', etiket: 'Pompa sayısı', tur: 'sayi', enAz: 0, onerilen: true, tipler: ['akaryakit-istasyonu'], yardim: 'Pompa yoksa 0 girin. Bilgi kesin değilse boş bırakın.' }),
    a({ ad: 'gunluk_satis_litre', anahtar: 'Günlük Satış', etiket: 'Günlük akaryakıt satışı', tur: 'sayi', birim: 'L/gün', enAz: 0, onerilen: true, tipler: ['akaryakit-istasyonu'], zorunluKosullar: [{ islemler: ['satilik', 'kiralik', 'devren-satilik', 'devren-kiralik'], tipler: ['akaryakit-istasyonu'] }], yardim: 'Ortalama günlük satış miktarını litre olarak girin.' }),
    a({ ad: 'bayilik_durumu', anahtar: 'Bayilik Durumu', etiket: 'Marka / bayilik durumu', tur: 'secim', secenekler: ['Markalı faal bayi', 'Markasız / bağımsız', 'Bayilik devri görüşülür', 'Bilinmiyor'].map((x) => s(x)), tipler: ['akaryakit-istasyonu'] }),
    a({ ad: 'spor_tesisi_turu', anahtar: 'Spor Tesisi Türü', etiket: 'Spor tesisi türü', tur: 'secim', secenekler: ['Spor Salonu', 'Halı & Çim Saha', 'Komple Tesis', 'Yarış Pisti'].map((x) => s(x)), onerilen: true, tipler: ['spor-tesisi'], zorunluKosullar: [{ islemler: ['satilik'], tipler: ['spor-tesisi'] }] }),
    a({ ad: 'masa_sayisi', anahtar: 'Masa Sayısı', etiket: 'Masa sayısı', tur: 'sayi', enAz: 0, tipler: ['restoran-kafe', 'bar', 'dugun-salonu', 'kafe', 'kiraathane', 'pastane-firin-tatlici', 'piknik-alani-kahvalti-bahcesi'] }),
    a({ ad: 'kisi_kapasitesi', anahtar: 'Kişi Kapasitesi', etiket: 'Kişi kapasitesi', tur: 'sayi', birim: 'kişi', enAz: 1, tipler: ['restoran-kafe', 'bar', 'dugun-salonu', 'etkinlik-alani', 'gece-kulubu-disko', 'kafe', 'kiraathane', 'pastane-firin-tatlici', 'piknik-alani-kahvalti-bahcesi', 'sinema-konferans-salonu', 'hamam-sauna-spa'] }),
    a({ ad: 'spa_hizmet_cinsiyeti', anahtar: 'Hizmet Verilen Cinsiyet', etiket: 'Hizmet verilen cinsiyet', tur: 'secim', secenekler: ['Kadın', 'Erkek', 'Üniseks'].map((x) => s(x)), onerilen: true, tipler: ['hamam-sauna-spa'], zorunluKosullar: [{ islemler: ['devren-satilik'], tipler: ['hamam-sauna-spa'] }] }),
    a({ ad: 'isletme_kapasitesi', anahtar: 'Kapasite', etiket: 'İşletme kapasitesi', tur: 'sayi', enAz: 0, onerilen: true, tipler: ['internet-oyun-kafe', 'gece-kulubu-disko', 'toplanti-etkinlik-salonu'], yardim: 'İlan kaynağında kapasitenin ölçü birimi belirtilmiyor; doğrulayabildiğiniz sayıyı girin.' }),
    a({ ad: 'arac_kapasitesi', anahtar: 'Araç Kapasitesi', etiket: 'Araç kapasitesi', tur: 'sayi', birim: 'araç', enAz: 0, onerilen: true, tipler: ['otopark', 'garaj-park-yeri'], yardim: 'Otopark veya garajda aynı anda barındırılabilen araç sayısı.' }),
    a({ ad: 'yurt_oda_sayisi', anahtar: 'Oda Sayısı', etiket: 'Oda sayısı', tur: 'sayi', enAz: 0, onerilen: true, tipler: ['yurt'] }),
    a({ ad: 'yatak_sayisi', anahtar: 'Yatak Sayısı', etiket: 'Yatak sayısı', tur: 'sayi', enAz: 0, onerilen: true, tipler: ['yurt'] }),
    a({ ad: 'ticari_oda_duzeni', anahtar: 'Oda Düzeni', etiket: 'Oda düzeni', tur: 'secim', secenekler: ['1+0', '1+1', '1.5+1', '2+0', '2+1', '2+2', '3+0', '3+1', '3+2', '4+0', '4+1', '4+2', '5 ve üzeri'].map((x) => s(x)), onerilen: true, islemler: ['satilik', 'kiralik'], tipler: ['ofis-buro'] }),
    a({ ad: 'devren_ofis_oda_duzeni', anahtar: 'Oda Düzeni', etiket: 'Oda düzeni', tur: 'secim', secenekler: ['1+0', '1+1', '2+1', '2+2', '3+0', '3+1', '3+2', '4+0', '4+1', '4+2', '5 ve üzeri'].map((x) => s(x)), onerilen: true, islemler: ['devren-satilik', 'devren-kiralik'], tipler: ['ofis-buro'] }),
    a({ ad: 'anaokulu_oda_duzeni', anahtar: 'Oda Düzeni', etiket: 'Oda düzeni', tur: 'secim', secenekler: ['1+1', '2+1', '2+2', '3+1', '3+2', '4+1', '4+2', '5 ve üzeri'].map((x) => s(x)), onerilen: true, tipler: ['anaokulu-kres'] }),
    a({ ad: 'kuafor_oda_duzeni', anahtar: 'Oda Düzeni', etiket: 'Oda düzeni', tur: 'secim', secenekler: ['Yok', '1+0', '1+1', '2+1', '2+2', '3+1', '3+2', '4+1', '4+2', '5 ve üzeri'].map((x) => s(x)), onerilen: true, tipler: ['kuafor-berber'] }),
    a({ ad: 'guzellik_oda_duzeni', anahtar: 'Oda Düzeni', etiket: 'Oda düzeni', tur: 'secim', secenekler: ['1+0', '1+1', '2+1', '2+2', '3+0', '3+1', '3+2', '4+0', '4+1', '4+2', '5 ve üzeri'].map((x) => s(x)), tipler: ['guzellik-merkezi'] }),
    a({ ad: 'muayenehane_oda_duzeni', anahtar: 'Oda Sayısı', etiket: 'Oda düzeni', tur: 'secim', secenekler: ['1+1', '2+1', '2+2', '3+1', '3+2', '4+1', '4+2', '5 ve üzeri'].map((x) => s(x)), onerilen: true, tipler: ['muayenehane'] }),
    a({ ad: 'prova_oda_sayisi', anahtar: 'Oda Sayısı', etiket: 'Oda sayısı', tur: 'sayi', enAz: 0, tipler: ['prova-kayit-studyosu'], islemler: ['devren-kiralik'] }),
    a({ ad: 'plaza_depozito', anahtar: 'Depozito (TL)', etiket: 'Depozito', tur: 'sayi', birim: '₺', enAz: 0, tipler: ['plaza'], islemler: ['satilik', 'kiralik'] }),
    a({ ad: 'maden_isletme_ruhsati', anahtar: 'Maden İşletme Ruhsatı', etiket: 'Maden ruhsatı', tur: 'secim', secenekler: ['Var', 'Yok'].map((x) => s(x)), onerilen: true, tipler: ['maden-ocagi'] }),
    a({ ad: 'taksi_devir_kapsami', anahtar: 'Devredilen Hak ve Varlıklar', etiket: 'Devir kapsamı', tur: 'coklu', secenekler: ['Durak Hissesi', 'Taksi Plakası', 'Taksi Aracı', 'Ofis / İş Yeri', 'Ekipman'].map((x) => s(x)), onerilen: true, tipler: ['taksi-duragi'], yardim: 'Yalnızca sözleşme ve devir işlemine dahil olduğu doğrulanmış kalemleri seçin.' }),
    a({ ad: 'taksi_durak_hisse_payi', anahtar: 'Durak Hisse Payı', etiket: 'Durak hisse payı', tur: 'metin', yerTutucu: 'Örn. 1/4', onerilen: true, tipler: ['taksi-duragi'], yardim: 'Yalnız durak hissesi devrediliyorsa resmi kayıttaki pay oranını yazın.' }),
    a({ ad: 'derslik_sayisi', anahtar: 'Derslik Sayısı', etiket: 'Derslik sayısı', tur: 'sayi', enAz: 0, onerilen: true, tipler: ['okul', 'kurs-egitim-merkezi'] }),
    a({ ad: 'tapu_durumu', anahtar: 'Tapu Durumu', etiket: 'Tapu durumu', tur: 'secim', secenekler: TAPU, zorunluKosullar: [{ islemler: ['satilik', 'kiralik', 'devren-satilik'] }] }), ...FINANS,
  ] },
];

const BINA: AlanBolumu[] = [{ kimlik: 'bina-kapasite', baslik: 'Bina kapasitesi', aciklama: 'Büyüklük ve bağımsız bölüm dağılımı.', alanlar: [
  a({ ad: 'm2_brut', anahtar: 'Toplam Kapalı Alan', etiket: 'Toplam kapalı alan', tur: 'ondalik', birim: 'm²', adim: '0.01', gerekli: true, enAz: 1 }),
  a({ ad: 'arsa_m2', anahtar: 'Arsa Alanı', etiket: 'Arsa alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', enAz: 1 }),
  a({ ad: 'kat_sayisi', anahtar: 'Kat Sayısı', etiket: 'Kat sayısı', tur: 'sayi', gerekli: true, enAz: 1 }),
  a({ ad: 'bir_kattaki_daire', anahtar: 'Bir Kattaki Daire Sayısı', etiket: 'Bir kattaki daire sayısı', tur: 'sayi', enAz: 1, gerekli: true, tipler: ['apartman'] }),
  a({ ad: 'bagimsiz_bolum', anahtar: 'Bağımsız Bölüm Sayısı', etiket: 'Bağımsız bölüm', tur: 'sayi', enAz: 1 }),
  a({ ad: 'konut_adedi', anahtar: 'Konut Adedi', etiket: 'Konut adedi', tur: 'sayi', enAz: 0 }),
  a({ ad: 'ticari_adet', anahtar: 'Ticari Bölüm Adedi', etiket: 'Ticari bölüm adedi', tur: 'sayi', enAz: 0 }),
  a({ ad: 'bina_yasi', anahtar: 'Bina Yaşı', etiket: 'Bina yaşı', tur: 'secim', secenekler: YAS, gerekli: true }),
  a({ ad: 'isitma_tipi', anahtar: 'Isıtma Tipi', etiket: 'Isıtma', tur: 'secim', secenekler: ISITMA, gerekli: true }),
  a({ ad: 'asansor', anahtar: 'Asansör', etiket: 'Asansör', tur: 'secim', secenekler: VAR_YOK, gerekli: true }),
  a({ ad: 'otopark', anahtar: 'Otopark', etiket: 'Otopark', tur: 'secim', secenekler: ['Açık ve Kapalı', 'Kapalı', 'Açık', 'Yok', 'Açık Otopark', 'Kapalı Otopark', 'Açık & Kapalı Otopark'].map((x) => s(x)), gerekli: true }),
  a({ ad: 'iskan', anahtar: 'İskan Durumu', etiket: 'İskan', tur: 'secim', secenekler: ['Var', 'Yok', 'Başvuru Aşamasında', 'Bilinmiyor'].map((x) => s(x)) }),
  a({ ad: 'tapu_durumu', anahtar: 'Tapu Durumu', etiket: 'Tapu durumu', tur: 'secim', secenekler: TAPU, gerekli: true }), ...FINANS,
]}];

const KONAKLAMA_TIPLERI = ['otel', 'butik-otel', 'pansiyon', 'apart-otel', 'motel', 'tatil-koyu'];
const RESTORANLI_TIPLER = ['otel', 'butik-otel', 'tatil-koyu', 'restoranli-tesis'];
const TURISTIK: AlanBolumu[] = [{ kimlik: 'tesis-kapasite', baslik: 'Tesis kapasitesi', aciklama: 'Konaklama ve hizmet kapasitesi.', alanlar: [
  a({ ad: 'm2_brut', anahtar: 'Toplam Kapalı Alan', etiket: 'Kapalı alan', tur: 'ondalik', birim: 'm²', adim: '0.01', gerekli: true, enAz: 1, tipler: [...KONAKLAMA_TIPLERI, 'restoranli-tesis'] }),
  a({ ad: 'toplam_arazi_donum', anahtar: 'Toplam Arazi Alanı', etiket: 'Toplam arazi alanı', tur: 'ondalik', birim: 'dönüm', adim: '0.01', gerekli: true, enAz: 0.01, tipler: ['kamp-alani'] }),
  a({ ad: 'plaj_m2', anahtar: 'Plaj Alanı', etiket: 'Plaj alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', gerekli: true, enAz: 100, enFazla: 30000, tipler: ['plaj'] }),
  a({ ad: 'plaj_kapasite', anahtar: 'Plaj Kapasitesi', etiket: 'Kapasite', tur: 'sayi', enAz: 0, gerekli: true, tipler: ['plaj'] }),
  a({ ad: 'm2_acik', anahtar: 'Toplam Açık Alan', etiket: 'Açık alan', tur: 'ondalik', birim: 'm²', adim: '0.01', enAz: 0, gerekli: true, islemler: ['satilik', 'kiralik'], tipler: KONAKLAMA_TIPLERI }),
  a({ ad: 'arsa_m2', anahtar: 'Arsa Alanı', etiket: 'Arsa alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', enAz: 0 }),
  a({ ad: 'kat_sayisi', anahtar: 'Kat Sayısı', etiket: 'Kat sayısı', tur: 'sayi', enAz: 1, gerekli: true, tipler: KONAKLAMA_TIPLERI }),
  a({ ad: 'bina_yasi', anahtar: 'Bina Yaşı', etiket: 'Bina yaşı', tur: 'secim', secenekler: YAS, gerekli: true, tipler: KONAKLAMA_TIPLERI }),
  a({ ad: 'oda_adedi', anahtar: 'Oda Adedi', etiket: 'Oda adedi', tur: 'sayi', gerekli: true, enAz: 1, tipler: KONAKLAMA_TIPLERI }),
  a({ ad: 'yatak_kapasitesi', anahtar: 'Yatak Kapasitesi', etiket: 'Yatak kapasitesi', tur: 'sayi', enAz: 1, tipler: [...KONAKLAMA_TIPLERI, 'kamp-alani'] }),
  a({ ad: 'apart_sayisi', anahtar: 'Apart Sayısı', etiket: 'Apart sayısı', tur: 'sayi', enAz: 1, gerekli: true, tipler: ['apart-otel'] }),
  a({ ad: 'yildiz_sinifi', anahtar: 'Yıldız Sayısı', etiket: 'Yıldız sayısı', tur: 'secim', secenekler: ['1 Yıldız', '2 Yıldız', '3 Yıldız', '4 Yıldız', '5 Yıldız', '6 Yıldız', '7 Yıldız', 'Özel Belgeli', 'Sınıfsız', '1', '2', '3', '4', '5', '6', '7'].map((x) => s(x)), gerekli: true, tipler: ['otel', 'apart-otel', 'tatil-koyu'] }),
  a({ ad: 'zemin_etudu', anahtar: 'Zemin Etüdü', etiket: 'Zemin etüdü', tur: 'secim', secenekler: VAR_YOK, tipler: KONAKLAMA_TIPLERI }),
  a({ ad: 'oda_tipleri', anahtar: 'Oda Tipleri', etiket: 'Oda tipleri', tur: 'coklu', secenekler: ['Standart', 'Suit', 'Deluxe', 'Apart', 'Engelli Odası', 'Sigara İçilmeyen Oda'].map((x) => s(x)), tamGenislik: true, tipler: KONAKLAMA_TIPLERI }),
  a({ ad: 'restoran_kapasitesi', anahtar: 'Restoran Kapasitesi', etiket: 'Restoran kapasitesi', tur: 'sayi', birim: 'kişi', enAz: 0, tipler: RESTORANLI_TIPLER }),
  a({ ad: 'kamp_unite_adedi', anahtar: 'Kamp Ünitesi', etiket: 'Toplam kamp ünitesi', tur: 'sayi', enAz: 1, tipler: ['kamp-alani'], yardim: 'Çadır ve karavan için ayrılmış toplam konaklama birimi.' }),
  a({ ad: 'cadir_kapasitesi', anahtar: 'Çadır Kapasitesi', etiket: 'Çadır kapasitesi', tur: 'sayi', enAz: 0, tipler: ['kamp-alani'] }),
  a({ ad: 'karavan_kapasitesi', anahtar: 'Karavan Kapasitesi', etiket: 'Karavan kapasitesi', tur: 'sayi', enAz: 0, tipler: ['kamp-alani'] }),
  a({ ad: 'turizm_belgesi', anahtar: 'Turizm Belgesi', etiket: 'Turizm işletme belgesi', tur: 'secim', secenekler: ['Var', 'Yok', 'Başvuru Aşamasında', 'Bilinmiyor'].map((x) => s(x)) }),
  a({ ad: 'belge_no', anahtar: 'Turizm Belge No', etiket: 'Belge no', tur: 'metin', halkaAcik: false }),
  a({ ad: 'yapi_durumu', anahtar: 'Yapının Durumu', etiket: 'Yapının durumu', tur: 'secim', secenekler: ['Sıfır', 'İkinci El', 'Yapım Aşamasında', 'Restore Edildi', 'İnşa Halinde', 'İnşaa Halinde'].map((x) => s(x)), gerekli: true, tipler: KONAKLAMA_TIPLERI }),
  a({ ad: 'tapu_durumu', anahtar: 'Tapu Durumu', etiket: 'Tapu durumu', tur: 'secim', secenekler: TAPU, onerilen: true, zorunluKosullar: [
    { islemler: ['satilik'], tipler: ['otel', 'apart-otel', 'butik-otel', 'motel', 'pansiyon', 'kamp-alani', 'tatil-koyu'] },
    { islemler: ['kiralik'], tipler: ['otel', 'apart-otel', 'butik-otel', 'motel', 'pansiyon', 'kamp-alani', 'tatil-koyu', 'plaj'] },
  ] }),
  a({ ad: 'kullanim_durumu', anahtar: 'Kullanım Durumu', etiket: 'Faaliyet durumu', tur: 'secim', secenekler: ['Faaliyette', 'Sezonluk Faaliyette', 'Kapalı', 'Yapım Aşamasında'].map((x) => s(x)) }), ...FINANS,
]}];

const KONUT_PROJE_TIPLERI = ['konut-projesi', 'villa-projesi', 'karma-proje'];
const TICARI_PROJE_TIPLERI = ['ticari-proje', 'karma-proje'];
const PROJE: AlanBolumu[] = [{ kimlik: 'proje-takvim', baslik: 'Proje kapsamı ve takvim', aciklama: 'Ölçek, ilerleme ve teslim planı.', alanlar: [
  a({ ad: 'm2_brut', anahtar: 'Başlangıç Brüt Yapı Alanı', etiket: 'Başlangıç brüt yapı alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', gerekli: true, enAz: 1 }),
  a({ ad: 'arsa_m2', anahtar: 'Toplam Arsa Alanı', etiket: 'Toplam arsa alanı', tur: 'ondalik', birim: 'm²', adim: '0.01', enAz: 1 }),
  a({ ad: 'proje_asamasi', anahtar: 'Proje Aşaması', etiket: 'Proje aşaması', tur: 'secim', secenekler: ['Planlama', 'Ön Talep', 'Temel', 'Kaba İnşaat', 'İnce İşler', 'Teslime Hazır', 'Tamamlandı'].map((x) => s(x)), gerekli: true }),
  a({ ad: 'satis_durumu', anahtar: 'Satış Durumu', etiket: 'Satış durumu', tur: 'secim', secenekler: ['Ön talep toplanıyor', 'Satışta', 'Sınırlı ünite kaldı', 'Satış tamamlandı'].map((x) => s(x)), gerekli: true }),
  a({ ad: 'teslim_durumu', anahtar: 'Teslim Durumu', etiket: 'Teslim durumu', tur: 'secim', secenekler: ['Planlanıyor', 'Belirli tarihte teslim', 'Hemen teslim', 'Teslim edildi'].map((x) => s(x)), gerekli: true }),
  a({ ad: 'teslim_tarihi', anahtar: 'Teslim Tarihi', etiket: 'Planlanan teslim', tur: 'tarih' }),
  a({ ad: 'blok_sayisi', anahtar: 'Blok Sayısı', etiket: 'Blok sayısı', tur: 'sayi', enAz: 1 }),
  a({ ad: 'toplam_unite', anahtar: 'Toplam Ünite', etiket: 'Toplam ünite', tur: 'sayi', enAz: 1 }),
  a({ ad: 'konut_adedi', anahtar: 'Konut Adedi', etiket: 'Konut adedi', tur: 'sayi', enAz: 0, tipler: KONUT_PROJE_TIPLERI }),
  a({ ad: 'ticari_adet', anahtar: 'Ticari Ünite Adedi', etiket: 'Ticari ünite adedi', tur: 'sayi', enAz: 0, tipler: TICARI_PROJE_TIPLERI }),
  a({ ad: 'satilik_unite', anahtar: 'Satıştaki Ünite', etiket: 'Satıştaki ünite', tur: 'sayi', enAz: 0 }),
  a({ ad: 'daire_planlari', anahtar: 'Daire Planları', etiket: 'Satıştaki daire / bağımsız bölüm planları', tur: 'coklu', secenekler: [...ODA, s('Dükkan'), s('Ofis'), s('Villa')], tamGenislik: true }),
  a({ ad: 'satis_ofisi', anahtar: 'Satış Ofisi', etiket: 'Satış ofisi bilgisi', tur: 'metin', yerTutucu: 'Adres veya randevu notu', tamGenislik: true }),
  a({ ad: 'yuklenici', anahtar: 'Yüklenici', etiket: 'Yüklenici / geliştirici', tur: 'metin', tamGenislik: true }),
  a({ ad: 'ruhsat_durumu', anahtar: 'Ruhsat Durumu', etiket: 'Yapı ruhsatı', tur: 'secim', secenekler: ['Var', 'Yok', 'Başvuru Aşamasında', 'Bilinmiyor'].map((x) => s(x)) }),
  a({ ad: 'odeme_plani', anahtar: 'Ödeme Planı', etiket: 'Ödeme planı özeti', tur: 'uzun-metin', tamGenislik: true }), ...FINANS.filter((x) => !['depozito', 'kira_getirisi'].includes(x.ad)),
]}];

const DEVRE_MULK: AlanBolumu[] = [{
  kimlik: 'devre-mulk-bilgileri',
  baslik: 'Devre mülk bilgileri',
  aciklama: 'Tesis, dönem, bağımsız bölüm ve tapu bilgileri.',
  alanlar: [
    a({ ad: 'devre_mulk_tesisi', anahtar: 'Devre Mülk Tesisi', etiket: 'Devre mülk tesisi', tur: 'secim', secenekler: DEVRE_MULK_TESISLERI.map((x) => s(x)), gerekli: true }),
    a({ ad: 'devre_mulk_durumu', anahtar: 'Durumu', etiket: 'Devre mülk durumu', tur: 'secim', secenekler: ['Sıfır', 'İkinci El'].map((x) => s(x)), tipler: ['devre-mulk'] }),
    a({ ad: 'm2_brut', anahtar: 'Brüt Yapı Alanı', etiket: 'Brüt alan', tur: 'ondalik', birim: 'm²', adim: '0.01', gerekli: true, enAz: 1 }),
    a({ ad: 'm2_net', anahtar: 'Net Yapı Alanı', etiket: 'Net alan', tur: 'ondalik', birim: 'm²', adim: '0.01', gerekli: true, enAz: 1 }),
    a({ ad: 'devre_mulk_donem', anahtar: 'Devre Mülk Dönemi', etiket: 'Kullanım dönemi', tur: 'secim', secenekler: [...Array.from({ length: 52 }, (_, i) => s(`${i + 1}. hafta`)), s('Tüm Dönemler')], gerekli: true }),
    a({ ad: 'oda', anahtar: 'Oda Sayısı', etiket: 'Oda sayısı', tur: 'secim', secenekler: ['1', '2', '3', '4', '5'].map((x) => s(x)), gerekli: true }),
    a({ ad: 'tapu_durumu', anahtar: 'Tapu Durumu', etiket: 'Tapu durumu', tur: 'secim', secenekler: [
      'Kat Mülkiyetli', 'Kat İrtifaklı', 'Devre Mülk Tapulu', 'Hisseli Tapu', 'Müstakil Tapulu',
      'Arsa Tapulu', 'Kooperatif Hisseli Tapu', 'Yurt Dışı Tapulu', 'Tapu Kaydı Yok',
    ].map((x) => s(x)), gerekli: true }),
  ],
}];

const GUNLUK_KONAKLAMA: AlanBolumu[] = [{
  kimlik: 'gunluk-konaklama-bilgileri',
  baslik: 'Günlük konaklama bilgileri',
  aciklama: 'Turistik günlük kiralık devre mülk ve apart/pansiyon alanları.',
  alanlar: [
    GUNLUK_IZIN_BELGE_ALANI,
    a({ ad: 'gunluk_devre_mulk_tesisi', anahtar: 'Devre Mülk Tesisi', etiket: 'Devre mülk tesisi', tur: 'secim', secenekler: DEVRE_MULK_GUNLUK_TESISLERI.map((x) => s(x)), gerekli: true, tipler: ['devre-mulk'] }),
    a({ ad: 'gunluk_devre_mulk_donem', anahtar: 'Devre Mülk Dönemi', etiket: 'Kullanım dönemi', tur: 'secim', secenekler: Array.from({ length: 52 }, (_, i) => s(`${i + 1}. hafta`)), gerekli: true, tipler: ['devre-mulk'] }),
    a({ ad: 'gunluk_devre_mulk_sure', anahtar: 'Devre Mülk Süresi', etiket: 'Kullanım süresi', tur: 'secim', secenekler: ['7 Gün Altı', '7 Gün', '10 Gün', '15 Gün', '21 Gün', '1 Ay', '45 Gün'].map((x) => s(x)), gerekli: true, tipler: ['devre-mulk'] }),
    a({ ad: 'm2_brut', anahtar: 'Brüt Yapı Alanı', etiket: 'Brüt alan', tur: 'ondalik', birim: 'm²', adim: '0.01', gerekli: true, enAz: 1 }),
    a({ ad: 'm2_net', anahtar: 'Net Yapı Alanı', etiket: 'Net alan', tur: 'ondalik', birim: 'm²', adim: '0.01', gerekli: true, enAz: 1 }),
    a({ ad: 'oda', anahtar: 'Oda Sayısı', etiket: 'Oda sayısı', tur: 'secim', secenekler: ['1', '2', '3', '4', '5'].map((x) => s(x)), gerekli: true, tipler: ['devre-mulk'] }),
    a({ ad: 'apart_oda', anahtar: 'Oda Sayısı', etiket: 'Oda sayısı', tur: 'secim', secenekler: ['1', '2', '3', '4', '5', '6'].map((x) => s(x)), gerekli: true, tipler: ['apart-pansiyon'] }),
    a({ ad: 'kisi_kapasitesi', anahtar: 'Kişi Kapasitesi', etiket: 'Kişi kapasitesi', tur: 'secim', secenekler: Array.from({ length: 12 }, (_, i) => s(String(i + 1))), gerekli: true }),
    a({ ad: 'yatak_sayisi', anahtar: 'Yatak Sayısı', etiket: 'Yatak sayısı', tur: 'secim', secenekler: Array.from({ length: 12 }, (_, i) => s(String(i + 1))), gerekli: true }),
    a({ ad: 'banyo_sayisi', anahtar: 'Banyo Sayısı', etiket: 'Banyo sayısı', tur: 'secim', secenekler: ['1', '2', '3', '4', '5', '6 Üzeri'].map((x) => s(x)), gerekli: true }),
    a({ ad: 'bulundugu_kat', anahtar: 'Bulunduğu Kat', etiket: 'Bulunduğu kat', tur: 'secim', secenekler: KAT, gerekli: true, tipler: ['apart-pansiyon'] }),
    a({ ad: 'isitma_tipi', anahtar: 'Isıtma Tipi', etiket: 'Isıtma', tur: 'secim', secenekler: ISITMA, gerekli: true, tipler: ['apart-pansiyon'] }),
  ],
}];

export const KATEGORI_DONANIM_KATALOGU: Record<IlanGrupKimligi, DonanimGrubu[]> = {
  konut: [
    d('konut-ic', 'İç özellikler', 'Sabit iç mekân ve tesisat özellikleri.', [
      'ADSL', 'Fiber İnternet', 'Wi-Fi', 'Akıllı Ev Sistemi', 'Alarm (Hırsız)', 'Alarm (Yangın)',
      'Alaturka Tuvalet', 'Alüminyum Doğrama', 'Amerikan Kapı', 'Ankastre Fırın', 'Fırın',
      'Beyaz Eşya', 'Boyalı', 'Bulaşık Makinesi', 'Buzdolabı', 'Çamaşır Makinesi',
      'Çamaşır Kurutma Makinesi', 'Ebeveyn Banyosu', 'Duşakabin', 'Jakuzi', 'Küvet',
      'Hilton Banyo', 'Giyinme Odası', 'Gömme Dolap', 'Kiler', 'Çamaşır Odası', 'Vestiyer',
      'Şömine', 'Klima', 'Yerden Isıtma', 'Isıcam', 'Otomatik Panjur', 'Panjur / Jaluzi',
      'Görüntülü Diafon', 'Intercom Sistemi', 'Çelik Kapı', 'PVC Doğrama', 'Ahşap Doğrama',
      'Laminat Zemin', 'Parke', 'Seramik Zemin', 'Marley', 'Duvar Kağıdı', 'Kartonpiyer',
      'Spot Aydınlatma', 'Teras', 'Kapalı / Cam Balkon', 'Barbekü', 'Mobilya',
      'Mutfak (Ankastre)', 'Mutfak (Laminat)', 'Mutfak Doğalgazı', 'Set Üstü Ocak',
      'Sofben', 'Termosifon', 'Yüz Tanıma / Parmak İzi',
    ]),
    d('konut-dis', 'Dış özellikler', 'Bina, site ve ortak kullanım olanakları.', [
      'Araç Şarj İstasyonu', '24 Saat Güvenlik', 'Güvenlik', 'Apartman Görevlisi', 'Görevli',
      'Buhar Odası', 'Çocuk Oyun Parkı', 'Çocuk Oyun Alanı', 'Hamam', 'Sauna / Hamam',
      'Hidrofor', 'Isı Yalıtımı', 'Ses Yalıtımı', 'Jeneratör', 'Kablo TV', 'Uydu',
      'Kamera Sistemi', 'Köpek Parkı', 'Kreş', 'Müstakil Havuzlu', 'Özel Havuz',
      'Açık Havuz', 'Kapalı Havuz', 'Sauna', 'Siding', 'Spor Alanı', 'Spor Salonu',
      'Su Deposu', 'Tenis Kortu', 'Yangın Merdiveni',
    ]),
    d('konut-muhit', 'Muhit', 'Yakın çevrede doğrulanabilen yerler ve hizmetler.', [
      'Alışveriş Merkezi', 'Belediye', 'Cami', 'Cemevi', 'Denize Sıfır', 'Eczane',
      'Eğlence Merkezi', 'Fuar', 'Göle Sıfır', 'Hastane', 'Havra', 'İlkokul-Ortaokul',
      'İtfaiye', 'Kilise', 'Lise', 'Market', 'Park', 'Plaj', 'Polis Merkezi',
      'Sağlık Ocağı', 'Semt Pazarı', 'Spor Salonu Yakını', 'Şehir Merkezi', 'Üniversite',
    ]),
    d('konut-ulasim', 'Ulaşım', 'Yakındaki ulaşım bağlantıları.', [
      'Anayol', 'Avrasya Tüneli', 'Boğaz Köprüleri', 'Cadde', 'Deniz Otobüsü', 'Dolmuş',
      'E-5', 'Havaalanı', 'İskele', 'Marmaray', 'Metro', 'Metrobüs', 'Minibüs',
      'Otobüs Durağı', 'Sahil', 'TEM', 'Tramvay', 'Tren İstasyonu',
    ]),
    d('konut-manzara', 'Manzara', 'Taşınmazdan doğrudan görülen manzara.', [
      'Boğaz Manzarası', 'Deniz Manzarası', 'Doğa Manzarası', 'Göl Manzarası',
      'Havuz Manzarası', 'Nehir Manzarası', 'Park / Yeşil Alan Manzarası', 'Şehir Manzarası',
    ]),
    d('konut-erisim', 'Engelli ve yaşlı erişimi', 'Taşınmazda gerçekten bulunan erişilebilirlik özellikleri.', [
      'Erişilebilir Araç Park Yeri', 'Engelliye Uygun Asansör', 'Engelliye Uygun Banyo',
      'Engelliye Uygun Mutfak', 'Engelliye Uygun Park', 'Geniş Koridor', 'Giriş / Rampa',
      'Erişilebilir Merdiven', 'Geniş Oda Kapısı', 'Erişilebilir Priz / Elektrik Anahtarı',
      'Tutamak / Korkuluk', 'Engelliye Uygun Tuvalet', 'Engelliye Uygun Yüzme Havuzu',
    ]),
  ],
  arsa: [
    d('arsa-altyapi', 'Altyapı', 'Parsel sınırında veya yakınındaki bağlantılar.', ['Elektrik', 'Sanayi Elektriği', 'Şebeke Suyu', 'Kuyu Suyu', 'Kanalizasyon', 'Arıtma', 'Doğalgaz', 'Telefon', 'Fiber İnternet', 'Sondaj & Kuyu', 'Zemin Etüdü', 'Yolu Açılmış', 'Yolu Açılmamış', 'Yolu Yok']),
    d('arsa-konum', 'Konum', 'Ulaşım ve çevre avantajları.', ['Ana Yola Cephe', 'Köşe Parsel', 'Toplu Taşımaya Yakın', 'Yerleşime Yakın', 'Sanayi Bölgesine Yakın', 'Havaalanına Yakın', 'Denize Yakın', 'Şehir Merkezine Yakın']),
    d('arsa-nitelik', 'Genel özellikler', 'Fiziksel, hukuki ve tarımsal nitelikler.', ['İfrazlı', 'Tevhit Edilebilir', 'Projesi Hazır', 'Sulama Sistemi', 'Meyve Ağaçları', 'Ekili / Dikili', 'Çevrili / Tel Örgülü', 'Köşe Parsel']),
    d('arsa-manzara', 'Manzara', 'Parselden doğrudan görülen manzara.', ['Deniz Manzarası', 'Göl Manzarası', 'Doğa Manzarası', 'Orman Manzarası', 'Şehir Manzarası']),
  ],
  isyeri: [
    d('isyeri-kullanim', 'Kullanım konumu', 'Bağımsız bölümün yapı içindeki konumu.', ['Apartman Altı', 'İş Hanı İçinde', 'Çarşı & AVM İçinde', 'Müstakil', 'Plaza İçinde', 'Rezidans Altı', 'Cadde Üzeri', 'Köşe Konum']),
    d('isyeri-genel', 'Genel özellikler', 'Faaliyet ve müşteri kullanımını etkileyen sabit özellikler.', ['Alarm', 'Asma Kat', 'AVM İçi', 'Bahçe', 'Beyaz Eşya', 'Baca', 'İçki Ruhsatı', 'Klima', 'Mobilya', 'Mutfak', 'Müzik Sistemi', 'Otopark', 'WC', 'Wireless', 'Tabela Değeri Yüksek']),
    d('isyeri-teknik', 'Alt yapı', 'Faaliyete başlamayı kolaylaştıran teknik altyapı.', ['Trifaze Elektrik', 'Jeneratör', 'Yükleme Rampası', 'Yük Asansörü', 'Vinç Sistemi', 'Soğuk Hava Deposu', 'Yangın Sistemi', 'Fiber İnternet', 'Su Deposu', 'Hidrofor']),
    d('isyeri-yakinlik', 'Yakınlık', 'Müşteri ve lojistik erişiminde önemli noktalar.', ['Toplu Taşımaya Yakın', 'Ana Yola Yakın', 'Şehir Merkezinde', 'Havaalanına Yakın', 'Liman / İskeleye Yakın', 'Tır Girişi']),
    d('isyeri-manzara', 'Manzara', 'Bağımsız bölümden doğrudan görülen manzara.', ['Boğaz Manzarası', 'Deniz Manzarası', 'Doğa Manzarası', 'Şehir Manzarası']),
    d('isyeri-cephe', 'Cephe', 'Müşteri görünürlüğünü etkileyen cepheler.', ['Kuzey', 'Güney', 'Doğu', 'Batı', 'Kuzeydoğu', 'Kuzeybatı', 'Güneydoğu', 'Güneybatı']),
    d('isyeri-erisim', 'Erişim ve güvenlik', 'Müşteri, araç ve lojistik erişimi.', ['Açık Otopark', 'Kapalı Otopark', 'Güvenlik', 'Kamera Sistemi', 'Engelli Erişimi']),
  ],
  bina: [d('bina-donatim', 'Detay bilgisi', 'Ortak bina sistemleri ve konum avantajları.', ['Bahçe', 'Boğaz Manzarası', 'Deniz Manzarası', 'Güvenlik', 'Hidrofor', 'Jeneratör', 'Kablo TV / Uydu', 'Kapıcı', 'Site İçerisinde', 'Yangın Merdiveni', 'Asansör', 'Yük Asansörü', 'Kapalı Otopark', 'Açık Otopark', 'Su Deposu', 'Yangın Sistemi', 'Kamera Sistemi'])],
  turistik: [
    d('turistik-tesis', 'Tesis özellikleri', 'Konaklama ve işletmenin ana donatıları.', ['Açık Havuz', 'Kapalı Havuz', 'Spa', 'Hamam / Sauna', 'Resepsiyon', 'Oda Servisi', 'Çamaşırhane', 'Otopark', 'Jeneratör', 'Güvenlik', 'Engelli Erişimi']),
    d('turistik-yeme', 'Yeme & içme', 'Tesiste bulunan yeme içme birimleri.', ['Restoran', 'Açık Restoran', 'Kapalı Restoran', 'Bar', 'Kafe', 'Oda Kahvaltı', 'Her Şey Dahil', 'Alkollü İçecek Ruhsatı']),
    d('turistik-manzara', 'Manzara', 'Odalar veya ortak alanlardan görülen manzara.', ['Deniz Manzarası', 'Doğa Manzarası', 'Göl Manzarası', 'Havuz Manzarası', 'Şehir Manzarası']),
    d('turistik-cevre', 'Çevre aktiviteleri', 'Yakın çevrede sunulan aktiviteler.', ['Plaj', 'Tekne Turu', 'Doğa Yürüyüşü', 'Bisiklet', 'Kayak', 'Dalış', 'Balıkçılık']),
    d('turistik-aktivite', 'Tesis aktiviteleri', 'Tesiste sunulan spor ve eğlence olanakları.', ['Spor Salonu', 'Tenis Kortu', 'Çocuk Alanı', 'Animasyon', 'Su Sporları', 'Gece Eğlencesi']),
    d('turistik-toplanti', 'Toplantı & kongre', 'Kurumsal etkinlik altyapısı.', ['Toplantı Salonu', 'Kongre Salonu', 'Balo Salonu', 'Projeksiyon', 'Ses Sistemi']),
    d('turistik-yakinlik', 'Yakınlık', 'Konuk erişimini etkileyen önemli noktalar.', ['Denize Sıfır', 'Şehir Merkezinde', 'Havaalanına Yakın', 'Hastaneye Yakın', 'Alışveriş Merkezine Yakın']),
    d('turistik-ulasim', 'Ulaşım', 'Tesise erişim seçenekleri.', ['Ana Yol', 'Toplu Taşıma', 'Havaalanı Servisi', 'İskele', 'Otopark', 'Vale']),
  ],
  proje: [
    d('proje-sosyal', 'Proje olanakları', 'Teslim edilmesi planlanan ortak alanlar.', ['Açık Havuz', 'Kapalı Havuz', 'Spor Salonu', 'Çocuk Alanı', 'Peyzaj Alanı', 'Kapalı Otopark', 'Elektrikli Araç Şarjı', 'Güvenlik', 'Jeneratör', 'Engelli Erişimi', 'Yürüyüş Parkuru', 'Misafir Otoparkı', 'Sosyal Tesis', 'Ortak Çalışma Alanı']),
    d('proje-ulasim', 'Konum ve erişim', 'Projeye erişimi ve çevre bağlarını açıklayan unsurlar.', ['Metroya Yakın', 'Toplu Taşımaya Yakın', 'Ana Yola Yakın', 'Okula Yakın', 'Hastaneye Yakın', 'Alışveriş Alanına Yakın', 'Havaalanına Yakın', 'Sahile Yakın']),
  ],
  'devre-mulk': [],
  'gunluk-konaklama': [],
};

const tipler = (liste: string[], islemler?: IslemKimligi[]) => liste.map((x) => ({ deger: slugla(x), etiket: x, islemler }));
const benzersizTipler = (...listeler: MulkSecenek[][]): MulkSecenek[] => {
  const sonuc = new Map<string, MulkSecenek>();
  for (const secenek of listeler.flat()) {
    const onceki = sonuc.get(secenek.deger);
    if (!onceki) {
      sonuc.set(secenek.deger, secenek);
      continue;
    }
    sonuc.set(secenek.deger, {
      ...onceki,
      islemler: onceki.islemler && secenek.islemler
        ? [...new Set([...onceki.islemler, ...secenek.islemler])]
        : undefined,
    });
  }
  return [...sonuc.values()];
};

const KONUT_NORMAL_ISLEMLER: IslemKimligi[] = ['satilik', 'kiralik', 'gunluk-kiralik', 'sezonluk-kiralik'];
const KONUT_TIPLERI = [
  ...tipler(['Daire', 'Villa'], [...KONUT_NORMAL_ISLEMLER, 'devren-satilik']),
  ...tipler(['Rezidans', 'Müstakil Ev', 'Çiftlik Evi', 'Köşk & Konak', 'Yalı', 'Yalı Dairesi', 'Yazlık', 'Kooperatif', 'Köy Evi', 'Prefabrik Ev'], KONUT_NORMAL_ISLEMLER),
];

const ISYERI_MULK_ISLEMLERI: IslemKimligi[] = ['satilik', 'kiralik'];
const ISYERI_DEVIR_ISLEMLERI: IslemKimligi[] = ['devren-satilik', 'devren-kiralik'];
const ISYERI_CEKIRDEK_TIPLER: MulkSecenek[] = [
  { deger: 'dukkan-magaza', etiket: 'Dükkan & Mağaza', islemler: ISYERI_TUM_ISLEMLER },
  { deger: 'ofis-buro', etiket: 'Ofis & Büro', islemler: ISYERI_TUM_ISLEMLER },
  { deger: 'depo-antrepo', etiket: 'Depo & Antrepo', islemler: ISYERI_TUM_ISLEMLER },
  { deger: 'fabrika', etiket: 'Fabrika & Üretim Tesisi', islemler: ISYERI_TUM_ISLEMLER },
  { deger: 'imalathane', etiket: 'İmalathane', islemler: ISYERI_TUM_ISLEMLER },
  { deger: 'atolye', etiket: 'Atölye', islemler: ISYERI_TUM_ISLEMLER },
  { deger: 'plaza-kati', etiket: 'Plaza Katı & Ofisi', islemler: ISYERI_TUM_ISLEMLER },
  { deger: 'restoran-kafe', etiket: 'Restoran & Lokanta', islemler: ISYERI_TUM_ISLEMLER },
  { deger: 'akaryakit-istasyonu', etiket: 'Akaryakıt İstasyonu', islemler: ISYERI_TUM_ISLEMLER },
];
const ISYERI_MULK_TIPLERI = tipler([
  'Apartman Dairesi', 'Çiftlik', 'Garaj & Park Yeri', 'Hamam, Sauna & Spa', 'İş Hanı Katı & Ofisi',
  'Komple Bina', 'Maden Ocağı', 'Okul', 'Otopark', 'Pazar Yeri', 'Plaza', 'Rezidans Katı & Ofisi',
  'Spor Tesisi', 'Toplantı & Etkinlik Salonu', 'Villa', 'Hazır & Sanal Ofis',
], ISYERI_MULK_ISLEMLERI);
const ISYERI_DEVIR_TIPLERI = tipler([
  'Acente', 'Aktar & Baharatçı', 'Anaokulu & Kreş', 'Araç Galerisi & Servis', 'AVM Standı', 'Balıkçı',
  'Bar', 'Bijuteri & Takıcı', 'Börekçi', 'Büfe', 'Cep Telefonu Dükkanı', 'Çamaşırhane', 'Çay Ocağı',
  'Çiçekçi & Fidancılık', 'Çiftlik', 'Çiğ Köfteci', 'Çocuk Oyun Alanı', 'Düğün Salonu', 'Eczane', 'Elektrikçi & Hırdavatçı',
  'Elektronik Mağazası', 'Enerji Santrali', 'Etkinlik Alanı', 'Fatura Merkezi', 'Fotoğraf Stüdyosu', 'Gece Kulübü & Disko',
  'Giyim Mağazası', 'Gözlükçü', 'Güzellik Merkezi', 'Halı Yıkama', 'Hamam, Sauna & Spa', 'Huzur Evi',
  'İnternet & Oyun Kafe', 'İş Hanı', 'Kafe', 'Kantin', 'Kasap', 'Kıraathane', 'Kırtasiye', 'Kozmetik Mağazası',
  'Kuaför & Berber', 'Kurs & Eğitim Merkezi', 'Kuru Temizleme', 'Kuruyemişçi', 'Kuyumcu', 'Lunapark',
  'Maden Ocağı', 'Manav', 'Market', 'Matbaa', 'Medikal Market', 'Moda Evi', 'Muayenehane',
  'Nakliyat & Kargo', 'Nalbur', 'Okul', 'Oto Servis & Bakım', 'Oto Yedek Parçacı', 'Oto Yıkama & Kuaför',
  'Otopark', 'Pastane, Fırın & Tatlıcı', 'Pazar Yeri', 'Pet Shop', 'Piknik Alanı & Kahvaltı Bahçesi',
  'Prova & Kayıt Stüdyosu', 'Radyo İstasyonu & TV Kanalı', 'Saat Mağazası', 'Sağlık Merkezi',
  'Sebze & Meyve Hali', 'Sinema & Konferans Salonu', 'Soğuk Hava Deposu', 'Spor Tesisi', 'Su & Tüp Bayisi', 'Şans Oyunları Bayisi',
  'Şarküteri', 'Taksi Durağı', 'Tamirhane', 'Tekel Bayisi', 'Teknik Servis', 'Terzi',
  'Toplantı & Etkinlik Salonu', 'Tuhafiye', 'Tuvalet', 'Veteriner', 'Yurt', 'Züccaciye',
], ISYERI_DEVIR_ISLEMLERI).map((secenek) => ({
  ...secenek,
  etiket: ({
    'arac-galerisi-servis': 'Araç Showroom & Servis',
    'cicekci-fidancilik': 'Çiçekçi & Fidanlık',
    eczane: 'Eczane & Medikal',
    'etkinlik-alani': 'Etkinlik & Performans Salonu',
    'moda-evi': 'Modaevi',
    'piknik-alani-kahvalti-bahcesi': 'Kır & Kahvaltı Bahçesi',
    yurt: 'Öğrenci Yurdu',
  } as Record<string, string>)[secenek.deger] ?? secenek.etiket,
}));
const ISYERI_TIPLERI = benzersizTipler(ISYERI_CEKIRDEK_TIPLER, ISYERI_MULK_TIPLERI, ISYERI_DEVIR_TIPLERI);

export const ILAN_GRUPLARI: IlanGrupSemasi[] = [
  { kimlik: 'konut', etiket: 'Konut', kisaEtiket: 'Konut', aciklama: 'Daire, villa ve yaşam alanları.', altTipler: KONUT_TIPLERI, islemler: [...KONUT_NORMAL_ISLEMLER, 'devren-satilik'], bolumler: KONUT, donanimGruplari: KATEGORI_DONANIM_KATALOGU.konut },
  { kimlik: 'arsa', etiket: 'Arsa ve Arazi', kisaEtiket: 'Arsa', aciklama: 'İmarlı arsa, tarla ve yatırım arazileri.', altTipler: tipler(['Konut İmarlı Arsa', 'Villa İmarlı Arsa', 'Ticari İmarlı Arsa', 'Sanayi İmarlı Arsa', 'Tarla', 'Bağ', 'Bahçe', 'Zeytinlik', 'Çiftlik Arazisi', 'Depolama / Lojistik Arsası']), islemler: ['satilik', 'kiralik', 'kat-karsiligi-satilik'], bolumler: ARSA, donanimGruplari: KATEGORI_DONANIM_KATALOGU.arsa },
  { kimlik: 'isyeri', etiket: 'İş Yeri', kisaEtiket: 'İş Yeri', aciklama: 'Mağaza, ofis, depo, üretim alanı ve devren işletmeler.', altTipler: ISYERI_TIPLERI, islemler: ISYERI_TUM_ISLEMLER, bolumler: ISYERI, donanimGruplari: KATEGORI_DONANIM_KATALOGU.isyeri },
  { kimlik: 'bina', etiket: 'Komple Bina', kisaEtiket: 'Bina', aciklama: 'Konut, ticari veya karma komple yapılar.', altTipler: tipler(['Apartman', 'İş Hanı', 'Plaza', 'Karma Kullanımlı Bina', 'Müstakil Bina']), islemler: ['satilik', 'kiralik'], bolumler: BINA, donanimGruplari: KATEGORI_DONANIM_KATALOGU.bina },
  { kimlik: 'turistik', etiket: 'Turistik Tesis', kisaEtiket: 'Turistik', aciklama: 'Otel, pansiyon, kamp yeri ve plaj işletmeleri.', altTipler: [...tipler(['Otel', 'Butik Otel', 'Pansiyon', 'Apart Otel', 'Motel', 'Tatil Köyü', 'Kamp Alanı', 'Restoranlı Tesis']), { ...s('plaj', 'Plaj'), islemler: ['kiralik'] }], islemler: ['satilik', 'kiralik', 'gunluk-kiralik', 'sezonluk-kiralik', 'devren-satilik', 'devren-kiralik'], bolumler: TURISTIK, donanimGruplari: KATEGORI_DONANIM_KATALOGU.turistik },
  { kimlik: 'proje', etiket: 'Konut Projesi', kisaEtiket: 'Proje', aciklama: 'Çoklu bağımsız bölümlü yeni projeler.', altTipler: tipler(['Konut Projesi', 'Villa Projesi', 'Karma Proje', 'Ticari Proje']), islemler: ['satilik'], bolumler: PROJE, donanimGruplari: KATEGORI_DONANIM_KATALOGU.proje },
  { kimlik: 'devre-mulk', etiket: 'Devre Mülk', kisaEtiket: 'Devre Mülk', aciklama: 'Dönemli kullanım hakkı ve tesis bilgileri.', altTipler: tipler(['Devre Mülk']), islemler: ['satilik'], bolumler: DEVRE_MULK, donanimGruplari: KATEGORI_DONANIM_KATALOGU['devre-mulk'] },
  { kimlik: 'gunluk-konaklama', etiket: 'Turistik Günlük Konaklama', kisaEtiket: 'Günlük Konaklama', aciklama: 'Günlük kiralık devre mülk ve apart/pansiyon.', altTipler: tipler(['Devre Mülk', 'Apart & Pansiyon']), islemler: ['gunluk-kiralik'], bolumler: GUNLUK_KONAKLAMA, donanimGruplari: KATEGORI_DONANIM_KATALOGU['gunluk-konaklama'] },
];

/** Kaynak Sahibinden tam formu bulunmayan, nadir profiller yeni ilan girişinde sunulmaz. */
export const YENI_ILAN_GIZLI_PROFILLER: ReadonlyArray<{ grup: string; islem: string; tip: string }> = [
  { grup: 'isyeri', islem: 'devren-satilik', tip: 'fatura-merkezi' },
  { grup: 'isyeri', islem: 'devren-kiralik', tip: 'fatura-merkezi' },
  ...(['satilik', 'kiralik', 'gunluk-kiralik', 'sezonluk-kiralik', 'devren-satilik', 'devren-kiralik'] as const)
    .map((islem) => ({ grup: 'turistik', islem, tip: 'restoranli-tesis' })),
  ...(['konut-projesi', 'villa-projesi', 'karma-proje', 'ticari-proje'] as const)
    .map((tip) => ({ grup: 'proje', islem: 'satilik', tip })),
];

export function yeniIlanProfiliniDestekleniyor(grup: string, islem: string, tip: string): boolean {
  return !YENI_ILAN_GIZLI_PROFILLER.some((profil) => profil.grup === grup && profil.islem === islem && profil.tip === tip);
}

/** Yeni ilan formundaki seçenekleri kaynak formu doğrulanmış profillerle sınırlar. */
export function yeniIlanFormGruplari(): IlanGrupSemasi[] {
  return ILAN_GRUPLARI.map((grup) => ({
    ...grup,
    altTipler: grup.altTipler.flatMap((tip) => {
      const islemler = (tip.islemler?.length ? tip.islemler : grup.islemler)
        .filter((islem) => yeniIlanProfiliniDestekleniyor(grup.kimlik, islem, tip.deger));
      return islemler.length ? [{ ...tip, islemler }] : [];
    }),
  })).filter((grup) => grup.altTipler.length > 0);
}

export const TIP_GRUPLARI = ILAN_GRUPLARI.map((g) => s(g.kimlik, g.etiket));
export const MULK_TIPLERI = Object.fromEntries(ILAN_GRUPLARI.map((g) => [g.kimlik, g.altTipler]));
export const DONANIM_KATALOGU = ILAN_GRUPLARI.flatMap((g) => g.donanimGruplari);

export function grupSemasi(kimlik: string): IlanGrupSemasi {
  const uyarlanmis = kimlik === 'diger' ? 'turistik' : kimlik;
  return ILAN_GRUPLARI.find((g) => g.kimlik === uyarlanmis) ?? ILAN_GRUPLARI[0];
}
/** Kaynakta eşleşen alt kategori varsa gerçek form gruplarını, yoksa EDM grubunu kullanır. */
export function donanimGruplariSec(tipGrup: string, islem: string, tip: string): DonanimGrubu[] {
  const sema = grupSemasi(tipGrup);
  const tipEtiketi = sema.altTipler.find((secenek) => secenek.deger === tip)?.etiket ?? tip;
  return sahibindenDetayGruplari(sema.kimlik, islem, tip, tipEtiketi) ?? sema.donanimGruplari;
}
export function formTipDegeri(grup: string, tip: string): string {
  const sema = grupSemasi(grup);
  const kanonik = slugla(tip);
  const dogrudan = sema.altTipler.find((secenek) => secenek.deger === kanonik);
  if (dogrudan) return dogrudan.deger;

  const portalEslemeleri: Record<string, Record<string, string>> = {
    arsa: {
      'toplu-konut-icin': 'konut-imarli-arsa',
      'konut-imarli': 'konut-imarli-arsa',
      'villa-imarli': 'villa-imarli-arsa',
      'ticari-imarli': 'ticari-imarli-arsa',
      'sanayi-imarli': 'sanayi-imarli-arsa',
      'depolama-lojistik': 'depolama-lojistik-arsasi',
    },
  };
  const eslenen = portalEslemeleri[sema.kimlik]?.[kanonik];
  if (eslenen && sema.altTipler.some((secenek) => secenek.deger === eslenen)) return eslenen;
  return sema.altTipler[0].deger;
}
export function islemEtiketi(islem: string): string { return ISLEM_TURLERI.find((i) => i.deger === islem)?.etiket ?? 'Satılık' }
export function tipEtiketi(grup: string, tip: string): string { return grupSemasi(grup).altTipler.find((t) => t.deger === tip)?.etiket ?? tip }

export interface AyrintiliIlanGirdisi {
  baslik: string; aciklama: string; fiyat: number | null; paraBirimi: string; islem: string;
  kategori: string; tip: string; tipGrup: string; oda: string | null; m2: number | null;
  il: string | null; ilce: string | null; mahalle: string | null; danismanSlug: string | null;
  ozellikler: Record<string, string>; donanim: string[]; gorseller: string[];
}
export interface IlanDogrulamaHatasi { alan: string; mesaj: string }
export class IlanFormHatasi extends Error {
  alanlar: IlanDogrulamaHatasi[];
  constructor(alanlar: IlanDogrulamaHatasi[]) { super(alanlar[0]?.mesaj ?? 'İlan bilgileri doğrulanamadı.'); this.name = 'IlanFormHatasi'; this.alanlar = alanlar }
}
const metin = (form: FormData, ad: string, sinir = 500) => String(form.get(ad) ?? '').trim().slice(0, sinir);
const sayi = (form: FormData, ad: string, binlikAyracli = false): number | null => {
  const ilk = metin(form, ad, 40);
  if (!ilk) return null;
  const ham = binlikAyracli ? ilk.replace(/\./g, '').replace(',', '.') : ilk.replace(',', '.');
  const n = Number(ham);
  return Number.isFinite(n) ? n : null;
};

export function formDegerleriniOku(form: FormData): Record<string, string | string[]> {
  const sonuc: Record<string, string | string[]> = {};
  for (const [anahtar, deger] of form.entries()) {
    if (deger instanceof File) continue;
    const v = String(deger);
    const onceki = sonuc[anahtar];
    if (onceki === undefined) sonuc[anahtar] = v;
    else sonuc[anahtar] = Array.isArray(onceki) ? [...onceki, v] : [onceki, v];
  }
  return sonuc;
}

/** Formu kategori şemasına göre temizler ve sunucuda doğrular. */
export function formdanIlanVerisi(form: FormData): AyrintiliIlanGirdisi {
  const hatalar: IlanDogrulamaHatasi[] = [];
  const baslik = metin(form, 'baslik', 64), aciklama = metin(form, 'aciklama', 8000);
  const fiyat = sayi(form, 'fiyat', true), il = metin(form, 'il', 80), ilce = metin(form, 'ilce', 80), mahalle = metin(form, 'mahalle', 120);
  const tipGrup = metin(form, 'tip_grup', 30), sema = ILAN_GRUPLARI.find((g) => g.kimlik === tipGrup);
  const islem = metin(form, 'islem', 30) as IslemKimligi, tip = metin(form, 'tip', 80);
  if (!sema) hatalar.push({ alan: 'tip_grup', mesaj: 'Geçerli bir mülk grubu seçin.' });
  if (baslik.length < 10) hatalar.push({ alan: 'baslik', mesaj: 'İlan başlığı en az 10 karakter olmalı.' });
  if (islem !== 'kat-karsiligi-satilik' && (!fiyat || fiyat <= 0)) hatalar.push({ alan: 'fiyat', mesaj: 'Sıfırdan büyük bir fiyat girin.' });
  if (!sema?.islemler.includes(islem)) hatalar.push({ alan: 'islem', mesaj: 'Bu mülk grubu için geçerli bir işlem türü seçin.' });
  const tipSecenegi = sema?.altTipler.find((t) => t.deger === tip);
  if (!tipSecenegi) hatalar.push({ alan: 'tip', mesaj: 'Mülk grubuna ait bir alt tür seçin.' });
  else if (tipSecenegi.islemler?.length && !tipSecenegi.islemler.includes(islem)) hatalar.push({ alan: 'tip', mesaj: 'Bu alt mülk türü seçilen işlem için kullanılamaz.' });
  if (!il) hatalar.push({ alan: 'il', mesaj: 'İl bilgisi zorunludur.' });
  if (!ilce) hatalar.push({ alan: 'ilce', mesaj: 'İlçe bilgisi zorunludur.' });
  if (!mahalle) hatalar.push({ alan: 'mahalle', mesaj: 'Mahalle bilgisi zorunludur.' });
  if (aciklama.length < 80) hatalar.push({ alan: 'aciklama', mesaj: 'Açıklama en az 80 karakter olmalı.' });

  const ozellikler: Record<string, string> = {};
  const kimden = kimdenAlaniniSec(tipGrup, islem, tip);
  const alanlar = [...(sema?.bolumler.flatMap((b) => b.alanlar) ?? []), kimden, ...YETKI_ALANLARI, ...KONUM_YONETIM_ALANLARI, ...MEDYA_PORTAL_ALANLARI];
  const mevcutAlanDegerleri = formDegerleriniOku(form);
  for (const alan of alanlar) {
    if (alan.islemler && !alan.islemler.includes(islem)) continue;
    if (alan.tipler && !alan.tipler.includes(tip)) continue;
    const cokluDegerler = form.getAll(alan.ad).map(String).map((v) => v.trim()).filter(Boolean);
    let ham = alan.tur === 'coklu' ? cokluDegerler.join(', ') : metin(form, alan.ad, alan.tur === 'uzun-metin' ? 2000 : 500);
    // Eski taslaklar bu ortak alan eklenmeden önce kaydedildi. Geriye dönük
    // uyumluluk için yalnızca alan hiç gönderilmediyse ofis kaynağını varsay.
    if (alan.ad === KIMDEN_ALANI.ad && !form.has(alan.ad)) ham = kimden.secenekler?.[0]?.deger ?? 'Emlak Ofisinden';
    if (alanGerekliMi(alan, islem, tip, tipGrup, mevcutAlanDegerleri) && !ham) hatalar.push({ alan: alan.ad, mesaj: `${alan.etiket} zorunludur.` });
    if (ham && alan.secenekler) {
      const izinli = new Set(alan.secenekler.map((s) => s.deger));
      const gecersiz = alan.tur === 'coklu' ? cokluDegerler.some((v) => !izinli.has(v)) : !izinli.has(ham);
      if (gecersiz) hatalar.push({ alan: alan.ad, mesaj: `${alan.etiket} için geçerli bir seçenek belirleyin.` });
    }
    if (ham && ['sayi', 'ondalik'].includes(alan.tur)) {
      const n = Number(ham.replace(',', '.'));
      if (!Number.isFinite(n)) hatalar.push({ alan: alan.ad, mesaj: `${alan.etiket} sayısal bir değer olmalı.` });
      else if (alan.enAz != null && n < alan.enAz) hatalar.push({ alan: alan.ad, mesaj: `${alan.etiket} en az ${alan.enAz} olmalı.` });
      else if (alan.enFazla != null && n > alan.enFazla) hatalar.push({ alan: alan.ad, mesaj: `${alan.etiket} en fazla ${alan.enFazla} olmalı.` });
    }
    if (ham && alan.ad.endsWith('_url')) {
      try { const url = new URL(ham); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); }
      catch { hatalar.push({ alan: alan.ad, mesaj: `${alan.etiket} geçerli bir http veya https adresi olmalı.` }); }
    }
    const yazilacak = ham && ['sayi', 'ondalik'].includes(alan.tur)
      ? Number(ham.replace(',', '.')).toLocaleString('tr-TR', { maximumFractionDigits: 6 }) : ham;
    if (ham) ozellikler[alan.anahtar] = alan.birim ? `${yazilacak} ${alan.birim}` : yazilacak;
  }
  const brutAlan = sayi(form, 'm2_brut');
  const netAlan = sayi(form, 'm2_net');
  const hisseAlani = sayi(form, 'hisse_m2');
  const konutArsaAlani = tipGrup === 'konut' && KONUT_ARSA_ALANI_TIPLERI.includes(tip) ? sayi(form, 'arsa_m2') : undefined;
  if (tipGrup === 'konut' && !brutAlan && !netAlan && !konutArsaAlani) {
    hatalar.push({ alan: 'm2_brut', mesaj: 'En az bir doğrulanmış brüt yapı, net yapı veya arsa alanı girin.' });
  }
  if (tipGrup === 'arsa' && !brutAlan && !hisseAlani) {
    hatalar.push({ alan: 'm2_brut', mesaj: 'Toplam parsel veya satılan hisse alanından en az birini girin.' });
  }
  if (tipGrup !== 'arsa' && brutAlan && netAlan && netAlan > brutAlan) {
    hatalar.push({ alan: 'm2_net', mesaj: 'Net kullanım alanı brüt alandan büyük olamaz.' });
  }
  if (tipGrup === 'arsa' && brutAlan && hisseAlani && hisseAlani > brutAlan) {
    hatalar.push({ alan: 'hisse_m2', mesaj: 'Satılan hisse alanı toplam parsel alanından büyük olamaz.' });
  }
  if (tipGrup === 'proje') {
    const toplamUnite = sayi(form, 'toplam_unite') ?? 0;
    const satilikUnite = sayi(form, 'satilik_unite') ?? 0;
    const konutAdedi = KONUT_PROJE_TIPLERI.includes(tip) ? sayi(form, 'konut_adedi') ?? 0 : 0;
    const ticariAdet = TICARI_PROJE_TIPLERI.includes(tip) ? sayi(form, 'ticari_adet') ?? 0 : 0;
    if (toplamUnite > 0 && satilikUnite > toplamUnite) {
      hatalar.push({ alan: 'satilik_unite', mesaj: 'Satıştaki ünite toplam ünite sayısından büyük olamaz.' });
    }
    if (toplamUnite > 0 && konutAdedi + ticariAdet > toplamUnite) {
      hatalar.push({ alan: 'toplam_unite', mesaj: 'Konut ve ticari ünite toplamı toplam ünite sayısından büyük olamaz.' });
    }
    if (metin(form, 'teslim_durumu') === 'Belirli tarihte teslim' && !metin(form, 'teslim_tarihi')) {
      hatalar.push({ alan: 'teslim_tarihi', mesaj: 'Belirli tarihte teslim edilen projede teslim tarihi girin.' });
    }
  }
  if (metin(form, 'imar_dogrulama') === 'dogrulandi') {
    if (!metin(form, 'imar_kaynagi')) hatalar.push({ alan: 'imar_kaynagi', mesaj: 'Doğrulanmış imar bilgisi için kaynak girin.' });
    if (!metin(form, 'imar_belge_tarihi')) hatalar.push({ alan: 'imar_belge_tarihi', mesaj: 'Doğrulanmış imar bilgisi için kontrol tarihini girin.' });
  }
  if (islem === 'sezonluk-kiralik') {
    const baslangic = metin(form, 'sezon_baslangic');
    const bitis = metin(form, 'sezon_bitis');
    if (baslangic && bitis && baslangic > bitis) {
      hatalar.push({ alan: 'sezon_bitis', mesaj: 'Sezon bitişi başlangıç tarihinden önce olamaz.' });
    } else if (baslangic && bitis) {
      const minimumHafta = sayi(form, 'minimum_sezon_suresi') ?? 0;
      const sezonGunleri = Math.floor((Date.parse(`${bitis}T12:00:00Z`) - Date.parse(`${baslangic}T12:00:00Z`)) / 86_400_000) + 1;
      if (minimumHafta > 0 && minimumHafta * 7 > sezonGunleri) {
        hatalar.push({ alan: 'minimum_sezon_suresi', mesaj: 'Minimum kiralama süresi sezon tarih aralığından uzun olamaz.' });
      }
    }
  }
  if (!metin(form, 'yetki_durumu')) hatalar.push({ alan: 'yetki_durumu', mesaj: 'İlan verme yetkisinin durumunu seçin.' });
  const kesinEnlemHam = metin(form, 'kesin_enlem');
  const kesinBoylamHam = metin(form, 'kesin_boylam');
  if (Boolean(kesinEnlemHam) !== Boolean(kesinBoylamHam)) {
    hatalar.push({ alan: kesinEnlemHam ? 'kesin_boylam' : 'kesin_enlem', mesaj: 'Kesin konum için enlem ve boylam birlikte girilmelidir.' });
  }
  if (metin(form, 'kamu_konum_duzeyi') === 'yaklasik' && (!kesinEnlemHam || !kesinBoylamHam)) {
    hatalar.push({ alan: 'kamu_konum_duzeyi', mesaj: 'Kesin pinden yaklaşık alan üretmek için enlem ve boylam gereklidir.' });
  }

  const seciliGruplar = sema ? donanimGruplariSec(tipGrup, islem, tip) : [];
  const izinliDonanim = new Set([...seciliGruplar, ...(sema?.donanimGruplari ?? [])].flatMap((g) => g.ogeListesi));
  const seciliDonanim = [...new Set(form.getAll('donanim').map(String).filter((x) => izinliDonanim.has(x)))];
  const secimYok = new Set(form.getAll('donanim_secim_yok').map(String));
  for (const grup of seciliGruplar) {
    if (grup.gerekli && !grup.ogeListesi.some((oge) => seciliDonanim.includes(oge)) && !secimYok.has(grup.kimlik)) {
      hatalar.push({ alan: `donanim-${grup.kimlik}`, mesaj: `${grup.baslik} için en az bir özellik seçin veya seçim yapmak istemediğinizi belirtin.` });
    }
  }

  const gorselSatirlari = metin(form, 'gorseller', 30000).split(/[\n,]+/).map((g) => g.trim()).filter(Boolean);
  const gorseller = gorselSatirlari.filter((g) => /^https?:\/\//i.test(g) || g.startsWith('/g/'));
  if (gorseller.length !== gorselSatirlari.length) hatalar.push({ alan: 'gorseller', mesaj: 'Görsel adresleri http, https veya /g/ ile başlayan geçerli yollar olmalı.' });
  if (hatalar.length) throw new IlanFormHatasi(hatalar);
  const secili = seciliDonanim;
  const para = metin(form, 'para_birimi');
  const m2 = sayi(form, 'm2_brut');
  return { baslik, aciklama, fiyat: fiyat == null ? null : Math.round(fiyat), paraBirimi: PARA_BIRIMLERI.some((p) => p.deger === para) ? para : 'TRY', islem,
    kategori: `${islemEtiketi(islem)} ${tipEtiketi(tipGrup, tip)}`, tip, tipGrup,
    oda: metin(form, tipGrup === 'gunluk-konaklama' && tip === 'apart-pansiyon' ? 'apart_oda' : 'oda', 30) || null, m2: m2 && m2 > 0 ? m2 : null,
    il: il || null, ilce: ilce || null, mahalle: mahalle || null,
    danismanSlug: metin(form, 'danisman_slug', 120) || null, ozellikler,
    donanim: [...new Set(secili)], gorseller: [...new Set(gorseller)] };
}

const birimDeseni = /\s*(?:m²|m|₺|kW|kat|kişi|hafta)$/i;
function secenekDegeriniUyarla(alan: AlanTanimi, deger: string): string {
  if (!alan.secenekler?.length) return deger;
  const dogrudan = alan.secenekler.find((secenek) => secenek.deger === deger || slugla(secenek.deger) === slugla(deger) || slugla(secenek.etiket) === slugla(deger));
  if (dogrudan) return dogrudan.deger;
  const portalEslemeleri: Record<string, Record<string, string>> = {
    kredi_uygunluk: {
      'krediye-uygun': 'Uygun',
      'krediye-kismen-uygun': 'Kısmen Uygun',
      'krediye-uygun-degil': 'Uygun Değil',
    },
    imar_durumu: {
      'toplu-konut-icin': 'Konut İmarlı',
    },
  };
  return portalEslemeleri[alan.ad]?.[slugla(deger)] ?? deger;
}
export function ozellikleriFormDegerlerine(
  ozellikler: Record<string, string>,
  seciliDonanim: string[] = [],
  tipGrup = 'konut'
): Record<string, string | string[]> {
  const eskiMutfakDegerleri = new Set(['Açık Mutfak', 'Kapalı Mutfak', 'Amerikan Mutfak']);
  const sonuc: Record<string, string | string[]> = {
    donanim: seciliDonanim.filter((oge) => !eskiMutfakDegerleri.has(oge)),
  };
  if (tipGrup === 'konut' && !ozellikler['Mutfak Tipi']) {
    if (seciliDonanim.includes('Kapalı Mutfak')) sonuc.mutfak_tipi = 'Kapalı';
    else if (seciliDonanim.some((oge) => oge === 'Açık Mutfak' || oge === 'Amerikan Mutfak')) {
      sonuc.mutfak_tipi = 'Açık (Amerikan)';
    }
  }
  const alanlar = [...grupSemasi(tipGrup).bolumler.flatMap((b) => b.alanlar), KIMDEN_ALANI, ...YETKI_ALANLARI, ...KONUM_YONETIM_ALANLARI, ...MEDYA_PORTAL_ALANLARI];
  for (const alan of alanlar) {
    const deger = ozellikler[alan.anahtar]; if (!deger) continue;
    if (['sayi', 'ondalik'].includes(alan.tur)) {
      const n = yerelSayiOku(deger.replace(birimDeseni, '').trim());
      if (n != null) sonuc[alan.ad] = String(n);
      continue;
    }
    sonuc[alan.ad] = alan.tur === 'coklu'
      ? deger.split(',').map((v) => v.trim()).filter(Boolean)
      : secenekDegeriniUyarla(alan, deger.replace(birimDeseni, '').trim());
  }
  return sonuc;
}

const HALKA_KAPALI_OZELLIKLER = new Set(
  [
    ...ILAN_GRUPLARI.flatMap((grup) => grup.bolumler.flatMap((bolum) => bolum.alanlar)),
    KIMDEN_ALANI,
    ...YETKI_ALANLARI,
    ...KONUM_YONETIM_ALANLARI,
    ...MEDYA_PORTAL_ALANLARI,
  ]
    .filter((alan) => alan.halkaAcik === false)
    .map((alan) => alan.anahtar)
);

/** Yönetim iç alanlarını ilan sayfası ve dış yayın sözleşmesinden ayıklar. */
export function halkaAcikOzellikler(ozellikler: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(ozellikler).filter(([anahtar, deger]) => Boolean(deger) && !HALKA_KAPALI_OZELLIKLER.has(anahtar))
  );
}

export interface KunyeSatiri { etiket: string; deger: string; vurgulu?: boolean }
export interface KunyeGrubu { kimlik: string; baslik: string; aciklama?: string; satirlar: KunyeSatiri[] }
function alanDegeriniYaz(alan: AlanTanimi, deger: string): string {
  if (!['sayi', 'ondalik'].includes(alan.tur)) return deger;
  const sayisal = yerelSayiOku(deger.replace(alan.birim ?? '', ''));
  if (sayisal == null) return deger;
  return `${sayisal.toLocaleString('tr-TR')}${alan.birim ? ` ${alan.birim}` : ''}`;
}
export function kunyeGrupla(
  tipGrup: string,
  ozellikler: Record<string, string>,
  fiyatMetin: string,
  birimFiyat: string | null,
  birimFiyatTemeli?: string | null,
  tip = '',
  islem = ''
): KunyeGrubu[] {
  const sema = grupSemasi(tipGrup), sonuc: KunyeGrubu[] = [], kullanilan = new Set<string>();
  const finansAnahtarlari = new Set(FINANS.map((x) => x.anahtar));
  const bilinenAlanAnahtarlari = new Set([
    ...sema.bolumler.flatMap((bolum) => bolum.alanlar.map((alan) => alan.anahtar)),
    KIMDEN_ALANI.anahtar,
    ...YETKI_ALANLARI.map((alan) => alan.anahtar),
    ...KONUM_YONETIM_ALANLARI.map((alan) => alan.anahtar),
    ...MEDYA_PORTAL_ALANLARI.map((alan) => alan.anahtar),
  ]);
  bilinenAlanAnahtarlari.forEach((anahtar) => kullanilan.add(anahtar));
  const finans: KunyeSatiri[] = [{ etiket: 'Fiyat', deger: fiyatMetin, vurgulu: true }];
  if (birimFiyat) finans.push({ etiket: 'm² birim fiyatı', deger: birimFiyatTemeli ? `${birimFiyat} · ${birimFiyatTemeli}` : birimFiyat });
  const kimden = ozellikler[KIMDEN_ALANI.anahtar];
  if (kimden) finans.push({ etiket: KIMDEN_ALANI.etiket, deger: kimden });
  for (const alan of FINANS) {
    if (islem && alan.islemler && !alan.islemler.includes(islem as IslemKimligi)) continue;
    const deger = ozellikler[alan.anahtar];
    if (deger) finans.push({ etiket: alan.etiket, deger: alanDegeriniYaz(alan, deger) });
  }
  sonuc.push({ kimlik: 'finans', baslik: 'Fiyat ve koşullar', satirlar: finans });
  for (const bolum of sema.bolumler) {
    const satirlar = bolum.alanlar.filter((x) => x.halkaAcik !== false && !finansAnahtarlari.has(x.anahtar)
      && (!x.tipler || !tip || x.tipler.includes(tip))
      && (!islem || !x.islemler || x.islemler.includes(islem as IslemKimligi))).map((x) => {
      const deger = ozellikler[x.anahtar]; if (!deger) return null; kullanilan.add(x.anahtar); return { etiket: x.etiket, deger: alanDegeriniYaz(x, deger), vurgulu: x.gerekli };
    }).filter(Boolean) as KunyeSatiri[];
    if (satirlar.length) sonuc.push({ kimlik: bolum.kimlik, baslik: bolum.baslik, aciklama: bolum.aciklama, satirlar });
  }
  const ek = Object.entries(halkaAcikOzellikler(ozellikler)).filter(([k, v]) => v && !kullanilan.has(k)).map(([etiket, deger]) => ({ etiket, deger }));
  if (ek.length) sonuc.push({ kimlik: 'ek', baslik: 'Diğer bilgiler', satirlar: ek });
  return sonuc;
}

export function donanimGrupla(donanimListesi: string[], tipGrup = 'konut', islem = '', tip = ''): Array<{ kimlik: string; baslik: string; aciklama: string; ogeler: string[] }> {
  const secilen = new Set(donanimListesi), atanmis = new Set<string>();
  const gruplar = (islem && tip ? donanimGruplariSec(tipGrup, islem, tip) : grupSemasi(tipGrup).donanimGruplari).map((g) => {
    const ogeler = g.ogeListesi.filter((x) => secilen.has(x) && !atanmis.has(x)); ogeler.forEach((x) => atanmis.add(x));
    return { kimlik: g.kimlik, baslik: g.baslik, aciklama: g.aciklama, ogeler };
  }).filter((g) => g.ogeler.length);
  const diger = donanimListesi.filter((x) => !atanmis.has(x));
  if (diger.length) gruplar.push({ kimlik: 'diger', baslik: 'Diğer nitelikler', aciklama: 'Kaynak portaldan aktarılan ek bilgiler.', ogeler: diger });
  return gruplar;
}
