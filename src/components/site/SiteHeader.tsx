'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cartCount, openCart, useShop } from '@/lib/cart'
import { setMode, useB2B } from '@/lib/b2b'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { pw } from '@/components/ui/Pw'
import LogoMark from './LogoMark'

// Navbar cijelog sajta: linkovi lijevo, logo (znak + GRAND COMPANY) u sredini, desno crveni
// "Kupuj" i korpa kao ikonica (na hover iza nje izraste crveni romb). Na telefonu: tri crte
// lijevo (meni preko cijelog ekrana), logo u sredini, korpa desno.
//
// variant="home": tokom herosa traka stoji ispod velikog wordmarka, a logo u sredini je prazan.
// Kad se pređe hero, SiteChrome "spusti" veliki wordmark u sredinu trake (smanji ga tačno na
// mjesto ovog logotipa) i postavi html[data-wm-docked] — tek tada se logo ovdje pokaže.
// variant="inner": traka je na vrhu i logo se vidi odmah.

const LINKS = [
  ['Prodavnica', '/prodavnica'],
  ['Kalkulator', '/kalkulator'],
  ['Isporuka', '/dostava'],
  ['Vodiči', '/vodici'],
] as const

const MENU = [['Početna', '/'], ...LINKS, ['Kontakt', '/#kontakt']] as const

// Preklopnik načina: Maloprodaja (B2C) / B2B portal. Svaka strana uvijek nekud vodi:
// Maloprodaja → asortiman artikala u prodavnici (/prodavnica#artikli), B2B portal → /portal
// (bez prijave otvara prijavu, a ona posle vodi u portal — lib/b2b, LoginModal).
// Aktivna strana prati stranicu: u portalu je B2B, u prodavnici Maloprodaja, inače izabrani način.
function ModeSwitch({ mode, discount }: { mode: 'b2c' | 'b2b'; discount: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const { partner } = useB2B()
  const active = pathname.startsWith('/portal') ? 'b2b' : pathname.startsWith('/prodavnica') ? 'b2c' : mode
  const toShop = () => {
    setMode('b2c')
    const target = document.getElementById('artikli')
    if (pathname.startsWith('/prodavnica') && target) window.__gcLenis?.scrollTo(target.getBoundingClientRect().top + window.scrollY - 90)
    else router.push('/prodavnica#artikli')
  }
  const toPortal = () => {
    setMode('b2b')
    if (partner) router.push('/portal')
  }
  return (
    <div className="mode" role="group" aria-label="Način kupovine">
      <button type="button" aria-pressed={active === 'b2c'} onClick={toShop} className="mode__opt">
        Maloprodaja
      </button>
      <button type="button" aria-pressed={active === 'b2b'} onClick={toPortal} className="mode__opt">
        B2B portal{discount > 0 && <span className="mode__badge">−{Math.round(discount * 100)}%</span>}
      </button>
    </div>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="nav__cart-icon" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
      <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  )
}

export default function SiteHeader({ variant }: { variant: 'inner' | 'overlay' | 'home' }) {
  const home = variant !== 'inner'
  const header = useRef<HTMLElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { cart } = useShop()
  const count = cartCount(cart)
  const { mode, partner, discount } = useB2B()

  // Zaključaj skrol dok je meni otvoren
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (open) window.__gcLenis?.stop?.()
    else window.__gcLenis?.start?.()
  }, [open])

  // Unutrašnje stranice: traka se sakrije kad se skrola nadolje, vrati kad se krene nagore.
  useGSAP(
    () => {
      if (home) return
      let last = window.scrollY
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        const onScroll = () => {
          const y = window.scrollY
          if (Math.abs(y - last) < 6) return
          const hidden = !open && y > last && y > 160
          gsap.to(header.current, { yPercent: hidden ? -100 : 0, duration: reduce ? 0 : 0.6, ease: EASE.quint, overwrite: 'auto' })
          last = y
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
      })
    },
    { scope: header, dependencies: [open, home] },
  )

  // Meni preko cijelog ekrana: zavjesa odozgo, stavke izranjaju jedna za drugom.
  useGSAP(
    () => {
      const panel = menu.current?.querySelector('[data-panel]')
      const items = menu.current?.querySelectorAll('[data-item]')
      if (!panel || !items) return
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        gsap.to(panel, { clipPath: open ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', duration: reduce ? 0 : 0.8, ease: EASE.quintInOut })
        gsap.fromTo(
          items,
          { yPercent: open ? 60 : 0, autoAlpha: open ? 0 : 1 },
          { yPercent: open ? 0 : 30, autoAlpha: open ? 1 : 0, duration: reduce ? 0 : 0.7, ease: EASE.quint, stagger: 0.05, delay: open && !reduce ? 0.25 : 0 },
        )
      })
    },
    { scope: menu, dependencies: [open] },
  )

  const active = (href: string) => !href.includes('#') && href !== '/' && (pathname === href || pathname.startsWith(`${href}/`))

  return (
    <>
      <header ref={header} className={`nav ${home ? 'nav--home' : 'nav--inner'} ${open ? 'is-open' : ''}`}>
        <div className="nav__bar">
          {/* lijevo: linkovi (desktop) / tri crte (telefon) */}
          <div className="nav__side">
            <ul className="nav__links">
              {LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className={`nav__link ${active(href) ? 'is-active' : ''}`}>
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="nav__burger"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Zatvori meni' : 'Otvori meni'}
            >
              <i />
              <i />
              <i />
            </button>
          </div>

          {/* sredina: logo */}
          <Link href="/" className="nav__logo" aria-label="Grand Company, početna" onClick={() => setOpen(false)}>
            <LogoMark className="nav__mark" />
            <span data-nav-word className="nav__word font-hero">
              Grand Company
            </span>
          </Link>

          {/* desno: Kupuj + korpa */}
          <div className="nav__side nav__side--end">
            <span className="nav__mode-desk">
              <ModeSwitch mode={mode} discount={discount} />
            </span>
            <Link href="/prodavnica" className="nav__buy">
              Kupuj
              <svg viewBox="0 0 24 12" className="nav__buy-arrow" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                <path d="M0 6h22M17 1l5 5-5 5" />
              </svg>
            </Link>
            <button type="button" onClick={openCart} className="nav__cart" aria-label={`Korpa, ${count} artikala`}>
              <span className="nav__cart-bg" aria-hidden />
              <CartIcon />
              {count > 0 && <span className="nav__cart-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Meni preko cijelog ekrana (tri crte): sekcije centrirane, odvojene linijama */}
      <div ref={menu} id="site-menu" className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div data-panel className="menu__panel" style={{ clipPath: 'inset(0% 0% 100% 0%)' }}>
          <div data-item className="menu__mode">
            <ModeSwitch mode={mode} discount={discount} />
            {partner && <p className="menu__partner">{partner.name}</p>}
          </div>
          <nav className="menu__list" aria-label="Meni">
            {MENU.map(([label, href]) => (
              <Link key={href} data-item href={href} onClick={() => setOpen(false)} className="menu__item">
                {pw(label)}
              </Link>
            ))}
          </nav>
          <div data-item className="menu__foot">
            <Link href="/prodavnica" onClick={() => setOpen(false)} className="nav__buy nav__buy--big">
              Kupuj
            </Link>
            <a href="tel:+38765516696" className="menu__tel">
              065 516-696
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
