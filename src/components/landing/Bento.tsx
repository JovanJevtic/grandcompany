'use client'

/* eslint-disable @next/next/no-img-element -- editorijalna fotografija iz /public, već u WebP */

import Link from 'next/link'
import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { useMediaMotion } from '@/lib/media'
import { EASE, MQ } from '@/lib/motion'

// B2B Partner Portal kao "bento" blok: veliko zaobljeno polje sa ogromnom riječju i kratkim tekstom
// desno, ispod tri kartice — rabatna skala (kobalt), kreditni limit i valuta (tamna) i Pantheon ERP
// zalihe (fotografija). Podaci iz dokumentacije firme (PDF, tačke 3 i 5).

const Arrow = ({ className = '' }: { className?: string }) => (
  <span className={`grid size-[26px] place-items-center transition-transform duration-500 group-hover:translate-x-1.5 ${className}`} aria-hidden>
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
    <section ref={root} id="b2b" className="relative z-20 bg-bg px-3 py-[14vh] md:px-4" aria-label="B2B Partner Portal">
      {/* Gornje polje: ogromna riječ + kratak tekst desno */}
      <div className="flex flex-col gap-8 rounded-[18px] border-[1.5px] border-ink/80 px-6 py-10 md:flex-row md:items-end md:justify-between md:px-8 md:pb-[3.2vw] md:pt-[9vw]">
        <h2 className="overflow-hidden pb-[0.06em]">
          <span data-word className="display block text-[clamp(52px,10vw,170px)] !leading-[0.86]">
            B2B portal
          </span>
        </h2>
        <p className="max-w-[340px] text-[12.5px] leading-[1.55] text-ink/75 md:mb-[1.2vw] md:mr-[2vw]">
          Za građevinske firme, izvođače radova i subjekte visokogradnje: ugovoreni rabat, kreditni limit i stanje
          zaliha, povučeni iz Pantheon ERP-a.
        </p>
      </div>

      <div className="mt-2.5 grid gap-2.5 md:grid-cols-[1fr_1fr_2fr]">
        {/* Plava kartica: rabatna skala */}
        <Link href="/portal" data-bento className="group flex min-h-[340px] flex-col rounded-[18px] bg-cobalt p-7 text-white md:min-h-[460px]" data-cursor="Portal">
          <span className="label">Rabatna skala</span>
          <span className="display mt-auto text-[clamp(34px,3vw,52px)]">10–22%</span>
          <span className="mt-4 flex flex-wrap gap-1.5">
            <Tag tone="blue">Nivo 1 · 10%</Tag>
            <Tag tone="blue">Nivo 2 · 15%</Tag>
            <Tag tone="blue">Nivo 3 · 18–22%</Tag>
          </span>
          <span className="mb-8 mt-auto max-w-[260px] pt-12 text-[12px] leading-[1.5] opacity-85">
            Zanatlije i manji izvođači, srednje građevinske firme i veliki ugovorni partneri —
          </span>
          <Arrow className="bg-white text-cobalt" />
        </Link>

        {/* Tamna kartica: kreditni limit i valuta */}
        <Link href="/portal" data-bento className="group flex min-h-[340px] flex-col rounded-[18px] bg-[#1e1e1e] p-7 text-white md:min-h-[460px]" data-cursor="Portal">
          <span className="label">Kreditni limit</span>
          <span className="display mt-auto text-[clamp(34px,3vw,52px)]">30/60/90</span>
          <span className="mt-4 flex flex-wrap gap-1.5">
            <Tag tone="dark">Dana valute</Tag>
            <Tag tone="dark">Menica / garancija</Tag>
          </span>
          <span className="mb-8 mt-auto max-w-[260px] pt-12 text-[12px] leading-[1.5] opacity-85">
            Odobreni limit uz odgođeno plaćanje; iskorištenost limita vidite na portalu u realnom vremenu —
          </span>
          <Arrow className="bg-white text-[#1e1e1e]" />
        </Link>

        {/* Fotografija + svijetli panel: Pantheon ERP zalihe */}
        <Link href="/prodavnica" data-bento className="group flex min-h-[340px] flex-col overflow-hidden rounded-[18px] bg-[#d9d9d9] text-ink md:min-h-[460px]" data-cursor="Katalog">
          <div data-parallax="6" className="relative h-[260px] overflow-hidden rounded-[18px] bg-[#111] md:h-[54%]">
            <img src="/editorial/bento-mono.webp" alt="Pocinčani profili na regalima skladišta" className="absolute inset-0 h-full w-full object-cover" />
            <span className="label absolute left-7 top-7 text-white">Pantheon ERP</span>
            <span className="absolute right-6 top-6 flex gap-1.5 text-white max-md:left-7 max-md:right-auto max-md:top-14">
              <Tag tone="photo">Zalihe</Tag>
              <Tag tone="photo">Predračun</Tag>
              <Tag tone="photo">Fakture</Tag>
            </span>
          </div>
          <div className="flex flex-1 flex-col p-7">
            <p className="font-pretty max-w-[600px] text-[clamp(20px,1.7vw,28px)] leading-[1.15]">
              Stanje zaliha na skladištu Nenada Kostića 151 u realnom vremenu.
            </p>
            <Arrow className="mt-auto bg-ink pt-0 text-white" />
          </div>
        </Link>
      </div>
    </section>
  )
}
