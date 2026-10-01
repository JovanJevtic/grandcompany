'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

// Prilagođeni kursor: mala cinober tačka koja prati miš sa blagim kašnjenjem.
// Iznad elementa sa `data-cursor="Tekst"` naraste u krug sa tim tekstom (npr. "Pogledaj" na fotografiji).
// Na dodirnim ekranima se ne prikazuje (CSS), a uz reduced-motion prati miš bez kašnjenja.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = dot.current!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dur = reduce ? 0 : 0.45
    const xTo = gsap.quickTo(el, 'x', { duration: dur, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: dur, ease: 'power3.out' })
    let big = false
    let seen = false

    const setBig = (text: string | null) => {
      const next = text !== null
      if (next) label.current!.textContent = text
      if (next === big) return
      big = next
      el.toggleAttribute('data-big', next)
      gsap.to(el, { scale: next ? 1 : 0.1, duration: reduce ? 0 : 0.5, ease: 'power3.out', overwrite: 'auto' })
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!seen) {
        seen = true
        gsap.set(el, { x: e.clientX, y: e.clientY })
        document.documentElement.setAttribute('data-cursor', '')
      }
      xTo(e.clientX)
      yTo(e.clientY)
      const target = (e.target as Element | null)?.closest?.('[data-cursor]')
      setBig(target ? target.getAttribute('data-cursor') || '' : null)
    }
    const onLeave = () => gsap.to(el, { scale: 0, duration: 0.3 })
    const onEnter = () => gsap.to(el, { scale: big ? 1 : 0.1, duration: 0.3 })
    const onDown = () => gsap.to(el, { scale: big ? 0.85 : 0.18, duration: 0.2 })
    const onUp = () => gsap.to(el, { scale: big ? 1 : 0.1, duration: 0.35, ease: 'back.out(3)' })

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeAttribute('data-cursor')
    }
  }, [])

  return (
    <div ref={dot} className="cursor" aria-hidden>
      <span ref={label} />
    </div>
  )
}
