// Sadržaj prodavnice. Katalog, cijene, zalihe i uslovi dolaze iz src/gc (zajednički izvor za sve varijante,
// isti kao HTML sajt). Ovdje se ti podaci samo prevode u oblik koji koriste komponente prodavnice.
// Tekstovi mogu koristiti oznake iz company.ts ({rokIsporuke}, {besplatnaDostava}, ...) i *kurziv*.

import {
  CATEGORIES as GC_CATEGORIES,
  DELIVERY_ZONES,
  FAQ as GC_FAQ,
  FREE_DELIVERY_OVER,
  PARTNER_TIERS,
  PRODUCTS as GC_PRODUCTS,
  STOCK_LABEL,
  WALL_SYSTEMS,
  bySku,
  stockLevel,
  type CategoryId as GcCategoryId,
  type StockLevel,
} from '@/gc/gc'
import { TERMS } from './company'

// ---------- kategorije i vrste radova ----------

export type CategoryId = GcCategoryId

export const CATEGORIES: { id: CategoryId; label: string; blurb: string; usage: string; photo: string; color: string }[] =
  GC_CATEGORIES.map((c) => ({ id: c.id, label: c.label, blurb: c.lead, usage: c.usage, photo: c.photo, color: c.color }))

export type UseId = 'pregrade' | 'plafon' | 'fasada' | 'potkrovlje' | 'podovi'

export const USES: { id: UseId; label: string; blurb: string }[] = [
  { id: 'pregrade', label: 'Pregradni zid', blurb: 'Ploče, CW i UW profili, vuna, mase i vijci' },
  { id: 'plafon', label: 'Spušteni plafon', blurb: 'CD i UD profili, ovjesi i ploče' },
  { id: 'fasada', label: 'Fasada i demit', blurb: 'Stiropor, kamena vuna i ljepila za armiranje' },
  { id: 'potkrovlje', label: 'Potkrovlje', blurb: 'Vuna između rogova i obloga od ploča' },
  { id: 'podovi', label: 'Podovi', blurb: 'Podni stiropor, XPS, cement i ljepilo za keramiku' },
]

// Koji artikal ide uz koju vrstu radova (po šifri).
const USE_SKUS: Record<UseId, string[]> = {
  pregrade: ['KNF-001', 'KNF-002', 'KNF-003', 'KNF-004', 'PRF-050', 'PRF-075', 'PRF-100', 'PRF-UW75', 'ISO-001', 'ISO-002', 'CHM-001', 'CHM-002', 'CHM-007', 'ACC-001', 'ACC-002', 'ACC-003', 'ACC-004', 'ACC-005'],
  plafon: ['KNF-001', 'KNF-002', 'KNF-003', 'PRF-CD60', 'PRF-UD28', 'ISO-003', 'CHM-001', 'CHM-002', 'ACC-001', 'ACC-003', 'ACC-004', 'ACC-006'],
  fasada: ['ISO-002', 'ISO-004', 'ISO-006', 'ISO-007', 'CHM-003', 'CHM-004'],
  potkrovlje: ['ISO-002', 'ISO-003', 'KNF-001', 'KNF-002', 'PRF-CD60', 'PRF-UD28', 'ACC-001', 'ACC-006', 'CHM-001'],
  podovi: ['ISO-005', 'ISO-007', 'CHM-005', 'CHM-006'],
}

// ---------- artikli ----------

// Dostupnost se računa iz stvarne količine na stanju (Pantheon u produkciji).
export type Availability = StockLevel

export const AVAIL_LABEL: Record<Availability, string> = STOCK_LABEL

export type Product = {
  id: string
  name: string
  brand: string
  category: CategoryId
  uses: UseId[]
  price: number // KM, sa PDV-om, po jedinici
  unit: string // m², kom, kut, pak
  stock: number
  avail: Availability
  featured: boolean
  /** Korak količine: jedna ploča, rolna ili komad (npr. 2,5 m² za ploču) */
  step: number
  packName: string | null
  image: string
  /** true: slika je crtež artikla (SVG), prikazuje se cijela na svijetloj podlozi */
  drawing: boolean
  summary: string
  specs: { dimenzije: string; pakovanje: string; primjena: string }
}

