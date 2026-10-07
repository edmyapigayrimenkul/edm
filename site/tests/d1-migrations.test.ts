import assert from 'node:assert/strict';
import test from 'node:test';

import { d1MigrasyonlariTam, d1DagitimUyumlulugu } from '../scripts/lib/migration-gate.mjs';
import { semayiKur } from '../src/lib/senkron/depo.ts';
import { gerekliD1Migrasyonu } from '../src/lib/senkron/surum.ts';

test('dağıtım bekleyen migration varken durur', () => {
  assert.equal(d1MigrasyonlariTam('Migrations to be applied: 0007-legacy-schema-baseline.sql'), false);
  assert.equal(d1MigrasyonlariTam('No migrations to apply!'), true);
});

const kapaliCrm = {
  yerel: [gerekliD1Migrasyonu, '0011-talep-is-sonucu.sql'], uygulanmis: [gerekliD1Migrasyonu],
  gerekli: gerekliD1Migrasyonu, degiskenler: { TALEP_IS_SONUCLARI_ETKIN: '0' }, uzakBaglamalar: [],
};

test('yalnız açıkça kapalı CRM geçişi ertelenebilir; tüm geçişler tam ise istisna gerekmez', () => {
  assert.deepEqual(d1DagitimUyumlulugu(kapaliCrm).ertelenen, ['0011-talep-is-sonucu.sql']);
  assert.deepEqual(d1DagitimUyumlulugu({ ...kapaliCrm, uygulanmis: kapaliCrm.yerel }).ertelenen, []);
  assert.deepEqual(d1DagitimUyumlulugu({ ...kapaliCrm, uzakBaglamalar: [{ name: 'TALEP_IS_SONUCLARI_ETKIN', type: 'plain_text', text: '0' }] }).ertelenen, ['0011-talep-is-sonucu.sql']);
});

test('eksik gerekli taban, eski veya bilinmeyen bekleyen geçişler dağıtımı durdurur', () => {
  for (const degisim of [
    { uygulanmis: [] }, { gerekli: '0011-talep-is-sonucu.sql' },
    { yerel: [...kapaliCrm.yerel, '0009-isletim-uyari.sql'] },
    { yerel: [...kapaliCrm.yerel, '0012-gelecek.sql'] },
    { yerel: [] }, { uzakBaglamalar: undefined },
  ]) assert.throws(() => d1DagitimUyumlulugu({ ...kapaliCrm, ...degisim }));
});

test('kapalı olduğu doğrulanamayan CRM veya yerel test kimliği üretim kapısını açmaz', () => {
  for (const degisim of [
    { degiskenler: {} }, { degiskenler: { TALEP_IS_SONUCLARI_ETKIN: '1' } },
    { degiskenler: { TALEP_IS_SONUCLARI_ETKIN: '0', PANEL_YEREL_TEST_KIMLIGI: '1' } },
    { uzakBaglamalar: [{ name: 'TALEP_IS_SONUCLARI_ETKIN', type: 'plain_text', text: '1' }] },
    { uzakBaglamalar: [{ name: 'TALEP_IS_SONUCLARI_ETKIN', type: 'secret_text' }] },
    { uzakBaglamalar: [{ name: 'PANEL_YEREL_TEST_KIMLIGI', type: 'plain_text', text: '1' }] },
  ]) assert.throws(() => d1DagitimUyumlulugu({ ...kapaliCrm, ...degisim }));
});

test('uygulama DDL çalıştırmaz ve gerekli migration kaydı yoksa açık hata verir', async () => {
  const sqlMetinleri: string[] = [];
  const vt = {
    prepare(sql: string) {
      sqlMetinleri.push(sql);
      return {
        bind() {
          return this;
        },
        async first() {
          return null;
        },
      };
    },
  };

  await assert.rejects(semayiKur(vt as never), new RegExp(gerekliD1Migrasyonu));
  assert.deepEqual(sqlMetinleri, ['SELECT name FROM d1_migrations WHERE name = ? LIMIT 1']);
});
