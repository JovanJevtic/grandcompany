'use client'

import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { revealLines } from '@/lib/fx'
import { EASE, prefersReducedMotion } from '@/lib/motion'

// Ulazne animacije za sve sekcije, po oznakama u HTML-u:
//   data-split   naslov: red po red izlazi iz maske
//   data-reveal  ostali elementi: blago izlaze prema gore, u talasima
// Sa "smanji pokrete" se ništa ne skriva, sve je odmah na svom mjestu.
export default function ScrollFx() {
  useGSAP(() => {
    if (prefersReducedMotion()) return

    gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => revealLines(el))

    gsap.set('[data-reveal]', { autoAlpha: 0, y: 28 })
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 92%',
      once: true,
      onEnter: (els) =>
        gsap.to(els, {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: EASE.expo,
          stagger: 0.08,
          overwrite: true,
          clearProps: 'opacity,visibility,transform', // da CSS hover stanja poslije rade
        }),
    })
  })

  return null
}
