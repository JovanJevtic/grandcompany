'use client'

import { useRef } from 'react'
import { pad } from '@/lib/content'
import { STOCK_LABEL, catName, km, qtyText, type Product } from '@/lib/shop'
import ProductImage from './ProductImage'
import { useShop } from './ShopProvider'

const DOT: Record<Product['level'], string> = {
  high: 'bg-fg',
  mid: 'border border-fg bg-[linear-gradient(90deg,var(--fg)_50%,transparent_50%)]',
  low: 'border border-fg',
}

// Kartica artikla: packshot (crtež na svijetloj podlozi ili fotografija), stanje, naziv, cijena, dugme za korpu.
// Klik na sliku uvećava artikal (brzi pregled), kao što se uvećavaju ploče u heroju.
// Ispod: "Sačuvaj" i "Poredi" (iz grand-root), u cipher stilu.
export default function ProductCard({ p, no, className = '' }: { p: Product; no: number; className?: string }) {
  const { add, added, openView, saved, compare, toggleSaved, toggleCompare } = useShop()
  const tile = useRef<HTMLButtonElement>(null)
  const just = added === p.id
  const isSaved = saved.includes(p.id)
  const inCompare = compare.includes(p.id)
  const ink = p.drawing ? '#000' : '#fff'

  return (
    <article data-card className={`iso-i group flex flex-col ${className}`}>
      <button
        ref={tile}
        type="button"
        aria-label={`Brzi pregled: ${p.name}`}
        onClick={() => openView(p, tile.current!.getBoundingClientRect())}
        className="relative block aspect-[4/5] w-full cursor-pointer overflow-hidden"
      >
        <ProductImage p={p} className="transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]" />
        {p.featured && (
          <span className="info absolute left-3 top-3 border border-current px-2 py-[7px] font-semibold" style={{ color: ink }}>
            Najčešće birano
          </span>
        )}
        <span className="info absolute inset-x-3 bottom-3 flex justify-between font-medium" style={{ color: ink }}>
          <span>{pad(no)}</span>
          <span className="opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-md:hidden">Brzi pregled +</span>
        </span>
      </button>

      <div className="info mt-3 flex items-center justify-between gap-3 text-dim">
        <span className="flex items-center gap-2">
          <i aria-hidden className={`inline-block size-[7px] shrink-0 rounded-full ${DOT[p.level]}`} />
          {STOCK_LABEL[p.level]}
        </span>
        <span className="truncate max-md:hidden">{catName(p.cat)}</span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <h3 className="text-[15px] font-medium leading-[1.25] tracking-[-0.01em]">{p.name}</h3>
        <p className="whitespace-nowrap text-right text-[15px] font-medium tabular-nums">
          {km(p.price)}
          <span className="block text-[12px] font-normal text-dim">/ {p.unit}</span>
        </p>
      </div>
      <p className="mt-1.5 text-[13px] leading-[1.35] text-dim">{p.spec}</p>

      {/* dugmad uvijek na dnu kartice, čak i kad je naziv u dva reda */}
      <div className="mt-auto pt-4">
        <div className="mb-2 grid grid-cols-2 gap-2">
          <button type="button" className="chip !px-2 text-center" aria-pressed={isSaved} onClick={() => toggleSaved(p.id)}>
            {isSaved ? 'Sačuvano ✓' : 'Sačuvaj'}
          </button>
          <button type="button" className="chip !px-2 text-center" aria-pressed={inCompare} onClick={() => toggleCompare(p.id)}>
            {inCompare ? 'Poredi ✓' : 'Poredi'}
          </button>
        </div>
        <button
          type="button"
          onClick={() => add(p.id)}
          aria-label={`Dodaj u korpu: ${p.name}`}
          className={`btn w-full justify-between max-md:!px-3 ${just ? 'btn-solid' : ''}`}
        >
          <span>{just ? 'Dodato ✓' : '+ U korpu'}</span>
          <span className="tabular-nums">
            {qtyText(p.step)} {p.unit}
          </span>
        </button>
      </div>
    </article>
  )
}
