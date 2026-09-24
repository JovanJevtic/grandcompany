'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, EV, prefersReducedMotion } from '@/lib/motion'
import { scrollToTarget } from '@/lib/scroll'
import { useShop } from '@/components/shop/ShopProvider'

// Riječ u kojoj je svako slovo u maski sa dvije kopije; na hover se slova redom prevrnu (CSS u globals.css).
function Roll({ text }: { text: string }) {
  return (
    <span className="roll" aria-label={text}>
      {[...text].map((ch, i) => {
        const c = ch === ' ' ? ' ' : ch
        return (
          <span key={i} className="c" aria-hidden style={{ '--i': i } as CSSProperties}>
            <span>{c}</span>
            <span>{c}</span>
          </span>
        )
      })}
    </span>
  )
}

// Linkovi vode na sekcije ispod heroja (glatki skrol radi Lenis). "Kontakt" u heroju otvara kontakt, a dalje niz
// stranicu vodi na podnožje.
// Sredina: Ponuda (a na širokom ekranu i Materijali, Cijene). Desno: Sačuvano i Poređenje (iz grand-root), Kontakt, Korpa.
const CENTER = [
  { label: 'Ponuda', href: '#ponuda', xl: false },
  { label: 'Materijali', href: '#materijali', xl: true },
  { label: 'Cijene', href: '#cijene', xl: true },
]

export default function Nav() {
  const root = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const { count, setCartOpen, saved, compare, setPanel } = useShop()

  // Stavke navigacije se pojave tek kad se loader završi.
  useGSAP(
    () => {
      const items = root.current!.querySelectorAll('[data-navitem]')
      const show = () => gsap.to(items, { autoAlpha: 1, duration: 1, ease: EASE.out, stagger: 0.08 })
      if (prefersReducedMotion() || document.documentElement.dataset.ready === '1') {
        gsap.set(items, { autoAlpha: 1 })
        return
      }
      gsap.set(items, { autoAlpha: 0 })
      window.addEventListener(EV.ready, show, { once: true })
      return () => window.removeEventListener(EV.ready, show)
    },
    { scope: root },
  )

  useEffect(() => {
    const on = (e: Event) => setOpen(!!(e as CustomEvent<boolean>).detail)
    window.addEventListener(EV.contact, on)
    return () => window.removeEventListener(EV.contact, on)
  }, [])

  const toggle = (v: boolean) => window.dispatchEvent(new CustomEvent(EV.contact, { detail: v }))

  return (
    <header ref={root} className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[88px] mix-blend-difference">
      <a
        href="#"
        className="pointer-events-auto absolute left-5 top-[15px] text-[30px] max-sm:text-[25px] font-medium lowercase leading-[48px] tracking-[-0.035em] text-fg"
        onClick={(e) => {
          e.preventDefault()
          if (open) toggle(false)
          else scrollToTarget(0)
        }}
      >
        grand company
      </a>

      <nav
        aria-label="Glavna navigacija"
        className={`transition-opacity duration-500 ${open ? 'pointer-events-none opacity-0' : ''}`}
      >
        <div className="absolute left-1/2 top-[37px] flex -translate-x-1/2 gap-8 text-fg max-lg:hidden">
          {CENTER.map(({ label, href, xl }) => (
            <a data-navitem key={label} href={href} className={`pointer-events-auto ${xl ? 'max-xl:hidden' : ''}`}>
              <Roll text={label} />
            </a>
          ))}
        </div>
        <div className="absolute right-5 top-[37px] flex gap-10 text-fg max-lg:gap-6">
          <button data-navitem type="button" className="pointer-events-auto max-md:hidden" onClick={() => setPanel('saved')}>
            <Roll text={`Sačuvano (${saved.length})`} />
          </button>
          <button data-navitem type="button" className="pointer-events-auto max-md:hidden" onClick={() => setPanel('compare')}>
            <Roll text={`Poređenje (${compare.length})`} />
          </button>
          <a
            data-navitem
            href="#kontakt"
            className="pointer-events-auto"
            onClick={(e) => {
              // u heroju se otvara kontakt (pikselizirani prsten), a niže na stranici Lenis vodi do podnožja
              if (window.scrollY < window.innerHeight * 0.4) {
                e.preventDefault()
                toggle(true)
              }
            }}
          >
            <Roll text="Kontakt" />
          </a>
          <button
            data-navitem
            type="button"
            aria-label={`Korpa (${count})`}
            className="pointer-events-auto"
            onClick={() => setCartOpen(true)}
          >
            <Roll text={`Korpa (${count})`} />
          </button>
        </div>
        {/* na mobilnom Sačuvano i Poređenje idu u drugi red, ispod Kontakta i Korpe */}
        <div className="absolute right-5 top-[62px] flex gap-6 text-fg md:hidden">
          <button data-navitem type="button" className="pointer-events-auto" onClick={() => setPanel('saved')}>
            <Roll text={`Sačuvano (${saved.length})`} />
          </button>
          <button data-navitem type="button" className="pointer-events-auto" onClick={() => setPanel('compare')}>
            <Roll text={`Poređenje (${compare.length})`} />
          </button>
        </div>
      </nav>

      {/* Zatvaranje kontakta: mali serifni "Zatvori" gore desno */}
      <button
        type="button"
        onClick={() => toggle(false)}
        className={`absolute right-[55px] top-[76px] font-serif text-[16px] leading-none text-fg transition-opacity duration-700 max-md:right-5 ${
          open ? 'pointer-events-auto opacity-100 delay-700' : 'pointer-events-none opacity-0'
        }`}
      >
        Zatvori
      </button>
    </header>
  )
}
