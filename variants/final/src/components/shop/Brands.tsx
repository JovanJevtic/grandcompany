'use client'

import { BRAND_NOTES } from '@/gc/gc'
import { resetFilters } from '@/lib/cart'
import { BRANDS } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'
import { SectionTitle } from '../ui'

// Brendovi: text wordmarks with the one-line note from BRAND_NOTES. No logo images (none are licensed).
export default function Brands() {
  const scrollTo = useScrollTo()
  // "Lukavac" in BRAND_NOTES is "Cement Lukavac" in the product data
  const filterName = (name: string) => BRANDS.find((b) => b === name || b.endsWith(` ${name}`))

  return (
    <section id="brendovi" aria-labelledby="brendovi-h" className="relative z-10 border-t border-ink/12 bg-canvas py-16 lg:py-24">
      <div className="gutter wrap">
        <SectionTitle id="brendovi-h" title="Brendovi" />
        <ul className="mt-8 grid border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {BRAND_NOTES.map(([name, note], i) => {
            const b = filterName(name)
            return (
              <li
                key={name}
                className={`border-b border-ink/15 py-6 sm:px-6 lg:border-b-0 ${i % 2 === 0 ? 'sm:pl-0' : 'sm:border-l'} ${
                  i === 2 ? 'lg:border-l lg:pl-6' : ''
                }`}
              >
                <p className="font-display text-[26px] font-medium leading-none tracking-[-0.02em] md:text-[30px]">{name}</p>
                <p className="mt-3 max-w-[34ch] text-[14px] leading-[1.55] text-muted">{note}</p>
                {b && (
                  <button
                    type="button"
                    className="link-u mt-4 text-[13px] font-medium"
                    onClick={() => {
                      resetFilters({ brand: b })
                      scrollTo('katalog')
                    }}
                  >
                    Artikli u katalogu →
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
