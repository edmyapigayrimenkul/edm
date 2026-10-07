/** Yönetim ilan formunun kategori, doğrulama ve yerel taslak davranışı. */

import { fotograflariYukle } from './fotograf-yukleme';
import {
  EN_COK_ILAN_FOTOGRAFI,
  fotografKaliteUyarilari,
  fotografSiniriMesaji,
  fotografYuklemePlani,
} from '../lib/fotograf-kurallari';
import { videoBilgisiniOku, videoYukle } from './video-yukleme';
import { VIDEO_EN_BUYUK_BOYUT, VIDEO_KABUL_TURLERI, videoBoyutMetni } from '../lib/video-kurallari';
import { kimdenAlaniniSec } from '../lib/ilan-bilgileri';
import { sahibindenAlanKaynaktaZorunlu } from '../lib/sahibinden-zorunlu-alanlar.generated';
import { sahibindenDetayEslesmeDurumu, sahibindenDetayGruplari } from '../lib/sahibinden-detay';

interface SemaOzeti {
  kimlik: string;
  etiket: string;
  aciklama: string;
  islemler: string[];
  altTipler: Array<{ deger: string; etiket: string; islemler?: string[] }>;
  donanimGruplari: Array<{ kimlik: string; baslik: string; aciklama: string; ogeListesi: string[]; gerekli?: boolean }>;
}

interface Taslak {
  zaman: number;
  veriler: Record<string, string | string[]>;
}

const BIRLER = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const ONLAR = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
const BASAMAKLAR = ['', 'bin', 'milyon', 'milyar', 'trilyon', 'katrilyon'];
const PARA_OKUNUSU: Record<string, string> = {
  TRY: 'Türk lirası', USD: 'Amerikan doları', EUR: 'euro', GBP: 'İngiliz sterlini',
};

function ucBasamakOku(sayi: number): string {
  const yuz = Math.floor(sayi / 100);
  const on = Math.floor((sayi % 100) / 10);
  const bir = sayi % 10;
  return [yuz ? `${yuz === 1 ? '' : BIRLER[yuz] + ' '}yüz` : '', ONLAR[on], BIRLER[bir]].filter(Boolean).join(' ');
}

function sayiyiTurkceOku(sayi: number): string {
  if (!sayi) return 'sıfır';
  const parcalar: string[] = [];
  let kalan = Math.floor(sayi);
  let basamak = 0;
  while (kalan > 0 && basamak < BASAMAKLAR.length) {
    const grup = kalan % 1000;
    if (grup) {
      const grupMetni = basamak === 1 && grup === 1 ? '' : ucBasamakOku(grup);
      parcalar.unshift([grupMetni, BASAMAKLAR[basamak]].filter(Boolean).join(' '));
    }
    kalan = Math.floor(kalan / 1000);
    basamak++;
  }
  return parcalar.join(' ');
}

function fiyatSayisi(ham: string): number {
  const rakamlar = ham.replace(/\D/g, '').slice(0, 15);
  const sayi = Number(rakamlar);
  return Number.isSafeInteger(sayi) ? sayi : 0;
}

let leafletYukleme: Promise<any> | null = null;
function leafletiYukle(): Promise<any> {
  const mevcut = (window as unknown as { L?: any }).L;
  if (mevcut) return Promise.resolve(mevcut);
  if (leafletYukleme) return leafletYukleme;
  leafletYukleme = new Promise((coz, red) => {
    if (!document.querySelector('link[data-panel-leaflet]')) {
      const stil = document.createElement('link');
      stil.rel = 'stylesheet';
      stil.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      stil.dataset.panelLeaflet = 'evet';
      document.head.append(stil);
    }
    const onceki = document.querySelector<HTMLScriptElement>('script[data-panel-leaflet]');
    const hazir = () => {
      const L = (window as unknown as { L?: any }).L;
      if (L) coz(L); else red(new Error('Harita kütüphanesi yüklenemedi.'));
    };
    if (onceki) {
      onceki.addEventListener('load', hazir, { once: true });
      onceki.addEventListener('error', () => red(new Error('Harita kütüphanesi yüklenemedi.')), { once: true });
      return;
    }
    const betik = document.createElement('script');
    betik.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    betik.dataset.panelLeaflet = 'evet';
    betik.addEventListener('load', hazir, { once: true });
    betik.addEventListener('error', () => red(new Error('Harita kütüphanesi yüklenemedi.')), { once: true });
    document.head.append(betik);
  });
  return leafletYukleme;
}

