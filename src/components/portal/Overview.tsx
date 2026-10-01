'use client'

/* eslint-disable @next/next/no-img-element -- fotografije iz /public, već u WebP */

import { useRef, useState } from 'react'
import { PARTNER_TIERS, PRODUCTS } from '@/gc/gc'
import { openLogin, type FullPartner } from '@/lib/b2b'
import { addToCart } from '@/lib/cart'
import { useMediaMotion } from '@/lib/media'
import { money } from '@/lib/shop'
import StepBand from '@/components/ui/StepBand'
import Cta from '@/components/ui/Cta'
import { addRequest, creditOf, enterAdmin, ordersOf, usePortal } from './store'
import { Arrow, Dial, Track, dateOf, field, go, idx, line, type View } from './ui'

// Pregled. Gost: ulaz u portal (kran transport + Pantheon), tok Katalog → Kalkulator → Korpa →
// Narudžba, zašto Grand Company, rabatna skala i zahtjev za B2B nalog. Partner: rabat, kredit,
// aktivna narudžba sa praćenjem i brze radnje.

const FLOW: [View, string, string][] = [
  ['katalog', 'Katalog', 'Artikli sa stanjem iz Pantheona i vašom cijenom'],
  ['kalkulator', 'W111 kalkulator', 'Površina zida → kompletan spisak materijala'],
  ['korpa', 'Korpa', 'Rabat i kreditni limit u realnom vremenu'],
  ['korpa', 'Narudžba', 'Dostava kamionom sa kranom, valuta 30/60/90'],
]

function Flow() {
  return (
    <section className={`grid border-b ${line} sm:grid-cols-2 lg:grid-cols-4`}>
      {FLOW.map(([v, t, d], i) => (
        <button
          key={t}
          type="button"
          onClick={() => go(v)}
          className={`group flex min-h-[190px] flex-col justify-between gap-8 border-b ${line} px-5 py-6 text-left transition-colors hover:bg-cobalt hover:text-bg sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0 md:px-8`}
        >
          <span className="flex w-full items-start justify-between">
            <span className="num text-[44px] leading-none opacity-20 group-hover:opacity-60">{idx(i)}</span>
            <Arrow />
          </span>
          <span>
            <span className="display block text-[clamp(24px,2.2vw,36px)]">{t}</span>
            <span className="mt-2 block max-w-[30ch] text-[11px] leading-[1.55] opacity-65 group-hover:opacity-90">{d}</span>
          </span>
        </button>
      ))}
    </section>
  )
}

