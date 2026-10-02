'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

// Prilagođeni kursor: cinober iskra (znak iz logotipa) koja prati miš sa blagim kašnjenjem i
// polako se okreće. Iznad elementa sa `data-cursor="Riječ"` pretvori se u "sječivo" (isti oblik
// kao CTA dugmad) sa tom riječju. Na dodirnim ekranima se ne prikazuje (CSS), a uz
// reduced-motion prati miš bez kašnjenja.
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = root.current!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dur = reduce ? 0 : 0.45
    const xTo = gsap.quickTo(el, 'x', { duration: dur, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: dur, ease: 'power3.out' })
    let seen = false

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!seen) {
        seen = true
        gsap.set(el, { x: e.clientX, y: e.clientY })
        document.documentElement.setAttribute('data-cursor', '')
      }
      xTo(e.clientX)
      yTo(e.clientY)
      // <html> nosi data-cursor (sakriva sistemski kursor), zato se on preskače.
      const target = (e.target as Element | null)?.closest?.('[data-cursor]:not(html), [data-cursor-plate]')
      // Preko tamnih i plavih površina (footer, tamne kartice, plave sekcije) kursor postaje bijel.
      const dark = (e.target as Element | null)?.closest?.('footer, .bg-ink, .bg-char, .bg-navy, .bg-cobalt, [data-step-band="navy"]')
      el.toggleAttribute('data-on-dark', !!dark)
      // `data-cursor-plate="Riječ"` je velika plava ploča (npr. KATALOG preko kadrova); `data-cursor`
      // je uobičajeno "sječivo" sa riječju.
      const plate = target?.getAttribute('data-cursor-plate')
      const text = plate || target?.getAttribute('data-cursor')
      if (text) label.current!.textContent = text
      el.toggleAttribute('data-big', !!text)
      el.toggleAttribute('data-cursor-plate', !!plate)
    }
    const onLeave = () => gsap.to(el, { autoAlpha: 0, duration: 0.3 })
    const onEnter = () => gsap.to(el, { autoAlpha: 1, duration: 0.3 })
    const onDown = () => gsap.to(el, { scale: 0.8, duration: 0.2 })
    const onUp = () => gsap.to(el, { scale: 1, duration: 0.4, ease: 'back.out(3)' })

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
    <div ref={root} className="cursor" aria-hidden>
      <span className="cursor-spark" />
      <span className="cursor-tag">
        <span ref={label} />
      </span>
    </div>
  )
}
