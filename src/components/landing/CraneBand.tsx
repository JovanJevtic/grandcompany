'use client'

import { useRef } from 'react'
import { CRANE_RECOMMEND_OVER_KG, DELIVERY_ZONES, FREE_DELIVERY_OVER, ORDER_STEPS } from '@/gc/gc'
import { drawOnScroll } from '@/lib/draw'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import { money } from '@/lib/shop'
import StepBand from '@/components/ui/StepBand'

// Isporuka kao crtež koji vozi skrol: kamion izbaci stope, kran se podigne i izvuče, paleta
// preleti skelu i spusti se na ploču etaže, pa se kuka vrati. Sekcija je pinovana dok traje.
// Ruka krana se računa (ugao, izvlačenje, sajla), pa sajla uvijek visi vertikalno i paleta
// sleti tačno na ploču. Lijevo se paralelno pale četiri koraka narudžbe (ORDER_STEPS).

const PIVOT = { x: 153, y: 322 }
const BOOM = 260
const LAND = { x: 560, top: 150 } // vrh palete kad stoji na ploči treće etaže (y = 180)

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const deg = Math.PI / 180

// Stanje krana za napredak p (0..1).
function rig(p: number) {
  const legs = ease(seg(p, 0, 0.12)) * 30
  const swing = ease(seg(p, 0.2, 0.6))
  const angle = mix(2, 32, swing)
  const ext = mix(0, 220, swing)
  const len = BOOM + ext
  const tip = { x: PIVOT.x + len * Math.cos(angle * deg), y: PIVOT.y - len * Math.sin(angle * deg) }
  // sajla: podigni paletu sa kamiona, drži tokom okreta, spusti na ploču, pa se kuka vrati
  let cable = mix(19, 12, ease(seg(p, 0.12, 0.2)))
  const landCable = LAND.top - tip.y
  cable = mix(cable, landCable, ease(seg(p, 0.6, 0.84)))
  const released = p > 0.86
  cable = mix(cable, 26, ease(seg(p, 0.86, 1)))
  const pallet = released ? { x: LAND.x, y: LAND.top } : { x: tip.x, y: tip.y + cable }
  return { legs, angle, ext, tip, cable, pallet, step: Math.min(3, Math.floor(p * 4)) }
}

