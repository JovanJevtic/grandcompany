'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
export default function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        if ((context.conditions as { reduce: boolean }).reduce) return
        gsap.fromTo(bar.current, { scaleX: 0 }, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: true },
        })
      })
    },
    { scope: bar },
  )
  return <div ref={bar} className="fixed inset-x-0 top-0 z-[700] h-1 origin-left bg-accent" />
}
