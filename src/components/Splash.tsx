'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { gsap, useGSAP } from '@/lib/gsap'
import GcMonogram from './GcMonogram'

// Uvodni splash prije sadržaja (uzor: leome-and-partners.com).
// Redoslijed: četiri kvadratića stoje skupljeni u 2x2 blok, raziđu se u čoškove okvira,
// i tek ONDA iz dna izranja monogram unutar tog okvira. Sve na tamno plavoj podlozi.
const CELL = 12 // stranica kvadratića
const TIGHT = 7 // početni razmak u 2x2 bloku

// Polazište kvadratića (u centru, blago razmaknuti). Krajnje pozicije se računaju
// iz stvarne veličine okvira, da raspored ostane isti na svakoj širini ekrana.
const START = [
  { x: -TIGHT, y: -TIGHT },
  { x: TIGHT, y: -TIGHT },
  { x: -TIGHT, y: TIGHT },
  { x: TIGHT, y: TIGHT },
]

export default function Splash() {
  const root = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef<typeof lenis>(undefined)

  // Dok splash traje, strana se ne skrola.
  useEffect(() => {
    lenisRef.current = lenis
    if (!lenis) return
    lenis.stop()
    return () => lenis.start()
  }, [lenis])

  useGSAP(
    () => {
      const el = root.current!
      let finished = false
      const finish = () => {
        if (finished) return
        finished = true
        el.style.display = 'none'
        lenisRef.current?.start()
        // Wordmark čeka ovaj signal da pusti slova (vidi SiteChrome).
        document.documentElement.dataset.gcSplash = 'done'
        window.dispatchEvent(new CustomEvent('gc:splash-done'))
      }

      // Uz reduced motion nema uvoda — sajt je odmah tu.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finish()
        return
      }

      const frame = el.querySelector<HTMLElement>('[data-frame]')!
      const cells = gsap.utils.toArray<HTMLElement>('[data-cell]', el)
      const mark = el.querySelector<HTMLElement>('[data-mark]')!

      // Čoškovi okvira u koje se kvadratići razilaze.
      const box = frame.getBoundingClientRect()
      const spreadX = box.width / 2
      const spreadY = box.height / 2

      // Početno stanje (kvadratići u centru, monogram dole) već stoji u markup-u, pa se
      // ne resetuje — tako splash izgleda isto i dok se JS još učitava.
      gsap.set(mark, { yPercent: 115 })

      gsap
        .timeline({ onComplete: finish, defaults: { ease: 'power3.out' } })
        .to({}, { duration: 0.2 })
        .to(cells, {
          x: (i: number) => (START[i].x < 0 ? -spreadX : spreadX),
          y: (i: number) => (START[i].y < 0 ? -spreadY : spreadY),
          duration: 0.9,
          ease: 'power3.inOut',
        })
        // Monogram izranja iz dna tek kad su kvadratići na mjestu.
        .to(mark, { yPercent: 0, duration: 0.8, ease: 'power3.out' }, '+=0.05')
        .to({}, { duration: 0.45 })
        // Zavjesa se diže i otkriva sajt.
        .to(el, { yPercent: -100, duration: 0.8, ease: 'power3.inOut' })
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      data-splash
      aria-hidden
      className="fixed inset-0 z-[900] overflow-hidden"
      style={{ background: 'var(--ink)' }}
    >
      {/* Okvir: njegovi čoškovi su krajnje pozicije kvadratića, a monogram stoji u sredini. */}
      <div
        data-frame
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 'var(--splash-frame)', height: 'calc(var(--splash-frame) * 1.12)' }}
      >
        {START.map((start, i) => (
          <span
            key={i}
            data-cell
            className="absolute left-1/2 top-1/2 block"
            style={{
              width: CELL,
              height: CELL,
              marginLeft: -CELL / 2,
              marginTop: -CELL / 2,
              background: 'var(--splash-mark)',
              // Početno stanje u markup-u: vidi se i prije hidratacije.
              transform: `translate(${start.x}px, ${start.y}px)`,
            }}
          />
        ))}

        {/* Maska drži monogram skrivenim dok ne izroni iz dna. */}
        <div
          data-mask
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
          style={{ width: 'calc(var(--splash-frame) * 0.47)' }}
        >
          <div data-mark style={{ color: 'var(--splash-mark)', transform: 'translateY(115%)' }}>
            <GcMonogram className="block h-auto w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
