// Crteži za građevinski kalkulator (pogled spreda / odozdo, u razmjeri). Okvir 1000×470.
// Razmjera prati unesene mjere (uz minimum), pa crtež uvijek popuni kadar, a vidi se odnos stranica.

const VW = 1000
const VH = 470
const PAD = 64
const T = 'fill 0.7s cubic-bezier(0.25,1,0.5,1)'

export const PLATE_COLORS: Record<string, { color: string; ink: string }> = {
  'KNF-001': { color: '#ece6da', ink: '#b9ae9b' },
  'KNF-002': { color: '#a9c2a0', ink: '#7f9b77' },
  'KNF-003': { color: '#e2a49c', ink: '#bf7c73' },
  'KNF-004': { color: '#a8bfdc', ink: '#7c97ba' },
}

function Dims({ x0, y0, w, h }: { x0: number; y0: number; w: number; h: number }) {
  return (
    <g stroke="var(--ink)" strokeOpacity={0.5}>
      <line x1={x0} y1={y0 + h + 26} x2={x0 + w} y2={y0 + h + 26} />
      <line x1={x0} y1={y0 + h + 18} x2={x0} y2={y0 + h + 34} />
      <line x1={x0 + w} y1={y0 + h + 18} x2={x0 + w} y2={y0 + h + 34} />
      <line x1={x0 - 26} y1={y0} x2={x0 - 26} y2={y0 + h} />
      <line x1={x0 - 34} y1={y0} x2={x0 - 18} y2={y0} />
      <line x1={x0 - 34} y1={y0 + h} x2={x0 - 18} y2={y0 + h} />
    </g>
  )
}

// ——— W111: zid sa presjekom (desna trećina pokazuje CW profile i vunu) ———
export function WallVisual({ L, H, plate, wool, double }: { L: number; H: number; plate: string; wool: boolean; double: boolean }) {
  const { color, ink } = PLATE_COLORS[plate] ?? PLATE_COLORS['KNF-001']
  const scale = Math.min((VW - 2 * PAD) / Math.max(L, 5), (VH - 2 * PAD) / Math.max(H, 3))
  const w = L * scale
  const h = H * scale
  const x0 = (VW - w) / 2
  const y0 = VH - PAD - h
  const cutW = Math.min(w, Math.max(w / 3, 1.25 * scale))
  const cutX = x0 + w - cutW
  const studs: number[] = []
  for (let x = 0; x <= L + 1e-6; x += 0.625) studs.push(x0 + x * scale)
  const seams: number[] = []
  for (let x = 1.25; x < L - 0.05; x += 1.25) seams.push(x0 + x * scale)
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full" aria-hidden>
      <line x1={0} y1={VH - PAD} x2={VW} y2={VH - PAD} stroke="var(--ink)" strokeOpacity={0.25} />
      <rect x={x0} y={y0} width={Math.max(0, w - cutW)} height={h} style={{ fill: color, transition: T }} />
      {seams
        .filter((x) => x < cutX - 1)
        .map((x) => (
          <line key={x} x1={x} y1={y0} x2={x} y2={y0 + h} style={{ stroke: ink }} strokeWidth={1.2} />
        ))}
      {/* dvostruka obloga: drugi red spojeva pomaknut za pola ploče */}
      {double &&
        seams
          .map((x) => x - 0.625 * scale)
          .filter((x) => x > x0 + 2 && x < cutX - 1)
          .map((x) => <line key={`d${x}`} x1={x} y1={y0} x2={x} y2={y0 + h} style={{ stroke: ink }} strokeWidth={1} strokeDasharray="6 6" />)}
      <rect x={cutX} y={y0} width={cutW} height={h} fill="#e9e4dc" />
      {wool &&
        studs
          .filter((x) => x >= cutX - 1 && x < x0 + w - 2)
          .map((x, i) => {
            const nx = Math.min(x + 0.625 * scale, x0 + w)
            return <rect key={`w${i}`} x={x + 3} y={y0 + 6} width={Math.max(0, nx - x - 6)} height={Math.max(0, h - 12)} fill="#c9a25e" opacity={0.85} />
          })}
      {studs
        .filter((x) => x >= cutX - 1)
        .map((x, i) => (
          <rect key={`s${i}`} x={x - 3} y={y0} width={6} height={h} fill="#b7bcc2" />
        ))}
      <rect x={x0} y={y0 - 4} width={w} height={6} fill="#9aa1a8" />
      <rect x={x0} y={y0 + h - 2} width={w} height={6} fill="#9aa1a8" />
      <line x1={cutX} y1={y0} x2={cutX} y2={y0 + h} stroke="var(--ink)" strokeWidth={1.5} />
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="var(--ink)" strokeOpacity={0.55} />
      <Dims x0={x0} y0={y0} w={w} h={h} />
    </svg>
  )
}

