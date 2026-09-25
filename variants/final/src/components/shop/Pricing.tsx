'use client'

import { PARTNER_TIERS } from '@/gc/gc'
import { useScrollTo } from '@/lib/useScrollTo'

// Za partnere: grand-maison Pricing (tier columns) with PARTNER_TIERS, in a dark section.
// Steel (#274C77) appears here only — it is the B2B signal of the design system.
export default function Pricing() {
  const scrollTo = useScrollTo()

  return (
    <section id="partneri" aria-labelledby="partneri-h" className="on-dark relative z-10 bg-deep py-16 text-canvas lg:py-24">
      <div className="gutter wrap">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <h2 id="partneri-h" className="s-head">
              Za partnere
            </h2>
            <p className="mt-3 max-w-[58ch] text-[15px] leading-[1.55] text-canvas/70">
              Maloprodaja bez ugovora ili ugovor sa rabatom, kreditnim limitom i valutom. Nivo se određuje prema obimu
              kupovine i ugovoru.
            </p>
          </div>
          <button type="button" onClick={() => scrollTo('upit')} className="btn-line shrink-0 self-start md:self-auto">
            Zatražite ugovor <span aria-hidden>→</span>
          </button>
        </header>

        <ul className="mt-10 grid border-t border-canvas/15 sm:grid-cols-2 xl:grid-cols-4">
          {PARTNER_TIERS.map((t, i) => {
            const contract = i > 0
            return (
              <li
                key={t.name}
                className={`relative flex flex-col border-b border-canvas/15 py-7 sm:px-6 xl:border-b-0 ${
                  i % 2 === 1 ? 'sm:border-l' : ''
                } ${i === 2 ? 'xl:border-l' : ''} ${i === 0 ? 'sm:pl-0' : ''} ${i === 2 ? 'sm:pl-0 xl:pl-6' : ''} border-canvas/15`}
              >
                {contract && <span aria-hidden className="absolute left-0 top-0 h-[3px] w-12 bg-steel sm:left-6" />}
                <div className="flex items-center justify-between gap-3">
                  <h3 className="s-sub">{t.name}</h3>
                  <span
                    className={`eyebrow px-2 py-1 text-[9.5px] ${contract ? 'bg-steel text-canvas' : 'border border-canvas/25 text-canvas/70'}`}
                  >
                    {contract ? 'Ugovor' : 'Bez ugovora'}
                  </span>
                </div>
                <p className="mt-2 text-[14px] text-canvas/65">{t.who}</p>
                <p className="mt-6 font-display text-[44px] font-medium leading-none tracking-[-0.03em] tnum">{t.rebate}</p>
                <p className="mt-1 text-[12px] text-canvas/55">rabat na cjenovnik</p>
                <dl className="mt-6 border-t border-canvas/15 text-[13.5px]">
                  <div className="flex justify-between gap-4 border-b border-canvas/15 py-2.5">
                    <dt className="text-canvas/55">Limit</dt>
                    <dd className="text-right">{t.limit}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2.5">
                    <dt className="text-canvas/55">Plaćanje</dt>
                    <dd className="text-right">{t.days}</dd>
                  </div>
                </dl>
              </li>
            )
          })}
        </ul>
        <p className="mt-8 max-w-[70ch] text-[13px] leading-[1.6] text-canvas/55">
          Partneri nakon prijave vide svoje cijene, kreditni limit i otvorene fakture. Plaćanje sa valutom je uz mjenicu ili
          bankarsku garanciju.
        </p>
      </div>
    </section>
  )
}
