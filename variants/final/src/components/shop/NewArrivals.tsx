'use client'

import { useRef, useState } from 'react'
import { resetFilters, useShop } from '@/lib/cart'
import { CATEGORIES, PRODUCTS, artikala, type CategoryId } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'
import { Icon, SectionTitle } from '../ui'
import ProductCard from './ProductCard'

// Asortiman: Ponos "Laminati" pattern — category tabs over a horizontal strip of product cards.
// Strip mechanic from grand-maison NewArrivals / grand-root NewArrivals (swipe with snap), without the pin,
// so switching tabs never fights a pinned scroll distance.
export default function NewArrivals() {
  const { saved, compare } = useShop()
  const [tab, setTab] = useState<CategoryId>(CATEGORIES[0].id)
  const strip = useRef<HTMLDivElement>(null)
  const scrollTo = useScrollTo()
  const cat = CATEGORIES.find((c) => c.id === tab)!
  const items = PRODUCTS.filter((p) => p.category === tab)

  const nudge = (dir: 1 | -1) => {
    const el = strip.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(260, el.clientWidth * 0.7), behavior: 'smooth' })
  }

  const all = (
    <button
      type="button"
      className="btn-line"
      onClick={() => {
        resetFilters({ category: tab })
        scrollTo('katalog')
      }}
    >
      Pogledaj sve: {cat.label} <span aria-hidden>→</span>
    </button>
  )

  return (
    <section id="asortiman" aria-labelledby="asortiman-h" className="relative z-10 bg-canvas py-16 lg:py-24">
      <div className="gutter wrap">
        <SectionTitle id="asortiman-h" title="Asortiman" lead="Četiri grupe robe sa stovarišta. Cijene u KM sa PDV-om, stanje iz Pantheona." />

        <div role="tablist" aria-label="Grupe robe" className="mt-8 flex gap-6 overflow-x-auto border-b border-ink/15 [scrollbar-width:none] md:gap-9">
          {CATEGORIES.map((c) => {
            const on = c.id === tab
            return (
              <button
                key={c.id}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls="asortiman-strip"
                onClick={() => {
                  setTab(c.id)
                  strip.current?.scrollTo({ left: 0 })
                }}
                className={`-mb-px shrink-0 border-b py-3 text-[14px] transition-colors md:text-[15px] ${
                  on ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[62ch] text-[14px] leading-[1.55] text-muted">
            {cat.lead}. <span className="tnum">{artikala(items.length)}</span>.
          </p>
          <div className="hidden items-center gap-2 md:flex">
            <button type="button" aria-label="Nazad" onClick={() => nudge(-1)} className="grid size-10 place-items-center border border-ink/25 hover:border-ink">
              <Icon name="arrowL" className="size-4" />
            </button>
            <button type="button" aria-label="Naprijed" onClick={() => nudge(1)} className="grid size-10 place-items-center border border-ink/25 hover:border-ink">
              <Icon name="arrowR" className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        id="asortiman-strip"
        role="tabpanel"
        ref={strip}
        data-lenis-prevent-horizontal
        className="strip mt-6 scroll-px-4 md:scroll-px-8 xl:scroll-px-12"
      >
        <ul className="flex w-max gap-3 px-4 md:gap-4 md:px-8 xl:px-12">
          {items.map((p) => (
            <li key={p.id} className="w-[62vw] shrink-0 snap-start sm:w-[40vw] md:w-[250px] xl:w-[268px]">
              <ProductCard product={p} saved={saved.includes(p.id)} compared={compare.includes(p.id)} sizes="(min-width: 768px) 270px, 62vw" />
            </li>
          ))}
        </ul>
      </div>

      <div className="gutter wrap mt-8 flex md:justify-end">{all}</div>
    </section>
  )
}
