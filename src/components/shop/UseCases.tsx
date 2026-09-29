'use client'

import { PRODUCTS, USES, artikala } from '@/lib/shop'
import SectionHead from './SectionHead'

// Pet vrsta radova. Klik je ranije postavljao filter u katalogu; katalog je uklonjen,
// pa su blokovi sada samo informacija — bez akcije i bez strelice.
export default function UseCases() {
  return (
    <section id="namjena" className="pt-[12dvh]">
      <div className="gutter">
        <SectionHead no="05" label="Po namjeni" meta={`${USES.length} vrsta radova`} />
      </div>

      <ul className="mt-[8dvh] border-b-2 border-ink">
        {USES.map((u, i) => {
          const n = PRODUCTS.filter((p) => p.uses.includes(u.id)).length
          return (
            <li
              key={u.id}
              className="gutter grid grid-cols-[auto_1fr_auto] items-center gap-4 border-t-2 border-ink py-6 uppercase md:grid-cols-12 md:gap-[1.5vw] md:py-8"
            >
              <span className="text-micro tabular-nums md:col-span-1">0{i + 1}</span>
              <span className="text-[clamp(24px,3.4vw,60px)] leading-[0.95] md:col-span-6">{u.name}</span>
              <span className="hidden text-micro opacity-60 md:col-span-3 md:block">{u.hint}</span>
              <span className="whitespace-nowrap text-micro md:col-span-2 md:text-right">{artikala(n)}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
