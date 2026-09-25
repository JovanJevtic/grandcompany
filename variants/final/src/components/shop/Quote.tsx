'use client'

import { useState, type FormEvent } from 'react'
import { COMPANY } from '@/gc/gc'
import { cartCount, cartLines, cartTotal, openCart, useShop } from '@/lib/cart'
import { artikala, money, qtyLabel } from '@/lib/shop'
import { SectionTitle } from '../ui'

const KINDS = [
  ['privatni', 'Privatni kupac'],
  ['izvodjac', 'Izvođač radova'],
  ['firma', 'Firma / partner'],
]

// Upit: grand-maison Quote (form + the cart as a list). Demo: nothing is sent, and the confirmation says so.
export default function Quote() {
  const { cart } = useShop()
  const lines = cartLines(cart)
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="upit" aria-labelledby="upit-h" className="relative z-10 border-t border-ink/12 bg-canvas py-16 lg:py-24">
      <div className="gutter wrap">
        <SectionTitle
          id="upit-h"
          title="Zatražite ponudu"
          lead="Pošaljite spisak iz korpe ili predmjer. Javljamo se sa cijenom, stanjem i terminom isporuke."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          {sent ? (
            <div className="flex min-h-[320px] flex-col items-start justify-center gap-4 bg-surface p-6 md:p-10 lg:col-span-2">
              <p className="s-sub">Upit nije poslan: ovo je demo prodavnica.</p>
              <p className="max-w-[56ch] text-[15px] leading-[1.6] text-muted">
                Forma još nije povezana sa prodajom. Za pravu ponudu pozovite{' '}
                <a href={COMPANY.phoneLandlineHref} className="link-u text-ink tnum">
                  {COMPANY.phoneLandline}
                </a>{' '}
                ili pošaljite spisak na{' '}
                <a href={`mailto:${COMPANY.emailSales}`} className="link-u text-ink">
                  {COMPANY.emailSales}
                </a>
                .
              </p>
              <button type="button" onClick={() => setSent(false)} className="btn-line mt-2">
                Nazad na formu <span aria-hidden>→</span>
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={onSubmit} className="flex flex-col gap-6 bg-surface p-6 md:p-10">
                <fieldset>
                  <legend className="eyebrow text-[10px] text-muted">Ko ste</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {KINDS.map(([v, l], i) => (
                      <label key={v} className="cursor-pointer">
                        <input type="radio" name="kind" value={v} defaultChecked={i === 0} className="peer sr-only" />
                        <span className="chip peer-checked:border-ink peer-checked:bg-ink peer-checked:text-canvas peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                          {l}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-muted">Ime i prezime</span>
                    <input name="name" required autoComplete="name" className="field" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-muted">Telefon ili e-mail</span>
                    <input name="contact" required autoComplete="email" className="field" />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] text-muted">Šta vam treba</span>
                  <textarea name="message" rows={4} placeholder="Vrsta radova, površina, rok, mjesto isporuke" className="field resize-none" />
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <button type="submit" className="btn-solid !px-6 !py-4">
                    Pošalji upit <span aria-hidden>→</span>
                  </button>
                  <span className="text-[12px] text-muted">Demo: upit se ne šalje.</span>
                </div>
              </form>

              <aside aria-label="Vaš spisak" className="border border-ink/15 p-6 md:p-10">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="s-sub">Vaš spisak</h3>
                  {lines.length > 0 && <span className="text-[13px] text-muted tnum">{artikala(cartCount(cart))}</span>}
                </div>
                {lines.length === 0 ? (
                  <p className="mt-4 border-t border-ink/12 pt-4 text-[14px] leading-[1.6] text-muted">
                    Korpa je prazna. Dodajte artikle iz kataloga ili kalkulatora, ili opišite posao u poruci.
                  </p>
                ) : (
                  <>
                    <ul className="mt-4 border-t border-ink/12 text-[13.5px]">
                      {lines.map((l) => (
                        <li key={l.key} className="flex items-baseline justify-between gap-4 border-b border-ink/12 py-2.5">
                          <span className="min-w-0">
                            <span className="text-muted tnum">{qtyLabel(l.qty, l.unit)}</span> · {l.name}
                          </span>
                          <span className="shrink-0 tnum">{money(l.price * l.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 flex items-baseline justify-between">
                      <span className="text-[13px] text-muted">Orijentacioni iznos sa PDV-om</span>
                      <span className="text-[22px] font-medium tnum">{money(cartTotal(cart))}</span>
                    </p>
                    <button type="button" onClick={openCart} className="link-u mt-3 text-[13px]">
                      Uredi korpu
                    </button>
                  </>
                )}
              </aside>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