export const PRODUCTS: Product[] = GC_PRODUCTS.map((p) => {
  const uses = (Object.keys(USE_SKUS) as UseId[]).filter((u) => USE_SKUS[u].includes(p.sku))
  return {
    id: p.sku,
    name: p.name,
    brand: p.brand,
    category: p.category,
    uses,
    price: p.price,
    unit: p.unit,
    stock: p.stock,
    avail: stockLevel(p),
    featured: Boolean(p.featured),
    step: p.pack?.size ?? 1,
    packName: p.pack?.name ?? null,
    image: p.image,
    drawing: p.drawing,
    summary: p.desc,
    specs: {
      dimenzije: p.spec,
      pakovanje: p.pack ? `${p.pack.name} ${formatNumber(p.pack.size)} ${p.unit}` : `po ${p.unit}`,
      primjena: uses.length ? uses.map((u) => USES.find((x) => x.id === u)!.label).join(', ') : '—',
    },
  }
})

export const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))]

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)
export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id

// 1.250,00 (ručno, da server i preglednik uvijek daju isti tekst).
function group(whole: string) {
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
export function formatPrice(n: number) {
  const [whole, dec] = n.toFixed(2).split('.')
  return `${group(whole)},${dec} ${TERMS.currency}`
}
// Količina: 22,5 ili 4 (bez nepotrebnih decimala).
export function formatNumber(n: number) {
  const r = Math.round(n * 100) / 100
  const [whole, dec] = String(r).split('.')
  return dec ? `${group(whole)},${dec}` : group(whole)
}
export const formatStock = (p: Product) => `${formatNumber(p.stock)} ${p.unit}`

// ---------- filteri ----------

export type Filters = {
  q: string
  cat: CategoryId | 'sve'
  use: UseId | 'sve'
  brand: string
  avail: 'sve' | 'na-stanju'
  price: 'sve' | 'do-5' | '5-15' | 'preko-15'
  sort: 'izdvojeno' | 'cijena-rastuce' | 'cijena-opadajuce' | 'naziv'
}

export const DEFAULT_FILTERS: Filters = { q: '', cat: 'sve', use: 'sve', brand: 'sve', avail: 'sve', price: 'sve', sort: 'izdvojeno' }

export const PRICE_RANGES: { id: Filters['price']; label: string }[] = [
  { id: 'sve', label: 'Sve cijene' },
  { id: 'do-5', label: `Do 5 ${TERMS.currency}` },
  { id: '5-15', label: `5 – 15 ${TERMS.currency}` },
  { id: 'preko-15', label: `Preko 15 ${TERMS.currency}` },
]

export const SORTS: { id: Filters['sort']; label: string }[] = [
  { id: 'izdvojeno', label: 'Izdvojeno' },
  { id: 'cijena-rastuce', label: 'Cijena, rastuće' },
  { id: 'cijena-opadajuce', label: 'Cijena, opadajuće' },
  { id: 'naziv', label: 'Naziv' },
]

export function applyFilters(list: Product[], f: Filters) {
  const q = f.q.trim().toLocaleLowerCase('bs')
  const out = list.filter((p) => {
    if (f.cat !== 'sve' && p.category !== f.cat) return false
    if (f.use !== 'sve' && !p.uses.includes(f.use)) return false
    if (f.brand !== 'sve' && p.brand !== f.brand) return false
    if (f.avail === 'na-stanju' && p.avail !== 'high') return false
    if (f.price === 'do-5' && p.price > 5) return false
    if (f.price === '5-15' && (p.price <= 5 || p.price > 15)) return false
    if (f.price === 'preko-15' && p.price <= 15) return false
    if (q) {
      const hay = `${p.id} ${p.name} ${p.brand} ${categoryLabel(p.category)} ${p.summary} ${p.specs.dimenzije} ${p.specs.primjena}`.toLocaleLowerCase('bs')
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false
    }
    return true
  })
  if (f.sort === 'izdvojeno') out.sort((a, b) => Number(b.featured) - Number(a.featured))
  else if (f.sort === 'cijena-rastuce') out.sort((a, b) => a.price - b.price)
  else if (f.sort === 'cijena-opadajuce') out.sort((a, b) => b.price - a.price)
  else if (f.sort === 'naziv') out.sort((a, b) => a.name.localeCompare(b.name, 'bs'))
  return out
}

// ---------- sekcije ----------

export const BENEFITS = [
  { no: '01', title: 'Istovar kranom', text: 'Naši kamioni sa kranom spuštaju palete *na etažu*, na gradilištima u Banjoj Luci i regiji do 50 km.' },
  { no: '02', title: 'Zalihe uživo', text: 'Stanje na sajtu čitamo iz Pantheona, istog sistema iz kojeg radi prodaja na stovarištu.' },
  { no: '03', title: 'Atesti uz robu', text: 'CE deklaracija i protivpožarni atest idu uz otpremnicu, za tehnički prijem objekta.' },
  { no: '04', title: 'Do 90 dana', text: 'Ugovorni partneri plaćaju po fakturi, sa valutom do 90 dana i kreditnim limitom.' },
]

// Materijali = naše četiri grupe, tekst iz kataloga (`usage`).
const MATERIAL_PROPS: Record<CategoryId, string[]> = {
  'suha-gradnja': ['Knauf ploče GKB, GKBI, GKF, Diamant', 'CW, UW, CD i UD profili', 'Sistemi W111, W112, W115, D112'],
  izolacija: ['Kamena i staklena vuna', 'EPS, grafitni EPS i XPS', 'Toplotna i zvučna izolacija'],
  veziva: ['Mase za spojeve i glet', 'Ljepila za fasadu i keramiku', 'Cement'],
  oprema: ['Samourezni vijci', 'Bandaž i akustične trake', 'Direktni ovjesi'],
}

export const MATERIALS = CATEGORIES.map((c) => ({
  id: c.id,
  name: c.label,
  category: c.id,
  line: `${c.blurb}.`,
  text: c.usage,
  props: MATERIAL_PROPS[c.id],
  photo: c.photo,
}))

// Cijene i uslovi: nivoi partnera (rabat, limit, valuta).
export const TIERS = PARTNER_TIERS.map((t, i) => ({
  no: String(i + 1).padStart(2, '0'),
  name: t.name,
  who: t.who,
  price: t.rebate === '0%' ? 'Cijene iz kataloga' : `Rabat ${t.rebate}`,
  limit: t.limit,
  days: t.days,
  featured: i === 2,
  cta: i === 0 ? 'Pogledaj katalog' : 'Postani partner',
  href: i === 0 ? '/#katalog' : '/#ponuda',
}))

export const PAYMENTS = [
  { title: 'Pri preuzimanju', text: 'Gotovinom ili karticom na stovarištu, pri preuzimanju robe.' },
  { title: 'Predračun', text: 'Uplata na račun na osnovu predračuna, prije isporuke.' },
  { title: 'Faktura sa valutom', text: 'Za ugovorne partnere: valuta 30, 60 ili 90 dana prema nivou, uz mjenicu ili bankarsku garanciju.' },
]

export const DELIVERY = DELIVERY_ZONES
export { FREE_DELIVERY_OVER }

export const DELIVERY_STEPS = [
  { no: '01', title: 'Izbor i narudžba', text: 'U korpi birate standardnu dostavu ili kamion sa kranom i upisujete adresu, sprat i pristup.' },
  { no: '02', title: 'Potvrda termina', text: 'Komercijalista potvrđuje narudžbu i dogovara dan i okvirno vrijeme dolaska sa osobom na gradilištu.' },
  { no: '03', title: 'Istovar kranom', text: 'Od jedne tone preporučujemo kran: paleta od 40 ploča GKB već teži oko 1.000 kg.' },
]

export const FAQ: { q: string; a: string; link?: { label: string; href: string } }[] = GC_FAQ.map(([q, a]) => ({ q, a }))

// ---------- gotovi kompleti (Knauf W111 norma, 10 m² zida) ----------

export type BundleItem = { id: string; qty: number; need: string; note: string }
export type Bundle = { id: string; code: string; name: string; note: string; build: string; rw: number | null; area: string; items: BundleItem[] }

const BUNDLE_WALL = { L: 4, H: 2.5 }

// Port funkcije calcW111 iz js/core.js HTML sajta: norma materijala po m² zida, +5% otpada,
// zaokruženo na cijela pakovanja.
export function calcW111({
  L,
  H,
  cladding,
  plateSku,
  cwSku,
  woolSku,
  fillerSku,
}: {
  L: number
  H: number
  cladding: 'single' | 'double'
  plateSku: string
  cwSku: string
  woolSku?: string
  fillerSku: string
}) {
  const P = L * H
  const items: BundleItem[] = []
  const round2 = (n: number) => Math.round(n * 100) / 100

  const plateM2 = P * (cladding === 'double' ? 4.1 : 2.05)
  const boards = Math.ceil(plateM2 / 2.5)
  items.push({ id: plateSku, need: `${formatNumber(plateM2)} m²`, qty: boards * 2.5, note: `${boards} ploča po 2,5 m²` })

  const cwM = (L / 0.6) * H * 1.05
  const cwPieces = Math.ceil(cwM / 3)
  items.push({ id: cwSku, need: `${formatNumber(cwM)} m`, qty: cwPieces, note: `${cwPieces} komada po 3 m` })

  const uwM = L * 2 * 1.05
  const uwPieces = Math.ceil(uwM / 4)
  items.push({ id: 'PRF-UW75', need: `${formatNumber(uwM)} m`, qty: uwPieces, note: `${uwPieces} komada po 4 m` })

  if (woolSku) {
    const woolM2 = P * 1.05
    const panels = Math.ceil(woolM2 / 0.6)
    items.push({ id: woolSku, need: `${formatNumber(woolM2)} m²`, qty: round2(panels * 0.6), note: `${panels} ploča po 0,6 m²` })
  }

  const fillerKg = P * 0.6
  const bagSize = fillerSku === 'CHM-001' ? 5 : 25
  const bags = Math.ceil(fillerKg / bagSize)
  items.push({ id: fillerSku, need: `${formatNumber(fillerKg)} kg`, qty: bags, note: `${bags} vreća po ${bagSize} kg` })

  const screws = Math.ceil(P * 25)
  const boxes = Math.ceil(screws / 1000)
  items.push({ id: 'ACC-001', need: `${formatNumber(screws)} kom`, qty: boxes, note: `${boxes} kutija po 1000 komada` })

  const tapeM = L * 1.5
  const rolls = Math.ceil(tapeM / 25)
  items.push({ id: 'ACC-003', need: `${formatNumber(tapeM)} m`, qty: rolls, note: `${rolls} rola po 25 m` })

  return { P, items }
}

// Kompleti se prave samo za sisteme koje W111 norma pokriva (jednostruka i dvostruka obloga na CW 75).
// W115 (dvostruka potkonstrukcija) i D112 (plafon) računamo po predmjeru.
export const BUNDLES: Bundle[] = WALL_SYSTEMS.filter((w) => w.code === 'W111' || w.code === 'W112').map((w) => {
  const pick = (prefix: string) => w.skus.find((s) => s.startsWith(prefix))
  const { items } = calcW111({
    ...BUNDLE_WALL,
    cladding: w.code === 'W112' ? 'double' : 'single',
    plateSku: pick('KNF') ?? 'KNF-001',
    cwSku: w.skus.find((s) => s.startsWith('PRF-0') || s.startsWith('PRF-1')) ?? 'PRF-075',
    woolSku: pick('ISO'),
    fillerSku: pick('CHM') ?? 'CHM-001',
  })
  return {
    id: w.code.toLowerCase(),
    code: w.code,
    name: w.name,
    note: w.use,
    build: w.build,
    rw: w.rw,
    area: 'za 10 m² zida',
    items: items.filter((it) => bySku(it.id)),
  }
})

export const BUNDLES_BY_QUOTE = WALL_SYSTEMS.filter((w) => w.code !== 'W111' && w.code !== 'W112')

export function bundleTotal(b: Bundle) {
  return Math.round(b.items.reduce((s, it) => s + (productById(it.id)?.price ?? 0) * it.qty, 0) * 100) / 100
}

// Podnožje. `href` vodi na rutu ili sidro početne strane; `action` otvara panel.
export type FooterLink = { label: string; href: string } | { label: string; action: 'saved' | 'compare' }

export const FOOTER: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Prodavnica',
    links: [
      { label: 'Svi artikli', href: '/#katalog' },
      { label: 'Najčešće birano', href: '/#najcesce' },
      { label: 'Gotovi kompleti', href: '/#kompleti' },
      { label: 'Po vrsti radova', href: '/#radovi' },
      { label: 'Materijali', href: '/#materijali' },
      { label: 'Cijene i uslovi', href: '/#cijene' },
      { label: 'Sačuvano', action: 'saved' },
    ],
  },
  {
    title: 'Podrška',
    links: [
      { label: 'Zatražite ponudu', href: '/#ponuda' },
      { label: 'Česta pitanja', href: '/#pitanja' },
      { label: 'Dostava', href: '/dostava' },
      { label: 'Povrat robe', href: '/povrat-robe' },
      { label: 'Povrat novca', href: '/povrat-novca' },
      { label: 'Načini plaćanja', href: '/nacini-placanja' },
      { label: 'Garancija i reklamacije', href: '/garancija-i-reklamacije' },
      { label: 'Status narudžbe', href: '/status-narudzbe' },
    ],
  },
  {
    title: 'Pravno',
    links: [
      { label: 'Uslovi kupovine', href: '/uslovi-kupovine' },
      { label: 'Politika privatnosti', href: '/politika-privatnosti' },
      { label: 'Odustanak od ugovora', href: '/odustanak-od-ugovora' },
      { label: 'Podaci o prodavcu', href: '/o-prodavcu' },
      { label: 'Sve politike', href: '/sve-politike' },
    ],
  },
  {
    title: 'Usluge',
    links: [
      { label: 'Uzorci materijala', href: '/uzorci-materijala' },
      { label: 'Upit za izvođače i projekte', href: '/upit-za-izvodjace' },
      { label: 'Poređenje artikala', action: 'compare' },
    ],
  },
]
