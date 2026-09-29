'use client'

import { useEffect, useRef } from 'react'
import { COMPANY } from '@/gc/gc'
import { useScrollTo } from '@/lib/useScrollTo'

declare global {
  interface Window {
    /** Ručka koju ostavlja public/crane/crane-hero.js da bi scena mogla da se ugasi. */
    __gcCrane?: { dispose: () => void } | null
  }
}

// 3D scena krana (Three.js) je preuzeta sa grandcompany sajta i stoji u public/crane/.
// Učitava se kao ES modul iz `public` foldera, a ne kroz bundler: tako moduli zadržavaju
// iste relativne putanje do Three.js-a i ne ulaze u JS bundle ostatka sajta.
const SCRIPT = '/crane/crane-hero.js'

// Scena se pinuje, a tekst prolazi pored nje. Sekcije ostaju u normalnom toku dokumenta.
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
          {/* Zatamnjenje ivica: tekst u lijevoj i desnoj koloni mora da ostane čitljiv preko svijetlih kadrova scene. */}
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
              <p className="story-lead opening-lead">
                Ploče, profili, kamena vuna, stiropor, ljepila i pribor. Vlastiti kamioni sa kranom
                spuštaju paletu na etažu ili skelu.
              </p>
              <div className="story-actions">
                <button type="button" className="action-solid" onClick={() => scrollTo('prodavnica')}>
                  Pogledaj katalog →
                </button>
                <a href={COMPANY.phoneLandlineHref} className="action-outline">
                  Pozovite {COMPANY.phoneLandline}
                </a>
              </div>
            </div>

            <aside className="story-aside story-intro-note" aria-label="Podrška za vaš projekat">
              <span className="intro-index" aria-hidden="true">
                G/01
              </span>
              <p className="eyebrow">Od plana do gradilišta</p>
              <h3>
                Vaša vizija.
                <br />
                Naša podrška.
              </h3>
              <p className="story-lead">
                Od prve ploče do posljednje palete. Uz vas, na svakoj etaži.
              </p>
              <button type="button" className="story-round-link" onClick={() => scrollTo('isporuka')}>
                <span>
                  Dostava
                  <br />
                  kranom
                </span>
                <b aria-hidden="true">↗</b>
              </button>
            </aside>
          </section>

          <section className="story-section story-materials">
            <div className="story-copy">
              <p className="eyebrow">01 / Materijali na jednom mjestu</p>
              <h2>
                Dobro počinje
                <br />
                pravim izborom.
              </h2>
              <p className="story-lead">
                Ploče, profili, izolacija i ljepila. Kompletni sistemi uz savjet ljudi koji poznaju
                materijal.
              </p>
              <div className="story-actions">
                <button type="button" className="action-outline" onClick={() => scrollTo('prodavnica')}>
                  Istražite materijale →
                </button>
              </div>
            </div>

            <aside className="story-aside" aria-label="Šta držimo na stovarištu">
              <p className="eyebrow">Spremno za vaš projekat</p>
              <h3>
                Sa stovarišta.
                <br />
                Pravo na gradilište.
              </h3>
              <ul className="story-list">
                <li>
                  <span>01</span>Knauf sistemi suhe gradnje
                </li>
                <li>
                  <span>02</span>Kamena vuna i stiropor
                </li>
                <li>
                  <span>03</span>Ljepila, veziva i pribor
                </li>
              </ul>
            </aside>
          </section>

          <section className="story-section story-delivery">
            <div className="story-copy">
              <p className="eyebrow">02 / Podrška do vaše etaže</p>
              <h2>
                Vi gradite.
                <br />
                Mi podižemo.
              </h2>
              <p className="story-lead">
                Od narudžbe do istovara. Dogovaramo prevoz i spuštamo palete tamo gdje vaš posao
                nastavlja.
              </p>
            </div>

            <aside className="story-aside" aria-label="Koraci dostave">
              <p className="eyebrow">Od narudžbe do istovara</p>
              <h3>
                Jasan dogovor.
                <br />
                Sigurna isporuka.
              </h3>
              <ul className="story-list">
                <li>
                  <span>01</span>Priprema materijala na stovarištu
                </li>
                <li>
                  <span>02</span>Dogovor termina i pristupa
                </li>
                <li>
                  <span>03</span>Dostava i istovar kranom
                </li>
              </ul>
              <div className="story-actions">
                <button type="button" className="action-solid" onClick={() => scrollTo('isporuka')}>
                  Sve o dostavi →
                </button>
              </div>
            </aside>
          </section>

          <div className="story-immersion" aria-hidden="true" />
        </div>
      </section>
    </>
  )
}
