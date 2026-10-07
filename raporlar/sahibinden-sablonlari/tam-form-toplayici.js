/*
 * Sahibinden Pro Ofis ilan ekranının DevTools Console'unda çalıştırılır.
 * Emlak kategorilerinin yeni ilan formu şemasını ve seçeneklerini salt okunur alır.
 * İlan, taslak, hesap, oturum veya formda yazılmış değerleri toplamaz.
 */
(async () => {
  const injector = window.angular?.element(document.body).injector();
  if (!injector) throw new Error('Pro Ofis Angular uygulaması bulunamadı.');
  const kategoriServisi = injector.get('categoryService');
  const ilanServisi = injector.get('classifiedService');
  const kokler = await kategoriServisi.getCategories(true, true);
  const emlak = kokler.find((kategori) => kategori.title === 'Emlak');
  if (!emlak) throw new Error('Emlak kategorisi bulunamadı.');

  const kuyruk = [{ kategori: emlak, yol: [] }];
  const sonKategoriler = [];
  const cozulemeyenler = [];
  const hatalar = [];
  const gorulenler = new Set();

  while (kuyruk.length) {
    const toplu = kuyruk.splice(0, 3);
    const sonuclar = await Promise.all(toplu.map(async ({ kategori, yol }) => {
      const id = String(kategori.categoryId);
      const sonrakiYol = [...yol, kategori.title];
      if (!kategori.hasChildren) return { id, kategori, yol: sonrakiYol, cocuklar: [] };
      try {
        const cocuklar = kategori.children?.length
          ? kategori.children
          : await kategoriServisi.getCategoriesByParentId(id);
        return { id, kategori, yol: sonrakiYol, cocuklar };
      } catch (hata) {
        hatalar.push({ id, yol: sonrakiYol, asama: 'kategori', hata: String(hata) });
        return { id, kategori, yol: sonrakiYol, cocuklar: [] };
      }
    }));

    for (const sonuc of sonuclar) {
      if (gorulenler.has(sonuc.id)) continue;
      gorulenler.add(sonuc.id);
      if (sonuc.cocuklar.length) {
        kuyruk.push(...sonuc.cocuklar.map((kategori) => ({ kategori, yol: sonuc.yol })));
      } else if (sonuc.kategori.hasChildren) {
        cozulemeyenler.push({ id: sonuc.id, yol: sonuc.yol });
      } else {
        sonKategoriler.push({ id: sonuc.id, yol: sonuc.yol });
      }
    }
  }

  const alanAnahtarlari = [
    'name', 'canonicalName', 'label', 'postClassifiedLabel', 'elementType', 'inputType',
    'dataType', 'required', 'multiSelect', 'multiSelectSize', 'minLength', 'maxLength',
    'minValue', 'maxValue', 'description', 'showOrder', 'sortOrder', 'showOtherOption',
    'selectedUnitLabel',
  ];
  const bolumAnahtarlari = ['name', 'label', 'formatting', 'id'];
  const alanlariTemizle = (alanlar) => Object.fromEntries(
    alanAnahtarlari
      .filter((anahtar) => alanlar[anahtar] !== undefined)
      .map((anahtar) => [anahtar, alanlar[anahtar]]),
  );
  const secenekleriTemizle = (secenekler) => (secenekler || [])
    .filter((secenek) => secenek.id !== '#ANY')
    .map(({ id, label, defaultName, visible }) => ({ id, label, defaultName, visible }));

  const sablonlar = [];
  for (let baslangic = 0; baslangic < sonKategoriler.length; baslangic += 4) {
    const toplu = sonKategoriler.slice(baslangic, baslangic + 4);
    const sonuclar = await Promise.all(toplu.map(async (kategori) => {
      try {
        const meta = await ilanServisi.getPostMetadataForNewClassified({ categoryId: kategori.id });
        const bolumler = (meta.sections || []).map((bolum) => ({
          ...Object.fromEntries(bolumAnahtarlari.filter((anahtar) => bolum[anahtar] !== undefined).map((anahtar) => [anahtar, bolum[anahtar]])),
          elements: (bolum.elements || []).map((alan) => ({
            ...alanlariTemizle(alan),
            enumValues: secenekleriTemizle(alan.enumValues),
          })),
        }));
        return {
          categoryId: kategori.id,
          path: kategori.yol,
          sectionCount: bolumler.length,
          detailGroupCount: bolumler.filter((bolum) => bolum.formatting === 'condensed').length,
          sections: bolumler,
        };
      } catch (hata) {
        hatalar.push({ id: kategori.id, yol: kategori.yol, asama: 'tam-form', hata: String(hata) });
        return null;
      }
    }));
    sablonlar.push(...sonuclar.filter(Boolean));
  }

  const kayit = {
    source: 'Sahibinden Pro Ofis classifiedService.getPostMetadataForNewClassified',
    capturedAt: new Date().toISOString(),
    count: sablonlar.length,
    leafCount: sonKategoriler.length,
    errors: hatalar,
    unresolved: cozulemeyenler,
    templates: sablonlar,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(kayit, null, 2)], { type: 'application/json' }));
  const bag = document.createElement('a');
  bag.href = url;
  bag.download = 'sahibinden-tam-form-sablonlari.json';
  bag.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  const detayGrubuSayisi = sablonlar.reduce((toplam, sablon) => toplam + sablon.detailGroupCount, 0);
  console.info(`EDM_FULL_FORM_EXPORT ${JSON.stringify({ count: kayit.count, leafCount: kayit.leafCount, detailGroups: detayGrubuSayisi, unresolved: cozulemeyenler.length, errorCount: hatalar.length })}`);
  return { count: kayit.count, leafCount: kayit.leafCount, detailGroupCount: detayGrubuSayisi, unresolved: cozulemeyenler.length, errorCount: hatalar.length };
})();
