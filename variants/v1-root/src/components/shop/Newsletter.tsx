'use client'

import { useState } from 'react'
import { COLORS } from '@/lib/content'
import { Section, SectionHead } from './parts'
import ShopLink from './ShopLink'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 06.8 — Prijava na obavijesti. Pristanak je odvojena, neoznačena kućica (ne unaprijed uključena).
// Prijava još nije povezana sa sistemom za slanje, pa se to jasno kaže umjesto da se glumi uspjeh.
export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL.test(email.trim())) return setError('Upišite ispravnu adresu e-pošte.')
    if (!agree) return setError('Potreban je vaš pristanak da bismo vam mogli slati obavijesti.')
    setError(null)
    setDone(true)
  }

  return (
    <Section id="prijava" color={COLORS.connect} className="!pb-[7vw]">
      <SectionHead no="006.8" side="Obavijesti" title="Prijava" />

      <div className="mt-[4vw] grid grid-cols-12 gap-x-6 gap-y-10 max-md:mt-8">
        <p data-reveal className="copy-l col-span-12 max-w-[20ch] md:col-span-5">
          Novi artikli i akcije, bez viška poruka.
        </p>

        <div data-reveal className="col-span-12 md:col-span-6 md:col-start-7">
          {done ? (
            <div role="status">
              <p className="copy-l text-ink">Prijava na obavijesti još nije aktivna.</p>
              <p className="copy mt-4 text-ink">Vaša adresa nije sačuvana. Javite nam se putem kontakta, a čim prijava proradi, ovdje će je biti moguće koristiti.</p>
              <button type="button" className="pill mt-8" onClick={() => setDone(false)}>
                Nazad
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label className="lbl block" htmlFor="nl-email">
                E-pošta
              </label>
              <input
                id="nl-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className="field text-ink"
                placeholder="ime@primjer.ba"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error && !EMAIL.test(email.trim())}
              />

              <label className="mt-6 flex cursor-pointer items-start gap-3 text-ink">
                <input
                  type="checkbox"
                  className="mt-[3px] size-4 shrink-0 accent-[var(--acc)]"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span className="copy">
                  Pristajem da mi {`GRAND COMPANY`} šalje obavijesti o ponudi. Odjava je moguća u svakom trenutku. Više u{' '}
                  <ShopLink href="/politika-privatnosti" className="link-u" target="_blank">
                    Politici privatnosti
                  </ShopLink>
                  .
                </span>
              </label>

              {error && (
                <p role="alert" className="lbl mt-5 text-ink">
                  {error}
                </p>
              )}

              <button type="submit" className="pill pill-solid mt-8">
                Prijavi me
              </button>
            </form>
          )}
        </div>
      </div>
    </Section>
  )
}
