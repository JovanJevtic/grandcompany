'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { revealLines } from '@/lib/reveal'

export default function Manifest() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const box = el.querySelector('[data-box]')!
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        if (reduce) gsap.set(box, { clipPath: 'inset(0% 0% 0% 0%)' })
        else {
          // Okvir se otvara iz sredine, a tek onda izranja tekst.
          gsap.fromTo(
            box,
            { clipPath: 'inset(50% 50% 50% 50%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.2,
              ease: EASE.quintInOut,
              scrollTrigger: { trigger: box, start: 'top 80%' },
            },
          )
        }
        revealLines(el.querySelector('[data-lines]')!, reduce, 'top 72%')
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative z-10 flex w-full flex-col items-center py-[20dvh]">
      <div
        data-box
        className="w-[88vw] border-[10px] border-ink px-[3vw] py-[50px] md:w-[48.75vw]"
        style={{ clipPath: 'inset(50% 50% 50% 50%)' }}
      >
        <p
          data-lines
          className="invisible text-center text-[clamp(14px,1.56vw,28px)] uppercase leading-none"
        >
          Pristupačne cijene
          <br />
          i stručan savjet
          <br />
          za svakog investitora,
          <br />
          a ne samo za velike
          <br />
          izvođače radova.
        </p>
      </div>
    </section>
  )
}
