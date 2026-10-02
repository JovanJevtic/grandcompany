'use client'

/* eslint-disable @next/next/no-img-element -- vlastita fotografija stovarišta iz /public */

import { MAPS_URL } from '@/lib/company'
import { useRef } from 'react'
import Cta from '@/components/ui/Cta'
import { COMPANY } from '@/gc/gc'
import { gsap, useGSAP } from '@/lib/gsap'
import { useMediaMotion } from '@/lib/media'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'

// Stovarište: sjedište i centralno skladište, radno vrijeme i kontakt telefoni (PDF, tačka 1).
// Lijevo vlastita fotografija stovarišta iz vazduha, desno podaci u tankim redovima.
// (Fajl je ranije bio sekcija "Detail" sa fotografijama materijala.)

const HOURS: [string, string][] = [
  ['Ponedjeljak – petak', '07:00 – 17:00'],
  ['Subota', '07:00 – 14:00'],
  ['Nedjelja', 'Neradna'],
]

export default function Detail() {
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

  const [street, city] = COMPANY.address.split(', ')

  return (
    <section ref={root} id="stovariste" className="relative z-20 bg-bg py-[16vh]" aria-label="Stovarište i radno vrijeme">
      <div className="mx-auto grid w-[calc(100%-40px)] max-w-[1400px] gap-10 md:grid-cols-[1.25fr_1fr] md:gap-[5vw]">
        <figure data-curtain data-parallax="6" className="relative aspect-[16/10] overflow-hidden bg-plate">
          <img decoding="async" src="/photos/stovariste-vazduh.webp" alt="Stovarište Grand Company iz vazduha" className="absolute inset-0 h-full w-full object-cover" />
        </figure>

        <div className="flex flex-col justify-center">
          <p className="label opacity-60">Sjedište i centralno stovarište</p>
          <h2 data-head className="display invisible mt-5 text-[clamp(40px,4.6vw,84px)]">
            Stovarište
          </h2>
          <address data-up className="mt-8 not-italic text-[12.5px] leading-[1.7]">
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="ulink">
              {street}
              <br />
              {city} · Zalužani / Lazarevo
            </a>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-2 block text-[11px] opacity-60 hover:opacity-100">
              Otvori na Google mapi ↗
            </a>
          </address>

          <dl data-up className="mt-8 border-t border-ink/20 text-[12px]">
            {HOURS.map(([d, h]) => (
              <div key={d} className="flex justify-between gap-6 border-b border-ink/20 py-3.5">
                <dt className="opacity-60">{d}</dt>
                <dd className="tabular-nums">{h}</dd>
              </div>
            ))}
          </dl>

          <dl data-up className="mt-8 grid gap-1.5 text-[12px]">
            <div className="flex justify-between gap-6">
              <dt className="opacity-60">Veleprodaja / skladište</dt>
              <dd>
                <a href={COMPANY.phoneLandlineHref} className="ulink tabular-nums">
                  {COMPANY.phoneLandline}
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="opacity-60">Mobilni / Viber / WhatsApp</dt>
              <dd>
                <a href={COMPANY.phoneMobileHref} className="ulink tabular-nums">
                  {COMPANY.phoneMobile}
                </a>
              </dd>
            </div>
          </dl>

          <div data-up className="mt-10 flex flex-wrap gap-3">
            <Cta href={COMPANY.phoneLandlineHref} solid>
              Pozovite
            </Cta>
            <Cta href={`mailto:${COMPANY.emailSales}`}>Pišite</Cta>
          </div>
        </div>
      </div>
    </section>
  )
}
