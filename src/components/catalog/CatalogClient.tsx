'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import ProductGlyph from '@/components/art/ProductGlyph'
import { useShop } from '@/lib/cart'
import { Flip, gsap, useGSAP } from '@/lib/gsap'
import {
  CATEGORIES,
  PRICE_BANDS,
  PRODUCTS,
  SORTS,
  USES,
  filterProducts,
  type CategoryId,
  type Filters,
  type SortId,
  type UseId,
} from '@/lib/shop'
import FilterDropdown from './FilterDropdown'
import ProductCard from './ProductCard'

type Extra = { brand: string; stock: boolean; view: 'grid' | 'list' }
type State = Filters & Extra
type Active = { key: string; label: string; patch: Partial<State> }

const BRANDS = [...new Set(PRODUCTS.map((product) => product.brand))]
const option = (value: string, label: string) => ({ value, label })

function read(search: URLSearchParams): State {
  return {
    query: search.get('q') ?? '',
    category: (search.get('kategorija') ?? 'sve') as CategoryId | 'sve',
    use: (search.get('namjena') ?? 'sve') as UseId | 'sve',
    price: search.get('cijena') ?? 'sve',
    sort: (search.get('sort') ?? 'preporuceno') as SortId,
    onlySaved: false,
    brand: search.get('brend') ?? 'sve',
    stock: search.get('stanje') === 'da',
    view: search.get('prikaz') === 'lista' ? 'list' : 'grid',
  }
}

function RollingCount({ value }: { value: number }) {
  const root = useRef<HTMLSpanElement>(null)
  const previous = useRef(value)

  useGSAP(
    () => {
      const old = root.current?.querySelector<HTMLElement>('[data-old]')
      const next = root.current?.querySelector<HTMLElement>('[data-next]')
      if (!old || !next || previous.current === value) return
      next.textContent = String(value)
      gsap.set(next, { yPercent: 0 })
      gsap.timeline({ onComplete: () => {
        old.textContent = String(value)
        gsap.set(old, { yPercent: 0 })
        gsap.set(next, { yPercent: 100 })
      } })
        .to(old, { yPercent: -100, duration: 0.35, ease: 'power3.inOut' }, 0)
        .fromTo(next, { yPercent: 100 }, { yPercent: 0, duration: 0.35, ease: 'power3.inOut' }, 0)
      previous.current = value
    },
    { scope: root, dependencies: [value] },
  )

  return (
    <span ref={root} className="relative inline-grid h-[1em] min-w-[2ch] overflow-hidden align-baseline">
      <span data-old>{value}</span>
      <span data-next className="absolute inset-x-0 translate-y-full">{value}</span>
    </span>
  )
}

