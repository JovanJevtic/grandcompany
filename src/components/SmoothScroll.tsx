'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { EV, prefersReducedMotion } from '@/lib/motion'
import { lockScroll, setLenis, unlockScroll } from '@/lib/scroll'

// Glatki skrol (Lenis) vezan za GSAP ticker, pa ScrollTrigger vidi isti položaj kao i ono što je na ekranu.
// Stranica se ne skroluje dok traje loader i dok je kontakt otvoren (vidi lib/scroll.ts).
export default function SmoothScroll() {
  useEffect(() => {
    // svako učitavanje kreće od heroja (loader ionako pokriva stranicu)
    history.scrollRestoration = 'manual'

    if (document.documentElement.dataset.ready !== '1') lockScroll('loader')
    const onReady = () => unlockScroll('loader')
    const onContact = (e: Event) => ((e as CustomEvent<boolean>).detail ? lockScroll('contact') : unlockScroll('contact'))
    window.addEventListener(EV.ready, onReady)
    window.addEventListener(EV.contact, onContact)

    // Sa "smanji pokrete" ostaje običan skrol preglednika.
    let lenis: Lenis | null = null
    let tick: ((time: number) => void) | null = null
    if (!prefersReducedMotion()) {
      const l = new Lenis({ autoRaf: false, anchors: true })
      lenis = l
      l.on('scroll', ScrollTrigger.update)
      tick = (time) => l.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      setLenis(l)
    }

    // Visina stranice se mijenja (filter u prodavnici, učitani fontovi): ScrollTrigger mora ponovo izmjeriti pinove.
    let last = document.body.scrollHeight
    let timer: ReturnType<typeof setTimeout> | undefined
    const ro = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const h = document.body.scrollHeight
        if (Math.abs(h - last) < 2) return
        ScrollTrigger.refresh()
        last = document.body.scrollHeight
      }, 200)
    })
    ro.observe(document.body)
    document.fonts.ready.then(() => ScrollTrigger.refresh())

    return () => {
      ro.disconnect()
      clearTimeout(timer)
      window.removeEventListener(EV.ready, onReady)
      window.removeEventListener(EV.contact, onContact)
      if (tick) gsap.ticker.remove(tick)
      lenis?.destroy()
      setLenis(null)
      unlockScroll('loader')
      unlockScroll('contact')
    }
  }, [])

  return null
}
