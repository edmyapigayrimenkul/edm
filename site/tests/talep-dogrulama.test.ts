import test from 'node:test';
import assert from 'node:assert/strict';
import { talebiDogrula, telefonuNormalizeEt } from '../src/lib/talep-dogrulama.ts';

test('Türk telefon biçimleri aynı E.164 değerine dönüşür', () => {
  for (const telefon of ['0536 343 41 97', '5363434197', '+90 (536) 343-41-97', '0090 536 343 41 97']) {
    assert.equal(telefonuNormalizeEt(telefon), '+905363434197');
  }
});

test('harf veya eksik hane içeren telefon reddedilir', () => {
  assert.equal(telefonuNormalizeEt('0536 abc 4197'), null);
  assert.equal(telefonuNormalizeEt('12345'), null);
});

test('iletişim talebi tür alanlarını doğrular ve ilgisiz değerleme alanlarını atar', () => {
  const sonuc = talebiDogrula({
    tur: 'iletisim', ad: 'Ada Lovelace', telefon: '0536 343 41 97',
    konu: 'Bir ilan hakkında', mesaj: 'İlan için bilgi rica ediyorum.',
    tip: 'Arsa', ilce: 'Silivri', kaynak: '/iletisim',
  });
  assert.equal(sonuc.tamam, true);
  if (sonuc.tamam) {
    assert.equal(sonuc.talep.telefon, '+905363434197');
    assert.equal(sonuc.talep.mulk_tipi, null);
    assert.equal(sonuc.talep.ilce, null);
    assert.equal(sonuc.talep.ilan_id, null);
  }
});

test('ilan bağlamlı iletişim talebi kimlik ve başlığı ayrı alanlarda korur', () => {
  const sonuc = talebiDogrula({
    tur: 'iletisim', ad: 'Ada Lovelace', telefon: '0536 343 41 97',
    konu: 'Bir ilan hakkında', mesaj: 'Yerinde görmek istiyorum.',
    ilan_id: 'elle-20260913-1', ilan_baslik: 'Selimpaşa’da 7+2 villa',
    kaynak: '/ilan/selimpasada-7-2-villa-elle-20260913-1',
  });
  assert.equal(sonuc.tamam, true);
  if (sonuc.tamam) {
    assert.equal(sonuc.talep.ilan_id, 'elle-20260913-1');
    assert.equal(sonuc.talep.ilan_baslik, 'Selimpaşa’da 7+2 villa');
  }
});

test('eksik veya konusu değiştirilmiş ilan bağlamı reddedilir', () => {
  const temel = {
    tur: 'iletisim', ad: 'Test Kişi', telefon: '05363434197', mesaj: 'Randevu istiyorum.',
    konu: 'Bir ilan hakkında', ilan_id: '18870737',
  };
  assert.deepEqual(
    talebiDogrula(temel),
    { tamam: false, hata: 'İlan bilgisi eksik.', alan: 'ilan_baslik' }
  );
  assert.deepEqual(
    talebiDogrula({ ...temel, ilan_baslik: 'Örnek ilan', konu: 'Diğer' }),
    { tamam: false, hata: 'İlan talebinin konusu geçersiz.', alan: 'konu' }
  );
});

test('iletişim mesajı ve izinli konusu sunucuda zorunludur', () => {
  const temel = { tur: 'iletisim', ad: 'Test Kişi', telefon: '05363434197' };
  assert.deepEqual(talebiDogrula(temel), { tamam: false, hata: 'Mesaj gerekli.', alan: 'mesaj' });
  const sonuc = talebiDogrula({ ...temel, konu: 'uydurma', mesaj: 'Merhaba' });
  assert.deepEqual(sonuc, { tamam: false, hata: 'Geçersiz iletişim konusu.', alan: 'konu' });
});

test('değerleme mülk tipi, ilçe ve açık onay olmadan kabul edilmez', () => {
  const temel = { tur: 'degerleme', ad: 'Test Kişi', telefon: '05363434197' };
  assert.equal(talebiDogrula(temel).tamam, false);
  assert.deepEqual(
    talebiDogrula({ ...temel, onay: 'on', tip: 'Uydurma', ilce: 'Silivri' }),
    { tamam: false, hata: 'Geçersiz mülk tipi.', alan: 'tip' }
  );
});

test('geçerli değerleme talebi temiz ve sayısal değer üretir', () => {
  const sonuc = talebiDogrula({
    tur: 'degerleme', ad: 'Metin Özdoğan', telefon: '0536 343 41 97',
    eposta: 'ornek@example.com', tip: 'Tarla', ilce: 'Silivri', mahalle: 'Çanta',
    m2: '12500', not: 'Yola cepheli.', onay: 'on', kaynak: '/degerleme',
  });
  assert.equal(sonuc.tamam, true);
  if (sonuc.tamam) assert.equal(sonuc.talep.m2, 12500);
});

test('geçersiz e-posta, metrekare ve aşırı uzun alanlar reddedilir', () => {
  const temel = {
    tur: 'degerleme', ad: 'Test Kişi', telefon: '05363434197',
    tip: 'Daire', ilce: 'Silivri', onay: 'on',
  };
  assert.equal(talebiDogrula({ ...temel, eposta: 'yanlis@' }).tamam, false);
  assert.equal(talebiDogrula({ ...temel, m2: '12.5' }).tamam, false);
  const sonuc = talebiDogrula({ ...temel, not: 'x'.repeat(4001) });
  assert.deepEqual(sonuc, { tamam: false, hata: 'Ek bilgi en fazla 4000 karakter olabilir.', alan: 'not' });
});
