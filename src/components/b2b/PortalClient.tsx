'use client'

/* eslint-disable @next/next/no-img-element -- fotografije iz /public, već u WebP */

import Link from 'next/link'
import { useRef } from 'react'
import { bySku } from '@/gc/gc'
import { creditUsage, logout, openLogin, PARTNER_TIERS, useB2B, withDiscount, type FullPartner } from '@/lib/b2b'
import { useMediaMotion } from '@/lib/media'
import { categoryName, money, shotOf } from '@/lib/shop'
import StepBand from '@/components/ui/StepBand'
import { setPrefs, useDeliveryPrefs } from './prefs'
import { dateAgo, orderTotal } from './quote'

// B2B Partner Portal — brutalist / editorijalni raspored: mreža ćelija odvojenih tankim linijama,
// ogromni brojevi i nazivi, jarka plava za kontrast, stepenasti prelazi u plave sekcije, fotografije
// sa stovarišta i skicirani crteži sa početne. Funkcija ostaje glavna: rabat, kreditni limit,
// gradilišta, narudžbe, fakture, potrošnja i predračun iz korpe. Svi podaci su demo (Pantheon ERP).

const line = 'border-ink/20'
const idx = (i: number) => String(i + 1).padStart(2, '0')

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

// ——— Neprijavljen: ulaz ———
function Landing() {
  const root = useRef<HTMLDivElement>(null)
  useMediaMotion(root)
  return (
    <div ref={root}>
      <section className={`grid border-b ${line} md:grid-cols-[1.25fr_1fr]`}>
        <div className={`flex flex-col justify-between gap-12 bg-cobalt px-5 pb-10 pt-[12vh] text-bg md:border-r ${line} md:px-10`}>
          <p className="label">B2B Partner Portal · Grand Company</p>
          <h1 className="display text-[clamp(56px,9vw,168px)] !leading-[0.84]">
            B2B
            <br />
            portal
          </h1>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-[40ch] text-[12.5px] leading-[1.65]">
              Za građevinske firme, izvođače radova i subjekte visokogradnje: ugovoreni rabat, kreditni limit i odgođeno plaćanje, stanje
              zaliha iz Pantheon ERP-a.
            </p>
            <button type="button" onClick={openLogin} className="cta">
              <span className="cta-roll">
                <span>Uđi kao demo gost</span>
                <span aria-hidden>Uđi kao demo gost</span>
              </span>
              <svg className="cta-arrow" viewBox="0 0 16 16" aria-hidden>
                <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </div>
        </div>
        <figure data-curtain data-parallax="6" className="relative min-h-[48vh] overflow-hidden bg-ink">
          <img src="/shop2/brand.webp" alt="Kamion sa kranom istovara paletu na sprat" className="absolute inset-0 h-full w-full object-cover" />
          <figcaption className="absolute bottom-0 left-0 bg-bg px-4 py-2 text-[11px]">Istovar paleta na etaže — kran transport</figcaption>
        </figure>
      </section>

      <section className={`grid border-b ${line} sm:grid-cols-2 lg:grid-cols-4`}>
        {[
          ['Rabat', 'Ugovoreni rabati od 10% do 22% po nivou partnera.'],
          ['Kredit', 'Kreditni limit i odgođeno plaćanje 30, 60 ili 90 dana uz menicu ili bankarsku garanciju.'],
          ['Zalihe', 'Stanje na skladištu Nenada Kostića 151 u realnom vremenu, iz Pantheon ERP-a.'],
          ['Kran', 'Kamioni sa hidrauličnom dizalicom — istovar direktno na spratove gradilišta.'],
        ].map(([t, d], i) => (
          <div key={t} className={`border-b ${line} px-5 py-8 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0 md:px-8`}>
            <span className="label opacity-50">{idx(i)}</span>
            <p className="display mt-6 text-[clamp(34px,3.4vw,56px)]">{t}</p>
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
    </div>
  )
}

// ——— Prijavljen partner: kontrolna tabla ———
const STEPS = ['Potvrđena', 'U pripremi', 'Isporučena'] as const
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']
const tons = (kg: number) => (kg / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const CAT_TONES = ['bg-cobalt', 'bg-ink', 'bg-[#8a93a6]', 'bg-[#d6cfc3]']

// Dekorativni krug: tanki prsten sa podiocima koji se sporo okreće, broj u sredini.
function Dial({ value, label }: { value: string; label: string }) {
  return (
    <div className="relative grid size-[180px] shrink-0 place-items-center md:size-[220px]">
      <svg viewBox="0 0 200 200" className="dial absolute inset-0 h-full w-full" fill="none" stroke="currentColor" aria-hidden>
        <circle cx="100" cy="100" r="96" strokeWidth="1" />
        <circle cx="100" cy="100" r="78" strokeWidth="1" strokeDasharray="2 5" />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2
          const r1 = i % 5 ? 90 : 84
          return <line key={i} x1={100 + Math.cos(a) * r1} y1={100 + Math.sin(a) * r1} x2={100 + Math.cos(a) * 96} y2={100 + Math.sin(a) * 96} strokeWidth="1" />
        })}
        <circle cx="196" cy="100" r="4" fill="var(--cobalt)" stroke="none" />
      </svg>
      <div className="text-center">
        <p className="num text-[56px] leading-none">{value}</p>
        <p className="mt-1 text-[10px] opacity-60">{label}</p>
      </div>
    </div>
  )
}

// Prsten iskorištenosti kredita
function Donut({ ratio }: { ratio: number }) {
  const r = 70
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 180 180" className="size-[170px] -rotate-90" aria-hidden>
      <circle cx="90" cy="90" r={r} fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="18" />
      <circle cx="90" cy="90" r={r} fill="none" stroke="var(--cobalt)" strokeWidth="18" strokeDasharray={`${c * ratio} ${c}`} />
    </svg>
  )
}

