'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    /** Ručka koju ostavlja public/kaolin/kaolin-object.js da bi scena mogla da se ugasi. */
    __gcKaolin?: { dispose: () => void } | null
    /** Da li je objekat spreman (koristi ga ostatak stranice ako zatreba). */
    __gcKaolinReady?: boolean
    /** Lenis instanca koju SmoothScroll ostavlja za programsko skrolovanje (scrubber). */
    __gcLenis?: { scrollTo: (y: number, o?: Record<string, unknown>) => void } | null
  }
}

// Transformacija je ES modul u public/kaolin (isti pristup kao i 3D scena krana): ne ulazi
// u JS bundle, zadržava relativne putanje do Three.js-a, a sam pronalazi svoj markup i
// vezuje skrol, scrubber liniju i dugme.
const SCRIPT = '/kaolin/kaolin-object.js'

// Deset rendera kaolina (kamen -> kristal -> glina -> lopta -> porcelan) koji se na skrol
// glatko prelivaju jedan u drugi (dissolve kroz šum). Slike su poravnate unaprijed, pa
// objekat ne mijenja ni veličinu ni mjesto.
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
        <canvas data-kaolin-canvas aria-hidden="true" />

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
