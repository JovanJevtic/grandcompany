'use client'

/* eslint-disable @next/next/no-img-element -- fotografije artikala iz /public, već u WebP */

import Link from 'next/link'
import { useMemo, useState } from 'react'
import Price from '@/components/b2b/Price'
import Pw from '@/components/ui/Pw'
import { STOCK_LABEL, stockLevel } from '@/gc/gc'
import { addToCart } from '@/lib/cart'
import { CATEGORIES, PRODUCTS, defaultQty, qtyLabel, type CategoryId } from '@/lib/shop'

// Kompletan asortiman (dno prodavnice, #asortiman): gusta lista svih artikala — drugačija od mreže
// "Najprodavanije" iznad. Pretraga, grupa, brend, sortiranje i "samo na stanju"; redovi su grupisani
// po grupi artikala, svaki red: snimak, šifra, naziv, specifikacija, stanje, cijena i "Dodaj".

type Sort = 'preporuceno' | 'cijena-rastuce' | 'cijena-opadajuce' | 'naziv'
type Cat = CategoryId | 'sve'

const SORTS: { id: Sort; label: string }[] = [
  { id: 'preporuceno', label: 'Preporučeno' },
  { id: 'cijena-rastuce', label: 'Cijena ↑' },
  { id: 'cijena-opadajuce', label: 'Cijena ↓' },
  { id: 'naziv', label: 'Naziv A–Ž' },
]

const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort((a, b) =>
  a === 'Ostali proizvođači' ? 1 : b === 'Ostali proizvođači' ? -1 : a.localeCompare(b, 'bs'),
)

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'dj')

const DOT: Record<string, string> = { high: 'bg-[#2e9e5b]', mid: 'bg-[#d9a400]', low: 'bg-[#d0573f]' }

