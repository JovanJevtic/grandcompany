'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { bySku } from '@/gc/gc'
import { addToCart, notify } from '@/lib/cart'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import Cta from '@/components/ui/Cta'
import Pw from '@/components/ui/Pw'
import { calcW111, money } from '@/lib/shop'

// Kalkulator, sveden na jednu stvar: VAŠ ZID. Veliki crtež zida u razmjeri je glavni element —
// širi se i skuplja sa mjerama, a boja mu je boja kartona izabrane ploče (kao na pravim pločama:
// bijela standard, zelena za kupatilo, crvena vatrootporna, plava tvrda). Desna trećina je "presjek"
// sa CW profilima; kad je uključena izolacija, između profila se pojavi vuna.
// Ispod: površina, cijena i "Dodaj". Detaljan spisak je sklopljen (Šta dobijate).
// Količine računa calcW111 (norma utroška po m²), standard: CW 75, jednostruka obloga, Uniflott.

const PLATES = [
  { sku: 'KNF-001', label: 'Standard', color: '#ece6da', ink: '#b9ae9b' },
  { sku: 'KNF-002', label: 'Kupatilo', color: '#a9c2a0', ink: '#7f9b77' },
  { sku: 'KNF-003', label: 'Vatra', color: '#e2a49c', ink: '#bf7c73' },
  { sku: 'KNF-004', label: 'Tvrda', color: '#a8bfdc', ink: '#7c97ba' },
]

const SHORT: Record<string, string> = {
  'KNF-001': 'Ploča GKB',
  'KNF-002': 'Ploča GKBI',
  'KNF-003': 'Ploča GKF',
  'KNF-004': 'Ploča Diamant',
  'PRF-075': 'Profil CW 75',
  'PRF-UW75': 'Profil UW 75',
  'ISO-001': 'Kamena vuna',
  'CHM-001': 'Masa za spojeve',
  'ACC-001': 'Vijci',
  'ACC-003': 'Bandaž traka',
}

const f1 = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

// ——— Crtež zida (pogled spreda, u razmjeri) ———
// Okvir 1000×470. Razmjera prati zid (uz minimum 5 × 3 m), pa zid uvijek popuni kadar, a i dalje se
// vidi kako raste i mijenja odnos dužine i visine.
const VW = 1000
const VH = 470
const PAD = 64

