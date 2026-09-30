'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import ProductCard from '@/components/catalog/ProductCard'
import { Flip, gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import { CATEGORIES, PRODUCTS, artikala, type CategoryId } from '@/lib/shop'

// Najčešće birani artikli sa filterom po grupi. Promjena filtera ne "skače": Flip zapamti gdje je
// svaka kartica bila, React složi novu listu, pa kartice kliznu na nova mjesta, a nove izrone.
// Uz "Sve" idu artikli označeni kao najčešće birani; uz grupu, prvih osam iz te grupe.

type Key = CategoryId | 'sve'

const pick = (k: Key) =>
  k === 'sve'
    ? PRODUCTS.filter((p) => p.featured)
    : [...PRODUCTS.filter((p) => p.category === k)].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, 8)

export default function Featured() {
  const root = useRef<HTMLElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const flip = useRef<Flip.FlipState | null>(null)
  const [cat, setCat] = useState<Key>('sve')
  const list = pick(cat)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        revealChars(root.current!.querySelector('[data-head]')!, reduce, 'top 80%')
      })
    },
    { scope: root },
  )

  // Poslije svakog crtanja nove liste: odigraj Flip od zapamćenog stanja.
  useGSAP(
    () => {
      const state = flip.current
      if (!state) return
      flip.current = null
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return
      Flip.from(state, {
        targets: grid.current!.querySelectorAll('[data-flip-id]'),
        duration: 0.8,
        ease: EASE.quintInOut,
        absolute: true,
        stagger: 0.03,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE.out, stagger: 0.04, delay: 0.2 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.94, duration: 0.35, ease: 'power2.in' }),
      })
    },
    { dependencies: [cat], scope: grid },
  )

  const choose = (k: Key) => {
    if (k === cat) return
    flip.current = Flip.getState(grid.current!.querySelectorAll('[data-flip-id]'))
    setCat(k)
  }

  const chips: { id: Key; name: string }[] = [{ id: 'sve', name: 'Najčešće' }, ...CATEGORIES.map((c) => ({ id: c.id, name: c.name }))]

  return (
    <section ref={root} id="najcesce" className="relative z-20 bg-bg pb-[14dvh] pt-[18dvh]">
      <div className="gutter">
        <p className="flex justify-between border-t-2 border-ink pt-3 font-mono text-micro uppercase tracking-wider">
          <span>03 — Najčešće birano</span>
          <span className="tabular-nums">{artikala(list.length)}</span>
        </p>

        <div className="mt-[6dvh] grid gap-10 md:grid-cols-12 md:items-end">
          <h2 data-head className="invisible text-[clamp(44px,6.6vw,128px)] font-bold uppercase leading-[0.88] tracking-[-0.02em] md:col-span-7">
            Na stanju, spremno za utovar
          </h2>
          <div className="md:col-span-5 md:pb-2">
            <div role="tablist" aria-label="Grupa artikala" className="flex flex-wrap gap-2">
              {chips.map((c) => {
                const on = c.id === cat
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => choose(c.id)}
                    className={`flex items-center gap-2 border-2 border-ink px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors duration-300 ${
                      on ? 'bg-ink text-bg' : 'hover:bg-ink/5'
                    }`}
                  >
                    <i className={`size-2 transition-colors ${on ? 'bg-accent' : 'bg-ink/25'}`} />
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div ref={grid} className="gutter mt-[7dvh] grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} view="grid" />
        ))}
      </div>

      <div className="gutter mt-[6dvh] flex justify-end">
        <Link
          href={cat === 'sve' ? '/prodavnica' : `/prodavnica?kategorija=${cat}`}
          className="group inline-flex items-center gap-10 border-2 border-ink px-5 py-4 font-mono text-micro uppercase tracking-wider transition-colors hover:bg-ink hover:text-bg"
        >
          Cijeli katalog
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">
            →
          </span>
        </Link>
      </div>
    </section>
  )
}
