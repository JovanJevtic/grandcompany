'use client'

import { useState, type ReactNode } from 'react'
import { STOCK_LABEL, stockLevel } from '@/gc/gc'
import {
  COMPARE_MAX,
  addToCart,
  closePanel,
  openPanel,
  resetFilters,
  toggleCompare,
  toggleSaved,
  useShop,
} from '@/lib/cart'
import {
  CATEGORIES,
  DEFAULT_FILTERS,
  PRODUCT_MAP,
  categoryName,
  defaultQty,
  filterProducts,
  money,
  qtyLabel,
  type Product,
} from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'
import ProductImage from './ProductImage'
import { pw } from '@/components/ui/Pw'

// Sadržaj bočnih panela: sačuvano, poređenje, pretraga i brzi pregled artikla.
// Preneseno iz grand-root (panel-views.tsx: SavedView, CompareView, SearchView, ProductView) i obučeno u
// editorijalni jezik sajta: serif, tanke linije, dugmad u obliku kapsule.

const BTN =
  'rounded-full border border-ink/25 px-5 py-2.5 text-[14px] transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-bg aria-pressed:bg-ink aria-pressed:text-bg'
const BTN_SOLID =
  'flex min-h-12 items-center justify-center gap-3 rounded-full bg-ink px-6 text-[15px] text-bg transition-colors duration-300 hover:bg-signal'

export function PanelLayout({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex h-full flex-col text-ink">
      <div className="flex items-center justify-between border-b border-ink/15 px-5 py-5 md:px-8">
        <h2 className="font-pretty text-[32px] leading-none">{pw(title)}</h2>
        <button data-close type="button" className="ulink normal-case text-[12.5px]" onClick={closePanel}>
          Zatvori
        </button>
      </div>
      <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 md:px-8">
        {children}
      </div>
      {footer && <div className="border-t border-ink/15 px-5 py-5 md:px-8">{footer}</div>}
    </div>
  )
}

function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-6 pt-6">
      <p className="font-pretty text-[34px] leading-[1.05]">{pw(title)}</p>
      <p className="max-w-[34ch] text-[12.5px] text-ink/60">{text}</p>
      {action}
    </div>
  )
}

// Panel zaključava skrol; do sekcije se klizi tek kad se zatvori.
function useGoTo() {
  const scrollTo = useScrollTo()
  return (id: string) => {
    closePanel()
    setTimeout(() => scrollTo(id), 80)
  }
}

const itemsOf = (ids: string[]) => ids.map((id) => PRODUCT_MAP[id]).filter((p): p is Product => Boolean(p))

function Stepper({ value, step, unit, onChange }: { value: number; step: number; unit: string; onChange: (n: number) => void }) {
  return (
    <div className="flex items-stretch border border-ink/15 label">
      <button
        type="button"
        aria-label="Smanji količinu"
        disabled={value <= step}
        onClick={() => onChange(Math.round((value - step) * 100) / 100)}
        className="w-10 transition-colors duration-300 hover:bg-ink hover:text-bg disabled:opacity-30"
      >
        −
      </button>
      <span aria-live="polite" className="grid min-w-20 place-items-center border-x border-ink/15 px-2 py-3 tabular-nums">
        {qtyLabel(value, unit)}
      </span>
      <button
        type="button"
        aria-label="Povećaj količinu"
        onClick={() => onChange(Math.round((value + step) * 100) / 100)}
        className="w-10 transition-colors duration-300 hover:bg-ink hover:text-bg"
      >
        +
      </button>
    </div>
  )
}

// ---------- sačuvano ----------

