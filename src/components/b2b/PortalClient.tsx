'use client'

/* eslint-disable @next/next/no-img-element -- fotografije iz /public, već u WebP */

import Link from 'next/link'
import { useRef } from 'react'
import { bySku } from '@/gc/gc'
import { creditUsage, logout, openLogin, PARTNER_TIERS, useB2B, withDiscount, type FullPartner } from '@/lib/b2b'
import { cartCount, useShop } from '@/lib/cart'
import { useMediaMotion } from '@/lib/media'
import { categoryName, money } from '@/lib/shop'
import Cta from '@/components/ui/Cta'
import StepBand from '@/components/ui/StepBand'
import UseArt from '@/components/landing/UseArt'
import { setPrefs, useDeliveryPrefs } from './prefs'
import { buildQuote, dateAgo, orderTotal } from './quote'

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
function Dashboard({ partner }: { partner: FullPartner }) {
  const root = useRef<HTMLDivElement>(null)
  useMediaMotion(root)
  const { cart } = useShop()
  const prefs = useDeliveryPrefs()
  const credit = creditUsage(partner)
  const d = partner.discount
  const q = buildQuote(cart, d, prefs)

  const orders = partner.orders.map((o) => ({ ...o, total: orderTotal(o.items, d, o.deliveryCost), site: partner.sites.find((s) => s.id === o.siteId) }))
  const perSite = partner.sites.map((s) => ({ id: s.id, name: s.name, value: orders.filter((o) => o.siteId === s.id).reduce((t, o) => t + o.total, 0), count: orders.filter((o) => o.siteId === s.id).length }))
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
  const maxSite = Math.max(1, ...perSite.map((s) => s.value))
  const maxCat = Math.max(1, ...perCategory.map((c) => c.value))
  const unpaid = partner.invoices.filter((i) => !i.paid)
  const unpaidSum = unpaid.reduce((s, i) => s + i.amount, 0)

  return (
    <div ref={root}>
      {/* 1. Zaglavlje partnera */}
      <section className={`grid border-b ${line} md:grid-cols-[1.5fr_1fr]`}>
        <div className={`flex flex-col justify-between gap-10 px-5 pb-8 pt-[10vh] md:border-r ${line} md:px-10`}>
          <p className="label flex items-center gap-3">
            <span className="bg-cobalt px-2 py-1 text-bg">Demo gost</span>
            <span className="opacity-50">B2B Partner Portal · Pantheon ERP (demo)</span>
          </p>
          <h1 data-up className="display text-[clamp(44px,6.6vw,124px)] !leading-[0.86]">
            {partner.name}
          </h1>
        </div>
        <figure data-curtain data-parallax="6" className="relative min-h-[34vh] overflow-hidden bg-ink">
          <img src="/shop2/brand.webp" alt="Kamion sa kranom na gradilištu" className="absolute inset-0 h-full w-full object-cover" />
        </figure>
      </section>
      <div className={`grid grid-cols-2 border-b ${line} text-[11px] md:grid-cols-4`}>
        <span className={`border-r ${line} px-5 py-3 md:px-10`}>{partner.tier}</span>
        <span className={`${line} px-5 py-3 md:border-r md:px-8`}>Valuta {partner.paymentDays} dana</span>
        <Link href="/prodavnica" className={`flex items-center justify-between border-r border-t ${line} px-5 py-3 transition-colors hover:bg-ink hover:text-bg md:border-t-0 md:px-8`}>
          Katalog <Arrow />
        </Link>
        <button type="button" onClick={logout} className={`flex items-center justify-between border-t ${line} px-5 py-3 text-left transition-colors hover:bg-ink hover:text-bg md:border-t-0 md:px-8`}>
          Odjava <Arrow />
        </button>
      </div>

      {/* 2. Ključni brojevi */}
      <section className={`grid border-b ${line} sm:grid-cols-2 xl:grid-cols-4`}>
        <div className="bg-cobalt px-5 py-8 text-bg md:px-8">
          <p className="label">Ugovoreni rabat</p>
          <p className="num mt-6 text-[clamp(72px,8vw,140px)] leading-[0.85]">{Math.round(d * 100)}%</p>
          <p className="mt-4 text-[11px] opacity-80">na sve artikle iz kataloga</p>
        </div>
        <div className={`border-b ${line} px-5 py-8 sm:border-b-0 sm:border-r xl:border-r md:px-8`}>
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
        <div className={`border-t ${line} px-5 py-8 sm:border-r sm:border-t xl:border-t-0 md:px-8`}>
          <p className="label opacity-50">Valuta plaćanja</p>
          <p className="num mt-6 text-[clamp(72px,8vw,140px)] leading-[0.85]">{partner.paymentDays}</p>
          <p className="mt-4 text-[11px] opacity-60">dana, odgođeno plaćanje</p>
        </div>
        <div className={`border-t ${line} px-5 py-8 sm:border-t xl:border-t-0 md:px-8`}>
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

      {/* 4. Potrošnja + skica */}
      <section className={`grid border-y ${line} lg:grid-cols-[1fr_1fr_.9fr]`}>
        {[
          { title: 'Potrošnja po gradilištu', rows: perSite, max: maxSite, bar: 'bg-cobalt' },
          { title: 'Potrošnja po grupi artikala', rows: perCategory, max: maxCat, bar: 'bg-ink' },
        ].map((c) => (
          <div key={c.title} className={`border-b ${line} px-5 py-8 lg:border-b-0 lg:border-r md:px-8`}>
            <p className="label opacity-50">{c.title}</p>
            <ul className="mt-6 grid gap-5">
              {c.rows.map((r) => (
                <li key={r.name}>
                  <div className="flex justify-between gap-4 text-[11px]">
                    <span>{r.name}</span>
                    <span className="tabular-nums">{money(r.value)}</span>
                  </div>
                  <div className={`mt-2 h-5 border ${line}`}>
                    <div className={`h-full ${c.bar}`} style={{ width: `${Math.max(2, (r.value / c.max) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex flex-col justify-between gap-6 px-5 py-8 md:px-8">
          <p className="label opacity-50">Sistem · Knauf W111</p>
          <UseArt use="pregradni-zid" className="mx-auto w-full max-w-[340px] text-ink" title="Pregradni zid W111" />
          <Link href="/prodavnica#kalkulator" className="flex items-center justify-between border-t border-ink/20 pt-4 text-[11px] hover:text-cobalt">
            Kalkulator utroška <Arrow />
          </Link>
        </div>
      </section>

      {/* 5. Narudžbe */}
      <section className="px-5 pt-[12vh] md:px-10">
        <div className="flex items-end justify-between gap-6 border-b-2 border-ink pb-4">
          <h2 className="display text-[clamp(36px,4.6vw,84px)] !leading-[0.88]">Narudžbe</h2>
          <span className="num text-[clamp(36px,4.6vw,84px)] leading-[0.88] opacity-20">{String(orders.length).padStart(2, '0')}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[11.5px]">
            <thead>
              <tr className={`border-b ${line} opacity-50`}>
                {['Broj', 'Datum', 'Gradilište', 'Isporuka', 'Status', 'Iznos'].map((h, i) => (
                  <th key={h} className={`py-3 font-medium ${i === 5 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.no} className={`border-b ${line} transition-colors hover:bg-ink/[.04]`}>
                  <td className="py-4 font-semibold">{o.no}</td>
                  <td className="py-4 tabular-nums">{dateAgo(o.daysAgo)}</td>
                  <td className="py-4">{o.site?.name ?? '—'}</td>
                  <td className="py-4">{o.delivery === 'kran' ? 'Kamion sa kranom' : 'Standardna'}</td>
                  <td className="py-4">
                    <span className={`inline-block px-2 py-1 ${o.status === 'Isporučena' ? 'border border-ink/30' : 'bg-cobalt text-bg'}`}>{o.status}</span>
                  </td>
                  <td className="num py-4 text-right text-[15px]">{money(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Fakture */}
      <section className="px-5 pb-[12vh] pt-[12vh] md:px-10">
        <div className="flex items-end justify-between gap-6 border-b-2 border-ink pb-4">
          <h2 className="display text-[clamp(36px,4.6vw,84px)] !leading-[0.88]">Fakture</h2>
          <span className="text-[11px] opacity-60">Otvoreno {unpaid.length} · {money(unpaidSum)}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[11.5px]">
            <thead>
              <tr className={`border-b ${line} opacity-50`}>
                {['Broj', 'Izdata', 'Dospijeće', 'Status', 'Iznos'].map((h, i) => (
                  <th key={h} className={`py-3 font-medium ${i === 4 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partner.invoices.map((inv) => {
                const dueIn = partner.paymentDays - inv.issuedDaysAgo
                const status = inv.paid ? 'Plaćena' : dueIn < 0 ? 'Dospjela' : 'Otvorena'
                return (
                  <tr key={inv.no} className={`border-b ${line}`}>
                    <td className="py-4 font-semibold">{inv.no}</td>
                    <td className="py-4 tabular-nums">{dateAgo(inv.issuedDaysAgo)}</td>
                    <td className="py-4 tabular-nums">{dateAgo(-dueIn)}</td>
                    <td className="py-4">
                      <span className={`inline-block px-2 py-1 ${status === 'Plaćena' ? 'opacity-50' : status === 'Dospjela' ? 'bg-ink text-bg' : 'bg-cobalt text-bg'}`}>{status}</span>
                    </td>
                    <td className="num py-4 text-right text-[15px]">{money(inv.amount)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Predračun iz korpe — tamni panel */}
      <section className="grid bg-char text-bg md:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col justify-between gap-10 px-5 py-[9vh] md:border-r md:border-bg/15 md:px-10">
          <p className="label opacity-60">Predračun iz korpe · CPQ</p>
          {cartCount(cart) ? (
            <>
              <div>
                <p className="num text-[clamp(56px,7vw,128px)] leading-[0.85]">{money(q.total)}</p>
                <p className="mt-5 text-[11px] opacity-70">
                  {q.lines.length} stavki · rabat {Math.round(d * 100)}% · ušteda {money(q.savings)} · masa {(q.kg / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 })} t
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Cta href="/portal/predracun" className="[--cta-fill:var(--cobalt)] [--cta-ink:var(--bg)]">
                  Predračun
                </Cta>
                <Cta href="/prodavnica">Katalog</Cta>
              </div>
            </>
          ) : (
            <>
              <p className="display text-[clamp(36px,4.4vw,80px)] !leading-[0.9]">Korpa je prazna</p>
              <div className="flex flex-wrap gap-3">
                <Cta href="/prodavnica#kalkulator" className="[--cta-fill:var(--cobalt)] [--cta-ink:var(--bg)]">
                  Kalkulator
                </Cta>
                <Cta href="/prodavnica">Katalog</Cta>
              </div>
            </>
          )}
        </div>
        <figure data-curtain className="relative min-h-[40vh] overflow-hidden">
          <img src="/shop2/hero.webp" alt="Palete gips-kartonskih ploča na skladištu" className="absolute inset-0 h-full w-full object-cover opacity-90" />
          <figcaption className="absolute bottom-0 left-0 bg-cobalt px-4 py-2 text-[11px] text-bg">Skladište Nenada Kostića 151 · zalihe iz Pantheon ERP-a (demo)</figcaption>
        </figure>
      </section>
    </div>
  )
}

export default function PortalClient() {
  const { partner, mode } = useB2B()
  if (partner && mode === 'b2b') return <Dashboard partner={partner} />
  return <Landing />
}
