/**
 * Site geneli hareket katmanı.
 *
 * Kural: JavaScript çalışmazsa sayfa eksiksiz görünür. Gizleme yalnızca
 * <html class="js-var"> geldiğinde devreye girer, o sınıfı da buradaki kod koyar.
 * Kullanıcı hareket azaltma tercihi belirtmişse hiçbir animasyon kurulmaz.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const azHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.registerPlugin(ScrollTrigger);

/* Görünüm geçişinde sayfa yeniden yüklenmiyor; bir öncekinden kalan her şeyi
   elle toplamak gerekiyor. Dinleyiciler tek bir AbortController'a bağlı,
   Lenis ve şerit döngüsü ayrıca tutuluyor. */
let kontrol: AbortController | null = null;
let lenisOrnek: Lenis | null = null;
let tickerIsi: ((zaman: number) => void) | null = null;
let seritDonguleri: gsap.core.Tween[] = [];
let ilkKurulum = true;

const isaret = () => ({ signal: kontrol?.signal }) as AddEventListenerOptions;

/** Bir önceki sayfadan kalan hareketleri söker. */
export function hareketiDurdur(): void {
  ScrollTrigger.getAll().forEach((tetik) => tetik.kill());
  seritDonguleri.forEach((dongu) => dongu.kill());
  seritDonguleri = [];

  if (tickerIsi) {
    gsap.ticker.remove(tickerIsi);
    tickerIsi = null;
  }
  lenisOrnek?.destroy();
  lenisOrnek = null;

  kontrol?.abort();
  kontrol = null;
}

/* ---------------------------------------------------------------
   Yumuşak kaydırma
   --------------------------------------------------------------- */
function kaydirmaKur(): Lenis | null {
  if (azHareket) return null;
  // Dokunmatik cihazlarda yerel kaydırma zaten akıcı; araya girmiyoruz.
  if (window.matchMedia('(pointer: coarse)').matches) return null;

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    wheelMultiplier: 0.95,
  });

  lenis.on('scroll', ScrollTrigger.update);
  tickerIsi = (zaman: number) => lenis.raf(zaman * 1000);
  gsap.ticker.add(tickerIsi);
  gsap.ticker.lagSmoothing(0);
  lenisOrnek = lenis;

  // Sayfa içi çapa bağlantıları Lenis üzerinden gitsin
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (olay) => {
      const hedef = a.getAttribute('href');
      if (!hedef || hedef === '#') return;
      const el = document.querySelector(hedef);
      if (!el) return;
      olay.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -96 });
    }, isaret());
  });

  return lenis;
}

/* ---------------------------------------------------------------
   Kaydırmayla beliren öğeler
   data-belir="yukari" | "maske" | "olcek" | "sira"
   data-gecikme="0.1"
   --------------------------------------------------------------- */
function belirmeKur(anindaAc: boolean) {
  const ogeler = gsap.utils.toArray<HTMLElement>('[data-belir]');
  const ekranYuksekligi = window.innerHeight;

  /** Animasyonsuz, doğrudan son hâline getirir. */
  function hemenAc(el: HTMLElement) {
    gsap.set(el, { opacity: 1, y: 0, yPercent: 0, scale: 1 });
    if (el.dataset.belir === 'sira') gsap.set(Array.from(el.children), { opacity: 1, y: 0 });
    el.setAttribute('data-belirdi', 'evet');
  }

  /** Bir öğeyi görünür hale getiren tween'i kurar. */
  function ac(el: HTMLElement, gecikme: number) {
    const tur = el.dataset.belir || 'yukari';

    if (tur === 'sira') {
      const cocuklar = Array.from(el.children) as HTMLElement[];
      gsap.to(cocuklar, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.07,
        delay: gecikme,
        onComplete: () => el.setAttribute('data-belirdi', 'evet'),
      });
      return;
    }

    const bitis: gsap.TweenVars =
      tur === 'maske'
        ? { yPercent: 0, duration: 1.05, ease: 'power4.out' }
        : tur === 'olcek'
          ? { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }
          : { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out' };

    gsap.to(el, {
      ...bitis,
      delay: gecikme,
      onComplete: () => el.setAttribute('data-belirdi', 'evet'),
    });
  }

  ogeler.forEach((el) => {
    const tur = el.dataset.belir || 'yukari';
    const gecikme = parseFloat(el.dataset.gecikme ?? '0');

    // Başlangıç durumu
    if (tur === 'sira') {
      gsap.set(el, { opacity: 1 });
      gsap.set(Array.from(el.children), { opacity: 0, y: 26 });
    } else if (tur === 'maske') {
      gsap.set(el, { yPercent: 108, opacity: 1 });
    } else if (tur === 'olcek') {
      gsap.set(el, { opacity: 0, scale: 1.06 });
    } else {
      gsap.set(el, { opacity: 0, y: 34 });
    }

    // İlk ekranda olan her şey beklemeden açılır — sayfa yüklendiğinde
    // okunacak içerik gizli kalmaz.
    const ustNokta = el.getBoundingClientRect().top;
    if (ustNokta < ekranYuksekligi * 0.95) {
      // Geçişle gelindiyse ekrandaki içerik beklemeden yerinde durur;
      // sayfa geçişinin üstüne bir de belirme animasyonu binmesin.
      anindaAc ? hemenAc(el) : ac(el, gecikme);
      return;
    }

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => ac(el, gecikme),
    });
  });

  // Güvenlik ağı: animasyon herhangi bir nedenle çalışmazsa (sekme arka planda
  // açıldı, ScrollTrigger tetiklenmedi, GSAP hata verdi) içerik gizli kalmasın.
  window.setTimeout(gizliKalaniAc, 4000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      ScrollTrigger.refresh();
      window.setTimeout(gizliKalaniAc, 1200);
    }
  }, isaret());
}

