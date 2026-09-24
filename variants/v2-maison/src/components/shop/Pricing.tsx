'use client'

import { useScrollTo } from '@/lib/useScrollTo'
import { OpenBox } from './Reveal'
import SectionHead from './SectionHead'

// Nazivi paketa i uslovi su probni. Bez izmišljenih procenata rabata: konkretne brojke daje klijent.
const PLANS = [
  {
    name: 'Kupac',
    price: 'Maloprodajne cijene',
    text: 'Za privatne kupce i manje radove.',
    points: ['Cijene kao u prodavnici', 'Savjet pri izboru materijala', 'Dostava ili preuzimanje'],
    cta: 'Počni kupovinu',
    target: 'prodavnica',
  },
  {
    name: 'Izvođač',
    price: 'Rabat prema obimu',
    text: 'Za izvođače radova koji redovno kupuju.',
    points: ['Poseban cjenovnik', 'Rezervacija robe za tekuće radove', 'Obračun prema predmjeru'],
    cta: 'Zatraži cjenovnik',
    target: 'ponuda',
    featured: true,
  },
  {
    name: 'Projekat',
    price: 'Ponuda po projektu',
    text: 'Za investitore i veće objekte.',
    points: ['Ponuda prema predmjeru', 'Isporuka po fazama gradnje', 'Uslovi plaćanja po dogovoru'],
    cta: 'Zatraži ponudu',
    target: 'ponuda',
  },
]

const COMPARE: [string, string, string, string][] = [
  ['', 'Kupac', 'Izvođač', 'Projekat'],
  ['Cjenovnik', 'Maloprodajni', 'Izvođački', 'Po ponudi'],
  ['Obračun materijala', 'Savjet', 'Po predmjeru', 'Po projektu'],
  ['Isporuka', 'Po dogovoru', 'Po narudžbi', 'Po fazama'],
  ['Plaćanje', 'Na licu mjesta', 'Po dogovoru', 'Po dogovoru'],
  ['Kontakt osoba', '—', 'Da', 'Da'],
]

export default function Pricing() {
  const scrollTo = useScrollTo()

  return (
    <section id="cijene" data-spy className="gutter scroll-mt-[var(--bar)] py-[14dvh]">
      <SectionHead
        no="06"
        label="Cijene"
        title="Tri načina kupovine"
        lead="Kupujete u maloprodaji, uz rabat kao izvođač ili po ponudi za cijeli projekat."
      />

      <OpenBox className="mt-[8dvh] border-[10px] border-ink">
        <div className="grid md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`flex min-h-[420px] flex-col justify-between gap-12 p-6 md:min-h-[62dvh] md:p-[2.2vw] ${
                plan.featured ? 'bg-ink text-bg' : ''
              } ${i > 0 ? 'border-t-2 border-ink md:border-l-2 md:border-t-0' : ''}`}
            >
              <p className="flex justify-between text-micro uppercase">
                <span className="tabular-nums">0{i + 1}</span>
                {plan.featured && <span>Najčešći izbor</span>}
              </p>

              <div>
                <h3 className="text-[clamp(28px,3.6vw,64px)] leading-[0.94] uppercase">{plan.name}</h3>
                <p className="mt-5 text-lead tabular-nums uppercase">{plan.price}</p>
                <p className="mt-3 text-micro uppercase opacity-60">{plan.text}</p>
                <ul className="mt-6 border-t border-current/25">
                  {plan.points.map((pt) => (
                    <li key={pt} className="border-b border-current/25 py-2.5 text-micro uppercase">
                      {pt}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => scrollTo(plan.target)}
                  className={`mt-6 flex w-full items-center justify-between border-2 border-current px-4 py-3.5 text-micro uppercase transition-colors duration-300 ${
                    plan.featured ? 'hover:bg-bg hover:text-ink' : 'hover:bg-ink hover:text-bg'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </OpenBox>

      {/* Poređenje */}
      <div className="mt-[10dvh] overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left uppercase">
          <caption className="sr-only">Poređenje načina kupovine</caption>
          <thead>
            <tr>
              {COMPARE[0].map((h, i) => (
                <th key={i} scope="col" className="border-b-2 border-ink pb-3 text-micro font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.slice(1).map(([row, ...cells]) => (
              <tr key={row}>
                <th scope="row" className="border-b border-ink/25 py-4 pr-4 text-micro font-bold text-ink/60">
                  {row}
                </th>
                {cells.map((c, i) => (
                  <td key={i} className="border-b border-ink/25 py-4 pr-4 text-small">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
