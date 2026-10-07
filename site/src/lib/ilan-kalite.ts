import type { Ilan } from './ilanlar';

export type KaliteSeviyesi = 'hata' | 'uyari';
export interface IlanKaliteSorunu {
  kod: string;
  seviye: KaliteSeviyesi;
  mesaj: string;
}
export interface IlanKaliteKaydi {
  ilanId: string;
  durum: 'uygun' | 'incele' | 'kritik';
  sorunlar: IlanKaliteSorunu[];
}

const sade = (metin: string) => metin
  .toLocaleLowerCase('tr-TR')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/ı/g, 'i')
  .replace(/ş/g, 's')
  .replace(/ğ/g, 'g')
  .replace(/ü/g, 'u')
  .replace(/ö/g, 'o')
  .replace(/ç/g, 'c')
  .replace(/\s+/g, ' ')
  .trim();

const ISLEM_IFADELERI: Record<string, { beklenen: RegExp; ters: RegExp }> = {
  satilik: { beklenen: /\bsatilik\b/, ters: /\bkiralik\b/ },
  kiralik: { beklenen: /\bkiralik\b/, ters: /\bsatilik\b/ },
  'gunluk-kiralik': { beklenen: /\bgunluk\b/, ters: /\bsatilik\b|\bsezonluk\b/ },
  'sezonluk-kiralik': { beklenen: /\bsezonluk\b/, ters: /\bsatilik\b|\bgunluk\b/ },
  'devren-satilik': { beklenen: /\bdevren satilik\b/, ters: /\bdevren kiralik\b/ },
  'devren-kiralik': { beklenen: /\bdevren kiralik\b/, ters: /\bdevren satilik\b/ },
  'kat-karsiligi-satilik': { beklenen: /\bkat karsiligi\b/, ters: /\bkiralik\b/ },
};

const ekle = (liste: IlanKaliteSorunu[], kod: string, seviye: KaliteSeviyesi, mesaj: string) => {
  if (!liste.some((sorun) => sorun.kod === kod)) liste.push({ kod, seviye, mesaj });
};

