'use client'

import { useScrollTo } from '@/lib/useScrollTo'
import { Photo, SectionTitle } from './ui'
import Reveal from './shop/Reveal'

type Service = { title: string; text: string; src: string; alt: string; crop?: string; link: { label: string; to: string } }

const SERVICES: Service[] = [
  {
    title: 'Istovar kranom na etažu',
    text: 'Vlastiti kamioni sa kranom spuštaju paletu na etažu ili skelu, ne na ulicu. Preporučujemo ga za narudžbe preko jedne tone.',
    src: '/photos/kran-utovar.jpg',
    alt: 'Kamion Grand Company sa kranom utovara palete na stovarištu, snimak iz vazduha',
    link: { label: 'Cijene istovara', to: 'dostava' },
  },
  {
    title: 'Stovarište i zalihe',
    text: 'Ploče, profili, vuna i vreće na paletama. Stanje na sajtu čitamo iz Pantheona, istog sistema iz kojeg radi prodaja.',
    src: '/photos/stovariste-pregled.jpg',
    alt: 'Palete ploča, vune i blokova na stovarištu Grand Company',
    // close crop on the pallets, so it does not repeat the aerial views of the hero and the shop tile
    crop: 'origin-[22%_78%] scale-[1.9]',
    link: { label: 'Katalog', to: 'katalog' },
  },
  {
    title: 'Maloprodaja',
    text: 'Prodavnica na stovarištu za manje količine i pribor, bez minimalne narudžbe.',
    src: '/photos/prodavnica.jpg',
    alt: 'Prodavnica Grand Company sa narandžastom fasadom i paletama ispred',
    link: { label: 'Kontakt', to: 'kontakt' },
  },
  {
    title: 'Stručni savjet i obračun',
    text: 'Pomažemo da izaberete sistem i izračunamo količine: sa otpadom i zaokruženo na cijela pakovanja, da se ne kupuje višak napamet.',
    src: '/stock/board-cut.jpg',
    alt: 'Zasijecanje gips-kartonske ploče nožem uz metar',
    link: { label: 'Kalkulator zida', to: 'kalkulator' },
  },
  {
    title: 'Partnerski program',
    text: 'Za zanatlije i građevinske firme: rabat po ugovoru, kreditni limit i plaćanje po fakturi sa valutom do 90 dana.',
    src: '/photos/palete-viljuskar.jpg',
    alt: 'Viljuškar prenosi palete na stovarištu Grand Company',
    link: { label: 'Nivoi i uslovi', to: 'partneri' },
  },
]

function Tile({ s, big = false, sizes }: { s: Service; big?: boolean; sizes: string }) {
  const scrollTo = useScrollTo()
  return (
    <article>
      <Photo src={s.src} alt={s.alt} sizes={sizes} quality={big || s.crop ? 85 : 75} imgClassName={s.crop} className={big ? 'aspect-[4/3] w-full lg:aspect-[16/11]' : 'aspect-[16/10] w-full'} />
      <h3 className={`mt-4 font-display font-medium tracking-[-0.015em] ${big ? 'text-[22px] md:text-[26px]' : 'text-[18px] md:text-[19px]'}`}>
        {s.title}
      </h3>
      <p className={`mt-1.5 text-[14px] leading-[1.6] text-muted ${big ? 'max-w-[52ch]' : 'max-w-[44ch]'}`}>{s.text}</p>
      <button type="button" onClick={() => scrollTo(s.link.to)} className="link-u mt-3 text-[13px] font-medium">
        {s.link.label} →
      </button>
    </article>
  )
}

// Usluge: grand-maison Services content, laid out as the Drvex "Usluge i pogon" photo grid —
// one large photo with two stacked beside it, then a second row. Our own photos wherever the subject is us.
export default function Services() {
  const [crane, yard, shop, advice, partners] = SERVICES
  return (
    <section id="usluge" aria-labelledby="usluge-h" className="relative z-10 bg-canvas py-16 lg:py-24">
      <div className="gutter wrap">
        <SectionTitle id="usluge-h" title="Usluge i stovarište" lead="Roba, prevoz i savjet sa jednog mjesta u Banjoj Luci." />

        <div className="mt-10 grid gap-x-5 gap-y-10 lg:grid-cols-[1.9fr_1fr]">
          <Reveal>
            <Tile s={crane} big sizes="(min-width: 1024px) 62vw, 100vw" />
          </Reveal>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
            <Reveal delay={90}>
              <Tile s={yard} sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw" />
            </Reveal>
            <Reveal delay={180}>
              <Tile s={shop} sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw" />
            </Reveal>
          </div>
        </div>
        <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:mt-14">
          <Reveal>
            <Tile s={advice} sizes="(min-width: 640px) 50vw, 100vw" />
          </Reveal>
          <Reveal delay={90}>
            <Tile s={partners} sizes="(min-width: 640px) 50vw, 100vw" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
