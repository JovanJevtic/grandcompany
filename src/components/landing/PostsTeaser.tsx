'use client'

import Link from 'next/link'
import { useRef } from 'react'
import PostArtDraw from '@/components/posts/PostArtDraw'
import StepBand from '@/components/ui/StepBand'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import { POSTS } from '@/lib/posts'

// Tri najnovije objave na tamno plavoj stepenastoj traci (profil "valley"). Kartica na hover
// invertuje boje: bijela ploča izraste odozdo (stepenasto), a crtež i tekst postanu tamni.

// Datum ručno (dd.mm.gggg.): Node i browser nemaju iste podatke za lokal sr-Latn-BA, pa bi
// toLocaleDateString dao različit tekst na serveru i u browseru (greška pri hidrataciji).
const date = (iso: string) => iso.split('-').reverse().join('.') + '.'

export default function PostsTeaser() {
  const root = useRef<HTMLDivElement>(null)
  const latest = [...POSTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  useGSAP(
    () => {
      const el = root.current!
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        revealChars(el.querySelector('[data-head]')!, reduce, 'top 80%')
        const cards = el.querySelectorAll('[data-post]')
        if (reduce) return
        gsap.fromTo(
          cards,
          { y: 80, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.1, ease: EASE.quint, stagger: 0.12, scrollTrigger: { trigger: el.querySelector('[data-grid]'), start: 'top 85%' } },
        )
      })
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <StepBand id="objave" profile="valley" steps={9} aria-label="Objave">
        <div className="px-5 pb-[10dvh] pt-[6dvh] md:px-[3.05vw]">
          <p className="flex justify-between border-t border-bg/40 pt-3 font-mono text-micro uppercase tracking-wider">
            <span>07 — Objave</span>
            <span>Vodiči i sistemi</span>
          </p>
          <div className="mt-[6dvh] flex flex-wrap items-end justify-between gap-8">
            <h2 data-head className="invisible max-w-[12ch] text-[clamp(44px,6.6vw,128px)] font-bold uppercase leading-[0.88] tracking-[-0.02em]">
              Znanje sa gradilišta
            </h2>
            <Link
              href="/objave"
              className="group inline-flex items-center gap-10 border-2 border-bg px-5 py-4 font-mono text-micro uppercase tracking-wider transition-colors hover:bg-bg hover:text-navy"
            >
              Sve objave
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </div>

          <div data-grid className="mt-[8dvh] grid gap-4 md:grid-cols-3">
            {latest.map((p) => (
              <Link
                key={p.slug}
                href={`/objave/${p.slug}`}
                data-post
                className="group relative flex min-h-[64dvh] flex-col overflow-hidden border border-bg/30 p-5 [--art-fill:var(--navy)] hover:[--art-fill:var(--bg)]"
              >
                {/* bijela ploča koja izraste na hover, u pet stepenica */}
                <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-bg transition-transform duration-700 [transition-timing-function:steps(5)] group-hover:scale-y-100" />
                <span className="relative flex justify-between font-mono text-[11px] uppercase tracking-wider transition-colors duration-300 group-hover:text-navy">
                  <span className="flex items-center gap-2">
                    <i className="size-2 bg-accent" />
                    {p.tag}
                  </span>
                  <span className="tabular-nums opacity-70">
                    {date(p.date)} · {p.read} min
                  </span>
                </span>
                <PostArtDraw kind={p.art} className="relative my-8 aspect-[4/3] w-full text-bg/85 transition-colors duration-300 group-hover:text-navy" />
                <span className="relative mt-auto block text-[clamp(22px,1.9vw,34px)] font-bold uppercase leading-[0.95] transition-colors duration-300 group-hover:text-navy">
                  {p.title}
                </span>
                <span className="relative mt-4 block text-[clamp(13px,1vw,16px)] font-medium leading-snug opacity-75 transition-colors duration-300 group-hover:text-navy">
                  {p.lead}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </StepBand>
    </div>
  )
}
