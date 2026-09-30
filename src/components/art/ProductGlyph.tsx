import { box, iso, line, poly, prism, type Proj, type V3 } from '@/components/landing/iso'
import type { Product } from '@/lib/shop'

export type GlyphKind =
  | 'board' | 'stud' | 'track' | 'ceiling' | 'slab' | 'roll'
  | 'eps' | 'bag' | 'pail' | 'screws' | 'tape' | 'hanger'

type Part = { sil?: string; edges?: string; detail?: string; open?: boolean }
type Props = { product: Product; kind?: GlyphKind; className?: string; title?: string }

const O: Proj = { cx: 0, cy: 0, s: 1 }

export function glyphKind(product: Product): GlyphKind {
  if (product.sku.startsWith('KNF-')) return 'board'
  if (/PRF-(050|075|100)/.test(product.sku)) return 'stud'
  if (/PRF-(UW75|UD28)/.test(product.sku)) return 'track'
  if (product.sku === 'PRF-CD60') return 'ceiling'
  if (/ISO-00[12]/.test(product.sku)) return 'slab'
  if (product.sku === 'ISO-003') return 'roll'
  if (/ISO-00[4-7]/.test(product.sku)) return 'eps'
  if (product.sku.startsWith('CHM-')) return 'bag'
  if (/ACC-00[12]/.test(product.sku)) return 'screws'
  if (/ACC-00[3-5]/.test(product.sku)) return 'tape'
  return 'hanger'
}

function pathBounds(parts: Part[], pad = 8) {
  const values = parts
    .flatMap((part) => [part.sil, part.edges, part.detail])
    .join(' ')
    .match(/-?\d+(?:\.\d+)?/g)
    ?.map(Number) ?? [0, 0, 100, 100]
  const xs = values.filter((_, index) => index % 2 === 0)
  const ys = values.filter((_, index) => index % 2 === 1)
  const x0 = Math.min(...xs) - pad
  const y0 = Math.min(...ys) - pad
  const x1 = Math.max(...xs) + pad
  const y1 = Math.max(...ys) + pad
  return `${x0} ${y0} ${x1 - x0} ${y1 - y0}`
}

function boardArt(product: Product): Part[] {
  const parts: Part[] = []
  const thick = product.sku === 'KNF-004' ? 5 : 4
  for (let layer = 0; layer < 4; layer += 1) {
    const item = box(0, layer * 2, layer * 5, 116, 72, thick, O)
    parts.push({ sil: item.sil, edges: item.edges })
  }
  const z = thick * 4
  const face = poly([[0, 6, z], [116, 6, z], [116, 67, z], [0, 67, z]], O)
  const edge = [18, 98]
    .map((x) => line([x, 72, 0], [x + (x < 30 ? 5 : -5), 72, z], O))
    .join('')
  let cue = line([12, 16, z], [104, 16, z], O)
  const [x, y] = iso([58, 38, z], O)
  if (product.sku === 'KNF-002') {
    cue += `M${x} ${y - 13}C${x - 11} ${y} ${x - 9} ${y + 11} ${x} ${y + 11}C${x + 9} ${y + 11} ${x + 11} ${y} ${x} ${y - 13}Z`
  } else if (product.sku === 'KNF-003') {
    cue += `M${x} ${y + 12}C${x - 13} ${y + 4} ${x - 4} ${y - 4} ${x - 7} ${y - 15}C${x + 9} ${y - 7} ${x + 13} ${y + 4} ${x} ${y + 12}Z`
  } else if (product.sku === 'KNF-004') {
    cue += `M${x} ${y - 14}L${x + 14} ${y}L${x} ${y + 14}L${x - 14} ${y}Z`
  }
  parts.push({ sil: face, edges: edge, detail: cue, open: true })
  return parts
}

function profileShape(width: number, height: number, lips: boolean): [number, number][] {
  const t = 3
  if (!lips) {
    return [[0, 0], [width, 0], [width, height], [width - t, height], [width - t, t], [t, t], [t, height], [0, height]]
  }
  const lip = Math.max(7, width * 0.12)
  return [
    [0, 0], [width, 0], [width, lip], [width - t, lip], [width - t, t],
    [t, t], [t, height - t], [width - t, height - t], [width - t, height - lip],
    [width, height - lip], [width, height], [0, height],
  ]
}

