'use client'

import { useRef } from 'react'
import Cta from '@/components/ui/Cta'
import { PARTNER_TIERS } from '@/gc/gc'
import { gsap, useGSAP } from '@/lib/gsap'
import { useMediaMotion } from '@/lib/media'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'

// Za partnere: rabatna skala i uslovi plaćanja (PDF, tačka 5 — isti podaci kao PARTNER_TIERS).
// Tabela sa tankim linijama, ispod dva ulaza: B2B portal i maloprodaja.
export default function Partners() {
  const root = useRef<HTMLElement>(null)
  useMediaMotion(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        revealChars(root.current!.querySelector('[data-head]')!, reduce, 'top 80%')
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="partneri" className="relative z-20 bg-bg py-[18vh]" aria-label="Za partnere">
      <div className="px-5 text-center">
        <p className="label opacity-60">Za partnere · B2B</p>
        <h2 data-head className="display invisible mx-auto mt-6 max-w-[16ch] text-[clamp(40px,5.6vw,100px)]">
          Rabatna skala
        </h2>
        <p data-up className="mx-auto mt-8 max-w-[58ch] text-[12.5px] leading-[1.65] opacity-70">
          Dinamički sistem ugovornih rabata i kreditiranja za građevinske firme, izvođače radova i subjekte visokogradnje.
          Kreditni limiti uz odgođeno plaćanje i ugovorenu menicu ili bankarsku garanciju.
        </p>
      </div>

      <div data-up className="mx-auto mt-[9vh] w-[calc(100%-40px)] max-w-[1200px] border-t border-ink/20">
        {/* zaglavlje kolona (desktop) */}
        <div className="hidden grid-cols-[1.1fr_1.6fr_0.8fr_1.1fr_1.2fr] gap-6 border-b border-ink/20 py-4 text-[10.5px] opacity-50 md:grid">
          <span>Nivo</span>
          <span>Za koga</span>
          <span>Rabat</span>
          <span>Kreditni limit</span>
          <span>Plaćanje</span>
        </div>
        {PARTNER_TIERS.map((t, i) => (
          <div
            key={t.name}
            className={`grid grid-cols-2 gap-x-6 gap-y-2 border-b border-ink/20 py-6 md:grid-cols-[1.1fr_1.6fr_0.8fr_1.1fr_1.2fr] md:items-baseline ${i === 0 ? 'opacity-70' : ''}`}
          >
            <span className="font-pretty text-[clamp(20px,1.8vw,28px)] leading-none">{t.name}</span>
            <span className="text-[12px] leading-[1.5] max-md:col-span-2 max-md:row-start-2">{t.who}</span>
            <span className="num text-[clamp(26px,2.4vw,38px)] leading-none max-md:col-start-2 max-md:row-start-1 max-md:text-right">
              {t.rebate}
            </span>
            <span className="text-[12px]">{t.limit}</span>
            <span className="text-[12px] opacity-70 max-md:text-right">{t.days}</span>
          </div>
        ))}
      </div>

      <div data-up className="mt-[8vh] flex flex-wrap justify-center gap-3 px-5">
        <Cta href="/portal" solid>
          B2B portal
        </Cta>
        <Cta href="/prodavnica">Maloprodaja</Cta>
      </div>
    </section>
  )
}
