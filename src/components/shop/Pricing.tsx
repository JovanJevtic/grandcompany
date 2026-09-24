'use client'

import { PARTNER_TIERS } from '@/gc/gc'
import { useScrollTo } from '@/lib/useScrollTo'
import { OpenBox } from './Reveal'
import SectionHead from './SectionHead'

// Nivoi partnerskog programa iz kataloga Grand Company (PARTNER_TIERS): rabat, kreditni limit i valuta.
// Raspored (okvir 10px, kolone, tabela poređenja) je iz grand-maison Pricing.
export default function Pricing() {
  const scrollTo = useScrollTo()

  const compare: [string, ...string[]][] = [
    ['Za koga', ...PARTNER_TIERS.map((t) => t.who)],
    ['Rabat', ...PARTNER_TIERS.map((t) => t.rebate)],
    ['Kreditni limit', ...PARTNER_TIERS.map((t) => t.limit)],
    ['Plaćanje', ...PARTNER_TIERS.map((t) => t.days)],
  ]

  return (
    <section id="cijene" data-spy className="gutter scroll-mt-[var(--bar)] py-[14dvh]">
      <SectionHead
        no="07"
        label="Partneri"
        title="Partnerski program"
        lead="Maloprodaja bez ugovora ili ugovor sa rabatom, kreditnim limitom i valutom do 90 dana. Nivo se određuje prema obimu i ugovoru."
        meta={`${PARTNER_TIERS.length} nivoa`}
      />

      <OpenBox className="mt-[8dvh] border-[10px] border-ink">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          {PARTNER_TIERS.map((t, i) => {
            const dark = i === PARTNER_TIERS.length - 1
            return (
              <div
                key={t.name}
                className={`flex min-h-[380px] flex-col justify-between gap-12 p-6 md:min-h-[56dvh] md:p-[2vw] ${
                  dark ? 'bg-ink text-bg' : ''
                } ${i > 0 ? 'border-t-2 border-ink sm:border-t-0' : ''} ${i % 2 === 1 ? 'sm:border-l-2 sm:border-ink' : ''} ${
                  i > 1 ? 'sm:border-t-2 sm:border-ink xl:border-t-0' : ''
                } ${i === 2 ? 'xl:border-l-2 xl:border-ink' : ''}`}
              >
                <p className="flex justify-between text-micro uppercase">
                  <span className="tabular-nums">0{i + 1}</span>
                  <span>{i === 0 ? 'Bez ugovora' : 'Ugovor'}</span>
                </p>

                <div>
                  <h3 className="text-[clamp(26px,2.2vw,44px)] leading-[0.94] uppercase [overflow-wrap:anywhere]">{t.name}</h3>
                  <p className="mt-5 text-[clamp(20px,1.9vw,36px)] leading-[1.02] tabular-nums uppercase">Rabat {t.rebate}</p>
                  <p className="mt-3 text-micro uppercase opacity-60">{t.who}</p>
                  <ul className="mt-6 border-t border-current/25">
                    {[t.limit, t.days].map((pt) => (
                      <li key={pt} className="border-b border-current/25 py-2.5 text-micro uppercase">
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => scrollTo(i === 0 ? 'prodavnica' : 'ponuda')}
                    className={`mt-6 flex w-full items-center justify-between border-2 border-current px-4 py-3.5 text-micro uppercase transition-colors duration-300 ${
                      dark ? 'hover:bg-bg hover:text-ink' : 'hover:bg-ink hover:text-bg'
                    }`}
                  >
                    <span>{i === 0 ? 'Kupujte u katalogu' : 'Zatražite ugovor'}</span>
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </OpenBox>

      {/* Poređenje */}
      <div className="mt-[10dvh] overflow-x-auto" data-lenis-prevent-horizontal>
        <table className="w-full min-w-[720px] border-collapse text-left uppercase">
          <caption className="sr-only">Poređenje nivoa partnerskog programa</caption>
          <thead>
            <tr>
              {['', ...PARTNER_TIERS.map((t) => t.name)].map((h, i) => (
                <th key={i} scope="col" className="border-b-2 border-ink pb-3 text-micro font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compare.map(([row, ...cells]) => (
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
