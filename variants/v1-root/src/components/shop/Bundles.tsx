'use client'

import { COLORS } from '@/lib/content'
import { BUNDLES, BUNDLES_BY_QUOTE, bundleTotal, formatNumber, formatPrice, productById, type Bundle } from '@/lib/shop'
import ShopLink from './ShopLink'
import { Photo, Section, SectionHead } from './parts'
import { useShop } from './ShopProvider'

// Gotovi kompleti (komponenta Bundles iz grand-maison, prenesena u jezik grand-root: serif naslovi, oznake,
// pilule, tanke linije u akcentnoj boji). Količine računa Knauf W111 norma za zid 4 × 2,5 m (10 m²).
// Bez popusta: komplet košta tačno koliko i artikli pojedinačno.

const PHOTO: Record<string, { src: string; alt: string }> = {
  w111: { src: '/photos/drywall-frame.jpg', alt: 'Primjena: potkonstrukcija pregradnog zida' },
  w112: { src: '/photos/drywall-wall.jpg', alt: 'Primjena: obložen pregradni zid' },
}

function BundleRow({ b, index }: { b: Bundle; index: number }) {
  const { addMany, cart } = useShop()
  const total = bundleTotal(b)
  const photo = PHOTO[b.id] ?? { src: '/photos/drywall-room.jpg', alt: 'Primjena: suha gradnja' }
  const inCart = b.items.every((it) => cart.some((l) => l.id === it.id))

  return (
    <article className="grid grid-cols-12 gap-x-6 gap-y-8 border-t border-current py-[3vw] max-md:py-10">
      <div className="col-span-12 md:col-span-5">
        <p data-reveal className="lbl mb-4 flex justify-between">
          <span>0{index + 1}</span>
          <span>{b.area}</span>
        </p>
        <figure>
          <Photo src={photo.src} alt={photo.alt} className="aspect-[5/4] w-full" index={index} />
          <figcaption className="lbl mt-3">Fotografija primjene, ne sadržaj kompleta</figcaption>
        </figure>
      </div>

      <div className="col-span-12 flex flex-col md:col-span-7 md:pl-[2vw]">
        <p data-reveal className="lbl">
          Knauf {b.code}
          {b.rw ? ` · zvučna izolacija Rw ${b.rw} dB` : ''}
        </p>
        <h3 data-reveal className="mt-4 font-serif uppercase leading-[0.92] tracking-[-0.01em] [font-size:clamp(34px,4.2vw,76px)]">
          {b.name}
        </h3>
        <p data-reveal className="copy-l mt-4 italic">
          {b.note}
        </p>
        <p data-reveal className="copy mt-4 max-w-[52ch] text-ink">
          {b.build}
        </p>

        <ul data-reveal className="mt-8 border-t border-current text-ink">
          {b.items.map((it) => {
            const p = productById(it.id)!
            return (
              <li key={it.id} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 border-b py-3" style={{ borderColor: 'color-mix(in srgb, currentColor 25%, transparent)' }}>
                <span className="copy">
                  <span className="tabular-nums" style={{ color: COLORS.how }}>
                    {formatNumber(it.qty)} {p.unit}
                  </span>{' '}
                  · {p.name}
                </span>
                <span className="copy shrink-0 tabular-nums">{formatPrice(p.price * it.qty)}</span>
                <span className="lbl col-span-2" style={{ color: COLORS.base }}>
                  {it.note} · potrebno {it.need}
                </span>
              </li>
            )
          })}
        </ul>

        <div data-reveal className="mt-8 flex flex-wrap items-end justify-between gap-6 md:mt-auto md:pt-8">
          <div>
            <p className="lbl">Ukupno {b.area}, sa PDV-om</p>
            <p className="mt-2 font-serif leading-none text-ink [font-size:clamp(34px,3.4vw,56px)]">{formatPrice(total)}</p>
            <p className="lbl mt-2" style={{ color: COLORS.base }}>
              Isto kao pojedinačno · {formatPrice(total / 10)} po m² zida
            </p>
          </div>
          <button
            type="button"
            className="pill pill-solid"
            onClick={() => addMany(b.items.map((it) => ({ id: it.id, qty: it.qty })), `Komplet ${b.code}`)}
          >
            {inCart ? 'Dodaj još jedan komplet +' : 'Dodaj komplet u korpu +'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Bundles() {
  return (
    <Section id="kompleti" color={COLORS.how}>
      <SectionHead no="005" side={`${BUNDLES.length} kompleta · Knauf W111 norma`} title="Kompleti" />
      <div className="mt-[3vw] grid grid-cols-12 gap-x-6 gap-y-6 max-md:mt-6">
        <p data-reveal className="copy-l col-span-12 max-w-[26ch] md:col-span-6">
          Gotov spisak materijala za pregradni zid, <em>za 10 m² zida</em>.
        </p>
        <p data-reveal className="copy col-span-12 max-w-[44ch] text-ink md:col-span-5 md:col-start-8">
          Zid 4 m dužine i 2,5 m visine, sa 5% otpada, zaokruženo na cijele ploče, profile i vreće. Za drugu površinu
          promijenite količine u korpi ili nam pošaljite predmjer.
        </p>
      </div>

      <div className="mt-[4vw] border-b border-current max-md:mt-10">
        {BUNDLES.map((b, i) => (
          <BundleRow key={b.id} b={b} index={i} />
        ))}
      </div>

      <div data-reveal className="mt-10 flex flex-wrap items-baseline justify-between gap-6">
        <p className="copy max-w-[56ch] text-ink">
          {BUNDLES_BY_QUOTE.map((w) => `${w.code} (${w.name.toLowerCase()})`).join(' i ')} računamo po vašem predmjeru.
        </p>
        <ShopLink href="/#ponuda" className="pill">
          Zatražite ponudu →
        </ShopLink>
      </div>
    </Section>
  )
}
