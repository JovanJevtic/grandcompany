'use client'

import { useRef, useState } from 'react'
import ProductCard from '@/components/catalog/ProductCard'
import Cta from '@/components/ui/Cta'
import Pw from '@/components/ui/Pw'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import { CATEGORIES, PRODUCTS, type CategoryId } from '@/lib/shop'

// Najčešće birano: sekcija se zaustavi (CSS sticky u višem omotaču) i skrol, umjesto na sljedeću
// sekciju, vodi traku kartica vodoravno. Sticky drži browser sam — bez GSAP pina, pa nema skoka
// od jednog kadra na početku i kraju zaustavljanja (pin + smooth scroll je to radio). Kartice stoje stepenasto (prva najviša, svaka sljedeća niže, pa iznova), a dok
// traka klizi svaka se njiše gore-dolje (talas), bez naginjanja — kartice ostaju uspravne.
// Na mobilnom (i uz reduced-motion) traka je običan vodoravni swipe, bez pinovanja.

type Key = CategoryId | 'sve'
const COUNT = 10

const pick = (k: Key) => {
  const pool = k === 'sve' ? PRODUCTS : PRODUCTS.filter((p) => p.category === k)
  return [...pool].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, COUNT)
}

// Stepenice: 0, 1, 2, 3, pa iznova (u jedinicama --step)
const STAIR = 4

export default function Featured() {
  const root = useRef<HTMLElement>(null)
  const [cat, setCat] = useState<Key>('sve')
  const list = pick(cat)

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

  // Vodoravna traka: pravi se iznova kad se promijeni grupa (druga lista, druga širina).
  useGSAP(
    () => {
      const el = root.current!
      const wrap = el.parentElement as HTMLElement
      const viewport = el.querySelector<HTMLElement>('[data-viewport]')!
      const track = el.querySelector<HTMLElement>('[data-track]')!
      const cards = gsap.utils.toArray<HTMLElement>('[data-fan]', track)

      // Kartice nove liste izranjaju jedna za drugom.
      gsap.fromTo(cards, { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: 0.5, ease: EASE.quint, stagger: 0.03 })

      const mm = gsap.matchMedia()
      mm.add({ desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)' }, () => {
        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth)
        // Omotač je visok koliko traje vožnja trake: ekran + dužina trake. Mjeri se prije svakog
        // osvježavanja ScrollTriggera, da start/end budu izmjereni na tačnoj visini.
        const setHeight = () => {
          wrap.style.height = `${window.innerHeight + distance()}px`
        }
        setHeight()
        ScrollTrigger.addEventListener('refreshInit', setHeight)
        const setters = cards.map((c) => gsap.quickSetter(c, 'y', 'px'))
        // Njihanje: zavisi od toga gdje je kartica u odnosu na sredinu ekrana.
        // Sredine kartica (u odnosu na ekran, kad je traka na x=0) mjere se samo pri osvježavanju;
        // u toku skrola se računa iz pomaka trake — bez čitanja rasporeda u svakom kadru (to je trzalo).
        let centers: number[] = []
        let vw = window.innerWidth
        let vh = window.innerHeight
        const measure = () => {
          const x = Number(gsap.getProperty(track, 'x')) || 0
          vw = window.innerWidth
          vh = window.innerHeight
          centers = cards.map((c) => {
            const r = c.getBoundingClientRect()
            return r.left + r.width / 2 - x
          })
        }
        const fan = () => {
          const mid = vw / 2
          const x = Number(gsap.getProperty(track, 'x')) || 0
          centers.forEach((c, i) => {
            const d = (c + x - mid) / mid // -1 lijevo … 1 desno
            setters[i](Math.sin(d * Math.PI + i * 0.9) * vh * 0.035 + Math.abs(d) * 24)
          })
        }
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top top',
            end: () => `+=${distance()}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: fan,
            onRefresh: () => {
              measure()
              fan()
            },
          },
        })
        measure()
        fan()
        return () => {
          ScrollTrigger.removeEventListener('refreshInit', setHeight)
          wrap.style.height = ''
          tween.scrollTrigger?.kill()
          tween.kill()
          gsap.set(cards, { clearProps: 'transform' })
        }
      })
    },
    { scope: root, dependencies: [cat], revertOnUpdate: true },
  )

  const chips: { id: Key; name: string }[] = [{ id: 'sve', name: 'Najčešće' }, ...CATEGORIES.map((c) => ({ id: c.id, name: c.name }))]

  return (
    <>
      <div data-pinwrap className="relative z-20 bg-bg">
      <section ref={root} id="najcesce" className="relative z-20 overflow-hidden bg-bg md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:justify-center">
        <div className="px-5 pt-[16vh] text-center md:pt-[11vh]">
          <h2 data-head className="display invisible text-[clamp(44px,5.4vw,96px)]">
            <Pw>
              Najčešće <em>birano</em>
            </Pw>
          </h2>
          <div role="tablist" aria-label="Grupa artikala" className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[12.5px] max-md:-mx-5 max-md:gap-x-6 max-md:px-8 max-md:flex-nowrap max-md:justify-start max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden max-md:[&>*]:shrink-0 max-md:[&>*]:whitespace-nowrap">
            {chips.map((c) => {
              const on = c.id === cat
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setCat(c.id)}
                  className={`relative flex min-h-10 items-center transition-opacity duration-300 ${on ? '' : 'opacity-45 hover:opacity-100'}`}
                >
                  <span
                    className={`absolute -left-3.5 size-1.5 rounded-full bg-signal transition-transform duration-500 ${on ? 'scale-100' : 'scale-0'}`}
                  />
                  {c.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Traka: na desktopu je vozi skrol (GSAP), na mobilnom je običan swipe sa "snap"-om. */}
        <div data-viewport className="hs-viewport mt-[5vh] md:mt-[4vh] md:flex-1">
          <div data-track className="flex w-max gap-[4vw] px-5 pb-[10vh] [--step:3.5vh] md:gap-[2.4vw] md:px-[8vw] md:pb-0 md:[--step:5vh]">
            {list.map((p, i) => (
              <div
                key={p.id}
                data-fan
                className="w-[64vw] shrink-0 snap-start will-change-transform sm:w-[38vw] md:w-[18.5vw]"
                style={{ marginTop: `calc(var(--step) * ${i % STAIR})` }}
              >
                <ProductCard product={p} stacked />
              </div>
            ))}
            {/* Kraj trake: poziv na cijeli katalog */}
            <div className="flex w-[64vw] shrink-0 snap-start items-center justify-center sm:w-[38vw] md:w-[22vw]">
              <Cta href={cat === 'sve' ? '/prodavnica' : `/prodavnica?kategorija=${cat}`}>Katalog</Cta>
            </div>
          </div>
        </div>
      </section>
      </div>
      {/* Predah poslije trake: više bijelog prostora prije sljedeće sekcije */}
      <div aria-hidden className="relative z-20 h-[12vh] bg-bg md:h-[30vh]" />
    </>
  )
}
