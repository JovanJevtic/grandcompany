'use client'

import { useRef, useState } from 'react'
import { addToCart, openView, toggleCompare, toggleSaved } from '@/lib/cart'
import { defaultQty, money, qtyLabel, type Product } from '@/lib/shop'
import { STOCK_LABEL, stockLevel, type StockLevel } from '@/gc/gc'
import { Icon } from '../ui'
import ProductImage from './ProductImage'

export function StockDot({ level, className = '' }: { level: StockLevel; className?: string }) {
  return (
    <span className={`flex items-center gap-2 text-[12px] ${className}`}>
      <span
        aria-hidden
        className={`inline-block size-[7px] rounded-full ${
          level === 'high' ? 'bg-ink' : level === 'mid' ? 'bg-ink/45' : 'border border-ink'
        }`}
      />
      {STOCK_LABEL[level]}
    </span>
  )
}

export function Stepper({
  value,
  step,
  unit,
  onChange,
  className = '',
}: {
  value: number
  step: number
  unit: string
  onChange: (n: number) => void
  className?: string
}) {
  const r = (n: number) => Math.round(n * 100) / 100
  return (
    <div className={`flex h-10 items-stretch border border-ink/25 ${className}`}>
      <button
        type="button"
        aria-label="Manje"
        disabled={value <= step}
        onClick={() => onChange(r(value - step))}
        className="grid w-8 shrink-0 place-items-center transition-opacity hover:opacity-60 disabled:opacity-25"
      >
        <Icon name="minus" className="size-3.5" />
      </button>
      <span aria-live="polite" className="grid min-w-0 flex-1 place-items-center whitespace-nowrap px-1 text-[13px] tnum">
        {qtyLabel(value, unit)}
      </span>
      <button
        type="button"
        aria-label="Više"
        onClick={() => onChange(r(value + step))}
        className="grid w-8 shrink-0 place-items-center transition-opacity hover:opacity-60"
      >
        <Icon name="plus" className="size-3.5" />
      </button>
    </div>
  )
}

// Product card, canon from DESIGN-SYSTEM.md: photo on well → name → BREND · SPEC → price with unit →
// stock dot → qty + U KORPU. Save and compare are icon toggles on the photo; the photo opens the quick view.
export default function ProductCard({
  product: p,
  saved,
  compared,
  sizes,
}: {
  product: Product
  saved: boolean
  compared: boolean
  sizes?: string
}) {
  const step = defaultQty(p)
  const [qty, setQty] = useState(step)
  const photo = useRef<HTMLButtonElement>(null)

  return (
    <article className="flex h-full min-w-0 flex-col">
      <div className="group relative">
        <button
          ref={photo}
          type="button"
          onClick={() => openView(p.id, photo.current)}
          aria-label={`Brzi pregled: ${p.name}`}
          className="block w-full"
        >
          <ProductImage
            src={p.photo}
            alt={p.name}
            illustrative={p.illustrative}
            sizes={sizes}
            className="aspect-[4/5] w-full [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-[1.03]"
          />
        </button>
        {p.badge && (
          <span className="eyebrow pointer-events-none absolute left-2 top-2 bg-ink px-1.5 py-1 text-[9px] text-canvas">
            {p.badge}
          </span>
        )}
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <button
            type="button"
            aria-pressed={saved}
            aria-label={`${saved ? 'Ukloni iz sačuvanih' : 'Sačuvaj'}: ${p.name}`}
            onClick={() => toggleSaved(p.id)}
            className="grid size-8 place-items-center bg-canvas/90 transition-colors hover:bg-canvas aria-pressed:bg-ink aria-pressed:text-canvas"
          >
            <Icon name="saved" className="size-[17px]" filled={saved} />
          </button>
          <button
            type="button"
            aria-pressed={compared}
            aria-label={`${compared ? 'Ukloni iz poređenja' : 'Poredi'}: ${p.name}`}
            onClick={() => toggleCompare(p.id)}
            className="grid size-8 place-items-center bg-canvas/90 transition-colors hover:bg-canvas aria-pressed:bg-ink aria-pressed:text-canvas"
          >
            <Icon name="compare" className="size-[17px]" />
          </button>
        </div>
      </div>

      <h3 className="mt-3 line-clamp-2 text-[14.5px] font-medium leading-[1.3] md:text-[15px]">
        <button type="button" className="text-left hover:underline" onClick={() => openView(p.id, photo.current)}>
          {p.name}
        </button>
      </h3>
      <p className="eyebrow mt-1.5 line-clamp-1 text-[10px] text-muted">
        {p.brand === 'Ostali proizvođači' ? p.spec : `${p.brand} · ${p.spec}`}
      </p>
      <p className="mt-2.5 text-[15px] font-medium tnum">
        {money(p.price)} <span className="font-normal text-muted">/ {p.unit}</span>
      </p>
      <StockDot level={stockLevel(p)} className="mt-1.5 text-muted" />

      <div className="mt-auto grid gap-1.5 pt-3.5 sm:grid-cols-[1fr_auto]">
        <Stepper value={qty} step={step} unit={p.unit} onChange={setQty} />
        <button
          type="button"
          onClick={() => addToCart(p.id, qty)}
          aria-label={`Dodaj u korpu: ${p.name}, ${qtyLabel(qty, p.unit)}`}
          className="btn-solid h-10 !px-3.5 !py-0 !text-[11px]"
        >
          U korpu
        </button>
      </div>
    </article>
  )
}
