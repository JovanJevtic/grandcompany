'use client'

import { useState } from 'react'
import { resetFilters } from '@/lib/cart'
import { CATEGORIES, PRODUCTS, USES, artikala } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'
import SectionHead from './SectionHead'

// Četiri grupe iz kataloga (src/gc): opis primjene, fotografija ugradnje i ono što je stvarno u ponudi.
const MATERIALS = CATEGORIES.map((c) => {
  const items = PRODUCTS.filter((p) => p.category === c.id)
  return {
    ...c,
    uses: USES.filter((u) => items.some((p) => p.uses.includes(u.id))).map((u) => u.name),
    brands: [...new Set(items.map((p) => p.brand))],
    count: items.length,
  }
})

export default function Materials() {
  const [active, setActive] = useState(0)
  const scrollTo = useScrollTo()
  const m = MATERIALS[active]

  return (
    <section id="materijali" data-spy className="gutter scroll-mt-[var(--bar)] py-[14dvh]">
      <SectionHead
        no="06"
        label="Materijali"
        title="Znajte šta ugrađujete"
        lead="Gdje se koristi, po čemu se razlikuje i koje brendove držimo na stanju."
        meta={`${MATERIALS.length} grupe`}
      />

      <div className="mt-[8dvh] grid gap-8 md:grid-cols-12 md:gap-[1.5vw]">
        <div role="tablist" aria-label="Materijali" className="border-b-2 border-ink md:col-span-5 md:self-start">
          {MATERIALS.map((mat, i) => {
            const on = i === active
            return (
              <button
                key={mat.id}
                id={`mat-tab-${mat.id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="mat-panel"
                onClick={() => setActive(i)}
                className={`flex w-full items-baseline gap-4 border-t-2 border-ink px-3 py-5 text-left uppercase transition-colors duration-500 md:px-4 md:py-7 ${
                  on ? 'bg-ink text-bg' : 'hover:bg-ink/10'
                }`}
              >
                <span className="text-micro tabular-nums">0{i + 1}</span>
                <span className="text-[clamp(24px,3.2vw,56px)] leading-[0.95]">{mat.name}</span>
              </button>
            )
          })}
        </div>

        <div
          key={m.id}
          id="mat-panel"
          role="tabpanel"
          aria-labelledby={`mat-tab-${m.id}`}
          className="fade-up md:col-span-6 md:col-start-7"
        >
          {/* Fotografija ugradnje: ilustruje grupu, ne prikazuje konkretan artikal. */}
          <figure>
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <figcaption className="mt-2 text-micro uppercase text-ink/60">{m.name} · primjer ugradnje</figcaption>
          </figure>
          <p className="mt-6 max-w-[46ch] text-lead uppercase">{m.lead}</p>
          <p className="mt-4 max-w-[60ch] text-small normal-case leading-[1.3]">{m.usage}</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              ['Primjena', m.uses],
              ['Brendovi', m.brands],
            ].map(([label, list]) => (
              <div key={label as string}>
                <p className="text-micro uppercase text-ink/60">{label as string}</p>
                <ul className="mt-3 border-t-2 border-ink">
                  {(list as string[]).map((li) => (
                    <li key={li} className="border-b border-ink/25 py-2.5 text-small uppercase">
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                resetFilters({ category: m.id })
                scrollTo('prodavnica')
              }}
              className="border-2 border-ink px-4 py-3.5 text-micro uppercase transition-colors duration-300 hover:bg-ink hover:text-bg"
            >
              {artikala(m.count)} u katalogu →
            </button>
            <button
              type="button"
              onClick={() => scrollTo('ponuda')}
              className="px-1 py-3.5 text-micro uppercase underline underline-offset-4"
            >
              Zatraži tehnički list
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
