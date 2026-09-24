// Katalog i pomoćne funkcije prodavnice.
// PAŽNJA: nazivi, cijene (KM), količine u kompletima i svi tekstovi uslova su PROBNI podaci za dizajn.
// Prije puštanja u rad zamijeniti ih pravim podacima klijenta.

export type CategoryId = 'gradjevinski' | 'suha-gradnja' | 'kamena-vuna' | 'drvo' | 'sanitarna'
export type UseId = 'pregradni-zid' | 'spusteni-plafon' | 'potkrovlje' | 'fasada' | 'kupatilo' | 'krov'
export type SortId = 'preporuceno' | 'cijena-rastuce' | 'cijena-opadajuce' | 'naziv'

export type Product = {
  id: string
  name: string
  spec: string
  unit: string
  price: number
  category: CategoryId
  uses: UseId[]
  isNew?: boolean
  badge?: string
}

export const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: 'gradjevinski', name: 'Građevinski materijal' },
  { id: 'suha-gradnja', name: 'Suha gradnja' },
  { id: 'kamena-vuna', name: 'Kamena vuna' },
  { id: 'drvo', name: 'Drvo' },
  { id: 'sanitarna', name: 'Sanitarna oprema' },
]

export const USES: { id: UseId; name: string; hint: string }[] = [
  { id: 'pregradni-zid', name: 'Pregradni zid', hint: 'Ploče, profili, izolacija' },
  { id: 'spusteni-plafon', name: 'Spušteni plafon', hint: 'Ploče, profili, vijci' },
  { id: 'potkrovlje', name: 'Potkrovlje', hint: 'Izolacija, ploče, daske' },
  { id: 'fasada', name: 'Fasada i zidovi', hint: 'Kamena vuna, malter, cement' },
  { id: 'kupatilo', name: 'Kupatilo', hint: 'Sanitarija, lijepak, hidroizolacija' },
  { id: 'krov', name: 'Krov i konstrukcija', hint: 'Drvena građa, OSB, izolacija' },
]

export const PRODUCTS: Product[] = [
  // Građevinski materijal
  { id: 'cement-25', name: 'Cement, vreća 25 kg', spec: 'Opšti zidarski i betonski radovi', unit: 'vreća', price: 8.9, category: 'gradjevinski', uses: ['fasada'] },
  { id: 'lijepak-25', name: 'Lijepak za pločice, 25 kg', spec: 'Zidne i podne keramičke pločice', unit: 'vreća', price: 11.5, category: 'gradjevinski', uses: ['kupatilo'], badge: 'Najprodavanije' },
  { id: 'malter-25', name: 'Gotov malter, 25 kg', spec: 'Zidanje i grubo malterisanje', unit: 'vreća', price: 6.4, category: 'gradjevinski', uses: ['fasada'] },
  { id: 'hidro-20', name: 'Hidroizolacija, 20 kg', spec: 'Cementna, dvokomponentna · kupatila i terase', unit: 'set', price: 74, category: 'gradjevinski', uses: ['kupatilo'], isNew: true },

  // Sistemi suhe gradnje
  { id: 'gk-standard', name: 'Gips-kartonska ploča 12,5 mm', spec: '1200 × 2600 mm · standardna', unit: 'kom', price: 11.9, category: 'suha-gradnja', uses: ['pregradni-zid', 'spusteni-plafon', 'potkrovlje'], badge: 'Najprodavanije' },
  { id: 'gk-vlaga', name: 'Gips-kartonska ploča, vlagootporna', spec: '1200 × 2600 mm · 12,5 mm', unit: 'kom', price: 15.4, category: 'suha-gradnja', uses: ['kupatilo', 'pregradni-zid'] },
  { id: 'gk-vatra', name: 'Gips-kartonska ploča, protivpožarna', spec: '1200 × 2600 mm · 15 mm', unit: 'kom', price: 22.8, category: 'suha-gradnja', uses: ['pregradni-zid', 'potkrovlje'], isNew: true },
  { id: 'cw-50', name: 'Profil CW 50', spec: 'Pocinčani čelik · 3 m', unit: 'kom', price: 4.6, category: 'suha-gradnja', uses: ['pregradni-zid'] },
  { id: 'uw-50', name: 'Profil UW 50', spec: 'Pocinčani čelik · 3 m', unit: 'kom', price: 3.9, category: 'suha-gradnja', uses: ['pregradni-zid'] },
  { id: 'cd-60', name: 'Profil CD 60', spec: 'Nosivi profil za plafon · 3 m', unit: 'kom', price: 3.7, category: 'suha-gradnja', uses: ['spusteni-plafon', 'potkrovlje'] },
  { id: 'vijci', name: 'Vijci za gips-karton 3,5 × 25 mm', spec: 'Kutija od 1000 komada', unit: 'kutija', price: 14.5, category: 'suha-gradnja', uses: ['pregradni-zid', 'spusteni-plafon', 'potkrovlje'] },
  { id: 'masa-spoj', name: 'Masa za spojeve, 25 kg', spec: 'Gletovanje spojeva i glava vijaka', unit: 'vreća', price: 21, category: 'suha-gradnja', uses: ['pregradni-zid', 'spusteni-plafon', 'potkrovlje'], isNew: true },

  // Kamena vuna
  { id: 'kv-50', name: 'Kamena vuna, ploča 50 mm', spec: 'Ploče 1000 × 600 mm', unit: 'm²', price: 5.2, category: 'kamena-vuna', uses: ['pregradni-zid'] },
  { id: 'kv-100', name: 'Kamena vuna, ploča 100 mm', spec: 'Ploče 1000 × 600 mm', unit: 'm²', price: 9.8, category: 'kamena-vuna', uses: ['pregradni-zid', 'fasada'] },
  { id: 'kv-rolna', name: 'Kamena vuna, rolna 100 mm', spec: 'Potkrovlje i kosi krov', unit: 'm²', price: 8.9, category: 'kamena-vuna', uses: ['potkrovlje', 'krov'], isNew: true },
  { id: 'kv-fasada', name: 'Fasadna ploča kamene vune 100 mm', spec: 'Za kontaktne fasade', unit: 'm²', price: 12.6, category: 'kamena-vuna', uses: ['fasada'] },

  // Drvo
  { id: 'osb-18', name: 'OSB ploča 18 mm', spec: '2500 × 1250 mm', unit: 'kom', price: 38, category: 'drvo', uses: ['krov', 'potkrovlje'], isNew: true },
  { id: 'letva-30', name: 'Krovna letva 30 × 50 mm', spec: 'Rezana građa · 4 m', unit: 'kom', price: 3.8, category: 'drvo', uses: ['krov'] },
  { id: 'daska-24', name: 'Daska 24 × 120 mm', spec: 'Jela · 4 m', unit: 'kom', price: 6.9, category: 'drvo', uses: ['krov', 'potkrovlje'] },

  // Sanitarna oprema
  { id: 'umivaonik-60', name: 'Umivaonik 60 cm', spec: 'Sanitarna keramika', unit: 'kom', price: 89, category: 'sanitarna', uses: ['kupatilo'] },
  { id: 'wc-konzolna', name: 'WC šolja, konzolna', spec: 'Sa daskom sa sporim spuštanjem', unit: 'kom', price: 179, category: 'sanitarna', uses: ['kupatilo'], isNew: true },
  { id: 'baterija-um', name: 'Baterija za umivaonik', spec: 'Hromirana · keramički uložak', unit: 'kom', price: 64, category: 'sanitarna', uses: ['kupatilo'] },
]

