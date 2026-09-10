/**
 * 3 Büyük Emlak Platformu (Sahibinden, Hepsiemlak, Emlakjet) Veri Modeli
 * ve Yardımcı İşlevleri.
 *
 * Konut, Arsa & Tarla ve İş Yeri kategorilerindeki tüm güncel alanları,
 * seçenek listelerini, donanım çiplerini ve form dönüşümlerini yönetir.
 */

export interface MulkSecenek {
  deger: string;
  etiket: string;
}

/* ------------------------------------------------------------------
   1. KATEGORİLER VE MÜLK TİPLERİ
   ------------------------------------------------------------------ */
export const ISLEM_TURLERI: MulkSecenek[] = [
  { deger: 'satilik', etiket: 'Satılık' },
  { deger: 'kiralik', etiket: 'Kiralık' },
  { deger: 'gunluk-kiralik', etiket: 'Günlük Kiralık' },
  { deger: 'devren-satilik', etiket: 'Devren Satılık' },
  { deger: 'devren-kiralik', etiket: 'Devren Kiralık' },
];

export const TIP_GRUPLARI: MulkSecenek[] = [
  { deger: 'konut', etiket: 'Konut' },
  { deger: 'arsa', etiket: 'Arsa & Tarla' },
  { deger: 'isyeri', etiket: 'İş Yeri' },
  { deger: 'diger', etiket: 'Diğer / Turistik Tesis' },
];

export const MULK_TIPLERI: Record<string, MulkSecenek[]> = {
  konut: [
    { deger: 'daire', etiket: 'Daire' },
    { deger: 'villa', etiket: 'Villa' },
    { deger: 'mustakil-ev', etiket: 'Müstakil Ev' },
    { deger: 'rezidans', etiket: 'Rezidans' },
    { deger: 'yazlik', etiket: 'Yazlık' },
    { deger: 'prefabrik-ev', etiket: 'Prefabrik Ev' },
    { deger: 'ciftlik-evi', etiket: 'Çiftlik Evi' },
    { deger: 'koy-evi', etiket: 'Köy Evi' },
    { deger: 'yali', etiket: 'Yalı' },
    { deger: 'yali-dairesi', etiket: 'Yalı Dairesi' },
    { deger: 'dag-evi', etiket: 'Dağ Evi' },
    { deger: 'cati-dubleksi', etiket: 'Çatı Dubleksi' },
    { deger: 'bahce-dubleksi', etiket: 'Bahçe Dubleksi' },
    { deger: 'ters-dubleks', etiket: 'Ters Dubleks' },
  ],
  arsa: [
    { deger: 'tarla', etiket: 'Tarla' },
    { deger: 'konut-imarli', etiket: 'Konut İmarlı Arsa' },
    { deger: 'villa-imarli', etiket: 'Villa İmarlı Arsa' },
    { deger: 'ticari-imarli', etiket: 'Ticari İmarlı Arsa' },
    { deger: 'sanayi-imarli', etiket: 'Sanayi İmarlı Arsa' },
    { deger: 'turizm-imarli', etiket: 'Turizm İmarlı Arsa' },
    { deger: 'bag', etiket: 'Bağ' },
    { deger: 'bahce', etiket: 'Bahçe' },
    { deger: 'zeytinlik', etiket: 'Zeytinlik' },
    { deger: 'depo-imarli', etiket: 'Depolama / Lojistik İmarlı' },
    { deger: 'ciftlik-arazisi', etiket: 'Çiftlik Arazisi' },
  ],
  isyeri: [
    { deger: 'dukkan', etiket: 'Dükkan & Mağaza' },
    { deger: 'ofis', etiket: 'Ofis & Büro' },
    { deger: 'depo', etiket: 'Depo & Antrepo' },
    { deger: 'fabrika', etiket: 'Fabrika & İmalathane' },
    { deger: 'atolye', etiket: 'Atölye' },
    { deger: 'plaza-kati', etiket: 'Plaza & Plaza Katı' },
    { deger: 'komple-bina', etiket: 'Komple Bina' },
    { deger: 'otel', etiket: 'Otel & Pansiyon' },
    { deger: 'restoran-kafe', etiket: 'Restoran & Kafe' },
  ],
  diger: [
    { deger: 'turistik-tesis', etiket: 'Turistik Tesis' },
    { deger: 'akaryakit-istasyonu', etiket: 'Akaryakıt İstasyonu' },
    { deger: 'diger', etiket: 'Diğer' },
  ],
};

/* ------------------------------------------------------------------
   2. GENEL VE FİNANSAL ALAN SEÇENEKLERİ
   ------------------------------------------------------------------ */
export const PARA_BIRIMLERI: MulkSecenek[] = [
  { deger: 'TRY', etiket: '₺ Türk Lirası' },
  { deger: 'USD', etiket: '$ Amerikan Doları' },
  { deger: 'EUR', etiket: '€ Euro' },
  { deger: 'GBP', etiket: '£ İngiliz Sterlini' },
];

export const PAZARLIK_DURUMLARI: MulkSecenek[] = [
  { deger: 'Var', etiket: 'Pazarlık Payı Var' },
  { deger: 'Yok', etiket: 'Pazarlıksız / Son Fiyat' },
  { deger: 'Belirtilmemiş', etiket: 'Belirtilmemiş' },
];

export const TAKAS_DURUMLARI: MulkSecenek[] = [
  { deger: 'Yok', etiket: 'Takasa Uygun Değil' },
  { deger: 'Gayrimenkul Takaslı', etiket: 'Gayrimenkul Takasına Uygun' },
  { deger: 'Araç Takaslı', etiket: 'Araç Takasına Uygun' },
  { deger: 'Araç ve Gayrimenkul', etiket: 'Araç ve Gayrimenkul Takaslı' },
  { deger: 'Evet', etiket: 'Takasa Uygun' },
];

export const KREDI_UYGUNLUKLARI: MulkSecenek[] = [
  { deger: 'Krediye Uygun', etiket: 'Krediye Uygun' },
  { deger: 'Krediye Uygun Değil', etiket: 'Krediye Uygun Değil' },
  { deger: 'Kısmi Krediye Uygun', etiket: 'Kısmi Krediye Uygun' },
  { deger: 'Bilinmiyor', etiket: 'Bilinmiyor' },
];

/* ------------------------------------------------------------------
   3. KONUT DETAY SEÇENEKLERİ
   ------------------------------------------------------------------ */
