'use client'

import { useMemo, useRef, useState } from 'react'
import { WALL_SYSTEMS, bySku } from '@/gc/gc'
import { addToCart, notify } from '@/lib/cart'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import Cta from '@/components/ui/Cta'
import { calcW111, money, qtyLabel } from '@/lib/shop'

// Kalkulator pregradnog zida po normi W111/W112 (dno prodavnice, #kalkulator): mjere i izbor
// ploče, profila i mase daju spisak materijala sa cijenom, a tehnički crtež zida (pogled i presjek)
// se mijenja uživo. "Dodaj sve u korpu" ubacuje cijeli spisak odjednom.

const PLATES = [
  { sku: 'KNF-001', label: 'GKB', note: 'standardna' },
  { sku: 'KNF-002', label: 'GKBI', note: 'vlažni prostori' },
  { sku: 'KNF-003', label: 'GKF', note: 'vatrootporna' },
  { sku: 'KNF-004', label: 'Diamant', note: 'tvrda' },
]
const STUDS = [
  { sku: 'PRF-050', label: 'CW 50', mm: 50 },
  { sku: 'PRF-075', label: 'CW 75', mm: 75 },
  { sku: 'PRF-100', label: 'CW 100', mm: 100 },
]
const FILLERS = [
  { sku: 'CHM-001', label: 'Uniflott' },
  { sku: 'CHM-002', label: 'Fugenfüller' },
]

const f1 = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; text: string; hint?: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[13px] opacity-50">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.id === value
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.id)}
              className={`min-h-11 rounded-full border px-4 py-2 text-left text-[15px] leading-tight transition-colors duration-300 ${
                on ? 'border-ink bg-ink text-bg' : 'border-ink/20 hover:border-ink'
              }`}
            >
              {o.text}
              {o.hint && <span className={`ml-2 italic ${on ? 'opacity-70' : 'opacity-50'}`}>{o.hint}</span>}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function Range({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] opacity-50">{label}</span>
        <span className="text-[22px] tabular-nums">{f1(value)} m</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range h-6 w-full cursor-pointer"
      />
    </label>
  )
}

// Pogled na zid: UW gore i dolje, CW na 62,5 cm, ploče po 1,2 m (šavovi isprekidano), vuna.
function Elevation({ L, H, wool }: { L: number; H: number; wool: boolean }) {
  const W = 620
  const HH = 300
  const s = Math.min((W - 80) / L, (HH - 70) / H)
  const w = L * s
  const h = H * s
  const x0 = (W - w) / 2
  const y0 = 24
  const studs: number[] = []
  for (let x = 0; x <= L + 1e-6; x += 0.625) studs.push(x)
  if (L - studs[studs.length - 1] > 0.05) studs.push(L)
  const seams: number[] = []
  for (let x = 1.2; x < L - 0.05; x += 1.2) seams.push(x)
  return (
    <svg viewBox={`0 0 ${W} ${HH}`} className="art h-auto w-full" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="square" aria-hidden>
      <rect x={x0} y={y0} width={w} height={h} />
      {wool &&
        studs.slice(0, -1).map((x, i) => {
          const a = x0 + x * s + 4
          const b = x0 + (studs[i + 1] ?? L) * s - 4
          if (b - a < 6) return null
          const pts: string[] = []
          for (let y = y0 + 10, k = 0; y < y0 + h - 8; y += 9, k++) pts.push(`${k % 2 ? b : a},${y}`)
          return <polyline key={`w${i}`} data-wool points={pts.join(' ')} opacity={0.3} />
        })}
      {studs.map((x, i) => (
        <rect key={`s${i}`} data-stud x={x0 + x * s - 2} y={y0 + 4} width={4} height={h - 8} fill="var(--plate)" />
      ))}
      <path d={`M${x0} ${y0 + 4}H${x0 + w}M${x0} ${y0 + h - 4}H${x0 + w}`} strokeWidth={2.5} />
      {seams.map((x) => (
        <line key={`j${x}`} x1={x0 + x * s} y1={y0} x2={x0 + x * s} y2={y0 + h} strokeDasharray="5 5" opacity={0.5} />
      ))}
      {/* kote */}
      <path d={`M${x0} ${y0 + h + 18}H${x0 + w}M${x0} ${y0 + h + 12}v12M${x0 + w} ${y0 + h + 12}v12`} opacity={0.7} />
      <text x={x0 + w / 2} y={y0 + h + 36} textAnchor="middle" stroke="none" fill="currentColor" fontSize={15} fontStyle="italic">
        {f1(L)} m
      </text>
      <path d={`M${x0 - 18} ${y0}V${y0 + h}M${x0 - 24} ${y0}h12M${x0 - 24} ${y0 + h}h12`} opacity={0.7} />
      <text x={x0 - 26} y={y0 + h / 2} textAnchor="end" dominantBaseline="middle" stroke="none" fill="currentColor" fontSize={15} fontStyle="italic">
        {f1(H)} m
      </text>
    </svg>
  )
}

