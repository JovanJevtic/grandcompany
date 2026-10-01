'use client'

import Cta from '@/components/ui/Cta'
import { useMediaMotion } from '@/lib/media'
import { useRef, useState } from 'react'
import ProductCard from '@/components/catalog/ProductCard'
import { Flip, gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import { CATEGORIES, PRODUCTS, type CategoryId } from '@/lib/shop'

// Najčešće birani artikli sa filterom po grupi. Promjena filtera ne "skače": Flip zapamti gdje je
// svaka kartica bila, React složi novu listu, pa kartice kliznu na nova mjesta, a nove izrone.
// Uz "Sve" idu artikli označeni kao najčešće birani; uz grupu, prvih osam iz te grupe.

type Key = CategoryId | 'sve'

const pick = (k: Key) =>
  k === 'sve'
    ? PRODUCTS.filter((p) => p.featured).slice(0, 4)
    : [...PRODUCTS.filter((p) => p.category === k)].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, 4)

export default function Featured() {
  const root = useRef<HTMLElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const flip = useRef<Flip.FlipState | null>(null)
  const [cat, setCat] = useState<Key>('sve')
  const list = pick(cat)
  useMediaMotion(root, [cat])

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
    <section ref={root} id="najcesce" className="relative z-20 bg-bg pb-[10vh] pt-[20vh]">
      <div className="px-5 text-center">
        <h2 data-head className="display invisible text-title">
          Najčešće <em>birano</em>
        </h2>
        <div role="tablist" aria-label="Grupa artikala" className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[15px]">
          {chips.map((c) => {
            const on = c.id === cat
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => choose(c.id)}
                className={`relative flex min-h-10 items-center transition-opacity duration-300 ${on ? 'italic' : 'opacity-45 hover:opacity-100'}`}
              >
                <span className={`absolute -left-3.5 size-1.5 rounded-full bg-signal transition-transform duration-500 ${on ? 'scale-100' : 'scale-0'}`} />
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      <div ref={grid} className="mx-auto mt-[10vh] grid w-[calc(100%-40px)] grid-cols-2 gap-x-4 gap-y-12 md:w-[88vw] md:gap-x-[2vw] lg:grid-cols-4">
        {list.map((p, i) => (
          <div key={p.id} className={i % 2 ? 'lg:mt-[12vh]' : ''}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <div className="mt-[12vh] flex justify-center">
        <Cta href={cat === 'sve' ? '/prodavnica' : `/prodavnica?kategorija=${cat}`}>Cijeli katalog</Cta>
      </div>
    </section>
  )
}
