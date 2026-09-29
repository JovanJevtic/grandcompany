'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'

// Deset stanja kaolina, od sirovog kamena do uglačanog porcelana.
// `ratio` = visina slike / visina samog objekta na njoj, a `dx`/`dy` pomjeraju sliku
// da centar objekta padne u centar kadra. Vrijednosti su izmjerene iz alpha kanala
// (vidi skript koja je pripremila WebP u public/kaolin), pa su sva stanja iste veličine.
type State = { src: string; ratio: number; dx: number; dy: number }

const STATES: State[] = [
  { src: '/kaolin/01.webp', ratio: 1.2221, dx: -1.705, dy: -2.338 },
  { src: '/kaolin/02.webp', ratio: 1.0657, dx: -2.751, dy: -2.072 },
  { src: '/kaolin/03.webp', ratio: 1.0549, dx: -0.03, dy: -1.169 },
  { src: '/kaolin/04.webp', ratio: 1.0955, dx: -1.346, dy: -2.497 },
  { src: '/kaolin/05.webp', ratio: 1.1434, dx: -1.316, dy: -2.71 },
  { src: '/kaolin/06.webp', ratio: 1.0657, dx: -0.867, dy: -2.71 },
  { src: '/kaolin/07.webp', ratio: 1.3033, dx: -1.226, dy: -3.613 },
  { src: '/kaolin/08.webp', ratio: 1.4433, dx: 0.03, dy: -1.594 },
  { src: '/kaolin/09.webp', ratio: 1.5657, dx: 0.299, dy: -0.903 },
  { src: '/kaolin/10.webp', ratio: 1.6509, dx: -0.269, dy: -3.082 },
]

// Prva i zadnja petina skrola su "prazan hod" — objekat miruje dok sekcija ulazi i izlazi.
const LEAD = 0.1
const TAIL = 0.1
// Koliki dio koraka između dva stanja traje prelivanje (ostatak je držanje).
const FADE_SHARE = 0.75

export default function Kaolin() {
  const root = useRef<HTMLElement>(null)
  const [near, setNear] = useState(false)

  // Slike se učitavaju tek kad se sekcija približi (dvije visine ekrana prije),
  // da ne troše početno učitavanje stranice, a opet budu spremne prije skrola.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        io.disconnect()
      },
      { rootMargin: '150% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useGSAP(
    () => {
      const el = root.current!
      const layers = gsap.utils.toArray<HTMLElement>('[data-state]', el)
      const shapes = gsap.utils.toArray<HTMLElement>('[data-shape]', el)
      const object = el.querySelector<HTMLElement>('[data-object]')!
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }

        // Bez animacije ostaje samo završno stanje.
        if (reduce) {
          gsap.set(layers, { autoAlpha: 0 })
          gsap.set(layers[layers.length - 1], { autoAlpha: 1 })
          return
        }

        const step = (1 - LEAD - TAIL) / (layers.length - 1)
        const fade = step * FADE_SHARE

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        })

        // Cijeli objekat se kroz sekciju jedva primjetno pokrene: malo poraste,
        // podigne se i nagne — kao da se jedan predmet okreće, a ne mijenja sliku.
        tl.fromTo(
          object,
          { scale: 0.94, yPercent: 2.4, rotate: -1.4 },
          { scale: 1.05, yPercent: -2.4, rotate: 1.4, duration: LEAD + 1 - LEAD - TAIL + TAIL },
          0,
        )

        layers.forEach((layer, i) => {
          if (i === 0) {
            gsap.set(layer, { autoAlpha: 1 })
            return
          }
          const at = LEAD + (i - 1) * step
          // Pravi prelaz: novo stanje ulazi tačno dok prethodno izlazi, pa se slike
          // ne slažu jedna preko druge (inače ivice donjih proviruju kroz gornju).
          tl.fromTo(layer, { autoAlpha: 0 }, { autoAlpha: 1, duration: fade }, at)
          tl.to(layers[i - 1], { autoAlpha: 0, duration: fade }, at)
          // Novo stanje sleće u kadar: blagi zum i pomak koji se smire.
          tl.fromTo(shapes[i], { scale: 1.05, yPercent: 2.2 }, { scale: 1, yPercent: 0, duration: fade }, at)
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="kaolin" className="kaolin" aria-label="Od sirovog kaolina do porcelana">
      <div className="kaolin-stage">
        <div className="kaolin-object" data-object>
          {STATES.map((state, i) => (
            <div
              key={state.src}
              data-state
              className="kaolin-state"
              // Prije hidratacije vidljivo je samo prvo stanje, da ne blesne zadnje.
              style={i === 0 ? undefined : { opacity: 0 }}
            >
              <div className="kaolin-shape" data-shape style={{ ['--ratio' as string]: state.ratio }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={state.src}
                  alt=""
                  width={1672}
                  height={941}
                  loading={near ? 'eager' : 'lazy'}
                  fetchPriority="low"
                  decoding="async"
                  style={{ transform: `translate(${state.dx}%, ${state.dy}%)` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
