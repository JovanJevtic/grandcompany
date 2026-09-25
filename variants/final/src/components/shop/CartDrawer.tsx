'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { FREE_DELIVERY_OVER, km } from '@/gc/gc'
import { cartCount, cartLines, cartTotal, closeCart, removeFromCart, setQty, useShop } from '@/lib/cart'
import { artikala, money } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'
import { Icon } from '../ui'
import ProductImage from './ProductImage'
import { Stepper } from './ProductCard'

const FOCUSABLE = 'button:not(:disabled), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Cart drawer from grand-maison CartDrawer (focus trap, Esc, Lenis stop), in the house style: surface panel, hairlines.
export default function CartDrawer() {
  const { cart, cartOpen } = useShop()
  const lenis = useLenis()
  const scrollTo = useScrollTo()
  const panel = useRef<HTMLDivElement>(null)
  const lines = cartLines(cart)
  const count = cartCount(cart)
  const total = cartTotal(cart)

  useEffect(() => {
    if (!cartOpen) return
    lenis?.stop()
    const before = document.activeElement as HTMLElement | null
    panel.current?.querySelector<HTMLElement>('[data-close]')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return closeCart()
      if (e.key !== 'Tab') return
      const items = panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!items?.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
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
      lenis?.start()
      before?.focus({ preventScroll: true })
    }
  }, [cartOpen, lenis])

  const go = (id: string) => {
    closeCart()
    scrollTo(id)
  }

  return (
    <div className={`fixed inset-0 z-[600] ${cartOpen ? '' : 'pointer-events-none'}`} aria-hidden={!cartOpen}>
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-deeper/40 transition-opacity duration-700 ${cartOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Korpa"
        inert={!cartOpen}
        className={`absolute right-0 top-0 flex h-dvh w-full flex-col bg-surface text-ink shadow-[-20px_0_60px_-30px_rgba(16,15,14,0.35)] transition-[transform,visibility] duration-700 [transition-timing-function:var(--ease-io)] sm:w-[460px] ${
          cartOpen ? 'visible translate-x-0' : 'invisible translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/12 px-5 py-4">
          <h2 className="s-sub">
            Korpa <span className="text-muted tnum">({count})</span>
          </h2>
          <button data-close type="button" onClick={closeCart} className="-m-2 flex items-center gap-1.5 p-2 text-[13px] hover:opacity-60">
            Zatvori <Icon name="close" className="size-4" />
          </button>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-5">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-start justify-center gap-4 pb-10">
              <p className="s-sub">Korpa je prazna.</p>
              <p className="max-w-[36ch] text-[14px] text-muted">
                Dodajte artikle iz kataloga ili cijeli spisak iz kalkulatora, pa pošaljite upit za ponudu.
              </p>
              <button type="button" onClick={() => go('katalog')} className="btn-line mt-2">
                Katalog <span aria-hidden>→</span>
              </button>
            </div>
          ) : (
            <ul>
              {lines.map((l) => (
                <li key={l.key} className="flex gap-4 border-b border-ink/12 py-4">
                  {l.image ? (
                    <ProductImage src={l.image} alt="" sizes="64px" className="size-16 shrink-0" />
                  ) : (
                    <span className="grid size-16 shrink-0 place-items-center bg-well font-display text-[13px] font-medium">Komplet</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] font-medium leading-snug">{l.name}</p>
                      <p className="shrink-0 text-[14px] font-medium tnum">{money(l.price * l.qty)}</p>
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted tnum">
                      {money(l.price)} / {l.unit}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <Stepper value={l.qty} step={l.step} unit={l.unit} onChange={(n) => setQty(l.key, n)} className="!h-9 w-[150px]" />
                      <button type="button" onClick={() => removeFromCart(l.key)} className="link-u text-[13px] text-muted">
                        Ukloni
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-ink/12 px-5 pb-7 pt-5">
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] text-muted">Orijentacioni iznos · {artikala(count)}</p>
              <p className="text-[24px] font-medium tnum">{money(total)}</p>
            </div>
            <p className="mt-2 text-[12px] leading-[1.5] text-muted">
              Cijene u KM sa PDV-om.{' '}
              {total >= FREE_DELIVERY_OVER
                ? 'Standardna dostava je besplatna za ovaj iznos.'
                : `Standardna dostava je besplatna preko ${km(FREE_DELIVERY_OVER)}.`}{' '}
              Demo prodavnica: ništa se ne naplaćuje.
            </p>
            <button type="button" onClick={() => go('upit')} className="btn-solid mt-5 w-full !py-4">
              <span>Pošalji upit za ponudu</span>
              <span aria-hidden>→</span>
            </button>
            <button type="button" onClick={closeCart} className="mt-3 w-full py-2 text-[13px] hover:opacity-60">
              Nastavi kupovinu
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
