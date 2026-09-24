'use client'

import { useState } from 'react'
import { useLenis } from 'lenis/react'
import { COLORS } from '@/lib/content'
import { COMPANY, TERMS } from '@/lib/company'
import {
  AVAIL_LABEL,
  CATEGORIES,
  DEFAULT_FILTERS,
  MATERIALS,
  PRODUCTS,
  applyFilters,
  categoryLabel,
  formatNumber,
  formatPrice,
  formatStock,
  productById,
} from '@/lib/shop'
import { scrollToId } from '@/lib/nav'
import ShopLink from './ShopLink'
import { AvailDot, ProductImage } from './parts'
import { useShop } from './ShopProvider'

// Sadržaj panela (desna traka): korpa, narudžba, sačuvano, poređenje, pregled artikla, pretraga, uzorci, upit.
// Ništa ovdje ne šalje podatke negdje: prodavnica još nije povezana, pa se to jasno kaže (vidi `NotConnected`).

const CTA = { ['--acc' as string]: COLORS.why } as React.CSSProperties
const muted = { color: COLORS.base }

export function PanelLayout({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  const { closePanel } = useShop()
  return (
    <div className="flex h-full flex-col text-ink">
      <div className="flex items-center justify-between border-b border-ink/15 px-8 py-6 max-sm:px-5">
        <h2 className="lbl">{title}</h2>
        <button type="button" data-hover className="lbl cursor-pointer" onClick={closePanel}>
          Zatvori
        </button>
      </div>
      <div data-lenis-prevent className="flex-1 overflow-y-auto px-8 py-8 max-sm:px-5">
        {children}
      </div>
      {footer && <div className="border-t border-ink/15 px-8 py-6 max-sm:px-5">{footer}</div>}
    </div>
  )
}

function Thumb({ p, className = '' }: { p: Parameters<typeof ProductImage>[0]['p']; className?: string }) {
  return <ProductImage p={p} reveal={false} className={className} />
}

// Količina u koracima pakovanja (npr. ploča 2,5 m²).
function Qty({ value, step = 1, unit, onChange }: { value: number; step?: number; unit?: string; onChange: (n: number) => void }) {
  const round = (n: number) => Math.round(n * 100) / 100
  return (
    <div className="lbl inline-flex items-center border border-ink/40">
      <button type="button" aria-label="Smanji količinu" disabled={value <= step} className="size-9 cursor-pointer disabled:opacity-30" onClick={() => onChange(round(value - step))}>
        −
      </button>
      <span className="min-w-9 px-1 text-center tabular-nums normal-case" aria-live="polite">
        {formatNumber(value)}
        {unit ? ` ${unit}` : ''}
      </span>
      <button type="button" aria-label="Povećaj količinu" className="size-9 cursor-pointer" onClick={() => onChange(round(value + step))}>
        +
      </button>
    </div>
  )
}

function Empty({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="max-w-[30ch] pt-6">
      <p className="copy-l">{title}</p>
      <p className="copy mt-4">{text}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  )
}

// Zajednička poruka: obrazac je popunjen ispravno, ali sajt još ne može da ga pošalje.
function NotConnected({ what, onBack }: { what: string; onBack: () => void }) {
  return (
    <div role="status" className="pt-6">
      <p className="copy-l">{what} još ne može biti poslat.</p>
      <p className="copy mt-4">
        Prodavnica je u pripremi i nije povezana sa sistemom narudžbi, pa ništa nije poslato niti naplaćeno. Do tada nas možete
        kontaktirati direktno, a naš tim će vam pomoći.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {COMPANY.phoneHref && (
          <a href={COMPANY.phoneHref} className="pill pill-solid" style={CTA}>
            Pozovite {COMPANY.phone}
          </a>
        )}
        <button type="button" className="pill" onClick={onBack}>
          Nazad
        </button>
      </div>
    </div>
  )
}

function useGoTo() {
  const { closePanel } = useShop()
  const lenis = useLenis()
  // Lenis je dok je panel otvoren zaustavljen; skrola se tek nakon zatvaranja.
  return (id: string) => {
    closePanel()
    setTimeout(() => scrollToId(lenis, id), 80)
  }
}

// ---------- korpa ----------

export function CartView() {
  const { cart, count, subtotal, setQty, remove, openPanel, closePanel } = useShop()
  const goTo = useGoTo()
  const remaining = Math.max(0, TERMS.freeDeliveryFrom - subtotal)
  const pct = Math.min(100, (subtotal / TERMS.freeDeliveryFrom) * 100)

  if (!cart.length) {
    return (
      <PanelLayout title="Korpa">
        <Empty
          title="Korpa je prazna."
          text="Dodajte artikle iz kataloga, pa se vratite ovdje."
          action={
            <button type="button" className="pill pill-solid" style={CTA} onClick={() => goTo('katalog')}>
              Pogledaj katalog
            </button>
          }
        />
      </PanelLayout>
    )
  }

  return (
    <PanelLayout
      title={`Korpa (${count})`}
      footer={
        <>
          <div className="flex items-baseline justify-between">
            <span className="lbl">Ukupno</span>
            <span className="copy-l">{formatPrice(subtotal)}</span>
          </div>
          <p className="lbl mt-2" style={muted}>
            Cijene su u KM, sa PDV-om. Dostava i istovar kranom obračunavaju se po zoni i potvrđuju prije obrade narudžbe.
          </p>
          <button type="button" className="pill pill-solid mt-5 w-full" style={CTA} onClick={() => openPanel({ kind: 'checkout' })}>
            Nastavi na narudžbu
          </button>
          <button type="button" className="lbl link-u mx-auto mt-4 block cursor-pointer" onClick={closePanel}>
            Nastavi kupovinu
          </button>
        </>
      }
    >
      <p className="copy-l">Vaša korpa</p>

      <div className="mt-6">
        <p className="lbl" style={muted}>
          {remaining > 0 ? `Još ${formatPrice(remaining)} do besplatne dostave` : 'Besplatna dostava je uključena'}
        </p>
        <div className="mt-3 h-px bg-ink/20">
          <div className="h-px transition-[width] duration-700 [transition-timing-function:var(--ease-expo)]" style={{ width: `${pct}%`, background: COLORS.why, height: 2, marginTop: -0.5 }} />
        </div>
      </div>

      <ul className="mt-8 divide-y divide-ink/15 border-y border-ink/15">
        {cart.map((l) => {
          const p = productById(l.id)
          if (!p) return null
          return (
            <li key={l.id} className="flex gap-4 py-5">
              <Thumb p={p} className="size-[84px] shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col">
                <button type="button" className="copy cursor-pointer text-left" onClick={() => openPanel({ kind: 'product', id: p.id })}>
                  {p.name}
                </button>
                <p className="lbl mt-1" style={muted}>
                  {formatPrice(p.price)} / {p.unit}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Qty value={l.qty} step={p.step} unit={p.unit} onChange={(n) => setQty(l.id, n)} />
                  <p className="copy">{formatPrice(p.price * l.qty)}</p>
                </div>
                <button type="button" className="lbl link-u mt-3 cursor-pointer self-start" onClick={() => remove(l.id)}>
                  Ukloni
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </PanelLayout>
  )
}

// ---------- narudžba (checkout) ----------

const Radio = ({ name, value, label, checked, onChange }: { name: string; value: string; label: string; checked: boolean; onChange: () => void }) => (
  <label className="flex cursor-pointer items-center gap-3 py-1.5">
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="size-4 accent-[var(--acc)]" />
    <span className="copy">{label}</span>
  </label>
)

export function CheckoutView() {
  const { cart, subtotal, openPanel } = useShop()
  const [delivery, setDelivery] = useState('dostava')
  const [payment, setPayment] = useState('pouzecem')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <PanelLayout title="Narudžba">
        <NotConnected what="Narudžba" onBack={() => setSent(false)} />
      </PanelLayout>
    )
  }
  if (!cart.length) {
    return (
      <PanelLayout title="Narudžba">
        <Empty title="Korpa je prazna." text="Prije narudžbe dodajte artikle." action={<button type="button" className="pill" onClick={() => openPanel({ kind: 'cart' })}>Nazad na korpu</button>} />
      </PanelLayout>
    )
  }

  return (
    <PanelLayout title="Narudžba">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!agree) return setError('Da biste naručili, potrebno je da prihvatite uslove kupovine.')
          setError(null)
          setSent(true)
        }}
      >
        <p className="copy-l">Podaci za isporuku</p>
        <div className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="lbl" style={muted}>Ime i prezime *</span>
            <input required name="name" autoComplete="name" className="field field-sm" />
          </label>
          <label className="block">
            <span className="lbl" style={muted}>Telefon *</span>
            <input required name="tel" type="tel" autoComplete="tel" className="field field-sm" />
          </label>
          <label className="block">
            <span className="lbl" style={muted}>E-pošta *</span>
            <input required name="email" type="email" autoComplete="email" className="field field-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="lbl" style={muted}>Adresa isporuke *</span>
            <input required name="address" autoComplete="street-address" className="field field-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="lbl" style={muted}>Napomena</span>
            <textarea name="note" className="field field-sm" placeholder="Npr. sprat, pristup vozilu, željeni termin" />
          </label>
        </div>

        <p className="copy-l mt-10">Isporuka</p>
        <div className="mt-3">
          <Radio name="delivery" value="dostava" label="Standardna dostava na adresu" checked={delivery === 'dostava'} onChange={() => setDelivery('dostava')} />
          <Radio name="delivery" value="kran" label="Kamion sa kranom, istovar na etažu" checked={delivery === 'kran'} onChange={() => setDelivery('kran')} />
          <Radio name="delivery" value="preuzimanje" label="Preuzimanje na stovarištu" checked={delivery === 'preuzimanje'} onChange={() => setDelivery('preuzimanje')} />
        </div>

        <p className="copy-l mt-8">Plaćanje</p>
        <div className="mt-3">
          <Radio name="payment" value="pouzecem" label="Pri preuzimanju ili isporuci" checked={payment === 'pouzecem'} onChange={() => setPayment('pouzecem')} />
          <Radio name="payment" value="racun" label="Uplata na račun (predračun)" checked={payment === 'racun'} onChange={() => setPayment('racun')} />
        </div>

        <div className="mt-10 border-t border-ink/15 pt-6">
          <ul className="space-y-2">
            {cart.map((l) => {
              const p = productById(l.id)
              return p ? (
                <li key={l.id} className="copy flex justify-between gap-4">
                  <span>
                    {formatNumber(l.qty)} {p.unit} · {p.name}
                  </span>
                  <span className="shrink-0">{formatPrice(p.price * l.qty)}</span>
                </li>
              ) : null
            })}
          </ul>
          <p className="copy-l mt-5 flex justify-between">
            <span>Ukupno</span>
            <span>{formatPrice(subtotal)}</span>
          </p>
          <p className="lbl mt-2" style={muted}>
            Cijene su u KM, sa PDV-om. Dostava i istovar kranom obračunavaju se po zoni i potvrđuju prije obrade narudžbe.
          </p>
        </div>

        <label className="mt-8 flex cursor-pointer items-start gap-3">
          <input type="checkbox" className="mt-[3px] size-4 shrink-0 accent-[var(--acc)]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span className="copy">
            Pročitao/la sam i prihvatam{' '}
            <ShopLink href="/uslovi-kupovine" className="link-u" target="_blank">
              Uslove kupovine
            </ShopLink>{' '}
            i{' '}
            <ShopLink href="/politika-privatnosti" className="link-u" target="_blank">
              Politiku privatnosti
            </ShopLink>
            , i upoznat/a sam sa{' '}
            <ShopLink href="/odustanak-od-ugovora" className="link-u" target="_blank">
              pravom na odustanak
            </ShopLink>
            .
          </span>
        </label>
        {error && (
          <p role="alert" className="lbl mt-4">
            {error}
          </p>
        )}

        {/* Naziv dugmeta jasno kaže da narudžba obavezuje na plaćanje. */}
        <button type="submit" className="pill pill-solid mt-8 w-full" style={CTA}>
          Naručujem s obavezom plaćanja
        </button>
        <button type="button" className="lbl link-u mx-auto mt-4 block cursor-pointer" onClick={() => openPanel({ kind: 'cart' })}>
          Nazad na korpu
        </button>
      </form>
    </PanelLayout>
  )
}

