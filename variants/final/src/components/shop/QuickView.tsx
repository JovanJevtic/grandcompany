'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { useLenis } from 'lenis/react'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE } from '@/lib/motion'
import { stockLevel } from '@/gc/gc'
import { addToCart, closeView, toggleCompare, toggleSaved, useShop, type Rect } from '@/lib/cart'
import { PRODUCT_MAP, categoryName, defaultQty, money, qtyLabel, type Product } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'
import { Icon } from '../ui'
import { StockDot, Stepper } from './ProductCard'

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// grand-cipher useDialog: Esc closes, Tab stays inside, focus returns to the opener.
function useDialog(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const opener = document.activeElement as HTMLElement | null
    el.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close.current()
      if (e.key !== 'Tab') return
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      opener?.focus?.({ preventScroll: true })
    }
  }, [ref])
}

// Quick view from grand-cipher: the card photo grows from its place to (almost) the whole screen,
// then a cream panel with specs, quantity and "U korpu" fades in. Two views: photo and package drawing.
function Panel({ p, rect }: { p: Product; rect: Rect }) {
  const { saved, compare } = useShop()
  const layer = useRef<HTMLDivElement>(null)
  const side = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const lenis = useLenis()
  const scrollTo = useScrollTo()
  const step = defaultQty(p)
  const [qty, setQty] = useState(step)
  const views = [
    { src: p.photo, label: p.illustrative ? 'Fotografija (ilustracija)' : 'Fotografija' },
    ...(p.image !== p.photo ? [{ src: p.image, label: 'Crtež pakovanja' }] : []),
  ]
  const [view, setView] = useState(0)
  const current = views[view]
  const drawing = current.src.endsWith('.svg')
  const margin = () => (window.innerWidth < 768 ? 0 : 20)

  useEffect(() => {
    lenis?.stop()
    return () => lenis?.start()
  }, [lenis])

  useGSAP(
    () => {
      const d = (n: number) => (reduced() ? 0.01 : n)
      const m = margin()
      gsap.fromTo(
        layer.current,
        { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        { top: m, left: m, width: window.innerWidth - 2 * m, height: window.innerHeight - 2 * m, duration: d(1), ease: EASE.quintInOut },
      )
      gsap.from(side.current, { autoAlpha: 0, x: 24, duration: d(0.6), delay: d(0.6), ease: EASE.quint })
      gsap.from(layer.current!.querySelectorAll('[data-x]'), { autoAlpha: 0, y: 10, duration: d(0.7), delay: d(0.7), stagger: 0.04 })
    },
    { scope: layer },
  )

  const close = (after?: () => void) => {
    if (closing.current) return
    closing.current = true
    const d = reduced() ? 0.01 : 0.8
    gsap.to(side.current, { autoAlpha: 0, duration: d * 0.35 })
    gsap.to(layer.current, {
      ...rect,
      duration: d,
      ease: EASE.quintInOut,
      onComplete: () => {
        closeView()
        after?.()
      },
    })
  }

  useDialog(layer, () => close())
  const level = stockLevel(p)

  return (
    <>
      <div aria-hidden onClick={() => close()} className="fixed inset-0 z-[640] bg-deeper/40" />
      <div
        ref={layer}
        role="dialog"
        aria-modal="true"
        aria-label={p.name}
        tabIndex={-1}
        className="fixed z-[650] overflow-hidden bg-well outline-none"
        style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      >
        {/* media: left part of the layer */}
        <div className="absolute inset-x-0 top-0 h-[40%] md:inset-y-0 md:right-[min(520px,44%)] md:h-auto">
          <Image
            key={current.src}
            src={current.src}
            alt={`${p.name}: ${current.label.toLowerCase()}`}
            fill
            sizes="(min-width: 768px) 56vw, 100vw"
            unoptimized={drawing}
            className={drawing ? 'object-contain p-[8%]' : 'object-cover'}
          />
          {views.length > 1 && (
            <div data-x className="absolute bottom-3 left-3 flex gap-1.5 md:bottom-5 md:left-5">
              {views.map((v, i) => (
                <button
                  key={v.src}
                  type="button"
                  aria-pressed={i === view}
                  onClick={() => setView(i)}
                  className="relative size-14 overflow-hidden border border-ink/20 bg-well aria-pressed:border-ink aria-pressed:outline aria-pressed:outline-1 aria-pressed:outline-ink md:size-16"
                  aria-label={v.label}
                >
                  <Image src={v.src} alt="" fill sizes="64px" unoptimized={v.src.endsWith('.svg')} className={v.src.endsWith('.svg') ? 'object-contain p-1.5' : 'object-cover'} />
                </button>
              ))}
            </div>
          )}
          <p data-x className="absolute right-3 top-3 bg-canvas/90 px-2 py-1 text-[11px] md:left-5 md:right-auto md:top-5">
            {current.label}
          </p>
        </div>

        {/* cream panel */}
        <div
          ref={side}
          data-lenis-prevent
          className="absolute inset-x-0 bottom-0 top-[40%] flex flex-col overflow-y-auto overscroll-contain bg-surface p-5 md:inset-y-0 md:left-auto md:right-0 md:top-0 md:w-[min(520px,44%)] md:p-9"
        >
          <div data-x className="flex items-start justify-between gap-6">
            <span className="eyebrow text-[10px] text-muted">
              {categoryName(p.category)} · {p.sku}
            </span>
            <button type="button" onClick={() => close()} className="-m-2 flex items-center gap-1.5 p-2 text-[13px] hover:opacity-60">
              Zatvori <Icon name="close" className="size-4" />
            </button>
          </div>

          <h3 data-x className="s-sub mt-6 md:mt-10 md:text-[30px]">
            {p.name}
          </h3>
          <p data-x className="eyebrow mt-2 text-[10px] text-muted">
            {p.brand === 'Ostali proizvođači' ? p.spec : `${p.brand} · ${p.spec}`}
          </p>

          <p data-x className="mt-6 text-[28px] font-medium leading-none tnum">
            {money(p.price)} <span className="text-[14px] font-normal text-muted">/ {p.unit}, sa PDV-om</span>
          </p>
          <div data-x className="mt-3">
            <StockDot level={level} className="text-muted" />
          </div>

          <p data-x className="mt-6 max-w-[48ch] text-[15px] leading-[1.6]">
            {p.desc}
          </p>
          {p.illustrative && (
            <p data-x className="mt-3 text-[12px] text-muted">
              Fotografija prikazuje istu vrstu materijala, ne tačno ovaj artikal. Pakovanje je na crtežu.
            </p>
          )}

          <dl data-x className="mt-7 border-t border-ink/12 text-[13px]">
            {[
              ['Dimenzije', p.spec],
              ['Pakovanje', p.pack ? `${p.pack.name}, ${qtyLabel(p.pack.size, p.unit)}` : `1 ${p.unit}`],
              ['Težina', `${p.weight.toLocaleString('de-DE')} kg / ${p.unit}`],
              ['Na stanju', qtyLabel(p.stock, p.unit)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 border-b border-ink/12 py-2.5">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right tnum">{v}</dd>
              </div>
            ))}
          </dl>

          <div data-x className="sticky bottom-0 -mx-5 -mb-5 mt-auto border-t border-ink/10 bg-surface px-5 pb-5 pt-4 md:static md:m-0 md:border-0 md:p-0 md:pt-7">
            <div className="grid grid-cols-[minmax(0,150px)_1fr] gap-2">
              <Stepper value={qty} step={step} unit={p.unit} onChange={setQty} className="!h-12" />
              <button
                type="button"
                className="btn-solid h-12"
                onClick={() => {
                  addToCart(p.id, qty)
                  close()
                }}
              >
                <span>U korpu</span>
                <span className="tnum">{money(p.price * qty)}</span>
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
              <button type="button" className="link-u" onClick={() => toggleSaved(p.id)}>
                {saved.includes(p.id) ? 'Sačuvano ✓' : 'Sačuvaj'}
              </button>
              <button type="button" className="link-u" onClick={() => toggleCompare(p.id)}>
                {compare.includes(p.id) ? 'U poređenju ✓' : 'Poredi'}
              </button>
              <button type="button" className="link-u" onClick={() => close(() => scrollTo('upit'))}>
                Pitajte za ovaj artikal
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function QuickView() {
  const { view } = useShop()
  const p = view ? PRODUCT_MAP[view.id] : undefined
  return view && p ? <Panel key={view.id} p={p} rect={view.rect} /> : null
}
