'use client'

import { Fragment, useEffect, useRef } from 'react'
import { preloadModule } from 'react-dom'

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
// polako ispisuje, slovo po slovo. Skrol je vozi: scena postavlja `--type-p` (0..1) na sekciju,
// a svako slovo ima svoj prag `--th` i pojavi se (mekano) tačno kad skrol stigne dotle.
const PHRASE = 'Gradimo, prodajemo i konstruišemo za budućnost.'
// Slova se drže u rečima (nowrap), da se reč nikad ne prelomi usred slova na uskom ekranu.
const WORDS = PHRASE.split(' ')
const TOTAL = [...PHRASE].length
let cursor = 0
// Demo font nema slova sa dijakriticima: ispisujemo osnovno slovo iz fonta, a znak iznad
// (kvačicu/akcenat) dodaje CSS. Kad se kupi puna verzija fonta, ovo se može isključiti.
const DEMO_FONT_WITHOUT_DIACRITICS = true
const MARKS: Record<string, [string, string]> = {
  š: ['s', 'ˇ'], č: ['c', 'ˇ'], ž: ['z', 'ˇ'], ć: ['c', '´'], đ: ['d', '-'],
}
const WORD_GLYPHS = WORDS.map((word) => {
  const glyphs = [...word].map((glyph) => {
    const mark = DEMO_FONT_WITHOUT_DIACRITICS ? MARKS[glyph] : undefined
    return { glyph: mark ? mark[0] : glyph, mark: mark?.[1], th: (cursor++ / TOTAL) * 0.94 }
  })
  cursor++ // razmak iza reči
  return glyphs
})

// Scena se pinuje, a preko nje je nebo: plavo-sivi gradijent, bijela skica grada uz dno i
// razbacani oblaci. Skica se zamućuje i povlači dok kamera ulazi u kadar (`--scene-progress`).
// Ostatak visine je prazan prostor (story-immersion) kroz koji se animacija krana odigra.
export default function CraneHero() {
  const root = useRef<HTMLElement>(null)
  // Three.js (najveći fajl, ~680 KB) i scena se skidaju odmah sa HTML-om, a ne tek kad React
  // pokrene efekat ispod. URL-ovi moraju biti isti kao u importima (uključujući ?v=).
  preloadModule('/vendor/three.module.min.js')
  preloadModule('/crane/crane-scene.js?v=35')

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

  // Parallax pozadine za mišem: --mx / --my (-1..1) se mekano približavaju poziciji kursora.
  useEffect(() => {
    const el = root.current
    // Varijable idu na sam sloj neba (ne na cijeli hero), da promjena ne preračunava stilove cijele sekcije.
    const sky = el?.querySelector<HTMLElement>('.scene-sky')
    if (!el || !sky || !window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const target = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    let raf = 0
    const step = () => {
      cur.x += (target.x - cur.x) * 0.05
      cur.y += (target.y - cur.y) * 0.05
      sky.style.setProperty('--mx', cur.x.toFixed(4))
      sky.style.setProperty('--my', cur.y.toFixed(4))
      raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.001 ? requestAnimationFrame(step) : 0
    }
    const onMove = (e: PointerEvent) => {
      if (document.documentElement.hasAttribute('data-past-hero')) return
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = (e.clientY / window.innerHeight) * 2 - 1
      if (!raf) raf = requestAnimationFrame(step)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      {/* Prazan pojas: scena počinje tačno ispod fiksnog wordmarka. */}
      <div className="story-spacer" aria-hidden />

      <section id="hero" ref={root} className="construction-story">
        <div className="crane-stage" aria-hidden="true">
          {/* Nebo iza krana u tri sloja (nebo, grad u magli, magla naprijed) — svaki se pomjera
              svojom brzinom na skrol i za mišem. Dok se kran ne učita, preko svega stoji
              zamućena kopija ("veo"); kad je scena spremna, veo se pretopi i slojevi se smire. */}
          <div className="scene-sky">
            <div className="sky-stack">
              <div className="sky-layer sky-back" />
              <div className="sky-layer sky-city" />
              <div className="sky-layer sky-city sky-city--soft" />
              <div className="sky-layer sky-fog" />
            </div>
            {/* Završni kadar (rečenica "Gradimo, prodajemo..."): čisto nebo bez grada i magle */}
            <div className="sky-clean" />
            <div className="sky-veil" />
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
                  {glyphs.map(({ glyph, mark, th }, i) => (
                    // Pragovi idu do 0.94; slovo se otkriva preko ~0.06, pa je sve gotovo do 1.
                    <span
                      key={i}
                      className={mark ? 'story-mark' : undefined}
                      data-mark={mark}
                      style={{ '--th': th.toFixed(4) } as React.CSSProperties}
                    >
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
