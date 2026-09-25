'use client'

import { useState, type ReactNode } from 'react'
import { STOCK_LABEL, stockLevel } from '@/gc/gc'
import { COMPARE_MAX, addToCart, closePanel, openView, resetFilters, toggleCompare, toggleSaved, useShop } from '@/lib/cart'
import { CATEGORIES, DEFAULT_FILTERS, PRODUCT_MAP, categoryName, filterProducts, money, qtyLabel, type Product } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'
import { Icon } from '../ui'
import ProductImage from './ProductImage'

// Side-panel contents from grand-root panel-views.tsx (SavedView, CompareView, SearchView), in the house style:
// surface ground, hairlines, Instrument Sans, sentence case. The product view moved to the grand-cipher QuickView.

export function PanelLayout({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex h-full flex-col text-ink">
      <div className="flex items-center justify-between border-b border-ink/12 px-5 py-4 md:px-8">
        <h2 className="s-sub">{title}</h2>
        <button type="button" className="-m-2 flex items-center gap-1.5 p-2 text-[13px] hover:opacity-60" onClick={closePanel}>
          Zatvori <Icon name="close" className="size-4" />
        </button>
      </div>
      <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 md:px-8">
        {children}
      </div>
      {footer && <div className="border-t border-ink/12 px-5 py-5 md:px-8">{footer}</div>}
    </div>
  )
}

function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4 pt-4">
      <p className="s-sub">{title}</p>
      <p className="max-w-[40ch] text-[14px] text-muted">{text}</p>
      {action}
    </div>
  )
}

function useGoTo() {
  const scrollTo = useScrollTo()
  return (id: string) => {
    closePanel()
    setTimeout(() => scrollTo(id), 80)
  }
}

const itemsOf = (ids: string[]) => ids.map((id) => PRODUCT_MAP[id]).filter((p): p is Product => Boolean(p))

export function SavedView() {
  const { saved } = useShop()
  const goTo = useGoTo()
  const items = itemsOf(saved)

  return (
    <PanelLayout title={`Sačuvano (${items.length})`}>
      {items.length === 0 ? (
        <Empty
          title="Ništa nije sačuvano."
          text="Na kartici artikla dodirnite znak za čuvanje da ga kasnije lakše nađete."
          action={
            <button type="button" className="btn-line" onClick={() => goTo('katalog')}>
              Katalog <span aria-hidden>→</span>
            </button>
          }
        />
      ) : (
        <ul className="border-t border-ink/12">
          {items.map((p) => (
            <li key={p.id} className="flex gap-4 border-b border-ink/12 py-4">
              <ProductImage src={p.photo} alt="" sizes="84px" className="size-[84px] shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col">
                <button type="button" className="text-left text-[14px] font-medium leading-snug hover:underline" onClick={() => openView(p.id)}>
                  {p.name}
                </button>
                <p className="mt-1 text-[13px] text-muted tnum">
                  {money(p.price)} / {p.unit}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                  <button type="button" className="btn-solid !px-3 !py-2 !text-[11px]" onClick={() => addToCart(p.id)}>
                    U korpu
                  </button>
                  <button type="button" className="link-u" onClick={() => toggleSaved(p.id)}>
                    Ukloni
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelLayout>
  )
}

export function CompareView() {
  const { compare } = useShop()
  const goTo = useGoTo()
  const items = itemsOf(compare)

  const rows: { label: string; get: (p: Product) => ReactNode }[] = [
    { label: 'Cijena', get: (p) => `${money(p.price)} / ${p.unit}` },
    { label: 'Brend', get: (p) => p.brand },
    { label: 'Grupa', get: (p) => categoryName(p.category) },
    { label: 'Dimenzije', get: (p) => p.spec },
    { label: 'Pakovanje', get: (p) => (p.pack ? `${p.pack.name}, ${qtyLabel(p.pack.size, p.unit)}` : `1 ${p.unit}`) },
    { label: 'Težina', get: (p) => `${p.weight.toLocaleString('de-DE')} kg / ${p.unit}` },
    { label: 'Stanje', get: (p) => STOCK_LABEL[stockLevel(p)] },
  ]

  return (
    <PanelLayout title={`Poređenje (${items.length}/${COMPARE_MAX})`}>
      {items.length === 0 ? (
        <Empty
          title="Nema artikala za poređenje."
          text={`Na kartici artikla dodirnite znak za poređenje (do ${COMPARE_MAX} artikla) da ih vidite jedan uz drugi.`}
          action={
            <button type="button" className="btn-line" onClick={() => goTo('katalog')}>
              Katalog <span aria-hidden>→</span>
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto" data-lenis-prevent>
          <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
            <thead>
              <tr>
                <th className="w-[22%]" />
                {items.map((p) => (
                  <th key={p.id} className="p-2 pb-4 align-top font-normal">
                    <ProductImage src={p.photo} alt="" sizes="200px" className="aspect-[4/5] w-full" />
                    <p className="mt-3 text-[14px] font-medium leading-snug">{p.name}</p>
                    <button type="button" className="link-u mt-1.5 text-muted" onClick={() => toggleCompare(p.id)}>
                      Ukloni
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-ink/12">
                  <th scope="row" className="eyebrow py-3 pr-2 align-top text-[10px] font-medium text-muted">
                    {r.label}
                  </th>
                  {items.map((p) => (
                    <td key={p.id} className="p-2 py-3 align-top tnum">
                      {r.get(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-ink/12">
                <th />
                {items.map((p) => (
                  <td key={p.id} className="p-2 py-4">
                    <button type="button" className="btn-solid !px-3 !py-2 !text-[11px]" onClick={() => addToCart(p.id)}>
                      U korpu
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </PanelLayout>
  )
}

export function SearchView() {
  const goTo = useGoTo()
  const [q, setQ] = useState('')
  const term = q.trim()
  const results = term.length > 1 ? filterProducts({ ...DEFAULT_FILTERS, query: term }).slice(0, 8) : []

  return (
    <PanelLayout title="Pretraga">
      <label className="relative block">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
        <input
          autoFocus
          type="search"
          className="field !pl-10 !text-[17px]"
          placeholder="Artikal, brend, šifra…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Pretraga artikala"
        />
      </label>

      {term.length < 2 ? (
        <div className="mt-8">
          <p className="eyebrow text-[10px] text-muted">Ili počnite od grupe</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="chip"
                onClick={() => {
                  resetFilters({ category: c.id })
                  goTo('katalog')
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <Empty title="Nema rezultata." text="Pokušajte sa drugom riječi ili pogledajte cijeli katalog." />
      ) : (
        <>
          <ul className="mt-6 border-t border-ink/12">
            {results.map((p) => (
              <li key={p.id} className="border-b border-ink/12">
                <button
                  type="button"
                  className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-well/50"
                  onClick={() => openView(p.id)}
                >
                  <ProductImage src={p.photo} alt="" sizes="56px" className="size-14 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium leading-snug">{p.name}</span>
                    <span className="mt-0.5 block text-[12px] text-muted">{categoryName(p.category)}</span>
                  </span>
                  <span className="shrink-0 text-[13px] tnum">{money(p.price)}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-line mt-6"
            onClick={() => {
              resetFilters({ query: term })
              goTo('katalog')
            }}
          >
            Svi rezultati u katalogu <span aria-hidden>→</span>
          </button>
        </>
      )}
    </PanelLayout>
  )
}
