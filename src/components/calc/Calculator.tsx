'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { addToCart, notify } from '@/lib/cart'
import { gsap } from '@/lib/gsap'
import { recommendCrane, tons } from '@/lib/logistics'
import { calcD112, calcDemit, calcW111, money, qtyLabel } from '@/lib/shop'
import { useBomRows } from './Bom'
import { CeilingVisual, FacadeVisual, PLATE_COLORS, WallVisual } from './visuals'

// Kalkulator materijala (dno prodavnice, #kalkulator).
// Gore info blok: šta kalkulator radi i na čemu se zasniva. Ispod jedna kartica:
// sistem (tabovi) → lijevo mjere i materijal → desno crtež u razmjeri, ključni brojevi,
// spisak materijala sa cijenama i jedno dugme "Dodaj sve u korpu".

type Sys = 'w111' | 'd112' | 'demit'
const SYSTEMS: { id: Sys; code: string; name: string; dims: [string, string] }[] = [
  { id: 'w111', code: 'Knauf W111', name: 'Pregradni zid', dims: ['Dužina zida', 'Visina zida'] },
  { id: 'd112', code: 'Knauf D112', name: 'Spušteni plafon', dims: ['Dužina prostorije', 'Širina prostorije'] },
  { id: 'demit', code: 'DEMIT', name: 'Kontaktna fasada', dims: ['Dužina fasade', 'Visina fasade'] },
]
const DEFAULTS: Record<Sys, [number, number]> = { w111: [4, 2.6], d112: [5, 4], demit: [10, 6] }
const PLATES = [
  { id: 'KNF-001', label: 'GKB', note: 'standardna' },
  { id: 'KNF-002', label: 'GKBI', note: 'vlagootporna' },
  { id: 'KNF-003', label: 'GKF', note: 'vatrootporna' },
  { id: 'KNF-004', label: 'Diamant', note: 'tvrda' },
]
const PROFILES = [
  { id: 'PRF-050', label: 'CW 50' },
  { id: 'PRF-075', label: 'CW 75' },
  { id: 'PRF-100', label: 'CW 100' },
]
const EPS = [
  { id: 'ISO-004', label: 'EPS 70 bijeli' },
  { id: 'ISO-006', label: 'Neopor grafitni' },
]
const FACTS = [
  ['Po normi proizvođača', 'Utrošak po Knauf W111, D112 i DEMIT sistemima, sa otpadom.'],
  ['Stvarne cijene', 'Cijene iz kataloga sa PDV-om. Prijavljeni B2B partneri vide svoj rabat.'],
  ['Masa i dostava', 'Težina tereta se sabere, a preko tone predlažemo kamion sa kranom.'],
]

const fmt = (n: number, d = 2) => n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d })
const parse = (s: string) => {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}
const str = (n: number) => String(n).replace('.', ',')

// Mjera na crtežu "klizi" do nove vrijednosti umjesto da skoči.
function useTween(target: { a: number; b: number }) {
  const [shown, setShown] = useState(target)
  const ref = useRef({ ...target })
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = gsap.to(ref.current, { a: target.a, b: target.b, duration: reduce ? 0 : 0.5, ease: 'power3.out', onUpdate: () => setShown({ ...ref.current }) })
    return () => {
      t.kill()
    }
  }, [target.a, target.b])
  return shown
}

function Num({ label, unit, value, onChange, placeholder }: { label: string; unit: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="calc3-field">
      <span className="calc3-label">{label}</span>
      <span className="calc3-num">
        <input inputMode="decimal" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        <i>{unit}</i>
      </span>
    </label>
  )
}

function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="calc3-field">
      <span className="calc3-label">{label}</span>
      <div className="calc3-seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={o.id === value} onClick={() => onChange(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <label className="calc3-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block">{label}</span>
        <span className="calc3-hint">{hint}</span>
      </span>
    </label>
  )
}

