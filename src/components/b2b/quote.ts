import { VAT_RATE, bySku, DELIVERY_ZONES } from '@/gc/gc'
import { withDiscount, type FullPartner } from '@/lib/b2b'
import { cartLines } from '@/lib/cart'
import { cartMassKg, deliveryCost } from '@/lib/logistics'
import type { DeliveryPrefs } from './prefs'

// Obračun korpe za korpu, portal i predračun. Kataloške cijene su SA PDV-om (PDF), pa se
// rabat primjenjuje na bruto cijenu, a osnovica i PDV (VAT_RATE, 17%) izdvajaju se iz ukupnog iznosa.

const r2 = (n: number) => Math.round(n * 100) / 100

export type QuoteLine = { sku: string; name: string; qty: number; unit: string; price: number; discount: number; unitNet: number; total: number }

export function buildQuote(cart: Record<string, number>, discount: number, prefs: DeliveryPrefs) {
  const lines: QuoteLine[] = cartLines(cart).map((l) => {
    const unitNet = withDiscount(l.price, discount)
    return { sku: l.key, name: l.name, qty: l.qty, unit: l.unit, price: l.price, discount, unitNet, total: r2(unitNet * l.qty) }
  })
  const retail = r2(cartLines(cart).reduce((s, l) => s + l.price * l.qty, 0))
  const goods = r2(lines.reduce((s, l) => s + l.total, 0))
  const savings = r2(retail - goods)
  const kg = cartMassKg(cart)
  const delivery = lines.length ? deliveryCost(prefs.zoneId, prefs.method, goods) : 0
  const zone = DELIVERY_ZONES.find((z) => z.id === prefs.zoneId) ?? DELIVERY_ZONES[0]
  const total = r2(goods + delivery)
  const base = r2(total / (1 + VAT_RATE))
  const vat = r2(total - base)
  return { lines, retail, goods, savings, kg, delivery, zone, total, base, vat }
}

/** Ukupan iznos postojeće narudžbe partnera (stavke × kataloška cijena × (1 − rabat) + dostava) */
export function orderTotal(items: [string, number][], discount: number, deliveryCostKm: number) {
  return r2(items.reduce((s, [sku, qty]) => s + withDiscount(bySku(sku)?.price ?? 0, discount) * qty, 0) + deliveryCostKm)
}

/** Datum prije `days` dana, kao dd.mm.gggg. (ručno, da server i browser daju isti tekst) */
export function dateAgo(days: number, from = new Date()) {
  const d = new Date(from.getTime() - days * 86400000)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`
}

export const partnerSite = (p: FullPartner | null, id: string | null) => p?.sites.find((s) => s.id === id) ?? null