/** Hâlâ görünmez duran öğeleri anında görünür kılar. */
function gizliKalaniAc() {
  document.querySelectorAll<HTMLElement>('[data-belir]:not([data-belirdi])').forEach((el) => {
    const kutu = el.getBoundingClientRect();
    const ekranda = kutu.top < window.innerHeight && kutu.bottom > 0;
    if (!ekranda) return;
    gsap.set(el, { opacity: 1, y: 0, yPercent: 0, scale: 1 });
    if (el.dataset.belir === 'sira') {
      gsap.set(Array.from(el.children), { opacity: 1, y: 0 });
    }
    el.setAttribute('data-belirdi', 'evet');
  });
}

/* ---------------------------------------------------------------
   Sayaç — "46 ilan" gibi rakamlar yerinde sayılır
   --------------------------------------------------------------- */
function sayacKur() {
  document.querySelectorAll<HTMLElement>('[data-sayac]').forEach((el) => {
    const hedef = parseFloat(el.dataset.sayac ?? '0');
    if (!Number.isFinite(hedef)) return;
    const bicim = new Intl.NumberFormat('tr-TR');

    // Sunucu doğru sayıyı zaten bastı. Ekranda görünen bir sayacı sıfırlamak
    // "46 → 0 → 46" gibi bir sıçrama yaratır; o yüzden yalnızca henüz
    // görünmemiş sayaçları sıfırdan başlatıyoruz.
    const ekranda = el.getBoundingClientRect().top < window.innerHeight;
    if (azHareket || ekranda) return;

    const durum = { deger: 0 };
    el.textContent = '0';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () =>
        gsap.to(durum, {
          deger: hedef,
          duration: 1.9,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = bicim.format(Math.round(durum.deger));
          },
          onComplete: () => {
            el.textContent = bicim.format(hedef);
          },
        }),
    });
  });
}

/* ---------------------------------------------------------------
   Kahraman görselinde derinlik
   --------------------------------------------------------------- */
