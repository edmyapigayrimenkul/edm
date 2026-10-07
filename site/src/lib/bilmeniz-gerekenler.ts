/**
 * bilmeniz-gerekenler.ts — EDM Mutlaka Bilmeniz Gerekenler Rehber Kütüphanesi
 * Vatandaşın tapu, kira, imar ve yatırım süreçlerinde hata yapmasını önleyen
 * 4 sütunlu otorite rehberleri ve adım adım çözüm protokolleri.
 */

export interface RehberKarti {
  kod: string;
  slug: string;
  sutun: 'S1' | 'S2' | 'S3' | 'S4';
  sutunAdi: string;
  baslik: string;
  spot: string;
  yasalDayanak: string;
  kaynaklar: Array<{ ad: string; url: string }>;
  guncellemeTarihi: string;
  kapsamNotu: string;
  okunmaSuresi: string;
  kritikKurallar: {
    etiket: string;
    baslik: string;
    aciklama: string;
    renk: 'kirmizi' | 'altin' | 'mavi';
  }[];
  cozumAdimlari: {
    adimNo: number;
    baslik: string;
    detay: string;
  }[];
  uzmanTavsiyesi: string;
}

export const REHBER_KAPSAM_NOTU =
  'Bu rehber genel bilgilendirme içindir; somut işlem, süre, oran ve idari uygulama taşınmazın niteliğine, tarihe ve dosyanın koşullarına göre değişebilir. EDM hukuk, vergi veya yatırım tavsiyesi vermez. İşlemden önce güncel birincil kaynağı ve yetkili uzmanı kontrol edin.';

