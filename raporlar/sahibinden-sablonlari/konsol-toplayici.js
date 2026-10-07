/*
 * Sahibinden Pro Ofis ilan formu alan/tercih şeması dışa aktarıcı.
 * İlan formu açıkken Chrome DevTools Console'a yapıştırıp çalıştırın.
 * Form değerlerini, kişisel bilgileri, classifiedId'yi veya oturum verisini kaydetmez.
 * Yalnızca ekranda mevcut alan etiketlerini, zorunlulukları ve seçenek metinlerini alır.
 */
(() => {
  const clean = (value) => (value || '').replace(/\s+/g, ' ').trim();
  const labelFor = (el) => {
    const explicit = el.labels ? [...el.labels].map((item) => item.innerText).join(' ') : '';
    const aria = el.getAttribute('aria-label') || el.getAttribute('title') || '';
    const label = el.closest('label')?.innerText || '';
    const wrapper = el.closest('.form-group, .form-item, .form-control-wrapper, [class*="field"]');
    const wrapperLabel = wrapper?.querySelector('label, [class*="label"]')?.innerText || '';
    const sibling = el.parentElement?.querySelector(':scope > label')?.innerText || '';
    return clean(explicit || aria || label || wrapperLabel || sibling || el.name || el.id || el.type || el.tagName);
  };
  const commonNames = new Set([
    'city', 'town', 'quarter', 'country', 'inApartmentComplex', 'address',
    'addClassifiedTitle', 'addClassifiedPrice', 'addClassifiedPriceCurrency',
  ]);
  const commonLabels = new Set([
    'İlan Başlığı', 'Açıklama', 'Fiyat', 'Para Birimi', 'İlan Notum',
    'İl', 'İlçe', 'Mahalle', 'Ülke', 'Site içerisinde mi?',
  ]);
  const selector = 'input:not([type="hidden"]):not([type="file"]):not([type="button"]):not([type="submit"]):not([type="password"]), textarea, select, [contenteditable="true"]';
  const controls = [...document.querySelectorAll(selector)]
    .filter((el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true')
    .map((el) => {
      const tag = el.tagName.toLowerCase();
      const type = el.getAttribute('type') || (tag === 'select' ? 'select-one' : tag);
      const section = el.closest('section, fieldset, .panel, .card, [role="group"]');
      const sectionLabel = clean(section?.querySelector('legend, h2, h3, h4, [class*="title"]')?.innerText || '');
      const item = {
        tag,
        type,
        name: el.name || el.getAttribute('name') || null,
        id: el.id || null,
        label: labelFor(el),
        section: sectionLabel || null,
        required: Boolean(el.required || el.getAttribute('aria-required') === 'true' || el.closest('[aria-required="true"]')),
        common: commonNames.has(el.name || el.id || '') || commonLabels.has(labelFor(el)),
      };
      if (el.placeholder) item.placeholder = clean(el.placeholder);
      if (tag === 'select') {
        // City/quarter lists are large shared address datasets; preserve their selector identity,
        // but keep them out of every category file. Their reusable component is captured once.
        if (!['city', 'town', 'quarter', 'country'].includes(el.name || el.id || '')) {
          item.options = [...el.options].map((option) => clean(option.textContent)).filter(Boolean);
        }
      }
      return item;
    });
  const detailGroups = [...document.querySelectorAll('input[type="checkbox"]')].map((el) => {
    const label = labelFor(el);
    return label ? { label, group: null } : null;
  }).filter(Boolean);
  // Sahibinden detail sections place a “... seçimi yapmak istemiyorum” checkbox
  // at the end of each option group. Use those visible markers to infer section
  // boundaries without reading or saving checkbox state.
  const commonCheckboxLabels = new Set([
    'Diğer kullanıcılardan sistem üzerinden mesaj almak istemiyorum.',
    'postRulesCheck', 'representsPhoto', 'selectedImageRepresentsPhoto',
  ]);
  detailGroups.forEach((item) => {
    if (item.label === 'Eşyalı' || item.label === 'a103713') item.group = 'Genel özellikler';
  });
  let previousBoundary = -1;
  detailGroups.forEach((item, index) => {
    if (commonCheckboxLabels.has(item.label) || /FotoBot|Küçük fotoğraf dopingi/i.test(item.label)) {
      item.group = 'Ortak ilan alanları';
      return;
    }
    const match = item.label.match(/^(.+?)\s+seçimi yapmak istemiyorum$/i);
    if (!match) return;
    const group = clean(match[1]);
    const start = previousBoundary + 1;
    for (let i = start; i <= index; i += 1) {
      const candidate = detailGroups[i];
      if (candidate && candidate.group === null) candidate.group = group;
    }
    previousBoundary = index;
  });
  detailGroups.forEach((item) => {
    if (item.group !== null) return;
    item.group = item.label === 'Eşyalı' || item.label === 'a103713'
      ? 'Genel özellikler'
      : 'Ortak ilan alanları';
  });
  const detailGroupSections = [...detailGroups.reduce((sections, item) => {
    if (!sections.has(item.group)) sections.set(item.group, []);
    sections.get(item.group).push(item.label);
    return sections;
  }, new Map()).entries()].map(([label, options]) => ({ label, options, optionCount: options.length }));
  const categoryDetailGroups = detailGroups.filter((item) => item.group !== 'Ortak ilan alanları');
  const categoryDetailGroupSections = detailGroupSections.filter((section) => section.label !== 'Ortak ilan alanları');
  const checkboxGroupByLabel = new Map(detailGroups.map((item) => [item.label, item.group]));
  controls.forEach((item) => {
    if (item.type === 'checkbox') item.categoryGroup = checkboxGroupByLabel.get(item.label) || null;
  });
  let categoryPath = [...document.querySelectorAll('nav[aria-label*="breadcrumb" i] a, .breadcrumb a, [class*="breadcrumb"] a')]
    .map((el) => clean(el.innerText)).filter(Boolean);
  // The current Pro Ofis step renders its category path as plain text rather than links.
  if (!categoryPath.length) {
    const crumb = [...document.querySelectorAll('.breadcrumb, [class*="breadcrumb"]')]
      .find((el) => /Emlak/.test(el.innerText || '') && /Konut|İş Yeri|Arsa|Bina|Devre Mülk|Turistik Tesis/.test(el.innerText || ''));
    categoryPath = clean(crumb?.innerText || '').split(/\s*[>›]\s*/).map(clean).filter(Boolean);
  }
  if (categoryPath[0] !== 'Emlak') categoryPath.unshift('Emlak');
  // Keep the shared listing/address controls in one file so category templates
  // stay compact and can be compared without repeated boilerplate.
  const sharedFields = controls.filter((item) => item.common);
  const categoryFields = controls.filter((item) => !item.common);
  const record = {
    source: 'Sahibinden Pro Ofis authenticated listing form',
    capturedAt: new Date().toISOString(),
    categoryPath,
    fields: categoryFields,
    sharedFields,
    detailGroups: categoryDetailGroups,
    detailGroupSections: categoryDetailGroupSections,
    counts: {
      categoryFields: categoryFields.length,
      sharedFields: sharedFields.length,
      detailOptions: categoryDetailGroups.length,
      dropdownOptionLists: categoryFields.filter((item) => item.tag === 'select' && Array.isArray(item.options)).length,
    },
    notes: ['Form değerleri ve seçili durumlar kaydedilmedi.', 'classifiedId ve hesap/iletişim değerleri dışa aktarılmadı.', 'İl, ilçe, mahalle ve ülke seçenekleri ortak adres bileşeninde tutulmak üzere kategori dökümünden çıkarıldı.', 'Başlık, açıklama, fiyat, adres ve ilan notu ortak alanlar olarak sharedFields içinde tutulur.', 'Bu araç tek seferde yalnızca açık kategorinin formunu dışa aktarır; toplu kategori ağacı veya henüz açılmamış formları indirmez.'],
  };
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  const slug = (categoryPath.join('-') || 'ilan-formu').toLocaleLowerCase('tr-TR')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  anchor.download = `sahibinden-${slug || 'ilan-formu'}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 30000);
  console.info(`Şablon dışa aktarıldı: ${anchor.download}; ${categoryFields.length} kategori alanı, ${sharedFields.length} ortak alan, ${categoryDetailGroups.length} checkbox seçeneği. Form değerleri dışarı alınmadı.`);
  return record;
})();