function Dashboard({ partner }: { partner: FullPartner }) {
  const root = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  useMediaMotion(root)
  const prefs = useDeliveryPrefs()
  const credit = creditUsage(partner)
  const d = partner.discount

  const orders = partner.orders
    .map((o) => {
      const items = o.items.map(([sku, qty]) => ({ sku, qty, p: bySku(sku) }))
      const retail = items.reduce((s, i) => s + (i.p?.price ?? 0) * i.qty, 0)
      const kg = items.reduce((s, i) => s + (i.p?.weight ?? 0) * i.qty, 0)
      return { ...o, items, retail, kg, total: orderTotal(o.items, d, o.deliveryCost), site: partner.sites.find((s) => s.id === o.siteId) }
    })
    .sort((a, b) => a.daysAgo - b.daysAgo)
  const perSite = partner.sites.map((s) => ({
    id: s.id,
    value: orders.filter((o) => o.siteId === s.id).reduce((t, o) => t + o.total, 0),
    count: orders.filter((o) => o.siteId === s.id).length,
  }))
  const catTotals = new Map<string, number>()
  orders.forEach((o) =>
    o.items.forEach((i) => {
      if (!i.p) return
      const name = categoryName(i.p.category)
      catTotals.set(name, (catTotals.get(name) ?? 0) + withDiscount(i.p.price, d) * i.qty)
    }),
  )
  const perCategory = [...catTotals.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  const catSum = perCategory.reduce((s, c) => s + c.value, 0) || 1
  const unpaid = partner.invoices.filter((i) => !i.paid)
  const unpaidSum = unpaid.reduce((s, i) => s + i.amount, 0)
  const ordered = orders.reduce((s, o) => s + o.total, 0)
  const savings = orders.reduce((s, o) => s + o.retail * d, 0)
  const kgAll = orders.reduce((s, o) => s + o.kg, 0)
  const craneRuns = orders.filter((o) => o.delivery === 'kran').length

  // Fakturisano po mjesecima, zadnjih 5 mjeseci
  const now = new Date()
  const months = Array.from({ length: 5 }, (_, k) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (4 - k), 1)
    const sum = partner.invoices
      .filter((inv) => {
        const dt = new Date(now.getTime() - inv.issuedDaysAgo * 86400000)
        return dt.getMonth() === m.getMonth() && dt.getFullYear() === m.getFullYear()
      })
      .reduce((s, inv) => s + inv.amount, 0)
    return { label: MONTHS[m.getMonth()], sum }
  })
  const maxMonth = Math.max(1, ...months.map((m) => m.sum))
  const scrollRail = (dir: number) => rail.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  const [tierName, ...tierRest] = partner.tier.split(',')

  return (
    <div ref={root}>
      {/* 1. Traka partnera: numerisani blokovi, linija samo ispod */}
      <section className={`grid grid-cols-2 border-b ${line} md:grid-cols-4`}>
        <div className={`flex min-h-[170px] flex-col justify-between gap-6 border-r ${line} px-5 py-6 md:px-8`}>
          <span className="num text-[44px] leading-none opacity-20">01</span>
          <div>
            <p className="label opacity-50">Partner</p>
            <p className="display mt-2 text-[clamp(22px,2vw,32px)]">{tierName}</p>
            <p className="mt-1 text-[10.5px] opacity-60">{tierRest.join(',').trim()}</p>
          </div>
        </div>
        <div className={`flex min-h-[170px] flex-col justify-between gap-6 ${line} px-5 py-6 md:border-r md:px-8`}>
          <span className="num text-[44px] leading-none opacity-20">02</span>
          <div>
            <p className="label opacity-50">Plaćanje</p>
            <p className="display mt-2 text-[clamp(22px,2vw,32px)]">Valuta {partner.paymentDays} dana</p>
            <p className="mt-1 text-[10.5px] opacity-60">odgođeno, menica ili garancija</p>
          </div>
        </div>
        <Link href="/prodavnica" className={`group flex min-h-[170px] flex-col justify-between gap-6 border-r border-t ${line} px-5 py-6 transition-colors hover:bg-cobalt hover:text-bg md:border-t-0 md:px-8`}>
          <span className="flex items-start justify-between">
            <span className="num text-[44px] leading-none opacity-20 group-hover:opacity-60">03</span>
            <Arrow />
          </span>
          <span>
            <span className="label block opacity-50 group-hover:opacity-80">Nova narudžba</span>
            <span className="display mt-2 block text-[clamp(22px,2vw,32px)]">Katalog</span>
          </span>
        </Link>
        <button type="button" onClick={logout} className={`group flex min-h-[170px] flex-col justify-between gap-6 border-t ${line} px-5 py-6 text-left transition-colors hover:bg-ink hover:text-bg md:border-t-0 md:px-8`}>
          <span className="flex w-full items-start justify-between">
            <span className="num text-[44px] leading-none opacity-20 group-hover:opacity-60">04</span>
            <Arrow />
          </span>
          <span>
            <span className="label block opacity-50 group-hover:opacity-80">{partner.name}</span>
            <span className="display mt-2 block text-[clamp(22px,2vw,32px)]">Odjava</span>
          </span>
        </button>
      </section>

      {/* 2. Ključni brojevi */}
      <section className={`grid border-b ${line} sm:grid-cols-2 xl:grid-cols-4`}>
        <div className="bg-cobalt px-5 py-8 text-bg md:px-8">
          <p className="label">Ugovoreni rabat</p>
          <p className="num mt-6 text-[clamp(72px,8vw,140px)] leading-[0.85]">{Math.round(d * 100)}%</p>
          <p className="mt-4 text-[11px] opacity-80">na sve artikle iz kataloga</p>
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
        <div className={`border-t ${line} px-5 py-8 sm:border-r xl:border-t-0 md:px-8`}>
          <p className="label opacity-50">Naručeno ukupno</p>
          <p className="num mt-6 text-[clamp(30px,2.6vw,44px)] leading-none">{money(ordered)}</p>
          <p className="mt-4 text-[11px] opacity-60">ušteda od rabata {money(savings)}</p>
        </div>
        <div className={`border-t ${line} px-5 py-8 xl:border-t-0 md:px-8`}>
          <p className="label opacity-50">Otvorene fakture</p>
          <p className="num mt-6 text-[clamp(72px,8vw,140px)] leading-[0.85]">{unpaid.length}</p>
          <p className="mt-4 text-[11px] opacity-60">ukupno {money(unpaidSum)}</p>
        </div>
      </section>

      {/* 3. Gradilišta — plava sekcija sa stepenastim prelazom */}
      <StepBand tone="navy" profile="diag" steps={12} aria-label="Gradilišta">
        <div className="px-5 py-[9vh] md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="display text-[clamp(44px,6vw,110px)] !leading-[0.86]">Gradilišta</h2>
            <p className="max-w-[40ch] text-[11.5px] leading-[1.6] opacity-85">
              Izaberite gradilište na koje se isporučuje trenutna korpa — kamion sa kranom istovara direktno na sprat.
            </p>
          </div>
          <div className="mt-10 grid border-l border-t border-bg/40 md:grid-cols-2">
            {partner.sites.map((s, i) => {
              const on = prefs.siteId === s.id
              const stat = perSite.find((x) => x.id === s.id)!
              return (
                <article key={s.id} className={`flex flex-col gap-6 border-b border-r border-bg/40 p-6 transition-colors md:p-8 ${on ? 'bg-bg text-cobalt' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <span className="num text-[44px] leading-none">{idx(i)}</span>
                    <span className="num text-right text-[22px]">{money(stat.value)}</span>
                  </div>
                  <div>
                    <h3 className="display text-[clamp(24px,2.2vw,36px)]">{s.name}</h3>
                    <p className="mt-3 text-[11px] leading-[1.6] opacity-80">{s.address}</p>
                    <p className="text-[11px] leading-[1.6] opacity-60">{s.note}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-current/30 pt-4 text-[11px]">
                    <span>
                      {stat.count} {stat.count === 1 ? 'narudžba' : 'narudžbe'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPrefs({ siteId: s.id, method: 'kran' })}
                      aria-pressed={on}
                      className={`flex items-center gap-3 border px-3 py-2 transition-colors ${on ? 'border-cobalt bg-cobalt text-bg' : 'border-bg/60 hover:bg-bg hover:text-cobalt'}`}
                    >
                      {on ? 'Isporuka ovdje' : 'Isporuči korpu ovdje'} <Arrow />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </StepBand>

      {/* 4. Analitika */}
      <section className="px-5 pt-[12vh] md:px-10">
        <div className="flex items-end justify-between gap-6 border-b-2 border-ink pb-4">
          <h2 className="display text-[clamp(36px,4.6vw,84px)] !leading-[0.88]">Analitika</h2>
          <span className="text-[11px] opacity-60">Pantheon ERP · demo podaci</span>
        </div>
        <div className={`grid border-b ${line} lg:grid-cols-[1.4fr_1fr_1fr]`}>
          <div className={`border-b ${line} py-8 lg:border-b-0 lg:border-r lg:pr-8`}>
            <p className="label opacity-50">Fakturisano po mjesecima</p>
            <div className="mt-8 flex h-[220px] items-end gap-3">
              {months.map((m) => (
                <div key={m.label} className="flex h-full flex-1 flex-col justify-end gap-2">
                  <span className="text-center text-[10px] tabular-nums opacity-70">{m.sum ? `${Math.round(m.sum / 1000)}k` : '—'}</span>
                  <div className={`w-full ${m.sum ? 'bg-cobalt' : 'border border-dashed border-ink/25'}`} style={{ height: `${Math.max(2, (m.sum / maxMonth) * 100)}%` }} />
                  <span className={`border-t ${line} pt-2 text-center text-[10.5px]`}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={`flex flex-col items-center justify-center gap-4 border-b ${line} py-8 lg:border-b-0 lg:border-r`}>
            <p className="label self-start opacity-50 lg:px-8">Iskorištenost kredita</p>
            <div className="relative grid place-items-center">
              <Donut ratio={credit.ratio} />
              <p className="num absolute text-[38px]">{Math.round(credit.ratio * 100)}%</p>
            </div>
            <p className="text-[10.5px] opacity-60">
              {money(credit.used)} od {money(credit.limit)}
            </p>
          </div>
          <div className="py-8 lg:pl-8">
            <p className="label opacity-50">Struktura nabavke</p>
            <div className="mt-8 flex h-6 w-full border border-ink">
              {perCategory.map((c, i) => (
                <div key={c.name} className={CAT_TONES[i % CAT_TONES.length]} style={{ width: `${(c.value / catSum) * 100}%` }} title={c.name} />
              ))}
            </div>
            <ul className="mt-6 grid gap-3">
              {perCategory.map((c, i) => (
                <li key={c.name} className="grid grid-cols-[14px_1fr_auto] items-center gap-3 text-[11px]">
                  <span className={`size-3 ${CAT_TONES[i % CAT_TONES.length]}`} />
                  <span>{c.name}</span>
                  <span className="tabular-nums">{Math.round((c.value / catSum) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={`grid grid-cols-2 border-b ${line} md:grid-cols-4`}>
          {[
            [String(orders.length), 'narudžbi'],
            [money(ordered / Math.max(1, orders.length)), 'prosječna narudžba'],
            [`${tons(kgAll)} t`, 'isporučeno tereta'],
            [String(craneRuns), 'isporuka kranom'],
          ].map(([v, k], i) => (
            <div key={k} className={`py-6 ${i % 2 === 0 ? `border-r ${line} pr-4` : 'pl-4'} md:px-6 ${i < 3 ? `md:border-r ${line}` : 'md:border-r-0'} ${i === 0 ? 'md:pl-0' : ''}`}>
              <p className="num text-[clamp(22px,2.2vw,36px)] leading-none">{v}</p>
              <p className="mt-2 text-[10.5px] opacity-60">{k}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Narudžbe — kartice sa trakom statusa i stavkama */}
      <section className="px-5 pt-[12vh] md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-8 border-b-2 border-ink pb-6">
          <div>
            <h2 className="display text-[clamp(36px,4.6vw,84px)] !leading-[0.88]">Narudžbe</h2>
            <p className="mt-4 max-w-[44ch] text-[11.5px] leading-[1.6] opacity-70">
              Praćenje od potvrde do istovara na gradilištu. Stavke, dostava i iznos sa ugovorenim rabatom.
            </p>
          </div>
          <Dial value={String(orders.length).padStart(2, '0')} label="narudžbe" />
        </div>
        <div className="grid">
          {orders.map((o) => {
            const step = STEPS.indexOf(o.status as (typeof STEPS)[number])
            return (
              <article key={o.no} className={`grid gap-6 border-b ${line} py-8 lg:grid-cols-[1.1fr_1.4fr_1fr]`}>
                <div>
                  <p className="label opacity-50">{dateAgo(o.daysAgo)}</p>
                  <p className="display mt-2 text-[clamp(24px,2.2vw,36px)]">{o.no}</p>
                  <p className="mt-2 text-[11px] opacity-70">{o.site?.name ?? '—'}</p>
                  <ol className="mt-6 grid grid-cols-3 gap-1">
                    {STEPS.map((s, i) => (
                      <li key={s} className="text-[9.5px]">
                        <span className={`mb-2 block h-1.5 ${i <= step ? 'bg-cobalt' : 'bg-ink/15'}`} />
                        <span className={i === step ? 'font-semibold' : 'opacity-50'}>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <ul className="flex flex-wrap content-start gap-2">
                  {o.items.map((i) => (
                    <li key={i.sku} className={`flex w-[150px] items-center gap-2 border ${line} p-1.5 pr-2`}>
                      <img src={shotOf(i.sku)} alt="" className="size-10 shrink-0 object-cover" />
                      <span className="text-[9.5px] leading-[1.3]">
                        <span className="block font-semibold">{i.sku}</span>
                        <span className="opacity-60">
                          {i.qty.toLocaleString('de-DE')} {i.p?.unit}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col justify-between gap-4 lg:items-end lg:text-right">
                  <p className="num text-[clamp(28px,2.6vw,44px)] leading-none">{money(o.total)}</p>
                  <div className="text-[10.5px] opacity-70">
                    <p>
                      {o.delivery === 'kran' ? 'Kamion sa kranom' : 'Standardna dostava'} · {money(o.deliveryCost)}
                    </p>
                    <p>
                      {tons(o.kg)} t · ušteda {money(o.retail * d)}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* 6. Fakture — uspravne kartice, vodoravno listanje */}
      <section className="pb-[14vh] pt-[12vh]">
        <div className="mx-5 flex flex-wrap items-end justify-between gap-6 border-b-2 border-ink pb-4 md:mx-10">
          <div>
            <h2 className="display text-[clamp(36px,4.6vw,84px)] !leading-[0.88]">Fakture</h2>
            <p className="mt-3 text-[11px] opacity-60">
              Otvoreno {unpaid.length} · {money(unpaidSum)}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => scrollRail(-1)} className="btn-square" aria-label="Prethodne">
              <span className="rotate-180">
                <Arrow />
              </span>
            </button>
            <button type="button" onClick={() => scrollRail(1)} className="btn-square" aria-label="Sljedeće">
              <Arrow />
            </button>
          </div>
        </div>
        <div ref={rail} data-lenis-prevent className="invoice-rail mt-8 flex snap-x snap-mandatory overflow-x-auto px-5 md:px-10">
          {partner.invoices.map((inv, n) => {
            const dueIn = partner.paymentDays - inv.issuedDaysAgo
            const status = inv.paid ? 'Plaćena' : dueIn < 0 ? 'Dospjela' : 'Otvorena'
            const elapsed = Math.min(1, inv.issuedDaysAgo / partner.paymentDays)
            const tone = status === 'Plaćena' ? '' : status === 'Dospjela' ? 'bg-ink text-bg' : 'bg-cobalt text-bg'
            return (
              <article key={inv.no} className={`flex h-[420px] w-[260px] shrink-0 snap-start flex-col justify-between border ${line} p-6 ${n ? '-ml-px' : ''} ${tone}`}>
                <div className="flex items-start justify-between">
                  <span className="label opacity-80">{status}</span>
                  <span className="text-[10px] opacity-70">{inv.no}</span>
                </div>
                <div>
                  <p className="text-[10px] opacity-60">Iznos</p>
                  <p className="num text-[34px] leading-none">{money(inv.amount)}</p>
                </div>
                <div className="grid gap-3 text-[10.5px]">
                  <div className="flex justify-between border-t border-current/25 pt-3">
                    <span className="opacity-60">Izdata</span>
                    <span className="tabular-nums">{dateAgo(inv.issuedDaysAgo)}</span>
                  </div>
                  <div className="flex justify-between border-t border-current/25 pt-3">
                    <span className="opacity-60">Dospijeće</span>
                    <span className="tabular-nums">{dateAgo(-dueIn)}</span>
                  </div>
                  <div className="border-t border-current/25 pt-3">
                    <div className="flex justify-between">
                      <span className="opacity-60">Valuta</span>
                      <span>{inv.paid ? 'zatvorena' : dueIn < 0 ? `${-dueIn} dana kasni` : `još ${dueIn} dana`}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-current/20">
                      <div className="h-full bg-current" style={{ width: `${inv.paid ? 100 : elapsed * 100}%` }} />
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default function PortalClient() {
  const { partner, mode } = useB2B()
  if (partner && mode === 'b2b') return <Dashboard partner={partner} />
  return <Landing />
}
