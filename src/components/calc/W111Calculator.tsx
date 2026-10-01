'use client'

/* eslint-disable @next/next/no-img-element -- fotografije artikala iz /public, već u WebP */

import { useMemo, useState } from 'react'
import Cta from '@/components/ui/Cta'
import { bySku } from '@/gc/gc'
import { useB2B, withDiscount } from '@/lib/b2b'
import { addToCart, notify } from '@/lib/cart'
import { money, shotOf } from '@/lib/shop'
import { NORMS, WASTE, calcW111Area, wallThickness, type Cladding } from '@/lib/w111'

// Kalkulator W111 (/kalkulator). Gore: unos — površina zida (veliki broj), obloga, ploča, vuna.
// Sredina: presjek zida u razmjeri koji prati izbor (ploče u boji tipa, profili, vuna, debljina).
// Dolje: spisak materijala sa količinama, pakovanjima i cijenom, i "Dodaj sve u korpu".

const PLATES = [
  { sku: 'KNF-001', code: 'GKB', note: 'standardna', color: '#ece6da' },
  { sku: 'KNF-002', code: 'GKBI', note: 'vlagootporna', color: '#a9c9b4' },
  { sku: 'KNF-003', code: 'GKF', note: 'vatrootporna', color: '#e4b0aa' },
  { sku: 'KNF-004', code: 'Diamant', note: 'tvrda, zvučna', color: '#b7c3e2' },
]

const nf = (n: number, d = 2) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: d })
const parse = (s: string) => {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? Math.min(n, 9999) : 0
}

