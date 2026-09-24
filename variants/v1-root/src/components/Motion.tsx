'use client'

import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { applyTheme } from '@/lib/theme'
import { CHAPTERS, SHOP_ID } from '@/lib/content'
import { travel } from '@/lib/landing'

const OPEN = 'inset(0% 0% 0% 0%)'
const CLOSED = 'inset(0% 100% 0% 0%)'

// Sve što se dešava uz skrol na landingu: pin i vodoravno pomjeranje trake, otvaranje slika, izranje naslova i
// tekstova, paralaksa. Sve se pronalazi po data-atributima, pa blokovi ostaju obični server-komponente.
// (Prodavnica ispod landinga ima vlastito, jednostavnije izranje: vidi Reveal.tsx.)
export default function Motion() {
  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add(MQ, (ctx) => {
      const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean }

      const landing = document.querySelector<HTMLElement>('[data-landing]')
      const strip = document.querySelector<HTMLElement>('[data-strip]')
      if (!landing || !strip) return

      // Desktop: landing se zalijepi (pin) za vrh ekrana, a traka se pomjera ulijevo uz okomiti skrol.
      // Ovo je "mehanika" skrolanja, ne ukras, pa postoji i uz prefers-reduced-motion.
      // scrub: true (bez dodatnog kašnjenja): omekšavanje već radi Lenis.
      let scrollTween: gsap.core.Tween | undefined
      if (desktop) {
        scrollTween = gsap.to(strip, {
          x: () => -travel(),
          ease: 'none', // obavezno "none", inače se položaj trake ne poklapa sa skrolom
          scrollTrigger: {
            trigger: landing,
            start: 'top top',
            end: () => `+=${travel()}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
      }

      // Elementi u traci se aktiviraju prema VODORAVNOM kretanju trake (containerAnimation); na mobilnom prema okomitom.
      const st = (trigger: Element) =>
        desktop ? { trigger, containerAnimation: scrollTween, start: 'left 90%' } : { trigger, start: 'top 90%' }

      const media = gsap.utils.toArray<HTMLElement>('[data-media]', strip)
      const titles = gsap.utils.toArray<HTMLElement>('[data-title]', strip)
      const fades = gsap.utils.toArray<HTMLElement>('[data-fade]', strip)

      if (reduce) {
        gsap.set(media, { clipPath: OPEN })
        return
      }

      // slike: otvaraju se sa lijeva na desno, uz zum 1.2 → 1
      media.forEach((m) => {
        gsap.fromTo(m, { clipPath: CLOSED }, { clipPath: OPEN, duration: 1.5, ease: EASE.expoInOut, scrollTrigger: st(m) })
        const scale = m.querySelector('[data-scale]')
        if (scale) gsap.fromTo(scale, { scale: 1.2 }, { scale: 1, duration: 1.9, ease: EASE.out, scrollTrigger: st(m) })
      })

      // naslovi klize u poziciju
      titles.forEach((t) =>
        gsap.from(t, { xPercent: desktop ? -8 : 0, yPercent: desktop ? 0 : 12, autoAlpha: 0, duration: 1.6, ease: EASE.expo, scrollTrigger: st(t) }),
      )

      // tekstovi izranjaju
      fades.forEach((f) => gsap.from(f, { y: 22, autoAlpha: 0, duration: 1.2, ease: EASE.expo, scrollTrigger: st(f) }))

      if (desktop) {
        // pozadina hero-a se pomjera sporije od stranice
        const bg = strip.querySelector('[data-hero-bg]')
        const hero = strip.querySelector('[data-hero]')
        if (bg && hero) {
          gsap.to(bg, {
            x: -180,
            ease: 'none',
            scrollTrigger: { trigger: hero, containerAnimation: scrollTween, start: 'left left', end: 'right left', scrub: true },
          })
        }
        // stupci galerije idu u suprotnim smjerovima
        const grid = strip.querySelector('[data-grid]')
        if (grid) {
          gsap.utils.toArray<HTMLElement>('[data-col]', grid).forEach((col) => {
            const dir = Number(col.dataset.dir)
            gsap.fromTo(
              col,
              { y: dir * -70 },
              {
                y: dir * 70,
                ease: 'none',
                scrollTrigger: { trigger: grid, containerAnimation: scrollTween, start: 'left right', end: 'right left', scrub: true },
              },
            )
          })
        }
      } else {
        // mobilni: boja teme se mijenja kako se kroz stranicu prolazi kroz poglavlja (i prodavnicu na kraju)
        const themed = [
          strip.querySelector('[data-hero]'),
          ...CHAPTERS.map((c) => strip.querySelector(`[data-chapter="${c.id}"]`)),
          document.getElementById(SHOP_ID),
        ]
        themed.forEach((el, i) => {
          if (!el) return
          ScrollTrigger.create({
            trigger: el,
            start: 'top 50%',
            end: 'bottom 50%',
            onToggle: (self) => self.isActive && applyTheme(i - 1),
          })
        })
      }
    })

    // Fontovi mijenjaju širinu tekstova, pa se pozicije preračunaju kad se učitaju.
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return null
}
