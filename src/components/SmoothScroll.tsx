'use client'

import { ReactLenis, type LenisRef } from 'lenis/react'
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

declare global {
  interface Window {
    /** Lenis instanca koju SmoothScroll ostavlja za programsko skrolovanje (hero, mali znak, testovi). */
    __gcLenis?: {
      scrollTo: (y: number, o?: Record<string, unknown>) => void
      options?: Record<string, unknown>
    } | null
  }
}

// Lenis mora da vozi GSAP-ov ticker, inače animacije "kasne" za skrolom.
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  // Browser pri reload-u vraća staru poziciju skrola dok se 3D scena još učitava i visine sekcija
  // se mijenjaju — triggeri se tada izmjere na pogrešnim mjestima (skokovi, sadržaj koji ne izroni).
  // Scrollytelling uvijek kreće od vrha.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    function update(time: number) {
      const lenis = lenisRef.current?.lenis
      lenis?.raf(time * 1000)
      // Ostavljamo ručku za programsko skrolovanje (npr. scrubber u Kaolin sekciji).
      window.__gcLenis = lenis ?? null
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
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.1 }}>
      {children}
    </ReactLenis>
  )
}
