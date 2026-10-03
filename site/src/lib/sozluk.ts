/**
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
