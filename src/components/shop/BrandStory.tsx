'use client'

/* eslint-disable @next/next/no-img-element -- editorijalne fotografije iz /public, već u WebP */

import { MAPS_URL } from '@/lib/company'
import { useRef } from 'react'
import Pw from '@/components/ui/Pw'
import { COMPANY } from '@/gc/gc'
import { gsap, useGSAP } from '@/lib/gsap'
import { useMediaMotion } from '@/lib/media'
import { MQ } from '@/lib/motion'
import BladeOutline from './BladeOutline'

// Brend (po referenci): lijevo velika kvadratna fotografija sa manjom uokvirenom slikom preko,
// desno obrisani romb, serif naslov i kratak tekst u verzalu. Ispod red "Sa gradilišta":
// četiri krupna plana i u sredini tamni romb — sve ćelije dijele tanke linije.
const TILES = [
  { src: '/shop2/tile-1.webp', alt: 'Zrnca stiropora na plavoj podlozi' },
  { src: '/shop2/tile-2.webp', alt: 'Cement koji se sipa u kupu' },
  null,
  { src: '/shop2/tile-3.webp', alt: 'Vlakna mineralne vune' },
  { src: '/shop2/tile-4.webp', alt: 'Libela na gips-kartonskoj ploči' },
]

export default function BrandStory() {
  const root = useRef<HTMLElement>(null)
  useMediaMotion(root)

  useGSAP(
    () => {
      const el = root.current!
      gsap.matchMedia().add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        if (reduce) return
        // Uokvirena slika klizi brže od velike — dubina kolaža.
        gsap.fromTo(
          el.querySelector('[data-inset]'),
          { yPercent: 18 },
          { yPercent: -18, ease: 'none', scrollTrigger: { trigger: el.querySelector('[data-collage]'), start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="mt-[22vh]" aria-label="O nama">
      <div className="grid border-y border-ink/20 md:grid-cols-2">
        <div data-collage className="relative aspect-square overflow-hidden md:border-r md:border-ink/20">
          <figure data-parallax="6" className="absolute inset-0 overflow-hidden">
            <img decoding="async" loading="lazy" src="/shop2/brand.webp" alt="Gleterica na svježe izglađenoj masi" className="h-full w-full object-cover" />
          </figure>
          <figure data-inset className="absolute left-[30%] top-[24%] w-[38%] border-[6px] border-white shadow-[0_24px_50px_-24px_rgba(27,36,54,.5)]">
            <img decoding="async" loading="lazy" src="/shop2/brand-inset.webp" alt="Spoj ploča prekriven bandaž trakom i masom" className="aspect-[3/4] w-full object-cover" />
          </figure>
        </div>

        <div className="flex flex-col justify-between gap-14 px-5 py-10 md:px-[4vw] md:py-[4vw]">
          <BladeOutline label="Pročitaj" href="/vodici" className="self-end" />
          <div>
            <h2 data-up className="display text-[clamp(44px,4.8vw,84px)]">
              <Pw>Naš brend</Pw>
            </h2>
            <p data-up className="mt-8 max-w-[62ch] text-[11.5px] leading-[1.75]">
              {COMPANY.name} od {COMPANY.founded}. radi veleprodaju i maloprodaju građevinskog materijala: Knauf sisteme suhe
              gradnje, izolaciju, veziva i pribor. Ne prodajemo samo ploču — slažemo sistem, od profila i vijaka do mase za spojeve,
              i spuštamo ga kranom na vašu etažu.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-[18vh] border-y border-ink/20">
        <h2 className="display border-b border-ink/20 py-10 text-center text-[clamp(36px,3.6vw,60px)]">
          <Pw>Sa gradilišta</Pw>
        </h2>
        <div className="grid grid-cols-2 gap-px bg-ink/20 md:grid-cols-5">
          {TILES.map((t, i) =>
            t ? (
              <figure key={i} className="bg-bg p-4 md:p-5">
                <div data-curtain className="aspect-[4/5] overflow-hidden">
                  <img decoding="async" src={t.src} alt={t.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out)] hover:scale-105" />
                </div>
              </figure>
            ) : (
              <a
                key={i}
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Stovarište Banja Luka na Google mapi"
                data-cursor="Mapa"
                className="col-span-2 grid place-items-center bg-bg p-6 transition-opacity hover:opacity-70 md:col-span-1"
              >
                <BladeOutline label="Banja Luka" dark className="w-full max-w-[260px]" />
              </a>
            ),
          )}
        </div>
      </div>
    </section>
  )
}
