'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap'
import { EASE, INTRO, SIDE, fitFontSize } from '@/lib/motion'
import BadgeMark from './BadgeMark'

export const BRAND = 'GRAND COMPANY'

// Boja koja u `mix-blend-mode: difference` na krem pozadini daje tačno boju teksta (#222A36).
const DIFF = 'rgb(220, 203, 195)'

// Elementi koji stoje fiksno preko cijele stranice: wordmark i značka.
export default function SiteChrome() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!
      const wm = el.querySelector<HTMLElement>('[data-wordmark]')!
      const badge = el.querySelector<HTMLElement>('[data-badge]')!
      const band = el.querySelector<HTMLElement>('[data-brand-band]')!
      let dead = false
      let onResize: (() => void) | null = null

      const boot = contextSafe!(() => {
        if (dead) return
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        // Slova u maskama: svako slovo izranja odozdo. Razdvaja se PRIJE mjerenja širine.
        const split = SplitText.create(wm, { type: 'chars', mask: 'chars', charsClass: 'ch' })
        const fit = () =>
          document.documentElement.style.setProperty(
            '--wm-fs',
            `${fitFontSize(wm, window.innerWidth * (1 - 2 * SIDE))}px`,
          )
        fit()
        onResize = fit
        window.addEventListener('resize', fit)
        gsap.set(wm, { visibility: 'visible' })

        // 3D scena krana je tamna, pa bi se tamni wordmark na njoj izgubio. Dok je scena
        // u kadru, pojas iza wordmarka dobija krem podlogu; poslije je providan.
        const hero = document.getElementById('hero')!
        if (hero) {
          ScrollTrigger.create({
            start: 0,
            end: () => hero.offsetTop + hero.offsetHeight - band.offsetHeight,
            invalidateOnRefresh: true,
            onToggle: (self) => band.classList.toggle('band-solid', self.isActive),
          })
          // Scena se učitava posle prvog mjerenja i tada se visine sekcija promijene,
          // pa se granice svih triggera moraju ponovo izračunati.
          window.addEventListener('gc:crane-ready', () => ScrollTrigger.refresh(), { once: true })
        }

        if (reduce) {
          gsap.set(badge, { x: 0, y: 0 })
          return
        }

        gsap.from(split.chars, {
          yPercent: 160,
          duration: 1.2,
          ease: EASE.quint,
          stagger: 0.05,
          delay: INTRO.letters,
        })

        // Značka uklizne s lijeve strane dok se hero scena kreće.
        // Trigger je element, ne selektor: useGSAP sa `scope` sužava selektore na svoj kontejner.
        const trigger = () => ({
          trigger: hero,
          start: 'top top',
          end: () => `+=${window.innerHeight * 0.5}`,
          scrub: 1,
          invalidateOnRefresh: true,
        })
        // Pikseli, ne procenti: GSAP početni CSS transform čita kao piksele i procenti se ne poklope.
        gsap.fromTo(badge, { x: -180 }, { x: 0, ease: 'none', scrollTrigger: trigger() })
      })

      // Čeka se učitavanje fonta, inače se širina mjeri na rezervnom fontu.
      document.fonts.ready.then(boot)

      return () => {
        dead = true
        if (onResize) window.removeEventListener('resize', onResize)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      {/* Wordmark: fiksan iza sadržaja (z-5). Klase slika i hero prolaze preko njega. */}
      <div
        data-brand-band
        className="pointer-events-none fixed inset-x-0 top-0 z-[5] select-none pt-4 text-center transition-colors duration-300"
        style={{ height: 'var(--story-header)' }}
      >
        <h1
          data-wordmark
          className="invisible inline-block whitespace-nowrap font-bold uppercase leading-none text-ink"
          style={{ fontSize: 'var(--wm-fs)' }}
        >
          {BRAND}
        </h1>
      </div>

      {/* Značka: uklizne tek kad hero počne da se kreće. */}
      <div
        data-badge
        className="pointer-events-none fixed left-[34px] top-1/2 z-[500] w-[44px] -translate-y-1/2 mix-blend-difference"
        style={{ transform: 'translateX(-180px)', color: DIFF }}
      >
        <BadgeMark />
      </div>
    </div>
  )
}
