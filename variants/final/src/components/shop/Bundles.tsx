'use client'

import { addToCart, openView, useShop } from '@/lib/cart'
import { BUNDLES, KIT_WALL, PRODUCT_MAP, bundleTotals, money, qtyLabel } from '@/lib/shop'
import { SectionTitle } from '../ui'
import ProductImage from './ProductImage'

const KITS = BUNDLES.filter((b) => b.items.length > 0) // W111 and W112: the only systems the W111 norm covers

// Kompleti from grand-maison Bundles: a wall system as one cart line. Quantities by the W111 norm for a
// 4 × 2,5 m wall; no discount (not approved by the company), so the price is the sum of the items.
export default function Bundles() {
  const { cart } = useShop()

  return (
    <section id="kompleti" aria-labelledby="kompleti-h" className="relative z-10 bg-canvas py-16 lg:py-24">
      <div className="gutter wrap">
        <SectionTitle
          id="kompleti-h"
          title="Kompleti za 10 m² zida"
          lead={`Sve za zid ${KIT_WALL.L} × ${KIT_WALL.H.toLocaleString('de-DE')} m u jednoj stavci korpe. Cijena je zbir artikala, bez popusta.`}
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-2 lg:gap-5">
          {KITS.map((b) => {
            const { price } = bundleTotals(b)
            const inCart = cart[`komplet:${b.id}`] ?? 0
            return (
              <article key={b.id} className="flex flex-col bg-surface p-5 md:p-8">
                <div className="grid grid-cols-5 gap-1.5">
                  {b.items.slice(0, 5).map((it) => {
                    const p = PRODUCT_MAP[it.sku]
                    return p ? (
                      <button key={it.sku} type="button" onClick={(e) => openView(p.id, e.currentTarget)} aria-label={`Brzi pregled: ${p.name}`}>
                        <ProductImage src={p.photo} alt={p.name} sizes="120px" className="aspect-square w-full" />
                      </button>
                    ) : null
                  })}
                </div>

                <div className="mt-6 flex items-baseline justify-between gap-4">
                  <h3 className="s-sub">{b.name}</h3>
                  <span className="eyebrow shrink-0 text-[10px] text-muted">Knauf {b.code}</span>
                </div>
                <p className="mt-2 text-[14px] leading-[1.55] text-muted">
                  {b.note} Debljina {b.thickness} mm{b.rw ? `, zvučna izolacija Rw ${b.rw} dB` : ''}.
                </p>

                <ul className="mt-5 border-t border-ink/12 text-[13.5px]">
                  {b.items.map((it) => {
                    const p = PRODUCT_MAP[it.sku]
                    if (!p) return null
                    return (
                      <li key={it.sku} className="flex items-baseline justify-between gap-4 border-b border-ink/12 py-2">
                        <span className="min-w-0">
                          <span className="text-muted tnum">{qtyLabel(it.qty, p.unit)}</span> · {p.name}
                        </span>
                        <span className="shrink-0 tnum">{money(p.price * it.qty)}</span>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
                  <p>
                    <span className="block text-[12px] text-muted">Zbir stavki, za 10 m²</span>
                    <span className="text-[24px] font-medium tnum">{money(price)}</span>
                  </p>
                  <button type="button" onClick={() => addToCart(`komplet:${b.id}`)} className="btn-line">
                    {inCart ? `Komplet u korpi · ${inCart}` : 'Dodaj komplet'} <span aria-hidden>+</span>
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
