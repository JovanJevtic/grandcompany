// Sadržaj prodavnice: kategorije, artikli, sekcije, pitanja. SVE JE PRIMJER (skica) dok firma ne dostavi stvarnu
// ponudu: nazivi, cijene, količine i zalihe su izmišljeni. Prava ponuda ide isključivo u PRODUCTS.
// Tekstovi mogu koristiti oznake iz company.ts ({rokIsporuke}, {besplatnaDostava}, ...) i *kurziv*.

import { TERMS } from './company'

// ---------- kategorije i namjene ----------

export type CategoryId = 'gradjevinski' | 'suha-gradnja' | 'kamena-vuna' | 'drvo' | 'sanitarna'

export const CATEGORIES: { id: CategoryId; label: string; blurb: string }[] = [
  { id: 'gradjevinski', label: 'Građevinski materijal', blurb: 'Cement, malteri, ljepila i zidni blokovi' },
  { id: 'suha-gradnja', label: 'Suha gradnja', blurb: 'Gips-karton ploče i metalni profili' },
  { id: 'kamena-vuna', label: 'Kamena vuna', blurb: 'Izolacija za fasade, pregrade i krovove' },
  { id: 'drvo', label: 'Drvo', blurb: 'Rezana građa i ploče' },
  { id: 'sanitarna', label: 'Sanitarna oprema', blurb: 'Keramika i armature za kupatilo' },
]

export type UseId = 'fasada' | 'pregrade' | 'krov' | 'kupatilo' | 'podovi' | 'konstrukcija'

export const USES: { id: UseId; label: string; blurb: string }[] = [
  { id: 'fasada', label: 'Fasada', blurb: 'Toplotna izolacija i lijepljenje ploča' },
  { id: 'pregrade', label: 'Pregradni zidovi', blurb: 'Suha gradnja i zvučna izolacija' },
  { id: 'krov', label: 'Krov i potkrovlje', blurb: 'Izolacija, letve i podkonstrukcija' },
  { id: 'kupatilo', label: 'Kupatilo', blurb: 'Vlagootporne ploče i sanitarije' },
  { id: 'podovi', label: 'Podovi', blurb: 'Estrisi i podne ploče' },
  { id: 'konstrukcija', label: 'Konstrukcija', blurb: 'Zidanje, beton i drvena građa' },
]

// ---------- artikli ----------

export type Availability = 'na-stanju' | 'ograniceno' | 'po-narudzbi'

export const AVAIL_LABEL: Record<Availability, string> = {
  'na-stanju': 'Na stanju',
  ograniceno: 'Ograničene zalihe',
  'po-narudzbi': 'Po narudžbi',
}

export type Product = {
  id: string
  name: string
  category: CategoryId
  uses: UseId[]
  price: number // KM, sa PDV-om, po jedinici
  unit: string // vreća, komad, paket
  avail: Availability
  isNew?: boolean
  bestseller?: boolean
  tone: number // koja siva ploča stoji umjesto fotografije
  summary: string
  specs: { dimenzije: string; pakovanje: string; primjena: string }
}

