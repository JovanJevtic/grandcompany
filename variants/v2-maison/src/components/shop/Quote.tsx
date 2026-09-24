'use client'

import { useState, type FormEvent } from 'react'
import { cartCount, cartLines, cartTotal, useShop } from '@/lib/cart'
import { artikala, money } from '@/lib/shop'
import { OpenBox } from './Reveal'
import SectionHead from './SectionHead'

const KINDS = [
  ['privatni', 'Privatni kupac'],
  ['izvodjac', 'Izvođač radova'],
  ['investitor', 'Investitor'],
]

const FIELD =
  'w-full border-b-2 border-ink/40 bg-transparent py-3 text-small uppercase outline-none transition-colors duration-300 placeholder:text-ink/25 focus:border-ink'

export default function Quote() {
  const { cart } = useShop()
  const lines = cartLines(cart)
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: poslati podatke (mail servis ili API). Za sada forma samo prikazuje potvrdu.
    setSent(true)
  }

  return (
    <section id="ponuda" data-spy className="gutter scroll-mt-[var(--bar)] py-[14dvh]">
      <SectionHead
        no="09"
        label="Upit"
        title="Zatražite ponudu"
        lead="Pošaljite predmjer ili spisak artikala. Javljamo se sa cijenom i rokom isporuke."
      />

      <OpenBox className="mt-[8dvh] border-[10px] border-ink">
        <div className="grid gap-10 p-6 md:grid-cols-12 md:gap-[3vw] md:p-[3vw]">
          {sent ? (
            <div className="flex min-h-[40dvh] flex-col items-start justify-center gap-6 md:col-span-12">
              <p className="text-title uppercase">Hvala.</p>
              <p className="max-w-[40ch] text-small uppercase">
                Vaš upit je primljen. Javljamo se sa ponudom čim ga pregledamo.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="border-2 border-ink px-4 py-3.5 text-micro uppercase transition-colors duration-300 hover:bg-ink hover:text-bg"
              >
                Pošalji novi upit
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={onSubmit} className="flex flex-col gap-8 md:col-span-7">
                <div role="radiogroup" aria-labelledby="quote-kind">
                  <p id="quote-kind" className="mb-3 text-micro uppercase text-ink/60">
                    Ko ste?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {KINDS.map(([v, l], i) => (
                      <label key={v} className="cursor-pointer">
                        <input type="radio" name="kind" value={v} defaultChecked={i === 0} className="peer sr-only" />
                        <span className="block border-2 border-ink px-2 py-3 text-center text-micro uppercase transition-colors duration-300 peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                          {l}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex flex-col gap-1 text-micro uppercase">
                  <span className="text-ink/60">Ime i prezime</span>
                  <input name="name" required autoComplete="name" placeholder="Vaše ime" className={FIELD} />
                </label>

                <label className="flex flex-col gap-1 text-micro uppercase">
                  <span className="text-ink/60">Telefon ili e-mail</span>
                  <input name="contact" required autoComplete="email" placeholder="Kako da vas kontaktiramo" className={FIELD} />
                </label>

                <label className="flex flex-col gap-1 text-micro uppercase">
                  <span className="text-ink/60">Šta vam treba</span>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Vrsta radova, površina, rok, lokacija isporuke"
                    className={`${FIELD} resize-none`}
                  />
                </label>

                <button
                  type="submit"
                  className="flex w-full items-center justify-between bg-ink px-4 py-4 text-micro uppercase text-bg transition-opacity duration-300 hover:opacity-85 md:w-auto md:min-w-[320px]"
                >
                  <span>Pošalji upit</span>
                  <span aria-hidden>→</span>
                </button>
              </form>

              <aside className="md:col-span-5 md:border-l-2 md:border-ink md:pl-[3vw]">
                <p className="flex justify-between text-micro uppercase">
                  <span>Vaš spisak</span>
                  <span className="tabular-nums">{lines.length ? artikala(cartCount(cart)) : ''}</span>
                </p>
                {lines.length === 0 ? (
                  <p className="mt-4 border-t-2 border-ink pt-4 text-micro uppercase text-ink/60">
                    Spisak je prazan. Dodajte artikle iz prodavnice ili opišite šta vam treba.
                  </p>
                ) : (
                  <>
                    <ul className="mt-4 border-t-2 border-ink">
                      {lines.map((l) => (
                        <li key={l.key} className="flex items-baseline justify-between gap-4 border-b border-ink/25 py-2.5 uppercase">
                          <span className="text-micro">
                            <span className="tabular-nums opacity-60">{l.qty} ×</span> {l.name}
                          </span>
                          <span className="shrink-0 text-micro tabular-nums">{money(l.price * l.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 flex items-baseline justify-between uppercase">
                      <span className="text-micro text-ink/60">Orijentacioni iznos</span>
                      <span className="text-lead tabular-nums">{money(cartTotal(cart))}</span>
                    </p>
                  </>
                )}
              </aside>
            </>
          )}
        </div>
      </OpenBox>
    </section>
  )
}
