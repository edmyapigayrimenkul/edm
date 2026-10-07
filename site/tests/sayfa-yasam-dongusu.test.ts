import assert from 'node:assert/strict';
import test from 'node:test';
import { herSayfada } from '../src/scripts/sayfa.ts';

test('kurulum ilk açılışta ve ClientRouter sayfa geçişlerinde yeniden çalışır', () => {
  const oncekiBelge = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const belge = new EventTarget();
  Object.defineProperty(globalThis, 'document', { value: belge, configurable: true });

  try {
    let kurulumSayisi = 0;
    herSayfada(() => kurulumSayisi++);
    assert.equal(kurulumSayisi, 1, 'ilk açılışta doğrudan kurulmalı');

    belge.dispatchEvent(new Event('astro:page-load'));
    assert.equal(kurulumSayisi, 2, 'ClientRouter geçişinde tekrar kurulmalı');

    belge.dispatchEvent(new Event('astro:page-load'));
    assert.equal(kurulumSayisi, 3, 'sonraki geçişlerde de yaşamaya devam etmeli');
  } finally {
    if (oncekiBelge) Object.defineProperty(globalThis, 'document', oncekiBelge);
    else delete (globalThis as typeof globalThis & { document?: EventTarget }).document;
  }
});
