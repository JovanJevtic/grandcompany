import type { UseId } from '@/lib/shop'
import { axisShift, box, line, poly, prism, type Proj, type V3 } from './iso'

// Pet tehničkih crteža, po jedan za svaku vrstu radova: rastavljeni presjek sistema u izometriji.
// Svaki crtež je niz slojeva (`data-layer`), od najdaljeg ka najbližem; skrol ih razmiče duž
// ose `axis` (vidi UsesSplit). Siluete su popunjene bojom podloge (--art-fill) pa bliži sloj
// zaklanja dalji; linije se iscrtavaju u tri koraka (data-d 0/1/2: obris, ivice, detalji).
// Gornje ivice obloga su stepenaste, kao stepenaste trake na sajtu.

type Part = { sil?: string; edges?: string; detail?: string; open?: boolean }
type Layer = { parts: Part[] }
export type Drawing = { axis: 'x' | 'y' | 'z'; gap: number; layers: Layer[] }

const zigzag = (pts: V3[], o: Proj) => poly(pts, o, false)

// ——— Pregradni zid: obloga, UW/CW konstrukcija, vuna, obloga (sa stepenastim izrezom) ———
function wall(): Drawing {
  const o = { cx: 238, cy: 186, s: 1 }
  const L = 180
  const H = 150
  const studs = [0, 44, 88, 132, 176]
  const board = (x: number, segs: [number, number, number][]): Part[] =>
    segs.map(([y0, y1, h]) => {
      const b = box(x, y0, 0, 3, y1 - y0, h, o)
      // vijci uz svaki profil: kratke crtice na licu ploče
      const screws = studs
        .filter((s) => s + 2 > y0 && s + 2 < y1)
        .flatMap((s) => [24, 64, 104, 144].filter((z) => z < h - 6).map((z) => line([x + 3, s + 2, z], [x + 3, s + 2, z + 3], o)))
        .join('')
      return { sil: b.sil, edges: b.edges, detail: screws }
    })
  const frame: Part[] = []
  const uwB = box(0, 0, 0, 20, L, 4, o)
  frame.push({ sil: uwB.sil, edges: uwB.edges })
  studs.forEach((y) => {
    const s = box(0, y, 4, 20, 4, H - 8, o)
    // otvori za instalacije u CW profilu
    const holes = [40, 90].map((z) => poly([[20, y + 1, z], [20, y + 3, z], [20, y + 3, z + 10], [20, y + 1, z + 10]], o)).join('')
    frame.push({ sil: s.sil, edges: s.edges, detail: holes })
  })
  const uwT = box(0, 0, H - 4, 20, L, 4, o)
  frame.push({ sil: uwT.sil, edges: uwT.edges })

  const wool: Part[] = [44, 88, 132].map((y0) => {
    const b = box(3, y0 + 5, 6, 15, 38, H - 14, o)
    const pts: V3[] = []
    for (let z = 10, i = 0; z < H - 10; z += 9, i++) pts.push([18, i % 2 ? y0 + 40 : y0 + 8, z])
    return { sil: b.sil, edges: b.edges, detail: zigzag(pts, o) }
  })

  return {
    axis: 'x',
    gap: 26,
    layers: [
      { parts: board(-8, [[0, 60, H], [60, 120, H], [120, L, H]]) },
      { parts: frame },
      { parts: wool },
      { parts: board(26, [[60, 90, 70], [90, 120, 100], [120, 150, 128], [150, L, H]]) },
    ],
  }
}

// ——— Spušteni plafon: ploča (obris), ovjesi, CD nosivi i poprečni, gips ploče (stepenasto) ———
function ceiling(): Drawing {
  const o = { cx: 200, cy: 150, s: 1 }
  const W = 170
  const D = 130
  const slab: Part = { sil: box(0, 0, 70, W, D, 10, o).sil, open: true, edges: box(0, 0, 70, W, D, 10, o).edges }
  const hangers = [20, 75, 130].flatMap((x) => [15, 65, 115].map((y) => line([x + 3, y, 24], [x + 3, y, 70], o))).join('')
  const boards: Part[] = [
    [0, 50, 130],
    [50, 100, 104],
    [100, 150, 78],
    [150, W, 52],
  ].map(([x0, x1, d]) => {
    const b = box(x0, 0, 0, x1 - x0, d, 3, o)
    return { sil: b.sil, edges: b.edges }
  })
  const secondary: Part[] = [8, 48, 88].map((y) => {
    const b = box(0, y, 6, W, 6, 5, o)
    return { sil: b.sil, edges: b.edges }
  })
  const primary: Part[] = [20, 75, 130].map((x) => {
    const b = box(x, 0, 14, 6, D, 5, o)
    // rebra na CD profilu
    const ribs = [20, 45, 70, 95, 120].map((y) => line([x, y, 19], [x + 6, y, 19], o)).join('')
    return { sil: b.sil, edges: b.edges, detail: ribs }
  })
  return {
    axis: 'z',
    gap: 22,
    layers: [{ parts: [slab, { detail: hangers }] }, { parts: primary }, { parts: secondary }, { parts: boards }].reverse(),
  }
}

