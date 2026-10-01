'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import { calcD112, calcDemit, calcW111 } from '@/lib/shop'
import Bom, { useBomRows } from './Bom'
import Logistics from './Logistics'
import { CeilingVisual, FacadeVisual, WallVisual } from './visuals'

// Građevinski kalkulator (dno prodavnice, #kalkulator): tri sistema u tabovima —
// W111 pregradni zid, D112 spušteni plafon, DEMIT fasada. Svaki tab: nekoliko jasnih kontrola,
// crtež u razmjeri koji prati unos, spisak materijala sa cijenama (B2B rabat ako je partner
// prijavljen), masa tereta i "Dodaj sve u korpu". Ispod: logistika i kran transport.

type Tab = 'w111' | 'd112' | 'demit'
const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: 'w111', label: 'W111', sub: 'Pregradni zid' },
  { id: 'd112', label: 'D112', sub: 'Spušteni plafon' },
  { id: 'demit', label: 'DEMIT', sub: 'Fasada' },
]
const PLATES = [
  { id: 'KNF-001', label: 'GKB' },
  { id: 'KNF-002', label: 'GKBI' },
  { id: 'KNF-003', label: 'GKF' },
  { id: 'KNF-004', label: 'Diamant' },
]

const f1 = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

// Animirana vrijednost za crtež: mjera "klizi" do nove vrijednosti umjesto da skoči.
function useTween(target: Record<string, number>) {
  const [shown, setShown] = useState(target)
  const ref = useRef({ ...target })
  const key = JSON.stringify(target)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = gsap.to(ref.current, { ...target, duration: reduce ? 0 : 0.6, ease: 'power3.out', onUpdate: () => setShown({ ...ref.current }) })
    return () => {
      t.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key je serijalizovan target
  }, [key])
  return shown
}

