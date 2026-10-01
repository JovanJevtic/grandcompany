'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { pw } from '@/components/ui/Pw'
import { cartCount, openCart, useShop } from '@/lib/cart'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'

const NAV = [
  ['Prodavnica', '/prodavnica'],
  ['Objave', '/objave'],
  ['Kontakt', '/#kontakt'],
] as const

// Header: logo lijevo, tri linka u sredini, korpa desno. Bez mix-blend efekata (oni su pravili
// "prljave" boje preko slika). Sakrije se kad se skrola nadolje, vrati kad se krene nagore.
// Na početnoj (variant="overlay") se pojavljuje tek kad veliki wordmark iz herosa ode (globals.css).
export default function SiteHeader({ variant }: { variant: 'inner' | 'overlay' }) {
  const header = useRef<HTMLElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { cart } = useShop()
  const count = cartCount(cart)

  useGSAP(
    () => {
      let last = window.scrollY
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        const onScroll = () => {
          const y = window.scrollY
          if (Math.abs(y - last) < 6) return
          const hidden = !open && y > last && y > 160
          gsap.to(header.current, { yPercent: hidden ? -100 : 0, duration: reduce ? 0 : 0.6, ease: EASE.quint, overwrite: 'auto' })
          header.current?.toggleAttribute('data-solid', y > 40)
          last = y
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
      })
    },
    { scope: header, dependencies: [open] },
  )

  useGSAP(
    () => {
      const panel = menu.current?.querySelector('[data-panel]')
      const links = menu.current?.querySelectorAll('[data-menu-link]')
      if (!panel || !links) return
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        gsap.to(panel, { clipPath: open ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', duration: reduce ? 0 : 0.9, ease: EASE.quintInOut })
        gsap.fromTo(
          links,
          { yPercent: open ? 110 : 0 },
          { yPercent: open ? 0 : 110, duration: reduce ? 0 : 0.9, ease: EASE.quint, stagger: 0.06, delay: open && !reduce ? 0.25 : 0 },
        )
      })
    },
    { scope: menu, dependencies: [open] },
  )

  const active = (href: string) => !href.includes('#') && (pathname === href || pathname.startsWith(`${href}/`))

  return (
    <>
      <header
        ref={header}
        data-variant={variant}
        className={`site-header fixed inset-x-0 top-0 z-[300] ${open ? 'is-open' : ''}`}
      >
        <div className="grid h-[72px] grid-cols-[1fr_auto_1fr] items-center px-5 md:px-10">
          <Link href="/" className="font-pretty justify-self-start whitespace-nowrap text-[15px] uppercase leading-none tracking-[0.06em] md:text-[17px]" aria-label="Grand Company, početna">
            Grand Company
          </Link>

          <nav className="hidden items-center gap-10 text-[15px] md:flex" aria-label="Glavni meni">
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} className="relative flex items-center gap-2">
                <span className={`spark absolute -left-4 size-2.5 transition-transform duration-500 ${active(href) ? 'scale-100' : 'scale-0'}`} />
                <span className="ulink">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6 justify-self-end text-[15px]">
            <button onClick={openCart} className="flex items-center gap-2" aria-label={`Korpa, ${count} artikala`}>
              <span className="ulink">Korpa</span>
              <span
                className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[12px] tabular-nums transition-colors ${
                  count ? 'bg-signal text-bg' : 'border border-ink/25'
                }`}
              >
                {count}
              </span>
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="flex h-10 items-center gap-2 md:hidden"
            >
              <span className="relative block h-2.5 w-6" aria-hidden>
                <i className={`absolute left-0 h-px w-full bg-current transition-transform duration-500 ${open ? 'top-1/2 rotate-45' : 'top-0'}`} />
                <i className={`absolute left-0 h-px w-full bg-current transition-transform duration-500 ${open ? 'top-1/2 -rotate-45' : 'bottom-0'}`} />
              </span>
              <span className="sr-only">{open ? 'Zatvori meni' : 'Meni'}</span>
            </button>
          </div>
        </div>
      </header>

      <div ref={menu} id="site-menu" className={`fixed inset-0 z-[290] md:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div data-panel className="flex h-full flex-col justify-end bg-ink px-5 pb-12 text-bg" style={{ clipPath: 'inset(0% 0% 100% 0%)' }}>
          {[['Početna', '/'] as const, ...NAV].map(([label, href]) => (
            <span key={href} className="block overflow-hidden">
              <Link data-menu-link href={href} onClick={() => setOpen(false)} className="font-pretty block py-1 text-[15vw] leading-[1.05] tracking-[-0.01em]">
                {pw(label)}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
