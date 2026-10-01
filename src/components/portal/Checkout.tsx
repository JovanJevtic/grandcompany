'use client'

/* eslint-disable @next/next/no-img-element -- slike artikala iz /public */

import Link from 'next/link'
import { useState } from 'react'
import { openLogin, type FullPartner } from '@/lib/b2b'
import { cartLines, removeFromCart, setQty, useShop } from '@/lib/cart'
import { DELIVERY_ZONES, recommendCrane, tons, type DeliveryMethod } from '@/lib/logistics'
import { money, shotOf } from '@/lib/shop'
import { METHOD_LABEL, setPrefs, useDeliveryPrefs } from '@/components/b2b/prefs'
import { buildQuote } from '@/components/b2b/quote'
import Cta from '@/components/ui/Cta'
import { creditOf, placeOrder, usePortal, type PlacedOrder } from './store'
import { Arrow, Donut, Head, Stepper, Track, dateOf, field, go, idx, line } from './ui'

// Korpa i narudžba u tri koraka na jednoj strani: 01 stavke, 02 isporuka (gradilište, zona,
// kran / standard / preuzimanje, datum), 03 plaćanje (avans ili valuta 30/60/90 do nivoa
// partnera). Desno: obračun sa rabatom i simulacija kreditnog limita (koliko ostaje posle ove
// narudžbe). Ako bi narudžba prešla limit, odgođeno plaćanje se ne može izabrati.

const TERMS = [0, 30, 60, 90] as const

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className={`border-b ${line} py-8`}>
      <p className="flex items-baseline gap-4">
        <span className="num text-[13px] opacity-40">{idx(n)}</span>
        <span className="display text-[clamp(22px,2vw,32px)]">{title}</span>
      </p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: { id: T; label: string; disabled?: boolean; note?: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={String(o.id)}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            onClick={() => onChange(o.id)}
            className={`flex min-h-[64px] flex-col justify-between gap-1 border px-4 py-3 text-left text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${on ? 'border-cobalt bg-cobalt text-bg' : 'border-ink/25 hover:border-ink'}`}
          >
            <span className="font-semibold">{o.label}</span>
            {o.note && <span className="text-[9.5px] opacity-70">{o.note}</span>}
          </button>
        )
      })}
    </div>
  )
}

