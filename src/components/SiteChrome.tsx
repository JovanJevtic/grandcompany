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
        // Slova su odmah ispod maske: naslov se ne smije vidjeti prije pozadine.
        if (!reduce) gsap.set(gsap.utils.toArray<HTMLElement>('.ch', wm), { yPercent: 160 })
        document.documentElement.removeAttribute('data-intro-done')
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
          }
          ScrollTrigger.create({
            trigger: after,
            start: 'top 92%',
            onEnter: () => leave(true),
            onLeaveBack: () => leave(false),
          })
        }

        const html = document.documentElement
        // Navbar se pokaže tek posle naslova (redosljed: pozadina → naslov → navbar; vidi globals.css).
        const navIn = () => html.setAttribute('data-intro-done', '')
        if (reduce) {
          navIn()
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
          if (gone) {
            navIn()
            return
          }
          window.setTimeout(navIn, (INTRO.letters + 0.9) * 1000)
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
        // Slova kreću tek kad su i splash i 3D scena gotovi (pozadina se vidi prva). Ako se scena
        // ne digne za 3,5 s posle splasha, slova ipak krenu.
        let started = false
        const go = () => {
          if (started) return
          started = true
          letters()
        }
        const afterSplash = () => {
          if (window.__gcCraneReady) go()
          else {
            window.addEventListener('gc:crane-ready', () => window.setTimeout(go, 250), { once: true })
            window.setTimeout(go, 3500)
          }
        }
        // Slova izranjaju dok se zavjesa podiže (ne poslije), pa prvi kadar ispod nije prazan.
        if (!document.querySelector('[data-splash]') || html.dataset.gcSplash === 'done' || document.querySelector('.splash.lift')) afterSplash()
        else {
          window.addEventListener('gc:splash-lift', afterSplash, { once: true })
          window.addEventListener('gc:splash-done', afterSplash, { once: true })
        }
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

      {/* Mali GC znak, stalno zakačen dole desno; vodi na sekciju sa artiklima. */}
      <a
        data-badge
        href="#najcesce"
        onClick={(e) => {
          const target = document.getElementById('najcesce')
          if (!target || !window.__gcLenis) return
          e.preventDefault()
          window.__gcLenis.scrollTo(target.getBoundingClientRect().top + window.scrollY - 80)
        }}
        aria-label="Artikli na stanju"
        className="fixed bottom-4 right-4 z-[500] block w-[22px] mix-blend-difference transition-transform duration-300 hover:scale-110 md:bottom-6 md:right-6 md:w-[28px]"
        style={{ color: DIFF }}
      >
        <BadgeMark />
      </a>
    </div>
  )
}
