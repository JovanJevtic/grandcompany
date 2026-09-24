// Adapter: Marijine komponente (grand-cipher) koriste ove nazive i tipove, a podaci dolaze iz zajedničkog
// kataloga Grand Company (src/gc — ne mijenjati tamo, sinhronizuje se iz variants/shared).

import {
  CATEGORIES,
  PRODUCTS as GC_PRODUCTS,
  STOCK_LABEL as GC_STOCK_LABEL,
  defaultQty,
  plural,
  stockLevel,
  type CategoryId,
  type Product as GcProduct,
  type StockLevel,
} from '@/gc/gc'

export type CatId = CategoryId
export type Stock = StockLevel

export type Product = GcProduct & {
  id: string
  cat: CatId
  /** Nivo zalihe (iz stvarne količine na stanju) */
  level: Stock
  /** Korak količine u korpi: jedno pakovanje (ploča = 2,5 m²) ili 1 */
  step: number
  facts: [string, string][]
}

export type Cat = { id: CatId; name: string; lead: string; text: string; photo: string; facts: string[] }

const round2 = (n: number) => Math.round(n * 100) / 100

// 1.290,00 — ručno, da server i preglednik uvijek daju isti tekst
export function num(n: number, dec = 2) {
  const [int, d] = n.toFixed(dec).split('.')
  const i = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return d ? `${i},${d}` : i
}
export const km = (n: number) => `${num(n)} KM`
/** Količina bez suvišnih decimala: 12,5 · 3 · 0,6 */
export const qtyText = (n: number) => (Number.isInteger(n) ? num(n, 0) : num(round2(n)).replace(/0$/, ''))

export const PRODUCTS: Product[] = GC_PRODUCTS.map((p) => {
  const level = stockLevel(p)
  const facts: [string, string][] = [
    ['Proizvođač', p.brand],
    ['Specifikacija', p.spec],
    ['Prodaje se po', p.pack ? `${p.unit}, ${p.pack.name} = ${qtyText(p.pack.size)} ${p.unit}` : p.unit],
    ['Težina', `${qtyText(p.weight)} kg / ${p.unit}`],
    ['Na stanju', `${num(p.stock, 0)} ${p.unit}`],
  ]
  return { ...p, id: p.sku, cat: p.category, level, step: defaultQty(p), facts }
})

export const CATS: Cat[] = CATEGORIES.map((c) => ({
  id: c.id,
  name: c.label,
  lead: c.lead,
  text: c.usage,
  photo: c.photo,
  facts: GC_PRODUCTS.filter((p) => p.category === c.id)
    .slice(0, 5)
    .map((p) => p.name),
}))

export const STOCK_LABEL: Record<Stock, string> = GC_STOCK_LABEL

// Vrste radova ("Šta gradite?"): koji artikli iz kataloga pripadaju kojem poslu.
export type UseId = 'pregradni-zid' | 'spusteni-plafon' | 'fasada' | 'potkrovlje' | 'podovi'
export const USES: { id: UseId; name: string; hint: string; skus: string[] }[] = [
  {
    id: 'pregradni-zid',
    name: 'Pregradni zid',
    hint: 'Ploče, CW/UW profili, kamena vuna, mase i vijci',
    skus: ['KNF-001', 'KNF-002', 'KNF-003', 'KNF-004', 'PRF-050', 'PRF-075', 'PRF-100', 'PRF-UW75', 'ISO-001', 'ISO-002', 'CHM-001', 'CHM-002', 'ACC-001', 'ACC-002', 'ACC-003', 'ACC-004', 'ACC-005'],
  },
  {
    id: 'spusteni-plafon',
    name: 'Spušteni plafon',
    hint: 'CD/UD profili, ovjesi, ploče i glet',
    skus: ['KNF-001', 'KNF-002', 'KNF-003', 'PRF-CD60', 'PRF-UD28', 'ACC-006', 'ACC-001', 'ACC-003', 'ACC-004', 'ACC-005', 'CHM-001', 'CHM-002', 'CHM-007'],
  },
  {
    id: 'fasada',
    name: 'Fasada / demit',
    hint: 'Stiropor, grafitni EPS, XPS i ljepila za armiranje',
    skus: ['ISO-004', 'ISO-006', 'ISO-007', 'CHM-003', 'CHM-004'],
  },
  {
    id: 'potkrovlje',
    name: 'Potkrovlje',
    hint: 'Vuna u rolni, kamena vuna i obloga na CD profilima',
    skus: ['ISO-002', 'ISO-003', 'KNF-001', 'KNF-002', 'PRF-CD60', 'PRF-UD28', 'ACC-006', 'ACC-001', 'CHM-001'],
  },
  {
    id: 'podovi',
    name: 'Podovi',
    hint: 'Podni stiropor, XPS, cement i ljepilo za keramiku',
    skus: ['ISO-005', 'ISO-007', 'CHM-006', 'CHM-005'],
  },
]
export const nameOfUse = (id: UseId) => USES.find((u) => u.id === id)?.name ?? ''

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)
export const catName = (id: CatId) => CATS.find((c) => c.id === id)?.name ?? ''

export const artikala = (n: number) => `${n} ${plural(n, 'artikal', 'artikla', 'artikala')}`

// Pretraga ignoriše dijakritike i crtice: "gips karton ploca" nalazi "Gips-karton ploča".
export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[-–/]/g, ' ')

export { round2 }
