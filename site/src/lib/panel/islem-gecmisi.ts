import { adminProfiliniBul } from './admin-profilleri.ts';

export const ISLEM_GECMISI_SEMA = `
CREATE TABLE IF NOT EXISTS panel_islem_gecmisi (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  zaman        TEXT NOT NULL,
  eposta       TEXT NOT NULL,
  ad           TEXT NOT NULL DEFAULT '',
  rol          TEXT NOT NULL,
  eylem        TEXT NOT NULL,
  varlik_turu  TEXT NOT NULL,
  varlik_id    TEXT NOT NULL DEFAULT '',
  ozet         TEXT NOT NULL DEFAULT '',
  onceki       TEXT,
  sonraki      TEXT
);
CREATE INDEX IF NOT EXISTS panel_islem_zaman ON panel_islem_gecmisi (zaman DESC);
CREATE INDEX IF NOT EXISTS panel_islem_varlik ON panel_islem_gecmisi (varlik_turu, varlik_id, zaman DESC);
`;

export interface IslemKaydiGirdisi {
  eylem: string;
  varlikTuru: string;
  varlikId?: string;
  ozet: string;
  onceki?: unknown;
  sonraki?: unknown;
}

export interface PanelKimligi {
  eposta: string;
}

const metniSinirla = (deger: string, sinir: number) => deger.trim().slice(0, sinir);

/** Geçmişte yalnızca iş için gerekli, boyutu sınırlı alanlar saklanır. */
export function guvenliKayitJsonu(deger: unknown): string | null {
  if (deger === undefined || deger === null) return null;
  try {
    return JSON.stringify(deger).slice(0, 8000);
  } catch {
    return JSON.stringify({ hata: 'Değişiklik ayrıntısı kaydedilemedi.' });
  }
}

export function islemKaydiKomutu(
  vt: D1Database,
  kimlik: PanelKimligi,
  kayit: IslemKaydiGirdisi,
  yalnizDegisiklikVarsa = false
): D1PreparedStatement {
  const eposta = kimlik.eposta.trim().toLowerCase();
  const profil = adminProfiliniBul(eposta);
  return vt
    .prepare(
      `INSERT INTO panel_islem_gecmisi
       (zaman, eposta, ad, rol, eylem, varlik_turu, varlik_id, ozet, onceki, sonraki)
       ${yalnizDegisiklikVarsa ? 'SELECT ?,?,?,?,?,?,?,?,?,? WHERE changes() = 1' : 'VALUES (?,?,?,?,?,?,?,?,?,?)'}`
    )
    .bind(
      new Date().toISOString(),
      metniSinirla(eposta, 200),
      metniSinirla(profil?.ad ?? eposta, 160),
      profil?.rol ?? 'bilinmiyor',
      metniSinirla(kayit.eylem, 80),
      metniSinirla(kayit.varlikTuru, 80),
      metniSinirla(kayit.varlikId ?? '', 240),
      metniSinirla(kayit.ozet, 500),
      guvenliKayitJsonu(kayit.onceki),
      guvenliKayitJsonu(kayit.sonraki)
    );
}

export async function islemKaydet(
  vt: D1Database,
  kimlik: PanelKimligi,
  kayit: IslemKaydiGirdisi
): Promise<void> {
  await islemKaydiKomutu(vt, kimlik, kayit).run();
}
