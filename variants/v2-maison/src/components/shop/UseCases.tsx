'use client'

import { resetFilters } from '@/lib/cart'
import { PRODUCTS, USES, artikala } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'
import SectionHead from './SectionHead'

// Popis radova. Klik postavlja filter "Namjena" u prodavnici i klizi do nje.
export default function UseCases() {
  const scrollTo = useScrollTo()

  return (
    <section id="namjena" data-spy className="scroll-mt-[var(--bar)] py-[14dvh]">
      <div className="gutter">
        <SectionHead
          no="04"
          label="Po namjeni"
          title="Šta gradite?"
          lead="Izaberite vrstu radova i vidite samo materijal koji vam treba."
          meta={`${USES.length} vrsta radova`}
        />
      </div>

      <ul className="mt-[8dvh] border-b-2 border-ink">
        {USES.map((u, i) => {
          const n = PRODUCTS.filter((p) => p.uses.includes(u.id)).length
          return (
            <li key={u.id} className="border-t-2 border-ink">
              <button
                type="button"
                onClick={() => {
                  resetFilters({ use: u.id })
                  scrollTo('prodavnica')
                }}
                className="gutter grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-5 text-left uppercase transition-colors duration-500 hover:bg-ink hover:text-bg md:grid-cols-12 md:gap-[1.5vw] md:py-7"
              >
                <span className="text-micro tabular-nums md:col-span-1">0{i + 1}</span>
                <span className="text-[clamp(26px,4vw,72px)] leading-[0.95] md:col-span-6">{u.name}</span>
                <span className="hidden text-micro opacity-60 md:col-span-3 md:block">{u.hint}</span>
                <span className="whitespace-nowrap text-micro md:col-span-2 md:text-right">
                  {artikala(n)} <span aria-hidden>→</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
