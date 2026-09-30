'use client'

import { useState } from 'react'
import { STOCK_LABEL, stockLevel, type DeliveryZone, type WallSystem } from '@/gc/gc'
import { addToCart, toggleSaved, useShop } from '@/lib/cart'
import { defaultQty, money, qtyLabel, type Product } from '@/lib/shop'

type Props = { product: Product; systems: WallSystem[]; zones: DeliveryZone[] }

export default function ProductBuy({ product, systems, zones }: Props) {
  const step = defaultQty(product)
  const [qty, setQty] = useState(step)
  const { saved } = useShop()
  const level = stockLevel(product)
  const stockWidth = level === 'high' ? '100%' : level === 'mid' ? '64%' : '30%'
  const cheapest = Math.min(...zones.map((zone) => zone.standard))

  return (
    <div className="self-start border-2 border-ink p-5 md:sticky md:top-[calc(var(--site-header-offset,64px)+24px)]">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase">
        <span>Stanje</span>
        <span>{STOCK_LABEL[level]}</span>
      </div>
      <div className="mt-2 h-2 border border-ink p-px">
        <span className="block h-full bg-accent" style={{ width: stockWidth }} />
      </div>

      <p className="mt-6 font-mono text-xs uppercase opacity-60">Cijena sa PDV-om</p>
      <p className="mt-2 text-4xl uppercase tabular-nums">
        {money(product.price)} <small className="font-mono text-xs">/ {product.unit}</small>
      </p>
      {product.pack && (
        <p className="mt-3 font-mono text-[11px] uppercase">
          Prodaje se po {qtyLabel(product.pack.size, product.unit)} — 1 {product.pack.name}
        </p>
      )}

      <div className="mt-6 border-y border-ink py-4 font-mono text-[11px] uppercase">
        <p>Dostava od {money(cheapest)}</p>
        <p className="mt-2 opacity-65">Paletna roba može se istovariti kranom nakon potvrde pristupa.</p>
      </div>

      {systems.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[11px] uppercase opacity-60">Koristi se u sistemima</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {systems.map((system) => (
              <span key={system.code} className="border border-ink px-2 py-1 font-mono text-[11px] uppercase">
                ■ {system.code}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex border-2 border-ink">
        <button
          type="button"
          aria-label="Smanji količinu"
          onClick={() => setQty(Math.max(step, Math.round((qty - step) * 100) / 100))}
          className="min-h-12 w-12"
        >
          −
        </button>
        <span className="grid min-h-12 flex-1 place-items-center border-x-2 border-ink font-mono text-xs">
          {qtyLabel(qty, product.unit)}
        </span>
        <button
          type="button"
          aria-label="Povećaj količinu"
          onClick={() => setQty(Math.round((qty + step) * 100) / 100)}
          className="min-h-12 w-12"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() => addToCart(product.id, qty)}
        className="mt-3 w-full bg-navy px-4 py-4 font-mono text-xs uppercase text-bg"
      >
        Dodaj u korpu · {money(qty * product.price)}
      </button>
      <button
        type="button"
        onClick={() => toggleSaved(product.id)}
        className="mt-3 w-full border-2 border-ink px-4 py-3 font-mono text-xs uppercase"
      >
        {saved.includes(product.id) ? '■ Sačuvano' : '□ Sačuvaj artikal'}
      </button>
    </div>
  )
}
