'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { BRAND_NOTES } from '@/gc/gc'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { revealChars, revealLines } from '@/lib/reveal'
import { PRODUCTS, artikala } from '@/lib/shop'

// Brendovi: ogledalo prve sekcije (tamno plava kolona lijevo, svijetla desno). Uz svaki brend ide
// generativni linijski crtež (zrake, torus, globus, zrnca) koji se okreće dok se skrola — crtež se
// računa iz ugla `t`, pa ga skrol "vrti" bez ijednog video ili slikovnog fajla.

const R = 110
const f = (n: number) => n.toFixed(2)

type Art = { init: (g: SVGGElement) => void; draw: (g: SVGGElement, t: number) => void }

// Knauf: zrake iz centra, dužine kao talas koji putuje po krugu.
const rays: Art = {
  init: (g) => {
    for (let i = 0; i < 96; i++) g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'))
  },
  draw: (g, t) => {
    const lines = g.querySelectorAll('line')
    lines.forEach((l, i) => {
      const a = (i / lines.length) * Math.PI * 2
      const r0 = 14 + 10 * (0.5 + 0.5 * Math.sin(a * 3 + t * 4))
      const r1 = R - 6 - 26 * (0.5 + 0.5 * Math.sin(a * 5 - t * 3))
      l.setAttribute('x1', f(Math.cos(a) * r0))
      l.setAttribute('y1', f(Math.sin(a) * r0))
      l.setAttribute('x2', f(Math.cos(a) * r1))
      l.setAttribute('y2', f(Math.sin(a) * r1))
      l.setAttribute('stroke-dasharray', i % 2 ? '2 3' : '')
    })
  },
}

// Knauf Insulation: torus — elipse okrenute oko vertikalne ose; faza `t` ih rotira u 3D.
const torus: Art = {
  init: (g) => {
    for (let i = 0; i < 14; i++) g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'))
  },
  draw: (g, t) => {
    g.querySelectorAll('ellipse').forEach((e, i, all) => {
      const a = (i / all.length) * Math.PI + t * 2
      const cx = Math.cos(a) * R * 0.46
      e.setAttribute('cx', f(cx))
      e.setAttribute('cy', '0')
      e.setAttribute('rx', f(Math.abs(Math.sin(a)) * R * 0.5 + 1))
      e.setAttribute('ry', f(R * 0.56))
      e.setAttribute('opacity', f(0.35 + 0.65 * Math.abs(Math.sin(a))))
    })
  },
}

// Ceresit: globus — meridijani (elipse čija širina prati ugao) i paralele, u tačkastom okviru.
const globe: Art = {
  init: (g) => {
    const ns = 'http://www.w3.org/2000/svg'
    for (let i = 0; i < 7; i++) g.appendChild(document.createElementNS(ns, 'ellipse'))
    ;[-0.55, 0, 0.55].forEach((k) => {
      const l = document.createElementNS(ns, 'line')
      const y = k * R * 0.9
      const w = Math.sqrt(1 - (y / (R * 0.9)) ** 2) * R * 0.9
      l.setAttribute('x1', f(-w))
      l.setAttribute('x2', f(w))
      l.setAttribute('y1', f(y))
      l.setAttribute('y2', f(y))
      l.dataset.fixed = ''
      g.appendChild(l)
    })
    const frame = document.createElementNS(ns, 'rect')
    frame.setAttribute('x', f(-R * 0.95))
    frame.setAttribute('y', f(-R * 0.95))
    frame.setAttribute('width', f(R * 1.9))
    frame.setAttribute('height', f(R * 1.9))
    frame.setAttribute('stroke-dasharray', '1 3')
    g.appendChild(frame)
  },
  draw: (g, t) => {
    g.querySelectorAll('ellipse').forEach((e, i, all) => {
      const a = (i / all.length) * Math.PI + t * 1.6
      e.setAttribute('rx', f(Math.abs(Math.cos(a)) * R * 0.9 + 0.5))
      e.setAttribute('ry', f(R * 0.9))
    })
  },
}

// Lukavac (cement): zrnca u prstenovima; svaki prsten se okreće svojom brzinom.
const grains: Art = {
  init: (g) => {
    const ns = 'http://www.w3.org/2000/svg'
    ;[18, 34, 50, 66, 82, 98].forEach((r, k) => {
      const ring = document.createElementNS(ns, 'g')
      ring.dataset.k = String(k)
      const n = Math.round((2 * Math.PI * r) / 9)
      for (let i = 0; i < n; i++) {
        const c = document.createElementNS(ns, 'circle')
        const a = (i / n) * Math.PI * 2
        c.setAttribute('cx', f(Math.cos(a) * r))
        c.setAttribute('cy', f(Math.sin(a) * r))
        c.setAttribute('r', i % 3 ? '0.9' : '1.8')
        ring.appendChild(c)
      }
      g.appendChild(ring)
    })
    const outer = document.createElementNS(ns, 'circle')
    outer.setAttribute('r', String(R))
    g.appendChild(outer)
  },
  draw: (g, t) => {
    g.querySelectorAll<SVGGElement>('g[data-k]').forEach((ring) => {
      const k = Number(ring.dataset.k)
      ring.setAttribute('transform', `rotate(${f((k % 2 ? -1 : 1) * t * (40 + k * 22))})`)
    })
  },
}