function profileArt(product: Product, kind: GlyphKind): Part[] {
  const width = product.sku === 'PRF-050' ? 46
    : product.sku === 'PRF-100' ? 78
      : product.sku === 'PRF-UD28' ? 30 : 60
  const height = kind === 'ceiling' ? 26 : product.sku === 'PRF-UD28' ? 22 : 38
  const lips = kind === 'stud' || kind === 'ceiling'
  const parts: Part[] = []
  ;[0, 12, 24].forEach((offset, index) => {
    const o = { ...O, cx: offset * 0.7, cy: offset * 0.9 }
    const p = prism(profileShape(width, height, lips), index * 2, 115, o)
    const detail = kind === 'ceiling'
      ? [width * 0.32, width * 0.68].map((x) => line([x, index * 2, 5], [x, 115 + index * 2, 5], o)).join('')
      : ''
    parts.push({ sil: p.back }, { edges: p.links, detail }, { sil: p.front })
  })
  return parts
}

function slabArt(product: Product): Part[] {
  const thick = product.sku === 'ISO-002' ? 24 : 13
  const parts: Part[] = []
  for (let layer = 0; layer < 3; layer += 1) {
    const slab = box(0, layer * 3, layer * thick, 100, 67, thick, O)
    const fibres = Array.from({ length: 13 }, (_, index) => {
      const x = 8 + (index % 7) * 13
      const y = 8 + Math.floor(index / 7) * 25
      return poly([[x, y, (layer + 1) * thick], [x + 5, y + 4, (layer + 1) * thick + 2], [x + 10, y, (layer + 1) * thick]], O, false)
    }).join('')
    parts.push({ sil: slab.sil, edges: slab.edges, detail: fibres })
  }
  return parts
}

// Rolna leži duž ose y: krajevi su kružnice u ravni x–z, projektovane kroz isti iso kao sve ostalo
// (tačke, ne SVG luk — tako je elipsa tačno nagnuta i okvir crteža se računa iz koordinata).
function rollArt(): Part[] {
  const R = 30
  const L = 92
  const ring = (y: number, r = R, turns = 1, from = 0): V3[] =>
    Array.from({ length: 49 }, (_, i) => {
      const t = from + (i / 48) * Math.PI * 2 * turns
      return [R + Math.cos(t) * r, y, R + Math.sin(t) * r]
    })
  // obris valjka: konveksni omotač obje krajnje elipse
  const pts = [...ring(0), ...ring(L)].map((p) => iso(p, O))
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const half = (list: [number, number][]) => {
    const out: [number, number][] = []
    for (const p of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop()
      out.push(p)
    }
    return out.slice(0, -1)
  }
  const hull = [...half(pts), ...half([...pts].reverse())]
  const body = `M${hull.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`
  // spirala namotaja na prednjem kraju
  const spiral: V3[] = Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * Math.PI * 2 * 3.2
    const r = R * (0.12 + 0.85 * (i / 120))
    return [R + Math.cos(t) * r, L, R + Math.sin(t) * r]
  })
  // odmotani dio koji leži na podu
  const tail = poly([[R, 6, 0], [2 * R + 56, 6, 0], [2 * R + 56, L - 6, 0], [R, L - 6, 0]], O)
  return [
    { sil: tail, edges: line([2 * R + 44, 6, 0], [2 * R + 44, L - 6, 0], O) },
    { sil: body },
    { sil: poly(ring(L), O), detail: poly(spiral, O, false) },
  ]
}

function epsArt(product: Product): Part[] {
  const parts: Part[] = []
  const dense = product.sku === 'ISO-006'
  const xps = product.sku === 'ISO-007'
  for (let layer = 0; layer < 3; layer += 1) {
    const block = box(0, layer * 3, layer * 13, 104, 65, 13, O)
    let detail = ''
    for (let index = 0; index < (dense ? 24 : 13); index += 1) {
      const [x, y] = iso([8 + (index * 17) % 88, 8 + (index * 29) % 48, (layer + 1) * 13], O)
      detail += `M${x - 1.2} ${y}a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0`
    }
    if (xps) detail += poly([[0, 4, layer * 13], [9, 4, layer * 13], [9, 61, layer * 13], [104, 61, layer * 13]], O, false)
    parts.push({ sil: block.sil, edges: block.edges, detail })
  }
  return parts
}

