import { CRANE_RECOMMEND_OVER_KG, DELIVERY_ZONES, FREE_DELIVERY_OVER, bySku } from '@/gc/gc'

// Logistika: masa tereta i dostava kamionom sa dizalicom (kranom) direktno na gradilište.
// Izvor: PDF tačka 3 (vlastiti vozni park sa kranovima, istovar paleta na spratove) i podaci
// o zonama dostave (DELIVERY_ZONES). Masa po prodajnoj jedinici je `weight` artikla (kg).

export { DELIVERY_ZONES, CRANE_RECOMMEND_OVER_KG, FREE_DELIVERY_OVER }
export type DeliveryMethod = 'preuzimanje' | 'standard' | 'kran'

/** Ukupna masa korpe u kg (komplet "komplet:..." se preskače — njegove stavke nemaju jedinicu artikla) */
export function cartMassKg(cart: Record<string, number>) {
  return Math.round(
    Object.entries(cart).reduce((s, [key, qty]) => {
      const p = bySku(key)
      return p ? s + p.weight * qty : s
    }, 0),
  )
}

export const tons = (kg: number) => (kg / 1000).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Cijena dostave za zonu i način. Standardna je besplatna preko FREE_DELIVERY_OVER KM. Kran = prevoz + rad dizalice. */
export function deliveryCost(zoneId: string, method: DeliveryMethod, goodsTotal: number) {
  const z = DELIVERY_ZONES.find((x) => x.id === zoneId) ?? DELIVERY_ZONES[0]
  if (method === 'preuzimanje') return 0
  if (method === 'standard') return goodsTotal >= FREE_DELIVERY_OVER ? 0 : z.standard
  return z.kranTransport + z.kranWork
}

/** Preporuka: preko CRANE_RECOMMEND_OVER_KG (1 t) ili kad je istovar na sprat — kamion sa kranom */
export const recommendCrane = (kg: number) => kg >= CRANE_RECOMMEND_OVER_KG
