import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ILAN_GRUPLARI,
  KIMDEN_ALANI,
  KONUM_YONETIM_ALANLARI,
  MEDYA_PORTAL_ALANLARI,
  YETKI_ALANLARI,
  grupSemasi,
} from '../src/lib/ilan-bilgileri.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourcePath = path.join(root, 'raporlar/sahibinden-sablonlari/tam-form-sablonlari.json');
const outputPath = path.join(root, 'site/src/lib/sahibinden-zorunlu-alanlar.generated.ts');
const forms = JSON.parse(await fs.readFile(sourcePath, 'utf8')).templates;

const fold = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/[^a-z0-9]/g, '');
const groupMap = new Map([
  ['Konut', 'konut'], ['İş Yeri', 'isyeri'], ['Arsa', 'arsa'], ['Bina', 'bina'],
  ['Devre Mülk', 'devre-mulk'], ['Turistik Tesis', 'turistik'],
]);
const operationMap = new Map([
  ['Satılık', 'satilik'], ['Kiralık', 'kiralik'], ['Devren Satılık', 'devren-satilik'],
  ['Devren Kiralık', 'devren-kiralik'], ['Kat Karşılığı Satılık', 'kat-karsiligi-satilik'],
  ['Turistik Günlük Kiralık', 'gunluk-kiralik'], ['Devren Satılık Konut', 'devren-satilik'],
]);
const typeAliases = {
  isyeri: { 'fabrika-uretim-tesisi': 'fabrika', kampyerimocamp: 'kamp-alani', 'plaza-kati-ofisi': 'plaza-kati', 'rezidanskati-ofisi': 'rezidans-kati' },
  turistik: { kampyerimocamp: 'kamp-alani' },
};
const fieldAliases = {
  m2: ['m2_brut', 'plaj_m2'], 'm2-brut': ['m2_brut'], 'm2-net': ['m2_net'],
  'gayrimenkul-sahibi': ['mulk_sahibi_statu'], 'bir-kattaki-daire': ['bir_kattaki_daire'],
  'site-adi': ['site_adi'], 'arazi-m2': ['arazi_m2'],
  'tasinmaz-numarasi': ['tasinmaz_no'], donem: ['devre_mulk_donem', 'gunluk_devre_mulk_donem'],
  condition: { isyeri: ['isyeri_durumu'], 'devre-mulk': ['devre_mulk_durumu'] },
  exchange: ['takas'], mutfak: ['mutfak_tipi'], 'krediye-uygun': ['kredi_uygunluk'],
  'krediye-uygunluk': ['kredi_uygunluk'], 'aidat-tl': ['aidat'], 'depozito-tl': ['depozito', 'plaza_depozito'],
  'acik-alan-m2': ['m2_acik'], 'kapali-alan-m2': ['kapali_alan', 'm2_brut'],
  'bolum-oda-sayisi': ['ticari_bolum', 'ticari_bolum_araligi'], 'oda-bolum-sayisi': ['ticari_bolum_araligi', 'ticari_bolum'],
  'gunluk-satis-l': ['gunluk_satis_litre'], 'gunluk-satis-litre': ['gunluk_satis_litre'], cinsiyet: ['spa_hizmet_cinsiyeti'],
  'toplam-m2': ['m2_brut'], 'toplam-arazi-donum': ['toplam_arazi_donum'], 'devre-mulk-adi': ['devre_mulk_tesisi'], sure: ['gunluk_devre_mulk_sure'],
  turu: ['spor_tesisi_turu', 'enerji_santrali_turu'], tipi: ['otopark_tipi', 'spor_tesisi_turu', 'enerji_santrali_turu'],
  'giris-yuksekligi-m': ['atolye_giris_yuksekligi', 'giris_yuksekligi'], 'giris-yuksekligi': ['giris_yuksekligi'],
  'ruhsat-durumu': ['maden_isletme_ruhsati'], 'tavan-yuksekligi': ['tavan_yuksekligi'],
  'tavan-yuksekligi-m': ['etkinlik_tavan_yuksekligi', 'tavan_yuksekligi'], 'yapinin-durumu': ['yapi_durumu', 'isyeri_yapi_durumu'],
  'oda-sayisi': ['oda', 'oda_adedi', 'ticari_oda_duzeni', 'devren_ofis_oda_duzeni', 'anaokulu_oda_duzeni', 'kuafor_oda_duzeni', 'guzellik_oda_duzeni', 'muayenehane_oda_duzeni', 'yurt_oda_sayisi', 'apart_oda', 'prova_oda_sayisi'],
  'yatak-sayisi': ['yatak_kapasitesi', 'yatak_sayisi'], 'kisi-kapasitesi': ['kisi_kapasitesi', 'isletme_kapasitesi'],
  'zemin-etudu': ['zemin_etudu'], kapasite: ['isletme_kapasitesi', 'kisi_kapasitesi'],
};
const optionAliases = { mulk_sahibi_statu: { notaturkishcitizen: ['tcvatandasidegil'] } };
const commonFields = new Set(['category', 'title', 'description', 'price', 'pricestring', 'entrydate']);

