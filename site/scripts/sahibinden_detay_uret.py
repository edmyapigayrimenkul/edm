"""Read-only Pro Ofis form exportundan küçük, tekrar üretilebilir detay kataloğu."""

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'raporlar/sahibinden-sablonlari/tam-form-sablonlari.json'
TARGET = ROOT / 'site/src/lib/sahibinden-detay-verisi.ts'


def slug(value: str) -> str:
    value = value.lower().replace('ı', 'i')
    value = ''.join(ch for ch in unicodedata.normalize('NFD', value) if unicodedata.category(ch) != 'Mn')
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', value)).strip('-')


source = json.loads(SOURCE.read_text())
profiles: list[list[list[object]]] = []
profile_ids: dict[str, int] = {}
categories: dict[str, int] = {}

for template in source['templates']:
    path = template['path']
    group = {'İş Yeri': 'isyeri', 'Turistik Tesis': 'turistik', 'Devre Mülk': 'devre-mulk'}.get(path[1], slug(path[1]))
    operation = {'Turistik Günlük Kiralık': 'gunluk-kiralik', 'Devren Satılık Konut': 'devren-satilik'}.get(path[2], slug(path[2]))
    if path[1] == 'Konut' and path[2] == 'Turistik Günlük Kiralık' and len(path) > 3 and path[3] in ('Devre Mülk', 'Apart & Pansiyon'):
        group = 'gunluk-konaklama'
    subtype = slug(path[3]) if len(path) > 3 else '*'
    if group == 'devre-mulk':
        subtype = '*'
    groups = []
    for section in template['sections']:
        if section.get('formatting') != 'condensed':
            continue
        labels = [item['label'].strip() for item in section.get('elements', []) if item.get('inputType') == 'CHECKBOX' and item.get('label')]
        if labels:
            groups.append([section.get('label', section['name']).strip(), labels])
    signature = json.dumps(groups, ensure_ascii=False, separators=(',', ':'))
    if signature not in profile_ids:
        profile_ids[signature] = len(profiles)
        profiles.append(groups)
    key = '|'.join((group, operation, subtype))
    previous = categories.get(key)
    if previous is not None and previous != profile_ids[signature]:
        raise ValueError(f'Bir anahtarda farklı detay profilleri var: {key}')
    categories[key] = profile_ids[signature]

assert source['count'] == len(source['templates']) == 336
assert not source['errors']
header = '// 5 Ekim 2026 Pro Ofis tam form meta verisinden üretildi. Elle düzenlemeyin.\n'
header += '// Kaynak: raporlar/sahibinden-sablonlari/tam-form-sablonlari.json\n'
body = 'export const SAHIBINDEN_DETAY_PROFILLERI: Array<Array<[string, string[]]>> = '
body += json.dumps(profiles, ensure_ascii=False, separators=(',', ':')) + ';\n'
body += 'export const SAHIBINDEN_DETAY_KATEGORILERI: Record<string, number> = '
body += json.dumps(dict(sorted(categories.items())), ensure_ascii=False, separators=(',', ':')) + ';\n'
TARGET.write_text(header + body)
print(f'{len(source["templates"])} kategori, {len(profiles)} benzersiz profil, {len(categories)} anahtar, {TARGET.stat().st_size} bayt')
