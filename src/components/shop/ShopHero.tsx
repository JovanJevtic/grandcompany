'use client'

/* eslint-disable @next/next/no-img-element -- editorijalne fotografije iz /public, već u WebP */

import { useRef } from 'react'
import Pw from '@/components/ui/Pw'
import { useMediaMotion } from '@/lib/media'
import BladeOutline from './BladeOutline'

// Podijeljeni uvod prodavnice (po referenci): lijevo dvije male krupne fotografije materijala,
// kratak tekst, veliki obrisani romb i serif naslov; desno jedna velika fotografija.
// Ćelije dijele tanke linije, kao u mreži artikala ispod.
export default function ShopHero({ onAll }: { onAll: () => void }) {
  const root = useRef<HTMLElement>(null)
  useMediaMotion(root)

  return (
    <section ref={root} className="mt-[18vh] grid border-y border-ink/20 md:grid-cols-2" aria-label="Uvod u katalog">
      <div className="flex min-h-[82vh] flex-col justify-between gap-14 px-5 py-8 md:border-r md:border-ink/20 md:px-[3vw] md:py-[3vw]">
        <div className="flex gap-2.5">
          <figure data-curtain className="aspect-square w-[min(34vw,190px)] overflow-hidden">
            <img src="/shop2/detail-a.webp" alt="Rez naslaganih gips-kartonskih ploča" className="h-full w-full object-cover" />
          </figure>
          <figure data-curtain className="aspect-square w-[min(34vw,190px)] overflow-hidden">
            <img src="/shop2/detail-b.webp" alt="Crni samourezni vijci na plavoj podlozi" className="h-full w-full object-cover" />
          </figure>
        </div>

        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
          <p data-up className="max-w-[38ch] text-[11.5px] leading-[1.6]">
            Radimo sa Knauf, Knauf Insulation, Ceresit i Lukavac — biramo samo sisteme koji su provjereni na gradilištu.
          </p>
          <BladeOutline label="Svi artikli" onClick={onAll} className="shrink-0 self-center lg:mr-[2vw]" />
        </div>

        <h2 data-up className="display max-w-[12ch] text-[clamp(44px,5.2vw,92px)]">
          <Pw>Materijal koji drži zid</Pw>
        </h2>
      </div>

      <figure data-curtain data-parallax="7" className="relative min-h-[60vh] overflow-hidden md:min-h-0" data-cursor="Katalog" onClick={onAll}>
        <img
          src="/shop2/hero.webp"
          alt="Pocinčani profili složeni kao skulptura na terakota podlozi"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </figure>
    </section>
  )
}
