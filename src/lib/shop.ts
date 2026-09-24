// PLACEHOLDER PODACI — artikli, cijene i stanje zaliha su ilustrativni (nisu iz stvarnog cjenovnika klijenta).
// Zamijeniti stvarnim podacima prije objave; ostatak koda ne treba mijenjati.

export type CatId = 'ploce' | 'profili' | 'izolacija' | 'mase' | 'pribor'
export type Stock = 'na-stanju' | 'malo' | 'narudzba'

export type Product = {
  id: string
  name: string
  spec: string
  cat: CatId
  price: number // KM po jedinici
  unit: string
  stock: Stock
  isNew?: boolean
  tile: number // indeks boje iz TILES (content.ts): dok nema fotografija, ploča je siva površina
  desc: string
  facts: [string, string][]
}

export const CATS: { id: CatId; name: string; text: string; facts: string[] }[] = [
  {
    id: 'ploce',
    name: 'Gips-karton ploče',
    text: 'Osnova suhe gradnje: pregradni zidovi, obloge i spušteni plafoni. Standardne, vodootporne i vatrootporne ploče.',
    facts: ['Debljine 12,5 i 15 mm', 'Standardne, vodootporne, vatrootporne', 'Zidovi, plafoni, obloge'],
  },
  {
    id: 'profili',
    name: 'Metalni profili',
    text: 'Pocinčana čelična konstrukcija na koju se ploče pričvršćuju. CD i UD za plafone, CW i UW za pregradne zidove.',
    facts: ['Pocinčani čelik', 'CD, UD, CW i UW profili', 'Nosiva konstrukcija zida i plafona'],
  },
  {
    id: 'izolacija',
    name: 'Kamena vuna',
    text: 'Toplotna, zvučna i protivpožarna izolacija za zidove, plafone i krovove. Kamena vuna nije zapaljiva.',
    facts: ['Toplotna i zvučna izolacija', 'Nije zapaljiva', 'Debljine 50, 100 i 150 mm'],
  },
  {
    id: 'mase',
    name: 'Mase i ljepila',
    text: 'Sve za spojeve i završnu obradu: mase za ispunu, gotove mase za gletovanje i ljepilo za montažu ploča.',
    facts: ['Masa za spojeve', 'Gotova masa za gletovanje', 'Gipsano ljepilo'],
  },
  {
    id: 'pribor',
    name: 'Pribor',
    text: 'Vijci, trake i ugaonici. Sitan materijal bez kojeg sistem nije gotov.',
    facts: ['Vijci za gips-karton', 'Trake za spojeve', 'Ugaonici sa mrežicom'],
  },
]

