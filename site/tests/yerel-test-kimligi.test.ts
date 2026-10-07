import assert from 'node:assert/strict';
import test from 'node:test';
import { yerelTestPanelKimligi } from '../src/lib/panel/yerel-test-kimligi.ts';

test('yerel panel kimliği yalnız açık bayrak ve loopback adresinde açılır', () => {
  assert.deepEqual(
    yerelTestPanelKimligi('http://localhost:8896/yonetim/ilan-ekle', '1'),
    { eposta: 'ozdogandogukan@gmail.com', kimlik: 'yerel-test-worker' }
  );
  assert.deepEqual(
    yerelTestPanelKimligi('http://127.0.0.1:8896/yonetim/ilan-ekle', '1'),
    { eposta: 'ozdogandogukan@gmail.com', kimlik: 'yerel-test-worker' }
  );
  assert.deepEqual(
    yerelTestPanelKimligi('http://[::1]:8896/yonetim/ilan-ekle', '1'),
    { eposta: 'ozdogandogukan@gmail.com', kimlik: 'yerel-test-worker' }
  );
});

test('test bayrağı yoksa veya kapalıysa localhost kimlik kazanmaz', () => {
  assert.equal(yerelTestPanelKimligi('http://localhost:8896/yonetim', undefined), null);
  assert.equal(yerelTestPanelKimligi('http://localhost:8896/yonetim', '0'), null);
});

test('açık bayrak uzaktaki hostname veya bozuk URL için yetki vermez', () => {
  assert.equal(yerelTestPanelKimligi('https://edmyapigayrimenkul.com/yonetim', '1'), null);
  assert.equal(yerelTestPanelKimligi('not-a-url', '1'), null);
});
