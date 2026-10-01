'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
export default function TitleReveal({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        const el = ref.current!
        // Podjela na slova malo mijenja širinu razmaka, pa se naslov može prelomiti u red manje i
        // sve ispod bi skočilo naviše. Visina se zato zaključa na onu prije podjele.
        const before = el.offsetHeight
        const split = revealChars(el, (context.conditions as { reduce: boolean }).reduce, 'top 95%')
        if (el.offsetHeight < before) el.style.minHeight = `${before}px`
        return () => {
          split.revert()
          el.style.minHeight = ''
        }
      })
    },
    { scope: ref },
  )
  return <h1 ref={ref} className={`${className} invisible`}>{children}</h1>
}