export const ODA_SECENEKLERI: MulkSecenek[] = [
  { deger: '1+0', etiket: '1+0 (Stüdyo)' },
  { deger: '1+1', etiket: '1+1' },
  { deger: '2+0', etiket: '2+0' },
  { deger: '2+1', etiket: '2+1' },
  { deger: '2.5+1', etiket: '2.5+1' },
  { deger: '3+1', etiket: '3+1' },
  { deger: '3.5+1', etiket: '3.5+1' },
  { deger: '3+2', etiket: '3+2' },
  { deger: '4+1', etiket: '4+1' },
  { deger: '4+2', etiket: '4+2' },
  { deger: '5+1', etiket: '5+1' },
  { deger: '5+2', etiket: '5+2' },
  { deger: '6+1', etiket: '6+1' },
  { deger: '6+2', etiket: '6+2' },
  { deger: '7+1', etiket: '7+1' },
  { deger: '7+2', etiket: '7+2' },
  { deger: '8+ ve üzeri', etiket: '8+ ve üzeri' },
];

export const BINA_YASLARI: MulkSecenek[] = [
  { deger: '0 (Yeni)', etiket: '0 (Sıfır Bina)' },
  { deger: '1', etiket: '1 Yaşında' },
  { deger: '2', etiket: '2 Yaşında' },
  { deger: '3', etiket: '3 Yaşında' },
  { deger: '4', etiket: '4 Yaşında' },
  { deger: '5-10 arası', etiket: '5 - 10 Yaşında' },
  { deger: '11-15 arası', etiket: '11 - 15 Yaşında' },
  { deger: '16-20 arası', etiket: '16 - 20 Yaşında' },
  { deger: '21-25 arası', etiket: '21 - 25 Yaşında' },
  { deger: '26-30 arası', etiket: '26 - 30 Yaşında' },
  { deger: '31 ve üzeri', etiket: '31 ve Üzeri' },
];

export const KAT_SECENEKLERI: MulkSecenek[] = [
  { deger: 'Bodrum Kat', etiket: 'Bodrum Kat' },
  { deger: 'Kot 1', etiket: 'Kot 1' },
  { deger: 'Kot 2', etiket: 'Kot 2' },
  { deger: 'Kot 3', etiket: 'Kot 3' },
  { deger: 'Zemin Kat', etiket: 'Zemin Kat' },
  { deger: 'Giriş Katı', etiket: 'Giriş Katı' },
  { deger: 'Bahçe Katı', etiket: 'Bahçe Katı' },
  { deger: 'Yüksek Giriş', etiket: 'Yüksek Giriş' },
  { deger: 'Müstakil', etiket: 'Müstakil' },
  { deger: 'Komple Bina', etiket: 'Komple Bina' },
  { deger: '1. Kat', etiket: '1. Kat' },
  { deger: '2. Kat', etiket: '2. Kat' },
  { deger: '3. Kat', etiket: '3. Kat' },
  { deger: '4. Kat', etiket: '4. Kat' },
  { deger: '5. Kat', etiket: '5. Kat' },
  { deger: '6. Kat', etiket: '6. Kat' },
  { deger: '7. Kat', etiket: '7. Kat' },
  { deger: '8. Kat', etiket: '8. Kat' },
  { deger: '9. Kat', etiket: '9. Kat' },
  { deger: '10. Kat', etiket: '10. Kat' },
  { deger: '11-20 arası', etiket: '11 - 20. Kat' },
  { deger: '20 ve üzeri', etiket: '20. Kat ve Üzeri' },
  { deger: 'Çatı Katı', etiket: 'Çatı Katı' },
  { deger: 'Teras Katı', etiket: 'Teras Katı' },
  { deger: 'En Üst Kat', etiket: 'En Üst Kat' },
  { deger: 'Villa Katı', etiket: 'Villa Katı' },
];

export const ISITMA_TIPLERI: MulkSecenek[] = [
  { deger: 'Kombi Doğalgaz', etiket: 'Kombi (Doğalgaz)' },
  { deger: 'Yerden Isıtma', etiket: 'Yerden Isıtma' },
  { deger: 'Merkezi Doğalgaz', etiket: 'Merkezi (Doğalgaz)' },
  { deger: 'Merkezi Pay Ölçer', etiket: 'Merkezi (Pay Ölçer)' },
  { deger: 'Klima', etiket: 'Klima' },
  { deger: 'Isı Pompası', etiket: 'Isı Pompası' },
  { deger: 'Soba / Katı Yakıt', etiket: 'Soba (Kömür/Odun)' },
  { deger: 'Güneş Enerjisi', etiket: 'Güneş Enerjisi' },
  { deger: 'VRV/VRF', etiket: 'VRV / VRF Sistemi' },
  { deger: 'Fan Coil', etiket: 'Fan Coil' },
  { deger: 'Jeotermal', etiket: 'Jeotermal' },
  { deger: 'Yok', etiket: 'Isıtma Yok' },
];

export const BANYO_SAYILARI: MulkSecenek[] = [
  { deger: '1', etiket: '1 Banyo' },
  { deger: '2', etiket: '2 Banyo' },
  { deger: '3', etiket: '3 Banyo' },
  { deger: '4', etiket: '4 Banyo' },
  { deger: '5', etiket: '5 Banyo' },
  { deger: '6+', etiket: '6 ve Üzeri Banyo' },
];

export const BALKON_DURUMLARI: MulkSecenek[] = [
  { deger: 'Var', etiket: 'Var (Açık Balkon)' },
  { deger: 'Kapalı / Cam Balkon', etiket: 'Var (Cam / Kapalı Balkon)' },
  { deger: '2 Balkon', etiket: 'Var (2 Balkon)' },
  { deger: '3+ Balkon', etiket: 'Var (3+ Balkon)' },
  { deger: 'Teras', etiket: 'Geniş Teras' },
  { deger: 'Fransız Balkon', etiket: 'Fransız Balkon' },
  { deger: 'Yok', etiket: 'Balkon Yok' },
];

export const OTOPARK_DURUMLARI: MulkSecenek[] = [
  { deger: 'Açık & Kapalı Otopark', etiket: 'Açık & Kapalı Otopark' },
  { deger: 'Kapalı Otopark', etiket: 'Kapalı Otopark' },
  { deger: 'Açık Otopark', etiket: 'Açık Otopark' },
  { deger: 'Özel Garaj', etiket: 'Özel Kapalı Garaj' },
  { deger: 'Yok', etiket: 'Otopark Yok' },
];

export const ESYA_DURUMLARI: MulkSecenek[] = [
  { deger: 'Boş', etiket: 'Boş / Eşyasız' },
  { deger: 'Eşyalı', etiket: 'Eşyalı' },
  { deger: 'Kısmen Eşyalı', etiket: 'Kısmen Eşyalı' },
];

