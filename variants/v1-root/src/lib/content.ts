export const BRAND = 'GRAND COMPANY'

// Boje: kremasta pozadina, tamno smeđa, i po jedna akcentna boja za svako poglavlje.
export const COLORS = {
  bg: '#faf6e7',
  ink: '#1a120b',
  base: '#687d79',
  why: '#d6956d',
  who: '#7d9baf',
  what: '#d66b58',
  how: '#647c67',
  connect: '#9a8570',
} as const

export type ChapterId = 'why' | 'who' | 'what' | 'how' | 'connect'

export const CHAPTERS: { id: ChapterId; index: string; label: string; color: string }[] = [
  { id: 'why', index: '01', label: 'Zašto', color: COLORS.why },
  { id: 'who', index: '02', label: 'Ko', color: COLORS.who },
  { id: 'what', index: '03', label: 'Šta', color: COLORS.what },
  { id: 'how', index: '04', label: 'Kako', color: COLORS.how },
  { id: 'connect', index: '05', label: 'Kontakt', color: COLORS.connect },
]

// Meni: pet poglavlja landinga + prodavnica ispod njega.
export const SHOP_ID = 'prodavnica'
export const MENU = [
  ...CHAPTERS.map((c) => ({ id: c.id as string, index: c.index, label: c.label, color: c.color })),
  { id: SHOP_ID, index: '06', label: 'Prodavnica', color: COLORS.why },
]

// Sive ploče umjesto fotografija (tople sive, da stoje uz krem pozadinu).
export const TONES = ['#d6d3cc', '#c9c6be', '#dedbd4', '#bfbcb4', '#d0cdc6', '#c4c1b9']
