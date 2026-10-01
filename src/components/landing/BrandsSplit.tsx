'use client'

import Cta from '@/components/ui/Cta'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'

// Četiri prednosti (PDF, tačka 3). Desno stoji panel (veliki naslov u stepenastim redovima, tekst
// dolje desno, dugme), lijevo se skrola po jedna prednost sa generativnim linijskim crtežom
// (zrake, torus, globus, prstenovi tačaka) koji se okreće dok se skrola — crtež se računa iz
// ugla `t`, pa ga skrol "vrti" bez ijednog video ili slikovnog fajla.

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
      const el = root.current!
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        revealChars(el.querySelector('[data-head]')!, reduce, 'top 75%')

        gsap.utils.toArray<HTMLElement>('[data-brand]', el).forEach((row, i) => {
          revealChars(row.querySelector('[data-title]')!, reduce, 'top 80%', row)
          const g = row.querySelector<SVGGElement>('[data-gen]')!
          const art = ARTS[i]
          if (!g.childElementCount) art.init(g)
          art.draw(g, 0)
          const svg = row.querySelector('svg')!
          if (reduce) return
          gsap.fromTo(svg, { scale: 0.6, autoAlpha: 0, rotate: -20 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.6, ease: EASE.quint, scrollTrigger: { trigger: row, start: 'top 75%' } })
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
      {/* Panel (desno na desktopu, md:order-2): naslov u stepenastim redovima gore, tekst dolje desno, dugme */}
      <div className="split-panel bg-navy text-bg md:order-2 md:sticky md:top-0 md:h-dvh md:self-start">
        <h2 data-head className="split-panel__head display invisible">
          <span className="block">Četiri</span>
          <span className="block text-right">prednosti</span>
          <span className="block">saradnje</span>
        </h2>
        <div className="split-panel__foot">
          <p data-lead className="split-panel__lead">
            Grand Company je ovlašteni Knauf distributer i specijalista za suhu gradnju, sa vlastitim kamionima sa kranom,
            Pantheon ERP portalom i kompletnom tehničkom dokumentacijom.
          </p>
          <Cta href="/portal" className="[--cta-fill:var(--bg)] [--cta-ink:var(--navy)]">
            B2B portal
          </Cta>
        </div>
      </div>

      {/* Prednosti sa crtežima: lijevo na desktopu */}
      <div className="bg-bg md:order-1">
        {USPS.map((u, i) => (
          <article
            key={u.title}
            data-brand
            className="flex flex-col items-center justify-center gap-10 border-b border-ink/10 px-6 py-[14vh] text-center md:min-h-[90dvh] md:px-[5vw]"
          >
            <svg viewBox={`${-R - 6} ${-R - 6} ${2 * R + 12} ${2 * R + 12}`} className="art w-[min(60vw,280px)]" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden>
              {i !== 2 && i !== 3 && <circle r={R} />}
              <g data-gen />
              <circle r={3} fill="var(--signal)" stroke="none" />
            </svg>
            <h3 data-title className="display invisible text-[clamp(32px,3.6vw,64px)]">
              {u.title}
            </h3>
            <p className="max-w-[48ch] text-[12.5px] leading-[1.65] opacity-75">{u.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