export default function Calculator() {
  const [sys, setSys] = useState<Sys>('w111')
  const [a, setA] = useState(str(DEFAULTS.w111[0]))
  const [b, setB] = useState(str(DEFAULTS.w111[1]))
  const [area, setArea] = useState('')
  const [plate, setPlate] = useState('KNF-001')
  const [profile, setProfile] = useState('PRF-075')
  const [double, setDouble] = useState(false)
  const [wool, setWool] = useState(true)
  const [eps, setEps] = useState('ISO-004')
  const [reserve, setReserve] = useState(true)

  const def = SYSTEMS.find((s) => s.id === sys)!
  const pickSys = (id: Sys) => {
    setSys(id)
    setA(str(DEFAULTS[id][0]))
    setB(str(DEFAULTS[id][1]))
    setArea('')
  }

  // Druga mjera (visina / širina) + ili dužina, ili površina direktno (tada dužina = P / druga mjera).
  const second = parse(b) ?? DEFAULTS[sys][1]
  const directArea = parse(area)
  const first = directArea ? directArea / second : (parse(a) ?? DEFAULTS[sys][0])
  const k = reserve ? 1.1 : 1 // rezerva za sječenje i otpad

  const result = useMemo(() => {
    if (sys === 'w111')
      return calcW111({ L: first * k, H: second, cladding: double ? 'double' : 'single', plateSku: plate, cwSku: profile, woolSku: wool ? 'ISO-001' : undefined, fillerSku: 'CHM-001' })
    if (sys === 'd112') return calcD112({ L: first * k, W: second, plateSku: plate })
    return calcDemit({ A: first * second * k, epsSku: eps })
  }, [sys, first, second, k, double, plate, profile, wool, eps])

  const { rows, total, retail, kg, discount } = useBomRows(result.items)
  const shown = useTween({ a: first, b: second })
  const net = first * second

  const addAll = () => {
    rows.forEach((r) => addToCart(r.sku, r.qty))
    notify(`${def.code} ${def.name}: spisak je u korpi`, { label: 'Korpa', open: 'cart' })
  }

  return (
    <section id="kalkulator" className="calc3 scroll-mt-24">
      {/* Info blok */}
      <div className="calc3-info">
        <div>
          <p className="calc3-label">Kalkulator materijala</p>
          <h2 className="display mt-4 text-[clamp(34px,4.4vw,72px)] !leading-[0.95]">Koliko materijala vam treba?</h2>
          <p className="mt-6 max-w-[52ch] text-[12.5px] leading-[1.7] opacity-70">
            Odaberite sistem i unesite mjere. Dobijate spisak — ploče, profile, vunu, masu, vijke i traku — sa cijenom i težinom
            tereta, i sve jednim klikom u korpu.
          </p>
        </div>
        <ol className="calc3-facts">
          {FACTS.map(([t, d], i) => (
            <li key={t}>
              <span className="calc3-facts__n">0{i + 1}</span>
              <span>
                <span className="block font-medium">{t}</span>
                <span className="calc3-hint">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Kalkulator */}
      <div className="calc3-card">
        <div className="calc3-tabs" role="tablist" aria-label="Sistem">
          {SYSTEMS.map((s) => (
            <button key={s.id} type="button" role="tab" aria-selected={s.id === sys} onClick={() => pickSys(s.id)}>
              <span className="calc3-tabs__code">{s.code}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>

        <div className="calc3-body">
          {/* Unos */}
          <div className="calc3-inputs">
            <p className="calc3-step">1 · Mjere</p>
            <div className="grid grid-cols-2 gap-3">
              <Num label={def.dims[0]} unit="m" value={a} onChange={(v) => { setA(v); setArea('') }} placeholder={str(DEFAULTS[sys][0])} />
              <Num label={def.dims[1]} unit="m" value={b} onChange={setB} placeholder={str(DEFAULTS[sys][1])} />
            </div>
            <Num label="Ili površina direktno" unit="m²" value={area} onChange={setArea} placeholder="npr. 45" />

            <p className="calc3-step">2 · Materijal</p>
            {sys !== 'demit' && (
              <div className="calc3-field">
                <span className="calc3-label">Ploča</span>
                <div className="calc3-plates" role="radiogroup" aria-label="Ploča">
                  {PLATES.map((p) => (
                    <button key={p.id} type="button" role="radio" aria-checked={p.id === plate} onClick={() => setPlate(p.id)}>
                      <i style={{ background: PLATE_COLORS[p.id].color }} />
                      <span>
                        <span className="block font-medium">{p.label}</span>
                        <span className="calc3-hint">{p.note}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {sys === 'w111' && <Seg label="Profil" value={profile} options={PROFILES} onChange={setProfile} />}
            {sys === 'demit' && <Seg label="Stiropor" value={eps} options={EPS} onChange={setEps} />}

            <p className="calc3-step">3 · Opcije</p>
            <div className="flex flex-col gap-3">
              {sys === 'w111' && <Toggle checked={double} onChange={setDouble} label="Dvostruka obloga" hint="Dva sloja ploča sa svake strane" />}
              {sys === 'w111' && <Toggle checked={wool} onChange={setWool} label="Kamena vuna u zidu" hint="Toplotna i zvučna izolacija" />}
              <Toggle checked={reserve} onChange={setReserve} label="+10% rezerve" hint="Za sječenje i otpad pri ugradnji" />
            </div>
          </div>

          {/* Rezultat */}
          <div className="calc3-output">
            <div className="calc3-visual">
              {sys === 'w111' && <WallVisual L={shown.a} H={shown.b} plate={plate} wool={wool} double={double} vh={400} />}
              {sys === 'd112' && <CeilingVisual L={shown.a} W={shown.b} plate={plate} vh={400} />}
              {sys === 'demit' && <FacadeVisual L={shown.a} H={shown.b} eps={eps} vh={400} />}
              <p className="calc3-visual__cap tabular-nums">
                {fmt(first, 1)} × {fmt(second, 1)} m = {fmt(net)} m²
              </p>
            </div>

            <dl className="calc3-kpis">
              <div>
                <dt>Površina</dt>
                <dd>
                  {fmt(net)} <small>m²</small>
                </dd>
              </div>
              <div>
                <dt>Masa tereta</dt>
                <dd>
                  {tons(kg)} <small>t</small>
                </dd>
              </div>
              <div>
                <dt>Ukupno sa PDV-om{discount > 0 ? ` · rabat ${Math.round(discount * 100)}%` : ''}</dt>
                <dd>
                  {money(total)}
                  {discount > 0 && <small className="ml-2 line-through opacity-50">{money(retail)}</small>}
                </dd>
              </div>
            </dl>

            <ul className="calc3-list">
              {rows.map((r) => (
                <li key={r.sku}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{r.name}</span>
                    <span className="calc3-hint">{r.note}</span>
                  </span>
                  <span className="shrink-0 text-right tabular-nums">{qtyLabel(r.qty, r.unit)}</span>
                  <span className="w-[11ch] shrink-0 text-right tabular-nums">{money(r.price)}</span>
                </li>
              ))}
            </ul>

            <div className="calc3-foot">
              <p className="calc3-hint max-w-[44ch]">
                {recommendCrane(kg) ? 'Preporuka: dostava kamionom sa kranom. ' : ''}Orijentaciono, po normi proizvođača — za veće projekte
                pošaljite nacrt.
              </p>
              <button type="button" onClick={addAll} className="calc3-cta">
                <span>Dodaj sve u korpu · {money(total)}</span>
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