// ——— Fasada i demit: zid od opeke, ljepilo, stiropor (stepenasto), mrežica, završni sloj ———
function facade(): Drawing {
  const o = { cx: 236, cy: 188, s: 1 }
  const L = 170
  const H = 150
  const wallB = box(0, 0, 0, 24, L, H, o)
  const courses = Array.from({ length: 14 }, (_, i) => line([24, 0, (i + 1) * 10], [24, L, (i + 1) * 10], o)).join('')
  const dabs: Part[] = [30, 90, 150].flatMap((y) =>
    [30, 80, 125].map((z) => {
      const b = box(24, y - 6, z - 5, 4, 12, 10, o)
      return { sil: b.sil, edges: b.edges }
    }),
  )
  const eps: Part[] = []
  ;[
    [0, 60, 150],
    [60, 120, 110],
    [120, L, 70],
  ].forEach(([y0, y1, h]) => {
    for (let z = 0; z < h; z += 50) {
      const b = box(30, y0, z, 12, y1 - y0, Math.min(50, h - z), o)
      eps.push({ sil: b.sil, edges: b.edges })
    }
  })
  const meshBox = box(46, 60, 0, 1, 110, 100, o)
  const mesh: string[] = []
  for (let t = 0; t <= 200; t += 14) {
    const a: V3 = [47, 60 + Math.min(t, 110), Math.max(0, t - 110)]
    const b: V3 = [47, 60 + Math.max(0, t - 100), Math.min(t, 100)]
    mesh.push(line(a, b, o))
  }
  const render = box(50, 120, 0, 2, 50, 56, o)
  return {
    axis: 'x',
    gap: 22,
    layers: [
      { parts: [{ sil: wallB.sil, edges: wallB.edges, detail: courses }] },
      { parts: dabs },
      { parts: eps },
      { parts: [{ sil: meshBox.sil, edges: meshBox.edges, detail: mesh.join('') }] },
      { parts: [{ sil: render.sil, edges: render.edges }] },
    ],
  }
}

// ——— Potkrovlje: presjek krova izvučen u dubinu, kriške razmaknute: krov, vuna, CD, obloga ———
function attic(): Drawing {
  const o = { cx: 150, cy: 150, s: 1 }
  const D = 132
  // Rogovi: pet A-okvira u nizu, sa nazidnicom (grednom podlogom) ispod.
  const plate = box(0, 0, -8, 14, D, 8, o)
  const plate2 = box(166, 0, -8, 14, D, 8, o)
  const frame: [number, number][] = [[0, 0], [90, 110], [180, 0], [166, 0], [90, 93], [14, 0]]
  const trusses: Part[] = [{ sil: plate.sil, edges: plate.edges }, { sil: plate2.sil, edges: plate2.edges }]
  ;[0, 31, 62, 93, 124].forEach((y) => {
    const p = prism(frame, y, 8, o)
    trusses.push({ sil: p.back }, { detail: p.links }, { sil: p.front })
  })
  // Vuna uz lijevu kosinu (ispod rogova), pa obloga od ploča sa spojevima.
  const slope = (t: number, inset: number): [number, number] => [14 + inset * 1.2 + t * (76 - inset * 1.2), t * (93 - inset)]
  const band = (a: number, b: number) => [slope(0, a), slope(1, a), slope(1, b), slope(0, b)]
  const wool = prism(band(0, 12), 0, D, o)
  const fibres = [0.2, 0.4, 0.6, 0.8]
    .map((t) => {
      const [x, z] = slope(t, 6)
      return line([x, 0, z], [x, D, z], o)
    })
    .join('')
  const boards = prism(band(13, 17), 0, D, o)
  const seams = [44, 88]
    .map((y) => {
      const [xa, za] = slope(0, 17)
      const [xb, zb] = slope(1, 17)
      return line([xa, y, za], [xb, y, zb], o)
    })
    .join('')
  return {
    axis: 'x',
    gap: 22,
    layers: [
      { parts: trusses },
      { parts: [{ sil: wool.back }, { detail: wool.links }, { sil: wool.front, detail: fibres }] },
      { parts: [{ sil: boards.back }, { detail: boards.links }, { sil: boards.front, detail: seams }] },
    ],
  }
}

