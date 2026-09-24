'use client'

import { useState } from 'react'
import { FAQ } from '@/gc/gc'
import { ScrollTrigger } from '@/lib/gsap'
import SectionHead from './SectionHead'

// Česta pitanja (grand-maison Faq, u cipher slogu) sa našim odgovorima iz kataloga (FAQ).
// Visina odgovora se animira kroz grid-template-rows; poslije toga ScrollTrigger ponovo mjeri stranicu.
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="pitanja" className="border-t border-line px-5 py-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="10 / 12"
        eyebrow="Pitanja"
        title={
          <>
            česta <em>pitanja</em>.
          </>
        }
        intro={`${FAQ.length} odgovora o zalihama, atestima, dostavi, povratu i plaćanju.`}
      />

      <div className="mt-[clamp(56px,8vw,120px)] border-b border-line lg:ml-[33.33%]">
        {FAQ.map(([q, a], i) => {
          const on = open === i
          return (
            <div key={q} data-reveal className="border-t border-line">
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={on}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => {
                    setOpen(on ? null : i)
                    window.setTimeout(() => ScrollTrigger.refresh(), 600)
                  }}
                  className="grid w-full cursor-pointer grid-cols-[32px_1fr_auto] items-baseline gap-4 py-6 text-left md:py-7"
                >
                  <span className="info text-dim">0{i + 1}</span>
                  <span className="text-[clamp(20px,2vw,30px)] font-medium leading-[1.1] tracking-[-0.035em]">{q}</span>
                  <span aria-hidden className="relative top-[-0.1em] size-4 shrink-0 self-center">
                    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                    <span className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-500 ${on ? 'scale-y-0' : ''}`} />
                  </span>
                </button>
              </h3>
              <div
                id={`faq-a-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] ${on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <p className="max-w-[56ch] pb-7 pl-12 text-[15px] leading-[1.6] text-dim">{a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
