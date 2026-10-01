'use client'

/* eslint-disable @next/next/no-img-element -- fotografije artikala iz /public, već u WebP */

import { useEffect, useMemo, useRef, useState } from 'react'
import { bySku } from '@/gc/gc'
import { addToCart, notify } from '@/lib/cart'
import { gsap } from '@/lib/gsap'
import { recommendCrane, tons } from '@/lib/logistics'
import { calcD112, calcDemit, calcW111, money, qtyLabel } from '@/lib/shop'
import { useBomRows } from './Bom'
import { CeilingVisual, FacadeVisual, PLATE_COLORS, WallVisual } from './visuals'

// Kalkulator materijala (dno prodavnice, #kalkulator) — raspored kao na MT Ponos referenci:
// dvije kartice preko fotografije. Lijevo (tamna) kratko objašnjenje i crtež u razmjeri koji
// prati unos — ploča mijenja boju po tipu (GKB, GKBI, GKF, Diamant). Desno (svijetla) jedan
// tok odozgo nadolje: sistem → mjere (ili površina) → opcije → rezerva → rezultat → u korpu.

type Sys = 'w111' | 'd112' | 'demit'
const SYSTEMS: { id: Sys; label: string; dims: [string, string] }[] = [
  { id: 'w111', label: 'Knauf W111 · pregradni zid', dims: ['Dužina zida', 'Visina zida'] },
  { id: 'd112', label: 'Knauf D112 · spušteni plafon', dims: ['Dužina prostorije', 'Širina prostorije'] },
  { id: 'demit', label: 'DEMIT · kontaktna fasada', dims: ['Dužina fasade', 'Visina fasade'] },
]
const DEFAULTS: Record<Sys, [number, number]> = { w111: [4, 2.6], d112: [5, 4], demit: [10, 6] }
const PLATES = [
  { id: 'KNF-001', label: 'GKB · standardna' },
  { id: 'KNF-002', label: 'GKBI · vlagootporna' },
  { id: 'KNF-003', label: 'GKF · vatrootporna' },
  { id: 'KNF-004', label: 'Diamant · tvrda' },
]
const PROFILES = [
  { id: 'PRF-050', label: 'CW 50' },
  { id: 'PRF-075', label: 'CW 75' },
  { id: 'PRF-100', label: 'CW 100' },
]
const EPS = [
  { id: 'ISO-004', label: 'EPS 70 · bijeli' },
  { id: 'ISO-006', label: 'Neopor · grafitni' },
]

const fmt = (n: number, d = 2) => n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d })
// Unos prihvata i zarez i tačku; prazno ili nevažeće = null.
const parse = (s: string) => {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}

// Mjera na crtežu "klizi" do nove vrijednosti umjesto da skoči.
function useTween(target: { a: number; b: number }) {
  const [shown, setShown] = useState(target)
  const ref = useRef({ ...target })
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = gsap.to(ref.current, { a: target.a, b: target.b, duration: reduce ? 0 : 0.6, ease: 'power3.out', onUpdate: () => setShown({ ...ref.current }) })
    return () => {
      t.kill()
    }
  }, [target.a, target.b])
  return shown
}

