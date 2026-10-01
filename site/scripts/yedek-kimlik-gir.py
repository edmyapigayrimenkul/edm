#!/usr/bin/env python3
"""Yedek anahtarını kabuk geçmişine veya ekrana düşürmeden yerelde saklar."""
import argparse
import getpass
import os
from pathlib import Path
import re
import stat
import sys
import tempfile
import warnings


ALANLAR = {
    "okuma": [("CLOUDFLARE_API_TOKEN", "EDM yedek okuma tokenı")],
    "r2": [("R2_YEDEK_ERISIM_KIMLIGI", "R2 Access Key ID"),
           ("R2_YEDEK_GIZLI_ANAHTARI", "R2 Secret Access Key")],
    "bildirim": [("CLOUDFLARE_BILDIRIM_API_TOKEN", "EDM yedek bildirimi tokenı")],
}


def kimlikleri_kaydet(dosya, degerler):
    if not degerler or any(ad not in {a for grup in ALANLAR.values() for a, _ in grup}
                          or not re.fullmatch(r"[A-Za-z0-9._~+=/-]{16,2048}", deger)
                          for ad, deger in degerler.items()):
        raise ValueError("Anahtar boş veya biçimi geçersiz; dosya değiştirilmedi.")
    # Sembolik bağlantı üzerinden başka bir dosyanın üzerine yazılmaz.
    kip = dosya.lstat().st_mode
    if not stat.S_ISREG(kip):
        raise ValueError("Kimlik dosyası normal bir dosya olmalı.")
    tanim = os.open(dosya, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(tanim, encoding="utf-8") as kaynak:
        satirlar = kaynak.read().splitlines()
    kalan = dict(degerler)
    yeni = []
    for satir in satirlar:
        eslesme = re.match(r"^\s*([A-Z][A-Z0-9_]*)\s*=", satir)
        ad = eslesme.group(1) if eslesme else None
        if ad in degerler:
            # Yinelenmiş eski değer de bırakılmaz; dotenv tek değer görür.
            if ad in kalan:
                yeni.append(f"{ad}={kalan.pop(ad)}")
        else:
            yeni.append(satir)
    yeni.extend(f"{ad}={deger}" for ad, deger in kalan.items())
    gecici = None
    try:
        tanim, gecici = tempfile.mkstemp(prefix=".env.yedek.", dir=dosya.parent)
        with os.fdopen(tanim, "w", encoding="utf-8") as hedef:
            os.fchmod(hedef.fileno(), 0o600)
            hedef.write("\n".join(yeni) + "\n")
            hedef.flush()
            os.fsync(hedef.fileno())
        os.replace(gecici, dosya)
    finally:
        if gecici and os.path.exists(gecici):
            os.unlink(gecici)


def calistir():
    secim = argparse.ArgumentParser(description="Yedek anahtarını gizli terminal girişiyle kaydet.")
    secim.add_argument("tur", choices=ALANLAR, nargs="?", default="okuma")
    arguman = secim.parse_args()
    if not sys.stdin.isatty():
        raise ValueError("Gizli giriş için kendi terminalinde çalıştır; pipe kullanma.")
    dosya = Path(__file__).resolve().parents[1] / ".env.yedek"
    print("Anahtar girerken karakter veya yıldız görünmez. Yapıştırıp Enter'a bas.")
    degerler = {}
    # getpass gizli girişi sağlayamazsa açık girişe geri dönmesine izin verilmez.
    with warnings.catch_warnings():
        warnings.simplefilter("error", getpass.GetPassWarning)
        for ad, baslik in ALANLAR[arguman.tur]:
            deger = getpass.getpass(f"{baslik}: ")
            tekrar = getpass.getpass("Doğrulamak için tekrar yapıştır: ")
            if deger != tekrar:
                raise ValueError("İki giriş eşleşmedi; dosya değiştirilmedi.")
            degerler[ad] = deger
    kimlikleri_kaydet(dosya, degerler)
    print("✓ Yerel .env.yedek dosyasına kaydedildi (0600). Henüz GitHub'a gönderilmedi.")


if __name__ == "__main__":
    try:
        calistir()
    except (KeyboardInterrupt, EOFError):
        print("\nGiriş iptal edildi; dosya değiştirilmedi.", file=sys.stderr)
        sys.exit(1)
    except (OSError, ValueError, getpass.GetPassWarning):
        print("Giriş veya kayıt tamamlanamadı; dosya değiştirilmedi. Terminalde iki kez aynı geçerli anahtarı gir.", file=sys.stderr)
        sys.exit(1)
