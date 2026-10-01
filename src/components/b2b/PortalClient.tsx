'use client'

import Link from 'next/link'
import { bySku } from '@/gc/gc'
import { creditUsage, logout, openLogin, PARTNER_TIERS, useB2B, withDiscount, type FullPartner } from '@/lib/b2b'
import { cartCount, useShop } from '@/lib/cart'
import { categoryName, money } from '@/lib/shop'
import Cta from '@/components/ui/Cta'
import Bars from './Bars'
import { setPrefs, useDeliveryPrefs } from './prefs'
import { buildQuote, dateAgo, orderTotal } from './quote'

// B2B Partner Portal. Neprijavljen korisnik vidi šta portal daje i rabatnu skalu (PDF, tačka 5),
// prijavljen partner vidi kontrolnu tablu: rabat, kreditni limit, gradilišta, narudžbe, fakture,
// analitiku potrošnje i predračun iz trenutne korpe. Svi podaci su demo (u produkciji Pantheon ERP).

const BENEFITS: [string, string][] = [
  ['Ugovoreni rabat', 'Uvid u ugovorene rabate od 15% do 25% na sve artikle.'],
  ['Kreditni limit', 'Odgođeno plaćanje 30, 60 ili 90 dana uz menicu ili bankarsku garanciju.'],
  ['Zalihe u realnom vremenu', 'Stanje na skladištu Nenada Kostića 151, direktno iz Pantheon ERP-a.'],
  ['Kran transport', 'Istovar paleta direktno na spratove i etaže gradilišta.'],
]

