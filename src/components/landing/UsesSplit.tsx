'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { drawOnScroll } from '@/lib/draw'
import { EASE, MQ } from '@/lib/motion'
import { revealChars, revealLines } from '@/lib/reveal'
import { CATEGORIES, PRODUCTS, USES, artikala, type UseId } from '@/lib/shop'
import { axisShift } from './iso'
import UseArt from './UseArt'

// Prvi ekran poslije herosa (obrazac sa reference: veliki naslov na svijetlom, desno tamno plava
// kolona sa numerisanim redovima). Lijevo stoji naslov, uvod, dugme i četiri grupe artikala;
// desno se skrola pet vrsta radova, svaka sa rastavljenim presjekom sistema koji se iscrtava
// i razmiče po slojevima dok red prolazi kroz ekran.

const COPY: Record<UseId, string> = {
  'pregradni-zid':
    'Nenosivi zid na CW i UW profilima, obložen gips-kartonskim pločama s obje strane. Kamena vuna u šupljini nosi zvučnu izolaciju.',
  'spusteni-plafon':
    'Ploče na mreži CD profila, obješene o stropnu ploču direktnim ovjesima. Prostor iznad ostaje za instalacije i rasvjetu.',
  fasada:
    'Stiropor lijepljen na zid, armiran mrežicom utisnutom u ljepilo. Topla fasada bez debljeg zida i bez skele duže nego što treba.',
  potkrovlje:
    'Vuna između i ispod rogova, CD potkonstrukcija i obloga od ploča. Prostor ispod krova postaje soba.',
  podovi:
    'Plivajući pod: toplotna izolacija, folija, cementni estrih, pa ljepilo i keramika. Svaki sloj je na stanju.',
}

// Kratko ime artikla za listu: bez brenda na početku (brend je u katalogu).
const short = (name: string) => name.replace(/^(Knauf Insulation|Knauf|Ceresit)\s+/, '')