function Wall({ L, H, color, ink, wool }: { L: number; H: number; color: string; ink: string; wool: boolean }) {
  const scale = Math.min((VW - 2 * PAD) / Math.max(L, 5), (VH - 2 * PAD) / Math.max(H, 3))
  const w = L * scale
  const h = H * scale
  const x0 = (VW - w) / 2
  const y0 = VH - PAD - h
  // presjek: desna trećina zida (najmanje 1,25 m), pokazuje profile i vunu
  const cutW = Math.min(w, Math.max(w / 3, 1.25 * scale))
  const cutX = x0 + w - cutW
  const studs: number[] = []
  for (let x = 0; x <= L + 1e-6; x += 0.625) studs.push(x0 + x * scale)
  const seams: number[] = []
  for (let x = 1.25; x < L - 0.05; x += 1.25) seams.push(x0 + x * scale)
  const fillT = 'fill 0.7s cubic-bezier(0.25,1,0.5,1)'

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full" aria-hidden>
      {/* pod */}
      <line x1={0} y1={VH - PAD} x2={VW} y2={VH - PAD} stroke="var(--ink)" strokeOpacity={0.25} />
      {/* obloga (puna ploča) do presjeka */}
      <rect x={x0} y={y0} width={Math.max(0, w - cutW)} height={h} style={{ fill: color, transition: fillT }} />
      {seams
        .filter((x) => x < cutX - 1)
        .map((x) => (
          <line key={x} x1={x} y1={y0} x2={x} y2={y0 + h} style={{ stroke: ink, transition: 'stroke 0.7s' }} strokeWidth={1.2} />
        ))}
      {/* presjek: unutrašnjost zida */}
      <rect x={cutX} y={y0} width={cutW} height={h} fill="#e9e4dc" />
      {wool &&
        studs
          .filter((x) => x >= cutX - 1 && x < x0 + w - 2)
          .map((x, i) => {
            const nx = Math.min(x + 0.625 * scale, x0 + w)
            return <rect key={`w${i}`} x={x + 3} y={y0 + 6} width={Math.max(0, nx - x - 6)} height={Math.max(0, h - 12)} fill="#c9a25e" opacity={0.85} />
          })}
      {studs
        .filter((x) => x >= cutX - 1)
        .map((x, i) => (
          <rect key={`s${i}`} x={x - 3} y={y0} width={6} height={h} fill="#b7bcc2" />
        ))}
      {/* UW gore i dolje */}
      <rect x={x0} y={y0 - 4} width={w} height={6} fill="#9aa1a8" />
      <rect x={x0} y={y0 + h - 2} width={w} height={6} fill="#9aa1a8" />
      {/* ivica presjeka */}
      <line x1={cutX} y1={y0} x2={cutX} y2={y0 + h} stroke="var(--signal)" strokeWidth={1.5} />
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="var(--ink)" strokeOpacity={0.55} />
      {/* kote */}
      <g stroke="var(--ink)" strokeOpacity={0.5}>
        <line x1={x0} y1={VH - PAD + 26} x2={x0 + w} y2={VH - PAD + 26} />
        <line x1={x0} y1={VH - PAD + 18} x2={x0} y2={VH - PAD + 34} />
        <line x1={x0 + w} y1={VH - PAD + 18} x2={x0 + w} y2={VH - PAD + 34} />
        <line x1={x0 - 26} y1={y0} x2={x0 - 26} y2={y0 + h} />
        <line x1={x0 - 34} y1={y0} x2={x0 - 18} y2={y0} />
        <line x1={x0 - 34} y1={y0 + h} x2={x0 - 18} y2={y0 + h} />
      </g>
    </svg>
  )
}

function Step({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 10) / 10)))
  const btn = 'grid size-9 shrink-0 place-items-center rounded-full border border-ink/25 text-lg transition-colors hover:border-ink disabled:opacity-30 md:size-11'
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] opacity-55">{label}</span>
      <div className="flex items-center gap-1.5 md:gap-3">
        <button type="button" className={btn} onClick={() => set(value - step)} disabled={value <= min} aria-label={`${label}: manje`}>
          −
        </button>
        <span className="num w-[3.6ch] text-center text-[24px] leading-none tabular-nums md:w-[4.4ch] md:text-[30px]" aria-live="polite">
          {f1(value)}
        </span>
        <button type="button" className={btn} onClick={() => set(value + step)} disabled={value >= max} aria-label={`${label}: više`}>
          +
        </button>
      </div>
      <span className="text-[11px] opacity-55">metara</span>
    </div>
  )
}

