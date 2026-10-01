'use client'

/* eslint-disable @next/next/no-img-element -- fotografije iz /public, već u WebP */

import Link from 'next/link'
import { useRef } from 'react'
import Cta from '@/components/ui/Cta'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import { POSTS, postPhoto } from '@/lib/posts'
import Pw, { pw } from '@/components/ui/Pw'

// Tri najnovija vodiča (ranije "objave"). Svaka kartica ima fotografiju teme (krupni plan materijala ili
// rada); na hover se fotografija blago približi.

// Datum ručno (dd.mm.gggg.): Node i browser nemaju iste podatke za lokal sr-Latn-BA, pa bi
// toLocaleDateString dao različit tekst na serveru i u browseru (greška pri hidrataciji).
const date = (iso: string) => iso.split('-').reverse().join('.') + '.'

export default function PostsTeaser() {
  const root = useRef<HTMLElement>(null)
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
          { y: 0, autoAlpha: 1, duration: 0.55, ease: EASE.quint, stagger: 0.05, scrollTrigger: { trigger: el.querySelector('[data-grid]'), start: 'top 85%' } },
        )
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="vodici" className="relative z-20 py-[14vh]" aria-label="Vodiči">
      <h2 data-head className="display invisible mx-auto px-5 text-center text-title"><Pw>
        Znanje sa <em>gradilišta</em>
      </Pw></h2>

      <div data-grid className="mx-auto mt-[10vh] grid w-[calc(100%-40px)] gap-x-[2vw] gap-y-16 md:w-[88vw] md:grid-cols-3">
        {latest.map((p, i) => (
          <Link key={p.slug} href={`/vodici/${p.slug}`} data-post data-cursor="Čitaj" className={`group flex flex-col ${i === 1 ? 'md:mt-[10vh]' : ''}`}>
            <span className="relative block aspect-[4/5] overflow-hidden bg-plate">
              <img
                src={postPhoto(p.slug)}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.05]"
              />
            </span>
            <span className="mt-5 flex justify-between text-[13px] opacity-60">
              <span>{p.tag}</span>
              <span className="tabular-nums not-italic">{date(p.date)}</span>
            </span>
            <span className="font-pretty mt-2 block text-[clamp(24px,2vw,34px)] leading-[1.1]">
              <span className="ulink">{pw(p.title)}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-[10vh] flex justify-center">
        <Cta href="/vodici">Vodiči</Cta>
      </div>
    </section>
  )
}