export const PRODUCTS: Product[] = [
  {
    id: 'ljepilo-fasada',
    name: 'Ljepilo za fasadne ploče',
    category: 'gradjevinski',
    uses: ['fasada'],
    price: 14.5,
    unit: 'vreća',
    avail: 'na-stanju',
    bestseller: true,
    tone: 0,
    summary: 'Ljepilo za lijepljenje izolacionih ploča na fasadu, u vreći od 25 kg.',
    specs: { dimenzije: '—', pakovanje: 'Vreća 25 kg', primjena: 'Lijepljenje izolacionih ploča na fasadu' },
  },
  {
    id: 'kv-fasada',
    name: 'Kamena vuna za fasade, 100 mm',
    category: 'kamena-vuna',
    uses: ['fasada'],
    price: 46,
    unit: 'paket',
    avail: 'na-stanju',
    isNew: true,
    bestseller: true,
    tone: 3,
    summary: 'Ploče kamene vune za toplotnu izolaciju fasada, debljine 100 mm.',
    specs: { dimenzije: 'Debljina 100 mm', pakovanje: 'Paket', primjena: 'Toplotna izolacija fasada' },
  },
  {
    id: 'gk-125',
    name: 'Gips-karton ploča, 12,5 mm',
    category: 'suha-gradnja',
    uses: ['pregrade', 'krov'],
    price: 9.9,
    unit: 'komad',
    avail: 'na-stanju',
    bestseller: true,
    tone: 2,
    summary: 'Standardna gips-karton ploča za pregradne zidove i spuštene plafone.',
    specs: { dimenzije: '1200 × 2000 mm', pakovanje: 'Komad', primjena: 'Pregradni zidovi i plafoni' },
  },
  {
    id: 'gk-vlaga',
    name: 'Gips-karton ploča, vlagootporna 12,5 mm',
    category: 'suha-gradnja',
    uses: ['kupatilo', 'pregrade'],
    price: 12.4,
    unit: 'komad',
    avail: 'na-stanju',
    isNew: true,
    tone: 5,
    summary: 'Vlagootporna ploča za kupatila i druge vlažne prostorije.',
    specs: { dimenzije: '1200 × 2000 mm', pakovanje: 'Komad', primjena: 'Kupatila i vlažne prostorije' },
  },
  {
    id: 'cd-profil',
    name: 'CD profil 60 × 27 mm, 3 m',
    category: 'suha-gradnja',
    uses: ['pregrade', 'krov'],
    price: 3.2,
    unit: 'komad',
    avail: 'na-stanju',
    tone: 1,
    summary: 'Noseći metalni profil za podkonstrukciju suhe gradnje.',
    specs: { dimenzije: '60 × 27 mm, dužina 3 m', pakovanje: 'Komad', primjena: 'Nosiva konstrukcija suhe gradnje' },
  },
  {
    id: 'ud-profil',
    name: 'UD profil 28 × 27 mm, 3 m',
    category: 'suha-gradnja',
    uses: ['pregrade', 'krov'],
    price: 2.4,
    unit: 'komad',
    avail: 'na-stanju',
    tone: 4,
    summary: 'Obodni metalni profil za pričvršćivanje pregrada uz zid i strop.',
    specs: { dimenzije: '28 × 27 mm, dužina 3 m', pakovanje: 'Komad', primjena: 'Obodni profil suhe gradnje' },
  },
  {
    id: 'kv-pregrade',
    name: 'Kamena vuna za pregradne zidove, 50 mm',
    category: 'kamena-vuna',
    uses: ['pregrade'],
    price: 28.5,
    unit: 'paket',
    avail: 'ograniceno',
    tone: 0,
    summary: 'Ploče kamene vune za zvučnu i protivpožarnu izolaciju pregrada.',
    specs: { dimenzije: 'Debljina 50 mm', pakovanje: 'Paket', primjena: 'Zvučna i protivpožarna izolacija pregrada' },
  },
  {
    id: 'kv-krov',
    name: 'Kamena vuna za kosi krov, 150 mm',
    category: 'kamena-vuna',
    uses: ['krov'],
    price: 62,
    unit: 'paket',
    avail: 'po-narudzbi',
    isNew: true,
    tone: 3,
    summary: 'Debela izolacija za kose krovove i potkrovlja.',
    specs: { dimenzije: 'Debljina 150 mm', pakovanje: 'Paket', primjena: 'Izolacija kosog krova i potkrovlja' },
  },
  {
    id: 'cement',
    name: 'Portland cement',
    category: 'gradjevinski',
    uses: ['konstrukcija', 'podovi'],
    price: 9.8,
    unit: 'vreća',
    avail: 'na-stanju',
    bestseller: true,
    tone: 2,
    summary: 'Cement za betone, estrihe i maltere, u vreći od 25 kg.',
    specs: { dimenzije: '—', pakovanje: 'Vreća 25 kg', primjena: 'Betoni, estrisi i malteri' },
  },
  {
    id: 'malter-zidanje',
    name: 'Malter za zidanje',
    category: 'gradjevinski',
    uses: ['konstrukcija'],
    price: 7.9,
    unit: 'vreća',
    avail: 'na-stanju',
    tone: 5,
    summary: 'Gotova smjesa za zidanje blokova i opeke, u vreći od 25 kg.',
    specs: { dimenzije: '—', pakovanje: 'Vreća 25 kg', primjena: 'Zidanje blokova i opeke' },
  },
  {
    id: 'blok-19',
    name: 'Zidni blok 250 × 190 × 190 mm',
    category: 'gradjevinski',
    uses: ['konstrukcija', 'pregrade'],
    price: 1.45,
    unit: 'komad',
    avail: 'ograniceno',
    tone: 1,
    summary: 'Blok za zidanje nosivih i pregradnih zidova.',
    specs: { dimenzije: '250 × 190 × 190 mm', pakovanje: 'Komad / paleta', primjena: 'Nosivi i pregradni zidovi' },
  },
  {
    id: 'letva-45',
    name: 'Rezana građa, letva 40 × 50 mm, 3 m',
    category: 'drvo',
    uses: ['krov', 'konstrukcija'],
    price: 4.6,
    unit: 'komad',
    avail: 'na-stanju',
    tone: 4,
    summary: 'Letva od rezane građe za podkonstrukciju i oplatu.',
    specs: { dimenzije: '40 × 50 mm, dužina 3 m', pakovanje: 'Komad', primjena: 'Podkonstrukcija, oplata, krovna konstrukcija' },
  },
  {
    id: 'osb-18',
    name: 'OSB ploča 18 mm',
    category: 'drvo',
    uses: ['konstrukcija', 'podovi', 'krov'],
    price: 38,
    unit: 'komad',
    avail: 'ograniceno',
    tone: 0,
    summary: 'Konstrukcijska ploča za podove, zidne i krovne obloge.',
    specs: { dimenzije: '2500 × 1250 × 18 mm', pakovanje: 'Komad', primjena: 'Podovi, zidne i krovne obloge' },
  },
  {
    id: 'umivaonik-60',
    name: 'Umivaonik keramički, 60 cm',
    category: 'sanitarna',
    uses: ['kupatilo'],
    price: 89,
    unit: 'komad',
    avail: 'na-stanju',
    isNew: true,
    tone: 2,
    summary: 'Keramički umivaonik za zidnu ugradnju, širine 60 cm.',
    specs: { dimenzije: 'Širina 60 cm', pakovanje: 'Komad', primjena: 'Kupatila i toaleti' },
  },
  {
    id: 'wc-monoblok',
    name: 'WC šolja, monoblok',
    category: 'sanitarna',
    uses: ['kupatilo'],
    price: 165,
    unit: 'komad',
    avail: 'po-narudzbi',
    tone: 5,
    summary: 'Monoblok WC šolja sa vodokotlićem.',
    specs: { dimenzije: '—', pakovanje: 'Komad', primjena: 'Kupatila i toaleti' },
  },
  {
    id: 'baterija-umivaonik',
    name: 'Baterija za umivaonik, hrom',
    category: 'sanitarna',
    uses: ['kupatilo'],
    price: 74,
    unit: 'komad',
    avail: 'na-stanju',
    tone: 3,
    summary: 'Stojeća hromirana baterija za umivaonik.',
    specs: { dimenzije: '—', pakovanje: 'Komad', primjena: 'Kupatila i toaleti' },
  },
]

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)
export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id

