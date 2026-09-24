'use client'

import { useRef } from 'react'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { EASE, INTRO, SIDE, fitFontSize } from '@/lib/motion'
import BadgeMark from './BadgeMark'

export const BRAND = 'GRAND COMPANY'
const MARQUEE_ITEM = `Od 2012. ${BRAND} građevinski materijal`

// Boja koja u `mix-blend-mode: difference` na krem pozadini daje tačno boju teksta (#222A36).
const DIFF = 'rgb(220, 203, 195)'

// Elementi koji stoje fiksno preko cijele stranice: wordmark, značka i marquee.
export default function SiteChrome() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!
      const wm = el.querySelector<HTMLElement>('[data-wordmark]')!
      const badge = el.querySelector<HTMLElement>('[data-badge]')!
      const marquee = el.querySelector<HTMLElement>('[data-marquee]')!
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

        if (reduce) {
          gsap.set([badge, marquee], { x: 0, y: 0 })
          return
        }

        gsap.from(split.chars, {
          yPercent: 160,
          duration: 1.2,
          ease: EASE.quint,
          stagger: 0.05,
          delay: INTRO.letters,
        })

        // Značka uklizne s lijeve strane, a marquee iz dna, dok se hero okvir širi.
        // Trigger je element, ne selektor: useGSAP sa `scope` sužava selektore na svoj kontejner.
        const hero = document.getElementById('hero')!
        const trigger = () => ({
          trigger: hero,
          start: 'top top',
          end: () => `+=${window.innerHeight * 0.5}`,
          scrub: 1,
          invalidateOnRefresh: true,
        })
        gsap.fromTo(badge, { x: -180 }, { x: 0, ease: 'none', scrollTrigger: trigger() })
        // Pikseli, ne procenti: GSAP početni CSS transform čita kao piksele i procenti se ne poklope.
        gsap.fromTo(marquee, { y: 200 }, { y: 0, ease: 'none', scrollTrigger: trigger() })
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
      {/* Wordmark: fiksan iza sadržaja (z-5). Slike i hero prolaze preko njega. */}
      <div className="pointer-events-none fixed left-0 top-4 z-[5] w-full select-none text-center">
        <h1
          data-wordmark
          className="invisible inline-block whitespace-nowrap font-bold uppercase leading-none text-ink"
          style={{ fontSize: 'var(--wm-fs)' }}
        >
          {BRAND}
        </h1>
      </div>

      {/* Značka: uklizne tek kad hero počne da se širi. */}
      <div
        data-badge
        className="pointer-events-none fixed left-[34px] top-1/2 z-[500] w-[44px] -translate-y-1/2 mix-blend-difference"
        style={{ transform: 'translateX(-180px)', color: DIFF }}
      >
        <BadgeMark />
      </div>

      {/* Marquee: mix-blend-difference pa je taman na svijetloj, a svijetao na tamnoj pozadini. */}
      <div
        data-marquee
        className="pointer-events-none fixed bottom-0 left-0 z-[200] h-[100px] w-full overflow-hidden mix-blend-difference"
        style={{ transform: 'translateY(200px)', color: DIFF }}
        aria-hidden
      >
        <div className="absolute bottom-5 left-0 flex w-full">
          <div className="animate-marquee inline-flex shrink-0 whitespace-nowrap text-base leading-none">
            {[0, 1].map((copy) => (
              <div key={copy} className="inline-flex shrink-0 items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className="inline-flex items-center">
                    <span>{MARQUEE_ITEM}</span>
                    <span className="mx-[35px] inline-block h-[2px] w-[52px] bg-current" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