// Presjek zida (tlocrt): ploče s obje strane, profil, vuna — sa ukupnom debljinom.
function Section({ layers, stud, wool }: { layers: number; stud: number; wool: boolean }) {
  const px = 1.6
  const board = 12.5 * px
  const core = stud * px
  const total = core + 2 * layers * board
  const x0 = 20
  const y0 = 20
  const len = 220
  const rows = [...Array(layers)].map((_, i) => y0 + i * board)
  const coreY = y0 + layers * board
  return (
    <svg viewBox={`0 0 ${len + 40} ${total + 60}`} className="art h-auto w-full" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden>
      {rows.map((y) => (
        <rect key={`a${y}`} x={x0} y={y} width={len} height={board} fill="var(--plate)" />
      ))}
      {wool && <path d={Array.from({ length: 22 }, (_, i) => `${i ? 'L' : 'M'}${x0 + 5 + i * 10} ${i % 2 ? coreY + 4 : coreY + core - 4}`).join('')} opacity={0.35} />}
      {[0.12, 0.5, 0.88].map((t) => (
        <path key={t} d={`M${x0 + len * t - 12} ${coreY}h24M${x0 + len * t - 12} ${coreY}v${core}h24M${x0 + len * t - 12} ${coreY + core}h24`} strokeWidth={1.8} />
      ))}
      {rows.map((y) => (
        <rect key={`b${y}`} x={x0} y={coreY + core + (y - y0)} width={len} height={board} fill="var(--plate)" />
      ))}
      <path d={`M${x0 + len + 12} ${y0}V${y0 + total}M${x0 + len + 6} ${y0}h12M${x0 + len + 6} ${y0 + total}h12`} opacity={0.7} />
      <text x={x0 + len / 2} y={y0 + total + 26} textAnchor="middle" stroke="none" fill="currentColor" fontSize={15} fontStyle="italic">
        {Math.round(stud + layers * 2 * 12.5)} mm
      </text>
    </svg>
  )
}

