'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'

// Prelaz između stranica: sadržaj se mirno pretopi i blago podigne (korporativno, bez "zavjesa").
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        if (reduce) return
        gsap.fromTo(root.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', clearProps: 'transform' })
      })
    },
    { scope: root },
  )

  return <div ref={root}>{children}</div>
}
