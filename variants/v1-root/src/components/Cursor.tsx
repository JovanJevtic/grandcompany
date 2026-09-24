'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

// Kursor: tačka boje aktivnog poglavlja. Raste iznad linkova i dugmadi, a nestaje iznad traka
// (tamo se umjesto nje pojavljuje sličica). Samo za uređaje sa mišem.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
      const el = dot.current!
      gsap.set(el, { x: 0, y: 0 }) // prije prvog pomjeranja miša stoji u lijevom gornjem uglu
      const xTo = gsap.quickTo(el, 'x', { duration: 0.28, ease: 'power3' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.28, ease: 'power3' })

      const move = (e: PointerEvent) => {
        xTo(e.clientX)
        yTo(e.clientY)
      }
      const over = (e: PointerEvent) => {
        const t = e.target as Element | null
        const onBand = !!t?.closest('[data-band]')
        const hot = !!t?.closest('a, button, [data-hover]')
        gsap.to(el, { scale: hot && !onBand ? 2.6 : 1, autoAlpha: onBand ? 0 : 1, duration: 0.3, overwrite: 'auto' })
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerover', over)
      return () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerover', over)
      }
    },
    { scope: dot },
  )

  return (
    <div
      ref={dot}
      aria-hidden
      className="cursor-dot pointer-events-none fixed left-[-10px] top-[-10px] z-[10001] size-5 rounded-full"
      style={{ background: 'var(--c)' }}
    />
  )
}