/** Hukuki iddialar satır satır incelenene kadar statik rehberler taslakta tutulur. */
export const REHBER_INCELEME_TASLAKLARI: RehberKarti[] = [
  {
    kod: 'S1-015',
    slug: 'kentsel-donusumde-uzlasma-ve-arsa-payi-satisi',
    sutun: 'S3',
    sutunAdi: 'İmar & Kentsel Dönüşüm',
    baslik: 'Riskli Yapıda Çoğunluk Kararı ve Arsa Payı Satışı',
    spot: 'Hisse oranına göre salt çoğunlukla alınan karara katılmıyorsanız, kararın ve teklifin bildirimi ile olası pay satışının koşullarını ayrı ayrı kontrol edin.',
    yasalDayanak: '6306 sayılı Kanun md. 6/1',
    guncellemeTarihi: '2026-09-24',
    kapsamNotu: REHBER_KAPSAM_NOTU,
    kaynaklar: [{ ad: 'Kentsel Dönüşüm Başkanlığı — 6306 sayılı Kanun md. 6', url: 'https://kdb.gov.tr/files/mevzuatdosya/2025581301335809.pdf' }],
    okunmaSuresi: '5 dk okuma',
    kritikKurallar: [
      {
        etiket: 'RİSK',
        baslik: 'Çoğunluk Hisse Oranına Göredir',
        aciklama: 'Yeni uygulama kararı, maliklerin sayısına göre değil hisseleri oranında paydaşların salt çoğunluğuyla alınır. Karar tutanağı ve hisse hesabı incelenmelidir.',
        renk: 'kirmizi',
      },
      {
        etiket: 'SÜRE',
        baslik: 'Teklifi İnceleme ve Kabul İçin Bildirim',
        aciklama: 'Karar ve anlaşma teklifi noter aracılığıyla veya muhtarlıkta 15 gün ilan edilerek bildirilir. Bildirimden itibaren 15 günlük inceleme/kabul süresi, riskli yapı tespitine itiraz süresinden ayrıdır.',
        renk: 'altin',
      },
      {
        etiket: 'HAK',
        baslik: 'Satış İçin Rayiç Değer Alt Sınırı',
        aciklama: 'Şartlar oluşursa arsa payı, Başkanlıkça tespit ettirilen rayiç değerden az olmamak üzere önce anlaşan diğer paydaşlara açık artırmayla sunulur. Bedel ve usul uyuşmazlığında başvuru yolu dosyaya göre belirlenir.',
        renk: 'mavi',
      },
    ],
    cozumAdimlari: [
      {
        adimNo: 1,
        baslik: 'Hangi Aşamada Olduğunuzu Ayırın',
        detay: 'Riskli yapı tespitine itiraz, yeni uygulama teklifi ve arsa payı satışı ayrı süreçlerdir. Elinizdeki belgenin hangi işleme ait olduğunu belirleyin.',
      },
      {
        adimNo: 2,
        baslik: 'Karar, Teklif ve Bildirimi Temin Edin',
        detay: 'Çoğunluk kararını, anlaşma şartlarını, noter bildirimini veya muhtarlık ilanını yazılı olarak isteyin. İlgili 15 günlük süreyi bildirimin yapıldığı ya da yapılmış sayıldığı tarihe göre hesaplayın.',
      },
      {
        adimNo: 3,
        baslik: 'Değerleme ve Satış Kaydını İnceletin',
        detay: 'Pay satışa konu olursa rayiç değer tespiti ve satış duyurusunu ilgili idareden isteyin. Bedel veya usule karşı başvuruyu somut belge ve tarihlerle bir hukuk uzmanına değerlendirin.',
      },
    ],
    uzmanTavsiyesi: 'Riskli yapı ile riskli alan uygulamalarının satışta farklı sonuçları olabilir. 15 günlük teklif süresini kesinleşmiş her türlü itiraz süresi gibi yorumlamayın; belge, tarih ve başvuru yolunu dosyanız özelinde kontrol edin.',
  },
  {
    kod: 'S2-003',
    slug: 'on-yilini-dolduran-kiracinin-sebepsiz-tahliyesi',
    sutun: 'S2',
    sutunAdi: 'Kira & Tahliye Hukuku',
    baslik: 'On Yıllık Uzama Süresinden Sonra Kira Bildirimi',
    spot: 'Belirli süreli konut ve çatılı işyeri kiralarında on yıllık uzama süresi ile bunu izleyen yılın bitişi ayrı hesaplanır. Fesih bildiriminin yazılı olması gerekir.',
    yasalDayanak: 'Türk Borçlar Kanunu md. 347–348',
    guncellemeTarihi: '2026-09-24',
    kapsamNotu: REHBER_KAPSAM_NOTU,
    kaynaklar: [{ ad: 'Adalet Bakanlığı — Türk Borçlar Kanunu md. 347–348', url: 'https://mgm.adalet.gov.tr/Resimler/SayfaDokuman/181020191500286098.pdf' }],
    okunmaSuresi: '4 dk okuma',
    kritikKurallar: [
      {
        etiket: 'SÜRE',
        baslik: 'İlk Süre ile Uzama Süresini Ayırın',
        aciklama: 'Belirli süreli sözleşmede ilk sözleşme süresi ve on yıllık uzama süresi ayrı sayılır. Bildirim, bu süreyi izleyen uzama yılları için değerlendirilir.',
        renk: 'altin',
      },
      {
        etiket: 'BİLDİRİM',
        baslik: 'En Az Üç Ay Önce Yazılı Bildirim',
        aciklama: 'TBK 347 süreyi, TBK 348 yazılı şekli düzenler. Bildirimin hangi kira yılına ilişkin olduğu ve karşı tarafa ulaştığı belgelenmelidir.',
        renk: 'kirmizi',
      },
      {
        etiket: 'GEREKÇE',
        baslik: 'Sebep Göstermeme Koşullara Bağlıdır',
        aciklama: 'Kanun, süresi ve şekli uygun bildirimle sebep göstermeden sona erdirme olanağı tanır; bu sonuç her kira sözleşmesine otomatik uygulanmaz.',
        renk: 'mavi',
      },
    ],
    cozumAdimlari: [
      {
        adimNo: 1,
        baslik: 'İlk Kira Sözleşmesinin Tarihini Çıkarın',
        detay: 'İlk sözleşmenin başlangıç ve bitiş tarihini bulun; sözleşmenin belirli mi belirsiz mi süreli olduğunu ve uzama yıllarını ayrı işaretleyin.',
      },
      {
        adimNo: 2,
        baslik: 'Yazılı Bildirimi Belgelendirin',
        detay: 'İçeriği, gönderim ve teslim tarihi ispatlanabilen yazılı bir yöntem kullanın. Kanun yalnız noter yolunu zorunlu kılmaz.',
      },
      {
        adimNo: 3,
        baslik: 'Uyuşmazlıkta Uzman Görüşü Alın',
        detay: 'Bildirim ve kira dönemi konusunda anlaşmazlık varsa dava ve usul koşullarını somut dosya üzerinden hukuk uzmanıyla değerlendirin.',
      },
    ],
    uzmanTavsiyesi: 'Sözleşmenin süresi, başlangıcı, uzama yılları ve yazılı bildirim tarihi birlikte incelenmeden tahliye takvimi çıkarılmamalıdır.',
  },
  {
    kod: 'S1-002',
    slug: 'tapuda-bedeli-dusuk-gostermenin-5-agir-sonucu',
    sutun: 'S1',
    sutunAdi: 'Tapu & Mülkiyet',
    baslik: 'Tapuda Satış Bedelini Düşük Göstermek: Alıcıyı ve Satıcıyı Bekleyen 5 Ağır Ceza',
    spot: 'Tapu harcından tasarruf etmek uğruna satış bedelini düşük yazmak; vergi ziyaı cezası, şufa davasında yerin ucuza gitmesi ve yüksek gelir vergisiyle sonuçlanır.',
    yasalDayanak: '492 Sayılı Harçlar Kanunu; VUK md. 371',
    guncellemeTarihi: '2026-09-23',
    kapsamNotu: REHBER_KAPSAM_NOTU,
    kaynaklar: [
      { ad: 'Gelir İdaresi Başkanlığı — Gayrimenkul Alım-Satımında Tapu Harcı', url: 'https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv/yardim-kaynaklar/infografikler/pdfs/tapuharci.pdf' },
      { ad: 'Gelir İdaresi Başkanlığı — Değer artış kazancı hesaplama aracı', url: 'https://intvrg.gib.gov.tr/hazirbeyan/artisHesapla.html' },
    ],
    okunmaSuresi: '4 dk okuma',
    kritikKurallar: [
      {
        etiket: 'VERGİ',
        baslik: 'Eksik Beyanda Harç Farkı ve Vergi Ziyaı Cezası',
        aciklama: 'Gelir İdaresi, gerçek bedel veya emlak vergisi değerinin altında beyan tespitinde eksik harcın bir kat vergi ziyaı cezasıyla alıcı ve satıcıdan istenebileceğini açıklar.',
        renk: 'kirmizi',
      },
      {
        etiket: 'HUKUK',
        baslik: 'Şufa Davasında Yeri Kaybetme Tehlikesi',
        aciklama: 'Hisseli tapularda diğer hissedar tapudaki düşük resmi bedeli mahkemeye yatırarak mülkü elinizden alır; mahkemede "çok ödedim" diyemezsiniz.',
        renk: 'kirmizi',
      },
      {
        etiket: 'KAZANÇ',
        baslik: 'Sonraki Satışta Vergi Sonucunu Hesaplayın',
        aciklama: 'Sonraki satışta değer artış kazancı yönünden farklı vergi sonuçları doğabilir. Güncel istisna, süre ve endeks kurallarını Gelir İdaresi aracından teyit edin.',
        renk: 'altin',
      },
    ],
    cozumAdimlari: [
      {
        adimNo: 1,
        baslik: 'Bankadan Gönderilen Parayla Tapu Bedeli Eşit Olmalı',
        detay: 'Banka dekontunun açıklama kısmına "... ada ... parsel satış bedeli" yazın ve tapudaki tutarla tam eşleştirin.',
      },
      {
        adimNo: 2,
        baslik: 'Geçmiş Hatalar İçin Pişmanlık Beyannamesi',
        aciklama: 'Maliye inceleme başlatmadan önce VUK 371 kapsamında kendiliğinden beyanda bulunarak cezasız sadece harç farkını ödeyin.',
        detay: 'VUK 371 kapsamındaki pişmanlık hükümleri belirli koşullara bağlıdır. Başvuru öncesinde vergi dairesi veya mali müşavirden durumunuza ilişkin teyit alın.',
      },
      {
        adimNo: 3,
        baslik: 'Ekspertiz ve Değerleme Raporunu Saklayın',
        detay: 'Banka kredisi kullandıysanız veya ekspertiz yaptırdıysanız o tarihteki ekspertiz raporunu saklayarak piyasa rayicini belgelendirin.',
      },
    ],
    uzmanTavsiyesi: 'Tapu harcından tasarruf edilmez; girişte tasarruf ettiğinizi sandığınız 50 bin TL, çıkışta 500 bin TL vergi cezası veya tapu kaybı olarak döner.',
  },
  {
    kod: 'S3-004',
    slug: 'tarla-ile-arsa-arasindaki-7-kritik-fark',
    sutun: 'S3',
    sutunAdi: 'İmar & Kentsel Dönüşüm',
    baslik: 'Tarla ile Arsa Arasındaki 7 Kritik Fark: Yatırım Yaparken Yanılmayın',
    spot: 'Her toprak parçası arsa değildir. İmar planı geçmemiş tarım arazilerine konut yapılamaz, hisseli tarlalarda rıza-i taksim olmadan çit çekilemez.',
    yasalDayanak: '3194 Sayılı İmar Kanunu ve 5403 Sayılı Toprak Koruma Kanunu',
    guncellemeTarihi: '2026-09-23',
    kapsamNotu: REHBER_KAPSAM_NOTU,
    kaynaklar: [
      { ad: 'Mevzuat Bilgi Sistemi — İmar Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.3194.pdf' },
      { ad: 'Mevzuat Bilgi Sistemi — Toprak Koruma ve Arazi Kullanımı Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.5403.pdf' },
    ],
    okunmaSuresi: '5 dk okuma',
    kritikKurallar: [
      {
        etiket: 'İMAR',
        baslik: 'Tarla İmarsızdır, Arsa İnşaat Ruhsatına Açıktır',
        aciklama: 'Arsa belediye imar planı içinde yer alan ve inşaat hakkı (KAKS/TAKS) tanımlanmış arazidir. Tarla ise sadece tarımsal faaliyete izin verir.',
        renk: 'mavi',
      },
      {
        etiket: 'YASAK',
        baslik: 'Tarlaya Prefabrik / Tiny House Yapma Kısıtı',
        aciklama: 'Kadastral yola cephesi olmayan ve 5.000 m² altında olan tarlalara yasal olarak elektrik/su aboneliği ve inşaat ruhsatı verilemez.',
        renk: 'kirmizi',
      },
      {
        etiket: 'BÖLÜNME',
        baslik: 'Tarımsal Arazilerde İfraz Yasağı',
        aciklama: '5403 sayılı kanun uyarınca tarlalar mirasçılar veya paydaşlar arasında serbestçe küçük parçalara bölünemez.',
        renk: 'altin',
      },
    ],
    cozumAdimlari: [
      {
        adimNo: 1,
        baslik: 'Belediyeden İmar Durum Belgesi (Çap) Alın',
        detay: 'Satın almadan önce parsel numarasını ilgili ilçe belediyesinin imar müdürlüğünden sorgulayın.',
      },
      {
        adimNo: 2,
        baslik: 'Kadastro Müdürlüğü\'nden Yol Sorgusu',
        detay: 'Parselin kadastral yola fiili cephesinin olup olmadığını TKGM parsel sorgu uygulamasından teyit edin.',
      },
      {
        adimNo: 3,
        baslik: 'Sit veya Koruma Alanı Şerhini Kontrol Edin',
        detay: 'Tapu kütüğünde doğal sit, arkeolojik sit veya su havzası koruma kuşağı olup olmadığını denetleyin.',
      },
    ],
    uzmanTavsiyesi: 'Tarlayı arsa fiyatına almayın; bölgenin 1/5000 ve 1/1000 ölçekli nazım imar planı projeksiyonlarını uzman danışmanınızla analiz edin.',
  },
];

const ONAYLI_REHBER_SLUGLARI = new Set([
  'kentsel-donusumde-uzlasma-ve-arsa-payi-satisi',
  'on-yilini-dolduran-kiracinin-sebepsiz-tahliyesi',
]);

export const BILMENIZ_GEREKENLER = REHBER_INCELEME_TASLAKLARI.filter((rehber) =>
  ONAYLI_REHBER_SLUGLARI.has(rehber.slug)
);

export function rehberGetir(slug: string): RehberKarti | undefined {
  return BILMENIZ_GEREKENLER.find((r) => r.slug === slug);
}

export function sutunaGoreRehberler(sutun: 'S1' | 'S2' | 'S3' | 'S4'): RehberKarti[] {
  return BILMENIZ_GEREKENLER.filter((r) => r.sutun === sutun);
}

export const BILGI_REHBERI = BILMENIZ_GEREKENLER;
