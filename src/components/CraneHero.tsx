'use client'

import { useEffect, useRef } from 'react'
import { COMPANY } from '@/gc/gc'

declare global {
  interface Window {
    /** Ručka koju ostavlja public/crane/crane-hero.js da bi scena mogla da se ugasi. */
    __gcCrane?: { dispose: () => void } | null
    /** Da li je 3D scena spremna. Uvodni splash čeka ovaj flag prije nego pusti animaciju. */
    __gcCraneReady?: boolean
  }
}

// 3D scena krana (Three.js) je preuzeta sa grandcompany sajta i stoji u public/crane/.
// Učitava se kao ES modul iz `public` foldera, a ne kroz bundler: tako moduli zadržavaju
// iste relativne putanje do Three.js-a i ne ulaze u JS bundle ostatka sajta.
const SCRIPT = '/crane/crane-hero.js'

// Scena se pinuje, a preko nje je nebo: plavo-sivi gradijent, bijela skica grada uz dno i
// razbacani oblaci. Skica se zamućuje i povlači dok kamera ulazi u kadar (`--scene-progress`).
// Ostatak visine je prazan prostor (story-immersion) kroz koji se animacija krana odigra.
export default function CraneHero() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'module'
    // Jedinstven upit po montaži: ES modul sa istim URL-om se drugi put ne izvršava,
    // pa bi pri povratku na početnu (klijentska navigacija) scena ostala prazna.
    script.src = `${SCRIPT}?m=${Date.now()}`
    document.body.appendChild(script)

    return () => {
      script.remove()
      window.__gcCrane?.dispose()
    }
  }, [])

  return (
    <>
      {/* Prazan pojas: scena počinje tačno ispod fiksnog wordmarka. */}
      <div className="story-spacer" aria-hidden />

      <section id="hero" ref={root} className="construction-story">
        <div className="crane-stage" aria-hidden="true">
          {/* Nebo ispod krana: gradijent + bijele skice + oblaci. Sve je iza canvasa. */}
          <div className="scene-sky">
            <div className="sky-line" />
            <div className="sky-clouds">
              <span className="sky-cloud sky-cloud--a" />
              <span className="sky-cloud sky-cloud--b" />
              <span className="sky-cloud sky-cloud--c" />
            </div>
          </div>

          <figure className="crane-viewport">
            <canvas />
          </figure>

          <div className="scene-caption">
            <span className="scene-meter">
              <i />
            </span>
          </div>
        </div>

        <div className="story-content">
          <section className="story-section story-opening">
            <div className="story-masthead">
              <span>Građevinski materijali &amp; logistika</span>
              <span>Banja Luka, BiH / od {COMPANY.founded}.</span>
            </div>
          </section>

          <div className="story-immersion" aria-hidden="true" />
        </div>
      </section>
    </>
  )
}
