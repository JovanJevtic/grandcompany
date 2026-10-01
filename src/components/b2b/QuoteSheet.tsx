'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { COMPANY, VAT_RATE } from '@/gc/gc'
import { useB2B } from '@/lib/b2b'
import { useShop } from '@/lib/cart'
import { money, qtyLabel } from '@/lib/shop'
import { tons } from '@/lib/logistics'
import Cta from '@/components/ui/Cta'
import { METHOD_LABEL, useDeliveryPrefs } from './prefs'
import { buildQuote, partnerSite } from './quote'

// Predračun (CPQ) iz trenutne korpe: zvanični izgled spreman za štampu i slanje investitoru.
// Broj i datum se postavljaju tek u browseru (da se server i klijent ne razlikuju).
export default function QuoteSheet() {
  const { cart } = useShop()
  const { partner, discount, mode } = useB2B()
  const prefs = useDeliveryPrefs()
  const q = buildQuote(cart, discount, prefs)
  const site = partnerSite(partner, prefs.siteId)
  const [meta, setMeta] = useState<{ no: string; date: string } | null>(null)

  useEffect(() => {
    const d = new Date()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- broj i datum postoje samo u browseru
    setMeta({
      no: `PR-${d.getFullYear()}-${String(d.getTime()).slice(-4)}`,
      date: `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`,
    })
  }, [])

  if (!q.lines.length)
    return (
      <div className="px-5 py-[20vh] text-center">
        <h1 className="display text-[clamp(36px,4.6vw,72px)]">Predračun</h1>
        <p className="mx-auto mt-6 max-w-[44ch] text-[12px] opacity-65">Korpa je prazna. Dodajte artikle iz kataloga ili kalkulatora, pa generišite predračun.</p>
        <div className="mt-8 flex justify-center">
          <Cta href="/prodavnica">Katalog</Cta>
        </div>
      </div>
    )

  const pct = Math.round(discount * 100)

  return (
    <div className="px-3 pb-[14vh] pt-[6vh] md:px-8">
      <div className="quote-actions mx-auto mb-6 flex max-w-[960px] flex-wrap items-center justify-between gap-4">
        <Link href="/portal" className="ulink text-[11px]">
          ← Portal
        </Link>
        <Cta solid onClick={() => window.print()}>
          Štampaj
        </Cta>
      </div>

      <article className="quote-sheet mx-auto max-w-[960px] rounded-[14px] border border-ink/15 bg-white p-6 text-ink md:p-12">
        <header className="flex flex-wrap items-start justify-between gap-8 border-b border-ink/20 pb-6">
          <div className="text-[10.5px] leading-[1.7]">
            <p className="font-pretty text-[18px]">{COMPANY.name}</p>
            <p>{COMPANY.address}</p>
            <p>
              Tel. {COMPANY.phoneLandline} · Mob. {COMPANY.phoneMobile}
            </p>
            <p className="normal-case">
              {COMPANY.emailSales} · {COMPANY.emailInfo}
            </p>
            <p>
              JIB {COMPANY.jib} · PIB {COMPANY.pib} · MBS {COMPANY.mbs}
            </p>
          </div>
          <div className="text-right">
            <p className="display text-[28px]">Predračun</p>
            <p className="mt-2 text-[11px] tabular-nums">{meta?.no ?? 'PR-…'}</p>
            <p className="text-[11px] tabular-nums opacity-70">{meta?.date ?? ''}</p>
          </div>
        </header>

        <section className="grid gap-6 border-b border-ink/20 py-6 text-[10.5px] leading-[1.7] md:grid-cols-2">
          <div>
            <p className="opacity-55">Kupac</p>
            <p className="mt-1 text-[12px]">{partner && mode === 'b2b' ? partner.name : 'Maloprodajni kupac'}</p>
            {partner && mode === 'b2b' && (
              <p>
                {partner.tier} · rabat {pct}% · valuta {partner.paymentDays} dana
              </p>
            )}
          </div>
          <div>
            <p className="opacity-55">Isporuka</p>
            <p className="mt-1 text-[12px]">{METHOD_LABEL[prefs.method]}</p>
            {prefs.method !== 'preuzimanje' && <p>{q.zone.label}</p>}
            {site && (
              <p>
                {site.name}, {site.address}
              </p>
            )}
            <p>Masa tereta {tons(q.kg)} t</p>
          </div>
        </section>

        <div className="overflow-x-auto" data-lenis-prevent>
          <table className="w-full min-w-[640px] border-collapse text-left text-[10.5px]">
            <thead>
              <tr className="border-b border-ink/25 opacity-60">
                <th className="py-3 pr-3 font-medium">Šifra</th>
                <th className="py-3 pr-3 font-medium">Naziv</th>
                <th className="py-3 pr-3 text-right font-medium">Količina</th>
                <th className="py-3 pr-3 text-right font-medium">Cijena</th>
                <th className="py-3 pr-3 text-right font-medium">Rabat</th>
                <th className="py-3 pr-3 text-right font-medium">Neto cijena</th>
                <th className="py-3 text-right font-medium">Iznos</th>
              </tr>
            </thead>
            <tbody>
              {q.lines.map((l) => (
                <tr key={l.sku} className="border-b border-ink/10 align-top">
                  <td className="py-3 pr-3 tabular-nums">{l.sku}</td>
                  <td className="py-3 pr-3">{l.name}</td>
                  <td className="py-3 pr-3 text-right tabular-nums">{qtyLabel(l.qty, l.unit)}</td>
                  <td className="py-3 pr-3 text-right tabular-nums">{money(l.price)}</td>
                  <td className="py-3 pr-3 text-right tabular-nums">{pct}%</td>
                  <td className="py-3 pr-3 text-right tabular-nums">{money(l.unitNet)}</td>
                  <td className="py-3 text-right tabular-nums">{money(l.total)}</td>
                </tr>
              ))}
              <tr className="border-b border-ink/10">
                <td className="py-3 pr-3" />
                <td className="py-3 pr-3" colSpan={5}>
                  Dostava — {METHOD_LABEL[prefs.method]}
                </td>
                <td className="py-3 text-right tabular-nums">{money(q.delivery)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <dl className="ml-auto mt-6 grid max-w-[340px] gap-1.5 text-[11px]">
          {q.savings > 0 && (
            <div className="flex justify-between opacity-70">
              <dt>Ušteda (rabat {pct}%)</dt>
              <dd className="tabular-nums">{money(q.savings)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Osnovica</dt>
            <dd className="tabular-nums">{money(q.base)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>PDV {Math.round(VAT_RATE * 100)}%</dt>
            <dd className="tabular-nums">{money(q.vat)}</dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-ink/25 pt-3">
            <dt className="font-semibold">Ukupno za uplatu</dt>
            <dd className="num text-[24px]">{money(q.total)}</dd>
          </div>
        </dl>

        <p className="mt-10 border-t border-ink/15 pt-4 text-[9.5px] leading-[1.6] opacity-60">
          Cijene su sa PDV-om. Predračun važi uz potvrdu stanja na skladištu. Demo — nije zvaničan dokument.
        </p>
      </article>
    </div>
  )
}
