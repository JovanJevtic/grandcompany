'use client'

import { useState } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { FAQ } from '@/gc/gc'
import SectionHead from './SectionHead'

// Pitanja i odgovori iz kataloga Grand Company (HOME_FAQ).
const QA = FAQ.map(([q, a]) => ({ q, a }))

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="pitanja" data-spy className="gutter scroll-mt-[var(--bar)] py-[14dvh]">
      <SectionHead no="09" label="Pitanja" title="Česta pitanja" meta={`${QA.length} odgovora`} />

      <div className="mt-[8dvh] border-b-2 border-ink md:ml-[33.33%]">
        {QA.map(({ q, a }, i) => {
          const on = open === i
          return (
            <div key={q} className="border-t-2 border-ink">
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={on}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => {
                    setOpen(on ? null : i)
                    // Visina se animira, pa se položaji sekcija ispod mjere tek kad tranzicija završi.
                    window.setTimeout(() => ScrollTrigger.refresh(), 600)
                  }}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left text-small uppercase md:py-6"
                >
                  <span>{q}</span>
                  <span aria-hidden className="relative h-4 w-4 shrink-0">
                    <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-current" />
                    <span
                      className={`absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-current transition-transform duration-500 ${
                        on ? 'scale-y-0' : ''
                      }`}
                    />
                  </span>
                </button>
              </h3>
              <div
                id={`faq-a-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                className={`grid transition-[grid-template-rows] duration-500 [transition-timing-function:var(--ease-io)] ${
                  on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="max-w-[52ch] pb-6 text-micro uppercase text-ink/70 md:pb-8">{a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
