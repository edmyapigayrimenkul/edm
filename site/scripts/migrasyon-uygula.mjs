#!/usr/bin/env node
/** Uygulanmamış numaralı D1 migration'larını Wrangler'ın kayıt sistemiyle çalıştırır. */
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ortam } from './lib/cf.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv[2]) {
  throw new Error('Dosya adı verme. Bu komut tüm bekleyen geçişleri sırayla uygular: npm run db:migrate');
}

const { token, hesap } = ortam();
await new Promise((coz, red) => {
  const surec = spawn(
    'npx',
    ['wrangler', 'd1', 'migrations', 'apply', 'edm-talepler', '--remote'],
    {
      cwd: KOK,
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: '1',
        CLOUDFLARE_API_TOKEN: token,
        CLOUDFLARE_ACCOUNT_ID: hesap,
      },
    }
  );
  surec.on('close', (kod) =>
    kod === 0 ? coz() : red(new Error(`D1 migration ${kod} koduyla çıktı.`))
  );
});
