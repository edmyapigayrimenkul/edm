import importlib.util
from pathlib import Path
import tempfile
import unittest


spec = importlib.util.spec_from_file_location(
    "kimlik_gir", Path(__file__).resolve().parents[1] / "scripts/yedek-kimlik-gir.py")
betik = importlib.util.module_from_spec(spec)
spec.loader.exec_module(betik)


class KimlikGirisTesti(unittest.TestCase):
    def test_rakamli_r2_alanlari_yinelenmez_ve_diger_alanlar_korunur(self):
        with tempfile.TemporaryDirectory() as dizin:
            dosya = Path(dizin) / ".env.yedek"
            dosya.write_text(
                "# korunan açıklama\nCLOUDFLARE_ACCOUNT_ID=hesap-korundu\n"
                "R2_YEDEK_ERISIM_KIMLIGI=buraya_access_key_id\n"
                "R2_YEDEK_GIZLI_ANAHTARI=buraya_secret_access_key\n"
                "R2_YEDEK_ERISIM_KIMLIGI=eski-test-kimligi\n"
                "CLOUDFLARE_BILDIRIM_API_TOKEN=buraya_bildirim\n")
            degerler = {"R2_YEDEK_ERISIM_KIMLIGI": "a" * 32,
                        "R2_YEDEK_GIZLI_ANAHTARI": "b" * 64}
            betik.kimlikleri_kaydet(dosya, degerler)
            betik.kimlikleri_kaydet(dosya, degerler)
            sonuc = dosya.read_text()
            for ad, deger in degerler.items():
                self.assertEqual(sonuc.count(ad + "="), 1)
                self.assertIn(f"{ad}={deger}\n", sonuc)
            self.assertNotIn("buraya_access_key_id", sonuc)
            self.assertIn("# korunan açıklama\n", sonuc)
            self.assertIn("CLOUDFLARE_ACCOUNT_ID=hesap-korundu\n", sonuc)
            self.assertIn("CLOUDFLARE_BILDIRIM_API_TOKEN=buraya_bildirim\n", sonuc)
            self.assertEqual(dosya.stat().st_mode & 0o777, 0o600)

    def test_gecersiz_giris_dosyayi_degistirmez(self):
        with tempfile.TemporaryDirectory() as dizin:
            dosya = Path(dizin) / ".env.yedek"
            dosya.write_text("korundu\n")
            with self.assertRaises(ValueError):
                betik.kimlikleri_kaydet(dosya, {"CLOUDFLARE_API_TOKEN": "gizli\nsatir"})
            self.assertEqual(dosya.read_text(), "korundu\n")


if __name__ == "__main__":
    unittest.main()
