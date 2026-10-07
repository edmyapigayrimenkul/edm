import assert from 'node:assert/strict';
import test from 'node:test';

import {
  accessClaimleriGecerli,
  accessVerenAdresi,
  ekipAlaniniNormallestir,
  type AccessClaimleri,
} from '../src/lib/panel/access-claimleri.ts';

const simdi = 1_800_000_000;
const yapilandirma = {
  ekipAlanAdi: 'ozbornstudio.cloudflareaccess.com',
  audience: 'uygulama-aud',
};
const gecerliClaimler = (): AccessClaimleri => ({
  iss: 'https://ozbornstudio.cloudflareaccess.com',
  aud: ['uygulama-aud'],
  exp: simdi + 300,
  email: 'yonetici@example.com',
  sub: 'kimlik-1',
});

test('doğru issuer, audience ve süre birlikte kabul edilir', () => {
  assert.equal(accessClaimleriGecerli(gecerliClaimler(), yapilandirma, simdi), true);
  assert.equal(
    accessClaimleriGecerli({ ...gecerliClaimler(), aud: 'uygulama-aud' }, yapilandirma, simdi),
    true
  );
});

test('audience yapılandırması eksikse panel güvenli biçimde kapalı kalır', () => {
  assert.equal(
    accessClaimleriGecerli(gecerliClaimler(), { ...yapilandirma, audience: null }, simdi),
    false
  );
  assert.equal(
    accessClaimleriGecerli(gecerliClaimler(), { ...yapilandirma, audience: '   ' }, simdi),
    false
  );
});

test('yanlış uygulama veya farklı ekip issuer değeri reddedilir', () => {
  assert.equal(
    accessClaimleriGecerli({ ...gecerliClaimler(), aud: ['baska-uygulama'] }, yapilandirma, simdi),
    false
  );
  assert.equal(
    accessClaimleriGecerli(
      { ...gecerliClaimler(), iss: 'https://baska-ekip.cloudflareaccess.com' },
      yapilandirma,
      simdi
    ),
    false
  );
  assert.equal(
    accessClaimleriGecerli({ ...gecerliClaimler(), iss: undefined }, yapilandirma, simdi),
    false
  );
});

test('süresi dolmuş jeton ve geçersiz ekip alanı reddedilir', () => {
  assert.equal(
    accessClaimleriGecerli({ ...gecerliClaimler(), exp: simdi - 1 }, yapilandirma, simdi),
    false
  );
  assert.equal(
    accessClaimleriGecerli({ ...gecerliClaimler(), exp: simdi }, yapilandirma, simdi),
    false
  );
  assert.equal(
    accessClaimleriGecerli(gecerliClaimler(), { ...yapilandirma, ekipAlanAdi: null }, simdi),
    false
  );
});

test('ekip alanı tam URL veya alan adı biçiminden güvenli biçimde normalleşir', () => {
  assert.equal(
    ekipAlaniniNormallestir('https://OZBORNSTUDIO.cloudflareaccess.com/'),
    'ozbornstudio.cloudflareaccess.com'
  );
  assert.equal(
    accessVerenAdresi('ozbornstudio.cloudflareaccess.com'),
    'https://ozbornstudio.cloudflareaccess.com'
  );
  assert.equal(ekipAlaniniNormallestir('http://ozbornstudio.cloudflareaccess.com'), null);
  assert.equal(ekipAlaniniNormallestir('https://ozbornstudio.cloudflareaccess.com/yanlis'), null);
});