export const PRODUCTS: Product[] = [
  {
    id: 'gk-125',
    name: 'Gips-karton ploča 12,5 mm',
    spec: 'Standardna · 1200 × 2000 mm',
    cat: 'ploce',
    price: 9.8,
    unit: 'ploča',
    stock: 'na-stanju',
    tile: 0,
    desc: 'Osnovna ploča za pregradne zidove, obloge zidova i spuštene plafone u suvim prostorijama.',
    facts: [['Debljina', '12,5 mm'], ['Dimenzije', '1200 × 2000 mm'], ['Primjena', 'Suve prostorije'], ['Prodaje se po', 'ploči']],
  },
  {
    id: 'gk-125-vo',
    name: 'Gips-karton ploča vodootporna 12,5 mm',
    spec: 'Impregnirana · 1200 × 2000 mm',
    cat: 'ploce',
    price: 13.9,
    unit: 'ploča',
    stock: 'na-stanju',
    isNew: true,
    tile: 6,
    desc: 'Impregnirana ploča za prostorije sa povećanom vlagom, kao što su kupatila i kuhinje.',
    facts: [['Debljina', '12,5 mm'], ['Dimenzije', '1200 × 2000 mm'], ['Primjena', 'Vlažne prostorije'], ['Prodaje se po', 'ploči']],
  },
  {
    id: 'gk-150-vp',
    name: 'Gips-karton ploča vatrootporna 15 mm',
    spec: 'Vatrootporna · 1200 × 2000 mm',
    cat: 'ploce',
    price: 17.5,
    unit: 'ploča',
    stock: 'malo',
    isNew: true,
    tile: 3,
    desc: 'Ploča povećane otpornosti na vatru, za zidove i plafone gdje se traži protivpožarna zaštita.',
    facts: [['Debljina', '15 mm'], ['Dimenzije', '1200 × 2000 mm'], ['Primjena', 'Protivpožarna zaštita'], ['Prodaje se po', 'ploči']],
  },
  {
    id: 'cd-60',
    name: 'CD profil 60/27 mm',
    spec: 'Pocinčani čelik · dužina 3 m',
    cat: 'profili',
    price: 3.6,
    unit: 'komad',
    stock: 'na-stanju',
    tile: 7,
    desc: 'Nosivi profil za konstrukciju spuštenih plafona i obloga. Na njega se pričvršćuju ploče.',
    facts: [['Presjek', '60 × 27 mm'], ['Dužina', '3 m'], ['Materijal', 'Pocinčani čelik'], ['Prodaje se po', 'komadu']],
  },
  {
    id: 'ud-28',
    name: 'UD profil 28/27 mm',
    spec: 'Pocinčani čelik · dužina 3 m',
    cat: 'profili',
    price: 2.2,
    unit: 'komad',
    stock: 'na-stanju',
    tile: 1,
    desc: 'Rubni profil koji se pričvršćuje uz zid i drži konstrukciju spuštenog plafona.',
    facts: [['Presjek', '28 × 27 mm'], ['Dužina', '3 m'], ['Materijal', 'Pocinčani čelik'], ['Prodaje se po', 'komadu']],
  },
  {
    id: 'cw-50',
    name: 'CW profil 50/50 mm',
    spec: 'Za pregradne zidove · dužina 3 m',
    cat: 'profili',
    price: 4.1,
    unit: 'komad',
    stock: 'na-stanju',
    tile: 10,
    desc: 'Vertikalni stub konstrukcije pregradnog zida. Ulazi u UW profil na podu i plafonu.',
    facts: [['Presjek', '50 × 50 mm'], ['Dužina', '3 m'], ['Materijal', 'Pocinčani čelik'], ['Prodaje se po', 'komadu']],
  },
  {
    id: 'uw-50',
    name: 'UW profil 50/40 mm',
    spec: 'Za pregradne zidove · dužina 3 m',
    cat: 'profili',
    price: 3.4,
    unit: 'komad',
    stock: 'na-stanju',
    tile: 4,
    desc: 'Vodilica pregradnog zida. Pričvršćuje se za pod i plafon, a u nju ulaze CW profili.',
    facts: [['Presjek', '50 × 40 mm'], ['Dužina', '3 m'], ['Materijal', 'Pocinčani čelik'], ['Prodaje se po', 'komadu']],
  },
  {
    id: 'kv-50',
    name: 'Kamena vuna 50 mm',
    spec: 'Ploče · 1000 × 600 mm',
    cat: 'izolacija',
    price: 5.9,
    unit: 'm²',
    stock: 'na-stanju',
    tile: 2,
    desc: 'Toplotna i zvučna izolacija za ispunu pregradnih zidova i obloga.',
    facts: [['Debljina', '50 mm'], ['Dimenzije ploče', '1000 × 600 mm'], ['Svojstvo', 'Nije zapaljiva'], ['Prodaje se po', 'm²']],
  },
  {
    id: 'kv-100',
    name: 'Kamena vuna 100 mm',
    spec: 'Ploče · 1000 × 600 mm',
    cat: 'izolacija',
    price: 11.2,
    unit: 'm²',
    stock: 'na-stanju',
    tile: 12,
    desc: 'Deblji sloj izolacije za bolju toplotnu i zvučnu zaštitu zidova i krovova.',
    facts: [['Debljina', '100 mm'], ['Dimenzije ploče', '1000 × 600 mm'], ['Svojstvo', 'Nije zapaljiva'], ['Prodaje se po', 'm²']],
  },
  {
    id: 'kv-150',
    name: 'Kamena vuna 150 mm',
    spec: 'Ploče · 1000 × 600 mm',
    cat: 'izolacija',
    price: 16.8,
    unit: 'm²',
    stock: 'narudzba',
    isNew: true,
    tile: 9,
    desc: 'Najdeblji sloj za krovne konstrukcije i objekte sa većim zahtjevima za izolaciju.',
    facts: [['Debljina', '150 mm'], ['Dimenzije ploče', '1000 × 600 mm'], ['Svojstvo', 'Nije zapaljiva'], ['Prodaje se po', 'm²']],
  },
  {
    id: 'masa-spoj',
    name: 'Masa za spojeve',
    spec: 'Za ispunu spojeva · vreća 25 kg',
    cat: 'mase',
    price: 21,
    unit: 'vreća',
    stock: 'na-stanju',
    tile: 5,
    desc: 'Masa za punjenje spojeva između ploča i zaglađivanje površine prije bojenja.',
    facts: [['Pakovanje', 'Vreća 25 kg'], ['Primjena', 'Spojevi ploča'], ['Stanje', 'Prah, miješa se sa vodom'], ['Prodaje se po', 'vreći']],
  },
  {
    id: 'ljep-gk',
    name: 'Ljepilo za gips-karton',
    spec: 'Gipsano ljepilo · vreća 25 kg',
    cat: 'mase',
    price: 9.5,
    unit: 'vreća',
    stock: 'na-stanju',
    isNew: true,
    tile: 8,
    desc: 'Gipsano ljepilo za lijepljenje ploča i gipsanih elemenata direktno na zid.',
    facts: [['Pakovanje', 'Vreća 25 kg'], ['Primjena', 'Lijepljenje ploča'], ['Stanje', 'Prah, miješa se sa vodom'], ['Prodaje se po', 'vreći']],
  },
  {
    id: 'masa-gotova',
    name: 'Gotova masa za gletovanje',
    spec: 'Završni sloj · kanta 25 kg',
    cat: 'mase',
    price: 24,
    unit: 'kanta',
    stock: 'malo',
    isNew: true,
    tile: 13,
    desc: 'Gotova masa spremna za upotrebu, za završno gletovanje i izravnavanje površine.',
    facts: [['Pakovanje', 'Kanta 25 kg'], ['Primjena', 'Završno gletovanje'], ['Stanje', 'Spremna za upotrebu'], ['Prodaje se po', 'kanti']],
  },
  {
    id: 'vijci-35',
    name: 'Vijci za gips-karton 3,5 × 25 mm',
    spec: 'Fosfatirani · pakovanje 1000 kom',
    cat: 'pribor',
    price: 9.9,
    unit: 'paket',
    stock: 'na-stanju',
    tile: 11,
    desc: 'Samourezni vijci za pričvršćivanje ploča na metalnu konstrukciju.',
    facts: [['Dimenzije', '3,5 × 25 mm'], ['Pakovanje', '1000 komada'], ['Površina', 'Fosfatirani'], ['Prodaje se po', 'paketu']],
  },
  {
    id: 'traka-spoj',
    name: 'Traka za spojeve',
    spec: 'Papirna · rolna 150 m',
    cat: 'pribor',
    price: 5.2,
    unit: 'rolna',
    stock: 'na-stanju',
    tile: 14,
    desc: 'Traka koja se utiskuje u masu preko spojeva i sprečava pucanje.',
    facts: [['Tip', 'Papirna'], ['Dužina', '150 m'], ['Primjena', 'Spojevi ploča'], ['Prodaje se po', 'rolni']],
  },
  {
    id: 'ugaonik',
    name: 'Ugaonik sa mrežicom',
    spec: 'Za zaštitu ćoškova · dužina 3 m',
    cat: 'pribor',
    price: 2.4,
    unit: 'komad',
    stock: 'na-stanju',
    isNew: true,
    tile: 6,
    desc: 'Metalni ugaonik sa mrežicom za zaštitu i ravan završetak ćoškova.',
    facts: [['Tip', 'Sa mrežicom'], ['Dužina', '3 m'], ['Primjena', 'Ćoškovi'], ['Prodaje se po', 'komadu']],
  },
]

export const STOCK_LABEL: Record<Stock, string> = {
  'na-stanju': 'Na stanju',
  malo: 'Malo na stanju',
  narudzba: 'Na narudžbu',
}

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)
export const catName = (id: CatId) => CATS.find((c) => c.id === id)!.name

// 1.290,00 KM — ručno, da server i preglednik uvijek daju isti tekst
export function km(n: number) {
  const [int, dec] = n.toFixed(2).split('.')
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec} KM`
}

// 1 artikal, 2–4 artikla, 5+ artikala (11–14 su izuzetak)
export function artikala(n: number) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return `${n} artikal`
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} artikla`
  return `${n} artikala`
}

// Pretraga ignoriše dijakritike i crtice: "gips karton ploca" nalazi "Gips-karton ploča".
export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[-–/]/g, ' ')
