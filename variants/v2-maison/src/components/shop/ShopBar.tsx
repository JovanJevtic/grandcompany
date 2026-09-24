'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { cartCount, openCart, openPanel, useShop, type PanelKind } from '@/lib/cart'
import { NAV } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'

// Traka se lijepi na vrh samo dok se skrola kroz prodavnicu. Landing iznad nema navigaciju i ostaje čist.
export default function ShopBar() {
  const { cart, saved, compare } = useShop()
  const count = cartCount(cart)
  // Ulazi u panele iz grand-root: pretraga, sačuvano, poređenje. Na mobilnom samo ikona i broj.
  const tools: { kind: PanelKind; label: string; n?: number; icon: ReactNode }[] = [
    { kind: 'search', label: 'Traži', icon: <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm4.6-1.9L20 20" /> },
    { kind: 'saved', label: 'Sačuvano', n: saved.length, icon: <path d="M6 3.5h12v17l-6-4.5-6 4.5z" /> },
    { kind: 'compare', label: 'Poredi', n: compare.length, icon: <path d="M4 7h11m0 0-3-3m3 3-3 3M20 17H9m0 0 3-3m-3 3 3 3" /> },
  ]
  const scrollTo = useScrollTo()
  const [active, setActive] = useState('')

  // Aktivna je sekcija koja prelazi sredinu ekrana.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -54% 0px' },
    )
    document.querySelectorAll('[data-spy]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="sticky top-0 z-50 flex h-[var(--bar)] items-stretch border-b-2 border-ink bg-bg">
      <p className="hidden shrink-0 items-center border-r-2 border-ink px-[3.05vw] text-micro uppercase md:flex">
        Prodavnica <span className="ml-2 border border-ink px-1 text-[10px] leading-4 text-ink/70">Demo</span>
      </p>

      <nav aria-label="Prodavnica" className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none]">
        {NAV.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? 'true' : undefined}
            onClick={(e) => {
              e.preventDefault()
              scrollTo(id)
            }}
            className={`flex shrink-0 items-center px-4 text-micro uppercase transition-colors duration-300 md:px-3 xl:px-5 ${
              active === id ? 'bg-ink text-bg' : 'hover:bg-ink/10'
            }`}
          >
            {label}
          </a>
        ))}
      </nav>

      {tools.map((t) => (
        <button
          key={t.kind}
          type="button"
          onClick={() => openPanel({ kind: t.kind })}
          aria-label={t.n !== undefined ? `${t.label}, ${t.n}` : t.label}
          className="flex shrink-0 items-center gap-2 border-l-2 border-ink px-3 text-micro uppercase transition-colors duration-300 hover:bg-ink hover:text-bg md:px-4"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-[18px] lg:hidden" fill="none" stroke="currentColor" strokeWidth="2">
            {t.icon}
          </svg>
          <span className="hidden lg:inline">{t.label}</span>
          {t.n !== undefined && t.n > 0 && <span className="tabular-nums">{t.n}</span>}
        </button>
      ))}

      <button
        type="button"
        onClick={openCart}
        aria-label={`Otvori korpu, ${count} u korpi`}
        className="group flex shrink-0 items-center gap-3 border-l-2 border-ink px-4 text-micro uppercase transition-colors duration-300 hover:bg-ink hover:text-bg md:px-[3.05vw]"
      >
        <span className="hidden sm:inline">Korpa</span>
        <svg viewBox="0 0 24 24" aria-hidden className="size-[18px] sm:hidden" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 5h3l2.2 10.5h10.3L21 8H7" />
          <circle cx="10" cy="19.5" r="1.3" />
          <circle cx="17" cy="19.5" r="1.3" />
        </svg>
        <span
          key={count}
          aria-live="polite"
          className={`${count ? 'bump' : ''} grid min-w-[1.8em] place-items-center bg-ink px-1.5 py-1 tabular-nums text-bg transition-colors duration-300 group-hover:bg-bg group-hover:text-ink`}
        >
          {count}
        </span>
      </button>
    </div>
  )
}