function Step({ label, value, min, max, step, unit = 'm', onChange }: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 10) / 10)))
  const btn = 'grid size-9 shrink-0 place-items-center rounded-none border border-ink/25 text-lg transition-colors hover:border-ink disabled:opacity-30'
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink/12 py-4">
      <span className="text-[10.5px] opacity-60">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} onClick={() => set(value - step)} disabled={value <= min} aria-label={`${label}: manje`}>
          −
        </button>
        <span className="num w-[4.6ch] text-center text-[22px] leading-none" aria-live="polite">
          {f1(value)}
        </span>
        <button type="button" className={btn} onClick={() => set(value + step)} disabled={value >= max} aria-label={`${label}: više`}>
          +
        </button>
        <span className="w-6 text-[10.5px] opacity-55">{unit}</span>
      </div>
    </div>
  )
}

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-2 border-b border-ink/12 py-4">
      <span className="text-[10.5px] opacity-60">{label}</span>
      <div className="calc-seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={o.id === value} onClick={() => onChange(o.id)} className="calc-seg__opt">
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Calculator() {
  const root = useRef<HTMLElement>(null)
  const [tab, setTab] = useState<Tab>('w111')

  // W111
  const [wL, setWL] = useState(4)
  const [wH, setWH] = useState(2.6)
  const [wPlate, setWPlate] = useState('KNF-001')
  const [cw, setCw] = useState('PRF-075')
  const [cladding, setCladding] = useState<'single' | 'double'>('single')
  const [wool, setWool] = useState<'da' | 'ne'>('da')
  // D112
  const [cL, setCL] = useState(5)
  const [cW, setCW] = useState(4)
  const [cPlate, setCPlate] = useState('KNF-001')
  // DEMIT
  const [fL, setFL] = useState(10)
  const [fH, setFH] = useState(6)
  const [eps, setEps] = useState('ISO-004')

  const result = useMemo(() => {
    if (tab === 'w111')
      return calcW111({ L: wL, H: wH, cladding, plateSku: wPlate, cwSku: cw, woolSku: wool === 'da' ? 'ISO-001' : undefined, fillerSku: 'CHM-001' })
    if (tab === 'd112') return calcD112({ L: cL, W: cW, plateSku: cPlate })
    return calcDemit({ A: fL * fH, epsSku: eps })
  }, [tab, wL, wH, cladding, wPlate, cw, wool, cL, cW, cPlate, fL, fH, eps])

  const { kg, total } = useBomRows(result.items)
  const wallShown = useTween({ L: wL, H: wH })
  const ceilShown = useTween({ L: cL, W: cW })
  const facShown = useTween({ L: fL, H: fH })
  const active = TABS.find((t) => t.id === tab)!

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

  return (
    <section ref={root} id="kalkulator" className="scroll-mt-24">
      <div className="px-5 text-center">
        <h2 data-head className="display invisible text-[clamp(36px,5vw,84px)]">
          Građevinski kalkulator
        </h2>
        <p className="mx-auto mt-5 max-w-[56ch] text-[12px] leading-[1.6] opacity-65">
          Unesite mjere — sajt izračuna utrošak materijala po normi, sa cijenom i masom tereta.
        </p>
        <div className="calc-tabs mx-auto mt-8" role="tablist" aria-label="Sistem">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className="calc-tabs__opt">
              <span className="font-pretty text-[13px]">{t.label}</span>
              <span className="text-[10px] opacity-70">{t.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-[6vh] grid max-w-[1320px] border-y border-ink/15 px-0 md:mx-8 md:grid-cols-[minmax(300px,0.8fr)_1.6fr] md:border-x lg:mx-auto">
        {/* Kontrole */}
        <div className="min-w-0 px-5 py-6 md:border-r md:border-ink/15 md:px-7">
          <p className="mb-2 text-[10.5px] opacity-55">
            {active.label} · {active.sub}
          </p>
          {tab === 'w111' && (
            <>
              <Step label="Dužina zida" value={wL} min={1} max={20} step={0.5} onChange={setWL} />
              <Step label="Visina zida" value={wH} min={2} max={5} step={0.1} onChange={setWH} />
              <Choice label="Ploča" value={wPlate} onChange={setWPlate} options={PLATES} />
              <Choice
                label="CW profil"
                value={cw}
                onChange={setCw}
                options={[
                  { id: 'PRF-050', label: 'CW 50' },
                  { id: 'PRF-075', label: 'CW 75' },
                  { id: 'PRF-100', label: 'CW 100' },
                ]}
              />
              <Choice
                label="Obloga"
                value={cladding}
                onChange={setCladding}
                options={[
                  { id: 'single', label: 'Jednostruka' },
                  { id: 'double', label: 'Dvostruka' },
                ]}
              />
              <Choice
                label="Kamena vuna 50 mm"
                value={wool}
                onChange={setWool}
                options={[
                  { id: 'da', label: 'Da' },
                  { id: 'ne', label: 'Ne' },
                ]}
              />
            </>
          )}
          {tab === 'd112' && (
            <>
              <Step label="Dužina prostorije" value={cL} min={1} max={20} step={0.5} onChange={setCL} />
              <Step label="Širina prostorije" value={cW} min={1} max={20} step={0.5} onChange={setCW} />
              <Choice label="Ploča" value={cPlate} onChange={setCPlate} options={PLATES} />
              <p className="pt-4 text-[10.5px] leading-[1.6] opacity-55">Orijentaciono, po približnoj normi Knauf D112.</p>
            </>
          )}
          {tab === 'demit' && (
            <>
              <Step label="Dužina fasade" value={fL} min={2} max={60} step={1} onChange={setFL} />
              <Step label="Visina fasade" value={fH} min={2} max={20} step={0.5} onChange={setFH} />
              <Choice
                label="Stiropor"
                value={eps}
                onChange={setEps}
                options={[
                  { id: 'ISO-004', label: 'EPS 70 bijeli' },
                  { id: 'ISO-006', label: 'Grafitni Neopor' },
                ]}
              />
              <p className="pt-4 text-[10.5px] leading-[1.6] opacity-55">
                Orijentaciono: stiropor, Ceresit CT 83 (lijepljenje) i CT 85 (armiranje). Mrežica, tiplovi i završni sloj nisu u
                katalogu — dogovaraju se uz ponudu.
              </p>
            </>
          )}
        </div>

        {/* Crtež + spisak */}
        <div className="flex min-w-0 flex-col">
          <div className="border-b border-ink/15 bg-bg">
            {tab === 'w111' && <WallVisual L={wallShown.L} H={wallShown.H} plate={wPlate} wool={wool === 'da'} double={cladding === 'double'} />}
            {tab === 'd112' && <CeilingVisual L={ceilShown.L} W={ceilShown.W} plate={cPlate} />}
            {tab === 'demit' && <FacadeVisual L={facShown.L} H={facShown.H} eps={eps} />}
          </div>
          <div className="px-5 py-6 md:px-7">
            <p className="mb-4 text-[10.5px] opacity-55">
              Površina <span className="tabular-nums">{f1(result.P)} m²</span>
            </p>
            <Bom items={result.items} label={`${active.label} ${active.sub}`} />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-[1320px] px-0 md:mx-8 lg:mx-auto">
        <Logistics kg={kg} goodsTotal={total} />
      </div>
    </section>
  )
}
