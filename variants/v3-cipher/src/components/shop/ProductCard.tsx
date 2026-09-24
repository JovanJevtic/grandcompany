'use client'

import { useRef } from 'react'
import { pad } from '@/lib/content'
import { STOCK_LABEL, km, type Product } from '@/lib/shop'
import { useShop } from './ShopProvider'
import { tileBg, tileInk } from './tile'

const DOT: Record<Product['stock'], string> = {
  'na-stanju': 'bg-fg',
  malo: 'border border-fg bg-[linear-gradient(90deg,var(--fg)_50%,transparent_50%)]',
  narudzba: 'border border-fg',
}

// Kartica artikla: siva ploča (mjesto za fotografiju), stanje, naziv, cijena i dugme za korpu.
// Klik na ploču uvećava artikal (brzi pregled), kao što se uvećavaju ploče u heroju.
export default function ProductCard({ p, no, className = '' }: { p: Product; no: number; className?: string }) {
  const { add, added, openView } = useShop()
  const tile = useRef<HTMLButtonElement>(null)
  const ink = tileInk(p.tile)
  const just = added === p.id

  return (
    <article data-card className={`iso-i group flex flex-col ${className}`}>
      <button
        ref={tile}
        type="button"
        aria-label={`Brzi pregled: ${p.name}`}
        onClick={() => openView(p, tile.current!.getBoundingClientRect())}
        className="relative block aspect-[4/5] w-full cursor-pointer overflow-hidden"
      >
        <span
          aria-hidden
          className="absolute inset-0 transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
          style={{ background: tileBg(p.tile) }}
        />
        {p.isNew && (
          <span className="info absolute left-3 top-3 border border-current px-2 py-[7px] font-semibold" style={{ color: ink }}>
            Novo
          </span>
        )}
        <span className="info absolute inset-x-3 bottom-3 flex justify-between font-medium" style={{ color: ink }}>
          <span>{pad(no)}</span>
          <span className="opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-md:hidden">Brzi pregled +</span>
        </span>
      </button>

      <div className="info mt-3 flex items-center justify-between text-dim">
        <span className="flex items-center gap-2">
          <i aria-hidden className={`inline-block size-[7px] rounded-full ${DOT[p.stock]}`} />
          {STOCK_LABEL[p.stock]}
        </span>
        <span>/ {p.unit}</span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <h3 className="text-[15px] font-medium leading-[1.25] tracking-[-0.01em]">{p.name}</h3>
        <p className="whitespace-nowrap text-[15px] font-medium tabular-nums">{km(p.price)}</p>
      </div>
      <p className="mt-1.5 text-[13px] leading-[1.35] text-dim">{p.spec}</p>

      {/* dugme uvijek na dnu kartice, čak i kad je naziv u dva reda */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={() => add(p.id)}
          aria-label={`Dodaj u korpu: ${p.name}`}
          className={`btn w-full justify-between ${just ? 'btn-solid' : ''}`}
        >
          <span>{just ? 'Dodato u korpu ✓' : '+ Dodaj u korpu'}</span>
          <span className="tabular-nums max-md:hidden">{km(p.price)}</span>
        </button>
      </div>
    </article>
  )
}
