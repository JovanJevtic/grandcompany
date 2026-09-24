export const BRAND = 'GRAND COMPANY'

// Ploče u prstenu: w = širina u jedinicama `u` (visina je uvijek 0.5625u), a = gornja, b = donja boja.
// Sive nijanse od gotovo crne do gotovo bijele, da prsten ima isti kontrast kao sa fotografijama.
export const TILES: { w: number; a: string; b: string }[] = [
  { w: 1, a: '#e8e8e6', b: '#bdbdba' },
  { w: 1, a: '#2b2b2b', b: '#0d0d0d' },
  { w: 0.75, a: '#9a9a98', b: '#6b6b69' },
  { w: 1, a: '#f4f4f2', b: '#d0d0cd' },
  { w: 1.125, a: '#555555', b: '#2f2f2f' },
  { w: 0.75, a: '#c8c8c5', b: '#8d8d8a' },
  { w: 1, a: '#161616', b: '#050505' },
  { w: 1, a: '#b5b5b2', b: '#7d7d7a' },
  { w: 0.75, a: '#dcdcd9', b: '#a6a6a3' },
  { w: 1.125, a: '#3c3c3c', b: '#1b1b1b' },
  { w: 1, a: '#ececea', b: '#c4c4c1' },
  { w: 0.75, a: '#7b7b79', b: '#4e4e4c' },
  { w: 1, a: '#d3d3d0', b: '#9c9c99' },
  { w: 1.125, a: '#242424', b: '#0a0a0a' },
  { w: 0.75, a: '#a9a9a6', b: '#727270' },
]

export const TEXT = {
  left: 'Od 2012. u Banjoj Luci',
  center: 'Građevinski materijal',
}

export const pad = (n: number) => String(n).padStart(3, '0')
