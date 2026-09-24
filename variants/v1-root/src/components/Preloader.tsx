'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, EV, prefersReducedMotion } from '@/lib/motion'

const WORDS = ['GRAND', 'COMPANY', 'BANJA LUKA', '2012']

// Preloader vodi CIJELU uvodnu animaciju: brojač 000→100, pa se ploča podigne, slova hero-a
// kližu s desne strane, a zatim ulaze trake. Skrol je zaključan dok se sve ne završi.
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef<typeof lenis>(undefined)
  const done = useRef(false)

  useEffect(() => {
    lenisRef.current = lenis
    if (lenis && !done.current) lenis.stop()
  }, [lenis])

  useEffect(() => {
    // Refresh stranice uvijek počinje na vrhu, inače pinovi i trake dobiju pogrešan položaj.
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  useGSAP(
    () => {
      const el = root.current!
      const counter = el.querySelector<HTMLElement>('[data-counter]')!
      const words = el.querySelectorAll<HTMLElement>('[data-pword]')
      // Elementi se traže preko document, ne preko GSAP-a: useGSAP sa `scope` bi sužavao pretragu na ovaj kontejner.
      const all = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)]
      const chars = all('[data-char]')
      const bands = all('[data-band-intro]')
      const ui = all('[data-ui]')

      const finish = () => {
        done.current = true
        gsap.set(el, { display: 'none' })
        lenisRef.current?.start()
        window.dispatchEvent(new Event(EV.introDone))
      }

      // Bez uvodne animacije: kad je zatraženo smanjeno kretanje, ili kad se dolazi direktno na sekciju
      // (npr. sa pravne stranice preko /#cijene), da se ne čeka brojač.
      if (prefersReducedMotion() || window.location.hash) {
        gsap.set([...chars, ...bands, ...ui], { clearProps: 'all' })
        finish()
        return
      }

      // početna stanja (ploča još pokriva sve, pa se ne vidi treptaj)
      gsap.set(chars, { x: (_i, t: HTMLElement) => (t.dataset.dir === 'l' ? -460 : 460), autoAlpha: 0 })
      gsap.set(bands, { x: 330 })
      gsap.set(ui, { autoAlpha: 0 })

      const n = { v: 0 }
      gsap
        .timeline({ onComplete: finish })
        .to(n, {
          v: 100,
          duration: 2.4,
          ease: 'power2.inOut',
          onUpdate: () => {
            counter.textContent = String(Math.round(n.v)).padStart(3, '0')
          },
        })
        .to(words, { autoAlpha: 1, duration: 0.4, stagger: 0.42, ease: 'none' }, 0.2)
        .to(el, { yPercent: -100, duration: 1.1, ease: EASE.expoInOut }, '+=0.25')
        .to(chars, { x: 0, autoAlpha: 1, duration: 2.6, ease: EASE.expo, stagger: 0.08 }, '-=0.6')
        .to(ui, { autoAlpha: 1, duration: 1, ease: 'power1.out' }, '<0.5')
        .to(bands, { x: 0, duration: 1.8, ease: EASE.expo, stagger: 0.08 }, '-=1.7')
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink text-bg"
      aria-hidden
    >
      <div className="lbl flex items-center gap-[6.5vw] max-md:gap-6">
        <span data-counter className="tabular-nums">
          000
        </span>
        {WORDS.map((w) => (
          <span key={w} data-pword className="invisible max-md:hidden">
            {w}
          </span>
        ))}
      </div>
    </div>
  )
}
