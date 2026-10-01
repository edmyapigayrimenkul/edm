#!/usr/bin/env node
import { pathToFileURL } from 'node:url';

/** Sabit alıcı ve depo: CI girdileriyle başka kişilere bildirim gönderilemez. */
export async function yedekHatasiniBildir(degiskenler = process.env, getir = fetch) {
  const token = degiskenler.CLOUDFLARE_BILDIRIM_API_TOKEN;
  const hesap = degiskenler.CLOUDFLARE_ACCOUNT_ID;
  const calisma = degiskenler.GITHUB_RUN_ID;
  if (!token || !/^[a-f0-9]{32}$/i.test(hesap ?? '') || !/^\d+$/.test(calisma ?? '') ||
      degiskenler.GITHUB_REPOSITORY !== 'edmyapigayrimenkul/edm') throw new Error('Yedek bildirimi kimliği veya depo eşleşmesi eksik.');
  const test = degiskenler.YEDEK_BILDIRIM_TESTI === '1';
  const alici = 'ozdogandogukan@gmail.com';
  const cevap = await getir(`https://api.cloudflare.com/client/v4/accounts/${hesap}/email/sending/send`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      from: 'bildirim@edmyapigayrimenkul.com', to: alici,
      subject: `${test ? '[TEST] ' : ''}EDM — yedekleme kontrolü başarısız`,
      text: `${test ? 'Bu, otomatik hata bildirimini doğrulamak için yapılan kontrollü testtir.\n\n' : ''}Yedekleme veya yedek güncellik kontrolü tamamlanamadı. Canlı veriler değiştirilmedi. Son başarılı yedeği ve aşağıdaki iş akışını kontrol edin:\nhttps://github.com/edmyapigayrimenkul/edm/actions/runs/${calisma}\n\nSQL, müşteri bilgileri ve erişim anahtarları bu mesaja eklenmez.`,
    }),
  });
  const govde = await cevap.json().catch(() => ({}));
  const sonuc = govde.result;
  if (!cevap.ok || govde.success !== true || sonuc?.permanent_bounces?.includes(alici) ||
      (!sonuc?.delivered?.includes(alici) && !sonuc?.queued?.includes(alici))) {
    // Sunucunun serbest metnini günlükte göstermeden bilinen kurulum hatasını ayır.
    const nedenler = new Map([
      [10101, 'Bildirim anahtarı geçersiz.'],
      [10102, 'Bildirim anahtarının Email Sending izni eksik.'],
      [10103, 'Bildirim anahtarı türü bu uç için uygun değil.'],
      [10105, 'Hesabın Email Sending erişimi etkin değil.'],
      [10203, 'Hesap veya alan adı için Email Sending kapalı.'],
    ]);
    const kod = (Array.isArray(govde.errors) ? govde.errors : [])
      .find((hata) => nedenler.has(hata?.code))?.code;
    const ayrinti = kod ? ` Kod ${kod}: ${nedenler.get(kod)}` : '';
    throw new Error(`Yedek hata bildirimi kabul edilmedi (HTTP ${cevap.status}).${ayrinti}`);
  }
  return sonuc.delivered?.includes(alici) ? 'teslim-edildi' : 'kuyrukta';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(`✓ Doğukan yedek bildirimi: ${await yedekHatasiniBildir()}`); }
  catch (hata) { console.error(hata.message); process.exitCode = 1; }
}
