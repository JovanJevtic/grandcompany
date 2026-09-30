// Izometrijska projekcija za outline crteže. Radimo u "milimetrima" crteža: x ide desno-dolje,
// y lijevo-dolje, z gore. Kutija se crta kao silueta (popunjena bojom podloge, pa zaklanja ono iza
// sebe) plus tri unutrašnje ivice. Redoslijed crtanja je redoslijed dubine: prvo daleko, pa blizu.

export type V3 = [number, number, number]

const C = Math.cos(Math.PI / 6)
const S = Math.sin(Math.PI / 6)

export type Proj = { cx: number; cy: number; s: number }

export const iso = ([x, y, z]: V3, o: Proj): [number, number] => [
  o.cx + (x - y) * C * o.s,
  o.cy + (x + y) * S * o.s - z * o.s,
]

const f = (n: number) => Math.round(n * 10) / 10

export function poly(pts: V3[], o: Proj, close = true) {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${iso(p, o).map(f).join(' ')}`).join('')
  return close ? `${d}Z` : d
}

export const line = (a: V3, b: V3, o: Proj) => poly([a, b], o, false)

// Pomjeraj u ekranu za pomak duž ose (za "razmicanje" slojeva na skrol).
export const axisShift = (axis: 'x' | 'y' | 'z', d: number, s = 1): { x: number; y: number } =>
  axis === 'x' ? { x: d * C * s, y: d * S * s } : axis === 'y' ? { x: -d * C * s, y: d * S * s } : { x: 0, y: -d * s }

// Kutija: `sil` je silueta (šestougao), `edges` tri vidljive unutrašnje ivice.
export function box(x: number, y: number, z: number, w: number, d: number, h: number, o: Proj) {
  const X = x + w
  const Y = y + d
  const Z = z + h
  return {
    sil: poly(
      [
        [x, y, Z],
        [X, y, Z],
        [X, y, z],
        [X, Y, z],
        [x, Y, z],
        [x, Y, Z],
      ],
      o,
    ),
    edges: [line([X, Y, Z], [X, y, Z], o), line([X, Y, Z], [x, Y, Z], o), line([X, Y, Z], [X, Y, z], o)].join(''),
  }
}

// Prizma: 2D poligon u ravni x–z, izvučen duž y (od y0 do y0 + depth).
// Crta se zadnje lice, spojnice uglova i prednje lice (popunjeno, zaklanja spojnice iza sebe).
export function prism(shape: [number, number][], y0: number, depth: number, o: Proj) {
  const back = shape.map(([x, z]) => [x, y0, z] as V3)
  const front = shape.map(([x, z]) => [x, y0 + depth, z] as V3)
  return {
    back: poly(back, o),
    links: back.map((b, i) => line(b, front[i], o)).join(''),
    front: poly(front, o),
  }
}
