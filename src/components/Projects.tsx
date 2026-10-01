'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import { BRAND } from './SiteChrome'
import { revealChars, revealLines, revealMedia } from '@/lib/reveal'

// Stovarište i vozni park: samo naše fotografije i činjenice iz podataka firme. Nema izmišljenih projekata.
type Block =
  | { kind: 'wide'; text: string; photos: [Photo] }
  | { kind: 'pair'; text: string; photos: [Photo, Photo] }
  | { kind: 'tall'; text: string; photos: [Photo] }

type Photo = { src: string; alt: string }
type Item = { category: string; side: Photo; blocks: Block[] }

const ITEMS: Item[] = [
  {
    category: 'Stovarište',
    side: { src: '/photos/tabla.jpg', alt: 'Tabla Grand Company na ulazu' },
    blocks: [
      {
        kind: 'wide',
        photos: [{ src: '/photos/stovariste-pregled.jpg', alt: 'Stovarište sa paletama materijala' }],
        text: 'Stovarište u Banjoj Luci. Ploče, profili, izolacija i veziva stoje na paletama, spremni za utovar.',
      },
      {
        kind: 'pair',
        photos: [
          { src: '/photos/stovariste-ulaz.jpg', alt: 'Ulaz na stovarište' },
          { src: '/photos/palete-viljuskar.jpg', alt: 'Viljuškar utovaruje palete' },
        ],
        text: 'Stanje na sajtu čitamo iz Pantheona, istog sistema iz kojeg radi prodaja. Viljuškar utovara palete direktno na kamion.',
      },
    ],
  },
  {
    category: 'Vozni park',
    side: { src: '/photos/stovariste-vazduh.jpg', alt: 'Stovarište iz vazduha' },
    blocks: [
      {
        kind: 'tall',
        photos: [{ src: '/photos/kran-utovar.jpg', alt: 'Kamion sa kranom pri utovaru' }],
        text: 'Vlastiti kamioni sa kranom spuštaju paletu na etažu ili skelu, ne na ulicu.',
      },
      {
        kind: 'wide',
        photos: [{ src: '/photos/prodavnica.jpg', alt: 'Prodavnica Grand Company' }],
        text: 'Prodavnica za manje količine i lično preuzimanje. CE deklaracija i protivpožarni atest idu uz otpremnicu.',
      },
    ],
  },
]

// Fotografija u tri sloja: maska (clip-path), zum, paralaksa.
function Media({ photo, className = '' }: { photo: Photo; className?: string }) {
  return (
    <div
      data-media
      className={`relative overflow-hidden bg-ink/10 ${className}`}
      style={{ clipPath: 'inset(0% 50% 0% 50%)' }}
    >
      <div data-scale className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img decoding="async"
          data-par
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className="absolute left-0 top-[-10%] h-[120%] w-full object-cover transition-[filter] duration-500 hover:brightness-95"
        />
      </div>
    </div>
  )
}

const TEXT = 'invisible max-w-full text-[clamp(13px,1.25vw,20px)] uppercase leading-[1.05] md:max-w-[71%]'

function Article({ item }: { item: Item }) {
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
        <Media photo={item.side} className="mt-10 hidden aspect-[2/3] w-full md:block" />
      </div>

      <div className="flex flex-col gap-[15dvh] px-5 pb-[6dvh] pt-[8dvh] md:ml-[8.33vw] md:w-[58.33vw] md:px-0 md:pb-0 md:pt-[15dvh]">
        {item.blocks.map((block, i) => (
          <div key={i} className="flex flex-col gap-[15dvh]">
            {block.kind === 'wide' && <Media photo={block.photos[0]} className="aspect-[840/509] w-full" />}
            {block.kind === 'tall' && <Media photo={block.photos[0]} className="aspect-[0.9] w-full md:ml-[14.9%] md:w-[70.3%]" />}
            {block.kind === 'pair' && (
              <div className="flex justify-between gap-3">
                <Media photo={block.photos[0]} className="aspect-[362/471] w-[48%] md:w-[43.1%]" />
                <Media photo={block.photos[1]} className="aspect-[362/471] w-[48%] md:w-[43.1%] md:-translate-y-[15dvh]" />
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
        <Article key={i} item={item} />
      ))}
    </div>
  )
}
