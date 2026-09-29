'use client'

import { useRef } from 'react'
import { PARTNER_TIERS } from '@/gc/gc'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { useScrollTo } from '@/lib/useScrollTo'
import SectionHead from './SectionHead'

// Nivoi partnerskog programa iz kataloga Grand Company (PARTNER_TIERS): rabat, kreditni limit i valuta.
// Kartice stoje u jednom nizu, ali stepenasto po visini: jedna pada u sredinu ekrana, ostale su
// lijevo i desno od nje. Skrol ne pomjera raspored — samo poveća i posvijetli karticu
// koja je najbliža sredini ekrana.
const OFFSET = ['md:mt-0', 'md:mt-[10dvh]', 'md:mt-[3dvh]', 'md:mt-[13dvh]']

export default function Pricing() {
  const list = useRef<HTMLUListElement>(null)
  const scrollTo = useScrollTo()

  useGSAP(
    () => {
      const el = list.current!
      const cards = gsap.utils.toArray<HTMLElement>('[data-tier]', el)
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        if (reduce) {
          gsap.set(cards, { scaleX: 1, scaleY: 1, autoAlpha: 1 })
          return
        }

        const scaleX = cards.map((c) => gsap.quickTo(c, 'scaleX', { duration: 0.4, ease: 'power2.out' }))
        const scaleY = cards.map((c) => gsap.quickTo(c, 'scaleY', { duration: 0.4, ease: 'power2.out' }))
        const alpha = cards.map((c) => gsap.quickTo(c, 'opacity', { duration: 0.4, ease: 'power2.out' }))

        const update = () => {
          const middle = window.innerHeight / 2
          cards.forEach((card, i) => {
            const box = card.getBoundingClientRect()
            const distance = Math.abs(box.top + box.height / 2 - middle)
            // 1 kad je kartica u sredini ekrana, 0 kad je skroz iznad ili ispod
            const near = Math.max(0, 1 - distance / (window.innerHeight * 0.55))
            const size = 0.94 + 0.1 * near
            scaleX[i](size)
            scaleY[i](size)
            alpha[i](0.55 + 0.45 * near)
          })
        }

        ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, invalidateOnRefresh: true })
        update()
      })
    },
    { scope: list },
  )

  return (
    <section id="cijene" className="overflow-x-clip pb-[16dvh] pt-[16dvh]">
      <div className="gutter">
        <SectionHead no="07" label="Partneri" meta={`${PARTNER_TIERS.length} nivoa`} />
      </div>

      <ul
        ref={list}
        className="mt-[12dvh] flex flex-col gap-6 px-5 md:flex-row md:items-start md:gap-[2vw] md:px-0 md:pl-[12vw]"
      >
        {PARTNER_TIERS.map((t, i) => {
          const dark = i === PARTNER_TIERS.length - 1
          return (
            <li
              key={t.name}
              data-tier
              className={`flex min-h-[52dvh] flex-col justify-between gap-10 border-2 border-ink p-6 md:w-[20vw] md:shrink-0 ${
                dark ? 'bg-ink text-bg' : ''
              } ${OFFSET[i] ?? ''}`}
            >
              <p className="flex justify-between text-micro uppercase">
                <span className="tabular-nums">0{i + 1}</span>
                <span>{i === 0 ? 'Bez ugovora' : 'Ugovor'}</span>
              </p>

              <div>
                <h3 className="text-[clamp(24px,2vw,40px)] leading-[0.94] uppercase [overflow-wrap:anywhere]">
                  {t.name}
                </h3>
                <p className="mt-4 text-[clamp(18px,1.7vw,32px)] leading-[1.02] tabular-nums uppercase">
                  Rabat {t.rebate}
                </p>
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
                  onClick={() => scrollTo('kontakt')}
                  className={`mt-6 flex w-full items-center justify-between border-2 border-current px-4 py-3.5 text-micro uppercase transition-colors duration-300 ${
                    dark ? 'hover:bg-bg hover:text-ink' : 'hover:bg-ink hover:text-bg'
                  }`}
                >
                  <span>{i === 0 ? 'Zatražite ponudu' : 'Zatražite ugovor'}</span>
                  <span aria-hidden>→</span>
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
