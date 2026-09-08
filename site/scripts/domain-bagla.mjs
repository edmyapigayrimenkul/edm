#!/usr/bin/env node
// edmyapigayrimenkul.com ve www alt alan adını Pages projesine bağlar,
// gereken DNS kayıtlarını oluşturur.

import { cf, ortam } from './lib/cf.mjs';

const PROJE = 'edm-yapi-gayrimenkul';
const HEDEF = `${PROJE}.pages.dev`;
const ALAN = 'edmyapigayrimenkul.com';

const { hesap } = ortam();

const yaz = (isaret, mesaj) => console.log(`${isaret} ${mesaj}`);

// 1) Zone kimliği
const zoneYanit = await cf(`/zones?name=${ALAN}`);
const zone = zoneYanit.result?.[0];
if (!zone) {
  console.error('✗ Zone bulunamadı:', JSON.stringify(zoneYanit.errors));
  process.exit(1);
}
yaz('✓', `Zone: ${zone.name} (${zone.status})`);

// 2) Pages'e özel alan adlarını tanıt
for (const ad of [ALAN, `www.${ALAN}`]) {
  const r = await cf(`/accounts/${hesap}/pages/projects/${PROJE}/domains`, {
    method: 'POST',
    body: JSON.stringify({ name: ad }),
  });
  if (r.ok) yaz('✓', `Pages özel alan adı eklendi: ${ad}`);
  else {
    const zaten = JSON.stringify(r.errors ?? '').includes('already');
    yaz(zaten ? '·' : '✗', `${ad} — ${zaten ? 'zaten ekliydi' : JSON.stringify(r.errors)}`);
  }
}

// 3) DNS kayıtları — apex için CNAME düzleştirme Cloudflare tarafında çalışır
const mevcut = await cf(`/zones/${zone.id}/dns_records?per_page=100`);
const varOlan = new Map((mevcut.result ?? []).map((k) => [`${k.type}:${k.name}`, k]));

for (const ad of [ALAN, `www.${ALAN}`]) {
  const anahtar = `CNAME:${ad}`;
  const govde = JSON.stringify({
    type: 'CNAME',
    name: ad,
    content: HEDEF,
    proxied: true,
    ttl: 1,
    comment: 'Cloudflare Pages — EDM sitesi',
  });

  const eski = varOlan.get(anahtar);
  const r = eski
    ? await cf(`/zones/${zone.id}/dns_records/${eski.id}`, { method: 'PATCH', body: govde })
    : await cf(`/zones/${zone.id}/dns_records`, { method: 'POST', body: govde });

  if (r.ok) yaz('✓', `DNS ${eski ? 'güncellendi' : 'eklendi'}: ${ad} → ${HEDEF} (proxy açık)`);
  else yaz('✗', `${ad} — ${JSON.stringify(r.errors)}`);
}

// 4) www -> apex yönlendirmesi (tek kanonik adres)
const kural = {
  name: 'www yönlendirme',
  kind: 'zone',
  phase: 'http_request_dynamic_redirect',
  rules: [
    {
      action: 'redirect',
      expression: `(http.host eq "www.${ALAN}")`,
      description: 'www adresini kök alan adına yönlendir',
      action_parameters: {
        from_value: {
          status_code: 301,
          target_url: { expression: `concat("https://${ALAN}", http.request.uri.path)` },
          preserve_query_string: true,
        },
      },
    },
  ],
};

const kurallar = await cf(`/zones/${zone.id}/rulesets?phase=http_request_dynamic_redirect`);
const mevcutKume = (kurallar.result ?? []).find(
  (k) => k.phase === 'http_request_dynamic_redirect' && k.kind === 'zone'
);

const kr = mevcutKume
  ? await cf(`/zones/${zone.id}/rulesets/${mevcutKume.id}`, {
      method: 'PUT',
      body: JSON.stringify({ rules: kural.rules }),
    })
  : await cf(`/zones/${zone.id}/rulesets`, { method: 'POST', body: JSON.stringify(kural) });

if (kr.ok) yaz('✓', `www.${ALAN} → ${ALAN} yönlendirmesi kuruldu`);
else yaz('·', `Yönlendirme kurulamadı (kanonik etiket zaten var): ${JSON.stringify(kr.errors)}`);

console.log('\nSertifika hazırlanması birkaç dakika sürebilir.');