function typeFor(pathParts, group, operationLabel) {
  const label = operationLabel ? pathParts.slice(pathParts.indexOf(operationLabel) + 1).at(-1) : undefined;
  if (!label) return { group, type: null, sourceType: null };
  if (group === 'devre-mulk') return { group, type: 'devre-mulk', sourceType: label };
  if (group === 'konut' && operationLabel === 'Turistik Günlük Kiralık' && ['Devre Mülk', 'Apart & Pansiyon'].includes(label)) {
    return { group: 'gunluk-konaklama', type: label === 'Devre Mülk' ? 'devre-mulk' : 'apart-pansiyon', sourceType: label };
  }
  const schema = grupSemasi(group);
  const direct = schema.altTipler.find((option) => [option.deger, option.etiket].some((value) => fold(value) === fold(label)));
  if (direct) return { group, type: direct.deger, sourceType: label };
  const alias = typeAliases[group]?.[fold(label)];
  if (alias && schema.altTipler.some((option) => option.deger === alias)) return { group, type: alias, sourceType: label };
  return { group, type: null, sourceType: label };
}

const requiredByCombo = new Map();
const facilityRequirements = new Set();
const unmapped = new Map();
const optionGaps = new Map();
const unknownTypes = new Map();
let primaryUses = 0;
let matched = 0;
let sourceRequiredFieldUses = 0;
let mappedRequiredFieldUses = 0;
let commonRequiredFieldUses = 0;
let enumLabelsCompared = 0;
let enumLabelGaps = 0;
let formsWithResolvedSubtype = 0;

for (const form of forms) {
  const sourceGroup = groupMap.get(form.path[1]);
  const operationLabel = form.path.find((part) => operationMap.has(part));
  const operation = operationMap.get(operationLabel) ?? 'satilik';
  const resolved = sourceGroup ? typeFor(form.path, sourceGroup, operationLabel) : { group: null, type: null, sourceType: null };
  const group = resolved.group;
  const { type } = resolved;
  if (resolved.sourceType && !type) unknownTypes.set(`${sourceGroup}|${resolved.sourceType}`, (unknownTypes.get(`${sourceGroup}|${resolved.sourceType}`) ?? 0) + 1);
  else if (resolved.sourceType) formsWithResolvedSubtype++;
  const schema = group ? grupSemasi(group) : null;
  const available = [
    ...(schema?.bolumler.flatMap((section) => section.alanlar) ?? []),
    KIMDEN_ALANI,
    ...YETKI_ALANLARI,
    ...KONUM_YONETIM_ALANLARI,
    ...MEDYA_PORTAL_ALANLARI,
  ];
  const fields = new Map(available.map((field) => [field.ad, field]));
  const labels = new Map();
  for (const field of available) for (const label of [field.anahtar, field.etiket]) if (label) labels.set(fold(label), field);

  for (const section of form.sections.filter((item) => item.name === 'classifiedDetails')) {
    for (const sourceField of section.elements) {
      primaryUses++;
      const key = sourceField.canonicalName ?? sourceField.name;
      if (sourceField.required) sourceRequiredFieldUses++;
      const canonical = fold(key);
      const candidates = Array.isArray(fieldAliases[key])
        ? fieldAliases[key]
        : fieldAliases[key]?.[group] ?? [];
      let field = commonFields.has(canonical) ? null : fields.get(key) ?? labels.get(fold(key));
      let special = commonFields.has(canonical);
      if (field && ((field.tipler && type && !field.tipler.includes(type)) || (field.islemler && !field.islemler.includes(operation)))) field = null;
      for (const candidateName of candidates) {
        if (special || field) break;
        const candidate = fields.get(candidateName) ?? labels.get(fold(candidateName));
        if (!candidate) continue;
        if ((candidate.tipler && type && !candidate.tipler.includes(type)) || (candidate.islemler && !candidate.islemler.includes(operation))) continue;
        field = candidate;
      }

      if (!field && !special) {
        const id = `${group ?? 'unmapped'}|${key}`;
        const row = unmapped.get(id) ?? { group: group ?? 'unmapped', key, label: sourceField.label, uses: 0, required: 0, paths: [] };
        row.uses++;
        row.required += Number(sourceField.required);
        if (row.paths.length < 2) row.paths.push(form.path.join(' > '));
        unmapped.set(id, row);
        continue;
      }
      matched++;
      if (!field) {
        if (sourceField.required && special) commonRequiredFieldUses++;
        continue;
      }

      if (sourceField.required) {
        mappedRequiredFieldUses++;
        if (key === 'condition' && group === 'devre-mulk') facilityRequirements.add(form.path.at(-1));
        else {
          const combo = `${group}|${operation}|${type ?? '*'}`;
          const names = requiredByCombo.get(combo) ?? new Set();
          names.add(field.ad);
          requiredByCombo.set(combo, names);
        }
      }

      const sourceOptions = sourceField.enumValues ?? [];
      if (sourceOptions.length && field.secenekler?.length) {
        const options = new Set(field.secenekler.flatMap((option) => [option.deger, option.etiket].filter(Boolean).map(fold)));
        const missing = sourceOptions.map((option) => option.label)
          .filter((label) => !options.has(fold(label)) && !optionAliases[field.ad]?.[fold(label)]);
        enumLabelsCompared += sourceOptions.length;
        enumLabelGaps += missing.length;
        if (missing.length) {
          const id = `${group}|${key}|${field.ad}`;
          const row = optionGaps.get(id) ?? { group, key, label: sourceField.label, field: field.ad, missing: new Set() };
          missing.forEach((label) => row.missing.add(label));
          optionGaps.set(id, row);
        }
      }
    }
  }
}

