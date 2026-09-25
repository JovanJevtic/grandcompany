'use client'

import { useEffect, useMemo, useState } from 'react'
import { resetFilters, setFilter, useShop } from '@/lib/cart'
import { ScrollTrigger } from '@/lib/gsap'
import { FREE_DELIVERY_OVER, km } from '@/gc/gc'
import {
  BRANDS,
  CATEGORIES,
  DEFAULT_FILTERS,
  PRICE_BANDS,
  PRODUCTS,
  SORTS,
  USES,
  artikala,
  filterProducts,
  type Filters,
} from '@/lib/shop'
import { Icon, SectionTitle } from '../ui'
import ProductCard from './ProductCard'

const PAGE = 12

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: [string, string][]
  onChange: (value: string) => void
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="eyebrow text-[10px] text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field !py-2.5 text-[14px]">
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}

// Katalog: grand-maison Shop + grand-root Catalog filters (category, brand, stock, price, sort, search, "show more").
export default function Shop() {
  const { query, category, use, brand, avail, price, sort, saved, compare } = useShop()
  const f: Filters = { query, category, use, brand, avail, price, sort }
  const key = JSON.stringify(f)
  const items = useMemo(() => filterProducts(JSON.parse(key) as Filters), [key])
  const [more, setMore] = useState({ key, limit: PAGE })
  const limit = more.key === key ? more.limit : PAGE
  const shown = items.slice(0, limit)
  const dirty = key !== JSON.stringify(DEFAULT_FILTERS)
  const useName = USES.find((u) => u.id === use)?.name

  // The list height changes, so pinned sections below must re-measure.
  const ids = shown.map((p) => p.id).join()
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 250)
    return () => window.clearTimeout(t)
  }, [ids])

  return (
    <section id="katalog" aria-labelledby="katalog-h" className="relative z-10 border-t border-ink/12 bg-canvas py-16 lg:py-24">
      <div className="gutter wrap">
        <SectionTitle
          id="katalog-h"
          title="Katalog"
          lead={`Svih ${PRODUCTS.length} artikala sa filterima. Standardna dostava je besplatna za narudžbe preko ${km(FREE_DELIVERY_OVER)}.`}
        />

        <div className="mt-8 grid items-end gap-3 md:grid-cols-[1fr_220px]">
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow text-[10px] text-muted">Pretraga</span>
            <span className="relative block">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setFilter({ query: e.target.value })}
                placeholder="Artikal, brend ili šifra, npr. CW 75"
                autoComplete="off"
                className="field !py-2.5 !pl-10 text-[14px]"
              />
            </span>
          </label>
          <Select
            label="Sortiraj"
            value={sort}
            onChange={(v) => setFilter({ sort: v as Filters['sort'] })}
            options={SORTS.map((s): [string, string] => [s.id, s.label])}
          />
        </div>

        <div role="group" aria-label="Grupa robe" className="mt-5 flex flex-wrap gap-2">
          {[{ id: 'sve', label: 'Sve' }, ...CATEGORIES].map((c) => {
            const n = c.id === 'sve' ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c.id).length
            return (
              <button
                key={c.id}
                type="button"
                className="chip"
                aria-pressed={category === c.id}
                onClick={() => setFilter({ category: c.id as Filters['category'] })}
              >
                {c.label} <span className="text-[12px] opacity-55 tnum">{n}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Select
            label="Brend"
            value={brand}
            onChange={(v) => setFilter({ brand: v })}
            options={[['sve', 'Svi brendovi'], ...BRANDS.map((b): [string, string] => [b, b])]}
          />
          <Select
            label="Stanje"
            value={avail}
            onChange={(v) => setFilter({ avail: v as Filters['avail'] })}
            options={[
              ['sve', 'Sve'],
              ['na-stanju', 'Samo „Na stanju“'],
            ]}
          />
          <Select
            label="Cijena"
            value={price}
            onChange={(v) => setFilter({ price: v })}
            options={[['sve', 'Sve cijene'], ...PRICE_BANDS.map((b): [string, string] => [b.id, b.label])]}
          />
          <Select
            label="Vrsta radova"
            value={use}
            onChange={(v) => setFilter({ use: v as Filters['use'] })}
            options={[['sve', 'Svi radovi'], ...USES.map((u): [string, string] => [u.id, u.name])]}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink/12 pt-4 text-[13px]" aria-live="polite">
          <p className="tnum">
            {artikala(items.length)}
            {useName && <span className="text-muted"> za radove: {useName}</span>}
          </p>
          {dirty && (
            <button type="button" onClick={() => resetFilters()} className="link-u">
              Poništi filtere
            </button>
          )}
        </div>

        {shown.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4 lg:gap-y-12">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} saved={saved.includes(p.id)} compared={compare.includes(p.id)} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-start gap-5 border border-ink/15 bg-surface p-6 md:p-10">
            <p className="s-sub">Nema artikala za ove filtere.</p>
            <p className="text-[14px] text-muted">Uklonite neki filter ili nam pošaljite upit, pa ćemo provjeriti šta imamo.</p>
            <button type="button" onClick={() => resetFilters()} className="btn-line">
              Poništi filtere <span aria-hidden>→</span>
            </button>
          </div>
        )}

        {items.length > limit && (
          <div className="mt-12 flex justify-center">
            <button type="button" className="btn-line" onClick={() => setMore({ key, limit: limit + PAGE })}>
              Prikaži još <span className="tnum">({items.length - limit})</span> <span aria-hidden>↓</span>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