function Landing() {
  return (
    <div className="px-5 pb-[16vh] pt-[14vh] md:px-10">
      <div className="text-center">
        <p className="label opacity-50">Za građevinske firme i izvođače</p>
        <h1 className="display mx-auto mt-5 max-w-[14ch] text-[clamp(44px,6.4vw,104px)]">B2B Partner Portal</h1>
        <p className="mx-auto mt-6 max-w-[52ch] text-[12.5px] leading-[1.7] opacity-70">
          Ugovoreni rabat, kreditni limit i odgođeno plaćanje — sve na jednom mjestu, sinhronizovano sa Pantheon ERP-om.
        </p>
        <div className="mt-10 flex justify-center">
          <Cta solid onClick={openLogin}>
            Prijava
          </Cta>
        </div>
      </div>

      <div className="mx-auto mt-[12vh] grid max-w-[1200px] border-y border-ink/15 sm:grid-cols-2 lg:grid-cols-4 [&>*]:border-ink/15 max-lg:[&>*]:border-b sm:[&>*:nth-child(odd)]:border-r lg:[&>*:not(:last-child)]:border-r">
        {BENEFITS.map(([t, d]) => (
          <div key={t} className="px-6 py-10">
            <p className="font-pretty text-[18px]">{t}</p>
            <p className="mt-3 text-[11.5px] leading-[1.7] opacity-65">{d}</p>
          </div>
        ))}
      </div>

      <section className="mx-auto mt-[14vh] max-w-[1200px]" aria-label="Rabatna skala">
        <h2 className="display text-center text-[clamp(30px,3.6vw,56px)]">Rabatna skala</h2>
        <div className="mt-10 overflow-x-auto" data-lenis-prevent>
          <table className="w-full min-w-[640px] border-collapse text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-ink/25 opacity-60">
                <th className="py-3 pr-4 font-medium">Nivo</th>
                <th className="py-3 pr-4 font-medium">Ko</th>
                <th className="py-3 pr-4 font-medium">Rabat</th>
                <th className="py-3 pr-4 font-medium">Kreditni limit</th>
                <th className="py-3 font-medium">Plaćanje</th>
              </tr>
            </thead>
            <tbody>
              {PARTNER_TIERS.map((t) => (
                <tr key={t.name} className="border-b border-ink/15">
                  <td className="py-4 pr-4 font-semibold">{t.name}</td>
                  <td className="py-4 pr-4">{t.who}</td>
                  <td className="num py-4 pr-4 text-[18px]">{t.rebate}</td>
                  <td className="py-4 pr-4">{t.limit}</td>
                  <td className="py-4">{t.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border-ink/15 p-6 md:p-8 ${className}`}>
      <h2 className="text-[11px] opacity-55">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Dashboard({ partner }: { partner: FullPartner }) {
  const { cart } = useShop()
  const prefs = useDeliveryPrefs()
  const credit = creditUsage(partner)
  const d = partner.discount
  const q = buildQuote(cart, d, prefs)

  const orders = partner.orders.map((o) => ({ ...o, total: orderTotal(o.items, d, o.deliveryCost), site: partner.sites.find((s) => s.id === o.siteId) }))
  const perSite = partner.sites.map((s) => ({ name: s.name, value: orders.filter((o) => o.siteId === s.id).reduce((t, o) => t + o.total, 0) }))
  const catTotals = new Map<string, number>()
  partner.orders.forEach((o) =>
    o.items.forEach(([sku, qty]) => {
      const p = bySku(sku)
      if (!p) return
      const name = categoryName(p.category)
      catTotals.set(name, (catTotals.get(name) ?? 0) + withDiscount(p.price, d) * qty)
    }),
  )
  const perCategory = [...catTotals.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  const unpaid = partner.invoices.filter((i) => !i.paid)

  return (
    <div className="px-3 pb-[16vh] pt-[8vh] md:px-8">
      {/* zaglavlje partnera */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/15 px-3 pb-8">
        <div>
          <p className="label opacity-50">B2B Partner Portal · demo podaci</p>
          <h1 className="display mt-4 max-w-[22ch] text-[clamp(30px,3.8vw,60px)]">{partner.name}</h1>
          <p className="mt-3 text-[11.5px] opacity-65">{partner.tier}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Cta href="/prodavnica">Katalog</Cta>
          <button type="button" onClick={logout} className="ulink text-[11px]">
            Odjava
          </button>
        </div>
      </header>

      {/* ključni brojevi */}
      <div className="grid border-b border-ink/15 md:grid-cols-[1fr_1fr_2fr]">
        <Card title="Ugovoreni rabat" className="border-b md:border-b-0 md:border-r">
          <p className="num text-[56px] leading-none">{Math.round(d * 100)}%</p>
          <p className="mt-3 text-[11px] opacity-60">na sve artikle iz kataloga</p>
        </Card>
        <Card title="Valuta plaćanja" className="border-b md:border-b-0 md:border-r">
          <p className="num text-[56px] leading-none">{partner.paymentDays}</p>
          <p className="mt-3 text-[11px] opacity-60">dana, odgođeno plaćanje</p>
        </Card>
        <Card title="Kreditni limit · sinhronizacija sa Pantheon ERP-om (demo)">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="num text-[34px] leading-none">{money(credit.available)}</p>
            <p className="text-[11px] opacity-60">raspoloživo od {money(credit.limit)}</p>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-ink/10" role="meter" aria-valuemin={0} aria-valuemax={credit.limit} aria-valuenow={credit.used} aria-label="Iskorištenost kreditnog limita">
            <div className={`h-full rounded-full ${credit.ratio > 0.85 ? 'bg-signal' : 'bg-ink'}`} style={{ width: `${credit.ratio * 100}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[10.5px] opacity-60">
            <span>Iskorišteno {money(credit.used)}</span>
            <span>{Math.round(credit.ratio * 100)}%</span>
          </div>
        </Card>
      </div>

      {/* gradilišta */}
      <Card title="Gradilišta" className="border-b">
        <div className="grid gap-3 md:grid-cols-2">
          {partner.sites.map((s) => {
            const siteOrders = orders.filter((o) => o.siteId === s.id)
            const on = prefs.siteId === s.id
            return (
              <article key={s.id} className={`rounded-[14px] border p-5 transition-colors ${on ? 'border-ink' : 'border-ink/15'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-pretty text-[17px]">{s.name}</p>
                    <p className="mt-1 text-[11px] opacity-65">{s.address}</p>
                    <p className="mt-1 text-[10.5px] opacity-50">{s.note}</p>
                  </div>
                  <p className="num shrink-0 text-[18px]">{money(siteOrders.reduce((t, o) => t + o.total, 0))}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[10.5px]">
                  <span className="opacity-60">
                    {siteOrders.length} {siteOrders.length === 1 ? 'narudžba' : 'narudžbe'}
                  </span>
                  <button type="button" onClick={() => setPrefs({ siteId: on ? null : s.id })} className={`rounded-full px-4 py-2 transition-colors ${on ? 'bg-ink text-bg' : 'bg-[var(--btn)]'}`}>
                    {on ? 'Isporuka korpe ovdje' : 'Isporuči korpu ovdje'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </Card>

      {/* analitika */}
      <div className="grid border-b border-ink/15 md:grid-cols-2">
        <Card title="Potrošnja po gradilištu" className="border-b md:border-b-0 md:border-r">
          <Bars data={perSite} label="Potrošnja po gradilištu" />
        </Card>
        <Card title="Potrošnja po grupi artikala">
          <Bars data={perCategory} label="Potrošnja po grupi artikala" />
        </Card>
      </div>

      {/* narudžbe */}
      <Card title="Narudžbe" className="border-b">
        <div className="overflow-x-auto" data-lenis-prevent>
          <table className="w-full min-w-[680px] border-collapse text-left text-[11px]">
            <thead>
              <tr className="border-b border-ink/25 opacity-60">
                <th className="py-2 pr-4 font-medium">Broj</th>
                <th className="py-2 pr-4 font-medium">Datum</th>
                <th className="py-2 pr-4 font-medium">Gradilište</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Isporuka</th>
                <th className="py-2 text-right font-medium">Iznos</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.no} className="border-b border-ink/10">
                  <td className="py-3 pr-4 tabular-nums">{o.no}</td>
                  <td className="py-3 pr-4 tabular-nums">{dateAgo(o.daysAgo)}</td>
                  <td className="py-3 pr-4">{o.site?.name ?? '—'}</td>
                  <td className="py-3 pr-4">{o.status}</td>
                  <td className="py-3 pr-4">{o.delivery === 'kran' ? 'Kamion sa kranom' : 'Standardna'}</td>
                  <td className="py-3 text-right tabular-nums">{money(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* fakture */}
      <Card title={`Fakture · otvoreno ${unpaid.length}`} className="border-b">
        <div className="overflow-x-auto" data-lenis-prevent>
          <table className="w-full min-w-[560px] border-collapse text-left text-[11px]">
            <thead>
              <tr className="border-b border-ink/25 opacity-60">
                <th className="py-2 pr-4 font-medium">Broj</th>
                <th className="py-2 pr-4 font-medium">Izdata</th>
                <th className="py-2 pr-4 font-medium">Dospijeće</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 text-right font-medium">Iznos</th>
              </tr>
            </thead>
            <tbody>
              {partner.invoices.map((i) => {
                const dueIn = partner.paymentDays - i.issuedDaysAgo
                const status = i.paid ? 'Plaćena' : dueIn < 0 ? 'Dospjela' : 'Otvorena'
                return (
                  <tr key={i.no} className="border-b border-ink/10">
                    <td className="py-3 pr-4 tabular-nums">{i.no}</td>
                    <td className="py-3 pr-4 tabular-nums">{dateAgo(i.issuedDaysAgo)}</td>
                    <td className="py-3 pr-4 tabular-nums">{dateAgo(-dueIn)}</td>
                    <td className={`py-3 pr-4 ${status === 'Dospjela' ? 'text-signal' : ''}`}>{status}</td>
                    <td className="py-3 text-right tabular-nums">{money(i.amount)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* predračun iz korpe */}
      <Card title="Predračun iz korpe (CPQ)">
        {cartCount(cart) ? (
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="num text-[34px] leading-none">{money(q.total)}</p>
              <p className="mt-2 text-[11px] opacity-60">
                {cartCount(cart)} stavki · rabat {Math.round(d * 100)}% · ušteda {money(q.savings)}
              </p>
            </div>
            <Cta href="/portal/predracun" solid>
              Predračun
            </Cta>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="text-[11.5px] opacity-65">Korpa je prazna — dodajte artikle ili koristite kalkulator.</p>
            <Link href="/prodavnica#kalkulator" className="ulink text-[11px]">
              Kalkulator
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}

export default function PortalClient() {
  const { partner } = useB2B()
  return partner ? <Dashboard partner={partner} /> : <Landing />
}
