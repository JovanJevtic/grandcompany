'use client'

import Link from 'next/link'
import { cartCount, openCart, useShop } from '@/lib/cart'

// Navigaciona traka početne strane. Dvije linije preko CIJELE širine čine traku; unutra je
// sedam jednakih ćelija (tekst centriran i vodoravno i uspravno), u sredini crveni romb "Kupuj".
// Tokom herosa stoji odmah ispod velikog wordmarka; kad wordmark ode (html[data-past-hero],
// postavlja SiteChrome), traka klizne na vrh stranice i tamo ostaje zalijepljena.
// Pozicija se mijenja samo preko transform-a (GPU), pa nema trzanja pri skrolu.
const LEFT = [
  ['Prodavnica', '/prodavnica'],
  ['Kalkulator', '/prodavnica#kalkulator'],
  ['Isporuka', '/dostava'],
] as const
const RIGHT = [
  ['Objave', '/objave'],
  ['Kontakt', '/#kontakt'],
] as const

export default function HeroNav() {
  const { cart } = useShop()
  const count = cartCount(cart)

  return (
    <nav className="hero-nav" aria-label="Glavna navigacija">
      <div className="hero-nav__row">
        {LEFT.map(([label, href], i) => (
          <Link key={href} href={href} className={`hero-nav__cell ${i === 0 ? '' : 'hero-nav__desk'}`}>
            <span className="hero-nav__label">{label}</span>
          </Link>
        ))}
        <div className="hero-nav__cell hero-nav__cell--buy">
          <Link href="/prodavnica" className="hero-nav__buy">
            Kupuj
          </Link>
        </div>
        {RIGHT.map(([label, href]) => (
          <Link key={href} href={href} className="hero-nav__cell hero-nav__desk">
            <span className="hero-nav__label">{label}</span>
          </Link>
        ))}
        <button type="button" onClick={openCart} className="hero-nav__cell" aria-label={`Korpa, ${count} artikala`}>
          <span className="hero-nav__label">
            Korpa <span className="tabular-nums opacity-60">({count})</span>
          </span>
        </button>
      </div>
    </nav>
  )
}