export default function WallCalculator() {
  const root = useRef<HTMLElement>(null)
  const [code, setCode] = useState<'W111' | 'W112'>('W111')
  const [L, setL] = useState(4)
  const [H, setH] = useState(2.6)
  const [plate, setPlate] = useState('KNF-001')
  const [stud, setStud] = useState('PRF-075')
  const [filler, setFiller] = useState('CHM-001')
  const [wool, setWool] = useState(true)
  const [tape, setTape] = useState(false)

  const system = WALL_SYSTEMS.find((s) => s.code === code)!
  const studMm = STUDS.find((s) => s.sku === stud)!.mm
  const layers = code === 'W112' ? 2 : 1

  const { P, items } = useMemo(
    () =>
      calcW111({ L, H, cladding: layers === 2 ? 'double' : 'single', plateSku: plate, cwSku: stud, woolSku: wool ? 'ISO-001' : undefined, fillerSku: filler, soundTape: tape }),
    [L, H, layers, plate, stud, wool, filler, tape],
  )
  const rows = items.map((it) => {
    const p = bySku(it.sku)!
    return { ...it, name: p.name, unit: p.unit, line: p.price * it.qty }
  })
  const total = rows.reduce((s, r) => s + r.line, 0)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        revealChars(root.current!.querySelector('[data-head]')!, reduce, 'top 80%')
      })
    },
    { scope: root },
  )

  // Kad se promijeni mjera ili sistem, profili "niknu" jedan za drugim, a ukupna cijena se odbroji.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo('[data-stud]', { scaleY: 0.2, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.5, ease: 'power3.out', stagger: 0.015, overwrite: true })
      const out = root.current!.querySelector<HTMLElement>('[data-total]')!
      const from = Number(out.dataset.value ?? 0)
      const o = { v: from }
      gsap.to(o, {
        v: total,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => {
          out.textContent = money(o.v)
        },
      })
      out.dataset.value = String(total)
    },
    { dependencies: [L, H, code, plate, stud, wool, filler, tape], scope: root },
  )

  const addAll = () => {
    rows.forEach((r) => addToCart(r.sku, r.qty))
    notify(`Spisak za ${f1(P)} m² zida je u korpi`, { label: 'Korpa', open: 'cart' })
  }

  return (
    <section ref={root} id="kalkulator" className="scroll-mt-20 py-[18vh]">
      <div className="gutter text-center">
        <h2 data-head className="display invisible mx-auto max-w-[16ch] text-[clamp(44px,6vw,108px)]">
          Izmjerite zid. <em>Mi složimo spisak.</em>
        </h2>
      </div>

      <div className="gutter mx-auto mt-[10vh] grid max-w-[1400px] gap-14 md:grid-cols-12 md:gap-[3vw]">
        <div className="grid content-start gap-8 md:col-span-4">
          <Choice
            label="Sistem"
            value={code}
            onChange={setCode}
            options={[
              { id: 'W111', text: 'W111', hint: 'jednostruka' },
              { id: 'W112', text: 'W112', hint: 'dvostruka' },
            ]}
          />
          <Range label="Dužina zida" value={L} min={1} max={12} step={0.1} onChange={setL} />
          <Range label="Visina zida" value={H} min={2} max={4} step={0.05} onChange={setH} />
          <Choice label="Ploča" value={plate} onChange={setPlate} options={PLATES.map((p) => ({ id: p.sku, text: p.label }))} />
          <Choice label="Profil" value={stud} onChange={setStud} options={STUDS.map((s) => ({ id: s.sku, text: s.label }))} />
          <Choice label="Masa za spojeve" value={filler} onChange={setFiller} options={FILLERS.map((f) => ({ id: f.sku, text: f.label }))} />
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { on: wool, set: setWool, text: 'Kamena vuna 50 mm' },
              { on: tape, set: setTape, text: 'Zvučna traka' },
            ].map((t) => (
              <button key={t.text} type="button" aria-pressed={t.on} onClick={() => t.set(!t.on)} className="flex min-h-11 items-center gap-2.5 text-[15px]">
                <span className={`size-4 rounded-full border transition-colors ${t.on ? 'border-signal bg-signal' : 'border-ink/40'}`} />
                {t.text}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="grid gap-8 bg-plate p-6 md:grid-cols-[1fr_200px] md:p-10">
            <div>
              <p className="mb-4 text-[13px] italic opacity-60">Pogled · {f1(P)} m²</p>
              <Elevation L={L} H={H} wool={wool} />
            </div>
            <div className="md:border-l md:border-ink/15 md:pl-8">
              <p className="mb-4 text-[13px] italic opacity-60">Presjek</p>
              <div className="mx-auto max-w-[180px] md:max-w-none">
                <Section layers={layers} stud={studMm} wool={wool} />
              </div>
              <dl className="mt-5 grid gap-1.5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="opacity-50">Zvučna izolacija</dt>
                  <dd>Rw {system.rw} dB</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="opacity-50">Profil</dt>
                  <dd>{system.profile}</dd>
                </div>
              </dl>
            </div>
          </div>

          <table className="mt-8 w-full border-collapse text-left">
            <caption className="sr-only">Spisak materijala</caption>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sku} className="border-b border-ink/15 align-baseline">
                  <td className="py-4 pr-3">
                    <span className="block text-[clamp(15px,1.1vw,18px)] leading-tight">{r.name}</span>
                    <span className="text-[13px] italic opacity-50">{r.note}</span>
                  </td>
                  <td className="hidden py-4 text-right text-[15px] tabular-nums opacity-60 sm:table-cell">{qtyLabel(r.qty, r.unit)}</td>
                  <td className="w-[7.5rem] py-4 text-right text-[15px] tabular-nums">{money(r.line)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
            <p>
              <span className="block text-[13px] opacity-50">Ukupno sa PDV-om</span>
              <span data-total className="text-[clamp(32px,3vw,52px)] leading-none tabular-nums" data-value={0}>
                {money(total)}
              </span>
            </p>
            <Cta solid onClick={addAll}>
              Dodaj sve u korpu
            </Cta>
          </div>
        </div>
      </div>
    </section>
  )
}
