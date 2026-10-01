'use client'

/* eslint-disable @next/next/no-img-element -- slike artikala iz /public */

import { useState } from 'react'
import { COMPANY, VAT_RATE } from '@/gc/gc'
import { logout, openLogin, type FullPartner, type PartnerInvoice } from '@/lib/b2b'
import { addToCart } from '@/lib/cart'
import { money, resolveLine, shotOf } from '@/lib/shop'
import { dateAgo } from '@/components/b2b/quote'
import { setPrefs } from '@/components/b2b/prefs'
import Cta from '@/components/ui/Cta'
import { creditOf, ordersOf, usePortal } from './store'
import { Arrow, Donut, Head, Pill, Track, dateOf, go, idx, line } from './ui'

// Moj nalog: narudžbe sa praćenjem (status postavlja tim u internom dijelu), kreditni limit,
// fakture (preuzimanje za štampu) i gradilišta. Svi podaci su demo (Pantheon ERP).

type Tab = 'narudzbe' | 'kredit' | 'fakture' | 'gradilista'
const TABS: [Tab, string][] = [
  ['narudzbe', 'Narudžbe'],
  ['kredit', 'Kredit'],
  ['fakture', 'Fakture'],
  ['gradilista', 'Gradilišta'],
]

const invoiceStatus = (inv: PartnerInvoice, days: number) => {
  const due = days - inv.issuedDaysAgo
  return inv.paid ? 'Plaćena' : due < 0 ? 'Dospjela' : 'Otvorena'
}

