'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'

const COLS = 10

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const wipe = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const cols = gsap.utils.toArray<HTMLElement>('[data-route-col]', wipe.current)
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        if (reduce) {
          gsap.set(cols, { scaleY: 0 })
          return
        }
        gsap.to(cols, {
          scaleY: 0,
          transformOrigin: '50% 0%',
          duration: 0.65,
          stagger: 0.045,
          ease: 'steps(7)',
        })
      })
    },
    { scope: wipe },
  )

  return (
    <>
      <div ref={wipe} className="pointer-events-none fixed inset-0 z-[800] flex" aria-hidden>
        {Array.from({ length: COLS }, (_, index) => (
          <span key={index} data-route-col className="h-full flex-1 origin-top bg-navy" />
        ))}
      </div>
      {children}
    </>
  )
}
