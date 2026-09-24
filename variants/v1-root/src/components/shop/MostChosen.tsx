'use client'

import { useRef } from 'react'
import { COLORS } from '@/lib/content'
import { PRODUCTS } from '@/lib/shop'
import ProductCard from './ProductCard'
import ShopLink from './ShopLink'
import { Section, SectionHead } from './parts'

const LIST = PRODUCTS.filter((p) => p.featured)

// 003 — Najčešće birano (grand-root NewArrivals, preuređen u vodoravnu traku kao na Korvae referenci).
// Artikli su oni koje katalog označava kao izdvojene (`featured`).
export default function MostChosen() {
  const track = useRef<HTMLDivElement>(null)

  function move(dir: 1 | -1) {
    const el = track.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-slide]')
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 300) + 24), behavior: 'smooth' })
  }

  return (
    <Section id="najcesce" color={COLORS.what}>
      <SectionHead no="003" side="Najčešće birano" title="Najčešće" />

      <div data-reveal className="mt-[3vw] flex flex-wrap items-end justify-between gap-6 max-md:mt-6">
        <p className="copy-l max-w-[26ch]">
          Ono što izvođači <em>najčešće odvezu</em> sa našeg stovarišta.
        </p>
        <div className="flex gap-2">
          <button type="button" className="pill" aria-label="Prethodni artikli" onClick={() => move(-1)}>
            ←
          </button>
          <button type="button" className="pill" aria-label="Sljedeći artikli" onClick={() => move(1)}>
            →
          </button>
        </div>
      </div>

      <div
        ref={track}
        className="-mx-[var(--pad)] mt-[3vw] flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-[var(--pad)] px-[var(--pad)] pb-4 [scrollbar-width:none] max-md:mt-8 max-md:gap-4"
      >
        {LIST.map((p, i) => (
          <div key={p.id} data-slide className="w-[calc((100vw-2*var(--pad)-3*24px)/4)] min-w-[260px] shrink-0 snap-start max-md:w-[72vw]">
            <ProductCard p={p} index={i % 4} />
          </div>
        ))}
      </div>

      <div data-reveal className="mt-10 flex justify-end">
        <ShopLink href="/#katalog" className="pill">
          Cijeli katalog →
        </ShopLink>
      </div>
    </Section>
  )
}
