'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, EV } from '@/lib/motion'

// Kontakt: četiri stupca sitnog teksta u dnu. Pojavljuju se kad se prsten "pikselizira" (vidi Constellation.tsx).
export default function Contact() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const items = root.current!.querySelectorAll('[data-c]')
      gsap.set(items, { autoAlpha: 0, y: 14 })
      const on = (e: Event) => {
        const open = !!(e as CustomEvent<boolean>).detail
        gsap.to(
          items,
          open
            ? { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE.expo, stagger: 0.08, delay: 0.7, overwrite: 'auto' }
            : { autoAlpha: 0, y: 14, duration: 0.35, stagger: 0.03, overwrite: 'auto' },
        )
      }
      window.addEventListener(EV.contact, on)
      return () => window.removeEventListener(EV.contact, on)
    },
    { scope: root },
  )

  const col = 'info absolute bottom-[38px] leading-[25px] font-medium text-fg'
  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-20">
      <div data-c className={`${col} left-10 w-[200px] max-md:left-5`}>
        GRAND COMPANY d.o.o.
        <span className="flex justify-between">
          <span>Banja Luka</span>
          <span>2012</span>
        </span>
      </div>
      <div data-c className={`${col} left-[35%] max-md:hidden`}>
        Građevinski materijal
        <br />
        veleprodaja i maloprodaja
      </div>
      <div data-c className={`${col} left-[63.6%] max-md:left-[52%]`}>
        Predrag Uzelac
        <br />
        vlasnik i direktor
      </div>
      <div data-c className={`${col} right-10 text-right max-md:hidden`}>
        Poslujemo od
        <br />
        23. aprila 2012.
      </div>
    </div>
  )
}
