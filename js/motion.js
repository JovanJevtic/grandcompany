// =====================================================================
// GRAND COMPANY — motion layer
// GSAP 3 + ScrollTrigger + SplitText + Lenis (vendored in /vendor)
// One orchestrated moment (the cover assembling) plus photo parallax.
// Progressive enhancement: the site works fully without this file.
// =====================================================================

'use strict';

window.addEventListener('load', () => {
  if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);

  // --- Lenis smooth scroll, driven by the GSAP ticker ---
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor navigation through Lenis (keeps the sticky-header offset)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.length < 2) return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -150, duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
    });
  });

  // --- The cover assembles: headline lines rise, photo unveils, lede follows ---
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  const title = document.querySelector('.cover-title');
  if (title) {
    const split = new SplitText(title, { type: 'lines', mask: 'lines' });
    tl.from(split.lines, { yPercent: 110, duration: 1.0, stagger: 0.1 }, 0.05);
  }

  const coverPhoto = document.querySelector('.cover-photo');
  if (coverPhoto) {
    tl.fromTo(
      coverPhoto,
      { clipPath: 'inset(0 0 100% 0)' },
      { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.inOut' },
      0.2
    );
  }

  const lede = document.querySelectorAll('.cover-lede');
  if (lede.length) tl.from(lede, { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.6);

  // --- Photographs drift slowly against their frames while scrolling ---
  document.querySelectorAll('[data-parallax]').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });
});
