'use client'

/* eslint-disable @next/next/no-img-element -- editorijalne fotografije iz /public, već u WebP */

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { useMediaMotion } from '@/lib/media'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import Pw from '@/components/ui/Pw'

// Predah između prodaje i brendova: jedna rečenica i dvije portretne fotografije materijala.
// Lijeva slika ide uz stranicu, desna (niže postavljena) brže naviše — kolaž "diše" dok se skrola.
export default function Detail() {
  const root = useRef<HTMLElement>(null)
  useMediaMotion(root)

  useGSAP(
    () => {
      const el = root.current!
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce, mobile } = ctx.conditions as { reduce: boolean; mobile: boolean }
        revealChars(el.querySelector('[data-head]')!, reduce, 'top 80%')
        if (reduce || mobile) return
        gsap.fromTo(
          el.querySelector('[data-fast]'),
          { y: 160 },
          { y: -160, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative z-20 overflow-hidden bg-bg py-[22vh]" aria-label="Materijal">
      <h2 data-head className="display invisible mx-auto max-w-[16ch] px-5 text-center text-title"><Pw>
        Materijal koji se <em>ne vidi</em> kad je zid gotov.
      </Pw></h2>

      <div className="mx-auto mt-[14vh] grid w-[calc(100%-40px)] grid-cols-2 gap-4 md:w-[72vw] md:gap-[6vw]">
        <figure data-curtain data-parallax="10" className="aspect-[2/3] overflow-hidden bg-ink">
          <img src="/editorial/powder.webp" alt="Gipsani prah koji pada u tankom mlazu" className="h-full w-full object-cover" />
        </figure>
        <figure data-fast className="mt-[18vh] md:mt-[26vh]">
          <div data-curtain data-parallax="10" className="aspect-[2/3] overflow-hidden bg-plate">
            <img src="/editorial/boards-light.webp" alt="Ivica naslaganih gips-kartonskih ploča na suncu" className="h-full w-full object-cover" />
          </div>
          <figcaption className="mt-5 flex items-center gap-3 text-[14px] italic">
            <span className="opacity-60">Gips, vuna, čelik.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
