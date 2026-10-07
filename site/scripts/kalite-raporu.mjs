#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { alanOzellikleriniBirlestir, ilanAlanlariniCoz } from '../src/lib/ilan-alanlari.ts';
import { gorunurIlanIdleri, kaynakOzellikleriniUygula, kaynakSunumDuzeltmesi } from '../src/lib/ilan-butunlugu.ts';
import { ilanKalitesiniDenetle, kaliteOzeti } from '../src/lib/ilan-kalite.ts';
import { teyitAnahtari, teyitOzeti } from '../src/lib/ilan-teyit.ts';
import { DANISMANLAR } from '../src/lib/site.ts';

const dosya = process.argv[2];
if (!dosya) {
  console.error('Kullanım: node --experimental-strip-types scripts/kalite-raporu.mjs <wrangler-json|--remote> [--markdown]');
  process.exit(2);
}

const guvenliJson = (ham, varsayilan) => {
  if (ham == null || ham === '') return varsayilan;
  if (typeof ham !== 'string') return ham;
  try { return JSON.parse(ham) ?? varsayilan; } catch { return varsayilan; }
};

let hamGovde;
if (dosya === '--remote') {
  const { ortam } = await import('./lib/cf.mjs');
  const { token, hesap } = ortam();
  const sorgu = (await readFile(new URL('./kalite-snapshot.sql', import.meta.url), 'utf8')).replace(/^--.*$/gm, '').trim();
  const { stdout } = await promisify(execFile)('npx', ['wrangler', 'd1', 'execute', 'edm-talepler', '--remote', '--json', '--command', sorgu], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: { ...process.env, CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: hesap },
    maxBuffer: 16 * 1024 * 1024,
  });
  hamGovde = stdout;
} else {
  hamGovde = await readFile(dosya, 'utf8');
}
const govde = JSON.parse(hamGovde);
const tumSatirlar = govde.flatMap((parca) => parca.results ?? []);
const gorunurIdler = gorunurIlanIdleri(tumSatirlar.map((satir) => satir.id));
const satirlar = tumSatirlar.filter((satir) => gorunurIdler.has(satir.id));
const bilinenDanismanlar = new Set(guvenliJson(tumSatirlar[0]?.ekip_sluglari, DANISMANLAR).flatMap((d) => [d.slug, d.emlakjetSlug]).filter(Boolean));

const kayitlar = satirlar.map((satir) => {
  const temel = guvenliJson(satir.d_temel, {});
  const kaynakDuzeltme = kaynakSunumDuzeltmesi(satir.id);
  const tipGrup = temel.tip_grup ?? satir.tip_grup;
  const m2 = temel.m2 !== undefined ? temel.m2 : satir.m2;
  const hamOzellikler = guvenliJson(temel.ozellikler ?? satir.ozellikler, {});
  const panelOzellikleri = guvenliJson(satir.d_ozellikler, {});
  const ozellikler = alanOzellikleriniBirlestir({
    tipGrup,
    m2,
    ozellikler: temel.ozellikler != null ? hamOzellikler : kaynakOzellikleriniUygula(hamOzellikler, kaynakDuzeltme),
  }, panelOzellikleri, Boolean(satir.d_temel && satir.d_ozellikler));
  const hepsiemlak = guvenliJson(satir.hepsiemlak_gorseller, []);
  const gizliGorseller = new Set(guvenliJson(satir.gizli_gorseller, []));
  const gorseller = [
    ...guvenliJson(satir.yuklenen_gorseller, []),
    ...(hepsiemlak.length ? hepsiemlak : guvenliJson(temel.gorseller ?? satir.gorseller, [])),
  ].filter((g) => !gizliGorseller.has(g));
  const baslik = satir.d_baslik ?? temel.baslik ?? kaynakDuzeltme?.baslik ?? satir.baslik;
  const aciklama = satir.d_aciklama ?? temel.aciklama ?? kaynakDuzeltme?.aciklama ?? satir.aciklama;
  const ilan = {
    ...satir, ...temel, id: satir.id, baslik, baslikTemiz: baslik.trim(), aciklama,
    fiyat: temel.fiyat ?? satir.fiyat,
    paraBirimi: temel.para_birimi ?? satir.para_birimi,
    islem: temel.islem ?? satir.islem,
    kategori: temel.kategori ?? satir.kategori,
    tip: temel.tip ?? satir.tip,
    tipGrup,
    oda: temel.oda ?? satir.oda,
    m2,
    il: temel.il ?? satir.il,
    ilce: temel.ilce ?? satir.ilce,
    mahalle: temel.mahalle ?? satir.mahalle,
    ozellikler,
    gorseller,
    danismanSlug: temel.danisman_slug !== undefined ? temel.danisman_slug : satir.danisman_slug,
    alanlar: ilanAlanlariniCoz({ tipGrup, m2, ozellikler }),
  };
  return { ilan, kalite: ilanKalitesiniDenetle(ilan, bilinenDanismanlar), teyitler: guvenliJson(satir.teyit_kayitlari, []) };
});

