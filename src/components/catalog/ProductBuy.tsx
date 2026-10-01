'use client'

import { useState } from 'react'
import { STOCK_LABEL, stockLevel, type DeliveryZone } from '@/gc/gc'
import { addToCart, toggleSaved, useShop } from '@/lib/cart'
import { defaultQty, money, qtyLabel, type Product } from '@/lib/shop'
import Price from '@/components/b2b/Price'
import { useB2B, withDiscount } from '@/lib/b2b'
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
  const { discount, partner } = useB2B()

  return (
    <div>
      {discount > 0 && partner && (
        <p className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-[12px] border border-ink/15 px-4 py-3 text-[11.5px]">
          <span className="opacity-60">Vaša B2B cijena</span>
          <span className="num text-[20px]">{money(withDiscount(product.price, discount))}</span>
          <span className="opacity-60">/ {product.unit} · rabat {Math.round(discount * 100)}% · {partner.name}</span>
        </p>
      )}
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
          <span className="min-w-[5.5rem] text-center text-[12.5px] tabular-nums" aria-live="polite">
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
        <span className="text-[12.5px] opacity-80" aria-live="polite">
          <Price value={product.price} qty={qty} />
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px]">
        <button type="button" onClick={() => toggleSaved(product.id)} aria-pressed={isSaved} className="flex min-h-11 items-center gap-2">
          <span className={`size-2.5 rounded-full border transition-colors ${isSaved ? 'border-signal bg-signal' : 'border-ink/50'}`} />
          <span className="ulink">{isSaved ? 'Sačuvano' : 'Sačuvaj'}</span>
        </button>
        <span className="flex items-center gap-2 opacity-60">
          <span className={`size-1.5 rounded-full ${level === 'low' ? 'bg-signal' : 'bg-ink'}`} />
          {STOCK_LABEL[level]}
        </span>
        <span className="opacity-60">Dostava od {money(cheapest)}</span>
      </div>
    </div>
  )
}
