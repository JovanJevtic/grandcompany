'use client'

import { useRef } from 'react'
import { useShop } from '@/lib/cart'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { PRODUCTS } from '@/lib/shop'
import ProductCard from './ProductCard'
import SectionHead from './SectionHead'

const NEW = PRODUCTS.filter((p) => p.isNew)
const pad = (n: number) => String(n).padStart(2, '0')

// Na desktopu se sekcija pina, a skrol stranice pomjera artikle ulijevo. Na mobilnom je običan swipe.
// id stoji na vanjskom elementu: pin ubacuje spacer oko sekcije, pa link vodi na početak cijelog puta.
export default function NewArrivals() {
  const root = useRef<HTMLDivElement>(null)
  const { cart, saved } = useShop()

  useGSAP(
    () => {
      const el = root.current!
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { reduce, mobile } = ctx.conditions as { reduce: boolean; mobile: boolean }
        if (reduce || mobile) return

        const section = el.querySelector<HTMLElement>('[data-pin]')!
        const track = el.querySelector<HTMLElement>('[data-track]')!
        const bar = el.querySelector<HTMLElement>('[data-progress]')!
        const count = el.querySelector<HTMLElement>('[data-count]')!
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)

        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${dist()}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                count.textContent = pad(1 + Math.round(self.progress * (NEW.length - 1)))
              },
            },
          })
          .to(track, { x: () => -dist(), ease: 'none' }, 0)
          .to(bar, { scaleX: 1, ease: 'none' }, 0)
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} id="novo" data-spy className="scroll-mt-[var(--bar)]">
      <section
        data-pin
        className="relative flex flex-col overflow-x-clip pb-[110px] pt-[calc(var(--bar)+5dvh)] md:min-h-dvh"
      >
        <div className="gutter">
          <SectionHead
            no="01"
            label="Novo"
            title="Novo u ponudi"
            lead="Nova roba na policama. Prevucite ili skrolajte da vidite sve."
            meta={`${NEW.length} novih`}
          />
        </div>

        <div className="hs-viewport mt-[5dvh] md:mt-auto">
          <div data-track className="flex w-max gap-4 px-5 md:gap-[2vw] md:px-[8.33vw]">
            {NEW.map((p, i) => (
              <div key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[44vw] md:w-[31dvh] md:min-w-[250px]">
                <ProductCard product={p} index={i} qty={cart[p.id] ?? 0} saved={saved.includes(p.id)} reveal={false} />
              </div>
            ))}
          </div>
        </div>

        {/* Brojač i linija napretka: vide se samo dok skrol vodi kretanje. */}
        <div className="gutter mt-8 hidden items-center gap-5 text-micro uppercase md:flex motion-reduce:hidden">
          <span className="tabular-nums">
            <span data-count>01</span> / {pad(NEW.length)}
          </span>
          <div className="h-[2px] flex-1 bg-ink/20">
            <div data-progress className="h-full origin-left scale-x-0 bg-ink" />
          </div>
        </div>
      </section>
    </div>
  )
}
