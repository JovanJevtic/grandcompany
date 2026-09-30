'use client'

import { Fragment, useEffect, useRef } from 'react'
import { preloadModule } from 'react-dom'
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

// Rečenica koja se na kraju hero-a (kad kamera izađe kroz prozor i vidi se opet nebo)
// polako ispisuje kao rukopis. Skrol je vozi: scena postavlja `--type-p` (0..1) na sekciju,
// a svako slovo ima svoj prag `--th` i pojavi se (mekano) tačno kad skrol stigne dotle.
const PHRASE = 'Gradimo, prodajemo i konstruišemo za budućnost.'
// Slova se drže u rečima (nowrap), da se reč nikad ne prelomi usred slova na uskom ekranu.
const WORDS = PHRASE.split(' ')
const TOTAL = [...PHRASE].length
let cursor = 0
const WORD_GLYPHS = WORDS.map((word) => {
  const glyphs = [...word].map((glyph) => ({ glyph, th: (cursor++ / TOTAL) * 0.94 }))
  cursor++ // razmak iza reči
  return glyphs
})

// Scena se pinuje, a iza nje je nebo u tri sloja: meko nebo, oblaci i grad u izmaglici.
// Slojevi se na skrol pomjeraju različitom brzinom (parallax, `--scene-progress`), a grad tone
// i nestaje dok kamera ulazi u gradilište.
// Ostatak visine je prazan prostor (story-immersion) kroz koji se animacija krana odigra.
export default function CraneHero() {
  const root = useRef<HTMLElement>(null)
  // Three.js (najveći fajl, ~680 KB) i scena se skidaju odmah sa HTML-om, a ne tek kad React
  // pokrene efekat ispod. URL-ovi moraju biti isti kao u importima (uključujući ?v=).
  preloadModule('/vendor/three.module.min.js')
  preloadModule('/crane/crane-scene.js?v=29')

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
          {/* Nebo ispod krana u tri sloja (nebo, oblaci, grad u izmaglici) sa parallaxom. Iza canvasa. */}
          <div className="scene-sky">
            <div className="sky-layer sky-base" />
            <div className="sky-layer sky-clouds" />
            <div className="sky-layer sky-city" />
          </div>

          <figure className="crane-viewport">
            <canvas />
          </figure>

          <div className="scene-caption">
            <span className="scene-meter">
              <i />
            </span>
          </div>

          <p className="story-type">
            {WORD_GLYPHS.map((glyphs, w) => (
              <Fragment key={w}>
                {w > 0 ? ' ' : null}
                <span className="story-word">
                  {glyphs.map(({ glyph, th }, i) => (
                    // Pragovi idu do 0.94; slovo se otkriva preko ~0.06, pa je sve gotovo do 1.
                    <span key={i} style={{ '--th': th.toFixed(4) } as React.CSSProperties}>
                      {glyph}
                    </span>
                  ))}
                </span>
              </Fragment>
            ))}
          </p>
        </div>

        <div className="story-content">
          {/* Scena je aria-hidden, pa rečenicu iznosimo i kao pravi tekst za čitače ekrana. */}
          <p className="sr-only">{PHRASE}</p>
          <section className="story-section story-opening">
            <div className="story-masthead">
              <span>Građevinski materijali &amp; logistika</span>
              <span>Banja Luka, BiH / od {COMPANY.founded}.</span>
            </div>
          </section>

          <div className="story-immersion" aria-hidden="true" />
          {/* Dodatni skrol na kraju: scena ostaje pinovana na nebu dok se rečenica ispisuje,
              pa još kratko miruje da se ne "proleti" pored nje. Scena ga isključuje iz svog računa. */}
          <div className="story-outro" aria-hidden="true" />
        </div>
      </section>
    </>
  )
}
