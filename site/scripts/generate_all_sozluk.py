#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_all_sozluk.py — EDM Emlak Sözlüğü Kapsamlı Veri Üreticisi
Gayrimenkul, tapu, imar, kira, vergi, kentsel dönüşüm, inşaat-mimarlık ve değerleme-finans
alanlarında yüzlerce doğrulanmış ve kanun dayanaklı terim üretir.
"""

import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
LIB_DIR = BASE_DIR / "src" / "lib"
SOZLUK_DIR = LIB_DIR / "sozluk"
SOZLUK_DIR.mkdir(parents=True, exist_ok=True)

# 1. MEVCUT SOZLUK.TS'DEKİ 83 TERİMİ AL
def parse_existing():
    sozluk_ts = LIB_DIR / "sozluk.ts"
    with open(sozluk_ts, "r", encoding="utf-8") as f:
        content = f.read()

    # extract objects
    pattern = re.compile(
        r"\{\s*terim:\s*['\"](.*?)['\"],\s*"
        r"slug:\s*['\"](.*?)['\"],\s*"
        r"harf:\s*['\"](.*?)['\"],\s*"
        r"kategori:\s*['\"](.*?)['\"],\s*"
        r"kisaTanim:\s*['\"](.*?)['\"],\s*"
        r"hukukiKarsilik:\s*['\"](.*?)['\"],\s*"
        r"pratikteNeAnlamaGelir:\s*['\"](.*?)['\"],\s*"
        r"kritikUyari:\s*['\"](.*?)['\"]",
        re.DOTALL
    )
    items = []
    for match in pattern.finditer(content):
        t = {
            "terim": match.group(1),
            "slug": match.group(2),
            "harf": match.group(3),
            "kategori": match.group(4),
            "kisaTanim": match.group(5),
            "hukukiKarsilik": match.group(6),
            "pratikteNeAnlamaGelir": match.group(7),
            "kritikUyari": match.group(8),
        }
        items.append(t)
    return items

existing_items = parse_existing()
print(f"Mevcut terimler ayrıştırıldı: {len(existing_items)} adet")
