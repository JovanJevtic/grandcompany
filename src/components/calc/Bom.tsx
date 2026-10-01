'use client'

import { bySku } from '@/gc/gc'
import { addToCart, notify } from '@/lib/cart'
import { useB2B, withDiscount } from '@/lib/b2b'
import { recommendCrane, tons } from '@/lib/logistics'
import { money, qtyLabel, type BomItem } from '@/lib/shop'
import Cta from '@/components/ui/Cta'

// Spisak materijala (BOM) za rezultat kalkulatora: šifra, artikal, količina, cijena.
// Prijavljen B2B partner vidi svoju ugovorenu cijenu (maloprodajna je precrtana).
// Ispod: ukupno, masa u tonama sa preporukom kamiona sa kranom, i "Dodaj sve u korpu".

export type BomRow = BomItem & { name: string; unit: string; retail: number; price: number; kg: number }

export function useBomRows(items: BomItem[]) {
  const { discount } = useB2B()
  const rows: BomRow[] = items.map((it) => {
    const p = bySku(it.sku)
    const unitPrice = p?.price ?? 0
    return {
      ...it,
      name: p?.name ?? it.sku,
      unit: p?.unit ?? '',
      retail: unitPrice * it.qty,
      price: withDiscount(unitPrice, discount) * it.qty,
      kg: (p?.weight ?? 0) * it.qty,
    }
  })
  const total = Math.round(rows.reduce((s, r) => s + r.price, 0) * 100) / 100
  const retail = Math.round(rows.reduce((s, r) => s + r.retail, 0) * 100) / 100
  const kg = Math.round(rows.reduce((s, r) => s + r.kg, 0))
  return { rows, total, retail, kg, discount }
}

export default function Bom({ items, label }: { items: BomItem[]; label: string }) {
  const { rows, total, retail, kg, discount } = useBomRows(items)

  const addAll = () => {
    rows.forEach((r) => addToCart(r.sku, r.qty))
    notify(`${label}: spisak je u korpi`, { label: 'Korpa', open: 'cart' })
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[11.5px] sm:min-w-[520px]">
          <caption className="sr-only">Spisak materijala</caption>
          <thead>
            <tr className="border-b border-ink/25 text-[10.5px] opacity-55">
              <th className="py-3 pr-3 font-medium max-sm:hidden">Šifra</th>
              <th className="py-3 pr-3 font-medium">Artikal</th>
              <th className="py-3 pr-3 text-right font-medium">Količina</th>
              <th className="py-3 text-right font-medium">Cijena</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku} className="border-b border-ink/12 align-top">
                <td className="py-3 pr-3 tabular-nums opacity-60 max-sm:hidden">{r.sku}</td>
                <td className="py-3 pr-3">
                  <span className="block leading-[1.35]">{r.name}</span>
                  <span className="text-[10.5px] opacity-50">{r.note}</span>
                </td>
                <td className="whitespace-nowrap py-3 pr-3 text-right tabular-nums">{qtyLabel(r.qty, r.unit)}</td>
                <td className="whitespace-nowrap py-3 text-right tabular-nums">
                  {discount > 0 && <span className="mr-2 block opacity-40 line-through sm:inline">{money(r.retail)}</span>}
                  {money(r.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <p>
            <span className="block text-[10.5px] opacity-55">Ukupno sa PDV-om{discount > 0 ? ` · rabat ${Math.round(discount * 100)}%` : ''}</span>
            <span className="num mt-1 block text-[clamp(30px,3vw,44px)] leading-none">{money(total)}</span>
            {discount > 0 && <span className="mt-1 block text-[10.5px] opacity-45 line-through">{money(retail)}</span>}
          </p>
          <p>
            <span className="block text-[10.5px] opacity-55">Masa tereta</span>
            <span className="num mt-1 block text-[clamp(30px,3vw,44px)] leading-none">{tons(kg)} t</span>
            <span className="mt-1 block text-[10.5px] opacity-60">
              {recommendCrane(kg) ? 'Preporuka: kamion sa kranom' : 'Standardna dostava je dovoljna'}
            </span>
          </p>
        </div>
        <Cta solid onClick={addAll}>
          Dodaj sve
        </Cta>
      </div>
    </div>
  )
}
