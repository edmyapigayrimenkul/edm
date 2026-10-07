/** Yönetim panelindeki roller ve eylem izinleri. */

export type PanelRolu = 'ana-admin' | 'admin';

export type PanelYetkisi =
  | 'ilan-yonet'
  | 'icerik-yonet'
  | 'islem-gecmisi-gor'
  | 'kalici-sil'
  | 'ekip-yonet'
  | 'ayar-yonet';

const ADMIN_YETKILERI = new Set<PanelYetkisi>([
  'ilan-yonet',
  'icerik-yonet',
  'islem-gecmisi-gor',
]);

/** Ana admin bütün panel yetkilerine sahiptir; admin günlük işleri yürütür. */
export function rolYetkisiVar(rol: PanelRolu | null, yetki: PanelYetkisi): boolean {
  if (rol === 'ana-admin') return true;
  return rol === 'admin' && ADMIN_YETKILERI.has(yetki);
}

export function rolYetkisiGerekli(rol: PanelRolu | null, yetki: PanelYetkisi): void {
  if (!rolYetkisiVar(rol, yetki)) {
    throw new Error('Bu işlem yalnızca ana admin tarafından yapılabilir.');
  }
}