function bagArt(product: Product): Part[] {
  const small = product.sku === 'CHM-001'
  const width = small ? 58 : 76
  const height = small ? 80 : 108
  const depth = small ? 21 : 28
  const shape: [number, number][] = [
    [5, 0], [width - 5, 0], [width, 10], [width - 3, height - 8],
    [width - 13, height], [9, height], [0, height - 11], [2, 12],
  ]
  const p = prism(shape, 0, depth, O)
  const band = poly([
    [5, depth, height * 0.43], [width - 4, depth, height * 0.43],
    [width - 4, depth, height * 0.66], [4, depth, height * 0.66],
  ], O)
  const valve = poly([
    [width - 23, depth, height], [width - 9, depth, height],
    [width - 2, depth, height - 9], [width - 19, depth, height - 7],
  ], O)
  return [{ sil: p.back }, { edges: p.links }, { sil: p.front, edges: valve, detail: band }]
}

function screwsArt(): Part[] {
  const base = box(0, 0, 0, 76, 54, 25, O)
  const lid = box(0, 0, 25, 76, 7, 42, O)
  let heads = ''
  for (let x = 12; x < 70; x += 14) {
    for (let y = 13; y < 49; y += 13) {
      const [cx, cy] = iso([x, y, 26], O)
      heads += `M${cx - 3} ${cy}h6M${cx} ${cy - 3}v6`
    }
  }
  const loose = line([90, 15, 5], [116, 42, 22], O) + line([88, 13, 7], [94, 19, 1], O)
  return [{ sil: lid.sil, edges: lid.edges }, { sil: base.sil, edges: base.edges }, { detail: heads + loose }]
}

function tapeArt(product: Product): Part[] {
  const [bx, by] = iso([0, 0, 28], O)
  const [fx, fy] = iso([0, 28, 28], O)
  const back = `M${bx - 31} ${by}a31 21 0 1 0 62 0a31 21 0 1 0-62 0`
  const front = `M${fx - 31} ${fy}a31 21 0 1 0 62 0a31 21 0 1 0-62 0`
  const inner = `M${fx - 13} ${fy}a13 9 0 1 0 26 0a13 9 0 1 0-26 0`
  const end = poly([[18, 28, 16], [88, 28, 16], [88, 28, 4], [18, 28, 4]], O)
  let detail = ''
  if (product.sku === 'ACC-003') {
    for (let x = 28; x < 86; x += 9) detail += line([x, 28, 4], [x, 28, 16], O)
    for (let z = 6; z < 16; z += 4) detail += line([18, 28, z], [88, 28, z], O)
  }
  return [{ sil: back }, { edges: front + inner }, { sil: end, detail }]
}

function hangerArt(): Part[] {
  const strip = prism([[0, 0], [18, 0], [18, 72], [0, 72]], 0, 5, O)
  const left = prism([[0, 0], [12, 0], [12, 48], [0, 48]], 5, 26, { ...O, cx: -26, cy: 20 })
  const right = prism([[0, 0], [12, 0], [12, 48], [0, 48]], 5, 26, { ...O, cx: 26, cy: 20 })
  const slots = [15, 35, 55].map((z) => {
    const [x, y] = iso([9, 5, z], O)
    return `M${x} ${y - 5}a3 5 0 1 0 0 10a3 5 0 1 0 0-10`
  }).join('')
  return [
    { sil: left.back, edges: left.links + left.front },
    { sil: right.back, edges: right.links + right.front },
    { sil: strip.back, edges: strip.links + strip.front, detail: slots },
  ]
}

function drawing(product: Product, kind: GlyphKind) {
  if (kind === 'board') return boardArt(product)
  if (kind === 'stud' || kind === 'track' || kind === 'ceiling') return profileArt(product, kind)
  if (kind === 'slab') return slabArt(product)
  if (kind === 'roll') return rollArt()
  if (kind === 'eps') return epsArt(product)
  if (kind === 'bag' || kind === 'pail') return bagArt(product)
  if (kind === 'screws') return screwsArt()
  if (kind === 'tape') return tapeArt(product)
  return hangerArt()
}

export default function ProductGlyph({ product, kind = glyphKind(product), className = '', title }: Props) {
  const parts = drawing(product, kind)
  const label = title ?? `${product.name} — linijski crtež`
  return (
    <svg
      viewBox={pathBounds(parts)}
      className={`art product-glyph ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      strokeLinejoin="miter"
      vectorEffect="non-scaling-stroke"
      role={title ? 'img' : undefined}
      aria-label={title ? label : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{label}</title>}
      {parts.map((part, index) => (
        <g key={index}>
          {part.sil && <path d={part.sil} data-d={0} fill={part.open ? 'none' : 'var(--art-fill, var(--well))'} />}
          {part.edges && <path d={part.edges} data-d={1} />}
          {part.detail && <path d={part.detail} data-d={2} />}
        </g>
      ))}
    </svg>
  )
}
