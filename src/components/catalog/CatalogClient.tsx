'use client'

/* eslint-disable @next/next/no-img-element -- studijske fotografije iz /public, već optimizovane u WebP */

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useShop } from '@/lib/cart'
import { Flip, gsap, useGSAP } from '@/lib/gsap'
import { useMediaMotion } from '@/lib/media'
import { EASE } from '@/lib/motion'
import {
  CATEGORIES,
  PRICE_BANDS,
  PRODUCTS,
  SORTS,
  USES,
  artikala,
  filterProducts,
  shotOf,
  type CategoryId,
  type Filters,
  type SortId,
  type UseId,
} from '@/lib/shop'
import FilterDropdown from './FilterDropdown'
import ProductCard from './ProductCard'

type Extra = { brand: string; stock: boolean; view: 'grid' | 'list' }
type State = Filters & Extra

const BRANDS = [...new Set(PRODUCTS.map((product) => product.brand))]
const option = (value: string, label: string) => ({ value, label })

// Naslovna fotografija za svaku grupu: jedan tipičan artikal iz nje.
const COVER: Record<CategoryId, string> = {
  'suha-gradnja': 'KNF-001',
  izolacija: 'ISO-002',
  veziva: 'CHM-002',
  oprema: 'ACC-003',
}

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

// Ritam mreže na širokom ekranu (4 kolone): svaki deveti artikal je veliki (2 × 2),
// naizmjenično lijevo i desno.
const feature = (i: number) => (i % 9 === 0 ? (i % 18 === 0 ? 'lg:col-span-2 lg:row-span-2' : 'lg:col-span-2 lg:row-span-2 lg:col-start-3') : '')