const teyitHaritasi = new Map();
for (const kayit of kayitlar.flatMap((kayit) => kayit.teyitler)) {
  if (kayit?.ilan_id && kayit?.sorun_kodu) teyitHaritasi.set(teyitAnahtari(kayit.ilan_id, kayit.sorun_kodu), kayit);
}
const teyitSayilari = teyitOzeti(teyitHaritasi);

const sira = { kritik: 0, incele: 1, uygun: 2 };
kayitlar.sort((a, b) => sira[a.kalite.durum] - sira[b.kalite.durum] || a.ilan.id.localeCompare(b.ilan.id));
const rapor = {
  kapsam: 'Kaynak snapshot ve panel geçersiz kılmalarına uygulanan otomatik kurallar. Fiyat, tapu ve müsaitlik iş sahibi tarafından teyit edilmemiştir.',
  ozet: kaliteOzeti(kayitlar.map((kayit) => kayit.kalite)),
  teyitOzeti: teyitSayilari,
  kayitlar: kayitlar.map(({ ilan, kalite, teyitler }) => ({
    id: ilan.id,
    baslik: ilan.baslikTemiz,
    durum: kalite.durum,
    gorunenFotografSayisi: ilan.gorseller.length,
    islem: ilan.islem, kategori: ilan.kategori,
    fiyat: ilan.fiyat, paraBirimi: ilan.paraBirimi,
    alanlar: ilan.alanlar, danisman: ilan.danismanSlug,
    kaynakDuzeltmesi: kaynakSunumDuzeltmesi(ilan.id)?.gerekce ?? null,
    sorunlar: kalite.sorunlar,
    teyitler,
  })),
};

