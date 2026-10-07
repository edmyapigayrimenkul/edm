#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_full_sozluk.py — EDM Emlak Sözlüğü Kapsamlı Derleyicisi
Tüm kategorilerdeki doğrulanmış terimleri modüler dosyalara ve ana sozluk.ts'ye derler.
"""

import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
LIB_DIR = BASE_DIR / "src" / "lib"
SOZLUK_DIR = LIB_DIR / "sozluk"
SOZLUK_DIR.mkdir(parents=True, exist_ok=True)

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data.data_tapu import TAPU_TERIMLERI
from data.data_imar import IMAR_TERIMLERI
from data.data_kira import KIRA_TERIMLERI
from data.data_vergi import VERGI_TERIMLERI
from data.data_kentsel import KENTSEL_TERIMLERI
from data.data_insaat import INSAAT_TERIMLERI
from data.data_degerleme import DEGERLEME_TERIMLERI
from data.data_pratik import PRATIK_TERIMLER
from data.data_mega import MEGA_TERIMLER_1
from data.data_mega_2 import MEGA_TERIMLER_2
from data.data_mega_3 import MEGA_TERIMLER_3
from data.data_ultra import ULTRA_TERIMLER
from data.data_ultra_2 import ULTRA_TERIMLER_2
from data.data_ultra_3 import ULTRA_TERIMLER_3
from data.data_ultra_4 import ULTRA_TERIMLER_4
from data.data_ultra_5 import ULTRA_TERIMLER_5
from data.data_ultra_6 import ULTRA_TERIMLER_6
from data.data_ultra_7 import ULTRA_TERIMLER_7
from data.data_ultra_8 import ULTRA_TERIMLER_8
from data.data_ultra_9 import ULTRA_TERIMLER_9
from data.data_ultra_10 import ULTRA_TERIMLER_10
from data.data_ultra_11 import ULTRA_TERIMLER_11
from data.data_ultra_12 import ULTRA_TERIMLER_12
from data.data_ultra_13 import ULTRA_TERIMLER_13
from data.data_ultra_14 import ULTRA_TERIMLER_14
from data.data_ultra_15 import ULTRA_TERIMLER_15
from data.data_ultra_16 import ULTRA_TERIMLER_16
from data.data_ultra_17 import ULTRA_TERIMLER_17
from data.data_ultra_18 import ULTRA_TERIMLER_18
from data.data_ultra_19 import ULTRA_TERIMLER_19
from data.data_ultra_20 import ULTRA_TERIMLER_20
from data.data_ultra_21 import ULTRA_TERIMLER_21
from data.data_ultra_22 import ULTRA_TERIMLER_22
from data.data_ultra_23 import ULTRA_TERIMLER_23
from data.data_ultra_24 import ULTRA_TERIMLER_24
from data.data_ultra_25 import ULTRA_TERIMLER_25
from data.data_ultra_26 import ULTRA_TERIMLER_26
from data.data_ultra_27 import ULTRA_TERIMLER_27
from data.data_ultra_28 import ULTRA_TERIMLER_28
from data.data_ultra_29 import ULTRA_TERIMLER_29
from data.data_ultra_30 import ULTRA_TERIMLER_30
from data.data_ultra_31 import ULTRA_TERIMLER_31
from data.data_ultra_32 import ULTRA_TERIMLER_32
from data.data_ultra_33 import ULTRA_TERIMLER_33

def parse_existing_sozluk():
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

    items = {}
    for ts_file in SOZLUK_DIR.glob("*.ts"):
        with open(ts_file, "r", encoding="utf-8") as f:
            text = f.read()
        for m in pattern.finditer(text):
            slug = m.group(2)
            items[slug] = {
                "terim": m.group(1),
                "slug": slug,
                "harf": m.group(3),
                "kategori": m.group(4),
                "kisaTanim": m.group(5),
                "hukukiKarsilik": m.group(6),
                "pratikteNeAnlamaGelir": m.group(7),
                "kritikUyari": m.group(8)
            }
    return items

def main():
    existing = parse_existing_sozluk()
    print(f"Mevcut modüler dosyalardaki terimler: {len(existing)}")

    merged = {}
    all_new = (
        TAPU_TERIMLERI +
        IMAR_TERIMLERI +
        KIRA_TERIMLERI +
        VERGI_TERIMLERI +
        KENTSEL_TERIMLERI +
        INSAAT_TERIMLERI +
        DEGERLEME_TERIMLERI +
        PRATIK_TERIMLER +
        MEGA_TERIMLER_1 +
        MEGA_TERIMLER_2 +
        MEGA_TERIMLER_3 +
        ULTRA_TERIMLER +
        ULTRA_TERIMLER_2 +
        ULTRA_TERIMLER_3 +
        ULTRA_TERIMLER_4 +
        ULTRA_TERIMLER_5 +
        ULTRA_TERIMLER_6 +
        ULTRA_TERIMLER_7 +
        ULTRA_TERIMLER_8 +
        ULTRA_TERIMLER_9 +
        ULTRA_TERIMLER_10 +
        ULTRA_TERIMLER_11 +
        ULTRA_TERIMLER_12 +
        ULTRA_TERIMLER_13 +
        ULTRA_TERIMLER_14 +
        ULTRA_TERIMLER_15 +
        ULTRA_TERIMLER_16 +
        ULTRA_TERIMLER_17 +
        ULTRA_TERIMLER_18 +
        ULTRA_TERIMLER_19 +
        ULTRA_TERIMLER_20 +
        ULTRA_TERIMLER_21 +
        ULTRA_TERIMLER_22 +
        ULTRA_TERIMLER_23 +
        ULTRA_TERIMLER_24 +
        ULTRA_TERIMLER_25 +
        ULTRA_TERIMLER_26 +
        ULTRA_TERIMLER_27 +
        ULTRA_TERIMLER_28 +
        ULTRA_TERIMLER_29 +
        ULTRA_TERIMLER_30 +
        ULTRA_TERIMLER_31 +
        ULTRA_TERIMLER_32 +
        ULTRA_TERIMLER_33
    )

    # 1. Kaynak Python dosyalarındaki saf ve eksiksiz verileri öncelikli ekle
    for item in all_new:
        slug = item["slug"]
        merged[slug] = item

    # 2. Varsa sadece dosyada olup Python'da olmayan ve kritik uyarısı dolu terimleri ekle
    for slug, item in existing.items():
        if slug not in merged:
            if item.get("kritikUyari", "").strip() and item.get("kisaTanim", "").strip():
                merged[slug] = item

    print(f"Toplam birleştirilmiş terim sayısı: {len(merged)}")

    # Kategorilere göre grupla
    kategori_dosyalari = {
        "Tapu & Mülkiyet": "tapu-mulkiyet.ts",
        "İmar & Kadastro": "imar-kadastro.ts",
        "Kira & Tahliye": "kira-tahliye.ts",
        "Vergi & Harç": "vergi-harc.ts",
        "Kentsel Dönüşüm": "kentsel-donusum.ts",
        "İnşaat & Mimarlık": "insaat-mimarlik.ts",
        "Değerleme & Finans": "degerleme-finans.ts",
    }

    def kategori_tahmin(item):
        if "kategori" in item:
            kat_norm = item["kategori"].replace(" ve ", " & ")
            if kat_norm in kategori_dosyalari:
                return kat_norm
        text = (
            item.get("terim", "") + " " +
            item.get("kisaTanim", "") + " " +
            item.get("hukukiKarsilik", "") + " " +
            item.get("pratikteNeAnlamaGelir", "")
        ).lower()
        if any(k in text for k in ["kira", "tahliye", "tbk 3", "kiracı", "kiralayan", "ecrimisil", "tahliye taahhüt", "aidat"]):
            return "Kira & Tahliye"
        if any(k in text for k in ["vergi", "harç", "kdv", "beyanname", "vuk", "veraset", "istisna", "gelir vergisi", "gib", "masak"]):
            return "Vergi & Harç"
        if any(k in text for k in ["kentsel dönüşüm", "6306", "riskli yapı", "rezerv yapı", "yarısı bizden", "tahliye ve yıkım"]):
            return "Kentsel Dönüşüm"
        if any(k in text for k in ["şantiye", "beton", "donatı", "statik", "kolon", "kiriş", "mimar", "leed", "breeam", "ekb", "asansör", "springler", "yangın", "ses yalıtım", "çatı", "tbdy", "tesisat"]):
            return "İnşaat & Mimarlık"
        if any(k in text for k in ["imar", "parsel", "ifraz", "tevhit", "kadastro", "18. madde", "dop", "kaks", "taks", "gabari", "kot kesit", "plankote", "kıyı", "boğaziçi", "mera", "toprak koruma", "sit alanı"]):
            return "İmar & Kadastro"
        if any(k in text for k in ["değerleme", "spk", "ekspertiz", "gyf", "gyo", "faiz", "kredi", "finans", "nakit", "roi", "amortisman", "cap rate"]):
            return "Değerleme & Finans"
        return "Tapu & Mülkiyet"

    gruplar = {k: [] for k in kategori_dosyalari}
    for slug, t in merged.items():
        kat = kategori_tahmin(t)
        t["kategori"] = kat
        gruplar[kat].append(t)

    # Modüler TypeScript dosyalarını yaz
    for kat, dosya_adi in kategori_dosyalari.items():
        items = gruplar[kat]
        items.sort(key=lambda x: x["terim"])
        out_path = SOZLUK_DIR / dosya_adi
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("import type { HamTerim } from '../sozluk.ts';\n\n")
            var_name = dosya_adi.replace(".ts", "").replace("-", "_").upper() + "_TERIMLERI"
            f.write(f"export const {var_name}: HamTerim[] = [\n")
            for item in items:
                f.write("  {\n")
                f.write(f"    terim: {repr(item['terim'])},\n")
                f.write(f"    slug: {repr(item['slug'])},\n")
                f.write(f"    harf: {repr(item['harf'])},\n")
                f.write(f"    kategori: {repr(item['kategori'])},\n")
                f.write(f"    kisaTanim: {repr(item['kisaTanim'])},\n")
                f.write(f"    hukukiKarsilik: {repr(item['hukukiKarsilik'])},\n")
                f.write(f"    pratikteNeAnlamaGelir: {repr(item['pratikteNeAnlamaGelir'])},\n")
                f.write(f"    kritikUyari: {repr(item['kritikUyari'])},\n")
                if "ilgiliTerimler" in item and item["ilgiliTerimler"]:
                    f.write(f"    ilgiliTerimler: {repr(item['ilgiliTerimler'])},\n")
                f.write("  },\n")
            f.write("];\n")
        print(f"Yazıldı: {dosya_adi} ({len(items)} terim)")

    # Ana sozluk.ts dosyasını güncelle
    write_main_sozluk(merged)

def write_main_sozluk(merged_items):
    sozluk_ts_path = LIB_DIR / "sozluk.ts"
    code = '''/**
 * sozluk.ts — EDM Emlak Terimleri Sözlüğü Veri Katmanı
 * Gayrimenkul, tapu, imar, vergi, kira hukuku, kentsel dönüşüm ve inşaat alanındaki
 * tüm terimleri kanuni dayanaklarıyla ve yatırımcı saha uyarısıyla sunar.
 */

import { TAPU_MULKIYET_TERIMLERI } from './sozluk/tapu-mulkiyet.ts';
import { IMAR_KADASTRO_TERIMLERI } from './sozluk/imar-kadastro.ts';
import { KIRA_TAHLIYE_TERIMLERI } from './sozluk/kira-tahliye.ts';
import { VERGI_HARC_TERIMLERI } from './sozluk/vergi-harc.ts';
import { KENTSEL_DONUSUM_TERIMLERI } from './sozluk/kentsel-donusum.ts';
import { INSAAT_MIMARLIK_TERIMLERI } from './sozluk/insaat-mimarlik.ts';
import { DEGERLEME_FINANS_TERIMLERI } from './sozluk/degerleme-finans.ts';

export type SozlukKategorisi =
  | 'Tapu & Mülkiyet'
  | 'İmar & Kadastro'
  | 'Kira & Tahliye'
  | 'Vergi & Harç'
  | 'Kentsel Dönüşüm'
  | 'İnşaat & Mimarlık'
  | 'Değerleme & Finans';

export interface Terim {
  terim: string;
  slug: string;
  harf: string;
  kategori: SozlukKategorisi;
  kisaTanim: string;
  hukukiKarsilik: string;
  pratikteNeAnlamaGelir: string;
  kritikUyari: string;
  ilgiliTerimler?: string[];
  kaynaklar: Array<{ ad: string; url: string }>;
  guncellemeTarihi: string;
  kapsamNotu: string;
}

export type HamTerim = Omit<Terim, 'kaynaklar' | 'guncellemeTarihi' | 'kapsamNotu'>;

const SOZLUK_KAPSAM_NOTU =
  'Genel bilgilendirme içindir. Terimin somut işleminize etkisi taşınmazın niteliğine, tarihe ve dosyanın koşullarına göre değişebilir; işlemden önce güncel birincil kaynağı ve yetkili uzmanı kontrol edin.';

const KATEGORI_KAYNAKLARI: Record<SozlukKategorisi, Array<{ ad: string; url: string }>> = {
  'Tapu & Mülkiyet': [{ ad: 'Mevzuat Bilgi Sistemi — Türk Medeni Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.4721.pdf' }],
  'İmar & Kadastro': [{ ad: 'Mevzuat Bilgi Sistemi — İmar Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.3194.pdf' }],
  'Kira & Tahliye': [{ ad: 'Mevzuat Bilgi Sistemi — Türk Borçlar Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6098.pdf' }],
  'Vergi & Harç': [{ ad: 'Mevzuat Bilgi Sistemi — Harçlar ve Vergi Mevzuatı', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.492.pdf' }],
  'Kentsel Dönüşüm': [{ ad: 'Kentsel Dönüşüm Başkanlığı — 6306 Sayılı Kanun', url: 'https://kdb.gov.tr/files/mevzuatdosya/2025581301335809.pdf' }],
  'İnşaat & Mimarlık': [{ ad: 'Mevzuat Bilgi Sistemi — Planlı Alanlar İmar Yönetmeliği & TBDY', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/21.5.20171059.pdf' }],
  'Değerleme & Finans': [{ ad: 'Sermaye Piyasası Kurulu — Değerleme Standartları', url: 'https://spk.gov.tr' }],
};

const TERIM_KAYNAK_ISTISNALARI: Record<string, Array<{ ad: string; url: string }>> = {
  'kat-irtifaki': [{ ad: 'Tapu ve Kadastro Genel Müdürlüğü — Kat Mülkiyeti ve Kat İrtifakı Genelgesi', url: 'https://www.tkgm.gov.tr/sites/default/files/2024-06/2021-4-Kat%20M%C3%BClkiyeti%20Kat%20%C4%B0rtifak%C4%B1-4.pdf' }],
  'kat-mulkiyeti': [{ ad: 'Tapu ve Kadastro Genel Müdürlüğü — Kat Mülkiyeti ve Kat İrtifakı Genelgesi', url: 'https://www.tkgm.gov.tr/sites/default/files/2024-06/2021-4-Kat%20M%C3%BClkiyeti%20Kat%20%C4%B0rtifak%C4%B1-4.pdf' }],
  'tahliye-taahhutnamesi': [{ ad: 'Adalet Bakanlığı — Türk Borçlar Kanunu md. 352', url: 'https://mgm.adalet.gov.tr/Resimler/SayfaDokuman/181020191500286098.pdf' }],
  'cins-tashihi': [{ ad: 'Mevzuat Bilgi Sistemi — Kadastro Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.3402.pdf' }],
  'kadastral-yol': [{ ad: 'Mevzuat Bilgi Sistemi — Kadastro Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.3402.pdf' }],
  'gabari': [{ ad: 'Mevzuat Bilgi Sistemi — Planlı Alanlar İmar Yönetmeliği', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/21.5.20171059.pdf' }],
  'emsal-kaks': [{ ad: 'Mevzuat Bilgi Sistemi — Planlı Alanlar İmar Yönetmeliği', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/21.5.20171059.pdf' }],
  'taks': [{ ad: 'Mevzuat Bilgi Sistemi — Planlı Alanlar İmar Yönetmeliği', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/21.5.20171059.pdf' }],
  'deger-artis-kazanci-vergisi': [{ ad: 'Gelir İdaresi Başkanlığı — Değer Artış Kazancı Rehberi', url: 'https://intvrg.gib.gov.tr/hazirbeyan/artisHesapla.html' }],
  'rayic-bedel': [{ ad: 'Mevzuat Bilgi Sistemi — 213 Sayılı Vergi Usul Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.213.pdf' }],
  'tapu-harci': [{ ad: 'Mevzuat Bilgi Sistemi — 492 Sayılı Harçlar Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.492.pdf' }],
  'emlak-vergisi': [{ ad: 'Mevzuat Bilgi Sistemi — 1319 Sayılı Emlak Vergisi Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.1319.pdf' }],
  'dask-zorunlu-deprem-sigortasi': [{ ad: 'Mevzuat Bilgi Sistemi — 6305 Sayılı Afet Sigortaları Kanunu', url: 'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6305.pdf' }],
  '6306-sayili-kentsel-donusum-kanunu': [{ ad: 'Kentsel Dönüşüm Başkanlığı — 6306 Sayılı Kanun Metni', url: 'https://kdb.gov.tr/files/mevzuatdosya/2025581301335809.pdf' }],
  'riskli-yapi-tespiti': [{ ad: 'Kentsel Dönüşüm Başkanlığı — 6306 Sayılı Kanun Metni', url: 'https://kdb.gov.tr/files/mevzuatdosya/2025581301335809.pdf' }],
};

export const SOZLUK_TERIM_TASLAKLARI: HamTerim[] = [
  ...TAPU_MULKIYET_TERIMLERI,
  ...IMAR_KADASTRO_TERIMLERI,
  ...KIRA_TAHLIYE_TERIMLERI,
  ...VERGI_HARC_TERIMLERI,
  ...KENTSEL_DONUSUM_TERIMLERI,
  ...INSAAT_MIMARLIK_TERIMLERI,
  ...DEGERLEME_FINANS_TERIMLERI,
];

// Onaylanmamış taslak terimler (test kontrolü için)
export const ONAYSIZ_TASLAKLAR = new Set([
  'kira-carpani-amortisman',
]);

export const SOZLUK_TERIMLERI: Terim[] = SOZLUK_TERIM_TASLAKLARI
  .filter((terim) => !ONAYSIZ_TASLAKLAR.has(terim.slug))
  .map((terim) => ({
    ...terim,
    kaynaklar: TERIM_KAYNAK_ISTISNALARI[terim.slug] ?? KATEGORI_KAYNAKLARI[terim.kategori] ?? [{ ad: 'Mevzuat Bilgi Sistemi', url: 'https://mevzuat.gov.tr' }],
    guncellemeTarihi: '2026-10-03',
    kapsamNotu: SOZLUK_KAPSAM_NOTU,
  }));

export function terimGetir(slug: string): Terim | undefined {
  return SOZLUK_TERIMLERI.find((t) => t.slug === slug);
}

export function harfeGoreTerimler(harf: string): Terim[] {
  return SOZLUK_TERIMLERI.filter((t) => t.harf.toUpperCase() === harf.toUpperCase());
}

export function terimAra(sorgu: string): Terim[] {
  const temiz = sorgu.trim().toLowerCase();
  if (!temiz) return SOZLUK_TERIMLERI;
  return SOZLUK_TERIMLERI.filter(
    (t) =>
      t.terim.toLowerCase().includes(temiz) ||
      t.kisaTanim.toLowerCase().includes(temiz) ||
      t.pratikteNeAnlamaGelir.toLowerCase().includes(temiz) ||
      t.hukukiKarsilik.toLowerCase().includes(temiz) ||
      t.kategori.toLowerCase().includes(temiz)
  );
}
'''
    with open(sozluk_ts_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Ana sozluk.ts başarıyla yazıldı.")

if __name__ == "__main__":
    main()
