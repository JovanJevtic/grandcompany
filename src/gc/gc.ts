// Grand Company catalogue shared by the three Next.js variants.
// Source of truth is js/data.js of the HTML site; variants/shared/gc-data.json
// is exported from it, so prices, stock and company data stay identical.
// Do not edit the copies in src/gc/ — edit here and run variants/shared/sync.sh.

import raw from './gc-data.json'

export type CategoryId = 'suha-gradnja' | 'izolacija' | 'veziva' | 'oprema'

export type Category = {
  id: CategoryId
  label: string
  lead: string
  usage: string
  color: string
  /** Application photo (e.g. drywall being built), path under /photos */
  photo: string
}

export type Product = {
  sku: string
  name: string
  brand: string
  spec: string
  desc: string
  /** Retail price with VAT, in KM, per `unit` */
  price: number
  unit: string
  category: CategoryId
  /** Live warehouse quantity (Pantheon in production) */
  stock: number
  /** kg per sales unit */
  weight: number
  featured?: boolean
  pack?: { size: number; name: string }
  /** Packshot: our own photo where one exists, otherwise the product drawing (SVG) */
  image: string
  /** true when `image` is a drawing: show it with object-fit: contain */
  drawing: boolean
  /** Photograph for cards: our own product photo, or a stock photo of the same kind of material */
  photo: string
  /** true when `photo` shows this kind of material, not this exact article (label it "ilustracija") */
  illustrative: boolean
}

export type Partner = {
  id: string
  name: string
  tier: string
  discount: number
  creditLimit: number
  paymentDays: number
}

export type PartnerTier = { name: string; who: string; rebate: string; limit: string; days: string }
export type DeliveryZone = { id: string; label: string; standard: number; kranTransport: number; kranWork: number }
export type WallSystem = { code: string; name: string; use: string; profile: string; thickness: number; build: string; rw: number; skus: string[] }

type Raw = typeof raw

const photoOf = (path: string) => `/photos/${path.split('/').pop()}`

export const COMPANY = raw.COMPANY as Raw['COMPANY']
export const VAT_RATE: number = raw.VAT_RATE
export const FREE_DELIVERY_OVER: number = raw.FREE_STANDARD_DELIVERY_OVER
export const CRANE_RECOMMEND_OVER_KG: number = raw.CRANE_RECOMMEND_OVER_KG

// Material or work shots only — posed stock photos of workers are banned by
// the design system (design/DESIGN-SYSTEM.md, "Fotografija").
const CATEGORY_PHOTO: Record<CategoryId, string> = {
  'suha-gradnja': '/photos/drywall-wall.jpg',
  izolacija: '/photos/facade.jpg',
  veziva: '/photos/pallets-bags.jpg',
  oprema: '/photos/drywall-frame.jpg',
}

export const CATEGORIES: Category[] = raw.CATEGORIES.map((c) => ({
  id: c.id as CategoryId,
  label: c.label,
  lead: c.lead,
  usage: c.usage,
  color: c.color,
  photo: CATEGORY_PHOTO[c.id as CategoryId] ?? photoOf(c.image),
}))

const PHOTOS = raw.PRODUCT_PHOTOS as Record<string, string>

// Pexels stock photos (free licence, see /stock/credits.json) showing the same
// kind of material. Articles with our own photo (PRODUCT_PHOTOS) keep it.
const STOCK_BY_SKU: Record<string, string> = {
  'KNF-001': 'board-stack', 'KNF-002': 'board-green', 'KNF-003': 'board-stack-2', 'KNF-004': 'board-cut',
  'PRF-050': 'profiles-stack', 'PRF-075': 'profiles-stack', 'PRF-100': 'profiles-stack', 'PRF-UW75': 'profiles-stack-2',
  'PRF-CD60': 'profile-texture', 'PRF-UD28': 'profile-wall',
  'ISO-001': 'wool-closeup', 'ISO-002': 'wool-roof', 'ISO-005': 'eps-blocks', 'ISO-006': 'eps-board',
  'CHM-001': 'filler-spatula', 'CHM-002': 'filler-spatula-2', 'CHM-003': 'bag-pour', 'CHM-004': 'eps-facade',
  'CHM-005': 'tile-adhesive', 'CHM-007': 'plaster-texture',
  'ACC-001': 'screws-wood', 'ACC-002': 'screws-wood-2', 'ACC-004': 'tape-rolls', 'ACC-005': 'tape-rolls-2',
  'ACC-006': 'board-green-ceiling',
}

export const PRODUCTS: Product[] = raw.PRODUCTS.map((p) => ({
  sku: p.sku,
  name: p.name,
  brand: p.brand,
  spec: p.spec,
  desc: p.desc,
  price: p.price,
  unit: p.unit,
  category: p.category as CategoryId,
  stock: p.stock,
  weight: p.weight,
  featured: (p as { featured?: boolean }).featured,
  pack: (p as { pack?: { size: number; name: string } }).pack,
  image: PHOTOS[p.sku] ?? `/products/${p.sku}.svg`,
  drawing: !PHOTOS[p.sku],
  photo: PHOTOS[p.sku] ?? (STOCK_BY_SKU[p.sku] ? `/stock/${STOCK_BY_SKU[p.sku]}.jpg` : `/products/${p.sku}.svg`),
  illustrative: !PHOTOS[p.sku],
}))

/** Stock photography for sections (Pexels, free licence) — names map to /stock/<name>.jpg */
export const STOCK = (name: string) => `/stock/${name}.jpg`

export const PARTNERS = raw.PARTNERS as unknown as Partner[]
export const PARTNER_TIERS = raw.PARTNER_TIERS as PartnerTier[]
export const DELIVERY_ZONES = raw.DELIVERY_ZONES as DeliveryZone[]
export const WALL_SYSTEMS = raw.WALL_SYSTEMS as unknown as WallSystem[]
export const ORDER_STEPS = raw.ORDER_STEPS as [string, string][]
export const FAQ = raw.HOME_FAQ as [string, string][]
export const BRAND_NOTES = raw.BRAND_NOTES as [string, string][]

/** Our own photographs of the yard, fleet and shop (never stock) */
export const PHOTOS_GC = {
  yardAerial: '/photos/stovariste-vazduh.jpg',
  yard: '/photos/stovariste-pregled.jpg',
  yardGate: '/photos/stovariste-ulaz.jpg',
  crane: '/photos/kran-utovar.jpg',
  forklift: '/photos/palete-viljuskar.jpg',
  shop: '/photos/prodavnica.jpg',
  sign: '/photos/tabla.jpg',
} as const

export const bySku = (sku: string) => PRODUCTS.find((p) => p.sku === sku)
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id)

const km2 = new Intl.NumberFormat('sr-Latn-BA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const km = (n: number) => `${km2.format(n)} KM`

/** Quantity a customer picks up in one go (a board is 2,5 m²) */
export const defaultQty = (p: Product) => p.pack?.size ?? 1

export type StockLevel = 'high' | 'mid' | 'low'
export const stockLevel = (p: Product): StockLevel => (p.stock > 1000 ? 'high' : p.stock >= 300 ? 'mid' : 'low')
export const STOCK_LABEL: Record<StockLevel, string> = { high: 'Na stanju', mid: 'Ograničeno', low: 'Malo na stanju' }

/** Serbian plural: 1 artikal, 2–4 artikla, 5+ artikala */
export function plural(n: number, one: string, few: string, many: string) {
  const d10 = n % 10
  const d100 = n % 100
  if (d10 === 1 && d100 !== 11) return one
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return few
  return many
}
