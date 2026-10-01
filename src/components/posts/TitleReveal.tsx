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
        const split = revealChars(ref.current!, (context.conditions as { reduce: boolean }).reduce, 'top 95%')
        return () => split.revert()
      })
    },
    { scope: ref },
  )
  return <h1 ref={ref} className={`${className} invisible`}>{children}</h1>
}
