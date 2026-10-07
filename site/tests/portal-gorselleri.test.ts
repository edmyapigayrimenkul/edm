import assert from 'node:assert/strict';
import test from 'node:test';
import { portalGorselleriniSec } from '../src/lib/portal-gorselleri.ts';

test('daha çok fotoğrafı olan Emlakjet setini seçerek portal karelerinin eksilmesini önler', () => {
  assert.deepEqual(
    portalGorselleriniSec(['ej-1', 'ej-2', 'ej-3'], ['hepsi-1', 'hepsi-2']),
    ['ej-1', 'ej-2', 'ej-3']
  );
});

test('setler eşitse ve Hepsiemlak daha doluysa Hepsiemlak görsellerini kullanır', () => {
  assert.deepEqual(portalGorselleriniSec(['ej-1', 'ej-2'], ['hepsi-1', 'hepsi-2']), ['hepsi-1', 'hepsi-2']);
  assert.deepEqual(portalGorselleriniSec(['ej-1'], ['hepsi-1', 'hepsi-2']), ['hepsi-1', 'hepsi-2']);
});
