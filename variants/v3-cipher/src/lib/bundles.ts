// Kompleti (Marijin Bundles iz grand-maison) građeni iz naših sistema zidova (WALL_SYSTEMS).
// Količine računa Knauf W111 norma iz js/core.js (calcW111), prenesena u TypeScript:
// normativ po m² zida, +5 % otpada, zaokruženo na cijela pakovanja.
// Popusta nema (off = 0): komplet nije akcija, nego gotov spisak po normi.

import { WALL_SYSTEMS, type WallSystem } from '@/gc/gc'
import { productById, round2, type Product } from './shop'

export type BomItem = { sku: string; need: string; qty: number; note: string }
export type Bom = { P: number; items: BomItem[] }

type W111Input = {
  L: number
  H: number
  cladding: 'single' | 'double'
  plateSku: string
  cwSku: string
  woolSku: string | null
  fillerSku: string
  soundTape: boolean
}

const f2 = (n: number) => n.toFixed(2).replace('.', ',')
const f0 = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

export function calcW111({ L, H, cladding, plateSku, cwSku, woolSku, fillerSku, soundTape }: W111Input): Bom {
  const P = L * H
  const items: BomItem[] = []

  const plateM2 = P * (cladding === 'double' ? 4.1 : 2.05)
  const boards = Math.ceil(plateM2 / 2.5)
  items.push({ sku: plateSku, need: `${f2(plateM2)} m²`, qty: boards * 2.5, note: `${boards} ploča po 2,5 m²` })

  const cwM = (L / 0.6) * H * 1.05
  const cwPieces = Math.ceil(cwM / 3)
  items.push({ sku: cwSku, need: `${f2(cwM)} m`, qty: cwPieces, note: `${cwPieces} komada po 3 m` })

  const uwM = L * 2 * 1.05
  const uwPieces = Math.ceil(uwM / 4)
  items.push({ sku: 'PRF-UW75', need: `${f2(uwM)} m`, qty: uwPieces, note: `${uwPieces} komada po 4 m` })

  if (woolSku) {
    const woolM2 = P * 1.05
    const panels = Math.ceil(woolM2 / 0.6)
    items.push({ sku: woolSku, need: `${f2(woolM2)} m²`, qty: round2(panels * 0.6), note: `${panels} ploča po 0,6 m²` })
  }

  const fillerKg = P * 0.6
  const bagSize = fillerSku === 'CHM-001' ? 5 : 25
  const bags = Math.ceil(fillerKg / bagSize)
  items.push({ sku: fillerSku, need: `${f2(fillerKg)} kg`, qty: bags, note: `${bags} vreća po ${bagSize} kg` })

  const screws = Math.ceil(P * 25)
  const boxes = Math.ceil(screws / 1000)
  items.push({ sku: 'ACC-001', need: `${f0(screws)} kom`, qty: boxes, note: `${boxes} kutija po 1000 komada` })

  const tapeM = L * 1.5
  const rolls = Math.ceil(tapeM / 25)
  items.push({ sku: 'ACC-003', need: `${f2(tapeM)} m`, qty: rolls, note: `${rolls} rola po 25 m` })

  if (soundTape) {
    const stRolls = Math.ceil(uwM / 30)
    items.push({ sku: 'ACC-005', need: `${f2(uwM)} m`, qty: stRolls, note: `${stRolls} rola po 30 m` })
  }

  return { P, items }
}

/** Zid za koji se komplet računa: 4 m × 2,5 m = 10 m² */
export const WALL = { L: 4, H: 2.5 } as const

export type Bundle = {
  system: WallSystem
  /** null: W111 norma ne važi za ovaj sistem, količine se rade po predmjeru */
  bom: Bom | null
  lines: { p: Product; qty: number; need: string; note: string }[]
  sum: number
  off: 0
}

// W111 norma važi za jednostruku (W111) i dvostruku (W112) oblogu na CW 75. Za W115 (dvije potkonstrukcije)
// i D112 (plafon) ta norma ne važi, pa prikazujemo samo sastav sistema, bez izmišljenih količina.
function bomFor(s: WallSystem): Bom | null {
  if (s.code !== 'W111' && s.code !== 'W112') return null
  const has = (sku: string) => s.skus.includes(sku)
  return calcW111({
    ...WALL,
    cladding: s.code === 'W112' ? 'double' : 'single',
    plateSku: s.skus.find((k) => k.startsWith('KNF')) ?? 'KNF-001',
    cwSku: s.skus.find((k) => k.startsWith('PRF-0') || k.startsWith('PRF-1')) ?? 'PRF-075',
    woolSku: has('ISO-001') ? 'ISO-001' : null,
    fillerSku: has('CHM-001') ? 'CHM-001' : 'CHM-002',
    soundTape: false,
  })
}

export const BUNDLES: Bundle[] = WALL_SYSTEMS.map((system) => {
  const bom = bomFor(system)
  const lines = bom
    ? bom.items.flatMap((it) => {
        const p = productById(it.sku)
        return p ? [{ p, qty: it.qty, need: it.need, note: it.note }] : []
      })
    : system.skus.flatMap((sku) => {
        const p = productById(sku)
        return p ? [{ p, qty: 0, need: '', note: '' }] : []
      })
  const sum = round2(lines.reduce((s, l) => s + l.p.price * l.qty, 0))
  return { system, bom, lines, sum, off: 0 }
})
