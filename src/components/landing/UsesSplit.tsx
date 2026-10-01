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

// Sistemi: lijevo stoji naslov, desno (tamno plava kolona) se skrola pet sistema iz kataloga
// (W111/W112 zid, D112 plafon, DEMIT fasada, potkrovlje, podovi). Uz svaki ide rastavljeni
// presjek sistema koji se iscrtava i razmiče po slojevima dok red prolazi kroz ekran.

// Sistemi iz kataloga (PDF, tačka 4): oznaka sistema, naziv i šta ulazi u njega — stvarni artikli.
const SYSTEM: Record<UseId, { code: string; title: string; text: string }> = {
  'pregradni-zid': {
    code: 'Knauf W111 / W112',
    title: 'Pregradni zid',
    text: 'Gips-kartonske ploče GKB, GKBI, GKF i Diamant 12,5 mm na CW i UW profilima (lim 0,6 mm), kamena vuna NaturBoard u šupljini.',
  },
  'spusteni-plafon': {
    code: 'Knauf D112',
    title: 'Spušteni plafon',
    text: 'Nosivi i montažni CD 60/27 profili, obodni UD 28/27 i direktni ovjes 120 mm, obloga od gips-kartonskih ploča.',
  },
  fasada: {
    code: 'DEMIT',
    title: 'Kontaktna fasada',
    text: 'Fasadni stiropor EPS 70 ili grafitni Neopor, Ceresit CT 83 za lijepljenje i CT 85 za armiranje mrežice.',
  },
  potkrovlje: {
    code: 'Izolacija',
    title: 'Potkrovlje',
    text: 'Staklena vuna Unifit 035 u rolni za kose krovove, kamena vuna 100 mm i obloga od ploča na CD profilima.',
  },
  podovi: {
    code: 'Podovi i temelji',
    title: 'Podovi',
    text: 'Podni stiropor EPS 100, stirodur XPS za temelje i cokle, cement Lukavac CEM II 42,5N i Ceresit CM 16 za keramiku.',
  },
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
        <p className="label opacity-60">Kompletan sistemski asortiman</p>
        <h2 data-head className="display invisible text-[clamp(48px,6.6vw,124px)]">
          <Pw>Sistemi</Pw>
        </h2>
        <p className="max-w-[40ch] text-[13px] leading-[1.6] opacity-70">
          Ploče, profili, veziva, spojnice, izolacija i zaptivne trake za svaki sistem — na jednom mjestu.
        </p>
        <Cta href="/prodavnica">Katalog</Cta>
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
              <p className="label text-accent">{SYSTEM[u.id].code}</p>
              <h3 data-title className="display invisible -mt-6 text-[clamp(36px,3.8vw,68px)]">
                <Pw>{SYSTEM[u.id].title}</Pw>
              </h3>
              <UseArt use={u.id} className="w-full max-w-[520px] text-bg/90" title={`Presjek sistema: ${SYSTEM[u.id].title}`} />
              <p className="max-w-[46ch] text-[12.5px] leading-[1.6] opacity-80">{SYSTEM[u.id].text}</p>
              <Link href={`/prodavnica?namjena=${u.id}`} className="ulink text-[12.5px] max-md:py-3">
                {artikala(items.length)} →
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
