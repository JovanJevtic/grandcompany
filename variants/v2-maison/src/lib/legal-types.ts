// Oblik pravnih i servisnih stranica (sadržaj je u legal.ts, prikaz u components/legal).

// U tekstu (p, ul, ol, dl, box, note) mogu se koristiti oznake iz company.ts: {naziv}, {sjediste}, {jib},
// {pdv}, {registracija}, {racun}, {email}, {telefon}, {web}, {direktor}, {grad}, {rokIsporuke}, {zonaDostave},
// {besplatnaDostava}, {rokOdustanka}. Kurziv se piše kao *tekst*.
export type LegalBlock =
  | { t: 'p'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'dl'; items: { k: string; v: string }[] } // par "pojam — vrijednost"
  | { t: 'box'; title?: string; lines: string[] } // uokvireni tekst (npr. model obrasca)
  | { t: 'note'; text: string } // sitna napomena ispod teksta

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] }

export type LegalGroup = 'kupovina' | 'pravno' | 'usluge'

export type LegalDoc = {
  slug: string
  title: string
  group: LegalGroup
  kicker: string // kratka oznaka iznad naslova, npr. "Isporuka"
  lead: string // uvodna rečenica ili dvije
  updated: string // npr. "24. septembar 2026."
  sections: LegalSection[]
}

export const GROUP_LABEL: Record<LegalGroup, string> = {
  kupovina: 'Kupovina',
  pravno: 'Pravno',
  usluge: 'Usluge',
}
