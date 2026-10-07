/**
 * Senkron anahtarı yalnızca istek başlığından okunur. URL desteği anahtarı
 * tarayıcı geçmişi, sunucu günlükleri ve yönlendiren adreslere sızdırırdı.
 */
export function senkronIstegiYetkili(request: Request, beklenen: string | null): boolean {
  const temizBeklenen = beklenen?.trim();
  if (!temizBeklenen) return false;
  return request.headers.get('X-Senkron-Anahtari') === temizBeklenen;
}
