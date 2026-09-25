'use client'

import { resetFilters } from '@/lib/cart'
import { PRODUCTS, USES, artikala, type UseId } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'
import { Photo, SectionTitle } from '../ui'
import Reveal from './Reveal'

const PHOTO: Record<UseId, { src: string; alt: string }> = {
  'pregradni-zid': { src: '/stock/room-white.jpg', alt: 'Svijetla prostorija sa ravnim bijelim zidovima' },
  'spusteni-plafon': { src: '/stock/ceiling-work.jpg', alt: 'Montaža gips-kartonskih ploča na plafon' },
  fasada: { src: '/stock/eps-facade.jpg', alt: 'Fasada obložena stiroporom, sa skelom' },
  potkrovlje: { src: '/stock/attic-finished.jpg', alt: 'Uređeno potkrovlje sa krovnim prozorima' },
  podovi: { src: '/stock/room-wood.jpg', alt: 'Soba sa drvenim podom' },
}

// Layout: two wide tiles, then three tall ones (lg); on phones the first tile runs full width.
const SHAPE: { span: string; aspect: string }[] = [
  { span: 'col-span-2 lg:col-span-3', aspect: 'aspect-[3/2]' },
  { span: 'col-span-2 lg:col-span-3', aspect: 'aspect-[3/2]' },
  { span: 'col-span-1 lg:col-span-2', aspect: 'aspect-[4/5]' },
  { span: 'col-span-1 lg:col-span-2', aspect: 'aspect-[4/5]' },
  { span: 'col-span-2 lg:col-span-2', aspect: 'aspect-[3/2] lg:aspect-[4/5]' },
]

// Radovi: grand-maison UseCases (click filters the catalogue by kind of work) laid out as Korvae
// "Viđeno u prostorima" photo tiles.
export default function UseCases() {
  const scrollTo = useScrollTo()

  return (
    <section id="radovi" aria-labelledby="radovi-h" className="relative z-10 bg-canvas py-16 lg:py-24">
      <div className="gutter wrap">
        <SectionTitle
          id="radovi-h"
          title="Materijal po vrsti radova"
          lead="Izaberite posao i katalog pokazuje samo ono što za njega treba."
        />

        <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-5 lg:grid-cols-6 lg:gap-y-10">
          {USES.map((u, i) => {
            const n = PRODUCTS.filter((p) => p.uses.includes(u.id)).length
            const { span, aspect } = SHAPE[i]
            return (
              <li key={u.id} className={span}>
                <Reveal delay={(i % 3) * 90}>
                  <button
                    type="button"
                    onClick={() => {
                      resetFilters({ use: u.id })
                      scrollTo('katalog')
                    }}
                    className="group block w-full text-left"
                  >
                    <Photo
                      src={PHOTO[u.id].src}
                      alt={PHOTO[u.id].alt}
                      sizes={i < 2 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 33vw, 50vw'}
                      className={`w-full ${aspect}`}
                      imgClassName="transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.04]"
                    />
                    <span className="mt-3 flex items-baseline justify-between gap-4">
                      <span className="text-[16px] font-medium md:text-[17px]">{u.name}</span>
                      <span className="shrink-0 text-[13px] text-muted tnum">
                        {artikala(n)} <span aria-hidden>→</span>
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[13px] text-muted">{u.hint}</span>
                  </button>
                </Reveal>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
