// Podaci o firmi i poslovni uslovi za pravne stranice (company.ts iz grand-root), popunjeni iz našeg kataloga
// (src/gc). Šta NIJE poznato ostaje `null`: u pravnim tekstovima se tada prikazuje kao istaknuta oznaka
// [žiro račun], a u podnožju se red preskače. Ništa se ne izmišlja.

import { COMPANY as GC, DELIVERY_ZONES, FREE_DELIVERY_OVER } from '@/gc/gc'
import { km } from './shop'

export const COMPANY = {
  brand: 'GRAND COMPANY',
  legalName: GC.name,
  city: 'Banja Luka',
  country: 'Bosna i Hercegovina',
  founded: '23. aprila 2012.',
  director: GC.founder,
  activityCode: 'G 46.73',

  address: GC.address as string | null,
  jib: GC.jib as string | null,
  vat: GC.pib as string | null, // PIB = PDV broj
  court: `MBS ${GC.mbs}` as string | null, // matični broj subjekta upisa; naziv registarskog suda nije poznat
  account: null as string | null, // žiro račun / banka — NEPOZNATO
  email: GC.emailInfo as string | null,
  emailSales: GC.emailSales as string | null,
  phone: GC.phoneLandline as string | null,
  phoneHref: GC.phoneLandlineHref,
  mobile: GC.phoneMobile as string | null,
  mobileHref: GC.phoneMobileHref,
  web: null as string | null, // web adresa — NEPOZNATO
}

// Poslovni uslovi. Dostava i besplatna dostava su iz kataloga; rok isporuke nije potvrđen (null).
export const TERMS = {
  currency: 'KM',
  freeDeliveryFrom: FREE_DELIVERY_OVER,
  deliveryDays: null as string | null,
  deliveryZone: `${DELIVERY_ZONES[0].label.split(',')[0]} i regija do 50 km`,
  withdrawalDays: 14, // dani; provjeriti sa pravnikom
}

export const SITE = {
  demo: true,
  // Napomena "Nacrt" na pravnim stranicama. Ugasiti tek kad pravnik pregleda tekstove.
  legalDraft: true,
}

const TOKENS: Record<string, string | null> = {
  naziv: COMPANY.legalName,
  grad: COMPANY.city,
  direktor: COMPANY.director,
  sjediste: COMPANY.address,
  jib: COMPANY.jib,
  pdv: COMPANY.vat,
  registracija: COMPANY.court,
  racun: COMPANY.account,
  email: COMPANY.email,
  telefon: COMPANY.phone,
  mobilni: COMPANY.mobile,
  prodaja: COMPANY.emailSales,
  web: COMPANY.web,
  rokIsporuke: TERMS.deliveryDays,
  zonaDostave: TERMS.deliveryZone,
  besplatnaDostava: km(TERMS.freeDeliveryFrom),
  rokOdustanka: `${TERMS.withdrawalDays} dana`,
}

const LABELS: Record<string, string> = {
  sjediste: 'sjedište',
  jib: 'JIB',
  pdv: 'PDV broj',
  registracija: 'registracija',
  racun: 'žiro račun',
  email: 'e-pošta',
  telefon: 'telefon',
  web: 'web adresa',
  rokIsporuke: 'rok isporuke',
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
