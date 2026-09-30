'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'

// Stepenasta traka: sekcija čija su gornja i donja ivica stepenice ("pikselizovana dijagonala"),
// kao na referencama. Stepenice su kolone (div-ovi) iznad i ispod sekcije; skrol ih izvlači
// jednu po jednu (scaleY 0 → 1), pa ravna ivica naraste u stepenište kad traka uđe u ekran.
//
// Ivice leže u margini sekcije (margin-block = depth), pa ne prekrivaju susjedne sekcije.
//
// profile:
//   diag      — gore lijevo najviše, dolje desno najniže (paralelogram)
//   diag-rev  — ogledalo: gore desno najviše
//   valley    — gornja ivica se spušta ka sredini, donja visi u sredini (V)
//   flat-top  — ravno gore, stepenice samo dolje (za prvu traku ispod herosa)

export type StepProfile = 'diag' | 'diag-rev' | 'valley' | 'flat-top'
export type StepTone = 'navy' | 'bg'

// Visine kolona (0..1) za gornju i donju ivicu.
export function stepHeights(profile: StepProfile, n: number) {
  const top: number[] = []
  const bottom: number[] = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1)
    // stepenice nikad nisu nula: i najniža kolona malo viri, kao na referenci
    const lo = 1 / (n + 1)
    const v = Math.abs(2 * t - 1)
    if (profile === 'diag') {
      top.push(lo + (1 - lo) * (1 - t))
      bottom.push(lo + (1 - lo) * t)
    } else if (profile === 'diag-rev') {
      top.push(lo + (1 - lo) * t)
      bottom.push(lo + (1 - lo) * (1 - t))
    } else if (profile === 'valley') {
      top.push(lo + (1 - lo) * v)
      bottom.push(lo + (1 - lo) * (1 - v))
    } else {
      top.push(0)
      bottom.push(lo + (1 - lo) * t)
    }
  }
  return { top, bottom }
}

type Props = {
  children: React.ReactNode
  profile?: StepProfile
  tone?: StepTone
  /** broj stepenica (kolona) na desktopu; na uskom ekranu ide polovina */
  steps?: number
  /** visina stepeništa (CSS dužina) */
  depth?: string
  id?: string
  className?: string
  as?: 'section' | 'div'
  'aria-label'?: string
}

const FILL: Record<StepTone, string> = { navy: 'bg-navy', bg: 'bg-bg' }
const TEXT: Record<StepTone, string> = { navy: 'text-bg', bg: 'text-ink' }

export default function StepBand({
  children,
  profile = 'diag',
  tone = 'navy',
  steps = 10,
  depth = 'clamp(90px, 16vh, 200px)',
  id,
  className = '',
  as: Tag = 'section',
  ...rest
}: Props) {
  const root = useRef<HTMLElement>(null)
  const { top, bottom } = stepHeights(profile, steps)

  useGSAP(
    () => {
      const el = root.current!
      const tops = gsap.utils.toArray<HTMLElement>('[data-step-top]', el)
      const bots = gsap.utils.toArray<HTMLElement>('[data-step-bottom]', el)
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        if (reduce) {
          gsap.set([...tops, ...bots], { scaleY: 1 })
          return
        }
        // Svaka kolona ima svoj odsječak skrola: najviša kreće prva, najniža zadnja. `steps(5)`
        // daje pikselizovan rast (skokovi, ne glatko), kao da se stepenište slaže od blokova.
        const grow = (cols: HTMLElement[], hs: number[], edge: 'top' | 'bottom') =>
          cols.forEach((c, i) => {
            const lag = (1 - hs[i]) * 22 // procenti visine ekrana
            gsap.fromTo(
              c,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: 'steps(5)',
                scrollTrigger: {
                  trigger: el,
                  start: `${edge} ${100 - lag}%`,
                  end: `${edge} ${62 - lag}%`,
                  scrub: 0.4,
                },
              },
            )
          })
        grow(tops, top, 'top')
        grow(bots, bottom, 'bottom')
      })
    },
    { scope: root },
  )

  const col = 'flex-1'
  return (
    <Tag
      ref={root as React.Ref<HTMLElement & HTMLDivElement>}
      id={id}
      data-step-band={tone}
      className={`relative z-[5] ${FILL[tone]} ${TEXT[tone]} ${className}`}
      style={{ marginBlock: profile === 'flat-top' ? `0 ${depth}` : `${depth}` }}
      {...rest}
    >
      {profile !== 'flat-top' && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[calc(100%-1px)] flex items-end" style={{ height: depth }}>
          {top.map((h, i) => (
            <span
              key={i}
              data-step-top
              className={`${col} ${FILL[tone]} ${i % 2 && steps > 6 ? 'max-md:hidden' : ''}`}
              style={{ height: `${h * 100}%`, transformOrigin: '50% 100%' }}
            />
          ))}
        </div>
      )}
      {children}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[calc(100%-1px)] flex items-start" style={{ height: depth }}>
        {bottom.map((h, i) => (
          <span
            key={i}
            data-step-bottom
            className={`${col} ${FILL[tone]} ${i % 2 && steps > 6 ? 'max-md:hidden' : ''}`}
            style={{ height: `${h * 100}%`, transformOrigin: '50% 0%' }}
          />
        ))}
      </div>
    </Tag>
  )
}
