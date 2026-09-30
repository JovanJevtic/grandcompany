'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { cartCount, openCart, useShop } from '@/lib/cart'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'

const NAV = [
  ['Početna', '/'],
  ['Prodavnica', '/prodavnica'],
  ['Objave', '/objave'],
  ['Kontakt', '/#kontakt'],
] as const

export default function SiteHeader({ variant }: { variant: 'inner' | 'overlay' }) {
  const header = useRef<HTMLElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { cart, saved } = useShop()
  const compact = variant === 'overlay'

  useGSAP(
    () => {
      if (variant !== 'inner') return
      let last = window.scrollY
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        document.documentElement.style.setProperty('--site-header-offset', '64px')
        const onScroll = () => {
          const y = window.scrollY
          if (!open && Math.abs(y - last) > 8) {
            const hidden = y > last && y > 100
            gsap.to(header.current, {
              yPercent: hidden ? -110 : 0,
              duration: reduce ? 0 : 0.45,
              ease: 'power3.out',
            })
            document.documentElement.style.setProperty('--site-header-offset', hidden ? '0px' : '64px')
          }
          last = y
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
          window.removeEventListener('scroll', onScroll)
          document.documentElement.style.removeProperty('--site-header-offset')
        }
      })
    },
    { scope: header, dependencies: [open, variant] },
  )

  useGSAP(
    () => {
      const cols = menu.current?.querySelectorAll('[data-wipe]')
      const links = menu.current?.querySelector('[data-menu-links]')
      if (!cols || !links) return
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        gsap.to(cols, {
          scaleY: open ? 1 : 0,
          stagger: open ? 0.035 : -0.025,
          duration: reduce ? 0 : 0.55,
          ease: reduce ? 'none' : 'steps(5)',
        })
        gsap.to(links, {
          autoAlpha: open ? 1 : 0,
          duration: reduce ? 0 : 0.25,
          delay: open && !reduce ? 0.28 : 0,
        })
      })
    },
    { scope: menu, dependencies: [open] },
  )

  const active = (href: string) => {
    if (href.includes('#')) return false
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      <header
        ref={header}
        className={`fixed inset-x-0 top-0 z-[300] ${
          compact
            ? 'pointer-events-none text-white mix-blend-difference'
            : 'border-b-2 border-ink bg-bg text-ink'
        }`}
      >
        <div className={`flex h-16 items-center gap-5 px-5 ${compact ? 'justify-end md:px-8' : 'justify-between md:px-[8.33vw]'}`}>
          {!compact && (
            <Link href="/" className="text-sm font-bold uppercase tracking-tight">
              Grand Company
            </Link>
          )}
          {!compact && (
            <nav className="hidden items-center gap-6 font-mono text-[11px] uppercase tracking-wider md:flex">
              {NAV.map(([label, href]) => (
                <Link key={href} href={href} className="flex min-h-10 items-center gap-2">
                  <span className={`text-accent ${active(href) ? '' : 'invisible'}`}>■</span>
                  {label}
                </Link>
              ))}
            </nav>
          )}
          <div className={`pointer-events-auto flex items-stretch border-2 ${compact ? 'border-white' : 'border-ink'}`}>
            {!compact && (
              <span className="hidden min-h-10 items-center border-r-2 border-current px-3 font-mono text-[11px] uppercase md:flex">
                Sačuvano {saved.length}
              </span>
            )}
            <button onClick={openCart} className="min-h-10 border-r-2 border-current px-3 font-mono text-[11px] uppercase">
              Korpa {cartCount(cart)}
            </button>
            <button
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="min-h-10 px-3 font-mono text-[11px] uppercase"
            >
              {open ? 'Zatvori' : 'Meni'}
            </button>
          </div>
        </div>
      </header>

      <div
        ref={menu}
        id="site-menu"
        className={`fixed inset-0 z-[290] ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }, (_, index) => (
            <span
              key={index}
              data-wipe
              className="h-full flex-1 origin-top bg-navy"
              style={{ transform: 'scaleY(0)' }}
            />
          ))}
        </div>
        <nav
          data-menu-links
          className="relative flex h-full flex-col justify-end gap-1 p-5 pb-10 text-bg opacity-0 md:p-[8.33vw]"
        >
          {NAV.map(([label, href], index) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="border-t border-bg/30 py-2 text-[clamp(42px,8vw,120px)] uppercase leading-[.9] tracking-[-.02em]"
            >
              <span className="mr-4 align-top font-mono text-xs text-accent">0{index + 1}</span>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
