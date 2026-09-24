'use client'

import { ReactLenis, type LenisRef } from 'lenis/react'
import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

// Stranica se uvijek skroluje OKOMITO. Na desktopu vertikalni točkić (i vodoravni potez po touchpadu,
// gestureOrientation: 'both') pomjera vodoravnu traku landinga, jer je ona zalijepljena i vezana za skrol
// (vidi Motion.tsx); kad traka stigne do kraja, skrol nastavlja u prodavnicu ispod.
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  // Bira se jednom, pri učitavanju. Ne utiče na HTML, pa nema greške pri hidrataciji.
  const [desktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches)

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    const lenis = lenisRef.current?.lenis
    lenis?.on('scroll', ScrollTrigger.update)

    return () => {
      gsap.ticker.remove(update)
      lenis?.off('scroll', ScrollTrigger.update)
    }
  }, [])

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.09,
        orientation: 'vertical',
        gestureOrientation: desktop ? 'both' : 'vertical',
      }}
    >
      {children}
    </ReactLenis>
  )
}