/** Faktura za štampu: jednostavan HTML dokument koji se preuzme i otvori u pregledaču. */
function downloadInvoice(inv: PartnerInvoice, p: FullPartner) {
  const base = inv.amount / (1 + VAT_RATE)
  const html = `<!doctype html><meta charset="utf-8"><title>${inv.no}</title>
<style>body{font:14px/1.6 Arial,sans-serif;max-width:720px;margin:48px auto;color:#1b2436}h1{font-size:28px;margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:24px}td{padding:8px 0;border-bottom:1px solid #ddd}td:last-child{text-align:right}.t{font-size:22px;font-weight:700}</style>
<p>${COMPANY.name}<br>${COMPANY.address}<br>JIB ${COMPANY.jib} · PIB ${COMPANY.pib}</p>
<h1>Faktura ${inv.no}</h1><p>Kupac: ${p.name}<br>Izdata: ${dateAgo(inv.issuedDaysAgo)} · Valuta ${p.paymentDays} dana · Dospijeće ${dateAgo(inv.issuedDaysAgo - p.paymentDays)}</p>
<table><tr><td>Osnovica</td><td>${money(base)}</td></tr><tr><td>PDV ${Math.round(VAT_RATE * 100)}%</td><td>${money(inv.amount - base)}</td></tr><tr><td class="t">Ukupno</td><td class="t">${money(inv.amount)}</td></tr></table>
<p style="margin-top:32px;font-size:12px;color:#666">Demo dokument iz B2B portala.</p>`
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `${inv.no}.html` })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Orders({ partner }: { partner: FullPartner }) {
  const s = usePortal()
  const orders = ordersOf(partner, s)
  const repeat = (items: [string, number][]) => {
    items.forEach(([sku, q]) => addToCart(sku, q))
    go('korpa')
  }
  return (
    <div>
      {orders.map((o) => {
        const site = partner.sites.find((x) => x.id === o.siteId)
        return (
          <article key={o.no} className={`grid gap-6 border-b ${line} py-8 lg:grid-cols-[1.1fr_1.3fr_1fr]`}>
            <div>
              <p className="label opacity-50">
                {o.fresh ? dateOf(o.placedAt) : dateAgo(o.daysAgo)}
                {o.fresh && <span className="ml-3 text-cobalt">Iz portala</span>}
              </p>
              <p className="display mt-2 text-[clamp(24px,2.2vw,36px)]">{o.no}</p>
              <p className="mt-2 text-[11px] opacity-70">
                {site?.name ?? 'Preuzimanje na stovarištu'}
                {o.date ? ` · željeni datum ${o.date.split('-').reverse().join('.')}.` : ''}
              </p>
              <div className="mt-6">
                <Track status={o.status} />
              </div>
            </div>
            <ul className="flex flex-wrap content-start gap-2">
              {o.items.map(([sku, q]) => {
                const l = resolveLine(sku)
                return (
                  <li key={sku} className={`flex w-[156px] items-center gap-2 border ${line} p-1.5 pr-2`}>
                    <img decoding="async" src={l?.image ?? shotOf(sku)} alt="" className="size-10 shrink-0 object-cover" />
                    <span className="text-[9.5px] leading-[1.3]">
                      <span className="block font-semibold">{sku}</span>
                      <span className="opacity-60">
                        {q.toLocaleString('de-DE')} {l?.unit}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="flex flex-col justify-between gap-4 lg:items-end lg:text-right">
              <div>
                <p className="num text-[clamp(28px,2.6vw,44px)] leading-none">{money(o.total)}</p>
                <p className="mt-2 text-[10.5px] opacity-70">
                  {o.delivery === 'kran' ? 'Kamion sa kranom' : 'Standardna dostava'} · {o.deliveryCost ? money(o.deliveryCost) : 'gratis'}
                </p>
                <p className="text-[10.5px] opacity-70">{o.paymentDays ? `Valuta ${o.paymentDays} dana` : 'Avans'}</p>
              </div>
              <button type="button" onClick={() => repeat(o.items)} className="flex items-center gap-3 border border-ink px-4 py-2.5 text-[10.5px] transition-colors hover:bg-ink hover:text-bg">
                Ponovi narudžbu <Arrow />
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function Credit({ partner }: { partner: FullPartner }) {
  const s = usePortal()
  const c = creditOf(partner, s)
  const due = partner.invoices
    .filter((i) => !i.paid)
    .map((i) => ({ ...i, left: partner.paymentDays - i.issuedDaysAgo }))
    .sort((a, b) => a.left - b.left)
  return (
    <div className={`grid border-b ${line} lg:grid-cols-[1fr_1.4fr]`}>
      <div className={`flex flex-col items-center justify-center gap-6 border-b ${line} py-10 lg:border-b-0 lg:border-r`}>
        <div className="relative grid place-items-center">
          <Donut ratio={c.ratio} size="size-[220px]" />
          <div className="absolute text-center">
            <p className="num text-[48px] leading-none">{Math.round(c.ratio * 100)}%</p>
            <p className="text-[10px] opacity-60">iskorišteno</p>
          </div>
        </div>
        <p className="text-[11px] opacity-70">
          Valuta {partner.paymentDays} dana · menica / garancija
        </p>
      </div>
      <div className="py-6 lg:pl-10">
        <dl className="grid grid-cols-2 gap-px border border-ink/20 bg-ink/20">
          {[
            ['Kreditni limit', money(c.limit)],
            ['Raspoloživo', money(c.available)],
            ['Otvorene fakture', money(c.invoices)],
            ['Narudžbe na kredit (nefakturisano)', money(c.pending)],
          ].map(([k, v], i) => (
            <div key={k} className={`px-5 py-6 ${i === 1 ? 'bg-cobalt text-bg' : 'bg-bg'}`}>
              <dt className="text-[10px] opacity-60">{k}</dt>
              <dd className="num mt-3 text-[clamp(22px,2vw,32px)] leading-none">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="label mt-10 opacity-50">Dospijeća</p>
        <ul className="mt-3">
          {due.length ? (
            due.map((d) => (
              <li key={d.no} className={`flex items-center justify-between gap-4 border-b ${line} py-3 text-[11px]`}>
                <span>{d.no}</span>
                <span className="tabular-nums">{money(d.amount)}</span>
                <Pill tone={d.left < 0 ? 'ink' : d.left < 10 ? 'warn' : 'line'}>{d.left < 0 ? `${-d.left} dana kasni` : `za ${d.left} dana`}</Pill>
              </li>
            ))
          ) : (
            <li className="py-3 text-[11px] opacity-60">Nema otvorenih dospijeća.</li>
          )}
        </ul>
        <button type="button" onClick={() => go('kontakt')} className="ulink mt-6 inline-flex items-center gap-2 text-[11px]">
          Zatraži povećanje limita <Arrow />
        </button>
      </div>
    </div>
  )
}

function Invoices({ partner }: { partner: FullPartner }) {
  const [only, setOnly] = useState(false)
  const list = partner.invoices.filter((i) => !only || !i.paid)
  return (
    <div>
      <label className="mb-4 flex w-fit cursor-pointer items-center gap-3 text-[11px]">
        <input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} className="size-4 accent-[var(--cobalt)]" />
        Samo neplaćene
      </label>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-[11.5px]">
          <thead>
            <tr className={`border-b-2 border-ink text-[10px] opacity-60`}>
              <th className="py-3 font-medium">Broj</th>
              <th className="py-3 font-medium">Izdata</th>
              <th className="py-3 font-medium">Dospijeće</th>
              <th className="py-3 text-right font-medium">Iznos</th>
              <th className="py-3 pl-6 font-medium">Status</th>
              <th className="py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((inv) => {
              const st = invoiceStatus(inv, partner.paymentDays)
              return (
                <tr key={inv.no} className={`border-b ${line}`}>
                  <td className="py-4 font-semibold">{inv.no}</td>
                  <td className="py-4 tabular-nums">{dateAgo(inv.issuedDaysAgo)}</td>
                  <td className="py-4 tabular-nums">{dateAgo(inv.issuedDaysAgo - partner.paymentDays)}</td>
                  <td className="num py-4 text-right text-[15px] tabular-nums">{money(inv.amount)}</td>
                  <td className="py-4 pl-6">
                    <Pill tone={st === 'Plaćena' ? 'line' : st === 'Dospjela' ? 'ink' : 'cobalt'}>{st}</Pill>
                  </td>
                  <td className="py-4 text-right">
                    <button type="button" onClick={() => downloadInvoice(inv, partner)} className="ulink inline-flex items-center gap-2 text-[10.5px]">
                      Preuzmi <Arrow className="size-3" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Sites({ partner }: { partner: FullPartner }) {
  return (
    <div className={`grid border-l border-t ${line} md:grid-cols-2`}>
      {partner.sites.map((x, i) => (
        <article key={x.id} className={`flex flex-col gap-6 border-b border-r ${line} p-6 md:p-8`}>
          <span className="num text-[44px] leading-none opacity-20">{idx(i)}</span>
          <div>
            <h3 className="display text-[clamp(24px,2.2vw,36px)]">{x.name}</h3>
            <p className="mt-3 text-[11px] leading-[1.6] opacity-80">{x.address}</p>
            <p className="text-[11px] leading-[1.6] opacity-60">{x.note}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setPrefs({ siteId: x.id, method: 'kran' })
              go('korpa')
            }}
            className="mt-auto flex items-center justify-between border border-ink px-4 py-3 text-[10.5px] transition-colors hover:bg-cobalt hover:text-bg"
          >
            Isporuči korpu ovdje (kran) <Arrow />
          </button>
        </article>
      ))}
    </div>
  )
}

export default function Account({ partner }: { partner: FullPartner | null }) {
  const [tab, setTab] = useState<Tab>('narudzbe')
  if (!partner)
    return (
      <div className="px-5 pb-[14vh] pt-10 md:px-10">
        <Head no="04 · Moj nalog" title="Prijavite se">
          Narudžbe, kreditni limit i fakture vidljivi su nakon prijave B2B naloga.
        </Head>
        <div className="mt-8 flex flex-wrap gap-3">
          <Cta solid onClick={openLogin}>
            Prijava
          </Cta>
          <Cta onClick={() => go('pregled')}>Registracija</Cta>
        </div>
      </div>
    )
  return (
    <div className="px-5 pb-[14vh] pt-10 md:px-10">
      <Head
        no="04 · Moj nalog"
        title={partner.name.replace(/„|"/g, '')}
        aside={
          <button type="button" onClick={logout} className="ulink text-[11px] opacity-70">
            Odjava
          </button>
        }
      >
        {partner.tier} · {partner.email}
      </Head>
      <div className="mt-6 flex flex-wrap gap-2" role="tablist">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`border px-5 py-2.5 text-[11px] transition-colors ${tab === id ? 'border-ink bg-ink text-bg' : 'border-ink/25 hover:border-ink'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'narudzbe' && <Orders partner={partner} />}
        {tab === 'kredit' && <Credit partner={partner} />}
        {tab === 'fakture' && <Invoices partner={partner} />}
        {tab === 'gradilista' && <Sites partner={partner} />}
      </div>
    </div>
  )
}
