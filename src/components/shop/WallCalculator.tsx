'use client'

/* eslint-disable @next/next/no-img-element -- studijske fotografije artikala iz /public, već u WebP */

import { useMemo, useRef, useState } from 'react'
import { bySku } from '@/gc/gc'
import { addToCart, notify } from '@/lib/cart'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import Cta from '@/components/ui/Cta'
import Pw from '@/components/ui/Pw'
import { calcW111, money, shotOf } from '@/lib/shop'

// Kalkulator pregradnog zida (dno prodavnice, #kalkulator), sveden na ono što kupac zna:
// dužina, visina, koja ploča i da li ide izolacija. Ostalo je standard (CW 75, jednostruka obloga,
// Uniflott). Rezultat nije tabela nego mreža pravih fotografija artikala sa količinom — "ovo ćete dobiti".
// Količine računa calcW111 (norma utroška po m², ista kao ranije).

const PLATES = [
  { sku: 'KNF-001', label: 'Standard' },
  { sku: 'KNF-002', label: 'Kupatilo' },
  { sku: 'KNF-003', label: 'Vatra' },
  { sku: 'KNF-004', label: 'Tvrda' },
]

// Kratka imena za rezultat (puno ime je u katalogu)
const SHORT: Record<string, string> = {
  'KNF-001': 'Ploča GKB',
  'KNF-002': 'Ploča GKBI',
  'KNF-003': 'Ploča GKF',
  'KNF-004': 'Ploča Diamant',
  'PRF-075': 'Profil CW 75',
  'PRF-UW75': 'Profil UW 75',
  'ISO-001': 'Kamena vuna',
  'CHM-001': 'Masa Uniflott',
  'ACC-001': 'Vijci TN 25',
  'ACC-003': 'Bandaž traka',
}

const f1 = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

// Mjera: veliki broj i dva kružna dugmeta (−/+), bez klizača.
function Measure({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 10) / 10)))
  const btn = 'grid size-11 place-items-center rounded-full border border-ink/25 text-lg transition-colors hover:border-ink disabled:opacity-30'
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink/15 py-5">
      <span className="text-[11.5px] opacity-55">{label}</span>
      <div className="flex items-center gap-4">
        <button type="button" className={btn} onClick={() => set(value - step)} disabled={value <= min} aria-label={`${label}: manje`}>
          −
        </button>
        <span className="font-pretty w-[4.2ch] text-center text-[34px] leading-none tabular-nums" aria-live="polite">
          <span className="pw-alt">{f1(value)}</span>
        </span>
        <button type="button" className={btn} onClick={() => set(value + step)} disabled={value >= max} aria-label={`${label}: više`}>
          +
        </button>
        <span className="text-[11.5px] opacity-55">m</span>
      </div>
    </div>
  )
}

