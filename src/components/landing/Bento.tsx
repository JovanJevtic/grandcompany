'use client'

/* eslint-disable @next/next/no-img-element -- editorijalna fotografija iz /public, već u WebP */

import Link from 'next/link'
import { useRef } from 'react'
import Pw from '@/components/ui/Pw'
import { gsap, useGSAP } from '@/lib/gsap'
import { useMediaMotion } from '@/lib/media'
import { EASE, MQ } from '@/lib/motion'

// "Bento" blok po referenci: veliko zaobljeno polje sa ogromnom riječju i kratkim tekstom desno,
// ispod red od tri kartice — kobalt plava, tamna i fotografija sa svijetlim panelom.
// Tipografija je serif kao ostatak sajta: velika riječ i naslovi u Prettywise-u, sitne oznake u Bodoniju.

const Arrow = ({ className = '' }: { className?: string }) => (
  <span className={`grid size-[22px] place-items-center rounded-full transition-transform duration-500 group-hover:translate-x-1.5 ${className}`} aria-hidden>
    <svg viewBox="0 0 12 12" className="size-[11px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" />
    </svg>
  </span>
)

const Tag = ({ children, tone }: { children: string; tone: 'blue' | 'dark' | 'photo' }) => (
  <span
    className={`inline-flex min-h-8 items-center rounded-[4px] px-3.5 text-[11px] font-medium uppercase tracking-[0.1em] ${
      tone === 'blue' ? 'bg-white/15' : tone === 'dark' ? 'bg-white/12' : 'bg-[#3a3a3a]/85 backdrop-blur'
    }`}
  >
    {children}
  </span>
)

export default function Bento() {
  const root = useRef<HTMLElement>(null)
  useMediaMotion(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        const el = root.current!
        const cards = el.querySelectorAll('[data-bento]')
        const word = el.querySelector('[data-word]')
        if (reduce) return
        gsap.fromTo(word, { yPercent: 105 }, { yPercent: 0, duration: 1.3, ease: EASE.quint, scrollTrigger: { trigger: el, start: 'top 75%' } })
        gsap.fromTo(
          cards,
          { y: 80, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.1, ease: EASE.quint, stagger: 0.1, scrollTrigger: { trigger: cards[1], start: 'top 92%' } },
        )
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative z-20 bg-bg px-3 py-[14vh] md:px-4" aria-label="Isporuka, partneri i stovarište">
      {/* Gornje polje: ogromna riječ + kratak tekst desno */}
      <div className="flex flex-col gap-8 rounded-[18px] border-[1.5px] border-ink/80 px-6 py-10 md:flex-row md:items-end md:justify-between md:px-8 md:pb-[3.2vw] md:pt-[9vw]">
        <h2 className="overflow-hidden pb-[0.06em]">
          <span data-word className="display block text-[clamp(60px,11.5vw,190px)] uppercase !leading-[0.86]">
            Logistika
          </span>
        </h2>
        <p className="max-w-[320px] text-[12.5px] leading-[1.45] text-ink/75 md:mb-[1.2vw] md:mr-[2vw]">
          Vlastiti kamioni sa kranom, viljuškari i utovar istog ili sljedećeg dana za robu na stanju —
        </p>
      </div>

      <div className="mt-2.5 grid gap-2.5 md:grid-cols-[1fr_1fr_2fr]">
        {/* Plava kartica */}
        <Link href="/dostava" data-bento className="group flex min-h-[460px] flex-col rounded-[18px] bg-cobalt p-7 text-white" data-cursor="Dostava">
          <span className="label">Isporuka</span>
          <span className="display mt-auto text-[clamp(30px,2.6vw,44px)]"><Pw>Kran na etažu</Pw></span>
          <span className="mt-4 flex flex-wrap gap-1.5">
            <Tag tone="blue">Kamion</Tag>
            <Tag tone="blue">Kran</Tag>
          </span>
          <span className="mb-8 mt-auto max-w-[260px] pt-16 text-[12.5px] leading-[1.45] opacity-85">
            Paletu spuštamo na skelu ili etažu, ne na ulicu. Banja Luka i okolina —
          </span>
          <Arrow className="bg-white text-cobalt" />
        </Link>

        {/* Tamna kartica */}
        <Link href="/upit-za-izvodjace" data-bento className="group flex min-h-[460px] flex-col rounded-[18px] bg-[#1e1e1e] p-7 text-white" data-cursor="Upit">
          <span className="label">Partneri</span>
          <span className="display mt-auto text-[clamp(30px,2.6vw,44px)]"><Pw>Račun za izvođače</Pw></span>
          <span className="mt-4 flex flex-wrap gap-1.5">
            <Tag tone="dark">Rabat</Tag>
          </span>
          <span className="mb-8 mt-auto max-w-[260px] pt-16 text-[12.5px] leading-[1.45] opacity-85">
            Firme i majstori naručuju po svojim cijenama, na odloženo plaćanje —
          </span>
          <Arrow className="bg-white text-[#1e1e1e]" />
        </Link>

        {/* Fotografija + svijetli panel */}
        <Link href="/prodavnica" data-bento className="group flex min-h-[460px] flex-col overflow-hidden rounded-[18px] bg-[#d9d9d9] text-ink" data-cursor="Katalog">
          <div data-parallax="6" className="relative h-[260px] overflow-hidden rounded-[18px] bg-[#111] md:h-[54%]">
            <img src="/editorial/bento-mono.webp" alt="Radnik u rukavicama nosi pocinčani profil" className="absolute inset-0 h-full w-full object-cover grayscale" />
            <span className="label absolute left-7 top-7 text-white">Stovarište</span>
            <span className="absolute right-6 top-6 flex gap-1.5 text-white">
              <Tag tone="photo">Ploče</Tag>
              <Tag tone="photo">Profili</Tag>
              <Tag tone="photo">Vuna</Tag>
            </span>
          </div>
          <div className="flex flex-1 flex-col p-7">
            <p className="font-pretty max-w-[600px] text-[clamp(22px,1.9vw,30px)] leading-[1.2]">
              <Pw>Knauf sistemi, izolacija i veziva na veliko i malo — složeni u sistem i spremni za utovar.</Pw>
            </p>
            <Arrow className="mt-auto bg-ink pt-0 text-white" />
          </div>
        </Link>
      </div>
    </section>
  )
}
