'use client'

/* eslint-disable @next/next/no-img-element -- editorijalne fotografije iz /public, već u WebP */

import { useRef } from 'react'
import Cta from '@/components/ui/Cta'
import { gsap, useGSAP } from '@/lib/gsap'
import { useMediaMotion } from '@/lib/media'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import Pw from '@/components/ui/Pw'

// Prvi ekran poslije herosa: ko smo (B2B veleprodaja, Knauf distributer). Editorijalni raspored na
// mreži od 12 kolona: naslov lijevo, desno linijska ilustracija u krugu (paleta gipsanih ploča sa
// profilima) čiji se prsten sa tekstom sporo okreće; ispod uzak stub teksta sa činjenicama i
// ulazima, pa široki kolaž fotografija. id="radovi" je okidač za odlazak velikog wordmarka (SiteChrome).

// Izometrijska projekcija (30°) za linijski crtež: x desno, y gore, z ka posmatraču.
const C30 = Math.cos(Math.PI / 6)
const iso = (x: number, y: number, z: number): [number, number] => [100 + (x - z) * C30, 112 + (x + z) * 0.5 - y]
const r = (n: number) => Math.round(n * 100) / 100
const pt = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`

/** Kutija (kvadar) kao tri vidljive strane — obrisi za linijski crtež. */
function boxPath(x0: number, y0: number, z0: number, w: number, h: number, d: number) {
  const P = (x: number, y: number, z: number) => pt(iso(x, y, z))
  const [x1, y1, z1] = [x0 + w, y0 + h, z0 + d]
  return [
    `M${P(x0, y1, z0)} L${P(x1, y1, z0)} L${P(x1, y1, z1)} L${P(x0, y1, z1)} Z`, // gornja
    `M${P(x0, y0, z1)} L${P(x1, y0, z1)} L${P(x1, y1, z1)} L${P(x0, y1, z1)} Z`, // prednja
    `M${P(x1, y0, z0)} L${P(x1, y0, z1)} L${P(x1, y1, z1)} L${P(x1, y1, z0)} Z`, // desna
  ].join(' ')
}

function PalletDrawing() {
  const W = 66,
    D = 40
  const parts: string[] = []
  // Paleta: tri grede i gornje daske
  for (const z of [0, D / 2 - 3, D - 6]) parts.push(boxPath(-W / 2, -26, z - D / 2, W, 5, 6))
  parts.push(boxPath(-W / 2, -21, -D / 2, W, 2.5, D))
  // Složaj ploča: svaka ploča je jedna tanka kutija (linije slojeva)
  const layers = 9
  for (let i = 0; i < layers; i++) parts.push(boxPath(-W / 2 + (i % 2), -18.5 + i * 3, -D / 2 + (i % 2) * 0.6, W - (i % 2) * 2, 3, D - (i % 2) * 1.2))
  // Dvije trake preko složaja
  const top = -18.5 + layers * 3
  for (const x of [-W / 4, W / 4]) {
    parts.push(`M${pt(iso(x, top, -D / 2))} L${pt(iso(x, top, D / 2))} L${pt(iso(x, -18.5, D / 2))}`)
  }
  // CW profili naslonjeni na vrhu (dugi tanki kvadri)
  parts.push(boxPath(-W / 2 - 8, top, -6, W + 16, 3, 4))
  parts.push(boxPath(-W / 2 - 4, top + 3, 2, W + 8, 3, 4))
  return <path d={parts.join(' ')} />
}

const RING = 'Knauf ovlašteni distributer · Suha gradnja · Izolacija · Dostava kranom · '
// Obim kruga za tekst (r = 86): tekst se rastegne tačno na njega, pa se kraj ne preklapa sa početkom.
const RING_LEN = Math.round(2 * Math.PI * 86 - 6)

function Emblem() {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" className="h-full w-full" role="img" aria-label="Linijski crtež palete gipsanih ploča sa profilima">
      <defs>
        <path id="intro-ring" d="M100,100 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0" />
      </defs>
      {/* prsten koji se okreće: tekst, podioci i tačka */}
      <g data-spin className="origin-center">
        <text fill="currentColor" stroke="none" fontSize="8.6" style={{ fontFamily: 'var(--font-text)', textTransform: 'uppercase' }}>
          <textPath href="#intro-ring" textLength={RING_LEN} lengthAdjust="spacing">
            {RING}
          </textPath>
        </text>
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * Math.PI * 2
          const r0 = i % 6 ? 74 : 70
          // zaokruženo: server i browser inače daju različitu poslednju decimalu (greška pri hidrataciji)
          return <line key={i} x1={r(100 + Math.cos(a) * r0)} y1={r(100 + Math.sin(a) * r0)} x2={r(100 + Math.cos(a) * 77)} y2={r(100 + Math.sin(a) * 77)} strokeWidth=".6" />
        })}
        <circle cx="177" cy="100" r="2.6" fill="var(--cobalt)" stroke="none" />
      </g>
      <circle cx="100" cy="100" r="96" strokeWidth=".6" />
      <circle cx="100" cy="100" r="66" strokeWidth=".6" strokeDasharray="1.5 3" />
      <g strokeWidth=".7" strokeLinejoin="round">
        <PalletDrawing />
      </g>
    </svg>
  )
}

const FACTS: [string, string][] = [
  ['Knauf', 'Ovlašteni distributer — kompletni sistemi suhe gradnje na jednom mjestu.'],
  ['Kran', 'Vlastiti kamioni sa dizalicom: palete direktno na sprat gradilišta.'],
  ['Pantheon', 'Stanje zaliha, rabat i kreditni limit u realnom vremenu.'],
]

export default function Intro() {
  const root = useRef<HTMLElement>(null)
  useMediaMotion(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        revealChars(root.current!.querySelector('[data-head]')!, reduce, 'top 80%')
        if (reduce) return
        const el = root.current!
        // Prsten se sporo okreće stalno, a skrol mu doda još pola kruga.
        const ring = el.querySelector('[data-spin]')
        gsap.to(ring, { rotate: 360, duration: 60, ease: 'none', repeat: -1, svgOrigin: '100 100' })
        gsap.fromTo(
          el.querySelector('[data-emblem]'),
          { rotate: -25 },
          { rotate: 20, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
        gsap.fromTo(
          el.querySelector('[data-small]'),
          { yPercent: 30 },
          { yPercent: -40, ease: 'none', scrollTrigger: { trigger: el.querySelector('[data-collage]'), start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="radovi" className="relative z-20 bg-bg pb-[18vh] pt-[20vh]">
      <div className="mx-auto grid w-[calc(100%-40px)] gap-y-12 md:w-[88vw] md:grid-cols-12 md:gap-x-[2vw]">
        {/* Naslov */}
        <div className="md:col-span-7 md:pt-6">
          <p data-up className="label flex items-center gap-4 opacity-60">
            <span className="tabular-nums">01</span>
            <span className="h-px w-10 bg-current" />
            Veleprodaja i maloprodaja · Banja Luka
          </p>
          <h2 data-head className="display invisible mt-8 max-w-[12ch] text-[clamp(38px,5.4vw,100px)] !leading-[0.9] [hyphens:none] [overflow-wrap:normal] [word-break:keep-all]">
            <Pw>Građevinski materijal za izvođače</Pw>
          </h2>
        </div>
        {/* Linijska ilustracija u krugu */}
        <div data-up className="flex items-start justify-center md:col-span-5 md:justify-end">
          <div data-emblem className="aspect-square w-[min(72vw,420px)] text-ink">
            <Emblem />
          </div>
        </div>

        {/* Stub teksta + činjenice + ulazi */}
        <div className="border-t border-ink/20 pt-8 md:col-span-4 md:mt-[6vh]">
          <p data-up className="text-lead leading-[1.7] opacity-80">
            Knauf ovlašteni distributer za suhu gradnju. Izolacija, veziva i oprema za montažu — za građevinske firme, izvođače radova i
            investitore, sa dostavom kamionom sa kranom.
          </p>
          <ol className="mt-10">
            {FACTS.map(([t, d], i) => (
              <li key={t} data-up className="grid grid-cols-[34px_1fr] gap-x-3 border-t border-ink/15 py-4">
                <span className="text-[11px] tabular-nums opacity-45">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="display block text-[18px]">{t}</span>
                  <span className="mt-1 block text-[11.5px] leading-[1.55] opacity-65">{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <div data-up data-delay="0.1" className="mt-8 flex flex-wrap gap-3">
            <Cta href="/portal" solid>
              B2B portal
            </Cta>
            <Cta href="/prodavnica">Maloprodaja</Cta>
          </div>
        </div>

        {/* Kolaž */}
        <div data-collage className="relative md:col-span-8 md:mt-[6vh]">
          <figure data-curtain data-parallax="8" className="relative aspect-[4/3] overflow-hidden bg-plate" data-cursor="Katalog">
            <img src="/editorial/materials-still.webp" alt="Ploče, profili i kamena vuna u praznoj betonskoj sobi" className="absolute inset-0 h-full w-full object-cover" />
          </figure>
          <figure
            data-small
            className="absolute -bottom-[8%] -left-[6%] hidden aspect-[2/3] w-[28%] overflow-hidden bg-plate shadow-[0_30px_60px_-30px_rgba(27,36,54,.45)] md:block"
          >
            <div data-curtain className="h-full w-full">
              <img src="/editorial/frame-rhythm.webp" alt="" className="h-full w-full object-cover" />
            </div>
          </figure>
          <figcaption data-up className="mt-6 flex items-center justify-between gap-3 text-[12.5px] md:mt-8 md:pl-[24%]">
            <span className="tabular-nums opacity-45">Fig. 01</span>
            <span className="opacity-70">Ploče, profili, vuna, veziva i spojnice — na jednom mjestu.</span>
          </figcaption>
        </div>
      </div>
    </section>
  )
}
