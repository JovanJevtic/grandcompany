'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'

// Prelaz sa neba na bijelo: dok je hero još pinovan na nebu, odozdo se dižu bijele kolone,
// svaka malo kasnije od prethodne, pa ivica bijelog lista ide kao stepenište koje "briše" nebo
// slijeva nadesno. Kad hero pusti pin, ekran je već potpuno bijel i sadržaj teče dalje.
// Sekcija se negativnom marginom podvlači pod zadnji ekran herosa (vidi .sky-swipe u globals.css).

const COLS = 12

export default function SkySwipe() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const cols = gsap.utils.toArray<HTMLElement>('[data-col]', el)
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce, mobile } = ctx.conditions as { reduce: boolean; mobile: boolean }
        if (reduce) {
          gsap.set(cols, { scaleY: 1 })
          return
        }
        const visible = mobile ? cols.filter((_, i) => i % 2 === 0) : cols
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: 0.5 },
        })
        // Svaka kolona raste u skokovima (steps), a kasni za lijevom susjedom.
        visible.forEach((c, i) => {
          tl.fromTo(c, { scaleY: 0 }, { scaleY: 1, ease: 'steps(8)', duration: 1 }, i * 0.14)
        })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} id="swipe" className="sky-swipe pointer-events-none relative z-20 flex h-[100svh] items-end" aria-hidden>
      {Array.from({ length: COLS }, (_, i) => (
        <span
          key={i}
          data-col
          className={`h-full flex-1 origin-bottom bg-bg ${i % 2 ? 'max-md:hidden' : ''}`}
          style={{ transform: 'scaleY(0)' }}
        />
      ))}
    </div>
  )
}
