'use client'

import { useMemo, useState } from 'react'
import { COLORS } from '@/lib/content'
import { TERMS } from '@/lib/company'
import {
  BRANDS,
  CATEGORIES,
  DEFAULT_FILTERS,
  PRICE_RANGES,
  PRODUCTS,
  SORTS,
  USES,
  applyFilters,
  formatPrice,
  type Filters,
} from '@/lib/shop'
import { plural } from '@/gc/gc'
import { Section, SectionHead } from './parts'
import ProductCard from './ProductCard'
import { useShop } from './ShopProvider'

const PAGE = 12

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { id: T; label: string }[]
}) {
  return (
    <label className="block">
      <span className="lbl block" style={{ color: COLORS.base }}>
        {label}
      </span>
      <select className="field field-sm mt-1" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

// 05 — Katalog: pretraga, filteri, sortiranje i mreža artikala.
export default function Catalog() {
  const { filters, setFilters, resetFilters, saved, compare, openPanel } = useShop()

  // Broj prikazanih artikala se vraća na početak kad god se filteri promijene (bez efekta: ključ = filteri).
  const key = JSON.stringify(filters)
  const [more, setMore] = useState({ key, limit: PAGE })
  const limit = more.key === key ? more.limit : PAGE

  const list = useMemo(() => applyFilters(PRODUCTS, filters), [filters])
  const shown = list.slice(0, limit)
  const dirty = key !== JSON.stringify(DEFAULT_FILTERS)

  return (
    <Section id="katalog" color={COLORS.connect}>
      <SectionHead no="004" side="Katalog · zalihe iz Pantheona" title="Katalog" />

      {/* pretraga */}
      <div data-reveal className="mt-[4vw] grid grid-cols-12 items-end gap-x-6 max-md:mt-8">
        <p className="lbl col-span-12 pb-4 md:col-span-2 md:pb-6">Pretraga</p>
        <div className="col-span-12 md:col-span-10">
          <input
            type="search"
            className="field text-ink"
            placeholder="Artikal, šifra, brend ili vrsta radova…"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
            aria-label="Pretraga kataloga"
          />
        </div>
      </div>

      {/* kategorije */}
      <div data-reveal className="mt-8 flex flex-wrap gap-2">
        {[{ id: 'sve' as const, label: 'Sve' }, ...CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            className={`pill ${filters.cat === c.id ? 'pill-on' : ''}`}
            aria-pressed={filters.cat === c.id}
            onClick={() => setFilters({ cat: c.id })}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* filteri */}
      <div data-reveal className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 text-ink md:grid-cols-5">
        <Select<Filters['use']>
          label="Vrsta radova"
          value={filters.use}
          onChange={(use) => setFilters({ use })}
          options={[{ id: 'sve', label: 'Svi radovi' }, ...USES.map((u) => ({ id: u.id, label: u.label }))]}
        />
        <Select<string>
          label="Brend"
          value={filters.brand}
          onChange={(brand) => setFilters({ brand })}
          options={[{ id: 'sve', label: 'Svi brendovi' }, ...BRANDS.map((b) => ({ id: b, label: b }))]}
        />
        <Select<Filters['avail']>
          label="Dostupnost"
          value={filters.avail}
          onChange={(avail) => setFilters({ avail })}
          options={[
            { id: 'sve', label: 'Sve' },
            { id: 'na-stanju', label: 'Samo „Na stanju“' },
          ]}
        />
        <Select<Filters['price']> label="Cijena" value={filters.price} onChange={(price) => setFilters({ price })} options={PRICE_RANGES} />
        <Select<Filters['sort']> label="Sortiranje" value={filters.sort} onChange={(sort) => setFilters({ sort })} options={SORTS} />
      </div>

      {/* brojač i prečice */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-current pt-5">
        <p className="lbl" aria-live="polite">
          {list.length} {plural(list.length, 'artikal', 'artikla', 'artikala')}
          {dirty && (
            <button type="button" className="link-u ml-4 cursor-pointer" onClick={resetFilters}>
              Poništi filtere
            </button>
          )}
        </p>
        <p className="lbl flex flex-wrap gap-x-6 gap-y-2">
          <button type="button" className="link-u cursor-pointer" onClick={() => openPanel({ kind: 'saved' })}>
            Sačuvano ({saved.length})
          </button>
          <button type="button" className="link-u cursor-pointer" onClick={() => openPanel({ kind: 'compare' })}>
            Poređenje ({compare.length})
          </button>
          <span className="max-md:hidden">Besplatna standardna dostava preko {formatPrice(TERMS.freeDeliveryFrom)}</span>
        </p>
      </div>

      {/* mreža */}
      {shown.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 md:gap-y-[4.5vw] xl:grid-cols-4">
          {shown.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i % 4} />
          ))}
        </div>
      ) : (
        <div className="mt-16 max-w-[34ch]">
          <p className="copy-l">Nema artikala za ovu pretragu.</p>
          <p className="copy mt-4">Pokušajte sa drugom riječi ili uklonite neki filter. Za ostalo se javite našem stručnom timu.</p>
          <button type="button" className="pill mt-8" onClick={resetFilters}>
            Poništi filtere
          </button>
        </div>
      )}

      {list.length > limit && (
        <div className="mt-14 flex justify-center">
          <button type="button" className="pill" onClick={() => setMore({ key, limit: limit + PAGE })}>
            Prikaži još ({list.length - limit})
          </button>
        </div>
      )}
    </Section>
  )
}
