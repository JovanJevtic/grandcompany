'use client'

import { useState } from 'react'
import { STOCK_LABEL, stockLevel, type DeliveryZone } from '@/gc/gc'
import { addToCart, toggleSaved, useShop } from '@/lib/cart'
import { defaultQty, money, qtyLabel, type Product } from '@/lib/shop'
import Cta from '@/components/ui/Cta'

type Props = { product: Product; zones: DeliveryZone[] }

// Kupovina na stranici artikla: količina u kapsuli (− / +), dugme sa ukupnim iznosom i "Sačuvaj".
export default function ProductBuy({ product, zones }: Props) {
  const step = defaultQty(product)
  const [qty, setQty] = useState(step)
  const { saved } = useShop()
  const isSaved = saved.includes(product.id)
  const level = stockLevel(product)
  const cheapest = Math.min(...zones.map((zone) => zone.standard))

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-[52px] items-center rounded-full border border-ink/20">
          <button
            type="button"
            aria-label="Smanji količinu"
            onClick={() => setQty(Math.max(step, Math.round((qty - step) * 100) / 100))}
            className="grid size-[52px] place-items-center text-xl transition-colors hover:text-signal"
          >
            −
          </button>
          <span className="min-w-[5.5rem] text-center text-[15px] tabular-nums" aria-live="polite">
            {qtyLabel(qty, product.unit)}
          </span>
          <button
            type="button"
            aria-label="Povećaj količinu"
            onClick={() => setQty(Math.round((qty + step) * 100) / 100)}
            className="grid size-[52px] place-items-center text-xl transition-colors hover:text-signal"
          >
            +
          </button>
        </div>
        <Cta solid onClick={() => addToCart(product.id, qty)}>
          Dodaj
        </Cta>
        <span className="text-[15px] tabular-nums opacity-70" aria-live="polite">
          {money(qty * product.price)}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px]">
        <button type="button" onClick={() => toggleSaved(product.id)} aria-pressed={isSaved} className="flex min-h-11 items-center gap-2">
          <span className={`spark size-3.5 transition-opacity ${isSaved ? '' : 'opacity-40 [--spark:var(--ink)]'}`} />
          <span className="ulink">{isSaved ? 'Sačuvano' : 'Sačuvaj'}</span>
        </button>
        <span className="flex items-center gap-2 opacity-60">
          <span className={`spark size-2.5 ${level === 'low' ? '' : '[--spark:var(--ink)]'}`} />
          {STOCK_LABEL[level]}
        </span>
        <span className="opacity-60">Dostava od {money(cheapest)}</span>
      </div>
    </div>
  )
}