export default function CatalogClient() {
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { saved } = useShop()
  const section = useRef<HTMLElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const [more, setMore] = useState(false)
  const [filters, setFilters] = useState(() => read(new URLSearchParams(search.toString())))

  // Browser back/forward mora vratiti i lokalno stanje filtera.
  useEffect(() => {
    const onPop = () => setFilters(read(new URLSearchParams(window.location.search)))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const shown = useMemo(
    () =>
      filterProducts(filters, saved).filter(
        (product) => (filters.brand === 'sve' || product.brand === filters.brand) && (!filters.stock || product.stock > 0),
      ),
    [filters, saved],
  )

  useMediaMotion(section, [shown.length, filters.view])

  // Dodatni filteri se otvaraju "harmonikom".
  useGSAP(
    () => {
      const panel = section.current?.querySelector('[data-more]')
      if (!panel) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      gsap.to(panel, { height: more ? 'auto' : 0, autoAlpha: more ? 1 : 0, duration: reduce ? 0 : 0.6, ease: EASE.quintInOut })
    },
    { scope: section, dependencies: [more] },
  )

  const update = (patch: Partial<State>) => {
    const flip = grid.current ? Flip.getState(grid.current.querySelectorAll('[data-flip-id]')) : null
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
    if (flip && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(() =>
        Flip.from(flip, {
          duration: 0.8,
          ease: EASE.quintInOut,
          absolute: true,
          stagger: 0.02,
          onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE.out, stagger: 0.03, delay: 0.15 }),
          onLeave: (els) => gsap.to(els, { autoAlpha: 0, duration: 0.3 }),
        }),
      )
    }
  }

  const reset = () => update({ ...read(new URLSearchParams()), view: filters.view })
  const extra = [filters.use !== 'sve', filters.price !== 'sve', filters.brand !== 'sve', filters.stock].filter(Boolean).length
  const tabs: { id: CategoryId | 'sve'; name: string }[] = [{ id: 'sve', name: 'Sve' }, ...CATEGORIES.map((c) => ({ id: c.id, name: c.name }))]

  return (
    <section ref={section} id="artikli">
      {/* Grupe kao četiri male fotografije: najbrži put do dijela kataloga */}
      <div className="gutter mx-auto grid max-w-[1280px] grid-cols-4 gap-x-3 md:gap-x-[2vw]">
        {CATEGORIES.map((c, i) => {
          const on = filters.category === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => update({ category: on ? 'sve' : c.id })}
              aria-pressed={on}
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              data-cursor={on ? 'Sve' : 'Izaberi'}
              className="fade-up group text-center"
            >
              <span className="shot block aspect-square rounded-full">
                <img src={shotOf(COVER[c.id])} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] leading-tight md:mt-4 md:gap-2 md:text-[clamp(16px,1.3vw,21px)]">
                <span className={`size-1.5 rounded-full bg-signal transition-transform duration-500 ${on ? 'scale-100' : 'scale-0'}`} />
                <span className={on ? 'italic' : ''}>{c.name}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Tihi red filtera */}
      <div className="gutter mt-[12vh]">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-ink/15 pb-3">
          <div role="tablist" aria-label="Grupa artikala" className="-ml-1 hidden flex-wrap items-center gap-x-6 gap-y-1 md:flex">
            {tabs.map((t) => {
              const on = filters.category === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => update({ category: t.id })}
                  className={`relative flex min-h-11 items-center gap-2 px-1 text-[15px] transition-opacity ${on ? '' : 'opacity-50 hover:opacity-100'}`}
                >
                  {on && <span className="size-1.5 rounded-full bg-signal" />}
                  <span className={on ? 'italic' : ''}>{t.name}</span>
                </button>
              )
            })}
          </div>

          <div className="flex w-full items-center justify-between gap-x-7 md:w-auto md:justify-start">
            <label className="flex min-h-11 items-center gap-2 text-[15px]">
              <span className="sr-only">Pretraga</span>
              <svg viewBox="0 0 16 16" className="w-3.5 opacity-50" fill="none" stroke="currentColor" aria-hidden>
                <circle cx="7" cy="7" r="5" />
                <path d="M11 11l4 4" />
              </svg>
              <input
                type="search"
                value={filters.query}
                onChange={(event) => update({ query: event.target.value })}
                placeholder="Pretraga"
                className="w-[6.5rem] bg-transparent md:w-[9.5rem] outline-none placeholder:text-ink/50 focus:placeholder:text-ink/30"
              />
            </label>
            <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className="flex min-h-11 items-center gap-2 text-[15px]">
              {extra > 0 && <span className="grid size-5 place-items-center rounded-full bg-signal text-[11px] text-bg">{extra}</span>}
              <span className="ulink">Filteri</span>
              <span aria-hidden className={`inline-block transition-transform duration-500 ${more ? 'rotate-45' : ''}`}>+</span>
            </button>
            <FilterDropdown
              label="Redoslijed"
              value={filters.sort}
              align="right"
              options={SORTS.map((item) => option(item.id, item.label))}
              onChange={(value) => update({ sort: value as SortId })}
            />
          </div>
        </div>

        <div data-more className="invisible h-0 overflow-hidden opacity-0" inert={!more}>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-1 border-b border-ink/15 py-3">
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
            <button type="button" aria-pressed={filters.stock} onClick={() => update({ stock: !filters.stock })} className="flex min-h-11 items-center gap-2 text-[15px]">
              <span className={`grid size-4 place-items-center rounded-full border transition-colors ${filters.stock ? 'border-signal bg-signal' : 'border-ink/40'}`} />
              Samo na stanju
            </button>
            <div className="ml-auto flex items-center gap-5 text-[15px]">
              {(['grid', 'list'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={filters.view === v}
                  onClick={() => update({ view: v })}
                  className={`min-h-11 ${filters.view === v ? 'italic' : 'opacity-50 hover:opacity-100'}`}
                >
                  {v === 'grid' ? 'Mreža' : 'Lista'}
                </button>
              ))}
              {extra > 0 && (
                <button type="button" onClick={reset} className="ulink min-h-11 text-signal">
                  Poništi
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-[13px] opacity-50" aria-live="polite">
          {artikala(shown.length)}
        </p>
      </div>

      <div
        ref={grid}
        className={
          filters.view === 'grid'
            ? 'gutter mt-10 grid grid-flow-dense grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-[2vw] md:gap-y-[6vw] lg:grid-cols-4'
            : 'gutter mx-auto mt-10 max-w-[1100px]'
        }
      >
        {shown.map((product, i) => (
          <div key={product.id} className={filters.view === 'grid' ? feature(i) : ''} data-feature={filters.view === 'grid' && i % 9 === 0 ? '' : undefined}>
            <ProductCard product={product} view={filters.view} priority={i < 4} />
          </div>
        ))}
      </div>

      {!shown.length && (
        <div className="gutter grid min-h-[50vh] place-items-center text-center">
          <div>
            <h2 className="display text-[clamp(40px,5vw,80px)]">
              Ništa <em>ovdje.</em>
            </h2>
            <p className="mt-4 opacity-60">Promijenite filtere ili pretragu.</p>
            <button type="button" onClick={reset} className="cta mt-8">
              <span className="cta-dot" aria-hidden />
              <span className="cta-roll">
                <span>Poništi filtere</span>
                <span aria-hidden>Poništi filtere</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
