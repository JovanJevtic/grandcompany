'use client'

import Link from 'next/link'
import Cta from '@/components/ui/Cta'
import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { drawOnScroll } from '@/lib/draw'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import { PRODUCTS, USES, artikala, type UseId } from '@/lib/shop'
import { axisShift } from './iso'
import UseArt from './UseArt'
import Pw from '@/components/ui/Pw'

// Po namjeni: lijevo stoji naslov, desno (tamno plava kolona) se skrola pet vrsta radova.
// Uz svaku ide rastavljeni presjek sistema koji se iscrtava i razmiče po slojevima dok red
// prolazi kroz ekran. Namjerno malo teksta: naslov, jedna rečenica, link.

const COPY: Record<UseId, string> = {
  'pregradni-zid': 'Profili, ploče i vuna u šupljini — zid koji ne čujete.',
  'spusteni-plafon': 'Mreža CD profila na ovjesima, a iznad mjesta za instalacije.',
  fasada: 'Stiropor, ljepilo i mrežica. Topla kuća bez debljeg zida.',
  potkrovlje: 'Vuna ispod rogova i obloga od ploča. Tavan postaje soba.',
  podovi: 'Izolacija, estrih, ljepilo. Plivajući pod sloj po sloj.',
}

export default function UsesSplit() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }

        revealChars(el.querySelector('[data-head]')!, reduce, 'top 75%')

        gsap.utils.toArray<HTMLElement>('[data-use]', el).forEach((row) => {
          revealChars(row.querySelector('[data-title]')!, reduce, 'top 80%', row)

          const svg = row.querySelector('svg')!
          drawOnScroll(svg, reduce, { trigger: row, start: 'top 70%', duration: 1.2 })


          if (reduce) return
          // Razmicanje slojeva: od sklopljenog sistema (red ulazi) do rastavljenog (red izlazi).
          const axis = svg.dataset.axis as 'x' | 'y' | 'z'
          const gap = Number(svg.dataset.gap)
          gsap.utils.toArray<SVGGElement>('[data-layer]', svg).forEach((layer, k) => {
            const { x, y } = axisShift(axis, k * gap)
            gsap.fromTo(
              layer,
              { x: 0, y: 0 },
              { x, y, ease: 'none', scrollTrigger: { trigger: row, start: 'top 60%', end: 'bottom 30%', scrub: 0.8 } },
            )
          })
        })

      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="namjena" className="relative z-20 bg-bg md:grid md:grid-cols-2" aria-label="Materijal po vrsti radova">
      {/* Lijevo: naslov stoji dok se desno skrola. */}
      <div className="flex flex-col items-center justify-center gap-12 px-5 py-[16vh] text-center md:sticky md:top-0 md:h-dvh md:self-start">
        <h2 data-head className="display invisible text-[clamp(56px,8vw,150px)]"><Pw>
          Po <em>namjeni</em>
        </Pw></h2>
        <Cta href="/prodavnica">Radovi</Cta>
      </div>

      {/* Desno: tamno plava kolona, pet vrsta radova. */}
      <div className="bg-navy text-bg [--art-fill:var(--navy)]">
        {USES.map((u) => {
          const items = PRODUCTS.filter((p) => p.uses.includes(u.id))
          return (
            <article
              key={u.id}
              data-use
              className="flex flex-col items-center gap-10 border-b border-bg/10 px-6 py-[14vh] text-center md:min-h-dvh md:justify-center md:px-[5vw]"
            >
              <h3 data-title className="display invisible text-[clamp(40px,4.2vw,76px)]"><Pw>
                {u.name}
              </Pw></h3>
              <UseArt use={u.id} className="w-full max-w-[520px] text-bg/90" title={`Presjek sistema: ${u.name}`} />
              <p className="max-w-[34ch] text-[clamp(16px,1.25vw,20px)] italic leading-[1.4] opacity-80">{COPY[u.id]}</p>
              <Link href={`/prodavnica?namjena=${u.id}`} className="ulink text-[15px]">
                {artikala(items.length)} →
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
