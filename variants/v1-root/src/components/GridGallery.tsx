'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLenis } from 'lenis/react'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE } from '@/lib/motion'
import { TONES } from '@/lib/content'
import Grey from './Grey'

// Tri stupca sivih ploča. Stupci se u suprotnim smjerovima pomjeraju uz skrol (vidi Motion.tsx).
const COLS = [
  { left: '37.7dvh', top: '-15dvh', dir: -1, tones: [0, 1, 2, 3, 4] },
  { left: '77.5dvh', top: '-20dvh', dir: 1, tones: [3, 4, 5, 0, 1] },
  { left: '117.3dvh', top: '-1dvh', dir: -1, tones: [5, 2, 4, 1, 0] },
]

type Open = { tone: number; rect: DOMRect } | null

export default function GridGallery() {
  const [open, setOpen] = useState<Open>(null)
  const layer = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const closing = useRef(false)

  // Otvaranje: ploča raste iz svog položaja do gotovo cijelog ekrana.
  useGSAP(
    () => {
      if (!open || !layer.current) return
      const el = layer.current
      closing.current = false
      lenis?.stop()
      const m = 28
      gsap.fromTo(
        el,
        { top: open.rect.top, left: open.rect.left, width: open.rect.width, height: open.rect.height },
        { top: m, left: m, width: window.innerWidth - 2 * m, height: window.innerHeight - 2 * m, duration: 1.1, ease: EASE.expoInOut },
      )
    },
    { dependencies: [open], revertOnUpdate: false },
  )

  function close() {
    if (!open || !layer.current || closing.current) return
    closing.current = true
    const { rect } = open
    gsap.to(layer.current, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      duration: 0.9,
      ease: EASE.expoInOut,
      onComplete: () => {
        setOpen(null)
        lenis?.start()
      },
    })
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <section data-grid className="relative shrink-0 max-md:px-5 max-md:pb-16 md:h-full md:w-[160dvh]">
      {/* desktop: tri stupca */}
      <div className="hidden md:block">
        {COLS.map((col, ci) => (
          <div
            key={ci}
            data-col
            data-dir={col.dir}
            className="absolute flex flex-col gap-[11dvh]"
            style={{ left: col.left, top: col.top }}
          >
            {col.tones.map((t, i) => (
              <button
                key={i}
                type="button"
                aria-label="Uvećaj sliku"
                className="block size-[28.7dvh] cursor-pointer"
                onClick={(e) => setOpen({ tone: t, rect: e.currentTarget.getBoundingClientRect() })}
              >
                <Grey tone={t} className="size-full" />
              </button>
            ))}
          </div>
        ))}
        {/* "Klikni za uvećanje": oznaka stoji ispod srednjeg stupca */}
        <div className="lbl pointer-events-none absolute bottom-[3.4dvh] left-[91.8dvh] -translate-x-1/2 whitespace-nowrap rounded-full border border-current px-[1.3dvh] py-[1.1dvh]">
          Klikni za uvećanje
        </div>
      </div>

      {/* mobilni: mreža 2 stupca */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {[0, 1, 2, 3, 4, 5].map((t) => (
          <Grey key={t} tone={t} className="aspect-square" />
        ))}
      </div>

      {/* Portal u <body>: traka landinga ima transform, a `fixed` unutar elementa sa transformom
          se računa od tog elementa, ne od ekrana. */}
      {open &&
        createPortal(
          <div
            ref={layer}
            onClick={close}
            className="fixed z-[90] cursor-pointer overflow-hidden"
            style={{ background: TONES[open.tone % TONES.length] }}
            role="dialog"
            aria-label="Uvećana slika"
          >
            <span className="lbl absolute right-5 top-5 text-ink">Zatvori</span>
          </div>,
          document.body,
        )}
    </section>
  )
}
