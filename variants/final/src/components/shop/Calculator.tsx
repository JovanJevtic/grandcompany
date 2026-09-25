'use client'

import { useMemo, useState } from 'react'
import { addMany, openView } from '@/lib/cart'
import { PRODUCT_MAP, calcW111, money, qtyLabel } from '@/lib/shop'
import { Photo } from '../ui'

const PLATES = ['KNF-001', 'KNF-002', 'KNF-003'] as const
const num = (s: string) => {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
const LIMIT = { min: 0.5, max: 40 }

// Kalkulator: Ponos "Kalkulator materijala" layout (dark panel + cream panel over a material photograph)
// running the calcW111 port (js/core.js of the HTML site → src/lib/shop.ts, same as v1-root / v3-cipher).
export default function Calculator() {
  const [L, setL] = useState('4')
  const [H, setH] = useState('2,6')
  const [double, setDouble] = useState(false)
  const [wool, setWool] = useState(true)
  const [plate, setPlate] = useState<string>('KNF-001')

  const l = num(L)
  const h = num(H)
  const valid = l >= LIMIT.min && l <= LIMIT.max && h >= LIMIT.min && h <= 8

  const result = useMemo(() => {
    if (!valid) return null
    const { P, items } = calcW111({
      L: l,
      H: h,
      cladding: double ? 'double' : 'single',
      plateSku: plate,
      cwSku: 'PRF-075',
      woolSku: wool ? 'ISO-001' : undefined,
      fillerSku: 'CHM-001',
    })
    const rows = items.flatMap((it) => {
      const p = PRODUCT_MAP[it.sku]
      return p ? [{ ...it, p, total: Math.round(p.price * it.qty * 100) / 100 }] : []
    })
    return { P, rows, sum: Math.round(rows.reduce((s, r) => s + r.total, 0) * 100) / 100 }
  }, [valid, l, h, double, wool, plate])

  return (
    <section id="kalkulator" aria-labelledby="kalk-h" className="relative z-10 overflow-hidden py-16 lg:py-24">
      <Photo
        src="/stock/board-stack.jpg"
        alt=""
        sizes="100vw"
        quality={85}
        className="!absolute inset-0 !bg-deep"
        imgClassName="object-[50%_60%]"
      />
      <div className="absolute inset-0 bg-deeper/25" />

      <div className="gutter wrap relative">
        <div className="mx-auto grid max-w-[1120px] md:grid-cols-[1.05fr_1fr]">
          {/* dark panel: title and the live bill of materials */}
          <div className="on-dark flex flex-col bg-deep p-6 text-canvas md:p-10">
            <h2 id="kalk-h" className="s-head">
              Kalkulator zida
            </h2>
            <p className="mt-3 max-w-[46ch] text-[14px] leading-[1.6] text-canvas/70">
              Pregradni zid Knauf {double ? 'W112' : 'W111'} na CW 75 profilima. Norma utroška po m² zida, 5% na otpad,
              zaokruženo na cijela pakovanja.
            </p>

            {result ? (
              <>
                <ul className="mt-7 border-t border-canvas/15 text-[13.5px]">
                  {result.rows.map((r) => (
                    <li key={r.sku} className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-canvas/15 py-2.5">
                      <button type="button" onClick={() => openView(r.sku)} className="text-left leading-snug hover:underline">
                        {r.p.name}
                      </button>
                      <span className="text-right tnum">{money(r.total)}</span>
                      <span className="text-[12px] text-canvas/55 tnum">
                        {r.note} · {qtyLabel(r.qty, r.p.unit)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <span className="text-[13px] text-canvas/70 tnum">
                    Zid {qtyLabel(Math.round(result.P * 100) / 100, 'm²')}
                  </span>
                  <span className="text-[28px] font-medium leading-none tnum">{money(result.sum)}</span>
                </div>
                <button
                  type="button"
                  className="mt-6 flex w-full items-center justify-between gap-3 bg-canvas px-5 py-4 text-[12px] font-medium uppercase tracking-[0.1em] text-ink transition-opacity hover:opacity-90"
                  onClick={() =>
                    addMany(
                      result.rows.map((r) => ({ sku: r.sku, qty: r.qty })),
                      `Spisak za zid ${qtyLabel(Math.round(result.P * 100) / 100, 'm²')} je u korpi`,
                    )
                  }
                >
                  <span>Dodaj sve u korpu</span>
                  <span aria-hidden>→</span>
                </button>
                <p className="mt-3 text-[12px] text-canvas/55">Cijene sa PDV-om. Količine provjerite sa izvođačem prije narudžbe.</p>
              </>
            ) : (
              <p className="mt-8 border-t border-canvas/15 pt-5 text-[14px] text-canvas/70">
                Unesite dužinu od {LIMIT.min} do {LIMIT.max} m i visinu od {LIMIT.min} do 8 m.
              </p>
            )}
          </div>

          {/* cream panel: the inputs */}
          <form className="bg-surface p-6 md:p-10" onSubmit={(e) => e.preventDefault()} aria-label="Mjere zida">
            <p className="eyebrow text-[10px] text-muted">Mjere zida</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { id: 'kalk-l', label: 'Dužina (m)', v: L, set: setL },
                { id: 'kalk-h', label: 'Visina (m)', v: H, set: setH },
              ].map((f) => (
                <label key={f.id} htmlFor={f.id} className="flex flex-col gap-1.5">
                  <span className="text-[13px] text-muted">{f.label}</span>
                  <input
                    id={f.id}
                    inputMode="decimal"
                    value={f.v}
                    onChange={(e) => f.set(e.target.value.replace(/[^\d.,]/g, ''))}
                    className="field text-[17px] tnum"
                  />
                </label>
              ))}
            </div>

            <fieldset className="mt-7">
              <legend className="eyebrow text-[10px] text-muted">Obloga</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { v: false, t: 'Jednostruka', s: 'W111 · 100 mm' },
                  { v: true, t: 'Dvostruka', s: 'W112 · 125 mm' },
                ].map((o) => (
                  <button
                    key={o.t}
                    type="button"
                    aria-pressed={double === o.v}
                    onClick={() => setDouble(o.v)}
                    className="flex flex-col items-start border border-ink/20 px-3.5 py-3 text-left transition-colors hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-canvas"
                  >
                    <span className="text-[14px] font-medium">{o.t}</span>
                    <span className="text-[12px] opacity-65">{o.s}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-7 flex flex-col gap-1.5">
              <span className="eyebrow text-[10px] text-muted">Ploča</span>
              <select value={plate} onChange={(e) => setPlate(e.target.value)} className="field text-[14px]">
                {PLATES.map((sku) => (
                  <option key={sku} value={sku}>
                    {PRODUCT_MAP[sku]?.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-7 flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={wool} onChange={(e) => setWool(e.target.checked)} className="mt-0.5 size-4 accent-ink" />
              <span>
                <span className="block text-[14px] font-medium">Kamena vuna 50 mm u zidu</span>
                <span className="block text-[12px] text-muted">Za zvučnu izolaciju između prostorija</span>
              </span>
            </label>

            <p className="mt-8 border-t border-ink/12 pt-4 text-[12px] leading-[1.55] text-muted">
              Za plafone (D112), zid na dvostrukoj potkonstrukciji (W115) i veće objekte računamo po predmjeru. Pošaljite ga kroz
              upit ispod.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