if (!process.argv.includes('--markdown')) {
  console.log(JSON.stringify(rapor, null, 2));
} else {
  const kacir = (s) => String(s ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const sayiYaz = (n) => n == null ? '—' : n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  const durumYaz = { uygun: 'Kural uyarısı yok', incele: 'Teyit gerekli', kritik: 'Bilgi çelişkisi' };
  const alanYaz = (a) => [
    ['Brüt yapı', a.brutYapi], ['Net yapı', a.netYapi], ['Arsa', a.arsa],
    ['Parsel', a.toplamParsel], ['Hisse', a.satilanHisse], ['Kapsamı belirsiz', a.beyanEdilen],
  ].filter(([, n]) => n != null).map(([etiket, n]) => `${etiket}: ${sayiYaz(n)} m²`).join('; ') || 'Belirtilmemiş';
  const satirlar = [
    '# Yayındaki ilanların içerik kontrolü', '',
    `Rapor tarihi: ${new Date().toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' })}. Veri: ${tumSatirlar.length} etkin kaynak kaydı; doğrulanmış mükerrerler ayıklandıktan sonra ${rapor.ozet.toplam} yayımlanan ilan.`, '',
    rapor.kapsam, '',
    `Sonuç: **${rapor.ozet.uygun} kural uyarısı yok**, **${rapor.ozet.incele} teyit gerekli**, **${rapor.ozet.kritik} bilgi çelişkisi**. Bu sonuçlar ilanların doğruluk sertifikası değildir.`, '',
    `İşletme teyitleri: **${rapor.teyitOzeti.tamamlandi}/${rapor.teyitOzeti.toplam} konu kapandı**, ${rapor.teyitOzeti.yanitlandi} konu yanıtlandı ve panel düzeltmesi bekliyor, ${rapor.teyitOzeti.bekliyor} konu teyit bekliyor.`, '',
    'İşlem/kategori/başlık uyumu, fiyat ve para birimi, konum alanları, oda düzeni, net/brüt/arsa/hisse ölçüleri, site ve kullanım durumu, tapu/kadastro çelişkileri, ekip eşleşmesi ve görünür fotoğraf sayısı tarandı. Fotoğraf içeriğinin ve çözünürlüğünün görsel incelemesi bu otomatik rapora dahil değildir.', '',
    'Görünür fotoğraf sayısı Hepsiemlak tercihini, yüklenen fotoğrafları ve gizlenen fotoğrafları hesaba katar. Güncel ekip kayıtları kullanılır. Paneldeki tam kayıt veya eski alan geçersiz kılmaları kaynak düzeltmelerinden önceliklidir.', '',
    '## İşletmeden teyit bekleyenler', '',
  ];
  for (const kayit of rapor.kayitlar.filter((k) => k.sorunlar.length)) {
    satirlar.push(`### ${kayit.id} — ${kayit.baslik}`, '');
    for (const sorun of kayit.sorunlar) satirlar.push(`- ${sorun.seviye === 'hata' ? 'Çelişki' : 'Kontrol'}: ${sorun.mesaj}`);
    for (const teyit of kayit.teyitler) satirlar.push(`- Teyit kaydı [${teyit.durum}]: ${teyit.yanit || 'Yanıt girilmedi'}${teyit.kaynak ? ` — Kaynak: ${teyit.kaynak}` : ''}`);
    satirlar.push('');
  }
  satirlar.push('## Her ilan için kontrol kaydı', '', '| İlan | İşlem / kategori | Fiyat | Alanlar | Danışman | Fotoğraf | Sonuç |', '| --- | --- | --- | --- | --- | --- | --- |');
  for (const k of rapor.kayitlar) {
    satirlar.push(`| ${k.id} · ${kacir(k.baslik)} | ${kacir(k.islem)} / ${kacir(k.kategori)} | ${sayiYaz(k.fiyat)} ${k.paraBirimi} | ${alanYaz(k.alanlar)} | ${kacir(k.danisman)} | ${k.gorunenFotografSayisi} | ${durumYaz[k.durum]} |`);
  }
  satirlar.push('', '## Uygulanan kaynak sunum düzeltmeleri', '', 'Bu kurallar kaynak D1 kaydını değiştirmeden başlık ve özelliklerin sunumunu düzeltir. Tapu türü, kesin parsel kimliği veya fiyat kapsamı belirsiz olduğunda tahminle değiştirilmez.', '');
  for (const k of rapor.kayitlar.filter((k) => k.kaynakDuzeltmesi)) satirlar.push(`- **${k.id}:** ${k.kaynakDuzeltmesi}`);
  satirlar.push('', '## Yeniden üretme', '', 'Site dizininde, mevcut Cloudflare ortamıyla salt okunur güncel sorgu:', '', '```sh', 'npm run --silent quality:report -- --remote --markdown', '```', '', 'Kaydedilmiş Wrangler JSON sonucuyla ağsız çalıştırma:', '', '```sh', 'npm run --silent quality:report -- /tmp/edm-canli-kalite-guncel.json --markdown', '```', '', 'Sorgu: `site/scripts/kalite-snapshot.sql`. Kurallar: `site/src/lib/ilan-kalite.ts`. Canlı panelde İlanlar ekranı aynı kuralları güncel portföye uygular.', '');
  console.log(satirlar.join('\n'));
}
