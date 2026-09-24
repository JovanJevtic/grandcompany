// Podaci o firmi i poslovni uslovi prodavnice — JEDINO mjesto za dopunu prije objave.
//
// Šta je poznato (iz sadržaja sajta) je upisano. Šta NIJE poznato ostaje `null`: u pravnim tekstovima se
// tada prikazuje kao istaknuta oznaka [sjedište], a u podnožju se red jednostavno preskače.
// Ništa se ne izmišlja: dopuni stvarnim podacima iz registracije firme.

export const COMPANY = {
  brand: 'GRAND COMPANY',
  legalName: 'GRAND COMPANY d.o.o. za usluge i trgovinu',
  city: 'Banja Luka',
  country: 'Bosna i Hercegovina',
  founded: '23. aprila 2012.',
  director: 'Predrag Uzelac',
  activityCode: 'G 46.73',

  // NEPOZNATO — dopuniti:
  address: null as string | null, // sjedište i adresa prodajnog mjesta
  jib: null as string | null, // JIB (identifikacioni broj)
  vat: null as string | null, // PDV broj (ako je obveznik)
  court: null as string | null, // registarski sud i broj registracije
  account: null as string | null, // žiro račun / banka
  email: null as string | null,
  phone: null as string | null,
  web: null as string | null,
}

// Poslovni uslovi. SVE vrijednosti su PRIMJER dok ih firma ne potvrdi. Koriste se i u prodavnici i u pravnim
// tekstovima (kroz oznake {rokIsporuke} itd.), pa su uvijek usklađene.
export const TERMS = {
  currency: 'KM',
  freeDeliveryFrom: 300, // KM, primjer
  deliveryDays: '1 do 3 radna dana', // primjer
  deliveryZone: 'Banja Luka i okolina', // primjer
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
  besplatnaDostava: `${TERMS.freeDeliveryFrom},00 ${TERMS.currency}`,
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
