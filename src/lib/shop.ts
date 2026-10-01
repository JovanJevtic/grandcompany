// Katalog prodavnice. Podaci dolaze iz src/gc (zajednički katalog Grand Company, ne mijenja se ovdje);
// ovaj fajl ih samo prilagođava oblicima koje koriste komponente prodavnice (Product, CATEGORIES, BUNDLES...).

import {
  CATEGORIES as GC_CATEGORIES,
  PRODUCTS as GC_PRODUCTS,
  WALL_SYSTEMS,
  bySku,
  defaultQty,
  plural,
  type CategoryId,
  type Product as GcProduct,
  type WallSystem,
} from '@/gc/gc'

export type { CategoryId }
export { plural, defaultQty }

export type UseId = 'pregradni-zid' | 'spusteni-plafon' | 'fasada' | 'potkrovlje' | 'podovi'
export type SortId = 'preporuceno' | 'cijena-rastuce' | 'cijena-opadajuce' | 'naziv'

export type Product = GcProduct & {
  /** Isto što i sku; komponente prodavnice rade sa `id` */
  id: string
  uses: UseId[]
  badge?: string
}

export type Category = (typeof GC_CATEGORIES)[number] & { name: string }

export const CATEGORIES: Category[] = GC_CATEGORIES.map((c) => ({ ...c, name: c.label }))

export const USES: { id: UseId; name: string; hint: string }[] = [
  { id: 'pregradni-zid', name: 'Pregradni zid', hint: 'Ploče, CW i UW profili, vuna, vijci' },
  { id: 'spusteni-plafon', name: 'Spušteni plafon', hint: 'Ploče, CD i UD profili, ovjesi' },
  { id: 'fasada', name: 'Fasada i demit', hint: 'Stiropor, ljepilo, masa za armiranje' },
  { id: 'potkrovlje', name: 'Potkrovlje', hint: 'Vuna u rolni, ploče, CD profili' },
  { id: 'podovi', name: 'Podovi', hint: 'Podni stiropor, XPS, cement, ljepilo' },
]

// Za koju vrstu radova se artikal koristi. Izvedeno iz namjene artikla (opis u katalogu i sistemi zidova).
const DRY = ['pregradni-zid', 'spusteni-plafon', 'potkrovlje'] as const satisfies UseId[]
const USE_MAP: Record<string, UseId[]> = {
  'KNF-001': [...DRY],
  'KNF-002': [...DRY],
  'KNF-003': [...DRY],
  'KNF-004': ['pregradni-zid'],
  'PRF-050': ['pregradni-zid'],
  'PRF-075': ['pregradni-zid'],
  'PRF-100': ['pregradni-zid'],
  'PRF-UW75': ['pregradni-zid'],
  'PRF-CD60': ['spusteni-plafon', 'potkrovlje'],
  'PRF-UD28': ['spusteni-plafon', 'potkrovlje'],
  'ISO-001': ['pregradni-zid', 'spusteni-plafon'],
  'ISO-002': ['pregradni-zid', 'potkrovlje'],
  'ISO-003': ['potkrovlje'],
  'ISO-004': ['fasada'],
  'ISO-005': ['podovi'],
  'ISO-006': ['fasada'],
  'ISO-007': ['podovi', 'fasada'],
  'CHM-001': [...DRY],
  'CHM-002': [...DRY],
  'CHM-003': ['fasada'],
  'CHM-004': ['fasada'],
  'CHM-005': ['podovi'],
  'CHM-006': ['podovi'],
  'CHM-007': ['pregradni-zid', 'spusteni-plafon'],
  'ACC-001': [...DRY],
  'ACC-002': [...DRY],
  'ACC-003': [...DRY],
  'ACC-004': [...DRY],
  'ACC-005': ['pregradni-zid', 'spusteni-plafon'],
  'ACC-006': ['spusteni-plafon', 'potkrovlje'],
}

// Studijske fotografije artikala (generisane za ovaj sajt, ista pozadina kao --plate).
// Zamjenjuju crteže i stock fotografije iz zajedničkog kataloga.
export const shotOf = (sku: string) => `/shop/${sku}.webp`

export const PRODUCTS: Product[] = GC_PRODUCTS.map((p) => ({
  ...p,
  image: shotOf(p.sku),
  photo: shotOf(p.sku),
  drawing: false,
  illustrative: false,
  id: p.sku,
  uses: USE_MAP[p.sku] ?? [],
  badge: p.featured ? 'Najčešće birano' : undefined,
}))

