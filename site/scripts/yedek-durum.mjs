#!/usr/bin/env node
import { appendFile } from 'node:fs/promises';
import { cf, ortam } from './lib/cf.mjs';
import { YEDEK_ORTAMLARI, yedekManifestiniDogrula } from './lib/yedek-kurallari.mjs';

const hedef = process.argv[2];
const ayar = YEDEK_ORTAMLARI[hedef];
if (!ayar) throw new Error('Kullanım: node scripts/yedek-durum.mjs <staging|production>');
const { hesap, token } = ortam();
let imlec;
const imlecler = new Set();
let sonAnahtar;
do {
  const sorgu = new URLSearchParams({ per_page: '1000', prefix: `${hedef}/` });
  if (imlec) sorgu.set('cursor', imlec);
  const sonuc = await cf(`/accounts/${hesap}/r2/buckets/${ayar.kova}/objects?${sorgu}`);
  if (!sonuc.ok || !Array.isArray(sonuc.result)) throw new Error('Yedek arşivleri listelenemedi.');
  for (const dosya of sonuc.result) {
    if (typeof dosya.key === 'string' && dosya.key.startsWith(`${hedef}/`) && dosya.key.endsWith('/manifest.json') && (!sonAnahtar || dosya.key > sonAnahtar)) sonAnahtar = dosya.key;
  }
  imlec = sonuc.result_info?.is_truncated ? sonuc.result_info.cursor : undefined;
  if (sonuc.result_info?.is_truncated && (!imlec || imlecler.has(imlec))) throw new Error('Yedek arşivi sayfalaması tamamlanamadı.');
  if (imlec) imlecler.add(imlec);
} while (imlec);
if (!sonAnahtar) throw new Error('Tamamlanmış yedek manifesti bulunamadı.');
const cevap = await fetch(`https://api.cloudflare.com/client/v4/accounts/${hesap}/r2/buckets/${ayar.kova}/objects/${encodeURIComponent(sonAnahtar)}`, {
  headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000),
});
if (!cevap.ok) throw new Error(`Son yedek manifesti okunamadı (${cevap.status}).`);
const sonuc = yedekManifestiniDogrula(await cevap.json(), hedef, sonAnahtar);
const metin = `✓ ${hedef}: son yedek ${sonuc.yasSaat.toFixed(1)} saat önce; D1 ${sonuc.sqlBayt} bayt, R2 ${sonuc.nesneAdedi} nesne / ${sonuc.r2Bayt} bayt.`;
console.log(metin);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${metin}\n`);
