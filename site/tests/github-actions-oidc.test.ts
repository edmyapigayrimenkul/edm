import assert from 'node:assert/strict';
import test from 'node:test';

import {
  githubActionsClaimleriGecerli,
  githubActionsOidcDogrula,
  POSTEDM_OIDC_HEDEF_KITLE,
  type GithubActionsClaimleri,
} from '../src/lib/github-actions-oidc.ts';

const simdi = 1_800_000_000;
const gecerliClaimler = (): GithubActionsClaimleri => ({
  iss: 'https://token.actions.githubusercontent.com',
  aud: POSTEDM_OIDC_HEDEF_KITLE,
  iat: simdi - 30,
  nbf: simdi - 30,
  exp: simdi + 270,
  repository: 'edmyapigayrimenkul/postedm',
  repository_id: '1361125362',
  repository_owner_id: '326407964',
  repository_visibility: 'private',
  ref: 'refs/heads/main',
  workflow_ref: 'edmyapigayrimenkul/postedm/.github/workflows/site-kuyrugu.yml@refs/heads/main',
  event_name: 'repository_dispatch',
  runner_environment: 'github-hosted',
});

test('yalnızca doğru depo, ana dal, iş akışı ve hedef kitle claimleri kabul edilir', () => {
  assert.equal(githubActionsClaimleriGecerli(gecerliClaimler(), simdi), true);
  assert.equal(githubActionsClaimleriGecerli({
    ...gecerliClaimler(),
    workflow_ref: 'edmyapigayrimenkul/postedm/.github/workflows/yayinla.yml@refs/heads/main',
    event_name: 'workflow_dispatch',
  }, simdi), true);
  for (const degisiklik of [
    { repository_id: '1' },
    { repository_owner_id: '1' },
    { aud: 'yanlis-hedef' },
    { ref: 'refs/heads/ozellik' },
    { workflow_ref: 'edmyapigayrimenkul/postedm/.github/workflows/testler.yml@refs/heads/main' },
    { event_name: 'pull_request' },
    { runner_environment: 'self-hosted' },
    { exp: simdi - 31 },
  ]) {
    assert.equal(githubActionsClaimleriGecerli({ ...gecerliClaimler(), ...degisiklik }, simdi), false);
  }
});

test('RS256 imzası doğrulanır ve değiştirilen jeton reddedilir', async () => {
  const anahtarCifti = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  );
  const acikAnahtar = await crypto.subtle.exportKey('jwk', anahtarCifti.publicKey) as JsonWebKey & { kid?: string };
  acikAnahtar.kid = 'test-kid';
  const kodla = (deger: unknown) => Buffer.from(JSON.stringify(deger)).toString('base64url');
  const baslik = kodla({ alg: 'RS256', typ: 'JWT', kid: 'test-kid' });
  const claimler = kodla({ ...gecerliClaimler(), iat: Math.floor(Date.now() / 1000) - 30, nbf: Math.floor(Date.now() / 1000) - 30, exp: Math.floor(Date.now() / 1000) + 270 });
  const imzalanan = `${baslik}.${claimler}`;
  const imza = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', anahtarCifti.privateKey, new TextEncoder().encode(imzalanan));
  const imzaMetni = Buffer.from(imza).toString('base64url');
  const jeton = `${imzalanan}.${imzaMetni}`;
  // Son Base64URL karakterindeki bazı değişiklikler dolgu bitlerinde kalıp aynı
  // baytlara çözülebilir; ilk karakteri değiştirmek imzayı kesin olarak bozar.
  const bozukImza = `${imzaMetni[0] === 'a' ? 'b' : 'a'}${imzaMetni.slice(1)}`;
  const asilFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ keys: [acikAnahtar] }), { status: 200 });
  try {
    assert.equal(await githubActionsOidcDogrula(`Bearer ${jeton}`), true);
    assert.equal(await githubActionsOidcDogrula(`Bearer ${imzalanan}.${bozukImza}`), false);
  } finally {
    globalThis.fetch = asilFetch;
  }
});
