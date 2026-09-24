import { productById, type Product } from '@/lib/shop'

export const BRAND = 'GRAND COMPANY'

// Ploče u prstenu: naši artikli (packshot crtež ili fotografija). w = širina u jedinicama `u`
// (visina je uvijek 0.5625u); a/b su boje podloge, koje koristi i "pikselizirani" mozaik kad je kontakt otvoren.
const RING: [string, number][] = [
  ['KNF-001', 1],
  ['ISO-003', 1],
  ['PRF-075', 0.75],
  ['CHM-001', 1],
  ['KNF-003', 1.125],
  ['ISO-004', 0.75],
  ['ACC-001', 1],
  ['PRF-CD60', 1],
  ['KNF-002', 0.75],
  ['CHM-006', 1.125],
  ['ISO-006', 1],
  ['ACC-003', 0.75],
  ['KNF-004', 1],
  ['ISO-007', 1.125],
  ['CHM-004', 0.75],
]

export type Tile = { w: number; p: Product; a: string; b: string }

// Svijetla podloga za crteže (na crnom sajtu), tamnija za fotografije.
export const WELL = { a: '#f1f1ec', b: '#d9dad3' }

export const TILES: Tile[] = RING.flatMap(([sku, w]) => {
  const p = productById(sku)
  return p ? [{ w, p, ...(p.drawing ? WELL : { a: '#8d8d88', b: '#4a4a47' }) }] : []
})

export const TEXT = {
  left: 'Od 2012. u Banjoj Luci',
  center: 'Građevinski materijal',
}

export const pad = (n: number) => String(n).padStart(3, '0')
