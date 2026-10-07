import test from 'node:test';
import assert from 'node:assert/strict';
import { aramaSayfasiBul, aramaSayfasiIlanlari } from '../src/lib/arama-sayfalari.ts';

const daire = aramaSayfasiBul('silivri-satilik-daire')!;
const arazi = aramaSayfasiBul('silivri-satilik-arsa-tarla')!;
const ilan = (id: string, ek = {}) => ({ id, il: 'İstanbul', ilce: 'Silivri', islem: 'satilik' as const, tipGrup: 'konut' as const, tip: 'daire', ...ek });

test('arama adresleri sabit izin listesiyle sınırlıdır', () => {
  assert.ok(daire && arazi);
  for (const slug of [undefined, 'silivri', 'silivri-kiralik-daire', '__proto__', 'toString']) assert.equal(aramaSayfasiBul(slug), undefined);
});

test('daire araması doğru il, ilçe, işlem ve alt türü birlikte ister', () => {
  const sonuc = aramaSayfasiIlanlari(daire, [
    ilan('uygun'), ilan('yazim', { il: ' İSTANBUL ', ilce: ' SİLİVRİ ', tip: ' Daire ' }),
    ilan('kira', { islem: 'kiralik' }), ilan('devir', { islem: 'devren-satilik' }),
    ilan('villa', { tip: 'villa' }), ilan('eksik', { il: null }),
    ilan('baska-il', { il: 'Edirne' }), ilan('baska-ilce', { ilce: 'Çatalca' }),
    ilan('isyeri', { tipGrup: 'isyeri', tip: 'daire' }),
  ]);
  assert.deepEqual(sonuc.map((oge) => oge.id), ['uygun', 'yazim']);
});

test('arazi araması imarlı alt türleri kapsar, başlığa veya yanlış gruba bakmaz', () => {
  const sonuc = aramaSayfasiIlanlari(arazi, [
    ilan('tarla', { tipGrup: 'arsa', tip: 'tarla' }),
    ilan('imarli', { tipGrup: 'arsa', tip: 'villa imarlı' }),
    ilan('konut', { tip: 'tarla' }),
    ilan('kat-karsiligi', { tipGrup: 'arsa', tip: 'tarla', islem: 'kat-karsiligi-satilik' }),
    ilan('kira', { tipGrup: 'arsa', tip: 'tarla', islem: 'kiralik' }),
    ilan('baska-il', { tipGrup: 'arsa', tip: 'tarla', il: 'Tekirdağ' }),
  ]);
  assert.deepEqual(sonuc.map((oge) => oge.id), ['tarla', 'imarli']);
});

test('boş portföy ve eksik konum sahte eşleşme üretmez, kaynak değiştirilmez', () => {
  assert.deepEqual(aramaSayfasiIlanlari(arazi, []), []);
  const kaynak = [ilan('eksik', { ilce: null }), ilan('uygun')];
  const once = structuredClone(kaynak);
  assert.deepEqual(aramaSayfasiIlanlari(daire, kaynak).map((oge) => oge.id), ['uygun']);
  assert.deepEqual(kaynak, once);
});
