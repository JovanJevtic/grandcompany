'use client'

/* eslint-disable @next/next/no-img-element -- studijske fotografije iz /public, već optimizovane u WebP */

import Link from 'next/link'
import { pw } from '@/components/ui/Pw'
import { addToCart, toggleSaved, useShop } from '@/lib/cart'
import { categoryName, defaultQty, money, type Product } from '@/lib/shop'

type Props = { product: Product; view?: 'grid' | 'list'; size?: 'md' | 'lg'; priority?: boolean; stacked?: boolean }

// Kartica artikla, editorijalno: velika fotografija na polju boje studijske pozadine, ispod ime i cijena.
// Na hover se slika približi, a odozdo izađe kapsula "Dodaj u korpu"; kursor kaže "Pogledaj".
export default function ProductCard({ product, view = 'grid', priority, stacked }: Props) {
  const { saved } = useShop()
  const isSaved = saved.includes(product.id)
  const href = `/prodavnica/${product.sku}`

  if (view === 'list') {
    return (
      <article data-flip-id={product.id} className="group grid grid-cols-[88px_1fr_auto] items-center gap-5 border-t border-ink/15 py-4">
        <Link href={href} className="shot block aspect-[4/5]" data-cursor="Pogledaj">
          <img src={product.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        </Link>
        <div>
          <p className="label opacity-50">{categoryName(product.category)}</p>
          <Link href={href} className="font-pretty mt-1 block text-[clamp(19px,1.5vw,24px)] leading-[1.1]">
            {pw(product.name)}
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <p className="tabular-nums">
            {money(product.price)} <span className="opacity-50">/ {product.unit}</span>
          </p>
          <button
            type="button"
            onClick={() => addToCart(product.id, defaultQty(product))}
            className="grid size-11 place-items-center rounded-full border border-ink/30 text-lg transition-colors hover:border-signal hover:bg-signal hover:text-bg"
            aria-label={`Dodaj u korpu: ${product.name}`}
          >
            +
          </button>
        </div>
      </article>
    )
  }

  return (
    <article data-flip-id={product.id} className="group flex flex-col">
      <div className="relative">
        <Link href={href} className="shot block aspect-[4/5]" data-cursor="Pogledaj" data-float>
          <img
            src={product.image}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </Link>

        <button
          type="button"
          aria-label={isSaved ? 'Ukloni iz sačuvanih' : 'Sačuvaj'}
          aria-pressed={isSaved}
          onClick={() => toggleSaved(product.id)}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full text-ink/70 transition-colors hover:text-signal"
        >
          <span className={`block size-2.5 rounded-full border transition-colors ${isSaved ? 'border-signal bg-signal' : 'border-ink/50'}`} />
        </button>

        {/* Kapsula za brzu kupovinu: izlazi odozdo preko slike */}
        <button
          type="button"
          onClick={() => addToCart(product.id, defaultQty(product))}
          className="absolute inset-x-3 bottom-3 flex min-h-11 translate-y-3 items-center justify-center gap-2 rounded-full bg-ink text-[14px] text-bg opacity-0 transition-[opacity,transform,background-color] duration-500 ease-[var(--ease-out)] hover:bg-signal focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-md:hidden"
        >
          Dodaj u korpu
        </button>
      </div>

      <div className={`flex flex-col gap-1 pt-3 sm:pt-4 ${stacked ? '' : 'sm:flex-row sm:items-start sm:justify-between sm:gap-4'}`}>
        <Link href={href} className="font-pretty text-[clamp(19px,1.45vw,24px)] leading-[1.1]">
          {pw(product.name)}
        </Link>
        <p className="shrink-0 text-[14px] tabular-nums sm:pt-[2px] sm:text-[15px] transition-colors group-hover:text-signal">{money(product.price)}</p>
      </div>
    </article>
  )
}