export default function WallCalculator() {
  const root = useRef<HTMLElement>(null)
  const [L, setL] = useState(4)
  const [H, setH] = useState(2.6)
  const [plate, setPlate] = useState('KNF-001')
  const [wool, setWool] = useState(true)

  const { P, items } = useMemo(
    () => calcW111({ L, H, cladding: 'single', plateSku: plate, cwSku: 'PRF-075', woolSku: wool ? 'ISO-001' : undefined, fillerSku: 'CHM-001' }),
    [L, H, plate, wool],
  )
  // "3 ploča po 2,5 m²" → "3 ploča": broj komada je ono što kupac razumije
  const rows = items.map((it) => ({ ...it, count: it.note.split(' po ')[0], line: (bySku(it.sku)?.price ?? 0) * it.qty }))
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

  // Promjena: brojevi u rezultatu kratko "kliknu", ukupna cijena se odbroji.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo('[data-count]', { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out', stagger: 0.03, overwrite: true })
      const out = root.current!.querySelector<HTMLElement>('[data-total]')!
      const o = { v: Number(out.dataset.value ?? 0) }
      gsap.to(o, { v: total, duration: 0.6, ease: 'power2.out', onUpdate: () => void (out.textContent = money(o.v)) })
      out.dataset.value = String(total)
    },
    { dependencies: [L, H, plate, wool], scope: root },
  )

  const addAll = () => {
    rows.forEach((r) => addToCart(r.sku, r.qty))
    notify(`Spisak za ${f1(P)} m² zida je u korpi`, { label: 'Korpa', open: 'cart' })
  }

  return (
    <section ref={root} id="kalkulator" className="scroll-mt-20">
      <div className="px-5 text-center">
        <h2 data-head className="display invisible text-[clamp(48px,6vw,108px)]">
          <Pw>Izmjerite zid</Pw>
        </h2>
        <p className="mx-auto mt-6 max-w-[46ch] text-[12.5px] opacity-65">Unesite mjere i ploču — složimo spisak za pregradni zid.</p>
      </div>

      <div className="mt-[10vh] grid border-y border-ink/20 md:grid-cols-[minmax(320px,0.9fr)_1.4fr]">
        {/* Ulaz */}
        <div className="flex flex-col px-5 py-10 md:border-r md:border-ink/20 md:px-[3vw] md:py-[4vw]">
          <Measure label="Dužina" value={L} min={1} max={12} step={0.5} onChange={setL} />
          <Measure label="Visina" value={H} min={2} max={4} step={0.1} onChange={setH} />

          <p className="mt-8 text-[11.5px] opacity-55">Ploča</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {PLATES.map((p) => {
              const on = p.sku === plate
              return (
                <button
                  key={p.sku}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPlate(p.sku)}
                  className={`group flex flex-col items-center gap-2 border p-1.5 pb-3 transition-colors duration-300 ${on ? 'border-ink' : 'border-ink/15 hover:border-ink/50'}`}
                >
                  <span className="block aspect-square w-full overflow-hidden">
                    <img src={shotOf(p.sku)} alt="" className="h-full w-full scale-[1.35] object-cover transition-transform duration-500 group-hover:scale-[1.45]" />
                  </span>
                  <span className="text-[10.5px]">{p.label}</span>
                </button>
              )
            })}
          </div>

          <button type="button" aria-pressed={wool} onClick={() => setWool(!wool)} className="mt-8 flex min-h-12 items-center justify-between border-y border-ink/15 py-3 text-[11.5px]">
            <span>Sa izolacijom (kamena vuna)</span>
            <span className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${wool ? 'bg-ink' : 'bg-ink/20'}`}>
              <span className={`absolute top-1 size-4 rounded-full bg-bg transition-[left] duration-300 ${wool ? 'left-6' : 'left-1'}`} />
            </span>
          </button>
        </div>

        {/* Rezultat: prave fotografije sa količinom */}
        <div className="flex flex-col">
          <div className="grid flex-1 grid-cols-2 sm:grid-cols-4 [&>*]:border-b [&>*]:border-r [&>*]:border-ink/15">
            {rows.map((r) => (
              <div key={r.sku} className="flex flex-col items-center px-3 pb-5 pt-3 text-center">
                <img src={shotOf(r.sku)} alt="" className="aspect-[4/5] w-full max-w-[150px] object-cover" />
                <span data-count className="font-pretty mt-2 text-[26px] leading-none">
                  <span className="pw-alt">{r.count.split(' ')[0]}</span>
                </span>
                <span className="mt-2 text-[10.5px] leading-[1.4] opacity-70">{SHORT[r.sku] ?? bySku(r.sku)?.name}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6 px-5 py-8 md:px-[3vw]">
            <div>
              <p className="text-[11.5px] opacity-55">
                <span className="tabular-nums">{f1(P)} m²</span> zida · ukupno sa PDV-om
              </p>
              {/* cifre u Bodoniju (.pw-alt): demo Prettywise ima žig na cifri 4 */}
              <p className="mt-2 text-[clamp(34px,3.2vw,52px)] leading-none tabular-nums">
                <span data-total data-value={0} className="pw-alt">
                  {money(total)}
                </span>
              </p>
            </div>
            <Cta solid onClick={addAll}>
              Dodaj
            </Cta>
          </div>
        </div>
      </div>
    </section>
  )
}
