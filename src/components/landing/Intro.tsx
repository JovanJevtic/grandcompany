'use client'

/* eslint-disable @next/next/no-img-element -- editorijalne fotografije iz /public, već u WebP */

import { useRef } from 'react'
import Cta from '@/components/ui/Cta'
import { gsap, useGSAP } from '@/lib/gsap'
import { useMediaMotion } from '@/lib/media'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import Pw from '@/components/ui/Pw'

// Prvi ekran poslije herosa: ko smo (B2B veleprodaja, Knauf distributer), dva ulaza — B2B portal
// i maloprodaja — i kolaž od dvije fotografije.
// Velika slika se otvara odozdo i klizi sporije od stranice, mala portretna preko nje brže —
// razlika u brzini daje dubinu. id="radovi" je okidač za odlazak velikog wordmarka (SiteChrome).
export default function Intro() {
  const root = useRef<HTMLElement>(null)
  useMediaMotion(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        revealChars(root.current!.querySelector('[data-head]')!, reduce, 'top 80%')
        if (reduce) return
        const el = root.current!
        gsap.fromTo(
          el.querySelector('[data-small]'),
          { yPercent: 30 },
          { yPercent: -40, ease: 'none', scrollTrigger: { trigger: el.querySelector('[data-collage]'), start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="radovi" className="relative z-20 bg-bg pb-[18vh] pt-[24vh] text-center">
      <p data-up className="label mb-8 opacity-60">Veleprodaja građevinskog materijala · Banja Luka</p>
      <h2 data-head className="display invisible mx-auto max-w-[14ch] px-5 text-[clamp(40px,7.4vw,128px)]">
        <Pw>Građevinski materijal za profesionalce</Pw>
      </h2>
      <p data-up className="mx-auto mt-10 max-w-[56ch] px-5 text-lead opacity-80">
        Snabdijevamo građevinske firme i izvođače: materijal sa stovarišta u Banjoj Luci, vaša cijena i dostava
        vlastitim kamionima sa kranom — direktno na gradilište. Suha gradnja i Knauf sistemi su naša specijalizacija.
      </p>
      <div data-up data-delay="0.1" className="mt-12 flex flex-wrap justify-center gap-3">
        <Cta href="/portal" solid>
          B2B portal
        </Cta>
        <Cta href="/prodavnica">Maloprodaja</Cta>
      </div>

      <div data-collage className="relative mx-auto mt-[16vh] w-[calc(100%-40px)] md:w-[78vw]">
        <figure data-curtain data-parallax="8" className="relative aspect-[3/2] overflow-hidden bg-plate" data-cursor="Katalog">
          <img decoding="async" loading="lazy" src="/editorial/materials-still.webp" alt="Ploče, profili i kamena vuna u praznoj betonskoj sobi" className="absolute inset-0 h-full w-full object-cover" />
        </figure>
        <figure
          data-small
          className="absolute -bottom-[10%] -left-[2%] hidden aspect-[2/3] w-[22%] overflow-hidden bg-plate shadow-[0_30px_60px_-30px_rgba(27,36,54,.45)] md:block"
        >
          <div data-curtain className="h-full w-full">
            <img decoding="async" loading="lazy" src="/editorial/frame-rhythm.webp" alt="" className="h-full w-full object-cover" />
          </div>
        </figure>
        <figcaption data-up className="mt-6 flex items-center justify-end gap-3 text-[12.5px] md:mt-8">
          <span className="opacity-70">Od materijala do gradilišta — iz jednog skladišta.</span>
        </figcaption>
      </div>
    </section>
  )
}