const entries = Object.fromEntries([...requiredByCombo.entries()]
  .sort(([a], [b]) => a.localeCompare(b, 'tr'))
  .map(([combo, fields]) => [combo, [...fields].sort((a, b) => a.localeCompare(b, 'tr'))]));
const generated = `/** Kaynak Sahibinden tam-form verisinden scripts/sahibinden-form-kapsami.mjs ile üretilir. */\nexport const SAHIBINDEN_FORM_ZORUNLU_ALANLAR: Record<string, string[]> = ${JSON.stringify(entries, null, 2)};\nexport const SAHIBINDEN_DURUMU_GEREKTIREN_DEVRE_MULK_TESISLERI: string[] = ${JSON.stringify([...facilityRequirements].sort((a, b) => a.localeCompare(b, 'tr')), null, 2)};\n\nexport function sahibindenAlanKaynaktaZorunlu(alan: string, grup: string, islem: string, tip: string, degerler: Record<string, unknown> = {}): boolean {\n  const alanlar = SAHIBINDEN_FORM_ZORUNLU_ALANLAR[grup + '|' + islem + '|' + tip] ?? SAHIBINDEN_FORM_ZORUNLU_ALANLAR[grup + '|' + islem + '|*'];\n  if (alanlar?.includes(alan)) return true;\n  return alan === 'devre_mulk_durumu' && grup === 'devre-mulk' && SAHIBINDEN_DURUMU_GEREKTIREN_DEVRE_MULK_TESISLERI.includes(String(degerler.devre_mulk_tesisi ?? ''));\n}\n`;

const report = {
  forms: forms.length,
  exactSubtypeForms: formsWithResolvedSubtype,
  sourceFieldUses: primaryUses,
  matchedSourceFieldUses: matched,
  unmappedSourceFieldUses: primaryUses - matched,
  sourceRequiredFieldUses,
  mappedRequiredFieldUses,
  commonRequiredFieldUses,
  uncoveredRequiredFieldUses: sourceRequiredFieldUses - mappedRequiredFieldUses - commonRequiredFieldUses,
  requiredCombos: Object.keys(entries).length,
  enumOptionLabelsCompared: enumLabelsCompared,
  enumOptionLabelGaps: enumLabelGaps,
  unmappedFields: [...unmapped.values()],
  unknownTypes: [...unknownTypes].map(([type, uses]) => ({ type, uses })),
  optionGaps: [...optionGaps.values()].map((row) => ({ ...row, missing: [...row.missing] })),
};

if (process.argv.includes('--check')) {
  const existing = await fs.readFile(outputPath, 'utf8');
  if (existing !== generated) {
    console.error('Üretilmiş Sahibinden zorunluluk dosyası kaynakla eşleşmiyor; üretim komutunu çalıştırın.');
    process.exitCode = 1;
  }
} else {
  await fs.writeFile(outputPath, generated);
}

console.log(JSON.stringify(report, null, 2));
if (unmapped.size || unknownTypes.size || optionGaps.size || report.uncoveredRequiredFieldUses) process.exitCode = 1;
