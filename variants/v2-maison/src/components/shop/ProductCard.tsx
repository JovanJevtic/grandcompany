'use client'

import type { CSSProperties } from 'react'
import { addToCart, openPanel, toggleCompare, toggleSaved } from '@/lib/cart'
import { money, qtyLabel, type Product } from '@/lib/shop'
import { STOCK_LABEL, stockLevel } from '@/gc/gc'
import { useInView } from '@/lib/useInView'
import ProductImage from './ProductImage'

type Props = {
  product: Product
  index: number
  qty: number
  saved: boolean
  compared: boolean
  // U horizontalnom nizu ploče su odmah otvorene, jer izvan ekrana ne mogu "ući" u vidno polje.
  reveal?: boolean
}

const CHIP =
  'flex items-center justify-center border-2 border-ink px-1 py-1.5 text-micro uppercase transition-colors duration-300 hover:bg-ink hover:text-bg aria-pressed:bg-ink aria-pressed:text-bg sm:px-2'

// Na uskom ekranu (dvije kartice u redu) umjesto riječi stoji ikona; naziv ostaje u aria-label.
function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <>
      <svg viewBox="0 0 24 24" aria-hidden className="size-4 sm:hidden" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={icon} />
      </svg>
      <span className="hidden sm:inline">{label}</span>
    </>
  )
}
const EYE = 'M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'
const MARK = 'M6 3.5h12v17l-6-4.5-6 4.5z'
const SWAP = 'M4 7h11m0 0-3-3m3 3-3 3M20 17H9m0 0 3-3m-3 3 3 3'

export default function ProductCard({ product: p, index, qty, saved, compared, reveal = true }: Props) {
  const [ref, seen] = useInView<HTMLElement>()
  const level = stockLevel(p)

  return (
    <article
      ref={ref}
      data-reveal={reveal ? '' : undefined}
      data-in={seen ? '' : undefined}
      className="flex h-full min-w-0 flex-col"
    >
      <div className="group relative">
        <button
          type="button"
          onClick={() => openPanel({ kind: 'product', id: p.id })}
          aria-label={`Brzi pregled: ${p.name}`}
          className="block w-full"
        >
          <div data-plate style={{ '--d': `${(index % 4) * 90}ms` } as CSSProperties}>
            <ProductImage
              src={p.image}
              drawing={p.drawing}
              alt={p.name}
              className="aspect-[4/5] w-full transition-[filter] duration-500 group-hover:brightness-95"
            />
          </div>
          <span className="absolute inset-x-3 bottom-3 hidden bg-ink px-2 py-2 text-center text-micro uppercase text-bg opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
            Brzi pregled
          </span>
        </button>
        {p.badge && (
          <span className="pointer-events-none absolute left-3 top-3 bg-ink px-2 py-1 text-micro uppercase text-bg">
            {p.badge}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3 uppercase">
        <div className="min-w-0">
          <p className="text-micro text-ink/60">{p.brand}</p>
          <h3 className="mt-1 text-small">{p.name}</h3>
          <p className="mt-1.5 text-micro text-ink/60">{p.spec}</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block whitespace-nowrap text-small tabular-nums">{money(p.price)}</span>
          <span className="mt-1.5 block text-micro text-ink/60">/ {p.unit}</span>
        </p>
      </div>

      <p className="mt-2 flex items-center gap-2 text-micro uppercase">
        <span
          aria-hidden
          className={`inline-block size-2 ${level === 'high' ? 'bg-ink' : level === 'mid' ? 'bg-ink/50' : 'border-2 border-ink'}`}
        />
        {STOCK_LABEL[level]}
      </p>

      {/* mt-auto: dugmad svih kartica u redu stoje na istoj visini, bez obzira na dužinu naziva. */}
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            className={CHIP}
            aria-label={`Brzi pregled: ${p.name}`}
            onClick={() => openPanel({ kind: 'product', id: p.id })}
          >
            <Chip icon={EYE} label="Pregled" />
          </button>
          <button
            type="button"
            className={CHIP}
            aria-pressed={saved}
            aria-label={`${saved ? 'Ukloni iz sačuvanih' : 'Sačuvaj'}: ${p.name}`}
            onClick={() => toggleSaved(p.id)}
          >
            <Chip icon={MARK} label={saved ? 'Sačuvano' : 'Sačuvaj'} />
          </button>
          <button
            type="button"
            className={CHIP}
            aria-pressed={compared}
            aria-label={`${compared ? 'Ukloni iz poređenja' : 'Poredi'}: ${p.name}`}
            onClick={() => toggleCompare(p.id)}
          >
            <Chip icon={SWAP} label="Poredi" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => addToCart(p.id)}
          aria-label={`Dodaj u korpu: ${p.name}`}
          className="flex w-full items-center justify-between gap-2 border-2 border-ink px-3 py-3 text-micro uppercase transition-colors duration-300 hover:bg-ink hover:text-bg"
        >
          <span className="truncate">{qty ? `U korpi · ${qtyLabel(qty, p.unit)}` : 'U korpu'}</span>
          <span aria-hidden>+</span>
        </button>
      </div>
    </article>
  )
}
