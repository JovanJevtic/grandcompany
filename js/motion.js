// =====================================================================
// GRAND COMPANY — premium motion layer
// GSAP 3 + ScrollTrigger + SplitText + Lenis (vendored in /vendor)
// Progressive enhancement: the site works fully without this file.
// =====================================================================

'use strict';

window.addEventListener('load', () => {
  if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.documentElement.classList.add('has-motion');

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
      lenis.scrollTo(target, { offset: -72, duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
    });
  });

  // --- Hero headline: masked line-by-line reveal ---
  const h1 = document.querySelector('h1');
  if (h1) {
    const split = new SplitText(h1, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, { yPercent: 115, duration: 1.15, ease: 'power4.out', stagger: 0.12, delay: 0.1 });
  }

  // --- Section reveals (GSAP replaces the CSS/IntersectionObserver fallback) ---
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 48,
      autoAlpha: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // --- Footer wordmark: scrubbed parallax rise ---
  const wordmark = document.querySelector('.footer-wordmark');
  if (wordmark) {
    gsap.from(wordmark, {
      yPercent: 45,
      ease: 'none',
      scrollTrigger: { trigger: wordmark, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }
});
