'use client'

/* eslint-disable @next/next/no-img-element -- slike artikala iz /public, već u WebP */

import { useMemo, useState } from 'react'
import { STOCK_LABEL, stockLevel } from '@/gc/gc'
import { openLogin, withDiscount, type FullPartner } from '@/lib/b2b'
import { addToCart, useShop } from '@/lib/cart'
import { CATEGORIES, PRODUCTS, defaultQty, money, type CategoryId } from '@/lib/shop'
import { Arrow, Head, Pill, Stepper, field, go, line } from './ui'

// Katalog za B2B: gusta lista (ne kartice), jer izvođač naručuje po šiframa. Filteri po kategoriji
// i brendu, pretraga po šifri/nazivu, samo artikli na stanju, sortiranje. Svaki red: stanje iz
// Pantheona, maloprodajna i vaša cijena (rabat), količina u pakovanjima i "Dodaj".

type Sort = 'sifra' | 'cijena-rastuce' | 'cijena-opadajuce' | 'stanje'
const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort()

export default function Catalog({ partner }: { partner: FullPartner | null }) {
  const { cart } = useShop()
  const d = partner?.discount ?? 0
  const [cat, setCat] = useState<'sve' | CategoryId>('sve')
  const [brand, setBrand] = useState('sve')
  const [q, setQ] = useState('')
  const [inStock, setInStock] = useState(false)
  const [sort, setSort] = useState<Sort>('sifra')
  const [qty, setQty] = useState<Record<string, number>>({})
  const [open, setOpen] = useState<string | null>(null)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const out = PRODUCTS.filter(
      (p) =>
        (cat === 'sve' || p.category === cat) &&
        (brand === 'sve' || p.brand === brand) &&
        (!inStock || stockLevel(p) !== 'low') &&
        (!needle || `${p.sku} ${p.name} ${p.spec}`.toLowerCase().includes(needle)),
    )
    if (sort === 'cijena-rastuce') out.sort((a, b) => a.price - b.price)
    else if (sort === 'cijena-opadajuce') out.sort((a, b) => b.price - a.price)
    else if (sort === 'stanje') out.sort((a, b) => b.stock - a.stock)
    else out.sort((a, b) => a.sku.localeCompare(b.sku))
    return out
  }, [cat, brand, q, inStock, sort])

  const count = (id: 'sve' | CategoryId) => (id === 'sve' ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === id).length)

  return (
    <div className="px-5 pb-[12vh] pt-10 md:px-10">
      <Head
        no="01 · Katalog"
        title="Katalog"
        aside={
          partner ? (
            <p className="bg-cobalt px-4 py-3 text-[11px] text-bg">Vaš rabat {Math.round(d * 100)}% je uračunat u svaku cijenu</p>
          ) : (
            <button type="button" onClick={openLogin} className="flex items-center gap-3 border border-cobalt px-4 py-3 text-[11px] text-cobalt transition-colors hover:bg-cobalt hover:text-bg">
              Rabat za vas — prijavite se <Arrow />
            </button>
          )
        }
      >
        Suha gradnja, izolacija, veziva i oprema. Stanje se osvježava iz Pantheon ERP-a; cijene su sa PDV-om.
      </Head>

      {/* Filteri */}
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Kategorija">
        {(['sve', ...CATEGORIES.map((c) => c.id)] as ('sve' | CategoryId)[]).map((id) => {
          const on = cat === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setCat(id)}
              className={`flex items-center gap-3 border px-4 py-2.5 text-[11px] transition-colors ${on ? 'border-ink bg-ink text-bg' : 'border-ink/25 hover:border-ink'}`}
            >
              {id === 'sve' ? 'Sve' : CATEGORIES.find((c) => c.id === id)?.name}
              <span className="tabular-nums opacity-60">{count(id)}</span>
            </button>
          )
        })}
      </div>
      <div className={`mt-4 grid gap-3 border-b ${line} pb-6 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_auto]`}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Šifra ili naziv (npr. KNF-002, CW 75)" className={field} aria-label="Pretraga" />
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className={field} aria-label="Brend">
          <option value="sve">Svi brendovi</option>
          {BRANDS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={field} aria-label="Sortiranje">
          <option value="sifra">Po šifri</option>
          <option value="cijena-rastuce">Cijena rastuće</option>
          <option value="cijena-opadajuce">Cijena opadajuće</option>
          <option value="stanje">Najviše na stanju</option>
        </select>
        <label className="flex h-11 cursor-pointer items-center gap-3 border border-ink/25 px-3 text-[11px]">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="size-4 accent-[var(--cobalt)]" />
          Samo dovoljno na stanju
        </label>
      </div>

      {/* Zaglavlje tabele (desktop) */}
      <div className={`hidden grid-cols-[72px_1.8fr_1fr_1fr_auto_120px] items-center gap-5 border-b ${line} py-3 text-[10px] opacity-55 lg:grid`}>
        <span />
        <span>Artikal</span>
        <span>Stanje · Pantheon</span>
        <span className="text-right">{partner ? 'Vaša cijena' : 'Cijena'}</span>
        <span>Količina</span>
        <span />
      </div>

      <ul>
        {list.map((p) => {
          const lvl = stockLevel(p)
          const step = defaultQty(p)
          const n = qty[p.sku] ?? step
          const unit = withDiscount(p.price, d)
          const inCart = cart[p.sku]
          const expanded = open === p.sku
          return (
            <li key={p.sku} className={`border-b ${line}`}>
              <div className="grid grid-cols-[64px_1fr] items-center gap-x-4 gap-y-4 py-4 lg:grid-cols-[72px_1.8fr_1fr_1fr_auto_120px] lg:gap-5">
                <img src={p.image} alt="" className="aspect-square w-full border border-ink/10 bg-white object-cover" loading="lazy" />
                <button type="button" onClick={() => setOpen(expanded ? null : p.sku)} className="min-w-0 text-left" aria-expanded={expanded}>
                  <span className="text-[10px] tabular-nums opacity-55">
                    {p.sku} · {p.brand}
                  </span>
                  <span className="mt-1 block text-[12.5px] font-semibold leading-[1.35]">{p.name}</span>
                  <span className="mt-1 block text-[10.5px] opacity-60">{p.spec}</span>
                </button>
                <div className="col-span-2 flex items-center gap-3 lg:col-span-1">
                  <Pill tone={lvl === 'high' ? 'cobalt' : lvl === 'mid' ? 'line' : 'warn'}>{STOCK_LABEL[lvl]}</Pill>
                  <span className="text-[10.5px] tabular-nums opacity-60">
                    {p.stock.toLocaleString('de-DE')} {p.unit}
                  </span>
                </div>
                <div className="col-span-2 lg:col-span-1 lg:text-right">
                  {d > 0 && <span className="mr-2 text-[10.5px] tabular-nums opacity-40 line-through">{money(p.price)}</span>}
                  <span className="num text-[18px] tabular-nums">{money(unit)}</span>
                  <span className="text-[10px] opacity-55"> / {p.unit}</span>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Stepper value={n} step={step} unit={p.unit} onChange={(v) => setQty({ ...qty, [p.sku]: v })} />
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(p.sku, n)}
                  className="col-span-2 flex h-10 items-center justify-between gap-3 bg-ink px-4 text-[10.5px] text-bg transition-colors hover:bg-cobalt lg:col-span-1"
                >
                  {inCart ? `U korpi ${inCart.toLocaleString('de-DE')}` : 'Dodaj'} <Arrow />
                </button>
              </div>
              {expanded && (
                <div className="grid gap-4 pb-6 pl-0 text-[11px] leading-[1.6] lg:grid-cols-[1.8fr_1fr_1fr] lg:pl-[92px]">
                  <p className="opacity-75">{p.desc}</p>
                  <p>
                    <span className="block opacity-50">Pakovanje</span>
                    {p.pack ? `${p.pack.name} = ${p.pack.size} ${p.unit}` : `1 ${p.unit}`}
                  </p>
                  <p>
                    <span className="block opacity-50">Masa</span>
                    {p.weight.toLocaleString('de-DE')} kg / {p.unit}
                    {n > 0 && <span className="opacity-60"> · {Math.round(p.weight * n).toLocaleString('de-DE')} kg za {n.toLocaleString('de-DE')} {p.unit}</span>}
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {!list.length && <p className="py-16 text-center text-[12px] opacity-60">Nema artikala za ove filtere.</p>}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[11px] opacity-60">Ne znate koliko vam treba? Unesite površinu zida i dobićete kompletan spisak.</p>
        <button type="button" onClick={() => go('kalkulator')} className="flex items-center gap-3 border border-ink px-5 py-3 text-[11px] transition-colors hover:bg-ink hover:text-bg">
          W111 kalkulator <Arrow />
        </button>
      </div>
    </div>
  )
}