function Register() {
  const [sent, setSent] = useState<string | null>(null)
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const company = String(f.get('firma') || '').trim()
    addRequest({ kind: 'registracija', from: company, detail: `${f.get('kontakt')} · ${f.get('email')} · ${f.get('obim')}` })
    setSent(company || 'Vaša firma')
  }
  return (
    <section id="registracija" className={`grid scroll-mt-40 border-b ${line} lg:grid-cols-[1fr_1.3fr]`}>
      <div className={`flex flex-col justify-between gap-10 border-b ${line} px-5 py-10 lg:border-b-0 lg:border-r md:px-10`}>
        <div>
          <p className="label opacity-50">Registracija</p>
          <h2 className="display mt-4 text-[clamp(36px,4.4vw,76px)] !leading-[0.88]">Otvorite B2B nalog</h2>
          <p className="mt-5 max-w-[44ch] text-[11.5px] leading-[1.65] opacity-70">
            Za građevinske firme, izvođače i zanatlije. Nivo rabata i kreditni limit dodjeljujemo prema obimu nabavke; nalog se otvara u
            Pantheon ERP-u i odmah vidite svoje cijene.
          </p>
        </div>
        <ol className="grid gap-3 text-[11px]">
          {['Pošaljete zahtjev', 'Javljamo se u roku od 24 h', 'Potpisujemo ugovor (menica ili garancija)', 'Prijava i prva narudžba'].map((s, i) => (
            <li key={s} className={`flex items-baseline gap-4 border-t ${line} pt-3`}>
              <span className="num text-[13px] opacity-40">{idx(i)}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
      <div className="px-5 py-10 md:px-10">
        {sent ? (
          <div className="flex h-full flex-col justify-center gap-5">
            <p className="label text-cobalt">Zahtjev je primljen</p>
            <p className="display text-[clamp(28px,3vw,48px)]">{sent}</p>
            <p className="max-w-[44ch] text-[11.5px] leading-[1.65] opacity-70">
              Komercijalista vas kontaktira u roku od 24 h radnim danima. Do tada možete pregledati katalog i W111 kalkulator.
            </p>
            <div className="flex flex-wrap gap-3">
              <Cta onClick={() => go('katalog')}>Katalog</Cta>
              <Cta onClick={() => setSent(null)}>Novi zahtjev</Cta>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            {[
              ['firma', 'Naziv firme', 'text', true],
              ['jib', 'JIB', 'text', true],
              ['kontakt', 'Kontakt osoba', 'text', true],
              ['telefon', 'Telefon', 'tel', true],
              ['email', 'E-mail', 'email', true],
            ].map(([n, l, t, r]) => (
              <label key={n as string} className={`flex flex-col gap-2 text-[10.5px] ${n === 'email' ? 'sm:col-span-2' : ''}`}>
                <span className="opacity-60">{l}</span>
                <input name={n as string} type={t as string} required={r as boolean} className={field} />
              </label>
            ))}
            <label className="flex flex-col gap-2 text-[10.5px] sm:col-span-2">
              <span className="opacity-60">Procijenjena mjesečna nabavka</span>
              <select name="obim" className={field} defaultValue="5–15.000 KM">
                <option>do 5.000 KM</option>
                <option>5–15.000 KM</option>
                <option>15–50.000 KM</option>
                <option>preko 50.000 KM</option>
              </select>
            </label>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 sm:col-span-2">
              <p className="text-[10px] opacity-55">Demo: zahtjev se čuva samo u ovom pregledaču.</p>
              <Cta solid type="submit">
                Pošalji zahtjev
              </Cta>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

function Guest() {
  const root = useRef<HTMLDivElement>(null)
  useMediaMotion(root)
  const units = PRODUCTS.reduce((s, p) => s + p.stock, 0)
  return (
    <div ref={root}>
      <section className={`grid border-b ${line} md:grid-cols-[1.25fr_1fr]`}>
        <div className={`flex flex-col justify-between gap-12 bg-cobalt px-5 pb-10 pt-[9vh] text-bg md:border-r ${line} md:px-10`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="label">B2B portal · Grand Company</p>
            <p className="flex items-center gap-2 border border-bg/40 px-3 py-1.5 text-[10px]">
              <span className="size-1.5 animate-pulse rounded-full bg-bg" />
              Pantheon ERP · {PRODUCTS.length} artikala · {units.toLocaleString('de-DE')} jed. na stanju
            </p>
          </div>
          <h1 className="display text-[clamp(52px,8vw,150px)] !leading-[0.84]">
            Portal za
            <br />
            izvođače
          </h1>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-[42ch] text-[12.5px] leading-[1.65]">
              Katalog sa vašim rabatom, W111 kalkulator materijala, narudžba sa dostavom kamionom sa kranom direktno na sprat i odgođeno
              plaćanje — sve iz jednog naloga.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={openLogin} className="cta">
                <span className="cta-roll">
                  <span>Prijava</span>
                  <span aria-hidden>Prijava</span>
                </span>
                <svg className="cta-arrow" viewBox="0 0 16 16" aria-hidden>
                  <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
              <a href="#registracija" className="cta border border-bg/60 !bg-transparent !text-bg">
                <span className="cta-roll">
                  <span>Registracija</span>
                  <span aria-hidden>Registracija</span>
                </span>
              </a>
            </div>
          </div>
        </div>
        <figure data-curtain data-parallax="6" className="relative min-h-[48vh] overflow-hidden bg-ink">
          <img src="/shop2/brand.webp" alt="Kamion sa kranom istovara paletu gips ploča na sprat" className="absolute inset-0 h-full w-full object-cover" />
          <figcaption className="absolute bottom-0 left-0 bg-bg px-4 py-2 text-[11px]">Istovar paleta na etaže — vlastiti kamioni sa kranom</figcaption>
        </figure>
      </section>

      <Flow />

      <section className={`grid border-b ${line} sm:grid-cols-2 lg:grid-cols-4`}>
        {[
          ['Do 22%', 'Rabat', 'Ugovoreni rabat po nivou partnera, vidljiv na svakom artiklu čim se prijavite.'],
          ['90 dana', 'Kredit', 'Kreditni limit i odgođeno plaćanje 30, 60 ili 90 dana uz menicu ili bankarsku garanciju.'],
          ['Kran', 'Dostava', 'Kamioni sa hidrauličnom dizalicom istovaraju palete direktno na spratove gradilišta.'],
          ['Live', 'Zalihe', 'Stanje na skladištu Nenada Kostića 151 u realnom vremenu, iz Pantheon ERP-a.'],
        ].map(([big, t, d], i) => (
          <div key={t} className={`border-b ${line} px-5 py-8 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0 md:px-8`}>
            <span className="label opacity-50">
              {idx(i)} · {t}
            </span>
            <p className="display mt-6 text-[clamp(34px,3.4vw,56px)]">{big}</p>
            <p className="mt-4 max-w-[34ch] text-[11.5px] leading-[1.6] opacity-70">{d}</p>
          </div>
        ))}
      </section>

      <StepBand tone="navy" profile="diag" steps={12} aria-label="Rabatna skala">
        <div className="px-5 py-[10vh] md:px-10">
          <h2 className="display text-[clamp(40px,5.4vw,96px)]">Rabatna skala</h2>
          <div className="mt-10 border-t border-bg/40">
            {PARTNER_TIERS.map((t) => (
              <div key={t.name} className="grid grid-cols-2 gap-x-6 gap-y-1 border-b border-bg/40 py-5 md:grid-cols-[1fr_1.6fr_.7fr_1.2fr_1.2fr] md:items-baseline">
                <span className="display text-[24px]">{t.name}</span>
                <span className="text-[11.5px] opacity-80">{t.who}</span>
                <span className="num text-[30px]">{t.rebate}</span>
                <span className="text-[11.5px] opacity-80">{t.limit}</span>
                <span className="text-[11.5px] opacity-80">{t.days}</span>
              </div>
            ))}
          </div>
        </div>
      </StepBand>

      <Register />

      <div className="flex justify-end px-5 py-6 md:px-10">
        <button type="button" onClick={() => { enterAdmin(); go('interno') }} className="ulink text-[10.5px] opacity-60 hover:opacity-100">
          Interni pristup — tim Grand Company
        </button>
      </div>
    </div>
  )
}

function Partner({ partner }: { partner: FullPartner }) {
  const s = usePortal()
  const credit = creditOf(partner, s)
  const orders = ordersOf(partner, s)
  const active = orders.filter((o) => o.status !== 'Isporučena')
  const current = active[0] ?? orders[0]
  const unpaid = partner.invoices.filter((i) => !i.paid)
  const last = orders[0]
  const repeat = () => last?.items.forEach(([sku, q]) => addToCart(sku, q))
  const [tierName, ...tierRest] = partner.tier.split(',')

  return (
    <div>
      <section className={`grid border-b ${line} sm:grid-cols-2 xl:grid-cols-4`}>
        <div className="bg-cobalt px-5 py-8 text-bg md:px-8">
          <p className="label">Ugovoreni rabat · {tierName}</p>
          <p className="num mt-6 text-[clamp(72px,8vw,140px)] leading-[0.85]">{Math.round(partner.discount * 100)}%</p>
          <p className="mt-4 text-[11px] opacity-80">{tierRest.join(',').trim()}</p>
        </div>
        <div className={`border-b ${line} px-5 py-8 sm:border-b-0 sm:border-r md:px-8`}>
          <p className="label opacity-50">Raspoloživ kredit</p>
          <p className="num mt-6 text-[clamp(30px,2.6vw,44px)] leading-none">{money(credit.available)}</p>
          <div className="mt-5 h-3 border border-ink">
            <div className="h-full bg-cobalt" style={{ width: `${Math.round(credit.ratio * 100)}%` }} />
          </div>
          <p className="mt-3 flex justify-between text-[10.5px] opacity-60">
            <span>Iskorišteno {money(credit.used)}</span>
            <span>Limit {money(credit.limit)}</span>
          </p>
        </div>
        <button type="button" onClick={() => go('nalog')} className={`border-t ${line} px-5 py-8 text-left transition-colors hover:bg-ink hover:text-bg sm:border-r xl:border-t-0 md:px-8`}>
          <p className="label opacity-50">Otvorene fakture</p>
          <p className="num mt-6 text-[clamp(72px,8vw,140px)] leading-[0.85]">{unpaid.length}</p>
          <p className="mt-4 text-[11px] opacity-60">ukupno {money(unpaid.reduce((t, i) => t + i.amount, 0))}</p>
        </button>
        <div className={`flex items-center justify-center border-t ${line} px-5 py-6 xl:border-t-0`}>
          <Dial value={String(active.length).padStart(2, '0')} label="aktivne narudžbe" size="size-[170px]" />
        </div>
      </section>

      <section className={`grid border-b ${line} lg:grid-cols-[1.3fr_1fr]`}>
        <div className={`px-5 py-10 lg:border-r ${line} md:px-10`}>
          <p className="label opacity-50">Praćenje · {current ? (current.fresh ? dateOf(current.placedAt) : `prije ${current.daysAgo} dana`) : '—'}</p>
          {current ? (
            <>
              <p className="display mt-4 text-[clamp(28px,3vw,52px)]">{current.no}</p>
              <p className="mt-2 text-[11px] opacity-70">
                {partner.sites.find((x) => x.id === current.siteId)?.name ?? 'Preuzimanje'} · {current.delivery === 'kran' ? 'kamion sa kranom' : 'standardna dostava'} ·{' '}
                {money(current.total)}
              </p>
              <div className="mt-8 max-w-[560px]">
                <Track status={current.status} />
              </div>
              <button type="button" onClick={() => go('nalog')} className="ulink mt-8 inline-flex items-center gap-2 text-[11px]">
                Sve narudžbe <Arrow />
              </button>
            </>
          ) : (
            <p className="mt-4 text-[12px] opacity-60">Još nema narudžbi.</p>
          )}
        </div>
        <div className="grid grid-cols-2">
          {(
            [
              ['Nova narudžba', 'Katalog', () => go('katalog')],
              ['Utrošak zida', 'W111', () => go('kalkulator')],
              ['Zadnja narudžba', 'Ponovi', () => { repeat(); go('korpa') }],
              ['Posebni uslovi', 'Kontakt', () => go('kontakt')],
            ] as [string, string, () => void][]
          ).map(([k, t, fn], i) => (
            <button
              key={k}
              type="button"
              onClick={fn}
              className={`group flex min-h-[150px] flex-col justify-between gap-6 border-b ${line} px-5 py-6 text-left transition-colors hover:bg-cobalt hover:text-bg ${i % 2 === 0 ? `border-r ${line}` : ''} md:px-8`}
            >
              <span className="flex w-full items-start justify-between">
                <span className="label opacity-50 group-hover:opacity-80">{k}</span>
                <Arrow />
              </span>
              <span className="display text-[clamp(24px,2.2vw,36px)]">{t}</span>
            </button>
          ))}
        </div>
      </section>

      <Flow />
    </div>
  )
}

export default function Overview({ partner }: { partner: FullPartner | null }) {
  return partner ? <Partner partner={partner} /> : <Guest />
}
