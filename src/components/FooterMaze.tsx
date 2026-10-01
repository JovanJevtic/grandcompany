'use client'

import { useEffect, useRef } from 'react'

// Pozadina footera: "pikselizovani" lavirint od kratkih linija i kvadratića na mreži, u jarkoj
// kobalt plavoj. Lavirint se nacrta JEDNOM u dvije verzije (prigušena i puna), a svaki frejm
// samo složi prigušenu + punu u mekom krugu oko miša — zato je jeftin i na slabijem laptopu.
// Bez miša (dodir) ili uz prefers-reduced-motion ostaje samo statična prigušena verzija.

const CELL = 12 // korak mreže u CSS pikselima
const LINE = 2 // debljina linije
const R = 200 // poluprečnik osvijetljenog kruga oko miša
const INK = '61,99,255' // jarka plava (RGB)

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
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

function drawMaze(ctx: CanvasRenderingContext2D, cols: number, rows: number, s: number) {
  const rand = rng(20261001)
  const L = LINE * s, C = CELL * s
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const n = noise(x / 9, y / 9) * 0.65 + noise(x / 3.5 + 40, y / 3.5) * 0.35
      const r = rand()
      if (n < 0.5) continue
      const px = x * C, py = y * C
      if (r < 0.42) ctx.fillRect(px, py, C + L, L) // vodoravna
      else if (r < 0.84) ctx.fillRect(px, py, L, C + L) // uspravna
      else if (r < 0.9) ctx.strokeRect(px + C * 0.25, py + C * 0.25, C * 0.5, C * 0.5) // kvadratić
    }
  }
}

export default function FooterMaze({ className = '' }: { className?: string }) {
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
      const cols = Math.ceil(w / CELL) + 1, rows = Math.ceil(h / CELL) + 1
      for (const [c, alpha] of [[dim, 0.16], [bright, 1]] as const) {
        const g = c.getContext('2d')!
        g.fillStyle = `rgba(${INK},${alpha})`
        g.strokeStyle = `rgba(${INK},${alpha})`
        g.lineWidth = LINE * dpr
        drawMaze(g, cols, rows, dpr)
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