export default function UsesSplit() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }

        revealChars(el.querySelector('[data-head]')!, reduce, 'top 75%')
        revealLines(el.querySelector('[data-lead]')!, reduce, 'top 90%')

        gsap.utils.toArray<HTMLElement>('[data-use]', el).forEach((row) => {
          revealChars(row.querySelector('[data-title]')!, reduce, 'top 80%', row)
          revealLines(row.querySelector('[data-text]')!, reduce, 'top 80%')

          const svg = row.querySelector('svg')!
          drawOnScroll(svg, reduce, { trigger: row, start: 'top 70%', duration: 1.2 })

          const bullets = row.querySelectorAll('[data-bullet]')
          if (reduce) gsap.set(bullets, { autoAlpha: 1 })
          else
            gsap.fromTo(
              bullets,
              { autoAlpha: 0, x: -12 },
              { autoAlpha: 1, x: 0, duration: 0.7, ease: EASE.out, stagger: 0.07, scrollTrigger: { trigger: row, start: 'top 55%' } },
            )

          if (reduce) return
          // Razmicanje slojeva: od sklopljenog sistema (red ulazi) do rastavljenog (red izlazi).
          const axis = svg.dataset.axis as 'x' | 'y' | 'z'
          const gap = Number(svg.dataset.gap)
          gsap.utils.toArray<SVGGElement>('[data-layer]', svg).forEach((layer, k) => {
            const { x, y } = axisShift(axis, k * gap)
            gsap.fromTo(
              layer,
              { x: 0, y: 0 },
              { x, y, ease: 'none', scrollTrigger: { trigger: row, start: 'top 60%', end: 'bottom 30%', scrub: 0.8 } },
            )
          })
        })

        // Brojač na lijevoj strani prati red koji je trenutno u sredini ekrana.
        const counter = el.querySelector<HTMLElement>('[data-counter]')!
        const label = el.querySelector<HTMLElement>('[data-current]')!
        gsap.utils.toArray<HTMLElement>('[data-use]', el).forEach((row, i) => {
          ScrollTrigger.create({
            trigger: row,
            start: 'top 50%',
            end: 'bottom 50%',
            onToggle: (self) => {
              if (!self.isActive) return
              counter.textContent = `0${i + 1}`
              label.textContent = USES[i].name
              if (!reduce) gsap.fromTo([counter, label], { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: EASE.out })
            },
          })
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="radovi" className="relative z-20 bg-bg md:grid md:grid-cols-2" aria-label="Materijal po vrsti radova">
      {/* Lijevo: naslov stoji dok se desno skrola. */}
      <div className="flex flex-col justify-between px-5 pb-12 pt-[14dvh] md:sticky md:top-0 md:h-dvh md:self-start md:px-[2.2vw] md:pb-[5dvh] md:pt-[11dvh]">
        <div>
          <p className="mb-[4dvh] flex justify-between border-t-2 border-ink pt-3 font-mono text-micro font-medium uppercase tracking-wider">
            <span>01 — Kategorije</span>
            <span>{CATEGORIES.length} grupe</span>
          </p>
          <h2 data-head className="invisible text-[clamp(52px,8.4vw,168px)] font-bold uppercase leading-[0.86] tracking-[-0.02em]">
            <span className="block">Materijal</span>
            <span className="block text-right">za svaki</span>
            <span className="block">sloj</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:ml-[40%] md:mt-0">
          <p data-lead className="invisible text-[clamp(16px,1.35vw,22px)] font-semibold leading-[1.25] normal-case">
            Knauf sistemi suhe gradnje, izolacija, veziva i pribor, na veliko i malo. Izaberite vrstu radova, a mi
            složimo sistem od profila i vijaka do mase za spojeve, i spustimo ga kranom na etažu.
          </p>

          <ul className="border-b border-ink/20 font-mono text-micro uppercase">
            {CATEGORIES.map((c) => (
              <li key={c.id} className="border-t border-ink/20">
                <Link
                  href={`/prodavnica?kategorija=${c.id}`}
                  className="group flex items-center justify-between py-2.5 transition-[padding] duration-300 hover:pl-2"
                >
                  <span className="flex items-center gap-3">
                    <i className="size-2 bg-ink transition-colors group-hover:bg-accent" />
                    {c.name}
                  </span>
                  <span className="tabular-nums opacity-60">{PRODUCTS.filter((p) => p.category === c.id).length}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-6">
            <Link
              href="/prodavnica"
              className="group inline-flex items-center gap-10 bg-ink px-5 py-4 font-mono text-micro font-medium uppercase tracking-wider text-bg transition-colors hover:bg-navy"
            >
              U prodavnicu
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
            <p className="hidden text-right font-mono text-micro uppercase md:block" aria-live="polite">
              <span className="inline-block overflow-hidden align-bottom">
                <span data-counter className="inline-block tabular-nums">
                  01
                </span>
              </span>
              <span className="opacity-40"> / 0{USES.length}</span>
              <br />
              <span className="inline-block overflow-hidden align-bottom">
                <span data-current className="inline-block">
                  {USES[0].name}
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Desno: tamno plava kolona, pet vrsta radova. */}
      <div className="bg-navy text-bg [--art-fill:var(--navy)]">
        <p className="flex justify-between border-b border-bg/15 px-5 pb-4 pt-[14dvh] font-mono text-micro font-medium uppercase tracking-wider md:px-[3vw] md:pt-[11dvh]">
          <span>05 — Po namjeni</span>
          <span>{USES.length} vrsta radova</span>
        </p>

        {USES.map((u, i) => {
          const items = PRODUCTS.filter((p) => p.uses.includes(u.id))
          return (
            <article
              key={u.id}
              data-use
              className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-8 border-b border-bg/15 px-5 py-[9dvh] md:min-h-[92dvh] md:grid-cols-[3.2vw_1.15fr_1fr] md:gap-x-[2vw] md:px-[3vw]"
            >
              <span className="pt-2 font-mono text-micro tabular-nums opacity-60">0{i + 1}</span>
              <h3 data-title className="invisible text-[clamp(32px,3vw,58px)] font-bold uppercase leading-[0.92] tracking-[-0.01em]">
                {u.name}
              </h3>
              <p data-text className="invisible col-span-2 text-[clamp(15px,1.15vw,20px)] font-medium leading-[1.3] opacity-90 md:col-span-1">
                {COPY[u.id]}
              </p>

              <div className="col-span-2 md:col-span-1 md:col-start-2">
                <UseArt use={u.id} className="w-full max-w-[560px] text-bg/90 md:-ml-[1vw]" title={`Presjek sistema: ${u.name}`} />
              </div>

              <div className="col-span-2 flex flex-col justify-end gap-8 md:col-span-1 md:col-start-3 md:row-start-2">
                <ul className="grid gap-2 font-mono text-[clamp(11px,0.9vw,14px)] uppercase tracking-wide">
                  {items.slice(0, 5).map((p) => (
                    <li key={p.id} data-bullet className="invisible flex gap-3">
                      <i className="mt-[0.35em] size-2 shrink-0 bg-accent" />
                      <span>{short(p.name)}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/prodavnica?namjena=${u.id}`}
                  className="group flex items-center justify-between border-t border-bg/30 pt-3 font-mono text-micro uppercase tracking-wider hover:text-accent"
                >
                  <span>{artikala(items.length)}</span>
                  <span>
                    Pogledaj{' '}
                    <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                      →
                    </span>
                  </span>
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