// ——— Podovi: slojevi naslagani uvis, svaki kraći od prethodnog (stepenice) ———
function floors(): Drawing {
  const o = { cx: 214, cy: 176, s: 1 }
  const D = 120
  const stack: { h: number; len: number; cells?: number; ridges?: boolean }[] = [
    { h: 16, len: 180 }, // AB ploča
    { h: 10, len: 156, cells: 3 }, // XPS
    { h: 10, len: 132, cells: 3 }, // EPS 100
    { h: 1, len: 110 }, // PE folija
    { h: 14, len: 92 }, // cementni estrih
    { h: 2, len: 72, ridges: true }, // ljepilo za keramiku
    { h: 3, len: 52, cells: 2 }, // pločice
  ]
  let z = 0
  const layers: Layer[] = stack.map((s) => {
    const b = box(0, 0, z, s.len, D, s.h, o)
    let detail = ''
    const top = z + s.h
    if (s.cells) {
      const cw = D / s.cells
      detail += Array.from({ length: s.cells - 1 }, (_, i) => line([0, (i + 1) * cw, top], [s.len, (i + 1) * cw, top], o)).join('')
      const step = s.len / Math.max(2, Math.round(s.len / cw))
      for (let x = step; x < s.len - 1; x += step) detail += line([x, 0, top], [x, D, top], o)
    }
    if (s.ridges) for (let y = 8; y < D; y += 10) detail += line([0, y, top], [s.len, y, top], o)
    z += s.h
    return { parts: [{ sil: b.sil, edges: b.edges, detail }] }
  })
  return { axis: 'z', gap: 12, layers }
}

export const DRAWINGS: Record<UseId, () => Drawing> = {
  'pregradni-zid': wall,
  'spusteni-plafon': ceiling,
  fasada: facade,
  potkrovlje: attic,
  podovi: floors,
}

// Okvir crteža se računa iz samih linija (sve koordinate iz path-ova) plus najveći pomak slojeva
// kad se razmaknu — crtež uvijek popuni prostor i ne izađe iz okvira, bez ručnog štelovanja.
function frame(d: Drawing, pad = 8) {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  d.layers.forEach((layer, k) => {
    const shift = axisShift(d.axis, k * d.gap)
    layer.parts.forEach((p) => {
      const nums = [p.sil, p.edges, p.detail].join(' ').match(/-?\d+(\.\d+)?/g) ?? []
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const x = Number(nums[i])
        const y = Number(nums[i + 1])
        for (const [dx, dy] of [[0, 0], [shift.x, shift.y]]) {
          x0 = Math.min(x0, x + dx)
          x1 = Math.max(x1, x + dx)
          y0 = Math.min(y0, y + dy)
          y1 = Math.max(y1, y + dy)
        }
      }
    })
  })
  return `${Math.floor(x0 - pad)} ${Math.floor(y0 - pad)} ${Math.ceil(x1 - x0 + 2 * pad)} ${Math.ceil(y1 - y0 + 2 * pad)}`
}

export default function UseArt({ use, className = '', title }: { use: UseId; className?: string; title?: string }) {
  const d = DRAWINGS[use]()
  return (
    <svg
      viewBox={frame(d)}
      className={`art ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      strokeLinejoin="miter"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      data-axis={d.axis}
      data-gap={d.gap}
    >
      {title && <title>{title}</title>}
      {d.layers.map((layer, k) => (
        <g key={k} data-layer={k}>
          {layer.parts.map((p, i) => (
            <g key={i}>
              {p.sil && <path d={p.sil} data-d={0} fill={p.open ? 'none' : 'var(--art-fill)'} />}
              {p.edges && <path d={p.edges} data-d={1} />}
              {p.detail && <path d={p.detail} data-d={2} opacity={0.7} />}
            </g>
          ))}
        </g>
      ))}
    </svg>
  )
}
