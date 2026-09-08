#!/usr/bin/env node
// Talep veritabanını oluşturur, tabloyu kurar ve Pages projesine bağlar.

import { cf, ortam } from './lib/cf.mjs';

const PROJE = 'edm-yapi-gayrimenkul';
const VT_ADI = 'edm-talepler';
const { hesap } = ortam();

const yaz = (i, m) => console.log(`${i} ${m}`);

// 1) Veritabanı — varsa yenisini açma
const liste = await cf(`/accounts/${hesap}/d1/database`);
let vt = (liste.result ?? []).find((v) => v.name === VT_ADI);

if (!vt) {
  const olustur = await cf(`/accounts/${hesap}/d1/database`, {
    method: 'POST',
    body: JSON.stringify({ name: VT_ADI }),
  });
  if (!olustur.ok) {
    console.error('✗ Veritabanı oluşturulamadı:', JSON.stringify(olustur.errors));
    process.exit(1);
  }
  vt = olustur.result;
  yaz('✓', `Veritabanı oluşturuldu: ${VT_ADI}`);
} else {
  yaz('·', `Veritabanı zaten var: ${VT_ADI}`);
}

// 2) Tablo
const sema = `
CREATE TABLE IF NOT EXISTS talepler (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tur         TEXT NOT NULL,
  ad          TEXT NOT NULL,
  telefon     TEXT NOT NULL,
  eposta      TEXT,
  konu        TEXT,
  mulk_tipi   TEXT,
  ilce        TEXT,
  mahalle     TEXT,
  m2          INTEGER,
  mesaj       TEXT,
  kaynak      TEXT,
  ip_ulke     TEXT,
  olusturma   TEXT NOT NULL DEFAULT (datetime('now')),
  durum       TEXT NOT NULL DEFAULT 'yeni'
);
CREATE INDEX IF NOT EXISTS talep_tarih ON talepler (olusturma DESC);
CREATE INDEX IF NOT EXISTS talep_durum ON talepler (durum);
`;

const semaSonuc = await cf(`/accounts/${hesap}/d1/database/${vt.uuid}/query`, {
  method: 'POST',
  body: JSON.stringify({ sql: sema }),
});
yaz(semaSonuc.ok ? '✓' : '✗', semaSonuc.ok ? 'Tablo hazır' : JSON.stringify(semaSonuc.errors));

// 3) Pages projesine bağla — mevcut yapılandırmayı bozmadan
const proje = await cf(`/accounts/${hesap}/pages/projects/${PROJE}`);
if (!proje.ok) {
  console.error('✗ Proje okunamadı:', JSON.stringify(proje.errors));
  process.exit(1);
}

const baglama = { VT: { id: vt.uuid } };
const guncelle = await cf(`/accounts/${hesap}/pages/projects/${PROJE}`, {
  method: 'PATCH',
  body: JSON.stringify({
    deployment_configs: {
      production: {
        ...(proje.result.deployment_configs?.production ?? {}),
        d1_databases: baglama,
      },
      preview: {
        ...(proje.result.deployment_configs?.preview ?? {}),
        d1_databases: baglama,
      },
    },
  }),
});

yaz(
  guncelle.ok ? '✓' : '✗',
  guncelle.ok
    ? 'Veritabanı Pages projesine bağlandı (bağlama adı: VT)'
    : JSON.stringify(guncelle.errors)
);

console.log(`\nVeritabanı kimliği: ${vt.uuid}`);