function parallaxKur() {
  if (azHareket) return;
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const guc = parseFloat(el.dataset.parallax || '14');
    gsap.to(el, {
      yPercent: guc,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('[data-parallax-alan]') ?? el,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/* ---------------------------------------------------------------
   Kahraman kaydırmayla çözülür

   Belirme animasyonları bir kez oynayıp biter; bu ise kaydırmaya bağlı.
   Aşağı indikçe kahraman yazısı sayfadan biraz daha hızlı çıkıp soluyor,
   arkadaki parsel dokusu geride kalıyor. İkisinin farklı hızda gitmesi
   derinlik hissini veren şey.

   Yalnızca saran kutuyu hareket ettiriyoruz — içindeki [data-belir]
   öğelerinin kendi animasyonlarına ve güvenlik ağına dokunmuyor.
   --------------------------------------------------------------- */
function kahramanKur() {
  if (azHareket) return;
  const icerik = document.querySelector<HTMLElement>('[data-kahraman-icerik]');
  if (!icerik) return;

  gsap.to(icerik, {
    yPercent: -11,
    opacity: 0.3,
    ease: 'none',
    scrollTrigger: {
      trigger: icerik,
      start: 'top top',
      end: 'bottom 42%',
      scrub: 0.5,
    },
  });
}

/* ---------------------------------------------------------------
   Fotoğraf şeridi kaydırma hızına tepki verir

   Şerit CSS animasyonuyla dönüyordu — sabit hız, sayfayla ilgisi yok.
   Burada kontrolü GSAP'e alıyoruz: hızlı kaydırınca şerit hızlanıp
   hafifçe eğiliyor, yukarı kaydırınca yön değiştiriyor, durunca kendi
   temposuna dönüyor. Şerit iki kez basılı olduğu için yarım tur
   (xPercent -50) tam bir döngü ediyor.

   CSS animasyonu yerinde bırakıldı: JS çalışmazsa şerit yine dönüyor.
   --------------------------------------------------------------- */
function seritKur() {
  if (azHareket) return;

  document.querySelectorAll<HTMLElement>('.serit-akis').forEach((akis) => {
    const sure = parseFloat(getComputedStyle(akis).getPropertyValue('--sure')) || 45;

    akis.style.animation = 'none';
    const dongu = gsap.to(akis, {
      xPercent: -50,
      duration: sure,
      ease: 'none',
      repeat: -1,
    });
    seritDonguleri.push(dongu);

    // Üzerine gelince durma davranışı CSS'ten devralınıyor.
    const kap = akis.closest<HTMLElement>('.serit-durakla');
    let uzerinde = false;
    kap?.addEventListener('pointerenter', () => {
      uzerinde = true;
      gsap.to(dongu, { timeScale: 0, duration: 0.5, overwrite: true });
    }, isaret());
    kap?.addEventListener('pointerleave', () => {
      uzerinde = false;
      gsap.to(dongu, { timeScale: 1, duration: 0.7, overwrite: true });
    }, isaret());

    const egimeGit = gsap.quickTo(akis, 'skewX', { duration: 0.5, ease: 'power2.out' });
    let durgunluk: number;

    ScrollTrigger.create({
      onUpdate: (kendi) => {
        if (uzerinde) return;
        const hiz = kendi.getVelocity();
        const yon = hiz < 0 ? -1 : 1;
        const carpan = Math.min(Math.abs(hiz) / 900, 3);

        gsap.to(dongu, { timeScale: yon * (1 + carpan), duration: 0.25, overwrite: true });
        egimeGit(gsap.utils.clamp(-5, 5, hiz / 260));

        // Kaydırma durunca kendi temposuna dönsün.
        clearTimeout(durgunluk);
        durgunluk = window.setTimeout(() => {
          if (uzerinde) return;
          gsap.to(dongu, { timeScale: 1, duration: 0.9, overwrite: true });
          egimeGit(0);
        }, 150);
      },
    });
  });
}

/* ---------------------------------------------------------------
   Süreç adımları

   Okunan adım tam görünür, diğerleri soluk. Odak kaydırmayla ilerliyor,
   soldaki sayaç ve kırmızı ray da onunla birlikte.

   Sol sütun CSS'in kendi `position: sticky`'siyle yerinde duruyor —
   ScrollTrigger'ın pin'i Lenis'le birlikte kırılgan olabiliyor, buna
   gerek yok.
   --------------------------------------------------------------- */
function adimKur() {
  if (azHareket) return;
  const alan = document.querySelector<HTMLElement>('[data-adim-alan]');
  if (!alan) return;

  const adimlar = gsap.utils.toArray<HTMLElement>('[data-adim]', alan);
  if (!adimlar.length) return;

  const sayac = alan.querySelector<HTMLElement>('[data-adim-sayac]');
  const cizgi = alan.querySelector<HTMLElement>('[data-adim-cizgi]');

  gsap.set(adimlar, { opacity: 0.4 });

  // Her adıma ayrı tetik koymak, kısa bloklarda ikisini birden yakıyordu.
  // Onun yerine ekranda hayali bir okuma çizgisi var ve o çizgiye en yakın
  // adım tek başına canlanıyor — ekran boyu ne olursa olsun tek odak.
  let aktif = -1;
  const okuma = () => window.innerHeight * 0.45;

  ScrollTrigger.create({
    trigger: alan,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: () => {
      const cizgiYeri = okuma();
      let enYakin = 0;
      let enKucukFark = Infinity;

      adimlar.forEach((adim, i) => {
        const kutu = adim.getBoundingClientRect();
        const fark = Math.abs(kutu.top + kutu.height / 2 - cizgiYeri);
        if (fark < enKucukFark) {
          enKucukFark = fark;
          enYakin = i;
        }
      });

      if (enYakin === aktif) return;
      aktif = enYakin;

      adimlar.forEach((adim, i) =>
        gsap.to(adim, { opacity: i === enYakin ? 1 : 0.4, duration: 0.45, overwrite: true })
      );
      adimlar[enYakin].setAttribute('data-adim-etkin', 'evet');
      if (sayac) sayac.textContent = String(enYakin + 1).padStart(2, '0');
    },
  });

  // Soldaki kırmızı ray kaydırmayla doluyor — nerede olduğunu gösteren
  // tek sürekli işaret. Adımların yakılıp söndürülmesinden bağımsız.
  if (cizgi) {
    gsap.fromTo(
      cizgi,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        transformOrigin: 'top',
        scrollTrigger: { trigger: alan, start: 'top 62%', end: 'bottom 55%', scrub: 0.4 },
      }
    );
  }

  // Güvenlik ağı: hiçbir adım canlanmadıysa hepsini tam görünür yap.
  window.setTimeout(() => {
    if (!alan.querySelector('[data-adim-etkin]')) gsap.set(adimlar, { opacity: 1 });
  }, 5000);
}

/* ---------------------------------------------------------------
   Kartın fotoğrafı ilan sayfasına büyüyerek geçsin

   Geçiş adını her karta baştan yazmak yerine tıklanan karta veriyoruz:
   sayfada aynı ad tek bir öğede bulunabilir ve tarayıcının 46 kareyi
   birden anlık görüntülemesi gereksiz bir yük olurdu.

   Yakalama evresinde dinliyoruz — Astro'nun kendi tıklama işleyicisi
   kabarma evresinde çalışıyor, ad ondan önce yerine konmuş oluyor.
   --------------------------------------------------------------- */
const GECIS_ADI = 'ilan-foto';

function gecisKur() {
  document.addEventListener(
    'click',
    (olay) => {
      const hedef = olay.target as HTMLElement | null;
      const bag = hedef?.closest?.('a[href^="/ilan/"]') as HTMLAnchorElement | null;
      if (!bag) return;

      const gorsel = bag.querySelector<HTMLImageElement>('img');
      if (!gorsel) return;

      // Ad sayfada tek olmalı; ilan sayfasındaki galeri karesi de aday.
      document.querySelectorAll<HTMLElement>('[data-gecis-adi]').forEach((el) => {
        el.style.viewTransitionName = '';
        el.removeAttribute('data-gecis-adi');
      });

      gorsel.style.viewTransitionName = GECIS_ADI;
      gorsel.setAttribute('data-gecis-adi', '');
    },
    { capture: true, ...isaret() }
  );
}

/* ---------------------------------------------------------------
   Başlık çubuğu: kaydırınca zemin kazanır
   --------------------------------------------------------------- */
function baslikCubuguKur() {
  const kafa = document.querySelector<HTMLElement>('[data-kafa]');
  if (!kafa) return;

  const esik = 24;
  let sonDurum: boolean | null = null;

  const guncelle = () => {
    const durum = window.scrollY > esik;
    if (durum === sonDurum) return;
    sonDurum = durum;
    kafa.dataset.katmanli = durum ? 'evet' : 'hayir';
  };

  guncelle();
  window.addEventListener('scroll', guncelle, { passive: true, ...isaret() });
}

/* ---------------------------------------------------------------
   Mobil menü
   --------------------------------------------------------------- */
function menuKur() {
  const dugme = document.querySelector<HTMLButtonElement>('[data-menu-dugme]');
  const panel = document.querySelector<HTMLElement>('[data-menu-panel]');
  if (!dugme || !panel) return;

  const kapat = () => {
    dugme.setAttribute('aria-expanded', 'false');
    panel.dataset.acik = 'hayir';
    document.documentElement.style.overflow = '';
  };
  const ac = () => {
    dugme.setAttribute('aria-expanded', 'true');
    panel.dataset.acik = 'evet';
    document.documentElement.style.overflow = 'hidden';
  };

  dugme.addEventListener('click', () => {
    dugme.getAttribute('aria-expanded') === 'true' ? kapat() : ac();
  });
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', kapat));
  document.addEventListener('keydown', (o) => {
    if (o.key === 'Escape') kapat();
  }, isaret());
}

/* ---------------------------------------------------------------
   Başlat
   --------------------------------------------------------------- */
export function hareketiBaslat(): void {
  // Geçişle gelindiyse bir önceki sayfanın hareketleri hâlâ ayakta.
  hareketiDurdur();
  kontrol = new AbortController();

  const gecisle = !ilkKurulum;
  ilkKurulum = false;

  document.documentElement.classList.add('js-var');

  menuKur();
  baslikCubuguKur();

  if (azHareket) {
    // Gizli bırakılmış öğeleri görünür kıl ve çık.
    document.querySelectorAll<HTMLElement>('[data-belir]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    sayacKur();
    return;
  }

  kaydirmaKur();
  belirmeKur(gecisle);
  sayacKur();
  parallaxKur();
  kahramanKur();
  seritKur();
  adimKur();
  gecisKur();

  // Görseller yüklendikçe tetik konumları kayar
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    window.setTimeout(gizliKalaniAc, 800);
  }, isaret());

  // Kaydırma durduğunda ekranda gizli kalan bir şey varsa aç
  let bekleme: number;
  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(bekleme);
      bekleme = window.setTimeout(gizliKalaniAc, 600);
    },
    { passive: true, ...isaret() }
  );
}