export function SavedView() {
  const { saved } = useShop()
  const goTo = useGoTo()
  const items = itemsOf(saved)

  return (
    <PanelLayout title={`Sačuvano (${items.length})`}>
      {items.length === 0 ? (
        <Empty
          title="Ništa nije sačuvano."
          text="Sačuvajte artikle sa kartice u katalogu da ih kasnije lakše nađete."
          action={
            <button type="button" className={BTN} onClick={() => goTo('prodavnica')}>
              Pogledaj katalog →
            </button>
          }
        />
      ) : (
        <ul className="border-t border-ink/15">
          {items.map((p) => (
            <li key={p.id} className="flex gap-4 border-b border-ink/25 py-5">
              <ProductImage src={p.image} drawing={p.drawing} alt="" className="size-[84px] shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col">
                <button type="button" className="text-left text-small hover:underline" onClick={() => openPanel({ kind: 'product', id: p.id })}>
                  {p.name}
                </button>
                <p className="mt-1 text-micro text-ink/60">
                  {money(p.price)} / {p.unit}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <button type="button" className={BTN} onClick={() => addToCart(p.id)}>
                    U korpu +
                  </button>
                  <button type="button" className="label underline underline-offset-4" onClick={() => toggleSaved(p.id)}>
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

// ---------- poređenje ----------

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
          text={`Na kartici artikla izaberite „Poredi“ (do ${COMPARE_MAX} artikla) da ih vidite jedan uz drugi.`}
          action={
            <button type="button" className={BTN} onClick={() => goTo('prodavnica')}>
              Pogledaj katalog →
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto" data-lenis-prevent>
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr>
                <th className="w-[22%]" />
                {items.map((p) => (
                  <th key={p.id} className="p-2 pb-5 align-top font-bold">
                    <ProductImage src={p.image} drawing={p.drawing} alt="" className="aspect-[4/5] w-full" />
                    <p className="mt-3 text-small">{p.name}</p>
                    <button type="button" className="mt-2 text-micro underline underline-offset-4" onClick={() => toggleCompare(p.id)}>
                      Ukloni
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-ink/15">
                  <th scope="row" className="py-3 pr-2 align-top text-micro font-bold text-ink/60">
                    {r.label}
                  </th>
                  {items.map((p) => (
                    <td key={p.id} className="p-2 py-3 align-top text-micro">
                      {r.get(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-ink/15">
                <th />
                {items.map((p) => (
                  <td key={p.id} className="p-2 py-4">
                    <button type="button" className={BTN} onClick={() => addToCart(p.id)}>
                      U korpu +
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

// ---------- brzi pregled artikla ----------

export function ProductView({ id }: { id: string }) {
  const { saved, compare } = useShop()
  const p = PRODUCT_MAP[id]
  const [qty, setQty] = useState(p ? defaultQty(p) : 1)
  const goTo = useGoTo()

  if (!p) {
    return (
      <PanelLayout title="Artikal">
        <Empty title="Artikal nije pronađen." text="Moguće je da više nije u ponudi." />
      </PanelLayout>
    )
  }

  const level = stockLevel(p)

  return (
    <PanelLayout
      title="Brzi pregled"
      footer={
        <div className="flex flex-wrap items-stretch gap-3">
          <Stepper value={qty} step={defaultQty(p)} unit={p.unit} onChange={setQty} />
          <button
            type="button"
            className={`${BTN_SOLID} min-w-[220px] flex-1`}
            onClick={() => {
              addToCart(p.id, qty)
              closePanel()
            }}
          >
            <span>U korpu · {money(p.price * qty)}</span>
            <span aria-hidden>+</span>
          </button>
        </div>
      }
    >
      <ProductImage src={p.image} drawing={p.drawing} alt={p.name} className="aspect-[4/3] w-full border border-ink/15" />
      <div className="mt-5 flex justify-between gap-3 text-[12.5px] text-ink/60">
        <span>
          {categoryName(p.category)} · {p.sku}
        </span>
        <span>{p.badge ?? ''}</span>
      </div>
      <p className="mt-3 label">{p.brand}</p>
      <h3 className="mt-1 text-lead">{p.name}</h3>
      <p className="mt-4 text-lead tabular-nums">
        {money(p.price)}
        <span className="ml-2 text-micro text-ink/60">/ {p.unit}, sa PDV-om</span>
      </p>
      <p className="mt-3 flex items-center gap-2 label">
        <span
          aria-hidden
          className={`inline-block size-2 ${level === 'high' ? 'bg-ink' : level === 'mid' ? 'bg-ink/50' : 'border border-ink/15'}`}
        />
        {STOCK_LABEL[level]} · {qtyLabel(p.stock, p.unit)} u skladištu
      </p>
      <p className="mt-6 max-w-[52ch] text-small leading-[1.3]">{p.desc}</p>

      <dl className="mt-8 border-t border-ink/15">
        {[
          ['Dimenzije', p.spec],
          ['Pakovanje', p.pack ? `${p.pack.name}, ${qtyLabel(p.pack.size, p.unit)}` : `1 ${p.unit}`],
          ['Težina', `${p.weight.toLocaleString('de-DE')} kg / ${p.unit}`],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[34%_1fr] gap-4 border-b border-ink/25 py-3">
            <dt className="text-micro text-ink/60">{k}</dt>
            <dd className="text-micro">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" className={BTN} aria-pressed={saved.includes(p.id)} onClick={() => toggleSaved(p.id)}>
          {saved.includes(p.id) ? 'Sačuvano' : 'Sačuvaj'}
        </button>
        <button type="button" className={BTN} aria-pressed={compare.includes(p.id)} onClick={() => toggleCompare(p.id)}>
          {compare.includes(p.id) ? 'U poređenju' : 'Poredi'}
        </button>
        <button type="button" className={BTN} onClick={() => goTo('ponuda')}>
          Pitaj stručni tim
        </button>
      </div>
    </PanelLayout>
  )
}

// ---------- pretraga ----------

export function SearchView() {
  const goTo = useGoTo()
  const [q, setQ] = useState('')
  const term = q.trim()
  const results = term.length > 1 ? filterProducts({ ...DEFAULT_FILTERS, query: term }, []).slice(0, 8) : []

  return (
    <PanelLayout title="Pretraga">
      <div className="border-b border-ink/15 pb-3">
        <input
          autoFocus
          type="search"
          className="w-full bg-transparent text-lead outline-none placeholder:text-ink/25"
          placeholder="Artikal, brend, šifra…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Pretraga artikala"
        />
      </div>

      {term.length < 2 ? (
        <div className="mt-10">
          <p className="text-[12.5px] text-ink/60">Ili počnite od grupe</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={BTN}
                onClick={() => {
                  resetFilters({ category: c.id })
                  goTo('prodavnica')
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <Empty
          title="Nema rezultata."
          text="Pokušajte sa drugom riječi ili pogledajte cijeli katalog."
          action={
            <button
              type="button"
              className={BTN}
              onClick={() => {
                resetFilters()
                goTo('prodavnica')
              }}
            >
              Cijeli katalog →
            </button>
          }
        />
      ) : (
        <>
          <ul className="mt-8 border-t border-ink/15">
            {results.map((p) => (
              <li key={p.id} className="border-b border-ink/25">
                <button
                  type="button"
                  className="flex w-full items-center gap-4 py-4 text-left transition-colors duration-300 hover:bg-ink/5"
                  onClick={() => openPanel({ kind: 'product', id: p.id })}
                >
                  <ProductImage src={p.image} drawing={p.drawing} alt="" className="size-[56px] shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-small">{p.name}</span>
                    <span className="mt-1 block text-micro text-ink/60">{categoryName(p.category)}</span>
                  </span>
                  <span className="shrink-0 text-micro tabular-nums">{money(p.price)}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={`${BTN} mt-6`}
            onClick={() => {
              resetFilters({ query: term })
              goTo('prodavnica')
            }}
          >
            Svi rezultati u katalogu →
          </button>
        </>
      )}
    </PanelLayout>
  )
}
