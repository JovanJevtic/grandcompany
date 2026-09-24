'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { TONES, revealChars, revealLines, revealMedia } from '@/lib/reveal'

export default function Services() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }

        revealMedia(el.querySelector('[data-services-img]')!, reduce)
        revealChars(el.querySelector('[data-caption]')!, reduce, 'top 94%')
        revealLines(el.querySelector('[data-para]')!, reduce)

        // Sive ploče se smjenjuju dok se skrola kroz sekciju (skrol vodi izbor, ne tajmer).
        const layers = gsap.utils.toArray<HTMLElement>('[data-layer]', el)
        if (reduce) return
        let current = 0
        ScrollTrigger.create({
          trigger: el,
          start: 'top 50%',
          end: 'bottom top',
          onUpdate: (self) => {
            const i = Math.min(layers.length - 1, Math.floor(self.progress * layers.length))
            if (i === current) return
            current = i
            gsap.to(layers, { opacity: (j) => (j === i ? 1 : 0), duration: 0.5, overwrite: true })
          },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative z-10 flex min-h-dvh flex-col items-center justify-end px-[45px] pb-[8dvh]">
      <div className="flex w-full flex-col items-center">
        <div
          data-services-img
          className="relative mb-10 aspect-[0.8/1] w-[15vw] min-w-[140px] overflow-hidden"
          style={{ clipPath: 'inset(0% 50% 0% 50%)' }}
        >
          <div data-scale className="absolute inset-0">
            {TONES.map((tone, i) => (
              <div
                key={tone}
                data-layer
                className="absolute inset-0"
                style={{ background: tone, opacity: i === 0 ? 1 : 0 }}
              />
            ))}
          </div>
        </div>

        <p data-caption className="invisible text-[18px] uppercase leading-none">
          Šta nudimo
        </p>

        <p
          data-para
          className="para invisible mt-[5dvh] w-full text-[clamp(20px,2.6vw,48px)] uppercase leading-none"
        >
          Građevinski materijal za gradnju i opremanje objekata. — Sistemi suhe gradnje za građenje i
          uređenje enterijera. — Kamena vuna kao izolacioni materijal. — Drvo i sanitarna oprema. —
          Veleprodaja i maloprodaja, za privatne kupce i za izvođače radova. — Pristupačne cijene i
          stručan savjet, u Banjoj Luci od 2012. godine.
        </p>
      </div>
    </section>
  )
}
