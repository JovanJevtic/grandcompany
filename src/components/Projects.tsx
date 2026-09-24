'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { BRAND } from './SiteChrome'
import { TONES, revealChars, revealLines, revealMedia } from '@/lib/reveal'

type Block =
  | { kind: 'wide'; text: string }
  | { kind: 'pair'; text: string }
  | { kind: 'tall'; text: string }

type Item = { category: string; blocks: Block[] }

// Sve grupe ponude nose isti naziv: GRAND COMPANY. Razlikuju se po kategoriji i opisu.
const ITEMS: Item[] = [
  {
    category: 'Građevinski materijal',
    blocks: [
      {
        kind: 'wide',
        text: 'Opšta prodaja materijala za gradnju i opremanje objekata, u veleprodaji i u maloprodaji.',
      },
      {
        kind: 'pair',
        text: 'Za privatne kupce i za izvođače radova, uz stručan savjet pri izboru materijala.',
      },
    ],
  },
  {
    category: 'Sistemi suhe gradnje',
    blocks: [
      {
        kind: 'tall',
        text: 'Materijali za građenje i uređenje enterijera suhim postupkom.',
      },
      {
        kind: 'pair',
        text: 'Stručni tim odgovara na pitanja i pomaže pri izboru pravog rješenja za vaš objekat.',
      },
    ],
  },
  {
    category: 'Kamena vuna',
    blocks: [
      {
        kind: 'pair',
        text: 'Izolacioni materijal koji prodajemo kao zaseban proizvod.',
      },
      {
        kind: 'wide',
        text: 'Uz to, u našoj djelatnosti su i drvo i sanitarna oprema.',
      },
    ],
  },
]

// Siva ploča umjesto fotografije. Tri sloja: maska (clip-path), zum, paralaksa.
function Media({ tone, className = '' }: { tone: number; className?: string }) {
  return (
    <div
      data-media
      className={`relative cursor-pointer overflow-hidden ${className}`}
      style={{ clipPath: 'inset(0% 50% 0% 50%)' }}
    >
      <div data-scale className="absolute inset-0">
        <div
          data-par
          className="absolute left-0 top-[-10%] h-[120%] w-full transition-[filter] duration-500 hover:brightness-95"
          style={{ background: TONES[tone % TONES.length] }}
        />
      </div>
    </div>
  )
}

const TEXT = 'invisible max-w-full text-[clamp(13px,1.25vw,20px)] uppercase leading-[1.05] md:max-w-[71%]'

function Article({ item, index }: { item: Item; index: number }) {
  let tone = index * 2
  return (
    <article data-project className="relative z-30 flex flex-col md:flex-row">
      {/* Lijeva kolona ostaje zalijepljena dok se desno mijenjaju slike. */}
      <div className="px-5 pt-[12dvh] md:sticky md:top-0 md:ml-[8.33vw] md:h-dvh md:w-[16.67vw] md:self-start md:px-0 md:pt-[31dvh]">
        <h3
          data-title
          className="invisible text-center text-[clamp(18px,1.67vw,30px)] uppercase leading-none"
        >
          {BRAND}
        </h3>
        <p data-cat className="invisible mt-[34px] text-center text-[clamp(11px,0.97vw,16px)] uppercase leading-none">
          {item.category}
        </p>
        <Media tone={tone++} className="mt-10 hidden aspect-[2/3] w-full md:block" />
      </div>

      <div className="flex flex-col gap-[15dvh] px-5 pb-[6dvh] pt-[8dvh] md:ml-[8.33vw] md:w-[58.33vw] md:px-0 md:pb-0 md:pt-[15dvh]">
        {item.blocks.map((block, i) => (
          <div key={i} className="flex flex-col gap-[15dvh]">
            {block.kind === 'wide' && <Media tone={tone++} className="aspect-[840/509] w-full" />}
            {block.kind === 'tall' && <Media tone={tone++} className="aspect-[0.9] w-full md:ml-[14.9%] md:w-[70.3%]" />}
            {block.kind === 'pair' && (
              <div className="flex justify-between gap-3">
                <Media tone={tone++} className="aspect-[362/471] w-[48%] md:w-[43.1%]" />
                <Media tone={tone++} className="aspect-[362/471] w-[48%] md:w-[43.1%] md:-translate-y-[15dvh]" />
              </div>
            )}
            <p data-text className={TEXT}>
              {block.text}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
}

export default function Projects() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }

        gsap.utils.toArray<HTMLElement>('[data-project]', el).forEach((project) => {
          // Naslov i kategorija izranjaju kad projekat uđe u ekran.
          revealChars(project.querySelector('[data-title]')!, reduce, 'top 60%', project)
          revealChars(project.querySelector('[data-cat]')!, reduce, 'top 60%', project)
          project.querySelectorAll('[data-text]').forEach((t) => revealLines(t, reduce, 'top 92%'))
        })

        gsap.utils.toArray<HTMLElement>('[data-media]', el).forEach((media) => {
          revealMedia(media, reduce)
          const par = media.querySelector('[data-par]')
          // Paralaksa: slika se polako pomjera unutar okvira dok okvir prolazi ekranom.
          if (par && !reduce) {
            gsap.fromTo(
              par,
              { yPercent: -8 },
              {
                yPercent: 8,
                ease: 'none',
                scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true },
              },
            )
          }
        })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative z-30">
      {ITEMS.map((item, i) => (
        <Article key={i} item={item} index={i} />
      ))}
    </div>
  )
}
