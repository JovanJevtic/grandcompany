'use client'

import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { BRAND, pad } from '@/lib/content'
import { EASE, prefersReducedMotion } from '@/lib/motion'
import { PRODUCTS, STOCK_LABEL, catName, km, type Product } from '@/lib/shop'
import { useShop } from './ShopProvider'
import { tileBg, tileInk } from './tile'
import { useDialog } from './useDialog'

// Brzi pregled: ploča artikla raste iz svog položaja do gotovo cijelog ekrana (isti pokret kao ploče u heroju),
// a desno se pojavi crni panel sa opisom, količinom i dugmetom za korpu.
function Panel({ p, rect }: { p: Product; rect: DOMRect }) {
  const { add, closeView } = useShop()
  const layer = useRef<HTMLDivElement>(null)
  const side = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const [qty, setQty] = useState(1)
  const ink = tileInk(p.tile)
  const no = PRODUCTS.indexOf(p) + 1
  const margin = () => (window.innerWidth < 768 ? 0 : 24)

  useGSAP(
    () => {
      const d = (n: number) => (prefersReducedMotion() ? 0.01 : n)
      const m = margin()
      gsap.fromTo(
        layer.current,
        { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        { top: m, left: m, width: window.innerWidth - 2 * m, height: window.innerHeight - 2 * m, duration: d(1.1), ease: EASE.expoInOut },
      )
      gsap.from(side.current, { autoAlpha: 0, duration: d(0.6), delay: d(0.65) })
      gsap.from(layer.current!.querySelectorAll('[data-x]'), { autoAlpha: 0, y: 12, duration: d(0.8), delay: d(0.75), stagger: 0.06 })
    },
    { scope: layer },
  )

  const close = () => {
    if (closing.current) return
    closing.current = true
    const d = prefersReducedMotion() ? 0.01 : 0.9
    gsap.to(side.current, { autoAlpha: 0, duration: d * 0.4 })
    gsap.to(layer.current, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      duration: d,
      ease: EASE.expoInOut,
      onComplete: closeView,
    })
  }

  useDialog(true, layer, close)

  return (
    <div
      ref={layer}
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
      className="fixed z-[70] overflow-hidden focus:outline-none"
      style={{ background: tileBg(p.tile), top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
    >
      <div data-x className="info absolute bottom-6 left-6 flex gap-6 font-medium" style={{ color: ink }}>
        <span>{pad(no)}</span>
        <span>{BRAND}</span>
      </div>

      <div
        ref={side}
        data-lenis-prevent
        className="absolute inset-x-0 bottom-0 top-[34%] flex flex-col overflow-y-auto bg-bg p-6 text-fg md:inset-y-0 md:left-auto md:right-0 md:top-0 md:w-[min(560px,46%)] md:p-10"
      >
        <div data-x className="info flex items-start justify-between gap-6 text-dim">
          <span>
            Artikal {pad(no)} · {catName(p.cat)}
          </span>
          <button type="button" onClick={() => close()} className="font-serif text-[16px] normal-case leading-none tracking-normal text-fg">
            Zatvori
          </button>
        </div>

        <h3 data-x className="mt-[clamp(28px,5vh,64px)] text-[clamp(30px,3.2vw,48px)] font-medium leading-[1] tracking-[-0.05em]">
          {p.name}
        </h3>
        <p data-x className="mt-3 text-[15px] text-dim">
          {p.spec}
        </p>

        <p data-x className="mt-8 flex items-baseline gap-3">
          <span className="font-serif text-[clamp(38px,4vw,56px)] leading-none tabular-nums">{km(p.price)}</span>
          <span className="info text-dim">/ {p.unit}</span>
        </p>
        <p data-x className="info mt-3 text-dim">
          {STOCK_LABEL[p.stock]}
        </p>

        <p data-x className="mt-7 max-w-[46ch] text-[15px] leading-[1.55]">
          {p.desc}
        </p>

        <dl data-x className="mt-8 border-t border-line">
          {p.facts.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 border-b border-line py-3 text-[13px]">
              <dt className="text-dim">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>

        <div data-x className="mt-auto flex gap-3 pt-8">
          <div className="inline-flex items-center border border-line">
            <button type="button" aria-label="Smanji količinu" onClick={() => setQty((q) => Math.max(1, q - 1))} className="size-[50px] text-[16px] leading-none">
              −
            </button>
            <span className="min-w-8 text-center text-[13px] font-medium tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button type="button" aria-label="Povećaj količinu" onClick={() => setQty((q) => Math.min(999, q + 1))} className="size-[50px] text-[16px] leading-none">
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              add(p.id, qty)
              close()
            }}
            className="btn btn-solid flex-1 justify-between"
          >
            <span>+ Dodaj u korpu</span>
            <span className="tabular-nums">{km(p.price * qty)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QuickView() {
  const { view } = useShop()
  return view ? <Panel key={view.p.id} p={view.p} rect={view.rect} /> : null
}
