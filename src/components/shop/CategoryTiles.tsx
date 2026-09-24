'use client'

/* eslint-disable @next/next/no-img-element -- statične fotografije iz /public */
import type { CSSProperties } from 'react'
import { resetFilters } from '@/lib/cart'
import { CATEGORIES, PRODUCTS, artikala } from '@/lib/shop'
import { useInView } from '@/lib/useInView'
import { useScrollTo } from '@/lib/useScrollTo'
import SectionHead from './SectionHead'

// Kategorije kao velike foto-pločice (obrazac iz Korvae inspiracije), u jeziku grand-maison: linije od 2px,
// uppercase grotesk, ploča se otvara iz srednje linije. Fotografija prikazuje primjenu grupe, ne artikal.
function Tile({ index }: { index: number }) {
  const c = CATEGORIES[index]
  const [ref, seen] = useInView<HTMLLIElement>()
  const scrollTo = useScrollTo()
  const n = PRODUCTS.filter((p) => p.category === c.id).length

  return (
    <li ref={ref} data-reveal data-in={seen ? '' : undefined} className="border-t-2 border-ink first:border-t-0 md:border-t-0">
      <button
        type="button"
        onClick={() => {
          resetFilters({ category: c.id })
          scrollTo('prodavnica')
        }}
        className="group relative block w-full overflow-hidden text-left text-bg"
      >
        <div
          data-plate
          className="relative aspect-[4/5] w-full md:aspect-[3/4]"
          style={{ '--d': `${index * 90}ms` } as CSSProperties}
        >
          <img
            src={c.photo}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/0" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 uppercase md:p-[1.6vw]">
          <p className="flex justify-between text-micro">
            <span className="tabular-nums">0{index + 1}</span>
            <span>{artikala(n)}</span>
          </p>
          <h3 className="text-[clamp(26px,2.6vw,48px)] leading-[0.95]">{c.name}</h3>
          <p className="max-w-[30ch] text-micro opacity-80">{c.lead}</p>
          <span className="mt-1 inline-flex w-fit items-center gap-3 border-2 border-bg px-3 py-2 text-micro transition-colors duration-300 group-hover:bg-bg group-hover:text-ink">
            Pogledaj <span aria-hidden>→</span>
          </span>
        </div>
      </button>
    </li>
  )
}

export default function CategoryTiles() {
  return (
    <section id="kategorije" data-spy className="scroll-mt-[var(--bar)] pt-[14dvh]">
      <div className="gutter">
        <SectionHead
          no="01"
          label="Kategorije"
          title="Šta držimo na stanju"
          lead="Četiri grupe materijala za suhu gradnju i izolaciju. Fotografije prikazuju primjenu, ne pojedinačni artikal."
          meta={`${CATEGORIES.length} grupe`}
        />
      </div>
      <ul className="mt-[8dvh] grid border-y-2 border-ink md:grid-cols-4 md:divide-x-2 md:divide-ink">
        {CATEGORIES.map((c, i) => (
          <Tile key={c.id} index={i} />
        ))}
      </ul>
    </section>
  )
}
