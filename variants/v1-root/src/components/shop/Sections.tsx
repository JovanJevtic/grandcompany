import { COLORS } from '@/lib/content'
import { BENEFITS, CATEGORIES, MATERIALS, PRODUCTS, USES } from '@/lib/shop'
import { FilterLink } from './ShopLink'
import ShopLink from './ShopLink'
import ProductCard from './ProductCard'
import { Plate, Section, SectionHead, T } from './parts'

// Sekcije prodavnice koje su sadržajno statične (server-komponente). Interaktivni dijelovi (filteri, dugmad)
// su male klijentske komponente unutar njih.

// 06 — Prodavnica: uvod, prednosti, ploče.
export function ShopIntro() {
  return (
    <Section id="prodavnica" color={COLORS.why} className="!pt-[7vw] max-md:!pt-16">
      <SectionHead no="006" side="Građevinski materijal online" title="Prodavnica" />

      <div className="mt-[5vw] grid grid-cols-12 gap-x-6 gap-y-14 max-md:mt-10">
        <div className="col-span-12 md:col-span-5">
          <p data-reveal className="lbl">
            Kupujte uz stručan savjet
          </p>
          <p data-reveal className="copy-l mt-5">
            Materijal za gradnju i opremanje objekata, <em>za privatne kupce i za izvođače radova</em>. Odaberite artikle,
            a naš stručni tim potvrđuje narudžbu i pomaže pri izboru.
          </p>
          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            <ShopLink href="/#katalog" className="pill pill-solid">
              Pogledaj katalog
            </ShopLink>
            <ShopLink href="/#cijene" className="pill">
              Cijene i uslovi
            </ShopLink>
          </div>
        </div>

        <ul className="col-span-12 grid grid-cols-1 gap-x-6 sm:grid-cols-2 md:col-span-6 md:col-start-7">
          {BENEFITS.map((b, i) => (
            <li key={b.no} data-reveal style={{ ['--i' as string]: i }} className="border-t border-current pb-8 pt-4">
              <p className="lbl flex justify-between">
                <span>{b.no}</span>
                <span>{b.title}</span>
              </p>
              <p className="copy mt-6 text-ink">
                <T s={b.text} />
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-[7vw] grid grid-cols-12 items-end gap-x-4 max-md:mt-14 md:gap-x-6">
        <Plate tone={0} className="col-span-5 aspect-[3/4] md:col-span-3" />
        <Plate tone={3} index={1} className="col-span-7 aspect-[4/3] md:col-span-5" />
        <Plate tone={2} index={2} className="col-span-12 mt-4 aspect-[16/9] md:col-span-4 md:mt-0 md:aspect-[4/5]" />
      </div>
    </Section>
  )
}

// 06.1 — Novo u ponudi
export function NewArrivals() {
  const list = PRODUCTS.filter((p) => p.isNew).slice(0, 4)
  return (
    <Section id="novo" color={COLORS.who}>
      <SectionHead no="006.1" side="Novo u ponudi" title="Novo" />
      <div className="mt-[4vw] grid grid-cols-2 gap-x-4 gap-y-12 max-md:mt-8 md:grid-cols-4 md:gap-x-6 md:[&>*:nth-child(even)]:mt-[6vw]">
        {list.map((p, i) => (
          <ProductCard key={p.id} p={p} index={i} />
        ))}
      </div>
      <div data-reveal className="mt-14 flex justify-end">
        <ShopLink href="/#katalog" className="pill">
          Cijeli katalog →
        </ShopLink>
      </div>
    </Section>
  )
}

// 06.3 — Po vrsti radova: veliki redovi koji filtriraju katalog.
export function ByUse() {
  return (
    <Section id="radovi" color={COLORS.why}>
      <SectionHead no="006.3" side="Po vrsti radova" title="Radovi" />
      <p data-reveal className="copy-l mt-[3vw] max-w-[26ch] max-md:mt-6">
        Počnite od posla koji vas čeka, mi ćemo pokazati materijal.
      </p>
      <ul className="mt-[4vw] max-md:mt-8">
        {USES.map((u, i) => {
          const n = PRODUCTS.filter((p) => p.uses.includes(u.id)).length
          return (
            <li key={u.id} data-reveal style={{ ['--i' as string]: 0 }} className="border-t border-current last:border-b">
              <FilterLink
                patch={{ use: u.id }}
                className="group grid w-full cursor-pointer grid-cols-12 items-baseline gap-x-6 py-[1.4vw] text-left max-md:py-5"
              >
                <span className="lbl col-span-2 md:col-span-1">0{i + 1}</span>
                <span className="col-span-10 font-serif uppercase leading-[1] tracking-[-0.01em] transition-transform duration-700 [transition-timing-function:var(--ease-expo)] [font-size:clamp(34px,6.2vw,108px)] group-hover:translate-x-[1.6vw] group-hover:italic md:col-span-7">
                  {u.label}
                </span>
                <span className="lbl hidden md:col-span-3 md:block">{u.blurb}</span>
                <span className="lbl col-span-12 mt-2 md:col-span-1 md:mt-0 md:text-right">{n} →</span>
              </FilterLink>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

// 06.4 — Materijali
export function Materials() {
  return (
    <Section id="materijali" color={COLORS.who}>
      <SectionHead no="006.4" side="Materijali" title="Materijali" />
      <p data-reveal className="copy-l mt-[3vw] max-w-[24ch] max-md:mt-6">
        Pet grupa materijala, jedan stručan tim iza svake.
      </p>

      <div className="mt-[5vw] max-md:mt-10">
        {MATERIALS.map((m, i) => {
          const cat = CATEGORIES.find((c) => c.id === m.category)!
          return (
            <article key={m.id} className="grid grid-cols-12 gap-x-6 gap-y-6 border-t border-current py-[2.6vw] last:border-b max-md:py-8">
              <p data-reveal className="lbl col-span-12 md:col-span-1">
                0{i + 1}
              </p>
              <Plate tone={i + 1} className="col-span-6 aspect-[4/5] md:col-span-3" />
              <div className="col-span-12 md:col-span-5 md:col-start-5">
                <h3 data-reveal className="font-serif uppercase leading-[0.92] tracking-[-0.01em] [font-size:clamp(34px,4.8vw,84px)]">
                  {m.name}
                </h3>
                <p data-reveal className="copy-l mt-4 italic">
                  {m.line}
                </p>
                <p data-reveal className="copy mt-6 max-w-[44ch] text-ink">
                  {m.text}
                </p>
              </div>
              <div data-reveal className="col-span-12 flex flex-col justify-between gap-8 md:col-span-3 md:col-start-10">
                <ul className="lbl">
                  {m.props.map((p) => (
                    <li key={p} className="border-t border-current py-3 first:border-t-0 first:pt-0">
                      {p}
                    </li>
                  ))}
                </ul>
                <FilterLink patch={{ cat: m.category }} className="pill self-start">
                  Artikli · {cat.label} →
                </FilterLink>
              </div>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
