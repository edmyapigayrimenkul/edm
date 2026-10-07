import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ILAN_TEYIT_LISTESI,
  teyitAnahtari,
  teyitGirdisiniDogrula,
  teyitOzeti,
  type TeyitKaydi,
} from '../src/lib/ilan-teyit.ts';

test('işletme teyit listesinde her konu tekil ve etkilenen ilanlar açıkça tanımlıdır', () => {
  const anahtarlar = ILAN_TEYIT_LISTESI.map((madde) => teyitAnahtari(madde.ilanId, madde.kod));
  assert.equal(new Set(anahtarlar).size, anahtarlar.length);
  assert.ok(ILAN_TEYIT_LISTESI.every((madde) => madde.etkilenenIlanIdleri.includes(madde.ilanId)));
  assert.deepEqual(
    ILAN_TEYIT_LISTESI.find((madde) => madde.kod === 'bagimsiz-bolum')?.etkilenenIlanIdleri,
    ['18522916', '18746132']
  );
  assert.match(
    ILAN_TEYIT_LISTESI.find((madde) => madde.ilanId === '19889243' && madde.kod === 'kullanim-teslim')?.soru ?? '',
    /Mülk Sahibi Oturuyor.*ne zaman teslim/i
  );
});

test('yanıt ve kaynak olmadan teyit maddesi erken kapatılamaz', () => {
  const temel = { ilanId: '19538691', sorunKodu: 'tapu-turu', durum: 'tamamlandi', yanit: '', kaynak: '', notu: '' };
  assert.throws(() => teyitGirdisiniDogrula(temel), /yanıt/i);
  assert.throws(() => teyitGirdisiniDogrula({ ...temel, yanit: 'Kat İrtifakı' }), /teyit kaynağı/i);
  assert.equal(teyitGirdisiniDogrula({ ...temel, yanit: 'Kat İrtifakı', kaynak: 'Tapu belgesi · 14.09.2026' }).durum, 'tamamlandi');
  assert.throws(() => teyitGirdisiniDogrula({ ...temel, ilanId: 'bilinmeyen' }), /tanınmıyor/i);
});

test('özet, hiç kaydı olmayan maddeleri bekliyor sayar', () => {
  const ilk = ILAN_TEYIT_LISTESI[0];
  const ikinci = ILAN_TEYIT_LISTESI[1];
  const kayit = (ilan_id: string, sorun_kodu: string, durum: TeyitKaydi['durum']): TeyitKaydi => ({
    ilan_id, sorun_kodu, durum, yanit: 'Doğrulandı', kaynak: 'Belge', notu: '', teyit_eden: 'admin@example.com',
    olusturma: '2026-09-14T00:00:00.000Z', guncelleme: '2026-09-14T00:00:00.000Z',
  });
  const harita = new Map([
    [teyitAnahtari(ilk.ilanId, ilk.kod), kayit(ilk.ilanId, ilk.kod, 'tamamlandi')],
    [teyitAnahtari(ikinci.ilanId, ikinci.kod), kayit(ikinci.ilanId, ikinci.kod, 'yanitlandi')],
  ]);
  assert.deepEqual(teyitOzeti(harita), {
    toplam: ILAN_TEYIT_LISTESI.length,
    bekliyor: ILAN_TEYIT_LISTESI.length - 2,
    yanitlandi: 1,
    tamamlandi: 1,
  });
});
