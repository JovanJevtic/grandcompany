'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { BRAND, TEXT, TILES, pad } from '@/lib/content'
import { catName, km } from '@/lib/shop'
import { openContact, scrollToTarget } from '@/lib/scroll'
import ProductImage from '@/components/shop/ProductImage'
import { EASE, EV, prefersReducedMotion } from '@/lib/motion'
import { lockScroll, unlockScroll } from '@/lib/scroll'

const N = TILES.length
const TAU = Math.PI * 2

// Stalni (ne nasumični pri svakom učitavanju) mali pomaci ploča, da prsten nije savršeno pravilan.
const rnd = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}
const JIT = TILES.map((_, i) => ({ a: (rnd(i, 1) - 0.5) * 0.24, r: 1 + (rnd(i, 2) - 0.5) * 0.14 }))

type Ctrl = { enter: (i: number) => void; leave: () => void }
type Expanded = { i: number; rect: DOMRect } | null

// Prsten ploča oko središta. Sve je običan DOM: pozicije se računaju u jednom ticker-u (jedan rAF), a ne kroz
// React stanje, pa je glatko i sa petnaest ploča. Kad se otvori kontakt, prsten se crta na canvasu kao mozaik
// sve krupnijih blokova (piksel-efekat), a ploče u DOM-u se gase.
export default function Constellation() {
  const root = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const ctrl = useRef<Ctrl>({ enter: () => {}, leave: () => {} })
  const closing = useRef(false)
  const [hover, setHover] = useState<number | null>(null)
  const [contact, setContact] = useState(false)
  const [expanded, setExpanded] = useState<Expanded>(null)

  useEffect(() => {
    const on = (e: Event) => setContact(!!(e as CustomEvent<boolean>).detail)
    window.addEventListener(EV.contact, on)
    return () => window.removeEventListener(EV.contact, on)
  }, [])

  useGSAP(
    () => {
      const el = root.current!
      const tiles = [...el.querySelectorAll<HTMLElement>('[data-tile]')]
      const imgs = tiles.map((tile) => tile.querySelector('img'))
      const copy = el.querySelectorAll<HTMLElement>('[data-herocopy]')
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      const buf = document.createElement('canvas')
      const bctx = buf.getContext('2d')!
      const reduce = prefersReducedMotion()

      // s = zajedničko stanje; t = stanje svake ploče (ulaz, uvećanje na hover, zatamnjenje)
      const s = { angle: 0, introAngle: reduce ? 0 : -1.5, base: 0.17, slow: 1, kick: 0, tx: 0, ty: 0, ox: 0, oy: 0, open: 0 }
      const t = tiles.map(() => ({ intro: reduce ? 1 : 0, scale: 1, dim: 1 }))
      let hovered = -1
      // Kad se skrolom spusti prodavnica preko heroja, prsten se ne crta (štedi procesor) i točkić ga ne vrti.
      let gone = false
      const onScroll = () => {
        gone = window.scrollY > window.innerHeight * 1.05
      }
      let W = 0
      let H = 0
      let u = 240
      let cx = 0
      let cy = 0
      let rx = 0
      let ry = 0

      const layout = () => {
        W = window.innerWidth
        H = window.innerHeight
        const mobile = W < 768
        u = mobile ? W * 0.34 : Math.min(W * 0.1667, H * 0.267)
        cx = W / 2
        cy = H * 0.497
        rx = mobile ? W * 0.27 : W * 0.243
        ry = mobile ? H * 0.26 : H * 0.278
        el.style.setProperty('--u', `${u}px`)
        canvas.width = W
        canvas.height = H
      }
      layout()

      type P = { x: number; y: number; sn: number; sc: number }
      const drawMosaic = (pos: P[]) => {
        const b = 1 + 12 * s.open // veličina bloka raste od 1px do 13px
        const bw = Math.ceil(W / b)
        const bh = Math.ceil(H / b)
        if (buf.width !== bw || buf.height !== bh) {
          buf.width = bw
          buf.height = bh
        }
        bctx.clearRect(0, 0, bw, bh)
        const order = pos.map((_, i) => i).sort((a, c) => pos[a].sn - pos[c].sn) // dalje se crta prvo
        for (const i of order) {
          const p = pos[i]
          const w = (TILES[i].w * u * p.sc) / b
          const h = (0.5625 * u * p.sc) / b
          const x = p.x / b - w / 2
          const y = p.y / b - h / 2
          bctx.globalAlpha = t[i].intro * 0.9
          bctx.fillStyle = TILES[i].a
          bctx.fillRect(x, y, w, h)
          const img = imgs[i]
          if (img && img.complete && img.naturalWidth > 0) {
            // isti kadar kao u DOM-u: crtež "contain" sa odmakom, fotografija "cover"
            const iw = img.naturalWidth
            const ih = img.naturalHeight
            if (TILES[i].p.drawing) {
              const k = Math.min((w * 0.84) / iw, (h * 0.84) / ih)
              bctx.drawImage(img, x + (w - iw * k) / 2, y + (h - ih * k) / 2, iw * k, ih * k)
            } else {
              const k = Math.max(w / iw, h / ih)
              const sw = w / k
              const sh = h / k
              bctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h)
            }
          } else {
            bctx.fillStyle = TILES[i].b
            bctx.fillRect(x + w * 0.35, y + h * 0.45, w * 0.65, h * 0.55)
          }
        }
        bctx.globalAlpha = 1
        ctx.clearRect(0, 0, W, H)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, bw * b, bh * b)
      }

      const update = (_time: number, dtMs: number) => {
        if (gone) return
        const dt = Math.min(dtMs, 50) / 1000
        s.kick *= Math.pow(0.04, dt) // zamah od točkića se brzo smiruje
        s.angle += (s.base * s.slow + s.kick) * dt
        const ease = 1 - Math.exp(-5 * dt)
        s.ox += (s.tx - s.ox) * ease
        s.oy += (s.ty - s.oy) * ease

        const a0 = s.angle + s.introAngle
        const k = 1 - 0.34 * s.open // radijus se smanjuje kad je kontakt otvoren
        const fade = 1 - Math.min(1, s.open * 3.2) // DOM ploče nestaju kad se pojavi mozaik

        const pos: P[] = tiles.map((_, i) => {
          const th = a0 + (i / N) * TAU + JIT[i].a
          const sn = Math.sin(th)
          const depth = 0.95 + (0.1 * (sn + 1)) / 2 // donje ploče (bliže) su malo veće
          return {
            x: cx + s.ox + rx * k * JIT[i].r * Math.cos(th),
            y: cy + s.oy + ry * k * JIT[i].r * sn,
            sn,
            sc: depth * t[i].scale * (0.6 + 0.4 * t[i].intro) * (1 - 0.28 * s.open),
          }
        })

        tiles.forEach((tile, i) => {
          const p = pos[i]
          const w = TILES[i].w * u
          const h = 0.5625 * u
          tile.style.transform = `translate3d(${p.x - w / 2}px, ${p.y - h / 2}px, 0) scale(${p.sc})`
          tile.style.opacity = String(t[i].dim * t[i].intro * fade)
          tile.style.zIndex = String(hovered === i ? 1000 : 100 + Math.round(p.sn * 90))
          tile.style.pointerEvents = s.open > 0.05 ? 'none' : 'auto'
        })

        if (s.open > 0.001) drawMosaic(pos)
        canvas.style.opacity = String(Math.min(1, s.open * 3.2))
      }
      gsap.ticker.add(update)

      // Hover: ploča ispod kursora raste i ostaje svijetla, ostale tamne, a rotacija se skoro zaustavi.
      ctrl.current.enter = (i) => {
        if (s.open > 0.05) return
        hovered = i
        setHover(i)
        gsap.to(s, { slow: 0.1, duration: 1.2, ease: EASE.out, overwrite: 'auto' })
        t.forEach((o, j) =>
          gsap.to(o, { scale: j === i ? 1.55 : 1, dim: j === i ? 1 : 0.28, duration: 0.9, ease: EASE.expo, overwrite: 'auto' }),
        )
      }
      ctrl.current.leave = () => {
        hovered = -1
        setHover(null)
        gsap.to(s, { slow: 1, duration: 1.4, ease: EASE.out, overwrite: 'auto' })
        t.forEach((o) => gsap.to(o, { scale: 1, dim: 1, duration: 0.9, ease: EASE.expo, overwrite: 'auto' }))
      }

      // Ulazak: ploče se redom pojave, a prsten se za to vrijeme zavrti do svog položaja.
      const intro = () => {
        gsap.to(t, { intro: 1, duration: 1.5, ease: EASE.expo, stagger: 0.11 })
        gsap.to(s, { introAngle: 0, duration: 3.4, ease: 'power3.out' })
        gsap.fromTo(copy, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1.2, delay: 0.6, stagger: 0.12, ease: EASE.expo })
      }
      if (reduce || document.documentElement.dataset.ready === '1') {
        gsap.set(t, { intro: 1 })
        s.introAngle = 0
      } else {
        gsap.set(copy, { autoAlpha: 0 })
        window.addEventListener(EV.ready, intro, { once: true })
      }

      // Kontakt: prsten se smanji, uspori i pikselizira; zatvaranje ga vraća.
      const onContact = (e: Event) => {
        const open = !!(e as CustomEvent<boolean>).detail
        if (open) ctrl.current.leave()
        gsap.to(s, { open: open ? 1 : 0, duration: reduce ? 0.01 : 1.5, ease: EASE.inOut, overwrite: 'auto' })
        gsap.to(s, { slow: open ? 0.25 : 1, duration: 1.5, ease: EASE.out })
      }
      window.addEventListener(EV.contact, onContact)

      const onMove = (e: PointerEvent) => {
        s.tx = (e.clientX / W - 0.5) * -36
        s.ty = (e.clientY / H - 0.5) * -26
      }
      const onWheel = (e: WheelEvent) => {
        if (gone) return
        s.kick = Math.max(-1.6, Math.min(1.6, s.kick + e.deltaY * 0.0012))
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('wheel', onWheel, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', layout)

      return () => {
        gsap.ticker.remove(update)
        window.removeEventListener(EV.ready, intro)
        window.removeEventListener(EV.contact, onContact)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('wheel', onWheel)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', layout)
      }
    },
    { scope: root },
  )

  // Klik na ploču: ona raste iz svog položaja do gotovo cijelog ekrana.
  useGSAP(
    () => {
      if (!expanded || !layer.current) return
      closing.current = false
      const m = 24
      gsap.fromTo(
        layer.current,
        { top: expanded.rect.top, left: expanded.rect.left, width: expanded.rect.width, height: expanded.rect.height },
        { top: m, left: m, width: window.innerWidth - 2 * m, height: window.innerHeight - 2 * m, duration: 1.1, ease: EASE.expoInOut },
      )
      gsap.from(layer.current.querySelectorAll('[data-x]'), { autoAlpha: 0, y: 12, duration: 0.8, delay: 0.7, stagger: 0.08 })
    },
    { dependencies: [expanded], revertOnUpdate: false },
  )

  function closeExpanded() {
    if (!expanded || !layer.current || closing.current) return
    closing.current = true
    const { rect } = expanded
    gsap.to(layer.current, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      duration: 0.9,
      ease: EASE.expoInOut,
      onComplete: () => setExpanded(null),
    })
  }

  useEffect(() => {
    if (!expanded) return
    // znak u sredini stranice se sakriva dok je slika otvorena (vidi .mark u globals.css)
    document.documentElement.dataset.expanded = '1'
    lockScroll('tile') // dok je ploča uvećana, stranica ispod se ne skroluje
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeExpanded()
    window.addEventListener('keydown', onKey)
    return () => {
      unlockScroll('tile')
      delete document.documentElement.dataset.expanded
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded])

  return (
    <div ref={root} className="fixed inset-0 z-10">
      {TILES.map((tile, i) => (
        <button
          key={i}
          type="button"
          data-tile
          aria-label={`Uvećaj: ${tile.p.name}`}
          className="absolute left-0 top-0 cursor-pointer overflow-hidden will-change-transform"
          style={{
            width: `calc(var(--u) * ${tile.w})`,
            height: 'calc(var(--u) * 0.5625)',
            opacity: 0,
          }}
          onPointerEnter={() => ctrl.current.enter(i)}
          onPointerLeave={() => ctrl.current.leave()}
          onClick={(e) => setExpanded({ i, rect: e.currentTarget.getBoundingClientRect() })}
        >
          <ProductImage p={tile.p} pad="8%" eager />
        </button>
      ))}

      {/* Rečenica o firmi i dva dugmeta (obrazac sa Korvae); tekst je "difference", pa je čitljiv i preko svijetlih ploča */}
      <div
        className={`pointer-events-none absolute inset-0 z-[1100] transition-opacity duration-500 ${contact || expanded ? 'opacity-0' : ''}`}
      >
        <div className="absolute left-5 top-[104px] max-w-[min(290px,20vw)] text-white mix-blend-difference max-md:max-w-[78vw] md:top-[118px]">
          <p data-herocopy className="info">Knauf suha gradnja · izolacija · veziva</p>
          <h1 data-herocopy className="mt-4 text-[clamp(20px,1.6vw,26px)] font-medium leading-[1.02] tracking-[-0.04em]">
            Građevinski materijal za suhu gradnju i fasade, <em className="font-serif font-normal tracking-[-0.02em]">kranom na vašu etažu</em>.
          </h1>
        </div>
        <div data-herocopy className="pointer-events-auto absolute bottom-[64px] left-5 flex flex-wrap gap-2 max-md:bottom-[60px]">
          <button type="button" onClick={() => scrollToTarget('#ponuda')} className="btn btn-solid">
            Pogledaj ponudu
          </button>
          <button type="button" onClick={() => scrollToTarget('#upit')} className="btn bg-black">
            Zatraži ponudu
          </button>
        </div>
      </div>

      {/* mozaik: prsten nacrtan u sve krupnijim blokovima dok je kontakt otvoren */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }} aria-hidden />

      {/* donji red: indeks projekta, naziv i oznaka klijenta */}
      <div
        className={`info pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-5 pb-[26px] text-fg transition-opacity duration-500 ${
          contact || expanded ? 'opacity-0' : ''
        }`}
      >
        {/* na mobilnom je preširok tekst lijevo skriven, da se red ne lomi */}
        <p className="w-1/3 font-medium max-md:w-1/4">
          <span className={hover === null ? 'max-md:hidden' : ''}>{hover !== null ? catName(TILES[hover].p.cat) : TEXT.left}</span>
        </p>
        <p className="w-1/3 truncate text-center font-medium max-md:w-2/4">{hover !== null ? TILES[hover].p.name : TEXT.center}</p>
        <div className="flex w-1/3 justify-end max-md:w-1/4">
          <button
            type="button"
            onClick={openContact}
            className="pointer-events-auto flex items-center gap-2 font-mono text-[12px] leading-none tracking-[-0.02em]"
          >
            {BRAND}
            <span className="text-[10px]">↗</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div
          ref={layer}
          onClick={closeExpanded}
          className="fixed z-[2000] cursor-pointer overflow-hidden"
          role="dialog"
          aria-label={TILES[expanded.i].p.name}
        >
          <ProductImage p={TILES[expanded.i].p} pad="9%" eager />
          <div className="info absolute inset-x-6 bottom-6 flex justify-between gap-6 text-white mix-blend-difference">
            <span data-x>{pad(expanded.i + 1)}</span>
            <span data-x className="text-center">
              {TILES[expanded.i].p.name} · {km(TILES[expanded.i].p.price)} / {TILES[expanded.i].p.unit}
            </span>
            <span data-x>Zatvori</span>
          </div>
        </div>
      )}
    </div>
  )
}
