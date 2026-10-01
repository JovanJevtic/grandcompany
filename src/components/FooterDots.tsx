'use client'

import { useEffect, useRef } from 'react'

// Pozadina footera: raster tačaka (halftone, kao štampa u heroju) na tamnoj podlozi. Tačke su
// stalno prigušene; oko miša se u mekom krugu upale u jarku kobalt plavu (i malo porastu).
// Raster se nacrta JEDNOM u dvije verzije (prigušena i jarka), a svaki frejm samo složi
// prigušenu + jarku unutar kruga oko miša — jeftino i na slabijem laptopu.
// Bez miša (dodir) ili uz prefers-reduced-motion ostaje samo statična prigušena verzija.

const STEP = 9 // razmak tačaka u CSS pikselima
const DOT = 2.1 // najveći poluprečnik tačke
const R = 190 // poluprečnik osvijetljenog kruga oko miša
const INK = '61,99,255' // jarka plava (RGB)

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
// Glatki šum niske frekvencije: lavirint je gust u "oblacima", a između ostaju prazna polja.
function noise(x: number, y: number) {
  const i = Math.floor(x), j = Math.floor(y)
  const fx = x - i, fy = y - j
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy)
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

// Veličina tačke prati blagi šum, pa raster ima "oblake" gušćih i rjeđih tačaka (kao štampa).
function drawDots(ctx: CanvasRenderingContext2D, cols: number, rows: number, s: number, grow: number) {
  ctx.beginPath()
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const n = noise(x / 14, y / 14) * 0.7 + noise(x / 5 + 30, y / 5) * 0.3
      const r = DOT * (0.3 + 0.7 * n) * grow * s
      if (r < 0.45 * s) continue
      const px = (x * STEP + (y % 2) * STEP * 0.5) * s, py = y * STEP * s
      ctx.moveTo(px + r, py)
      ctx.arc(px, py, r, 0, Math.PI * 2)
    }
  }
  ctx.fill()
}

export default function FooterDots({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d')!
    const dim = document.createElement('canvas')
    const bright = document.createElement('canvas')
    const spot = document.createElement('canvas')
    const sctx = spot.getContext('2d')!
    const interactive =
      window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let dpr = 1, w = 0, h = 0
    let mx = -1e4, my = -1e4, tx = -1e4, ty = -1e4
    let a = 0, ta = 0
    let raf = 0, last = 0, visible = true

    function build() {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = host!.clientWidth
      h = host!.clientHeight
      const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr))
      for (const c of [canvas!, dim, bright]) {
        c.width = W
        c.height = H
      }
      const cols = Math.ceil(w / STEP) + 2, rows = Math.ceil(h / STEP) + 2
      for (const [c, alpha, grow] of [[dim, 0.2, 1], [bright, 1, 1.3]] as const) {
        const g = c.getContext('2d')!
        g.fillStyle = `rgba(${INK},${alpha})`
        drawDots(g, cols, rows, dpr, grow)
      }
      spot.width = spot.height = Math.round(2 * R * dpr)
      draw()
    }

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx.drawImage(dim, 0, 0)
      if (a < 0.01) return
      const S = spot.width, sx = Math.round((mx - R) * dpr), sy = Math.round((my - R) * dpr)
      sctx.globalCompositeOperation = 'source-over'
      sctx.clearRect(0, 0, S, S)
      sctx.drawImage(bright, sx, sy, S, S, 0, 0, S, S)
      // meki rub: zadrži samo dio unutar radijalnog gradijenta
      sctx.globalCompositeOperation = 'destination-in'
      const grad = sctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
      grad.addColorStop(0, `rgba(0,0,0,${a})`)
      grad.addColorStop(0.55, `rgba(0,0,0,${a * 0.55})`)
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      sctx.fillStyle = grad
      sctx.fillRect(0, 0, S, S)
      ctx.drawImage(spot, sx, sy)
    }

    function tick(t: number) {
      const dt = Math.min(3, last ? (t - last) / 16.667 : 1)
      last = t
      const k = 1 - Math.pow(1 - 0.2, dt)
      mx += (tx - mx) * k
      my += (ty - my) * k
      a += (ta - a) * (1 - Math.pow(1 - 0.12, dt))
      draw()
      const moving = Math.abs(tx - mx) > 0.3 || Math.abs(ty - my) > 0.3 || Math.abs(ta - a) > 0.005
      raf = moving && visible ? requestAnimationFrame(tick) : 0
      if (!raf) last = 0
    }
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      tx = e.clientX - r.left
      ty = e.clientY - r.top
      if (ta === 0) {
        mx = tx
        my = ty
      }
      ta = 1
      kick()
    }
    const onLeave = () => {
      ta = 0
      kick()
    }

    let pending = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame(build)
    })
    ro.observe(host)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(host)
    if (interactive) {
      host.addEventListener('pointermove', onMove)
      host.addEventListener('pointerleave', onLeave)
    }
    build()

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(pending)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />
}