export default function WallCalculator() {
  const root = useRef<HTMLElement>(null)
  const [L, setL] = useState(4)
  const [H, setH] = useState(2.6)
  const [plate, setPlate] = useState(PLATES[0])
  const [wool, setWool] = useState(true)
  const [open, setOpen] = useState(false)

  // Crtež ne skače na novu mjeru nego "klizi" do nje (vrijednosti se animiraju, zid se precrtava).
  const [shown, setShown] = useState({ L: 4, H: 2.6 })
  const anim = useRef({ L: 4, H: 2.6 })
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = gsap.to(anim.current, {
      L,
      H,
      duration: reduce ? 0 : 0.7,
      ease: 'power3.out',
      onUpdate: () => setShown({ ...anim.current }),
    })
    return () => {
      t.kill()
    }
  }, [L, H])

  const { P, items } = useMemo(
    () => calcW111({ L, H, cladding: 'single', plateSku: plate.sku, cwSku: 'PRF-075', woolSku: wool ? 'ISO-001' : undefined, fillerSku: 'CHM-001' }),
    [L, H, plate, wool],
  )
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

  const addAll = () => {
    rows.forEach((r) => addToCart(r.sku, r.qty))
    notify(`Spisak za ${f1(P)} m² zida je u korpi`, { label: 'Korpa', open: 'cart' })
  }

  return (
    <section ref={root} id="kalkulator" className="scroll-mt-20">
      <div className="px-5 text-center">
        <h2 data-head className="display invisible text-[clamp(48px,6vw,108px)]">
          <Pw>Vaš zid</Pw>
        </h2>
        <p className="mx-auto mt-6 max-w-[44ch] text-[12px] opacity-65">Podesite mjere i ploču. Mi izračunamo šta treba.</p>
      </div>

      <div className="mx-auto mt-[8vh] max-w-[1200px] px-3 md:px-8">
        {/* Zid: glavni element */}
        <div className="relative border border-ink/15 bg-bg">
          <Wall L={shown.L} H={shown.H} color={plate.color} ink={plate.ink} wool={wool} />
          <span className="absolute bottom-3 left-4 text-[10.5px] opacity-50 md:bottom-5 md:left-6">{plate.label}</span>
          <span className="absolute bottom-3 right-4 flex items-center gap-2 text-[10.5px] opacity-60 md:bottom-5 md:right-6">
            <span className="inline-block h-px w-5 bg-signal" />
            presjek
          </span>
        </div>

        {/* Kontrole: dužina, visina, ploča, izolacija */}
        <div className="grid grid-cols-2 border-x border-b border-ink/15 md:grid-cols-4 [&>*]:border-ink/15 [&>*]:px-2 [&>*]:py-7 md:[&>*]:px-4 md:[&>*]:py-8">
          <div className="border-b border-r md:border-b-0">
            <Step label="Dužina" value={L} min={1} max={12} step={0.5} onChange={setL} />
          </div>
          <div className="border-b md:border-b-0 md:border-r">
            <Step label="Visina" value={H} min={2} max={4} step={0.1} onChange={setH} />
          </div>
          <div className="flex flex-col items-center gap-3 border-r">
            <span className="text-[11px] opacity-55">Ploča</span>
            <div className="flex gap-1.5" role="radiogroup" aria-label="Ploča">
              {PLATES.map((p) => {
                const on = p.sku === plate.sku
                return (
                  <button
                    key={p.sku}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={p.label}
                    onClick={() => setPlate(p)}
                    className={`grid size-9 place-items-center rounded-full border transition-colors md:size-10 ${on ? 'border-ink' : 'border-transparent hover:border-ink/30'}`}
                  >
                    <span className="block size-6 rounded-full md:size-7" style={{ background: p.color }} />
                  </button>
                )
              })}
            </div>
            <span className="text-[11px]">{plate.label}</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] opacity-55">Izolacija</span>
            <button type="button" role="switch" aria-checked={wool} onClick={() => setWool(!wool)} className="flex min-h-11 items-center">
              <span className={`relative h-7 w-[52px] rounded-full transition-colors duration-300 ${wool ? 'bg-ink' : 'bg-ink/20'}`}>
                <span className={`absolute top-1 size-5 rounded-full bg-bg transition-[left] duration-300 ${wool ? 'left-[28px]' : 'left-1'}`} />
              </span>
            </button>
            <span className="text-[11px]">{wool ? 'Kamena vuna' : 'Bez vune'}</span>
          </div>
        </div>

        {/* Rezultat */}
        <div className="flex flex-col items-center gap-6 border-x border-b border-ink/15 px-5 py-10 text-center">
          <p className="text-[11.5px] opacity-60">
            <span className="tabular-nums">{f1(P)} m²</span> zida · sa PDV-om
          </p>
          <p className="num text-[clamp(40px,4vw,64px)] leading-none tabular-nums">{money(total)}</p>
          <Cta solid onClick={addAll}>
            Dodaj
          </Cta>
          <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="ulink text-[11px]">
            {open ? 'Sakrij spisak' : 'Šta dobijate'}
          </button>
          {open && (
            <ul className="w-full max-w-[520px] text-left text-[11.5px]">
              {rows.map((r) => (
                <li key={r.sku} className="flex justify-between gap-4 border-t border-ink/15 py-3">
                  <span>{SHORT[r.sku] ?? bySku(r.sku)?.name}</span>
                  <span className="tabular-nums opacity-70">{r.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
