'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cartCount, openCart, openPanel, useShop } from '@/lib/cart'
import { NAV } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'
import { Icon, type IconName } from './ui'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid size-8 place-items-center border border-current font-display text-[17px] font-black leading-none">G</span>
      <span className="font-display text-[15px] font-medium leading-none tracking-[-0.01em]">Grand Company</span>
    </span>
  )
}

function Count({ n }: { n: number }) {
  if (!n) return null
  return (
    <span
      key={n}
      className="bump absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center bg-ink px-1 text-[10px] font-medium leading-none text-canvas tnum"
    >
      {n}
    </span>
  )
}

// Ponos-style header: logo, section nav, "Zatražite ponudu", and the shop tools
// (search, saved, compare — grand-root panels; cart — maison CartDrawer).
export default function Header({ variant = 'home' }: { variant?: 'home' | 'page' }) {
  const { cart, saved, compare } = useShop()
  const scrollTo = useScrollTo()
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const go = (id: string) => (e: React.MouseEvent) => {
    if (variant !== 'home') return
    e.preventDefault()
    setMenu(false)
    scrollTo(id)
  }

  const tools: { label: string; icon: IconName; n?: number; onClick: () => void; hideSm?: boolean }[] = [
    { label: 'Pretraga', icon: 'search', onClick: () => openPanel({ kind: 'search' }) },
    { label: 'Sačuvano', icon: 'saved', n: saved.length, onClick: () => openPanel({ kind: 'saved' }), hideSm: true },
    { label: 'Poređenje', icon: 'compare', n: compare.length, onClick: () => openPanel({ kind: 'compare' }), hideSm: true },
    { label: 'Korpa', icon: 'cart', n: cartCount(cart), onClick: openCart },
  ]

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[400] h-[var(--header)] bg-canvas text-ink transition-[border-color] duration-300 border-b ${
        scrolled || variant === 'page' ? 'border-ink/12' : 'border-transparent'
      }`}
    >
      <div className="gutter wrap flex h-full items-center justify-between gap-6">
        <Link href="/" onClick={variant === 'home' ? go('top') : undefined} aria-label="Grand Company, početna" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Glavna navigacija" className="hidden items-center gap-6 text-[14px] lg:flex xl:gap-8">
          {NAV.map((n) => (
            <Link key={n.id} href={`/#${n.id}`} onClick={go(n.id)} className="whitespace-nowrap transition-opacity hover:opacity-60">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/#upit" onClick={go('upit')} className="btn-line mr-3 hidden !py-2 md:inline-flex">
            Zatražite ponudu <span aria-hidden>→</span>
          </Link>
          {tools.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={t.onClick}
              aria-label={t.n !== undefined ? `${t.label}, ${t.n}` : t.label}
              className={`relative grid size-9 place-items-center transition-opacity hover:opacity-60 ${t.hideSm ? 'max-sm:hidden' : ''}`}
            >
              <Icon name={t.icon} className="size-[21px]" />
              {t.n !== undefined && <Count n={t.n} />}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-label="Meni"
            className="grid size-9 place-items-center lg:hidden"
          >
            <Icon name={menu ? 'close' : 'menu'} className="size-[22px]" />
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={`absolute inset-x-0 top-full border-b border-ink/12 bg-canvas transition-[opacity,transform] duration-300 lg:hidden ${
          menu ? 'opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
        inert={!menu}
      >
        <nav aria-label="Meni" className="gutter flex flex-col py-3">
          {NAV.map((n) => (
            <Link key={n.id} href={`/#${n.id}`} onClick={go(n.id)} className="border-b border-ink/10 py-3.5 text-[17px]">
              {n.label}
            </Link>
          ))}
          <div className="flex gap-6 py-4 text-[14px] sm:hidden">
            <button type="button" onClick={() => { setMenu(false); openPanel({ kind: 'saved' }) }}>
              Sačuvano ({saved.length})
            </button>
            <button type="button" onClick={() => { setMenu(false); openPanel({ kind: 'compare' }) }}>
              Poređenje ({compare.length})
            </button>
          </div>
          <Link href="/#upit" onClick={go('upit')} className="btn-line mb-4 mt-2 self-start">
            Zatražite ponudu <span aria-hidden>→</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
