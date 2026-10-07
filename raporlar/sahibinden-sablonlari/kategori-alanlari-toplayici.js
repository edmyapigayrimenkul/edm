/*
 * Sahibinden Pro Ofis ilan ekranının DevTools Console'unda çalıştırılır.
 * Yalnızca Emlak kategori ağacı ve kategoriye ait alan tanımlarını okur.
 * İlan, taslak, hesap, form değeri veya oturum bilgisi toplamaz.
 */
(async () => {
  const injector = window.angular?.element(document.body).injector();
  if (!injector) throw new Error('Pro Ofis Angular uygulaması bulunamadı.');
  const service = injector.get('categoryService');
  const roots = await service.getCategories(true, true);
  const emlak = roots.find((category) => category.title === 'Emlak');
  if (!emlak) throw new Error('Emlak kategorisi bulunamadı.');

  const queue = [{ category: emlak, path: [] }];
  const leaves = [];
  const errors = [];
  const emptyBranches = [];
  const seen = new Set();
  while (queue.length) {
    const batch = queue.splice(0, 3);
    const results = await Promise.all(batch.map(async ({ category, path }) => {
      const id = String(category.categoryId);
      const nextPath = [...path, category.title];
      if (!category.hasChildren) return { id, path: nextPath, hasChildren: false, children: [] };
      try {
        const children = category.children?.length ? category.children : await service.getCategoriesByParentId(id);
        return { id, path: nextPath, hasChildren: true, children };
      } catch (error) {
        errors.push({ id, path: nextPath, stage: 'categories', error: String(error) });
        return { id, path: nextPath, hasChildren: true, children: [] };
      }
    }));
    for (const result of results) {
      if (seen.has(result.id)) continue;
      seen.add(result.id);
      if (result.children.length) {
        queue.push(...result.children.map((category) => ({ category, path: result.path })));
      } else if (!result.hasChildren) {
        leaves.push({ id: result.id, path: result.path });
      } else {
        emptyBranches.push({ id: result.id, path: result.path });
      }
    }
  }

  const templates = [];
  for (let index = 0; index < leaves.length; index += 4) {
    const batch = leaves.slice(index, index + 4);
    const results = await Promise.all(batch.map(async (leaf) => {
      try {
        const attributes = await service.getCategoryAttributes(leaf.id);
        return {
          ...leaf,
          attributes: attributes.map((attribute) => ({
            name: attribute.name,
            canonicalName: attribute.canonicalName,
            label: attribute.label,
            inputType: attribute.inputType,
            dataType: attribute.dataType,
            required: Boolean(attribute.required),
            minValue: attribute.minValue,
            maxValue: attribute.maxValue,
            enumValues: (attribute.enumValues || [])
              .filter((option) => option.id !== '#ANY')
              .map(({ id, label }) => ({ id, label })),
          })),
        };
      } catch (error) {
        errors.push({ id: leaf.id, path: leaf.path, stage: 'attributes', error: String(error) });
        return { ...leaf, attributes: [] };
      }
    }));
    templates.push(...results);
  }

  const record = {
    source: 'Sahibinden Pro Ofis categoryService',
    capturedAt: new Date().toISOString(),
    scope: 'Emlak kategori öznitelikleri; tam ilan formu ve detay checkbox grupları değildir',
    count: templates.length,
    emptyBranches,
    errors,
    templates,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'sahibinden-emlak-alanlari.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  console.info(`EDM_ATTR_EXPORT ${record.count} son kategori, ${errors.length} hata.`);
  return { count: record.count, errorCount: errors.length };
})();