export const PRODUCT_MAP: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))
export const FEATURED = PRODUCTS.filter((p) => p.featured)

export const categoryName = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.name ?? ''

// ——— Kompleti: sistemi zidova, količine po normi W111 za zid 10 m² ———

const round2 = (n: number) => Math.round(n * 100) / 100

export const KIT_WALL = { L: 4, H: 2.5 } as const

export type BomItem = { sku: string; need: string; qty: number; note: string }

const f2 = new Intl.NumberFormat('sr-Latn-BA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const f0 = new Intl.NumberFormat('sr-Latn-BA', { maximumFractionDigits: 0 })

type W111Input = {
  L: number
  H: number
  cladding: 'single' | 'double'
  plateSku: string
  cwSku: string
  woolSku?: string
  fillerSku: string
  soundTape?: boolean
}

// Port funkcije calcW111 iz js/core.js (HTML sajt): ista norma utroška po m² zida.
export function calcW111({ L, H, cladding, plateSku, cwSku, woolSku, fillerSku, soundTape }: W111Input) {
  const P = L * H
  const items: BomItem[] = []

  const plateM2 = P * (cladding === 'double' ? 4.1 : 2.05)
  const boards = Math.ceil(plateM2 / 2.5)
  items.push({ sku: plateSku, need: `${f2.format(plateM2)} m²`, qty: boards * 2.5, note: `${boards} ploča po 2,5 m²` })

  const cwM = (L / 0.6) * H * 1.05
  const cwPieces = Math.ceil(cwM / 3)
  items.push({ sku: cwSku, need: `${f2.format(cwM)} m`, qty: cwPieces, note: `${cwPieces} komada po 3 m` })

  const uwM = L * 2 * 1.05
  const uwPieces = Math.ceil(uwM / 4)
  items.push({ sku: 'PRF-UW75', need: `${f2.format(uwM)} m`, qty: uwPieces, note: `${uwPieces} komada po 4 m` })

  if (woolSku) {
    const woolM2 = P * 1.05
    const panels = Math.ceil(woolM2 / 0.6)
    items.push({ sku: woolSku, need: `${f2.format(woolM2)} m²`, qty: round2(panels * 0.6), note: `${panels} ploča po 0,6 m²` })
  }

  const fillerKg = P * 0.6
  const bagSize = fillerSku === 'CHM-001' ? 5 : 25
  const bags = Math.ceil(fillerKg / bagSize)
  items.push({ sku: fillerSku, need: `${f2.format(fillerKg)} kg`, qty: bags, note: `${bags} vreća po ${bagSize} kg` })

  const screws = Math.ceil(P * 25)
  const boxes = Math.ceil(screws / 1000)
  items.push({ sku: 'ACC-001', need: `${f0.format(screws)} kom`, qty: boxes, note: `${boxes} kutija po 1000 komada` })

  const tapeM = L * 1.5
  const rolls = Math.ceil(tapeM / 25)
  items.push({ sku: 'ACC-003', need: `${f2.format(tapeM)} m`, qty: rolls, note: `${rolls} rola po 25 m` })

  if (soundTape) {
    const stRolls = Math.ceil(uwM / 30)
    items.push({ sku: 'ACC-005', need: `${f2.format(uwM)} m`, qty: stRolls, note: `${stRolls} rola po 30 m` })
  }

  return { P, items }
}

// ——— D112 spušteni plafon (orijentaciono) ———
// Približne vrijednosti standardne Knauf D112 norme po m² plafona (zaokruženo naviše, konzervativno):
//   ploča 1,05 m²/m² (5% otpada), CD 60/27 ≈ 4,5 m/m² (nosivi + montažni red), UD 28/27 = obim prostorije
//   + 5%, direktni ovjes ≈ 1,3 kom/m², vijci TN 25 ≈ 17 kom/m², masa za spojeve ≈ 0,35 kg/m²,
//   traka za spojeve ≈ 1,3 m/m². Nije zamjena za projekat — UI to prikazuje kao "orijentaciono".
type D112Input = { L: number; W: number; plateSku: string }

export function calcD112({ L, W, plateSku }: D112Input) {
  const P = L * W
  const items: BomItem[] = []

  const plateM2 = P * 1.05
  const boards = Math.ceil(plateM2 / 2.5)
  items.push({ sku: plateSku, need: `${f2.format(plateM2)} m²`, qty: boards * 2.5, note: `${boards} ploča po 2,5 m²` })

  const cdM = P * 4.5
  const cdPieces = Math.ceil(cdM / 4)
  items.push({ sku: 'PRF-CD60', need: `${f2.format(cdM)} m`, qty: cdPieces, note: `${cdPieces} komada po 4 m` })

  const udM = 2 * (L + W) * 1.05
  const udPieces = Math.ceil(udM / 3)
  items.push({ sku: 'PRF-UD28', need: `${f2.format(udM)} m`, qty: udPieces, note: `${udPieces} komada po 3 m` })

  const hangers = Math.ceil(P * 1.3)
  const hangerPacks = Math.ceil(hangers / 100)
  items.push({ sku: 'ACC-006', need: `${f0.format(hangers)} kom`, qty: hangerPacks, note: `${hangerPacks} pakovanja po 100 komada` })

  const screws = Math.ceil(P * 17)
  const boxes = Math.ceil(screws / 1000)
  items.push({ sku: 'ACC-001', need: `${f0.format(screws)} kom`, qty: boxes, note: `${boxes} kutija po 1000 komada` })

  const fillerKg = P * 0.35
  const bags = Math.ceil(fillerKg / 5)
  items.push({ sku: 'CHM-001', need: `${f2.format(fillerKg)} kg`, qty: bags, note: `${bags} vreća po 5 kg` })

  const tapeM = P * 1.3
  const rolls = Math.ceil(tapeM / 25)
  items.push({ sku: 'ACC-003', need: `${f2.format(tapeM)} m`, qty: rolls, note: `${rolls} rola po 25 m` })

  return { P, items }
}

// ——— DEMIT kontaktna fasada (orijentaciono) ———
// Samo artikli iz kataloga: stiropor (EPS 70 ili grafitni Neopor), Ceresit CT 83 za lijepljenje ploča
// i CT 85 za armirni sloj. Približni utrošci (konzervativno): EPS 1,05 m²/m², CT 83 ≈ 4,5 kg/m²,
// CT 85 ≈ 4 kg/m². Mrežica, tiplovi i završni malter nisu u katalogu — UI to napominje.
type DemitInput = { A: number; epsSku: string }

export function calcDemit({ A, epsSku }: DemitInput) {
  const items: BomItem[] = []
  const epsM2 = Math.ceil(A * 1.05 * 2) / 2
  items.push({ sku: epsSku, need: `${f2.format(epsM2)} m²`, qty: epsM2, note: `${f2.format(epsM2)} m² ploča` })

  const glueKg = A * 4.5
  const glueBags = Math.ceil(glueKg / 25)
  items.push({ sku: 'CHM-003', need: `${f2.format(glueKg)} kg`, qty: glueBags, note: `${glueBags} vreća po 25 kg` })

  const meshKg = A * 4
  const meshBags = Math.ceil(meshKg / 25)
  items.push({ sku: 'CHM-004', need: `${f2.format(meshKg)} kg`, qty: meshBags, note: `${meshBags} vreća po 25 kg` })

  return { P: A, items }
}

export type Bundle = {
  id: string
  code: string
  name: string
  area: string
  note: string
  build: string
  rw: number | null
  profile: string
  thickness: number
  /** Firma nije odobrila popust na komplete */
  off: number
  /** Stavke sa količinama; prazno kad norma W111 ne važi za sistem (plafon, dvostruka potkonstrukcija) */
  items: BomItem[]
  skus: string[]
}

// Norma W111 važi za zid na jednom redu CW profila: W111 (jednostruka) i W112 (dvostruka obloga).
function bundleOf(s: WallSystem): Bundle {
  const find = (prefix: string) => s.skus.find((k) => k.startsWith(prefix))
  const plateSku = find('KNF-')
  const cwSku = s.skus.find((k) => /^PRF-0\d\d$|^PRF-1\d\d$/.test(k))
  const fillerSku = find('CHM-')
  const fits = (s.code === 'W111' || s.code === 'W112') && plateSku && cwSku && fillerSku
  const items = fits
    ? calcW111({
        ...KIT_WALL,
        cladding: s.code === 'W112' ? 'double' : 'single',
        plateSku,
        cwSku,
        woolSku: find('ISO-'),
        fillerSku,
      }).items
    : []
  return {
    id: s.code,
    code: s.code,
    name: s.name,
    area: 'za 10 m² zida',
    note: s.use,
    build: s.build,
    rw: s.rw,
    profile: s.profile,
    thickness: s.thickness,
    off: 0,
    items,
    skus: s.skus,
  }
}

export const BUNDLES: Bundle[] = WALL_SYSTEMS.map(bundleOf)
export const BUNDLE_MAP: Record<string, Bundle> = Object.fromEntries(BUNDLES.map((b) => [b.id, b]))

export function bundleTotals(b: Bundle) {
  const sum = round2(b.items.reduce((s, it) => s + (bySku(it.sku)?.price ?? 0) * it.qty, 0))
  const price = round2(sum * (1 - b.off))
  return { sum, price, save: round2(sum - price) }
}

// ——— Korpa: proizvod je u korpi pod svojim id-jem (količina u jedinici artikla), komplet pod "komplet:<id>" ———

export type Line = { key: string; name: string; spec: string; unit: string; price: number; step: number; image?: string; drawing?: boolean }

export function resolveLine(key: string): Line | null {
  if (key.startsWith('komplet:')) {
    const b = BUNDLE_MAP[key.slice(8)]
    if (!b || !b.items.length) return null
    return { key, name: `Komplet ${b.code}: ${b.name}`, spec: b.area, unit: 'komplet', price: bundleTotals(b).price, step: 1 }
  }
  const p = PRODUCT_MAP[key]
  return p
    ? { key, name: p.name, spec: p.spec, unit: p.unit, price: p.price, step: defaultQty(p), image: p.image, drawing: p.drawing }
    : null
}

// ——— Filteri ———

export const PRICE_BANDS = [
  { id: 'do-5', label: 'Do 5 KM', test: (p: number) => p < 5 },
  { id: '5-10', label: '5 – 10 KM', test: (p: number) => p >= 5 && p < 10 },
  { id: '10-20', label: '10 – 20 KM', test: (p: number) => p >= 10 && p < 20 },
  { id: 'preko-20', label: 'Preko 20 KM', test: (p: number) => p >= 20 },
]

export const SORTS: { id: SortId; label: string }[] = [
  { id: 'preporuceno', label: 'Preporučeno' },
  { id: 'cijena-rastuce', label: 'Cijena: rastuće' },
  { id: 'cijena-opadajuce', label: 'Cijena: opadajuće' },
  { id: 'naziv', label: 'Naziv A – Š' },
]

export type Filters = {
  query: string
  category: CategoryId | 'sve'
  use: UseId | 'sve'
  price: string
  sort: SortId
  onlySaved: boolean
}

export const DEFAULT_FILTERS: Filters = {
  query: '',
  category: 'sve',
  use: 'sve',
  price: 'sve',
  sort: 'preporuceno',
  onlySaved: false,
}

// Pretraga ne pravi razliku između č/c, š/s, ž/z, ć/c i đ/dj.
const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/đ/g, 'dj')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function filterProducts(f: Filters, saved: string[]): Product[] {
  const words = fold(f.query).split(/\s+/).filter(Boolean)
  const band = PRICE_BANDS.find((b) => b.id === f.price)

  const list = PRODUCTS.filter((p) => {
    if (f.category !== 'sve' && p.category !== f.category) return false
    if (f.use !== 'sve' && !p.uses.includes(f.use)) return false
    if (band && !band.test(p.price)) return false
    if (f.onlySaved && !saved.includes(p.id)) return false
    if (words.length) {
      const hay = fold(`${p.name} ${p.brand} ${p.sku} ${p.spec} ${p.desc} ${categoryName(p.category)}`)
      if (!words.every((w) => hay.includes(w))) return false
    }
    return true
  })

  if (f.sort === 'cijena-rastuce') list.sort((a, b) => a.price - b.price)
  if (f.sort === 'cijena-opadajuce') list.sort((a, b) => b.price - a.price)
  if (f.sort === 'naziv') list.sort((a, b) => a.name.localeCompare(b.name, 'bs'))
  return list
}

// ——— Formatiranje ———

export const money = (n: number) =>
  `${n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`

/** Količina u jedinici artikla: 25 m², 3 kom, 10,8 m² */
export const qtyLabel = (n: number, unit: string) =>
  `${n.toLocaleString('de-DE', { maximumFractionDigits: 2 })} ${unit}`

export const artikala = (n: number) => `${n} ${plural(n, 'artikal', 'artikla', 'artikala')}`

// Stavke lijepljive trake; id je ujedno i id sekcije na stranici.
export const NAV = [
  { id: 'novo', label: 'Najčešće' },
  { id: 'prodavnica', label: 'Katalog' },
  { id: 'kompleti', label: 'Kompleti' },
  { id: 'namjena', label: 'Radovi' },
  { id: 'cijene', label: 'Partneri' },
  { id: 'pitanja', label: 'Pitanja' },
  { id: 'ponuda', label: 'Upit' },
]
