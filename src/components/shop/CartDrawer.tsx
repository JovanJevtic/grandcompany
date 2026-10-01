'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { useRouter } from 'next/navigation'
import { cartCount, cartLines, cartTotal, closeCart, removeFromCart, setQty, useShop } from '@/lib/cart'
import { artikala, money, qtyLabel } from '@/lib/shop'
import ProductImage from './ProductImage'
import { useScrollTo } from '@/lib/useScrollTo'
import Cta from '@/components/ui/Cta'

const FOCUSABLE = 'button:not(:disabled), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Korpa je ladica sa desne strane. Nalazi se IZVAN prodavnice u DOM-u, jer značka i marquee iz landinga
// stoje na višem sloju od cijele prodavnice, a ladica mora biti iznad njih.
export default function CartDrawer() {
  const { cart, cartOpen } = useShop()
  const lenis = useLenis()
  const scrollTo = useScrollTo()
  const router = useRouter()
  const panel = useRef<HTMLDivElement>(null)
  const lines = cartLines(cart)
  const count = cartCount(cart)

  // Dok je korpa otvorena, stranica iza nje ne skrola. Tab ostaje unutar ladice, Esc je zatvara.
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

  // Upit ide na formu (#ponuda) ako je ima na stranici, inače na kontakt u podnožju.
  const go = (id: string) => {
    closeCart()
    scrollTo(document.getElementById(id) ? id : 'kontakt')
  }
  const toShop = () => {
    closeCart()
    router.push('/prodavnica')
  }

  return (
    <div className={`fixed inset-0 z-[600] ${cartOpen ? '' : 'pointer-events-none'}`} aria-hidden={!cartOpen}>
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/35 backdrop-blur-[2px] transition-opacity duration-700 ${cartOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Korpa"
        inert={!cartOpen}
        className={`absolute right-0 top-0 flex h-dvh w-full flex-col bg-bg text-ink transition-[transform,visibility] duration-700 [transition-timing-function:var(--ease-io)] sm:w-[480px] ${
          cartOpen ? 'visible translate-x-0' : 'invisible translate-x-full'
        }`}
      >
        <div className="flex items-baseline justify-between px-6 pb-6 pt-7 md:px-8">
          <h2 className="text-[32px] leading-none tracking-[-0.02em]">
            Korpa <em className="text-[0.6em] text-ink/45 not-italic tabular-nums">({count})</em>
          </h2>
          <button data-close type="button" onClick={closeCart} className="ulink text-[15px]">
            Zatvori
          </button>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-8">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 pb-16 text-center">
              <p className="text-[clamp(28px,3vw,40px)] italic leading-[1.05] tracking-[-0.02em]">Korpa je prazna.</p>
              <p className="max-w-[30ch] text-[15px] text-ink/60">Dodajte artikle iz prodavnice, pa pošaljite upit za ponudu.</p>
              <Cta onClick={toShop} className="mt-4">
                Prodavnica
              </Cta>
            </div>
          ) : (
            <ul className="border-t border-ink/15">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-4 border-b border-ink/15 py-5">
                  {l.image ? (
                    <ProductImage src={l.image} alt="" className="aspect-[4/5] w-[72px] shrink-0 !bg-plate" />
                  ) : (
                    <span className="aspect-[4/5] w-[72px] shrink-0 bg-plate" aria-hidden />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-[16px] leading-[1.25]">{l.name}</p>
                      <p className="shrink-0 text-[15px] tabular-nums">{money(l.price * l.qty)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <div className="flex items-center rounded-full border border-ink/20">
                        <button
                          type="button"
                          aria-label={`Smanji količinu: ${l.name}`}
                          onClick={() => setQty(l.key, l.qty - l.step)}
                          className="grid size-8 place-items-center rounded-full transition-colors hover:text-signal"
                        >
                          −
                        </button>
                        <span className="min-w-14 text-center tabular-nums">{qtyLabel(l.qty, l.unit)}</span>
                        <button
                          type="button"
                          aria-label={`Povećaj količinu: ${l.name}`}
                          onClick={() => setQty(l.key, l.qty + l.step)}
                          className="grid size-8 place-items-center rounded-full transition-colors hover:text-signal"
                        >
                          +
                        </button>
                      </div>
                      <button type="button" onClick={() => removeFromCart(l.key)} className="ulink text-ink/55 hover:text-ink">
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
          <div className="px-6 pb-8 pt-6 md:px-8">
            <div className="flex items-baseline justify-between">
              <p className="text-[15px] text-ink/60">{artikala(count)}</p>
              <p className="text-[28px] tabular-nums tracking-[-0.02em]">{money(cartTotal(cart))}</p>
            </div>
            <p className="mt-2 text-[13px] italic text-ink/50">
              Sa PDV-om. Dostavu i plaćanje potvrđujemo ponudom. Demo prodavnica — ništa se ne naplaćuje.
            </p>
            <div className="mt-6 grid gap-2">
              <Cta solid onClick={() => go('ponuda')} className="mx-auto">
                Upit
              </Cta>
              <button type="button" onClick={closeCart} className="ulink mx-auto mt-2 text-[15px] text-ink/70">
                Nastavi kupovinu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