function konumPininiKur(form: HTMLFormElement): void {
  const enlem = form.elements.namedItem('kesin_enlem') as HTMLInputElement | null;
  const boylam = form.elements.namedItem('kesin_boylam') as HTMLInputElement | null;
  const dogruluk = form.elements.namedItem('konum_dogruluk') as HTMLSelectElement | null;
  const kamuDuzeyi = form.elements.namedItem('kamu_konum_duzeyi') as HTMLSelectElement | null;
  const kutu = form.querySelector<HTMLElement>('[data-konum-pini-harita]');
  const durum = form.querySelector<HTMLElement>('[data-konum-pini-durum]');
  const ac = form.querySelector<HTMLButtonElement>('[data-konum-harita-ac]');
  const gps = form.querySelector<HTMLButtonElement>('[data-konum-gps]');
  const temizle = form.querySelector<HTMLButtonElement>('[data-konum-temizle]');
  if (!enlem || !boylam || !kutu) return;

  let harita: any = null;
  let isaret: any = null;
  const koordinat = (): [number, number] | null => {
    const e = Number(enlem.value.replace(',', '.'));
    const b = Number(boylam.value.replace(',', '.'));
    return Number.isFinite(e) && Number.isFinite(b) && e >= 35.5 && e <= 42.5 && b >= 25.5 && b <= 45 ? [e, b] : null;
  };
  const durumYaz = () => {
    if (!durum) return;
    const pin = koordinat();
    durum.textContent = !pin
      ? 'Kesin pin yok; halka açık haritada mevcut mahalle merkezi gösterilir.'
      : kamuDuzeyi?.value === 'yaklasik'
        ? 'Kesin pin yalnızca panelde kalır; sitede 360–520 metre uzaklaştırılmış yaklaşık alan gösterilir.'
        : 'Kesin pin yalnızca panelde kalır; sitede mevcut mahalle merkezi gösterilir.';
  };
  const piniYaz = (e: number, b: number, kaynak: 'gps' | 'harita') => {
    enlem.value = e.toFixed(6);
    boylam.value = b.toFixed(6);
    if (dogruluk) dogruluk.value = kaynak;
    enlem.dispatchEvent(new Event('input', { bubbles: true }));
    boylam.dispatchEvent(new Event('input', { bubbles: true }));
    if (harita) {
      const L = (window as unknown as { L?: any }).L;
      if (!isaret) {
        isaret = L.marker([e, b], { draggable: true }).addTo(harita);
        isaret.on('dragend', () => { const p = isaret.getLatLng(); piniYaz(p.lat, p.lng, 'harita'); });
      } else isaret.setLatLng([e, b]);
      harita.setView([e, b], 17);
    }
    durumYaz();
  };
  const haritayiAc = async () => {
    kutu.hidden = false;
    if (harita) { setTimeout(() => harita.invalidateSize(), 0); return; }
    if (durum) durum.textContent = 'Harita yükleniyor…';
    try {
      const L = await leafletiYukle();
      const ilk = koordinat() ?? [41.0734, 28.2464];
      harita = L.map(kutu, { center: ilk, zoom: koordinat() ? 17 : 12, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap katkıcıları' }).addTo(harita);
      if (koordinat()) {
        isaret = L.marker(ilk, { draggable: true }).addTo(harita);
        isaret.on('dragend', () => { const p = isaret.getLatLng(); piniYaz(p.lat, p.lng, 'harita'); });
      }
      harita.on('click', (olay: { latlng: { lat: number; lng: number } }) => piniYaz(olay.latlng.lat, olay.latlng.lng, 'harita'));
      setTimeout(() => harita.invalidateSize(), 0);
      durumYaz();
    } catch (hata) {
      if (durum) durum.textContent = (hata as Error).message;
    }
  };

  ac?.addEventListener('click', haritayiAc);
  gps?.addEventListener('click', () => {
    if (!navigator.geolocation) { if (durum) durum.textContent = 'Bu tarayıcı konum erişimini desteklemiyor.'; return; }
    if (durum) durum.textContent = 'Cihaz konumu bekleniyor…';
    navigator.geolocation.getCurrentPosition(
      (sonuc) => piniYaz(sonuc.coords.latitude, sonuc.coords.longitude, 'gps'),
      () => { if (durum) durum.textContent = 'Konum izni verilmedi veya cihaz konumu alınamadı.'; },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 }
    );
  });
  temizle?.addEventListener('click', () => {
    enlem.value = '';
    boylam.value = '';
    if (dogruluk) dogruluk.value = '';
    if (kamuDuzeyi) kamuDuzeyi.value = 'mahalle';
    isaret?.remove();
    isaret = null;
    enlem.dispatchEvent(new Event('input', { bubbles: true }));
    durumYaz();
  });
  kamuDuzeyi?.addEventListener('change', durumYaz);
  durumYaz();
}

function formlariKur(): void {
  document.querySelectorAll<HTMLFormElement>('[data-ilan-formu]').forEach((form) => {
    if (form.dataset.kuruldu === 'evet') return;
    form.dataset.kuruldu = 'evet';

    const semaDugumu = form.querySelector<HTMLScriptElement>('[data-ilan-semalari]');
    const semalar = JSON.parse(semaDugumu?.textContent || '[]') as SemaOzeti[];
    const tipSecimi = form.elements.namedItem('tip') as HTMLSelectElement | null;
    const taslakAnahtari = form.dataset.taslakAnahtari || 'edm-ilan-formu:yeni';
    const taslakUyari = form.querySelector<HTMLElement>('[data-taslak-uyari]');
    const taslakDurumu = form.querySelector<HTMLElement>('[data-taslak-durumu]');
    const baslik = form.elements.namedItem('baslik') as HTMLInputElement | null;
    const aciklama = form.elements.namedItem('aciklama') as HTMLTextAreaElement | null;
    const fiyatGirdisi = form.querySelector<HTMLInputElement>('[data-fiyat-girdisi]');
    const paraBirimi = form.elements.namedItem('para_birimi') as HTMLSelectElement | null;
    const fiyatOkunus = form.querySelector<HTMLElement>('[data-fiyat-okunus]');
    const fotografSecici = form.querySelector<HTMLInputElement>('[data-form-gorsel-secici]');
    const fotografOnizleme = form.querySelector<HTMLElement>('[data-form-gorsel-onizleme]');
    const fotografDurumu = form.querySelector<HTMLElement>('[data-form-gorsel-durum]');
    const videoSecici = form.querySelector<HTMLInputElement>('[data-video-secici]');
    const videoDurumu = form.querySelector<HTMLElement>('[data-video-durum]');
    const sosyalAc = form.querySelector<HTMLInputElement>('[data-sosyal-ac]');
    const sosyalPlatformlar = form.querySelector<HTMLElement>('[data-sosyal-platformlar]');
    const donanimPaneli = form.querySelector<HTMLElement>('[data-donanim-panel]');
    const donanimSecimleri = new Map<string, { ogeler: Set<string>; atlananlar: Set<string> }>();
    let kirli = false;
    let taslakZamanlayici = 0;
    let fotografYuklendi = false;
    let videoYuklendi = false;
    let kayitBasladi = false;

    const seciliRadio = (ad: string): HTMLInputElement | null =>
      form.querySelector<HTMLInputElement>(`input[name="${ad}"]:checked`);
    const alan = (ad: string): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null =>
      form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${CSS.escape(ad)}"]:not(:disabled)`);
    const aktifSema = (): SemaOzeti =>
      semalar.find((s) => s.kimlik === seciliRadio('tip_grup')?.value) ?? semalar[0];

    function donanimiUyarla(): void {
      if (!donanimPaneli) return;
      const sema = aktifSema();
      const islem = seciliRadio('islem')?.value ?? '';
      const tip = tipSecimi?.value ?? '';
      const yeniAnahtar = `${sema.kimlik}|${islem}|${tip}`;
      const eskiAnahtar = donanimPaneli.dataset.donanimKey;
      if (eskiAnahtar === yeniAnahtar) return;
      if (eskiAnahtar) donanimSecimleri.set(eskiAnahtar, {
        ogeler: new Set([...donanimPaneli.querySelectorAll<HTMLInputElement>('input[name="donanim"]:checked')].map((x) => x.value)),
        atlananlar: new Set([...donanimPaneli.querySelectorAll<HTMLInputElement>('[data-donanim-atla]:checked')].map((x) => x.value)),
      });
      const kayit = donanimSecimleri.get(yeniAnahtar);
      const secilen = kayit?.ogeler ?? new Set<string>();
      const atlananlar = kayit?.atlananlar ?? new Set<string>();
      const tipEtiketi = sema.altTipler.find((x) => x.deger === tip)?.etiket ?? tip;
      const kaynakUyarisi = donanimPaneli.closest<HTMLElement>('#donanim')?.querySelector<HTMLElement>('[data-kaynak-profil-uyarisi]');
      const eslesmeDurumu = sahibindenDetayEslesmeDurumu(sema.kimlik, islem, tip, tipEtiketi);
      if (kaynakUyarisi) {
        kaynakUyarisi.hidden = eslesmeDurumu === 'dogrudan';
        kaynakUyarisi.dataset.kaynakDurumu = eslesmeDurumu;
        const baslik = kaynakUyarisi.querySelector<HTMLElement>('[data-kaynak-profil-baslik]');
        const aciklama = kaynakUyarisi.querySelector<HTMLElement>('[data-kaynak-profil-aciklama]');
        if (baslik) baslik.textContent = eslesmeDurumu === 'diger-islem-tek-profil'
          ? 'Sahibinden’de diğer işlemlerdeki tek profil kullanılıyor'
          : eslesmeDurumu === 'yakin-islem-profili'
            ? 'Sahibinden’deki en yakın işlem profili kullanılıyor'
            : eslesmeDurumu === 'yakin-alt-tur-profili'
              ? 'Sahibinden’deki en yakın kategori profili kullanılıyor'
            : 'EDM genel nitelik şablonu';
        if (aciklama) aciklama.textContent = eslesmeDurumu === 'diger-islem-tek-profil'
          ? 'Bu işlem için doğrudan kaynak profili yok. Alınan Sahibinden şablonlarında aynı alt türün seçenekleri diğer işlemlerde birebir aynı olduğundan bu tekil profil gösteriliyor.'
          : eslesmeDurumu === 'yakin-islem-profili'
            ? 'Aynı alt tür için Sahibinden’de bu işlem bulunmadı. Seçenekler en yakın mevcut satılık/kiralık kaynak formundan alındı; işlem birebir eşleşmesi değildir.'
            : eslesmeDurumu === 'yakin-alt-tur-profili'
              ? 'Bu alt tür Sahibinden kategori ağacında yok. Seçenekler yakın kategoriden alındı; bu nedenle kategori birebir eşleşmesi değildir.'
            : 'Bu işlem ve alt tür için eşdeğer Sahibinden profili yok. Gösterilen seçenekler EDM’nin genel listesidir; yalnızca taşınmaz için doğruladığınız özellikleri işaretleyin.';
      }
      const gruplar = sahibindenDetayGruplari(sema.kimlik, islem, tip, tipEtiketi) ?? sema.donanimGruplari;
      const kapsanan = new Set(gruplar.flatMap((grup) => grup.ogeListesi));
      const arama = form.querySelector<HTMLInputElement>('[data-donanim-ara]')?.value.toLocaleLowerCase('tr-TR').trim() ?? '';

      function grupCiz(grup: SemaOzeti['donanimGruplari'][number]): HTMLElement {
        const kutu = document.createElement('fieldset');
        kutu.className = 'donanim-grup';
        kutu.id = `donanim-${grup.kimlik}`;
        kutu.dataset.donanimGrup = grup.kimlik;
        kutu.dataset.gerekli = grup.gerekli ? 'evet' : 'hayir';
        const baslik = document.createElement('legend');
        const guclu = document.createElement('strong');
        guclu.textContent = grup.baslik;
        if (grup.gerekli) { const isaret = document.createElement('em'); isaret.textContent = ' *'; guclu.append(isaret); }
        const aciklama = document.createElement('small');
        aciklama.textContent = grup.aciklama;
        baslik.append(guclu, aciklama);
        const izgara = document.createElement('div');
        izgara.className = 'donanim-izgara';
        for (const oge of grup.ogeListesi) {
          const etiket = document.createElement('label');
          etiket.dataset.donanimOge = '';
          etiket.dataset.ara = oge.toLocaleLowerCase('tr-TR');
          etiket.hidden = Boolean(arama) && !etiket.dataset.ara.includes(arama);
          const girdi = document.createElement('input');
          girdi.type = 'checkbox'; girdi.name = 'donanim'; girdi.value = oge; girdi.checked = secilen.has(oge);
          const yazi = document.createElement('span'); yazi.textContent = oge;
          etiket.append(girdi, yazi);
          izgara.append(etiket);
        }
        kutu.append(baslik, izgara);
        if (grup.gerekli) {
          const atla = document.createElement('label');
          atla.className = 'donanim-atla';
          const girdi = document.createElement('input');
          girdi.type = 'checkbox'; girdi.name = 'donanim_secim_yok'; girdi.value = grup.kimlik;
          girdi.dataset.donanimAtla = '';
          girdi.checked = atlananlar.has(grup.kimlik);
          const yazi = document.createElement('span'); yazi.textContent = 'Bu grup için seçim yapmak istemiyorum';
          atla.append(girdi, yazi); kutu.append(atla);
        }
        return kutu;
      }
      const kutular = gruplar.map(grupCiz);
      const diger = [...secilen].filter((oge) => !kapsanan.has(oge));
      if (diger.length) kutular.push(grupCiz({ kimlik: 'eski', baslik: 'Önceden kayıtlı diğer nitelikler', aciklama: 'Bu ilan için daha önce seçilen bilgiler.', ogeListesi: diger }));
      donanimPaneli.replaceChildren(...kutular);
      donanimPaneli.dataset.donanimKey = yeniAnahtar;
    }

    function formuNesneyeCevir(): Record<string, string | string[]> {
      const sonuc: Record<string, string | string[]> = {};
      for (const [ad, deger] of new FormData(form).entries()) {
        if (deger instanceof File) continue;
        const v = String(deger);
        const onceki = sonuc[ad];
        if (onceki === undefined) sonuc[ad] = v;
        else sonuc[ad] = Array.isArray(onceki) ? [...onceki, v] : [onceki, v];
      }
      return sonuc;
    }

    function fiyatiGuncelle(): void {
      if (!fiyatGirdisi) return;
      const sayi = fiyatSayisi(fiyatGirdisi.value);
      fiyatGirdisi.value = sayi ? sayi.toLocaleString('tr-TR') : '';
      if (fiyatOkunus) fiyatOkunus.textContent = sayi
        ? `${sayiyiTurkceOku(sayi)} ${PARA_OKUNUSU[paraBirimi?.value || 'TRY'] || ''}`
        : '';
    }

    function sosyalAlaniGuncelle(): void {
      if (!sosyalPlatformlar) return;
      sosyalPlatformlar.hidden = !sosyalAc?.checked;
      sosyalPlatformlar.querySelectorAll<HTMLInputElement>('input').forEach((girdi) => {
        girdi.disabled = !sosyalAc?.checked;
      });
    }

    function fotografOnizle(): void {
      if (!fotografOnizleme) return;
      fotografOnizleme.replaceChildren();
      const dosyalar = [...(fotografSecici?.files ?? [])].filter((dosya) => dosya.type.startsWith('image/'));
      fotografOnizleme.hidden = dosyalar.length === 0;
      if (fotografDurumu) {
        const mevcut = Math.max(0, gorselSayisi() - dosyalar.length);
        const kalan = Math.max(0, EN_COK_ILAN_FOTOGRAFI - mevcut);
        fotografDurumu.hidden = dosyalar.length <= kalan;
        fotografDurumu.textContent = dosyalar.length > kalan
          ? `${fotografSiniriMesaji()} Bu ilanda ${mevcut} fotoğraf var; seçimin ilk ${kalan} karesi yüklenebilir.`
          : '';
      }
      for (const dosya of dosyalar) {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const yazi = document.createElement('figcaption');
        const adres = URL.createObjectURL(dosya);
        img.alt = '';
        yazi.textContent = dosya.name;
        img.onload = () => {
          const olculer = `${img.naturalWidth} × ${img.naturalHeight} px`;
          const uyarilar = fotografKaliteUyarilari(img.naturalWidth, img.naturalHeight);
          yazi.textContent = [dosya.name, olculer, ...uyarilar].join(' · ');
          URL.revokeObjectURL(adres);
        };
        img.onerror = () => {
          yazi.textContent = `${dosya.name} · önizleme açılamadı`;
          URL.revokeObjectURL(adres);
        };
        img.src = adres;
        figure.append(img, yazi);
        fotografOnizleme.append(figure);
      }
    }

    async function videoOnizle(): Promise<void> {
      const dosya = videoSecici?.files?.[0];
      if (!dosya || !videoDurumu) return;
      videoDurumu.textContent = `${dosya.name} denetleniyor…`;
      try {
        const bilgi = await videoBilgisiniOku(dosya);
        videoDurumu.textContent = `${dosya.name} · ${Math.round(bilgi.sure)} saniye · ${bilgi.genislik}×${bilgi.yukseklik} · ${(dosya.size / 1024 / 1024).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} MB`;
        videoSecici.removeAttribute('aria-invalid');
      } catch (hata) {
        videoDurumu.textContent = (hata as Error).message;
        videoSecici.setAttribute('aria-invalid', 'true');
      }
    }

    function islemiUyarla(): void {
      const sema = aktifSema();
      const islemDugmeleri = form.querySelectorAll<HTMLInputElement>('input[name="islem"]');
      let secili = seciliRadio('islem');
      islemDugmeleri.forEach((girdi) => {
        const izinli = sema.islemler.includes(girdi.value);
        girdi.disabled = !izinli;
        girdi.closest<HTMLElement>('label')?.toggleAttribute('data-kapali', !izinli);
      });
      if (!secili || secili.disabled) {
        const ilk = [...islemDugmeleri].find((girdi) => !girdi.disabled);
        if (ilk) ilk.checked = true;
        secili = ilk ?? null;
      }
      const islem = secili?.value ?? '';
      const fiyatEtiketleri: Record<string, string> = {
        satilik: 'Satış fiyatı', kiralik: 'Aylık kira', 'gunluk-kiralik': 'Gecelik fiyat',
        'sezonluk-kiralik': 'Sezon bedeli',
        'devren-satilik': 'Devir bedeli', 'devren-kiralik': 'Devir bedeli',
        'kat-karsiligi-satilik': 'Kat karşılığı',
      };
      const fiyatEtiketi = form.querySelector<HTMLElement>('[data-fiyat-etiketi]');
      if (fiyatEtiketi) fiyatEtiketi.textContent = fiyatEtiketleri[islem] ?? 'Fiyat';
      const oncekiTip = tipSecimi?.value ?? '';
      const izinliTipler = sema.altTipler.filter((secenek) => !secenek.islemler?.length || secenek.islemler.includes(islem));
      if (tipSecimi) {
        tipSecimi.replaceChildren(...izinliTipler.map((secenek) => {
          const option = document.createElement('option');
          option.value = secenek.deger;
          option.textContent = secenek.etiket;
          return option;
        }));
        if (izinliTipler.some((secenek) => secenek.deger === oncekiTip)) tipSecimi.value = oncekiTip;
      }
      const katKarsiligi = islem === 'kat-karsiligi-satilik';
      const fiyatAlani = form.querySelector<HTMLElement>('[data-fiyat-alani]');
      const katKarsiligiNotu = form.querySelector<HTMLElement>('[data-kat-karsiligi-notu]');
      if (fiyatAlani) fiyatAlani.hidden = katKarsiligi;
      if (katKarsiligiNotu) katKarsiligiNotu.hidden = !katKarsiligi;
      if (fiyatGirdisi) { fiyatGirdisi.disabled = katKarsiligi; fiyatGirdisi.required = !katKarsiligi; }
      if (paraBirimi) paraBirimi.disabled = katKarsiligi;
      const tip = tipSecimi?.value ?? '';
      const kimdenAlan = kimdenAlaniniSec(sema.kimlik, islem, tip);
      const kimdenGirdisi = form.querySelector<HTMLSelectElement>('[data-kimden-secimi]');
      const kimdenGizli = form.querySelector<HTMLInputElement>('[data-kimden-gizli]');
      const oncekiKimden = kimdenGirdisi?.value || kimdenGizli?.value || '';
      const kimdenSecenekleri = kimdenAlan.secenekler ?? [];
      if (kimdenGirdisi) {
        kimdenGirdisi.replaceChildren(...(kimdenSecenekleri.length > 1
          ? [new Option('Seçin', ''), ...kimdenSecenekleri.map((x) => new Option(x.etiket, x.deger))]
          : kimdenSecenekleri.map((x) => new Option(x.etiket, x.deger))));
        kimdenGirdisi.disabled = kimdenSecenekleri.length === 1;
        kimdenGirdisi.required = true;
        kimdenGirdisi.value = kimdenSecenekleri.some((x) => x.deger === oncekiKimden) ? oncekiKimden : kimdenSecenekleri[0]?.deger ?? '';
      }
      if (kimdenGizli) {
        kimdenGizli.value = kimdenSecenekleri[0]?.deger ?? '';
        kimdenGizli.disabled = kimdenSecenekleri.length > 1;
      }
      form.querySelectorAll<HTMLElement>('[data-islemler],[data-tipler],[data-zorunlu-kosullar]').forEach((kutu) => {
        const grupPaneli = kutu.closest<HTMLElement>('[data-grup-panel]');
        const islemler = (kutu.dataset.islemler || '').split(',').filter(Boolean);
        const tipler = (kutu.dataset.tipler || '').split(',').filter(Boolean);
        const izinli = !grupPaneli?.hidden
          && (!islemler.length || islemler.includes(islem))
          && (!tipler.length || tipler.includes(tip));
        kutu.hidden = !izinli;
        let kosullar: Array<{ gruplar?: string[]; islemler?: string[]; tipler?: string[] }> = [];
        try { kosullar = JSON.parse(kutu.dataset.zorunluKosullar || '[]'); } catch { kosullar = []; }
        const alanDegerleri = { devre_mulk_tesisi: (form.elements.namedItem('devre_mulk_tesisi') as HTMLSelectElement | null)?.value ?? '' };
        const alanAdi = kutu.dataset.alanAnahtari ?? '';
        const gerekli = kutu.dataset.gerekli === 'evet' || kosullar.some((kosul) =>
          (!kosul.gruplar?.length || kosul.gruplar.includes(grupPaneli?.dataset.grupPanel || ''))
          && (!kosul.islemler?.length || kosul.islemler.includes(islem))
          && (!kosul.tipler?.length || kosul.tipler.includes(tip))
        ) || sahibindenAlanKaynaktaZorunlu(alanAdi, grupPaneli?.dataset.grupPanel || '', islem, tip, alanDegerleri);
        const zorunluIsareti = kutu.querySelector<HTMLElement>('[data-gerekli-isareti]');
        const onerilenIsareti = kutu.querySelector<HTMLElement>('[data-onerilen-isareti]');
        if (zorunluIsareti) zorunluIsareti.hidden = !gerekli;
        if (onerilenIsareti) onerilenIsareti.hidden = gerekli;
        kutu.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input,select,textarea')
          .forEach((girdi) => {
            girdi.disabled = !izinli;
            if (girdi instanceof HTMLInputElement && girdi.type === 'checkbox') return;
            girdi.required = izinli && gerekli;
          });
      });
      donanimiUyarla();
    }

    function kategoriyiUyarla(tipiKoru = true): void {
      const sema = aktifSema();
      const oncekiTip = tipiKoru ? tipSecimi?.value : '';
      if (tipSecimi) {
        tipSecimi.replaceChildren(...sema.altTipler.map((secenek) => {
          const option = document.createElement('option');
          option.value = secenek.deger;
          option.textContent = secenek.etiket;
          return option;
        }));
        if (oncekiTip && sema.altTipler.some((s) => s.deger === oncekiTip)) tipSecimi.value = oncekiTip;
      }
      form.querySelectorAll<HTMLElement>('[data-grup-panel]').forEach((panel) => {
        const acik = panel.dataset.grupPanel === sema.kimlik;
        panel.hidden = !acik;
        panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input,select,textarea')
          .forEach((girdi) => { girdi.disabled = !acik; });
      });
      const sonuc = form.querySelector<HTMLElement>('[data-kategori-sonuc]');
      const aciklamaDugumu = form.querySelector<HTMLElement>('[data-kategori-aciklama]');
      if (sonuc) sonuc.textContent = sema.etiket;
      if (aciklamaDugumu) aciklamaDugumu.textContent = sema.aciklama;
      islemiUyarla();
      durumuGuncelle();
    }

    function taslagiKaydet(): void {
      try {
        localStorage.setItem(taslakAnahtari, JSON.stringify({ zaman: Date.now(), veriler: formuNesneyeCevir() } satisfies Taslak));
        if (taslakDurumu) taslakDurumu.textContent = `Taslak ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} itibarıyla korundu`;
      } catch {
        if (taslakDurumu) taslakDurumu.textContent = 'Taslak bu tarayıcıda kaydedilemedi';
      }
    }

    function taslakPlanla(): void {
      window.clearTimeout(taslakZamanlayici);
      taslakZamanlayici = window.setTimeout(taslagiKaydet, 500);
    }

    function degerleriUygula(veriler: Record<string, string | string[]>): void {
      const grup = String(veriler.tip_grup || 'konut');
      const grupRadio = form.querySelector<HTMLInputElement>(`input[name="tip_grup"][value="${CSS.escape(grup)}"]`);
      if (grupRadio) grupRadio.checked = true;
      kategoriyiUyarla(false);
      const islemRadio = form.querySelector<HTMLInputElement>(`input[name="islem"][value="${CSS.escape(String(veriler.islem || ''))}"]`);
      if (islemRadio && !islemRadio.disabled) islemRadio.checked = true;
      islemiUyarla();
      if (tipSecimi && [...tipSecimi.options].some((secenek) => secenek.value === veriler.tip)) tipSecimi.value = String(veriler.tip);
      const hedefAnahtar = `${aktifSema().kimlik}|${seciliRadio('islem')?.value ?? ''}|${tipSecimi?.value ?? ''}`;
      const liste = (deger: string | string[] | undefined): string[] => deger == null ? [] : Array.isArray(deger) ? deger : [deger];
      donanimSecimleri.set(hedefAnahtar, {
        ogeler: new Set(liste(veriler.donanim)),
        atlananlar: new Set(liste(veriler.donanim_secim_yok)),
      });
      if (donanimPaneli) donanimPaneli.dataset.donanimKey = '';
      islemiUyarla();
      for (const [ad, ham] of Object.entries(veriler)) {
        const degerler = Array.isArray(ham) ? ham : [ham];
        const dugumler = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${CSS.escape(ad)}"]`);
        dugumler.forEach((dugum) => {
          if (dugum instanceof HTMLInputElement && (dugum.type === 'radio' || dugum.type === 'checkbox')) dugum.checked = degerler.includes(dugum.value);
          else dugum.value = degerler[0] ?? '';
        });
      }
      kategoriyiUyarla(true);
      fiyatiGuncelle();
      sosyalAlaniGuncelle();
      durumuGuncelle();
    }

    function taslagiDenetle(): void {
      if (form.dataset.kaydedildi === 'evet') {
        try { localStorage.removeItem(taslakAnahtari); } catch { /* depolama kapalı olabilir */ }
        return;
      }
      try {
        const ham = localStorage.getItem(taslakAnahtari);
        if (!ham) return;
        const taslak = JSON.parse(ham) as Taslak;
        if (taslak?.veriler && taslakUyari) taslakUyari.hidden = false;
      } catch { /* bozuk taslak formu engellemez */ }
    }

    function doluMu(ad: string): boolean {
      const dugum = alan(ad);
      if (!dugum || dugum.disabled) return false;
      return dugum instanceof HTMLInputElement && (dugum.type === 'radio' || dugum.type === 'checkbox')
        ? Boolean(seciliRadio(ad)) : Boolean(dugum.value.trim());
    }

    function gorselSayisi(): number {
      const mevcut = Number(form.dataset.gorselSayisi || 0);
      const metin = alan('gorseller')?.value || '';
      const yazilan = metin.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean).length;
      const secilen = fotografSecici?.files?.length ?? 0;
      return Math.max(mevcut, yazilan) + secilen;
    }

    function durumuGuncelle(): void {
      const zorunlular = [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]')]
        .filter((girdi) => !girdi.disabled && !girdi.closest<HTMLElement>('[hidden]'));
      const onerilenler = [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-onerilen]')]
        .filter((girdi) => !girdi.disabled && !girdi.closest<HTMLElement>('[hidden]'));
      const zorunluTamam = zorunlular.filter((girdi) => girdi.value.trim() && girdi.checkValidity()).length;
      const onerilenTamam = onerilenler.filter((girdi) => girdi.value.trim()).length;
      const payda = Math.max(1, zorunlular.length * 2 + onerilenler.length);
      const oran = Math.min(100, Math.round(((zorunluTamam * 2 + onerilenTamam) / payda) * 100));
      const cubuk = form.querySelector<HTMLElement>('[data-doluluk-cubugu]');
      const yuzde = form.querySelector<HTMLElement>('[data-doluluk-yuzde]');
      const metin = form.querySelector<HTMLElement>('[data-doluluk-metin]');
      if (cubuk) cubuk.style.width = `${oran}%`;
      if (yuzde) yuzde.textContent = `%${oran}`;
      if (metin) metin.textContent = oran === 100 ? 'Yayın bilgileri hazır' : oran >= 70 ? 'Son kontroller kaldı' : oran >= 35 ? 'İlan dosyası hazırlanıyor' : 'Temel bilgiler bekleniyor';

      const kontroller: Record<string, boolean> = {
        kategori: Boolean(seciliRadio('tip_grup') && seciliRadio('islem') && alan('tip')?.value),
        konum: ['il', 'ilce', 'mahalle'].every(doluMu),
        fiyat: (seciliRadio('islem')?.value === 'kat-karsiligi-satilik' || doluMu('fiyat')) && ['m2_brut', 'm2_net', 'arsa_m2', 'hisse_m2'].some(doluMu),
        aciklama: (aciklama?.value.trim().length ?? 0) >= 80,
        gorsel: gorselSayisi() >= 5,
        yetki: doluMu('yetki_durumu'),
      };
      Object.entries(kontroller).forEach(([ad, tamam]) => form.querySelector<HTMLElement>(`[data-kontrol="${ad}"]`)?.setAttribute('data-tamam', tamam ? 'evet' : 'hayir'));
      if (baslik) form.querySelector<HTMLElement>('[data-baslik-sayac]')!.textContent = `${baslik.value.length} / 64`;
      if (aciklama) form.querySelector<HTMLElement>('[data-aciklama-sayac]')!.textContent = `${aciklama.value.length} karakter`;
      const sema = aktifSema();
      const islemMetni = seciliRadio('islem')?.closest('label')?.textContent?.trim() || '';
      const tipMetni = tipSecimi?.selectedOptions[0]?.textContent || '';
      const ozetKategori = form.querySelector<HTMLElement>('[data-ozet-kategori]');
      if (ozetKategori) ozetKategori.textContent = `${islemMetni} ${tipMetni}`.trim();
      const ozetKonum = form.querySelector<HTMLElement>('[data-ozet-konum]');
      if (ozetKonum) ozetKonum.textContent = ['mahalle', 'ilce', 'il'].map((x) => alan(x)?.value.trim()).filter(Boolean).join(' / ') || '—';
      const ozetFiyat = form.querySelector<HTMLElement>('[data-ozet-fiyat]');
      const fiyat = fiyatSayisi(alan('fiyat')?.value || '');
      if (ozetFiyat) ozetFiyat.textContent = seciliRadio('islem')?.value === 'kat-karsiligi-satilik'
        ? 'Kat karşılığı'
        : fiyat ? `${fiyat.toLocaleString('tr-TR')} ${alan('para_birimi')?.value || 'TRY'}` : '—';
      const ozetDoluluk = form.querySelector<HTMLElement>('[data-ozet-doluluk]');
      if (ozetDoluluk) ozetDoluluk.textContent = `${sema.etiket} · %${oran}`;
      const sayac = form.querySelector<HTMLElement>('[data-donanim-sayaci]');
      if (sayac) sayac.textContent = `${form.querySelectorAll<HTMLInputElement>('input[name="donanim"]:checked:not(:disabled)').length} seçili`;
    }

    function istemciDogrula(): boolean {
      form.querySelectorAll('[aria-invalid="true"]').forEach((d) => d.removeAttribute('aria-invalid'));
      const sorunlar: Array<{ alan: HTMLElement; mesaj: string }> = [];
      const gorunurZorunlu = [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]')]
        .filter((girdi) => !girdi.disabled && !girdi.closest<HTMLElement>('[hidden]'));
      for (const girdi of gorunurZorunlu) {
        if (girdi.checkValidity() && girdi.value.trim()) continue;
        const alanEtiketi = girdi.closest('.alan')?.querySelector('span, legend')?.textContent?.replace('*', '').trim();
        sorunlar.push({ alan: girdi, mesaj: girdi.validationMessage || `${alanEtiketi || 'Bu alan'} zorunludur.` });
      }
      if (baslik && baslik.value.trim().length < 10 && !sorunlar.some((s) => s.alan === baslik)) sorunlar.push({ alan: baslik, mesaj: 'İlan başlığı en az 10 karakter olmalı.' });
      if (aciklama && aciklama.value.trim().length < 80 && !sorunlar.some((s) => s.alan === aciklama)) sorunlar.push({ alan: aciklama, mesaj: 'Açıklama en az 80 karakter olmalı.' });
      if (fiyatGirdisi && !fiyatGirdisi.disabled && fiyatSayisi(fiyatGirdisi.value) <= 0 && !sorunlar.some((s) => s.alan === fiyatGirdisi)) sorunlar.push({ alan: fiyatGirdisi, mesaj: 'Sıfırdan büyük bir fiyat girin.' });
      form.querySelectorAll<HTMLElement>('[data-donanim-grup][data-gerekli="evet"]')
        .forEach((grup) => {
          if (grup.closest<HTMLElement>('[hidden]')) return;
          const secimVar = Boolean(grup.querySelector<HTMLInputElement>('input[name="donanim"]:checked'));
          const secimYok = Boolean(grup.querySelector<HTMLInputElement>('[data-donanim-atla]:checked'));
          if (!secimVar && !secimYok) sorunlar.push({ alan: grup, mesaj: `${grup.querySelector('legend strong')?.textContent?.replace('*', '').trim() || 'Bu özellik grubu'} için seçim yapın veya seçim yapmak istemediğinizi belirtin.` });
        });
      const brutAlan = alan('m2_brut');
      const netAlan = alan('m2_net');
      const hisseAlani = alan('hisse_m2');
      const alanSayisi = (girdi: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) => Number(girdi?.value.replace(',', '.') || 0);
      if (brutAlan && !brutAlan.disabled && !['m2_brut', ...(aktifSema().kimlik === 'arsa' ? ['hisse_m2'] : ['m2_net', 'arsa_m2'])].some(doluMu)) {
        sorunlar.push({ alan: brutAlan, mesaj: 'En az bir doğrulanmış alan ölçüsü girin.' });
      }
      if (brutAlan && netAlan && !brutAlan.disabled && !netAlan.disabled && alanSayisi(brutAlan) > 0 && alanSayisi(netAlan) > alanSayisi(brutAlan)) {
        sorunlar.push({ alan: netAlan, mesaj: 'Net kullanım alanı brüt alandan büyük olamaz.' });
      }
      if (brutAlan && hisseAlani && !brutAlan.disabled && !hisseAlani.disabled && alanSayisi(brutAlan) > 0 && alanSayisi(hisseAlani) > alanSayisi(brutAlan)) {
        sorunlar.push({ alan: hisseAlani, mesaj: 'Satılan hisse alanı toplam parsel alanından büyük olamaz.' });
      }
      const secilenFotografSayisi = fotografSecici?.files?.length ?? 0;
      if (secilenFotografSayisi > 0) {
        const mevcutFotografSayisi = Math.max(0, gorselSayisi() - secilenFotografSayisi);
        const plan = fotografYuklemePlani(mevcutFotografSayisi, secilenFotografSayisi);
        if (!plan || plan.atlanacak > 0) {
          const eklenebilir = plan?.kalan ?? Math.max(0, EN_COK_ILAN_FOTOGRAFI - mevcutFotografSayisi);
          sorunlar.push({
            alan: fotografSecici!,
            mesaj: `${fotografSiniriMesaji()} Bu ilanda ${mevcutFotografSayisi} fotoğraf var; en fazla ${eklenebilir} yeni fotoğraf seçebilirsiniz.`,
          });
        }
      }
      const videoDosyasi = videoSecici?.files?.[0];
      if (videoDosyasi && !(VIDEO_KABUL_TURLERI as readonly string[]).includes(videoDosyasi.type)) {
        sorunlar.push({ alan: videoSecici!, mesaj: 'MP4, WebM veya MOV video seçin.' });
      } else if (videoDosyasi && videoDosyasi.size > VIDEO_EN_BUYUK_BOYUT) {
        sorunlar.push({ alan: videoSecici!, mesaj: `Video en fazla ${videoBoyutMetni()} olabilir.` });
      }
      const kesinEnlem = alan('kesin_enlem');
      const kesinBoylam = alan('kesin_boylam');
      const kamuKonumDuzeyi = alan('kamu_konum_duzeyi');
      if (Boolean(kesinEnlem?.value) !== Boolean(kesinBoylam?.value)) {
        sorunlar.push({ alan: (kesinEnlem?.value ? kesinBoylam : kesinEnlem)!, mesaj: 'Kesin konum için enlem ve boylam birlikte girilmelidir.' });
      }
      if (kamuKonumDuzeyi?.value === 'yaklasik' && (!kesinEnlem?.value || !kesinBoylam?.value)) {
        sorunlar.push({ alan: kamuKonumDuzeyi, mesaj: 'Yaklaşık alan için önce kesin pini işaretleyin.' });
      }
      const sezonBaslangic = alan('sezon_baslangic');
      const sezonBitis = alan('sezon_bitis');
      if (sezonBaslangic && sezonBitis && sezonBaslangic.value && sezonBitis.value && sezonBaslangic.value > sezonBitis.value) {
        sorunlar.push({ alan: sezonBitis, mesaj: 'Sezon bitişi başlangıç tarihinden önce olamaz.' });
      } else if (sezonBaslangic?.value && sezonBitis?.value) {
        const minimumSure = alan('minimum_sezon_suresi');
        const hafta = Number(minimumSure?.value || 0);
        const gun = Math.floor((Date.parse(`${sezonBitis.value}T12:00:00Z`) - Date.parse(`${sezonBaslangic.value}T12:00:00Z`)) / 86_400_000) + 1;
        if (minimumSure && hafta > 0 && hafta * 7 > gun) sorunlar.push({ alan: minimumSure, mesaj: 'Minimum kiralama süresi sezon tarih aralığından uzun olamaz.' });
      }
      const imarDurumu = alan('imar_dogrulama');
      if (!imarDurumu?.disabled && imarDurumu?.value === 'dogrulandi') {
        for (const ad of ['imar_kaynagi', 'imar_belge_tarihi']) {
          const girdi = alan(ad); if (girdi && !girdi.value.trim()) sorunlar.push({ alan: girdi, mesaj: 'Doğrulanmış imar bilgisi için kaynak ve tarih zorunludur.' });
        }
      }
      const ozet = form.querySelector<HTMLElement>('[data-istemci-hata-ozeti]');
      const liste = form.querySelector<HTMLElement>('[data-istemci-hata-listesi]');
      if (!sorunlar.length) { if (ozet) ozet.hidden = true; return true; }
      sorunlar.forEach((s) => s.alan.setAttribute('aria-invalid', 'true'));
      if (liste) {
        liste.replaceChildren(...sorunlar.map((s, i) => {
          if (!s.alan.id) s.alan.id = `form-hata-${i}`;
          const li = document.createElement('li'), bag = document.createElement('a');
          bag.href = `#${s.alan.id}`; bag.textContent = s.mesaj; li.append(bag); return li;
        }));
      }
      if (ozet) { ozet.hidden = false; ozet.focus({ preventScroll: true }); ozet.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      sorunlar[0].alan.focus({ preventScroll: true });
      return false;
    }

    form.querySelectorAll<HTMLInputElement>('input[name="tip_grup"]').forEach((girdi) => girdi.addEventListener('change', () => { kategoriyiUyarla(false); kirli = true; taslakPlanla(); }));
    form.querySelectorAll<HTMLInputElement>('input[name="islem"]').forEach((girdi) => girdi.addEventListener('change', () => { islemiUyarla(); durumuGuncelle(); }));
    tipSecimi?.addEventListener('change', () => { islemiUyarla(); kirli = true; taslakPlanla(); durumuGuncelle(); });
    form.addEventListener('input', (olay) => {
      if (olay.target === fiyatGirdisi) fiyatiGuncelle();
      kirli = true; taslakPlanla(); durumuGuncelle();
      (olay.target as HTMLElement).removeAttribute('aria-invalid');
    });
    form.addEventListener('change', (olay) => {
      const hedef = olay.target;
      if (hedef instanceof HTMLSelectElement && hedef.name === 'devre_mulk_tesisi') islemiUyarla();
      if (hedef instanceof HTMLInputElement && (hedef.name === 'donanim' || hedef.matches('[data-donanim-atla]'))) {
        const grup = hedef.closest<HTMLElement>('[data-donanim-grup]');
        if (grup && hedef.checked && hedef.matches('[data-donanim-atla]')) {
          grup.querySelectorAll<HTMLInputElement>('input[name="donanim"]').forEach((secim) => { secim.checked = false; });
        } else if (grup && hedef.checked && hedef.name === 'donanim') {
          const atla = grup.querySelector<HTMLInputElement>('[data-donanim-atla]');
          if (atla) atla.checked = false;
        }
      }
      if (olay.target === paraBirimi) fiyatiGuncelle();
      if (olay.target === sosyalAc) sosyalAlaniGuncelle();
      if (olay.target === fotografSecici) fotografOnizle();
      if (olay.target === videoSecici) void videoOnizle();
      kirli = true; taslakPlanla(); durumuGuncelle();
    });
    form.addEventListener('submit', async (olay) => {
      kategoriyiUyarla(true);
      if (!istemciDogrula()) { olay.preventDefault(); return; }
      const fotograflar = [...(fotografSecici?.files ?? [])];
      const videoDosyasi = videoSecici?.files?.[0];
      const medyaYuklenecek = (!fotografYuklendi && fotograflar.length > 0) || (!videoYuklendi && Boolean(videoDosyasi));
      if (!kayitBasladi && medyaYuklenecek) {
        olay.preventDefault();
        kayitBasladi = true;
        const ilanId = form.dataset.yuklemeIlanId || '';
        const dugme = form.querySelector<HTMLButtonElement>('[type="submit"]');
        const dugmeMetni = form.dataset.mod === 'ekle' ? 'İlanı kaydet ve yayınla' : 'Değişiklikleri kaydet';
        if (dugme) { dugme.disabled = true; dugme.textContent = 'Medya yükleniyor…'; }
        if (!fotografYuklendi && fotograflar.length) {
          if (fotografDurumu) { fotografDurumu.hidden = false; fotografDurumu.textContent = 'Fotoğraflar hazırlanıyor…'; }
          const sonuc = await fotograflariYukle(ilanId, fotograflar, (metin) => {
            if (fotografDurumu) fotografDurumu.textContent = metin;
          });
          if (sonuc.eklenen > 0 && sonuc.atlanan.length > 0) {
            const oncekiFotografSayisi = Math.max(0, gorselSayisi() - fotograflar.length);
            form.dataset.gorselSayisi = String(oncekiFotografSayisi + sonuc.eklenen);
            let eksiklerSecili = false;
            if (
              fotografSecici && sonuc.tekrarSecimGuvenli &&
              sonuc.tekrarSecimDosyalari.length === sonuc.atlanan.length
            ) {
              try {
                const secim = new DataTransfer();
                sonuc.tekrarSecimDosyalari.forEach((dosya) => secim.items.add(dosya));
                fotografSecici.files = secim.files;
                eksiklerSecili = true;
              } catch {
                // Dosya seçimini güncelleyemeyen tarayıcıda güvenli manuel akışa dön.
              }
            }
            if (fotografSecici && !eksiklerSecili) fotografSecici.value = '';
            fotografOnizle();
            kayitBasladi = false;
            if (dugme) { dugme.disabled = false; dugme.textContent = dugmeMetni; }
            if (fotografDurumu) {
              const atlananOzet = sonuc.atlanan.slice(0, 3).join(' · ');
              const devamIsareti = sonuc.atlanan.length > 3 ? ' …' : '';
              fotografDurumu.textContent = eksiklerSecili
                ? `${sonuc.eklenen} fotoğraf yüklendi; ${sonuc.atlanan.length} fotoğraf eksik kaldı: ${atlananOzet}${devamIsareti}. Yalnızca başarısız dosyalar seçili; yeniden denemek için Kaydet’e tekrar basın.`
                : sonuc.sonucBelirsizMi
                  ? `${sonuc.eklenen} fotoğrafın yüklendiği doğrulandı; bazı dosyaların sonucu belirsiz. Tekrar yüklemeden önce sayfayı yenileyip ilan fotoğraflarını kontrol edin.`
                  : `${sonuc.eklenen} fotoğraf yüklendi; atlanan dosyalar sunucu yanıtında kesin eşleştirilemedi. Yinelenen fotoğraf oluşturmamak için tekrar yüklemeden önce sayfayı yenileyip ilan galerisini kontrol edin.`;
            }
            durumuGuncelle();
            return;
          }
          if (!sonuc.tamam || sonuc.eklenen === 0) {
            if (sonuc.sonucBelirsizMi && fotografSecici) fotografSecici.value = '';
            kayitBasladi = false;
            if (dugme) { dugme.disabled = false; dugme.textContent = dugmeMetni; }
            if (fotografDurumu) fotografDurumu.textContent = sonuc.sonucBelirsizMi
              ? 'Sunucudan kesin yanıt alınamadı. Yinelenen fotoğraf oluşturmamak için seçimi temizledim; sayfayı yenileyip ilanın fotoğraflarını kontrol edin.'
              : `Fotoğraflar yüklenemedi: ${sonuc.hata || sonuc.atlanan.join(', ') || 'bilinmeyen hata'}`;
            return;
          }
          fotografYuklendi = true;
          if (fotografSecici) fotografSecici.disabled = true;
          if (fotografDurumu) {
            const atlananOzet = sonuc.atlanan.slice(0, 3).join(' · ');
            const devamIsareti = sonuc.atlanan.length > 3 ? ' …' : '';
            fotografDurumu.textContent = `${sonuc.eklenen} fotoğraf yüklendi.${sonuc.atlanan.length ? ` ${sonuc.atlanan.length} dosya atlandı: ${atlananOzet}${devamIsareti}` : ''}`;
          }
        }
        if (!videoYuklendi && videoDosyasi) {
          const sonuc = await videoYukle(ilanId, videoDosyasi, (metin) => {
            if (videoDurumu) videoDurumu.textContent = metin;
          });
          if (!sonuc.tamam) {
            kayitBasladi = false;
            if (dugme) { dugme.disabled = false; dugme.textContent = dugmeMetni; }
            if (videoDurumu) videoDurumu.textContent = `Video yüklenemedi: ${sonuc.hata || 'bilinmeyen hata'}`;
            return;
          }
          videoYuklendi = true;
          if (videoSecici) videoSecici.disabled = true;
          if (videoDurumu) videoDurumu.textContent = 'Video ve poster karesi yüklendi; ilan kaydediliyor…';
        }
        kayitBasladi = false;
        if (dugme) { dugme.disabled = false; dugme.textContent = 'İlan kaydediliyor…'; }
        form.requestSubmit(dugme ?? undefined);
        return;
      }
      kirli = false;
      const dugme = form.querySelector<HTMLButtonElement>('[type="submit"]');
      if (dugme) { dugme.disabled = true; dugme.textContent = 'Kaydediliyor…'; }
    });
    form.querySelector<HTMLInputElement>('[data-donanim-ara]')?.addEventListener('input', (olay) => {
      const arama = (olay.currentTarget as HTMLInputElement).value.toLocaleLowerCase('tr-TR').trim();
      form.querySelectorAll<HTMLElement>('[data-donanim-oge]').forEach((oge) => { oge.hidden = Boolean(arama) && !(oge.dataset.ara || '').includes(arama); });
    });
    form.querySelector<HTMLButtonElement>('[data-video-sil]')?.addEventListener('click', async (olay) => {
      const dugme = olay.currentTarget as HTMLButtonElement;
      dugme.disabled = true;
      if (videoDurumu) videoDurumu.textContent = 'Video siliniyor…';
      try {
        const cevap = await fetch('/yonetim/api/video', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ilan: form.dataset.yuklemeIlanId || '' }),
        });
        const sonuc = await cevap.json().catch(() => ({})) as { hata?: string };
        if (!cevap.ok) throw new Error(sonuc.hata || 'Video silinemedi.');
        window.location.reload();
      } catch (hata) {
        dugme.disabled = false;
        if (videoDurumu) videoDurumu.textContent = (hata as Error).message;
      }
    });
    form.querySelector<HTMLButtonElement>('[data-taslak-yukle]')?.addEventListener('click', () => {
      try { const taslak = JSON.parse(localStorage.getItem(taslakAnahtari) || '') as Taslak; degerleriUygula(taslak.veriler); if (taslakUyari) taslakUyari.hidden = true; kirli = true; } catch { /* yoksa işlem yok */ }
    });
    form.querySelector<HTMLButtonElement>('[data-taslak-sil]')?.addEventListener('click', () => {
      try { localStorage.removeItem(taslakAnahtari); } catch { /* depolama kapalı olabilir */ }
      if (taslakUyari) taslakUyari.hidden = true;
    });
    window.addEventListener('beforeunload', (olay) => { if (!kirli) return; olay.preventDefault(); });

    kategoriyiUyarla(true);
    fiyatiGuncelle();
    sosyalAlaniGuncelle();
    konumPininiKur(form);
    taslagiDenetle();
    form.querySelector<HTMLElement>('[data-hata-ozeti]')?.focus({ preventScroll: true });
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', formlariKur, { once: true });
else formlariKur();