function Drawing() {
  const rungs = [380, 340, 300, 260, 220, 180]
  return (
    <svg viewBox="0 0 800 460" className="art h-auto w-full" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="square" aria-hidden>
      {/* tlo */}
      <path data-d={0} d="M0 420H800" />
      <path data-d={2} opacity={0.5} d={Array.from({ length: 40 }, (_, i) => `M${i * 20 + 4} 428l8 -8`).join('')} />

      {/* zgrada: stepenasta masa, tri etaže i viši dio desno */}
      <path data-d={0} d="M490 420V172H640V92H780V420" />
      <path data-d={1} d="M490 340H780M490 260H780M490 180H640M640 180H780M640 100H780M490 348H780M490 268H780M490 188H640" opacity={0.8} />
      <path data-d={2} d="M565 420V188M640 420V100M710 420V100" opacity={0.6} />
      <path data-d={2} d="M520 300h30v-24h-30zM600 300h24v-24h-24zM670 300h24v-24h-24zM730 300h24v-24h-24zM670 220h24v-24h-24zM730 220h24v-24h-24zM670 140h24v-24h-24zM730 140h24v-24h-24z" opacity={0.6} />

      {/* skela uz zgradu */}
      <path data-d={1} d="M468 420V168M488 420V168" />
      <path data-d={2} opacity={0.7} d={rungs.map((y) => `M468 ${y}H488`).join('') + rungs.slice(1).map((y, i) => `M468 ${rungs[i]}L488 ${y}`).join('')} />

      {/* kamion */}
      <path data-d={0} d="M60 386V318L80 296H132V386ZM60 386H450V372H140M180 372V362H450V372" />
      <path data-d={1} d="M70 330V318L84 304H122V330Z" />
      {[100, 330, 390].map((x) => (
        <g key={x}>
          <circle data-d={0} cx={x} cy={402} r={18} fill="var(--art-fill)" />
          <circle data-d={2} cx={x} cy={402} r={6} />
        </g>
      ))}
      {/* stub krana na kamionu */}
      <path data-d={1} d="M138 372V316H168V372" />

      {/* hidraulične stope: izvlače se do tla */}
      <g data-legs>
        <path d="M176 386v2M440 386v2" />
      </g>

      {/* ruka krana (pozicije postavlja JS) */}
      <line data-ram x1={153} y1={362} x2={153} y2={330} strokeWidth={2} />
      <g data-boom transform={`translate(${PIVOT.x} ${PIVOT.y}) rotate(-2)`}>
        <rect x={-6} y={-8} width={BOOM + 6} height={16} fill="var(--art-fill)" />
        <path d="M20 -8L40 8L60 -8L80 8L100 -8L120 8L140 -8L160 8L180 -8L200 8L220 -8L240 8" opacity={0.45} />
        <g data-tele>
          <rect x={40} y={-5} width={BOOM - 40} height={10} fill="var(--art-fill)" />
          <circle cx={BOOM} cy={0} r={5} fill="var(--art-fill)" />
        </g>
        <circle cx={0} cy={0} r={7} fill="var(--art-fill)" />
      </g>
      <line data-cable x1={0} y1={0} x2={0} y2={0} />

      {/* paleta sa pločama */}
      <g data-pallet>
        <path d="M-6 -6h12M0 -6v6" />
        <rect x={-34} y={0} width={68} height={20} fill="var(--art-fill)" />
        <path d="M-34 5H34M-34 10H34M-34 15H34M-12 0V20M12 0V20" opacity={0.55} />
        <rect x={-36} y={20} width={72} height={10} fill="var(--art-fill)" />
        <path d="M-30 20v10M0 20v10M30 20v10" opacity={0.7} />
      </g>

      {/* oznaka mjesta istovara */}
      <path data-mark d="M530 168h60M560 160v-10" strokeDasharray="4 4" opacity={0} />
    </svg>
  )
}

