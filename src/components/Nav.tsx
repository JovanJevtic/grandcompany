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
const RIGHT = [
  { label: 'Materijali', href: '#materijali' },
  { label: 'Cijene', href: '#cijene' },
  { label: 'Kontakt', href: '#kontakt' },
]

export default function Nav() {
  const root = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const { count, setCartOpen } = useShop()

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
        className="pointer-events-auto absolute left-5 top-[15px] text-[30px] font-medium lowercase leading-[48px] tracking-[-0.035em] text-fg"
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
        <a
          data-navitem
          href="#ponuda"
          className="pointer-events-auto absolute left-1/2 top-[37px] -translate-x-1/2 text-fg max-md:hidden"
        >
          <Roll text="Ponuda" />
        </a>
        <div className="absolute right-5 top-[37px] flex gap-10 text-fg max-lg:gap-6">
          {RIGHT.map(({ label, href }) => {
            const contact = label === 'Kontakt'
            return (
              <a
                data-navitem
                key={label}
                href={href}
                className={`pointer-events-auto ${contact ? '' : 'max-lg:hidden'}`}
                onClick={(e) => {
                  // u heroju se otvara kontakt (pikselizirani prsten), a niže na stranici Lenis vodi do podnožja
                  if (contact && window.scrollY < window.innerHeight * 0.4) {
                    e.preventDefault()
                    toggle(true)
                  }
                }}
              >
                <Roll text={label} />
              </a>
            )
          })}
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
