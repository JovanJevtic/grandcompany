'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { cartCount, cartLines, cartTotal, closeCart, removeFromCart, setQty, useShop } from '@/lib/cart'
import { artikala, money } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'

const FOCUSABLE = 'button:not(:disabled), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Korpa je ladica sa desne strane. Nalazi se IZVAN prodavnice u DOM-u, jer značka i marquee iz landinga
// stoje na višem sloju od cijele prodavnice, a ladica mora biti iznad njih.
export default function CartDrawer() {
  const { cart, cartOpen } = useShop()
  const lenis = useLenis()
  const scrollTo = useScrollTo()
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

  const go = (id: string) => {
    closeCart()
    scrollTo(id)
  }

  return (
    <div
      className={`fixed inset-0 z-[600] ${cartOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!cartOpen}
    >
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/50 transition-opacity duration-700 ${cartOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Korpa"
        inert={!cartOpen}
        className={`absolute right-0 top-0 flex h-dvh w-full flex-col bg-ink text-bg transition-[transform,visibility] duration-700 [transition-timing-function:var(--ease-io)] sm:w-[480px] ${
          cartOpen ? 'visible translate-x-0' : 'invisible translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b-2 border-bg px-5 py-5 text-micro uppercase">
          <h2>
            Korpa <span className="tabular-nums opacity-60">({count})</span>
          </h2>
          <button data-close type="button" onClick={closeCart} className="uppercase underline underline-offset-4">
            Zatvori
          </button>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-5">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-start justify-center gap-6 pb-10">
              <p className="text-lead uppercase">Korpa je prazna.</p>
              <p className="max-w-[32ch] text-micro uppercase opacity-60">
                Dodajte artikle ili komplete iz prodavnice, pa pošaljite upit za ponudu.
              </p>
              <button
                type="button"
                onClick={() => go('prodavnica')}
                className="border-2 border-bg px-4 py-3 text-micro uppercase transition-colors duration-300 hover:bg-bg hover:text-ink"
              >
                Idi u prodavnicu →
              </button>
            </div>
          ) : (
            <ul>
              {lines.map((l) => (
                <li key={l.key} className="border-b border-bg/25 py-5">
                  <div className="flex items-start justify-between gap-4 uppercase">
                    <div className="min-w-0">
                      <p className="text-small">{l.name}</p>
                      <p className="mt-1.5 text-micro opacity-60">{l.spec}</p>
                    </div>
                    <p className="shrink-0 text-small tabular-nums">{money(l.price * l.qty)}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-micro uppercase">
                    <div className="flex items-stretch border-2 border-bg">
                      <button
                        type="button"
                        aria-label={`Smanji količinu: ${l.name}`}
                        onClick={() => setQty(l.key, l.qty - 1)}
                        className="w-9 transition-colors duration-300 hover:bg-bg hover:text-ink"
                      >
                        −
                      </button>
                      <span className="grid min-w-10 place-items-center border-x-2 border-bg tabular-nums">{l.qty}</span>
                      <button
                        type="button"
                        aria-label={`Povećaj količinu: ${l.name}`}
                        onClick={() => setQty(l.key, l.qty + 1)}
                        className="w-9 transition-colors duration-300 hover:bg-bg hover:text-ink"
                      >
                        +
                      </button>
                    </div>
                    <p className="opacity-60">
                      {money(l.price)} / {l.unit}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(l.key)}
                      className="underline underline-offset-4"
                    >
                      Ukloni
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t-2 border-bg px-5 pb-8 pt-5">
            <div className="flex items-baseline justify-between uppercase">
              <p className="text-micro opacity-60">Orijentacioni iznos · {artikala(count)}</p>
              <p className="text-lead tabular-nums">{money(cartTotal(cart))}</p>
            </div>
            <p className="mt-3 text-micro uppercase opacity-60">
              Konačnu cijenu, dostavu i plaćanje potvrđujemo ponudom.
            </p>
            <button
              type="button"
              onClick={() => go('ponuda')}
              className="mt-5 flex w-full items-center justify-between bg-bg px-4 py-4 text-micro uppercase text-ink transition-opacity duration-300 hover:opacity-85"
            >
              <span>Pošalji upit za ponudu</span>
              <span aria-hidden>→</span>
            </button>
            <button
              type="button"
              onClick={closeCart}
              className="mt-2 w-full border-2 border-bg px-4 py-3.5 text-micro uppercase transition-colors duration-300 hover:bg-bg hover:text-ink"
            >
              Nastavi kupovinu
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
