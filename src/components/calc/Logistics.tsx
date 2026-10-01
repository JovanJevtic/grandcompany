'use client'

import { useState } from 'react'
import { DELIVERY_ZONES, FREE_DELIVERY_OVER, deliveryCost, recommendCrane, tons, type DeliveryMethod } from '@/lib/logistics'
import { money } from '@/lib/shop'

// Logistika i kran transport za trenutni rezultat kalkulatora: zona, način dostave, masa u tonama,
// preporučeno vozilo i cijena (zone i cijene iz kataloga — DELIVERY_ZONES).
export default function Logistics({ kg, goodsTotal }: { kg: number; goodsTotal: number }) {
  const [zone, setZone] = useState(DELIVERY_ZONES[0].id)
  const crane = recommendCrane(kg)
  const [method, setMethod] = useState<DeliveryMethod>('kran')
  const cost = deliveryCost(zone, method, goodsTotal)
  const z = DELIVERY_ZONES.find((x) => x.id === zone) ?? DELIVERY_ZONES[0]

  return (
    <div className="calc-log grid border-y border-ink/15 md:grid-cols-[1.2fr_1fr_1fr] md:border-x [&>*]:min-w-0">
      <div className="border-b border-ink/15 p-6 md:border-b-0 md:border-r">
        <h3 className="display text-[clamp(20px,1.8vw,28px)]">Logistika i kran transport</h3>
        <p className="mt-3 max-w-[46ch] text-[11.5px] leading-[1.6] opacity-65">
          Vlastiti kamioni sa dizalicom istovaraju palete direktno na sprat ili skelu gradilišta.
        </p>
      </div>
      <div className="flex flex-col gap-4 border-b border-ink/15 p-6 md:border-b-0 md:border-r">
        <label className="flex flex-col gap-2 text-[10.5px]">
          <span className="opacity-55">Zona dostave</span>
          <select value={zone} onChange={(e) => setZone(e.target.value)} className="calc-select">
            {DELIVERY_ZONES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-2 text-[10.5px]">
          <span className="opacity-55">Način</span>
          <div className="calc-seg" role="radiogroup" aria-label="Način dostave">
            {(
              [
                ['kran', 'Kamion sa kranom'],
                ['standard', 'Standardna'],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" role="radio" aria-checked={method === id} onClick={() => setMethod(id)} className="calc-seg__opt">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-6">
        <p>
          <span className="block text-[10.5px] opacity-55">Teret</span>
          <span className="num mt-1 block text-[28px] leading-none">{tons(kg)} t</span>
          <span className="mt-1 block text-[10.5px] opacity-60">{crane ? 'Preko 1 t — kamion sa kranom' : 'Do 1 t'}</span>
        </p>
        <p>
          <span className="block text-[10.5px] opacity-55">Dostava</span>
          <span className="num mt-1 block text-[28px] leading-none">{cost === 0 ? 'Gratis' : money(cost)}</span>
          <span className="mt-1 block text-[10.5px] opacity-60">
            {method === 'kran' ? `Prevoz ${money(z.kranTransport)} + kran ${money(z.kranWork)}` : `Besplatno preko ${money(FREE_DELIVERY_OVER)}`}
          </span>
        </p>
      </div>
    </div>
  )
}
