'use client'

import { ReactLenis, type LenisRef } from 'lenis/react'
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

declare global {
  interface Window {
    /** Lenis instanca koju SmoothScroll ostavlja za programsko skrolovanje (hero, mali znak, testovi). */
    __gcLenis?: {
      scrollTo: (y: number, o?: Record<string, unknown>) => void
      stop?: () => void
      start?: () => void
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
    // React je preuzeo stranicu: dijelovi koji zavise od podataka iz browsera (prijava, korpa) se sada pokažu.
    document.documentElement.setAttribute('data-hydrated', '')
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
    // Visina stranice se mijenja i posle učitavanja (pinovane sekcije, 3D scena, slike). Lenis pamti
    // staru granicu skrola, pa bi stao prije dna (footer odsječen). Mjeri se ponovo poslije svakog
    // ScrollTrigger osvježavanja i kad se promijeni visina tijela stranice.
    const resize = () => lenis?.resize()
    ScrollTrigger.addEventListener('refresh', resize)
    const ro = new ResizeObserver(resize)
    ro.observe(document.body)

    return () => {
      gsap.ticker.remove(update)
      lenis?.off('scroll', ScrollTrigger.update)
      ScrollTrigger.removeEventListener('refresh', resize)
      ro.disconnect()
    }
  }, [])

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.1 }}>
      {children}
    </ReactLenis>
  )
}
