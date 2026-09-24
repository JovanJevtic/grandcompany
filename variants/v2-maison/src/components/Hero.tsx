'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { EASE, INTRO, MQ } from '@/lib/motion'

const inset = (t: number, r: number, b: number, l: number) => `inset(${t}px ${r}px ${b}px ${l}px)`

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef<typeof lenis>(undefined)
  const introDone = useRef(false)

  // Skrol je zaključan dok traje uvodna animacija, pa se otključa čim se završi.
  useEffect(() => {
    lenisRef.current = lenis
    if (lenis && !introDone.current) lenis.stop()
  }, [lenis])

  useGSAP(
    () => {
      const el = root.current!
      const frame = el.querySelector<HTMLElement>('[data-frame]')!
      const media = el.querySelector<HTMLElement>('[data-frame-media]')!
      const caption = el.querySelector<HTMLElement>('[data-caption]')!

      const mm = gsap.matchMedia()
      mm.add(
        MQ,
        (ctx) => {
          const { reduce, mobile } = ctx.conditions as { reduce: boolean; mobile: boolean }
          const vw = () => window.innerWidth
          const vh = () => window.innerHeight

          // Početni okvir: tik ispod wordmarka. Baseline wordmarka je na ~0.862 njegove veličine fonta.
          const start = () => {
            const fs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--wm-fs')) || vw() * 0.106
            const top = 16 + fs * 0.862
            const w = vw() * (mobile ? 0.9 : 0.8)
            const h = vh() * (mobile ? 0.66 : 0.592)
            const side = (vw() - w) / 2
            return { t: top, s: side, b: Math.max(vh() - top - h, vh() * 0.1) }
          }
          // Završni okvir: gotovo cio ekran, sa tankim rubom.
          const end = () => ({ s: mobile ? 12 : Math.round(vw() * 0.0146), t: mobile ? 12 : vh() * 0.029 })

          const A = () => {
            const s = start()
            return inset(s.t, s.s, s.b, s.s)
          }
          const B = () => {
            const e = end()
            return inset(e.t, e.s, e.t, e.s)
          }
          const line = () => {
            const s = start()
            const mid = s.t + (vh() - s.t - s.b) / 2
            return inset(mid, s.s, vh() - mid, s.s)
          }

          if (reduce) {
            gsap.set(frame, { clipPath: A })
            gsap.set(caption, { visibility: 'visible' })
            introDone.current = true
            lenisRef.current?.start()
            return
          }

          // 1) Uvodna animacija: okvir se otvara iz srednje linije, video se smiruje sa zumom 1.2 na 1.
          const capSplit = SplitText.create(caption, { type: 'chars', mask: 'chars', charsClass: 'ch' })
          gsap.set(frame, { clipPath: line })
          gsap.set(media, { scale: 1.2 })
          gsap.set(caption, { visibility: 'visible' })
          gsap.set(capSplit.chars, { yPercent: 120 })

          gsap
            .timeline({
              onComplete: () => {
                introDone.current = true
                lenisRef.current?.start()
              },
            })
            // fromTo (ne to): browser sažima inset(a b a b) u inset(a b), pa bi GSAP pročitao drugi broj vrijednosti.
            .fromTo(
              frame,
              { clipPath: line },
              { clipPath: A, duration: 1.8, ease: EASE.quintInOut, immediateRender: false },
              INTRO.frame,
            )
            .to(media, { scale: 1, duration: 2.2, ease: EASE.out }, INTRO.frame)
            .to(capSplit.chars, { yPercent: 0, duration: 0.9, ease: EASE.quint, stagger: 0.03 }, INTRO.caption)

          // 2) Skrol: hero se pina i okvir se širi do ruba ekrana. Trajanje je pola visine ekrana.
          gsap
            .timeline({
              scrollTrigger: {
                trigger: el,
                start: 'top top',
                end: () => `+=${vh() * 0.5}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(frame, { clipPath: A }, { clipPath: B, ease: 'none', immediateRender: false }, 0)
            .to(caption, { opacity: 0, ease: 'none', duration: 0.3 }, 0)
        },
      )
    },
    { scope: root },
  )

  return (
    <section id="hero" ref={root} className="relative z-[100] h-dvh">
      {/* Okvir je cijeli ekran, a vidljiv dio određuje clip-path. Video je ovdje siva ploča. */}
      <div data-frame className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(50% 0% 50% 0%)' }}>
        <div data-frame-media className="hero-sheen absolute inset-0" />
      </div>

      <p
        data-caption
        className="invisible absolute left-0 top-[89.8%] w-full -translate-y-1/2 text-center text-[clamp(14px,1.56vw,26px)] uppercase leading-none"
      >
        Građevinski materijal
      </p>
    </section>
  )
}