export default function CraneBand() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const stage = el.querySelector<HTMLElement>('[data-stage]')!
      const svg = stage.querySelector('svg')!
      const q = <T extends Element>(s: string) => svg.querySelector<T>(s)!
      const boom = q<SVGGElement>('[data-boom]')
      const tele = q<SVGGElement>('[data-tele]')
      const cable = q<SVGLineElement>('[data-cable]')
      const pallet = q<SVGGElement>('[data-pallet]')
      const ram = q<SVGLineElement>('[data-ram]')
      const legs = q<SVGGElement>('[data-legs] path')
      const mark = q<SVGPathElement>('[data-mark]')
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]', el)
      const hud = el.querySelector<HTMLElement>('[data-hud]')!

      const render = (p: number) => {
        const r = rig(p)
        boom.setAttribute('transform', `translate(${PIVOT.x} ${PIVOT.y}) rotate(${-r.angle})`)
        tele.setAttribute('transform', `translate(${r.ext} 0)`)
        cable.setAttribute('x1', r.tip.x.toFixed(1))
        cable.setAttribute('y1', r.tip.y.toFixed(1))
        cable.setAttribute('x2', r.tip.x.toFixed(1))
        cable.setAttribute('y2', (r.tip.y + r.cable - 6).toFixed(1))
        pallet.setAttribute('transform', `translate(${r.pallet.x.toFixed(1)} ${r.pallet.y.toFixed(1)})`)
        // hidraulični cilindar: od stuba do tačke na ruci (90 px od zgloba)
        const a = r.angle * deg
        ram.setAttribute('x2', (PIVOT.x + 90 * Math.cos(a) + 8 * Math.sin(a)).toFixed(1))
        ram.setAttribute('y2', (PIVOT.y - 90 * Math.sin(a) + 8 * Math.cos(a)).toFixed(1))
        legs.setAttribute('d', `M176 386v${r.legs}M168 ${386 + r.legs}h16M440 386v${r.legs}M432 ${386 + r.legs}h16`)
        mark.setAttribute('opacity', p > 0.55 && p < 0.9 ? '0.8' : '0')
        steps.forEach((s, i) => s.toggleAttribute('data-on', i === r.step))
        hud.textContent = `Ugao ${Math.round(r.angle)}° · Korak 0${r.step + 1}/04`
      }

      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce, mobile } = ctx.conditions as { reduce: boolean; mobile: boolean }
        revealChars(el.querySelector('[data-head]')!, reduce, 'top 80%')
        drawOnScroll(svg, reduce, { trigger: stage, start: 'top 75%', duration: 1.4 })
        if (reduce) {
          render(1)
          steps.forEach((s) => s.setAttribute('data-on', ''))
          return
        }
        render(0)
        ScrollTrigger.create({
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * (mobile ? 1.6 : 2.4)}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress),
        })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <StepBand id="isporuka" profile="diag" steps={12} aria-label="Isporuka kamionom sa kranom" className="[--art-fill:var(--navy)]">
        <div data-stage className="flex min-h-dvh flex-col justify-center gap-[5dvh] px-5 py-[8dvh] md:grid md:grid-cols-12 md:items-center md:gap-[2vw] md:px-[3.05vw]">
          <div className="md:col-span-4">
            <p className="flex justify-between border-t border-bg/40 pt-3 font-mono text-micro uppercase tracking-wider">
              <span>04 — Isporuka</span>
              <span>Vlastiti kamioni</span>
            </p>
            <h2 data-head className="invisible mt-[4dvh] text-[clamp(40px,5vw,96px)] font-bold uppercase leading-[0.88] tracking-[-0.02em]">
              Spuštamo je na etažu
            </h2>
            <ol className="mt-[5dvh] grid gap-4">
              {ORDER_STEPS.map(([title, text], i) => (
                <li
                  key={title}
                  data-step
                  className="group grid grid-cols-[2.2em_1fr] gap-x-3 opacity-35 transition-opacity duration-500 data-[on]:opacity-100"
                >
                  <span className="font-mono text-micro tabular-nums">0{i + 1}</span>
                  <span className="flex items-center gap-2 font-mono text-micro uppercase tracking-wider">
                    <i className="size-2 bg-bg/30 transition-colors group-data-[on]:bg-accent" />
                    {title}
                  </span>
                  <span className="col-start-2 mt-1 hidden text-[clamp(13px,1vw,16px)] font-medium leading-snug opacity-80 md:block">{text}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="md:col-span-8">
            <Drawing />
            <p data-hud className="mt-3 text-right font-mono text-[11px] uppercase tracking-wider text-accent" aria-hidden>
              Ugao 2° · Korak 01/04
            </p>
          </div>
        </div>

        {/* Zone dostave: cijene iz kataloga firme */}
        <div className="px-5 pb-[10dvh] md:px-[3.05vw]">
          <table className="w-full border-collapse font-mono text-micro uppercase">
            <caption className="sr-only">Cijene dostave po zonama</caption>
            <thead>
              <tr className="border-b border-bg/40 text-left text-bg/60">
                <th className="py-3 font-medium">Zona</th>
                <th className="py-3 text-right font-medium">Standardna</th>
                <th className="hidden py-3 text-right font-medium md:table-cell">Kran: prevoz</th>
                <th className="py-3 text-right font-medium">Kran: rad</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERY_ZONES.map((z) => (
                <tr key={z.id} className="border-b border-bg/15">
                  <td className="py-3 pr-4">{z.label}</td>
                  <td className="py-3 text-right tabular-nums">{money(z.standard)}</td>
                  <td className="hidden py-3 text-right tabular-nums md:table-cell">{money(z.kranTransport)}</td>
                  <td className="py-3 text-right tabular-nums">{money(z.kranWork)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 flex flex-wrap justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-bg/60">
            <span>Standardna dostava bez naknade preko {money(FREE_DELIVERY_OVER)}</span>
            <span>Kran preporučujemo za teret preko {CRANE_RECOMMEND_OVER_KG.toLocaleString('de-DE')} kg</span>
          </p>
        </div>
      </StepBand>
    </div>
  )
}
