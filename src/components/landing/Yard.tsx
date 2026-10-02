'use client'

import { useRef } from 'react'
import Pw from '@/components/ui/Pw'
import { useMediaMotion } from '@/lib/media'

// Stovarište (prije podnožja): dvije velike fotografije dvorišta; na hover se preko fotografije
// meko (i brzo) prelije plava ilustracija istog kadra — kao „nacrt" preko slike.
// Tekst: rečenica o firmi. Sekcija je usputna, mirna, u jeziku ostatka sajta.
const PANELS = [
  {
    photo: '/stovariste/yard.webp',
    blue: '/stovariste/yard-blue.webp',
    alt: 'Stovarište Grand Company iz vazduha — redovi paleta građevinskog materijala',
    label: 'Dvorište odozgo',
    note: 'Palete ploča, izolacije i veziva, složene po vrsti',
  },
  {
    photo: '/stovariste/shop.webp',
    blue: '/stovariste/shop-blue.webp',
    alt: 'Ulaz u stovarište Grand Company sa natkrivenom prodajnom zonom',
    label: 'Ulaz i prodaja',
    note: 'Natkrivena zona za utovar i preuzimanje',
  },
]

export default function Yard() {
  const root = useRef<HTMLElement>(null)
  useMediaMotion(root)

  return (
    <section ref={root} id="stovariste" aria-label="Stovarište" className="relative z-[46] bg-bg pt-[10vh]">
      <div className="gutter">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 border-b border-ink/20 pb-7">
          <div className="min-w-0">
            <p className="label text-ink/50" data-up>
              Stovarište
            </p>
            <h2 className="display mt-4 max-w-[13ch] text-[clamp(36px,4.4vw,76px)]" data-up>
              <Pw>Naše dvorište i magacin</Pw>
            </h2>
          </div>
          <p className="max-w-[46ch] text-[12.5px] leading-[1.7] text-ink/70 md:text-right" data-up data-delay="1">
            Grand Company d.o.o. već dugi niz godina uspješno posluje i vodeća je firma u Banja Luci kada je u pitanju
            prodaja građevinskog materijala.
          </p>
        </div>
      </div>

      <div className="mt-[5vh] grid gap-px border-y border-ink/20 bg-ink/20 md:grid-cols-2">
        {PANELS.map((p) => (
          <figure key={p.photo} data-curtain data-cursor="Pređi" className="group relative m-0 bg-bg">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                decoding="async"
                loading="lazy"
                src={p.photo}
                alt={p.alt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.03]"
              />
              {/* Plava ilustracija istog kadra: prelije se preko fotografije na hover (brzo, meko). */}
              <img
                aria-hidden
                decoding="async"
                loading="lazy"
                src={p.blue}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ease-[var(--ease-out)] group-hover:opacity-100 group-focus-within:opacity-100"
              />
            </div>
            <figcaption className="px-5 py-4 text-[11px] tracking-[0.06em]">
              <span className="font-medium">{p.label}</span>
              <span className="mt-1 block max-w-[52ch] leading-[1.5] text-ink/45">
                <span className="hidden [@media(hover:hover)]:inline">Pređi mišem · </span>
                {p.note}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}