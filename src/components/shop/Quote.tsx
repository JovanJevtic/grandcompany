'use client'

import { useState, type FormEvent } from 'react'
import { COMPANY } from '@/gc/gc'
import { PRODUCTS, artikala, km, qtyText } from '@/lib/shop'
import SectionHead from './SectionHead'
import { useShop } from './ShopProvider'

const KINDS = [
  ['privatni', 'Privatni kupac'],
  ['izvodjac', 'Izvođač radova'],
  ['investitor', 'Investitor'],
]

const FIELD = 'field !text-[clamp(20px,2vw,28px)]'

// Upit (grand-maison Quote, u cipher slogu): obrazac lijevo, a desno spisak iz korpe (isti podaci kao CartDrawer).
// Slanje nije povezano ni s čim (demo), pa potvrda to iskreno kaže i nudi stvarne kontakte.
export default function Quote() {
  const { lines, total, count, setCartOpen } = useShop()
  const items = PRODUCTS.filter((p) => lines[p.id]).map((p) => ({ p, q: lines[p.id] }))
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="upit" className="border-t border-line px-5 py-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="11 / 12"
        eyebrow="Upit"
        title={
          <>
            zatražite <em>ponudu</em>.
          </>
        }
        intro="Pošaljite predmjer ili spisak iz korpe. Javljamo se sa cijenom, stanjem i terminom istovara."
      />

      <div data-reveal className="mt-[clamp(56px,8vw,120px)] grid gap-12 border-t border-line pt-10 lg:grid-cols-12 lg:gap-5">
        {sent ? (
          <div className="flex min-h-[40svh] flex-col items-start justify-center gap-6 lg:col-span-12">
            <p className="display text-[clamp(44px,7vw,112px)]">
              hvala, <em>ali…</em>
            </p>
            <p className="max-w-[48ch] text-[15px] leading-[1.55] text-dim">
              Ovo je demo prodavnica: upit nije poslan. Za stvarnu ponudu pišite na{' '}
              <a className="text-fg underline underline-offset-4" href={`mailto:${COMPANY.emailSales}`}>
                {COMPANY.emailSales}
              </a>{' '}
              ili nazovite{' '}
              <a className="text-fg underline underline-offset-4" href={COMPANY.phoneLandlineHref}>
                {COMPANY.phoneLandline}
              </a>
              .
            </p>
            <button type="button" onClick={() => setSent(false)} className="btn">
              Nazad na obrazac
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={onSubmit} className="flex flex-col gap-9 lg:col-span-7 lg:pr-[4vw]">
              <fieldset>
                <legend className="info mb-4 text-dim">Ko ste?</legend>
                <div className="grid grid-cols-3 gap-2">
                  {KINDS.map(([v, l], i) => (
                    <label key={v} className="cursor-pointer">
                      <input type="radio" name="kind" value={v} defaultChecked={i === 0} className="peer sr-only" />
                      <span className="chip block text-center peer-checked:border-fg peer-checked:bg-fg peer-checked:text-bg peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2">
                        {l}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="flex flex-col gap-1">
                <span className="info text-dim">Ime i prezime ili firma</span>
                <input name="name" required autoComplete="name" placeholder="Vaše ime" className={FIELD} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="info text-dim">Telefon ili e-pošta</span>
                <input name="contact" required autoComplete="email" placeholder="Kako da vas kontaktiramo" className={FIELD} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="info text-dim">Šta vam treba</span>
                <textarea name="message" rows={3} placeholder="Vrsta radova, površina, rok, lokacija istovara" className={`${FIELD} resize-none`} />
              </label>

              <button type="submit" className="btn btn-solid w-full justify-between md:w-auto md:min-w-[320px] md:self-start">
                <span>Pošalji upit</span>
                <span aria-hidden>→</span>
              </button>
            </form>

            <aside className="lg:col-span-5 lg:border-l lg:border-line lg:pl-8">
              <p className="info flex justify-between text-dim">
                <span>Vaš spisak</span>
                <span className="tabular-nums">{items.length ? artikala(count) : ''}</span>
              </p>
              {items.length === 0 ? (
                <p className="mt-4 border-t border-line pt-4 text-[15px] leading-[1.55] text-dim">
                  Spisak je prazan. Dodajte artikle iz prodavnice ili komplet, ili opišite šta vam treba.
                </p>
              ) : (
                <>
                  <ul className="mt-4 border-t border-line">
                    {items.map(({ p, q }) => (
                      <li key={p.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-[14px]">
                        <span>
                          <span className="tabular-nums text-dim">
                            {qtyText(q)} {p.unit} ×
                          </span>{' '}
                          {p.name}
                        </span>
                        <span className="shrink-0 tabular-nums">{km(p.price * q)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 flex items-baseline justify-between">
                    <span className="info text-dim">Orijentacioni iznos</span>
                    <span className="font-serif text-[clamp(28px,2.6vw,40px)] leading-none tabular-nums">{km(total)}</span>
                  </p>
                  <button type="button" onClick={() => setCartOpen(true)} className="info mt-5 underline underline-offset-4">
                    Uredi u korpi
                  </button>
                </>
              )}
            </aside>
          </>
        )}
      </div>
    </section>
  )
}
