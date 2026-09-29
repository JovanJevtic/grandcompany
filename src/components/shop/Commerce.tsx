'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import Pricing from './Pricing'
import SectionHead from './SectionHead'
import Kaolin from './Kaolin'
import UseCases from './UseCases'

// Prodavnica je svedena na tri stvari: linija sa kategorijama, pet vrsta radova i partnerski nivoi.
// Sve između je uklonjeno (katalog, kompleti, upit, korpa, pitanja...) — komponente ostaju u repou
// ako zatrebaju. Deblja linija (10px) i krem podloga i dalje označavaju prelaz sa landinga,
// a velika praznina na vrhu ostavlja prostor za fiksni wordmark iznad sekcije.
export default function Commerce() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { mobile } = ctx.conditions as { mobile: boolean }
        // Na uskom ekranu fiksna značka pada preko kartica, pa se sakrije dok je prodavnica u kadru.
        if (!mobile) return
        const badge = document.querySelector('[data-badge]')
        if (!badge) return
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top 50%',
          end: 'max',
          onToggle: (self) =>
            gsap.to(badge, { autoAlpha: self.isActive ? 0 : 1, duration: 0.4, overwrite: 'auto' }),
        })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative z-30 border-t-[10px] border-ink bg-bg pb-[10dvh] pt-[28dvh]">
      <div className="gutter">
        <SectionHead no="01" label="Kategorije" meta="4 grupe" />
      </div>
      <UseCases />
      {/* Nakon pet vrsta radova: jedan objekat koji se na skrol transformiše od sirovog kaolina do porcelana. */}
      <Kaolin />
      <Pricing />
    </div>
  )
}