export default function CatalogClient() {
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { saved } = useShop()
  const grid = useRef<HTMLDivElement>(null)
  const [mobile, setMobile] = useState(false)
  const [filters, setFilters] = useState(() => read(new URLSearchParams(search.toString())))

  // Browser back/forward mora vratiti i lokalno stanje filtera.
  useEffect(() => {
    const onPop = () => setFilters(read(new URLSearchParams(window.location.search)))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const shown = useMemo(
    () => filterProducts(filters, saved).filter((product) => (
      (filters.brand === 'sve' || product.brand === filters.brand)
      && (!filters.stock || product.stock > 0)
    )),
    [filters, saved],
  )

  const update = (patch: Partial<State>) => {
    const flip = grid.current
      ? Flip.getState(grid.current.querySelectorAll('[data-flip-id]'))
      : null
    const next = { ...filters, ...patch }
    setFilters(next)
    const query = new URLSearchParams()
    if (next.query) query.set('q', next.query)
    if (next.category !== 'sve') query.set('kategorija', next.category)
    if (next.use !== 'sve') query.set('namjena', next.use)
    if (next.price !== 'sve') query.set('cijena', next.price)
    if (next.brand !== 'sve') query.set('brend', next.brand)
    if (next.stock) query.set('stanje', 'da')
    if (next.sort !== 'preporuceno') query.set('sort', next.sort)
    if (next.view === 'list') query.set('prikaz', 'lista')
    router.replace(`${pathname}${query.size ? `?${query}` : ''}`, { scroll: false })
    if (flip) {
      requestAnimationFrame(() => Flip.from(flip, {
        duration: 0.55,
        ease: 'power3.inOut',
        absolute: true,
        stagger: 0.015,
      }))
    }
  }

  const reset = () => update({ ...read(new URLSearchParams()), view: filters.view })
  const active = [
    filters.category !== 'sve' && { key: 'category', label: filters.category, patch: { category: 'sve' } },
    filters.use !== 'sve' && { key: 'use', label: filters.use, patch: { use: 'sve' } },
    filters.price !== 'sve' && { key: 'price', label: filters.price, patch: { price: 'sve' } },
    filters.brand !== 'sve' && { key: 'brand', label: filters.brand, patch: { brand: 'sve' } },
    filters.stock && { key: 'stock', label: 'na stanju', patch: { stock: false } },
    filters.query && { key: 'query', label: `“${filters.query}”`, patch: { query: '' } },
  ].filter(Boolean) as Active[]

  const controls = (
    <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-8">
      <input
        className="site-input min-h-11 md:col-span-2"
        value={filters.query}
        onChange={(event) => update({ query: event.target.value })}
        placeholder="Pretraži naziv, SKU…"
      />
      <FilterDropdown
        label="Kategorija"
        value={filters.category}
        options={[option('sve', 'Sve kategorije'), ...CATEGORIES.map((item) => option(item.id, item.name))]}
        onChange={(value) => update({ category: value as CategoryId | 'sve' })}
      />
      <FilterDropdown
        label="Namjena"
        value={filters.use}
        options={[option('sve', 'Sve namjene'), ...USES.map((item) => option(item.id, item.name))]}
        onChange={(value) => update({ use: value as UseId | 'sve' })}
      />
      <FilterDropdown
        label="Cijena"
        value={filters.price}
        options={[option('sve', 'Sve cijene'), ...PRICE_BANDS.map((item) => option(item.id, item.label))]}
        onChange={(value) => update({ price: value })}
      />
      <FilterDropdown
        label="Brend"
        value={filters.brand}
        options={[option('sve', 'Svi brendovi'), ...BRANDS.map((brand) => option(brand, brand))]}
        onChange={(value) => update({ brand: value })}
      />
      <FilterDropdown
        label="Sortiranje"
        value={filters.sort}
        options={SORTS.map((item) => option(item.id, item.label))}
        onChange={(value) => update({ sort: value as SortId })}
      />
      <button
        type="button"
        onClick={() => update({ stock: !filters.stock })}
        className={`min-h-11 border-2 border-ink px-3 font-mono text-[11px] uppercase ${filters.stock ? 'bg-navy text-bg' : ''}`}
      >
        ■ Na stanju
      </button>
    </div>
  )

  return (
    <section id="artikli">
      <div
        className={`sticky top-[var(--site-header-offset,64px)] z-40 border-y-2 border-ink bg-bg/95 px-5 py-3
          backdrop-blur transition-[top] duration-300 md:px-[8.33vw]`}
      >
        <div className="flex items-center justify-between md:hidden">
          <button
            type="button"
            onClick={() => setMobile(true)}
            className="min-h-11 border-2 border-ink px-4 font-mono text-[11px] uppercase"
          >
            Filteri {active.length ? `(${active.length})` : ''}
          </button>
          <span className="font-mono text-xs uppercase tabular-nums"><RollingCount value={shown.length} /> artikala</span>
        </div>
        <div className="hidden md:block">{controls}</div>
        {active.length > 0 && (
          <div className="mt-3 hidden flex-wrap gap-2 md:flex">
            {active.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => update(item.patch)}
                className="min-h-10 border border-ink px-3 font-mono text-[11px] uppercase"
              >
                ■ {item.label} ×
              </button>
            ))}
            <button type="button" onClick={reset} className="min-h-10 font-mono text-[11px] uppercase underline">
              Poništi sve
            </button>
          </div>
        )}
      </div>

      <div className="gutter py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="font-mono text-xs uppercase tabular-nums">
            Prikazano <RollingCount value={shown.length} /> / {PRODUCTS.length}
          </p>
          <div className="flex shrink-0 border-2 border-ink font-mono text-[11px] uppercase">
            <button
              type="button"
              aria-pressed={filters.view === 'grid'}
              className={`min-h-10 px-4 ${filters.view === 'grid' ? 'bg-ink text-bg' : 'bg-bg text-ink'}`}
              onClick={() => update({ view: 'grid' })}
            >
              Mreža
            </button>
            <button
              type="button"
              aria-pressed={filters.view === 'list'}
              className={`min-h-10 border-l-2 border-ink px-4 ${filters.view === 'list' ? 'bg-ink text-bg' : 'bg-bg text-ink'}`}
              onClick={() => update({ view: 'list' })}
            >
              Lista
            </button>
          </div>
        </div>
        <div ref={grid} className={filters.view === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : ''}>
          {shown.map((product) => <ProductCard key={product.id} product={product} view={filters.view} />)}
        </div>
        {!shown.length && (
          <div className="grid min-h-[60vh] place-items-center border-2 border-ink p-8 text-center">
            <div>
              <ProductGlyph product={PRODUCTS[0]} kind="hanger" className="mx-auto h-52" />
              <h2 className="text-title uppercase">Nema artikala.</h2>
              <p className="mt-4 font-mono text-xs uppercase">Promijenite filtere ili pretragu.</p>
              <button type="button" onClick={reset} className="mt-6 border-2 border-ink px-5 py-3 font-mono text-xs uppercase">
                Poništi sve
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={`fixed inset-0 z-[500] bg-navy p-5 text-bg transition-transform duration-500 md:hidden
          ${mobile ? 'translate-y-0' : 'translate-y-full'}`}
        aria-hidden={!mobile}
        inert={!mobile}
      >
        <div className="flex justify-between border-b-2 border-bg pb-4">
          <strong className="uppercase">Filteri</strong>
          <button type="button" onClick={() => setMobile(false)} className="min-h-10 font-mono text-xs uppercase">Zatvori</button>
        </div>
        <div className="mt-6">{controls}</div>
        <button
          type="button"
          onClick={() => setMobile(false)}
          className="absolute inset-x-5 bottom-5 border-2 border-bg bg-bg px-4 py-4 font-mono text-xs uppercase text-ink"
        >
          Prikaži {shown.length} artikala
        </button>
      </div>
    </section>
  )
}
