#!/usr/bin/env node
// Ofis portföyünü Emlakjet'ten çeker, data/listings.json dosyasına yazar.
// Portalda artık görünmeyen ilanlar "pasif" işaretlenir (silinmez, arşivde kalır).

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ofisIlanLinkleri, ilanDetay } from './lib/emlakjet.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CIKTI = resolve(KOK, 'data/listings.json');
const OFIS_URL = 'https://www.emlakjet.com/emlak-ofisleri/edm-yapi-gayrimenkul-1015383';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function oncekiVeri() {
  try {
    return JSON.parse(await readFile(CIKTI, 'utf8'));
  } catch {
    return { ilanlar: [] };
  }
}

async function main() {
  console.log('› Ofis sayfaları taranıyor…');
  const linkler = await ofisIlanLinkleri(OFIS_URL);
  console.log(`  ${linkler.length} ilan bulundu`);

  const onceki = await oncekiVeri();
  const oncekiHarita = new Map(onceki.ilanlar.map((i) => [i.id, i]));

  const ilanlar = [];
  const basarisiz = [];

  for (const [i, link] of linkler.entries()) {
    process.stdout.write(`  [${i + 1}/${linkler.length}] ${link.id} … `);
    try {
      const detay = await ilanDetay(link);
      if (detay) {
        // İlk görülme tarihini koru; "yeni ilan" rozeti buna göre çalışacak.
        const eski = oncekiHarita.get(detay.id);
        detay.ilkGorulme = eski?.ilkGorulme ?? detay.cekilme;
        detay.durum = 'aktif';
        ilanlar.push(detay);
        console.log(`✓ ${detay.baslik.slice(0, 45)}`);
      } else {
        basarisiz.push(link.id);
        console.log('✗ veri okunamadı');
      }
    } catch (err) {
      basarisiz.push(link.id);
      console.log(`✗ ${err.message}`);
    }
    await sleep(700);
  }

  // Portalda artık olmayanlar: pasife düşür, silme.
  const aktifIdler = new Set(ilanlar.map((i) => i.id));
  const dusenler = onceki.ilanlar.filter(
    (i) => !aktifIdler.has(i.id) && !basarisiz.includes(i.id)
  );
  for (const d of dusenler) {
    ilanlar.push({ ...d, durum: 'pasif', pasifTarihi: d.pasifTarihi ?? new Date().toISOString() });
  }

  const veri = {
    guncellenme: new Date().toISOString(),
    kaynak: OFIS_URL,
    sayim: {
      aktif: ilanlar.filter((i) => i.durum === 'aktif').length,
      pasif: ilanlar.filter((i) => i.durum === 'pasif').length,
      basarisiz: basarisiz.length,
    },
    ilanlar,
  };

  await mkdir(dirname(CIKTI), { recursive: true });
  await writeFile(CIKTI, JSON.stringify(veri, null, 2), 'utf8');

  console.log(`\n✓ ${CIKTI}`);
  console.log(`  aktif: ${veri.sayim.aktif}  pasif: ${veri.sayim.pasif}  hata: ${veri.sayim.basarisiz}`);
  if (dusenler.length) console.log(`  portaldan düşen: ${dusenler.map((d) => d.id).join(', ')}`);
}

main().catch((err) => {
  console.error('HATA:', err);
  process.exit(1);
});