export default function Assortment() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<Cat>('sve')
  const [brand, setBrand] = useState<string>('sve')
  const [sort, setSort] = useState<Sort>('preporuceno')
  const [inStock, setInStock] = useState(false)
  const [added, setAdded] = useState<string | null>(null)
  // Accordion (dropdown): bez filtera se vide samo natpisi kategorija (+ pritisne se i otvori).
  // Kad su aktivni filteri/pretraga, grupe s rezultatima su automatski otvorene — sve se računa
  // u renderu (bez efekata): ručnoZatvoreno važi samo dok je filter aktivan, ručnoOtvoreno bez njega.
  const [manualOpen, setManualOpen] = useState<Set<string>>(new Set())
  const [closed, setClosed] = useState<Set<string>>(new Set())

  const list = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean)
    const out = PRODUCTS.filter(
      (p) =>
        (cat === 'sve' || p.category === cat) &&
        (brand === 'sve' || p.brand === brand) &&
        (!inStock || stockLevel(p) !== 'low') &&
        words.every((w) => norm(`${p.sku} ${p.name} ${p.brand} ${p.spec}`).includes(w)),
    )
    if (sort === 'cijena-rastuce') out.sort((a, b) => a.price - b.price)
    else if (sort === 'cijena-opadajuce') out.sort((a, b) => b.price - a.price)
    else if (sort === 'naziv') out.sort((a, b) => a.name.localeCompare(b.name, 'bs'))
    else out.sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    return out
  }, [q, cat, brand, sort, inStock])

  // Uz "Preporučeno" lista je grupisana po grupi artikala; inače je jedna lista.
  const groups =
    sort === 'preporuceno'
      ? CATEGORIES.map((c) => ({ id: c.id, name: c.name, items: list.filter((p) => p.category === c.id) })).filter((g) => g.items.length)
      : [{ id: 'sve', name: '', items: list }]

  const isFiltered = q.trim() !== '' || cat !== 'sve' || brand !== 'sve' || inStock || sort !== 'preporuceno'

  const isOpen = (id: string) => (isFiltered ? !closed.has(id) : manualOpen.has(id))

  const toggleOpen = (id: string) => {
    if (isOpen(id)) {
      setManualOpen((prev) => {
        const n = new Set(prev)
        n.delete(id)
        return n
      })
      setClosed((prev) => {
        const n = new Set(prev)
        n.add(id)
        return n
      })
    } else {
      setClosed((prev) => {
        const n = new Set(prev)
        n.delete(id)
        return n
      })
      setManualOpen((prev) => {
        const n = new Set(prev)
        n.add(id)
        return n
      })
    }
  }

  const add = (id: string, qty: number) => {
    addToCart(id, qty)
    setAdded(id)
    window.setTimeout(() => setAdded((v) => (v === id ? null : v)), 1400)
  }
  const reset = () => {
    setQ('')
    setCat('sve')
    setBrand('sve')
    setInStock(false)
    setSort('preporuceno')
  }

  return (
    <section id="asortiman" className="asort scroll-mt-16" aria-label="Kompletan asortiman">
      <div className="asort-head">
        <div>
          <p className="asort-label">Kompletan asortiman</p>
          <h2 className="display mt-3 text-[clamp(30px,4vw,64px)] !leading-[0.95]">
            <Pw>Sve na stanju u Banjoj Luci</Pw>
          </h2>
        </div>
        <p className="asort-count tabular-nums">
          {PRODUCTS.length} artikala · {BRANDS.length} brendova
        </p>
      </div>

      {/* Kontrole */}
      <div className="asort-controls">
        <label className="asort-search">
          <svg viewBox="0 0 20 20" aria-hidden className="size-4 shrink-0 opacity-50" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <circle cx="9" cy="9" r="6" />
            <path d="m13.5 13.5 4 4" />
          </svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Traži po nazivu, šifri ili brendu" aria-label="Pretraga artikala" />
          {q && (
            <button type="button" onClick={() => setQ('')} aria-label="Obriši pretragu" className="opacity-50 hover:opacity-100">
              ×
            </button>
          )}
        </label>

        <div className="asort-chips" role="radiogroup" aria-label="Grupa">
          {[{ id: 'sve' as Cat, name: 'Sve grupe' }, ...CATEGORIES.map((c) => ({ id: c.id as Cat, name: c.name }))].map((c) => (
            <button key={c.id} type="button" role="radio" aria-checked={cat === c.id} onClick={() => setCat(c.id)}>
              {c.name}
            </button>
          ))}
        </div>

        <div className="asort-row2">
          <div className="asort-chips asort-chips--light" role="radiogroup" aria-label="Brend">
            {['sve', ...BRANDS].map((b) => (
              <button key={b} type="button" role="radio" aria-checked={brand === b} onClick={() => setBrand(b)}>
                {b === 'sve' ? 'Svi brendovi' : b}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-5">
            <label className="asort-check">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
              Samo dostupno odmah
            </label>
            <label className="asort-sort">
              <span className="sr-only">Sortiranje</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <p className="asort-result tabular-nums" aria-live="polite">
        {list.length === PRODUCTS.length ? `Prikazano svih ${list.length}` : `${list.length} od ${PRODUCTS.length} artikala`}
      </p>

      {/* Lista: natpisi kategorija odvojeni horizontalnim linijama, sa "+" desno;
          proizvodi se otvaraju klikom (dropdown). Kod aktivnih filtera grupe s rezultatima
          su automatski otvorene, pa se traženi artikli vide. */}
      <ul className="asort-acc">
        {groups.map((g) => {
          const open = isOpen(g.id)
          const label = g.name || 'Svi artikli'
          return (
            <li key={g.id} className="asort-acc__group">
              <button
                type="button"
                onClick={() => toggleOpen(g.id)}
                aria-expanded={open}
                aria-controls={`acc-${g.id}`}
                className="asort-acc__row"
              >
                <span className="asort-acc__name">
                  {label} <span className="tabular-nums opacity-45">{g.items.length}</span>
                </span>
                <span className={`asort-acc__plus ${open ? 'is-open' : ''}`} aria-hidden>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M8 1v14M1 8h14" />
                  </svg>
                </span>
              </button>
              {open && (
                <div id={`acc-${g.id}`} className="asort-acc__body">
                  <ul className="asort-list">
                    {g.items.map((p) => {
                      const lvl = stockLevel(p)
                      return (
                        <li key={p.id} className="asort-item">
                          <Link href={`/prodavnica/${p.sku}`} className="asort-thumb" aria-hidden tabIndex={-1}>
                            <img decoding="async" loading="lazy" src={p.image} alt="" />
                          </Link>
                          <div className="asort-main">
                            <span className="asort-sku">
                              {p.sku} · {p.brand}
                            </span>
                            <Link href={`/prodavnica/${p.sku}`} className="asort-name">
                              {p.name}
                            </Link>
                            <span className="asort-spec">{p.spec}</span>
                          </div>
                          <span className="asort-stock">
                            <i className={DOT[lvl]} />
                            {STOCK_LABEL[lvl]}
                            <span className="opacity-50">{qtyLabel(p.stock, p.unit)}</span>
                          </span>
                          <span className="asort-price tabular-nums">
                            <Price value={p.price} unit={p.unit} />
                          </span>
                          <button type="button" className="asort-add" onClick={() => add(p.id, defaultQty(p))} aria-label={`Dodaj u korpu: ${p.name}`}>
                            {added === p.id ? 'Dodato ✓' : 'Dodaj'}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {!list.length && (
        <div className="py-20 text-center">
          <p className="text-[13px] opacity-70">Nema artikala za ove filtere.</p>
          <button type="button" onClick={reset} className="mt-4 text-[11.5px] underline underline-offset-[5px] hover:text-signal">
            Poništi filtere
          </button>
        </div>
      )}
    </section>
  )
}
