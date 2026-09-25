'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLenis } from 'lenis/react'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { Icon, SectionTitle } from './ui'

type Shot = { src: string; alt: string; caption: string }

// Inspiration only: Pexels photos of finished spaces, each captioned with the material system it relates to.
const COLS: Shot[][] = [
  [
    { src: '/stock/attic-white.jpg', alt: 'Bijelo potkrovlje sa krovnim prozorima i drvenim podom', caption: 'Potkrovlje · staklena vuna u rolni i GKB ploče' },
    { src: '/stock/facade-beige.jpg', alt: 'Bež fasada stambene zgrade sa prozorima', caption: 'Fasada · EPS 70 i Ceresit CT 85' },
  ],
  [
    { src: '/stock/room-finished.jpg', alt: 'Prazna svijetla soba sa sivim i bijelim zidovima', caption: 'Stan · pregradni zid W111 i glet masa' },
    { src: '/stock/interior-living.jpg', alt: 'Dnevni boravak sa spuštenim plafonom i indirektnim svjetlom', caption: 'Dnevni boravak · spušteni plafon na CD profilima' },
  ],
  [
    { src: '/stock/facade-grey.jpg', alt: 'Siva fasada višespratnice', caption: 'Fasada · grafitni stiropor Neopor' },
    { src: '/stock/renovation-room.jpg', alt: 'Soba u renoviranju sa zaglađenim zidovima', caption: 'Renovacija · Uniflott i bandaž traka' },
  ],
]
const ALL = COLS.flat()
type Open = { i: number; rect: DOMRect } | null

// U prostoru: grand-root GridGallery layout — three columns moving at different speeds on scroll,
// and a photo that grows from its place to (almost) the whole screen on click.
export default function Gallery() {
  const root = useRef<HTMLElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const lenis = useLenis()
  const [open, setOpen] = useState<Open>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce, mobile } = ctx.conditions as { reduce: boolean; mobile: boolean }
        if (reduce || mobile) return
        gsap.utils.toArray<HTMLElement>('[data-col]', root.current).forEach((col) => {
          const dir = Number(col.dataset.col)
          gsap.fromTo(col, { y: dir * 60 }, { y: dir * -60, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
        })
      })
    },
    { scope: root },
  )

  useGSAP(
    () => {
      if (!open || !layer.current) return
      closing.current = false
      lenis?.stop()
      const m = window.innerWidth < 768 ? 12 : 24
      gsap.fromTo(
        layer.current,
        { top: open.rect.top, left: open.rect.left, width: open.rect.width, height: open.rect.height },
        { top: m, left: m, width: window.innerWidth - 2 * m, height: window.innerHeight - 2 * m, duration: 1, ease: EASE.quintInOut },
      )
    },
    { dependencies: [open], revertOnUpdate: false },
  )

  const close = () => {
    if (!open || !layer.current || closing.current) return
    closing.current = true
    const { rect } = open
    gsap.to(layer.current, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      duration: 0.8,
      ease: EASE.quintInOut,
      onComplete: () => {
        setOpen(null)
        lenis?.start()
      },
    })
  }
  const closeRef = useRef(close)
  useEffect(() => {
    closeRef.current = close
  })
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const shot = open ? ALL[open.i] : null

  return (
    <section ref={root} id="u-prostoru" aria-labelledby="prostor-h" className="relative z-10 overflow-hidden bg-canvas py-16 lg:py-28">
      <div className="gutter wrap">
        <SectionTitle
          id="prostor-h"
          title="U prostoru"
          lead="Inspiracija, ne naši radovi: gotovi prostori sa sistemima i materijalom iz ponude. Fotografije su sa Pexelsa."
        />

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:mt-16">
          {COLS.map((col, ci) => (
            <div key={ci} data-col={ci === 1 ? -1 : 1} className={`flex flex-col gap-8 md:gap-10 ${ci === 1 ? 'md:pt-24' : ''}`}>
              {col.map((s) => {
                const i = ALL.indexOf(s)
                return (
                  <figure key={s.src}>
                    <button
                      type="button"
                      aria-label={`Uvećaj: ${s.caption}`}
                      onClick={(e) => setOpen({ i, rect: e.currentTarget.getBoundingClientRect() })}
                      className="group relative block aspect-[4/5] w-full overflow-hidden bg-well"
                    >
                      <Image
                        src={s.src}
                        alt={s.alt}
                        fill
                        sizes="(min-width: 768px) 32vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.04]"
                      />
                    </button>
                    <figcaption className="mt-3 text-[14px]">
                      <span className="font-medium">{s.caption.split(' · ')[0]}</span>
                      <span className="text-muted"> · {s.caption.split(' · ')[1]}</span>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {open &&
        shot &&
        createPortal(
          <>
            <div aria-hidden onClick={close} className="fixed inset-0 z-[680] bg-deeper/60" />
            <div
              ref={layer}
              role="dialog"
              aria-modal="true"
              aria-label={shot.caption}
              className="fixed z-[690] overflow-hidden bg-deep"
              style={{ top: open.rect.top, left: open.rect.left, width: open.rect.width, height: open.rect.height }}
            >
              <Image src={shot.src} alt={shot.alt} fill sizes="100vw" quality={85} className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 bg-gradient-to-t from-deeper/70 to-transparent p-5 pt-16 text-canvas md:p-8">
                <p className="text-[15px]">
                  {shot.caption} <span className="text-canvas/60">· inspiracija, Pexels</span>
                </p>
              </div>
              <button
                type="button"
                autoFocus
                onClick={close}
                className="absolute right-4 top-4 flex items-center gap-1.5 bg-canvas px-3 py-2 text-[13px] text-ink"
              >
                Zatvori <Icon name="close" className="size-4" />
              </button>
            </div>
          </>,
          document.body,
        )}
    </section>
  )
}
