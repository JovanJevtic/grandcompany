'use client'

import { useEffect, useRef } from 'react'
import { COMPANY } from '@/gc/gc'
import { useScrollTo } from '@/lib/useScrollTo'

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

// Scena se pinuje, a tekst je sveden na uvodnu rečenicu — ostatak visine je prazan prostor
// kroz koji se kran odigrava (story-immersion).
export default function CraneHero() {
  const root = useRef<HTMLElement>(null)
  const scrollTo = useScrollTo()

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
          <div className="scene-ambience">
            <span className="ambience-layer ambience-indigo" data-ambience />
            <span className="ambience-layer ambience-cobalt" data-ambience />
            <span className="ambience-layer ambience-champagne" data-ambience />
          </div>
          <figure className="crane-viewport">
            <div className="crane-poster" />
            <canvas />
          </figure>
          {/* Zatamnjenje ivica: tekst mora da ostane čitljiv preko svijetlih kadrova scene. */}
          <div className="scene-scrim" />
          <div className="scene-caption">
            <span>Stovarište i vozni park</span>
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

            <div className="story-copy">
              <p className="eyebrow">Dobri temelji za velike ideje.</p>
              <h1>Knauf suha gradnja i izolacija, kranom do etaže.</h1>
              <div className="story-actions">
                <button type="button" className="action-solid" onClick={() => scrollTo('namjena')}>
                  Pogledajte ponudu →
                </button>
                <a href={COMPANY.phoneLandlineHref} className="action-outline">
                  Pozovite {COMPANY.phoneLandline}
                </a>
              </div>
            </div>
          </section>

          <div className="story-immersion" aria-hidden="true" />
        </div>
      </section>
    </>
  )
}
