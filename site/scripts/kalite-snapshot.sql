-- Salt okunur içerik denetimi: kamuya açık etkin ilanlar ve sunum geçersiz kılmaları.
SELECT i.id, i.baslik, i.aciklama, i.fiyat, i.para_birimi, i.islem, i.kategori,
       i.tip, i.tip_grup, i.oda, i.m2, i.il, i.ilce, i.mahalle, i.ozellikler,
       i.donanim, i.gorseller, i.hepsiemlak_gorseller, i.danisman_slug,
       d.baslik AS d_baslik, d.aciklama AS d_aciklama, d.temel AS d_temel,
       d.ozellikler AS d_ozellikler, d.donanim AS d_donanim,
       g.gizli AS gizli_gorseller,
       (SELECT json_group_array('/g/' || f.anahtar) FROM ilan_foto f WHERE f.ilan_id = i.id) AS yuklenen_gorseller,
       (SELECT json_group_array(json_object(
          'ilan_id', t.ilan_id, 'sorun_kodu', t.sorun_kodu, 'durum', t.durum,
          'yanit', t.yanit, 'kaynak', t.kaynak, 'notu', t.notu,
          'teyit_eden', t.teyit_eden, 'olusturma', t.olusturma, 'guncelleme', t.guncelleme
        )) FROM ilan_teyit t WHERE t.ilan_id = i.id) AS teyit_kayitlari,
       (SELECT json_group_array(json_object('slug', e.slug, 'emlakjetSlug', e.emlakjet_slug)) FROM ekip e WHERE e.yayinda = 1) AS ekip_sluglari
FROM ilanlar i
LEFT JOIN ilan_duzenleme d ON d.ilan_id = i.id
LEFT JOIN ilan_gorsel_duzen g ON g.ilan_id = i.id
WHERE i.durum = 'aktif' AND COALESCE(d.gizli, 0) = 0
ORDER BY i.id;
