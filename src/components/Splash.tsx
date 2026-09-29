'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { gsap, useGSAP } from '@/lib/gsap'
import GcMonogram from './GcMonogram'

// Uvodni splash prije sadržaja (uzor: leome-and-partners.com).
// Četiri kvadratića se skupe u centar, raziđu se u čoškove, pa monogram izranja iz dna.
// Sve radi na tamno plavoj podlozi, u boji monograma (#f3ecdf).
const CELL = 12 // stranica kvadratića
const TIGHT = 7 // početni razmak u 2x2 bloku
const SPREAD = 112 // koliko kvadratići odlutaju od centra
const MARK_W = 190 // širina monograma u splash-u
const MARK_H = Math.round((MARK_W * 216) / 281)

const START = [
  { x: -TIGHT, y: -TIGHT },
  { x: TIGHT, y: -TIGHT },
  { x: -TIGHT, y: TIGHT },
  { x: TIGHT, y: TIGHT },
]
const END = [
  { x: -SPREAD, y: -SPREAD },
  { x: SPREAD, y: -SPREAD },
  { x: -SPREAD, y: SPREAD },
  { x: SPREAD, y: SPREAD },
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

      const cells = gsap.utils.toArray<HTMLElement>('[data-cell]', el)
      const mark = el.querySelector<HTMLElement>('[data-mark]')!
      // Početno stanje (kvadratići skupljeni u centar, monogram dole) već stoji u markup-u,
      // pa se ne resetuje — tako splash izgleda isto i dok se JS još učitava.
      gsap.set(mark, { yPercent: 115 })

      gsap
        .timeline({ onComplete: finish, defaults: { ease: 'power3.out' } })
        .to({}, { duration: 0.3 })
        // Razilaženje u čoškove oko mjesta gdje će se pojaviti monogram.
        .to(cells, { x: (i: number) => END[i].x, y: (i: number) => END[i].y, duration: 0.95, ease: 'power3.inOut' })
        .to(mark, { yPercent: 0, duration: 0.9, ease: 'power3.out' }, '-=0.5')
        .to({}, { duration: 0.55 })
        // Zavjesa se diže i otkriva sajt.
        .to(el, { yPercent: -100, duration: 0.85, ease: 'power3.inOut' })
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
      <div className="absolute left-1/2 top-1/2">
        {START.map((_, i) => (
          <span
            key={i}
            data-cell
            className="absolute block"
            style={{
              width: CELL,
              height: CELL,
              marginLeft: -CELL / 2,
              marginTop: -CELL / 2,
              background: 'var(--splash-mark)',
              // Početno stanje je i u markup-u, da splash izgleda isto prije hidratacije.
              transform: `translate(${START[i].x}px, ${START[i].y}px)`,
            }}
          />
        ))}

        {/* Maska drži monogram skrivenim dok ne izroni iz dna. */}
        <div
          className="absolute overflow-hidden"
          style={{ width: MARK_W, height: MARK_H, marginLeft: -MARK_W / 2, marginTop: -MARK_H / 2 }}
        >
          <div data-mark style={{ color: 'var(--splash-mark)', transform: 'translateY(115%)' }}>
            <GcMonogram className="block h-auto w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
