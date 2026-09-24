'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { revealChars, revealLines } from '@/lib/reveal'

type Props = { no: string; label: string; title: string; lead?: string; meta?: string }

// Zaglavlje sekcije: linija sa brojem, naslov koji izranja slovo po slovo i kratak uvod.
// Boje nasljeđuje od sekcije (currentColor), pa radi i na tamnoj pozadini.
export default function SectionHead({ no, label, title, lead, meta }: Props) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        revealChars(el.querySelector('[data-title]')!, reduce, 'top 88%')
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
    </header>
  )
}
