'use client'

import type { CSSProperties } from 'react'
import { addToCart, toggleSaved } from '@/lib/cart'
import { TONES } from '@/lib/reveal'
import { money, type Product } from '@/lib/shop'
import { useInView } from '@/lib/useInView'

type Props = {
  product: Product
  index: number
  qty: number
  saved: boolean
  // U horizontalnom nizu ploče su odmah otvorene, jer izvan ekrana ne mogu "ući" u vidno polje.
  reveal?: boolean
}

export default function ProductCard({ product: p, index, qty, saved, reveal = true }: Props) {
  const [ref, seen] = useInView<HTMLElement>()
  const badge = p.isNew ? 'Novo' : p.badge

  return (
    <article
      ref={ref}
      data-reveal={reveal ? '' : undefined}
      data-in={seen ? '' : undefined}
      className="flex h-full min-w-0 flex-col"
    >
      <div className="relative">
        <div
          data-plate
          className="aspect-[4/5] w-full hover:brightness-95"
          style={{ background: TONES[index % TONES.length], '--d': `${(index % 4) * 90}ms` } as CSSProperties}
        />
        {badge && (
          <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-micro uppercase text-bg">{badge}</span>
        )}
        <button
          type="button"
          onClick={() => toggleSaved(p.id)}
          aria-pressed={saved}
          aria-label={`${saved ? 'Ukloni iz sačuvanih' : 'Sačuvaj'}: ${p.name}`}
          className="absolute right-3 top-3 bg-bg px-2 py-1 text-micro uppercase transition-colors duration-300 hover:bg-ink hover:text-bg"
        >
          {saved ? 'Sačuvano' : 'Sačuvaj'}
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3 uppercase">
        <div className="min-w-0">
          <h3 className="text-small">{p.name}</h3>
          <p className="mt-1.5 text-micro text-ink/60">{p.spec}</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block whitespace-nowrap text-small tabular-nums">{money(p.price)}</span>
          <span className="mt-1.5 block text-micro text-ink/60">/ {p.unit}</span>
        </p>
      </div>

      {/* mt-auto: dugmad svih kartica u redu stoje na istoj visini, bez obzira na dužinu naziva. */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={() => addToCart(p.id)}
          aria-label={`Dodaj u korpu: ${p.name}`}
          className="flex w-full items-center justify-between border-2 border-ink px-3 py-3 text-micro uppercase transition-colors duration-300 hover:bg-ink hover:text-bg"
        >
          <span>{qty ? `U korpi · ${qty}` : 'U korpu'}</span>
          <span aria-hidden>+</span>
        </button>
      </div>
    </article>
  )
}