function Done({ order, partner }: { order: PlacedOrder; partner: FullPartner }) {
  return (
    <div className="px-5 pb-[14vh] pt-10 md:px-10">
      <section className={`grid border ${line} lg:grid-cols-[1.3fr_1fr]`}>
        <div className="bg-cobalt px-6 py-12 text-bg md:px-10">
          <p className="label">Narudžba je poslata · {dateOf(order.placedAt)}</p>
          <p className="display mt-6 text-[clamp(40px,6vw,104px)] !leading-[0.86]">{order.no}</p>
          <p className="mt-6 max-w-[46ch] text-[12px] leading-[1.65]">
            Narudžba je primljena. Potvrdu i termin isporuke šaljemo na {partner.email}.{' '}
            {order.delivery === 'kran' ? 'Kamion sa kranom istovara direktno na sprat.' : ''}
          </p>
        </div>
        <div className="flex flex-col justify-between gap-8 px-6 py-10 md:px-10">
          <div>
            <p className="label opacity-50">Ukupno</p>
            <p className="num mt-3 text-[clamp(34px,3.4vw,56px)] leading-none">{money(order.total)}</p>
            <p className="mt-2 text-[11px] opacity-60">{order.paymentDays ? `Valuta ${order.paymentDays} dana` : 'Avans — predračun je u prilogu'}</p>
          </div>
          <Track status="Potvrđena" />
          <div className="flex flex-wrap gap-3">
            <Cta solid onClick={() => go('nalog')}>
              Prati narudžbu
            </Cta>
            <Cta onClick={() => go('katalog')}>Nova narudžba</Cta>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function Checkout({ partner }: { partner: FullPartner | null }) {
  const { cart } = useShop()
  const s = usePortal()
  const prefs = useDeliveryPrefs()
  const discount = partner?.discount ?? 0
  const q = buildQuote(cart, discount, prefs)
  const lines = cartLines(cart)
  const [terms, setTerms] = useState<number>(partner?.paymentDays ?? 0)
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [done, setDone] = useState<PlacedOrder | null>(null)
  // najraniji datum isporuke: sutra (računa se jednom, ne pri svakom crtanju)
  const [minDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10))

  if (done && partner) return <Done order={done} partner={partner} />

  if (!lines.length)
    return (
      <div className="px-5 pb-[14vh] pt-10 md:px-10">
        <Head no="03 · Korpa" title="Korpa je prazna">
          Dodajte artikle iz kataloga.
        </Head>
        <div className="mt-8 flex flex-wrap gap-3">
          <Cta solid onClick={() => go('katalog')}>
            Katalog
          </Cta>
        </div>
      </div>
    )

  const credit = partner ? creditOf(partner, s) : null
  const crane = recommendCrane(q.kg)
  const after = credit ? credit.used + (terms > 0 ? q.total : 0) : 0
  const over = credit ? credit.used + q.total > credit.limit : false
  const effectiveTerms = over ? 0 : terms
  const site = partner?.sites.find((x) => x.id === prefs.siteId) ?? null

  const send = () => {
    if (!partner) return openLogin()
    const order = placeOrder({
      partnerId: partner.id,
      siteId: prefs.method === 'preuzimanje' ? '' : (prefs.siteId ?? partner.sites[0]?.id ?? ''),
      payment: effectiveTerms ? 'odgodjeno' : 'avans',
      paymentDays: effectiveTerms,
      delivery: prefs.method === 'kran' ? 'kran' : 'standard',
      deliveryCost: q.delivery,
      items: lines.map((l) => [l.key, l.qty]),
      total: q.total,
      date,
      note,
    })
    lines.forEach((l) => removeFromCart(l.key))
    setDone(order)
    window.__gcLenis?.scrollTo(0, { immediate: true })
  }

  return (
    <div className="px-5 pb-[14vh] pt-10 md:px-10">
      <Head no="03 · Korpa i narudžba" title="Narudžba">
        Rabat se računa u realnom vremenu, a desno vidite koliko kreditnog limita ostaje posle ove narudžbe.
      </Head>

      <div className="grid gap-x-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Step n={0} title="Stavke">
            <ul>
              {q.lines.map((l, i) => {
                const src = lines[i]
                return (
                  <li key={l.sku} className={`grid grid-cols-[52px_1fr_auto] items-center gap-4 border-t ${line} py-4 first:border-t-0`}>
                    <img decoding="async" src={src?.image ?? shotOf(l.sku)} alt="" className="aspect-square w-full border border-ink/10 bg-white object-cover" />
                    <div className="min-w-0">
                      <p className="text-[10px] tabular-nums opacity-55">{l.sku}</p>
                      <p className="truncate text-[12px] font-semibold">{l.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-4">
                        <Stepper value={l.qty} step={src?.step ?? 1} unit={l.unit} onChange={(v) => setQty(l.sku, v)} />
                        <button type="button" onClick={() => removeFromCart(l.sku)} className="ulink text-[10px] opacity-60">
                          Ukloni
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      {discount > 0 && <p className="text-[10px] tabular-nums opacity-40 line-through">{money(l.price * l.qty)}</p>}
                      <p className="num text-[17px] tabular-nums">{money(l.total)}</p>
                      <p className="text-[9.5px] opacity-50">
                        {money(l.unitNet)} / {l.unit}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Step>

          <Step n={1} title="Isporuka">
            <Seg<DeliveryMethod>
              label="Način isporuke"
              value={prefs.method}
              onChange={(m) => setPrefs({ method: m })}
              options={[
                { id: 'kran', label: METHOD_LABEL.kran, note: crane ? `Preporuka za ${tons(q.kg)} t` : 'Istovar direktno na sprat' },
                { id: 'standard', label: METHOD_LABEL.standard, note: 'Istovar na tlo' },
                { id: 'preuzimanje', label: 'Preuzimanje', note: 'Nenada Kostića 151' },
              ]}
            />
            {prefs.method !== 'preuzimanje' && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {partner && (
                  <label className="flex flex-col gap-2 text-[10.5px]">
                    <span className="opacity-60">Gradilište</span>
                    <select value={prefs.siteId ?? partner.sites[0]?.id ?? ''} onChange={(e) => setPrefs({ siteId: e.target.value })} className={field}>
                      {partner.sites.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name} — {x.address}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="flex flex-col gap-2 text-[10.5px]">
                  <span className="opacity-60">Zona dostave</span>
                  <select value={prefs.zoneId} onChange={(e) => setPrefs({ zoneId: e.target.value })} className={field}>
                    {DELIVERY_ZONES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-[10.5px]">
                  <span className="opacity-60">Željeni datum isporuke</span>
                  <input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className={field} />
                </label>
                <div className="flex flex-col justify-end gap-1 text-[10.5px]">
                  <span className="opacity-60">Teret</span>
                  <span className="num text-[22px]">{tons(q.kg)} t</span>
                  <span className="opacity-60">{crane ? 'Preko 1 t — preporuka kamion sa kranom' : 'Do 1 t'}</span>
                </div>
              </div>
            )}
            {site && prefs.method === 'kran' && <p className="mt-4 text-[10.5px] opacity-60">Napomena gradilišta: {site.note}</p>}
          </Step>

          <Step n={2} title="Plaćanje">
            {partner ? (
              <>
                <Seg<number>
                  label="Plaćanje"
                  value={effectiveTerms}
                  onChange={setTerms}
                  options={TERMS.map((t) => ({
                    id: t,
                    label: t ? `Valuta ${t} dana` : 'Avans / predračun',
                    disabled: t > partner.paymentDays || (t > 0 && over),
                    note: t === 0 ? 'Plaćanje prije isporuke' : t > partner.paymentDays ? `Vaš nivo: do ${partner.paymentDays} dana` : over ? 'Prelazi kreditni limit' : 'Odgođeno, na kredit',
                  }))}
                />
                {over && <p className="mt-4 border-l-2 border-cobalt pl-3 text-[11px] text-cobalt">Narudžba prelazi raspoloživ kreditni limit — moguć je avans, ili zatražite povećanje limita.</p>}
              </>
            ) : (
              <p className="text-[11.5px] opacity-70">Odgođeno plaćanje i kreditni limit vidite nakon prijave. Bez naloga narudžba ide uz predračun (avans).</p>
            )}
            <label className="mt-5 flex flex-col gap-2 text-[10.5px]">
              <span className="opacity-60">Napomena za skladište / vozača</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={`${field} h-auto py-2`} />
            </label>
          </Step>
        </div>

        {/* Obračun */}
        <aside className="lg:sticky lg:top-[calc(var(--nav-h)+var(--nav-inset)+72px)] lg:self-start">
          <div className="mt-8 border border-ink">
            <div className="bg-ink px-5 py-3 text-[10.5px] text-bg">
              Obračun{discount > 0 ? ` · rabat ${Math.round(discount * 100)}%` : ''}
            </div>
            <dl className="grid gap-3 px-5 py-5 text-[11.5px]">
              {(
                [
                  ['Maloprodajna vrijednost', money(q.retail)],
                  discount > 0 ? ['Ušteda od rabata', `− ${money(q.savings)}`] : null,
                  ['Roba', money(q.goods)],
                  [prefs.method === 'preuzimanje' ? 'Preuzimanje' : `Dostava · ${q.zone.label.split(',')[0]}`, q.delivery ? money(q.delivery) : 'Gratis'],
                  ['Osnovica', money(q.base)],
                  ['PDV 17%', money(q.vat)],
                ].filter(Boolean) as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="opacity-60">{k}</dt>
                  <dd className="tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <div className={`flex items-end justify-between border-t ${line} px-5 py-5`}>
              <span className="text-[10.5px] opacity-60">Ukupno</span>
              <span className="num text-[clamp(30px,3vw,44px)] leading-none">{money(q.total)}</span>
            </div>

            {credit && (
              <div className={`flex items-center gap-5 border-t ${line} px-5 py-5`}>
                <div className="relative grid place-items-center">
                  <Donut ratio={credit.ratio} extra={effectiveTerms > 0 ? q.total / credit.limit : 0} size="size-[110px]" />
                  <span className="num absolute text-[18px]">{Math.round(Math.min(1, after / credit.limit) * 100)}%</span>
                </div>
                <div className="text-[10.5px] leading-[1.7]">
                  <p className="opacity-60">Kreditni limit {money(credit.limit)}</p>
                  <p>
                    Iskorišteno {money(credit.used)}
                    {effectiveTerms > 0 && <span className="text-cobalt"> + {money(q.total)}</span>}
                  </p>
                  <p className="font-semibold">Ostaje {money(Math.max(0, credit.limit - after))}</p>
                </div>
              </div>
            )}

            <div className={`grid gap-3 border-t ${line} p-5`}>
              <button type="button" onClick={send} className="flex h-12 items-center justify-between bg-cobalt px-5 text-[11px] text-bg transition-colors hover:bg-ink">
                {partner ? 'Pošalji narudžbu' : 'Prijava za narudžbu'} <Arrow />
              </button>
              <Link href="/portal/predracun" className="flex h-11 items-center justify-between border border-ink px-5 text-[11px] transition-colors hover:bg-ink hover:text-bg">
                Predračun za štampu <Arrow />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
