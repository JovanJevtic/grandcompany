'use client'

import { useB2B, withDiscount } from '@/lib/b2b'
import { money } from '@/lib/shop'

// Cijena artikla (sa PDV-om). U B2B načinu za prijavljenog partnera: cijena sa ugovorenim rabatom,
// maloprodajna precrtana i mala oznaka rabata (npr. −18%). U maloprodaji: kataloška cijena.
export default function Price({ value, qty = 1, unit, className = '' }: { value: number; qty?: number; unit?: string; className?: string }) {
  const { discount } = useB2B()
  const retail = value * qty
  if (!discount)
    return (
      <span className={`tabular-nums ${className}`}>
        {money(retail)}
        {unit && <span className="opacity-50"> / {unit}</span>}
      </span>
    )
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 tabular-nums ${className}`}>
      <span>{money(withDiscount(value, discount) * qty)}</span>
      {unit && <span className="-ml-1 opacity-50">/ {unit}</span>}
      <s className="text-[0.85em] opacity-45">{money(retail)}</s>
      <span className="b2b-pill">−{Math.round(discount * 100)}%</span>
    </span>
  )
}
