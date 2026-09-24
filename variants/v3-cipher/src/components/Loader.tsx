'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { EV, prefersReducedMotion } from '@/lib/motion'

// Loader: crna ploča, tačkasta pozadina koja "diše", i brojač u dnu. Kad brojač stigne do 100%, ploča nestaje,
// javlja se da je stranica spremna (počinje ulazak prstena), a tačke se polako gase.
export default function Loader() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const canvas = el.querySelector('canvas')!
      const ctx = canvas.getContext('2d')!
      const count = el.querySelector<HTMLElement>('[data-count]')!
      const black = el.querySelector<HTMLElement>('[data-black]')!

      const ready = () => {
        document.documentElement.dataset.ready = '1'
        window.dispatchEvent(new Event(EV.ready))
      }
      if (prefersReducedMotion()) {
        el.style.display = 'none'
        ready()
        return
      }

      let W = 0
      let H = 0
      const size = () => {
        W = canvas.width = window.innerWidth
        H = canvas.height = window.innerHeight
      }
      size()
      window.addEventListener('resize', size)

      const s = { v: 0, dots: 1 }
      const draw = (time: number) => {
        ctx.clearRect(0, 0, W, H)
        if (s.dots < 0.01) return
        const step = 14
        const t = time * 0.6
        ctx.fillStyle = '#e9eae4'
        for (let y = step / 2; y < H; y += step) {
          for (let x = step / 2; x < W; x += step) {
            const n = 0.5 + 0.5 * Math.sin(x * 0.011 + t) * Math.cos(y * 0.013 - t * 0.7) + 0.25 * Math.sin((x + y) * 0.02 - t * 1.3)
            if (n > 0.55) {
              ctx.globalAlpha = Math.min(0.55, (n - 0.55) * 1.4) * s.dots
              ctx.fillRect(x, y, 1.6, 1.6)
            }
          }
        }
        ctx.globalAlpha = 1
      }
      gsap.ticker.add(draw)

      gsap
        .timeline({
          onComplete: () => {
            gsap.ticker.remove(draw)
            el.style.display = 'none'
          },
        })
        .to(s, { v: 100, duration: 2.2, ease: 'power1.inOut', onUpdate: () => (count.textContent = `${Math.round(s.v)}%`) })
        .to(black, { autoAlpha: 0, duration: 0.6, ease: 'power1.out' }, '+=0.1')
        .add(ready, '<')
        .to(count, { autoAlpha: 0, duration: 0.4 }, '<')
        .to(s, { dots: 0, duration: 2.6, ease: 'power2.inOut' }, '<0.3')

      return () => {
        gsap.ticker.remove(draw)
        window.removeEventListener('resize', size)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-[35]" aria-hidden>
      <div data-black className="absolute inset-0 bg-black" />
      <canvas className="absolute inset-0" />
      <p data-count className="info absolute bottom-[26px] left-1/2 -translate-x-1/2 tabular-nums text-fg">
        0%
      </p>
    </div>
  )
}
