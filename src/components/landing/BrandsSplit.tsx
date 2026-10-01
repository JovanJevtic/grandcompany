'use client'

import Cta from '@/components/ui/Cta'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import Pw from '@/components/ui/Pw'

// Zašto Grand Company: četiri prednosti iz dokumentacije firme (PDF, tačka 3). Ogledalo sekcije
// "Sistemi" (tamno plava kolona lijevo, svijetla desno). Uz svaku prednost ide generativni linijski
// crtež koji se mijenja dok se skrola (računa se iz ugla `t`, bez slika i videa):
// kran koji spušta paletu, slojevi ploča, mreža podataka (ERP), pečat atesta.

const R = 110
const f = (n: number) => n.toFixed(2)
const NS = 'http://www.w3.org/2000/svg'
const el = <K extends keyof SVGElementTagNameMap>(tag: K) => document.createElementNS(NS, tag)

type Art = { init: (g: SVGGElement) => void; draw: (g: SVGGElement, t: number) => void }

// 1. Kran: stub, krak koji se okreće (t) i uže sa paletom koja se spušta na "sprat".
const crane: Art = {
  init: (g) => {
    for (let i = 0; i < 4; i++) g.appendChild(el('line')) // stub, krak, zatega, uže
    g.appendChild(el('rect')) // paleta
    for (let i = 0; i < 4; i++) g.appendChild(el('line')) // spratovi zgrade
  },
  draw: (g, t) => {
    const [mast, boom, stay, rope] = Array.from(g.querySelectorAll('line'))
    const rect = g.querySelector('rect')!
    const floors = Array.from(g.querySelectorAll('line')).slice(4)
    const bx = -70
    const by = 80
    const a = -0.25 - 0.55 * Math.sin(t) // ugao kraka
    const L = 150
    const tipX = bx + Math.cos(a) * L
    const tipY = by - 70 + Math.sin(a) * L
    const drop = 30 + 60 * (0.5 + 0.5 * Math.sin(t * 2))
    mast.setAttribute('x1', f(bx)); mast.setAttribute('y1', f(by)); mast.setAttribute('x2', f(bx)); mast.setAttribute('y2', f(by - 70))
    boom.setAttribute('x1', f(bx)); boom.setAttribute('y1', f(by - 70)); boom.setAttribute('x2', f(tipX)); boom.setAttribute('y2', f(tipY))
    stay.setAttribute('x1', f(bx)); stay.setAttribute('y1', f(by - 20)); stay.setAttribute('x2', f(bx + Math.cos(a) * L * 0.55)); stay.setAttribute('y2', f(by - 70 + Math.sin(a) * L * 0.55))
    stay.setAttribute('stroke-dasharray', '2 3')
    rope.setAttribute('x1', f(tipX)); rope.setAttribute('y1', f(tipY)); rope.setAttribute('x2', f(tipX)); rope.setAttribute('y2', f(tipY + drop))
    rect.setAttribute('x', f(tipX - 16)); rect.setAttribute('y', f(tipY + drop)); rect.setAttribute('width', '32'); rect.setAttribute('height', '14')
    floors.forEach((l, i) => {
      const y = by - i * 34
      l.setAttribute('x1', '20'); l.setAttribute('x2', f(R - 4)); l.setAttribute('y1', f(y)); l.setAttribute('y2', f(y))
    })
  },
}

// 2. Knauf sistem: slojevi ploča u izometriji koji se razmiču i sklapaju (kao sistem iz dijelova).
const boards: Art = {
  init: (g) => {
    for (let i = 0; i < 6; i++) g.appendChild(el('polygon'))
  },
  draw: (g, t) => {
    const gap = 6 + 14 * (0.5 + 0.5 * Math.sin(t * 2))
    g.querySelectorAll('polygon').forEach((p, i) => {
      const y = (i - 2.5) * gap
      const pts = [
        [0, y - 46],
        [80, y - 6],
        [0, y + 34],
        [-80, y - 6],
      ]
      p.setAttribute('points', pts.map(([x, yy]) => `${f(x)},${f(yy)}`).join(' '))
      p.setAttribute('fill', 'var(--bg)')
      p.setAttribute('opacity', f(0.45 + (i / 5) * 0.55))
    })
  },
}

// 3. Pantheon ERP: mreža stubića (stanje zaliha) čija visina putuje kao talas — podaci uživo.
const data: Art = {
  init: (g) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) g.appendChild(el('line'))
    }
  },
  draw: (g, t) => {
    g.querySelectorAll('line').forEach((l, k) => {
      const i = k % 9
      const j = Math.floor(k / 9)
      const x = (i - 4) * 22
      const y = (j - 4) * 22 + 10
      const h = 4 + 16 * (0.5 + 0.5 * Math.sin(t * 3 + i * 0.7 + j * 0.45))
      l.setAttribute('x1', f(x)); l.setAttribute('x2', f(x)); l.setAttribute('y1', f(y)); l.setAttribute('y2', f(y - h))
    })
  },
}