export const KULLANIM_DURUMLARI: MulkSecenek[] = [
  { deger: 'Boş', etiket: 'Boş (Hemen Taşınabilir)' },
  { deger: 'Mülk Sahibi Oturuyor', etiket: 'Mülk Sahibi Oturuyor' },
  { deger: 'Kiracılı', etiket: 'Kiracılı' },
];

export const TAPU_DURUMLARI: MulkSecenek[] = [
  { deger: 'Kat Mülkiyeti', etiket: 'Kat Mülkiyeti (İskanlı)' },
  { deger: 'Kat İrtifakı', etiket: 'Kat İrtifakı' },
  { deger: 'Müstakil Parsel', etiket: 'Müstakil Parsel (Arsa Tapulu)' },
  { deger: 'Hisseli Tapu', etiket: 'Hisseli Tapu' },
  { deger: 'Kooperatif Hisseli', etiket: 'Kooperatif Hisseli' },
  { deger: 'Tahsis', etiket: 'Tahsis Belgesi' },
  { deger: 'Zilliyet', etiket: 'Zilliyet' },
];

export const YAPI_DURUMLARI: MulkSecenek[] = [
  { deger: 'Sıfır', etiket: 'Sıfır / Yeni Yapı' },
  { deger: 'İkinci El', etiket: 'İkinci El' },
  { deger: 'Yapım Aşamasında', etiket: 'Yapım Aşamasında (Proje)' },
];

export const YAPI_TIPLERI: MulkSecenek[] = [
  { deger: 'Betonarme', etiket: 'Betonarme' },
  { deger: 'Çelik Konstrüksiyon', etiket: 'Çelik Konstrüksiyon' },
  { deger: 'Ahşap', etiket: 'Ahşap' },
  { deger: 'Prefabrik', etiket: 'Prefabrik' },
  { deger: 'Taş Yapı', etiket: 'Taş Yapı' },
  { deger: 'Yığma Tuğla', etiket: 'Yığma Tuğla' },
];

/* ------------------------------------------------------------------
   4. ARSA & TARLA DETAY SEÇENEKLERİ
   ------------------------------------------------------------------ */
export const IMAR_DURUMLARI: MulkSecenek[] = [
  { deger: 'Tarla', etiket: 'Tarla (Tarımsal Nitelikli)' },
  { deger: 'Konut İmarlı', etiket: 'Konut İmarlı' },
  { deger: 'Villa İmarlı', etiket: 'Villa İmarlı' },
  { deger: 'Ticari İmarlı', etiket: 'Ticari İmarlı' },
  { deger: 'Sanayi İmarlı', etiket: 'Sanayi İmarlı' },
  { deger: 'Turizm İmarlı', etiket: 'Turizm İmarlı' },
  { deger: 'Bağ / Bahçe', etiket: 'Bağ / Bahçe' },
  { deger: 'Zeytinlik', etiket: 'Zeytinlik' },
  { deger: 'Depolama / Lojistik', etiket: 'Depolama & Lojistik İmarlı' },
  { deger: 'Küçük Sanayi', etiket: 'Küçük Sanayi' },
  { deger: 'Sit Alanı', etiket: 'Sit Alanı' },
  { deger: 'İmar Planı Aşamasında', etiket: 'İmar Planı Aşamasında' },
  { deger: 'İmarsız', etiket: 'İmarsız' },
];

export const KAKS_EMSAL_SECENEKLERI: MulkSecenek[] = [
  { deger: '0.05', etiket: '0.05' },
  { deger: '0.10', etiket: '0.10' },
  { deger: '0.15', etiket: '0.15' },
  { deger: '0.20', etiket: '0.20' },
  { deger: '0.25', etiket: '0.25' },
  { deger: '0.30', etiket: '0.30' },
  { deger: '0.40', etiket: '0.40' },
  { deger: '0.50', etiket: '0.50' },
  { deger: '0.60', etiket: '0.60' },
  { deger: '0.80', etiket: '0.80' },
  { deger: '1.00', etiket: '1.00' },
  { deger: '1.20', etiket: '1.20' },
  { deger: '1.50', etiket: '1.50' },
  { deger: '2.00+', etiket: '2.00 ve üzeri' },
];

export const GABARI_SECENEKLERI: MulkSecenek[] = [
  { deger: 'Serbest', etiket: 'Serbest' },
  { deger: '6.50 m (2 Kat)', etiket: '6.50 m (2 Kat)' },
  { deger: '9.50 m (3 Kat)', etiket: '9.50 m (3 Kat)' },
  { deger: '12.50 m (4 Kat)', etiket: '12.50 m (4 Kat)' },
  { deger: '15.50 m (5 Kat)', etiket: '15.50 m (5 Kat)' },
  { deger: 'Belirtilmemiş', etiket: 'Belirtilmemiş' },
];

export const ARSA_YOL_DURUMLARI: MulkSecenek[] = [
  { deger: 'Resmi Kadastral Yola Cephe', etiket: 'Resmi Kadastral Yola Cephe' },
  { deger: 'Asfalta / Anayola Cephe', etiket: 'Asfalt / Ana Yola Cephe' },
  { deger: 'Stabilize / Toprak Yol', etiket: 'Stabilize / Toprak Yol' },
  { deger: 'Açılmamış Kadastral Yol', etiket: 'Açılmamış Kadastral Yol' },
  { deger: 'Yolu Yok / Geçit Hakkı Var', etiket: 'Yolu Yok / Geçit Hakkı' },
];

export const ZEMIN_YAPILARI: MulkSecenek[] = [
  { deger: 'Düz Zemin', etiket: 'Düz Zemin' },
  { deger: 'Az Eğimli (Tatlı Eğim)', etiket: 'Az Eğimli (Tatlı Eğim)' },
  { deger: 'Eğimli / Yamaç', etiket: 'Eğimli / Yamaç' },
  { deger: 'Teraslanmış', etiket: 'Teraslanmış' },
  { deger: 'Taşlık / Kayalık', etiket: 'Taşlık / Kayalık' },
];

/* ------------------------------------------------------------------
   5. GRUPLANDIRILMIŞ DONANIM VE ÖZELLİK ÇİP KATALOĞU
   Her mülk kategorisi (Konut, Arsa & Tarla, İş Yeri, Diğer) için
   tamamen bağımsız, amaca özel şablonlar içerir.
   ------------------------------------------------------------------ */
export interface DonanimGrubu {
  kimlik: string;
  baslik: string;
  aciklama: string;
  ogeListesi: string[];
}

