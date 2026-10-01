'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { useRouter } from 'next/navigation'
import { cartCount, cartLines, closeCart, notify, removeFromCart, setQty, useShop } from '@/lib/cart'
import { artikala, money, qtyLabel } from '@/lib/shop'
import ProductImage from './ProductImage'
import { useScrollTo } from '@/lib/useScrollTo'
import Cta from '@/components/ui/Cta'
import Price from '@/components/b2b/Price'
import { buildQuote } from '@/components/b2b/quote'
import { METHOD_LABEL, setPrefs, useDeliveryPrefs } from '@/components/b2b/prefs'
import { creditUsage, openLogin, useB2B } from '@/lib/b2b'
import { DELIVERY_ZONES, recommendCrane, tons, type DeliveryMethod } from '@/lib/logistics'
import Link from 'next/link'

const FOCUSABLE = 'button:not(:disabled), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Korpa je ladica sa desne strane. U B2B načinu (prijavljen partner) cijene su sa ugovorenim rabatom,
// bira se gradilište, provjerava raspoloživi kreditni limit i nudi predračun. Isporuka: masa tereta u
// tonama, zona i način (preuzimanje / standardna / kamion sa kranom) — lib/logistics.
// Nalazi se IZVAN prodavnice u DOM-u, jer značka i marquee iz landinga
// stoje na višem sloju od cijele prodavnice, a ladica mora biti iznad njih.
export default function CartDrawer() {
  const { cart, cartOpen } = useShop()
  const lenis = useLenis()
  const scrollTo = useScrollTo()
  const router = useRouter()
  const panel = useRef<HTMLDivElement>(null)
  const lines = cartLines(cart)
  const count = cartCount(cart)
  const { mode, partner, discount } = useB2B()
  const b2b = mode === 'b2b' && !!partner
  const prefs = useDeliveryPrefs()
  const q = buildQuote(cart, discount, prefs)
  const credit = partner ? creditUsage(partner) : null
  const overCredit = b2b && credit ? q.total > credit.available : false

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
          <h2 className="flex items-baseline gap-3 leading-none">
            <span className="font-pretty text-[36px]">Korpa</span> <span className="text-[12.5px] text-ink/45 tabular-nums">({count})</span>
          </h2>
          <button data-close type="button" onClick={closeCart} className="ulink text-[12.5px]">
            Zatvori
          </button>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-8">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 pb-16 text-center">
              <p className="font-pretty text-[clamp(30px,3vw,44px)] leading-[1.05]">Korpa je prazna.</p>
              <p className="max-w-[30ch] text-[12.5px] text-ink/60">Dodajte artikle iz prodavnice, pa pošaljite upit za ponudu.</p>
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
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
                      <p className="min-w-[12ch] flex-1 text-[12.5px] leading-[1.25]">{l.name}</p>
                      <p className="ml-auto text-right text-[12.5px]">
                        <Price value={l.price} qty={l.qty} className="justify-end" />
                      </p>
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

          {lines.length > 0 && (
            <section className="border-b border-ink/15 py-6" aria-label="Isporuka">
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="opacity-60">Isporuka</span>
                <span className="tabular-nums opacity-60">Masa tereta {tons(q.kg)} t</span>
              </div>
              <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Način isporuke">
                {(['preuzimanje', 'standard', 'kran'] as DeliveryMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={prefs.method === m}
                    onClick={() => setPrefs({ method: m })}
                    className={`flex items-center justify-between rounded-[12px] border px-4 py-3 text-left text-[11.5px] transition-colors ${
                      prefs.method === m ? 'border-ink bg-[var(--btn)]/40' : 'border-ink/15 hover:border-ink/40'
                    }`}
                  >
                    <span>
                      {METHOD_LABEL[m]}
                      {m === 'kran' && recommendCrane(q.kg) && <span className="b2b-pill ml-2">preporučeno</span>}
                    </span>
                    <span className={`size-3 rounded-full border ${prefs.method === m ? 'border-ink bg-ink' : 'border-ink/40'}`} />
                  </button>
                ))}
              </div>
              {prefs.method === 'kran' && (
                <p className="mt-2 text-[10.5px] leading-[1.5] opacity-60">
                  Istovar paleta direktno na sprat ili etažu gradilišta (prevoz + rad dizalice).
                </p>
              )}
              {prefs.method !== 'preuzimanje' && (
                <label className="mt-4 grid gap-1.5 text-[10.5px] opacity-80">
                  Zona dostave
                  <select value={prefs.zoneId} onChange={(e) => setPrefs({ zoneId: e.target.value })} className="b2b-input">
                    {DELIVERY_ZONES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {b2b && partner && (
                <label className="mt-4 grid gap-1.5 text-[10.5px] opacity-80">
                  Gradilište
                  <select value={prefs.siteId ?? ''} onChange={(e) => setPrefs({ siteId: e.target.value || null })} className="b2b-input">
                    <option value="">— izaberite gradilište —</option>
                    {partner.sites.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </section>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-ink/15 px-6 pb-7 pt-5 md:px-8">
            <dl className="grid gap-1.5 text-[11.5px]">
              {q.savings > 0 && (
                <>
                  <div className="flex justify-between opacity-60">
                    <dt>Maloprodajna vrijednost</dt>
                    <dd className="tabular-nums">{money(q.retail)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Ugovoreni rabat {Math.round(discount * 100)}%</dt>
                    <dd className="tabular-nums">−{money(q.savings)}</dd>
                  </div>
                </>
              )}
              <div className="flex justify-between opacity-80">
                <dt>{artikala(count)}</dt>
                <dd className="tabular-nums">{money(q.goods)}</dd>
              </div>
              <div className="flex justify-between opacity-80">
                <dt>{METHOD_LABEL[prefs.method]}</dt>
                <dd className="tabular-nums">{q.delivery ? money(q.delivery) : 'bez troška'}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-baseline justify-between border-t border-ink/15 pt-3">
              <p className="text-[11.5px] opacity-60">Ukupno sa PDV-om</p>
              <p className="num text-[28px]">{money(q.total)}</p>
            </div>
            {b2b && credit && (
              <p className={`mt-2 text-[10.5px] ${overCredit ? 'text-signal' : 'opacity-60'}`}>
                {overCredit
                  ? `Iznos prelazi raspoloživi kreditni limit (${money(credit.available)}).`
                  : `Raspoloživi kreditni limit: ${money(credit.available)} · valuta ${partner?.paymentDays} dana`}
              </p>
            )}
            {!b2b && <p className="mt-2 text-[10.5px] opacity-50">Demo prodavnica — ništa se ne naplaćuje.</p>}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {b2b ? (
                <>
                  <Cta
                    solid
                    onClick={() => {
                      closeCart()
                      notify(overCredit ? 'Narudžba čeka odobrenje komercijaliste (demo)' : 'Narudžba je poslata na odgođeno plaćanje (demo)')
                    }}
                  >
                    Naruči
                  </Cta>
                  <Link href="/portal/predracun" onClick={closeCart} className="cta">
                    <span className="cta-roll">
                      <span>Predračun</span>
                      <span aria-hidden>Predračun</span>
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Cta solid onClick={() => go('ponuda')}>
                    Upit
                  </Cta>
                  <button type="button" onClick={openLogin} className="ulink text-[11px]">
                    B2B prijava
                  </button>
                </>
              )}
            </div>
            <button type="button" onClick={closeCart} className="ulink mx-auto mt-4 block text-[11px] opacity-70">
              Nastavi kupovinu
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