const ARTS = [rays, torus, globe, grains]
// Artikli brenda iz kataloga; u katalogu cement piše kao "Cement Lukavac", pa se hvata i kraj naziva.
const count = (brand: string) => PRODUCTS.filter((p) => p.brand === brand || p.brand.endsWith(` ${brand}`)).length

export default function BrandsSplit() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        revealChars(el.querySelector('[data-head]')!, reduce, 'top 75%')
        revealLines(el.querySelector('[data-lead]')!, reduce, 'top 90%')

        gsap.utils.toArray<HTMLElement>('[data-brand]', el).forEach((row, i) => {
          revealChars(row.querySelector('[data-title]')!, reduce, 'top 80%', row)
          revealLines(row.querySelector('[data-text]')!, reduce, 'top 85%')
          const g = row.querySelector<SVGGElement>('[data-gen]')!
          const art = ARTS[i]
          if (!g.childElementCount) art.init(g)
          art.draw(g, 0)
          const svg = row.querySelector('svg')!
          if (reduce) return
          gsap.fromTo(svg, { scale: 0.6, autoAlpha: 0, rotate: -20 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 1.4, ease: EASE.quint, scrollTrigger: { trigger: row, start: 'top 75%' } })
          ScrollTrigger.create({
            trigger: row,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
            onUpdate: (self) => art.draw(g, self.progress * Math.PI),
          })
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="brendovi" className="relative z-20 md:grid md:grid-cols-2" aria-label="Brendovi">
      <div className="flex flex-col justify-between bg-navy px-5 pb-12 pt-[14dvh] text-bg md:sticky md:top-0 md:h-dvh md:self-start md:px-[3.05vw] md:pb-[6dvh] md:pt-[11dvh]">
        <div>
          <p className="mb-[4dvh] flex justify-between border-t border-bg/40 pt-3 font-mono text-micro uppercase tracking-wider">
            <span>05 — Brendovi</span>
            <span>{BRAND_NOTES.length} proizvođača</span>
          </p>
          <h2 data-head className="invisible text-[clamp(48px,7.2vw,150px)] font-bold uppercase leading-[0.86] tracking-[-0.02em]">
            <span className="block">Sistemi,</span>
            <span className="block text-right">ne samo</span>
            <span className="block">ploče</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-8 md:ml-[36%] md:mt-0">
          <p data-lead className="invisible text-[clamp(16px,1.35vw,22px)] font-medium leading-[1.3]">
            Radimo sa proizvođačima čiji se dijelovi slažu u sistem: ploča, profil, vuna i masa
            predviđeni su da rade zajedno, pa zid ima deklarisanu zvučnu izolaciju, a ne procjenu.
          </p>
          <Link
            href="/prodavnica"
            className="group inline-flex w-fit items-center gap-10 border-2 border-bg px-5 py-4 font-mono text-micro uppercase tracking-wider transition-colors hover:bg-bg hover:text-navy"
          >
            Artikli po brendu
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </Link>
        </div>
      </div>

      <div className="bg-bg">
        {BRAND_NOTES.map(([brand, note], i) => (
          <article
            key={brand}
            data-brand
            className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-10 border-b border-ink/15 px-5 py-[10dvh] md:min-h-[86dvh] md:grid-cols-[3.2vw_1.1fr_1fr] md:gap-x-[2vw] md:px-[3vw]"
          >
            <span className="pt-2 font-mono text-micro tabular-nums opacity-60">0{i + 1}</span>
            <h3 data-title className="invisible text-[clamp(32px,3vw,58px)] font-bold uppercase leading-[0.92]">
              {brand}
            </h3>
            <p data-text className="invisible col-span-2 text-[clamp(15px,1.15vw,20px)] font-medium leading-[1.3] md:col-span-1">
              {note}
            </p>
            <div className="col-span-2 flex items-center justify-center md:col-span-1 md:col-start-2">
              <svg viewBox={`${-R - 6} ${-R - 6} ${2 * R + 12} ${2 * R + 12}`} className="art w-[min(64vw,300px)]" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden>
                {i !== 2 && i !== 3 && <circle r={R} />}
                <g data-gen />
                <circle r={3} fill="currentColor" />
              </svg>
            </div>
            <p className="col-span-2 self-end font-mono text-micro uppercase tracking-wider md:col-span-1 md:col-start-3">
              <span className="flex items-center gap-3 border-t border-ink/25 pt-3">
                <i className="size-2 bg-accent" />
                {count(brand) ? `${artikala(count(brand))} u katalogu` : 'Na upit'}
              </span>
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
