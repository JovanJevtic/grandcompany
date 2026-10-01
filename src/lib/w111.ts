// Kalkulator utroška za Knauf W111 pregradni zid (dokumentacija Grand Company, tačka 6):
// unos je površina zida u m², izbor jednostruke ili dvostruke obloge; svi normativi uključuju 5% otpada.
// Normativi po m² zida (obje strane zajedno), prema Knauf tehničkom listu W111 — orijentaciono.

export type Cladding = 'single' | 'double'

export const WASTE = 0.05
export const PROFILE_MM = 75
export const BOARD_MM = 12.5

type Norm = { key: string; label: string; sku: string; perM2: Record<Cladding, number>; unit: string; pack: number; packName: string; optional?: 'wool' }

// Ploča se bira (GKB, GKBI, GKF, Diamant); ostalo je fiksno iz kataloga.
export const NORMS: Norm[] = [
  { key: 'board', label: 'Gips-kartonska ploča 12,5 mm', sku: 'KNF-001', perM2: { single: 2, double: 4 }, unit: 'm²', pack: 2.5, packName: 'ploča' },
  { key: 'cw', label: 'Zidni profil CW 75', sku: 'PRF-075', perM2: { single: 2, double: 2 }, unit: 'm', pack: 3, packName: 'kom (3 m)' },
  { key: 'uw', label: 'Vodeći profil UW 75', sku: 'PRF-UW75', perM2: { single: 0.7, double: 0.7 }, unit: 'm', pack: 4, packName: 'kom (4 m)' },
  { key: 'wool', label: 'Kamena vuna 50 mm', sku: 'ISO-001', perM2: { single: 1, double: 1 }, unit: 'm²', pack: 0.6, packName: 'ploča', optional: 'wool' },
  { key: 'filler', label: 'Masa za spojeve Uniflott', sku: 'CHM-001', perM2: { single: 0.6, double: 1 }, unit: 'kg', pack: 5, packName: 'vreća 5 kg' },
  { key: 'screws', label: 'Samourezni vijci TN 25', sku: 'ACC-001', perM2: { single: 30, double: 50 }, unit: 'kom', pack: 1000, packName: 'kutija' },
  { key: 'tape', label: 'Bandaž traka za spojeve', sku: 'ACC-003', perM2: { single: 1.6, double: 1.6 }, unit: 'm', pack: 25, packName: 'rolna 25 m' },
]

export type W111Line = {
  key: string
  label: string
  sku: string
  /** potrebno, sa 5% otpada, u jedinici normativa (m², m, kg, kom) */
  need: number
  unit: string
  /** broj pakovanja koja se kupuju */
  packs: number
  packName: string
  /** količina za korpu, u jedinici artikla iz kataloga */
  cartQty: number
}

export function calcW111Area(area: number, cladding: Cladding, plateSku: string, wool: boolean): W111Line[] {
  return NORMS.filter((n) => wool || n.optional !== 'wool').map((n) => {
    const need = area * n.perM2[cladding] * (1 + WASTE)
    const packs = Math.max(1, Math.ceil(need / n.pack - 1e-9))
    // Ploče i vuna se u katalogu prodaju po m² (cijela pakovanja), ostalo po komadu / kutiji / vreći.
    const byArea = n.key === 'board' || n.key === 'wool'
    return {
      key: n.key,
      label: n.label,
      sku: n.key === 'board' ? plateSku : n.sku,
      need,
      unit: n.unit,
      packs,
      packName: n.packName,
      cartQty: byArea ? Math.round(packs * n.pack * 100) / 100 : packs,
    }
  })
}

export const wallThickness = (c: Cladding) => PROFILE_MM + (c === 'double' ? 4 : 2) * BOARD_MM
