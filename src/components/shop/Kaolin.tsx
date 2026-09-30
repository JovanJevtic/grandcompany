'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    /** Ručka koju ostavlja public/kaolin/kaolin-stages.js da bi se sekcija mogla ugasiti. */
    __gcKaolin?: { dispose: () => void } | null
    /** Da li je objekat spreman (koristi ga ostatak stranice ako zatreba). */
    __gcKaolinReady?: boolean
    /** Lenis instanca koju SmoothScroll ostavlja za programsko skrolovanje (scrubber). */
    __gcLenis?: { scrollTo: (y: number, o?: Record<string, unknown>) => void } | null
  }
}

// Prelaze vodi mali ES modul u public/kaolin (isti pristup kao scena krana): ne ulazi u
// JS bundle, a sam pronalazi svoj markup i vezuje skrol, scrubber liniju i dugme.
const SCRIPT = '/kaolin/kaolin-stages.js'

// Devet rendera, od sirovog kamena do umivaonika sa slavinom. Slike su unaprijed poravnate
// (isto težište, isti pod), pa se na skrol pretapaju bez skakanja. `w` je širina objekta
// u slici (0..1) — po njoj se sjenka na podu širi i skuplja.
const STAGES = [
  { alt: 'Sirovi kaolin, kamen', w: 0.567 },
  { alt: 'Napukli kamen', w: 0.516 },
  { alt: 'Razlomljeni kristali', w: 0.595 },
  { alt: 'Grudva gline', w: 0.544 },
  { alt: 'Oblikovana kugla', w: 0.509 },
  { alt: 'Glatka kugla', w: 0.518 },
  { alt: 'Činija', w: 0.612 },
  { alt: 'Oblikovana forma', w: 0.577 },
  { alt: 'Umivaonik od porcelana sa mesinganom slavinom', w: 0.596 },
]

export default function Kaolin() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'module'
    // Jedinstven upit po montaži: isti ES modul se drugi put ne izvršava.
    script.src = `${SCRIPT}?m=${Date.now()}`
    document.body.appendChild(script)

    return () => {
      script.remove()
      window.__gcKaolin?.dispose()
    }
  }, [])

  return (
    <section
      ref={root}
      id="kaolin"
      data-kaolin
      className="kaolin"
      aria-label="Od sirovog kaolina do porcelana"
    >
      <div className="kaolin-stage">
        <figure className="kaolin-object" aria-hidden="true">
          <span className="kaolin-shadow" data-kaolin-shadow />
          <div className="kaolin-stack" data-kaolin-stack>
            {STAGES.map((stage, i) => {
              const n = String(i + 1).padStart(2, '0')
              return (
                // eslint-disable-next-line @next/next/no-img-element -- modul upravlja slikama direktno
                <img
                  key={n}
                  src={`/kaolin/stages/stage-${n}.webp`}
                  srcSet={`/kaolin/stages/stage-${n}-m.webp 700w, /kaolin/stages/stage-${n}.webp 1400w`}
                  sizes="(max-width: 767px) 100vw, min(94vw, 100vh)"
                  width={1400}
                  height={1000}
                  alt=""
                  data-w={stage.w}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                />
              )
            })}
          </div>
        </figure>
        {/* Za čitače ekrana: šta sekcija pokazuje, bez oslanjanja na slike. */}
        <p className="sr-only">{STAGES.map((s) => s.alt).join(' → ')}</p>

        {/* Linija za modeliranje: povlačenjem se prolazi kroz faze; dugme pušta automatski hod. */}
        <div className="kaolin-bar">
          <button
            type="button"
            className="kaolin-play"
            data-kaolin-play
            aria-pressed="false"
            aria-label="Pusti transformaciju"
          >
            <span />
          </button>
          <div
            className="kaolin-track"
            data-kaolin-track
            role="slider"
            aria-label="Faza materijala"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <span className="kaolin-knob" data-kaolin-knob />
          </div>
        </div>
      </div>
    </section>
  )
}
