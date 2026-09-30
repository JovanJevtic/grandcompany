import UseArt from '@/components/landing/UseArt'
import { box, iso, line, poly, type Proj, type V3 } from '@/components/landing/iso'
import type { UseId } from '@/lib/shop'

export type PostArtKind =
  | 'wall-section' | 'ceiling-grid' | 'facade-layers' | 'attic'
  | 'floor-layers' | 'crane' | 'pallet' | 'calculator'

type Props = { kind: PostArtKind; className?: string; title?: string }
type Part = { sil?: string; edges?: string; detail?: string; open?: boolean }

const O: Proj = { cx: 0, cy: 0, s: 1 }
const USE_BY_KIND: Partial<Record<PostArtKind, UseId>> = {
  'wall-section': 'pregradni-zid',
  'ceiling-grid': 'spusteni-plafon',
  'facade-layers': 'fasada',
  attic: 'potkrovlje',
  'floor-layers': 'podovi',
}

function frame(parts: Part[], pad = 12) {
  const nums = parts
    .flatMap((part) => [part.sil, part.edges, part.detail])
    .join(' ')
    .match(/-?\d+(?:\.\d+)?/g)
    ?.map(Number) ?? [0, 0, 100, 100]
  const xs = nums.filter((_, index) => index % 2 === 0)
  const ys = nums.filter((_, index) => index % 2 === 1)
  const x0 = Math.min(...xs) - pad
  const y0 = Math.min(...ys) - pad
  const x1 = Math.max(...xs) + pad
  const y1 = Math.max(...ys) + pad
  return `${x0} ${y0} ${x1 - x0} ${y1 - y0}`
}

function pallet(): Part[] {
  const parts: Part[] = []
  const base = box(0, 0, 0, 126, 76, 7, O)
  parts.push({ sil: base.sil, edges: base.edges })
  ;[8, 58, 108].forEach((x) => {
    const foot = box(x, 4, -13, 12, 68, 13, O)
    parts.push({ sil: foot.sil, edges: foot.edges })
  })
  for (let index = 0; index < 7; index += 1) {
    const board = box(7, 6, 9 + index * 5, 112, 64, 4, O)
    parts.push({ sil: board.sil, edges: board.edges })
  }
  const straps = [35, 89].map((x) => line([x, 3, 8], [x, 73, 45], O)).join('')
  parts.push({ detail: straps })
  return parts
}

function calculator(): Part[] {
  const wall = box(0, 0, 0, 118, 8, 86, O)
  const dimTop = line([0, -12, 96], [118, -12, 96], O)
  const dimSide = line([-12, -12, 0], [-12, -12, 86], O)
  const ticks = [
    line([0, -16, 92], [0, -8, 100], O),
    line([118, -16, 92], [118, -8, 100], O),
    line([-16, -12, 0], [-8, -12, 0], O),
    line([-16, -12, 86], [-8, -12, 86], O),
  ].join('')
  const items: Part[] = []
  ;[[139, 0, 9, 52], [139, 0, 27, 39], [139, 0, 44, 28], [139, 0, 60, 17]].forEach(([x, y, z, w]) => {
    const item = box(x, y, z, w, 34, 8, O)
    items.push({ sil: item.sil, edges: item.edges })
  })
  return [{ sil: wall.sil, edges: wall.edges }, { detail: dimTop + dimSide + ticks }, ...items]
}

function crane(): Part[] {
  const parts: Part[] = []
  const truck = box(0, 0, 0, 100, 45, 18, O)
  const cab = box(4, 3, 18, 30, 39, 31, O)
  parts.push({ sil: truck.sil, edges: truck.edges }, { sil: cab.sil, edges: cab.edges })
  const pivot: V3 = [65, 22, 22]
  const elbow: V3 = [92, 22, 79]
  const tip: V3 = [151, 22, 111]
  const boom = poly([[61, 18, 20], [69, 18, 20], [97, 18, 76], [91, 18, 82]], O)
  const arm = poly([[91, 18, 76], [97, 18, 82], [155, 18, 115], [149, 18, 108]], O)
  const cable = line(tip, [151, 22, 39], O)
  const hook = poly([[147, 22, 39], [155, 22, 39], [151, 22, 31]], O, false)
  const load = box(125, 2, 3, 53, 41, 25, O)
  const wheels = [22, 79].map((x) => {
    const [cx, cy] = iso([x, 45, 0], O)
    return `M${cx - 9} ${cy}a9 9 0 1 0 18 0a9 9 0 1 0-18 0`
  }).join('')
  parts.push(
    { sil: boom },
    { sil: arm },
    { detail: line(pivot, elbow, O) + line(elbow, tip, O) + cable + hook + wheels },
    { sil: load.sil, edges: load.edges },
  )
  return parts
}

function customArt(kind: PostArtKind) {
  if (kind === 'crane') return crane()
  if (kind === 'pallet') return pallet()
  return calculator()
}

export default function PostArt({ kind, className = '', title }: Props) {
  const use = USE_BY_KIND[kind]
  if (use) return <UseArt use={use} className={`post-art ${className}`} title={title} />

  const parts = customArt(kind)
  return (
    <svg
      viewBox={frame(parts)}
      className={`art post-art ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      strokeLinejoin="miter"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
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
