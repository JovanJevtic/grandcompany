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
      let onZone: (() => void) | null = null
      let onCleanup: (() => void) | null = null
      // Kad se scena učita, visine sekcija se promijene pa GSAP triggeri moraju da se izmjere ponovo.
      const onCraneReady = () => {
        onZone?.()
        ScrollTrigger.refresh()
      }

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

        // Wordmark lebdi iznad svega i mijenja boju prema sadržaju ispod sebe:
        // bijel preko tamne 3D scene i preko tamnog podnožja, tamno smeđ preko krem sekcija.
        const hero = document.getElementById('hero')!
        const footer = document.getElementById('kontakt')
        const zone = () => {
          const line = band.offsetHeight
          const light = footer ? footer.getBoundingClientRect().top < line : false
          const overScene = hero ? hero.getBoundingClientRect().bottom > line : false
          band.classList.toggle('brand-light', light)
          band.classList.toggle('brand-dark', !light && !overScene)
        }
        // Provjera ide i na skrol i na kratak interval: `scroll` event ne stiže uvijek
        // (smooth scroll), a rAF/GSAP ticker znaju da spavaju. Interval je 4x u sekundi,
        // a mjerenje je jeftino — `classList.toggle` ne dira DOM dok se stanje ne promijeni.
        const tick = () => zone()
        const timer = window.setInterval(tick, 250)
        window.addEventListener('scroll', tick, { passive: true })
        window.addEventListener('resize', tick)
        onZone = () => zone()
        onCleanup = () => {
          window.clearInterval(timer)
          window.removeEventListener('scroll', tick)
          window.removeEventListener('resize', tick)
        }
        zone()
        // Scena se učitava posle prvog mjerenja i tada se visine sekcija promijene,
        // pa se i GSAP triggeri moraju ponovo izmjeriti.
        window.addEventListener('gc:crane-ready', onCraneReady, { once: true })

        if (reduce) {
          gsap.set(badge, { x: 0, y: 0 })
          return
        }

        // Slova wordmarka izranjaju tek kad se uvodni splash skloni — inače se animacija
        // potroši za zavjesom. Ako splasha nema (ili je već gotov), ide odmah.
        const letters = () =>
          gsap.from(split.chars, {
            yPercent: 160,
            duration: 1.2,
            ease: EASE.quint,
            stagger: 0.05,
            delay: INTRO.letters,
          })
        if (!document.querySelector('[data-splash]') || document.documentElement.dataset.gcSplash === 'done')
          letters()
        else window.addEventListener('gc:splash-done', letters, { once: true })
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
        if (onCleanup) onCleanup()
        window.removeEventListener('gc:crane-ready', onCraneReady)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      {/* Wordmark: fiksiran iznad svih sekcija (z-150) i providan — lebdi preko 3D scene
          i preko sadržaja dok se skrola. Boju mijenja skrol (bijel / tamno smeđ). */}
      <div
        data-brand-band
        className="pointer-events-none fixed inset-x-0 top-0 z-[150] select-none pt-4 text-center"
        style={{ height: 'var(--story-header)' }}
      >
        <h1
          data-wordmark
          className="invisible inline-block whitespace-nowrap font-bold uppercase leading-none"
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
