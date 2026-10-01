'use client'

import { useRef, useState } from 'react'
import ProductCard from '@/components/catalog/ProductCard'
import Cta from '@/components/ui/Cta'
import Pw from '@/components/ui/Pw'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import { CATEGORIES, PRODUCTS, type CategoryId } from '@/lib/shop'

// Najčešće birano: sekcija se pinuje i skrol, umjesto na sljedeću sekciju, vodi traku kartica
// vodoravno. Kartice stoje stepenasto (prva najviša, svaka sljedeća niže, pa iznova), a dok
// traka klizi svaka se njiše gore-dolje i blago naginje prema rubu ekrana — kao lepeza karata.
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
      const viewport = el.querySelector<HTMLElement>('[data-viewport]')!
      const track = el.querySelector<HTMLElement>('[data-track]')!
      const cards = gsap.utils.toArray<HTMLElement>('[data-fan]', track)

      // Kartice nove liste izranjaju jedna za drugom.
      gsap.fromTo(cards, { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: 0.9, ease: EASE.quint, stagger: 0.05 })

      const mm = gsap.matchMedia()
      mm.add({ desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)' }, () => {
        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth)
        const setters = cards.map((c) => ({
          y: gsap.quickSetter(c, 'y', 'px'),
          r: gsap.quickSetter(c, 'rotation', 'deg'),
        }))
        // Njihanje: zavisi od toga gdje je kartica u odnosu na sredinu ekrana.
        const fan = () => {
          const mid = window.innerWidth / 2
          cards.forEach((c, i) => {
            const r = c.getBoundingClientRect()
            const d = (r.left + r.width / 2 - mid) / mid // -1 lijevo … 1 desno
            setters[i].y(Math.sin(d * Math.PI + i * 0.9) * window.innerHeight * 0.035 + Math.abs(d) * 24)
            setters[i].r(d * 4)
          })
        }
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: fan,
            onRefresh: fan,
          },
        })
        fan()
        return () => {
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
    <section ref={root} id="najcesce" className="relative z-20 overflow-hidden bg-bg md:flex md:h-dvh md:flex-col md:justify-center">
      <div className="px-5 pt-[16vh] text-center md:pt-[11vh]">
        <span className="spark spark--spin mx-auto mb-5 block size-4" aria-hidden />
        <h2 data-head className="display invisible text-[clamp(44px,5.4vw,96px)]">
          <Pw>
            Najčešće <em>birano</em>
          </Pw>
        </h2>
        <div role="tablist" aria-label="Grupa artikala" className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[15px]">
          {chips.map((c) => {
            const on = c.id === cat
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setCat(c.id)}
                className={`relative flex min-h-10 items-center transition-opacity duration-300 ${on ? 'italic' : 'opacity-45 hover:opacity-100'}`}
              >
                <span className={`spark absolute -left-4 size-2.5 transition-transform duration-500 ${on ? 'scale-100' : 'scale-0'}`} />
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Traka: na desktopu je vozi skrol (GSAP), na mobilnom je običan swipe sa "snap"-om. */}
      <div data-viewport className="hs-viewport mt-[5vh] md:mt-[4vh] md:flex-1">
        <div
          data-track
          className="flex w-max gap-[4vw] px-5 pb-[10vh] [--step:3.5vh] md:gap-[2.4vw] md:px-[8vw] md:pb-0 md:[--step:5vh]"
        >
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
  )
}
