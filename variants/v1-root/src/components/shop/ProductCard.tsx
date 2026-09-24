'use client'

import { AVAIL_LABEL, categoryLabel, formatPrice, type Product } from '@/lib/shop'
import { COLORS } from '@/lib/content'
import { AvailDot, Plate } from './parts'
import { useShop } from './ShopProvider'

// Kartica artikla. Tekst je tamni (ink), a akcent sekcije (--acc) nosi samo dugmad i linije.
export default function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { add, saved, toggleSaved, compare, toggleCompare, openPanel } = useShop()
  const isSaved = saved.includes(p.id)
  const isCompared = compare.includes(p.id)

  return (
    <article className="group relative text-ink">
      <div className="relative">
        <button
          type="button"
          className="block w-full cursor-pointer text-left"
          onClick={() => openPanel({ kind: 'product', id: p.id })}
          aria-label={`Pregled artikla: ${p.name}`}
        >
          <Plate tone={p.tone} index={index} className="aspect-[4/5] w-full" />
        </button>

        {(p.isNew || p.bestseller) && (
          <span className="lbl pointer-events-none absolute left-3 top-3 bg-bg px-2.5 py-2 text-ink">
            {p.isNew ? 'Novo' : 'Najtraženije'}
          </span>
        )}

        {/* Brze radnje: na uređajima sa mišem se pojavljuju iznad ploče, na dodir su uvijek tu. */}
        <div className="card-actions absolute right-3 top-3 flex flex-col items-end gap-2 max-md:bottom-3 max-md:top-auto max-md:flex-row">
          <button
            type="button"
            aria-pressed={isSaved}
            onClick={() => toggleSaved(p.id)}
            className="lbl cursor-pointer px-2.5 py-2 transition-colors"
            style={{ background: isSaved ? COLORS.why : 'var(--bg)', color: 'var(--ink)' }}
          >
            {isSaved ? 'Sačuvano' : 'Sačuvaj'}
          </button>
          <button
            type="button"
            aria-pressed={isCompared}
            onClick={() => toggleCompare(p.id)}
            className="lbl cursor-pointer px-2.5 py-2 transition-colors"
            style={{ background: isCompared ? COLORS.why : 'var(--bg)', color: 'var(--ink)' }}
          >
            {isCompared ? 'U poređenju' : 'Poredi'}
          </button>
        </div>
      </div>

      <div data-reveal style={{ ['--i' as string]: index }}>
        <div className="lbl mt-4 flex items-center justify-between gap-3" style={{ color: COLORS.base }}>
          <span>
            <AvailDot avail={p.avail} />
            {AVAIL_LABEL[p.avail]}
          </span>
          <span className="text-right">{categoryLabel(p.category)}</span>
        </div>

        <h3 className="copy mt-3 min-h-[2.6em]">
          <button type="button" className="cursor-pointer text-left" onClick={() => openPanel({ kind: 'product', id: p.id })}>
            {p.name}
          </button>
        </h3>
        <p className="lbl mt-2" style={{ color: COLORS.base }}>
          {p.specs.dimenzije !== '—' ? p.specs.dimenzije : p.specs.pakovanje}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
          <p className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="font-serif leading-none [font-size:clamp(24px,2.1vw,32px)]">{formatPrice(p.price)}</span>
            <span className="lbl" style={{ color: COLORS.base }}>
              / {p.unit}
            </span>
          </p>
          <button type="button" className="pill max-sm:w-full" onClick={() => add(p.id)}>
            Dodaj u korpu
          </button>
        </div>
      </div>
    </article>
  )
}
