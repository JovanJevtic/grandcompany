'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { revealLines } from '@/lib/fx'
import { prefersReducedMotion } from '@/lib/motion'
import { scrollToTarget } from '@/lib/scroll'
import { PRODUCTS } from '@/lib/shop'
import ProductCard from './ProductCard'

const NEW = PRODUCTS.filter((p) => p.featured)
const two = (n: number) => String(n).padStart(2, '0')

// Najčešće birano (bivše "Novo u ponudi"): istaknuti artikli iz kataloga. Na velikom ekranu se sekcija pinuje, a skrolom se traka artikala pomjera vodoravno.
// Na manjim ekranima (i sa "smanji pokrete") to je obična traka koja se prevlači prstom.
export default function Novo() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const pin = el.querySelector<HTMLElement>('[data-pin]')!
      const track = el.querySelector<HTMLElement>('[data-track]')!
      const bar = el.querySelector<HTMLElement>('[data-bar]')!
      const count = el.querySelector<HTMLElement>('[data-count]')!
      const head = el.querySelector<HTMLElement>('[data-head]')!

      if (!prefersReducedMotion()) revealLines(head, el, 'top 60%')

      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
        gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              bar.style.transform = `scaleX(${self.progress})`
              count.textContent = `${two(Math.min(NEW.length, Math.floor(self.progress * NEW.length) + 1))} / ${two(NEW.length)}`
            },
          },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="birano" ref={root} className="relative border-t border-line">
      <div data-pin className="flex flex-col justify-between max-lg:py-[clamp(72px,11vw,176px)] lg:h-svh lg:overflow-hidden lg:pb-8 lg:pt-[104px]">
        <div className="info flex justify-between px-5 text-dim">
          <span>03 / 12 · Najčešće birano</span>
          <span data-count className="tabular-nums">
            01 / {two(NEW.length)}
          </span>
        </div>

        <div
          data-track
          className="iso no-bar flex gap-5 px-5 max-lg:mt-10 max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:scroll-pl-5 lg:w-max lg:items-center"
        >
          <div className="shrink-0 max-lg:w-[86vw] lg:w-[min(42vw,760px)] lg:pr-10">
            <h2 data-head className="display text-[clamp(52px,7.6vw,128px)]">
              najčešće <em>birano</em>.
            </h2>
            <p className="mt-8 max-w-[38ch] text-[15px] leading-[1.55] text-dim">Artikli koje izdvajamo u katalogu: osnova za zid, plafon i fasadu. Listajte skrolom.</p>
          </div>

          {NEW.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              no={PRODUCTS.indexOf(p) + 1}
              className="shrink-0 max-lg:w-[72vw] max-lg:max-w-[340px] max-lg:snap-start lg:w-[min(27vw,40svh)]"
            />
          ))}

          <div className="flex shrink-0 flex-col items-start gap-6 max-lg:w-[72vw] lg:w-[min(28vw,400px)] lg:pl-10">
            <p className="text-[clamp(28px,3vw,44px)] font-medium leading-[1] tracking-[-0.045em]">
              još artikala u <em className="font-serif font-normal tracking-[-0.03em]">cijeloj ponudi</em>.
            </p>
            <button type="button" onClick={() => scrollToTarget('#ponuda')} className="btn">
              Cijela ponuda ↑
            </button>
          </div>
        </div>

        <div className="hidden px-5 lg:block">
          <div className="h-px bg-line">
            <div data-bar className="h-px origin-left scale-x-0 bg-fg" />
          </div>
        </div>
      </div>
    </section>
  )
}
