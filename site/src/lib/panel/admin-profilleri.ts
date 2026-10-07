import type { PanelRolu } from './roller';

export interface AdminProfili {
  ad: string;
  rol: PanelRolu;
}

const ADMIN_PROFILLERI: Record<string, AdminProfili> = {
  'edmyapigayrimenkul@gmail.com': { ad: 'Metin Özdoğan', rol: 'admin' },
  'ozdogandogukan@gmail.com': { ad: 'Doğukan Özdoğan', rol: 'ana-admin' },
};

export function adminProfiliniBul(eposta: string): AdminProfili | null {
  return ADMIN_PROFILLERI[eposta.trim().toLowerCase()] ?? null;
}