// ——— D112: plafon gledan odozdo — ploče, a u desnoj trećini mreža CD profila sa ovjesima ———
export function CeilingVisual({ L, W, plate }: { L: number; W: number; plate: string }) {
  const { color, ink } = PLATE_COLORS[plate] ?? PLATE_COLORS['KNF-001']
  const scale = Math.min((VW - 2 * PAD) / Math.max(L, 5), (VH - 2 * PAD) / Math.max(W, 3))
  const w = L * scale
  const h = W * scale
  const x0 = (VW - w) / 2
  const y0 = (VH - h) / 2 - 10
  const cutW = Math.min(w, Math.max(w / 3, 1.25 * scale))
  const cutX = x0 + w - cutW
  // ploče 2 × 1,25 m položene poprijeko, spojevi smaknuti
  const seamsX: number[] = []
  for (let x = 2; x < L - 0.05; x += 2) seamsX.push(x0 + x * scale)
  const seamsY: number[] = []
  for (let y = 1.25; y < W - 0.05; y += 1.25) seamsY.push(y0 + y * scale)
  // nosivi CD na 1 m, montažni CD na 0,5 m
  const carry: number[] = []
  for (let y = 0.5; y < W; y += 1) carry.push(y0 + y * scale)
  const mount: number[] = []
  for (let x = cutX - x0 + 0.25 * scale; x < w; x += 0.5 * scale) mount.push(x0 + x)
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full" aria-hidden>
      <rect x={x0} y={y0} width={Math.max(0, w - cutW)} height={h} style={{ fill: color, transition: T }} />
      {seamsX
        .filter((x) => x < cutX - 1)
        .map((x) => (
          <line key={x} x1={x} y1={y0} x2={x} y2={y0 + h} style={{ stroke: ink }} strokeWidth={1.2} />
        ))}
      {seamsY.map((y) => (
        <line key={y} x1={x0} y1={y} x2={cutX} y2={y} style={{ stroke: ink }} strokeWidth={1.2} />
      ))}
      <rect x={cutX} y={y0} width={cutW} height={h} fill="#e9e4dc" />
      {carry.map((y) => (
        <rect key={`c${y}`} x={cutX} y={y - 3} width={cutW} height={6} fill="#9aa1a8" />
      ))}
      {mount.map((x) => (
        <rect key={`m${x}`} x={x - 2.5} y={y0} width={5} height={h} fill="#b7bcc2" />
      ))}
      {carry.flatMap((y) =>
        mount
          .filter((_, i) => i % 2 === 0)
          .map((x) => <circle key={`h${x}-${y}`} cx={x} cy={y} r={4} fill="var(--ink)" />),
      )}
      {/* UD obodni profil */}
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="#9aa1a8" strokeWidth={6} />
      <line x1={cutX} y1={y0} x2={cutX} y2={y0 + h} stroke="var(--ink)" strokeWidth={1.5} />
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="var(--ink)" strokeOpacity={0.55} />
      <Dims x0={x0} y0={y0} w={w} h={h} />
    </svg>
  )
}

// ——— DEMIT: fasada sa pločama stiropora (1000 × 500 mm, smaknute) i slojem armiranja desno ———
export function FacadeVisual({ L, H, eps }: { L: number; H: number; eps: string }) {
  const board = eps === 'ISO-006' ? { color: '#8e9297', ink: '#6c7076' } : { color: '#f4f2ee', ink: '#c9c4bb' }
  const scale = Math.min((VW - 2 * PAD) / Math.max(L, 6), (VH - 2 * PAD) / Math.max(H, 3))
  const w = L * scale
  const h = H * scale
  const x0 = (VW - w) / 2
  const y0 = VH - PAD - h
  const cutW = Math.min(w, Math.max(w / 4, 1 * scale))
  const cutX = x0 + w - cutW
  const rows: number[] = []
  for (let y = 0.5; y < H - 0.01; y += 0.5) rows.push(y)
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full" aria-hidden>
      <line x1={0} y1={VH - PAD} x2={VW} y2={VH - PAD} stroke="var(--ink)" strokeOpacity={0.25} />
      <rect x={x0} y={y0} width={Math.max(0, w - cutW)} height={h} style={{ fill: board.color, transition: T }} />
      {/* redovi ploča 0,5 m, vertikalni spojevi na 1 m, svaki drugi red smaknut 0,5 m */}
      {rows.map((y) => (
        <line key={`r${y}`} x1={x0} y1={y0 + h - y * scale} x2={cutX} y2={y0 + h - y * scale} style={{ stroke: board.ink }} strokeWidth={1.2} />
      ))}
      {Array.from({ length: Math.ceil(H / 0.5) }, (_, r) => {
        const off = r % 2 ? 0.5 : 0
        const lines: number[] = []
        for (let x = 1 - off; x < L - 0.05; x += 1) if (x > 0.05) lines.push(x0 + x * scale)
        const yb = y0 + h - r * 0.5 * scale
        const yt = Math.max(y0, yb - 0.5 * scale)
        return lines
          .filter((x) => x < cutX - 1)
          .map((x) => <line key={`v${r}-${x}`} x1={x} y1={yt} x2={x} y2={yb} style={{ stroke: board.ink }} strokeWidth={1.2} />)
      })}
      {/* armirni sloj (CT 85) u presjeku */}
      <defs>
        <clipPath id="demit-cut">
          <rect x={cutX} y={y0} width={cutW} height={h} />
        </clipPath>
      </defs>
      <rect x={cutX} y={y0} width={cutW} height={h} fill="#dcd8d1" />
      <g clipPath="url(#demit-cut)">
        {Array.from({ length: Math.ceil((cutW + h) / 14) }, (_, i) => (
          <line key={`m${i}`} x1={cutX + i * 14} y1={y0} x2={cutX + i * 14 - h} y2={y0 + h} stroke="#b9b3a9" strokeWidth={1} />
        ))}
      </g>
      <rect x={cutX} y={y0} width={cutW} height={h} fill="none" stroke="var(--ink)" strokeOpacity={0.2} />
      <line x1={cutX} y1={y0} x2={cutX} y2={y0 + h} stroke="var(--ink)" strokeWidth={1.5} />
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="var(--ink)" strokeOpacity={0.55} />
      <Dims x0={x0} y0={y0} w={w} h={h} />
    </svg>
  )
}
