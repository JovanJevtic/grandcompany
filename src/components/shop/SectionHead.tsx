'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { revealChars, revealLines } from '@/lib/reveal'

// Zaglavlje sekcije: linija sa brojem, labelom i metom. Ako se zadaju `title`/`lead`,
// ispod linije ide veliki naslov koji izranja slovo po slovo i kratak uvod.
// Bez njih ostaje samo linija (tako su svedene sekcije prodavnice).
type Props = { no: string; label: string; meta?: string; title?: string; lead?: string }

export default function SectionHead({ no, label, meta, title, lead }: Props) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        const heading = el.querySelector('[data-title]')
        if (heading) revealChars(heading, reduce, 'top 88%')
        const para = el.querySelector('[data-lead]')
        if (para) revealLines(para, reduce, 'top 92%')
      })
    },
    { scope: root },
  )

  return (
    <header ref={root}>
      <div className="flex items-baseline justify-between gap-4 border-t-2 border-current pt-3 text-micro uppercase">
        <span className="tabular-nums">{no}</span>
        <span>{label}</span>
        <span className="min-w-[3ch] text-right">{meta}</span>
      </div>
      {title && (
        <div className="mt-[7dvh] grid gap-6 md:grid-cols-12 md:items-end">
          <h2 data-title className="invisible text-title uppercase md:col-span-8">
            {title}
          </h2>
          {lead && (
            <p data-lead className="invisible text-small uppercase md:col-span-3 md:col-start-10">
              {lead}
            </p>
          )}
        </div>
      )}
    </header>
  )
}
