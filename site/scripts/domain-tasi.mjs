#!/usr/bin/env node
// Alan adını Pages projesinden Worker'a taşır.
// Sıra önemli: önce Pages'ten alınır, hemen ardından Worker'a bağlanır.

import { cf, ortam } from './lib/cf.mjs';

const PAGES_PROJE = 'edm-yapi-gayrimenkul';
const WORKER = 'edm-yapi-gayrimenkul';
const ALAN = 'edmyapigayrimenkul.com';
const ADLAR = [ALAN, `www.${ALAN}`];

const { hesap } = ortam();
const yaz = (i, m) => console.log(`${i} ${m}`);

const zoneYanit = await cf(`/zones?name=${ALAN}`);
const zone = zoneYanit.result?.[0];
if (!zone) {
  console.error('✗ Zone bulunamadı');
  process.exit(1);
}

// 1) Pages'teki özel alan adlarını kaldır
for (const ad of ADLAR) {
  const r = await cf(
    `/accounts/${hesap}/pages/projects/${PAGES_PROJE}/domains/${encodeURIComponent(ad)}`,
    { method: 'DELETE' }
  );
  yaz(r.ok ? '✓' : '·', `Pages'ten kaldırıldı: ${ad}${r.ok ? '' : ' (zaten yoktu)'}`);
}

// 2) Worker'a özel alan adı olarak bağla
for (const ad of ADLAR) {
  const r = await cf(`/accounts/${hesap}/workers/domains`, {
    method: 'PUT',
    body: JSON.stringify({
      zone_id: zone.id,
      hostname: ad,
      service: WORKER,
      environment: 'production',
    }),
  });
  yaz(r.ok ? '✓' : '✗', `Worker'a bağlandı: ${ad}${r.ok ? '' : ' — ' + JSON.stringify(r.errors)}`);
}

// 3) Durum
const alanlar = await cf(`/accounts/${hesap}/workers/domains?zone_id=${zone.id}`);
console.log('\nWorker alan adları:');
for (const a of alanlar.result ?? []) {
  console.log(`  ${a.hostname} → ${a.service}`);
}

console.log('\nSertifika birkaç dakika içinde hazır olur.');
