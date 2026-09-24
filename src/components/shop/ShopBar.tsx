'use client'

import { useEffect, useState } from 'react'
import { cartCount, openCart, useShop } from '@/lib/cart'
import { NAV } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'

// Traka se lijepi na vrh samo dok se skrola kroz prodavnicu. Landing iznad nema navigaciju i ostaje čist.
export default function ShopBar() {
  const { cart } = useShop()
  const count = cartCount(cart)
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
        Prodavnica
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
            className={`flex shrink-0 items-center px-4 text-micro uppercase transition-colors duration-300 md:px-5 ${
              active === id ? 'bg-ink text-bg' : 'hover:bg-ink/10'
            }`}
          >
            {label}
          </a>
        ))}
      </nav>

      <button
        type="button"
        onClick={openCart}
        aria-label={`Otvori korpu, ${count} u korpi`}
        className="group flex shrink-0 items-center gap-3 border-l-2 border-ink px-4 text-micro uppercase transition-colors duration-300 hover:bg-ink hover:text-bg md:px-[3.05vw]"
      >
        Korpa
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
