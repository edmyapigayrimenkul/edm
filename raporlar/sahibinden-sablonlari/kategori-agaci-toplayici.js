/*
 * Sahibinden Pro Ofis ilan ekranının DevTools Console'unda çalıştırılır.
 * Uygulamanın kategori servisiyle yalnızca Emlak dalını okur; hesap veya ilan
 * verisi toplamaz. Alt kategoriler ayrı isteklerle yüklendiği için kökten
 * gelen yanıtta görünmeyen dalları da sırayla tamamlar.
 */
(async () => {
  const injector = window.angular?.element(document.body).injector();
  if (!injector) throw new Error('Pro Ofis Angular uygulaması bulunamadı.');
  const service = injector.get('categoryService');
  const rootCategories = await service.getCategories(true, true);
  const realEstate = rootCategories.find((category) => category.title === 'Emlak');
  if (!realEstate) throw new Error('Emlak kategorisi bulunamadı.');

  const categories = [];
  const errors = [];
  const seen = new Set();
  const queue = [{ category: realEstate, parentId: null, path: [] }];

  while (queue.length) {
    const batch = queue.splice(0, 3);
    const results = await Promise.all(batch.map(async ({ category, parentId, path }) => {
      const id = String(category.categoryId);
      const nextPath = [...path, category.title];
      const node = {
        id,
        label: category.title,
        parentId,
        path: nextPath,
        hasChildren: Boolean(category.hasChildren),
      };
      let children = category.children || [];
      if (category.hasChildren && children.length === 0) {
        try {
          children = await service.getCategoriesByParentId(id);
        } catch (error) {
          errors.push({ id, path: nextPath, error: String(error) });
        }
      }
      return { node, children };
    }));

    for (const { node, children } of results) {
      if (seen.has(node.id)) continue;
      seen.add(node.id);
      categories.push(node);
      for (const category of children) {
        queue.push({ category, parentId: node.id, path: node.path });
      }
    }
  }

  const record = {
    source: 'Sahibinden Pro Ofis categoryService',
    capturedAt: new Date().toISOString(),
    scope: 'Emlak kategori ağacı',
    count: categories.length,
    leafCount: categories.filter((category) => !category.hasChildren).length,
    errors,
    categories,
  };
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }));
  anchor.download = 'sahibinden-emlak-kategori-agaci.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 30_000);
  console.info(`EDM_CATEGORY_EXPORT ${record.count} kategori, ${record.leafCount} son kategori, ${errors.length} hata.`);
  return { count: record.count, leafCount: record.leafCount, errorCount: errors.length };
})();
