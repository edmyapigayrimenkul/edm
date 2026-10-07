export interface AccessClaimleri {
  aud?: string | string[];
  exp?: number;
  iss?: string;
  email?: string;
  sub?: string;
}

export interface AccessYapilandirmasi {
  ekipAlanAdi: string | null;
  audience: string | null;
}

/** Ekip alanı hem tam URL hem de yalnız alan adı verilse tek biçimde kullanılır. */
export function ekipAlaniniNormallestir(ham: string | null): string | null {
  const deger = ham?.trim();
  if (!deger) return null;

  try {
    const adres = new URL(deger.includes('://') ? deger : `https://${deger}`);
    if (
      adres.protocol !== 'https:' ||
      adres.username ||
      adres.password ||
      adres.port ||
      (adres.pathname !== '/' && adres.pathname !== '') ||
      adres.search ||
      adres.hash
    ) {
      return null;
    }
    return adres.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function accessVerenAdresi(ekipAlanAdi: string | null): string | null {
  const alan = ekipAlaniniNormallestir(ekipAlanAdi);
  return alan ? `https://${alan}` : null;
}

/** İmza kontrolünden önce değişmez Access uygulaması claimlerini doğrular. */
export function accessClaimleriGecerli(
  claimler: AccessClaimleri,
  yapilandirma: AccessYapilandirmasi,
  simdiSaniye = Math.floor(Date.now() / 1000)
): boolean {
  const beklenenVeren = accessVerenAdresi(yapilandirma.ekipAlanAdi);
  const beklenenKitle = yapilandirma.audience?.trim();

  // Eksik güvenlik yapılandırması doğrulamayı gevşetmemeli; panel kapalı kalır.
  if (!beklenenVeren || !beklenenKitle) return false;
  if (typeof claimler.exp !== 'number' || !Number.isFinite(claimler.exp) || claimler.exp <= simdiSaniye) {
    return false;
  }
  if (claimler.iss !== beklenenVeren) return false;

  const gelenKitleler = Array.isArray(claimler.aud) ? claimler.aud : [claimler.aud];
  return gelenKitleler.includes(beklenenKitle);
}
