import { AsyncLocalStorage } from 'node:async_hooks';

const istekDeposu = new AsyncLocalStorage<Map<string, Promise<unknown>>>();

/** Aynı sayfadaki ortak okumalar birleşir; veri başka ziyaretçiye taşınmaz. */
export function istekKapsaminda<T>(islem: () => T): T {
  return istekDeposu.run(new Map(), islem);
}

export function istekVerisi<T>(anahtar: string, oku: () => Promise<T>): Promise<T> {
  const depo = istekDeposu.getStore();
  if (!depo) return oku();
  const mevcut = depo.get(anahtar);
  if (mevcut) return mevcut as Promise<T>;
  const okuma = Promise.resolve().then(oku);
  depo.set(anahtar, okuma);
  // Geçici D1 hatası aynı istekte yeniden okumayı engellemesin. Eski okuma,
  // bir panel yazmasından sonra başlamış yeni okumayı da silemez.
  void okuma.catch(() => {
    if (depo.get(anahtar) === okuma) depo.delete(anahtar);
  });
  return okuma;
}

export function istekVerisiniTemizle(anahtar: string): void {
  istekDeposu.getStore()?.delete(anahtar);
}
