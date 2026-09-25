'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useLenis } from 'lenis/react'
import { gsap, useGSAP } from '@/lib/gsap'
import { PHOTOS_GC } from '@/gc/gc'
import { EASE, MQ } from '@/lib/motion'

const inset = (t: number, r: number, b: number, l: number) => `inset(${t}px ${r}px ${b}px ${l}px)`

// Hero = grand-maison Hero mechanic (frame opens from a centre line, then expands on scroll while pinned)
// dressed as the Ponos cover: giant Montserrat 900 line with one Pinyon Script word, two captions left/right,
// our own yard photographed from the air inside the frame.
export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef<typeof lenis>(undefined)
  const introDone = useRef(false)

  useEffect(() => {
    lenisRef.current = lenis
    if (lenis && !introDone.current) lenis.stop()
  }, [lenis])

  useGSAP(
    () => {
      const el = root.current!
      const frame = el.querySelector<HTMLElement>('[data-frame]')!
      const media = el.querySelector<HTMLElement>('[data-media]')!
      const slot = el.querySelector<HTMLElement>('[data-slot]')!
      const title = el.querySelector<HTMLElement>('[data-title]')!
      const caps = el.querySelectorAll<HTMLElement>('[data-cap]')
      const header = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) || 64

      const unlock = () => {
        introDone.current = true
        lenisRef.current?.start()
      }

      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        // Start frame = the slot under the captions; end frame = the whole screen under the header.
        const A = () => {
          const s = slot.getBoundingClientRect()
          const r = el.getBoundingClientRect()
          return inset(s.top - r.top, r.width - (s.right - r.left), r.height - (s.bottom - r.top), s.left - r.left)
        }
        const B = () => inset(header(), 0, 0, 0)
        const line = () => {
          const s = slot.getBoundingClientRect()
          const r = el.getBoundingClientRect()
          const mid = (s.top + s.bottom) / 2 - r.top
          return inset(mid, r.width - (s.right - r.left), r.height - mid, s.left - r.left)
        }

        gsap.set([title, ...caps], { visibility: 'visible' })
        if (reduce) {
          gsap.set(frame, { clipPath: A() })
          unlock()
          return
        }

        const masks = title.querySelectorAll<HTMLElement>('[data-mask]')
        const words = title.querySelectorAll<HTMLElement>('[data-w]')
        gsap.set(frame, { clipPath: line() })
        gsap.set(media, { scale: 1.18 })

        gsap
          .timeline({
            onComplete: () => {
              // the script word overshoots the line box; masks only clip during the rise
              gsap.set(masks, { overflow: 'visible' })
              unlock()
            },
          })
          .from(words, { yPercent: 115, duration: 1.0, ease: EASE.quint, stagger: 0.1 }, 0.1)
          .from(caps, { autoAlpha: 0, y: 10, duration: 0.8, ease: EASE.quint, stagger: 0.08 }, 0.5)
          .fromTo(frame, { clipPath: line }, { clipPath: A, duration: 1.2, ease: EASE.quintInOut, immediateRender: false }, 0.35)
          .to(media, { scale: 1.06, duration: 1.8, ease: EASE.out }, 0.35)

        // Scroll: the hero pins and the frame grows to the screen edge; the cover line lifts away.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: () => `+=${window.innerHeight * 0.6}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(frame, { clipPath: A }, { clipPath: B, ease: 'none', immediateRender: false }, 0)
          .to(media, { scale: 1, ease: 'none' }, 0)
          .to([title, ...caps], { yPercent: -30, autoAlpha: 0, ease: 'none', duration: 0.6 }, 0)
      })
    },
    { scope: root },
  )

  return (
    <section id="top" ref={root} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-canvas">
      <div className="gutter wrap flex h-full flex-col pb-4 pt-[calc(var(--header)+28px)] md:pb-6">
        <h1
          data-title
          className="cover invisible text-center text-[clamp(52px,15.4vw,72px)] md:text-[8.3vw] min-[1440px]:!text-[120px]"
        >
          <span data-mask className="-my-[0.14em] block overflow-hidden py-[0.14em] md:inline-block md:align-bottom">
            <span data-w className="inline-block">
              Materijal
            </span>
          </span>{' '}
          <span data-mask className="-my-[0.14em] block overflow-hidden py-[0.14em] md:inline-block md:align-bottom">
            <span data-w className="inline-block">
              <span className="script">do</span> etaže
            </span>
          </span>
        </h1>

        <div className="mt-3 flex items-start justify-between gap-6 text-[11px] font-medium uppercase leading-[1.35] tracking-[0.06em] md:mt-4 md:text-[12px]">
          <p data-cap className="invisible max-w-[24ch]">
            Knauf suha gradnja, izolacija, veziva i pribor
          </p>
          <p data-cap className="invisible max-w-[24ch] text-right">
            Banja Luka, od 2012. Istovar kranom na etažu
          </p>
        </div>

        {/* The slot only marks where the frame starts; the frame itself is the full hero, clipped. */}
        <div data-slot className="mt-3 min-h-0 flex-1 md:mt-4" />
      </div>

      <div data-frame className="absolute inset-0" style={{ clipPath: 'inset(50% 16px 50% 16px)' }}>
        <div data-media className="absolute inset-0">
          <Image
            src={PHOTOS_GC.yardAerial}
            alt="Stovarište Grand Company u Banjoj Luci iz vazduha: palete ploča, vune i blokova, prodavnica i kamion sa kranom"
            fill
            preload
            quality={85}
            sizes="100vw"
            className="object-cover object-[50%_55%]"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-deeper/55 to-transparent" />
        <p className="absolute bottom-8 left-0 pl-7 text-[12px] text-canvas/90 md:bottom-11 md:pl-14 xl:pl-[72px]">
          Naše stovarište u Banjoj Luci, snimak iz vazduha
        </p>
      </div>
    </section>
  )
}