export const KATEGORI_DONANIM_KATALOGU: Record<string, DonanimGrubu[]> = {
  konut: [
    {
      kimlik: 'konut_ic',
      baslik: 'İç Mekan Donanımları',
      aciklama: 'Daire veya villa iç mimari donanımları',
      ogeListesi: [
        'Ankastre Mutfak',
        'Ankastre Set (Ocak-Fırın-Davlumbaz)',
        'Açık (Amerikan) Mutfak',
        'Ayrı Kapalı Mutfak',
        'Çelik Kapı',
        'Görüntülü Diyafon',
        'Hilton Banyo',
        'Ebeveyn Banyosu',
        'Giyinme Odası',
        'Kiler',
        'Çamaşır Odası',
        'Gömme Dolap',
        'Vestiyer',
        'Jakuzi',
        'Duşakabin',
        'Şömine',
        'Barbekü',
        'Teras',
        'Kış Bahçesi',
        'Laminant Parke',
        'Masif Ahşap Parke',
        'Seramik Zemin',
        'Yerden Isıtma',
        'Klima',
        'Spot & Led Aydınlatma',
        'Akıllı Ev Sistemi',
        'Fiber İnternet',
        'Ahşap Doğrama',
        'PVC Doğrama',
        'Isıcam',
        'Otomatik Panjur',
        'Kartonpiyer / Asma Tavan',
        'Duvar Kağıdı',
        'Yangın Alarmı',
        'Hırsız Alarmı',
        'Beyaz Eşyalı',
        'Mobilyalı',
      ],
    },
    {
      kimlik: 'konut_dis',
      baslik: 'Bina & Sosyal Donatılar',
      aciklama: 'Bina, site ve ortak sosyal yaşam alanları',
      ogeListesi: [
        'Açık Yüzme Havuzu',
        'Kapalı Yüzme Havuzu',
        'Müstakil Özel Havuz',
        'Çocuk Yüzme Havuzu',
        'Çocuk Oyun Parkı',
        'Fitness / Spor Salonu',
        'Sauna',
        'Türk Hamamı',
        'Spa',
        'Tenis Kortu',
        'Basketbol Sahası',
        'Kamelya / Çardak',
        'Peyzajlı Ortak Bahçe',
        'Özel Müstakil Bahçe',
        'Kapalı Otopark',
        'Açık Otopark',
        'Vale Hizmeti',
        '7/24 Güvenlik',
        'Güvenlik Kameraları',
        'Güvenlikli Giriş',
        'Yangın Merdiveni',
        'Yangın Söndürme Sistemi',
        'Tam Beslemeli Jeneratör',
        'Su Deposu',
        'Hidrofor',
        'Isı Yalıtımı / Mantolama',
        'Ses Yalıtımı',
        'Su Yalıtımı',
        'Asansör',
        'Yük Asansörü',
        'Engelliye Uygun (Rampa / Asansör)',
        'Kapıcı / Görevli Hizmeti',
      ],
    },
    {
      kimlik: 'konut_muhit',
      baslik: 'Konum & Çevre (Muhit)',
      aciklama: 'Sosyal yaşam alanlarına ve kurumlara yakınlık',
      ogeListesi: [
        'Denize Sıfır',
        'Sahile Yürüme Mesafesinde',
        'Panoramik Deniz Manzaralı',
        'Doğa / Orman Manzaralı',
        'Şehir Manzaralı',
        'Göl Manzaralı',
        'Cadde Üzeri',
        'Çarşıya / Merkeze Yakın',
        'Alışveriş Merkezi (AVM) Yakını',
        'Hastane / Sağlık Ocağı Yakını',
        'Eczane Yakını',
        'Semt Pazarına Yakın',
        'İlkokul / Lise Yakını',
        'Üniversiteye Yakın',
        'Cami / İbadethane Yakını',
        'Belediye Yakını',
        'Park & Yeşil Alan Yakını',
        'Marina Yakını',
      ],
    },
    {
      kimlik: 'konut_ulasim',
      baslik: 'Ulaşım Bağlantıları',
      aciklama: 'Toplu taşıma ve ana arter erişimi',
      ogeListesi: [
        'Anayol / E-5’e Yakın',
        'TEM Otoyolu Bağlantısı',
        'Kuzey Marmara Otoyoluna Yakın',
        'Sahil Yolu Yakını',
        'Minibüs / Dolmuş Hattı Üzerinde',
        'Otobüs Durağına Yakın',
        'Metrobüse Yakın',
        'Metroya Yakın',
        'Marmaray’a Yakın',
        'Tramvaya Yakın',
        'Havalimanına Yakın',
      ],
    },
  ],

  arsa: [
    {
      kimlik: 'arsa_altyapi',
      baslik: 'Altyapı & Şebeke Bağlantıları',
      aciklama: 'Elektrik, su, gaz ve kanalizasyon altyapısı',
      ogeListesi: [
        'Sanayi Elektriği (Trifaze / Yüksek Güç)',
        'Şebeke Elektriği Mevcut',
        'Elektrik Yakınında (Hat Çekilebilir)',
        'Şebeke Suyu (İSKİ / Belediye)',
        'Artezyen / Sondaj Kuyu Suyu',
        'Doğal Kaynak Suyu',
        'Tarımsal Sulama Kanalı / Suyu',
        'Su Deposu Altyapısı',
        'Doğalgaz Hattı Mevcut',
        'Yakınında Doğalgaz Var',
        'Belediye Kanalizasyon Hattı',
        'Foseptik Altyapısı',
        'Fiber İnternet Altyapısı',
        'Telefon Hattı',
        'Trafo Mevcut / Yakınında',
      ],
    },
    {
      kimlik: 'arsa_yol',
      baslik: 'Yol, Ulaşım & Parsel Konumu',
      aciklama: 'Kadastral yol cephesi ve ulaşım arterleri',
      ogeListesi: [
        'Resmi Kadastral Yola Cephe',
        'Asfalt Ana Yola Cephe',
        'Stabilize / Sert Zemin Yol',
        'Açılmamış Kadastral Yol',
        'Köşe Parsel',
        'Çift Yola Cepheli',
        'Geniş Yola Cephe (>20 Metre)',
        'Yola Terki Yapılmış',
        'E-5 Karayolu Cepheli / Yakın',
        'TEM Otoyolu Bağlantısına Yakın',
        'Kuzey Marmara Otoyolu Yakını',
        'Sahil Yoluna Yakın',
        'Toplu Taşımaya / Minibüse Yakın',
        'Köy Yerleşik Alanı Bitişiği',
        'Organize Sanayi / OSB Bölgesinde',
        'Lojistik / Depolama Aksında',
      ],
    },
    {
      kimlik: 'arsa_nitelik',
      baslik: 'Arazi Yapısı, Toprak & Kullanım Potansiyeli',
      aciklama: 'Zemin, tarım ve yapılaşma uygunluğu',
      ogeListesi: [
        'Düz Arazi (Eğimsiz)',
        'Az Eğimli (Tatlı Eğim)',
        'Teraslanmış Arazi',
        'Taşsız Verimli Toprak',
        'Tarıma & Ekime Elverişli',
        'Sera Kurulumuna Uygun',
        'Çiftlik & Hayvancılığa Uygun',
        'Tiny House / Ahşap Ev Kurulumuna Uygun',
        'Hobi Bahçesine Uygun',
        'Meyve Bahçesi / Yetişkin Ağaçlı',
        'Zeytinlik',
        'Güneş Enerjisi Santraline (GES) Uygun',
        'Açık Stok / Depolama Sahasına Uygun',
        'Tır / Ağır Vasıta Girişine Uygun',
        'Tel Örgü / Çitle Çevrili',
        'Sürgülü Giriş Kapısı Yapılmış',
      ],
    },
    {
      kimlik: 'arsa_manzara',
      baslik: 'Manzara & Çevre',
      aciklama: 'Görsel ayrıcalıklar ve çevre özellikleri',
      ogeListesi: [
        'Denize Sıfır Parsel',
        'Sahile / Plaja Yürüme Mesafesinde',
        'Panoramik Deniz Manzaralı',
        'Kapanmaz Doğa / Orman Manzaralı',
        'Göl / Gölet Manzaralı',
        'Vadi / Şehir Manzaralı',
        'Havadar / Yüksek Konum',
        'Ormana Bitişik / Mücavir',
      ],
    },
    {
      kimlik: 'arsa_hukuk',
      baslik: 'Hukuki Durum & Tapu Avantajları',
      aciklama: 'Mülkiyet, imar ve kadastro güvenceleri',
      ogeListesi: [
        'Tek Tapu (Müstakil Parsel)',
        'Sorunsuz / Temiz / Şerhsiz Tapu',
        'İpoteksiz / Krediye Uygun',
        'Hisseli (Rıza-i Taksim Sözleşmeli)',
        'Hisseli (Fiili Kullanımlı / Çevrili)',
        'Kadastrosu Kesinleşmiş',
        'İfraz Yapılabilir',
        'Parsellenmiş Proje İçi',
        'Kat Karşılığına Uygun',
        'İçinde Kayıtlı Yapı Var (Yapı Kayıt Belgeli)',
      ],
    },
  ],

  isyeri: [
    {
      kimlik: 'isyeri_altyapi',
      baslik: 'Ticari Altyapı & İmalat / Depolama',
      aciklama: 'Sanayi gücü, yükleme ve güvenlik donanımları',
      ogeListesi: [
        'Sanayi Elektriği (Trifaze Yüksek Güç)',
        'Sanayi Tipi Baca & Havalandırma Sistemi',
        'Yükleme Rampası / Hidrolik İskele',
        'Tır & Kamyon Yanaşma / Giriş İmkanı',
        'Yük Asansörü',
        'Monoray Vinç / Vinç Altyapısı',
        'Yangın Sprinkler Sistemi & Yangın Dolapları',
        'Yangın Merdiveni & Acil Çıkış Kapısı',
        'Tam Kapasite Jeneratör',
        'Su Deposu & Hidrofor',
        'Doğalgaz Altyapısı / Radyant Isıtma',
        'Fiber İnternet & Server / Network Odası',
        'Kamera Sistemi & Hırsız Alarmı',
        'Soğuk Hava Deposu Altyapısı',
        'Zemin Epoksi Kaplama',
      ],
    },
    {
      kimlik: 'isyeri_mekan',
      baslik: 'Mekan Düzeni & Bölümler',
      aciklama: 'Vitrin, ofis ve kullanım alanları',
      ogeListesi: [
        'Zemin Kat Düz Giriş (Kaldırımdan Düz Ayak)',
        'Geniş Cam Vitrin / Ön Cephe',
        'Asma Kat / Galeri Katı',
        'İdari Ofis Bölümleri Yapılı',
        'Toplantı Salonu',
        'Mutfak / Yemekhane Bölümü',
        'Personel Soyunma Odası & Duşlar',
        'Bay / Bayan Ayrı WC Lavabo',
        'Açık Stok / Depolama Sahası',
        'Özel Tahsisli Otopark Alanı',
        'Açık Ön Kullanım Alanı',
      ],
    },
    {
      kimlik: 'isyeri_lojistik',
      baslik: 'Konum, Tabela Değeri & Lojistik',
      aciklama: 'Ticari görünürlük ve ulaşım avantajları',
      ogeListesi: [
        'Ana Cadde Üzeri / Çok Yüksek Tabela Değeri',
        'Organize Sanayi Bölgesinde (OSB)',
        'Sanayi / Ticaret Sitesi İçerisinde',
        'Köşe Konum / Çift Cepheli',
        'E-5 / Otoyol Doğrudan Bağlantılı',
        'Lojistik & Antrepo Aksında',
        'Gümrük & Limana Yakın',
        'Yoğun Yaya & Araç Trafiği',
        'Bankalar & Resmi Kurumlar Caddesinde',
        'Toplu Taşımaya Yürüme Mesafesinde',
      ],
    },
  ],

  diger: [
    {
      kimlik: 'diger_donanim',
      baslik: 'Tesis & Proje Donanımları',
      aciklama: 'Turistik ve karma projelere özel donatılar',
      ogeListesi: [
        'Açık Yüzme Havuzu',
        'Kapalı Yüzme Havuzu',
        'Geniş Peyzaj & Bahçe',
        'Jeneratör',
        'Su Deposu & Hidrofor',
        'Otopark Alanı',
        'Güvenlik & Kamera Sistemi',
        'Geniş Ön Cephe',
        'Denize Sıfır / Manzaralı',
        'Ana Yola Cephe',
        'Ruhsatlı Tesis',
        'Turizm İşletme Belgeli',
      ],
    },
  ],
};

