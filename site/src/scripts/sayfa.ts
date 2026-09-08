/**
 * Görünüm geçişlerinde betikleri ayakta tutan küçük yardımcı.
 *
 * Astro'nun ClientRouter'ı gezinirken sayfayı yeniden yüklemiyor, gövdeyi
 * değiştiriyor. Modül betikleri bir kez çalışıp bittiği için bu değişimden
 * sonra kurulumların kendiliğinden tekrarlanması gerekiyor.
 *
 * İki durumu birden karşılıyor:
 *  - Betik ilk açılışta yüklendiyse `astro:page-load` zaten gelecek.
 *  - Betik ilk kez bir geçiş sırasında yüklendiyse o olay çoktan geçmiş
 *    olabilir; bu yüzden bir de doğrudan çağırıyoruz.
 *
 * Bunun bedeli kurulumun bazen iki kez çağrılması. Kurulum işlerinin
 * tekrara dayanıklı olması şart — her biri kendi öğesini yeniden buluyor
 * ve eski dinleyicilerini bırakıyor.
 */
export function herSayfada(kur: () => void): void {
  kur();
  document.addEventListener('astro:page-load', kur);
}
