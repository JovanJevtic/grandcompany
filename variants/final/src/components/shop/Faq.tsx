'use client'

import { useState } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { COMPANY, FAQ } from '@/gc/gc'
import { Icon } from '../ui'

const QA = FAQ.map(([q, a]) => ({ q, a }))

// Pitanja: grand-maison Faq (animated accordion) with HOME_FAQ, in the house style.
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="pitanja" aria-labelledby="pitanja-h" className="relative z-10 border-t border-ink/12 bg-canvas py-16 lg:py-24">
      <div className="gutter wrap grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <div>
          <h2 id="pitanja-h" className="s-head">
            Česta pitanja
          </h2>
          <p className="mt-4 max-w-[34ch] text-[15px] leading-[1.6] text-muted">
            Nema odgovora? Pozovite{' '}
            <a href={COMPANY.phoneLandlineHref} className="link-u text-ink tnum">
              {COMPANY.phoneLandline}
            </a>{' '}
            ili pišite na{' '}
            <a href={`mailto:${COMPANY.emailSales}`} className="link-u text-ink">
              {COMPANY.emailSales}
            </a>
            .
          </p>
        </div>

        <div className="border-b border-ink/15">
          {QA.map(({ q, a }, i) => {
            const on = open === i
            return (
              <div key={q} className="border-t border-ink/15">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => {
                      setOpen(on ? null : i)
                      window.setTimeout(() => ScrollTrigger.refresh(), 550)
                    }}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left text-[16px] font-medium md:text-[17px]"
                  >
                    <span>{q}</span>
                    <Icon name="plus" className={`size-4 shrink-0 transition-transform duration-500 ${on ? 'rotate-45' : ''}`} />
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
                    <p className="max-w-[62ch] pb-6 text-[15px] leading-[1.65] text-muted">{a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
