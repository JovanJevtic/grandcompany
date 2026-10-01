'use client'

import Link from 'next/link'
import { useRef } from 'react'
import PostArtDraw from '@/components/posts/PostArtDraw'
import Cta from '@/components/ui/Cta'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import { POSTS } from '@/lib/posts'
import Pw from '@/components/ui/Pw'

// Tri najnovije objave. Kartice zadržavaju linijske crteže (jedino mjesto na sajtu, uz
// "Po namjeni" i brendove, gdje su ilustracije umjesto fotografija). Na hover se crtež podigne.

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
          { y: 0, autoAlpha: 1, duration: 1.1, ease: EASE.quint, stagger: 0.12, scrollTrigger: { trigger: el.querySelector('[data-grid]'), start: 'top 85%' } },
        )
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="objave" className="relative z-20 bg-bg py-[20vh]" aria-label="Objave">
      <h2 data-head className="display invisible mx-auto px-5 text-center text-title"><Pw>
        Znanje sa <em>gradilišta</em>
      </Pw></h2>

      <div data-grid className="mx-auto mt-[10vh] grid w-[calc(100%-40px)] gap-x-[2vw] gap-y-16 md:w-[88vw] md:grid-cols-3">
        {latest.map((p, i) => (
          <Link key={p.slug} href={`/objave/${p.slug}`} data-post data-cursor="Čitaj" className={`group flex flex-col ${i === 1 ? 'md:mt-[10vh]' : ''}`}>
            <span className="flex aspect-[4/5] items-center justify-center bg-plate px-[12%] [--art-fill:var(--plate)]">
              <PostArtDraw kind={p.art} className="w-full text-ink/80 transition-transform duration-700 ease-[var(--ease-out)] group-hover:-translate-y-3" />
            </span>
            <span className="mt-5 flex justify-between text-[13px] italic opacity-60">
              <span>{p.tag}</span>
              <span className="tabular-nums not-italic">{date(p.date)}</span>
            </span>
            <span className="mt-2 block text-[clamp(22px,1.8vw,30px)] leading-[1.1] tracking-[-0.01em]">
              <span className="ulink">{p.title}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-[10vh] flex justify-center">
        <Cta href="/objave">Objave</Cta>
      </div>
    </section>
  )
}