/** Yayımlanacak tek bir ilanın iş ve içerik tutarlılığını denetler. */
export function ilanKalitesiniDenetle(ilan: Ilan, bilinenDanismanlar?: ReadonlySet<string>): IlanKaliteKaydi {
  const sorunlar: IlanKaliteSorunu[] = [];
  const baslik = sade(ilan.baslikTemiz);
  const kategori = sade(ilan.kategori);
  const aciklama = sade(ilan.aciklama);
  const islem = ISLEM_IFADELERI[ilan.islem];

  if (ilan.islem !== 'kat-karsiligi-satilik' && (ilan.fiyat == null || !Number.isFinite(ilan.fiyat) || ilan.fiyat <= 0)) ekle(sorunlar, 'fiyat-yok', 'hata', 'Geçerli fiyat yok.');
  if (!['TRY', 'EUR', 'USD', 'GBP'].includes(ilan.paraBirimi)) ekle(sorunlar, 'para-birimi', 'hata', 'Para birimi tanınmıyor.');
  if (!ilan.il || !ilan.ilce || !ilan.mahalle) ekle(sorunlar, 'konum-eksik', 'hata', 'İl, ilçe veya mahalle bilgisi eksik.');
  if (ilan.baslikTemiz.length < 20) ekle(sorunlar, 'baslik-kisa', 'uyari', 'Başlık ayırt edici olacak kadar uzun değil.');
  if (ilan.aciklama.trim().length < 80) ekle(sorunlar, 'aciklama-kisa', 'hata', 'Açıklama 80 karakterden kısa.');
  if (!ilan.gorseller.length) ekle(sorunlar, 'gorsel-yok', 'hata', 'İlanda görsel yok.');
  else if (ilan.gorseller.length < 4) ekle(sorunlar, 'gorsel-az', 'uyari', 'Dörtten az görsel var.');

  if (islem?.ters.test(baslik)) ekle(sorunlar, 'islem-baslik-celiski', 'hata', 'Başlıktaki işlem türü ilan kaydıyla çelişiyor.');
  else if (islem && !islem.beklenen.test(baslik)) ekle(sorunlar, 'islem-baslik-eksik', 'uyari', 'İşlem türü başlıkta açıkça yazmıyor.');
  if (islem?.ters.test(kategori) || (islem && !islem.beklenen.test(kategori))) {
    ekle(sorunlar, 'kategori-islem-celiski', 'hata', 'Kategori ile işlem türü birbiriyle uyuşmuyor.');
  }

  const baslikOda = baslik.match(/\b(\d+)\s*\+\s*(\d+)\b/);
  const kayitOda = ilan.oda?.replace(/\s/g, '') ?? '';
  if (baslikOda && kayitOda && `${baslikOda[1]}+${baslikOda[2]}` !== kayitOda) {
    ekle(sorunlar, 'oda-celiski', 'hata', 'Başlıktaki oda düzeni kayıtlı oda bilgisiyle çelişiyor.');
  }

  if (!ilan.alanlar.karsilastirmaM2) ekle(sorunlar, 'alan-yok', 'uyari', 'Satışa konu alanın kapsamı belirsiz; m² birim fiyatı hesaplanmıyor.');
  if (ilan.tipGrup === 'konut' && !ilan.alanlar.brutYapi && !ilan.alanlar.netYapi) {
    ekle(sorunlar, 'yapi-alani-yok', 'uyari', 'Yapının net veya brüt alanı bilinmiyor; arsa ölçüsü yapı alanı sayılmaz.');
  }
  if (ilan.alanlar.brutYapi && ilan.alanlar.netYapi && ilan.alanlar.netYapi > ilan.alanlar.brutYapi) {
    ekle(sorunlar, 'net-brut-celiski', 'hata', 'Net alan brüt alandan büyük.');
  }
  if (ilan.alanlar.toplamParsel && ilan.alanlar.satilanHisse && ilan.alanlar.satilanHisse > ilan.alanlar.toplamParsel) {
    ekle(sorunlar, 'hisse-parsel-celiski', 'hata', 'Satılan hisse toplam parsel alanından büyük.');
  }
  const sayisalArsaIfadesi = /\d[\d.\s]*\s*(?:m2|m²|metrekare)\s*arsa\b/.test(aciklama);
  if (ilan.tipGrup === 'konut' && sayisalArsaIfadesi && !ilan.alanlar.arsa) {
    ekle(sorunlar, 'arsa-alani-eksik', 'uyari', 'Açıklamada sayısal arsa ölçüsü var; ayrı arsa alanına işlenmemiş.');
  }
  const hisseliKayit = ilan.tipGrup === 'arsa'
    && (/hisse/.test(baslik) || /hisseli/.test(sade(ilan.ozellikler['Tapu Durumu'] ?? '')));
  if (hisseliKayit && !ilan.alanlar.satilanHisse) {
    ekle(sorunlar, 'satilan-hisse-eksik', 'uyari', 'Hisseli kayıtta satılan hisse alanı ayrı belirtilmemiş.');
  }
  if (ilan.alanlar.satilanHisse && !ilan.alanlar.toplamParsel) {
    ekle(sorunlar, 'toplam-parsel-eksik', 'uyari', 'Satılan hisse biliniyor; toplam parsel alanı belirtilmemiş.');
  }
  const parselIfadesi = aciklama.match(/\b(\d+)\s*ada\s*[,/]?\s*(\d+)\s*parsel(?:de|dedir|deki)?\b/);
  if (parselIfadesi && ((ilan.ozellikler.Ada && Number(ilan.ozellikler.Ada) !== Number(parselIfadesi[1]))
    || (ilan.ozellikler.Parsel && Number(ilan.ozellikler.Parsel) !== Number(parselIfadesi[2])))) {
    ekle(sorunlar, 'kadastro-celiski', 'hata', 'Açıklamadaki ada/parsel numarası özellik alanıyla çelişiyor; belgeyle teyit gerekli.');
  }
  const kullanimDurumu = sade(ilan.ozellikler['Kullanım Durumu'] ?? '');
  if (/oturuyor|kiraci/.test(kullanimDurumu) && /\bbos (?:olarak|ve teslim)|\bhemen tasinmaya/.test(aciklama)) {
    ekle(sorunlar, 'teslim-celiski', 'hata', 'Kullanım durumu dolu; açıklamada boş veya hemen taşınmaya uygun yazıyor.');
  }
  if (['18522916', '18746132'].includes(ilan.id)) {
    ekle(sorunlar, 'mukerrer-adayi', 'uyari', '18522916 ve 18746132 aynı daire olabilir. Ortak fotoğraf ve benzer metin var; bağımsız bölüm teyidi bekleniyor, iki kayıt da korunuyor.');
  }
  const fiyatKapsami = sade(ilan.ozellikler['Fiyat Kapsamı'] ?? '');
  const kapsamTamami = fiyatKapsami === 'tasinmazin tamami';
  if (ilan.id === '19751424' && (!fiyatKapsami || (!kapsamTamami && !ilan.alanlar.satilanHisse))) {
    ekle(sorunlar, 'fiyat-kapsami-teyit', 'uyari', 'Tamamı veya yarısı satışta: kayıtlı fiyatın hangi paya ait olduğu teyit edilmeli.');
  }
  if (ilan.id === '19572827' && (!fiyatKapsami || !sade(ilan.ozellikler['Tapu Durumu'] ?? ''))) {
    ekle(sorunlar, 'coklu-parsel-teyit', 'uyari', 'Sekiz adet 312 m² parsel anlatılıyor; fiyatın tek parsel/hisse kapsamı ve tapu kaydı teyit edilmeli.');
  }
  if (ilan.id === '19647602' && !fiyatKapsami) {
    ekle(sorunlar, 'fiyat-kapsami-teyit', 'uyari', 'Üç hisse anlatılıyor; kayıtlı fiyatın tek hisseye mi, bütün hisselere mi ait olduğu teyit edilmeli.');
  }
  if (ilan.id === '19294003') {
    ekle(sorunlar, 'oda-dagilimi-teyit', 'uyari', 'Başlık 4+2, kat açıklaması toplam beş oda tarif ediyor; oda dağılımı teyit edilmeli.');
  }
  const tapuDurumu = sade(ilan.ozellikler['Tapu Durumu'] ?? '');
  if (/hisseli/.test(tapuDurumu) && /\b(?:kat irtifaki|kat mulkiyeti|mustakil tapu)\b/.test(aciklama)) {
    ekle(sorunlar, 'tapu-celiski', 'hata', 'Açıklamadaki tapu türü özellik alanıyla çelişiyor.');
  }

  const siteDurumu = sade(ilan.ozellikler['Site İçerisinde'] ?? '');
  const siteOlumlu = /\bsite (?:icerisinde|icinde|ici)\b/.test(aciklama)
    && !/\bsite (?:icerisinde|icinde|ici) (?:degil|bulunmuyor)\b/.test(aciklama);
  if (siteDurumu === 'hayir' && siteOlumlu) {
    ekle(sorunlar, 'site-celiski', 'hata', 'Açıklama site içinde diyor; özellik alanı “Hayır” diyor.');
  }

  if (!ilan.danismanSlug) ekle(sorunlar, 'danisman-eksik', 'uyari', 'İlana danışman atanmamış; ofis geneli gösteriliyor.');
  else if (bilinenDanismanlar && !bilinenDanismanlar.has(ilan.danismanSlug)) {
    ekle(sorunlar, 'danisman-bilinmiyor', 'hata', 'Atanan danışman ekip kaydıyla eşleşmiyor.');
  }

  if (/\b(?:kiralik|satilik|daire|villa)(?:daire|villa|ozellikleri)\b/.test(aciklama) || /m2(?:dikdortgen|arsa|kullanim)/.test(aciklama)) {
    ekle(sorunlar, 'metin-birlesmis', 'uyari', 'Açıklamada birbirine bitişmiş kelimeler var.');
  }

  const hataSayisi = sorunlar.filter((sorun) => sorun.seviye === 'hata').length;
  const uyariSayisi = sorunlar.length - hataSayisi;
  return {
    ilanId: ilan.id,
    durum: hataSayisi ? 'kritik' : uyariSayisi ? 'incele' : 'uygun',
    sorunlar,
  };
}

export function kaliteOzeti(kayitlar: IlanKaliteKaydi[]) {
  return {
    toplam: kayitlar.length,
    uygun: kayitlar.filter((kayit) => kayit.durum === 'uygun').length,
    incele: kayitlar.filter((kayit) => kayit.durum === 'incele').length,
    kritik: kayitlar.filter((kayit) => kayit.durum === 'kritik').length,
  };
}