// ---------- sačuvano ----------

export function SavedView() {
  const { saved, toggleSaved, add, openPanel } = useShop()
  const goTo = useGoTo()
  const items = saved.map(productById).filter(Boolean) as NonNullable<ReturnType<typeof productById>>[]

  return (
    <PanelLayout title={`Sačuvano (${items.length})`}>
      {items.length === 0 ? (
        <Empty
          title="Ništa nije sačuvano."
          text="Sačuvajte artikle da ih kasnije lakše nađete."
          action={
            <button type="button" className="pill pill-solid" style={CTA} onClick={() => goTo('katalog')}>
              Pogledaj katalog
            </button>
          }
        />
      ) : (
        <ul className="divide-y divide-ink/15 border-y border-ink/15">
          {items.map((p) => (
            <li key={p.id} className="flex gap-4 py-5">
              <Thumb p={p} className="size-[84px] shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col">
                <button type="button" className="copy cursor-pointer text-left" onClick={() => openPanel({ kind: 'product', id: p.id })}>
                  {p.name}
                </button>
                <p className="lbl mt-1" style={muted}>
                  {formatPrice(p.price)} / {p.unit}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <button type="button" className="pill" onClick={() => add(p.id)}>
                    Dodaj u korpu
                  </button>
                  <button type="button" className="lbl link-u cursor-pointer" onClick={() => toggleSaved(p.id)}>
                    Ukloni
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelLayout>
  )
}

// ---------- poređenje ----------

export function CompareView() {
  const { compare, toggleCompare, add } = useShop()
  const goTo = useGoTo()
  const items = compare.map(productById).filter(Boolean) as NonNullable<ReturnType<typeof productById>>[]

  const rows: { label: string; get: (p: (typeof items)[number]) => React.ReactNode }[] = [
    { label: 'Cijena', get: (p) => `${formatPrice(p.price)} / ${p.unit}` },
    { label: 'Kategorija', get: (p) => categoryLabel(p.category) },
    { label: 'Brend', get: (p) => p.brand },
    { label: 'Na stanju', get: (p) => `${AVAIL_LABEL[p.avail]} · ${formatStock(p)}` },
    { label: 'Dimenzije', get: (p) => p.specs.dimenzije },
    { label: 'Pakovanje', get: (p) => p.specs.pakovanje },
    { label: 'Primjena', get: (p) => p.specs.primjena },
  ]

  return (
    <PanelLayout title={`Poređenje (${items.length})`}>
      {items.length === 0 ? (
        <Empty
          title="Nema artikala za poređenje."
          text="Na kartici artikla odaberite “Poredi” (do tri artikla) da ih vidite jedan uz drugi."
          action={
            <button type="button" className="pill pill-solid" style={CTA} onClick={() => goTo('katalog')}>
              Pogledaj katalog
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto" data-lenis-prevent-wheel>
          <table className="w-full min-w-[520px] table-fixed border-collapse text-left">
            <thead>
              <tr>
                <th className="w-[22%]" />
                {items.map((p) => (
                  <th key={p.id} className="p-2 pb-5 align-top font-normal">
                    <Thumb p={p} className="aspect-[4/5] w-full" />
                    <p className="copy mt-3">{p.name}</p>
                    <button type="button" className="lbl link-u mt-2 cursor-pointer" onClick={() => toggleCompare(p.id)}>
                      Ukloni
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-ink/15">
                  <th className="lbl py-3 pr-2 align-top font-normal" style={muted}>
                    {r.label}
                  </th>
                  {items.map((p) => (
                    <td key={p.id} className="copy p-2 py-3 align-top">
                      {r.get(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-ink/15">
                <th />
                {items.map((p) => (
                  <td key={p.id} className="p-2 py-4">
                    <button type="button" className="pill" onClick={() => add(p.id)}>
                      U korpu
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </PanelLayout>
  )
}

// ---------- pregled artikla ----------

export function ProductView({ id }: { id: string }) {
  const { add, saved, toggleSaved, compare, toggleCompare, closePanel } = useShop()
  const goTo = useGoTo()
  const p = productById(id)
  const [qty, setQty] = useState(p?.step ?? 1)

  if (!p) {
    return (
      <PanelLayout title="Artikal">
        <Empty title="Artikal nije pronađen." text="Moguće je da više nije u ponudi." />
      </PanelLayout>
    )
  }

  return (
    <PanelLayout
      title="Artikal"
      footer={
        <div className="flex flex-wrap items-center gap-4">
          <Qty value={qty} step={p.step} unit={p.unit} onChange={setQty} />
          <button
            type="button"
            className="pill pill-solid flex-1"
            style={CTA}
            onClick={() => {
              add(p.id, qty)
              closePanel()
            }}
          >
            Dodaj u korpu · {formatPrice(p.price * qty)}
          </button>
        </div>
      }
    >
      <Thumb p={p} className="aspect-[4/3] w-full" />
      <div className="lbl mt-5 flex justify-between gap-3" style={muted}>
        <span>{categoryLabel(p.category)}</span>
        <span>{p.brand}</span>
      </div>
      <h3 className="copy-l mt-3">{p.name}</h3>
      <p className="copy-l mt-4">
        {formatPrice(p.price)}
        <span className="lbl ml-2" style={muted}>
          / {p.unit}, sa PDV-om
        </span>
      </p>
      <p className="lbl mt-3">
        <AvailDot avail={p.avail} />
        {AVAIL_LABEL[p.avail]} · {formatStock(p)}
        <span style={muted}> · stanje iz Pantheona</span>
      </p>
      <p className="copy mt-6">{p.summary}</p>

      <dl className="mt-8 border-t border-ink/15">
        {[
          ['Šifra', p.id],
          ['Dimenzije', p.specs.dimenzije],
          ['Pakovanje', p.specs.pakovanje],
          ['Primjena', p.specs.primjena],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[34%_1fr] gap-4 border-b border-ink/15 py-3">
            <dt className="lbl pt-[3px]" style={muted}>
              {k}
            </dt>
            <dd className="copy">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="pill" aria-pressed={saved.includes(p.id)} onClick={() => toggleSaved(p.id)}>
          {saved.includes(p.id) ? 'Sačuvano ✓' : 'Sačuvaj'}
        </button>
        <button type="button" className="pill" aria-pressed={compare.includes(p.id)} onClick={() => toggleCompare(p.id)}>
          {compare.includes(p.id) ? 'U poređenju ✓' : 'Poredi'}
        </button>
        <button type="button" className="pill" onClick={() => goTo('ponuda')}>
          Zatraži ponudu
        </button>
      </div>
    </PanelLayout>
  )
}

// ---------- pretraga ----------

export function SearchView() {
  const { openPanel, setFilters, resetFilters } = useShop()
  const goTo = useGoTo()
  const [q, setQ] = useState('')
  const term = q.trim()
  const results = term.length > 1 ? applyFilters(PRODUCTS, { ...DEFAULT_FILTERS, q: term }).slice(0, 8) : []

  return (
    <PanelLayout title="Pretraga">
      <input
        autoFocus
        type="search"
        className="field"
        placeholder="Artikal, šifra, brend ili vrsta radova…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Pretraga artikala"
      />

      {term.length < 2 ? (
        <div className="mt-10">
          <p className="lbl" style={muted}>
            Ili počnite od grupe
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="pill"
                onClick={() => {
                  resetFilters()
                  setFilters({ cat: c.id })
                  goTo('katalog')
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <Empty title="Nema rezultata." text="Pokušajte sa drugom riječi ili pogledajte cijeli katalog." action={<button type="button" className="pill" onClick={() => { resetFilters(); goTo('katalog') }}>Cijeli katalog</button>} />
      ) : (
        <ul className="mt-8 divide-y divide-ink/15 border-y border-ink/15">
          {results.map((p) => (
            <li key={p.id}>
              <button type="button" className="flex w-full cursor-pointer items-center gap-4 py-4 text-left" onClick={() => openPanel({ kind: 'product', id: p.id })}>
                <Thumb p={p} className="size-[56px] shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="copy block">{p.name}</span>
                  <span className="lbl mt-1 block" style={muted}>
                    {categoryLabel(p.category)}
                  </span>
                </span>
                <span className="copy shrink-0">{formatPrice(p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelLayout>
  )
}

// ---------- uzorci i upit ----------

export function FormView({ kind }: { kind: 'samples' | 'inquiry' }) {
  const [picked, setPicked] = useState<string[]>([])
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const samples = kind === 'samples'
  const title = samples ? 'Uzorci materijala' : 'Upit za izvođače i projekte'

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 5 ? p : [...p, id]))
  }

  if (sent) {
    return (
      <PanelLayout title={title}>
        <NotConnected what={samples ? 'Zahtjev za uzorke' : 'Upit'} onBack={() => setSent(false)} />
      </PanelLayout>
    )
  }

  return (
    <PanelLayout title={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (samples && picked.length === 0) return setError('Odaberite bar jedan materijal.')
          if (!agree) return setError('Potreban je vaš pristanak za obradu podataka.')
          setError(null)
          setSent(true)
        }}
      >
        <p className="copy-l">
          {samples ? 'Odaberite do pet materijala.' : 'Opišite projekat, a mi vraćamo ponudu.'}
        </p>

        {samples && (
          <fieldset className="mt-6">
            <legend className="lbl" style={muted}>
              Materijali ({picked.length}/5)
            </legend>
            <div className="mt-3 grid gap-x-5 sm:grid-cols-2">
              {MATERIALS.map((m) => (
                <label key={m.id} className="flex cursor-pointer items-center gap-3 py-1.5">
                  <input type="checkbox" checked={picked.includes(m.id)} onChange={() => toggle(m.id)} className="size-4 accent-[var(--acc)]" />
                  <span className="copy">{m.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-8 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="lbl" style={muted}>{samples ? 'Ime i prezime *' : 'Firma ili ime i prezime *'}</span>
            <input required autoComplete={samples ? 'name' : 'organization'} className="field field-sm" />
          </label>
          <label className="block">
            <span className="lbl" style={muted}>Telefon *</span>
            <input required type="tel" autoComplete="tel" className="field field-sm" />
          </label>
          <label className="block">
            <span className="lbl" style={muted}>E-pošta *</span>
            <input required type="email" autoComplete="email" className="field field-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="lbl" style={muted}>{samples ? 'Adresa za slanje uzoraka *' : 'Lokacija gradilišta *'}</span>
            <input required autoComplete="street-address" className="field field-sm" />
          </label>
          {!samples && (
            <label className="block sm:col-span-2">
              <span className="lbl" style={muted}>Materijali i količine *</span>
              <textarea required className="field field-sm" placeholder="Npr. Knauf GKB 12,5 mm, 300 m²; CW 75, 120 kom; kamena vuna 50 mm, 150 m²" />
            </label>
          )}
          <label className="block sm:col-span-2">
            <span className="lbl" style={muted}>Napomena</span>
            <textarea className="field field-sm" placeholder={samples ? 'Opišite za šta vam trebaju uzorci' : 'Željeni rok isporuke, uslovi pristupa gradilištu…'} />
          </label>
        </div>

        <label className="mt-8 flex cursor-pointer items-start gap-3">
          <input type="checkbox" className="mt-[3px] size-4 shrink-0 accent-[var(--acc)]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span className="copy">
            Pristajem da {`GRAND COMPANY`} obradi moje podatke radi odgovora na ovaj zahtjev, u skladu sa{' '}
            <ShopLink href="/politika-privatnosti" className="link-u" target="_blank">
              Politikom privatnosti
            </ShopLink>
            .
          </span>
        </label>
        {error && (
          <p role="alert" className="lbl mt-4">
            {error}
          </p>
        )}
        <button type="submit" className="pill pill-solid mt-8 w-full" style={CTA}>
          {samples ? 'Zatraži uzorke' : 'Pošalji upit'}
        </button>
      </form>
    </PanelLayout>
  )
}