function Field({ label, value, onChange, placeholder, unit }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; unit: string }) {
  return (
    <label className="calc2-field">
      <span className="calc2-label">
        {label} ({unit})
      </span>
      <input inputMode="decimal" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="calc2-input" />
    </label>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: { id: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <label className="calc2-field">
      <span className="calc2-label">{label}</span>
      <span className="calc2-select">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}

function Check({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="calc2-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block">{label}</span>
        {hint && <span className="calc2-hint">{hint}</span>}
      </span>
    </label>
  )
}

export default function Calculator() {
  const [sys, setSys] = useState<Sys>('w111')
  const [a, setA] = useState(String(DEFAULTS.w111[0]).replace('.', ','))
  const [b, setB] = useState(String(DEFAULTS.w111[1]).replace('.', ','))
  const [area, setArea] = useState('')
  const [plate, setPlate] = useState('KNF-001')
  const [profile, setProfile] = useState('PRF-075')
  const [double, setDouble] = useState(false)
  const [wool, setWool] = useState(true)
  const [eps, setEps] = useState('ISO-004')
  const [reserve, setReserve] = useState(true)
  const [open, setOpen] = useState(false)

  const def = SYSTEMS.find((s) => s.id === sys)!
  const pickSys = (id: Sys) => {
    setSys(id)
    setA(String(DEFAULTS[id][0]).replace('.', ','))
    setB(String(DEFAULTS[id][1]).replace('.', ','))
    setArea('')
  }

  // Mjere: druga mjera (visina / širina) + ili dužina, ili površina direktno (tada dužina = P / druga).
  const second = parse(b) ?? DEFAULTS[sys][1]
  const directArea = parse(area)
  const first = directArea ? directArea / second : (parse(a) ?? DEFAULTS[sys][0])
  // Rezerva za sječenje i otpad: dodaje se na dužinu (norme već uključuju ~5%).
  const k = reserve ? 1.1 : 1

  const result = useMemo(() => {
    if (sys === 'w111')
      return calcW111({ L: first * k, H: second, cladding: double ? 'double' : 'single', plateSku: plate, cwSku: profile, woolSku: wool ? 'ISO-001' : undefined, fillerSku: 'CHM-001' })
    if (sys === 'd112') return calcD112({ L: first * k, W: second, plateSku: plate })
    return calcDemit({ A: first * second * k, epsSku: eps })
  }, [sys, first, second, k, double, plate, profile, wool, eps])

  const { rows, total, retail, kg, discount } = useBomRows(result.items)
  const shown = useTween({ a: first, b: second })
  const net = first * second
  const thumb = bySku(sys === 'demit' ? eps : plate)

  const addAll = () => {
    rows.forEach((r) => addToCart(r.sku, r.qty))
    notify(`${def.label}: spisak je u korpi`, { label: 'Korpa', open: 'cart' })
  }

  return (
    <section id="kalkulator" className="calc2 scroll-mt-24">
      <img src="/editorial/boards-light.webp" alt="" aria-hidden className="calc2-bg" />

      <div className="calc2-grid">
        {/* Lijevo: objašnjenje + crtež u razmjeri */}
        <div className="calc2-card calc2-card--dark">
          <div className="text-center">
            <p className="calc2-label !text-bg/60">Kalkulator materijala</p>
            <h2 className="calc2-title">Unesite mjere i odmah vidite koliko materijala vam treba</h2>
          </div>

          <div className="calc2-visual flex flex-1 items-center" style={{ '--ink': '#f4f1ec' } as React.CSSProperties}>
            {sys === 'w111' && <WallVisual L={shown.a} H={shown.b} plate={plate} wool={wool} double={double} vh={820} />}
            {sys === 'd112' && <CeilingVisual L={shown.a} W={shown.b} plate={plate} vh={820} />}
            {sys === 'demit' && <FacadeVisual L={shown.a} H={shown.b} eps={eps} vh={820} />}
          </div>

          <div className="calc2-legend">
            <span className="tabular-nums">
              {fmt(first, 1)} × {fmt(second, 1)} m = {fmt(net)} m²
            </span>
            {sys !== 'demit' && (
              <span className="flex items-center gap-2">
                <i className="calc2-swatch" style={{ background: (PLATE_COLORS[plate] ?? PLATE_COLORS['KNF-001']).color }} />
                {PLATES.find((p) => p.id === plate)?.label}
              </span>
            )}
          </div>
        </div>

        {/* Desno: jedan tok unosa i rezultat */}
        <div className="calc2-card calc2-card--light">
          <div className="flex items-end gap-4">
            <div className="min-w-0 flex-1">
              <Select label="Odaberite sistem" value={sys} onChange={(v) => pickSys(v as Sys)} options={SYSTEMS} />
            </div>
            {thumb?.image && <img src={thumb.image} alt="" className="calc2-thumb" />}
          </div>

          <p className="calc2-sub">Mjere</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label={def.dims[0]} unit="m" value={a} onChange={(v) => { setA(v); setArea('') }} placeholder={`npr. ${DEFAULTS[sys][0]}`} />
            <Field label={def.dims[1]} unit="m" value={b} onChange={setB} placeholder={`npr. ${DEFAULTS[sys][1]}`} />
          </div>
          <Field label="Ili unesite površinu direktno" unit="m²" value={area} onChange={setArea} placeholder="npr. 45" />

          <div className="mt-2 grid grid-cols-2 gap-4">
            {sys !== 'demit' && <Select label="Ploča" value={plate} onChange={setPlate} options={PLATES} />}
            {sys === 'w111' && <Select label="Profil" value={profile} onChange={setProfile} options={PROFILES} />}
            {sys === 'demit' && <Select label="Stiropor" value={eps} onChange={setEps} options={EPS} />}
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {sys === 'w111' && <Check checked={double} onChange={setDouble} label="Dvostruka obloga" hint="Dva sloja ploča sa svake strane — bolja zvučna i protivpožarna zaštita" />}
            {sys === 'w111' && <Check checked={wool} onChange={setWool} label="Kamena vuna u zidu" hint="Toplotna i zvučna izolacija između profila" />}
            <Check checked={reserve} onChange={setReserve} label="+ Dodaj 10% rezerve" hint="Preporučujemo zbog sječenja i otpada pri ugradnji" />
          </div>

          <dl className="calc2-results">
            <div>
              <dt>Površina</dt>
              <dd>
                {fmt(net)} <small>m²</small>
              </dd>
            </div>
            <div>
              <dt>Artikala</dt>
              <dd>{rows.length}</dd>
            </div>
            <div>
              <dt>Masa tereta</dt>
              <dd>
                {tons(kg)} <small>t</small>
              </dd>
            </div>
            <div>
              <dt>Ukupno sa PDV-om</dt>
              <dd>
                {money(total)}
                {discount > 0 && <small className="ml-2 line-through opacity-60">{money(retail)}</small>}
              </dd>
            </div>
          </dl>
          {recommendCrane(kg) && <p className="calc2-hint mt-2">Preporuka: dostava kamionom sa kranom.</p>}

          <button type="button" className="calc2-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? 'Sakrij spisak materijala' : 'Prikaži spisak materijala'}
            <span aria-hidden>{open ? '−' : '+'}</span>
          </button>
          {open && (
            <ul className="calc2-list">
              {rows.map((r) => (
                <li key={r.sku}>
                  <span className="min-w-0">
                    <span className="block truncate">{r.name}</span>
                    <span className="calc2-hint">{r.note}</span>
                  </span>
                  <span className="shrink-0 text-right tabular-nums">
                    {qtyLabel(r.qty, r.unit)}
                    <span className="calc2-hint block">{money(r.price)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button type="button" onClick={addAll} className="calc2-cta">
            <span>Dodaj sve u korpu · {money(total)}</span>
            <span aria-hidden>→</span>
          </button>
          <p className="calc2-hint mt-3">Orijentaciono, po normi proizvođača. Za veće projekte pošaljite nacrt — vratimo tačnu specifikaciju.</p>
        </div>
      </div>
    </section>
  )
}
