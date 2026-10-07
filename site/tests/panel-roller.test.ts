import assert from 'node:assert/strict';
import test from 'node:test';
import { rolYetkisiGerekli, rolYetkisiVar } from '../src/lib/panel/roller.ts';

test('ana admin bütün panel yetkilerine sahiptir', () => {
  for (const yetki of ['ilan-yonet', 'icerik-yonet', 'islem-gecmisi-gor', 'kalici-sil', 'ekip-yonet', 'ayar-yonet'] as const) {
    assert.equal(rolYetkisiVar('ana-admin', yetki), true);
  }
});

test('admin günlük ilan ve içerik işlerini yapabilir', () => {
  assert.equal(rolYetkisiVar('admin', 'ilan-yonet'), true);
  assert.equal(rolYetkisiVar('admin', 'icerik-yonet'), true);
  assert.equal(rolYetkisiVar('admin', 'islem-gecmisi-gor'), true);
});

test('admin kalıcı silme, ekip ve genel ayarları değiştiremez', () => {
  assert.equal(rolYetkisiVar('admin', 'kalici-sil'), false);
  assert.equal(rolYetkisiVar('admin', 'ekip-yonet'), false);
  assert.equal(rolYetkisiVar('admin', 'ayar-yonet'), false);
});

test('tanımsız rol yetkisizdir', () => {
  assert.equal(rolYetkisiVar(null, 'ilan-yonet'), false);
});

test('yetkisiz kritik işlem açıklayıcı hata verir', () => {
  assert.throws(() => rolYetkisiGerekli('admin', 'kalici-sil'), /yalnızca ana admin/);
});
