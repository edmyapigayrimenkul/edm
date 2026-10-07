/** Üretimde çalışan D1 şema taban çizgisi. İleri geçişler bu sürümden sonra numaralanır. */
export const gerekliD1Migrasyonu = '0010-talep-takip.sql';

export function d1SurumHatasi(surum: string): string {
  return `D1 şema sürümü eksik: ${surum}. Önce npm run db:migrate, ardından dağıtım çalıştırılmalı.`;
}
