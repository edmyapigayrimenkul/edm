/** Kaynak Sahibinden tam-form verisinden scripts/sahibinden-form-kapsami.mjs ile üretilir. */
export const SAHIBINDEN_FORM_ZORUNLU_ALANLAR: Record<string, string[]> = {
  "arsa|kat-karsiligi-satilik|*": [
    "imar_durumu",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu"
  ],
  "arsa|kiralik|*": [
    "depozito",
    "imar_durumu",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu"
  ],
  "arsa|satilik|*": [
    "imar_durumu",
    "kimden",
    "kredi_uygunluk",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "bina|kiralik|*": [
    "asansor",
    "bina_yasi",
    "bir_kattaki_daire",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "otopark",
    "tapu_durumu"
  ],
  "bina|satilik|*": [
    "asansor",
    "bina_yasi",
    "bir_kattaki_daire",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "otopark",
    "takas",
    "tapu_durumu"
  ],
  "devre-mulk|satilik|devre-mulk": [
    "devre_mulk_donem",
    "kimden",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "oda",
    "tapu_durumu"
  ],
  "gunluk-konaklama|gunluk-kiralik|apart-pansiyon": [
    "apart_oda",
    "banyo_sayisi",
    "bulundugu_kat",
    "gunluk_izin_belge_no",
    "isitma_tipi",
    "kimden",
    "kisi_kapasitesi",
    "m2_brut",
    "m2_net",
    "yatak_sayisi"
  ],
  "gunluk-konaklama|gunluk-kiralik|devre-mulk": [
    "banyo_sayisi",
    "gunluk_devre_mulk_donem",
    "gunluk_devre_mulk_sure",
    "gunluk_devre_mulk_tesisi",
    "gunluk_izin_belge_no",
    "kimden",
    "kisi_kapasitesi",
    "m2_brut",
    "m2_net",
    "oda",
    "yatak_sayisi"
  ],
  "isyeri|devren-kiralik|acente": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|akaryakit-istasyonu": [
    "gunluk_satis_litre",
    "kapali_alan",
    "kimden",
    "m2_acik",
    "pompa_sayisi"
  ],
  "isyeri|devren-kiralik|aktar-baharatci": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|anaokulu-kres": [
    "anaokulu_oda_duzeni",
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|arac-galerisi-servis": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|atolye": [
    "atolye_giris_yuksekligi",
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "ticari_bolum_araligi"
  ],
  "isyeri|devren-kiralik|avm-standi": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|balikci": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|bar": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|bijuteri-takici": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|borekci": [
    "bina_yasi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|bufe": [
    "bufe_yapi_tipi",
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|camasirhane": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|cay-ocagi": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|cep-telefonu-dukkani": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|cicekci-fidancilik": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|ciftlik": [
    "kapali_alan",
    "kimden",
    "m2_acik"
  ],
  "isyeri|devren-kiralik|cig-kofteci": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|cocuk-oyun-alani": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|dugun-salonu": [
    "isitma_tipi",
    "kimden",
    "kisi_kapasitesi",
    "m2_brut",
    "masa_sayisi"
  ],
  "isyeri|devren-kiralik|dukkan-magaza": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "ticari_bolum"
  ],
  "isyeri|devren-kiralik|eczane": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|elektrikci-hirdavatci": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|elektronik-magazasi": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|etkinlik-alani": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|fabrika": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "tavan_yuksekligi",
    "ticari_bolum"
  ],
  "isyeri|devren-kiralik|fotograf-studyosu": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|gece-kulubu-disko": [
    "bina_yasi",
    "isletme_kapasitesi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|giyim-magazasi": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|gozlukcu": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|guzellik-merkezi": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|hali-yikama": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|hamam-sauna-spa": [
    "bina_yasi",
    "kimden",
    "kisi_kapasitesi",
    "m2_brut",
    "spa_hizmet_cinsiyeti",
    "ticari_bolum"
  ],
  "isyeri|devren-kiralik|huzur-evi": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|imalathane": [
    "bina_yasi",
    "kimden",
    "m2_brut",
    "ticari_bolum_araligi"
  ],
  "isyeri|devren-kiralik|internet-oyun-kafe": [
    "bina_yasi",
    "isletme_kapasitesi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|kafe": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|kantin": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|kasap": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|kiraathane": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|kirtasiye": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|kozmetik-magazasi": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|kuafor-berber": [
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kimden",
    "kuafor_oda_duzeni",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|kurs-egitim-merkezi": [
    "bina_yasi",
    "derslik_sayisi",
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|kuru-temizleme": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|kuruyemisci": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|kuyumcu": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|lunapark": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|maden-ocagi": [
    "kimden",
    "maden_isletme_ruhsati"
  ],
  "isyeri|devren-kiralik|manav": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|market": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|matbaa": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|medikal-market": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|moda-evi": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|muayenehane": [
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "muayenehane_oda_duzeni"
  ],
  "isyeri|devren-kiralik|nakliyat-kargo": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|nalbur": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|ofis-buro": [
    "bina_yasi",
    "devren_ofis_oda_duzeni",
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|okul": [
    "bina_yasi",
    "derslik_sayisi",
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|oto-servis-bakim": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|oto-yedek-parcaci": [
    "kimden"
  ],
  "isyeri|devren-kiralik|oto-yikama-kuafor": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|pastane-firin-tatlici": [
    "bina_yasi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|pazar-yeri": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|pet-shop": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|piknik-alani-kahvalti-bahcesi": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|prova-kayit-studyosu": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "prova_oda_sayisi",
    "zemin_etudu"
  ],
  "isyeri|devren-kiralik|radyo-istasyonu-tv-kanali": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|restoran-kafe": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "kisi_kapasitesi",
    "m2_brut",
    "masa_sayisi"
  ],
  "isyeri|devren-kiralik|saat-magazasi": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|saglik-merkezi": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|sans-oyunlari-bayisi": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|sarkuteri": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|sebze-meyve-hali": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|soguk-hava-deposu": [
    "bina_yasi",
    "giris_yuksekligi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|spor-tesisi": [
    "bina_yasi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|su-tup-bayisi": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|taksi-duragi": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|tamirhane": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|tekel-bayisi": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|teknik-servis": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|terzi": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|toplanti-etkinlik-salonu": [
    "bina_yasi",
    "bulundugu_kat",
    "etkinlik_tavan_yuksekligi",
    "isitma_tipi",
    "isletme_kapasitesi",
    "kat_sayisi",
    "kimden",
    "m2_brut",
    "ticari_bolum"
  ],
  "isyeri|devren-kiralik|tuhafiye": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|tuvalet": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|veteriner": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-kiralik|yurt": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "yatak_sayisi",
    "yurt_oda_sayisi"
  ],
  "isyeri|devren-kiralik|zuccaciye": [
    "isitma_tipi",
    "kimden",
    "m2_brut"
  ],
  "isyeri|devren-satilik|acente": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|akaryakit-istasyonu": [
    "gunluk_satis_litre",
    "kapali_alan",
    "kimden",
    "m2_acik",
    "mulk_sahibi_statu",
    "pompa_sayisi",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|aktar-baharatci": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|anaokulu-kres": [
    "anaokulu_oda_duzeni",
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|arac-galerisi-servis": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|atolye": [
    "atolye_giris_yuksekligi",
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "ticari_bolum_araligi"
  ],
  "isyeri|devren-satilik|avm-standi": [
    "kimden",
    "m2_brut",
    "takas"
  ],
  "isyeri|devren-satilik|balikci": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|bar": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|bijuteri-takici": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|borekci": [
    "bina_yasi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|bufe": [
    "bufe_yapi_tipi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|camasirhane": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|cay-ocagi": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|cep-telefonu-dukkani": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|cicekci-fidancilik": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|ciftlik": [
    "kapali_alan",
    "kimden",
    "m2_acik",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|cig-kofteci": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|cocuk-oyun-alani": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|dugun-salonu": [
    "isitma_tipi",
    "kimden",
    "kisi_kapasitesi",
    "m2_brut",
    "masa_sayisi",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|dukkan-magaza": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "kredi_uygunluk",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "ticari_bolum"
  ],
  "isyeri|devren-satilik|eczane": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|elektrikci-hirdavatci": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|enerji-santrali": [
    "enerji_santrali_turu",
    "kimden",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|fabrika": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "tavan_yuksekligi",
    "ticari_bolum"
  ],
  "isyeri|devren-satilik|fotograf-studyosu": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|gece-kulubu-disko": [
    "bina_yasi",
    "isletme_kapasitesi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|giyim-magazasi": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|gozlukcu": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|guzellik-merkezi": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|hali-yikama": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|hamam-sauna-spa": [
    "bina_yasi",
    "kimden",
    "kisi_kapasitesi",
    "kredi_uygunluk",
    "m2_brut",
    "mulk_sahibi_statu",
    "spa_hizmet_cinsiyeti",
    "takas",
    "tapu_durumu",
    "ticari_bolum"
  ],
  "isyeri|devren-satilik|huzur-evi": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|imalathane": [
    "bina_yasi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "ticari_bolum_araligi"
  ],
  "isyeri|devren-satilik|internet-oyun-kafe": [
    "bina_yasi",
    "isletme_kapasitesi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|kafe": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|kasap": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|kiraathane": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|kirtasiye": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|kozmetik-magazasi": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|kuafor-berber": [
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kimden",
    "kuafor_oda_duzeni",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|kurs-egitim-merkezi": [
    "bina_yasi",
    "derslik_sayisi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|kuru-temizleme": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|kuruyemisci": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|kuyumcu": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|lunapark": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|maden-ocagi": [
    "kimden",
    "maden_isletme_ruhsati",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|manav": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|market": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|moda-evi": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|muayenehane": [
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "muayenehane_oda_duzeni",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|nakliyat-kargo": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|nalbur": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|ofis-buro": [
    "bina_yasi",
    "devren_ofis_oda_duzeni",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|okul": [
    "bina_yasi",
    "derslik_sayisi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|oto-servis-bakim": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|oto-yedek-parcaci": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|oto-yikama-kuafor": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|pastane-firin-tatlici": [
    "bina_yasi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|pazar-yeri": [
    "kimden",
    "m2_brut",
    "takas"
  ],
  "isyeri|devren-satilik|pet-shop": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|piknik-alani-kahvalti-bahcesi": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|radyo-istasyonu-tv-kanali": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|restoran-kafe": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "kisi_kapasitesi",
    "m2_brut",
    "masa_sayisi",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|saglik-merkezi": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|sans-oyunlari-bayisi": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|sarkuteri": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|sebze-meyve-hali": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|soguk-hava-deposu": [
    "bina_yasi",
    "giris_yuksekligi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|spor-tesisi": [
    "bina_yasi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|su-tup-bayisi": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|taksi-duragi": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|tamirhane": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|tekel-bayisi": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|teknik-servis": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|terzi": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|toplanti-etkinlik-salonu": [
    "bina_yasi",
    "bulundugu_kat",
    "etkinlik_tavan_yuksekligi",
    "isitma_tipi",
    "isletme_kapasitesi",
    "kat_sayisi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "ticari_bolum"
  ],
  "isyeri|devren-satilik|tuhafiye": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|tuvalet": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|veteriner": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|devren-satilik|yurt": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "yatak_sayisi",
    "yurt_oda_sayisi"
  ],
  "isyeri|devren-satilik|zuccaciye": [
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|kiralik|akaryakit-istasyonu": [
    "bina_yasi",
    "gunluk_satis_litre",
    "kapali_alan",
    "kimden",
    "m2_acik",
    "mulk_sahibi_statu",
    "pompa_sayisi",
    "tapu_durumu"
  ],
  "isyeri|kiralik|apartman-dairesi": [
    "bina_yasi",
    "binadaki_kat_sayisi",
    "bulundugu_kat",
    "isitma_tipi",
    "isyeri_banyo_sayisi",
    "isyeri_yapi_durumu",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum",
    "zemin_etudu"
  ],
  "isyeri|kiralik|atolye": [
    "atolye_giris_yuksekligi",
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum_araligi"
  ],
  "isyeri|kiralik|ciftlik": [
    "kimden",
    "m2_acik",
    "mulk_sahibi_statu",
    "tapu_durumu"
  ],
  "isyeri|kiralik|depo-antrepo": [
    "bina_yasi",
    "isyeri_yapi_durumu",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "zemin_etudu"
  ],
  "isyeri|kiralik|dukkan-magaza": [
    "bina_yasi",
    "isitma_tipi",
    "isyeri_yapi_durumu",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum"
  ],
  "isyeri|kiralik|fabrika": [
    "bina_yasi",
    "fabrika_bina_adedi",
    "isitma_tipi",
    "isyeri_yapi_durumu",
    "kapali_alan",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_acik",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum",
    "zemin_etudu"
  ],
  "isyeri|kiralik|garaj-park-yeri": [
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu"
  ],
  "isyeri|kiralik|hamam-sauna-spa": [
    "bina_yasi",
    "isyeri_yapi_durumu",
    "kimden",
    "kisi_kapasitesi",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum"
  ],
  "isyeri|kiralik|hazir-sanal-ofis": [
    "hazir_ofis_kiralama_suresi",
    "hazir_ofis_sekreter",
    "kimden"
  ],
  "isyeri|kiralik|imalathane": [
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum_araligi"
  ],
  "isyeri|kiralik|is-hani-kati-ofisi": [
    "bina_yasi",
    "binadaki_kat_sayisi",
    "bulundugu_kat",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum",
    "zemin_etudu"
  ],
  "isyeri|kiralik|komple-bina": [
    "bina_yasi",
    "isitma_tipi",
    "isyeri_asansor",
    "isyeri_yapi_durumu",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bina_tipi",
    "zemin_etudu"
  ],
  "isyeri|kiralik|ofis-buro": [
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_oda_duzeni"
  ],
  "isyeri|kiralik|okul": [
    "bina_yasi",
    "derslik_sayisi",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu"
  ],
  "isyeri|kiralik|otopark": [
    "arac_kapasitesi",
    "bina_yasi",
    "kat_sayisi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "otopark_tipi",
    "tapu_durumu"
  ],
  "isyeri|kiralik|pazar-yeri": [
    "kimden",
    "m2_brut"
  ],
  "isyeri|kiralik|plaza": [
    "bina_yasi",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu"
  ],
  "isyeri|kiralik|plaza-kati": [
    "bina_yasi",
    "bulundugu_kat",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu"
  ],
  "isyeri|kiralik|rezidans-kati-ofisi": [
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum"
  ],
  "isyeri|kiralik|spor-tesisi": [
    "bina_yasi",
    "kimden",
    "mulk_sahibi_statu",
    "spor_tesisi_turu",
    "tapu_durumu"
  ],
  "isyeri|kiralik|toplanti-etkinlik-salonu": [
    "isitma_tipi",
    "isletme_kapasitesi",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu"
  ],
  "isyeri|kiralik|villa": [
    "bina_yasi",
    "isitma_tipi",
    "isyeri_durumu",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu"
  ],
  "isyeri|satilik|akaryakit-istasyonu": [
    "bina_yasi",
    "gunluk_satis_litre",
    "kapali_alan",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "m2_acik",
    "mulk_sahibi_statu",
    "pompa_sayisi",
    "tapu_durumu"
  ],
  "isyeri|satilik|apartman-dairesi": [
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "isyeri_banyo_sayisi",
    "isyeri_yapi_durumu",
    "kat_sayisi",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "ticari_bolum",
    "zemin_etudu"
  ],
  "isyeri|satilik|atolye": [
    "atolye_giris_yuksekligi",
    "bina_yasi",
    "isitma_tipi",
    "isyeri_durumu",
    "kimden",
    "kiracili",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "ticari_bolum_araligi"
  ],
  "isyeri|satilik|ciftlik": [
    "kapali_alan",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "m2_acik",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|satilik|depo-antrepo": [
    "bina_yasi",
    "isitma_tipi",
    "isyeri_yapi_durumu",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "zemin_etudu"
  ],
  "isyeri|satilik|dukkan-magaza": [
    "bina_yasi",
    "isitma_tipi",
    "isyeri_durumu",
    "kimden",
    "kredi_uygunluk",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "ticari_bolum"
  ],
  "isyeri|satilik|fabrika": [
    "bina_yasi",
    "fabrika_bina_adedi",
    "isitma_tipi",
    "isyeri_yapi_durumu",
    "kapali_alan",
    "kat_sayisi",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_acik",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum",
    "zemin_etudu"
  ],
  "isyeri|satilik|garaj-park-yeri": [
    "isyeri_durumu",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|satilik|hamam-sauna-spa": [
    "bina_yasi",
    "isyeri_yapi_durumu",
    "kimden",
    "kiracili",
    "kisi_kapasitesi",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum"
  ],
  "isyeri|satilik|imalathane": [
    "bina_yasi",
    "isitma_tipi",
    "isyeri_durumu",
    "kimden",
    "kiracili",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|satilik|is-hani-kati-ofisi": [
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "isyeri_yapi_durumu",
    "kat_sayisi",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum",
    "zemin_etudu"
  ],
  "isyeri|satilik|komple-bina": [
    "bina_yasi",
    "isitma_tipi",
    "isyeri_yapi_durumu",
    "kat_sayisi",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bina_tipi",
    "zemin_etudu"
  ],
  "isyeri|satilik|maden-ocagi": [
    "kimden",
    "maden_isletme_ruhsati",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|satilik|ofis-buro": [
    "bina_yasi",
    "isitma_tipi",
    "isyeri_durumu",
    "kimden",
    "kiracili",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "ticari_oda_duzeni"
  ],
  "isyeri|satilik|okul": [
    "bina_yasi",
    "derslik_sayisi",
    "isitma_tipi",
    "isyeri_durumu",
    "kimden",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu"
  ],
  "isyeri|satilik|otopark": [
    "arac_kapasitesi",
    "bina_yasi",
    "kat_sayisi",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "m2_brut",
    "mulk_sahibi_statu",
    "otopark_tipi",
    "tapu_durumu"
  ],
  "isyeri|satilik|pazar-yeri": [
    "kimden",
    "m2_brut",
    "takas"
  ],
  "isyeri|satilik|plaza": [
    "bina_yasi",
    "isitma_tipi",
    "isyeri_durumu",
    "kat_sayisi",
    "kimden",
    "kiracili",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu"
  ],
  "isyeri|satilik|plaza-kati": [
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "isyeri_yapi_durumu",
    "kat_sayisi",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum",
    "zemin_etudu"
  ],
  "isyeri|satilik|rezidans-kati-ofisi": [
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "isyeri_durumu",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "ticari_bolum"
  ],
  "isyeri|satilik|spor-tesisi": [
    "bina_yasi",
    "isyeri_yapi_durumu",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "spor_tesisi_turu",
    "tapu_durumu"
  ],
  "isyeri|satilik|toplanti-etkinlik-salonu": [
    "bina_yasi",
    "bulundugu_kat",
    "etkinlik_tavan_yuksekligi",
    "isletme_kapasitesi",
    "isyeri_yapi_durumu",
    "kat_sayisi",
    "kimden",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "ticari_bolum"
  ],
  "isyeri|satilik|villa": [
    "bina_yasi",
    "isitma_tipi",
    "isyeri_durumu",
    "isyeri_yapi_durumu",
    "kimden",
    "kiracili",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "mulk_sahibi_statu",
    "takas",
    "tapu_durumu",
    "zemin_etudu"
  ],
  "konut|devren-satilik|daire": [
    "ara_kat",
    "asansor",
    "banyo_sayisi",
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kalan_odeme_tutari",
    "kalan_taksit",
    "kat_sayisi",
    "kimden",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "otopark",
    "site_icerisinde",
    "tapu_durumu"
  ],
  "konut|devren-satilik|villa": [
    "banyo_sayisi",
    "bina_yasi",
    "isitma_tipi",
    "kalan_odeme_tutari",
    "kalan_taksit",
    "kimden",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "otopark",
    "site_icerisinde",
    "tapu_durumu"
  ],
  "konut|gunluk-kiralik|daire": [
    "ara_kat",
    "asansor",
    "balkon",
    "banyo_sayisi",
    "bulundugu_kat",
    "gunluk_izin_belge_no",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "m2_brut",
    "m2_net",
    "misafir_kapasitesi",
    "mutfak_tipi",
    "oda",
    "otopark",
    "site_icerisinde",
    "yatak_sayisi_gunluk"
  ],
  "konut|gunluk-kiralik|mustakil-ev": [
    "balkon",
    "banyo_sayisi",
    "gunluk_izin_belge_no",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "m2_net",
    "misafir_kapasitesi",
    "mutfak_tipi",
    "oda",
    "yatak_sayisi_gunluk"
  ],
  "konut|gunluk-kiralik|rezidans": [
    "ara_kat",
    "asansor",
    "balkon",
    "banyo_sayisi",
    "bulundugu_kat",
    "gunluk_izin_belge_no",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "m2_brut",
    "m2_net",
    "misafir_kapasitesi",
    "mutfak_tipi",
    "oda",
    "otopark",
    "site_icerisinde",
    "yatak_sayisi_gunluk"
  ],
  "konut|gunluk-kiralik|villa": [
    "banyo_sayisi",
    "gunluk_izin_belge_no",
    "isitma_tipi",
    "kimden",
    "m2_brut",
    "m2_net",
    "misafir_kapasitesi",
    "mutfak_tipi",
    "oda",
    "site_icerisinde",
    "yatak_sayisi_gunluk"
  ],
  "konut|kiralik|ciftlik-evi": [
    "arazi_m2",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "depozito",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "oda",
    "salon_sayisi",
    "tapu_durumu",
    "yapi_tipi",
    "zemin_etudu"
  ],
  "konut|kiralik|daire": [
    "ara_kat",
    "asansor",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "otopark",
    "site_icerisinde",
    "tapu_durumu"
  ],
  "konut|kiralik|kosk-konak": [
    "arazi_m2",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "depozito",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "oda",
    "salon_sayisi",
    "tapu_durumu",
    "yapi_durumu",
    "yapi_tipi",
    "zemin_etudu"
  ],
  "konut|kiralik|mustakil-ev": [
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "site_icerisinde",
    "tapu_durumu"
  ],
  "konut|kiralik|rezidans": [
    "ara_kat",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "otopark",
    "site_icerisinde",
    "tapu_durumu"
  ],
  "konut|kiralik|villa": [
    "banyo_sayisi",
    "bina_yasi",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "otopark",
    "site_icerisinde",
    "tapu_durumu"
  ],
  "konut|kiralik|yali": [
    "arazi_m2",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "depozito",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "oda",
    "salon_sayisi",
    "tapu_durumu",
    "yapi_durumu",
    "yapi_tipi",
    "zemin_etudu"
  ],
  "konut|kiralik|yali-dairesi": [
    "ara_kat",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "bulundugu_kat",
    "depozito",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "oda",
    "salon_sayisi",
    "tapu_durumu",
    "yapi_durumu",
    "yapi_tipi",
    "zemin_etudu"
  ],
  "konut|satilik|ciftlik-evi": [
    "arazi_m2",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kredi_uygunluk",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "oda",
    "salon_sayisi",
    "takas",
    "tapu_durumu",
    "yapi_tipi",
    "zemin_etudu"
  ],
  "konut|satilik|daire": [
    "ara_kat",
    "asansor",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "otopark",
    "site_icerisinde",
    "takas",
    "tapu_durumu"
  ],
  "konut|satilik|kooperatif": [
    "ara_kat",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "otopark",
    "site_icerisinde",
    "takas",
    "tapu_durumu"
  ],
  "konut|satilik|kosk-konak": [
    "arazi_m2",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "oda",
    "salon_sayisi",
    "takas",
    "tapu_durumu",
    "yapi_durumu",
    "yapi_tipi",
    "zemin_etudu"
  ],
  "konut|satilik|mustakil-ev": [
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "isitma_tipi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "site_icerisinde",
    "takas",
    "tapu_durumu"
  ],
  "konut|satilik|rezidans": [
    "ara_kat",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "otopark",
    "site_icerisinde",
    "takas",
    "tapu_durumu"
  ],
  "konut|satilik|villa": [
    "banyo_sayisi",
    "bina_yasi",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "otopark",
    "site_icerisinde",
    "takas",
    "tapu_durumu"
  ],
  "konut|satilik|yali": [
    "arazi_m2",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "oda",
    "salon_sayisi",
    "takas",
    "tapu_durumu",
    "yapi_durumu",
    "yapi_tipi",
    "zemin_etudu"
  ],
  "konut|satilik|yali-dairesi": [
    "ara_kat",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kredi_uygunluk",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "oda",
    "otopark",
    "salon_sayisi",
    "takas",
    "tapu_durumu",
    "yapi_durumu",
    "yapi_tipi",
    "zemin_etudu"
  ],
  "konut|satilik|yazlik": [
    "ara_kat",
    "balkon",
    "banyo_sayisi",
    "bina_yasi",
    "bulundugu_kat",
    "isitma_tipi",
    "kat_sayisi",
    "kimden",
    "kullanim_durumu",
    "m2_brut",
    "m2_net",
    "mulk_sahibi_statu",
    "mutfak_tipi",
    "oda",
    "site_icerisinde",
    "takas",
    "tapu_durumu"
  ],
  "turistik|kiralik|apart-otel": [
    "apart_sayisi",
    "bina_yasi",
    "depozito",
    "kat_sayisi",
    "kimden",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "zemin_etudu"
  ],
  "turistik|kiralik|butik-otel": [
    "bina_yasi",
    "depozito",
    "kat_sayisi",
    "kimden",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "zemin_etudu"
  ],
  "turistik|kiralik|kamp-alani": [
    "kimden",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "toplam_arazi_donum"
  ],
  "turistik|kiralik|motel": [
    "bina_yasi",
    "depozito",
    "kat_sayisi",
    "kimden",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "zemin_etudu"
  ],
  "turistik|kiralik|otel": [
    "bina_yasi",
    "depozito",
    "kat_sayisi",
    "kimden",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "yildiz_sinifi",
    "zemin_etudu"
  ],
  "turistik|kiralik|pansiyon": [
    "bina_yasi",
    "depozito",
    "kat_sayisi",
    "kimden",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "zemin_etudu"
  ],
  "turistik|kiralik|plaj": [
    "kimden",
    "mulk_sahibi_statu",
    "plaj_kapasite",
    "plaj_m2",
    "tapu_durumu"
  ],
  "turistik|kiralik|tatil-koyu": [
    "bina_yasi",
    "depozito",
    "kat_sayisi",
    "kimden",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "yildiz_sinifi",
    "zemin_etudu"
  ],
  "turistik|satilik|apart-otel": [
    "apart_sayisi",
    "bina_yasi",
    "kat_sayisi",
    "kimden",
    "kredi_uygunluk",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "zemin_etudu"
  ],
  "turistik|satilik|butik-otel": [
    "bina_yasi",
    "kat_sayisi",
    "kimden",
    "kredi_uygunluk",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "zemin_etudu"
  ],
  "turistik|satilik|kamp-alani": [
    "kimden",
    "mulk_sahibi_statu",
    "tapu_durumu",
    "toplam_arazi_donum"
  ],
  "turistik|satilik|motel": [
    "bina_yasi",
    "kat_sayisi",
    "kimden",
    "kredi_uygunluk",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "zemin_etudu"
  ],
  "turistik|satilik|otel": [
    "bina_yasi",
    "kat_sayisi",
    "kimden",
    "kredi_uygunluk",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "yildiz_sinifi",
    "zemin_etudu"
  ],
  "turistik|satilik|pansiyon": [
    "bina_yasi",
    "kat_sayisi",
    "kimden",
    "kredi_uygunluk",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "zemin_etudu"
  ],
  "turistik|satilik|tatil-koyu": [
    "bina_yasi",
    "kat_sayisi",
    "kimden",
    "kredi_uygunluk",
    "m2_acik",
    "m2_brut",
    "mulk_sahibi_statu",
    "oda_adedi",
    "tapu_durumu",
    "yapi_durumu",
    "yatak_kapasitesi",
    "yildiz_sinifi",
    "zemin_etudu"
  ]
};
export const SAHIBINDEN_DURUMU_GEREKTIREN_DEVRE_MULK_TESISLERI: string[] = [
  "Aforia Thermal Residence",
  "Akasya Vadisi Termal",
  "Akropol Termal Megakent",
  "Armodies Termal Park",
  "Camellia Termal",
  "Club Onat Garden",
  "Çiftehan Termal",
  "Diğer Devre Mülkler",
  "Ebrar Termal Resort",
  "Emin Termal",
  "Erzin İsos Termal",
  "Göral Termal",
  "Grand Royal Termal",
  "Gülümser Hatun Termal",
  "Güre Termal Resort",
  "Hattuşa Thermal Club Saray",
  "Hayıtlı Merada Termal",
  "Heramis Termal Tatil Köyü",
  "Hitit Ayaş Termal & Spa",
  "İnan Termal",
  "Kral Termal",
  "Laguna Termal Resort",
  "Modern Saraylar",
  "Mola İstanbul",
  "My House Bodrum Tatil Evleri",
  "Narven Termal Kasaba",
  "Naskon Sapphire Resort & Spa",
  "Royal Doğa Termal",
  "Sarayhan Termal Hotel",
  "Sefa Termal",
  "Sinpaş Kızılbük",
  "Sivas Termal",
  "Taraklı Termal",
  "Vadi Termal",
  "Watercastle Suites",
  "Yalova Thermal Palace"
];

export function sahibindenAlanKaynaktaZorunlu(alan: string, grup: string, islem: string, tip: string, degerler: Record<string, unknown> = {}): boolean {
  const alanlar = SAHIBINDEN_FORM_ZORUNLU_ALANLAR[grup + '|' + islem + '|' + tip] ?? SAHIBINDEN_FORM_ZORUNLU_ALANLAR[grup + '|' + islem + '|*'];
  if (alanlar?.includes(alan)) return true;
  return alan === 'devre_mulk_durumu' && grup === 'devre-mulk' && SAHIBINDEN_DURUMU_GEREKTIREN_DEVRE_MULK_TESISLERI.includes(String(degerler.devre_mulk_tesisi ?? ''));
}
