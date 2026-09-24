'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import Bundles from './Bundles'
import CartDrawer from './CartDrawer'
import Faq from './Faq'
import Materials from './Materials'
import NewArrivals from './NewArrivals'
import Pricing from './Pricing'
import Process from './Process'
import Quote from './Quote'
import Shop from './Shop'
import ShopBar from './ShopBar'
import TrustStrip from './TrustStrip'
import UseCases from './UseCases'

// Prodavnica: jedna stranica ispod landinga. Ima puni krem podlogu (bg-bg), pa prekriva fiksni wordmark
// iza sebe, kao da landing "završava" i počinje nova stranica. Deblja linija (10px) označava prelaz.
export default function Commerce() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { mobile } = ctx.conditions as { mobile: boolean }
        // Fiksna značka iz landinga na uskom ekranu prekriva sadržaj (pretragu, kartice), pa se sakriva
        // dok je prodavnica na ekranu. Na širokom ekranu stoji u marginama i ostaje.
        if (!mobile) return
        const badge = document.querySelector('[data-badge]')
        if (!badge) return
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => gsap.to(badge, { autoAlpha: self.isActive ? 0 : 1, duration: 0.4, overwrite: 'auto' }),
        })
      })
    },
    { scope: root },
  )

  return (
    <>
      <div ref={root} className="relative z-30 border-t-[10px] border-ink bg-bg">
        <ShopBar />
        <TrustStrip />
        <NewArrivals />
        <Shop />
        <Bundles />
        <UseCases />
        <Materials />
        <Pricing />
        <Process />
        <Faq />
        <Quote />
      </div>
      <CartDrawer />
    </>
  )
}
