// Podaci o firmi i poslovni uslovi za pravne stranice (preneseno iz grand-root lib/company.ts).
//
// Sve poznato dolazi iz zajedničkog kataloga (src/gc: COMPANY, DELIVERY_ZONES, FREE_DELIVERY_OVER).
// Šta NIJE poznato ostaje `null`: u pravnim tekstovima se tada prikazuje kao istaknuta oznaka [žiro račun],
// a u podnožju se red preskače. Ništa se ne izmišlja.

import { COMPANY as GC, FREE_DELIVERY_OVER, km } from '@/gc/gc'

export const COMPANY = {
  brand: 'GRAND COMPANY',
  legalName: GC.name,
  city: 'Banja Luka',
  country: 'Bosna i Hercegovina',
  founded: `${GC.founded}.`,
  founder: GC.founder,
  address: GC.address,
  jib: GC.jib,
  vat: GC.pib, // PIB = PDV broj
  mbs: GC.mbs,
  email: GC.emailInfo,
  emailSales: GC.emailSales,
  phone: `${GC.phoneLandline}, ${GC.phoneMobile}`,

  // NEPOZNATO — dopuniti iz registracije firme:
  director: null as string | null,
  account: null as string | null, // žiro račun / banka
  web: null as string | null,
}

// Lokacija stovarišta na Google mapi (Nenada Kostića 151, Zalužani). Svaka adresa na sajtu vodi ovdje.
export const MAPS_URL =
  'https://www.google.com/maps/place/Grand+company/@44.8314274,17.1833883,17z/data=!3m1!4b1!4m6!3m5!1s0x475e0147a2de83a9:0xc6444a56e406d81b!8m2!3d44.8314236!4d17.1859632!16s%2Fg%2F11fp802zb2'

// Poslovni uslovi iz podataka firme. Rok za odustanak od ugovora nije potvrđen, pa ostaje oznaka.
export const TERMS = {
  currency: 'KM',
  freeDeliveryFrom: FREE_DELIVERY_OVER,
  deliveryDays: 'jednog dana (isti ili sljedeći dan) za robu koja je na stanju',
  // Iz DELIVERY_ZONES: tri zone, najdalja do 50 km od Banje Luke.
  deliveryZone: 'Banja Luka i regija do 50 km (Laktaši, Čelinac, Prijedor, Gradiška…)',
  withdrawalDays: null as number | null,
}

// Zastavice sajta.
export const SITE = {
  demo: true,
  // Napomena "Nacrt" na pravnim stranicama. Ugasi tek kad pravnik pregleda tekstove.
  legalDraft: true,
}

const TOKENS: Record<string, string | null> = {
  naziv: COMPANY.legalName,
  grad: COMPANY.city,
  direktor: COMPANY.director,
  osnivac: COMPANY.founder,
  osnovano: COMPANY.founded,
  sjediste: COMPANY.address,
  jib: COMPANY.jib,
  pdv: COMPANY.vat,
  registracija: COMPANY.mbs,
  racun: COMPANY.account,
  email: COMPANY.email,
  telefon: COMPANY.phone,
  web: COMPANY.web,
  rokIsporuke: TERMS.deliveryDays,
  zonaDostave: TERMS.deliveryZone,
  besplatnaDostava: km(TERMS.freeDeliveryFrom),
  rokOdustanka: TERMS.withdrawalDays ? `${TERMS.withdrawalDays} dana` : null,
}

// Kako se nepoznati podatak prikazuje u tekstu (čitljivo, sa dijakriticima).
const LABELS: Record<string, string> = {
  sjediste: 'sjedište',
  direktor: 'direktor',
  jib: 'JIB',
  pdv: 'PDV broj',
  registracija: 'registracija',
  racun: 'žiro račun',
  email: 'e-pošta',
  telefon: 'telefon',
  web: 'web adresa',
  rokOdustanka: 'rok za odustanak',
}

export type TextPart = { text: string; kind: 'plain' | 'em' | 'missing' }

// Razlaže tekst na dijelove: {oznaka} → vrijednost (ili "missing" ako je nepoznata), *tekst* → kurziv.
export function parseText(input: string): TextPart[] {
  const parts: TextPart[] = []
  const re = /\{(\w+)\}|\*([^*]+)\*/g
  let last = 0
  for (let m = re.exec(input); m; m = re.exec(input)) {
    if (m.index > last) parts.push({ text: input.slice(last, m.index), kind: 'plain' })
    if (m[1]) {
      const v = TOKENS[m[1]]
      parts.push(v ? { text: v, kind: 'plain' } : { text: `[${LABELS[m[1]] ?? m[1]}]`, kind: 'missing' })
    } else {
      parts.push({ text: m[2], kind: 'em' })
    }
    last = m.index + m[0].length
  }
  if (last < input.length) parts.push({ text: input.slice(last), kind: 'plain' })
  return parts
}
