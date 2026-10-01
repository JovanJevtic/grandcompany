'use client'

import { useMemo, useState } from 'react'
import { bySku, PRODUCTS, STOCK_LABEL, stockLevel } from '@/gc/gc'
import { DEMO_PARTNERS } from '@/lib/b2b'
import { money } from '@/lib/shop'
import { STATUSES, allOrders, creditOf, leaveAdmin, setStatus, syncPantheon, usePortal, type Status } from './store'
import { Head, Pill, dateOf, field, go, line } from './ui'

// Interni dio (samo tim Grand Company) — namjerno sažet: sinhronizacija sa Pantheonom, četiri
// broja, narudžbe sa promjenom statusa (kupac to odmah vidi u praćenju), zalihe sa rezervisanom
// robom, kupci sa iskorištenošću limita i pet najprodavanijih artikala. Bez BI grafika.

const time = (ts: number) => new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

function Block({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-3">
        <h2 className="display text-[clamp(24px,2.4vw,40px)]">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export default function Admin() {
  const s = usePortal()
  const [syncing, setSyncing] = useState(false)
  const [q, setQ] = useState('')
  const [low, setLow] = useState(false)
  const orders = useMemo(() => allOrders(s).sort((a, b) => a.daysAgo - b.daysAgo), [s])
  const active = orders.filter((o) => o.status !== 'Isporučena')

  // Rezervisano = količine u aktivnim (neisporučenim) narudžbama
  const reserved = new Map<string, number>()
  active.forEach((o) => o.items.forEach(([sku, n]) => reserved.set(sku, (reserved.get(sku) ?? 0) + n)))
  const stock = PRODUCTS.filter((p) => (!low || stockLevel(p) === 'low') && (!q || `${p.sku} ${p.name}`.toLowerCase().includes(q.toLowerCase())))
  const maxStock = Math.max(...PRODUCTS.map((p) => p.stock))

  const month = orders.filter((o) => o.daysAgo <= 30).reduce((t, o) => t + o.total, 0)
  const receivable = DEMO_PARTNERS.reduce((t, p) => t + p.invoices.filter((i) => !i.paid).reduce((a, i) => a + i.amount, 0), 0)
  const lowCount = PRODUCTS.filter((p) => stockLevel(p) === 'low').length

  const sales = new Map<string, number>()
  orders.forEach((o) => o.items.forEach(([sku, n]) => sales.set(sku, (sales.get(sku) ?? 0) + (bySku(sku)?.price ?? 0) * n * (1 - o.partner.discount))))
  const top = [...sales.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topMax = top[0]?.[1] || 1

  const sync = () => {
    setSyncing(true)
    setTimeout(() => {
      syncPantheon()
      setSyncing(false)
    }, 900)
  }

  return (
    <div className="px-5 pb-[14vh] pt-10 md:px-10">
      <Head
        no="Interno · samo tim Grand Company"
        title="Upravljanje"
        aside={
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 border border-ink/25 px-3 py-2 text-[10.5px]">
              <span className={`size-1.5 rounded-full ${syncing ? 'animate-pulse bg-cobalt' : 'bg-[#2e9e5b]'}`} />
              Stanje skladišta · {s.syncedAt ? time(s.syncedAt) : '—'}
            </span>
            <button type="button" onClick={sync} disabled={syncing} className="border border-ink px-4 py-2 text-[10.5px] transition-colors hover:bg-ink hover:text-bg disabled:opacity-50">
              {syncing ? 'Sinhronizacija…' : 'Sinhronizuj'}
            </button>
            <button
              type="button"
              onClick={() => {
                leaveAdmin()
                go('pregled')
              }}
              className="ulink text-[10.5px] opacity-70"
            >
              Izađi
            </button>
          </div>
        }
      />

      <section className={`grid grid-cols-2 border-b ${line} lg:grid-cols-4`}>
        {[
          ['Prodaja, 30 dana', money(month)],
          ['Aktivne narudžbe', String(active.length)],
          ['Potraživanja', money(receivable)],
          ['Artikli sa malo zaliha', String(lowCount)],
        ].map(([k, v], i) => (
          <div key={k} className={`px-4 py-6 ${i % 2 === 0 ? `border-r ${line}` : ''} ${i === 1 ? `lg:border-r ${line}` : ''} ${i === 0 ? 'bg-cobalt text-bg' : ''} md:px-6`}>
            <p className="text-[10px] opacity-65">{k}</p>
            <p className="num mt-3 text-[clamp(22px,2.4vw,40px)] leading-none">{v}</p>
          </div>
        ))}
      </section>

      <Block title="Narudžbe" aside={<span className="text-[10.5px] opacity-60">Promjena statusa se odmah vidi kupcu u praćenju</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-[11px]">
            <thead>
              <tr className={`border-b ${line} text-[10px] opacity-55`}>
                <th className="py-3 font-medium">Broj</th>
                <th className="py-3 font-medium">Kupac</th>
                <th className="py-3 font-medium">Datum</th>
                <th className="py-3 font-medium">Dostava</th>
                <th className="py-3 text-right font-medium">Iznos</th>
                <th className="py-3 pl-6 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.no} className={`border-b ${line}`}>
                  <td className="py-3 font-semibold">
                    {o.no}
                    {o.fresh && <span className="ml-2 text-[9px] text-cobalt">NOVO</span>}
                  </td>
                  <td className="max-w-[220px] truncate py-3">{o.partner.name}</td>
                  <td className="py-3 tabular-nums">{o.fresh ? dateOf(o.placedAt) : `prije ${o.daysAgo} d`}</td>
                  <td className="py-3">{o.delivery === 'kran' ? 'Kran' : 'Standard'}</td>
                  <td className="py-3 text-right tabular-nums">{money(o.total)}</td>
                  <td className="py-2 pl-6">
                    <select value={o.status} onChange={(e) => setStatus(o.no, e.target.value as Status)} className={`${field} h-9 w-[150px] text-[10.5px]`} aria-label={`Status ${o.no}`}>
                      {STATUSES.map((st) => (
                        <option key={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <div className="grid gap-x-12 xl:grid-cols-[1.5fr_1fr]">
        <Block
          title="Zalihe"
          aside={
            <div className="flex flex-wrap items-center gap-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Šifra ili naziv" className={`${field} h-9 w-[180px]`} aria-label="Pretraga zaliha" />
              <label className="flex items-center gap-2 text-[10.5px]">
                <input type="checkbox" checked={low} onChange={(e) => setLow(e.target.checked)} className="size-4 accent-[var(--cobalt)]" />
                Malo na stanju
              </label>
            </div>
          }
        >
          <div className="max-h-[520px] overflow-y-auto" data-lenis-prevent>
            <table className="w-full border-collapse text-left text-[11px]">
              <thead className="sticky top-0 bg-bg">
                <tr className={`border-b ${line} text-[10px] opacity-55`}>
                  <th className="py-3 font-medium">Artikal</th>
                  <th className="w-[34%] py-3 font-medium">Stanje</th>
                  <th className="py-3 text-right font-medium">Rezervisano</th>
                  <th className="py-3 text-right font-medium">Raspoloživo</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((p) => {
                  const r = reserved.get(p.sku) ?? 0
                  const lvl = stockLevel(p)
                  return (
                    <tr key={p.sku} className={`border-b ${line}`}>
                      <td className="py-3 pr-4">
                        <span className="block text-[10px] opacity-55">{p.sku}</span>
                        <span className="line-clamp-1">{p.name}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 bg-ink/10">
                            <div className={`h-full ${lvl === 'low' ? 'bg-ink' : 'bg-cobalt'}`} style={{ width: `${Math.max(2, (p.stock / maxStock) * 100)}%` }} />
                          </div>
                          <span className="w-[72px] text-right tabular-nums">
                            {p.stock.toLocaleString('de-DE')} {p.unit}
                          </span>
                        </div>
                        {lvl === 'low' && <span className="mt-1 block text-[9.5px] text-cobalt">{STOCK_LABEL[lvl]} — naručiti</span>}
                      </td>
                      <td className="py-3 text-right tabular-nums">{r ? r.toLocaleString('de-DE') : '—'}</td>
                      <td className="py-3 text-right font-semibold tabular-nums">{Math.max(0, p.stock - r).toLocaleString('de-DE')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Block>

        <div>
          <Block title="Kupci">
            <ul>
              {DEMO_PARTNERS.map((p) => {
                const c = creditOf(p, s)
                return (
                  <li key={p.id} className={`border-b ${line} py-4`}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[11.5px] font-semibold">{p.name}</span>
                      <span className="num text-[16px]">{Math.round(p.discount * 100)}%</span>
                    </div>
                    <p className="mt-1 text-[10px] opacity-60">
                      {p.tier.split(',')[0]} · valuta {p.paymentDays} d · limit {money(p.creditLimit)}
                    </p>
                    <div className="mt-3 h-2 bg-ink/10">
                      <div className={`h-full ${c.ratio > 0.85 ? 'bg-ink' : 'bg-cobalt'}`} style={{ width: `${Math.round(c.ratio * 100)}%` }} />
                    </div>
                    <p className="mt-1 text-right text-[9.5px] tabular-nums opacity-60">iskorišteno {Math.round(c.ratio * 100)}%</p>
                  </li>
                )
              })}
            </ul>
          </Block>
          <Block title="Top artikli">
            <ul className="pt-4">
              {top.map(([sku, v]) => (
                <li key={sku} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 py-2 text-[10.5px]">
                  <span className="tabular-nums">{sku}</span>
                  <div className="h-3 bg-ink/10">
                    <div className="h-full bg-cobalt" style={{ width: `${(v / topMax) * 100}%` }} />
                  </div>
                  <span className="tabular-nums">{money(v)}</span>
                </li>
              ))}
            </ul>
          </Block>
          {s.requests.length > 0 && (
            <Block title="Zahtjevi">
              <ul>
                {s.requests.slice(0, 6).map((r) => (
                  <li key={r.at} className={`border-b ${line} py-3 text-[10.5px]`}>
                    <div className="flex justify-between gap-4">
                      <span className="font-semibold">{r.from}</span>
                      <Pill tone={r.kind === 'registracija' ? 'cobalt' : 'line'}>{r.kind === 'registracija' ? 'Novi nalog' : 'Uslovi'}</Pill>
                    </div>
                    <p className="mt-1 line-clamp-2 opacity-65">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>
      </div>
    </div>
  )
}