export const DONANIM_KATALOGU: DonanimGrubu[] = [
  ...KATEGORI_DONANIM_KATALOGU.konut,
  ...KATEGORI_DONANIM_KATALOGU.arsa,
  ...KATEGORI_DONANIM_KATALOGU.isyeri,
  ...KATEGORI_DONANIM_KATALOGU.diger,
];

/* ------------------------------------------------------------------
   6. FORM VERİSİ <-> VERİTABANI DÖNÜŞÜMLERİ
   ------------------------------------------------------------------ */

export interface AyrintiliIlanGirdisi {
  id?: string;
  baslik: string;
  aciklama: string;
  fiyat: number | null;
  paraBirimi: string;
  islem: string;
  kategori: string;
  tip: string;
  tipGrup: string;
  oda: string | null;
  m2: number | null;
  il: string | null;
  ilce: string | null;
  mahalle: string | null;
  danismanSlug: string | null;
  ozellikler: Record<string, string>;
  donanim: string[];
  gorseller: string[];
}

/**
 * FormData girdisini temiz, tip güvenli ve 3 portal standartlarında
 * yapılandırılmış bir nesneye dönüştürür.
 */
export function formdanIlanVerisi(form: FormData): AyrintiliIlanGirdisi {
  const baslik = String(form.get('baslik') ?? '').trim();
  const aciklama = String(form.get('aciklama') ?? '').trim();
  const fiyat = Number(form.get('fiyat')) || null;
  const paraBirimi = String(form.get('para_birimi') ?? 'TRY').trim();
  const islem = String(form.get('islem') ?? 'satilik').trim();
  const tipGrup = String(form.get('tip_grup') ?? 'konut').trim();
  const tip = String(form.get('tip') ?? 'daire').trim();
  const kategori = String(form.get('kategori') ?? '').trim() || `${islem === 'satilik' ? 'Satılık' : 'Kiralık'} ${tip}`;
  const oda = String(form.get('oda') ?? '').trim() || null;
  const m2 = Number(form.get('m2')) || null;
  const il = String(form.get('il') ?? 'İstanbul').trim() || null;
  const ilce = String(form.get('ilce') ?? 'Silivri').trim() || null;
  const mahalle = String(form.get('mahalle') ?? '').trim() || null;
  const danismanSlug = String(form.get('danisman_slug') ?? '').trim() || null;

  // Görseller: Her satıra bir adet URL veya virgülle ayrılmış
  const gorseller = String(form.get('gorseller') ?? '')
    .split(/[\n,]+/)
    .map((g) => g.trim())
    .filter((g) => /^https?:\/\//.test(g) || g.startsWith('/g/'));

  // Donanım (Çipler)
  const seciliDonanim = form.getAll('donanim').map(String).filter(Boolean);

  // Özellikler (Key-Value)
  const ozellikler: Record<string, string> = {};

  // Ortak alanlar
  const alanlar: Record<string, string> = {
    'Brüt Metrekare': form.get('m2_brut') ? `${form.get('m2_brut')} m²` : (m2 ? `${m2} m²` : ''),
    'Net Metrekare': form.get('m2_net') ? `${form.get('m2_net')} m²` : '',
    'Açık Alan / Bahçe': form.get('m2_acik') ? `${form.get('m2_acik')} m²` : '',
    'Oda Sayısı': oda ?? '',
    'Salon Sayısı': String(form.get('salon_sayisi') ?? ''),
    'Bina Yaşı': String(form.get('bina_yasi') ?? ''),
    'Bulunduğu Kat': String(form.get('bulundugu_kat') ?? ''),
    'Kat Sayısı': String(form.get('kat_sayisi') ?? ''),
    'Isıtma Tipi': String(form.get('isitma_tipi') ?? ''),
    'Banyo Sayısı': String(form.get('banyo_sayisi') ?? ''),
    'Tuvalet Sayısı': String(form.get('tuvalet_sayisi') ?? ''),
    'Balkon': String(form.get('balkon') ?? ''),
    'Asansör': String(form.get('asansor') ?? ''),
    'Otopark': String(form.get('otopark') ?? ''),
    'Eşya Durumu': String(form.get('esya_durumu') ?? ''),
    'Kullanım Durumu': String(form.get('kullanim_durumu') ?? ''),
    'Site İçerisinde': String(form.get('site_icerisinde') ?? ''),
    'Site / Proje Adı': String(form.get('site_adi') ?? ''),
    'Aidat': form.get('aidat') ? `${form.get('aidat')} ₺` : '',
    'Depozito': form.get('depozito') ? `${form.get('depozito')} ₺` : '',
    'Tapu Durumu': String(form.get('tapu_durumu') ?? ''),
    'Yapı Durumu': String(form.get('yapi_durumu') ?? ''),
    'Yapı Tipi': String(form.get('yapi_tipi') ?? ''),
    'Cephe': form.getAll('cephe').map(String).filter(Boolean).join(', '),
    'Krediye Uygunluk': String(form.get('kredi_uygunluk') ?? ''),
    'Takas': String(form.get('takas') ?? ''),
    'Pazarlık': String(form.get('pazarlik') ?? ''),
    'Kira Getirisi': form.get('kira_getirisi') ? `${form.get('kira_getirisi')} ₺` : '',

    // Arsa & Tarla alanları
    'İmar Durumu': String(form.get('imar_durumu') ?? ''),
    'Ada': String(form.get('ada') ?? ''),
    'Parsel': String(form.get('parsel') ?? ''),
    'Pafta': String(form.get('pafta') ?? ''),
    'KAKS (Emsal)': String(form.get('kaks') ?? ''),
    'Gabari': String(form.get('gabari') ?? ''),
    'TAKS': form.get('taks') ? `%${form.get('taks')}` : '',
    'Yol Durumu': String(form.get('yol_durumu') ?? ''),
    'Yola Cephe': form.get('yola_cephe') ? `${form.get('yola_cephe')} Metre` : '',
    'Satılan Hisse Alanı': form.get('hisse_m2') ? `${form.get('hisse_m2')} m²` : '',
    'Zemin Yapısı': String(form.get('zemin_yapisi') ?? ''),

    // İş Yeri alanları
    'Kapalı Alan': form.get('kapali_alan') ? `${form.get('kapali_alan')} m²` : '',
    'Bölüm / Oda Sayısı': String(form.get('ticari_bolum') ?? ''),
    'Tavan Yüksekliği': form.get('tavan_yuksekligi') ? `${form.get('tavan_yuksekligi')} m` : '',
    'Vitrin Genişliği': form.get('vitrin_genisligi') ? `${form.get('vitrin_genisligi')} m` : '',
    'Elektrik Gücü': form.get('elektrik_gucu') ? `${form.get('elektrik_gucu')} kW` : '',
    'Ruhsat & Baca': String(form.get('ruhsat_baca') ?? ''),
    'Yük Asansörü': String(form.get('yuk_asansoru') ?? ''),
    'Devren': String(form.get('devren') ?? ''),

    // Portallar & Medya
    'Sahibinden No': String(form.get('sahibinden_no') ?? ''),
    'Hepsiemlak No': String(form.get('hepsiemlak_no') ?? ''),
    'Emlakjet No': String(form.get('emlakjet_no') ?? ''),
    'Video URL': String(form.get('video_url') ?? ''),
    'Sanal Tur URL': String(form.get('sanal_tur_url') ?? ''),
  };

  for (const [k, v] of Object.entries(alanlar)) {
    const kirp = v.trim();
    if (kirp && kirp !== 'Belirtilmemiş' && kirp !== 'Seçiniz') {
      ozellikler[k] = kirp;
    }
  }

  return {
    baslik,
    aciklama,
    fiyat,
    paraBirimi,
    islem,
    kategori,
    tip,
    tipGrup,
    oda,
    m2,
    il,
    ilce,
    mahalle,
    danismanSlug,
    ozellikler,
    donanim: [...new Set(seciliDonanim)],
    gorseller,
  };
}

/* ------------------------------------------------------------------
   7. İLAN GÖRÜNTÜLEME EKRANI İÇİN KÜNYE VE DONANIM GRUPLAMA
   ------------------------------------------------------------------ */

export interface KunyeSatiri {
  etiket: string;
  deger: string;
  vurgulu?: boolean;
}

export interface KunyeGrubu {
  baslik: string;
  satirlar: KunyeSatiri[];
}

/**
 * İlanın özelliklerini 3 büyük portalın düzeninde mantıksal künye gruplarına ayırır.
 */
export function kunyeGrupla(
  tipGrup: string,
  ozellikler: Record<string, string>,
  fiyatMetin: string,
  birimFiyat: string | null
): KunyeGrubu[] {
  const o = (anahtar: string): string | undefined => {
    const val = ozellikler[anahtar];
    return val && val !== 'Belirtilmemiş' && val !== 'Seçiniz' ? val : undefined;
  };

  const gruplar: KunyeGrubu[] = [];

  // FİNANSAL & TEMEL BİLGİLER
  const finansalSatirlar: KunyeSatiri[] = [
    { etiket: 'Fiyat', deger: fiyatMetin, vurgulu: true },
    birimFiyat ? { etiket: 'm² Birim Fiyatı', deger: birimFiyat } : undefined,
    o('Aidat') ? { etiket: 'Aidat', deger: o('Aidat')! } : undefined,
    o('Depozito') ? { etiket: 'Depozito', deger: o('Depozito')! } : undefined,
    o('Krediye Uygunluk') ? { etiket: 'Krediye Uygunluk', deger: o('Krediye Uygunluk')! } : undefined,
    o('Takas') ? { etiket: 'Takas', deger: o('Takas')! } : undefined,
    o('Pazarlık') ? { etiket: 'Pazarlık', deger: o('Pazarlık')! } : undefined,
    o('Kira Getirisi') ? { etiket: 'Kira Getirisi', deger: o('Kira Getirisi')! } : undefined,
  ].filter(Boolean) as KunyeSatiri[];

  if (finansalSatirlar.length) {
    gruplar.push({ baslik: 'Fiyat & Finansal Bilgiler', satirlar: finansalSatirlar });
  }

  // MÜLK GRUBUNA GÖRE ANA BİLGİLER
  if (tipGrup === 'arsa') {
    const arsaSatirlar: KunyeSatiri[] = [
      o('İmar Durumu') ? { etiket: 'İmar Durumu', deger: o('İmar Durumu')!, vurgulu: true } : undefined,
      o('Brüt Metrekare') ? { etiket: 'Toplam Parsel Alanı', deger: o('Brüt Metrekare')!, vurgulu: true } : undefined,
      o('Satılan Hisse Alanı') ? { etiket: 'Satılan Hisse Alanı', deger: o('Satılan Hisse Alanı')! } : undefined,
      o('Ada') ? { etiket: 'Ada No', deger: o('Ada')! } : undefined,
      o('Parsel') ? { etiket: 'Parsel No', deger: o('Parsel')! } : undefined,
      o('Pafta') ? { etiket: 'Pafta No', deger: o('Pafta')! } : undefined,
      o('KAKS (Emsal)') ? { etiket: 'KAKS / Emsal', deger: o('KAKS (Emsal)')! } : undefined,
      o('Gabari') ? { etiket: 'Gabari / Kat İzni', deger: o('Gabari')! } : undefined,
      o('TAKS') ? { etiket: 'TAKS (Taban Alanı)', deger: o('TAKS')! } : undefined,
      o('Tapu Durumu') ? { etiket: 'Tapu Durumu', deger: o('Tapu Durumu')! } : undefined,
      o('Yol Durumu') ? { etiket: 'Yol Durumu', deger: o('Yol Durumu')! } : undefined,
      o('Yola Cephe') ? { etiket: 'Yola Cephe', deger: o('Yola Cephe')! } : undefined,
      o('Zemin Yapısı') ? { etiket: 'Zemin Yapısı', deger: o('Zemin Yapısı')! } : undefined,
    ].filter(Boolean) as KunyeSatiri[];

    if (arsaSatirlar.length) {
      gruplar.push({ baslik: 'Arsa & Kadastro Bilgileri', satirlar: arsaSatirlar });
    }
  } else if (tipGrup === 'isyeri') {
    const ticariSatirlar: KunyeSatiri[] = [
      o('Brüt Metrekare') ? { etiket: 'Toplam Kullanım Alanı', deger: o('Brüt Metrekare')!, vurgulu: true } : undefined,
      o('Kapalı Alan') ? { etiket: 'Kapalı Alan', deger: o('Kapalı Alan')! } : undefined,
      o('Net Metrekare') ? { etiket: 'Net Alan', deger: o('Net Metrekare')! } : undefined,
      o('Bölüm / Oda Sayısı') ? { etiket: 'Bölüm Sayısı', deger: o('Bölüm / Oda Sayısı')! } : undefined,
      o('Tavan Yüksekliği') ? { etiket: 'Tavan Yüksekliği', deger: o('Tavan Yüksekliği')! } : undefined,
      o('Vitrin Genişliği') ? { etiket: 'Vitrin Genişliği', deger: o('Vitrin Genişliği')! } : undefined,
      o('Isıtma Tipi') ? { etiket: 'Isıtma', deger: o('Isıtma Tipi')! } : undefined,
      o('Elektrik Gücü') ? { etiket: 'Elektrik Gücü', deger: o('Elektrik Gücü')! } : undefined,
      o('Ruhsat & Baca') ? { etiket: 'Ruhsat & Baca', deger: o('Ruhsat & Baca')! } : undefined,
      o('Yük Asansörü') ? { etiket: 'Yük Asansörü', deger: o('Yük Asansörü')! } : undefined,
      o('Devren') ? { etiket: 'Devren', deger: o('Devren')! } : undefined,
      o('Tapu Durumu') ? { etiket: 'Tapu Durumu', deger: o('Tapu Durumu')! } : undefined,
    ].filter(Boolean) as KunyeSatiri[];

    if (ticariSatirlar.length) {
      gruplar.push({ baslik: 'Ticari Alan Bilgileri', satirlar: ticariSatirlar });
    }
  } else {
    // KONUT (Daire, Villa vb.)
    const konutSatirlar: KunyeSatiri[] = [
      o('Brüt Metrekare') ? { etiket: 'Brüt Alan', deger: o('Brüt Metrekare')!, vurgulu: true } : undefined,
      o('Net Metrekare') ? { etiket: 'Net Alan', deger: o('Net Metrekare')! } : undefined,
      o('Açık Alan / Bahçe') ? { etiket: 'Açık / Bahçe Alanı', deger: o('Açık Alan / Bahçe')! } : undefined,
      o('Oda Sayısı') ? { etiket: 'Oda Sayısı', deger: o('Oda Sayısı')!, vurgulu: true } : undefined,
      o('Salon Sayısı') ? { etiket: 'Salon Sayısı', deger: o('Salon Sayısı')! } : undefined,
      o('Bina Yaşı') ? { etiket: 'Bina Yaşı', deger: o('Bina Yaşı')! } : undefined,
      o('Bulunduğu Kat') ? { etiket: 'Bulunduğu Kat', deger: o('Bulunduğu Kat')! } : undefined,
      o('Kat Sayısı') ? { etiket: 'Toplam Kat Sayısı', deger: o('Kat Sayısı')! } : undefined,
      o('Isıtma Tipi') ? { etiket: 'Isıtma Tipi', deger: o('Isıtma Tipi')! } : undefined,
      o('Banyo Sayısı') ? { etiket: 'Banyo Sayısı', deger: o('Banyo Sayısı')! } : undefined,
      o('Tuvalet Sayısı') ? { etiket: 'Tuvalet / WC', deger: o('Tuvalet Sayısı')! } : undefined,
      o('Balkon') ? { etiket: 'Balkon', deger: o('Balkon')! } : undefined,
      o('Asansör') ? { etiket: 'Asansör', deger: o('Asansör')! } : undefined,
      o('Otopark') ? { etiket: 'Otopark', deger: o('Otopark')! } : undefined,
      o('Eşya Durumu') ? { etiket: 'Eşya Durumu', deger: o('Eşya Durumu')! } : undefined,
      o('Kullanım Durumu') ? { etiket: 'Kullanım Durumu', deger: o('Kullanım Durumu')! } : undefined,
      o('Site İçerisinde') ? { etiket: 'Site İçerisinde', deger: o('Site İçerisinde')! } : undefined,
      o('Site / Proje Adı') ? { etiket: 'Site / Proje Adı', deger: o('Site / Proje Adı')! } : undefined,
      o('Tapu Durumu') ? { etiket: 'Tapu Durumu', deger: o('Tapu Durumu')! } : undefined,
      o('Yapı Durumu') ? { etiket: 'Yapı Durumu', deger: o('Yapı Durumu')! } : undefined,
      o('Yapı Tipi') ? { etiket: 'Yapı Tipi', deger: o('Yapı Tipi')! } : undefined,
      o('Cephe') ? { etiket: 'Cephe', deger: o('Cephe')! } : undefined,
    ].filter(Boolean) as KunyeSatiri[];

    if (konutSatirlar.length) {
      gruplar.push({ baslik: 'Konut & Yapı Özellikleri', satirlar: konutSatirlar });
    }
  }

  // DİĞER PORTAL VERİLERİ (Önceden çekilmiş ama yukarıda gruplanmamış olanlar)
  const bilinen = new Set([
    'Fiyat', 'm² Birim Fiyatı', 'Aidat', 'Depozito', 'Krediye Uygunluk', 'Takas', 'Pazarlık',
    'Kira Getirisi', 'İmar Durumu', 'Brüt Metrekare', 'Satılan Hisse Alanı', 'Ada', 'Parsel',
    'Pafta', 'KAKS (Emsal)', 'Gabari', 'TAKS', 'Tapu Durumu', 'Yol Durumu', 'Yola Cephe',
    'Zemin Yapısı', 'Kapalı Alan', 'Net Metrekare', 'Açık Alan / Bahçe', 'Bölüm / Oda Sayısı',
    'Tavan Yüksekliği', 'Vitrin Genişliği', 'Isıtma Tipi', 'Elektrik Gücü', 'Ruhsat & Baca',
    'Yük Asansörü', 'Devren', 'Oda Sayısı', 'Salon Sayısı', 'Bina Yaşı', 'Bulunduğu Kat',
    'Kat Sayısı', 'Banyo Sayısı', 'Tuvalet Sayısı', 'Balkon', 'Asansör', 'Otopark',
    'Eşya Durumu', 'Kullanım Durumu', 'Site İçerisinde', 'Site / Proje Adı', 'Yapı Durumu',
    'Yapı Tipi', 'Cephe', 'İlan Numarası', 'İlan Güncelleme Tarihi', 'Kategori', 'Sahibinden No',
    'Hepsiemlak No', 'Emlakjet No', 'Video URL', 'Sanal Tur URL'
  ]);

  const ekSatirlar: KunyeSatiri[] = Object.entries(ozellikler)
    .filter(([k, v]) => !bilinen.has(k) && v && v !== 'Belirtilmemiş')
    .map(([k, v]) => ({ etiket: k, deger: v }));

  if (ekSatirlar.length) {
    gruplar.push({ baslik: 'Ek Detaylar', satirlar: ekSatirlar });
  }

  return gruplar;
}

/**
 * İlanın donanım listesini (çiplerini) 5 mantıksal gruba ayırır.
 */
export function donanimGrupla(donanimListesi: string[]): Array<{ baslik: string; ogeler: string[] }> {
  if (!donanimListesi.length) return [];
  const secilenler = new Set(donanimListesi);

  const gruplar: Array<{ baslik: string; ogeler: string[] }> = [];
  const atanmis = new Set<string>();

  for (const kat of DONANIM_KATALOGU) {
    const eslesenler = kat.ogeListesi.filter((o) => secilenler.has(o));
    if (eslesenler.length) {
      gruplar.push({ baslik: kat.baslik, ogeler: eslesenler });
      eslesenler.forEach((e) => atanmis.add(e));
    }
  }

  // Herhangi bir kataloğa girmemiş serbest donanımlar (örneğin portaldan gelenler)
  const diger = donanimListesi.filter((d) => !atanmis.has(d));
  if (diger.length) {
    gruplar.push({ baslik: 'Diğer Donanımlar', ogeler: diger });
  }

  return gruplar;
}
