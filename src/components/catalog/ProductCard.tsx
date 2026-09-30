'use client'

import Link from 'next/link'
import { STOCK_LABEL, stockLevel } from '@/gc/gc'
import { addToCart, toggleSaved, useShop } from '@/lib/cart'
import { defaultQty, money, type Product } from '@/lib/shop'
import GlyphDraw from './GlyphDraw'

type Props = { product: Product; view: 'grid' | 'list' }

export default function ProductCard({ product, view }: Props) {
  const { saved } = useShop()
  const isSaved = saved.includes(product.id)
  const stock = stockLevel(product)

  if (view === 'list') {
    return (
      <article
        data-flip-id={product.id}
        className="grid grid-cols-[1fr_auto] gap-3 border-t-2 border-ink py-4 md:grid-cols-[110px_1fr_160px_130px_auto] md:items-center md:px-3"
      >
        <GlyphDraw product={product} className="hidden h-16 md:block" />
        <div>
          <p className="font-mono text-[11px] uppercase opacity-60">{product.sku} · {product.brand}</p>
          <Link href={`/prodavnica/${product.sku}`} className="mt-1 block text-lg uppercase leading-none">
            {product.name}
          </Link>
          <p className="mt-2 font-mono text-[11px] uppercase opacity-60">{product.spec}</p>
        </div>
        <p className="hidden font-mono text-xs uppercase md:block">
          <i className="mr-2 inline-block size-2 bg-accent" />{STOCK_LABEL[stock]}
        </p>
        <p className="font-mono text-sm uppercase tabular-nums">{money(product.price)} / {product.unit}</p>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={isSaved ? 'Ukloni iz sačuvanih' : 'Sačuvaj'}
            onClick={() => toggleSaved(product.id)}
            className="min-h-10 border-2 border-ink px-3"
          >
            {isSaved ? '■' : '□'}
          </button>
          <button
            type="button"
            onClick={() => addToCart(product.id, defaultQty(product))}
            className="min-h-10 border-2 border-ink px-3 font-mono text-[11px] uppercase"
          >
            + U korpu
          </button>
        </div>
      </article>
    )
  }

  return (
    <article data-flip-id={product.id} className="product-card flex flex-col border-2 border-ink bg-well p-4">
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-wide">
        <span>{product.sku} · {product.brand}</span>
        <button
          type="button"
          aria-label={isSaved ? 'Ukloni iz sačuvanih' : 'Sačuvaj'}
          onClick={() => toggleSaved(product.id)}
          className="min-h-10 min-w-10"
        >
          {isSaved ? '■' : '□'}
        </button>
      </div>
      <Link href={`/prodavnica/${product.sku}`} className="flex flex-1 flex-col">
        <div className="product-plate relative my-3 aspect-[4/3] overflow-hidden border-y border-ink/20">
          <GlyphDraw product={product} className="relative z-10 h-full p-4" />
        </div>
        <h2 className="text-[clamp(19px,1.7vw,28px)] uppercase leading-[.96]">{product.name}</h2>
        <p className="mt-2 font-mono text-[11px] uppercase opacity-60">{product.spec}</p>
      </Link>
      <div className="mt-5 flex items-end justify-between gap-3 border-t border-ink pt-4">
        <div>
          <p className="font-mono text-[11px] uppercase">
            <i className="mr-2 inline-block size-2 bg-accent" />{STOCK_LABEL[stock]}
          </p>
          <p className="mt-2 font-mono text-sm uppercase tabular-nums">{money(product.price)} / {product.unit}</p>
        </div>
        <button
          type="button"
          onClick={() => addToCart(product.id, defaultQty(product))}
          className="min-h-10 border-2 border-ink px-3 font-mono text-[11px] uppercase"
        >
          + U korpu
        </button>
      </div>
    </article>
  )
}
