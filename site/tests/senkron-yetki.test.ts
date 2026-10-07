import assert from 'node:assert/strict';
import test from 'node:test';

import { senkronIstegiYetkili } from '../src/lib/senkron/yetki.ts';

const beklenen = 'uzun-test-anahtari';

test('doğru senkron anahtarı yalnızca başlıktan kabul edilir', () => {
  const istek = new Request('https://example.com/api/senkron', {
    method: 'POST',
    headers: { 'X-Senkron-Anahtari': beklenen },
  });
  assert.equal(senkronIstegiYetkili(istek, beklenen), true);
});

test('doğru anahtar URL parametresinde olsa bile reddedilir', () => {
  const istek = new Request(`https://example.com/api/senkron?anahtar=${beklenen}`, {
    method: 'POST',
  });
  assert.equal(senkronIstegiYetkili(istek, beklenen), false);
});

test('eksik yapılandırma, eksik başlık ve yanlış başlık reddedilir', () => {
  const basliksiz = new Request('https://example.com/api/senkron', { method: 'POST' });
  const yanlis = new Request('https://example.com/api/senkron', {
    method: 'POST',
    headers: { 'X-Senkron-Anahtari': 'yanlis' },
  });
  assert.equal(senkronIstegiYetkili(basliksiz, beklenen), false);
  assert.equal(senkronIstegiYetkili(yanlis, beklenen), false);
  assert.equal(senkronIstegiYetkili(yanlis, null), false);
  assert.equal(senkronIstegiYetkili(yanlis, '   '), false);
});
