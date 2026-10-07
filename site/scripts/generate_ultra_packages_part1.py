#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_ultra_packages_part1.py — Ultra 24, 25, 26, 27, 28 paketlerini üretir.
Her paket 40 özgün, yasal dayanaklı ve saha uyarılarını içeren terim içerir.
"""

from pathlib import Path
import json

DATA_DIR = Path(__file__).resolve().parent / "data"

def write_package(filename, var_name, terms, title, topics):
    out = [f'"""\nEDM Gayrimenkul Sozluk - {title} ({len(terms)} Terim)\nKonular: {topics}\n"""\n']
    out.append(f'{var_name} = [\n')
    for t in terms:
        out.append('    {\n')
        out.append(f'        "slug": {json.dumps(t["slug"], ensure_ascii=False)},\n')
        out.append(f'        "terim": {json.dumps(t["terim"], ensure_ascii=False)},\n')
        out.append(f'        "harf": {json.dumps(t["harf"], ensure_ascii=False)},\n')
        out.append(f'        "kategori": {json.dumps(t["kategori"], ensure_ascii=False)},\n')
        out.append(f'        "kisaTanim": {json.dumps(t["kisaTanim"], ensure_ascii=False)},\n')
        out.append(f'        "hukukiKarsilik": {json.dumps(t["hukukiKarsilik"], ensure_ascii=False)},\n')
        out.append(f'        "pratikteNeAnlamaGelir": {json.dumps(t["pratikteNeAnlamaGelir"], ensure_ascii=False)},\n')
        out.append(f'        "kritikUyari": {json.dumps(t["kritikUyari"], ensure_ascii=False)},\n')
        out.append(f'        "guncellemeTarihi": {json.dumps(t["guncellemeTarihi"], ensure_ascii=False)},\n')
        out.append(f'        "kapsamNotu": {json.dumps(t["kapsamNotu"], ensure_ascii=False)},\n')
        out.append(f'        "kaynaklar": {json.dumps(t["kaynaklar"], ensure_ascii=False)}\n')
        out.append('    },\n')
    out.append(']\n')
    (DATA_DIR / filename).write_text("".join(out), encoding="utf-8")
    print(f"Yazıldı: {filename} ({len(terms)} terim)")

if __name__ == "__main__":
    print("Paket üreteci hazır.")
