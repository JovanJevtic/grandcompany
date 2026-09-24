'use client'

import { useState, type FormEvent } from 'react'
import { COLORS } from '@/lib/content'
import { COMPANY } from '@/lib/company'
import { formatNumber, formatPrice, productById } from '@/lib/shop'
import { plural } from '@/gc/gc'
import ShopLink from './ShopLink'
import { Section, SectionHead } from './parts'
import { useShop } from './ShopProvider'

// Zatražite ponudu (komponenta Quote iz grand-maison, prenesena u jezik grand-root). Uz obrazac stoji spisak iz
// korpe, da komercijalista odmah vidi šta treba. Sajt još nije povezan sa prodajom, pa se to pošteno kaže.

const KINDS = [
  ['privatni', 'Privatni kupac'],
  ['izvodjac', 'Izvođač radova'],
  ['firma', 'Firma / partner'],
] as const

const muted = { color: COLORS.base }

export default function Quote() {
  const { cart, subtotal, openPanel } = useShop()
  const [kind, setKind] = useState<(typeof KINDS)[number][0]>('izvodjac')
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <Section id="ponuda" color={COLORS.what}>
      <SectionHead no="011" side="Upit za ponudu" title="Ponuda" />
      <p data-reveal className="copy-l mt-[3vw] max-w-[28ch] max-md:mt-6">
        Pošaljite predmjer ili spisak iz korpe. <em>Javljamo se sa cijenom i terminom istovara.</em>
      </p>

      <div data-reveal className="mt-[5vw] grid grid-cols-12 gap-x-6 gap-y-12 border-t border-current pt-[3vw] max-md:mt-10 max-md:pt-8">
        {sent ? (
          <div role="status" className="col-span-12 max-w-[46ch] text-ink md:col-span-7">
            <p className="copy-l">Upit još ne može biti poslat.</p>
            <p className="copy mt-4">
              Ovo je demo prodavnica i nije povezana sa prodajom, pa ništa nije poslato. Do tada nas pozovite ili pišite
              direktno, a komercijalista će vam pripremiti ponudu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3" style={{ ['--acc' as string]: COLORS.what } as React.CSSProperties}>
              {COMPANY.phoneHref && (
                <a href={COMPANY.phoneHref} className="pill pill-solid">
                  {COMPANY.phone}
                </a>
              )}
              {COMPANY.emailSales && (
                <a href={`mailto:${COMPANY.emailSales}`} className="pill">
                  {COMPANY.emailSales}
                </a>
              )}
              <button type="button" className="pill" onClick={() => setSent(false)}>
                Nazad na obrazac
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="col-span-12 flex flex-col gap-8 text-ink md:col-span-7">
            <fieldset>
              <legend className="lbl" style={muted}>
                Ko ste?
              </legend>
              <div className="mt-3 flex flex-wrap gap-2" style={{ ['--acc' as string]: COLORS.what } as React.CSSProperties}>
                {KINDS.map(([v, l]) => (
                  <label key={v} className={`pill ${kind === v ? 'pill-on' : ''} has-[:focus-visible]:outline has-[:focus-visible]:outline-2`}>
                    <input type="radio" name="kind" value={v} checked={kind === v} onChange={() => setKind(v)} className="sr-only" />
                    {l}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              <label className="block">
                <span className="lbl" style={muted}>
                  {kind === 'firma' ? 'Firma *' : 'Ime i prezime *'}
                </span>
                <input name="name" required autoComplete={kind === 'firma' ? 'organization' : 'name'} className="field field-sm" />
              </label>
              <label className="block">
                <span className="lbl" style={muted}>
                  Telefon ili e-pošta *
                </span>
                <input name="contact" required autoComplete="email" className="field field-sm" />
              </label>
              <label className="block sm:col-span-2">
                <span className="lbl" style={muted}>
                  Lokacija gradilišta
                </span>
                <input name="site" autoComplete="street-address" placeholder="Mjesto, ulica, sprat, pristup za kran" className="field field-sm" />
              </label>
              <label className="block sm:col-span-2">
                <span className="lbl" style={muted}>
                  Šta vam treba
                </span>
                <textarea name="message" rows={4} placeholder="Vrsta radova, površina, rok isporuke" className="field field-sm" />
              </label>
            </div>

            <button type="submit" className="pill pill-solid self-start" style={{ ['--acc' as string]: COLORS.what } as React.CSSProperties}>
              Pošalji upit →
            </button>
          </form>
        )}

        <aside className="col-span-12 text-ink md:col-span-5 md:border-l md:border-current md:pl-[3vw]" style={{ borderColor: COLORS.what }}>
          <p className="lbl flex justify-between" style={{ color: COLORS.what }}>
            <span>Vaš spisak</span>
            <span>{cart.length ? `${cart.length} ${plural(cart.length, 'artikal', 'artikla', 'artikala')}` : ''}</span>
          </p>
          {cart.length === 0 ? (
            <div className="mt-4 border-t pt-4" style={{ borderColor: COLORS.what }}>
              <p className="copy">Spisak je prazan. Dodajte artikle ili gotov komplet, ili opišite šta vam treba.</p>
              <ShopLink href="/#kompleti" className="lbl link-u mt-4 inline-block" style={{ color: COLORS.what }}>
                Gotovi kompleti →
              </ShopLink>
            </div>
          ) : (
            <>
              <ul className="mt-4 border-t" style={{ borderColor: COLORS.what }}>
                {cart.map((l) => {
                  const p = productById(l.id)
                  if (!p) return null
                  return (
                    <li key={l.id} className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-3">
                      <span className="copy">
                        <span className="tabular-nums" style={muted}>
                          {formatNumber(l.qty)} {p.unit}
                        </span>{' '}
                        · {p.name}
                      </span>
                      <span className="copy shrink-0 tabular-nums">{formatPrice(p.price * l.qty)}</span>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-5 flex items-baseline justify-between gap-4">
                <span className="lbl" style={muted}>
                  Orijentaciono, sa PDV-om
                </span>
                <span className="copy-l tabular-nums">{formatPrice(subtotal)}</span>
              </p>
              <button type="button" className="lbl link-u mt-4 cursor-pointer" style={{ color: COLORS.what }} onClick={() => openPanel({ kind: 'cart' })}>
                Uredi korpu →
              </button>
            </>
          )}
        </aside>
      </div>
    </Section>
  )
}
