'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { EASE, EV, prefersReducedMotion } from '@/lib/motion'
import { CATS, PRODUCTS, USES, artikala, norm, nameOfUse, type CatId, type UseId } from '@/lib/shop'
import ProductCard from './ProductCard'
import SectionHead from './SectionHead'

type Cat = CatId | 'sve'
type Sort = 'preporuceno' | 'cijena-gore' | 'cijena-dole'

const SORTS: { id: Sort; label: string }[] = [
  { id: 'preporuceno', label: 'Preporučeno' },
  { id: 'cijena-gore', label: 'Cijena ↑' },
  { id: 'cijena-dole', label: 'Cijena ↓' },
]

// Prodavnica: pretraga, kategorije, sortiranje i mreža artikala. Redoslijed u PRODUCTS je "preporučeno".
export default function Shop() {
  const root = useRef<HTMLElement>(null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<Cat>('sve')
  const [sort, setSort] = useState<Sort>('preporuceno')
  const [onlyStock, setOnlyStock] = useState(false) // ovdje: samo najčešće birani artikli
  const [use, setUse] = useState<UseId | null>(null)

  // Materijali i podnožje traže prikaz jedne kategorije (vidi showCategory u lib/scroll.ts).
  useEffect(() => {
    const on = (e: Event) => {
      setCat((e as CustomEvent<CatId>).detail)
      setQ('')
      setOnlyStock(false)
      setUse(null)
    }
    // "Šta gradite?" traži samo materijal za jednu vrstu radova
    const onUse = (e: Event) => {
      setUse((e as CustomEvent<UseId>).detail)
      setCat('sve')
      setQ('')
      setOnlyStock(false)
    }
    window.addEventListener(EV.filter, on)
    window.addEventListener(EV.use, onUse)
    return () => {
      window.removeEventListener(EV.filter, on)
      window.removeEventListener(EV.use, onUse)
    }
  }, [])

  const list = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean)
    const out = PRODUCTS.filter((p) => {
      if (cat !== 'sve' && p.cat !== cat) return false
      if (onlyStock && !p.featured) return false
      if (use && !USES.find((u) => u.id === use)?.skus.includes(p.id)) return false
      if (!words.length) return true
      const hay = norm(`${p.name} ${p.spec} ${p.desc} ${p.brand} ${p.sku}`)
      return words.every((w) => hay.includes(w))
    })
    if (sort === 'cijena-gore') out.sort((a, b) => a.price - b.price)
    if (sort === 'cijena-dole') out.sort((a, b) => b.price - a.price)
    return out
  }, [q, cat, sort, onlyStock, use])

  const key = list.map((p) => p.id).join()

  // Kartice ulaze u redovima dok se skroluje, a kad se filter promijeni, ponovo izlaze redom.
  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]')
      if (prefersReducedMotion() || !cards.length) return
      gsap.set(cards, { autoAlpha: 0, y: 28 })
      ScrollTrigger.batch(cards, {
        start: 'top 94%',
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: EASE.expo,
            stagger: 0.06,
            overwrite: true,
            clearProps: 'opacity,visibility,transform',
          }),
      })
    },
    { scope: root, dependencies: [key], revertOnUpdate: true },
  )

  const reset = () => {
    setQ('')
    setCat('sve')
    setOnlyStock(false)
    setUse(null)
  }

  return (
    <section id="ponuda" ref={root} className="relative px-5 pb-[clamp(72px,10vw,160px)] pt-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="02 / 12"
        eyebrow="Webshop · demo"
        title={
          <>
            cijela <em>ponuda</em>.
          </>
        }
        intro="Knauf ploče i profili, mineralna vuna i stiropor, mase, ljepila i vijci. Cijene su maloprodajne, sa PDV-om; stanje je iz Pantheona."
      />

      <div data-reveal className="mt-[clamp(56px,8vw,120px)]">
        <div className="grid grid-cols-12 items-end gap-x-5">
          <label htmlFor="pretraga" className="info col-span-12 pb-3 text-dim md:col-span-2 md:pb-[22px]">
            Pretraga
          </label>
          <input
            id="pretraga"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Artikal, dimenzija, šifra…"
            autoComplete="off"
            className="field col-span-12 md:col-span-10"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-x-10 gap-y-4">
          <div role="group" aria-label="Kategorija" className="flex flex-wrap gap-2">
            <button type="button" className="chip" aria-pressed={cat === 'sve'} onClick={() => setCat('sve')}>
              Sve
            </button>
            {CATS.map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Sortiranje i stanje" className="flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <button key={s.id} type="button" className="chip" aria-pressed={sort === s.id} onClick={() => setSort(s.id)}>
                {s.label}
              </button>
            ))}
            <button type="button" className="chip" aria-pressed={onlyStock} onClick={() => setOnlyStock((v) => !v)}>
              Najčešće birano
            </button>
          </div>
        </div>
        {use && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="info text-dim">Namjena</span>
            <button type="button" className="chip" aria-pressed onClick={() => setUse(null)} aria-label={`Ukloni filter namjene: ${nameOfUse(use)}`}>
              {nameOfUse(use)} ×
            </button>
          </div>
        )}
      </div>

      <div className="info mt-[clamp(32px,4vw,56px)] flex justify-between border-t border-line pt-5 text-dim">
        <span aria-live="polite">{artikala(list.length)}</span>
        <span>Cijene u KM, sa PDV-om</span>
      </div>

      {list.length ? (
        <div className="iso mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-14 xl:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} no={PRODUCTS.indexOf(p) + 1} />
          ))}
        </div>
      ) : (
        <div className="mt-10 border-y border-line py-[clamp(56px,8vw,120px)] text-center">
          <p className="text-[clamp(24px,3vw,44px)] font-medium tracking-[-0.035em]">Nema artikala za taj upit.</p>
          <button type="button" onClick={reset} className="btn mt-8">
            Poništi filtere
          </button>
        </div>
      )}
    </section>
  )
}