// KM: 1.250,00 KM (ručno, da server i preglednik uvijek daju isti tekst).
export function formatPrice(n: number) {
  const [whole, dec] = n.toFixed(2).split('.')
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec} ${TERMS.currency}`
}

// ---------- filteri ----------

export type Filters = {
  q: string
  cat: CategoryId | 'sve'
  use: UseId | 'sve'
  avail: 'sve' | 'na-stanju'
  price: 'sve' | 'do-20' | '20-100' | 'preko-100'
  sort: 'izdvojeno' | 'cijena-rastuce' | 'cijena-opadajuce' | 'naziv'
}

export const DEFAULT_FILTERS: Filters = { q: '', cat: 'sve', use: 'sve', avail: 'sve', price: 'sve', sort: 'izdvojeno' }

export const PRICE_RANGES: { id: Filters['price']; label: string }[] = [
  { id: 'sve', label: 'Sve cijene' },
  { id: 'do-20', label: `Do 20 ${TERMS.currency}` },
  { id: '20-100', label: `20 – 100 ${TERMS.currency}` },
  { id: 'preko-100', label: `Preko 100 ${TERMS.currency}` },
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
    if (f.avail === 'na-stanju' && p.avail !== 'na-stanju') return false
    if (f.price === 'do-20' && p.price > 20) return false
    if (f.price === '20-100' && (p.price <= 20 || p.price > 100)) return false
    if (f.price === 'preko-100' && p.price <= 100) return false
    if (q) {
      const hay = `${p.name} ${categoryLabel(p.category)} ${p.summary} ${p.specs.primjena}`.toLocaleLowerCase('bs')
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false
    }
    return true
  })
  if (f.sort === 'cijena-rastuce') out.sort((a, b) => a.price - b.price)
  else if (f.sort === 'cijena-opadajuce') out.sort((a, b) => b.price - a.price)
  else if (f.sort === 'naziv') out.sort((a, b) => a.name.localeCompare(b.name, 'bs'))
  return out
}

// ---------- sekcije ----------

export const BENEFITS = [
  { no: '01', title: 'Dostava', text: 'Isporuka na adresu: {zonaDostave}. Rok: {rokIsporuke}.' },
  { no: '02', title: 'Povrat', text: '{rokOdustanka} za odustanak od kupovine, uz izuzetke koje propisuje zakon.' },
  { no: '03', title: 'Reklamacije', text: 'Garancija i reklamacije u skladu sa zakonom i garantnim listom proizvođača.' },
  { no: '04', title: 'Stručan savjet', text: 'Naš tim odgovara na pitanja i pomaže pri izboru materijala.' },
]

export const MATERIALS: {
  id: string
  name: string
  category: CategoryId
  line: string
  text: string
  props: string[]
}[] = [
  {
    id: 'kamena-vuna',
    name: 'Kamena vuna',
    category: 'kamena-vuna',
    line: 'Izolacija od vlakana kamena.',
    text: 'Ugrađuje se u fasade, pregradne zidove, potkrovlja i kose krovove. Štiti od hladnoće, buke i vatre, a prodajemo je kao zaseban proizvod, uz stručan savjet pri izboru.',
    props: ['Toplotna izolacija', 'Zvučna izolacija', 'Negorivost'],
  },
  {
    id: 'suha-gradnja',
    name: 'Suha gradnja',
    category: 'suha-gradnja',
    line: 'Zidovi i plafoni bez mokrih radova.',
    text: 'Sistemi suhe gradnje spajaju gips-karton ploče i metalne profile. Služe za građenje i uređenje enterijera suhim postupkom: pregradni zidovi, obloge i spušteni plafoni.',
    props: ['Brza ugradnja', 'Lake konstrukcije', 'Čisto gradilište'],
  },
  {
    id: 'gradjevinski',
    name: 'Građevinski materijal',
    category: 'gradjevinski',
    line: 'Osnova svake gradnje.',
    text: 'Cement, malteri, ljepila i zidni blokovi: opšta prodaja materijala za gradnju i opremanje objekata, za privatne kupce i za izvođače radova.',
    props: ['Za privatne kupce', 'Za izvođače radova', 'Veleprodaja i maloprodaja'],
  },
  {
    id: 'drvo',
    name: 'Drvo',
    category: 'drvo',
    line: 'Građa i ploče za konstrukciju.',
    text: 'Rezana građa i drvene ploče za podkonstrukciju, oplatu, podove i krovne konstrukcije.',
    props: ['Rezana građa', 'Konstrukcijske ploče', 'Podkonstrukcija'],
  },
  {
    id: 'sanitarna',
    name: 'Sanitarna oprema',
    category: 'sanitarna',
    line: 'Za kupatila i toalete.',
    text: 'Keramika i armature za opremanje kupatila, uz vlagootporne ploče za pripremu prostora.',
    props: ['Keramika', 'Armature', 'Vlagootporne ploče'],
  },
]

export const TIERS: {
  no: string
  name: string
  who: string
  price: string
  note: string
  features: string[]
  cta: string
  href: string
  featured?: boolean
}[] = [
  {
    no: '01',
    name: 'Maloprodaja',
    who: 'Za privatne kupce i manje radove.',
    price: 'Iz kataloga',
    note: 'cijene u KM, sa PDV-om',
    features: ['Cijene istaknute u prodavnici', 'Stručan savjet pri izboru materijala', 'Dostava na adresu', 'Povrat u skladu sa zakonom'],
    cta: 'Pogledaj katalog',
    href: '/#katalog',
  },
  {
    no: '02',
    name: 'Veleprodaja',
    who: 'Za veće količine i cijele isporuke.',
    price: 'Na upit',
    note: 'ponuda prema količini',
    features: ['Količinski uslovi', 'Ponuda na osnovu predmjera', 'Isporuka na paletama', 'Dogovor o vremenu dostave'],
    cta: 'Zatraži ponudu',
    href: '/upit-za-izvodjace',
    featured: true,
  },
  {
    no: '03',
    name: 'Izvođači radova',
    who: 'Za firme i izvođače na gradilištu.',
    price: 'Po dogovoru',
    note: 'partnerski uslovi',
    features: ['Poseban cjenovnik po dogovoru', 'Isporuka na gradilište', 'Dogovoreni rokovi plaćanja', 'Stručna podrška pri izboru'],
    cta: 'Javi se za dogovor',
    href: '/upit-za-izvodjace',
  },
]

// Poređenje nivoa: true = uključeno, tekst = uslov, null = nije uključeno.
export const TIER_TABLE: { row: string; cells: [boolean | string, boolean | string, boolean | string] }[] = [
  { row: 'Cijene iz kataloga', cells: [true, true, true] },
  { row: 'Količinski uslovi', cells: [false, true, true] },
  { row: 'Ponuda na osnovu predmjera', cells: [false, true, true] },
  { row: 'Poseban cjenovnik', cells: [false, false, true] },
  { row: 'Isporuka na gradilište', cells: ['Po dogovoru', 'Po dogovoru', true] },
  { row: 'Stručan savjet', cells: [true, true, true] },
]

export const PAYMENTS = [
  { title: 'Pouzećem', text: 'Plaćanje gotovinom pri isporuci ili preuzimanju.' },
  { title: 'Uplata na račun', text: 'Uplata na osnovu predračuna ili ponude.' },
  { title: 'Karticom online', text: 'Bit će dostupno kada se aktivira online plaćanje.' },
]

export const DELIVERY_STEPS = [
  { no: '01', title: 'Narudžba potvrđena', text: 'Naš tim provjerava zalihe i potvrđuje narudžbu telefonom ili e-poštom.' },
  { no: '02', title: 'Roba pripremljena', text: 'Materijal se priprema i pakuje za prevoz; teže isporuke slažemo na palete.' },
  { no: '03', title: 'Isporuka', text: 'Roba stiže na adresu ili se preuzima. Vidljiva oštećenja evidentiraju se pri prijemu.' },
]

export const DELIVERY_FACTS = [
  { k: 'Područje dostave', v: '{zonaDostave}' },
  { k: 'Rok isporuke', v: '{rokIsporuke}' },
  { k: 'Besplatna dostava', v: 'Za narudžbe preko {besplatnaDostava}' },
]

export const FAQ: { q: string; a: string; link?: { label: string; href: string } }[] = [
  {
    q: 'Kako da naručim?',
    a: 'Odaberite artikle u katalogu, dodajte ih u korpu i pošaljite narudžbu. Naš tim je potvrđuje telefonom ili e-poštom prije pripreme i isporuke.',
    link: { label: 'Status narudžbe', href: '/status-narudzbe' },
  },
  {
    q: 'Koliko materijala mi treba?',
    a: 'Količinu najlakše određuje naš stručni tim na osnovu predmjera ili skice. Javite nam vrstu radova i površinu, pa ćemo predložiti materijal i količine.',
    link: { label: 'Kontakt', href: '/#kontakt' },
  },
  {
    q: 'Kako se plaća?',
    a: 'Pouzećem, ili uplatom na račun na osnovu predračuna. Kartično plaćanje na sajtu bit će dostupno kada se aktivira.',
    link: { label: 'Načini plaćanja', href: '/nacini-placanja' },
  },
  {
    q: 'Kako i kada stiže roba?',
    a: 'Isporučujemo na području: {zonaDostave}. Uobičajeni rok isporuke je {rokIsporuke}. Za teže i veće isporuke dogovaramo termin i način istovara.',
    link: { label: 'Dostava', href: '/dostava' },
  },
  {
    q: 'Mogu li vratiti robu?',
    a: 'Da. Imate pravo da odustanete od kupovine u roku od {rokOdustanka}, uz izuzetke kao što su roba rezana po mjeri ili već ugrađena.',
    link: { label: 'Povrat robe', href: '/povrat-robe' },
  },
  {
    q: 'Kako do ponude za veće količine?',
    a: 'Pošaljite nam upit sa popisom materijala i količinama. Izvođačima i većim projektima nudimo individualnu ponudu i dogovor o isporuci na gradilište.',
    link: { label: 'Upit za izvođače', href: '/upit-za-izvodjace' },
  },
]

// Podnožje. `href` vodi na rutu ili sidro početne strane; `action` otvara panel.
export type FooterLink = { label: string; href: string } | { label: string; action: 'saved' | 'compare' }

export const FOOTER: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Prodavnica',
    links: [
      { label: 'Svi artikli', href: '/#katalog' },
      { label: 'Novo u ponudi', href: '/#novo' },
      { label: 'Po vrsti radova', href: '/#radovi' },
      { label: 'Materijali', href: '/#materijali' },
      { label: 'Cijene i uslovi', href: '/#cijene' },
      { label: 'Sačuvano', action: 'saved' },
    ],
  },
  {
    title: 'Podrška',
    links: [
      { label: 'Kontakt', href: '/#kontakt' },
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
