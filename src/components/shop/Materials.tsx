'use client'

import { useState } from 'react'
import { resetFilters } from '@/lib/cart'
import { TONES } from '@/lib/reveal'
import type { CategoryId } from '@/lib/shop'
import { useScrollTo } from '@/lib/useScrollTo'
import SectionHead from './SectionHead'

// Opisi su opšti, bez brojki i garancija. Tehničke podatke i listove daje klijent za svaki artikal posebno.
const MATERIALS: {
  id: string
  name: string
  category: CategoryId
  intro: string
  uses: string[]
  traits: string[]
}[] = [
  {
    id: 'gips',
    name: 'Gips-karton',
    category: 'suha-gradnja',
    intro: 'Ploče sa gipsanim jezgrom u kartonskom omotaču. Čista i brza gradnja pregradnih zidova, plafona i obloga.',
    uses: ['Pregradni zidovi', 'Spušteni plafoni', 'Obloge potkrovlja'],
    traits: ['Standardna ploča', 'Vlagootporna za kupatila', 'Protivpožarna ploča'],
  },
  {
    id: 'vuna',
    name: 'Kamena vuna',
    category: 'kamena-vuna',
    intro: 'Izolacija od vlakana kamena. Čuva toplotu, prigušuje buku i ne gori.',
    uses: ['Fasade', 'Kosi krov i potkrovlje', 'Pregradni zidovi'],
    traits: ['Toplotna izolacija', 'Zvučna izolacija', 'Negorivo vlakno'],
  },
  {
    id: 'drvo',
    name: 'Drvo',
    category: 'drvo',
    intro: 'Rezana građa i ploče za krovne konstrukcije, podove i oplate.',
    uses: ['Krovna konstrukcija', 'Podovi i oplate', 'Potkonstrukcija'],
    traits: ['Letve i daske', 'OSB ploče', 'Rezanje po dogovoru'],
  },
  {
    id: 'sanitarija',
    name: 'Sanitarna oprema',
    category: 'sanitarna',
    intro: 'Keramika i armatura za kupatilo: umivaonici, WC šolje i baterije.',
    uses: ['Kupatila', 'Sanitarni čvorovi', 'Adaptacije'],
    traits: ['Sanitarna keramika', 'Hromirane baterije', 'Uz stručan savjet pri izboru'],
  },
]

export default function Materials() {
  const [active, setActive] = useState(0)
  const scrollTo = useScrollTo()
  const m = MATERIALS[active]

  return (
    <section id="materijali" data-spy className="gutter scroll-mt-[var(--bar)] py-[14dvh]">
      <SectionHead
        no="05"
        label="Materijali"
        title="Znajte šta ugrađujete"
        lead="Od čega je napravljeno, gdje se koristi i po čemu se razlikuje."
        meta={`${MATERIALS.length} grupe`}
      />

      <div className="mt-[8dvh] grid gap-8 md:grid-cols-12 md:gap-[1.5vw]">
        <div role="tablist" aria-label="Materijali" className="border-b-2 border-ink md:col-span-5 md:self-start">
          {MATERIALS.map((mat, i) => {
            const on = i === active
            return (
              <button
                key={mat.id}
                id={`mat-tab-${mat.id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="mat-panel"
                onClick={() => setActive(i)}
                className={`flex w-full items-baseline gap-4 border-t-2 border-ink px-3 py-5 text-left uppercase transition-colors duration-500 md:px-4 md:py-7 ${
                  on ? 'bg-ink text-bg' : 'hover:bg-ink/10'
                }`}
              >
                <span className="text-micro tabular-nums">0{i + 1}</span>
                <span className="text-[clamp(24px,3.2vw,56px)] leading-[0.95]">{mat.name}</span>
              </button>
            )
          })}
        </div>

        <div
          key={m.id}
          id="mat-panel"
          role="tabpanel"
          aria-labelledby={`mat-tab-${m.id}`}
          className="fade-up md:col-span-6 md:col-start-7"
        >
          <div className="aspect-[16/10] w-full" style={{ background: TONES[(active * 2 + 2) % TONES.length] }} />
          <p className="mt-6 max-w-[46ch] text-lead uppercase">{m.intro}</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              ['Primjena', m.uses],
              ['Osobine', m.traits],
            ].map(([label, list]) => (
              <div key={label as string}>
                <p className="text-micro uppercase text-ink/60">{label as string}</p>
                <ul className="mt-3 border-t-2 border-ink">
                  {(list as string[]).map((li) => (
                    <li key={li} className="border-b border-ink/25 py-2.5 text-small uppercase">
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                resetFilters({ category: m.category })
                scrollTo('prodavnica')
              }}
              className="border-2 border-ink px-4 py-3.5 text-micro uppercase transition-colors duration-300 hover:bg-ink hover:text-bg"
            >
              Pogledaj u prodavnici →
            </button>
            <button
              type="button"
              onClick={() => scrollTo('ponuda')}
              className="px-1 py-3.5 text-micro uppercase underline underline-offset-4"
            >
              Zatraži tehnički list
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