// 4. Atesti: pečat — koncentrični krugovi i radijalne crtice koje se okreću, u sredini kvačica.
const stamp: Art = {
  init: (g) => {
    ;[R * 0.92, R * 0.7].forEach((r) => {
      const c = el('circle')
      c.setAttribute('r', f(r))
      g.appendChild(c)
    })
    const ticks = el('g')
    ticks.dataset.ticks = ''
    for (let i = 0; i < 60; i++) {
      const l = el('line')
      const a = (i / 60) * Math.PI * 2
      l.setAttribute('x1', f(Math.cos(a) * R * 0.74))
      l.setAttribute('y1', f(Math.sin(a) * R * 0.74))
      l.setAttribute('x2', f(Math.cos(a) * R * (i % 5 ? 0.82 : 0.88)))
      l.setAttribute('y2', f(Math.sin(a) * R * (i % 5 ? 0.82 : 0.88)))
      ticks.appendChild(l)
    }
    g.appendChild(ticks)
    const check = el('polyline')
    check.setAttribute('points', '-26,2 -6,22 30,-20')
    check.setAttribute('stroke-width', '2')
    g.appendChild(check)
  },
  draw: (g, t) => {
    g.querySelector<SVGGElement>('[data-ticks]')!.setAttribute('transform', `rotate(${f(t * 40)})`)
  },
}

const ARTS = [crane, boards, data, stamp]

const USPS: { title: string; text: string }[] = [
  {
    title: 'Kran do sprata',
    text: 'Vlastiti vozni park sa kamionima koji imaju ugrađene kranove. Paletirani materijal — gipsane ploče, vunu, ciglu — istovaramo direktno na spratove i visoke etaže gradilišta u regiji Banja Luke i šire.',
  },
  {
    title: 'Knauf distributer',
    text: 'Ovlašteni distributer i specijalista za suhu gradnju. Kompletan sistemski asortiman — ploče, profili, veziva, spojnice, izolacija i zaptivne trake — na jednom mjestu.',
  },
  {
    title: 'Pantheon ERP',
    text: 'Portal je povezan sa Pantheon ERP-om: stanje zaliha na skladištu Nenada Kostića 151 u realnom vremenu, a B2B kupci vide ugovorene rabate, kreditne limite i odgođeno plaćanje.',
  },
  {
    title: 'Atesti i deklaracije',
    text: 'Kompletna dokumentacija za tehnički prijem objekata: protivpožarni atesti, zvučna izolovanost i CE znaci.',
  },
]

export default function BrandsSplit() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const node = root.current!
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        revealChars(node.querySelector('[data-head]')!, reduce, 'top 75%')

        gsap.utils.toArray<HTMLElement>('[data-brand]', node).forEach((row, i) => {
          revealChars(row.querySelector('[data-title]')!, reduce, 'top 80%', row)
          const g = row.querySelector<SVGGElement>('[data-gen]')!
          const art = ARTS[i]
          if (!g.childElementCount) art.init(g)
          art.draw(g, 0.6)
          const svg = row.querySelector('svg')!
          if (reduce) return
          gsap.fromTo(svg, { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.4, ease: EASE.quint, scrollTrigger: { trigger: row, start: 'top 75%' } })
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
    <section ref={root} id="prednosti" className="relative z-20 md:grid md:grid-cols-2" aria-label="Zašto Grand Company">
      <div className="flex flex-col items-center justify-center gap-10 bg-navy px-5 py-[16vh] text-center text-bg md:sticky md:top-0 md:h-dvh md:self-start">
        <p className="label opacity-60">Zašto Grand Company</p>
        <h2 data-head className="display invisible text-[clamp(44px,6vw,112px)]">
          <Pw>Četiri prednosti</Pw>
        </h2>
        <Cta href="/portal" className="[--cta-fill:var(--bg)] [--cta-ink:var(--navy)]">
          B2B portal
        </Cta>
      </div>

      <div className="bg-bg">
        {USPS.map((u, i) => (
          <article
            key={u.title}
            data-brand
            className="flex flex-col items-center justify-center gap-8 border-b border-ink/10 px-6 py-[14vh] text-center md:min-h-[90dvh] md:px-[5vw]"
          >
            <svg
              viewBox={`${-R - 6} ${-R - 6} ${2 * R + 12} ${2 * R + 12}`}
              className="art w-[min(60vw,280px)]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              aria-hidden
            >
              {i < 3 && <circle r={R} />}
              <g data-gen />
            </svg>
            <h3 data-title className="display invisible text-[clamp(32px,3.6vw,64px)]">
              <Pw>{u.title}</Pw>
            </h3>
            <p className="max-w-[48ch] text-[12.5px] leading-[1.65] opacity-75">{u.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
