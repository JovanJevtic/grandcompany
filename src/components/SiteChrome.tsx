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
        // U dev-u se efekat montira dvaput, pa se drugo razdvajanje preskače (ono na već
        // razdvojenom wordmarku ne nađe tekst).
        if (!wm.querySelector('.ch')) SplitText.create(wm, { type: 'chars', mask: 'chars', charsClass: 'ch' })
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

        // Wordmark i značka pripadaju herosu. Kad bijeli list prekrije nebo (vrh sekcije #radovi
        // uđe u ekran), slova odlaze naviše kroz masku, a gore lijevo ostaje mali znak. Nazad — obrnuto.
        const after = document.getElementById('radovi')
        // Pri povratku na početnu (klijentska navigacija) kreće se od herosa.
        document.documentElement.removeAttribute('data-past-hero')
        // Dok su slova sklonjena, uvodna animacija (i njen sigurnosni tajmer) ih ne smije vratiti.
        let gone = false
        if (after) {
          const html = document.documentElement
          // Veliki wordmark ne nestaje: smanji se i "sleti" tačno na mjesto logotipa u sredini
          // navbara (FLIP: izmjeri početak i cilj, pa animiraj transform). Navbar u istom trenutku
          // klizne na vrh, pa se cilj računa za njegov krajnji položaj (top = 0).
          const leave = (out: boolean) => {
            gone = out
            html.toggleAttribute('data-past-hero', out)
            const target = document.querySelector<HTMLElement>('.nav--home [data-nav-word]')
            const nav = document.querySelector<HTMLElement>('.nav--home')
            gsap.killTweensOf(wm)
            if (!out) html.removeAttribute('data-wm-docked')
            if (!target || !nav) {
              gsap.to(wm, { autoAlpha: out ? 0 : 1, duration: 0.4 })
              return
            }
            const dock = () => {
              html.setAttribute('data-wm-docked', '')
              gsap.set(wm, { autoAlpha: 0 })
            }
            // izmjeri wordmark bez trenutnog transforma (pa vrati — isti kadar, ništa ne trepne)
            const cur = { x: gsap.getProperty(wm, 'x'), y: gsap.getProperty(wm, 'y'), scale: gsap.getProperty(wm, 'scale') }
            gsap.set(wm, { x: 0, y: 0, scale: 1 })
            const w = wm.getBoundingClientRect()
            gsap.set(wm, cur)
            const t = target.getBoundingClientRect()
            const n = nav.getBoundingClientRect()
            const to = {
              x: t.left + t.width / 2 - (w.left + w.width / 2),
              y: t.top - n.top + t.height / 2 - (w.top + w.height / 2),
              scale: t.width / w.width,
            }
            gsap.set(wm, { autoAlpha: 1, transformOrigin: '50% 50%' })
            if (reduce) {
              if (out) dock()
              else gsap.set(wm, { x: 0, y: 0, scale: 1 })
              gsap.set(badge, { autoAlpha: out ? 0 : 1 })
              return
            }
            gsap.to(wm, {
              ...(out ? to : { x: 0, y: 0, scale: 1 }),
              duration: 0.9,
              ease: 'power3.inOut',
              onComplete: out ? dock : undefined,
            })
            // Naslov u heroju i logo u navbaru su isti font (debeli sans), pa se naslov samo smanji
            // tačno u logo; na kraju (dock) ga zamijeni pravi logo, bez vidljive razlike.
            gsap.to(badge, { autoAlpha: out ? 0 : 1, duration: 0.4, overwrite: 'auto' })
          }
          ScrollTrigger.create({
            trigger: after,
            start: 'top 92%',
            onEnter: () => leave(true),
            onLeaveBack: () => leave(false),
          })
        }

        if (reduce) {
          gsap.set(badge, { x: 0, y: 0 })
          return
        }

        // Slova wordmarka izranjaju tek kad se uvodni splash skloni — inače se animacija
        // potroši za zavjesom. Ako splasha nema (ili je već gotov), ide odmah.
        const letters = () => {
          // Chars se čitaju iz DOM-a u trenutku animacije: SplitText pri ponovnom
          // razdvajanju (font, promjena širine) zamijeni elemente novima, pa bi
          // sačuvani niz ostao prazan.
          const chars = gsap.utils.toArray<HTMLElement>('.ch', wm)
          if (!chars.length) return
          // Na kraju se transformacija sklanja, pa slova ostaju čista i ako je animaciju
          // prekinuo zastoj glavne niti ili ponovno montiranje komponente.
          const clear = () => {
            if (!gone) gsap.set(chars, { clearProps: 'transform' })
          }
          if (gone) return
          gsap.fromTo(
            chars,
            { yPercent: 160 },
            {
              yPercent: 0,
              duration: 1.2,
              ease: EASE.quint,
              stagger: 0.05,
              delay: INTRO.letters,
              onComplete: clear,
            },
          )
          // Sigurnosna mreža: slova se pokažu i ako tween iz bilo kog razloga ne stigne do kraja.
          window.setTimeout(clear, (INTRO.letters + 1.2 + 0.5) * 1000)
        }
        if (!document.querySelector('[data-splash]') || document.documentElement.dataset.gcSplash === 'done')
          letters()
        else window.addEventListener('gc:splash-done', letters, { once: true })
        // Značka uklizne s desne strane dok se hero scena kreće.
        // Trigger je element, ne selektor: useGSAP sa `scope` sužava selektore na svoj kontejner.
        const trigger = () => ({
          trigger: hero,
          start: 'top top',
          end: () => `+=${window.innerHeight * 0.5}`,
          scrub: 1,
          invalidateOnRefresh: true,
        })
        // Pikseli, ne procenti: GSAP početni CSS transform čita kao piksele i procenti se ne poklope.
        gsap.fromTo(badge, { x: 180 }, { x: 0, ease: 'none', scrollTrigger: trigger() })
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
        className="pointer-events-none fixed inset-x-0 top-0 z-[340] select-none pt-4 text-center"
        style={{ height: 'var(--story-header)' }}
      >
        <h1
          data-wordmark
          className="font-hero invisible inline-block whitespace-nowrap uppercase leading-none"
          style={{ fontSize: 'var(--wm-fs)' }}
        >
          {BRAND}
        </h1>
      </div>

      {/* Mali znak gore lijevo: zamjenjuje veliki wordmark kad se pređe hero. `difference` ga drži
          čitljivim i na bijelom i na tamno plavom. */}
      <button
        type="button"
        data-mini
        onClick={() => window.__gcLenis?.scrollTo(0)}
        className="invisible fixed left-5 top-4 z-[150] hidden text-[15px] font-bold uppercase leading-none tracking-[-0.01em] text-white mix-blend-difference md:left-[3.05vw] md:top-5 md:text-[17px]"
        aria-label="Na vrh stranice"
      >
        {BRAND}
      </button>

      {/* Značka (desno): uklizne tek kad hero počne da se kreće. */}
      <div
        data-badge
        className="pointer-events-none fixed right-3 top-1/2 z-[500] w-[30px] -translate-y-1/2 mix-blend-difference md:right-[34px] md:w-[44px]"
        style={{ transform: 'translateX(180px)', color: DIFF }}
      >
        <BadgeMark />
      </div>
    </div>
  )
}