export const PRODUCT_MAP: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))

// ——— Kompleti ———
// Količine su orijentacione; tačan obračun radi stručni tim prema predmjeru.

export type Bundle = {
  id: string
  name: string
  area: string
  note: string
  off: number
  items: [productId: string, qty: number][]
}

export const BUNDLES: Bundle[] = [
  {
    id: 'pregradni-zid',
    name: 'Pregradni zid',
    area: '10 m²',
    note: 'Obloga s obje strane, profili 50 mm, izolacija 50 mm.',
    off: 0.06,
    items: [['gk-standard', 8], ['cw-50', 8], ['uw-50', 3], ['kv-50', 10], ['vijci', 1], ['masa-spoj', 1]],
  },
  {
    id: 'spusteni-plafon',
    name: 'Spušteni plafon',
    area: '15 m²',
    note: 'Jednoslojna obloga na nosivim CD profilima.',
    off: 0.06,
    items: [['gk-standard', 6], ['cd-60', 16], ['vijci', 1], ['masa-spoj', 1]],
  },
  {
    id: 'toplo-potkrovlje',
    name: 'Toplo potkrovlje',
    area: '20 m²',
    note: 'Izolacija između rogova i unutrašnja obloga.',
    off: 0.06,
    items: [['kv-rolna', 20], ['gk-standard', 8], ['cd-60', 18], ['vijci', 1], ['masa-spoj', 1]],
  },
]

export const BUNDLE_MAP: Record<string, Bundle> = Object.fromEntries(BUNDLES.map((b) => [b.id, b]))

const round2 = (n: number) => Math.round(n * 100) / 100

export function bundleTotals(b: Bundle) {
  const sum = round2(b.items.reduce((s, [id, qty]) => s + PRODUCT_MAP[id].price * qty, 0))
  const price = round2(sum * (1 - b.off))
  return { sum, price, save: round2(sum - price) }
}

// ——— Korpa: proizvod je u korpi pod svojim id-jem, komplet pod "komplet:<id>" ———

export type Line = { key: string; name: string; spec: string; unit: string; price: number }

export function resolveLine(key: string): Line | null {
  if (key.startsWith('komplet:')) {
    const b = BUNDLE_MAP[key.slice(8)]
    if (!b) return null
    return { key, name: `Komplet: ${b.name}`, spec: b.area, unit: 'komplet', price: bundleTotals(b).price }
  }
  const p = PRODUCT_MAP[key]
  return p ? { key, name: p.name, spec: p.spec, unit: p.unit, price: p.price } : null
}

// ——— Filteri ———

export const PRICE_BANDS = [
  { id: 'do-10', label: 'Do 10 KM', test: (p: number) => p < 10 },
  { id: '10-50', label: '10 – 50 KM', test: (p: number) => p >= 10 && p < 50 },
  { id: '50-150', label: '50 – 150 KM', test: (p: number) => p >= 50 && p < 150 },
  { id: 'preko-150', label: 'Preko 150 KM', test: (p: number) => p >= 150 },
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
      const hay = fold(`${p.name} ${p.spec} ${CATEGORIES.find((c) => c.id === p.category)!.name}`)
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

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

export const artikala = (n: number) => `${n} ${plural(n, 'artikal', 'artikla', 'artikala')}`

// Stavke lijepljive trake; id je ujedno i id sekcije na stranici.
export const NAV = [
  { id: 'novo', label: 'Novo' },
  { id: 'prodavnica', label: 'Prodavnica' },
  { id: 'kompleti', label: 'Kompleti' },
  { id: 'materijali', label: 'Materijali' },
  { id: 'cijene', label: 'Cijene' },
  { id: 'pitanja', label: 'Pitanja' },
  { id: 'ponuda', label: 'Upit' },
]
