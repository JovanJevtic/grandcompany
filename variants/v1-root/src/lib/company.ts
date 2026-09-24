// Podaci o firmi i poslovni uslovi prodavnice — JEDINO mjesto za dopunu prije objave.
//
// Šta je poznato (iz sadržaja sajta) je upisano. Šta NIJE poznato ostaje `null`: u pravnim tekstovima se
// tada prikazuje kao istaknuta oznaka [sjedište], a u podnožju se red jednostavno preskače.
// Ništa se ne izmišlja: dopuni stvarnim podacima iz registracije firme.

import { COMPANY as GC, FREE_DELIVERY_OVER } from '@/gc/gc'

export const COMPANY = {
  brand: 'GRAND COMPANY',
  legalName: GC.name,
  city: 'Banja Luka',
  country: 'Bosna i Hercegovina',
  founded: '23. aprila 2012.',
  director: GC.founder,
  activityCode: 'G 46.73',

  address: GC.address as string | null, // sjedište i stovarište
  jib: GC.jib as string | null,
  vat: GC.pib as string | null, // PDV broj (PIB)
  court: `MBS ${GC.mbs}` as string | null, // matični broj subjekta upisa; registarski sud dopuniti
  // NEPOZNATO — dopuniti:
  account: null as string | null, // žiro račun / banka
  email: GC.emailInfo as string | null,
  emailSales: GC.emailSales as string | null,
  phone: GC.phoneLandline as string | null,
  phoneHref: GC.phoneLandlineHref,
  mobile: GC.phoneMobile as string | null,
  mobileHref: GC.phoneMobileHref,
  web: null as string | null,
}

// Poslovni uslovi. SVE vrijednosti su PRIMJER dok ih firma ne potvrdi. Koriste se i u prodavnici i u pravnim
// tekstovima (kroz oznake {rokIsporuke} itd.), pa su uvijek usklađene.
export const TERMS = {
  currency: 'KM',
  freeDeliveryFrom: FREE_DELIVERY_OVER, // KM, standardna dostava (iz src/gc)
  deliveryDays: 'u terminu koji dogovaramo pri potvrdi narudžbe',
  deliveryZone: 'Banja Luka i regija do 50 km',
  withdrawalDays: 14, // dani; provjeriti sa pravnikom
}

// Zastavice sajta.
export const SITE = {
  // Prikazuje tanku traku "Demo prodavnica…" na vrhu prodavnice. Ugasi kad se poveže stvarna ponuda.
  demo: true,
  // Prikazuje napomenu "Nacrt" na pravnim stranicama. Ugasi tek kad pravnik pregleda tekstove.
  legalDraft: true,
}

// Oznake koje se mogu koristiti u tekstovima: {naziv}, {sjediste}, ...
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
  web: COMPANY.web,
  rokIsporuke: TERMS.deliveryDays,
  zonaDostave: TERMS.deliveryZone,
  besplatnaDostava: `${TERMS.freeDeliveryFrom.toLocaleString('de-DE')},00 ${TERMS.currency}`,
  rokOdustanka: `${TERMS.withdrawalDays} dana`,
}

// Kako se nepoznati podatak prikazuje u tekstu (čitljivo, sa dijakriticima).
const LABELS: Record<string, string> = {
  sjediste: 'sjedište',
  jib: 'JIB',
  pdv: 'PDV broj',
  registracija: 'registracija',
  racun: 'žiro račun',
  email: 'e-pošta',
  telefon: 'telefon',
  web: 'web adresa',
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