// ——— Presjek zida (pogled odozgo), u razmjeri: 1 mm = 2,4 px po debljini ———
function Section({ cladding, color, wool }: { cladding: Cladding; color: string; wool: boolean }) {
  const S = 2.4
  const layers = cladding === 'double' ? 2 : 1
  const b = 12.5 * S
  const core = 75 * S
  const t = core + 2 * layers * b
  const W = 1000
  const H = 360
  const y0 = (H - t) / 2
  const studs = [140, 390, 640, 890]
  const ease = 'all .6s cubic-bezier(.25,1,.5,1)'
  const boards = (top: boolean) =>
    Array.from({ length: layers }, (_, i) => {
      const y = top ? y0 + i * b : y0 + t - (i + 1) * b
      return <rect key={`${top}${i}`} x={40} y={y} width={W - 80} height={b} fill={color} stroke="var(--ink)" strokeWidth={1.2} style={{ transition: ease }} />
    })
  const cy = y0 + layers * b
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Presjek zida W111, debljina ${wallThickness(cladding)} mm`}>
      <defs>
        <pattern id="w111-wool" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 10 Q3.5 2 7 10 T14 10" fill="none" stroke="var(--ink)" strokeOpacity=".35" strokeWidth="1" />
        </pattern>
      </defs>
      {/* jezgro: vuna između profila */}
      <rect x={40} y={cy} width={W - 80} height={core} fill={wool ? 'url(#w111-wool)' : 'transparent'} style={{ transition: ease }} />
      {/* CW profili (C presjek) */}
      {studs.map((x) => (
        <path
          key={x}
          d={`M${x + 22} ${cy + 3} H${x} V${cy + core - 3} H${x + 22}`}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={2.4}
          style={{ transition: ease }}
        />
      ))}
      {boards(true)}
      {boards(false)}
      {/* kota debljine */}
      <g stroke="var(--ink)" strokeWidth={1} style={{ transition: ease }}>
        <line x1={W - 22} x2={W - 22} y1={y0} y2={y0 + t} />
        <line x1={W - 30} x2={W - 14} y1={y0} y2={y0} />
        <line x1={W - 30} x2={W - 14} y1={y0 + t} y2={y0 + t} />
      </g>
      {/* kota razmaka profila */}
      <g stroke="var(--ink)" strokeOpacity=".5" strokeWidth={1}>
        <line x1={390} x2={640} y1={y0 - 26} y2={y0 - 26} />
        <line x1={390} x2={390} y1={y0 - 32} y2={y0 - 20} />
        <line x1={640} x2={640} y1={y0 - 32} y2={y0 - 20} />
      </g>
      <text x={515} y={y0 - 34} textAnchor="middle" className="w111-svg-label">
        625 mm
      </text>
    </svg>
  )
}

export default function W111Calculator() {
  const [raw, setRaw] = useState('25')
  const [cladding, setCladding] = useState<Cladding>('single')
  const [plate, setPlate] = useState(PLATES[0].sku)
  const [wool, setWool] = useState(true)
  const { discount } = useB2B()

  const area = parse(raw)
  const lines = useMemo(() => calcW111Area(area || 0, cladding, plate, wool), [area, cladding, plate, wool])
  const rows = lines.map((l) => {
    const p = bySku(l.sku)
    const unitPrice = p ? withDiscount(p.price, discount) : 0
    return { ...l, name: p?.name ?? l.label, catUnit: p?.unit ?? '', price: unitPrice * l.cartQty, kg: (p?.weight ?? 0) * l.cartQty }
  })
  const total = rows.reduce((s, r) => s + r.price, 0)
  const kg = rows.reduce((s, r) => s + r.kg, 0)
  const plateDef = PLATES.find((p) => p.sku === plate)!
  const step = (d: number) => setRaw(String(Math.max(1, Math.round((area || 0) + d))).replace('.', ','))

  const addAll = () => {
    if (!area) return
    rows.forEach((r) => addToCart(r.sku, r.cartQty))
    notify(`W111, ${nf(area)} m²: materijal je u korpi`, { label: 'Korpa', open: 'cart' })
  }

  return (
    <div className="w111">
      {/* ——— Unos ——— */}
      <section className="w111-input" aria-label="Unos">
        <div className="w111-area">
          <label htmlFor="w111-area" className="w111-label">
            01 · Površina zida
          </label>
          <div className="w111-area__row">
            <button type="button" className="btn-square" onClick={() => step(-1)} aria-label="Manje">
              −
            </button>
            <input
              id="w111-area"
              inputMode="decimal"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              onBlur={() => !area && setRaw('1')}
              className="w111-area__input display"
              aria-describedby="w111-area-hint"
            />
            <span className="w111-area__unit display">m²</span>
            <button type="button" className="btn-square" onClick={() => step(1)} aria-label="Više">
              +
            </button>
          </div>
          <p id="w111-area-hint" className="w111-hint">
            Dužina × visina zida, bez otvora za vrata. Npr. zid 4 × 2,6 m = 10,4 m².
          </p>
        </div>

        <div className="w111-options">
          <div>
            <p className="w111-label">02 · Obloga</p>
            <div className="w111-seg" role="radiogroup" aria-label="Obloga">
              {(
                [
                  ['single', 'Jednostruka', '1 ploča sa svake strane · 100 mm'],
                  ['double', 'Dvostruka', '2 ploče sa svake strane · 125 mm'],
                ] as const
              ).map(([id, name, sub]) => (
                <button key={id} type="button" role="radio" aria-checked={cladding === id} onClick={() => setCladding(id)}>
                  <span className="block">{name}</span>
                  <span className="w111-seg__sub">{sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="w111-label">03 · Ploča</p>
            <div className="w111-plates" role="radiogroup" aria-label="Ploča">
              {PLATES.map((p) => (
                <button key={p.sku} type="button" role="radio" aria-checked={plate === p.sku} onClick={() => setPlate(p.sku)}>
                  <i style={{ background: p.color }} />
                  <span>
                    <span className="block">{p.code}</span>
                    <span className="w111-seg__sub">{p.note}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <label className="w111-toggle">
            <input type="checkbox" checked={wool} onChange={(e) => setWool(e.target.checked)} />
            <span>
              <span className="block">04 · Kamena vuna u zidu</span>
              <span className="w111-seg__sub">Toplotna i zvučna izolacija između profila</span>
            </span>
          </label>
        </div>
      </section>

      {/* ——— Presjek ——— */}
      <section className="w111-visual" aria-label="Presjek zida">
        <div className="w111-visual__head">
          <p className="w111-label">Presjek · pogled odozgo</p>
          <p className="w111-visual__dims tabular-nums">
            <span>
              <b className="display">{wallThickness(cladding)}</b> mm debljina
            </span>
            <span>
              <b className="display">{nf(area || 0)}</b> m² zida
            </span>
          </p>
        </div>
        <Section cladding={cladding} color={plateDef.color} wool={wool} />
        <ul className="w111-legend">
          <li>
            <i style={{ background: plateDef.color }} /> {plateDef.code} 12,5 mm × {cladding === 'double' ? 2 : 1} sa svake strane
          </li>
          <li>
            <i className="w111-legend__stud" /> CW 75 na 625 mm, UW 75 pod i plafon
          </li>
          {wool && (
            <li>
              <i className="w111-legend__wool" /> Kamena vuna 50 mm
            </li>
          )}
        </ul>
      </section>

      {/* ——— Spisak materijala ——— */}
      <section className="w111-bom" aria-label="Spisak materijala">
        <div className="w111-bom__head">
          <h2 className="display text-[clamp(28px,3.4vw,52px)] !leading-[0.95]">Spisak materijala</h2>
          <p className="w111-hint">Uračunato {Math.round(WASTE * 100)}% otpada · količine zaokružene na cijela pakovanja</p>
        </div>

        <div className="w111-table" role="table" aria-label="Materijal">
          <div className="w111-tr w111-tr--head" role="row">
            <span role="columnheader">Artikal</span>
            <span role="columnheader" className="text-right">Potrebno</span>
            <span role="columnheader" className="text-right">Kupujete</span>
            <span role="columnheader" className="text-right">Cijena</span>
          </div>
          {rows.map((r) => (
            <div key={r.key} className="w111-tr" role="row">
              <span role="cell" className="w111-item">
                <img decoding="async" src={shotOf(r.sku)} alt="" />
                <span className="min-w-0">
                  <span className="w111-item__name">{r.name}</span>
                  <span className="w111-hint !mt-0.5">{r.sku}</span>
                </span>
              </span>
              <span role="cell" className="w111-num">
                {nf(r.need, 1)} {r.unit}
              </span>
              <span role="cell" className="w111-num">
                <b>{nf(r.packs, 0)}</b> {r.packName}
              </span>
              <span role="cell" className="w111-num">
                {money(r.price)}
              </span>
            </div>
          ))}
        </div>

        <div className="w111-total">
          <dl className="w111-total__nums">
            <div>
              <dt className="w111-label">Ukupno sa PDV-om{discount > 0 ? ` · rabat ${Math.round(discount * 100)}%` : ''}</dt>
              <dd className="display tabular-nums">{money(total)}</dd>
            </div>
            <div>
              <dt className="w111-label">Masa tereta</dt>
              <dd className="display tabular-nums">{nf(kg / 1000, 2)} t</dd>
            </div>
          </dl>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <Cta solid onClick={addAll}>
              Dodaj sve u korpu
            </Cta>
            <p className="w111-hint">{kg >= 1000 ? 'Preko tone — preporučujemo dostavu kamionom sa kranom.' : 'Za veće projekte pošaljite nacrt — vraćamo tačnu specifikaciju.'}</p>
          </div>
        </div>

        <details className="w111-norms">
          <summary>Normativ po m² zida (obje strane)</summary>
          <ul>
            {NORMS.map((n) => (
              <li key={n.key}>
                <span>{n.label}</span>
                <span className="tabular-nums">
                  {nf(n.perM2.single)} / {nf(n.perM2.double)} {n.unit}
                </span>
              </li>
            ))}
          </ul>
          <p className="w111-hint">Jednostruka / dvostruka obloga, prije dodatka od 5% otpada. Orijentaciono, po Knauf tehničkom listu W111.</p>
        </details>
      </section>
    </div>
  )
}
